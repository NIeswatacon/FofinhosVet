package br.unifor.pagamento.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import br.unifor.pagamento.dto.AgendamentoResponseDTO;
import br.unifor.pagamento.dto.CarrinhoResponseDTO;
import br.unifor.pagamento.dto.ClienteDTO;
import br.unifor.pagamento.exception.PagamentoException;
import br.unifor.pagamento.model.FormaDePagamento;
import br.unifor.pagamento.model.Pagamento;
import br.unifor.pagamento.model.StatusPagamento;
import br.unifor.pagamento.repository.PagamentoRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagamentoService {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoService.class);
    private final PagamentoRepository pagamentoRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public PagamentoService(PagamentoRepository pagamentoRepository, RestTemplate restTemplate) {
        this.pagamentoRepository = pagamentoRepository;
        this.restTemplate = restTemplate;
    }

    /**
     * MÉTODO DE CHECKOUT ATUALIZADO
     * A assinatura agora só precisa do idCliente e idUsuario, buscando os outros dados.
     */
    public Pagamento processarCheckoutCliente(Long idCliente, Long idUsuario) {
        // 1. Busca os detalhes do cliente no conta-service para obter nome e CPF.
        logger.info("Buscando dados para o cliente ID: {}", idCliente);
        ClienteDTO cliente = restTemplate.getForObject("http://conta-service/api/contas/clientes/{idCliente}", ClienteDTO.class, idCliente);

        if (cliente == null || cliente.getCpf() == null) {
            throw new PagamentoException("Cliente com ID " + idCliente + " não encontrado ou inválido.");
        }
        logger.info("Cliente encontrado: {}", cliente.getNome());

        // 2. Busca débitos pendentes de outros serviços.
        BigDecimal totalVendas = buscarTotalVendas(idCliente);
        BigDecimal totalServicos = buscarTotalServicos(idCliente);

        // 3. Soma os totais e cria o registro de pagamento.
        BigDecimal valorTotal = totalVendas.add(totalServicos);
        logger.info("Valor total do checkout para o cliente {}: R$ {}", cliente.getNome(), valorTotal);

        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new PagamentoException("Nenhum valor pendente encontrado para o cliente.");
        }

        // Usa os dados do cliente que foram buscados para criar o pagamento.
        return this.criarPagamento(valorTotal, FormaDePagamento.PIX, System.currentTimeMillis(), cliente.getNome(), cliente.getCpf(), idUsuario);
    }

    private BigDecimal buscarTotalVendas(Long idCliente) {
        try {
            CarrinhoResponseDTO carrinhoResponse = restTemplate.getForObject("http://VENDAS-SERVICE/carrinho/{idCliente}", CarrinhoResponseDTO.class, idCliente);
            if (carrinhoResponse != null && carrinhoResponse.isSuccess() && carrinhoResponse.getData() != null && carrinhoResponse.getData().getTotal() != null) {
                logger.info("Total do carrinho encontrado: R$ {}", carrinhoResponse.getData().getTotal());
                return carrinhoResponse.getData().getTotal();
            }
        } catch (Exception e) {
            logger.warn("AVISO: Nao foi possivel buscar carrinho de compras do vendas-service: {}", e.getMessage());
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal buscarTotalServicos(Long idCliente) {
        try {
            AgendamentoResponseDTO[] agendamentos = restTemplate.getForObject("http://AGENDAMENTO/agendamentos/cliente/{idCliente}/pendentes", AgendamentoResponseDTO[].class, idCliente);
            if (agendamentos != null) {
                BigDecimal total = BigDecimal.ZERO;
                for (AgendamentoResponseDTO agendamento : agendamentos) {
                    if (agendamento.getValorServico() != null) {
                        total = total.add(agendamento.getValorServico());
                    }
                }
                logger.info("Total de serviços encontrado: R$ {}", total);
                return total;
            }
        } catch (Exception e) {
            logger.warn("AVISO: Nao foi possivel buscar agendamentos pendentes do servicos-service: {}", e.getMessage());
        }
        return BigDecimal.ZERO;
    }

    // --- SEUS MÉTODOS ORIGINAIS (Mantidos e Corrigidos) ---

    public Pagamento criarPagamento(BigDecimal valor, FormaDePagamento formaPagamento, Long idPedido, String nomeCliente, String cpfCliente, Long idUsuario) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) throw new PagamentoException("Valor deve ser maior que zero");
        if (idUsuario == null) throw new PagamentoException("ID do usuário é obrigatório");
        if (formaPagamento == null) throw new PagamentoException("Forma de pagamento é obrigatória");

        Pagamento pagamento = new Pagamento();
        pagamento.setValor(valor);
        pagamento.setFormaPagamento(formaPagamento);
        pagamento.setIdPedido(idPedido);
        pagamento.setNomeCliente(nomeCliente);
        pagamento.setCpfCliente(cpfCliente);
        pagamento.setIdUsuario(idUsuario);
        pagamento.setStatus(StatusPagamento.PENDENTE);
        
        // CORREÇÃO FINAL: Define a data e hora atuais para evitar o erro de coluna nula
        pagamento.setDataPagamento(LocalDateTime.now()); 

        return pagamentoRepository.save(pagamento);
    }

    public Pagamento buscarPorId(Long id) {
        return pagamentoRepository.findById(id)
            .orElseThrow(() -> new PagamentoException("Pagamento não encontrado com ID: " + id));
    }

    public List<Pagamento> listarTodos() {
        return pagamentoRepository.findAll();
    }

    public List<Pagamento> buscarPorStatus(StatusPagamento status) {
        return pagamentoRepository.findByStatus(status);
    }

    public List<Pagamento> buscarPorCpfCliente(String cpfCliente) {
        return pagamentoRepository.findByCpfCliente(cpfCliente);
    }

    public List<Pagamento> buscarPorIdPedido(Long idPedido) {
        return pagamentoRepository.findByIdPedido(idPedido);
    }

    public List<Pagamento> buscarPorIdUsuario(Long idUsuario) {
        return pagamentoRepository.findByIdUsuario(idUsuario);
    }

    public Pagamento aprovarPagamento(Long id) {
        Pagamento pagamento = buscarPorId(id);
        pagamento.aprovarPagamento();
        return pagamentoRepository.save(pagamento);
    }

    public Pagamento rejeitarPagamento(Long id) {
        Pagamento pagamento = buscarPorId(id);
        pagamento.rejeitarPagamento();
        return pagamentoRepository.save(pagamento);
    }

    public Pagamento cancelarPagamento(Long id) {
        Pagamento pagamento = buscarPorId(id);
        pagamento.cancelarPagamento();
        return pagamentoRepository.save(pagamento);
    }

    public void deletarPagamento(Long id) {
        Pagamento pagamento = buscarPorId(id);
        pagamentoRepository.delete(pagamento);
    }
}
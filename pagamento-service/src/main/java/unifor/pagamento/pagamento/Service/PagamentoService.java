package unifor.pagamento.pagamento.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import unifor.pagamento.pagamento.dto.AgendamentoResponseDTO;
import unifor.pagamento.pagamento.dto.CarrinhoResponseDTO;
import unifor.pagamento.pagamento.exception.PagamentoException;
import unifor.pagamento.pagamento.model.FormaDePagamento;
import unifor.pagamento.pagamento.model.Pagamento;
import unifor.pagamento.pagamento.model.StatusPagamento;
import unifor.pagamento.pagamento.repository.PagamentoRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PagamentoService {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoService.class);
    private final PagamentoRepository pagamentoRepository;
    private final WebClient.Builder webClientBuilder;

    @Autowired
    public PagamentoService(PagamentoRepository pagamentoRepository, WebClient.Builder webClientBuilder) {
        this.pagamentoRepository = pagamentoRepository;
        this.webClientBuilder = webClientBuilder;
    }

    /**
     * Novo método que orquestra o processo de checkout.
     * Ele busca os débitos pendentes de outros serviços e cria um pagamento único.
     */
    public Pagamento processarCheckoutCliente(Long idCliente, Long idUsuario, String nomeCliente, String cpfCliente) {
        BigDecimal totalVendas = BigDecimal.ZERO;
        BigDecimal totalServicos = BigDecimal.ZERO;

        // 1. Busca o total do carrinho de compras no 'vendas-service'
        try {
            logger.info("Buscando carrinho para o cliente ID: {}", idCliente);
            CarrinhoResponseDTO carrinhoResponse = webClientBuilder.build().get()
                .uri("http://VENDAS-SERVICE/carrinho/{idCliente}", idCliente)
                .retrieve()
                .bodyToMono(CarrinhoResponseDTO.class)
                .block(); // .block() torna a chamada síncrona, esperando a resposta.

            if (carrinhoResponse != null && carrinhoResponse.isSuccess() && carrinhoResponse.getData() != null && carrinhoResponse.getData().getTotal() != null) {
                totalVendas = carrinhoResponse.getData().getTotal();
                logger.info("Total do carrinho encontrado: {}", totalVendas);
            }
        } catch (Exception e) {
            logger.warn("AVISO: Nao foi possivel buscar carrinho de compras do vendas-service: {}", e.getMessage());
        }

        // 2. Busca o total de serviços pendentes no 'servicos-service'
        //    (Esta chamada funcionará assim que você criar o endpoint no outro serviço)
        try {
            logger.info("Buscando agendamentos pendentes para o cliente ID: {}", idCliente);
            AgendamentoResponseDTO[] agendamentos = webClientBuilder.build().get()
                .uri("http://AGENDAMENTO/agendamentos/cliente/{idCliente}/pendentes", idCliente)
                .retrieve()
                .bodyToMono(AgendamentoResponseDTO[].class)
                .onErrorResume(e -> Mono.empty()) // Continua se o serviço falhar ou não encontrar nada
                .block();

            if (agendamentos != null) {
                for (AgendamentoResponseDTO agendamento : agendamentos) {
                    if (agendamento.getValorServico() != null) {
                        totalServicos = totalServicos.add(agendamento.getValorServico());
                    }
                }
                logger.info("Total de serviços encontrado: {}", totalServicos);
            }
        } catch (Exception e) {
            logger.warn("AVISO: Nao foi possivel buscar agendamentos pendentes do servicos-service: {}", e.getMessage());
        }

        // 3. Soma os totais e cria o registro de pagamento
        BigDecimal valorTotal = totalVendas.add(totalServicos);
        logger.info("Valor total do checkout para o cliente ID {}: {}", idCliente, valorTotal);

        if (valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new PagamentoException("Nenhum valor pendente encontrado para o cliente com ID: " + idCliente);
        }

        // Reutiliza seu método de criação de pagamento original
        return this.criarPagamento(valorTotal, FormaDePagamento.PIX, System.currentTimeMillis(), nomeCliente, cpfCliente, idUsuario);
    }


    // --- MÉTODOS ORIGINAIS DO SEU SERVIÇO (MANTIDOS) ---

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
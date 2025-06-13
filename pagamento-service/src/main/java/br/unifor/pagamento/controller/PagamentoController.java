package br.unifor.pagamento.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.unifor.pagamento.Service.PagamentoService;
import br.unifor.pagamento.exception.PagamentoException;
import br.unifor.pagamento.model.Pagamento;
import br.unifor.pagamento.model.StatusPagamento;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import br.unifor.pagamento.model.FormaDePagamento;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // Permite CORS para o frontend
@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private static final Logger logger = LoggerFactory.getLogger(PagamentoController.class);

    @Autowired
    private PagamentoService pagamentoService;

    // --- NOVO ENDPOINT DE CHECKOUT ---
    
    // DTO para a requisição de checkout, recebendo apenas o ID do usuário logado
    public record CheckoutRequest(Long idUsuario) {}

    /**
     * Endpoint de Checkout que orquestra a busca de débitos e a criação do pagamento.
     * @param idCliente ID do cliente cujos débitos serão processados (vindo da URL).
     * @param request Contém o ID do usuário que está realizando a operação (vindo do corpo da requisição).
     * @return O objeto de Pagamento criado ou uma mensagem de erro.
     */
    @PostMapping("/checkout/{idCliente}")
    public ResponseEntity<?> checkout(@PathVariable Long idCliente, @RequestBody CheckoutRequest request) {
        try {
            // Apenas o idCliente e o idUsuario são passados para o serviço
            Pagamento pagamentoFinal = pagamentoService.processarCheckoutCliente(idCliente, request.idUsuario());
            return ResponseEntity.ok(pagamentoFinal);
        } catch (PagamentoException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // --- MÉTODOS EXISTENTES (Mantidos como estavam no seu código) ---

    @PostMapping
    public ResponseEntity<Pagamento> criarPagamento(@RequestBody Pagamento pagamento) {
        try {
            logger.info("Recebendo requisição para criar pagamento: {}", pagamento);
            
            // Converter o valor da forma de pagamento para o enum correto
            if (pagamento.getFormaPagamento() != null) {
                try {
                    FormaDePagamento formaPagamento = FormaDePagamento.valueOf(pagamento.getFormaPagamento().toString());
                    pagamento.setFormaPagamento(formaPagamento);
                } catch (IllegalArgumentException e) {
                    logger.error("Forma de pagamento inválida: {}", pagamento.getFormaPagamento());
                    throw new PagamentoException("Forma de pagamento inválida: " + pagamento.getFormaPagamento());
                }
            }

            Pagamento pagamentoCriado = pagamentoService.criarPagamento(
                pagamento.getValor(),
                pagamento.getFormaPagamento(),
                pagamento.getIdPedido(),
                pagamento.getNomeCliente(),
                pagamento.getCpfCliente(),
                pagamento.getIdUsuario()
            );
            
            logger.info("Pagamento criado com sucesso: {}", pagamentoCriado);
            return ResponseEntity.ok(pagamentoCriado);
        } catch (Exception e) {
            logger.error("Erro ao criar pagamento: {}", e.getMessage(), e);
            throw new PagamentoException("Erro ao criar pagamento: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> buscarPorId(@PathVariable Long id) {
        Pagamento pagamento = pagamentoService.buscarPorId(id);
        return ResponseEntity.ok(pagamento);
    }

    @GetMapping
    public ResponseEntity<List<Pagamento>> listarTodos() {
        List<Pagamento> pagamentos = pagamentoService.listarTodos();
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Pagamento>> buscarPorStatus(@PathVariable StatusPagamento status) {
        List<Pagamento> pagamentos = pagamentoService.buscarPorStatus(status);
        return ResponseEntity.ok(pagamentos);
    }

    @GetMapping("/cliente/{cpf}")
    public ResponseEntity<List<Pagamento>> buscarPorCpfCliente(@PathVariable String cpf) {
        List<Pagamento> pagamentos = pagamentoService.buscarPorCpfCliente(cpf);
        return ResponseEntity.ok(pagamentos);
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<Pagamento> aprovarPagamento(@PathVariable Long id) {
        Pagamento pagamento = pagamentoService.aprovarPagamento(id);
        return ResponseEntity.ok(pagamento);
    }

    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<Pagamento> rejeitarPagamento(@PathVariable Long id) {
        Pagamento pagamento = pagamentoService.rejeitarPagamento(id);
        return ResponseEntity.ok(pagamento);
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Pagamento> cancelarPagamento(@PathVariable Long id) {
        Pagamento pagamento = pagamentoService.cancelarPagamento(id);
        return ResponseEntity.ok(pagamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPagamento(@PathVariable Long id) {
        pagamentoService.deletarPagamento(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pedido/{idPedido}")
    public List<Pagamento> buscarPorIdPedido(@PathVariable Long idPedido) {
        return pagamentoService.buscarPorIdPedido(idPedido);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Pagamento>> buscarPorIdUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(pagamentoService.buscarPorIdUsuario(idUsuario));
    }
}
package br.unifor.pagamento.controller;

import br.unifor.pagamento.Service.CartaoService;
import br.unifor.pagamento.model.Cartao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cartoes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Permite CORS para o frontend
public class CartaoController {

    @Autowired
    private CartaoService cartaoService;

    // Listar todos os cartões
    @GetMapping
    public ResponseEntity<List<Cartao>> listarTodos() {
        return ResponseEntity.ok(cartaoService.listarTodos());
    }

    // Adicionar cartão (POST /api/cartoes/usuario/{usuarioId})
    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> adicionarCartao(@PathVariable Long usuarioId, @RequestBody Cartao cartao) {
        cartao.setIdUsuario(usuarioId);
        Cartao novoCartao = cartaoService.adicionarCartao(cartao);
        return ResponseEntity.ok(novoCartao);
    }

    // Buscar cartões por usuário (GET /api/cartoes/usuario/{usuarioId})
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Cartao>> buscarCartoesPorUsuario(@PathVariable Long usuarioId) {
        System.out.println("Recebida requisição para buscar cartões do usuário: " + usuarioId);
        List<Cartao> cartoes = cartaoService.buscarCartoesPorUsuario(usuarioId);
        System.out.println("Cartões encontrados: " + cartoes.size());
        return ResponseEntity.ok(cartoes);
    }

    // Deletar cartão (DELETE /api/cartoes/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCartao(@PathVariable Long id) {
        cartaoService.deletarCartao(id);
        return ResponseEntity.noContent().build();
    }

    // Buscar cartão por ID (GET /api/cartoes/{id})
    @GetMapping("/{id}")
    public ResponseEntity<Cartao> buscarCartaoPorId(@PathVariable Long id) {
        return cartaoService.buscarCartaoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 
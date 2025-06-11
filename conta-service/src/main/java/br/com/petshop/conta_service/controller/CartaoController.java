package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Cartao;
import br.com.petshop.conta_service.service.CartaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // Permite CORS para o frontend
@RestController
@RequestMapping("/api/cartoes")
public class CartaoController {

    private final CartaoService cartaoService;

    @Autowired
    public CartaoController(CartaoService cartaoService) {
        this.cartaoService = cartaoService;
    }

    @PostMapping
    public ResponseEntity<Cartao> criarCartao(@RequestBody Cartao cartao) {
        Cartao novoCartao = cartaoService.criarCartao(cartao);
        return new ResponseEntity<>(novoCartao, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Cartao>> listarCartoesPorUsuario(@RequestHeader("X-User-ID") Long idUsuario) {
        List<Cartao> cartoes = cartaoService.listarCartoesPorUsuario(idUsuario);
        return ResponseEntity.ok(cartoes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cartao> buscarCartaoPorId(@PathVariable Long id) {
        return cartaoService.buscarCartaoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cartao> atualizarCartao(@PathVariable Long id, @RequestBody Cartao cartao) {
        try {
            Cartao cartaoAtualizado = cartaoService.atualizarCartao(id, cartao);
            return ResponseEntity.ok(cartaoAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCartao(@PathVariable Long id) {
        try {
            cartaoService.deletarCartao(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 
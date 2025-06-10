package unifor.pagamento.pagamento.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unifor.pagamento.pagamento.dto.CartaoDTO;
import unifor.pagamento.pagamento.model.Cartao;
import unifor.pagamento.pagamento.repository.CartaoRepository;
import unifor.pagamento.pagamento.Service.UsuarioService;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/cartoes")
public class CartaoController {

    @Autowired
    private CartaoRepository cartaoRepository;

    @Autowired
    private UsuarioService usuarioService;

    // --- MÉTODOS DE CONVERSÃO ---
    private CartaoDTO toDTO(Cartao cartao) {
        CartaoDTO dto = new CartaoDTO();
        dto.setId(cartao.getId());
        dto.setNumeroCartao("**** **** **** " + cartao.getNumeroCartao().substring(12)); // Mascarando o número
        dto.setNomeTitular(cartao.getNomeTitular());
        dto.setDataValidade(cartao.getDataValidade());
        dto.setTipoCartao(cartao.getTipoCartao());
        dto.setCpfTitular(cartao.getCpfTitular());
        dto.setIdUsuario(cartao.getIdUsuario());
        // CVV nunca é retornado
        return dto;
    }

    private Cartao toEntity(CartaoDTO dto) {
        Cartao cartao = new Cartao();
        cartao.setId(dto.getId()); // O ID será nulo na criação
        cartao.setNumeroCartao(dto.getNumeroCartao());
        cartao.setNomeTitular(dto.getNomeTitular());
        cartao.setDataValidade(dto.getDataValidade());
        cartao.setCvv(dto.getCvv());
        cartao.setTipoCartao(dto.getTipoCartao());
        cartao.setCpfTitular(dto.getCpfTitular());
        cartao.setIdUsuario(dto.getIdUsuario());
        return cartao;
    }

    // --- ENDPOINTS ---

    @PostMapping
    public ResponseEntity<CartaoDTO> criarCartao(@Valid @RequestBody CartaoDTO cartaoDTO) {
        // Verifica se o usuário existe e obtém o CPF
        var usuario = usuarioService.buscarUsuarioPorId(cartaoDTO.getIdUsuario());
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Garante que não está tentando criar um cartão com um ID existente
        cartaoDTO.setId(null);
        Cartao cartao = toEntity(cartaoDTO);
        Cartao novoCartao = cartaoRepository.save(cartao);
        return new ResponseEntity<>(toDTO(novoCartao), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CartaoDTO>> listarCartoesPorUsuarioLogado(
            @RequestHeader(value = "X-User-ID", required = false) Long idUsuarioX,
            @RequestHeader(value = "x-user-id", required = false) Long idUsuariox) {
        
        Long idUsuario = idUsuarioX != null ? idUsuarioX : idUsuariox;
        
        // Se não houver ID do usuário, retorna lista vazia ao invés de erro
        if (idUsuario == null) {
            return ResponseEntity.ok(List.of());
        }

        List<CartaoDTO> cartoes = cartaoRepository.findByIdUsuario(idUsuario)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(cartoes);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<CartaoDTO>> buscarPorIdUsuario(@PathVariable Long idUsuario) {
        List<CartaoDTO> cartoes = cartaoRepository.findByIdUsuario(idUsuario)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cartoes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCartao(@PathVariable Long id) {
        if (!cartaoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cartaoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
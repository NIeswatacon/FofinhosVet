package br.unifor.pagamento.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import br.unifor.pagamento.model.Usuario;
import br.unifor.pagamento.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario buscarOuCriarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseGet(() -> {
                    Usuario novoUsuario = new Usuario();
                    novoUsuario.setId(id);
                    // Definir outros campos padrão se necessário
                    return usuarioRepository.save(novoUsuario);
                });
    }

    public Usuario salvarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }
} 
package unifor.pagamento.pagamento.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import unifor.pagamento.pagamento.dto.UsuarioDTO;

@Service
public class UsuarioService {

    private final RestTemplate restTemplate;
    private final String usuarioServiceUrl;

    @Autowired
    public UsuarioService(RestTemplate restTemplate, @Value("${usuario.service.url}") String usuarioServiceUrl) {
        this.restTemplate = restTemplate;
        this.usuarioServiceUrl = usuarioServiceUrl;
    }

    public UsuarioDTO buscarUsuarioPorId(Long id) {
        return restTemplate.getForObject(usuarioServiceUrl + "/{id}", UsuarioDTO.class, id);
    }
} 
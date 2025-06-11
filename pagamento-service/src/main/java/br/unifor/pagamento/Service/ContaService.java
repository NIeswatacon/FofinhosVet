package br.unifor.pagamento.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import br.unifor.pagamento.dto.ContaDTO;

@Service
public class ContaService {

    private final RestTemplate restTemplate;
    private final String contaServiceUrl;

    @Autowired
    public ContaService(RestTemplate restTemplate, @Value("${conta.service.url}") String contaServiceUrl) {
        this.restTemplate = restTemplate;
        this.contaServiceUrl = contaServiceUrl;
    }

    public ContaDTO buscarContaPorId(Long id) {
        return restTemplate.getForObject(contaServiceUrl + "/{id}", ContaDTO.class, id);
    }

    public void atualizarSaldo(Long id, Double novoSaldo) {
        restTemplate.put(contaServiceUrl + "/{id}/saldo", novoSaldo, id);
    }
} 
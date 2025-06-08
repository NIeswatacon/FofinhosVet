package br.unifor.fazeragendamento.service;

import br.unifor.fazeragendamento.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.dto.ClienteDTO;
import br.unifor.fazeragendamento.dto.PetDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.model.ServicoEnum;
import br.unifor.fazeragendamento.repository.AgendamentoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final WebClient webClient;

    @Autowired
    public AgendamentoService(AgendamentoRepository agendamentoRepository, WebClient.Builder webClientBuilder) {
        this.agendamentoRepository = agendamentoRepository;
        // A URL agora usa o nome do serviço registrado no Eureka
        this.webClient = webClientBuilder.baseUrl("http://CONTA/api/contas").build();
    }

    public Agendamento criarAgendamento(AgendamentoRequestDTO dto) {
        // Validações de entrada
        if (dto.getIdCliente() == null || dto.getIdPet() == null) {
            throw new IllegalArgumentException("IDs do cliente e do pet são obrigatórios.");
        }

        // 1. Validar Cliente e Pet usando o WebClient para chamar o conta-service
        // A chamada block() torna a operação síncrona. O serviço espera a resposta.
        ClienteDTO cliente = validarCliente(dto.getIdCliente());
        PetDTO pet = validarPetDoCliente(dto.getIdCliente(), dto.getIdPet());

        // 3. Montar a entidade Agendamento com dados validados
        Agendamento agendamento = new Agendamento();
        agendamento.setData(dto.getData());
        agendamento.setServico(dto.getServico());
        agendamento.setNomePet(pet.getNome()); // Nome validado
        agendamento.setNomeCliente(cliente.getNome()); // Nome validado

        // Define o valor do serviço com base no enum escolhido
        if (dto.getServico() != null) {
            agendamento.setValorServico(BigDecimal.valueOf(dto.getServico().getValor()));
        }

        // Lógica para nome do funcionário
        if (dto.getServico() == ServicoEnum.CONSULTA) {
            agendamento.setNomeFuncionario("Veterinário: " + dto.getNomeFuncionario());
        } else {
            agendamento.setNomeFuncionario("Auxiliar: " + dto.getNomeFuncionario());
        }

        return agendamentoRepository.save(agendamento);
    }

    private ClienteDTO validarCliente(Long clienteId) {
        try {
            return webClient.get()
                    .uri("/clientes/{id}", clienteId)
                    .retrieve()
                    .bodyToMono(ClienteDTO.class)
                    .block(); // Espera a resposta
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Cliente não encontrado no microserviço de contas com ID: " + clienteId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao se comunicar com o microserviço de contas.", e);
        }
    }

    private PetDTO validarPetDoCliente(Long clienteId, Long petId) {
        try {
            return webClient.get()
                    .uri("/clientes/{clienteId}/pets/{petId}", clienteId, petId)
                    .retrieve()
                    .bodyToMono(PetDTO.class)
                    .block(); // Espera a resposta
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Pet não encontrado para o cliente informado com ID: " + petId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao se comunicar com o microserviço de contas para validar o pet.", e);
        }
    }

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    public Agendamento pegarDetalhes(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }
}
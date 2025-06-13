package br.unifor.fazeragendamento.service;

import br.unifor.fazeragendamento.dto.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.dto.ClienteDTO;
import br.unifor.fazeragendamento.dto.PetDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.repository.AgendamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AgendamentoService {

    private static final Logger logger = LoggerFactory.getLogger(AgendamentoService.class);
    private final AgendamentoRepository agendamentoRepository;
    private final WebClient webClientContas;

    @Autowired
    public AgendamentoService(AgendamentoRepository agendamentoRepository, WebClient.Builder webClientBuilder) {
        this.agendamentoRepository = agendamentoRepository;
        // CORRIGIDO: A URL base agora aponta para /api
        this.webClientContas = webClientBuilder.baseUrl("http://localhost:8084/api").build();
    }

    public Agendamento criarAgendamento(Long userId, AgendamentoRequestDTO dto) {
        ClienteDTO cliente = validarCliente(userId).block();
        PetDTO pet = validarPetDoCliente(userId, dto.getIdPet()).block();

        if (cliente == null) {
            throw new RuntimeException("Falha ao validar o cliente com ID: " + userId);
        }
        if (pet == null) {
            throw new RuntimeException(
                    "Falha ao validar o pet com ID: " + dto.getIdPet() + " para o cliente " + userId);
        }

        Agendamento agendamento = new Agendamento();
        agendamento.setClienteId(userId);
        agendamento.setNomeCliente(cliente.getNome());
        agendamento.setData(dto.getData());
        agendamento.setServico(dto.getServico());
        agendamento.setNomePet(pet.getNome());
        agendamento.setValorServico(BigDecimal.valueOf(dto.getServico().getValor()));
        agendamento.setNomeFuncionario(dto.getNomeFuncionario());

        return agendamentoRepository.save(agendamento);
    }

    private Mono<ClienteDTO> validarCliente(Long clienteId) {
        logger.info("Validando cliente com ID: {}", clienteId);
        // CORRIGIDO: Chamando a URI correta do ClienteController
        return webClientContas.get()
                .uri("/contas/{id}", clienteId)
                .retrieve()
                .bodyToMono(ClienteDTO.class)
                .onErrorMap(WebClientResponseException.NotFound.class,
                        e -> new RuntimeException("Cliente não encontrado com ID: " + clienteId, e))
                .onErrorMap(e -> !(e instanceof RuntimeException),
                        e -> new RuntimeException("Erro ao comunicar com conta-service para validar cliente.", e));
    }

    private Mono<PetDTO> validarPetDoCliente(Long clienteId, Long petId) {
        logger.info("Validando pet com ID {} para o cliente ID {}", petId, clienteId);
        // CORRIGIDO: Usando o endpoint de listar pets e filtrando o resultado
        return webClientContas.get()
                .uri("/contas/clientes/{clienteId}/pets", clienteId)
                .retrieve()
                .bodyToFlux(PetDTO.class)
                .filter(pet -> pet.getId().equals(petId))
                .single()
                .onErrorMap(e -> {
                    logger.error("Erro ao validar o pet {} para o cliente {}", petId, clienteId, e);
                    return new RuntimeException("Pet com ID " + petId + " não pertence ao cliente " + clienteId);
                });
    }

    // --- Métodos restantes não precisam de alteração ---

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    public Agendamento pegarDetalhes(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }

    public List<Agendamento> listarAgendamentosPendentesPorCliente(Long clienteId) {
        return agendamentoRepository.findByClienteIdAndStatusPagamento(clienteId, Agendamento.StatusPagamento.PENDENTE);
    }

    public List<Agendamento> listarAgendamentosPorCliente(Long clienteId) {
        return agendamentoRepository.findByClienteId(clienteId);
    }

    public Agendamento atualizarStatus(Long id, Agendamento.StatusPagamento novoStatus) {
        Agendamento agendamento = pegarDetalhes(id);
        agendamento.setStatusPagamento(novoStatus);
        return agendamentoRepository.save(agendamento);
    }
}
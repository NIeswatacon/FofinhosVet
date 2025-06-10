package br.unifor.fazeragendamento.service;

import br.unifor.fazeragendamento.AgendamentoRequestDTO; 
import br.unifor.fazeragendamento.dto.PetDTO;
import br.unifor.fazeragendamento.dto.ClienteDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.repository.AgendamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
        this.webClientContas = webClientBuilder.baseUrl("http://conta-service/api/contas").build();
    }

    public Agendamento criarAgendamento(Long userId, AgendamentoRequestDTO dto) { 
        // 1. Validar Cliente e Pet
        ClienteDTO cliente = validarCliente(userId);
        PetDTO pet = validarPetDoCliente(userId, dto.getIdPet());

        // 2. Montar e salvar a entidade Agendamento
        Agendamento agendamento = new Agendamento();
        
        agendamento.setClienteId(userId);
        agendamento.setNomeCliente(cliente.getNome());
        
        agendamento.setData(dto.getData());
        agendamento.setServico(dto.getServico());
        agendamento.setNomePet(pet.getNome());
        agendamento.setValorServico(BigDecimal.valueOf(dto.getServico().getValor()));
        agendamento.setNomeFuncionario("Auxiliar: " + dto.getNomeFuncionario());

        return agendamentoRepository.save(agendamento);
    }

    private ClienteDTO validarCliente(Long clienteId) {
        try {
            logger.info("Validando cliente com ID: {}", clienteId);
            return webClientContas.get()
                    .uri("/clientes/{id}", clienteId)
                    .retrieve()
                    .bodyToMono(ClienteDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Cliente não encontrado no microserviço de contas com ID: " + clienteId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao se comunicar com o microserviço de contas.", e);
        }
    }

    private PetDTO validarPetDoCliente(Long clienteId, Long petId) {
        try {
            logger.info("Validando pet com ID {} para o cliente ID {}", petId, clienteId);
            return webClientContas.get()
                    .uri("/clientes/{clienteId}/pets/{petId}", clienteId, petId)
                    .retrieve()
                    .bodyToMono(PetDTO.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Pet não encontrado para o cliente informado com ID: " + petId);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao validar o pet.", e);
        }
    }

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();
    }

    public Agendamento pegarDetalhes(Long id) {
        return agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }

    public List<Agendamento> listarAgendamentosPendentesPorCliente(Long clienteId) {
        logger.info("Buscando agendamentos pendentes para o cliente ID: {}", clienteId);
        return agendamentoRepository.findByClienteIdAndStatusPagamento(clienteId, Agendamento.StatusPagamento.PENDENTE);
    }

    public List<Agendamento> listarAgendamentosPorCliente(Long clienteId) {
    logger.info("Buscando todos os agendamentos para o cliente ID: {}", clienteId);
    return agendamentoRepository.findByClienteId(clienteId);
}
}
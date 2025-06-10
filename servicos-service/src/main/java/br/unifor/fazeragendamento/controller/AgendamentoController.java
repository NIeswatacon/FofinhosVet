package br.unifor.fazeragendamento.controller;

import br.unifor.fazeragendamento.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.AgendamentoResponseDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.service.AgendamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService service;

    // --- MÉTODO DE CONVERSÃO ---
    private AgendamentoResponseDTO toResponseDTO(Agendamento agendamento) {
        AgendamentoResponseDTO dto = new AgendamentoResponseDTO();
        dto.setId(agendamento.getId());
        dto.setValorServico(agendamento.getValorServico());
        return dto;
    }

    @PostMapping
    public ResponseEntity<?> agendar(@RequestHeader("X-User-ID") String userId, @RequestBody AgendamentoRequestDTO dto) { 
        try {
            return new ResponseEntity<>(service.criarAgendamento(Long.parseLong(userId), dto), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Retorna a mensagem de erro no corpo da resposta para facilitar a depuração
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Agendamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> pegarDetalhes(@PathVariable Long id) {
        return ResponseEntity.ok(service.pegarDetalhes(id));
    }

    @GetMapping("/cliente/{clienteId}/pendentes")
    public ResponseEntity<List<AgendamentoResponseDTO>> listarPendentes(@PathVariable Long clienteId) {
        List<Agendamento> agendamentos = service.listarAgendamentosPendentesPorCliente(clienteId);
        
        List<AgendamentoResponseDTO> agendamentosDTO = agendamentos.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(agendamentosDTO);
    }
}
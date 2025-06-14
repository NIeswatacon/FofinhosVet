package br.unifor.fazeragendamento.controller;

import br.unifor.fazeragendamento.dto.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.dto.AgendamentoResponseDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.model.ServicoEnum;
import br.unifor.fazeragendamento.service.AgendamentoService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173") // Permite CORS para o frontend
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
        dto.setNomePet(agendamento.getNomePet());
        dto.setNomeCliente(agendamento.getNomeCliente());
        dto.setServico(agendamento.getServico() != null ? agendamento.getServico().name() : null);
        dto.setData(agendamento.getData());
        dto.setStatusPagamento(
                agendamento.getStatusPagamento() != null ? agendamento.getStatusPagamento().name() : null);
        dto.setNomeFuncionario(agendamento.getNomeFuncionario());
        return dto;
    }

    @PostMapping
    public ResponseEntity<?> agendar(@RequestHeader("X-User-ID") String userId,
            @RequestBody AgendamentoRequestDTO dto) {
        try {
            return new ResponseEntity<>(service.criarAgendamento(Long.parseLong(userId), dto), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Retorna a mensagem de erro no corpo da resposta para facilitar a depuração
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<AgendamentoResponseDTO> listar() {
        try {
            List<Agendamento> ags = service.listarTodos();
            for (Agendamento ag : ags) {
                System.out.println("Convertendo agendamento ID: " + ag.getId());
            }
            return ags.stream()
                    .map(ag -> {
                        try {
                            return toResponseDTO(ag);
                        } catch (Exception e) {
                            System.err
                                    .println("Erro ao converter agendamento ID: " + ag.getId() + ": " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .toList();
        } catch (Exception e) {
            System.err.println("Erro geral ao listar agendamentos: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Agendamento>> listarPorCliente(@PathVariable Long clienteId) {
        List<Agendamento> agendamentos = service.listarAgendamentosPorCliente(clienteId);
        return ResponseEntity.ok(agendamentos);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Agendamento> atualizarStatus(@PathVariable Long id,
            @RequestBody Agendamento.StatusPagamento novoStatus) {
        Agendamento agendamento = service.atualizarStatus(id, novoStatus);
        return ResponseEntity.ok(agendamento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarPorId(@PathVariable Long id) {
        try {
            service.deletarPorId(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agendamento> atualizarAgendamento(@PathVariable Long id,
            @RequestBody Agendamento agendamentoAtualizado) {
        Agendamento atualizado = service.atualizarAgendamento(id, agendamentoAtualizado);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/todos")
    public ResponseEntity<Void> deletarTodos() {
        service.deletarTodos();
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/servico")
    public ResponseEntity<?> corrigirServico(
            @PathVariable Long id,
            @RequestParam ServicoEnum novoServico) {
        try {
            service.corrigirServico(id, novoServico);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @Data
    @AllArgsConstructor
    private static class ErrorResponse {
        private String message;
    }
}
package br.unifor.fazeragendamento.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.unifor.fazeragendamento.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.service.AgendamentoService;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    @Autowired
    private AgendamentoService service;

    @PostMapping
    public ResponseEntity<Agendamento> agendar(@RequestBody AgendamentoRequestDTO dto) {
        return new ResponseEntity<>(service.criarAgendamento(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Agendamento> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
     public ResponseEntity<Agendamento> pegarDetalhes(@PathVariable Long id) {
        return ResponseEntity.ok(service.pegarDetalhes(id));
     }
}

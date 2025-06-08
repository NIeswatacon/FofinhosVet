package br.unifor.fazeragendamento.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.unifor.fazeragendamento.AgendamentoRequestDTO;
import br.unifor.fazeragendamento.model.Agendamento;
import br.unifor.fazeragendamento.model.ServicoEnum;
import br.unifor.fazeragendamento.repository.AgendamentoRepository;

@Service
public class AgendamentoService {

    @Autowired
    private AgendamentoRepository repository;

    public Agendamento criarAgendamento(AgendamentoRequestDTO dto) {
        Agendamento agendamento = new Agendamento();
        agendamento.setData(dto.getData());
        agendamento.setServico(dto.getServico());
        agendamento.setNomePet(dto.getNomePet());
        agendamento.setNomeCliente(dto.getNomeCliente());

                // Define o valor do serviço com base no enum escolhido
        if (dto.getServico() != null) {
            agendamento.setValorServico(BigDecimal.valueOf(dto.getServico().getValor()));
        }

        if (dto.getServico() == ServicoEnum.CONSULTA) {
            agendamento.setNomeFuncionario("Veterinário: " + dto.getNomeFuncionario());
        } else {
            agendamento.setNomeFuncionario("Auxiliar: " + dto.getNomeFuncionario());
        }

        return repository.save(agendamento);
    }

    public List<Agendamento> listarTodos() {
        return repository.findAll();
    }
    public Agendamento pegarDetalhes(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }
}

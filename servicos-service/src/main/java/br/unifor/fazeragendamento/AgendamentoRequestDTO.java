package br.unifor.fazeragendamento;

import java.time.LocalDate;
import br.unifor.fazeragendamento.model.ServicoEnum;
import br.unifor.fazeragendamento.model.ServicoEnum;
import java.time.LocalDate;
import lombok.Data;

@Data
public class AgendamentoRequestDTO{
    
   // IDs para validação
    private Long idCliente;
    private Long idPet;
    private Long idFuncionario; // Mantendo para futura validação de funcionário

    // Informações do agendamento
    private LocalDate data;
    private ServicoEnum servico;

    // O nome do funcionário pode ser mantido se a lógica de qual funcionário
    // atende qual serviço for simples.
    private String nomeFuncionario;

    // Os nomes de cliente e pet serão obtidos via API, então não são mais necessários aqui.
    // private String nomePet;
    // private String nomeCliente;
}

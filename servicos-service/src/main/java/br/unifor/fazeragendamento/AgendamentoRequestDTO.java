package br.unifor.fazeragendamento;

import br.unifor.fazeragendamento.model.ServicoEnum;
import java.time.LocalDate;

// Esta classe representa os dados que o frontend envia para criar um agendamento.
public class AgendamentoRequestDTO {

    // IDs para validação nos outros serviços
    private Long idCliente;
    private Long idPet;
    private Long idFuncionario;

    // Informações específicas do agendamento
    private LocalDate data;
    private ServicoEnum servico;
    private String nomeFuncionario;

    // Getters e Setters

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdPet() {
        return idPet;
    }

    public void setIdPet(Long idPet) {
        this.idPet = idPet;
    }

    public Long getIdFuncionario() {
        return idFuncionario;
    }

    public void setIdFuncionario(Long idFuncionario) {
        this.idFuncionario = idFuncionario;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public ServicoEnum getServico() {
        return servico;
    }

    public void setServico(ServicoEnum servico) {
        this.servico = servico;
    }

    public String getNomeFuncionario() {
        return nomeFuncionario;
    }

    public void setNomeFuncionario(String nomeFuncionario) {
        this.nomeFuncionario = nomeFuncionario;
    }
}
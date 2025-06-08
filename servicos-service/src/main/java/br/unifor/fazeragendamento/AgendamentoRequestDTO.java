package br.unifor.fazeragendamento;

import java.time.LocalDate;

import br.unifor.fazeragendamento.model.ServicoEnum;

public class AgendamentoRequestDTO {
    
    private LocalDate data;
    private ServicoEnum servico;
    private String nomeFuncionario;
    private String nomePet;
    private String nomeCliente;

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

    public String getNomePet() { 
        return nomePet; 
    }
    public void setNomePet(String nomePet) { 
        this.nomePet = nomePet; 
    }

    public String getNomeCliente() { 
        return nomeCliente; 
    }
    public void setNomeCliente(String nomeCliente) { 
        this.nomeCliente = nomeCliente; 
    }
}

package br.unifor.fazeragendamento.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AgendamentoResponseDTO {
    private Long id;
    private BigDecimal valorServico;
}
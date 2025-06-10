package br.com.petshop.conta_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PetDTO {
    private Long id;
    private String nome;
    private String especie;
    private String raca;
    private LocalDate dataNascimento;
    private Long clienteId;
}
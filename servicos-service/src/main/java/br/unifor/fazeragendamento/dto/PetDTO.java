package br.unifor.fazeragendamento.dto;

import lombok.Data;
import java.time.LocalDate;

// DTO para receber a resposta da consulta de pet do conta-service
@Data
public class PetDTO {
    private Long id;
    private String nome;
    private String especie;
    private String raca;
    private LocalDate dataNascimento;
}
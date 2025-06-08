package br.unifor.fazeragendamento.dto;


import lombok.Data;

// DTO para receber a resposta da consulta de cliente do conta-service
@Data
public class ClienteDTO {
    private Long id;
    private String nome;
    private String email;
    private String cpf;
    // Adicione outros campos se precisar deles no futuro
}
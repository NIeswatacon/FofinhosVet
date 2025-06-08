package br.com.petshop.conta_service.model;

public enum Cargo {
    VETERINARIO("Veterinário(a)"),
    TOSADOR("Auxiliar de Tosa"),
    AUXILIAR_DE_BANHO("Auxiliar de banho");

    private final String descricao;

    Cargo(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

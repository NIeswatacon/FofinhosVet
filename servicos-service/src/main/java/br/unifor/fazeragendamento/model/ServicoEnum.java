package br.unifor.fazeragendamento.model;

public enum ServicoEnum {
    BANHO(50.00),
    TOSA(40.00),
    CONSULTA(80.00);

    private final double valor;

    ServicoEnum(double valor) {
        this.valor = valor;
    }

    public double getValor() {
        return valor;
    }
}
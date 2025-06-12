package br.unifor.pagamento.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recibos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataCompra;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private Long clienteId; // ID do cliente associado ao recibo

    @ElementCollection // Para armazenar uma lista de IDs de agendamentos
    @CollectionTable(name = "recibo_agendamentos", joinColumns = @JoinColumn(name = "recibo_id"))
    @Column(name = "agendamento_id")
    private List<Long> agendamentoIds;

    @ElementCollection // Para armazenar uma lista de IDs de itens do carrinho
    @CollectionTable(name = "recibo_carrinho_itens", joinColumns = @JoinColumn(name = "recibo_id"))
    @Column(name = "carrinho_item_id")
    private List<Long> carrinhoItemIds;

    // Construtor para facilitar a criação de um recibo
    public Recibo(LocalDateTime dataCompra, BigDecimal valorTotal, Long clienteId, List<Long> agendamentoIds, List<Long> carrinhoItemIds) {
        this.dataCompra = dataCompra;
        this.valorTotal = valorTotal;
        this.clienteId = clienteId;
        this.agendamentoIds = agendamentoIds;
        this.carrinhoItemIds = carrinhoItemIds;
    }
} 
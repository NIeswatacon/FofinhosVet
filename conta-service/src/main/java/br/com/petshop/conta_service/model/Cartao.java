package br.com.petshop.conta_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "cartoes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cartao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 16)
    private String numeroCartao;

    @Column(nullable = false)
    private String nomeTitular;

    @Column(nullable = false, length = 4) // MMYY
    private String dataValidade;

    @Column(nullable = false, length = 4) // CVV pode ser 3 ou 4 dígitos
    private String cvv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCartao tipoCartao;

    @Column(nullable = false, length = 11)
    private String cpfTitular;

    @Column(nullable = false)
    private Long idUsuario; // ID do usuário associado ao cartão

    public enum TipoCartao {
        CREDITO,
        DEBITO
    }
} 
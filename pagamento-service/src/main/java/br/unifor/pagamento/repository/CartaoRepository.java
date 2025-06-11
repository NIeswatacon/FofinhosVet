package br.unifor.pagamento.repository;

import br.unifor.pagamento.model.Cartao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartaoRepository extends JpaRepository<Cartao, Long> {
    // Adicione métodos de busca personalizados aqui, se necessário
    List<Cartao> findByIdUsuario(Long idUsuario);
} 
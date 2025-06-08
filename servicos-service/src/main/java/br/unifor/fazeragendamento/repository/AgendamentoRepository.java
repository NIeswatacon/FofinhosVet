package br.unifor.fazeragendamento.repository;

import br.unifor.fazeragendamento.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    List<Agendamento> findByClienteIdAndStatusPagamento(Long clienteId, Agendamento.StatusPagamento status);
}
package br.com.petshop.conta_service.repository;

import br.com.petshop.conta_service.model.Cartao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartaoRepository extends JpaRepository<Cartao, Long> {
    List<Cartao> findByIdUsuario(Long idUsuario);
} 
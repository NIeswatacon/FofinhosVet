package br.com.petshop.conta_service.repository;

import br.com.petshop.conta_service.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    Optional<Funcionario> findByEmail(String email);
    Optional<Funcionario> findByCpf(String cpf);
    boolean existsByMatricula(String matricula);
}
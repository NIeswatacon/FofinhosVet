package br.com.petshop.conta_service.repository;

import br.com.petshop.conta_service.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByClienteId(Long clienteId);
}
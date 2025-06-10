package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PetService {

    private final PetRepository petRepository;

    @Autowired
    public PetService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    public Pet criarPet(Long clienteId, Pet pet) {
    Cliente cliente = new Cliente();
    cliente.setId(clienteId); // define o cliente a partir do ID
    pet.setCliente(cliente);  // associa o cliente ao pet
    return petRepository.save(pet);
}


    public List<Pet> listarPetsPorCliente(Long clienteId) {
        return petRepository.findByClienteId(clienteId);
    }

    public Optional<Pet> buscarPetDoClientePorId(Long clienteId, Long petId) {
        return petRepository.findByIdAndClienteId(petId, clienteId);
    }

    public Pet atualizarPetDoCliente(Long clienteId, Long petId, Pet petAtualizado) {
        Pet petExistente = petRepository.findByIdAndClienteId(petId, clienteId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado ou não pertence ao cliente"));

        petExistente.setNome(petAtualizado.getNome());
        petExistente.setEspecie(petAtualizado.getEspecie());
        petExistente.setRaca(petAtualizado.getRaca());
        petExistente.setDataNascimento(petAtualizado.getDataNascimento());

        return petRepository.save(petExistente);
    }

    public void deletarPetDoCliente(Long clienteId, Long petId) {
        Pet pet = petRepository.findByIdAndClienteId(petId, clienteId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado ou não pertence ao cliente"));
        petRepository.delete(pet);
    }

    // Acesso interno (não autenticado diretamente)
    public Optional<Pet> buscarPetPorId(Long petId) {
        return petRepository.findById(petId);
    }

    public Pet atualizarPet(Long petId, Pet pet) {
        Pet existente = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado"));
        existente.setNome(pet.getNome());
        existente.setEspecie(pet.getEspecie());
        existente.setRaca(pet.getRaca());
        existente.setDataNascimento(pet.getDataNascimento());
        return petRepository.save(existente);
    }

    public void deletarPet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado"));
        petRepository.delete(pet);
    }
}

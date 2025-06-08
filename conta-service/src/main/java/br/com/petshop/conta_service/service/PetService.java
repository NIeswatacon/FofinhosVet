package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.repository.ClienteRepository;
import br.com.petshop.conta_service.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final ClienteRepository clienteRepository;

    @Autowired
    public PetService(PetRepository petRepository, ClienteRepository clienteRepository) {
        this.petRepository = petRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public Pet criarPet(Long clienteId, Pet pet) {
        Cliente tutor = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente tutor não encontrado com id: " + clienteId));
        
        pet.setCliente(tutor);
        
        return petRepository.save(pet);
    }

    @Transactional(readOnly = true)
    public Optional<Pet> buscarPetPorId(Long petId) {
        return petRepository.findById(petId);
    }

    @Transactional(readOnly = true)
    public List<Pet> listarPetsPorCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new RuntimeException("Cliente não encontrado com id: " + clienteId);
        }
        return petRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
public Optional<Pet> buscarPetDoClientePorId(Long clienteId, Long petId) {
    return petRepository.findById(petId)
            .filter(pet -> pet.getCliente().getId().equals(clienteId));
}

    @Transactional
    public Pet atualizarPet(Long petId, Pet petAtualizado) {
        return petRepository.findById(petId)
                .map(petExistente -> {
                    petExistente.setNome(petAtualizado.getNome());
                    petExistente.setEspecie(petAtualizado.getEspecie());
                    petExistente.setRaca(petAtualizado.getRaca());
                    petExistente.setDataNascimento(petAtualizado.getDataNascimento());
                    petExistente.setObservacoes(petAtualizado.getObservacoes());
                    return petRepository.save(petExistente);
                }).orElseThrow(() -> new RuntimeException("Pet não encontrado com id: " + petId));
    }

    @Transactional
    public void deletarPet(Long petId) {
        if (!petRepository.existsById(petId)) {
            throw new RuntimeException("Pet não encontrado com id: " + petId);
        }
        petRepository.deleteById(petId);
    }
}
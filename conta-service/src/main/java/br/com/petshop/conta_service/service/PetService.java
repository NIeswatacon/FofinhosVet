package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.dto.PetDTO;
import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.repository.ClienteRepository;
import br.com.petshop.conta_service.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PetService {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public PetDTO criarPet(Long clienteId, PetDTO petDTO) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Pet pet = new Pet();
        pet.setNome(petDTO.getNome());
        pet.setEspecie(petDTO.getEspecie());
        pet.setRaca(petDTO.getRaca());
        pet.setDataNascimento(petDTO.getDataNascimento());
        pet.setCliente(cliente);

        Pet petSalvo = petRepository.save(pet);
        return toDTO(petSalvo);
    }

    public List<PetDTO> listarPetsPorCliente(Long clienteId) {
        return petRepository.findByClienteId(clienteId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PetDTO toDTO(Pet pet) {
        PetDTO dto = new PetDTO();
        dto.setId(pet.getId());
        dto.setNome(pet.getNome());
        dto.setEspecie(pet.getEspecie());
        dto.setRaca(pet.getRaca());
        dto.setDataNascimento(pet.getDataNascimento());
        dto.setClienteId(pet.getCliente().getId());
        return dto;
    }

    public Optional<Pet> buscarPetDoClientePorId(Long clienteId, Long petId) {
        return petRepository.findByIdAndCliente_Id(petId, clienteId);
    }

    public Pet atualizarPetDoCliente(Long clienteId, Long petId, Pet petAtualizado) {
        Pet petExistente = petRepository.findByIdAndCliente_Id(petId, clienteId)
                .orElseThrow(() -> new RuntimeException("Pet não encontrado ou não pertence ao cliente"));

        petExistente.setNome(petAtualizado.getNome());
        petExistente.setEspecie(petAtualizado.getEspecie());
        petExistente.setRaca(petAtualizado.getRaca());
        petExistente.setDataNascimento(petAtualizado.getDataNascimento());

        return petRepository.save(petExistente);
    }

    public void deletarPetDoCliente(Long clienteId, Long petId) {
        Pet pet = petRepository.findByIdAndCliente_Id(petId, clienteId)
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

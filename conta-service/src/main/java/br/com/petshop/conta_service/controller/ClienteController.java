package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.dto.ClienteDTO;
import br.com.petshop.conta_service.dto.PetDTO;
import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.service.ClienteService;
import br.com.petshop.conta_service.service.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contas/clientes")
public class ClienteController {

    private final ClienteService clienteService;
    private final PetService petService;

    @Autowired
    public ClienteController(ClienteService clienteService, PetService petService) {
        this.clienteService = clienteService;
        this.petService = petService;
    }

    private ClienteDTO clienteToDTO(Cliente cliente) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(cliente.getId());
        dto.setNome(cliente.getNome());
        dto.setEmail(cliente.getEmail());
        dto.setCpf(cliente.getCpf());
        dto.setTelefone(cliente.getTelefone());
        dto.setEndereco(cliente.getEndereco());
        return dto;
    }

    private Cliente clienteToEntity(ClienteDTO dto) {
        Cliente cliente = new Cliente();
        if (dto.getId() != null) {
            cliente.setId(dto.getId());
        }
        cliente.setNome(dto.getNome());
        cliente.setEmail(dto.getEmail());
        cliente.setCpf(dto.getCpf());
        cliente.setTelefone(dto.getTelefone());
        cliente.setEndereco(dto.getEndereco());
        cliente.setSenha(dto.getSenha());
        return cliente;
    }

    private PetDTO petToDTO(Pet pet) {
        PetDTO dto = new PetDTO();
        dto.setId(pet.getId());
        dto.setNome(pet.getNome());
        dto.setEspecie(pet.getEspecie());
        dto.setRaca(pet.getRaca());
        dto.setDataNascimento(pet.getDataNascimento());
        return dto;
    }

    private Pet petToEntity(PetDTO dto) {
        Pet pet = new Pet();
        pet.setNome(dto.getNome());
        pet.setEspecie(dto.getEspecie());
        pet.setRaca(dto.getRaca());
        pet.setDataNascimento(dto.getDataNascimento());
        return pet;
    }

    @PostMapping
    public ResponseEntity<ClienteDTO> criarCliente(@Valid @RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = clienteToEntity(clienteDTO);
            Cliente novoCliente = clienteService.criarCliente(cliente);
            return new ResponseEntity<>(clienteToDTO(novoCliente), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    
    @GetMapping
    public ResponseEntity<List<ClienteDTO>> listarTodosClientes() {
        List<ClienteDTO> clientes = clienteService.listarTodosClientes().stream()
                .map(this::clienteToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientes);
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<ClienteDTO> buscarClientePorId(@PathVariable Long clienteId) {
        return clienteService.buscarClientePorId(clienteId)
                .map(this::clienteToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<ClienteDTO> atualizarCliente(@RequestHeader("X-User-ID") String userId,
                                                       @Valid @RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = clienteToEntity(clienteDTO);
            Cliente clienteAtualizado = clienteService.atualizarCliente(Long.parseLong(userId), cliente);
            return ResponseEntity.ok(clienteToDTO(clienteAtualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> atualizarClientePorId(@PathVariable Long id,
                                                            @Valid @RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = clienteToEntity(clienteDTO);
            Cliente clienteAtualizado = clienteService.atualizarCliente(id, cliente);
            return ResponseEntity.ok(clienteToDTO(clienteAtualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deletarCliente(@RequestHeader("X-User-ID") String userId) {
        try {
            clienteService.deletarCliente(Long.parseLong(userId));
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarClientePorId(@PathVariable Long id) {
        try {
            clienteService.deletarCliente(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/me/pets")
    public ResponseEntity<PetDTO> criarPetParaCliente(@RequestHeader("X-User-ID") String userId,
                                                      @RequestBody PetDTO petDTO) {
        try {
            PetDTO novoPet = petService.criarPet(Long.parseLong(userId), petDTO);
            return new ResponseEntity<>(novoPet, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{id}/pets")
    public ResponseEntity<List<PetDTO>> listarPetsDoCliente(@PathVariable Long id) {
        return clienteService.buscarClientePorId(id)
                .map(cliente -> {
                    List<PetDTO> pets = petService.listarPetsPorCliente(id);
                    return ResponseEntity.ok(pets);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me/pets/{petId}")
    public ResponseEntity<PetDTO> buscarPetDoCliente(@RequestHeader("X-User-ID") String userId,
                                                     @PathVariable Long petId) {
        return petService.buscarPetDoClientePorId(Long.parseLong(userId), petId)
                .map(this::petToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/teste")
    public ResponseEntity<ClienteDTO> criarUsuarioTeste() {
        try {
            Cliente cliente = clienteService.criarUsuarioTeste();
            return new ResponseEntity<>(clienteToDTO(cliente), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

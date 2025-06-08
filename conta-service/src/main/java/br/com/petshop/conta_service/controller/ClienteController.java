package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.service.ClienteService;
import br.com.petshop.conta_service.service.PetService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    public ResponseEntity<Cliente> criarCliente(@RequestBody Cliente cliente) {
        Cliente novoCliente = clienteService.criarCliente(cliente);
        return new ResponseEntity<>(novoCliente, HttpStatus.CREATED);
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<Cliente> buscarClientePorId(@PathVariable Long clienteId) {
        return clienteService.buscarClientePorId(clienteId)
                .map(cliente -> new ResponseEntity<>(cliente, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodosClientes() {
        List<Cliente> clientes = clienteService.listarTodosClientes();
        return new ResponseEntity<>(clientes, HttpStatus.OK);
    }

    @PutMapping("/{clienteId}")
    public ResponseEntity<Cliente> atualizarCliente(@PathVariable Long clienteId, @RequestBody Cliente cliente) {
        try {
            Cliente clienteAtualizado = clienteService.atualizarCliente(clienteId, cliente);
            return new ResponseEntity<>(clienteAtualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{clienteId}")
    public ResponseEntity<Void> deletarCliente(@PathVariable Long clienteId) {
        try {
            clienteService.deletarCliente(clienteId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @PostMapping("/{clienteId}/pets")
    public ResponseEntity<Pet> criarPetParaCliente(@PathVariable Long clienteId, @RequestBody Pet pet) {
        try {
            Pet novoPet = petService.criarPet(clienteId, pet);
            return new ResponseEntity<>(novoPet, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{clienteId}/pets")
    public ResponseEntity<List<Pet>> listarPetsDoCliente(@PathVariable Long clienteId) {
        try {
            List<Pet> pets = petService.listarPetsPorCliente(clienteId);
            return new ResponseEntity<>(pets, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{clienteId}/pets/{petId}")
public ResponseEntity<Pet> buscarPetDoCliente(@PathVariable Long clienteId, @PathVariable Long petId) {
    return petService.buscarPetDoClientePorId(clienteId, petId)
            .map(pet -> ResponseEntity.ok(pet)) 
            .orElse(ResponseEntity.notFound().build());
}

@PutMapping("/{clienteId}/pets/{petId}")
public ResponseEntity<Pet> atualizarPetDoCliente(@PathVariable Long clienteId, @PathVariable Long petId, @RequestBody Pet pet) {
    return ResponseEntity.ok().build();
}

@DeleteMapping("/{clienteId}/pets/{petId}")
public ResponseEntity<Void> deletarPetDoCliente(@PathVariable Long clienteId, @PathVariable Long petId) {
    petService.buscarPetDoClientePorId(clienteId, petId).ifPresent(pet -> {
        petService.deletarPet(pet.getId());
    });
    return ResponseEntity.noContent().build();
}

}
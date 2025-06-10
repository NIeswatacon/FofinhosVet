package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.dto.PetDTO;
import br.com.petshop.conta_service.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas/clientes/{clienteId}/pets")
@CrossOrigin(origins = "http://localhost:5173")
public class PetController {

    @Autowired
    private PetService petService;

    @PostMapping
    public ResponseEntity<PetDTO> criarPet(@PathVariable Long clienteId, @RequestBody PetDTO petDTO) {
        PetDTO petCriado = petService.criarPet(clienteId, petDTO);
        return ResponseEntity.ok(petCriado);
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> listarPetsPorCliente(@PathVariable Long clienteId) {
        List<PetDTO> pets = petService.listarPetsPorCliente(clienteId);
        return ResponseEntity.ok(pets);
    }
}

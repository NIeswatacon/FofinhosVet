package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Pet;
import br.com.petshop.conta_service.service.PetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contas/pets")
public class PetController {

    private final PetService petService;

    @Autowired
    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping("/{petId}")
    public ResponseEntity<Pet> buscarPetPorId(@PathVariable Long petId) {
        return petService.buscarPetPorId(petId)
                .map(pet -> new ResponseEntity<>(pet, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{petId}")
    public ResponseEntity<Pet> atualizarPet(@PathVariable Long petId, @RequestBody Pet pet) {
        try {
            Pet petAtualizado = petService.atualizarPet(petId, pet);
            return new ResponseEntity<>(petAtualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletarPet(@PathVariable Long petId) {
        try {
            petService.deletarPet(petId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
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

    @GetMapping("/me/{petId}")
    public ResponseEntity<Pet> buscarPetDoCliente(@RequestHeader("X-User-ID") String userId,
                                                  @PathVariable Long petId) {
        return petService.buscarPetDoClientePorId(Long.parseLong(userId), petId)
                .map(pet -> new ResponseEntity<>(pet, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/me/{petId}")
    public ResponseEntity<Pet> atualizarPetDoCliente(@RequestHeader("X-User-ID") String userId,
                                                     @PathVariable Long petId,
                                                     @RequestBody Pet pet) {
        try {
            Pet atualizado = petService.atualizarPetDoCliente(Long.parseLong(userId), petId, pet);
            return new ResponseEntity<>(atualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/me/{petId}")
    public ResponseEntity<Void> deletarPetDoCliente(@RequestHeader("X-User-ID") String userId,
                                                    @PathVariable Long petId) {
        try {
            petService.deletarPetDoCliente(Long.parseLong(userId), petId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

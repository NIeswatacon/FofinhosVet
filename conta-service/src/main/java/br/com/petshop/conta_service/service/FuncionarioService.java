package br.com.petshop.conta_service.service;

import java.time.Year;
import java.util.Random;

import br.com.petshop.conta_service.model.Funcionario;
import br.com.petshop.conta_service.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;
    private final Random random = new Random();

    @Autowired
    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    @Transactional
    public Funcionario criarFuncionario(Funcionario funcionario) {
        if (funcionarioRepository.findByEmail(funcionario.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado.");
        }
        if (funcionario.getCpf() != null && funcionarioRepository.findByCpf(funcionario.getCpf()).isPresent()) {
            throw new RuntimeException("CPF já cadastrado.");
        }
        funcionario.setMatricula(null); 
        
        String matriculaGerada;
        do {
            String ano = String.valueOf(Year.now().getValue());
            int numeroAleatorio = 1000 + random.nextInt(9000);
            matriculaGerada = ano + "-" + numeroAleatorio;
        } while (funcionarioRepository.existsByMatricula(matriculaGerada));
        funcionario.setMatricula(matriculaGerada);
        return funcionarioRepository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listarTodosFuncionarios() {
        return funcionarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Funcionario> buscarFuncionarioPorId(Long id) {
        return funcionarioRepository.findById(id);
    }

    @Transactional
    public Funcionario atualizarFuncionario(Long id, Funcionario funcionarioAtualizado) {
        return funcionarioRepository.findById(id)
                .map(funcionarioExistente -> {
                    funcionarioExistente.setNome(funcionarioAtualizado.getNome());
                    funcionarioExistente.setEmail(funcionarioAtualizado.getEmail());
                    funcionarioExistente.setCargo(funcionarioAtualizado.getCargo());
                    funcionarioExistente.setTelefone(funcionarioAtualizado.getTelefone());
                    return funcionarioRepository.save(funcionarioExistente);
                }).orElseThrow(() -> new RuntimeException("Funcionário não encontrado com id: " + id));
    }

    @Transactional
    public void deletarFuncionario(Long id) {
        if (!funcionarioRepository.existsById(id)) {
            throw new RuntimeException("Funcionário não encontrado com id: " + id);
        }
        funcionarioRepository.deleteById(id);
    }
}

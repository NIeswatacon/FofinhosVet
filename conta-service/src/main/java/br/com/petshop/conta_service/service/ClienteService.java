package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; 

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- MÉTODO ADICIONADO PARA O LOGIN ---
    @Transactional(readOnly = true)
    public Cliente buscarPorEmail(String email) {
        return clienteRepository.findByEmail(email)
                .orElse(null);
    }

    // --- MÉTODOS EXISTENTES ---
    
    @Transactional 
    public Cliente criarCliente(Cliente cliente) {
        System.out.println("=== INÍCIO DO PROCESSO DE CRIAÇÃO DE CLIENTE ===");
        System.out.println("Dados recebidos:");
        System.out.println("- Nome: " + cliente.getNome());
        System.out.println("- Email: " + cliente.getEmail());
        System.out.println("- CPF: " + cliente.getCpf());
        System.out.println("- Senha (antes da criptografia): " + cliente.getSenha());

        if (clienteRepository.findByEmail(cliente.getEmail()).isPresent()) {
            System.out.println("Email já cadastrado: " + cliente.getEmail());
            throw new RuntimeException("Email já cadastrado.");
        }
        if (cliente.getCpf() != null && clienteRepository.findByCpf(cliente.getCpf()).isPresent()) {
            System.out.println("CPF já cadastrado: " + cliente.getCpf());
            throw new RuntimeException("CPF já cadastrado.");
        }

        String senhaCriptografada = passwordEncoder.encode(cliente.getSenha());
        System.out.println("Senha criptografada: " + senhaCriptografada);
        cliente.setSenha(senhaCriptografada);

        Cliente clienteSalvo = clienteRepository.save(cliente);
        System.out.println("Cliente salvo com sucesso:");
        System.out.println("- ID: " + clienteSalvo.getId());
        System.out.println("- Nome: " + clienteSalvo.getNome());
        System.out.println("- Email: " + clienteSalvo.getEmail());
        System.out.println("=== FIM DO PROCESSO DE CRIAÇÃO DE CLIENTE ===");

        return clienteSalvo;
    }

    @Transactional(readOnly = true)
    public Optional<Cliente> buscarClientePorId(Long id) {
        return clienteRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodosClientes() {
        return clienteRepository.findAll();
    }

    @Transactional
    public Cliente atualizarCliente(Long id, Cliente clienteAtualizado) {
        return clienteRepository.findById(id)
                .map(clienteExistente -> {
                    clienteExistente.setNome(clienteAtualizado.getNome());
                    clienteExistente.setEmail(clienteAtualizado.getEmail());
                    clienteExistente.setTelefone(clienteAtualizado.getTelefone());
                    clienteExistente.setEndereco(clienteAtualizado.getEndereco());
                    return clienteRepository.save(clienteExistente);
                }).orElseThrow(() -> new RuntimeException("Cliente não encontrado com id: " + id));
    }

    @Transactional
    public void deletarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não encontrado com id: " + id);
        }
        clienteRepository.deleteById(id);
    }

    @Transactional
    public Cliente criarUsuarioTeste() {
        // Verifica se o usuário já existe
        if (clienteRepository.findByEmail("teste@teste.com").isPresent()) {
            throw new RuntimeException("Usuário de teste já existe");
        }

        Cliente cliente = new Cliente();
        cliente.setNome("Usuário Teste");
        cliente.setEmail("teste@teste.com");
        cliente.setCpf("12345678900");
        cliente.setTelefone("11999999999");
        cliente.setEndereco("Rua Teste, 123");
        cliente.setSenha(passwordEncoder.encode("123456"));

        return clienteRepository.save(cliente);
    }
}
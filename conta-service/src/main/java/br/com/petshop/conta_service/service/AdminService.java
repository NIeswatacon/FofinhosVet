package br.com.petshop.conta_service.service;

import br.com.petshop.conta_service.model.Admin;
import br.com.petshop.conta_service.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Admin criarAdmin(Admin admin) {
        admin.setSenha(passwordEncoder.encode(admin.getSenha()));
        return adminRepository.save(admin);
    }

    public Optional<Admin> buscarPorEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public List<Admin> listarTodos() {
        return adminRepository.findAll();
    }

    public Optional<Admin> buscarPorId(Long id) {
        return adminRepository.findById(id);
    }

    public void deletarPorId(Long id) {
        adminRepository.deleteById(id);
    }

    public boolean autenticar(String email, String senha) {
        Optional<Admin> adminOpt = buscarPorEmail(email);
        return adminOpt.isPresent() && passwordEncoder.matches(senha, adminOpt.get().getSenha());
    }
}
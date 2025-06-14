package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.dto.AdminDTO;
import br.com.petshop.conta_service.model.Admin;
import br.com.petshop.conta_service.service.AdminService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contas/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final long JWT_EXPIRATION = 86400000; // 24h

    @PostMapping("/cadastro")
    public ResponseEntity<AdminDTO> cadastrar(@RequestBody AdminDTO adminDTO) {
        Admin admin = new Admin();
        admin.setNome(adminDTO.getNome());
        admin.setEmail(adminDTO.getEmail());
        admin.setSenha(adminDTO.getSenha());
        Admin novoAdmin = adminService.criarAdmin(admin);
        adminDTO.setId(novoAdmin.getId());
        adminDTO.setSenha(null);
        return new ResponseEntity<>(adminDTO, HttpStatus.CREATED);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody AdminDTO loginDTO) {
        Optional<Admin> adminOpt = adminService.buscarPorEmail(loginDTO.getEmail());
        if (adminOpt.isPresent() && adminService.autenticar(loginDTO.getEmail(), loginDTO.getSenha())) {
            Admin admin = adminOpt.get();
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            String token = Jwts.builder()
                    .setSubject(Long.toString(admin.getId()))
                    .claim("email", admin.getEmail())
                    .claim("nome", admin.getNome())
                    .claim("tipo", "ADMIN")
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();
            return ResponseEntity.ok().body(new LoginResponse(token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha inválidos");
    }

    @GetMapping
    public List<Admin> listarTodos() {
        return adminService.listarTodos();
    }

    // Classe interna para resposta de login
    static class LoginResponse {
        public String token;

        public LoginResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }
    }
}
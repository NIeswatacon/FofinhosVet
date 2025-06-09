package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.service.ClienteService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

record LoginRequest(String email, String senha) {}
record LoginResponse(String token) {}

@RestController
@RequestMapping("/api/contas/auth")
public class AuthController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // A chave secreta para assinar o token. Coloque isso no seu application.properties
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    // Tempo de expiração do token (ex: 24 horas)
    private final long JWT_EXPIRATION = 86400000;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            Cliente cliente = clienteService.buscarPorEmail(request.email());

            if (passwordEncoder.matches(request.senha(), cliente.getSenha())) {
                String token = Jwts.builder()
                    .setSubject(Long.toString(cliente.getId())) // Colocamos o ID do cliente aqui
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                    .signWith(SignatureAlgorithm.HS512, jwtSecret)
                    .compact();
                
                return ResponseEntity.ok(new LoginResponse(token));
            }
        } catch (Exception e) {
            // Não encontrou o usuário ou a senha não bate.
        }
        
        // Se a autenticação falhar
        return ResponseEntity.status(401).build();
    }
}
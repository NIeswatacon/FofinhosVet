package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.service.ClienteService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
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

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final long JWT_EXPIRATION = 86400000; // 24h

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            Cliente cliente = clienteService.buscarPorEmail(request.email());

            if (passwordEncoder.matches(request.senha(), cliente.getSenha())) {
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

                String token = Jwts.builder()
                    .setSubject(Long.toString(cliente.getId()))
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();

                return ResponseEntity.ok(new LoginResponse(token));
            }
        } catch (Exception e) {
            // log.warn("Erro na autenticação: " + e.getMessage());
        }

        return ResponseEntity.status(401).build();
    }
}

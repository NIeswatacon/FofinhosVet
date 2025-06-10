package br.com.petshop.conta_service.controller;

import br.com.petshop.conta_service.model.Cliente;
import br.com.petshop.conta_service.service.ClienteService;
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
            System.out.println("\n=== INÍCIO DO PROCESSO DE LOGIN ===");
            System.out.println("Email recebido: " + request.email());
            System.out.println("Senha recebida: " + request.senha());

            if (request.email() == null || request.email().trim().isEmpty()) {
                System.out.println("Email não fornecido");
                return ResponseEntity.badRequest().build();
            }

            if (request.senha() == null || request.senha().trim().isEmpty()) {
                System.out.println("Senha não fornecida");
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Buscando cliente por email...");
            Cliente cliente = clienteService.buscarPorEmail(request.email());
            System.out.println("Resultado da busca por email: " + (cliente != null ? "Cliente encontrado" : "Cliente não encontrado"));

            if (cliente != null) {
                System.out.println("\nDados do cliente encontrado:");
                System.out.println("- ID: " + cliente.getId());
                System.out.println("- Nome: " + cliente.getNome());
                System.out.println("- Email: " + cliente.getEmail());
                System.out.println("- Senha no banco (criptografada): " + cliente.getSenha());

                System.out.println("\nVerificando senha...");
                boolean senhaCorreta = passwordEncoder.matches(request.senha(), cliente.getSenha());
                System.out.println("Senha corresponde: " + senhaCorreta);

                if (senhaCorreta) {
                    System.out.println("\nGerando token JWT...");
                    try {
                        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                        System.out.println("Chave JWT gerada com sucesso");

                        String token = Jwts.builder()
                            .setSubject(Long.toString(cliente.getId()))
                            .claim("email", cliente.getEmail())
                            .claim("nome", cliente.getNome())
                            .claim("tipo", "CLIENTE")
                            .setIssuedAt(new Date())
                            .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                            .signWith(key, SignatureAlgorithm.HS512)
                            .compact();

                        System.out.println("Token gerado com sucesso");
                        System.out.println("=== FIM DO PROCESSO DE LOGIN (SUCESSO) ===\n");
                        return ResponseEntity.ok(new LoginResponse(token));
                    } catch (Exception e) {
                        System.out.println("\nErro ao gerar token JWT:");
                        System.out.println("Tipo do erro: " + e.getClass().getName());
                        System.out.println("Mensagem: " + e.getMessage());
                        e.printStackTrace();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                    }
                } else {
                    System.out.println("Senha incorreta");
                }
            } else {
                System.out.println("Cliente não encontrado para o email: " + request.email());
            }
        } catch (Exception e) {
            System.out.println("\n=== ERRO NO PROCESSO DE LOGIN ===");
            System.out.println("Tipo do erro: " + e.getClass().getName());
            System.out.println("Mensagem do erro: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            System.out.println("=== FIM DO ERRO ===\n");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        System.out.println("=== FIM DO PROCESSO DE LOGIN (FALHA) ===\n");
        return ResponseEntity.status(401).body(null);
    }
}

package br.unifor.fazeragendamento.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Autoriza TODAS as requisições para qualquer endpoint.
            // Isso remove completamente a camada de autorização para o teste.
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            
            // Desabilita a proteção CSRF, que é a causa provável do erro 403 em requisições POST.
            .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
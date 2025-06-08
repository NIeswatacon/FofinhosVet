package br.unifor.fazeragendamento.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        UserDetails admin = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("shiri0n17442")) // Senha será codificada
            .roles("ADMIN")
            .build();

        UserDetails user = User.builder()
            .username("user")
            .password(passwordEncoder.encode("unicornios123")) // Senha será codificada
            .roles("USER")
            .build();

        return new InMemoryUserDetailsManager(admin, user);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorizeRequests ->
                authorizeRequests
                    // Exemplo: Permitir GET em /agendamentos para todos, mas POST requer ADMIN
                    // .requestMatchers(HttpMethod.GET, "/agendamentos/**").permitAll()
                    // .requestMatchers(HttpMethod.POST, "/agendamentos").hasRole("ADMIN")
                    .anyRequest().authenticated() // Todas as outras requisições exigem autenticação
            )
            .httpBasic(withDefaults()) // Habilita autenticação HTTP Basic
            .csrf(csrf -> csrf.disable()); // Desabilitar CSRF se API stateless (comum para REST com tokens)
                                          // Se for uma aplicação web tradicional com formulários, mantenha CSRF habilitado.
        return http.build();
    }
}

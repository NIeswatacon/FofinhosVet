package com.gateway.gateway;

import java.util.Arrays;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Configuration
    public class CorsConfig {
        @Bean
        public CorsWebFilter corsWebFilter() {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowCredentials(true);
            config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "https://vet-fofinho-ronaldo.vercel.app"
            ));
            config.setAllowedHeaders(Arrays.asList(
                "Authorization", 
                "Content-Type", 
                "Accept", 
                "X-User-ID",
                "x-user-id"
            ));
            config.setExposedHeaders(Arrays.asList("Authorization"));
            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setMaxAge(3600L);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", config);

            return new CorsWebFilter(source);
        }

        @Bean
        public WebFilter corsFilter() {
            return (ServerWebExchange exchange, WebFilterChain chain) -> {
                var response = exchange.getResponse();
                var headers = response.getHeaders();
                
                // Se o header já existe, não adiciona novamente
                if (!headers.containsKey("Access-Control-Allow-Origin")) {
                    headers.add("Access-Control-Allow-Origin", "http://localhost:5173");
                }
                
                return chain.filter(exchange);
            };
        }
    }
}

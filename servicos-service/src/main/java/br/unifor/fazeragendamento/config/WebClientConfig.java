package br.unifor.fazeragendamento.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced; // Importante para o Service Discovery
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @LoadBalanced // <-- ESSA ANOTAÇÃO É MÁGICA!
    // Ela integra o WebClient com o Eureka, permitindo que você use o nome
    // do serviço (ex: "CONTA-SERVICE") em vez de um IP:PORTA fixo.
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
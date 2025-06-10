package br.unifor.fazeragendamento.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean

    // Ela integra o WebClient com o Eureka, permitindo que você use o nome
    // do serviço (ex: "CONTA-SERVICE") em vez de um IP:PORTA fixo.
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
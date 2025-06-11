package br.com.petshop.conta_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("br.com.petshop.conta_service.model")
@EnableJpaRepositories("br.com.petshop.conta_service.repository")
public class ContaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContaServiceApplication.class, args);
    }

}
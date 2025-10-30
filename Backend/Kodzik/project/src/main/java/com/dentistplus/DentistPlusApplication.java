package com.dentistplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class DentistPlusApplication {
    public static void main(String[] args) {
        SpringApplication.run(DentistPlusApplication.class, args);
    }
}
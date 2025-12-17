package com.tickx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TickXApplication {

    public static void main(String[] args) {
        SpringApplication.run(TickXApplication.class, args);
    }
}

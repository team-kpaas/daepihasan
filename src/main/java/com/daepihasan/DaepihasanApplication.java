package com.daepihasan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 스케줄러
public class DaepihasanApplication {

    public static void main(String[] args) {
        SpringApplication.run(DaepihasanApplication.class, args);
    }

}

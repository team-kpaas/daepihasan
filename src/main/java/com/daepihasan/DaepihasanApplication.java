package com.daepihasan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;

@SpringBootApplication
@EnableScheduling // 스케줄러
@EnableRedisHttpSession
public class DaepihasanApplication {

    public static void main(String[] args) {
        SpringApplication.run(DaepihasanApplication.class, args);
    }

}

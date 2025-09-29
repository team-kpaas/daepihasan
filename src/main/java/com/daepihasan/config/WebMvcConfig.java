package com.daepihasan.config;

import com.daepihasan.interceptor.AuthInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Bean
    public AuthInterceptor authInterceptor() {
        return new AuthInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor())
                .addPathPatterns("/user/withdraw", "/user/withdraw/**", "/user/myPage")
                .excludePathPatterns(
                        "/user/login",
                        "/user/loginProc",
                        "/user/join",
                        "/user/joinProc",
                        "/error",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico"
                );
    }
}

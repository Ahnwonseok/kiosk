package com.kiosk.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                    "http://localhost:3000",
                    "http://182.229.16.44:3000",
                    "http://192.168.123.101:3000",
                    "http://127.0.0.1:3030",
                    "http://1.235.32.57:3030",
                    "http://1.235.32.57:3039",
                    "http://1.235.32.57:3000"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")  // 모든 헤더 허용 (Authorization 포함)
            .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ../image 디렉토리를 /images/** 로 서빙
        String imagePath = Paths.get("").toAbsolutePath().getParent().resolve("image").toUri().toString();
        registry.addResourceHandler("/images/**")
                .addResourceLocations(imagePath);
    }
}

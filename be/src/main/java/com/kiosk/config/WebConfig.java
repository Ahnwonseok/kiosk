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
            // allowedOrigins 대신 allowedOriginPatterns 사용
            // 포트 3030에서 오는 모든 요청 허용 (어떤 IP/도메인이든)
            .allowedOriginPatterns(
                    "http://*:3030",      // HTTP 프로토콜, 포트 3030 (개발 환경)
                    "https://*:3030"      // HTTPS 프로토콜, 포트 3030 (프로덕션 환경)
            )
            // 또는 모든 Origin 허용 (보안 주의):
            // .allowedOriginPatterns("*")
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

package com.example.demo;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
		SpringApplication.run(DemoApplication.class, args);
	}
	
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Buenos_Aires"));
		System.out.println("✅ Zona horaria configurada: " + TimeZone.getDefault().getID());
	}

	@Configuration
	public static class Myconfiguration{
		@Bean
		public WebMvcConfigurer corsConfigurer(){
			return new WebMvcConfigurer() {
				@Override
				public void addCorsMappings(CorsRegistry registry) {
					registry.addMapping("/**")
							.allowedOrigins("http://localhost:4200", "http://localhost:8080") // <-- tu frontend
							.allowedMethods("HEAD", "GET", "PUT", "POST", "DELETE", "PATCH")
							.allowedHeaders("*")
							.allowCredentials(true);
				}
			};
		}
	}
	

}

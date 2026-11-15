package com.korainc.conformia_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConformiaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConformiaApiApplication.class, args);
	}

}

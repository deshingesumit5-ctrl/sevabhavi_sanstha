package com.SevabhaviSanstha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SevabhaviSansthaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SevabhaviSansthaApplication.class, args);
	}

}


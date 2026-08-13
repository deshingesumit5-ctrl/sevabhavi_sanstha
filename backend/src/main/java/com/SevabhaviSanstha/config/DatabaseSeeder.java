package com.SevabhaviSanstha.config;

import com.SevabhaviSanstha.entity.Admin;
import com.SevabhaviSanstha.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String defaultEmail = "admin@gmail.com";
        Optional<Admin> adminOpt = adminRepository.findByEmail(defaultEmail);
        
        if (adminOpt.isEmpty()) {
            Admin defaultAdmin = Admin.builder()
                    .email(defaultEmail)
                    .password(passwordEncoder.encode("123456"))
                    .role("ADMIN")
                    .build();
            adminRepository.save(defaultAdmin);
            System.out.println("Default admin user (" + defaultEmail + ") has been seeded successfully.");
        } else {
            // Ensure password is not empty or invalid, or if they want to ensure it works
            System.out.println("Admin user (" + defaultEmail + ") already exists.");
        }
    }
}

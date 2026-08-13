package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.config.JwtTokenUtil;
import com.SevabhaviSanstha.entity.Admin;
import com.SevabhaviSanstha.repository.AdminRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenUtil jwtTokenUtil,
                          UserDetailsService userDetailsService,
                          AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "कृपया ईमेल आणि पासवर्ड भरा."));
        }

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email.trim(), password.trim()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "युझरनेम किंवा पासवर्ड चुकीचा आहे. तुम्हाला येथे प्रवेश करण्याची परवानगी नाही."));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email.trim());
        final String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", email,
                "role", "प्रशासक",
                "name", email.split("@")[0]
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || email.trim().isEmpty() || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "कृपया सर्व रकाने भरा."));
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(email.trim());
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "या ईमेल आयडीसह कोणताही प्रशासक आढळला नाही."));
        }

        Admin admin = adminOpt.get();
        admin.setPassword(passwordEncoder.encode(newPassword.trim()));
        adminRepository.save(admin);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "पासवर्ड यशस्वीरित्या बदलला आहे! नवीन पासवर्डसह लॉगिन करा."
        ));
    }
}

package com.SevabhaviSanstha.config;

import com.SevabhaviSanstha.entity.Admin;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.repository.AdminRepository;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final MarriageRegistrationRepository marriageRegistrationRepository;

    public CustomUserDetailsService(AdminRepository adminRepository,
                                    MarriageRegistrationRepository marriageRegistrationRepository) {
        this.adminRepository = adminRepository;
        this.marriageRegistrationRepository = marriageRegistrationRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. Check Admin repository
        Optional<Admin> adminOpt = adminRepository.findByEmail(identifier);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            String role = admin.getRole() != null ? admin.getRole() : "ADMIN";
            return new User(
                    admin.getEmail(),
                    admin.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
            );
        }

        // 2. Check MarriageRegistration repository
        Optional<MarriageRegistration> marriageOpt = marriageRegistrationRepository.findByMobileOrEmail(identifier);
        if (marriageOpt.isPresent()) {
            MarriageRegistration reg = marriageOpt.get();
            String pwd = reg.getPasswordHash() != null ? reg.getPasswordHash() : "";
            // Use identifier or mobile as principal username
            return new User(
                    identifier,
                    pwd,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_MATRIMONY_USER"))
            );
        }

        throw new UsernameNotFoundException("वापरकर्ता आढळला नाही: " + identifier);
    }
}


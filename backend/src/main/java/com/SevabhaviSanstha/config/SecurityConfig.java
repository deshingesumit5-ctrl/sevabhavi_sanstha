package com.SevabhaviSanstha.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint, JwtRequestFilter jwtRequestFilter) {
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Preflight OPTIONS requests and Error endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error", "/error/**").permitAll()

                        // 1. Authentication Endpoints (Public)
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

                        // 2. Public Lookups (Public GET)
                        .requestMatchers(HttpMethod.GET, "/api/lookups/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/religions").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/heights").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/shibir-masters").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/shibir-masters").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/shibir-masters/**").authenticated()

                        // 3. Draft Forms (Public)
                        .requestMatchers(HttpMethod.GET, "/api/registrations/draft/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/registrations/draft").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/registrations/draft/**").permitAll()

                        // 4. Inquiries (Public POST, Admin GET/DELETE)
                        .requestMatchers(HttpMethod.POST, "/api/inquiries").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/inquiries").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/inquiries/**").authenticated()

                        // 5. News (Public GET, Admin POST/DELETE)
                        .requestMatchers(HttpMethod.GET, "/api/news").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/news").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/news/**").authenticated()

                        // 6. Membership Plans (Public GET, Admin PUT)
                        .requestMatchers(HttpMethod.GET, "/api/membership-plans").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/membership-plans/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/membership-plans/**").authenticated()

                        // 7. Payment Settings (Public GET, Admin POST/DELETE)
                        .requestMatchers(HttpMethod.GET, "/api/payment-settings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payment-settings/qr").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payment-settings/qr").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/payment-settings/qr").authenticated()

                        // 8. Gallery (Public GET, Admin POST/PUT/DELETE/PATCH)
                        .requestMatchers(HttpMethod.GET, "/api/gallery").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/gallery/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/gallery/upload").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/gallery/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/gallery/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/gallery/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/gallery/**").authenticated()
                        .requestMatchers("/uploads/**").permitAll()

                        // Categories (Public GET, Admin POST/PUT/DELETE)
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categories").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").authenticated()

                        // 9. Member Registrations (Public POST & PDF, Admin GET/PUT)
                        .requestMatchers(HttpMethod.POST, "/api/member-registration").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/member-registration/form/**",
                                "/api/member-registration/*/pdf")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/member-registration").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/member-registration/**").authenticated()

                        // 10. Marriage Registrations (Public POST & PDF, Admin GET/PUT)
                        .requestMatchers(HttpMethod.POST, "/api/marriage-registration").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/marriage-registration/form/**",
                                "/api/marriage-registration/*/pdf")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/marriage-registration").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/marriage-registration/**").authenticated()

                        // 11. Shibir Registrations (Public POST & PDF, Admin GET/PUT)
                        .requestMatchers(HttpMethod.POST, "/api/shibir-registration").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/shibir-registration/form/**",
                                "/api/shibir-registration/*/pdf")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/shibir-registration").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/shibir-registration/**").authenticated()

                        // 12. Donation Registrations & Lookups (Public POST/GET
                        // Lookups/Drafts/Receipts, Admin GET/PUT)
                        .requestMatchers(HttpMethod.GET, "/api/donation-types").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/donation-purposes").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/donation-registration", "/api/donation-registration/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/donation-registration/receipt/**",
                                "/api/donation-registration/form/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/donation-registration").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/donation-registration/**").authenticated()

                        // 13. Payments (Public POST, Admin GET/PUT)
                        .requestMatchers(HttpMethod.POST, "/api/payments").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payments").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/payments/**").authenticated()

                        // 14. Dashboard Stats (Admin GET)
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/**").authenticated()

                        // Fallback block
                        .anyRequest().authenticated());

        // Add filter to validate JWT tokens on each request
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}

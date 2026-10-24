package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.config.JwtTokenUtil;
import com.SevabhaviSanstha.dto.*;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matrimony")
public class MatrimonyController {

    @Autowired
    private MarriageRegistrationService marriageRegistrationService;

    @Autowired
    private MarriageRegistrationRepository marriageRegistrationRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private Integer extractCurrentUserId(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Claims claims = jwtTokenUtil.getAllClaimsFromToken(token);
                Object userIdObj = claims.get("userId");
                if (userIdObj != null) {
                    if (userIdObj instanceof Integer) return (Integer) userIdObj;
                    return Integer.valueOf(userIdObj.toString());
                }
            }
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String name = auth.getName();
                return marriageRegistrationRepository.findByMobileOrEmail(name)
                        .map(MarriageRegistration::getId).orElse(null);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
    }

    /**
     * 1. Public Profiles Listing with Filters & Pagination
     */
    @GetMapping("/profiles")
    public ResponseEntity<Page<MatrimonyPublicProfileDTO>> getPublicProfiles(
            @ModelAttribute MatrimonyFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            HttpServletRequest request) {

        Integer currentUserId = extractCurrentUserId(request);
        Pageable pageable = PageRequest.of(page, size);
        Page<MatrimonyPublicProfileDTO> result = marriageRegistrationService.getPublicProfiles(filter, pageable, currentUserId);
        return ResponseEntity.ok(result);
    }

    /**
     * 2. Public Single Profile Details (Limited DTO for unauthenticated guests)
     */
    @GetMapping("/profiles/{id}")
    public ResponseEntity<?> getPublicProfileById(@PathVariable Integer id, HttpServletRequest request) {
        try {
            Integer currentUserId = extractCurrentUserId(request);
            MatrimonyPublicProfileDTO dto = marriageRegistrationService.getPublicProfileById(id, currentUserId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 3. Member-Only Full Profile Details (Protected: requires approved active subscription or admin)
     */
    @GetMapping("/profile-full/{id}")
    public ResponseEntity<?> getFullProfileById(@PathVariable Integer id, HttpServletRequest request) {
        try {
            Integer currentUserId = extractCurrentUserId(request);
            boolean isAdmin = isCurrentUserAdmin();
            MatrimonyFullProfileDTO dto = marriageRegistrationService.getFullProfileById(id, currentUserId, isAdmin);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 4. Similar Profiles
     */
    @GetMapping("/profiles/{id}/similar")
    public ResponseEntity<List<MatrimonyPublicProfileDTO>> getSimilarProfiles(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "6") int limit,
            HttpServletRequest request) {

        Integer currentUserId = extractCurrentUserId(request);
        Pageable pageable = PageRequest.of(0, limit);
        List<MatrimonyPublicProfileDTO> similar = marriageRegistrationService.getSimilarProfiles(id, pageable, currentUserId);
        return ResponseEntity.ok(similar);
    }

    /**
     * 5. Matrimony User Login (Works ONLY when status is APPROVED)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null) identifier = request.get("mobile");
        if (identifier == null) identifier = request.get("email");
        String password = request.get("password");

        try {
            MatrimonyAuthResponseDTO response = marriageRegistrationService.loginMatrimonyUser(identifier, password);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 6. Matrimony User Forgot / Reset Password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        if (identifier == null) identifier = request.get("mobile");
        if (identifier == null) identifier = request.get("email");
        String newPassword = request.get("newPassword");

        try {
            marriageRegistrationService.resetMatrimonyPassword(identifier, newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "पासवर्ड यशस्वीरित्या बदलला आहे! नवीन पासवर्डसह लॉगिन करा."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 7. Toggle Favourite Profile (Protected)
     */
    @PostMapping("/favorites/{profileId}")
    public ResponseEntity<?> toggleFavorite(@PathVariable Integer profileId, HttpServletRequest request) {
        Integer currentUserId = extractCurrentUserId(request);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "कृपया आवडीची प्रोफाइल जोडण्यासाठी प्रथम लॉगिन करा."));
        }

        boolean isFavorited = marriageRegistrationService.toggleFavorite(currentUserId, profileId);
        return ResponseEntity.ok(Map.of(
                "favorite", isFavorited,
                "message", isFavorited ? "प्रोफाइल आवडीच्या यादीत जोडली गेली." : "प्रोफाइल आवडीच्या यादीतून काढली गेली."
        ));
    }

    /**
     * 8. Get User Favourites List (Protected)
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getUserFavorites(HttpServletRequest request) {
        Integer currentUserId = extractCurrentUserId(request);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "अनधिकृत वापरकर्ता"));
        }

        List<Integer> favorites = marriageRegistrationService.getUserFavorites(currentUserId);
        return ResponseEntity.ok(favorites);
    }

    /**
     * 9. Photo Upload Helper Endpoint
     */
    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            String url = marriageRegistrationService.uploadPhoto(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "फोटो अपलोड अयशस्वी: " + e.getMessage()));
        }
    }
}

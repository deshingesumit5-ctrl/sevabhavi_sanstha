package com.SevabhaviSanstha.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class MatrimonyAuthResponseDTO {
    private String token;
    private Integer id;
    private String fullName;
    private String profileType;
    private String mobile;
    private String email;
    private Boolean subscriptionActive;
    private LocalDate subscriptionEndDate;
    private String mainPhotoUrl;
    private String role; // "ROLE_MATRIMONY_USER"

    @Builder
    public MatrimonyAuthResponseDTO(String token, Integer id, String fullName, String profileType,
                                    String mobile, String email, Boolean subscriptionActive,
                                    LocalDate subscriptionEndDate, String mainPhotoUrl, String role) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.profileType = profileType;
        this.mobile = mobile;
        this.email = email;
        this.subscriptionActive = subscriptionActive;
        this.subscriptionEndDate = subscriptionEndDate;
        this.mainPhotoUrl = mainPhotoUrl;
        this.role = role;
    }
}

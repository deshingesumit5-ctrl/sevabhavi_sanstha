package com.SevabhaviSanstha.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private String packageType;
    private Integer biodataLimit;
    private Long usedViews;
    private Long remainingViews;
}

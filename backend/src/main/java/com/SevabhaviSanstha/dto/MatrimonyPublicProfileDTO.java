package com.SevabhaviSanstha.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrimonyPublicProfileDTO {
    private Integer id;
    private String profileType; // 'bride' or 'groom'
    private String displayName; // e.g. surname or first name
    private Integer age;
    private String height;
    private String bloodGroup;
    private String maritalStatus;
    private String religion;
    private String caste;
    private String manglik;
    private String educationLevel;
    private String degreeName;
    private String occupationType;
    private String designation;
    private String city;
    private String districtNameMr;
    private String stateNameMr;
    private String mainPhotoUrl;
    private Integer photoCount;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
}

package com.SevabhaviSanstha.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrimonyFullProfileDTO {
    private Integer id;
    private String profileType; // 'bride' or 'groom'
    private String fullName;
    private String displayName;
    private LocalDate birthDate;
    private Integer age;
    private String height;
    private String bloodGroup;
    private String maritalStatus;
    private String religion;
    private String caste;
    private String gotra;
    private String manglik;
    private String city;
    private Integer districtId;
    private String districtNameMr;
    private Integer stateId;
    private String stateNameMr;

    // Contact Details (Visible ONLY to active members / admins)
    private String mobile;
    private String email;
    private String parentMobile;

    // About & Expectations
    private String aboutSelf;
    private String expectations;

    // Education & Career
    private String educationLevel;
    private String degreeName;
    private String schoolCollege;
    private String passingYear;
    private String occupationType;
    private String designation;
    private String companyName;
    private String annualIncome;

    // Family Details
    private String fatherName;
    private String fatherOccupation;
    private String motherName;
    private Integer brothers;
    private Integer sisters;
    private String familyBackground;

    // Photos
    private String mainPhotoUrl;
    private Integer photoCount;
    private Boolean mainPhotoUploaded;
    private Boolean fullPhotoUploaded;

    // Subscription & Favourites
    private Boolean subscriptionActive;
    private LocalDate subscriptionEndDate;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
}

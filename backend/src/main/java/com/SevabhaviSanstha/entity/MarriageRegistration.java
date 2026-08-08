package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "marriage_registrations")
@Data
public class MarriageRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "profile_type", nullable = false, length = 10)
    private String profileType; // 'bride' or 'groom'

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "height", nullable = false, columnDefinition = "NVARCHAR(50)")
    private String height;

    @Column(name = "blood_group", nullable = false, length = 10)
    private String bloodGroup;

    @Column(name = "marital_status", nullable = false, length = 20)
    private String maritalStatus;

    @Column(name = "religion", nullable = false, length = 100)
    private String religion;

    @Column(name = "caste", nullable = false, length = 100)
    private String caste;

    @Column(name = "gotra", length = 100)
    private String gotra;

    @Column(name = "manglik", nullable = false, length = 20)
    private String manglik;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @Column(name = "mobile", nullable = false, length = 20)
    private String mobile;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "parent_mobile", nullable = false, length = 20)
    private String parentMobile;

    @Column(name = "about_self", nullable = false, length = 1000)
    private String aboutSelf;

    @Column(name = "expectations", nullable = false, length = 1000)
    private String expectations;

    // Education details
    @Column(name = "education_level", nullable = false, length = 100)
    private String educationLevel;

    @Column(name = "degree_name", nullable = false, length = 100)
    private String degreeName;

    @Column(name = "school_college", length = 255)
    private String schoolCollege;

    @Column(name = "passing_year", nullable = false, length = 10)
    private String passingYear;

    // Occupation details
    @Column(name = "occupation_type", nullable = false, length = 50)
    private String occupationType;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "annual_income", nullable = false, length = 100)
    private String annualIncome;

    // Family details
    @Column(name = "father_name", nullable = false, length = 255)
    private String fatherName;

    @Column(name = "father_occupation", nullable = false, length = 100)
    private String fatherOccupation;

    @Column(name = "mother_name", nullable = false, length = 255)
    private String motherName;

    @Column(name = "brothers")
    private Integer brothers = 0;

    @Column(name = "sisters")
    private Integer sisters = 0;

    @Column(name = "family_background", length = 1000)
    private String familyBackground;

    // Photos
    @Column(name = "main_photo_uploaded")
    private Boolean mainPhotoUploaded = false;

    @Column(name = "full_photo_uploaded")
    private Boolean fullPhotoUploaded = false;

    @Column(name = "declaration")
    private Boolean declaration = false;

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

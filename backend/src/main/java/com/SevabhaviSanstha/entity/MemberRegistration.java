package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_registrations")
@Data
public class MemberRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "gender", nullable = false, length = 10)
    private String gender;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "marital_status", nullable = false, length = 20)
    private String maritalStatus;

    @Column(name = "mobile", nullable = false, length = 20)
    private String mobile;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "occupation", nullable = false, length = 100)
    private String occupation;

    @Column(name = "education", nullable = false, length = 100)
    private String education;

    @Column(name = "id_uploaded")
    private Boolean idUploaded = false;

    @Column(name = "current_address", nullable = false, length = 500)
    private String currentAddress;

    @Column(name = "permanent_address", nullable = false, length = 500)
    private String permanentAddress;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taluka_id", nullable = false)
    private Taluka taluka;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "area_id")
    private Area area;

    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;

    @Nationalized
    @Column(name = "permanent_district", length = 100, columnDefinition = "NVARCHAR(100)")
    private String permanentDistrict;

    @Nationalized
    @Column(name = "permanent_taluka", length = 100, columnDefinition = "NVARCHAR(100)")
    private String permanentTaluka;

    @Nationalized
    @Column(name = "permanent_village", length = 200, columnDefinition = "NVARCHAR(200)")
    private String permanentVillage;

    @Column(name = "permanent_pincode", length = 10)
    private String permanentPincode;

    @Nationalized
    @Column(name = "current_district", length = 100, columnDefinition = "NVARCHAR(100)")
    private String currentDistrict;

    @Nationalized
    @Column(name = "current_suburb", length = 200, columnDefinition = "NVARCHAR(200)")
    private String currentSuburb;

    @Column(name = "current_pincode", length = 10)
    private String currentPincode;

    @Column(name = "member_type", nullable = false, length = 20)
    private String memberType;

    @Column(name = "id_proof_number", length = 50)
    private String idProofNumber;

    @Column(name = "expectations", length = 1000)
    private String expectations;

    @Column(name = "message", length = 1000)
    private String message;

    @Column(name = "declaration")
    private Boolean declaration = false;

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus = "PENDING";

        @Column(name = "is_active", nullable = false, columnDefinition = "BIT NOT NULL DEFAULT 1")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

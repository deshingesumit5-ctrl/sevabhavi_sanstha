package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
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

    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;

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

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

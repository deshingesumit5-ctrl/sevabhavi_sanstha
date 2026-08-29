package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_registrations")
@Data
public class DonationRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 50)
    private String receiptNumber;

    // Step 1: वैयक्तिक माहिती
    @Nationalized
    @Column(name = "full_name", nullable = false, length = 255, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Column(name = "mobile", nullable = false, length = 20)
    private String mobile;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Nationalized
    @Column(name = "gender", length = 20, columnDefinition = "NVARCHAR(20)")
    private String gender;

    @Nationalized
    @Column(name = "address", nullable = false, length = 500, columnDefinition = "NVARCHAR(500)")
    private String address;

    @Nationalized
    @Column(name = "city", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String city;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taluka_id")
    private Taluka taluka;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id")
    private State state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    // Step 2: देणगीचा प्रकार व उद्देश
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_type_id", nullable = false)
    private DonationType donationType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_purpose_id", nullable = false)
    private DonationPurpose donationPurpose;

    @Column(name = "in_memory_of_toggle")
    private Boolean inMemoryOfToggle = false;

    @Nationalized
    @Column(name = "in_memory_of_name", length = 255, columnDefinition = "NVARCHAR(255)")
    private String inMemoryOfName;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Nationalized
    @Column(name = "message", length = 1000, columnDefinition = "NVARCHAR(1000)")
    private String message;

    // Step 3: देणगी रक्कम
    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency = "INR";

    // Step 3: पेमेंट तपशील

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // Razorpay, UPI, Card, Net Banking, Offline

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PENDING"; // PENDING, SUCCESS, FAILED, VERIFIED

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "gateway_reference", length = 100)
    private String gatewayReference;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    // Metadata
    @Column(name = "draft_step")
    private Integer draftStep = 1;

    @Column(name = "approval_status", length = 50)
    private String approvalStatus = "APPROVED"; // Approved by default or PENDING

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

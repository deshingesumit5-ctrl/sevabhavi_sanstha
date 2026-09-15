package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shibir_registrations")
@Data
public class ShibirRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(name = "shibir_name", nullable = false, length = 255, columnDefinition = "VARCHAR(255)")
    private String shibirName;

  
    @Column(name = "shibir_date", length = 50, columnDefinition = "VARCHAR(50)")
    private String shibirDate;


    @Column(name = "shibir_location", length = 255, columnDefinition = "VARCHAR(255)")
    private String shibirLocation;

   
    @Column(name = "full_name", nullable = false, length = 255, columnDefinition = "VARCHAR(255)")
    private String fullName;


    @Column(name = "full_address", nullable = false, length = 500, columnDefinition = "VARCHAR(500)")
    private String fullAddress;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taluka_id", nullable = false)
    private Taluka taluka;

  
    @Column(name = "city_village", nullable = false, length = 100, columnDefinition = "VARCHAR(100)")
    private String cityVillage;


    @Column(name = "occupation", length = 100, columnDefinition = "VARCHAR(100)")
    private String occupation;


    @Column(name = "education", length = 100, columnDefinition = "VARCHAR(100)")
    private String education;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "age")
    private Integer age;

    @Column(name = "mobile", nullable = false, length = 20)
    private String mobile;

    @Column(name = "relative_mobile", length = 20)
    private String relativeMobile;

    @Column(name = "participated_earlier")
    private Boolean participatedEarlier = false;


    @Column(name = "previous_event_name", length = 255, columnDefinition = "VARCHAR(255)")
    private String previousEventName;

   
    @Column(name = "special_info", length = 1000, columnDefinition = "VARCHAR(1000)")
    private String specialInfo;

    @Column(name = "passport_photo_url", columnDefinition = "LONGTEXT")
    private String passportPhotoUrl;

    @Column(name = "payment_mode", length = 30)
    private String paymentMode;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "upi_txn_id", length = 50)
    private String upiTxnId;

    @Column(name = "screenshot_url", columnDefinition = "LONGTEXT")
    private String screenshotUrl;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PENDING";

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
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

    @Nationalized
    @Column(name = "shibir_name", nullable = false, length = 255, columnDefinition = "NVARCHAR(255)")
    private String shibirName;

    @Nationalized
    @Column(name = "shibir_date", length = 50, columnDefinition = "NVARCHAR(50)")
    private String shibirDate;

    @Nationalized
    @Column(name = "shibir_location", length = 255, columnDefinition = "NVARCHAR(255)")
    private String shibirLocation;

    @Nationalized
    @Column(name = "full_name", nullable = false, length = 255, columnDefinition = "NVARCHAR(255)")
    private String fullName;

    @Nationalized
    @Column(name = "full_address", nullable = false, length = 500, columnDefinition = "NVARCHAR(500)")
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

    @Nationalized
    @Column(name = "city_village", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String cityVillage;

    @Nationalized
    @Column(name = "occupation", length = 100, columnDefinition = "NVARCHAR(100)")
    private String occupation;

    @Nationalized
    @Column(name = "education", length = 100, columnDefinition = "NVARCHAR(100)")
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

    @Nationalized
    @Column(name = "previous_event_name", length = 255, columnDefinition = "NVARCHAR(255)")
    private String previousEventName;

    @Nationalized
    @Column(name = "special_info", length = 1000, columnDefinition = "NVARCHAR(1000)")
    private String specialInfo;

    @Column(name = "passport_photo_url", columnDefinition = "NVARCHAR(MAX)")
    private String passportPhotoUrl;

    @Column(name = "payment_mode", length = 30)
    private String paymentMode;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "upi_txn_id", length = 50)
    private String upiTxnId;

    @Column(name = "screenshot_url", columnDefinition = "NVARCHAR(MAX)")
    private String screenshotUrl;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PENDING";

    @Column(name = "approval_status", nullable = false, length = 20)
    private String approvalStatus = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

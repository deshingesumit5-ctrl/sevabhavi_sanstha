package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "member_id", nullable = true)
    private Integer memberId;

    @Column(name = "registration_type", length = 30)
    private String registrationType;

    @Column(name = "registration_id", nullable = true)
    private Integer registrationId;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "membership_type", nullable = false, length = 20)
    private String membershipType;

    @Column(name = "payment_mode", length = 30)
    private String paymentMode;

    @Column(name = "upi_txn_id", length = 50)
    private String upiTxnId;

    @Column(name = "screenshot_url", columnDefinition = "TEXT")
    private String screenshotUrl;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Column(name = "status", length = 20)
    private String status = "सादर केले";

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
}

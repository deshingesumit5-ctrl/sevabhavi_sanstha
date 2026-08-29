package com.SevabhaviSanstha.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentDTO {
    private Integer id;
    private Integer memberId;
    private String registrationType;
    private Integer registrationId;
    private String memberName;
    private String memberMobile;
    private BigDecimal amount;
    private String membershipType;
    private String paymentMode;
    private String upiTxnId;
    private String screenshotUrl;
    private LocalDateTime paymentDate;
    private String status;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
}

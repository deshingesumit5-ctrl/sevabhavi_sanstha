package com.SevabhaviSanstha.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DonationRequestDTO {
    private Integer id;
    private String receiptNumber;
    private String fullName;
    private String mobile;
    private String email;
    private LocalDate birthDate;
    private String gender;
    private String address;
    private String city;
    private Integer talukaId;
    private Integer districtId;
    private Integer stateId;
    private String pincode;

    private Integer donationTypeId;
    private Integer donationPurposeId;
    private Boolean inMemoryOfToggle;
    private String inMemoryOfName;
    private Boolean isAnonymous;
    private String message;

    private BigDecimal amount;
    private String currency;

    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private String gatewayReference;
    private Integer draftStep;
}

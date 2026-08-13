package com.SevabhaviSanstha.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentSettingDTO {
    private String upiId;
    private String payeeName;
    private String qrImageUrl;
    private String updatedBy;
    private LocalDateTime updatedAt;
}

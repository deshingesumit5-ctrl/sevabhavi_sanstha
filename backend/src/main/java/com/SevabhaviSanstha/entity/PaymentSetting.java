package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_settings")
@Data
public class PaymentSetting {
    @Id
    private Integer id = 1;

    @Column(name = "upi_id", nullable = false, length = 100)
    private String upiId;

    @Column(name = "payee_name", length = 150)
    private String payeeName;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}

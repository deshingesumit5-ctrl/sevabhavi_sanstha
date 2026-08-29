package com.SevabhaviSanstha.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private String receiptNumber;
    private String gatewayReference; // e.g., razorpay_payment_id or order_id
    private String transactionId;    // e.g., razorpay_signature or UPI UTR
    private String paymentStatus;    // SUCCESS / FAILED / VERIFIED
    private String paymentMethod;
}

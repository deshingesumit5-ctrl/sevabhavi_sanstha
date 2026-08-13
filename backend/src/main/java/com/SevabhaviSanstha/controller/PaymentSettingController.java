package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.PaymentSettingDTO;
import com.SevabhaviSanstha.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/payment-settings")
public class PaymentSettingController {

    private final PaymentService paymentService;

    public PaymentSettingController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Public: get active QR image URL and UPI setting
    @GetMapping({"", "/qr"})
    public ResponseEntity<PaymentSettingDTO> getQrSetting() {
        return ResponseEntity.ok(paymentService.getPaymentSettingWithQr());
    }

    // Admin: upload new QR image and update UPI ID / payee name
    @PostMapping(value = "/qr", consumes = "multipart/form-data")
    public ResponseEntity<?> updateQrSetting(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "upiId", required = false) String upiId,
            @RequestParam(value = "payeeName", required = false) String payeeName,
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {

        // Backend Admin Access Control Check
        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }

        try {
            PaymentSettingDTO updated = paymentService.updatePaymentSettingAndQr(file, upiId, payeeName, adminHeader);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: delete QR code image
    @DeleteMapping("/qr")
    public ResponseEntity<?> deleteQrSetting(
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {

        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }

        try {
            PaymentSettingDTO updated = paymentService.deletePaymentQr(adminHeader);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.PaymentDTO;
import com.SevabhaviSanstha.entity.Payment;
import com.SevabhaviSanstha.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Public: Submit Payment (Step 4 of Registration)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createPayment(
            @RequestParam("memberId") Integer memberId,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("membershipType") String membershipType,
            @RequestParam(value = "paymentMode", required = false) String paymentMode,
            @RequestParam("upiTxnId") String upiTxnId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Payment created = paymentService.createPayment(memberId, amount, membershipType, paymentMode, upiTxnId, file);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "पेमेंट साठवताना त्रुटी आली: " + e.getMessage()));
        }
    }

    // Admin: List all payments
    @GetMapping
    public ResponseEntity<?> getAllPayments(
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {

        // Backend Admin Access Control Check
        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }

        List<PaymentDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    // Admin: Update Payment Status (पडताळणी करा / नाकारा)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {

        // Backend Admin Access Control Check
        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }

        try {
            PaymentDTO updated = paymentService.updatePaymentStatus(id, status, adminHeader, reason);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "सर्वर त्रुटी: " + e.getMessage()));
        }
    }

    // Admin: Verify payment
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyPayment(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {
        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }
        try {
            PaymentDTO updated = paymentService.updatePaymentStatus(id, "पडताळलेले", adminHeader, null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Reject payment
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Integer id,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestHeader(value = "X-Admin-User", required = false) String adminHeader) {
        if (adminHeader == null || adminHeader.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "प्रशासक लॉगिन आवश्यक आहे (Admin authorization required)"));
        }
        try {
            PaymentDTO updated = paymentService.updatePaymentStatus(id, "नाकारलेले", adminHeader, reason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

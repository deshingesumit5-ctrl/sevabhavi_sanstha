package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.PaymentDTO;
import com.SevabhaviSanstha.entity.Payment;
import com.SevabhaviSanstha.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
            Payment created = paymentService.createPayment(memberId, amount, membershipType, paymentMode, upiTxnId,
                    file);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "पेमेंट साठवताना त्रुटी आली: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllPayments() {
        List<PaymentDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestParam("status") String status,
            @RequestParam(value = "reason", required = false) String reason) {

        try {
            String adminName = SecurityContextHolder.getContext().getAuthentication().getName();
            PaymentDTO updated = paymentService.updatePaymentStatus(id, status, adminName, reason);
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyPayment(@PathVariable Integer id) {
        try {
            String adminName = SecurityContextHolder.getContext().getAuthentication().getName();
            PaymentDTO updated = paymentService.updatePaymentStatus(id, "पडताळलेले", adminName, null);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Integer id,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            String adminName = SecurityContextHolder.getContext().getAuthentication().getName();
            PaymentDTO updated = paymentService.updatePaymentStatus(id, "नाकारलेले", adminName, reason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

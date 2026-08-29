package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.DonationRequestDTO;
import com.SevabhaviSanstha.dto.PaymentVerificationRequest;
import com.SevabhaviSanstha.entity.DonationPurpose;
import com.SevabhaviSanstha.entity.DonationRegistration;
import com.SevabhaviSanstha.entity.DonationType;
import com.SevabhaviSanstha.service.DonationRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DonationRegistrationController {

    @Autowired
    private DonationRegistrationService donationRegistrationService;

    // Lookups
    @GetMapping("/donation-types")
    public ResponseEntity<List<DonationType>> getDonationTypes() {
        return ResponseEntity.ok(donationRegistrationService.getAllDonationTypes());
    }

    @GetMapping("/donation-purposes")
    public ResponseEntity<List<DonationPurpose>> getDonationPurposes() {
        return ResponseEntity.ok(donationRegistrationService.getAllDonationPurposes());
    }

    // Step-by-Step Draft endpoint
    @PostMapping("/donation-registration/draft")
    public ResponseEntity<DonationRegistration> saveDraft(@RequestBody DonationRequestDTO dto) {
        DonationRegistration saved = donationRegistrationService.saveDraft(dto);
        return ResponseEntity.ok(saved);
    }

    // Final Donation Submission
    @PostMapping("/donation-registration")
    public ResponseEntity<DonationRegistration> submitDonation(@RequestBody DonationRequestDTO dto) {
        DonationRegistration saved = donationRegistrationService.submitDonation(dto);
        return ResponseEntity.ok(saved);
    }

    // Gateway Webhook / Payment Verification
    @PostMapping("/donation-registration/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            DonationRegistration verified = donationRegistrationService.verifyPayment(request);
            return ResponseEntity.ok(verified);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get Receipt by Receipt Number
    @GetMapping("/donation-registration/receipt/{receiptNumber}")
    public ResponseEntity<DonationRegistration> getReceipt(@PathVariable String receiptNumber) {
        try {
            DonationRegistration donation = donationRegistrationService.getByReceiptNumber(receiptNumber);
            return ResponseEntity.ok(donation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // PDF Download Receipt endpoint
    @GetMapping("/donation-registration/receipt/{receiptNumber}/pdf")
    public ResponseEntity<?> downloadReceiptPdf(@PathVariable String receiptNumber) {
        try {
            byte[] pdfBytes = donationRegistrationService.generateReceiptPdf(receiptNumber);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename("Donation_Receipt_" + receiptNumber + ".pdf")
                            .build()
            );
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "देणगी पावती PDF तयार करताना त्रुटी आली: " + e.getMessage()));
        }
    }

    // Admin Endpoints
    @GetMapping("/donation-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DonationRegistration>> getAllDonations() {
        return ResponseEntity.ok(donationRegistrationService.getAllDonations());
    }

    @PutMapping("/donation-registration/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DonationRegistration> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        DonationRegistration updated = donationRegistrationService.updateApprovalStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}

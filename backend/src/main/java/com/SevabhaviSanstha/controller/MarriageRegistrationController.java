package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marriage-registration")
public class MarriageRegistrationController {

    @Autowired
    private MarriageRegistrationService marriageRegistrationService;

    @PostMapping
    public ResponseEntity<MarriageRegistration> registerMarriage(@RequestBody MarriageRegistration registration) {
        MarriageRegistration saved = marriageRegistrationService.registerMarriage(registration);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<MarriageRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(marriageRegistrationService.getAllRegistrations());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MarriageRegistration> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        MarriageRegistration updated = marriageRegistrationService.updateApprovalStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}

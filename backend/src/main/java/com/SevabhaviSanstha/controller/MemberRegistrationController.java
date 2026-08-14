package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.service.MemberRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/member-registration")
public class MemberRegistrationController {

    @Autowired
    private MemberRegistrationService memberRegistrationService;

    @PostMapping
    public ResponseEntity<MemberRegistration> registerMember(@RequestBody MemberRegistration registration) {
        MemberRegistration saved = memberRegistrationService.registerMember(registration);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MemberRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(memberRegistrationService.getAllRegistrations());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MemberRegistration> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        MemberRegistration updated = memberRegistrationService.updateApprovalStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}

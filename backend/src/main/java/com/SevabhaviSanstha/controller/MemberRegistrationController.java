package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.service.MemberRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // PDF Download Form endpoint
    @GetMapping({"/form/{id}/pdf", "/{id}/pdf"})
    public ResponseEntity<?> downloadFormPdf(@PathVariable Integer id) {
        try {
            byte[] pdfBytes = memberRegistrationService.generateMemberFormPdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename("Member_Registration_MEM_" + id + ".pdf")
                            .build()
            );
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "सभासद नोंदणी अर्ज PDF तयार करताना त्रुटी आली: " + e.getMessage()));
        }
    }
}

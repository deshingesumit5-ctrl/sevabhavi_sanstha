package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.ShibirMaster;
import com.SevabhaviSanstha.entity.ShibirRegistration;
import com.SevabhaviSanstha.service.ShibirRegistrationService;
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
@RequestMapping("/api")
public class ShibirRegistrationController {

    @Autowired
    private ShibirRegistrationService shibirRegistrationService;

    @PostMapping("/shibir-registration")
    public ResponseEntity<ShibirRegistration> registerShibir(@RequestBody ShibirRegistration registration) {
        ShibirRegistration saved = shibirRegistrationService.registerShibir(registration);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/shibir-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ShibirRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(shibirRegistrationService.getAllRegistrations());
    }

    @PutMapping("/shibir-registration/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ShibirRegistration> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        ShibirRegistration updated = shibirRegistrationService.updateApprovalStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // PDF Download Form endpoint
    @GetMapping({"/shibir-registration/form/{id}/pdf", "/shibir-registration/{id}/pdf"})
    public ResponseEntity<?> downloadFormPdf(@PathVariable Integer id) {
        try {
            byte[] pdfBytes = shibirRegistrationService.generateShibirFormPdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename("Shibir_Registration_SHIBIR_" + id + ".pdf")
                            .build()
            );
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "शिबिर नोंदणी अर्ज PDF तयार करताना त्रुटी आली: " + e.getMessage()));
        }
    }

    @GetMapping("/shibir-masters")
    public ResponseEntity<List<ShibirMaster>> getShibirMasters() {
        return ResponseEntity.ok(shibirRegistrationService.getAllShibirMasters());
    }

    @PostMapping("/shibir-masters")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ShibirMaster> createShibirMaster(@RequestBody ShibirMaster master) {
        return ResponseEntity.ok(shibirRegistrationService.createShibirMaster(master));
    }

    @DeleteMapping("/shibir-masters/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteShibirMaster(@PathVariable Integer id) {
        shibirRegistrationService.deleteShibirMaster(id);
        return ResponseEntity.ok().build();
    }
}

package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MarriageRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(marriageRegistrationService.getAllRegistrations());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MarriageRegistration> updateStatus(
            @PathVariable Integer id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        MarriageRegistration updated = marriageRegistrationService.updateApprovalStatusWithReason(id, status, reason);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String url = marriageRegistrationService.uploadPhoto(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "फोटो अपलोड अयशस्वी: " + e.getMessage()));
        }
    }

    // PDF Download Form endpoint
    @GetMapping({"/form/{id}/pdf", "/{id}/pdf"})
    public ResponseEntity<?> downloadFormPdf(@PathVariable Integer id) {
        try {
            byte[] pdfBytes = marriageRegistrationService.generateFormPdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(
                    ContentDisposition.inline()
                            .filename("Marriage_Registration_MARRIAGE_" + id + ".pdf")
                            .build()
            );
            headers.setContentLength(pdfBytes.length);
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "विवाह नोंदणी अर्ज PDF तयार करताना त्रुटी आली: " + e.getMessage()));
        }
    }
}

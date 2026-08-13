package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.Inquiry;
import com.SevabhaviSanstha.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    private InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<Inquiry> createInquiry(@RequestBody Inquiry inquiry) {
        Inquiry saved = inquiryService.saveInquiry(inquiry);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Inquiry>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Integer id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok().build();
    }
}

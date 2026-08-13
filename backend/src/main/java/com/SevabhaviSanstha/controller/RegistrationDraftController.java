package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.DraftRequest;
import com.SevabhaviSanstha.dto.DraftResponse;
import com.SevabhaviSanstha.service.RegistrationDraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations/draft")
public class RegistrationDraftController {

    @Autowired
    private RegistrationDraftService registrationDraftService;

    @PostMapping
    public ResponseEntity<DraftResponse> createOrUpdateDraft(@RequestBody DraftRequest request) {
        DraftResponse response = registrationDraftService.createOrUpdateDraft(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{draftId}")
    public ResponseEntity<DraftResponse> getDraft(@PathVariable String draftId) {
        DraftResponse response = registrationDraftService.getDraft(draftId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{draftId}")
    public ResponseEntity<Void> deleteDraft(@PathVariable String draftId) {
        registrationDraftService.deleteDraft(draftId);
        return ResponseEntity.ok().build();
    }
}

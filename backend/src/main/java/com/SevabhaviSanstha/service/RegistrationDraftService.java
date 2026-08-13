package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.dto.DraftRequest;
import com.SevabhaviSanstha.dto.DraftResponse;

public interface RegistrationDraftService {
    DraftResponse createOrUpdateDraft(DraftRequest request);
    DraftResponse getDraft(String draftId);
    void deleteDraft(String draftId);
}

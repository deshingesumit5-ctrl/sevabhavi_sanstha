package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.dto.DraftRequest;
import com.SevabhaviSanstha.dto.DraftResponse;
import com.SevabhaviSanstha.entity.RegistrationDraft;
import com.SevabhaviSanstha.repository.RegistrationDraftRepository;
import com.SevabhaviSanstha.service.RegistrationDraftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RegistrationDraftServiceImpl implements RegistrationDraftService {

    @Autowired
    private RegistrationDraftRepository registrationDraftRepository;

    @Override
    @Transactional
    public DraftResponse createOrUpdateDraft(DraftRequest request) {
        RegistrationDraft draft = null;

        if (request.getDraftId() != null && !request.getDraftId().trim().isEmpty()) {
            Optional<RegistrationDraft> existing = registrationDraftRepository.findById(request.getDraftId());
            if (existing.isPresent()) {
                draft = existing.get();
            }
        }

        if (draft == null) {
            draft = new RegistrationDraft();
        }

        draft.setCurrentStep(request.getCurrentStep());
        draft.setFormDataJson(request.getFormDataJson());
        draft.setMembershipPlan(request.getMembershipPlan());
        draft.setMemberId(request.getMemberId());

        RegistrationDraft saved = registrationDraftRepository.save(draft);

        return mapToResponse(saved, "Draft saved successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public DraftResponse getDraft(String draftId) {
        Optional<RegistrationDraft> draftOpt = registrationDraftRepository.findById(draftId);
        if (draftOpt.isPresent()) {
            return mapToResponse(draftOpt.get(), "Draft retrieved successfully");
        }
        return null;
    }

    @Override
    @Transactional
    public void deleteDraft(String draftId) {
        if (registrationDraftRepository.existsById(draftId)) {
            registrationDraftRepository.deleteById(draftId);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldDrafts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        registrationDraftRepository.deleteByUpdatedAtBefore(cutoff);
    }

    private DraftResponse mapToResponse(RegistrationDraft draft, String message) {
        DraftResponse response = new DraftResponse();
        response.setDraftId(draft.getId());
        response.setCurrentStep(draft.getCurrentStep());
        response.setFormDataJson(draft.getFormDataJson());
        response.setMembershipPlan(draft.getMembershipPlan());
        response.setMemberId(draft.getMemberId());
        response.setMessage(message);
        return response;
    }
}

package com.SevabhaviSanstha.dto;

import lombok.Data;

@Data
public class DraftResponse {
    private String draftId;
    private Integer currentStep;
    private String formDataJson;
    private String membershipPlan;
    private Integer memberId;
    private String message;
}

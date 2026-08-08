package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import java.util.List;

public interface MarriageRegistrationService {
    MarriageRegistration registerMarriage(MarriageRegistration registration);
    List<MarriageRegistration> getAllRegistrations();
    MarriageRegistration updateApprovalStatus(Integer id, String status);
}

package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.MemberRegistration;
import java.util.List;

public interface MemberRegistrationService {
    MemberRegistration registerMember(MemberRegistration registration);
    List<MemberRegistration> getAllRegistrations();
    MemberRegistration updateApprovalStatus(Integer id, String status);
}

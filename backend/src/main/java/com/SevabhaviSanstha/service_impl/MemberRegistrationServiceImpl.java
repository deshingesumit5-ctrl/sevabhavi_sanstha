package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.repository.MemberRegistrationRepository;
import com.SevabhaviSanstha.service.MemberRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MemberRegistrationServiceImpl implements MemberRegistrationService {

    @Autowired
    private MemberRegistrationRepository memberRegistrationRepository;

    @Override
    public MemberRegistration registerMember(MemberRegistration registration) {
        registration.setApprovalStatus("PENDING");
        return memberRegistrationRepository.save(registration);
    }

    @Override
    public List<MemberRegistration> getAllRegistrations() {
        return memberRegistrationRepository.findAll();
    }

    @Override
    public MemberRegistration updateApprovalStatus(Integer id, String status) {
        MemberRegistration reg = memberRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member registration not found with id: " + id));
        reg.setApprovalStatus(status);
        return memberRegistrationRepository.save(reg);
    }
}

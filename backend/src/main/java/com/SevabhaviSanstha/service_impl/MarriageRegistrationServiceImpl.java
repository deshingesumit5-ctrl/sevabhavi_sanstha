package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MarriageRegistrationServiceImpl implements MarriageRegistrationService {

    @Autowired
    private MarriageRegistrationRepository marriageRegistrationRepository;

    @Override
    public MarriageRegistration registerMarriage(MarriageRegistration registration) {
        registration.setApprovalStatus("PENDING");
        return marriageRegistrationRepository.save(registration);
    }

    @Override
    public List<MarriageRegistration> getAllRegistrations() {
        return marriageRegistrationRepository.findAll();
    }

    @Override
    public MarriageRegistration updateApprovalStatus(Integer id, String status) {
        MarriageRegistration reg = marriageRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marriage registration not found with id: " + id));
        reg.setApprovalStatus(status);
        return marriageRegistrationRepository.save(reg);
    }
}

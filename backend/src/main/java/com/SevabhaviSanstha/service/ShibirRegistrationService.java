package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.ShibirMaster;
import com.SevabhaviSanstha.entity.ShibirRegistration;

import java.util.List;

public interface ShibirRegistrationService {
    ShibirRegistration registerShibir(ShibirRegistration registration);
    List<ShibirRegistration> getAllRegistrations();
    ShibirRegistration updateApprovalStatus(Integer id, String status);

    List<ShibirMaster> getAllShibirMasters();
    ShibirMaster createShibirMaster(ShibirMaster master);
    void deleteShibirMaster(Integer id);

    ShibirRegistration getById(Integer id);
    byte[] generateShibirFormPdf(Integer id);
}

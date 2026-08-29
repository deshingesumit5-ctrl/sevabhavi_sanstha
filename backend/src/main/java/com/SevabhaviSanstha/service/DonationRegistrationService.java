package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.dto.DonationRequestDTO;
import com.SevabhaviSanstha.dto.PaymentVerificationRequest;
import com.SevabhaviSanstha.entity.DonationPurpose;
import com.SevabhaviSanstha.entity.DonationRegistration;
import com.SevabhaviSanstha.entity.DonationType;

import java.util.List;

public interface DonationRegistrationService {
    List<DonationType> getAllDonationTypes();
    List<DonationPurpose> getAllDonationPurposes();
    
    DonationRegistration saveDraft(DonationRequestDTO dto);
    DonationRegistration submitDonation(DonationRequestDTO dto);
    DonationRegistration verifyPayment(PaymentVerificationRequest request);
    
    DonationRegistration getByReceiptNumber(String receiptNumber);
    List<DonationRegistration> getAllDonations();
    DonationRegistration updateApprovalStatus(Integer id, String status);
    
    byte[] generateReceiptPdf(String receiptNumber);
}

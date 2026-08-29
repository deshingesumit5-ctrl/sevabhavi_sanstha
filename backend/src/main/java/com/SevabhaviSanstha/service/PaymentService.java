package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.dto.PaymentDTO;
import com.SevabhaviSanstha.dto.PaymentSettingDTO;
import com.SevabhaviSanstha.entity.MembershipPlan;
import com.SevabhaviSanstha.entity.Payment;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    List<MembershipPlan> getAllMembershipPlans();

    MembershipPlan getMembershipPlanByCode(String planCode);

    MembershipPlan updateMembershipPlanAmount(String planCode, BigDecimal amount, String updatedBy);

    PaymentSettingDTO getPaymentSettingWithQr();

    PaymentSettingDTO updatePaymentSettingAndQr(MultipartFile file, String upiId, String payeeName, String updatedBy) throws Exception;

    PaymentSettingDTO deletePaymentQr(String updatedBy) throws Exception;

    Payment createPayment(Integer memberId, BigDecimal amount, String membershipType, String paymentMode, String upiTxnId, MultipartFile file) throws Exception;

    Payment createPaymentWithDetails(Integer memberId, String registrationType, Integer registrationId, BigDecimal amount, String membershipType, String paymentMode, String upiTxnId, MultipartFile file) throws Exception;

    List<PaymentDTO> getAllPayments();

    PaymentDTO updatePaymentStatus(Integer paymentId, String status, String verifiedBy, String reason);
}

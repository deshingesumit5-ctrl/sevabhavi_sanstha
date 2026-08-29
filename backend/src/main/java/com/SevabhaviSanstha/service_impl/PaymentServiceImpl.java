package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.dto.PaymentDTO;
import com.SevabhaviSanstha.dto.PaymentSettingDTO;
import com.SevabhaviSanstha.entity.GalleryImage;
import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.entity.MembershipPlan;
import com.SevabhaviSanstha.entity.Payment;
import com.SevabhaviSanstha.entity.PaymentSetting;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.entity.ShibirRegistration;
import com.SevabhaviSanstha.entity.DonationRegistration;
import com.SevabhaviSanstha.repository.DonationRegistrationRepository;
import com.SevabhaviSanstha.repository.GalleryImageRepository;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.repository.MemberRegistrationRepository;
import com.SevabhaviSanstha.repository.MembershipPlanRepository;
import com.SevabhaviSanstha.repository.PaymentRepository;
import com.SevabhaviSanstha.repository.PaymentSettingRepository;
import com.SevabhaviSanstha.repository.ShibirRegistrationRepository;
import com.SevabhaviSanstha.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final MembershipPlanRepository planRepository;
    private final PaymentSettingRepository settingRepository;
    private final PaymentRepository paymentRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final MemberRegistrationRepository memberRegistrationRepository;
    private final MarriageRegistrationRepository marriageRegistrationRepository;
    private final ShibirRegistrationRepository shibirRegistrationRepository;
    private final DonationRegistrationRepository donationRegistrationRepository;

    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;

    public PaymentServiceImpl(MembershipPlanRepository planRepository,
                              PaymentSettingRepository settingRepository,
                              PaymentRepository paymentRepository,
                              GalleryImageRepository galleryImageRepository,
                              MemberRegistrationRepository memberRegistrationRepository,
                              MarriageRegistrationRepository marriageRegistrationRepository,
                              ShibirRegistrationRepository shibirRegistrationRepository,
                              DonationRegistrationRepository donationRegistrationRepository) {
        this.planRepository = planRepository;
        this.settingRepository = settingRepository;
        this.paymentRepository = paymentRepository;
        this.galleryImageRepository = galleryImageRepository;
        this.memberRegistrationRepository = memberRegistrationRepository;
        this.marriageRegistrationRepository = marriageRegistrationRepository;
        this.shibirRegistrationRepository = shibirRegistrationRepository;
        this.donationRegistrationRepository = donationRegistrationRepository;
    }

    private void seedInitialDataIfEmpty() {
        if (planRepository.count() == 0) {
            MembershipPlan annual = new MembershipPlan();
            annual.setPlanCode("annual");
            annual.setPlanNameMr("वार्षिक सदस्य");
            annual.setAmount(new BigDecimal("100.00"));
            annual.setUpdatedBy("system");
            annual.setUpdatedAt(LocalDateTime.now());
            planRepository.save(annual);

            MembershipPlan lifetime = new MembershipPlan();
            lifetime.setPlanCode("lifetime");
            lifetime.setPlanNameMr("आजीवन सदस्य");
            lifetime.setAmount(new BigDecimal("1000.00"));
            lifetime.setUpdatedBy("system");
            lifetime.setUpdatedAt(LocalDateTime.now());
            planRepository.save(lifetime);
        }

        if (planRepository.findByPlanCode("shibir").isEmpty()) {
            MembershipPlan shibir = new MembershipPlan();
            shibir.setPlanCode("shibir");
            shibir.setPlanNameMr("शिबिर नोंदणी शुल्क");
            shibir.setAmount(new BigDecimal("200.00"));
            shibir.setUpdatedBy("system");
            shibir.setUpdatedAt(LocalDateTime.now());
            planRepository.save(shibir);
        }

        if (settingRepository.count() == 0) {
            PaymentSetting setting = new PaymentSetting();
            setting.setId(1);
            setting.setUpiId("9823456789@upi");
            setting.setPayeeName("दापोली मडणगड सेवाभावी संस्था, पुणे");
            setting.setUpdatedBy("system");
            setting.setUpdatedAt(LocalDateTime.now());
            settingRepository.save(setting);
        }
    }

    @Override
    public List<MembershipPlan> getAllMembershipPlans() {
        seedInitialDataIfEmpty();
        return planRepository.findAll();
    }

    @Override
    public MembershipPlan getMembershipPlanByCode(String planCode) {
        seedInitialDataIfEmpty();
        return planRepository.findByPlanCode(planCode)
                .orElseThrow(() -> new IllegalArgumentException("माहिती सापडली नाही: " + planCode));
    }

    @Override
    @Transactional
    public MembershipPlan updateMembershipPlanAmount(String planCode, BigDecimal amount, String updatedBy) {
        seedInitialDataIfEmpty();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("रक्कम ही नेहमी धनात्मक (Positive) असावी");
        }

        MembershipPlan plan = planRepository.findByPlanCode(planCode)
                .orElseThrow(() -> new IllegalArgumentException("माहिती सापडली नाही: " + planCode));

        plan.setAmount(amount);
        plan.setUpdatedBy(updatedBy != null && !updatedBy.isBlank() ? updatedBy : "admin");
        plan.setUpdatedAt(LocalDateTime.now());

        return planRepository.save(plan);
    }

    @Override
    public PaymentSettingDTO getPaymentSettingWithQr() {
        seedInitialDataIfEmpty();
        PaymentSetting setting = settingRepository.findById(1).orElse(null);

        PaymentSettingDTO dto = new PaymentSettingDTO();
        if (setting != null) {
            dto.setUpiId(setting.getUpiId());
            dto.setPayeeName(setting.getPayeeName());
            dto.setUpdatedBy(setting.getUpdatedBy());
            dto.setUpdatedAt(setting.getUpdatedAt());
        }

        // Fetch active QR image where section_key = 'payment_qr' and is_active = 1
        List<GalleryImage> qrImages = galleryImageRepository.findByCategoryAndSectionKeyAndIsActiveTrue("payment_qr", "payment_qr");
        if (qrImages.isEmpty()) {
            // Also try sectionKey = 'payment_qr' regardless of category
            List<GalleryImage> allActive = galleryImageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
            for (GalleryImage img : allActive) {
                if ("payment_qr".equalsIgnoreCase(img.getSectionKey())) {
                    dto.setQrImageUrl(img.getImageUrl());
                    break;
                }
            }
        } else {
            dto.setQrImageUrl(qrImages.get(0).getImageUrl());
        }

        return dto;
    }

    @Override
    @Transactional
    public PaymentSettingDTO updatePaymentSettingAndQr(MultipartFile file, String upiId, String payeeName, String updatedBy) throws Exception {
        seedInitialDataIfEmpty();
        PaymentSetting setting = settingRepository.findById(1).orElse(new PaymentSetting());
        setting.setId(1);
        if (upiId != null && !upiId.isBlank()) {
            setting.setUpiId(upiId);
        }
        if (payeeName != null && !payeeName.isBlank()) {
            setting.setPayeeName(payeeName);
        }
        setting.setUpdatedBy(updatedBy != null && !updatedBy.isBlank() ? updatedBy : "admin");
        setting.setUpdatedAt(LocalDateTime.now());
        settingRepository.save(setting);

        // Upload new QR image if provided
        if (file != null && !file.isEmpty()) {
            // Deactivate ALL existing payment_qr images
            List<GalleryImage> existingList = galleryImageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
            for (GalleryImage img : existingList) {
                if ("payment_qr".equalsIgnoreCase(img.getSectionKey())) {
                    img.setIsActive(false);
                    galleryImageRepository.save(img);
                }
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            GalleryImage newQr = new GalleryImage();
            newQr.setTitle("Payment QR Code");
            newQr.setDescription("Active Payment QR");
            newQr.setImageUrl("/uploads/gallery/" + fileName);
            newQr.setCategory("payment_qr");
            newQr.setSectionKey("payment_qr");
            newQr.setUploadedBy(setting.getUpdatedBy());
            newQr.setIsActive(true);
            galleryImageRepository.save(newQr);
        }

        return getPaymentSettingWithQr();
    }

    @Override
    @Transactional
    public PaymentSettingDTO deletePaymentQr(String updatedBy) throws Exception {
        List<GalleryImage> existingList = galleryImageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        for (GalleryImage img : existingList) {
            if ("payment_qr".equalsIgnoreCase(img.getSectionKey())) {
                img.setIsActive(false);
                galleryImageRepository.save(img);
            }
        }
        return getPaymentSettingWithQr();
    }

    @Override
    @Transactional
    public Payment createPayment(Integer memberId, BigDecimal amount, String membershipType,
                                  String paymentMode, String upiTxnId, MultipartFile file) throws Exception {
        return createPaymentWithDetails(memberId, "MEMBER", memberId, amount, membershipType, paymentMode, upiTxnId, file);
    }

    @Override
    @Transactional
    public Payment createPaymentWithDetails(Integer memberId, String registrationType, Integer registrationId,
                                          BigDecimal amount, String membershipType, String paymentMode,
                                          String upiTxnId, MultipartFile file) throws Exception {
        boolean isCash = "Cash".equalsIgnoreCase(paymentMode) || "कॅश".equalsIgnoreCase(paymentMode);
        if (!isCash && (upiTxnId == null || upiTxnId.trim().isEmpty())) {
            throw new IllegalArgumentException("UPI ट्रान्झॅक्शन आयडी आवश्यक आहे.");
        }

        seedInitialDataIfEmpty();

        Integer targetRegId = registrationId != null ? registrationId : memberId;
        String normalizedType = (registrationType != null && !registrationType.isBlank())
                ? registrationType.trim().toUpperCase()
                : "MEMBER";

        if (targetRegId == null) {
            throw new IllegalArgumentException("नोंदणी क्रमांक (ID) आवश्यक आहे.");
        }

        // Polymorphic validation: verify registration exists in the appropriate table before saving payment
        switch (normalizedType) {
            case "MEMBER":
                if (!memberRegistrationRepository.existsById(targetRegId)) {
                    throw new IllegalArgumentException("सभासद नोंदणी सापडली नाही (ID: " + targetRegId + ")");
                }
                break;
            case "MARRIAGE":
                if (!marriageRegistrationRepository.existsById(targetRegId)) {
                    throw new IllegalArgumentException("विवाह नोंदणी सापडली नाही (ID: " + targetRegId + ")");
                }
                break;
            case "SHIBIR":
                if (!shibirRegistrationRepository.existsById(targetRegId)) {
                    throw new IllegalArgumentException("शिबिर नोंदणी सापडली नाही (ID: " + targetRegId + ")");
                }
                break;
            case "DONATION":
                if (!donationRegistrationRepository.existsById(targetRegId)) {
                    throw new IllegalArgumentException("देणगी नोंदणी सापडली नाही (ID: " + targetRegId + ")");
                }
                break;
            default:
                if (!memberRegistrationRepository.existsById(targetRegId)
                        && !marriageRegistrationRepository.existsById(targetRegId)
                        && !shibirRegistrationRepository.existsById(targetRegId)
                        && !donationRegistrationRepository.existsById(targetRegId)) {
                    throw new IllegalArgumentException("नोंदणी माहिती सापडली नाही (प्रकार: " + normalizedType + ", ID: " + targetRegId + ")");
                }
                break;
        }

        BigDecimal actualAmount = amount;
        if (actualAmount == null || actualAmount.compareTo(BigDecimal.ZERO) <= 0) {
            String planCode = (membershipType != null && !membershipType.isBlank()) ? membershipType.trim() : "annual";
            MembershipPlan plan = planRepository.findByPlanCode(planCode).orElse(null);
            if (plan != null) {
                actualAmount = plan.getAmount();
            } else {
                actualAmount = new BigDecimal("100.00");
            }
        }

        String screenshotUrl = null;
        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            screenshotUrl = "/uploads/gallery/" + fileName;
        }

        Payment payment = new Payment();
        // memberId is only set for member registrations; set to null for other types to decouple from legacy member_registrations FK
        payment.setMemberId("MEMBER".equals(normalizedType) ? targetRegId : null);
        payment.setRegistrationType(normalizedType);
        payment.setRegistrationId(targetRegId);
        payment.setAmount(actualAmount);
        payment.setMembershipType(membershipType != null ? membershipType : "annual");
        payment.setPaymentMode(paymentMode != null ? paymentMode : (isCash ? "Cash" : "GPay"));
        payment.setUpiTxnId(upiTxnId != null ? upiTxnId.trim() : (isCash ? "CASH-" + System.currentTimeMillis() : ""));
        payment.setScreenshotUrl(screenshotUrl);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(isCash ? "पडताळलेले" : "सादर केले");

        return paymentRepository.save(payment);
    }

    @Override
    public List<PaymentDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAllByOrderByPaymentDateDesc();
        List<PaymentDTO> dtos = new ArrayList<>();

        for (Payment p : payments) {
            PaymentDTO dto = new PaymentDTO();
            dto.setId(p.getId());
            dto.setMemberId(p.getMemberId());
            dto.setRegistrationType(p.getRegistrationType());
            dto.setRegistrationId(p.getRegistrationId());
            dto.setAmount(p.getAmount());
            dto.setMembershipType(p.getMembershipType());
            dto.setPaymentMode(p.getPaymentMode());
            dto.setUpiTxnId(p.getUpiTxnId());
            dto.setScreenshotUrl(p.getScreenshotUrl());
            dto.setPaymentDate(p.getPaymentDate());
            dto.setStatus(p.getStatus());
            dto.setVerifiedBy(p.getVerifiedBy());
            dto.setVerifiedAt(p.getVerifiedAt());
            dto.setRejectionReason(p.getRejectionReason());

            Integer regId = p.getRegistrationId() != null ? p.getRegistrationId() : p.getMemberId();
            String regType = p.getRegistrationType() != null ? p.getRegistrationType().toUpperCase() : "";

            if (regId != null) {
                if ("MARRIAGE".equals(regType) || (p.getMembershipType() != null && p.getMembershipType().toLowerCase().contains("marriage"))) {
                    MarriageRegistration marriage = marriageRegistrationRepository.findById(regId).orElse(null);
                    if (marriage != null) {
                        dto.setMemberName(marriage.getFullName());
                        dto.setMemberMobile(marriage.getMobile());
                    }
                } else if ("SHIBIR".equals(regType) || (p.getMembershipType() != null && p.getMembershipType().toLowerCase().contains("shibir"))) {
                    ShibirRegistration shibir = shibirRegistrationRepository.findById(regId).orElse(null);
                    if (shibir != null) {
                        dto.setMemberName(shibir.getFullName());
                        dto.setMemberMobile(shibir.getMobile());
                    }
                } else if ("DONATION".equals(regType) || (p.getMembershipType() != null && p.getMembershipType().toLowerCase().contains("donation"))) {
                    DonationRegistration donation = donationRegistrationRepository.findById(regId).orElse(null);
                    if (donation != null) {
                        dto.setMemberName(donation.getFullName());
                        dto.setMemberMobile(donation.getMobile());
                    }
                } else {
                    MemberRegistration member = memberRegistrationRepository.findById(regId).orElse(null);
                    if (member != null) {
                        dto.setMemberName(member.getFullName());
                        dto.setMemberMobile(member.getMobile());
                    }
                }
            }

            dtos.add(dto);
        }

        return dtos;
    }

    @Override
    @Transactional
    public PaymentDTO updatePaymentStatus(Integer paymentId, String status, String verifiedBy, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("पेमेंट माहिती सापडली नाही"));

        payment.setStatus(status);
        payment.setVerifiedBy(verifiedBy != null && !verifiedBy.isBlank() ? verifiedBy : "admin");
        payment.setVerifiedAt(LocalDateTime.now());
        if ("नाकारलेले".equalsIgnoreCase(status)) {
            payment.setRejectionReason(reason);
        }

        Payment updated = paymentRepository.save(payment);

        // Also update registration status across polymorphic types
        Integer regId = updated.getRegistrationId() != null ? updated.getRegistrationId() : updated.getMemberId();
        String regType = updated.getRegistrationType() != null ? updated.getRegistrationType().toUpperCase() : "MEMBER";

        if (regId != null) {
            String appStatus = "पडताळलेले".equalsIgnoreCase(status) ? "APPROVED" : ("नाकारलेले".equalsIgnoreCase(status) ? "REJECTED" : "PENDING");
            if ("MARRIAGE".equals(regType) || (updated.getMembershipType() != null && updated.getMembershipType().toLowerCase().contains("marriage"))) {
                marriageRegistrationRepository.findById(regId).ifPresent(m -> {
                    m.setApprovalStatus(appStatus);
                    marriageRegistrationRepository.save(m);
                });
            } else if ("SHIBIR".equals(regType) || (updated.getMembershipType() != null && updated.getMembershipType().toLowerCase().contains("shibir"))) {
                shibirRegistrationRepository.findById(regId).ifPresent(s -> {
                    s.setApprovalStatus(appStatus);
                    shibirRegistrationRepository.save(s);
                });
            } else if ("DONATION".equals(regType) || (updated.getMembershipType() != null && updated.getMembershipType().toLowerCase().contains("donation"))) {
                donationRegistrationRepository.findById(regId).ifPresent(d -> {
                    d.setApprovalStatus(appStatus);
                    donationRegistrationRepository.save(d);
                });
            } else {
                memberRegistrationRepository.findById(regId).ifPresent(m -> {
                    m.setApprovalStatus(appStatus);
                    memberRegistrationRepository.save(m);
                });
            }
        }

        PaymentDTO dto = new PaymentDTO();
        dto.setId(updated.getId());
        dto.setMemberId(updated.getMemberId());
        dto.setRegistrationType(updated.getRegistrationType());
        dto.setRegistrationId(updated.getRegistrationId());
        dto.setAmount(updated.getAmount());
        dto.setMembershipType(updated.getMembershipType());
        dto.setPaymentMode(updated.getPaymentMode());
        dto.setUpiTxnId(updated.getUpiTxnId());
        dto.setScreenshotUrl(updated.getScreenshotUrl());
        dto.setPaymentDate(updated.getPaymentDate());
        dto.setStatus(updated.getStatus());
        dto.setVerifiedBy(updated.getVerifiedBy());
        dto.setVerifiedAt(updated.getVerifiedAt());
        dto.setRejectionReason(updated.getRejectionReason());

        if (regId != null) {
            if ("MARRIAGE".equals(regType)) {
                marriageRegistrationRepository.findById(regId).ifPresent(m -> {
                    dto.setMemberName(m.getFullName());
                    dto.setMemberMobile(m.getMobile());
                });
            } else if ("SHIBIR".equals(regType)) {
                shibirRegistrationRepository.findById(regId).ifPresent(s -> {
                    dto.setMemberName(s.getFullName());
                    dto.setMemberMobile(s.getMobile());
                });
            } else if ("DONATION".equals(regType)) {
                donationRegistrationRepository.findById(regId).ifPresent(d -> {
                    dto.setMemberName(d.getFullName());
                    dto.setMemberMobile(d.getMobile());
                });
            } else {
                memberRegistrationRepository.findById(regId).ifPresent(m -> {
                    dto.setMemberName(m.getFullName());
                    dto.setMemberMobile(m.getMobile());
                });
            }
        }

        return dto;
    }
}

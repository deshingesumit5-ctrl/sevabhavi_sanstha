package com.SevabhaviSanstha;

import com.SevabhaviSanstha.dto.PaymentDTO;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.entity.Payment;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.repository.MemberRegistrationRepository;
import com.SevabhaviSanstha.service.PaymentService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootTest
class PaymentPolymorphicIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MarriageRegistrationRepository marriageRegistrationRepository;

    @Autowired
    private MemberRegistrationRepository memberRegistrationRepository;

    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;

    @Test
    @Transactional
    void marriageAndMemberPaymentsSaveScreenshotsWithoutNullMemberIdError() throws Exception {
        List<MarriageRegistration> marriages = marriageRegistrationRepository.findAll();
        Assertions.assertFalse(marriages.isEmpty(), "Expected at least one marriage registration in DB");
        MarriageRegistration marriage = marriages.get(0);

        MockMultipartFile marriageScreenshot = new MockMultipartFile(
                "file", "marriage_test.png", "image/png", new byte[]{1, 2, 3, 4});

        Payment marriagePayment = paymentService.createPaymentWithDetails(
                marriage.getId(), "MARRIAGE", marriage.getId(),
                new BigDecimal("500.00"), "marriage", "GPay", "TXN-TEST-MAR", marriageScreenshot);

        Path marriageUploadedFile = null;
        try {
            Assertions.assertNotNull(marriagePayment.getId());
            Assertions.assertNull(marriagePayment.getMemberId());
            Assertions.assertEquals("MARRIAGE", marriagePayment.getRegistrationType());
            Assertions.assertEquals(marriage.getId(), marriagePayment.getRegistrationId());
            Assertions.assertNotNull(marriagePayment.getScreenshotUrl());
            Assertions.assertTrue(marriagePayment.getScreenshotUrl().startsWith("/uploads/gallery/"));

            String fileName = marriagePayment.getScreenshotUrl().replace("/uploads/gallery/", "");
            marriageUploadedFile = Paths.get(uploadDir).resolve(fileName);
            Assertions.assertTrue(Files.exists(marriageUploadedFile));

            List<PaymentDTO> allDtos = paymentService.getAllPayments();
            PaymentDTO matchedMarriage = allDtos.stream()
                    .filter(d -> marriagePayment.getId().equals(d.getId()))
                    .findFirst()
                    .orElse(null);
            Assertions.assertNotNull(matchedMarriage);
            Assertions.assertEquals(marriage.getFullName(), matchedMarriage.getMemberName());
            Assertions.assertEquals(marriage.getMobile(), matchedMarriage.getMemberMobile());
            Assertions.assertEquals(marriagePayment.getScreenshotUrl(), matchedMarriage.getScreenshotUrl());
        } finally {
            if (marriageUploadedFile != null) {
                Files.deleteIfExists(marriageUploadedFile);
            }
        }

        List<MemberRegistration> members = memberRegistrationRepository.findAll();
        if (!members.isEmpty()) {
            MemberRegistration member = members.get(0);
            MockMultipartFile memberScreenshot = new MockMultipartFile(
                    "file", "member_test.jpg", "image/jpeg", new byte[]{5, 6, 7, 8});

            Payment memberPayment = paymentService.createPaymentWithDetails(
                    member.getId(), "MEMBER", member.getId(),
                    new BigDecimal("100.00"), "annual", "UPI", "TXN-TEST-MEM", memberScreenshot);

            Path memberUploadedFile = null;
            try {
                Assertions.assertNotNull(memberPayment.getId());
                Assertions.assertEquals(member.getId(), memberPayment.getMemberId());
                Assertions.assertEquals("MEMBER", memberPayment.getRegistrationType());
                Assertions.assertNotNull(memberPayment.getScreenshotUrl());
                Assertions.assertTrue(memberPayment.getScreenshotUrl().startsWith("/uploads/gallery/"));

                String fileName = memberPayment.getScreenshotUrl().replace("/uploads/gallery/", "");
                memberUploadedFile = Paths.get(uploadDir).resolve(fileName);
                Assertions.assertTrue(Files.exists(memberUploadedFile));
            } finally {
                if (memberUploadedFile != null) {
                    Files.deleteIfExists(memberUploadedFile);
                }
            }
        }
    }
}

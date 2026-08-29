package com.SevabhaviSanstha;

import com.SevabhaviSanstha.entity.District;
import com.SevabhaviSanstha.entity.DonationPurpose;
import com.SevabhaviSanstha.entity.DonationRegistration;
import com.SevabhaviSanstha.entity.DonationType;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.entity.ShibirRegistration;
import com.SevabhaviSanstha.entity.State;
import com.SevabhaviSanstha.entity.Taluka;
import com.SevabhaviSanstha.repository.DonationRegistrationRepository;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.repository.MemberRegistrationRepository;
import com.SevabhaviSanstha.repository.ShibirRegistrationRepository;
import com.SevabhaviSanstha.service_impl.DonationRegistrationServiceImpl;
import com.SevabhaviSanstha.service_impl.MarriageRegistrationServiceImpl;
import com.SevabhaviSanstha.service_impl.MemberRegistrationServiceImpl;
import com.SevabhaviSanstha.service_impl.ShibirRegistrationServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public class PdfGenerationTest {

    @Mock
    private ShibirRegistrationRepository shibirRepo;

    @InjectMocks
    private ShibirRegistrationServiceImpl shibirService;

    @Mock
    private MemberRegistrationRepository memberRepo;

    @InjectMocks
    private MemberRegistrationServiceImpl memberService;

    @Mock
    private MarriageRegistrationRepository marriageRepo;

    @InjectMocks
    private MarriageRegistrationServiceImpl marriageService;

    @Mock
    private DonationRegistrationRepository donationRepo;

    @InjectMocks
    private DonationRegistrationServiceImpl donationService;

    @Test
    void testAllPdfGenerations() throws Exception {
        MockitoAnnotations.openMocks(this);
        File outDir = new File("target/test-output");
        outDir.mkdirs();

        // 1. Shibir PDF
        ShibirRegistration shibir = new ShibirRegistration();
        shibir.setId(9);
        shibir.setFullName("सुमित देशिंगे (Sumit Deshinge)");
        shibir.setShibirName("रक्तदान शिबिर");
        shibir.setShibirDate("2026-08-28");
        shibir.setShibirLocation("पुणे");
        shibir.setBirthDate(LocalDate.of(2000, 8, 19));
        shibir.setAge(26);
        shibir.setMobile("9876543210");
        shibir.setOccupation("विद्यार्थी (Student)");
        shibir.setEducation("पदवीधर (Graduate)");
        shibir.setFullAddress("दापोली, रत्नागिरी, महाराष्ट्र");
        shibir.setCityVillage("दापोली");
        shibir.setAmountPaid(new BigDecimal("200.00"));
        shibir.setPaymentMode("Cash");
        shibir.setPaymentStatus("PAID");
        shibir.setCreatedAt(LocalDateTime.now());

        State state = new State();
        state.setNameMr("महाराष्ट्र");
        District dist = new District();
        dist.setNameMr("रत्नागिरी");
        Taluka tal = new Taluka();
        tal.setNameMr("दापोली");
        shibir.setState(state);
        shibir.setDistrict(dist);
        shibir.setTaluka(tal);

        Mockito.when(shibirRepo.findById(9)).thenReturn(Optional.of(shibir));
        byte[] shibirPdf = shibirService.generateShibirFormPdf(9);
        Assertions.assertTrue(shibirPdf.length > 1000);
        try (FileOutputStream fos = new FileOutputStream(new File(outDir, "Sample_Shibir.pdf"))) {
            fos.write(shibirPdf);
        }

        // 2. Member PDF
        MemberRegistration member = new MemberRegistration();
        member.setId(1);
        member.setFullName("सुमित देशिंगे");
        member.setMemberType("lifetime");
        member.setBirthDate(LocalDate.of(1998, 5, 10));
        member.setGender("पुरुष");
        member.setBloodGroup("O+");
        member.setMaritalStatus("अविवाहित");
        member.setOccupation("इंजिनिअर");
        member.setEducation("B.Tech");
        member.setMobile("9876543210");
        member.setCurrentAddress("पुणे, महाराष्ट्र");
        member.setPincode("411038");
        member.setState(state);
        member.setDistrict(dist);
        member.setTaluka(tal);
        member.setCreatedAt(LocalDateTime.now());

        Mockito.when(memberRepo.findById(1)).thenReturn(Optional.of(member));
        byte[] memberPdf = memberService.generateMemberFormPdf(1);
        Assertions.assertTrue(memberPdf.length > 1000);
        try (FileOutputStream fos = new FileOutputStream(new File(outDir, "Sample_Member.pdf"))) {
            fos.write(memberPdf);
        }

        // 3. Marriage PDF
        MarriageRegistration marriage = new MarriageRegistration();
        marriage.setId(1);
        marriage.setFullName("सुमित देशिंगे");
        marriage.setProfileType("groom");
        marriage.setBirthDate(LocalDate.of(1998, 5, 10));
        marriage.setHeight("5 ft 9 in");
        marriage.setBloodGroup("O+");
        marriage.setMaritalStatus("अविवाहित");
        marriage.setReligion("हिंदू");
        marriage.setCaste("मराठा");
        marriage.setGotra("कश्यप");
        marriage.setManglik("no");
        marriage.setCity("पुणे");
        marriage.setMobile("9876543210");
        marriage.setParentMobile("9876543211");
        marriage.setAboutSelf("सॉफ्टवेअर इंजिनिअर");
        marriage.setExpectations("सुशिक्षित व सुसंस्कृत");
        marriage.setEducationLevel("पदव्युत्तर");
        marriage.setDegreeName("M.Tech");
        marriage.setPassingYear("2021");
        marriage.setOccupationType("नोकरी");
        marriage.setAnnualIncome("12 LPA");
        marriage.setFatherName("आनंद देशिंगे");
        marriage.setFatherOccupation("व्यवसाय");
        marriage.setMotherName("सुजाता देशिंगे");
        marriage.setState(state);
        marriage.setDistrict(dist);
        marriage.setCreatedAt(LocalDateTime.now());

        Mockito.when(marriageRepo.findById(1)).thenReturn(Optional.of(marriage));
        byte[] marriagePdf = marriageService.generateFormPdf(1);
        Assertions.assertTrue(marriagePdf.length > 1000);
        try (FileOutputStream fos = new FileOutputStream(new File(outDir, "Sample_Marriage.pdf"))) {
            fos.write(marriagePdf);
        }

        // 4. Donation PDF
        DonationRegistration donation = new DonationRegistration();
        donation.setId(1);
        donation.setReceiptNumber("DON-2026-00001");
        donation.setFullName("सुमित देशिंगे");
        donation.setMobile("9876543210");
        donation.setAddress("दापोली, पुणे");
        donation.setCity("पुणे");
        donation.setPincode("411038");
        donation.setState(state);
        donation.setDistrict(dist);
        donation.setAmount(new BigDecimal("5000.00"));
        donation.setPaymentMethod("UPI");
        donation.setTransactionId("UPI123456789");
        donation.setCreatedAt(LocalDateTime.now());

        DonationType dType = new DonationType();
        dType.setNameMr("एकरकमी देणगी");
        donation.setDonationType(dType);

        DonationPurpose dPurpose = new DonationPurpose();
        dPurpose.setNameMr("शैक्षणिक मदत निधी");
        donation.setDonationPurpose(dPurpose);

        Mockito.when(donationRepo.findByReceiptNumber("DON-2026-00001")).thenReturn(Optional.of(donation));
        byte[] donationPdf = donationService.generateReceiptPdf("DON-2026-00001");
        Assertions.assertTrue(donationPdf.length > 1000);
        try (FileOutputStream fos = new FileOutputStream(new File(outDir, "Sample_Donation.pdf"))) {
            fos.write(donationPdf);
        }
    }
}

package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.dto.DonationRequestDTO;
import com.SevabhaviSanstha.dto.PaymentVerificationRequest;
import com.SevabhaviSanstha.entity.DonationPurpose;
import com.SevabhaviSanstha.entity.DonationRegistration;
import com.SevabhaviSanstha.entity.DonationType;
import com.SevabhaviSanstha.repository.DistrictRepository;
import com.SevabhaviSanstha.repository.DonationPurposeRepository;
import com.SevabhaviSanstha.repository.DonationRegistrationRepository;
import com.SevabhaviSanstha.repository.DonationTypeRepository;
import com.SevabhaviSanstha.repository.StateRepository;
import com.SevabhaviSanstha.repository.TalukaRepository;
import com.SevabhaviSanstha.service.DonationRegistrationService;
import com.SevabhaviSanstha.util.PdfFontUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class DonationRegistrationServiceImpl implements DonationRegistrationService {

    @Value("${org.name:दापोली मंडणगड सेवाभावी संस्था, पुणे}")
    private String orgName;

    @Value("${org.tagline:— जन सेवा हीच ईश्वर सेवा —}")
    private String orgTagline;

    @Value("${org.80g-no:AAATD1234F20261}")
    private String org80gNo;

    @Value("${org.12a-no:AAATD1234FE20260}")
    private String org12aNo;

    @Value("${org.pan:AAATD1234F}")
    private String orgPan;

    @Autowired
    private DonationTypeRepository donationTypeRepository;

    @Autowired
    private DonationPurposeRepository donationPurposeRepository;

    @Autowired
    private DonationRegistrationRepository donationRegistrationRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private TalukaRepository talukaRepository;

    @Override
    public List<DonationType> getAllDonationTypes() {
        return donationTypeRepository.findByIsActiveTrue();
    }

    @Override
    public List<DonationPurpose> getAllDonationPurposes() {
        return donationPurposeRepository.findByIsActiveTrue();
    }

    @Override
    public DonationRegistration saveDraft(DonationRequestDTO dto) {
        DonationRegistration entity;

        if (dto.getReceiptNumber() != null && !dto.getReceiptNumber().isBlank()) {
            Optional<DonationRegistration> existing = donationRegistrationRepository.findByReceiptNumber(dto.getReceiptNumber());
            entity = existing.orElseGet(DonationRegistration::new);
        } else {
            entity = new DonationRegistration();
            entity.setReceiptNumber(generateReceiptNumber());
        }

        mapDtoToEntity(dto, entity);
        entity.setPaymentStatus("DRAFT");
        if (dto.getDraftStep() != null) {
            entity.setDraftStep(dto.getDraftStep());
        }

        return donationRegistrationRepository.save(entity);
    }

    @Override
    public DonationRegistration submitDonation(DonationRequestDTO dto) {
        DonationRegistration entity;

        if (dto.getReceiptNumber() != null && !dto.getReceiptNumber().isBlank()) {
            Optional<DonationRegistration> existing = donationRegistrationRepository.findByReceiptNumber(dto.getReceiptNumber());
            entity = existing.orElseGet(DonationRegistration::new);
        } else {
            entity = new DonationRegistration();
            entity.setReceiptNumber(generateReceiptNumber());
        }

        mapDtoToEntity(dto, entity);
        if (entity.getPaymentStatus() == null || "DRAFT".equals(entity.getPaymentStatus())) {
            entity.setPaymentStatus("SUCCESS".equalsIgnoreCase(dto.getPaymentStatus()) ? "SUCCESS" : "PENDING");
        }
        entity.setPaymentDate(LocalDateTime.now());
        entity.setDraftStep(4);

        return donationRegistrationRepository.save(entity);
    }

    @Override
    public DonationRegistration verifyPayment(PaymentVerificationRequest request) {
        if (request.getReceiptNumber() == null) {
            throw new IllegalArgumentException("पावती क्रमांक आवश्यक आहे.");
        }

        DonationRegistration donation = donationRegistrationRepository.findByReceiptNumber(request.getReceiptNumber())
                .orElseThrow(() -> new IllegalArgumentException("देणगी नोंदणी सापडली नाही: " + request.getReceiptNumber()));

        if (request.getGatewayReference() != null) {
            donation.setGatewayReference(request.getGatewayReference());
        }
        if (request.getTransactionId() != null) {
            donation.setTransactionId(request.getTransactionId());
        }
        if (request.getPaymentMethod() != null) {
            donation.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getPaymentStatus() != null) {
            donation.setPaymentStatus(request.getPaymentStatus());
        } else {
            donation.setPaymentStatus("SUCCESS");
        }

        donation.setPaymentDate(LocalDateTime.now());
        return donationRegistrationRepository.save(donation);
    }

    @Override
    public DonationRegistration getByReceiptNumber(String receiptNumber) {
        return donationRegistrationRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new IllegalArgumentException("पावती क्रमांक सापडला नाही: " + receiptNumber));
    }

    @Override
    public List<DonationRegistration> getAllDonations() {
        return donationRegistrationRepository.findAll();
    }

    @Override
    public DonationRegistration updateApprovalStatus(Integer id, String status) {
        DonationRegistration donation = donationRegistrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("देणगी नोंदणी ID सापडला नाही: " + id));
        donation.setApprovalStatus(status);
        return donationRegistrationRepository.save(donation);
    }

    @Override
    public byte[] generateReceiptPdf(String receiptNumber) {
        DonationRegistration donation = getByReceiptNumber(receiptNumber);
        if (donation == null) {
            throw new IllegalArgumentException("पावती क्रमांक सापडला नाही: " + receiptNumber);
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Font Initialization for crisp Devanagari (Marathi) text support
            BaseFont regularDevanagariBase = PdfFontUtil.loadDevanagariBaseFont(false);
            BaseFont boldDevanagariBase = PdfFontUtil.loadDevanagariBaseFont(true);

            Color textBlack = new Color(0, 0, 0);                                           // #000000 Pure Black for maximum contrast
            Font titleFont = new Font(boldDevanagariBase, 17, Font.BOLD, new Color(154, 52, 18));          // Rich Amber/Brown #9a3412
            Font taglineFont = new Font(boldDevanagariBase, 11, Font.BOLD, new Color(120, 53, 15));        // Deep Amber #78350f
            Font regInfoFont = new Font(boldDevanagariBase, 10, Font.BOLD, textBlack);                    // Clear Dark Reg Info
            Font sectionHeaderFont = new Font(boldDevanagariBase, 13, Font.BOLD, new Color(154, 52, 18));  // #9a3412
            Font labelFont = new Font(boldDevanagariBase, 11, Font.BOLD, textBlack);                        // Deep Pure Black
            Font valueFont = new Font(regularDevanagariBase, 10.5f, Font.NORMAL, textBlack);                // Sharp Pure Black
            Font amountFont = new Font(boldDevanagariBase, 14, Font.BOLD, new Color(154, 52, 18));
            Font footerFont = new Font(boldDevanagariBase, 10, Font.BOLD, textBlack);                       // Clear readable footer

            // Main Outer Card/Box (Table with 1 Cell)
            PdfPTable outerBox = new PdfPTable(1);
            outerBox.setWidthPercentage(100);

            PdfPCell boxCell = new PdfPCell();
            boxCell.setPadding(20);
            boxCell.setBackgroundColor(new Color(255, 253, 250)); // #fffdfa
            boxCell.setBorderColor(new Color(217, 119, 6));       // #d97706
            boxCell.setBorderWidth(2);

            String cleanOrgName = getSanitizedOrgName();
            String cleanOrgTagline = getSanitizedOrgTagline();

            // --- Header Section ---
            Image imgOrg = PdfFontUtil.createDevanagariImage(cleanOrgName, 17, true, new Color(196, 93, 20));
            imgOrg.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgOrg);

            Image imgTagline = PdfFontUtil.createDevanagariImage(cleanOrgTagline, 11, true, new Color(217, 119, 6));
            imgTagline.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgTagline);

            String regInfoStr = "80G No: " + org80gNo + "  |  12A No: " + org12aNo + "  |  PAN: " + orgPan;
            Image imgRegInfo = PdfFontUtil.createDevanagariImage(regInfoStr, 9.5f, true, new Color(75, 85, 99));
            imgRegInfo.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgRegInfo);

            // Separator Line
            LineSeparator line = new LineSeparator(1f, 100f, new Color(245, 158, 11), Element.ALIGN_CENTER, -2);
            boxCell.addElement(line);

            // Receipt Header Title
            Image imgTitle = PdfFontUtil.createDevanagariImage("अधिकृत देणगी पावती (Donation Receipt)", 14, true, new Color(180, 83, 9));
            imgTitle.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgTitle);

            // --- Details Table ---
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[]{35f, 65f});
            detailsTable.setSpacingAfter(15);

            String formattedDate = donation.getCreatedAt() != null
                    ? donation.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a"))
                    : LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a"));

            String typeName = donation.getDonationType() != null ? donation.getDonationType().getNameMr() : "एकरकमी";
            String purposeName = donation.getDonationPurpose() != null ? donation.getDonationPurpose().getNameMr() : "सर्वसाधारण निधी";

            // Anonymous check per requirement: If isAnonymous is true, show donor name as "अनामिक देणगीदार"
            String donorName = Boolean.TRUE.equals(donation.getIsAnonymous())
                    ? "अनामिक देणगीदार"
                    : (donation.getFullName() != null ? donation.getFullName() : "-");

            // Format address
            StringBuilder fullAddr = new StringBuilder();
            if (donation.getAddress() != null && !donation.getAddress().isBlank()) fullAddr.append(donation.getAddress());
            if (donation.getCity() != null && !donation.getCity().isBlank()) {
                if (fullAddr.length() > 0) fullAddr.append(", ");
                fullAddr.append(donation.getCity());
            }
            if (donation.getDistrict() != null && donation.getDistrict().getNameMr() != null) {
                if (fullAddr.length() > 0) fullAddr.append(", ");
                fullAddr.append(donation.getDistrict().getNameMr());
            }
            if (donation.getState() != null && donation.getState().getNameMr() != null) {
                if (fullAddr.length() > 0) fullAddr.append(", ");
                fullAddr.append(donation.getState().getNameMr());
            }
            if (donation.getPincode() != null && !donation.getPincode().isBlank()) {
                if (fullAddr.length() > 0) fullAddr.append(" - ");
                fullAddr.append(donation.getPincode());
            }

            addDetailRow(detailsTable, "पावती क्रमांक:", donation.getReceiptNumber(), labelFont, valueFont, true);
            addDetailRow(detailsTable, "तारीख व वेळ:", formattedDate, labelFont, valueFont, false);
            addDetailRow(detailsTable, "देणगीदाराचे नाव:", donorName, labelFont, valueFont, true);

            if (donation.getMobile() != null && !donation.getMobile().isBlank()) {
                addDetailRow(detailsTable, "मोबाईल नंबर:", donation.getMobile(), labelFont, valueFont, false);
            }
            if (donation.getEmail() != null && !donation.getEmail().isBlank()) {
                addDetailRow(detailsTable, "ईमेल:", donation.getEmail(), labelFont, valueFont, false);
            }
            if (fullAddr.length() > 0) {
                addDetailRow(detailsTable, "पत्ता:", fullAddr.toString(), labelFont, valueFont, false);
            }

            addDetailRow(detailsTable, "देणगी प्रकार:", typeName, labelFont, valueFont, false);
            addDetailRow(detailsTable, "निधीचा उद्देश:", purposeName, labelFont, valueFont, false);

            if (Boolean.TRUE.equals(donation.getInMemoryOfToggle()) && donation.getInMemoryOfName() != null && !donation.getInMemoryOfName().isBlank()) {
                addDetailRow(detailsTable, "स्मरणार्थ/सन्मानार्थ:", donation.getInMemoryOfName(), labelFont, valueFont, false);
            }

            addDetailRow(detailsTable, "पेमेंट पद्धत:", donation.getPaymentMethod() != null ? donation.getPaymentMethod() : "UPI", labelFont, valueFont, false);

            if (donation.getTransactionId() != null && !donation.getTransactionId().isBlank()) {
                addDetailRow(detailsTable, "ट्रान्सॅक्शन / UTR No:", donation.getTransactionId(), labelFont, valueFont, false);
            }

            boxCell.addElement(detailsTable);

            // --- Amount Highlight Box ---
            PdfPTable amountTable = new PdfPTable(1);
            amountTable.setWidthPercentage(100);
            String amtText = "प्राप्त देणगी रक्कम:  ₹ " + (donation.getAmount() != null ? donation.getAmount() : "0.00");
            Image imgAmt = PdfFontUtil.createDevanagariImage(amtText, 14, true, new Color(180, 83, 9));
            PdfPCell amountCell = new PdfPCell(imgAmt);
            amountCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            amountCell.setPadding(10);
            amountCell.setBackgroundColor(new Color(254, 243, 199)); // #fef3c7
            amountCell.setBorderColor(new Color(252, 211, 77));    // #fcd34d
            amountCell.setBorderWidth(1);
            amountTable.addCell(amountCell);
            amountTable.setSpacingAfter(20);

            boxCell.addElement(amountTable);

            // --- Footer ---
            Image imgFooterMsg = PdfFontUtil.createDevanagariImage("आपल्या बहुमूल्य योगदानाबद्दल " + cleanOrgName + " आपले मनःपूर्वक आभार मानत आहे.", 10.5f, false, Color.BLACK);
            imgFooterMsg.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgFooterMsg);

            Image img80g = PdfFontUtil.createDevanagariImage("आयकर अधिनियम 1961 च्या कलम 80G अंतर्गत देणगीस कर सवलत अनुज्ञेय आहे.", 9, false, new Color(107, 114, 128));
            img80g.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(img80g);

            Image imgAuto = PdfFontUtil.createDevanagariImage("ही संगणकीकृत पावती असल्याने स्वाक्षरीची गरज नाही.", 9, false, new Color(107, 114, 128));
            imgAuto.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgAuto);

            outerBox.addCell(boxCell);
            document.add(outerBox);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
    }

    private String getSanitizedOrgName() {
        return sanitizeMarathiText(orgName, "दापोली मंडणगड सेवाभावी संस्था, पुणे");
    }

    private String getSanitizedOrgTagline() {
        return sanitizeMarathiText(orgTagline, "— जन सेवा हीच ईश्वर सेवा —");
    }

    private String sanitizeMarathiText(String input, String fallback) {
        if (input == null || input.isBlank()) {
            return fallback;
        }
        if (input.contains("à¤") || input.contains("à¥") || input.contains("Ã") || input.contains("à")) {
            try {
                String fixed = new String(input.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
                if (!fixed.contains("à")) {
                    return fixed;
                }
            } catch (Exception ignored) {
            }
            return fallback;
        }
        return input;
    }

    private void addDetailRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, boolean isBoldValue) {
        String lblVal = label != null ? label : "";
        Image imgLabel = PdfFontUtil.createDevanagariImage(lblVal, labelFont.getSize(), labelFont.isBold(), labelFont.getColor() != null ? labelFont.getColor() : Color.BLACK);
        PdfPCell cellLabel = new PdfPCell(imgLabel);
        cellLabel.setPadding(6);
        cellLabel.setBorderColor(new Color(254, 226, 226)); // #fee2e2
        cellLabel.setBorderWidthBottom(1);
        cellLabel.setBorderWidthTop(0);
        cellLabel.setBorderWidthLeft(0);
        cellLabel.setBorderWidthRight(0);
        table.addCell(cellLabel);

        String txtVal = value != null && !value.isBlank() ? value : "-";
        Font valFontToUse = isBoldValue ? new Font(labelFont.getBaseFont(), labelFont.getSize(), Font.BOLD, labelFont.getColor()) : valueFont;
        Color valColor = valFontToUse.getColor() != null ? valFontToUse.getColor() : Color.BLACK;
        Image imgVal = PdfFontUtil.createDevanagariImage(txtVal, valFontToUse.getSize(), valFontToUse.isBold(), valColor);
        PdfPCell cellValue = new PdfPCell(imgVal);
        cellValue.setPadding(6);
        cellValue.setBorderColor(new Color(254, 226, 226));
        cellValue.setBorderWidthBottom(1);
        cellValue.setBorderWidthTop(0);
        cellValue.setBorderWidthLeft(0);
        cellValue.setBorderWidthRight(0);
        table.addCell(cellValue);
    }

    private synchronized String generateReceiptNumber() {
        int currentYear = LocalDateTime.now().getYear();
        Integer maxId = donationRegistrationRepository.findMaxId();
        int nextId = (maxId == null ? 0 : maxId) + 1;
        return String.format("DON-%d-%05d", currentYear, nextId);
    }

    private void mapDtoToEntity(DonationRequestDTO dto, DonationRegistration entity) {
        if (dto.getFullName() != null) entity.setFullName(dto.getFullName());
        if (dto.getMobile() != null) entity.setMobile(dto.getMobile());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getBirthDate() != null) entity.setBirthDate(dto.getBirthDate());
        if (dto.getGender() != null) entity.setGender(dto.getGender());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
        if (dto.getCity() != null) entity.setCity(dto.getCity());
        if (dto.getPincode() != null) entity.setPincode(dto.getPincode());

        if (dto.getStateId() != null) {
            stateRepository.findById(dto.getStateId()).ifPresent(entity::setState);
        }
        if (dto.getDistrictId() != null) {
            districtRepository.findById(dto.getDistrictId()).ifPresent(entity::setDistrict);
        }
        if (dto.getTalukaId() != null) {
            talukaRepository.findById(dto.getTalukaId()).ifPresent(entity::setTaluka);
        }

        if (dto.getDonationTypeId() != null) {
            donationTypeRepository.findById(dto.getDonationTypeId()).ifPresent(entity::setDonationType);
        }
        if (entity.getDonationType() == null) {
            donationTypeRepository.findAll().stream().findFirst().ifPresent(entity::setDonationType);
        }

        if (dto.getDonationPurposeId() != null) {
            donationPurposeRepository.findById(dto.getDonationPurposeId()).ifPresent(entity::setDonationPurpose);
        }
        if (entity.getDonationPurpose() == null) {
            donationPurposeRepository.findAll().stream().findFirst().ifPresent(entity::setDonationPurpose);
        }

        if (dto.getInMemoryOfToggle() != null) entity.setInMemoryOfToggle(dto.getInMemoryOfToggle());
        if (dto.getInMemoryOfName() != null) entity.setInMemoryOfName(dto.getInMemoryOfName());
        if (dto.getIsAnonymous() != null) entity.setIsAnonymous(dto.getIsAnonymous());
        if (dto.getMessage() != null) entity.setMessage(dto.getMessage());

        if (dto.getAmount() != null) entity.setAmount(dto.getAmount());
        if (dto.getCurrency() != null) entity.setCurrency(dto.getCurrency());

        if (dto.getPaymentMethod() != null) {
            entity.setPaymentMethod(dto.getPaymentMethod());
        } else if (entity.getPaymentMethod() == null) {
            entity.setPaymentMethod("UPI");
        }
        if (dto.getPaymentStatus() != null) entity.setPaymentStatus(dto.getPaymentStatus());
        if (dto.getTransactionId() != null) entity.setTransactionId(dto.getTransactionId());
        if (dto.getGatewayReference() != null) entity.setGatewayReference(dto.getGatewayReference());
    }
}

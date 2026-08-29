package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.ShibirMaster;
import com.SevabhaviSanstha.entity.ShibirRegistration;
import com.SevabhaviSanstha.repository.DistrictRepository;
import com.SevabhaviSanstha.repository.ShibirMasterRepository;
import com.SevabhaviSanstha.repository.ShibirRegistrationRepository;
import com.SevabhaviSanstha.repository.StateRepository;
import com.SevabhaviSanstha.repository.TalukaRepository;
import com.SevabhaviSanstha.service.ShibirRegistrationService;
import com.SevabhaviSanstha.util.PdfFontUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ShibirRegistrationServiceImpl implements ShibirRegistrationService {

    @Autowired
    private ShibirRegistrationRepository shibirRegistrationRepository;

    @Autowired
    private ShibirMasterRepository shibirMasterRepository;

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private TalukaRepository talukaRepository;

    @Override
    public ShibirRegistration registerShibir(ShibirRegistration registration) {
        if (registration.getApprovalStatus() == null) {
            registration.setApprovalStatus("PENDING");
        }

        if (registration.getState() != null && registration.getState().getId() != null) {
            stateRepository.findById(registration.getState().getId()).ifPresent(registration::setState);
        }
        if (registration.getDistrict() != null && registration.getDistrict().getId() != null) {
            districtRepository.findById(registration.getDistrict().getId()).ifPresent(registration::setDistrict);
        }
        if (registration.getTaluka() != null && registration.getTaluka().getId() != null) {
            talukaRepository.findById(registration.getTaluka().getId()).ifPresent(registration::setTaluka);
        }

        return shibirRegistrationRepository.save(registration);
    }

    @Override
    public List<ShibirRegistration> getAllRegistrations() {
        return shibirRegistrationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public ShibirRegistration updateApprovalStatus(Integer id, String status) {
        ShibirRegistration reg = getById(id);
        reg.setApprovalStatus(status);
        return shibirRegistrationRepository.save(reg);
    }

    @Override
    public List<ShibirMaster> getAllShibirMasters() {
        return shibirMasterRepository.findByIsActiveTrue();
    }

    @Override
    public ShibirMaster createShibirMaster(ShibirMaster master) {
        if (master.getShibirName() == null || master.getShibirName().trim().isEmpty()) {
            throw new IllegalArgumentException("शिबिराचे नाव आवश्यक आहे (Shibir name is required)");
        }
        if (master.getShibirDate() == null || master.getShibirDate().trim().isEmpty()) {
            throw new IllegalArgumentException("शिबिर तारीख आवश्यक आहे (Shibir date is required)");
        }
        if (master.getShibirLocation() == null || master.getShibirLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("स्थळ आवश्यक आहे (Location is required)");
        }
        master.setIsActive(true);
        return shibirMasterRepository.save(master);
    }

    @Override
    public void deleteShibirMaster(Integer id) {
        ShibirMaster master = shibirMasterRepository.findById(id).orElse(null);
        if (master != null) {
            master.setIsActive(false);
            shibirMasterRepository.save(master);
        }
    }

    @Override
    public ShibirRegistration getById(Integer id) {
        return shibirRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("शिबिर नोंदणी सापडली नाही (ID: " + id + ")"));
    }

    @Override
    public byte[] generateShibirFormPdf(Integer id) {
        ShibirRegistration reg = getById(id);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 28, 28, 28, 28);
            PdfWriter.getInstance(document, baos);
            document.open();

            BaseFont regularBase = PdfFontUtil.loadDevanagariBaseFont(false);
            BaseFont boldBase = PdfFontUtil.loadDevanagariBaseFont(true);

            Color saffronDark = new Color(196, 93, 20);     // #c45d14
            Color saffronMain = new Color(232, 121, 44);    // #E8792C
            Color sectionBg = new Color(255, 248, 240);      // #FFF8F0
            Color textBlack = new Color(0, 0, 0);            // #000000 Pure Black for maximum contrast
            Color lightBorder = new Color(254, 215, 170);    // #fed7aa

            Font orgTitleFont = new Font(boldBase, 17, Font.BOLD, saffronDark);
            Font taglineFont = new Font(boldBase, 11, Font.BOLD, saffronMain);
            Font subHeaderFont = new Font(boldBase, 12.5f, Font.BOLD, textBlack);
            Font contactFont = new Font(boldBase, 10, Font.BOLD, textBlack);
            Font metaFont = new Font(boldBase, 10.5f, Font.BOLD, textBlack);
            Font sectionTitleFont = new Font(boldBase, 12, Font.BOLD, saffronDark);
            Font labelFont = new Font(boldBase, 11, Font.BOLD, textBlack);
            Font valueFont = new Font(regularBase, 10.5f, Font.NORMAL, textBlack);
            Font signFont = new Font(boldBase, 10.5f, Font.BOLD, textBlack);

            PdfPTable outerBox = new PdfPTable(1);
            outerBox.setWidthPercentage(100);

            PdfPCell boxCell = new PdfPCell();
            boxCell.setPadding(12);
            boxCell.setBackgroundColor(new Color(255, 255, 255));
            boxCell.setBorderColor(saffronMain);
            boxCell.setBorderWidth(2);

            // 1. Header Section
            Image imgOrg = PdfFontUtil.createDevanagariImage("दापोली मंडणगड सेवाभावी संस्था, पुणे", 17, true, saffronDark);
            imgOrg.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgOrg);

            Image imgTagline = PdfFontUtil.createDevanagariImage("॥ जनसेवा हीच ईश्वरसेवा ॥", 11, true, saffronMain);
            imgTagline.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgTagline);

            Image imgSub = PdfFontUtil.createDevanagariImage("शिबिर नोंदणी अर्ज (Official Shibir Registration Form)", 12.5f, true, textBlack);
            imgSub.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgSub);

            Image imgContact = PdfFontUtil.createDevanagariImage("नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com", 10, true, textBlack);
            imgContact.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgContact);

            LineSeparator line = new LineSeparator(1.5f, 100f, saffronMain, Element.ALIGN_CENTER, -2);
            boxCell.addElement(line);

            // 2. Metadata Bar (ID, Shibir Name, Date)
            PdfPTable metaTable = new PdfPTable(3);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingBefore(6);
            metaTable.setSpacingAfter(8);

            String dateStr = reg.getCreatedAt() != null
                    ? reg.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            addMetaCell(metaTable, "नोंदणी क्रमांक:", "SHIBIR-" + reg.getId(), metaFont, saffronDark);
            addMetaCell(metaTable, "शिबिर नाव:", reg.getShibirName() != null ? reg.getShibirName() : "-", metaFont, saffronDark);
            addMetaCell(metaTable, "दिनांक:", dateStr, metaFont, textBlack);
            boxCell.addElement(metaTable);

            // 3. Section 1: शिबिर तपशील (Shibir Details)
            addSectionHeader(boxCell, "१. शिबिर तपशील (Shibir Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec1 = new PdfPTable(4);
            sec1.setWidthPercentage(100);
            sec1.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec1.setSpacingAfter(6);

            addGridRow(sec1, "निवडलेले शिबिर:", reg.getShibirName(), "शिबिर तारीख:", reg.getShibirDate() != null ? reg.getShibirDate() : "-", labelFont, valueFont, lightBorder);
            addGridFullRow(sec1, "शिबिर ठिकाण:", reg.getShibirLocation() != null ? reg.getShibirLocation() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec1);

            // 4. Section 2: शिबिरार्थी वैयक्तिक माहिती (Personal Details)
            addSectionHeader(boxCell, "२. शिबिरार्थी वैयक्तिक माहिती (Personal Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec2 = new PdfPTable(4);
            sec2.setWidthPercentage(100);
            sec2.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec2.setSpacingAfter(6);

            String ageDisplay = (reg.getAge() != null ? reg.getAge() + " वर्षे" : "-");
            addGridRow(sec2, "पूर्ण नाव:", reg.getFullName(), "जन्म तारीख / वय:", (reg.getBirthDate() != null ? reg.getBirthDate().toString() : "-") + " (" + ageDisplay + ")", labelFont, valueFont, lightBorder);
            addGridRow(sec2, "मोबाईल:", reg.getMobile(), "नातेवाईक मोबाईल:", reg.getRelativeMobile() != null ? reg.getRelativeMobile() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec2, "व्यवसाय:", reg.getOccupation() != null ? reg.getOccupation() : "-", "शिक्षण:", reg.getEducation() != null ? reg.getEducation() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec2);

            // 5. Section 3: पत्ता व रहिवासी माहिती (Address Details)
            addSectionHeader(boxCell, "३. पत्ता व रहिवासी माहिती (Address Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec3 = new PdfPTable(4);
            sec3.setWidthPercentage(100);
            sec3.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec3.setSpacingAfter(6);

            String talukaDist = (reg.getTaluka() != null ? reg.getTaluka().getNameMr() + ", " : "")
                    + (reg.getDistrict() != null ? reg.getDistrict().getNameMr() + ", " : "")
                    + (reg.getState() != null ? reg.getState().getNameMr() : "");

            addGridRow(sec3, "तालुका / जिल्हा / राज्य:", talukaDist, "शहर / गाव:", reg.getCityVillage() != null ? reg.getCityVillage() : "-", labelFont, valueFont, lightBorder);
            addGridFullRow(sec3, "संपूर्ण पत्ता:", reg.getFullAddress(), labelFont, valueFont, lightBorder);
            boxCell.addElement(sec3);

            // 6. Section 4: पूर्व सहभाग व विशेष माहिती (Past Participation & Special Info)
            addSectionHeader(boxCell, "४. पूर्व सहभाग व विशेष माहिती (Past Participation & Special Info)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec4 = new PdfPTable(4);
            sec4.setWidthPercentage(100);
            sec4.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec4.setSpacingAfter(6);

            String participatedStr = Boolean.TRUE.equals(reg.getParticipatedEarlier()) ? "होय (" + (reg.getPreviousEventName() != null ? reg.getPreviousEventName() : "") + ")" : "नाही";
            Image imgPartLabel = PdfFontUtil.createDevanagariImage("यापूर्वी सहभाग घेतला आहे का?", labelFont.getSize(), true, textBlack, 230f);
            PdfPCell cellPartLabel = new PdfPCell(imgPartLabel);
            cellPartLabel.setColspan(2);
            cellPartLabel.setPadding(4);
            cellPartLabel.setBackgroundColor(new Color(255, 253, 250));
            cellPartLabel.setBorderColor(lightBorder);
            cellPartLabel.setBorderWidth(0.5f);
            sec4.addCell(cellPartLabel);

            Image imgPartVal = PdfFontUtil.createDevanagariImage(participatedStr, valueFont.getSize(), false, textBlack, 230f);
            PdfPCell cellPartVal = new PdfPCell(imgPartVal);
            cellPartVal.setColspan(2);
            cellPartVal.setPadding(4);
            cellPartVal.setBorderColor(lightBorder);
            cellPartVal.setBorderWidth(0.5f);
            sec4.addCell(cellPartVal);
            if (reg.getSpecialInfo() != null && !reg.getSpecialInfo().isBlank()) {
                addGridFullRow(sec4, "विशेष माहिती / वैद्यकीय सूचना:", reg.getSpecialInfo(), labelFont, valueFont, lightBorder);
            }
            boxCell.addElement(sec4);

            // 7. Section 5: नोंदणी व शुल्क तपशील (Registration & Fee)
            addSectionHeader(boxCell, "५. नोंदणी व शुल्क तपशील (Registration & Fee)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec5 = new PdfPTable(4);
            sec5.setWidthPercentage(100);
            sec5.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec5.setSpacingAfter(10);

            String payMode = reg.getPaymentMode() != null ? reg.getPaymentMode() : "मोफत (Free)";
            String amtStr = reg.getAmountPaid() != null ? "₹ " + reg.getAmountPaid() : "₹ ०.००";
            addGridRow(sec5, "पेमेंट मोड:", payMode, "भरलेली रक्कम:", amtStr, labelFont, valueFont, lightBorder);
            addGridRow(sec5, "नोंदणी स्थिती:", "नोंदणी पूर्ण (यशस्वी)", "पेमेंट स्थिती:", reg.getPaymentStatus() != null ? reg.getPaymentStatus() : "COMPLETED", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec5);

            // 8. Signatures Block
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setSpacingBefore(12);

            Image imgSign1 = PdfFontUtil.createDevanagariImage("_______________________________\nशिबिरार्थी स्वाक्षरी\n(Participant's Signature)", 10.5f, true, textBlack);
            PdfPCell sign1 = new PdfPCell(imgSign1);
            sign1.setHorizontalAlignment(Element.ALIGN_CENTER);
            sign1.setBorder(Rectangle.NO_BORDER);

            Image imgSign2 = PdfFontUtil.createDevanagariImage("_______________________________\nअधिकृत संस्था प्रतिनिधी स्वाक्षरी व शिक्का\n(Authorized Sanstha Seal)", 10.5f, true, textBlack);
            PdfPCell sign2 = new PdfPCell(imgSign2);
            sign2.setHorizontalAlignment(Element.ALIGN_CENTER);
            sign2.setBorder(Rectangle.NO_BORDER);

            signTable.addCell(sign1);
            signTable.addCell(sign2);
            boxCell.addElement(signTable);

            outerBox.addCell(boxCell);
            document.add(outerBox);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("शिबिर नोंदणी PDF तयार करताना त्रुटी आली: " + e.getMessage(), e);
        }
    }

    private void addSectionHeader(PdfPCell parent, String title, Font font, Color bgColor, Color borderColor) {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingBefore(4);
        headerTable.setSpacingAfter(3);

        Color color = font.getColor() != null ? font.getColor() : Color.BLACK;
        Image img = PdfFontUtil.createDevanagariImage(title, font.getSize(), font.isBold(), color);
        PdfPCell c = new PdfPCell(img);
        c.setBackgroundColor(bgColor);
        c.setBorderColor(borderColor);
        c.setBorderWidthLeft(3f);
        c.setBorderWidthTop(0);
        c.setBorderWidthRight(0);
        c.setBorderWidthBottom(0);
        c.setPadding(4);
        headerTable.addCell(c);

        parent.addElement(headerTable);
    }

    private void addMetaCell(PdfPTable table, String label, String val, Font font, Color valColor) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(new Color(255, 248, 240));
        cell.setPadding(4);

        String fullText = label + " " + (val != null ? val : "-");
        Image img = PdfFontUtil.createDevanagariImage(fullText, font.getSize(), true, valColor);
        cell.addElement(img);
        table.addCell(cell);
    }

    private void addGridRow(PdfPTable table, String l1, String v1, String l2, String v2, Font lFont, Font vFont, Color borderColor) {
        addCell(table, l1, lFont, borderColor, true);
        addCell(table, v1, vFont, borderColor, false);
        addCell(table, l2, lFont, borderColor, true);
        addCell(table, v2, vFont, borderColor, false);
    }

    private void addGridFullRow(PdfPTable table, String l, String v, Font lFont, Font vFont, Color borderColor) {
        addCell(table, l, lFont, borderColor, true);

        String val = v != null && !v.isBlank() ? v : "-";
        Color color = vFont.getColor() != null ? vFont.getColor() : Color.BLACK;
        Image img = PdfFontUtil.createDevanagariImage(val, vFont.getSize(), vFont.isBold(), color, 340f);
        PdfPCell cell = new PdfPCell(img);
        cell.setColspan(3);
        cell.setPadding(4);
        cell.setBorderColor(borderColor);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color borderColor, boolean isLabel) {
        String val = text != null && !text.isBlank() ? text : "-";
        boolean isBold = isLabel || font.isBold();
        float fontSize = font.getSize();
        Color color = font.getColor() != null ? font.getColor() : Color.BLACK;

        Image img = PdfFontUtil.createDevanagariImage(val, fontSize, isBold, color, isLabel ? 105f : 125f);
        PdfPCell cell = new PdfPCell(img);
        cell.setPadding(4);
        if (isLabel) {
            cell.setBackgroundColor(new Color(255, 253, 250));
        }
        cell.setBorderColor(borderColor);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }
}

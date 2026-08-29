package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
import com.SevabhaviSanstha.util.PdfFontUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
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
        MarriageRegistration reg = getById(id);
        reg.setApprovalStatus(status);
        return marriageRegistrationRepository.save(reg);
    }

    @Override
    public MarriageRegistration getById(Integer id) {
        return marriageRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("विवाह नोंदणी सापडली नाही (ID: " + id + ")"));
    }

    @Override
    public byte[] generateFormPdf(Integer id) {
        MarriageRegistration reg = getById(id);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 28, 28, 28, 28);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font Initialization for crisp Devanagari (Marathi) text support
            BaseFont regularBase = PdfFontUtil.loadDevanagariBaseFont(false);
            BaseFont boldBase = PdfFontUtil.loadDevanagariBaseFont(true);

            // Saffron/Amber Theme Colors
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

            // Main Outer Box
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

            Image imgSub = PdfFontUtil.createDevanagariImage("वधू-वर सूचक केंद्र • अधिकृत नोंदणी अर्ज (Official Marriage Registration Form)", 12.5f, true, textBlack);
            imgSub.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgSub);

            Image imgContact = PdfFontUtil.createDevanagariImage("नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com", 10, true, textBlack);
            imgContact.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgContact);

            // Saffron Separator Line
            LineSeparator line = new LineSeparator(1.5f, 100f, saffronMain, Element.ALIGN_CENTER, -2);
            boxCell.addElement(line);

            // 2. Metadata Bar (ID, Type, Date)
            PdfPTable metaTable = new PdfPTable(3);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingBefore(6);
            metaTable.setSpacingAfter(8);

            String regTypeStr = "bride".equalsIgnoreCase(reg.getProfileType()) ? "वधू (Bride)" : "वर (Groom)";
            String dateStr = reg.getCreatedAt() != null
                    ? reg.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            addMetaCell(metaTable, "नोंदणी क्रमांक:", "MARRIAGE-" + reg.getId(), metaFont, saffronDark);
            addMetaCell(metaTable, "नोंदणी प्रकार:", regTypeStr, metaFont, saffronDark);
            addMetaCell(metaTable, "दिनांक:", dateStr, metaFont, textBlack);
            boxCell.addElement(metaTable);

            // Calculate age
            String ageStr = "";
            if (reg.getBirthDate() != null) {
                int age = Period.between(reg.getBirthDate(), LocalDate.now()).getYears();
                ageStr = " (" + age + " वर्षे)";
            }

            // 3. Section 1: वैयक्तिक माहिती (Personal Details)
            addSectionHeader(boxCell, "१. वैयक्तिक माहिती (Personal Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec1 = new PdfPTable(4);
            sec1.setWidthPercentage(100);
            sec1.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec1.setSpacingAfter(6);

            addGridRow(sec1, "पूर्ण नाव:", reg.getFullName(), "जन्म तारीख:", (reg.getBirthDate() != null ? reg.getBirthDate().toString() : "-") + ageStr, labelFont, valueFont, lightBorder);
            addGridRow(sec1, "उंची & रक्तगट:", (reg.getHeight() != null ? reg.getHeight() : "-") + " / " + (reg.getBloodGroup() != null ? reg.getBloodGroup() : "-"), "वैवाहिक स्थिती:", reg.getMaritalStatus(), labelFont, valueFont, lightBorder);
            addGridRow(sec1, "धर्म व जात:", (reg.getReligion() != null ? reg.getReligion() : "") + (reg.getCaste() != null ? " - " + reg.getCaste() : ""), "गोत्र & मंगळ:", (reg.getGotra() != null ? reg.getGotra() : "-") + " / " + ("yes".equalsIgnoreCase(reg.getManglik()) ? "मंगळ आहे" : "मंगळ नाही"), labelFont, valueFont, lightBorder);
            addGridRow(sec1, "संपर्क मोबाईल:", reg.getMobile(), "पालकांचा मोबाईल:", reg.getParentMobile(), labelFont, valueFont, lightBorder);
            addGridRow(sec1, "ईमेल:", reg.getEmail() != null ? reg.getEmail() : "-", "शहर / गाव:", reg.getCity(), labelFont, valueFont, lightBorder);

            String stateDistrict = (reg.getDistrict() != null ? reg.getDistrict().getNameMr() + ", " : "") + (reg.getState() != null ? reg.getState().getNameMr() : "");
            addGridFullRow(sec1, "पत्ता (जिल्हा/राज्य):", stateDistrict, labelFont, valueFont, lightBorder);
            if (reg.getAboutSelf() != null && !reg.getAboutSelf().isBlank()) {
                addGridFullRow(sec1, "स्वतःबद्दल माहिती:", reg.getAboutSelf(), labelFont, valueFont, lightBorder);
            }
            if (reg.getExpectations() != null && !reg.getExpectations().isBlank()) {
                addGridFullRow(sec1, "अपेक्षित जोडीदाराविषयी:", reg.getExpectations(), labelFont, valueFont, lightBorder);
            }
            boxCell.addElement(sec1);

            // 4. Section 2: शैक्षणिक माहिती (Educational Details)
            addSectionHeader(boxCell, "२. शैक्षणिक माहिती (Educational Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec2 = new PdfPTable(4);
            sec2.setWidthPercentage(100);
            sec2.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec2.setSpacingAfter(6);

            addGridRow(sec2, "शिक्षण पातळी:", reg.getEducationLevel(), "पदवी नाव:", reg.getDegreeName(), labelFont, valueFont, lightBorder);
            addGridRow(sec2, "शाळा / कॉलेज:", reg.getSchoolCollege() != null ? reg.getSchoolCollege() : "-", "उत्तीर्ण वर्ष:", reg.getPassingYear() != null ? reg.getPassingYear() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec2);

            // 5. Section 3: व्यावसायिक माहिती (Professional Details)
            addSectionHeader(boxCell, "३. व्यावसायिक माहिती (Professional Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec3 = new PdfPTable(4);
            sec3.setWidthPercentage(100);
            sec3.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec3.setSpacingAfter(6);

            addGridRow(sec3, "व्यवसाय प्रकार:", reg.getOccupationType(), "पद / Designation:", reg.getDesignation() != null ? reg.getDesignation() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec3, "कंपनीचे नाव:", reg.getCompanyName() != null ? reg.getCompanyName() : "-", "वार्षिक उत्पन्न:", reg.getAnnualIncome() != null ? reg.getAnnualIncome() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec3);

            // 6. Section 4: कौटुंबिक माहिती (Family Details)
            addSectionHeader(boxCell, "४. कौटुंबिक माहिती (Family Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec4 = new PdfPTable(4);
            sec4.setWidthPercentage(100);
            sec4.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec4.setSpacingAfter(6);

            addGridRow(sec4, "वडिलांचे नाव:", reg.getFatherName(), "वडिलांचा व्यवसाय:", reg.getFatherOccupation(), labelFont, valueFont, lightBorder);
            addGridRow(sec4, "आईचे नाव:", reg.getMotherName(), "भावंडे:", (reg.getBrothers() != null ? reg.getBrothers() : 0) + " भाऊ, " + (reg.getSisters() != null ? reg.getSisters() : 0) + " बहीण", labelFont, valueFont, lightBorder);
            if (reg.getFamilyBackground() != null && !reg.getFamilyBackground().isBlank()) {
                addGridFullRow(sec4, "कौटुंबिक पार्श्वभूमी:", reg.getFamilyBackground(), labelFont, valueFont, lightBorder);
            }
            boxCell.addElement(sec4);

            // 7. Section 5: नोंदणी व शुल्क तपशील (Registration & Fee)
            addSectionHeader(boxCell, "५. नोंदणी व शुल्क तपशील (Registration & Fee)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec5 = new PdfPTable(4);
            sec5.setWidthPercentage(100);
            sec5.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec5.setSpacingAfter(10);

            addGridRow(sec5, "नोंदणी शुल्क:", "₹५००", "नोंदणी स्थिती:", "नोंदणी पूर्ण (यशस्वी)", labelFont, valueFont, lightBorder);
            addGridFullRow(sec5, "घोषणा पुष्टीकरण:", "माहिती सत्य आणि अचूक असल्याची घोषणा अर्जदाराने मान्य केली आहे.", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec5);

            // 8. Signatures Block
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setSpacingBefore(12);

            Image imgSign1 = PdfFontUtil.createDevanagariImage("_______________________________\nअर्जदाराची स्वाक्षरी\n(Applicant's Signature)", 10.5f, true, textBlack);
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
            throw new RuntimeException("विवाह नोंदणी PDF तयार करताना त्रुटी आली: " + e.getMessage(), e);
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

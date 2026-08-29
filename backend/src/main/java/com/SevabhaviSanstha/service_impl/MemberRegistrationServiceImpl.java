package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.repository.MemberRegistrationRepository;
import com.SevabhaviSanstha.service.MemberRegistrationService;
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
public class MemberRegistrationServiceImpl implements MemberRegistrationService {

    @Autowired
    private MemberRegistrationRepository memberRegistrationRepository;

    @Override
    public MemberRegistration registerMember(MemberRegistration registration) {
        registration.setApprovalStatus("PENDING");
        return memberRegistrationRepository.save(registration);
    }

    @Override
    public List<MemberRegistration> getAllRegistrations() {
        return memberRegistrationRepository.findAll();
    }

    @Override
    public MemberRegistration updateApprovalStatus(Integer id, String status) {
        MemberRegistration reg = getById(id);
        reg.setApprovalStatus(status);
        return memberRegistrationRepository.save(reg);
    }

    @Override
    public MemberRegistration getById(Integer id) {
        return memberRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("सभासद नोंदणी सापडली नाही (ID: " + id + ")"));
    }

    @Override
    public byte[] generateMemberFormPdf(Integer id) {
        MemberRegistration reg = getById(id);

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

            Image imgSub = PdfFontUtil.createDevanagariImage("अधिकृत सभासद नोंदणी अर्ज (Official Member Registration Form)", 12.5f, true, textBlack);
            imgSub.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgSub);

            Image imgContact = PdfFontUtil.createDevanagariImage("नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com", 10, true, textBlack);
            imgContact.setAlignment(Element.ALIGN_CENTER);
            boxCell.addElement(imgContact);

            LineSeparator line = new LineSeparator(1.5f, 100f, saffronMain, Element.ALIGN_CENTER, -2);
            boxCell.addElement(line);

            // 2. Metadata Bar (ID, Type, Date)
            PdfPTable metaTable = new PdfPTable(3);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingBefore(6);
            metaTable.setSpacingAfter(8);

            String memberTypeStr = "lifetime".equalsIgnoreCase(reg.getMemberType()) ? "आजीवन सभासद (Lifetime)" : "वार्षिक सभासद (Annual)";
            String dateStr = reg.getCreatedAt() != null
                    ? reg.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                    : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            addMetaCell(metaTable, "नोंदणी क्रमांक:", "MEM-" + reg.getId(), metaFont, saffronDark);
            addMetaCell(metaTable, "सभासद प्रकार:", memberTypeStr, metaFont, saffronDark);
            addMetaCell(metaTable, "दिनांक:", dateStr, metaFont, textBlack);
            boxCell.addElement(metaTable);

            // 3. Section 1: वैयक्तिक माहिती (Personal Details)
            addSectionHeader(boxCell, "१. वैयक्तिक माहिती (Personal Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec1 = new PdfPTable(4);
            sec1.setWidthPercentage(100);
            sec1.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec1.setSpacingAfter(6);

            addGridRow(sec1, "पूर्ण नाव:", reg.getFullName(), "जन्म तारीख:", reg.getBirthDate() != null ? reg.getBirthDate().toString() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec1, "लिंग:", reg.getGender(), "रक्तगट:", reg.getBloodGroup() != null ? reg.getBloodGroup() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec1, "वैवाहिक स्थिती:", reg.getMaritalStatus(), "व्यवसाय:", reg.getOccupation(), labelFont, valueFont, lightBorder);
            addGridRow(sec1, "शिक्षण:", reg.getEducation(), "ओळखपत्र क्र.:", reg.getIdProofNumber() != null ? reg.getIdProofNumber() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec1, "मोबाईल:", reg.getMobile(), "ईमेल:", reg.getEmail() != null ? reg.getEmail() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec1);

            // 4. Section 2: पत्ता व रहिवासी माहिती (Address Details)
            addSectionHeader(boxCell, "२. पत्ता व रहिवासी माहिती (Address Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec2 = new PdfPTable(4);
            sec2.setWidthPercentage(100);
            sec2.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec2.setSpacingAfter(6);

            String talukaDist = (reg.getTaluka() != null ? reg.getTaluka().getNameMr() + ", " : "")
                    + (reg.getDistrict() != null ? reg.getDistrict().getNameMr() + ", " : "")
                    + (reg.getState() != null ? reg.getState().getNameMr() : "");

            addGridRow(sec2, "तालुका / जिल्हा / राज्य:", talukaDist, "पिनकोड:", reg.getPincode() != null ? reg.getPincode() : "-", labelFont, valueFont, lightBorder);
            addGridFullRow(sec2, "सध्याचा पत्ता:", reg.getCurrentAddress(), labelFont, valueFont, lightBorder);
            if (reg.getPermanentAddress() != null && !reg.getPermanentAddress().isBlank()) {
                addGridFullRow(sec2, "कायमचा पत्ता:", reg.getPermanentAddress(), labelFont, valueFont, lightBorder);
            }
            boxCell.addElement(sec2);

            // 5. Section 3: अपेक्षा व संदेश (Expectations & Message)
            if ((reg.getExpectations() != null && !reg.getExpectations().isBlank()) || (reg.getMessage() != null && !reg.getMessage().isBlank())) {
                addSectionHeader(boxCell, "३. संस्थेकडून अपेक्षा व संदेश", sectionTitleFont, sectionBg, saffronMain);
                PdfPTable sec3 = new PdfPTable(4);
                sec3.setWidthPercentage(100);
                sec3.setWidths(new float[]{22f, 28f, 22f, 28f});
                sec3.setSpacingAfter(6);

                if (reg.getExpectations() != null && !reg.getExpectations().isBlank()) {
                    addGridFullRow(sec3, "संस्थेकडून अपेक्षा:", reg.getExpectations(), labelFont, valueFont, lightBorder);
                }
                if (reg.getMessage() != null && !reg.getMessage().isBlank()) {
                    addGridFullRow(sec3, "संदेश / सूचना:", reg.getMessage(), labelFont, valueFont, lightBorder);
                }
                boxCell.addElement(sec3);
            }

            // 6. Section 4: नोंदणी व शुल्क तपशील (Registration & Fee)
            addSectionHeader(boxCell, "४. नोंदणी व शुल्क तपशील (Registration & Fee)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec4 = new PdfPTable(4);
            sec4.setWidthPercentage(100);
            sec4.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec4.setSpacingAfter(10);

            String feeStr = "lifetime".equalsIgnoreCase(reg.getMemberType()) ? "₹२,००० (आजीवन)" : "₹१०० (वार्षिक)";
            addGridRow(sec4, "सभासद वर्गणी शुल्क:", feeStr, "नोंदणी स्थिती:", "नोंदणी पूर्ण (यशस्वी)", labelFont, valueFont, lightBorder);
            addGridFullRow(sec4, "घोषणा पुष्टीकरण:", "माहिती सत्य आणि अचूक असल्याची घोषणा अर्जदाराने मान्य केली आहे.", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec4);

            // 7. Signatures Block
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setSpacingBefore(12);

            Image imgSign1 = PdfFontUtil.createDevanagariImage("_______________________________\nसभासदाची स्वाक्षरी\n(Member's Signature)", 10.5f, true, textBlack);
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
            throw new RuntimeException("सभासद नोंदणी PDF तयार करताना त्रुटी आली: " + e.getMessage(), e);
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

package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.config.JwtTokenUtil;
import com.SevabhaviSanstha.dto.*;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.entity.MatrimonyFavorite;
import com.SevabhaviSanstha.repository.MarriageRegistrationRepository;
import com.SevabhaviSanstha.repository.MatrimonyFavoriteRepository;
import com.SevabhaviSanstha.service.MarriageRegistrationService;
import com.SevabhaviSanstha.util.PdfFontUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarriageRegistrationServiceImpl implements MarriageRegistrationService {

    @Autowired
    private MarriageRegistrationRepository marriageRegistrationRepository;

    @Autowired
    private MatrimonyFavoriteRepository matrimonyFavoriteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Value("${app.upload.marriage.dir:uploads/marriage}")
    private String uploadMarriageDir;

    @Override
    @Transactional
    public MarriageRegistration registerMarriage(MarriageRegistration registration) {
        // Validation: duplicate mobile check
        if (registration.getMobile() != null && marriageRegistrationRepository.existsByMobile(registration.getMobile().trim())) {
            throw new IllegalArgumentException("या मोबाईल क्रमांकासह आधीच विवाह नोंदणी झालेली आहे (" + registration.getMobile() + ").");
        }

        // Duplicate email check
        if (registration.getEmail() != null && !registration.getEmail().trim().isEmpty() &&
                marriageRegistrationRepository.existsByEmail(registration.getEmail().trim())) {
            throw new IllegalArgumentException("या ईमेल आयडीसह आधीच विवाह नोंदणी झालेली आहे (" + registration.getEmail() + ").");
        }

        // Password hashing with BCrypt
        if (registration.getPasswordHash() != null && !registration.getPasswordHash().trim().isEmpty()) {
            registration.setPasswordHash(passwordEncoder.encode(registration.getPasswordHash().trim()));
        }

        // Package settings
        if (registration.getPackageType() == null || registration.getPackageType().isBlank()) {
            registration.setPackageType("6_MONTHS");
        }
        if (registration.getPackageAmount() == null) {
            if ("3_MONTHS".equalsIgnoreCase(registration.getPackageType())) {
                registration.setPackageAmount(new BigDecimal("300.00"));
                registration.setSubscriptionDurationMonths(3);
            } else if ("12_MONTHS".equalsIgnoreCase(registration.getPackageType())) {
                registration.setPackageAmount(new BigDecimal("800.00"));
                registration.setSubscriptionDurationMonths(12);
            } else {
                registration.setPackageAmount(new BigDecimal("500.00"));
                registration.setSubscriptionDurationMonths(6);
            }
        } else {
            if ("3_MONTHS".equalsIgnoreCase(registration.getPackageType())) {
                registration.setSubscriptionDurationMonths(3);
            } else if ("12_MONTHS".equalsIgnoreCase(registration.getPackageType())) {
                registration.setSubscriptionDurationMonths(12);
            } else {
                registration.setSubscriptionDurationMonths(6);
            }
        }

        registration.setApprovalStatus("PENDING");
        return marriageRegistrationRepository.save(registration);
    }

    @Override
    public List<MarriageRegistration> getAllRegistrations() {
        return marriageRegistrationRepository.findAll();
    }

    @Override
    @Transactional
    public MarriageRegistration updateApprovalStatus(Integer id, String status) {
        return updateApprovalStatusWithReason(id, status, null);
    }

    @Override
    @Transactional
    public MarriageRegistration updateApprovalStatusWithReason(Integer id, String status, String reason) {
        MarriageRegistration reg = getById(id);
        String upperStatus = status.trim().toUpperCase();
        reg.setApprovalStatus(upperStatus);

        if ("APPROVED".equals(upperStatus)) {
            LocalDate start = LocalDate.now();
            int months = (reg.getSubscriptionDurationMonths() != null && reg.getSubscriptionDurationMonths() > 0)
                    ? reg.getSubscriptionDurationMonths()
                    : 6;
            reg.setSubscriptionStartDate(start);
            reg.setSubscriptionEndDate(start.plusMonths(months));
            reg.setRejectionReason(null);
        } else if ("REJECTED".equals(upperStatus)) {
            if (reason != null && !reason.isBlank()) {
                reg.setRejectionReason(reason.trim());
            }
        }

        return marriageRegistrationRepository.save(reg);
    }

    @Override
    public MarriageRegistration getById(Integer id) {
        return marriageRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("विवाह नोंदणी सापडली नाही (ID: " + id + ")"));
    }

    @Override
    public Page<MatrimonyPublicProfileDTO> getPublicProfiles(MatrimonyFilterDTO filter, Pageable pageable, Integer currentUserId) {
        Specification<MarriageRegistration> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Rule: ONLY show APPROVED profiles
            predicates.add(cb.equal(root.get("approvalStatus"), "APPROVED"));

            if (filter != null) {
                // Gender / Profile Type
                if (filter.getProfileType() != null && !filter.getProfileType().isBlank() && !"all".equalsIgnoreCase(filter.getProfileType())) {
                    predicates.add(cb.equal(cb.lower(root.get("profileType")), filter.getProfileType().toLowerCase().trim()));
                }

                // Age filters based on birthDate
                LocalDate today = LocalDate.now();
                if (filter.getMinAge() != null && filter.getMinAge() > 0) {
                    LocalDate maxBirthDate = today.minusYears(filter.getMinAge());
                    predicates.add(cb.lessThanOrEqualTo(root.get("birthDate"), maxBirthDate));
                }
                if (filter.getMaxAge() != null && filter.getMaxAge() > 0) {
                    LocalDate minBirthDate = today.minusYears(filter.getMaxAge() + 1).plusDays(1);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("birthDate"), minBirthDate));
                }

                // Caste / Samaj
                if (filter.getCaste() != null && !filter.getCaste().isBlank() && !"सर्व".equals(filter.getCaste())) {
                    predicates.add(cb.like(cb.lower(root.get("caste")), "%" + filter.getCaste().toLowerCase().trim() + "%"));
                }

                // Education Level
                if (filter.getEducationLevel() != null && !filter.getEducationLevel().isBlank() && !"सर्व".equals(filter.getEducationLevel())) {
                    predicates.add(cb.equal(root.get("educationLevel"), filter.getEducationLevel().trim()));
                }

                // Occupation Type
                if (filter.getOccupationType() != null && !filter.getOccupationType().isBlank() && !"सर्व".equals(filter.getOccupationType())) {
                    predicates.add(cb.equal(root.get("occupationType"), filter.getOccupationType().trim()));
                }

                // State
                if (filter.getStateId() != null && filter.getStateId() > 0) {
                    predicates.add(cb.equal(root.get("state").get("id"), filter.getStateId()));
                }

                // District
                if (filter.getDistrictId() != null && filter.getDistrictId() > 0) {
                    predicates.add(cb.equal(root.get("district").get("id"), filter.getDistrictId()));
                }

                // City / Taluka
                if (filter.getCity() != null && !filter.getCity().isBlank() && !"सर्व".equals(filter.getCity())) {
                    predicates.add(cb.like(cb.lower(root.get("city")), "%" + filter.getCity().toLowerCase().trim() + "%"));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Determine sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (filter != null && filter.getSort() != null) {
            if ("ageAsc".equalsIgnoreCase(filter.getSort())) {
                sort = Sort.by(Sort.Direction.DESC, "birthDate"); // Younger first
            } else if ("ageDesc".equalsIgnoreCase(filter.getSort())) {
                sort = Sort.by(Sort.Direction.ASC, "birthDate"); // Older first
            }
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<MarriageRegistration> page = marriageRegistrationRepository.findAll(spec, sortedPageable);

        Set<Integer> userFavorites = (currentUserId != null)
                ? new HashSet<>(getUserFavorites(currentUserId))
                : Collections.emptySet();

        return page.map(reg -> mapToPublicDTO(reg, userFavorites.contains(reg.getId())));
    }

    @Override
    public MatrimonyPublicProfileDTO getPublicProfileById(Integer id, Integer currentUserId) {
        MarriageRegistration reg = getById(id);
        if (!"APPROVED".equalsIgnoreCase(reg.getApprovalStatus())) {
            throw new RuntimeException("प्रोफाइल सापडली नाही किंवा अद्याप मंजूर झालेली नाही.");
        }
        boolean isFav = (currentUserId != null) && matrimonyFavoriteRepository.existsByUserIdAndFavoriteProfileId(currentUserId, id);
        return mapToPublicDTO(reg, isFav);
    }

    @Override
    public MatrimonyFullProfileDTO getFullProfileById(Integer id, Integer currentUserId, boolean isAdmin) {
        MarriageRegistration target = getById(id);
        if (!"APPROVED".equalsIgnoreCase(target.getApprovalStatus()) && !isAdmin) {
            throw new RuntimeException("प्रोफाइल सापडली नाही.");
        }

        // If not admin, verify that current user is an approved matrimony user with active subscription
        if (!isAdmin) {
            if (currentUserId == null) {
                throw new RuntimeException("संपूर्ण प्रोफाइल आणि संपर्क माहिती पाहण्यासाठी कृपया नोंदणी करा किंवा लॉगिन करा.");
            }
            MarriageRegistration viewer = getById(currentUserId);
            if (!"APPROVED".equalsIgnoreCase(viewer.getApprovalStatus())) {
                throw new RuntimeException("तुमचा अर्ज अद्याप मंजूर झालेला नाही. मंजुरीनंतरच इतर प्रोफाइल्स पाहता येतील.");
            }
            if (viewer.getSubscriptionEndDate() != null && viewer.getSubscriptionEndDate().isBefore(LocalDate.now())) {
                throw new RuntimeException("तुमची सबस्क्रिप्शन मुदत संपली आहे (" + viewer.getSubscriptionEndDate() + "). कृपया नूतनीकरण करा.");
            }
        }

        boolean isFav = (currentUserId != null) && matrimonyFavoriteRepository.existsByUserIdAndFavoriteProfileId(currentUserId, id);
        return mapToFullDTO(target, isFav);
    }

    @Override
    public List<MatrimonyPublicProfileDTO> getSimilarProfiles(Integer profileId, Pageable pageable, Integer currentUserId) {
        MarriageRegistration current = getById(profileId);
        List<MarriageRegistration> list = marriageRegistrationRepository.findSimilarProfiles(
                current.getProfileType(),
                profileId,
                pageable
        );

        Set<Integer> userFavorites = (currentUserId != null)
                ? new HashSet<>(getUserFavorites(currentUserId))
                : Collections.emptySet();

        return list.stream()
                .map(reg -> mapToPublicDTO(reg, userFavorites.contains(reg.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public MatrimonyAuthResponseDTO loginMatrimonyUser(String identifier, String password) {
        if (identifier == null || identifier.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("कृपया मोबाईल / ईमेल आणि पासवर्ड भरा.");
        }

        String cleanIdentifier = identifier.trim();
        MarriageRegistration reg = marriageRegistrationRepository.findByMobileOrEmail(cleanIdentifier)
                .orElseThrow(() -> new RuntimeException("या मोबाईल क्रमांकासह किंवा ईमेलसह कोणतीही नोंदणी आढळली नाही."));

        // Status verification
        if ("PENDING".equalsIgnoreCase(reg.getApprovalStatus())) {
            throw new RuntimeException("तुमचा अर्ज अद्याप प्रलंबित आहे. अॅडमिन मंजुरीनंतर लॉगिन करता येईल.");
        }
        if ("REJECTED".equalsIgnoreCase(reg.getApprovalStatus())) {
            throw new RuntimeException("तुमचा अर्ज नाकारण्यात आला आहे. कृपया संपर्क साधा.");
        }
        if (!"APPROVED".equalsIgnoreCase(reg.getApprovalStatus())) {
            throw new RuntimeException("तुमचा अर्ज अद्याप मंजूर झालेला नाही.");
        }

        // Password verification
        if (reg.getPasswordHash() == null || !passwordEncoder.matches(password.trim(), reg.getPasswordHash())) {
            throw new RuntimeException("पासवर्ड चुकीचा आहे.");
        }

        // Subscription check
        boolean isSubActive = reg.getSubscriptionEndDate() == null || !reg.getSubscriptionEndDate().isBefore(LocalDate.now());

        // Generate JWT token with role ROLE_MATRIMONY_USER
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "MATRIMONY_USER");
        claims.put("userId", reg.getId());
        claims.put("profileType", reg.getProfileType());
        claims.put("fullName", reg.getFullName());

        String token = jwtTokenUtil.generateTokenWithClaims(claims, reg.getMobile());

        return MatrimonyAuthResponseDTO.builder()
                .token(token)
                .id(reg.getId())
                .fullName(reg.getFullName())
                .profileType(reg.getProfileType())
                .mobile(reg.getMobile())
                .email(reg.getEmail())
                .subscriptionActive(isSubActive)
                .subscriptionEndDate(reg.getSubscriptionEndDate())
                .mainPhotoUrl(reg.getMainPhotoUrl())
                .role("ROLE_MATRIMONY_USER")
                .build();
    }

    @Override
    @Transactional
    public void resetMatrimonyPassword(String identifier, String newPassword) {
        if (identifier == null || identifier.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("कृपया सर्व रकाने भरा.");
        }
        if (newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("पासवर्ड किमान ६ अक्षरी असणे आवश्यक आहे.");
        }

        MarriageRegistration reg = marriageRegistrationRepository.findByMobileOrEmail(identifier.trim())
                .orElseThrow(() -> new RuntimeException("या मोबाईल क्रमांकासह किंवा ईमेलसह नोंदणी आढळली नाही."));

        reg.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        marriageRegistrationRepository.save(reg);
    }

    @Override
    @Transactional
    public boolean toggleFavorite(Integer userId, Integer profileId) {
        if (matrimonyFavoriteRepository.existsByUserIdAndFavoriteProfileId(userId, profileId)) {
            matrimonyFavoriteRepository.deleteByUserIdAndFavoriteProfileId(userId, profileId);
            return false;
        } else {
            MatrimonyFavorite fav = MatrimonyFavorite.builder()
                    .userId(userId)
                    .favoriteProfileId(profileId)
                    .createdAt(LocalDateTime.now())
                    .build();
            matrimonyFavoriteRepository.save(fav);
            return true;
        }
    }

    @Override
    public List<Integer> getUserFavorites(Integer userId) {
        return matrimonyFavoriteRepository.findByUserId(userId).stream()
                .map(MatrimonyFavorite::getFavoriteProfileId)
                .collect(Collectors.toList());
    }

    @Override
    public String uploadPhoto(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("कृपया वैध फोटो फाईल निवडा.");
        }

        Path uploadPath = Paths.get(uploadMarriageDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = file.getOriginalFilename();
        String extension = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
        String fileName = UUID.randomUUID() + extension;

        Path target = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/marriage/" + fileName;
    }

    private String extractSurnameOrDisplayName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "सदस्य";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length > 1) {
            return parts[parts.length - 1]; // Return surname
        }
        return parts[0];
    }

    private int calculateAge(LocalDate birthDate) {
        if (birthDate == null) return 0;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    private MatrimonyPublicProfileDTO mapToPublicDTO(MarriageRegistration reg, boolean isFavorite) {
        int photoCount = 1;
        if (Boolean.TRUE.equals(reg.getFullPhotoUploaded())) photoCount += 1;
        if (reg.getMainPhotoUrl() != null && !reg.getMainPhotoUrl().isBlank()) photoCount = Math.max(photoCount, 3);

        return MatrimonyPublicProfileDTO.builder()
                .id(reg.getId())
                .profileType(reg.getProfileType())
                .displayName(reg.getFullName() != null ? reg.getFullName().trim() : "")
                .age(calculateAge(reg.getBirthDate()))
                .height(reg.getHeight())
                .bloodGroup(reg.getBloodGroup())
                .maritalStatus(reg.getMaritalStatus())
                .religion(reg.getReligion())
                .caste(reg.getCaste())
                .manglik(reg.getManglik())
                .educationLevel(reg.getEducationLevel())
                .degreeName(reg.getDegreeName())
                .occupationType(reg.getOccupationType())
                .designation(reg.getDesignation())
                .city(reg.getCity())
                .districtNameMr(reg.getDistrict() != null ? reg.getDistrict().getNameMr() : null)
                .stateNameMr(reg.getState() != null ? reg.getState().getNameMr() : null)
                .mainPhotoUrl(reg.getMainPhotoUrl())
                .photoCount(photoCount)
                .isFavorite(isFavorite)
                .createdAt(reg.getCreatedAt())
                .build();
    }

    private MatrimonyFullProfileDTO mapToFullDTO(MarriageRegistration reg, boolean isFavorite) {
        boolean subActive = reg.getSubscriptionEndDate() == null || !reg.getSubscriptionEndDate().isBefore(LocalDate.now());
        int photoCount = 1;
        if (Boolean.TRUE.equals(reg.getFullPhotoUploaded())) photoCount += 1;
        if (reg.getMainPhotoUrl() != null && !reg.getMainPhotoUrl().isBlank()) photoCount = Math.max(photoCount, 4);

        return MatrimonyFullProfileDTO.builder()
                .id(reg.getId())
                .profileType(reg.getProfileType())
                .fullName(reg.getFullName())
                .displayName(reg.getFullName() != null ? reg.getFullName().trim() : "")
                .birthDate(reg.getBirthDate())
                .age(calculateAge(reg.getBirthDate()))
                .height(reg.getHeight())
                .bloodGroup(reg.getBloodGroup())
                .maritalStatus(reg.getMaritalStatus())
                .religion(reg.getReligion())
                .caste(reg.getCaste())
                .gotra(reg.getGotra())
                .manglik(reg.getManglik())
                .city(reg.getCity())
                .districtId(reg.getDistrict() != null ? reg.getDistrict().getId() : null)
                .districtNameMr(reg.getDistrict() != null ? reg.getDistrict().getNameMr() : null)
                .stateId(reg.getState() != null ? reg.getState().getId() : null)
                .stateNameMr(reg.getState() != null ? reg.getState().getNameMr() : null)
                .mobile(reg.getMobile())
                .email(reg.getEmail())
                .parentMobile(reg.getParentMobile())
                .aboutSelf(reg.getAboutSelf())
                .expectations(reg.getExpectations())
                .educationLevel(reg.getEducationLevel())
                .degreeName(reg.getDegreeName())
                .schoolCollege(reg.getSchoolCollege())
                .passingYear(reg.getPassingYear())
                .occupationType(reg.getOccupationType())
                .designation(reg.getDesignation())
                .companyName(reg.getCompanyName())
                .annualIncome(reg.getAnnualIncome())
                .fatherName(reg.getFatherName())
                .fatherOccupation(reg.getFatherOccupation())
                .motherName(reg.getMotherName())
                .brothers(reg.getBrothers())
                .sisters(reg.getSisters())
                .familyBackground(reg.getFamilyBackground())
                .mainPhotoUrl(reg.getMainPhotoUrl())
                .photoCount(photoCount)
                .mainPhotoUploaded(reg.getMainPhotoUploaded())
                .fullPhotoUploaded(reg.getFullPhotoUploaded())
                .subscriptionActive(subActive)
                .subscriptionEndDate(reg.getSubscriptionEndDate())
                .isFavorite(isFavorite)
                .createdAt(reg.getCreatedAt())
                .build();
    }

    @Override
    public byte[] generateFormPdf(Integer id) {
        MarriageRegistration reg = getById(id);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 28, 28, 28, 28);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font Initialization for crisp Devanagari text support
            BaseFont regularBase = PdfFontUtil.loadDevanagariBaseFont(false);
            BaseFont boldBase = PdfFontUtil.loadDevanagariBaseFont(true);

            Color saffronDark = new Color(196, 93, 20);     // #c45d14
            Color saffronMain = new Color(232, 121, 44);    // #E8792C
            Color sectionBg = new Color(255, 248, 240);      // #FFF8F0
            Color textBlack = new Color(0, 0, 0);            // #000000
            Color lightBorder = new Color(254, 215, 170);    // #fed7aa

            Font subHeaderFont = new Font(boldBase, 12.5f, Font.BOLD, textBlack);
            Font metaFont = new Font(boldBase, 10.5f, Font.BOLD, textBlack);
            Font sectionTitleFont = new Font(boldBase, 12, Font.BOLD, saffronDark);
            Font labelFont = new Font(boldBase, 11, Font.BOLD, textBlack);
            Font valueFont = new Font(regularBase, 10.5f, Font.NORMAL, textBlack);

            PdfPTable outerBox = new PdfPTable(1);
            outerBox.setWidthPercentage(100);

            PdfPCell boxCell = new PdfPCell();
            boxCell.setPadding(12);
            boxCell.setBackgroundColor(new Color(255, 255, 255));
            boxCell.setBorderColor(saffronMain);
            boxCell.setBorderWidth(2);

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

            LineSeparator line = new LineSeparator(1.5f, 100f, saffronMain, Element.ALIGN_CENTER, -2);
            boxCell.addElement(line);

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

            String ageStr = "";
            if (reg.getBirthDate() != null) {
                int age = Period.between(reg.getBirthDate(), LocalDate.now()).getYears();
                ageStr = " (" + age + " वर्षे)";
            }

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

            addSectionHeader(boxCell, "२. शैक्षणिक माहिती (Educational Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec2 = new PdfPTable(4);
            sec2.setWidthPercentage(100);
            sec2.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec2.setSpacingAfter(6);

            addGridRow(sec2, "शिक्षण पातळी:", reg.getEducationLevel(), "पदवी नाव:", reg.getDegreeName(), labelFont, valueFont, lightBorder);
            addGridRow(sec2, "शाळा / कॉलेज:", reg.getSchoolCollege() != null ? reg.getSchoolCollege() : "-", "उत्तीर्ण वर्ष:", reg.getPassingYear() != null ? reg.getPassingYear() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec2);

            addSectionHeader(boxCell, "३. व्यावसायिक माहिती (Professional Details)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec3 = new PdfPTable(4);
            sec3.setWidthPercentage(100);
            sec3.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec3.setSpacingAfter(6);

            addGridRow(sec3, "व्यवसाय प्रकार:", reg.getOccupationType(), "पद / Designation:", reg.getDesignation() != null ? reg.getDesignation() : "-", labelFont, valueFont, lightBorder);
            addGridRow(sec3, "कंपनीचे नाव:", reg.getCompanyName() != null ? reg.getCompanyName() : "-", "वार्षिक उत्पन्न:", reg.getAnnualIncome() != null ? reg.getAnnualIncome() : "-", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec3);

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

            addSectionHeader(boxCell, "५. नोंदणी व शुल्क तपशील (Registration & Fee)", sectionTitleFont, sectionBg, saffronMain);
            PdfPTable sec5 = new PdfPTable(4);
            sec5.setWidthPercentage(100);
            sec5.setWidths(new float[]{22f, 28f, 22f, 28f});
            sec5.setSpacingAfter(10);

            String feeStr = reg.getPackageAmount() != null ? "₹" + reg.getPackageAmount().intValue() : "₹५००";
            addGridRow(sec5, "नोंदणी शुल्क:", feeStr, "नोंदणी स्थिती:", "नोंदणी पूर्ण (यशस्वी)", labelFont, valueFont, lightBorder);
            addGridFullRow(sec5, "घोषणा पुष्टीकरण:", "माहिती सत्य आणि अचूक असल्याची घोषणा अर्जदाराने मान्य केली आहे.", labelFont, valueFont, lightBorder);
            boxCell.addElement(sec5);

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

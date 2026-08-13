package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.dto.DashboardStatsDTO;
import com.SevabhaviSanstha.dto.TodayRegistrationDTO;
import com.SevabhaviSanstha.entity.Inquiry;
import com.SevabhaviSanstha.entity.MarriageRegistration;
import com.SevabhaviSanstha.entity.MemberRegistration;
import com.SevabhaviSanstha.repository.*;
import com.SevabhaviSanstha.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private MemberRegistrationRepository memberRegistrationRepository;

    @Autowired
    private MarriageRegistrationRepository marriageRegistrationRepository;

    @Autowired
    private GalleryImageRepository galleryImageRepository;

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Override
    public DashboardStatsDTO getDashboardStats() {
        List<MemberRegistration> members = memberRegistrationRepository.findAll();
        List<MarriageRegistration> marriages = marriageRegistrationRepository.findAll();
        List<Inquiry> inquiries = inquiryRepository.findAll();
        long galleryCount = galleryImageRepository.count();
        long newsCount = newsRepository.count();

        LocalDate today = LocalDate.now();

        long todayMembers = members.stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().toLocalDate().equals(today))
                .count();

        long todayMarriages = marriages.stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().toLocalDate().equals(today))
                .count();

        long todayInquiries = inquiries.stream()
                .filter(i -> i.getCreatedAt() != null && i.getCreatedAt().toLocalDate().equals(today))
                .count();

        long todayTotal = todayMembers + todayMarriages + todayInquiries;

        long annualCount = members.stream()
                .filter(m -> m.getMemberType() != null && (
                        m.getMemberType().equalsIgnoreCase("annual") || 
                        m.getMemberType().contains("वार्षिक")))
                .count();

        long lifetimeCount = members.stream()
                .filter(m -> m.getMemberType() != null && (
                        m.getMemberType().equalsIgnoreCase("lifetime") || 
                        m.getMemberType().contains("आजीवन")))
                .count();

        // If some members have uncategorized memberType, group remaining as annual by default
        if (annualCount + lifetimeCount < members.size()) {
            long unspecified = members.size() - (annualCount + lifetimeCount);
            annualCount += unspecified;
        }

        return DashboardStatsDTO.builder()
                .todayRegistrationsCount(todayTotal)
                .memberTotalCount(members.size())
                .memberAnnualCount(annualCount)
                .memberLifetimeCount(lifetimeCount)
                .marriageTotalCount(marriages.size())
                .galleryTotalCount(galleryCount)
                .newsTotalCount(newsCount)
                .build();
    }

    @Override
    public List<TodayRegistrationDTO> getTodayRegistrations() {
        LocalDate today = LocalDate.now();
        List<TodayRegistrationDTO> list = new ArrayList<>();

        // 1. Member Registrations today
        List<MemberRegistration> members = memberRegistrationRepository.findAll();
        for (MemberRegistration m : members) {
            if (m.getCreatedAt() != null && m.getCreatedAt().toLocalDate().equals(today)) {
                list.add(TodayRegistrationDTO.builder()
                        .id("M-" + m.getId())
                        .name(m.getFullName())
                        .type("सदस्य नोंदणी (" + (m.getMemberType() != null && m.getMemberType().equalsIgnoreCase("lifetime") ? "आजीवन" : "वार्षिक") + ")")
                        .mobile(m.getMobile())
                        .createdAt(m.getCreatedAt())
                        .status(m.getApprovalStatus() != null ? m.getApprovalStatus() : "PENDING")
                        .build());
            }
        }

        // 2. Marriage Registrations today
        List<MarriageRegistration> marriages = marriageRegistrationRepository.findAll();
        for (MarriageRegistration mar : marriages) {
            if (mar.getCreatedAt() != null && mar.getCreatedAt().toLocalDate().equals(today)) {
                list.add(TodayRegistrationDTO.builder()
                        .id("MR-" + mar.getId())
                        .name(mar.getFullName())
                        .type("विवाह नोंदणी (" + ("groom".equalsIgnoreCase(mar.getProfileType()) ? "वर" : "वधू") + ")")
                        .mobile(mar.getMobile())
                        .createdAt(mar.getCreatedAt())
                        .status(mar.getApprovalStatus() != null ? mar.getApprovalStatus() : "PENDING")
                        .build());
            }
        }

        // 3. Inquiries today
        List<Inquiry> inquiries = inquiryRepository.findAll();
        for (Inquiry inq : inquiries) {
            if (inq.getCreatedAt() != null && inq.getCreatedAt().toLocalDate().equals(today)) {
                list.add(TodayRegistrationDTO.builder()
                        .id("INQ-" + inq.getId())
                        .name(inq.getName())
                        .type("चौकशी अर्ज")
                        .mobile(inq.getMobile())
                        .createdAt(inq.getCreatedAt())
                        .status(inq.getStatus() != null ? inq.getStatus() : "NEW")
                        .build());
            }
        }

        list.sort(Comparator.comparing(TodayRegistrationDTO::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return list;
    }
}

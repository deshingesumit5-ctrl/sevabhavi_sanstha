package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.Inquiry;
import java.util.List;

public interface InquiryService {
    Inquiry saveInquiry(Inquiry inquiry);
    List<Inquiry> getAllInquiries();
    void deleteInquiry(Integer id);
}

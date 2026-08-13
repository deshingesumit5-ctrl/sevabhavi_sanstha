package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.Inquiry;
import com.SevabhaviSanstha.repository.InquiryRepository;
import com.SevabhaviSanstha.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InquiryServiceImpl implements InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Override
    public Inquiry saveInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    @Override
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteInquiry(Integer id) {
        inquiryRepository.deleteById(id);
    }
}

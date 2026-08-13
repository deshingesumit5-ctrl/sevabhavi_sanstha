package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {
    List<Inquiry> findAllByOrderByCreatedAtDesc();
}


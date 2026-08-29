package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.DonationPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationPurposeRepository extends JpaRepository<DonationPurpose, Integer> {
    List<DonationPurpose> findByIsActiveTrue();
    Optional<DonationPurpose> findByCode(String code);
}

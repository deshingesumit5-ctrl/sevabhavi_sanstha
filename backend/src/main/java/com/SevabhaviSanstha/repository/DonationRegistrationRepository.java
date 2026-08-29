package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.DonationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Integer> {
    Optional<DonationRegistration> findByReceiptNumber(String receiptNumber);
    List<DonationRegistration> findByMobileOrderByIdDesc(String mobile);
    
    @Query("SELECT MAX(d.id) FROM DonationRegistration d")
    Integer findMaxId();
}

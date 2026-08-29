package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.DonationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationTypeRepository extends JpaRepository<DonationType, Integer> {
    List<DonationType> findByIsActiveTrue();
    Optional<DonationType> findByCode(String code);
}

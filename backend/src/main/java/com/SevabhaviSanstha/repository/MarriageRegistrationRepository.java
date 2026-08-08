package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarriageRegistrationRepository extends JpaRepository<MarriageRegistration, Integer> {
}

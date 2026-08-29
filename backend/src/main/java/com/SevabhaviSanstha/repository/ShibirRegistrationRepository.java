package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.ShibirRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShibirRegistrationRepository extends JpaRepository<ShibirRegistration, Integer> {
    List<ShibirRegistration> findAllByOrderByCreatedAtDesc();
}

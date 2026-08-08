package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MemberRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRegistrationRepository extends JpaRepository<MemberRegistration, Integer> {
}

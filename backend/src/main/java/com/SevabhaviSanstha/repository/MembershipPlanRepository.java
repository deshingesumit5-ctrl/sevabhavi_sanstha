package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Integer> {
    Optional<MembershipPlan> findByPlanCode(String planCode);
}

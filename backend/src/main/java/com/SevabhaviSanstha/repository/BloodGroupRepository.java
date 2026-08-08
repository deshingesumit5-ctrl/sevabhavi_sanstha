package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BloodGroupRepository extends JpaRepository<BloodGroup, Integer> {
    List<BloodGroup> findAllByOrderBySortOrderAsc();
}

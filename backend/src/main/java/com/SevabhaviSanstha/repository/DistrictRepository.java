package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {
    List<District> findByStateId(Integer stateId);
}

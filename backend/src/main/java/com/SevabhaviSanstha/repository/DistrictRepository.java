package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {
    List<District> findByStateId(Integer stateId);
    Optional<District> findByStateIdAndNameEnIgnoreCase(Integer stateId, String nameEn);
}

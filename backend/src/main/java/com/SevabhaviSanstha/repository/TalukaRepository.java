package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.Taluka;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TalukaRepository extends JpaRepository<Taluka, Integer> {
    List<Taluka> findByDistrictId(Integer districtId);
    Optional<Taluka> findByDistrictIdAndNameEnIgnoreCase(Integer districtId, String nameEn);
}

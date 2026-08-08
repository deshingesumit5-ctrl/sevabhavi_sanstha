package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {
    List<City> findByDistrictId(Integer districtId);
}

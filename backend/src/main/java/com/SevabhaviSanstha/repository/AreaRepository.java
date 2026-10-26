package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {
    @Query("SELECT a FROM Area a WHERE a.taluka.id = :talukaId AND (a.isActive IS NULL OR a.isActive = true) ORDER BY a.nameMr ASC")
    List<Area> findActiveByTalukaId(@Param("talukaId") Integer talukaId);
}

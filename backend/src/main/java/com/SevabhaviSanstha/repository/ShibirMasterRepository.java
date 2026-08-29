package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.ShibirMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShibirMasterRepository extends JpaRepository<ShibirMaster, Integer> {
    List<ShibirMaster> findByIsActiveTrue();
}

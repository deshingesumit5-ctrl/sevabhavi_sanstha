package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MaritalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaritalStatusRepository extends JpaRepository<MaritalStatus, Integer> {
    List<MaritalStatus> findAllByOrderBySortOrderAsc();
}

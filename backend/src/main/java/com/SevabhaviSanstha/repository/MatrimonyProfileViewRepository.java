package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MatrimonyProfileView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatrimonyProfileViewRepository extends JpaRepository<MatrimonyProfileView, Integer> {
    boolean existsByViewerIdAndViewedProfileId(Integer viewerId, Integer viewedProfileId);
    long countByViewerId(Integer viewerId);
    List<MatrimonyProfileView> findByViewerId(Integer viewerId);
}

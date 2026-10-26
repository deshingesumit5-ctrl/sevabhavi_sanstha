package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MarriageRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarriageRegistrationRepository extends JpaRepository<MarriageRegistration, Integer>, JpaSpecificationExecutor<MarriageRegistration> {
    Optional<MarriageRegistration> findByMobile(String mobile);
    Optional<MarriageRegistration> findByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByEmail(String email);

    @Query("SELECT m FROM MarriageRegistration m WHERE (m.mobile = :identifier OR m.email = :identifier)")
    Optional<MarriageRegistration> findByMobileOrEmail(@Param("identifier") String identifier);

    Page<MarriageRegistration> findByApprovalStatus(String approvalStatus, Pageable pageable);

    @Query("SELECT m FROM MarriageRegistration m WHERE m.approvalStatus = 'APPROVED' AND m.profileType <> :profileType AND m.id <> :excludeId AND (:currentUserId IS NULL OR m.id <> :currentUserId) ORDER BY m.createdAt DESC")
    List<MarriageRegistration> findSimilarProfiles(@Param("profileType") String profileType, @Param("excludeId") Integer excludeId, @Param("currentUserId") Integer currentUserId, Pageable pageable);
}

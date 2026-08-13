package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.RegistrationDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface RegistrationDraftRepository extends JpaRepository<RegistrationDraft, String> {
    void deleteByUpdatedAtBefore(LocalDateTime cutoff);
}

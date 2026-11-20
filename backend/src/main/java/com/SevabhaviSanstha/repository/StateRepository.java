package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StateRepository extends JpaRepository<State, Integer> {
    Optional<State> findByNameEnIgnoreCase(String nameEn);
}

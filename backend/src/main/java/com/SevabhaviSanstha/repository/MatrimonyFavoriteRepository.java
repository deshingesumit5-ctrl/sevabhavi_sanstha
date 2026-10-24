package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.MatrimonyFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatrimonyFavoriteRepository extends JpaRepository<MatrimonyFavorite, Integer> {
    List<MatrimonyFavorite> findByUserId(Integer userId);
    Optional<MatrimonyFavorite> findByUserIdAndFavoriteProfileId(Integer userId, Integer favoriteProfileId);
    boolean existsByUserIdAndFavoriteProfileId(Integer userId, Integer favoriteProfileId);
    void deleteByUserIdAndFavoriteProfileId(Integer userId, Integer favoriteProfileId);
}

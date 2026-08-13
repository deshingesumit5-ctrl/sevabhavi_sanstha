package com.SevabhaviSanstha.repository;

import com.SevabhaviSanstha.entity.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    List<GalleryImage> findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(String category);

    List<GalleryImage> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<GalleryImage> findByCategoryAndSectionKeyAndIsActiveTrue(String category, String sectionKey);
}
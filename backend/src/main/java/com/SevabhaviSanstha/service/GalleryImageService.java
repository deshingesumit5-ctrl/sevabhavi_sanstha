package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.GalleryImage;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface GalleryImageService {
    GalleryImage uploadImage(MultipartFile file, String title, String description,
                              String category, String sectionKey, String uploadedBy) throws Exception;

    GalleryImage updateImageDetails(Long id, MultipartFile file, String title, String description,
                                     String sectionKey) throws Exception;

    List<GalleryImage> getAllActive();

    List<GalleryImage> getByCategory(String category);

    void deleteImage(Long id) throws Exception;

    GalleryImage toggleActive(Long id);
}
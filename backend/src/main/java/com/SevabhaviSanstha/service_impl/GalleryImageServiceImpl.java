package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.GalleryImage;
import com.SevabhaviSanstha.repository.GalleryImageRepository;
import com.SevabhaviSanstha.service.GalleryImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class GalleryImageServiceImpl implements GalleryImageService {

    private final GalleryImageRepository repository;

    // configurable in application.properties: app.upload.dir=uploads/gallery
    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;

    public GalleryImageServiceImpl(GalleryImageRepository repository) {
        this.repository = repository;
    }

    @Override
    public GalleryImage uploadImage(MultipartFile file, String title, String description,
                                     String category, String sectionKey, String uploadedBy) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("फाईल रिकामी आहे");
        }

        // ensure upload folder exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // unique filename
        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
        String fileName = UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // this is the URL the frontend will use — matches WebConfig mapping below
        String imageUrl = "/uploads/gallery/" + fileName;

        GalleryImage image = new GalleryImage();
        image.setTitle(title);
        image.setDescription(description);
        image.setImageUrl(imageUrl);
        image.setCategory(category != null ? category : "gallery");
        image.setSectionKey(sectionKey);
        image.setUploadedBy(uploadedBy);

        // if this category+section already has an image (e.g. home_banner, about_us),
        // replace it instead of piling up duplicates
        if (sectionKey != null && !category.equals("gallery") && !category.equals("activity")) {
            List<GalleryImage> existing = repository.findByCategoryAndSectionKeyAndIsActiveTrue(category, sectionKey);
            for (GalleryImage old : existing) {
                old.setIsActive(false);
                repository.save(old);
            }
        }

        return repository.save(image);
    }

    @Override
    public List<GalleryImage> getAllActive() {
        return repository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Override
    public List<GalleryImage> getByCategory(String category) {
        return repository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
    }

    @Override
    public void deleteImage(Long id) throws Exception {
        GalleryImage image = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("फोटो सापडला नाही"));

        // remove file from disk
        try {
            String relativePath = image.getImageUrl().replace("/uploads/gallery/", "");
            Path filePath = Paths.get(uploadDir).resolve(relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}

        repository.delete(image);
    }

    @Override
    public GalleryImage toggleActive(Long id) {
        GalleryImage image = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("फोटो सापडला नाही"));
        image.setIsActive(!image.getIsActive());
        return repository.save(image);
    }

    @Override
    public GalleryImage updateImageDetails(Long id, MultipartFile file, String title, String description, String sectionKey) throws Exception {
        GalleryImage image = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("फोटो सापडला नाही"));

        if (file != null && !file.isEmpty()) {
            if (image.getImageUrl() != null) {
                try {
                    String relativePath = image.getImageUrl().replace("/uploads/gallery/", "");
                    Path oldFilePath = Paths.get(uploadDir).resolve(relativePath);
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException ignored) {}
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            image.setImageUrl("/uploads/gallery/" + fileName);
        }

        if (title != null) {
            image.setTitle(title);
        }
        if (description != null) {
            image.setDescription(description);
        }
        if (sectionKey != null) {
            image.setSectionKey(sectionKey);
        }

        return repository.save(image);
    }
}
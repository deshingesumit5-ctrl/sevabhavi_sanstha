package com.SevabhaviSanstha.service_impl;

import com.SevabhaviSanstha.entity.Category;
import com.SevabhaviSanstha.repository.CategoryRepository;
import com.SevabhaviSanstha.service.CategoryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repository;

    @Value("${app.upload.dir:uploads/gallery}")
    private String uploadDir;

    public CategoryServiceImpl(CategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Category> getAllActiveCategories() {
        return repository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Override
    public Category createCategory(MultipartFile file, String title, String description, String categoryKey) throws Exception {
        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
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

            imageUrl = "/uploads/gallery/" + fileName;
        }

        Category category = new Category();
        category.setTitle(title);
        category.setDescription(description);
        category.setImageUrl(imageUrl);
        category.setCategoryKey(categoryKey);
        category.setIsActive(true);

        return repository.save(category);
    }

    @Override
    public Category updateCategory(Long id, MultipartFile file, String title, String description) throws Exception {
        Category category = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("श्रेणी सापडली नाही"));

        category.setTitle(title);
        category.setDescription(description);

        if (file != null && !file.isEmpty()) {
            // Delete old file from disk
            if (category.getImageUrl() != null) {
                try {
                    String relativePath = category.getImageUrl().replace("/uploads/gallery/", "");
                    Path oldFilePath = Paths.get(uploadDir).resolve(relativePath);
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException ignored) {}
            }

            // Save new file
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

            category.setImageUrl("/uploads/gallery/" + fileName);
        }

        return repository.save(category);
    }

    @Override
    public void deleteCategory(Long id) throws Exception {
        Category category = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("श्रेणी सापडली नाही"));

        // remove file from disk
        if (category.getImageUrl() != null) {
            try {
                String relativePath = category.getImageUrl().replace("/uploads/gallery/", "");
                Path filePath = Paths.get(uploadDir).resolve(relativePath);
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {}
        }

        repository.delete(category);
    }
}

package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.entity.Category;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CategoryService {
    List<Category> getAllActiveCategories();
    Category createCategory(MultipartFile file, String title, String description, String categoryKey) throws Exception;
    Category updateCategory(Long id, MultipartFile file, String title, String description) throws Exception;
    void deleteCategory(Long id) throws Exception;
}

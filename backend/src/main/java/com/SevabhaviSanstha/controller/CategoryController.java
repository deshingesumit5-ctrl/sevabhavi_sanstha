package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.Category;
import com.SevabhaviSanstha.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(service.getAllActiveCategories());
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "categoryKey", required = false) String categoryKey
    ) {
        try {
            Category saved = service.createCategory(file, title, description, categoryKey);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST}, consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            Category updated = service.updateCategory(id, file, title, description);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteCategory(id);
            return ResponseEntity.ok(Map.of("message", "श्रेणी हटवली"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

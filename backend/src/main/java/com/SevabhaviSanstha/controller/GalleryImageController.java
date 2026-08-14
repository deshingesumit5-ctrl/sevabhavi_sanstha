package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.GalleryImage;
import com.SevabhaviSanstha.service.GalleryImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gallery")
public class GalleryImageController {

    private final GalleryImageService service;

    public GalleryImageController(GalleryImageService service) {
        this.service = service;
    }

    // Public: get all active images (used by gallery page)
    @GetMapping
    public ResponseEntity<List<GalleryImage>> getAll() {
        return ResponseEntity.ok(service.getAllActive());
    }

    // Public: get images for one section, e.g. /api/gallery/category/home_banner
    @GetMapping("/category/{category}")
    public ResponseEntity<List<GalleryImage>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(service.getByCategory(category));
    }

    // Admin: upload a photo — used from every "फोटो अपलोड करा" box on the site
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", defaultValue = "gallery") String category,
            @RequestParam(value = "sectionKey", required = false) String sectionKey
    ) {
        try {
            String adminName = SecurityContextHolder.getContext().getAuthentication().getName();
            GalleryImage saved = service.uploadImage(file, title, description, category, sectionKey, adminName);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "sectionKey", required = false) String sectionKey
    ) {
        try {
            GalleryImage updated = service.updateImageDetails(id, file, title, description, sectionKey);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteImage(id);
            return ResponseEntity.ok(Map.of("message", "फोटो हटवला"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GalleryImage> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }
}
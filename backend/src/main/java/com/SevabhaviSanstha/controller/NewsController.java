package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.News;
import com.SevabhaviSanstha.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsService newsService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<News> createNews(@RequestBody News news) {
        News saved = newsService.saveNews(news);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<News>> getAllNews() {
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNews(@PathVariable Integer id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok().build();
    }
}

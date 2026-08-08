package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.Height;
import com.SevabhaviSanstha.service.HeightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/heights")
public class HeightController {

    @Autowired
    private HeightService heightService;

    @GetMapping
    public List<Height> getAllHeights() {
        return heightService.getAllHeights();
    }
}
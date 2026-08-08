package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.Religion;
import com.SevabhaviSanstha.service.ReligionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/religions")
public class ReligionController {

    @Autowired
    private ReligionService religionService;

    @GetMapping
    public List<Religion> getAllReligions() {
        return religionService.getAllReligions();
    }
}
package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.dto.DashboardStatsDTO;
import com.SevabhaviSanstha.dto.TodayRegistrationDTO;
import com.SevabhaviSanstha.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/today")
    public ResponseEntity<List<TodayRegistrationDTO>> getTodayRegistrations() {
        return ResponseEntity.ok(dashboardService.getTodayRegistrations());
    }
}

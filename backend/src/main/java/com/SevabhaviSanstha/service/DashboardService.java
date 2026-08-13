package com.SevabhaviSanstha.service;

import com.SevabhaviSanstha.dto.DashboardStatsDTO;
import com.SevabhaviSanstha.dto.TodayRegistrationDTO;
import java.util.List;

public interface DashboardService {
    DashboardStatsDTO getDashboardStats();
    List<TodayRegistrationDTO> getTodayRegistrations();
}

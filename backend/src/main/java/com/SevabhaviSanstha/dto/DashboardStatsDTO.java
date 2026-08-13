package com.SevabhaviSanstha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long todayRegistrationsCount;
    private long memberTotalCount;
    private long memberAnnualCount;
    private long memberLifetimeCount;
    private long marriageTotalCount;
    private long galleryTotalCount;
    private long newsTotalCount;
}

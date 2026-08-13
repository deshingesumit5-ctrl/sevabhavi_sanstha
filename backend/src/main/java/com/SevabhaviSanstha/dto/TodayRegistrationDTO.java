package com.SevabhaviSanstha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodayRegistrationDTO {
    private String id;
    private String name;
    private String type; // e.g. "सदस्य नोंदणी", "विवाह नोंदणी", "चौकशी अर्ज"
    private String mobile;
    private LocalDateTime createdAt;
    private String status;
}

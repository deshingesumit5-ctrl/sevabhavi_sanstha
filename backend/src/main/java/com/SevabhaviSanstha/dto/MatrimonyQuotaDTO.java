package com.SevabhaviSanstha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrimonyQuotaDTO {
    private String profileType;
    private String packageType;
    private BigDecimal packageAmount;
    private Integer biodataLimit;
    private Long usedViews;
    private Long remainingViews;
    private List<Integer> viewedProfileIds;
}

package com.SevabhaviSanstha.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MatrimonyFilterDTO {
    private String profileType; // 'all', 'bride', 'groom'
    private Integer minAge;
    private Integer maxAge;
    private String caste;
    private String educationLevel;
    private String occupationType;
    private Integer stateId;
    private Integer districtId;
    private String city;
    private String sort; // 'newest', 'ageAsc', 'ageDesc'

    public MatrimonyFilterDTO(String profileType, Integer minAge, Integer maxAge, String caste,
                              String educationLevel, String occupationType, Integer stateId,
                              Integer districtId, String city, String sort) {
        this.profileType = profileType;
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.caste = caste;
        this.educationLevel = educationLevel;
        this.occupationType = occupationType;
        this.stateId = stateId;
        this.districtId = districtId;
        this.city = city;
        this.sort = sort;
    }
}

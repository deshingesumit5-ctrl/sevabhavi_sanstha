package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.entity.*;
import com.SevabhaviSanstha.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lookups")
public class LookupController {

    @Autowired
    private StateRepository stateRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private TalukaRepository talukaRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private BloodGroupRepository bloodGroupRepository;

    @Autowired
    private MaritalStatusRepository maritalStatusRepository;

    @Autowired
    private GenderRepository genderRepository;

    @GetMapping("/states")
    public List<State> getStates() {
        return stateRepository.findAll();
    }

    @GetMapping("/districts")
    public List<District> getDistricts(@RequestParam Integer stateId) {
        return districtRepository.findByStateId(stateId);
    }

    @GetMapping("/talukas")
    public List<Taluka> getTalukas(@RequestParam Integer districtId) {
        return talukaRepository.findByDistrictId(districtId);
    }

    @GetMapping("/cities")
    public List<City> getCities(@RequestParam(required = false) Integer districtId) {
        if (districtId != null) {
            List<City> cities = cityRepository.findByDistrictId(districtId);
            if (!cities.isEmpty()) {
                return cities;
            }
        }
        return cityRepository.findAll();
    }

    @GetMapping("/blood-groups")
    public List<BloodGroup> getBloodGroups() {
        return bloodGroupRepository.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/marital-statuses")
    public List<MaritalStatus> getMaritalStatuses() {
        return maritalStatusRepository.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/genders")
    public List<Gender> getGenders() {
        return genderRepository.findAllByOrderBySortOrderAsc();
    }
}


package com.SevabhaviSanstha.controller;

import com.SevabhaviSanstha.config.LocationCatalog;
import com.SevabhaviSanstha.entity.*;
import com.SevabhaviSanstha.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/lookups", "/api"})
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

    @Autowired
    private AreaRepository areaRepository;

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

    @GetMapping("/areas")
    public List<Area> getAreas(@RequestParam Integer talukaId) {
        return areaRepository.findActiveByTalukaId(talukaId);
    }

    @GetMapping("/cities")
    public List<City> getCities(@RequestParam(required = false) Integer districtId) {
        if (districtId != null) {
            return cityRepository.findByDistrictId(districtId);
        }
        return cityRepository.findAll();
    }

    /**
     * Permanent Address restriction endpoint: Ratnagiri District only,
     * returning DB IDs for Maharashtra + Ratnagiri + all 9 Talukas, plus villages and PIN codes.
     */
    @GetMapping("/ratnagiri")
    public Map<String, Object> getRatnagiriLocationData() {
        State mh = stateRepository.findByNameEnIgnoreCase("Maharashtra").orElse(null);
        District ratnagiri = (mh != null)
                ? districtRepository.findByStateIdAndNameEnIgnoreCase(mh.getId(), "Ratnagiri").orElse(null)
                : null;

        List<Taluka> dbTalukas = (ratnagiri != null)
                ? talukaRepository.findByDistrictId(ratnagiri.getId())
                : Collections.emptyList();

        Map<String, Taluka> talukaByEn = new HashMap<>();
        for (Taluka t : dbTalukas) {
            if (t.getNameEn() != null) {
                talukaByEn.put(t.getNameEn().trim().toLowerCase(), t);
            }
        }

        List<Map<String, Object>> talukasPayload = new ArrayList<>();
        Set<String> allPincodes = new LinkedHashSet<>();

        for (LocationCatalog.RatnagiriTalukaData tData : LocationCatalog.RATNAGIRI_TALUKAS) {
            Taluka dbMatch = talukaByEn.get(tData.nameEn().toLowerCase());
            Map<String, Object> tMap = new LinkedHashMap<>();
            tMap.put("id", dbMatch != null ? dbMatch.getId() : null);
            tMap.put("nameMr", tData.nameMr());
            tMap.put("nameEn", tData.nameEn());
            tMap.put("villages", tData.villages());
            tMap.put("pincodes", tData.pincodes());
            allPincodes.addAll(tData.pincodes());
            talukasPayload.add(tMap);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("stateId", mh != null ? mh.getId() : null);
        response.put("stateNameMr", "महाराष्ट्र");
        response.put("stateNameEn", "Maharashtra");
        response.put("districtId", ratnagiri != null ? ratnagiri.getId() : null);
        response.put("districtNameMr", "रत्नागिरी");
        response.put("districtNameEn", "Ratnagiri");
        response.put("talukas", talukasPayload);
        response.put("allPincodes", allPincodes);
        return response;
    }

    /**
     * Current Address restriction endpoint: Pune District only with Pune & PCMC suburbs.
     */
    @GetMapping("/pune-suburbs")
    public Map<String, Object> getPuneSuburbsData() {
        State mh = stateRepository.findByNameEnIgnoreCase("Maharashtra").orElse(null);
        District pune = (mh != null)
                ? districtRepository.findByStateIdAndNameEnIgnoreCase(mh.getId(), "Pune").orElse(null)
                : null;

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("stateId", mh != null ? mh.getId() : null);
        response.put("districtId", pune != null ? pune.getId() : null);
        response.put("districtNameMr", "पुणे");
        response.put("districtNameEn", "Pune");
        response.put("suburbs", LocationCatalog.PUNE_SUBURBS);
        return response;
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

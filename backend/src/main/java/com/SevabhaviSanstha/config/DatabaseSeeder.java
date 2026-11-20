package com.SevabhaviSanstha.config;

import com.SevabhaviSanstha.entity.*;
import com.SevabhaviSanstha.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final TalukaRepository talukaRepository;
    private final CityRepository cityRepository;
    private final PasswordEncoder passwordEncoder;
    private final DonationTypeRepository donationTypeRepository;
    private final DonationPurposeRepository donationPurposeRepository;

    public DatabaseSeeder(AdminRepository adminRepository,
                          StateRepository stateRepository,
                          DistrictRepository districtRepository,
                          TalukaRepository talukaRepository,
                          CityRepository cityRepository,
                          PasswordEncoder passwordEncoder,
                          DonationTypeRepository donationTypeRepository,
                          DonationPurposeRepository donationPurposeRepository) {
        this.adminRepository = adminRepository;
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.talukaRepository = talukaRepository;
        this.cityRepository = cityRepository;
        this.passwordEncoder = passwordEncoder;
        this.donationTypeRepository = donationTypeRepository;
        this.donationPurposeRepository = donationPurposeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        String defaultEmail = "admin@gmail.com";
        Optional<Admin> adminOpt = adminRepository.findByEmail(defaultEmail);

        if (adminOpt.isEmpty()) {
            Admin defaultAdmin = Admin.builder()
                    .email(defaultEmail)
                    .password(passwordEncoder.encode("123456"))
                    .role("ADMIN")
                    .build();
            adminRepository.save(defaultAdmin);
            System.out.println("Default admin user (" + defaultEmail + ") has been seeded successfully.");
        } else {
            System.out.println("Admin user (" + defaultEmail + ") already exists.");
        }

        seedAllIndiaLocations();

        if (donationTypeRepository.count() == 0) {
            DonationType type1 = new DonationType();
            type1.setCode("ONE_TIME");
            type1.setNameEn("One Time");
            type1.setNameMr("एकरकमी देणगी");
            type1.setIsActive(true);
            donationTypeRepository.save(type1);

            DonationType type2 = new DonationType();
            type2.setCode("MONTHLY");
            type2.setNameEn("Monthly");
            type2.setNameMr("मासिक देणगी");
            type2.setIsActive(true);
            donationTypeRepository.save(type2);

            DonationType type3 = new DonationType();
            type3.setCode("ANNUAL");
            type3.setNameEn("Annual");
            type3.setNameMr("वार्षिक देणगी");
            type3.setIsActive(true);
            donationTypeRepository.save(type3);

            System.out.println("Default donation types seeded successfully.");
        }

        if (donationPurposeRepository.count() == 0) {
            String[][] defaultPurposes = {
                {"GENERAL", "General Fund", "सर्वसाधारण निधी / समाजोपयोगी कार्य", "संस्थेच्या विविध सामाजिक उपक्रमांसाठी"},
                {"EDUCATION", "Education Support", "शिक्षण सहाय्य व शिष्यवृत्ती", "गरजू विद्यार्थ्यांसाठी शैक्षणिक मदत"},
                {"MEDICAL", "Medical Aid", "वैद्यकीय मदत व आरोग्य शिबीर", "आरोग्य व रुग्ण सेवेसाठी"},
                {"DISASTER", "Disaster Relief", "आपत्ती व्यवस्थापन व मदत निधी", "नैसर्गिक आपत्ती काळात मदतीसाठी"},
                {"CULTURAL", "Cultural & Event Fund", "सांस्कृतिक व सामाजिक कार्यक्रम", "सांस्कृतिक व सामाजिक कार्यक्रमांसाठी"}
            };
            for (String[] p : defaultPurposes) {
                DonationPurpose dp = new DonationPurpose();
                dp.setCode(p[0]);
                dp.setNameEn(p[1]);
                dp.setNameMr(p[2]);
                dp.setDescriptionMr(p[3]);
                dp.setIsActive(true);
                donationPurposeRepository.save(dp);
            }
            System.out.println("Default donation purposes seeded successfully.");
        }
    }

    private void seedAllIndiaLocations() {
        try {
            ClassPathResource resource = new ClassPathResource("data/india_locations.json");
            if (!resource.exists()) {
                return;
            }
            List<SeedState> seedStates;
            try (InputStream is = resource.getInputStream()) {
                String json = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                List<Object> rawList = JsonParserFactory.getJsonParser().parseList(json);
                seedStates = toSeedStates(rawList);
            }

            // Preload all existing location tables in 4 queries instead of 1,500+ N+1 queries on every startup
            Map<String, State> existingStatesByEn = new HashMap<>();
            for (State s : stateRepository.findAll()) {
                if (s.getNameEn() != null) {
                    existingStatesByEn.put(s.getNameEn().trim().toLowerCase(), s);
                }
            }

            Map<String, District> existingDistrictsByKey = new HashMap<>();
            for (District d : districtRepository.findAll()) {
                if (d.getState() != null && d.getNameEn() != null) {
                    existingDistrictsByKey.put(d.getState().getId() + "::" + d.getNameEn().trim().toLowerCase(), d);
                }
            }

            Map<Integer, Set<String>> existingTalukasByDistrict = new HashMap<>();
            for (Taluka t : talukaRepository.findAll()) {
                if (t.getDistrict() != null && t.getNameEn() != null) {
                    existingTalukasByDistrict
                            .computeIfAbsent(t.getDistrict().getId(), k -> new HashSet<>())
                            .add(t.getNameEn().trim().toLowerCase());
                }
            }

            Map<Integer, Set<String>> existingCitiesByDistrict = new HashMap<>();
            for (City c : cityRepository.findAll()) {
                if (c.getDistrict() != null && c.getNameEn() != null) {
                    existingCitiesByDistrict
                            .computeIfAbsent(c.getDistrict().getId(), k -> new HashSet<>())
                            .add(c.getNameEn().trim().toLowerCase());
                }
            }

            int addedStates = 0;
            int addedDistricts = 0;
            List<Taluka> allNewTalukas = new ArrayList<>();
            List<City> allNewCities = new ArrayList<>();

            for (SeedState sSeed : seedStates) {
                if (sSeed.nameEn == null || sSeed.nameEn.isBlank()) continue;
                String sKey = sSeed.nameEn.trim().toLowerCase();
                State state = existingStatesByEn.get(sKey);
                if (state == null) {
                    state = new State();
                    state.setNameEn(sSeed.nameEn.trim());
                    state.setNameMr(sSeed.nameMr != null && !sSeed.nameMr.isBlank() ? sSeed.nameMr.trim() : sSeed.nameEn.trim());
                    state = stateRepository.save(state);
                    existingStatesByEn.put(sKey, state);
                    addedStates++;
                }

                if (sSeed.districts == null) continue;

                for (SeedDistrict dSeed : sSeed.districts) {
                    if (dSeed.nameEn == null || dSeed.nameEn.isBlank()) continue;
                    String dKey = state.getId() + "::" + dSeed.nameEn.trim().toLowerCase();
                    District district = existingDistrictsByKey.get(dKey);
                    if (district == null) {
                        district = new District();
                        district.setState(state);
                        district.setNameEn(dSeed.nameEn.trim());
                        district.setNameMr(dSeed.nameMr != null && !dSeed.nameMr.isBlank() ? dSeed.nameMr.trim() : dSeed.nameEn.trim());
                        district = districtRepository.save(district);
                        existingDistrictsByKey.put(dKey, district);
                        addedDistricts++;
                    }

                    // Collect missing Talukas for this District
                    if (dSeed.talukas != null && !dSeed.talukas.isEmpty()) {
                        Set<String> existingTalukas = existingTalukasByDistrict.computeIfAbsent(district.getId(), k -> new HashSet<>());
                        for (SeedName tSeed : dSeed.talukas) {
                            if (tSeed.nameEn == null || tSeed.nameEn.isBlank()) continue;
                            String tKey = tSeed.nameEn.trim().toLowerCase();
                            if (!existingTalukas.contains(tKey)) {
                                Taluka t = new Taluka();
                                t.setDistrict(district);
                                t.setNameEn(tSeed.nameEn.trim());
                                t.setNameMr(tSeed.nameMr != null && !tSeed.nameMr.isBlank() ? tSeed.nameMr.trim() : tSeed.nameEn.trim());
                                allNewTalukas.add(t);
                                existingTalukas.add(tKey);
                            }
                        }
                    }

                    // Collect missing Cities for this District
                    if (dSeed.cities != null && !dSeed.cities.isEmpty()) {
                        Set<String> existingCities = existingCitiesByDistrict.computeIfAbsent(district.getId(), k -> new HashSet<>());
                        for (SeedName cSeed : dSeed.cities) {
                            if (cSeed.nameEn == null || cSeed.nameEn.isBlank()) continue;
                            String cKey = cSeed.nameEn.trim().toLowerCase();
                            if (!existingCities.contains(cKey)) {
                                City c = new City();
                                c.setDistrict(district);
                                c.setNameEn(cSeed.nameEn.trim());
                                c.setNameMr(cSeed.nameMr != null && !cSeed.nameMr.isBlank() ? cSeed.nameMr.trim() : cSeed.nameEn.trim());
                                allNewCities.add(c);
                                existingCities.add(cKey);
                            }
                        }
                    }
                }
            }

            if (!allNewTalukas.isEmpty()) {
                talukaRepository.saveAll(allNewTalukas);
            }
            if (!allNewCities.isEmpty()) {
                cityRepository.saveAll(allNewCities);
            }

            if (addedStates > 0 || addedDistricts > 0 || !allNewTalukas.isEmpty() || !allNewCities.isEmpty()) {
                System.out.printf("Seeded India locations: +%d states, +%d districts, +%d talukas, +%d cities%n",
                        addedStates, addedDistricts, allNewTalukas.size(), allNewCities.size());
            }
        } catch (Exception e) {
            System.err.println("Error seeding All-India locations: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<SeedState> toSeedStates(List<Object> rawList) {
        List<SeedState> result = new ArrayList<>();
        if (rawList == null) return result;
        for (Object item : rawList) {
            if (!(item instanceof Map<?, ?> sMap)) continue;
            SeedState s = new SeedState();
            s.nameEn = asString(sMap.get("nameEn"));
            s.nameMr = asString(sMap.get("nameMr"));
            s.districts = new ArrayList<>();
            Object dObj = sMap.get("districts");
            if (dObj instanceof List<?> dList) {
                for (Object dItem : dList) {
                    if (!(dItem instanceof Map<?, ?> dMap)) continue;
                    SeedDistrict d = new SeedDistrict();
                    d.nameEn = asString(dMap.get("nameEn"));
                    d.nameMr = asString(dMap.get("nameMr"));
                    d.talukas = toSeedNames(dMap.get("talukas"));
                    d.cities = toSeedNames(dMap.get("cities"));
                    s.districts.add(d);
                }
            }
            result.add(s);
        }
        return result;
    }

    private List<SeedName> toSeedNames(Object raw) {
        List<SeedName> list = new ArrayList<>();
        if (!(raw instanceof List<?> items)) return list;
        for (Object item : items) {
            if (!(item instanceof Map<?, ?> map)) continue;
            SeedName n = new SeedName();
            n.nameEn = asString(map.get("nameEn"));
            n.nameMr = asString(map.get("nameMr"));
            list.add(n);
        }
        return list;
    }

    private String asString(Object val) {
        return val != null ? String.valueOf(val) : null;
    }

    static class SeedState {
        public String nameEn;
        public String nameMr;
        public List<SeedDistrict> districts;
    }

    static class SeedDistrict {
        public String nameEn;
        public String nameMr;
        public List<SeedName> talukas;
        public List<SeedName> cities;
    }

    static class SeedName {
        public String nameEn;
        public String nameMr;
    }
}

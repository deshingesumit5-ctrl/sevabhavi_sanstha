package com.SevabhaviSanstha.config;

import com.SevabhaviSanstha.entity.Admin;
import com.SevabhaviSanstha.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

import com.SevabhaviSanstha.entity.City;
import com.SevabhaviSanstha.repository.CityRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final CityRepository cityRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.SevabhaviSanstha.repository.DonationTypeRepository donationTypeRepository;
    private final com.SevabhaviSanstha.repository.DonationPurposeRepository donationPurposeRepository;

    public DatabaseSeeder(AdminRepository adminRepository,
                          CityRepository cityRepository,
                          PasswordEncoder passwordEncoder,
                          com.SevabhaviSanstha.repository.DonationTypeRepository donationTypeRepository,
                          com.SevabhaviSanstha.repository.DonationPurposeRepository donationPurposeRepository) {
        this.adminRepository = adminRepository;
        this.cityRepository = cityRepository;
        this.passwordEncoder = passwordEncoder;
        this.donationTypeRepository = donationTypeRepository;
        this.donationPurposeRepository = donationPurposeRepository;
    }

    @Override
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

        if (cityRepository.count() == 0) {
            String[][] cityNames = {
                {"Dapoli", "दापोली"},
                {"Mandangad", "मंडणगड"},
                {"Chiplun", "चिपळूण"},
                {"Khed", "खेड"},
                {"Guhagar", "गुहागर"},
                {"Ratnagiri", "रत्नागिरी"},
                {"Pune", "पुणे"},
                {"Mumbai", "मुंबई"},
                {"Thane", "ठाणे"},
                {"Navi Mumbai", "नवी मुंबई"},
                {"Palghar", "पालघर"},
                {"Kolhapur", "कोल्हापूर"},
                {"Sangli", "सांगली"},
                {"Satara", "सातारा"},
                {"Nashik", "नाशिक"},
                {"Nagpur", "नागपूर"},
                {"Solapur", "सोलापूर"},
                {"Chhatrapati Sambhajinagar", "छत्रपती संभाजीनगर"},
                {"Sindhudurg", "सिंधुदुर्ग"},
                {"Raigad", "रायगड"},
                {"Other", "इतर"}
            };
            for (String[] names : cityNames) {
                City city = new City();
                city.setNameEn(names[0]);
                city.setNameMr(names[1]);
                cityRepository.save(city);
            }
            System.out.println("Default cities seeded successfully.");
        }

        if (donationTypeRepository.count() == 0) {
            com.SevabhaviSanstha.entity.DonationType type1 = new com.SevabhaviSanstha.entity.DonationType();
            type1.setCode("ONE_TIME");
            type1.setNameEn("One Time");
            type1.setNameMr("एकरकमी देणगी");
            type1.setIsActive(true);
            donationTypeRepository.save(type1);

            com.SevabhaviSanstha.entity.DonationType type2 = new com.SevabhaviSanstha.entity.DonationType();
            type2.setCode("MONTHLY");
            type2.setNameEn("Monthly");
            type2.setNameMr("मासिक देणगी");
            type2.setIsActive(true);
            donationTypeRepository.save(type2);

            com.SevabhaviSanstha.entity.DonationType type3 = new com.SevabhaviSanstha.entity.DonationType();
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
                com.SevabhaviSanstha.entity.DonationPurpose dp = new com.SevabhaviSanstha.entity.DonationPurpose();
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
}

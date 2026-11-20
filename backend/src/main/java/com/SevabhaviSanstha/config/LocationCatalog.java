package com.SevabhaviSanstha.config;

import java.util.*;

/**
 * Curated location datasets for:
 * 1. Ratnagiri District (Permanent Address restriction): all 9 Talukas, villages, and valid PIN codes.
 * 2. Pune District & PCMC Suburbs (Current Address restriction): suburbs and PIN codes.
 */
public final class LocationCatalog {

    private LocationCatalog() {}

    public record VillageEntry(String nameMr, String nameEn, String pincode) {}

    public record RatnagiriTalukaData(
            String nameMr,
            String nameEn,
            List<VillageEntry> villages,
            List<String> pincodes
    ) {}

    public record PuneSuburbData(String nameMr, String nameEn, String pincode) {}

    public static final List<RatnagiriTalukaData> RATNAGIRI_TALUKAS = List.of(
        new RatnagiriTalukaData(
            "दापोली",
            "Dapoli",
            List.of(
                new VillageEntry("दापोली", "Dapoli", "415712"),
                new VillageEntry("मुरुड", "Murud", "415713"),
                new VillageEntry("हर्णे", "Harnai", "415713"),
                new VillageEntry("दाभोळ", "Dabhol", "415711"),
                new VillageEntry("आंजर्ले", "Anjarle", "415716"),
                new VillageEntry("केळशी", "Kelshi", "415717"),
                new VillageEntry("आतगाव केळशी", "Atgaon Kelshi", "415717"),
                new VillageEntry("वाकवली", "Wakavali", "415714"),
                new VillageEntry("जालगाव", "Jalgaon", "415712"),
                new VillageEntry("जामगे", "Jamage", "415712"),
                new VillageEntry("भडवले", "Bhadavale", "415712"),
                new VillageEntry("बुरोंडी", "Burondi", "415727"),
                new VillageEntry("पालगड", "Palgad", "415720"),
                new VillageEntry("लाडघर", "Ladghar", "415712"),
                new VillageEntry("कर्दे", "Karde", "415713"),
                new VillageEntry("आसुद", "Asud", "415713"),
                new VillageEntry("चिखलगाव", "Chikhalgaon", "415712"),
                new VillageEntry("पन्हाळे काझी", "Panhale Kazi", "415714"),
                new VillageEntry("उंबरशेत", "Umbarshet", "415714"),
                new VillageEntry("सातेरे", "Satere", "415712"),
                new VillageEntry("गिम्हवणे", "Gimhavane", "415712"),
                new VillageEntry("वणौशी", "Vanaushi", "415712"),
                new VillageEntry("कोळथरे", "Kolthare", "415715"),
                new VillageEntry("पाजपंढरी", "Pajpandhari", "415713"),
                new VillageEntry("इतर (दापोली तालुका)", "Other (Dapoli)", "415712")
            ),
            List.of("415711", "415712", "415713", "415714", "415715", "415716", "415717", "415720", "415727")
        ),
        new RatnagiriTalukaData(
            "मंडणगड",
            "Mandangad",
            List.of(
                new VillageEntry("मंडणगड", "Mandangad", "415203"),
                new VillageEntry("बाणकोट", "Bankot", "415203"),
                new VillageEntry("वेळास", "Velas", "415214"),
                new VillageEntry("म्हाप्रळ", "Mhapral", "415208"),
                new VillageEntry("देव्हारे", "Devhare", "415208"),
                new VillageEntry("पाभरे", "Pabhare", "415215"),
                new VillageEntry("विन्हे", "Vinhe", "415203"),
                new VillageEntry("सडे", "Sade", "415203"),
                new VillageEntry("कादवण", "Kadavan", "415203"),
                new VillageEntry("घराडी", "Gharadi", "415203"),
                new VillageEntry("कुडुक (बु)", "Kuduk Bk", "415203"),
                new VillageEntry("तिडे", "Tide", "415203"),
                new VillageEntry("आतखोल", "Atkhol", "415203"),
                new VillageEntry("वेरळ", "Veral", "415203"),
                new VillageEntry("तुळशी", "Tulshi", "415203"),
                new VillageEntry("शेनाळे", "Shenale", "415208"),
                new VillageEntry("उमरोली", "Umroli", "415203"),
                new VillageEntry("पलवणी", "Palvani", "415203"),
                new VillageEntry("बोरखत", "Borkhat", "415203"),
                new VillageEntry("आंबवणे", "Ambavane", "415203"),
                new VillageEntry("इतर (मंडणगड तालुका)", "Other (Mandangad)", "415203")
            ),
            List.of("415203", "415208", "415214", "415215")
        ),
        new RatnagiriTalukaData(
            "खेड",
            "Khed",
            List.of(
                new VillageEntry("खेड", "Khed", "415709"),
                new VillageEntry("भरणे", "Bharne", "415708"),
                new VillageEntry("लोटे", "Lote", "415622"),
                new VillageEntry("धामणंद", "Dhamnand", "415723"),
                new VillageEntry("शिवतर", "Shivtar", "415722"),
                new VillageEntry("अलोरे", "Alore", "415730"),
                new VillageEntry("खवटी", "Khavati", "415709"),
                new VillageEntry("तळे", "Tale", "415709"),
                new VillageEntry("पोसरे", "Posare", "415709"),
                new VillageEntry("दस्तुरी", "Dasturi", "415709"),
                new VillageEntry("वेरळ", "Veral", "415709"),
                new VillageEntry("सुसेरी", "Suseri", "415709"),
                new VillageEntry("काडवली", "Kadavali", "415709"),
                new VillageEntry("कुळवंडी", "Kulavandi", "415709"),
                new VillageEntry("घेरारसाळगड", "Gherarasalgad", "415709"),
                new VillageEntry("इतर (खेड तालुका)", "Other (Khed)", "415709")
            ),
            List.of("415622", "415708", "415709", "415722", "415723", "415730")
        ),
        new RatnagiriTalukaData(
            "चिपळूण",
            "Chiplun",
            List.of(
                new VillageEntry("चिपळूण", "Chiplun", "415605"),
                new VillageEntry("खेरडी", "Kherdi", "415641"),
                new VillageEntry("सावर्डे", "Sawarde", "415606"),
                new VillageEntry("पोफळी", "Pophali", "415604"),
                new VillageEntry("डेरवण", "Dervan", "415607"),
                new VillageEntry("अलोरे", "Alore", "415603"),
                new VillageEntry("पेढे", "Pedhe", "415605"),
                new VillageEntry("परशुराम", "Parshuram", "415605"),
                new VillageEntry("कामथे", "Kamathe", "415605"),
                new VillageEntry("वालोपे", "Walope", "415605"),
                new VillageEntry("मालघर", "Malghar", "415605"),
                new VillageEntry("पिंपळी", "Pimpli", "415702"),
                new VillageEntry("शिरगाव", "Shirgaon", "415605"),
                new VillageEntry("कळंबस्ते", "Kalambaste", "415605"),
                new VillageEntry("इतर (चिपळूण तालुका)", "Other (Chiplun)", "415605")
            ),
            List.of("415603", "415604", "415605", "415606", "415607", "415641", "415702")
        ),
        new RatnagiriTalukaData(
            "गुहागर",
            "Guhagar",
            List.of(
                new VillageEntry("गुहागर", "Guhagar", "415703"),
                new VillageEntry("वेळणेश्वर", "Velneshwar", "415724"),
                new VillageEntry("हेदवी", "Hedvi", "415725"),
                new VillageEntry("अबलोली", "Abloli", "415726"),
                new VillageEntry("पालशेत", "Palshet", "415728"),
                new VillageEntry("शृंगारतळी", "Shringartali", "415729"),
                new VillageEntry("अंजनवेल", "Anjanvel", "415703"),
                new VillageEntry("तवसाळ", "Tavasal", "415724"),
                new VillageEntry("पाटपन्हाळे", "Patpanhale", "415724"),
                new VillageEntry("असगोली", "Asagoli", "415703"),
                new VillageEntry("जांभारी", "Jambhari", "415703"),
                new VillageEntry("इतर (गुहागर तालुका)", "Other (Guhagar)", "415703")
            ),
            List.of("415703", "415724", "415725", "415726", "415728", "415729")
        ),
        new RatnagiriTalukaData(
            "संगमेश्वर",
            "Sangameshwar",
            List.of(
                new VillageEntry("संगमेश्वर", "Sangameshwar", "415611"),
                new VillageEntry("देवरुख", "Devrukh", "415804"),
                new VillageEntry("माखजन", "Makhjan", "415610"),
                new VillageEntry("आरवली", "Aravali", "415609"),
                new VillageEntry("कसबा", "Kasba", "415611"),
                new VillageEntry("साखरपा", "Sakharpa", "415801"),
                new VillageEntry("फणसवणे", "Phanasavane", "415611"),
                new VillageEntry("निवे", "Nive", "415803"),
                new VillageEntry("कडवई", "Kadavai", "415610"),
                new VillageEntry("मारळ", "Maral", "415804"),
                new VillageEntry("गोळवली", "Golavali", "415611"),
                new VillageEntry("इतर (संगमेश्वर तालुका)", "Other (Sangameshwar)", "415611")
            ),
            List.of("415609", "415610", "415611", "415801", "415803", "415804")
        ),
        new RatnagiriTalukaData(
            "रत्नागिरी",
            "Ratnagiri",
            List.of(
                new VillageEntry("रत्नागिरी", "Ratnagiri", "415612"),
                new VillageEntry("नाचणे", "Nachane", "415639"),
                new VillageEntry("मिरजोळे", "Mirjole", "415639"),
                new VillageEntry("पावस", "Pawas", "415615"),
                new VillageEntry("गणपतीपुळे", "Ganpatipule", "415620"),
                new VillageEntry("हातखंबा", "Hathkhamba", "415614"),
                new VillageEntry("कोतवडे", "Kotawade", "415616"),
                new VillageEntry("चाफे", "Chafe", "415613"),
                new VillageEntry("मालगुंड", "Malgund", "415615"),
                new VillageEntry("शिरगाव", "Shirgaon", "415629"),
                new VillageEntry("जयगड", "Jaigad", "415614"),
                new VillageEntry("भाट्ये", "Bhatye", "415612"),
                new VillageEntry("कर्ला", "Karla", "415612"),
                new VillageEntry("पोमेंडी", "Pomendi", "415612"),
                new VillageEntry("इतर (रत्नागिरी तालुका)", "Other (Ratnagiri)", "415612")
            ),
            List.of("415612", "415613", "415614", "415615", "415616", "415620", "415629", "415639")
        ),
        new RatnagiriTalukaData(
            "लांजा",
            "Lanja",
            List.of(
                new VillageEntry("लांजा", "Lanja", "416701"),
                new VillageEntry("सातवली", "Satavali", "416705"),
                new VillageEntry("वाकेड", "Vaked", "416712"),
                new VillageEntry("हर्चेरी", "Harchiri", "415805"),
                new VillageEntry("आंजणारी", "Anjanari", "416701"),
                new VillageEntry("भांबेड", "Bhambed", "416701"),
                new VillageEntry("कोर्ले", "Korle", "416701"),
                new VillageEntry("पुनस", "Punas", "416701"),
                new VillageEntry("इतर (लांजा तालुका)", "Other (Lanja)", "416701")
            ),
            List.of("415805", "416701", "416705", "416712")
        ),
        new RatnagiriTalukaData(
            "राजापूर",
            "Rajapur",
            List.of(
                new VillageEntry("राजापूर", "Rajapur", "416702"),
                new VillageEntry("ओणी", "Oni", "416704"),
                new VillageEntry("नाटे", "Nate", "416706"),
                new VillageEntry("जैतापूर", "Jaitapur", "416707"),
                new VillageEntry("पाचल", "Pachal", "416708"),
                new VillageEntry("रायपाटण", "Raypatan", "416703"),
                new VillageEntry("तळवडे", "Talavade", "416702"),
                new VillageEntry("सागवे", "Sagave", "416706"),
                new VillageEntry("आडिवरे", "Adivare", "416707"),
                new VillageEntry("कशेळी", "Kasheli", "416707"),
                new VillageEntry("देवाचे गोठणे", "Devache Gothane", "416702"),
                new VillageEntry("इतर (राजापूर तालुका)", "Other (Rajapur)", "416702")
            ),
            List.of("416702", "416703", "416704", "416706", "416707", "416708")
        )
    );

    public static final List<PuneSuburbData> PUNE_SUBURBS = List.of(
        new PuneSuburbData("कोथरूड", "Kothrud", "411038"),
        new PuneSuburbData("कर्वे नगर", "Karve Nagar", "411052"),
        new PuneSuburbData("वारजे", "Warje", "411058"),
        new PuneSuburbData("सिंहगड रोड", "Sinhagad Road", "411051"),
        new PuneSuburbData("बाणेर", "Baner", "411045"),
        new PuneSuburbData("बालेवाडी", "Balewadi", "411045"),
        new PuneSuburbData("औंध", "Aundh", "411007"),
        new PuneSuburbData("पाषाण", "Pashan", "411021"),
        new PuneSuburbData("वाकड", "Wakad", "411057"),
        new PuneSuburbData("हिंजवडी", "Hinjewadi", "411057"),
        new PuneSuburbData("पिंपरी", "Pimpri", "411018"),
        new PuneSuburbData("चिंचवड", "Chinchwad", "411033"),
        new PuneSuburbData("निगडी", "Nigdi", "411044"),
        new PuneSuburbData("आकुर्डी", "Akurdi", "411035"),
        new PuneSuburbData("भोसरी", "Bhosari", "411039"),
        new PuneSuburbData("हडपसर", "Hadapsar", "411028"),
        new PuneSuburbData("मगरपट्टा", "Magarpatta", "411013"),
        new PuneSuburbData("खराडी", "Kharadi", "411014"),
        new PuneSuburbData("विमान नगर", "Viman Nagar", "411014"),
        new PuneSuburbData("वाघोली", "Wagholi", "412207"),
        new PuneSuburbData("कोरेगाव पार्क", "Koregaon Park", "411001"),
        new PuneSuburbData("कॅम्प", "Camp", "411001"),
        new PuneSuburbData("शिवाजीनगर", "Shivajinagar", "411005"),
        new PuneSuburbData("स्वारगेट", "Swargate", "411042"),
        new PuneSuburbData("कात्रज", "Katraj", "411046"),
        new PuneSuburbData("धनकवडी", "Dhankawadi", "411043"),
        new PuneSuburbData("बिबवेवाडी", "Bibwewadi", "411037"),
        new PuneSuburbData("कोंढवा", "Kondhwa", "411048"),
        new PuneSuburbData("उंड्री", "Undri", "411060"),
        new PuneSuburbData("डेक्कन", "Deccan", "411004"),
        new PuneSuburbData("एरंडवणे", "Erandwane", "411004"),
        new PuneSuburbData("बावधन", "Bavdhan", "411021"),
        new PuneSuburbData("रहाटणी", "Rahatani", "411017"),
        new PuneSuburbData("पिंपळे सौदागर", "Pimple Saudagar", "411027"),
        new PuneSuburbData("पिंपळे गुरव", "Pimple Gurav", "411061"),
        new PuneSuburbData("थेरगाव", "Thergaon", "411033"),
        new PuneSuburbData("रावेत", "Ravet", "412101"),
        new PuneSuburbData("चिखली", "Chikhali", "411062"),
        new PuneSuburbData("मोशी", "Moshi", "412105"),
        new PuneSuburbData("लोहगाव", "Lohegaon", "411047"),
        new PuneSuburbData("येरवडा", "Yerwada", "411006"),
        new PuneSuburbData("विश्रांतवाडी", "Vishrantwadi", "411015"),
        new PuneSuburbData("धानोरी", "Dhanori", "411015"),
        new PuneSuburbData("मुंढवा", "Mundhwa", "411036"),
        new PuneSuburbData("वानवडी", "Wanowrie", "411040"),
        new PuneSuburbData("नऱ्हे", "Narhe", "411041"),
        new PuneSuburbData("आंबेगाव", "Ambegaon", "411046"),
        new PuneSuburbData("धायरी", "Dhayari", "411041"),
        new PuneSuburbData("चाकण", "Chakan", "410501"),
        new PuneSuburbData("तळेगाव दाभाडे", "Talegaon Dabhade", "410506"),
        new PuneSuburbData("इतर (पुणे जिल्हा)", "Other (Pune)", "411001")
    );
}

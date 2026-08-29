/* ============================================================
   SEVABHAVI SANSTHA - TRANSACTIONAL REGISTRATION TABLES
   Database: sevabhavi_sanstha (MS SQL Server)
   ============================================================ */

USE sevabhavi_sanstha;
GO

/* ============================================================
   1. MEMBER REGISTRATIONS TABLE
   ============================================================ */
IF OBJECT_ID('member_registrations', 'U') IS NOT NULL 
    DROP TABLE member_registrations;
GO

CREATE TABLE member_registrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL, -- references genders.code (e.g. 'MALE', 'FEMALE', 'OTHER')
    marital_status VARCHAR(20) NOT NULL, -- references marital_statuses.code (e.g. 'NEVER_MARRIED', 'MARRIED')
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    occupation NVARCHAR(100) NOT NULL,
    education NVARCHAR(100) NOT NULL,
    id_uploaded BIT DEFAULT 0,
    current_address NVARCHAR(500) NOT NULL,
    permanent_address NVARCHAR(500) NOT NULL,
    state_id INT NOT NULL,
    district_id INT NOT NULL,
    taluka_id INT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    member_type VARCHAR(20) NOT NULL, -- 'annual' or 'lifetime'
    id_proof_number VARCHAR(50) NULL,
    expectations NVARCHAR(1000) NULL,
    message NVARCHAR(1000) NULL,
    declaration BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (taluka_id) REFERENCES talukas(id)
);
GO

/* ============================================================
   2. MARRIAGE REGISTRATIONS TABLE
   ============================================================ */
IF OBJECT_ID('marriage_registrations', 'U') IS NOT NULL 
    DROP TABLE marriage_registrations;
GO

CREATE TABLE marriage_registrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    profile_type VARCHAR(10) NOT NULL, -- 'bride' or 'groom'
    full_name NVARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    height NVARCHAR(50) NOT NULL,
    blood_group VARCHAR(10) NOT NULL, -- references blood_groups.code (e.g. 'A+', 'O-')
    marital_status VARCHAR(20) NOT NULL, -- references marital_statuses.code
    religion NVARCHAR(100) NOT NULL,
    caste NVARCHAR(100) NOT NULL,
    gotra NVARCHAR(100) NULL,
    manglik VARCHAR(20) NOT NULL, -- 'yes', 'no', 'unknown'
    city NVARCHAR(100) NOT NULL, -- free text for city/town
    district_id INT NOT NULL,
    state_id INT NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    parent_mobile VARCHAR(20) NOT NULL,
    about_self NVARCHAR(1000) NOT NULL,
    expectations NVARCHAR(1000) NOT NULL,
    
    -- Education Details
    education_level NVARCHAR(100) NOT NULL,
    degree_name NVARCHAR(100) NOT NULL,
    school_college NVARCHAR(255) NULL,
    passing_year VARCHAR(10) NOT NULL,
    
    -- Occupation Details
    occupation_type VARCHAR(50) NOT NULL, -- references 'private_job', 'gov_job', etc.
    designation NVARCHAR(100) NULL,
    company_name NVARCHAR(255) NULL,
    annual_income NVARCHAR(100) NOT NULL,
    
    -- Family Details
    father_name NVARCHAR(255) NOT NULL,
    father_occupation NVARCHAR(100) NOT NULL,
    mother_name NVARCHAR(255) NOT NULL,
    brothers INT DEFAULT 0,
    sisters INT DEFAULT 0,
    family_background NVARCHAR(1000) NULL,
    
    -- Photos
    main_photo_uploaded BIT DEFAULT 0,
    full_photo_uploaded BIT DEFAULT 0,
    
    declaration BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);
GO

/* ============================================================
   3. INQUIRIES / CONTACT FORM MESSAGES TABLE
   ============================================================ */
IF OBJECT_ID('inquiries', 'U') IS NOT NULL 
    DROP TABLE inquiries;
GO

CREATE TABLE inquiries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    message NVARCHAR(2000) NOT NULL,
    status VARCHAR(50) DEFAULT 'NEW',
    created_at DATETIME DEFAULT GETDATE()
);
GO

/* ============================================================
   4. DONATION TYPES LOOKUP TABLE (देणगी प्रकार)
   ============================================================ */
IF OBJECT_ID('donation_types', 'U') IS NOT NULL 
    DROP TABLE donation_types;
GO

CREATE TABLE donation_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- 'ONE_TIME', 'MONTHLY', 'YEARLY'
    name_en NVARCHAR(100) NOT NULL,  -- देणगी प्रकार इंग्रजी
    name_mr NVARCHAR(100) NOT NULL,  -- देणगी प्रकार मराठी
    is_active BIT DEFAULT 1           -- सक्रीय / निष्क्रीय
);
GO

INSERT INTO donation_types (code, name_en, name_mr, is_active) VALUES
('ONE_TIME', 'One-time', N'एकरकमी', 1),
('MONTHLY', 'Monthly', N'मासिक', 1),
('YEARLY', 'Yearly', N'वार्षिक', 1);
GO

/* ============================================================
   5. DONATION PURPOSES LOOKUP TABLE (निधीचा उद्देश)
   ============================================================ */
IF OBJECT_ID('donation_purposes', 'U') IS NOT NULL 
    DROP TABLE donation_purposes;
GO

CREATE TABLE donation_purposes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE, -- 'GENERAL_FUND', 'EDUCATION', etc.
    name_en NVARCHAR(100) NOT NULL,  -- निधीचा उद्देश इंग्रजी
    name_mr NVARCHAR(100) NOT NULL,  -- निधीचा उद्देश मराठी
    description_mr NVARCHAR(500) NULL, -- उद्देशाचा सविस्तर तपशील
    is_active BIT DEFAULT 1           -- सक्रीय / निष्क्रीय
);
GO

INSERT INTO donation_purposes (code, name_en, name_mr, description_mr, is_active) VALUES
('GENERAL_FUND', 'General Fund', N'सर्वसाधारण निधी', N'संस्थेच्या नियमित सामाजिक कार्यासाठी मदत', 1),
('EDUCATION', 'Educational Aid', N'शैक्षणिक मदत', N'गरजू व गरजू विद्यार्थ्यांच्या शिक्षणासाठी साहाय्य', 1),
('MEDICAL', 'Medical Support', N'वैद्यकीय मदत', N'गरीब व गरजू रुग्णांच्या उपचारासाठी मदत', 1),
('SOCIAL_WELFARE', 'Social Welfare', N'समाजउपयोगी उपक्रम', N'पर्यावरण, स्वच्छता आणि सामाजिक कल्याणकारी योजना', 1),
('SHIBIR', 'Shibir Fund', N'शिबीर व शिबीर उपक्रम', N'आरोग्य आणि व्यक्तिमत्त्व विकास शिबिरांसाठी देणगी', 1);
GO

/* ============================================================
   6. DONATION REGISTRATIONS TABLE (देणगी नोंदणी)
   ============================================================ */
IF OBJECT_ID('donation_registrations', 'U') IS NOT NULL 
    DROP TABLE donation_registrations;
GO

CREATE TABLE donation_registrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE, -- पावती क्रमांक (उदा. DON-2026-0001)
    
    -- Step 1: वैयक्तिक माहिती (Personal Details)
    full_name NVARCHAR(255) NOT NULL,            -- पूर्ण नाव*
    mobile VARCHAR(20) NOT NULL,                 -- मोबाईल नंबर*
    email VARCHAR(100) NULL,                     -- ईमेल पत्ता
    birth_date DATE NULL,                        -- जन्म तारीख
    gender VARCHAR(20) NULL,                     -- लिंग (Dropdown)
    address NVARCHAR(500) NOT NULL,              -- पत्ता*
    city NVARCHAR(100) NOT NULL,                 -- शहर/गाव*
    taluka_id INT NULL,                          -- तालुका ID
    district_id INT NULL,                        -- जिल्हा ID
    state_id INT NULL,                           -- राज्य ID
    pincode VARCHAR(10) NULL,                    -- पिनकोड
    
    -- Step 2: देणगीचा प्रकार व उद्देश (Donation Type & Purpose)
    donation_type_id INT NOT NULL,               -- देणगी प्रकार FK (donation_types)
    donation_purpose_id INT NOT NULL,            -- निधीचा उद्देश FK (donation_purposes)
    in_memory_of_toggle BIT DEFAULT 0,           -- स्मरणार्थ/सन्मानार्थ फ्लॅग
    in_memory_of_name NVARCHAR(255) NULL,        -- स्मरणार्थ/सन्मानार्थ नाव
    is_anonymous BIT DEFAULT 0,                  -- निनावी देणगी फ्लॅग
    message NVARCHAR(1000) NULL,                 -- संदेश / अभिप्राय
    
    -- Step 3: देणगी रक्कम (Donation Amount)
    amount DECIMAL(18,2) NOT NULL,               -- देणगी रक्कम*
    currency VARCHAR(10) DEFAULT 'INR',          -- चलन
    
    -- Step 3: पेमेंट तपशील (Payment Details)

    payment_method VARCHAR(50) NOT NULL,         -- पेमेंट पद्धत (Razorpay, UPI, Card, Net Banking, Offline)
    payment_status VARCHAR(50) DEFAULT 'PENDING',-- पेमेंट स्थिती (PENDING, SUCCESS, FAILED, VERIFIED)
    transaction_id VARCHAR(100) NULL,            -- ट्रान्सॅक्शन / युटीआर क्रमांक
    gateway_reference VARCHAR(100) NULL,         -- Razorpay Order/Payment ID
    payment_date DATETIME NULL,                  -- पेमेंट पूर्ण झालेली तारीख
    
    -- Metadata
    draft_step INT DEFAULT 1,                    -- सेव केलेला मसुदा टप्पा (1-7)
    approval_status VARCHAR(50) DEFAULT 'PENDING',-- एडमिन मंजुरी स्थिती
    created_at DATETIME DEFAULT GETDATE(),       -- नोंदणी दिनांक
    updated_at DATETIME DEFAULT GETDATE(),       -- अपडेट दिनांक
    
    FOREIGN KEY (donation_type_id) REFERENCES donation_types(id),
    FOREIGN KEY (donation_purpose_id) REFERENCES donation_purposes(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (taluka_id) REFERENCES talukas(id)
);
GO



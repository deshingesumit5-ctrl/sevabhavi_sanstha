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


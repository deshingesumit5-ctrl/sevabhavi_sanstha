/* ============================================================
   SEVABHAVI SANSTHA - MATRIMONY MODULE SCHEMA MIGRATION
   Database: sevabhavi_sanstha (MS SQL Server)
   Safe idempotent update script preserving existing data.
   ============================================================ */

USE sevabhavi_sanstha;
GO

-- 1. Add matrimony columns to marriage_registrations if not present
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'password_hash')
BEGIN
    ALTER TABLE marriage_registrations ADD password_hash VARCHAR(255) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'package_type')
BEGIN
    ALTER TABLE marriage_registrations ADD package_type VARCHAR(50) DEFAULT '6_MONTHS';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'package_amount')
BEGIN
    ALTER TABLE marriage_registrations ADD package_amount DECIMAL(10,2) DEFAULT 500.00;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'subscription_duration_months')
BEGIN
    ALTER TABLE marriage_registrations ADD subscription_duration_months INT DEFAULT 6;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'subscription_start_date')
BEGIN
    ALTER TABLE marriage_registrations ADD subscription_start_date DATE NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'subscription_end_date')
BEGIN
    ALTER TABLE marriage_registrations ADD subscription_end_date DATE NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'main_photo_url')
BEGIN
    ALTER TABLE marriage_registrations ADD main_photo_url NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'rejection_reason')
BEGIN
    ALTER TABLE marriage_registrations ADD rejection_reason NVARCHAR(500) NULL;
END
GO

-- 2. Create matrimony_favorites table if not exists
IF OBJECT_ID('matrimony_favorites', 'U') IS NULL
BEGIN
    CREATE TABLE matrimony_favorites (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        favorite_profile_id INT NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT UQ_matrimony_fav UNIQUE (user_id, favorite_profile_id),
        FOREIGN KEY (user_id) REFERENCES marriage_registrations(id),
        FOREIGN KEY (favorite_profile_id) REFERENCES marriage_registrations(id)
    );
END
GO

-- 3. Performance indexes for Matrimony filtering & sorting
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_marriage_status_type' AND object_id = OBJECT_ID('marriage_registrations'))
BEGIN
    CREATE INDEX IX_marriage_status_type ON marriage_registrations(approval_status, profile_type);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_marriage_caste_city' AND object_id = OBJECT_ID('marriage_registrations'))
BEGIN
    CREATE INDEX IX_marriage_caste_city ON marriage_registrations(caste, city);
END
GO

-- 4. Update existing records: Ensure existing approved records have subscription dates
UPDATE marriage_registrations
SET package_type = '6_MONTHS',
    package_amount = 500.00,
    subscription_duration_months = 6,
    subscription_start_date = ISNULL(subscription_start_date, CAST(created_at AS DATE)),
    subscription_end_date = ISNULL(subscription_end_date, DATEADD(month, 6, CAST(created_at AS DATE)))
WHERE approval_status = 'APPROVED';
GO

/* ============================================================
   SEVABHAVI SANSTHA - ADD IS_ACTIVE STATUS COLUMNS
   Database: sevabhavi_sanstha (MS SQL Server)
   Safe idempotent update script adding is_active with default 1 (Active).
   ============================================================ */

USE sevabhavi_sanstha;
GO

-- 1. Marriage registrations
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('marriage_registrations') AND name = 'is_active')
BEGIN
    ALTER TABLE marriage_registrations ADD is_active BIT NOT NULL DEFAULT 1;
END
GO

UPDATE marriage_registrations SET is_active = 1 WHERE is_active IS NULL;
GO

-- 2. Member registrations
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('member_registrations') AND name = 'is_active')
BEGIN
    ALTER TABLE member_registrations ADD is_active BIT NOT NULL DEFAULT 1;
END
GO

UPDATE member_registrations SET is_active = 1 WHERE is_active IS NULL;
GO

-- 3. Shibir registrations
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('shibir_registrations') AND name = 'is_active')
BEGIN
    ALTER TABLE shibir_registrations ADD is_active BIT NOT NULL DEFAULT 1;
END
GO

UPDATE shibir_registrations SET is_active = 1 WHERE is_active IS NULL;
GO

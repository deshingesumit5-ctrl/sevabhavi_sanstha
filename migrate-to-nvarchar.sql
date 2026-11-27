/* ============================================================
   SEVABHAVI SANSTHA - MIGRATE LEGACY TEXT COLUMNS TO NVARCHAR
   Target: SQL Server 15+ (database: sevabhavi_sanstha, schema: dbo)
   Converts existing VARCHAR, CHAR, TEXT, and NTEXT columns to
   NVARCHAR(length) / NVARCHAR(MAX), preserving nullability and
   handling primary keys, unique constraints, indexes, defaults,
   check constraints, and foreign keys.
   Converts TEXT -> VARCHAR(MAX) -> NVARCHAR(MAX).
   Idempotent and non-destructive (preserves all table data).
   ============================================================ */

USE sevabhavi_sanstha;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('tempdb..#ColsToMigrate') IS NOT NULL DROP TABLE #ColsToMigrate;
    IF OBJECT_ID('tempdb..#Defaults') IS NOT NULL DROP TABLE #Defaults;
    IF OBJECT_ID('tempdb..#CheckConstraints') IS NOT NULL DROP TABLE #CheckConstraints;
    IF OBJECT_ID('tempdb..#ForeignKeys') IS NOT NULL DROP TABLE #ForeignKeys;
    IF OBJECT_ID('tempdb..#KeyConstraints') IS NOT NULL DROP TABLE #KeyConstraints;
    IF OBJECT_ID('tempdb..#Indexes') IS NOT NULL DROP TABLE #Indexes;

    CREATE TABLE #ColsToMigrate (
        id INT IDENTITY(1,1) PRIMARY KEY,
        schema_name SYSNAME NOT NULL,
        table_name SYSNAME NOT NULL,
        object_id INT NOT NULL,
        column_id INT NOT NULL,
        column_name SYSNAME NOT NULL,
        source_type SYSNAME NOT NULL,
        max_length INT NOT NULL,
        is_nullable BIT NOT NULL,
        target_type NVARCHAR(100) NOT NULL,
        null_sql NVARCHAR(10) NOT NULL
    );

    INSERT INTO #ColsToMigrate (
        schema_name, table_name, object_id, column_id, column_name,
        source_type, max_length, is_nullable, target_type, null_sql
    )
    SELECT
        s.name,
        t.name,
        t.object_id,
        c.column_id,
        c.name,
        ty.name,
        c.max_length,
        c.is_nullable,
        CASE
            WHEN ty.name IN (N'text', N'ntext') THEN N'NVARCHAR(MAX)'
            WHEN c.max_length = -1 OR c.max_length > 4000 THEN N'NVARCHAR(MAX)'
            ELSE N'NVARCHAR(' + CAST(c.max_length AS NVARCHAR(20)) + N')'
        END,
        CASE WHEN c.is_nullable = 1 THEN N'NULL' ELSE N'NOT NULL' END
    FROM sys.tables t
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    JOIN sys.columns c ON t.object_id = c.object_id
    JOIN sys.types ty ON c.user_type_id = ty.user_type_id
    WHERE s.name = N'dbo'
      AND t.is_ms_shipped = 0
      AND c.is_computed = 0
      AND ty.name IN (N'varchar', N'char', N'text', N'ntext')
    ORDER BY t.name, c.column_id;

    IF NOT EXISTS (SELECT 1 FROM #ColsToMigrate)
    BEGIN
        PRINT N'No VARCHAR, CHAR, TEXT, or NTEXT columns remain to migrate.';
        COMMIT TRANSACTION;
        RETURN;
    END

    /* 1. Capture DEFAULT constraints */
    CREATE TABLE #Defaults (
        id INT IDENTITY(1,1) PRIMARY KEY,
        drop_sql NVARCHAR(MAX) NOT NULL,
        create_sql NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO #Defaults (drop_sql, create_sql)
    SELECT DISTINCT
        N'ALTER TABLE ' + QUOTENAME(m.schema_name) + N'.' + QUOTENAME(m.table_name)
            + N' DROP CONSTRAINT ' + QUOTENAME(dc.name) + N';',
        N'ALTER TABLE ' + QUOTENAME(m.schema_name) + N'.' + QUOTENAME(m.table_name)
            + N' ADD CONSTRAINT ' + QUOTENAME(dc.name)
            + N' DEFAULT ' + dc.definition + N' FOR ' + QUOTENAME(m.column_name) + N';'
    FROM sys.default_constraints dc
    JOIN #ColsToMigrate m
      ON dc.parent_object_id = m.object_id
     AND dc.parent_column_id = m.column_id;

    /* 2. Capture CHECK constraints (column-level or table-level referencing migrated columns) */
    CREATE TABLE #CheckConstraints (
        id INT IDENTITY(1,1) PRIMARY KEY,
        drop_sql NVARCHAR(MAX) NOT NULL,
        create_sql NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO #CheckConstraints (drop_sql, create_sql)
    SELECT DISTINCT
        N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' DROP CONSTRAINT ' + QUOTENAME(cc.name) + N';',
        N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + CASE WHEN cc.is_not_trusted = 1 THEN N' WITH NOCHECK' ELSE N' WITH CHECK' END
            + N' ADD CONSTRAINT ' + QUOTENAME(cc.name)
            + N' CHECK ' + cc.definition + N';'
    FROM sys.check_constraints cc
    JOIN sys.tables t ON cc.parent_object_id = t.object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE EXISTS (
        SELECT 1
        FROM #ColsToMigrate m
        WHERE m.object_id = cc.parent_object_id
          AND (
              cc.parent_column_id = m.column_id
              OR EXISTS (
                  SELECT 1
                  FROM sys.sql_expression_dependencies d
                  WHERE d.referencing_id = cc.object_id
                    AND d.referenced_id = m.object_id
                    AND d.referenced_minor_id = m.column_id
              )
          )
    );

    /* 3. Capture FOREIGN KEY constraints (either parent or referenced column is migrated) */
    CREATE TABLE #ForeignKeys (
        id INT IDENTITY(1,1) PRIMARY KEY,
        drop_sql NVARCHAR(MAX) NOT NULL,
        create_sql NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO #ForeignKeys (drop_sql, create_sql)
    SELECT
        N'ALTER TABLE ' + QUOTENAME(sp.name) + N'.' + QUOTENAME(tp.name)
            + N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';',
        N'ALTER TABLE ' + QUOTENAME(sp.name) + N'.' + QUOTENAME(tp.name)
            + CASE WHEN fk.is_not_trusted = 1 THEN N' WITH NOCHECK' ELSE N' WITH CHECK' END
            + N' ADD CONSTRAINT ' + QUOTENAME(fk.name)
            + N' FOREIGN KEY (' + cols.parent_cols + N')'
            + N' REFERENCES ' + QUOTENAME(sr.name) + N'.' + QUOTENAME(tr.name)
            + N' (' + cols.ref_cols + N')'
            + CASE fk.delete_referential_action
                WHEN 1 THEN N' ON DELETE CASCADE'
                WHEN 2 THEN N' ON DELETE SET NULL'
                WHEN 3 THEN N' ON DELETE SET DEFAULT'
                ELSE N''
              END
            + CASE fk.update_referential_action
                WHEN 1 THEN N' ON UPDATE CASCADE'
                WHEN 2 THEN N' ON UPDATE SET NULL'
                WHEN 3 THEN N' ON UPDATE SET DEFAULT'
                ELSE N''
              END
            + CASE WHEN fk.is_not_for_replication = 1 THEN N' NOT FOR REPLICATION' ELSE N'' END
            + N';'
    FROM sys.foreign_keys fk
    JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
    JOIN sys.schemas sp ON tp.schema_id = sp.schema_id
    JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
    JOIN sys.schemas sr ON tr.schema_id = sr.schema_id
    CROSS APPLY (
        SELECT
            STRING_AGG(QUOTENAME(cp.name), N', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS parent_cols,
            STRING_AGG(QUOTENAME(cr.name), N', ') WITHIN GROUP (ORDER BY fkc.constraint_column_id) AS ref_cols
        FROM sys.foreign_key_columns fkc
        JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
        JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
        WHERE fkc.constraint_object_id = fk.object_id
    ) cols
    WHERE EXISTS (
        SELECT 1
        FROM sys.foreign_key_columns fkc
        JOIN #ColsToMigrate m
          ON (fkc.parent_object_id = m.object_id AND fkc.parent_column_id = m.column_id)
          OR (fkc.referenced_object_id = m.object_id AND fkc.referenced_column_id = m.column_id)
        WHERE fkc.constraint_object_id = fk.object_id
    );

    /* 4. Capture PRIMARY KEY and UNIQUE constraints */
    CREATE TABLE #KeyConstraints (
        id INT IDENTITY(1,1) PRIMARY KEY,
        drop_sql NVARCHAR(MAX) NOT NULL,
        create_sql NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO #KeyConstraints (drop_sql, create_sql)
    SELECT
        N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' DROP CONSTRAINT ' + QUOTENAME(kc.name) + N';',
        N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' ADD CONSTRAINT ' + QUOTENAME(kc.name)
            + CASE WHEN kc.type = 'PK' THEN N' PRIMARY KEY ' ELSE N' UNIQUE ' END
            + CASE WHEN i.type = 1 THEN N'CLUSTERED' ELSE N'NONCLUSTERED' END
            + N' (' + cols.key_cols + N');'
    FROM sys.key_constraints kc
    JOIN sys.tables t ON kc.parent_object_id = t.object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    JOIN sys.indexes i ON kc.parent_object_id = i.object_id AND kc.unique_index_id = i.index_id
    CROSS APPLY (
        SELECT STRING_AGG(
            QUOTENAME(c.name) + CASE WHEN ic.is_descending_key = 1 THEN N' DESC' ELSE N' ASC' END,
            N', '
        ) WITHIN GROUP (ORDER BY ic.key_ordinal) AS key_cols
        FROM sys.index_columns ic
        JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
          AND ic.is_included_column = 0
    ) cols
    WHERE EXISTS (
        SELECT 1
        FROM sys.index_columns ic
        JOIN #ColsToMigrate m
          ON ic.object_id = m.object_id
         AND ic.column_id = m.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
    );

    /* 5. Capture non-constraint INDEXes */
    CREATE TABLE #Indexes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        drop_sql NVARCHAR(MAX) NOT NULL,
        create_sql NVARCHAR(MAX) NOT NULL
    );

    INSERT INTO #Indexes (drop_sql, create_sql)
    SELECT
        N'DROP INDEX ' + QUOTENAME(i.name) + N' ON ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';',
        N'CREATE '
            + CASE WHEN i.is_unique = 1 THEN N'UNIQUE ' ELSE N'' END
            + CASE WHEN i.type = 1 THEN N'CLUSTERED ' ELSE N'NONCLUSTERED ' END
            + N'INDEX ' + QUOTENAME(i.name)
            + N' ON ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name)
            + N' (' + cols.key_cols + N')'
            + CASE WHEN inc.inc_cols IS NOT NULL THEN N' INCLUDE (' + inc.inc_cols + N')' ELSE N'' END
            + CASE WHEN i.has_filter = 1 THEN N' WHERE ' + i.filter_definition ELSE N'' END
            + N';'
    FROM sys.indexes i
    JOIN sys.tables t ON i.object_id = t.object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id
    CROSS APPLY (
        SELECT STRING_AGG(
            QUOTENAME(c.name) + CASE WHEN ic.is_descending_key = 1 THEN N' DESC' ELSE N' ASC' END,
            N', '
        ) WITHIN GROUP (ORDER BY ic.key_ordinal) AS key_cols
        FROM sys.index_columns ic
        JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
          AND ic.is_included_column = 0
    ) cols
    OUTER APPLY (
        SELECT STRING_AGG(QUOTENAME(c.name), N', ') WITHIN GROUP (ORDER BY ic.index_column_id) AS inc_cols
        FROM sys.index_columns ic
        JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id
          AND ic.index_id = i.index_id
          AND ic.is_included_column = 1
    ) inc
    WHERE i.is_primary_key = 0
      AND i.is_unique_constraint = 0
      AND i.type IN (1, 2)
      AND EXISTS (
          SELECT 1
          FROM sys.index_columns ic
          JOIN #ColsToMigrate m
            ON ic.object_id = m.object_id
           AND ic.column_id = m.column_id
          WHERE ic.object_id = i.object_id
            AND ic.index_id = i.index_id
      );

    DECLARE @sql NVARCHAR(MAX);
    DECLARE @schema_name SYSNAME, @table_name SYSNAME, @column_name SYSNAME,
            @source_type SYSNAME, @target_type NVARCHAR(100), @null_sql NVARCHAR(10);

    /* Phase A: Drop dependent objects in safe order */
    DECLARE cur_drop_ix CURSOR LOCAL FAST_FORWARD FOR SELECT drop_sql FROM #Indexes;
    OPEN cur_drop_ix; FETCH NEXT FROM cur_drop_ix INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_drop_ix INTO @sql; END
    CLOSE cur_drop_ix; DEALLOCATE cur_drop_ix;

    DECLARE cur_drop_ck CURSOR LOCAL FAST_FORWARD FOR SELECT drop_sql FROM #CheckConstraints;
    OPEN cur_drop_ck; FETCH NEXT FROM cur_drop_ck INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_drop_ck INTO @sql; END
    CLOSE cur_drop_ck; DEALLOCATE cur_drop_ck;

    DECLARE cur_drop_fk CURSOR LOCAL FAST_FORWARD FOR SELECT drop_sql FROM #ForeignKeys;
    OPEN cur_drop_fk; FETCH NEXT FROM cur_drop_fk INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_drop_fk INTO @sql; END
    CLOSE cur_drop_fk; DEALLOCATE cur_drop_fk;

    DECLARE cur_drop_kc CURSOR LOCAL FAST_FORWARD FOR SELECT drop_sql FROM #KeyConstraints;
    OPEN cur_drop_kc; FETCH NEXT FROM cur_drop_kc INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_drop_kc INTO @sql; END
    CLOSE cur_drop_kc; DEALLOCATE cur_drop_kc;

    DECLARE cur_drop_df CURSOR LOCAL FAST_FORWARD FOR SELECT drop_sql FROM #Defaults;
    OPEN cur_drop_df; FETCH NEXT FROM cur_drop_df INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_drop_df INTO @sql; END
    CLOSE cur_drop_df; DEALLOCATE cur_drop_df;

    /* Phase B: Alter columns (convert TEXT -> VARCHAR(MAX) before NVARCHAR(MAX)) */
    DECLARE cur_alter CURSOR LOCAL FAST_FORWARD FOR
        SELECT schema_name, table_name, column_name, source_type, target_type, null_sql
        FROM #ColsToMigrate
        ORDER BY id;

    OPEN cur_alter;
    FETCH NEXT FROM cur_alter INTO @schema_name, @table_name, @column_name, @source_type, @target_type, @null_sql;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF @source_type = N'text'
        BEGIN
            SET @sql = N'ALTER TABLE ' + QUOTENAME(@schema_name) + N'.' + QUOTENAME(@table_name)
                     + N' ALTER COLUMN ' + QUOTENAME(@column_name) + N' VARCHAR(MAX) ' + @null_sql + N';';
            EXEC sp_executesql @sql;
        END

        SET @sql = N'ALTER TABLE ' + QUOTENAME(@schema_name) + N'.' + QUOTENAME(@table_name)
                 + N' ALTER COLUMN ' + QUOTENAME(@column_name) + N' ' + @target_type + N' ' + @null_sql + N';';
        EXEC sp_executesql @sql;

        PRINT N'Migrated ' + @schema_name + N'.' + @table_name + N'.' + @column_name
            + N' (' + @source_type + N' -> ' + @target_type + N' ' + @null_sql + N')';

        FETCH NEXT FROM cur_alter INTO @schema_name, @table_name, @column_name, @source_type, @target_type, @null_sql;
    END
    CLOSE cur_alter; DEALLOCATE cur_alter;

    /* Phase C: Recreate constraints and indexes in reverse dependency order */
    DECLARE cur_add_df CURSOR LOCAL FAST_FORWARD FOR SELECT create_sql FROM #Defaults;
    OPEN cur_add_df; FETCH NEXT FROM cur_add_df INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_add_df INTO @sql; END
    CLOSE cur_add_df; DEALLOCATE cur_add_df;

    DECLARE cur_add_kc CURSOR LOCAL FAST_FORWARD FOR SELECT create_sql FROM #KeyConstraints;
    OPEN cur_add_kc; FETCH NEXT FROM cur_add_kc INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_add_kc INTO @sql; END
    CLOSE cur_add_kc; DEALLOCATE cur_add_kc;

    DECLARE cur_add_ix CURSOR LOCAL FAST_FORWARD FOR SELECT create_sql FROM #Indexes;
    OPEN cur_add_ix; FETCH NEXT FROM cur_add_ix INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_add_ix INTO @sql; END
    CLOSE cur_add_ix; DEALLOCATE cur_add_ix;

    DECLARE cur_add_fk CURSOR LOCAL FAST_FORWARD FOR SELECT create_sql FROM #ForeignKeys;
    OPEN cur_add_fk; FETCH NEXT FROM cur_add_fk INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_add_fk INTO @sql; END
    CLOSE cur_add_fk; DEALLOCATE cur_add_fk;

    DECLARE cur_add_ck CURSOR LOCAL FAST_FORWARD FOR SELECT create_sql FROM #CheckConstraints;
    OPEN cur_add_ck; FETCH NEXT FROM cur_add_ck INTO @sql;
    WHILE @@FETCH_STATUS = 0 BEGIN EXEC sp_executesql @sql; FETCH NEXT FROM cur_add_ck INTO @sql; END
    CLOSE cur_add_ck; DEALLOCATE cur_add_ck;

    DROP TABLE #ColsToMigrate;
    DROP TABLE #Defaults;
    DROP TABLE #CheckConstraints;
    DROP TABLE #ForeignKeys;
    DROP TABLE #KeyConstraints;
    DROP TABLE #Indexes;

    COMMIT TRANSACTION;
    PRINT N'All legacy text columns migrated to NVARCHAR successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

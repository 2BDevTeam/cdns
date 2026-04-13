CREATE OR ALTER PROCEDURE sp_SyncFtCache
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @from_lsn    BINARY(10);
    DECLARE @last_lsn    BINARY(10);
    DECLARE @to_lsn      BINARY(10);
    DECLARE @changes     INT = 0;
    DECLARE @new_version INT;

    -- LSN actual (maximo disponivel no CDC)
    SET @to_lsn = sys.fn_cdc_get_max_lsn();

    -- LSN e Version do ultimo sync
    SELECT @last_lsn = last_lsn,
           @new_version = ISNULL(Version, 0) + 1
    FROM cache_control
    WHERE TableName = 'ft';

    -- ----------------------------------------------------------------
    -- INICIALIZACAO: primeira execucao (last_lsn NULL)
    -- Faz carga completa de ft e regista Version = 1
    -- ----------------------------------------------------------------
    IF @last_lsn IS NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM cache_control WHERE TableName = 'ft')
            INSERT INTO cache_control (TableName, Status, BuildStart, Version)
            VALUES ('ft', 'BUILDING', GETUTCDATE(), 0);
        ELSE
            UPDATE cache_control
            SET Status = 'BUILDING', BuildStart = GETUTCDATE()
            WHERE TableName = 'ft';

        -- Carga inicial directamente de ft (sem CDC)
        TRUNCATE TABLE ft_cache;

        INSERT INTO ft_cache (no, nome, fdata, ftstamp, CachedAt)
        SELECT
            CAST(no   AS NUMERIC),
            CAST(nome AS NVARCHAR(255)),
            fdata,
            CAST(ftstamp AS VARCHAR(100)),
            GETUTCDATE()
        FROM ft;

        -- Version 1 = snapshot inicial completo
        UPDATE cache_control
        SET last_lsn    = @to_lsn,
            LastUpdated = GETUTCDATE(),
            TotalRows   = (SELECT COUNT(*) FROM ft_cache),
            Status      = 'READY',
            BuildEnd    = GETUTCDATE(),
            Version     = 1
        WHERE TableName = 'ft';

        RETURN;
    END;

    -- Avanca um passo alem do ultimo LSN ja processado
    SET @from_lsn = sys.fn_cdc_increment_lsn(@last_lsn);

    -- Sem novas transacoes
    IF @from_lsn > @to_lsn
        RETURN;

    -- Conta mudancas relevantes no intervalo novo
    SELECT @changes = COUNT(*)
    FROM cdc.fn_cdc_get_all_changes_dbo_ft(@from_lsn, @to_lsn, N'all')
    WHERE __$operation IN (1, 2, 4);

    -- Sem mudancas relevantes -- actualiza so o LSN (Version nao muda)
    IF @changes = 0
    BEGIN
        UPDATE cache_control
        SET last_lsn = @to_lsn
        WHERE TableName = 'ft';
        RETURN;
    END;

    -- Marca como BUILDING
    UPDATE cache_control
    SET Status     = 'BUILDING',
        BuildStart = GETUTCDATE()
    WHERE TableName = 'ft';

    BEGIN TRY

        -- Deduplica mudancas CDC por ftstamp (mantem ultima operacao por __$seqval)
        SELECT
            CAST(no   AS NUMERIC)         AS no,
            CAST(nome AS NVARCHAR(255))   AS nome,
            fdata,
            CAST(ftstamp AS VARCHAR(100)) AS ftstamp,
            __$operation
        INTO #cdc_changes
        FROM (
            SELECT
                no, nome, fdata, ftstamp, __$operation,
                ROW_NUMBER() OVER (
                    PARTITION BY ftstamp
                    ORDER BY __$seqval DESC
                ) AS rn
            FROM cdc.fn_cdc_get_all_changes_dbo_ft(@from_lsn, @to_lsn, N'all')
            WHERE __$operation IN (1, 2, 4)
        ) AS ranked
        WHERE rn = 1;

        -- DELETES em ft_cache
        DELETE ft_cache
        WHERE ftstamp IN (
            SELECT ftstamp FROM #cdc_changes WHERE __$operation = 1
        );

        -- INSERTS e UPDATES em ft_cache
        MERGE ft_cache AS target
        USING (
            SELECT no, nome, fdata, ftstamp, GETUTCDATE() AS CachedAt
            FROM #cdc_changes
            WHERE __$operation IN (2, 4)
        ) AS source
        ON target.ftstamp = source.ftstamp
        WHEN MATCHED THEN
            UPDATE SET
                no       = source.no,
                nome     = source.nome,
                fdata    = source.fdata,
                CachedAt = source.CachedAt
        WHEN NOT MATCHED THEN
            INSERT (no, nome, fdata, ftstamp, CachedAt)
            VALUES (source.no, source.nome, source.fdata, source.ftstamp, source.CachedAt);

        -- Regista delta para consumo incremental pelo frontend
        -- Frontend pede: GET /api/ft/changes?since_version=N
        INSERT INTO ft_cache_delta (Version, Operation, ftstamp, no, nome, fdata)
        SELECT
            @new_version,
            CASE __$operation WHEN 1 THEN 'D' WHEN 2 THEN 'I' ELSE 'U' END,
            ftstamp,
            no,
            nome,
            fdata
        FROM #cdc_changes;

        DROP TABLE #cdc_changes;

        -- Actualiza cache_control com nova Version
        UPDATE cache_control
        SET last_lsn    = @to_lsn,
            LastUpdated = GETUTCDATE(),
            TotalRows   = (SELECT COUNT(*) FROM ft_cache),
            Status      = 'READY',
            BuildEnd    = GETUTCDATE(),
            Version     = @new_version
        WHERE TableName = 'ft';

    END TRY
    BEGIN CATCH
        IF OBJECT_ID('tempdb..#cdc_changes') IS NOT NULL
            DROP TABLE #cdc_changes;

        UPDATE cache_control
        SET Status   = 'ERROR',
            BuildEnd = GETUTCDATE()
        WHERE TableName = 'ft';

        THROW;
    END CATCH;

END;

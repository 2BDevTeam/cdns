-- ============================================================
-- SETUP COMPLETO DE CACHE PARA ft2
-- Caso de estudo: joins de tabelas cache (ft_cache JOIN ft2_cache)
-- Campos: ft2stamp (chave), modop1 VARCHAR(250), paga2 NUMERIC(16,2), modop2 VARCHAR(250)
--
-- EXECUTAR NA ORDEM:
--   PASSO 1 → PASSO 2 → PASSO 3 → PASSO 4 → PASSO 5 → PASSO 6 → PASSO 7
-- ============================================================


-- ============================================================
-- PASSO 1: Activar CDC na tabela ft2
-- ============================================================

-- Verificar se CDC ja esta activo na base de dados
-- (se retornar 0, activar com sp_cdc_enable_db primeiro)
SELECT is_cdc_enabled, name FROM sys.databases WHERE name = DB_NAME();

-- Activar CDC na base de dados (so necessario uma vez, ignorar se ja activo)
-- EXEC sys.sp_cdc_enable_db;

-- Activar CDC na tabela ft2
EXEC sys.sp_cdc_enable_table
    @source_schema        = 'dbo',
    @source_name          = 'ft2',
    @role_name            = NULL,
    @capture_instance     = 'dbo_ft2',
    @supports_net_changes = 1;

-- Verificar activacao
SELECT capture_instance, object_name(source_object_id) AS tabela, start_lsn
FROM cdc.change_tables
WHERE object_name(source_object_id) = 'ft2';


-- ============================================================
-- PASSO 2: Criar ft2_cache (snapshot completo)
-- ============================================================

DROP TABLE IF EXISTS ft2_cache;

CREATE TABLE ft2_cache (
    ft2stamp    VARCHAR(25)     NOT NULL DEFAULT '',   -- chave natural PHC
    modop1      VARCHAR(250)    NOT NULL DEFAULT '',
    paga2       NUMERIC(16, 2)  NOT NULL DEFAULT 0,
    modop2      VARCHAR(250)    NOT NULL DEFAULT '',
    CachedAt    DATETIME        NOT NULL DEFAULT GETUTCDATE()
);

-- Columnstore optimiza queries analiticas e joins entre tabelas cache
CREATE CLUSTERED COLUMNSTORE INDEX IX_ft2_cache_cs ON ft2_cache;

-- Carga inicial (sera refeita automaticamente pelo SP se last_lsn for NULL)
INSERT INTO ft2_cache (ft2stamp, modop1, paga2, modop2, CachedAt)
SELECT
    CAST(ft2stamp AS VARCHAR(25)),
    CAST(modop1   AS VARCHAR(250)),
    CAST(paga2    AS NUMERIC(16,2)),
    CAST(modop2   AS VARCHAR(250)),
    GETUTCDATE()
FROM ft2;

SELECT COUNT(*) AS total_ft2_cache FROM ft2_cache;


-- ============================================================
-- PASSO 3: Criar ft2_cache_delta (log incremental por Version)
-- ============================================================

DROP TABLE IF EXISTS ft2_cache_delta;

CREATE TABLE ft2_cache_delta (
    Id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Version     INT             NOT NULL,   -- Version de cache_control no momento da mudanca
    Operation   CHAR(1)         NOT NULL    -- 'I' Insert | 'U' Update | 'D' Delete
                    CHECK (Operation IN ('I','U','D')),
    ft2stamp    VARCHAR(25)     NOT NULL,   -- chave natural
    modop1      VARCHAR(250)    NULL,
    paga2       NUMERIC(16, 2)  NULL,
    modop2      VARCHAR(250)    NULL,
    CreatedAt   DATETIME        NOT NULL DEFAULT GETUTCDATE()
);

-- Indice para queries incrementais do frontend (WHERE Version > N)
CREATE INDEX IX_ft2_cache_delta_Version ON ft2_cache_delta (Version ASC);


-- ============================================================
-- PASSO 4: Registar ft2 em cache_control
-- ============================================================

-- cache_control deve ja existir (criada no setup de ft)
-- Se nao existir, executar QUERY_CREATE_CACHE_CONTROL.sql primeiro

IF NOT EXISTS (SELECT 1 FROM cache_control WHERE TableName = 'ft2')
BEGIN
    INSERT INTO cache_control (TableName, Status, LastUpdated, Version, last_lsn)
    VALUES (
        'ft2',
        'READY',
        GETUTCDATE(),
        1,
        sys.fn_cdc_get_max_lsn()   -- considera carga inicial do PASSO 2 como Version 1
    );
END;

SELECT * FROM cache_control WHERE TableName = 'ft2';


-- ============================================================
-- PASSO 5: Stored Procedure sp_SyncFt2Cache
-- ============================================================

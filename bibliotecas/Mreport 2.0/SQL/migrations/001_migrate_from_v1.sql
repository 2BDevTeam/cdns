-- =============================================================================
-- MIGRAÇÃO 001 - De Mreport 1.x para Mreport 2.0
-- Executar APÓS Mreport tables.sql
--
-- Esta migração é IDEMPOTENTE: pode ser executada múltiplas vezes.
--   - Cria 1 MReportSection por cada (mreportstamp + section distinta) já existente
--   - Liga MReportObject.mreportsectionstamp aos novos stamps
--   - Mantém o campo MReportObject.section preenchido (legacy/runtime)
-- =============================================================================

SET NOCOUNT ON
GO

-- 1) Materializar secções a partir do MReportObject.section
INSERT INTO MReportSection (
    mreportsectionstamp, mreportstamp, codigo, descricao, tipo, ordem
)
SELECT
    LEFT(NEWID(), 25)              AS mreportsectionstamp,
    src.mreportstamp,
    src.section                    AS codigo,
    src.section                    AS descricao,
    CASE
        WHEN src.section = 'header' THEN 'header'
        WHEN src.section = 'footer' THEN 'footer'
        ELSE 'content'
    END                            AS tipo,
    CASE
        WHEN src.section = 'header' THEN 1
        WHEN src.section = 'content' THEN 2
        WHEN src.section = 'footer' THEN 3
        ELSE 99
    END                            AS ordem
FROM (
    SELECT DISTINCT mreportstamp, section
    FROM MReportObject
    WHERE ISNULL(section, '') <> ''
) src
WHERE NOT EXISTS (
    SELECT 1 FROM MReportSection s
    WHERE s.mreportstamp = src.mreportstamp
      AND s.codigo       = src.section
)
GO

-- 2) Ligar objectos às novas secções
UPDATE o
SET o.mreportsectionstamp = s.mreportsectionstamp
FROM MReportObject o
INNER JOIN MReportSection s
        ON s.mreportstamp = o.mreportstamp
       AND s.codigo       = o.section
WHERE ISNULL(o.mreportsectionstamp, '') = ''
GO

-- 3) Garantir que cada relatório tem pelo menos as 3 secções base
;WITH base AS (
    SELECT u_mreportstamp AS mreportstamp, 'header'  AS codigo, 1 AS ordem, 'header'  AS tipo FROM u_mreport
    UNION ALL
    SELECT u_mreportstamp,                  'content',           2,         'content'           FROM u_mreport
    UNION ALL
    SELECT u_mreportstamp,                  'footer',            3,         'footer'            FROM u_mreport
)
INSERT INTO MReportSection (mreportsectionstamp, mreportstamp, codigo, descricao, tipo, ordem)
SELECT LEFT(NEWID(), 25), b.mreportstamp, b.codigo, b.codigo, b.tipo, b.ordem
FROM base b
WHERE NOT EXISTS (
    SELECT 1 FROM MReportSection s
    WHERE s.mreportstamp = b.mreportstamp AND s.codigo = b.codigo
)
GO

PRINT 'Migração 001 concluída.'
GO


--select top 1 *from ft
--UPDATE top(1) ft SET nome = 'TESTE FTUEHI' WHERE ftstamp = 'ELB18050351564.951428697 ';

-- ============================================================
-- DIAGNÓSTICO: compara o checkpoint da SP com o CDC
-- ============================================================

DECLARE @from_lsn     BINARY(10);
DECLARE @to_lsn       BINARY(10);
DECLARE @sp_from_lsn  BINARY(10);

SET @to_lsn  = sys.fn_cdc_get_max_lsn();
SET @from_lsn = sys.fn_cdc_get_min_lsn('dbo_ft');  -- oldest available (histórico completo)

-- LSN que a SP usaria como ponto de partida
SELECT @sp_from_lsn = last_lsn FROM cache_control WHERE TableName = 'ft';

-- 1. Estado do checkpoint
SELECT
    'cache_control'                        AS fonte,
    @sp_from_lsn                           AS sp_last_lsn,
    @to_lsn                                AS cdc_max_lsn,
    CASE
        WHEN @sp_from_lsn IS NULL          THEN 'NUNCA INICIADO — last_lsn é NULL'
        WHEN @sp_from_lsn >= @to_lsn       THEN 'JÁ ACTUALIZADO — sem novas mudanças para a SP'
        ELSE                                    'HÁ MUDANÇAS POR PROCESSAR'
    END                                    AS diagnostico;

-- 2. Mudanças desde o checkpoint da SP (o que a SP veria)
SELECT
    '>>> desde last_lsn da SP'             AS intervalo,
    __$operation,
    CASE __$operation
        WHEN 1 THEN 'DELETE'
        WHEN 2 THEN 'INSERT'
        WHEN 3 THEN 'UPDATE - antes'
        WHEN 4 THEN 'UPDATE - depois'
    END AS operacao,
    no, nome, fdata, ftstamp
FROM cdc.fn_cdc_get_all_changes_dbo_ft(@sp_from_lsn, @to_lsn, N'all')
WHERE __$operation IN (1, 2, 4)
ORDER BY __$seqval, __$operation;

-- 3. Histórico completo (o que o teste original mostrava)
SELECT
    '>>> histórico completo (min_lsn)'     AS intervalo,
    __$operation,
    CASE __$operation
        WHEN 1 THEN 'DELETE'
        WHEN 2 THEN 'INSERT'
        WHEN 3 THEN 'UPDATE - antes'
        WHEN 4 THEN 'UPDATE - depois'
    END AS operacao,
    no, nome, fdata, ftstamp
FROM cdc.fn_cdc_get_all_changes_dbo_ft(@from_lsn, @to_lsn, N'all')
ORDER BY __$seqval, __$operation;

-- 4. Confirmação do registo em ft_cache para o ftstamp em causa
SELECT 'ft_cache' AS fonte, * FROM ft_cache
WHERE ftstamp = 'ELB18050351564.951428697 ';
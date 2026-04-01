-- ============================================================
-- sp_CleanFtCacheDelta
-- Remove entradas antigas de ft_cache_delta.
-- Executar diariamente via SQL Agent Job.
-- @retention_days: numero de dias a manter (default 30).
-- ============================================================

CREATE OR ALTER PROCEDURE sp_CleanFtCacheDelta
    @retention_days INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @cutoff  DATETIME = DATEADD(DAY, -@retention_days, GETUTCDATE());
    DECLARE @deleted INT;

    DELETE FROM ft_cache_delta
    WHERE CreatedAt < @cutoff;

    SET @deleted = @@ROWCOUNT;

    -- Log opcional
    -- INSERT INTO cache_admin_log (Action, Detail, CreatedAt)
    -- VALUES ('DELTA_CLEAN', CAST(@deleted AS VARCHAR) + ' rows removed before ' + CONVERT(VARCHAR, @cutoff, 120), GETUTCDATE());

END;

-- ============================================================
-- Adicionar ao job existente "Cache Sync - ft" ou criar job separado:
--
-- EXEC sp_add_jobstep
--     @job_name      = 'Cache Sync - ft',
--     @step_name     = 'Limpar deltas antigos',
--     @subsystem     = 'TSQL',
--     @command       = 'EXEC dbo.sp_CleanFtCacheDelta @retention_days = 30;',
--     @database_name = 'E14E105BD_CFM',
--     @freq_type     = 4;   -- diario
-- ============================================================

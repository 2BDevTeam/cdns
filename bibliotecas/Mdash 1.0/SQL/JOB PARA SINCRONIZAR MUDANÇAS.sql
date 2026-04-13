USE msdb;

-- Cria o Job
EXEC sp_add_job
    @job_name = 'Cache Sync - ft';

-- Step do Job
EXEC sp_add_jobstep
    @job_name      = 'Cache Sync - ft',
    @step_name     = 'Sync ft_cache via CDC',
    @subsystem     = 'TSQL',
    @command       = 'EXEC dbo.sp_SyncFtCache;',
    @database_name = 'E14E105BD_CFM';

-- Schedule cada 1 minuto
EXEC sp_add_schedule
    @schedule_name        = 'Every 1 Minute',
    @freq_type            = 4,
    @freq_interval        = 1,
    @freq_subday_type     = 4,
    @freq_subday_interval = 1;

-- Liga schedule ao job
EXEC sp_attach_schedule
    @job_name      = 'Cache Sync - ft',
    @schedule_name = 'Every 1 Minute';

-- Liga job ao servidor
EXEC sp_add_jobserver
    @job_name      = 'Cache Sync - ft';

-- Confirma que foi criado
SELECT 
    j.name,
    j.enabled,
    s.name AS schedule_name,
    s.freq_subday_interval AS every_x_minutes
FROM sysjobs j
JOIN sysjobschedules js ON j.job_id = js.job_id
JOIN sysschedules s ON js.schedule_id = s.schedule_id
WHERE j.name = 'Cache Sync - ft';


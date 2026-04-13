---- Desactiva CDC na tabela ft
--EXEC sys.sp_cdc_disable_table
--    @source_schema      = 'dbo',
--    @source_name        = 'ft',
--    @capture_instance   = 'all';

---- Reactiva CDC na tabela ft
--EXEC sys.sp_cdc_enable_table
--    @source_schema        = 'dbo',
--    @source_name          = 'ft',
--    @role_name            = NULL,
--    @capture_instance     = 'dbo_ft',
--    @supports_net_changes = 1;

--SELECT 
--    capture_instance,
--    source_schema,
--    source_table,
--    start_lsn
--FROM cdc.change_tables
--WHERE source_table = 'ft';

SELECT 
    capture_instance,
    object_name(source_object_id) AS source_table,
    start_lsn
FROM cdc.change_tables;


  SELECT no, nome, fdata, ftstamp, GETUTCDATE() AS CachedAt
    FROM cdc.fn_cdc_get_all_changes_dbo_ft(@from_lsn, @to_lsn, 'all')
    WHERE __$operation IN (2, 4)
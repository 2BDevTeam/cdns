CREATE PROCEDURE sp_get_report_by_codigoreport
    @codigoreport VARCHAR(250)
AS
BEGIN
    DECLARE @cols NVARCHAR(MAX) = '', 
            @colsSelect NVARCHAR(MAX) = '',
            @sql NVARCHAR(MAX);

    -- Gera a lista de colunas distintas baseadas em desccoluna com base no filtro
    SELECT @cols = @cols + QUOTENAME(desccoluna) + ','
    FROM (SELECT DISTINCT desccoluna FROM u_reportl WHERE codigoreport = @codigoreport) AS src;

    -- Remove a última vírgula
    SET @cols = LEFT(@cols, LEN(@cols) - 1);

    -- Gera a lista de colunas com ISNULL para evitar NULLs
    SELECT @colsSelect = @colsSelect + 'ISNULL(' + QUOTENAME(desccoluna) + ', '''') AS ' + QUOTENAME(desccoluna) + ','
    FROM (SELECT DISTINCT desccoluna FROM u_reportl WHERE codigoreport = @codigoreport) AS src;

    SET @colsSelect = LEFT(@colsSelect, LEN(@colsSelect) - 1);

    -- SQL dinâmico completo com filtro por codigoreport
    SET @sql = '
    SELECT rowid, ' + @colsSelect + '
    FROM (
        SELECT 
            rowid,
            desccoluna,
            valorStr = 
                CASE 
                    WHEN tipocol IN (''text'', ''table'') THEN cvalor
                    WHEN tipocol = ''digit'' THEN CAST(valor AS VARCHAR(250))
                    ELSE NULL
                END
        FROM u_reportl
        WHERE codigoreport = @codigoreport
    ) AS source
    PIVOT (
        MAX(valorStr)
        FOR desccoluna IN (' + @cols + ')
    ) AS pvt
    ORDER BY rowid;
    ';

    -- Executa com o parâmetro
    EXEC sp_executesql @sql, N'@codigoreport VARCHAR(250)', @codigoreport = @codigoreport;
END;

EXEC sp_get_report_by_codigoreport 'MAOOBRA';
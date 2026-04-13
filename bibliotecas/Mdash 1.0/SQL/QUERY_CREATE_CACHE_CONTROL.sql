CREATE TABLE cache_control (
    TableName       NVARCHAR(100)   NOT NULL PRIMARY KEY,
    LastUpdated     DATETIME        NOT NULL DEFAULT GETUTCDATE(),
    TotalRows       INT             NULL,
    Status          NVARCHAR(20)    NOT NULL DEFAULT 'READY',
    -- READY | BUILDING | ERROR
    last_lsn        BINARY(10)      NULL,
    BuildStart      DATETIME        NULL,
    BuildEnd        DATETIME        NULL,
    Version         INT             NOT NULL DEFAULT 0
    -- Version incrementa a cada sync com mudancas
    -- Frontend compara este valor com o que tem gravado localmente
    -- Version = 0 significa sem carga inicial (full refresh necessario)
    -- Version = 1 apos carga inicial, sobe a cada sync com mudancas
);

-- Para bases de dados ja existentes (adiciona coluna sem recriar tabela):
-- ALTER TABLE cache_control ADD Version INT NOT NULL DEFAULT 0;

INSERT INTO cache_control (TableName, Status, LastUpdated, last_lsn, Version)
VALUES ('ft', 'READY', GETUTCDATE(), sys.fn_cdc_get_min_lsn('dbo_ft'), 0);

SELECT * FROM cache_control;
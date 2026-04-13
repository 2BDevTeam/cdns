-- Adiciona coluna Version a cache_control
-- Incrementa a cada sync que produz mudancas
-- Usado pelo frontend para detectar se o seu cache local esta desactualizado

ALTER TABLE cache_control
    ADD Version INT NOT NULL DEFAULT 0;

-- Confirma estrutura final
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'cache_control'
ORDER BY ORDINAL_POSITION;

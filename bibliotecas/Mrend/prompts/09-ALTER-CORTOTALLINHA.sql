-- Adiciona cor configurável à linha de total (MrendLinha)
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'MrendLinha' AND COLUMN_NAME = 'cortotallinha'
)
BEGIN
    ALTER TABLE MrendLinha ADD cortotallinha VARCHAR(50) DEFAULT '';
END

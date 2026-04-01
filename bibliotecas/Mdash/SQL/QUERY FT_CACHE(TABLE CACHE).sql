DROP TABLE IF EXISTS ft_cache;

CREATE TABLE ft_cache (
    nome        NVARCHAR(255)    default '',
	no numeric(16) default 0,
    fdata       DATETIME         default '19000101',
    ftstamp     varchar(25)         default '',
    CachedAt    DATETIME         DEFAULT GETUTCDATE()
);

CREATE CLUSTERED COLUMNSTORE INDEX IX_ft_cache_columnstore ON ft_cache;

DECLARE @start DATETIME = GETUTCDATE();

INSERT INTO ft_cache (nome, fdata, ftstamp, CachedAt)
SELECT nome, fdata, ftstamp, GETUTCDATE()
FROM ft;


--SELECT no, nome, fdata, ftstamp 
--FROM ft_cache
--ORDER BY no
--OFFSET 0 ROWS FETCH NEXT 100000 ROWS ONLY;

SELECT no, nome,fdata FROM ft_cache WHERE fdata >= '2025-01-01';
-- ============================================================
-- ft_cache_delta
-- Log incremental de mudancas para consumo pelo frontend.
-- O frontend pede apenas as linhas com Version > (versao local).
-- Cada linha representa uma operacao sobre um registo de ft_cache.
-- ============================================================

DROP TABLE IF EXISTS ft_cache_delta;

CREATE TABLE ft_cache_delta (
    Id          BIGINT          NOT NULL IDENTITY(1,1) PRIMARY KEY,
    Version     INT             NOT NULL,       -- Version do cache_control no momento da mudanca
    Operation   CHAR(1)         NOT NULL        -- 'I' Insert | 'U' Update | 'D' Delete
                    CHECK (Operation IN ('I','U','D')),
    ftstamp     VARCHAR(100)    NOT NULL,       -- chave de negocio (igual a ft_cache.ftstamp)
    no          NUMERIC(16)     NULL,
    nome        NVARCHAR(255)   NULL,
    fdata       DATETIME        NULL,
    CreatedAt   DATETIME        NOT NULL DEFAULT GETUTCDATE()
);

-- Indice para queries incrementais do frontend (WHERE Version > N)
CREATE INDEX IX_ft_cache_delta_Version ON ft_cache_delta (Version ASC);

-- ============================================================
-- Retencao: limpar deltas com mais de X dias (ver SP_LIMPEZA_DELTA.sql)
-- Por omissao 30 dias. Ajustar conforme politica de sessoes inactivas.
-- Se o frontend pedir since_version abaixo do minimo disponivel,
-- o backend deve responder com fullRefresh: true.
-- ============================================================

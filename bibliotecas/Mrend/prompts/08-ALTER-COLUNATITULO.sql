-- =============================================================================
-- MRend — Migração: colunatitulo em MrendLinha
-- =============================================================================
-- Descrição : Adiciona o campo colunatitulo à MrendLinha.
--             Quando comportamentogrupo=1, a coluna cujo codigocoluna corresponde
--             a colunatitulo permanece editável (título da linha de grupo).
--             Todas as outras colunas ficam desabilitadas com fundo colorido.
--             Se colunatitulo estiver vazio, o fallback é a coluna com fixacoluna=1.
--
-- Tabela afectada : MrendLinha
-- Campo novo      : colunatitulo VARCHAR(100)
-- =============================================================================

-- ─── PRÉ-VERIFICAÇÃO ─────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1
    FROM   INFORMATION_SCHEMA.COLUMNS
    WHERE  TABLE_NAME   = 'MrendLinha'
    AND    COLUMN_NAME  = 'colunatitulo'
)
BEGIN
    ALTER TABLE MrendLinha
        ADD colunatitulo VARCHAR(100) NOT NULL DEFAULT '';
    PRINT 'Campo colunatitulo adicionado.';
END
ELSE
BEGIN
    PRINT 'Campo colunatitulo já existe — ignorado.';
END

-- =============================================================================
-- EXEMPLO DE USO
-- =============================================================================
/*
    -- Linha pai (grupo) — fica com fundo azul, só a coluna "DESCRICAO" é título
    UPDATE MrendLinha
    SET comportamentogrupo = 1,
        corcomportgrupo    = '#d0e8ff',
        colunatitulo       = 'DESCRICAO'  -- codigocoluna da coluna visível
    WHERE codigo = 'GRP_INVESTIMENTO';
*/

-- =============================================================================
-- MRend — Migração: comportamentogrupo + corcomportgrupo em MrendLinha
-- =============================================================================
-- Descrição : Adiciona suporte nativo a linhas que actuam como grupo.
--             Ao activar comportamentogrupo=1 numa MrendLinha:
--               • Todas as células da linha ficam desabilitadas (readonly/disabled)
--               • Excepto a coluna com fixacoluna=1

 (a coluna âncora/label)
--               • A linha recebe fundo colorido via corcomportgrupo
--               • addLinhaFilha passa a usar a config da linha-filha (via linkstamp)
--                 em vez de copiar a config do pai — evitando herança indesejada
--
-- Tabela afectada : MrendLinha
-- Campos novos    : comportamentogrupo BIT, corcomportgrupo VARCHAR(50)
-- =============================================================================

-- ─── PRÉ-VERIFICAÇÃO ─────────────────────────────────────────────────────────
-- Verificar se os campos já existem antes de os adicionar (idempotente)
IF NOT EXISTS (
    SELECT 1
    FROM   INFORMATION_SCHEMA.COLUMNS
    WHERE  TABLE_NAME   = 'MrendLinha'
    AND    COLUMN_NAME  = 'comportamentogrupo'
)
BEGIN
    ALTER TABLE MrendLinha
        ADD comportamentogrupo BIT NOT NULL DEFAULT 0;
    PRINT 'Campo comportamentogrupo adicionado.';
END
ELSE
BEGIN
    PRINT 'Campo comportamentogrupo já existe — ignorado.';
END;

IF NOT EXISTS (
    SELECT 1
    FROM   INFORMATION_SCHEMA.COLUMNS
    WHERE  TABLE_NAME   = 'MrendLinha'
    AND    COLUMN_NAME  = 'corcomportgrupo'
)
BEGIN
    ALTER TABLE MrendLinha
        ADD corcomportgrupo VARCHAR(50) NOT NULL DEFAULT '';
    PRINT 'Campo corcomportgrupo adicionado.';
END
ELSE
BEGIN
    PRINT 'Campo corcomportgrupo já existe — ignorado.';
END;


-- ─── VERIFICAÇÃO FINAL ───────────────────────────────────────────────────────
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_DEFAULT,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME  = 'MrendLinha'
  AND COLUMN_NAME IN ('comportamentogrupo', 'corcomportgrupo')
ORDER BY ORDINAL_POSITION;

-- Resultado esperado:
-- comportamentogrupo   bit          NULL   ((0))   NO
-- corcomportgrupo      varchar      50     ('')     NO


-- =============================================================================
-- COMO USAR (exemplo num INSERT de MrendLinha de grupo)
-- =============================================================================
/*
INSERT INTO MrendLinha (
    linhastamp, relatoriostamp,
    tipo, codigo, descricao,
    temcolunas, modelo, addfilho,
    ordem, descbtnModelo,
    comportamentogrupo, corcomportgrupo,   -- ← novos campos
    ...
) VALUES (
    @linhaGrupoStamp, @notaStamp,
    'Singular', 'u_reportl', N'Objectivos Estratégicos',
    1, 1, 1,
    100, N'Adicionar Objectivo',
    1, '#e8edf2',                          -- ← linha é grupo, fundo cinza claro
    ...
);

-- A linha-filha referenciada via linkstamp:
INSERT INTO MrendLinha (
    linhastamp, relatoriostamp,
    linkstamp,                             -- ← aponta para linhastamp do pai
    tipo, codigo, descricao,
    temcolunas, modelo, addfilho,
    ordem,
    comportamentogrupo, corcomportgrupo,   -- ← 0 / '' na filha
    ...
) VALUES (
    @linhaFilhaStamp, @notaStamp,
    @linhaGrupoStamp,                      -- ← linkstamp = linhastamp do grupo
    'Singular', 'u_reportl', N'Acções Estratégicas',
    1, 1, 0,
    200,
    0, '',                                 -- ← filha normal, sem comportamento de grupo
    ...
);
*/

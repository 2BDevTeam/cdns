-- =============================================================================
-- MRend — INSERT Scripts — Exemplo Completo
-- =============================================================================
-- Cenário exemplo: Relatório "Execução Orçamental"
--   • Tabela de cabeçalho: u_obra (PK: u_obrastamp, filtro: codigo)
--   • Colunas: Conta (lookup), Jan-Dez (digit), Total (calculado = soma meses)
--   • 1 linha modelo (utilizador pode adicionar linhas)
--   • Agrupamento: "1º Semestre" (Jan-Jun) e "2º Semestre" (Jul-Dec)
-- =============================================================================
-- INSTRUÇÃO: Substitua os valores entre < > pelos valores reais do seu projecto.
--            Execute no SQL Server Management Studio.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GERAÇÃO DE STAMPS
-- Substitua cada variável pelo resultado de LEFT(REPLACE(NEWID(),'-',''),25)
-- ou execute os DECLARE abaixo (SQL Server gera automaticamente).
-- ─────────────────────────────────────────────────────────────────────────────

DECLARE @relatorioStamp      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @linhaStamp1         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

DECLARE @colStamp_conta      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_janeiro    VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_fevereiro  VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_marco      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_abril      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_maio       VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_junho      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_julho      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_agosto     VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_setembro   VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_outubro    VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_novembro   VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_dezembro   VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @colStamp_total      VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

DECLARE @grupoStamp_sem1     VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @grupoStamp_sem2     VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @grupoStamp_totais   VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

-- Código do relatório (usar minúsculas/maiúsculas/sem espaços)
DECLARE @codigo VARCHAR(250) = 'ORCEXEC';


-- =============================================================================
-- 1. MRENDRELATORIO — Registo-mestre do relatório
-- =============================================================================
INSERT INTO MRendRelatorio (
    MRendRelatorioSTAMP,
    codigo,
    nome,
    categoria,
    totalrelatorio,
    totalcoluna,
    dectotrelatorio,
    dectotcoluna,
    defdesccoluna,
    adicionalinha,
    linhamodelo
) VALUES (
    @relatorioStamp,
    @codigo,
    'Execução Orçamental',    -- nome visível
    'financeiro',             -- categoria (livre)
    0,                        -- totalrelatorio
    0,                        -- totalcoluna
    '',                       -- dectotrelatorio
    '',                       -- dectotcoluna
    '',                       -- defdesccoluna
    0,                        -- adicionalinha
    ''                        -- linhamodelo
);


-- =============================================================================
-- 2. MRENDLINHA — Linhas/grupos da grelha
-- =============================================================================
-- Neste exemplo: 1 linha modelo (o utilizador adiciona linhas de despesa)
INSERT INTO MrendLinha (
    linhastamp,
    relatoriostamp,
    tipo,
    codigo,
    descricao,
    temcolunas,
    modelo,
    leitura,
    addfilho,
    ordem,
    descbtnModelo,
    eventoadd,
    eventoaddexpr,
    eventodelete,
    eventodeleteexpr,
    temtotais,
    totkey,
    totfield,
    sinalnegativo,
    campovalid,
    condicaovalidacao,
    cor,
    estilopersonalizado,
    expressaoestilopersonalizado,
    tipolistagem,
    objectolist,
    categoria,
    codcategoria,
    ordem,
    usafnpren,
    fnpren,
    executachange,
    expressaochangejs,
    executachangesubgrupo,
    expressaochangejssubgrupo,
    parentstamp,
    linkstamp,
    expressao,
    explist,
    defselect,
    campooption,
    campovalor,
    sourceKey,
    sourceBind,
    extras
) VALUES (
    @linhaStamp1,
    @relatorioStamp,
    'Singular',                     -- tipo: Grupo | Subgrupo | Singular
    'u_reportl',                    -- codigo (usado em addLinhaComCelulas/addLinhaComRegistos)
    'Rubrica Orçamental',           -- descricao
    1,                              -- temcolunas: 1 = tem colunas editáveis
    1,                              -- modelo: 1 = utilizador pode adicionar linhas
    0,                              -- leitura: 0 = editável
    0,                              -- addfilho
    100,                            -- ordem
    'Adicionar rubrica',            -- descbtnModelo
    0, '',                          -- eventoadd, eventoaddexpr
    0, '',                          -- eventodelete, eventodeleteexpr
    0, '', '',                      -- temtotais, totkey, totfield
    0,                              -- sinalnegativo
    '', '',                         -- campovalid, condicaovalidacao
    '',                             -- cor
    0, '',                          -- estilopersonalizado, expressaoestilopersonalizado
    'table',                        -- tipolistagem
    '',                             -- objectolist
    '', '',                         -- categoria, codcategoria
    100,                            -- ordem (repetido — campo na BD)
    0, '',                          -- usafnpren, fnpren
    0, '',                          -- executachange, expressaochangejs
    0, '',                          -- executachangesubgrupo, expressaochangejssubgrupo
    '', '',                         -- parentstamp, linkstamp
    '',                             -- expressao
    '', '', '', '',                 -- explist, defselect, campooption, campovalor
    '', '', ''                      -- sourceKey, sourceBind, extras
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Para linha de TOTAIS (leitura, calculada):
-- ─────────────────────────────────────────────────────────────────────────────
-- INSERT INTO MrendLinha (...) VALUES (
--     LEFT(REPLACE(NEWID(),'-',''),25), @relatorioStamp,
--     'Singular', 'totais', 'Totais Gerais',
--     1,   -- temcolunas
--     0,   -- modelo = 0 (não adicionável)
--     1,   -- leitura = 1 (só leitura)
--     ...
-- );


-- =============================================================================
-- 3. MRENDCOLUNA — Definição de cada coluna
-- =============================================================================

-- ─── CONTA (tipo: table / lookup) ─────────────────────────────────────────
INSERT INTO MrendColuna (
    colunastamp, relatoriostamp,
    codigocoluna, desccoluna,
    tipo,
    campo,        -- cvalor para lookup/texto
    atributo,
    ordem, tamanho, alinhamento,
    colfunc, expresscolfun,
    fixacoluna,
    inactivo, forcaeditavel, temlinhadesc,
    validacoluna, campovalid, condicaovalidacao,
    proibenegativo, decimais,
    nometb, valtb,
    usaexpresstbjs, expressaotbjs,
    usaexpressaocoldesc, expresssaojscoldesc,
    eventoclique, expressaoclique,
    executaeventochange, expressaojsevento,
    condicattr, condicattrexpr,
    condictipo, condicetipoxpr,
    condicfunc, condicfuncexpr,
    modelo, descbtnModelo, addBtn,
    setinicio, setfim,
    botaohtml,
    categoria, regra,
    sourceKey, sourceBind, extras,
    fx_tipo, fx_activo, fx_expressao, fx_colrefs
) VALUES (
    @colStamp_conta, @relatorioStamp,
    'conta',          -- codigocoluna (sem espaços, minúsculas)
    'Conta',          -- desccoluna (label na grelha)
    'table',          -- tipo: lookup/dropdown
    'cvalor',         -- campo: cvalor para tipo table
    'enabled',        -- atributo: '' | 'enabled' | 'disabled' | 'readonly'
    1,                -- ordem (posição na coluna)
    150,              -- tamanho em px
    'left',           -- alinhamento
    0, '',            -- colfunc, expresscolfun
    1,                -- fixacoluna: 1 = coluna fixa (não faz scroll)
    0, 0, 0,          -- inactivo, forcaeditavel, temlinhadesc
    0, '', '',        -- validacoluna, campovalid, condicaovalidacao
    0, 2,             -- proibenegativo, decimais
    'nome', 'codigo', -- nometb (campo label), valtb (campo valor) — substituir pelo real
    0, '',            -- usaexpresstbjs, expressaotbjs
    0, '',            -- usaexpressaocoldesc, expresssaojscoldesc
    0, '',            -- eventoclique, expressaoclique
    0, '',            -- executaeventochange, expressaojsevento
    0, '',            -- condicattr, condicattrexpr
    0, '',            -- condictipo, condicetipoxpr
    0, '',            -- condicfunc, condicfuncexpr
    0, 'Adicionar coluna', 0,
    0, 0,             -- setinicio, setfim
    '',               -- botaohtml
    'default', '',    -- categoria, regra
    '', '', '',       -- sourceKey, sourceBind, extras
    '', 0, '', ''     -- fx_tipo, fx_activo, fx_expressao, fx_colrefs
);

-- ─── JANEIRO (tipo: digit / número) ───────────────────────────────────────
INSERT INTO MrendColuna (
    colunastamp, relatoriostamp,
    codigocoluna, desccoluna,
    tipo, campo, atributo,
    ordem, tamanho, alinhamento,
    colfunc, expresscolfun,
    fixacoluna, inactivo, forcaeditavel, temlinhadesc,
    validacoluna, campovalid, condicaovalidacao,
    proibenegativo, decimais,
    nometb, valtb,
    usaexpresstbjs, expressaotbjs,
    usaexpressaocoldesc, expresssaojscoldesc,
    eventoclique, expressaoclique,
    executaeventochange, expressaojsevento,
    condicattr, condicattrexpr,
    condictipo, condicetipoxpr,
    condicfunc, condicfuncexpr,
    modelo, descbtnModelo, addBtn,
    setinicio, setfim, botaohtml,
    categoria, regra,
    sourceKey, sourceBind, extras,
    fx_tipo, fx_activo, fx_expressao, fx_colrefs
) VALUES (
    @colStamp_janeiro, @relatorioStamp,
    'janeiro', 'Janeiro',
    'digit',          -- tipo numérico
    'saldo',          -- campo: SEMPRE saldo para digit
    'enabled',
    2, 80, 'right',   -- ordem 2, tamanho 80px, alinhado à direita
    0, '',            -- não é calculada
    0, 0, 0, 0,
    0, '', '',
    0, 2,
    '', '',
    0, '', 0, '', 0, '', 0, '',
    0, '', 0, '', 0, '',
    0, 'Adicionar coluna', 0,
    0, 0, '',
    'default', '',
    '', '', '',
    '', 0, '', ''
);

-- ─── FEVEREIRO ─────────────────────────────────────────────────────────────
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_fevereiro, @relatorioStamp, 'fevereiro', 'Fevereiro', 'digit', 'saldo', 'enabled', 3, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_marco, @relatorioStamp, 'marco', 'Março', 'digit', 'saldo', 'enabled', 4, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_abril, @relatorioStamp, 'abril', 'Abril', 'digit', 'saldo', 'enabled', 5, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_maio, @relatorioStamp, 'maio', 'Maio', 'digit', 'saldo', 'enabled', 6, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_junho, @relatorioStamp, 'junho', 'Junho', 'digit', 'saldo', 'enabled', 7, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_julho, @relatorioStamp, 'julho', 'Julho', 'digit', 'saldo', 'enabled', 8, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_agosto, @relatorioStamp, 'agosto', 'Agosto', 'digit', 'saldo', 'enabled', 9, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_setembro, @relatorioStamp, 'setembro', 'Setembro', 'digit', 'saldo', 'enabled', 10, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_outubro, @relatorioStamp, 'outubro', 'Outubro', 'digit', 'saldo', 'enabled', 11, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_novembro, @relatorioStamp, 'novembro', 'Novembro', 'digit', 'saldo', 'enabled', 12, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@colStamp_dezembro, @relatorioStamp, 'dezembro', 'Dezembro', 'digit', 'saldo', 'enabled', 13, 80, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, 'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- ─── TOTAL (tipo: digit, calculado) ────────────────────────────────────────
-- NOTA: colfunc=1, expresscolfun = soma de todos os meses, atributo='readonly'
INSERT INTO MrendColuna (
    colunastamp, relatoriostamp,
    codigocoluna, desccoluna,
    tipo, campo, atributo,
    ordem, tamanho, alinhamento,
    colfunc, expresscolfun,
    fixacoluna, inactivo, forcaeditavel, temlinhadesc,
    validacoluna, campovalid, condicaovalidacao,
    proibenegativo, decimais,
    nometb, valtb,
    usaexpresstbjs, expressaotbjs,
    usaexpressaocoldesc, expresssaojscoldesc,
    eventoclique, expressaoclique,
    executaeventochange, expressaojsevento,
    condicattr, condicattrexpr,
    condictipo, condicetipoxpr,
    condicfunc, condicfuncexpr,
    modelo, descbtnModelo, addBtn,
    setinicio, setfim, botaohtml,
    categoria, regra,
    sourceKey, sourceBind, extras,
    fx_tipo, fx_activo, fx_expressao, fx_colrefs
) VALUES (
    @colStamp_total, @relatorioStamp,
    'total', 'Total',
    'digit',            -- tipo numérico
    'saldo',            -- campo: saldo para digit
    'readonly',         -- readonly: coluna calculada não se edita
    14, 100, 'right',
    1,                  -- colfunc: 1 = coluna função/calculada
    '<janeiro>+<fevereiro>+<marco>+<abril>+<maio>+<junho>+<julho>+<agosto>+<setembro>+<outubro>+<novembro>+<dezembro>',
    0, 0, 0, 0,
    0, '', '',
    0, 2,
    '', '',
    0, '', 0, '', 0, '', 0, '',
    0, '', 0, '', 0, '',
    0, 'Adicionar coluna', 0,
    0, 0, '',
    'default', '',
    '', '', '',
    'coluna', 1,        -- fx_tipo, fx_activo
    '<janeiro>+<fevereiro>+<marco>+<abril>+<maio>+<junho>+<julho>+<agosto>+<setembro>+<outubro>+<novembro>+<dezembro>',
    '["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]'
);


-- =============================================================================
-- 4. MRENDCELULA — Overrides de células (só quando necessário)
-- =============================================================================
-- Exemplo: tornar a coluna "conta" readonly na linha de totais
-- (só inserir se existir uma linha de totais separada)

/*
DECLARE @celulaTotaisContaStamp VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
INSERT INTO MrendCelula (
    celulastamp, linhastamp, colunastamp, codigocoluna,
    inactivo, desabilitado, atributo, sinalnegativo,
    usafnpren, fnpren,
    condicinactivo, condicinactexpr,
    valordefeito, valordefeitoexpr, valdefafinstancia,
    sourceKey, sourceBind, extras,
    fx, temfx, fx_tipo, fx_activo, fx_expressao, fx_colrefs
) VALUES (
    @celulaTotaisContaStamp,
    '<stamp_linha_totais>',    -- linhastamp
    @colStamp_conta,           -- colunastamp
    'conta',                   -- codigocoluna
    1,     -- inactivo: ocultar esta célula na linha de totais
    0, '', 0,
    0, '',
    0, '',
    0, '', 0,
    '', '', '',
    '', 0, '', 0, '', ''
);
*/


-- =============================================================================
-- 5. MRENDGRUPOCOLUNA + MRENDGRUPOCOLUNAITEM — Cabeçalho multi-nível
-- =============================================================================

-- ─── Grupo "1º Semestre" ──────────────────────────────────────────────────
INSERT INTO MrendGrupoColuna (grupocolunastamp, relatoriostamp, codigogrupo, descgrupo, fixa, ordem, extras)
VALUES (@grupoStamp_sem1, @relatorioStamp, 'sem1', '1º Semestre', 0, 1, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_janeiro,   1, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_fevereiro,  2, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_marco,      3, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_abril,      4, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_maio,       5, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem1, @relatorioStamp, @colStamp_junho,      6, '');

-- ─── Grupo "2º Semestre" ──────────────────────────────────────────────────
INSERT INTO MrendGrupoColuna (grupocolunastamp, relatoriostamp, codigogrupo, descgrupo, fixa, ordem, extras)
VALUES (@grupoStamp_sem2, @relatorioStamp, 'sem2', '2º Semestre', 0, 2, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_julho,      1, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_agosto,     2, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_setembro,   3, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_outubro,    4, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_novembro,   5, ''),
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_sem2, @relatorioStamp, @colStamp_dezembro,   6, '');

-- ─── Grupo "Totais" ───────────────────────────────────────────────────────
INSERT INTO MrendGrupoColuna (grupocolunastamp, relatoriostamp, codigogrupo, descgrupo, fixa, ordem, extras)
VALUES (@grupoStamp_totais, @relatorioStamp, 'totais', 'Totais', 0, 3, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES
    (LEFT(REPLACE(NEWID(),'-',''),25), @grupoStamp_totais, @relatorioStamp, @colStamp_total, 1, '');


-- =============================================================================
-- 6. ACTUALIZAR RENDOPT em MRendRelatorio
-- (JSON de inicialização do MRend.js)
-- =============================================================================
UPDATE MRendRelatorio
SET rendopt = N'{
    "enableEdit": "$(\"#mainPage\").data(\"state\") == \"editar\"",
    "resetSourceStamp": "$(\"#mainPage\").data(\"state\") != \"editar\"",
    "containerToRender": "#campos > .row:last",
    "datasourceName": "u_reportl",
    "tableSourceName": "u_reportl",
    "table": "u_reportl",
    "codigo": "ORCEXEC",
    "remoteFetch": "true",
    "remoteFetchData": {
        "url": "../programs/gensel.aspx?cscript=getdatafromphc",
        "type": "POST",
        "data": {
            "__EVENTARGUMENT": "JSON.stringify([{ codigo: \"ORCEXEC\", filtroval: getRecordStamp() }])"
        }
    },
    "dbTableToMrendObject": {
        "chunkMapping": true,
        "table": "u_reportl",
        "dbName": "MrendDB_ORCEXEC",
        "tableKey": "u_reportlstamp",
        "defaultColumnName": "",
        "extras": {
            "ordemField": "naturezaordem",
            "linkField": "gruporowid",
            "cellIdField": "u_reportlstamp",
            "colunaField": "rubrica",
            "linhaField": "natureza",
            "rowIdField": "naturezasubrowid",
            "descLinhaField": "descnatureza",
            "descColunaField": "descrubrica",
            "ordemColunaField": "grupolordem",
            "tipocolField": "tipocol"
        }
    },
    "schemas": [
        "u_reportlstamp", "naturezasubrowid", "naturezaordem",
        "saldo", "rubrica", "natureza", "descnatureza",
        "gruporowid", "grupolordem", "descrubrica",
        "saldoanoant", "u_reportcstamp", "cvalor", "tipocol"
    ],
    "recordData": { "stamp": "getReportStamp()" },
    "afterRenderCallback": ""
}'
WHERE codigo = 'ORCEXEC';


-- =============================================================================
-- 7. VERIFICAR INSERTS
-- =============================================================================
SELECT 'MRendRelatorio'  AS tabela, COUNT(*) AS total FROM MRendRelatorio  WHERE codigo = 'ORCEXEC'
UNION ALL
SELECT 'MrendLinha',      COUNT(*) FROM MrendLinha      WHERE relatoriostamp = @relatorioStamp
UNION ALL
SELECT 'MrendColuna',     COUNT(*) FROM MrendColuna     WHERE relatoriostamp = @relatorioStamp
UNION ALL
SELECT 'MrendCelula',     COUNT(*) FROM MrendCelula     WHERE linhastamp = @linhaStamp1
UNION ALL
SELECT 'MrendGrupoColuna',COUNT(*) FROM MrendGrupoColuna WHERE relatoriostamp = @relatorioStamp
UNION ALL
SELECT 'MrendGrupoColunaItem', COUNT(*) FROM MrendGrupoColunaItem WHERE relatoriostamp = @relatorioStamp;

-- Resultado esperado:
-- MRendRelatorio    → 1
-- MrendLinha        → 1
-- MrendColuna       → 14  (conta + 12 meses + total)
-- MrendCelula       → 0   (sem overrides neste exemplo)
-- MrendGrupoColuna  → 3   (sem1, sem2, totais)
-- MrendGrupoColunaItem → 13


-- =============================================================================
-- NOTAS IMPORTANTES
-- =============================================================================
/*
1. STAMPS: Todos têm 25 chars. Usar LEFT(REPLACE(NEWID(),'-',''),25).

2. CAMPO vs TIPO:
   digit  → campo='saldo'
   text/table/date/textarea/logic → campo='cvalor'

3. EXPRESSÕES:
   CORRECTO:  <janeiro>+<fevereiro>+<marco>+...
   ERRADO:    {janeiro}+{fevereiro}   → SyntaxError no browser

4. COLUNA CALCULADA (total):
   - colfunc=1
   - expresscolfun='<col1>+<col2>+...'
   - atributo='readonly' (impedir edição manual)
   - fx_tipo='coluna', fx_activo=1
   - fx_expressao = mesma expressão
   - fx_colrefs = JSON array dos códigos referenciados

5. TABELA DE CABEÇALHO:
   Não existe INSERT para a tabela de cabeçalho PHC neste script.
   Essa tabela (ex: u_obra, u_nota) já existe no PHC e apenas
   precisa de ter o campo "codigo" preenchido com o código do relatório.

6. INICIALIZAÇÃO NO ECRÃ (pageLoad/VB do ecrã PHC):
   initTabelaConfiguracaoMrender({
       codigo: codigo,
       relatorioTable: 'u_obra',          ← VARIA
       relatorioTableKey: 'u_obrastamp',  ← VARIA
       relatorioTableFilterField: 'codigo', ← VARIA
       defaultInitConfig: { ... }
   });

7. LIMPAR CACHE IndexedDB:
   Se alterar configuração e os valores antigos persistirem no browser:
   DevTools → Application → IndexedDB → Delete database 'MrendDB_<CODIGO>'
*/

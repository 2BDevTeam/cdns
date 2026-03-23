-- =============================================================================
-- MRend — INSERT Scripts — Plano de Negócios
-- =============================================================================
-- Relatório : Plano de Negócios
-- Código     : Plano de Negócios   (nota = descnota)
-- Cabeçalho  : u_nota  |  PK: u_notastamp
-- NÃO usa MRendRelatorio — registo criado directamente em u_nota
-- Estrutura  : chunkMapping = false
--              1 Linha modelo (Objectivos Estratégicos) | 14 Colunas
-- =============================================================================
-- GRUPOS DE COLUNAS (da imagem BRD):
--   Grupo "Meta Anual"  → metaano1, metaano2, metaano3, metaano4
--   Grupo "Cronograma"  → cronoano1, cronoano2, cronoano3, cronoano4
--
-- COLUNAS:
--   1.  Ações Estratégicas            (text, fixacoluna=1)
--   2.  Actividade                    (text)
--   3-6.  [Meta Anual: Ano 1..4]      (digit — grupo)
--   7.  Classificação Orçamentária    (text)
--   8.  Fontes de Financiamento       (table → dropdown: Fundos Próprios | Financiamento Bancário | Outras)
--   9-12. [Cronograma: Ano 1..4]      (digit — grupo)
--  13.  Direcção                      (text)
--  14.  Observações                   (textarea)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STAMPS
-- ─────────────────────────────────────────────────────────────────────────────
DECLARE @notaStamp              VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @codigo                 NVARCHAR(250) = N'Plano de Negócios';

-- Linha
DECLARE @linhaStamp             VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

-- Colunas
DECLARE @col_acoesestrategicas  VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_actividade         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_metaano1           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_metaano2           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_metaano3           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_metaano4           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_classorcam         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_fontesfinanc       VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_cronoano1          VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_cronoano2          VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_cronoano3          VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_cronoano4          VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_direccao           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_observacoes        VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

-- Grupos de colunas
DECLARE @grp_meta               VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @grp_crono              VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);


-- =============================================================================
-- 1. u_nota  —  registo de cabeçalho
--    nota = descnota = 'Plano de Negócios'
-- =============================================================================
INSERT INTO u_nota (
    u_notastamp,
    nota,
    descnota
) VALUES (
    @notaStamp,
    @codigo,
    @codigo
);


-- =============================================================================
-- 2. MrendLinha — 1 linha modelo (Objectivos Estratégicos)
-- =============================================================================
INSERT INTO MrendLinha (
    linhastamp, relatoriostamp,
    tipo, codigo, descricao,
    temcolunas, modelo, leitura, addfilho,
    ordem, descbtnModelo,
    eventoadd, eventoaddexpr, eventodelete, eventodeleteexpr,
    temtotais, totkey, totfield,
    sinalnegativo, campovalid, condicaovalidacao,
    cor, estilopersonalizado, expressaoestilopersonalizado,
    tipolistagem, objectolist, categoria, codcategoria,
    usafnpren, fnpren, executachange, expressaochangejs,
    executachangesubgrupo, expressaochangejssubgrupo,
    parentstamp, linkstamp, expressao,
    explist, defselect, campooption, campovalor,
    sourceKey, sourceBind, extras
) VALUES (
    @linhaStamp, @notaStamp,
    'Singular', 'u_reportl', N'Objectivos Estratégicos',
    1, 1, 0, 0, 100, N'Adicionar Objectivo',
    0, '', 0, '', 0, '', '', 0, '', '',
    '', 0, '', 'table', '', '', '', 0, '', 0, '', 0, '',
    '', '', '', '', '', '', '',
    '', '', ''
);


-- =============================================================================
-- 3. MrendColuna — 14 colunas
-- =============================================================================

-- 1. Ações Estratégicas (text → cvalor, fixacoluna=1 — âncora da linha)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_acoesestrategicas, @notaStamp, 'acoesestrategicas', N'Ações Estratégicas', 'text', 'cvalor', 'enabled', 1, 220, 'left', 0, '', 1, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 2. Actividade (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_actividade, @notaStamp, 'actividade', N'Actividade', 'text', 'cvalor', 'enabled', 2, 200, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 3. Meta Anual – Ano 1 (digit → saldo)  [grupo Meta Anual]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_metaano1, @notaStamp, 'metaano1', N'Ano 1', 'digit', 'saldo', 'enabled', 3, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 4. Meta Anual – Ano 2 (digit → saldo)  [grupo Meta Anual]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_metaano2, @notaStamp, 'metaano2', N'Ano 2', 'digit', 'saldo', 'enabled', 4, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 5. Meta Anual – Ano 3 (digit → saldo)  [grupo Meta Anual]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_metaano3, @notaStamp, 'metaano3', N'Ano 3', 'digit', 'saldo', 'enabled', 5, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 6. Meta Anual – Ano 4 (digit → saldo)  [grupo Meta Anual]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_metaano4, @notaStamp, 'metaano4', N'Ano 4', 'digit', 'saldo', 'enabled', 6, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 7. Classificação Orçamentária (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_classorcam, @notaStamp, 'classorcam', N'Classificação Orçamentária', 'text', 'cvalor', 'enabled', 7, 180, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 8. Fontes de Financiamento (table → cvalor, dropdown: Fundos Próprios | Financiamento Bancário | Outras)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_fontesfinanc, @notaStamp, 'fontesfinanc', N'Fontes de Financiamento', 'table', 'cvalor', 'enabled', 8, 200, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, 'nome', 'valor', 1, '[{nome:''Fundos Próprios'',valor:''Fundos Próprios''},{nome:''Financiamento Bancário'',valor:''Financiamento Bancário''},{nome:''Outras'',valor:''Outras''}]', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 9. Cronograma – Ano 1 (digit → saldo)  [grupo Cronograma]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_cronoano1, @notaStamp, 'cronoano1', N'Ano 1', 'digit', 'saldo', 'enabled', 9, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 10. Cronograma – Ano 2 (digit → saldo)  [grupo Cronograma]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_cronoano2, @notaStamp, 'cronoano2', N'Ano 2', 'digit', 'saldo', 'enabled', 10, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 11. Cronograma – Ano 3 (digit → saldo)  [grupo Cronograma]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_cronoano3, @notaStamp, 'cronoano3', N'Ano 3', 'digit', 'saldo', 'enabled', 11, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 12. Cronograma – Ano 4 (digit → saldo)  [grupo Cronograma]
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_cronoano4, @notaStamp, 'cronoano4', N'Ano 4', 'digit', 'saldo', 'enabled', 12, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 13. Direcção (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_direccao, @notaStamp, 'direccao', N'Direcção', 'text', 'cvalor', 'enabled', 13, 160, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 14. Observações (textarea → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_observacoes, @notaStamp, 'observacoes', N'Observações', 'textarea', 'cvalor', 'enabled', 14, 250, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');


-- =============================================================================
-- 4. MrendGrupoColuna — 2 grupos
-- =============================================================================

-- Grupo A: Meta Anual (ordem=1)
INSERT INTO MrendGrupoColuna (grupocolunastamp, relatoriostamp, codigogrupo, descgrupo, fixa, ordem, extras)
VALUES (@grp_meta, @notaStamp, 'metaanual', N'Meta Anual', 0, 1, '');

-- Grupo B: Cronograma (ordem=2)
INSERT INTO MrendGrupoColuna (grupocolunastamp, relatoriostamp, codigogrupo, descgrupo, fixa, ordem, extras)
VALUES (@grp_crono, @notaStamp, 'cronograma', N'Cronograma', 0, 2, '');


-- =============================================================================
-- 5. MrendGrupoColunaItem — associação colunas ↔ grupos
-- =============================================================================

-- ─── Grupo Meta Anual ─────────────────────────────────────────────────────
INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_meta, @notaStamp, @col_metaano1, 1, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_meta, @notaStamp, @col_metaano2, 2, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_meta, @notaStamp, @col_metaano3, 3, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_meta, @notaStamp, @col_metaano4, 4, '');

-- ─── Grupo Cronograma ─────────────────────────────────────────────────────
INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_crono, @notaStamp, @col_cronoano1, 1, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_crono, @notaStamp, @col_cronoano2, 2, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_crono, @notaStamp, @col_cronoano3, 3, '');

INSERT INTO MrendGrupoColunaItem (grupocolunaitemstamp, grupocolunastamp, relatoriostamp, colunastamp, ordem, extras)
VALUES (LEFT(REPLACE(NEWID(),'-',''),25), @grp_crono, @notaStamp, @col_cronoano4, 4, '');


-- =============================================================================
-- 6. MrendCelula — sem overrides
-- =============================================================================


-- =============================================================================
-- 7. rendopt — actualizar em u_nota
-- =============================================================================
UPDATE u_nota
SET rendopt = N'{
    "enableEdit": "$(\"#mainPage\").data(\"state\") == \"editar\"",
    "resetSourceStamp": "$(\"#mainPage\").data(\"state\") != \"editar\"",
    "containerToRender": "#campos > .row:last",
    "datasourceName": "u_reportl",
    "tableSourceName": "u_reportl",
    "table": "u_reportl",
    "codigo": "Plano de Negócios",
    "remoteFetch": "true",
    "remoteFetchData": {
        "url": "../programs/gensel.aspx?cscript=getdatafromphcv2",
        "type": "POST",
        "data": {
            "__EVENTARGUMENT": "JSON.stringify([{ codigo: \"Plano de Negócios\", filtroval: getRecordStamp() }])"
        }
    },
    "dbTableToMrendObject": {
        "chunkMapping": false,
        "table": "u_reportl",
        "dbName": "MrendDB_PlanoNegocios",
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
        "u_reportlstamp",
        "naturezasubrowid",
        "naturezaordem",
        "saldo",
        "rubrica",
        "natureza",
        "descnatureza",
        "gruporowid",
        "grupolordem",
        "descrubrica",
        "u_reportcstamp",
        "cvalor",
        "tipocol",
        "nota"
    ],
    "recordData": {
        "stamp": "getRecordStamp()"
    },
    "afterRenderCallback": ""
}'
WHERE nota = N'Plano de Negócios';


-- =============================================================================
-- 8. VERIFICAÇÃO
-- =============================================================================
SELECT 'u_nota'              AS tabela, COUNT(*) AS total FROM u_nota              WHERE nota = N'Plano de Negócios'
UNION ALL
SELECT 'MrendLinha',          COUNT(*)                    FROM MrendLinha           WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendColuna',         COUNT(*)                    FROM MrendColuna          WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendGrupoColuna',    COUNT(*)                    FROM MrendGrupoColuna     WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendGrupoColunaItem',COUNT(*)                    FROM MrendGrupoColunaItem WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendCelula',         COUNT(*)                    FROM MrendCelula          WHERE relatoriostamp = @notaStamp;

-- Resultado esperado:
-- u_nota               → 1
-- MrendLinha           → 1   (Objectivos Estratégicos)
-- MrendColuna          → 14
-- MrendGrupoColuna     → 2   (Meta Anual | Cronograma)
-- MrendGrupoColunaItem → 8   (4 meta + 4 crono)
-- MrendCelula          → 0


-- =============================================================================
-- MAPA COLUNAS
-- =============================================================================
/*
#   codigocoluna        desccoluna                    tipo     campo   notas
───────────────────────────────────────────────────────────────────────────────
1   acoesestrategicas   Ações Estratégicas            text     cvalor  fixacoluna=1
2   actividade          Actividade                    text     cvalor
── GRUPO: Meta Anual ──────────────────────────────────────────────────────────
3   metaano1            Ano 1                         digit    saldo
4   metaano2            Ano 2                         digit    saldo
5   metaano3            Ano 3                         digit    saldo
6   metaano4            Ano 4                         digit    saldo
── SEM GRUPO ──────────────────────────────────────────────────────────────────
7   classorcam          Classificação Orçamentária    text     cvalor
8   fontesfinanc        Fontes de Financiamento       table    cvalor  dropdown: Fundos Próprios
                                                                       Financiamento Bancário | Outras
── GRUPO: Cronograma ──────────────────────────────────────────────────────────
9   cronoano1           Ano 1                         digit    saldo
10  cronoano2           Ano 2                         digit    saldo
11  cronoano3           Ano 3                         digit    saldo
12  cronoano4           Ano 4                         digit    saldo
── SEM GRUPO ──────────────────────────────────────────────────────────────────
13  direccao            Direcção                      text     cvalor
14  observacoes         Observações                   textarea cvalor
*/
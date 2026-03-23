-- =============================================================================
-- MRend — INSERT Scripts — Mapas de Investimento
-- =============================================================================
-- Relatório : Mapas de Investimento
-- Código     : Mapas de Investimento   (nota = descnota)
-- Cabeçalho  : u_nota  |  PK: u_notastamp
-- NÃO usa MRendRelatorio — registo criado directamente em u_nota
-- Estrutura  : chunkMapping = true (EAV em u_reportl)
--              1 Linha modelo | 17 Colunas (atributos por projecto)
-- =============================================================================
-- COLUNAS (da imagem BRD):
--   1.  Designação do Projecto
--   2.  Finalidade
--   3.  Localização (Província)
--   4.  Duração (anos)
--   5.  Data de Início de Desembolso (dia/mês/ano)
--   6.  Montante de Investimento
--   7.  Montante Desembolsado
--   8.  Desembolso Anual
--   9.  Fonte de Financiamento  [Estado / Capitais Próprios / Capitais de Terceiros / Várias]
--  10.  Origem do Financiamento [Interno / Externo / Misto]
--  11.  Financiador(es)
--  12.  Taxa de Juro
--  13.  Taxa de Actualização
--  14.  Valor Actual Líquido (VAL)
--  15.  Taxa Interna de Retorno (TIR)
--  16.  Período de Retorno (Payback)
--  17.  Observações
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STAMPS
-- ─────────────────────────────────────────────────────────────────────────────
DECLARE @notaStamp              VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @codigo                 NVARCHAR(250) = N'Mapas de Investimento';

-- Linha
DECLARE @linhaStamp             VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);

-- Colunas
DECLARE @col_designacao         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_finalidade         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_localizacao        VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_duracao            VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_datainicio         VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_montanteinvest     VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_montantedesemb     VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_desembolsoanual    VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_fontefinanc        VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_origemfinanc       VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_financiador        VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_taxajuro           VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_taxaactualizacao   VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_val                VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_tir                VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_payback            VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);
DECLARE @col_observacoes        VARCHAR(25) = LEFT(REPLACE(NEWID(),'-',''),25);


-- =============================================================================
-- 1. u_nota  —  registo de cabeçalho
--    nota = descnota = 'Mapas de Investimento'
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
-- 2. MrendLinha — 1 linha modelo
--    Utilizador adiciona um registo por projecto de investimento
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
    'Singular', 'u_reportl', N'Mapa de Investimento',
    1, 1, 0, 0, 100, N'Adicionar Projecto',
    0, '', 0, '', 0, '', '', 0, '', '',
    '', 0, '', 'table', '', '', '', 0, '', 0, '', 0, '',
    '', '', '', '', '', '', '',
    '', '', ''
);


-- =============================================================================
-- 3. MrendColuna — 17 colunas
-- =============================================================================

-- 1. Designação do Projecto (text → cvalor, fixacoluna=1 — âncora da linha)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_designacao, @notaStamp, 'designacao', N'Designação do Projecto', 'text', 'cvalor', 'enabled', 1, 220, 'left', 0, '', 1, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 2. Finalidade (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_finalidade, @notaStamp, 'finalidade', N'Finalidade', 'text', 'cvalor', 'enabled', 2, 180, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 3. Localização (Província) (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_localizacao, @notaStamp, 'localizacao', N'Localização (Província)', 'text', 'cvalor', 'enabled', 3, 160, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 4. Duração (anos) (digit → saldo, decimais=0)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_duracao, @notaStamp, 'duracao', N'Duração (anos)', 'digit', 'saldo', 'enabled', 4, 90, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 0, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 5. Data de Início de Desembolso (date → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_datainicio, @notaStamp, 'datainicio', N'Data de Início de Desembolso', 'date', 'cvalor', 'enabled', 5, 140, 'center', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 6. Montante de Investimento (digit → saldo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_montanteinvest, @notaStamp, 'montanteinvest', N'Montante de Investimento', 'digit', 'saldo', 'enabled', 6, 150, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 7. Montante Desembolsado (digit → saldo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_montantedesemb, @notaStamp, 'montantedesemb', N'Montante Desembolsado', 'digit', 'saldo', 'enabled', 7, 150, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 8. Desembolso Anual (digit → saldo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_desembolsoanual, @notaStamp, 'desembolsoanual', N'Desembolso Anual', 'digit', 'saldo', 'enabled', 8, 130, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 9. Fonte de Financiamento (table → cvalor, dropdown fixo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_fontefinanc, @notaStamp, 'fontefinanc', N'Fonte de Financiamento', 'table', 'cvalor', 'enabled', 9, 200, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, 'nome', 'valor', 1, '[{nome:''Estado'',valor:''Estado''},{nome:''Capitais Próprios'',valor:''Capitais Próprios''},{nome:''Capitais de Terceiros'',valor:''Capitais de Terceiros''},{nome:''Várias'',valor:''Várias''}]', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 10. Origem do Financiamento (table → cvalor, dropdown fixo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_origemfinanc, @notaStamp, 'origemfinanc', N'Origem do Financiamento', 'table', 'cvalor', 'enabled', 10, 170, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, 'nome', 'valor', 1, '[{nome:''Interno'',valor:''Interno''},{nome:''Externo'',valor:''Externo''},{nome:''Misto'',valor:''Misto''}]', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 11. Financiador(es) (text → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_financiador, @notaStamp, 'financiador', N'Financiador(es)', 'text', 'cvalor', 'enabled', 11, 160, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 12. Taxa de Juro (digit → saldo, decimais=4)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_taxajuro, @notaStamp, 'taxajuro', N'Taxa de Juro', 'digit', 'saldo', 'enabled', 12, 100, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 4, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 13. Taxa de Actualização (digit → saldo, decimais=4)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_taxaactualizacao, @notaStamp, 'taxaactualizacao', N'Taxa de Actualização', 'digit', 'saldo', 'enabled', 13, 130, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 4, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 14. Valor Actual Líquido (VAL) (digit → saldo)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_val, @notaStamp, 'val', N'Valor Actual Líquido (VAL)', 'digit', 'saldo', 'enabled', 14, 160, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 15. Taxa Interna de Retorno (TIR) (digit → saldo, decimais=4)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_tir, @notaStamp, 'tir', N'Taxa Interna de Retorno (TIR)', 'digit', 'saldo', 'enabled', 15, 170, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 4, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 16. Período de Retorno (Payback) (digit → saldo, decimais=1)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_payback, @notaStamp, 'payback', N'Período de Retorno (Payback)', 'digit', 'saldo', 'enabled', 16, 170, 'right', 0, '', 0, 0, 0, 0, 0, '', '', 0, 1, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');

-- 17. Observações (textarea → cvalor)
INSERT INTO MrendColuna (colunastamp, relatoriostamp, codigocoluna, desccoluna, tipo, campo, atributo, ordem, tamanho, alinhamento, colfunc, expresscolfun, fixacoluna, inactivo, forcaeditavel, temlinhadesc, validacoluna, campovalid, condicaovalidacao, proibenegativo, decimais, nometb, valtb, usaexpresstbjs, expressaotbjs, usaexpressaocoldesc, expresssaojscoldesc, eventoclique, expressaoclique, executaeventochange, expressaojsevento, condicattr, condicattrexpr, condictipo, condicetipoxpr, condicfunc, condicfuncexpr, modelo, descbtnModelo, addBtn, setinicio, setfim, botaohtml, categoria, regra, sourceKey, sourceBind, extras, fx_tipo, fx_activo, fx_expressao, fx_colrefs)
VALUES (@col_observacoes, @notaStamp, 'observacoes', N'Observações', 'textarea', 'cvalor', 'enabled', 17, 250, 'left', 0, '', 0, 0, 0, 0, 0, '', '', 0, 2, '', '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', 0, N'Adicionar coluna', 0, 0, 0, '', 'default', '', '', '', '', '', 0, '', '');


-- =============================================================================
-- 4. MrendCelula — sem overrides
-- =============================================================================


-- =============================================================================
-- 5. rendopt — actualizar em u_nota
-- =============================================================================
UPDATE u_nota
SET rendopt = N'{
    "enableEdit": "$(\"#mainPage\").data(\"state\") == \"editar\"",
    "resetSourceStamp": "$(\"#mainPage\").data(\"state\") != \"editar\"",
    "containerToRender": "#campos > .row:last",
    "datasourceName": "u_reportl",
    "tableSourceName": "u_reportl",
    "table": "u_reportl",
    "codigo": "Mapas de Investimento",
    "remoteFetch": "true",
    "remoteFetchData": {
        "url": "../programs/gensel.aspx?cscript=getdatafromphcv2",
        "type": "POST",
        "data": {
            "__EVENTARGUMENT": "JSON.stringify([{ codigo: \"Mapas de Investimento\", filtroval: getRecordStamp() }])"
        }
    },
    "dbTableToMrendObject": {
        "chunkMapping": false,
        "table": "u_reportl",
        "dbName": "MrendDB_MapasInvestimento",
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
WHERE nota = N'Mapas de Investimento';


-- =============================================================================
-- 6. VERIFICAÇÃO
-- =============================================================================
SELECT 'u_nota'        AS tabela, COUNT(*) AS total FROM u_nota      WHERE nota = N'Mapas de Investimento'
UNION ALL
SELECT 'MrendLinha',    COUNT(*)                    FROM MrendLinha  WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendColuna',   COUNT(*)                    FROM MrendColuna WHERE relatoriostamp = @notaStamp
UNION ALL
SELECT 'MrendCelula',   COUNT(*)                    FROM MrendCelula WHERE relatoriostamp = @notaStamp;

-- Resultado esperado:
-- u_nota        → 1
-- MrendLinha    → 1   (linha modelo — utilizador adiciona projectos)
-- MrendColuna   → 17  (um por atributo)
-- MrendCelula   → 0


-- =============================================================================
-- MAPA COLUNA × TIPO
-- =============================================================================
/*
#   codigocoluna      desccoluna                      tipo      campo   decimais  notas
──────────────────────────────────────────────────────────────────────────────────────
1   designacao        Designação do Projecto          text      cvalor  2         fixacoluna=1
2   finalidade        Finalidade                      text      cvalor  2
3   localizacao       Localização (Província)         text      cvalor  2
4   duracao           Duração (anos)                  digit     saldo   0         anos inteiros
5   datainicio        Data de Início de Desembolso    date      cvalor  2
6   montanteinvest    Montante de Investimento        digit     saldo   2
7   montantedesemb    Montante Desembolsado           digit     saldo   2
8   desembolsoanual   Desembolso Anual                digit     saldo   2
9   fontefinanc       Fonte de Financiamento          table     cvalor  2         dropdown fixo
10  origemfinanc      Origem do Financiamento         table     cvalor  2         dropdown fixo
11  financiador       Financiador(es)                 text      cvalor  2
12  taxajuro          Taxa de Juro                    digit     saldo   4
13  taxaactualizacao  Taxa de Actualização            digit     saldo   4
14  val               Valor Actual Líquido (VAL)      digit     saldo   2
15  tir               Taxa Interna de Retorno (TIR)   digit     saldo   4
16  payback           Período de Retorno (Payback)    digit     saldo   1
17  observacoes       Observações                     textarea  cvalor  2
*/
-- =============================================================================
-- MREPORT 2.0 - Schema SQL (versão refatorada inspirada no Mdash 2.0)
--
-- Convenções:
--   - PK em VARCHAR(25) (PHC stamp)
--   - Auditoria padrão: ousrinis/ousrdata/ousrhora + usrinis/usrdata/usrhora
--   - inactivo BIT em vez de DELETE físico (soft delete)
--   - configjson TEXT para extensões sem alterar schema
--   - ordem INT para sequência estável
--
-- Estrutura lógica:
--   u_mreport (1) ─┬─ (N) MReportTab
--                  ├─ (N) MReportSection ── (0/1) MReportLayout
--                  ├─ (N) MReportFilter
--                  ├─ (N) MReportFonte ── cache_control / <ft>_cache (Mdash)
--                  └─ (N) MReportObject ─┬─ (N) MReportObjectDetail
--                                        ├─ (N) MReportValorDinamico
--                                        └─ (0/1) MReportFonte (fontestamp)
-- =============================================================================

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================================================
-- 1. u_mreport - Cabeçalho do relatório
-- =============================================================================
IF OBJECT_ID('dbo.u_mreport', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[u_mreport](
        [u_mreportstamp]            [char](25)     NOT NULL,
        [codigo]                    [varchar](250) NOT NULL DEFAULT (''),
        [descricao]                 [varchar](250) NOT NULL DEFAULT (''),
        [categoria]                 [varchar](250) NOT NULL DEFAULT (''),
        [temfiltro]                 [bit]          NOT NULL DEFAULT ((0)),
        [filtrohorizontal]          [bit]          NOT NULL DEFAULT ((0)),
        [activarmultiseparadores]   [bit]          NOT NULL DEFAULT ((0)),
        [mreportlayoutstamp]        [varchar](25)  NOT NULL DEFAULT (''),
        [orientacao]                [varchar](20)  NOT NULL DEFAULT ('portrait'),
        [pagesize]                  [varchar](20)  NOT NULL DEFAULT ('A4'),
        [margemtop]                 [numeric](8,2) NOT NULL DEFAULT ((20)),
        [margembottom]              [numeric](8,2) NOT NULL DEFAULT ((20)),
        [margemleft]                [numeric](8,2) NOT NULL DEFAULT ((15)),
        [margemright]               [numeric](8,2) NOT NULL DEFAULT ((15)),
        [configjson]                [text]         NOT NULL DEFAULT ('{}'),
        [marcada]                   [bit]          NOT NULL DEFAULT ((0)),
        [inactivo]                  [bit]          NOT NULL DEFAULT ((0)),
        [ousrinis]                  [varchar](30)  NOT NULL DEFAULT (''),
        [ousrdata]                  [datetime]     NOT NULL DEFAULT (getdate()),
        [ousrhora]                  [varchar](8)   NOT NULL DEFAULT (''),
        [usrinis]                   [varchar](30)  NOT NULL DEFAULT (''),
        [usrdata]                   [datetime]     NOT NULL DEFAULT (getdate()),
        [usrhora]                   [varchar](8)   NOT NULL DEFAULT (''),
        CONSTRAINT [pk_u_mreport] PRIMARY KEY NONCLUSTERED ([u_mreportstamp] ASC)
    )
END
GO


-- =============================================================================
-- 2. MReportTab - Separadores opcionais de um relatório
--    activarmultiseparadores=0 → modo legacy (sem tabs)
-- =============================================================================
IF OBJECT_ID('dbo.MReportTab', 'U') IS NULL
BEGIN
    CREATE TABLE MReportTab (
        mreporttabstamp     VARCHAR(25)  NOT NULL CONSTRAINT pk_MReportTab PRIMARY KEY,
        mreportstamp        VARCHAR(25)  NOT NULL DEFAULT '',  -- FK → u_mreport
        titulo              VARCHAR(250) NOT NULL DEFAULT '',
        icone               VARCHAR(100) NOT NULL DEFAULT '',
        configjson          TEXT         NOT NULL DEFAULT '{}',
        ordem               INT          NOT NULL DEFAULT 0,
        inactivo            BIT          NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 3. MReportLayout - Templates reutilizáveis (HBF) com slots
--    Não pertence a nenhum relatório (biblioteca pública)
--    Equivalente ao MdashContainerItemLayout
-- =============================================================================
IF OBJECT_ID('dbo.MReportLayout', 'U') IS NULL
BEGIN
    CREATE TABLE MReportLayout (
        mreportlayoutstamp  VARCHAR(25)  NOT NULL PRIMARY KEY,
        codigo              VARCHAR(250) NOT NULL DEFAULT '',
        descricao           VARCHAR(250) NOT NULL DEFAULT '',
        layoutsystem        VARCHAR(50)  NOT NULL DEFAULT 'HCF',   -- Header/Content/Footer (extensível)
        htmltemplate        TEXT         NOT NULL DEFAULT '',      -- HTML com data-mreport-slot="..."
        csstemplate         TEXT         NOT NULL DEFAULT '',
        jstemplate          TEXT         NOT NULL DEFAULT '',
        slotsdefinition     TEXT         NOT NULL DEFAULT '[]',    -- [{id,label,type,isMainContent,defaultContent}]
        jscdns              TEXT         NOT NULL DEFAULT '[]',
        csscdns             TEXT         NOT NULL DEFAULT '[]',
        thumbnail           TEXT         NOT NULL DEFAULT '',      -- base64 ou URL
        ispublic            BIT          NOT NULL DEFAULT 1,
        versao              INT          NOT NULL DEFAULT 1,
        categoria           VARCHAR(250) NOT NULL DEFAULT '',
        ordem               INT          NOT NULL DEFAULT 0,
        inactivo            BIT          NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 4. MReportSection - Secções configuráveis (substitui o triplo header/content/footer fixo)
--    Codigo padrão: 'header' | 'content' | 'footer' | qualquer custom
-- =============================================================================
IF OBJECT_ID('dbo.MReportSection', 'U') IS NULL
BEGIN
    CREATE TABLE MReportSection (
        mreportsectionstamp VARCHAR(25)   NOT NULL PRIMARY KEY,
        mreportstamp        VARCHAR(25)   NOT NULL DEFAULT '',  -- FK → u_mreport
        mreporttabstamp     VARCHAR(25)   NOT NULL DEFAULT '',  -- FK → MReportTab (opcional)
        codigo              VARCHAR(50)   NOT NULL DEFAULT '',  -- header | content | footer | custom
        descricao           VARCHAR(250)  NOT NULL DEFAULT '',
        tipo                VARCHAR(50)   NOT NULL DEFAULT 'content',  -- header | content | footer | group
        height              NUMERIC(16,2) NOT NULL DEFAULT 0,
        width               NUMERIC(16,2) NOT NULL DEFAULT 0,
        repeatonpages       BIT           NOT NULL DEFAULT 0,   -- repete em todas as páginas
        layoutmode          VARCHAR(20)   NOT NULL DEFAULT 'absolute',  -- absolute | grid | flex
        mreportlayoutstamp  VARCHAR(25)   NOT NULL DEFAULT '',  -- FK → MReportLayout (opcional)
        slotsconfigjson     TEXT          NOT NULL DEFAULT '[]',
        configjson          TEXT          NOT NULL DEFAULT '{}',
        ordem               INT           NOT NULL DEFAULT 0,
        inactivo            BIT           NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 5. MReportFilter - Filtros (semelhante ao MdashFilter)
-- =============================================================================
IF OBJECT_ID('dbo.MReportFilter', 'U') IS NULL
BEGIN
    CREATE TABLE MReportFilter (
        mreportfilterstamp      VARCHAR(25)  NOT NULL PRIMARY KEY,
        mreportstamp            VARCHAR(25)  NOT NULL DEFAULT '',
        mreporttabstamp         VARCHAR(25)  NOT NULL DEFAULT '',
        codigo                  VARCHAR(250) NOT NULL DEFAULT '',
        descricao               VARCHAR(250) NOT NULL DEFAULT '',
        tipo                    VARCHAR(100) NOT NULL DEFAULT '',  -- text | date | combo | multiselect | number
        campooption             VARCHAR(250) NOT NULL DEFAULT '',
        eventochange            BIT          NOT NULL DEFAULT 0,
        expressaochange         TEXT         NOT NULL DEFAULT '',
        campovalor              VARCHAR(250) NOT NULL DEFAULT '',
        tamanho                 INT          NOT NULL DEFAULT 0,
        expressaolistagem       TEXT         NOT NULL DEFAULT '',
        expressaojslistagem     TEXT         NOT NULL DEFAULT '',
        valordefeito            TEXT         NOT NULL DEFAULT '',
        escopo                  VARCHAR(20)  NOT NULL DEFAULT 'global',  -- global | tab | section
        ordem                   INT          NOT NULL DEFAULT 0,
        inactivo                BIT          NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 6. MReportFonte - Fontes de dados (com suporte a cache)
-- =============================================================================
IF OBJECT_ID('dbo.MReportFonte', 'U') IS NULL
BEGIN
    CREATE TABLE MReportFonte (
        mreportfonstestamp      VARCHAR(25)  NOT NULL PRIMARY KEY,
        mreportstamp            VARCHAR(25)  NOT NULL DEFAULT '',
        codigo                  VARCHAR(250) NOT NULL DEFAULT '',
        descricao               VARCHAR(250) NOT NULL DEFAULT '',
        tipo                    VARCHAR(100) NOT NULL DEFAULT 'sql',  -- sql | api | static | composed
        expressaolistagem       TEXT         NOT NULL DEFAULT '',
        expressaojslistagem     TEXT         NOT NULL DEFAULT '',
        schemajson              TEXT         NOT NULL DEFAULT '[]',
        lastResultscached       TEXT         NOT NULL DEFAULT '',
        usacache                BIT          NOT NULL DEFAULT 0,    -- liga à Cache Architecture
        cacheversion            BIGINT       NOT NULL DEFAULT 0,
        retencaodias            INT          NOT NULL DEFAULT 30,
        ordem                   INT          NOT NULL DEFAULT 0,
        inactivo                BIT          NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 7. MReportObject - Objectos no canvas (texto, tabela, chart, imagem, ...)
-- =============================================================================
IF OBJECT_ID('dbo.MReportObject', 'U') IS NULL
BEGIN
    CREATE TABLE MReportObject (
        mreportobjectstamp      VARCHAR(25)   NOT NULL PRIMARY KEY,
        mreportstamp            VARCHAR(25)   NOT NULL DEFAULT '',
        mreportsectionstamp     VARCHAR(25)   NOT NULL DEFAULT '',  -- FK → MReportSection
        section                 VARCHAR(200)  NOT NULL DEFAULT '',  -- legacy: header|content|footer (mantido para retrocompat.)
        slotid                  VARCHAR(100)  NOT NULL DEFAULT '',  -- id do slot dentro do layout
        fontestamp              VARCHAR(25)   NOT NULL DEFAULT '',  -- FK → MReportFonte (opcional)
        codigo                  VARCHAR(25)   NOT NULL DEFAULT '',
        descricao               VARCHAR(250)  NOT NULL DEFAULT '',
        tipo                    VARCHAR(100)  NOT NULL DEFAULT '',  -- texto | tabela | chart | imagem | kpi | ...
        categoria               VARCHAR(100)  NOT NULL DEFAULT '',
        tamanho                 INT           NOT NULL DEFAULT 0,
        ordem                   INT           NOT NULL DEFAULT 0,
        -- Posicionamento absoluto (legacy + fallback)
        x                       NUMERIC(16,2) NOT NULL DEFAULT 0,
        y                       NUMERIC(16,2) NOT NULL DEFAULT 0,
        width                   NUMERIC(16,2) NOT NULL DEFAULT 0,
        height                  NUMERIC(16,2) NOT NULL DEFAULT 0,
        -- Posicionamento por grid (preferido em layoutmode=grid)
        layoutmode              VARCHAR(20)   NOT NULL DEFAULT 'inherit',  -- inherit | absolute | grid
        gridrow                 INT           NULL,
        gridcolstart            INT           NULL,
        gridcolspan             INT           NOT NULL DEFAULT 4,
        gridrowspan             INT           NOT NULL DEFAULT 1,
        -- Configuração / queries
        expressaoobjecto        TEXT          NOT NULL DEFAULT '',
        configjson              TEXT          NOT NULL DEFAULT '{}',
        queryconfigjson         TEXT          NOT NULL DEFAULT '{}',
        objectQuery             TEXT          NOT NULL DEFAULT '',
        objectexpressaodblistagem TEXT        NOT NULL DEFAULT '',
        tipoquery               VARCHAR(100)  NOT NULL DEFAULT 'item',
        -- Detalhes / drill-down
        temdetalhes             BIT           NOT NULL DEFAULT 0,
        detalhesqueryconfigjson TEXT          NOT NULL DEFAULT '{}',
        tipoobjectodetalhes     VARCHAR(100)  NOT NULL DEFAULT '',
        titulodetalhes          VARCHAR(250)  NOT NULL DEFAULT '',
        titulobtndetalhes       VARCHAR(250)  NOT NULL DEFAULT '',
        processaFonte           BIT           NOT NULL DEFAULT 1,
        inactivo                BIT           NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 8. MReportObjectDetail - Drill-down / linhas detalhe
-- =============================================================================
IF OBJECT_ID('dbo.MReportObjectDetail', 'U') IS NULL
BEGIN
    CREATE TABLE MReportObjectDetail (
        mreportobjectdetailstamp VARCHAR(25)   NOT NULL PRIMARY KEY,
        mreportobjectstamp       VARCHAR(25)   NOT NULL DEFAULT '',
        mreportstamp             VARCHAR(25)   NOT NULL DEFAULT '',
        tipo                     VARCHAR(100)  NOT NULL DEFAULT '',
        tamanho                  INT           NOT NULL DEFAULT 0,
        ordem                    INT           NOT NULL DEFAULT 0,
        expressaoobjecto         TEXT          NOT NULL DEFAULT '',
        queryconfigjson          TEXT          NOT NULL DEFAULT '{}',
        temdetalhes              BIT           NOT NULL DEFAULT 0,
        titulodetalhes           VARCHAR(250)  NOT NULL DEFAULT '',
        titulobtndetalhes        VARCHAR(250)  NOT NULL DEFAULT '',
        inactivo                 BIT           NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- 9. MReportValorDinamico - Tokens dinâmicos por objecto/célula
--    (promove o array configjson.dadosValoresDinamicos do legacy)
--    tipo: Standard (texto literal) | Celula (referência a outra célula/objecto)
--          | Variavel (variável pública: anoval, dataInicio, ...) | Filtro
-- =============================================================================
IF OBJECT_ID('dbo.MReportValorDinamico', 'U') IS NULL
BEGIN
    CREATE TABLE MReportValorDinamico (
        mreportvalordinamicostamp VARCHAR(25)  NOT NULL PRIMARY KEY,
        mreportobjectstamp        VARCHAR(25)  NOT NULL DEFAULT '',
        mreportstamp              VARCHAR(25)  NOT NULL DEFAULT '',
        descricao                 VARCHAR(250) NOT NULL DEFAULT '',
        valor                     TEXT         NOT NULL DEFAULT '',
        tipo                      VARCHAR(50)  NOT NULL DEFAULT 'Standard',
        refstamp                  VARCHAR(25)  NOT NULL DEFAULT '',  -- aponta para outra célula/objecto/filtro
        ordem                     INT          NOT NULL DEFAULT 0,
        inactivo                  BIT          NOT NULL DEFAULT 0
    )
END
GO


-- =============================================================================
-- ÍNDICES SUGERIDOS
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportSection_mreportstamp')
    CREATE INDEX ix_MReportSection_mreportstamp ON MReportSection (mreportstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportFilter_mreportstamp')
    CREATE INDEX ix_MReportFilter_mreportstamp ON MReportFilter (mreportstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportFonte_mreportstamp')
    CREATE INDEX ix_MReportFonte_mreportstamp ON MReportFonte (mreportstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportObject_mreportstamp')
    CREATE INDEX ix_MReportObject_mreportstamp ON MReportObject (mreportstamp, mreportsectionstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportTab_mreportstamp')
    CREATE INDEX ix_MReportTab_mreportstamp ON MReportTab (mreportstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportObjectDetail_object')
    CREATE INDEX ix_MReportObjectDetail_object ON MReportObjectDetail (mreportobjectstamp, ordem)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_MReportValorDinamico_object')
    CREATE INDEX ix_MReportValorDinamico_object ON MReportValorDinamico (mreportobjectstamp, ordem)
GO


-- =============================================================================
-- NOTAS
-- 1. As tabelas de cache (cache_control, <ft>_cache, <ft>_cache_delta) são
--    REUTILIZADAS do Mdash 2.0. Ver:
--      bibliotecas/Mdash 2.0/SQL/QUERY_CREATE_CACHE_CONTROL.sql
--      bibliotecas/Mdash 2.0/SQL/QUERY FT_CACHE(TABLE CACHE).sql
--      bibliotecas/Mdash 2.0/SQL/QUERY_CREATE_FT_CACHE_DELTA.sql
--      bibliotecas/Mdash 2.0/SQL/STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql
--      bibliotecas/Mdash 2.0/SQL/JOB PARA SINCRONIZAR MUDANÇAS.sql
--
-- 2. Migração a partir do Mreport 1.x:
--    Ver Mreport 2.0/SQL/migrations/001_migrate_from_v1.sql
-- =============================================================================


 
/****** Object:  Table [dbo].[u_mdash]    Script Date: 9/29/2025 2:36:02 PM ******/
SET ANSI_NULLS OFF
GO
 
SET QUOTED_IDENTIFIER ON
GO
 
CREATE TABLE [dbo].[u_mdash](
	[u_mdashstamp] [char](25) NOT NULL,
	[temfiltro] [bit] NOT NULL,
	[codigo] [varchar](250) NOT NULL,
	[descricao] [varchar](250) NOT NULL,
    [filtrohorizont] [bit] NOT  NULL,
	[categoria] [varchar](250) NOT NULL,
	[ousrinis] [varchar](30) NOT NULL,
	[ousrdata] [datetime] NOT NULL,
	[ousrhora] [varchar](8) NOT NULL,
	[usrinis] [varchar](30) NOT NULL,
	[usrdata] [datetime] NOT NULL,
	[usrhora] [varchar](8) NOT NULL,
	[marcada] [bit] NOT NULL,
CONSTRAINT [pk_u_mdash] PRIMARY KEY NONCLUSTERED 
(
	[u_mdashstamp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [u_mdashstamp]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [temfiltro]
GO
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [filtrohorizont]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [codigo]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [descricao]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [categoria]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [ousrinis]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT (getdate()) FOR [ousrdata]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [ousrhora]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [usrinis]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT (getdate()) FOR [usrdata]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [usrhora]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [marcada]
GO

Create table MdashContainer(

    mdashcontainerstamp VARCHAR(25) PRIMARY KEY,
    inactivo BIT DEFAULT 0,
    codigo VARCHAR(250) DEFAULT '',
    titulo VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    layoutmode VARCHAR(20) DEFAULT 'auto',
    ordem INT DEFAULT 0,
    dashboardstamp VARCHAR(25) DEFAULT ''
)

CREATE TABLE MdashContainerItem(
    mdashcontaineritemstamp VARCHAR(25) PRIMARY KEY,
    mdashcontainerstamp VARCHAR(25) DEFAULT '',
    inactivo BIT DEFAULT 0,
    codigo VARCHAR(250) DEFAULT '',
    titulo VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    urlfetch TEXT DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    layoutcontaineritemdefault BIT DEFAULT 0,
    expressaolayoutcontaineritem TEXT DEFAULT '',
    dashboardstamp VARCHAR(25) DEFAULT '',
    fontelocal BIT DEFAULT 0,
    expressaodblistagem TEXT DEFAULT '',
    templatelayout TEXT DEFAULT '',
    layoutmode VARCHAR(20) DEFAULT 'inherit',
    gridrow INT NULL,
    gridcolstart INT NULL,
    gridcolspan INT DEFAULT 4,
    gridrowspan INT DEFAULT 1,
    expressaoapresentacaodados TEXT DEFAULT '',
    slotsconfigjson TEXT DEFAULT '[]',
);


CREATE TABLE MdashFilter(

    mdashfilterstamp VARCHAR(25) PRIMARY KEY,
    dashboardstamp VARCHAR(25) DEFAULT '',
    inactivo BIT DEFAULT 0,
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    campooption VARCHAR(250) DEFAULT '',
    eventochange BIT DEFAULT 0,
    expressaochange TEXT DEFAULT '',
    campovalor VARCHAR(250) DEFAULT '',
    tamanho INT DEFAULT 0,
    expressaolistagem TEXT DEFAULT '',
    expressaojslistagem TEXT DEFAULT '',
    valordefeito TEXT DEFAULT '',
    ordem INT DEFAULT 0
);

-- ============================================================================
-- MDashFonte v2 - Fontes de dados generalizadas com scope hierárquico
-- scope: 'global' | 'container' | 'containeritem' | 'object'
-- tipo:  'directquery' | 'javascript' | 'api' | 'stored'
-- ============================================================================
CREATE TABLE MDashFonte(

    -- Identidade
    mdashfontestamp       VARCHAR(25) PRIMARY KEY,
    dashboardstamp        VARCHAR(25) DEFAULT '',
    codigo                VARCHAR(250) DEFAULT '',
    descricao             VARCHAR(250) DEFAULT '',
    ordem                 INT DEFAULT 0,
    inactivo              BIT DEFAULT 0,

    -- Scope: a quem pertence esta fonte
    scope                 VARCHAR(20) DEFAULT 'global',      -- 'global' | 'container' | 'containeritem' | 'object'
    scopestamp            VARCHAR(25) DEFAULT '',             -- stamp do owner (vazio = global)

    -- Tipo de fonte
    tipo                  VARCHAR(20) DEFAULT 'directquery', -- 'directquery' | 'javascript' | 'api' | 'stored'

    -- DirectQuery
    expressaolistagem     TEXT DEFAULT '',                    -- SQL/CScript expression
    urlfetch              TEXT DEFAULT '',                    -- endpoint (default PHC gensel)

    -- JavaScript
    expressaojslistagem   TEXT DEFAULT '',                    -- função JS que retorna dados

    -- API (preparado para futuro)
    apiurl                TEXT DEFAULT '',
    apimethod             VARCHAR(10) DEFAULT 'GET',         -- GET | POST | PUT
    apiheadersjson        TEXT DEFAULT '{}',
    apibodyjson           TEXT DEFAULT '{}',

    -- Schema
    schemamode            VARCHAR(10) DEFAULT 'auto',        -- 'auto' | 'manual'
    schemajson            TEXT DEFAULT '[]',                  -- [{field, type, label}]

    -- Parâmetros dinâmicos
    parametrosjson        TEXT DEFAULT '[]',                  -- [{token, source, sourcestamp, defaultValue}]

    -- Refresh
    refreshmode           VARCHAR(20) DEFAULT 'onload',      -- 'onload' | 'onfilterchange' | 'manual' | 'interval'
    refreshintervalsec    INT DEFAULT 0,

    -- Cache/Resultados
    lastResultscached     TEXT DEFAULT '[]',
    lastexecuted          DATETIME NULL
);





CREATE TABLE MdashContainerItemObject(

    mdashcontaineritemobjectstamp VARCHAR(25) PRIMARY KEY,
    mdashcontaineritemstamp VARCHAR(25) DEFAULT '',
    inactivo BIT DEFAULT 0,
    dashboardstamp VARCHAR(25) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    categoria VARCHAR(100) DEFAULT '',
    expressaoobjecto TEXT DEFAULT '',
    configjson TEXT DEFAULT '',
    queryconfigjson TEXT DEFAULT '',
    temdetalhes BIT DEFAULT 0,
    detalhesqueryconfigjson TEXT DEFAULT '',
    tipoquery VARCHAR(100) DEFAULT 'item',
    objectexpressaodblistagem TEXT DEFAULT '',
    tipoobjectodetalhes VARCHAR(100) DEFAULT '',
    titulodetalhes VARCHAR(250) DEFAULT '',
    titulobtndetalhes VARCHAR(250) DEFAULT '',
    fontestamp VARCHAR(25) DEFAULT '',               -- vínculo directo à fonte de dados
    slotid VARCHAR(100) DEFAULT ''                   -- slot onde o objecto está colocado
);

CREATE TABLE MdashContainerItemObjectDetail(

    mdashcontaineritemobjectdetailstamp VARCHAR(25) PRIMARY KEY,
    mdashcontaineritemobjectstamp VARCHAR(25) DEFAULT '',
    dashboardstamp VARCHAR(25) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    expressaoobjecto TEXT DEFAULT '',
    queryconfigjson TEXT DEFAULT '',
    temdetalhes BIT DEFAULT 0,
    titulodetalhes VARCHAR(250) DEFAULT '',
    titulobtndetalhes VARCHAR(250) DEFAULT ''
)


-- ============================================================================
-- MdashContainerItemLayout - Layouts reutilizáveis para cards de dashboard
-- Não está ligado a nenhum dashboard (sem dashboardstamp)
-- ============================================================================
CREATE TABLE MdashContainerItemLayout(

    mdashcontaineritemlayoutstamp VARCHAR(25) PRIMARY KEY,
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    layoutsystem VARCHAR(50) DEFAULT 'HBF',         -- Sistema de layout: HBF (Header/Body/Footer), extensível
    htmltemplate TEXT DEFAULT '',                      -- Template HTML com data-mdash-slot para zonas editáveis
    csstemplate TEXT DEFAULT '',                       -- CSS do template
    jstemplate TEXT DEFAULT '',                        -- JavaScript do template
    slotsdefinition TEXT DEFAULT '[]',                 -- JSON: definição dos slots editáveis [{id, label, type, defaultContent}]
    iconcdn TEXT DEFAULT '',                           -- URL do ícone/thumbnail CDN
    jscdns TEXT DEFAULT '[]',                          -- JSON: array de CDNs JS necessários
    csscdns TEXT DEFAULT '[]',                         -- JSON: array de CDNs CSS necessários
    thumbnail TEXT DEFAULT '',                         -- Base64 ou URL da pré-visualização
    ispublic BIT DEFAULT 1,                           -- Visível para todos os dashboards
    versao INT DEFAULT 1,                             -- Controlo de versão
    categoria VARCHAR(250) DEFAULT '',                -- Categoria para organização (ex: "Snapshot", "Card", "Chart")
    ordem INT DEFAULT 0,
    inactivo BIT DEFAULT 0
)


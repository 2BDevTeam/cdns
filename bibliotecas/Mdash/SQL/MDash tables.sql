
 
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
    expressaoapresentacaodados TEXT DEFAULT '',
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

CREATE TABLE MDashFonte(
    
    mdashfontestamp VARCHAR(25) PRIMARY KEY,
    dashboardstamp VARCHAR(25) DEFAULT '',
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    expressaolistagem TEXT  DEFAULT '',
    expressaojslistagem TEXT DEFAULT '',
    schemajson TEXT DEFAULT '',
    lastResultscached TEXT DEFAULT '',
    ordem INT DEFAULT 0

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
    titulobtndetalhes VARCHAR(250) DEFAULT ''
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



/****** Object:  Table [dbo].[u_mreport]    Script Date: 9/29/2025 2:36:02 PM ******/
SET ANSI_NULLS OFF
GO
 
SET QUOTED_IDENTIFIER ON
GO
 
CREATE TABLE [dbo].[u_mreport](
	[u_mreportstamp] [char](25) NOT NULL,
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
CONSTRAINT [pk_u_mreport] PRIMARY KEY NONCLUSTERED 
(
	[u_mreportstamp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [u_mreportstamp]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ((0)) FOR [temfiltro]
GO
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ((0)) FOR [filtrohorizontal]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [codigo]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [descricao]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [categoria]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [ousrinis]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT (getdate()) FOR [ousrdata]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [ousrhora]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [usrinis]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT (getdate()) FOR [usrdata]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ('') FOR [usrhora]
GO
 
ALTER TABLE [dbo].[u_mreport] ADD  DEFAULT ((0)) FOR [marcada]
GO


CREATE TABLE MReportFilter(

    mreportfilterstamp VARCHAR(25) PRIMARY KEY,
    mreportstamp VARCHAR(25) DEFAULT '',
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

CREATE TABLE MReportFonte(
    
    mreportfonstestamp VARCHAR(25) PRIMARY KEY,
    mreportstamp VARCHAR(25) DEFAULT '',
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    expressaolistagem VARCHAR(250) DEFAULT '',
    expressaojslistagem TEXT DEFAULT '',
    schemajson TEXT DEFAULT '',
    lastResultscached TEXT DEFAULT '',
    ordem INT DEFAULT 0
);



CREATE TABLE MReportObject(

    mreportobjectstamp VARCHAR(25) PRIMARY KEY,
    mreportstamp VARCHAR(25) DEFAULT '',
    codigo VARCHAR(25) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    categoria VARCHAR(100) DEFAULT '',
    expressaoobjecto TEXT DEFAULT '',
    configjson TEXT DEFAULT '',
    queryconfigjson TEXT DEFAULT '',
    section VARCHAR(200) DEFAULT '',
    x Numeric(16,2) DEFAULT 0,
    y Numeric(16,2) DEFAULT 0,
    width Numeric(16,2) DEFAULT 0,
    height Numeric(16,2) DEFAULT 0
);
Create table MdashContainer(

    mdashcontainerstamp VARCHAR(25) PRIMARY KEY,
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
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    campooption VARCHAR(250) DEFAULT '',
    campovalor VARCHAR(250) DEFAULT '',
    tamanho INT DEFAULT 0,
    expressaolistagem TEXT DEFAULT '',
    valordefeito TEXT DEFAULT '',
    ordem INT DEFAULT 0
);

CREATE TABLE MdashContainerItemObject(

    mdashcontaineritemobjectstamp VARCHAR(25) PRIMARY KEY,
    mdashcontaineritemstamp VARCHAR(25) DEFAULT '',
    dashboardstamp VARCHAR(25) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    expressaoobjecto TEXT DEFAULT '',
    queryconfigjson TEXT DEFAULT ''
)


select *from  MdashContainerItemObject


alter table MdashContainerItemObject add queryconfigjson TEXT DEFAULT '';
SELECT * FROM MdashContainerItemObject 


SELECT *FROM MdashContainerItem where mdashcontaineritemstamp='601ed786-226a-4640-aeb6-f' order by ordem asc
Create table MdashContainer(

    mdashcontainerstamp VARCHAR(25) PRIMARY KEY,
    codigo VARCHAR(250) DEFAULT '',
    titulo VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    dashboardstamp VARCHAR(25) DEFAULT '',
)

CREATE TABLE MdashContainerItem(
    mdashcontaineritemstamp VARCHAR(25) PRIMARY KEY,
    mdashcontainerstamp VARCHAR(25) DEFAULT '',
    titulo VARCHAR(250) DEFAULT '',
    tipo VARCHAR(100) DEFAULT '',
    tamanho INT DEFAULT 0,
    ordem INT DEFAULT 0,
    dashboardstamp VARCHAR(25) DEFAULT '',
    conteudo TEXT DEFAULT ''
);

select * from MdashContainer;
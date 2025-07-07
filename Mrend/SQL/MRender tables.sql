CREATE TABLE MRendRelatorio
(
    totalrelatorio INTEGER DEFAULT 0,
    totalcoluna INTEGER DEFAULT 0,
    dectotrelatorio VARCHAR(250) DEFAULT '',
    dectotcoluna VARCHAR(250) DEFAULT '',
    defdesccoluna VARCHAR(250) DEFAULT '',
    adicionalinha BIT DEFAULT 0,
    linhamodelo VARCHAR(250) DEFAULT '',
    codigo VARCHAR(250) DEFAULT '',
    nome VARCHAR(250) DEFAULT '',
    categoria VARCHAR(250) DEFAULT '',
    MRendRelatorioSTAMP VARCHAR(25) PRIMARY KEY
);

CREATE TABLE MrendLinha
(
    linhastamp VARCHAR(25) PRIMARY KEY,
    relatoriostamp VARCHAR(25) DEFAULT '',
    linkstamp VARCHAR(250) DEFAULT '',
    parentstamp VARCHAR(250) DEFAULT '',
    temcolunas BIT DEFAULT 0,
    modelo BIT DEFAULT 0,

    descbtnModelo VARCHAR(250) DEFAULT '',
    tipo VARCHAR(250) DEFAULT '',
    codigo VARCHAR(250) DEFAULT '',
    descricao VARCHAR(250) DEFAULT '',
    origem VARCHAR(250) DEFAULT '',
    expressao TEXT DEFAULT '',
    campovalid VARCHAR(250) DEFAULT '',
    sinalnegativo BIT DEFAULT 0,
    addfilho BIT DEFAULT 0,
    temtotais BIT DEFAULT 0,
    totkey VARCHAR(250) DEFAULT '',
    totfield VARCHAR(250) DEFAULT '',
    condicaovalidacao VARCHAR(250) DEFAULT '',
    categoria VARCHAR(250) DEFAULT '',
    codcategoria VARCHAR(250) DEFAULT '',
    ordem INT DEFAULT 0,
    usafnpren BIT DEFAULT 0,
    fnpren VARCHAR(250) DEFAULT '',
    tipolistagem VARCHAR(50) DEFAULT 'table',
    objectolist VARCHAR(250) DEFAULT '',
    executachange BIT DEFAULT 0,
    expressaochangejs TEXT DEFAULT '',
    cor VARCHAR(50) DEFAULT '',
    estilopersonalizado BIT DEFAULT 0,
    expressaoestilopersonalizado TEXT DEFAULT '',
    explist TEXT DEFAULT '',
    defselect VARCHAR(250) DEFAULT '',
    campooption VARCHAR(250) DEFAULT '',
    campovalor VARCHAR(250) DEFAULT '',
    executachangesubgrupo BIT DEFAULT 0,
    expressaochangejssubgrupo TEXT DEFAULT '',
    sourceKey VARCHAR(250) DEFAULT '',
    sourceBind VARCHAR(250) DEFAULT '',
    extras TEXT DEFAULT ''
);


CREATE TABLE MrendColuna
(
    colunastamp VARCHAR(25) PRIMARY KEY,
    relatoriostamp VARCHAR(25) DEFAULT '',
    codigocoluna VARCHAR(100) DEFAULT '',
    desccoluna VARCHAR(250) DEFAULT '',
    sourceTable VARCHAR(250) DEFAULT '',
    campo VARCHAR(100) DEFAULT '',
    tipo VARCHAR(50) DEFAULT '',
    atributo VARCHAR(100) DEFAULT '',
    campovalid VARCHAR(100) DEFAULT '',
    condicaovalidacao VARCHAR(250) DEFAULT '',
    validacoluna BIT DEFAULT 0,
    expresscolfun TEXT DEFAULT '',
    expressaodb TEXT DEFAULT '',
    colfunc BIT DEFAULT 0,
    eventoclique BIT DEFAULT 0,
    expressaoclique TEXT DEFAULT '',
    ordem INT DEFAULT 0,
    setinicio BIT DEFAULT 0,
    setfim BIT DEFAULT 0,
    condictipo BIT DEFAULT 0,
    condicetipoxpr TEXT DEFAULT '',
    condicattr BIT DEFAULT 0,
    condicattrexpr TEXT DEFAULT '',
    expressaotbjs TEXT DEFAULT '',
    usaexpresstbjs BIT DEFAULT 0,
    usaexpresscoldesc BIT DEFAULT 0,
    expressaojscoldesc TEXT DEFAULT '',
    nometb VARCHAR(100) DEFAULT '',
    valtb VARCHAR(100) DEFAULT '',
    categoria VARCHAR(100) DEFAULT 'default',
    addBtn BIT DEFAULT 0,
    descbtnModelo VARCHAR(250) DEFAULT '',
    modelocoluna BIT DEFAULT 0,
    expressaojsevento TEXT DEFAULT '',
    executaeventochange BIT DEFAULT 0,
    inactivo BIT DEFAULT 0,
    decimais INT DEFAULT 2,
    proibenegativo BIT DEFAULT 0,
    regra VARCHAR(250) DEFAULT '',
    fixacoluna BIT DEFAULT 0,
    sourceKey VARCHAR(100) DEFAULT '',
    sourceBind VARCHAR(100) DEFAULT '',
    extras TEXT DEFAULT '',
    fx_tipo VARCHAR(50) DEFAULT '',
    fx_activo BIT DEFAULT 0,
    fx_expressao TEXT DEFAULT '',
    fx_colrefs TEXT DEFAULT '',
    ousrinis varchar(30) DEFAULT '',
    usrinis varchar(30) DEFAULT '',
    ousrdata datetime DEFAULT '1900-01-01 00:00:00',
    usrdata datetime DEFAULT '1900-01-01 00:00:00',
    ousrhora varchar(8) DEFAULT '',
    usrhora varchar(8) DEFAULT '',
);






CREATE TABLE MrendCelula
(
    celulastamp VARCHAR(25) PRIMARY KEY,
    linhastamp VARCHAR(25) DEFAULT '',
    colunastamp VARCHAR(25) DEFAULT '',
    codigocoluna VARCHAR(100) DEFAULT '',
    sinalnegativo BIT DEFAULT 0,
    inactivo BIT DEFAULT 0,
    condicinactivo BIT DEFAULT 0,
    condicinactexpr TEXT DEFAULT '',
    desabilitado BIT DEFAULT 0,
    usafnpren BIT DEFAULT 0,
    atributo VARCHAR(250) DEFAULT '',

    fnpren VARCHAR(250) DEFAULT '',
    sourceKey VARCHAR(100) DEFAULT '',
    sourceBind VARCHAR(100) DEFAULT '',
    extras TEXT DEFAULT '',
    fx VARCHAR(250) DEFAULT '',
    temfx BIT DEFAULT 0,
    fx_tipo VARCHAR(50) DEFAULT '',
    fx_activo BIT DEFAULT 0,
    fx_expressao TEXT DEFAULT '',
    fx_colrefs TEXT DEFAULT ''
);


CREATE TABLE u_reportl (
    u_reportlstamp VARCHAR(25) PRIMARY KEY DEFAULT '',
    ordem Numeric(16) DEFAULT 0,
    linkstamp VARCHAR(250) DEFAULT '',
    cellid VARCHAR(250) DEFAULT '',
    linha VARCHAR(250) DEFAULT '',
    coluna VARCHAR(250) DEFAULT '',
    desclinha VARCHAR(250) DEFAULT '',
    codigoreport VARCHAR(250) DEFAULT '',
    reportstamp VARCHAR(250) DEFAULT '',
    desccoluna VARCHAR(250) DEFAULT '',
    ordemcoluna Numeric(16) DEFAULT 0,
    valor Numeric(16,2) DEFAULT 0,
    cvalor VARCHAR(250) DEFAULT ''
);


CREATE TABLE Mrendconfigligacao(

    mrendligacoesstamp VARCHAR(25) PRIMARY KEY DEFAULT '',
    elemento VARCHAR(250) DEFAULT '',
    componentenegstamp VARCHAR(25) DEFAULT '',
    componentelibstamp VARCHAR(25) DEFAULT '',
    ligacaokey VARCHAR(250) DEFAULT '',
)

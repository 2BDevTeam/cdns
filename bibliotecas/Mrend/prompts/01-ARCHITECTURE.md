# MRend — Arquitectura Completa

> **Referência técnica** para compreender a estrutura do sistema MRend (Input/Report).  
> Dois ficheiros principais: `MRENDCONFIG LIB.js` (configuração) e `MRend.js` (renderização).

---

## 1. Visão Geral do Sistema

O MRend é um motor de **input reports** interactivos baseado em Tabulator.js + IndexedDB (Dexie).  
Funciona sobre um modelo **EAV** (Entity-Attribute-Value): cada célula visível na grelha é um registo na tabela `u_reportl`.

```
[PHC Backend]
     │  GET → u_reportl (registos EAV)
     ▼
[MRENDCONFIG LIB.js]          ← Configuração estática (colunas, linhas, células)
     │  buildConfigFromDB()
     ▼
[MRend.js  — new Mrend(options)]   ← Motor de renderização + Tabulator
     │  GroupBy rowIdField → Tabulator rows
     ▼
[Tabulator]                    ← Grelha interactiva no browser
     │  cellEdited → syncChangesToDB → Dexie (IndexedDB)
     ▼
[PHC Backend]
     │  POST → save Dexie records → u_reportl
```

---

## 2. Camada de Configuração — `MRENDCONFIG LIB.js`

### 2.1 Classes de configuração principais

| Classe JS | Tabela BD | Descrição |
|-----------|-----------|-----------|
| `LinhaMrenderConfig` | `MrendLinha` | Define uma linha/grupo da grelha |
| `ColunaMrenderConfig` | `MrendColuna` | Define uma coluna da grelha |
| `CelulaMrenderConfig` | `MrendCelula` | Override de célula (linha × coluna) |
| `MrendGrupoColuna` | `MrendGrupoColunaItem` | Agrupamento visual de colunas |
| `MrendInitConfig` | `MRendRelatorio.rendopt` (JSON) | Config de inicialização do render |

---

### 2.2 `ColunaMrenderConfig` — Campos chave

```js
new ColunaMrenderConfig({
    colunastamp:      "UUID",          // PK
    relatoriostamp:   "UUID",          // FK → MRendRelatorio
    codigocoluna:     "janeiro",       // código interno (sem espaços, minúsculas)
    desccoluna:       "Janeiro",       // label visível na grelha
    tipo:             "digit",         // ver tipos abaixo
    campo:            "saldo",         // campo da BD onde o valor é gravado
    ordem:            3,               // posição na grelha (1-based)
    tamanho:          100,             // largura em px
    alinhamento:      "right",         // "left" | "center" | "right"
    atributo:         "",              // "" | "enabled" | "disabled" | "readonly"
    
    // Coluna calculada (expressão)
    colfunc:          false,
    expresscolfun:    "",              // ex: "<janeiro>+<fevereiro>+<marco>"
    
    // Tipo tabela (dropdown/lookup)
    nometb:           "",              // campo para label no dropdown
    valtb:            "",              // campo para valor no dropdown
    usaexpresstbjs:   false,
    expressaotbjs:    "",              // JS que devolve array de {nometb, valtb}
    
    // Validação
    validacoluna:     false,
    campovalid:       "",
    proibenegativo:   false,
    decimais:         2,
    
    // Coluna fixa (frozen)
    fixacoluna:       false,
    
    // Eventos
    executaeventochange: false,
    expressaojsevento:   "",
    
    // Condições dinâmicas
    condictipo:       false,           // tipo muda dinamicamente
    condicetipoxpr:   "",
    condicattr:       false,           // atributo muda dinamicamente
    condicattrexpr:   "",
})
```

#### Tipos de coluna (`tipo`)

| Valor | Descrição | Campo BD recomendado |
|-------|-----------|---------------------|
| `"digit"` | Número (int/decimal) | `saldo` ou `valor` |
| `"text"` | Texto curto | `cvalor` |
| `"textarea"` | Texto longo | `cvalor` |
| `"date"` | Data | `cvalor` ou `dvalor` |
| `"table"` | Dropdown/lookup | `cvalor` |
| `"logic"` | Checkbox/booleano | `cvalor` |
| `"button"` | Botão HTML | n/a |

> **REGRA CRÍTICA**: O campo `campo` determina **onde na BD o valor é gravado**.  
> - Colunas numéricas → `campo: "saldo"`  
> - Colunas texto/tabela/data/logic → `campo: "cvalor"`  
> - NUNCA colocar `campo: "saldo"` em colunas de texto.

---

### 2.3 `LinhaMrenderConfig` — Campos chave

```js
new LinhaMrenderConfig({
    linhastamp:    "UUID",         // PK
    relatoriostamp:"UUID",         // FK → MRendRelatorio
    tipo:          "Grupo",        // "Grupo" | "Subgrupo" | "Singular"
    codigo:        "u_reportl",    // código único da linha (usado em addLinhaComCelulas)
    descricao:     "Mão de Obra",  // descrição visível
    modelo:        true,           // true = linha pode ser adicionada dinamicamente
    descbtnModelo: "Adicionar linha",
    ordem:         100,
    temcolunas:    true,           // true = tem colunas de input
    
    // Totais
    temtotais:     false,
    totkey:        "",             // campo da grelha para calcular total
    totfield:      "",             // campo destino do total
    
    // Leitura
    leitura:       false,          // true = linha só leitura
    
    // Filho
    addfilho:      false,
    parentstamp:   "",             // FK para linha pai
    linkstamp:     "",
    
    // Eventos
    eventoadd:     false,
    eventoaddexpr: "",             // JS executado ao adicionar linha
    eventodelete:  false,
    eventodeleteexpr: "",
})
```

#### Hierarquia de linhas

```
Grupo (tipo: "Grupo")
  └─ Subgrupo (tipo: "Subgrupo", parentstamp: <grupo.linhastamp>)
       └─ Singular (tipo: "Singular", parentstamp: <subgrupo.linhastamp>)
```

---

### 2.4 `CelulaMrenderConfig` — Override por célula

Usado quando uma célula específica (cruzamento linha × coluna) precisa de comportamento diferente da coluna padrão:

```js
new CelulaMrenderConfig({
    celulastamp:       "UUID",
    linhastamp:        "UUID",     // FK → MrendLinha
    colunastamp:       "UUID",     // FK → MrendColuna
    codigocoluna:      "total",
    inactivo:          false,      // célula invisível
    desabilitado:      false,      // célula cinzenta/não editável
    atributo:          "readonly", // força readonly para esta célula
    sinalnegativo:     false,
    
    // Valor defeito
    valordefeito:      false,
    valordefeitoexpr:  "",         // JS que devolve valor inicial
    valdefafinstancia: false,      // aplica valor APÓS criar a instância
})
```

---

### 2.5 `MrendGrupoColuna` e `MrendGrupoColunaItem`

Permitem agrupar colunas visualmente com um cabeçalho de grupo:

```js
// Grupo
new MrendGrupoColuna({
    grupocolunastamp: "UUID",
    relatoriostamp:   "UUID",
    codigogrupo:      "semestre1",
    descgrupo:        "1º Semestre",
    fixa:             false,
    ordem:            1,
})

// Item do grupo (liga coluna ao grupo)
new MrendGrupoColunaItem({
    grupocolunaitemstamp: "UUID",
    grupocolunastamp:     "UUID",  // FK → MrendGrupoColuna
    colunastamp:          "UUID",  // FK → MrendColuna
    relatoriostamp:       "UUID",
    ordem:                1,
})
```

---

### 2.6 `BindData` — Ligação a campos da BD

```js
new BindData({
    sourceKey:  "u_reportlstamp",  // campo chave na tabela-fonte
    sourceBind: "saldo",           // campo alvo na tabela-fonte (onde gravar)
})
```

---

### 2.7 `FXData` — Sistema de expressões

```js
new FXData({
    tipo:      "coluna",           // tipo de expressão
    activo:    true,               // está activa?
    expressao: "<jan>+<fev>+<mar>", // usar SEMPRE <colname> com angle brackets
    colrefs:   ["jan","fev","mar"] // gerado automaticamente por buildColRefs()
})
```

> **SINTAXE OBRIGATÓRIA**: Referências a colunas numa expressão usam **`<codigocoluna>`** (angle brackets).  
> ERRADO: `{janeiro}+{fevereiro}` → SyntaxError  
> CORRECTO: `<janeiro>+<fevereiro>`

---

## 3. Camada de Renderização — `MRend.js`

### 3.1 `new Mrend(options)` — Opções de inicialização

```js
var GMREND = new Mrend({
    // Edição
    enableEdit:         true,           // ou expressão JS: "$(\"#mainPage\").data(\"state\") == \"editar\""
    resetSourceStamp:   false,
    
    // Container
    containerToRender:  "#campos > .row:last",
    
    // Dados
    datasourceName:     "u_reportl",    // nome da Dexie DB
    tableSourceName:    "u_reportl",    // tabela de origem dos dados
    table:              "u_reportl",
    codigo:             "MAOOBRA",      // código do relatório (FK → MRendRelatorio.codigo)
    
    // Fetch remoto
    remoteFetch:        true,
    remoteFetchData: {
        url:  "../programs/gensel.aspx?cscript=getdatafromphc",
        type: "POST",
        data: { "__EVENTARGUMENT": "JSON.stringify([{...}])" }
    },
    
    // Mapeamento EAV → Grelha
    dbTableToMrendObject: {
        chunkMapping:       true,        // TRUE = formato EAV (u_reportl); FALSE = flat
        table:              "u_reportl",
        dbName:             "MrendDB_MAOOBRA",  // nome da IndexedDB (Dexie)
        tableKey:           "u_reportlstamp",   // PK da tabela EAV
        defaultColumnName:  "",
        extras: {
            ordemField:       "naturezaordem",
            linkField:        "gruporowid",
            cellIdField:      "u_reportlstamp",
            colunaField:      "rubrica",         // campo que identifica a coluna
            linhaField:       "natureza",         // campo que identifica a linha
            rowIdField:       "naturezasubrowid", // campo que agrupa células numa linha
            descLinhaField:   "descnatureza",
            descColunaField:  "descrubrica",
            ordemColunaField: "grupolordem",
            tipocolField:     "tipocol"
        }
    },
    
    // Schemas Dexie (primeira coluna = PK)
    schemas: [
        "u_reportlstamp", "naturezasubrowid", "naturezaordem",
        "saldo", "rubrica", "natureza", "descnatureza",
        "gruporowid", "grupolordem", "descrubrica", "cvalor",
        "tipocol", "u_reportcstamp"
    ],
    
    // Config do relatório (carregada do servidor)
    reportConfig: {
        config: {
            linhas:          [],  // → array de Linha{}
            colunas:         [],  // → array de Coluna{}
            celulas:         [],  // → array de Celula{}
            grupocolunas:    [],
            grupocolunaItems:[],
            relatorio:       {}
        }
    },
    
    // Registo PHC corrente
    recordData: { stamp: "getReportStamp()" },
    
    // Callback pós-render
    afterRenderCallback: "onMrendRendered"
});
```

---

### 3.2 `DbTableToMrendObject` — Mapeamento EAV

Quando `chunkMapping: true`, cada registo no `u_reportl` representa **uma célula** (EAV).  
O MRend agrupa os registos por `rowIdField` (`naturezasubrowid`) para construir **uma linha** na grelha.

```
u_reportl (EAV):
  naturezasubrowid="abc" | rubrica="janeiro"  | saldo=1000
  naturezasubrowid="abc" | rubrica="fevereiro" | saldo=2000
  naturezasubrowid="abc" | rubrica="total"     | saldo=3000
  naturezasubrowid="xyz" | rubrica="janeiro"   | saldo=500
  ...

→ Grelha (após groupBy naturezasubrowid):
  Linha 1 (rowid="abc"): janeiro=1000 | fevereiro=2000 | total=3000
  Linha 2 (rowid="xyz"): janeiro=500  | ...
```

---

### 3.3 API Pública do `Mrend`

```js
// Verificação assíncrona (table built)
GMREND.whenReady(function() { /* código após Tabulator pronto */ });

// Tem linhas?
GMREND.hasRows().then(function(has) {
    if (!has) { /* popular dados */ }
});

// Total de linhas
GMREND.getTotalRows().then(function(total) { console.log(total); });

// Adicionar linha a partir de registo plano
GMREND.addLinhaComRegistos("u_reportl", registoPlano);

// Adicionar linha(s) a partir de células EAV
GMREND.addLinhaComCelulas("u_reportl", arrayDeCelulas);
// Com resetIds (novo relatório, copiar dados de outro)
GMREND.addLinhaComCelulas("u_reportl", arrayDeCelulas, { resetIds: true });

// Obter coluna pelo código
var coluna = GMREND.getColunaByCodigo("janeiro");
```

---

### 3.4 Ciclo de vida da renderização

```
1. new Mrend(options)
      ↓
2. initDB()             → Dexie IndexedDB inicializada com schemas
      ↓
3. fetchData()          → GET u_reportl do servidor (remoteFetch) ou usa records locais
      ↓
4. ConvertDbTableToMrendObject() → EAV → MrendObject[]
      ↓
5. buildRenderedConfig()  → Constrói RenderedColuna[], RenderedLinha[]
      ↓
6. buildTabulatorColumns() → Definições de colunas Tabulator
      ↓
7. new Tabulator()        → Renderiza a grelha
      ↓
8. tableBuilt event       → resolve _tableBuiltPromise → whenReady() callbacks
      ↓
9. cellEdited event       → CellObjectConfig.valor setter 
      ↓
10. syncChangesToDB()     → buildChangedObjectUpdateData() → updateCellOnDB() → Dexie
      ↓
11. Save btn              → Dexie records → PHC Backend (POST)
```

---

### 3.5 Sistema de expressões (colunas calculadas)

```js
// Na config da coluna:
colfunc:      true,
expresscolfun: "<janeiro>+<fevereiro>+<marco>+<abril>+<maio>+<junho>+<julho>+<agosto>+<setembro>+<outubro>+<novembro>+<dezembro>"

// Internamente:
// 1. buildColRefs("<jan>+<fev>") → ["jan","fev"]
// 2. Na renderização, para cada linha:
//    expressao = "<jan>+<fev>"
//    expressao = expressao.replaceAll("<jan>", celulaJan.valor)
//    expressao = expressao.replaceAll("<fev>", celulaFev.valor)
//    resultado = new Function("return " + expressao)()
```

---

## 4. Base de Dados

### 4.1 Tabelas fixas (nunca mudam de nome)

| Tabela | Conteúdo |
|--------|----------|
| `MRendRelatorio` | Registo-mestre do relatório: nome, código, configuração init (JSON em `rendopt`) |
| `MrendLinha` | Linhas/grupos configurados |
| `MrendColuna` | Colunas configuradas |
| `MrendCelula` | Overrides de células |
| `MrendGrupoColuna` | Grupos de colunas |
| `MrendGrupoColunaItem` | Associação coluna ↔ grupo |
| `Mrendconfigligacao` | Ligações entre componentes e tabelas externas |
| `u_reportl` | **Tabela de dados EAV** — os valores das células |

### 4.2 Tabela de cabeçalho (varia por implementação)

A "tabela de cabeçalho" é a tabela PHC à qual o relatório está associado (ex: `u_nota`, `u_proposta`, `u_obra`).  
- O nome da tabela varia por projecto  
- A chave primária varia (ex: `u_notastamp`, `u_propostastamp`)  
- O `MRendRelatorio.codigo` identifica o relatório dentro de um cabeçalho

```sql
-- Exemplo: u_nota é a tabela de cabeçalho
-- O relatório é identificado pelo campo "nota" dentro de u_nota
-- e pelo MRendRelatorio onde codigo = valor de u_nota.nota
```

### 4.3 Estrutura de `u_reportl`

```sql
CREATE TABLE u_reportl (
    u_reportlstamp      VARCHAR(25)  PRIMARY KEY,  -- PK (= cellId)
    ordem               Numeric(16)  DEFAULT 0,     -- ordem da linha
    linkstamp           VARCHAR(250) DEFAULT '',     -- FK para linha pai
    cellid              VARCHAR(250) DEFAULT '',     -- ID da célula
    linha               VARCHAR(250) DEFAULT '',     -- código da linha
    coluna              VARCHAR(250) DEFAULT '',     -- código da coluna
    desclinha           VARCHAR(250) DEFAULT '',
    codigoreport        VARCHAR(250) DEFAULT '',     -- código do relatório
    reportstamp         VARCHAR(250) DEFAULT '',     -- stamp do registo-mestre
    desccoluna          VARCHAR(250) DEFAULT '',
    ordemcoluna         Numeric(16)  DEFAULT 0,
    valor               Numeric(16,2) DEFAULT 0,    -- valor numérico
    mvalor              TEXT         DEFAULT '',
    dvalor              Date         DEFAULT '1900-01-01', -- valor data
    cvalor              VARCHAR(250) DEFAULT '',    -- valor texto/lookup
    tipo                VARCHAR(20)  DEFAULT ''
);
```

> Os campos `saldo`, `natureza`, `naturezasubrowid`, `rubrica`, `descrubrica`, etc. são **colunas adicionais**  
> que o PHC/implementação adiciona a `u_reportl` além das colunas-base.

---

## 5. Inicialização do ecrã — `initTabelaConfiguracaoMrender()`

Chamada no `pageLoad()`, recebe:

```js
initTabelaConfiguracaoMrender({
    codigo:                   "MAOOBRA",         // código do relatório (campo em tabela de cabeçalho)
    extraConfigContainer:     "#mrend-init-config-container",
    relatorioTable:           "u_nota",          // tabela de cabeçalho (VARIA)
    relatorioTableKey:        "u_notastamp",     // PK da tabela de cabeçalho (VARIA)
    relatorioTableFilterField:"nota",            // campo de filtro (VARIA)
    defaultInitConfig:        { /* MrendInitConfig */ }
});
```

---

## 6. Regras de configuração rápidas

1. **Coluna numérica** → `tipo: "digit"`, `campo: "saldo"`
2. **Coluna texto/lookup/data** → `tipo: "text"/"table"/"date"`, `campo: "cvalor"`
3. **Coluna calculada** → `colfunc: true`, `expresscolfun: "<col1>+<col2>"`, `atributo: "readonly"`
4. **Linha editável** → `modelo: true` na linha, `temcolunas: true`
5. **Coluna fixa (frozen)** → `fixacoluna: true` (geralmente descrição da linha)
6. **Expressões** → sempre `<codigocoluna>` com angle brackets, NUNCA `{coluna}`
7. **Novo relatório copiado** → `addLinhaComCelulas(..., { resetIds: true })`
8. **Async** → sempre usar `whenReady()` antes de manipular a tabela

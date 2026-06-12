# MdashContainerItemObject — tipos e configjson

Tabela: `MdashContainerItemObject` — PK: `mdashcontaineritemobjectstamp`

## Propriedades do registo

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `mdashcontaineritemobjectstamp` | string UUID | auto | PK |
| `mdashcontaineritemstamp` | string UUID | — | Item (card) pai |
| `dashboardstamp` | string UUID | — | Dashboard |
| `tipo` | string | `""` | **Tipo de renderer** (ver tabela abaixo) |
| `tamanho` | number | `0` | Legacy span interno |
| `ordem` | number | auto | Ordem no slot |
| `slotid` | string | `""` | Slot do layout (`body`, `title`, `icon`…) |
| `fontestamp` | string | `""` | FK `MDashFonte` principal |
| `fontesstampsjson` | string | `'[]'` | JSON array de stamps adicionais |
| `processaFonte` | boolean | `true` | `false` = estático (sem pipeline de fonte) |
| `categoria` | string | `"editor"` | `editor`, `display`, `custom`, `detail` |
| `configjson` | string | `""` | Config do tipo (`JSON.stringify`) |
| `transformconfigjson` | string | `""` | Transformação de dados (MdashTransformBuilder) |
| `expressaoobjecto` | string | `""` | Legacy |
| `objectexpressaodblistagem` | string | `""` | SQL legacy do objecto |
| `tipoquery` | string | `"item"` | Contexto de query |
| `temdetalhes` | boolean | `false` | Modal de detalhes |
| `detalhesqueryconfigjson` | string | `""` | Config detalhes |
| `tipoobjectodetalhes` | string | `""` | Tipo no modal detalhes |
| `titulodetalhes` | string | `""` | Título modal |
| `titulobtndetalhes` | string | `""` | Texto botão detalhes |
| `queryconfigjson` | string | auto | Query builder interno |

## Catálogo UI vs tipos que renderizam

### Catálogo (`getObjectCatalogDefinitions`) — valores `value`

**Dados:** `chart`, `table`, `kpi`, `list`  
**Conteúdo:** `TituloItem`, `text`, `image`, `html`, `customCode`  
**Layout:** `card`, `separator`, `filter`

### Tipos com renderer (`getTiposObjectoConfig`)

| `tipo` | Renderiza | `processaFonte` default | Aliases normalizados |
|--------|-----------|-------------------------|----------------------|
| `chart` | Sim | `true` | `gráfico`, `grafico` |
| `pie` | Sim | `true` | `pizza` |
| `table` | Sim | `true` | `tabela` |
| `text` | Sim | `true` | `texto` |
| `html` | Sim | `true` | — |
| `list` | Sim | `true` | — |
| `customCode` | Sim | **`false`** | `customcode` |
| `title` | Sim | **`false`** | — |
| `TituloItem` | Sim | **`false`** | — |
| `detail` | Stub | `true` | `detalhe` |

### Sem renderer — NÃO usar em JSON de produção

`kpi`, `image`, `card`, `separator`, `filter` (do catálogo Layout/Conteúdo)

**Alternativas:**

| Pedido do user | Solução |
|----------------|---------|
| KPI numérico | `tipo: "text"` + `dataFormat.type: "number"` OU card `snap_card` |
| Imagem | `tipo: "html"` com `<img>` ou `customCode` |
| Card layout | `MdashContainerItem.templatelayout`, não object `tipo: "card"` |
| Separador | CSS no container ou item `plain_card` vazio |
| Filtro inline | `MdashFilter` global, não object `filter` |

## configjson por tipo

### `chart` — `_MCHART_SAMPLE_CONFIG`

```json
{
  "theme": "modern",
  "chartType": "bar",
  "height": 300,
  "xField": "mes",
  "series": [
    { "field": "total", "name": "Total", "type": "default", "color": "" }
  ],
  "stacked": false,
  "smooth": true,
  "gradient": true,
  "borderRadius": 6,
  "dataLabels": false,
  "animation": true,
  "toolbox": true,
  "legend": { "show": true, "position": "top" },
  "tooltip": { "show": true },
  "xAxis": { "show": true, "rotate": 0, "name": "Mês" },
  "yAxis": { "show": true, "name": "Valor" },
  "title": { "show": true, "text": "Título do gráfico" }
}
```

`chartType`: `bar`, `line`, `pie`, `scatter`, etc. (ECharts via extension).

### `table` — campos principais de `_TABLE_SAMPLE_CONFIG`

```json
{
  "layout": "fitColumns",
  "height": "auto",
  "maxHeight": "420px",
  "pagination": { "enabled": false, "size": 15 },
  "headerFilter": false,
  "resizableColumns": true,
  "stripedRows": true,
  "theme": "corporate",
  "columns": [],
  "autoColumns": true,
  "styling": {
    "headerBg": "#1a3a6c",
    "headerText": "#f5e6c8",
    "borderRadius": 16,
    "fontSize": 11
  },
  "filters": { "enabled": false, "position": "top", "definitions": [] }
}
```

Com colunas explícitas: `autoColumns: false`, `columns: [{ "title": "...", "field": "...", "minWidth": 120 }]`.

### `text` — `_TEXT_SAMPLE_CONFIG` (campos principais)

```json
{
  "dataField": "valor",
  "staticText": "Texto fixo",
  "dataFormat": {
    "type": "number",
    "locale": "pt-PT",
    "currency": "EUR",
    "minimumFractionDigits": 0,
    "maximumFractionDigits": 2,
    "prefix": "",
    "suffix": ""
  },
  "content": { "htmlEnabled": false, "multipleValues": false, "separator": ", " },
  "textFormat": {
    "fontSize": 24,
    "fontWeight": "bold",
    "textAlign": "center"
  },
  "colors": { "textColor": "#334155", "backgroundColor": "transparent" }
}
```

`dataFormat.type`: `text`, `number`, `currency`, `percent`, `date`.

Para KPI: `dataField` aponta coluna da fonte; ou `staticText` se fixo.

### `list` — `_LISTA_SAMPLE_CONFIG` (campos principais)

```json
{
  "labelField": "nome",
  "linkField": "url",
  "listStyle": "numbered",
  "badgeField": "",
  "subtitleField": "",
  "useManualItems": false,
  "manualItems": [],
  "maxItems": 0
}
```

`listStyle`: `numbered`, `timeline`, `plain`, `card`, `row`.

### `html`

```json
{
  "htmlTemplate": "<div>{{titulo}}</div>",
  "cssCode": ".mhtml-card { padding: 16px; }",
  "sanitize": true,
  "minHeight": ""
}
```

Handlebars: `{{campo}}`, `{{#each rows}}`.

### `customCode`

```json
{
  "code": "// $container, data, config, fetchData()\n$container.html('<div>...</div>');",
  "cssCode": "",
  "executeOnEdit": true
}
```

`processaFonte: false` no registo; pode usar `transformconfigjson` para dados.

### `TituloItem` / `title`

`configjson: "{}"` ou omitir. Renderiza `MdashContainerItem.titulo`.  
`processaFonte: false`, `categoria: "display"`.  
Colocar em `slotid: "title"`.

## transformconfigjson (dados)

Usado quando a fonte precisa agregação/filtros antes do render:

```json
{
  "mode": "builder",
  "sourceTable": "nome_tabela_ou_view",
  "columns": [{ "field": "mes", "alias": "mes", "visible": true }],
  "measures": [{ "field": "total", "aggregate": "SUM", "alias": "total" }],
  "filters": [],
  "groupBy": ["mes"],
  "orderBy": [{ "field": "mes", "direction": "ASC" }],
  "limit": null
}
```

Prioridade no runtime: `transformConfig` > `fonte.lastResults` > sample data.

## Exemplo — gráfico num card

```json
{
  "mdashcontaineritemobjectstamp": "OBJ-001",
  "mdashcontaineritemstamp": "ITEM-001",
  "dashboardstamp": "DASH-UUID",
  "tipo": "chart",
  "slotid": "body",
  "fontestamp": "FONTE-001",
  "ordem": 1,
  "processaFonte": true,
  "categoria": "editor",
  "configjson": "{\"chartType\":\"bar\",\"xField\":\"mes\",\"series\":[{\"field\":\"total\",\"name\":\"Vendas\"}],\"height\":280}",
  "transformconfigjson": "",
  "fontesstampsjson": "[]"
}
```

## slotid — regra

| Layout típico | Slots | Object placement |
|---------------|-------|------------------|
| `snapshot_layout_v2` | `title`, `body` | KPI valor em `body`, label em `title` via `TituloItem` |
| `snap_card` | `title`, `icon`, `body`, `footer` | Valor `body`, ícone decorativo opcional |
| `card_standard` | `title`, `body` | Conteúdo principal em `body` |
| `brd_card_advanced_metric_*` | `title`, `icon`, `body` | Métrica em `body` |

Se `slotid` vazio → runtime usa slot principal (`body` / `isMainContent`).

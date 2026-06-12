# Modelo de 3 camadas: Structure · Logic · Design

Toda geração JSON (filtro, container, item, objecto, fonte, layout) deve ser pensada nestas **3 camadas**. Isto evita inventar parâmetros e guia decisões a partir de foto/prompt.

```
┌─────────────────────────────────────────────────────────┐
│  DESIGN    — Como parece (HTML/CSS/templates, temas)    │
├─────────────────────────────────────────────────────────┤
│  LOGIC     — Como funciona (SQL, fontes, refresh, slots)│
├─────────────────────────────────────────────────────────┤
│  STRUCTURE — O que persiste (SQL + JSON importável)      │
└─────────────────────────────────────────────────────────┘
```

---

## MdashFilter

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | Colunas `MdashFilter` em `SQL/MDash tables.sql`; campos `03-FILTERS.md` | SQL + `getMdashFilterUIObjectFormConfigAndSourceValues()` |
| **Logic** | Opções via `expressaolistagem`; change via `expressaochange`; liga a fontes via `parametrosjson.token`; escopo global/tab | `modules/FILTERS.md`; runtime `Mdash.html` `getVisibleFilters`, `updateFilter` |
| **Design** | Controlos Bootstrap: `input-mdash-filter`, `select-mdash-filter`, toggle logic | `Mdash.html` CSS secção filtros; grid `gr-col-md-{tamanho}` |

**Prompt/foto:** barra de filtros → Structure: N× `MdashFilter` + `temfiltro`; Logic: SQL placeholder + `@tokens`; Design: `tamanho` para largura, `filtrohorizont: true`.

---

## MdashContainer

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | `MdashContainer` SQL; `tamanho`, `layoutmode`, `ordem`, `mdashtabstamp` | `04-CONTAINERS-AND-ITEMS.md` |
| **Logic** | Agrupa items; `layoutmode auto` quebra rows por soma 12; filtro por tab | `MDash config lib.js` canvas sortable, `groupItemsByRows` |
| **Design** | Header `.mdash-canvas-container`, título secção | `MDash config lib.js` estilos canvas ~10714+ |

---

## MdashContainerItem (card)

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | `templatelayout`, `slotsconfigjson`, `tamanho`, grid manual | `04-CONTAINERS-AND-ITEMS.md`, `08-LAYOUTS-AND-SLOTS.md` |
| **Logic** | Template resolve slots; `renderMdashContainerItemSlots`; skeleton por slot | `MDash config lib.js` `renderUnifiedLayout`, `getMdashContainerItemMainSlotId` |
| **Design** | HTML/CSS do layout escolhido (`htmltemplate`, `csstemplate`) | `TEMPLATE DASHBOARD STANDARD EXTENSION.js` `getDefaultLayoutDefinitions()` ~9975; custom: `Mdash Layout Builder.js` |

**Card que não existe na foto:**  
1. Design — procurar layout built-in similar em `08-LAYOUTS-AND-SLOTS.md`  
2. Se não houver — Structure: novo `MdashContainerItemLayout` + `templatelayout: custom_<stamp>`  
3. Não inventar `templatelayout` aleatório

---

## MdashContainerItemObject

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | `tipo`, `slotid`, `configjson`, `fontestamp`, `transformconfigjson` | `05-OBJECT-TYPES.md`, `00-DATA-STRUCTURE-LAYER.md` |
| **Logic** | `processaFonte`; `mdashResolveObjectData`; pipeline fontes `onfilterchange` | `MDash config lib.js` ~1869; `Mdash.html` `_runFontePipelineByStampMap` |
| **Design** | Renderer + CSS inject do tipo | `12-DESIGN-ASSETS-MAP.md` |

### Objecto por tipo — resumo 3 camadas

| tipo | Structure (configjson) | Logic | Design (ficheiro) |
|------|------------------------|-------|---------------------|
| `table` | `_TABLE_SAMPLE_CONFIG` | Tabulator + `executeRaw(transform)` | `_tblCSS()` ~1185 extension |
| `chart` | `_MCHART_SAMPLE_CONFIG` | ECharts `buildEchartsOption` | temas ~2998+, `renderObjectGrafico` ~4105 |
| `pie` | `labelField`, `valueField` | via chart infra | idem chart |
| `text` | `_TEXT_SAMPLE_CONFIG` | `dataField` + `dataFormat` | inline styles em config |
| `list` | `_LISTA_SAMPLE_CONFIG` | `labelField` ou `manualItems` | CSS lista inline no renderer |
| `html` | `_HTML_SAMPLE_CONFIG` | Handlebars `_htmlRenderTemplate` | `cssCode` no config |
| `customCode` | `code`, `cssCode` | `fetchData()`, `processaFonte: false` | JS livre no config |
| `TituloItem` | `{}` | lê `containerItem.titulo` | slot `title` do layout |

---

## MDashFonte

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | `expressaolistagem`, `parametrosjson`, `scope`, `tipo` | `06-FONTES.md`, SQL |
| **Logic** | `MDashFonte.execute()`; tokens `@x`; `refreshmode` | `DATA SOURCE Operations.js` |
| **Design** | N/A (dados) | — |

---

## MdashContainerItemLayout (card custom)

| Camada | O quê | Onde ler |
|--------|-------|----------|
| **Structure** | `htmltemplate`, `csstemplate`, `slotsdefinition` | SQL + `08-LAYOUTS-AND-SLOTS.md` |
| **Logic** | `toTemplateOption()` → `custom_<stamp>`; slots `data-mdash-slot` | `MDash config lib.js` `MdashContainerItemLayout` |
| **Design** | HTML/CSS/JS templates; preview no Layout Builder | `js/Mdash Layout Builder.js` |

---

## Árvore de decisão — elemento visual desconhecido

Ver `13-DECISION-FLOW.md` (fluxo completo foto → JSON).

Resumo:

| Pedido visual | 1º tentativa Design | 2º Logic | 3º Structure fallback |
|---------------|---------------------|----------|------------------------|
| Gráfico estranho não catalogado | `chart` + `chartType` mais próximo | `transformconfigjson` | `customCode` + ECharts em JS |
| KPI / número | `snap_card` / `snapshot_layout_v2` | fonte 1 row | `text` + `dataFormat` |
| Tabela | `table` + `theme` | fonte SQL | — |
| Card com moldura única | built-in BRD/snap | — | `MdashContainerItemLayout` |
| Widget interactivo | — | — | `customCode` |
| Imagem | — | — | `html` com `<img>` ou `customCode` |

**Regra:** não inventar `tipo` novo. Usar tipo existente + config mínima documentada.

---

## Parâmetros — não inventar

| Fazer | Não fazer |
|-------|-----------|
| Usar campos do SQL / sample config | Campos camelCase não documentados |
| `configjson` = subset do `_XXX_SAMPLE_CONFIG` | Config com 50 chaves extra |
| SQL com `@tokens` definidos em `parametrosjson` | SQL com parâmetros não declarados |
| `templatelayout` da lista built-in | `templatelayout: "modern_card_v3"` |
| Stamps ≤ 25 chars estilo `generateUUID()` | UUID 36 caracteres |

Se um parâmetro não está no sample config nem no SQL → **omitir** (usa default do renderer).

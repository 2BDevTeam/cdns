# Mapa de assets Design (onde está o CSS/HTML/JS)

Referência para a camada **Design** — onde o código visual vive no repositório.

## Ficheiro central de renderers

```
bibliotecas/Mdash 2.0/js/TEMPLATE DASHBOARD STANDARD EXTENSION.js
```

| Componente | Função renderer | CSS / tema | Sample config (copiar estrutura) |
|------------|-----------------|------------|----------------------------------|
| **Tabela** | `renderObjectTable` ~1069 | `_tblCSS()` ~1185 (`#mdash-table-inline-css`) | `_TABLE_SAMPLE_CONFIG` ~929 |
| **Tabela executive** | idem + structured rows | `_tblCSS()` + vars `--mtbl-*` | `_TABLE_EXECUTIVE_SAMPLE_CONFIG` ~1115 |
| **Gráfico** | `renderObjectGrafico` ~4105 | `_mciChartCSS` / temas ~3737–3805 | `_MCHART_SAMPLE_CONFIG` ~5354 |
| **Pie** | via `getTiposObjectoConfig` pie | ECharts pie em chart engine | schema ~6964 |
| **Texto** | `renderObjectTexto` ~8380 | inline via `config.textFormat`, `colors` | `_TEXT_SAMPLE_CONFIG` ~8327 |
| **Lista** | `renderObjectLista` | estilos inline no renderer ~7346+ | `_LISTA_SAMPLE_CONFIG` ~7346 |
| **HTML** | `renderObjectHtml` ~6611 | `config.cssCode` inject | `_HTML_SAMPLE_CONFIG` ~6565 |
| **Custom code** | `renderObjectCustomCode` ~505 | `config.cssCode` inject | `_CUSTOMCODE_SAMPLE_CONFIG` ~498 |
| **TituloItem** | display renderer | herda slot `title` do layout | `{}` |

### Tabela — temas disponíveis

`_TABLE_THEMES` ~963 no extension. `configjson.theme`: `corporate`, `executive`, etc.  
Styling via `configjson.styling`: `headerBg`, `headerText`, `borderRadius`, `fontSize`, …

### Gráfico — tipos ECharts

`configjson.chartType`: `bar`, `line`, `pie`, `scatter`, …  
`buildEchartsOption` ~3118. Resolvers `RESOLVERS` ~3478.

---

## Layouts de card (Design do container item)

```
TEMPLATE DASHBOARD STANDARD EXTENSION.js
  getDefaultLayoutDefinitions()  ~9981
```

Cada entrada tem:
- `htmltemplate` — HTML com `data-mdash-slot="…"`
- `csstemplate` — CSS scoped (muitos built-in vazio, estilos em funções generator)
- `slotsdefinition` — JSON string dos slots

### Funções generator de card (HTML real)

| Função | Linha ~ | Layouts que usam |
|--------|---------|------------------|
| `generateMDashCardSnapV2` | 346 | `snap_card`, `snap_card_*` |
| `generateDashCardSnapshot` | 471 | `snapshot_layout_v2` |
| `generateDashCardStandard` | 482 | `card_standard` |
| `generateBrdCardAdvancedMetric` | 397 | `brd_card_advanced_metric_*` |
| `generateBrdCardAdvancedStatus` | 421 | `brd_card_advanced_status_*` |
| `generateBrdCardAdvancedAlert` | 447 | `brd_card_advanced_alert_*` |
| `generateCardTimeLine` | 200+ | timeline cards |
| `generateDashCardBudget` | 310+ | budget cards |

**Para card parecido na foto:** identificar qual generator se aproxima → usar `templatelayout` correspondente.  
**Se nenhum servir:** criar `MdashContainerItemLayout` copiando estrutura HTML de um generator + `csstemplate` adaptado.

---

## Layout Builder (cards 100% custom)

```
bibliotecas/Mdash 2.0/js/Mdash Layout Builder.js
```

| Área | Linhas ~ |
|------|----------|
| Estado / galeria | 29–320 |
| ACE editors HTML/CSS/JS | 320–417 |
| Preview | 417–512 |
| Detectar slots do HTML | 1731–1816 |
| Import/export layout | 1816–1964 |
| Template HBF base | 851–955 |

Persistência: tabela `MdashContainerItemLayout` (SQL).

---

## Runtime viewer (dashboard final)

```
bibliotecas/Mdash 2.0/páginas de internet/Mdash.html
```

| Design | Secção |
|--------|--------|
| Filtros horizontais | `.mdash-filter-card--horizontal`, `gr-row` |
| Tabs | CSS `mdash-dashboard-tab` (shared via lib) |
| Loader | `#mdash-loader` ~1806 |
| Cards enterprise fallback | `mdashRenderEnterpriseCard` ~2224 |
| Skeleton loading | `generateMdashSkeleton` ~2325 |

Styles tabs partilhados: `getMdashDashboardTabsSharedStyles()` em `MDash config lib.js`.

---

## Builder canvas

```
bibliotecas/Mdash 2.0/js/MDash config lib.js
```

| Design | ~linha |
|--------|--------|
| Estilos canvas/sidebar | 10658+ (`loadModernDashboardStyles`) |
| Slot overlays drag | `injectSlotDropOverlays` ~3513 |
| Unified layout render | `renderUnifiedLayout` ~3421 |

---

## Fontes / cache (não visual)

```
bibliotecas/Mdash 2.0/js/DATA SOURCE Operations.js
bibliotecas/Mdash 2.0/js/SQLADAPTER.js
```

---

## Como usar este mapa num prompt com foto

1. **Identificar widget** (tabela, gráfico, KPI, card).
2. **Abrir linha** desta tabela → saber `tipo` objecto + ficheiro CSS.
3. **Card exterior** → `getDefaultLayoutDefinitions` / generators.
4. **Visual não coberto** → `customCode` (extension ~505) ou novo layout (Layout Builder).
5. **configjson** — só chaves do `sampleConfig` da linha; cores via `styling` / `theme` existentes.

### Exemplo: "gráfico radar que não existe"

| Camada | Decisão |
|--------|---------|
| Design | Não há `chartType: radar` documentado |
| Logic | Dados via `fontestamp` + `transformconfigjson` |
| Structure | `tipo: "customCode"`, `code` instancia ECharts radar em `$container`, `processaFonte: false` ou `fetchData()` |

### Exemplo: "card com borda dourada e ícone hexagonal"

| Camada | Decisão |
|--------|---------|
| Design | Mais próximo: `brd_card_advanced_metric_*` (barra topo) |
| Se insuficiente | `MdashContainerItemLayout` com `csstemplate` border + slot `icon` |
| Structure | `templatelayout: "brd_card_advanced_metric_primary"` OU `custom_<25charstamp>` |

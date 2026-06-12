# MDash 2.0 — Architecture docs for AI JSON generation

Esta pasta existe para **IA que gera dashboards em JSON** a partir de prompts, mockups ou fotos, para importação no MDash Builder.

## Objetivo

Evitar alucinações: usar **apenas** nomes de campos, tipos e valores documentados aqui. Cada componente deve ser pensado em **3 camadas**:

1. **Structure** — SQL / tabelas / campos importáveis  
2. **Logic** — fontes, SQL, filtros, slots, refresh  
3. **Design** — layouts, CSS, renderers (onde está o código visual)

## Quando usar esta pasta

| Tarefa | Ler primeiro |
|--------|----------------|
| Schema SQL e stamps 25 chars | `00-DATA-STRUCTURE-LAYER.md` |
| Modelo Structure/Logic/Design | `11-THREE-LAYERS-MODEL.md` |
| Onde está CSS/HTML de tabela, gráfico, card | `12-DESIGN-ASSETS-MAP.md` |
| Foto/prompt → decisões | `13-DECISION-FLOW.md` |
| Gerar JSON completo de dashboard | `01-DASHBOARD-MODEL.md` + `02-IMPORT-EXPORT-JSON.md` |
| Filtros do painel superior | `03-FILTERS.md` |
| Rows / cards / grid | `04-CONTAINERS-AND-ITEMS.md` |
| Gráficos, tabelas, KPIs, texto | `05-OBJECT-TYPES.md` |
| Fontes SQL / parâmetros | `06-FONTES.md` |
| Separadores e acessos | `07-TABS-ACCESS-CONFIG.md` |
| Cards visuais, slots, layouts custom | `08-LAYOUTS-AND-SLOTS.md` |
| Regras anti-erro | `09-JSON-GENERATION-RULES.md` |
| Prompts (foto → dashboard) | `10-PROMPT-GUIDE.md` |
| Exemplo importável | `examples/minimal-dashboard.json` |

## Hierarquia mental (obrigatória)

```
Dashboard (u_mdash / MdashConfig)
├── configjson (settings: tabs, filtros activos, etc.)
├── MdashTab[] (opcional, multi-separadores)
├── MdashFilter[] (painel de filtros global)
├── MdashAccess[] (permissões — omitir em protótipos)
├── MdashContainer[] (rows / secções)
│   └── MdashContainerItem[] (cards na row, grid 12 colunas)
│       ├── templatelayout → layout visual do card
│       ├── slotsconfigjson → override de slots
│       └── MdashContainerItemObject[] (gráfico, tabela, texto…)
│           ├── slotid → região do layout (body, title, icon…)
│           ├── fontestamp → ligação a MDashFonte
│           └── configjson → config do tipo de objeto
└── MDashFonte[] (queries / dados partilhados)
```

## Fluxo de geração recomendado

1. **Analisar** o pedido (foto/prompt): identificar filtros, tabs, rows, cards, objetos.
2. **Gerar stamps** ≤ 25 caracteres para todos os `*stamp` (`GLOBAL.js` `generateUUID()` — ver `00-DATA-STRUCTURE-LAYER.md`).
3. **Definir** `u_mdash` + `configjson` (temfiltro, filtrohorizont, settings).
4. **Criar fontes** antes dos objetos que as referenciam.
5. **Criar containers** → **items** (com `templatelayout` correcto) → **objects** (com `slotid` + `configjson`).
6. **Ligar** foreign keys: `dashboardstamp`, `mdashcontainerstamp`, `mdashcontaineritemstamp`, `fontestamp`, `mdashtabstamp`.
7. **Validar** com `09-JSON-GENERATION-RULES.md`.
8. **Exportar** no formato de `02-IMPORT-EXPORT-JSON.md`.

## Tipos de objeto — resumo rápido

| `tipo` (usar exactamente) | Renderiza? | Precisa fonte? |
|---------------------------|------------|----------------|
| `chart` | Sim | Sim (ou transformConfig) |
| `table` | Sim | Sim |
| `list` | Sim | Sim (ou manualItems) |
| `text` | Sim | Opcional |
| `html` | Sim | Opcional |
| `customCode` | Sim | Opcional (`processaFonte: false`) |
| `TituloItem` / `title` | Sim | Não |
| `kpi` | **Não** (catálogo apenas) | — |
| `image`, `card`, `separator`, `filter` | **Não** | — |

Para KPI visual: usar `text` com `dataFormat.type: "number"` ou card `snap_card` + object `text` no slot `body`.

## Layouts de card — resumo rápido

| Código `templatelayout` | Uso típico |
|-------------------------|------------|
| `snapshot_layout_v2` | Card KPI título + valor |
| `snap_card` | KPI com ícone + footer |
| `card_standard` | Card genérico título + conteúdo |
| `brd_card_advanced_metric_primary` | Métrica com barra superior colorida |
| `plain_card` | Card sem header decorado |

Lista completa: `08-LAYOUTS-AND-SLOTS.md`.

## Relação com `docs-ai/modules/`

- `modules/` → debugging e alterações de código no builder/runtime.
- `architecture/` → **geração de dados** (JSON) para importação.

## Ficheiros fonte no código (referência humana)

- **SQL / estrutura BD:** `SQL/MDash tables.sql` → `00-DATA-STRUCTURE-LAYER.md`
- **Stamps:** `GLOBAL.js` `generateUUID()` (trunca a 25 chars)
- Modelos: `js/MDash config lib.js` (constructors `Mdash*`, `MDashFonte`)
- Object types / render: `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js` → `12-DESIGN-ASSETS-MAP.md`
- Layouts built-in: `getDefaultLayoutDefinitions()` no extension
- Layout builder: `js/Mdash Layout Builder.js`
- Import/export: `buildMDashConfigData()`, `exportarConfiguracaoMDashboard()` em `MDash config lib.js`

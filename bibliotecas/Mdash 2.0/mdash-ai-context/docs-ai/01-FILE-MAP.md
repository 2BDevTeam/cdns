# 01 - Mapa de ficheiros MDash 2.0

## Ficheiros principais

| Área | Ficheiro | Quando abrir |
|---|---|---|
| Configuração/builder | `js/MDash config lib.js` | CRUD de dashboard, containers, items, objetos, fontes, tabs, filtros, drag/drop, propriedades |
| Render final | `p#U00e1ginas de internet/Mdash.html` | Problemas no dashboard renderizado ao utilizador final |
| Tipos de objeto/renderers | `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js` | Cards, tabela, gráfico, custom code, propriedades inline dos objetos |
| Fontes/client DB/cache local | `js/DATA SOURCE Operations.js` | IndexedDB/alasql, cache de fontes, query local, data source builder |
| SQL adapter | `js/SQLADAPTER.js` | Converter SQL Server ↔ SQLite/alasql |
| Layout builder | `js/Mdash Layout Builder.js` | Editor visual de layouts/templates/slots/CDNs |
| Funções default | `js/MDASH DEFAULT FUNCTIONS.js` | Helpers default pequenos |
| Main loader | `js/MDASH-MAIN.js` | Entrada/carregamento inicial |

## Documentação para geração JSON por IA

| Pasta/ficheiro | Uso |
|---|---|
| `docs-ai/architecture/00-README.md` | Entrada: hierarquia dashboard, índice de specs |
| `docs-ai/architecture/02-IMPORT-EXPORT-JSON.md` | Formato exacto do ficheiro importável |
| `docs-ai/architecture/03-FILTERS.md` … `08-LAYOUTS-AND-SLOTS.md` | Propriedades por componente |
| `docs-ai/architecture/09-JSON-GENERATION-RULES.md` | Regras anti-alucinação |
| `docs-ai/architecture/10-PROMPT-GUIDE.md` | Prompts foto/texto → JSON |
| `docs-ai/architecture/examples/minimal-dashboard.json` | Exemplo importável |

## Documentação existente útil

| Documento | Uso |
|---|---|
| `Cache Architecture.md` | Entender cache distribuído e CDC |
| `DRAG-DROP-ARCHITECTURE.md` | Entender drag/drop |
| `docs/OBJECT-TYPE-DEVELOPMENT-GUIDE.md` | Criar novo tipo de objeto |
| `docs/TABLE-FILTERS-ARCHITECTURE.md` | Filtros da tabela |
| `docs/FILTROS-*.md` | Casos específicos de filtros |

## Não abrir por defeito
- `js/backups/*`: são cópias antigas; só abrir para recuperar código ou comparar regressão.
- `rascunhos/*`: protótipos/experiências.
- `samples/*`: exemplos.
- `.git/*`: ignorar.

## Anchors úteis por ficheiro

### `js/MDash config lib.js`
- Globais e estado: linhas 20-60.
- Clipboard/multiseleção: 69-710.
- Erros de fonte/render: 777-1053.
- Modelos principais: 1066-2234.
- Expressões/tokens/fontes: 2443-2590.
- Export/import/preview: 2590-2731.
- Sincronização realtime: 2795-3173.
- CDNs e layout unificado: 3182-3906.
- UI moderna/builder: 3963+.
- Painéis de propriedades/fontes: 5240+.

### `p#U00e1ginas de internet/Mdash.html`
- Helpers de render/card/layout: 2220-2425.
- Modelos runtime: 2434-3180.
- Estado reativo/filtros/tabs/fontes: 3260-3920.
- Pipeline de fontes/bootstrap final: 3960-4205.

### `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js`
- Estilos globais: 1-199.
- Cards/snapshots: 200-497.
- Custom Code: 498-927.
- Tabela/Tabulator: 928-2997.
- Gráficos/ECharts: 2998-4357.
- Multi-chart/advanced config: 4357+.

### `js/DATA SOURCE Operations.js`
- IndexedDB/alasql básico: 13-207.
- Cache de fonte: 207-411.
- Extensão de prototype de fonte: 452-552.
- SQL builder/data source designer: 553-1354.

### `js/Mdash Layout Builder.js`
- Estado/estilos/galeria: 29-305.
- Ace editors e preview: 320-512.
- CDN manager: 604-666.
- CRUD layout: 666-851.
- Template HBF/default: 851-955.
- Modal layout builder/eventos: 955-1223.
- Slot mode/badges/detected slots: 1223-1816.
- Import/export layouts: 1816-1964.

### `js/SQLADAPTER.js`
- Parsing helpers: 64-394.
- Regras/adapters: 500-965.
- Factory/export: 965-1004.

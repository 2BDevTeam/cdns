# Fluxo de decisão — foto ou prompt → JSON

Usar **sempre** as 3 camadas (`11-THREE-LAYERS-MODEL.md`) em cada decisão.

## Passo 0 — Ler estrutura BD

1. `00-DATA-STRUCTURE-LAYER.md`
2. `SQL/MDash tables.sql` se dúvida em coluna
3. Gerar stamps com **≤ 25 caracteres** (`GLOBAL.js` `generateUUID()`)

## Passo 1 — Decompor a imagem/prompt

```
Dashboard
├── Settings (u_mdash.configjson, temfiltro, …)
├── Filtros? (barra topo)
├── Tabs? (labels horizontais)
└── Para cada secção vertical:
    └── Container (row)
        └── Items (cards) com tamanho 1–12
            ├── templatelayout (design do card)
            └── Objects por slot (conteúdo)
```

## Passo 2 — Por elemento visual

### Barra de filtros

| Camada | Acção |
|--------|-------|
| Structure | `MdashFilter` × N; `u_mdash.temfiltro=true`, `filtrohorizont=true` |
| Logic | `expressaolistagem` + `campooption`/`campovalor`; `parametrosjson` nas fontes |
| Design | `tamanho` 2–4 por filtro; tipos `list`/`text`/`date` |

### Tab "Vendas", "Clientes", …

| Camada | Acção |
|--------|-------|
| Structure | `MdashTab` + `configjson.activarMultiSeparadores` |
| Logic | `MdashContainer.mdashtabstamp`, filtros `escopo:tab` |
| Design | `icone` glyphicon; cores em tab `configjson` |

### Caixa com número grande (KPI)

| Camada | Acção |
|--------|-------|
| Design | `snap_card` ou `snapshot_layout_v2` ou `brd_card_advanced_metric_*` |
| Structure | Item + objects: `TituloItem`→`title`, `text`→`body` |
| Logic | Fonte `SELECT SUM(x) AS total …` uma linha; `dataField: "total"` |

### Gráfico de barras/linhas/pizza

| Camada | Acção |
|--------|-------|
| Design | `card_standard` ou `plain_card`; object `chart` ou `pie` |
| Structure | `configjson` de `_MCHART_SAMPLE_CONFIG` (só campos necessários) |
| Logic | Fonte agrupada; `xField`, `series[].field` = colunas reais |

### Tabela de dados

| Camada | Acção |
|--------|-------|
| Design | `theme: "corporate"`; `styling` header |
| Structure | `tipo: "table"`, `autoColumns: true` ou `columns[]` explícito |
| Logic | Fonte com todas as colunas; `refreshmode: onfilterchange` |

### Lista / ranking

| Camada | Acção |
|--------|-------|
| Design | `listStyle: "numbered"` ou `"timeline"` |
| Structure | `tipo: "list"` |
| Logic | `labelField`, `badgeField` = campos SQL |

### Card com visual não listado

```
┌─ Existe layout built-in similar? ── SIM → templatelayout (08-LAYOUTS)
│
└─ NÃO ─┬─ Ajuste só cores? → built-in + slotsconfigjson.config
        │
        └─ Forma diferente? → MdashContainerItemLayout (html+css+slots)
                              templatelayout: custom_<stamp25>
```

### Gráfico/widget que não existe no catálogo

```
┌─ Aproxima chartType ECharts standard? ── SIM → chart + config
│
└─ NÃO ─┬─ html estático? → tipo html + Handlebars
        │
        └─ Interactivo / lib externa? → customCode
              processaFonte: false
              code: inicializa lib em $container
              cssCode: se necessário
              fetchData() para dados
```

**Nunca** criar `tipo: "radar"` ou `tipo: "kpi"`.

## Passo 3 — Fontes antes de objectos

1. Listar dados necessários por widget
2. Unificar em fontes `scope: global` quando possível
3. `parametrosjson` alinhado com filtros (`filterstamp` = stamp 25 chars)
4. Só depois `fontestamp` nos objectos

## Passo 4 — Validar mínimo

- [ ] Stamps ≤ 25 caracteres
- [ ] Nenhum campo fora do SQL
- [ ] `configjson` ⊆ sample config
- [ ] `templatelayout` existe ou `custom_<stamp>` com layout record
- [ ] Tipos objecto/filtro ∈ listas permitidas

## Passo 5 — Output

1. Resumo por camada (Structure / Logic / Design) — 1 parágrafo
2. JSON `02-IMPORT-EXPORT-JSON.md`
3. Notas: SQL a validar, layouts custom sugeridos

## Prompt template (copiar)

```
Analisa [foto/descrição].

Para cada elemento, indica:
- Structure: tabela + campos SQL
- Logic: fontes, SQL, ligação filtros
- Design: templatelayout / tipo objecto / ficheiro CSS de referência (12-DESIGN-ASSETS-MAP.md)

Stamps: máximo 25 caracteres (estilo generateUUID GLOBAL.js).
Não inventar tipos nem campos config — usar sample configs.

Gera JSON importável.
```

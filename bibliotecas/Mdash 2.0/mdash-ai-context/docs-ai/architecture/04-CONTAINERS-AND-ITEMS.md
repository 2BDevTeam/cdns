# MdashContainer e MdashContainerItem

## MdashContainer (row / secção)

Tabela: `MdashContainer` — PK: `mdashcontainerstamp`

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `mdashcontainerstamp` | string UUID | auto | PK |
| `dashboardstamp` | string UUID | — | Dashboard pai |
| `mdashtabstamp` | string | `""` | Tab (se multi-separadores) |
| `codigo` | string | `""` | Identificador interno |
| `titulo` | string | `""` | Título da secção (header opcional) |
| `tipo` | string | `""` | Tipo livre / legacy |
| `tamanho` | number 1–12 | `12` | Largura (quase sempre 12 = full width) |
| `layoutmode` | string | `"auto"` | `"auto"` ou `"manual"` |
| `ordem` | number | auto | Ordem vertical no dashboard |
| `inactivo` | boolean | `false` | Ocultar secção |

### `layoutmode` do container

| Valor | Comportamento |
|-------|---------------|
| `auto` | Items fluem em rows; `tamanho` soma 12 por linha |
| `manual` | Grid CSS; items usam `gridrow`, `gridcolstart` |

## MdashContainerItem (card na row)

Tabela: `MdashContainerItem` — PK: `mdashcontaineritemstamp`

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `mdashcontaineritemstamp` | string UUID | auto | PK |
| `mdashcontainerstamp` | string UUID | — | Container pai |
| `dashboardstamp` | string UUID | — | Dashboard |
| `codigo` | string | `""` | Código interno |
| `titulo` | string | `""` | Título do card (usado por `TituloItem` e layouts) |
| `tipo` | string | `""` | Legacy / classificação |
| `inactivo` | boolean | `false` | Ocultar item |
| `tamanho` | number 1–12 | `4` | Colunas Bootstrap (3 cards = 4+4+4) |
| `layoutmode` | string | `"inherit"` | `inherit`, `auto`, `manual` |
| `gridrow` | number \| null | `null` | Linha no grid manual |
| `gridcolstart` | number \| null | `null` | Coluna inicial (1–12) |
| `gridrowspan` | number | `1` | Altura em linhas |
| `ordem` | number | auto | Ordem dentro do container |
| `templatelayout` | string | primeiro layout | **Código** do layout visual |
| `layoutcontaineritemdefault` | boolean | `true` | Usar template default vs expressão custom |
| `expressaolayoutcontaineritem` | string | `""` | HTML/JS custom se não default |
| `fontelocal` | boolean | `false` | Fonte local ao item |
| `urlfetch` | string | `getdbcontaineritemdata` | Endpoint fetch legacy |
| `expressaodblistagem` | string | `""` | SQL legacy do item |
| `expressaoapresentacaodados` | string | `""` | JS apresentação legacy |
| `slotsconfigjson` | string JSON | `'[]'` | Override de slots (ver layouts doc) |

**Não incluir** em import: `filters`, `records`, `dadosTemplate`, `slotsconfig` (runtime).

### Escolha de `tamanho` (exemplos de foto)

| Layout na foto | `tamanho` por card |
|----------------|-------------------|
| 4 KPIs numa linha | `3` cada (3×4=12) |
| 3 KPIs | `4` cada |
| 2 metades | `6` cada |
| 1 gráfico full width | `12` |
| 2/3 gráfico + 1/3 lista | `8` + `4` |

### `templatelayout`

String com código de layout built-in ou `custom_<mdashcontaineritemlayoutstamp>`.

Ver lista completa em `08-LAYOUTS-AND-SLOTS.md`.

## Exemplo — row com 3 KPIs

```json
{
  "mdashcontainerstamp": "CONT-001",
  "dashboardstamp": "DASH-UUID",
  "titulo": "Indicadores",
  "tamanho": 12,
  "layoutmode": "auto",
  "ordem": 1,
  "mdashtabstamp": ""
}
```

Items (3× `tamanho: 4`):

```json
{
  "mdashcontaineritemstamp": "ITEM-001",
  "mdashcontainerstamp": "CONT-001",
  "titulo": "Vendas",
  "tamanho": 4,
  "templatelayout": "snap_card",
  "ordem": 1,
  "slotsconfigjson": "[]"
}
```

## slotsconfigjson

Array JSON stringificado de overrides por slot:

```json
[
  {
    "id": "title",
    "label": "Título",
    "type": "text",
    "isMainContent": false,
    "config": { "cssClass": "", "inlineStyle": "", "hidden": false }
  },
  {
    "id": "body",
    "label": "Corpo",
    "type": "content",
    "isMainContent": true,
    "config": { "minHeight": "120px" }
  }
]
```

Só incluir se precisar override; `[]` é válido (usa defaults do template).

## Mapeamento foto → estrutura

| Na foto | Entidade |
|---------|----------|
| Barra de filtros no topo | `MdashFilter[]` + `temfiltro` |
| Tabs "Vendas", "Clientes" | `MdashTab[]` + containers com `mdashtabstamp` |
| Secção com título | `MdashContainer.titulo` |
| Cada card/caixa | `MdashContainerItem` |
| Gráfico dentro do card | `MdashContainerItemObject` tipo `chart` no slot `body` |
| Número grande no card | `text` ou layout snapshot + `text` no `body` |
| Tabela full page | Item `tamanho:12`, object `table` |

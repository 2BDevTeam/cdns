# Layouts, slots e cards custom

## Conceito

1. **`MdashContainerItem.templatelayout`** — código do template visual do card.
2. **Template** — HTML (`htmltemplate`) com `data-mdash-slot="id"`.
3. **Slots** — regiões onde objectos são montados (`MdashContainerItemObject.slotid`).
4. **`slotsconfigjson`** — override de estilo/comportamento por slot no item.

Layouts built-in estão em `getDefaultLayoutDefinitions()` (`TEMPLATE DASHBOARD STANDARD EXTENSION.js`).  
Layouts custom na BD: `MdashContainerItemLayout` → código runtime `custom_<stamp>`.

## Built-in layout codes (usar em `templatelayout`)

### Snapshots (KPI / resumo)

| codigo | Descrição | Slots |
|--------|-----------|-------|
| `snapshot_layout_v1` | Snapshot v1 | `title`, `body` |
| `snapshot_layout_v1_warning` | v1 warning | `title`, `body` |
| `snapshot_layout_v2` | Snapshot v2 | `title`, `body` |
| `snapshot_card_warning` | Snap warning | `title`, `icon`, `body`, `footer` |
| `snap_card` | Snap card | `title`, `icon`, `body`, `footer` |
| `snap_card_success` | Snap success | idem |
| `snapshot_card_danger` | Snap danger | idem |

### Cards

| codigo | Descrição | Slots |
|--------|-----------|-------|
| `card_standard` | Card standard | `title`, `body` |
| `card_header_highlighted` | Header destacado | `title`, `body` |
| `plain_card` | Plain card | `body` |

### BRD Metric (barra superior colorida)

`brd_card_advanced_metric_primary`, `_success`, `_warning`, `_danger`, `_yellow`, `_black`  
Slots: `title`, `icon`, `body`

### BRD Status

`brd_card_advanced_status_primary`, `_success`, `_warning`, `_danger`, `_yellow`, `_black`  
Slots: `title`, `icon`, `body`, `status-badge`

### BRD Alert

`brd_card_advanced_alert_primary`, `_success`, `_warning`, `_danger`, `_yellow`, `_black`  
Slots: `title`, `icon`, `body`

### Fallback (se extension não carregar)

`template_kpi`, `template_table`, `template_chart`

## Slot definition (JSON)

```json
{
  "id": "body",
  "label": "Corpo",
  "type": "content",
  "isMainContent": true
}
```

| Campo | Valores | Descrição |
|-------|---------|-----------|
| `id` | string | ID único no template; vira `data-mdash-slot` |
| `label` | string | Label no builder |
| `type` | `text`, `icon`, `content`, `html` | Tipo de slot |
| `isMainContent` | boolean | Slot principal se `slotid` vazio |

### Tipos de slot

| type | Conteúdo típico |
|------|-----------------|
| `text` | `TituloItem` ou `text` estático |
| `icon` | `html` com ícone ou glyphicon |
| `content` | `chart`, `table`, `list`, KPI `text` |
| `html` | `html` ou `customCode` |

## Mapeamento foto → layout

| Aspeto visual na foto | `templatelayout` sugerido |
|-----------------------|---------------------------|
| KPI simples título + número | `snapshot_layout_v2` |
| KPI com ícone e rodapé | `snap_card` |
| Card com header colorido | `card_header_highlighted` |
| Métrica com linha colorida no topo | `brd_card_advanced_metric_primary` |
| Alerta / estado | `brd_card_advanced_alert_warning` |
| Área de conteúdo sem moldura fancy | `plain_card` |
| Tabela ou gráfico grande | `card_standard` ou `plain_card` com `tamanho:12` |

Variante de cor: trocar sufixo `_primary` → `_success`, `_warning`, `_danger`.

## Card que "não existe" — criar layout custom

Quando o user pede um card com design novo não listado acima:

### Opção A — Reutilizar built-in mais próximo

Preferir sempre que possível (menos erros na importação).

### Opção B — `MdashContainerItemLayout` + import separado

Registo na tabela `MdashContainerItemLayout`:

| Campo | Descrição |
|-------|-----------|
| `mdashcontaineritemlayoutstamp` | UUID |
| `codigo` | Código legível |
| `descricao` | Nome |
| `layoutsystem` | `HBF` |
| `htmltemplate` | HTML com `data-mdash-slot` |
| `csstemplate` | CSS scoped |
| `jstemplate` | JS opcional |
| `slotsdefinition` | JSON array de slots |
| `categoria` | `snapshot`, `card`, `chart`, `table`, `custom` |
| `ispublic` | `true` para aparecer no picker |
| `inactivo` | `false` |

Item usa: `templatelayout: "custom_<mdashcontaineritemlayoutstamp>"`

### Template HTML mínimo (HBF)

```html
<div class="my-card">
  <div class="my-card__header" data-mdash-slot="title"></div>
  <div class="my-card__icon" data-mdash-slot="icon"></div>
  <div class="my-card__body" data-mdash-slot="body"></div>
  <div class="my-card__footer" data-mdash-slot="footer"></div>
</div>
```

### slotsdefinition exemplo

```json
[
  { "id": "title", "label": "Título", "type": "text" },
  { "id": "icon", "label": "Ícone", "type": "icon" },
  { "id": "body", "label": "Conteúdo", "type": "content", "isMainContent": true },
  { "id": "footer", "label": "Rodapé", "type": "text" }
]
```

**Nota:** Layouts custom **não** vêm no export padrão do dashboard. Para import completo com layout novo, incluir bloco extra em `config`:

```json
{
  "sourceTable": "MdashContainerItemLayout",
  "sourceKey": "mdashcontaineritemlayoutstamp",
  "records": [ /* layout */ ]
}
```

(Confirmar suporte no script `actualizaconfiguracaomrelatorio` no ambiente PHC.)

### Opção C — `expressaolayoutcontaineritem`

Se `layoutcontaineritemdefault: false`, HTML/JS custom no item (avançado; evitar em geração automática).

## slotsconfigjson — override por item

```json
[
  {
    "id": "body",
    "label": "Corpo",
    "type": "content",
    "isMainContent": true,
    "config": {
      "minHeight": "200px",
      "padding": "12px",
      "overflow": "auto",
      "background": "#f8fafc"
    }
  }
]
```

Campos `config` suportados: `cssClass`, `inlineStyle`, `minHeight`, `maxHeight`, `overflow`, `background`, `padding`, `hidden`.

## Receita: KPI card completo

**Item:**

```json
{
  "titulo": "Vendas",
  "tamanho": 3,
  "templatelayout": "snap_card",
  "slotsconfigjson": "[]"
}
```

**Objects:**

1. `tipo: "TituloItem"`, `slotid: "title"`, `processaFonte: false`
2. `tipo: "text"`, `slotid: "body"`, `fontestamp: "..."`, `configjson` com `dataField` + `dataFormat.type: "currency"`
3. (Opcional) `tipo: "html"`, `slotid: "footer"`, texto variação %

## containerSelectorToRender

Built-in usa `'[data-mdash-slot="body"]'` para skeleton/loading. IA não precisa definir — vem do template.

# MdashFilter — especificação completa

Filtros do painel superior/lateral do dashboard (`MdashFilter`).

## Tabela SQL

`MdashFilter` — PK: `mdashfilterstamp`

## Propriedades

| Campo | Tipo | Default | Obrigatório | Descrição |
|-------|------|---------|-------------|-----------|
| `mdashfilterstamp` | string UUID | `generateUUID()` | Sim | Identificador único |
| `dashboardstamp` | string UUID | `GMDashStamp` | Sim | Dashboard pai |
| `codigo` | string | `""` | **Sim** | Chave no DOM e em `filterValues` (único no dashboard) |
| `descricao` | string | `""` | Sim | Label visível |
| `tipo` | string | `"text"` | Sim | Tipo de controlo UI |
| `tamanho` | number 1–12 | `4` | Não | Largura na grelha (filtros horizontais) |
| `expressaolistagem` | string | `""` | Condicional | SQL para opções (`list`, `radio`, `multiselect`) |
| `expressaojslistagem` | string | `""` | Não | JS alternativo para opções |
| `eventochange` | boolean | `false` | Não | Executa script ao mudar |
| `expressaochange` | string | `""` | Não | JavaScript executado no change |
| `valordefeito` | string | `""` | Não | Valor inicial (pode ser expressão JS) |
| `campooption` | string | `""` | Condicional | Campo do row para label (list/radio/multiselect) |
| `campovalor` | string | `""` | Condicional | Campo do row para value |
| `escopo` | string | `"global"` | Sim | `"global"` ou `"tab"` |
| `mdashtabstamp` | string | `""` | Se escopo tab | Separadores onde o filtro aparece (CSV de `mdashtabstamp`) |
| `ordem` | number | auto | Sim | Ordem visual (1, 2, 3…) |
| `inactivo` | boolean | — | Não | Existe na BD; não no constructor JS |

## Valores permitidos — `tipo`

| Valor | UI | Notas |
|-------|-----|-------|
| `text` | Input texto | Livre |
| `digit` | Input texto (numérico) | Tratado como texto no runtime |
| `date` | Date picker | Formato PT |
| `number` | Número | Form config UI |
| `logic` | Toggle/checkbox | Valor boolean |
| `radio` | Radio group | Requer `expressaolistagem` + campos option/valor |
| `list` | Select simples | Requer opções |
| `multiselect` | Select múltiplo | Array de valores |

**Não inventar** outros valores de `tipo`.

## Valores permitidos — `escopo`

| Valor | Comportamento |
|-------|---------------|
| `global` | Visível em todas as tabs |
| `tab` | Só nos separadores listados em `mdashtabstamp` (vários, separados por vírgula) |

## Dashboard deve ter

```json
{
  "temfiltro": true,
  "filtrohorizont": true
}
```

em `u_mdash` para mostrar filtros em barra horizontal (típico em dashboards analíticos).

## Exemplo — filtro texto

```json
{
  "mdashfilterstamp": "f1a2b3c4-0001-4000-8000-000000000001",
  "dashboardstamp": "DASH-UUID",
  "codigo": "filtro_cliente",
  "descricao": "Cliente",
  "tipo": "text",
  "tamanho": 3,
  "expressaolistagem": "",
  "expressaojslistagem": "",
  "eventochange": false,
  "expressaochange": "",
  "valordefeito": "",
  "campooption": "",
  "campovalor": "",
  "escopo": "global",
  "mdashtabstamp": "",
  "ordem": 1,
  "table": "MdashFilter",
  "idfield": "mdashfilterstamp",
  "localsource": "GMDashFilters"
}
```

## Exemplo — filtro lista (SQL)

```json
{
  "codigo": "filtro_ano",
  "descricao": "Ano",
  "tipo": "list",
  "tamanho": 2,
  "expressaolistagem": "SELECT ano AS valor, CAST(ano AS VARCHAR) AS opcao FROM anos ORDER BY ano DESC",
  "campooption": "opcao",
  "campovalor": "valor",
  "valordefeito": "",
  "escopo": "global",
  "ordem": 2
}
```

## Ligação a fontes (`MDashFonte.parametros`)

Parâmetros de fonte podem mapear a filtros:

```json
{
  "token": "@ano",
  "source": "filter",
  "filterstamp": "<mdashfilterstamp>",
  "defaultValue": "2026"
}
```

Token substituído em `expressaolistagem` da fonte.

## Erros comuns de IA

| Erro | Correcto |
|------|----------|
| `type` em vez de `tipo` | `tipo` |
| `filterType: "dropdown"` | `tipo: "list"` |
| `width` em vez de `tamanho` | `tamanho` (1–12) |
| `name` em vez de `codigo` | `codigo` |
| Filtro sem `codigo` único | `codigo` obrigatório e único |
| `escopo: "local"` | `global` ou `tab` |

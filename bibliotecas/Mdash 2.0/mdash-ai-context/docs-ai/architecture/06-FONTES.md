# MDashFonte — fontes de dados

Tabela SQL: `MDashFonte` (capital **D** em Dash) — PK: `mdashfontestamp`

## Propriedades

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `mdashfontestamp` | string UUID | auto | PK |
| `dashboardstamp` | string UUID | — | Dashboard pai |
| `codigo` | string | `"Fonte" + id` | Identificador legível |
| `descricao` | string | auto | Nome na UI |
| `ordem` | number | auto | Ordem na lista |
| `inactivo` | boolean | `false` | Desactivar fonte |
| `scope` | string | `'global'` | Âmbito de visibilidade |
| `scopestamp` | string | `''` | Stamp do scope (container/item/object) |
| `tipo` | string | `'directquery'` | Modo de obtenção de dados |
| `expressaolistagem` | string | `''` | SQL (directquery) ou JS (javascript) |
| `urlfetch` | string | `getdbcontaineritemdata` | Endpoint PHC |
| `expressaojslistagem` | string | `''` | JS alternativo |
| `apiurl` | string | `''` | URL (tipo api) |
| `apimethod` | string | `'GET'` | HTTP method |
| `apiheadersjson` | string | `'{}'` | Headers API |
| `apibodyjson` | string | `'{}'` | Body API |
| `schemamode` | string | `'auto'` | `auto` ou `manual` |
| `schemajson` | string | `'[]'` | Schema colunas |
| `parametrosjson` | string | `'[]'` | Parâmetros dinâmicos |
| `refreshmode` | string | `'onload'` | Quando recarregar |
| `refreshintervalsec` | number | `0` | Intervalo se `interval` |
| `lastResultscached` | string | `'[]'` | Cache (export pode incluir vazio) |

## scope — valores

| Valor | Uso |
|-------|-----|
| `global` | Partilhada no dashboard inteiro |
| `container` | `scopestamp` = `mdashcontainerstamp` |
| `containeritem` | `scopestamp` = `mdashcontaineritemstamp` |
| `object` | `scopestamp` = `mdashcontaineritemobjectstamp` |

Para protótipos gerados por IA: preferir `global` com nomes claros (`fonte_vendas`, `fonte_clientes`).

## tipo — valores

| Valor | Descrição |
|-------|-----------|
| `directquery` | SQL em `expressaolistagem` |
| `javascript` | JS em `expressaojslistagem` |
| `api` | HTTP externo |
| `stored` | Resultado guardado |

## refreshmode — valores

`onload`, `onfilterchange`, `manual`, `interval`

## parametrosjson — estrutura

Array JSON stringificado:

```json
[
  {
    "token": "@cliente",
    "source": "filter",
    "filterstamp": "<mdashfilterstamp>",
    "defaultValue": ""
  },
  {
    "token": "@ano",
    "source": "parameter",
    "defaultValue": "2026"
  }
]
```

| `source` | Descrição |
|----------|-----------|
| `filter` | Valor do `MdashFilter` com `filterstamp` |
| `parameter` | Valor fixo/default |

Tokens substituídos em `expressaolistagem` como `@cliente`, `@ano`.

## Exemplo — SQL global

```json
{
  "mdashfontestamp": "FONTE-001",
  "dashboardstamp": "DASH-UUID",
  "codigo": "fonte_vendas_mensal",
  "descricao": "Vendas por mês",
  "scope": "global",
  "scopestamp": "",
  "tipo": "directquery",
  "expressaolistagem": "SELECT MONTH(data) AS mes, SUM(valor) AS total FROM vendas WHERE ano = @ano GROUP BY MONTH(data)",
  "parametrosjson": "[{\"token\":\"@ano\",\"source\":\"filter\",\"filterstamp\":\"FILTRO-ANO-UUID\",\"defaultValue\":\"2026\"}]",
  "refreshmode": "onfilterchange",
  "schemajson": "[]",
  "ordem": 1,
  "table": "MDashFonte",
  "idfield": "mdashfontestamp",
  "localsource": "GMDashFontes"
}
```

## Ligação objecto → fonte

No `MdashContainerItemObject`:

```json
{
  "fontestamp": "FONTE-001",
  "processaFonte": true
}
```

Múltiplas fontes: `fontesstampsjson: "[\"FONTE-002\"]"`.

## transformConfig vs fonte

| Cenário | Usar |
|---------|------|
| SQL directo, objecto mostra tudo | Só `fontestamp` |
| Agregar/filtrar no objecto | `transformconfigjson` com `sourceTable` = tabela da fonte |
| Objecto estático | `processaFonte: false`, sem fonte |

## Erros comuns de IA

| Erro | Correcto |
|------|----------|
| `MdashFonte` | `MDashFonte` (tabela) |
| `query` em vez de `expressaolistagem` | `expressaolistagem` |
| `sql` campo separado | dentro de `expressaolistagem` |
| `parameters` array object | `parametrosjson` string |
| Fonte sem `dashboardstamp` | sempre preencher FK |

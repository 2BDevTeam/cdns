# Tabs, Access e configuração do dashboard

## MdashTab

Tabela: `MdashTab` — PK: `mdashtabstamp`

| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `mdashtabstamp` | string UUID | auto | PK |
| `dashboardstamp` | string UUID | — | Dashboard |
| `titulo` | string | `'Nova Aba'` | Texto na tab |
| `icone` | string | `'glyphicon glyphicon-list-alt'` | Classe glyphicon |
| `configjson` | string JSON | `'{}'` | Cores/fonte da tab |
| `ordem` | number | auto | Ordem left-to-right |
| `inactivo` | boolean | `false` | Ocultar tab |

### configjson da tab (opcional)

```json
{
  "cor": "#ffffff",
  "corIcone": "default",
  "corTexto": "default",
  "tooltip": "Descrição longa"
}
```

`cor` / `corIcone` / `corTexto`: tipo PHC (`primary`, `success`, `warning`, `danger`) ou hex.

### Activar multi-separadores

Em `u_mdash.configjson`:

```json
{
  "activarMultiSeparadores": true,
  "activeTabStamp": "<mdashtabstamp da primeira tab>"
}
```

Containers e filtros com `mdashtabstamp` aparecem só nessa tab.

## MdashAccess (opcional em protótipos)

Tabela: `MdashAccess` — PK: `mdashaccessstamp`

| Campo | Tipo | Default |
|-------|------|---------|
| `mdashaccessstamp` | string UUID | auto |
| `dashboardstamp` | string UUID | — |
| `codigo` | string | `""` |
| `nome` | string | — |
| `descricao` | string | — |
| `origem` | string | `"phc"` |
| `escopo` | string | `"global"` |
| `mdashtabstamp` | string | `""` |
| `pfstamp` | string | `""` |
| `ordem` | number | auto |
| `inactivo` | boolean | `false` |

`origem`: `phc`, `nativo`  
`escopo`: `global`, `tab`

**Para JSON gerado por IA:** omitir `MdashAccess` ou array vazio — permissões configuram-se no PHC depois.

## Dashboard sem tabs

- `configjson.activarMultiSeparadores: false`
- Todos `mdashtabstamp: ""` em containers/filtros
- Não criar registos `MdashTab`

## Dashboard com tabs (exemplo foto)

Tabs: Resumo, Vendas, Clientes

```json
{
  "mdashtabstamp": "TAB-RESUMO",
  "titulo": "Resumo",
  "icone": "glyphicon glyphicon-home",
  "ordem": 1,
  "configjson": "{}"
}
```

Container só na tab Vendas:

```json
{
  "mdashtabstamp": "TAB-VENDAS",
  "titulo": "Vendas"
}
```

## Filtros por tab

```json
{
  "escopo": "tab",
  "mdashtabstamp": "TAB-VENDAS",
  "codigo": "filtro_vendedor",
  "descricao": "Vendedor"
}
```

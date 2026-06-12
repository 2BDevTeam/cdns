# Modelo de dados do Dashboard

Documentação exacta dos registos que compõem um dashboard MDash 2.0 importável.

## Tabela `u_mdash` — `MdashConfig`

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `u_mdashstamp` | string (≤25 chars) | Sim | — | PK do dashboard |
| `codigo` | string | Sim | `""` | Código único (usado na URL do viewer) |
| `descricao` | string | Sim | `""` | Título visível |
| `temfiltro` | boolean | Não | `false` | Activa painel de filtros no viewer |
| `filtrohorizont` | boolean | Não | `false` | `true` = filtros em barra horizontal; `false` = sidebar |
| `categoria` | string | Não | `""` | Agrupamento no catálogo PHC |
| `configjson` | string JSON | Não | `'{}'` | Settings do dashboard (ver abaixo) |

### Conteúdo típico de `configjson`

Guardado como string JSON. Campos usados pelo runtime:

| Campo em `configjson` | Tipo | Default | Descrição |
|-----------------------|------|---------|-----------|
| `activarMultiSeparadores` | boolean | `false` | Activa tabs no topo |
| `activeTabStamp` | string | `""` | Tab activa por defeito (`mdashtabstamp`) |
| `tabOverflowMode` | string | `"squeeze"` | `"squeeze"` ou `"wrap"` |
| `tabWrapAfterCount` | number | `5` | Tabs por linha quando wrap (1–20) |

**Exemplo:**

```json
{
  "activarMultiSeparadores": true,
  "activeTabStamp": "TAB-UUID-AQUI",
  "tabOverflowMode": "squeeze",
  "tabWrapAfterCount": 8
}
```

## Relações entre entidades

| Filho | Campo FK | Pai |
|-------|----------|-----|
| `MdashTab` | `dashboardstamp` | `u_mdashstamp` |
| `MdashFilter` | `dashboardstamp` | `u_mdashstamp` |
| `MdashAccess` | `dashboardstamp` | `u_mdashstamp` |
| `MdashContainer` | `dashboardstamp` | `u_mdashstamp` |
| `MdashContainer` | `mdashtabstamp` | `mdashtabstamp` (opcional) |
| `MdashContainerItem` | `dashboardstamp` | `u_mdashstamp` |
| `MdashContainerItem` | `mdashcontainerstamp` | `mdashcontainerstamp` |
| `MdashContainerItemObject` | `dashboardstamp` | `u_mdashstamp` |
| `MdashContainerItemObject` | `mdashcontaineritemstamp` | `mdashcontaineritemstamp` |
| `MDashFonte` | `dashboardstamp` | `u_mdashstamp` |
| `MdashFilter` | `mdashtabstamp` | tab (se `escopo: "tab"`) |

## Grid de 12 colunas

- `MdashContainer.tamanho` e `MdashContainerItem.tamanho`: inteiro **1–12** (soma por row ≤ 12 em modo auto).
- `ordem`: inteiro; define sequência visual (filtros, containers, items, objects, tabs).

## Campos de metadata CRUD (não omitir na importação)

Cada registo pode incluir (o builder usa):

| Campo | Valor típico |
|-------|----------------|
| `table` | Nome da tabela SQL |
| `idfield` | Nome da PK |
| `localsource` | Array global no JS (`GMDashFilters`, etc.) |

## Ordem de criação no JSON

1. `u_mdash`
2. `MdashTab` (se multi-separadores)
3. `MDashFonte`
4. `MdashFilter`
5. `MdashContainer`
6. `MdashContainerItem`
7. `MdashContainerItemObject`
8. `MdashAccess` (opcional)

## Stamps (PK/FK)

- Cada `*stamp` = string **≤ 25 caracteres** (`VARCHAR(25)` na BD).
- Gerar com `generateUUID()` em `GLOBAL.js` (UUID truncado a 25 chars).
- **Reutilizar** o mesmo valor em todas as FKs que apontam para esse registo.
- Ver `00-DATA-STRUCTURE-LAYER.md`.
- `dashboardstamp` = `u_mdashstamp` em todos os filhos.

## O que NÃO vai no export/import padrão

- `MdashContainerItemLayout` (layouts custom globais) — carregados do servidor; layouts built-in referenciados só por `codigo` em `templatelayout`.
- Campos runtime: `records`, `dadosTemplate`, `lastResults`, `status`, `schema` (arrays em memória).

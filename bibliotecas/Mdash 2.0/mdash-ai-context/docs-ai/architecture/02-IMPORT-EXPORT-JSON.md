# Formato JSON de importação/exportação

Formato exacto usado por `exportarConfiguracaoMDashboard()` e `importarConfiguracaoDashboard()` em `MDash config lib.js`.

## Estrutura raiz do ficheiro

```json
{
  "relatoriostamp": "<u_mdashstamp>",
  "config": [ /* array de tabelas */ ],
  "generatedAt": "2026-06-10T12:00:00.000Z",
  "recordsToDelete": []
}
```

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `relatoriostamp` | Sim | Igual a `u_mdashstamp` |
| `config` | Sim | Array de blocos por tabela |
| `generatedAt` | Não | ISO timestamp (export) |
| `recordsToDelete` | Não | `[]` na importação |

## Estrutura de cada bloco em `config`

```json
{
  "sourceTable": "MdashFilter",
  "sourceKey": "mdashfilterstamp",
  "records": [ /* array de objetos */ ]
}
```

### Tabelas e chaves (ordem no export)

| `sourceTable` | `sourceKey` | Conteúdo |
|---------------|-------------|----------|
| `u_mdash` | `u_mdashstamp` | `MdashConfig` (1 registo) |
| `MdashAccess` | `mdashaccessstamp` | Acessos |
| `MdashTab` | `mdashtabstamp` | Tabs |
| `MdashContainer` | `mdashcontainerstamp` | Containers |
| `MdashContainerItem` | `mdashcontaineritemstamp` | Items (cards) |
| `MdashFilter` | `mdashfilterstamp` | Filtros |
| `MdashContainerItemObject` | `mdashcontaineritemobjectstamp` | Objetos visuais |
| `MDashFonte` | `mdashfontestamp` | Fontes de dados |

## Serialização de campos JSON

Campos que **devem ser strings JSON** no registo importado:

| Entidade | Campos string JSON |
|----------|-------------------|
| `u_mdash` | `configjson` |
| `MdashTab` | `configjson` |
| `MdashContainerItem` | `slotsconfigjson` |
| `MdashContainerItemObject` | `configjson`, `transformconfigjson`, `queryconfigjson`, `fontesstampsjson`, `detalhesqueryconfigjson` |
| `MDashFonte` | `schemajson`, `parametrosjson`, `apiheadersjson`, `apibodyjson`, `lastResultscached` |

**Regra:** `configjson` do objecto = `JSON.stringify(configObject)` — não objecto aninhado no JSON do ficheiro (o record é flat).

### `MdashContainerItemObject` — triplete transformConfig

Para objectos com dados transformados:

```json
{
  "configjson": "{\"theme\":\"corporate\",...}",
  "transformconfigjson": "{\"mode\":\"builder\",\"sourceTable\":\"vendas\",...}",
  "config": { "theme": "corporate" }
}
```

Na importação, o mínimo é `configjson` + `transformconfigjson` como strings. O builder migra `config.transformConfig` legado para `transformconfigjson`.

## Booleans na BD

PHC/SQL pode esperar `0`/`1` para `inactivo`, `temfiltro`, `fontelocal`, `processaFonte`, etc. O constructor JS aceita boolean; na dúvida usar `false`/`true`.

## Endpoint de importação

```
POST ../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio
Body: __EVENTARGUMENT = JSON.stringify([payload])
```

## Checklist pré-importação

- [ ] Um único registo em `u_mdash.records`
- [ ] Todos os `dashboardstamp` = `relatoriostamp`
- [ ] FKs de container/item/object/fonte/tab coerentes
- [ ] `temfiltro: true` se existirem filtros
- [ ] `templatelayout` usa código existente (ver `08-LAYOUTS-AND-SLOTS.md`)
- [ ] `tipo` de objecto é valor suportado (ver `05-OBJECT-TYPES.md`)
- [ ] `configjson` válido (JSON.parse sem erro)

## Exemplo mínimo

Ver `examples/minimal-dashboard.json`.

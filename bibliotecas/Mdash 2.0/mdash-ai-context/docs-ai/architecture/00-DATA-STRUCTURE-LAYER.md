# Camada Data Structure (SQL + stamps)

Fonte de verdade para **estrutura de dados** persistida na BD PHC.

## Ficheiro SQL oficial

```
bibliotecas/Mdash 2.0/SQL/MDash tables.sql
```

Ler este ficheiro antes de inventar colunas. A documentação `architecture/` reflecte este schema; se divergir, **prevalece o SQL**.

## Regra de Primary Keys — máximo 25 caracteres

Todas as PKs/FKs de stamp são `VARCHAR(25)` ou `CHAR(25)`:

| Tabela | PK |
|--------|-----|
| `u_mdash` | `u_mdashstamp` CHAR(25) |
| `MdashTab` | `mdashtabstamp` |
| `MdashContainer` | `mdashcontainerstamp` |
| `MdashContainerItem` | `mdashcontaineritemstamp` |
| `MdashFilter` | `mdashfilterstamp` |
| `MdashAccess` | `mdashaccessstamp` |
| `MDashFonte` | `mdashfontestamp` |
| `MdashContainerItemObject` | `mdashcontaineritemobjectstamp` |
| `MdashContainerItemObjectDetail` | `mdashcontaineritemobjectdetailstamp` |
| `MdashContainerItemLayout` | `mdashcontaineritemlayoutstamp` |

### Como gerar stamps (não usar UUID de 36 chars)

O PHC usa `generateUUID()` em `GLOBAL.js` (linhas 20–28):

```javascript
// Gera UUID padrão e trunca a 25 caracteres
return uuid.substring(0, 25);
```

**Exemplo válido:** `a3f2c891-04e2-4b1a-9c8d-` (25 chars)  
**Inválido:** `a3f2c891-04e2-4b1a-9c8d-446655440000` (36 chars — rejeitado pela BD)

Na geração JSON por IA:
- Cada stamp ≤ 25 caracteres
- Mesmo valor em todas as FKs que apontam para o registo
- `relatoriostamp` = `u_mdashstamp`
- Não reutilizar o mesmo stamp para entidades diferentes

## Mapa de tabelas e FKs

```
u_mdash (dashboard)
  ├── MdashTab.dashboardstamp
  ├── MdashFilter.dashboardstamp
  ├── MdashAccess.dashboardstamp
  ├── MdashContainer.dashboardstamp
  │     └── MdashContainerItem.mdashcontainerstamp
  │           └── MdashContainerItemObject.mdashcontaineritemstamp
  ├── MDashFonte.dashboardstamp
  └── (layouts globais: MdashContainerItemLayout — sem dashboardstamp)

MdashTab.mdashtabstamp ← MdashContainer.mdashtabstamp, MdashFilter.mdashtabstamp
MDashFonte.mdashfontestamp ← MdashContainerItemObject.fontestamp
```

## Tabelas — colunas por entidade

### `u_mdash`

| Coluna | Tipo SQL | Default | Notas |
|--------|----------|---------|-------|
| `u_mdashstamp` | char(25) | `''` | PK |
| `temfiltro` | bit | 0 | |
| `codigo` | varchar(250) | `''` | URL viewer |
| `descricao` | varchar(250) | `''` | |
| `filtrohorizont` | bit | 0 | |
| `categoria` | varchar(250) | `''` | |
| `configjson` | text | `'{}'` | Settings JSON string |
| `ousrinis`, `ousrdata`, … | auditoria PHC | | Omitir em JSON IA se backend preenche |

### `MdashTab`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashtabstamp` | varchar(25) | PK |
| `dashboardstamp` | varchar(25) | `''` |
| `titulo` | varchar(250) | `''` |
| `icone` | varchar(100) | `''` |
| `configjson` | text | `'{}'` |
| `ordem` | int | 0 |
| `inactivo` | bit | 0 |

### `MdashContainer`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashcontainerstamp` | varchar(25) | PK |
| `inactivo` | bit | 0 |
| `codigo` | varchar(250) | `''` |
| `titulo` | varchar(250) | `''` |
| `tipo` | varchar(100) | `''` |
| `tamanho` | int | 0 |
| `layoutmode` | varchar(20) | `'auto'` |
| `ordem` | int | 0 |
| `dashboardstamp` | varchar(25) | `''` |
| `mdashtabstamp` | varchar(25) | `''` |

### `MdashContainerItem`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashcontaineritemstamp` | varchar(25) | PK |
| `mdashcontainerstamp` | varchar(25) | `''` |
| `inactivo` | bit | 0 |
| `codigo` | varchar(250) | `''` |
| `titulo` | varchar(250) | `''` |
| `tipo` | varchar(100) | `''` |
| `urlfetch` | text | `''` |
| `tamanho` | int | 0 |
| `ordem` | int | 0 |
| `layoutcontaineritemdefault` | bit | 0 |
| `expressaolayoutcontaineritem` | text | `''` |
| `dashboardstamp` | varchar(25) | `''` |
| `fontelocal` | bit | 0 |
| `expressaodblistagem` | text | `''` |
| `templatelayout` | text | `''` |
| `layoutmode` | varchar(20) | `'inherit'` |
| `gridrow` | int | NULL |
| `gridcolstart` | int | NULL |
| `gridcolspan` | int | 4 |
| `gridrowspan` | int | 1 |
| `expressaoapresentacaodados` | text | `''` |
| `slotsconfigjson` | text | `'[]'` |

### `MdashFilter`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashfilterstamp` | varchar(25) | PK |
| `dashboardstamp` | varchar(25) | `''` |
| `inactivo` | bit | 0 |
| `codigo` | varchar(250) | `''` |
| `descricao` | varchar(250) | `''` |
| `tipo` | varchar(100) | `''` |
| `campooption` | varchar(250) | `''` |
| `eventochange` | bit | 0 |
| `expressaochange` | text | `''` |
| `campovalor` | varchar(250) | `''` |
| `tamanho` | int | 0 |
| `expressaolistagem` | text | `''` |
| `expressaojslistagem` | text | `''` |
| `valordefeito` | text | `''` |
| `ordem` | int | 0 |
| `escopo` | varchar(20) | `'global'` |
| `mdashtabstamp` | varchar(25) | `''` |

### `MDashFonte`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashfontestamp` | varchar(25) | PK |
| `dashboardstamp` | varchar(25) | `''` |
| `codigo` | varchar(250) | `''` |
| `descricao` | varchar(250) | `''` |
| `tipo` | varchar(100) | `''` |
| `expressaolistagem` | text | `''` |
| `expressaojslistagem` | text | `''` |
| `schemajson` | text | `''` |
| `lastResultscached` | text | `''` |
| `ordem` | int | 0 |

Nota: o constructor JS (`MDashFonte`) tem mais campos (`scope`, `parametrosjson`, `refreshmode`, …) — confirmar colunas efectivas na BD/PHC antes de importar; o SQL base pode estar incompleto face ao JS.

### `MdashContainerItemObject`

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashcontaineritemobjectstamp` | varchar(25) | PK |
| `mdashcontaineritemstamp` | varchar(25) | `''` |
| `inactivo` | bit | 0 |
| `dashboardstamp` | varchar(25) | `''` |
| `tipo` | varchar(100) | `''` |
| `tamanho` | int | 0 |
| `ordem` | int | 0 |
| `categoria` | varchar(100) | `''` |
| `expressaoobjecto` | text | `''` |
| `configjson` | text | `''` |
| `queryconfigjson` | text | `''` |
| `temdetalhes` | bit | 0 |
| `detalhesqueryconfigjson` | text | `''` |
| `tipoquery` | varchar(100) | `'item'` |
| `objectexpressaodblistagem` | text | `''` |
| `tipoobjectodetalhes` | varchar(100) | `''` |
| `titulodetalhes` | varchar(250) | `''` |
| `titulobtndetalhes` | varchar(250) | `''` |
| `fontestamp` | varchar(25) | `''` |
| `slotid` | varchar(100) | `''` |
| `processaFonte` | bit | 1 |

JS adicional: `transformconfigjson`, `fontesstampsjson` (confirmar migrações SQL).

### `MdashContainerItemLayout` (layouts globais / custom cards)

| Coluna | Tipo | Default |
|--------|------|---------|
| `mdashcontaineritemlayoutstamp` | varchar(25) | PK |
| `codigo` | varchar(250) | |
| `descricao` | varchar(250) | |
| `layoutsystem` | varchar(50) | `'HBF'` |
| `htmltemplate` | text | |
| `csstemplate` | text | |
| `jstemplate` | text | |
| `slotsdefinition` | text | `'[]'` |
| `iconcdn`, `jscdns`, `csscdns`, `thumbnail` | | |
| `ispublic` | bit | 1 |
| `versao` | int | 1 |
| `categoria` | varchar(250) | |
| `ordem` | int | 0 |
| `inactivo` | bit | 0 |

## Onde ler o modelo JS (complemento ao SQL)

| Entidade | Constructor | Form config (campos UI) |
|----------|-------------|-------------------------|
| `MdashConfig` | `MDash config lib.js` ~1067 | dashboard settings |
| `MdashFilter` | ~1089 | `getMdashFilterUIObjectFormConfigAndSourceValues()` ~1170 |
| `MdashTab` | ~1140 | tab editor |
| `MdashContainer` | ~1310 | `getContainerUIObjectFormConfigAndSourceValues()` ~1439 |
| `MdashContainerItem` | ~1339 | `getContainerItemUIObjectFormConfigAndSourceValues()` ~1452 |
| `MdashContainerItemObject` | ~1528 | properties inline por tipo no extension |
| `MDashFonte` | ~2033 | fonte panel / DATA SOURCE Operations |
| `MdashContainerItemLayout` | ~2340 | `getContainerItemLayoutUIObjectFormConfigAndSourceValues()` ~2451 |

## Próximo passo

Cada componente tem também camadas **Logic** e **Design** — ver `11-THREE-LAYERS-MODEL.md` e `12-DESIGN-ASSETS-MAP.md`.

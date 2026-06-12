# Regras de geração JSON (anti-alucinação)

Regras obrigatórias para qualquer IA que gera JSON importável no MDash 2.0.

## 0. Modelo de 3 camadas

Antes de gerar qualquer registo, definir para cada elemento:

1. **Structure** — colunas SQL (`00-DATA-STRUCTURE-LAYER.md`)
2. **Logic** — fontes, SQL, refresh, slots (`11-THREE-LAYERS-MODEL.md`)
3. **Design** — layout/CSS/renderer (`12-DESIGN-ASSETS-MAP.md`)

Se o visual não existir: seguir `13-DECISION-FLOW.md` (customCode, layout custom, built-in próximo).

## 1. Nomes de campos

- Usar **exactamente** os nomes das propriedades documentadas (case-sensitive).
- `tipo` não `type`. `codigo` não `code` (excepto dentro de `configjson` de `customCode`).
- `dashboardstamp` não `dashboardId`.
- `mdashcontaineritemstamp` não `itemId`.
- Tabela fonte: `MDashFonte` não `MdashFonte`.

## 2. Tipos de objeto

**Permitidos com renderer:**

`chart`, `pie`, `table`, `text`, `html`, `list`, `customCode`, `title`, `TituloItem`

**Proibidos** (catálogo sem renderer):

`kpi`, `image`, `card`, `separator`, `filter`

Substituir conforme `05-OBJECT-TYPES.md`.

## 3. Tipos de filtro

Apenas: `text`, `digit`, `date`, `number`, `logic`, `radio`, `list`, `multiselect`

## 4. Layouts

- `templatelayout` deve ser código da lista em `08-LAYOUTS-AND-SLOTS.md` ou `custom_<uuid>`.
- Não inventar `templatelayout: "kpi_card_modern"` sem criar `MdashContainerItemLayout`.

## 5. JSON aninhado vs string

| Campo | Formato no record |
|-------|-------------------|
| `configjson` | **String** `JSON.stringify(...)` |
| `configjson` interno | Objecto com chaves do tipo de objecto |
| `slotsconfigjson` | **String** array JSON |
| `parametrosjson` | **String** array JSON |
| `transformconfigjson` | **String** object JSON |
| `configjson` em `u_mdash` / `MdashTab` | **String** settings |

## 6. Stamps e FKs (máximo 25 caracteres)

- Todo `*stamp` = **string ≤ 25 caracteres** (`VARCHAR(25)` na BD).
- Algoritmo PHC: `generateUUID()` em `GLOBAL.js` — UUID truncado: `uuid.substring(0, 25)`.
- **Não** usar UUID de 36 caracteres.
- Exemplo válido: `a3f2c891-04e2-4b1a-9c8d-`
- Exemplo inválido: `550e8400-e29b-41d4-a716-446655440000`
- `dashboardstamp` em **todos** os filhos = `relatoriostamp` (= `u_mdashstamp`).
- `fontestamp` em objecto deve existir em `MDashFonte.records`.
- `mdashcontaineritemstamp` deve existir em items.
- `filterstamp` em parametros deve existir em filters.

## 7. Ordem

- `ordem` começa em 1 (ou 0 aceite mas ser consistente).
- Filtros ordenados por `ordem`.
- Containers, items, objects, tabs: idem.

## 8. Grid

- `tamanho` ∈ [1, 12].
- Soma `tamanho` dos items na mesma row ≤ 12 (modo auto).
- Row full width: container `tamanho:12`, item gráfico `tamanho:12`.

## 9. Fontes e SQL

- SQL em `expressaolistagem`, não campo `sql`.
- Parâmetros como `@token` alinhados com `parametrosjson`.
- `refreshmode: "onfilterchange"` quando filtros afectam a query.

## 10. Slots

- `slotid` deve existir no `slotsdefinition` do layout escolhido.
- Conteúdo principal: `body` ou slot com `isMainContent: true`.
- Título do card: `TituloItem` em `title`, não duplicar em `text` no `body` (salvo design intencional).

## 11. processaFonte

| tipo | processaFonte |
|------|---------------|
| `TituloItem`, `title`, `customCode` | `false` |
| `chart`, `table`, `list`, `text`, `html` com dados | `true` |

## 12. Campos a omitir (runtime)

Não gerar: `records`, `dadosTemplate`, `slotsconfig`, `lastResults`, `schema`, `status`, `errorMessage`, `apiheaders`, `apibody` (arrays runtime).

## 13. Dashboard filtros

Se há `MdashFilter.records.length > 0`:

```json
{ "temfiltro": true, "filtrohorizont": true }
```

## 14. Validação mental antes de entregar

```
[ ] JSON.parse em cada configjson / slotsconfigjson / parametrosjson
[ ] Nenhum tipo de objecto/filtro inventado
[ ] templatelayout existe
[ ] FKs resolvem
[ ] Pelo menos 1 fonte se há objectos com processaFonte true
[ ] relatoriostamp === u_mdashstamp
[ ] Estrutura config[] com sourceTable/sourceKey/records
```

## 15. O que NÃO gerar sem pedido explícito

- `MdashAccess` com `pfstamp` reais
- `lastResultscached` com dados volumosos
- `expressaochange` / `customCode` com código arbitrário perigoso
- Layouts HTML com `<script>` (sanitização no runtime)

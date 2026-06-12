# Guia de prompts — foto/mockup → JSON MDash

## System prompt base (copiar para a IA)

```
És um gerador de configuração MDash 2.0 em JSON importável.

REGRAS:
1. Lê a documentação em docs-ai/architecture/ antes de gerar.
2. Usa APENAS nomes de campos e valores enum documentados.
3. Não inventes tipos de objecto (kpi, image, card) — usa alternativas documentadas.
4. Gera stamps ≤ 25 caracteres para cada `*stamp` (`generateUUID()` em `GLOBAL.js`).
5. Para cada elemento define Structure · Logic · Design (`11-THREE-LAYERS-MODEL.md`).
6. Visual desconhecido → `13-DECISION-FLOW.md` + `12-DESIGN-ASSETS-MAP.md`.
7. configjson e outros JSON fields são STRINGS escapadas.
8. Output: um único ficheiro JSON no formato de 02-IMPORT-EXPORT-JSON.md.

HIERARQUIA: u_mdash → tabs? → fontes → filtros? → containers → items → objects.

Antes do JSON, lista brevemente: filtros, tabs, rows, cards, objectos por card.
```

## Prompt — dashboard a partir de foto

```
Analisa a imagem do dashboard anexo.

1. Identifica: filtros (topo), tabs, secções/rows, cards (KPIs, gráficos, tabelas).
2. Por elemento: Structure (tabelas SQL) · Logic (fontes/SQL) · Design (layout/CSS em 12-DESIGN-ASSETS-MAP.md).
3. Para cada card: templatelayout built-in de 08-LAYOUTS-AND-SLOTS.md (ou custom se necessário — 13-DECISION-FLOW.md).
4. Para cada conteúdo: tipo de objecto válido de 05-OBJECT-TYPES.md; gráfico inexistente → `customCode`.
5. Define fontes SQL plausíveis com parametrosjson ligados aos filtros; stamps ≤ 25 chars.
6. Gera JSON importável completo.

Assume grid 12 colunas. KPIs na mesma linha: tamanho = 12 / quantidade.

Se um card não corresponder a layout existente, escolhe o built-in mais próximo e indica na nota qual custom layout seria necessário.
```

## Prompt — dashboard a partir de descrição textual

```
Cria um dashboard MDash 2.0 em JSON para:

[DESCRIÇÃO DO USER]

Requisitos:
- Código dashboard: [CODIGO]
- Multi-separadores: sim/não
- Filtros: [lista]
- Tab "X": [conteúdo]
- ...

Segue architecture/09-JSON-GENERATION-RULES.md.
Entrega só JSON válido + comentário JSON não permitido.
```

## Prompt — só KPI row

```
Gera JSON MDash com:
- 1 container "Indicadores"
- 4 items tamanho 3, templatelayout snap_card
- Cada item: TituloItem no slot title, text no slot body com dataFormat currency
- 1 fonte global com SQL placeholder devolvendo 1 row por KPI
- Filtro ano (list) se aplicável

Formato import 02-IMPORT-EXPORT-JSON.md.
```

## Prompt — gráfico + tabela

```
Gera JSON MDash com:
- Row 1: gráfico barras tamanho 8 (card_standard, chart no body)
- Row 1: lista top 5 tamanho 4 (card_standard, list no body)
- Row 2: tabela tamanho 12 (plain_card, table autoColumns true)
- Fonte partilhada ou fontes separadas com SQL coerente
```

## Prompt — layout custom (avançado)

```
O user quer um card com:
[descrição visual]

1. Propõe htmltemplate com data-mdash-slot para: title, body, [outros].
2. Gera MdashContainerItemLayout record completo.
3. Gera MdashContainerItem com templatelayout custom_<stamp>.
4. Gera objects nos slots correctos.

Inclui bloco MdashContainerItemLayout no config[].
```

## Análise de foto — checklist visual

| Elemento na imagem | Acção |
|--------------------|-------|
| Barra filtros horizontal | `temfiltro`+`filtrohorizont`, criar `MdashFilter` |
| Tabs coloridas | `MdashTab` + `activarMultiSeparadores` |
| Título secção | `MdashContainer.titulo` |
| Caixa com número grande | `snap_card` ou `snapshot_layout_v2` + `text` |
| Ícone no canto do KPI | layout com slot `icon` + `html` pequeno |
| Gráfico barras/linhas | `chart`, `chartType` adequado |
| Grelha dados | `table` |
| Lista links | `list` |
| 4 caixas iguais numa linha | 4 items `tamanho:3` |

## Resposta esperada da IA

1. **Resumo estrutural** (markdown curto)
2. **JSON completo** (ficheiro único)
3. **Notas** (opcional): SQL a ajustar, layouts custom sugeridos, filtros a validar no PHC

## Erros a corrigir se o user reportar import falhado

1. Validar `JSON.parse` em strings internas
2. Verificar `sourceTable` names exactos
3. Confirmar `relatoriostamp`
4. Reduzir objectos não suportados
5. Ver `modules/BACKEND-SQL-PHC.md` se erro no servidor

# 03 — Colunas, células, tipos, editores e expressões

## Tipos existentes
- `digit` → número, normalmente grava em `saldo`.
- `text` → texto curto, grava em `cvalor`.
- `textarea` → texto longo, grava em `cvalor`.
- `date` → data, grava em `cvalor`.
- `table` → dropdown/lookup, grava em `cvalor`.
- `logic` → booleano, grava em `cvalor`.
- `button` → botão/HTML, geralmente não grava valor normal.

## Classes/configs principais
Em `Input/js/MRend.js`:
- `Coluna`
- `Celula`
- `CellObjectConfig`
- `BindData`
- `ExtraBindData`
- `FXData`
- `RenderedColuna`
- `mapColuna`
- `mapCelula`

Em `Input/js/MRENDCONFIG LIB.js`:
- `ColunaMrenderConfig`
- `CelulaMrenderConfig`
- `getColunaUIObjectFormConfigAndSourceValues`
- `getCelulaUIObjectFormConfigAndSourceValues`
- `addColunaMrenderConfig`
- `setColunaGrupoReactive`

## Render/editor/valor
Funções no motor:
- `getCellHtmlComponent`
- `handleDefaultValue`
- `handleFormatInput`
- `handleDefaultValueByDataType`
- `formatInputValue`
- `handleUIValue`
- `setValueOnCell`
- `updateCellOnDB`

## Expressões
- Expressões usam `<codigocoluna>`.
- Funções importantes: `isExpression`, `evaluateExpression`, `calcularSubtotais`.
- Coluna calculada deve ser readonly/disabled para evitar conflito entre valor manual e valor derivado.

## Para adicionar novo tipo de coluna
Abrir só:
1. `docs-ai/03-COLUNAS-CELULAS-TIPOS.md`
2. `docs-ai/04-RENDER-TABULATOR.md`
3. `Input/js/MRend.js`
4. `Input/js/MRENDCONFIG LIB.js`
5. SQL apenas se precisar campo novo.

Checklist:
- Definir tipo na configuração (`ColunaMrenderConfig`).
- Mapear tipo no motor (`Coluna`, `mapColuna`, render/editor).
- Definir campo de persistência (`saldo` ou `cvalor`).
- Definir formatação UI.
- Testar edição, refresh, save e export/import da config.

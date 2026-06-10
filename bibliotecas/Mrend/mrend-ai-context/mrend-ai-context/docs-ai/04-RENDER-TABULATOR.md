# 04 — Renderização, Tabulator e UI final

## Responsabilidade
Transformar configuração + dados EAV em linhas/colunas Tabulator.

## Ficheiro principal
- `Input/js/MRend.js`

## Classes/funções relevantes
- `Mrend`
- `RenderedLinha`
- `RenderedColuna`
- `setLinhaRender`
- `setColunasRender`
- `getRenderedLinhas`
- `getCellHtmlComponent`
- `createUIObjectWithColumns`
- `freezyColunas`
- `modoEcraHandler`
- `sourcedTableStyle`
- `initSelect`
- `generateToolTipsForSourcedTable`

## Fluxo mental
1. Backend devolve registos EAV.
2. `mapRecordToMrendObject` normaliza campos conforme `dbTableToMrendObject.extras`.
3. Linhas são agrupadas por `rowIdField`.
4. Colunas são geradas por configs.
5. Célula recebe `CellObjectConfig` com `bindData`.
6. Tabulator renderiza.
7. Eventos de edição chamam sync/update.

## Pontos de atenção
- Não quebrar o `sourceKey` em `BindData`. Deve respeitar `extras.cellIdField` quando configurado.
- Renderização e persistência estão acopladas via `bindData.sourceKey` e `sourceBind`.
- Alterações visuais devem ser testadas com dados existentes e após refresh.

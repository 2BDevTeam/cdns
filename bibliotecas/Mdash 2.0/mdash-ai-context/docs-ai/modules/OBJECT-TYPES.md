# Tipos de objetos e renderers

## Ficheiros a abrir
- `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js`: renderers e propriedades dos objetos.
- `js/MDash config lib.js`: registry/resolução do tipo e modelo do objeto.
- `docs/OBJECT-TYPE-DEVELOPMENT-GUIDE.md`: guia existente para novos tipos.

## Registry/resolução
Em `MDash config lib.js`:
- `getMdashObjectTypeEntry(tipo)` linhas 1566-1570.
- fallback legacy logo abaixo.
- `getMdashObjectProcessaFonte(tipo)` linhas 1597+.
- `MdashObjectDependencyAnalyzer` linhas 1735+.
- `mdashResolveObjectData` linhas 1869+.

## Tipos principais no template extension
Em `TEMPLATE DASHBOARD STANDARD EXTENSION.js`:

### Cards/snapshots
- `generateCardTimeLine` linhas 200+.
- `generateDashCardBudget` linhas 310+.
- `generateMDashCardSnapV2` linhas 346+.
- `generateMDashCardSnap` linhas 371+.
- `generateBrdCardAdvancedMetric` linhas 397+.
- `generateBrdCardAdvancedStatus` linhas 421+.
- `generateBrdCardAdvancedAlert` linhas 447+.
- `generateDashCardSnapshot` linhas 471+.
- `generateDashCardStandard` linhas 482+.

### Custom Code
- Config sample: `_CUSTOMCODE_SAMPLE_CONFIG` linha 498.
- Render: `renderObjectCustomCode` linha 505.
- Propriedades inline: `renderCustomCodePropertiesInline` linha 593.
- Modal editor: `_mccOpenEditorModal` linha 839.
- Read config: `_ccReadConfig` linha 885.
- Schema: `crateDynamicSchemaCustomCode` linha 904.

### Tabela/Tabulator
- Sample config: `_TABLE_SAMPLE_CONFIG` linha 928.
- Temas: `_TABLE_THEMES` linha 963.
- CSS: `_tblCSS` linha 1028.
- Render: `renderObjectTable` linha 1069.
- Build columns: `_tblBuildColumns` linha 1367.
- Link buttons: `_tblLinkButtonFormatter` linha 1517.
- Sorter: `_tblGuessSorter` linha 1614.
- Tree: `_tblBuildTree` linha 1627.
- Expressões: `_tblEvalExpression` linha 1652.
- Filtros tabela: `_TABLE_FILTER_OPERATORS` linha 1683 até `_tblRenderFilters` linha 1852+.
- Propriedades inline: `renderTablePropertiesInline` linha 1950.
- Conditions modal: `_tblOpenFilterConditionsModal` linha 2534.
- Read config: `_tblReadConfig` linha 2827.
- Schema: `createDynamicSchemaTable` linha 2956.

### Gráfico/ECharts
- Temas/default: linhas 2998-3118.
- `buildEchartsOption` linha 3118.
- Cartesian/bar/pie/scatter/funnel: 3159-3388.
- Render engine: `render` linha 3388.
- Resolvers: `RESOLVERS` linha 3478.
- UI config/bind: 3658-3737.
- CSS: 3737-3805.
- Schema: `createDynamicSchemaGrafico` linha 3805.
- Render: `renderObjectGrafico` linha 4105.
- Update chart: `updateChartOnContainer` linha 4197.

## Contrato típico de um renderer
Um tipo de objeto deve normalmente ter:
- função `renderObjectX(...)`;
- função de propriedades inline `renderXPropertiesInline(...)`, se editável no builder;
- função `createDynamicSchemaX(...)`, se tiver schema dinâmico;
- config default/sample;
- indicação se `processaFonte` é necessário.

## Bugs comuns

### Novo tipo aparece no builder mas não renderiza
Ver:
- registry em `MDash config lib.js`.
- função `renderObjectX` em `TEMPLATE DASHBOARD STANDARD EXTENSION.js`.
- `processaFonte` do tipo.
- `Mdash.html` `MdashContainerItemObject` runtime.

### Propriedades salvam mas render não muda
Ver:
- função `_readConfig` do tipo.
- `objectoConfig` no objeto.
- `updateConfigJson`/persistência do objeto.

### Tabela filtra errado
Ver apenas bloco Tabela/Tabulator, não o projeto inteiro.

### Gráfico não atualiza ao mudar filtro
Ver:
- `renderObjectGrafico`.
- `updateChartOnContainer`.
- Pipeline de fontes em `Mdash.html`.

## Prompt recomendado
"Tarefa em object type/renderer. Leia OBJECT-TYPES.md. Determine o tipo visual: table, grafico, custom code, card. Abra apenas o bloco desse tipo em TEMPLATE DASHBOARD STANDARD EXTENSION.js e o registry em MDash config lib.js."

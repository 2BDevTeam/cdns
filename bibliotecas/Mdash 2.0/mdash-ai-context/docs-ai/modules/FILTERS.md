# Filtros

## Ficheiros a abrir
- Builder/configuração: `js/MDash config lib.js`.
- Runtime final: `p#U00e1ginas de internet/Mdash.html`.
- Filtros internos de tabela: `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js`.
- Documentação existente: `docs/FILTROS-*.md` e `docs/TABLE-FILTERS-ARCHITECTURE.md`.

## Modelo `MdashFilter` no builder
Em `js/MDash config lib.js`, linhas 1088-1114:
- `mdashfilterstamp`: identidade.
- `dashboardstamp`: dashboard.
- `codigo`: usado como chave no DOM/localStorage/filterValues.
- `descricao`: label.
- `tipo`: tipo do filtro (`text`, select, multi, data, etc. conforme implementação).
- `tamanho`: grid/largura visual.
- `expressaolistagem`: SQL/opções vindas do backend.
- `expressaojslistagem`: opções/expressão JS.
- `eventochange`: se dispara lógica ao mudar.
- `expressaochange`: script/ação ao mudar.
- `valordefeito`: valor inicial.
- `campooption`: campo exibido.
- `campovalor`: campo usado como valor.
- `escopo`: `global` ou outro escopo.
- `mdashtabstamp`: separadores do filtro quando `escopo: tab` (CSV de stamps).
- `ordem`: ordenação.

## Filtros no runtime `Mdash.html`
Pontos importantes:
- `MdashRendFilter` linhas 2500-2517: modelo runtime do filtro.
- `getValorDefeito(filter)` linhas 3226-3237: resolve valor default e cache em localStorage.
- Estado reativo linhas 3260+: inclui `activeTabStamp`, `_filterInputTimers`, `filterValues`.
- Render/DOM de filtros linhas 3583-3598 aprox.: filtra filtros por tab/ativo.
- Mudança de filtro linhas 3842-3919: atualiza valor, identifica containers/items afetados, calcula fontes afetadas e dispara pipeline.

## Fluxo quando filtro muda
1. UI chama `updateFilterAndTriggerChange(codigo, valor)` ou handlers equivalentes.
2. Valor é guardado em `this.mdash.filterValues[filtro.codigo]`.
3. `executeUpdateFilter(filtro, valor)` aplica lógica.
4. O runtime localiza items/containers que dependem do filtro.
5. `_getFonteStampMapForFilter(filtro)` encontra fontes afetadas.
6. `_runFontePipelineByStampMap(...)` recarrega dados e atualiza items.

## Dependência filtro → fonte
Abrir em `Mdash.html`:
- linhas 3712-3743: procura tokens/parâmetros da fonte que dependem do filtro.
- linhas 3892-3908: decide se há dependências de fonte e escopo de atualização.

Abrir em `MDash config lib.js`:
- linhas 2468-2534: tokens/expressões e resolução.
- linhas 2534-2590: sincronização de parâmetros de fonte.

## Filtros internos de tabela
Em `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js`:
- `_TABLE_FILTER_OPERATORS` linhas 1683+.
- `_tblParseDate`, `_tblCompareDates`, `_tblDateInRange` linhas 1737-1776.
- `_tblResolveFilterValue` linhas 1776-1797.
- `_tblApplyFilter` linhas 1797-1826.
- `_tblCalculateFilterCount` linhas 1826-1840.
- `_tblRenderFilters` linhas 1852-1927.
- `_tblOpenFilterConditionsModal` linhas 2534-2827.

## Bugs comuns

### Filtro altera UI mas dados não mudam
Ver:
- `Mdash.html` linhas 3842-3919.
- `Mdash.html` linhas 3712-3743.
- `MDash config lib.js` linhas 2468-2590.

### Valor default errado
Ver:
- `Mdash.html` linhas 3226-3237.
- `MdashFilter.valordefeito` no builder linhas 1088-1114.

### Filtro por tab aparece na tab errada
Ver:
- `MdashFilter.mdashtabstamp`.
- `Mdash.html` linhas 3574-3598.
- Config de tabs em `MdashTab`.

### Filtro da tabela não filtra corretamente
Ver apenas:
- `TEMPLATE DASHBOARD STANDARD EXTENSION.js` linhas 1683-1927.
- Documentos `docs/FILTROS-TABELA-*`.

## Prompt recomendado
"Estou a trabalhar num bug de filtros do MDash. Leia docs-ai/modules/FILTERS.md e abra apenas os trechos de filtro indicados. Primeiro determine se é filtro global/runtime ou filtro interno de tabela."

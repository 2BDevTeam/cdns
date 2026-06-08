# Containers, Items e Objetos

## Objetivo
Este módulo guia alterações em containers, items e objetos sem ler todo o MDash.

## Ficheiros a abrir
1. `js/MDash config lib.js` para builder/configuração.
2. `p#U00e1ginas de internet/Mdash.html` apenas se a falha aparece no dashboard final.
3. `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js` se o problema estiver no tipo visual do objeto.

## Modelo de dados no builder
Em `js/MDash config lib.js`:

### `MdashContainer` - linhas 1211-1231
Campos importantes:
- `mdashcontainerstamp`: identidade do container.
- `codigo`, `titulo`, `tipo`.
- `tamanho`: largura/tamanho visual.
- `layoutmode`: `auto` ou `manual`.
- `ordem`: ordenação.
- `dashboardstamp`: dashboard pai.
- `mdashtabstamp`: tab associada, se existir.
- `inactivo`: controle de visibilidade.
- `localsource`, `idfield`, `table`: usados pelo builder/salvamento.

### `MdashContainerItem` - linhas 1234-1329 aprox.
Campos importantes:
- `mdashcontaineritemstamp`: identidade do item.
- `mdashcontainerstamp`: container pai.
- `codigo`, `titulo`, `tipo`, `tamanho`.
- `layoutmode`: `inherit`, `auto`, `manual`.
- `gridrow`, `gridcolstart`, `gridrowspan`: posição manual/grid.
- `templatelayout`: template usado no item.
- `layoutcontaineritemdefault`: usa layout default ou expressão custom.
- `expressaolayoutcontaineritem`: layout customizado.
- `fontelocal`: se tem fonte local própria.
- `urlfetch`: endpoint usado para dados do item.
- `expressaodblistagem`: query/listagem do item.
- `expressaoapresentacaodados`: lógica de apresentação.
- `filters`: filtros associados ao item.
- `records`: dados carregados.
- `dadosTemplate`: dados do template.
- `slotsconfigjson` / `slotsconfig`: configuração dos slots.

Métodos ligados:
- `initSlotsConfig()` dentro do construtor: inicializa slots com base no template.
- `updateConfigJson()` no item: persiste slots/template/config.
- `renderContainerItemTemplate(item)` linhas 735-775: preview/render de template no builder.

### `MdashContainerItemObject` - linhas 1420-1555 aprox.
Campos importantes:
- `mdashcontaineritemobjectstamp`: identidade do objeto.
- `mdashcontaineritemstamp`: item pai.
- `codigo`, `titulo`, `tipo`, `tipoobjectodetalhes`.
- `slotid`: slot onde o objeto é renderizado.
- `expressaoobjecto`: expressão custom do objeto.
- `objectexpressaodblistagem`: SQL/listagem específica.
- `fontestamp`: fonte principal.
- `fontesstampsjson`: fontes adicionais em JSON.
- `fontesstamps`: versão parseada.
- `processaFonte`: `false` indica objeto estático sem dados.
- `objectoConfig`: configuração específica do tipo de objeto.
- `queryConfig`: config de query/fonte.

Funções relacionadas:
- `getMdashObjectTypeEntry(tipo)` linhas 1566-1570: resolve o tipo do objeto.
- `getMdashObjectProcessaFonte(tipo)` linhas 1597+: decide se precisa processar fonte.
- `MdashObjectDependencyAnalyzer` linhas 1735+: analisa dependências.
- `mdashResolveObjectData` linhas 1869+: resolve dados do objeto.

## Modelo runtime em `Mdash.html`
Abrir quando a falha só aparece no dashboard final.

### `Mdash` - linhas 2441-2489
Cria a instância runtime:
- `dashboardconfig`
- `filters`
- `filterValues`
- `containers`
- `containerItems`
- `containerItemObjects`
- `tabs`
- `fontes`
- `reactiveInstance`

### `MdashContainerItem` runtime - linhas 2533-2938 aprox.
Controla:
- dados do item;
- skeleton/loading;
- slots;
- fetch de dados;
- renderização do layout do item;
- altura medida (`lastMeasuredHeight`).

Campos que costumam causar bugs:
- `templatelayout`
- `layoutcontaineritemdefault`
- `expressaolayoutcontaineritem`
- `slotsconfigjson`
- `layoutmode`
- `gridrow`, `gridcolstart`, `gridcolspan`, `gridrowspan`
- `records`

### `MdashContainerItemObject` runtime - linhas 2939-3180 aprox.
Controla:
- resolução do tipo de objeto;
- ligação a fontes;
- render do objeto no slot;
- detalhe do objeto;
- fallback para dados do item.

## Caminho de renderização simplificado
1. Configuração chega ao `handleMdashConfigData` em `Mdash.html`.
2. Cria `new Mdash(configData)`.
3. Instância reativa cria DOM de tabs, filtros, containers e items.
4. Fontes globais e/ou locais são carregadas.
5. `MdashContainerItemObject` renderiza objeto usando renderer registado em `TEMPLATE DASHBOARD STANDARD EXTENSION.js`.

## Bugs comuns e onde olhar

### Item não aparece
Abrir:
- `Mdash.html` linhas 3402-3455: init/render DOM por container/item.
- `Mdash.html` linhas 3510+: classes/layout do item.
- `MDash config lib.js` linhas 1234-1329: config do item.

### Objeto aparece no builder mas não no runtime
Abrir:
- `MDash config lib.js` linhas 1420-1555.
- `Mdash.html` linhas 2939-3180.
- `TEMPLATE DASHBOARD STANDARD EXTENSION.js` renderer do tipo.

### Slot errado ou objeto fora do lugar
Abrir:
- `MDash config lib.js` linhas 3405-3826.
- `Mdash Layout Builder.js` linhas 1223-1816.
- `Mdash.html` linhas 2533-2938.

### Dados não chegam ao objeto
Abrir:
- `Mdash.html` linhas 3608-3908.
- `DATA SOURCE Operations.js` linhas 207-411.
- `MDash config lib.js` linhas 1420-1555 e 1869+.

## Prompt recomendado para agente
"Tarefa em MDash containers/items/objects. Leia apenas AGENTS.md, docs-ai/01-FILE-MAP.md e docs-ai/modules/CONTAINERS-ITEMS-OBJECTS.md. Depois abra somente os line ranges indicados para o bug. Não leia backups."

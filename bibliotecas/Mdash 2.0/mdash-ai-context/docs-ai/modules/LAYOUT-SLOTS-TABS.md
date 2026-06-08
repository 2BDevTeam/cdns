# Layouts, slots e tabs

## Ficheiros a abrir
- `js/MDash config lib.js`: layout usado no builder e slots do item.
- `js/Mdash Layout Builder.js`: editor de templates/layouts.
- `p#U00e1ginas de internet/Mdash.html`: render final de tabs/layouts/slots.

## Tabs
### Builder
Em `MDash config lib.js`, `MdashTab` linhas 1117-1144:
- `mdashtabstamp`: identidade da tab.
- `dashboardstamp`: dashboard pai.
- `titulo`, `icone`.
- `configjson`: configurações visuais.
- `ordem`.
- `inactivo`.

### Runtime
Em `Mdash.html`:
- `MdashRendTab` linhas 2490-2497.
- Estado `activeTabStamp` em torno das linhas 3260+.
- Leitura/render das tabs linhas 3455-3504.
- Mudança de tab linhas 3574-3598.
- Persistência em localStorage: procurar `mdashActiveTab_`.

## Containers/items com layout
Campos importantes:
- Container: `layoutmode` (`auto`/`manual`), `mdashtabstamp`.
- Item: `layoutmode` (`inherit`/`auto`/`manual`), `gridrow`, `gridcolstart`, `gridcolspan`, `gridrowspan`.
- Item: `templatelayout`, `layoutcontaineritemdefault`, `expressaolayoutcontaineritem`.
- Item: `slotsconfigjson` e `slotsconfig`.

## Slots
### Builder/config
Em `MDash config lib.js`:
- `MdashSlot` por volta da linha 2178.
- `MdashContainerItemLayout` por volta da linha 2234.
- `renderUnifiedLayout` linhas 3421-3513.
- `injectSlotDropOverlays` linhas 3513-3629.
- `bindSlotDropZoneEvents` linhas 3629-3826.
- `refreshSlotOverlays` linhas 3826-3835.
- `getTemplateLayoutOptions` linhas 3835-3895.
- `getDefaultTemplateCodigo` linhas 3895-3900.
- `getTemplateLayoutByCode` linhas 3900-3906.

### Layout Builder
Em `Mdash Layout Builder.js`:
- Estado: `GLayoutBuilderState` linhas 29+.
- Galeria/seleção: 220-320.
- Ace editors: 320-417.
- Preview: 417-512.
- Propriedades: 512-604.
- CDN manager: 604-666.
- CRUD layout: 666-851.
- Template HBF: 851-955.
- Abrir/fechar modal builder: 955-1131.
- Eventos do builder: 1131-1223.
- Slot mode: 1223-1465.
- Badges/sugestão de slots: 1465-1669.
- Sincronizar preview → editor: 1669-1731.
- Detectar slots do HTML: 1731-1816.
- Import/export: 1816-1964.

## Render final em `Mdash.html`
- Helpers de layout/card: 2220-2425.
- `getContainerLayoutModeRuntime` linha 2296.
- `getEffectiveItemLayoutModeRuntime` linha 2308.
- `generateMdashSkeleton` linhas 2325+.
- `MdashContainerItem` runtime linhas 2533-2938.
- Inicialização DOM de containers/items linhas 3402-3455.
- Classes/modo de layout por item linhas 3510+.

## Bugs comuns

### Layout manual não respeita grid
Ver:
- `getEffectiveItemLayoutModeRuntime` em `Mdash.html` linha 2308.
- Campos `gridrow/gridcolstart/gridcolspan/gridrowspan` em `MdashContainerItem` runtime.
- Builder em `MDash config lib.js` linhas 1234-1329.

### Objeto cai no slot errado
Ver:
- `slotsconfigjson` no item.
- `slotid` no objeto.
- `renderUnifiedLayout` e `injectSlotDropOverlays`.
- `Mdash Layout Builder.js` slot mode/detected slots.

### Tab não mantém ativa
Ver:
- `activeTabStamp` em `Mdash.html`.
- localStorage `mdashActiveTab_`.
- `MdashTab.inactivo` e `ordem`.

### Layout preview diferente do final
Ver os dois lados:
- Preview/builder: `MDash config lib.js` + `Mdash Layout Builder.js`.
- Final: `Mdash.html` `MdashContainerItem` runtime.

## Prompt recomendado
"Tarefa em layout/slots/tabs. Leia LAYOUT-SLOTS-TABS.md. Não abra objetos/fontes salvo se o slot depende de dados. Compare builder vs runtime se o bug aparece apenas no dashboard final."

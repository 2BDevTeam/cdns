# Renderização final - Mdash.html

## Quando usar
Use este módulo quando o bug acontece no dashboard final/renderizado, não apenas no builder.

Ficheiro:
- `p#U00e1ginas de internet/Mdash.html`

## Blocos principais

### Helpers visuais/layout
Linhas 2220-2425:
- `mdashRenderEnterpriseCard`.
- `groupItemsByRows`.
- `getContainerLayoutModeRuntime`.
- `getEffectiveItemLayoutModeRuntime`.
- `getMdashSkeletonMinHeightBySize`.
- `generateMdashSkeleton`.
- `syncMdashSidebarHeight`.
- `generateStandardCard`.
- `generateDashCardHTML`.

### Modelos runtime
Linhas 2434-3180:
- `MdashRendConfig`.
- `Mdash`.
- `MdashRendTab`.
- `MdashRendFilter`.
- `MdashRendContainer`.
- `MdashContainerItem`.
- `MdashContainerItemObject`.

### Filtros e estado reativo
Linhas 3260-3920:
- estado inicial (`activeTabStamp`, timers, collapsed containers).
- render de tabs/filtros/containers/items.
- seleção de tabs.
- dependências objeto→fonte.
- dependências filtro→fonte.
- execução seletiva de pipeline de fontes.
- atualização de filtros.

### Fontes/bootstrap
Linhas 3960-4205:
- `__mdPendingFonteExec`.
- `loadAllFontes`.
- `handleMdashConfigData`.
- construção final do MDash com `configData`.
- escolha da tab ativa.

## Fluxo de inicialização
1. Configuração chega do backend/script.
2. `handleMdashConfigData(configData)` valida e normaliza.
3. Cria `new Mdash(configData)`.
4. Calcula `filterValues` default/cache.
5. Inicializa tabs e tab ativa.
6. Renderiza filtros/containers/items.
7. Executa fontes globais/localizadas.
8. Renderiza objetos dentro dos items/slots.

## Relações importantes
- `configData.filters` → `MdashRendFilter` → `filterValues`.
- `configData.containers` → `MdashRendContainer`.
- `configData.containerItems` → `MdashContainerItem`.
- `configData.containerItemObjects` → `MdashContainerItemObject`.
- `configData.fontes` → pipeline `loadAllFontes`.
- `configData.tabs` → `MdashRendTab` + `activeTabStamp`.

## Onde procurar por tipo de bug

### Render inicial quebrado
Abrir:
- `handleMdashConfigData` linhas 4063-4205.
- construtor `Mdash` linhas 2441-2489.

### Skeleton/loading nunca sai
Abrir:
- `generateMdashSkeleton` linhas 2325+.
- `MdashContainerItem` linhas 2533-2938.
- `loadAllFontes` linhas 4037-4063.

### Filtro muda mas container não atualiza
Abrir:
- linhas 3842-3919.
- linhas 3712-3743.
- linhas 3758-3818.

### Tab muda e items somem
Abrir:
- `activeTabStamp` no estado.
- render tabs linhas 3455-3504.
- filtro de containers/items por tab linhas 3402-3455.

### Objeto sem dados
Abrir:
- `MdashContainerItemObject` linhas 2939-3180.
- pipeline de fontes 3608-3818.
- renderer em `TEMPLATE DASHBOARD STANDARD EXTENSION.js`.

## Prompt recomendado
"Bug ocorre apenas no Mdash.html/runtime final. Leia RENDER-MDASH-HTML.md. Não abra builder salvo se for necessário comparar o campo que chega em configData."

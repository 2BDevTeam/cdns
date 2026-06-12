# 00 - Bootstrap do agente

Este ficheiro existe para reduzir tokens/rate-limit. Ele diz ao agente onde procurar antes de abrir ficheiros grandes.

## Anatomia do MDash
O MDash tem dois mundos separados:

### 1. Builder/configuração
Onde o utilizador cria dashboards, containers, items, objetos, fontes, filtros, tabs e layouts.

Ficheiro principal:
- `js/MDash config lib.js` (~9.900 linhas)

Ficheiros auxiliares:
- `js/Mdash Layout Builder.js`
- `js/DATA SOURCE Operations.js`
- `js/SQLADAPTER.js`
- `js/TEMPLATE DASHBOARD STANDARD EXTENSION.js`

### 2. Runtime/renderização final
Onde o dashboard já configurado é carregado e renderizado para o utilizador final.

Ficheiro principal:
- `p#U00e1ginas de internet/Mdash.html`

Este ficheiro contém a renderização final, instâncias runtime, filtros ativos, pipeline de fontes e atualização de containers/items/objetos.

## Mapa mental rápido
`Dashboard` contém `Tabs`, `Filters`, `Containers`, `ContainerItems`, `ContainerItemObjects`, `Fontes` e `Layouts`.

Relações principais:
- `MdashTab` agrupa containers/filtros por `mdashtabstamp`.
- `MdashContainer` pertence ao dashboard e opcionalmente a uma tab.
- `MdashContainerItem` pertence a um container.
- `MdashContainerItemObject` pertence a um item e pode depender de uma ou várias fontes.
- `MDashFonte` define fonte de dados, SQL/query, parâmetros e modo de execução.
- `MdashFilter` alimenta valores usados por fontes, objetos e containers.
- `MdashSlot` liga objetos a regiões de layout/template.

## Ordem recomendada para qualquer tarefa
1. Descobrir o domínio da tarefa.
2. Ler o módulo em `docs-ai/modules`.
3. Abrir apenas os line ranges indicados.
4. Alterar ficheiro mínimo.
5. Verificar efeitos no runtime final (`Mdash.html`) se a mudança afetar renderização.

## Quando abrir `Mdash.html`
Abra `Mdash.html` apenas se a tarefa envolver:
- renderização final;
- filtros em uso real;
- atualização após mudança de filtros;
- fontes carregadas no cliente final;
- tabs no dashboard final;
- skeleton/loading;
- objetos que aparecem diferente no preview vs final.

## Gerar dashboard JSON (IA / importação)

Para **gerar JSON importável** a partir de prompt ou foto (sem alterar código):

1. Ler `architecture/00-README.md` + `architecture/00-DATA-STRUCTURE-LAYER.md` (SQL + stamps 25 chars)
2. Modelo 3 camadas: `architecture/11-THREE-LAYERS-MODEL.md`
3. Design/CSS: `architecture/12-DESIGN-ASSETS-MAP.md`; decisões foto/prompt: `architecture/13-DECISION-FLOW.md`
4. Seguir `architecture/09-JSON-GENERATION-RULES.md`
5. Usar `architecture/10-PROMPT-GUIDE.md` para prompts
6. Validar contra `architecture/examples/minimal-dashboard.json`

Não usar `modules/` para inventar campos — usar `architecture/` para nomes exactos de propriedades.

## Quando NÃO abrir `Mdash.html`
Não abra `Mdash.html` para tarefas apenas de builder:
- formulário de propriedades;
- criação de containers/items;
- layout builder;
- cadastro de object types;
- alterações de documentação;
- SQL backend.

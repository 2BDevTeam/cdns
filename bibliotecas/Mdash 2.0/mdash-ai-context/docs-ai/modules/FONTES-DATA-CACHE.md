# Fontes, dados e cache

## Ficheiros a abrir
- `js/MDash config lib.js`: modelo `MDashFonte`, parâmetros e dependências.
- `js/DATA SOURCE Operations.js`: cache local, alasql, IndexedDB, query builder.
- `p#U00e1ginas de internet/Mdash.html`: execução runtime das fontes.
- `Cache Architecture.md`: desenho arquitetural.
- `SQL/*`: scripts de cache/CDC quando o problema for backend.

## Modelo `MDashFonte`
Em `js/MDash config lib.js`, procurar `function MDashFonte` por volta da linha 1921.
Responsabilidades:
- representar uma fonte de dados configurável;
- guardar expressão/listagem/query;
- guardar parâmetros dependentes de filtros;
- indicar quando executa (`onload`, `onfilterchange`, etc. conforme config);
- alimentar objetos e container items.

## Ligação objeto → fonte
Em `MdashContainerItemObject`:
- `fontestamp`: fonte principal.
- `fontesstampsjson`: fontes adicionais.
- `fontesstamps`: parse do JSON.
- `processaFonte`: se `false`, objeto não deve aguardar fonte.

Funções úteis:
- `getMdashObjectProcessaFonte(tipo)` em `MDash config lib.js` linhas 1597+.
- `MdashObjectDependencyAnalyzer` linhas 1735+.
- `mdashResolveObjectData` linhas 1869+.

## Cache/local DB em `DATA SOURCE Operations.js`
Line ranges:
- `getMdashDb` linhas 13-24: inicialização DB local.
- `mdashResetDb` linhas 24-35: reset.
- `mdashFonteTableName` linhas 35-39: nome de tabela por fonte.
- `mdashInferSqlType` linhas 39-46: tipo SQL.
- `mdashSqlResultToObjects` linhas 83-97.
- `mdashLoadFonteIntoDb` linhas 116-149: carrega rows para DB local.
- `mdashQuery` linhas 161-175.
- `mdashQueryRaw` linhas 175-195.
- `mdashGetFonteRows` linhas 195-207.
- `mdashBuildCachePayload` linhas 207-221.
- `mdashSaveFonteCache` linhas 221-411: salva/obtém cache da fonte.
- `mdashInitFontesFromCache` linhas 411-424.
- `mdashExtractRowsFromCache` linhas 424-452.
- `_mdashExtendFontePrototype` linhas 452-552.

## Query/data source builder
No mesmo ficheiro:
- `getOutputSchema` linhas 561+.
- `buildSQL` linhas 673-741.
- `_sqlAdapt` linhas 741-752.
- `execute`, `executeRaw` linhas 752-770.
- Expressões JS: `_compileJsExprs`, `_evalJsExpr`, `_applyJsExprsRaw`, `_applyJsExprsObjects` linhas 770-833.
- UI/render do data source builder: linhas 882-1354.

## Pipeline runtime em `Mdash.html`
Abrir quando os dados não aparecem no dashboard final.

Pontos principais:
- `loadAllFontes(fontes)` linhas 4037-4063: executa uma lista de fontes.
- `_getFonteStampsFromObject(obj)` linhas 3608-3646 aprox.: fontes usadas por objeto.
- `_getGlobalFontes(modes)` linhas 3651+.
- `_getFonteStampMapForFilter(filtro)` linhas 3712-3743.
- `_runFontePipelineByStampMap(...)` linhas 3758-3818: pipeline seletivo.
- `executeUpdateFilter`/handlers de filtros linhas 3842-3919.
- `handleMdashConfigData` linhas 4063-4205: bootstrap da configuração.

## Cache backend/SQL
Abrir `SQL/*` apenas quando mexer em cache servidor/CDC:
- `QUERY_CREATE_CACHE_CONTROL.sql`
- `ALTER_CACHE_CONTROL_ADD_VERSION.sql`
- `QUERY_CREATE_FT_CACHE_DELTA.sql`
- `STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql`
- `SP_LIMPEZA_DELTA.sql`
- `JOB PARA SINCRONIZAR MUDAN#U00c7AS.sql`

## Bugs comuns

### Fonte executa várias vezes
Ver:
- `Mdash.html` `__mdPendingFonteExec` e `loadAllFontes` linhas 4036-4063.
- `_runFontePipelineByStampMap` linhas 3758-3818.

### Filtro muda mas fonte não atualiza
Ver:
- `_getFonteStampMapForFilter` linhas 3712-3743.
- `syncFonteParametros` em `MDash config lib.js` linhas 2534+.
- tokens em `expressaolistagem` ou parâmetros da fonte.

### Dados aparecem no preview mas não no runtime
Ver:
- `DATA SOURCE Operations.js` cache/local DB.
- `Mdash.html` linhas 2939-3180 para objeto runtime.
- `TEMPLATE DASHBOARD STANDARD EXTENSION.js` renderer do objeto.

### SQL Server query falha em SQLite/local
Ver:
- `js/SQLADAPTER.js`.
- `DATA SOURCE Operations.js` `_sqlAdapt` e `buildSQL`.

## Prompt recomendado
"Tarefa em fontes/cache/dados do MDash. Leia FONTES-DATA-CACHE.md. Determine se é problema de fonte configurada, cache local, SQL adapter ou pipeline runtime antes de abrir ficheiros grandes."

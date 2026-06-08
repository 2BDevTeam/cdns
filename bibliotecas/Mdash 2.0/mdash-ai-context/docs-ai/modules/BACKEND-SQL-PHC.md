# Backend, SQL e PHC/VB

## Quando usar
Use este módulo quando a tarefa envolve:
- scripts VB em `scripts/` ou `Eventos/`;
- tabelas SQL MDash;
- cache backend/CDC;
- endpoints PHC `gensel.aspx?cscript=...`;
- carregar/salvar configuração.

## Ficheiros VB principais
- `scripts/GET CONFIGURA#U00c7#U00c3O MDASH.vb`: obter configuração MDash.
- `scripts/GET CONFIGURA#U00c7#U00c3O CLIENTE MDASH.vb`: obter configuração para cliente/runtime.
- `scripts/ACTUALIZAR CONFIGURA#U00c7#U00c3O DO  RELATORIO.vb`: atualizar configuração.
- `scripts/GET DADOS DB MDASH CONTENT ITEM.vb`: dados do container item.
- `scripts/GET OPTIONS LIST MDASH.vb`: opções/listagens.
- `scripts/EXECUTE EXPRESSAOLISTAGEMDB.vb`: execução de expressão/listagem DB.
- `scripts/REAL TIME COMPONENT SYNC.vb`: sincronização realtime.
- `scripts/MDASH DEFAULT BACKEND FUNCIONS.vb`: funções backend default.

## Eventos PHC
- `Eventos/INSERIR SCRIPT REGISTO.vb`
- `Eventos/INSERIR SCRIPTS MDASH.vb`

## SQL principal
- `SQL/MDash tables.sql`: estrutura base.
- `SQL/ALTER_MDASHCONTAINERITEMOBJECT_ADD_COLUMNS.sql`: colunas adicionais para objetos.
- Cache/CDC:
  - `SQL/QUERY_CREATE_CACHE_CONTROL.sql`
  - `SQL/ALTER_CACHE_CONTROL_ADD_VERSION.sql`
  - `SQL/QUERY_CREATE_FT_CACHE_DELTA.sql`
  - `SQL/QUERY FT_CACHE(TABLE CACHE).sql`
  - `SQL/STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql`
  - `SQL/SP_LIMPEZA_DELTA.sql`
  - `SQL/JOB PARA SINCRONIZAR MUDAN#U00c7AS.sql`

## Contrato frontend/backend
Campos de identidade que não devem ser alterados sem migração:
- `u_mdashstamp`
- `mdashfilterstamp`
- `mdashtabstamp`
- `mdashcontainerstamp`
- `mdashcontaineritemstamp`
- `mdashcontaineritemobjectstamp`
- `mdashfontestamp`

Endpoints esperados pelo JS:
- `../programs/gensel.aspx?cscript=getdbcontaineritemdata`
- scripts de configuração e execução de expressões DB.

## Bugs comuns

### Configuração salva mas runtime não recebe campo novo
Ver:
- script de atualizar configuração.
- script de get configuração cliente.
- `buildMDashConfigData` em `MDash config lib.js` linhas 2590+.
- `handleMdashConfigData` em `Mdash.html` linhas 4063+.

### Campo existe no JS mas não na tabela
Ver:
- `SQL/MDash tables.sql`.
- `ALTER_*` correspondente.
- scripts VB de insert/update.

### Cache backend não atualiza
Ver:
- `Cache Architecture.md`.
- scripts SQL de cache/CDC.
- `DATA SOURCE Operations.js` cache local se o sintoma aparece no browser.

## Prompt recomendado
"Tarefa em backend/SQL/PHC do MDash. Leia BACKEND-SQL-PHC.md. Primeiro confirme se o problema é contrato de campo, script VB, SQL schema ou cache. Não abra JS grande salvo se precisar comparar nomes de campos."

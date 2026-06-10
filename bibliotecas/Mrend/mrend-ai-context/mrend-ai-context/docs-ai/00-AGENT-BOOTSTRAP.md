# 00 — Bootstrap de contexto para agentes

MRend é uma lib de grelhas/reportes interativos para PHC CS Web. Usa Tabulator para UI, Dexie/IndexedDB para cache local e modelo EAV: cada célula visível é um registo em `u_reportl`.

## Quando receber uma tarefa, classificar primeiro
- **Linha/Grupo/Subgrupo/Singular/modelo/herança** → `02-LINHAS-HIERARQUIA.md`
- **Coluna/tipo/célula/editor/formatação/expressão** → `03-COLUNAS-CELULAS-TIPOS.md`
- **Renderização Tabulator/HTML/eventos de célula** → `04-RENDER-TABULATOR.md`
- **Dexie/sync/save/refresh/perda de valores** → `05-PERSISTENCIA-DEXIE-SYNC.md`
- **Tela de configuração/import/export/sortable** → `06-CONFIGURADOR-MREND.md`
- **Report/visualização sem edição** → `09-REPORT-MODE.md`
- **SQL/tabelas/inserts/config por IA** → `08-SQL-EAV.md`

## Ficheiros que normalmente bastam
- Motor input: `Input/js/MRend.js`
- Configurador input: `Input/js/MRENDCONFIG LIB.js`
- Entrypoint input: `Input/js/MRend Main.js`
- Motor report: `Report/js/MRendReport.js`
- Config report: `Report/js/MRENDREPORTCONFIG LIB.js`
- SQL input/report: `Input/SQL/MRender tables.sql`, `Report/SQL/MRender tables.sql`

## Duplicados/backups
Existem ficheiros grandes duplicados: `MREND 24 ABR 2026*.js`, `MRend copy.js`, `backup*.js`. Não usar como alvo principal. Usar apenas para comparar comportamento antigo.

## Comando inicial recomendado
"Leia AGENTS.md, .claude/CLAUDE.md e o módulo docs-ai correspondente. Não leia o projeto inteiro. Primeiro diga quais ficheiros mínimos precisa abrir e porquê."

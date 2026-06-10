# 01 — Mapa de ficheiros MRend

## Input
- `Input/js/MRend.js` — motor principal: classes de domínio, mapeamento EAV, geração de linhas/colunas, Tabulator, edição, persistência e cálculos.
- `Input/js/MRENDCONFIG LIB.js` — UI de configuração: criar/editar linhas, colunas, células, grupos de colunas, import/export, sortable.
- `Input/js/MRend Main.js` — inicialização/cola de execução.
- `Input/js/RELATORIO-MAIN.js` — integração/arranque de relatório/input em contexto PHC.
- `Input/js/BO-GRELHA AVALIAÇÃO COTAÇÕES.js` — script específico de negócio/exemplo.
- `Input/scripts/*.vb` e `Input/js/*.vb` — scripts PHC para obter/gravar configuração e registos.
- `Input/SQL/*.sql` — criação de tabelas/SPs.

## Report
- `Report/js/MRendReport.js` — versão para report/visualização.
- `Report/js/MRENDREPORTCONFIG LIB.js` — configuração para report.
- `Report/scripts/*.vb`, `Report/SQL/*.sql` — backend PHC/SQL do report.

## Prompts e documentação existente
- `prompts/01-ARCHITECTURE.md` — arquitetura original detalhada.
- `prompts/02-KBS-CONFIG-AI-PROMPT.md` — prompt para gerar INSERTs SQL/configuração.
- `Docs/CONTEXTO-SESSAO-2026-05-29.md` — contexto de fixes recentes em EAV/hierarquia.
- `Docs/FIXES-2026-05-29.md` — fixes de persistência e `cellIdField`.

## Alvos preferenciais por tarefa
- Bug visual/célula/Tabulator: `Input/js/MRend.js`.
- Bug no ecrã de configuração: `Input/js/MRENDCONFIG LIB.js`.
- Adicionar opção ao JSON/rendopt: `Input/js/MRENDCONFIG LIB.js` + `Input/js/MRend.js`.
- Adicionar nova coluna/tipo: `Input/js/MRend.js` + `Input/js/MRENDCONFIG LIB.js` + SQL se precisar persistir novo campo.
- Report mode: usar `Report/js/*` e não mexer em `Input/js/*` salvo se for correção partilhada.

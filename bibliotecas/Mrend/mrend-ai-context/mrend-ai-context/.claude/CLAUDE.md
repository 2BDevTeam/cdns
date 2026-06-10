# Instruções Claude Code — MRend

Não faças scan completo do repositório. Usa `AGENTS.md` e `docs-ai/*` como índice.

## Política de leitura mínima
- Bug de edição/salvamento: ler `docs-ai/05-PERSISTENCIA-DEXIE-SYNC.md` e `Input/js/MRend.js`.
- Novo tipo de coluna/célula: ler `docs-ai/03-COLUNAS-CELULAS-TIPOS.md`, `docs-ai/04-RENDER-TABULATOR.md`, `Input/js/MRend.js`, `Input/js/MRENDCONFIG LIB.js`.
- Nova configuração visual: ler `docs-ai/06-CONFIGURADOR-MREND.md` e `Input/js/MRENDCONFIG LIB.js`.
- SQL/configuração: ler `docs-ai/08-SQL-EAV.md`, `prompts/02-KBS-CONFIG-AI-PROMPT.md` e SQL específico.
- Report: ler `docs-ai/09-REPORT-MODE.md`.

## Restrições de estilo
Projeto usa JS clássico. Preferir `var`, `function`, callbacks e compatibilidade PHC CS Web. Evitar módulos, imports, TypeScript, build tools, `await`, arrow functions e template literals, salvo se já existirem no trecho.

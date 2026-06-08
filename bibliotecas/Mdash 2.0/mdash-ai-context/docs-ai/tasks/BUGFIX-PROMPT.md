# Prompt padrão para bugfix com baixo consumo de contexto

Use este texto no Claude Code/Codex:

```text
Estamos no projeto MDash 2.0. Antes de editar, leia apenas:
1. AGENTS.md
2. docs-ai/00-AGENT-BOOTSTRAP.md
3. docs-ai/01-FILE-MAP.md
4. O módulo docs-ai/modules mais relacionado com o bug.

Não leia backups, rascunhos, samples ou o projeto inteiro.

Bug:
[DESCREVER BUG]

Regras:
- Primeiro diga qual domínio do bug: filtros, fontes/cache, containers/items/objects, layout/slots/tabs, object types, render final Mdash.html ou backend/SQL.
- Depois liste no máximo 5 ficheiros/trechos que pretende abrir.
- Só altere o mínimo necessário.
- Explique risco e teste manual no fim.
```

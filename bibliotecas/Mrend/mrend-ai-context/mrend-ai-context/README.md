# mrend-ai-context

Pacote de contexto para reduzir leitura desnecessária por agentes AI no projeto MRend.

## Como usar
Copiar `AGENTS.md`, `.claude/CLAUDE.md` e `docs-ai/` para a raiz do projeto MRend.

No Claude Code/Codex/Cursor, iniciar tarefas assim:

```text
Leia AGENTS.md e .claude/CLAUDE.md. Não leia o projeto inteiro. Para esta tarefa, escolha o módulo docs-ai correto e diga quais ficheiros mínimos precisa abrir.
```

## Exemplo: novo tipo de coluna
```text
Leia apenas docs-ai/03-COLUNAS-CELULAS-TIPOS.md, docs-ai/04-RENDER-TABULATOR.md, docs-ai/06-CONFIGURADOR-MREND.md, Input/js/MRend.js e Input/js/MRENDCONFIG LIB.js.

Adicionar novo tipo de coluna "percent_progress" que grava em saldo, renderiza percentagem e mostra barra visual. Antes de alterar, apresente plano e ficheiros tocados.
```

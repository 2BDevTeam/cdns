# 02 — Linhas, grupos, subgrupos, modelos e herança

## Conceitos
- `Linha` / `LinhaMrenderConfig` representam linhas configuradas.
- Tipos esperados: `Grupo`, `Subgrupo`, `Singular`.
- `modelo` indica linha template que pode originar novas linhas.
- `rowid` identifica a linha real; `linkid` / `gruporowid` liga a filha ao pai.
- Em EAV, várias células partilham o mesmo `naturezasubrowid` para formar uma linha visual.

## Campos críticos EAV
- `natureza` → código da linha.
- `naturezasubrowid` → rowid real da linha.
- `gruporowid` → rowid do pai.
- `gruponatureza` → código textual do pai.
- `descgrupnatureza` → descrição do pai.
- `naturezaordem` → ordem.

## Funções/zonas importantes em `Input/js/MRend.js`
- `Linha`
- `mapLinha`
- `getRenderedLinhas`
- `setLinhaRender`
- `generateLinhaOrdem`
- `doAddRow`
- `doAddCelulasRow`
- `buildDefaultCelula`
- `resolveFilhaConfig`
- `parseBlacklist`
- `applyBlacklistToConfig`

## Herança e comportamento de grupo
Funcionalidades recentes:
- `comportamentogrupo`
- `corcomportgrupo`
- `colunatitulo`
- `levadesclinha`
- `blacklistheranca`

A blacklist impede herdar propriedades do pai para a filha. Antes de mexer nisso, ler também:
- `Docs/COMPORTAMENTOGRUPO-MREND-24ABR-2026.md`

## Prompt para agente
"Tarefa é sobre linha/hierarquia. Leia apenas `docs-ai/02-LINHAS-HIERARQUIA.md`, `Docs/COMPORTAMENTOGRUPO-MREND-24ABR-2026.md` e `Input/js/MRend.js`. Não leia ficheiros backup/copy."

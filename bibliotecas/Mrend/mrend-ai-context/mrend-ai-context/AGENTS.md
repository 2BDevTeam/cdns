# MRend — Guia rápido para agentes AI

Objetivo: evitar que o agente leia o projeto inteiro. Antes de qualquer alteração, usar este ficheiro como roteador.

## Regra principal
Não abrir todos os ficheiros. Começar por `docs-ai/00-AGENT-BOOTSTRAP.md`, escolher o módulo da tarefa e abrir apenas os ficheiros indicados.

## Ficheiros vivos principais
- `Input/js/MRend.js` — motor principal de input/renderização/edit/sync/hierarquia. Tratar como versão principal mais recente.
- `Input/js/MRENDCONFIG LIB.js` — configurador visual/CRUD de linhas, colunas, células, grupos e import/export.
- `Input/js/MRend Main.js` — arranque/integração leve do input.
- `Report/js/MRendReport.js` — modo relatório/visualização, semelhante ao motor input mas com foco report.
- `Report/js/MRENDREPORTCONFIG LIB.js` — configurador do modo report.
- `Input/SQL/MRender tables.sql` e `Report/SQL/MRender tables.sql` — schema SQL.
- `prompts/*.sql` — exemplos/seed/configurações.

## Evitar por defeito
- `*copy*.js`, `backup*.js`, imagens `.png`, ficheiros duplicados de 24 ABR, salvo se a tarefa pedir comparação histórica.
- Alterar Input e Report ao mesmo tempo sem necessidade.

## Fluxo obrigatório
1. Ler `docs-ai/00-AGENT-BOOTSTRAP.md`.
2. Ler só o módulo relacionado: linhas/colunas/células, render, persistência, SQL, configurador, report.
3. Antes de editar, listar os ficheiros que serão abertos e justificar.
4. Fazer alteração pequena.
5. Indicar testes manuais no PHC/Tabulator/Dexie.

# MDash 2.0 - Instruções para Agentes de Código

## Regra principal
Nunca leia o projeto inteiro antes de alterar código. Comece por `docs-ai/00-AGENT-BOOTSTRAP.md` e depois abra apenas o módulo relacionado com a tarefa.

## Fluxo obrigatório
1. Classifique a tarefa: renderização, configuração, objeto, container/item, fonte, filtro, tabs, layout, cache, SQL adapter, backend PHC/VB, ou CSS/HTML final.
2. Abra `docs-ai/01-FILE-MAP.md`.
3. Abra apenas o ficheiro de módulo em `docs-ai/modules/*` correspondente.
4. Use os anchors e line ranges indicados para abrir trechos específicos.
5. Antes de editar, liste os ficheiros que serão alterados.
6. Depois de editar, explique impacto, risco e testes manuais.

## Proibido
- Não reescrever `MDash config lib.js` inteiro.
- Não reescrever `Mdash.html` inteiro.
- Não mexer nos backups salvo pedido explícito.
- Não alterar nomes de campos `stamp` sem verificar SQL e runtime.
- Não misturar builder/configuração com runtime/renderização final.

## Preferência de estilo do projeto
- JavaScript compatível com browser/PHC, sem dependência de build moderno.
- Evitar `import/export` se o ficheiro atual não usa módulos.
- Preferir funções clássicas quando o ficheiro já usa esse padrão.
- Manter compatibilidade com jQuery, Bootstrap, Tabulator, ECharts e ambiente PHC.

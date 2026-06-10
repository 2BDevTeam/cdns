# 07 — Grupos de colunas, headers e organização visual

## Entidades
- `MrendGrupoColuna`
- `MrendGrupoColunaItem`
- `GrupoColuna`
- `GrupoColunaItem`
- `RenderedColuna`

## Ficheiros
- Configuração: `Input/js/MRENDCONFIG LIB.js`
- Render: `Input/js/MRend.js`

## Funções prováveis
- `mapGrupoColuna`
- `mapGrupoColunaItem`
- `setColunasRender`
- `setColunaGrupoReactive`
- `getMrendGrupoColunaUIObjectFormConfigAndSourceValues`
- `getMrendGrupoColunaItemUIObjectFormConfigAndSourceValues`
- `makeColunasSortable`

## Atenção
Este módulo pode afetar headers multi-nível do Tabulator. Testar:
- colunas sem grupo;
- colunas com grupo;
- reordenação;
- frozen columns;
- export/import de configuração.

## Tabs
Se a tarefa mencionar tabs/abas, procurar primeiro por `tab`, `tabs`, `organizarEcraMrender`, `modoEcraHandler`. Não assumir que tabs são entidade própria sem confirmar no código.

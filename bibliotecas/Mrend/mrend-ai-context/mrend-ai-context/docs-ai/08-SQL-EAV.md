# 08 — SQL, EAV e configuração via inserts

## Tabelas fixas citadas na documentação
- `MRendRelatorio`
- `MrendLinha`
- `MrendColuna`
- `MrendCelula`
- `MrendGrupoColuna`
- `MrendGrupoColunaItem`
- `u_reportl`

## Ficheiros
- `Input/SQL/MRender tables.sql`
- `Report/SQL/MRender tables.sql`
- `Input/SQL/SP GET REPORT WITH TABLE STRUCTURE.sql`
- `Report/SQL/SP GET REPORT WITH TABLE STRUCTURE.sql`
- `prompts/03-INSERT-SCRIPTS-EXAMPLE.sql`
- `prompts/05-INSERT-MAPASINVESTIMENTO.sql`
- `prompts/06-INSERT-PLANONEGOCIOS2.sql`
- `prompts/07-ALTER-COMPORTAMENTOGRUPO.sql`
- `prompts/08-ALTER-COLUNATITULO.sql`

## Modelo EAV
Cada célula = 1 registo em `u_reportl`.
- linha: `natureza`, `naturezasubrowid`, `gruporowid`
- coluna: `rubrica`, `descrubrica`, `tipocol`
- valor: `saldo` para número; `cvalor` para texto/data/table/logic.
- PK célula: `u_reportlstamp`

## Para gerar nova configuração por IA
Ler:
- `prompts/02-KBS-CONFIG-AI-PROMPT.md`
- schema SQL aplicável

Não alterar schema para uma necessidade que possa ser resolvida em JSON/rendopt/config existente.

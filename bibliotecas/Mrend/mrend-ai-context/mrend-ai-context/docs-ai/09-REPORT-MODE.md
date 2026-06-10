# 09 — Report mode

## Ficheiros
- `Report/js/MRendReport.js`
- `Report/js/MRENDREPORTCONFIG LIB.js`
- `Report/scripts/GET CONFIGURAÇÃO RELATÓRIO.vb`
- `Report/scripts/ACTUALIZAR CONFIGURAÇÃO.vb`
- `Report/SQL/MRender tables.sql`

## Diferença mental
Input é para edição/interação. Report é para visualização/relatório. Muito código é parecido, mas não assumir que uma correção em Input deve ser copiada automaticamente para Report.

## Quando mexer em Report
- Bug só aparece na visualização/report.
- Configuração específica de report.
- SQL/script específico em `Report/*`.

## Quando comparar com Input
Se um bug foi corrigido em `Input/js/MRend.js` e aparece também no report, comparar função equivalente em `Report/js/MRendReport.js`, mas aplicar patch mínimo.

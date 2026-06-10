# 05 — Persistência, Dexie, sync e refresh

## Responsabilidade
Manter alterações de células sem perder dados após refresh/refetch do servidor.

## Ficheiro principal
- `Input/js/MRend.js`

## Funções críticas
- `syncChangesToDB`
- `updateCellOnDB`
- `_savePendingEdit`
- `_applyPendingEdits`
- `_clearPendingEdits`
- `buildDefaultCelula`
- `RemoteFetchData`
- `DbTableToMrendObject`
- `DbTableExtras`

## Fix recente importante
Não hardcodar `cellId`. Usar:
- `mrendThis.dbTableToMrendObject.extras.cellIdField || "cellId"`

Documentação associada:
- `Docs/FIXES-2026-05-29.md`
- `Docs/CONTEXTO-SESSAO-2026-05-29.md`

## Campos EAV relevantes
- `u_reportlstamp` → PK real da célula em muitos cenários.
- `cellIdField` → nome configurável do campo PK no Dexie.
- `campo` / `sourceBind` → campo de valor (`saldo`, `cvalor`, etc.).

## Checklist para bug de valor perdido
1. Verificar se o editor dispara `syncChangesToDB`.
2. Verificar se `BindData.sourceKey` usa `cellIdField` correto.
3. Verificar se `updateCellOnDB` procura pelo campo certo.
4. Verificar se `_savePendingEdit` guarda o valor certo.
5. Verificar se `_applyPendingEdits` reaplica após refetch.
6. Testar editar → refresh → valor persiste.

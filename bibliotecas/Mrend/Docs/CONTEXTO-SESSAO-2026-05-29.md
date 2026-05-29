# Contexto da Sessão de Desenvolvimento — MRend.js
**Data:** 2026-05-29  
**Ficheiro principal:** `bibliotecas/Mrend/Input/js/MRend.js`  
**Ficheiro de referência (estável):** `bibliotecas/Mrend/Input/js/MREND 24 ABR 2026.js`

---

## 1. Arquitectura da Biblioteca

### Modelo de dados (EAV — `chunkMapping: false`)
Cada registo da BD representa **uma célula** (uma interseção linha × coluna):

| Campo BD | Papel no MRend |
|---|---|
| `natureza` | Identificador da linha (equivalente a `codigolinha`) |
| `naturezasubrowid` | UUID da linha (equivalente a `rowid`) |
| `rubrica` | Identificador da coluna (`codigocoluna`) — ex: `"valorperiodo___ano_2033"` |
| `gruporowid` | UUID da linha-pai (equivalente a `linkid`) |
| `u_reportlstamp` | PK da célula (equivalente a `cellId` no Dexie) |
| `cvalor` | Valor para colunas de texto |
| `saldo` / `saldoanoact` | Valor para colunas numéricas |
| `u_reportcstamp` | Stamp do relatório (usado para comparação de versões) |

### Mapeamento via `dbTableToMrendObject.extras`
```js
extras: {
    rowIdField:   "naturezasubrowid",   // rowid da linha
    linkField:    "gruporowid",         // linkid (pai)
    colunaField:  "rubrica",            // codigocoluna
    linhaField:   "natureza",           // codigolinha
    cellIdField:  "u_reportlstamp",     // cellId no Dexie ← CRÍTICO para persistência
    ordemField:   "naturezaordem",
    tipocolField: "tipocol",
    descColunaField: "descrubrica",
    linkCodigoField: "gruponatureza",   // código textual do pai
    descLinkField: "descgrupnatureza",  // descrição do pai
}
```

---

## 2. Bugs Encontrados e Corrigidos

### Bug 1 — CRÍTICO: Filhas EAV nunca apareciam após refresh
**Ficheiro/Linha:** `getRenderedLinhas`, ~linha 6031  
**Causa:** `linhasFilhas = linhaRecords.filter(...)` procurava filhas apenas nos registos do template-pai. Em EAV, as filhas têm `codigolinha` diferente do pai, pelo que nunca eram encontradas em `linhaRecords`.  
**Fix:**
```js
// ANTES (bugado):
var linhasFilhas = linhaRecords.filter(function (rec) {
    return rec.linkid == distinctRow.rowid;
});

// DEPOIS (correcto):
var linhasFilhas = records.filter(function (rec) {
    return rec.linkid && rec.linkid.trim() === String(distinctRow.rowid).trim();
});
```

### Bug 2 — Hierarquia com múltiplos níveis (neto, bisneto...)
**Causa:** O loop de filhas ia apenas um nível de profundidade.  
**Fix:** Substituído por `addLinhaRecursivo` — função recursiva que usa `visitados` para evitar loops:
```js
function addLinhaRecursivo(distinctRow, linhaConfig, allRecords) {
    var rowidStr = String(distinctRow.rowid).trim();
    if (visitados[rowidStr]) return;
    visitados[rowidStr] = true;
    var filhasDesteRow = allRecords.filter(function (rec) {
        return rec.linkid && rec.linkid.trim() === rowidStr;
    });
    addLinha(distinctRow, allRecords, linhaConfig, renderedLinhas, filhasDesteRow.length > 0, true, false);
    var distinctFilhas = _.uniqBy(filhasDesteRow, "rowid");
    distinctFilhas.sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
    distinctFilhas.forEach(function (filha) {
        var configFilhaClone = resolveFilhaConfig(linhaConfig, filha);
        if (!configFilhaClone) configFilhaClone = JSON.parse(JSON.stringify(linhaConfig));
        addLinhaRecursivo(filha, configFilhaClone, allRecords);
    });
}
```

### Bug 3 — Linha filha adicionada via botão desaparecia no refresh
**Causa:** `addLinhaFilha` (prototype) chamava `addToLocalRenderedLinhasList` com `renderCelula = false` → nenhuma célula era criada → nada ia para `GNewRecords` → nada era guardado no Dexie.  
**Fix:** Mudar `renderCelula` para `true`:
```js
// ANTES:
renderedLinha.addToLocalRenderedLinhasList([], { rowid: rowid }, false, false);

// DEPOIS:
renderedLinha.addToLocalRenderedLinhasList([], { rowid: rowid }, true, false);
// + comentário explicativo
```
**Efeito:** Agora cada coluna cria um `MrendObject` vazio com `linkid = pai.rowid`, guardado no Dexie com o campo `linkField` (ex: `gruporowid = pai.rowid`). No reload, o `getRenderedLinhas` lê o `linkid` e reconstrói a hierarquia.

### Bug 4 — `rowFormatter` lançava `Error` para linhas desconhecidas
```js
// ANTES:
throw new Error("Linha com rowid " + data.rowid + " não encontrada.");
// DEPOIS:
console.warn("[MRend] rowFormatter: linha rowid=" + data.rowid + " não encontrada.");
return;
```

### Bug 5 — Memory leak: `setInterval` de 500ms nunca limpo
```js
// ANTES:
setInterval(function () { ... }, 500);

// DEPOIS:
mrendThis._styleInterval = setInterval(function () { ... }, 500);
// + ao destruir a tabela:
if (mrendThis._styleInterval) {
    clearInterval(mrendThis._styleInterval);
    mrendThis._styleInterval = null;
}
```

### Bug 6 — `console.log` de debug em caminhos críticos
Removidos 10+ logs de debug de `addLinha`, `addToLocalRenderedLinhasList`, `ViewRender`, `getRenderedLinhas` que corriam por cada célula renderizada.

### Bug 7 — `addLinhaFilha` passava 5 argumentos para função de 4 parâmetros
```js
// ANTES (arg 3 era {} truthy; arg 5 ignorado):
renderedLinha.addToLocalRenderedLinhasList([], "", {}, false, false);
// DEPOIS:
renderedLinha.addToLocalRenderedLinhasList([], { rowid: rowid }, true, false);
```

### Bug 8 — `isColunaTituloGrupo` podia crashar com `GRenderedColunas` vazio
```js
// ANTES:
var primeiraColuna = mrendThis.GRenderedColunas.find(function (c) { return c.config.fixacoluna; })
    || mrendThis.GRenderedColunas[0];

// DEPOIS:
var colunas = Array.isArray(mrendThis.GRenderedColunas) ? mrendThis.GRenderedColunas : [];
var primeiraColuna = colunas.find(function (c) { return c.config && c.config.fixacoluna; })
    || colunas[0];
```

### Bug 9 — Dead code: `linhasPorCodigo` construído mas nunca usado
Removido o loop de construção do objecto `linhasPorCodigo` que ficou órfão após a remoção dos logs de debug.

---

## 3. Funcionalidades Novas na Versão Actual (vs 24 ABR 2026)

### `comportamentogrupo` melhorado
- `isColunaTituloGrupo()` — função centralizada para determinar qual é a coluna título de um grupo
- `levadesclinha` — nova propriedade na linha que mostra a descrição da linha como valor da célula título
- `blacklistheranca` — lista de propriedades NOT herdadas pelas linhas-filha (evita filhas com estilo de grupo)

### Novos campos em `MrendObject`
- `linkCodigo` / `linkCodigoField` — código textual da linha-pai
- `descLink` / `descLinkField` — descrição da linha-pai
- `rowIdField` — nome do campo rowId

### `resolveFilhaConfig()` — centralizada
Única fonte de verdade para resolver a config de uma linha-filha: procura template por `linkstamp`, aplica `blacklistheranca`, devolve clone.

### `createUIObjectWithColumns()` — centralizada
Inicializa o `UIObject` com todos os campos de coluna e valores default, substituindo lógica inline dispersa.

### Persistência de edições pendentes
```
syncChangesToDB()
  → _savePendingEdit(cellId, campo, valor)  ← localStorage
  → updateCellOnDB()                        ← Dexie

handleReportRecords() [refetchDb=true]
  → deleteAllRecords()
  → addBulkData()      ← remote data
  → _applyPendingEdits() ← relê localStorage, faz modify() no Dexie
  → toArray()          ← Dexie com valores corrigidos
```
**Nota:** `clearPendingEdits()` é público — deve ser chamado pelo código externo após gravar com sucesso no servidor.

---

## 4. Problema em Aberto — Valor limpo ao refrescar (NÃO RESOLVIDO)

### Descrição exacta do utilizador
> "ao mudar a célula ele reflecte no indexedb mas e vejo o valor da célula mas ao refrescar ele limpa aquele valor"

**O que acontece passo a passo:**
1. Utilizador edita o valor de uma célula no Tabulator
2. O valor é actualizado correctamente no IndexedDB (Dexie) — confirmado pelo utilizador
3. O valor é visível na célula no UI — confirmado pelo utilizador
4. Utilizador faz refresh da página
5. O valor volta ao original (limpo) — o IndexedDB perde o valor editado

**Nota importante:** O setter do `CellObjectConfig.valor` continua intacto e funciona correctamente — o utilizador confirmou que o mecanismo do setter deve continuar. O problema está no que acontece AO REFRESCAR, não na edição em si.

### Comportamento na versão antiga (24 ABR 2026)
A versão antiga **não tinha** o mecanismo de `_applyPendingEdits`. Mesmo assim, o utilizador diz que "funciona normalmente". Isto indica que na versão antiga, ao refrescar, o stamp (`u_reportcstamp`) **correspondia** ao armazenado em localStorage → `refetchDb = false` → os dados eram lidos directamente do Dexie com os valores editados.

Na nova versão, ou os stamps não correspondem (forçando re-fetch do servidor que sobrescreve o Dexie), ou há outro problema que apaga os valores mesmo quando stamps coincidem.

### Fluxo do problema (hipótese principal)
```
Edição → syncChangesToDB → Dexie actualizado ✓
Refresh →
  databaseAndTableHasRecords() → toArray() do Dexie
  handleReportRecords():
    [se stampAtual === stampArmazenado]
      → usa Dexie directamente → valor deveria estar lá ✓
    [se stamps diferentes]
      → getDataFromRemote() → dados originais do servidor
      → deleteAllRecords() → Dexie apagado ✗
      → addBulkData() → Dexie com valores originais
      → _applyPendingEdits() → deveria restaurar, mas não funciona ✗
```

### Hipóteses de causa (por confirmar)
1. **`extras.cellIdField` não configurado** → `cellId = ""` → condição `if (buildChangeResult.sourceValue && ...)` é falsa → `_savePendingEdit` nunca chamado → nada guardado no localStorage → `_applyPendingEdits` não tem nada para restaurar
2. **Stamp muda em cada pedido** → sempre re-fetch → Dexie sempre sobrescrito → `_applyPendingEdits` não funciona
3. **`campo` errado** → o campo usado para escrever (`bindData.sourceBind`) não corresponde ao campo lido na renderização (`linhaRecord[coluna.config.campo]`)

### Diagnóstico a fazer no browser
```js
// 1. Depois de editar uma célula, verificar se o pending edit foi guardado:
console.log(localStorage.getItem("mrend_pedits_<dbName>_<tableName>"))
// Se null → _savePendingEdit não foi chamado

// 2. Ver cellId das células (deve ser u_reportlstamp, não ""):
mrendInstance.GCellObjectsConfig.slice(0,5)
    .forEach(c => console.log(c.codigocoluna, "cellid:", c.cellid))

// 3. Ver stamps na consola ao refrescar (já tem console.log):
// "Comparing source stamps..." {stampAtual, stampArmazenado}
// Se sempre diferentes → stamps mudam no servidor
```

### O que a versão antiga fazia diferente
A versão de 24 ABR (`MREND 24 ABR 2026.js`) NÃO TEM:
- `_savePendingEdit` / `_applyPendingEdits` / `_pendingEditsKey`
- O path `refetchDb=true` apenas fazia `deleteAllRecords → addBulkData → resolve` (sem restaurar edições)

Portanto, se a versão antiga "funciona normalmente" com edições persistentes, significa que na versão antiga o stamp **sempre coincide** entre refreshes. Algo na nova versão altera o comportamento de comparação de stamps ou de leitura do Dexie.

---

## 5. Fluxo de Renderização (versão actual)

```
render()
  → InitDB()
  → handleReportRecords()
      [stampAtual === stampArmazenado]
        → mrendThis.records = Dexie.toArray()
        → resolve(refetchDb: false)
      [stamps diferentes]
        → getDataFromRemote()
        → deleteAllRecords()
        → ConvertDbTableToMrendObject() → addBulkData()
        → _applyPendingEdits()
        → Dexie.toArray() → mrendThis.records = mergedRecords
        → resolve(refetchDb: true)
  → RenderHandler(mrendThis.records)
      → ViewRender(records)
          → initTableDataAndContainer()   [limpa GCellObjectsConfig, GRenderedLinhas, etc.]
          → GRenderedLinhas = []
          → setColunasRender()
          → getRenderedLinhas(records)
              → para cada template em linhasToRender:
                  → addLinhaRecursivo(pai, config, records)
                      → addLinha() → addToLocalRenderedLinhasList() → setLinha()
                          → buildDefaultCelula() por coluna
                              → linhaRecord = records.find(coluna match)
                              → cellId = linhaRecord.cellId (ou generateUUID se novo)
                              → valorCelula = linhaRecord[campo]
                              → CellObjectConfig criado → addToLocalCellList()
                              → UIObject[codigocoluna] = valor
                              → se novo → GNewRecords.push()
                      → recursão para filhas (linkid == pai.rowid)
              → GGridData = top-level UIObjects (com _children para filhas)
          → GRenderedLinhas = renderedLinhas
          → RenderSourceTable()
              → addNewRecords()   [guarda novos registos no Dexie]
              → new Tabulator(...)
```

---

## 6. Fluxo de Edição de Célula

```
Tabulator.cellEdited
  → updateCellObjectConfig(campo, rowData)
      → GCellObjectsConfig.find(codigocoluna + rowid)
      → cellObjectConfig.valor = novoValor
          [setter Object.defineProperty]
          → handleDataType(dataType, novoValor) = formattedValue
          → se _valor !== formattedValue:
              → syncChangesToDB(this, handleDataTypeDB(dataType, novoValor))
                  → _savePendingEdit(cellid, campo, valor)   [localStorage]
                  → updateCellOnDB({sourceKey:"cellId", sourceValue:cellid, changedData:{campo:valor}})
                      → db[tabela].where("cellId").equals(cellid).modify({campo:valor})
              → reactiveData update
          → _valor = formattedValue
      → atualizarTotalLinha()
```

---

## 7. Ficheiros Relevantes

| Ficheiro | Descrição |
|---|---|
| `Input/js/MRend.js` | Versão actual (~8100 linhas) |
| `Input/js/MREND 24 ABR 2026.js` | Versão estável de referência |
| `Input/js/MRend Main.js` | Entry point / inicialização |
| `MRENDCONFIG LIB.js` | Gestão de configuração do relatório |
| `MRender tables.sql` | Schema da BD |
| `Docs/CONTEXTO-SESSAO-2026-05-29.md` | Este ficheiro |

---

## 8. Notas de Configuração Críticas

```js
new Mrend({
    dbTableToMrendObject: {
        table: "u_reportl",
        tableKey: "u_reportlstamp",   // PK da tabela
        chunkMapping: false,           // formato EAV
        dbName: "MRendDB",            // nome do IndexedDB
        extras: {
            cellIdField:  "u_reportlstamp",   // OBRIGATÓRIO para persistência de edições
            rowIdField:   "naturezasubrowid",
            linkField:    "gruporowid",        // campo de hierarquia pai-filho
            colunaField:  "rubrica",
            linhaField:   "natureza",
            ordemField:   "naturezaordem",
            tipocolField: "tipocol",
        }
    },
    remoteFetch: true,
    remoteFetchData: { url: "...", type: "POST", data: { ... } }
})
```

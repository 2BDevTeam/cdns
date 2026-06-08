# Funcionalidades de `comportamentogrupo` e `blacklistheranca` Adicionadas

**Data:** 2026-05-29  
**Ficheiro:** `bibliotecas/Mrend/Input/js/MREND 24 ABR 2026.js`  
**Versão:** Transferência de funcionalidades do MRend.js (novo) para manter compatibilidade simples

---

## Resumo das Alterações

Foram adicionadas as seguintes funcionalidades ao ficheiro `MREND 24 ABR 2026.js`:

### 1. **Novos Campos em `MrendObject`** (linha ~325)

```js
this.linkCodigo = data.linkCodigo || "";          // Código textual da linha-pai
this.linkCodigoField = data.linkCodigoField || "";  // Nome do campo linkCodigo
this.descLink = data.descLink || "";              // Descrição da linha-pai
this.descLinkField = data.descLinkField || "";    // Nome do campo descLink
```

Estes campos permitem mapear até ao nível de BD ao gravar registos novos (filhas).

---

### 2. **Mapeamento de Novos Campos** (linha ~2491 em `mapRecordToMrendObject`)

```js
linkCodigo: record[extras.linkCodigoField] || "",
linkCodigoField: extras.linkCodigoField || "",
descLink: record[extras.descLinkField] || "",
descLinkField: extras.descLinkField || "",
```

---

### 3. **Propagação de Código/Descrição da Linha-Pai** (linha ~3520 em `buildDefaultCelula`)

Quando um registo novo é criado:
- Resolve a linha-pai a partir do `rowid` da filha
- Propaga `linkCodigo` (código textual do pai)
- Propaga `descLink` (descrição do pai)
- Normaliza o código (remove timestamp `___xxx`)
- Grava os campos na BD conforme configuração

---

### 4. **Função `parseBlacklist()`** (linha ~3147)

Converte blacklist em múltiplos formatos (array, JSON string, CSV) para array de propriedades:

```js
function parseBlacklist(blacklistValue) {
    // Array: ["comportamentogrupo", "levadesclinha"]
    // JSON:  "[\"comportamentogrupo\", \"levadesclinha\"]"
    // CSV:   "comportamentogrupo, levadesclinha"
}
```

---

### 5. **Função `applyBlacklistToConfig()`** (linha ~3178)

Aplica blacklist a um config object resetando propriedades especificadas:

```js
function applyBlacklistToConfig(config, blacklistValue) {
    // Para cada propriedade na blacklist:
    // - boolean → false
    // - number → 0
    // - string → ""
}
```

---

### 6. **Propriedades `levadesclinha` e `blacklistheranca` na Classe `Linha`** (linha ~413)

```js
this.levadesclinha = data.levadesclinha || false;

var defaultBlacklist = "comportamentogrupo,corcomportgrupo,colunatitulo,levadesclinha,temtotais,modelo";
this.blacklistheranca = data.blacklistheranca || defaultBlacklist;
```

**Blacklist padrão:**
- `comportamentogrupo` — filhas não herdam estilo de grupo
- `corcomportgrupo` — cor de grupo não é herdada
- `colunatitulo` — coluna título não é herdada
- `levadesclinha` — descrição como valor não é herdada
- `temtotais` — configuração de totais não é herdada
- `modelo` — flag modelo não é herdada

---

### 7. **Função `isColunaTituloGrupo()`** (linha ~3226)

Determina qual é a "coluna título" do grupo para uma linha com `comportamentogrupo: true`.

Prioridade:
1. `linha.colunatitulo` (se definido) — coluna explícita
2. `linha.levadesclinha` → primeira coluna fixa ou primeira coluna do grid
3. `coluna.fixacoluna` (fallback legado)

---

### 8. **Função `resolveFilhaConfig()`** (linha ~3259)

**Função central** que resolve config de uma linha-filha:

```js
function resolveFilhaConfig(parentConfig, filhaRecord) {
    // 1. Procura template filha via linkstamp (relação canónica)
    // 2. Se múltiplas filhas e filhaRecord, narrowa para específica
    // 3. Fallback: usa primeira filha ou config do pai
    // 4. Clone + aplica blacklistheranca se configurada
    // 5. Retorna config-filha pronta para usar
}
```

Esta é a **única fonte de verdade** para resolver config de filhas — usada em:
- `addLinhaFilha()` — ao adicionar filha via botão
- `processFilhasRecursivo()` — ao processar filhas recursivamente
- `getRenderedLinhas()` — ao carregar filhas do Dexie no refresh

---

### 9. **Atualização de `addLinhaFilha()`** (linha ~1259)

Agora usa `resolveFilhaConfig` para aplicar blacklist:

```js
RenderedLinha.prototype.addLinhaFilha = function () {
    // 1. Procura template filha directo
    var linhaFilhaConfig = ... .find(...)
    
    // 2. Se não encontrou, usa resolveFilhaConfig (com blacklist)
    var filhaConfig = linhaFilhaConfig || resolveFilhaConfig(this.config, null);
    
    // 3. Cria UIObject e célula vazia com linkid = pai
    // 4. Guarda no Dexie
};
```

---

### 10. **Atualização de `processFilhasRecursivo()`** (linha ~5899)

Agora usa `resolveFilhaConfig` para cada filha:

```js
linhasFilhas.forEach(function (linhaFilha) {
    // Aplica blacklistheranca para cada filha
    var linhaFilhaConfig = resolveFilhaConfig(linhaPai, { codigolinha: linhaFilha.codigo });
    
    // Passa config-filha (com blacklist) para addLinha
    addLinha(dstRowFilha, [], linhaFilhaConfig, ...);
    
    // Recursão para netos (bisnetos, etc.)
    processFilhasRecursivo(linhaFilhaConfig, rowidFilha, ...);
});
```

---

### 11. **Atualização de `getRenderedLinhas()`** (linha ~5824)

Ao carregar filhas do Dexie no refresh:

```js
distinctRowFilhas.forEach(function (filha) {
    // Resolve config correta com blacklist
    var linhaFilhaConfig = resolveFilhaConfig(linhaToRender, filha);
    
    // Renderiza filha com config correta
    addLinha(filha, linhaRecords, linhaFilhaConfig, ...);
});
```

---

## Como `comportamentogrupo` Funciona Agora

### Ao Adicionar Filha (via botão "Adicionar Filho")
```
Pai (comportamentogrupo: true)
  ↓ addLinhaFilha()
  ↓ resolveFilhaConfig(pai)
  ↓ Procura template filha por linkstamp
  ↓ Se encontra: filha usa sua própria config (sem comportamentogrupo)
  ↓ Se não: aplica blacklist ao pai → filha sem grupo
  ↓ UIObject criado + célula vazia por coluna (linkid = pai.rowid)
  ↓ Guardado no Dexie ✓
```

### Ao Listar/Refrescar Dados
```
getRenderedLinhas(records_do_dexie)
  ↓ Para cada linha pai:
  ↓   Para cada filha encontrada (linkid == pai.rowid):
  ↓     resolveFilhaConfig(pai, filha)
  ↓     → Template filha (sem comportamentogrupo) ✓
  ↓   addLinha(filha_com_config_correta)
  ↓   setLinhaRender / setLinha / buildDefaultCelula
  ↓ Renderiza corretamente ✓
```

---

## Propriedades Que Circulam Através de Filhas

### Herdadas (a menos que em blacklist)
- Estilos, cores, configurações gerais

### NÃO Herdadas (na blacklist padrão)
- `comportamentogrupo` — filha não é grupo
- `corcomportgrupo` — cor de grupo
- `colunatitulo` — coluna título do grupo
- `levadesclinha` — descrição como valor
- `temtotais` — linha tem totais
- `modelo` — é modelo de dados

### Sempre Propagadas
- `linkCodigo` / `descLink` — código e descrição do pai
- Configurações de comportamento herdáveis

---

## Testes Recomendados

### 1. Adicionar Filha a um Grupo
```
1. Criar linha com comportamentogrupo: true
2. Clique no botão "Adicionar Filho"
3. ✓ Filha deve aparecer com config normal (sem fundo colorido de grupo)
4. ✓ Célula deve ser editável
5. ✓ Valores podem ser inseridos
```

### 2. Refresh de Página
```
1. Editar valores na filha
2. Refrescar a página
3. ✓ Filha deve aparecer com valores editados
4. ✓ Config correta (sem comportamentogrupo)
5. ✓ linkCodigo e descLink presentes na BD
```

### 3. Múltiplas Filhas
```
1. Criar várias filhas da mesma mãe
2. ✓ Cada uma deve usar sua própria template config
3. ✓ Nenhuma deve herdar comportamentogrupo indevidamente
4. ✓ Blacklist aplicada corretamente
```

### 4. Netos (Filhas de Filhas)
```
1. Filha com suas próprias filhas
2. ✓ Recursão funciona corretamente
3. ✓ Cada nível tem config apropriada
4. ✓ Sem loops ou duplicação
```

---

## Configuração Necessária (MRENDCONFIG LIB.js)

Para usar estas funcionalidades:

```js
new Mrend({
    dbTableToMrendObject: {
        extras: {
            linkCodigoField: "gruponatureza",      // Campo do código da linha-pai
            descLinkField: "descgrupnatureza",     // Campo da descrição do pai
            // ... outros campos ...
        }
    },
    // Configuração das linhas com grupos:
    config: {
        linhas: [
            {
                codigo: "grupo_exemplo",
                comportamentogrupo: true,           // É um grupo
                corcomportgrupo: "#f0f0f0",        // Cor de fundo
                levadesclinha: true,               // Mostra descrição como valor
                blacklistheranca: "comportamentogrupo,levadesclinha",  // Custom blacklist (opcional)
                addfilho: true,                    // Pode ter filhas
                linkstamp: "stamp_da_filha",       // Aponta para template filha
                // ...
            },
            {
                codigo: "filha_exemplo",
                linhastamp: "stamp_da_filha",
                // Nota: sem comportamentogrupo (ou false)
                // ... config da filha ...
            }
        ]
    }
})
```

---

## Ficheiros Modificados

- `bibliotecas/Mrend/Input/js/MREND 24 ABR 2026.js` — 11 mudanças (sem commit/push)

**IMPORTANTE:** Não foram feitos commits nem push ao GitHub, conforme solicitado.


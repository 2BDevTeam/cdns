# Ajustes de `comportamentogrupo` e `blacklistheranca` — MRend.js (2026-05-29)

## Contexto
A versão `MREND 24 ABR 2026.js` funciona bem mas **não tem** a funcionalidade de `blacklistheranca`. O objetivo era adicionar essa funcionalidade mantendo **exatamente** o funcionamento da versão antiga, sem mexer no motor de renderização.

---

## Cambios Realizados

### 1. Simplificação de `resolveFilhaConfig()` (linhas 454-491)

**Antes (versão nova que tinha problemas):**
```js
// Procurava template filha, clonava, e SEMPRE aplicava blacklist
// Isto causava remoção indevida de propriedades
```

**Depois (alinhado com MREND 24 ABR 2026):**
```js
function resolveFilhaConfig(parentConfig, filhaRecord) {
    // 1. Procura template filha via linkstamp
    var linhasFilhas = mrendThis.reportConfig.config.linhas.filter(function (l) {
        return l.linkstamp === parentConfig.linhastamp;
    });
    
    // 2. Usa a PRÓPRIA config da filha (não herda do pai)
    var filhaConfig = linhasFilhas[0];
    
    // 3. Fallback: se não há template filha, usa config do pai
    if (!filhaConfig) {
        filhaConfig = parentConfig;
    }
    
    // 4. Clone para mutação livre
    var clone = JSON.parse(JSON.stringify(filhaConfig));
    
    // 5. APENAS aplica blacklist se explicitamente configurada
    if (parentConfig.blacklistheranca) {
        applyBlacklistToConfig(clone, parentConfig.blacklistheranca);
    }
    
    return clone;
}
```

**Impacto:**
- Filhas usam a sua própria config template (ex: sem `comportamentogrupo: true`)
- `blacklistheranca` é aplicada **apenas** quando configurada (não por padrão)
- Mantém compatibilidade com comportamento anterior

---

### 2. Simplificação de `addLinhaFilha()` (linhas 1462-1502)

**Antes (versão nova):**
```js
// Usava APENAS resolveFilhaConfig
var filhaConfig = resolveFilhaConfig(this.config, null);
// Isto não dava prioridade à procura direta de template filha
```

**Depois (alinhado com MREND 24 ABR 2026):**
```js
RenderedLinha.prototype.addLinhaFilha = function () {
    // 1. Procura PRIMEIRO a template filha via linkstamp (lógica versão antiga)
    var linhaFilhaConfig = mrendThis.reportConfig.config.linhas.find(function (l) {
        return l.linkstamp === self.config.linhastamp;
    });
    
    // 2. Se encontrou, usa diretamente
    var filhaConfig = linhaFilhaConfig;
    
    // 3. Se não encontrou, usa resolveFilhaConfig (com fallback + blacklist)
    if (!filhaConfig) {
        filhaConfig = resolveFilhaConfig(this.config, null);
    }
    
    // 4. UIObject simples (lógica versão antiga)
    renderedLinha.UIObject = {
        id: renderedLinha.rowid,
        rowid: renderedLinha.rowid
    };
    
    // 5. Cria célula vazia por coluna (linkid = pai)
    renderedLinha.addToLocalRenderedLinhasList([], { rowid: rowid }, true, false);
};
```

**Impacto:**
- Prioriza procura direta de template filha (versão antiga)
- Fallback apenas quando necessário
- UIObject simples, sem complexidade desnecessária

---

## Como `comportamentogrupo` Funciona Agora

### Ao Adicionar Filha (via botão)
```
Pai (com comportamentogrupo: true) → addLinhaFilha()
  → Procura template filha por linkstamp
  → Se encontra: filha usa sua própria config (comportamentogrupo: false normalmente)
  → Se não encontra: fallback ao pai com blacklistheranca aplicada
  → UIObject criado
  → Célula vazia criada por coluna (linkid = rowid do pai)
  → Guardado no Dexie
```

### Ao Listar/Refrescar Dados
```
getRenderedLinhas(records)
  → addLinhaRecursivo() para cada linha pai
    → Procura filhas (linkid == rowid do pai)
    → Para cada filha: resolveFilhaConfig(pai, filha)
      → Procura template filha
      → Usa config da filha (sem comportamentogrupo)
      → Aplica blacklist se configurada
    → addLinha() para renderizar
```

---

## Propriedades Novas que Circulam Através de Filhas

Os seguintes campos **propagam-se corretamente** para filhas:
- `linkCodigo` / `linkCodigoField` — código textual da linha-pai
- `descLink` / `descLinkField` — descrição da linha-pai

Estes são preenchidos em `buildDefaultCelula()` quando um registo novo é criado (linhas 3774-3796).

---

## O que Não Mudou

⚠️ **IMPORTANTE**: Não foram alterados:
- `addLinhaRecursivo()` — motor de renderização durante refresh
- `processFilhasRecursivo()` — motor de processamento recursivo
- `getRenderedLinhas()` — lógica geral de renderização
- Qualquer outro aspecto do motor de renderização

Isto evita regressões como a que aconteceu anteriormente.

---

## Testes Recomendados

1. **Adicionar filha a um grupo:**
   - Criar linha com `comportamentogrupo: true`
   - Clicar botão "Adicionar filho"
   - Verificar que a filha **não** tem `comportamentogrupo: true`
   - Verificar que a célula aparece e valores podem ser editados

2. **Refresh de página:**
   - Editar valores na filha
   - Refrescar página
   - Verificar que filha mantém valores editados
   - Verificar que herança de propriedades está correta (sem comportamentogrupo)

3. **Múltiplas filhas:**
   - Criar várias filhas
   - Verificar que cada usa sua própria config (ou com blacklist aplicada)
   - Não devem herdar indevidamente propriedades do pai

---

## Ficheiros Modificados

- `bibliotecas/Mrend/Input/js/MRend.js` (2 funções simplificadas)

## Commits Relacionados

1. **81a724d** — Fix critical bugs in MRend.js (cellIdField)
2. **1627614** — Align comportamentogrupo with MREND 24 ABR 2026 logic

---

## Próximos Passos

Se ainda existem problemas com herança de propriedades:
1. Verificar configuração de `blacklistheranca` no relatório (MRENDCONFIG LIB.js)
2. Confirmar que templates de filha têm config correta
3. Testar com console para debug de `comportamentogrupo` e `blacklistheranca`

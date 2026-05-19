# 🐛 Bug Fix: Filtros Não Renderizam e Não Persistem

## Problema Identificado

**Sintomas:**
1. Filtros configurados no painel de propriedades não aparecem na tabela
2. Ao refrescar a página, a configuração dos filtros desaparece (outras configs ficam gravadas)

## Causa Raiz

### 🔴 Problema 1: Variável Local vs Referência do Objeto

**Em `renderTablePropertiesInline()`** (linha 1611-1613):
```javascript
var cfg = obj.config
    ? JSON.parse(JSON.stringify(obj.config))  // ← CÓPIA independente!
    : JSON.parse(JSON.stringify(_TABLE_SAMPLE_CONFIG));
```

A variável `cfg` é uma **cópia independente** de `obj.config`, não uma referência.

**Nos event handlers** (adicionar/editar/remover filtro):
```javascript
// ANTES (ERRADO):
cfg.filters.definitions.push(newFilter);  // ← Modifica só a cópia local!
```

Quando `fire()` era chamado, ele invocava:
```javascript
_tblReadConfig(panel, obj);  // ← Cria NOVA variável cfg = obj.config
```

Se `obj.config` nunca teve filtros, `cfg.filters` ficava vazio, ignorando as modificações feitas na cópia local.

### 🔴 Problema 2: `_tblReadConfig` Não Reconstruía Definitions

**Em `_tblReadConfig()`** (linha 2336-2343):
```javascript
// ANTES (ERRADO):
if (!cfg.filters) cfg.filters = { enabled: false, activeFilterKey: null, definitions: [] };
cfg.filters.enabled = panel.find('.mtbl-filters-enable').is(':checked');
panel.find('.mtbl-filter-item').each(function() {
    var idx = $(this).data('idx');
    if (cfg.filters.definitions && cfg.filters.definitions[idx]) {  // ← Array vazio = nada acontece!
        cfg.filters.definitions[idx].label = $(this).find('.mtbl-filter-label').val();
    }
});
```

A função **assumia** que `cfg.filters.definitions` já tinha os filtros, e apenas atualizava labels. Se o array estivesse vazio, não fazia nada!

---

## ✅ Solução Aplicada

### Fix 1: Event Handlers Modificam `obj.config` Diretamente

Todos os event handlers agora modificam **`obj.config.filters`** ao invés de `cfg.filters`:

**Adicionar Filtro** (linha ~1987):
```javascript
// DEPOIS (CORRETO):
if (!obj.config) obj.config = {};
if (!obj.config.filters) obj.config.filters = { enabled: true, activeFilterKey: null, definitions: [] };
if (!obj.config.filters.definitions) obj.config.filters.definitions = [];

var newFilter = { key: 'filtro_' + Date.now(), label: 'Novo Filtro', ... };
obj.config.filters.definitions.push(newFilter);  // ← Modifica obj.config!
```

**Editar Filtro** (linha ~2065):
```javascript
// DEPOIS (CORRETO):
if (obj.config && obj.config.filters && obj.config.filters.definitions && obj.config.filters.definitions[idx]) {
    _tblOpenFilterConditionsModal(obj.config.filters.definitions[idx], fields, function(updatedFilter) {
        obj.config.filters.definitions[idx] = updatedFilter;  // ← Atualiza obj.config!
        fire();
    });
}
```

**Remover Filtro** (linha ~2032):
```javascript
// DEPOIS (CORRETO):
if (obj.config && obj.config.filters && obj.config.filters.definitions) {
    obj.config.filters.definitions.splice(idx, 1);  // ← Remove de obj.config!
}
```

**Atualizar Label** (linha ~2022):
```javascript
// DEPOIS (CORRETO):
if (obj.config && obj.config.filters && obj.config.filters.definitions && obj.config.filters.definitions[idx]) {
    obj.config.filters.definitions[idx].label = $(this).val();  // ← Atualiza obj.config!
}
```

### Fix 2: `_tblReadConfig` Preserva `definitions` de `obj.config`

**Em `_tblReadConfig()`** (linha ~2332):
```javascript
// DEPOIS (CORRETO):
if (!cfg.filters) {
    // Se não existir em cfg, tentar ler de obj.config (modificado pelos event handlers)
    if (obj.config && obj.config.filters && obj.config.filters.definitions) {
        cfg.filters = JSON.parse(JSON.stringify(obj.config.filters)); // ← Copia de obj.config!
    } else {
        cfg.filters = { enabled: false, activeFilterKey: null, definitions: [] };
    }
} else if (!cfg.filters.definitions) {
    // Se cfg.filters existe mas definitions não, tentar de obj.config
    if (obj.config && obj.config.filters && obj.config.filters.definitions) {
        cfg.filters.definitions = JSON.parse(JSON.stringify(obj.config.filters.definitions));
    } else {
        cfg.filters.definitions = [];
    }
}

cfg.filters.enabled = panel.find('.mtbl-filters-enable').is(':checked');

// Atualizar labels (condições já foram atualizadas pelos event handlers)
panel.find('.mtbl-filter-item').each(function() {
    var idx = $(this).data('idx');
    if (cfg.filters.definitions && cfg.filters.definitions[idx]) {
        cfg.filters.definitions[idx].label = $(this).find('.mtbl-filter-label').val();
    }
});
```

Agora a função:
1. **Preserva** `cfg.filters.definitions` de `obj.config` (que foi modificado pelos event handlers)
2. **Atualiza** apenas `enabled` e `labels` a partir do DOM
3. **Salva** tudo em `obj.config` e `obj.configjson`

---

## 🧪 Como Testar

### 1. Adicionar Filtro
1. Selecione uma tabela
2. No painel de propriedades, ative **"Ativar filtros rápidos"**
3. Clique **"Adicionar"**
4. Configure um filtro (ex: label "Urgentes")
5. Clique **"Editar"** (ícone engrenagem)
6. Adicione condição: campo "prioridade", operador "=", valor "Urgente"
7. Salve a modal
8. **Abra o Console (F12)** e procure:
   ```
   [Table Filters] Adicionar filtro clicado
   [Table Filters] Filtro adicionado, idx: 0 total: 1
   [Table Filters] Modal salvo, filtro atualizado: {key: "filtro_...", ...}
   [Table Filters] Config lida do painel: {enabled: true, definitions: [...]}
   [Table Filters] obj.config.filters antes de salvar: {enabled: true, definitions: [...]}
   ```

### 2. Verificar Renderização
1. Aguarde o componente re-renderizar (automático após `fire()`)
2. A tabela deve mostrar **barra de filtros** no topo
3. Deve aparecer botão **"Urgentes"** com badge **(count)**
4. No Console:
   ```
   [Table] Renderizando tabela. Config filters: {enabled: true, definitions: [...]}
   [Table Filters] _tblRenderFilters chamado: {enabled: true, definitions: [...]}
   [Table Filters] Renderizando 1 filtros
   [Table Filters] HTML gerado: 345 chars
   ```

### 3. Verificar Persistência
1. **Recarregue a página (F5)**
2. Selecione a mesma tabela
3. Abra o painel de propriedades
4. **A configuração dos filtros deve estar lá**:
   - Checkbox "Ativar filtros rápidos" marcado
   - Filtro "Urgentes" listado
5. **A barra de filtros deve renderizar automaticamente**
6. No Console, ao renderizar:
   ```
   [Table] Renderizando tabela. Config filters: {enabled: true, definitions: [...]}
   [Table Filters] _tblRenderFilters chamado: {enabled: true, definitions: [...]}
   [Table Filters] Renderizando 1 filtros
   ```

### 4. Testar Operações
- ✅ **Adicionar** novo filtro → deve aparecer na lista e renderizar
- ✅ **Editar** filtro existente → deve atualizar condições
- ✅ **Remover** filtro → deve desaparecer da lista e da barra
- ✅ **Alterar label** → deve atualizar em tempo real
- ✅ **Desativar filtros** → deve esconder barra mas preservar definitions

---

## 📊 Logs de Debug

Para diagnosticar problemas, procure estas mensagens no Console:

### ✅ Sucesso - Filtros Funcionando
```
[Table Filters] Adicionar filtro clicado
[Table Filters] Filtro adicionado, idx: 0 total: 1
[Table Filters] Item adicionado ao DOM
[Table Filters] Config lida do painel: {enabled: true, definitions: [Object]}
[Table Filters] obj.config.filters antes de salvar: {enabled: true, definitions: [Object]}
[Table] Renderizando tabela. Config filters: {enabled: true, definitions: [Object]}
[Table Filters] _tblRenderFilters chamado: {enabled: true, definitions: [Object]}
[Table Filters] Renderizando 1 filtros
[Table Filters] HTML gerado: 345 chars
```

### ❌ Problema - Filtros Não Renderizam
```
[Table Filters] Filtros não renderizados
  → hasConfig: true
  → enabled: false        ← PROBLEMA: enabled está false
  → hasDefinitions: true
  → definitionsLength: 0  ← PROBLEMA: definitions está vazio
```

Se vir `enabled: false` ou `definitionsLength: 0`, verifique:
1. Checkbox "Ativar filtros rápidos" está marcado?
2. A configuração foi salva? (deve chamar `realTimeComponentSync`)
3. `obj.config.filters.definitions` tem itens? (expandir no Console)

### ❌ Problema - Configuração Não Persiste
```
[Table Filters] Config lida do painel: {enabled: true, definitions: []}
[Table Filters] obj.config.filters antes de salvar: undefined
```

Se `obj.config.filters` é `undefined` ou `definitions` está vazio **antes de salvar**, significa que os event handlers não estão modificando `obj.config` corretamente. Verifique se o fix foi aplicado.

---

## 🔧 Arquivos Modificados

**Arquivo:** `TEMPLATE DASHBOARD STANDARD EXTENSION.js`

**Funções alteradas:**
1. Event handler `.mtbl-add-filter` (linha ~1987)
2. Event handler `.mtbl-filter-label change` (linha ~2022)
3. Event handler `.mtbl-filter-remove` (linha ~2032)
4. Event handler `.mtbl-filter-edit` (linha ~2060)
5. Função `_tblReadConfig()` (linha ~2332)

**Total de alterações:** ~50 linhas modificadas

---

## 📝 Notas Importantes

1. **`obj.config` é a fonte da verdade**: Todos os event handlers agora modificam `obj.config` diretamente
2. **`cfg` local é descartável**: A cópia local em `renderTablePropertiesInline` não é mais usada para persistência
3. **`_tblReadConfig` preserva definitions**: Não sobrescreve `definitions`, apenas atualiza `enabled` e `labels`
4. **Logs abundantes**: Console mostra cada etapa do fluxo para facilitar debug
5. **Compatibilidade**: Código mantém compatibilidade com configs antigas (fallback para array vazio)

---

## 🚀 Próximos Passos

Após validar que os filtros persistem:
1. Testar filtros com **date constants** (TODAY, WEEK_START, etc.)
2. Testar **múltiplas condições** com AND/OR
3. Testar todos os **16 operadores**
4. Implementar **filtros avançados** (search bar, date range picker - Phase 2)
5. Remover logs de debug após validação completa (opcional)

---

**Data do Fix:** 2026-05-16  
**Versão:** MDash 2.0 - 2026.04.01-refactor  
**Status:** ✅ Correção aplicada e validada (sem erros de sintaxe)

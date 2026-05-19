# Arquitetura de Filtros Customizáveis para Tabelas MDash 2.0

**Versão:** 1.0  
**Data:** 16 Maio 2026  
**Objetivo:** Sistema de filtros reutilizável, extensível e senior para objetos do tipo Table

---

## 1. Visão Geral

Sistema de filtros que permite:
- **Múltiplas apresentações UI**: botões, dropdown, search, date range, chips, range slider
- **Expressões flexíveis**: operadores diversos, condições compostas (AND/OR)
- **Aplicação pós-transformação**: filtros aplicam-se aos dados já transformados
- **Estado persistente**: última seleção mantida no config
- **Performance**: filtros client-side via alasql ou array methods nativos

---

## 2. Estrutura de Configuração

### 2.1. Adição ao `_TABLE_SAMPLE_CONFIG`

```javascript
var _TABLE_SAMPLE_CONFIG = {
    // ... configurações existentes ...
    
    // Nova propriedade para filtros
    filters: {
        enabled: true,                    // Ativar sistema de filtros
        position: 'top',                  // 'top', 'inline' (antes da tabela)
        activeFilterKey: null,            // Chave do filtro atualmente ativo
        definitions: []                   // Array de definições de filtros (ver 2.2)
    }
};
```

### 2.2. Estrutura de um Filtro Individual

Cada filtro no array `filters.definitions` tem esta estrutura:

```javascript
{
    key: 'todos',                        // Identificador único do filtro
    label: 'Todos',                      // Texto exibido
    icon: 'glyphicon-th',                // Ícone opcional (classe glyphicon/fa)
    type: 'button',                      // Tipo de UI (ver 2.3)
    default: true,                       // Este filtro é o padrão ao abrir?
    badge: {                             // Badge opcional com contador
        enabled: true,
        field: 'status',                 // Campo para contar
        value: null,                     // null = contar todos
        format: '{count}'                // Template do badge
    },
    conditions: [                        // Array de condições (ver 2.4)
        {
            field: null,                 // null = sem filtro (mostra tudo)
            operator: null,
            value: null,
            logic: 'AND'                 // 'AND' ou 'OR' com próxima condição
        }
    ],
    style: {                             // Estilos customizados opcionais
        activeColor: '#2563eb',
        backgroundColor: '#f1f5f9'
    }
}
```

### 2.3. Tipos de UI Disponíveis

| Tipo | Descrição | Uso Recomendado |
|------|-----------|-----------------|
| `button` | Botões horizontais (como no mockup) | Filtros mutuamente exclusivos (Todos, Urgente, Hoje) |
| `dropdown` | Select dropdown | Muitas opções (>5), categorias |
| `search` | Input de busca com ícone | Pesquisa livre por texto em múltiplos campos |
| `chips` | Multi-seleção com chips | Filtros múltiplos simultâneos (tags, categorias) |
| `daterange` | Date picker range | Filtros por período |
| `rangeslider` | Slider numérico | Valores, preços, quantidades |
| `toggle` | Switch on/off | Filtros booleanos simples |

### 2.4. Operadores de Condição

```javascript
const FILTER_OPERATORS = {
    // Comparação
    'eq': (fieldValue, filterValue) => fieldValue == filterValue,
    'neq': (fieldValue, filterValue) => fieldValue != filterValue,
    'gt': (fieldValue, filterValue) => parseFloat(fieldValue) > parseFloat(filterValue),
    'gte': (fieldValue, filterValue) => parseFloat(fieldValue) >= parseFloat(filterValue),
    'lt': (fieldValue, filterValue) => parseFloat(fieldValue) < parseFloat(filterValue),
    'lte': (fieldValue, filterValue) => parseFloat(fieldValue) <= parseFloat(filterValue),
    
    // Texto
    'contains': (fieldValue, filterValue) => String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase()),
    'startsWith': (fieldValue, filterValue) => String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase()),
    'endsWith': (fieldValue, filterValue) => String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase()),
    'regex': (fieldValue, filterValue) => new RegExp(filterValue, 'i').test(String(fieldValue)),
    
    // Listas
    'in': (fieldValue, filterValue) => Array.isArray(filterValue) && filterValue.includes(fieldValue),
    'notIn': (fieldValue, filterValue) => Array.isArray(filterValue) && !filterValue.includes(fieldValue),
    
    // Datas
    'dateEq': (fieldValue, filterValue) => _compareDates(fieldValue, filterValue, 'eq'),
    'dateGt': (fieldValue, filterValue) => _compareDates(fieldValue, filterValue, 'gt'),
    'dateLt': (fieldValue, filterValue) => _compareDates(fieldValue, filterValue, 'lt'),
    'dateBetween': (fieldValue, filterValue) => _dateInRange(fieldValue, filterValue[0], filterValue[1]),
    
    // Especiais
    'isNull': (fieldValue) => fieldValue == null || fieldValue === '',
    'isNotNull': (fieldValue) => fieldValue != null && fieldValue !== '',
    'isEmpty': (fieldValue) => !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0),
    'isNotEmpty': (fieldValue) => !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0),
    
    // Funções customizadas
    'custom': (fieldValue, filterValue, row, allRows) => {
        // filterValue é uma função JavaScript que retorna boolean
        if (typeof filterValue === 'function') {
            return filterValue(fieldValue, row, allRows);
        }
        return true;
    }
};
```

---

## 3. Exemplos de Configuração

### 3.1. Exemplo Mockup "Aprovações Pendentes"

```javascript
filters: {
    enabled: true,
    position: 'top',
    activeFilterKey: 'todos',
    definitions: [
        {
            key: 'todos',
            label: 'Todos',
            type: 'button',
            default: true,
            badge: {
                enabled: true,
                field: null,  // conta todos
                format: '{count}'
            },
            conditions: [
                { field: null, operator: null, value: null }  // sem filtro
            ]
        },
        {
            key: 'urgentes',
            label: 'Urgentes',
            type: 'button',
            badge: {
                enabled: true,
                field: 'status',
                value: 'Urgente',
                format: '{count}'
            },
            conditions: [
                {
                    field: 'status',
                    operator: 'eq',
                    value: 'Urgente',
                    logic: 'AND'
                }
            ],
            style: {
                activeColor: '#dc2626',  // vermelho para urgente
                backgroundColor: '#fee2e2'
            }
        },
        {
            key: 'hoje',
            label: 'Hoje',
            type: 'button',
            badge: {
                enabled: true,
                field: 'dataSubmetido',
                value: 'today',  // função especial
                format: '{count}'
            },
            conditions: [
                {
                    field: 'dataSubmetido',
                    operator: 'dateEq',
                    value: 'TODAY',  // constante especial
                    logic: 'AND'
                }
            ]
        },
        {
            key: 'esta_semana',
            label: 'Esta Semana',
            type: 'button',
            badge: {
                enabled: true,
                field: 'dataSubmetido',
                value: 'thisWeek',
                format: '{count}'
            },
            conditions: [
                {
                    field: 'dataSubmetido',
                    operator: 'dateBetween',
                    value: ['WEEK_START', 'WEEK_END'],  // constantes especiais
                    logic: 'AND'
                }
            ]
        }
    ]
}
```

### 3.2. Exemplo com Múltiplas Condições (AND/OR)

```javascript
{
    key: 'criticos_recentes',
    label: 'Críticos Recentes',
    type: 'button',
    conditions: [
        {
            field: 'prioridade',
            operator: 'in',
            value: ['Alta', 'Crítica'],
            logic: 'AND'
        },
        {
            field: 'dataAbertura',
            operator: 'dateGt',
            value: 'LAST_7_DAYS',
            logic: 'AND'
        },
        {
            field: 'estado',
            operator: 'neq',
            value: 'Fechado',
            logic: 'AND'
        }
    ]
}
```

### 3.3. Exemplo com Filtro Personalizado (Custom Function)

```javascript
{
    key: 'pagamentos_vencidos',
    label: 'Pagamentos Vencidos',
    type: 'button',
    conditions: [
        {
            field: 'dataVencimento',
            operator: 'custom',
            value: function(dateValue, row, allRows) {
                // Função custom: verifica se vencido E não pago
                var vencimento = new Date(dateValue);
                var hoje = new Date();
                var vencido = vencimento < hoje;
                var naoPago = row.estado !== 'Pago';
                return vencido && naoPago;
            },
            logic: 'AND'
        }
    ]
}
```

### 3.4. Exemplo com Search Filter

```javascript
{
    key: 'pesquisa',
    label: 'Pesquisar...',
    type: 'search',
    placeholder: 'Pesquisar por nome, referência...',
    searchFields: ['nome', 'colaborador', 'referencia'],  // campos para buscar
    conditions: [
        {
            field: 'nome',
            operator: 'contains',
            value: '{userInput}',  // substituído pelo input do usuário
            logic: 'OR'
        },
        {
            field: 'colaborador',
            operator: 'contains',
            value: '{userInput}',
            logic: 'OR'
        },
        {
            field: 'referencia',
            operator: 'contains',
            value: '{userInput}',
            logic: 'OR'
        }
    ]
}
```

### 3.5. Exemplo com Date Range

```javascript
{
    key: 'periodo_custom',
    label: 'Período Personalizado',
    type: 'daterange',
    conditions: [
        {
            field: 'dataSubmetido',
            operator: 'dateBetween',
            value: ['{startDate}', '{endDate}'],  // substituído pelos dates do picker
            logic: 'AND'
        }
    ]
}
```

### 3.6. Exemplo com Chips (Multi-Select)

```javascript
{
    key: 'categorias',
    label: 'Categorias',
    type: 'chips',
    options: [
        { value: 'Dossiers', label: 'Dossiers', color: '#3b82f6' },
        { value: 'Férias', label: 'Férias', color: '#10b981' },
        { value: 'Faltas', label: 'Faltas', color: '#f59e0b' },
        { value: 'Pagamentos', label: 'Pagamentos', color: '#8b5cf6' }
    ],
    conditions: [
        {
            field: 'tipo',
            operator: 'in',
            value: '{selectedChips}',  // array de valores selecionados
            logic: 'AND'
        }
    ]
}
```

---

## 4. Constantes Especiais para Datas

Sistema suporta constantes que são resolvidas em runtime:

| Constante | Descrição | Exemplo |
|-----------|-----------|---------|
| `TODAY` | Data de hoje (00:00:00) | 2026-05-16 00:00:00 |
| `NOW` | Data/hora atual | 2026-05-16 14:32:15 |
| `YESTERDAY` | Ontem | 2026-05-15 00:00:00 |
| `TOMORROW` | Amanhã | 2026-05-17 00:00:00 |
| `WEEK_START` | Início da semana (Segunda) | 2026-05-11 00:00:00 |
| `WEEK_END` | Fim da semana (Domingo) | 2026-05-17 23:59:59 |
| `MONTH_START` | Primeiro dia do mês | 2026-05-01 00:00:00 |
| `MONTH_END` | Último dia do mês | 2026-05-31 23:59:59 |
| `YEAR_START` | Primeiro dia do ano | 2026-01-01 00:00:00 |
| `YEAR_END` | Último dia do ano | 2026-12-31 23:59:59 |
| `LAST_7_DAYS` | 7 dias atrás | 2026-05-09 00:00:00 |
| `LAST_30_DAYS` | 30 dias atrás | 2026-04-16 00:00:00 |
| `LAST_90_DAYS` | 90 dias atrás | 2026-02-15 00:00:00 |
| `NEXT_7_DAYS` | Daqui a 7 dias | 2026-05-23 23:59:59 |
| `NEXT_30_DAYS` | Daqui a 30 dias | 2026-06-15 23:59:59 |

---

## 5. Fluxo de Dados

```
┌─────────────────────────┐
│   Fonte Original        │
│   (SQL/API/Cache)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Transform Builder      │
│  (se configurado)       │
│  - Colunas              │
│  - Agregações           │
│  - SQL gerado           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Dados Transformados    │ ◄─── AQUI aplicamos filtros
│  (array de objetos)     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Filtro Ativo           │
│  (avalia condições)     │
│  - Operadores           │
│  - AND/OR logic         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Dados Filtrados        │
│  (subset do array)      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Tabulator Render       │
│  (visualização final)   │
└─────────────────────────┘
```

---

## 6. Implementação na UI

### 6.1. Renderização dos Filtros (Tipo: Button)

```javascript
function _renderTableFilters(container, filterConfig, currentData) {
    if (!filterConfig.enabled || !filterConfig.definitions.length) return '';
    
    var html = '<div class="mtbl-filters-bar">';
    
    filterConfig.definitions.forEach(function(filter) {
        if (filter.type === 'button') {
            var isActive = filterConfig.activeFilterKey === filter.key;
            var count = _calculateFilterCount(filter, currentData);
            
            html += '<button type="button" class="mtbl-filter-btn'
                + (isActive ? ' is-active' : '')
                + '" data-filter-key="' + filter.key + '"';
            
            if (filter.style && isActive) {
                html += ' style="background-color:' + filter.style.activeColor + ';border-color:' + filter.style.activeColor + ';"';
            }
            
            html += '>';
            
            if (filter.icon) {
                html += '<i class="' + filter.icon + '"></i> ';
            }
            
            html += filter.label;
            
            if (filter.badge && filter.badge.enabled) {
                html += ' <span class="mtbl-filter-badge">' 
                    + filter.badge.format.replace('{count}', count) 
                    + '</span>';
            }
            
            html += '</button>';
        }
    });
    
    html += '</div>';
    
    return html;
}
```

### 6.2. Motor de Filtragem

```javascript
function _applyTableFilter(rows, filterDef) {
    // Se não há condições ou condição é null (filtro "Todos"), retorna tudo
    if (!filterDef.conditions || !filterDef.conditions.length 
        || filterDef.conditions[0].field === null) {
        return rows;
    }
    
    return rows.filter(function(row) {
        var conditionResults = [];
        
        // Avaliar cada condição
        filterDef.conditions.forEach(function(cond) {
            var fieldValue = row[cond.field];
            var filterValue = _resolveFilterValue(cond.value, row, rows);
            var operator = FILTER_OPERATORS[cond.operator];
            
            if (operator) {
                var result = operator(fieldValue, filterValue, row, rows);
                conditionResults.push({
                    result: result,
                    logic: cond.logic || 'AND'
                });
            }
        });
        
        // Combinar resultados com lógica AND/OR
        return _evaluateConditionLogic(conditionResults);
    });
}

function _evaluateConditionLogic(results) {
    if (!results.length) return true;
    
    var finalResult = results[0].result;
    
    for (var i = 1; i < results.length; i++) {
        var prevLogic = results[i-1].logic;
        var currentResult = results[i].result;
        
        if (prevLogic === 'OR') {
            finalResult = finalResult || currentResult;
        } else {  // AND
            finalResult = finalResult && currentResult;
        }
    }
    
    return finalResult;
}

function _resolveFilterValue(value, row, allRows) {
    // Constantes especiais
    if (typeof value === 'string') {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(value) {
            case 'TODAY': return today;
            case 'NOW': return new Date();
            case 'YESTERDAY': return new Date(today.getTime() - 86400000);
            case 'WEEK_START': return _getWeekStart(today);
            case 'WEEK_END': return _getWeekEnd(today);
            // ... outros casos
        }
    }
    
    return value;
}
```

### 6.3. Event Handling

```javascript
panel.on('click.mtblfilter', '.mtbl-filter-btn', function() {
    var filterKey = $(this).data('filter-key');
    
    // Update config
    cfg.filters.activeFilterKey = filterKey;
    
    // Reaplicar filtro e re-render
    var filterDef = cfg.filters.definitions.find(function(f) { 
        return f.key === filterKey; 
    });
    
    if (filterDef) {
        var allData = _getTransformedData(obj);  // dados pós-transform
        var filteredData = _applyTableFilter(allData, filterDef);
        
        // Update tabulator
        if (window.tabulatorInstances && window.tabulatorInstances[obj.mdashcontaineritemobjectstamp]) {
            window.tabulatorInstances[obj.mdashcontaineritemobjectstamp].setData(filteredData);
        }
        
        // Update visual estado dos botões
        panel.find('.mtbl-filter-btn').removeClass('is-active');
        $(this).addClass('is-active');
        
        // Persist config
        obj.config = cfg;
        obj.configjson = JSON.stringify(cfg);
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(obj, obj.table, obj.idfield);
        }
    }
});
```

---

## 7. Interface de Configuração (Properties Panel)

Adicionar nova seção no painel de propriedades:

```javascript
// ── Secção: Filtros ──
var sFiltros = '<div class="mcbi-field">'
    + '<label style="display:flex;align-items:center;justify-content:space-between;">'
    + '<span>Filtros Rápidos</span>'
    + '<button type="button" class="btn btn-xs btn-default mtbl-add-filter">'
    + '<i class="glyphicon glyphicon-plus"></i> Adicionar</button>'
    + '</label>'
    + '<div class="mtbl-filters-list">';

if (cfg.filters && cfg.filters.definitions && cfg.filters.definitions.length) {
    cfg.filters.definitions.forEach(function(filter, idx) {
        sFiltros += '<div class="mtbl-filter-row" data-idx="' + idx + '">'
            + '<div class="mtbl-filter-handle"><i class="glyphicon glyphicon-menu-hamburger"></i></div>'
            + '<input type="text" class="form-control input-sm mtbl-filter-label" value="' + _mciEsc(filter.label) + '" placeholder="Label">'
            + '<select class="form-control input-sm mtbl-filter-type">'
            + ['button', 'dropdown', 'search', 'chips', 'daterange'].map(function(t) {
                return '<option value="' + t + '"' + (filter.type === t ? ' selected' : '') + '>' + t + '</option>';
            }).join('') + '</select>'
            + '<button type="button" class="btn btn-xs btn-default mtbl-filter-edit" title="Editar condições">'
            + '<i class="glyphicon glyphicon-cog"></i></button>'
            + '<button type="button" class="btn btn-xs btn-danger mtbl-filter-remove" title="Remover">'
            + '<i class="glyphicon glyphicon-trash"></i></button>'
            + '</div>';
    });
} else {
    sFiltros += '<div class="mcbi-info">Nenhum filtro configurado. Clique "Adicionar" para criar.</div>';
}

sFiltros += '</div></div>';
```

### 7.1. Modal de Edição de Condições

Quando clicar no botão "Editar condições" (`mtbl-filter-edit`):

```javascript
panel.on('click', '.mtbl-filter-edit', function() {
    var idx = $(this).closest('.mtbl-filter-row').data('idx');
    var filterDef = cfg.filters.definitions[idx];
    
    _openFilterConditionsModal(filterDef, function(updatedFilter) {
        cfg.filters.definitions[idx] = updatedFilter;
        // Re-render properties panel
        renderTablePropertiesInline(obj, panel);
        fire();
    });
});
```

Modal com builder visual de condições:
- Campo (dropdown dos campos disponíveis da fonte transformada)
- Operador (dropdown: =, !=, >, <, contém, etc.)
- Valor (input ou date picker dependendo do tipo)
- Lógica (AND/OR radio) se houver múltiplas condições
- Botão "Adicionar Condição" para múltiplas condições

---

## 8. Performance e Otimização

### 8.1. Caching

```javascript
var _filterCache = {};

function _getCachedFilteredData(cacheKey, rows, filterDef) {
    if (_filterCache[cacheKey]) {
        return _filterCache[cacheKey];
    }
    
    var filtered = _applyTableFilter(rows, filterDef);
    _filterCache[cacheKey] = filtered;
    
    return filtered;
}

// Limpar cache quando dados mudam
function _clearFilterCache() {
    _filterCache = {};
}
```

### 8.2. Virtual Scrolling

Para datasets grandes (>1000 rows), considerar:
- Tabulator já tem virtual scrolling embutido
- Filtros aplicados antes de passar para Tabulator
- Contadores (badges) calculados incrementalmente

### 8.3. Web Workers (Futuro)

Para filtros muito complexos em datasets enormes:
```javascript
var filterWorker = new Worker('table-filter-worker.js');
filterWorker.postMessage({ rows: data, filter: filterDef });
filterWorker.onmessage = function(e) {
    var filteredData = e.data;
    updateTable(filteredData);
};
```

---

## 9. Extensibilidade Futura

### 9.1. Filtros Salvos (Presets)

```javascript
filters: {
    // ...
    savedPresets: [
        {
            name: 'Urgentes não resolvidos',
            filterKey: 'custom_preset_1',
            conditions: [ /* ... */ ]
        }
    ]
}
```

### 9.2. Filtros com Parâmetros do Utilizador

```javascript
{
    key: 'meu_departamento',
    label: 'Meu Departamento',
    conditions: [
        {
            field: 'departamento',
            operator: 'eq',
            value: '{currentUser.departamento}',  // resolve do contexto
            logic: 'AND'
        }
    ]
}
```

### 9.3. Export de Dados Filtrados

```javascript
{
    exportFiltered: true,  // Ao exportar Excel/PDF, usar dados filtrados
}
```

### 9.4. URL State Sync

```javascript
{
    syncWithUrl: true,  // Filtro ativo na URL: ?filter=urgentes
}
```

---

## 10. Compatibilidade

- **Browsers**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **MDash**: 2.0 (2026.04.01-refactor)
- **Dependencies**: 
  - jQuery 3.x
  - Tabulator 5.x
  - alasql (opcional, para SQL-like filtering)
  - Bootstrap 3.x (para modais)

---

## 11. Roadmap de Implementação

### Fase 1 - MVP (1-2 dias)
- [ ] Estrutura de config (`filters` object)
- [ ] Tipo `button` funcional
- [ ] Operadores básicos (eq, neq, gt, lt, contains)
- [ ] Filtro "Todos" (sem condições)
- [ ] Aplicação pós-transformação
- [ ] Event handling e re-render

### Fase 2 - UI Avançada (2-3 dias)
- [ ] Tipo `search` funcional
- [ ] Tipo `daterange` com date picker
- [ ] Tipo `chips` multi-select
- [ ] Badges com contadores dinâmicos
- [ ] Estilos customizados por filtro

### Fase 3 - Editor de Condições (3-4 dias)
- [ ] Modal de edição de condições
- [ ] Builder visual (campo + operador + valor)
- [ ] Múltiplas condições com AND/OR
- [ ] Preview de resultados no modal
- [ ] Validações e mensagens de erro

### Fase 4 - Features Avançadas (2-3 dias)
- [ ] Constantes especiais de data
- [ ] Operador `custom` com funções JavaScript
- [ ] Filtros salvos (presets)
- [ ] Export de dados filtrados
- [ ] Performance optimization (caching)

### Fase 5 - Polish (1-2 dias)
- [ ] Animações e transições
- [ ] Responsive design (mobile)
- [ ] Documentação inline
- [ ] Testes unitários
- [ ] Exemplos no mockup

---

## 12. Questões em Aberto

1. **Multi-fonte**: Como aplicar filtros quando tabela usa múltiplas fontes mescladas?
   - **Proposta**: Filtros aplicam-se aos dados já mesclados (pós-merge)

2. **Performance**: Limite de rows para filtering client-side?
   - **Proposta**: <10k rows = client-side, >10k = considerar server-side ou lazy loading

3. **Persistência**: Filtro ativo persiste entre sessões?
   - **Proposta**: Sim, via `cfg.filters.activeFilterKey` salvo no config

4. **UI Mobile**: Como exibir múltiplos botões em tela pequena?
   - **Proposta**: Auto-collapse para dropdown em viewports <768px

5. **Conflito com headerFilter**: Como interagem filtros globais com filtros por coluna?
   - **Proposta**: Filtros globais aplicam primeiro, depois headerFilter refina

---

## 13. Conclusão

Esta arquitetura oferece:
- ✅ **Flexibilidade**: Múltiplos tipos de UI, operadores extensíveis
- ✅ **Reutilização**: Sistema genérico para qualquer fonte transformada
- ✅ **Senior Design**: Type-safe, cacheable, extensível
- ✅ **Performance**: Client-side filtering otimizado
- ✅ **UX**: Contadores dinâmicos, estados persistentes, feedback visual

O sistema é completamente **declarativo** (via JSON config), o que permite:
- Configuração via UI (properties panel)
- Export/import de configurações
- Templates de filtros reutilizáveis
- Debugging e troubleshooting facilitados

---

**Próximos Passos:**
1. Validar arquitetura com equipa
2. Criar protótipo funcional (Fase 1)
3. Iterar baseado em feedback
4. Documentar padrões e best practices

// ═══════════════════════════════════════════════════════════════════════════
// TABLE FILTERS SYSTEM - MDash 2.0
// Versão: 1.0.0-MVP
// Data: 16 Maio 2026
// ═══════════════════════════════════════════════════════════════════════════

// ─── OPERADORES DE FILTRO ────────────────────────────────────────────────────

var FILTER_OPERATORS = {
    // Comparação básica
    'eq': function(fieldValue, filterValue) {
        return fieldValue == filterValue;
    },
    'neq': function(fieldValue, filterValue) {
        return fieldValue != filterValue;
    },
    'gt': function(fieldValue, filterValue) {
        return parseFloat(fieldValue) > parseFloat(filterValue);
    },
    'gte': function(fieldValue, filterValue) {
        return parseFloat(fieldValue) >= parseFloat(filterValue);
    },
    'lt': function(fieldValue, filterValue) {
        return parseFloat(fieldValue) < parseFloat(filterValue);
    },
    'lte': function(fieldValue, filterValue) {
        return parseFloat(fieldValue) <= parseFloat(filterValue);
    },
    
    // Texto
    'contains': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
    },
    'startsWith': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
    },
    'endsWith': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
    },
    'regex': function(fieldValue, filterValue) {
        try {
            return new RegExp(filterValue, 'i').test(String(fieldValue));
        } catch(e) {
            return false;
        }
    },
    
    // Arrays
    'in': function(fieldValue, filterValue) {
        return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    },
    'notIn': function(fieldValue, filterValue) {
        return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
    },
    
    // Datas
    'dateEq': function(fieldValue, filterValue) {
        return _compareDates(fieldValue, filterValue, 'eq');
    },
    'dateGt': function(fieldValue, filterValue) {
        return _compareDates(fieldValue, filterValue, 'gt');
    },
    'dateLt': function(fieldValue, filterValue) {
        return _compareDates(fieldValue, filterValue, 'lt');
    },
    'dateGte': function(fieldValue, filterValue) {
        return _compareDates(fieldValue, filterValue, 'gte');
    },
    'dateLte': function(fieldValue, filterValue) {
        return _compareDates(fieldValue, filterValue, 'lte');
    },
    'dateBetween': function(fieldValue, filterValue) {
        if (!Array.isArray(filterValue) || filterValue.length < 2) return false;
        return _dateInRange(fieldValue, filterValue[0], filterValue[1]);
    },
    
    // Nulls/Empty
    'isNull': function(fieldValue) {
        return fieldValue == null || fieldValue === '';
    },
    'isNotNull': function(fieldValue) {
        return fieldValue != null && fieldValue !== '';
    },
    'isEmpty': function(fieldValue) {
        if (fieldValue == null) return true;
        if (Array.isArray(fieldValue)) return fieldValue.length === 0;
        return String(fieldValue).trim() === '';
    },
    'isNotEmpty': function(fieldValue) {
        return !FILTER_OPERATORS.isEmpty(fieldValue);
    },
    
    // Custom function
    'custom': function(fieldValue, filterValue, row, allRows) {
        if (typeof filterValue === 'function') {
            try {
                return filterValue(fieldValue, row, allRows);
            } catch(e) {
                console.error('[Filter] Custom function error:', e);
                return false;
            }
        }
        return true;
    }
};

// ─── FUNÇÕES AUXILIARES DE DATA ──────────────────────────────────────────────

function _parseDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    
    // Tentar parse ISO, brasileiro, etc
    var parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
    
    // Formato brasileiro: DD/MM/YYYY
    var parts = String(value).split('/');
    if (parts.length === 3) {
        var d = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10) - 1;
        var y = parseInt(parts[2], 10);
        return new Date(y, m, d);
    }
    
    return null;
}

function _compareDates(dateValue, filterValue, operator) {
    var d1 = _parseDate(dateValue);
    var d2 = _parseDate(filterValue);
    
    if (!d1 || !d2) return false;
    
    // Comparar só a data (ignorar hora)
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    var t1 = d1.getTime();
    var t2 = d2.getTime();
    
    switch(operator) {
        case 'eq': return t1 === t2;
        case 'gt': return t1 > t2;
        case 'lt': return t1 < t2;
        case 'gte': return t1 >= t2;
        case 'lte': return t1 <= t2;
        default: return false;
    }
}

function _dateInRange(dateValue, startValue, endValue) {
    var d = _parseDate(dateValue);
    var start = _parseDate(startValue);
    var end = _parseDate(endValue);
    
    if (!d || !start || !end) return false;
    
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    var t = d.getTime();
    return t >= start.getTime() && t <= end.getTime();
}

function _getWeekStart(date) {
    var d = new Date(date);
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
    return new Date(d.setDate(diff));
}

function _getWeekEnd(date) {
    var start = _getWeekStart(date);
    return new Date(start.getTime() + 6 * 86400000); // +6 dias = Domingo
}

// ─── RESOLUÇÃO DE CONSTANTES ESPECIAIS ───────────────────────────────────────

function _resolveFilterValue(value, row, allRows) {
    if (typeof value !== 'string') return value;
    
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(value) {
        case 'TODAY':
            return today;
        
        case 'NOW':
            return new Date();
        
        case 'YESTERDAY':
            return new Date(today.getTime() - 86400000);
        
        case 'TOMORROW':
            return new Date(today.getTime() + 86400000);
        
        case 'WEEK_START':
            return _getWeekStart(today);
        
        case 'WEEK_END':
            return _getWeekEnd(today);
        
        case 'MONTH_START':
            return new Date(today.getFullYear(), today.getMonth(), 1);
        
        case 'MONTH_END':
            return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        
        case 'YEAR_START':
            return new Date(today.getFullYear(), 0, 1);
        
        case 'YEAR_END':
            return new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        
        case 'LAST_7_DAYS':
            return new Date(today.getTime() - 7 * 86400000);
        
        case 'LAST_30_DAYS':
            return new Date(today.getTime() - 30 * 86400000);
        
        case 'LAST_90_DAYS':
            return new Date(today.getTime() - 90 * 86400000);
        
        case 'NEXT_7_DAYS':
            return new Date(today.getTime() + 7 * 86400000);
        
        case 'NEXT_30_DAYS':
            return new Date(today.getTime() + 30 * 86400000);
        
        default:
            return value;
    }
}

// ─── MOTOR DE FILTRAGEM ──────────────────────────────────────────────────────

/**
 * Aplica filtro a um array de dados
 * @param {Array} rows - Array de objetos (dados da tabela)
 * @param {Object} filterDef - Definição do filtro
 * @returns {Array} Array filtrado
 */
function _applyTableFilter(rows, filterDef) {
    // Validações básicas
    if (!rows || !Array.isArray(rows)) return [];
    if (!filterDef) return rows;
    
    // Se não há condições ou primeira condição é null (filtro "Todos")
    if (!filterDef.conditions || !filterDef.conditions.length 
        || filterDef.conditions[0].field === null) {
        return rows;
    }
    
    // Filtrar rows
    return rows.filter(function(row) {
        return _evaluateFilterConditions(row, filterDef.conditions, rows);
    });
}

/**
 * Avalia múltiplas condições com lógica AND/OR
 * @param {Object} row - Linha atual
 * @param {Array} conditions - Array de condições
 * @param {Array} allRows - Todas as linhas (para operador custom)
 * @returns {Boolean}
 */
function _evaluateFilterConditions(row, conditions, allRows) {
    if (!conditions || !conditions.length) return true;
    
    var results = [];
    
    // Avaliar cada condição
    for (var i = 0; i < conditions.length; i++) {
        var cond = conditions[i];
        var fieldValue = row[cond.field];
        var filterValue = _resolveFilterValue(cond.value, row, allRows);
        var operator = FILTER_OPERATORS[cond.operator];
        
        if (!operator) {
            console.warn('[Filter] Operador desconhecido:', cond.operator);
            results.push({ result: false, logic: cond.logic || 'AND' });
            continue;
        }
        
        var result = operator(fieldValue, filterValue, row, allRows);
        results.push({ result: result, logic: cond.logic || 'AND' });
    }
    
    // Combinar resultados com lógica AND/OR
    if (!results.length) return true;
    
    var finalResult = results[0].result;
    
    for (var j = 1; j < results.length; j++) {
        var prevLogic = results[j-1].logic;
        var currentResult = results[j].result;
        
        if (prevLogic === 'OR') {
            finalResult = finalResult || currentResult;
        } else {  // AND
            finalResult = finalResult && currentResult;
        }
    }
    
    return finalResult;
}

// ─── CÁLCULO DE CONTADORES (BADGES) ──────────────────────────────────────────

/**
 * Calcula contagem de registos que passam no filtro
 * @param {Object} filterDef - Definição do filtro
 * @param {Array} allData - Todos os dados (pré-filtro)
 * @returns {Number}
 */
function _calculateFilterCount(filterDef, allData) {
    if (!allData || !Array.isArray(allData)) return 0;
    
    // Se tem badge config específico
    if (filterDef.badge && filterDef.badge.field) {
        var field = filterDef.badge.field;
        var value = filterDef.badge.value;
        
        // Contar rows onde field = value
        if (value !== null && value !== undefined) {
            return allData.filter(function(row) {
                return row[field] == value;
            }).length;
        }
        
        // Contar todos
        return allData.length;
    }
    
    // Aplicar filtro e contar
    var filtered = _applyTableFilter(allData, filterDef);
    return filtered.length;
}

// ─── RENDERIZAÇÃO UI ─────────────────────────────────────────────────────────

/**
 * Renderiza barra de filtros (tipo: button)
 * @param {Object} filterConfig - Configuração dos filtros
 * @param {Array} currentData - Dados atuais (para contadores)
 * @returns {String} HTML
 */
function _renderTableFilters(filterConfig, currentData) {
    if (!filterConfig || !filterConfig.enabled || !filterConfig.definitions || !filterConfig.definitions.length) {
        return '';
    }
    
    var html = '<div class="mtbl-filters-bar">';
    
    filterConfig.definitions.forEach(function(filter) {
        if (filter.type === 'button') {
            var isActive = filterConfig.activeFilterKey === filter.key;
            var count = _calculateFilterCount(filter, currentData);
            
            html += '<button type="button" class="mtbl-filter-btn'
                + (isActive ? ' is-active' : '')
                + (filter.default && !filterConfig.activeFilterKey ? ' is-active' : '')
                + '" data-filter-key="' + _mciEsc(filter.key) + '"';
            
            // Estilos customizados
            if (filter.style && isActive) {
                var bgColor = filter.style.activeColor || '#2563eb';
                html += ' style="background-color:' + bgColor + ';border-color:' + bgColor + ';color:#fff;"';
            }
            
            html += '>';
            
            // Ícone opcional
            if (filter.icon) {
                html += '<i class="' + _mciEsc(filter.icon) + '"></i> ';
            }
            
            // Label
            html += _mciEsc(filter.label);
            
            // Badge com contador
            if (filter.badge && filter.badge.enabled) {
                var badgeText = filter.badge.format.replace('{count}', count);
                html += ' <span class="mtbl-filter-badge">' + _mciEsc(badgeText) + '</span>';
            }
            
            html += '</button>';
        }
    });
    
    html += '</div>';
    
    return html;
}

// ─── ESTILOS CSS ─────────────────────────────────────────────────────────────

function _addTableFiltersCSS() {
    if ($('#mtbl-filters-styles').length) return;
    
    var css = '<style id="mtbl-filters-styles">'
        // Container
        + '.mtbl-filters-bar{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;background:#f8fafc;border-bottom:1px solid rgba(0,0,0,.08);}'
        
        // Botão de filtro
        + '.mtbl-filter-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;font-size:13px;font-weight:600;'
        + 'color:#64748b;background:#fff;border:1.5px solid rgba(0,0,0,.12);border-radius:8px;cursor:pointer;'
        + 'transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);white-space:nowrap;}'
        
        // Hover
        + '.mtbl-filter-btn:hover{background:#f1f5f9;border-color:#2563eb;color:#2563eb;transform:translateY(-1px);'
        + 'box-shadow:0 2px 8px rgba(37,99,235,.15);}'
        
        // Ativo
        + '.mtbl-filter-btn.is-active{background:#2563eb;border-color:#2563eb;color:#fff;font-weight:700;'
        + 'box-shadow:0 4px 12px rgba(37,99,235,.25);}'
        
        + '.mtbl-filter-btn.is-active:hover{background:#1d4ed8;border-color:#1d4ed8;}'
        
        // Ícone
        + '.mtbl-filter-btn i{font-size:12px;opacity:.85;}'
        
        // Badge
        + '.mtbl-filter-badge{display:inline-block;min-width:20px;height:20px;padding:0 6px;'
        + 'font-size:11px;font-weight:700;line-height:20px;text-align:center;'
        + 'background:rgba(0,0,0,.12);color:inherit;border-radius:10px;}'
        
        + '.mtbl-filter-btn.is-active .mtbl-filter-badge{background:rgba(255,255,255,.25);color:#fff;}'
        
        // Responsive
        + '@media (max-width: 768px){'
        + '.mtbl-filters-bar{gap:6px;padding:8px 12px;}'
        + '.mtbl-filter-btn{padding:6px 12px;font-size:12px;}'
        + '.mtbl-filter-badge{font-size:10px;min-width:18px;height:18px;line-height:18px;}'
        + '}'
        
        + '</style>';
    
    $('head').append(css);
}

// ─── INTEGRAÇÃO COM TABELA ───────────────────────────────────────────────────

/**
 * Obtém dados transformados (pós-transform builder)
 * @param {Object} obj - MdashContainerItemObject
 * @returns {Array}
 */
function _getTransformedData(obj) {
    // Se tem transformConfig, executar
    if (obj.transformConfig && obj.transformConfig.sourceTable 
        && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(obj.transformConfig);
            return _rawToRows(raw);
        } catch(e) {
            console.error('[Table Filter] Erro ao executar transform:', e);
        }
    }
    
    // Fallback: dados da fonte
    if (obj.fontestamp) {
        var fonte = getMdashFontes().find(function(f) { 
            return f.mdashfontestamp === obj.fontestamp; 
        });
        if (fonte && fonte.lastResultscached) {
            try {
                var cache = JSON.parse(fonte.lastResultscached);
                return _rawToRows(cache);
            } catch(e) {}
        }
    }
    
    return [];
}

/**
 * Event handler para clique em filtro
 */
function _attachTableFilterEvents(panel, obj, cfg) {
    panel.off('click.mtblfilter');
    
    panel.on('click.mtblfilter', '.mtbl-filter-btn', function() {
        var filterKey = $(this).data('filter-key');
        
        // Update active filter
        cfg.filters.activeFilterKey = filterKey;
        
        // Encontrar definição do filtro
        var filterDef = cfg.filters.definitions.find(function(f) { 
            return f.key === filterKey; 
        });
        
        if (!filterDef) return;
        
        // Obter dados transformados
        var allData = _getTransformedData(obj);
        
        // Aplicar filtro
        var filteredData = _applyTableFilter(allData, filterDef);
        
        console.log('[Table Filter] Filtro "' + filterDef.label + '" aplicado:', {
            total: allData.length,
            filtrado: filteredData.length,
            condições: filterDef.conditions
        });
        
        // Update tabulator instance
        var tabulatorId = 'tabulator-' + obj.mdashcontaineritemobjectstamp;
        if (window.tabulatorInstances && window.tabulatorInstances[tabulatorId]) {
            window.tabulatorInstances[tabulatorId].setData(filteredData);
        }
        
        // Update visual estado dos botões
        panel.find('.mtbl-filter-btn').removeClass('is-active');
        $(this).addClass('is-active');
        
        // Atualizar contadores (badges)
        _updateFilterBadges(panel, cfg.filters, allData);
        
        // Persist config
        obj.config = cfg;
        obj.configjson = JSON.stringify(cfg);
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(obj, obj.table, obj.idfield);
        }
    });
}

/**
 * Atualiza contadores nos badges
 */
function _updateFilterBadges(panel, filterConfig, allData) {
    filterConfig.definitions.forEach(function(filter) {
        var count = _calculateFilterCount(filter, allData);
        var $btn = panel.find('.mtbl-filter-btn[data-filter-key="' + filter.key + '"]');
        var $badge = $btn.find('.mtbl-filter-badge');
        
        if ($badge.length && filter.badge && filter.badge.format) {
            var badgeText = filter.badge.format.replace('{count}', count);
            $badge.text(badgeText);
        }
    });
}

// ─── INICIALIZAÇÃO ───────────────────────────────────────────────────────────

/**
 * Inicializa sistema de filtros para uma tabela
 * @param {jQuery} panel - Panel de propriedades
 * @param {Object} obj - MdashContainerItemObject
 * @param {Object} cfg - Config da tabela
 */
function _initTableFilters(panel, obj, cfg) {
    // Inject CSS
    _addTableFiltersCSS();
    
    // Se não tem config de filtros, criar estrutura vazia
    if (!cfg.filters) {
        cfg.filters = {
            enabled: false,
            position: 'top',
            activeFilterKey: null,
            definitions: []
        };
    }
    
    // Se filtros não estão ativos, skip
    if (!cfg.filters.enabled) return;
    
    // Definir filtro padrão se não há nenhum ativo
    if (!cfg.filters.activeFilterKey) {
        var defaultFilter = cfg.filters.definitions.find(function(f) { return f.default; });
        if (defaultFilter) {
            cfg.filters.activeFilterKey = defaultFilter.key;
        }
    }
    
    // Attach event handlers
    _attachTableFilterEvents(panel, obj, cfg);
    
    console.log('[Table Filters] Sistema inicializado', {
        filtros: cfg.filters.definitions.length,
        ativo: cfg.filters.activeFilterKey
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// Export (se módulo)
// ═══════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FILTER_OPERATORS: FILTER_OPERATORS,
        applyTableFilter: _applyTableFilter,
        renderTableFilters: _renderTableFilters,
        initTableFilters: _initTableFilters,
        calculateFilterCount: _calculateFilterCount
    };
}

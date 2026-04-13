// ============================================================================
// DATA SOURCE Operations.js
// MDash 2.0 — Fonte executor registry + sql.js in-memory store
//
// Depende de: sql.js já carregado pelo PHC (window.SQL disponível)
// DB singleton:  window.MDASH_DB
// Tudo que toca em MDashFonte (execução, storage, cache) vive aqui.
// ============================================================================


// ── Singleton DB ─────────────────────────────────────────────────────────────

function getMdashDb() {
    if (!window.MDASH_DB) {
        if (typeof SQL === 'undefined' || !SQL.Database) {
            console.warn('[MDash] sql.js (SQL) ainda não está disponível. DB in-memory não inicializado.');
            return null;
        }
        window.MDASH_DB = new SQL.Database();
    }
    return window.MDASH_DB;
}

function mdashResetDb() {
    if (typeof SQL === 'undefined' || !SQL.Database) {
        console.warn('[MDash] sql.js (SQL) não disponível. Não foi possível fazer reset do DB.');
        return;
    }
    window.MDASH_DB = new SQL.Database();
}


// ── Utilitários internos ──────────────────────────────────────────────────────

function mdashFonteTableName(fonte) {
    return (fonte.codigo || '').replace(/[^a-zA-Z0-9]/g, '_');
}

function mdashInferSqlType(value) {
    if (value === null || value === undefined) return 'TEXT';
    if (typeof value === 'boolean')            return 'INTEGER';
    if (typeof value === 'number')             return Number.isInteger(value) ? 'INTEGER' : 'REAL';
    return 'TEXT';
}

// Converte resultado bruto de db.exec() para array de objectos
function mdashSqlResultToObjects(result) {
    if (!result || !result.length) return [];
    var columns = result[0].columns;
    var values  = result[0].values;
    return values.map(function (row) {
        var obj = {};
        for (var i = 0; i < columns.length; i++) {
            obj[columns[i]] = row[i];
        }
        return obj;
    });
}

// Converte resultado bruto de db.exec() para NormalizedResult
function mdashSqlResultToNormalized(result) {
    if (!result || !result.length) {
        return { columns: [], rows: [], rowCount: 0, error: null };
    }
    return {
        columns:  result[0].columns,
        rows:     result[0].values,
        rowCount: result[0].values.length,
        error:    null
    };
}


// ── In-Memory Store ───────────────────────────────────────────────────────────

/**
 * Carrega um array de objectos [{col: val, ...}] na DB in-memory do sql.js.
 * Substitui a tabela se já existir (comportamento refresh).
 */
function mdashLoadFonteIntoDb(fonte, rows) {
    if (!Array.isArray(rows) || rows.length === 0) return;

    var db = getMdashDb();
    if (!db) return;
    var tableName = mdashFonteTableName(fonte);
    var firstRow  = rows[0];
    var columns   = Object.keys(firstRow);

    // Remove tabela anterior desta fonte
    try { db.run('DROP TABLE IF EXISTS "' + tableName + '"'); } catch (e) {}

    // CREATE TABLE com tipos inferidos da primeira linha
    var colDefs = columns.map(function (col) {
        return '"' + col + '" ' + mdashInferSqlType(firstRow[col]);
    });
    db.run('CREATE TABLE "' + tableName + '" (' + colDefs.join(', ') + ')');

    // INSERT em bulk com prepared statement
    var placeholders = columns.map(function () { return '?'; }).join(', ');
    var stmt = db.prepare('INSERT INTO "' + tableName + '" VALUES (' + placeholders + ')');
    rows.forEach(function (row) {
        stmt.run(columns.map(function (col) {
            var v = row[col];
            return (typeof v === 'boolean') ? (v ? 1 : 0) : (v === undefined ? null : v);
        }));
    });
    stmt.free();
}

/**
 * Remove a tabela in-memory de uma fonte.
 */
function mdashDropFonte(fonte) {
    var db = getMdashDb();
    if (!db) return;
    try {
        db.run('DROP TABLE IF EXISTS "' + mdashFonteTableName(fonte) + '"');
    } catch (e) {}
}

/**
 * Query livre contra a DB in-memory (permite cross-source JOINs).
 * Retorna array de objectos.
 */
function mdashQuery(sql) {
    var db = getMdashDb();
    if (!db) return [];
    try {
        return mdashSqlResultToObjects(db.exec(sql));
    } catch (e) {
        console.error('[MDash] mdashQuery error:', e.message, '| SQL:', sql);
        return [];
    }
}

/**
 * Igual a mdashQuery mas devolve { columns, rows, rowCount, error }.
 */
function mdashQueryRaw(sql) {
    var db = getMdashDb();
    if (!db) return { columns: [], rows: [], rowCount: 0, error: 'sql.js não disponível' };
    try {
        return mdashSqlResultToNormalized(db.exec(sql));
    } catch (e) {
        return { columns: [], rows: [], rowCount: 0, error: e.message };
    }
}

/**
 * Devolve todos os registos da tabela in-memory de uma fonte como array de objectos.
 */
function mdashGetFonteRows(fonte) {
    return mdashQuery('SELECT * FROM "' + mdashFonteTableName(fonte) + '"');
}


// ── Cache Payload ─────────────────────────────────────────────────────────────

var MDASH_PREVIEW_LIMIT = 40;

/**
 * Constrói o JSON a guardar em lastResultscached (preview para o builder).
 */
function mdashBuildCachePayload(rows, columns) {
    var preview = rows.slice(0, MDASH_PREVIEW_LIMIT);
    return {
        columns:   columns  || (rows.length ? Object.keys(rows[0]) : []),
        rows:      preview,
        totalRows: rows.length,
        truncated: rows.length > MDASH_PREVIEW_LIMIT,
        cachedAt:  new Date().toISOString()
    };
}

/**
 * Persiste lastResultscached e schemajson no backend via XHR síncrono.
 * urlSave: URL do script backend que aceita os campos por POST.
 */
function mdashSaveFonteCache(fonte, rows, urlSave) {
    if (!urlSave || !rows || !rows.length) return;

    var columns = Object.keys(rows[0]);
    var payload = {
        mdashfontestamp:   fonte.mdashfontestamp,
        lastResultscached: JSON.stringify(mdashBuildCachePayload(rows, columns)),
        schemajson:        JSON.stringify(columns.map(function (col) {
            return { name: col, type: mdashInferSqlType(rows[0][col]) };
        }))
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', urlSave, false);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(Object.keys(payload).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]);
    }).join('&'));
}


// ── Executor Registry ─────────────────────────────────────────────────────────

var MdashExecutorRegistry = window.MdashExecutorRegistry = (function () {
    var _handlers = [];

    return {
        register: function (handler) {
            _handlers.push(handler);
        },
        getHandler: function (tipo) {
            for (var i = 0; i < _handlers.length; i++) {
                if (_handlers[i].canHandle(tipo)) return _handlers[i];
            }
            return null;
        }
    };
})();


// ── Handler: directquery ──────────────────────────────────────────────────────
// Usa getdbcontaineritemdata (mesmo script que MdashContainerItem.refreshContent).
// O backend busca expressaolistagem da tabela MDashFonte por mdashfontestamp,
// aplica substituição de filtros {token} e executa.
// callback(error, rows[])

MdashExecutorRegistry.register({
    canHandle: function (tipo) { return tipo === 'directquery'; },

    execute: function (fonte, context, callback) {
        var url = fonte.urlfetch || '../programs/gensel.aspx?cscript=getdbcontaineritemdata';
        var dashConfig = (typeof GMDashConfig !== 'undefined' && GMDashConfig.length > 0) ? GMDashConfig[0] : {};

        var requestData = {
            codigo:                        dashConfig.codigo || '',
            mdashfontestamp:               fonte.mdashfontestamp,
            mdashcontaineritemstamp:       '',
            mdashcontaineritemobjectstamp: '',
            tipoquery:                     'fonte',
            filters:                       (context || {}).filters || {}
        };

        $.ajax({
            type:  'POST',
            url:   url,
            async: true,
            data: { '__EVENTARGUMENT': JSON.stringify([requestData]) },
            success: function (response) {
                if (response && response.cod === '0000') {
                    callback(null, response.data || []);
                } else {
                    callback(new Error((response && response.message) || 'Resposta inválida do backend'), null);
                }
            },
            error: function (xhr, status, error) {
                callback(new Error('AJAX error: ' + (error || status)), null);
            }
        });
    }
});


// ── Handler: javascript ───────────────────────────────────────────────────────
// Avalia expressaojslistagem. A função deve retornar (ou chamar callback com) um array de objectos.

MdashExecutorRegistry.register({
    canHandle: function (tipo) { return tipo === 'javascript'; },

    execute: function (fonte, context, callback) {
        try {
            var resolvedParams = {};
            if (Array.isArray(fonte.parametros) && typeof resolveExpressionTokens === 'function') {
                fonte.parametros.forEach(function (p) {
                    var dummy    = '{' + p.token + '}';
                    var resolved = resolveExpressionTokens(dummy, fonte.parametros, (context || {}).parameters);
                    resolvedParams[p.token] = resolved;
                });
            }

            var ctx = Object.assign({}, context || {}, { resolvedParams: resolvedParams });
            var expression = fonte.expressaojslistagem || '';

            if (typeof resolveExpressionTokens === 'function') {
                expression = resolveExpressionTokens(expression, fonte.parametros, (context || {}).parameters);
            }

            var fn     = new Function('context', 'callback', 'mdashQuery', 'mdashQueryRaw', expression);
            var result = fn(ctx, callback, mdashQuery, mdashQueryRaw);

            // suporte retorno síncrono
            if (result !== undefined) {
                callback(null, Array.isArray(result) ? result : [result]);
            }
        } catch (e) {
            callback(e, null);
        }
    }
});


// ── Handler: api ──────────────────────────────────────────────────────────────

MdashExecutorRegistry.register({
    canHandle: function (tipo) { return tipo === 'api'; },

    execute: function (fonte, context, callback) {
        if (!fonte.apiurl) {
            callback(new Error('URL da API não definido'), null);
            return;
        }

        var resolvedUrl  = fonte.apiurl;
        var resolvedBody = fonte.apibody || {};

        if (typeof resolveExpressionTokens === 'function') {
            resolvedUrl  = resolveExpressionTokens(fonte.apiurl, fonte.parametros, (context || {}).parameters);
            resolvedBody = JSON.parse(resolveExpressionTokens(JSON.stringify(resolvedBody), fonte.parametros, (context || {}).parameters));
        }

        $.ajax({
            type:        fonte.apimethod || 'GET',
            url:         resolvedUrl,
            headers:     fonte.apiheaders || {},
            data:        fonte.apimethod === 'GET' ? undefined : JSON.stringify(resolvedBody),
            contentType: fonte.apimethod === 'GET' ? undefined : 'application/json',
            success: function (response) {
                var data = Array.isArray(response) ? response : (response && response.data ? response.data : [response]);
                callback(null, data);
            },
            error: function (xhr, status, error) {
                callback(new Error('API error: ' + (error || status)), null);
            }
        });
    }
});


// ── Handler: stored ───────────────────────────────────────────────────────────
// Lê directamente de lastResultscached. Não faz execução.

MdashExecutorRegistry.register({
    canHandle: function (tipo) { return tipo === 'stored'; },

    execute: function (fonte, context, callback) {
        try {
            var cached = JSON.parse(fonte.lastResultscached || '{}');
            if (cached && Array.isArray(cached.rows) && cached.rows.length > 0) {
                callback(null, cached.rows);
            } else if (cached && Array.isArray(cached) && cached.length > 0) {
                // compatibilidade: cache gravada como array simples
                callback(null, cached);
            } else {
                callback(new Error('Cache vazia ou inválida para fonte "' + fonte.codigo + '"'), null);
            }
        } catch (e) {
            callback(e, null);
        }
    }
});


// ── Cache bootstrap ─────────────────────────────────────────────────────────

/**
 * Carrega o lastResultscached de todas as fontes para a DB in-memory.
 * Deve ser chamado uma vez após o dashboard carregar os dados do servidor.
 */
function mdashInitFontesFromCache(fontes) {
    if (!Array.isArray(fontes) || fontes.length === 0) return;
    var loaded = 0;
    fontes.forEach(function (fonte) {
        var rows = mdashExtractRowsFromCache(fonte.lastResultscached);
        if (rows.length > 0) {
            mdashLoadFonteIntoDb(fonte, rows);
            loaded++;
        }
    });
    console.log('[MDash] Cache in-memory: ' + loaded + '/' + fontes.length + ' fontes carregadas.');
}

function mdashExtractRowsFromCache(raw) {
    if (!raw) return [];
    try {
        var cached = JSON.parse(raw);
        if (Array.isArray(cached)) return cached;
        if (!cached || !Array.isArray(cached.rows) || cached.rows.length === 0) return [];
        // rows já são objectos
        if (!Array.isArray(cached.rows[0])) return cached.rows;
        // rows são arrays — converter com columns
        var cols = cached.columns;
        return cached.rows.map(function (row) {
            var obj = {};
            for (var i = 0; i < cols.length; i++) obj[cols[i]] = row[i];
            return obj;
        });
    } catch (e) {
        return [];
    }
}


// ── MDashFonte.prototype extensions ──────────────────────────────────────────
// Sobrepõe/adiciona métodos sql.js ao protótipo MDashFonte.
// MDashFonte.prototype.execute já está definido em MDash config lib REFACTOR.js
// e delega automaticamente neste registry quando disponível.

MDashFonte.prototype.setTupDataOnLocalDb = function () {
    if (!Array.isArray(this.lastResults) || this.lastResults.length === 0) return;
    mdashLoadFonteIntoDb(this, this.lastResults);
};

MDashFonte.prototype.query = function (sql) {
    return mdashQuery(sql);
};

MDashFonte.prototype.getRows = function () {
    return mdashGetFonteRows(this);
};

MDashFonte.prototype.getTableName = function () {
    return mdashFonteTableName(this);
};


// ============================================================================
// MdashTransformBuilder
// ============================================================================
// Query builder visual para transformação de dados por objecto.
//
// Arquitectura inspirada em Power BI Measures:
//   - Colunas com tipo inferido automaticamente
//   - Medidas calculadas nomeadas e reutilizáveis (como DAX measures)
//   - GROUP BY automático quando há agregações
//   - Filtros WHERE com múltiplas condições e operadores
//   - ORDER BY múltiplo com direcção
//   - LIMIT configurável
//   - Modo SQL livre como escape hatch para casos complexos
//   - Pré-visualização dos resultados em tempo real
//
// O estado de um builder é um objecto JSON simples guardado em
// MdashContainerItemObject.transformConfig:
// {
//   mode: "visual" | "sql",           -- modo activo
//   sourceTable: "DOSSIER",            -- nome da tabela in-memory
//   columns: [                         -- colunas seleccionadas
//     { field: "cliente",  alias: "", aggregate: "none", visible: true },
//     { field: "total",    alias: "Total Vendas", aggregate: "SUM", visible: true }
//   ],
//   measures: [                        -- medidas calculadas reutilizáveis (como DAX)
//     { name: "Margem", expression: "SUM(total) - SUM(custo)", alias: "Margem Bruta" }
//   ],
//   filters: [                         -- condições WHERE
//     { field: "ano", operator: "=", value: "2024", connector: "AND" }
//   ],
//   groupBy: [],                       -- GROUP BY explícito (auto quando há agregação)
//   orderBy: [                         -- ORDER BY
//     { field: "total", direction: "DESC" }
//   ],
//   limit: null,                       -- LIMIT (null = sem limite)
//   sqlFree: ""                        -- SQL livre (mode="sql")
// }
// ============================================================================

var MdashTransformBuilder = window.MdashTransformBuilder = (function () {

    // ── Agregações disponíveis ────────────────────────────────────────────────
    var AGGREGATES = [
        { value: 'none',         label: '—',          sqlFn: null },
        { value: 'SUM',          label: 'Soma',        sqlFn: 'SUM' },
        { value: 'AVG',          label: 'Média',       sqlFn: 'AVG' },
        { value: 'COUNT',        label: 'Contagem',    sqlFn: 'COUNT' },
        { value: 'COUNT_DIST',   label: 'Cont. Dist.', sqlFn: 'COUNT(DISTINCT {field})' },
        { value: 'MIN',          label: 'Mínimo',      sqlFn: 'MIN' },
        { value: 'MAX',          label: 'Máximo',      sqlFn: 'MAX' },
        { value: 'FIRST',        label: 'Primeiro',    sqlFn: null  }, // via subquery
        { value: 'LAST',         label: 'Último',      sqlFn: null  }  // via subquery
    ];

    // ── Operadores de filtro ──────────────────────────────────────────────────
    var FILTER_OPERATORS = [
        { value: '=',        label: '= igual' },
        { value: '!=',       label: '≠ diferente' },
        { value: '>',        label: '> maior' },
        { value: '>=',       label: '≥ maior ou igual' },
        { value: '<',        label: '< menor' },
        { value: '<=',       label: '≤ menor ou igual' },
        { value: 'LIKE',     label: 'contém (LIKE)' },
        { value: 'NOT LIKE', label: 'não contém' },
        { value: 'IN',       label: 'IN (lista)' },
        { value: 'NOT IN',   label: 'NOT IN (lista)' },
        { value: 'IS NULL',  label: 'é nulo' },
        { value: 'IS NOT NULL', label: 'não é nulo' },
        { value: 'BETWEEN',  label: 'entre (BETWEEN)' }
    ];

    // ── Estado por objecto (cache em memória) ─────────────────────────────────
    var _states = {};   // key = mdashcontaineritemobjectstamp

    // ── Helpers internos ──────────────────────────────────────────────────────

    function _defaultConfig(sourceTable) {
        return {
            mode:        'visual',
            sourceTable: sourceTable || '',
            columns:     [],
            measures:    [],
            filters:     [],
            groupBy:     [],
            orderBy:     [],
            limit:       null,
            sqlFree:     ''
        };
    }

    function _quoteField(f) {
        return '"' + f.replace(/"/g, '""') + '"';
    }

    function _buildSelectExpr(col) {
        var f = _quoteField(col.field);
        var alias = col.alias ? (' AS ' + _quoteField(col.alias)) : '';

        if (!col.aggregate || col.aggregate === 'none') return f + alias;

        if (col.aggregate === 'COUNT_DIST') {
            return 'COUNT(DISTINCT ' + f + ')' + (alias || (' AS cnt_dist_' + col.field));
        }
        if (col.aggregate === 'FIRST') {
            // SQLite: MIN como proxy de FIRST (ordenado por rowid)
            return 'MIN(' + f + ')' + (alias || (' AS first_' + col.field));
        }
        if (col.aggregate === 'LAST') {
            return 'MAX(' + f + ')' + (alias || (' AS last_' + col.field));
        }
        return col.aggregate + '(' + f + ')' + (alias || (' AS ' + col.aggregate.toLowerCase() + '_' + col.field));
    }

    function _buildFilterExpr(filter) {
        var f = _quoteField(filter.field);
        var op = filter.operator;
        var val = filter.value;

        if (op === 'IS NULL' || op === 'IS NOT NULL') return f + ' ' + op;

        if (op === 'IN' || op === 'NOT IN') {
            var items = (val || '').split(',').map(function (v) {
                v = v.trim();
                return isNaN(v) ? ("'" + v.replace(/'/g, "''") + "'") : v;
            });
            return f + ' ' + op + ' (' + items.join(', ') + ')';
        }

        if (op === 'BETWEEN') {
            var parts = (val || '').split(',');
            var a = (parts[0] || '').trim();
            var b = (parts[1] || '').trim();
            a = isNaN(a) ? ("'" + a.replace(/'/g, "''") + "'") : a;
            b = isNaN(b) ? ("'" + b.replace(/'/g, "''") + "'") : b;
            return f + ' BETWEEN ' + a + ' AND ' + b;
        }

        if (op === 'LIKE' || op === 'NOT LIKE') {
            return f + ' ' + op + " '%" + (val || '').replace(/'/g, "''") + "%'";
        }

        var sqlVal = isNaN(val) ? ("'" + (val || '').replace(/'/g, "''") + "'") : val;
        return f + ' ' + op + ' ' + sqlVal;
    }

    // ── Gerador de SQL a partir do estado visual ───────────────────────────────

    function buildSQL(config) {
        if (!config || !config.sourceTable) return '';
        if (config.mode === 'sql') return (config.sqlFree || '').trim();

        var table = _quoteField(config.sourceTable);
        var cols = (config.columns || []).filter(function (c) { return c.visible !== false; });
        var measures = config.measures || [];

        if (cols.length === 0 && measures.length === 0) {
            return 'SELECT * FROM ' + table;
        }

        // SELECT clause
        var selectParts = cols.map(_buildSelectExpr);

        // Medidas calculadas
        measures.forEach(function (m) {
            if (!m.name || !m.expression) return;
            var alias = m.alias || m.name;
            selectParts.push('(' + m.expression + ') AS ' + _quoteField(alias));
        });

        var sql = 'SELECT ' + selectParts.join(',\n       ') + '\nFROM ' + table;

        // WHERE
        var filterParts = (config.filters || []).filter(function (f) { return f.field && f.operator; });
        if (filterParts.length > 0) {
            var whereClauses = filterParts.map(function (f, i) {
                var expr = _buildFilterExpr(f);
                return i === 0 ? expr : ((f.connector || 'AND') + ' ' + expr);
            });
            sql += '\nWHERE ' + whereClauses.join('\n  ');
        }

        // GROUP BY — automático quando há colunas com agregação
        var hasAgg = cols.some(function (c) { return c.aggregate && c.aggregate !== 'none'; }) || measures.length > 0;
        var groupByCols = (config.groupBy && config.groupBy.length > 0)
            ? config.groupBy
            : (hasAgg ? cols.filter(function (c) { return !c.aggregate || c.aggregate === 'none'; }).map(function (c) { return c.field; }) : []);

        if (groupByCols.length > 0) {
            sql += '\nGROUP BY ' + groupByCols.map(_quoteField).join(', ');
        }

        // ORDER BY
        var orderParts = (config.orderBy || []).filter(function (o) { return o.field; });
        if (orderParts.length > 0) {
            sql += '\nORDER BY ' + orderParts.map(function (o) {
                return _quoteField(o.field) + (o.direction === 'DESC' ? ' DESC' : ' ASC');
            }).join(', ');
        }

        // LIMIT
        if (config.limit && parseInt(config.limit) > 0) {
            sql += '\nLIMIT ' + parseInt(config.limit);
        }

        return sql;
    }

    // ── Execução ───────────────────────────────────────────────────────────────

    function execute(config) {
        var sql = buildSQL(config);
        if (!sql) return [];
        // Passa pelo SQLADAPTER se disponível (SQL Server → SQLite)
        if (typeof MdashSqlAdapter !== 'undefined' && typeof MdashSqlAdapter.translate === 'function') {
            sql = MdashSqlAdapter.translate(sql);
        }
        return mdashQuery(sql);
    }

    function executeRaw(config) {
        var sql = buildSQL(config);
        if (!sql) return { columns: [], rows: [], rowCount: 0, error: null };
        if (typeof MdashSqlAdapter !== 'undefined' && typeof MdashSqlAdapter.translate === 'function') {
            sql = MdashSqlAdapter.translate(sql);
        }
        return mdashQueryRaw(sql);
    }

    // ── Introspecção da tabela in-memory (schema automático) ──────────────────

    function getTableSchema(sourceTable) {
        if (!sourceTable) return [];
        var db = getMdashDb();
        if (!db) return [];
        try {
            var result = db.exec('PRAGMA table_info("' + sourceTable.replace(/"/g, '""') + '")');
            if (!result || !result.length) return [];
            return result[0].values.map(function (row) {
                // cid, name, type, notnull, dflt_value, pk
                return { field: row[1], type: row[2] || 'TEXT' };
            });
        } catch (e) {
            return [];
        }
    }

    // Infere se um campo é numérico com base no schema ou amostra de dados
    function isNumericField(fieldType) {
        if (!fieldType) return false;
        var t = fieldType.toUpperCase();
        return t === 'INTEGER' || t === 'REAL' || t === 'NUMERIC' || t === 'FLOAT' || t === 'DOUBLE';
    }

    // Gera config inicial para um novo objecto, seleccionando todas as colunas
    // e sugerindo SUM para campos numéricos (como o Power BI faz automaticamente)
    function autoConfig(sourceTable, objectType) {
        var schema = getTableSchema(sourceTable);
        var config = _defaultConfig(sourceTable);

        config.columns = schema.map(function (col) {
            var numerico = isNumericField(col.type);
            // Para objectos de stat/card, sugerir SUM em campos numéricos automaticamente
            var autoAgg = (objectType === 'stat' || objectType === 'Texto') && numerico ? 'SUM' : 'none';
            return {
                field:     col.field,
                alias:     '',
                aggregate: autoAgg,
                visible:   true,
                type:      col.type
            };
        });

        return config;
    }

    // ── UI do Builder ─────────────────────────────────────────────────────────
    // Renderiza o painel completo dentro de um selector jQuery
    // options: { config, onSave(newConfig), onPreview(rows) }

    function render(containerSelector, options) {
        var $c = $(containerSelector);
        if (!$c.length) return;

        var cfg = options.config || _defaultConfig('');
        var schema = getTableSchema(cfg.sourceTable);
        var allFields = schema.map(function (s) { return s.field; });

        // ── HTML principal ────────────────────────────────────────────────────
        var html = '';
        html += '<div class="mtb-root">';

        // Cabeçalho com toggle e preview
        html += '<div class="mtb-header">';
        html += '  <div class="mtb-mode-toggle">';
        html += '    <button type="button" class="mtb-mode-btn' + (cfg.mode !== 'sql' ? ' active' : '') + '" data-mode="visual"><i class="glyphicon glyphicon-th-list"></i> Visual</button>';
        html += '    <button type="button" class="mtb-mode-btn' + (cfg.mode === 'sql' ? ' active' : '') + '" data-mode="sql"><i class="glyphicon glyphicon-console"></i> SQL Livre</button>';
        html += '  </div>';
        html += '  <button type="button" class="mtb-preview-btn btn btn-xs btn-default"><i class="glyphicon glyphicon-eye-open"></i> Pré-visualizar</button>';
        html += '</div>';

        // Fonte seleccionada (info)
        html += '<div class="mtb-source-info"><i class="glyphicon glyphicon-hdd"></i> Tabela: <strong>' + (cfg.sourceTable || '—') + '</strong></div>';

        // ── Painel Visual ─────────────────────────────────────────────────────
        html += '<div class="mtb-panel-visual' + (cfg.mode === 'sql' ? ' mtb-hidden' : '') + '">';

        // Secção: Colunas
        html += '<div class="mtb-section">';
        html += '  <div class="mtb-section-title"><i class="glyphicon glyphicon-list-alt"></i> Colunas & Agregações <button type="button" class="mtb-add-col btn btn-xs btn-default pull-right"><i class="glyphicon glyphicon-plus"></i> Adicionar</button></div>';
        html += '  <div class="mtb-cols-list">';
        (cfg.columns || []).forEach(function (col, i) {
            html += _renderColumnRow(col, i, allFields);
        });
        html += '  </div>';
        html += '</div>';

        // Secção: Medidas calculadas
        html += '<div class="mtb-section">';
        html += '  <div class="mtb-section-title"><i class="glyphicon glyphicon-flash"></i> Medidas Calculadas <span class="mtb-section-hint">ex: SUM(total) - SUM(custo)</span> <button type="button" class="mtb-add-measure btn btn-xs btn-default pull-right"><i class="glyphicon glyphicon-plus"></i> Nova Medida</button></div>';
        html += '  <div class="mtb-measures-list">';
        (cfg.measures || []).forEach(function (m, i) {
            html += _renderMeasureRow(m, i);
        });
        html += '  </div>';
        html += '</div>';

        // Secção: Filtros
        html += '<div class="mtb-section">';
        html += '  <div class="mtb-section-title"><i class="glyphicon glyphicon-filter"></i> Filtros <button type="button" class="mtb-add-filter btn btn-xs btn-default pull-right"><i class="glyphicon glyphicon-plus"></i> Adicionar</button></div>';
        html += '  <div class="mtb-filters-list">';
        (cfg.filters || []).forEach(function (f, i) {
            html += _renderFilterRow(f, i, allFields);
        });
        html += '  </div>';
        html += '</div>';

        // Secção: Ordenação + Limite
        html += '<div class="mtb-section mtb-section-row">';
        html += '  <div class="mtb-half">';
        html += '    <div class="mtb-section-title"><i class="glyphicon glyphicon-sort"></i> Ordenação <button type="button" class="mtb-add-order btn btn-xs btn-default pull-right"><i class="glyphicon glyphicon-plus"></i></button></div>';
        html += '    <div class="mtb-order-list">';
        (cfg.orderBy || []).forEach(function (o, i) {
            html += _renderOrderRow(o, i, allFields);
        });
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="mtb-half">';
        html += '    <div class="mtb-section-title"><i class="glyphicon glyphicon-record"></i> Limite de linhas</div>';
        html += '    <input type="number" class="mtb-limit form-control input-sm" placeholder="sem limite" value="' + (cfg.limit || '') + '" min="1">';
        html += '  </div>';
        html += '</div>';

        // SQL gerado (read-only preview)
        html += '<div class="mtb-section">';
        html += '  <div class="mtb-section-title mtb-sql-preview-title"><i class="glyphicon glyphicon-info-sign"></i> SQL gerado <span class="mtb-sql-preview-hint">(só leitura)</span></div>';
        html += '  <pre class="mtb-sql-preview">' + _escapeHtml(buildSQL(cfg)) + '</pre>';
        html += '</div>';

        html += '</div>'; // .mtb-panel-visual

        // ── Painel SQL Livre ──────────────────────────────────────────────────
        html += '<div class="mtb-panel-sql' + (cfg.mode !== 'sql' ? ' mtb-hidden' : '') + '">';
        html += '  <div class="mtb-section-title"><i class="glyphicon glyphicon-console"></i> SQL (sintaxe SQL Server — traduzido automaticamente para SQLite)</div>';
        html += '  <textarea class="mtb-sql-free form-control" rows="8" spellcheck="false" placeholder="SELECT cliente, SUM(total) AS Total\nFROM DOSSIER\nGROUP BY cliente\nORDER BY Total DESC">' + _escapeHtml(cfg.sqlFree || '') + '</textarea>';
        html += '  <div class="mtb-sql-fields-hint"><strong>Campos disponíveis:</strong> ' + allFields.map(function (f) { return '<code>' + _escapeHtml(f) + '</code>'; }).join(' ') + '</div>';
        html += '</div>';

        // Resultados pré-visualização
        html += '<div class="mtb-preview-area mtb-hidden"></div>';

        // Botão guardar
        html += '<div class="mtb-footer">';
        html += '  <button type="button" class="mtb-save btn btn-primary btn-sm"><i class="glyphicon glyphicon-ok"></i> Aplicar</button>';
        html += '  <button type="button" class="mtb-cancel btn btn-default btn-sm">Cancelar</button>';
        html += '</div>';

        html += '</div>'; // .mtb-root

        $c.html(html + _buildCSS());

        // ── Eventos ───────────────────────────────────────────────────────────
        _bindEvents($c, cfg, schema, allFields, options);
    }

    function _renderColumnRow(col, i, allFields) {
        var aggOpts = AGGREGATES.map(function (a) {
            return '<option value="' + a.value + '"' + (col.aggregate === a.value ? ' selected' : '') + '>' + a.label + '</option>';
        }).join('');
        var vis = col.visible !== false;
        var h = '<div class="mtb-row mtb-col-row" data-idx="' + i + '">';
        h += '  <input type="checkbox" class="mtb-col-visible" title="Visível"' + (vis ? ' checked' : '') + '>';
        h += '  <input type="text" class="mtb-col-field form-control input-sm" value="' + _escapeHtml(col.field || '') + '" placeholder="campo" list="mtb-fields-list">';
        h += '  <select class="mtb-col-agg form-control input-sm">' + aggOpts + '</select>';
        h += '  <input type="text" class="mtb-col-alias form-control input-sm" value="' + _escapeHtml(col.alias || '') + '" placeholder="alias (opcional)">';
        h += '  <button type="button" class="mtb-remove-row btn btn-xs btn-danger" title="Remover"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _renderMeasureRow(m, i) {
        var h = '<div class="mtb-row mtb-measure-row" data-idx="' + i + '">';
        h += '  <input type="text" class="mtb-measure-name form-control input-sm" value="' + _escapeHtml(m.name || '') + '" placeholder="Nome (ex: Margem)">';
        h += '  <input type="text" class="mtb-measure-expr form-control input-sm mtb-expr-wide" value="' + _escapeHtml(m.expression || '') + '" placeholder="Expressão (ex: SUM(total) - SUM(custo))">';
        h += '  <input type="text" class="mtb-measure-alias form-control input-sm" value="' + _escapeHtml(m.alias || '') + '" placeholder="Alias">';
        h += '  <button type="button" class="mtb-remove-row btn btn-xs btn-danger"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _renderFilterRow(f, i, allFields) {
        var opOpts = FILTER_OPERATORS.map(function (o) {
            return '<option value="' + o.value + '"' + (f.operator === o.value ? ' selected' : '') + '>' + o.label + '</option>';
        }).join('');
        var connOpts = ['AND', 'OR'].map(function (c) {
            return '<option value="' + c + '"' + (f.connector === c ? ' selected' : '') + '>' + c + '</option>';
        }).join('');
        var noVal = f.operator === 'IS NULL' || f.operator === 'IS NOT NULL';
        var h = '<div class="mtb-row mtb-filter-row" data-idx="' + i + '">';
        if (i > 0) {
            h += '  <select class="mtb-filter-connector form-control input-sm mtb-connector">' + connOpts + '</select>';
        } else {
            h += '  <span class="mtb-filter-where">WHERE</span>';
        }
        h += '  <input type="text" class="mtb-filter-field form-control input-sm" value="' + _escapeHtml(f.field || '') + '" placeholder="campo" list="mtb-fields-list">';
        h += '  <select class="mtb-filter-op form-control input-sm">' + opOpts + '</select>';
        h += '  <input type="text" class="mtb-filter-val form-control input-sm' + (noVal ? ' mtb-hidden' : '') + '" value="' + _escapeHtml(f.value || '') + '" placeholder="valor">';
        h += '  <button type="button" class="mtb-remove-row btn btn-xs btn-danger"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _renderOrderRow(o, i, allFields) {
        var dirOpts = ['ASC', 'DESC'].map(function (d) {
            return '<option value="' + d + '"' + (o.direction === d ? ' selected' : '') + '>' + d + '</option>';
        }).join('');
        var h = '<div class="mtb-row mtb-order-row" data-idx="' + i + '">';
        h += '  <input type="text" class="mtb-order-field form-control input-sm" value="' + _escapeHtml(o.field || '') + '" placeholder="campo" list="mtb-fields-list">';
        h += '  <select class="mtb-order-dir form-control input-sm">' + dirOpts + '</select>';
        h += '  <button type="button" class="mtb-remove-row btn btn-xs btn-danger"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    // ── Leitura do estado actual do DOM → config ──────────────────────────────

    function _readConfig($c, currentCfg) {
        var mode = $c.find('.mtb-mode-btn.active').data('mode') || 'visual';
        var cfg = JSON.parse(JSON.stringify(currentCfg));
        cfg.mode = mode;
        cfg.sqlFree = $c.find('.mtb-sql-free').val() || '';
        cfg.limit = parseInt($c.find('.mtb-limit').val()) || null;

        cfg.columns = [];
        $c.find('.mtb-col-row').each(function () {
            var $r = $(this);
            cfg.columns.push({
                field:     $r.find('.mtb-col-field').val().trim(),
                aggregate: $r.find('.mtb-col-agg').val(),
                alias:     $r.find('.mtb-col-alias').val().trim(),
                visible:   $r.find('.mtb-col-visible').is(':checked')
            });
        });

        cfg.measures = [];
        $c.find('.mtb-measure-row').each(function () {
            var $r = $(this);
            var name = $r.find('.mtb-measure-name').val().trim();
            var expr = $r.find('.mtb-measure-expr').val().trim();
            if (name && expr) {
                cfg.measures.push({ name: name, expression: expr, alias: $r.find('.mtb-measure-alias').val().trim() });
            }
        });

        cfg.filters = [];
        $c.find('.mtb-filter-row').each(function ($, i) {
            var $r = $(this);
            var field = $r.find('.mtb-filter-field').val().trim();
            var op    = $r.find('.mtb-filter-op').val();
            if (!field) return;
            cfg.filters.push({
                field:     field,
                operator:  op,
                value:     $r.find('.mtb-filter-val').val().trim(),
                connector: $r.find('.mtb-filter-connector').val() || 'AND'
            });
        });

        cfg.orderBy = [];
        $c.find('.mtb-order-row').each(function () {
            var $r = $(this);
            var field = $r.find('.mtb-order-field').val().trim();
            if (!field) return;
            cfg.orderBy.push({ field: field, direction: $r.find('.mtb-order-dir').val() || 'ASC' });
        });

        return cfg;
    }

    // ── Bind de eventos ───────────────────────────────────────────────────────

    function _bindEvents($c, cfg, schema, allFields, options) {
        // Datalist para autocomplete de campos
        $c.append('<datalist id="mtb-fields-list">' + allFields.map(function (f) { return '<option value="' + _escapeHtml(f) + '">'; }).join('') + '</datalist>');

        // Toggle de modo
        $c.on('click', '.mtb-mode-btn', function () {
            var mode = $(this).data('mode');
            $c.find('.mtb-mode-btn').removeClass('active');
            $(this).addClass('active');
            if (mode === 'sql') {
                $c.find('.mtb-panel-visual').addClass('mtb-hidden');
                $c.find('.mtb-panel-sql').removeClass('mtb-hidden');
            } else {
                $c.find('.mtb-panel-sql').addClass('mtb-hidden');
                $c.find('.mtb-panel-visual').removeClass('mtb-hidden');
            }
        });

        // Adicionar coluna
        $c.on('click', '.mtb-add-col', function () {
            var newCol = { field: '', aggregate: 'none', alias: '', visible: true };
            $c.find('.mtb-cols-list').append(_renderColumnRow(newCol, $c.find('.mtb-col-row').length, allFields));
        });

        // Adicionar medida
        $c.on('click', '.mtb-add-measure', function () {
            $c.find('.mtb-measures-list').append(_renderMeasureRow({ name: '', expression: '', alias: '' }, $c.find('.mtb-measure-row').length));
        });

        // Adicionar filtro
        $c.on('click', '.mtb-add-filter', function () {
            var newF = { field: '', operator: '=', value: '', connector: 'AND' };
            $c.find('.mtb-filters-list').append(_renderFilterRow(newF, $c.find('.mtb-filter-row').length, allFields));
        });

        // Adicionar ordenação
        $c.on('click', '.mtb-add-order', function () {
            $c.find('.mtb-order-list').append(_renderOrderRow({ field: '', direction: 'ASC' }, $c.find('.mtb-order-row').length, allFields));
        });

        // Remover linha
        $c.on('click', '.mtb-remove-row', function () {
            $(this).closest('.mtb-row').remove();
            _updateSqlPreview($c, cfg);
        });

        // Esconder/mostrar campo valor quando op é IS NULL / IS NOT NULL
        $c.on('change', '.mtb-filter-op', function () {
            var op = $(this).val();
            var noVal = op === 'IS NULL' || op === 'IS NOT NULL';
            $(this).closest('.mtb-filter-row').find('.mtb-filter-val').toggleClass('mtb-hidden', noVal);
        });

        // Actualizar SQL preview em tempo real ao mudar qualquer input
        $c.on('change input', 'input, select, textarea', function () {
            _updateSqlPreview($c, cfg);
        });

        // Pré-visualizar
        $c.on('click', '.mtb-preview-btn', function () {
            var current = _readConfig($c, cfg);
            var result = executeRaw(current);
            _renderPreview($c, result);
        });

        // Guardar
        $c.on('click', '.mtb-save', function () {
            var newCfg = _readConfig($c, cfg);
            if (typeof options.onSave === 'function') options.onSave(newCfg);
        });

        // Cancelar
        $c.on('click', '.mtb-cancel', function () {
            if (typeof options.onCancel === 'function') options.onCancel();
        });
    }

    function _updateSqlPreview($c, cfg) {
        var current = _readConfig($c, cfg);
        var sql = buildSQL(current);
        $c.find('.mtb-sql-preview').text(sql);
    }

    function _renderPreview($c, result) {
        var $area = $c.find('.mtb-preview-area').removeClass('mtb-hidden');
        if (result.error) {
            $area.html('<div class="mtb-preview-error"><i class="glyphicon glyphicon-warning-sign"></i> ' + _escapeHtml(result.error) + '</div>');
            return;
        }
        var cols = result.columns || [];
        var rows = result.rows || [];
        if (cols.length === 0) {
            $area.html('<div class="mtb-preview-empty">Sem resultados.</div>');
            return;
        }

        var html = '<div class="mtb-preview-info">' + rows.length + ' linha(s)' + (rows.length === 200 ? ' (limitado a 200)' : '') + '</div>';
        html += '<div class="mtb-preview-table-wrap"><table class="mtb-preview-table table table-condensed table-bordered"><thead><tr>';
        cols.forEach(function (c) { html += '<th>' + _escapeHtml(c) + '</th>'; });
        html += '</tr></thead><tbody>';
        rows.slice(0, 200).forEach(function (row) {
            html += '<tr>';
            row.forEach(function (v) { html += '<td>' + _escapeHtml(v === null ? '' : String(v)) + '</td>'; });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        $area.html(html);
    }

    function _escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── CSS inline do builder ─────────────────────────────────────────────────

    function _buildCSS() {
        if ($('#mtb-styles').length) return '';
        var s = '<style id="mtb-styles">';
        s += '.mtb-root { font-size:12px; color:#333; }';
        s += '.mtb-hidden { display:none !important; }';
        s += '.mtb-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }';
        s += '.mtb-mode-toggle { display:flex; gap:0; border-radius:4px; overflow:hidden; border:1px solid #ccc; }';
        s += '.mtb-mode-btn { border:none; background:#f5f5f5; padding:4px 10px; cursor:pointer; font-size:11px; transition:background 0.15s; }';
        s += '.mtb-mode-btn.active { background:#337ab7; color:#fff; }';
        s += '.mtb-source-info { font-size:11px; color:#888; margin-bottom:8px; }';
        s += '.mtb-section { margin-bottom:12px; }';
        s += '.mtb-section-row { display:flex; gap:12px; }';
        s += '.mtb-half { flex:1; min-width:0; }';
        s += '.mtb-section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:#555; margin-bottom:5px; display:flex; align-items:center; gap:5px; }';
        s += '.mtb-section-hint { font-weight:400; text-transform:none; letter-spacing:0; color:#aaa; font-size:10px; }';
        s += '.mtb-row { display:flex; align-items:center; gap:4px; margin-bottom:3px; }';
        s += '.mtb-col-field, .mtb-filter-field, .mtb-order-field, .mtb-measure-name { width:120px; flex-shrink:0; }';
        s += '.mtb-col-agg, .mtb-filter-op { width:110px; flex-shrink:0; }';
        s += '.mtb-col-alias, .mtb-filter-val, .mtb-measure-alias { flex:1; min-width:60px; }';
        s += '.mtb-expr-wide { flex:2; min-width:120px; }';
        s += '.mtb-connector { width:60px; flex-shrink:0; }';
        s += '.mtb-filter-where { width:52px; font-size:11px; font-weight:700; color:#337ab7; flex-shrink:0; text-align:center; }';
        s += '.mtb-order-dir { width:70px; flex-shrink:0; }';
        s += '.mtb-sql-preview { background:#f8f8f8; border:1px solid #e0e0e0; border-radius:3px; padding:6px 8px; font-size:11px; white-space:pre-wrap; max-height:100px; overflow:auto; color:#555; margin:0; }';
        s += '.mtb-sql-preview-hint { font-weight:400; text-transform:none; letter-spacing:0; color:#aaa; font-size:10px; margin-left:4px; }';
        s += '.mtb-sql-free { font-family:monospace; font-size:12px; resize:vertical; }';
        s += '.mtb-sql-fields-hint { font-size:10px; color:#aaa; margin-top:4px; }';
        s += '.mtb-sql-fields-hint code { background:#f0f0f0; padding:0 3px; border-radius:2px; font-size:10px; }';
        s += '.mtb-preview-area { margin-top:8px; border-top:1px solid #eee; padding-top:8px; }';
        s += '.mtb-preview-table-wrap { max-height:200px; overflow:auto; }';
        s += '.mtb-preview-table { width:100%; font-size:11px; }';
        s += '.mtb-preview-info { font-size:10px; color:#888; margin-bottom:4px; }';
        s += '.mtb-preview-error { color:#d9534f; font-size:11px; padding:6px; background:#fdf2f2; border-radius:3px; }';
        s += '.mtb-preview-empty { color:#aaa; font-size:11px; font-style:italic; }';
        s += '.mtb-footer { display:flex; gap:6px; justify-content:flex-end; margin-top:10px; padding-top:8px; border-top:1px solid #eee; }';
        s += '.mtb-limit { width:100%; }';
        s += '</style>';
        return s;
    }

    // ── API pública ───────────────────────────────────────────────────────────
    return {
        render:          render,
        buildSQL:        buildSQL,
        execute:         execute,
        executeRaw:      executeRaw,
        autoConfig:      autoConfig,
        getTableSchema:  getTableSchema,
        AGGREGATES:      AGGREGATES,
        FILTER_OPERATORS: FILTER_OPERATORS
    };

})();


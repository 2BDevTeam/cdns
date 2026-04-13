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
        truncated: rows.length > MDASH_PREVIEW_LIMIT
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
// NOTA: este script pode carregar antes de MDash config lib REFACTOR.js (ordem
// alfabética no PHC), por isso usamos um guard e defer via setTimeout(0).

function _mdashExtendFontePrototype() {
    if (typeof MDashFonte === 'undefined') return;

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
}

// Tentar imediatamente; se MDashFonte ainda não existe, repetir após os scripts restantes carregarem
_mdashExtendFontePrototype();
if (typeof MDashFonte === 'undefined') {
    setTimeout(_mdashExtendFontePrototype, 0);
}


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
        // options.schema pode ser passado pelo caller quando a tabela ainda não
        // está carregada na DB in-memory (ex: abertura inicial do builder)
        var schema = (options.schema && options.schema.length)
            ? options.schema
            : getTableSchema(cfg.sourceTable);
        var allFields = schema.map(function (s) { return s.field; });

        function _sec(icon, title, cls, addBtn, listCls, rows) {
            var h = '<div class="mtb-sec">';
            h += '<div class="mtb-sec-hd">';
            h += '<span class="mtb-sec-icon"><i class="glyphicon ' + icon + '"></i></span>';
            h += '<span class="mtb-sec-title">' + title + '</span>';
            if (addBtn) h += '<button type="button" class="' + addBtn.cls + ' mtb-add-btn"><i class="glyphicon glyphicon-plus"></i> ' + addBtn.label + '</button>';
            h += '</div>';
            h += '<div class="' + (listCls || 'mtb-list') + '">' + rows + '</div>';
            h += '</div>';
            return h;
        }

        // ── HTML principal ────────────────────────────────────────────────────
        var html = '<div class="mtb-root">';

        // Fonte + mode toggle
        html += '<div class="mtb-topbar">';
        html += '<div class="mtb-table-badge"><i class="glyphicon glyphicon-hdd"></i> ' + _escapeHtml(cfg.sourceTable || '—') + '</div>';
        html += '<div class="mtb-mode-toggle">';
        html += '<button type="button" class="mtb-mode-btn' + (cfg.mode !== 'sql' ? ' active' : '') + '" data-mode="visual"><i class="glyphicon glyphicon-th-list"></i> Visual</button>';
        html += '<button type="button" class="mtb-mode-btn' + (cfg.mode === 'sql' ? ' active' : '') + '" data-mode="sql"><i class="glyphicon glyphicon-console"></i> SQL</button>';
        html += '</div>';
        html += '</div>';

        // ── Painel Visual ─────────────────────────────────────────────────────
        html += '<div class="mtb-panel-visual' + (cfg.mode === 'sql' ? ' mtb-hidden' : '') + '">';

        // Colunas
        var colRows = (cfg.columns || []).map(function (col, i) { return _renderColumnRow(col, i, allFields); }).join('');
        html += _sec('glyphicon-list-alt', 'Colunas &amp; Agregações', 'mtb-cols-sec',
            { cls: 'mtb-add-col', label: 'Coluna' }, 'mtb-cols-list', colRows);

        // Medidas
        var mRows = (cfg.measures || []).map(function (m, i) { return _renderMeasureRow(m, i); }).join('');
        html += _sec('glyphicon-flash', 'Medidas Calculadas', 'mtb-measures-sec',
            { cls: 'mtb-add-measure', label: 'Medida' }, 'mtb-measures-list', mRows);

        // Filtros
        var fRows = (cfg.filters || []).map(function (f, i) { return _renderFilterRow(f, i, allFields); }).join('');
        html += _sec('glyphicon-filter', 'Filtros', 'mtb-filters-sec',
            { cls: 'mtb-add-filter', label: 'Filtro' }, 'mtb-filters-list', fRows);

        // Ordenação + Limite (lado a lado)
        html += '<div class="mtb-row2col">';
        html += '<div class="mtb-col-half">';
        html +=   _sec('glyphicon-sort', 'Ordenação', '', { cls: 'mtb-add-order', label: '' }, 'mtb-order-list',
                    (cfg.orderBy || []).map(function (o, i) { return _renderOrderRow(o, i, allFields); }).join(''));
        html += '</div>';
        html += '<div class="mtb-col-half">';
        html += '<div class="mtb-sec"><div class="mtb-sec-hd"><span class="mtb-sec-icon"><i class="glyphicon glyphicon-record"></i></span><span class="mtb-sec-title">Limite</span></div>';
        html += '<div class="mtb-list"><input type="number" class="mtb-limit mtb-input" placeholder="sem limite" value="' + (cfg.limit || '') + '" min="1"></div></div>';
        html += '</div>';
        html += '</div>';

        // SQL gerado (preview)
        html += '<div class="mtb-sec">';
        html += '<div class="mtb-sec-hd"><span class="mtb-sec-icon"><i class="glyphicon glyphicon-console"></i></span><span class="mtb-sec-title">SQL gerado</span><span class="mtb-sec-hint">só leitura</span></div>';
        html += '<pre class="mtb-sql-preview">' + _escapeHtml(buildSQL(cfg)) + '</pre>';
        html += '</div>';

        html += '</div>'; // .mtb-panel-visual

        // ── Painel SQL Livre ──────────────────────────────────────────────────
        html += '<div class="mtb-panel-sql' + (cfg.mode !== 'sql' ? ' mtb-hidden' : '') + '">';
        html += '<div class="mtb-sec">';
        html += '<div class="mtb-sec-hd"><span class="mtb-sec-icon"><i class="glyphicon glyphicon-console"></i></span><span class="mtb-sec-title">SQL Livre</span><span class="mtb-sec-hint">SQL Server → SQLite auto-traduzido</span></div>';
        html += '<textarea class="mtb-sql-free mtb-input" rows="7" spellcheck="false" placeholder="SELECT cliente, SUM(total) AS Total&#10;FROM DOSSIER&#10;GROUP BY cliente&#10;ORDER BY Total DESC">' + _escapeHtml(cfg.sqlFree || '') + '</textarea>';
        if (allFields.length) {
            html += '<div class="mtb-fields-chips">';
            allFields.forEach(function (f) { html += '<span class="mtb-chip">' + _escapeHtml(f) + '</span>'; });
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';

        // Preview de resultados
        html += '<div class="mtb-preview-area mtb-hidden"></div>';

        // Footer
        html += '<div class="mtb-footer">';
        html += '<button type="button" class="mtb-preview-btn mtb-btn-ghost"><i class="glyphicon glyphicon-eye-open"></i> Testar</button>';
        html += '<div style="flex:1"></div>';
        html += '<button type="button" class="mtb-cancel mtb-btn-ghost">Cancelar</button>';
        html += '<button type="button" class="mtb-save mtb-btn-primary"><i class="glyphicon glyphicon-ok"></i> Aplicar</button>';
        html += '</div>';

        html += '</div>'; // .mtb-root

        $c.html(html + _buildCSS());

        // ── Eventos ───────────────────────────────────────────────────────────
        _bindEvents($c, cfg, schema, allFields, options);
    }

    function _fieldOpts(allFields, selected) {
        var opts = '';
        if (!selected) opts += '<option value=""></option>';
        allFields.forEach(function (f) {
            opts += '<option value="' + _escapeHtml(f) + '"' + (f === selected ? ' selected' : '') + '>' + _escapeHtml(f) + '</option>';
        });
        // Preserva valor existente que não está no schema actual
        if (selected && allFields.indexOf(selected) === -1) {
            opts = '<option value="' + _escapeHtml(selected) + '" selected>' + _escapeHtml(selected) + '</option>' + opts;
        }
        return opts;
    }

    function _renderColumnRow(col, i, allFields) {
        var aggOpts = AGGREGATES.map(function (a) {
            return '<option value="' + a.value + '"' + (col.aggregate === a.value ? ' selected' : '') + '>' + a.label + '</option>';
        }).join('');
        var vis = col.visible !== false;
        var h = '<div class="mtb-row mtb-col-row" data-idx="' + i + '">';
        h += '<label class="mtb-vis-toggle" title="Incluir na query"><input type="checkbox" class="mtb-col-visible"' + (vis ? ' checked' : '') + '><span class="mtb-vis-dot"></span></label>';
        h += '<select class="mtb-col-field mtb-select mtb-select-field">' + _fieldOpts(allFields, col.field || '') + '</select>';
        h += '<select class="mtb-col-agg mtb-select mtb-select-agg">' + aggOpts + '</select>';
        h += '<input type="text" class="mtb-col-alias mtb-input mtb-input-alias" value="' + _escapeHtml(col.alias || '') + '" placeholder="alias">';
        h += '<button type="button" class="mtb-remove-row mtb-del" title="Remover"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _renderMeasureRow(m, i) {
        var h = '<div class="mtb-row mtb-measure-row" data-idx="' + i + '">';
        h += '<input type="text" class="mtb-measure-name mtb-input mtb-input-name" value="' + _escapeHtml(m.name || '') + '" placeholder="Nome">';
        h += '<input type="text" class="mtb-measure-expr mtb-input mtb-input-expr" value="' + _escapeHtml(m.expression || '') + '" placeholder="ex: SUM(total) - SUM(custo)">';
        h += '<input type="text" class="mtb-measure-alias mtb-input mtb-input-alias" value="' + _escapeHtml(m.alias || '') + '" placeholder="alias">';
        h += '<button type="button" class="mtb-remove-row mtb-del"><i class="glyphicon glyphicon-remove"></i></button>';
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
            h += '<select class="mtb-filter-connector mtb-select mtb-select-conn">' + connOpts + '</select>';
        } else {
            h += '<span class="mtb-where-badge">WHERE</span>';
        }
        h += '<select class="mtb-filter-field mtb-select mtb-select-field">' + _fieldOpts(allFields, f.field || '') + '</select>';
        h += '<select class="mtb-filter-op mtb-select mtb-select-op">' + opOpts + '</select>';
        h += '<input type="text" class="mtb-filter-val mtb-input mtb-input-val' + (noVal ? ' mtb-hidden' : '') + '" value="' + _escapeHtml(f.value || '') + '" placeholder="valor">';
        h += '<button type="button" class="mtb-remove-row mtb-del"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _renderOrderRow(o, i, allFields) {
        var dirOpts = ['ASC', 'DESC'].map(function (d) {
            return '<option value="' + d + '"' + (o.direction === d ? ' selected' : '') + '>' + (d === 'ASC' ? '↑ Asc' : '↓ Desc') + '</option>';
        }).join('');
        var h = '<div class="mtb-row mtb-order-row" data-idx="' + i + '">';
        h += '<select class="mtb-order-field mtb-select mtb-select-field">' + _fieldOpts(allFields, o.field || '') + '</select>';
        h += '<select class="mtb-order-dir mtb-select mtb-select-dir">' + dirOpts + '</select>';
        h += '<button type="button" class="mtb-remove-row mtb-del"><i class="glyphicon glyphicon-remove"></i></button>';
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

        // Adicionar coluna — auto-selecciona o primeiro campo do schema ainda não usado
        $c.on('click', '.mtb-add-col', function () {
            var usedFields = [];
            $c.find('.mtb-col-row .mtb-col-field').each(function () { usedFields.push($(this).val()); });
            var firstField = allFields.filter(function (f) { return usedFields.indexOf(f) === -1; })[0] || allFields[0] || '';
            var newCol = { field: firstField, aggregate: 'none', alias: '', visible: true };
            $c.find('.mtb-cols-list').append(_renderColumnRow(newCol, $c.find('.mtb-col-row').length, allFields));
        });

        // Adicionar medida
        $c.on('click', '.mtb-add-measure', function () {
            $c.find('.mtb-measures-list').append(_renderMeasureRow({ name: '', expression: '', alias: '' }, $c.find('.mtb-measure-row').length));
        });

        // Adicionar filtro
        $c.on('click', '.mtb-add-filter', function () {
            var newF = { field: allFields[0] || '', operator: '=', value: '', connector: 'AND' };
            $c.find('.mtb-filters-list').append(_renderFilterRow(newF, $c.find('.mtb-filter-row').length, allFields));
        });

        // Adicionar ordenação
        $c.on('click', '.mtb-add-order', function () {
            $c.find('.mtb-order-list').append(_renderOrderRow({ field: allFields[0] || '', direction: 'ASC' }, $c.find('.mtb-order-row').length, allFields));
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
        if ($('#mtb-styles-v2').length) return '';
        $('#mtb-styles').remove();
        var p = 'var(--md-primary,#5b8dee)';
        var pr = 'var(--md-primary-rgb,91,141,238)';
        var s = '<style id="mtb-styles-v2">';
        // Root
        s += '.mtb-root{font-size:12px;color:#1e293b;background:transparent;}';
        s += '.mtb-hidden{display:none !important;}';
        // Topbar
        s += '.mtb-topbar{display:flex;align-items:center;justify-content:space-between;padding:9px 12px 7px;border-bottom:1px solid rgba(0,0,0,.07);gap:8px;}';
        s += '.mtb-table-badge{font-size:10.5px;font-weight:700;color:#475569;display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}';
        s += '.mtb-table-badge i{color:' + p + ';opacity:.8;flex-shrink:0;}';
        // Mode toggle
        s += '.mtb-mode-toggle{display:flex;border:1.5px solid rgba(0,0,0,.12);border-radius:7px;overflow:hidden;flex-shrink:0;}';
        s += '.mtb-mode-btn{border:none;background:transparent;padding:4px 11px;cursor:pointer;font-size:10.5px;font-weight:600;color:#64748b;transition:all .15s;display:flex;align-items:center;gap:4px;line-height:1.4;}';
        s += '.mtb-mode-btn i{font-size:10px;}';
        s += '.mtb-mode-btn.active{background:' + p + ';color:#fff;}';
        s += '.mtb-mode-btn:not(.active):hover{background:rgba(' + pr + ',.07);color:' + p + ';}';
        // Section blocks
        s += '.mtb-sec{border-bottom:1px solid rgba(0,0,0,.06);}';
        s += '.mtb-sec:last-child{border-bottom:none;}';
        s += '.mtb-sec-hd{display:flex;align-items:center;gap:6px;padding:7px 12px 5px;min-height:30px;}';
        s += '.mtb-sec-icon{color:' + p + ';opacity:.75;font-size:10px;flex-shrink:0;}';
        s += '.mtb-sec-title{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.65px;color:#475569;flex:1;}';
        s += '.mtb-sec-hint{font-size:9px;color:#94a3b8;font-style:italic;font-weight:400;text-transform:none;letter-spacing:0;}';
        s += '.mtb-add-btn{margin-left:auto;font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:5px;border:1.5px dashed rgba(0,0,0,.18);background:transparent;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:3px;transition:all .15s;white-space:nowrap;flex-shrink:0;}';
        s += '.mtb-add-btn:hover{border-color:' + p + ';color:' + p + ';background:rgba(' + pr + ',.04);}';
        s += '.mtb-add-btn i{font-size:9px;}';
        s += '.mtb-list{padding:0 12px 10px;}';
        // Row layout
        s += '.mtb-row{display:flex;align-items:center;gap:8px;margin-bottom:7px;}';
        s += '.mtb-row:last-child{margin-bottom:0;}';
        // Inputs
        s += '.mtb-input{height:28px;border:1px solid rgba(0,0,0,.13);border-radius:6px;background:#fff;color:#1e293b;font-size:11px;padding:2px 8px;outline:none;transition:border-color .15s,box-shadow .15s;}';
        s += '.mtb-input:focus{border-color:' + p + ';box-shadow:0 0 0 2px rgba(' + pr + ',.14);}';
        s += '.mtb-input-field{flex:1;min-width:60px;}';
        s += '.mtb-select-field{flex:1;min-width:80px;}';
        s += '.mtb-input-alias{width:76px;flex-shrink:0;}';
        s += '.mtb-input-name{width:86px;flex-shrink:0;}';
        s += '.mtb-input-expr{flex:1;min-width:80px;font-family:monospace;font-size:10.5px;}';
        s += '.mtb-input-val{flex:1;min-width:50px;}';
        s += '.mtb-select{height:28px;border:1px solid rgba(0,0,0,.13);border-radius:6px;background:#fff;color:#1e293b;font-size:10.5px;padding:1px 5px;outline:none;cursor:pointer;transition:border-color .15s;}';
        s += '.mtb-select:focus{border-color:' + p + ';box-shadow:0 0 0 2px rgba(' + pr + ',.14);}';
        s += '.mtb-select-agg{width:82px;flex-shrink:0;}';
        s += '.mtb-select-op{width:116px;flex-shrink:0;}';
        s += '.mtb-select-conn{width:62px;flex-shrink:0;}';
        s += '.mtb-select-dir{width:72px;flex-shrink:0;}';
        // Visibility toggle dot
        s += '.mtb-vis-toggle{cursor:pointer;margin:0;flex-shrink:0;display:flex;align-items:center;}';
        s += '.mtb-vis-toggle input{position:absolute;opacity:0;width:0;height:0;}';
        s += '.mtb-vis-dot{width:10px;height:10px;border-radius:50%;background:#d1d5db;border:2px solid transparent;transition:all .15s;box-shadow:0 0 0 1.5px rgba(0,0,0,.12);}';
        s += '.mtb-vis-toggle input:checked+.mtb-vis-dot{background:' + p + ';box-shadow:0 0 0 1.5px rgba(' + pr + ',.4);}';
        // WHERE badge
        s += '.mtb-where-badge{font-size:9px;font-weight:800;color:#fff;background:' + p + ';border-radius:4px;padding:2px 5px;flex-shrink:0;letter-spacing:.3px;}';
        // Delete button
        s += '.mtb-del{width:26px;height:26px;border:1px solid rgba(239,68,68,.22);background:rgba(239,68,68,.07);color:#ef4444;border-radius:6px;cursor:pointer;padding:0;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s;}';
        s += '.mtb-del:hover{background:rgba(239,68,68,.18);border-color:rgba(220,38,38,.45);color:#dc2626;}';
        s += '.mtb-del i{font-size:11px;}';
        // SQL preview
        s += '.mtb-sql-preview{margin:0 10px 10px;background:#0f172a;border-radius:7px;padding:9px 11px;font-size:10.5px;font-family:monospace;white-space:pre-wrap;max-height:90px;overflow:auto;color:#94a3b8;border:none;line-height:1.55;}';
        // SQL free textarea
        s += '.mtb-sql-free{font-family:monospace;font-size:11px;resize:vertical;width:100%;border:1px solid rgba(0,0,0,.13);border-radius:6px;background:#0f172a;color:#e2e8f0;padding:9px 11px;line-height:1.55;outline:none;}';
        s += '.mtb-sql-free:focus{border-color:' + p + ';box-shadow:0 0 0 2px rgba(' + pr + ',.14);}';
        // Field chips
        s += '.mtb-fields-chips{display:flex;flex-wrap:wrap;gap:4px;padding:6px 10px 8px;}';
        s += '.mtb-chip{font-size:9.5px;font-family:monospace;background:#f1f5f9;border:1px solid rgba(0,0,0,.1);color:#475569;border-radius:4px;padding:1px 6px;cursor:default;user-select:all;}';
        // 2-col layout (order + limit)
        s += '.mtb-row2col{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid rgba(0,0,0,.06);}';
        s += '.mtb-col-half{min-width:0;}';
        s += '.mtb-col-half:first-child{border-right:1px solid rgba(0,0,0,.06);}';
        s += '.mtb-col-half .mtb-sec{border-bottom:none;}';
        s += '.mtb-input.mtb-limit{width:100%;}';
        // Preview area
        s += '.mtb-preview-area{padding:8px 10px;border-top:1px solid rgba(0,0,0,.06);}';
        s += '.mtb-preview-table-wrap{max-height:180px;overflow:auto;border-radius:6px;border:1px solid rgba(0,0,0,.09);}';
        s += '.mtb-preview-table{width:100%;font-size:10.5px;border-collapse:collapse;}';
        s += '.mtb-preview-table th{background:#f8fafc;font-weight:700;font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;color:#475569;padding:4px 7px;border-bottom:1px solid rgba(0,0,0,.1);text-align:left;}';
        s += '.mtb-preview-table td{padding:3px 7px;color:#334155;border-bottom:1px solid rgba(0,0,0,.05);font-size:10.5px;}';
        s += '.mtb-preview-table tr:last-child td{border-bottom:none;}';
        s += '.mtb-preview-info{font-size:10px;color:#64748b;margin-bottom:5px;font-weight:600;}';
        s += '.mtb-preview-error{color:#b91c1c;font-size:11px;padding:7px 10px;background:#fef2f2;border-radius:6px;border:1px solid rgba(185,28,28,.15);}';
        s += '.mtb-preview-empty{color:#94a3b8;font-size:11px;font-style:italic;padding:6px 0;}';
        // Footer
        s += '.mtb-footer{display:flex;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid rgba(0,0,0,.07);}';
        s += '.mtb-btn-primary{font-size:11px;font-weight:700;padding:5px 14px;border-radius:7px;border:none;background:' + p + ';color:#fff;cursor:pointer;display:flex;align-items:center;gap:5px;transition:opacity .15s;}';
        s += '.mtb-btn-primary:hover{opacity:.88;}';
        s += '.mtb-btn-primary i{font-size:10px;}';
        s += '.mtb-btn-ghost{font-size:11px;font-weight:600;padding:5px 12px;border-radius:7px;border:1.5px solid rgba(0,0,0,.14);background:#fff;color:#475569;cursor:pointer;transition:all .15s;}';
        s += '.mtb-btn-ghost:hover{border-color:' + p + ';color:' + p + ';}';
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


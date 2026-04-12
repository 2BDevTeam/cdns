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

var MdashExecutorRegistry = (function () {
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

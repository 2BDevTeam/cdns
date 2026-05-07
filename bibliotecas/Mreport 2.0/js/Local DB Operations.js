/**
 * Local DB Operations.js  —  Mreport 2.0
 * =====================================================================
 * Helpers para o "Nível 3" da Cache Architecture: IndexedDB local + AlaSQL.
 *
 * Cada MReportFonte (com usacache=1) ganha uma store no IndexedDB com:
 *   - chave primária declarada no schemajson
 *   - índices nas colunas frequentes (filtros)
 *
 * EXPÕE:
 *   window.MReportLocalDB = {
 *       ensureSchema, applyDelta, query, canQuery, clear
 *   }
 * =====================================================================
 */
var DB_NAME = "mreport2_localdb";
var DB_VERSION = 1;
var _db = null;

function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise(function (resolve, reject) {
        var req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function (e) {
            _db = e.target.result;
            // Stores criadas dinamicamente em ensureSchema; nada aqui.
        };
        req.onsuccess = function (e) {
            _db = e.target.result;
            resolve(_db);
        };
        req.onerror = function () { reject(req.error); };
    });
}

function storeNameFor(fonte) {
    return "fonte_" + fonte.mreportfonstestamp.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Garante que existe uma object store para esta fonte.
 * Como IndexedDB só permite criar stores em onupgradeneeded, pode forçar
 * versão maior se a store ainda não existir.
 */
function ensureSchema(fonte) {
    return open().then(function (db) {
        var sname = storeNameFor(fonte);
        if (db.objectStoreNames.contains(sname)) return;
        db.close();
        _db = null;
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, db.version + 1);
            req.onupgradeneeded = function (e) {
                var d = e.target.result;
                if (!d.objectStoreNames.contains(sname)) {
                    var schema = safeParse(fonte.schemajson, []);
                    var keyPath = (schema.find(function (c) { return c.isKey; }) || schema[0] || { name: "stamp" }).name;
                    d.createObjectStore(sname, { keyPath: keyPath });
                }
            };
            req.onsuccess = function (e) { _db = e.target.result; resolve(); };
            req.onerror = function () { reject(req.error); };
        });
    });
}

/**
 * Aplica delta de registos. Cada registo deve ter __op = 'I'|'U'|'D' e a chave.
 */
function applyDelta(fonte, records) {
    if (!records || !records.length) return Promise.resolve();
    return ensureSchema(fonte).then(function () {
        return open();
    }).then(function (db) {
        var sname = storeNameFor(fonte);
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(sname, "readwrite");
            var store = tx.objectStore(sname);
            records.forEach(function (r) {
                var op = r.__op || "U";
                if (op === "D") {
                    store.delete(r[store.keyPath]);
                } else {
                    delete r.__op;
                    store.put(r);
                }
            });
            tx.oncomplete = resolve;
            tx.onerror = function () { reject(tx.error); };
        });
    });
}

/**
 * Lê todos os registos da fonte e roda a query AlaSQL declarada
 * em fonte.expressaolistagem (que pode usar {filtros}).
 */
function query(fonte, filters) {
    return ensureSchema(fonte).then(function () {
        return open();
    }).then(function (db) {
        var sname = storeNameFor(fonte);
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(sname, "readonly");
            var store = tx.objectStore(sname);
            var req = store.getAll();
            req.onsuccess = function () { resolve(req.result || []); };
            req.onerror = function () { reject(req.error); };
        });
    }).then(function (rows) {
        if (!window.alasql) return rows;
        var sql = (fonte.expressaolistagem || "").trim();
        if (!sql) return rows;
        // Substitui {filtros}
        (filters || []).forEach(function (f) {
            sql = sql.replace(new RegExp("\\{" + f.codigo + "\\}", "g"),
                typeof f.valor === "number" ? f.valor : "'" + String(f.valor).replace(/'/g, "''") + "'");
        });
        sql = sql.replace(/\{[^}]+\}/g, "''"); // tokens não preenchidos
        try {
            return window.alasql(sql, [rows]);
        } catch (e) {
            console.warn("[MReportLocalDB] alasql err", e, sql);
            return rows;
        }
    });
}

function canQuery(fonte) {
    return !!(fonte && fonte.usacache && fonte.cacheversion > 0);
}

function clear(fonte) {
    return open().then(function (db) {
        var sname = storeNameFor(fonte);
        if (!db.objectStoreNames.contains(sname)) return;
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(sname, "readwrite");
            tx.objectStore(sname).clear();
            tx.oncomplete = resolve;
            tx.onerror = function () { reject(tx.error); };
        });
    });
}

function safeParse(s, fb) { try { return JSON.parse(s); } catch (e) { return fb; } }

window.MReportLocalDB = {
    ensureSchema: ensureSchema,
    applyDelta: applyDelta,
    query: query,
    canQuery: canQuery,
    clear: clear
};


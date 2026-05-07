/**
 * MREPORT DATA LAYER.js  —  Mreport 2.0
 * =====================================================================
 * Camada de dados:
 *   - chamadas AJAX  → gensel.aspx?cscript=...
 *   - acesso à Cache Architecture (versão + delta)
 *   - integração com IndexedDB via Local DB Operations
 *
 * EXPÕE:
 *   window.MReportDataLayer = {
 *       fetchConfig, executeDataSource,
 *       syncReal, commitFinal,
 *       getCacheVersion, getCacheChanges,
 *       startCachePolling, stopCachePolling
 *   }
 * =====================================================================
 */
var BASE = "../programs/gensel.aspx";

function call(cscript, payload) {
    return $.ajax({
        type: "POST",
        url: BASE + "?cscript=" + cscript,
        data: { "__EVENTARGUMENT": JSON.stringify(payload || []) },
        dataType: "json"
    });
}

// ====================================================================
// 1. FETCH INICIAL
// ====================================================================
/**
 * Server deve devolver:
 * {
 *   cod: "0000",
 *   data: {
 *     config: {...},
 *     sections: [...], tabs: [...], layouts: [...],
 *     objects: [...], objectDetails: [...], valoresDinamicos: [...],
 *     filters: [...], fontes: [...]
 *   }
 * }
 */
function fetchConfig(reportStamp) {
    // O cscript aceita codigo, u_mreportstamp ou relatoriostamp.
    // Enviamos os 3 — o que vier preenchido é o que serve.
    return call("getconfiguracaomreport", [{
        u_mreportstamp: reportStamp,
        relatoriostamp: reportStamp,
        codigo: reportStamp
    }]).then(function (resp) {
        if (!resp || resp.cod !== "0000") {
            throw new Error("Erro ao trazer configuração: " + (resp && resp.message));
        }
        return resp.data || {};
    });
}

// ====================================================================
// 2. EXECUÇÃO DE FONTE
// ====================================================================
function executeDataSource(fonte, filters) {
    // Se cache ligada e local DB tem dados frescos → query local (AlaSQL)
    if (fonte.usacache && window.MReportLocalDB && window.MReportLocalDB.canQuery(fonte)) {
        return window.MReportLocalDB.query(fonte, filters);
    }
    // Caso contrário → server
    return call("executeexpressaolistagemdb", [{
        mreportfonstestamp: fonte.mreportfonstestamp,
        expressaodblistagem: fonte.expressaolistagem,
        filters: filters || []
    }]).then(function (resp) {
        if (!resp || resp.cod !== "0000") throw new Error("Erro de fonte: " + (resp && resp.message));
        return resp.data;
    });
}

// ====================================================================
// 3. SYNC INCREMENTAL
// ====================================================================
/**
 * records: array de objectos (qualquer tabela)
 * table:   nome SQL  (ex: "MReportObject")
 * idField: PK (ex: "mreportobjectstamp")
 */
function syncReal(records, table, idField) {
    if (!records || !records.length) return Promise.resolve();
    var payload = [{
        table: table,
        idField: idField,
        records: records
    }];
    return call("realtimecomponentsync", payload).then(function (resp) {
        if (resp && resp.cod === "0000") {
            records.forEach(function (r) { r._dirty = false; });
        }
        return resp;
    });
}

// ====================================================================
// 4. COMMIT FINAL (upsert + soft-delete agregado)
// ====================================================================
function commitFinal(payload) {
    return call("actualizaconfiguracaomrelatorio", [payload]).then(function (resp) {
        if (!resp || resp.cod !== "0000") throw new Error("Erro no commit: " + (resp && resp.message));
        return resp;
    });
}

// ====================================================================
// 5. CACHE ARCHITECTURE
// ====================================================================
function getCacheVersion(fonte) {
    return call("getcacheversion", [{ mreportfonstestamp: fonte.mreportfonstestamp }])
        .then(function (resp) { return resp && resp.version != null ? Number(resp.version) : 0; });
}

function getCacheChanges(fonte, fromVersion) {
    return call("getcachechanges", [{
        mreportfonstestamp: fonte.mreportfonstestamp,
        fromVersion: fromVersion || 0
    }]).then(function (resp) {
        if (!resp || resp.cod !== "0000") throw new Error("Erro getcachechanges");
        return { version: Number(resp.version || 0), records: resp.records || [] };
    });
}

var POLL_DEFAULT_MS = 30000;

function startCachePolling(fonte, intervalMs) {
    stopCachePolling(fonte);
    var ms = intervalMs || POLL_DEFAULT_MS;
    var run = function () {
        getCacheVersion(fonte).then(function (serverVersion) {
            if (serverVersion > (fonte.cacheversion || 0)) {
                return getCacheChanges(fonte, fonte.cacheversion || 0)
                    .then(function (delta) {
                        if (window.MReportLocalDB && window.MReportLocalDB.applyDelta) {
                            return window.MReportLocalDB.applyDelta(fonte, delta.records)
                                .then(function () { fonte.cacheversion = delta.version; });
                        }
                    });
            }
        }).catch(function (err) {
            console.warn("[MReport cache] poll error", err);
        });
    };
    run();
    fonte._pollTimer = setInterval(run, ms);
}

function stopCachePolling(fonte) {
    if (fonte && fonte._pollTimer) {
        clearInterval(fonte._pollTimer);
        fonte._pollTimer = null;
    }
}

// ====================================================================
// EXPORT
// ====================================================================
window.MReportDataLayer = {
    fetchConfig: fetchConfig,
    executeDataSource: executeDataSource,
    syncReal: syncReal,
    commitFinal: commitFinal,
    getCacheVersion: getCacheVersion,
    getCacheChanges: getCacheChanges,
    startCachePolling: startCachePolling,
    stopCachePolling: stopCachePolling
};


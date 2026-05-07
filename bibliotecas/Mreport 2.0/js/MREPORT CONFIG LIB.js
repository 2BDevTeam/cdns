/**
 * MREPORT CONFIG LIB.js  —  Mreport 2.0
 * =====================================================================
 * Biblioteca principal do designer de relatórios.
 * Espelha o padrão de Mdash 2.0 (LIB / DATA / RENDERER / EXTENSION).
 *
 * EXPÕE:
 *   window.MReportLib   — API pública
 *   window.appState     — estado reactivo central (lido por PetiteVue)
 *
 * DEPENDE de:
 *   - jQuery
 *   - PetiteVue   (UI reactiva)
 *   - lodash      (utilitários)
 *   - alasql      (Local DB Operations.js)
 *   - alertify    (toasts)
 *   - interact.js (drag-drop)
 *   - MREPORT DATA LAYER.js
 *   - MREPORT RENDERER.js
 *   - Local DB Operations.js
 *
 * ESTADO desta versão: SCAFFOLDING. Métodos críticos marcados @TODO.
 * =====================================================================
 */
// ====================================================================
// 1. STATE GLOBAL REACTIVO
// ====================================================================
var appState = {
    ready: false,
    mode: "edit",                // edit | consultar
    reportStamp: "",
    config: null,                // MReportConfig
    sections: [],                // MReportSection[]
    tabs: [],                    // MReportTab[]
    layouts: [],                 // MReportLayout[] (públicos)
    objects: [],                 // MReportObject[]
    objectDetails: [],           // MReportObjectDetail[]
    valoresDinamicos: [],        // MReportValorDinamico[]
    filters: [],                 // MReportFilter[]
    fontes: [],                  // MReportFonte[]

    // Soft-delete buffer (commit final)
    deleteBuffer: [],            // [{table, stamp, tableKey}]

    // Engines runtime state
    clipboard: { type: "", items: [], sourceStamps: [] },
    multiSelection: { type: "", stamps: [], anchorStamp: "" },
    currentSelected: null,
    eventBus: null               // jQuery({})  initialised on init
};

// ====================================================================
// 2. CONSTRUCTORS
// ====================================================================
function MReportConfig(data) {
    data = data || {};
    this.u_mreportstamp = data.u_mreportstamp || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.categoria = data.categoria || "";
    this.temfiltro = !!data.temfiltro;
    this.filtrohorizontal = !!data.filtrohorizontal;
    this.activarmultiseparadores = !!data.activarmultiseparadores;
    this.mreportlayoutstamp = data.mreportlayoutstamp || "";
    this.orientacao = data.orientacao || "portrait";
    this.pagesize = data.pagesize || "A4";
    this.margemtop = num(data.margemtop, 20);
    this.margembottom = num(data.margembottom, 20);
    this.margemleft = num(data.margemleft, 15);
    this.margemright = num(data.margemright, 15);
    this.configjson = data.configjson || "{}";
}

function MReportSection(data) {
    data = data || {};
    this.mreportsectionstamp = data.mreportsectionstamp || uuid();
    this.mreportstamp = data.mreportstamp || "";
    this.mreporttabstamp = data.mreporttabstamp || "";
    this.codigo = data.codigo || "content";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "content";
    this.height = num(data.height, 0);
    this.width = num(data.width, 0);
    this.repeatonpages = !!data.repeatonpages;
    this.layoutmode = data.layoutmode || "absolute";
    this.mreportlayoutstamp = data.mreportlayoutstamp || "";
    this.slotsconfigjson = data.slotsconfigjson || "[]";
    this.configjson = data.configjson || "{}";
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
}

function MReportTab(data) {
    data = data || {};
    this.mreporttabstamp = data.mreporttabstamp || uuid();
    this.mreportstamp = data.mreportstamp || "";
    this.titulo = data.titulo || "";
    this.icone = data.icone || "";
    this.configjson = data.configjson || "{}";
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
}

function MReportLayout(data) {
    data = data || {};
    this.mreportlayoutstamp = data.mreportlayoutstamp || uuid();
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.layoutsystem = data.layoutsystem || "HCF";
    this.htmltemplate = data.htmltemplate || "";
    this.csstemplate = data.csstemplate || "";
    this.jstemplate = data.jstemplate || "";
    this.slotsdefinition = data.slotsdefinition || "[]";
    this.jscdns = data.jscdns || "[]";
    this.csscdns = data.csscdns || "[]";
    this.thumbnail = data.thumbnail || "";
    this.ispublic = data.ispublic === undefined ? true : !!data.ispublic;
    this.versao = num(data.versao, 1);
    this.categoria = data.categoria || "";
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
}

function MReportObject(data) {
    data = data || {};
    this.mreportobjectstamp = data.mreportobjectstamp || uuid();
    this.mreportstamp = data.mreportstamp || "";
    this.mreportsectionstamp = data.mreportsectionstamp || "";
    this.section = data.section || "";              // legacy compat
    this.slotid = data.slotid || "";
    this.fontestamp = data.fontestamp || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "texto";
    this.categoria = data.categoria || "";
    this.tamanho = num(data.tamanho, 0);
    this.ordem = num(data.ordem, 0);
    // posicionamento
    this.x = num(data.x, 0);
    this.y = num(data.y, 0);
    this.width = num(data.width, 200);
    this.height = num(data.height, 100);
    this.layoutmode = data.layoutmode || "inherit";
    this.gridrow = data.gridrow != null ? num(data.gridrow, null) : null;
    this.gridcolstart = data.gridcolstart != null ? num(data.gridcolstart, null) : null;
    this.gridcolspan = num(data.gridcolspan, 4);
    this.gridrowspan = num(data.gridrowspan, 1);
    // config
    this.expressaoobjecto = data.expressaoobjecto || "";
    this.configjson = data.configjson || "{}";
    this.queryconfigjson = data.queryconfigjson || "{}";
    this.objectQuery = data.objectQuery || "";
    this.objectexpressaodblistagem = data.objectexpressaodblistagem || "";
    this.tipoquery = data.tipoquery || "item";
    // detalhes
    this.temdetalhes = !!data.temdetalhes;
    this.detalhesqueryconfigjson = data.detalhesqueryconfigjson || "{}";
    this.tipoobjectodetalhes = data.tipoobjectodetalhes || "";
    this.titulodetalhes = data.titulodetalhes || "";
    this.titulobtndetalhes = data.titulobtndetalhes || "";
    this.processaFonte = data.processaFonte === undefined ? true : !!data.processaFonte;
    this.inactivo = !!data.inactivo;
    // runtime
    this._selected = false;
    this._dirty = false;
}

function MReportObjectDetail(data) {
    data = data || {};
    this.mreportobjectdetailstamp = data.mreportobjectdetailstamp || uuid();
    this.mreportobjectstamp = data.mreportobjectstamp || "";
    this.mreportstamp = data.mreportstamp || "";
    this.tipo = data.tipo || "";
    this.tamanho = num(data.tamanho, 0);
    this.ordem = num(data.ordem, 0);
    this.expressaoobjecto = data.expressaoobjecto || "";
    this.queryconfigjson = data.queryconfigjson || "{}";
    this.temdetalhes = !!data.temdetalhes;
    this.titulodetalhes = data.titulodetalhes || "";
    this.titulobtndetalhes = data.titulobtndetalhes || "";
    this.inactivo = !!data.inactivo;
}

function MReportValorDinamico(data) {
    data = data || {};
    this.mreportvalordinamicostamp = data.mreportvalordinamicostamp || uuid();
    this.mreportobjectstamp = data.mreportobjectstamp || "";
    this.mreportstamp = data.mreportstamp || "";
    this.descricao = data.descricao || "";
    this.valor = data.valor || "";
    this.tipo = data.tipo || "Standard";   // Standard|Celula|Variavel|Filtro
    this.refstamp = data.refstamp || "";
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
}

function MReportFilter(data) {
    data = data || {};
    this.mreportfilterstamp = data.mreportfilterstamp || uuid();
    this.mreportstamp = data.mreportstamp || "";
    this.mreporttabstamp = data.mreporttabstamp || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "text";
    this.campooption = data.campooption || "";
    this.eventochange = !!data.eventochange;
    this.expressaochange = data.expressaochange || "";
    this.campovalor = data.campovalor || "";
    this.tamanho = num(data.tamanho, 0);
    this.expressaolistagem = data.expressaolistagem || "";
    this.expressaojslistagem = data.expressaojslistagem || "";
    this.valordefeito = data.valordefeito || "";
    this.escopo = data.escopo || "global";
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
}

function MReportFonte(data) {
    data = data || {};
    this.mreportfonstestamp = data.mreportfonstestamp || uuid();
    this.mreportstamp = data.mreportstamp || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "sql";
    this.expressaolistagem = data.expressaolistagem || "";
    this.expressaojslistagem = data.expressaojslistagem || "";
    this.schemajson = data.schemajson || "[]";
    this.lastResultscached = data.lastResultscached || "";
    this.usacache = !!data.usacache;
    this.cacheversion = num(data.cacheversion, 0);
    this.retencaodias = num(data.retencaodias, 30);
    this.ordem = num(data.ordem, 0);
    this.inactivo = !!data.inactivo;
    // runtime
    this._pollTimer = null;
}

// ====================================================================
// 3. UTIL
// ====================================================================
function uuid() {
    // PHC-style stamp 25 chars
    var s = "ADM" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    s = s.slice(0, 25);
    while (s.length < 25) s += "0";
    return s;
}

function num(v, fallback) {
    if (v === null || v === undefined || v === "") return fallback;
    var n = Number(v);
    return isNaN(n) ? fallback : n;
}

function findByStamp(arr, key, stamp) {
    for (var i = 0; i < arr.length; i++) if (arr[i][key] === stamp) return arr[i];
    return null;
}

function debounce(fn, ms) {
    var t;
    return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
}

// ====================================================================
// 4. ENGINES (Clipboard, MultiSelection, DragDrop)
// ====================================================================

// ----- Clipboard ----------------------------------------------------
var ClipboardEngine = {
    copySelection: function () {
        var stamps = appState.multiSelection.stamps.length
            ? appState.multiSelection.stamps.slice()
            : appState.currentSelected ? [appState.currentSelected.mreportobjectstamp] : [];
        if (!stamps.length) return;

        var snaps = stamps.map(function (s) {
            var o = findByStamp(appState.objects, "mreportobjectstamp", s);
            return o ? JSON.parse(JSON.stringify(o)) : null;
        }).filter(Boolean);

        appState.clipboard = { type: "object", items: snaps, sourceStamps: stamps };
        $("body").addClass("mreport-has-clipboard");
        try { window.alertify && alertify.success(stamps.length + " objecto(s) copiado(s)"); } catch (e) { }
        emit("mreport.clipboard.copy", { count: stamps.length });
    },

    pasteClipboard: function () {
        var clip = appState.clipboard;
        if (!clip.items || !clip.items.length) return;
        var created = [];
        clip.items.forEach(function (snap) {
            var clone = JSON.parse(JSON.stringify(snap));
            clone.mreportobjectstamp = uuid();
            clone.x = (clone.x || 0) + 20;
            clone.y = (clone.y || 0) + 20;
            clone._selected = false;
            clone._dirty = true;
            var obj = new MReportObject(clone);
            appState.objects.push(obj);
            created.push(obj);
        });
        // sync incremental
        DataLayer().syncReal(created, "MReportObject", "mreportobjectstamp");
        Renderer().rerenderAll();
        emit("mreport.clipboard.paste", { count: created.length });
    }
};

// ----- Multi-selection ---------------------------------------------
var MultiSelectionEngine = {
    handle: function (objectStamp, ev) {
        var ms = appState.multiSelection;
        ms.type = "object";
        if (ev && ev.ctrlKey) {
            var i = ms.stamps.indexOf(objectStamp);
            if (i > -1) ms.stamps.splice(i, 1);
            else ms.stamps.push(objectStamp);
        } else if (ev && ev.shiftKey && ms.anchorStamp) {
            var arr = appState.objects;
            var a = -1, b = -1;
            for (var ix = 0; ix < arr.length; ix++) {
                if (arr[ix].mreportobjectstamp === ms.anchorStamp) a = ix;
                if (arr[ix].mreportobjectstamp === objectStamp) b = ix;
            }
            var lo = Math.min(a, b), hi = Math.max(a, b);
            ms.stamps = arr.slice(lo, hi + 1).map(function (o) { return o.mreportobjectstamp; });
        } else {
            ms.stamps = [objectStamp];
            ms.anchorStamp = objectStamp;
        }
        this.updateVisuals();
        emit("mreport.select.change", { stamps: ms.stamps.slice() });
    },

    clear: function () {
        appState.multiSelection.stamps = [];
        appState.multiSelection.anchorStamp = "";
        this.updateVisuals();
    },

    updateVisuals: function () {
        var stamps = appState.multiSelection.stamps;
        $(".report-object").each(function () {
            var s = $(this).attr("data-mreportobjectstamp");
            $(this).toggleClass("multi-selected", stamps.indexOf(s) !== -1);
        });
    }
};

// ----- DragDropValidator (stub) ------------------------------------
var DragDropValidator = {
    PADDING: 4,

    validateDrop: function (obj, target) {
        if (!target) return { isValid: false, message: "Sem destino válido" };

        if (target.type === "section-absolute") {
            var rect = target.el.getBoundingClientRect();
            var fitsX = (obj.x + obj.width) <= (rect.width - this.PADDING);
            var fitsY = (obj.y + obj.height) <= (rect.height - this.PADDING);
            if (!fitsX || !fitsY) return { isValid: false, message: "Não cabe na secção" };
        }

        if (target.type === "slot") {
            var occupied = appState.objects.some(function (o) {
                return !o.inactivo
                    && o.slotid === target.slotid
                    && o.mreportsectionstamp === target.sectionStamp
                    && o.mreportobjectstamp !== obj.mreportobjectstamp;
            });
            if (occupied) return { isValid: false, message: "Slot ocupado", hint: "swap" };
        }

        // grid validation @TODO
        return { isValid: true };
    }
};

// ====================================================================
// 5. KEYBOARD SHORTCUTS
// ====================================================================
function bindKeyboard() {
    $(document).off("keydown.mreport").on("keydown.mreport", function (e) {
        if (appState.mode === "consultar") return;
        var t = e.target.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || (e.target.isContentEditable)) return;

        if (e.key === "Delete" && appState.multiSelection.stamps.length) {
            e.preventDefault();
            MReportLib.deleteSelected();
        } else if (e.key === "Escape") {
            MultiSelectionEngine.clear();
            appState.currentSelected = null;
            Renderer().refreshPropertyPanel();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
            e.preventDefault();
            ClipboardEngine.copySelection();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
            e.preventDefault();
            ClipboardEngine.pasteClipboard();
        }
    });
}

// ====================================================================
// 6. EVENT BUS
// ====================================================================
function emit(name, data) {
    if (appState.eventBus) appState.eventBus.trigger(name, [data]);
}

// ====================================================================
// 7. SAFE LAZY ACCESS TO COMPANION MODULES
// ====================================================================
function DataLayer()  { return window.MReportDataLayer  || stubModule("MReportDataLayer"); }
function Renderer()   { return window.MReportRenderer   || stubModule("MReportRenderer"); }
function Extension()  { return window.MReportExtension  || stubModule("MReportExtension"); }

function stubModule(name) {
    return new Proxy({}, {
        get: function (_, k) {
            return function () { console.warn("[MReportLib] " + name + "." + k + "() chamado mas módulo ausente"); };
        }
    });
}

// ====================================================================
// 8. PUBLIC API
// ====================================================================
var MReportLib = {

    // ------ Lifecycle ------------------------------------------------
    init: function (reportStamp, opts) {
        opts = opts || {};
        appState.reportStamp = reportStamp;
        appState.mode = opts.mode || "edit";
        appState.eventBus = $({});

        return DataLayer().fetchConfig(reportStamp)
            .then(function (data) {
                populateState(data);
                bindKeyboard();
                appState.ready = true;
                emit("mreport.ready", {});
                if (opts.container) Renderer().renderDesigner(opts.container);
                return appState;
            });
    },

    // ------ State ----------------------------------------------------
    getState: function () { return appState; },
    getObject: function (stamp) { return findByStamp(appState.objects, "mreportobjectstamp", stamp); },
    getSection: function (stamp) { return findByStamp(appState.sections, "mreportsectionstamp", stamp); },
    getFonte: function (stamp) { return findByStamp(appState.fontes, "mreportfonstestamp", stamp); },
    getFilter: function (stamp) { return findByStamp(appState.filters, "mreportfilterstamp", stamp); },

    // ------ Constructors (re-exposed for external use) -------------
    constructors: {
        MReportConfig: MReportConfig,
        MReportSection: MReportSection,
        MReportTab: MReportTab,
        MReportLayout: MReportLayout,
        MReportObject: MReportObject,
        MReportObjectDetail: MReportObjectDetail,
        MReportValorDinamico: MReportValorDinamico,
        MReportFilter: MReportFilter,
        MReportFonte: MReportFonte
    },

    // ------ Selection -----------------------------------------------
    selectObject: function (stamp, ev) {
        var obj = this.getObject(stamp);
        if (!obj) return;
        appState.currentSelected = obj;
        MultiSelectionEngine.handle(stamp, ev || {});
        Renderer().refreshPropertyPanel();
    },

    deselectAll: function () {
        MultiSelectionEngine.clear();
        appState.currentSelected = null;
        Renderer().refreshPropertyPanel();
    },

    // ------ Mutations ------------------------------------------------
    addObject: function (data) {
        var obj = new MReportObject($.extend({ mreportstamp: appState.reportStamp }, data || {}));
        appState.objects.push(obj);
        DataLayer().syncReal([obj], "MReportObject", "mreportobjectstamp");
        Renderer().rerenderAll();
        emit("mreport.object.add", { obj: obj });
        return obj;
    },

    updateObject: function (stamp, patch, opts) {
        var obj = this.getObject(stamp);
        if (!obj) return;
        $.extend(obj, patch || {});
        obj._dirty = true;
        this.syncDebounced([obj], "MReportObject", "mreportobjectstamp");
        // skipRerender: usado durante drag/resize para n\u00e3o destruir o n\u00f3 DOM
        // (j\u00e1 actualizado visualmente via transform inline)
        if (!(opts && opts.skipRerender)) {
            Renderer().rerenderObject(obj);
        }
        emit("mreport.object.update", { stamp: stamp, patch: patch });
    },

    deleteSelected: function () {
        var stamps = appState.multiSelection.stamps.slice();
        if (!stamps.length && appState.currentSelected) stamps.push(appState.currentSelected.mreportobjectstamp);
        stamps.forEach(function (s) {
            var obj = MReportLib.getObject(s);
            if (!obj) return;
            obj.inactivo = true;
            appState.deleteBuffer.push({
                table: "MReportObject", stamp: s, tableKey: "mreportobjectstamp"
            });
        });
        MultiSelectionEngine.clear();
        appState.currentSelected = null;
        Renderer().rerenderAll();
        emit("mreport.object.delete", { stamps: stamps });
    },

    // ------ Clipboard / multi-select ------------------------------
    copy:  ClipboardEngine.copySelection,
    paste: ClipboardEngine.pasteClipboard,
    handleMultiSelect: MultiSelectionEngine.handle.bind(MultiSelectionEngine),

    // ------ DragDrop validation ----------------------------------
    validateDrop: DragDropValidator.validateDrop.bind(DragDropValidator),

    // ------ Sync / Commit ----------------------------------------
    syncReal: function (records, table, idField) {
        return DataLayer().syncReal(records, table, idField);
    },
    syncDebounced: debounce(function (records, table, idField) {
        DataLayer().syncReal(records, table, idField);
    }, 300),

    commit: function () {
        return DataLayer().commitFinal({
            relatoriostamp: appState.reportStamp,
            config: appState.config,
            sections: appState.sections,
            tabs: appState.tabs,
            objects: appState.objects,
            objectDetails: appState.objectDetails,
            valoresDinamicos: appState.valoresDinamicos,
            filters: appState.filters,
            fontes: appState.fontes,
            deleteBuffer: appState.deleteBuffer
        }).then(function (resp) {
            appState.deleteBuffer = [];
            emit("mreport.commit", { ok: true });
            return resp;
        });
    },

    // ------ Event bus --------------------------------------------
    on:  function (name, fn) { if (appState.eventBus) appState.eventBus.on(name, fn); },
    off: function (name, fn) { if (appState.eventBus) appState.eventBus.off(name, fn); },

    // ------ Util --------------------------------------------------
    uuid: uuid,
    version: "2.0.0-alpha"
};

// ====================================================================
// 9. POPULATE STATE FROM AJAX RESPONSE
// ====================================================================
function populateState(data) {
    data = data || {};

    // O server devolve `config` como DataTable serializada → array de rows.
    // Desempacotamos para um único objecto antes de instanciar.
    var rawConfig = data.config;
    if ($.isArray(rawConfig)) rawConfig = rawConfig[0] || {};
    appState.config = new MReportConfig(rawConfig || {});

    appState.sections        = (data.sections        || []).map(function (d) { return new MReportSection(d); });
    appState.tabs            = (data.tabs            || []).map(function (d) { return new MReportTab(d); });
    appState.layouts         = (data.layouts         || []).map(function (d) { return new MReportLayout(d); });
    appState.objects         = (data.objects         || []).map(function (d) { return new MReportObject(d); });
    appState.objectDetails   = (data.objectDetails   || []).map(function (d) { return new MReportObjectDetail(d); });
    appState.valoresDinamicos= (data.valoresDinamicos|| []).map(function (d) { return new MReportValorDinamico(d); });
    appState.filters         = (data.filters         || []).map(function (d) { return new MReportFilter(d); });
    appState.fontes          = (data.fontes          || []).map(function (d) { return new MReportFonte(d); });

    appState.deleteBuffer = [];

    // NOTA: cache polling desligado por agora (ainda não estamos a lidar com caches).
    // Quando for para activar, descomentar:
    // if (window.MReportDataLayer && window.MReportDataLayer.startCachePolling) {
    //     appState.fontes
    //         .filter(function (f) { return f.usacache && !f.inactivo; })
    //         .forEach(function (f) { window.MReportDataLayer.startCachePolling(f); });
    // }
}

// ====================================================================
// 10. EXPORT
// ====================================================================
window.appState  = appState;
window.MReportLib = MReportLib;


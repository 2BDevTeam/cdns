/**
 * TEMPLATE MREPORT STANDARD EXTENSION.js  —  Mreport 2.0
 * =====================================================================
 * Camada de "extensão": defaults, biblioteca de componentes, render por
 * tipo de objecto, tema/CSS window. É o que distingue uma instalação de
 * cliente de outra (override este ficheiro, não os core).
 *
 * EXPÕE:
 *   window.MReportExtension = {
 *       getComponentLibrary,
 *       renderObjectContent,
 *       getDefaultLayouts,
 *       addStyles
 *   }
 * =====================================================================
 */
// ====================================================================
// 1. BIBLIOTECA DE COMPONENTES
// ====================================================================
function getComponentLibrary() {
    return [
        { tipo: "texto",    label: "Texto",     icon: "fa fa-font",     categoria: "basicos" },
        { tipo: "tabela",   label: "Tabela",    icon: "fa fa-table",    categoria: "dados" },
        { tipo: "chart",    label: "Gráfico",   icon: "fa fa-chart-bar",categoria: "dados" },
        { tipo: "kpi",      label: "KPI",       icon: "fa fa-tachometer-alt", categoria: "dados" },
        { tipo: "imagem",   label: "Imagem",    icon: "fa fa-image",    categoria: "basicos" },
        { tipo: "linha",    label: "Linha",     icon: "fa fa-minus",    categoria: "basicos" },
        { tipo: "espacador",label: "Espaçador", icon: "fa fa-arrows-alt-v", categoria: "basicos" },
        { tipo: "html",     label: "HTML livre",icon: "fa fa-code",     categoria: "avancados" }
    ];
}

// ====================================================================
// 2. RENDER POR TIPO
// ====================================================================
function renderObjectContent(obj) {
    var cfg = safeParse(obj.configjson, {});
    switch (obj.tipo) {
        case "texto":  return renderTexto(obj, cfg);
        case "tabela": return renderTabela(obj, cfg);
        case "chart":  return renderChart(obj, cfg);
        case "kpi":    return renderKpi(obj, cfg);
        case "imagem": return renderImagem(obj, cfg);
        case "linha":  return '<hr style="margin:0">';
        case "html":   return cfg.html || "";
        default:       return placeholder(obj);
    }
}

function renderTexto(obj, cfg) {
    var content = escapeHtml(cfg.text || obj.descricao || "Texto");
    return '<div class="mreport-obj-texto" style="font-size:' + (cfg.fontSize || 14) + 'px">'
        + content + '</div>';
}
function renderTabela(obj, cfg) {
    return '<div class="mreport-obj-tabela">'
        + '<table class="table table-bordered table-sm"><thead><tr>'
        + '<th>Coluna A</th><th>Coluna B</th></tr></thead>'
        + '<tbody><tr><td>—</td><td>—</td></tr></tbody></table></div>';
}
function renderChart(obj, cfg) {
    return '<div class="mreport-obj-chart"><i class="fa fa-chart-bar fa-3x"></i><div>'
        + escapeHtml(cfg.title || "Gráfico") + '</div></div>';
}
function renderKpi(obj, cfg) {
    return '<div class="mreport-obj-kpi">'
        + '<div class="kpi-label">' + escapeHtml(cfg.label || obj.descricao || "KPI") + '</div>'
        + '<div class="kpi-value">' + escapeHtml(cfg.value || "0") + '</div>'
        + '</div>';
}
function renderImagem(obj, cfg) {
    var src = cfg.src || "";
    return src
        ? '<img src="' + escapeAttr(src) + '" style="width:100%;height:100%;object-fit:contain"/>'
        : placeholder(obj);
}
function placeholder(obj) {
    return '<div class="mreport-obj-placeholder">'
        + '<i class="fa fa-cube"></i> ' + escapeHtml(obj.descricao || obj.tipo)
        + '</div>';
}

// ====================================================================
// 3. LAYOUTS DEFAULT (HCF)
// ====================================================================
function getDefaultLayouts() {
    return [
        {
            mreportlayoutstamp: "default-hcf",
            codigo: "default-hcf",
            descricao: "Header / Content / Footer",
            layoutsystem: "HCF",
            htmltemplate:
                '<div class="hcf-layout">'
                + '<div class="hcf-header" data-mreport-slot="header"></div>'
                + '<div class="hcf-content" data-mreport-slot="content"></div>'
                + '<div class="hcf-footer" data-mreport-slot="footer"></div>'
                + '</div>',
            csstemplate:
                '.hcf-layout{display:flex;flex-direction:column;height:100%}'
                + '.hcf-header{min-height:80px;border-bottom:1px solid #e3e6ef}'
                + '.hcf-content{flex:1}'
                + '.hcf-footer{min-height:60px;border-top:1px solid #e3e6ef}',
            slotsdefinition: JSON.stringify([
                { id: "header",  label: "Cabeçalho", type: "content" },
                { id: "content", label: "Conteúdo",  type: "content", isMainContent: true },
                { id: "footer",  label: "Rodapé",    type: "content" }
            ])
        }
    ];
}

// ====================================================================
// 4. STYLES GLOBAIS (scoped)
// ====================================================================
var STYLE_ID = "mreport2-extension-styles";
function buildStylesCss() {
    return ''
        // Defensivo: PHC pode meter o root dentro de containers com altura indefinida
        + '#mreport-designer-root.mreport-editor-wrapper{font-family:Inter,Nunito,Segoe UI,sans-serif;color:#1a1f2e;display:block;width:100%;min-height:600px}'
        + '#mreport-designer-root .mreport-designer{display:grid !important;grid-template-columns:240px minmax(0,1fr) 320px;gap:12px;width:100%;min-height:600px;height:calc(100vh - 160px);align-items:stretch}'
        + '#mreport-designer-root .mreport-sidebar{background:#f7f9fc;border:1px solid #e3e6ef;border-radius:8px;padding:10px;overflow:auto;min-width:0}'
        + '#mreport-designer-root .mreport-sidebar h6{margin:6px 0 4px;font-weight:700;color:#5a6280;font-size:12px;text-transform:uppercase}'
        + '#mreport-designer-root .mreport-canvas-wrapper{background:#fff;border:1px solid #e3e6ef;border-radius:8px;overflow:auto;padding:18px;min-width:0;min-height:400px}'
        + '#mreport-designer-root .mreport-canvas{display:flex;flex-direction:column;gap:10px;min-height:100%}'
        + '#mreport-designer-root .report-section{position:relative;border:1px dashed #c7cce0;border-radius:6px;padding:6px;background:'
        + 'linear-gradient(0deg,transparent 24%,rgba(0,0,0,.04) 25%,rgba(0,0,0,.04) 26%,transparent 27%,transparent 74%,rgba(0,0,0,.04) 75%,rgba(0,0,0,.04) 76%,transparent 77%),'
        + 'linear-gradient(90deg,transparent 24%,rgba(0,0,0,.04) 25%,rgba(0,0,0,.04) 26%,transparent 27%,transparent 74%,rgba(0,0,0,.04) 75%,rgba(0,0,0,.04) 76%,transparent 77%);'
        + 'background-size:20px 20px}'
        + '#mreport-designer-root .section-label{font-size:11px;text-transform:uppercase;color:#8b92a8;padding:2px 6px;background:#fff;border-radius:3px;display:inline-block;margin-bottom:4px}'
        + '#mreport-designer-root .section-content{position:relative;min-height:120px}'
        + '#mreport-designer-root .report-object{background:#fff;border:1px solid #c7cce0;border-radius:4px;padding:6px;cursor:move;user-select:none;box-shadow:0 1px 2px rgba(0,0,0,.04)}'
        + '#mreport-designer-root .report-object.multi-selected,#mreport-designer-root .report-object._selected{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.25)}'
        + '#mreport-designer-root .mreport-component-item{padding:6px 8px;border:1px solid #d6dae8;border-radius:5px;margin-bottom:6px;cursor:grab;background:#fff}'
        + '#mreport-designer-root .mreport-component-item:hover{border-color:#3b82f6}'
        + '#mreport-designer-root .mreport-property-panel{font-size:13px}'
        + '#mreport-designer-root .empty-state{color:#8b92a8;font-size:12px;font-style:italic;padding:8px}'
        + '';
}

function addStyles() {
    // Injectar 2x: <head> (preferencial) e dentro do root (defensivo contra postback do PHC)
    var css = buildStylesCss();
    if (!document.getElementById(STYLE_ID)) {
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = css;
        (document.head || document.documentElement).appendChild(s);
    }
    var root = document.getElementById("mreport-designer-root");
    if (root && !root.querySelector("style[data-mreport-styles]")) {
        var inner = document.createElement("style");
        inner.setAttribute("data-mreport-styles", "1");
        inner.textContent = css;
        root.insertBefore(inner, root.firstChild);
    }
}

function safeParse(s, fb) { try { return JSON.parse(s); } catch (e) { return fb; } }
function escapeHtml(s) {
    return String(s == null ? "" : s)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }

window.MReportExtension = {
    getComponentLibrary: getComponentLibrary,
    renderObjectContent: renderObjectContent,
    getDefaultLayouts: getDefaultLayouts,
    addStyles: addStyles
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addStyles);
} else {
    addStyles();
}


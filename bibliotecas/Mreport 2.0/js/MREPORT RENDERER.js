/**
 * MREPORT RENDERER.js  —  Mreport 2.0
 * =====================================================================
 * Camada de apresentação do designer:
 *   - gera HTML do canvas (3-colunas: components / canvas / properties)
 *   - render unificado por slots (data-mreport-slot)
 *   - inicializa drag-drop (interact.js)
 *   - actualiza o property panel (JSONEditor)
 *
 * Inspiração visual:  bibliotecas/Mreport/Mockups/Mreport v9.html
 * Padrão de slots:    bibliotecas/Mdash 2.0/js/MDash config lib REFACTOR.js
 *                     (renderUnifiedLayout / data-mdash-slot)
 *
 * EXPÕE:
 *   window.MReportRenderer = {
 *       renderDesigner, renderSection, renderObject,
 *       rerenderObject, rerenderAll,
 *       refreshPropertyPanel, initDragDrop
 *   }
 *
 * ESTADO: SCAFFOLDING. Métodos críticos com @TODO.
 * =====================================================================
 */
var DEFAULT_TEMPLATE_HCF = ''
    + '<div class="mreport-top-toolbar" data-mreport-slot="toolbar">'
    + '  <div class="mreport-top-toolbar-brand"><i class="fa fa-file-invoice"></i> Mreport <span class="mreport-version-badge">2.0</span></div>'
    + '  <div class="mreport-top-toolbar-actions">'
    + '    <button type="button" class="btn btn-default btn-sm" data-action="copy" title="Copiar (Ctrl+C)"><i class="fa fa-copy"></i></button>'
    + '    <button type="button" class="btn btn-default btn-sm" data-action="paste" title="Colar (Ctrl+V)"><i class="fa fa-paste"></i></button>'
    + '    <button type="button" class="mreport-btn-delete btn btn-sm" data-action="delete" title="Eliminar (Delete)"><i class="fa fa-trash"></i></button>'
    + '    <span class="mreport-toolbar-separator"></span>'
    + '    <button type="button" class="btn btn-default btn-sm" data-action="add-section" title="Adicionar Secção"><i class="fa fa-plus"></i> Secção</button>'
    + '    <select class="form-control input-sm mreport-pagesize" title="Tamanho de página">'
    + '      <option value="A4">A4</option><option value="A3">A3</option><option value="Letter">Letter</option><option value="Legal">Legal</option>'
    + '    </select>'
    + '    <select class="form-control input-sm mreport-orientation" title="Orientação">'
    + '      <option value="portrait">Retrato</option><option value="landscape">Paisagem</option>'
    + '    </select>'
    + '    <span class="mreport-toolbar-separator"></span>'
    + '    <button type="button" class="btn btn-default btn-sm" data-action="preview" title="Pré-visualizar"><i class="fa fa-eye"></i> Pré-visualizar</button>'
    + '    <button type="button" class="mreport-save-btn btn btn-sm" data-action="save" title="Gravar (Ctrl+S)"><i class="fa fa-save"></i> Gravar</button>'
    + '  </div>'
    + '</div>'
    + '<div class="mreport-modern-layout">'
    + '  <div class="mreport-sidebar mreport-components-sidebar">'
    + '    <div class="mreport-sidebar-header">'
    + '      <h4><i class="fa fa-th-large"></i> Componentes</h4>'
    + '    </div>'
    + '    <div class="mreport-sidebar-body">'
    + '      <div class="mreport-widget-section">'
    + '        <div class="mreport-section-label">Objectos</div>'
    + '        <div class="mreport-widget-grid" data-mreport-slot="components"></div>'
    + '      </div>'
    + '      <div class="mreport-sidebar-divider"></div>'
    + '      <div class="mreport-widget-section">'
    + '        <div class="mreport-section-label"><i class="fa fa-filter"></i> Filtros</div>'
    + '        <div class="mreport-sidebar-list" data-mreport-slot="filters"></div>'
    + '        <button class="btn btn-default btn-xs mreport-add-filter" type="button" style="width:100%;margin-top:6px"><i class="fa fa-plus"></i> Adicionar Filtro</button>'
    + '      </div>'
    + '      <div class="mreport-sidebar-divider"></div>'
    + '      <div class="mreport-widget-section">'
    + '        <div class="mreport-section-label"><i class="fa fa-database"></i> Fontes de Dados</div>'
    + '        <div class="mreport-sidebar-list" data-mreport-slot="fontes"></div>'
    + '        <button class="btn btn-default btn-xs mreport-add-fonte" type="button" style="width:100%;margin-top:6px"><i class="fa fa-plus"></i> Adicionar Fonte</button>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '  <div class="mreport-canvas">'
    + '    <div class="mreport-canvas-body">'
    + '      <div class="mreport-page" data-mreport-slot="page">'
    + '        <div class="mreport-canvas-inner" data-mreport-slot="canvas"></div>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '  <div class="mreport-sidebar mreport-properties-sidebar">'
    + '    <div class="mreport-sidebar-header">'
    + '      <h4><i class="fa fa-sliders-h"></i> Propriedades</h4>'
    + '    </div>'
    + '    <div class="mreport-sidebar-body">'
    + '      <div class="mreport-property-panel" data-mreport-slot="properties">'
    + '        <div class="empty-state"><i class="fa fa-mouse-pointer"></i><br>Seleccione um objecto<br><small>ou arraste um componente para o canvas</small></div>'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '</div>';

// ====================================================================
// ESTILOS MODERNOS — padrão Mdash 2.0 com tokens via getColorByType
// ====================================================================
function hexToRgbStr(color) {
    // Aceita "#rrggbb", "rgb(r,g,b)" ou "rgba(...)" e devolve "r,g,b"
    if (!color) return "59,130,246";
    var m = String(color).match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return m[1] + "," + m[2] + "," + m[3];
    m = String(color).match(/^#([0-9a-f]{6})$/i);
    if (m) {
        var n = parseInt(m[1], 16);
        return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
    }
    return "59,130,246";
}

function injectModernStyles($c) {
    // Tokens base via getColorByType (Bootstrap btn-primary)
    var primary = "#3b82f6", primaryRgb = "59,130,246";
    if (typeof window.getColorByType === "function") {
        try {
            var c = window.getColorByType("primary");
            if (c && c.background) { primary = c.background; primaryRgb = hexToRgbStr(c.background); }
        } catch (e) { }
    }

    // Wrapper inline (resistente a sanitizer): preenche o container do PHC
    // (position:relative + 100% para evitar saltos sem sair do contentor)
    $c.css({
        "--mr-primary": primary,
        "--mr-primary-rgb": primaryRgb,
        "position": "relative",
        "width": "100%",
        "height": "100%",
        "min-height": "640px",
        "display": "flex",
        "flex-direction": "column",
        "font-family": "Inter,Nunito,Segoe UI,sans-serif",
        "color": "#1f2937",
        "overflow": "hidden",
        "border-radius": "12px",
        "background":
            "radial-gradient(circle at 10% -10%, rgba(" + primaryRgb + ",0.12) 0%, transparent 34%),"
            + "radial-gradient(circle at 110% 120%, rgba(" + primaryRgb + ",0.12) 0%, transparent 32%),"
            + "#f3f6fb"
    });

    // Estilo único no head (idempotente)
    $("#mreport-modern-styles").remove();
    var s = "";
    s += "<style id='mreport-modern-styles'>";
    s += ".mreport-editor-wrapper * { box-sizing: border-box; }";
    s += ".mreport-editor-wrapper { --mr-surface:#fff; --mr-bg:#f3f6fb; --mr-text:#1f2937; --mr-muted:#64748b; --mr-border:rgba(15,23,42,0.08); }";

    // ── Top toolbar (gradiente primário) ──
    s += ".mreport-top-toolbar { height:54px; background: linear-gradient(120deg, rgba(var(--mr-primary-rgb),0.96), #101828 88%); display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid rgba(255,255,255,0.18); flex-shrink:0; box-shadow:0 8px 24px rgba(2,6,23,0.18); }";
    s += ".mreport-top-toolbar-brand { color:#fff; font-weight:700; font-size:16px; display:flex; align-items:center; gap:8px; letter-spacing:0.2px; }";
    s += ".mreport-top-toolbar-brand i { color:#fff; opacity:0.95; }";
    s += ".mreport-version-badge { background:rgba(255,255,255,0.2); padding:1px 8px; border-radius:10px; font-size:11px; font-weight:600; }";
    s += ".mreport-top-toolbar-actions { display:flex; align-items:center; gap:6px; }";
    s += ".mreport-top-toolbar-actions .btn { font-size:12px; }";
    s += ".mreport-top-toolbar-actions .form-control { width:auto; display:inline-block; height:28px; padding:2px 8px; font-size:12px; }";
    s += ".mreport-toolbar-separator { width:1px; height:22px; background:rgba(255,255,255,0.25); margin:0 4px; }";
    s += ".mreport-save-btn { background:#22c55e !important; border-color:#16a34a !important; color:#fff !important; font-weight:600; }";
    s += ".mreport-save-btn:hover { background:#16a34a !important; border-color:#15803d !important; }";
    s += ".mreport-btn-delete { background:#d43f3a !important; border:1px solid #d43f3a !important; color:#fff !important; }";
    s += ".mreport-btn-delete:hover { background:#b52f2b !important; border-color:#b52f2b !important; }";

    // ── Layout principal ──
    s += ".mreport-modern-layout { display:flex; flex:1; overflow:hidden; gap:8px; padding:8px; min-height:0; }";

    // ── Sidebars (gradiente primário, header escuro) ──
    s += ".mreport-sidebar { width:260px; min-width:260px; background: linear-gradient(180deg, rgba(var(--mr-primary-rgb),0.96), rgba(var(--mr-primary-rgb),0.84)); border:1px solid rgba(255,255,255,0.16); border-radius:14px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 16px 32px rgba(2,6,23,0.18); }";
    s += ".mreport-properties-sidebar { width:320px; min-width:320px; }";
    s += ".mreport-sidebar-header { min-height:50px; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.18); color:#fff; display:flex; align-items:center; }";
    s += ".mreport-sidebar-header h4 { margin:0; font-size:18px; font-weight:800; display:flex; align-items:center; gap:8px; line-height:1; }";
    s += ".mreport-sidebar-body { flex:1; overflow-y:auto; padding:12px; background: linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.97)); }";
    s += ".mreport-sidebar-divider { height:1px; background: linear-gradient(90deg, transparent, rgba(var(--mr-primary-rgb),0.35), transparent); margin:12px 0; }";

    // ── Section labels ──
    s += ".mreport-widget-section { padding:2px 0 4px; }";
    s += ".mreport-section-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.2px; color:var(--mr-primary); margin:0 0 10px 2px; display:flex; align-items:center; gap:6px; }";

    // ── Widget grid (componentes em tiles 2 colunas) ──
    s += ".mreport-widget-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }";
    s += ".mreport-widget-tile { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; min-height:78px; padding:12px 8px; background:#fff; border:1px solid rgba(var(--mr-primary-rgb),0.28); border-radius:12px; cursor:grab; transition:all 0.2s ease; font-size:12px; font-weight:700; color:var(--mr-primary); text-align:center; user-select:none; box-shadow:0 4px 14px rgba(2,6,23,0.06); }";
    s += ".mreport-widget-tile i { font-size:22px; color:var(--mr-primary); }";
    s += ".mreport-widget-tile:hover { transform:translateY(-2px); border-color:var(--mr-primary); box-shadow:0 8px 20px rgba(var(--mr-primary-rgb),0.22); }";
    s += ".mreport-widget-tile:active { cursor:grabbing; transform:translateY(0); }";

    // ── Lista (filtros / fontes) ──
    s += ".mreport-sidebar-list { display:flex; flex-direction:column; gap:6px; }";
    s += ".mreport-sidebar-item { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:#fff; border:1px solid var(--mr-border); border-radius:8px; cursor:pointer; transition:all 0.2s; font-size:13px; color:var(--mr-text); }";
    s += ".mreport-sidebar-item:hover { border-color:rgba(var(--mr-primary-rgb),0.45); transform:translateX(2px); }";
    s += ".mreport-sidebar-item-content { flex:1; display:flex; align-items:center; gap:8px; min-width:0; overflow:hidden; }";
    s += ".mreport-sidebar-item-content i { color:var(--mr-primary); font-size:12px; }";
    s += ".mreport-sidebar-item-content .badge { background:var(--mr-primary); font-size:10px; }";
    s += ".mreport-sidebar-item-actions { display:flex; gap:4px; }";
    s += ".mreport-empty-list { color:var(--mr-muted); font-size:12px; font-style:italic; padding:8px 4px; text-align:center; }";

    // ── Canvas (área central) ──
    s += ".mreport-canvas { flex:1; display:flex; flex-direction:column; overflow:hidden; border-radius:14px; border:1px solid var(--mr-border); background:var(--mr-surface); box-shadow:0 12px 28px rgba(2,6,23,0.08); min-width:0; }";
    s += ".mreport-canvas-body { flex:1; overflow:auto; padding:24px; background-image: radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px); background-size:18px 18px; background-position:-8px -8px; display:flex; justify-content:center; align-items:flex-start; }";

    // ── Página A4 ──
    s += ".mreport-page { background:#fff; width:794px; min-height:1123px; box-shadow:0 4px 12px rgba(15,23,42,0.12), 0 1px 3px rgba(15,23,42,0.08); border-radius:2px; padding:40px; position:relative; }";
    s += ".mreport-canvas-inner { display:flex; flex-direction:column; gap:4px; min-height:100%; }";

    // ── Empty state ──
    s += ".empty-state { color:var(--mr-muted); font-size:13px; text-align:center; padding:24px 8px; line-height:1.6; }";
    s += ".empty-state i { font-size:32px; color:var(--mr-primary); opacity:0.45; margin-bottom:10px; display:block; }";
    s += ".empty-state small { color:var(--mr-muted); opacity:0.8; }";

    // ── Secções do canvas (estilo Crystal Reports + tokens) ──
    s += ".report-section { position:relative; border-top:1px solid #cbd5e1; border-bottom:1px solid #cbd5e1; background:#fafbfc; margin-bottom:2px; }";
    s += ".section-label { font-size:10px; text-transform:uppercase; color:#fff; padding:4px 10px; background:linear-gradient(90deg, var(--mr-primary), rgba(var(--mr-primary-rgb),0.75)); display:flex; align-items:center; justify-content:space-between; font-weight:700; letter-spacing:0.6px; }";
    s += ".section-label .section-label-actions { display:flex; gap:4px; }";
    s += ".section-label .section-label-actions button { border:none; background:rgba(255,255,255,0.18); color:#fff; cursor:pointer; padding:2px 6px; font-size:11px; border-radius:4px; }";
    s += ".section-label .section-label-actions button:hover { background:rgba(255,255,255,0.32); }";
    s += ".section-content { position:relative; min-height:120px; overflow:hidden; background-image: linear-gradient(rgba(var(--mr-primary-rgb),0.05) 1px,transparent 1px), linear-gradient(90deg,rgba(var(--mr-primary-rgb),0.05) 1px,transparent 1px); background-size:20px 20px; background-position:-1px -1px; }";
    s += ".section-empty-hint { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#cbd5e1; font-size:12px; font-style:italic; pointer-events:none; text-align:center; }";
    s += ".section-empty-hint i { font-size:18px; display:block; margin-bottom:4px; }";
    s += ".section-resize-handle { position:absolute; bottom:-3px; left:0; right:0; height:6px; cursor:ns-resize; z-index:5; }";
    s += ".section-resize-handle:hover { background:rgba(var(--mr-primary-rgb),0.3); }";

    // ── Objectos ──
    s += ".report-object { background:#fff; border:1px solid #94a3b8; border-radius:3px; padding:4px; cursor:move; user-select:none; box-shadow:0 1px 2px rgba(15,23,42,0.06); font-size:12px; }";
    s += ".report-object:hover { border-color:rgba(var(--mr-primary-rgb),0.55); }";
    s += ".report-object.selected { border:2px solid var(--mr-primary); box-shadow:0 0 0 3px rgba(var(--mr-primary-rgb),0.22); z-index:10; }";

    // ── Property panel ──
    s += ".mreport-property-panel .form-group { margin-bottom:10px; }";
    s += ".mreport-property-panel label { font-size:11px; font-weight:700; text-transform:uppercase; color:var(--mr-muted); letter-spacing:0.4px; margin-bottom:2px; display:block; }";

    s += "</style>";
    $("head").append(s);
}

// Compat: chamadas antigas a applyInlineStyles continuam a funcionar
function applyInlineStyles($c) { injectModernStyles($c); }

// ====================================================================
// 1. ENTRY POINT
// ====================================================================
function renderDesigner(container) {
    var $c = $(container);
    // Garantir classe wrapper (defensivo, caso container tenha sido criado externamente)
    if (!$c.hasClass("mreport-editor-wrapper")) $c.addClass("mreport-editor-wrapper");
    $c.empty().append(DEFAULT_TEMPLATE_HCF);

    // Re-injectar estilos (PHC pode ter limpado <head> num postback)
    if (window.MReportExtension && window.MReportExtension.addStyles) {
        window.MReportExtension.addStyles();
    }
    // Estilos inline (\u00e0 prova de PHC sanitizer / specificity wars)
    applyInlineStyles($c);

    renderComponentLibrary($c.find('[data-mreport-slot="components"]'));
    renderFilterList($c.find('[data-mreport-slot="filters"]'));
    renderFonteList($c.find('[data-mreport-slot="fontes"]'));
    renderCanvas($c.find('[data-mreport-slot="canvas"]'));

    initDragDrop();
    bindToolbar($c);
    bindSectionActions($c);
    refreshPropertyPanel();
}

// ====================================================================
// 1.b TOOLBAR + ACÇÕES DE SECÇÃO
// ====================================================================
function bindToolbar($c) {
    $c.find(".mreport-top-toolbar [data-action]").off("click.mreport").on("click.mreport", function () {
        var action = $(this).attr("data-action");
        switch (action) {
            case "save":
                if (window.MReportLib && window.MReportLib.commit) {
                    window.MReportLib.commit().then(function () {
                        try { alertify.success("Relatório gravado"); } catch (e) { }
                    }).catch(function (err) {
                        try { alertify.error("Erro ao gravar: " + err.message); } catch (e) { }
                    });
                }
                break;
            case "preview":
                window.open("../programs/mreportview.aspx?relatoriostamp=" + encodeURIComponent(window.appState.reportStamp), "_blank");
                break;
            case "copy":   window.MReportLib.copy(); break;
            case "paste":  window.MReportLib.paste(); break;
            case "delete": window.MReportLib.deleteSelected(); break;
            case "add-section":
                var Ctor = window.MReportLib.constructors.MReportSection;
                var s = new Ctor({
                    mreportstamp: window.appState.reportStamp,
                    codigo: "section" + (window.appState.sections.length + 1),
                    descricao: "Nova Secção",
                    tipo: "content",
                    ordem: window.appState.sections.length + 1
                });
                window.appState.sections.push(s);
                window.MReportLib.syncReal([s], "MReportSection", "mreportsectionstamp");
                rerenderAll();
                break;
        }
    });

    $c.find(".mreport-pagesize, .mreport-orientation").off("change.mreport").on("change.mreport", function () {
        var cfg = window.appState.config;
        if (!cfg) return;
        if ($(this).hasClass("mreport-pagesize")) cfg.pagesize = $(this).val();
        else cfg.orientacao = $(this).val();
        applyPageSize($c);
        if (window.MReportLib && window.MReportLib.syncReal) {
            window.MReportLib.syncReal([cfg], "u_mreport", "u_mreportstamp");
        }
    });

    // Definir valores actuais nos selects
    if (window.appState.config) {
        $c.find(".mreport-pagesize").val(window.appState.config.pagesize || "A4");
        $c.find(".mreport-orientation").val(window.appState.config.orientacao || "portrait");
    }
    applyPageSize($c);
}

function applyPageSize($c) {
    var cfg = window.appState.config || {};
    var sizes = {
        A4: { w: 794, h: 1123 },
        A3: { w: 1123, h: 1587 },
        Letter: { w: 816, h: 1056 },
        Legal: { w: 816, h: 1344 }
    };
    var s = sizes[cfg.pagesize] || sizes.A4;
    var w = s.w, h = s.h;
    if (cfg.orientacao === "landscape") { var t = w; w = h; h = t; }
    $c.find(".mreport-page").css({ width: w + "px", "min-height": h + "px" });
}

function bindSectionActions($c) {
    $c.off("click.mreportsec").on("click.mreportsec", "[data-section-action]", function (e) {
        e.stopPropagation();
        var action = $(this).attr("data-section-action");
        var $sec = $(this).closest(".report-section");
        var stamp = $sec.attr("data-mreportsectionstamp");
        var section = window.MReportLib.getSection(stamp);
        if (!section) return;
        if (action === "delete") {
            section.inactivo = true;
            window.appState.deleteBuffer.push({
                table: "MReportSection", stamp: stamp, tableKey: "mreportsectionstamp"
            });
            rerenderAll();
        } else if (action === "config") {
            // @TODO modal de configuração da secção
            try { alertify.message("Configuração de secção (em desenvolvimento)"); } catch (er) { }
        }
    });

    // Resize vertical da secção (drag no handle inferior)
    $c.off("mousedown.mreportsecresize")
        .on("mousedown.mreportsecresize", ".section-resize-handle", function (e) {
            e.preventDefault();
            var stamp = $(this).attr("data-section-resize");
            var section = window.MReportLib.getSection(stamp);
            if (!section) return;
            var $sec = $(this).closest(".report-section");
            var $content = $sec.find(".section-content");
            var startY = e.clientY;
            var startH = $content.outerHeight();
            $("body").css("cursor", "ns-resize");
            $(document).on("mousemove.mreportsecresize", function (mv) {
                var nh = Math.max(60, startH + (mv.clientY - startY));
                $content.css("height", nh + "px");
                section.height = nh;
            }).on("mouseup.mreportsecresize", function () {
                $("body").css("cursor", "");
                $(document).off("mousemove.mreportsecresize mouseup.mreportsecresize");
                window.MReportLib.syncReal([section], "MReportSection", "mreportsectionstamp");
            });
        });
}

// ====================================================================
// 2. CANVAS / SECTIONS
// ====================================================================
function renderCanvas($canvas) {
    $canvas.empty();
    var state = window.appState;
    var sections = (state.sections || []).slice().sort(byOrdem);

    // Garantir 3 secções base se vazias
    if (!sections.length) {
        sections = ["header", "content", "footer"].map(function (k, i) {
            return { mreportsectionstamp: "_" + k, codigo: k, descricao: k, tipo: k, ordem: i };
        });
    }

    sections.forEach(function (s) {
        var $sec = renderSection(s);
        $canvas.append($sec);
    });
}

function renderSection(section) {
    var $sec = $('<div class="report-section"></div>')
        .attr("data-section", section.codigo)
        .attr("data-mreportsectionstamp", section.mreportsectionstamp)
        .attr("data-layoutmode", section.layoutmode || "absolute");

    var sectionIcons = { header: "fa-heading", content: "fa-file-alt", footer: "fa-shoe-prints",
                         "page-header": "fa-heading", "page-footer": "fa-shoe-prints",
                         "group-header": "fa-layer-group", "group-footer": "fa-layer-group",
                         "details": "fa-list", "report-header": "fa-flag", "report-footer": "fa-flag-checkered" };
    var icon = sectionIcons[section.codigo] || sectionIcons[section.tipo] || "fa-square";
    $sec.append(
        '<div class="section-label">'
        + '<span><i class="fa ' + icon + '"></i> ' + escapeHtml(section.descricao || section.codigo) + '</span>'
        + '<span class="section-label-actions">'
        + '  <button type="button" data-section-action="config" title="Configurar"><i class="fa fa-cog"></i></button>'
        + '  <button type="button" data-section-action="delete" title="Eliminar"><i class="fa fa-times"></i></button>'
        + '</span>'
        + '</div>'
    );

    var $content = $('<div class="section-content"></div>');
    // Altura: usar definida ou default por tipo (estilo Crystal Reports)
    var defaultHeights = { header: 100, "page-header": 100, "report-header": 80,
                           content: 400, "details": 400,
                           footer: 80, "page-footer": 80, "report-footer": 80 };
    var h = section.height || defaultHeights[section.codigo] || defaultHeights[section.tipo] || 200;
    $content.css("height", h + "px");
    // Empty hint só aparece se a secção ficar sem objectos (decidido abaixo após renderizar objs)
    $sec.append($content);
    // Handle de redimensionamento vertical da secção
    $sec.append('<div class="section-resize-handle" data-section-resize="' + section.mreportsectionstamp + '"></div>');

    // Render layout template (slots) se existir
    var layout = section.mreportlayoutstamp
        ? findByStamp(window.appState.layouts, "mreportlayoutstamp", section.mreportlayoutstamp)
        : null;

    if (layout && layout.htmltemplate) {
        $content.html(layout.htmltemplate);
        // CSS scoped do layout
        if (layout.csstemplate) {
            $sec.append('<style>' + layout.csstemplate + '</style>');
        }
    }

    // Renderizar objectos desta secção
    var objs = (window.appState.objects || []).filter(function (o) {
        return !o.inactivo
            && (o.mreportsectionstamp === section.mreportsectionstamp
                || (o.section === section.codigo && !o.mreportsectionstamp));
    });
    objs.sort(byOrdem);

    objs.forEach(function (obj) {
        var $obj = renderObject(obj);
        // Se houver slot, colocar lá; caso contrário, append directo
        if (obj.slotid) {
            var $slot = $content.find('[data-mreport-slot="' + cssEscape(obj.slotid) + '"]');
            if ($slot.length) { $slot.append($obj); return; }
        }
        $content.append($obj);
    });

    if (!objs.length) {
        $content.append('<div class="section-empty-hint"><i class="fa fa-arrow-down"></i>arraste componentes aqui</div>');
    }

    return $sec;
}

// ====================================================================
// 3. OBJECT RENDER (estilo Crystal Reports / DevExpress)
//    Posicionamento sempre absoluto + transform translate3d
// ====================================================================
function renderObject(obj) {
    var $el = $('<div class="report-object"></div>')
        .attr("data-mreportobjectstamp", obj.mreportobjectstamp)
        .attr("data-tipo", obj.tipo)
        .attr("data-fontestamp", obj.fontestamp || "");

    // Estado de selecção visual
    var sel = (window.appState.multiSelection.stamps || []);
    if (sel.indexOf(obj.mreportobjectstamp) !== -1) $el.addClass("selected");

    var x = obj.x || 0;
    var y = obj.y || 0;
    var w = obj.width || 200;
    var h = obj.height || 80;
    $el.css({
        position: "absolute",
        left: 0,
        top: 0,
        width: w + "px",
        height: h + "px",
        transform: "translate3d(" + x + "px," + y + "px,0)",
        "touch-action": "none"
    });
    $el.attr("data-x", x).attr("data-y", y);

    var ext = window.MReportExtension;
    var html = ext && ext.renderObjectContent
        ? ext.renderObjectContent(obj)
        : '<div class="report-object-placeholder">' + escapeHtml(obj.descricao || obj.tipo) + '</div>';
    $el.html(html);

    // Handle visual de resize (canto inferior direito)
    $el.append('<div class="resize-handle" style="position:absolute;right:0;bottom:0;width:12px;height:12px;cursor:nwse-resize;background:linear-gradient(135deg,transparent 50%,#3b82f6 50%);border-bottom-right-radius:4px;pointer-events:none"></div>');

    return $el;
}

function rerenderObject(obj) {
    var $old = $('[data-mreportobjectstamp="' + obj.mreportobjectstamp + '"]');
    if (!$old.length) { rerenderAll(); return; }
    var $new = renderObject(obj);
    $old.replaceWith($new);
}

function rerenderAll() {
    var $canvas = $('[data-mreport-slot="canvas"]');
    if ($canvas.length) renderCanvas($canvas);
    // Estilos vivem em <style> id mreport-modern-styles + tokens já no wrapper:
    // não é preciso reaplicar inline a cada rerender (evita "saltos" visuais).
    initDragDrop();
}

// ====================================================================
// 4. SIDEBARS
// ====================================================================
function renderComponentLibrary($el) {
    var ext = window.MReportExtension;
    var tipos = ext && ext.getComponentLibrary ? ext.getComponentLibrary() : defaultComponentLibrary();
    var html = tipos.map(function (t) {
        return '<div class="mreport-widget-tile mreport-component-item" draggable="true" data-tipo="' + t.tipo + '" title="' + escapeHtml(t.label || t.tipo) + '">'
            + '<i class="' + (t.icon || "fa fa-cube") + '"></i>'
            + '<span>' + escapeHtml(t.label || t.tipo) + '</span>'
            + '</div>';
    }).join("");
    $el.html(html);
}

function renderFilterList($el) {
    var items = (window.appState.filters || []);
    var html = items.map(function (f) {
        return '<div class="mreport-sidebar-item mreport-filter-item" data-stamp="' + f.mreportfilterstamp + '">'
            + '<div class="mreport-sidebar-item-content"><i class="fa fa-filter"></i><span>' + escapeHtml(f.descricao || f.codigo) + '</span></div>'
            + '<div class="mreport-sidebar-item-actions"><button type="button" class="btn btn-default btn-xs" data-filter-action="edit" title="Editar"><i class="fa fa-pen"></i></button></div>'
            + '</div>';
    }).join("");
    $el.html(html || '<div class="mreport-empty-list">Sem filtros</div>');
}

function renderFonteList($el) {
    var items = (window.appState.fontes || []);
    var html = items.map(function (f) {
        var badge = f.usacache ? ' <span class="badge">cache</span>' : '';
        return '<div class="mreport-sidebar-item mreport-fonte-item" data-stamp="' + f.mreportfonstestamp + '">'
            + '<div class="mreport-sidebar-item-content"><i class="fa fa-database"></i><span>' + escapeHtml(f.descricao || f.codigo) + '</span>' + badge + '</div>'
            + '<div class="mreport-sidebar-item-actions"><button type="button" class="btn btn-default btn-xs" data-fonte-action="edit" title="Editar"><i class="fa fa-pen"></i></button></div>'
            + '</div>';
    }).join("");
    $el.html(html || '<div class="mreport-empty-list">Sem fontes</div>');
}

function defaultComponentLibrary() {
    return [
        { tipo: "texto",   label: "Texto",    icon: "fa fa-font" },
        { tipo: "tabela",  label: "Tabela",   icon: "fa fa-table" },
        { tipo: "chart",   label: "Gráfico",  icon: "fa fa-chart-bar" },
        { tipo: "imagem",  label: "Imagem",   icon: "fa fa-image" },
        { tipo: "kpi",     label: "KPI",      icon: "fa fa-tachometer-alt" }
    ];
}

// ====================================================================
// 5. PROPERTY PANEL
// ====================================================================
function refreshPropertyPanel() {
    var $panel = $('[data-mreport-slot="properties"]');
    if (!$panel.length) return;

    var stamps = window.appState.multiSelection.stamps;
    if (!stamps.length) {
        $panel.html('<div class="empty-state">Nenhum objecto seleccionado</div>');
        return;
    }
    if (stamps.length > 1) {
        $panel.html('<div>Múltipla selecção (' + stamps.length + ')</div>'
            + '<button class="btn btn-sm btn-danger" id="mreport-prop-delete">Eliminar</button>');
        $panel.find("#mreport-prop-delete").on("click", function () { window.MReportLib.deleteSelected(); });
        return;
    }

    var obj = window.MReportLib.getObject(stamps[0]);
    if (!obj) return;

    var html = ''
        + '<div class="form-group">'
        + '  <label>Descrição</label>'
        + '  <input class="form-control input-sm" data-prop="descricao" value="' + escapeAttr(obj.descricao) + '">'
        + '</div>'
        + '<div class="form-group">'
        + '  <label>Tipo</label>'
        + '  <input class="form-control input-sm" disabled value="' + escapeAttr(obj.tipo) + '">'
        + '</div>'
        + '<div class="form-group">'
        + '  <label>Fonte</label>'
        + '  <select class="form-control input-sm" data-prop="fontestamp">'
        + '    <option value="">— sem fonte —</option>'
        +      window.appState.fontes.map(function (f) {
                   return '<option value="' + f.mreportfonstestamp + '"'
                       + (f.mreportfonstestamp === obj.fontestamp ? ' selected' : '')
                       + '>' + escapeHtml(f.descricao || f.codigo) + '</option>';
               }).join("")
        + '  </select>'
        + '</div>'
        + '<div class="form-group">'
        + '  <label>Configuração (JSON)</label>'
        + '  <div class="mreport-json-editor" data-prop="configjson"></div>'
        + '</div>'
        + '<button class="btn btn-sm btn-danger" id="mreport-prop-delete">Eliminar</button>';

    $panel.html(html);

    // Bind simples
    $panel.find('[data-prop]').not('.mreport-json-editor').on("change", function () {
        var k = $(this).attr("data-prop");
        var patch = {};
        patch[k] = $(this).val();
        window.MReportLib.updateObject(obj.mreportobjectstamp, patch);
    });
    $panel.find("#mreport-prop-delete").on("click", function () { window.MReportLib.deleteSelected(); });

    // JSONEditor (se disponível)
    if (window.JSONEditor) {
        var $je = $panel.find('.mreport-json-editor')[0];
        try {
            var editor = new window.JSONEditor($je, { mode: "code" });
            editor.set(safeParse(obj.configjson, {}));
            editor.onChange = function () {
                try {
                    window.MReportLib.updateObject(obj.mreportobjectstamp, {
                        configjson: JSON.stringify(editor.get())
                    });
                } catch (e) { /* JSON inválido em digitação */ }
            };
        } catch (e) { console.warn("[MReport] JSONEditor falhou", e); }
    }
}

// ====================================================================
// 6. DRAG-DROP estilo Crystal Reports / DevExpress
//   - Toolbox → canvas: HTML5 drag (dataTransfer)
//   - Canvas:  interact.js draggable + resizable com translate3d
//   - Snap to grid 10px, restrictRect parent, multi-secções
// ====================================================================
function initDragDrop() {
    if (window.appState.mode === "consultar") return;

    // ---------- Toolbox → canvas (HTML5 drag) ------------------------
    $(".mreport-component-item").attr("draggable", "true")
        .off("dragstart.mreport").on("dragstart.mreport", function (e) {
            var tipo = $(this).attr("data-tipo");
            e.originalEvent.dataTransfer.effectAllowed = "copy";
            e.originalEvent.dataTransfer.setData("text/plain", "mreport-component:" + tipo);
        });

    $(".section-content")
        .off("dragover.mreport drop.mreport dragleave.mreport")
        .on("dragover.mreport", function (e) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "copy";
            $(this).css("background", "rgba(59,130,246,0.06)");
        })
        .on("dragleave.mreport", function () {
            $(this).css("background", "");
        })
        .on("drop.mreport", function (e) {
            e.preventDefault();
            $(this).css("background", "");
            var raw = e.originalEvent.dataTransfer.getData("text/plain") || "";
            if (raw.indexOf("mreport-component:") !== 0) return;
            var tipo = raw.substring("mreport-component:".length);

            var $sec = $(this).closest(".report-section");
            var rect = this.getBoundingClientRect();
            var defW = 200, defH = 80;
            var x = e.originalEvent.clientX - rect.left - defW / 2;
            var y = e.originalEvent.clientY - rect.top - defH / 2;
            x = Math.max(0, Math.round(x / 10) * 10);
            y = Math.max(0, Math.round(y / 10) * 10);

            window.MReportLib.addObject({
                tipo: tipo,
                descricao: tipo,
                section: $sec.attr("data-section"),
                mreportsectionstamp: $sec.attr("data-mreportsectionstamp"),
                x: x, y: y, width: defW, height: defH
            });
        });

    // ---------- Canvas: interact.js draggable + resizable -----------
    if (!window.interact) {
        console.warn("[MReport] interact.js não carregado; reposicionamento desactivado");
    } else {
        window.interact(".report-object").unset();
        window.interact(".report-object")
            .draggable({
                inertia: false,
                ignoreFrom: ".resize-handle,input,textarea,select,button,a",
                modifiers: [
                    window.interact.modifiers.restrictRect({ restriction: "parent", endOnly: true }),
                    window.interact.modifiers.snap({
                        targets: [window.interact.snappers.grid({ x: 10, y: 10 })],
                        range: Infinity,
                        relativePoints: [{ x: 0, y: 0 }]
                    })
                ],
                autoScroll: true,
                listeners: {
                    start: function (ev) {
                        var stamp = ev.target.getAttribute("data-mreportobjectstamp");
                        window.MReportLib.selectObject(stamp, ev);
                    },
                    move: function (ev) {
                        var t = ev.target;
                        var stamp = t.getAttribute("data-mreportobjectstamp");
                        var obj = window.MReportLib.getObject(stamp);
                        if (!obj) return;
                        obj.x = (obj.x || 0) + ev.dx;
                        obj.y = (obj.y || 0) + ev.dy;
                        if (obj.x < 0) obj.x = 0;
                        if (obj.y < 0) obj.y = 0;
                        t.style.transform = "translate3d(" + obj.x + "px," + obj.y + "px,0)";
                        t.setAttribute("data-x", obj.x);
                        t.setAttribute("data-y", obj.y);

                        var $sec = $(t).closest(".report-section");
                        if ($sec.length) {
                            var newSection = $sec.attr("data-section");
                            if (newSection && newSection !== obj.section) {
                                obj.section = newSection;
                                obj.mreportsectionstamp = $sec.attr("data-mreportsectionstamp") || obj.mreportsectionstamp;
                            }
                        }
                    },
                    end: function (ev) {
                        var stamp = ev.target.getAttribute("data-mreportobjectstamp");
                        var obj = window.MReportLib.getObject(stamp);
                        if (!obj) return;
                        window.MReportLib.updateObject(stamp, {
                            x: obj.x, y: obj.y,
                            section: obj.section,
                            mreportsectionstamp: obj.mreportsectionstamp
                        }, { skipRerender: true });
                    }
                }
            })
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                inertia: false,
                modifiers: [
                    window.interact.modifiers.restrictEdges({ outer: "parent" }),
                    window.interact.modifiers.restrictSize({ min: { width: 50, height: 30 } })
                ],
                listeners: {
                    move: function (ev) {
                        var t = ev.target;
                        var stamp = t.getAttribute("data-mreportobjectstamp");
                        var obj = window.MReportLib.getObject(stamp);
                        if (!obj) return;
                        obj.width = ev.rect.width;
                        obj.height = ev.rect.height;
                        obj.x = (obj.x || 0) + (ev.deltaRect.left || 0);
                        obj.y = (obj.y || 0) + (ev.deltaRect.top || 0);
                        t.style.width = obj.width + "px";
                        t.style.height = obj.height + "px";
                        t.style.transform = "translate3d(" + obj.x + "px," + obj.y + "px,0)";
                    },
                    end: function (ev) {
                        var stamp = ev.target.getAttribute("data-mreportobjectstamp");
                        var obj = window.MReportLib.getObject(stamp);
                        if (!obj) return;
                        window.MReportLib.updateObject(stamp, {
                            x: obj.x, y: obj.y,
                            width: obj.width, height: obj.height
                        }, { skipRerender: true });
                    }
                }
            });
    }

    // Click → seleccionar objecto
    $(".report-object").off("click.mreport").on("click.mreport", function (e) {
        e.stopPropagation();
        window.MReportLib.selectObject($(this).attr("data-mreportobjectstamp"), e);
    });
    $(".section-content").off("click.mreport").on("click.mreport", function (e) {
        if (e.target === this) window.MReportLib.deselectAll();
    });
}

// ====================================================================
// UTIL
// ====================================================================
function byOrdem(a, b) { return (a.ordem || 0) - (b.ordem || 0); }
function findByStamp(arr, key, stamp) {
    for (var i = 0; i < (arr || []).length; i++) if (arr[i][key] === stamp) return arr[i];
    return null;
}
function escapeHtml(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeAttr(s) { return escapeHtml(s); }
function cssEscape(s) {
    return String(s).replace(/[^a-zA-Z0-9_-]/g, function (c) { return "\\" + c; });
}
function safeParse(s, fallback) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
}

// ====================================================================
// EXPORT
// ====================================================================
window.MReportRenderer = {
    renderDesigner: renderDesigner,
    renderSection: renderSection,
    renderObject: renderObject,
    rerenderObject: rerenderObject,
    rerenderAll: rerenderAll,
    refreshPropertyPanel: refreshPropertyPanel,
    initDragDrop: initDragDrop,
    bindToolbar: bindToolbar,
    bindSectionActions: bindSectionActions,
    applyPageSize: applyPageSize
};


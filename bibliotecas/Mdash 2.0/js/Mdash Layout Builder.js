/**
 * ============================================================================
 * MDash Layout Builder - WYSIWYG Editor para Layouts Reutilizáveis
 * ============================================================================
 * 
 * Sistema de criação e gestão de layouts personalizados para cards de dashboard.
 * Suporta o sistema HBF (Header/Body/Footer) e extensível para futuros sistemas.
 * 
 * Funcionalidades:
 * - Galeria de layouts com pré-visualização
 * - Editor WYSIWYG com preview em tempo real
 * - 3 editores ACE (HTML, CSS, JS)
 * - Gestão de Slots editáveis (data-mdash-slot)
 * - Gestão de CDNs (JS e CSS)
 * - CRUD com realTimeComponentSync
 * 
 * Dependências:
 * - MDash config lib REFACTOR.js (constructors, realTimeComponentSync, handleCodeEditor)
 * - ACE Editor
 * - jQuery
 * - Bootstrap 3.x
 * - Alertify.js
 */

// ============================================================================
// LAYOUT BUILDER - ESTADO E CONFIGURAÇÃO
// ============================================================================

var GLayoutBuilderState = {
    isOpen: false,
    selectedLayoutStamp: null,
    aceEditors: {
        html: null,
        css: null,
        js: null,
        slots: null
    },
    previewDebounceTimer: null,
    slotModeActive: false,
    slotModeSelectedElement: null,
    syncingFromSlotMode: false
};

// ============================================================================
// LAYOUT BUILDER - ESTILOS
// ============================================================================

function addLayoutBuilderStyles() {
    if ($('#mdash-layout-builder-styles').length) return;

    // Obtém a cor primária dinâmica via getColorByType (tal como loadModernDashboardStyles)
    var primaryColor = getColorByType("primary").background;
    var primaryRgb = hexToRgb(primaryColor);

    var css = '';

    // ===== TOKENS (definidos no overlay porque está fora do .mdash-editor-wrapper) =====
    css += '.mdash-layout-builder-overlay { --md-primary: ' + primaryColor + '; --md-primary-rgb: ' + primaryRgb + '; --md-surface: #ffffff; --md-bg: #f3f6fb; --md-text: #1f2937; --md-muted: #64748b; --md-border: rgba(15,23,42,0.08); }';

    // ===== OVERLAY =====
    css += '.mdash-layout-builder-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2,6,23,0.55); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; }';

    // ===== MAIN CONTAINER =====
    css += '.mdash-layout-builder { width: 96vw; height: 92vh; background: var(--md-bg, #f3f6fb); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 24px 64px rgba(2,6,23,0.28); border: 1px solid var(--md-border, rgba(15,23,42,0.08)); }';

    // ===== TOOLBAR (idêntico ao mdash-top-toolbar) =====
    css += '.mdash-lb-toolbar { height: 54px; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.96), #101828 88%); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.18); flex-shrink: 0; box-shadow: 0 8px 24px rgba(2,6,23,0.18); }';
    css += '.mdash-lb-toolbar-brand { color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.2px; }';
    css += '.mdash-lb-toolbar-brand i { color: #fff; opacity: 0.95; font-size: 18px; }';
    css += '.mdash-lb-toolbar-actions { display: flex; align-items: center; gap: 8px; }';
    css += '.mdash-lb-toolbar-actions .btn { border-radius: 8px; font-weight: 600; font-size: 12px; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.22); transition: all 0.2s; }';
    css += '.mdash-lb-toolbar-actions .btn i { margin-right: 4px; }';
    css += '.mdash-lb-toolbar-actions .btn-save { background: rgba(46,204,113,0.9); color: #fff; border-color: rgba(255,255,255,0.3); }';
    css += '.mdash-lb-toolbar-actions .btn-save:hover { background: rgba(39,174,96,1); box-shadow: 0 4px 12px rgba(46,204,113,0.3); transform: translateY(-1px); }';
    css += '.mdash-lb-toolbar-actions .btn-runjs { background: rgba(52,152,219,0.9); color: #fff; border-color: rgba(255,255,255,0.3); }';
    css += '.mdash-lb-toolbar-actions .btn-runjs:hover { background: rgba(41,128,185,1); box-shadow: 0 4px 12px rgba(52,152,219,0.3); transform: translateY(-1px); }';
    css += '.mdash-lb-toolbar-actions .btn-close-lb { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.25); }';
    css += '.mdash-lb-toolbar-actions .btn-close-lb:hover { background: rgba(255,255,255,0.22); }';

    // ===== BODY =====
    css += '.mdash-lb-body { display: flex; flex: 1; overflow: hidden; gap: 8px; padding: 8px; }';

    // ===== SIDEBAR (idêntico ao mdash-sidebar) =====
    css += '.mdash-lb-sidebar { width: 272px; min-width: 272px; background: linear-gradient(180deg, rgba(var(--md-primary-rgb),0.96), rgba(var(--md-primary-rgb),0.84)); border: 1px solid rgba(255,255,255,0.16); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 32px rgba(2,6,23,0.18); backdrop-filter: blur(8px); }';
    css += '.mdash-lb-sidebar-header { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.18); background: transparent; color: #fff; display: flex; align-items: center; justify-content: space-between; }';
    css += '.mdash-lb-sidebar-header span { font-size: 14px; font-weight: 800; letter-spacing: 0.2px; }';
    css += '.mdash-lb-sidebar-header .btn { border-radius: 8px; border-color: rgba(255,255,255,0.42); color: #fff; background: rgba(255,255,255,0.16); transition: all 0.2s; }';
    css += '.mdash-lb-sidebar-header .btn:hover { background: rgba(255,255,255,0.28); border-color: rgba(255,255,255,0.6); }';
    css += '.mdash-lb-sidebar-header .btn i { font-size: 10px; }';

    // Sidebar list (galeria de layouts)
    css += '.mdash-lb-sidebar-list { flex: 1; overflow-y: auto; padding: 10px; background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.96)); }';

    // ===== LAYOUT CARDS (idêntico ao mdash-sidebar-item) =====
    css += '.mdash-lb-card { display: flex; flex-direction: column; padding: 10px 12px; margin-bottom: 6px; background: #fff; border: 1px solid var(--md-border, rgba(15,23,42,0.08)); border-radius: 10px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(2,6,23,0.04); }';
    css += '.mdash-lb-card:hover { border-color: rgba(var(--md-primary-rgb),0.45); transform: translateX(2px); box-shadow: 0 6px 16px rgba(var(--md-primary-rgb),0.12); }';
    css += '.mdash-lb-card.active { border-color: var(--md-primary); background: rgba(var(--md-primary-rgb),0.04); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.18); }';
    css += '.mdash-lb-card-title { font-weight: 700; font-size: 13px; color: var(--md-text, #1f2937); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }';
    css += '.mdash-lb-card-title img { border-radius: 4px; border: 1px solid var(--md-border); }';
    css += '.mdash-lb-card-delete:hover { opacity: 1 !important; color: #dc3545; }';
    css += '.mdash-lb-card-meta { font-size: 11px; color: var(--md-muted, #64748b); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }';
    css += '.mdash-lb-card-meta .badge { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: var(--md-primary); color: #fff; letter-spacing: 0.3px; }';
    css += '.mdash-lb-card-meta .badge-inactive { background: #dc3545; }';
    css += '.mdash-lb-card.inactive { opacity: 0.5; }';

    // ===== EDITOR AREA =====
    css += '.mdash-lb-editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; border: 1px solid var(--md-border); background: var(--md-surface, #ffffff); box-shadow: 0 12px 28px rgba(2,6,23,0.08); }';

    // ===== TABS (segue estilo accordion/panel) =====
    css += '.mdash-lb-tabs { display: flex; background: linear-gradient(180deg, #ffffff, #f8fafc); border-bottom: 1px solid var(--md-border); padding: 0; }';
    css += '.mdash-lb-tab { padding: 10px 18px; font-size: 12px; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; color: var(--md-muted); transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; user-select: none; }';
    css += '.mdash-lb-tab:hover { color: var(--md-text); background: rgba(var(--md-primary-rgb),0.04); }';
    css += '.mdash-lb-tab.active { color: var(--md-primary); border-bottom-color: var(--md-primary); background: #fff; }';
    css += '.mdash-lb-tab i { font-size: 13px; }';

    // ===== SPLIT (editor + preview) =====
    css += '.mdash-lb-split { display: flex; flex: 1; overflow: hidden; }';

    // ===== CODE PANEL =====
    css += '.mdash-lb-code-panel { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--md-border); }';
    css += '.mdash-lb-code-panel-header { padding: 8px 14px; background: linear-gradient(180deg, #f8fafc, #f1f5f9); font-size: 10px; font-weight: 800; color: var(--md-primary); text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1px solid var(--md-border); display: flex; align-items: center; gap: 6px; }';
    css += '.mdash-lb-code-panel-header i { font-size: 11px; opacity: 0.8; }';
    css += '.mdash-lb-ace-editor { flex: 1; width: 100%; min-height: 200px; }';

    // ===== PREVIEW PANEL =====
    css += '.mdash-lb-preview-panel { flex: 1; display: flex; flex-direction: column; }';
    css += '.mdash-lb-preview-panel-header { padding: 8px 14px; background: linear-gradient(180deg, #f8fafc, #f1f5f9); font-size: 10px; font-weight: 800; color: var(--md-primary); text-transform: uppercase; letter-spacing: 1.2px; border-bottom: 1px solid var(--md-border); display: flex; align-items: center; justify-content: space-between; }';
    css += '.mdash-lb-preview-content { flex: 1; padding: 24px; overflow: auto; background-image: radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px); background-size: 18px 18px; background-color: var(--md-bg); display: flex; align-items: flex-start; justify-content: center; }';
    css += '.mdash-lb-preview-card-wrapper { width: 100%; max-width: 420px; min-height: 200px; background: var(--md-surface); border-radius: 12px; box-shadow: 0 8px 24px rgba(2,6,23,0.1); overflow: hidden; border: 1px solid var(--md-border); }';

    // ===== SLOTS HIGHLIGHTING =====
    css += '.mdash-lb-preview-content [data-mdash-slot] { outline: 2px dashed rgba(var(--md-primary-rgb),0.6); outline-offset: -2px; position: relative; min-height: 30px; transition: outline-color 0.15s, background 0.15s; }';
    css += '.mdash-lb-preview-content [data-mdash-slot]:hover { outline-color: #e74c3c; background: rgba(231,76,60,0.04); }';
    css += '.mdash-lb-preview-content [data-mdash-slot]::before { content: attr(data-mdash-slot); position: absolute; top: -1px; left: -1px; background: var(--md-primary); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 0 0 6px 0; z-index: 1; pointer-events: none; letter-spacing: 0.3px; text-transform: uppercase; }';

    // ===== PROPERTIES (segue estilo do mdash-properties) =====
    css += '.mdash-lb-properties { border-top: 1px solid rgba(255,255,255,0.18); padding: 14px; background: linear-gradient(180deg, #ffffff, #f8fafc); max-height: 45%; overflow-y: auto; }';
    css += '.mdash-lb-properties h5 { margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: var(--md-text); display: flex; align-items: center; gap: 6px; }';
    css += '.mdash-lb-properties h5 i { color: var(--md-primary); font-size: 13px; }';
    css += '.mdash-lb-properties .form-group { margin-bottom: 10px; }';
    css += '.mdash-lb-properties label { font-size: 11px; font-weight: 700; color: var(--md-muted); letter-spacing: 0.2px; margin-bottom: 3px; display: block; }';
    css += '.mdash-lb-properties input:not([type="checkbox"]), .mdash-lb-properties select { font-size: 12px; border-radius: 8px; border: 1px solid rgba(var(--md-primary-rgb),0.35); box-shadow: none; min-height: 32px; transition: border-color 0.2s, box-shadow 0.2s; }';
    css += '.mdash-lb-properties input:not([type="checkbox"]):focus, .mdash-lb-properties select:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); outline: none; }';
    css += '.mdash-lb-properties input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--md-primary); cursor: pointer; vertical-align: middle; margin: 0 4px 0 0; }';

    // ===== CDN MANAGER =====
    css += '.mdash-lb-cdn-list { list-style: none; padding: 0; margin: 4px 0; }';
    css += '.mdash-lb-cdn-list li { display: flex; align-items: center; padding: 6px 10px; background: rgba(var(--md-primary-rgb),0.04); border: 1px solid var(--md-border); border-radius: 8px; margin-bottom: 4px; font-size: 11px; color: var(--md-text); }';
    css += '.mdash-lb-cdn-list li .btn-xs { margin-left: auto; padding: 2px 6px; font-size: 10px; border-radius: 6px; }';
    css += '.mdash-lb-cdn-input { border-radius: 8px !important; border: 1px solid rgba(var(--md-primary-rgb),0.35) !important; font-size: 11px !important; }';
    css += '.mdash-lb-cdn-input:focus { border-color: var(--md-primary) !important; box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16) !important; }';

    // ===== EMPTY STATE =====
    css += '.mdash-lb-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--md-muted); text-align: center; padding: 40px; }';
    css += '.mdash-lb-empty-state i { font-size: 48px; margin-bottom: 16px; color: var(--md-primary); opacity: 0.35; }';
    css += '.mdash-lb-empty-state p { font-size: 14px; margin: 0; line-height: 1.6; }';

    // ===== TAB CONTENT =====
    css += '.mdash-lb-tab-content { display: none; flex: 1; overflow: hidden; }';
    css += '.mdash-lb-tab-content.active { display: flex; flex-direction: column; }';

    // ===== SLOT TABLE =====
    css += '.mdash-lb-slot-table { width: 100%; font-size: 12px; border-collapse: collapse; }';
    css += '.mdash-lb-slot-table th { background: linear-gradient(180deg, #f8fafc, #f1f5f9); padding: 8px 10px; font-weight: 700; color: var(--md-text); text-align: left; border-bottom: 1px solid var(--md-border); }';
    css += '.mdash-lb-slot-table td { padding: 8px 10px; border-bottom: 1px solid var(--md-border); color: var(--md-text); }';
    css += '.mdash-lb-slot-table code { background: rgba(var(--md-primary-rgb),0.08); color: var(--md-primary); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }';
    css += '.mdash-lb-slot-table .badge { font-size: 10px; }';

    // ===== SLOT MODE (atribuição visual de slots) =====
    css += '.mdash-lb-slot-mode-btn { border-radius: 6px; font-size: 10px; font-weight: 700; padding: 3px 10px; border: 1px solid rgba(var(--md-primary-rgb),0.3); color: var(--md-primary); background: rgba(var(--md-primary-rgb),0.06); transition: all 0.2s; letter-spacing: 0.3px; text-transform: uppercase; }';
    css += '.mdash-lb-slot-mode-btn:hover { background: rgba(var(--md-primary-rgb),0.12); }';
    css += '.mdash-lb-slot-mode-btn.active { background: var(--md-primary); color: #fff; border-color: var(--md-primary); box-shadow: 0 2px 8px rgba(var(--md-primary-rgb),0.3); }';
    css += '.mdash-lb-slot-mode-info { padding: 8px 14px; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.08), rgba(var(--md-primary-rgb),0.03)); border-bottom: 1px solid var(--md-border); font-size: 11px; color: var(--md-text); display: none; align-items: center; gap: 8px; }';
    css += '.mdash-lb-slot-mode-info.active { display: flex; }';
    css += '.mdash-lb-slot-mode-info i { color: var(--md-primary); }';
    css += '.mdash-lb-slot-breadcrumb { padding: 6px 14px; background: rgba(var(--md-primary-rgb),0.03); border-bottom: 1px solid var(--md-border); font-size: 11px; color: var(--md-muted); display: none; overflow-x: auto; white-space: nowrap; }';
    css += '.mdash-lb-slot-breadcrumb.active { display: flex; align-items: center; gap: 2px; }';
    css += '.mdash-lb-slot-breadcrumb span { cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }';
    css += '.mdash-lb-slot-breadcrumb span:hover { background: rgba(var(--md-primary-rgb),0.1); color: var(--md-primary); }';
    css += '.mdash-lb-slot-breadcrumb .sep { cursor: default; color: var(--md-muted); opacity: 0.5; }';
    css += '.mdash-lb-slot-breadcrumb .is-slot { color: #27ae60; font-weight: 700; }';
    css += '.mdash-lb-preview-content.slot-mode { cursor: crosshair; }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper * { cursor: crosshair; transition: outline 0.12s, background-color 0.12s; }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper .mdash-lb-slot-badge { cursor: pointer; pointer-events: auto; }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper *:hover { outline: 2px solid rgba(var(--md-primary-rgb),0.45); outline-offset: -1px; background-color: rgba(var(--md-primary-rgb),0.03); }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper .mdash-lb-slot-badge:hover { outline: none; background-color: inherit; opacity: 0.85; }';
    css += '.mdash-lb-preview-content.slot-mode [data-mdash-slot] { outline: 2px solid rgba(39,174,96,0.6); }';
    css += '.mdash-lb-preview-content.slot-mode [data-mdash-slot]:hover { outline-color: rgba(39,174,96,0.9); background-color: rgba(39,174,96,0.04); }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-slot-selected { outline: 3px solid var(--md-primary) !important; outline-offset: -1px; background-color: rgba(var(--md-primary-rgb),0.06) !important; box-shadow: inset 0 0 0 1px rgba(var(--md-primary-rgb),0.15); }';
    css += '.mdash-lb-slot-popover { background: var(--md-surface, #fff); border: 1px solid var(--md-border); border-radius: 12px; box-shadow: 0 16px 40px rgba(2,6,23,0.22); padding: 16px; min-width: 250px; max-width: 300px; }';
    css += '.mdash-lb-slot-popover h6 { margin: 0 0 10px; font-size: 11px; font-weight: 800; color: var(--md-primary); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; }';
    css += '.mdash-lb-slot-popover .mdash-lb-slot-el-info { font-size: 10px; color: var(--md-muted); margin-bottom: 10px; font-family: monospace; background: rgba(var(--md-primary-rgb),0.05); padding: 5px 10px; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid var(--md-border); }';
    css += '.mdash-lb-slot-popover .form-group { margin-bottom: 8px; }';
    css += '.mdash-lb-slot-popover label { font-size: 11px; font-weight: 700; color: var(--md-muted); display: block; margin-bottom: 3px; }';
    css += '.mdash-lb-slot-popover input { font-size: 12px; border-radius: 8px; border: 1px solid rgba(var(--md-primary-rgb),0.35); padding: 6px 10px; width: 100%; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; background: #fff; color: #1f2937; }';
    css += '.mdash-lb-slot-popover input:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); outline: none; }';
    css += '.mdash-lb-slot-popover-actions { display: flex; gap: 6px; margin-top: 12px; }';
    css += '.mdash-lb-slot-popover-actions .btn { font-size: 11px; border-radius: 8px; padding: 5px 14px; font-weight: 700; transition: all 0.2s; }';

    // ===== SLOT MODE BADGES (etiquetas de tipo nos elementos) =====
    css += '.mdash-lb-slot-badge { position: absolute; z-index: 5; pointer-events: auto; cursor: pointer; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; font-family: "SF Mono", "Fira Code", Consolas, monospace; line-height: 1; white-space: nowrap; padding: 3px 7px; border-radius: 0 0 6px 0; backdrop-filter: blur(6px); transition: opacity 0.15s; }';
    css += '.mdash-lb-slot-badge:hover { opacity: 0.85; }';
    css += '.mdash-lb-slot-badge.badge-tag { top: 0; left: 0; background: rgba(var(--md-primary-rgb),0.88); color: #fff; }';
    css += '.mdash-lb-slot-badge.badge-slot-name { top: 0; right: 0; left: auto; border-radius: 0 0 0 6px; background: rgba(39,174,96,0.88); color: #fff; }';
    css += '.mdash-lb-slot-badge .badge-icon { margin-right: 3px; font-size: 8px; font-family: "Glyphicons Halflings"; }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper [data-lb-badge-host] { position: relative; }';
    css += '.mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper [data-lb-badge-host]:empty, .mdash-lb-preview-content.slot-mode .mdash-lb-preview-card-wrapper [data-lb-badge-empty] { min-height: 48px; min-width: 80px; padding-top: 20px !important; border: 2px dashed rgba(var(--md-primary-rgb),0.4); background: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(var(--md-primary-rgb),0.04) 5px, rgba(var(--md-primary-rgb),0.04) 10px); display: block; box-sizing: border-box; }';

    // Alertify acima do overlay do Layout Builder
    css += '.alertify, .alertify-logs { z-index: 10060 !important; }';
    css += '.alertify-log { z-index: 10060 !important; }';

    $('head').append('<style id="mdash-layout-builder-styles">' + css + '</style>');
}

// ============================================================================
// LAYOUT BUILDER - GALERIA / LISTAGEM
// ============================================================================

function renderLayoutBuilderGallery() {
    var $list = $('.mdash-lb-sidebar-list');
    if (!$list.length) return;

    var layouts = GMDashContainerItemLayouts.slice().sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    if (layouts.length === 0) {
        $list.html(
            '<div class="mdash-lb-empty-state" style="height: auto; padding: 20px;">' +
            '  <i class="glyphicon glyphicon-th-large"></i>' +
            '  <p>Sem layouts criados.<br>Clique em <b>+ Novo</b> para começar.</p>' +
            '</div>'
        );
        return;
    }

    var html = '';
    layouts.forEach(function (layout) {
        var isActive = GLayoutBuilderState.selectedLayoutStamp === layout.mdashcontaineritemlayoutstamp;
        var inactiveClass = layout.inactivo ? ' inactive' : '';

        html += '<div class="mdash-lb-card' + (isActive ? ' active' : '') + inactiveClass + '" data-layout-stamp="' + layout.mdashcontaineritemlayoutstamp + '">';
        html += '  <div class="mdash-lb-card-title">';
        if (layout.iconcdn) {
            html += '<img src="' + encodeURI(layout.iconcdn) + '" style="width:16px;height:16px;margin-right:4px;vertical-align:middle;" onerror="this.style.display=\'none\'" /> ';
        }
        html += (layout.descricao || layout.codigo || 'Sem nome');
        html += '    <span class="mdash-lb-card-delete" data-delete-stamp="' + layout.mdashcontaineritemlayoutstamp + '" title="Eliminar" style="float:right;cursor:pointer;opacity:0.45;font-size:11px;margin:-1px -2px 0 4px;transition:opacity 0.15s;"><i class="glyphicon glyphicon-trash"></i></span>';
        html += '  </div>';
        html += '  <div class="mdash-lb-card-meta">';
        html += '    <span>' + (layout.layoutsystem || 'HBF') + '</span>';
        if (layout.categoria) {
            html += '    <span class="badge">' + layout.categoria + '</span>';
        }
        html += '    <span class="badge">v' + (layout.versao || 1) + '</span>';
        if (layout.inactivo) {
            html += '    <span class="badge" style="background:#e74c3c;color:#fff;">Inactivo</span>';
        }
        html += '  </div>';
        html += '</div>';
    });

    $list.html(html);

    // Bind click events
    $list.find('.mdash-lb-card').off('click').on('click', function (e) {
        if ($(e.target).closest('.mdash-lb-card-delete').length) return;
        var stamp = $(this).data('layout-stamp');
        selectLayoutForEditing(stamp);
    });

    // Bind delete button per card
    $list.find('.mdash-lb-card-delete').off('click').on('click', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('delete-stamp');
        deleteLayoutByStamp(stamp);
    });
}

// ============================================================================
// LAYOUT BUILDER - SELEÇÃO E EDIÇÃO DE LAYOUT
// ============================================================================

function selectLayoutForEditing(layoutStamp) {
    GLayoutBuilderState.selectedLayoutStamp = layoutStamp;

    // Update gallery active state
    $('.mdash-lb-card').removeClass('active');
    $('.mdash-lb-card[data-layout-stamp="' + layoutStamp + '"]').addClass('active');

    var layout = getLayoutByStamp(layoutStamp);
    if (!layout) return;

    // Load ACE editors with layout data
    loadLayoutIntoEditors(layout);

    // Load properties form
    renderLayoutProperties(layout);

    // Update preview
    updateLayoutPreview();
}

function getLayoutByStamp(stamp) {
    return GMDashContainerItemLayouts.find(function (l) {
        return l.mdashcontaineritemlayoutstamp === stamp;
    }) || null;
}

function getSelectedLayout() {
    if (!GLayoutBuilderState.selectedLayoutStamp) return null;
    return getLayoutByStamp(GLayoutBuilderState.selectedLayoutStamp);
}

// ============================================================================
// LAYOUT BUILDER - ACE EDITORS
// ============================================================================

function initLayoutBuilderAceEditors() {
    var editors = GLayoutBuilderState.aceEditors;

    // HTML Editor
    var htmlEl = document.getElementById('mdash-lb-ace-html');
    if (htmlEl && !editors.html) {
        editors.html = ace.edit(htmlEl);
        editors.html.setTheme("ace/theme/monokai");
        editors.html.session.setMode("ace/mode/html");
        editors.html.setOptions({ fontSize: "12px", wrap: true, showPrintMargin: false });
        editors.html.on('change', debounceLayoutPreview);
    }

    // CSS Editor
    var cssEl = document.getElementById('mdash-lb-ace-css');
    if (cssEl && !editors.css) {
        editors.css = ace.edit(cssEl);
        editors.css.setTheme("ace/theme/monokai");
        editors.css.session.setMode("ace/mode/css");
        editors.css.setOptions({ fontSize: "12px", wrap: true, showPrintMargin: false });
        editors.css.on('change', debounceLayoutPreview);
    }

    // JS Editor
    var jsEl = document.getElementById('mdash-lb-ace-js');
    if (jsEl && !editors.js) {
        editors.js = ace.edit(jsEl);
        editors.js.setTheme("ace/theme/monokai");
        editors.js.session.setMode("ace/mode/javascript");
        editors.js.setOptions({ fontSize: "12px", wrap: true, showPrintMargin: false });
        editors.js.on('change', debounceLayoutPreview);
    }

    // Slots JSON Editor
    var slotsEl = document.getElementById('mdash-lb-ace-slots');
    if (slotsEl && !editors.slots) {
        editors.slots = ace.edit(slotsEl);
        editors.slots.setTheme("ace/theme/monokai");
        editors.slots.session.setMode("ace/mode/json");
        editors.slots.setOptions({ fontSize: "12px", wrap: true, showPrintMargin: false });
    }
}

function destroyLayoutBuilderAceEditors() {
    var editors = GLayoutBuilderState.aceEditors;
    if (editors.html) { editors.html.destroy(); editors.html = null; }
    if (editors.css) { editors.css.destroy(); editors.css = null; }
    if (editors.js) { editors.js.destroy(); editors.js = null; }
    if (editors.slots) { editors.slots.destroy(); editors.slots = null; }
}

function loadLayoutIntoEditors(layout) {
    var editors = GLayoutBuilderState.aceEditors;

    if (editors.html) {
        editors.html.setValue(layout.htmltemplate || '', -1);
    }
    if (editors.css) {
        editors.css.setValue(layout.csstemplate || '', -1);
    }
    if (editors.js) {
        editors.js.setValue(layout.jstemplate || '', -1);
    }
    if (editors.slots) {
        var slotsJson = '[]';
        try {
            slotsJson = JSON.stringify(layout.slots || [], null, 2);
        } catch (e) { /* ignore */ }
        editors.slots.setValue(slotsJson, -1);
    }
}

function saveEditorsToLayout() {
    var layout = getSelectedLayout();
    if (!layout) return null;

    var editors = GLayoutBuilderState.aceEditors;

    if (editors.html) layout.htmltemplate = editors.html.getValue();
    if (editors.css) layout.csstemplate = editors.css.getValue();
    if (editors.js) layout.jstemplate = editors.js.getValue();
    if (editors.slots) {
        var slotsVal = editors.slots.getValue();
        layout.slotsdefinition = slotsVal;
        layout.slots = forceJSONParse(slotsVal, []);
    }

    // Stringify JSON fields before sync
    layout.stringifyJSONFields();

    return layout;
}

// ============================================================================
// LAYOUT BUILDER - PREVIEW EM TEMPO REAL
// ============================================================================

function debounceLayoutPreview() {
    if (GLayoutBuilderState.previewDebounceTimer) {
        clearTimeout(GLayoutBuilderState.previewDebounceTimer);
    }
    GLayoutBuilderState.previewDebounceTimer = setTimeout(function () {
        updateLayoutPreview();
    }, 400);
}

/**
 * Faz scope de CSS ao container de preview para não afectar o resto da página.
 * Utiliza scopeLayoutCSS() (engine central em REFACTOR.js) com scope fixo para o preview.
 * Fallback inline caso scopeLayoutCSS ainda não esteja carregado.
 */
function scopeCssToPreview(css) {
    // Usa a engine central de scoping — scope fixo para o preview do Layout Builder
    if (typeof scopeLayoutCSS === 'function') {
        return scopeLayoutCSS(css, 'lb-preview');
    }
    // Fallback mínimo (não deveria acontecer mas garante robustez)
    var scope = '.mdash-lb-preview-card-wrapper';
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    return css.replace(/([^{}]+)\{/g, function (match, selectors) {
        var scoped = selectors.split(',').map(function (sel) {
            sel = sel.trim();
            if (!sel) return sel;
            if (sel.charAt(0) === '@') return sel;
            if (/^(body|html)$/i.test(sel)) return scope;
            if (/^(body|html)\s+/i.test(sel)) return sel.replace(/^(body|html)\s+/i, scope + ' ');
            return scope + ' ' + sel;
        }).join(', ');
        return scoped + ' {';
    });
}

function updateLayoutPreview() {
    if (GLayoutBuilderState.syncingFromSlotMode) return;

    var $preview = $('.mdash-lb-preview-card-wrapper');
    if (!$preview.length) return;

    var editors = GLayoutBuilderState.aceEditors;
    var htmlVal = editors.html ? editors.html.getValue() : '';
    var cssVal = editors.css ? editors.css.getValue() : '';

    if (!htmlVal && !cssVal) {
        $preview.html(
            '<div class="mdash-lb-empty-state" style="height:200px;">' +
            '  <i class="glyphicon glyphicon-eye-open"></i>' +
            '  <p>Escreva HTML para ver a pré-visualização</p>' +
            '</div>'
        );
        return;
    }

    // Remove estilos anteriores do preview
    $('#mdash-lb-preview-injected-css').remove();

    // Carrega CDNs via loader central (deduplicated — reutiliza os já carregados)
    var layout = getSelectedLayout(); 
    if (layout) {
        ensureMdashCDNsLoaded(layout.cssCdnsList, layout.jsCdnsList);
    }

    // Inject scoped CSS via scopeLayoutCSS — isolado por data-mdash-scope="lb-preview"
    if (cssVal) {
        var scopedCss = scopeCssToPreview(cssVal);
        $('head').append('<style id="mdash-lb-preview-injected-css">' + scopedCss + '</style>');
    }

    // Wrapper com scope attribute para que o CSS scoped fique contido
    $preview.html('<div data-mdash-scope="lb-preview">' + htmlVal + '</div>');

    // JS is NOT auto-executed in preview for safety - only on explicit "Run JS" action
}

function executePreviewJS() {
    var editors = GLayoutBuilderState.aceEditors;
    var jsVal = editors.js ? editors.js.getValue() : '';
    if (!jsVal) return;

    try {
        // Execute within a limited scope
        (function () { eval(jsVal); })();
        alertify.success("JS executado com sucesso", 2000);
    } catch (e) {
        console.error("Erro ao executar JS do layout:", e);
        alertify.error("Erro no JS: " + e.message, 4000);
    }
}

// ============================================================================
// LAYOUT BUILDER - PROPRIEDADES DO LAYOUT
// ============================================================================

function renderLayoutProperties(layout) {
    var $props = $('.mdash-lb-properties');
    if (!$props.length) return;

    var html = '<h5><i class="glyphicon glyphicon-cog"></i> Propriedades</h5>';

    html += '<div class="form-group">';
    html += '  <label>Código</label>';
    html += '  <input type="text" class="form-control input-sm" data-lb-field="codigo" value="' + (layout.codigo || '') + '" />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>Descrição</label>';
    html += '  <input type="text" class="form-control input-sm" data-lb-field="descricao" value="' + (layout.descricao || '') + '" />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>Categoria</label>';
    html += '  <select class="form-control input-sm" data-lb-field="categoria">';
    html += '    <option value="">-- Selecione --</option>';
    ['snapshot', 'card', 'chart', 'table', 'custom'].forEach(function (cat) {
        var sel = layout.categoria === cat ? ' selected' : '';
        html += '    <option value="' + cat + '"' + sel + '>' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</option>';
    });
    html += '  </select>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>Sistema de Layout</label>';
    html += '  <select class="form-control input-sm" data-lb-field="layoutsystem">';
    var systems = [{ label: 'HBF (Header/Body/Footer)', value: 'HBF' }];
    systems.forEach(function (sys) {
        var sel = layout.layoutsystem === sys.value ? ' selected' : '';
        html += '    <option value="' + sys.value + '"' + sel + '>' + sys.label + '</option>';
    });
    html += '  </select>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>Versão</label>';
    html += '  <input type="number" class="form-control input-sm" data-lb-field="versao" value="' + (layout.versao || 1) + '" min="1" />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>Ordem</label>';
    html += '  <input type="number" class="form-control input-sm" data-lb-field="ordem" value="' + (layout.ordem || 0) + '" />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label>URL Ícone CDN</label>';
    html += '  <input type="text" class="form-control input-sm" data-lb-field="iconcdn" value="' + (layout.iconcdn || '') + '" placeholder="https://..." />';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label><input type="checkbox" data-lb-field="ispublic"' + (layout.ispublic ? ' checked' : '') + ' /> Público</label>';
    html += '</div>';

    html += '<div class="form-group">';
    html += '  <label><input type="checkbox" data-lb-field="inactivo"' + (layout.inactivo ? ' checked' : '') + ' /> Inactivo</label>';
    html += '</div>';

    // CDN Management
    html += renderCdnManager('JS CDNs', 'jsCdnsList', layout.jsCdnsList || []);
    html += renderCdnManager('CSS CDNs', 'cssCdnsList', layout.cssCdnsList || []);

    $props.html(html);

    // Bind property events
    $props.find('[data-lb-field]').off('change').on('change', function () {
        var field = $(this).data('lb-field');
        var layout = getSelectedLayout();
        if (!layout) return;

        if (this.type === 'checkbox') {
            layout[field] = this.checked;
        } else if (this.type === 'number') {
            layout[field] = parseInt($(this).val(), 10) || 0;
        } else {
            layout[field] = $(this).val();
        }

        // Update gallery card
        renderLayoutBuilderGallery();

        // Save to backend
        syncLayoutToServer(layout);
    });

    // Bind CDN events
    bindCdnManagerEvents();
}

function renderCdnManager(title, fieldName, cdnList) {
    var html = '<div class="form-group">';
    html += '  <label>' + title + '</label>';
    html += '  <ul class="mdash-lb-cdn-list" data-cdn-field="' + fieldName + '">';
    (cdnList || []).forEach(function (cdn, idx) {
        html += '    <li>';
        html += '      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + cdn + '">' + cdn + '</span>';
        html += '      <button type="button" class="btn btn-danger btn-xs mdash-lb-cdn-remove" data-cdn-idx="' + idx + '"><i class="glyphicon glyphicon-minus"></i></button>';
        html += '    </li>';
    });
    html += '  </ul>';
    html += '  <div class="input-group input-group-sm">';
    html += '    <input type="text" class="form-control mdash-lb-cdn-input" placeholder="https://cdn.example.com/lib.js" />';
    html += '    <span class="input-group-btn">';
    html += '      <button type="button" class="btn btn-success mdash-lb-cdn-add" data-cdn-field="' + fieldName + '"><i class="glyphicon glyphicon-plus"></i></button>';
    html += '    </span>';
    html += '  </div>';
    html += '</div>';
    return html;
}

function bindCdnManagerEvents() {
    // Add CDN
    $('.mdash-lb-cdn-add').off('click').on('click', function () {
        var fieldName = $(this).data('cdn-field');
        var $input = $(this).closest('.form-group').find('.mdash-lb-cdn-input');
        var url = $.trim($input.val());
        if (!url) return;

        var layout = getSelectedLayout();
        if (!layout) return;

        if (!Array.isArray(layout[fieldName])) layout[fieldName] = [];
        layout[fieldName].push(url);
        $input.val('');

        layout.stringifyJSONFields();
        renderLayoutProperties(layout);
        syncLayoutToServer(layout);
        updateLayoutPreview();
    });

    // Remove CDN
    $('.mdash-lb-cdn-remove').off('click').on('click', function () {
        var idx = parseInt($(this).data('cdn-idx'), 10);
        var fieldName = $(this).closest('.mdash-lb-cdn-list').data('cdn-field');

        var layout = getSelectedLayout();
        if (!layout || !Array.isArray(layout[fieldName])) return;

        layout[fieldName].splice(idx, 1);
        layout.stringifyJSONFields();
        renderLayoutProperties(layout);
        syncLayoutToServer(layout);
        updateLayoutPreview();
    });
}

// ============================================================================
// LAYOUT BUILDER - CRUD
// ============================================================================

function addNewLayout() {
    var newLayout = new MdashContainerItemLayout({});
    GMDashContainerItemLayouts.push(newLayout);

    // Save to backend
    syncLayoutToServer(newLayout);

    // Select it
    GLayoutBuilderState.selectedLayoutStamp = newLayout.mdashcontaineritemlayoutstamp;
    renderLayoutBuilderGallery();
    selectLayoutForEditing(newLayout.mdashcontaineritemlayoutstamp);

    alertify.success("Layout criado", 2000);
}

function deleteLayoutByStamp(stamp) {
    var layout = getLayoutByStamp(stamp);
    if (!layout) return;

    showDeleteConfirmation({
        title: 'Eliminar Layout',
        message: 'Tem a certeza que deseja eliminar o layout <b>' + (layout.descricao || layout.codigo) + '</b>?',
        recordToDelete: {
            table: layout.table,
            idfield: layout.idfield,
            stamp: layout.mdashcontaineritemlayoutstamp
        },
        onConfirm: function () {
            executeDeleteLayout(layout);
        }
    });

    // Elevar z-index da modal e backdrop para ficar acima do overlay do Layout Builder
    setTimeout(function () {
        $('#mdash-delete-confirm-modal').css('z-index', 10050);
        $('.modal-backdrop').css('z-index', 10040);
    }, 50);
}

function deleteSelectedLayout() {
    var layout = getSelectedLayout();
    if (!layout) return;
    deleteLayoutByStamp(layout.mdashcontaineritemlayoutstamp);
}

function executeDeleteLayout(layout) {
    // Remove from global array
    var idx = GMDashContainerItemLayouts.findIndex(function (l) {
        return l.mdashcontaineritemlayoutstamp === layout.mdashcontaineritemlayoutstamp;
    });
    if (idx > -1) GMDashContainerItemLayouts.splice(idx, 1);

    // Sync deletion to server (deleteRecords already added by showDeleteConfirmation)
    realTimeComponentSync(null, null, null);

    // Reset selection
    GLayoutBuilderState.selectedLayoutStamp = null;
    renderLayoutBuilderGallery();
    clearLayoutEditors();

    alertify.success("Layout eliminado", 2000);
}

function duplicateSelectedLayout() {
    var layout = getSelectedLayout();
    if (!layout) return;

    var duplicate = new MdashContainerItemLayout({
        codigo: layout.codigo + '_copy',
        descricao: layout.descricao + ' (Cópia)',
        layoutsystem: layout.layoutsystem,
        htmltemplate: layout.htmltemplate,
        csstemplate: layout.csstemplate,
        jstemplate: layout.jstemplate,
        slotsdefinition: layout.slotsdefinition,
        iconcdn: layout.iconcdn,
        jscdns: layout.jscdns,
        csscdns: layout.csscdns,
        ispublic: layout.ispublic,
        versao: 1,
        categoria: layout.categoria
    });

    GMDashContainerItemLayouts.push(duplicate);
    syncLayoutToServer(duplicate);

    GLayoutBuilderState.selectedLayoutStamp = duplicate.mdashcontaineritemlayoutstamp;
    renderLayoutBuilderGallery();
    selectLayoutForEditing(duplicate.mdashcontaineritemlayoutstamp);

    alertify.success("Layout duplicado", 2000);
}

function saveCurrentLayout() {
    var layout = saveEditorsToLayout();
    if (!layout) {
        // Mesmo sem layout selecionado, enviar deleteRecords pendentes
        if (GMdashDeleteRecords.length > 0) {
            realTimeComponentSync(null, null, null);
            alertify.success("Alterações sincronizadas", 2000);
            return;
        }
        alertify.error("Nenhum layout selecionado", 2000);
        return;
    }

    syncLayoutToServer(layout);
    alertify.success("Layout guardado", 2000);
}

function syncLayoutToServer(layout) {
    if (!layout) return;

    // Ensure JSON fields are stringified
    layout.stringifyJSONFields();

    // Use the existing realTimeComponentSync
    realTimeComponentSync(layout, layout.table, layout.idfield);
}

function clearLayoutEditors() {
    var editors = GLayoutBuilderState.aceEditors;
    if (editors.html) editors.html.setValue('', -1);
    if (editors.css) editors.css.setValue('', -1);
    if (editors.js) editors.js.setValue('', -1);
    if (editors.slots) editors.slots.setValue('[]', -1);

    // Clear preview
    var $preview = $('.mdash-lb-preview-card-wrapper');
    if ($preview.length) {
        $preview.html(
            '<div class="mdash-lb-empty-state" style="height:200px;">' +
            '  <i class="glyphicon glyphicon-th-large"></i>' +
            '  <p>Selecione um layout para editar</p>' +
            '</div>'
        );
    }

    // Clear properties
    var $props = $('.mdash-lb-properties');
    if ($props.length) {
        $props.html(
            '<div class="text-muted text-center" style="padding:20px;">' +
            '  <p>Selecione um layout</p>' +
            '</div>'
        );
    }
}

// ============================================================================
// LAYOUT BUILDER - LOAD LAYOUTS FROM SERVER
// ============================================================================

function loadLayoutsFromServer() {
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=realtimecomponentsync",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                action: 'getLayouts',
                table: 'MdashContainerItemLayout'
            }])
        },
        success: function (response) {
            try {
                if (response.cod === "0000" && response.data && response.data.layouts) {
                    GMDashContainerItemLayouts = response.data.layouts.map(function (l) {
                        return new MdashContainerItemLayout(l);
                    });
                }
            } catch (error) {
                console.log("Erro ao carregar layouts:", error);
            }
        },
        error: function (xhr, status, error) {
            console.log("Erro ao carregar layouts:", error);
        }
    });
}

// ============================================================================
// LAYOUT BUILDER - HBF DEFAULT TEMPLATE
// ============================================================================

function getHBFDefaultTemplate() {
    return {
        html: [
            '<div class="mdash-hbf-card">',
            '  <div class="mdash-hbf-header" data-mdash-slot="header">',
            '    <i class="glyphicon glyphicon-stats"></i>',
            '    <span class="mdash-hbf-title">Título do Card</span>',
            '  </div>',
            '  <div class="mdash-hbf-body" data-mdash-slot="body">',
            '    <div class="mdash-hbf-value">0</div>',
            '    <div class="mdash-hbf-label">Conteúdo principal</div>',
            '  </div>',
            '  <div class="mdash-hbf-footer" data-mdash-slot="footer">',
            '    <span class="mdash-hbf-footer-text">Última actualização: agora</span>',
            '  </div>',
            '</div>'
        ].join('\n'),

        css: [
            '.mdash-hbf-card {',
            '  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;',
            '  border-radius: 6px;',
            '  overflow: hidden;',
            '  height: 100%;',
            '  display: flex;',
            '  flex-direction: column;',
            '}',
            '.mdash-hbf-header {',
            '  background: linear-gradient(135deg, #3498db, #2980b9);',
            '  color: #fff;',
            '  padding: 12px 16px;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 8px;',
            '  font-size: 14px;',
            '  font-weight: 600;',
            '}',
            '.mdash-hbf-body {',
            '  flex: 1;',
            '  padding: 20px 16px;',
            '  display: flex;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  justify-content: center;',
            '}',
            '.mdash-hbf-value {',
            '  font-size: 32px;',
            '  font-weight: 700;',
            '  color: #2c3e50;',
            '}',
            '.mdash-hbf-label {',
            '  font-size: 12px;',
            '  color: #7f8c8d;',
            '  margin-top: 4px;',
            '}',
            '.mdash-hbf-footer {',
            '  background: #f8f9fa;',
            '  padding: 8px 16px;',
            '  border-top: 1px solid #e9ecef;',
            '  font-size: 11px;',
            '  color: #95a5a6;',
            '}'
        ].join('\n'),

        js: '// JavaScript do layout\n// Acesso ao card: document.querySelector(".mdash-hbf-card")\n',

        slots: [
            { id: "header", label: "Cabeçalho", type: "html", defaultContent: "<span>Título</span>" },
            { id: "body", label: "Corpo", type: "html", defaultContent: "<div>Conteúdo</div>" },
            { id: "footer", label: "Rodapé", type: "html", defaultContent: "<span>Footer</span>" }
        ]
    };
}

function addNewLayoutFromHBFTemplate() {
    var hbf = getHBFDefaultTemplate();

    var newLayout = new MdashContainerItemLayout({
        descricao: 'HBF Card Layout',
        layoutsystem: 'HBF',
        categoria: 'card',
        htmltemplate: hbf.html,
        csstemplate: hbf.css,
        jstemplate: hbf.js,
        slotsdefinition: JSON.stringify(hbf.slots)
    });

    // Parse slots
    newLayout.slots = hbf.slots;

    GMDashContainerItemLayouts.push(newLayout);
    syncLayoutToServer(newLayout);

    GLayoutBuilderState.selectedLayoutStamp = newLayout.mdashcontaineritemlayoutstamp;
    renderLayoutBuilderGallery();
    selectLayoutForEditing(newLayout.mdashcontaineritemlayoutstamp);

    alertify.success("Layout HBF criado com template base", 2000);
}

// ============================================================================
// LAYOUT BUILDER - UI PRINCIPAL
// ============================================================================

function openLayoutBuilder() {
    if (GLayoutBuilderState.isOpen) return;
    GLayoutBuilderState.isOpen = true;

    addLayoutBuilderStyles();

    // Load layouts from server if not loaded
    if (GMDashContainerItemLayouts.length === 0) {
        loadLayoutsFromServer();
    }

    var html = '';

    // Overlay
    html += '<div class="mdash-layout-builder-overlay" id="mdash-layout-builder-overlay">';
    html += '  <div class="mdash-layout-builder">';

    // ===== TOOLBAR (estilo mdash-top-toolbar) =====
    html += '    <div class="mdash-lb-toolbar">';
    html += '      <div class="mdash-lb-toolbar-brand"><i class="glyphicon glyphicon-th-large"></i> Layout Builder</div>';
    html += '      <div class="mdash-lb-toolbar-actions">';
    html += '        <button type="button" class="btn btn-sm btn-save" id="mdash-lb-btn-save" title="Guardar"><i class="glyphicon glyphicon-floppy-disk"></i> Guardar</button>';
    html += '        <button type="button" class="btn btn-sm btn-runjs" id="mdash-lb-btn-run-js" title="Executar JS"><i class="glyphicon glyphicon-play"></i> Run JS</button>';
    html += '        <button type="button" class="btn btn-sm" id="mdash-lb-btn-export" title="Exportar todos os layouts" style="border-color:rgba(255,255,255,0.18);"><i class="glyphicon glyphicon-export"></i> Exportar</button>';
    html += '        <button type="button" class="btn btn-sm" id="mdash-lb-btn-import" title="Importar layouts de ficheiro JSON" style="border-color:rgba(255,255,255,0.18);"><i class="glyphicon glyphicon-import"></i> Importar</button>';
    html += '        <input type="file" id="mdash-lb-import-file" accept=".json" style="display:none;" />';
    html += '        <button type="button" class="btn btn-sm btn-close-lb" id="mdash-lb-btn-close" title="Fechar"><i class="glyphicon glyphicon-remove"></i></button>';
    html += '      </div>';
    html += '    </div>';

    // ===== BODY (estilo mdash-modern-layout) =====
    html += '    <div class="mdash-lb-body">';

    // ===== SIDEBAR (estilo mdash-sidebar) =====
    html += '      <div class="mdash-lb-sidebar">';
    html += '        <div class="mdash-lb-sidebar-header">';
    html += '          <span><i class="glyphicon glyphicon-th-large" style="margin-right:6px;font-size:13px;"></i> Layouts</span>';
    html += '          <div style="display:flex;gap:4px;">';
    html += '            <button type="button" class="btn btn-xs" id="mdash-lb-btn-add" title="Novo layout vazio"><i class="glyphicon glyphicon-plus"></i></button>';
    html += '            <button type="button" class="btn btn-xs" id="mdash-lb-btn-add-hbf" title="Novo HBF template"><i class="glyphicon glyphicon-duplicate"></i> HBF</button>';
    html += '            <button type="button" class="btn btn-xs" id="mdash-lb-btn-duplicate" title="Duplicar selecionado"><i class="glyphicon glyphicon-copy"></i></button>';
    html += '            <button type="button" class="btn btn-xs" id="mdash-lb-btn-export-selected" title="Exportar selecionado"><i class="glyphicon glyphicon-export"></i></button>';
    html += '          </div>';
    html += '        </div>';
    html += '        <div class="mdash-lb-sidebar-list"></div>';
    html += '        <div class="mdash-lb-properties"></div>';
    html += '      </div>';

    // ===== EDITOR AREA (estilo mdash-canvas) =====
    html += '      <div class="mdash-lb-editor-area">';

    // Tabs
    html += '        <div class="mdash-lb-tabs">';
    html += '          <div class="mdash-lb-tab active" data-tab="html"><i class="glyphicon glyphicon-pencil"></i> HTML</div>';
    html += '          <div class="mdash-lb-tab" data-tab="css"><i class="glyphicon glyphicon-tint"></i> CSS</div>';
    html += '          <div class="mdash-lb-tab" data-tab="js"><i class="glyphicon glyphicon-flash"></i> JavaScript</div>';
    html += '          <div class="mdash-lb-tab" data-tab="slots"><i class="glyphicon glyphicon-th"></i> Slots</div>';
    html += '        </div>';

    // ===== TAB CONTENTS =====

    // HTML tab
    html += '        <div class="mdash-lb-tab-content active" data-tab-content="html">';
    html += '          <div class="mdash-lb-split">';
    html += '            <div class="mdash-lb-code-panel">';
    html += '              <div class="mdash-lb-code-panel-header"><i class="glyphicon glyphicon-pencil"></i> HTML Template</div>';
    html += '              <div id="mdash-lb-ace-html" class="mdash-lb-ace-editor"></div>';
    html += '            </div>';
    html += '            <div class="mdash-lb-preview-panel">';
    html += '              <div class="mdash-lb-preview-panel-header"><span><i class="glyphicon glyphicon-eye-open" style="margin-right:4px;"></i> Pré-visualização</span><button type="button" class="btn btn-xs mdash-lb-slot-mode-btn" id="mdash-lb-slot-mode-toggle" title="Modo Slots: clique em elementos para definir slots"><i class="glyphicon glyphicon-screenshot"></i> Slots</button></div>';
    html += '              <div class="mdash-lb-slot-mode-info" id="mdash-lb-slot-mode-info"><i class="glyphicon glyphicon-info-sign"></i> <b>Modo Slots:</b> Clique num elemento para o definir como slot</div>';
    html += '              <div class="mdash-lb-slot-breadcrumb" id="mdash-lb-slot-breadcrumb"></div>';
    html += '              <div class="mdash-lb-preview-content" id="mdash-lb-main-preview-content">';
    html += '                <div class="mdash-lb-preview-card-wrapper">';
    html += '                  <div class="mdash-lb-empty-state" style="height:200px;">';
    html += '                    <i class="glyphicon glyphicon-th-large"></i>';
    html += '                    <p>Selecione um layout para editar</p>';
    html += '                  </div>';
    html += '                </div>';
    html += '              </div>';
    html += '            </div>';
    html += '          </div>';
    html += '        </div>';

    // CSS tab
    html += '        <div class="mdash-lb-tab-content" data-tab-content="css">';
    html += '          <div class="mdash-lb-split">';
    html += '            <div class="mdash-lb-code-panel">';
    html += '              <div class="mdash-lb-code-panel-header"><i class="glyphicon glyphicon-tint"></i> CSS Styles</div>';
    html += '              <div id="mdash-lb-ace-css" class="mdash-lb-ace-editor"></div>';
    html += '            </div>';
    html += '            <div class="mdash-lb-preview-panel">';
    html += '              <div class="mdash-lb-preview-panel-header"><span><i class="glyphicon glyphicon-eye-open" style="margin-right:4px;"></i> Pré-visualização</span></div>';
    html += '              <div class="mdash-lb-preview-content">';
    html += '                <div class="mdash-lb-preview-card-wrapper mdash-lb-preview-css-mirror"></div>';
    html += '              </div>';
    html += '            </div>';
    html += '          </div>';
    html += '        </div>';

    // JS tab
    html += '        <div class="mdash-lb-tab-content" data-tab-content="js">';
    html += '          <div class="mdash-lb-split">';
    html += '            <div class="mdash-lb-code-panel">';
    html += '              <div class="mdash-lb-code-panel-header"><i class="glyphicon glyphicon-flash"></i> JavaScript</div>';
    html += '              <div id="mdash-lb-ace-js" class="mdash-lb-ace-editor"></div>';
    html += '            </div>';
    html += '            <div class="mdash-lb-preview-panel">';
    html += '              <div class="mdash-lb-preview-panel-header"><span><i class="glyphicon glyphicon-eye-open" style="margin-right:4px;"></i> Pré-visualização</span></div>';
    html += '              <div class="mdash-lb-preview-content">';
    html += '                <div class="mdash-lb-preview-card-wrapper mdash-lb-preview-js-mirror"></div>';
    html += '              </div>';
    html += '            </div>';
    html += '          </div>';
    html += '        </div>';

    // Slots tab
    html += '        <div class="mdash-lb-tab-content" data-tab-content="slots">';
    html += '          <div class="mdash-lb-split">';
    html += '            <div class="mdash-lb-code-panel">';
    html += '              <div class="mdash-lb-code-panel-header"><i class="glyphicon glyphicon-th"></i> Slots Definition (JSON)</div>';
    html += '              <div id="mdash-lb-ace-slots" class="mdash-lb-ace-editor"></div>';
    html += '            </div>';
    html += '            <div class="mdash-lb-preview-panel">';
    html += '              <div class="mdash-lb-preview-panel-header"><span><i class="glyphicon glyphicon-info-sign" style="margin-right:4px;"></i> Slots Detectados</span></div>';
    html += '              <div class="mdash-lb-preview-content" style="align-items:flex-start;padding:16px;">';
    html += '                <div id="mdash-lb-slots-detected" style="width:100%;"></div>';
    html += '              </div>';
    html += '            </div>';
    html += '          </div>';
    html += '        </div>';

    html += '      </div>'; // editor-area
    html += '    </div>'; // body
    html += '  </div>'; // layout-builder
    html += '</div>'; // overlay

    $('body').append(html);

    // Initialize after DOM is ready
    setTimeout(function () {
        initLayoutBuilderAceEditors();
        renderLayoutBuilderGallery();
        bindLayoutBuilderEvents();

        // Select first layout if exists
        if (GMDashContainerItemLayouts.length > 0) {
            selectLayoutForEditing(GMDashContainerItemLayouts[0].mdashcontaineritemlayoutstamp);
        } else {
            clearLayoutEditors();
        }
    }, 100);
}

function closeLayoutBuilder() {
    // Cleanup slot mode
    hideSlotPopover();
    GLayoutBuilderState.slotModeActive = false;
    GLayoutBuilderState.slotModeSelectedElement = null;

    // Save current layout before closing
    saveEditorsToLayout();
    var layout = getSelectedLayout();
    if (layout) syncLayoutToServer(layout);

    // Cleanup
    destroyLayoutBuilderAceEditors();
    $('#mdash-lb-preview-injected-css').remove();
    // CDNs ficam carregados (deduplicated via ensureMdashCDNsLoaded — são reutilizados no dashboard)
    $('#mdash-layout-builder-overlay').remove();
    $(document).off('keydown.layoutBuilder');

    GLayoutBuilderState.isOpen = false;
    GLayoutBuilderState.selectedLayoutStamp = null;
}

function bindLayoutBuilderEvents() {
    // Close
    $('#mdash-lb-btn-close').off('click').on('click', closeLayoutBuilder);

    // Save
    $('#mdash-lb-btn-save').off('click').on('click', saveCurrentLayout);

    // Run JS
    $('#mdash-lb-btn-run-js').off('click').on('click', executePreviewJS);

    // Add new layout (empty)
    $('#mdash-lb-btn-add').off('click').on('click', addNewLayout);

    // Add new HBF template
    $('#mdash-lb-btn-add-hbf').off('click').on('click', addNewLayoutFromHBFTemplate);

    // Duplicate
    $('#mdash-lb-btn-duplicate').off('click').on('click', duplicateSelectedLayout);

    // Delete
    $('#mdash-lb-btn-delete').off('click').on('click', deleteSelectedLayout);

    // Export / Import
    $('#mdash-lb-btn-export').off('click').on('click', exportAllLayouts);
    $('#mdash-lb-btn-export-selected').off('click').on('click', exportSelectedLayout);
    $('#mdash-lb-btn-import').off('click').on('click', importLayouts);
    $('#mdash-lb-import-file').off('change').on('change', handleImportFile);

    // Slot mode toggle
    $('#mdash-lb-slot-mode-toggle').off('click').on('click', toggleSlotMode);

    // Tab switching
    $('.mdash-lb-tab').off('click').on('click', function () {
        var tabId = $(this).data('tab');

        // Deactivate slot mode when switching tabs
        if (GLayoutBuilderState.slotModeActive) {
            toggleSlotMode();
        }

        // Update tab active states
        $('.mdash-lb-tab').removeClass('active');
        $(this).addClass('active');

        // Show/hide content
        $('.mdash-lb-tab-content').removeClass('active');
        $('.mdash-lb-tab-content[data-tab-content="' + tabId + '"]').addClass('active');

        // Resize ACE editors when tab becomes visible
        var editors = GLayoutBuilderState.aceEditors;
        setTimeout(function () {
            if (tabId === 'html' && editors.html) editors.html.resize();
            if (tabId === 'css' && editors.css) editors.css.resize();
            if (tabId === 'js' && editors.js) editors.js.resize();
            if (tabId === 'slots' && editors.slots) editors.slots.resize();
        }, 50);

        // Mirror preview across tabs (CSS and JS tabs show same preview as HTML)
        if (tabId === 'css' || tabId === 'js') {
            var mainPreviewHtml = $('.mdash-lb-preview-card-wrapper').first().html();
            $('.mdash-lb-preview-' + tabId + '-mirror').html(mainPreviewHtml);
        }

        // Slots tab: detect and show slots from HTML
        if (tabId === 'slots') {
            renderDetectedSlots();
        }
    });

    // ESC: popover → slot mode → fechar builder
    $(document).on('keydown.layoutBuilder', function (e) {
        if (e.keyCode === 27) {
            if ($('#mdash-lb-slot-popover').length) {
                hideSlotPopover();
            } else if (GLayoutBuilderState.slotModeActive) {
                toggleSlotMode();
            } else if (GLayoutBuilderState.isOpen) {
                closeLayoutBuilder();
            }
        }
    });
}

// ============================================================================
// LAYOUT BUILDER - SLOT MODE (ATRIBUIÇÃO VISUAL DE SLOTS LOW-CODE)
// ============================================================================

/**
 * Activa/desactiva o modo de atribuição visual de slots.
 * Quando activo, o utilizador pode clicar em qualquer elemento na
 * pré-visualização para o marcar como slot (data-mdash-slot).
 */
function toggleSlotMode() {
    GLayoutBuilderState.slotModeActive = !GLayoutBuilderState.slotModeActive;
    var active = GLayoutBuilderState.slotModeActive;

    var $btn = $('#mdash-lb-slot-mode-toggle');
    var $info = $('#mdash-lb-slot-mode-info');
    var $breadcrumb = $('#mdash-lb-slot-breadcrumb');
    var $previewContent = $('#mdash-lb-main-preview-content');

    if (active) {
        $btn.addClass('active');
        $info.addClass('active');
        $previewContent.addClass('slot-mode');
        injectSlotModeBadges();
        bindSlotModeEvents($previewContent);
    } else {
        $btn.removeClass('active');
        $info.removeClass('active');
        $breadcrumb.removeClass('active').empty();
        $previewContent.removeClass('slot-mode');
        unbindSlotModeEvents($previewContent);
        hideSlotPopover();
        removeSlotModeBadges();
        $previewContent.find('.mdash-lb-slot-selected').removeClass('mdash-lb-slot-selected');
    }
}

function bindSlotModeEvents($previewContent) {
    var $wrapper = $previewContent.find('.mdash-lb-preview-card-wrapper');

    $wrapper.on('click.slotmode', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = e.target;
        // Não seleccionar o wrapper nem o empty state
        if ($(target).hasClass('mdash-lb-preview-card-wrapper')) return;
        if ($(target).closest('.mdash-lb-empty-state').length) return;

        // Se clicou num badge, seleccionar o elemento pai
        if ($(target).hasClass('mdash-lb-slot-badge')) {
            target = target.parentElement;
            if (!target || $(target).hasClass('mdash-lb-preview-card-wrapper')) return;
        }

        // Remover selecção anterior
        $wrapper.find('.mdash-lb-slot-selected').removeClass('mdash-lb-slot-selected');

        // Seleccionar este elemento
        $(target).addClass('mdash-lb-slot-selected');
        GLayoutBuilderState.slotModeSelectedElement = target;

        // Breadcrumb
        updateSlotBreadcrumb(target, $wrapper[0]);

        // Popover
        showSlotPopover(target);
    });
}

function unbindSlotModeEvents($previewContent) {
    var $wrapper = $previewContent.find('.mdash-lb-preview-card-wrapper');
    $wrapper.off('click.slotmode');
    GLayoutBuilderState.slotModeSelectedElement = null;
}

/**
 * Mostra o breadcrumb do caminho DOM até ao elemento seleccionado.
 * Elementos que já são slots mostram um indicador verde.
 * Clicar num item do breadcrumb selecciona esse elemento pai.
 */
function updateSlotBreadcrumb(element, container) {
    var $breadcrumb = $('#mdash-lb-slot-breadcrumb');
    var path = [];
    var el = element;

    while (el && el !== container) {
        var tag = el.tagName.toLowerCase();
        var cls = (el.className || '').replace(/mdash-lb-slot-selected/g, '').trim();
        var label = tag;
        if (cls) {
            var firstClass = cls.split(/\s+/)[0];
            if (firstClass) label += '.' + firstClass;
        }
        var isSlot = el.hasAttribute('data-mdash-slot');
        path.unshift({ label: label, element: el, isSlot: isSlot });
        el = el.parentElement;
    }

    var html = '';
    path.forEach(function (item, idx) {
        if (idx > 0) html += '<span class="sep">\u203A</span>';
        var slotClass = item.isSlot ? ' class="is-slot"' : '';
        var slotBadge = item.isSlot ? ' \u25CF' : '';
        html += '<span data-bc-idx="' + idx + '"' + slotClass + '>' + item.label + slotBadge + '</span>';
    });

    $breadcrumb.html(html).addClass('active');

    // Clicar no breadcrumb para navegar a elementos pai
    $breadcrumb.find('span[data-bc-idx]').off('click').on('click', function () {
        var idx = parseInt($(this).data('bc-idx'), 10);
        if (path[idx] && path[idx].element) {
            var $wrapper = $(container);
            $wrapper.find('.mdash-lb-slot-selected').removeClass('mdash-lb-slot-selected');
            $(path[idx].element).addClass('mdash-lb-slot-selected');
            GLayoutBuilderState.slotModeSelectedElement = path[idx].element;
            updateSlotBreadcrumb(path[idx].element, container);
            showSlotPopover(path[idx].element);
        }
    });
}

/**
 * Mostra o popover para atribuir/editar/remover um slot num elemento.
 */
function showSlotPopover(element) {
    hideSlotPopover();

    var existingSlot = element.getAttribute('data-mdash-slot') || '';
    var isSlot = !!existingSlot;
    var suggestedName = existingSlot || suggestSlotName(element);

    // Cores reais (o popover está fora do overlay, sem acesso a CSS vars)
    var primaryColor = getColorByType("primary").background;
    var primaryRgb = hexToRgb(primaryColor);

    var tag = element.tagName.toLowerCase();
    var cls = (element.className || '').replace(/mdash-lb-slot-selected/g, '').trim();
    var elementInfo = '&lt;' + tag + (cls ? ' class="' + cls + '"' : '') + '&gt;';

    var html = '<div class="mdash-lb-slot-popover" id="mdash-lb-slot-popover" style="--md-primary:' + primaryColor + ';--md-primary-rgb:' + primaryRgb + ';--md-surface:#ffffff;--md-bg:#f3f6fb;--md-text:#1f2937;--md-muted:#64748b;--md-border:rgba(15,23,42,0.08);">';
    html += '  <h6><i class="glyphicon glyphicon-screenshot" style="margin-right:6px;"></i> ' + (isSlot ? 'Editar Slot' : 'Definir Slot') + '</h6>';
    html += '  <div class="mdash-lb-slot-el-info" title="Elemento seleccionado">' + elementInfo + '</div>';
    html += '  <div class="form-group">';
    html += '    <label>Nome do Slot</label>';
    html += '    <input type="text" id="mdash-lb-slot-name-input" value="' + suggestedName + '" placeholder="ex: header, titulo, valor" />';
    html += '  </div>';
    html += '  <div class="mdash-lb-slot-popover-actions">';
    html += '    <button type="button" class="btn btn-sm" id="mdash-lb-slot-apply" style="background:' + primaryColor + ';color:#fff;flex:1;"><i class="glyphicon glyphicon-ok" style="margin-right:4px;"></i> ' + (isSlot ? 'Actualizar' : 'Aplicar') + '</button>';
    if (isSlot) {
        html += '    <button type="button" class="btn btn-sm" id="mdash-lb-slot-remove" style="background:#dc3545;color:#fff;"><i class="glyphicon glyphicon-trash" style="margin-right:4px;"></i> Remover</button>';
    }
    html += '    <button type="button" class="btn btn-sm" id="mdash-lb-slot-cancel" style="background:#f3f6fb;color:#1f2937;border:1px solid rgba(15,23,42,0.08);"><i class="glyphicon glyphicon-remove"></i></button>';
    html += '  </div>';
    html += '</div>';

    // Posicionar o popover junto ao elemento
    var rect = element.getBoundingClientRect();
    var $popover = $(html);
    $('body').append($popover);

    var popoverWidth = 270;
    var left = rect.right + 10;
    var top = rect.top;

    if (left + popoverWidth > window.innerWidth) {
        left = rect.left - popoverWidth - 10;
    }
    if (left < 8) left = 8;
    if (top + 220 > window.innerHeight) {
        top = window.innerHeight - 230;
    }
    if (top < 8) top = 8;

    $popover.css({ position: 'fixed', left: left + 'px', top: top + 'px', zIndex: 10020 });

    // Focus no input
    setTimeout(function () {
        $('#mdash-lb-slot-name-input').focus().select();
    }, 50);

    bindSlotPopoverEvents(element);
}

function hideSlotPopover() {
    $('#mdash-lb-slot-popover').remove();
}

function bindSlotPopoverEvents(element) {
    // Aplicar slot
    $('#mdash-lb-slot-apply').off('click').on('click', function () {
        var slotName = $.trim($('#mdash-lb-slot-name-input').val());
        if (!slotName) {
            alertify.error("Introduza um nome para o slot", 2000);
            return;
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(slotName)) {
            alertify.error("Nome inválido. Use letras, números, hífens e underscores. Comece com letra.", 3000);
            return;
        }

        element.setAttribute('data-mdash-slot', slotName);
        hideSlotPopover();
        refreshSlotModeBadges();
        syncPreviewToHtmlEditor();

        var $wrapper = $(element).closest('.mdash-lb-preview-card-wrapper');
        if ($wrapper.length) updateSlotBreadcrumb(element, $wrapper[0]);

        alertify.success("Slot '" + slotName + "' definido", 2000);
    });

    // Remover slot
    $('#mdash-lb-slot-remove').off('click').on('click', function () {
        element.removeAttribute('data-mdash-slot');
        hideSlotPopover();
        refreshSlotModeBadges();
        syncPreviewToHtmlEditor();

        var $wrapper = $(element).closest('.mdash-lb-preview-card-wrapper');
        if ($wrapper.length) updateSlotBreadcrumb(element, $wrapper[0]);

        alertify.success("Slot removido", 2000);
    });

    // Cancelar
    $('#mdash-lb-slot-cancel').off('click').on('click', function () {
        hideSlotPopover();
    });

    // Enter para aplicar, ESC para cancelar
    $('#mdash-lb-slot-name-input').off('keydown').on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $('#mdash-lb-slot-apply').click();
        }
        if (e.keyCode === 27) {
            e.preventDefault();
            e.stopPropagation();
            hideSlotPopover();
        }
    });
}

// ============================================================================
// SLOT MODE - ELEMENT BADGES (etiquetas visuais nos elementos)
// ============================================================================

/**
 * Mapeia tags HTML a ícones/labels amigáveis para os badges.
 */
var SLOT_BADGE_TAG_MAP = {
    'div':    { icon: '\u25A1', label: 'div' },
    'span':   { icon: '\u2500', label: 'span' },
    'p':      { icon: '\u00B6', label: 'p' },
    'h1':     { icon: 'H', label: 'h1' },
    'h2':     { icon: 'H', label: 'h2' },
    'h3':     { icon: 'H', label: 'h3' },
    'h4':     { icon: 'H', label: 'h4' },
    'h5':     { icon: 'H', label: 'h5' },
    'h6':     { icon: 'H', label: 'h6' },
    'ul':     { icon: '\u2022', label: 'ul' },
    'ol':     { icon: '1.', label: 'ol' },
    'li':     { icon: '\u2022', label: 'li' },
    'a':      { icon: '\u2197', label: 'a' },
    'img':    { icon: '\u25A3', label: 'img' },
    'i':      { icon: '\u2605', label: 'icon' },
    'button': { icon: '\u25C9', label: 'btn' },
    'input':  { icon: '\u2395', label: 'input' },
    'select': { icon: '\u25BD', label: 'select' },
    'table':  { icon: '\u2637', label: 'table' },
    'thead':  { icon: '\u2637', label: 'thead' },
    'tbody':  { icon: '\u2637', label: 'tbody' },
    'tr':     { icon: '\u2500', label: 'tr' },
    'td':     { icon: '\u25A1', label: 'td' },
    'th':     { icon: '\u25A0', label: 'th' },
    'form':   { icon: '\u2611', label: 'form' },
    'nav':    { icon: '\u2261', label: 'nav' },
    'header': { icon: '\u2302', label: 'header' },
    'footer': { icon: '_', label: 'footer' },
    'section':{ icon: '\u00A7', label: 'section' },
    'article':{ icon: '\u00B6', label: 'article' },
    'canvas': { icon: '\u25A8', label: 'canvas' },
    'svg':    { icon: '\u25C7', label: 'svg' }
};

/**
 * Gera um label descriptivo curto para um elemento HTML.
 * Ex: "div.mdash-hbf-header" ou "span.title" ou apenas "div"
 */
function getElementBadgeLabel(el) {
    var tag = el.tagName.toLowerCase();
    var mapped = SLOT_BADGE_TAG_MAP[tag] || { icon: '\u25CB', label: tag };
    var cls = (el.className || '').replace(/mdash-lb-slot-selected/g, '').replace(/\s+/g, ' ').trim();

    var shortClass = '';
    if (cls) {
        var classes = cls.split(' ');
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] && !/^(mdash-lb-|slot-mode)/.test(classes[i])) {
                shortClass = classes[i];
                // Truncar nomes de classe longos
                if (shortClass.length > 18) shortClass = shortClass.substring(0, 18) + '\u2026';
                break;
            }
        }
    }

    return {
        icon: mapped.icon,
        label: shortClass ? mapped.label + '.' + shortClass : mapped.label,
        tag: tag
    };
}

/**
 * Retorna apenas o texto directo de um elemento (não dos filhos).
 */
function getOwnTextContent(el) {
    var text = '';
    for (var i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === 3) { // TEXT_NODE
            text += el.childNodes[i].textContent;
        }
    }
    return text;
}

/**
 * Injeta badges visuais sobre todos os elementos filho na pré-visualização.
 * Mostra a tag e classe de cada elemento, e o nome do slot se definido.
 * Elementos vazios ficam com min-height e padrão tracejado para serem clicáveis.
 */
function injectSlotModeBadges() {
    var $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    removeSlotModeBadges();

    $wrapper.find('*').each(function () {
        var el = this;
        // Ignorar elementos internos do layout builder
        if ($(el).hasClass('mdash-lb-empty-state')) return;
        if ($(el).hasClass('mdash-lb-slot-badge')) return;
        if (el.tagName === 'BR' || el.tagName === 'HR') return;

        // Marcar como host de badge
        el.setAttribute('data-lb-badge-host', '1');

        // Elementos vazios ou só com whitespace: marcar para dar visibilidade
        var ownText = getOwnTextContent(el).trim();
        var hasRealChildren = false;
        for (var ci = 0; ci < el.children.length; ci++) {
            var child = el.children[ci];
            if (!$(child).hasClass('mdash-lb-slot-badge')) {
                hasRealChildren = true;
                break;
            }
        }
        if (!ownText && !hasRealChildren) {
            el.setAttribute('data-lb-badge-empty', '1');
        }

        // Tornar position relative se não tiver posição
        var pos = window.getComputedStyle(el).position;
        if (pos === 'static') {
            el.style.position = 'relative';
        }

        var info = getElementBadgeLabel(el);

        // Badge de tipo (canto superior esquerdo)
        var $tagBadge = $('<span class="mdash-lb-slot-badge badge-tag">' + info.icon + ' ' + info.label + '</span>');
        $(el).append($tagBadge);

        // Se já é slot, badge de slot (canto superior direito)
        var slotName = el.getAttribute('data-mdash-slot');
        if (slotName) {
            var $slotBadge = $('<span class="mdash-lb-slot-badge badge-slot-name">\u25CF ' + slotName + '</span>');
            $(el).append($slotBadge);
        }
    });
}

/**
 * Remove todos os badges injetados pelo slot mode.
 */
function removeSlotModeBadges() {
    var $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    $wrapper.find('.mdash-lb-slot-badge').remove();
    $wrapper.find('[data-lb-badge-host]').removeAttr('data-lb-badge-host').each(function () {
        // Limpar position relative se foi adicionado por nós
        if (this.style.position === 'relative' && !this.getAttribute('style').replace(/position\s*:\s*relative\s*;?/, '').trim()) {
            this.removeAttribute('style');
        } else if (this.style.position === 'relative') {
            this.style.position = '';
        }
    });
    $wrapper.find('[data-lb-badge-empty]').removeAttr('data-lb-badge-empty');
}

/**
 * Re-injeta badges após alteração de slots (aplicar/remover).
 */
function refreshSlotModeBadges() {
    if (!GLayoutBuilderState.slotModeActive) return;
    injectSlotModeBadges();
}

/**
 * Sugere um nome de slot com base no elemento (classe, id, tag).
 */
function suggestSlotName(element) {
    var existing = element.getAttribute('data-mdash-slot');
    if (existing) return existing;

    // Extrair de classes significativas
    var cls = (element.className || '').replace(/mdash-lb-slot-selected/g, '').trim();
    if (cls) {
        var classes = cls.split(/\s+/);
        for (var i = 0; i < classes.length; i++) {
            var c = classes[i];
            // Ignorar classes genéricas de framework
            if (/^(row|col-|container|clearfix|text-|pull-|hidden|visible|active|in|fade|btn)/.test(c)) continue;
            // Extrair último segmento após hífen
            var parts = c.replace(/^mdash-/, '').split('-');
            var name = parts[parts.length - 1];
            if (name && name.length > 1) return name;
        }
    }

    // De id
    if (element.id) {
        return element.id.replace(/^mdash-/, '').replace(/-/g, '_');
    }

    // De tag + posição entre irmãos
    var tag = element.tagName.toLowerCase();
    var parent = element.parentElement;
    if (parent) {
        var siblings = Array.prototype.slice.call(parent.children);
        if (siblings.length <= 1) return tag;
        var idx = siblings.indexOf(element);
        return tag + '_' + (idx + 1);
    }

    return tag;
}

/**
 * Sincroniza as alterações feitas na pré-visualização (slot mode)
 * de volta para o editor HTML ACE + editor de Slots JSON.
 */
function syncPreviewToHtmlEditor() {
    var $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    // Clonar para limpar artefactos do slot mode
    var $clone = $wrapper.clone();
    $clone.find('.mdash-lb-slot-selected').removeClass('mdash-lb-slot-selected');
    $clone.find('.mdash-lb-slot-badge').remove();
    $clone.find('[data-lb-badge-host]').removeAttr('data-lb-badge-host');
    $clone.find('[data-lb-badge-empty]').removeAttr('data-lb-badge-empty');
    $clone.find('[class=""]').removeAttr('class');

    var newHtml = beautifyHtml($clone.html());

    // Evitar loop: editor change → preview update → ...
    GLayoutBuilderState.syncingFromSlotMode = true;

    var editors = GLayoutBuilderState.aceEditors;
    if (editors.html) {
        editors.html.setValue(newHtml, -1);
    }

    // Sincronizar slots detectados para o editor de Slots JSON
    updateSlotsFromPreview();

    setTimeout(function () {
        GLayoutBuilderState.syncingFromSlotMode = false;
    }, 600);
}

/**
 * Formatação básica do HTML serializado do DOM.
 */
function beautifyHtml(html) {
    var formatted = html.replace(/>\s*</g, '>\n<').split('\n');
    var result = [];
    var indent = 0;

    for (var i = 0; i < formatted.length; i++) {
        var line = formatted[i].trim();
        if (!line) continue;

        // Diminuir indent para tags de fecho
        if (/^<\//.test(line)) {
            indent = Math.max(0, indent - 1);
        }

        result.push(new Array(indent + 1).join('  ') + line);

        // Aumentar indent para tags de abertura (não self-closing, não void, não inline com fecho)
        if (/^<[a-zA-Z]/.test(line) && !/<\/[^>]+>$/.test(line) && !/\/>$/.test(line)
            && !/^<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)[\s/>]/i.test(line)) {
            indent++;
        }
    }

    return result.join('\n');
}

/**
 * Actualiza o editor de Slots JSON com base nos slots presentes na pré-visualização.
 */
function updateSlotsFromPreview() {
    var $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    var slots = [];
    $wrapper.find('[data-mdash-slot]').each(function () {
        var slotId = $(this).attr('data-mdash-slot');
        var defaultContent = $(this).html();
        if (defaultContent.length > 200) defaultContent = defaultContent.substring(0, 200) + '...';

        slots.push({
            id: slotId,
            label: slotId.charAt(0).toUpperCase() + slotId.slice(1).replace(/[_-]/g, ' '),
            type: 'html',
            defaultContent: defaultContent
        });
    });

    var editors = GLayoutBuilderState.aceEditors;
    if (editors.slots) {
        editors.slots.setValue(JSON.stringify(slots, null, 2), -1);
    }

    // Actualizar o objecto layout directamente
    var layout = getSelectedLayout();
    if (layout) {
        layout.slots = slots;
        layout.slotsdefinition = JSON.stringify(slots);
    }
}

// ============================================================================
// LAYOUT BUILDER - SLOT DETECTION
// ============================================================================

function renderDetectedSlots() {
    var $container = $('#mdash-lb-slots-detected');
    if (!$container.length) return;

    var editors = GLayoutBuilderState.aceEditors;
    var htmlVal = editors.html ? editors.html.getValue() : '';

    // Parse HTML and find data-mdash-slot attributes
    var slotRegex = /data-mdash-slot="([^"]+)"/g;
    var match;
    var detectedSlots = [];
    while ((match = slotRegex.exec(htmlVal)) !== null) {
        detectedSlots.push(match[1]);
    }

    if (detectedSlots.length === 0) {
        $container.html(
            '<div class="text-muted text-center" style="padding:20px;">' +
            '<p>Nenhum slot detectado no HTML.<br>Adicione <code>data-mdash-slot="nome"</code> aos elementos editáveis.</p>' +
            '</div>'
        );
        return;
    }

    var html = '<table class="mdash-lb-slot-table">';
    html += '<thead><tr><th>Slot ID</th><th>Estado</th></tr></thead>';
    html += '<tbody>';
    detectedSlots.forEach(function (slotId) {
        html += '<tr>';
        html += '  <td><code>' + slotId + '</code></td>';
        html += '  <td><span class="badge" style="background:#27ae60;color:#fff;">Detectado</span></td>';
        html += '</tr>';
    });
    html += '</tbody></table>';

    $container.html(html);
}

// ============================================================================
// LAYOUT BUILDER - EXPORTAR / IMPORTAR
// ============================================================================

function exportSelectedLayout() {
    var layout = getSelectedLayout();
    if (!layout) {
        alertify.error("Selecione um layout para exportar", 2000);
        return;
    }

    layout.stringifyJSONFields();
    var exportData = [{
        mdashcontaineritemlayoutstamp: layout.mdashcontaineritemlayoutstamp,
        codigo: layout.codigo,
        descricao: layout.descricao,
        layoutsystem: layout.layoutsystem,
        htmltemplate: layout.htmltemplate,
        csstemplate: layout.csstemplate,
        jstemplate: layout.jstemplate,
        slotsdefinition: layout.slotsdefinition,
        iconcdn: layout.iconcdn,
        jscdns: layout.jscdns,
        csscdns: layout.csscdns,
        thumbnail: layout.thumbnail,
        ispublic: layout.ispublic,
        versao: layout.versao,
        categoria: layout.categoria,
        ordem: layout.ordem,
        inactivo: layout.inactivo
    }];

    var json = JSON.stringify(exportData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'mdash-layout-' + (layout.codigo || 'export') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alertify.success("Layout '" + (layout.descricao || layout.codigo) + "' exportado", 2000);
}

function exportAllLayouts() {
    if (!GMDashContainerItemLayouts.length) {
        alertify.error("Não existem layouts para exportar", 2000);
        return;
    }

    // Garantir que os campos JSON estão stringified antes de exportar
    var exportData = GMDashContainerItemLayouts.map(function (l) {
        l.stringifyJSONFields();
        return {
            mdashcontaineritemlayoutstamp: l.mdashcontaineritemlayoutstamp,
            codigo: l.codigo,
            descricao: l.descricao,
            layoutsystem: l.layoutsystem,
            htmltemplate: l.htmltemplate,
            csstemplate: l.csstemplate,
            jstemplate: l.jstemplate,
            slotsdefinition: l.slotsdefinition,
            iconcdn: l.iconcdn,
            jscdns: l.jscdns,
            csscdns: l.csscdns,
            thumbnail: l.thumbnail,
            ispublic: l.ispublic,
            versao: l.versao,
            categoria: l.categoria,
            ordem: l.ordem,
            inactivo: l.inactivo
        };
    });

    var json = JSON.stringify(exportData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'mdash-layouts-export-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alertify.success(exportData.length + " layout(s) exportado(s)", 2000);
}

function importLayouts() {
    $('#mdash-lb-import-file').val('').trigger('click');
}

function handleImportFile(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        alertify.error("Selecione um ficheiro .json", 2000);
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var imported = JSON.parse(e.target.result);

            if (!Array.isArray(imported)) {
                alertify.error("O ficheiro deve conter um array de layouts", 3000);
                return;
            }

            if (imported.length === 0) {
                alertify.error("O ficheiro não contém layouts", 2000);
                return;
            }

            var count = 0;
            imported.forEach(function (data) {
                if (!data || typeof data !== 'object') return;

                // Gerar novo stamp para evitar conflitos
                data.mdashcontaineritemlayoutstamp = generateUUID();

                var layout = new MdashContainerItemLayout(data);
                GMDashContainerItemLayouts.push(layout);
                syncLayoutToServer(layout);
                count++;
            });

            renderLayoutBuilderGallery();
            alertify.success(count + " layout(s) importado(s)", 2000);

        } catch (err) {
            console.error("Erro ao importar layouts:", err);
            alertify.error("Erro ao ler ficheiro: " + err.message, 3000);
        }
    };
    reader.readAsText(file);
}

// ============================================================================
// INTEGRATION: Expor layouts customizados ao sistema de templates existente
// ============================================================================

/**
 * Retorna os layouts customizados no formato compatível com getTemplateLayoutOptions()
 * Para integração híbrida: templates legacy + layouts customizados
 */
function getCustomLayoutTemplateOptions() {
    return GMDashContainerItemLayouts
        .filter(function (l) { return !l.inactivo && l.ispublic; })
        .map(function (l) { return l.toTemplateOption(); });
}

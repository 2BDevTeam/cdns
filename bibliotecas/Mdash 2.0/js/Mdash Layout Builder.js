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
        slots: null,
        props: null
    },
    previewDebounceTimer: null,
    propsDebounceTimer: null,
    syncingPropsEditor: false,
    syncingFromPropMode: false,
    propModeActive: false,
    propModeSelectedElement: null,
    propTargetPick: null,
    pendingQuickProp: null,
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
    css += '.mdash-lb-prop-behavior-row { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; align-items:flex-end; }';
    css += '.mdash-lb-prop-card { border:1px solid var(--md-border); border-radius:10px; padding:10px; margin-bottom:10px; background:#fff; }';
    css += '.mdash-lb-prop-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }';
    css += '.mdash-lb-prop-card-title { font-weight:700; font-size:12px; color:var(--md-text); }';
    css += '.mdash-lb-props-builder { width:100%; }';

    // ===== PROPS MODE (marcação visual data-mdash-prop-target) =====
    css += '.mdash-lb-prop-mode-btn { border-radius: 6px; font-size: 10px; font-weight: 700; padding: 3px 10px; border: 1px solid rgba(147,51,234,0.35); color: #7c3aed; background: rgba(147,51,234,0.08); transition: all 0.2s; letter-spacing: 0.3px; text-transform: uppercase; }';
    css += '.mdash-lb-prop-mode-btn:hover { background: rgba(147,51,234,0.14); }';
    css += '.mdash-lb-prop-mode-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; box-shadow: 0 2px 8px rgba(124,58,237,0.35); }';
    css += '.mdash-lb-prop-mode-info { padding: 8px 14px; background: linear-gradient(120deg, rgba(147,51,234,0.1), rgba(147,51,234,0.03)); border-bottom: 1px solid var(--md-border); font-size: 11px; color: var(--md-text); display: none; align-items: center; gap: 8px; }';
    css += '.mdash-lb-prop-mode-info.active { display: flex; }';
    css += '.mdash-lb-prop-mode-info i { color: #7c3aed; }';
    css += '.mdash-lb-prop-breadcrumb { padding: 6px 14px; background: rgba(147,51,234,0.04); border-bottom: 1px solid var(--md-border); font-size: 11px; color: var(--md-muted); display: none; overflow-x: auto; white-space: nowrap; }';
    css += '.mdash-lb-prop-breadcrumb.active { display: flex; align-items: center; gap: 2px; }';
    css += '.mdash-lb-prop-breadcrumb span { cursor: pointer; padding: 2px 6px; border-radius: 4px; transition: all 0.15s; }';
    css += '.mdash-lb-prop-breadcrumb span:hover { background: rgba(147,51,234,0.12); color: #7c3aed; }';
    css += '.mdash-lb-prop-breadcrumb .sep { cursor: default; color: var(--md-muted); opacity: 0.5; }';
    css += '.mdash-lb-prop-breadcrumb .is-prop { color: #7c3aed; font-weight: 700; }';
    css += '#mdash-lb-props-preview-content.prop-mode { cursor: crosshair; }';
    css += '#mdash-lb-props-preview-content.prop-mode .mdash-lb-preview-card-wrapper * { cursor: crosshair; transition: outline 0.12s, background-color 0.12s; }';
    css += '#mdash-lb-props-preview-content.prop-mode .mdash-lb-preview-card-wrapper *:hover { outline: 2px solid rgba(124,58,237,0.45); outline-offset: -1px; background-color: rgba(124,58,237,0.04); }';
    css += '#mdash-lb-props-preview-content.prop-mode .mdash-lb-prop-selected { outline: 3px solid #7c3aed !important; outline-offset: -1px; background-color: rgba(124,58,237,0.08) !important; }';
    // ===== PROP MODE INSPECTOR (estilo DevTools: 1 etiqueta flutuante no hover) =====
    css += '#mdash-lb-props-preview-content.prop-mode .mdash-lb-preview-card-wrapper [data-lb-badge-empty] { min-height: 30px; min-width: 48px; border: 1px dashed rgba(124,58,237,0.45); background: repeating-linear-gradient(-45deg, transparent, transparent 5px, rgba(124,58,237,0.05) 5px, rgba(124,58,237,0.05) 10px); display: inline-block; box-sizing: border-box; }';
    css += '.mdash-lb-prop-hover-label { position: fixed; z-index: 10030; display: none; pointer-events: none; font-size: 10px; font-weight: 600; font-family: "SF Mono", "Fira Code", Consolas, monospace; line-height: 1; white-space: nowrap; padding: 3px 7px; border-radius: 5px; background: #7c3aed; color: #fff; box-shadow: 0 4px 12px rgba(124,58,237,0.35); }';
    css += '.mdash-lb-prop-hover-label .lbl-tag { opacity: 0.7; }';
    css += '.mdash-lb-prop-hover-label .lbl-cls { color: #ede9fe; }';
    css += '.mdash-lb-prop-popover-list { margin: 0 0 10px; padding: 0; list-style: none; max-height: 140px; overflow-y: auto; }';
    css += '.mdash-lb-prop-popover-list li { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 6px 8px; border-radius: 8px; background: #f8fafc; border: 1px solid var(--md-border); margin-bottom: 4px; font-size: 11px; }';
    css += '.mdash-lb-prop-popover-list li .prop-name { font-weight: 700; color: var(--md-text); }';
    css += '.mdash-lb-prop-popover-list li .prop-type { font-size: 10px; color: var(--md-muted); }';
    css += '.mdash-lb-prop-popover-add { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }';
    css += '.mdash-lb-prop-check { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--md-text); cursor: pointer; margin: 0; }';
    css += '.mdash-lb-prop-check input[type="checkbox"] { width: 14px; height: 14px; margin: 0; accent-color: #7c3aed; cursor: pointer; }';
    css += '.mdash-lb-color-sources { display: flex; flex-direction: column; gap: 5px; padding: 6px 8px; border: 1px solid rgba(15,23,42,0.08); border-radius: 8px; background: #f8fafc; margin-bottom: 4px; }';
    css += '.mdash-lb-props-hero { background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.06)); border: 1px solid rgba(124,58,237,0.18); border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }';
    css += '.mdash-lb-props-hero h6 { margin: 0 0 6px; font-size: 12px; font-weight: 800; color: #5b21b6; }';
    css += '.mdash-lb-props-hero p { margin: 0; font-size: 11px; line-height: 1.5; color: var(--md-muted); }';
    css += '.mdash-lb-props-legend { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; font-size: 10px; font-weight: 700; }';
    css += '.mdash-lb-props-legend span { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; background: #fff; border: 1px solid var(--md-border); }';
    css += '.mdash-lb-prop-quick-add { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }';
    css += '.mdash-lb-prop-quick-add .btn { border-radius: 999px; font-size: 11px; font-weight: 700; padding: 4px 12px; }';
    css += '.mdash-lb-prop-tile { display: flex; gap: 10px; align-items: flex-start; border: 1px solid var(--md-border); border-radius: 12px; padding: 12px; margin-bottom: 10px; background: #fff; box-shadow: 0 2px 8px rgba(15,23,42,0.04); }';
    css += '.mdash-lb-prop-tile-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; color: #fff; background: #7c3aed; }';
    css += '.mdash-lb-prop-tile-icon.is-color { padding: 0; overflow: hidden; }';
    css += '.mdash-lb-prop-tile-icon.is-color .mdash-lb-prop-swatch-lg { width: 100%; height: 100%; border-radius: 10px; border: none; }';
    css += '.mdash-lb-prop-tile-body { flex: 1; min-width: 0; }';
    css += '.mdash-lb-prop-tile-title { font-size: 13px; font-weight: 800; color: var(--md-text); margin: 0 0 2px; }';
    css += '.mdash-lb-prop-tile-desc { font-size: 11px; color: var(--md-muted); margin: 0 0 6px; line-height: 1.4; }';
    css += '.mdash-lb-prop-tile-meta { font-size: 10px; color: #7c3aed; font-weight: 700; }';
    css += '.mdash-lb-prop-tile-actions { display: flex; flex-direction: column; gap: 4px; }';
    css += '.mdash-lb-prop-advanced { margin-top: 8px; border-top: 1px dashed var(--md-border); padding-top: 8px; }';
    css += '.mdash-lb-prop-advanced summary { font-size: 10px; font-weight: 700; color: var(--md-muted); cursor: pointer; margin-bottom: 6px; }';
    css += '.mdash-lb-prop-empty-cta { text-align: center; padding: 20px 12px; border: 2px dashed rgba(124,58,237,0.25); border-radius: 12px; background: rgba(124,58,237,0.03); }';
    css += '.mdash-lb-prop-empty-cta p { font-size: 12px; color: var(--md-muted); margin: 8px 0 12px; }';
    css += '.mdash-lb-prop-popover .mdash-lb-prop-help { font-size: 11px; color: var(--md-muted); margin: -4px 0 10px; line-height: 1.45; }';
    css += '.mdash-lb-prop-popover .mdash-lb-prop-effect-preview { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.15); margin-bottom: 10px; font-size: 11px; color: #5b21b6; }';
    css += '.mdash-lb-prop-color-row { display: flex; align-items: center; gap: 8px; }';
    css += '.mdash-lb-prop-color-row input[type="color"] { width: 44px; height: 36px; padding: 2px; border-radius: 8px; border: 1px solid rgba(124,58,237,0.35); cursor: pointer; }';
    css += '.mdash-lb-prop-color-row input[type="text"] { flex: 1; }';
    css += '.mdash-lb-prop-popover { background: var(--md-surface, #fff); border: 1px solid var(--md-border); border-radius: 12px; box-shadow: 0 16px 40px rgba(2,6,23,0.22); padding: 16px; min-width: 260px; max-width: 320px; max-height: calc(100vh - 24px); overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; }';
    css += '.mdash-lb-prop-popover h6 { margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; }';
    css += '.mdash-lb-prop-popover .mdash-lb-prop-el-info { font-size: 10px; color: var(--md-muted); margin-bottom: 10px; font-family: monospace; background: rgba(124,58,237,0.06); padding: 5px 10px; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid var(--md-border); }';
    css += '.mdash-lb-prop-popover .form-group { margin-bottom: 8px; }';
    css += '.mdash-lb-prop-popover label { font-size: 11px; font-weight: 700; color: var(--md-muted); display: block; margin-bottom: 3px; }';
    css += '.mdash-lb-prop-popover input, .mdash-lb-prop-popover select { font-size: 12px; border-radius: 8px; border: 1px solid rgba(124,58,237,0.35); padding: 6px 10px; width: 100%; box-sizing: border-box; background: #fff; color: #1f2937; }';
    css += '.mdash-lb-prop-popover-actions { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }';
    css += '.mdash-lb-prop-pick-hint { font-size: 10px; color: #7c3aed; margin-top: 6px; font-weight: 600; }';
    // ===== EDITOR DE OPÇÕES (select / variantes) =====
    css += '.mdash-lb-sel-prefix-row { display: flex; gap: 4px; align-items: center; }';
    css += '.mdash-lb-sel-prefix-row input { flex: 1; }';
    css += '.mdash-lb-opt-hint { font-size: 10px; color: #64748b; margin: 2px 0 6px; }';
    css += '.mdash-lb-opt-head { display: flex; align-items: center; gap: 4px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }';
    css += '.mdash-lb-opt-head span:nth-child(1) { flex: 0 0 16px; }';
    css += '.mdash-lb-opt-head span:nth-child(2) { flex: 1 1 52%; }';
    css += '.mdash-lb-opt-head span:nth-child(3) { flex: 1 1 40%; }';
    css += '.mdash-lb-opt-head span:nth-child(4) { flex: 0 0 26px; }';
    css += '#mdash-lb-prop-options-list { display: flex; flex-direction: column; gap: 4px; margin: 4px 0; max-height: 160px; overflow-y: auto; }';
    css += '.mdash-lb-opt-row { display: flex; align-items: center; gap: 4px; }';
    css += '.mdash-lb-opt-row .mdash-lb-opt-default { flex: 0 0 16px; margin: 0; cursor: pointer; }';
    css += '.mdash-lb-opt-row .mdash-lb-opt-label { flex: 1 1 52%; min-width: 0; font-weight: 600; }';
    css += '.mdash-lb-opt-row .mdash-lb-opt-value { flex: 1 1 40%; min-width: 0; font-family: "SF Mono", Consolas, monospace; font-size: 11px; color: #64748b; background: #f8fafc; }';
    css += '.mdash-lb-opt-row .mdash-lb-opt-remove { flex: 0 0 26px; padding: 2px 6px; }';
    css += '.mdash-lb-prop-behavior-row.is-picking-target { outline: 2px solid #7c3aed; border-radius: 8px; padding: 6px; background: rgba(124,58,237,0.06); }';
    css += '.mdash-lb-prop-mark-btn { font-size: 10px; padding: 2px 8px; }';

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

    // ===== PAINEL DE TOKENS DE TEMA (separador CSS) =====
    css += '.mdash-lb-css-tokens { background: #1e1e2e; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 6px 10px; }';
    css += '.mdash-lb-tokens-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }';
    css += '.mdash-lb-tokens-lbl { font-size: 10px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }';
    css += '.mdash-lb-tokens-lbl .glyphicon { font-size: 10px; margin-right: 3px; }';
    css += '.mdash-lb-token-variants { display: inline-flex; background: rgba(255,255,255,0.06); border-radius: 6px; padding: 2px; }';
    css += '.mdash-lb-token-variant { border: none; background: transparent; color: #cbd5e1; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; cursor: pointer; transition: all 0.12s; }';
    css += '.mdash-lb-token-variant:hover { color: #fff; }';
    css += '.mdash-lb-token-variant.is-active { background: #7c3aed; color: #fff; }';
    css += '.mdash-lb-token-help-btn { margin-left: auto; border: none; background: transparent; color: #94a3b8; cursor: pointer; padding: 2px 4px; }';
    css += '.mdash-lb-token-help-btn:hover { color: #a5b4fc; }';
    css += '.mdash-lb-tokens-chips { display: flex; flex-wrap: wrap; gap: 5px; }';
    css += '.mdash-lb-token-chip { display: inline-flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); color: #e2e8f0; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; cursor: pointer; transition: all 0.12s; font-family: "SF Mono", Consolas, monospace; }';
    css += '.mdash-lb-token-chip:hover { border-color: #7c3aed; background: rgba(124,58,237,0.18); color: #fff; transform: translateY(-1px); }';
    css += '.mdash-lb-token-chip .swatch { width: 12px; height: 12px; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2); }';
    css += '.mdash-lb-token-chip .swatch-self { background: conic-gradient(#2563eb, #16a34a, #f59e0b, #dc2626, #2563eb); }';
    css += '.mdash-lb-tokens-help { margin-top: 8px; padding: 8px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; font-size: 11px; color: #cbd5e1; }';
    css += '.mdash-lb-tokens-help p { margin: 0 0 6px; }';
    css += '.mdash-lb-tokens-help ul { margin: 0 0 6px; padding-left: 16px; }';
    css += '.mdash-lb-tokens-help li { margin-bottom: 2px; }';
    css += '.mdash-lb-tokens-help code { background: rgba(124,58,237,0.22); color: #e9d5ff; padding: 1px 5px; border-radius: 4px; font-size: 10px; }';
    css += '.mdash-lb-tokens-help .mdash-lb-tokens-ex { margin-top: 4px; color: #94a3b8; }';

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
    updateLayoutPropsPreview();
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
        renderCssTokensBar();
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

    // Props JSON Editor
    var propsEl = document.getElementById('mdash-lb-ace-props');
    if (propsEl && !editors.props) {
        editors.props = ace.edit(propsEl);
        editors.props.setTheme("ace/theme/monokai");
        editors.props.session.setMode("ace/mode/json");
        editors.props.setOptions({ fontSize: "12px", wrap: true, showPrintMargin: false });
        editors.props.on('change', debounceLayoutPropsSync);
    }
}

function destroyLayoutBuilderAceEditors() {
    var editors = GLayoutBuilderState.aceEditors;
    if (editors.html) { editors.html.destroy(); editors.html = null; }
    if (editors.css) { editors.css.destroy(); editors.css = null; }
    if (editors.js) { editors.js.destroy(); editors.js = null; }
    if (editors.slots) { editors.slots.destroy(); editors.slots = null; }
    if (editors.props) { editors.props.destroy(); editors.props = null; }
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
    if (editors.props) {
        var propsJson = '[]';
        try {
            propsJson = JSON.stringify(layout.props || [], null, 2);
        } catch (e2) { /* ignore */ }
        editors.props.setValue(propsJson, -1);
    }
    renderLayoutPropsBuilder(layout);
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
    if (editors.props) {
        var propsVal = editors.props.getValue();
        layout.propsdefinition = propsVal;
        layout.props = forceJSONParse(propsVal, []);
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
// ============================================================================
// LAYOUT BUILDER - PAINEL DE TOKENS DE TEMA (CSS)
// ============================================================================

var LB_CSS_TOKEN_TYPES = [
    { type: 'primary', fallback: '#2563eb' },
    { type: 'success', fallback: '#16a34a' },
    { type: 'warning', fallback: '#f59e0b' },
    { type: 'danger', fallback: '#dc2626' },
    { type: 'info', fallback: '#0ea5e9' }
];

function lbTokenSwatchColor(type, fallback) {
    try {
        if (typeof getColorByType === 'function') {
            var c = getColorByType(type);
            if (c && c.background) return c.background;
        }
    } catch (e) { /* fallback */ }
    return fallback || '#64748b';
}

function lbInsertCssToken(token) {
    var ed = GLayoutBuilderState.aceEditors.css;
    if (!ed) return;
    ed.session.insert(ed.getCursorPosition(), token);
    ed.focus();
}

function renderCssTokensBar() {
    var $bar = $('#mdash-lb-css-tokens');
    if (!$bar.length) return;

    var h = '';
    h += '<div class="mdash-lb-tokens-row">';
    h += '  <span class="mdash-lb-tokens-lbl"><i class="glyphicon glyphicon-tint"></i> Tokens de tema</span>';
    h += '  <div class="mdash-lb-token-variants">';
    h += '    <button type="button" class="mdash-lb-token-variant is-active" data-variant="">fundo</button>';
    h += '    <button type="button" class="mdash-lb-token-variant" data-variant=".text">texto</button>';
    h += '    <button type="button" class="mdash-lb-token-variant" data-variant=".rgb">rgb</button>';
    h += '  </div>';
    h += '  <button type="button" class="mdash-lb-token-help-btn" title="Como funcionam os tokens"><i class="glyphicon glyphicon-question-sign"></i></button>';
    h += '</div>';

    h += '<div class="mdash-lb-tokens-chips">';
    LB_CSS_TOKEN_TYPES.forEach(function (t) {
        h += '<button type="button" class="mdash-lb-token-chip" data-token-type="' + t.type + '">'
            + '<span class="swatch" style="background:' + lbTokenSwatchColor(t.type, t.fallback) + '"></span>' + t.type + '</button>';
    });
    h += '<button type="button" class="mdash-lb-token-chip mdash-lb-token-self" data-token-type="self" title="Usa o tipo do pr\u00f3prio card (primary/warning/...)">'
        + '<span class="swatch swatch-self"></span>self</button>';
    h += '</div>';

    h += '<div class="mdash-lb-tokens-help" style="display:none;">';
    h += '  <p>Escreve tokens no CSS; s\u00e3o resolvidos no render com o tema PHC (acompanham o tema automaticamente).</p>';
    h += '  <ul>';
    h += '    <li><code>{{primary}}</code> \u2192 cor de fundo do tipo</li>';
    h += '    <li><code>{{primary.text}}</code> \u2192 cor de texto do tipo</li>';
    h += '    <li><code>{{primary.rgb}}</code> \u2192 <code>r,g,b</code> (para <code>rgba()</code>/gradientes)</li>';
    h += '    <li><code>{{self}}</code> / <code>{{self.rgb}}</code> \u2192 usa o tipo do pr\u00f3prio card</li>';
    h += '    <li><code>{{getColorByType("warning").text}}</code> \u2192 forma expl\u00edcita</li>';
    h += '  </ul>';
    h += '  <p class="mdash-lb-tokens-ex">Ex.: <code>background: linear-gradient(135deg, {{self}}, rgba({{self.rgb}},0.6));</code></p>';
    h += '</div>';

    $bar.html(h);
    bindCssTokensBar();
    var ed = GLayoutBuilderState.aceEditors && GLayoutBuilderState.aceEditors.css;
    if (ed && ed.resize) setTimeout(function () { ed.resize(); }, 0);
}

function bindCssTokensBar() {
    var $bar = $('#mdash-lb-css-tokens');
    if (!$bar.length) return;

    $bar.off('click.tokvariant', '.mdash-lb-token-variant').on('click.tokvariant', '.mdash-lb-token-variant', function () {
        $bar.find('.mdash-lb-token-variant').removeClass('is-active');
        $(this).addClass('is-active');
    });

    $bar.off('click.tokchip', '.mdash-lb-token-chip').on('click.tokchip', '.mdash-lb-token-chip', function () {
        var type = $(this).data('token-type');
        var variant = $bar.find('.mdash-lb-token-variant.is-active').data('variant') || '';
        lbInsertCssToken('{{' + type + variant + '}}');
    });

    $bar.off('click.tokhelp', '.mdash-lb-token-help-btn').on('click.tokhelp', '.mdash-lb-token-help-btn', function () {
        $bar.find('.mdash-lb-tokens-help').slideToggle(120);
    });
}

function scopeCssToPreview(css) {
    // Resolve tokens de tema {{primary}}, {{getColorByType("warning")}}, {{self.rgb}}…
    if (typeof mdashResolveThemeTokensInCss === 'function') {
        var layout = getSelectedLayout();
        var tipo = (layout && layout.UIData && layout.UIData.tipo) || 'primary';
        css = mdashResolveThemeTokensInCss(css, { tipo: tipo });
    }
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
    if (GLayoutBuilderState.syncingFromSlotMode || GLayoutBuilderState.syncingFromPropMode) return;

    var $preview = $('.mdash-lb-preview-card-wrapper');
    if (!$preview.length) return;

    var editors = GLayoutBuilderState.aceEditors;
    var htmlVal = editors.html ? editors.html.getValue() : '';
    var cssVal = editors.css ? editors.css.getValue() : '';

    if (!htmlVal && !cssVal) {
        var emptyHtml = '<div class="mdash-lb-empty-state" style="height:200px;">' +
            '  <i class="glyphicon glyphicon-eye-open"></i>' +
            '  <p>Escreva HTML para ver a pré-visualização</p>' +
            '</div>';
        $('.mdash-lb-preview-card-wrapper').each(function () {
            if (!$(this).hasClass('mdash-lb-preview-css-mirror') && !$(this).hasClass('mdash-lb-preview-js-mirror')) {
                $(this).html(emptyHtml);
            }
        });
        return;
    }

    // Remove estilos anteriores do preview
    $('#mdash-lb-preview-injected-css, #mdash-lb-props-preview-injected-css').remove();

    // Carrega CDNs via loader central (deduplicated — reutiliza os já carregados)
    var layout = getSelectedLayout();
    if (layout) {
        ensureMdashCDNsLoaded(layout.cssCdnsList, layout.jsCdnsList);
    }

    var scopedCss = '';
    if (cssVal) {
        scopedCss = scopeCssToPreview(cssVal);
        $('head').append('<style id="mdash-lb-preview-injected-css">' + scopedCss + '</style>');
        $('head').append('<style id="mdash-lb-props-preview-injected-css">' + scopedCss + '</style>');
    }

    var previewHtml = '<div data-mdash-scope="lb-preview">' + htmlVal + '</div>';
    $preview.each(function () {
        var $el = $(this);
        if ($el.hasClass('mdash-lb-preview-css-mirror') || $el.hasClass('mdash-lb-preview-js-mirror')) return;
        $el.html(previewHtml);
    });

    if (GLayoutBuilderState.slotModeActive) {
        injectSlotModeBadges();
    }
    if (GLayoutBuilderState.propModeActive) {
        injectPropModeHighlights();
    } else {
        refreshPropsPreviewChrome();
    }

    // JS is NOT auto-executed in preview for safety - only on explicit "Run JS" action
}

function updateLayoutPropsPreview() {
    updateLayoutPreview();
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
// LAYOUT BUILDER - PROPRIEDADES DINÂMICAS (schema + behaviors)
// ============================================================================

function debounceLayoutPropsSync() {
    if (GLayoutBuilderState.propsDebounceTimer) {
        clearTimeout(GLayoutBuilderState.propsDebounceTimer);
    }
    GLayoutBuilderState.propsDebounceTimer = setTimeout(function () {
        syncPropsEditorToLayout();
    }, 350);
}

function syncPropsEditorToLayout() {
    if (GLayoutBuilderState.syncingPropsEditor) return;
    var layout = getSelectedLayout();
    var editors = GLayoutBuilderState.aceEditors;
    if (!layout || !editors.props) return;
    try {
        layout.props = forceJSONParse(editors.props.getValue(), []);
        layout.propsdefinition = JSON.stringify(layout.props);
        renderLayoutPropsBuilder(layout);
    } catch (err) {
        console.warn('[Layout Builder] JSON de propriedades inválido:', err);
    }
}

function lbGetPropTypeMeta(type) {
    var icon = '?';
    var label = type || '';
    if (type === 'color') { icon = '\u25FC'; label = 'Cor'; }
    else if (type === 'text') { icon = 'T'; label = 'Texto'; }
    else if (type === 'number') { icon = '#'; label = 'N\u00famero'; }
    else if (type === 'boolean') { icon = '\u2713'; label = 'Sim/N\u00e3o'; }
    else if (type === 'icon') { icon = '\u2605'; label = '\u00cdcone'; }
    else if (type === 'select') { icon = '\u25BE'; label = 'Lista'; }
    var result = {};
    result.icon = icon;
    result.label = label;
    return result;
}

function lbMakePropStub(id, propType) {
    var o = {};
    o.id = id;
    o.type = propType;
    return o;
}

var LB_PROP_TARGET_ATTR = 'data-mdash-prop-target';

function lbPropTargetSelector(targetId) {
    return '[' + LB_PROP_TARGET_ATTR + '="' + targetId + '"]';
}

function lbMigrateElementPropAttribute(element) {
    if (!element || !element.getAttribute) return;
    var legacy = element.getAttribute('data-mdash-prop');
    if (legacy && !element.getAttribute(LB_PROP_TARGET_ATTR)) {
        element.setAttribute(LB_PROP_TARGET_ATTR, legacy);
    }
    if (element.getAttribute(LB_PROP_TARGET_ATTR) || legacy) {
        element.removeAttribute('data-mdash-prop');
    }
}

function lbSlugifyPropTargetId(element, layout) {
    var base = suggestPropName(element) || 'target';
    var existing = {};
    var $w = getPropsPreviewWrapper();
    if ($w.length) {
        $w.find('[' + LB_PROP_TARGET_ATTR + ']').each(function () {
            var t = $(this).attr(LB_PROP_TARGET_ATTR);
            if (t) existing[t] = true;
        });
    }
    var candidate = base;
    var n = 2;
    while (existing[candidate]) {
        candidate = base + '_' + n;
        n++;
    }
    return candidate;
}

function lbEnsurePropTargetOnElement(element, layout) {
    lbMigrateElementPropAttribute(element);
    var targetId = element.getAttribute(LB_PROP_TARGET_ATTR);
    if (!targetId) {
        targetId = lbSlugifyPropTargetId(element, layout);
        element.setAttribute(LB_PROP_TARGET_ATTR, targetId);
    }
    return targetId;
}

/** Devolve o targetId do elemento sem escrever o atributo (a não ser que create=true). */
function lbResolvePropTargetId(element, layout, create) {
    lbMigrateElementPropAttribute(element);
    var targetId = element.getAttribute(LB_PROP_TARGET_ATTR);
    if (targetId) return targetId;
    targetId = lbSlugifyPropTargetId(element, layout);
    if (create) element.setAttribute(LB_PROP_TARGET_ATTR, targetId);
    return targetId;
}

/** Remove atributos de alvo de elementos que não têm qualquer propriedade associada. */
function lbStripOrphanPropTargets($wrapper, layout) {
    if (!$wrapper || !$wrapper.length) return false;
    var changed = false;
    $wrapper.find('[' + LB_PROP_TARGET_ATTR + ']').each(function () {
        var targetId = $(this).attr(LB_PROP_TARGET_ATTR);
        if (!targetId) return;
        var has = layout && Array.isArray(layout.props) && layout.props.some(function (p) {
            return p && lbGetPropTargetId(p) === targetId;
        });
        if (!has) {
            $(this).removeAttr(LB_PROP_TARGET_ATTR);
            changed = true;
        }
    });
    return changed;
}

function lbGetPropTargetId(propDef) {
    if (propDef && propDef.targetId) return propDef.targetId;
    if (!propDef || !Array.isArray(propDef.behaviors) || !propDef.behaviors.length) return '';
    var t = propDef.behaviors[0].target || '';
    var m = t.match(/\[data-mdash-prop-target="([^"]+)"\]/);
    if (m) return m[1];
    m = t.match(/\[data-mdash-prop="([^"]+)"\]/);
    if (m) return m[1];
    return '';
}

function lbSetPropTarget(propDef, targetId, element) {
    if (!propDef || !targetId) return;
    propDef.targetId = targetId;
    var sel = lbPropTargetSelector(targetId);
    var behaviors = lbInferDefaultBehaviorsForProp(propDef, sel, element);
    if (Array.isArray(propDef.behaviors) && propDef.behaviors.length) {
        behaviors.forEach(function (b, i) {
            var prev = propDef.behaviors[i];
            if (prev) {
                if (prev.kind) b.kind = prev.kind;
                if (prev.property) b.property = prev.property;
                if (prev.varName) b.varName = prev.varName;
                if (prev.iconLibrary) b.iconLibrary = prev.iconLibrary;
                if (prev.classPrefix) b.classPrefix = prev.classPrefix;
            }
            b.target = sel;
        });
    }
    propDef.behaviors = behaviors;
}

function lbGetPropsForTarget(layout, targetId) {
    if (!layout || !Array.isArray(layout.props) || !targetId) return [];
    return layout.props.filter(function (p) {
        return p && lbGetPropTargetId(p) === targetId;
    });
}

function lbMigrateLayoutPropTargets($wrapper, layout) {
    if (!$wrapper || !$wrapper.length || !layout) return false;
    var changed = false;
    $wrapper.find('[data-mdash-prop]').each(function () {
        lbMigrateElementPropAttribute(this);
        changed = true;
    });
    (layout.props || []).forEach(function (p) {
        if (!p) return;
        var tid = lbGetPropTargetId(p);
        var oldSel = '[data-mdash-prop="' + (p.id || '') + '"]';
        if (Array.isArray(p.behaviors)) {
            p.behaviors.forEach(function (b) {
                if (!b) return;
                if (b.target === oldSel || (b.target && b.target.indexOf('data-mdash-prop=') >= 0 && b.target.indexOf('data-mdash-prop-target') < 0)) {
                    var useId = tid || p.id;
                    if (useId) {
                        b.target = lbPropTargetSelector(useId);
                        if (!p.targetId) p.targetId = useId;
                        changed = true;
                    }
                }
            });
        }
        if (!p.targetId && p.id) {
            var $el = $wrapper.find(lbPropTargetSelector(p.id) + ', [data-mdash-prop="' + p.id + '"]');
            if ($el.length) {
                p.targetId = p.id;
                lbSetPropTarget(p, p.id, $el[0]);
                changed = true;
            }
        }
    });
    if (changed) layout.propsdefinition = JSON.stringify(layout.props || []);
    return changed;
}

function lbBuildColorDefaultFieldHtml(value, inputId, includeThemeColors) {
    if (typeof buildMdashLayoutColorPickerHtml === 'function') {
        return buildMdashLayoutColorPickerHtml(value || 'var(--md-primary)', inputId || 'mdash-lb-prop-default-input', includeThemeColors);
    }
    var v = value || '#3b82f6';
    return '<div class="mdash-lb-prop-color-row"><input type="color" id="mdash-lb-prop-default-color" value="' + v + '" /><input type="text" id="mdash-lb-prop-default-input" value="' + v + '" /></div>';
}

function lbBindColorDefaultField($scope) {
    $scope = $scope || $(document);
    if (typeof bindMdashLayoutColorPicker === 'function') {
        bindMdashLayoutColorPicker($scope);
    }
    $scope.find('#mdash-lb-prop-default-color').off('input change').on('input change', function () {
        $('#mdash-lb-prop-default-input').val($(this).val());
    });
}

function lbSanitizeIconValue(value) {
    var v = $.trim(String(value || ''));
    if (!v || /^(material-symbols(-(rounded|outlined|sharp))?|material-icons)$/.test(v)) return 'star';
    return v;
}

function lbBuildIconDefaultFieldHtml(value, inputId, iconClass) {
    if (typeof buildMdashLayoutIconPickerHtml === 'function') {
        return buildMdashLayoutIconPickerHtml(lbSanitizeIconValue(value), inputId || 'mdash-lb-prop-default-input', iconClass);
    }
    return '<input type="text" id="' + (inputId || 'mdash-lb-prop-default-input') + '" value="' + lbSanitizeIconValue(value) + '" />';
}

function lbBindIconDefaultField($scope) {
    if (typeof bindMdashLayoutIconPicker === 'function') {
        bindMdashLayoutIconPicker($scope || $(document));
    }
}

// ============================================================================
// LAYOUT BUILDER - PROPRIEDADE SELECT / VARIANTES (lista de classes)
// ============================================================================

var LB_VARIANT_LABELS = {
    primary: 'Primary', secondary: 'Secondary', success: 'Sucesso',
    danger: 'Perigo', warning: 'Aviso', info: 'Info', light: 'Claro', dark: 'Escuro'
};

function lbEscapeRegex(s) {
    return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lbPrettyOptionLabel(value) {
    var v = String(value || '');
    if (LB_VARIANT_LABELS[v]) return LB_VARIANT_LABELS[v];
    return v.charAt(0).toUpperCase() + v.slice(1).replace(/[-_]+/g, ' ');
}

/** Sugere o prefixo de classe a partir da 1ª classe do elemento (ex: dashboard-card--). */
function lbGuessVariantPrefix(element) {
    if (!element) return 'variant--';
    var cls = (element.className || '').replace(/mdash-lb-[\w-]+/g, '').trim();
    var first = cls.split(/\s+/)[0];
    if (first) return first + '--';
    var tag = element.tagName ? element.tagName.toLowerCase() : 'variant';
    return tag + '--';
}

/** Varre o CSS do layout à procura de classes com o prefixo dado -> [{value,label}]. */
function lbScanCssForClassOptions(prefix) {
    var out = [];
    if (!prefix) return out;
    var editors = GLayoutBuilderState.aceEditors;
    var css = editors && editors.css ? editors.css.getValue() : '';
    if (!css) return out;
    var re = new RegExp('\\.' + lbEscapeRegex(prefix) + '([A-Za-z0-9_-]+)', 'g');
    var seen = {};
    var m;
    while ((m = re.exec(css)) !== null) {
        var val = m[1];
        if (val && !seen[val]) { seen[val] = 1; out.push({ value: val, label: lbPrettyOptionLabel(val) }); }
    }
    return out;
}

function lbBuildOptionRowHtml(opt, checked) {
    var val = (opt && opt.value != null) ? opt.value : '';
    var label = (opt && opt.label != null) ? opt.label : lbPrettyOptionLabel(val);
    var h = '<div class="mdash-lb-opt-row">';
    h += '<input type="radio" name="mdash-lb-opt-default" class="mdash-lb-opt-default" value="' + val + '"' + (checked ? ' checked' : '') + ' title="Op\u00e7\u00e3o por defeito" />';
    h += '<input type="text" class="mdash-lb-opt-label" value="' + label + '" placeholder="Nome vis\u00edvel (ex: Perigo)" title="O que o utilizador l\u00ea" />';
    h += '<input type="text" class="mdash-lb-opt-value" value="' + val + '" placeholder="classe" title="Classe CSS (t\u00e9cnico)" />';
    h += '<button type="button" class="btn btn-xs btn-danger mdash-lb-opt-remove" title="Remover"><i class="glyphicon glyphicon-remove"></i></button>';
    h += '</div>';
    return h;
}

function lbBuildSelectOptionsFieldHtml(editingProp, element, omitDefaultInput) {
    var prefix = '';
    var options = [];
    var defVal = '';
    if (editingProp) {
        defVal = lbSelectDefaultScalar(editingProp);
        // fonte "classes" de uma propriedade de cor guarda as opções em sources.classes
        if (editingProp.sources && editingProp.sources.classes) {
            if (Array.isArray(editingProp.sources.classes.options) && editingProp.sources.classes.options.length) {
                options = editingProp.sources.classes.options.slice();
            }
            if (editingProp.sources.classes.classPrefix) prefix = editingProp.sources.classes.classPrefix;
        }
        if (!options.length && Array.isArray(editingProp.options)) options = editingProp.options.slice();
        if (!prefix && editingProp.classPrefix) prefix = editingProp.classPrefix;
        else if (!prefix && Array.isArray(editingProp.behaviors) && editingProp.behaviors[0] && editingProp.behaviors[0].classPrefix) {
            prefix = editingProp.behaviors[0].classPrefix;
        }
    }
    if (!prefix) prefix = lbGuessVariantPrefix(element);
    if (!options.length) {
        options = lbScanCssForClassOptions(prefix);
        if (!options.length) {
            options = [
                { value: 'primary', label: 'Primary' },
                { value: 'success', label: 'Sucesso' },
                { value: 'danger', label: 'Perigo' }
            ];
        }
    }
    if (!defVal && options.length) defVal = options[0].value;

    var h = '';
    h += '<label>Classe base (prefixo)</label>';
    h += '<div class="mdash-lb-sel-prefix-row">';
    h += '  <input type="text" id="mdash-lb-prop-classprefix" value="' + prefix + '" placeholder="ex: dashboard-card--" />';
    h += '  <button type="button" class="btn btn-xs btn-default" id="mdash-lb-prop-detect-classes" title="Detetar classes no CSS"><i class="glyphicon glyphicon-search"></i></button>';
    h += '</div>';
    h += '<label style="margin-top:6px;">Op\u00e7\u00f5es (o utilizador escolhe uma)</label>';
    h += '<p class="mdash-lb-opt-hint">O utilizador s\u00f3 v\u00ea o <b>Nome</b>. A classe \u00e9 t\u00e9cnica e fica escondida.</p>';
    h += '<div class="mdash-lb-opt-head"><span></span><span>Nome vis\u00edvel</span><span>Classe</span><span></span></div>';
    h += '<div id="mdash-lb-prop-options-list">';
    options.forEach(function (opt) {
        h += lbBuildOptionRowHtml(opt, String(opt.value) === String(defVal));
    });
    h += '</div>';
    h += '<button type="button" class="btn btn-xs btn-default" id="mdash-lb-prop-add-option" style="margin-top:4px;"><i class="glyphicon glyphicon-plus"></i> Adicionar op\u00e7\u00e3o</button>';
    if (!omitDefaultInput) {
        h += '<input type="hidden" id="mdash-lb-prop-default-input" value="' + defVal + '" />';
    }
    return h;
}

/** Extrai o valor de default (scalar) de uma prop select/classe (aceita {src,value}). */
function lbSelectDefaultScalar(prop) {
    if (!prop) return '';
    var d = prop['default'];
    if (d && typeof d === 'object' && d.src) return d.value != null ? d.value : '';
    return d != null ? d : '';
}

/** Extrai o valor de cor (scalar) para preview, aceitando {src,value} ou scalar legacy. */
function lbColorDefaultScalar(prop) {
    if (!prop) return 'var(--md-primary)';
    var d = prop['default'];
    if (d && typeof d === 'object' && d.src) {
        if (d.src === 'class') return 'var(--md-primary)';
        return d.value != null ? d.value : 'var(--md-primary)';
    }
    return d != null ? d : 'var(--md-primary)';
}

/** Recolhe opções + prefixo + default do editor de select no popover. */
function lbCollectSelectOptions() {
    var prefix = $.trim($('#mdash-lb-prop-classprefix').val() || '');
    var options = [];
    var chosen = $('input.mdash-lb-opt-default:checked').val();
    $('#mdash-lb-prop-options-list .mdash-lb-opt-row').each(function () {
        var val = $.trim($(this).find('.mdash-lb-opt-value').val() || '');
        if (!val) return;
        var label = $.trim($(this).find('.mdash-lb-opt-label').val() || '') || lbPrettyOptionLabel(val);
        options.push({ value: val, label: label });
    });
    var def = chosen || (options[0] && options[0].value) || '';
    return { classPrefix: prefix, options: options, 'default': def };
}

function lbBindSelectOptionsField($popover) {
    $popover.off('click.selAdd', '#mdash-lb-prop-add-option').on('click.selAdd', '#mdash-lb-prop-add-option', function () {
        $('#mdash-lb-prop-options-list').append(lbBuildOptionRowHtml({ value: '', label: '' }, false));
    });
    $popover.off('click.selRemove', '.mdash-lb-opt-remove').on('click.selRemove', '.mdash-lb-opt-remove', function () {
        $(this).closest('.mdash-lb-opt-row').remove();
        if (!$('input.mdash-lb-opt-default:checked').length) {
            $('input.mdash-lb-opt-default').first().prop('checked', true).trigger('change');
        }
    });
    $popover.off('change.selDefault', '.mdash-lb-opt-default').on('change.selDefault', '.mdash-lb-opt-default', function () {
        $('#mdash-lb-prop-default-input').val($(this).val());
    });
    $popover.off('input.selLabel', '.mdash-lb-opt-label').on('input.selLabel', '.mdash-lb-opt-label', function () {
        var $row = $(this).closest('.mdash-lb-opt-row');
        var $val = $row.find('.mdash-lb-opt-value');
        // Preenche a classe automaticamente a partir do nome (slug), até o designer a editar.
        if (!$.trim($val.val()) || $val.data('autoslug')) {
            var slug = String($(this).val() || '').toLowerCase()
                .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
                .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            $val.val(slug).data('autoslug', true);
            $row.find('.mdash-lb-opt-default').val(slug);
            if ($row.find('.mdash-lb-opt-default').is(':checked')) $('#mdash-lb-prop-default-input').val(slug);
        }
    });

    $popover.off('input.selValue', '.mdash-lb-opt-value').on('input.selValue', '.mdash-lb-opt-value', function () {
        var $row = $(this).closest('.mdash-lb-opt-row');
        $(this).data('autoslug', false);
        $row.find('.mdash-lb-opt-default').val($(this).val());
        if ($row.find('.mdash-lb-opt-default').is(':checked')) $('#mdash-lb-prop-default-input').val($(this).val());
    });
    $popover.off('click.selDetect', '#mdash-lb-prop-detect-classes').on('click.selDetect', '#mdash-lb-prop-detect-classes', function () {
        var prefix = $.trim($('#mdash-lb-prop-classprefix').val() || '');
        var found = lbScanCssForClassOptions(prefix);
        if (!found.length) {
            if (typeof alertify !== 'undefined') alertify.message('Nenhuma classe "' + prefix + '..." encontrada no CSS', 2500);
            return;
        }
        var $list = $('#mdash-lb-prop-options-list');
        $list.empty();
        found.forEach(function (opt, i) { $list.append(lbBuildOptionRowHtml(opt, i === 0)); });
        $('#mdash-lb-prop-default-input').val(found[0].value);
        if (typeof alertify !== 'undefined') alertify.success(found.length + ' op\u00e7\u00e3o(\u00f5es) detetada(s)', 2000);
    });
}

/**
 * Config das fontes de cor no popover do builder: tema PHC, estilos por classe
 * e cor personalizada. O utilizador final vê tudo numa única lista no editor.
 */
function lbBuildColorSourcesConfigHtml(editingProp, element) {
    var sources = (typeof mdashGetPropSources === 'function')
        ? mdashGetPropSources(editingProp || {})
        : { theme: { enabled: true }, classes: { enabled: false }, custom: { enabled: true } };
    // Retrocompat: uma prop nova (sem sources) arranca com tema + personalizada.
    if (!editingProp || (!editingProp.sources && editingProp.includeThemeColors === undefined && !editingProp.type)) {
        sources.theme.enabled = true; sources.custom.enabled = true;
    }
    var themeOn = sources.theme.enabled;
    var classesOn = sources.classes.enabled;
    var customOn = sources.custom.enabled;
    var colorScalar = lbColorDefaultScalar(editingProp);

    var h = '';
    h += '<label>Fontes de cor <span class="text-muted" style="font-weight:400;">(o utilizador escolhe numa única lista)</span></label>';
    h += '<div class="mdash-lb-color-sources">';
    h += '  <label class="mdash-lb-prop-check"><input type="checkbox" id="mdash-lb-src-theme"' + (themeOn ? ' checked' : '') + ' /> <span>Cores do tema PHC</span></label>';
    h += '  <label class="mdash-lb-prop-check"><input type="checkbox" id="mdash-lb-src-classes"' + (classesOn ? ' checked' : '') + ' /> <span>Estilos por classe (variantes)</span></label>';
    h += '  <label class="mdash-lb-prop-check"><input type="checkbox" id="mdash-lb-src-custom"' + (customOn ? ' checked' : '') + ' /> <span>Cor personalizada</span></label>';
    h += '</div>';

    h += '<div id="mdash-lb-src-classes-wrap" style="' + (classesOn ? '' : 'display:none;') + 'margin-top:6px;padding:8px;border:1px dashed rgba(124,58,237,0.3);border-radius:8px;background:rgba(124,58,237,0.03);">';
    h += lbBuildSelectOptionsFieldHtml(classesOn ? editingProp : null, element, true);
    h += '</div>';

    h += '<div id="mdash-lb-src-color-wrap" style="margin-top:6px;">';
    h += '  <label>Cor por defeito (exemplo)</label>';
    h += lbBuildColorDefaultFieldHtml(colorScalar, 'mdash-lb-prop-default-input', themeOn);
    h += '</div>';
    return h;
}

/** Recolhe as fontes de cor definidas no popover. */
function lbCollectColorSources() {
    var themeOn = $('#mdash-lb-src-theme').is(':checked');
    var classesOn = $('#mdash-lb-src-classes').is(':checked');
    var customOn = $('#mdash-lb-src-custom').is(':checked');
    if (!themeOn && !classesOn && !customOn) { customOn = true; }

    var sources = {
        theme: { enabled: themeOn },
        classes: { enabled: classesOn, classPrefix: '', options: [] },
        custom: { enabled: customOn }
    };

    var classDefault = '';
    if (classesOn) {
        var sel = lbCollectSelectOptions();
        sources.classes.classPrefix = sel.classPrefix;
        sources.classes.options = sel.options;
        classDefault = sel['default'] || (sel.options[0] && sel.options[0].value) || '';
    }

    // Valor por defeito: se houver classe escolhida e classes activo, usa classe; senão a cor.
    var colorVal = $.trim($('#mdash-lb-prop-default-input').val() || '') || 'var(--md-primary)';
    var def;
    if (classesOn && classDefault) {
        def = { src: 'class', value: classDefault };
    } else if (themeOn && colorVal.charAt(0) !== '#') {
        def = { src: 'theme', value: colorVal };
    } else {
        def = { src: 'custom', value: colorVal };
    }

    return { sources: sources, 'default': def };
}

function lbBindColorSourcesField($popover, element) {
    $popover.off('change.srcToggle', '#mdash-lb-src-classes').on('change.srcToggle', '#mdash-lb-src-classes', function () {
        var on = $(this).is(':checked');
        var $wrap = $('#mdash-lb-src-classes-wrap');
        if (on) {
            var editing = null;
            var editId = $.trim($('#mdash-lb-prop-id-input').val());
            var layout = getSelectedLayout();
            if (editId && layout && Array.isArray(layout.props)) {
                editing = layout.props.find(function (p) { return p && p.id === editId; }) || null;
            }
            $wrap.html(lbBuildSelectOptionsFieldHtml(editing, element, true)).show();
            lbBindSelectOptionsField($popover);
        } else {
            $wrap.hide();
        }
    });
    lbBindSelectOptionsField($popover);
    lbBindColorDefaultField($popover);
}

function lbSlugifyPropId(label, layout) {
    var base = String(label || 'prop').toLowerCase()
        .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!base || !/^[a-z]/.test(base)) base = 'prop_' + base;
    var props = (layout && layout.props) || [];
    var candidate = base;
    var n = 2;
    while (props.some(function (p) { return p && p.id === candidate; })) {
        candidate = base + '_' + n;
        n++;
    }
    return candidate;
}

function lbInferColorCssProperty(element) {
    if (!element || !element.tagName) return 'background-color';
    var tag = element.tagName.toLowerCase();
    var cls = (element.className || '').toString();
    if (tag === 'i' || cls.indexOf('material-icons') >= 0 || cls.indexOf('glyphicon') >= 0) return 'color';
    if (tag === 'span' || tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'label') return 'color';
    return 'background-color';
}

function lbHumanEffectLabel(propDef) {
    if (!propDef) return '';
    var type = propDef.type || 'text';
    var behaviors = propDef.behaviors || [];
    var b = behaviors[0] || {};
    if (type === 'color') {
        if (b.kind === 'setCssVariable') return 'Define uma variável de cor para o card inteiro';
        var propName = b.property || lbInferColorCssProperty(null);
        if (propName === 'color') return 'Muda a cor do texto/ícone do elemento marcado';
        return 'Muda a cor de fundo do elemento marcado';
    }
    if (type === 'icon') return 'Muda o ícone do elemento marcado';
    if (type === 'text') return 'Muda o texto do elemento marcado';
    if (type === 'number') return 'Define um valor numérico';
    if (type === 'boolean') return 'Liga/desliga uma opção visual';
    if (type === 'select') return 'Escolhe uma variante visual (ex: primary, success)';
    return 'Personaliza o aspecto do layout';
}

function lbDescribeBehaviorHuman(behavior) {
    if (!behavior) return '';
    var kind = behavior.kind || behavior.type || '';
    if (kind === 'setCssProperty') return 'Aplica ' + (behavior.property || 'estilo') + ' no elemento';
    if (kind === 'setCssVariable') return 'Variável CSS ' + (behavior.varName || '');
    if (kind === 'setIcon') return 'Altera o ícone';
    if (kind === 'setText') return 'Altera o texto';
    if (kind === 'toggleClass') return 'Alterna classe ' + (behavior.classPrefix || '');
    return kind;
}

function renderLayoutPropsBuilder(layout) {
    var $container = $('#mdash-lb-props-builder');
    if (!$container.length) return;

    layout = layout || getSelectedLayout();
    if (!layout) {
        $container.html('<div class="text-muted">Selecione um layout</div>');
        return;
    }

    var props = layout.props || forceJSONParse(layout.propsdefinition, []);
    var typeRegistry = typeof getMdashLayoutPropTypeRegistry === 'function'
        ? getMdashLayoutPropTypeRegistry() : {};

    var html = '<div class="mdash-lb-props-builder">';
    html += '<div class="mdash-lb-props-hero">';
    html += '  <h6><i class="glyphicon glyphicon-adjust"></i> Aparência personalizável</h6>';
    html += '  <p><b>Slots</b> = onde entram dados (título, números). <b>Propriedades</b> = o que o utilizador pode mudar visualmente (cores, ícones) em cada card do dashboard.</p>';
    html += '  <div class="mdash-lb-props-legend">';
    html += '    <span style="color:#2563eb;"><i class="glyphicon glyphicon-th"></i> Slots (conteúdo)</span>';
    html += '    <span style="color:#7c3aed;"><i class="glyphicon glyphicon-adjust"></i> Props (aparência)</span>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="mdash-lb-prop-quick-add">';
    html += '  <button type="button" class="btn btn-default btn-xs mdash-lb-prop-quick" data-quick-type="color" data-quick-label="Cor de fundo"><i class="glyphicon glyphicon-tint"></i> + Cor</button>';
    html += '  <button type="button" class="btn btn-default btn-xs mdash-lb-prop-quick" data-quick-type="icon" data-quick-label="Ícone"><i class="glyphicon glyphicon-star"></i> + Ícone</button>';
    html += '  <button type="button" class="btn btn-default btn-xs mdash-lb-prop-quick" data-quick-type="text" data-quick-label="Texto"><i class="glyphicon glyphicon-font"></i> + Texto</button>';
    html += '  <button type="button" class="btn btn-primary btn-xs" id="mdash-lb-prop-mode-start"><i class="glyphicon glyphicon-screenshot"></i> Marcar na pré-visualização</button>';
    html += '</div>';

    if (!props.length) {
        html += '<div class="mdash-lb-prop-empty-cta">';
        html += '  <i class="glyphicon glyphicon-hand-up" style="font-size:28px;color:#7c3aed;opacity:0.5;"></i>';
        html += '  <p>Ainda não há propriedades.<br/>Clique <b>Marcar na pré-visualização</b> e escolha um elemento à direita (ex: fundo do card, ícone).</p>';
        html += '  <button type="button" class="btn btn-sm" id="mdash-lb-prop-mode-start-empty" style="background:#7c3aed;color:#fff;border:none;"><i class="glyphicon glyphicon-screenshot"></i> Começar a marcar</button>';
        html += '</div>';
    }

    props.forEach(function (prop, idx) {
        if (!prop) return;
        var typeMeta = lbGetPropTypeMeta(prop.type || 'text');
        var defVal = prop.type === 'color'
            ? lbColorDefaultScalar(prop)
            : (prop.default != null ? prop.default : lbDefaultValueForPropType(prop.type));
        var effect = lbHumanEffectLabel(prop);

        html += '<div class="mdash-lb-prop-tile" data-prop-idx="' + idx + '">';
        html += '  <div class="mdash-lb-prop-tile-icon' + (prop.type === 'color' ? ' is-color' : '') + '">';
        if (prop.type === 'color') {
            var swatchStyle = typeof mdashLayoutColorSwatchStyle === 'function'
                ? mdashLayoutColorSwatchStyle(defVal || 'var(--md-primary)')
                : ('background:' + (defVal || '#3b82f6') + ';');
            html += '    <span class="mdash-lb-prop-swatch-lg" style="' + swatchStyle + ';"></span>';
        } else {
            html += typeMeta.icon;
        }
        html += '  </div>';
        html += '  <div class="mdash-lb-prop-tile-body">';
        html += '    <div class="mdash-lb-prop-tile-title">' + (prop.label || prop.id || ('Propriedade ' + (idx + 1))) + '</div>';
        html += '    <div class="mdash-lb-prop-tile-desc">' + effect + '</div>';
        html += '    <div class="mdash-lb-prop-tile-meta">' + typeMeta.label + (prop.targetId ? ' · alvo: ' + prop.targetId : '') + (prop.id ? ' · ' + prop.id : '') + '</div>';

        html += '    <div class="row" style="margin:8px -4px 0;">';
        html += '      <div class="col-xs-12" style="padding:0 4px;margin-bottom:6px;"><label>Nome no editor</label><input type="text" class="form-control input-sm mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="label" value="' + (prop.label || '') + '" /></div>';
        html += '      <div class="col-xs-6" style="padding:0 4px;margin-bottom:6px;"><label>Tipo</label><select class="form-control input-sm mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="type">';
        Object.keys(typeRegistry).forEach(function (typeKey) {
            html += '<option value="' + typeKey + '"' + (prop.type === typeKey ? ' selected' : '') + '>' + typeRegistry[typeKey].label + '</option>';
        });
        html += '      </select></div>';
        var tileSources = (typeof mdashGetPropSources === 'function') ? mdashGetPropSources(prop) : { theme: { enabled: prop.includeThemeColors !== false }, classes: { enabled: false, options: [] }, custom: { enabled: true } };
        var tileIncludeTheme = tileSources.theme.enabled;
        var tileColWidth = (prop.type === 'icon') ? 'col-xs-12' : 'col-xs-6';
        html += '      <div class="' + tileColWidth + '" style="padding:0 4px;margin-bottom:6px;"><label>Valor de exemplo</label>';
        if (prop.type === 'color') {
            html += lbBuildColorDefaultFieldHtml(defVal, 'mdash-lb-prop-def-' + idx, tileIncludeTheme);
            html += '<input type="hidden" class="mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="default" value="' + (defVal || 'var(--md-primary)') + '" />';
        } else if (prop.type === 'icon') {
            var tileIconVal = lbSanitizeIconValue(defVal);
            html += lbBuildIconDefaultFieldHtml(tileIconVal, 'mdash-lb-prop-def-' + idx, prop.iconClass);
            html += '<input type="hidden" class="mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="default" value="' + tileIconVal + '" />';
        } else {
            html += '<input type="text" class="form-control input-sm mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="default" value="' + (defVal != null ? defVal : '') + '" />';
        }
        html += '      </div>';
        if (prop.type === 'color') {
            html += '      <div class="col-xs-12" style="padding:0 4px;margin-bottom:6px;"><label class="mdash-lb-prop-check"><input type="checkbox" class="mdash-lb-prop-theme-toggle" data-prop-idx="' + idx + '"' + (tileIncludeTheme ? ' checked' : '') + ' /> <span>Incluir cores do tema PHC</span></label>';
            if (tileSources.classes.enabled && tileSources.classes.options.length) {
                html += '<div class="text-muted" style="font-size:10px;margin-top:2px;"><i class="glyphicon glyphicon-tags"></i> ' + tileSources.classes.options.length + ' estilo(s) por classe — edite ao marcar o elemento</div>';
            }
            html += '</div>';
        }
        html += '    </div>';

        html += '    <details class="mdash-lb-prop-advanced"><summary>Detalhes técnicos (opcional)</summary>';
        html += '      <div style="margin-bottom:6px;"><label>ID interno</label><input type="text" class="form-control input-sm mdash-lb-prop-field" data-prop-idx="' + idx + '" data-field="id" value="' + (prop.id || '') + '" /></div>';
        var behaviors = Array.isArray(prop.behaviors) ? prop.behaviors : [];
        behaviors.forEach(function (behavior, bIdx) {
            html += '<div class="mdash-lb-prop-behavior-row" data-prop-idx="' + idx + '" data-behavior-idx="' + bIdx + '">';
            html += '  <span class="text-muted" style="font-size:10px;min-width:100px;">' + lbDescribeBehaviorHuman(behavior) + '</span>';
            html += '  <button type="button" class="btn btn-primary btn-xs mdash-lb-prop-mark-target" data-prop-idx="' + idx + '" data-behavior-idx="' + bIdx + '" title="Re-marcar elemento"><i class="glyphicon glyphicon-screenshot"></i></button>';
            html += '  <button type="button" class="btn btn-danger btn-xs mdash-lb-prop-behavior-remove" data-prop-idx="' + idx + '" data-behavior-idx="' + bIdx + '"><i class="glyphicon glyphicon-minus"></i></button>';
            html += '</div>';
        });
        html += '    </details>';
        html += '  </div>';
        html += '  <div class="mdash-lb-prop-tile-actions">';
        html += '    <button type="button" class="btn btn-danger btn-xs mdash-lb-prop-remove" data-prop-idx="' + idx + '" title="Remover"><i class="glyphicon glyphicon-trash"></i></button>';
        html += '  </div>';
        html += '</div>';
    });

    html += '</div>';
    $container.html(html);
    bindLayoutPropsBuilderEvents();
    if (typeof bindMdashLayoutColorPicker === 'function') {
        bindMdashLayoutColorPicker($container);
    }
    if (typeof bindMdashLayoutIconPicker === 'function') {
        bindMdashLayoutIconPicker($container);
    }
    $container.off('change.lbPropThemeColor', '.mdash-layout-color-value').on('change.lbPropThemeColor', '.mdash-layout-color-value', function () {
        var val = $(this).val();
        var $tile = $(this).closest('.mdash-lb-prop-tile');
        var idx = $tile.data('prop-idx');
        $tile.find('.mdash-lb-prop-field[data-field="default"]').val(val).trigger('change');
        var swatchStyle = typeof mdashLayoutColorSwatchStyle === 'function' ? mdashLayoutColorSwatchStyle(val) : ('background:' + val + ';');
        $tile.find('.mdash-lb-prop-swatch-lg').attr('style', swatchStyle);
    });
    $container.off('change.lbPropIcon', '.mdash-layout-icon-value').on('change.lbPropIcon', '.mdash-layout-icon-value', function () {
        var val = $(this).val();
        var $tile = $(this).closest('.mdash-lb-prop-tile');
        $tile.find('.mdash-lb-prop-field[data-field="default"]').val(val).trigger('change');
    });
    refreshPropsPreviewChrome();
}

function bindLayoutPropsBuilderEvents() {
    var $root = $('#mdash-lb-props-builder');
    if (!$root.length) return;

    function persistPropsFromLayout(layout, rerender) {
        layout.propsdefinition = JSON.stringify(layout.props || []);
        var editors = GLayoutBuilderState.aceEditors;
        if (editors.props) {
            GLayoutBuilderState.syncingPropsEditor = true;
            editors.props.setValue(layout.propsdefinition, -1);
            setTimeout(function () { GLayoutBuilderState.syncingPropsEditor = false; }, 100);
        }
        if (rerender !== false) {
            renderLayoutPropsBuilder(layout);
        }
        syncLayoutToServer(layout);
    }

    $('#mdash-lb-prop-add').off('click').on('click', function () {
        lbStartQuickProp('color', 'Nova cor');
    });

    $root.off('click', '.mdash-lb-prop-quick').on('click', '.mdash-lb-prop-quick', function () {
        lbStartQuickProp($(this).data('quick-type'), $(this).data('quick-label'));
    });

    $('#mdash-lb-prop-mode-start-empty').off('click').on('click', function () {
        if (!GLayoutBuilderState.propModeActive) togglePropMode();
    });

    $root.off('input change', '.mdash-lb-prop-color-picker').on('input change', '.mdash-lb-prop-color-picker', function () {
        var idx = parseInt($(this).data('prop-idx'), 10);
        var val = $(this).val();
        $(this).closest('.mdash-lb-prop-color-row').find('input[data-field="default"][type="text"]').val(val);
        var layout = getSelectedLayout();
        if (layout && layout.props[idx]) {
            layout.props[idx]['default'] = val;
            persistPropsFromLayout(layout, false);
            refreshPropsPreviewChrome();
        }
    });

    $root.off('change', '.mdash-lb-prop-theme-toggle').on('change', '.mdash-lb-prop-theme-toggle', function () {
        var layout = getSelectedLayout();
        if (!layout || !Array.isArray(layout.props)) return;
        var idx = parseInt($(this).data('prop-idx'), 10);
        if (!layout.props[idx]) return;
        var on = $(this).is(':checked');
        var prop = layout.props[idx];
        var src = (typeof mdashGetPropSources === 'function') ? mdashGetPropSources(prop) : { theme: {}, classes: { classPrefix: '', options: [] }, custom: {} };
        src.theme.enabled = on;
        prop.sources = src;
        delete prop.includeThemeColors;
        persistPropsFromLayout(layout, true);
        refreshPropsPreviewChrome();
    });

    $root.off('change', '.mdash-lb-prop-field').on('change', '.mdash-lb-prop-field', function () {
        var layout = getSelectedLayout();
        if (!layout || !Array.isArray(layout.props)) return;
        var idx = parseInt($(this).data('prop-idx'), 10);
        var field = $(this).data('field');
        if (!layout.props[idx]) return;
        var newVal = $(this).val();
        // Cor guarda { src, value }: preserva a fonte ao editar o valor de exemplo.
        if (field === 'default' && layout.props[idx].type === 'color') {
            var isCustom = String(newVal).charAt(0) === '#' || String(newVal).indexOf('rgb') === 0;
            layout.props[idx]['default'] = { src: isCustom ? 'custom' : 'theme', value: newVal };
        } else {
            layout.props[idx][field] = newVal;
        }
        if (field === 'type') {
            var tid = lbGetPropTargetId(layout.props[idx]);
            var sel = tid ? lbPropTargetSelector(tid) : '';
            layout.props[idx].behaviors = lbInferDefaultBehaviorsForProp(layout.props[idx], sel);
        }
        persistPropsFromLayout(layout, false);
        refreshPropsPreviewChrome();
    });

    $root.off('click', '.mdash-lb-prop-remove').on('click', '.mdash-lb-prop-remove', function () {
        var layout = getSelectedLayout();
        if (!layout || !Array.isArray(layout.props)) return;
        layout.props.splice(parseInt($(this).data('prop-idx'), 10), 1);
        persistPropsFromLayout(layout);
        refreshPropsPreviewChrome();
    });

    $root.off('click', '.mdash-lb-prop-behavior-remove').on('click', '.mdash-lb-prop-behavior-remove', function () {
        var layout = getSelectedLayout();
        if (!layout || !Array.isArray(layout.props)) return;
        var pIdx = parseInt($(this).data('prop-idx'), 10);
        var bIdx = parseInt($(this).data('behavior-idx'), 10);
        if (!layout.props[pIdx] || !Array.isArray(layout.props[pIdx].behaviors)) return;
        layout.props[pIdx].behaviors.splice(bIdx, 1);
        persistPropsFromLayout(layout);
        refreshPropsPreviewChrome();
    });

    $('#mdash-lb-prop-mode-start').off('click').on('click', function () {
        if (!GLayoutBuilderState.propModeActive) {
            if (GLayoutBuilderState.slotModeActive) toggleSlotMode();
            togglePropMode();
        } else {
            togglePropMode();
        }
    });

    $root.off('click', '.mdash-lb-prop-mark-target').on('click', '.mdash-lb-prop-mark-target', function () {
        var pIdx = parseInt($(this).data('prop-idx'), 10);
        var bIdx = parseInt($(this).data('behavior-idx'), 10);
        var pick = {};
        pick.propIdx = pIdx;
        pick.behaviorIdx = bIdx;
        GLayoutBuilderState.propTargetPick = pick;
        $('.mdash-lb-prop-behavior-row').removeClass('is-picking-target');
        $(this).closest('.mdash-lb-prop-behavior-row').addClass('is-picking-target');
        if (!GLayoutBuilderState.propModeActive) {
            if (GLayoutBuilderState.slotModeActive) toggleSlotMode();
            togglePropMode();
        }
        alertify.message('Clique no elemento colorido à direita', 2500);
    });
}

function lbStartQuickProp(type, label) {
    if (!GLayoutBuilderState.propModeActive) {
        if (GLayoutBuilderState.slotModeActive) toggleSlotMode();
        togglePropMode();
    }
    var pending = {};
    pending.type = type || 'color';
    pending.label = label || 'Nova propriedade';
    GLayoutBuilderState.pendingQuickProp = pending;
    alertify.message('Agora clique no elemento que quer personalizar', 3000);
}

// ============================================================================
// LAYOUT BUILDER - PROP MODE (marcação visual data-mdash-prop-target)
// ============================================================================

function getPropsPreviewWrapper() {
    return $('#mdash-lb-props-preview-wrapper');
}

function togglePropMode() {
    GLayoutBuilderState.propModeActive = !GLayoutBuilderState.propModeActive;
    var active = GLayoutBuilderState.propModeActive;

    var $btn = $('#mdash-lb-prop-mode-toggle');
    var $info = $('#mdash-lb-prop-mode-info');
    var $breadcrumb = $('#mdash-lb-prop-breadcrumb');
    var $previewContent = $('#mdash-lb-props-preview-content');

    if (active) {
        if (GLayoutBuilderState.slotModeActive) toggleSlotMode();
        updateLayoutPropsPreview();
        $btn.addClass('active');
        $info.addClass('active');
        $previewContent.addClass('prop-mode');
        bindPropModeEvents($previewContent);
        refreshPropsPreviewChrome();
        injectPropModeBadges();
    } else {
        $btn.removeClass('active');
        $info.removeClass('active');
        $breadcrumb.removeClass('active').empty();
        $previewContent.removeClass('prop-mode');
        unbindPropModeEvents($previewContent);
        hidePropPopover();
        removePropModeBadges();
        GLayoutBuilderState.propTargetPick = null;
        $('.mdash-lb-prop-behavior-row').removeClass('is-picking-target');
        getPropsPreviewWrapper().find('.mdash-lb-prop-selected').removeClass('mdash-lb-prop-selected');
    }
}

function bindPropModeEvents($previewContent) {
    var $wrapper = getPropsPreviewWrapper();

    $wrapper.off('click.propmode').on('click.propmode', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var target = e.target;
        if ($(target).hasClass('mdash-lb-prop-badge')) {
            target = target.parentElement;
        }
        if (!target || $(target).hasClass('mdash-lb-preview-card-wrapper')) return;
        if ($(target).closest('.mdash-lb-empty-state').length) return;
        if ($(target).is('[data-mdash-scope]')) return;

        $wrapper.find('.mdash-lb-prop-selected').removeClass('mdash-lb-prop-selected');
        $(target).addClass('mdash-lb-prop-selected');
        GLayoutBuilderState.propModeSelectedElement = target;

        updatePropBreadcrumb(target, $wrapper[0]);

        if (GLayoutBuilderState.propTargetPick) {
            applyPropTargetPick(target);
            return;
        }

        showPropPopover(target, GLayoutBuilderState.pendingQuickProp);
        GLayoutBuilderState.pendingQuickProp = null;
    });

    $wrapper.off('mouseover.propmode').on('mouseover.propmode', function (e) {
        e.stopPropagation();
        showPropHoverLabelFor(e.target);
    });
    $wrapper.off('mouseleave.propmode').on('mouseleave.propmode', function () {
        hidePropHoverLabel();
    });
}

function unbindPropModeEvents($previewContent) {
    getPropsPreviewWrapper().off('click.propmode mouseover.propmode mouseleave.propmode');
    destroyPropHoverLabel();
    GLayoutBuilderState.propModeSelectedElement = null;
}

function updatePropBreadcrumb(element, container) {
    var $breadcrumb = $('#mdash-lb-prop-breadcrumb');
    var path = [];
    var el = element;

    while (el && el !== container) {
        var tag = el.tagName.toLowerCase();
        var cls = (el.className || '').replace(/mdash-lb-prop-selected/g, '').trim();
        var label = tag;
        if (cls) {
            var firstClass = cls.split(/\s+/)[0];
            if (firstClass) label += '.' + firstClass;
        }
        var isProp = el.hasAttribute(LB_PROP_TARGET_ATTR);
        path.unshift({ label: label, element: el, isProp: isProp });
        el = el.parentElement;
    }

    var html = '';
    path.forEach(function (item, idx) {
        if (idx > 0) html += '<span class="sep">\u203A</span>';
        var propClass = item.isProp ? ' class="is-prop"' : '';
        var propBadge = item.isProp ? ' \u25CF' : '';
        html += '<span data-bc-idx="' + idx + '"' + propClass + '>' + item.label + propBadge + '</span>';
    });

    $breadcrumb.html(html).addClass('active');

    $breadcrumb.find('span[data-bc-idx]').off('click').on('click', function () {
        var idx = parseInt($(this).data('bc-idx'), 10);
        if (path[idx] && path[idx].element) {
            var $wrapper = $(container);
            $wrapper.find('.mdash-lb-prop-selected').removeClass('mdash-lb-prop-selected');
            $(path[idx].element).addClass('mdash-lb-prop-selected');
            GLayoutBuilderState.propModeSelectedElement = path[idx].element;
            updatePropBreadcrumb(path[idx].element, container);
            if (!GLayoutBuilderState.propTargetPick) showPropPopover(path[idx].element);
        }
    });
}

function inferPropTypeFromElement(element) {
    if (!element) return 'text';
    var tag = element.tagName ? element.tagName.toLowerCase() : '';
    var cls = (element.className || '').toString();
    if (cls.indexOf('material-icons') >= 0 || cls.indexOf('material-symbols') >= 0 || tag === 'i') return 'icon';
    if ($(element).find('.material-icons, [class*="material-symbols"], i.fa, i.glyphicon').length) return 'icon';
    if (tag === 'input' && element.type === 'color') return 'color';
    if (tag === 'input' && element.type === 'number') return 'number';
    if ((element.style && element.style.color) || (element.style && element.style.backgroundColor)) return 'color';
    return 'text';
}

/** Devolve o glifo/nome do ícone atual de um elemento (ou do seu filho de ícone). */
function lbGetElementIconValue(element) {
    if (!element) return '';
    var $el = $(element);
    var sel = 'i, .material-icons, [class*="material-symbols"], .fa';
    var $icon = $el.is(sel) ? $el : $el.find(sel).first();
    if (!$icon.length) $icon = $el;
    var cls = $icon.attr('class') || '';
    var ownText = $icon.length ? $.trim(getOwnTextContent($icon[0])) : '';
    if (/material-symbols|material-icons/.test(cls)) {
        return ownText;
    }
    var m = cls.match(/glyphicon-[\w-]+/);
    if (m) return m[0];
    m = cls.match(/fa-[\w-]+/);
    if (m) return m[0];
    return ownText;
}

/** Deteta a classe de fonte de ícone usada pelo elemento (varia por layout). */
function lbGetElementIconClass(element) {
    if (!element) return 'material-symbols-rounded';
    var $el = $(element);
    var sel = 'i, .material-icons, [class*="material-symbols"], .fa, .glyphicon';
    var $icon = $el.is(sel) ? $el : $el.find(sel).first();
    if (!$icon.length) $icon = $el;
    var cls = $icon.attr('class') || '';
    var m = cls.match(/material-symbols-(rounded|outlined|sharp)/);
    if (m) return m[0];
    if (/material-symbols/.test(cls)) return 'material-symbols-outlined';
    if (/material-icons/.test(cls)) return 'material-icons';
    return 'material-symbols-rounded';
}

/** Valor de exemplo por defeito, sensível ao elemento (para ícones usa o glifo atual). */
function lbDefaultExampleForType(type, element) {
    if (type === 'icon') {
        var glyph = lbGetElementIconValue(element);
        if (glyph) return glyph;
    }
    return lbDefaultValueForPropType(type);
}

function lbInferDefaultBehaviorsForProp(propDef, target, element) {
    var type = (propDef && propDef.type) || 'text';
    var propId = (propDef && propDef.id) || 'value';
    var targetId = (propDef && propDef.targetId) || propId;
    target = target || lbPropTargetSelector(targetId);
    if (type === 'color') {
        var bColor = {};
        bColor.kind = 'setCssProperty';
        bColor.target = target;
        bColor.property = lbInferColorCssProperty(element);
        return [bColor];
    }
    if (type === 'icon') {
        var bIcon = {};
        bIcon.kind = 'setIcon';
        bIcon.target = target;
        bIcon.iconLibrary = 'material';
        return [bIcon];
    }
    if (type === 'select') {
        var bSelect = {};
        bSelect.kind = 'toggleClass';
        bSelect.target = target;
        bSelect.classPrefix = 'm-variant--';
        return [bSelect];
    }
    var bText = {};
    bText.kind = 'setText';
    bText.target = target;
    return [bText];
}

function lbDefaultValueForPropType(type) {
    var registry = typeof getMdashLayoutPropTypeRegistry === 'function' ? getMdashLayoutPropTypeRegistry() : {};
    var meta = registry[type] || registry['text'] || {};
    return meta.defaultValue != null ? meta.defaultValue : '';
}

function suggestPropName(element) {
    return suggestSlotName(element);
}

function showPropPopover(element, quickPreset, editPropId) {
    hidePropPopover();
    hidePropHoverLabel();
    if (!quickPreset && GLayoutBuilderState.pendingQuickProp) {
        quickPreset = GLayoutBuilderState.pendingQuickProp;
        GLayoutBuilderState.pendingQuickProp = null;
    }
    quickPreset = quickPreset || null;
    var layout = getSelectedLayout();
    var targetId = lbResolvePropTargetId(element, layout, false);
    var existingProps = lbGetPropsForTarget(layout, targetId);
    var editingProp = null;
    if (editPropId && layout && Array.isArray(layout.props)) {
        editingProp = layout.props.find(function (p) { return p && p.id === editPropId; }) || null;
    }

    var inferredType = (quickPreset && quickPreset.type) || (editingProp && editingProp.type) || inferPropTypeFromElement(element);
    var suggestedLabel = (quickPreset && quickPreset.label) || (editingProp && editingProp.label) || 'Nova propriedade';
    var defaultColor = (editingProp && editingProp.default) || lbDefaultValueForPropType('color');
    var includeThemeColors = editingProp ? (editingProp.includeThemeColors !== false) : true;
    var isAdding = !!(quickPreset || editingProp || !existingProps.length);

    var tag = element.tagName.toLowerCase();
    var cls = (element.className || '').replace(/mdash-lb-prop-selected/g, '').trim();
    var elementInfo = tag + (cls ? (' · ' + cls.split(/\s+/)[0]) : '');
    var typeRegistry = typeof getMdashLayoutPropTypeRegistry === 'function' ? getMdashLayoutPropTypeRegistry() : {};
    var effectHint = inferredType === 'color'
        ? ('Vai alterar: ' + (lbInferColorCssProperty(element) === 'color' ? 'cor do texto/ícone' : 'cor de fundo'))
        : (inferredType === 'icon' ? 'Vai alterar o ícone deste elemento' : 'Vai alterar o conteúdo visual deste elemento');

    var html = '<div class="mdash-lb-prop-popover" id="mdash-lb-prop-popover">';
    html += '  <h6><i class="glyphicon glyphicon-adjust"></i> Propriedades do elemento</h6>';
    html += '  <div class="mdash-lb-prop-popover-body">';
    html += '  <p class="mdash-lb-prop-help">Elemento: <b>' + elementInfo + '</b></p>';
    html += '  <p class="mdash-lb-prop-help" style="font-size:10px;color:#64748b;">Alvo: <code>' + targetId + '</code> — pode ter várias propriedades</p>';

    if (existingProps.length && !isAdding) {
        html += '  <ul class="mdash-lb-prop-popover-list">';
        existingProps.forEach(function (p) {
            var meta = lbGetPropTypeMeta(p.type || 'text');
            html += '<li><div><span class="prop-name">' + (p.label || p.id) + '</span> <span class="prop-type">(' + meta.label + ')</span></div>';
            html += '<button type="button" class="btn btn-xs btn-default mdash-lb-prop-edit-existing" data-prop-id="' + p.id + '"><i class="glyphicon glyphicon-pencil"></i></button>';
            html += '<button type="button" class="btn btn-xs btn-danger mdash-lb-prop-remove-existing" data-prop-id="' + p.id + '"><i class="glyphicon glyphicon-trash"></i></button></li>';
        });
        html += '  </ul>';
        html += '  <div class="mdash-lb-prop-popover-add">';
        html += '    <button type="button" class="btn btn-default btn-xs mdash-lb-prop-add-on-target" data-quick-type="color" data-quick-label="Cor"><i class="glyphicon glyphicon-tint"></i> + Cor</button>';
        html += '    <button type="button" class="btn btn-default btn-xs mdash-lb-prop-add-on-target" data-quick-type="icon" data-quick-label="Ícone"><i class="glyphicon glyphicon-star"></i> + Ícone</button>';
        html += '    <button type="button" class="btn btn-default btn-xs mdash-lb-prop-add-on-target" data-quick-type="text" data-quick-label="Texto"><i class="glyphicon glyphicon-font"></i> + Texto</button>';
        html += '    <button type="button" class="btn btn-default btn-xs mdash-lb-prop-add-on-target" data-quick-type="select" data-quick-label="Variante"><i class="glyphicon glyphicon-list"></i> + Variante</button>';
        html += '  </div>';
    }

    if (isAdding || !existingProps.length) {
        html += '  <div class="mdash-lb-prop-effect-preview"><i class="glyphicon glyphicon-eye-open"></i> ' + effectHint + '</div>';
        html += '  <div class="form-group"><label>Nome (o que o utilizador vê no editor)</label><input type="text" id="mdash-lb-prop-label-input" value="' + suggestedLabel + '" placeholder="ex: Cor de fundo" /></div>';
        html += '  <div class="form-group"><label>Tipo</label><select id="mdash-lb-prop-type-input">';
        Object.keys(typeRegistry).forEach(function (typeKey) {
            html += '<option value="' + typeKey + '"' + (inferredType === typeKey ? ' selected' : '') + '>' + typeRegistry[typeKey].label + '</option>';
        });
        html += '  </select></div>';
        html += '  <div class="form-group" id="mdash-lb-prop-default-wrap">';
        if (inferredType !== 'select' && inferredType !== 'color') html += '    <label>Valor de exemplo (pré-visualização)</label>';
        if (inferredType === 'color') {
            html += lbBuildColorSourcesConfigHtml(editingProp, element);
        } else if (inferredType === 'icon') {
            var iconDef = (editingProp && editingProp.default != null) ? editingProp.default : lbDefaultExampleForType('icon', element);
            var iconCls = (editingProp && editingProp.iconClass) || lbGetElementIconClass(element);
            html += lbBuildIconDefaultFieldHtml(iconDef, 'mdash-lb-prop-default-input', iconCls);
        } else if (inferredType === 'select') {
            html += lbBuildSelectOptionsFieldHtml(editingProp, element);
        } else {
            var defExample = (editingProp && editingProp.default != null) ? editingProp.default : lbDefaultExampleForType(inferredType, element);
            html += '    <input type="text" id="mdash-lb-prop-default-input" value="' + defExample + '" />';
        }
        html += '  </div>';
        html += '  <input type="hidden" id="mdash-lb-prop-id-input" value="' + (editingProp && editingProp.id ? editingProp.id : '') + '" />';
        html += '  <input type="hidden" id="mdash-lb-prop-target-id" value="' + targetId + '" />';
        html += '  </div>'; // /body
        html += '  <div class="mdash-lb-prop-popover-actions">';
        html += '    <button type="button" class="btn btn-sm" id="mdash-lb-prop-apply" style="background:#7c3aed;color:#fff;flex:1;"><i class="glyphicon glyphicon-ok"></i> ' + (editingProp ? 'Guardar' : 'Adicionar') + '</button>';
        html += '    <button type="button" class="btn btn-sm" id="mdash-lb-prop-cancel" style="background:#f3f6fb;color:#1f2937;border:1px solid rgba(15,23,42,0.08);"><i class="glyphicon glyphicon-remove"></i></button>';
        html += '  </div>';
    } else {
        html += '  </div>'; // /body
        html += '  <div class="mdash-lb-prop-popover-actions">';
        html += '    <button type="button" class="btn btn-sm" id="mdash-lb-prop-cancel" style="background:#f3f6fb;color:#1f2937;border:1px solid rgba(15,23,42,0.08);flex:1;"><i class="glyphicon glyphicon-remove"></i> Fechar</button>';
        html += '  </div>';
    }
    html += '</div>';

    var rect = element.getBoundingClientRect();
    var $popover = $(html);
    $('body').append($popover);

    var popoverWidth = 300;
    var left = rect.right + 10;
    var top = rect.top;
    if (left + popoverWidth > window.innerWidth) left = rect.left - popoverWidth - 10;
    if (left < 8) left = 8;

    // Estilos inline garantem o limite de altura + scroll interno mesmo que o CSS
    // compilado esteja em cache (o conteúdo pode ser alto: fontes de cor, opções…).
    $popover.css({
        position: 'fixed',
        left: left + 'px',
        top: top + 'px',
        zIndex: 10020,
        maxHeight: (window.innerHeight - 16) + 'px',
        overflowY: 'auto',
        overflowX: 'hidden'
    });

    // Clampar verticalmente usando a altura real (já limitada pelo maxHeight acima).
    var popH = $popover.outerHeight() || 280;
    var maxTop = window.innerHeight - popH - 8;
    if (top > maxTop) top = maxTop;
    if (top < 8) top = 8;
    $popover.css('top', top + 'px');

    setTimeout(function () { $('#mdash-lb-prop-label-input').focus().select(); }, 50);

    $('#mdash-lb-prop-type-input').off('change').on('change', function () {
        var t = $(this).val();
        var $wrap = $('#mdash-lb-prop-default-wrap');
        if (t === 'color') {
            $wrap.html(lbBuildColorSourcesConfigHtml(null, element));
            lbBindColorSourcesField($popover, element);
        } else if (t === 'icon') {
            $wrap.html('<label>Escolha o ícone</label>' + lbBuildIconDefaultFieldHtml(lbDefaultExampleForType('icon', element), 'mdash-lb-prop-default-input', lbGetElementIconClass(element)));
            lbBindIconDefaultField($popover);
        } else if (t === 'select') {
            $wrap.html(lbBuildSelectOptionsFieldHtml(null, element));
            lbBindSelectOptionsField($popover);
        } else {
            $wrap.html('<label>Valor de exemplo (pré-visualização)</label><input type="text" id="mdash-lb-prop-default-input" value="' + lbDefaultExampleForType(t, element) + '" />');
        }
    });

    // Alternar a fonte "tema" re-renderiza o color picker (mostra/esconde swatches do tema).
    $popover.off('change.srcTheme', '#mdash-lb-src-theme').on('change.srcTheme', '#mdash-lb-src-theme', function () {
        if (($('#mdash-lb-prop-type-input').val() || '') !== 'color') return;
        var withTheme = $(this).is(':checked');
        var current = $('#mdash-lb-prop-default-input').val() || 'var(--md-primary)';
        var $cw = $('#mdash-lb-src-color-wrap');
        $cw.html('<label>Cor por defeito (exemplo)</label>' + lbBuildColorDefaultFieldHtml(current, 'mdash-lb-prop-default-input', withTheme));
        lbBindColorDefaultField($popover);
    });

    if (inferredType === 'color') {
        lbBindColorSourcesField($popover, element);
    }
    lbBindColorDefaultField($popover);
    lbBindIconDefaultField($popover);
    lbBindSelectOptionsField($popover);

    bindPropPopoverEvents(element);
}

function hidePropPopover() {
    $('#mdash-lb-prop-popover').remove();
}

function bindPropPopoverEvents(element) {
    var $pop = $('#mdash-lb-prop-popover');
    $pop.off('click.propAdd').on('click.propAdd', '.mdash-lb-prop-add-on-target', function () {
        showPropPopover(element, {
            type: $(this).data('quick-type'),
            label: $(this).data('quick-label')
        });
    });

    $pop.off('click.propEdit').on('click.propEdit', '.mdash-lb-prop-edit-existing', function () {
        showPropPopover(element, null, $(this).data('prop-id'));
    });

    $pop.off('click.propRemove').on('click.propRemove', '.mdash-lb-prop-remove-existing', function () {
        var propId = $(this).data('prop-id');
        var layout = getSelectedLayout();
        if (layout && Array.isArray(layout.props) && propId) {
            layout.props = layout.props.filter(function (p) { return !p || p.id !== propId; });
            persistPropsFromLayoutQuick(layout);
        }
        syncPreviewToHtmlEditor({ wrapper: '#mdash-lb-props-preview-wrapper', updateSlots: false });
        refreshPropsPreviewChrome();
        showPropPopover(element);
        alertify.success('Propriedade removida', 2000);
    });

    $('#mdash-lb-prop-apply').off('click').on('click', function () {
        var propLabel = $.trim($('#mdash-lb-prop-label-input').val());
        var propType = $('#mdash-lb-prop-type-input').val() || 'text';
        var $defaultInput = $('#mdash-lb-prop-default-input');
        var propDefault = $defaultInput.length ? $.trim($defaultInput.val()) : '';
        if (!propLabel) {
            alertify.error('Introduza um nome para a propriedade', 2000);
            return;
        }

        var layout = getSelectedLayout();
        var targetId = $('#mdash-lb-prop-target-id').val() || lbResolvePropTargetId(element, layout, false);
        element.setAttribute(LB_PROP_TARGET_ATTR, targetId);
        var propId = $.trim($('#mdash-lb-prop-id-input').val()) || lbSlugifyPropId(propLabel, layout);
        var target = lbPropTargetSelector(targetId);

        var selData = null;
        var colorSrc = null;
        if (propType === 'select') {
            selData = lbCollectSelectOptions();
            if (!selData.options.length) {
                alertify.error('Adicione pelo menos uma opção', 2000);
                return;
            }
            propDefault = selData['default'] || propDefault;
        } else if (propType === 'color') {
            colorSrc = lbCollectColorSources();
            if (colorSrc.sources.classes.enabled && !colorSrc.sources.classes.options.length) {
                alertify.error('Adicione pelo menos uma opção de estilo, ou desmarque "Estilos por classe"', 2500);
                return;
            }
        }

        if (layout) {
            if (!Array.isArray(layout.props)) layout.props = [];
            var propDef = layout.props.find(function (p) { return p && p.id === propId; });
            var isNew = !propDef;
            if (isNew) {
                propDef = {};
                propDef.id = propId;
                propDef.targetId = targetId;
                propDef.behaviors = lbInferDefaultBehaviorsForProp(lbMakePropStub(propId, propType), target, element);
                layout.props.push(propDef);
            }
            propDef.label = propLabel;
            propDef.type = propType;
            propDef.targetId = targetId;

            if (propType === 'color' && colorSrc) {
                propDef.sources = colorSrc.sources;
                propDef['default'] = colorSrc['default'];
                delete propDef.includeThemeColors;
            } else {
                propDef['default'] = propDefault || lbDefaultValueForPropType(propType);
                if (propType !== 'color') delete propDef.includeThemeColors;
                if (propType !== 'color') delete propDef.sources;
            }

            if (propType === 'icon') propDef.iconClass = lbGetElementIconClass(element);
            else delete propDef.iconClass;

            if (propType === 'select') {
                propDef.options = selData.options;
                propDef.classPrefix = selData.classPrefix;
                var bSel = {};
                bSel.kind = 'toggleClass';
                bSel.target = target;
                bSel.classPrefix = selData.classPrefix;
                propDef.behaviors = [bSel];
            } else {
                delete propDef.options;
                delete propDef.classPrefix;
            }

            if (!isNew) lbSetPropTarget(propDef, targetId, element);
            persistPropsFromLayoutQuick(layout);
        }

        hidePropPopover();
        syncPreviewToHtmlEditor({ wrapper: '#mdash-lb-props-preview-wrapper', updateSlots: false });
        refreshPropsPreviewChrome();

        var $wrapper = getPropsPreviewWrapper();
        if ($wrapper.length) updatePropBreadcrumb(element, $wrapper[0]);
        alertify.success("'" + propLabel + "' aplicada na pré-visualização", 2500);
    });

    $('#mdash-lb-prop-cancel').off('click').on('click', function () {
        hidePropPopover();
    });

    $('#mdash-lb-prop-label-input').off('keydown').on('keydown', function (e) {
        if (e.keyCode === 13) { e.preventDefault(); $('#mdash-lb-prop-apply').click(); }
        if (e.keyCode === 27) { e.preventDefault(); e.stopPropagation(); hidePropPopover(); }
    });
}

function applyPropTargetPick(element) {
    var pick = GLayoutBuilderState.propTargetPick;
    if (!pick) return;
    var layout = getSelectedLayout();
    if (!layout || !Array.isArray(layout.props) || !layout.props[pick.propIdx]) return;

    var propDef = layout.props[pick.propIdx];
    if (!Array.isArray(propDef.behaviors)) propDef.behaviors = [];
    if (!propDef.behaviors[pick.behaviorIdx]) {
        var newBehavior = {};
        newBehavior.kind = 'setCssProperty';
        newBehavior.target = '';
        newBehavior.property = 'color';
        propDef.behaviors[pick.behaviorIdx] = newBehavior;
    }

    var propId = propDef.id || suggestPropName(element);
    if (!propDef.id) propDef.id = propId;
    var targetId = lbEnsurePropTargetOnElement(element, layout);

    var target = lbPropTargetSelector(targetId);
    propDef.targetId = targetId;
    propDef.behaviors[pick.behaviorIdx].target = target;
    if (propDef.behaviors[pick.behaviorIdx].kind === 'setCssProperty' && !propDef.behaviors[pick.behaviorIdx].property) {
        propDef.behaviors[pick.behaviorIdx].property = lbInferColorCssProperty(element);
    }

    GLayoutBuilderState.propTargetPick = null;
    $('.mdash-lb-prop-behavior-row').removeClass('is-picking-target');
    hidePropPopover();
    persistPropsFromLayoutQuick(layout);
    syncPreviewToHtmlEditor({ wrapper: '#mdash-lb-props-preview-wrapper', updateSlots: false });
    refreshPropsPreviewChrome();
    alertify.success('Elemento ligado à propriedade', 2000);
}

function persistPropsFromLayoutQuick(layout) {
    layout.propsdefinition = JSON.stringify(layout.props || []);
    var editors = GLayoutBuilderState.aceEditors;
    if (editors.props) {
        GLayoutBuilderState.syncingPropsEditor = true;
        editors.props.setValue(layout.propsdefinition, -1);
        setTimeout(function () { GLayoutBuilderState.syncingPropsEditor = false; }, 100);
    }
    renderLayoutPropsBuilder(layout);
    layout.stringifyJSONFields();
    syncLayoutToServer(layout);
    refreshPropsPreviewChrome();
}

function injectPropBadgesOnPreview($wrapper) {
    if (!$wrapper || !$wrapper.length) return;
    $wrapper.find('.mdash-lb-prop-badge').remove();
}

/** Devolve o card-wrapper interno da pré-visualização de props (onde marcamos elementos). */
function getPropsPreviewCardWrapper() {
    var $wrapper = getPropsPreviewWrapper();
    if (!$wrapper.length) return $();
    var $card = $wrapper.find('.mdash-lb-preview-card-wrapper').first();
    return $card.length ? $card : $wrapper;
}

/**
 * Marca apenas os elementos vazios para ficarem clicáveis (caixa tracejada),
 * sem poluir o preview com etiquetas. A identificação faz-se via inspetor de hover.
 */
function injectPropModeBadges() {
    var $card = getPropsPreviewCardWrapper();
    if (!$card.length) return;

    removePropModeBadges();

    $card.find('*').each(function () {
        var el = this;
        if ($(el).hasClass('mdash-lb-empty-state')) return;
        if ($(el).is('[data-mdash-scope]')) return;
        if (el.tagName === 'BR' || el.tagName === 'HR' || el.tagName === 'IMG' || el.tagName === 'INPUT') return;

        var ownText = getOwnTextContent(el).trim();
        if (!ownText && el.children.length === 0) el.setAttribute('data-lb-badge-empty', '1');
    });
}

/** Remove marcas e a etiqueta flutuante do modo prop. */
function removePropModeBadges() {
    var $card = getPropsPreviewCardWrapper();
    if ($card.length) {
        $card.find('.mdash-lb-prop-badge').remove();
        $card.find('[data-lb-has-prop]').removeAttr('data-lb-has-prop');
        $card.find('[data-lb-badge-host]').removeAttr('data-lb-badge-host');
        $card.find('[data-lb-badge-empty]').removeAttr('data-lb-badge-empty');
    }
    hidePropHoverLabel();
}

/** Etiqueta flutuante única (estilo inspetor DevTools/Webflow). */
function ensurePropHoverLabel() {
    var el = document.getElementById('mdash-lb-prop-hover-label');
    if (!el) {
        el = document.createElement('div');
        el.id = 'mdash-lb-prop-hover-label';
        el.className = 'mdash-lb-prop-hover-label';
        document.body.appendChild(el);
    }
    return el;
}

function hidePropHoverLabel() {
    var el = document.getElementById('mdash-lb-prop-hover-label');
    if (el) el.style.display = 'none';
}

function destroyPropHoverLabel() {
    var el = document.getElementById('mdash-lb-prop-hover-label');
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function showPropHoverLabelFor(target) {
    if (!target || !target.getBoundingClientRect) { hidePropHoverLabel(); return; }
    var $t = $(target);
    if ($t.hasClass('mdash-lb-preview-card-wrapper') || $t.is('[data-mdash-scope]') ||
        $t.closest('.mdash-lb-empty-state').length || target.tagName === 'BR' || target.tagName === 'HR') {
        hidePropHoverLabel();
        return;
    }
    var info = getElementBadgeLabel(target);
    var tag = info.tag || target.tagName.toLowerCase();
    var clsPart = '';
    if (info.label && info.label.indexOf('.') >= 0) clsPart = info.label.substring(info.label.indexOf('.'));
    var lbl = ensurePropHoverLabel();
    lbl.innerHTML = '<span class="lbl-tag">' + tag + '</span>' + (clsPart ? '<span class="lbl-cls">' + clsPart + '</span>' : '');
    lbl.style.display = 'block';
    var rect = target.getBoundingClientRect();
    var lblRect = lbl.getBoundingClientRect();
    var left = rect.left;
    if (left + lblRect.width > window.innerWidth - 6) left = window.innerWidth - lblRect.width - 6;
    if (left < 4) left = 4;
    var top = rect.top - lblRect.height - 3;
    if (top < 4) top = rect.top + 3;
    lbl.style.left = left + 'px';
    lbl.style.top = top + 'px';
}

function applyPreviewPropValues($wrapper) {
    if (!$wrapper || !$wrapper.length) return;
    var layout = getSelectedLayout();
    if (!layout || !Array.isArray(layout.props) || !layout.props.length) return;
    var $scope = $wrapper.find('[data-mdash-scope]').first();
    if (!$scope.length) $scope = $wrapper;

    var mockItem = {
        layoutprops: {},
        initLayoutProps: function () { }
    };
    layout.props.forEach(function (p) {
        if (!p || !p.id) return;
        mockItem.layoutprops[p.id] = p.default != null ? p.default : lbDefaultValueForPropType(p.type);
    });

    var mockTemplate = {
        props: layout.props,
        propsdefinition: layout.propsdefinition || '[]'
    };

    if (typeof applyLayoutPropsToScope === 'function') {
        applyLayoutPropsToScope($scope, mockTemplate, mockItem, {});
    }
}

function lbMigrateLegacyColorProps(layout, $wrapper) {
    if (!layout || !Array.isArray(layout.props) || !$wrapper || !$wrapper.length) return false;
    var changed = false;
    layout.props.forEach(function (p) {
        if (!p || p.type !== 'color' || !Array.isArray(p.behaviors) || !p.behaviors.length) return;
        var b = p.behaviors[0];
        if (!b || b.kind !== 'setCssVariable') return;
        var $el = $wrapper.find(lbPropTargetSelector(p.targetId || p.id));
        if (!$el.length) $el = $wrapper.find('[data-mdash-prop="' + p.id + '"]');
        if (!$el.length) return;
        lbSetPropTarget(p, p.targetId || p.id, $el[0]);
        changed = true;
    });
    if (changed) {
        layout.propsdefinition = JSON.stringify(layout.props);
    }
    return changed;
}

function refreshPropsPreviewChrome() {
    var layout = getSelectedLayout();
    var $wrappers = $('#mdash-lb-props-preview-wrapper, #mdash-lb-main-preview-content .mdash-lb-preview-card-wrapper');
    $wrappers.each(function () {
        var $w = $(this);
        if ($w.hasClass('mdash-lb-preview-css-mirror') || $w.hasClass('mdash-lb-preview-js-mirror')) return;
        var migratedTargets = layout && lbMigrateLayoutPropTargets($w, layout);
        if (migratedTargets) {
            var editors = GLayoutBuilderState.aceEditors;
            if (editors.props) {
                GLayoutBuilderState.syncingPropsEditor = true;
                editors.props.setValue(layout.propsdefinition, -1);
                setTimeout(function () { GLayoutBuilderState.syncingPropsEditor = false; }, 100);
            }
            syncPreviewToHtmlEditor({ wrapper: $w, updateSlots: false, updateProps: false });
        }
        if (layout && lbMigrateLegacyColorProps(layout, $w)) {
            var editors = GLayoutBuilderState.aceEditors;
            if (editors.props) {
                GLayoutBuilderState.syncingPropsEditor = true;
                editors.props.setValue(layout.propsdefinition, -1);
                setTimeout(function () { GLayoutBuilderState.syncingPropsEditor = false; }, 100);
            }
        }
        injectPropBadgesOnPreview($w);
        if (typeof applyMdashThemeToElement === 'function') {
            var $scope = $w.find('[data-mdash-scope]').first();
            if ($scope.length) applyMdashThemeToElement($scope[0]);
        }
        applyPreviewPropValues($w);
    });
    if (GLayoutBuilderState.propModeActive) injectPropModeBadges();
}

function injectPropModeHighlights() {
    refreshPropsPreviewChrome();
}

function updatePropsFromPreview($wrapper) {
    $wrapper = $wrapper && $wrapper.length ? $wrapper : getPropsPreviewWrapper();
    if (!$wrapper.length) return;
    var layout = getSelectedLayout();
    if (!layout) return;
    if (!Array.isArray(layout.props)) layout.props = [];

    lbStripOrphanPropTargets($wrapper, layout);

    layout.propsdefinition = JSON.stringify(layout.props || []);
    var editors = GLayoutBuilderState.aceEditors;
    if (editors.props) {
        GLayoutBuilderState.syncingPropsEditor = true;
        editors.props.setValue(layout.propsdefinition, -1);
        setTimeout(function () { GLayoutBuilderState.syncingPropsEditor = false; }, 100);
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

    var propCount = (layout.props || forceJSONParse(layout.propsdefinition, [])).length;
    html += '<div class="form-group" style="margin-top:8px;">';
    html += '  <label>Propriedades dinâmicas</label>';
    html += '  <div class="text-muted" style="font-size:11px;">' + propCount + ' definida(s) — edite na tab <b>Props</b></div>';
    html += '</div>';

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
        propsdefinition: layout.propsdefinition,
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
    if (editors.props) editors.props.setValue('[]', -1);

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
    html += '          <div class="mdash-lb-tab" data-tab="props"><i class="glyphicon glyphicon-adjust"></i> Aparência</div>';
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
    html += '              <div class="mdash-lb-css-tokens" id="mdash-lb-css-tokens"></div>';
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

    // Props tab
    html += '        <div class="mdash-lb-tab-content" data-tab-content="props">';
    html += '          <div class="mdash-lb-split">';
    html += '            <div class="mdash-lb-code-panel" style="min-width:42%;">';
    html += '              <div class="mdash-lb-code-panel-header" style="display:flex;justify-content:space-between;align-items:center;">';
    html += '                <span><i class="glyphicon glyphicon-adjust"></i> Schema de propriedades</span>';
    html += '                <button type="button" class="btn btn-xs btn-default" id="mdash-lb-prop-json-toggle" title="Mostrar/ocultar JSON"><i class="glyphicon glyphicon-console"></i> JSON</button>';
    html += '              </div>';
    html += '              <div id="mdash-lb-props-builder-host" style="flex:1;overflow:auto;padding:12px;">';
    html += '                <div id="mdash-lb-props-builder" class="mdash-lb-props-builder"></div>';
    html += '              </div>';
    html += '              <div id="mdash-lb-props-json-host" style="display:none;height:220px;border-top:1px solid var(--md-border);">';
    html += '                <div id="mdash-lb-ace-props" class="mdash-lb-ace-editor"></div>';
    html += '              </div>';
    html += '            </div>';
    html += '            <div class="mdash-lb-preview-panel">';
    html += '              <div class="mdash-lb-preview-panel-header">';
    html += '                <span><i class="glyphicon glyphicon-eye-open" style="margin-right:4px;"></i> Pré-visualização</span>';
    html += '                <button type="button" class="btn btn-xs mdash-lb-prop-mode-btn" id="mdash-lb-prop-mode-toggle" title="Marcar propriedades nos elementos"><i class="glyphicon glyphicon-screenshot"></i> Marcar Props</button>';
    html += '              </div>';
    html += '              <div class="mdash-lb-prop-mode-info" id="mdash-lb-prop-mode-info"><i class="glyphicon glyphicon-info-sign"></i> <b>Passo 1:</b> clique num elemento &nbsp;·&nbsp; <b>Passo 2:</b> adicione propriedades (cor, ícone, texto) &nbsp;·&nbsp; O mesmo elemento pode ter várias</div>';
    html += '              <div class="mdash-lb-prop-breadcrumb" id="mdash-lb-prop-breadcrumb"></div>';
    html += '              <div class="mdash-lb-preview-content" id="mdash-lb-props-preview-content">';
    html += '                <div class="mdash-lb-preview-card-wrapper" id="mdash-lb-props-preview-wrapper">';
    html += '                  <div class="mdash-lb-empty-state" style="height:200px;">';
    html += '                    <i class="glyphicon glyphicon-th-large"></i>';
    html += '                    <p>Pré-visualização das propriedades</p>';
    html += '                  </div>';
    html += '                </div>';
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
    hidePropPopover();
    GLayoutBuilderState.slotModeActive = false;
    GLayoutBuilderState.slotModeSelectedElement = null;
    GLayoutBuilderState.propModeActive = false;
    GLayoutBuilderState.propModeSelectedElement = null;
    GLayoutBuilderState.propTargetPick = null;

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

    // Prop mode toggle (tab Props)
    $('#mdash-lb-prop-mode-toggle').off('click').on('click', function () {
        if (!GLayoutBuilderState.propModeActive && GLayoutBuilderState.slotModeActive) toggleSlotMode();
        togglePropMode();
    });

    // JSON toggle na tab Props
    $('#mdash-lb-prop-json-toggle').off('click').on('click', function () {
        var $jsonHost = $('#mdash-lb-props-json-host');
        var $builderHost = $('#mdash-lb-props-builder-host');
        var showJson = $jsonHost.is(':hidden');
        if (showJson) {
            $jsonHost.show();
            $builderHost.css('flex', '0 0 45%');
            var editors = GLayoutBuilderState.aceEditors;
            if (editors.props) setTimeout(function () { editors.props.resize(); }, 50);
        } else {
            $jsonHost.hide();
            $builderHost.css('flex', '1');
        }
    });

    // Tab switching
    $('.mdash-lb-tab').off('click').on('click', function () {
        var tabId = $(this).data('tab');

        // Deactivate slot/prop mode when switching tabs
        if (GLayoutBuilderState.slotModeActive) {
            toggleSlotMode();
        }
        if (GLayoutBuilderState.propModeActive && tabId !== 'props') {
            togglePropMode();
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
            if (tabId === 'props' && editors.props) editors.props.resize();
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
        if (tabId === 'props') {
            updateLayoutPropsPreview();
            renderLayoutPropsBuilder(getSelectedLayout());
            if (GLayoutBuilderState.propModeActive) {
                bindPropModeEvents($('#mdash-lb-props-preview-content'));
            }
        }
    });

    // ESC: popover → prop mode → slot mode → fechar builder
    $(document).on('keydown.layoutBuilder', function (e) {
        if (e.keyCode === 27) {
            if ($('#mdash-lb-slot-popover').length) {
                hideSlotPopover();
            } else if ($('#mdash-lb-prop-popover').length) {
                hidePropPopover();
            } else if (GLayoutBuilderState.propModeActive) {
                togglePropMode();
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
    if (!GLayoutBuilderState.slotModeActive && GLayoutBuilderState.propModeActive) {
        togglePropMode();
    }
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
function syncPreviewToHtmlEditor(options) {
    options = options || {};
    var $wrapper = options.wrapper ? $(options.wrapper).first() : $('.mdash-lb-preview-card-wrapper').not('#mdash-lb-props-preview-wrapper').first();
    if (!$wrapper.length) $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    // Clonar para limpar artefactos do slot/prop mode
    var $clone = $wrapper.clone();
    $clone.find('.mdash-lb-slot-selected, .mdash-lb-prop-selected').removeClass('mdash-lb-slot-selected mdash-lb-prop-selected');
    $clone.find('.mdash-lb-slot-badge, .mdash-lb-prop-badge').remove();
    $clone.find('[data-lb-badge-host]').removeAttr('data-lb-badge-host');
    $clone.find('[data-lb-badge-empty]').removeAttr('data-lb-badge-empty');
    $clone.find('[data-lb-has-prop]').removeAttr('data-lb-has-prop');
    $clone.find('[class=""]').removeAttr('class');

    var newHtml = beautifyHtml($clone.html());

    GLayoutBuilderState.syncingFromSlotMode = true;
    GLayoutBuilderState.syncingFromPropMode = true;

    var editors = GLayoutBuilderState.aceEditors;
    if (editors.html) {
        editors.html.setValue(newHtml, -1);
    }

    if (options.updateSlots !== false) updateSlotsFromPreview($wrapper);
    if (options.updateProps !== false) updatePropsFromPreview($wrapper);

    setTimeout(function () {
        GLayoutBuilderState.syncingFromSlotMode = false;
        GLayoutBuilderState.syncingFromPropMode = false;
        updateLayoutPreview();
        renderLayoutPropsBuilder(getSelectedLayout());
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
function updateSlotsFromPreview($wrapper) {
    $wrapper = $wrapper && $wrapper.length ? $wrapper : $('.mdash-lb-preview-card-wrapper').not('#mdash-lb-props-preview-wrapper').first();
    if (!$wrapper.length) $wrapper = $('.mdash-lb-preview-card-wrapper').first();
    if (!$wrapper.length) return;

    var slots = [];
    $wrapper.find('[data-mdash-slot]').each(function () {
        var slotId = $(this).attr('data-mdash-slot');

        // Limpar artefactos do slot mode (badges do editor) ANTES de capturar
        // o conteúdo — senão o defaultContent fica poluído com HTML do editor
        // (mdash-lb-slot-badge, data-lb-badge-host…) e quebra o layout no render.
        var $clone = $(this).clone();
        $clone.find('.mdash-lb-slot-badge, .mdash-lb-prop-badge').remove();
        $clone.find('[data-lb-badge-host]').removeAttr('data-lb-badge-host');
        $clone.find('[data-lb-badge-empty]').removeAttr('data-lb-badge-empty');
        $clone.find('[data-lb-has-prop]').removeAttr('data-lb-has-prop');
        $clone.find('.mdash-lb-slot-selected').removeClass('mdash-lb-slot-selected');
        var defaultContent = $clone.html();

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

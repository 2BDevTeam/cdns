// ── Cache de cores por tipo (evita ~40 manipulações DOM repetidas) ───────────
var _colorCache = {};
function getCachedColor(type) {
    if (!_colorCache[type]) {
        _colorCache[type] = getColorByType(type);
    }
    return _colorCache[type];
}

$(document).ready(function () {
    // Pré-carregar cache de cores antes de gerar CSS
    ['primary', 'warning', 'success', 'danger', 'info'].forEach(function (t) { getCachedColor(t); });

    var styles = []
    addDashboardStyles(styles);
    addTabulatorStyles(styles);
    addBtnStyles(styles);
    otherStyles(styles);
    var globalStyle = ""
    styles.forEach(function (style) {
        globalStyle += style;
    });
    // Injectar APÓS o PHC terminar de adicionar os seus estilos ao <head>.
    // MutationObserver com debounce: injeta 150ms depois da última mutação em <head>.
    // Fallback de segurança: injeta no máximo após 2000ms mesmo sem mutações.
    var _styleTimer = null;
    var _styleInjected = false;

    function _doInjectGlobalStyle() {
        if (_styleInjected) return;
        _styleInjected = true;
        if (_styleObserver) _styleObserver.disconnect();
        clearTimeout(_styleTimer);
        $('head').append('<style>' + globalStyle + '</style>');
    }

    var _styleObserver = new MutationObserver(function () {
        clearTimeout(_styleTimer);
        _styleTimer = setTimeout(_doInjectGlobalStyle, 150);
    });
    _styleObserver.observe(document.head, { childList: true });

    // Fallback: injecta mesmo que não haja mutações (ex: PHC já não injeta mais nada)
    _styleTimer = setTimeout(_doInjectGlobalStyle, 2000);
});


function otherStyles(styles) {

    var cssString = "";
    cssString += "input::file-selector-button {";
    cssString += "    background: linear-gradient(60deg, " + getCachedColor("primary").background + ", " + getCachedColor("primary").background + ");";
    cssString += "    color: white;";
    cssString += "    border: none;";
    cssString += "    border-radius: 8px;";
    cssString += "    padding: 12px 24px;";
    cssString += "    font-size: 16px;";
    cssString += "    cursor: pointer;";
    cssString += "    transition: background 0.3s;";
    cssString += "}";
    styles.push(cssString);

}

// Formatação numérica: abreviar (K/M/B) ou formato local
function _mciAbbrevNumber(v, decimals) {
    var n = Number(v);
    if (!isFinite(n)) return v === null || v === undefined ? '—' : String(v);
    var abs = Math.abs(n);
    decimals = typeof decimals === 'number' ? decimals : (abs >= 1000 && abs < 1000000 ? 1 : 0);
    if (abs >= 1e9) return (n / 1e9).toFixed(decimals).replace(/\.0+$/, '') + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(decimals).replace(/\.0+$/, '') + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(decimals).replace(/\.0+$/, '') + 'K';
    return n.toFixed(decimals).replace(/\.0+$/, '');
}

function _mciFormatNumber(v, opts) {
    opts = opts || {};
    if (v === null || v === undefined || v === '') return '—';
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    if (opts.abbrev) return _mciAbbrevNumber(n, opts.decimals || 0);
    // default: locale format (pt-PT)
    var maxFr = typeof opts.maxFractionDigits === 'number' ? opts.maxFractionDigits : 2;
    return n.toLocaleString('pt-PT', { maximumFractionDigits: maxFr });
}

// ...existing code...
function addTabulatorStyles(styles) {
    var tabulatorCSS = "";
    tabulatorCSS += ".visualization-container {";
    tabulatorCSS += "    border: 1px solid #dee2e6;";
    tabulatorCSS += "    border-radius: 0.375rem;";
    tabulatorCSS += "    padding: 1rem;";
    tabulatorCSS += "    min-height: 400px;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-tree-level-1 {";
    tabulatorCSS += "    background-color: #f8f9fa !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-tree-level-2 {";
    tabulatorCSS += "    background-color: #e9ecef !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-tree-level-3 {";
    tabulatorCSS += "    background-color: #dee2e6 !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-tree-level-4 {";
    tabulatorCSS += "    background-color: #ced4da !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-tree-level-5 {";
    tabulatorCSS += "    background-color: #adb5bd !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator {";
    tabulatorCSS += "    background-color: white;";
    tabulatorCSS += "    border-radius: 10px;";
    tabulatorCSS += "    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);";
    tabulatorCSS += "    border: none;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-header {";
    tabulatorCSS += "    background-color:" + getCachedColor("primary").background + ";";
    tabulatorCSS += "    border-bottom: none;";
    tabulatorCSS += "    border-radius: 10px 10px 0 0;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col {";
    tabulatorCSS += "    background-color:" + getCachedColor("primary").background;
    tabulatorCSS += "    color: white;";
    tabulatorCSS += "    border-right: none;";
    tabulatorCSS += "    padding: 12px 15px;";
    tabulatorCSS += "    font-weight: 500;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col:first-child {";
    tabulatorCSS += "    border-top-left-radius: 10px;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col:last-child {";
    tabulatorCSS += "    border-top-right-radius: 10px;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row {";
    tabulatorCSS += "    border-bottom: 1px solid #e0e6ed;";
    tabulatorCSS += "    transition: background-color 0.2s ease;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row.tabulator-row-even {";
    tabulatorCSS += "    background-color: #fcfdfe;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-row:hover {";
    tabulatorCSS += "    background-color: #f5f9ff !important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-cell {";
    tabulatorCSS += "    padding: 12px 15px;";
    tabulatorCSS += "    border-right: none;";
    tabulatorCSS += "}";
    var tabulatorCSS = "";
    tabulatorCSS += ".mrend-input-cell{";
    tabulatorCSS += "    background: rgb(239, 240, 241);";
    tabulatorCSS += "    text-align: right;";
    tabulatorCSS += "    padding: 5px 15px 5px 5px;";
    tabulatorCSS += "    border-radius: 4px;";
    tabulatorCSS += "     overflow: auto; ";
    tabulatorCSS += "    width: 100%;";
    //tabulatorCSS += "    resize: none;";                /* evita resize manual */
    //tabulatorCSS += "    overflow: hidden;";            /* esconde scrollbar */
    //tabulatorCSS += "    white-space: pre-wrap;";        /* mantém quebras de linha */
    //tabulatorCSS += "    word-wrap: break-word;";        /* quebra palavras grandes */
    tabulatorCSS += "    }";
    tabulatorCSS += ".tabulator-row {";
    tabulatorCSS += "    border-bottom: 0px solid #e0e6ed!important;";
    tabulatorCSS += "    transition: background-color 0.2s ease!important;";
    tabulatorCSS += "    background-color: white;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-col-resize-handle:hover {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator .tabulator-col-resize-handle:hover {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-col:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    /* tabulatorCSS += ".tabulator-cell:hover ~ .tabulator-col-resize-handle {"
     tabulatorCSS += "border:6px solid " + getCachedColor("primary").background + "!important;"
     tabulatorCSS += "}"*/
    tabulatorCSS += ".tabulator-cell:hover + .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getCachedColor("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell input[type='checkbox'] {";
    tabulatorCSS + " -webkit-appearance: none!important;"
    tabulatorCSS += "border: 1px solid " + getCachedColor("primary").background + "!important;";
    tabulatorCSS += "accent-color: " + getCachedColor("warning").background + "!important;";
    tabulatorCSS += "transform: scale(1.7)!important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-data-tree-control{ "
    tabulatorCSS += "width:20px!important;"
    tabulatorCSS += "height:20px!important;"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-row .tabulator-cell .tabulator-data-tree-control .tabulator-data-tree-control-collapse:after{"
    tabulatorCSS += "font-size:16px!important;"
    tabulatorCSS += "color:#3f5670!important;";
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-paginator{"
    tabulatorCSS += "     display:flex!important;"
    tabulatorCSS += "     justify-content: center;"
    tabulatorCSS += "     align-items: center;"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator .tabulator-footer .tabulator-page.active {";
    tabulatorCSS += "    border-color: " + getCachedColor("primary").background + "!important;";
    tabulatorCSS += "    background-color: " + getCachedColor("primary").background + "!important;";
    tabulatorCSS += "    color: #fff!important;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator-footer{ ";
    tabulatorCSS += "     background:white!important;";
    tabulatorCSS += " }";

    styles.push(tabulatorCSS);
}

// ── applyTabulatorStylesWithJqueryMdash removida — estilos já via CSS string ──

// ...existing code...
function generateCardTimeLine(cardData) {
    var dashCard = new MDashCard(cardData);
    var ex = dashCard.extraData || {};

    // Status: dentro-prazo | prestes-expirar | expirados
    var status = (ex.status || 'dentro-prazo').toLowerCase();
    var classes = 'm-time-line-card m-time-line-' + status + (dashCard.classes ? (' ' + dashCard.classes) : '');
    var styles = dashCard.styles || '';

    var count = typeof ex.count === 'number' ? ex.count : 0;
    var title = ex.title || dashCard.title || '';
    var subtitle = ex.subtitle || '';

    // Valores por categoria
    var anotado = ex.anotado || { value: 0, transitado: 0 };
    var visado = ex.visado || { value: 0, transitado: 0 };

    var totalAnotado = (anotado.value || 0) + (anotado.transitado || 0);
    var totalVisado = (visado.value || 0) + (visado.transitado || 0);

    function pct(v, total) {
        var n = parseFloat(v) || 0;
        var t = parseFloat(total) || 0;
        if (t <= 0) return 0;
        var p = Math.round((n / t) * 100);
        return Math.max(0, Math.min(100, p));
    }

    var html = '';
    html += '<div class="' + classes + '" style="' + styles + '">';
    html += '  <div class="m-time-line-card-header">';
    html += '    <div class="m-time-line-status-count">' + count + '</div>';
    html += '    <div class="m-time-line-status-info">';
    html += '      <div class="m-time-line-status-title">' + title + '</div>';
    html += '      <div class="m-time-line-status-subtitle">' + subtitle + '</div>';
    html += '    </div>';
    html += '  </div>';

    html += '  <div class="m-time-line-details">';

    // Categoria: Anotado
    html += '    <div class="m-time-line-category">';
    html += '      <div class="m-time-line-category-header">';
    html += '        <div class="m-time-line-category-title"></div>';
    html += '      </div>';
    html += '      <div class="m-time-line-category-items">';

    // Item: Anotado
    html += '        <div class="m-time-line-detail-item m-time-line-anotado">';
    html += '          <span class="m-time-line-detail-label">Anotado</span>';
    html += '          <span class="m-time-line-detail-value">' + (anotado.value || 0) + '</span>';
    html += '          <div class="m-time-line-progress-container">';
    html += '            <div class="m-time-line-progress-bar" style="width:' + pct(anotado.value, totalAnotado) + '%;"></div>';
    html += '          </div>';
    html += '        </div>';

    // Item: Transitado (Anotado)
    html += '        <div class="m-time-line-detail-item m-time-line-transitado-anotado">';
    html += '          <span class="m-time-line-detail-label">Transitado</span>';
    html += '          <span class="m-time-line-detail-value">' + (anotado.transitado || 0) + '</span>';
    html += '          <div class="m-time-line-progress-container">';
    html += '            <div class="m-time-line-progress-bar" style="width:' + pct(anotado.transitado, totalAnotado) + '%;"></div>';
    html += '          </div>';
    html += '        </div>';

    html += '      </div>';
    html += '    </div>';

    // Categoria: Visado
    html += '    <div class="m-time-line-category">';
    html += '      <div class="m-time-line-category-header">';
    html += '        <div class="m-time-line-category-title"></div>';
    html += '      </div>';
    html += '      <div class="m-time-line-category-items">';

    // Item: Visado
    html += '        <div class="m-time-line-detail-item m-time-line-visado">';
    html += '          <span class="m-time-line-detail-label">Visado</span>';
    html += '          <span class="m-time-line-detail-value">' + (visado.value || 0) + '</span>';
    html += '          <div class="m-time-line-progress-container">';
    html += '            <div class="m-time-line-progress-bar" style="width:' + pct(visado.value, totalVisado) + '%;"></div>';
    html += '          </div>';
    html += '        </div>';

    // Item: Transitado (Visado)
    html += '        <div class="m-time-line-detail-item m-time-line-transitado-visado">';
    html += '          <span class="m-time-line-detail-label">Transitado</span>';
    html += '          <span class="m-time-line-detail-value">' + (visado.transitado || 0) + '</span>';
    html += '          <div class="m-time-line-progress-container">';
    html += '            <div class="m-time-line-progress-bar" style="width:' + pct(visado.transitado, totalVisado) + '%;"></div>';
    html += '          </div>';
    html += '        </div>';

    html += '      </div>';
    html += '    </div>';

    html += '  </div>'; // details
    html += '</div>';   // card

    return html;
}

// (Opcional) Gera o container com vários cards de timeline
function generateTimeLineCardsContainer(cardsData) {
    var html = '<div class="m-time-line-cards-container">';
    (cardsData || []).forEach(function (c) { html += generateCardTimeLine(c); });
    html += '</div>';
    return html;
}
// ...existing code...
function generateDashCardBudget(cardData) {
    var dashCard = new MDashCard(cardData);
    var id = dashCard.id || ('budget-' + (typeof generateUUID === 'function' ? generateUUID() : Date.now()));
    var classes = 'budget-card ' + (dashCard.classes || '');
    var styles = dashCard.styles || '';


    var iconClass = dashCard.icon || 'fas fa-chart-pie';

    var html = '';
    html += '<div id="' + id + '" class="' + classes + '" style="' + styles + '">';
    html += '  <div class="shape-divider"></div>';
    html += '  <div class="wave-shape"></div>';
    html += '  <div class="card-content">';
    html += '    <div>';
    html += '      <h2 class="card-title">' + (dashCard.title || '') + '</h2>';
    html += '      <p class="card-subtitle">' + (dashCard.extraData.subtitle || '') + '</p>';
    html += '    </div>';
    html += '    <div class="budget-value">' + (dashCard.extraData.value || '') + '</div>';
    html += '    <div class="budget-details">';
    html += '      <div class="budget-item">';
    html += '        <div class="budget-label">' + (dashCard.extraData.budgetLabel1 || '') + '</div>';
    html += '        <div class="budget-amount budget-amount-1">' + (dashCard.extraData.budgetAmount1 || '') + '</div>';
    html += '      </div>';
    html += '      <div class="budget-item">';
    html += '        <div class="budget-label">' + (dashCard.extraData.budgetLabel2 || '') + '</div>';
    html += '        <div class="budget-amount budget-amount-2">' + (dashCard.extraData.budgetAmount2 || '') + '</div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <div class="icon-container"><i class="' + iconClass + '"></i></div>';
    html += '  </div>';
    html += '</div>';
    return html;
}


function generateMDashCardSnapV2(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="' + (dashCard.id || 'snap-' + generateUUID()) + '" ';
    cardHTML += 'class="m-dash-card-snap-v2 ' + (dashCard.classes || '') + '" ';
    cardHTML += 'style="' + (dashCard.styles || '') + '">';
    // Conteúdo principal
    cardHTML += '  <div class="m-dash-card-snap-v2-content">';
    cardHTML += '    <div class="m-dash-card-snap-v2-icon bg-' + (dashCard.tipo || 'primary') + '">';
    cardHTML += '      <i class="material-symbols-rounded">' + (dashCard.icon || 'analytics') + '</i>';
    cardHTML += '    </div>';
    cardHTML += '    <div style="display:flex!important;flex-direction:column!important" class="m-dash-card-snap-v2-info">';
    cardHTML += ' <div>     <h4 class="m-dash-card-snap-v2-title">' + (dashCard.title || 'Card Title') + '</h4></div>';
    cardHTML += '      <div class="m-dash-card-snap-v2-value">' + (dashCard.bodyContent || '0') + '</div>';
    cardHTML += '    </div>';
    cardHTML += '  </div>';
    // Rodapé
    cardHTML += '  <div class="m-dash-card-snap-v2-footer">';
    cardHTML += '    ' + (dashCard.footer || '');
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;
}


function generateMDashCardSnap(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="' + (dashCard.id || 'snap-' + generateUUID()) + '" class="m-dash-card-snap ' + (dashCard.classes || '') + '" style="' + (dashCard.styles || '') + '">';
    // Header
    cardHTML += '  <div class="m-dash-card-snap-header p-2 ps-3">';
    cardHTML += '    <div class="d-flex justify-content-between">';
    cardHTML += '        <h4 class="">' + (dashCard.title || "Card Title") + '</h4>';
    cardHTML += '      <div class="m-dash-snap-card-body" >';
    cardHTML += '        <h4 class="mb-0">' + (dashCard.bodyContentX || "110") + '</h4>';
    cardHTML += '      </div>';
    cardHTML += '      <div class="m-dash-icon-snap m-dash-icon-snap-md m-dash-icon-snap-shape bg-gradient-' + (dashCard.tipo || 'dark') + ' shadow-' + (dashCard.tipo || 'dark') + ' shadow text-center border-radius-lg">';
    cardHTML += '        <i class="material-symbols-rounded opacity-10">' + (dashCard.icon || 'analytics') + '</i>';
    cardHTML += '      </div>';
    cardHTML += '    </div>';
    cardHTML += '  </div>';
    // Separator
    cardHTML += '  <hr class="dark horizontal my-0">';
    // Footer
    cardHTML += '  <div class="m-dash-card-snap-footer p-2 ps-3">';
    cardHTML += '    <p class="mb-0 text-sm">' + (dashCard.footer || '<span class="text-success font-weight-bolder">+0% </span>than last period') + '</p>';
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;
}

function generateBrdCardAdvancedMetric(cardData) {
    var dashCard = new MDashCard(cardData);
    var id = dashCard.id || ('metric-advanced-' + (typeof generateUUID === 'function' ? generateUUID() : Date.now()));
    var classes = 'brd-card-advanced brd-card-advanced-metrica ' + (dashCard.classes || '');
    var styles = dashCard.styles || '';
    var tipo = dashCard.tipo || 'primary';
    var iconClass = dashCard.icon || 'fas fa-chart-line';

    var html = '';
    html += '<div id="' + id + '" class="' + classes + '" style="' + styles + '">';
    html += '  <div class="brd-card-advanced-icon brd-card-advanced-icon-' + tipo + '">';
    html += ' <i class="material-symbols-rounded">analytics</i>';
    html += '  </div>';
    html += '  <div class="brd-card-advanced-content">';
    html += '    <div class="brd-card-advanced-label">' + (dashCard.title || 'Metric') + '</div>';
    // html += '    <div class="brd-card-advanced-value">' + (dashCard.extraData.value || '0') + '</div>';
    if (dashCard.extraData.subtitle) {
        html += '    <div class="brd-card-advanced-subtitle">' + dashCard.extraData.subtitle + '</div>';
    }
    html += '  </div>';
    html += '</div>';
    return html;
}

function generateBrdCardAdvancedStatus(cardData) {
    var dashCard = new MDashCard(cardData);
    var id = dashCard.id || ('status-advanced-' + (typeof generateUUID === 'function' ? generateUUID() : Date.now()));
    var classes = 'brd-card-advanced brd-card-advanced-status ' + (dashCard.classes || '');
    var styles = dashCard.styles || '';
    var tipo = dashCard.tipo || 'primary';
    var statusText = dashCard.extraData.status || 'active';
    var iconClass = dashCard.icon || 'fas fa-check-circle';

    var html = '';
    html += '<div id="' + id + '" class="' + classes + ' brd-card-advanced-status-' + tipo + '" style="' + styles + '">';
    html += '  <div class="brd-card-advanced-status-header">';
    html += '    <i class="' + iconClass + '"></i>';
    html += '    <span class="brd-card-advanced-status-badge">' + statusText + '</span>';
    html += '  </div>';
    html += '  <div class="brd-card-advanced-status-body">';
    html += '    <div class="brd-card-advanced-status-title">' + (dashCard.title || 'Status') + '</div>';
    html += '    <div class="brd-card-advanced-status-message">' + (dashCard.bodyContent || '') + '</div>';
    if (dashCard.footer) {
        html += '    <div class="brd-card-advanced-status-footer">' + dashCard.footer + '</div>';
    }
    html += '  </div>';
    html += '</div>';
    return html;
}

function generateBrdCardAdvancedAlert(cardData) {
    var dashCard = new MDashCard(cardData);
    var id = dashCard.id || ('alert-advanced-' + (typeof generateUUID === 'function' ? generateUUID() : Date.now()));
    var classes = 'brd-card-advanced brd-card-advanced-alert ' + (dashCard.classes || '');
    var styles = dashCard.styles || '';
    var tipo = dashCard.tipo || 'warning';
    var iconClass = dashCard.icon || 'fas fa-exclamation-triangle';

    var html = '';
    html += '<div id="' + id + '" class="' + classes + ' brd-card-advanced-alert-' + tipo + '" style="' + styles + '">';
    html += '  <div class="brd-card-advanced-alert-icon">';
    html += '    <i class="' + iconClass + '"></i>';
    html += '  </div>';
    html += '  <div class="brd-card-advanced-alert-content">';
    html += '    <div class="brd-card-advanced-alert-title">' + (dashCard.title || 'Alert') + '</div>';
    html += '    <div class="brd-card-advanced-alert-message">' + (dashCard.bodyContent || '') + '</div>';
    if (dashCard.footer) {
        html += '    <div class="brd-card-advanced-alert-footer">' + dashCard.footer + '</div>';
    }
    html += '  </div>';
    html += '</div>';
    return html;
}
// ...existing code...
function generateDashCardSnapshot(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="' + (dashCard.id || 'snapshot-' + generateUUID()) + '" class="m-dash-item snapshot ' + (dashCard.classes || '') + '" style="' + (dashCard.styles || '') + '">';
    cardHTML += '  <div class="stats-card-value-container">';
    cardHTML += '    <span class="stats-card-label">' + (dashCard.title || "") + '</span>';
    cardHTML += '    <div class="stats-card-body">' + (dashCard.bodyContent || "") + '</div>';
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;
}
function generateDashCardStandard(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="' + dashCard.id + '" class="m-dash-item ' + (dashCard.classes || '') + '" style="height: 100%!important;' + (dashCard.styles || '') + '">';
    cardHTML += '  <h1 class="m-dash-item-title">' + (dashCard.title || "Gráfico") + '</h1>';
    cardHTML += "<div class='m-dash-standard-card-body' >" + (dashCard.bodyContent || "") + "</div>";
    cardHTML += '</div>';
    return cardHTML;
}

// ── Custom Code Object Type ─────────────────────────────────────────────────
// Permite ao utilizador escrever JavaScript personalizado que é executado
// com acesso directo ao containerSelector, data (rows), config e jQuery.
// Funciona tanto no builder (editor) como no dashboard renderizado (mdash.html).
// ────────────────────────────────────────────────────────────────────────────

var _CUSTOMCODE_SAMPLE_CONFIG = {
    code: '// Variáveis disponíveis:\n// containerSelector — selector CSS do slot (string)\n// $container       — $(containerSelector)\n// $scope / $item   — âmbito do item (card inteiro)\n// querySelector()  — procura APENAS dentro do item\n// data             — array de registos da fonte\n// config           — objecto de configuração\n// itemObject       — MdashContainerItemObject\n// fetchData()      — dados da fonte+transform\n\n$scope.find(\'#meuElemento\').css(\'color\', \'red\');',
    cssCode: '',
    executeOnEdit: false
};

function mdashResolveCustomCodeScope(dados) {
    var $container = $(dados.containerSelector);
    var itemSelector = null;
    var $item = $();

    if (dados.containerItem && dados.containerItem.mdashcontaineritemstamp) {
        itemSelector = ".mdash-canvas-item[data-stamp='" + dados.containerItem.mdashcontaineritemstamp + "']";
        $item = $(itemSelector);
        if (!$item.length && dados.containerItem.id) {
            itemSelector = '#' + dados.containerItem.id;
            $item = $(itemSelector);
        }
    }
    if (!$item.length) {
        $item = $container.closest('.mdash-canvas-item, .m-dash-item');
        if ($item.length && $item.attr('id')) {
            itemSelector = '#' + $item.attr('id');
        }
    }

    var $scope = $item.length ? $item : $container;
    return {
        itemSelector: itemSelector,
        $item: $item,
        $scope: $scope,
        querySelector: function (sel) {
            if (!sel) return null;
            var found = $scope.find(sel);
            return found.length ? found.get(0) : null;
        },
        querySelectorAll: function (sel) {
            if (!sel) return [];
            return $scope.find(sel).toArray();
        }
    };
}

function _customCodeEditorShellHtml(executing) {
    var msg = executing
        ? 'customCode — preview no editor (âmbito do item)'
        : 'customCode — protegido no editor';
    return '<div class="mdash-customcode-editor-shell"><i class="fa fa-code"></i> ' + msg + '</div>';
}

function _customCodeShowEditorShell($container, executing) {
    $container.html(_customCodeEditorShellHtml(executing));
}

/** Garante shell visível nos blocos customCode do editor (após re-render do slot). */
function mdashRefreshCustomCodeEditorShells(objects) {
    if (typeof mdashIsEditorMode === 'function' && !mdashIsEditorMode()) return;
    (objects || []).forEach(function (obj) {
        if ((obj.tipo || '') !== 'customCode') return;
        var $render = $('#mdash-slot-render-' + obj.mdashcontaineritemobjectstamp);
        if (!$render.length) return;
        var cfg = obj.config || {};
        if (typeof cfg === 'string') {
            try { cfg = JSON.parse(cfg); } catch (e) { cfg = {}; }
        }
        _customCodeShowEditorShell($render, cfg.executeOnEdit === true);
    });
}
window.mdashRefreshCustomCodeEditorShells = mdashRefreshCustomCodeEditorShells;

// ── Renderer ────────────────────────────────────────────────────────────────
function renderObjectCustomCode(dados) {
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_CUSTOMCODE_SAMPLE_CONFIG));
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var sel = dados.containerSelector;

    // PRIORIDADE: transformConfig SEMPRE tem prioridade sobre dados.data
    var rows = [];
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
            }
        } catch (e) { /* silêncio */ }
    }
    
    // Fallback: usar dados.data se não há transformConfig ou se a transformação falhou
    if (rows.length === 0 && dados.data && dados.data.length > 0) {
        rows = dados.data;
    }

    var code = cfg.code || '';
    var cssCode = cfg.cssCode || '';
    var inEditor = dados.isEditor === true
        || (typeof mdashIsEditorMode === 'function' && mdashIsEditorMode())
        || $('.mdash-editor-wrapper').length > 0;
    var executeOnEdit = cfg.executeOnEdit === true;
    var scope = mdashResolveCustomCodeScope(dados);
    var $container = $(sel);

    if (!code) {
        $container.html(
            '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">'
            + '<i class="fa fa-code" style="font-size:24px;display:block;margin-bottom:6px;opacity:.5;"></i>'
            + 'Código personalizado — sem código definido'
            + '</div>'
        );
        return;
    }

    if (inEditor && !executeOnEdit) {
        _customCodeShowEditorShell($container, false);
        return;
    }

    // Inject scoped CSS inside the item (não polui o <head> nem o editor global)
    var styleId = 'mcc-style-' + stamp;
    $('#' + styleId).remove();
    scope.$scope.find('#' + styleId).remove();
    if (cssCode) {
        scope.$scope.append('<style id="' + styleId + '">' + cssCode + '</style>');
    }

    if (inEditor) {
        _customCodeShowEditorShell($container, true);
    }

    // ── Helper: fetchData() — obtém dados da fonte + transform configurada ──
    var _ccItemObject = dados.itemObject;
    var fetchData = function () {
        var resolved = mdashResolveObjectData(_ccItemObject, []);
        if (resolved.data && resolved.data.length > 0) return resolved.data;
        // Fallback: tenta transform directo
        var tc = _ccItemObject.transformConfig || cfg.transformConfig || null;
        if (tc && tc.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
            try {
                var r = MdashTransformBuilder.executeRaw(tc);
                if (!r.error && r.rows && r.columns && r.rows.length > 0) {
                    return r.rows.map(function (row) {
                        var obj = {};
                        r.columns.forEach(function (c, i) { obj[c] = row[i]; });
                        return obj;
                    });
                }
            } catch (e) { console.warn('[CustomCode] fetchData transform error:', e.message); }
        }
        return [];
    };
    // Execute user code via Function constructor (safer than eval, no access to local scope)
    try {
        var fn = new Function(
            'containerSelector', '$container', 'data', 'config', 'itemObject', '$', 'fetchData',
            'itemSelector', '$item', '$scope', 'querySelector', 'querySelectorAll', 'isEditor',
            code
        );
        fn(
            sel, $container, rows, cfg, dados.itemObject, $, fetchData,
            scope.itemSelector, scope.$item, scope.$scope,
            scope.querySelector, scope.querySelectorAll, inEditor
        );
        if (inEditor) {
            $container.find('.mdash-customcode-editor-error').remove();
        }
    } catch (err) {
        if (inEditor) {
            _customCodeShowEditorShell($container, executeOnEdit);
            $container.append(
                '<div class="mdash-customcode-editor-error" style="padding:6px 8px;margin-top:4px;font-size:10px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;">'
                + '<i class="glyphicon glyphicon-exclamation-sign"></i> '
                + $('<span>').text(err.message || String(err)).html()
                + '</div>'
            );
        } else {
            $container.html(
                '<div style="padding:12px;font-size:12px;">'
                + '<div style="color:#dc2626;font-weight:700;margin-bottom:4px;"><i class="glyphicon glyphicon-exclamation-sign"></i> Erro no código personalizado</div>'
                + '<pre style="background:#fff5f5;border:1px solid #fecaca;color:#991b1b;padding:8px;border-radius:6px;font-size:11px;white-space:pre-wrap;max-height:200px;overflow:auto;">'
                + $('<span>').text(err.message || String(err)).html()
                + '</pre></div>'
            );
        }
    }
}

// ── Inline Properties Editor ────────────────────────────────────────────────
function renderCustomCodePropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_CUSTOMCODE_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    _mciCSS();

    // ── fire() — debounce save + re-render ──
    var _timer = null;

    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mcc-root').length) return;
            _ccReadConfig(panel, obj);
            // Sincronizar a invariante triplicada antes de persistir
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }
    panel.data('_mciTimer', _timer);

    // ── Transform badge — SEMPRE usar obj.transformConfig (root level) como fonte de verdade ──
    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);

    // ── Section: Dados (fonte + transform) ──
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '')
                + '>' + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('')
        + '</select></div>'
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-pencil"></i> Configurar')
        + '</button>'
        + '</div>';

    // ── Section: Código JavaScript ──
    var codeValue = cfg.code || _CUSTOMCODE_SAMPLE_CONFIG.code;
    var sCodigo = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">JavaScript</label>'
        + '<button type="button" class="btn btn-xs btn-default mcc-expand-code" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mcc-ace-' + stamp + '" class="mcc-ace-editor" style="width:100%;height:220px;border:1px solid rgba(0,0,0,.12);border-radius:6px;">'
        + '</div>'
        + '</div>';

    // ── Section: CSS ──
    var cssValue = cfg.cssCode || '';
    var sCSS = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">CSS (opcional)</label>'
        + '<button type="button" class="btn btn-xs btn-default mcc-expand-css" title="Editar CSS em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mcc-ace-css-' + stamp + '" class="mcc-ace-editor" style="width:100%;height:100px;border:1px solid rgba(0,0,0,.12);border-radius:6px;">'
        + '</div>'
        + '</div>';

    // ── Section: Opções ──
    var sOpcoes = '<div class="mcbi-field mcc-exec-edit-field">'
        + _mciChk('mcc-exec-edit', 'Executar no editor (preview no âmbito do item)', cfg.executeOnEdit === true)
        + '<p style="margin:6px 0 0;font-size:10px;color:#94a3b8;line-height:1.5;">Por defeito o código <strong>não corre</strong> no editor, para não afectar outros widgets. Use <code>$scope</code> ou <code>querySelector()</code> em vez de <code>document.querySelector</code>.</p>'
        + '</div>'
        + '<div class="mcbi-field">'
        + '<label>Campos disponíveis</label>'
        + '<div class="mcc-fields-list" style="font-size:10px;color:#64748b;max-height:120px;overflow:auto;">'
        + (fields.length ? fields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ') : '<em>Sem campos — seleccione uma fonte</em>')
        + '</div></div>';

    // ── Ajuda ──
    var sAjuda = '<div style="font-size:10.5px;color:#64748b;line-height:1.6;">'
        + '<p style="margin:0 0 6px;"><strong>Variáveis disponíveis:</strong></p>'
        + '<code>containerSelector</code> — selector do slot (string)<br>'
        + '<code>$container</code> — $(containerSelector)<br>'
        + '<code>itemSelector</code> — selector do item/card<br>'
        + '<code>$item</code> / <code>$scope</code> — jQuery do item inteiro<br>'
        + '<code>querySelector(sel)</code> — procura só dentro do item<br>'
        + '<code>querySelectorAll(sel)</code> — lista de elementos no item<br>'
        + '<code>data</code> — array de registos [{campo: valor}, ...]<br>'
        + '<code>config</code> — objecto de configuração<br>'
        + '<code>itemObject</code> — MdashContainerItemObject<br>'
        + '<code>$</code> — jQuery<br>'
        + '<code>fetchData()</code> — dados da fonte+transform<br>'
        + '<code>isEditor</code> — true no editor de configuração<br>'
        + '<hr style="margin:8px 0;border-color:rgba(0,0,0,.06);">'
        + '<p style="margin:0 0 4px;color:#b45309;"><strong>Âmbito:</strong> evite <code>document.querySelector</code> — use <code>querySelector(\'#id\')</code> ou <code>$scope.find(\'#id\')</code> para afectar apenas este item.</p>'
        + '<p style="margin:0;"><strong>Exemplo:</strong></p>'
        + '<pre style="background:rgba(0,0,0,.03);padding:8px;border-radius:5px;font-size:10px;margin:4px 0 0;">'
        + 'var el = querySelector(\'#progressOcp\');\nif (el && data[0]) {\n  el.style.width = data[0].percentagem + \'%\';\n}'
        + '</pre></div>';

    // ── Assemble HTML ──
    var html = '<div class="mcbi-root mcc-root" data-stamp="' + stamp + '">'
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('codigo', 'Código JavaScript', 'glyphicon-console', true, sCodigo)
        + _mciSection('css', 'CSS', 'glyphicon-tint', false, sCSS)
        + _mciSection('opcoes', 'Opções', 'glyphicon-cog', false, sOpcoes)
        + _mciSection('ajuda', 'Ajuda', 'glyphicon-question-sign', false, sAjuda)
        + '</div>';

    panel.html(html);

    // ── Init ACE editors ──
    var aceJsId = 'mcc-ace-' + stamp;
    var aceCssId = 'mcc-ace-css-' + stamp;
    var aceJs = null, aceCss = null;

    if (typeof ace !== 'undefined') {
        // JS editor
        aceJs = ace.edit(aceJsId);
        aceJs.session.setMode('ace/mode/javascript');
        aceJs.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceJs.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 30, minLines: 8 });
        aceJs.setValue(codeValue, -1);
        aceJs.on('change', function () { fire(); });

        // CSS editor
        aceCss = ace.edit(aceCssId);
        aceCss.session.setMode('ace/mode/css');
        aceCss.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceCss.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 15, minLines: 3 });
        aceCss.setValue(cssValue, -1);
        aceCss.on('change', function () { fire(); });
    }

    // ── Store ace references on panel for readConfig ──
    panel.data('_mccAceJs', aceJs);
    panel.data('_mccAceCss', aceCss);

    // ── Event handlers ──
    panel.off(); // Limpar TODOS os handlers (incluindo de outros tipos de objetos)

    // Section collapse
    panel.on('click.mcbi', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
        // Resize ACE editors when section opens
        if (open && aceJs) setTimeout(function () { aceJs.resize(); if (aceCss) aceCss.resize(); }, 50);
    });

    // Fonte change
    panel.on('change.mcbi', '.mcbi-fonte', function () {
        var newStamp = $(this).val();
        _mciOnFonteSelected(newStamp, obj, panel, function () {
            var newFields = _mciGetFields(obj);
            panel.find('.mcc-fields-list').html(
                newFields.length
                    ? newFields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                    : '<em>Sem campos — seleccione uma fonte</em>'
            );
            fire();
        });
    });

    // Transform button
    panel.on('click.mcbi', '.mcbi-btn-transform', function () {
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var fonteStamp = obj.fontestamp;
        var fonte = fonteStamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
        var tbl = (fonte && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(fonte) : null;
        
        // Se não há transformConfig existente E temos fonte válida, criar config inicial
        if (!currentTC && tbl && typeof MdashTransformBuilder !== 'undefined') {
            currentTC = MdashTransformBuilder.autoConfig(tbl, 'CustomCode');
        }
        
        // Se ainda não há config (sem fonte), criar config vazio
        if (!currentTC) {
            currentTC = {
                sourceTable: '',
                mode: 'visual',
                columns: [],
                measures: [],
                filters: [],
                orderBy: [],
                limit: null,
                sqlFree: ''
            };
        }
        
        _mciOpenTransformModalFor({
            title: 'Transformação — Código Personalizado',
            fonteName: fonte ? (fonte.descricao || fonte.codigo) : '',
            fonte: fonte || null,
            objectType: 'CustomCode',
            modalId: 'mcc-transform-modal',
            hostId: 'mcc-transform-modal-host',
            config: currentTC,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.transformconfigjson = JSON.stringify(newT);
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                // Update badge
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                // Refresh fields
                var newFields = _mciGetFields(obj);
                panel.find('.mcc-fields-list').html(
                    newFields.length
                        ? newFields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                        : '<em>Sem campos</em>'
                );
                fire();
            }
        });
    });

    // Expand JS editor to full screen modal
    panel.on('click.mcbi', '.mcc-expand-code', function () {
        _mccOpenEditorModal('javascript', aceJs, function (newVal) {
            if (aceJs) aceJs.setValue(newVal, -1);
            fire();
        });
    });

    // Expand CSS editor to full screen modal
    panel.on('click.mcbi', '.mcc-expand-css', function () {
        _mccOpenEditorModal('css', aceCss, function (newVal) {
            if (aceCss) aceCss.setValue(newVal, -1);
            fire();
        });
    });

    // Evita scroll ao focar o input escondido do toggle
    panel.on('mousedown.mcbi', '.mcc-exec-edit-field .mcbi-chk', function (e) {
        e.preventDefault();
    });

    // Toggle "executar no editor" — preview imediato sem rebuild do painel nem AJAX bloqueante
    panel.on('change.mcbi', '.mcc-exec-edit', function () {
        var checked = this.checked;
        $(this).closest('.mcbi-chk').toggleClass('is-on', checked);
        var scrollState = _mciCaptureEditorScrollState();

        obj.config = obj.config || {};
        obj.config.executeOnEdit = checked;
        if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();

        _mciRerender(obj, { preserveFocus: true });

        setTimeout(function () {
            _mciRestoreEditorScrollState(scrollState);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(obj, obj.table, obj.idfield);
            }
            _mciRestoreEditorScrollState(scrollState);
        }, 0);
    });

    // Outros checkboxes
    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]:not(.mcc-exec-edit)', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });
}

// ── Full-screen editor modal ────────────────────────────────────────────────
function _mccOpenEditorModal(mode, aceRef, onApply) {
    var modalId = 'mcc-editor-fullscreen-modal';
    $('#' + modalId).remove();

    var currentVal = aceRef ? aceRef.getValue() : '';
    var aceMode = mode === 'css' ? 'ace/mode/css' : 'ace/mode/javascript';
    var title = mode === 'css' ? 'Editar CSS' : 'Editar JavaScript';

    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
        + '<div class="modal-dialog" style="width:90%;margin:2% auto;" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-header" style="padding:8px 14px;">'
        + '  <button type="button" class="close" data-dismiss="modal">&times;</button>'
        + '  <h4 class="modal-title" style="font-size:14px;"><i class="glyphicon glyphicon-pencil"></i> ' + title + '</h4>'
        + '</div>'
        + '<div class="modal-body" style="padding:0;">'
        + '  <div id="mcc-modal-ace-editor" style="width:100%;height:calc(80vh - 100px);"></div>'
        + '</div>'
        + '<div class="modal-footer" style="padding:8px 14px;">'
        + '  <button type="button" class="btn btn-primary btn-sm" id="mcc-editor-modal-save"><i class="glyphicon glyphicon-floppy-disk"></i> Aplicar</button>'
        + '  <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancelar</button>'
        + '</div>'
        + '</div></div></div>';

    $('body').append(mHtml);
    var $modal = $('#' + modalId);
    $modal.modal('show');

    $modal.on('shown.bs.modal', function () {
        var modalAce = ace.edit('mcc-modal-ace-editor');
        modalAce.session.setMode(aceMode);
        modalAce.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        modalAce.setOptions({ fontSize: '13px', showPrintMargin: false, wrap: true });
        modalAce.setValue(currentVal, -1);
        modalAce.focus();

        $('#mcc-editor-modal-save').off('click').on('click', function () {
            var newValue = modalAce.getValue();
            if (onApply) onApply(newValue);
            $modal.modal('hide');
        });
    });
    $modal.on('hidden.bs.modal', function () { $(this).remove(); });
}

// ── Editor genérico de expressão JS multilinha (standalone — não precisa de ACE já criado) ──
// Usado por campos que aceitam texto simples OU expressão/código JS (ex: Nome da série).
function _mciOpenExprEditorModal(currentVal, onApply, opts) {
    opts = opts || {};
    var modalId = 'mci-exprjs-modal';
    $('#' + modalId).remove();

    var useAce = (typeof ace !== 'undefined' && ace.edit);
    var bodyHtml = useAce
        ? '<div id="mci-exprjs-ace" style="width:100%;height:calc(70vh - 120px);min-height:220px;"></div>'
        : '<textarea id="mci-exprjs-ta" class="form-control" style="width:100%;height:calc(70vh - 120px);min-height:220px;font-family:monospace;font-size:12px;" spellcheck="false"></textarea>';

    var title = opts.title || 'Expressão JS';
    var help = opts.help || 'Texto simples ou expressão/código JS.';

    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
        + '<div class="modal-dialog" style="width:80%;max-width:1000px;margin:4% auto;" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-header" style="padding:8px 14px;">'
        + '  <button type="button" class="close" data-dismiss="modal">&times;</button>'
        + '  <h4 class="modal-title" style="font-size:14px;"><i class="glyphicon glyphicon-console"></i> ' + _mciEsc(title)
        + ' <small style="opacity:.75;font-size:11px;">' + help + '</small></h4>'
        + '</div>'
        + '<div class="modal-body" style="padding:0;">' + bodyHtml + '</div>'
        + '<div class="modal-footer" style="padding:8px 14px;">'
        + '  <button type="button" class="btn btn-primary btn-sm" id="mci-exprjs-apply"><i class="glyphicon glyphicon-ok"></i> Aplicar</button>'
        + '  <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancelar</button>'
        + '</div>'
        + '</div></div></div>';

    $('body').append(mHtml);
    var $modal = $('#' + modalId);
    $modal.css('z-index', 10600);
    $modal.modal('show');

    $modal.on('shown.bs.modal', function () {
        $('.modal-backdrop').last().css('z-index', 10590);
        var getValue;
        if (useAce) {
            var ed = ace.edit('mci-exprjs-ace');
            ed.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
            ed.session.setMode('ace/mode/javascript');
            ed.setOptions({ fontSize: '13px', showPrintMargin: false, wrap: true });
            ed.setValue(currentVal || '', -1);
            ed.focus();
            getValue = function () { return ed.getValue(); };
        } else {
            var $ta = $('#mci-exprjs-ta').val(currentVal || '');
            $ta.focus();
            getValue = function () { return $ta.val(); };
        }

        $('#mci-exprjs-apply').off('click').on('click', function () {
            var val = String(getValue() || '');
            if (onApply) onApply(val);
            $modal.modal('hide');
        });
    });
    $modal.on('hidden.bs.modal', function () {
        if (useAce) { try { ace.edit('mci-exprjs-ace').destroy(); } catch (e) { } }
        $(this).remove();
        if ($('.modal.in').length) $('body').addClass('modal-open');
    });
}

// ── Read config from panel ──────────────────────────────────────────────────
function _ccReadConfig(panel, obj) {
    var cfg = obj.config || {};
    var aceJs = panel.data('_mccAceJs');
    var aceCss = panel.data('_mccAceCss');

    cfg.code = aceJs ? aceJs.getValue() : (cfg.code || '');
    cfg.cssCode = aceCss ? aceCss.getValue() : (cfg.cssCode || '');
    cfg.executeOnEdit = panel.find('.mcc-exec-edit').is(':checked');
    // Preservar transformConfig de obj.config OU obj.transformConfig (fallback)
    cfg.transformConfig = cfg.transformConfig || obj.transformConfig || null;

    obj.config = cfg;
    obj.transformConfig = cfg.transformConfig;
    
    // NÃO atualizar configjson ou transformconfigjson manualmente!
    // stringifyJSONFields() será chamado no fire() e fará a sincronização completa
}


function crateDynamicSchemaCustomCode(data) {
    return {
        type: "object",
        title: "Configuração de gráficos",
        properties: {
            title: {
                type: "object",
                title: "Código JS",
                properties: {
                    text: {
                        type: "string",
                        title: "Código JS",
                        'default': "// Exemplo de código\nconsole.log('Hello, World!');"
                    },
                }
            }
        }
    };
}
// ============================================================================
// TABLE OBJECT TYPE — Tabela de dados moderna (Tabulator.js)
// Segue os padrões de chart, text e customCode.
// ============================================================================

var _TABLE_SAMPLE_CONFIG = {
    layout: 'fitColumns',
    height: 'auto',
    maxHeight: '420px',
    pagination: { enabled: false, size: 15 },
    headerFilter: false,
    resizableColumns: true,
    movableColumns: false,
    selectable: false,
    stripedRows: true,
    hoverHighlight: true,
    responsiveLayout: 'collapse',
    theme: 'corporate',
    columns: [],
    autoColumns: true,
    dataTree: { enabled: false, parentField: 'id', childField: 'parentId', startExpanded: true },
    dataRowStyle: {
        background: '#f8fafc',
        textColor: '#334155',
        fontSize: 0,
        fontWeight: '',
        fontFamily: ''
    },
    structuredRows: {
        enabled: false,
        groupLevels: [
            { field: '', bg: '#eef4ff', text: 'phc:primary', accent: 'phc:primary', bullet: 'circle' },
            { field: '', bg: '#f8fafc', text: '#334155', accent: 'phc:info', bullet: 'diamond' }
        ],
        levelStyles: [],
        typeField: '__rowType',
        levelField: '__rowLevel',
        sectionValue: 'section',
        dataValue: 'data',
        totalValue: 'total',
        backgroundField: '__rowBackground',
        textColorField: '__rowTextColor',
        accentColorField: '__rowAccentColor',
        sectionBg: '#eef4ff',
        sectionText: 'phc:primary',
        sectionAccent: 'phc:primary',
        sectionBullet: 'circle',
        dataRowBg: '#f8fafc',
        subgroupBg: '#f8fafc',
        subgroupText: '#334155',
        subgroupAccent: 'phc:info',
        subgroupBullet: 'diamond',
        totalBg: '#eef4ff',
        totalText: '#0f172a',
        totalAccent: 'phc:primary',
        totalBullet: 'bar'
    },
    exportOptions: { enableExcel: true, enablePDF: false },
    styling: {
        headerBg: 'phc:primary',
        headerBackgroundColor: 'phc:primary',
        headerText: '#ffffff',
        headerTextColor: '#ffffff',
        borderRadius: 16,
        fontSize: 11,
        rowHeight: 'normal',
        accentColor: 'phc:primary'
    },
    footer: { showRowCount: true, showColumnsInfo: false },
    filters: {
        enabled: false,
        position: 'top',
        activeFilterKey: null,
        definitions: []
    }
};

function _tblGetExecutiveSampleRows() {
    return [
        { __rowType: 'section', indicador: 'FATURACAO' },
        { __rowType: 'data', __rowLevel: 1, indicador: 'Faturacao', anoAtualAcumulada: 29765412.09, anoAtualMediaMensal: 11392520.83, anoAtualMensal: 6980370.43, anoAnteriorAcumulada: 17069543.95, anoAnteriorMensal: 6486247.26, variacaoAcumulada: 74.4 },
        { __rowType: 'data', __rowLevel: 1, indicador: 'Rentabilidade', anoAtualAcumulada: 22740853.32, anoAtualMediaMensal: 8968486.48, anoAtualMensal: 4803880.35, anoAnteriorAcumulada: 13864607.45, anoAnteriorMensal: 5767487.24, variacaoAcumulada: 64.0 },
        { __rowType: 'section', indicador: 'COMPRAS' },
        { __rowType: 'data', __rowLevel: 1, indicador: 'Compras', anoAtualAcumulada: 9537459.78, anoAtualMediaMensal: 3241919.36, anoAtualMensal: 2984974.05, anoAnteriorAcumulada: 12601929.62, anoAnteriorMensal: 5604214.27, variacaoAcumulada: -24.3 },
        { __rowType: 'section', indicador: 'TESOURARIA' },
        { __rowType: 'data', __rowLevel: 1, indicador: 'Recebimentos', anoAtualAcumulada: 28449748.09, anoAtualMediaMensal: 12144062.32, anoAtualMensal: 4161623.44, anoAnteriorAcumulada: 132366740.95, anoAnteriorMensal: 8110374.13, variacaoAcumulada: -78.5 },
        { __rowType: 'data', __rowLevel: 1, indicador: 'Pagamentos', anoAtualAcumulada: 21154446.01, anoAtualMediaMensal: 10202229.73, anoAtualMensal: 749986.55, anoAnteriorAcumulada: 134557910.96, anoAnteriorMensal: 7800576.21, variacaoAcumulada: -84.3 },
        { __rowType: 'total', __rowLevel: 1, indicador: 'Saldo', anoAtualAcumulada: 7295302.08, anoAtualMediaMensal: 1941832.59, anoAtualMensal: 3411636.89, anoAnteriorAcumulada: -2191170.01, anoAnteriorMensal: 309797.92, variacaoAcumulada: 9.5 }
    ];
}

function _tblGetExecutiveSampleColumns() {
    return [
        { title: 'Indicador', field: 'indicador', minWidth: 150, semantic: 'indicator', headerSort: false, frozen: true },
        {
            title: 'Ano Atual',
            headerHozAlign: 'center',
            columns: [
                { title: 'Acumulada', field: 'anoAtualAcumulada', minWidth: 120, semantic: 'moneyStrong', headerSort: false },
                { title: 'Media mensal', field: 'anoAtualMediaMensal', minWidth: 110, semantic: 'moneySoft', headerSort: false },
                { title: 'Mensal', field: 'anoAtualMensal', minWidth: 105, semantic: 'moneySoft', headerSort: false }
            ]
        },
        {
            title: 'Ano Anterior',
            headerHozAlign: 'center',
            columns: [
                { title: 'Acumulada', field: 'anoAnteriorAcumulada', minWidth: 120, semantic: 'moneyMuted', headerSort: false },
                { title: 'Mensal', field: 'anoAnteriorMensal', minWidth: 105, semantic: 'moneyMuted', headerSort: false }
            ]
        },
        {
            title: 'Variacao acum.',
            field: 'variacaoAcumulada',
            minWidth: 100,
            formatter: 'conditional',
            conditional: _tblGetDeltaPercentConditionalTemplate('variacaoAcumulada'),
            headerSort: false,
            hozAlign: 'center',
            sorter: 'number'
        }
    ];
}

function _tblGetExecutiveSampleFieldNames() {
    var sampleRow = _tblGetExecutiveSampleRows().find(function (rowItem) {
        return rowItem && rowItem.__rowType !== 'section';
    }) || {};
    return Object.keys(sampleRow).filter(function (key) {
        return key.indexOf('__') !== 0;
    });
}

function _tblHasColumnGroups(columns) {
    return Array.isArray(columns) && columns.some(function (column) {
        return column && Array.isArray(column.columns) && column.columns.length;
    });
}

function _tblCountLeafColumns(column) {
    if (!column) return 0;
    if (!Array.isArray(column.columns) || !column.columns.length) return 1;
    return column.columns.reduce(function (total, child) {
        return total + _tblCountLeafColumns(child);
    }, 0);
}

function _tblFlattenColumnDefs(columns) {
    var flat = [];
    (columns || []).forEach(function (column) {
        if (column && Array.isArray(column.columns) && column.columns.length) {
            flat = flat.concat(_tblFlattenColumnDefs(column.columns));
        } else if (column) {
            flat.push(column);
        }
    });
    return flat;
}

function _tblCompactGroupedColumns(columns) {
    (columns || []).forEach(function (column) {
        if (!column) return;
        if (Array.isArray(column.columns) && column.columns.length) {
            _tblCompactGroupedColumns(column.columns);
            return;
        }

        var maxMinWidth = 108;
        if (column.semantic === 'indicator' || column.field === 'indicador') maxMinWidth = 150;
        if (column.semantic === 'deltaBadge' || column.formatter === 'conditional') maxMinWidth = 92;

        var currentMinWidth = parseInt(column.minWidth, 10);
        if (!currentMinWidth || currentMinWidth > maxMinWidth) column.minWidth = maxMinWidth;
        if (column.width && parseInt(column.width, 10) > maxMinWidth * 1.35) delete column.width;
    });
    return columns;
}

function _tblBuildExecutiveHeader(columns) {
    if (!_tblHasColumnGroups(columns)) return '';
    var leafColumns = _tblFlattenColumnDefs(columns);
    var gridTemplate = leafColumns.map(function (column) {
        var basis = parseInt(column.width || column.minWidth, 10);
        return basis > 0 ? 'minmax(' + basis + 'px,1fr)' : 'minmax(110px,1fr)';
    }).join(' ');
    var topHtml = '';
    var childHtml = '';
    var cursor = 1;

    (columns || []).forEach(function (column) {
        var span = _tblCountLeafColumns(column);
        var title = _mciEsc(column.title || column.field || '');
        var groupBg = _tblResolveColorToken(column.headerColor, '');
        var groupStyle = groupBg ? ('background:' + groupBg + ' !important;') : '';
        if (Array.isArray(column.columns) && column.columns.length) {
            topHtml += '<div class="mtbl-exec-header__cell is-group" style="grid-column:' + cursor + ' / span ' + span + ';grid-row:1;' + groupStyle + '">' + title + '</div>';
            column.columns.forEach(function (child, childIndex) {
                var childBg = _tblResolveColorToken(child.headerColor, '') || groupBg;
                var childStyle = childBg ? ('background:' + childBg + ' !important;') : '';
                childHtml += '<div class="mtbl-exec-header__cell" style="grid-column:' + (cursor + childIndex) + ';grid-row:2;' + childStyle + '">'
                    + _mciEsc(child.title || child.field || '') + '</div>';
            });
        } else {
            var leafStyle = groupBg ? ('background:' + groupBg + ' !important;') : '';
            topHtml += '<div class="mtbl-exec-header__cell is-rowspan" style="grid-column:' + cursor + ';grid-row:1 / span 2;' + leafStyle + '">' + title + '</div>';
        }
        cursor += span;
    });

    return '<div class="mtbl-exec-header">'
        + '<div class="mtbl-exec-header__inner" style="grid-template-columns:' + gridTemplate + ';">'
        + topHtml + childHtml + '</div></div>';
}

// Alinha o cabeçalho executivo (estático) com as colunas reais do Tabulator
// (escondidas via CSS) e sincroniza o scroll horizontal do corpo com o
// cabeçalho, já que são dois elementos DOM independentes.
function _tblSyncExecHeaderLayout(table, wrapId) {
    var wrapEl = document.getElementById(wrapId);
    if (!wrapEl) return;
    var innerEl = wrapEl.querySelector('.mtbl-exec-header__inner');
    var holderEl = wrapEl.querySelector('.tabulator-tableholder');
    if (!innerEl || !holderEl) return;

    try {
        var widths = table.getColumns().map(function (col) {
            var w = col.getWidth();
            return (w > 0 ? w : 110) + 'px';
        });
        if (widths.length) innerEl.style.gridTemplateColumns = widths.join(' ');
    } catch (e) { /* ignore */ }

    if (!holderEl._mdashExecHeaderScrollBound) {
        holderEl._mdashExecHeaderScrollBound = true;
        holderEl.addEventListener('scroll', function () {
            innerEl.style.transform = 'translateX(-' + holderEl.scrollLeft + 'px)';
        }, { passive: true });
    }
}

// Sincroniza o rodapé (paginação) com o mesmo scroll horizontal do corpo da
// tabela — evita um 2º scrollbar independente no footer (ver nota em _tblCSS
// junto de .tabulator-footer). Aplica-se a todas as tabelas, não só às
// agrupadas.
function _tblSyncFooterScroll(wrapId) {
    var wrapEl = document.getElementById(wrapId);
    if (!wrapEl) return;
    var holderEl = wrapEl.querySelector('.tabulator-tableholder');
    if (!holderEl || holderEl._mdashFooterScrollBound) return;
    holderEl._mdashFooterScrollBound = true;
    holderEl.addEventListener('scroll', function () {
        var footerInner = wrapEl.querySelector('.tabulator-footer-contents');
        if (footerInner) footerInner.style.transform = 'translateX(-' + holderEl.scrollLeft + 'px)';
    }, { passive: true });
}

// Garante que a área de scroll do corpo é sempre larga o suficiente para
// revelar o rodapé por completo — sem isto, quando as colunas cabem no ecrã
// (sem overflow próprio) mas o rodapé é mais largo (paginação com muitas
// páginas), não existe scroll nenhum e o rodapé fica cortado sem forma de o
// alcançar. Aplica-se min-width ao .tabulator-table (o conteúdo real dentro
// de .tabulator-tableholder) igual ao maior valor entre a largura natural das
// colunas e a largura natural do rodapé — nunca encolhe as colunas nem
// estica o rodapé além do necessário, só garante scroll suficiente.
function _tblSyncFooterWidth(wrapId) {
    var wrapEl = document.getElementById(wrapId);
    if (!wrapEl) return;
    var holderEl = wrapEl.querySelector('.tabulator-tableholder');
    var tableEl = holderEl && holderEl.querySelector('.tabulator-table');
    var footerInner = wrapEl.querySelector('.tabulator-footer-contents');
    if (!holderEl || !tableEl || !footerInner) return;

    // Reset antes de medir — senão a extensão aplicada numa passagem anterior
    // inflaciona a largura "natural" lida nesta passagem.
    tableEl.style.minWidth = '';
    var tableWidth = tableEl.scrollWidth;
    var footerWidth = footerInner.scrollWidth;

    if (footerWidth > tableWidth) {
        tableEl.style.minWidth = footerWidth + 'px';
    }
}

// A paginação re-renderiza o rodapé ao mudar de página (nº de botões muda,
// ex: "1 2 3" → "1 2 3 4 5"), o que altera a sua largura natural. Observa
// essas mutações para recalcular _tblSyncFooterWidth sempre que necessário.
function _tblObserveFooterWidth(wrapId) {
    var wrapEl = document.getElementById(wrapId);
    if (!wrapEl) return;
    var footerEl = wrapEl.querySelector('.tabulator-footer');
    if (!footerEl || footerEl._mdashFooterWidthObserved) return;
    footerEl._mdashFooterWidthObserved = true;
    var mo = new MutationObserver(function () {
        _tblSyncFooterWidth(wrapId);
    });
    mo.observe(footerEl, { childList: true, subtree: true });
}

var _TABLE_EXECUTIVE_SAMPLE_CONFIG = JSON.parse(JSON.stringify(_TABLE_SAMPLE_CONFIG));
_TABLE_EXECUTIVE_SAMPLE_CONFIG.autoColumns = false;
_TABLE_EXECUTIVE_SAMPLE_CONFIG.columns = _tblGetExecutiveSampleColumns();

// ── Temas visuais da tabela ──────────────────────────────────────────────────
var _TABLE_THEMES = {
    phcPrimary: { name: 'PHC Primary', phcType: 'primary', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcSuccess: { name: 'PHC Success', phcType: 'success', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcInfo:    { name: 'PHC Info',    phcType: 'info',    headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcWarning: { name: 'PHC Warning', phcType: 'warning', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcDanger:  { name: 'PHC Danger',  phcType: 'danger',  headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    modern:     { name: 'Moderno',     headerBg: '#1e293b', headerText: '#f8fafc', accent: '#2563eb', rowEven: '#f8fafc', rowHover: 'rgba(37,99,235,.06)', border: 'rgba(0,0,0,.06)' },
    light:      { name: 'Claro',       headerBg: '#f1f5f9', headerText: '#1e293b', accent: '#0ea5e9', rowEven: '#ffffff', rowHover: 'rgba(14,165,233,.05)', border: 'rgba(0,0,0,.06)' },
    corporate:  { name: 'Corporativo', headerBg: '#1a3a6c', headerText: '#f5e6c8', accent: '#c8a84b', rowEven: '#fdfcfa', rowHover: 'rgba(200,168,75,.06)', border: 'rgba(26,58,108,.10)' },
    vibrant:    { name: 'Vibrante',    headerBg: '#7c3aed', headerText: '#faf5ff', accent: '#a78bfa', rowEven: '#faf5ff', rowHover: 'rgba(167,139,250,.06)', border: 'rgba(124,58,237,.08)' },
    earth:      { name: 'Terra',       headerBg: '#78350f', headerText: '#fef3c7', accent: '#b45309', rowEven: '#fffbeb', rowHover: 'rgba(180,83,9,.05)', border: 'rgba(120,53,15,.08)' },
    dark:       { name: 'Escuro',      headerBg: '#0f172a', headerText: '#e2e8f0', accent: '#60a5fa', rowEven: '#1e293b', rowHover: 'rgba(96,165,250,.08)', border: 'rgba(226,232,240,.08)' },
    minimal:    { name: 'Minimalista', headerBg: 'transparent', headerText: '#475569', accent: '#64748b', rowEven: 'transparent', rowHover: 'rgba(0,0,0,.02)', border: 'rgba(0,0,0,.06)' },
    yellow:     { name: 'Amarelo',     headerBg: '#efe21b',    headerText: '#1a1a00', accent: '#c8c000', rowEven: '#fefee8', rowHover: 'rgba(239,226,27,.08)', border: 'rgba(200,192,0,.15)' },
    black:      { name: 'Preto',       headerBg: '#111111',    headerText: '#f5f5f5', accent: '#444444', rowEven: '#f7f7f7', rowHover: 'rgba(0,0,0,.04)', border: 'rgba(0,0,0,.10)' }
};

// Resolve tema PHC em runtime (getCachedColor só funciona após DOM ready)
function _tblResolveTheme(themeDef) {
    if (!themeDef || !themeDef.phcType) return themeDef;
    var colorObj = (typeof getCachedColor === 'function') ? getCachedColor(themeDef.phcType) : null;
    var color = (colorObj && colorObj.background) ? colorObj.background : '#2563eb';
    return {
        name: themeDef.name, phcType: themeDef.phcType,
        headerBg: color, headerText: themeDef.headerText, accent: color,
        rowEven: themeDef.rowEven, rowHover: themeDef.rowHover, border: themeDef.border
    };
}

// ── Formatadores disponíveis ─────────────────────────────────────────────────
var _TABLE_FORMATTERS = [
    { value: 'plaintext', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'money', label: 'Moeda (€)' },
    { value: 'percentage', label: 'Percentagem' },
    { value: 'datetime', label: 'Data/Hora' },
    { value: 'date', label: 'Só Data (dd/mm/aaaa)' },
    { value: 'tickCross', label: 'Sim/Não' },
    { value: 'star', label: 'Estrelas' },
    { value: 'progress', label: 'Barra de Progresso' },
    { value: 'color', label: 'Cor' },
    { value: 'link', label: 'Link' },
    { value: 'linkButton', label: 'Botão (link)' },
    { value: 'html', label: 'HTML' },
    { value: 'expression', label: 'Expressão' },
    { value: 'conditional', label: 'Condicional' }
];

var _TABLE_BADGE_FORMATS = [
    { value: 'deltaPercentBadge', label: 'Badge variação %' },
    { value: 'deltaBadge', label: 'Badge delta' },
    { value: 'statusBadge', label: 'Badge estado' }
];

var _TABLE_EXPRESSION_SAMPLE = '_tblFormatDeltaPercent(value)';

function _tblGetDashboardFiltersList() {
    if (window.mdashAppState && window.mdashAppState.mdash && Array.isArray(window.mdashAppState.mdash.filters)) {
        return window.mdashAppState.mdash.filters;
    }
    if (window.appState && Array.isArray(window.appState.filters)) return window.appState.filters;
    if (typeof GMDashFilters !== 'undefined' && Array.isArray(GMDashFilters)) return GMDashFilters;
    return [];
}

function _tblGetDashboardFilterValues() {
    if (window.mdashAppState && window.mdashAppState.mdash && window.mdashAppState.mdash.filterValues) {
        return window.mdashAppState.mdash.filterValues;
    }
    if (window.appState && window.appState.filterValues) return window.appState.filterValues;
    return {};
}

function _tblFindDashboardFilter(stampOrCodigo) {
    if (!stampOrCodigo) return null;
    var key = String(stampOrCodigo);
    return _tblGetDashboardFiltersList().find(function (f) {
        return f && (f.mdashfilterstamp === key || f.codigo === key);
    }) || null;
}

function _tblNormalizeTitleBinding(def) {
    def = def || {};
    if (def.titleBinding && typeof def.titleBinding === 'object') {
        var b = def.titleBinding;
        return {
            mode: b.mode || 'text',
            text: b.text != null ? String(b.text) : String(def.title || ''),
            filterStamp: b.filterStamp || '',
            filterPart: b.filterPart || 'descricao',
            fonteStamp: b.fonteStamp || '',
            field: b.field || '',
            expression: b.expression || ''
        };
    }
    return {
        mode: 'text',
        text: String(def.title || ''),
        filterStamp: '',
        filterPart: 'descricao',
        fonteStamp: '',
        field: '',
        expression: ''
    };
}

function _tblGetFonteFirstRow(fonteStamp, obj) {
    if (!fonteStamp) return null;
    var fontes = _mciGetFontes(obj);
    var fonte = fontes.find(function (f) { return f.mdashfontestamp === fonteStamp; });
    if (!fonte) return null;
    if (typeof mdashExtractRowsFromCache === 'function') {
        var cachedRows = mdashExtractRowsFromCache(fonte.lastResultscached);
        if (cachedRows && cachedRows.length) return cachedRows[0];
    }
    if (Array.isArray(fonte.lastResults) && fonte.lastResults.length) return fonte.lastResults[0];
    try {
        var parsed = JSON.parse(fonte.lastResultscached || '[]');
        if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === 'object') return parsed[0];
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length) {
            var cols = parsed.columns || [];
            var row = parsed.rows[0];
            if (Array.isArray(row) && cols.length) {
                var objRow = {};
                cols.forEach(function (c, i) { objRow[c] = row[i]; });
                return objRow;
            }
        }
    } catch (e) {}
    return null;
}

function _tblBuildTitleResolveContext(obj, rows) {
    return {
        obj: obj || null,
        data: rows || [],
        filterValues: _tblGetDashboardFilterValues()
    };
}

function _tblCompileTitleExpression(expr) {
    expr = String(expr == null ? '' : expr).trim();
    if (!expr) return null;
    try {
        return new Function('data', 'filters', 'helpers', 'with(helpers){return (' + expr + ');}');
    } catch (e) {
        console.warn('[Mdash table title expr] compile:', e.message, '|', expr);
        return null;
    }
}

function _tblEvalTitleExpression(expr, ctx) {
    var fn = _tblCompileTitleExpression(expr);
    if (!fn) return '';
    var filterValues = (ctx && ctx.filterValues) || _tblGetDashboardFilterValues();
    var helpers = Object.assign({}, _mdashGetTableExpressionHelpers(), {
        filters: filterValues,
        filterValues: filterValues,
        getFilterValue: function (codigo) { return filterValues[codigo]; },
        getFilterDescricao: function (stampOrCodigo) {
            var f = _tblFindDashboardFilter(stampOrCodigo);
            return f ? (f.descricao || f.codigo || '') : '';
        },
        getSourceValue: function (fonteStamp, field) {
            var row = _tblGetFonteFirstRow(fonteStamp, ctx && ctx.obj);
            return row && field ? row[field] : undefined;
        }
    });
    try {
        return fn((ctx && ctx.data) || [], filterValues, helpers);
    } catch (e) {
        console.warn('[Mdash table title expr] runtime:', e.message);
        return '';
    }
}

function _tblResolveTitleBinding(binding, ctx) {
    binding = _tblNormalizeTitleBinding({ titleBinding: binding });
    var fallback = binding.text || '';
    try {
        if (binding.mode === 'filter' && binding.filterStamp) {
            var filter = _tblFindDashboardFilter(binding.filterStamp);
            if (!filter) return fallback;
            if (binding.filterPart === 'valor') {
                var vals = (ctx && ctx.filterValues) || _tblGetDashboardFilterValues();
                var val = vals[filter.codigo];
                return val == null || val === '' ? fallback : String(val);
            }
            if (binding.filterPart === 'codigo') return filter.codigo || fallback;
            return filter.descricao || fallback;
        }
        if (binding.mode === 'source' && binding.fonteStamp && binding.field) {
            var sourceRow = _tblGetFonteFirstRow(binding.fonteStamp, ctx && ctx.obj);
            if (sourceRow && sourceRow[binding.field] != null && sourceRow[binding.field] !== '') {
                return String(sourceRow[binding.field]);
            }
            return fallback;
        }
        if (binding.mode === 'expression' && binding.expression) {
            var result = _tblEvalTitleExpression(binding.expression, ctx);
            if (result != null && result !== '') return String(result);
            return fallback;
        }
        return binding.text || fallback;
    } catch (e) {
        console.warn('[MDash] title resolve:', e.message);
        return fallback;
    }
}

function _tblTitleBindingSummary(binding) {
    binding = _tblNormalizeTitleBinding({ titleBinding: binding });
    if (binding.mode === 'filter') {
        var filter = _tblFindDashboardFilter(binding.filterStamp);
        var partLabel = binding.filterPart === 'valor' ? 'valor' : (binding.filterPart === 'codigo' ? 'código' : 'nome');
        return filter ? ('Filtro · ' + partLabel + ': ' + (filter.descricao || filter.codigo)) : 'Filtro do dashboard';
    }
    if (binding.mode === 'source') {
        return binding.field ? ('Fonte · ' + binding.field) : 'Campo da fonte';
    }
    if (binding.mode === 'expression') return 'Expressão JS';
    return binding.text || 'Coluna';
}

function _tblToggleTitleBindingPanel($binding, classPrefix) {
    var mode = $binding.find('.' + classPrefix + '-mode').val() || 'text';
    $binding.find('.' + classPrefix + '-opts-text').toggle(mode === 'text');
    $binding.find('.' + classPrefix + '-opts-filter').toggle(mode === 'filter');
    $binding.find('.' + classPrefix + '-opts-source').toggle(mode === 'source');
    $binding.find('.' + classPrefix + '-opts-expression').toggle(mode === 'expression');
}

function _tblTitleBindingEditorHtml(binding, classPrefix, fontes, filters) {
    binding = _tblNormalizeTitleBinding({ titleBinding: binding });
    fontes = fontes || [];
    filters = filters || _tblGetDashboardFiltersList();
    var filterOpts = '<option value="">-- seleccione filtro --</option>'
        + filters.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfilterstamp) + '"' + (binding.filterStamp === f.mdashfilterstamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfilterstamp) + '</option>';
        }).join('');
    var fonteOpts = '<option value="">-- seleccione fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"' + (binding.fonteStamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('');
    var sourceFields = [];
    if (binding.fonteStamp) {
        var selectedFonte = fontes.find(function (f) { return f.mdashfontestamp === binding.fonteStamp; });
        if (selectedFonte) {
            sourceFields = _mciGetFonteSchema(selectedFonte).map(function (s) { return s.field; }).filter(Boolean);
        }
    }
    var fieldOpts = '<option value="">-- campo --</option>'
        + sourceFields.map(function (fieldName) {
            return '<option value="' + _mciEsc(fieldName) + '"' + (binding.field === fieldName ? ' selected' : '') + '>'
                + _mciEsc(fieldName) + '</option>';
        }).join('');
    var modeOpts = [
        { v: 'text', l: 'Texto fixo' },
        { v: 'filter', l: 'Filtro do dashboard' },
        { v: 'source', l: 'Campo da fonte (1ª linha)' },
        { v: 'expression', l: 'Expressão JavaScript' }
    ].map(function (m) {
        return '<option value="' + m.v + '"' + (binding.mode === m.v ? ' selected' : '') + '>' + m.l + '</option>';
    }).join('');

    return '<div class="mtbl-title-binding" style="grid-column:1 / -1;margin-top:2px;">'
        + '<label style="font-size:9.5px;font-weight:700;color:#475569;text-transform:uppercase;display:block;margin:0 0 3px;">Título da coluna</label>'
        + '<select class="' + classPrefix + '-mode form-control input-sm" style="font-size:10.5px;margin-bottom:4px;">' + modeOpts + '</select>'
        + '<div class="' + classPrefix + '-opts-text" style="display:' + (binding.mode === 'text' ? 'block' : 'none') + ';">'
        + '<input type="text" class="' + classPrefix + '-text form-control input-sm" value="' + _mciEsc(binding.text) + '" placeholder="Texto do título" style="font-size:10.5px;">'
        + '</div>'
        + '<div class="' + classPrefix + '-opts-filter" style="display:' + (binding.mode === 'filter' ? 'block' : 'none') + ';">'
        + '<select class="' + classPrefix + '-filter form-control input-sm" style="font-size:10.5px;margin-bottom:3px;">' + filterOpts + '</select>'
        + '<select class="' + classPrefix + '-filter-part form-control input-sm" style="font-size:10.5px;">'
        + '<option value="descricao"' + (binding.filterPart === 'descricao' ? ' selected' : '') + '>Nome do filtro</option>'
        + '<option value="valor"' + (binding.filterPart === 'valor' ? ' selected' : '') + '>Valor actual</option>'
        + '<option value="codigo"' + (binding.filterPart === 'codigo' ? ' selected' : '') + '>Código</option>'
        + '</select></div>'
        + '<div class="' + classPrefix + '-opts-source" style="display:' + (binding.mode === 'source' ? 'block' : 'none') + ';">'
        + '<select class="' + classPrefix + '-source-fonte form-control input-sm" style="font-size:10.5px;margin-bottom:3px;">' + fonteOpts + '</select>'
        + '<select class="' + classPrefix + '-source-field form-control input-sm" style="font-size:10.5px;">' + fieldOpts + '</select>'
        + '<div style="font-size:9px;color:#64748b;margin-top:3px;">Lê o valor do campo na primeira linha do array da fonte.</div>'
        + '</div>'
        + '<div class="' + classPrefix + '-opts-expression" style="display:' + (binding.mode === 'expression' ? 'block' : 'none') + ';">'
        + '<textarea class="' + classPrefix + '-expr form-control input-sm" rows="3" style="font-family:monospace;font-size:10px;resize:vertical;">' + _mciEsc(binding.expression) + '</textarea>'
        + '<div style="font-size:9px;color:#64748b;margin-top:3px;line-height:1.4;">'
        + '<code>filters</code> · <code>getFilterValue(\'codigo\')</code> · <code>getFilterDescricao(\'stamp\')</code> · '
        + '<code>getSourceValue(\'fontestamp\',\'campo\')</code> · <code>data[0].campo</code>'
        + '</div></div></div>';
}

function _tblReadTitleBinding($scope, classPrefix) {
    return {
        mode: $scope.find('.' + classPrefix + '-mode').val() || 'text',
        text: ($scope.find('.' + classPrefix + '-text').val() || '').trim(),
        filterStamp: $scope.find('.' + classPrefix + '-filter').val() || '',
        filterPart: $scope.find('.' + classPrefix + '-filter-part').val() || 'descricao',
        fonteStamp: $scope.find('.' + classPrefix + '-source-fonte').val() || '',
        field: $scope.find('.' + classPrefix + '-source-field').val() || '',
        expression: ($scope.find('.' + classPrefix + '-expr').val() || '').trim()
    };
}

function _tblGetTableColumnFormatOptions(opts) {
    opts = opts || {};
    var list = _TABLE_FORMATTERS.filter(function (f) { return f.value !== 'conditional'; });
    if (opts.includeBadges !== false) {
        list = list.concat(_TABLE_BADGE_FORMATS);
    }
    return list;
}

function _tblFormatNeedsVariant(format) {
    return format === 'deltaPercentBadge' || format === 'deltaBadge' || format === 'statusBadge';
}

function _tblExpressionHelpHtml() {
    return '<div class="mtbl-expr-help" style="font-size:9.5px;color:#475569;line-height:1.45;margin-top:5px;">'
        + '<code>row</code> · <code>value</code> · <code>cell</code> · '
        + '<code>data</code> (fonte, igual customCode) · <code>fetchData()</code><br>'
        + 'Helpers: <code>_tblFormatDeltaPercent</code>, <code>_tblFormatCurrency</code>, <code>_mciEsc</code>'
        + '</div>';
}

// ── Opções de alinhamento ────────────────────────────────────────────────────
var _TABLE_ALIGNS = [
    { value: 'left', label: 'Esquerda', icon: 'glyphicon-align-left' },
    { value: 'center', label: 'Centro', icon: 'glyphicon-align-center' },
    { value: 'right', label: 'Direita', icon: 'glyphicon-align-right' }
];

// ── Opções de ordenação ──────────────────────────────────────────────────────
var _TABLE_SORTERS = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'alphanum', label: 'Alfanumérico' },
    { value: 'boolean', label: 'Booleano' },
    { value: 'date', label: 'Data' },
    { value: 'datetime', label: 'Data/Hora' }
];

// ── Injectar CSS da Tabela (idempotente) ─────────────────────────────────────
var _tblCssInjected = false;
function _tblCSS() {
    if (_tblCssInjected) return;
    _tblCssInjected = true;
    var s = '<style id="mdash-table-inline-css">';
    // Contenção horizontal: filhos flex/grid têm min-width:auto por defeito e
    // crescem até à largura intrínseca da tabela (o card transborda e o
    // fitColumns "não faz nada" porque o elemento tem sempre a largura da
    // tabela). min-width:0 na cadeia slot→host→wrap devolve o controlo ao
    // contentor; overflow-x:auto no wrap dá scroll em vez de cortar colunas.
    s += '[data-mdash-slot]{min-width:0;max-width:100%;}';
    s += '.cont-item-object-rendered{min-width:0;max-width:100%;}';
    s += '.mtbl-wrap{position:relative;max-width:100%;min-width:0;border-radius:var(--mtbl-radius,16px);overflow-x:auto;overflow-y:hidden;background:linear-gradient(180deg,#ffffff 0%,#fbfdff 100%);border:none;box-shadow:none;}';
    s += '.mtbl-wrap.mtbl-no-col-resize .tabulator-col-resize-handle,.mtbl-wrap.mtbl-no-col-resize .tabulator-col-resize-handle:hover{display:none!important;pointer-events:none!important;width:0!important;opacity:0!important;}';
    s += '.mtbl-wrap .tabulator{border:none;background:#ffffff;font-size:var(--mtbl-fs,13px);font-family:"Inter","Nunito","Segoe UI",Arial,sans-serif;}';
    s += '.mtbl-wrap .tabulator .tabulator-header{background:linear-gradient(180deg,var(--mtbl-hdr-bg,#1e293b) 0%,var(--mtbl-hdr-bg-2,#16263f) 100%);border-bottom:none;border-radius:var(--mtbl-radius,16px) var(--mtbl-radius,16px) 0 0;padding-top:0;box-shadow:inset 0 -1px 0 rgba(255,255,255,.08);}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col{background:var(--mtbl-hdr-bg,#1e293b) !important;color:var(--mtbl-hdr-text,#f8fafc);border-right:1px solid var(--mtbl-hdr-border,rgba(255,255,255,.08));padding:5px 10px;font-weight:700;font-size:var(--mtbl-hdr-fs,11px);letter-spacing:.03em;text-transform:uppercase;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col:last-child{border-right:none;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-content,'
       + '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-title-holder,'
       + '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-title{color:var(--mtbl-hdr-text,#f8fafc) !important;opacity:1 !important;visibility:visible !important;background:inherit !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-title{white-space:normal;line-height:1.15;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-content{display:flex;align-items:center;justify-content:center;min-height:28px;padding:0 2px;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-title-holder{display:flex;align-items:center;justify-content:center;width:100%;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-col-group{background:var(--mtbl-hdr-bg-2,var(--mtbl-hdr-bg,#16263f)) !important;border-bottom:1px solid var(--mtbl-hdr-border,rgba(255,255,255,.1));padding-top:0;padding-bottom:0;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-col-group > .tabulator-col-content{padding:0;background:var(--mtbl-hdr-bg-2,var(--mtbl-hdr-bg,#16263f)) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-col-group .tabulator-col-title{font-size:var(--mtbl-hdr-fs,10px);letter-spacing:.1em;opacity:.96;font-weight:800;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-col-group .tabulator-col-title-holder{background:var(--mtbl-hdr-bg-2,var(--mtbl-hdr-bg,#16263f)) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-col-group .tabulator-col-group-cols{border-top:1px solid var(--mtbl-hdr-border,rgba(255,255,255,.1));margin-top:0;background:var(--mtbl-hdr-bg,#1e293b) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-sorter{color:var(--mtbl-hdr-text,#f8fafc);}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-arrow{border-bottom-color:var(--mtbl-hdr-text,#f8fafc) !important;border-top-color:var(--mtbl-hdr-text,#f8fafc) !important;opacity:.8 !important;}';
    // Cabeçalho executivo (tabelas com colunas agrupadoras) é um <div> estático
    // fora da área de scroll interna do Tabulator (que fica display:none). Sem
    // sincronização, ao fazer scroll horizontal no corpo (.tabulator-tableholder)
    // este cabeçalho ficava "preso" — daí parecer que fitColumns/fitData não
    // fazem nada nestas tabelas. .mtbl-exec-header é a máscara com overflow
    // escondido; .mtbl-exec-header__inner é deslocado via transform:translateX
    // em sintonia com o scroll real do Tabulator (ver _tblSyncExecHeaderLayout).
    s += '.mtbl-exec-header{position:relative;background:var(--mtbl-hdr-bg,#1e293b);border-radius:var(--mtbl-radius,16px) var(--mtbl-radius,16px) 0 0;overflow:hidden;}';
    s += '.mtbl-exec-header__inner{display:grid;color:var(--mtbl-hdr-text,#f8fafc);font-size:var(--mtbl-hdr-fs,10px);font-weight:800;text-transform:uppercase;letter-spacing:.035em;will-change:transform;}';
    s += '.mtbl-exec-header__cell{display:flex;align-items:center;justify-content:center;min-width:0;padding:3px 5px;border-right:1px solid var(--mtbl-hdr-border,rgba(255,255,255,.1));border-bottom:1px solid var(--mtbl-hdr-border,rgba(255,255,255,.1));line-height:1.1;background:var(--mtbl-hdr-bg,#1e293b);white-space:normal;text-align:center;}';
    s += '.mtbl-exec-header__cell.is-group{padding:3px 5px;background:var(--mtbl-hdr-bg-2,var(--mtbl-hdr-bg,#16263f));font-size:var(--mtbl-hdr-fs,9px);letter-spacing:.08em;}';
    s += '.mtbl-exec-header__cell.is-rowspan{justify-content:flex-start;padding-left:9px;}';
    s += '.mtbl-exec-header__cell:last-child{border-right:none;}';
    s += '.mtbl-wrap.has-exec-header .tabulator{border-radius:0 0 var(--mtbl-radius,16px) var(--mtbl-radius,16px);}';
    s += '.mtbl-wrap.has-exec-header .tabulator .tabulator-header{display:none !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:var(--mtbl-hdr-text,#f8fafc);border-radius:5px;padding:3px 8px;font-size:11px;margin-top:4px;transition:border-color .2s;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input::placeholder{color:rgba(255,255,255,.4);}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input:focus{border-color:var(--mtbl-accent,#2563eb);outline:none;background:rgba(255,255,255,.18);}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row{min-height:28px;border-bottom:1px solid var(--mtbl-border,rgba(0,0,0,.06));transition:background .15s ease;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row:last-child{border-bottom:none;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-row-even{background:var(--mtbl-row-even,#f8fafc);}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row:hover{background:var(--mtbl-row-hover,rgba(37,99,235,.06)) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell{min-height:28px;padding:5px 7px !important;border-right:none;color:#334155;vertical-align:middle;line-height:1.2;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell:first-child{padding-left:12px !important;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-section .tabulator-cell:first-child{padding-left:18px !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-selected{background:rgba(37,99,235,.08) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-selected .tabulator-cell{color:var(--mtbl-accent,#2563eb);}';
    s += '.mtbl-wrap .tabulator .tabulator-data-tree-control{width:18px !important;height:18px !important;border-radius:4px;transition:background .15s;}';
    s += '.mtbl-wrap .tabulator .tabulator-data-tree-control:hover{background:rgba(0,0,0,.06);}';
    s += '.mtbl-wrap .tabulator .tabulator-row.tabulator-tree-level-1{background:rgba(0,0,0,.015) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-row.tabulator-tree-level-2{background:rgba(0,0,0,.03) !important;}';
    // O footer (paginação) é um irmão de .tabulator-tableholder, fora do
    // scroll interno do Tabulator — em ecrãs estreitos os botões
    // Seguinte/Última ficavam cortados e inacessíveis. Em vez de dar ao
    // footer o seu PRÓPRIO scrollbar (duplica a barra e é confuso), o footer
    // fica overflow:hidden e o seu conteúdo é deslocado via
    // transform:translateX em sintonia com o scroll real do corpo
    // (.tabulator-tableholder) — um único scrollbar controla tudo
    // (ver _tblSyncFooterScroll).
    s += '.mtbl-wrap .tabulator .tabulator-footer{background:#f8fafc;border-top:1px solid var(--mtbl-border,rgba(0,0,0,.06));padding:8px 14px;font-size:12px;color:#64748b;overflow:hidden;position:relative;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-footer-contents{display:inline-flex;align-items:center;flex-wrap:nowrap;white-space:nowrap;min-width:100%;will-change:transform;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-paginator{white-space:nowrap;flex-shrink:0;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page{padding:4px 10px;border-radius:5px;border:1px solid rgba(0,0,0,.1);margin:0 2px;font-size:11px;font-weight:500;background:#fff;color:#475569;transition:all .15s;flex-shrink:0;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page.active{background:var(--mtbl-accent,#2563eb);color:#fff;border-color:var(--mtbl-accent,#2563eb);}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page:hover:not(.active){background:#e2e8f0;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar{width:6px;height:6px;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-track{background:transparent;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:3px;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.2);}';
    s += '.mtbl-money{font-variant-numeric:tabular-nums;font-feature-settings:"tnum";}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-section{background:linear-gradient(90deg,rgba(37,99,235,.085) 0%,rgba(37,99,235,.025) 62%,rgba(37,99,235,0) 100%) !important;border-top:1px solid rgba(37,99,235,.12);border-bottom:1px solid rgba(37,99,235,.08);}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-section:hover{background:linear-gradient(90deg,rgba(37,99,235,.09) 0%,rgba(37,99,235,.03) 62%,rgba(37,99,235,0) 100%) !important;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-section .tabulator-cell{min-height:25px;padding-top:5px !important;padding-bottom:5px !important;background:transparent !important;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-total{background:linear-gradient(180deg,rgba(37,99,235,.08) 0%,rgba(37,99,235,.04) 100%) !important;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-total .tabulator-cell{font-weight:700;color:#0f172a;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-data.mtbl-row-level-1 .tabulator-cell:first-child{padding-left:14px !important;}';
    s += '.mtbl-wrap .tabulator-row.mtbl-row-data.mtbl-row-level-2 .tabulator-cell:first-child{padding-left:21px !important;}';
    s += '.mtbl-section-label{display:inline-flex;align-items:center;gap:8px;padding-left:2px;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--mtbl-accent,#2563eb);}';
    s += '.mtbl-section-label:before{content:"";width:6px;height:6px;border-radius:999px;background:var(--mtbl-row-accent,var(--mtbl-accent,#2563eb));box-shadow:0 0 0 4px rgba(37,99,235,.12);}';
    s += '.mtbl-section-label.mtbl-bullet-square:before{border-radius:2px;}';
    s += '.mtbl-section-label.mtbl-bullet-diamond:before{border-radius:2px;transform:rotate(45deg);}';
    s += '.mtbl-section-label.mtbl-bullet-bar:before{width:14px;height:4px;border-radius:999px;box-shadow:none;}';
    s += '.mtbl-section-label.mtbl-bullet-none:before{display:none;width:0;height:0;box-shadow:none;}';
    s += '.mtbl-inline-bullet{display:inline-flex;align-items:center;gap:7px;}';
    s += '.mtbl-inline-bullet:before{content:"";width:6px;height:6px;border-radius:999px;background:var(--mtbl-row-accent,var(--mtbl-accent,#2563eb));box-shadow:0 0 0 4px rgba(37,99,235,.10);}';
    s += '.mtbl-inline-bullet.mtbl-bullet-square:before{border-radius:2px;}';
    s += '.mtbl-inline-bullet.mtbl-bullet-diamond:before{border-radius:2px;transform:rotate(45deg);}';
    s += '.mtbl-inline-bullet.mtbl-bullet-bar:before{width:14px;height:4px;border-radius:999px;box-shadow:none;}';
    s += '.mtbl-inline-bullet.mtbl-bullet-none:before{display:none;width:0;height:0;box-shadow:none;}';
    s += '.mtbl-indicator-cell{display:flex;align-items:center;gap:7px;min-height:18px;font-weight:600;color:#334155;}';
    s += '.mtbl-indicator-cell.is-total{font-weight:800;color:#0f172a;}';
    s += '.mtbl-num{display:inline-block;font-variant-numeric:tabular-nums;font-feature-settings:"tnum";white-space:nowrap;}';
    s += '.mtbl-num.is-strong{font-weight:800;color:#1f2937;}';
    s += '.mtbl-num.is-soft{font-weight:600;color:#475569;}';
    s += '.mtbl-num.is-muted{font-weight:500;color:#64748b;}';
    s += '.mtbl-delta-badge{display:inline-flex;align-items:center;justify-content:center;padding:3px 7px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.01em;min-width:62px;}';
    s += '.mtbl-delta-badge.is-positive{background:rgba(34,197,94,.14);color:#15803d;}';
    s += '.mtbl-delta-badge.is-negative{background:rgba(239,68,68,.14);color:#dc2626;}';
    s += '.mtbl-delta-badge.is-neutral{background:rgba(148,163,184,.16);color:#475569;}';
    s += '.tabulator .tabulator-cell .tabulator-data-tree-branch{display:none;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col:hover{background:var(--mtbl-hdr-bg) !important;cursor:default;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-sortable:hover{background:var(--mtbl-hdr-bg) !important;}';
    s += '</style>';
    $('head').append(s);
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderObjectTable(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_TABLE_SAMPLE_CONFIG));
    var isSample = !!dados.isSample;
    var hasSource = typeof mdashObjectHasDataSource === 'function'
        ? mdashObjectHasDataSource(dados.itemObject)
        : !!(dados.itemObject && dados.itemObject.fontestamp);

    var rows = dados.data || [];
    if (hasSource) {
        isSample = false;
        if (typeof mdashResolveObjectData === 'function') {
            var fbRecords = (dados.containerItem && dados.containerItem.records) || [];
            var resolvedRows = mdashResolveObjectData(dados.itemObject, fbRecords);
            rows = (resolvedRows && Array.isArray(resolvedRows.data)) ? resolvedRows.data : [];
        }
    } else {
        var tCfg = dados.transformConfig || cfg.transformConfig || null;
        if (rows.length === 0 && tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
            try {
                var raw = MdashTransformBuilder.executeRaw(tCfg);
                if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                    rows = raw.rows.map(function (r) {
                        var o = {};
                        raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                        return o;
                    });
                    isSample = false;
                }
            } catch (e) {
                console.warn('[MDash] renderObjectTable fallback transform error:', e.message);
            }
        }
        if (rows.length === 0 && isSample) {
            rows = _tblGetExecutiveSampleRows();
        }
    }

    // Injetar CSS para tabela e filtros
    _tblCSS();
    _tblAddFiltersCSS();
    
    console.log('[Table] Renderizando tabela. Config filters:', cfg.filters);
    
    var theme = _tblResolveTheme(_TABLE_THEMES[cfg.theme] || _TABLE_THEMES.phcPrimary);
    var resolvedStl = _tblResolveTableStyling(cfg, theme);
    var stl = cfg.styling || {};
    var hasConfiguredGroups = _tblHasColumnGroups(cfg.columns);
    var tblId = 'mtbl_' + stamp;
    var wrapId = 'mtbl-wrap_' + stamp;

    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra \u2014 configure a fonte</div>'
        : '';

    var toolbarHtml = '';

    // Renderizar filtros
    var filtersHtml = _tblRenderFilters(cfg.filters, rows);

    var hdrBg = resolvedStl.headerBg;
    var hdrBgGroup = resolvedStl.headerBgGroup;
    var hdrBorder = _tblResolveHeaderBorderColor(hdrBg);
    var accentC = resolvedStl.accentColor;
    var cssVars = '--mtbl-hdr-bg:' + hdrBg + ';'
        + '--mtbl-hdr-bg-2:' + hdrBgGroup + ';'
        + '--mtbl-hdr-border:' + hdrBorder + ';'
        + '--mtbl-hdr-text:' + resolvedStl.headerText + ';'
        + '--mtbl-accent:' + accentC + ';'
        + '--mtbl-row-even:' + (resolvedStl.rowEven) + ';'
        + '--mtbl-row-hover:' + (resolvedStl.rowHover) + ';'
        + '--mtbl-border:' + (theme.border) + ';'
        + '--mtbl-radius:' + (stl.borderRadius || 10) + 'px;'
        + '--mtbl-fs:' + (hasConfiguredGroups ? Math.min(parseInt(stl.fontSize, 10) || 11, 11) : (stl.fontSize || 13)) + 'px;';

    // Tamanho de fonte do cabeçalho configurável — aplica-se uniformemente a
    // todo o cabeçalho (cols, grupos e executive header).
    // 0/vazio = defaults do tema (11px cols, 10px grupos/exec, 9px grupos exec)
    var hdrFs = parseInt(stl.headerFontSize, 10) || 0;
    if (hdrFs > 0) {
        cssVars += '--mtbl-hdr-fs:' + hdrFs + 'px;';
    }

    var html = badgeHtml
        + '<div id="' + wrapId + '" class="mtbl-wrap' + (_tblAreColumnsResizable(cfg) ? '' : ' mtbl-no-col-resize') + '" style="' + cssVars + '" data-stamp="' + stamp + '">'
        + toolbarHtml
        + filtersHtml
        + '<div id="' + tblId + '"></div>'
        + '</div>';

    $(dados.containerSelector).html(html);

    setTimeout(function () {
        var dom = document.getElementById(tblId);
        if (!dom) return;

        var columns = _tblBuildColumns(cfg, rows, {
            useExecutivePreset: isSample && (!cfg.columns || !cfg.columns.length),
            obj: dados.itemObject
        });
        var hasGroupedColumns = _tblHasColumnGroups(columns);
        if (hasGroupedColumns) _tblCompactGroupedColumns(columns);
        _tblApplyColumnResizePolicy(columns, cfg);
        var tabulatorColumns = hasGroupedColumns ? _tblFlattenColumnDefs(columns) : columns;
        _tblApplyColumnResizePolicy(tabulatorColumns, cfg);

        if (hasGroupedColumns) {
            $('#' + wrapId)
                .addClass('has-exec-header')
                .find('.mtbl-exec-header').remove();
            $('#' + tblId).before(_tblBuildExecutiveHeader(columns));
        }

        var tblCfg = {
            data: rows,
            columns: tabulatorColumns,
            layout: cfg.layout || 'fitColumns',
            responsiveLayout: cfg.responsiveLayout || false,
            movableColumns: cfg.movableColumns || false,
            resizableColumns: _tblAreColumnsResizable(cfg),
            selectable: cfg.selectable || false,
            placeholder: '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="glyphicon glyphicon-info-sign"></i> Sem dados para apresentar</div>',
            locale: 'pt-br',
            langs: {
                'pt-br': {
                    data: { loading: 'A carregar...', error: 'Erro' },
                    groups: { item: 'item', items: 'itens' },
                    pagination: {
                        page_size: 'Registos por p\u00e1gina', first: 'Primeira', first_title: 'Primeira',
                        last: '\u00daltima', last_title: '\u00daltima', prev: 'Anterior', prev_title: 'Anterior',
                        next: 'Seguinte', next_title: 'Seguinte', all: 'Todos',
                        counter: { showing: 'A mostrar', of: 'de', rows: 'registos', pages: 'p\u00e1ginas' }
                    },
                    headerFilters: { 'default': 'filtrar...' }
                }
            }
        };

        rows = _tblNormalizeStructuredRows(rows, cfg.structuredRows, tabulatorColumns);
        tblCfg.data = rows;

        tblCfg.rowFormatter = _tblBuildTableRowFormatter(tabulatorColumns, cfg, rows);

        if (cfg.height && cfg.height !== 'auto') tblCfg.height = cfg.height;
        if (cfg.maxHeight) tblCfg.maxHeight = cfg.maxHeight;

        if (cfg.pagination && cfg.pagination.enabled) {
            tblCfg.pagination = 'local';
            tblCfg.paginationSize = cfg.pagination.size || 15;
            tblCfg.paginationSizeSelector = [5, 10, 15, 25, 50, 100];
        }

        if (cfg.dataTree && cfg.dataTree.enabled) {
            var treeData = _tblBuildTree(rows, cfg.dataTree.parentField, cfg.dataTree.childField);
            tblCfg.data = treeData;
            tblCfg.dataTree = true;
            tblCfg.dataTreeChildField = '_children';
            tblCfg.dataTreeStartExpanded = cfg.dataTree.startExpanded !== false;
            if (tabulatorColumns.length > 0) tblCfg.dataTreeElementColumn = tabulatorColumns[0].field;
        }

        var table = new Tabulator('#' + tblId, tblCfg);
        if (!hasGroupedColumns) {
            setTimeout(function () {
                _tblApplyHeaderPresentation(table, wrapId, cfg, theme);
            }, 0);
        }

        // O Tabulator mede o contentor UMA vez no init; se o card ainda estava a
        // estabilizar (skeleton/refresh de fontes/troca de tab) as larguras ficam
        // erradas e não recalcula sozinho. Redraw ao construir + ResizeObserver
        // no wrap garantem colunas sempre ajustadas à largura real.
        var _tblBuiltRedraw = false;
        table.on('tableBuilt', function () {
            _tblBuiltRedraw = true;
            setTimeout(function () {
                try { table.redraw(true); } catch (e) { /* ignore */ }
                if (hasGroupedColumns) _tblSyncExecHeaderLayout(table, wrapId);
                _tblSyncFooterScroll(wrapId);
                _tblSyncFooterWidth(wrapId);
                _tblObserveFooterWidth(wrapId);
            }, 0);
        });
        if (window.ResizeObserver) {
            var _tblWrapEl = document.getElementById(wrapId);
            if (_tblWrapEl) {
                var _tblLastW = Math.round(_tblWrapEl.getBoundingClientRect().width);
                var _tblRo = new ResizeObserver(function (entries) {
                    if (!_tblBuiltRedraw) return;
                    var w = Math.round(entries[0].contentRect.width);
                    if (w > 0 && Math.abs(w - _tblLastW) > 2) {
                        _tblLastW = w;
                        try { table.redraw(true); } catch (e) { /* ignore */ }
                        if (hasGroupedColumns) _tblSyncExecHeaderLayout(table, wrapId);
                        _tblSyncFooterWidth(wrapId);
                    }
                });
                _tblRo.observe(_tblWrapEl);
            }
        }

        if (cfg.footer && cfg.footer.showRowCount) {
            table.on('dataFiltered', function (filters, filteredRows) {
                var $wrap = $('#' + wrapId);
                $wrap.find('.mtbl-row-count strong').text(filteredRows.length);
            });
        }

        var $wrap = $('#' + wrapId);
        $wrap.on('click', '.mtbl-exp-xlsx', function () {
            table.download('xlsx', 'dados.xlsx', { sheetName: 'Dados' });
        });
        $wrap.on('click', '.mtbl-exp-pdf', function () {
            table.download('pdf', 'dados.pdf', {
                orientation: 'landscape', title: 'Relatório',
                autoTable: { styles: { fillColor: [30, 41, 59] }, margin: { top: 30 } }
            });
        });

        // ── Event handlers para filtros (com toggle) ──
        $wrap.on('click', '.mtbl-filter-btn', function() {
            var $btn = $(this);
            var filterKey = $btn.data('filter-key');
            var wasActive = $btn.hasClass('is-active');
            
            if (!cfg.filters || !cfg.filters.definitions) return;
            
            // Encontrar definição do filtro
            var filterDef = cfg.filters.definitions.find(function(f) { return f.key === filterKey; });
            if (!filterDef) return;
            
            var allData = rows;
            var filteredData;
            
            if (wasActive) {
                // TOGGLE OFF: Desativar filtro e mostrar todos os dados
                $btn.removeClass('is-active');
                $btn.removeAttr('style'); // Remove estilo inline
                filteredData = allData;
                cfg.filters.activeFilterKey = null;
                
                console.log('[Table Filters] Filtro desativado:', filterKey);
            } else {
                // TOGGLE ON: Ativar filtro
                $wrap.find('.mtbl-filter-btn').removeClass('is-active');
                // Remover estilos de cor ativa de outros botões, mas preservar customStyles
                $wrap.find('.mtbl-filter-btn').each(function() {
                    var $otherBtn = $(this);
                    if ($otherBtn[0] !== $btn[0]) {
                        $otherBtn.css({
                            'background-color': '',
                            'border-color': '',
                            'color': ''
                        });
                    }
                });
                
                $btn.addClass('is-active');
                
                // Aplicar estilos personalizados (com suporte a cores PHC)
                if (filterDef.style) {
                    var styles = {};
                    if (filterDef.style.activeColor) {
                        var activeColor = _tblResolvePHCColor(filterDef.style.activeColor) || filterDef.style.activeColor;
                        styles['background-color'] = activeColor;
                        styles['border-color'] = activeColor;
                        styles['color'] = '#fff';
                    }
                    if (Object.keys(styles).length > 0) {
                        $btn.css(styles);
                    }
                    // Estilos customizados adicionais via customStyle são aplicados inline no HTML
                }
                
                // Aplicar filtro
                filteredData = _tblApplyFilter(allData, filterDef);
                cfg.filters.activeFilterKey = filterKey;
                
                console.log('[Table Filters] Filtro ativado:', filterKey, 'registos:', filteredData.length);
            }
            
            // Atualizar Tabulator
            table.setData(filteredData);
            
            // Guardar estado do filtro
            if (dados.itemObject) {
                dados.itemObject.config = cfg;
                dados.itemObject.configjson = JSON.stringify(cfg);
                if (typeof realTimeComponentSync === 'function') {
                    realTimeComponentSync(dados.itemObject, dados.itemObject.table, dados.itemObject.idfield);
                }
            }
        });

        table.on('tableBuilt', function () {
            if (dom._mdashTableReady) return;
            dom._mdashTableReady = true;
            if (!hasGroupedColumns) _tblApplyHeaderPresentation(table, wrapId, cfg, theme);
            
            // Aplicar filtro ativo (se houver) sem trigger para evitar toggle
            if (cfg.filters && cfg.filters.enabled && cfg.filters.activeFilterKey) {
                var activeFilter = cfg.filters.definitions.find(function(f) { return f.key === cfg.filters.activeFilterKey; });
                if (activeFilter) {
                    var filteredData = _tblApplyFilter(rows, activeFilter);
                    table.setData(filteredData);
                    $wrap.find('.mtbl-row-count strong').text(filteredData.length);
                    console.log('[Table Filters] Filtro inicial aplicado:', cfg.filters.activeFilterKey);
                }
            }
            
            if (window.ResizeObserver) {
                var ro = new ResizeObserver(function () {
                    if (dom._mdashTableReady) table.redraw();
                    if (!hasGroupedColumns) _tblApplyHeaderPresentation(table, wrapId, cfg, theme);
                });
                ro.observe(dom);
            }
            // ── Inline column rename via click ──
            $(dom).on('click', '.tabulator-col-title', function (e) {
                e.stopPropagation();
                var $ttl = $(this);
                if ($ttl.find('input').length) return;
                var oldT = $ttl.text();
                var cEl = $ttl.closest('.tabulator-col');
                var fld = cEl.attr('tabulator-field');
                if (!fld) return;
                var $inp = $('<input type="text" class="form-control input-sm" />')
                    .css({ width:'100%','font-size':'inherit',padding:'0 4px',height:'auto',
                           background:'#fff',border:'1.5px solid var(--mtbl-accent,#2563eb)',
                           'border-radius':'3px','text-align':'center','box-shadow':'0 0 0 2px rgba(37,99,235,.15)' })
                    .val(oldT);
                $ttl.empty().append($inp);
                $inp.focus();
                var done = false;
                var _nsColRename = 'mousedown.tblcolrename' + Date.now();
                function _cleanupColRename() {
                    $(document).off(_nsColRename);
                }
                function commit() {
                    if (done) return; done = true;
                    _cleanupColRename();
                    var nT = $inp.val().trim() || oldT;
                    $ttl.text(nT);
                    // updateDefinition removido — visual já definido, config salva abaixo
                    // re-render limpo após gravar
                    var dCfg = dados.config || (dados.itemObject || {}).config;
                    if (dCfg) {
                        if (!dCfg.columns || !dCfg.columns.length) {
                            dCfg.autoColumns = false;
                            dCfg.columns = table.getColumnDefinitions().map(function (d) {
                                return { field: d.field, title: d.title, visible: true, hozAlign: d.hozAlign || 'left',
                                         formatter: d.formatter || 'plaintext', sorter: d.sorter || 'string' };
                            });
                        }
                        (dCfg.columns || []).forEach(function (cc) {
                            if (cc.field === fld) cc.title = nT;
                        });
                        var io = dados.itemObject || {};
                        io.configjson = JSON.stringify(io.config);
                        if (typeof realTimeComponentSync === 'function') {
                            realTimeComponentSync(io, io.table, io.idfield);
                        }
                        _mciRerender(io);
                    }
                }
                // Forçar commit ao clicar fora do header (blur nem sempre dispara em elementos não-focalizáveis)
                $(document).on(_nsColRename, function (ev) {
                    if (!$(ev.target).closest($ttl).length) {
                        _cleanupColRename();
                        commit();
                    }
                });
                $inp.on('blur', commit);
                $inp.on('keydown', function (ev) {
                    if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
                    if (ev.key === 'Escape') { done = true; _cleanupColRename(); $ttl.text(oldT); }
                });
            });
        });
    }, 0);
}

function _tblAreColumnsResizable(cfg) {
    return !cfg || cfg.resizableColumns !== false;
}

function _tblApplyColumnResizePolicy(columns, cfg) {
    var allowResize = _tblAreColumnsResizable(cfg);
    (columns || []).forEach(function (col) {
        if (!col) return;
        if (Array.isArray(col.columns) && col.columns.length) {
            _tblApplyColumnResizePolicy(col.columns, cfg);
            return;
        }
        col.resizable = allowResize ? (col.resizable !== false) : false;
    });
    return columns;
}

// ── Construir colunas Tabulator ──────────────────────────────────────────────
function _tblBuildColumns(cfg, rows, options) {
    var cols = cfg.columns || [];
    var buildOptions = options || {};
    var titleCtx = _tblBuildTitleResolveContext(buildOptions.obj, rows);
    if (buildOptions.useExecutivePreset) {
        return _tblBuildColumnDefs(_tblGetExecutiveSampleColumns(), cfg, rows, titleCtx);
    }
    if ((!cols.length || cfg.autoColumns) && cfg.autoColumns !== false && rows.length > 0) {
        var firstDataRow = rows.find(function (rowItem) { return rowItem && rowItem.__rowType !== 'section'; }) || rows[0];
        var keys = Object.keys(firstDataRow || {}).filter(function (key) { return key.indexOf('__') !== 0; });
        return keys.map(function (k) {
            var col = {
                title: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
                field: k,
                headerFilter: cfg.headerFilter === true ? 'input' : false,
                resizable: _tblAreColumnsResizable(cfg),
                sorter: _tblGuessSorter(rows, k)
            };
            var sample = firstDataRow ? firstDataRow[k] : null;
            if (typeof sample === 'number') {
                col.hozAlign = 'right';
                if (k.match(/total|valor|preco|custo|salario|margem|price|amount/i)) {
                    col.formatter = 'money';
                    col.formatterParams = { thousand: '.', decimal: ',', precision: 2, symbol: '\u20ac', symbolAfter: true };
                }
            }
            if (typeof sample === 'boolean') {
                col.formatter = 'tickCross';
                col.hozAlign = 'center';
            }
            if (col.sorter === 'date') {
                var isDateTime = typeof sample === 'string' && sample.indexOf('T') > -1;
                col.formatter = function (cell) {
                    var v = cell.getValue();
                    if (v === null || v === undefined || v === '') return '';
                    var d = new Date(v);
                    if (isNaN(d.getTime())) return String(v);
                    if (isDateTime) return d.toLocaleString('pt-PT');
                    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
                };
            }
            return col;
        });
    }
    return _tblBuildColumnDefs(cols, cfg, rows, titleCtx);
}

function _tblBuildColumnDefs(cols, cfg, rows, titleCtx) {
    titleCtx = titleCtx || _tblBuildTitleResolveContext(null, rows);
    return (cols || [])
        .filter(function (c) { return c && c.visible !== false; })
        .map(function (c, idx) {
            if (Array.isArray(c.columns) && c.columns.length) {
                var groupClasses = ['mtbl-col-group-lvl1', 'mtbl-col-group-idx-' + idx];
                if (c.cssClass) groupClasses.unshift(c.cssClass);
                var groupDef = {
                    title: _tblResolveTitleBinding(_tblNormalizeTitleBinding(c), titleCtx),
                    headerHozAlign: c.headerHozAlign || 'center',
                    cssClass: groupClasses.join(' '),
                    columns: _tblBuildColumnDefs(c.columns, cfg, rows, titleCtx)
                };
                if (c.headerColor) groupDef.headerColor = c.headerColor;
                return groupDef;
            }
            var leaf = _tblBuildLeafColumn(c, cfg, rows);
            leaf.title = _tblResolveTitleBinding(_tblNormalizeTitleBinding(c), titleCtx);
            return leaf;
        });
}

function _tblBuildLeafColumn(c, cfg, rows) {
    var col = {
        title: c.title || c.field,
        field: c.field,
        hozAlign: c.hozAlign || 'left',
        vertAlign: c.vertAlign || 'middle',
        resizable: _tblAreColumnsResizable(cfg) ? (c.resizable !== false) : false,
        frozen: c.frozen || false,
        sorter: c.sorter || 'string',
        headerFilter: (cfg.headerFilter === true && c.headerFilter !== false) ? 'input' : false
    };
    if (c.width) col.width = c.width;
    if (c.minWidth) col.minWidth = c.minWidth;
    if (c.headerSort === false) col.headerSort = false;
    if (c.headerHozAlign) col.headerHozAlign = c.headerHozAlign;
    if (c.cssClass) col.cssClass = c.cssClass;
    if (c.headerColor) col.headerColor = c.headerColor;
    if (c.formatter === 'conditional') {
        _tblEnsureColumnConditional(c);
        col.formatter = _tblConditionalFormatter;
        col.formatterParams = _tblCompileConditionalConfig(c.conditional, c.field, rows);
        col.sorter = c.sorter || 'number';
        if (!c.hozAlign) col.hozAlign = 'center';
    } else if (c.formatter === 'expression') {
        var exprSrc = c.expr || (c.formatterParams && c.formatterParams.expr) || _TABLE_EXPRESSION_SAMPLE;
        col.formatter = _tblExpressionColumnFormatter;
        col.formatterParams = {
            expr: exprSrc,
            compiledFn: _mdashCompileTableExpression(exprSrc, 'value'),
            allRows: rows,
            fetchData: function () { return rows || []; }
        };
    } else if (c.semantic) {
        col.formatter = _tblSemanticFormatter;
        col.formatterParams = {
            semantic: c.semantic,
            displayField: c.displayField || '',
            precision: c.precision
        };
        if (!c.sorter || c.semantic === 'deltaBadge') col.sorter = 'number';
        if (!c.hozAlign && c.semantic !== 'indicator') col.hozAlign = 'right';
    } else {
        // Aceitar urlExpr/labelExpr/target no topo da coluna (UX) — copiar p/ formatterParams
        if (c.formatter === 'link' || c.formatter === 'linkButton') {
            var fp = (c.formatterParams && typeof c.formatterParams === 'object')
                ? c.formatterParams : {};
            if (c.urlExpr && !fp.urlExpr) fp.urlExpr = c.urlExpr;
            if (c.labelExpr && !fp.labelExpr) fp.labelExpr = c.labelExpr;
            if (c.linkLabel && !fp.linkLabel) fp.linkLabel = c.linkLabel;
            if (c.linkColor && !fp.linkColor) fp.linkColor = c.linkColor;
            if (c.target && !fp.target) fp.target = c.target;
            if (c.urlBase && !fp.urlBase) fp.urlBase = c.urlBase;
            c.formatterParams = fp;
        }
        if (c.formatter) {
            if (c.formatter === 'linkButton') {
                col.formatterParams = _tblPrepareFormatterParams('link', c.formatterParams || {});
                col.formatter = _tblLinkButtonFormatter;
                col.cellClick = function () { };
                col.hozAlign = c.hozAlign || 'center';
            } else if (c.formatter === 'date') {
                col.formatter = function (cell) {
                    var v = cell.getValue();
                    if (v === null || v === undefined || v === '') return '';
                    var d = new Date(v);
                    if (isNaN(d.getTime())) return String(v);
                    return ('0' + d.getDate()).slice(-2) + '/' +
                           ('0' + (d.getMonth() + 1)).slice(-2) + '/' +
                           d.getFullYear();
                };
                col.sorter = c.sorter || 'date';
            } else if (c.formatter === 'percentage' || c.formatter === 'number') {
                // 'percentage' e 'number' não são formatters nativos do Tabulator
                // (ao contrário de money/tickCross/star/...) — sem isto o Tabulator
                // ignora o formatter e mostra o valor em bruto sem o símbolo "%".
                var fmtType = c.formatter;
                var fmtCfg = {
                    precision: c.formatterParams && c.formatterParams.precision,
                    showSign: c.formatterParams && c.formatterParams.showSign
                };
                col.formatter = function (cell) {
                    return _tblRenderColumnFormat(cell, fmtType, fmtCfg, {});
                };
                col.sorter = c.sorter || 'number';
                if (!c.hozAlign) col.hozAlign = 'right';
            } else {
                col.formatter = c.formatter;
                if (c.formatterParams) {
                    col.formatterParams = _tblPrepareFormatterParams(c.formatter, c.formatterParams);
                    if (c.formatter === 'money') col.formatterParams.symbolAfter = true;
                } else if (c.formatter === 'link') {
                    col.formatterParams = { target: '_blank' };
                }
            }
        }
    }
    return col;
}

function _tblSafeNumber(value) {
    if (typeof value === 'number') return value;
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'string') {
        var normalized = value.replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
        var parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : parsed;
    }
    var asNumber = Number(value);
    return isNaN(asNumber) ? 0 : asNumber;
}

function _tblFormatCurrency(value, precision) {
    var amount = _tblSafeNumber(value);
    try {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: precision === undefined ? 2 : precision,
            maximumFractionDigits: precision === undefined ? 2 : precision
        }).format(amount);
    } catch (e) {
        return amount.toFixed(precision === undefined ? 2 : precision) + ' EUR';
    }
}

function _tblSemanticFormatter(cell, formatterParams) {
    var rowData = cell.getData() || {};
    if (rowData.__rowType === 'section') return '';
    var semantic = (formatterParams && formatterParams.semantic) || '';
    var value = cell.getValue();
    if (semantic === 'indicator') {
        var indicatorClasses = 'mtbl-indicator-cell' + (rowData.__rowType === 'total' ? ' is-total' : '');
        if (rowData.__rowType === 'total' && rowData.__rowBulletStyle) {
            return '<div class="' + indicatorClasses + '"><span class="mtbl-inline-bullet mtbl-bullet-' + _mciEsc(rowData.__rowBulletStyle) + '">' + _mciEsc(value) + '</span></div>';
        }
        return '<div class="' + indicatorClasses + '">' + _mciEsc(value) + '</div>';
    }
    if (semantic === 'moneyStrong') {
        return '<span class="mtbl-num is-strong">' + _mciEsc(_tblFormatCurrency(value, formatterParams.precision)) + '</span>';
    }
    if (semantic === 'moneySoft') {
        return '<span class="mtbl-num is-soft">' + _mciEsc(_tblFormatCurrency(value, formatterParams.precision)) + '</span>';
    }
    if (semantic === 'moneyMuted') {
        return '<span class="mtbl-num is-muted">' + _mciEsc(_tblFormatCurrency(value, formatterParams.precision)) + '</span>';
    }
    if (semantic === 'deltaBadge') {
        var displayField = formatterParams && formatterParams.displayField;
        var displayText = displayField && rowData[displayField] ? rowData[displayField] : value;
        var numericValue = _tblSafeNumber(value);
        var deltaClass = 'is-neutral';
        if (numericValue > 0) deltaClass = 'is-positive';
        if (numericValue < 0) deltaClass = 'is-negative';
        return '<span class="mtbl-delta-badge ' + deltaClass + '">' + _mciEsc(displayText) + '</span>';
    }
    return _mciEsc(value);
}

function _tblHasStructuredRows(rows) {
    return Array.isArray(rows) && rows.some(function (rowItem) {
        return rowItem && (rowItem.__rowType || rowItem.__rowLevel);
    });
}

function _tblNormalizeStructuredRows(rows, structuredCfg, columns) {
    var cfg = structuredCfg || {};
    if (!cfg.enabled) return rows;
    if (cfg.groupField) return _tblBuildGroupedRowsFromFields(rows, cfg, _tblFindFirstLeafField(columns) || 'indicador');
    var legacyTypeField = cfg.typeField || '__rowType';
    var hasLegacyStructuredRows = (rows || []).some(function (sourceRow) {
        return sourceRow && (sourceRow.__rowType !== undefined || sourceRow[legacyTypeField] !== undefined);
    });
    if (!hasLegacyStructuredRows) return rows;
    var typeField = cfg.typeField || '__rowType';
    var levelField = cfg.levelField || '__rowLevel';
    var sectionValue = String(cfg.sectionValue || 'section').toLowerCase();
    var dataValue = String(cfg.dataValue || 'data').toLowerCase();
    var totalValue = String(cfg.totalValue || 'total').toLowerCase();

    return (rows || []).map(function (sourceRow) {
        if (!sourceRow) return sourceRow;
        var row = Object.assign({}, sourceRow);
        delete row.__rowType;
        delete row.__rowLevel;
        delete row.__rowBackground;
        delete row.__rowTextColor;
        delete row.__rowAccentColor;
        delete row.__rowBulletStyle;
        var sourceType = String(sourceRow[typeField] === undefined ? '' : sourceRow[typeField]).toLowerCase();
        if (sourceType === sectionValue) row.__rowType = 'section';
        else if (sourceType === totalValue) row.__rowType = 'total';
        else if (sourceType === dataValue || sourceType) row.__rowType = 'data';
        row.__rowLevel = Math.max(0, Math.min(parseInt(sourceRow[levelField], 10) || 0, 4));
        if (cfg.backgroundField && sourceRow[cfg.backgroundField]) row.__rowBackground = sourceRow[cfg.backgroundField];
        if (cfg.textColorField && sourceRow[cfg.textColorField]) row.__rowTextColor = sourceRow[cfg.textColorField];
        if (cfg.accentColorField && sourceRow[cfg.accentColorField]) row.__rowAccentColor = sourceRow[cfg.accentColorField];
        if (row.__rowType === 'section') row.__rowBulletStyle = _tblGetLevelStyle(cfg, row.__rowLevel, 'section').bullet;
        if (row.__rowType === 'total') row.__rowBulletStyle = _tblGetLevelStyle(cfg, row.__rowLevel, 'total').bullet;
        return row;
    });
}

function _tblGetGroupingLevels(cfg) {
    if (Array.isArray(cfg.groupLevels) && cfg.groupLevels.length) {
        return cfg.groupLevels.filter(function (level) { return level && level.field; });
    }
    var levels = [];
    if (cfg.groupField) levels.push({ field: cfg.groupField });
    if (cfg.subgroupField) levels.push({ field: cfg.subgroupField });
    return levels;
}

function _tblGetLevelStyle(cfg, rowLevel, rowType) {
    if (rowType === 'total') {
        return {
            bg: cfg.totalBg || '#eef4ff',
            text: cfg.totalText || '#0f172a',
            accent: cfg.totalAccent || cfg.totalText || '#0f172a',
            bullet: cfg.totalBullet || 'bar'
        };
    }
    if (Array.isArray(cfg.levelStyles) && cfg.levelStyles[rowLevel]) {
        return cfg.levelStyles[rowLevel];
    }
    if (rowLevel <= 0) {
        return {
            bg: cfg.sectionBg || '#eef4ff',
            text: cfg.sectionText || '#d40032',
            accent: cfg.sectionAccent || cfg.sectionText || '#d40032',
            bullet: cfg.sectionBullet || 'circle'
        };
    }
    return {
        bg: cfg.subgroupBg || '#f8fafc',
        text: cfg.subgroupText || '#334155',
        accent: cfg.subgroupAccent || cfg.subgroupText || '#64748b',
        bullet: cfg.subgroupBullet || 'diamond'
    };
}

function _tblBuildStructuredMarkerRow(labelField, labelValue, rowType, rowLevel, sourceRow, cfg) {
    var row = {};
    var levelStyle = _tblGetLevelStyle(cfg, rowLevel, rowType);
    row[labelField] = labelValue;
    row.__rowType = rowType;
    row.__rowLevel = rowLevel;
    row.__rowBackground = sourceRow && cfg.backgroundField && sourceRow[cfg.backgroundField]
        ? sourceRow[cfg.backgroundField]
        : levelStyle.bg;
    row.__rowTextColor = sourceRow && cfg.textColorField && sourceRow[cfg.textColorField]
        ? sourceRow[cfg.textColorField]
        : levelStyle.text;
    row.__rowAccentColor = sourceRow && cfg.accentColorField && sourceRow[cfg.accentColorField]
        ? sourceRow[cfg.accentColorField]
        : levelStyle.accent;
    row.__rowBulletStyle = levelStyle.bullet;
    return row;
}

function _tblBuildGroupedRowsFromFields(rows, cfg, labelField) {
    var levels = _tblGetGroupingLevels(cfg);
    if (!levels.length) return rows;
    var result = [];
    var lastValues = [];

    (rows || []).forEach(function (sourceRow) {
        if (!sourceRow) return;
        // Ignore legacy/sample structural rows when grouping by explicit fields.
        // Otherwise a sample "section" row becomes an empty data row and the group repeats.
        if (sourceRow.__rowType === 'section' || sourceRow.__rowType === 'total') return;
        levels.forEach(function (level, levelIndex) {
            var rawValue = sourceRow[level.field];
            var normalizedValue = rawValue === undefined || rawValue === null || rawValue === '' ? '' : String(rawValue);
            if (!normalizedValue) return;
            if (normalizedValue !== lastValues[levelIndex]) {
                result.push(_tblBuildStructuredMarkerRow(labelField, normalizedValue, 'section', levelIndex, sourceRow, cfg));
                lastValues[levelIndex] = normalizedValue;
                for (var resetIdx = levelIndex + 1; resetIdx < levels.length; resetIdx++) lastValues[resetIdx] = undefined;
            }
        });

        var activeLevels = levels.reduce(function (count, level) {
            return count + (sourceRow[level.field] !== undefined && sourceRow[level.field] !== null && sourceRow[level.field] !== '' ? 1 : 0);
        }, 0);
        var row = Object.assign({}, sourceRow);
        row.__rowType = 'data';
        row.__rowLevel = activeLevels > 0 ? activeLevels : 0;
        if (cfg.backgroundField && sourceRow[cfg.backgroundField]) row.__rowBackground = sourceRow[cfg.backgroundField];
        if (cfg.textColorField && sourceRow[cfg.textColorField]) row.__rowTextColor = sourceRow[cfg.textColorField];
        if (cfg.accentColorField && sourceRow[cfg.accentColorField]) row.__rowAccentColor = sourceRow[cfg.accentColorField];
        result.push(row);
    });

    return result;
}

function _tblBuildManualStructuredRows(dataRows, cfg, columns) {
    var manualRows = Array.isArray(cfg.manualRows) ? cfg.manualRows : [];
    if (!manualRows.length) return dataRows;
    var labelField = cfg.labelField || _tblFindFirstLeafField(columns) || 'indicador';
    var numericFields = {};
    (dataRows || []).forEach(function (row) {
        if (!row || row.__rowType === 'section' || row.__rowType === 'total') return;
        Object.keys(row).forEach(function (key) {
            if (key.indexOf('__') === 0 || key === labelField) return;
            if (typeof row[key] === 'number') numericFields[key] = true;
        });
    });

    function buildTotalRow(item) {
        var totalRow = _tblBuildStructuredMarkerRow(labelField, item.label || 'Total', 'total', parseInt(item.level, 10) || 0, null, cfg, false);
        Object.keys(numericFields).forEach(function (field) {
            totalRow[field] = (dataRows || []).reduce(function (sum, row) {
                if (!row || row.__rowType === 'section' || row.__rowType === 'total') return sum;
                return sum + (typeof row[field] === 'number' ? row[field] : 0);
            }, 0);
        });
        return totalRow;
    }

    function buildMarker(item) {
        if (item.kind === 'total') return buildTotalRow(item);
        return _tblBuildStructuredMarkerRow(
            labelField,
            item.label || (item.kind === 'subgroup' ? 'Subgrupo' : 'Grupo'),
            'section',
            parseInt(item.level, 10) || (item.kind === 'subgroup' ? 1 : 0),
            null,
            cfg,
            item.kind === 'subgroup'
        );
    }

    var beforeData = [];
    var afterData = [];
    manualRows.forEach(function (item) {
        if (!item || !item.kind) return;
        var row = buildMarker(item);
        if ((item.position || 'beforeData') === 'afterData') afterData.push(row);
        else beforeData.push(row);
    });
    return beforeData.concat(dataRows || []).concat(afterData);
}

function _tblFindFirstLeafField(columns) {
    for (var i = 0; i < (columns || []).length; i++) {
        var col = columns[i];
        if (!col) continue;
        if (Array.isArray(col.columns) && col.columns.length) {
            var nested = _tblFindFirstLeafField(col.columns);
            if (nested) return nested;
        } else if (col.field) {
            return col.field;
        }
    }
    return '';
}

function _tblHasLeafField(columns, fieldName) {
    if (!fieldName) return false;
    for (var i = 0; i < (columns || []).length; i++) {
        var col = columns[i];
        if (!col) continue;
        if (Array.isArray(col.columns) && col.columns.length) {
            if (_tblHasLeafField(col.columns, fieldName)) return true;
        } else if (col.field === fieldName) {
            return true;
        }
    }
    return false;
}

function _tblBuildStructuredRowFormatter(columns, structuredCfg, tableCfg) {
    var firstField = _tblFindFirstLeafField(columns);
    var cfg = structuredCfg || {};
    tableCfg = tableCfg || {};
    var drs = _tblNormalizeDataRowStyle(tableCfg);
    var dataRowBg = _tblResolveColorToken(drs.background, '#f8fafc');
    var totalBg = _tblResolveColorToken(cfg.totalBg, '#eef4ff');
    var totalText = _tblResolveColorToken(cfg.totalText, '#0f172a');
    return function (row) {
        var data = row.getData() || {};
        var rowEl = row.getElement();
        var rowType = data.__rowType || 'data';
        var rowLevel = parseInt(data.__rowLevel, 10) || 0;
        var resolvedTextColor = data.__rowTextColor ? _tblResolveColorToken(data.__rowTextColor, '') : '';
        rowEl.classList.remove('mtbl-row-section', 'mtbl-row-total', 'mtbl-row-data', 'mtbl-row-level-1', 'mtbl-row-level-2');
        rowEl.classList.add('mtbl-row-' + rowType);
        if (rowLevel > 0) rowEl.classList.add('mtbl-row-level-' + Math.min(rowLevel, 2));
        if (rowType === 'section') {
            var isSubgroup = rowLevel > 0;
            var sectionStyle = _tblGetLevelStyle(cfg, rowLevel, 'section');
            rowEl.classList.add('mtbl-row-section');
            rowEl.style.setProperty('background', _tblResolveColorToken(data.__rowBackground, sectionStyle.bg), 'important');
            resolvedTextColor = resolvedTextColor || sectionStyle.text;
            rowEl.style.setProperty('color', resolvedTextColor);
            rowEl.style.setProperty('--mtbl-row-accent', _tblResolveColorToken(data.__rowAccentColor, sectionStyle.accent));
            row.getCells().forEach(function (cell) {
                var cellEl = cell.getElement();
                if (cell.getField() === firstField) {
                    cellEl.innerHTML = '<span class="mtbl-section-label mtbl-bullet-' + _mciEsc(data.__rowBulletStyle || sectionStyle.bullet || 'circle') + '">' + _mciEsc(data[firstField] || '') + '</span>';
                    var labelEl = cellEl.querySelector('.mtbl-section-label');
                    if (labelEl) {
                        labelEl.style.color = resolvedTextColor;
                        if (isSubgroup) labelEl.style.marginLeft = Math.min(rowLevel, 4) * 8 + 'px';
                    }
                } else {
                    cellEl.innerHTML = '';
                }
            });
            return;
        }
        if (rowType === 'total') {
            rowEl.classList.add('mtbl-row-total');
            rowEl.style.setProperty('background', _tblResolveColorToken(data.__rowBackground, totalBg), 'important');
            resolvedTextColor = resolvedTextColor || totalText;
        } else if (rowType === 'data') {
            var dataBg = data.__rowBackground
                ? _tblResolveColorToken(data.__rowBackground, '')
                : _tblResolveStripedRowBackground(tableCfg, row, dataRowBg);
            rowEl.style.setProperty('background', dataBg, 'important');
        }
    };
}

function _tblApplyHeaderPresentation(table, wrapId, cfg, theme) {
    try {
        var wrapEl = document.getElementById(wrapId);
        if (!wrapEl) return;
        var headerEl = wrapEl.querySelector('.tabulator .tabulator-header');
        if (!headerEl) return;

        var stl = cfg && cfg.styling ? cfg.styling : {};
        var resolvedStl = _tblResolveTableStyling(cfg, theme);
        var headerBg = resolvedStl.headerBg;
        var headerBg2 = resolvedStl.headerBgGroup;
        var headerBorder = _tblResolveHeaderBorderColor(headerBg);
        var headerText = resolvedStl.headerText;

        headerEl.style.background = headerBg2 === headerBg
            ? headerBg
            : ('linear-gradient(180deg,' + headerBg + ' 0%,' + headerBg2 + ' 100%)');
        headerEl.style.borderBottom = 'none';
        headerEl.style.borderRadius = (stl.borderRadius || 16) + 'px ' + (stl.borderRadius || 16) + 'px 0 0';
        headerEl.style.boxShadow = 'inset 0 -1px 0 rgba(255,255,255,.08)';

        var hdrFsConfigured = parseInt(stl.headerFontSize, 10) || 0;
        var topLevelDefs = Array.isArray(cfg && cfg.columns) ? cfg.columns.slice() : [];
        var topLevelGroupDefs = topLevelDefs.filter(function (def) {
            return def && Array.isArray(def.columns) && def.columns.length;
        });
        var groupHeaderEls = headerEl.querySelectorAll('.tabulator-col.tabulator-col-group');
        var headerCols = headerEl.querySelectorAll('.tabulator-col');
        Array.prototype.forEach.call(headerCols, function (colEl) {
            var isGroup = colEl.classList.contains('tabulator-col-group');
            var colField = colEl.getAttribute('tabulator-field');
            var colDefMatch = colField ? topLevelDefs.filter(function (d) { return d && d.field === colField; })[0] : null;
            var colOverrideBg = colDefMatch ? _tblResolveColorToken(colDefMatch.headerColor, '') : '';
            colEl.style.background = colOverrideBg || (colEl.classList.contains('tabulator-col-group') ? headerBg2 : headerBg);
            colEl.style.color = headerText;
            colEl.style.opacity = '1';
            colEl.style.visibility = 'visible';
            colEl.style.borderRight = '1px solid ' + headerBorder;
            colEl.style.padding = isGroup ? '2px 8px' : '5px 10px';
            colEl.style.position = '';
            colEl.style.display = '';
            colEl.style.flexDirection = '';
            colEl.style.overflow = '';

            var contentEl = colEl.querySelector('.tabulator-col-content');
            if (contentEl) {
                contentEl.style.color = headerText;
                contentEl.style.opacity = '1';
                contentEl.style.visibility = 'visible';
                contentEl.style.display = 'flex';
                contentEl.style.alignItems = 'center';
                contentEl.style.justifyContent = 'center';
                contentEl.style.position = '';
                contentEl.style.zIndex = '';
                contentEl.style.height = '';
                contentEl.style.minHeight = isGroup ? '18px' : '28px';
                contentEl.style.flex = '';
                contentEl.style.padding = isGroup ? '0 2px' : '0 2px';
                contentEl.style.background = colOverrideBg || (isGroup ? headerBg2 : headerBg);
            }

            var holderEl = colEl.querySelector('.tabulator-col-title-holder');
            if (holderEl) {
                holderEl.style.color = headerText;
                holderEl.style.opacity = '1';
                holderEl.style.visibility = 'visible';
                holderEl.style.display = 'flex';
                holderEl.style.alignItems = 'center';
                holderEl.style.justifyContent = 'center';
                holderEl.style.width = '100%';
                holderEl.style.height = '';
                holderEl.style.background = colOverrideBg || (isGroup ? headerBg2 : headerBg);
            }

            var titleEl = colEl.querySelector('.tabulator-col-title');
            if (titleEl) {
                titleEl.style.color = headerText;
                titleEl.style.opacity = '1';
                titleEl.style.visibility = 'visible';
                titleEl.style.display = 'block';
                titleEl.style.whiteSpace = 'normal';
                titleEl.style.lineHeight = '1.15';
                titleEl.style.fontWeight = isGroup ? '800' : '700';
                titleEl.style.fontSize = hdrFsConfigured > 0 ? (hdrFsConfigured + 'px') : (isGroup ? '10px' : '11px');
                titleEl.style.background = colOverrideBg || (isGroup ? headerBg2 : headerBg);
                if (isGroup) {
                    var groupIndex = Array.prototype.indexOf.call(groupHeaderEls, colEl);
                    var groupDef = topLevelGroupDefs[groupIndex];
                    if (groupDef && groupDef.title) titleEl.textContent = groupDef.title;
                } else if (!titleEl.textContent || !titleEl.textContent.trim()) {
                    var field = colEl.getAttribute('tabulator-field');
                    if (field) {
                        var foundTitle = _tblFindColumnTitleByField(topLevelDefs, field);
                        if (foundTitle) titleEl.textContent = foundTitle;
                    }
                }
            }

            var groupColsEl = colEl.querySelector('.tabulator-col-group-cols');
            if (groupColsEl) {
                groupColsEl.style.position = '';
                groupColsEl.style.zIndex = '';
                groupColsEl.style.display = '';
                groupColsEl.style.flex = '';
                groupColsEl.style.borderTop = '1px solid ' + headerBorder;
                groupColsEl.style.marginTop = '0';
                groupColsEl.style.background = headerBg;
            }
        });
    } catch (err) {
        console.warn('[MDash] _tblApplyHeaderPresentation error:', err.message);
    }
}

// ── Base URL da aplicação (resolve URLs relativas tipo "../intranet/...") ────
function _mdashGetAppBaseUrl() {
    // 1) override do utilizador
    if (window.MdashConfig && typeof window.MdashConfig.appBaseUrl === 'string' && window.MdashConfig.appBaseUrl) {
        var b = window.MdashConfig.appBaseUrl;
        if (b.charAt(b.length - 1) !== '/') b += '/';
        return b;
    }
    // 2) auto-deteção: assume que existe um segmento /intranet/ ou /programs/ na URL actual
    var path = window.location.pathname || '';
    var m = path.match(/^(.*\/intranet)\//i);
    if (m) return window.location.origin + m[1] + '/';
    m = path.match(/^(.*)\/programs\//i);
    if (m) return window.location.origin + m[1] + '/';
    // 3) fallback: directório actual
    var idx = path.lastIndexOf('/');
    return window.location.origin + (idx >= 0 ? path.substring(0, idx + 1) : '/');
}

// ── Resolve uma URL (absoluta, ~/raiz, ou relativa) contra a base da app ────
function _mdashResolveUrl(url, urlBase) {
    if (!url) return '#';
    url = String(url);
    if (/^(https?:)?\/\//i.test(url) || url.charAt(0) === '/') return url; // já absoluta
    var base = urlBase || _mdashGetAppBaseUrl();
    if (base && base.charAt(base.length - 1) !== '/') base += '/';
    if (url.indexOf('~/') === 0) return base + url.substring(2);
    // Resolução relativa via URL API
    try { return new URL(url, base).href; } catch (e) { return base + url; }
}
// Expor globalmente para uso em expressões urlExpr (ex: mdashResolveUrl('~/intranet/flow/x.aspx'))
window.mdashResolveUrl = _mdashResolveUrl;
window.mdashAppBaseUrl = _mdashGetAppBaseUrl;

// ── Paleta PHC para botões link ─────────────────────────────────────────────
var _PHC_BTN_PALETTE = {
    primary: { bg: '#2563eb', hover: '#1d4ed8', fg: '#fff', border: '#2563eb' },
    success: { bg: '#16a34a', hover: '#15803d', fg: '#fff', border: '#16a34a' },
    info:    { bg: '#0ea5e9', hover: '#0284c7', fg: '#fff', border: '#0ea5e9' },
    warning: { bg: '#f59e0b', hover: '#d97706', fg: '#fff', border: '#f59e0b' },
    danger:  { bg: '#ef4444', hover: '#dc2626', fg: '#fff', border: '#ef4444' },
    dark:    { bg: '#1f2937', hover: '#111827', fg: '#fff', border: '#1f2937' }
};
function _mdashResolveBtnColor(linkColor) {
    if (!linkColor) return _PHC_BTN_PALETTE.primary;
    if (linkColor.indexOf('phc:') === 0) {
        var k = linkColor.replace('phc:', '');
        return _PHC_BTN_PALETTE[k] || _PHC_BTN_PALETTE.primary;
    }
    // Custom hex
    var hex = String(linkColor);
    return { bg: hex, hover: _mdashDarkenHex(hex, 0.12), fg: '#fff', border: hex };
}
function _mdashDarkenHex(hex, amount) {
    try {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
        var r = Math.max(0, Math.round(parseInt(h.substr(0, 2), 16) * (1 - amount)));
        var g = Math.max(0, Math.round(parseInt(h.substr(2, 2), 16) * (1 - amount)));
        var b = Math.max(0, Math.round(parseInt(h.substr(4, 2), 16) * (1 - amount)));
        return '#' + [r, g, b].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
    } catch (e) { return hex; }
}

function _tblParseHexRgb(hex) {
    try {
        var h = String(hex || '').replace('#', '').trim();
        if (!h) return null;
        if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
        if (h.length !== 6 || isNaN(parseInt(h, 16))) return null;
        return {
            r: parseInt(h.substr(0, 2), 16),
            g: parseInt(h.substr(2, 2), 16),
            b: parseInt(h.substr(4, 2), 16)
        };
    } catch (e) { return null; }
}

function _tblIsLightColor(color) {
    var rgb = _tblParseHexRgb(color);
    if (!rgb) return false;
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) >= 186;
}

function _tblResolveHeaderGroupBg(headerBg, groupOverride) {
    if (groupOverride) return _tblResolveColorToken(groupOverride, headerBg);
    if (!headerBg || headerBg === 'transparent') return headerBg;
    if (_tblIsLightColor(headerBg)) return headerBg;
    return _mdashDarkenHex(headerBg, 0.14);
}

function _tblResolveHeaderBorderColor(headerBg) {
    return _tblIsLightColor(headerBg) ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.1)';
}

// ── Custom formatter: linkButton ────────────────────────────────────────────
function _tblLinkButtonFormatter(cell, formatterParams) {
    var url = '#', label = '';
    try { url = formatterParams.url ? formatterParams.url(cell) : (cell.getValue() || '#'); } catch (e) { }
    // Resolução de label (prioridade): labelExpr (function `label`) > linkLabel (texto fixo) > labelField > 'Abrir'
    try {
        if (formatterParams.label) {
            label = formatterParams.label(cell);
        } else if (formatterParams.linkLabel) {
            label = formatterParams.linkLabel;
        } else if (formatterParams.labelField) {
            label = (cell.getData() || {})[formatterParams.labelField];
        } else {
            label = 'Abrir';
        }
    } catch (e) { label = formatterParams.linkLabel || 'Abrir'; }
    // Resolver URL relativa
    url = _mdashResolveUrl(url, formatterParams.urlBase);
    var target = formatterParams.target || '_self';
    var palette = _mdashResolveBtnColor(formatterParams.linkColor);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mdash-tbl-linkbtn';
    btn.textContent = label != null && label !== '' ? String(label) : 'Abrir';
    btn.title = String(label || 'Abrir'); // tooltip = label, NÃO a URL
    btn.style.cssText = 'padding:3px 12px;border:1px solid ' + palette.border + ';background:' + palette.bg + ';color:' + palette.fg + ';border-radius:4px;cursor:pointer;font-size:12px;font-weight:500;line-height:1.4;';
    btn.addEventListener('mouseenter', function () { btn.style.background = palette.hover; btn.style.borderColor = palette.hover; });
    btn.addEventListener('mouseleave', function () { btn.style.background = palette.bg; btn.style.borderColor = palette.border; });
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (target === '_blank') window.open(url, '_blank');
        else window.location.href = url;
    });
    return btn;
}

// ── Prepara formatterParams (compila urlExpr/labelExpr p/ formatter 'link') ──
function _tblPrepareFormatterParams(formatter, params) {
    var out = {};
    for (var k in params) if (Object.prototype.hasOwnProperty.call(params, k)) out[k] = params[k];

    if (formatter === 'link') {
        // urlExpr: expressão JS por linha, com acesso a `row`, `value`, `cell`
        // ex: "'../intranet/flow/wwfaform.aspx?oristamp=' + encodeURIComponent(getStampEncriptado(row.wwfastamp)) + '&acao=aprovar'"
        if (typeof out.urlExpr === 'string' && out.urlExpr.trim()) {
            var _urlCompiled = _mdashCompileTableExpression(out.urlExpr, 'value');
            var _urlBase = out.urlBase;
            out.url = function (cell) {
                var raw = _mdashEvalCompiledTableExpression(_urlCompiled, cell, [], function () { return []; });
                return _mdashResolveUrl(raw == null ? '#' : raw, _urlBase);
            };
            delete out.urlExpr;
        }
        if (typeof out.labelExpr === 'string' && out.labelExpr.trim()) {
            var _lblCompiled = _mdashCompileTableExpression(out.labelExpr, 'value');
            out.label = function (cell) {
                var label = _mdashEvalCompiledTableExpression(_lblCompiled, cell, [], function () { return []; });
                return label == null ? cell.getValue() : label;
            };
            delete out.labelExpr;
        }
        // linkLabel: texto fixo. Se não houver label (de labelExpr), usar este.
        if (typeof out.linkLabel === 'string' && out.linkLabel && !out.label) {
            var _ll = out.linkLabel;
            out.label = function () { return _ll; };
        }
        if (!out.target) out.target = '_blank';
    }
    return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// MDASH TABLE EXPRESSIONS — API central (data = fonte, alinhado com customCode)
// ═══════════════════════════════════════════════════════════════════════════

function _mdashGetTableExpressionHelpers() {
    return {
        Math: Math,
        Number: Number,
        String: String,
        Date: Date,
        parseFloat: parseFloat,
        parseInt: parseInt,
        _tblSafeNumber: _tblSafeNumber,
        _tblLikeMatch: typeof _tblLikeMatch === 'function' ? _tblLikeMatch : function () { return false; },
        _tblFormatDeltaPercent: typeof _tblFormatDeltaPercent === 'function' ? _tblFormatDeltaPercent : function (v) { return v; },
        _tblFormatCurrency: _tblFormatCurrency,
        _mciEsc: _mciEsc
    };
}

function _mdashCompileTableExpression(expr, mode) {
    expr = String(expr == null ? '' : expr).trim();
    if (!expr) expr = mode === 'boolean' ? 'false' : 'value';
    var body = mode === 'boolean' ? ('return !!(' + expr + ');') : ('return (' + expr + ');');
    try {
        return new Function(
            'cell', 'row', 'value', 'data', 'fetchData', 'helpers',
            'with(helpers){with(row){' + body + '}}'
        );
    } catch (e) {
        console.warn('[Mdash table expr] compile:', e.message, '|', expr);
        return null;
    }
}

function _mdashBuildTableExpressionContext(cell, allRows, fetchDataFn) {
    return {
        cell: cell,
        row: cell.getData() || {},
        value: cell.getValue(),
        data: allRows || [],
        fetchData: fetchDataFn || function () { return allRows || []; },
        helpers: _mdashGetTableExpressionHelpers()
    };
}

function _mdashEvalCompiledTableExpression(compiledFn, cell, allRows, fetchDataFn) {
    if (!compiledFn) return undefined;
    var ctx = _mdashBuildTableExpressionContext(cell, allRows, fetchDataFn);
    try {
        return compiledFn(ctx.cell, ctx.row, ctx.value, ctx.data, ctx.fetchData, ctx.helpers);
    } catch (e) {
        console.warn('[Mdash table expr] runtime:', e.message);
        return undefined;
    }
}

function _tblCoerceExpressionCellOutput(result, fallbackValue) {
    if (result == null || result === '') {
        return fallbackValue == null ? '' : _mciEsc(fallbackValue);
    }
    if (typeof result === 'string' && /<\s*\w+/i.test(result)) return result;
    if (result && result.nodeType) return result;
    return _mciEsc(result);
}

function _tblExpressionColumnFormatter(cell, formatterParams) {
    var row = cell.getData() || {};
    if (row.__rowType === 'section') return '';
    var params = formatterParams || {};
    var result = _mdashEvalCompiledTableExpression(params.compiledFn, cell, params.allRows, params.fetchData);
    return _tblCoerceExpressionCellOutput(result, cell.getValue());
}

if (typeof window !== 'undefined') {
    window.mdashCompileTableExpression = _mdashCompileTableExpression;
    window.mdashEvalTableExpression = function (expr, cell, allRows, fetchDataFn, mode) {
        var fn = _mdashCompileTableExpression(expr, mode || 'value');
        return _mdashEvalCompiledTableExpression(fn, cell, allRows, fetchDataFn);
    };
    window.mdashResolveTableColumnTitle = _tblResolveTitleBinding;
    window.mdashNormalizeTableTitleBinding = _tblNormalizeTitleBinding;
    window.mdashResolveColorToken = _tblResolveColorToken;
}

// ── Adivinhar sorter ─────────────────────────────────────────────────────────
function _tblGuessSorter(rows, field) {
    for (var i = 0; i < Math.min(rows.length, 5); i++) {
        var v = rows[i][field];
        if (v === null || v === undefined) continue;
        if (typeof v === 'number') return 'number';
        if (typeof v === 'boolean') return 'boolean';
        if (typeof v === 'string' && !isNaN(Date.parse(v)) && v.match(/\d{4}[-\/]\d{2}/)) return 'date';
        return 'string';
    }
    return 'string';
}

// ── Construir \u00e1rvore (dataTree) ──────────────────────────────────────────────
function _tblBuildTree(data, parentField, childField) {
    var lookup = {};
    var roots = [];
    data.forEach(function (item) { lookup[item[parentField]] = Object.assign({}, item); });
    data.forEach(function (item) {
        var node = lookup[item[parentField]];
        if (!node) return;
        var parentRef = item[childField];
        if (parentRef === null || parentRef === undefined || parentRef === '') {
            roots.push(node);
        } else if (lookup[parentRef]) {
            if (!lookup[parentRef]._children) lookup[parentRef]._children = [];
            lookup[parentRef]._children.push(node);
        } else {
            roots.push(node);
        }
    });
    return roots;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE FILTERS SYSTEM - Operadores e Motor de Filtragem
// ═══════════════════════════════════════════════════════════════════════════

// Helper: Avaliar expressão JavaScript se for uma expressão
function _tblEvalExpression(value, row, allRows) {
    if (typeof value !== 'string') return value;
    
    // Detectar se é uma expressão JavaScript (contém operadores, funções, etc.)
    // Expressões começam com "=" ou contêm "row.", operadores matemáticos, funções, etc.
    var isExpression = value.startsWith('=') || 
                      value.includes('row.') || 
                      value.includes('row[') ||
                      /[\+\-\*\/\(\)\[\]]/.test(value) ||
                      /^(Math\.|Number\.|String\.|Date\.|parseFloat|parseInt|isNaN)/.test(value);
    
    if (!isExpression) return value;
    
    try {
        // Remove "=" inicial se existir
        var expr = value.startsWith('=') ? value.substring(1) : value;
        
        // Criar contexto seguro com variáveis disponíveis
        var fn = new Function('row', 'allRows', 'Math', 'Number', 'String', 'Date', 'parseFloat', 'parseInt', 
            'return (' + expr + ');'
        );
        
        var result = fn(row, allRows, Math, Number, String, Date, parseFloat, parseInt);
        console.log('[Filter] Expressão avaliada:', value, '→', result);
        return result;
    } catch(e) {
        console.error('[Filter] Erro ao avaliar expressão:', value, e);
        return value; // Fallback para valor original
    }
}

var _TABLE_FILTER_OPERATORS = {
    'eq': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return fieldValue == evaluatedValue; 
    },
    'neq': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return fieldValue != evaluatedValue; 
    },
    'gt': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return parseFloat(fieldValue) > parseFloat(evaluatedValue); 
    },
    'gte': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return parseFloat(fieldValue) >= parseFloat(evaluatedValue); 
    },
    'lt': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return parseFloat(fieldValue) < parseFloat(evaluatedValue); 
    },
    'lte': function(fieldValue, filterValue, row, allRows) { 
        var evaluatedValue = _tblEvalExpression(filterValue, row, allRows);
        return parseFloat(fieldValue) <= parseFloat(evaluatedValue); 
    },
    'contains': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().includes(String(filterValue).toLowerCase());
    },
    'like': function(fieldValue, filterValue) {
        if (fieldValue == null || fieldValue === '') return false;
        return _tblLikeMatch(String(fieldValue), String(filterValue == null ? '' : filterValue));
    },
    'startsWith': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
    },
    'endsWith': function(fieldValue, filterValue) {
        if (!fieldValue) return false;
        return String(fieldValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
    },
    'in': function(fieldValue, filterValue) {
        return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    },
    'dateEq': function(fieldValue, filterValue) { return _tblCompareDates(fieldValue, filterValue, 'eq'); },
    'dateGt': function(fieldValue, filterValue) { return _tblCompareDates(fieldValue, filterValue, 'gt'); },
    'dateLt': function(fieldValue, filterValue) { return _tblCompareDates(fieldValue, filterValue, 'lt'); },
    'dateBetween': function(fieldValue, filterValue) {
        if (!Array.isArray(filterValue) || filterValue.length < 2) return false;
        return _tblDateInRange(fieldValue, filterValue[0], filterValue[1]);
    },
    'isNull': function(fieldValue) { return fieldValue == null || fieldValue === ''; },
    'isNotNull': function(fieldValue) { return fieldValue != null && fieldValue !== ''; },
    'custom': function(fieldValue, filterValue, row, allRows) {
        if (typeof filterValue === 'function') {
            try { return filterValue(fieldValue, row, allRows); }
            catch(e) { console.error('[Filter] Custom error:', e); return false; }
        }
        return true;
    }
};

function _tblParseDate(value) {
    if (!value) return null;
    if (value instanceof Date) return value;
    var parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;
    var parts = String(value).split('/');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return null;
}

function _tblCompareDates(dateValue, filterValue, operator) {
    var d1 = _tblParseDate(dateValue);
    var d2 = _tblParseDate(filterValue);
    if (!d1 || !d2) return false;
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    var t1 = d1.getTime(), t2 = d2.getTime();
    switch(operator) {
        case 'eq': return t1 === t2;
        case 'gt': return t1 > t2;
        case 'lt': return t1 < t2;
        default: return false;
    }
}

function _tblDateInRange(dateValue, startValue, endValue) {
    var d = _tblParseDate(dateValue);
    var start = _tblParseDate(startValue);
    var end = _tblParseDate(endValue);
    if (!d || !start || !end) return false;
    d.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    var t = d.getTime();
    return t >= start.getTime() && t <= end.getTime();
}

function _tblResolveFilterValue(value) {
    if (typeof value !== 'string') return value;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    switch(value) {
        case 'TODAY': return today;
        case 'YESTERDAY': return new Date(today.getTime() - 86400000);
        case 'WEEK_START':
            var d = new Date(today);
            var day = d.getDay();
            var diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        case 'WEEK_END':
            var start = _tblResolveFilterValue('WEEK_START');
            return new Date(start.getTime() + 6 * 86400000);
        case 'LAST_7_DAYS': return new Date(today.getTime() - 7 * 86400000);
        case 'LAST_30_DAYS': return new Date(today.getTime() - 30 * 86400000);
        default: return value;
    }
}

function _tblApplyFilter(rows, filterDef) {
    if (!rows || !Array.isArray(rows)) return [];
    if (!filterDef || !filterDef.conditions || !filterDef.conditions.length || filterDef.conditions[0].field === null) {
        return rows;
    }
    return rows.filter(function(row) {
        var results = [];
        for (var i = 0; i < filterDef.conditions.length; i++) {
            var cond = filterDef.conditions[i];
            var fieldValue = row[cond.field];
            var filterValue = _tblResolveFilterValue(cond.value);
            var operator = _TABLE_FILTER_OPERATORS[cond.operator];
            if (!operator) {
                results.push({ result: false, logic: cond.logic || 'AND' });
                continue;
            }
            var result = operator(fieldValue, filterValue, row, rows);
            results.push({ result: result, logic: cond.logic || 'AND' });
        }
        if (!results.length) return true;
        var finalResult = results[0].result;
        for (var j = 1; j < results.length; j++) {
            var prevLogic = results[j-1].logic;
            finalResult = prevLogic === 'OR' ? (finalResult || results[j].result) : (finalResult && results[j].result);
        }
        return finalResult;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONDITIONAL COLUMN — formatter: 'conditional'
// ═══════════════════════════════════════════════════════════════════════════

var _TABLE_CONDITION_OPERATORS = [
    { value: 'eq', label: 'Igual (=)' },
    { value: 'neq', label: 'Diferente (≠)' },
    { value: 'gt', label: 'Maior (>)' },
    { value: 'gte', label: 'Maior ou igual (≥)' },
    { value: 'lt', label: 'Menor (<)' },
    { value: 'lte', label: 'Menor ou igual (≤)' },
    { value: 'contains', label: 'Contém' },
    { value: 'like', label: 'Like (% _)' },
    { value: 'startsWith', label: 'Começa com' },
    { value: 'endsWith', label: 'Termina com' },
    { value: 'in', label: 'Em lista' },
    { value: 'isNull', label: 'É nulo' },
    { value: 'isNotNull', label: 'Não é nulo' }
];

function _tblLikeMatch(text, pattern) {
    if (pattern == null || pattern === '') return false;
    var escaped = String(pattern)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/%/g, '.*')
        .replace(/_/g, '.');
    try {
        return new RegExp('^' + escaped + '$', 'i').test(String(text));
    } catch (e) {
        return false;
    }
}

function _tblNormalizeWhenClause(when) {
    when = when || {};
    if (when.mode === 'expression') return when;
    if (Array.isArray(when.conditions) && when.conditions.length) {
        return { mode: 'simple', conditions: when.conditions };
    }
    if (when.field && when.operator) {
        return {
            mode: 'simple',
            conditions: [{ field: when.field, operator: when.operator, value: when.value, logic: 'AND' }]
        };
    }
    return { mode: 'simple', conditions: [] };
}

function _tblEvaluateConditionGroup(conditions, row, allRows) {
    if (!conditions || !conditions.length) return true;
    var results = [];
    for (var i = 0; i < conditions.length; i++) {
        var cond = conditions[i];
        if (!cond || !cond.operator) {
            results.push({ result: false, logic: (cond && cond.logic) || 'AND' });
            continue;
        }
        var fieldValue = cond.field ? row[cond.field] : undefined;
        var compareValue = cond.valueMode === 'field' && cond.valueField
            ? row[cond.valueField]
            : _tblResolveFilterValue(cond.value);
        var operator = _TABLE_FILTER_OPERATORS[cond.operator];
        var result = operator ? operator(fieldValue, compareValue, row, allRows || []) : false;
        results.push({ result: !!result, logic: cond.logic || 'AND' });
    }
    if (!results.length) return true;
    var finalResult = results[0].result;
    for (var j = 1; j < results.length; j++) {
        var prevLogic = results[j - 1].logic;
        finalResult = prevLogic === 'OR' ? (finalResult || results[j].result) : (finalResult && results[j].result);
    }
    return finalResult;
}

function _tblFormatDeltaPercent(value, precision) {
    var n = _tblSafeNumber(value);
    var prec = precision === undefined ? 1 : precision;
    var formatted = new Intl.NumberFormat('pt-PT', {
        minimumFractionDigits: prec,
        maximumFractionDigits: prec
    }).format(Math.abs(n));
    var sign = n > 0 ? '+' : (n < 0 ? '-' : '');
    return sign + formatted + '%';
}

function _tblDeltaBadgeVariantClass(variant) {
    if (variant === 'positive' || variant === 'success') return 'is-positive';
    if (variant === 'negative' || variant === 'danger') return 'is-negative';
    return 'is-neutral';
}

function _tblResolveConditionalDisplayValue(cell, params, thenCfg) {
    var row = cell.getData() || {};
    var valueField = (thenCfg && thenCfg.valueField) || (params && params.valueField) || cell.getField();
    var raw = valueField ? row[valueField] : cell.getValue();
    var displayField = (thenCfg && thenCfg.displayField) || (params && params.displayField) || '';
    if (displayField && row[displayField] != null && row[displayField] !== '') {
        return row[displayField];
    }
    return raw;
}

var _TABLE_CONDITION_PRESET_RENDERERS = {
    deltaPercentBadge: function (cell, params, thenCfg) {
        var row = cell.getData() || {};
        if (row.__rowType === 'section') return '';
        var valueField = (thenCfg && thenCfg.valueField) || (params && params.valueField) || cell.getField();
        var numericRaw = valueField ? (row[valueField] !== undefined ? row[valueField] : cell.getValue()) : cell.getValue();
        var displayField = (thenCfg && thenCfg.displayField) || (params && params.displayField) || '';
        var displayText = (displayField && row[displayField] != null && row[displayField] !== '')
            ? row[displayField]
            : _tblFormatDeltaPercent(numericRaw, thenCfg && thenCfg.precision);
        var variant = thenCfg && thenCfg.variant;
        if (!variant) {
            var n = _tblSafeNumber(numericRaw);
            variant = n > 0 ? 'positive' : (n < 0 ? 'negative' : 'neutral');
        }
        return '<span class="mtbl-delta-badge ' + _tblDeltaBadgeVariantClass(variant) + '">' + _mciEsc(displayText) + '</span>';
    },
    deltaBadge: function (cell, params, thenCfg) {
        var row = cell.getData() || {};
        if (row.__rowType === 'section') return '';
        var numericSource = (thenCfg && thenCfg.valueField) || (params && params.valueField) || cell.getField();
        var numericRaw = numericSource ? (row[numericSource] !== undefined ? row[numericSource] : cell.getValue()) : cell.getValue();
        var displayText = _tblResolveConditionalDisplayValue(cell, params, thenCfg);
        var variant = thenCfg && thenCfg.variant;
        if (!variant) {
            var n = _tblSafeNumber(numericRaw);
            variant = n > 0 ? 'positive' : (n < 0 ? 'negative' : 'neutral');
        }
        return '<span class="mtbl-delta-badge ' + _tblDeltaBadgeVariantClass(variant) + '">' + _mciEsc(displayText) + '</span>';
    },
    statusBadge: function (cell, params, thenCfg) {
        var text = (thenCfg && thenCfg.text) || _mciEsc(cell.getValue());
        var variant = (thenCfg && thenCfg.variant) || 'neutral';
        return '<span class="mtbl-delta-badge ' + _tblDeltaBadgeVariantClass(variant) + '">' + _mciEsc(text) + '</span>';
    },
    plaintext: function (cell) {
        return _mciEsc(cell.getValue());
    }
};

function _tblNormalizeThenClause(then) {
    if (!then) return { format: 'plaintext' };
    if (then.format) return then;
    if (then.mode === 'expression') return { format: 'expression', expr: then.expr || '' };
    if (then.mode === 'formatter') {
        var merged = { format: then.formatter || 'plaintext' };
        if (then.formatterParams && typeof then.formatterParams === 'object') {
            Object.keys(then.formatterParams).forEach(function (k) { merged[k] = then.formatterParams[k]; });
        }
        return merged;
    }
    if (then.preset || then.mode === 'preset') {
        return {
            format: then.preset || 'plaintext',
            variant: then.variant,
            text: then.text,
            precision: then.precision,
            displayField: then.displayField
        };
    }
    return { format: 'plaintext' };
}

function _tblIsBadgeFormat(format) {
    return format === 'deltaPercentBadge' || format === 'deltaBadge' || format === 'statusBadge';
}

function _tblRenderColumnFormat(cell, format, cfg, params) {
    format = format || 'plaintext';
    cfg = cfg || {};
    params = params || {};
    var row = cell.getData() || {};
    if (row.__rowType === 'section' && format !== 'html' && format !== 'expression') return '';
    if (_tblIsBadgeFormat(format)) {
        var badgeRenderer = _TABLE_CONDITION_PRESET_RENDERERS[format];
        return badgeRenderer ? badgeRenderer(cell, params, cfg) : _mciEsc(cell.getValue());
    }
    if (format === 'expression') {
        var compiled = cfg._compiledExpr || _mdashCompileTableExpression(cfg.expr, 'value');
        var result = _mdashEvalCompiledTableExpression(compiled, cell, params.allRows, params.fetchData);
        return _tblCoerceExpressionCellOutput(result, cell.getValue());
    }
    if (format === 'link' || format === 'linkButton') {
        var linkParams = _tblPrepareFormatterParams('link', cfg);
        if (format === 'linkButton') return _tblLinkButtonFormatter(cell, linkParams);
        var url = '#';
        try { url = linkParams.url ? linkParams.url(cell) : (cell.getValue() || '#'); } catch (e1) { }
        var label = cell.getValue();
        try {
            if (linkParams.label) label = linkParams.label(cell);
            else if (linkParams.linkLabel) label = linkParams.linkLabel;
        } catch (e2) { }
        url = _mdashResolveUrl(url, linkParams.urlBase);
        var target = linkParams.target || '_blank';
        return '<a href="' + _mciEsc(url) + '" target="' + _mciEsc(target) + '">' + _mciEsc(label) + '</a>';
    }
    var value = cell.getValue();
    if (format === 'plaintext') return _mciEsc(value);
    if (format === 'money') return _mciEsc(_tblFormatCurrency(value, cfg.precision));
    if (format === 'number') {
        var num = _tblSafeNumber(value);
        return cfg.precision !== undefined ? _mciEsc(num.toFixed(cfg.precision)) : _mciEsc(num);
    }
    if (format === 'percentage') {
        var pn = _tblSafeNumber(value);
        var pp = cfg.precision === undefined ? 1 : cfg.precision;
        var sign = cfg.showSign && pn > 0 ? '+' : (pn < 0 ? '-' : '');
        return _mciEsc(sign + new Intl.NumberFormat('pt-PT', {
            minimumFractionDigits: pp,
            maximumFractionDigits: pp
        }).format(Math.abs(pn)) + '%');
    }
    if (format === 'date' || format === 'datetime') {
        if (value === null || value === undefined || value === '') return '';
        var d = new Date(value);
        if (isNaN(d.getTime())) return _mciEsc(value);
        if (format === 'date') {
            return _mciEsc(('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear());
        }
        return _mciEsc(d.toLocaleString('pt-PT'));
    }
    if (format === 'tickCross') {
        var ok = value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'sim';
        return ok
            ? '<i class="glyphicon glyphicon-ok" style="color:#16a34a;"></i>'
            : '<i class="glyphicon glyphicon-remove" style="color:#dc2626;"></i>';
    }
    if (format === 'star') {
        var stars = Math.min(5, Math.max(0, parseInt(value, 10) || 0));
        var out = '';
        for (var s = 0; s < stars; s++) out += '★';
        for (var u = stars; u < 5; u++) out += '☆';
        return out;
    }
    if (format === 'progress') {
        var pct = Math.min(100, Math.max(0, _tblSafeNumber(value)));
        return '<div style="background:#e2e8f0;border-radius:4px;height:8px;width:100%;min-width:48px;">'
            + '<div style="width:' + pct + '%;background:#2563eb;height:8px;border-radius:4px;"></div></div>';
    }
    if (format === 'color') {
        var colorVal = String(value || '#cbd5e1');
        return '<span style="display:inline-block;width:18px;height:18px;border-radius:4px;background:' + _mciEsc(colorVal) + ';border:1px solid rgba(0,0,0,.12);"></span>';
    }
    if (format === 'html') return String(value == null ? '' : value);
    return _mciEsc(value);
}

function _tblCompileWhenFn(when) {
    when = _tblNormalizeWhenClause(when);
    if (when.mode === 'expression' && when.expr) {
        var compiledWhen = _mdashCompileTableExpression(when.expr, 'boolean');
        return function (cell, row, value, allRows) {
            var result = _mdashEvalCompiledTableExpression(compiledWhen, cell, allRows, function () { return allRows || []; });
            return !!result;
        };
    }
    var conditions = when.conditions || [];
    return function (cell, row, value, allRows) {
        return _tblEvaluateConditionGroup(conditions, row, allRows);
    };
}

function _tblCompileThenFn(then) {
    then = _tblNormalizeThenClause(then);
    var format = then.format || 'plaintext';
    if (format === 'expression') {
        var compiledThen = _mdashCompileTableExpression(then.expr, 'value');
        return function (cell, params) {
            var result = _mdashEvalCompiledTableExpression(compiledThen, cell, params.allRows, params.fetchData);
            return _tblCoerceExpressionCellOutput(result, cell.getValue());
        };
    }
    var thenCfg = then;
    return function (cell, params) {
        return _tblRenderColumnFormat(cell, format, thenCfg, params);
    };
}

function _tblCompileConditionalConfig(conditional, columnField, allRows) {
    conditional = conditional || {};
    var fetchDataFn = function () { return allRows || []; };
    var params = {
        valueField: conditional.valueField || columnField,
        displayField: conditional.displayField || '',
        allRows: allRows || [],
        fetchData: fetchDataFn,
        rules: [],
        fallbackFn: _tblCompileThenFn(conditional.fallback || { format: 'plaintext' })
    };
    (conditional.rules || []).forEach(function (rule) {
        if (!rule) return;
        params.rules.push({
            whenFn: _tblCompileWhenFn(rule.when),
            thenFn: _tblCompileThenFn(rule.then)
        });
    });
    return params;
}

function _tblConditionalFormatter(cell, formatterParams) {
    var row = cell.getData() || {};
    if (row.__rowType === 'section') return '';
    var params = formatterParams || {};
    var rules = params.rules || [];
    var i;
    for (i = 0; i < rules.length; i++) {
        if (rules[i].whenFn(cell, row, cell.getValue(), params.allRows)) {
            return rules[i].thenFn(cell, params);
        }
    }
    if (params.fallbackFn) return params.fallbackFn(cell, params);
    return _mciEsc(cell.getValue());
}

function _tblGetDeltaPercentConditionalTemplate(valueField) {
    valueField = valueField || 'variacaoAcumulada';
    return {
        valueField: valueField,
        rules: [
            {
                when: { mode: 'simple', conditions: [{ field: valueField, operator: 'gt', value: '0', logic: 'AND' }] },
                then: { format: 'deltaPercentBadge', variant: 'positive', precision: 1 }
            },
            {
                when: { mode: 'simple', conditions: [{ field: valueField, operator: 'lt', value: '0', logic: 'AND' }] },
                then: { format: 'deltaPercentBadge', variant: 'negative', precision: 1 }
            }
        ],
        fallback: { format: 'deltaPercentBadge', variant: 'neutral', precision: 1 }
    };
}

function _tblEnsureColumnConditional(col) {
    if (!col || col.formatter !== 'conditional') return col;
    if (!col.conditional || !Array.isArray(col.conditional.rules) || !col.conditional.rules.length) {
        col.conditional = _tblGetDeltaPercentConditionalTemplate(col.field);
    }
    return col;
}

function _tblConditionalSummary(conditional) {
    conditional = conditional || {};
    var count = (conditional.rules || []).length;
    return count ? (count + ' regra' + (count === 1 ? '' : 's')) : 'Sem regras';
}

function _tblCalculateFilterCount(filterDef, allData) {
    if (!allData || !Array.isArray(allData)) return 0;
    if (filterDef.badge && filterDef.badge.field) {
        var field = filterDef.badge.field;
        var value = filterDef.badge.value;
        if (value !== null && value !== undefined) {
            return allData.filter(function(row) { return row[field] == value; }).length;
        }
        return allData.length;
    }
    return _tblApplyFilter(allData, filterDef).length;
}

// ── Helper: Resolver cor PHC / token ──
function _tblResolvePHCColor(colorStr) {
    if (!colorStr) return null;
    if (typeof colorStr === 'string' && colorStr.indexOf('phc:') === 0) {
        var phcType = colorStr.replace('phc:', '');
        if (typeof getCachedColor === 'function') {
            var c = getCachedColor(phcType);
            if (c && c.background) return c.background;
        }
        try {
            if (typeof getColorByType === 'function') {
                var c2 = getColorByType(phcType);
                if (c2 && c2.background) return c2.background;
            }
        } catch (e) { /* fallback */ }
        if (typeof mdashResolveColorValue === 'function') {
            var m = mdashResolveColorValue(phcType);
            if (m && String(m).charAt(0) === '#') return m;
        }
        return null;
    }
    return colorStr;
}

function _tblResolveColorToken(colorStr, fallback) {
    var resolved = _tblResolvePHCColor(colorStr);
    if (resolved) return resolved;
    if (colorStr && String(colorStr).indexOf('phc:') !== 0) return colorStr;
    resolved = _tblResolvePHCColor(fallback);
    if (resolved) return resolved;
    if (fallback && String(fallback).indexOf('phc:') !== 0) return fallback;
    return fallback || '';
}

function _tblParseColorTokenForUI(value, defaultCustom, allowEmpty) {
    if (!value && allowEmpty) return { token: '', custom: defaultCustom || '#2563eb' };
    if (!value) return { token: 'phc:primary', custom: defaultCustom || '#2563eb' };
    if (typeof value === 'string' && value.indexOf('phc:') === 0) {
        return { token: value, custom: defaultCustom || '#2563eb' };
    }
    return { token: 'custom', custom: value || defaultCustom || '#2563eb' };
}

function _mciColorInputValue(color, fallback) {
    fallback = fallback || '#2563eb';
    var v = (color != null && color !== '') ? String(color) : '';
    if (!v || v.indexOf('phc:') === 0) {
        var resolved = _tblResolvePHCColor(v || fallback);
        if (resolved && String(resolved).charAt(0) === '#') return resolved;
        return fallback;
    }
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) return '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return fallback;
}

function _tblPhcColorSelectOptions(currentToken) {
    return ['primary', 'success', 'info', 'warning', 'danger', 'dark'].map(function (pt) {
        var token = 'phc:' + pt;
        return '<option value="' + token + '"' + (currentToken === token ? ' selected' : '') + '>PHC ' + pt.charAt(0).toUpperCase() + pt.slice(1) + '</option>';
    }).join('');
}

function _tblColorTokenFieldHtml(label, prefix, currentValue, compact, allowInherit) {
    var parsed = _tblParseColorTokenForUI(currentValue, undefined, !!allowInherit);
    var showCustom = parsed.token === 'custom';
    var customLabel = compact ? 'Custom' : 'Personalizada';
    return '<div class="mcbi-field mtbl-color-token-wrap' + (compact ? ' style="margin:0;min-width:0;"' : '') + '">'
        + '<label' + (compact ? ' style="font-size:10px;"' : '') + '>' + label + '</label>'
        + '<div style="display:flex;gap:6px;align-items:center;' + (compact ? 'min-width:0;' : '') + '">'
        + '<select class="form-control input-sm mtbl-color-token ' + prefix + '-token" style="flex:1;min-width:0;font-size:10.5px;" title="Personalizada">'
        + (allowInherit ? '<option value=""' + (!parsed.token ? ' selected' : '') + '>Herdar</option>' : '')
        + _tblPhcColorSelectOptions(parsed.token === 'custom' || !parsed.token ? '' : parsed.token)
        + '<option value="custom"' + (showCustom ? ' selected' : '') + '>' + customLabel + '</option>'
        + '</select>'
        + '<input type="color" class="form-control input-sm ' + prefix + '-custom" value="' + _mciEsc(_mciColorInputValue(parsed.custom)) + '" style="flex-shrink:0;width:42px;height:28px;padding:2px;' + (showCustom ? '' : 'display:none;') + '">'
        + '</div></div>';
}

function _tblFontWeightOpts(current, allowInherit) {
    return [
        allowInherit ? ['', 'Herdar'] : null,
        ['400', 'Normal'],
        ['600', 'Semibold'],
        ['700', 'Bold'],
        ['800', 'Extra bold']
    ].filter(Boolean).map(function (o) {
        return '<option value="' + o[0] + '"' + ((current || (allowInherit ? '' : '400')) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
}

function _tblFontFamilyOpts(current, allowInherit) {
    return [
        allowInherit ? ['', 'Herdar'] : ['', 'Padrão da tabela'],
        ['"Inter","Nunito","Segoe UI",Arial,sans-serif', 'Inter / sistema'],
        ['"Nunito",sans-serif', 'Nunito'],
        ['"Segoe UI",Arial,sans-serif', 'Segoe UI'],
        ['Arial,sans-serif', 'Arial'],
        ['monospace', 'Monospace']
    ].filter(Boolean).map(function (o) {
        return '<option value="' + _mciEsc(o[0]) + '"' + ((current || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
}

function _tblNormalizeDataRowStyle(cfg) {
    var drs = (cfg && cfg.dataRowStyle) || {};
    var sr = (cfg && cfg.structuredRows) || {};
    return {
        background: drs.background || sr.dataRowBg || sr.subgroupBg || '#f8fafc',
        textColor: drs.textColor || '#334155',
        fontSize: parseInt(drs.fontSize, 10) || 0,
        fontWeight: drs.fontWeight || '',
        fontFamily: drs.fontFamily || ''
    };
}

function _tblResolveDataRowStyle(cfg) {
    var drs = _tblNormalizeDataRowStyle(cfg);
    var tableFs = parseInt((cfg && cfg.styling && cfg.styling.fontSize), 10) || 13;
    return {
        background: _tblResolveColorToken(drs.background, ''),
        textColor: _tblResolveColorToken(drs.textColor, '#334155'),
        fontSize: drs.fontSize > 0 ? drs.fontSize : tableFs,
        fontWeight: drs.fontWeight || '',
        fontFamily: drs.fontFamily || ''
    };
}

// Posição visual da linha (1-based) dentro dos dados actualmente filtrados/
// ordenados — usa a API do Tabulator quando disponível, com fallback ao
// índice DOM (para versões/casos onde getPosition não está pronto ainda).
function _tblIsEvenRow(row) {
    try {
        var pos = row.getPosition(true);
        if (typeof pos === 'number' && !isNaN(pos)) return pos % 2 === 0;
    } catch (e) { /* ignore */ }
    var el = row.getElement();
    if (el && el.parentNode) {
        var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
        if (idx >= 0) return idx % 2 === 1; // índice 0-based 1 = 2ª linha = par visualmente
    }
    return false;
}

// Resolve o fundo de uma linha de dados respeitando o toggle "Linhas alternadas"
// (cfg.stripedRows). Antes, o fundo fixo de "Estilo Linhas de Dados" (baseBg) era
// sempre aplicado com !important a TODAS as linhas, o que anulava visualmente o
// zebra mesmo com o toggle activo — !important inline vence sempre a regra CSS
// ".tabulator-row-even". Agora: com o toggle ligado, as linhas pares usam a cor
// "Fundo linhas pares" (Estilo Avançado) e as ímpares mantêm o fundo fixo
// configurado; com o toggle desligado, todas as linhas usam o fundo fixo (igual
// ao comportamento anterior).
function _tblResolveStripedRowBackground(cfg, row, baseBg) {
    if (!cfg || cfg.stripedRows === false) return baseBg;
    if (_tblIsEvenRow(row)) {
        var stl = _tblResolveTableStyling(cfg);
        return stl.rowEven || baseBg;
    }
    return baseBg;
}

function _tblNormalizeColumnCellStyle(cellStyle) {
    cellStyle = cellStyle || {};
    return {
        background: cellStyle.background || '',
        textColor: cellStyle.textColor || '',
        fontSize: parseInt(cellStyle.fontSize, 10) || 0,
        fontWeight: cellStyle.fontWeight || '',
        fontFamily: cellStyle.fontFamily || ''
    };
}

function _tblBuildColumnStyleMap(columns) {
    var map = {};
    function walk(cols) {
        (cols || []).forEach(function (c) {
            if (!c) return;
            if (Array.isArray(c.columns)) {
                walk(c.columns);
                return;
            }
            if (c.field) map[c.field] = _tblNormalizeColumnCellStyle(c.cellStyle);
        });
    }
    walk(columns);
    return map;
}

function _tblCellStyleHasValues(cellStyle) {
    cellStyle = _tblNormalizeColumnCellStyle(cellStyle);
    return !!(cellStyle.background || cellStyle.textColor || cellStyle.fontSize || cellStyle.fontWeight || cellStyle.fontFamily);
}

function _tblColumnCellStyleEditorHtml(cellStyle) {
    var cs = _tblNormalizeColumnCellStyle(cellStyle);
    return '<details class="mtbl-col-cellstyle" style="margin-top:6px;">'
        + '<summary style="font-size:10px;font-weight:700;color:#475569;cursor:pointer;user-select:none;">Estilo da célula</summary>'
        + '<div style="padding:6px 2px 0;">'
        + _tblColorTokenFieldHtml('Fundo', 'mtbl-col-cs-bg', cs.background, false, true)
        + _tblColorTokenFieldHtml('Cor do texto', 'mtbl-col-cs-text', cs.textColor, false, true)
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label style="font-size:10px;">Tamanho fonte</label>'
        + '<input type="number" class="mtbl-col-cs-fontsize form-control input-sm" value="' + (cs.fontSize || '') + '" min="0" max="24" placeholder="Herdar" style="font-size:10.5px;"></div>'
        + '<div class="mcbi-field"><label style="font-size:10px;">Peso</label>'
        + '<select class="mtbl-col-cs-fontweight form-control input-sm" style="font-size:10.5px;">' + _tblFontWeightOpts(cs.fontWeight, true) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-field" style="margin-bottom:0;"><label style="font-size:10px;">Fonte</label>'
        + '<select class="mtbl-col-cs-fontfamily form-control input-sm" style="font-size:10.5px;">' + _tblFontFamilyOpts(cs.fontFamily, true) + '</select></div>'
        + '<div style="font-size:9px;color:#64748b;margin-top:4px;line-height:1.35;">Prioridade desta coluna &gt; campo da fonte &gt; estilo da linha.</div>'
        + '</div></details>';
}

function _tblReadColumnCellStyle($card) {
    var cs = {
        background: _tblReadColorTokenField($card, 'mtbl-col-cs-bg'),
        textColor: _tblReadColorTokenField($card, 'mtbl-col-cs-text'),
        fontSize: parseInt($card.find('.mtbl-col-cs-fontsize').val(), 10) || 0,
        fontWeight: $card.find('.mtbl-col-cs-fontweight').val() || '',
        fontFamily: $card.find('.mtbl-col-cs-fontfamily').val() || ''
    };
    return _tblCellStyleHasValues(cs) ? cs : null;
}

function _tblApplyDataRowCellStyles(row, cfg) {
    var data = row.getData() || {};
    var rowType = data.__rowType || 'data';
    if (rowType === 'section') return;

    var colStyleMap = _tblBuildColumnStyleMap(cfg.columns);
    var rowStyle = _tblResolveDataRowStyle(cfg);
    var sr = cfg.structuredRows || {};
    var rowTextDefault = rowType === 'total'
        ? _tblResolveColorToken(sr.totalText, rowStyle.textColor)
        : rowStyle.textColor;

    row.getCells().forEach(function (cell) {
        var field = cell.getField();
        var colStyle = colStyleMap[field] || {};
        var el = cell.getElement();
        if (!el) return;

        var bg = '';
        if (colStyle.background) bg = _tblResolveColorToken(colStyle.background, '');

        if (bg) el.style.setProperty('background', bg, 'important');
        else el.style.background = '';

        var color = '';
        if (colStyle.textColor) color = _tblResolveColorToken(colStyle.textColor, '');
        else if (data.__rowTextColor) color = _tblResolveColorToken(data.__rowTextColor, '');
        else if (rowTextDefault) color = rowTextDefault;

        if (color) el.style.color = color;

        var fontSize = colStyle.fontSize > 0 ? colStyle.fontSize : rowStyle.fontSize;
        if (fontSize > 0) el.style.fontSize = fontSize + 'px';

        var fontWeight = colStyle.fontWeight || rowStyle.fontWeight;
        if (fontWeight) el.style.fontWeight = fontWeight;
        else el.style.fontWeight = '';

        var fontFamily = colStyle.fontFamily || rowStyle.fontFamily;
        if (fontFamily) el.style.fontFamily = fontFamily;
        else el.style.fontFamily = '';
    });
}

function _tblApplyPlainDataRowStyles(row, cfg) {
    var data = row.getData() || {};
    var rowType = data.__rowType || 'data';
    if (rowType === 'section') return;

    var rowStyle = _tblResolveDataRowStyle(cfg);
    var rowEl = row.getElement();
    var rowBg = data.__rowBackground
        ? _tblResolveColorToken(data.__rowBackground, '')
        : _tblResolveStripedRowBackground(cfg, row, rowStyle.background);
    if (rowBg) rowEl.style.setProperty('background', rowBg, 'important');
}

function _tblBuildTableRowFormatter(columns, cfg, rows) {
    var structuredFmt = _tblHasStructuredRows(rows)
        ? _tblBuildStructuredRowFormatter(columns, cfg.structuredRows || {}, cfg)
        : null;
    return function (row) {
        if (structuredFmt) structuredFmt(row);
        else _tblApplyPlainDataRowStyles(row, cfg);
        _tblApplyDataRowCellStyles(row, cfg);
    };
}

function _tblReadColorTokenField($scope, prefix) {
    var token = $scope.find('.' + prefix + '-token').val();
    if (token === 'custom') return ($scope.find('.' + prefix + '-custom').val() || '').trim();
    return token || '';
}

function _tblResolveTableStyling(cfg, theme) {
    var stl = (cfg && cfg.styling) || {};
    theme = theme || _tblResolveTheme(_TABLE_THEMES[(cfg && cfg.theme) || 'phcPrimary'] || _TABLE_THEMES.phcPrimary);
    var headerBg = _tblResolveColorToken(stl.headerBg || stl.headerBackgroundColor, theme.headerBg);
    return {
        headerBg: headerBg,
        headerBgGroup: _tblResolveHeaderGroupBg(headerBg, stl.headerGroupBg),
        headerText: _tblResolveColorToken(stl.headerText || stl.headerTextColor, theme.headerText),
        accentColor: _tblResolveColorToken(stl.accentColor, theme.accent),
        rowEven: _tblResolveColorToken(stl.rowEven, theme.rowEven),
        rowHover: _tblResolveColorToken(stl.rowHover, theme.rowHover),
        borderRadius: stl.borderRadius || 10,
        fontSize: stl.fontSize || 13
    };
}

function _tblApplyThemeTokensToPanel(panel, themeKey) {
    var themeDef = _TABLE_THEMES[themeKey] || _TABLE_THEMES.phcPrimary;
    if (themeDef.phcType) {
        var phcToken = 'phc:' + themeDef.phcType;
        panel.find('.mtbl-hdrbg-token').val(phcToken);
        panel.find('.mtbl-hdrbg-custom').hide();
        panel.find('.mtbl-accent-token').val(phcToken);
        panel.find('.mtbl-accent-custom').hide();
        panel.find('.mtbl-hdrtext-token').val('custom');
        panel.find('.mtbl-hdrtext-custom').val(themeDef.headerText || '#ffffff').show();
        panel.find('.mtbl-roweven-token').val('custom');
        panel.find('.mtbl-roweven-custom').val(themeDef.rowEven || '#f8fafc').show();
        panel.find('.mtbl-rowhover-token').val('custom');
        panel.find('.mtbl-rowhover-custom').val(themeDef.rowHover || 'rgba(0,0,0,.03)').show();
        return;
    }
    panel.find('.mtbl-hdrbg-token').val('custom');
    panel.find('.mtbl-hdrbg-custom').val(themeDef.headerBg || '#1e293b').show();
    panel.find('.mtbl-hdrtext-token').val('custom');
    panel.find('.mtbl-hdrtext-custom').val(themeDef.headerText || '#f8fafc').show();
    panel.find('.mtbl-accent-token').val('custom');
    panel.find('.mtbl-accent-custom').val(themeDef.accent || '#2563eb').show();
    panel.find('.mtbl-roweven-token').val('custom');
    panel.find('.mtbl-roweven-custom').val(themeDef.rowEven || '#f8fafc').show();
    panel.find('.mtbl-rowhover-token').val('custom');
    panel.find('.mtbl-rowhover-custom').val(themeDef.rowHover || 'rgba(0,0,0,.03)').show();
}

function _tblRenderFilters(filterConfig, currentData) {
    console.log('[Table Filters] _tblRenderFilters chamado:', filterConfig);
    
    if (!filterConfig || !filterConfig.enabled || !filterConfig.definitions || !filterConfig.definitions.length) {
        console.log('[Table Filters] Filtros não renderizados:', {
            hasConfig: !!filterConfig,
            enabled: filterConfig ? filterConfig.enabled : 'N/A',
            hasDefinitions: filterConfig ? !!filterConfig.definitions : 'N/A',
            definitionsLength: filterConfig && filterConfig.definitions ? filterConfig.definitions.length : 0
        });
        return '';
    }
    
    console.log('[Table Filters] Renderizando', filterConfig.definitions.length, 'filtros');
    
    var html = '<div class="mtbl-filters-bar">';
    filterConfig.definitions.forEach(function(filter) {
        if (filter.type === 'button') {
            var isActive = filterConfig.activeFilterKey === filter.key;
            var count = _tblCalculateFilterCount(filter, currentData);
            
            console.log('[Table Filters] Filtro:', filter.label, 'count:', count, 'active:', isActive);
            
            // Classes: base + ativa + customizadas
            var classes = ['mtbl-filter-btn'];
            if (isActive) classes.push('is-active');
            if (filter.style && filter.style.customClass) {
                classes.push(_mciEsc(filter.style.customClass));
            }
            
            html += '<button type="button" class="' + classes.join(' ') + '"';
            html += ' data-filter-key="' + _mciEsc(filter.key) + '"';
            
            // Estilos inline customizados
            var styles = [];
            if (filter.style) {
                // Cor ativa
                if (isActive && filter.style.activeColor) {
                    var activeColor = _tblResolvePHCColor(filter.style.activeColor) || filter.style.activeColor;
                    styles.push('background-color:' + _mciEsc(activeColor));
                    styles.push('border-color:' + _mciEsc(activeColor));
                    // Detectar se cor é clara → texto escuro para legibilidade
                    var txtOnActive = '#fff';
                    if (activeColor && activeColor.charAt(0) === '#') {
                        var _h = activeColor.replace('#','');
                        if (_h.length === 3) _h = _h[0]+_h[0]+_h[1]+_h[1]+_h[2]+_h[2];
                        var _lum = (0.299*parseInt(_h.substr(0,2),16) + 0.587*parseInt(_h.substr(2,2),16) + 0.114*parseInt(_h.substr(4,2),16)) / 255;
                        if (_lum > 0.52) txtOnActive = '#1a1a1a';
                    }
                    styles.push('color:' + txtOnActive);
                }
                // Estilos customizados adicionais
                if (filter.style.customStyle) {
                    styles.push(_mciEsc(filter.style.customStyle));
                }
            }
            if (styles.length > 0) {
                html += ' style="' + styles.join(';') + '"';
            }
            
            html += '>';
            if (filter.icon) html += '<i class="' + _mciEsc(filter.icon) + '"></i> ';
            html += _mciEsc(filter.label);
            if (filter.badge && filter.badge.enabled) {
                html += ' <span class="mtbl-filter-badge">' + _mciEsc(filter.badge.format.replace('{count}', count)) + '</span>';
            }
            html += '</button>';
        }
    });
    html += '</div>';
    
    console.log('[Table Filters] HTML gerado:', html.length, 'chars');
    return html;
}

function _tblAddFiltersCSS() {
    if ($('#mtbl-filters-styles').length) return;
    var css = '<style id="mtbl-filters-styles">'
        + '.mtbl-filters-bar{display:flex;flex-wrap:wrap;gap:8px;padding:10px 2px;background:transparent;}'
        + '.mtbl-filter-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;font-size:14px;font-weight:600;'
        + 'color:#475569;background:#f8fafc;border:1.5px solid rgba(0,0,0,.11);border-radius:8px;cursor:pointer;'
        + 'transition:background .15s,border-color .15s,color .15s;white-space:nowrap;user-select:none;}'
        + '.mtbl-filter-btn:hover{background:#f1f5f9;border-color:#2563eb;color:#2563eb;}'
        + '.mtbl-filter-btn.is-active{background:#2563eb;border-color:#2563eb;color:#fff;font-weight:700;}'
        + '.mtbl-filter-btn.is-active:hover{background:#1d4ed8;border-color:#1d4ed8;}'
        + '.mtbl-filter-btn i{font-size:13px;opacity:.85;}'
        + '.mtbl-filter-badge{display:inline-block;min-width:20px;height:20px;padding:0 6px;font-size:12px;font-weight:700;'
        + 'line-height:20px;text-align:center;background:rgba(0,0,0,.12);color:inherit;border-radius:10px;}'
        + '.mtbl-filter-btn.is-active .mtbl-filter-badge{background:rgba(255,255,255,.25);color:#fff;}'
        + '@media (max-width:768px){.mtbl-filters-bar{gap:6px;padding:8px 12px;}'
        + '.mtbl-filter-btn{padding:8px 14px;font-size:13px;}'
        + '.mtbl-filter-badge{font-size:10px;min-width:18px;height:18px;line-height:18px;}}'
        + '</style>';
    $('head').append(css);
}

function _tblColPanelCSS() {
    if ($('#mtbl-col-panel-styles').length) return;
    $('head').append('<style id="mtbl-col-panel-styles">'
        + '.mtbl-col-list>.mcbi-sr,.mtbl-group-col-list>.mcbi-sr{margin-bottom:5px;}'
        + '.mtbl-col-card.is-dragging,.mtbl-col-group-card.is-dragging,.mtbl-filter-item.is-dragging{opacity:.65;}'
        + '.mtbl-sortable-placeholder{border:1px dashed #94a3b8;border-radius:7px;background:#f1f5f9;margin-bottom:5px;min-height:36px;box-sizing:border-box;}'
        + '.mtbl-col-list .mcbi-sr-hd,.mtbl-col-group-card>.mcbi-sr-hd{cursor:default;}'
        + '.mtbl-col-drag,.mtbl-group-drag,.mtbl-filter-drag{cursor:move !important;color:#94a3b8;font-size:10px;flex-shrink:0;}'
        + '.mtbl-col-group-card>.mcbi-sr-body>.mcbi-field{margin-top:0;}'
        + '.mtbl-group-col-list{padding-left:7px;border-left:2px solid #d40032;margin-top:6px;}'
        + '</style>');
}

function _tblSortableChevron() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,5 8,11 13,5"/></svg>';
}

function _tblRefreshColCardTitle($card) {
    if (!$card || !$card.length) return;
    var summary = _tblTitleBindingSummary(_tblReadTitleBinding($card, 'mtbl-col-title'));
    var field = $card.find('.mtbl-col-field').val();
    $card.find('.mtbl-col-title-lbl').text(summary || field || 'Coluna');
}

function _tblRefreshGroupCardTitle($card) {
    if (!$card || !$card.length) return;
    var summary = _tblTitleBindingSummary(_tblReadTitleBinding($card, 'mtbl-group-title'));
    $card.find('.mtbl-group-title-lbl').text(summary || 'Grupo');
}

function _tblInitPanelSortables(panel, obj, fire) {
    if (typeof $.fn.sortable !== 'function') return;

    var sortableOpts = {
        axis: 'y',
        tolerance: 'pointer',
        distance: 4,
        cancel: 'input,button,select,textarea,.mcbi-sr-tog,.mtbl-col-remove,.mtbl-group-remove,.mtbl-filter-remove,.mtbl-filter-edit',
        placeholder: 'mtbl-sortable-placeholder',
        forcePlaceholderSize: true,
        start: function (ev, ui) {
            ui.item.addClass('is-dragging');
            if (ui.placeholder) ui.placeholder.height(ui.item.outerHeight());
        },
        stop: function (ev, ui) {
            ui.item.removeClass('is-dragging');
        }
    };

    var $colList = panel.find('.mtbl-col-list');
    if ($colList.length) {
        if ($colList.hasClass('ui-sortable')) {
            try { $colList.sortable('destroy'); } catch (e) { }
        }
        if ($colList.children('.mtbl-col-card, .mtbl-col-group-card').length) {
            $colList.sortable($.extend({}, sortableOpts, {
                items: '> .mtbl-col-card, > .mtbl-col-group-card',
                handle: '.mtbl-col-drag, .mtbl-group-drag',
                stop: function (ev, ui) {
                    sortableOpts.stop(ev, ui);
                    fire();
                }
            }));
        }
    }

    panel.find('.mtbl-group-col-list').each(function () {
        var $groupList = $(this);
        if ($groupList.hasClass('ui-sortable')) {
            try { $groupList.sortable('destroy'); } catch (e) { }
        }
        if (!$groupList.children('.mtbl-col-card').length) return;
        $groupList.sortable($.extend({}, sortableOpts, {
            items: '> .mtbl-col-card',
            handle: '.mtbl-col-drag',
            stop: function (ev, ui) {
                sortableOpts.stop(ev, ui);
                fire();
            }
        }));
    });

    var $filterList = panel.find('.mtbl-filters-list');
    if ($filterList.length) {
        if ($filterList.hasClass('ui-sortable')) {
            try { $filterList.sortable('destroy'); } catch (e) { }
        }
        if ($filterList.children('.mtbl-filter-item').length) {
            $filterList.sortable($.extend({}, sortableOpts, {
                items: '> .mtbl-filter-item',
                handle: '.mtbl-filter-drag',
                stop: function (ev, ui) {
                    sortableOpts.stop(ev, ui);
                    if (!obj.config || !obj.config.filters || !Array.isArray(obj.config.filters.definitions)) return;
                    var defs = obj.config.filters.definitions;
                    var newOrder = [];
                    $filterList.children('.mtbl-filter-item').each(function (newIdx) {
                        var oldIdx = $(this).data('idx');
                        $(this).attr('data-idx', newIdx);
                        if (defs[oldIdx] !== undefined) newOrder.push(defs[oldIdx]);
                    });
                    if (newOrder.length === defs.length) {
                        obj.config.filters.definitions = newOrder;
                    }
                    fire();
                }
            }));
        }
    }
}


// ── Painel de propriedades inline da Tabela ──────────────────────────────────
function renderTablePropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_TABLE_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var dashboardFilters = _tblGetDashboardFiltersList();

    _mciCSS();
    _tblCSS();
    _tblColPanelCSS();

    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mtbl-root').length) return;
            _tblReadConfig(panel, obj);
            // Sincronizar a invariante triplicada antes de persistir
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }

    // Transform badge
    var _hasTrans = !!((obj.transformConfig && obj.transformConfig.sourceTable)
        || (cfg.transformConfig && cfg.transformConfig.sourceTable));

    // ── Sec\u00e7\u00e3o: Dados ──
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte dispon\u00edvel neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transforma\u00e7\u00e3o: <strong>'
              + _mciEsc((obj.transformConfig && obj.transformConfig.sourceTable)
                  || (cfg.transformConfig && cfg.transformConfig.sourceTable) || 'SQL')
              + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transforma\u00e7\u00e3o de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    // ── Sec\u00e7\u00e3o: Tema visual ──
    var sTema = '<div class="mcbi-field"><label>Tema</label>'
        + '<div class="mtbl-theme-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:5px;">';
    Object.keys(_TABLE_THEMES).forEach(function (k) {
        var t = _tblResolveTheme(_TABLE_THEMES[k]);
        var isActive = (cfg.theme || 'phcPrimary') === k;
        sTema += '<button type="button" class="mtbl-theme-btn' + (isActive ? ' is-on' : '') + '" data-theme="' + k + '"'
            + ' style="display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:7px;border:1.5px solid ' + (isActive ? t.accent : 'rgba(0,0,0,.08)') + ';background:' + (isActive ? 'rgba(37,99,235,.06)' : '#fff') + ';cursor:pointer;transition:all .15s;">'
            + '<div style="display:flex;gap:2px;margin-bottom:3px;">'
            + '<span style="width:16px;height:10px;border-radius:2px;background:' + t.headerBg + ';"></span>'
            + '<span style="width:8px;height:10px;border-radius:2px;background:' + t.accent + ';opacity:.6;"></span>'
            + '</div>'
            + '<span style="font-size:9.5px;font-weight:600;color:#475569;">' + t.name + '</span>'
            + '</button>';
    });
    var customParsed = _tblParseColorTokenForUI((cfg.styling && cfg.styling.headerBg) || '#2563eb');
    var isCustomTheme = cfg.theme === 'custom';
    var customHex = customParsed.custom || '#2563eb';
    var customAccent = _mdashDarkenHex(customHex, 0.14);
    sTema += '<button type="button" class="mtbl-theme-btn mtbl-theme-custom' + (isCustomTheme ? ' is-on' : '') + '" data-theme="custom"'
        + ' style="display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:7px;border:1.5px solid ' + (isCustomTheme ? customHex : 'rgba(0,0,0,.08)') + ';background:' + (isCustomTheme ? 'rgba(37,99,235,.06)' : '#fff') + ';cursor:pointer;transition:all .15s;">'
        + '<div class="mtbl-theme-custom-preview" style="display:flex;gap:2px;margin-bottom:3px;position:relative;width:26px;height:10px;" title="Escolher cor">'
        + '<span class="mtbl-theme-custom-hdr" style="width:16px;height:10px;border-radius:2px;background:' + _mciEsc(customHex) + ';"></span>'
        + '<span class="mtbl-theme-custom-acc" style="width:8px;height:10px;border-radius:2px;background:' + _mciEsc(customAccent) + ';opacity:.6;"></span>'
        + '<input type="color" class="mtbl-theme-custom-picker" value="' + _mciEsc(_mciColorInputValue(customHex)) + '" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:none;padding:0;margin:0;">'
        + '</div>'
        + '<span style="font-size:9.5px;font-weight:600;color:#475569;">Personalizada</span>'
        + '</button>';
    sTema += '</div>'
        + '<div class="mcbi-info" style="margin-top:6px;">Temas PHC usam tokens dinâmicos (<code>phc:primary</code>, etc.) e acompanham o tema do PHC sem voltar a configurar.</div></div>';

    // ── Sec\u00e7\u00e3o: Layout ──
    var sLayout = '<div class="mcbi-field"><label>Modo de layout</label>'
        + '<select class="mtbl-layout form-control input-sm">'
        + [['fitColumns', 'Ajustar colunas'], ['fitData', 'Ajustar aos dados'], ['fitDataFill', 'Preencher'], ['fitDataStretch', 'Esticar']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((cfg.layout || 'fitColumns') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Altura</label>'
        + '<select class="mtbl-height form-control input-sm">'
        + [['auto', 'Autom\u00e1tica'], ['300px', '300px'], ['400px', '400px'], ['500px', '500px'], ['600px', '600px'], ['800px', '800px']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((cfg.height || 'auto') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Altura m\u00e1xima</label>'
        + '<input type="text" class="mtbl-maxheight form-control input-sm" value="' + _mciEsc(cfg.maxHeight || '500px') + '" placeholder="ex: 500px"></div>'
        + '</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mtbl-striped', 'Linhas alternadas', cfg.stripedRows !== false)
        + _mciChk('mtbl-hover', 'Highlight ao passar', cfg.hoverHighlight !== false)
        + _mciChk('mtbl-resizable', 'Colunas redimension\u00e1veis', cfg.resizableColumns !== false)
        + _mciChk('mtbl-movable', 'Colunas mov\u00edveis', cfg.movableColumns === true)
        + _mciChk('mtbl-headerfilter', 'Filtros no cabe\u00e7alho', cfg.headerFilter === true)
        + '</div>';

    // ── Sec\u00e7\u00e3o: Pagina\u00e7\u00e3o ──
    var pgn = cfg.pagination || {};
    var sPagination = '<div class="mcbi-checks">'
        + _mciChk('mtbl-paginate', 'Ativar pagina\u00e7\u00e3o', pgn.enabled === true)
        + '</div>'
        + '<div class="mcbi-field"><label>Registos por p\u00e1gina</label>'
        + '<select class="mtbl-pagesize form-control input-sm">'
        + [5, 10, 15, 25, 50, 100].map(function (n) {
            return '<option value="' + n + '"' + ((pgn.size || 15) === n ? ' selected' : '') + '>' + n + '</option>';
        }).join('') + '</select></div>';

    // ── Sec\u00e7\u00e3o: Colunas ──
    var sColunas = '<div class="mcbi-checks">'
        + _mciChk('mtbl-autocols', 'Auto-gerar colunas', cfg.autoColumns !== false)
        + '</div>'
        + '<div class="mtbl-cols-manual" style="' + (cfg.autoColumns !== false ? 'display:none;' : '') + '">'
        + '<div class="mtbl-column-actions" style="display:flex;flex-direction:column;gap:5px;margin:4px 0 8px;padding-bottom:8px;border-bottom:1px solid rgba(0,0,0,.08);">'
        + '<button type="button" class="btn btn-xs mtbl-add-group" style="display:block;width:100%;min-height:32px;border:1px solid #d40032;background:#d40032;color:#fff;font-weight:700;"><i class="glyphicon glyphicon-folder-open"></i> Adicionar grupo de colunas</button>'
        + '<button type="button" class="btn btn-xs btn-default mtbl-add-col" style="display:block;width:100%;min-height:30px;"><i class="glyphicon glyphicon-plus"></i> Adicionar coluna simples</button>'
        + '</div>'
        + '<div class="mtbl-col-list" style="max-height:260px;overflow:auto;padding-right:3px;">';
    var manualCols = cfg.columns || [];
    if (manualCols.length) {
        manualCols.forEach(function (c, i) {
            sColunas += (c && Array.isArray(c.columns))
                ? _tblGroupCard(c, i, fields, fontes, dashboardFilters, { isOpen: i === 0 })
                : _tblColCard(c, i, fields, fontes, dashboardFilters, { isOpen: i === 0 });
        });
    } else {
        sColunas += '<div class="mcbi-info">Desative "Auto-gerar" e adicione colunas manualmente.</div>';
    }
    sColunas += '</div></div>';

    // ── Sec\u00e7\u00e3o: Hierarquia ──
    var dt = cfg.dataTree || {};
    var sTree = '<div class="mcbi-checks">'
        + _mciChk('mtbl-tree', 'Ativar estrutura hier\u00e1rquica', dt.enabled === true)
        + '</div>'
        + '<div class="mtbl-tree-opts" style="' + (dt.enabled ? '' : 'display:none;') + '">'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo ID</label>'
        + '<select class="mtbl-tree-parent form-control input-sm">'
        + _tblFieldOpts(fields, dt.parentField) + '</select></div>'
        + '<div class="mcbi-field"><label>Campo pai</label>'
        + '<select class="mtbl-tree-child form-control input-sm">'
        + _tblFieldOpts(fields, dt.childField) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mtbl-tree-expand', 'Expandir tudo inicialmente', dt.startExpanded !== false)
        + '</div></div>';

    // ── Secção: Linhas e grupos ──
    var sr = cfg.structuredRows || {};
    var srLevels = Array.isArray(sr.groupLevels)
        ? sr.groupLevels.filter(function (level) { return level && level.field; })
        : [
            { field: sr.groupField || '', bg: sr.sectionBg || '#eef4ff', text: sr.sectionText || '#d40032', accent: sr.sectionAccent || '#d40032', bullet: sr.sectionBullet || 'circle' },
            { field: sr.subgroupField || '', bg: sr.subgroupBg || '#f8fafc', text: sr.subgroupText || '#334155', accent: sr.subgroupAccent || '#64748b', bullet: sr.subgroupBullet || 'diamond' }
        ].filter(function (level) { return level.field; });
    var sStructuredRows = '<div class="mcbi-checks">'
        + _mciChk('mtbl-rows-enable', 'Ativar linhas agrupadas', sr.enabled === true)
        + '</div>'
        + '<div class="mtbl-rows-config" style="' + (sr.enabled ? '' : 'display:none;') + '">'
        + '<div class="mcbi-info" style="margin-bottom:8px;">Adicione os niveis da hierarquia pela ordem: nivel 1, nivel 2, nivel 3. O nome do grupo aparece sempre na primeira coluna visivel.</div>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0 6px;">'
        + '<div style="font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;">Niveis</div>'
        + '<button type="button" class="btn btn-xs btn-default mtbl-add-level"><i class="glyphicon glyphicon-plus"></i> Adicionar nivel</button>'
        + '</div>'
        + '<div class="mtbl-levels">';
    if (srLevels.length) {
        srLevels.forEach(function (level, idx) {
            sStructuredRows += _tblGroupLevelRow(level, idx, fields);
        });
    } else {
        sStructuredRows += '<div class="mcbi-info">Nenhum nivel definido. Adicione pelo menos um nivel de agrupamento.</div>';
    }
    sStructuredRows += '</div>'
        + '<div style="font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;margin:10px 0 5px;">Estilo por nível</div>'
        + _tblRowStyleEditor('Total', 'total', { bg: sr.totalBg || '#eef4ff', text: sr.totalText || '#0f172a', accent: sr.totalAccent || sr.totalText || '#0f172a', bullet: sr.totalBullet || 'bar' })
        + '<div style="font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;margin:9px 0 5px;">Cores específicas vindas da fonte</div>'
        + '<div class="mcbi-field"><label>Campo cor de fundo</label><select class="mtbl-row-bg-field form-control input-sm">' + _tblFieldOpts(fields, sr.backgroundField || '__rowBackground') + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo cor texto</label><select class="mtbl-row-text-field form-control input-sm">' + _tblFieldOpts(fields, sr.textColorField || '__rowTextColor') + '</select></div>'
        + '<div class="mcbi-field"><label>Campo cor destaque</label><select class="mtbl-row-accent-field form-control input-sm">' + _tblFieldOpts(fields, sr.accentColorField || '__rowAccentColor') + '</select></div>'
        + '</div></div>';

    // ── Sec\u00e7\u00e3o: Exporta\u00e7\u00e3o ──
    var expCfg = cfg.exportOptions || {};
    var sExport = '<div class="mcbi-checks">'
        + _mciChk('mtbl-exp-excel', 'Exportar Excel', expCfg.enableExcel !== false)
        + _mciChk('mtbl-exp-pdf-chk', 'Exportar PDF', expCfg.enablePDF === true)
        + '</div>';

    // ── Sec\u00e7\u00e3o: Estilo ──
    var stl = cfg.styling || {};
    var panelTheme = _tblResolveTheme(_TABLE_THEMES[cfg.theme || 'phcPrimary'] || _TABLE_THEMES.phcPrimary);
    var sEstilo = '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Cor cabe\u00e7alho', 'mtbl-hdrbg', stl.headerBg || stl.headerBackgroundColor || 'phc:primary')
        + _tblColorTokenFieldHtml('Texto cabe\u00e7alho', 'mtbl-hdrtext', stl.headerText || stl.headerTextColor || '#ffffff')
        + '</div>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Cor destaque', 'mtbl-accent', stl.accentColor || 'phc:primary')
        + '<div class="mcbi-field"><label>Raio bordas</label>'
        + '<input type="number" class="mtbl-radius form-control input-sm" value="' + (stl.borderRadius || 10) + '" min="0" max="20" style="width:70px;"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Tamanho fonte</label>'
        + '<input type="number" class="mtbl-fontsize form-control input-sm" value="' + (stl.fontSize || 13) + '" min="10" max="18" style="width:70px;"> px</div>'
        + '<div class="mcbi-field"><label>Tam. fonte cabeçalho</label>'
        + '<input type="number" class="mtbl-hdrfontsize form-control input-sm" value="' + (stl.headerFontSize || '') + '" min="8" max="20" placeholder="Auto (11)" style="width:70px;"> px</div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Fundo linhas pares', 'mtbl-roweven', stl.rowEven || panelTheme.rowEven)
        + _tblColorTokenFieldHtml('Highlight hover', 'mtbl-rowhover', stl.rowHover || panelTheme.rowHover)
        + '</div>'
        + '<div class="mcbi-info">As linhas pares usam o checkbox <strong>Linhas alternadas</strong> no Layout. O estilo das linhas de dados está em <strong>Estilo Linhas de Dados</strong>.</div>';

    // ── Secção: Estilo linhas de dados ──
    var drsUi = _tblNormalizeDataRowStyle(cfg);
    var tableFsHint = (stl.fontSize || 13);
    var sDataRowStyle = _tblColorTokenFieldHtml('Fundo', 'mtbl-drs-bg', drsUi.background, false)
        + _tblColorTokenFieldHtml('Cor do texto', 'mtbl-drs-text', drsUi.textColor, false)
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Tamanho fonte</label>'
        + '<input type="number" class="mtbl-drs-fontsize form-control input-sm" value="' + (drsUi.fontSize || '') + '" min="0" max="24" placeholder="Herdar (' + tableFsHint + ')" style="font-size:10.5px;"></div>'
        + '<div class="mcbi-field"><label>Peso</label>'
        + '<select class="mtbl-drs-fontweight form-control input-sm" style="font-size:10.5px;">' + _tblFontWeightOpts(drsUi.fontWeight, true) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Fonte</label>'
        + '<select class="mtbl-drs-fontfamily form-control input-sm" style="font-size:10.5px;">' + _tblFontFamilyOpts(drsUi.fontFamily, true) + '</select></div>'
        + '<div class="mcbi-info" style="margin-top:6px;">Prioridade: <strong>coluna</strong> &gt; campo da fonte (<code>__rowTextColor</code>, etc.) &gt; estilo da linha &gt; tema. O fundo da coluna cobre apenas essa célula; o fundo da linha fica visível nas restantes.</div>';

    // ── Secção: Filtros Rápidos ──
    var flt = cfg.filters || { enabled: false, definitions: [] };
    var sFiltros = '<div class="mcbi-checks">';
    sFiltros += _mciChk('mtbl-filters-enable', 'Ativar filtros rápidos', flt.enabled === true);
    sFiltros += '</div>';
    sFiltros += '<div class="mtbl-filters-config" style="' + (flt.enabled ? '' : 'display:none;') + '">';
    sFiltros += '<div class="mcbi-field" style="margin-top:12px;">';
    sFiltros += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
    sFiltros += '<label style="margin:0;font-weight:600;">Filtros Configurados</label>';
    sFiltros += '<button type="button" class="btn btn-xs btn-default mtbl-add-filter">';
    sFiltros += '<i class="glyphicon glyphicon-plus"></i> Adicionar</button>';
    sFiltros += '</div>';
    sFiltros += '<div class="mtbl-filters-list" style="margin-top:8px;">';
    if (flt.definitions && flt.definitions.length) {
        flt.definitions.forEach(function(f, idx) {
            sFiltros += '<div class="mtbl-filter-item" data-idx="' + idx + '" style="display:flex;align-items:center;gap:6px;padding:6px;background:#f8fafc;border-radius:6px;margin-bottom:4px;">';
            sFiltros += '<span class="glyphicon glyphicon-menu-hamburger mtbl-filter-drag" title="Arrastar para reordenar"></span>';
            sFiltros += '<input type="text" class="form-control input-sm mtbl-filter-label" value="' + _mciEsc(f.label || '') + '" placeholder="Label" style="flex:1;">';
            sFiltros += '<button type="button" class="btn btn-xs btn-default mtbl-filter-edit" title="Editar condições">';
            sFiltros += '<i class="glyphicon glyphicon-cog"></i></button>';
            sFiltros += '<button type="button" class="btn btn-xs btn-danger mtbl-filter-remove" title="Remover">';
            sFiltros += '<i class="glyphicon glyphicon-trash"></i></button>';
            sFiltros += '</div>';
        });
    } else {
        sFiltros += '<div class="mcbi-info">Nenhum filtro. Clique "Adicionar".</div>';
    }
    sFiltros += '</div></div></div>';

    // ── Montar HTML ──
    var html = '<div class="mcbi-root mtbl-root" data-stamp="' + stamp + '">'
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('tema', 'Tema Visual', 'glyphicon-eye-open', true, sTema)
        + _mciSection('layout', 'Layout', 'glyphicon-th-large', true, sLayout)
        + _mciSection('filtros', 'Filtros Rápidos', 'glyphicon-filter', false, sFiltros)
        + _mciSection('paginacao', 'Paginação', 'glyphicon-forward', false, sPagination)
        + _mciSection('colunas', 'Colunas', 'glyphicon-th-list', false, sColunas)
        + _mciSection('linhas-dados', 'Estilo Linhas de Dados', 'glyphicon-list-alt', false, sDataRowStyle)
        + _mciSection('linhas-grupos', 'Linhas e Grupos', 'glyphicon-align-left', false, sStructuredRows)
        + _mciSection('hierarquia', 'Hierarquia', 'glyphicon-tree-deciduous', false, sTree)
        + _mciSection('exportacao', 'Exportação', 'glyphicon-download-alt', false, sExport)
        + _mciSection('estilo', 'Estilo Avançado', 'glyphicon-tint', false, sEstilo)
        + '</div>';

    panel.html(html);

    // ── Event handlers ──
    // Limpar TODOS os handlers (incluindo de outros tipos de objetos)
    panel.off();

    // Colapsar/expandir colunas e grupos
    panel.on('click.tblinline', '.mtbl-col-tog', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('.mtbl-col-card').toggleClass('is-open');
    });
    panel.on('click.tblinline', '.mtbl-group-tog', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('.mtbl-col-group-card').toggleClass('is-open');
    });
    panel.on('change.tblinline', '.mtbl-col-field, .mtbl-col-title-mode, .mtbl-col-title-text, .mtbl-col-title-field', function () {
        _tblRefreshColCardTitle($(this).closest('.mtbl-col-card'));
    });
    panel.on('change.tblinline', '.mtbl-group-title-mode, .mtbl-group-title-text, .mtbl-group-title-field', function () {
        _tblRefreshGroupCardTitle($(this).closest('.mtbl-col-group-card'));
    });

    // Section toggle
    panel.on('click.tblinline', '.mcbi-section-hd', function () {
        var sec = $(this).closest('.mcbi-section');
        sec.toggleClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    });

    // Checkbox toggle
    panel.on('change.tblinline', 'input[type="checkbox"]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        // Auto-columns toggle
        if ($(this).hasClass('mtbl-autocols')) {
            panel.find('.mtbl-cols-manual').toggle(!this.checked);
            if (!this.checked) {
                var _af = _mciGetFields(obj);
                if (!_af.length) {
                    var _sRows = _tblGetExecutiveSampleRows();
                    if (_sRows && _sRows.length) _af = _tblGetExecutiveSampleFieldNames();
                }
                var $clist = panel.find('.mtbl-col-list');
                $clist.empty();
                if (_af.length) {
                    _af.forEach(function (f, idx) {
                        $clist.append(_tblColCard({
                            field: f,
                            title: f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' '),
                            visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext'
                        }, idx, _af, _mciGetFontes(obj), _tblGetDashboardFiltersList(), { isOpen: idx === 0 }));
                    });
                }
                _tblInitPanelSortables(panel, obj, fire);
            }
        }
        // Tree toggle
        if ($(this).hasClass('mtbl-tree')) {
            panel.find('.mtbl-tree-opts').toggle(this.checked);
        }
        if ($(this).hasClass('mtbl-rows-enable')) {
            panel.find('.mtbl-rows-config').toggle(this.checked);
        }
        fire();
    });

    // Fonte change
    panel.on('change.tblinline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        _mciOnFonteSelected(fs, obj, panel, function () {
            var newFields = _mciGetFields(obj);
            _tblRefreshFieldSelects(panel, newFields);
            fire();
        });
    });

    // Transform button
    panel.on('click.tblinline', '.mcbi-btn-transform', function () {
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var fonteStamp = obj.fontestamp;
        var fonte = fonteStamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
        var tbl = (fonte && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(fonte) : null;

        if (!currentTC && tbl && typeof MdashTransformBuilder !== 'undefined') {
            currentTC = MdashTransformBuilder.autoConfig(tbl, 'Table');
        }
        if (!currentTC) {
            currentTC = {
                sourceTable: tbl || '',
                mode: 'visual',
                columns: [],
                measures: [],
                filters: [],
                orderBy: [],
                limit: null,
                sqlFree: ''
            };
        }

        _mciOpenTransformModalFor({
            title: 'Transformação — Tabela',
            fonteName: fonte ? (fonte.descricao || fonte.codigo) : '',
            fonte: fonte || null,
            objectType: 'Table',
            modalId: 'mtbl-transform-modal',
            hostId: 'mtbl-transform-modal-host',
            config: currentTC,
            onSave: function (newT) {
                // Atualizar apenas as localizações fundamentais
                obj.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                // Sincronizar a invariante triplicada antes de persistir
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function')
                    realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                var nf = _mciGetFields(obj);
                _tblRefreshFieldSelects(panel, nf);
                fire();
            }
        });
    });

    // Theme buttons
    panel.on('click.tblinline', '.mtbl-theme-btn', function (e) {
        if ($(e.target).hasClass('mtbl-theme-custom-picker') || $(e.target).closest('.mtbl-theme-custom-preview').length) return;
        panel.find('.mtbl-theme-btn').each(function () {
            $(this).removeClass('is-on').css({ 'border-color': 'rgba(0,0,0,.08)', 'background': '#fff' });
        });
        var k = $(this).data('theme');
        var t = _tblResolveTheme(_TABLE_THEMES[k] || _TABLE_THEMES.phcPrimary);
        $(this).addClass('is-on').css({ 'border-color': (k === 'custom' ? '#2563eb' : t.accent), 'background': 'rgba(37,99,235,.06)' });
        if (k === 'custom') {
            var customHex = panel.find('.mtbl-theme-custom-picker').val() || '#2563eb';
            $(this).css({ 'border-color': customHex });
            panel.find('.mtbl-hdrbg-token').val('custom');
            panel.find('.mtbl-hdrbg-custom').val(customHex).show();
            panel.find('.mtbl-accent-token').val('custom');
            panel.find('.mtbl-accent-custom').val(customHex).show();
        } else {
            _tblApplyThemeTokensToPanel(panel, k);
        }
        fire();
    });

    panel.on('change.tblinline', '.mtbl-theme-custom-picker', function (e) {
        e.stopPropagation();
        var hex = $(this).val() || '#2563eb';
        panel.find('.mtbl-theme-btn').removeClass('is-on').css({ 'border-color': 'rgba(0,0,0,.08)', 'background': '#fff' });
        panel.find('.mtbl-theme-custom').addClass('is-on').css({ 'border-color': hex, 'background': 'rgba(37,99,235,.06)' });
        panel.find('.mtbl-theme-custom-hdr').css('background', hex);
        panel.find('.mtbl-theme-custom-acc').css('background', _mdashDarkenHex(hex, 0.14));
        panel.find('.mtbl-hdrbg-token').val('custom');
        panel.find('.mtbl-hdrbg-custom').val(hex).show();
        panel.find('.mtbl-accent-token').val('custom');
        panel.find('.mtbl-accent-custom').val(hex).show();
        fire();
    });

    panel.on('change.tblinline', '.mtbl-color-token', function () {
        var $wrap = $(this).closest('.mtbl-color-token-wrap');
        var isCustom = $(this).val() === 'custom';
        $wrap.find('input[type="color"]').toggle(isCustom);
        if ($(this).hasClass('mtbl-gl-accent-token')) {
            var color = isCustom ? $wrap.find('.mtbl-gl-accent-custom').val() : _tblResolveColorToken($(this).val(), '#64748b');
            var $card = $(this).closest('.mtbl-gl');
            $card.css('border-left-color', color);
            $card.find('.mcbi-sr-badge').css('background', color);
        }
        fire();
    });

    // Inputs change — apenas no 'change' (blur/Enter), NÃO em 'input'/keyup,
    // para evitar refresh constante da tabela enquanto se digita.
    panel.on('change.tblinline', 'select, input[type="text"], input[type="number"], textarea.mtbl-col-expr', function () {
        if ($(this).hasClass('mtbl-color-token') || $(this).hasClass('mtbl-theme-custom-picker')) return;
        if ($(this).hasClass('mtbl-gl-field')) {
            var $card = $(this).closest('.mtbl-gl');
            var idx = $card.parent().find('.mtbl-gl').index($card) + 1;
            $card.find('.mcbi-sr-title').text($(this).val() || ('Nivel ' + idx));
        }
        if ($(this).hasClass('mtbl-gl-accent-custom')) {
            var $cardAccent = $(this).closest('.mtbl-gl');
            var color = _tblResolveColorToken($(this).val(), '#64748b');
            $cardAccent.css('border-left-color', color);
            $cardAccent.find('.mcbi-sr-badge').css('background', color);
        }
        fire();
    });

    panel.on('change.tblinline', 'input[type="color"]:not(.mtbl-theme-custom-picker)', function () {
        fire();
    });

    panel.on('click.tblinline', '.mtbl-add-level', function () {
        var newFields = _mciGetFields(obj);
        if (!newFields.length) newFields = _tblGetExecutiveSampleFieldNames();
        var $list = panel.find('.mtbl-levels');
        $list.find('.mcbi-info').remove();
        var idx = $list.children('.mtbl-gl').length;
        var defaultStyles = idx === 0
            ? { field: newFields[0] || '', bg: '#eef4ff', text: 'phc:primary', accent: 'phc:primary', bullet: 'circle' }
            : { field: newFields[idx] || newFields[0] || '', bg: '#f8fafc', text: '#334155', accent: 'phc:info', bullet: 'diamond' };
        $list.append(_tblGroupLevelRow(defaultStyles, idx, newFields));
        fire();
    });

    panel.on('click.tblinline', '.mtbl-gl .mcbi-sr-hd, .mtbl-gl .mcbi-sr-tog', function (e) {
        if ($(e.target).closest('.mtbl-gl-remove').length) return;
        $(this).closest('.mtbl-gl').toggleClass('is-open');
    });

    panel.on('click.tblinline', '.mtbl-gl-remove', function (e) {
        e.stopPropagation();
        $(this).closest('.mtbl-gl').remove();
        var $levels = panel.find('.mtbl-levels');
        if (!$levels.children('.mtbl-gl').length) {
            $levels.html('<div class="mcbi-info">Nenhum nivel definido. Adicione pelo menos um nivel de agrupamento.</div>');
        }
        panel.find('.mtbl-levels .mtbl-gl').each(function (idx) {
            $(this).attr('data-idx', idx);
            $(this).find('.mcbi-sr-idx').text('N' + (idx + 1));
            if (!$(this).find('.mtbl-gl-field').val()) {
                $(this).find('.mcbi-sr-title').text('Nivel ' + (idx + 1));
            }
        });
        fire();
    });

    // Add column
    panel.on('click.tblinline', '.mtbl-add-col', function () {
        var newFields = _mciGetFields(obj);
        if (!newFields.length) {
            var _sr = _tblGetExecutiveSampleRows();
            if (_sr && _sr.length) newFields = _tblGetExecutiveSampleFieldNames();
        }
        var usedFields = [];
        panel.find('.mtbl-col-field').each(function () { usedFields.push($(this).val()); });
        var nextField = '';
        for (var _fi = 0; _fi < newFields.length; _fi++) {
            if (usedFields.indexOf(newFields[_fi]) === -1) { nextField = newFields[_fi]; break; }
        }
        if (!nextField && newFields.length) nextField = newFields[0];
        var $list = panel.find('.mtbl-col-list');
        $list.find('.mcbi-info').remove();
        var idx = $list.children('.mtbl-col-card, .mtbl-col-group-card').length;
        $list.append(_tblColCard({ field: nextField, title: nextField, visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext' }, idx, newFields, _mciGetFontes(obj), _tblGetDashboardFiltersList(), { isOpen: true }));
        _tblInitPanelSortables(panel, obj, fire);
        fire();
    });

    // Add column group
    panel.on('click.tblinline', '.mtbl-add-group', function () {
        var newFields = _mciGetFields(obj);
        if (!newFields.length) newFields = _tblGetExecutiveSampleFieldNames();
        var $list = panel.find('.mtbl-col-list');
        $list.find('.mcbi-info').remove();
        var idx = $list.children('.mtbl-col-card, .mtbl-col-group-card').length;
        var firstField = newFields.length ? newFields[0] : '';
        $list.append(_tblGroupCard({
            title: 'Novo grupo',
            columns: [{ field: firstField, title: firstField || 'Coluna', visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext' }]
        }, idx, newFields, _mciGetFontes(obj), _tblGetDashboardFiltersList(), { isOpen: true }));
        _tblInitPanelSortables(panel, obj, fire);
        fire();
    });

    // Add column inside a group
    panel.on('click.tblinline', '.mtbl-group-add-col', function () {
        var newFields = _mciGetFields(obj);
        if (!newFields.length) newFields = _tblGetExecutiveSampleFieldNames();
        var usedFields = [];
        panel.find('.mtbl-col-field').each(function () { usedFields.push($(this).val()); });
        var nextField = '';
        for (var _fi = 0; _fi < newFields.length; _fi++) {
            if (usedFields.indexOf(newFields[_fi]) === -1) { nextField = newFields[_fi]; break; }
        }
        if (!nextField && newFields.length) nextField = newFields[0];
        var $groupList = $(this).closest('.mtbl-col-group-card').find('.mtbl-group-col-list').first();
        $groupList.find('.mcbi-info').remove();
        var idx = $groupList.children('.mtbl-col-card').length;
        $groupList.append(_tblColCard({ field: nextField, title: nextField, visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext' }, idx, newFields, _mciGetFontes(obj), _tblGetDashboardFiltersList(), { isOpen: true }));
        _tblInitPanelSortables(panel, obj, fire);
        fire();
    });

    // Remove column
    panel.on('click.tblinline', '.mtbl-col-remove', function () {
        $(this).closest('.mtbl-col-card').remove();
        _tblInitPanelSortables(panel, obj, fire);
        fire();
    });

    // Remove column group
    panel.on('click.tblinline', '.mtbl-group-remove', function () {
        $(this).closest('.mtbl-col-group-card').remove();
        _tblInitPanelSortables(panel, obj, fire);
        fire();
    });

    // Mostrar/esconder painel de opções de link / condicional quando se muda o formatter
    panel.on('change.tblinline', '.mtbl-col-formatter', function () {
        var $card = $(this).closest('.mtbl-col-card');
        var fmt = $(this).val();
        var isLink = (fmt === 'link' || fmt === 'linkButton');
        var isBtn = (fmt === 'linkButton');
        var isConditional = (fmt === 'conditional');
        var isExpression = (fmt === 'expression');
        $card.find('.mtbl-col-link-opts').toggle(isLink);
        $card.find('.mtbl-col-conditional-opts').toggle(isConditional);
        $card.find('.mtbl-col-expression-opts').toggle(isExpression);
        if (isExpression && !$card.find('.mtbl-col-expr').val()) {
            $card.find('.mtbl-col-expr').val(_TABLE_EXPRESSION_SAMPLE);
        }
        $card.find('.mtbl-col-color-wrap').toggle(isBtn);
        var colorKey = $card.find('.mtbl-col-color-sel').val() || 'primary';
        $card.find('.mtbl-col-color-custom').toggle(isBtn && colorKey === 'custom');
        if (isConditional) {
            var field = $card.find('.mtbl-col-field').val() || '';
            var currentJson = $card.find('.mtbl-col-conditional-json').val();
            var parsed = null;
            try { parsed = currentJson ? JSON.parse(currentJson) : null; } catch (e) { parsed = null; }
            if (!parsed || !parsed.rules || !parsed.rules.length) {
                parsed = _tblGetDeltaPercentConditionalTemplate(field);
                $card.find('.mtbl-col-conditional-json').val(JSON.stringify(parsed));
                $card.find('.mtbl-col-conditional-summary').text(_tblConditionalSummary(parsed));
            }
        }
        fire();
    });

    panel.on('change.tblinline', '.mtbl-col-title-mode, .mtbl-group-title-mode', function () {
        var prefix = $(this).hasClass('mtbl-col-title-mode') ? 'mtbl-col-title' : 'mtbl-group-title';
        _tblToggleTitleBindingPanel($(this).closest('.mtbl-title-binding'), prefix);
        if (prefix === 'mtbl-col-title') _tblRefreshColCardTitle($(this).closest('.mtbl-col-card'));
        else _tblRefreshGroupCardTitle($(this).closest('.mtbl-col-group-card'));
        fire();
    });

    panel.on('change.tblinline', '.mtbl-col-title-source-fonte, .mtbl-group-title-source-fonte', function () {
        var prefix = $(this).hasClass('mtbl-col-title-source-fonte') ? 'mtbl-col-title' : 'mtbl-group-title';
        var fonteStamp = $(this).val();
        var fonte = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
        var schemaFields = fonte ? _mciGetFonteSchema(fonte).map(function (s) { return s.field; }).filter(Boolean) : [];
        var $binding = $(this).closest('.mtbl-title-binding');
        $binding.find('.' + prefix + '-source-field').html('<option value="">-- campo --</option>'
            + schemaFields.map(function (fieldName) {
                return '<option value="' + _mciEsc(fieldName) + '">' + _mciEsc(fieldName) + '</option>';
            }).join(''));
        fire();
    });

    panel.on('input.tblinline change.tblinline', '.mtbl-col-title-text, .mtbl-col-title-expr, .mtbl-group-title-text, .mtbl-group-title-expr, .mtbl-col-title-filter, .mtbl-col-title-filter-part, .mtbl-col-title-source-field, .mtbl-group-title-filter, .mtbl-group-title-filter-part, .mtbl-group-title-source-field', function () {
        var $col = $(this).closest('.mtbl-col-card');
        if ($col.length) _tblRefreshColCardTitle($col);
        var $grp = $(this).closest('.mtbl-col-group-card');
        if ($grp.length) _tblRefreshGroupCardTitle($grp);
        fire();
    });

    panel.on('click.tblinline', '.mtbl-col-conditional-template', function (e) {
        e.preventDefault();
        var $card = $(this).closest('.mtbl-col-card');
        var field = $card.find('.mtbl-col-field').val() || 'variacaoAcumulada';
        var tpl = _tblGetDeltaPercentConditionalTemplate(field);
        $card.find('.mtbl-col-conditional-json').val(JSON.stringify(tpl));
        $card.find('.mtbl-col-conditional-summary').text(_tblConditionalSummary(tpl));
        fire();
    });

    panel.on('click.tblinline', '.mtbl-col-conditional-edit', function (e) {
        e.preventDefault();
        var $card = $(this).closest('.mtbl-col-card');
        var field = $card.find('.mtbl-col-field').val() || '';
        var fields = _mciGetFields(obj);
        var conditional = null;
        try {
            conditional = JSON.parse($card.find('.mtbl-col-conditional-json').val() || '{}');
        } catch (err) {
            conditional = _tblGetDeltaPercentConditionalTemplate(field);
        }
        _tblOpenConditionalColumnModal(conditional, field, fields, function (updated) {
            $card.find('.mtbl-col-conditional-json').val(JSON.stringify(updated));
            $card.find('.mtbl-col-conditional-summary').text(_tblConditionalSummary(updated));
            fire();
        });
    });

    // Toggle do color picker custom
    panel.on('change.tblinline', '.mtbl-col-color-sel', function () {
        var $card = $(this).closest('.mtbl-col-card');
        $card.find('.mtbl-col-color-custom').toggle($(this).val() === 'custom');
    });

    // ── Filtros: Ativar/Desativar ──
    panel.on('change.tblinline', '.mtbl-filters-enable', function() {
        var enabled = $(this).is(':checked');
        panel.find('.mtbl-filters-config').toggle(enabled);
        fire();
    });

    // ── Filtros: Adicionar novo filtro ──
    panel.on('click.tblinline', '.mtbl-add-filter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[Table Filters] Adicionar filtro clicado');
        
        // Modificar obj.config diretamente (não a cópia local cfg)
        if (!obj.config) obj.config = {};
        if (!obj.config.filters) obj.config.filters = { enabled: true, activeFilterKey: null, definitions: [] };
        if (!obj.config.filters.definitions) obj.config.filters.definitions = [];
        
        var newFilter = {
            key: 'filtro_' + Date.now(),
            label: 'Novo Filtro',
            type: 'button',
            icon: '',
            badge: { enabled: true, format: '{count}' },
            style: { activeColor: 'phc:primary' },
            conditions: [{ field: null, operator: null, value: null }]
        };
        
        obj.config.filters.definitions.push(newFilter);
        var idx = obj.config.filters.definitions.length - 1;
        
        console.log('[Table Filters] Filtro adicionado, idx:', idx, 'total:', obj.config.filters.definitions.length);
        
        // Adicionar diretamente no DOM sem re-render completo
        var $list = panel.find('.mtbl-filters-list');
        $list.find('.mcbi-info').remove(); // Remove mensagem "Nenhum filtro"
        
        var filterHtml = '<div class="mtbl-filter-item" data-idx="' + idx + '" style="display:flex;align-items:center;gap:6px;padding:6px;background:#f8fafc;border-radius:6px;margin-bottom:4px;">';
        filterHtml += '<span class="glyphicon glyphicon-menu-hamburger mtbl-filter-drag" title="Arrastar para reordenar"></span>';
        filterHtml += '<input type="text" class="form-control input-sm mtbl-filter-label" value="' + (newFilter.label || '') + '" placeholder="Label" style="flex:1;">';
        filterHtml += '<button type="button" class="btn btn-xs btn-default mtbl-filter-edit" title="Editar condições">';
        filterHtml += '<i class="glyphicon glyphicon-cog"></i></button>';
        filterHtml += '<button type="button" class="btn btn-xs btn-danger mtbl-filter-remove" title="Remover">';
        filterHtml += '<i class="glyphicon glyphicon-trash"></i></button>';
        filterHtml += '</div>';
        
        $list.append(filterHtml);
        _tblInitPanelSortables(panel, obj, fire);
        
        console.log('[Table Filters] Item adicionado ao DOM');
        fire();
    });

    // ── Filtros: Atualizar label (só ao sair do campo ou Enter) ──
    panel.on('blur.tblinline', '.mtbl-filter-label', function() {
        var idx = $(this).closest('.mtbl-filter-item').data('idx');
        if (obj.config && obj.config.filters && obj.config.filters.definitions && obj.config.filters.definitions[idx]) {
            obj.config.filters.definitions[idx].label = $(this).val();
            fire();
        }
    });
    
    panel.on('keypress.tblinline', '.mtbl-filter-label', function(e) {
        if (e.which === 13) { // Enter
            e.preventDefault();
            $(this).blur(); // Aciona o blur que já salva
        }
    });

    // ── Filtros: Remover filtro ──
    panel.on('click.tblinline', '.mtbl-filter-remove', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $item = $(this).closest('.mtbl-filter-item');
        var idx = $item.data('idx');
        
        if (obj.config && obj.config.filters && obj.config.filters.definitions) {
            obj.config.filters.definitions.splice(idx, 1);
            
            // Remove do DOM
            $item.remove();
            
            // Re-indexar items restantes
            panel.find('.mtbl-filter-item').each(function(newIdx) {
                $(this).attr('data-idx', newIdx);
            });
            
            // Se não sobrou nenhum filtro, mostrar mensagem
            if (obj.config.filters.definitions.length === 0) {
                panel.find('.mtbl-filters-list').html('<div class="mcbi-info">Nenhum filtro. Clique "Adicionar".</div>');
            }
            _tblInitPanelSortables(panel, obj, fire);
            
            fire();
        }
    });

    // ── Filtros: Editar condições ──
    panel.on('click.tblinline', '.mtbl-filter-edit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var idx = $(this).closest('.mtbl-filter-item').data('idx');
        if (obj.config && obj.config.filters && obj.config.filters.definitions && obj.config.filters.definitions[idx]) {
            _tblOpenFilterConditionsModal(obj.config.filters.definitions[idx], fields, function(updatedFilter) {
                obj.config.filters.definitions[idx] = updatedFilter;
                
                // Atualizar apenas o label no DOM se mudou
                var $item = panel.find('.mtbl-filter-item[data-idx="' + idx + '"]');
                if ($item.length) {
                    $item.find('.mtbl-filter-label').val(updatedFilter.label);
                }
                
                console.log('[Table Filters] Modal salvo, filtro atualizado:', updatedFilter);
                fire();
            });
        }
    });

    _tblInitPanelSortables(panel, obj, fire);
}

// ── Helpers de UI da tabela ──────────────────────────────────────────────────

function _tblFieldOpts(fields, current) {
    var available = (fields || []).slice();
    if (current && available.indexOf(current) === -1) available.unshift(current);
    return '<option value="">-- campo --</option>'
        + available.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (current === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
}

function _tblBulletOpts(current) {
    return [
        ['circle', 'Circulo'],
        ['square', 'Quadrado'],
        ['diamond', 'Losango'],
        ['bar', 'Barra'],
        ['none', 'Sem bullet']
    ].map(function (o) {
        return '<option value="' + o[0] + '"' + (current === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
}

function _tblRowStyleEditor(label, key, cfg) {
    return '<div style="margin-bottom:7px;padding:8px 9px;background:#f8fafc;border:1px solid rgba(0,0,0,.06);border-radius:7px;">'
        + '<div style="font-size:10.5px;font-weight:800;color:#334155;margin-bottom:6px;">' + label + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field" style="margin:0;"><label style="font-size:10px;">Bullet</label><select class="mtbl-row-' + key + '-bullet form-control input-sm">' + _tblBulletOpts(cfg.bullet) + '</select></div>'
        + _tblColorTokenFieldHtml('Cor destaque', 'mtbl-row-' + key + '-accent', cfg.accent, true)
        + '</div>'
        + _tblColorTokenFieldHtml('Fundo', 'mtbl-row-' + key + '-bg', cfg.bg, false)
        + _tblColorTokenFieldHtml('Texto', 'mtbl-row-' + key + '-text', cfg.text, false)
        + '</div>';
}

function _tblGroupLevelRow(level, idx, fields) {
    var title = 'Nivel ' + (idx + 1);
    var field = level && level.field ? level.field : '';
    var badgeColor = _tblResolveColorToken(level && level.accent, '#64748b');
    var isOpen = idx === 0;
    return '<div class="mcbi-sr mtbl-gl' + (isOpen ? ' is-open' : '') + '" data-idx="' + idx + '" style="border-left-color:' + _mciEsc(badgeColor) + ';">'
        + '<div class="mcbi-sr-hd">'
        + '<span class="mcbi-sr-badge" style="background:' + _mciEsc(badgeColor) + '"></span>'
        + '<span class="mcbi-sr-idx">N' + (idx + 1) + '</span>'
        + '<span class="mcbi-sr-title">' + _mciEsc(field || title) + '</span>'
        + '<div class="mcbi-sr-acts">'
        + '<button type="button" class="mcbi-sr-tog" title="Expandir/Colapsar"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,5 8,11 13,5"/></svg></button>'
        + '<button type="button" class="mtbl-gl-remove" title="Remover nível" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#94a3b8;border-radius:7px;cursor:pointer;padding:0;transition:all .15s;"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>'
        + '</div>'
        + '</div>'
        + '<div class="mcbi-sr-body">'
        + '<div class="mcbi-field"><label>Campo</label><select class="mtbl-gl-field form-control input-sm">' + _tblFieldOpts(fields, field) + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Bullet</label><select class="mtbl-gl-bullet form-control input-sm">' + _tblBulletOpts((level && level.bullet) || 'circle') + '</select></div>'
        + _tblColorTokenFieldHtml('Cor destaque', 'mtbl-gl-accent', (level && level.accent) || 'phc:info', true)
        + '</div>'
        + _tblColorTokenFieldHtml('Fundo', 'mtbl-gl-bg', (level && level.bg) || '#f8fafc', false)
        + _tblColorTokenFieldHtml('Texto', 'mtbl-gl-text', (level && level.text) || '#334155', false)
        + '</div>'
        + '</div>';
}

function _tblManualRowCard(item, idx) {
    var kind = item.kind || 'group';
    var level = item.level !== undefined ? item.level : (kind === 'subgroup' ? 1 : 0);
    var position = item.position || 'beforeData';
    return '<div class="mtbl-manual-row-card" data-idx="' + idx + '" style="padding:8px;border:1px solid rgba(0,0,0,.08);border-radius:7px;margin-bottom:5px;background:#fff;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">'
        + '<strong style="font-size:11px;color:#334155;">Linha fixa</strong>'
        + '<button type="button" class="mtbl-manual-row-remove" style="border:none;background:none;color:#ef4444;cursor:pointer;font-size:13px;padding:0 2px;" title="Remover"><i class="glyphicon glyphicon-trash"></i></button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">'
        + '<select class="mtbl-manual-row-kind form-control input-sm">'
        + '<option value="group"' + (kind === 'group' ? ' selected' : '') + '>Grupo</option>'
        + '<option value="subgroup"' + (kind === 'subgroup' ? ' selected' : '') + '>Subgrupo</option>'
        + '<option value="total"' + (kind === 'total' ? ' selected' : '') + '>Totalizador</option>'
        + '</select>'
        + '<select class="mtbl-manual-row-position form-control input-sm">'
        + '<option value="beforeData"' + (position === 'beforeData' ? ' selected' : '') + '>Antes dos dados</option>'
        + '<option value="afterData"' + (position === 'afterData' ? ' selected' : '') + '>Depois dos dados</option>'
        + '</select>'
        + '<input type="text" class="mtbl-manual-row-label form-control input-sm" value="' + _mciEsc(item.label || '') + '" placeholder="Nome a mostrar à esquerda">'
        + '<input type="number" class="mtbl-manual-row-level form-control input-sm" value="' + _mciEsc(level) + '" min="0" max="4" placeholder="Nível">'
        + '</div>'
        + '<div style="font-size:9.5px;color:#64748b;margin-top:5px;">Grupos e subgrupos criam uma linha separadora. Totalizador soma automaticamente as colunas numéricas.</div>'
        + '</div>';
}

function _tblColCard(col, idx, fields, fontes, filters, opts) {
    opts = opts || {};
    var isOpen = opts.isOpen !== undefined ? opts.isOpen : (idx === 0);
    var isConditional = (col.formatter === 'conditional');
    var conditionalCfg = isConditional ? JSON.parse(JSON.stringify(col.conditional || _tblGetDeltaPercentConditionalTemplate(col.field))) : null;
    var isExpression = (col.formatter === 'expression');
    var colExpr = col.expr || (col.formatterParams && col.formatterParams.expr) || _TABLE_EXPRESSION_SAMPLE;
    var isLink = (col.formatter === 'link' || col.formatter === 'linkButton');
    var isBtn = (col.formatter === 'linkButton');
    var fp = col.formatterParams || {};
    var urlExpr = col.urlExpr || fp.urlExpr || '';
    var labelExpr = col.labelExpr || fp.labelExpr || '';
    var linkLabel = col.linkLabel || fp.linkLabel || '';
    var target = col.target || fp.target || '_self';
    var linkColor = col.linkColor || fp.linkColor || 'phc:primary';
    var isCustomColor = linkColor && linkColor.charAt(0) === '#';
    var customColorVal = isCustomColor ? linkColor : '#2563eb';
    var colorKey = isCustomColor ? 'custom' : (linkColor.indexOf('phc:') === 0 ? linkColor.replace('phc:', '') : 'primary');
    var titleSummary = _tblTitleBindingSummary(_tblNormalizeTitleBinding(col));
    var headerLabel = titleSummary || col.field || ('Coluna ' + (idx + 1));
    var PHC_BTN_COLORS = [
        { key: 'primary', label: 'Primary (azul)' },
        { key: 'success', label: 'Success (verde)' },
        { key: 'info', label: 'Info (ciano)' },
        { key: 'warning', label: 'Warning (laranja)' },
        { key: 'danger', label: 'Danger (vermelho)' },
        { key: 'dark', label: 'Dark (preto)' },
        { key: 'custom', label: 'Personalizada\u2026' }
    ];
    return '<div class="mcbi-sr mtbl-col-card' + (isOpen ? ' is-open' : '') + '" data-idx="' + idx + '">'
        + '<div class="mcbi-sr-hd">'
        + '<span class="glyphicon glyphicon-menu-hamburger mtbl-col-drag" title="Arrastar para reordenar"></span>'
        + '<span class="mcbi-sr-title mtbl-col-title-lbl">' + _mciEsc(headerLabel) + '</span>'
        + '<div class="mcbi-sr-acts">'
        + '<button type="button" class="mcbi-sr-tog mtbl-col-tog" title="Expandir/Colapsar">' + _tblSortableChevron() + '</button>'
        + '<button type="button" class="mtbl-col-remove" title="Remover" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#ef4444;border-radius:7px;cursor:pointer;padding:0;"><i class="glyphicon glyphicon-trash" style="font-size:12px;"></i></button>'
        + '</div></div>'
        + '<div class="mcbi-sr-body mtbl-col-body">'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">'
        + '<select class="mtbl-col-field form-control input-sm" style="font-size:10.5px;">'
        + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (col.field === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('')
        + '</select>'
        + '<select class="mtbl-col-align form-control input-sm" style="font-size:10.5px;">'
        + _TABLE_ALIGNS.map(function (a) { return '<option value="' + a.value + '"' + ((col.hozAlign || 'left') === a.value ? ' selected' : '') + '>' + a.label + '</option>'; }).join('')
        + '</select>'
        + '<select class="mtbl-col-formatter form-control input-sm" style="font-size:10.5px;grid-column:1 / -1;">'
        + _TABLE_FORMATTERS.map(function (f) { return '<option value="' + f.value + '"' + ((col.formatter || 'plaintext') === f.value ? ' selected' : '') + '>' + f.label + '</option>'; }).join('')
        + '</select>'
        + _tblTitleBindingEditorHtml(_tblNormalizeTitleBinding(col), 'mtbl-col-title', fontes, filters)
        + '</div>'
        + _tblColorTokenFieldHtml('Cor do cabeçalho da coluna', 'mtbl-col-headercolor', col.headerColor || '', false, true)
        + '<div class="mtbl-col-conditional-opts" style="margin-top:6px;padding:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;display:' + (isConditional ? 'block' : 'none') + ';">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">'
        + '<div style="font-size:10px;font-weight:bold;color:#1e3a8a;">Condicional · <span class="mtbl-col-conditional-summary">' + _mciEsc(_tblConditionalSummary(conditionalCfg)) + '</span></div>'
        + '<button type="button" class="btn btn-xs btn-primary mtbl-col-conditional-edit" style="font-size:10px;"><i class="glyphicon glyphicon-cog"></i> Regras</button>'
        + '</div>'
        + '<button type="button" class="btn btn-xs btn-default mtbl-col-conditional-template" style="width:100%;font-size:10px;margin-bottom:4px;"><i class="glyphicon glyphicon-flash"></i> Template: Variação %</button>'
        + '<input type="hidden" class="mtbl-col-conditional-json" value="' + _mciEsc(JSON.stringify(conditionalCfg || {})) + '">'
        + '<div style="font-size:9.5px;color:#1d4ed8;line-height:1.35;">Regras avaliadas por ordem. Operadores: =, &gt;, &lt;, contains, <strong>like</strong> (% _), expressão JS.</div>'
        + '</div>'
        + '<div class="mtbl-col-expression-opts" style="margin-top:6px;padding:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:5px;display:' + (isExpression ? 'block' : 'none') + ';">'
        + '<div style="font-size:10px;font-weight:bold;color:#166534;margin-bottom:4px;">Expressão JS</div>'
        + '<textarea class="form-control input-sm mtbl-col-expr" rows="4" style="font-family:monospace;font-size:10.5px;resize:vertical;">' + _mciEsc(colExpr) + '</textarea>'
        + _tblExpressionHelpHtml()
        + '</div>'
        + '<div class="mtbl-col-link-opts" style="margin-top:6px;padding:8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:5px;display:' + (isLink ? 'block' : 'none') + ';">'
        + '<div style="font-size:10px;font-weight:bold;color:#9a3412;margin-bottom:6px;">\uD83D\uDD17 Op\u00e7\u00f5es do Link / Bot\u00e3o</div>'
        + '<label style="font-size:10px;color:#7c2d12;display:block;margin-bottom:1px;font-weight:600;">T\u00edtulo do bot\u00e3o</label>'
        + '<input type="text" class="mtbl-col-linklabel form-control input-sm" value="' + _mciEsc(linkLabel) + '" placeholder="Ex: Aprovar" style="font-size:11px;margin-bottom:6px;">'
        + '<label style="font-size:10px;color:#7c2d12;display:block;margin-bottom:1px;font-weight:600;">URL (express\u00e3o JS)</label>'
        + '<input type="text" class="mtbl-col-urlexpr form-control input-sm" value="' + _mciEsc(urlExpr) + '" placeholder="\'~/flow/wwfaform.aspx?oristamp=\' + encodeURIComponent(getStampEncriptado(wwfastamp))" style="font-size:10.5px;margin-bottom:6px;font-family:monospace;">'
        + '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:4px;align-items:end;">'
        + '<div><label style="font-size:10px;color:#7c2d12;display:block;margin-bottom:1px;font-weight:600;">Abrir em</label>'
        + '<select class="mtbl-col-target form-control input-sm" style="font-size:10.5px;">'
        + '<option value="_self"' + (target === '_self' ? ' selected' : '') + '>Mesma janela</option>'
        + '<option value="_blank"' + (target === '_blank' ? ' selected' : '') + '>Nova tab</option>'
        + '</select></div>'
        + '<div class="mtbl-col-color-wrap" style="display:' + (isBtn ? 'block' : 'none') + ';"><label style="font-size:10px;color:#7c2d12;display:block;margin-bottom:1px;font-weight:600;">Cor do bot\u00e3o</label>'
        + '<select class="mtbl-col-color form-control input-sm mtbl-col-color-sel" style="font-size:10.5px;">'
        + PHC_BTN_COLORS.map(function (c) { return '<option value="' + c.key + '"' + (colorKey === c.key ? ' selected' : '') + '>' + c.label + '</option>'; }).join('')
        + '</select></div>'
        + '<input type="color" class="mtbl-col-color-custom" value="' + _mciEsc(_mciColorInputValue(customColorVal)) + '" style="width:34px;height:30px;padding:0;border:1px solid #ccc;border-radius:4px;display:' + (isBtn && colorKey === 'custom' ? '' : 'none') + ';">'
        + '</div>'
        + '<div style="font-size:9.5px;color:#7c2d12;margin-top:6px;line-height:1.3;">Helpers dispon\u00edveis na URL: <code>getStampEncriptado(s)</code>, <code>mdashResolveUrl(p)</code>. Prefixos: <code>~/</code>=raiz da app, <code>../</code>=relativa, <code>/</code>=absoluta.</div>'
        + '</div>'
        + '<div style="display:flex;gap:8px;margin-top:4px;">'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-visible"' + (col.visible !== false ? ' checked' : '') + '> Vis\u00edvel</label>'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-frozen"' + (col.frozen ? ' checked' : '') + '> Congelar</label>'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-filter"' + (col.headerFilter !== false ? ' checked' : '') + '> Filtro</label>'
        + '</div>'
        + _tblColumnCellStyleEditorHtml(col.cellStyle)
        + '</div></div>';
}

function _tblGroupCard(group, idx, fields, fontes, filters, opts) {
    opts = opts || {};
    var isOpen = opts.isOpen !== undefined ? opts.isOpen : false;
    var columns = Array.isArray(group.columns) ? group.columns : [];
    var groupTitle = _tblTitleBindingSummary(_tblNormalizeTitleBinding(group)) || 'Grupo';
    var html = '<div class="mcbi-sr mtbl-col-group-card' + (isOpen ? ' is-open' : '') + '" data-idx="' + idx + '" style="border-left:3px solid #d40032;">'
        + '<div class="mcbi-sr-hd">'
        + '<span class="glyphicon glyphicon-menu-hamburger mtbl-group-drag" title="Arrastar para reordenar"></span>'
        + '<span class="glyphicon glyphicon-folder-open" style="color:#d40032;font-size:11px;flex-shrink:0;"></span>'
        + '<span class="mcbi-sr-title mtbl-group-title-lbl">' + _mciEsc(groupTitle) + '</span>'
        + '<div class="mcbi-sr-acts">'
        + '<button type="button" class="mcbi-sr-tog mtbl-group-tog" title="Expandir/Colapsar">' + _tblSortableChevron() + '</button>'
        + '<button type="button" class="mtbl-group-remove" title="Remover grupo" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#ef4444;border-radius:7px;cursor:pointer;padding:0;"><i class="glyphicon glyphicon-trash" style="font-size:12px;"></i></button>'
        + '</div></div>'
        + '<div class="mcbi-sr-body">'
        + '<div class="mcbi-field">'
        + _tblTitleBindingEditorHtml(_tblNormalizeTitleBinding(group), 'mtbl-group-title', fontes, filters)
        + '</div>'
        + _tblColorTokenFieldHtml('Cor do cabeçalho do grupo', 'mtbl-group-headercolor', group.headerColor || '', false, true)
        + '<div class="mtbl-group-col-list">';
    if (columns.length) {
        columns.forEach(function (col, colIdx) {
            html += _tblColCard(col, colIdx, fields, fontes, filters, { isOpen: colIdx === 0 });
        });
    } else {
        html += '<div class="mcbi-info" style="margin:2px 0 5px;">Adicione as subcolunas deste grupo.</div>';
    }
    html += '</div>'
        + '<button type="button" class="btn btn-xs btn-default mtbl-group-add-col" style="margin-top:5px;width:100%;"><i class="glyphicon glyphicon-plus"></i> Adicionar coluna ao grupo</button>'
        + '</div></div>';
    return html;
}

function _tblRefreshFieldSelects(panel, fields) {
    panel.find('.mtbl-col-field, .mtbl-tree-parent, .mtbl-tree-child, .mtbl-row-bg-field, .mtbl-row-text-field, .mtbl-row-accent-field, .mtbl-gl-field').each(function () {
        var cur = $(this).val();
        $(this).html(_tblFieldOpts(fields, cur));
    });
}

// ── Modal de Edição de Condições de Filtro ──────────────────────────────────
function _tblOpenFilterConditionsModal(filterDef, fields, onSave) {
    var modalId = 'mtbl-filter-conditions-modal';
    $('#' + modalId).remove();
    
    // Paleta de cores PHC
    var PHC_COLORS = [
        { key: 'primary', name: 'Primary', phcType: 'primary' },
        { key: 'success', name: 'Success', phcType: 'success' },
        { key: 'info', name: 'Info', phcType: 'info' },
        { key: 'warning', name: 'Warning', phcType: 'warning' },
        { key: 'danger', name: 'Danger', phcType: 'danger' },
        { key: 'custom', name: 'Personalizada', custom: true }
    ];
    
    // Resolver cor atual (phc:tipo ou custom)
    var currentColorKey = 'primary'; // padrão
    var currentCustomColor = '#2563eb';
    if (filterDef.style && filterDef.style.activeColor) {
        var ac = filterDef.style.activeColor;
        if (ac.indexOf('phc:') === 0) {
            currentColorKey = ac.replace('phc:', '');
        } else {
            currentColorKey = 'custom';
            currentCustomColor = ac;
        }
    }
    
    var operators = [
        { value: 'eq', label: 'Igual (=)' },
        { value: 'neq', label: 'Diferente (≠)' },
        { value: 'gt', label: 'Maior (>)' },
        { value: 'gte', label: 'Maior ou igual (≥)' },
        { value: 'lt', label: 'Menor (<)' },
        { value: 'lte', label: 'Menor ou igual (≤)' },
        { value: 'contains', label: 'Contém' },
        { value: 'like', label: 'Like (% _)' },
        { value: 'startsWith', label: 'Começa com' },
        { value: 'endsWith', label: 'Termina com' },
        { value: 'in', label: 'Em lista' },
        { value: 'dateEq', label: 'Data igual' },
        { value: 'dateGt', label: 'Data posterior' },
        { value: 'dateLt', label: 'Data anterior' },
        { value: 'dateBetween', label: 'Entre datas' },
        { value: 'isNull', label: 'É nulo' },
        { value: 'isNotNull', label: 'Não é nulo' }
    ];
    
    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1">'
        + '<div class="modal-dialog" style="width:700px;">'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '<button type="button" class="close" data-dismiss="modal">&times;</button>'
        + '<h4 class="modal-title"><i class="glyphicon glyphicon-cog"></i> Editar Filtro: ' + _mciEsc(filterDef.label) + '</h4>'
        + '</div>'
        + '<div class="modal-body">'
        + '<div class="form-group">'
        + '<label>Ícone (classe glyphicon)</label>'
        + '<input type="text" class="form-control mtbl-fc-icon" value="' + _mciEsc(filterDef.icon || '') + '" placeholder="glyphicon-tag">'
        + '</div>'
        + '<div class="form-group">'
        + '<label>Tipo</label>'
        + '<select class="form-control mtbl-fc-type">'
        + '<option value="button"' + (filterDef.type === 'button' ? ' selected' : '') + '>Botão</option>'
        + '<option value="dropdown"' + (filterDef.type === 'dropdown' ? ' selected' : '') + '>Dropdown</option>'
        + '<option value="search"' + (filterDef.type === 'search' ? ' selected' : '') + '>Pesquisa</option>'
        + '</select>'
        + '</div>'
        + '<div class="form-group">'
        + '<label><input type="checkbox" class="mtbl-fc-badge-enable"' + (filterDef.badge && filterDef.badge.enabled ? ' checked' : '') + '> Mostrar contador (badge)</label>'
        + '<input type="text" class="form-control mtbl-fc-badge-format" value="' + _mciEsc((filterDef.badge && filterDef.badge.format) || '{count}') + '" placeholder="{count}" style="margin-top:4px;">'
        + '</div>'
        + '<div class="form-group">'
        + '<label>Cor do Filtro</label>'
        + '<div class="mtbl-fc-color-palettes" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">'
        + PHC_COLORS.map(function(pc) {
            var isActive = currentColorKey === pc.key;
            var btnStyle = 'display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border:2px solid;border-radius:8px;background:#fff;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.2s;';
            if (isActive) {
                btnStyle += 'border-color:var(--md-primary,#2563eb);background:rgba(37,99,235,0.04);';
            } else {
                btnStyle += 'border-color:#e2e8f0;';
            }
            var swatchStyle = 'width:16px;height:16px;border-radius:4px;';
            if (!pc.custom) {
                var phcColor = (typeof getCachedColor === 'function' && getCachedColor(pc.phcType)) ? getCachedColor(pc.phcType).background : '#2563eb';
                swatchStyle += 'background:' + phcColor + ';';
            } else {
                swatchStyle += 'background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);';
            }
            return '<button type="button" class="mtbl-fc-color-btn' + (isActive ? ' is-active' : '') + '" data-color-key="' + pc.key + '" style="' + btnStyle + '">'
                + '<span style="' + swatchStyle + '"></span>'
                + '<span>' + pc.name + '</span>'
                + '</button>';
        }).join('')
        + '</div>'
        + '<div class="mtbl-fc-custom-color-panel" style="' + (currentColorKey === 'custom' ? '' : 'display:none;') + 'padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:8px;">'
        + '<label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#475569;display:block;margin-bottom:8px;">Cor personalizada</label>'
        + '<input type="color" class="form-control mtbl-fc-color-custom" value="' + _mciEsc(_mciColorInputValue(currentCustomColor)) + '" style="width:100%;height:40px;padding:4px;">'
        + '</div>'
        + '<div style="margin-top:12px;">'
        + '<label style="font-size:11px;color:#64748b;margin-bottom:4px;">Classe CSS adicional (opcional)</label>'
        + '<input type="text" class="form-control input-sm mtbl-fc-custom-class" value="' + _mciEsc((filterDef.style && filterDef.style.customClass) || '') + '" placeholder="ex: filtro-urgente filtro-vermelho">'
        + '</div>'
        + '<div style="margin-top:8px;">'
        + '<label style="font-size:11px;color:#64748b;margin-bottom:4px;">Estilos CSS inline (opcional)</label>'
        + '<input type="text" class="form-control input-sm mtbl-fc-custom-style" value="' + _mciEsc((filterDef.style && filterDef.style.customStyle) || '') + '" placeholder="ex: font-weight:bold; text-transform:uppercase;">'
        + '<small class="text-muted" style="display:block;font-size:10px;margin-top:2px;">Estilos CSS adicionais separados por ;</small>'
        + '</div>'
        + '</div>'
        + '<hr>'
        + '<label><strong>Condições</strong></label>'
        + '<div class="mtbl-fc-conditions"></div>'
        + '<button type="button" class="btn btn-sm btn-default mtbl-fc-add-condition"><i class="glyphicon glyphicon-plus"></i> Adicionar Condição</button>'
        + '</div>'
        + '<div class="modal-footer">'
        + '<button type="button" class="btn btn-primary mtbl-fc-save">Guardar</button>'
        + '<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>'
        + '</div>'
        + '</div></div></div>';
    
    $('body').append(mHtml);
    var $modal = $('#' + modalId);
    
    // ── Toggle color palette ──
    $modal.on('click', '.mtbl-fc-color-btn', function() {
        var $btn = $(this);
        var colorKey = $btn.data('color-key');
        
        // Update button states
        $modal.find('.mtbl-fc-color-btn').removeClass('is-active').css({
            'border-color': '#e2e8f0',
            'background': '#fff'
        });
        $btn.addClass('is-active').css({
            'border-color': 'var(--md-primary,#2563eb)',
            'background': 'rgba(37,99,235,0.04)'
        });
        
        // Show/hide custom color panel
        if (colorKey === 'custom') {
            $modal.find('.mtbl-fc-custom-color-panel').slideDown(200);
        } else {
            $modal.find('.mtbl-fc-custom-color-panel').slideUp(200);
        }
    });
    
    // Toggle custom input visibility based on preset selection
    $modal.on('change', '.mtbl-fc-value-preset', function() {
        var $preset = $(this);
        var $custom = $preset.siblings('.mtbl-fc-value-custom');
        if ($preset.val() === 'CUSTOM') {
            $custom.show().focus();
        } else {
            $custom.hide().val('');
        }
    });
    
    // Render conditions
    function renderCondition(cond, idx) {
        // Valores pré-definidos (constantes de data + personalizado)
        var presetValues = [
            { value: 'CUSTOM', label: '🔧 Personalizado' },
            { value: 'TODAY', label: '📅 Hoje' },
            { value: 'YESTERDAY', label: '📅 Ontem' },
            { value: 'WEEK_START', label: '📅 Início da Semana' },
            { value: 'WEEK_END', label: '📅 Fim da Semana' },
            { value: 'LAST_7_DAYS', label: '📅 Últimos 7 Dias' },
            { value: 'LAST_30_DAYS', label: '📅 Últimos 30 Dias' }
        ];
        
        // Detectar se valor atual é preset ou custom
        var currentValue = cond.value || '';
        var isPreset = presetValues.some(function(p) { return p.value === currentValue && p.value !== 'CUSTOM'; });
        var selectedPreset = isPreset ? currentValue : 'CUSTOM';
        var customValue = isPreset ? '' : currentValue;
        
        var html = '<div class="mtbl-fc-cond" data-idx="' + idx + '" style="display:grid;grid-template-columns:1fr 1fr 2fr auto auto;gap:4px;margin-bottom:6px;padding:8px;background:#f8fafc;border-radius:6px;">';
        
        // Campo
        html += '<select class="form-control input-sm mtbl-fc-field">';
        html += '<option value="">-- sem filtro --</option>';
        fields.forEach(function(f) {
            html += '<option value="' + _mciEsc(f) + '"' + (cond.field === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
        });
        html += '</select>';
        
        // Operador
        html += '<select class="form-control input-sm mtbl-fc-operator">';
        operators.forEach(function(op) {
            html += '<option value="' + op.value + '"' + (cond.operator === op.value ? ' selected' : '') + '>' + op.label + '</option>';
        });
        html += '</select>';
        
        // Valor: Dropdown + Input Personalizado
        html += '<div style="display:flex;gap:4px;">';
        html += '<select class="form-control input-sm mtbl-fc-value-preset" style="flex:0 0 180px;">';
        presetValues.forEach(function(p) {
            html += '<option value="' + p.value + '"' + (selectedPreset === p.value ? ' selected' : '') + '>' + p.label + '</option>';
        });
        html += '</select>';
        html += '<input type="text" class="form-control input-sm mtbl-fc-value-custom" value="' + _mciEsc(customValue) + '" placeholder="Número ou expressão JS (ex: row.quantidade)" style="flex:1;' + (isPreset ? 'display:none;' : '') + '">';
        html += '</div>';
        
        // Lógica
        html += '<select class="form-control input-sm mtbl-fc-logic" style="width:70px;">';
        html += '<option value="AND"' + (cond.logic === 'AND' ? ' selected' : '') + '>AND</option>';
        html += '<option value="OR"' + (cond.logic === 'OR' ? ' selected' : '') + '>OR</option>';
        html += '</select>';
        
        // Remover
        html += '<button type="button" class="btn btn-xs btn-danger mtbl-fc-remove-cond"><i class="glyphicon glyphicon-trash"></i></button>';
        html += '</div>';
        return html;
    }
    
    function renderConditions() {
        var conditions = filterDef.conditions || [{ field: null, operator: null, value: null, logic: 'AND' }];
        var html = '';
        conditions.forEach(function(cond, idx) {
            html += renderCondition(cond, idx);
        });
        $modal.find('.mtbl-fc-conditions').html(html);
    }
    
    renderConditions();
    
    // Add condition
    $modal.on('click', '.mtbl-fc-add-condition', function() {
        if (!filterDef.conditions) filterDef.conditions = [];
        filterDef.conditions.push({ field: null, operator: 'eq', value: '', logic: 'AND' });
        renderConditions();
    });
    
    // Remove condition
    $modal.on('click', '.mtbl-fc-remove-cond', function() {
        var idx = $(this).closest('.mtbl-fc-cond').data('idx');
        filterDef.conditions.splice(idx, 1);
        if (filterDef.conditions.length === 0) {
            filterDef.conditions = [{ field: null, operator: null, value: null, logic: 'AND' }];
        }
        renderConditions();
    });
    
    // Save
    $modal.on('click', '.mtbl-fc-save', function() {
        filterDef.icon = $modal.find('.mtbl-fc-icon').val();
        filterDef.type = $modal.find('.mtbl-fc-type').val();
        filterDef.badge = {
            enabled: $modal.find('.mtbl-fc-badge-enable').is(':checked'),
            format: $modal.find('.mtbl-fc-badge-format').val()
        };
        
        // Ler cor selecionada
        var selectedColorKey = $modal.find('.mtbl-fc-color-btn.is-active').data('color-key') || 'primary';
        var activeColor;
        if (selectedColorKey === 'custom') {
            activeColor = $modal.find('.mtbl-fc-color-custom').val();
        } else {
            activeColor = 'phc:' + selectedColorKey;
        }
        
        var customClass = $modal.find('.mtbl-fc-custom-class').val();
        var customStyle = $modal.find('.mtbl-fc-custom-style').val();
        
        filterDef.style = {};
        if (activeColor) filterDef.style.activeColor = activeColor;
        if (customClass) filterDef.style.customClass = customClass;
        if (customStyle) filterDef.style.customStyle = customStyle;
        
        filterDef.conditions = [];
        $modal.find('.mtbl-fc-cond').each(function() {
            var $cond = $(this);
            var preset = $cond.find('.mtbl-fc-value-preset').val();
            var customVal = $cond.find('.mtbl-fc-value-custom').val();
            var finalValue = (preset === 'CUSTOM') ? customVal : preset;
            
            filterDef.conditions.push({
                field: $cond.find('.mtbl-fc-field').val() || null,
                operator: $cond.find('.mtbl-fc-operator').val() || null,
                value: finalValue || null,
                logic: $cond.find('.mtbl-fc-logic').val()
            });
        });
        
        console.log('[Table Filters] Modal salvo. FilterDef:', filterDef);
        
        $modal.modal('hide');
        if (onSave) onSave(filterDef);
    });
    
    $modal.on('hidden.bs.modal', function() { $(this).remove(); });
    $modal.modal('show');
}

function _tblCloneConditionalConfig(cfg) {
    try { return JSON.parse(JSON.stringify(cfg || {})); } catch (e) { return {}; }
}

function _tblRenderConditionalWhenRow(cond, idx, fields) {
    var html = '<div class="mtbl-cc-cond" data-idx="' + idx + '" style="display:grid;grid-template-columns:1fr 1fr 1.4fr auto auto;gap:4px;margin-bottom:4px;align-items:center;">';
    html += '<select class="form-control input-sm mtbl-cc-cond-field">';
    html += '<option value="">-- campo --</option>';
    fields.forEach(function (f) {
        html += '<option value="' + _mciEsc(f) + '"' + (cond.field === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
    });
    html += '</select>';
    html += '<select class="form-control input-sm mtbl-cc-cond-operator">';
    _TABLE_CONDITION_OPERATORS.forEach(function (op) {
        html += '<option value="' + op.value + '"' + (cond.operator === op.value ? ' selected' : '') + '>' + op.label + '</option>';
    });
    html += '</select>';
    html += '<input type="text" class="form-control input-sm mtbl-cc-cond-value" value="' + _mciEsc(cond.value == null ? '' : cond.value) + '" placeholder="Valor ou %FAT%">';
    html += '<select class="form-control input-sm mtbl-cc-cond-logic" style="width:64px;">';
    html += '<option value="AND"' + ((cond.logic || 'AND') === 'AND' ? ' selected' : '') + '>AND</option>';
    html += '<option value="OR"' + (cond.logic === 'OR' ? ' selected' : '') + '>OR</option>';
    html += '</select>';
    html += '<button type="button" class="btn btn-xs btn-danger mtbl-cc-cond-remove"><i class="glyphicon glyphicon-trash"></i></button>';
    html += '</div>';
    return html;
}

function _tblRenderConditionalThenFields(then, fields) {
    then = _tblNormalizeThenClause(then);
    var format = then.format || 'plaintext';
    var html = '<div class="mcbi-field" style="margin-top:6px;"><label style="font-size:10px;">Formato</label>';
    html += '<select class="form-control input-sm mtbl-cc-then-format">';
    _tblGetTableColumnFormatOptions().forEach(function (opt) {
        html += '<option value="' + opt.value + '"' + (format === opt.value ? ' selected' : '') + '>' + opt.label + '</option>';
    });
    html += '</select></div>';
    html += '<div class="mtbl-cc-then-variant-wrap" style="margin-top:4px;' + (_tblFormatNeedsVariant(format) ? '' : 'display:none;') + '">';
    html += '<div class="mcbi-row2">';
    html += '<div class="mcbi-field"><label style="font-size:10px;">Variante</label><select class="form-control input-sm mtbl-cc-then-variant">';
    html += ['positive', 'negative', 'neutral', 'success', 'danger'].map(function (v) {
        return '<option value="' + v + '"' + ((then.variant || 'positive') === v ? ' selected' : '') + '>' + v + '</option>';
    }).join('');
    html += '</select></div>';
    html += '<div class="mcbi-field"><label style="font-size:10px;">Texto fixo</label>';
    html += '<input type="text" class="form-control input-sm mtbl-cc-then-text" value="' + _mciEsc(then.text || '') + '" placeholder="statusBadge">';
    html += '</div></div></div>';
    html += '<div class="mtbl-cc-then-expr-wrap" style="margin-top:4px;' + (format === 'expression' ? '' : 'display:none;') + '">';
    html += '<textarea class="form-control input-sm mtbl-cc-then-expr" rows="3" style="font-family:monospace;font-size:11px;" placeholder="' + _mciEsc(_TABLE_EXPRESSION_SAMPLE) + '">' + _mciEsc(then.expr || _TABLE_EXPRESSION_SAMPLE) + '</textarea>';
    html += _tblExpressionHelpHtml();
    html += '</div>';
    return html;
}

function _tblToggleConditionalThenPanels($rule) {
    var format = $rule.find('.mtbl-cc-then-format').val() || 'plaintext';
    $rule.find('.mtbl-cc-then-variant-wrap').toggle(_tblFormatNeedsVariant(format));
    $rule.find('.mtbl-cc-then-expr-wrap').toggle(format === 'expression');
}

function _tblRenderConditionalRuleCard(rule, idx, fields, options) {
    options = options || {};
    rule = rule || {};
    var when = _tblNormalizeWhenClause(rule.when);
    var then = _tblNormalizeThenClause(rule.then);
    var whenMode = when.mode === 'expression' ? 'expression' : 'simple';
    var conditions = when.conditions || [{ field: '', operator: 'eq', value: '', logic: 'AND' }];
    var condHtml = '';
    conditions.forEach(function (cond, cIdx) {
        condHtml += _tblRenderConditionalWhenRow(cond, cIdx, fields);
    });
    var html = '<div class="mtbl-cc-rule" data-idx="' + idx + '" style="border:1px solid #dbeafe;border-radius:8px;padding:8px;margin-bottom:8px;background:#fff;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">';
    html += '<strong style="font-size:11px;color:#1e3a8a;">Regra ' + (idx + 1) + '</strong>';
    html += '<button type="button" class="btn btn-xs btn-danger mtbl-cc-rule-remove"><i class="glyphicon glyphicon-trash"></i></button>';
    html += '</div>';
    html += '<div class="mcbi-field" style="margin-bottom:6px;"><label style="font-size:10px;">Quando</label>';
    html += '<select class="form-control input-sm mtbl-cc-when-mode">';
    html += '<option value="simple"' + (whenMode === 'simple' ? ' selected' : '') + '>Condições simples</option>';
    html += '<option value="expression"' + (whenMode === 'expression' ? ' selected' : '') + '>Expressão JS</option>';
    html += '</select></div>';
    html += '<div class="mtbl-cc-when-simple"' + (whenMode === 'simple' ? '' : ' style="display:none;"') + '>';
    html += '<div class="mtbl-cc-conditions">' + condHtml + '</div>';
    html += '<button type="button" class="btn btn-xs btn-default mtbl-cc-add-cond"><i class="glyphicon glyphicon-plus"></i> Condição</button>';
    html += '</div>';
    html += '<div class="mtbl-cc-when-expression"' + (whenMode === 'expression' ? '' : ' style="display:none;"') + '>';
    html += '<textarea class="form-control input-sm mtbl-cc-when-expr" rows="2" style="font-family:monospace;font-size:11px;" placeholder="row.variacaoAcumulada > 0">' + _mciEsc(when.expr || '') + '</textarea>';
    html += _tblExpressionHelpHtml();
    html += '</div>';
    html += '<div style="font-size:10px;font-weight:700;color:#1e3a8a;margin:8px 0 4px;">Então</div>';
    html += _tblRenderConditionalThenFields(then, fields);
    if (options.badgeMode && typeof _mbadgeRenderThenAppearanceBlock === 'function') {
        html += _mbadgeRenderThenAppearanceBlock(then);
    }
    html += '</div>';
    return html;
}

function _tblReadConditionalRuleFromCard($rule, options) {
    options = options || {};
    var whenMode = $rule.find('.mtbl-cc-when-mode').val() || 'simple';
    var when = whenMode === 'expression'
        ? { mode: 'expression', expr: ($rule.find('.mtbl-cc-when-expr').val() || '').trim() }
        : { mode: 'simple', conditions: [] };
    if (whenMode === 'simple') {
        $rule.find('.mtbl-cc-cond').each(function () {
            var $c = $(this);
            when.conditions.push({
                field: $c.find('.mtbl-cc-cond-field').val() || '',
                operator: $c.find('.mtbl-cc-cond-operator').val() || 'eq',
                value: $c.find('.mtbl-cc-cond-value').val(),
                logic: $c.find('.mtbl-cc-cond-logic').val() || 'AND'
            });
        });
    }
    var format = $rule.find('.mtbl-cc-then-format').val() || 'plaintext';
    var then = { format: format };
    if (_tblFormatNeedsVariant(format)) {
        then.variant = $rule.find('.mtbl-cc-then-variant').val() || 'neutral';
        var txt = ($rule.find('.mtbl-cc-then-text').val() || '').trim();
        if (txt) then.text = txt;
        if (format === 'deltaPercentBadge' || format === 'deltaBadge') then.precision = 1;
    }
    if (format === 'expression') {
        then.expr = ($rule.find('.mtbl-cc-then-expr').val() || _TABLE_EXPRESSION_SAMPLE).trim();
    }
    if (format === 'percentage') {
        then.precision = 1;
        then.showSign = true;
    }
    if (options.badgeMode && typeof _mbadgeReadThenAppearance === 'function') {
        then.appearance = _mbadgeReadThenAppearance($rule, then.variant || 'neutral');
    }
    return { when: when, then: then };
}

function _tblOpenConditionalColumnModal(conditional, columnField, fields, onSave, options) {
    options = options || {};
    var isBadge = !!options.badgeMode;
    var modalId = 'mtbl-conditional-column-modal';
    $('#' + modalId).remove();
    conditional = _tblCloneConditionalConfig(conditional);
    if (!conditional.valueField) conditional.valueField = columnField || '';
    if (!Array.isArray(conditional.rules)) conditional.rules = [];
    if (!conditional.fallback) conditional.fallback = { format: 'plaintext', variant: 'neutral' };
    conditional.fallback = _tblNormalizeThenClause(conditional.fallback);
    if (isBadge && typeof _mbadgeEnsureRuleAppearance === 'function') {
        conditional = _mbadgeEnsureRuleAppearance(conditional, null);
    }

    var rulesHtml = '';
    if (conditional.rules.length) {
        conditional.rules.forEach(function (rule, idx) {
            rulesHtml += _tblRenderConditionalRuleCard(rule, idx, fields, options);
        });
    } else {
        rulesHtml = '<div class="mcbi-info mtbl-cc-empty">Sem regras. Adicione ou use o template Variação %.</div>';
    }

    var fallbackThenHtml = _tblRenderConditionalThenFields(conditional.fallback, fields).replace(/mtbl-cc-then-/g, 'mtbl-cc-fallback-');
    if (isBadge && typeof _mbadgeRenderThenAppearanceBlock === 'function') {
        fallbackThenHtml += _mbadgeRenderThenAppearanceBlock(conditional.fallback, true);
    }

    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1">'
        + '<div class="modal-dialog modal-lg"><div class="modal-content">'
        + '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>'
        + '<h4 class="modal-title"><i class="glyphicon glyphicon-resize-horizontal"></i> ' + (isBadge ? 'Regras do badge' : 'Coluna condicional') + '</h4></div>'
        + '<div class="modal-body" style="max-height:70vh;overflow:auto;">'
        + (isBadge ? '<div class="mcbi-info" style="margin-bottom:8px;">Cada regra define condição + formato + design do badge quando verdadeira. A primeira correspondência ganha.</div>' : '')
        + '<div class="mcbi-row2" style="margin-bottom:8px;">'
        + '<div class="mcbi-field"><label>Campo valor (sort)</label><select class="form-control input-sm mtbl-cc-value-field">' + _tblFieldOpts(fields, conditional.valueField || columnField) + '</select></div>'
        + '<div class="mcbi-field"><label>Campo display (opcional)</label><select class="form-control input-sm mtbl-cc-display-field">'
        + '<option value="">-- auto --</option>' + fields.map(function (f) {
            return '<option value="' + _mciEsc(f) + '"' + (conditional.displayField === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
        }).join('') + '</select></div></div>'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin:8px 0 6px;">'
        + '<label style="margin:0;font-weight:700;">Regras (primeira correspondência ganha)</label>'
        + '<div><button type="button" class="btn btn-xs btn-default mtbl-cc-template"><i class="glyphicon glyphicon-flash"></i> Template %</button> '
        + '<button type="button" class="btn btn-xs btn-primary mtbl-cc-add-rule"><i class="glyphicon glyphicon-plus"></i> Regra</button></div></div>'
        + '<div class="mtbl-cc-rules">' + rulesHtml + '</div>'
        + '<hr style="margin:12px 0;"><label style="font-weight:700;">Fallback (nenhuma regra)</label>'
        + '<div class="mtbl-cc-fallback-wrap">' + fallbackThenHtml + '</div>'
        + '</div><div class="modal-footer">'
        + '<button type="button" class="btn btn-primary mtbl-cc-save">Guardar</button>'
        + '<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>'
        + '</div></div></div></div>';

    $('body').append(mHtml);
    var $modal = $('#' + modalId);

    function toggleWhenPanels($rule) {
        var wm = $rule.find('.mtbl-cc-when-mode').val();
        $rule.find('.mtbl-cc-when-simple').toggle(wm === 'simple');
        $rule.find('.mtbl-cc-when-expression').toggle(wm === 'expression');
    }

    function toggleFallbackPanels() {
        var format = $modal.find('.mtbl-cc-fallback-format').val() || 'plaintext';
        $modal.find('.mtbl-cc-fallback-variant-wrap').toggle(_tblFormatNeedsVariant(format));
        $modal.find('.mtbl-cc-fallback-expr-wrap').toggle(format === 'expression');
    }

    $modal.on('change', '.mtbl-cc-when-mode', function () {
        toggleWhenPanels($(this).closest('.mtbl-cc-rule'));
    });

    $modal.on('change', '.mtbl-cc-then-format', function () {
        _tblToggleConditionalThenPanels($(this).closest('.mtbl-cc-rule'));
    });

    $modal.on('change', '.mtbl-cc-fallback-format', toggleFallbackPanels);
    toggleFallbackPanels();

    if (isBadge) {
        $modal.on('click', '.mbadge-cc-app-preset', function (e) {
            e.preventDefault();
            var val = $(this).attr('data-value') || '';
            $(this).closest('.mbadge-cc-appearance').find('.mbadge-cc-app-icon').val(val);
        });
        $modal.on('change', '.mtbl-cc-then-variant, .mtbl-cc-fallback-variant', function () {
            var $app = $(this).closest('.mtbl-cc-rule, .mtbl-cc-fallback-wrap').find('.mbadge-cc-appearance').first();
            var v = $(this).val() || 'neutral';
            var $icon = $app.find('.mbadge-cc-app-icon');
            if (!$icon.val()) {
                $icon.val((_mbadgeDefaultThenAppearance(v).icon || ''));
            }
        });
    }

    $modal.on('click', '.mtbl-cc-add-rule', function () {
        $modal.find('.mtbl-cc-empty').remove();
        var idx = $modal.find('.mtbl-cc-rule').length;
        var newThen = { format: 'deltaPercentBadge', variant: 'positive', precision: 1 };
        if (isBadge && typeof _mbadgeDefaultThenAppearance === 'function') {
            newThen.appearance = _mbadgeDefaultThenAppearance('positive');
        }
        $modal.find('.mtbl-cc-rules').append(_tblRenderConditionalRuleCard({
            when: { mode: 'simple', conditions: [{ field: columnField, operator: 'gt', value: '0', logic: 'AND' }] },
            then: newThen
        }, idx, fields, options));
    });

    $modal.on('click', '.mtbl-cc-template', function () {
        var vf = $modal.find('.mtbl-cc-value-field').val() || columnField;
        var tpl = isBadge && typeof _mbadgeGetDeltaPercentConditionalTemplate === 'function'
            ? _mbadgeGetDeltaPercentConditionalTemplate(vf)
            : _tblGetDeltaPercentConditionalTemplate(vf);
        $modal.find('.mtbl-cc-rules').html('');
        tpl.rules.forEach(function (rule, idx) {
            $modal.find('.mtbl-cc-rules').append(_tblRenderConditionalRuleCard(rule, idx, fields, options));
        });
        $modal.find('.mtbl-cc-fallback-format').val(tpl.fallback.format || 'deltaPercentBadge');
        if (isBadge && tpl.fallback && tpl.fallback.variant) {
            $modal.find('.mtbl-cc-fallback-variant').val(tpl.fallback.variant);
        }
        toggleFallbackPanels();
    });

    $modal.on('click', '.mtbl-cc-rule-remove', function () {
        $(this).closest('.mtbl-cc-rule').remove();
    });

    $modal.on('click', '.mtbl-cc-add-cond', function () {
        var $rule = $(this).closest('.mtbl-cc-rule');
        var idx = $rule.find('.mtbl-cc-cond').length;
        $rule.find('.mtbl-cc-conditions').append(_tblRenderConditionalWhenRow({ field: columnField, operator: 'eq', value: '', logic: 'AND' }, idx, fields));
    });

    $modal.on('click', '.mtbl-cc-cond-remove', function () {
        $(this).closest('.mtbl-cc-cond').remove();
    });

    $modal.on('click', '.mtbl-cc-save', function () {
        var out = {
            valueField: $modal.find('.mtbl-cc-value-field').val() || columnField,
            displayField: $modal.find('.mtbl-cc-display-field').val() || '',
            rules: []
        };
        $modal.find('.mtbl-cc-rule').each(function () {
            out.rules.push(_tblReadConditionalRuleFromCard($(this), options));
        });
        var fbFormat = $modal.find('.mtbl-cc-fallback-format').val() || 'plaintext';
        out.fallback = { format: fbFormat };
        if (_tblFormatNeedsVariant(fbFormat)) {
            out.fallback.variant = $modal.find('.mtbl-cc-fallback-variant').val() || 'neutral';
            var fbTxt = ($modal.find('.mtbl-cc-fallback-text').val() || '').trim();
            if (fbTxt) out.fallback.text = fbTxt;
            if (fbFormat === 'deltaPercentBadge' || fbFormat === 'deltaBadge') out.fallback.precision = 1;
        }
        if (fbFormat === 'expression') {
            out.fallback.expr = ($modal.find('.mtbl-cc-fallback-expr').val() || _TABLE_EXPRESSION_SAMPLE).trim();
        }
        if (fbFormat === 'percentage') {
            out.fallback.precision = 1;
            out.fallback.showSign = true;
        }
        if (isBadge && typeof _mbadgeReadThenAppearance === 'function') {
            out.fallback.appearance = _mbadgeReadThenAppearance($modal.find('.mtbl-cc-fallback-wrap'), out.fallback.variant || 'neutral');
        }
        if (isBadge && typeof _mbadgeEnsureRuleAppearance === 'function') {
            out = _mbadgeEnsureRuleAppearance(out, null);
        }
        $modal.modal('hide');
        if (onSave) onSave(out);
    });

    $modal.on('hidden.bs.modal', function () { $(this).remove(); });
    $modal.modal('show');
}

function _tblReadColumnCard($card) {
    var fmt = $card.find('.mtbl-col-formatter').val() || 'plaintext';
    var titleBinding = _tblReadTitleBinding($card, 'mtbl-col-title');
    var colDef = {
        field: $card.find('.mtbl-col-field').val(),
        title: titleBinding.mode === 'text' ? titleBinding.text : (titleBinding.text || $card.find('.mtbl-col-field').val() || ''),
        titleBinding: titleBinding,
        hozAlign: $card.find('.mtbl-col-align').val() || 'left',
        formatter: fmt,
        visible: $card.find('.mtbl-col-visible').is(':checked'),
        frozen: $card.find('.mtbl-col-frozen').is(':checked'),
        headerFilter: $card.find('.mtbl-col-filter').is(':checked'),
        sorter: 'string'
    };
    var colHeaderColor = _tblReadColorTokenField($card, 'mtbl-col-headercolor');
    if (colHeaderColor) colDef.headerColor = colHeaderColor;
    else delete colDef.headerColor;
    if (fmt === 'link' || fmt === 'linkButton') {
        var ue = ($card.find('.mtbl-col-urlexpr').val() || '').trim();
        var ll = ($card.find('.mtbl-col-linklabel').val() || '').trim();
        var tg = $card.find('.mtbl-col-target').val() || '_self';
        if (ue) colDef.urlExpr = ue;
        if (ll) colDef.linkLabel = ll;
        colDef.target = tg;
        if (fmt === 'linkButton') {
            var colorKey = $card.find('.mtbl-col-color-sel').val() || 'primary';
            colDef.linkColor = colorKey === 'custom'
                ? ($card.find('.mtbl-col-color-custom').val() || '#2563eb')
                : 'phc:' + colorKey;
        }
    }
    if (fmt === 'conditional') {
        try {
            colDef.conditional = JSON.parse($card.find('.mtbl-col-conditional-json').val() || '{}');
        } catch (e2) {
            colDef.conditional = _tblGetDeltaPercentConditionalTemplate(colDef.field);
        }
        _tblEnsureColumnConditional(colDef);
        delete colDef.expr;
        delete colDef.semantic;
    }
    if (fmt === 'expression') {
        colDef.expr = ($card.find('.mtbl-col-expr').val() || _TABLE_EXPRESSION_SAMPLE).trim();
        delete colDef.conditional;
        delete colDef.semantic;
        delete colDef.displayField;
    }
    var cellStyle = _tblReadColumnCellStyle($card);
    if (cellStyle) colDef.cellStyle = cellStyle;
    else delete colDef.cellStyle;
    return colDef;
}

// ── Ler config do painel ─────────────────────────────────────────────────────
function _tblReadConfig(panel, obj) {
    var cfg = obj.config || {};

    // Tema (bot\u00e3o activo)
    var activeTheme = panel.find('.mtbl-theme-btn.is-on').data('theme');
    if (activeTheme) cfg.theme = activeTheme;

    // Layout
    cfg.layout = panel.find('.mtbl-layout').val() || 'fitColumns';
    cfg.height = panel.find('.mtbl-height').val() || 'auto';
    cfg.maxHeight = panel.find('.mtbl-maxheight').val() || '500px';

    // Toggles
    cfg.stripedRows = panel.find('.mtbl-striped').is(':checked');
    cfg.hoverHighlight = panel.find('.mtbl-hover').is(':checked');
    cfg.resizableColumns = panel.find('.mtbl-resizable').is(':checked');
    cfg.movableColumns = panel.find('.mtbl-movable').is(':checked');
    cfg.headerFilter = panel.find('.mtbl-headerfilter').is(':checked');

    // Pagina\u00e7\u00e3o
    cfg.pagination = {
        enabled: panel.find('.mtbl-paginate').is(':checked'),
        size: parseInt(panel.find('.mtbl-pagesize').val(), 10) || 15
    };

    // Auto-colunas e colunas manuais
    cfg.autoColumns = panel.find('.mtbl-autocols').is(':checked');
    if (!cfg.autoColumns) {
        cfg.columns = [];
        panel.find('.mtbl-col-list').children('.mtbl-col-card, .mtbl-col-group-card').each(function () {
            var $item = $(this);
            if ($item.hasClass('mtbl-col-group-card')) {
                var groupBinding = _tblReadTitleBinding($item, 'mtbl-group-title');
                var groupHeaderColor = _tblReadColorTokenField($item, 'mtbl-group-headercolor');
                var groupDef = {
                    title: groupBinding.mode === 'text' ? groupBinding.text : (groupBinding.text || 'Grupo'),
                    titleBinding: groupBinding,
                    headerHozAlign: 'center',
                    columns: []
                };
                if (groupHeaderColor) groupDef.headerColor = groupHeaderColor;
                $item.find('.mtbl-group-col-list').first().children('.mtbl-col-card').each(function () {
                    groupDef.columns.push(_tblReadColumnCard($(this)));
                });
                if (groupDef.columns.length) cfg.columns.push(groupDef);
            } else {
                cfg.columns.push(_tblReadColumnCard($item));
            }
        });
    }

    // Hierarquia
    cfg.dataTree = {
        enabled: panel.find('.mtbl-tree').is(':checked'),
        parentField: panel.find('.mtbl-tree-parent').val() || 'id',
        childField: panel.find('.mtbl-tree-child').val() || 'parentId',
        startExpanded: panel.find('.mtbl-tree-expand').is(':checked')
    };

    // Linhas agrupadas e sublinhas
    var existingStructuredRows = (cfg.structuredRows && typeof cfg.structuredRows === 'object') ? cfg.structuredRows : {};
    var collectedLevels = [];
    panel.find('.mtbl-levels .mtbl-gl').each(function () {
        var $level = $(this);
        collectedLevels.push({
            field: $level.find('.mtbl-gl-field').val() || '',
            bullet: $level.find('.mtbl-gl-bullet').val() || 'circle',
            accent: _tblReadColorTokenField($level, 'mtbl-gl-accent'),
            bg: _tblReadColorTokenField($level, 'mtbl-gl-bg'),
            text: _tblReadColorTokenField($level, 'mtbl-gl-text')
        });
    });
    collectedLevels = collectedLevels.filter(function (level) { return level.field; });
    cfg.structuredRows = {
        enabled: panel.find('.mtbl-rows-enable').is(':checked'),
        groupField: collectedLevels[0] ? collectedLevels[0].field : '',
        subgroupField: collectedLevels[1] ? collectedLevels[1].field : '',
        groupLevels: collectedLevels,
        levelStyles: collectedLevels.map(function (level) {
            return {
                bg: level.bg,
                text: level.text,
                accent: level.accent,
                bullet: level.bullet
            };
        }),
        typeField: existingStructuredRows.typeField || '__rowType',
        levelField: existingStructuredRows.levelField || '__rowLevel',
        sectionValue: existingStructuredRows.sectionValue || 'section',
        dataValue: existingStructuredRows.dataValue || 'data',
        totalValue: existingStructuredRows.totalValue || 'total',
        backgroundField: panel.find('.mtbl-row-bg-field').val() || '',
        textColorField: panel.find('.mtbl-row-text-field').val() || '',
        accentColorField: panel.find('.mtbl-row-accent-field').val() || '',
        sectionBg: _tblReadColorTokenField(panel, 'mtbl-row-section-bg'),
        sectionText: _tblReadColorTokenField(panel, 'mtbl-row-section-text'),
        sectionAccent: _tblReadColorTokenField(panel, 'mtbl-row-section-accent'),
        sectionBullet: panel.find('.mtbl-row-section-bullet').val() || 'circle',
        subgroupBg: _tblReadColorTokenField(panel, 'mtbl-row-subgroup-bg'),
        subgroupText: _tblReadColorTokenField(panel, 'mtbl-row-subgroup-text'),
        subgroupAccent: _tblReadColorTokenField(panel, 'mtbl-row-subgroup-accent'),
        subgroupBullet: panel.find('.mtbl-row-subgroup-bullet').val() || 'diamond',
        totalBg: _tblReadColorTokenField(panel, 'mtbl-row-total-bg'),
        totalText: _tblReadColorTokenField(panel, 'mtbl-row-total-text'),
        totalAccent: _tblReadColorTokenField(panel, 'mtbl-row-total-accent'),
        totalBullet: panel.find('.mtbl-row-total-bullet').val() || 'bar'
    };

    cfg.dataRowStyle = {
        background: _tblReadColorTokenField(panel, 'mtbl-drs-bg'),
        textColor: _tblReadColorTokenField(panel, 'mtbl-drs-text'),
        fontSize: parseInt(panel.find('.mtbl-drs-fontsize').val(), 10) || 0,
        fontWeight: panel.find('.mtbl-drs-fontweight').val() || '',
        fontFamily: panel.find('.mtbl-drs-fontfamily').val() || ''
    };

    // Exporta\u00e7\u00e3o
    cfg.exportOptions = {
        enableExcel: panel.find('.mtbl-exp-excel').is(':checked'),
        enablePDF: panel.find('.mtbl-exp-pdf-chk').is(':checked')
    };

    // Estilo
    cfg.styling = {
        headerBg: _tblReadColorTokenField(panel, 'mtbl-hdrbg'),
        headerText: _tblReadColorTokenField(panel, 'mtbl-hdrtext'),
        accentColor: _tblReadColorTokenField(panel, 'mtbl-accent'),
        rowEven: _tblReadColorTokenField(panel, 'mtbl-roweven'),
        rowHover: _tblReadColorTokenField(panel, 'mtbl-rowhover'),
        borderRadius: parseInt(panel.find('.mtbl-radius').val(), 10) || 10,
        fontSize: parseInt(panel.find('.mtbl-fontsize').val(), 10) || 13,
        headerFontSize: parseInt(panel.find('.mtbl-hdrfontsize').val(), 10) || 0
    };

    // Filtros - Preservar definitions de obj.config (modificado pelos event handlers)
    // e apenas atualizar enabled + labels do DOM
    if (!cfg.filters) {
        // Se não existir em cfg, tentar ler de obj.config (pode ter sido modificado pelos event handlers)
        if (obj.config && obj.config.filters && obj.config.filters.definitions) {
            cfg.filters = JSON.parse(JSON.stringify(obj.config.filters)); // Copiar de obj.config
        } else {
            cfg.filters = { enabled: false, activeFilterKey: null, definitions: [] };
        }
    } else if (!cfg.filters.definitions) {
        // Se cfg.filters existe mas definitions não, tentar de obj.config
        if (obj.config && obj.config.filters && obj.config.filters.definitions) {
            cfg.filters.definitions = JSON.parse(JSON.stringify(obj.config.filters.definitions));
        } else {
            cfg.filters.definitions = [];
        }
    }
    
    cfg.filters.enabled = panel.find('.mtbl-filters-enable').is(':checked');
    
    // Atualizar labels dos filtros (condições já foram atualizadas via modal)
    panel.find('.mtbl-filter-item').each(function() {
        var idx = $(this).data('idx');
        if (cfg.filters.definitions && cfg.filters.definitions[idx]) {
            cfg.filters.definitions[idx].label = $(this).find('.mtbl-filter-label').val();
        }
    });

    console.log('[Table Filters] Config lida do painel:', cfg.filters);
    console.log('[Table Filters] obj.config.filters antes de salvar:', obj.config ? obj.config.filters : 'obj.config undefined');

    // Preservar transformConfig de obj.config OU obj.transformConfig (fallback)
    cfg.transformConfig = cfg.transformConfig || obj.transformConfig || null;

    obj.config = cfg;
    obj.transformConfig = cfg.transformConfig;
    
    // NÃO atualizar configjson ou transformconfigjson manualmente!
    // stringifyJSONFields() será chamado no fire() e fará a sincronização completa
    
    console.log('[Table Filters] Config salvo. transformConfig:', obj.transformConfig ? 'PRESENTE' : 'null');
}

// ── Dynamic Schema (legacy compat) ──────────────────────────────────────────
function createDynamicSchemaTable(data) {
    var fieldOptions = [];
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) { fieldOptions.push(key); });
    }
    return {
        type: 'object',
        title: 'Configura\u00e7\u00e3o da Tabela',
        properties: {
            layout: { type: 'string', title: 'Layout', 'enum': ['fitColumns', 'fitData', 'fitDataFill', 'fitDataStretch'], 'default': 'fitColumns' },
            height: { type: 'string', title: 'Altura', 'default': 'auto' },
            columns: {
                type: 'array', title: 'Colunas',
                items: {
                    type: 'object', properties: {
                        field: { type: 'string', title: 'Campo', 'enum': fieldOptions },
                        title: { type: 'string', title: 'T\u00edtulo' },
                        visible: { type: 'boolean', title: 'Vis\u00edvel', 'default': true },
                        formatter: { type: 'string', title: 'Formatador', 'enum': ['plaintext', 'number', 'money', 'percentage', 'date', 'datetime', 'tickCross', 'star', 'progress', 'color', 'link', 'linkButton', 'html', 'expression', 'conditional'] }
                    }
                }
            }
        }
    };
}



// ============================================================================
// MdashChartBuilder
// Motor visual de configuração e renderização de gráficos para Mdash 2.0.
//
// Arquitectura:
//   - 5 temas premium (modern/vibrant/corporate/earth/dark)
//   - 9 tipos de gráfico com ícones SVG
//   - buildEchartsOption(config, rows) → opção ECharts pronta
//   - render(selector, options) → painel de 3 tabs (Dados | Gráfico | Estilo)
//   - readConfig($container) → lê estado actual do painel
// ============================================================================
var MdashChartBuilder = (function () {

    // ── 6 Paletas premium (phclegacy é a 1ª — mais compatível com PHC CS Web) ──
    var THEMES = {
        phclegacy: {
            name: 'PHC / 1.0',
            swatch: ['#d43f3a', '#00897B', '#91c7ae', '#f79523'],
            colors: ['#d43f3a', '#00897B', '#91c7ae', '#f79523'],
            bg: 'transparent', text: '#1E293B', subtext: '#64748B',
            grid: 'rgba(30,41,59,0.07)', axisLine: 'rgba(30,41,59,0.12)',
            tooltipBg: '#1a1a2e', tooltipText: '#FFFFFF'
        },
        modern: {
            name: 'Moderno',
            swatch: ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B'],
            colors: ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'],
            bg: 'transparent', text: '#1E293B', subtext: '#64748B',
            grid: 'rgba(30,41,59,0.07)', axisLine: 'rgba(30,41,59,0.12)',
            tooltipBg: '#0F172A', tooltipText: '#F8FAFC'
        },
        vibrant: {
            name: 'Vibrante',
            swatch: ['#E15759', '#4E79A7', '#F28E2B', '#59A14F'],
            colors: ['#E15759', '#4E79A7', '#F28E2B', '#59A14F', '#76B7B2', '#EDC948', '#B07AA1', '#FF9DA7'],
            bg: 'transparent', text: '#1A1A2E', subtext: '#555568',
            grid: 'rgba(0,0,0,0.06)', axisLine: 'rgba(0,0,0,0.10)',
            tooltipBg: '#1A1A2E', tooltipText: '#FFFFFF'
        },
        corporate: {
            name: 'Corporativo',
            swatch: ['#1A3A6C', '#C8A84B', '#2E5CB8', '#D4A017'],
            colors: ['#1A3A6C', '#C8A84B', '#2E5CB8', '#D4A017', '#4A90D9', '#8E6C30', '#2D7D46', '#6B3A3A'],
            bg: 'transparent', text: '#1A3A6C', subtext: '#5A6A80',
            grid: 'rgba(26,58,108,0.07)', axisLine: 'rgba(26,58,108,0.15)',
            tooltipBg: '#1A3A6C', tooltipText: '#F5E6C8'
        },
        earth: {
            name: 'Terra',
            swatch: ['#B45309', '#6B7C45', '#92400E', '#3F6212'],
            colors: ['#B45309', '#6B7C45', '#92400E', '#3F6212', '#854D0E', '#15803D', '#A16207', '#166534'],
            bg: 'transparent', text: '#292524', subtext: '#78716C',
            grid: 'rgba(41,37,36,0.07)', axisLine: 'rgba(41,37,36,0.12)',
            tooltipBg: '#1C1917', tooltipText: '#FEF3C7'
        },
        dark: {
            name: 'Escuro',
            swatch: ['#60A5FA', '#34D399', '#FBBF24', '#F87171'],
            colors: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB7185', '#38BDF8', '#4ADE80'],
            bg: '#0F172A', text: '#E2E8F0', subtext: '#94A3B8',
            grid: 'rgba(226,232,240,0.08)', axisLine: 'rgba(226,232,240,0.15)',
            tooltipBg: '#1E293B', tooltipText: '#F8FAFC'
        }
    };

    // ── Paletas dedicadas para gráficos de pizza / donut ─────────────────────
    var PIE_PALETTES = [
        { key: 'theme', name: 'Do tema', colors: null },
        { key: 'phclegacy', name: 'PHC / Mdash 1.0', colors: ['#d43f3a', '#00897B', '#91c7ae', '#f79523'] },
        { key: 'pastel', name: 'Pastel', colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D4C5F9', '#FFC2D1', '#B5EAD7'] },
        { key: 'bold', name: 'Forte', colors: ['#E63946', '#457B9D', '#2A9D8F', '#E9C46A', '#F4A261', '#264653', '#A8DADC', '#606C38'] },
        { key: 'warm', name: 'Quente', colors: ['#D62828', '#F77F00', '#FCBF49', '#EAE2B7', '#E76F51', '#E9C46A', '#F4A261', '#CC5803'] },
        { key: 'cool', name: 'Frio', colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#48CAE4', '#023E8A', '#ADE8F4', '#0096C7'] },
        { key: 'custom', name: 'Personalizada', colors: null, custom: true }
    ];

    // ── 9 Tipos com ícones SVG inline ─────────────────────────────────────────
    var CHART_TYPES = [
        { type: 'bar', label: 'Barras', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="8" width="5" height="15" rx="1.5"/><rect x="9.5" y="4" width="5" height="19" rx="1.5"/><rect x="18" y="12" width="5" height="11" rx="1.5"/></svg>' },
        { type: 'bar_h', label: 'Horiz.', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><rect y="1" x="0" height="5" width="15" rx="1.5"/><rect y="9.5" x="0" height="5" width="22" rx="1.5"/><rect y="18" x="0" height="5" width="11" rx="1.5"/></svg>' },
        { type: 'line', label: 'Linha', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,19 6,11 12,15 18,6 23,9"/><circle cx="1" cy="19" r="2.2" fill="currentColor" stroke="none"/><circle cx="6" cy="11" r="2.2" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="2.2" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="2.2" fill="currentColor" stroke="none"/><circle cx="23" cy="9" r="2.2" fill="currentColor" stroke="none"/></svg>' },
        { type: 'area', label: 'Área', svg: '<svg viewBox="0 0 24 24"><path d="M1 22L1 15L6 9L12 13L18 5L23 8L23 22Z" fill="currentColor" opacity=".3"/><polyline points="1,15 6,9 12,13 18,5 23,8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        { type: 'sparkline', label: 'Sparkline', svg: '<svg viewBox="0 0 24 24"><path d="M2 20L4 16L6 13L9 15L12 8L15 11L18 6L22 10L22 22Z" fill="rgba(46,125,50,0.15)" opacity="0.4"/><polyline points="2,20 4,16 6,13 9,15 12,8 15,11 18,6 22,10" fill="none" stroke="#2E7D32" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
        { type: 'donut', label: 'Donut', svg: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="5"/><path d="M12 3A9 9 0 0 1 21 12" stroke="currentColor" stroke-width="5" opacity=".4" stroke-linecap="round"/></svg>' },
        { type: 'pie', label: 'Pizza', svg: '<svg viewBox="0 0 24 24"><path d="M12 12L12 2A10 10 0 0 1 22 12Z" fill="currentColor"/><path d="M12 12L22 12A10 10 0 0 1 6 21Z" fill="currentColor" opacity=".55"/><path d="M12 12L6 21A10 10 0 0 1 2 6Z" fill="currentColor" opacity=".3"/><path d="M12 12L2 6A10 10 0 0 1 12 2Z" fill="currentColor" opacity=".15"/></svg>' },
        { type: 'scatter', label: 'Dispersão', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="17" r="2.2"/><circle cx="9" cy="10" r="2.2"/><circle cx="14" cy="14" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="21" cy="19" r="2.2"/><circle cx="7" cy="21" r="2.2"/></svg>' },
        { type: 'mixed', label: 'Misto', svg: '<svg viewBox="0 0 24 24"><rect x="1" y="11" width="5" height="12" rx="1.5" fill="currentColor" opacity=".85"/><rect x="9.5" y="7" width="5" height="16" rx="1.5" fill="currentColor" opacity=".85"/><rect x="18" y="13" width="5" height="10" rx="1.5" fill="currentColor" opacity=".85"/><polyline points="3.5,7 12,4 20.5,9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3.5" cy="7" r="2.2" fill="currentColor"/><circle cx="12" cy="4" r="2.2" fill="currentColor"/><circle cx="20.5" cy="9" r="2.2" fill="currentColor"/></svg>' },
        { type: 'funnel', label: 'Funil', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3L22 3L16 10L16 21L8 21L8 10Z" rx="1"/></svg>' },
        { type: 'radar', label: 'Radar', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 21,9 17.5,20 6.5,20 3,9"/><line x1="12" y1="2" x2="12" y2="20" opacity=".35"/><line x1="21" y1="9" x2="6.5" y2="20" opacity=".35"/><line x1="17.5" y1="20" x2="3" y2="9" opacity=".35"/><polygon points="12,6 17,10 15,16 9,16 7,10" fill="currentColor" opacity=".22" stroke-width="1.3"/></svg>' }
    ];

    // ── Helpers ───────────────────────────────────────────────────────────────
    function _alpha(hex, a) {
        // Handle rgb(r,g,b) or rgba(r,g,b,a) returned by getColorByType/getCachedColor
        if (typeof hex === 'string' && hex.indexOf('rgb') === 0) {
            var m = hex.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
            if (m) return 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',' + a + ')';
        }
        hex = (hex || '#2563EB').replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    function _esc(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function _resolvePHCColor(c) {
        if (!c) return null;
        if (typeof c === 'string' && c.indexOf('phc:') === 0) {
            var _t = c.replace('phc:', '');
            return (typeof getCachedColor === 'function' && getCachedColor(_t) && getCachedColor(_t).background) || null;
        }
        return c || null;
    }

    // Nome da série como expressão/código JS (multilinha) — tem acesso a `data`
    // (todos os registos da fonte da série) e helpers básicos (Math/Number/
    // String/Date). Compilação em duas fases, igual ao JS_EXPR do Transform
    // Builder (DATA SOURCE Operations.js):
    //   1) tenta como expressão única: with(helpers){return (CÓDIGO);}
    //   2) se isso falhar a compilar (SyntaxError — ex: CÓDIGO tem ifs/statements
    //      soltos com o seu próprio return), tenta como CORPO de função:
    //      with(helpers){CÓDIGO}
    // Se nenhuma das duas compilar, ou se falhar em runtime, usa-se o próprio
    // texto tal como escrito como nome literal — assim o campo continua a
    // funcionar como um simples input de nome para quem não precisar de JS.
    function _evalSeriesName(s, rows) {
        var raw = (s && s.name != null) ? String(s.name) : '';
        var trimmed = raw.trim();
        if (!trimmed) return '';
        var helpers = { Math: Math, Number: Number, String: String, Date: Date, parseFloat: parseFloat, parseInt: parseInt };
        var fn;
        try {
            fn = new Function('data', 'helpers', 'with(helpers){return (' + trimmed + ');}');
        } catch (e) {
            try {
                fn = new Function('data', 'helpers', 'with(helpers){' + trimmed + '}');
            } catch (e2) {
                return raw;
            }
        }
        try {
            var result = fn(rows || [], helpers);
            if (result === null || result === undefined) return raw;
            // Resultado não-primitivo (ex: elementos DOM globais que colidem com o
            // nome da expressão — campos <select>/<input> do PHC tornam-se
            // propriedades globais de window) não é um nome de série válido;
            // usar o texto literal em vez de "[object ...]" .
            var rType = typeof result;
            if (rType === 'object' || rType === 'function') return raw;
            return String(result);
        } catch (e3) {
            return raw;
        }
    }

    function _defaultConfig() {
        return {
            theme: 'phclegacy', chartType: 'bar', height: 320,
            xField: '', series: [{ field: '', name: '', type: 'default', color: 'phc:primary' }],
            stacked: false, smooth: true, gradient: true, borderRadius: 6,
            dataLabels: false, animation: true,
            legend: { show: true, position: 'top' },
            tooltip: { show: true },
            xAxis: { show: true, rotate: 0, name: '' },
            yAxis: { show: true, name: '' },
            title: { text: '', show: false },
            piePalette: 'phclegacy', piePaletteCustom: null,
            transformConfig: null
        };
    }

    // ── ECharts Option Builder — centro do sistema ────────────────────────────
    function buildEchartsOption(cfg, rows) {
        cfg = cfg || {};
        rows = rows || [];
        var t = THEMES[cfg.theme] || THEMES.modern;
        var ct = cfg.chartType || 'bar';
        var base = {
            backgroundColor: t.bg,
            color: t.colors,
            textStyle: { color: t.text, fontFamily: "'Inter','Nunito','Segoe UI',Arial,sans-serif", fontSize: 12 },
            animation: cfg.animation !== false,
            animationDuration: 700,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 300
        };
        if (ct === 'donut' || ct === 'pie') return _buildPieOption(base, cfg, rows, t, ct);
        if (ct === 'funnel') return _buildFunnelOption(base, cfg, rows, t);
        if (ct === 'scatter') return _buildScatterOption(base, cfg, rows, t);
        if (ct === 'sparkline') return _buildSparklineOption(base, cfg, rows, t);
        if (ct === 'bar_h') return _buildBarHOption(base, cfg, rows, t);
        if (ct === 'radar') return _buildRadarOption(base, cfg, rows, t);
        return _buildCartesianOption(base, cfg, rows, t, ct);
    }

    // Mobile-only: alinhado com os breakpoints já usados no dashboard. Em desktop
    // isto devolve false e o comportamento do tooltip fica 100% inalterado.
    function _isMobileViewport() {
        return typeof window !== 'undefined' && window.innerWidth <= 768;
    }

    function _tooltipBase(t, trigger) {
        var base = {
            trigger: trigger || 'axis',
            backgroundColor: t.tooltipBg,
            borderColor: 'transparent',
            padding: [10, 14],
            textStyle: { color: t.tooltipText, fontSize: 12 },
            extraCssText: 'border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.22);',
            // appendToBody: o DOM do tooltip é montado directamente em <body> (position:fixed),
            // escapando do overflow:hidden/auto dos cards/containers do dashboard e sobrepondo-se
            // a qualquer elemento da página — sem isto o tooltip fica cortado quando o gráfico
            // está perto do limite do card. Comportamento de posicionamento nativo do ECharts
            // (segue o rato/toque, sem lógica de confine/flip personalizada).
            appendToBody: true
        };
        // confine: aplicado APENAS em mobile — desloca o tooltip o mínimo
        // necessário para nunca ultrapassar o ecrã no eixo X (horizontal).
        // Em desktop este bloco nem corre, para não alterar nada do
        // comportamento actual nesse display.
        if (_isMobileViewport()) {
            base.confine = true;
        }
        return base;
    }

    function _gridBase(legendPos) {
        return {
            top: legendPos === 'none' ? 16 : (legendPos === 'bottom' ? 16 : 52),
            left: '2%', right: '3%',
            bottom: legendPos === 'bottom' ? 54 : 14,
            containLabel: true
        };
    }

    function _buildCartesianOption(base, cfg, rows, t, ct) {
        var xField = cfg.xField || '';
        var serDefs = (cfg.series || []).filter(function (s) { return s.field; });
        var xData = rows.map(function (r) { return r[xField]; });
        var lPos = (cfg.legend && cfg.legend.show !== false) ? (cfg.legend.position || 'top') : 'none';

        var series = serDefs.map(function (s, i) {
            var sType = (s.serType && s.serType !== 'default') ? s.serType : (ct === 'mixed' ? (i === 0 ? 'bar' : 'line') : ct);
            if (sType === 'area') sType = 'line';
            var baseCol = _resolvePHCColor(s.color) || t.colors[i % t.colors.length];
            var obj = {
                name: _evalSeriesName(s, rows) || s.field,
                type: sType,
                data: rows.map(function (r) { return r[s.field]; }),
                emphasis: { focus: 'series' },
                label: { show: s.dataLabels !== undefined ? s.dataLabels !== false : cfg.dataLabels === true, position: 'top', fontSize: 11, fontWeight: 600, color: s.labelColor || t.text }
            };
            if (sType === 'bar') {
                var useGrad = s.gradient !== undefined ? s.gradient !== false : cfg.gradient !== false;
                var br = s.borderRadius !== undefined ? s.borderRadius : (cfg.borderRadius !== undefined ? cfg.borderRadius : 6);
                obj.itemStyle = {
                    borderRadius: [br, br, 0, 0],
                    color: useGrad ? {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [{ offset: 0, color: baseCol }, { offset: 1, color: _alpha(baseCol, 0.5) }]
                    } : baseCol
                };
                var _stackGrp = s.stack || (cfg.stacked ? 'total' : null);
                if (_stackGrp) obj.stack = _stackGrp;
                if (s.barWidth !== undefined) { obj.barWidth = s.barWidth + '%'; } else { obj.barMaxWidth = 56; }
                obj.barMinHeight = 2;
            }
            if (sType === 'line') {
                var useSmooth = s.smooth !== undefined ? s.smooth !== false : cfg.smooth !== false;
                var lw = s.lineWidth !== undefined ? s.lineWidth : 2.5;
                var lsym = s.symbol || 'circle';
                var lsz = s.lineSymbolSize !== undefined ? s.lineSymbolSize : 7;
                obj.smooth = useSmooth;
                obj.symbolSize = lsz;
                obj.symbol = lsym;
                obj.lineStyle = { width: lw, color: baseCol };
                obj.itemStyle = { color: baseCol, borderColor: '#fff', borderWidth: lsym === 'none' ? 0 : 2 };
                var isArea = ct === 'area' || s.type === 'area' || s.serType === 'area';
                if (isArea) {
                    var aOpacity = s.areaOpacity !== undefined ? s.areaOpacity : 0.32;
                    obj.areaStyle = {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [{ offset: 0, color: _alpha(baseCol, aOpacity) }, { offset: 1, color: _alpha(baseCol, 0.01) }]
                        }
                    };
                }
            }
            return obj;
        });

        return Object.assign({}, base, {
                tooltip: Object.assign(_tooltipBase(t, 'axis'), {
                formatter: function (params) {
                    var out = '<div style="padding:1px 0 5px;font-weight:700;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.12);margin-bottom:5px;">' + (params[0] ? params[0].axisValue : '') + '</div>';
                    params.forEach(function (p) {
                        var col = typeof p.color === 'string' ? p.color : t.colors[0];
                        var dot = '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + col + ';margin-right:7px;flex-shrink:0;"></span>';
                        // Tooltip mostra sempre o valor completo — a abreviação (ex: 15M) aplica-se apenas às labels do eixo Y
                        var val = p.value != null ? _mciFormatNumber(p.value, { maxFractionDigits: 2 }) : '—';
                        out += '<div style="display:flex;align-items:center;gap:3px;padding:2px 0;">' + dot + '<span style="flex:1;opacity:0.85;">' + p.seriesName + '</span><strong style="margin-left:12px;">' + val + '</strong></div>';
                    });
                    return out;
                }
            }),
            legend: {
                // Só séries com showInLegend !== false entram na legenda; as excluídas
                // continuam desenhadas e presentes no tooltip (trigger axis).
                // Ícone por item: séries de linha herdam o ícone nativo do ECharts
                // (linha + ponto); as restantes usam o rectângulo arredondado.
                show: lPos !== 'none',
                data: serDefs.map(function (s, i) {
                    if (s.showInLegend === false) return null;
                    var sType = (s.serType && s.serType !== 'default') ? s.serType : (ct === 'mixed' ? (i === 0 ? 'bar' : 'line') : ct);
                    var isLine = sType === 'line' || sType === 'area';
                    var item = { name: _evalSeriesName(s, rows) || s.field };
                    if (!isLine) item.icon = 'roundRect';
                    return item;
                }).filter(Boolean),
                // type:'scroll' impede que a legenda quebre em várias linhas quando há
                // muitas séries/nomes longos — sem isto o ECharts calcula wrap
                // automático, mas grid.top só reserva altura para 1 linha, pelo que a
                // 2ª/3ª linha da legenda ficava desenhada por cima do gráfico.
                type: 'scroll',
                top: lPos === 'bottom' ? 'bottom' : 'top', bottom: lPos === 'bottom' ? 6 : 'auto',
                left: 'center', itemWidth: 22, itemHeight: 8, borderRadius: 4,
                textStyle: { color: t.text, fontSize: 11 }, itemGap: 18,
                pageIconColor: t.text, pageIconInactiveColor: t.axisLine, pageTextStyle: { color: t.subtext, fontSize: 10 }
            },
            grid: _gridBase(lPos),
            xAxis: {
                type: 'category', data: xData,
                axisTick: { show: false }, axisLine: { lineStyle: { color: t.axisLine } },
                axisLabel: { color: t.subtext, rotate: (cfg.xAxis && cfg.xAxis.rotate) || 0, fontSize: 11, interval: (cfg.xAxis && cfg.xAxis.interval && cfg.xAxis.interval !== 'auto') ? parseInt(cfg.xAxis.interval) : 'auto', hideOverlap: true },
                splitLine: { show: false }, name: cfg.xAxis && cfg.xAxis.name || '', nameTextStyle: { color: t.subtext, fontSize: 11 }
            },
            yAxis: {
                type: 'value', show: cfg.yAxis ? cfg.yAxis.show !== false : true,
                axisLine: { show: false }, axisTick: { show: false },
                axisLabel: { color: t.subtext, fontSize: 11, formatter: function (v) { return _mciFormatNumber(v, { abbrev: (cfg && cfg.yAxis && cfg.yAxis.abbrev) }); } },
                splitLine: { lineStyle: { color: t.grid, type: [6, 4] } },
                name: cfg.yAxis && cfg.yAxis.name || '', nameTextStyle: { color: t.subtext, fontSize: 11 }
            },
            title: {
                show: cfg.title && cfg.title.show && !!cfg.title.text,
                text: cfg.title && cfg.title.text || '',
                textStyle: { color: t.text, fontSize: 14, fontWeight: 700 }, left: 'left', top: 4
            },
            toolbox: cfg.toolbox !== false ? {
                show: true,
                right: 6, top: 2,
                feature: {
                    magicType: { type: ['line', 'bar', 'stack'], title: { line: 'Linha', bar: 'Barras', stack: 'Empilhado' } },
                    saveAsImage: { title: 'Guardar imagem', pixelRatio: 2 }
                },
                iconStyle: { borderColor: t.subtext },
                emphasis: { iconStyle: { borderColor: t.text } }
            } : undefined,
            series: series
        });
    }

    function _buildBarHOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var serDefs = (cfg.series || []).filter(function (s) { return s.field; });
        var yData = rows.map(function (r) { return r[xField]; }).reverse();
        var series = serDefs.map(function (s, i) {
            var baseCol = _resolvePHCColor(s.color) || t.colors[i % t.colors.length];
            var useGrad = s.gradient !== undefined ? s.gradient !== false : cfg.gradient !== false;
            var br = s.borderRadius !== undefined ? s.borderRadius : (cfg.borderRadius !== undefined ? cfg.borderRadius : 6);
            var obj = {
                name: _evalSeriesName(s, rows) || s.field, type: 'bar',
                data: rows.map(function (r) { return r[s.field]; }).reverse(),
                itemStyle: {
                    borderRadius: [0, br, br, 0],
                    color: useGrad ? {
                        type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [{ offset: 0, color: _alpha(baseCol, 0.55) }, { offset: 1, color: baseCol }]
                    } : baseCol
                },
                label: { show: s.dataLabels !== undefined ? s.dataLabels !== false : cfg.dataLabels === true, position: 'right', fontSize: 11, color: s.labelColor || t.text, fontWeight: 600 },
                emphasis: { focus: 'series' },
                stack: s.stack || (cfg.stacked ? 'total' : undefined)
            };
            if (s.barWidth !== undefined) { obj.barWidth = s.barWidth + '%'; } else { obj.barMaxWidth = 30; }
            return obj;
        });
        return Object.assign({}, base, {
            tooltip: _tooltipBase(t, 'axis'),
            grid: { top: 10, left: '2%', right: '7%', bottom: 10, containLabel: true },
            xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: t.subtext, fontSize: 11 }, splitLine: { lineStyle: { color: t.grid, type: [6, 4] } } },
            yAxis: { type: 'category', data: yData, axisTick: { show: false }, axisLine: { lineStyle: { color: t.axisLine } }, axisLabel: { color: t.text, fontSize: 11 } },
            series: series
        });
    }

    function _buildPieOption(base, cfg, rows, t, ct) {
        var xField = cfg.xField || '';
        var vField = cfg.series && cfg.series.length > 0 ? cfg.series[0].field : '';
        var isDonut = ct === 'donut';
        var bgFill = t.bg === 'transparent' ? '#fff' : t.bg;
        var data = rows.map(function (r) { return { name: r[xField] || '?', value: parseFloat(r[vField]) || 0 }; });
        // Palette override: look up piePalette in PIE_PALETTES
        var effectiveBase = base;
        if (cfg.piePalette && cfg.piePalette !== 'theme') {
            if (cfg.piePalette === 'custom' && cfg.piePaletteCustom && cfg.piePaletteCustom.length) {
                effectiveBase = Object.assign({}, base, { color: cfg.piePaletteCustom });
            } else {
                var _pp = PIE_PALETTES.filter(function (p) { return p.key === cfg.piePalette; })[0];
                if (_pp && _pp.colors) effectiveBase = Object.assign({}, base, { color: _pp.colors });
            }
        }
        return Object.assign({}, effectiveBase, {
            tooltip: Object.assign(_tooltipBase(t, 'item'), {
                formatter: function (p) {
                    var dot = '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + p.color + ';margin-right:7px;"></span>';
                    return '<div style="padding:2px 0;">' + dot + '<strong>' + p.name + '</strong><br/><span style="padding-left:16px;">' + (+p.value).toLocaleString('pt-PT', { maximumFractionDigits: 2 }) + ' &nbsp;<em>(' + p.percent + '%)</em></span></div>';
                }
            }),
            legend: { show: cfg.legend && cfg.legend.show !== false, type: 'scroll', orient: 'horizontal', bottom: 4, left: 'center', textStyle: { color: t.text, fontSize: 11 }, icon: 'circle', pageIconColor: t.text, pageIconInactiveColor: t.axisLine, pageTextStyle: { color: t.subtext, fontSize: 10 } },
            series: [{
                name: vField, type: 'pie',
                radius: isDonut ? ['42%', '70%'] : ['0%', '70%'],
                center: ['50%', '50%'],
                selectedMode: 'single', data: data,
                itemStyle: { borderRadius: isDonut ? 8 : 4, borderColor: bgFill, borderWidth: isDonut ? 3 : 1 },
                label: { show: cfg.dataLabels === true, formatter: '{b}\n{d}%', fontSize: 11 },
                labelLine: { length: 12, length2: 8 },
                emphasis: { itemStyle: { shadowBlur: 20, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' }, scale: true, scaleSize: 7 },
                animationType: 'expansion', animationDuration: 800
            }]
        });
    }

    function _buildScatterOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var serDefs = (cfg.series || []).filter(function (s) { return s.field; });
        var series = serDefs.map(function (s, i) {
            var baseCol = _resolvePHCColor(s.color) || t.colors[i % t.colors.length];
            return {
                name: _evalSeriesName(s, rows) || s.field, type: 'scatter', symbolSize: s.symbolSize || 10,
                symbol: s.scatterSymbol || 'circle',
                data: rows.map(function (r) { return [r[xField], r[s.field]]; }),
                itemStyle: { color: _alpha(baseCol, 0.8), borderColor: baseCol, borderWidth: 1 },
                emphasis: { focus: 'series', itemStyle: { shadowBlur: 10 } }
            };
        });
        return Object.assign({}, base, {
            tooltip: Object.assign(_tooltipBase(t, 'item'), {
                formatter: function (p) { return '<strong>' + p.seriesName + '</strong><br/>x: ' + p.value[0] + '<br/>y: ' + p.value[1]; }
            }),
            grid: _gridBase('none'),
            xAxis: { type: 'value', axisLine: { lineStyle: { color: t.axisLine } }, axisLabel: { color: t.subtext, fontSize: 11 }, splitLine: { lineStyle: { color: t.grid, type: [6, 4] } } },
            yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: t.subtext, fontSize: 11 }, splitLine: { lineStyle: { color: t.grid, type: [6, 4] } } },
            series: series
        });
    }

    function _buildSparklineOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var serDefs = (cfg.series || []).filter(function (s) { return s.field; });
        var xData = rows.map(function (r) { return r[xField]; });
        var series = serDefs.map(function (s, i) {
            var baseCol = _resolvePHCColor(s.color) || '#2E7D32'; // Default green color for sparkline
            return {
                name: _evalSeriesName(s, rows) || s.field,
                type: 'line',
                data: rows.map(function (r) { return r[s.field]; }),
                smooth: true,
                symbol: 'none',
                lineStyle: { color: baseCol, width: 2 },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: _alpha(baseCol, 0.15) },
                            { offset: 1, color: _alpha(baseCol, 0) }
                        ]
                    }
                },
                emphasis: { focus: 'none' }
            };
        });
        return Object.assign({}, base, {
            tooltip: { show: false },
            legend: { show: false },
            grid: { top: 0, bottom: 0, left: 0, right: 0, containLabel: false },
            xAxis: {
                type: 'category', data: xData,
                show: false,
                axisTick: { show: false },
                axisLine: { show: false },
                axisLabel: { show: false },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                show: false,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                splitLine: { show: false }
            },
            title: { show: false },
            toolbox: { show: false },
            series: series
        });
    }

    function _buildFunnelOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var vField = cfg.series && cfg.series.length > 0 ? cfg.series[0].field : '';
        var data = rows.map(function (r) { return { name: r[xField] || '?', value: parseFloat(r[vField]) || 0 }; })
            .sort(function (a, b) { return b.value - a.value; });
        return Object.assign({}, base, {
            tooltip: Object.assign(_tooltipBase(t, 'item'), {
                formatter: function (p) { return '<strong>' + p.name + '</strong>: ' + (+p.value).toLocaleString('pt-PT', { maximumFractionDigits: 2 }) + ' (' + p.percent + '%)'; }
            }),
            legend: { show: cfg.legend && cfg.legend.show !== false, type: 'scroll', orient: 'horizontal', bottom: 4, left: 'center', textStyle: { color: t.text, fontSize: 11 }, pageIconColor: t.text, pageIconInactiveColor: t.axisLine, pageTextStyle: { color: t.subtext, fontSize: 10 } },
            series: [{
                name: vField, type: 'funnel',
                left: '10%', top: 32, bottom: 28, width: '80%', min: 0,
                sort: 'descending', gap: 4, data: data,
                itemStyle: { borderRadius: 4, borderWidth: 0 },
                label: { show: true, position: 'inside', fontSize: 12, color: '#fff', fontWeight: 700, formatter: function (p) { return p.name + '\n' + p.percent + '%'; } },
                emphasis: { label: { fontSize: 14 } }
            }]
        });
    }

    // Radar — xField fornece os indicadores (eixos, um por linha) e cada série
    // do cfg.series é uma linha do polígono (ex: "Objectivo" vs "Empresa"),
    // com um valor por indicador. Mesmo modelo de dados que os gráficos
    // cartesianos (xField + series[]), apenas reinterpretado como eixos radiais.
    function _buildRadarOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var maxField = cfg.radarMaxField || '';
        var serDefs = (cfg.series || []).filter(function (s) { return s.field; });
        var lPos = (cfg.legend && cfg.legend.show !== false) ? (cfg.legend.position || 'top') : 'none';

        var indicators = rows.map(function (r) {
            // Máximo fixo (config): usa o valor deste campo, na própria linha,
            // como referência de 100% do eixo — evita que eixos com escalas
            // muito diferentes (ex: percentagens vs. contagens) fiquem com
            // valores baixos a parecerem "perto do máximo" por o auto-cálculo
            // abaixo usar só os dados desse eixo em particular.
            if (maxField) {
                var fixedMax = parseFloat(r[maxField]);
                if (!isNaN(fixedMax) && fixedMax > 0) {
                    return { name: r[xField] || '', max: fixedMax };
                }
            }
            var maxCandidate = 0;
            serDefs.forEach(function (s) {
                var v = parseFloat(r[s.field]) || 0;
                if (v > maxCandidate) maxCandidate = v;
            });
            return { name: r[xField] || '', max: maxCandidate > 0 ? Math.ceil(maxCandidate * 1.2) : 10 };
        });

        var seriesData = serDefs.map(function (s, i) {
            var baseCol = _resolvePHCColor(s.color) || t.colors[i % t.colors.length];
            return {
                name: _evalSeriesName(s, rows) || s.field,
                value: rows.map(function (r) { return parseFloat(r[s.field]) || 0; }),
                lineStyle: { color: baseCol, width: 2.5 },
                itemStyle: { color: baseCol },
                areaStyle: { color: _alpha(baseCol, 0.16) },
                symbol: 'circle',
                symbolSize: 6
            };
        });

        return Object.assign({}, base, {
            tooltip: Object.assign(_tooltipBase(t, 'item'), {
                formatter: function (p) {
                    var out = '<div style="padding:1px 0 5px;font-weight:700;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.12);margin-bottom:5px;">' + p.name + '</div>';
                    (p.value || []).forEach(function (v, i) {
                        var indName = indicators[i] ? indicators[i].name : '';
                        out += '<div style="display:flex;justify-content:space-between;gap:14px;padding:2px 0;"><span style="opacity:.85;">' + indName + '</span><strong style="margin-left:12px;">' + _mciFormatNumber(v, { maxFractionDigits: 2 }) + '</strong></div>';
                    });
                    return out;
                }
            }),
            legend: {
                show: lPos !== 'none' && seriesData.length > 0,
                data: seriesData.map(function (sd) { return sd.name; }),
                type: 'scroll',
                top: lPos === 'bottom' ? 'bottom' : 'top', bottom: lPos === 'bottom' ? 6 : 'auto',
                left: 'center', itemWidth: 22, itemHeight: 8, borderRadius: 4,
                textStyle: { color: t.text, fontSize: 11 }, itemGap: 18, icon: 'roundRect',
                pageIconColor: t.text, pageIconInactiveColor: t.axisLine, pageTextStyle: { color: t.subtext, fontSize: 10 }
            },
            radar: {
                indicator: indicators,
                shape: 'polygon',
                splitNumber: 4,
                radius: '62%',
                axisName: { color: t.subtext, fontSize: 11 },
                splitLine: { lineStyle: { color: t.grid } },
                splitArea: { show: false },
                axisLine: { lineStyle: { color: t.axisLine } }
            },
            title: {
                show: cfg.title && cfg.title.show && !!cfg.title.text,
                text: cfg.title && cfg.title.text || '',
                textStyle: { color: t.text, fontSize: 14, fontWeight: 700 }, left: 'left', top: 4
            },
            series: [{
                type: 'radar',
                data: seriesData,
                emphasis: { lineStyle: { width: 3.5 } }
            }]
        });
    }

    // ── Config panel UI ───────────────────────────────────────────────────────
    // Utiliza PetiteVue para reactividde total:
    //   • onTransformChange → state.updateFields(newFields) → selects de campo actualizam sozinhos
    //   • v-model nos inputs → readConfig() lê de state, não do DOM
    function render(containerSel, options) {
        var $c = $(containerSel);
        if (!$c.length) return;
        var cfg = options.config || _defaultConfig();
        var initTransCfg = options.transformConfig || cfg.transformConfig || null;
        var initFields = options.fields ? options.fields.slice() : [];
        console.log('[MCB] render() initFields:', initFields, '| initTransCfg.transformationSchema:', initTransCfg && initTransCfg.transformationSchema);
        _injectCSS();
        $c.data('mcbTransformConfig', initTransCfg);

        // ── Estado reactivo ───────────────────────────────────────────────────
        var _fireTimer = null;
        var state = {
            activeTab: 'dados',
            fields: initFields,
            // Lista de fontes disponíveis (para o selector "Outra fonte")
            fontesList: (function () {
                var _ff = window.GMDashFontes || (window.appState && window.appState.fontes) || [];
                return _ff.map(function (f) { return { stamp: f.mdashfontestamp, nome: f.nome || f.mdashfontestamp }; });
            })(),
            cfg: {
                chartType: cfg.chartType || 'bar',
                theme: cfg.theme || 'modern',
                height: cfg.height || 320,
                xField: cfg.xField || '',
                stacked: !!cfg.stacked,
                smooth: cfg.smooth !== false,
                gradient: cfg.gradient !== false,
                dataLabels: !!cfg.dataLabels,
                animation: cfg.animation !== false,
                borderRadius: cfg.borderRadius || 6,
                xAxisRotate: (cfg.xAxis && cfg.xAxis.rotate) || 0,
                legendShow: cfg.legend ? cfg.legend.show !== false : true,
                legendPos: (cfg.legend && cfg.legend.position) || 'top',
                titleShow: !!(cfg.title && cfg.title.show),
                titleText: (cfg.title && cfg.title.text) || '',
                // Fonte de dados do gráfico: 'transform' | 'raw' | 'fonte'
                dataSourceMode: (cfg.dataSource && cfg.dataSource.mode) || 'transform',
                dataSourceFonte: (cfg.dataSource && cfg.dataSource.fonteStamp) || '',
                series: (cfg.series || []).map(function (s) {
                    return { field: s.field || '', name: s.name || '', type: s.type || 'default', color: s.color || '#2563EB' };
                })
            },
            fire: function () {
                var self = this;
                clearTimeout(_fireTimer);
                _fireTimer = setTimeout(function () {
                    if (typeof options.onChange === 'function') options.onChange(self._readCfg());
                }, 200);
            },
            _readCfg: function () {
                var c = this.cfg;
                return {
                    chartType: c.chartType,
                    theme: c.theme,
                    height: c.height,
                    xField: c.xField,
                    stacked: c.stacked,
                    smooth: c.smooth,
                    gradient: c.gradient,
                    dataLabels: c.dataLabels,
                    animation: c.animation,
                    borderRadius: c.borderRadius,
                    dataSource: { mode: c.dataSourceMode, fonteStamp: c.dataSourceFonte },
                    xAxis: { rotate: c.xAxisRotate, name: '' },
                    legend: { show: c.legendShow, position: c.legendPos },
                    title: { show: c.titleShow, text: c.titleText },
                    yAxis: { show: true, name: '' },
                    tooltip: { show: true },
                    series: this.cfg.series
                        .filter(function (s) { return !!s.field; })
                        .map(function (s) { return { field: s.field, name: s.name, type: s.type, color: s.color }; })
                };
            },
            addSerie: function () { this.cfg.series.push({ field: '', name: '', type: 'default', color: '#2563EB' }); this.fire(); },
            removeSerie: function (i) { this.cfg.series.splice(i, 1); this.fire(); },
            setChartType: function (t) { this.cfg.chartType = t; this.fire(); },
            setTheme: function (k) { this.cfg.theme = k; this.fire(); },
            // Resolve campos disponíveis com base no modo da fonte de dados
            changeDataSource: function () {
                var self = this;
                var tCfg  = $c.data('mcbTransformConfig');
                var mode  = self.cfg.dataSourceMode;
                var mtb   = typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null;
                console.log('[MCB] changeDataSource()', {
                    mode: mode,
                    'tCfg.transformationSchema': tCfg && tCfg.transformationSchema,
                    'MdashTransformBuilder disponível': !!mtb
                });

                var RESOLVERS = {
                    transform: function () {
                        console.log('[MCB] Resolving transform fields with schema:', tCfg && tCfg.transformationSchema);
                        return mtb && tCfg ? mtb.getOutputSchema(tCfg) : [];
                    },
                    raw: function () {
                        return (mtb && tCfg && tCfg.sourceTable)
                            ? mtb.getTableSchema(tCfg.sourceTable).map(function (s) { return s.field; })
                            : [];
                    },
                    fonte: function () {
                        var stamp = self.cfg.dataSourceFonte;
                        var fo    = stamp && (window.GMDashFontes || []).filter(function (f) { return f.mdashfontestamp === stamp; })[0];
                        return (mtb && fo && typeof mdashFonteTableName === 'function')
                            ? mtb.getTableSchema(mdashFonteTableName(fo)).map(function (s) { return s.field; })
                            : [];
                    }
                };

                var resolver = RESOLVERS[mode] || RESOLVERS.transform;
                var resolved = resolver();
                console.log('[MCB] changeDataSource() resolved fields:', resolved);
                self.updateFields(resolved);
            },
            // Actualiza listas de campos e limpa selecções inválidas
            updateFields: function (nf) {
                nf = nf || [];
                console.log('[MCB] updateFields() nf:', nf);
                this.fields = nf.slice();
                if (nf.indexOf(this.cfg.xField) === -1) this.cfg.xField = '';
                this.cfg.series.forEach(function (s) { if (nf.indexOf(s.field) === -1) s.field = ''; });
                this.fire();
            }
        };
        // IMPORTANTE: usar PetiteVue.reactive() para que mudanças externas
        // (ex: pvState.updateFields() chamado do onSave) disparem actualizações DOM
        if (typeof PetiteVue !== 'undefined' && typeof PetiteVue.reactive === 'function') {
            state = PetiteVue.reactive(state);
        }
        $c.data('mcbPvState', state);

        // ── Template HTML com directivas v-* ─────────────────────────────────
        var uid = 'mcbpv' + (Date.now() + Math.floor(Math.random() * 9999));
        // O root element escuta o evento 'mcb-refresh' disparado externamente (onSave do TransformBuilder)
        // Isto garante que changeDataSource() corre SEMPRE no contexto reactivo do PetiteVue
        // (this = reactive proxy), mesmo que pvState externo não seja o mesmo proxy.
        var h = '<div id="' + uid + '" class="mcb-root" @mcb-refresh.self="changeDataSource()">';

        // Tabs
        h += '<div class="mcb-tabs">';
        h += '<button class="mcb-tab" :class="{active:activeTab===\'dados\'}" @click="activeTab=\'dados\'"><i class="glyphicon glyphicon-hdd"></i> Dados</button>';
        // Ao entrar no tab Gráfico, re-calcula os campos a partir do transform actual
        h += '<button class="mcb-tab" :class="{active:activeTab===\'grafico\'}" @click="activeTab=\'grafico\';changeDataSource()"><i class="glyphicon glyphicon-stats"></i> Gráfico</button>';
        h += '<button class="mcb-tab" :class="{active:activeTab===\'estilo\'}" @click="activeTab=\'estilo\'"><i class="glyphicon glyphicon-tint"></i> Estilo</button>';
        h += '</div>';

        // ─── Panel Dados ──────────────────────────────────────────────────────
        h += '<div class="mcb-panel" :class="{active:activeTab===\'dados\'}"><div class="mcb-transform-host"></div></div>';

        // ─── Panel Gráfico ────────────────────────────────────────────────────
        h += '<div class="mcb-panel" :class="{active:activeTab===\'grafico\'}">'
            // Selector de fonte de dados (transform / bruto / outra fonte)
            + '<div class="mcb-fg"><label>Fonte de Dados</label>'
            + '<div class="mcb-ds-btns">'
            + '<button type="button" class="mcb-ds-btn" :class="{\'mcb-ds-on\':(cfg.dataSourceMode===\'transform\')}"'
            + ' @click="cfg.dataSourceMode=\'transform\';changeDataSource()" title="Usa o output do transform configurado na aba Dados">Transformado</button>'
            + '<button type="button" class="mcb-ds-btn" :class="{\'mcb-ds-on\':(cfg.dataSourceMode===\'raw\')}"'
            + ' @click="cfg.dataSourceMode=\'raw\';changeDataSource()" title="Usa a fonte original sem transformações">Bruto</button>'
            + '<button v-if="fontesList.length" type="button" class="mcb-ds-btn" :class="{\'mcb-ds-on\':(cfg.dataSourceMode===\'fonte\')}"'
            + ' @click="cfg.dataSourceMode=\'fonte\';changeDataSource()" title="Usa outra fonte configurada no dashboard">Outra fonte</button>'
            + '</div>'
            + '<select v-if="cfg.dataSourceMode===\'fonte\'" v-model="cfg.dataSourceFonte" @change="changeDataSource()" class="form-control input-sm" style="margin-top:5px;">'
            + '<option value="">-- seleccione fonte --</option>'
            + '<option v-for="f in fontesList" :value="f.stamp" :key="f.stamp">{{ f.nome }}</option>'
            + '</select>'
            + '</div>'
            + '<div class="mcb-fg"><label>Tipo de Gráfico</label><div class="mcb-ct-grid">';
        CHART_TYPES.forEach(function (ct) {
            h += '<button type="button" class="mcb-ct-btn"'
                + ' :class="{\'mcb-ct-on\':(cfg.chartType===\'' + ct.type + '\')}"'
                + ' @click="setChartType(\'' + ct.type + '\')" title="' + ct.label + '">'
                + ct.svg + '<span>' + ct.label + '</span></button>';
        });
        h += '</div></div>';
        // X field — v-for reactivo
        h += '<div class="mcb-fg"><label>Campo Eixo X / Categoria</label>'
            + '<select class="mcb-xfield form-control input-sm" v-model="cfg.xField" @change="fire()">'
            + '<option value="">-- seleccione --</option>'
            + '<option v-for="f in fields" :value="f" :key="f">{{ f }}</option>'
            + '</select></div>';
        // Séries — v-for reactivo
        h += '<div class="mcb-fg"><label>Séries (Valores Y)'
            + ' <button type="button" class="btn btn-xs btn-default pull-right" @click="addSerie()"><i class="glyphicon glyphicon-plus"></i></button>'
            + '</label>'
            + '<div class="mcb-series-list">'
            + '<div v-for="(s,i) in cfg.series" :key="i" class="mcb-serie">'
            + '<span class="mcb-drag">⠿</span>'
            + '<select class="mcb-sf form-control input-sm" v-model="s.field" @change="fire()">'
            + '<option value="">campo…</option>'
            + '<option v-for="f in fields" :value="f" :key="f">{{ f }}</option>'
            + '</select>'
            + '<input type="text" class="mcb-sn form-control input-sm" v-model="s.name" @input="fire()" placeholder="Nome">'
            + '<select v-if="cfg.chartType===\'mixed\'" class="mcb-st form-control input-sm" v-model="s.type" @change="fire()" style="width:74px;">'
            + '<option value="default">Auto</option><option value="bar">Bar</option><option value="line">Line</option><option value="area">Area</option>'
            + '</select>'
            + '<input type="color" class="mcb-sc" v-model="s.color" @change="fire()" title="Cor">'
            + '<button type="button" class="btn btn-xs btn-danger" @click="removeSerie(i)" title="Remover"><i class="glyphicon glyphicon-remove"></i></button>'
            + '</div></div></div>';
        // Opções
        h += '<div class="mcb-fg mcb-opts-grid">'
            + '<label class="mcb-chk"><input type="checkbox" v-model="cfg.stacked"    @change="fire()"> Barras empilhadas</label>'
            + '<label class="mcb-chk"><input type="checkbox" v-model="cfg.smooth"     @change="fire()"> Linhas suaves</label>'
            + '<label class="mcb-chk"><input type="checkbox" v-model="cfg.gradient"   @change="fire()"> Gradiente</label>'
            + '<label class="mcb-chk"><input type="checkbox" v-model="cfg.dataLabels" @change="fire()"> Etiquetas de dados</label>'
            + '</div>';
        h += '<div class="mcb-fg mcb-row2">'
            + '<div><label>Raio bordas (barras)</label><input type="number" class="mcb-br form-control input-sm" v-model.number="cfg.borderRadius" @input="fire()" min="0" max="24"></div>'
            + '<div><label>Rotação eixo X</label><input type="number" class="mcb-xrot form-control input-sm" v-model.number="cfg.xAxisRotate" @input="fire()" min="-90" max="90"></div>'
            + '</div>'
            + '</div>'; // panel-grafico

        // ─── Panel Estilo ─────────────────────────────────────────────────────
        h += '<div class="mcb-panel" :class="{active:activeTab===\'estilo\'}">';
        h += '<div class="mcb-fg"><label>Tema</label><div class="mcb-themes">';
        Object.keys(THEMES).forEach(function (k) {
            var th = THEMES[k];
            h += '<button type="button" class="mcb-th-btn"'
                + ' :class="{\'mcb-th-on\':(cfg.theme===\'' + k + '\')}"'
                + ' @click="setTheme(\'' + k + '\')" title="' + th.name + '">'
                + th.swatch.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join('')
                + '<em>' + th.name + '</em></button>';
        });
        h += '</div></div>';
        h += '<div class="mcb-fg"><label>Altura: <strong>{{ cfg.height }}px</strong></label>'
            + '<input type="range" class="mcb-height" min="150" max="800" step="10" v-model.number="cfg.height" @input="fire()"></div>';
        h += '<div class="mcb-fg mcb-row2">'
            + '<div><label class="mcb-chk"><input type="checkbox" v-model="cfg.legendShow" @change="fire()"> Mostrar legenda</label></div>'
            + '<div><label>Posição legenda</label>'
            + '<select class="mcb-legend-pos form-control input-sm" v-model="cfg.legendPos" @change="fire()">'
            + '<option value="top">Cima</option><option value="bottom">Baixo</option>'
            + '</select></div></div>';
        h += '<div class="mcb-fg">'
            + '<label class="mcb-chk"><input type="checkbox" v-model="cfg.titleShow" @change="fire()"> Mostrar título no gráfico</label>'
            + '<input type="text" class="mcb-title-text form-control input-sm" v-model="cfg.titleText" @input="fire()" placeholder="Título" style="margin-top:5px;">'
            + '</div>';
        h += '<div class="mcb-fg"><label class="mcb-chk"><input type="checkbox" v-model="cfg.animation" @change="fire()"> Animações</label></div>';
        h += '</div>'; // panel-estilo

        h += '</div>'; // mcb-root
        $c.html(h);

        // Mount PetiteVue (state já é reactive proxy neste ponto)
        if (typeof PetiteVue !== 'undefined') {
            PetiteVue.createApp(state).mount('#' + uid);
        }

        // Embed MdashTransformBuilder na tab Dados
        var host = $c.find('.mcb-transform-host');
        if (typeof MdashTransformBuilder !== 'undefined') {
            var tCfg = initTransCfg || MdashTransformBuilder.autoConfig('', 'Gráfico');
            MdashTransformBuilder.render(host[0] ? host[0] : '.mcb-transform-host', {
                config: tCfg,
                onSave: function (newT) {
                    // 1. Persistir transform no container
                    $c.data('mcbTransformConfig', newT);
                    // 2. Disparar evento DOM no root PetiteVue — changeDataSource() corre
                    //    no contexto reactivo interno (this = proxy correcto → DOM actualiza)
                    var rootEl = document.getElementById(uid);
                    if (rootEl) rootEl.dispatchEvent(new CustomEvent('mcb-refresh'));
                    // 3. Notificar o modal (actualizar preview)
                    if (typeof options.onTransformChange === 'function') options.onTransformChange(newT);
                },
                onCancel: function () { }
            });
        } else {
            host.html('<div style="color:#94A3B8;font-size:11px;padding:8px;font-style:italic;">MdashTransformBuilder não disponível.</div>');
        }
        // _bindUI já não é chamado — PetiteVue gere toda a reactividade
    }

    function _serieRow(s, i, fields, ct) {
        var fOpts = fields.map(function (f) {
            return '<option value="' + _esc(f) + '"' + (s.field === f ? ' selected' : '') + '>' + _esc(f) + '</option>';
        }).join('');
        var tOpts = ['default', 'bar', 'line', 'area'].map(function (t) {
            return '<option value="' + t + '"' + (s.type === t ? ' selected' : '') + '>' + (t === 'default' ? 'Auto' : t.charAt(0).toUpperCase() + t.slice(1)) + '</option>';
        }).join('');
        var h = '<div class="mcb-serie" data-idx="' + i + '">';
        h += '<span class="mcb-drag">⠿</span>';
        h += '<select class="mcb-sf form-control input-sm"><option value="">campo…</option>' + fOpts + '</select>';
        h += '<input type="text" class="mcb-sn form-control input-sm" value="' + _esc(s.name || '') + '" placeholder="Nome">';
        if (ct === 'mixed') {
            h += '<select class="mcb-st form-control input-sm" style="width:74px;">' + tOpts + '</select>';
        }
        h += '<input type="color" class="mcb-sc" value="' + _mciColorInputValue(s.color, '#2563EB') + '" title="Cor">';
        h += '<button type="button" class="mcb-del btn btn-xs btn-danger" title="Remover"><i class="glyphicon glyphicon-remove"></i></button>';
        h += '</div>';
        return h;
    }

    function _chk(cls, label, checked) {
        return '<label class="mcb-chk"><input type="checkbox" class="' + cls + '"' + (checked ? ' checked' : '') + '> ' + label + '</label>';
    }

    function readConfig($c) {
        // PetiteVue: ler do state reactivo em vez do DOM
        var pvState = $c.data('mcbPvState');
        if (pvState && typeof pvState._readCfg === 'function') {
            var result = pvState._readCfg();
            result.transformConfig = $c.data('mcbTransformConfig') || null;
            return result;
        }
        // Fallback (nunca devia chegar aqui com PetiteVue disponível)
        return _defaultConfig();
    }

    function _bindUI($c, cfg, fields, options) {
        $c.on('click', '.mcb-tab', function () {
            $c.find('.mcb-tab').removeClass('active');
            $(this).addClass('active');
            $c.find('.mcb-panel').removeClass('active');
            $c.find('.mcb-panel-' + $(this).data('tab')).addClass('active');
        });
        $c.on('click', '.mcb-ct-btn', function () {
            $c.find('.mcb-ct-btn').removeClass('mcb-ct-on');
            $(this).addClass('mcb-ct-on');
            _fire($c, options);
        });
        $c.on('click', '.mcb-th-btn', function () {
            $c.find('.mcb-th-btn').removeClass('mcb-th-on');
            $(this).addClass('mcb-th-on');
            _fire($c, options);
        });
        $c.on('click', '.mcb-add-serie', function () {
            var ct = $c.find('.mcb-ct-btn.mcb-ct-on').data('type') || 'bar';
            $c.find('.mcb-series-list').append(_serieRow({ field: '', name: '', type: 'default', color: '' }, $c.find('.mcb-serie').length, fields, ct));
            _fire($c, options);
        });
        $c.on('click', '.mcb-del', function () {
            $(this).closest('.mcb-serie').remove();
            _fire($c, options);
        });
        $c.on('input', '.mcb-height', function () {
            $c.find('.mcb-height-lbl').text($(this).val() + 'px');
            _fire($c, options);
        });
        $c.on('change input', 'select, input:not([type=range]):not([type=color])', function () { _fire($c, options); });
        $c.on('change', 'input[type=color]', function () { _fire($c, options); });
    }

    var _fTimer = null;
    function _fire($c, options) {
        clearTimeout(_fTimer);
        _fTimer = setTimeout(function () {
            if (typeof options.onChange === 'function') options.onChange(readConfig($c));
        }, 200);
    }

    // ── CSS injection ─────────────────────────────────────────────────────────
    function _injectCSS() {
        if ($('#mcb-styles').length) return;
        var s = '<style id="mcb-styles">';
        // Root / tabs
        s += '.mcb-root{font-size:12px;color:#333;}';
        s += '.mcb-tabs{display:flex;border-bottom:2px solid #e8ecf0;margin-bottom:12px;}';
        s += '.mcb-tab{flex:1;padding:7px 2px;border:none;background:none;font-size:11.5px;font-weight:700;color:#8090a5;cursor:pointer;border-bottom:2.5px solid transparent;margin-bottom:-2px;transition:color .15s,border-color .15s;letter-spacing:.3px;}';
        s += '.mcb-tab.active{color:#2563EB;border-color:#2563EB;}';
        s += '.mcb-tab:hover:not(.active){color:#475569;}';
        s += '.mcb-panel{display:none;}.mcb-panel.active{display:block;}';
        // Field groups
        s += '.mcb-fg{margin-bottom:11px;}';
        s += '.mcb-fg>label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.55px;color:#64748B;display:block;margin-bottom:5px;}';
        // Chart type grid (5 cols)
        s += '.mcb-ct-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;}';
        s += '.mcb-ct-btn{border:1.5px solid #e2e8f0;border-radius:8px;background:#f8fafc;padding:7px 3px 5px;cursor:pointer;transition:all .15s;text-align:center;color:#64748B;display:flex;flex-direction:column;align-items:center;gap:3px;}';
        s += '.mcb-ct-btn svg{width:22px;height:22px;display:block;}';
        s += '.mcb-ct-btn span{font-size:9px;line-height:1.1;}';
        s += '.mcb-ct-btn:hover{border-color:#2563EB;color:#2563EB;background:#eff6ff;}';
        s += '.mcb-ct-btn.mcb-ct-on{border-color:#2563EB;background:#dbeafe;color:#1D4ED8;box-shadow:0 0 0 3px rgba(37,99,235,.12);}';
        // Theme picker
        s += '.mcb-themes{display:flex;flex-wrap:wrap;gap:6px;}';
        s += '.mcb-th-btn{border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;padding:5px 8px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:3px;}';
        s += '.mcb-th-btn span{display:inline-block;width:11px;height:11px;border-radius:50%;}';
        s += '.mcb-th-btn em{font-style:normal;font-size:10px;font-weight:600;color:#64748B;margin-left:4px;}';
        s += '.mcb-th-btn:hover{border-color:#2563EB;}';
        s += '.mcb-th-btn.mcb-th-on{border-color:#2563EB;background:#eff6ff;box-shadow:0 0 0 3px rgba(37,99,235,.12);}';
        // Series rows
        s += '.mcb-serie{display:flex;align-items:center;gap:4px;margin-bottom:4px;}';
        s += '.mcb-drag{color:#cbd5e1;cursor:grab;font-size:13px;flex-shrink:0;user-select:none;}';
        s += '.mcb-sf{flex:1;min-width:0;}';
        s += '.mcb-sn{width:88px;flex-shrink:0;}';
        s += '.mcb-sc{width:30px;height:26px;padding:1px;border-radius:5px;border:1px solid #e2e8f0;cursor:pointer;flex-shrink:0;}';
        // Options grid
        s += '.mcb-opts-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;}';
        s += '.mcb-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}';
        s += '.mcb-chk{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:400;cursor:pointer;margin:0;}';
        s += '.mcb-chk input{cursor:pointer;}';
        s += '.mcb-height{width:100%;cursor:pointer;accent-color:#2563EB;}';
        // Empty state
        s += '.mchart-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;color:#94A3B8;text-align:center;padding:20px;}';
        s += '.mchart-empty-state i{font-size:28px;margin-bottom:8px;opacity:0.45;}';
        s += '.mchart-empty-state p{font-size:13px;font-weight:600;margin:0 0 4px;}';
        s += '.mchart-empty-state small{font-size:11px;opacity:0.6;}';
        // Sample badge
        s += '.mchart-sample-badge{font-size:10px;color:#64748B;background:rgba(241,245,249,0.92);border:1px solid #CBD5E1;border-radius:0 0 6px 6px;padding:3px 10px;text-align:center;letter-spacing:0.3px;}';
        // Data source mode buttons
        s += '.mcb-ds-btns{display:flex;gap:5px;margin-bottom:0;}';
        s += '.mcb-ds-btn{flex:1;padding:5px 4px;border:1.5px solid #e2e8f0;border-radius:7px;background:#f8fafc;font-size:10.5px;font-weight:700;color:#64748B;cursor:pointer;transition:all .15s;text-align:center;}';
        s += '.mcb-ds-btn:hover{border-color:#2563EB;color:#2563EB;background:#eff6ff;}';
        s += '.mcb-ds-btn.mcb-ds-on{border-color:#2563EB;background:#dbeafe;color:#1D4ED8;box-shadow:0 0 0 3px rgba(37,99,235,.12);}';
        s += '</style>';
        $('head').append(s);
    }

    return {
        THEMES: THEMES,
        PIE_PALETTES: PIE_PALETTES,
        CHART_TYPES: CHART_TYPES,
        buildEchartsOption: buildEchartsOption,
        render: render,
        readConfig: readConfig,
        defaultConfig: _defaultConfig
    };

})();

// ── Legacy stub mantido para compatibilidade com referências existentes ───────
function createDynamicSchemaGrafico(data) {
    // Substituído por renderChartPropertiesInline()
    return null;
    var availableFields = Object.keys(data[0]);

    return {
        type: "object",
        title: "Configuração de gráficos",
        properties: {
            chartContainer: {
                type: "object",
                title: "Container do Gráfico",
                properties: {
                    width: {
                        type: "string",
                        title: "Largura",
                        'default': "600"
                    },
                    height: {
                        type: "string",
                        title: "Altura",
                        'default': "400"
                    }
                }
            },
            title: {
                type: "object",
                title: "Título",
                properties: {
                    text: {
                        type: "string",
                        title: "Texto do Título",
                        'default': "Meu Gráfico"
                    },
                    show: {
                        type: "boolean",
                        title: "Mostrar Título",
                        'default': true
                    }
                }
            },
            xAxis: {
                type: "object",
                title: "Eixo X",
                properties: {
                    type: {
                        type: "string",
                        title: "Tipo",
                        'enum': ["category", "value", "time", "log"],
                        'default': "category"
                    },
                    dataField: {
                        type: "string",
                        title: "Campo para Eixo X",
                        'enum': availableFields,
                        'default': "mes"
                    },
                    axisLabel: {
                        type: "object",
                        title: "Configuração das Labels",
                        properties: {
                            rotate: {
                                type: "number",
                                title: "Rotação das Labels (graus)",
                                'default': 1,
                                minimum: -90,
                                maximum: 90,
                                description: "Ângulo de rotação das labels (-90° a 90°)"
                            },
                            interval: {
                                type: "string",
                                title: "Intervalo de Exibição",
                                'enum': ["auto", "0", "1", "2", "3"],
                                options: {
                                    enum_titles: ["Automático", "Todas", "A cada 2", "A cada 3", "A cada 4"]
                                },
                                'default': "0",
                                description: "Quantas labels mostrar (0 = todas)"
                            },
                            margin: {
                                type: "number",
                                title: "Margem das Labels (px)",
                                'default': 10,
                                minimum: 0,
                                maximum: 50
                            },
                            fontSize: {
                                type: "number",
                                title: "Tamanho da Fonte",
                                'default': 12,
                                minimum: 8,
                                maximum: 20
                            },
                            color: {
                                type: "string",
                                title: "Cor das Labels",
                                format: "color",
                                'default': "#3f5670"
                            }
                        }
                    }
                }
            },
            yAxis: {
                type: "object",
                title: "Eixo Y",
                properties: {
                    type: {
                        type: "string",
                        title: "Tipo",
                        'enum': ["category", "value", "time", "log"],
                        'default': "value"
                    },
                    dataField: {
                        type: "string",
                        title: "Campo para Eixo Y",
                        'enum': availableFields,
                        'default': "mes"
                    }
                }
            },
            series: {
                type: "array",
                title: "Séries",
                items: {
                    type: "object",
                    title: "Série",
                    properties: {
                        name: {
                            type: "string",
                            title: "Nome da Série"
                        },
                        dataField: {
                            type: "string",
                            title: "Campo de Dados",
                            'enum': availableFields,
                            'default': "totalsalario"
                        },
                        type: {
                            type: "string",
                            title: "Tipo de Gráfico",
                            'enum': ["line", "bar", "pie", "scatter", "area"],
                            'default': "line"
                        },
                        stack: {
                            type: "string",
                            title: "Grupo de Stack",
                            'default': "",
                            description: "Nome do grupo para empilhamento. Séries com o mesmo valor serão empilhadas (ex: 'total')"
                        },
                        stackStrategy: {
                            type: "string",
                            title: "Estratégia de Stack",
                            'enum': ["", "samesign", "all", "positive", "negative"],
                            options: {
                                enum_titles: ["Nenhum", "Mesmo Sinal", "Todos", "Positivos", "Negativos"]
                            },
                            'default': "",
                            description: "Como empilhar os valores"
                        },
                        barWidth: {
                            type: "number",
                            title: "Largura da Barra (%)",
                            'default': 60,
                            minimum: 10,
                            maximum: 100,
                            description: "Largura das barras em percentagem (10-100)"
                        },
                        // NOVAS PROPRIEDADES PARA CONTROLE DE ESPAÇAMENTO
                        barGap: {
                            type: "number",
                            title: "Espaço entre Barras do Mesmo Grupo (%)",
                            'default': 0,
                            minimum: 0,
                            maximum: 100,
                            description: "Espaço entre barras da mesma categoria (0 = sem espaço)"
                        },
                        barCategoryGap: {
                            type: "number",
                            title: "Espaço entre Categorias (%)",
                            'default': 20,
                            minimum: 0,
                            maximum: 100,
                            description: "Espaço entre diferentes grupos no eixo X"
                        },
                        // NOVAS PROPRIEDADES ADICIONADAS
                        smooth: {
                            type: "boolean",
                            title: "Linha Suave",
                            'default': true,
                            description: "Deixa a linha mais fluida (apenas para gráficos de linha)"
                        },
                        lineStyle: {
                            type: "object",
                            title: "Estilo da Linha",
                            properties: {
                                width: {
                                    type: "number",
                                    title: "Grossura da Linha",
                                    'default': 5,
                                    minimum: 1,
                                    maximum: 20
                                },
                                color: {
                                    type: "string",
                                    title: "Cor da Linha",
                                    format: "color",
                                    'default': "#5470C6"
                                },
                                shadowColor: {
                                    type: "string",
                                    title: "Cor da Sombra",
                                    format: "color",
                                    'default': "rgba(0, 0, 0, 0.5)"
                                },
                                shadowBlur: {
                                    type: "number",
                                    title: "Desfocagem da Sombra",
                                    'default': 10,
                                    minimum: 0,
                                    maximum: 50
                                },
                                shadowOffsetX: {
                                    type: "number",
                                    title: "Deslocamento Horizontal da Sombra",
                                    'default': 4,
                                    minimum: -20,
                                    maximum: 20
                                },
                                shadowOffsetY: {
                                    type: "number",
                                    title: "Deslocamento Vertical da Sombra",
                                    'default': 4,
                                    minimum: -20,
                                    maximum: 20
                                }
                            }
                        },
                        symbol: {
                            type: "string",
                            title: "Formato dos Pontos",
                            'enum': ["circle", "rect", "roundRect", "triangle", "diamond", "pin", "arrow", "none"],
                            options: {
                                enum_titles: ["Círculo", "Retângulo", "Retângulo Arredondado", "Triângulo", "Diamante", "Pin", "Seta", "Nenhum"]
                            },
                            'default': "circle",
                            description: "Formato dos pontos na linha"
                        },
                        symbolSize: {
                            type: "number",
                            title: "Tamanho dos Pontos",
                            'default': 8,
                            minimum: 0,
                            maximum: 30
                        },
                        itemStyle: {
                            type: "object",
                            title: "Estilo dos Pontos/Barras",
                            properties: {
                                color: {
                                    type: "string",
                                    title: "Cor dos Pontos/Barras",
                                    format: "color",
                                    'default': "#5470C6"
                                },
                                borderColor: {
                                    type: "string",
                                    title: "Cor da Borda",
                                    format: "color",
                                    'default': "#fff"
                                },
                                borderWidth: {
                                    type: "number",
                                    title: "Largura da Borda",
                                    'default': 2,
                                    minimum: 0,
                                    maximum: 10
                                },
                                borderRadius: {
                                    type: "array",
                                    title: "Raio das Bordas [topo-esq, topo-dir, baixo-dir, baixo-esq]",
                                    items: {
                                        type: "number"
                                    },
                                    'default': [6, 6, 0, 0],
                                    maxItems: 4,
                                    minItems: 4,
                                    description: "Para gráficos de barra - raio das bordas"
                                }
                            }
                        }

                    }
                }
            }
        }
    };
}


// ── Persistência da selecção da legenda (clique nos itens) ──────────────────
// Guardado em localStorage por objecto de gráfico (stamp); assim a escolha do
// utilizador sobrevive a refresh de query/filtros e a novas sessões no browser.
var _MCHART_LEGEND_SEL_KEY = 'mdashChartLegendSel';

function _mchartGetLegendSelection(stamp) {
    try {
        var all = JSON.parse(window.localStorage.getItem(_MCHART_LEGEND_SEL_KEY) || '{}');
        return all[stamp] || null;
    } catch (e) { return null; }
}

function _mchartSaveLegendSelection(stamp, selected) {
    try {
        var all = JSON.parse(window.localStorage.getItem(_MCHART_LEGEND_SEL_KEY) || '{}');
        // Só vale a pena guardar se houver pelo menos uma série desligada;
        // caso contrário limpa a entrada (estado por defeito).
        var hasOff = Object.keys(selected || {}).some(function (k) { return selected[k] === false; });
        if (hasOff) { all[stamp] = selected; } else { delete all[stamp]; }
        window.localStorage.setItem(_MCHART_LEGEND_SEL_KEY, JSON.stringify(all));
    } catch (e) { /* storage indisponível — selecção fica só em memória */ }
}

function renderObjectGrafico(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var chartId = 'mchart_' + stamp;
    var cfg = dados.config ? JSON.parse(JSON.stringify(dados.config)) : {};
    var isSample = !!dados.isSample;

    // dados.data já vem resolvido por mdashResolveObjectData (renderObjectByContainerItem).
    // Mantém-se fallback local para chamadas directas a esta função (ex: Mdash.html).
    var rows = dados.data || [];
    // transformConfig está agora no campo próprio (dados.transformConfig), com
    // fallback para cfg.transformConfig (legado embutido em configjson).
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    if (rows.length === 0 && tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                isSample = false;
            }
        } catch (e) {
            console.warn('[MDash] renderObjectGrafico fallback transform error:', e.message);
        }
    }

    // Sem config → aplicar config de amostra e dados de amostra para render imediato
    // Resolver dados por série (quando alguma série tem fonte/transformação própria)
    if (!isSample && rows.length > 0 && cfg.series) {
        var _mergedRows = _mciResolveSeriesRows(cfg, rows);
        if (_mergedRows && _mergedRows.length) rows = _mergedRows;
    }
    if (!cfg.chartType) {
        cfg = JSON.parse(JSON.stringify(_MCHART_SAMPLE_CONFIG));
        isSample = true;
    }
    if (rows.length === 0) {
        rows = getMdashSampleData('chart');
        isSample = true;
    }

    // Destruir instância ECharts anterior se existir
    var $old = $('#' + chartId);
    if ($old.length && typeof echarts !== 'undefined' && echarts.getInstanceByDom) {
        var oldInst = echarts.getInstanceByDom($old[0]);
        if (oldInst) oldInst.dispose();
    }

    var height = cfg.height || 320;
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra — configure a fonte</div>'
        : '';
    $(dados.containerSelector).html(
        '<div id="' + chartId + '" style="width:100%;height:' + height + 'px;"></div>' + badgeHtml
    );

    setTimeout(function () {
        var dom = document.getElementById(chartId);
        if (!dom) return;

        var chart = echarts.init(dom, null, { renderer: 'canvas' });

        if (rows.length > 0 && cfg.xField) {
            var option = MdashChartBuilder.buildEchartsOption(cfg, rows);
            // Restaurar selecção de séries feita pelo utilizador na legenda —
            // persiste em localStorage por objecto, sobrevive a refresh de query/filtros.
            var savedSel = _mchartGetLegendSelection(stamp);
            if (savedSel && option.legend && !Array.isArray(option.legend)) {
                option.legend.selected = savedSel;
            }
            chart.setOption(option, true);
            chart.on('legendselectchanged', function (params) {
                _mchartSaveLegendSelection(stamp, params.selected);
            });
        } else {
            var t = MdashChartBuilder.THEMES[cfg.theme || 'modern'] || MdashChartBuilder.THEMES.modern;
            chart.setOption({
                backgroundColor: t.bg,
                graphic: [{
                    type: 'text', left: 'center', top: 'middle', style: {
                        text: 'Configure o Eixo X nas propriedades',
                        fill: t.subtext, fontSize: 13, fontWeight: 600,
                        fontFamily: "'Inter','Segoe UI',sans-serif"
                    }
                }]
            });
        }

        // ResizeObserver para redimensionamento responsivo
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(function () { chart.resize(); });
            ro.observe(dom);
        } else {
            $(window).on('resize.mchart_' + stamp, function () { chart.resize(); });
        }
    }, 0);
}


function updateChartOnContainer(chart, config, data, chartId) {

    try {
        var option = {
            title: {
                text: config.title ? config.title.text : '',
                show: config.title ? config.title.show : false
            },
            grid: {
                left: '4%',
                right: '4%',
                top: '8%',
                bottom: '8%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: config.series ? config.series.map(function (s) { return s.name; }) : []
            },
            xAxis: {
                type: config.xAxis.type,
                data: data.map(function (item) {
                    return item[config.xAxis.dataField];
                }),
                axisLabel: {
                    rotate: config.xAxis.axisLabel ? (config.xAxis.axisLabel.rotate || 1) : 1,
                    interval: config.xAxis.axisLabel ?
                        (config.xAxis.axisLabel.interval === "auto" ? "auto" : parseInt(config.xAxis.axisLabel.interval)) : 0,
                    margin: config.xAxis.axisLabel ? (config.xAxis.axisLabel.margin || 10) : 10,
                    fontSize: config.xAxis.axisLabel ? (config.xAxis.axisLabel.fontSize || 12) : 12,
                    color: config.xAxis.axisLabel ? (config.xAxis.axisLabel.color || "#666") : "#666"
                }
            },
            yAxis: {
                type: config.yAxis.type,
                data: data.map(function (item) {
                    return item[config.xAxis.dataField];
                })
            },
            series: config.series ? config.series.map(function (serie) {
                var serieConfig = {
                    name: serie.name,
                    type: serie.type,
                    data: data.map(function (item) {
                        return item[serie.dataField];
                    })
                };

                if (serie.stack && serie.stack.trim() !== '') {
                    serieConfig.stack = serie.stack.trim();

                    // Aplicar estratégia de stack se especificada
                    if (serie.stackStrategy && serie.stackStrategy !== '') {
                        serieConfig.stackStrategy = serie.stackStrategy;
                    }
                }

                // APLICAR NOVAS CONFIGURAÇÕES DE ESTILO

                // Smooth para linhas
                if (serie.type === 'line' && serie.smooth !== undefined) {
                    serieConfig.smooth = serie.smooth;
                }

                // Line Style - configurações completas da linha
                if (serie.lineStyle) {
                    serieConfig.lineStyle = {};
                    if (serie.lineStyle.width) serieConfig.lineStyle.width = serie.lineStyle.width;
                    if (serie.lineStyle.color) serieConfig.lineStyle.color = serie.lineStyle.color;
                    if (serie.lineStyle.shadowColor) serieConfig.lineStyle.shadowColor = serie.lineStyle.shadowColor;
                    if (serie.lineStyle.shadowBlur !== undefined) serieConfig.lineStyle.shadowBlur = serie.lineStyle.shadowBlur;
                    if (serie.lineStyle.shadowOffsetX !== undefined) serieConfig.lineStyle.shadowOffsetX = serie.lineStyle.shadowOffsetX;
                    if (serie.lineStyle.shadowOffsetY !== undefined) serieConfig.lineStyle.shadowOffsetY = serie.lineStyle.shadowOffsetY;
                }

                // Symbol (formato dos pontos)
                if (serie.symbol) {
                    serieConfig.symbol = serie.symbol;
                }
                if (serie.symbolSize !== undefined) {
                    serieConfig.symbolSize = serie.symbolSize;
                }

                // Item Style (cor e estilo dos pontos/barras)
                if (serie.itemStyle || serie.color) {
                    serieConfig.itemStyle = serieConfig.itemStyle || {};


                    if (serie.itemStyle) {
                        if (serie.itemStyle.color) serieConfig.itemStyle.color = serie.itemStyle.color;
                        if (serie.itemStyle.borderColor) serieConfig.itemStyle.borderColor = serie.itemStyle.borderColor;
                        if (serie.itemStyle.borderWidth !== undefined) serieConfig.itemStyle.borderWidth = serie.itemStyle.borderWidth;
                        if (serie.itemStyle.borderRadius) serieConfig.itemStyle.borderRadius = serie.itemStyle.borderRadius;
                    }
                }

                // Bar Width (para gráficos de barra)
                if (serie.barWidth) {
                    serieConfig.barWidth = serie.barWidth + '%';
                }

                if (serie.barGap !== undefined) {
                    serieConfig.barGap = serie.barGap + '%';
                }

                if (serie.barCategoryGap !== undefined) {
                    serieConfig.barCategoryGap = serie.barCategoryGap + '%';
                }

                return serieConfig;
            }) : []
        };

        chart.setOption(option, true);

        window.addEventListener('resize', function () {
            chart.resize();
        });



    } catch (e) {
        console.error('Erro ao atualizar gráfico:', e);
    }
}

// ============================================================================
// MDASH_SAMPLE_DATA — Dados de amostra genéricos (20 registos de facturação)
// Usados por todos os tipos de objecto para renderização imediata no canvas.
// ============================================================================
var MDASH_SAMPLE_DATA = [
    { mes: 'Jan', cliente: 'Alpha Lda', vendedor: 'João Silva', total: 12500, custo: 8200, margem: 4300, qtd: 45, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Fev', cliente: 'Beta SA', vendedor: 'Ana Costa', total: 18700, custo: 11500, margem: 7200, qtd: 62, pais: 'ES', categoria: 'Hardware' },
    { mes: 'Mar', cliente: 'Gamma Corp', vendedor: 'João Silva', total: 9800, custo: 6100, margem: 3700, qtd: 38, pais: 'PT', categoria: 'Software' },
    { mes: 'Abr', cliente: 'Delta Lda', vendedor: 'Maria Santos', total: 22300, custo: 14200, margem: 8100, qtd: 75, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Mai', cliente: 'Epsilon SA', vendedor: 'Ana Costa', total: 15600, custo: 9800, margem: 5800, qtd: 54, pais: 'FR', categoria: 'Hardware' },
    { mes: 'Jun', cliente: 'Zeta Corp', vendedor: 'Rui Ferreira', total: 31200, custo: 19500, margem: 11700, qtd: 91, pais: 'DE', categoria: 'Software' },
    { mes: 'Jul', cliente: 'Eta Lda', vendedor: 'João Silva', total: 19800, custo: 12400, margem: 7400, qtd: 67, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Ago', cliente: 'Theta SA', vendedor: 'Maria Santos', total: 8400, custo: 5200, margem: 3200, qtd: 29, pais: 'ES', categoria: 'Hardware' },
    { mes: 'Set', cliente: 'Iota Corp', vendedor: 'Rui Ferreira', total: 27600, custo: 17200, margem: 10400, qtd: 83, pais: 'PT', categoria: 'Software' },
    { mes: 'Out', cliente: 'Kappa Lda', vendedor: 'Ana Costa', total: 21100, custo: 13300, margem: 7800, qtd: 71, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Nov', cliente: 'Lambda SA', vendedor: 'João Silva', total: 34500, custo: 21800, margem: 12700, qtd: 98, pais: 'FR', categoria: 'Hardware' },
    { mes: 'Dez', cliente: 'Mu Corp', vendedor: 'Maria Santos', total: 28900, custo: 18100, margem: 10800, qtd: 87, pais: 'DE', categoria: 'Software' },
    { mes: 'Jan', cliente: 'Nu Lda', vendedor: 'Rui Ferreira', total: 14200, custo: 8900, margem: 5300, qtd: 48, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Fev', cliente: 'Xi SA', vendedor: 'Ana Costa', total: 19300, custo: 12100, margem: 7200, qtd: 63, pais: 'ES', categoria: 'Hardware' },
    { mes: 'Mar', cliente: 'Omicron Corp', vendedor: 'João Silva', total: 11200, custo: 7000, margem: 4200, qtd: 41, pais: 'PT', categoria: 'Software' },
    { mes: 'Abr', cliente: 'Pi Lda', vendedor: 'Maria Santos', total: 25800, custo: 16200, margem: 9600, qtd: 79, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Mai', cliente: 'Rho SA', vendedor: 'Rui Ferreira', total: 17400, custo: 10900, margem: 6500, qtd: 58, pais: 'FR', categoria: 'Hardware' },
    { mes: 'Jun', cliente: 'Sigma Corp', vendedor: 'Ana Costa', total: 29700, custo: 18600, margem: 11100, qtd: 89, pais: 'DE', categoria: 'Software' },
    { mes: 'Jul', cliente: 'Tau Lda', vendedor: 'João Silva', total: 16800, custo: 10500, margem: 6300, qtd: 55, pais: 'PT', categoria: 'Serviços' },
    { mes: 'Ago', cliente: 'Upsilon SA', vendedor: 'Maria Santos', total: 22600, custo: 14200, margem: 8400, qtd: 74, pais: 'ES', categoria: 'Hardware' }
];

/**
 * getMdashSampleData(tipo)
 * Devolve dados de amostra genéricos para pré-visualização de qualquer tipo
 * de objecto antes de ser configurada uma fonte real.
 */
function getMdashSampleData(tipo) {
    if (tipo === 'badge' && typeof _tblGetExecutiveSampleRows === 'function') {
        return _tblGetExecutiveSampleRows().filter(function (rowItem) {
            return rowItem && rowItem.__rowType !== 'section';
        });
    }
    if (tipo === 'progress') {
        return [{ titulo: 'Total Vendas', valor: 841162, meta: 1121549, variacao: 3.56 }];
    }
    return MDASH_SAMPLE_DATA;
}

// Config de amostra para o tipo chart — produz um gráfico de barras imediato
var _MCHART_SAMPLE_CONFIG = {
    theme: 'modern', chartType: 'bar', height: 300,
    xField: 'mes',
    series: [
        { field: 'total', name: 'Total Faturado', type: 'default', color: '' },
        { field: 'custo', name: 'Custo', type: 'default', color: '' }
    ],
    stacked: false, smooth: true, gradient: true, borderRadius: 6,
    dataLabels: false, animation: true, toolbox: true,
    legend: { show: true, position: 'top' },
    tooltip: { show: true },
    xAxis: { show: true, rotate: 0, name: 'Mês' },
    yAxis: { show: true, name: 'Valor (€)' },
    title: { show: true, text: '[ Amostra — configure a fonte de dados ]' }
};

// ============================================================================
// INLINE CHART PROPERTIES EDITOR — 3rd column (properties panel)
// Renders a live-preview chart editor directly inside the properties panel
// without opening any modal. Changes are applied & persisted in real time.
// ============================================================================

// ── Helpers ──────────────────────────────────────────────────────────────────

function _mciEsc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Devolve as fontes visiveis para um objecto (heranca: object → containeritem → container → global).
// Sem obj devolve todas as fontes (compatibilidade retroactiva).
function _mciGetFontes(obj) {
    if (obj && obj.mdashcontaineritemobjectstamp && typeof MDashFonte !== 'undefined' && typeof MDashFonte.getAvailableFontes === 'function') {
        var _allCIs = (window.appState && window.appState.containerItems) || [];
        var _pCI = _allCIs.find(function (i) { return i.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
        return MDashFonte.getAvailableFontes('object', obj.mdashcontaineritemobjectstamp, obj.mdashcontaineritemstamp || '', _pCI ? _pCI.mdashcontainerstamp : '');
    }
    if (window.appState && Array.isArray(window.appState.fontes) && window.appState.fontes.length) return window.appState.fontes;
    if (Array.isArray(GMDashFontes) && GMDashFontes.length) return GMDashFontes;
    return [];
}

// Devolve [{field, type}] para uma fonte — delega no resolver central.
function _mciGetFonteSchema(fonte) {
    if (!fonte) return [];
    if (typeof mdashDetectSourceSchema === 'function') return mdashDetectSourceSchema(fonte);
    if (fonte.schemajson) {
        try {
            var sc = JSON.parse(fonte.schemajson);
            if (Array.isArray(sc) && sc.length)
                return sc.map(function (c) { return { field: typeof c === 'string' ? c : (c.field || c.name || String(c)), type: c.type || 'TEXT' }; }).filter(function (c) { return c.field; });
        } catch (e) {}
    }
    return [];
}

// Ao seleccionar fonte: garante schema SQLite e rebind da transformação passthrough.
function _mciOnFonteSelected(fonteStamp, obj, panel, onReady) {
    var prevStamp = obj.fontestamp || '';
    obj.fontestamp = fonteStamp || '';

    if (!fonteStamp) {
        obj.transformConfig = null;
        obj.transformconfigjson = '';
        if (obj.config) obj.config.transformConfig = null;
        if (panel) {
            var $tsEmpty = panel.find('.mcbi-transform-status');
            $tsEmpty.removeClass('is-active');
            $tsEmpty.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação');
            $tsEmpty.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
        }
        if (typeof onReady === 'function') onReady();
        return;
    }

    var fonte = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
    if (!fonte) {
        if (typeof onReady === 'function') onReady();
        return;
    }

    var fonteChanged = prevStamp !== fonteStamp;

    function finish() {
        var newTbl = (typeof mdashFonteTableName === 'function') ? mdashFonteTableName(fonte) : '';
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var currentTbl = currentTC ? (currentTC.sourceTable || '') : '';
        var needsRebind = fonteChanged || !currentTC || !currentTbl || (newTbl && currentTbl !== newTbl);

        if (needsRebind) {
            _mciAutoApplyFonteTransform(fonteStamp, obj, panel);
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
        }
        if (typeof onReady === 'function') onReady();
    }

    var existing = (typeof mdashDetectSourceSchema === 'function') ? mdashDetectSourceSchema(fonte) : [];
    if (existing.length) {
        if (typeof mdashEnsureFonteInDb === 'function') mdashEnsureFonteInDb(fonte);
        finish();
        return;
    }
    if (typeof mdashEnsureSourceSchema === 'function') {
        mdashEnsureSourceSchema(fonte, function () { finish(); });
    } else {
        if (typeof mdashEnsureFonteInDb === 'function') mdashEnsureFonteInDb(fonte);
        finish();
    }
}

function _mciRefreshPanelsForFonte(fonteStamp) {
    if (!fonteStamp) return;
    var objects = (window.appState && window.appState.containerItemObjects)
        || (typeof GMDashContainerItemObjects !== 'undefined' ? GMDashContainerItemObjects : []);
    objects.forEach(function (obj) {
        if (!obj || obj.fontestamp !== fonteStamp) return;
        var stamp = obj.mdashcontaineritemobjectstamp;
        var $panel = $('.mcbi-root[data-stamp="' + stamp + '"]');
        if (!$panel.length) return;
        var fields = _mciGetFields(obj);
        _mciRefreshFieldSelects($panel, fields);
        $panel.find('.mtxt-datafield, .mbadge-valuefield, .mprog-valuefield, .mprog-ref-field, .mprog-label-field, .mprog-list-title-field, .mprog-list-subtitle-field, .mprog-title-field, .mprog-kpi-trend-field, .mlst-labelfield, .mlst-subtitlefield, .mlst-datefield, .mlst-linkfield, .mlst-linklabel, .mlst-badgefield').each(function () {
            _mciSetSelectFields($(this), fields, '-- campo --');
        });
        if ($panel.hasClass('mtbl-root') && typeof _tblRefreshFieldSelects === 'function') {
            _tblRefreshFieldSelects($panel, fields);
        }
        var $mccList = $panel.find('.mcc-fields-list');
        if ($mccList.length) {
            $mccList.html(fields.length
                ? fields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                : '<em>Sem campos — seleccione uma fonte</em>');
        }
        var $mhtmlList = $panel.find('.mhtml-fields-list');
        if ($mhtmlList.length) {
            $mhtmlList.html(fields.length
                ? fields.map(function (f) {
                    return '<code style="cursor:pointer;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;display:inline-block;" class="mhtml-field-pill" data-field="' + _mciEsc(f) + '">' + _mciEsc(f) + '</code>';
                }).join(' ')
                : '<em style="color:#94a3b8;">Sem campos</em>');
        }
    });
}

if (typeof $ !== 'undefined') {
    $(document).off('mdash:schema:updated.mdashMci').on('mdash:schema:updated.mdashMci', function (ev, data) {
        if (data && data.fonteStamp) _mciRefreshPanelsForFonte(data.fonteStamp);
    });
}

// Actualiza um <select> jQuery com uma lista de campos, preservando a selecção actual.
function _mciSetSelectFields($sel, fields, placeholder) {
    var cur = $sel.val();
    $sel.html('<option value="">' + (placeholder || 'campo…') + '</option>'
        + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join(''));
}

// ── Auto-aplica uma transformação passthrough quando se selecciona uma fonte ──
// Cria um transformConfig com todas as colunas da fonte sem filtros/aggregações.
// Pode ser chamado em qualquer ponto do código (change handler, init, series, etc.).
// panel é opcional — se fornecido, actualiza o UI do .mcbi-transform-status.
function _mciAutoApplyFonteTransform(fonteStamp, obj, panel) {
    if (!fonteStamp) return;
    var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
    if (!MTB) return;
    var fonte = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
    if (!fonte) return;

    if (typeof mdashEnsureFonteInDb === 'function') mdashEnsureFonteInDb(fonte);

    var tblName = (typeof mdashFonteTableName === 'function') ? mdashFonteTableName(fonte) : '';
    var schema = (typeof mdashDetectSourceSchema === 'function')
        ? mdashDetectSourceSchema(fonte)
        : _mciGetFonteSchema(fonte);

    var autoConf = tblName ? MTB.autoConfig(tblName, 'Gráfico') : { mode: 'visual', sourceTable: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null };
    if (!autoConf.columns.length && schema.length) {
        autoConf.sourceTable = tblName;
        autoConf.columns = schema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
    }
    if (!autoConf.transformationSchema || !autoConf.transformationSchema.length) {
        autoConf.transformationSchema = (schema.length ? schema : autoConf.columns).map(function (s) { return s.field || s; }).filter(Boolean);
    }
    autoConf.schemaSyncedAt = fonte.lastexecuted || new Date().toISOString();

    obj.transformConfig = autoConf;
    obj.transformconfigjson = JSON.stringify(autoConf);
    obj.config = obj.config || {};
    obj.config.transformConfig = autoConf;

    if (panel) {
        var $ts = panel.find('.mcbi-transform-status');
        $ts.addClass('is-active');
        $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(tblName || 'fonte') + '</strong>');
        $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
    }
}

function _mciGetFields(obj) {
    if (typeof mdashResolveObjectFields === 'function') {
        var resolved = mdashResolveObjectFields(obj);
        if (resolved && resolved.length) return resolved;
    }
    var cfg = obj.config || {};
    // 1. TransformConfig — coluna própria tem prioridade sobre legado dentro de cfg
    var tCfg = obj.transformConfig || cfg.transformConfig || null;
    if (tCfg && typeof MdashTransformBuilder !== 'undefined') {
        var outSchema = (tCfg.transformationSchema && tCfg.transformationSchema.length)
            ? tCfg.transformationSchema.slice()
            : MdashTransformBuilder.getOutputSchema(tCfg);
        if (outSchema && outSchema.length) return outSchema;
    }
    // 2. Fonte schemajson / lastResultscached / PRAGMA
    if (obj.fontestamp) {
        var fonte = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        if (fonte) {
            if (fonte.schemajson) {
                try {
                    var sc = JSON.parse(fonte.schemajson);
                    if (Array.isArray(sc) && sc.length) {
                        var scCols = sc.map(function (c) { return typeof c === 'string' ? c : (c.name || c.field || String(c)); }).filter(Boolean);
                        if (scCols.length) return scCols;
                    }
                } catch (e) {}
            }
            if (fonte.lastResultscached) {
                try {
                    var cached = JSON.parse(fonte.lastResultscached);
                    if (cached && cached.columns && cached.columns.length) return cached.columns;
                    if (Array.isArray(cached) && cached.length && typeof cached[0] === 'object') return Object.keys(cached[0]);
                } catch (e) {}
            }
            if (typeof MdashTransformBuilder !== 'undefined' && typeof mdashFonteTableName === 'function') {
                var tblName = mdashFonteTableName(fonte);
                if (tblName) {
                    var tblSchema = MdashTransformBuilder.getTableSchema(tblName);
                    if (tblSchema && tblSchema.length) return tblSchema.map(function (s) { return s.field; });
                }
            }
        }
    }
    // 3. Sample data fields
    if (obj && obj.tipo === 'table') {
        return _tblGetExecutiveSampleFieldNames();
    }
    return Object.keys(MDASH_SAMPLE_DATA[0]);
}

function _mciGetRows(obj) {
    // 1. TransformConfig
    var cfg = obj.config || {};
    if (cfg.transformConfig && cfg.transformConfig.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        var raw = MdashTransformBuilder.executeRaw(cfg.transformConfig);
        if (!raw.error && raw.rows && raw.columns && raw.rows.length) {
            return raw.rows.map(function (r) { var o = {}; raw.columns.forEach(function (c, i) { o[c] = r[i]; }); return o; });
        }
    }
    // 2. ContainerItem records
    var items = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    var ci = (items || []).find(function (x) { return x.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
    if (ci && ci.records && ci.records.length) return ci.records;
    // 3. Sample
    return MDASH_SAMPLE_DATA;
}

function _mciGetActivePropsScrollEl() {
    var $overlay = $('#mdash-overlay-designer-modal:visible .mdash-properties').first();
    if ($overlay.length) return $overlay;
    return $('.mdash-properties').not('#mdash-overlay-designer-modal .mdash-properties').first();
}

function _mciCaptureEditorScrollState() {
    var $props = _mciGetActivePropsScrollEl();
    var $canvas = $('#mdash-canvas-body');
    return {
        windowTop: $(window).scrollTop(),
        windowLeft: $(window).scrollLeft(),
        propsTop: $props.length ? $props.scrollTop() : 0,
        canvasTop: $canvas.length ? $canvas.scrollTop() : 0
    };
}

function _mciRestoreEditorScrollState(state) {
    if (!state) return;
    $(window).scrollTop(state.windowTop);
    $(window).scrollLeft(state.windowLeft);
    var $props = _mciGetActivePropsScrollEl();
    var $canvas = $('#mdash-canvas-body');
    if ($props.length) $props.scrollTop(state.propsTop);
    if ($canvas.length) $canvas.scrollTop(state.canvasTop);
}

var _mciPropsCheckboxToggleInited = false;
function _mciInitPropsCheckboxToggles() {
    if (_mciPropsCheckboxToggleInited) return;
    _mciPropsCheckboxToggleInited = true;
    var sel = '#mdash-properties-panel .mcbi-chk, #mdash-overlay-props-panel .mcbi-chk';
    $(document).on('mousedown.mdash-mcbi-chk', sel, function (e) {
        e.preventDefault();
    });
    $(document).on('click.mdash-mcbi-chk', sel, function (e) {
        if (e.target && e.target.tagName === 'INPUT') return;
        e.preventDefault();
        var $label = $(this);
        var $input = $label.find('input[type=checkbox]').first();
        if (!$input.length || $input.prop('disabled')) return;
        var next = !$input.prop('checked');
        $input.prop('checked', next);
        $label.toggleClass('is-on', next);
        $input.trigger('change');
    });
}

function _mciRerender(obj, options) {
    options = options || {};
    var stamp = obj.mdashcontaineritemobjectstamp;
    var sel = ['#mdash-slot-render-' + stamp, '#mdash-overlay-preview-' + stamp]
        .find(function (selector) { return $(selector).length; });
    if (!sel) return;
    var items = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    var ci = (items || []).find(function (x) { return x.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
    if (!ci) return;

    var scrollState = _mciCaptureEditorScrollState();
    var $active = $(document.activeElement);
    var focusInProps = $active.closest('#mdash-properties-panel, #mdash-overlay-props-panel, .mdash-properties').length > 0;
    if (!options.preserveFocus && !focusInProps) {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }

    obj.renderObjectByContainerItem(sel, ci);

    function restoreScroll() { _mciRestoreEditorScrollState(scrollState); }
    setTimeout(restoreScroll, 0);
    setTimeout(restoreScroll, 100);
}

function _mciPreviewUpdate(stamp, cfg, rows) {
    if (typeof echarts === 'undefined' || typeof MdashChartBuilder === 'undefined') return;
    var dom = document.getElementById('mcbi-mini-' + stamp);
    if (!dom) return;
    var chart = echarts.getInstanceByDom(dom) || echarts.init(dom, null, { renderer: 'canvas' });
    try { chart.setOption(MdashChartBuilder.buildEchartsOption(cfg, rows), true); chart.resize(); } catch (e) { }
}

function _mciReadConfig($root, obj) {
    var cfg = obj.config ? JSON.parse(JSON.stringify(obj.config)) : {};
    cfg.chartType = $root.find('.mcbi-ct-btn.is-on').data('type') || cfg.chartType || 'bar';
    cfg.theme = $root.find('.mcbi-th-btn.is-on').data('theme') || cfg.theme || 'modern';
    cfg.height = parseInt($root.find('.mcbi-height').val()) || cfg.height || 320;
    var _isPieCt = (cfg.chartType === 'pie' || cfg.chartType === 'donut' || cfg.chartType === 'funnel');
    if (_isPieCt) {
        cfg.xField = $root.find('.mcbi-pie-lf').val() || '';
        var _pieVf = $root.find('.mcbi-pie-vf').val() || '';
        if (!cfg.series || !cfg.series.length) {
            cfg.series = [{ field: _pieVf, name: '', type: 'default', serType: 'default', stack: '', color: '' }];
        } else {
            cfg.series[0].field = _pieVf;
            for (var _si = 1; _si < cfg.series.length; _si++) cfg.series[_si].field = '';
        }
        cfg.piePalette = $root.find('.mcbi-pp-btn.is-on').data('pp') || 'theme';
        if (cfg.piePalette === 'custom') {
            cfg.piePaletteCustom = [];
            $root.find('.mcbi-custom-c').each(function () { cfg.piePaletteCustom.push($(this).val()); });
        }
    } else {
        cfg.xField = $root.find('.mcbi-xf').val() || '';
        cfg.radarMaxField = $root.find('.mcbi-radar-maxfield').val() || '';
        cfg.series = [];
        $root.find('.mcbi-sr').each(function () {
            var $r = $(this), fld = $r.find('.mcbi-sf').val() || '';
            cfg.series.push({
                field: fld, name: $r.find('.mcbi-sn').val().trim(), serType: $r.find('.mcbi-st').val() || 'default', stack: $r.find('.mcbi-sstack').val().trim(), color: $r.find('.mcbi-sc-phc').val() || $r.find('.mcbi-sc').val() || '', type: 'default',
                gradient: $r.find('.mcbi-s-gradient').is(':checked'),
                smooth: $r.find('.mcbi-s-smooth').is(':checked'),
                dataLabels: $r.find('.mcbi-s-labels').is(':checked'),
                showInLegend: $r.find('.mcbi-s-legend').is(':checked'),
                labelColor: $r.find('.mcbi-s-labelcol').val() || '',
                areaOpacity: (parseInt($r.find('.mcbi-s-aopacity').val()) || 32) / 100,
                symbolSize: parseInt($r.find('.mcbi-s-ssz').val()) || 10,
                borderRadius: $r.find('.mcbi-s-br').val() !== '' ? parseInt($r.find('.mcbi-s-br').val()) : undefined,
                barWidth: $r.find('.mcbi-s-bw').val() !== '' ? parseInt($r.find('.mcbi-s-bw').val()) : undefined,
                lineWidth: $r.find('.mcbi-s-lw').val() !== '' ? parseFloat($r.find('.mcbi-s-lw').val()) : undefined,
                symbol: $r.find('.mcbi-s-sym').val() || 'circle',
                lineSymbolSize: $r.find('.mcbi-s-lsz').val() !== '' ? parseInt($r.find('.mcbi-s-lsz').val()) : undefined,
                scatterSymbol: $r.find('.mcbi-s-sctsym').val() || 'circle',
                dataSource: (function () {
                    var _m = $r.find('.mcbi-s-ds-btn.is-on').data('ds') || 'main';
                    var _ds = { mode: _m };
                    if (_m === 'fonte') _ds.fonteStamp = $r.find('.mcbi-s-ds-fonte').val() || '';
                    if (_m === 'transform' || _m === 'fonte') _ds.transformConfig = $r.data('seriesTransformConfig') || null;
                    return _ds;
                })()
            });
        });
    }
    cfg.stacked = $root.find('.mcbi-stacked').is(':checked');
    cfg.toolbox = $root.find('.mcbi-toolbox').is(':checked') ? true : false;
    cfg.smooth = $root.find('.mcbi-smooth').is(':checked');
    cfg.gradient = $root.find('.mcbi-gradient').is(':checked');
    cfg.dataLabels = $root.find('.mcbi-labels').is(':checked');
    cfg.animation = $root.find('.mcbi-anim').is(':checked');
    cfg.borderRadius = parseInt($root.find('.mcbi-br').val()) || 6;
    cfg.xAxis = { rotate: parseInt($root.find('.mcbi-xrot').val()) || 0, name: $root.find('.mcbi-xname').val() || '', interval: $root.find('.mcbi-xinterval').val() || 'auto' };
    cfg.yAxis = { show: $root.find('.mcbi-yshow').is(':checked'), name: $root.find('.mcbi-yname').val() || '', abbrev: $root.find('.mcbi-yabbrev').is(':checked') };
    cfg.legend = { show: $root.find('.mcbi-legend').is(':checked'), position: $root.find('.mcbi-legend-pos').val() || 'top' };
    cfg.title = { show: $root.find('.mcbi-title-show').is(':checked'), text: $root.find('.mcbi-title-text').val() || '' };
    cfg.tooltip = { show: true };
    // Preservar transformConfig de obj.config OU obj.transformConfig (fallback)
    cfg.transformConfig = cfg.transformConfig || obj.transformConfig || null;
    
    // NÃO atualizar transformconfigjson manualmente - stringifyJSONFields() faz isso
    return cfg;
}

function _mciSection(id, label, icon, open, body) {
    return '<div class="mcbi-section' + (open ? ' is-open' : '') + '">'
        + '<div class="mcbi-section-hd" data-sec="' + id + '"><i class="glyphicon ' + icon + '"></i> ' + label
        + '<i class="mcbi-chev glyphicon glyphicon-chevron-' + (open ? 'up' : 'down') + '"></i></div>'
        + '<div class="mcbi-section-bd">' + body + '</div></div>';
}

function _mciChk(cls, label, checked) {
    return '<label class="mcbi-chk' + (checked ? ' is-on' : '') + '">'
        + '<input type="checkbox" class="' + cls + '"' + (checked ? ' checked' : '') + '>'
        + '<span class="mcbi-tog"></span>'
        + '<span>' + label + '</span>'
        + '</label>';
}

function _mciChkVal(cls, label, checked) {
    return '<label class="mcbi-chk' + (checked ? ' is-on' : '') + '">'
        + '<input type="checkbox" class="' + cls + '"' + (checked ? ' checked' : '') + '>'
        + '<span class="mcbi-tog"></span>'
        + '<span>' + label + '</span>'
        + '</label>';
}

function _mciSerieRow(s, i, fields, fontes) {
    fontes = fontes || [];
    var dsMode = (s.dataSource && s.dataSource.mode) || 'main';
    var dsFonteStamp = (s.dataSource && s.dataSource.fonteStamp) || '';
    var hasDsTrans = !!(s.dataSource && s.dataSource.transformConfig);
    var _dsModes = [['main', 'Principal'], ['transform', 'Trans. própria'], ['fonte', 'Outra fonte']];
    var dsSection = '<div class="mcbi-sr-ds">'
        + '<label>Fonte da série</label>'
        + '<div class="mcbi-s-ds-btns">'
        + _dsModes.map(function (dm) { return '<button type="button" class="mcbi-s-ds-btn' + (dsMode === dm[0] ? ' is-on' : '') + '" data-ds="' + dm[0] + '">' + dm[1] + '</button>'; }).join('')
        + '</div>'
        + '<select class="mcbi-s-ds-fonte form-control input-sm" style="margin-top:5px;' + (dsMode === 'fonte' ? '' : 'display:none') + '">'
        + '<option value="">-- seleccione fonte --</option>'
        + fontes.map(function (f) { return '<option value="' + _mciEsc(f.mdashfontestamp) + '"' + (dsFonteStamp === f.mdashfontestamp ? ' selected' : '') + '>' + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>'; }).join('')
        + '</select>'
        + '<div class="mcbi-s-ds-trans" style="margin-top:5px;' + (dsMode === 'transform' || dsMode === 'fonte' ? '' : 'display:none') + '">'
        + '<button type="button" class="btn btn-xs btn-default mcbi-s-ds-edit-trans"><i class="glyphicon glyphicon-' + (hasDsTrans ? 'pencil' : 'plus') + '"></i> ' + (hasDsTrans ? 'Editar transf.' : 'Config. transf.') + '</button>'
        + '<span class="mcbi-s-ds-trans-lbl" style="font-size:10px;color:#64748b;margin-left:6px;vertical-align:middle;">' + (hasDsTrans ? _mciEsc(s.dataSource.transformConfig.sourceTable || 'SQL') : '') + '</span>'
        + '</div>'
        + '</div>';
    var fOpts = '<option value="">campo…</option>'
        + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (s.field === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
    var stOpts = [['default', 'Auto'], ['bar', 'Barras'], ['line', 'Linha'], ['area', 'Área'], ['scatter', 'Disp.']].map(function (o) {
        return '<option value="' + o[0] + '"' + ((s.serType || 'default') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('');
    var phcToken = (s.color && typeof s.color === 'string' && s.color.indexOf('phc:') === 0) ? s.color : (!s.color ? 'phc:primary' : '');
    var hexColor = (!phcToken && s.color) ? s.color : '#2563EB';
    var badgeCol = phcToken ? ((typeof getCachedColor === 'function' && getCachedColor(phcToken.replace('phc:', '')) && getCachedColor(phcToken.replace('phc:', '')).background) || '#2563EB') : hexColor;
    var title = _mciEsc(s.name || s.field || ('Série ' + (i + 1)));
    var isOpen = i === 0;
    var phcOpts = ['primary', 'warning', 'success', 'danger', 'info'].map(function (pt) {
        return '<option value="phc:' + pt + '"' + (phcToken === 'phc:' + pt ? ' selected' : '') + '>PHC ' + pt.charAt(0).toUpperCase() + pt.slice(1) + '</option>';
    }).join('');
    var sType0 = s.serType || 'default';
    return '<div class="mcbi-sr' + (isOpen ? ' is-open' : '') + '" data-idx="' + i + '" data-stype="' + sType0 + '" data-sds="' + dsMode + '" style="border-left-color:' + badgeCol + '">'
        + '<div class="mcbi-sr-hd">'
        + '<span class="mcbi-sr-badge" style="background:' + badgeCol + '"></span>'
        + '<span class="mcbi-sr-idx">S' + (i + 1) + '</span>'
        + '<span class="mcbi-sr-title">' + title + '</span>'
        + '<div class="mcbi-sr-acts">'
        + '<button type="button" class="mcbi-sr-tog" title="Expandir/Colapsar"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,5 8,11 13,5"/></svg></button>'
        + '<button type="button" class="mcbi-del-s" title="Remover série"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>'
        + '</div>'
        + '</div>'
        + '<div class="mcbi-sr-body">'
        + dsSection
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo</label><select class="mcbi-sf form-control input-sm">' + fOpts + '</select></div>'
        + '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">Nome da série <small style="font-weight:400;color:#94a3b8;">(JS)</small></label>'
        + '<button type="button" class="btn btn-xs btn-default mcbi-sn-expand" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<textarea class="mcbi-sn mcbi-sn-expr form-control input-sm" rows="2" placeholder="ex: Vendas&#10;ou: &quot;Vendas &quot; + data[0].ano">' + _mciEsc(s.name || '') + '</textarea>'
        + '<div class="mcbi-sn-hint">Texto simples ou expressão JS — acesso a <code>data</code> (registos da série) e <code>Math</code>.</div>'
        + '</div>'
        + '</div>'
        + '<div class="mcbi-sr-adv mcbi-row2">'
        + '<div class="mcbi-field"><label>Tipo</label><select class="mcbi-st form-control input-sm">' + stOpts + '</select></div>'
        + '<div class="mcbi-field"><label>Grupo stack</label><input type="text" class="mcbi-sstack form-control input-sm" value="' + _mciEsc(s.stack || '') + '" placeholder="ex: total"></div>'
        + '</div>'
        + '<div class="mcbi-field mcbi-sr-color-row">'
        + '<label>Cor</label>'
        + '<select class="mcbi-sc-phc form-control input-sm"><option value="">— Personalizada —</option>' + phcOpts + '</select>'
        + '<input type="color" class="mcbi-sc"' + (phcToken ? ' style="display:none"' : '') + ' value="' + _mciColorInputValue(hexColor) + '">'
        + '</div>'
        + '<div class="mcbi-srs">'
        + '<div class="mcbi-srs-hd"><svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M2 4h12v1.5H2zM4 7.5h8V9H4zM6 11h4v1.5H6z"/></svg> Estilo da série</div>'
        + '<div class="mcbi-srs-general">'
        + '<div class="mcbi-row2" style="align-items:center">'
        + '<div class="mcbi-field" style="margin-bottom:0">' + _mciChkVal('mcbi-s-labels', 'Etiquetas', s.dataLabels === true) + '</div>'
        + '<div class="mcbi-field mcbi-s-labelcol-wrap" style="margin-bottom:0"><label>Cor etiqueta</label><input type="color" class="mcbi-s-labelcol" value="' + _mciColorInputValue(s.labelColor, '#ffffff') + '"></div>'
        + '</div>'
        + '<div class="mcbi-row2" style="align-items:center;margin-top:6px">'
        + '<div class="mcbi-field" style="margin-bottom:0">' + _mciChkVal('mcbi-s-legend', 'Na legenda', s.showInLegend !== false) + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="mcbi-srs-bar">'
        + '<div class="mcbi-row2" style="align-items:center">'
        + '<div class="mcbi-field" style="margin-bottom:0">' + _mciChkVal('mcbi-s-gradient', 'Gradiente', s.gradient !== false) + '</div>'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Raio bordas</label><input type="number" class="mcbi-s-br form-control input-sm" value="' + (s.borderRadius !== undefined ? s.borderRadius : '') + '" min="0" max="24" placeholder="Global"></div>'
        + '</div>'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Larg. barra %</label><input type="number" class="mcbi-s-bw form-control input-sm" value="' + (s.barWidth !== undefined ? s.barWidth : '') + '" min="10" max="100" placeholder="Auto"></div>'
        + '</div>'
        + '<div class="mcbi-srs-line">'
        + '<div class="mcbi-row2" style="align-items:center">'
        + '<div class="mcbi-field" style="margin-bottom:0">' + _mciChkVal('mcbi-s-smooth', 'Lin. suave', s.smooth !== false) + '</div>'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Espessura</label><input type="number" class="mcbi-s-lw form-control input-sm" value="' + (s.lineWidth !== undefined ? s.lineWidth : '') + '" min="1" max="10" placeholder="2.5" step="0.5"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Forma ponto</label><select class="mcbi-s-sym form-control input-sm"><option value="circle"' + (!s.symbol || s.symbol === 'circle' ? ' selected' : '') + '>Círculo</option><option value="rect"' + (s.symbol === 'rect' ? ' selected' : '') + '>Rect.</option><option value="roundRect"' + (s.symbol === 'roundRect' ? ' selected' : '') + '>Rect. arred.</option><option value="triangle"' + (s.symbol === 'triangle' ? ' selected' : '') + '>Triângulo</option><option value="diamond"' + (s.symbol === 'diamond' ? ' selected' : '') + '>Diamante</option><option value="none"' + (s.symbol === 'none' ? ' selected' : '') + '>Nenhum</option></select></div>'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Tam. ponto</label><input type="number" class="mcbi-s-lsz form-control input-sm" value="' + (s.lineSymbolSize !== undefined ? s.lineSymbolSize : '') + '" min="0" max="20" placeholder="7"></div>'
        + '</div>'
        + '<div class="mcbi-field mcbi-srs-area-only" style="margin-bottom:0"><label>Opac. área %</label><input type="number" class="mcbi-s-aopacity form-control input-sm" value="' + Math.round((s.areaOpacity !== undefined ? s.areaOpacity : 0.32) * 100) + '" min="0" max="100"></div>'
        + '</div>'
        + '<div class="mcbi-srs-scatter">'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Tam. símbolo</label><input type="number" class="mcbi-s-ssz form-control input-sm" value="' + (s.symbolSize || 10) + '" min="2" max="40"></div>'
        + '<div class="mcbi-field" style="margin-bottom:0"><label>Forma</label><select class="mcbi-s-sctsym form-control input-sm"><option value="circle"' + (!s.scatterSymbol || s.scatterSymbol === 'circle' ? ' selected' : '') + '>Círculo</option><option value="rect"' + (s.scatterSymbol === 'rect' ? ' selected' : '') + '>Rect.</option><option value="triangle"' + (s.scatterSymbol === 'triangle' ? ' selected' : '') + '>Triângulo</option><option value="diamond"' + (s.scatterSymbol === 'diamond' ? ' selected' : '') + '>Diamante</option></select></div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
}

function _mciRefreshFieldSelects($root, fields) {
    $root.find('.mcbi-xf').each(function () { _mciSetSelectFields($(this), fields, '-- campo --'); });
    $root.find('.mcbi-sr[data-sds="main"] .mcbi-sf, .mcbi-sr:not([data-sds]) .mcbi-sf').each(function () { _mciSetSelectFields($(this), fields, 'campo…'); });
    $root.find('.mcbi-pie-lf,.mcbi-pie-vf').each(function () { _mciSetSelectFields($(this), fields, '-- campo --'); });
    $root.find('.mcbi-radar-maxfield').each(function () { _mciSetSelectFields($(this), fields, '-- auto (calculado dos dados) --'); });
}

// Resolve rows para um gráfico com séries de fontes distintas.
// Recebe o cfg do gráfico e os rows já resolvidos da fonte principal (mainRows).
// Faz merge por xField de todos os dados adicionais das séries com datasource próprio.
// Devolve null se todas as séries usam a fonte principal (sem merge necessário).
function _mciResolveSeriesRows(cfg, mainRows) {
    var series = cfg && cfg.series;
    if (!series || !series.length) return null;
    var hasMixed = series.some(function (s) { return s.dataSource && s.dataSource.mode && s.dataSource.mode !== 'main'; });
    if (!hasMixed) return null;

    var xField = cfg.xField || '';
    var mergedMap = {};
    var orderedKeys = [];

    function _rawToRows(res) {
        if (!res || res.error || !res.columns || !res.rows) return [];
        return res.rows.map(function (r) { var o = {}; res.columns.forEach(function (c, i) { o[c] = r[i]; }); return o; });
    }
    function _addToMerge(rows, pickFields) {
        rows.forEach(function (r) {
            var xVal = r[xField];
            if (xVal === undefined || xVal === null) return;
            var key = String(xVal);
            if (!mergedMap[key]) { mergedMap[key] = {}; mergedMap[key][xField] = xVal; orderedKeys.push(key); }
            (pickFields || Object.keys(r)).forEach(function (c) { if (r[c] !== undefined) mergedMap[key][c] = r[c]; });
        });
    }

    // Seed with main rows covering all 'main' mode series fields + xField
    var mainFields = series.filter(function (s) { return !s.dataSource || s.dataSource.mode === 'main'; }).map(function (s) { return s.field; }).filter(Boolean);
    if (xField && mainFields.indexOf(xField) === -1) mainFields.push(xField);
    if (mainRows && mainRows.length) _addToMerge(mainRows, mainFields.length ? mainFields : null);

    // Per-series custom sources
    series.forEach(function (s) {
        if (!s.dataSource || s.dataSource.mode === 'main' || !s.field) return;
        var serRows = [];
        if (s.dataSource.mode === 'fonte') {
            var stamp = s.dataSource.fonteStamp;
            var fonte = stamp && (_mciGetFontes() || []).find(function (f) { return f.mdashfontestamp === stamp; });
            if (fonte && typeof MdashTransformBuilder !== 'undefined') {
                // Priority 1: user-configured transformation of this fonte
                if (s.dataSource.transformConfig) {
                    serRows = _rawToRows(MdashTransformBuilder.executeRaw(s.dataSource.transformConfig));
                }
                // Priority 2: lastResultscached
                if (!serRows.length && fonte.lastResultscached) {
                    try {
                        var lrc = JSON.parse(fonte.lastResultscached);
                        if (lrc && lrc.columns && lrc.rows) serRows = _rawToRows(lrc);
                        else if (Array.isArray(lrc) && lrc.length) serRows = lrc;
                    } catch (e) {}
                }
                // Priority 3: raw table scan
                if (!serRows.length && typeof mdashFonteTableName === 'function') {
                    var tbl = mdashFonteTableName(fonte);
                    if (tbl) serRows = _rawToRows(MdashTransformBuilder.executeRaw(MdashTransformBuilder.autoConfig(tbl, 'raw')));
                }
            }
        } else if (s.dataSource.mode === 'transform' && s.dataSource.transformConfig) {
            if (typeof MdashTransformBuilder !== 'undefined')
                serRows = _rawToRows(MdashTransformBuilder.executeRaw(s.dataSource.transformConfig));
        }
        if (serRows.length) _addToMerge(serRows, [xField, s.field].filter(Boolean));
    });

    return orderedKeys.map(function (k) { return mergedMap[k]; });
}

// ── Main inline render function (called by showObjectPropertiesEditor) ────────

// ── Modal de transformação genérico (reutilizável) ───────────────────────
// opts: { title, fonteName, fonte, objectType, modalId, hostId, config, schema, onSave }
function _mciOpenTransformModalFor(opts) {
    opts = opts || {};
    var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
    if (!MTB) { if (typeof alertify !== 'undefined') alertify.error('MdashTransformBuilder não disponível.', 4000); return; }
    var modalId = opts.modalId || 'mcbi-generic-transform-modal';
    var hostId = opts.hostId || (modalId + '-host');
    $('#' + modalId).remove();
    $(".modal-backdrop").remove();
    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
        + '<div class="modal-dialog" style="width:860px;max-width:96vw;margin:32px auto;">'
        + '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 24px 80px rgba(0,0,0,.24);">'
        + '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;background:#fff;border-bottom:1px solid rgba(0,0,0,.08);">'
        + '<i class="glyphicon glyphicon-filter" style="color:var(--md-primary,#5b8dee);font-size:15px;opacity:.9;"></i>'
        + '<span style="font-size:14px;font-weight:700;color:#1e293b;">' + _mciEsc(opts.title || 'Transformação') + '</span>'
        + (opts.fonteName ? '<span style="font-size:11px;color:#64748b;border-left:1px solid rgba(0,0,0,.1);padding-left:10px;margin-left:4px;">' + _mciEsc(opts.fonteName) + '</span>' : '')
        + '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar" style="margin-left:auto;font-size:20px;line-height:1;padding:2px 6px;opacity:.5;">&times;</button>'
        + '</div>'
        + '<div style="background:#f8fafc;overflow-y:auto;max-height:80vh;">'
        + '<div id="' + hostId + '" style="max-width:780px;margin:0 auto;padding:16px;"></div>'
        + '</div></div></div></div>';
    $('body').append(mHtml);
    var $modal = $('#' + modalId);
    var $host = $('#' + hostId);

    function renderBuilder(schema) {
        var cfg = opts.config ? JSON.parse(JSON.stringify(opts.config)) : null;
        var tbl = (opts.fonte && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(opts.fonte) : '';
        if (!cfg) {
            cfg = tbl ? MTB.autoConfig(tbl, opts.objectType || 'Object') : {
                sourceTable: tbl || '',
                mode: 'visual',
                columns: [],
                measures: [],
                filters: [],
                orderBy: [],
                limit: null,
                sqlFree: ''
            };
        } else if (tbl && !cfg.sourceTable) {
            cfg.sourceTable = tbl;
        }
        if (schema && schema.length && tbl && (!cfg.columns || !cfg.columns.length)) {
            cfg.sourceTable = tbl;
            cfg.columns = schema.map(function (s) {
                return { field: s.field, alias: '', aggregate: 'none', visible: true, type: s.type };
            });
        }
        $host.empty();
        MTB.render($host[0], {
            config: cfg,
            schema: (schema && schema.length) ? schema : undefined,
            fonte: opts.fonte || null,
            onSave: function (newT) {
                if (opts.fonte && opts.fonte.lastexecuted) newT.schemaSyncedAt = opts.fonte.lastexecuted;
                $modal.modal('hide');
                if (opts.onSave) opts.onSave(newT);
            },
            onCancel: function () { $modal.modal('hide'); }
        });
    }

    $modal.on('hidden.bs.modal', function () { $(this).remove(); });

    if (opts.fonte && typeof mdashEnsureSourceSchema === 'function') {
        $host.html('<div style="padding:48px 16px;text-align:center;color:#64748b;font-size:13px;">'
            + '<i class="glyphicon glyphicon-refresh" style="animation:mdspin 1s linear infinite;margin-right:6px;"></i>'
            + 'A detectar schema da fonte…</div>');
        if (!$('#mdspin-style').length) {
            $('head').append('<style id="mdspin-style">@keyframes mdspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>');
        }
        $modal.modal('show');
        mdashEnsureSourceSchema(opts.fonte, function (err, schema) {
            if (err && typeof console !== 'undefined') console.warn('[MDash] schema:', err.message || err);
            renderBuilder(schema && schema.length ? schema : (opts.schema || []));
        });
    } else {
        renderBuilder((opts.schema && opts.schema.length) ? opts.schema : []);
        $modal.modal('show');
    }
}


function renderChartPropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_MCHART_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var isSample = !obj.fontestamp;

    // ── Section bodies ──────────────────────────────────────────────────────

    // Dados
    var _hasTrans = !!(cfg.transformConfig && cfg.transformConfig.sourceTable);
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(cfg.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button>'
        + '</div>';

    // Tipo gráfico
    var sTipo = '<div class="mcbi-ct-grid3">'
        + (typeof MdashChartBuilder !== 'undefined' ? MdashChartBuilder.CHART_TYPES : []).map(function (ct) {
            return '<button type="button" class="mcbi-ct-btn' + (cfg.chartType === ct.type ? ' is-on' : '')
                + '" data-type="' + ct.type + '" title="' + ct.label + '">'
                + ct.svg + '<span>' + ct.label + '</span></button>';
        }).join('') + '</div>';

    // Campos
    // Helper: build <option> list with a selected item
    function _mciFieldOpts(cur, placeholder) {
        return '<option value="">' + (placeholder || '-- campo --') + '</option>'
            + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
    }
    // Initial values for pie/donut/funnel — support both old (labelField/valueField) and new (xField/series) formats
    var _pieLbl = cfg.xField || cfg.labelField || '';
    var _pieVal = (cfg.series && cfg.series[0] && cfg.series[0].field) || cfg.valueField || '';

    var sCampos =
        // ── UI para gráficos cartesianos (bar/line/area/mixed/scatter/bar_h) ────
        '<div class="mcbi-campos-cartesian">'
        + '<div class="mcbi-field"><label>Eixo X / Categoria</label>'
        + '<select class="mcbi-xf form-control input-sm">' + _mciFieldOpts(cfg.xField) + '</select></div>'
        + '<div class="mcbi-field mcbi-radar-max-wrap"><label>Campo Máximo do eixo (opcional)</label>'
        + '<select class="mcbi-radar-maxfield form-control input-sm">' + _mciFieldOpts(cfg.radarMaxField, '-- auto (calculado dos dados) --') + '</select>'
        + '<div class="mcbi-info">Só para Radar. Se definido, cada eixo usa o valor deste campo (nessa linha) como referência de 100%, em vez do máximo calculado automaticamente a partir dos valores das séries — útil quando os eixos têm escalas muito diferentes (ex: percentagens vs. contagens).</div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Séries</label>'
        + '<div class="mcbi-series">'
        + (cfg.series || []).map(function (s, i) { return _mciSerieRow(s, i, fields, fontes); }).join('')
        + '</div>'
        + '<button type="button" class="mcbi-add-s"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg> Adicionar série</button>'
        + '</div>'
        + '</div>'
        // ── UI para pizza / donut / funil ────────────────────────────────────────
        + '<div class="mcbi-campos-pie">'
        + '<div class="mcbi-field"><label>Campo do Rótulo (fatias)</label>'
        + '<select class="mcbi-pie-lf form-control input-sm">' + _mciFieldOpts(_pieLbl) + '</select></div>'
        + '<div class="mcbi-field"><label>Campo do Valor</label>'
        + '<select class="mcbi-pie-vf form-control input-sm">' + _mciFieldOpts(_pieVal) + '</select></div>'
        + '<div class="mcbi-field"><label>Paleta de cores</label><div class="mcbi-pie-palettes">'
        + (typeof MdashChartBuilder !== 'undefined' ? MdashChartBuilder.PIE_PALETTES : []).map(function (pp) {
            var paletteColors = pp.custom
                ? ((cfg.piePaletteCustom && cfg.piePaletteCustom.length) ? cfg.piePaletteCustom : ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'])
                : (pp.colors || (typeof MdashChartBuilder !== 'undefined' ? MdashChartBuilder.THEMES[cfg.theme || 'phclegacy'].colors : []));
            var swatches = paletteColors.slice(0, 6)
                .map(function (c) { return '<span style="background:' + c + '"></span>'; }).join('');
            return '<button type="button" class="mcbi-pp-btn' + ((cfg.piePalette || 'theme') === pp.key ? ' is-on' : '') + '" data-pp="' + pp.key + '" title="' + pp.name + '">'
                + '<span class="mcbi-pp-sw">' + swatches + '</span>'
                + '<em>' + pp.name + '</em></button>';
        }).join('')
        + '</div>'
        + '<div class="mcbi-custom-palette"' + (cfg.piePalette === 'custom' ? '' : ' style="display:none"') + '>'
        + '<label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#475569;display:block;margin:6px 0 4px;">Cores personalizadas</label>'
        + '<div class="mcbi-custom-colors">'
        + [0, 1, 2, 3, 4, 5].map(function (ci) { var cv = _mciColorInputValue(cfg.piePaletteCustom && cfg.piePaletteCustom[ci]); return '<input type="color" class="mcbi-custom-c" data-ci="' + ci + '" value="' + cv + '">'; }).join('')
        + '</div></div>'
        + '</div>'
        + '</div>';

    // Estilo
    var sEstilo = '<div class="mcbi-field"><label>Tema</label><div class="mcbi-themes">'
        + (typeof MdashChartBuilder !== 'undefined' ? Object.keys(MdashChartBuilder.THEMES) : []).map(function (k) {
            var th = MdashChartBuilder.THEMES[k];
            return '<button type="button" class="mcbi-th-btn' + (cfg.theme === k ? ' is-on' : '') + '" data-theme="' + k + '" title="' + th.name + '">'
                + th.swatch.map(function (c) { return '<span style="background:' + c + '"></span>'; }).join('')
                + '<em>' + th.name + '</em></button>';
        }).join('') + '</div></div>'
        + '<div class="mcbi-field"><label>Altura: <strong class="mcbi-h-lbl">' + (cfg.height || 320) + '</strong> px</label>'
        + '<input type="range" class="mcbi-height" min="50" max="800" step="10" value="' + (cfg.height || 320) + '"></div>';

    // Configurações Gerais (stack, toolbox, legendas, título, etiquetas, animações)
    var sGeral =
        // ── Comportamento das séries ────────────────────────
        '<div class="mcbi-srs-divider">Séries &amp; Visualização</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mcbi-stacked', 'Empilhado — barras em cima das outras', cfg.stacked)
        + '</div>'
        + '<div class="mcbi-srs-divider" style="margin-top:8px">Ferramentas do gráfico</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mcbi-toolbox', 'Mostrar ferramentas (linha / barra / stack / guardar imagem)', cfg.toolbox !== false)
        + '</div>'
        // ── Legenda ─────────────────────────────────────────
        + '<div class="mcbi-srs-divider" style="margin-top:8px">Legenda</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field">' + _mciChk('mcbi-legend', 'Mostrar legenda', cfg.legend && cfg.legend.show !== false) + '</div>'
        + '<div class="mcbi-field"><label>Posição</label><select class="mcbi-legend-pos form-control input-sm">'
        + '<option value="top"' + ((cfg.legend && cfg.legend.position) === 'top' ? ' selected' : '') + '>Cima</option>'
        + '<option value="bottom"' + ((cfg.legend && cfg.legend.position) === 'bottom' ? ' selected' : '') + '>Baixo</option>'
        + '<option value="none"' + ((cfg.legend && cfg.legend.position) === 'none' ? ' selected' : '') + '>Nenhuma</option>'
        + '</select></div></div>'
        // ── Título ──────────────────────────────────────────
        + '<div class="mcbi-srs-divider" style="margin-top:8px">Título</div>'
        + '<div class="mcbi-field">'
        + _mciChk('mcbi-title-show', 'Mostrar título', cfg.title && cfg.title.show)
        + '<input type="text" class="mcbi-title-text form-control input-sm" value="' + _mciEsc((cfg.title && cfg.title.text) || '') + '" placeholder="Texto do título" style="margin-top:6px;"></div>'
        // ── Dados & Animações ───────────────────────────────
        + '<div class="mcbi-srs-divider" style="margin-top:8px">Dados &amp; Apresentação</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mcbi-labels', 'Etiquetas de dados (global)', cfg.dataLabels)
        + _mciChk('mcbi-anim', 'Animações', cfg.animation !== false)
        + '</div>';

    // Eixos
    var sEixos = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Rot. labels X°</label>'
        + '<input type="number" class="mcbi-xrot form-control input-sm" value="' + ((cfg.xAxis && cfg.xAxis.rotate) || 0) + '" min="-90" max="90"></div>'
        + '<div class="mcbi-field"><label>Intervalo labels</label>'
        + '<select class="mcbi-xinterval form-control input-sm">'
        + [['auto', 'Auto'], ['0', 'Todas'], ['1', 'Alt 1'], ['2', 'Alt 2']].map(function (o) { return '<option value="' + o[0] + '"' + ((cfg.xAxis && cfg.xAxis.interval) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('')
        + '</select></div></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Nome eixo X</label>'
        + '<input type="text" class="mcbi-xname form-control input-sm" value="' + _mciEsc((cfg.xAxis && cfg.xAxis.name) || '') + '" placeholder="ex: Mês"></div>'
        + '<div class="mcbi-field"><label>Nome eixo Y</label>'
        + '<input type="text" class="mcbi-yname form-control input-sm" value="' + _mciEsc((cfg.yAxis && cfg.yAxis.name) || '') + '" placeholder="ex: Valor (€)"></div>'
        + '</div>'
        + '<div class="mcbi-field" style="margin-top:2px;">'
        + _mciChk('mcbi-yshow', 'Mostrar eixo Y', !cfg.yAxis || cfg.yAxis.show !== false)
        + '<div style="margin-top:6px">' + _mciChk('mcbi-yabbrev', 'Abreviar valores (ex: 15M)', !!(cfg.yAxis && cfg.yAxis.abbrev)) + '</div>'
        + '</div>';

    // ── Assemble HTML ───────────────────────────────────────────────────────
    var h = '<div class="mcbi-root" data-stamp="' + stamp + '" data-ct="' + (cfg.chartType || 'bar') + '">'
        + (isSample ? '<div class="mcbi-sample-label"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra — configure a fonte</div>' : '')
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('tipo', 'Tipo de Gráfico', 'glyphicon-stats', true, sTipo)
        + _mciSection('geral', 'Configurações Gerais', 'glyphicon-cog', false, sGeral)
        + _mciSection('eixos', 'Eixos', 'glyphicon-resize-horizontal', false, sEixos)
        + _mciSection('campos', 'Campos', 'glyphicon-list-alt', true, sCampos)
        + _mciSection('estilo', 'Estilo', 'glyphicon-tint', false, sEstilo)
        + '</div>';

    // Save which sections are currently open (for re-render stability)
    var _openSecs = {};
    panel.find('[data-sec]').each(function () { _openSecs[$(this).data('sec')] = $(this).closest('.mcbi-section').hasClass('is-open'); });

    panel.html(h + _mciCSS());

    // Init per-series DS transform configs from existing saved config
    panel.find('.mcbi-sr').each(function (i) {
        var s = (cfg.series || [])[i];
        if (s && s.dataSource && s.dataSource.mode === 'transform' && s.dataSource.transformConfig) {
            $(this).data('seriesTransformConfig', s.dataSource.transformConfig);
        }
    });

    // Restore section open states (no-op on first render; preserves state on re-renders)
    panel.find('[data-sec]').each(function () {
        var id = $(this).data('sec');
        if (_openSecs[id] !== undefined) {
            var $sec = $(this).closest('.mcbi-section');
            $sec.toggleClass('is-open', _openSecs[id]);
            $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', _openSecs[id]).toggleClass('glyphicon-chevron-down', !_openSecs[id]);
        }
    });

    // ── Events ─────────────────────────────────────────────────────────────
    var _mciTimer = null;
    // Expor timer no painel para que possa ser cancelado quando o painel é destruído
    panel.data('_mciTimer', null);
    function fire() {
        clearTimeout(_mciTimer);
        _mciTimer = setTimeout(function () {
            // Guard: se o DOM do editor já não existe (ex: user mudou para slot), não ler config vazia
            if (!panel.find('.mcbi-ct-btn').length) { _mciTimer = null; panel.removeData('_mciTimer'); return; }
            var newCfg = _mciReadConfig(panel, obj);
            obj.config = newCfg;
            obj.transformConfig = newCfg.transformConfig;
            // Sincronizar a invariante triplicada antes de persistir
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
            _mciTimer = null;
            panel.removeData('_mciTimer');
        }, 300);
        panel.data('_mciTimer', _mciTimer);
    }

    // ── Transform Builder — abre num modal dedicado ────────────────────────
    var _mciTransformInited = false;

    function _mciOpenTransformModal() {
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';
        var modalId = 'mcbi-transform-modal';
        $('#' + modalId).remove();
        _mciTransformInited = false;

        var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
            + '<div class="modal-dialog" style="width:860px;max-width:96vw;margin:32px auto;">'
            + '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 24px 80px rgba(0,0,0,.24);">'
            + '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;background:#fff;border-bottom:1px solid rgba(0,0,0,.08);">'
            + '<i class="glyphicon glyphicon-filter" style="color:var(--md-primary,#5b8dee);font-size:15px;opacity:.9;"></i>'
            + '<span style="font-size:14px;font-weight:700;color:#1e293b;">Transformação de Dados</span>'
            + (_tFntName ? '<span style="font-size:11px;color:#64748b;border-left:1px solid rgba(0,0,0,.1);padding-left:10px;margin-left:4px;">' + _mciEsc(_tFntName) + '</span>' : '')
            + '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar" style="margin-left:auto;font-size:20px;line-height:1;padding:2px 6px;opacity:.5;">&times;</button>'
            + '</div>'
            + '<div style="background:#f8fafc;overflow-y:auto;max-height:80vh;">'
            + '<div id="mcbi-transform-modal-host" style="max-width:780px;margin:0 auto;padding:16px;"></div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        $('body').append(mHtml);
        var $modal = $('#' + modalId);
        $modal.modal('show');
        $modal.on('shown.bs.modal', function () { _mciInitTransform(); });
        $modal.on('hidden.bs.modal', function () { $(this).remove(); _mciTransformInited = false; });
    }

    function _mciInitTransform() {
        if (_mciTransformInited) return;
        var MTB = window.MdashTransformBuilder
            || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) {
            if (typeof alertify !== 'undefined') {
                alertify.error('DATA SOURCE Operations.js não está carregado. Activa o script no PHC para utilizar transformações.', 6000);
            }
            return;
        }
        _mciTransformInited = true;
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';

        var _tCfgRaw = obj.transformConfig || cfg.transformConfig || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'Gráfico') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'Gráfico',
            modalId: 'mcbi-transform-modal',
            hostId: 'mcbi-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                // Atualizar apenas as localizações fundamentais
                obj.transformConfig = newT;
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                // Sincronizar a invariante triplicada antes de persistir
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                _mciRefreshFieldSelects(panel, _mciGetFields(obj));
                fire();
            }
        });
    }

    // ── Transformação por série ──────────────────────────────────────────────
    function _mciOpenSeriesTransformModal($sr) {
        var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) { if (typeof alertify !== 'undefined') alertify.error('MdashTransformBuilder não disponível.', 4000); return; }
        var existingTCfg = $sr.data('seriesTransformConfig') || null;
        var _sFonteStamp = $sr.find('.mcbi-s-ds-fonte').val() || obj.fontestamp;
        var _sFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === _sFonteStamp; });
        var _sName = (_sFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_sFnt) : '';
        var _sFntName = (_sFnt && (_sFnt.descricao || _sFnt.codigo)) || '';
        var _tConf = existingTCfg || (_sName ? MTB.autoConfig(_sName, 'Série') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });

        _mciOpenTransformModalFor({
            title: 'Transformação da Série',
            fonteName: _sFntName,
            fonte: _sFnt || null,
            objectType: 'Série',
            modalId: 'mcbi-sr-transform-modal',
            hostId: 'mcbi-sr-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                $sr.data('seriesTransformConfig', newT);
                $sr.find('.mcbi-s-ds-trans-lbl').text(newT.sourceTable || 'SQL');
                $sr.find('.mcbi-s-ds-edit-trans').html('<i class="glyphicon glyphicon-pencil"></i> Editar transf.');
                var outFields = (newT.transformationSchema && newT.transformationSchema.length)
                    ? newT.transformationSchema
                    : (MTB.getOutputSchema ? MTB.getOutputSchema(newT) : []);
                if (outFields && outFields.length) {
                    _mciSetSelectFields($sr.find('.mcbi-sf'), outFields, 'campo…');
                }
                _mciRefreshXField(panel, obj);
                fire();
            }
        });
    }

    // ── xField helpers ───────────────────────────────────────────────────────
    function _mciGetAllFields(panel, obj) {
        var mainFields = _mciGetFields(obj);
        var seen = {};
        mainFields.forEach(function (f) { seen[f] = true; });
        var extra = [];
        panel.find('.mcbi-sr').each(function () {
            var $sr = $(this);
            var mode = $sr.attr('data-sds') || 'main';
            if (mode === 'main') return;
            var tCfg = $sr.data('seriesTransformConfig');
            if (tCfg && typeof MdashTransformBuilder !== 'undefined') {
                var outF = (tCfg.transformationSchema && tCfg.transformationSchema.length) ? tCfg.transformationSchema
                    : (MdashTransformBuilder.getOutputSchema ? MdashTransformBuilder.getOutputSchema(tCfg) : []);
                (outF || []).forEach(function (f) { if (!seen[f]) { seen[f] = true; extra.push(f); } });
            } else if (mode === 'fonte' && typeof MdashTransformBuilder !== 'undefined' && typeof mdashFonteTableName === 'function') {
                var stamp = $sr.find('.mcbi-s-ds-fonte').val();
                var fo = stamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === stamp; });
                if (fo) {
                    var tblF = MdashTransformBuilder.getTableSchema(mdashFonteTableName(fo)).map(function (s) { return s.field; });
                    tblF.forEach(function (f) { if (!seen[f]) { seen[f] = true; extra.push(f); } });
                }
            }
        });
        return mainFields.concat(extra);
    }

    function _mciRefreshXField(panel, obj) {
        var curXF = panel.find('.mcbi-xf').val();
        var allFields = _mciGetAllFields(panel, obj);
        panel.find('.mcbi-xf').html('<option value="">-- campo X --</option>'
            + allFields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (curXF === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join(''));
    }

    panel.off(); // Limpar TODOS os handlers (incluindo de outros tipos de objetos)

    panel.on('click.mcbi', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });

    panel.on('click.mcbi', '.mcbi-btn-transform', function () {
        _mciOpenTransformModal();
    });

    panel.on('click.mcbi', '.mcbi-ct-btn', function () {
        panel.find('.mcbi-ct-btn').removeClass('is-on'); $(this).addClass('is-on');
        panel.find('.mcbi-root').attr('data-ct', $(this).data('type') || 'bar');
        fire();
    });

    panel.on('click.mcbi', '.mcbi-th-btn', function () {
        panel.find('.mcbi-th-btn').removeClass('is-on'); $(this).addClass('is-on'); fire();
    });

    panel.on('click.mcbi', '.mcbi-pp-btn', function () {
        panel.find('.mcbi-pp-btn').removeClass('is-on'); $(this).addClass('is-on');
        panel.find('.mcbi-custom-palette').toggle($(this).data('pp') === 'custom');
        fire();
    });

    panel.on('click.mcbi', '.mcbi-add-s', function () {
        var $series = panel.find('.mcbi-series');
        $series.append(_mciSerieRow({ field: '', name: '', color: '' }, $series.find('.mcbi-sr').length, _mciGetFields(obj), _mciGetFontes(obj)));
        $series.find('.mcbi-sr').last().addClass('is-open');
        fire();
    });

    panel.on('click.mcbi', '.mcbi-del-s', function (e) { e.stopPropagation(); $(this).closest('.mcbi-sr').remove(); fire(); });

    // ── Fonte por série ────────────────────────────────────────────────────
    panel.on('click.mcbi', '.mcbi-s-ds-btn', function (e) {
        e.stopPropagation();
        var $sr = $(this).closest('.mcbi-sr');
        $sr.find('.mcbi-s-ds-btn').removeClass('is-on');
        $(this).addClass('is-on');
        var mode = $(this).data('ds');
        $sr.attr('data-sds', mode);
        $sr.find('.mcbi-s-ds-fonte').toggle(mode === 'fonte');
        $sr.find('.mcbi-s-ds-trans').toggle(mode === 'transform' || mode === 'fonte');
        // Refresh field select for this series based on newly selected mode
        if (mode === 'transform' || mode === 'fonte') {
            var tCfg = $sr.data('seriesTransformConfig');
            if (tCfg && typeof MdashTransformBuilder !== 'undefined') {
                var outF = (tCfg.transformationSchema && tCfg.transformationSchema.length) ? tCfg.transformationSchema : MdashTransformBuilder.getOutputSchema(tCfg);
                if (outF && outF.length) _mciSetSelectFields($sr.find('.mcbi-sf'), outF, 'campo…');
            } else if (mode === 'fonte') {
                var fStamp = $sr.find('.mcbi-s-ds-fonte').val();
                var _fo = fStamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fStamp; });
                var _fl = _fo ? _mciGetFonteSchema(_fo).map(function (s) { return s.field; }) : [];
                if (_fl.length) _mciSetSelectFields($sr.find('.mcbi-sf'), _fl, 'campo…');
            }
        } else {
            _mciSetSelectFields($sr.find('.mcbi-sf'), _mciGetFields(obj), 'campo…');
        }
        _mciRefreshXField(panel, obj);
        fire();
    });
    panel.on('change.mcbi', '.mcbi-s-ds-fonte', function () {
        var $sr = $(this).closest('.mcbi-sr');
        var stamp = $(this).val();
        // Reset series transform config when fonte changes (it was tied to old fonte)
        $sr.data('seriesTransformConfig', null);
        $sr.find('.mcbi-s-ds-trans-lbl').text('');
        $sr.find('.mcbi-s-ds-edit-trans').html('<i class="glyphicon glyphicon-plus"></i> Config. transf.');
        if (stamp) {
            var _fo = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === stamp; });
            if (_fo && typeof mdashEnsureSourceSchema === 'function') {
                mdashEnsureSourceSchema(_fo, function (err, schema) {
                    var _fl = (schema || []).map(function (s) { return s.field; });
                    if (_fl.length) _mciSetSelectFields($sr.find('.mcbi-sf'), _fl, 'campo…');
                });
            } else if (_fo) {
                var _fl = _mciGetFonteSchema(_fo).map(function (s) { return s.field; });
                if (_fl.length) _mciSetSelectFields($sr.find('.mcbi-sf'), _fl, 'campo…');
            }
        }
        _mciRefreshXField(panel, obj);
        fire();
    });
    panel.on('click.mcbi', '.mcbi-s-ds-edit-trans', function (e) {
        e.stopPropagation();
        _mciOpenSeriesTransformModal($(this).closest('.mcbi-sr'));
    });

    panel.on('click.mcbi', '.mcbi-sr-hd', function () {
        $(this).closest('.mcbi-sr').toggleClass('is-open');
    });

    panel.on('change.mcbi', '.mcbi-sc-phc', function () {
        var $sr = $(this).closest('.mcbi-sr');
        var $sc = $sr.find('.mcbi-sc');
        var phcVal = $(this).val();
        if (phcVal) {
            $sc.hide();
            var phcType = phcVal.replace('phc:', '');
            var badgeColor = (typeof getCachedColor === 'function' && getCachedColor(phcType) && getCachedColor(phcType).background) || '#2563EB';
            $sr.find('.mcbi-sr-badge').css('background', badgeColor);
        } else {
            $sc.show();
            $sr.find('.mcbi-sr-badge').css('background', $sc.val());
        }
        fire();
    });

    panel.on('input.mcbi change.mcbi', '.mcbi-sn,.mcbi-sf', function () {
        var $sr = $(this).closest('.mcbi-sr');
        var nm = $sr.find('.mcbi-sn').val().trim();
        var fl = $sr.find('.mcbi-sf').val();
        var idx = $sr.closest('.mcbi-series').find('.mcbi-sr').index($sr) + 1;
        $sr.find('.mcbi-sr-title').text(nm || fl || ('Série ' + idx));
        fire();
    });

    panel.on('click.mcbi', '.mcbi-sn-expand', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $sr = $(this).closest('.mcbi-sr');
        var $ta = $sr.find('.mcbi-sn');
        _mciOpenExprEditorModal($ta.val(), function (newVal) {
            $ta.val(newVal).trigger('input').trigger('change');
        }, {
            title: 'Nome da série',
            help: 'objecto <code>data</code> (registos da série) disponível — texto simples ou expressão JS'
        });
    });

    panel.on('input.mcbi', 'input[type=color]', function () {
        var $sr = $(this).closest('.mcbi-sr');
        if ($sr.length) {
            $sr.find('.mcbi-sr-badge').css('background', $(this).val());
            if ($(this).hasClass('mcbi-sc')) $sr.find('.mcbi-sc-phc').val('');
        }
    });

    panel.on('input.mcbi', '.mcbi-height', function () {
        panel.find('.mcbi-h-lbl').text($(this).val()); fire();
    });

    panel.on('change.mcbi', '.mcbi-fonte', function () {
        var fs = $(this).val();
        _mciTransformInited = false;
        if (fs) {
            panel.find('.mcbi-sample-label').hide();
            _mciOnFonteSelected(fs, obj, panel, function () {
                _mciRefreshFieldSelects(panel, _mciGetFields(obj));
                _mciRefreshXField(panel, obj);
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                fire();
            });
        } else {
            obj.fontestamp = '';
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
            _mciRefreshFieldSelects(panel, _mciGetFields(obj));
            _mciRefreshXField(panel, obj);
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            fire();
        }
    });

    panel.on('change.mcbi', '.mcbi-st', function () {
        var $sr = $(this).closest('.mcbi-sr');
        $sr.attr('data-stype', $(this).val() || 'default');
    });

    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
    });
    panel.on('change.mcbi input.mcbi', 'select:not(.mcbi-fonte):not(.mcbi-s-ds-fonte), input:not([type=range]):not([type=color])', function () { fire(); });
    panel.on('change.mcbi', 'input[type=color]', function () { fire(); });
}

// ── CSS for inline chart editor ───────────────────────────────────────────────
function _mciCSS() {
    _mciInitPropsCheckboxToggles();
    if ($('#mcbi-styles-v15').length) return '';
    $('#mcbi-styles-v14,#mcbi-styles-v13,#mcbi-styles-v12,#mcbi-styles-v11,#mcbi-styles-v10,#mcbi-styles-v9').remove();
    var s = '<style id="mcbi-styles-v15">';
    // Root
    s += '.mcbi-root{padding:0 0 16px;font-size:12px;background:transparent;color:#1e293b;}';
    // Sample badge
    s += '.mcbi-sample-label{font-size:9.5px;color:#64748b;background:rgba(243,246,251,.95);padding:3px 10px 4px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:4px;}';
    // Sections
    s += '.mcbi-section{border-bottom:1px solid rgba(0,0,0,.06);}';
    s += '.mcbi-section-hd{display:flex;align-items:center;gap:7px;padding:9px 14px;cursor:pointer;user-select:none;font-size:10.5px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:.6px;transition:background .15s;}';
    s += '.mcbi-section-hd:hover{background:rgba(0,0,0,.03);}';
    s += '.mcbi-section-hd i{color:var(--md-primary,#5b8dee);opacity:.85;font-size:11px;}';
    s += '.mcbi-section-hd .mcbi-chev{margin-left:auto;font-size:9px;color:rgba(0,0,0,.28);}';
    s += '.mcbi-section-bd{display:none;padding:10px 14px 14px;}';
    s += '.mcbi-section.is-open .mcbi-section-bd{display:block;}';
    // Field labels
    s += '.mcbi-field{margin-bottom:9px;}';
    s += '.mcbi-field>label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#475569;display:block;margin-bottom:4px;}';
    // Inputs / selects
    s += '.mcbi-field .form-control{background:#fff !important;border:1px solid rgba(0,0,0,.12) !important;color:#1e293b !important;font-size:11.5px;border-radius:6px;}';
    s += '.mcbi-field .form-control:focus{border-color:var(--md-primary,#5b8dee) !important;box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.15) !important;outline:none;}';
    // Chart type grid
    s += '.mcbi-ct-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;}';
    s += '.mcbi-ct-btn{border:1.5px solid rgba(0,0,0,.1);border-radius:8px;background:#fff;padding:8px 3px 6px;cursor:pointer;transition:all .15s;text-align:center;color:#475569;display:flex;flex-direction:column;align-items:center;gap:3px;box-shadow:0 1px 3px rgba(0,0,0,.05);}';
    s += '.mcbi-ct-btn svg{width:22px;height:22px;display:block;}';
    s += '.mcbi-ct-btn span{font-size:9.5px;line-height:1.2;margin-top:2px;color:#64748b;}';
    s += '.mcbi-ct-btn:hover{border-color:var(--md-primary,#5b8dee);color:var(--md-primary,#5b8dee);background:rgba(var(--md-primary-rgb,91,141,238),.05);}';
    s += '.mcbi-ct-btn.is-on{border-color:var(--md-primary,#5b8dee);background:rgba(var(--md-primary-rgb,91,141,238),.1);color:var(--md-primary,#5b8dee);box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.18);}';
    s += '.mcbi-ct-btn.is-on span{color:var(--md-primary,#5b8dee);}';
    // Themes
    s += '.mcbi-themes{display:flex;flex-wrap:wrap;gap:5px;}';
    s += '.mcbi-th-btn{border:1.5px solid rgba(0,0,0,.1);border-radius:8px;background:#fff;padding:4px 7px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:3px;box-shadow:0 1px 3px rgba(0,0,0,.05);}';
    s += '.mcbi-th-btn span{display:inline-block;width:9px;height:9px;border-radius:50%;}';
    s += '.mcbi-th-btn em{font-style:normal;font-size:10px;color:#475569;margin-left:2px;}';
    s += '.mcbi-th-btn:hover{border-color:var(--md-primary,#5b8dee);}';
    s += '.mcbi-th-btn.is-on{border-color:var(--md-primary,#5b8dee);background:rgba(var(--md-primary-rgb,91,141,238),.1);box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.18);}';
    s += '.mcbi-th-btn.is-on em{color:var(--md-primary,#5b8dee);}';
    // Series container
    s += '.mcbi-series{display:flex;flex-direction:column;gap:7px;margin-top:6px;}';
    // Series card
    s += '.mcbi-sr{border:1px solid rgba(0,0,0,.09);border-left:3px solid #cbd5e1;border-radius:10px;background:#fff;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.06);transition:box-shadow .15s;}';
    s += '.mcbi-sr:hover{box-shadow:0 3px 12px rgba(0,0,0,.1);}';
    // Series card header — entire header is clickable
    s += '.mcbi-sr-hd{display:flex;align-items:center;gap:8px;padding:9px 10px 9px 11px;cursor:pointer;user-select:none;border-bottom:1px solid transparent;transition:background .12s;}';
    s += '.mcbi-sr-hd:hover{background:rgba(0,0,0,.025);}';
    s += '.mcbi-sr.is-open>.mcbi-sr-hd{border-bottom-color:rgba(0,0,0,.07);background:rgba(0,0,0,.018);}';
    // Color badge with ring
    s += '.mcbi-sr-badge{width:12px;height:12px;border-radius:50%;flex-shrink:0;display:inline-block;box-shadow:0 0 0 2px #fff,0 0 0 3.5px rgba(0,0,0,.12);}';
    // Index pill
    s += '.mcbi-sr-idx{font-size:9px;font-weight:800;letter-spacing:.4px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:20px;line-height:14px;flex-shrink:0;}';
    // Series title
    s += '.mcbi-sr-title{flex:1;min-width:0;font-size:12px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}';
    // Action buttons container
    s += '.mcbi-sr-acts{display:flex;align-items:center;gap:2px;flex-shrink:0;}';
    // Toggle button — SVG chevron rotates via CSS
    s += '.mcbi-sr-tog{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#94a3b8;border-radius:7px;cursor:pointer;padding:0;transition:all .15s;}';
    s += '.mcbi-sr-tog:hover{background:rgba(0,0,0,.07);color:#475569;}';
    s += '.mcbi-sr-tog svg{transition:transform .2s ease;display:block;}';
    s += '.mcbi-sr.is-open>.mcbi-sr-hd .mcbi-sr-tog svg{transform:rotate(180deg);}';
    // Delete button
    s += '.mcbi-del-s{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;color:#94a3b8;border-radius:7px;cursor:pointer;padding:0;transition:all .15s;}';
    s += '.mcbi-del-s:hover{background:rgba(239,68,68,.1);color:#ef4444;}';
    // Series body (collapsible)
    s += '.mcbi-sr-body{display:none;padding:11px 12px 10px;}';
    s += '.mcbi-sr.is-open>.mcbi-sr-body{display:block;}';
    // Inputs inside series body
    s += '.mcbi-sf,.mcbi-sn,.mcbi-st,.mcbi-sstack{width:100%;background:#fff !important;border:1px solid rgba(0,0,0,.12) !important;color:#1e293b !important;border-radius:6px;font-size:11.5px;}';
    s += '.mcbi-sf:focus,.mcbi-sn:focus,.mcbi-st:focus,.mcbi-sstack:focus{border-color:var(--md-primary,#5b8dee) !important;box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.15) !important;outline:none;}';
    s += 'textarea.mcbi-sn{font-family:ui-monospace,Consolas,monospace;line-height:1.45;resize:vertical;padding:6px 8px;}';
    s += '.mcbi-sn-hint{font-size:9.5px;color:#94a3b8;line-height:1.5;margin-top:4px;}';
    s += '.mcbi-sn-hint code{background:rgba(0,0,0,.05);padding:0 3px;border-radius:3px;}';
    // Color row inside series
    s += '.mcbi-sr-color-row{display:flex;align-items:center;gap:10px;margin-bottom:0 !important;}';
    s += '.mcbi-sr-color-row>label{margin-bottom:0 !important;flex-shrink:0;}';
    s += '.mcbi-sc{width:34px;height:26px;padding:1px 2px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;}';
    // Series styles subsection
    s += '.mcbi-srs{margin-top:10px;padding-top:9px;border-top:1px dashed rgba(0,0,0,.09);}';
    s += '.mcbi-srs-hd{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#94a3b8;display:flex;align-items:center;gap:5px;margin-bottom:8px;}';
    s += '.mcbi-srs-hd svg{opacity:.7;}';
    // All subsection blocks hidden by default
    s += '.mcbi-srs-bar,.mcbi-srs-line,.mcbi-srs-scatter{display:none;}';
    // Explicit series type
    s += '.mcbi-sr[data-stype="bar"] .mcbi-srs-bar{display:block;}';
    s += '.mcbi-sr[data-stype="line"] .mcbi-srs-line{display:block;}';
    s += '.mcbi-sr[data-stype="area"] .mcbi-srs-line{display:block;}';
    s += '.mcbi-sr[data-stype="scatter"] .mcbi-srs-scatter{display:block;}';
    // area-opacity field: only for area type
    s += '.mcbi-srs-area-only{display:none;}';
    s += '.mcbi-sr[data-stype="area"] .mcbi-srs-area-only{display:block;}';
    s += '.mcbi-root[data-ct="area"] .mcbi-sr[data-stype="default"] .mcbi-srs-area-only{display:block;}';
    // Default series type inherits from chart type
    s += '.mcbi-root[data-ct="bar"] .mcbi-sr[data-stype="default"] .mcbi-srs-bar{display:block;}';
    s += '.mcbi-root[data-ct="bar_h"] .mcbi-sr[data-stype="default"] .mcbi-srs-bar{display:block;}';
    s += '.mcbi-root[data-ct="mixed"] .mcbi-sr[data-stype="default"] .mcbi-srs-bar,.mcbi-root[data-ct="mixed"] .mcbi-sr[data-stype="default"] .mcbi-srs-line{display:block;}';
    s += '.mcbi-root[data-ct="line"] .mcbi-sr[data-stype="default"] .mcbi-srs-line{display:block;}';
    s += '.mcbi-root[data-ct="area"] .mcbi-sr[data-stype="default"] .mcbi-srs-line{display:block;}';
    s += '.mcbi-root[data-ct="scatter"] .mcbi-sr[data-stype="default"] .mcbi-srs-scatter{display:block;}';
    // Hide styles sub for pie/donut/funnel
    s += '.mcbi-root[data-ct="pie"] .mcbi-srs,.mcbi-root[data-ct="donut"] .mcbi-srs,.mcbi-root[data-ct="funnel"] .mcbi-srs{display:none;}';
    // General series styles row (always visible when .mcbi-srs is shown)
    s += '.mcbi-srs-general{display:block;margin-bottom:6px;padding-bottom:6px;border-bottom:1px dashed rgba(0,0,0,.07);}';
    // Label color input size
    s += '.mcbi-s-labelcol{width:36px;height:26px;padding:1px 2px;cursor:pointer;border-radius:4px;border:1px solid #d1d5db;}';
    // Advanced row hidden for chart types that don\'t need it
    s += '.mcbi-root[data-ct="pie"] .mcbi-sr-adv,.mcbi-root[data-ct="donut"] .mcbi-sr-adv,.mcbi-root[data-ct="funnel"] .mcbi-sr-adv,.mcbi-root[data-ct="bar_h"] .mcbi-sr-adv,.mcbi-root[data-ct="scatter"] .mcbi-sr-adv{display:none !important;}';
    // Hide add-series for single-series chart types
    s += '.mcbi-root[data-ct="pie"] .mcbi-add-s,.mcbi-root[data-ct="donut"] .mcbi-add-s,.mcbi-root[data-ct="funnel"] .mcbi-add-s{display:none !important;}';
    // Campo sections: cartesian vs pie toggle
    s += '.mcbi-campos-cartesian{display:block;}.mcbi-campos-pie{display:none;}';
    s += '.mcbi-root[data-ct="pie"] .mcbi-campos-pie,.mcbi-root[data-ct="donut"] .mcbi-campos-pie,.mcbi-root[data-ct="funnel"] .mcbi-campos-pie{display:block !important;}';
    s += '.mcbi-root[data-ct="pie"] .mcbi-campos-cartesian,.mcbi-root[data-ct="donut"] .mcbi-campos-cartesian,.mcbi-root[data-ct="funnel"] .mcbi-campos-cartesian{display:none !important;}';
    // Campo de máximo por eixo — só faz sentido para radar (outros tipos escondem-no)
    s += '.mcbi-radar-max-wrap{display:none;}';
    s += '.mcbi-root[data-ct="radar"] .mcbi-radar-max-wrap{display:block;}';
    // Toggle-switch checkboxes (immune to host-app CSS overrides)
    s += '.mcbi-checks{display:grid;grid-template-columns:1fr 1fr;gap:7px 10px;margin-bottom:8px;}';
    s += '.mcbi-chk{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#1e293b;cursor:pointer;margin:0;font-weight:500;line-height:1;user-select:none;position:relative;}';
    s += '.mcbi-chk input[type=checkbox]{position:absolute;opacity:0;width:0;height:0;pointer-events:none;left:0;top:50%;margin:0;padding:0;border:0;overflow:hidden;clip:rect(0,0,0,0);}';
    s += '.mcbi-tog{width:28px;height:16px;min-width:28px;background:#d1d5db;border-radius:10px;position:relative;flex-shrink:0;transition:background .2s;display:block;align-self:center;}';
    s += '.mcbi-tog:after{content:\'\';position:absolute;width:12px;height:12px;left:2px;top:2px;background:#fff;border-radius:50%;transition:transform .18s;box-shadow:0 1px 4px rgba(0,0,0,.25);}';
    s += '.mcbi-chk.is-on .mcbi-tog{background:var(--md-primary,#5b8dee);}';
    s += '.mcbi-chk.is-on .mcbi-tog:after{transform:translateX(12px);}';
    s += '.mcbi-chk:hover .mcbi-tog{box-shadow:0 0 0 3px rgba(var(--md-primary-rgb,91,141,238),.15);}';
    s += '.mcbi-chk>span:last-child{line-height:1.4;align-self:center;}';
    // 2-col row
    s += '.mcbi-row2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;}';
    s += '.mcbi-row2>.mcbi-field{margin-bottom:0;}';
    // Range slider
    s += 'input.mcbi-height{width:100%;cursor:pointer;accent-color:var(--md-primary,#5b8dee);background:none;border:none;padding:3px 0;height:22px;}';
    // Info/empty text
    s += '.mcbi-info{font-size:10.5px;color:#64748b;font-style:italic;padding:4px 0;}';
    // Add-serie button — full-width dashed
    s += '.mcbi-add-s{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:8px;padding:8px 12px;border:1.5px dashed rgba(0,0,0,.15);border-radius:9px;background:transparent;color:#64748b;font-size:11.5px;font-weight:600;cursor:pointer;transition:all .15s;}';
    s += '.mcbi-add-s:hover{border-color:var(--md-primary,#5b8dee);color:var(--md-primary,#5b8dee);background:rgba(var(--md-primary-rgb,91,141,238),.04);}';
    s += '.mcbi-add-s svg{flex-shrink:0;}';
    // Pie palette picker
    s += '.mcbi-pie-palettes{display:flex;flex-direction:column;gap:4px;}';
    s += '.mcbi-pp-btn{display:flex;align-items:center;gap:7px;padding:5px 8px;border:1.5px solid rgba(0,0,0,.1);border-radius:7px;background:#fff;cursor:pointer;transition:all .15s;box-shadow:0 1px 3px rgba(0,0,0,.04);text-align:left;width:100%;}';
    s += '.mcbi-pp-sw{display:flex;gap:2px;flex-shrink:0;}';
    s += '.mcbi-pp-sw span{display:inline-block;width:10px;height:10px;border-radius:50%;}';
    s += '.mcbi-pp-btn em{font-style:normal;font-size:10.5px;color:#475569;flex:1;}';
    s += '.mcbi-pp-btn:hover{border-color:var(--md-primary,#5b8dee);}';
    s += '.mcbi-pp-btn.is-on{border-color:var(--md-primary,#5b8dee);background:rgba(var(--md-primary-rgb,91,141,238),.07);box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.15);}';
    s += '.mcbi-pp-btn.is-on em{color:var(--md-primary,#5b8dee);font-weight:600;}';
    // PHC token dropdown in series color row
    s += '.mcbi-sc-phc{flex:1;min-width:0;background:#fff !important;border:1px solid rgba(0,0,0,.12) !important;color:#1e293b !important;border-radius:6px;font-size:11px;height:26px;padding:1px 5px;}';
    s += '.mcbi-sc-phc:focus{border-color:var(--md-primary,#5b8dee) !important;box-shadow:0 0 0 2px rgba(var(--md-primary-rgb,91,141,238),.15) !important;outline:none;}';
    // Custom palette colors editor
    s += '.mcbi-custom-palette{margin-top:6px;padding:7px 8px;background:#f8fafc;border:1px dashed rgba(0,0,0,.12);border-radius:7px;}';
    s += '.mcbi-custom-colors{display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;}';
    s += '.mcbi-custom-c{width:28px;height:24px;padding:1px;border:1px solid rgba(0,0,0,.12);border-radius:5px;cursor:pointer;}';
    // Transform status row + toggle button
    s += '.mcbi-transform-status{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:7px;background:#f8fafc;border:1px solid rgba(0,0,0,.08);margin-top:6px;margin-bottom:0;}';
    s += '.mcbi-transform-status.is-active{background:rgba(34,197,94,.07);border-color:rgba(34,197,94,.28);}';
    s += '.mcbi-ts-badge{font-size:10.5px;color:#64748b;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}';
    s += '.mcbi-ts-badge i{margin-right:4px;opacity:.8;}';
    s += '.mcbi-transform-status.is-active .mcbi-ts-badge{color:#166534;}';
    s += '.mcbi-btn-transform{font-size:10px;font-weight:600;padding:3px 9px;border-radius:6px;border:1px solid rgba(0,0,0,.15);background:#fff;color:#475569;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;line-height:1.6;}';
    s += '.mcbi-btn-transform:hover{border-color:var(--md-primary,#5b8dee);color:var(--md-primary,#5b8dee);}';
    s += '.mcbi-btn-transform i{margin-right:3px;}';
    // Per-series data source section
    s += '.mcbi-sr-ds{margin-bottom:9px;padding-bottom:9px;border-bottom:1px dashed rgba(0,0,0,.08);}';
    s += '.mcbi-sr-ds>label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;display:block;margin-bottom:5px;}';
    s += '.mcbi-s-ds-btns{display:flex;gap:4px;}';
    s += '.mcbi-s-ds-btn{flex:1;padding:4px 3px;border:1.5px solid #e2e8f0;border-radius:6px;background:#f8fafc;font-size:10px;font-weight:700;color:#64748b;cursor:pointer;transition:all .15s;text-align:center;}';
    s += '.mcbi-s-ds-btn:hover{border-color:#2563eb;color:#2563eb;}';
    s += '.mcbi-s-ds-btn.is-on{border-color:#2563eb;background:#dbeafe;color:#1d4ed8;}';
    // Transform builder — status row only (builder abre em modal dedicado)
    s += '</style>';
    $('head').append(s);
    return '';
}

// ============================================================================
// HTML OBJECT TYPE — Template Handlebars com dados de fonte
// Permite ao utilizador escrever HTML com {{campo}} e {{#each rows}}
// usando Handlebars.js (já carregado via CDN).
// ============================================================================

var _HTML_SAMPLE_CONFIG = {
    htmlTemplate: '<div class="mhtml-card">\n  <h4>{{titulo}}</h4>\n  <p>{{descricao}}</p>\n</div>\n\n{{!-- Para listas use: --}}\n{{!-- {{#each rows}}<div>{{nome}}</div>{{/each}} --}}',
    cssCode: '.mhtml-card { padding: 16px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }',
    sanitize: true,
    minHeight: ''
};

// ── Helper: interpolação Handlebars ─────────────────────────────────────────
function _htmlRenderTemplate(template, data) {
    if (typeof Handlebars === 'undefined') {
        // Fallback simples se Handlebars não estiver carregado
        return template.replace(/\{\{([^}]+)\}\}/g, function (_, key) {
            key = key.trim();
            var row = (data && data.length) ? data[0] : {};
            return row[key] !== undefined ? String(row[key]) : '';
        });
    }
    try {
        var compiled = Handlebars.compile(template);
        var ctx = {};
        // Spread do 1.º registo no root para acesso directo a {{campo}}
        if (data && data.length) {
            var first = data[0];
            Object.keys(first).forEach(function (k) { ctx[k] = first[k]; });
        }
        ctx.rows  = data || [];
        ctx.total = (data || []).length;
        ctx.row   = (data && data.length) ? data[0] : {};
        return compiled(ctx);
    } catch (e) {
        return '<div style="color:#ef4444;padding:8px;font-size:11px;"><i class="glyphicon glyphicon-warning-sign"></i> Erro no template: ' + _mciEsc(e.message) + '</div>';
    }
}

// Helper: sanitizar HTML (remove blocos perigosos e atributos on-event)
function _htmlSanitize(html) {
    // Safe para embed inline em paginas PHC — evitar sequencias que fecham tags no source
    var _scOpen = '<' + 'script';
    var _scClose = '<' + '/' + 'script>';
    html = html.replace(new RegExp(_scOpen + '[\\s\\S]*?' + _scClose, 'gi'), '');
    // Remove atributos de evento inline (onclick, onload, etc.)
    html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    // Remove href="javascript:..."
    html = html.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
    return html;
}

// ── renderObjectHtml ─────────────────────────────────────────────────────────
function renderObjectHtml(dados) {
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_HTML_SAMPLE_CONFIG));
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var sel   = dados.containerSelector;

    // PRIORIDADE: transformConfig SEMPRE tem prioridade sobre dados.data
    var rows = [];
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
            }
        } catch (e) { /* silêncio */ }
    }
    
    // Fallback: usar dados.data se não há transformConfig ou se a transformação falhou
    if (rows.length === 0 && dados.data && dados.data.length > 0) {
        rows = dados.data;
    }

    var template = cfg.htmlTemplate || '';
    var cssCode  = cfg.cssCode || '';

    if (!template) {
        $(sel).html(
            '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">'
            + '<i class="fa fa-code" style="font-size:24px;display:block;margin-bottom:6px;opacity:.5;"></i>'
            + 'HTML — sem template definido'
            + '</div>'
        );
        return;
    }

    // CSS scoped
    var styleId = 'mhtml-style-' + stamp;
    $('#' + styleId).remove();
    if (cssCode) {
        $('head').append('<style id="' + styleId + '">' + cssCode + '</style>');
    }

    // Render template
    var rendered = _htmlRenderTemplate(template, rows);
    if (cfg.sanitize !== false) rendered = _htmlSanitize(rendered);

    var wrapStyle = cfg.minHeight ? 'min-height:' + _mciEsc(cfg.minHeight) + ';' : '';
    $(sel).html('<div class="mhtml-root" style="' + wrapStyle + '">' + rendered + '</div>');
}

// ── renderHtmlPropertiesInline ───────────────────────────────────────────────
function renderHtmlPropertiesInline(obj, panel) {
    var stamp  = obj.mdashcontaineritemobjectstamp;
    var cfg    = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_HTML_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    _mciCSS();

    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mhtml-root-props').length) return;
            _htmlReadConfig(panel, obj);
            // Sincronizar a invariante triplicada antes de persistir
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }

    // SEMPRE usar obj.transformConfig (root level) como fonte de verdade
    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);

    // ── Secção: Dados ────────────────────────────────────────────────────────
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>'
              + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    // ── Secção: Campos disponíveis ────────────────────────────────────────────
    var sFields = fields.length
        ? fields.map(function (f) {
            return '<code style="cursor:pointer;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;display:inline-block;" class="mhtml-field-pill" data-field="' + _mciEsc(f) + '">' + _mciEsc(f) + '</code>';
        }).join(' ')
        : '<em style="color:#94a3b8;">Sem campos — seleccione uma fonte</em>';

    var sCampos = '<div class="mcbi-field"><label>Campos disponíveis <small style="font-weight:400;color:#94a3b8;">(clique para inserir)</small></label>'
        + '<div class="mhtml-fields-list" style="font-size:10.5px;max-height:80px;overflow:auto;line-height:1.9;">'
        + sFields + '</div></div>';

    // ── Secção: Template HTML ─────────────────────────────────────────────────
    var htmlValue = cfg.htmlTemplate || _HTML_SAMPLE_CONFIG.htmlTemplate;
    var sTemplate = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">Template HTML</label>'
        + '<button type="button" class="btn btn-xs btn-default mhtml-expand-html" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mhtml-ace-' + stamp + '" style="width:100%;height:220px;border:1px solid rgba(0,0,0,.12);border-radius:6px;"></div>'
        + '</div>';

    // ── Secção: CSS ───────────────────────────────────────────────────────────
    var cssValue = cfg.cssCode || '';
    var sCSS = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">CSS (opcional)</label>'
        + '<button type="button" class="btn btn-xs btn-default mhtml-expand-css" title="Editar CSS em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mhtml-ace-css-' + stamp + '" style="width:100%;height:100px;border:1px solid rgba(0,0,0,.12);border-radius:6px;"></div>'
        + '</div>';

    // ── Secção: Opções ────────────────────────────────────────────────────────
    var sOpcoes = '<div class="mcbi-field">'
        + _mciChk('mhtml-sanitize', 'Sanitizar HTML (remover scripts e eventos inline)', cfg.sanitize !== false)
        + '</div>'
        + '<div class="mcbi-field"><label>Altura mínima</label>'
        + '<input type="text" class="mhtml-minheight form-control input-sm" value="' + _mciEsc(cfg.minHeight || '') + '" placeholder="ex: 120px" style="width:120px;"></div>';

    // ── Ajuda Handlebars ───────────────────────────────────────────────────────
    var sAjuda = '<div style="font-size:10.5px;color:#64748b;line-height:1.7;">'
        + '<p style="margin:0 0 5px;"><strong>Sintaxe Handlebars:</strong></p>'
        + '<code>{{campo}}</code> — valor do 1.º registo<br>'
        + '<code>{{{campo}}}</code> — valor sem escape (HTML raw)<br>'
        + '<code>{{rows.length}}</code> — total de registos<br>'
        + '<hr style="margin:7px 0;border-color:rgba(0,0,0,.07);">'
        + '<p style="margin:0 0 3px;"><strong>Iterar sobre dados:</strong></p>'
        + '<pre style="background:rgba(0,0,0,.04);padding:7px;border-radius:5px;font-size:9.5px;margin:0;">'
        + '{{#each rows}}\n  &lt;div&gt;{{nome}} — {{valor}}&lt;/div&gt;\n{{/each}}'
        + '</pre>'
        + '<hr style="margin:7px 0;border-color:rgba(0,0,0,.07);">'
        + '<p style="margin:0 0 3px;"><strong>Condicionais:</strong></p>'
        + '<pre style="background:rgba(0,0,0,.04);padding:7px;border-radius:5px;font-size:9.5px;margin:0;">'
        + '{{#if ativo}}&lt;span&gt;Activo&lt;/span&gt;{{/if}}'
        + '</pre></div>';

    var html = '<div class="mcbi-root mhtml-root-props" data-stamp="' + stamp + '">'
        + _mciSection('html-dados',    'Dados',         'glyphicon-hdd',            true,  sDados)
        + _mciSection('html-campos',   'Campos',        'glyphicon-list-alt',        true,  sCampos)
        + _mciSection('html-template', 'Template HTML', 'glyphicon-edit',            true,  sTemplate)
        + _mciSection('html-css',      'CSS',           'glyphicon-tint',            false, sCSS)
        + _mciSection('html-opcoes',   'Opções',        'glyphicon-cog',             false, sOpcoes)
        + _mciSection('html-ajuda',    'Ajuda Handlebars', 'glyphicon-question-sign', false, sAjuda)
        + '</div>';

    panel.html(html);

    // ── Init ACE editors ──────────────────────────────────────────────────────
    var aceHtml = null, aceCss = null;
    if (typeof ace !== 'undefined') {
        aceHtml = ace.edit('mhtml-ace-' + stamp);
        aceHtml.session.setMode('ace/mode/html');
        aceHtml.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceHtml.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 30, minLines: 8 });
        aceHtml.setValue(htmlValue, -1);
        aceHtml.on('change', function () { fire(); });

        aceCss = ace.edit('mhtml-ace-css-' + stamp);
        aceCss.session.setMode('ace/mode/css');
        aceCss.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceCss.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 12, minLines: 3 });
        aceCss.setValue(cssValue, -1);
        aceCss.on('change', function () { fire(); });
    }

    panel.data('_mhtmlAceHtml', aceHtml);
    panel.data('_mhtmlAceCss',  aceCss);

    // ── Event handlers ────────────────────────────────────────────────────────
    panel.off(); // Limpar TODOS os handlers (incluindo de outros tipos de objetos)

    // Section collapse
    panel.on('click.mhtmlinline', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
        if (open) setTimeout(function () { if (aceHtml) aceHtml.resize(); if (aceCss) aceCss.resize(); }, 50);
    });

    // Fonte change
    panel.on('change.mhtmlinline', '.mcbi-fonte', function () {
        _mciOnFonteSelected($(this).val() || '', obj, panel, function () {
            var newFields = _mciGetFields(obj);
            panel.find('.mhtml-fields-list').html(
                newFields.length
                    ? newFields.map(function (f) {
                        return '<code style="cursor:pointer;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;display:inline-block;" class="mhtml-field-pill" data-field="' + _mciEsc(f) + '">' + _mciEsc(f) + '</code>';
                    }).join(' ')
                    : '<em style="color:#94a3b8;">Sem campos</em>'
            );
            fire();
        });
    });

    // Clicar num campo insere {{campo}} no editor ACE activo
    panel.on('click.mhtmlinline', '.mhtml-field-pill', function () {
        var f = $(this).data('field');
        if (aceHtml) {
            aceHtml.insert('{{' + f + '}}');
            aceHtml.focus();
        }
    });

    // Transform button
    panel.on('click.mhtmlinline', '.mcbi-btn-transform', function () {
        var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) { if (typeof alertify !== 'undefined') alertify.error('MdashTransformBuilder não disponível.', 4000); return; }

        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';

        // Carregar cache na DB in-memory (para PRAGMA e botão Testar)
        var _tCfgRaw = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'HTML') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'HTML',
            modalId: 'mhtml-transform-modal',
            hostId: 'mhtml-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                // Atualizar apenas as localizações fundamentais
                obj.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                // Sincronizar a invariante triplicada antes de persistir
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function')
                    realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                var nf = _mciGetFields(obj);
                panel.find('.mhtml-fields-list').html(
                    nf.length
                        ? nf.map(function (f) { return '<code style="cursor:pointer;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;display:inline-block;" class="mhtml-field-pill" data-field="' + _mciEsc(f) + '">' + _mciEsc(f) + '</code>'; }).join(' ')
                        : '<em style="color:#94a3b8;">Sem campos</em>'
                );
                fire();
            }
        });
    });

    // Fullscreen — HTML
    panel.on('click.mhtmlinline', '.mhtml-expand-html', function () {
        _mccOpenEditorModal('html', aceHtml, function (newVal) {
            if (aceHtml) aceHtml.setValue(newVal, -1);
            fire();
        });
    });

    // Fullscreen — CSS
    panel.on('click.mhtmlinline', '.mhtml-expand-css', function () {
        _mccOpenEditorModal('css', aceCss, function (newVal) {
            if (aceCss) aceCss.setValue(newVal, -1);
            fire();
        });
    });

    // Checkboxes
    panel.on('change.mhtmlinline', 'input[type="checkbox"]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    // Inputs
    panel.on('input.mhtmlinline change.mhtmlinline', 'input[type="text"]', function () {
        fire();
    });
}

// ── _htmlReadConfig ───────────────────────────────────────────────────────────
function _htmlReadConfig(panel, obj) {
    var cfg = obj.config || {};
    var aceHtml = panel.data('_mhtmlAceHtml');
    var aceCss  = panel.data('_mhtmlAceCss');
    cfg.htmlTemplate = aceHtml ? aceHtml.getValue() : (cfg.htmlTemplate || '');
    cfg.cssCode      = aceCss  ? aceCss.getValue()  : (cfg.cssCode || '');
    cfg.sanitize     = panel.find('.mhtml-sanitize').is(':checked');
    cfg.minHeight    = panel.find('.mhtml-minheight').val().trim();
    // Preservar transformConfig de obj.config OU obj.transformConfig (fallback)
    cfg.transformConfig = cfg.transformConfig || obj.transformConfig || null;
    obj.config    = cfg;
    obj.transformConfig = cfg.transformConfig;
    
    // NÃO atualizar configjson ou transformconfigjson manualmente!
    // stringifyJSONFields() será chamado no fire() e fará a sincronização completa
}

function getTiposObjectoConfig() {
    /*
     { tipo: 'chart', label: 'Gráfico', icon: '	fa fa-bar-chart' },
                { tipo: 'pie', label: 'Pizza', icon: '	fa fa-pie-chart' },
                { tipo: 'text', label: 'Texto', icon: 'fa fa-font' },
                { tipo: 'table', label: 'Tabela', icon: 'fa fa-table' },
                { tipo: 'customCode', label: 'Personalizado', icon: 'fa fa-code' }
    */
    return [{
        tipo: "chart",
        descricao: "Gráfico",
        label: "Gráfico",
        icon: "fa fa-bar-chart",
        categoria: "editor",
        renderPropertiesInline: renderChartPropertiesInline,
        createDynamicSchema: createDynamicSchemaGrafico,
        renderObject: renderObjectGrafico,
        getSampleData: function () { return getMdashSampleData('chart'); },
        sampleConfig: _MCHART_SAMPLE_CONFIG
    },
    {
        tipo: "pie",
        label: "Pizza",
        icon: "fa fa-pie-chart",
        categoria: "editor",
        descricao: "Gráfico de Pizza",
        createDynamicSchema: function (data) {
            var fieldOptions = [];
            var fieldTitles = [];
            if (data && data.length > 0) {
                Object.keys(data[0]).forEach(function (key) {
                    fieldOptions.push(key);
                    fieldTitles.push(key);
                });
            }
            return {
                type: "object",
                title: "Configuração do Gráfico de Pizza",
                properties: {
                    // Campos de dados
                    labelField: {
                        type: "string",
                        title: "Campo para Rótulos",
                        'enum': fieldOptions,
                        options: {
                            enum_titles: fieldTitles
                        },
                        description: "Campo que será usado como rótulo das fatias"
                    },
                    valueField: {
                        type: "string",
                        title: "Campo para Valores",
                        'enum': fieldOptions,
                        options: {
                            enum_titles: fieldTitles
                        },
                        description: "Campo que será usado como valor das fatias"
                    },
                    // Configurações visuais
                    radius: {
                        type: "object",
                        title: "Configuração do Raio",
                        properties: {
                            inner: {
                                type: "string",
                                title: "Raio Interno",
                                'default': "40%",
                                description: "Raio interno (para donut chart)"
                            },
                            outer: {
                                type: "string",
                                title: "Raio Externo",
                                'default': "70%",
                                description: "Raio externo do gráfico"
                            }
                        }
                    },
                    // Configurações de aparência
                    itemStyle: {
                        type: "object",
                        title: "Estilo dos Itens",
                        properties: {
                            borderRadius: {
                                type: "integer",
                                title: "Raio das Bordas",
                                'default': 10,
                                minimum: 0,
                                maximum: 50
                            },
                            padAngle: {
                                type: "integer",
                                title: "Espaçamento entre Fatias",
                                'default': 5,
                                minimum: 0,
                                maximum: 20
                            }
                        }
                    },
                    // Configurações da legenda
                    legend: {
                        type: "object",
                        title: "Configuração da Legenda",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Legenda",
                                'default': true
                            },
                            position: {
                                type: "string",
                                title: "Posição da Legenda",
                                'enum': ["top", "bottom", "left", "right"],
                                options: {
                                    enum_titles: ["Superior", "Inferior", "Esquerda", "Direita"]
                                },
                                'default': "top"
                            },
                            align: {
                                type: "string",
                                title: "Alinhamento",
                                'enum': ["left", "center", "right"],
                                options: {
                                    enum_titles: ["Esquerda", "Centro", "Direita"]
                                },
                                'default': "center"
                            }
                        }
                    },
                    // Configurações dos rótulos
                    label: {
                        type: "object",
                        title: "Configuração dos Rótulos",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Rótulos",
                                'default': false
                            },
                            position: {
                                type: "string",
                                title: "Posição dos Rótulos",
                                'enum': ["outside", "inside", "center"],
                                options: {
                                    enum_titles: ["Fora", "Dentro", "Centro"]
                                },
                                'default': "outside"
                            },
                            showPercentage: {
                                type: "boolean",
                                title: "Mostrar Percentual",
                                'default': true
                            },
                            fontSize: {
                                type: "integer",
                                title: "Tamanho da Fonte",
                                'default': 12,
                                minimum: 8,
                                maximum: 24
                            }
                        }
                    },
                    // Configurações de tooltip
                    tooltip: {
                        type: "object",
                        title: "Configuração do Tooltip",
                        properties: {
                            trigger: {
                                type: "string",
                                title: "Tipo de Trigger",
                                'enum': ["item", "axis"],
                                options: {
                                    enum_titles: ["Item", "Eixo"]
                                },
                                'default': "item"
                            },
                            showPercentage: {
                                type: "boolean",
                                title: "Mostrar Percentual no Tooltip",
                                'default': true
                            }
                        }
                    },
                    // Texto central (para donut charts)
                    centerText: {
                        type: "object",
                        title: "Texto Central",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Texto Central",
                                'default': false
                            },
                            text: {
                                type: "string",
                                title: "Texto",
                                'default': "Total"
                            },
                            showTotal: {
                                type: "boolean",
                                title: "Mostrar Total",
                                'default': true,
                                description: "Mostrar a soma dos valores no centro"
                            },
                            fontSize: {
                                type: "integer",
                                title: "Tamanho da Fonte",
                                'default': 30,
                                minimum: 12,
                                maximum: 60
                            },
                            fontWeight: {
                                type: "string",
                                title: "Peso da Fonte",
                                'enum': ["normal", "bold"],
                                options: {
                                    enum_titles: ["Normal", "Negrito"]
                                },
                                'default': "bold"
                            },
                            color: {
                                type: "string",
                                title: "Cor do Texto",
                                format: "color",
                                'default': "#333"
                            }
                        }
                    },
                    // Cores personalizadas
                    colors: {
                        type: "array",
                        title: "Cores Personalizadas",
                        items: {
                            type: "string",
                            format: "color"
                        },
                        'default': [
                            '#f79523',
                            '#d43f3a',
                            '#00897B',
                            '#91c7ae',
                            '#749f83',
                            '#ca8622',
                            '#bda29a',
                            '#6e7074',
                            '#546570',
                            '#c4ccd3'
                        ]
                    },
                    // Dimensões
                    dimensions: {
                        type: "object",
                        title: "Dimensões do Gráfico",
                        properties: {
                            width: {
                                type: "string",
                                title: "Largura",
                                'default': 400
                            },
                            height: {
                                type: "integer",
                                title: "Altura (px)",
                                'default': 400,
                                minimum: 200,
                                maximum: 800
                            }
                        }
                    }
                },
                required: ["labelField", "valueField"]
            };
        },
        renderObject: function (params) {
            var containerSelector = params.containerSelector;
            var itemObject = params.itemObject;
            var config = params.config;
            var data = params.data;
            if (!config.labelField || !config.valueField) {
                console.warn("Campos obrigatórios não configurados para o gráfico de pizza");
                return;
            }
            updatePie(containerSelector, itemObject, config, data);
        }
    },
    {
        tipo: "table",
        descricao: "Tabela de Dados",
        label: "Tabela",
        icon: "fa fa-table",
        categoria: "editor",
        renderPropertiesInline: renderTablePropertiesInline,
        createDynamicSchema: createDynamicSchemaTable,
        renderObject: renderObjectTable,
        getSampleData: function () { return _tblGetExecutiveSampleRows(); },
        sampleConfig: _TABLE_EXECUTIVE_SAMPLE_CONFIG
    },
    {
        tipo: "text",
        descricao: "Elemento de Texto",
        label: "Texto",
        icon: "fa fa-font",
        categoria: "editor",
        renderPropertiesInline: renderTextPropertiesInline,
        createDynamicSchema: createDynamicSchemaTexto,
        renderObject: renderObjectTexto,
        getSampleData: function () { return getMdashSampleData('text'); },
        sampleConfig: _TEXT_SAMPLE_CONFIG
    },
    {
        tipo: "badge",
        descricao: "Badge / Indicador delta",
        label: "Badge",
        icon: "fa fa-tag",
        categoria: "editor",
        renderPropertiesInline: renderBadgePropertiesInline,
        createDynamicSchema: createDynamicSchemaBadge,
        renderObject: renderObjectBadge,
        getSampleData: function () { return getMdashSampleData('badge'); },
        sampleConfig: _BADGE_SAMPLE_CONFIG
    },
    {
        tipo: "progress",
        descricao: "Barra de progresso única ou lista ranking com limiares e cores PHC",
        label: "Progresso",
        icon: "fa fa-tasks",
        categoria: "editor",
        renderPropertiesInline: renderProgressPropertiesInline,
        createDynamicSchema: createDynamicSchemaProgress,
        renderObject: renderObjectProgress,
        getSampleData: function () { return getMdashSampleData('progress'); },
        sampleConfig: _PROGRESS_SAMPLE_CONFIG
    },
    {
        tipo: "customCode",
        descricao: "Código Personalizado",
        label: "Personalizado",
        categoria: "custom",
        icon: "fa fa-code",
        processaFonte: false,
        renderPropertiesInline: renderCustomCodePropertiesInline,
        createDynamicSchema: crateDynamicSchemaCustomCode,
        renderObject: renderObjectCustomCode,
        sampleConfig: _CUSTOMCODE_SAMPLE_CONFIG
    },
    {
        tipo: "html",
        descricao: "HTML Template",
        label: "HTML",
        categoria: "editor",
        icon: "fa fa-html5",
        renderPropertiesInline: renderHtmlPropertiesInline,
        createDynamicSchema: function () { return null; },
        renderObject: renderObjectHtml,
        getSampleData: function () { return getMdashSampleData('table'); },
        sampleConfig: _HTML_SAMPLE_CONFIG
    },
    {
        tipo: "detail",
        descricao: "Detalhe",
        label: "Detalhe",
        categoria: "detail",
        icon: "fa fa-ellipsis-h",
        createDynamicSchema: crateDynamicSchemaCustomCode,
        renderObject: function (params) {
            console.log("Renderizar código personalizado - não implementado");
        }
    },
    {
        tipo: "title",
        descricao: "Título do Item",
        label: "Título do Item",
        icon: "fa fa-header",
        categoria: "display",
        processaFonte: false,
        createDynamicSchema: function () { return null; },
        renderObject: function (params) {
            var containerItem = params.containerItem;
            var titulo = containerItem ? (containerItem.titulo || '') : '';
            if (!titulo) {
                $(params.containerSelector).html('<div class="mdash-titulo-item" style="color:#aaa;font-style:italic;padding:6px 0;">(sem título)</div>');
                return;
            }
            $(params.containerSelector).html(
                '<div class="mdash-titulo-item" style="font-size:1.15em;font-weight:600;padding:6px 0;">'
                + $('<span>').text(titulo).html()
                + '</div>'
            );
        }
    },
    {
        tipo: "TituloItem",
        descricao: "Título do Item",
        label: "Título do Item",
        icon: "fa fa-header",
        categoria: "display",
        processaFonte: false,
        createDynamicSchema: function () { return null; },
        renderObject: function (params) {
            var containerItem = params.containerItem;
            var titulo = containerItem ? (containerItem.titulo || '') : '';
            if (!titulo) {
                $(params.containerSelector).html('<div class="mdash-titulo-item" style="color:#aaa;font-style:italic;padding:6px 0;">(sem título)</div>');
                return;
            }
            $(params.containerSelector).html(
                '<div class="mdash-titulo-item" style="font-size:1.15em;font-weight:600;padding:6px 0;">'
                + $('<span>').text(titulo).html()
                + '</div>'
            );
        }
    }
    ,
    {
        tipo: "list",
        descricao: "Lista / Timeline",
        label: "Lista",
        categoria: "editor",
        icon: "fa fa-list-ul",
        renderPropertiesInline: renderListaPropertiesInline,
        createDynamicSchema: function () { return null; },
        renderObject: renderObjectLista,
        getSampleData: function () { return getMdashSampleData('table'); },
        sampleConfig: _LISTA_SAMPLE_CONFIG
    }
    ]


}

// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO LISTA / TIMELINE — Enterprise UI/UX
// ══════════════════════════════════════════════════════════════════════════════

var _LISTA_SAMPLE_CONFIG = {
    // Dados
    labelField: '',
    linkField: '',
    linkTarget: '_blank',
    badgeField: '',
    subtitleField: '',
    dateField: '',

    // Estilo da lista
    listStyle: 'numbered',    // 'numbered' | 'timeline' | 'plain' | 'card' | 'row'
    bulletSymbol: '●',        // emoji ou símbolo
    bulletSize: 14,
    bulletColor: 'primary',   // 'primary'|'success'|'warning'|'danger'|'info'|'secondary'|'custom'
    bulletColorCustom: '#5b8dee',
    markerBgColor: '',           // '' = auto; ou hex ex: '#e0e8ff'
    markerIconColor: '',         // '' = auto; ou hex ex: '#ffffff'
    timelineLineColor: 'primary',
    timelineLineColorCustom: '#5b8dee',

    // Item como link
    isLink: false,
    linkLabel: '',            // campo para o texto visível do link (se vazio usa labelField)

    // Tipografia
    textFormat: {
        fontSize: 14,
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        lineHeight: 1.6
    },

    // Cores de texto / fundo
    colors: {
        textColor: '',             // vazio = herda do tema
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        hoverTextColor: '',
        hoverBgColor: ''
    },

    // Layout
    spacing: { paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, gap: 6 },
    border: { width: 0, style: 'solid', radius: 8 },
    divider: false,
    maxItems: 0,               // 0 = sem limite

    // Badge
    badgeStyle: 'none',       // 'none' | 'pill' | 'dot'
    badgeColor: 'primary',

    // Items manuais (sem fonte de dados)
    useManualItems: false,
    manualItems: []            // [{ label, url, isLink, subtitle }]
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function _lstNormalizeConfig(rawCfg) {
    var base = JSON.parse(JSON.stringify(_LISTA_SAMPLE_CONFIG));
    if (!rawCfg || typeof rawCfg !== 'object') return base;
    // merge plano + sub-objectos
    Object.keys(rawCfg).forEach(function (k) {
        var v = rawCfg[k];
        if (v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') {
            base[k] = Object.assign({}, base[k], v);
        } else if (v !== undefined) {
            base[k] = v;
        }
    });
    return base;
}

function _lstPhcColor(name, customVal) {
    // Devolve a cor do Bootstrap/PHC a partir do nome semântico
    if (name === 'custom' && customVal) return customVal;
    var map = {
        primary: 'var(--bs-primary, #5b8dee)',
        success: 'var(--bs-success, #28a745)',
        warning: 'var(--bs-warning, #ffc107)',
        danger: 'var(--bs-danger, #dc3545)',
        info: 'var(--bs-info, #17a2b8)',
        secondary: 'var(--bs-secondary, #6c757d)'
    };
    // Tenta usar a cor real via jQuery (PHC já tem as variáveis CSS injetadas)
    return map[name] || map.primary;
}

function _lstSanitize(s) {
    return $('<span>').text(String(s === null || s === undefined ? '' : s)).html();
}

// ── Renderer ─────────────────────────────────────────────────────────────────
function renderObjectLista(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg   = _lstNormalizeConfig(dados.config);
    var isSample = !!dados.isSample;

    // Resolução de dados
    var rows = [];

    // Items manuais — prioridade total, salta fontes de dados
    if (cfg.useManualItems && cfg.manualItems && cfg.manualItems.length > 0) {
        rows = cfg.manualItems.map(function (it) {
            return {
                _mi_label:  String(it.label || ''),
                _mi_url:    (it.isLink && it.url) ? String(it.url) : '',
                _mi_sub:    String(it.subtitle || ''),
                _mi_target: (it.isLink && it.linkTarget) ? String(it.linkTarget) : '_blank',
                _mi_color:  (it.isLink && it.linkColor)  ? String(it.linkColor)  : ''
            };
        });
        cfg.labelField    = '_mi_label';
        cfg.linkField     = '_mi_url';
        cfg.subtitleField = '_mi_sub';
        cfg.isLink        = true;
        cfg.linkLabel     = '_mi_label';
        isSample          = false;
    } else {
        var tCfg = dados.transformConfig || cfg.transformConfig || null;
        if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
            try {
                var raw = MdashTransformBuilder.executeRaw(tCfg);
                if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                    rows = raw.rows.map(function (r) {
                        var o = {};
                        raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                        return o;
                    });
                    isSample = false;
                }
            } catch (e) { /* silêncio */ }
        }
        if (rows.length === 0 && dados.data && dados.data.length > 0) { rows = dados.data; isSample = false; }
    }
    if (rows.length === 0) {
        rows = [
            { label: 'Item de exemplo 1', badge: 'Novo', subtitle: 'Subtítulo do item', date: '2026-01-15' },
            { label: 'Item de exemplo 2', badge: 'Activo', subtitle: 'Descrição breve', date: '2026-02-10' },
            { label: 'Item de exemplo 3', badge: 'Pendente', subtitle: 'Outro detalhe', date: '2026-03-05' },
            { label: 'Item de exemplo 4', badge: '', subtitle: '', date: '2026-04-20' }
        ];
        if (!cfg.labelField) cfg.labelField = 'label';
        if (!cfg.badgeField) cfg.badgeField = 'badge';
        if (!cfg.subtitleField) cfg.subtitleField = 'subtitle';
        if (!cfg.dateField) cfg.dateField = 'date';
        isSample = true;
    }

    var maxItems = parseInt(cfg.maxItems) || 0;
    if (maxItems > 0 && rows.length > maxItems) rows = rows.slice(0, maxItems);

    var bColor = _lstPhcColor(cfg.bulletColor, cfg.bulletColorCustom);
    var tlColor = _lstPhcColor(cfg.timelineLineColor, cfg.timelineLineColorCustom);
    var tf = cfg.textFormat || {};
    var sp = cfg.spacing || {};
    var cl = cfg.colors || {};
    var bd = cfg.border || {};

    var baseTextColor = cl.textColor || 'inherit';
    var baseFontSize  = (tf.fontSize || 14) + 'px';
    var baseFontFamily = tf.fontFamily || 'Nunito, sans-serif';
    var baseLineHeight = tf.lineHeight || 1.6;
    var baseAlign      = tf.textAlign || 'left';
    var baseFontWeight = tf.fontWeight || 'normal';

    var containerStyle = 'font-family:' + baseFontFamily + ';font-size:' + baseFontSize + ';'
        + 'line-height:' + baseLineHeight + ';text-align:' + baseAlign + ';'
        + 'background:' + (cl.backgroundColor || 'transparent') + ';'
        + (bd.width > 0 ? 'border:' + bd.width + 'px ' + (bd.style||'solid') + ' ' + (cl.borderColor||'transparent') + ';' : '')
        + 'border-radius:' + (bd.radius || 0) + 'px;'
        + 'padding:' + (sp.paddingTop||8) + 'px ' + (sp.paddingRight||12) + 'px '
        + (sp.paddingBottom||8) + 'px ' + (sp.paddingLeft||12) + 'px;'
        + 'overflow:hidden;';

    var listId = 'mlst_' + stamp;
    var styleId = 'mlst-style-' + stamp;
    var gap = (sp.gap !== undefined ? sp.gap : 6);

    // CSS dinâmico para hover e divider
    var hoverBg  = cl.hoverBgColor || 'rgba(0,0,0,.04)';
    var hoverTxt = cl.hoverTextColor || baseTextColor;
    var dynCss = '<style id="' + styleId + '">'
        + '#' + listId + ' .mlst-item{transition:background .15s,color .15s,box-shadow .15s;}'
        + '#' + listId + ' .mlst-item:hover{background:' + hoverBg + ' !important;color:' + hoverTxt + ' !important;box-shadow:0 2px 8px rgba(0,0,0,.07);}'
        + '#' + listId + ' .mlst-item a{text-decoration:none;color:inherit;}'
        + '#' + listId + ' .mlst-item a:hover{text-decoration:underline;}'
        + (cfg.listStyle === 'timeline'
            ? '#' + listId + ' .mlst-tl-line{background:' + tlColor + '30;}'
              + '#' + listId + ' .mlst-tl-dot{background:' + bColor + ';box-shadow:0 0 0 3px ' + bColor + '22;}'
              + '#' + listId + ' .mlst-tl-dot.mlst-tl-dot-first{box-shadow:0 0 0 4px ' + bColor + '44;}'
            : '')
        + (cfg.listStyle === 'row'
            ? '#' + listId + ' .mlst-item:hover .mlst-row-arrow{filter:brightness(.82);}'
            : '')
        + '</style>';

    // ── Amostra badge ──
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:4px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    // ── Render por estilo ──
    var inner = '';

    if (cfg.listStyle === 'timeline') {
        inner = _lstRenderTimeline(rows, cfg, bColor, tlColor, baseTextColor, gap);
    } else if (cfg.listStyle === 'card') {
        inner = _lstRenderCards(rows, cfg, bColor, baseTextColor, gap, bd);
    } else if (cfg.listStyle === 'row') {
        inner = _lstRenderRow(rows, cfg, bColor, baseTextColor, gap);
    } else {
        inner = _lstRenderGeneric(rows, cfg, bColor, baseTextColor, gap);
    }

    var html = dynCss + badgeHtml
        + '<div id="' + listId + '" class="m-dash-lista-element" style="' + containerStyle + '">'
        + inner
        + '</div>';
    $(dados.containerSelector).html(html);
}

function _lstRenderGeneric(rows, cfg, bColor, textColor, gap) {
    var isNumbered = cfg.listStyle === 'numbered';
    var isPlain    = cfg.listStyle === 'plain';
    var hasDivider = !!cfg.divider;
    var tf = cfg.textFormat || {};
    var fontWeight = tf.fontWeight || 'normal';

    var html = '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:' + Math.max(0, gap - 2) + 'px;">';
    rows.forEach(function (row, idx) {
        var label    = cfg.labelField ? (row[cfg.labelField] !== undefined ? row[cfg.labelField] : '') : (row[Object.keys(row)[0]] || '');
        var subtitle = cfg.subtitleField ? (row[cfg.subtitleField] || '') : '';
        var date     = cfg.dateField ? (row[cfg.dateField] || '') : '';
        var badgeVal = cfg.badgeField ? (row[cfg.badgeField] || '') : '';
        var isLink   = !!(cfg.isLink && cfg.linkField && row[cfg.linkField]);
        var href     = isLink ? String(row[cfg.linkField]) : '';
        var linkText = (cfg.linkLabel && row[cfg.linkLabel]) ? String(row[cfg.linkLabel]) : _lstSanitize(label);

        // Marker — bullet ou número
        var markerHtml = '';
        if (!isPlain) {
            if (isNumbered) {
                var mBg   = cfg.markerBgColor;
                var mIcon = cfg.markerIconColor;
                var numBg   = mBg ? 'linear-gradient(135deg,' + mBg + ',' + mBg + 'bb)' : bColor;
                var numShad = mBg ? ';box-shadow:0 2px 6px ' + mBg + '44' : '';
                var numCol  = mIcon || '#fff';
                markerHtml = '<span class="mlst-bullet" style="min-width:24px;height:24px;border-radius:7px;background:' + numBg + ';color:' + numCol + ';font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px' + numShad + ';">' + (idx + 1) + '</span>';
            } else {
                var sym = cfg.bulletSymbol || '●';
                markerHtml = '<span class="mlst-bullet" style="color:' + bColor + ';font-size:' + (cfg.bulletSize || 14) + 'px;flex-shrink:0;margin-top:2px;line-height:1;opacity:.9;text-shadow:0 1px 3px ' + bColor + '40;">' + _lstSanitize(sym) + '</span>';
            }
        }

        // Conteúdo principal
        var itemTarget = row._mi_target || cfg.linkTarget || '_blank';
        var itemColor  = row._mi_color  || bColor;
        var mainContent = isLink
            ? '<a href="' + _lstSanitize(href) + '" target="' + itemTarget + '" style="font-weight:' + fontWeight + ';color:' + itemColor + ';">' + linkText + '</a>'
            : '<span style="font-weight:' + fontWeight + ';color:' + (textColor || 'inherit') + ';">' + _lstSanitize(label) + '</span>';

        // Badge
        var badgeHtml2 = '';
        if (badgeVal && cfg.badgeStyle !== 'none') {
            var bC = _lstPhcColor(cfg.badgeColor, '');
            if (cfg.badgeStyle === 'dot') {
                badgeHtml2 = '<span style="width:8px;height:8px;border-radius:50%;background:' + bC + ';display:inline-block;margin-left:5px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 2px ' + bC + '30;" title="' + _lstSanitize(badgeVal) + '"></span>';
            } else {
                badgeHtml2 = '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:' + bC + '18;color:' + bC + ';border:1px solid ' + bC + '30;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;">' + _lstSanitize(badgeVal) + '</span>';
            }
        }

        // Meta (subtítulo + data)
        var metaHtml = '';
        if (subtitle || date) {
            metaHtml = '<div style="font-size:.82em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">'
                + (date ? '<span style="display:inline-flex;align-items:center;gap:2px;"><i class="glyphicon glyphicon-time" style="font-size:9px;opacity:.7;"></i>' + _lstSanitize(date) + '</span>' : '')
                + (date && subtitle ? '<span style="opacity:.35;font-size:.9em;">·</span>' : '')
                + (subtitle ? '<span>' + _lstSanitize(subtitle) + '</span>' : '')
                + '</div>';
        }

        var borderStyle = (hasDivider && idx < rows.length - 1) ? 'border-bottom:1px solid rgba(0,0,0,.06);' : '';
        html += '<li class="mlst-item" style="display:flex;align-items:flex-start;gap:10px;padding:' + (gap + 2) + 'px 8px;border-radius:8px;cursor:default;' + borderStyle + '">'
            + markerHtml
            + '<div style="flex:1;min-width:0;">'
            + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + mainContent + badgeHtml2 + '</div>'
            + metaHtml
            + '</div>'
            + '</li>';
    });
    html += '</ul>';
    return html;
}

function _lstRenderTimeline(rows, cfg, bColor, lineColor, textColor, gap) {
    var hasDivider = !!cfg.divider;
    var tf = cfg.textFormat || {};
    var fontWeight = tf.fontWeight || 'normal';

    var html = '<div class="mlst-timeline" style="position:relative;padding-left:32px;">';
    // Linha vertical
    html += '<div class="mlst-tl-line" style="position:absolute;left:11px;top:14px;bottom:14px;width:2px;border-radius:2px;"></div>';

    rows.forEach(function (row, idx) {
        var label    = cfg.labelField ? (row[cfg.labelField] !== undefined ? row[cfg.labelField] : '') : (row[Object.keys(row)[0]] || '');
        var subtitle = cfg.subtitleField ? (row[cfg.subtitleField] || '') : '';
        var date     = cfg.dateField ? (row[cfg.dateField] || '') : '';
        var badgeVal = cfg.badgeField ? (row[cfg.badgeField] || '') : '';
        var isLink   = !!(cfg.isLink && cfg.linkField && row[cfg.linkField]);
        var href     = isLink ? String(row[cfg.linkField]) : '';
        var linkText = (cfg.linkLabel && row[cfg.linkLabel]) ? String(row[cfg.linkLabel]) : _lstSanitize(label);

        var isFirst = idx === 0;
        var isLast  = idx === rows.length - 1;
        var dotSize = isFirst ? '14px' : '10px';
        var dotLeft = isFirst ? '-26px' : '-24px';
        var dotClass = 'mlst-tl-dot' + (isFirst ? ' mlst-tl-dot-first' : '');
        var dotStyle = 'position:absolute;left:' + dotLeft + ';top:5px;width:' + dotSize + ';height:' + dotSize + ';border-radius:50%;';

        var itemTarget = row._mi_target || cfg.linkTarget || '_blank';
        var itemColor  = row._mi_color  || bColor;
        var mainContent = isLink
            ? '<a href="' + _lstSanitize(href) + '" target="' + itemTarget + '" style="font-weight:' + fontWeight + ';color:' + itemColor + ';">' + linkText + '</a>'
            : '<span style="font-weight:' + fontWeight + ';color:' + (textColor || 'inherit') + ';">' + _lstSanitize(label) + '</span>';

        var badgeHtml2 = '';
        if (badgeVal && cfg.badgeStyle !== 'none') {
            var bC = _lstPhcColor(cfg.badgeColor, '');
            badgeHtml2 = '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:' + bC + '18;color:' + bC + ';border:1px solid ' + bC + '30;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;">' + _lstSanitize(badgeVal) + '</span>';
        }

        var metaHtml = '';
        if (date || subtitle) {
            metaHtml = '<div style="font-size:.82em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">'
                + (date ? '<span style="display:inline-flex;align-items:center;gap:2px;"><i class="glyphicon glyphicon-time" style="font-size:9px;opacity:.7;"></i>' + _lstSanitize(date) + '</span>' : '')
                + (date && subtitle ? '<span style="opacity:.35;font-size:.9em;">·</span>' : '')
                + (subtitle ? '<span>' + _lstSanitize(subtitle) + '</span>' : '')
                + '</div>';
        }

        html += '<div class="mlst-item" style="position:relative;padding:' + (gap + 2) + 'px 8px ' + (gap + 2) + 'px 4px;border-radius:8px;'
            + (hasDivider && !isLast ? 'border-bottom:1px solid rgba(0,0,0,.06);' : '') + '">'
            + '<span class="' + dotClass + '" style="' + dotStyle + '"></span>'
            + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + mainContent + badgeHtml2 + '</div>'
            + metaHtml
            + '</div>';
    });
    html += '</div>';
    return html;
}

function _lstRenderCards(rows, cfg, bColor, textColor, gap, bd) {
    var tf = cfg.textFormat || {};
    var fontWeight = tf.fontWeight || 'normal';
    var radius = (bd && bd.radius) || 8;

    var html = '<div style="display:flex;flex-direction:column;gap:' + (gap + 2) + 'px;">';
    rows.forEach(function (row, idx) {
        var label    = cfg.labelField ? (row[cfg.labelField] !== undefined ? row[cfg.labelField] : '') : (row[Object.keys(row)[0]] || '');
        var subtitle = cfg.subtitleField ? (row[cfg.subtitleField] || '') : '';
        var date     = cfg.dateField ? (row[cfg.dateField] || '') : '';
        var badgeVal = cfg.badgeField ? (row[cfg.badgeField] || '') : '';
        var isLink   = !!(cfg.isLink && cfg.linkField && row[cfg.linkField]);
        var href     = isLink ? String(row[cfg.linkField]) : '';
        var linkText = (cfg.linkLabel && row[cfg.linkLabel]) ? String(row[cfg.linkLabel]) : _lstSanitize(label);

        var labelWeight = (fontWeight === 'normal') ? '500' : fontWeight;
        var itemTarget  = row._mi_target || cfg.linkTarget || '_blank';
        var itemColor   = row._mi_color  || bColor;

        var mainContent = isLink
            ? '<a href="' + _lstSanitize(href) + '" target="' + itemTarget + '" style="font-weight:' + labelWeight + ';color:' + itemColor + ';">' + linkText + '</a>'
            : '<span style="font-weight:' + labelWeight + ';color:' + (textColor || '#1e293b') + ';">' + _lstSanitize(label) + '</span>';

        var badgeHtml2 = '';
        if (badgeVal && cfg.badgeStyle !== 'none') {
            var bC = _lstPhcColor(cfg.badgeColor, '');
            if (cfg.badgeStyle === 'dot') {
                badgeHtml2 = '<span style="width:9px;height:9px;border-radius:50%;background:' + bC + ';display:inline-block;flex-shrink:0;box-shadow:0 0 0 3px ' + bC + '25;" title="' + _lstSanitize(badgeVal) + '"></span>';
            } else {
                badgeHtml2 = '<span style="font-size:10px;font-weight:600;padding:2px 9px;border-radius:20px;background:' + bC + '18;color:' + bC + ';border:1px solid ' + bC + '30;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;">' + _lstSanitize(badgeVal) + '</span>';
            }
        }

        var metaHtml = '';
        if (subtitle || date) {
            metaHtml = '<div style="font-size:.82em;color:#94a3b8;margin-top:4px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">'
                + (date ? '<span style="display:inline-flex;align-items:center;gap:2px;"><i class="glyphicon glyphicon-time" style="font-size:9px;opacity:.7;"></i>' + _lstSanitize(date) + '</span>' : '')
                + (date && subtitle ? '<span style="opacity:.35;font-size:.9em;">·</span>' : '')
                + (subtitle ? '<span>' + _lstSanitize(subtitle) + '</span>' : '')
                + '</div>';
        }

        html += '<div class="mlst-item" style="'
            + 'background:#fff;'
            + 'border:1px solid rgba(0,0,0,.07);'
            + 'border-left:3px solid ' + bColor + ';'
            + 'border-radius:' + radius + 'px;'
            + 'padding:11px 14px 11px 12px;'
            + 'cursor:default;'
            + 'box-shadow:0 1px 3px rgba(0,0,0,.04),0 2px 8px rgba(0,0,0,.03);">'
            + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + mainContent + '</div>'
            + metaHtml
            + '</div>'
            + (badgeVal && cfg.badgeStyle !== 'none' ? '<div style="flex-shrink:0;padding-top:2px;">' + badgeHtml2 + '</div>' : '')
            + '</div>'
            + '</div>';
    });
    html += '</div>';
    return html;
}

function _lstRenderRow(rows, cfg, bColor, textColor, gap) {
    var tf = cfg.textFormat || {};
    var fontWeight = cfg.listStyle === 'row' ? (tf.fontWeight || 'normal') : 'normal';
    var hasDivider = !!cfg.divider;

    var html = '<div style="display:flex;flex-direction:column;">';
    rows.forEach(function (row, idx) {
        var label    = cfg.labelField ? (row[cfg.labelField] !== undefined ? row[cfg.labelField] : '') : (row[Object.keys(row)[0]] || '');
        var subtitle = cfg.subtitleField ? (row[cfg.subtitleField] || '') : '';
        var date     = cfg.dateField ? (row[cfg.dateField] || '') : '';
        var badgeVal = cfg.badgeField ? (row[cfg.badgeField] || '') : '';
        var isLink   = !!(cfg.isLink && cfg.linkField && row[cfg.linkField]);
        var href     = isLink ? String(row[cfg.linkField]) : '';

        var itemTarget = row._mi_target || cfg.linkTarget || '_blank';
        var itemColor  = row._mi_color  || bColor;

        var isLast = idx === rows.length - 1;
        var divStyle = (!isLast && hasDivider) ? 'border-bottom:1px solid rgba(0,0,0,.055);' : '';
        var rowPad   = (gap + 4) + 'px 10px';

        // Meta
        var metaHtml = '';
        if (subtitle || date) {
            metaHtml = '<div style="font-size:.8em;color:#94a3b8;margin-top:2px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;">'
                + (date ? '<span style="display:inline-flex;align-items:center;gap:2px;"><i class="glyphicon glyphicon-time" style="font-size:9px;opacity:.7;"></i>' + _lstSanitize(date) + '</span>' : '')
                + (date && subtitle ? '<span style="opacity:.3;font-size:.9em;">\u00b7</span>' : '')
                + (subtitle ? '<span>' + _lstSanitize(subtitle) + '</span>' : '')
                + '</div>';
        }

        // Badge
        var badgeHtml = '';
        if (badgeVal && cfg.badgeStyle !== 'none') {
            var bC = _lstPhcColor(cfg.badgeColor, '');
            if (cfg.badgeStyle === 'dot') {
                badgeHtml = '<span style="width:7px;height:7px;border-radius:50%;background:' + bC + ';display:inline-block;flex-shrink:0;box-shadow:0 0 0 2px ' + bC + '30;"></span>';
            } else {
                badgeHtml = '<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:' + bC + '18;color:' + bC + ';border:1px solid ' + bC + '30;white-space:nowrap;flex-shrink:0;letter-spacing:.2px;">' + _lstSanitize(badgeVal) + '</span>';
            }
        }

        var arrBg   = cfg.markerBgColor  || 'rgba(0,0,0,.08)';
        var arrIcon = cfg.markerIconColor || itemColor;

        // Seta (só para links)
        var arrowHtml = isLink
            ? '<span class="mlst-row-arrow" style="flex-shrink:0;width:28px;height:28px;border-radius:9px;background:' + arrBg + ';display:inline-flex;align-items:center;justify-content:center;margin-left:6px;">'
              + '<i class="glyphicon glyphicon-chevron-right" style="font-size:11px;color:' + arrIcon + ';margin-top:1px;"></i>'
              + '</span>'
            : '';

        // Layout interno
        var innerHtml = '<div style="display:flex;align-items:center;gap:8px;width:100%;">'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-weight:' + fontWeight + ';color:' + (isLink ? itemColor : (textColor || '#1e293b')) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + _lstSanitize(label) + '</div>'
            + metaHtml
            + '</div>'
            + (badgeHtml ? '<span style="flex-shrink:0;">' + badgeHtml + '</span>' : '')
            + arrowHtml
            + '</div>';

        if (isLink) {
            html += '<a href="' + _lstSanitize(href) + '" target="' + itemTarget + '" class="mlst-item" style="display:block;padding:' + rowPad + ';border-radius:8px;text-decoration:none;' + divStyle + '">'
                + innerHtml
                + '</a>';
        } else {
            html += '<div class="mlst-item" style="display:block;padding:' + rowPad + ';border-radius:8px;' + divStyle + '">'
                + innerHtml
                + '</div>';
        }
    });
    html += '</div>';
    return html;
}

// ── Helper: linha de item manual ──────────────────────────────────────────────
function _lstManualItemRow(item) {
    var isLnk  = !!(item && item.isLink);
    var lbl    = _mciEsc((item && item.label)      || '');
    var url    = _mciEsc((item && item.url)        || '');
    var sub    = _mciEsc((item && item.subtitle)   || '');
    var tgt    = (item && item.linkTarget) || '_blank';
    var clr    = _mciEsc((item && item.linkColor)  || '#5b8dee');
    var tgtBlank = (tgt === '_blank') ? ' selected' : '';
    var tgtSelf  = (tgt === '_self')  ? ' selected' : '';
    return '<div class="mlst-manual-row" style="background:rgba(0,0,0,.022);border:1px solid rgba(0,0,0,.08);border-radius:8px;padding:9px 10px;margin-bottom:6px;">'
        + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;">'
        + '<span style="color:#b0bec5;cursor:grab;font-size:14px;line-height:1;user-select:none;flex-shrink:0;" title="Arrastar para reordenar">⠿</span>'
        + '<input type="text" class="mlst-mi-label form-control input-sm" placeholder="Título do item…" value="' + lbl + '" style="flex:1;min-width:0;">'
        + '<button type="button" class="mlst-mi-del" style="background:none;border:1px solid rgba(220,53,69,.3);color:#dc3545;border-radius:6px;width:26px;height:26px;min-width:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex-shrink:0;" title="Remover item"><i class="glyphicon glyphicon-trash" style="font-size:10px;"></i></button>'
        + '</div>'
        + '<input type="text" class="mlst-mi-sub form-control input-sm" placeholder="Subtítulo / descrição (opcional)…" value="' + sub + '" style="margin-bottom:7px;">'
        + _mciChk('mlst-mi-islink', 'É link', isLnk)
        + '<div class="mlst-mi-url-wrap" style="margin-top:6px;' + (!isLnk ? 'display:none;' : '') + '">'
        + '<input type="text" class="mlst-mi-url form-control input-sm" placeholder="URL (ex: https://…)" value="' + url + '" style="margin-bottom:6px;">'
        + '<div style="display:flex;align-items:center;gap:6px;">'
        + '<select class="mlst-mi-target form-control input-sm" style="flex:1;">'
        + '<option value="_blank"' + tgtBlank + '>↗ Nova janela</option>'
        + '<option value="_self"' + tgtSelf   + '>→ Mesma página</option>'
        + '</select>'
        + '<div style="display:flex;align-items:center;gap:4px;flex-shrink:0;" title="Cor do texto do link">'
        + '<i class="glyphicon glyphicon-tint" style="font-size:11px;color:#94a3b8;"></i>'
        + '<input type="color" class="mlst-mi-color" value="' + _mciColorInputValue(clr, '#2563eb') + '" style="width:32px;height:28px;border-radius:5px;border:1px solid rgba(0,0,0,.12);cursor:pointer;padding:1px;">'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>';
}

// ── Painel de Propriedades Inline ─────────────────────────────────────────────
function renderListaPropertiesInline(obj, panel) {
    panel.off();

    var stamp  = obj.mdashcontaineritemobjectstamp;
    var cfg    = _lstNormalizeConfig(obj.config);
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    _mciCSS();

    // ── fire() ───────────────────────────────────────────────────────────────
    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mlst-props-root').length) return;
            var newCfg = _lstReadConfig(panel, obj);
            obj.config = newCfg;
            obj.transformConfig = newCfg.transformConfig || obj.transformConfig || null;
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }

    // ── Estado de transformação ───────────────────────────────────────────────
    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);

    // ── Secção Dados ─────────────────────────────────────────────────────────
    function _fieldOpts(cur) {
        return '<option value="">-- campo --</option>'
            + fields.map(function (f) {
                return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
            }).join('');
    }

    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm">'
        + '<option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>'

        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo etiqueta</label><select class="mlst-labelfield form-control input-sm">' + _fieldOpts(cfg.labelField) + '</select></div>'
        + '<div class="mcbi-field"><label>Campo subtítulo</label><select class="mlst-subtitlefield form-control input-sm">' + _fieldOpts(cfg.subtitleField) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo data/hora</label><select class="mlst-datefield form-control input-sm">' + _fieldOpts(cfg.dateField) + '</select></div>'
        + '<div class="mcbi-field"><label>Máx. itens <small>(0=todos)</small></label><input type="number" class="mlst-maxitems form-control input-sm" value="' + (cfg.maxItems || 0) + '" min="0" max="500"></div>'
        + '</div>';

    // ── Secção Link ───────────────────────────────────────────────────────────
    var sLink = _mciChk('mlst-islink', 'Item é link', cfg.isLink)
        + '<div class="mcbi-row2 mlst-link-opts" ' + (!cfg.isLink ? 'style="display:none;"' : '') + '>'
        + '<div class="mcbi-field"><label>Campo URL</label><select class="mlst-linkfield form-control input-sm">' + _fieldOpts(cfg.linkField) + '</select></div>'
        + '<div class="mcbi-field"><label>Campo texto link</label><select class="mlst-linklabel form-control input-sm">' + _fieldOpts(cfg.linkLabel) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-field mlst-link-opts" ' + (!cfg.isLink ? 'style="display:none;"' : '') + '><label>Target do link</label>'
        + '<select class="mlst-linktarget form-control input-sm">'
        + [['_blank','Nova janela'],['_self','Mesma janela'],['_parent','Parent'],['_top','Top']].map(function(o){
            return '<option value="' + o[0] + '"' + (cfg.linkTarget === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>';

    // ── Secção Estilo ─────────────────────────────────────────────────────────
    var colorNames = [['primary','Primary (PHC)'],['success','Success'],['warning','Warning'],['danger','Danger'],['info','Info'],['secondary','Secondary'],['custom','Personalizada']];
    function colorSelect(cls, cur, label) {
        return '<div class="mcbi-field"><label>' + label + '</label>'
            + '<select class="' + cls + ' form-control input-sm">'
            + colorNames.map(function(c){ return '<option value="' + c[0] + '"' + (cur===c[0]?' selected':'') + '>' + c[1] + '</option>'; }).join('')
            + '</select></div>';
    }

    var sEstilo = '<div class="mcbi-field"><label>Estilo da lista</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(5,1fr);">'
        + [['numbered','<i class="fa fa-list-ol"></i><span>Numerada</span>'],
           ['timeline','<i class="fa fa-history"></i><span>Timeline</span>'],
           ['card','<i class="fa fa-th-large"></i><span>Cards</span>'],
           ['plain','<i class="fa fa-align-left"></i><span>Simples</span>'],
           ['row','<i class="glyphicon glyphicon-menu-right"></i><span>Linha</span>']]
        .map(function(s){
            return '<button type="button" class="mcbi-ct-btn mlst-style-btn' + (cfg.listStyle===s[0]?' is-on':'') + '" data-style="' + s[0] + '">' + s[1] + '</button>';
        }).join('') + '</div></div>'

        // Opções do bullet
        + '<div class="mlst-bullet-opts" ' + (cfg.listStyle==='numbered'||cfg.listStyle==='timeline'||cfg.listStyle==='card'||cfg.listStyle==='plain'||cfg.listStyle==='row' ? 'style="display:none;"' : '') + '>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Símbolo bullet</label>'
        + '<input type="text" class="mlst-bulletsym form-control input-sm" value="' + _mciEsc(cfg.bulletSymbol || '●') + '" style="width:60px;" maxlength="4"></div>'
        + '<div class="mcbi-field"><label>Tamanho bullet</label>'
        + '<input type="number" class="mlst-bulletsize form-control input-sm" value="' + (cfg.bulletSize || 14) + '" min="8" max="32"></div>'
        + '</div></div>'

        + colorSelect('mlst-bulletcolor', cfg.bulletColor, 'Cor bullet / dot / número')
        + '<div class="mcbi-field mlst-bullet-custom-wrap" ' + (cfg.bulletColor !== 'custom' ? 'style="display:none;"' : '') + '>'
        + '<label>Cor personalizada bullet</label>'
        + '<input type="color" class="mlst-bulletcolorcustom" value="' + _mciColorInputValue(cfg.bulletColorCustom, '#5b8dee') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'

        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Fundo do marcador</label>'
        + '<input type="color" class="mlst-markerbg form-control" value="' + _mciColorInputValue(cfg.markerBgColor, '#e0e8ff') + '" style="padding:2px;height:28px;cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Cor ícone / número</label>'
        + '<input type="color" class="mlst-markericoncol form-control" value="' + _mciColorInputValue(cfg.markerIconColor, '#5b8dee') + '" style="padding:2px;height:28px;cursor:pointer;"></div>'
        + '</div>'

        + '<div class="mlst-tl-color-wrap" ' + (cfg.listStyle !== 'timeline' ? 'style="display:none;"' : '') + '>'
        + colorSelect('mlst-tllinecolor', cfg.timelineLineColor, 'Cor da linha timeline')
        + '<div class="mcbi-field mlst-tl-custom-wrap" ' + (cfg.timelineLineColor !== 'custom' ? 'style="display:none;"' : '') + '>'
        + '<label>Cor personalizada linha</label>'
        + '<input type="color" class="mlst-tllinecolorcustom" value="' + _mciColorInputValue(cfg.timelineLineColorCustom, '#5b8dee') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '</div>'

        + '<div class="mcbi-checks">'
        + _mciChk('mlst-divider', 'Separador entre items', cfg.divider)
        + '</div>'

        // Badge
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo badge</label><select class="mlst-badgefield form-control input-sm">' + _fieldOpts(cfg.badgeField) + '</select></div>'
        + '<div class="mcbi-field"><label>Estilo badge</label>'
        + '<select class="mlst-badgestyle form-control input-sm">'
        + [['none','Sem badge'],['pill','Pill'],['dot','Dot']].map(function(o){
            return '<option value="' + o[0] + '"' + (cfg.badgeStyle===o[0]?' selected':'') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '</div>'
        + colorSelect('mlst-badgecolor', cfg.badgeColor, 'Cor do badge');

    // ── Secção Tipografia ──────────────────────────────────────────────────────
    var tx = cfg.textFormat || {};
    var sTipo = '<div class="mcbi-field"><label>Tamanho: <strong class="mlst-fs-lbl">' + (tx.fontSize || 14) + '</strong> px</label>'
        + '<input type="range" class="mlst-fontsize mcbi-height" min="10" max="28" step="1" value="' + (tx.fontSize || 14) + '"></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Família</label>'
        + '<select class="mlst-family form-control input-sm">'
        + ['Arial','Nunito, sans-serif','Helvetica','Georgia','Verdana','Inter, sans-serif','Segoe UI, sans-serif'].map(function(f){
            return '<option value="' + f + '"' + (tx.fontFamily===f?' selected':'') + '>' + f.split(',')[0] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Peso</label>'
        + '<select class="mlst-weight form-control input-sm">'
        + [['normal','Normal'],['500','Medium'],['600','Semi-bold'],['bold','Bold']].map(function(o){
            return '<option value="' + o[0] + '"' + (tx.fontWeight===o[0]?' selected':'') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Alinhamento</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(4,1fr);">'
        + [['left','glyphicon-align-left'],['center','glyphicon-align-center'],['right','glyphicon-align-right'],['justify','glyphicon-align-justify']].map(function(a){
            return '<button type="button" class="mcbi-ct-btn mlst-align' + (tx.textAlign===a[0]?' is-on':'') + '" data-align="' + a[0] + '"><i class="glyphicon ' + a[1] + '"></i></button>';
        }).join('') + '</div></div>';

    // ── Secção Cores ───────────────────────────────────────────────────────────
    var cl = cfg.colors || {};
    var sCores = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Cor do texto</label><input type="color" class="mlst-textcolor" value="' + _mciColorInputValue(cl.textColor && cl.textColor !== '' && cl.textColor !== 'inherit' ? cl.textColor : null, '#333333') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"> ' + _mciChk('mlst-textcolor-inherit', 'Herdar tema', !cl.textColor || cl.textColor === 'inherit') + '</div>'
        + '<div class="mcbi-field"><label>Cor de fundo</label><input type="color" class="mlst-bgcolor" value="' + _mciColorInputValue(cl.backgroundColor && cl.backgroundColor !== 'transparent' ? cl.backgroundColor : null, '#ffffff') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"> ' + _mciChk('mlst-bgtransp', 'Transparente', !cl.backgroundColor || cl.backgroundColor === 'transparent') + '</div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Hover fundo</label><input type="color" class="mlst-hoverbg" value="' + _mciColorInputValue(cl.hoverBgColor, '#f1f5f9') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Hover texto</label><input type="color" class="mlst-hovertxt" value="' + _mciColorInputValue(cl.hoverTextColor, '#1e293b') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '</div>';

    // ── Secção Espaçamento/Borda ────────────────────────────────────────────────
    var sp = cfg.spacing || {};
    var bd2 = cfg.border || {};
    var sLayout = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Gap items</label><input type="number" class="mlst-gap form-control input-sm" value="' + (sp.gap !== undefined ? sp.gap : 6) + '" min="0" max="40"></div>'
        + '<div class="mcbi-field"><label>Border radius</label><input type="number" class="mlst-brad form-control input-sm" value="' + (bd2.radius || 0) + '" min="0" max="40"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Padding H</label><input type="number" class="mlst-ph form-control input-sm" value="' + (sp.paddingLeft || 12) + '" min="0" max="60"></div>'
        + '<div class="mcbi-field"><label>Padding V</label><input type="number" class="mlst-pv form-control input-sm" value="' + (sp.paddingTop || 8) + '" min="0" max="60"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Borda largura</label><input type="number" class="mlst-bw form-control input-sm" value="' + (bd2.width || 0) + '" min="0" max="8"></div>'
        + '<div class="mcbi-field"><label>Borda cor</label><input type="color" class="mlst-bordercolor" value="' + _mciColorInputValue(bd2.borderColor && bd2.borderColor !== 'transparent' ? bd2.borderColor : null, '#e2e8f0') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '</div>';

    // ── Secção Items Manuais ───────────────────────────────────────────────────
    var sManual = _mciChk('mlst-usemanual', 'Activar items manuais (override de dados)', cfg.useManualItems)
        + '<div class="mlst-manual-wrap" ' + (!cfg.useManualItems ? 'style="display:none;"' : '') + '>'
        + '<div class="mlst-manual-list" style="margin-top:10px;">'
        + (cfg.manualItems && cfg.manualItems.length
            ? cfg.manualItems.map(function (it) { return _lstManualItemRow(it); }).join('')
            : '<div class="mcbi-info mlst-mi-empty" style="text-align:center;padding:10px 8px;">Sem items. Clique em <strong>+ Adicionar item</strong> para começar.</div>')
        + '</div>'
        + '<button type="button" class="mlst-mi-add" style="margin-top:8px;width:100%;border:1px dashed rgba(91,141,238,.45);background:rgba(91,141,238,.04);color:#5b8dee;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;">'
        + '<i class="glyphicon glyphicon-plus" style="font-size:10px;"></i> Adicionar item</button>'
        + '</div>';

    // ── Montar HTML do painel ──────────────────────────────────────────────────
    function _sec(icon, title, body, open) {
        return '<div class="mcbi-section' + (open ? ' is-open' : '') + '">'
            + '<div class="mcbi-section-hd"><i class="' + icon + '" style="width:14px;"></i> ' + title
            + '<i class="glyphicon ' + (open ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down') + ' mcbi-chev" style="margin-left:auto;font-size:9px;"></i></div>'
            + '<div class="mcbi-section-bd">' + body + '</div></div>';
    }

    var panelHtml = '<div class="mlst-props-root">'
        + _sec('fa fa-database', 'Dados & Transformação', sDados, true)
        + _sec('fa fa-link', 'Link', sLink, !!cfg.isLink)
        + _sec('fa fa-list-ul', 'Items Manuais', sManual, !!cfg.useManualItems)
        + _sec('fa fa-paint-brush', 'Estilo da Lista', sEstilo, true)
        + _sec('fa fa-font', 'Tipografia', sTipo, false)
        + _sec('fa fa-tint', 'Cores', sCores, false)
        + _sec('fa fa-arrows-alt', 'Layout & Espaçamento', sLayout, false)
        + '</div>';

    panel.html(panelHtml);

    // ── Eventos ───────────────────────────────────────────────────────────────

    // Collapse sections
    panel.on('click.lstinline', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });

    // Botões de estilo de lista
    panel.on('click.lstinline', '.mlst-style-btn', function () {
        panel.find('.mlst-style-btn').removeClass('is-on');
        $(this).addClass('is-on');
        var style = $(this).data('style');
        // Mostrar/esconder opções dependentes
        panel.find('.mlst-bullet-opts').toggle(style === 'bullet');
        panel.find('.mlst-tl-color-wrap').toggle(style === 'timeline');
        fire();
    });

    // Botões de alinhamento
    panel.on('click.lstinline', '.mlst-align', function () {
        panel.find('.mlst-align').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });

    // Checkbox toggles
    panel.on('change.lstinline', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        var name = $(this).closest('.mcbi-chk').data('chk') || $(this).closest('.mcbi-chk').attr('class');
        // Mostrar/esconder link opts
        if ($(this).hasClass('mlst-islink') || $(this).is('input.mlst-islink')) {
            panel.find('.mlst-link-opts').toggle(this.checked);
        }
        fire();
    });

    // Cores de bullet/timeline custom
    panel.on('change.lstinline', '.mlst-bulletcolor', function () {
        panel.find('.mlst-bullet-custom-wrap').toggle($(this).val() === 'custom');
        fire();
    });
    panel.on('change.lstinline', '.mlst-tllinecolor', function () {
        panel.find('.mlst-tl-custom-wrap').toggle($(this).val() === 'custom');
        fire();
    });

    // Slider de font-size
    panel.on('input.lstinline', '.mlst-fontsize', function () {
        panel.find('.mlst-fs-lbl').text($(this).val()); fire();
    });

    // ── Items manuais ─────────────────────────────────────────────────────────
    panel.on('change.lstinline', 'input.mlst-usemanual', function () {
        panel.find('.mlst-manual-wrap').toggle(this.checked);
        // fire() chamado pelo handler geral de checkboxes
    });
    panel.on('change.lstinline', 'input.mlst-mi-islink', function () {
        $(this).closest('.mlst-manual-row').find('.mlst-mi-url-wrap').toggle(this.checked);
        // fire() chamado pelo handler geral de checkboxes
    });
    panel.on('click.lstinline', '.mlst-mi-del', function () {
        $(this).closest('.mlst-manual-row').remove();
        if (!panel.find('.mlst-manual-row').length) {
            panel.find('.mlst-manual-list').html('<div class="mcbi-info mlst-mi-empty" style="text-align:center;padding:10px 8px;">Sem items. Clique em <strong>+ Adicionar item</strong> para começar.</div>');
        }
        fire();
    });
    panel.on('click.lstinline', '.mlst-mi-add', function () {
        panel.find('.mlst-mi-empty').remove();
        panel.find('.mlst-manual-list').append(_lstManualItemRow({ label: '', url: '', isLink: false, subtitle: '' }));
        fire();
    });

    // Todos os outros inputs — text inputs só disparam no change (blur), evita re-render a cada tecla
    panel.on('change.lstinline', 'input.form-control, select.form-control', function () {
        fire();
    });
    // Sliders, color pickers e number spinners mantêm feedback imediato
    panel.on('input.lstinline change.lstinline', 'input[type=color], input[type=number], input[type=range]', function () {
        fire();
    });

    // Fonte change
    panel.on('change.lstinline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        if (fs) {
            _mciOnFonteSelected(fs, obj, panel, function () {
                var newFields = _mciGetFields(obj);
                fields = newFields;
                panel.find('.mlst-labelfield, .mlst-subtitlefield, .mlst-datefield, .mlst-linkfield, .mlst-linklabel, .mlst-badgefield').each(function () {
                    var cur = $(this).val();
                    _mciSetSelectFields($(this), newFields, '-- campo --');
                    if (newFields.indexOf(cur) >= 0) $(this).val(cur);
                });
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                fire();
            });
        } else {
            obj.fontestamp = '';
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
            var newFields = _mciGetFields(obj);
            fields = newFields;
            panel.find('.mlst-labelfield, .mlst-subtitlefield, .mlst-datefield, .mlst-linkfield, .mlst-linklabel, .mlst-badgefield').each(function () {
                var cur = $(this).val();
                _mciSetSelectFields($(this), newFields, '-- campo --');
                if (newFields.indexOf(cur) >= 0) $(this).val(cur);
            });
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            fire();
        }
    });

    // Botão transformação
    panel.on('click.lstinline', '.mcbi-btn-transform', function () { _lstOpenTransformModal(); });

    function _lstOpenTransformModal() {
        var _tFnt   = fontes.filter(function (f) { return f.mdashfontestamp === obj.fontestamp; })[0] || fontes[0];
        var _tName  = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : (_tFnt ? (_tFnt.codigo || _tFnt.descricao || '') : '');
        var _tFntName = _tFnt ? (_tFnt.descricao || _tFnt.codigo || _tName) : '';
        var _tCfgRaw  = obj.transformConfig || null;
        var MTB = (typeof MdashTransformBuilder !== 'undefined') ? MdashTransformBuilder : null;
        var _tConf = _tCfgRaw || (_tName && MTB ? MTB.autoConfig(_tName, 'Lista') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados — Lista',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'Lista',
            modalId: 'mlst-transform-modal',
            hostId: 'mlst-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                var newFields = _mciGetFields(obj);
                fields = newFields;
                panel.find('.mlst-labelfield, .mlst-subtitlefield, .mlst-datefield, .mlst-linkfield, .mlst-linklabel, .mlst-badgefield').each(function () {
                    _mciSetSelectFields($(this), newFields, '-- campo --');
                });
                fire();
            }
        });
    }
}

// ── _lstReadConfig ─────────────────────────────────────────────────────────
function _lstReadConfig(panel, obj) {
    var cfg = _lstNormalizeConfig(obj.config);

    cfg.labelField    = panel.find('.mlst-labelfield').val() || '';
    cfg.subtitleField = panel.find('.mlst-subtitlefield').val() || '';
    cfg.dateField     = panel.find('.mlst-datefield').val() || '';
    cfg.maxItems      = parseInt(panel.find('.mlst-maxitems').val()) || 0;

    cfg.isLink     = panel.find('input.mlst-islink').is(':checked');
    cfg.linkField  = panel.find('.mlst-linkfield').val() || '';
    cfg.linkLabel  = panel.find('.mlst-linklabel').val() || '';
    cfg.linkTarget = panel.find('.mlst-linktarget').val() || '_blank';

    cfg.listStyle       = panel.find('.mlst-style-btn.is-on').data('style') || 'bullet';
    cfg.bulletSymbol    = panel.find('.mlst-bulletsym').val() || '●';
    cfg.bulletSize      = parseInt(panel.find('.mlst-bulletsize').val()) || 14;
    cfg.bulletColor     = panel.find('.mlst-bulletcolor').val() || 'primary';
    cfg.bulletColorCustom = panel.find('.mlst-bulletcolorcustom').val() || '#5b8dee';
    cfg.markerBgColor    = panel.find('.mlst-markerbg').val() || '';
    cfg.markerIconColor  = panel.find('.mlst-markericoncol').val() || '';
    cfg.timelineLineColor = panel.find('.mlst-tllinecolor').val() || 'primary';
    cfg.timelineLineColorCustom = panel.find('.mlst-tllinecolorcustom').val() || '#5b8dee';
    cfg.divider = panel.find('input.mlst-divider').is(':checked');

    cfg.badgeField = panel.find('.mlst-badgefield').val() || '';
    cfg.badgeStyle = panel.find('.mlst-badgestyle').val() || 'none';
    cfg.badgeColor = panel.find('.mlst-badgecolor').val() || 'primary';

    cfg.textFormat = {
        fontSize:   parseInt(panel.find('.mlst-fontsize').val()) || 14,
        fontFamily: panel.find('.mlst-family').val() || 'Nunito, sans-serif',
        fontWeight: panel.find('.mlst-weight').val() || 'normal',
        textAlign:  panel.find('.mlst-align.is-on').data('align') || 'left',
        lineHeight: 1.6
    };

    var textInherit = panel.find('input.mlst-textcolor-inherit').is(':checked');
    var bgTransp    = panel.find('input.mlst-bgtransp').is(':checked');
    cfg.colors = {
        textColor:      textInherit ? '' : (panel.find('.mlst-textcolor').val() || '#333333'),
        backgroundColor: bgTransp ? 'transparent' : (panel.find('.mlst-bgcolor').val() || '#ffffff'),
        borderColor:    panel.find('.mlst-bordercolor').val() || 'transparent',
        hoverBgColor:   panel.find('.mlst-hoverbg').val() || 'rgba(0,0,0,.04)',
        hoverTextColor: panel.find('.mlst-hovertxt').val() || ''
    };

    var gap = parseInt(panel.find('.mlst-gap').val());
    var ph  = parseInt(panel.find('.mlst-ph').val());
    var pv  = parseInt(panel.find('.mlst-pv').val());
    cfg.spacing = { paddingTop: isNaN(pv)?8:pv, paddingRight: isNaN(ph)?12:ph, paddingBottom: isNaN(pv)?8:pv, paddingLeft: isNaN(ph)?12:ph, gap: isNaN(gap)?6:gap };
    cfg.border  = { width: parseInt(panel.find('.mlst-bw').val())||0, style: 'solid', radius: parseInt(panel.find('.mlst-brad').val())||0 };

    cfg.transformConfig = obj.transformConfig || null;

    cfg.useManualItems = panel.find('input.mlst-usemanual').is(':checked');
    cfg.manualItems = [];
    panel.find('.mlst-manual-row').each(function () {
        var $r  = $(this);
        var lbl = ($r.find('.mlst-mi-label').val() || '').trim();
        if (!lbl) return;
        var isLnk = $r.find('input.mlst-mi-islink').is(':checked');
        cfg.manualItems.push({
            label:      lbl,
            url:        isLnk ? ($r.find('.mlst-mi-url').val() || '').trim() : '',
            isLink:     isLnk,
            subtitle:   ($r.find('.mlst-mi-sub').val() || '').trim(),
            linkTarget: isLnk ? ($r.find('.mlst-mi-target').val() || '_blank') : '_blank',
            linkColor:  isLnk ? ($r.find('.mlst-mi-color').val() || '') : ''
        });
    });

    return cfg;
}

// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO TEXTO — Fonte + Transformação + Editor Inline (padrão gráfico)
// ══════════════════════════════════════════════════════════════════════════════

var _TEXT_SAMPLE_CONFIG = {
    dataField: '', staticText: 'Texto personalizado aqui...',
    dataFormat: { type: 'text', locale: 'pt-PT', currency: 'EUR', currencyPosition: 'right', decimalSeparator: 'locale', minimumFractionDigits: 0, maximumFractionDigits: 2, prefix: '', suffix: '', fallbackValue: '' },
    content: { htmlEnabled: false, multipleValues: false, separator: ', ' },
    textFormat: { fontSize: 18, fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Nunito, sans-serif', textAlign: 'center', lineHeight: 1.5 },
    colors: { textColor: '#6d7c91', backgroundColor: 'transparent', borderColor: 'transparent' },
    spacing: { paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, marginTop: 0, marginBottom: 0 },
    border: { width: 0, style: 'solid', radius: 0 },
    effects: { textShadow: false, shadowColor: '#666666', shadowBlur: 2, shadowOffsetX: 1, shadowOffsetY: 1 },
    dimensions: { width: '100%', height: 'auto', maxWidth: 'none' }
};

function _txtDeepMerge(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (key) {
        var srcVal = source[key];
        if (Array.isArray(srcVal)) {
            target[key] = srcVal.slice();
            return;
        }
        if (srcVal && typeof srcVal === 'object') {
            var base = (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) ? target[key] : {};
            target[key] = _txtDeepMerge(base, srcVal);
            return;
        }
        if (srcVal !== undefined) target[key] = srcVal;
    });
    return target;
}

function _txtNormalizeConfig(rawCfg) {
    var base = JSON.parse(JSON.stringify(_TEXT_SAMPLE_CONFIG));
    if (!rawCfg || typeof rawCfg !== 'object') return base;

    // Compatibilidade com configs antigas que guardavam separador fora de content
    if (typeof rawCfg.separator === 'string' && rawCfg.separator.length >= 0) {
        base.content.separator = rawCfg.separator;
    }
    if (rawCfg.content && typeof rawCfg.content.separador === 'string' && rawCfg.content.separador.length >= 0) {
        base.content.separator = rawCfg.content.separador;
    }

    return _txtDeepMerge(base, rawCfg);
}

function _txtGetSeparator(cfg) {
    if (!cfg || typeof cfg !== 'object') return ', ';
    if (cfg.content && typeof cfg.content.separator === 'string') return cfg.content.separator;
    if (cfg.content && typeof cfg.content.separador === 'string') return cfg.content.separador;
    if (typeof cfg.separator === 'string') return cfg.separator;
    return ', ';
}

function renderObjectTexto(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = _txtNormalizeConfig(dados.config);
    var isSample = !!dados.isSample;

    var rows = [];
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    
    // PRIORIDADE: transformConfig SEMPRE tem prioridade sobre dados.data
    if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                isSample = false;
            }
        } catch (e) {
            console.warn('[MDash] renderObjectTexto fallback transform error:', e.message);
        }
    }
    
    // Fallback: usar dados.data se não há transformConfig ou se a transformação falhou
    if (rows.length === 0 && dados.data && dados.data.length > 0) {
        rows = dados.data;
        isSample = false;
    }
    
    // Última opção: dados de amostra
    if (rows.length === 0) {
        rows = getMdashSampleData('text');
        isSample = true;
    }

    var df = cfg.dataFormat || {};
    var htmlEnabled = !!(cfg.content && cfg.content.htmlEnabled);

    // Quando htmlEnabled, prefixo/sufixo/valor são tratados como HTML cru;
    // caso contrário são escapados. Mantém paridade com o comportamento antigo.
    function out(s) { return htmlEnabled ? (s == null ? '' : String(s)) : _txtEsc(s); }

    // Constrói o grupo de spans (prefixo + valor + sufixo) para UM valor.
    // O span do valor guarda o valor BRUTO em data-raw-value para acesso
    // programático (ex.: ler -6.01 em vez de "-6.01% MT").
    function spanGroup(rawValue, formattedNoAffix) {
        var h = '';
        if (df.prefix) h += '<span class="m-dash-text-prefix">' + out(df.prefix) + '</span>';
        var rawAttr = (rawValue === null || rawValue === undefined)
            ? '' : ' data-raw-value="' + _txtEsc(rawValue) + '"';
        h += '<span class="m-dash-text-value"' + rawAttr + '>' + out(formattedNoAffix) + '</span>';
        if (df.suffix) h += '<span class="m-dash-text-suffix">' + out(df.suffix) + '</span>';
        return h;
    }

    var inner = '';
    if (cfg.dataField && rows.length > 0) {
        if (cfg.content && cfg.content.multipleValues) {
            var sep = _txtGetSeparator(cfg);
            inner = rows.map(function (item) {
                var raw = _txtResolveFieldValue(item[cfg.dataField], df);
                return '<span class="m-dash-text-item">'
                    + spanGroup(raw, _txtFormatNoAffix(raw, df))
                    + '</span>';
            }).join('<span class="m-dash-text-sep">' + out(sep) + '</span>');
        } else {
            var raw = _txtResolveFieldValue(rows[0][cfg.dataField], df);
            inner = spanGroup(raw, _txtFormatNoAffix(raw, df));
        }
    } else if (cfg.staticText) {
        inner = spanGroup(cfg.staticText, cfg.staticText);
    } else {
        inner = spanGroup(null, 'Texto personalizado aqui...');
    }

    var styles = _txtBuildStyles(cfg);
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';
    var textId = 'mtext_' + stamp;

    var html = badgeHtml
        + '<div id="' + textId + '" class="m-dash-text-element" style="' + styles + '">'
        + inner
        + '</div>';
    $(dados.containerSelector).html(html);
}

// Escapa texto para HTML seguro.
function _txtEsc(s) {
    return $('<div>').text(s === null || s === undefined ? '' : String(s)).html();
}

function _txtIsEmptyValue(v) {
    return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

function _txtDefaultFallbackForType(type) {
    switch (type) {
        case 'number':
        case 'currency':
        case 'percentage':
            return 0;
        default:
            return '';
    }
}

function _txtCoerceFallbackValue(fallback, type) {
    type = type || 'text';
    if (type === 'number' || type === 'currency' || type === 'percentage') {
        var n = parseFloat(String(fallback).replace(/\s/g, '').replace(',', '.'));
        return isNaN(n) ? 0 : n;
    }
    return fallback == null ? '' : String(fallback);
}

function _txtResolveFieldValue(rawValue, df) {
    df = df || {};
    if (!_txtIsEmptyValue(rawValue)) return rawValue;
    var fb = df.fallbackValue;
    if (fb !== null && fb !== undefined && String(fb).trim() !== '') {
        return _txtCoerceFallbackValue(fb, df.type || 'text');
    }
    return _txtDefaultFallbackForType(df.type || 'text');
}

// Formata um valor SEM aplicar prefixo/sufixo (estes passam a spans próprios).
function _txtFormatNoAffix(rawValue, df) {
    if (!df) return rawValue == null ? '' : String(rawValue);
    var clone = {};
    for (var k in df) { if (Object.prototype.hasOwnProperty.call(df, k)) clone[k] = df[k]; }
    clone.prefix = '';
    clone.suffix = '';
    return formatDataValue(rawValue, clone);
}

// Mapeia text-align → justify-content para o layout flex do elemento de texto.
function _txtAlignToJustify(a) {
    switch (a) {
        case 'center': return 'center';
        case 'right': return 'flex-end';
        case 'justify': return 'space-between';
        default: return 'flex-start';
    }
}

function _txtBuildStyles(cfg) {
    var s = '';
    var tf = cfg.textFormat || {};
    s += 'font-size:' + (tf.fontSize || 18) + 'px;';
    s += 'font-weight:' + (tf.fontWeight || 'bold') + ';';
    s += 'font-style:' + (tf.fontStyle || 'normal') + ';';
    s += 'font-family:' + (tf.fontFamily || 'Nunito, sans-serif') + ';';
    var align = tf.textAlign || 'left';
    s += 'text-align:' + align + ';';
    s += 'line-height:' + (tf.lineHeight || 1.5) + ';';
    // Layout flex: prefixo / valor / sufixo são spans alinhados na baseline,
    // com wrap para múltiplos valores. justify-content reflete o alinhamento.
    s += 'display:flex;flex-wrap:wrap;align-items:baseline;column-gap:2px;';
    s += 'justify-content:' + _txtAlignToJustify(align) + ';';
    var cl = cfg.colors || {};
    s += 'color:' + (cl.textColor || '#6d7c91') + ';';
    if (cl.backgroundColor && cl.backgroundColor !== 'transparent') s += 'background-color:' + cl.backgroundColor + ';';
    var sp = cfg.spacing || {};
    s += 'padding:' + (sp.paddingTop || 0) + 'px ' + (sp.paddingRight || 0) + 'px ' + (sp.paddingBottom || 0) + 'px ' + (sp.paddingLeft || 0) + 'px;';
    s += 'margin:' + (sp.marginTop || 0) + 'px 0 ' + (sp.marginBottom || 0) + 'px 0;';
    var bd = cfg.border || {};
    if (bd.width > 0) s += 'border:' + bd.width + 'px ' + (bd.style || 'solid') + ' ' + (cl.borderColor || 'transparent') + ';';
    s += 'border-radius:' + (bd.radius || 0) + 'px;';
    var ef = cfg.effects || {};
    if (ef.textShadow) s += 'text-shadow:' + (ef.shadowOffsetX || 1) + 'px ' + (ef.shadowOffsetY || 1) + 'px ' + (ef.shadowBlur || 2) + 'px ' + (ef.shadowColor || '#666666') + ';';
    var dm = cfg.dimensions || {};
    s += 'width:' + (dm.width || '100%') + ';';
    if (dm.height && dm.height !== 'auto') s += 'height:' + dm.height + ';';
    if (dm.maxWidth && dm.maxWidth !== 'none') s += 'max-width:' + dm.maxWidth + ';';
    return s;
}

function renderTextPropertiesInline(obj, panel) {
    // Limpar TODOS os event handlers para evitar conflito com outros tipos de objetos
    panel.off();
    
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = _txtNormalizeConfig(obj.config);
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var isSample = !obj.fontestamp;

    // Dados (fonte + transform) — SEMPRE usar obj.transformConfig (root level) como fonte de verdade
    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    // Conteúdo
    function _txtFieldOpts(cur) {
        return '<option value="">-- campo --</option>'
            + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
    }
    var ct = cfg.content || {};
    var sConteudo = '<div class="mcbi-field"><label>Campo de dados</label>'
        + '<select class="mtxt-datafield form-control input-sm">' + _txtFieldOpts(cfg.dataField) + '</select></div>'
        + '<div class="mcbi-field"><label>Texto estático (alternativo)</label>'
        + '<input type="text" class="mtxt-static form-control input-sm" value="' + _mciEsc(cfg.staticText || '') + '" placeholder="Texto fixo se não selecionar campo"></div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mtxt-multi', 'Múltiplos valores', ct.multipleValues)
        + _mciChk('mtxt-html', 'Permitir HTML', ct.htmlEnabled)
        + '</div>'
        + '<div class="mcbi-field"><label>Separador</label>'
        + '<input type="text" class="mtxt-sep form-control input-sm" value="' + _mciEsc(_txtGetSeparator(cfg)) + '" style="width:80px;"></div>';

    // Formatação de dados
    var df = cfg.dataFormat || {};
    var sFormato = '<div class="mcbi-field"><label>Tipo de formatação</label>'
        + '<select class="mtxt-fmttype form-control input-sm">'
        + [['text', 'Texto'], ['number', 'Número'], ['currency', 'Moeda'], ['percentage', 'Percentagem'], ['date', 'Data']].map(function (o) {
            return '<option value="' + o[0] + '"' + (df.type === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Localização</label>'
        + '<select class="mtxt-locale form-control input-sm">'
        + ['pt-PT', 'pt-BR', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'].map(function (l) {
            return '<option value="' + l + '"' + (df.locale === l ? ' selected' : '') + '>' + l + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Moeda</label>'
        + '<input type="text" class="mtxt-currency form-control input-sm" value="' + _mciEsc(df.currency || 'EUR') + '" style="width:60px;"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Min. decimais</label>'
        + '<input type="number" class="mtxt-mindec form-control input-sm" value="' + (df.minimumFractionDigits || 0) + '" min="0" max="20"></div>'
        + '<div class="mcbi-field"><label>Max. decimais</label>'
        + '<input type="number" class="mtxt-maxdec form-control input-sm" value="' + (df.maximumFractionDigits || 2) + '" min="0" max="20"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Separador decimal</label>'
        + '<select class="mtxt-decsep form-control input-sm">'
        + [['locale', 'Do locale'], [',', 'Vírgula (,)'], ['.', 'Ponto (.)']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((df.decimalSeparator || 'locale') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Prefixo</label>'
        + '<input type="text" class="mtxt-prefix form-control input-sm" value="' + _mciEsc(df.prefix || '') + '"></div>'
        + '<div class="mcbi-field"><label>Sufixo</label>'
        + '<input type="text" class="mtxt-suffix form-control input-sm" value="' + _mciEsc(df.suffix || '') + '"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Valor se vazio</label>'
        + '<input type="text" class="mtxt-fallback form-control input-sm" value="' + _mciEsc(df.fallbackValue != null ? String(df.fallbackValue) : '') + '" placeholder="ex: 0, N/A, —"></div>'
        + '<div class="mcbi-info">Quando o campo não existir ou estiver vazio. Se deixar em branco: número/moeda/% usam <b>0</b>, texto fica vazio.</div>';

    // Tipografia
    var tx = cfg.textFormat || {};
    var sTipo = '<div class="mcbi-field"><label>Tamanho: <strong class="mtxt-fs-lbl">' + (tx.fontSize || 18) + '</strong> px</label>'
        + '<input type="range" class="mtxt-fontsize mcbi-height" min="8" max="72" step="1" value="' + (tx.fontSize || 18) + '"></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Família</label>'
        + '<select class="mtxt-family form-control input-sm">'
        + ['Arial', 'Nunito, sans-serif', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Trebuchet MS', 'Arial Black', 'Inter, sans-serif', 'Segoe UI, sans-serif'].map(function (f) {
            return '<option value="' + f + '"' + (tx.fontFamily === f ? ' selected' : '') + '>' + f.split(',')[0] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Peso</label>'
        + '<select class="mtxt-weight form-control input-sm">'
        + [['normal', 'Normal'], ['bold', 'Bold'], ['lighter', 'Lighter'], ['100', '100'], ['200', '200'], ['300', '300'], ['400', '400'], ['500', '500'], ['600', '600'], ['700', '700'], ['800', '800'], ['900', '900']].map(function (o) {
            return '<option value="' + o[0] + '"' + (tx.fontWeight === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Estilo</label>'
        + '<select class="mtxt-style form-control input-sm">'
        + [['normal', 'Normal'], ['italic', 'Italic'], ['oblique', 'Oblique']].map(function (o) {
            return '<option value="' + o[0] + '"' + (tx.fontStyle === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Altura linha: <strong class="mtxt-lh-lbl">' + (tx.lineHeight || 1.5) + '</strong></label>'
        + '<input type="range" class="mtxt-lineheight mcbi-height" min="0.5" max="3" step="0.1" value="' + (tx.lineHeight || 1.5) + '"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Alinhamento</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(4,1fr);">'
        + [['left', 'glyphicon-align-left'], ['center', 'glyphicon-align-center'], ['right', 'glyphicon-align-right'], ['justify', 'glyphicon-align-justify']].map(function (a) {
            return '<button type="button" class="mcbi-ct-btn mtxt-align' + (tx.textAlign === a[0] ? ' is-on' : '') + '" data-align="' + a[0] + '"><i class="glyphicon ' + a[1] + '"></i><span>' + a[0] + '</span></button>';
        }).join('') + '</div></div>';

    // Cores
    var cl = cfg.colors || {};
    var sCores = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Cor do texto</label>'
        + '<input type="color" class="mtxt-textcolor" value="' + _mciColorInputValue(cl.textColor, '#6d7c91') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Cor de fundo</label>'
        + '<input type="color" class="mtxt-bgcolor" value="' + _mciColorInputValue(cl.backgroundColor && cl.backgroundColor !== 'transparent' ? cl.backgroundColor : null, '#ffffff') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
        + ' ' + _mciChk('mtxt-bgtransp', 'Transparente', cl.backgroundColor === 'transparent') + '</div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Cor da borda</label>'
        + '<input type="color" class="mtxt-bordercolor" value="' + _mciColorInputValue(cl.borderColor && cl.borderColor !== 'transparent' ? cl.borderColor : null, '#cccccc') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
        + ' ' + _mciChk('mtxt-bordertransp', 'Transparente', cl.borderColor === 'transparent') + '</div>';

    // Espaçamento
    var sp = cfg.spacing || {};
    var sEspac = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Padding top</label><input type="number" class="mtxt-pt form-control input-sm" value="' + (sp.paddingTop || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Padding bottom</label><input type="number" class="mtxt-pb form-control input-sm" value="' + (sp.paddingBottom || 0) + '" min="0" max="100"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Padding left</label><input type="number" class="mtxt-pl form-control input-sm" value="' + (sp.paddingLeft || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Padding right</label><input type="number" class="mtxt-pr form-control input-sm" value="' + (sp.paddingRight || 0) + '" min="0" max="100"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Margem top</label><input type="number" class="mtxt-mt form-control input-sm" value="' + (sp.marginTop || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Margem bottom</label><input type="number" class="mtxt-mb form-control input-sm" value="' + (sp.marginBottom || 0) + '" min="0" max="100"></div>'
        + '</div>';

    // Bordo
    var bd = cfg.border || {};
    var sBordo = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Largura (px)</label><input type="number" class="mtxt-bw form-control input-sm" value="' + (bd.width || 0) + '" min="0" max="20"></div>'
        + '<div class="mcbi-field"><label>Raio (px)</label><input type="number" class="mtxt-brad form-control input-sm" value="' + (bd.radius || 0) + '" min="0" max="50"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Estilo</label>'
        + '<select class="mtxt-bstyle form-control input-sm">'
        + ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'].map(function (st) {
            return '<option value="' + st + '"' + (bd.style === st ? ' selected' : '') + '>' + st + '</option>';
        }).join('') + '</select></div>';

    // Efeitos
    var ef = cfg.effects || {};
    var sEfeitos = _mciChk('mtxt-shadow', 'Sombra do texto', ef.textShadow)
        + '<div class="mcbi-row2" style="margin-top:8px;">'
        + '<div class="mcbi-field"><label>Cor sombra</label>'
        + '<input type="color" class="mtxt-shcolor" value="' + _mciColorInputValue(ef.shadowColor, '#666666') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Desfoque</label><input type="number" class="mtxt-shblur form-control input-sm" value="' + (ef.shadowBlur || 2) + '" min="0" max="20"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Offset X</label><input type="number" class="mtxt-shx form-control input-sm" value="' + (ef.shadowOffsetX || 1) + '" min="-20" max="20"></div>'
        + '<div class="mcbi-field"><label>Offset Y</label><input type="number" class="mtxt-shy form-control input-sm" value="' + (ef.shadowOffsetY || 1) + '" min="-20" max="20"></div>'
        + '</div>';

    // Dimensões
    var dm = cfg.dimensions || {};
    var sDimensoes = '<div class="mcbi-field"><label>Largura</label>'
        + '<select class="mtxt-width form-control input-sm">'
        + ['auto', '100%', '75%', '50%', '25%'].map(function (w) {
            return '<option value="' + w + '"' + (dm.width === w ? ' selected' : '') + '>' + w + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Altura</label>'
        + '<select class="mtxt-height form-control input-sm">'
        + ['auto', '100px', '200px', '300px', '400px'].map(function (h) {
            return '<option value="' + h + '"' + (dm.height === h ? ' selected' : '') + '>' + h + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Largura máxima</label>'
        + '<select class="mtxt-maxw form-control input-sm">'
        + ['none', '100%', '500px', '800px', '1200px'].map(function (m) {
            return '<option value="' + m + '"' + (dm.maxWidth === m ? ' selected' : '') + '>' + m + '</option>';
        }).join('') + '</select></div>';

    // ── Assemble HTML ───────────────────────────────────────────────────────
    var h = '<div class="mcbi-root mtxt-root" data-stamp="' + stamp + '">'
        + (isSample ? '<div class="mcbi-sample-label"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra — configure a fonte</div>' : '')
        + _mciSection('txt-dados',     'Dados',        'glyphicon-hdd',              true,  sDados)
        + _mciSection('txt-conteudo',  'Conteúdo',     'glyphicon-text-size',        true,  sConteudo)
        + _mciSection('txt-formato',   'Formatação',   'glyphicon-list-alt',         false, sFormato)
        + _mciSection('txt-tipografia','Tipografia',    'glyphicon-font',             true,  sTipo)
        + _mciSection('txt-cores',     'Cores',         'glyphicon-tint',             false, sCores)
        + _mciSection('txt-espac',     'Espaçamento',   'glyphicon-resize-full',      false, sEspac)
        + _mciSection('txt-bordo',     'Bordo',         'glyphicon-unchecked',        false, sBordo)
        + _mciSection('txt-efeitos',   'Efeitos',       'glyphicon-flash',            false, sEfeitos)
        + _mciSection('txt-dimens',    'Dimensões',     'glyphicon-resize-horizontal', false, sDimensoes)
        + '</div>';

    var _openSecs = {};
    panel.find('[data-sec]').each(function () { _openSecs[$(this).data('sec')] = $(this).closest('.mcbi-section').hasClass('is-open'); });

    panel.html(h + _mciCSS());

    panel.find('[data-sec]').each(function () {
        var id = $(this).data('sec');
        if (_openSecs[id] !== undefined) {
            var $sec = $(this).closest('.mcbi-section');
            $sec.toggleClass('is-open', _openSecs[id]);
            $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', _openSecs[id]).toggleClass('glyphicon-chevron-down', !_openSecs[id]);
        }
    });

    // ── Events ─────────────────────────────────────────────────────────────
    var _txtTimer = null;
    panel.data('_mciTimer', null);
    function fire() {
        clearTimeout(_txtTimer);
        _txtTimer = setTimeout(function () {
            if (!panel.find('.mtxt-root').length) { _txtTimer = null; panel.removeData('_mciTimer'); return; }
            var newCfg = _txtReadConfig(panel, obj);
            obj.config = newCfg;
            obj.transformConfig = newCfg.transformConfig;
            // Sincronizar a invariante triplicada antes de persistir
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
            _txtTimer = null;
            panel.removeData('_mciTimer');
        }, 300);
        panel.data('_mciTimer', _txtTimer);
    }

    // ── Transform Builder ────────────────────────────────────────────────────
    panel.on('click.txtinline', '.mcbi-btn-transform', function () {
        var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) { if (typeof alertify !== 'undefined') alertify.error('MdashTransformBuilder não disponível.', 4000); return; }
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';
        var _tCfgRaw = obj.transformConfig || cfg.transformConfig || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'Texto') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'Texto',
            modalId: 'mtxt-transform-modal',
            hostId: 'mtxt-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                obj.transformConfig = newT;
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                var newFields = _mciGetFields(obj);
                fields = newFields;
                _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
                fire();
            }
        });
    });

    // Section collapse
    panel.on('click.txtinline', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });

    panel.on('change.txtinline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        if (fs) {
            panel.find('.mcbi-sample-label').hide();
            _mciOnFonteSelected(fs, obj, panel, function () {
                var newFields = _mciGetFields(obj);
                fields = newFields;
                _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                fire();
            });
        } else {
            obj.fontestamp = '';
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
            var newFields = _mciGetFields(obj);
            fields = newFields;
            _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            fire();
        }
    });

    // Alignment buttons
    panel.on('click.txtinline', '.mtxt-align', function () {
        panel.find('.mtxt-align').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });

    // Checkbox toggles
    panel.on('change.txtinline', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    // Font size slider
    panel.on('input.txtinline', '.mtxt-fontsize', function () {
        panel.find('.mtxt-fs-lbl').text($(this).val()); fire();
    });

    // Line height slider
    panel.on('input.txtinline', '.mtxt-lineheight', function () {
        panel.find('.mtxt-lh-lbl').text($(this).val()); fire();
    });

    // All other inputs → fire
    panel.on('input.txtinline change.txtinline', 'input.form-control, select.form-control, input[type=color], input[type=number], input[type=range]', function () {
        fire();
    });
}

function _txtReadConfig(panel, obj) {
    var cfg = _txtNormalizeConfig(obj.config);
    var separatorValue = panel.find('.mtxt-sep').val();
    if (separatorValue === undefined || separatorValue === null) separatorValue = ', ';
    separatorValue = String(separatorValue);

    cfg.dataField = panel.find('.mtxt-datafield').val() || '';
    cfg.staticText = panel.find('.mtxt-static').val() || '';

    cfg.content = {
        multipleValues: panel.find('.mtxt-multi').is(':checked'),
        htmlEnabled: panel.find('.mtxt-html').is(':checked'),
        separator: separatorValue
    };
    // Compatibilidade com serializações antigas
    cfg.separator = separatorValue;

    cfg.dataFormat = {
        type: panel.find('.mtxt-fmttype').val() || 'text',
        locale: panel.find('.mtxt-locale').val() || 'pt-PT',
        currency: panel.find('.mtxt-currency').val() || 'EUR',
        currencyPosition: 'right',
        decimalSeparator: panel.find('.mtxt-decsep').val() || 'locale',
        minimumFractionDigits: parseInt(panel.find('.mtxt-mindec').val()) || 0,
        maximumFractionDigits: parseInt(panel.find('.mtxt-maxdec').val()) || 2,
        prefix: panel.find('.mtxt-prefix').val() || '',
        suffix: panel.find('.mtxt-suffix').val() || '',
        fallbackValue: panel.find('.mtxt-fallback').val() || ''
    };

    var align = panel.find('.mtxt-align.is-on').data('align') || 'center';
    cfg.textFormat = {
        fontSize: parseInt(panel.find('.mtxt-fontsize').val()) || 18,
        fontFamily: panel.find('.mtxt-family').val() || 'Nunito, sans-serif',
        fontWeight: panel.find('.mtxt-weight').val() || 'bold',
        fontStyle: panel.find('.mtxt-style').val() || 'normal',
        textAlign: align,
        lineHeight: parseFloat(panel.find('.mtxt-lineheight').val()) || 1.5
    };

    var bgTransp = panel.find('.mtxt-bgtransp').is(':checked');
    var borderTransp = panel.find('.mtxt-bordertransp').is(':checked');
    cfg.colors = {
        textColor: panel.find('.mtxt-textcolor').val() || '#6d7c91',
        backgroundColor: bgTransp ? 'transparent' : (panel.find('.mtxt-bgcolor').val() || '#ffffff'),
        borderColor: borderTransp ? 'transparent' : (panel.find('.mtxt-bordercolor').val() || '#cccccc')
    };

    cfg.spacing = {
        paddingTop: parseInt(panel.find('.mtxt-pt').val()) || 0,
        paddingRight: parseInt(panel.find('.mtxt-pr').val()) || 0,
        paddingBottom: parseInt(panel.find('.mtxt-pb').val()) || 0,
        paddingLeft: parseInt(panel.find('.mtxt-pl').val()) || 0,
        marginTop: parseInt(panel.find('.mtxt-mt').val()) || 0,
        marginBottom: parseInt(panel.find('.mtxt-mb').val()) || 0
    };

    cfg.border = {
        width: parseInt(panel.find('.mtxt-bw').val()) || 0,
        style: panel.find('.mtxt-bstyle').val() || 'solid',
        radius: parseInt(panel.find('.mtxt-brad').val()) || 0
    };

    cfg.effects = {
        textShadow: panel.find('.mtxt-shadow').is(':checked'),
        shadowColor: panel.find('.mtxt-shcolor').val() || '#666666',
        shadowBlur: parseInt(panel.find('.mtxt-shblur').val()) || 2,
        shadowOffsetX: parseInt(panel.find('.mtxt-shx').val()) || 1,
        shadowOffsetY: parseInt(panel.find('.mtxt-shy').val()) || 1
    };

    cfg.dimensions = {
        width: panel.find('.mtxt-width').val() || '100%',
        height: panel.find('.mtxt-height').val() || 'auto',
        maxWidth: panel.find('.mtxt-maxw').val() || 'none'
    };

    // Preservar transformConfig de obj.config OU obj.transformConfig (fallback)
    cfg.transformConfig = cfg.transformConfig || obj.transformConfig || null;
    
    // NÃO atualizar transformconfigjson manualmente - stringifyJSONFields() faz isso
    return cfg;
}


// ── Schema extraído do objecto "Texto" ──────────────────────────────────────
function createDynamicSchemaTexto(data) {
    var fieldOptions = [];
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) {
            fieldOptions.push(key);
        });
    }
    return {
        type: "object",
        title: "Configuração de Texto",
        properties: {
            dataField: { type: "string", title: "Campo de Dados", 'enum': fieldOptions, description: "Campo dos dados que será exibido como texto" },
            staticText: { type: "string", title: "Texto Estático (alternativo)", 'default': "", description: "Se não selecionar campo de dados, pode inserir texto fixo" },
            dataFormat: {
                type: "object", title: "Formatação de Dados",
                properties: {
                    type: { type: "string", title: "Tipo de Formatação", 'enum': ["text", "number", "currency", "percentage", "date"], 'default': "text" },
                    locale: { type: "string", title: "Localização", 'enum': ["pt-PT", "pt-BR", "en-US", "en-GB", "fr-FR", "de-DE", "es-ES"], 'default': "pt-PT" },
                    currency: { type: "string", title: "Código da Moeda", 'default': "EUR" },
                    currencyPosition: { type: "string", title: "Posição da Moeda", 'enum': ["left", "right"], 'default': "right" },
                    decimalSeparator: { type: "string", title: "Separador Decimal", 'enum': ["locale", ",", "."], 'default': "locale" },
                    minimumFractionDigits: { type: "integer", title: "Mínimo de Casas Decimais", 'default': 0, minimum: 0, maximum: 20 },
                    maximumFractionDigits: { type: "integer", title: "Máximo de Casas Decimais", 'default': 2, minimum: 0, maximum: 20 },
                    prefix: { type: "string", title: "Prefixo", 'default': "" },
                    suffix: { type: "string", title: "Sufixo", 'default': "" },
                    fallbackValue: { type: "string", title: "Valor se vazio", 'default': "", description: "Valor quando o campo não existir ou estiver vazio. Em branco: 0 para números." }
                }
            },
            content: {
                type: "object", title: "Configurações de Conteúdo",
                properties: {
                    htmlEnabled: { type: "boolean", title: "Permitir HTML", 'default': false },
                    multipleValues: { type: "boolean", title: "Múltiplos Valores", 'default': false },
                    separator: { type: "string", title: "Separador (para múltiplos valores)", 'default': ", " }
                }
            },
            textFormat: {
                type: "object", title: "Formatação do Texto",
                properties: {
                    fontSize: { type: "integer", title: "Tamanho da Fonte (px)", 'default': 18, minimum: 8, maximum: 72 },
                    fontWeight: { type: "string", title: "Peso da Fonte", 'enum': ["normal", "bold", "lighter", "bolder", "100", "200", "300", "400", "500", "600", "700", "800", "900"], 'default': "bold" },
                    fontStyle: { type: "string", title: "Estilo da Fonte", 'enum': ["normal", "italic", "oblique"], 'default': "normal" },
                    fontFamily: { type: "string", title: "Família da Fonte", 'enum': ["Arial", "Nunito, sans-serif", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Comic Sans MS", "Impact", "Trebuchet MS", "Arial Black"], 'default': "Nunito, sans-serif" },
                    textAlign: { type: "string", title: "Alinhamento", 'enum': ["left", "center", "right", "justify"], 'default': "center" },
                    lineHeight: { type: "number", title: "Altura da Linha", 'default': 1.5, minimum: 0.5, maximum: 3 }
                }
            },
            colors: {
                type: "object", title: "Cores",
                properties: {
                    textColor: { type: "string", title: "Cor do Texto", format: "color", 'default': "#6d7c91" },
                    backgroundColor: { type: "string", title: "Cor de Fundo", format: "color", 'default': "#fff" },
                    borderColor: { type: "string", title: "Cor da Borda", format: "color", 'default': "transparent" }
                }
            },
            spacing: {
                type: "object", title: "Espaçamento",
                properties: {
                    paddingTop: { type: "integer", title: "Padding Superior (px)", 'default': 10, minimum: 0, maximum: 100 },
                    paddingRight: { type: "integer", title: "Padding Direito (px)", 'default': 10, minimum: 0, maximum: 100 },
                    paddingBottom: { type: "integer", title: "Padding Inferior (px)", 'default': 10, minimum: 0, maximum: 100 },
                    paddingLeft: { type: "integer", title: "Padding Esquerdo (px)", 'default': 10, minimum: 0, maximum: 100 },
                    marginTop: { type: "integer", title: "Margem Superior (px)", 'default': 0, minimum: 0, maximum: 100 },
                    marginBottom: { type: "integer", title: "Margem Inferior (px)", 'default': 0, minimum: 0, maximum: 100 }
                }
            },
            border: {
                type: "object", title: "Bordas",
                properties: {
                    width: { type: "integer", title: "Largura da Borda (px)", 'default': 0, minimum: 0, maximum: 20 },
                    style: { type: "string", title: "Estilo da Borda", 'enum': ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"], 'default': "solid" },
                    radius: { type: "integer", title: "Raio da Borda (px)", 'default': 0, minimum: 0, maximum: 50 }
                }
            },
            effects: {
                type: "object", title: "Efeitos",
                properties: {
                    textShadow: { type: "boolean", title: "Sombra do Texto", 'default': false },
                    shadowColor: { type: "string", title: "Cor da Sombra", format: "color", 'default': "#666666" },
                    shadowBlur: { type: "integer", title: "Desfoque da Sombra (px)", 'default': 2, minimum: 0, maximum: 20 },
                    shadowOffsetX: { type: "integer", title: "Deslocamento X (px)", 'default': 1, minimum: -20, maximum: 20 },
                    shadowOffsetY: { type: "integer", title: "Deslocamento Y (px)", 'default': 1, minimum: -20, maximum: 20 }
                }
            },
            dimensions: {
                type: "object", title: "Dimensões",
                properties: {
                    width: { type: "string", title: "Largura", 'enum': ["auto", "100%", "50%", "25%", "75%"], 'default': "100%" },
                    height: { type: "string", title: "Altura", 'enum': ["auto", "100px", "200px", "300px", "400px"], 'default': "auto" },
                    maxWidth: { type: "string", title: "Largura Máxima", 'enum': ["none", "100%", "500px", "800px", "1200px"], 'default': "none" }
                }
            }
        }
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO BADGE — Condicional + Design (motor partilhado com a tabela)
// ══════════════════════════════════════════════════════════════════════════════

var _MBADGE_SHAPES = [
    { id: 'pill', label: 'Pill' },
    { id: 'rounded', label: 'Arredondado' },
    { id: 'square', label: 'Quadrado' },
    { id: 'outline', label: 'Outline' },
    { id: 'plain', label: 'Texto' },
    { id: 'dot', label: 'Ponto + valor' },
    { id: 'custom', label: 'Custom' }
];

var _MBADGE_ICON_TREND_SETS = [
    { id: 'arrowsMs', label: 'Material arrow_drop_up / down', positive: 'ms:arrow_drop_up', negative: 'ms:arrow_drop_down', neutral: 'ms:remove' },
    { id: 'trendMs', label: 'Material trending_up / down', positive: 'ms:trending_up', negative: 'ms:trending_down', neutral: 'ms:trending_flat' },
    { id: 'arrowsUpMs', label: 'Material arrow_upward / down', positive: 'ms:arrow_upward', negative: 'ms:arrow_downward', neutral: 'ms:horizontal_rule' },
    { id: 'keyboardMs', label: 'Material keyboard_arrow', positive: 'ms:keyboard_arrow_up', negative: 'ms:keyboard_arrow_down', neutral: 'ms:remove' },
    { id: 'arrowsGl', label: 'Setas Glyphicon', positive: 'glyphicon glyphicon-arrow-up', negative: 'glyphicon glyphicon-arrow-down', neutral: 'glyphicon glyphicon-minus' },
    { id: 'arrowsFa', label: 'Setas Font Awesome', positive: 'fa fa-arrow-up', negative: 'fa fa-arrow-down', neutral: 'fa fa-minus' },
    { id: 'caretsFa', label: 'Carets FA', positive: 'fa fa-caret-up', negative: 'fa fa-caret-down', neutral: 'fa fa-minus' },
    { id: 'chevronsFa', label: 'Chevrons FA', positive: 'fa fa-chevron-up', negative: 'fa fa-chevron-down', neutral: 'fa fa-minus' },
    { id: 'longFa', label: 'Setas longas FA', positive: 'fa fa-long-arrow-up', negative: 'fa fa-long-arrow-down', neutral: 'fa fa-minus' },
    { id: 'sortFa', label: 'Sort ascend/desc', positive: 'fa fa-sort-asc', negative: 'fa fa-sort-desc', neutral: 'fa fa-minus' },
    { id: 'levelFa', label: 'Level up/down', positive: 'fa fa-level-up', negative: 'fa fa-level-down', neutral: 'fa fa-minus' },
    { id: 'plusminus', label: 'Simbolos + / -', positive: '+', negative: '\u2212', neutral: '=' },
    { id: 'unicode', label: 'Unicode triangulos', positive: '\u25B2', negative: '\u25BC', neutral: '\u25CF' },
    { id: 'unicodeThin', label: 'Unicode triangulos finos', positive: '\u25B4', negative: '\u25BE', neutral: '\u2022' }
];

var _MBADGE_ICON_PRESETS = [
    { label: 'arrow_drop_up', value: 'ms:arrow_drop_up' },
    { label: 'arrow_drop_down', value: 'ms:arrow_drop_down' },
    { label: 'trending_up', value: 'ms:trending_up' },
    { label: 'trending_down', value: 'ms:trending_down' },
    { label: 'trending_flat', value: 'ms:trending_flat' },
    { label: 'arrow_upward', value: 'ms:arrow_upward' },
    { label: 'arrow_downward', value: 'ms:arrow_downward' },
    { label: 'remove', value: 'ms:remove' },
    { label: '↑ Glyphicon', value: 'glyphicon glyphicon-arrow-up' },
    { label: '↓ Glyphicon', value: 'glyphicon glyphicon-arrow-down' },
    { label: '− Glyphicon', value: 'glyphicon glyphicon-minus' },
    { label: '↑ FA', value: 'fa fa-arrow-up' },
    { label: '↓ FA', value: 'fa fa-arrow-down' },
    { label: '▲ Unicode', value: '▲' },
    { label: '▼ Unicode', value: '▼' },
    { label: '● Ponto', value: '●' },
    { label: '+ Plus', value: '+' },
    { label: '− Minus', value: '−' },
    { label: 'Caret ↑', value: 'fa fa-caret-up' },
    { label: 'Caret ↓', value: 'fa fa-caret-down' },
    { label: 'Chevron ↑', value: 'fa fa-chevron-up' },
    { label: 'Chevron ↓', value: 'fa fa-chevron-down' },
    { label: 'Sort ↑', value: 'fa fa-sort-asc' },
    { label: 'Sort ↓', value: 'fa fa-sort-desc' }
];

var _BADGE_SAMPLE_CONFIG = {
    valueField: 'variacaoAcumulada',
    conditional: {
        valueField: 'variacaoAcumulada',
        rules: [
            {
                when: { mode: 'simple', conditions: [{ field: 'variacaoAcumulada', operator: 'gt', value: '0', logic: 'AND' }] },
                then: { format: 'deltaPercentBadge', variant: 'positive', precision: 1, appearance: { icon: 'ms:arrow_drop_up', bg: '', fg: '' } }
            },
            {
                when: { mode: 'simple', conditions: [{ field: 'variacaoAcumulada', operator: 'lt', value: '0', logic: 'AND' }] },
                then: { format: 'deltaPercentBadge', variant: 'negative', precision: 1, appearance: { icon: 'ms:arrow_drop_down', bg: '', fg: '' } }
            }
        ],
        fallback: { format: 'deltaPercentBadge', variant: 'neutral', precision: 1, appearance: { icon: 'ms:remove', bg: '', fg: '' } }
    },
    design: {
        align: 'center',
        size: 'md',
        shape: 'pill',
        icon: { position: 'before', gap: 4, size: 16 },
        badge: {
            fontSize: 0,
            fontWeight: '',
            paddingX: 0,
            paddingY: 0,
            borderRadius: 0,
            minWidth: 0
        },
        custom: {
            className: '',
            css: '',
            variantCss: { positive: '', negative: '', neutral: '' }
        },
        container: { paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4 }
    }
};

function _mbadgeNormalizeConfig(rawCfg) {
    var base = JSON.parse(JSON.stringify(_BADGE_SAMPLE_CONFIG));
    if (!rawCfg || typeof rawCfg !== 'object') return base;
    return _txtDeepMerge(base, rawCfg);
}

function _mbadgeDefaultThenAppearance(variant) {
    if (variant === 'positive') return { icon: 'ms:arrow_drop_up', bg: '', fg: '' };
    if (variant === 'negative') return { icon: 'ms:arrow_drop_down', bg: '', fg: '' };
    return { icon: 'ms:remove', bg: '', fg: '' };
}

function _mbadgeGetDeltaPercentConditionalTemplate(valueField) {
    var tpl = _tblGetDeltaPercentConditionalTemplate(valueField);
    (tpl.rules || []).forEach(function (rule) {
        if (!rule.then) rule.then = {};
        if (!rule.then.appearance) {
            rule.then.appearance = _mbadgeDefaultThenAppearance(rule.then.variant || 'neutral');
        }
    });
    if (!tpl.fallback) tpl.fallback = { format: 'deltaPercentBadge', variant: 'neutral', precision: 1 };
    if (!tpl.fallback.appearance) {
        tpl.fallback.appearance = _mbadgeDefaultThenAppearance(tpl.fallback.variant || 'neutral');
    }
    return tpl;
}

function _mbadgeEnsureRuleAppearance(conditional, design) {
    conditional = conditional || {};
    if (!Array.isArray(conditional.rules)) conditional.rules = [];
    if (!conditional.fallback) conditional.fallback = { format: 'deltaPercentBadge', variant: 'neutral', precision: 1 };

    // Migrar appearance antiga por variante -> regras com mesma variante
    if (conditional.appearance && typeof conditional.appearance === 'object') {
        conditional.rules.forEach(function (rule) {
            if (!rule.then) rule.then = {};
            var v = rule.then.variant || 'neutral';
            var legacy = conditional.appearance[v];
            if (legacy && !rule.then.appearance) {
                rule.then.appearance = {
                    icon: legacy.icon || '',
                    bg: legacy.bg || '',
                    fg: legacy.fg || ''
                };
            }
        });
        if (!conditional.fallback.appearance) {
            var fbV = conditional.fallback.variant || 'neutral';
            var legacyFb = conditional.appearance[fbV] || conditional.appearance.neutral;
            if (legacyFb) {
                conditional.fallback.appearance = {
                    icon: legacyFb.icon || '',
                    bg: legacyFb.bg || '',
                    fg: legacyFb.fg || ''
                };
            }
        }
        delete conditional.appearance;
    }

    // Migrar design antigo
    if (design) {
        var legacyIcon = design.icon || {};
        var legacyBv = legacyIcon.byVariant || {};
        var legacyV = design.variants || {};
        conditional.rules.forEach(function (rule) {
            if (!rule.then) rule.then = {};
            if (!rule.then.appearance) rule.then.appearance = _mbadgeDefaultThenAppearance(rule.then.variant || 'neutral');
            var v = rule.then.variant || 'neutral';
            if (legacyBv[v] && !rule.then.appearance.icon) rule.then.appearance.icon = legacyBv[v];
            if (legacyV[v]) {
                if (legacyV[v].bg && !rule.then.appearance.bg) rule.then.appearance.bg = legacyV[v].bg;
                if (legacyV[v].fg && !rule.then.appearance.fg) rule.then.appearance.fg = legacyV[v].fg;
            }
        });
    }

    conditional.rules.forEach(function (rule) {
        if (!rule.then) rule.then = {};
        if (!rule.then.appearance) {
            rule.then.appearance = _mbadgeDefaultThenAppearance(rule.then.variant || 'neutral');
        }
    });
    if (!conditional.fallback.appearance) {
        conditional.fallback.appearance = _mbadgeDefaultThenAppearance(conditional.fallback.variant || 'neutral');
    }
    return conditional;
}

function _mbadgeAppearanceColorDefaults() {
    return {
        positive: { bg: '#dcfce7', fg: '#15803d' },
        negative: { bg: '#fee2e2', fg: '#dc2626' },
        neutral: { bg: '#e2e8f0', fg: '#475569' }
    };
}

function _mbadgeEnsureAppearance(conditional, design) {
    return _mbadgeEnsureRuleAppearance(conditional, design);
}

function _mbadgeEnsureConditional(cfg) {
    var vf = cfg.valueField || 'variacaoAcumulada';
    if (!cfg.conditional || !Array.isArray(cfg.conditional.rules) || !cfg.conditional.rules.length) {
        cfg.conditional = _mbadgeGetDeltaPercentConditionalTemplate(vf);
    }
    if (!cfg.conditional.valueField) cfg.conditional.valueField = vf;
    cfg.conditional = _mbadgeEnsureRuleAppearance(cfg.conditional, cfg.design);
    return cfg;
}

function _mbadgeCreateMockCell(row, valueField) {
    var field = valueField || '';
    return {
        getData: function () { return row || {}; },
        getValue: function () { return field ? row[field] : undefined; },
        getField: function () { return field; }
    };
}

function _mbadgeResolveVariant(row, conditional) {
    var vf = (conditional && conditional.valueField) || '';
    var n = _tblSafeNumber(vf ? row[vf] : 0);
    if (n > 0) return 'positive';
    if (n < 0) return 'negative';
    return 'neutral';
}

function _mbadgeEvaluateHtml(row, conditional, allRows) {
    conditional = conditional || {};
    var valueField = conditional.valueField || '';
    var cell = _mbadgeCreateMockCell(row, valueField);
    var compiled = _tblCompileConditionalConfig(conditional, valueField, allRows || (row ? [row] : []));
    return _tblConditionalFormatter(cell, compiled) || '';
}

function _mbadgeResolveMatchedThen(row, conditional, allRows) {
    conditional = conditional || {};
    var valueField = conditional.valueField || '';
    var cell = _mbadgeCreateMockCell(row, valueField);
    var rules = conditional.rules || [];
    var i;
    for (i = 0; i < rules.length; i++) {
        var whenFn = _tblCompileWhenFn(rules[i].when);
        if (whenFn(cell, row, cell.getValue(), allRows || [])) {
            return rules[i].then || {};
        }
    }
    return conditional.fallback || {};
}

function _mbadgeNormalizeDesign(design) {
    design = design || {};
    if (!design.icon || typeof design.icon !== 'object') design.icon = {};
    if (design.icon.position === 'left') design.icon.position = 'before';
    if (design.icon.position === 'right') design.icon.position = 'after';
    if (!design.icon.position) design.icon.position = 'before';
    if (!design.icon.size) design.icon.size = 16;
    if (!design.icon.gap) design.icon.gap = 4;
    if (!design.shape) design.shape = 'pill';
    if (!design.custom || typeof design.custom !== 'object') {
        design.custom = { className: '', css: '', variantCss: { positive: '', negative: '', neutral: '' } };
    }
    return design;
}

function _mbadgeGetThenAppearance(then, variant) {
    then = then || {};
    var app = then.appearance || _mbadgeDefaultThenAppearance(variant || then.variant || 'neutral');
    return app;
}

function _mbadgeRenderThenAppearanceBlock(then, isFallback) {
    then = then || {};
    var variant = then.variant || 'neutral';
    var app = then.appearance || _mbadgeDefaultThenAppearance(variant);
    var defs = _mbadgeAppearanceColorDefaults();
    var def = defs[variant] || defs.neutral;
    var bgVal = app.bg || def.bg;
    var fgVal = app.fg || def.fg;
    var sample = variant === 'positive' ? '+14,9%' : (variant === 'negative' ? '-21,1%' : '0,0%');
    var previewStyle = 'display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:700;background:' + bgVal + ';color:' + fgVal + ';';
    var presets = _MBADGE_ICON_PRESETS.slice(0, 8);
    return '<div class="mbadge-cc-appearance" data-variant="' + _mciEsc(variant) + '" style="margin-top:8px;padding:8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">'
        + '<div style="font-size:10px;font-weight:700;color:#475569;margin-bottom:6px;">Design ' + (isFallback ? 'do fallback' : 'desta regra') + '</div>'
        + '<div class="mcbi-field"><label style="font-size:10px;">Icone</label>'
        + '<input type="text" class="form-control input-sm mbadge-cc-app-icon" value="' + _mciEsc(app.icon || '') + '" placeholder="ms:arrow_drop_up">'
        + '<div class="mbadge-icon-presets" style="margin-top:4px;">'
        + presets.map(function (p) {
            return '<button type="button" class="btn btn-xs btn-default mbadge-cc-app-preset" data-value="' + _mciEsc(p.value) + '" title="' + _mciEsc(p.label) + '">' + _mbadgeIconPresetInner(p.value) + '</button>';
        }).join('') + '</div></div>'
        + '<div class="mcbi-row2"><div class="mcbi-field"><label style="font-size:10px;">Fundo</label>'
        + '<input type="color" class="form-control input-sm mbadge-cc-app-bg" value="' + _mciColorInputValue(bgVal, def.bg) + '"></div>'
        + '<div class="mcbi-field"><label style="font-size:10px;">Texto</label>'
        + '<input type="color" class="form-control input-sm mbadge-cc-app-fg" value="' + _mciColorInputValue(fgVal, def.fg) + '"></div></div>'
        + '<div class="mbadge-cc-app-preview" style="margin-top:6px;font-size:9px;color:#64748b;">Preview: '
        + '<span style="' + previewStyle + '">' + _mbadgeBuildIconHtml(app.icon || '', 16) + ' ' + sample + '</span></div>'
        + '</div>';
}

function _mbadgeReadThenAppearance($scope, variant) {
    var defs = _mbadgeAppearanceColorDefaults();
    var def = defs[variant] || defs.neutral;
    var bg = $scope.find('.mbadge-cc-app-bg').val() || '';
    var fg = $scope.find('.mbadge-cc-app-fg').val() || '';
    return {
        icon: ($scope.find('.mbadge-cc-app-icon').val() || '').trim(),
        bg: bg === def.bg ? '' : bg,
        fg: fg === def.fg ? '' : fg
    };
}

function _mbadgeParseFormatterOutput(html, row, conditional) {
    var $tmp = $('<div>').html(html || '');
    var $badge = $tmp.find('.mtbl-delta-badge').first();
    if ($badge.length) {
        var variant = 'neutral';
        if ($badge.hasClass('is-positive')) variant = 'positive';
        else if ($badge.hasClass('is-negative')) variant = 'negative';
        return { text: $.trim($badge.text()), variant: variant, isBadge: true };
    }
    if ($tmp.children().length > 0) {
        return { text: null, variant: _mbadgeResolveVariant(row, conditional), isBadge: false, rawHtml: html };
    }
    var text = $.trim($tmp.text());
    return { text: text, variant: _mbadgeResolveVariant(row, conditional), isBadge: false };
}

function _mbadgeTrendSetById(id) {
    for (var i = 0; i < _MBADGE_ICON_TREND_SETS.length; i++) {
        if (_MBADGE_ICON_TREND_SETS[i].id === id) return _MBADGE_ICON_TREND_SETS[i];
    }
    return _MBADGE_ICON_TREND_SETS[0];
}

function _mbadgeIsMaterialIcon(val) {
    return typeof val === 'string' && val.indexOf('ms:') === 0;
}

function _mbadgeIsUnicodeIcon(val) {
    if (!val || typeof val !== 'string') return false;
    if (_mbadgeIsMaterialIcon(val)) return false;
    val = val.trim();
    if (/^(fa|glyphicon|icon-|mdi|bi)\s/i.test(val)) return false;
    if (/\b(fa-|glyphicon-)/.test(val)) return false;
    return val.length <= 3;
}

function _mbadgeIconPresetInner(value) {
    if (_mbadgeIsMaterialIcon(value)) {
        return '<span class="material-symbols-rounded" style="font-size:14px;">' + _mciEsc(value.slice(3)) + '</span>';
    }
    if (_mbadgeIsUnicodeIcon(value)) return _mciEsc(value);
    return '<i class="' + _mciEsc(value) + '"></i>';
}

function _mbadgeEnsureMaterialSymbolsCss() {
    if (typeof $ === 'undefined') return;
    if (!$('link[href*="Material+Symbols+Rounded"]').length) {
        $('head').append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block">');
    }
    if ($('#mdash-badge-ms-css').length) return;
    var s = '';
    s += '.material-symbols-rounded{font-family:"Material Symbols Rounded";font-weight:normal;font-style:normal;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;font-feature-settings:"liga";-webkit-font-feature-settings:"liga";-webkit-font-smoothing:antialiased;}';
    s += '.mbadge-icon-presets .material-symbols-rounded{font-size:18px;}';
    $('head').append('<style id="mdash-badge-ms-css">' + s + '</style>');
}

function _mbadgeMaterialIconSize(size) {
    size = size > 0 ? size : 16;
    return Math.max(size, 16);
}

function _mbadgeBuildIconHtml(iconValue, size) {
    if (!iconValue) return '';
    if (_mbadgeIsMaterialIcon(iconValue)) {
        var msSize = _mbadgeMaterialIconSize(size);
        var msStyle = 'font-size:' + msSize + 'px;line-height:1;flex-shrink:0;font-variation-settings:\'FILL\' 0,\'wght\' 500,\'GRAD\' 0,\'opsz\' ' + msSize + ';';
        return '<span class="material-symbols-rounded mbadge-icon" style="' + msStyle + '">' + _mciEsc(iconValue.slice(3)) + '</span>';
    }
    size = size > 0 ? size : 11;
    var style = 'font-size:' + size + 'px;line-height:1;flex-shrink:0;';
    if (_mbadgeIsUnicodeIcon(iconValue)) {
        return '<span class="mbadge-icon mbadge-icon-unicode" style="' + style + '">' + _mciEsc(iconValue) + '</span>';
    }
    return '<i class="mbadge-icon ' + _mciEsc(iconValue) + '" style="' + style + '"></i>';
}

function _mbadgeIconPresetGridHtml(targetClass) {
    return '<div class="mbadge-icon-presets">'
        + _MBADGE_ICON_PRESETS.map(function (p) {
            return '<button type="button" class="btn btn-xs btn-default mbadge-icon-preset" data-target="' + targetClass + '" data-value="' + _mciEsc(p.value) + '" title="' + _mciEsc(p.label) + '">' + _mbadgeIconPresetInner(p.value) + '</button>';
        }).join('')
        + '</div>';
}

function _mbadgeResolveIconHtml(matchedThen, design) {
    design = _mbadgeNormalizeDesign(design);
    var app = _mbadgeGetThenAppearance(matchedThen, matchedThen && matchedThen.variant);
    var iconValue = (app.icon || '').trim();
    if (!iconValue) return '';
    return _mbadgeBuildIconHtml(iconValue, design.icon.size);
}

function _mbadgeBuildChipHtml(parts, design, matchedThen, row, stamp) {
    design = _mbadgeNormalizeDesign(design);
    parts = parts || { text: '', variant: 'neutral', isBadge: true };
    var shape = design.shape || 'pill';
    if (shape === 'plain') parts.isBadge = false;

    var variant = parts.variant || (matchedThen && matchedThen.variant) || 'neutral';
    var variantClass = 'is-' + variant;
    var icon = design.icon || {};
    var app = _mbadgeGetThenAppearance(matchedThen, variant);
    var iconHtml = _mbadgeResolveIconHtml(matchedThen, design);
    var gap = (icon.gap > 0 ? icon.gap : 4);
    var valueHtml = '<span class="mbadge-value">' + _mciEsc(parts.text || '') + '</span>';
    var inner = '';

    if (shape === 'dot') {
        inner = '<span class="mbadge-dot" title="' + _mciEsc(parts.text) + '"></span>' + valueHtml;
    } else if (iconHtml) {
        var iconPos = icon.position || 'before';
        if (iconPos === 'left') iconPos = 'before';
        if (iconPos === 'right') iconPos = 'after';
        if (iconPos === 'after') {
            inner = valueHtml + iconHtml;
        } else {
            inner = iconHtml + valueHtml;
        }
    } else {
        inner = valueHtml;
    }

    var custom = design.custom || {};
    var extraClass = custom.className ? (' ' + custom.className) : '';
    var chipStyle = 'gap:' + gap + 'px;';
    var defs = _mbadgeAppearanceColorDefaults();
    var def = defs[variant] || defs.neutral;
    if (app.bg) chipStyle += 'background:' + app.bg + '!important;';
    else if (shape !== 'plain' && shape !== 'outline' && shape !== 'dot') chipStyle += '';
    if (app.fg) chipStyle += 'color:' + app.fg + '!important;';
    if (shape === 'custom' && custom.css) {
        // inline fallback; instance CSS also injected
    }

    return '<span class="mbadge-chip shape-' + _mciEsc(shape) + ' ' + variantClass + extraClass
        + '" style="' + chipStyle + '" data-variant="' + variant + '">' + inner + '</span>';
}

function _mbadgeInjectInstanceCss(stamp, design) {
    if (typeof $ === 'undefined') return;
    design = _mbadgeNormalizeDesign(design);
    var styleId = 'mbadge-inst-css-' + stamp;
    $('#' + styleId).remove();
    var custom = design.custom || {};
    var css = '';
    var sel = '#mbadge_' + stamp + ' .mbadge-chip';
    if (custom.css) css += sel + '{' + custom.css + '}';
    var vCss = custom.variantCss || {};
    ['positive', 'negative', 'neutral'].forEach(function (v) {
        if (vCss[v]) css += sel + '.is-' + v + '{' + vCss[v] + '}';
    });
    if (css) $('head').append('<style id="' + styleId + '">' + css + '</style>');
}

function _mbadgeAlignToFlex(align) {
    if (align === 'left') return 'flex-start';
    if (align === 'right') return 'flex-end';
    return 'center';
}

function _mbadgeBuildRootStyle(design) {
    design = design || {};
    var c = design.container || {};
    var b = design.badge || {};
    var s = 'display:flex;align-items:center;justify-content:' + _mbadgeAlignToFlex(design.align || 'center') + ';gap:5px;';
    s += 'padding:' + (c.paddingTop || 0) + 'px ' + (c.paddingRight || 0) + 'px '
        + (c.paddingBottom || 0) + 'px ' + (c.paddingLeft || 0) + 'px;';
    if (b.fontSize > 0) s += '--mbadge-font-size:' + b.fontSize + 'px;';
    if (b.fontWeight) s += '--mbadge-font-weight:' + b.fontWeight + ';';
    if (b.paddingX > 0) s += '--mbadge-padding-x:' + b.paddingX + 'px;';
    if (b.paddingY > 0) s += '--mbadge-padding-y:' + b.paddingY + 'px;';
    if (b.borderRadius > 0) s += '--mbadge-radius:' + b.borderRadius + 'px;';
    if (b.minWidth > 0) s += '--mbadge-min-width:' + b.minWidth + 'px;';
    return s;
}

function _mbadgeInjectCss() {
    _mbadgeEnsureMaterialSymbolsCss();
    if ($('#mdash-badge-css').length) return;
    var s = '';
    s += '.m-dash-badge-root{display:flex;align-items:center;width:100%;box-sizing:border-box;min-height:0;}';
    s += '.mdash-slot-zone-render .m-dash-badge-root{width:auto;max-width:100%;display:inline-flex;}';
    s += '.m-dash-badge-root .mbadge-chip{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;font-weight:var(--mbadge-font-weight,800);letter-spacing:.01em;font-size:var(--mbadge-font-size,10px);line-height:1.2;min-width:var(--mbadge-min-width,62px);}';
    s += '.m-dash-badge-root.size-sm .mbadge-chip{font-size:var(--mbadge-font-size,9px);min-width:var(--mbadge-min-width,48px);}';
    s += '.m-dash-badge-root.size-lg .mbadge-chip{font-size:var(--mbadge-font-size,12px);min-width:var(--mbadge-min-width,72px);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-pill{border-radius:var(--mbadge-radius,999px);padding:var(--mbadge-padding-y,3px) var(--mbadge-padding-x,7px);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-rounded{border-radius:var(--mbadge-radius,6px);padding:var(--mbadge-padding-y,3px) var(--mbadge-padding-x,7px);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-square{border-radius:0;padding:var(--mbadge-padding-y,3px) var(--mbadge-padding-x,7px);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-outline{border-radius:var(--mbadge-radius,999px);padding:var(--mbadge-padding-y,2px) var(--mbadge-padding-x,7px);background:transparent!important;border:1px solid currentColor;}';
    s += '.m-dash-badge-root .mbadge-chip.shape-plain{background:none!important;border:none!important;padding:0;min-width:auto;font-weight:var(--mbadge-font-weight,700);font-size:var(--mbadge-font-size,12px);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-dot{background:none!important;border:none!important;padding:0;min-width:auto;gap:6px!important;font-weight:var(--mbadge-font-weight,700);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-dot .mbadge-dot{width:8px;height:8px;border-radius:50%;background:currentColor;flex-shrink:0;}';
    s += '.m-dash-badge-root .mbadge-chip.shape-custom{padding:var(--mbadge-padding-y,3px) var(--mbadge-padding-x,7px);}';
    s += '.m-dash-badge-root .mbadge-chip .mbadge-icon{color:inherit;opacity:.92;}';
    s += '.m-dash-badge-root .mbadge-chip .material-symbols-rounded.mbadge-icon{font-variation-settings:\'FILL\' 0,\'wght\' 500,\'GRAD\' 0,\'opsz\' 20;line-height:1;opacity:1;width:1em;height:1em;overflow:visible;vertical-align:middle;}';
    s += '.m-dash-badge-root .mbadge-chip .mbadge-icon-unicode{font-weight:700;display:inline-flex;align-items:center;justify-content:center;opacity:1;}';
    s += '.mbadge-icon-presets{display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;}';
    s += '.mbadge-icon-presets .mbadge-icon-preset{min-width:26px;height:26px;padding:2px 4px;line-height:1;display:inline-flex;align-items:center;justify-content:center;}';
    s += '.m-dash-badge-root .mbadge-chip.is-positive{background:var(--mbadge-positive-bg,rgba(34,197,94,.14));color:var(--mbadge-positive-fg,#15803d);}';
    s += '.m-dash-badge-root .mbadge-chip.is-negative{background:var(--mbadge-negative-bg,rgba(239,68,68,.14));color:var(--mbadge-negative-fg,#dc2626);}';
    s += '.m-dash-badge-root .mbadge-chip.is-neutral{background:var(--mbadge-neutral-bg,rgba(148,163,184,.16));color:var(--mbadge-neutral-fg,#475569);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-plain.is-positive,.m-dash-badge-root .mbadge-chip.shape-dot.is-positive,.m-dash-badge-root .mbadge-chip.shape-outline.is-positive{background:none!important;color:var(--mbadge-positive-fg,#15803d);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-plain.is-negative,.m-dash-badge-root .mbadge-chip.shape-dot.is-negative,.m-dash-badge-root .mbadge-chip.shape-outline.is-negative{background:none!important;color:var(--mbadge-negative-fg,#dc2626);}';
    s += '.m-dash-badge-root .mbadge-chip.shape-plain.is-neutral,.m-dash-badge-root .mbadge-chip.shape-dot.is-neutral,.m-dash-badge-root .mbadge-chip.shape-outline.is-neutral{background:none!important;color:var(--mbadge-neutral-fg,#475569);}';
    s += '.m-dash-badge-root .mtbl-delta-badge{display:inline-flex;align-items:center;justify-content:center;font-weight:var(--mbadge-font-weight,800);letter-spacing:.01em;border-radius:var(--mbadge-radius,999px);font-size:var(--mbadge-font-size,10px);padding:var(--mbadge-padding-y,3px) var(--mbadge-padding-x,7px);min-width:var(--mbadge-min-width,62px);}';
    s += '.m-dash-badge-root .mtbl-delta-badge.is-positive{background:var(--mbadge-positive-bg,rgba(34,197,94,.14));color:var(--mbadge-positive-fg,#15803d);}';
    s += '.m-dash-badge-root .mtbl-delta-badge.is-negative{background:var(--mbadge-negative-bg,rgba(239,68,68,.14));color:var(--mbadge-negative-fg,#dc2626);}';
    s += '.m-dash-badge-root .mtbl-delta-badge.is-neutral{background:var(--mbadge-neutral-bg,rgba(148,163,184,.16));color:var(--mbadge-neutral-fg,#475569);}';
    $('head').append('<style id="mdash-badge-css">' + s + '</style>');
}

function _mbadgeFetchRows(dados, cfg) {
    var rows = [];
    var isSample = !!dados.isSample;
    var tCfg = dados.transformConfig || cfg.transformConfig || null;

    if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                isSample = false;
            }
        } catch (e) {
            console.warn('[MDash] renderObjectBadge transform error:', e.message);
        }
    }
    if (rows.length === 0 && dados.data && dados.data.length > 0) {
        rows = dados.data;
        isSample = false;
    }
    if (rows.length === 0) {
        rows = getMdashSampleData('badge');
        isSample = true;
    }
    return { rows: rows, isSample: isSample };
}

function renderObjectBadge(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = _mbadgeEnsureConditional(_mbadgeNormalizeConfig(dados.config));
    var fetched = _mbadgeFetchRows(dados, cfg);
    var row = fetched.rows[0] || {};
    var design = _mbadgeNormalizeDesign(cfg.design || {});
    var rawHtml = _mbadgeEvaluateHtml(row, cfg.conditional, fetched.rows);
    var matchedThen = _mbadgeResolveMatchedThen(row, cfg.conditional, fetched.rows);
    var parts = _mbadgeParseFormatterOutput(rawHtml, row, cfg.conditional);
    var variant = parts.variant || (matchedThen && matchedThen.variant) || _mbadgeResolveVariant(row, cfg.conditional);
    var contentHtml = parts.rawHtml
        ? parts.rawHtml
        : _mbadgeBuildChipHtml(parts, design, matchedThen, row, stamp);

    _mbadgeInjectCss();
    _mbadgeInjectInstanceCss(stamp, design);
    var sampleHtml = fetched.isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    $(dados.containerSelector).html(
        sampleHtml
        + '<div id="mbadge_' + stamp + '" class="m-dash-badge-root size-' + (design.size || 'md') + '" style="' + _mbadgeBuildRootStyle(design) + '" data-variant="' + variant + '">'
        + contentHtml
        + '</div>'
    );
}

function renderBadgePropertiesInline(obj, panel) {
    panel.off();
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = _mbadgeEnsureConditional(_mbadgeNormalizeConfig(obj.config));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var isSample = !obj.fontestamp;
    var conditionalCfg = JSON.parse(JSON.stringify(cfg.conditional || {}));
    conditionalCfg = _mbadgeEnsureRuleAppearance(conditionalCfg, cfg.design);
    var design = _mbadgeNormalizeDesign(cfg.design || {});
    var badgeStyle = design.badge || {};
    var container = design.container || {};
    var icon = design.icon || {};
    var custom = design.custom || {};
    var curShape = design.shape || 'pill';

    _mciCSS();

    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    function _badgeFieldOpts(cur) {
        return '<option value="">-- campo --</option>'
            + fields.map(function (f) {
                return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
            }).join('');
    }

    var sValor = '<div class="mcbi-field"><label>Campo valor (numérico)</label>'
        + '<select class="mbadge-valuefield form-control input-sm">' + _badgeFieldOpts(cfg.valueField) + '</select></div>';

    var sRegras = '<div style="padding:10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">'
        + '<div><div style="font-size:11px;font-weight:bold;color:#1e3a8a;">Regras do badge</div>'
        + '<div style="font-size:10px;color:#475569;">' + _mciEsc(_tblConditionalSummary(conditionalCfg)) + '</div></div>'
        + '<button type="button" class="btn btn-xs btn-primary mbadge-conditional-edit"><i class="glyphicon glyphicon-cog"></i> Editar regras</button>'
        + '</div>'
        + '<button type="button" class="btn btn-xs btn-default mbadge-conditional-template" style="width:100%;font-size:10px;margin-bottom:6px;"><i class="glyphicon glyphicon-flash"></i> Template: Variacao %</button>'
        + '<div class="mcbi-info">Em cada regra defines: <strong>quando</strong> a condicao e verdadeira, <strong>como formatar</strong> o valor e <strong>o design</strong> (icone + cores) desse badge.</div>'
        + '<input type="hidden" class="mbadge-conditional-json" value="' + _mciEsc(JSON.stringify(conditionalCfg || {})) + '">'
        + '</div>';

    var sDesign = '<div class="mcbi-field"><label>Forma (shape)</label>'
        + '<div class="mcbi-ct-grid3 mbadge-shape-grid" style="grid-template-columns:repeat(4,1fr);gap:4px;">'
        + _MBADGE_SHAPES.map(function (sh) {
            return '<button type="button" class="mcbi-ct-btn mbadge-shape' + (curShape === sh.id ? ' is-on' : '') + '" data-shape="' + sh.id + '" title="' + _mciEsc(sh.label) + '"><span style="font-size:9px;">' + _mciEsc(sh.label) + '</span></button>';
        }).join('') + '</div></div>'
        + '<div class="mcbi-field"><label>Tamanho</label>'
        + '<select class="mbadge-size form-control input-sm">'
        + [['sm', 'Compacto'], ['md', 'Médio'], ['lg', 'Grande']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((design.size || 'md') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Alinhamento</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(3,1fr);">'
        + [['left', 'glyphicon-align-left'], ['center', 'glyphicon-align-center'], ['right', 'glyphicon-align-right']].map(function (a) {
            return '<button type="button" class="mcbi-ct-btn mbadge-align' + ((design.align || 'center') === a[0] ? ' is-on' : '') + '" data-align="' + a[0] + '"><i class="glyphicon ' + a[1] + '"></i><span>' + a[0] + '</span></button>';
        }).join('') + '</div></div>'
        + '<hr style="margin:10px 0;"><label style="font-weight:700;font-size:11px;">Icone (global)</label>'
        + '<div class="mcbi-field"><label>Posicao do icone</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(2,1fr);">'
        + [['before', 'Esquerda'], ['after', 'Direita']].map(function (p) {
            var on = (icon.position || 'before') === p[0];
            return '<button type="button" class="mcbi-ct-btn mbadge-icon-pos' + (on ? ' is-on' : '') + '" data-pos="' + p[0] + '"><span>' + p[1] + '</span></button>';
        }).join('') + '</div></div>'
        + '<div class="mcbi-field"><label>Tamanho icone</label>'
        + '<input type="number" class="mbadge-icon-size form-control input-sm" value="' + (icon.size || 16) + '" min="12" max="28"></div>'
        + '<div class="mbadge-custom-wrap" style="' + (curShape === 'custom' ? '' : 'display:none;') + '">'
        + '<hr style="margin:10px 0;"><label style="font-weight:700;font-size:11px;">CSS personalizado</label>'
        + '<div class="mcbi-field"><label>Classe extra</label>'
        + '<input type="text" class="mbadge-custom-class form-control input-sm" value="' + _mciEsc(custom.className || '') + '" placeholder="minha-classe-badge"></div>'
        + '<div class="mcbi-field"><label>CSS do chip</label>'
        + '<textarea class="mbadge-custom-css form-control input-sm" rows="2" placeholder="border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.1);">' + _mciEsc(custom.css || '') + '</textarea></div>'
        + '<div class="mcbi-field"><label>CSS variante +</label>'
        + '<textarea class="mbadge-custom-css-pos form-control input-sm" rows="1" placeholder="background:#ecfdf5;">' + _mciEsc((custom.variantCss && custom.variantCss.positive) || '') + '</textarea></div>'
        + '<div class="mcbi-field"><label>CSS variante -</label>'
        + '<textarea class="mbadge-custom-css-neg form-control input-sm" rows="1" placeholder="background:#fef2f2;">' + _mciEsc((custom.variantCss && custom.variantCss.negative) || '') + '</textarea></div>'
        + '<div class="mcbi-field"><label>CSS variante 0</label>'
        + '<textarea class="mbadge-custom-css-neu form-control input-sm" rows="1">' + _mciEsc((custom.variantCss && custom.variantCss.neutral) || '') + '</textarea></div></div>'
        + '<hr style="margin:10px 0;"><label style="font-weight:700;font-size:11px;">Overrides (0 = preset)</label>'
        + '<div class="mcbi-row2"><div class="mcbi-field"><label>Font size</label><input type="number" class="mbadge-fontsize form-control input-sm" value="' + (badgeStyle.fontSize || 0) + '" min="0" max="24"></div>'
        + '<div class="mcbi-field"><label>Min width</label><input type="number" class="mbadge-minwidth form-control input-sm" value="' + (badgeStyle.minWidth || 0) + '" min="0" max="200"></div></div>'
        + '<div class="mcbi-row2"><div class="mcbi-field"><label>Padding X</label><input type="number" class="mbadge-padx form-control input-sm" value="' + (badgeStyle.paddingX || 0) + '" min="0" max="30"></div>'
        + '<div class="mcbi-field"><label>Padding Y</label><input type="number" class="mbadge-pady form-control input-sm" value="' + (badgeStyle.paddingY || 0) + '" min="0" max="30"></div></div>'
        + '<hr style="margin:10px 0;"><label style="font-weight:700;font-size:11px;">Contentor</label>'
        + '<div class="mcbi-row2"><div class="mcbi-field"><label>Pad top</label><input type="number" class="mbadge-pt form-control input-sm" value="' + (container.paddingTop || 0) + '" min="0" max="60"></div>'
        + '<div class="mcbi-field"><label>Pad bottom</label><input type="number" class="mbadge-pb form-control input-sm" value="' + (container.paddingBottom || 0) + '" min="0" max="60"></div></div>';

    var h = '<div class="mcbi-root mbadge-root" data-stamp="' + stamp + '">'
        + (isSample ? '<div class="mcbi-sample-label"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>' : '')
        + _mciSection('badge-dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('badge-valor', 'Valor', 'glyphicon-stats', true, sValor)
        + _mciSection('badge-regras', 'Regras', 'glyphicon-resize-horizontal', true, sRegras)
        + _mciSection('badge-design', 'Design geral', 'glyphicon-tint', true, sDesign)
        + '</div>';

    panel.html(h + _mciCSS());
    _mbadgeEnsureMaterialSymbolsCss();
    _mbadgeInjectCss();

    var _badgeTimer = null;
    function fire() {
        clearTimeout(_badgeTimer);
        _badgeTimer = setTimeout(function () {
            if (!panel.find('.mbadge-root').length) return;
            var newCfg = _badgeReadConfig(panel, obj);
            obj.config = newCfg;
            obj.transformConfig = newCfg.transformConfig;
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 300);
    }

    panel.on('change.badgeinline input.badgeinline', 'select,input,textarea', fire);
    panel.on('click.badgeinline', '.mbadge-align', function (e) {
        e.preventDefault();
        panel.find('.mbadge-align').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });
    panel.on('click.badgeinline', '.mbadge-shape', function (e) {
        e.preventDefault();
        panel.find('.mbadge-shape').removeClass('is-on');
        $(this).addClass('is-on');
        var sh = $(this).data('shape');
        panel.find('.mbadge-custom-wrap').toggle(sh === 'custom');
        fire();
    });
    panel.on('click.badgeinline', '.mbadge-icon-pos', function (e) {
        e.preventDefault();
        panel.find('.mbadge-icon-pos').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });
    panel.on('click.badgeinline', '.mbadge-icon-preset', function (e) {
        e.preventDefault();
        var target = $(this).data('target');
        var val = $(this).attr('data-value') || $(this).data('value') || '';
        panel.find('.' + target).val(val).trigger('input');
    });
    panel.on('click.badgeinline', '.mbadge-conditional-template', function (e) {
        e.preventDefault();
        var vf = panel.find('.mbadge-valuefield').val() || cfg.valueField || 'variacaoAcumulada';
        var tpl = _mbadgeGetDeltaPercentConditionalTemplate(vf);
        panel.find('.mbadge-conditional-json').val(JSON.stringify(tpl));
        fire();
    });
    panel.on('click.badgeinline', '.mbadge-conditional-edit', function (e) {
        e.preventDefault();
        var vf = panel.find('.mbadge-valuefield').val() || cfg.valueField || '';
        var conditional = null;
        try { conditional = JSON.parse(panel.find('.mbadge-conditional-json').val() || '{}'); }
        catch (err) { conditional = _tblGetDeltaPercentConditionalTemplate(vf); }
        _tblOpenConditionalColumnModal(conditional, vf, fields, function (updated) {
            updated = _mbadgeEnsureRuleAppearance(updated, cfg.design);
            panel.find('.mbadge-conditional-json').val(JSON.stringify(updated));
            fire();
        }, { badgeMode: true });
    });
    panel.on('click.badgeinline', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });
    panel.on('change.badgeinline', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    panel.on('click.badgeinline', '.mcbi-btn-transform', function () {
        var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) return;
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tConf = obj.transformConfig || cfg.transformConfig || (_tName ? MTB.autoConfig(_tName, 'Badge') : { mode: 'sql', sourceTable: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'Badge',
            modalId: 'mbadge-transform-modal',
            hostId: 'mbadge-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                obj.transformConfig = newT;
                if (obj.config) obj.config.transformConfig = newT;
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                fields = _mciGetFields(obj);
                _mciSetSelectFields(panel.find('.mbadge-valuefield'), fields, '-- campo --');
                fire();
            }
        });
    });
    panel.on('change.badgeinline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        if (fs) {
            panel.find('.mcbi-sample-label').hide();
            _mciOnFonteSelected(fs, obj, panel, function () {
                fields = _mciGetFields(obj);
                _mciSetSelectFields(panel.find('.mbadge-valuefield'), fields, '-- campo --');
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                fire();
            });
        } else {
            obj.fontestamp = '';
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            fields = _mciGetFields(obj);
            _mciSetSelectFields(panel.find('.mbadge-valuefield'), fields, '-- campo --');
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            fire();
        }
    });
}

function _badgeReadConfig(panel, obj) {
    var cfg = _mbadgeNormalizeConfig(obj.config || {});
    var vf = panel.find('.mbadge-valuefield').val() || '';
    cfg.valueField = vf;
    try { cfg.conditional = JSON.parse(panel.find('.mbadge-conditional-json').val() || '{}'); }
    catch (e1) { cfg.conditional = _mbadgeGetDeltaPercentConditionalTemplate(vf); }
    if (!cfg.conditional.valueField) cfg.conditional.valueField = vf;
    cfg.conditional = _mbadgeEnsureRuleAppearance(cfg.conditional, cfg.design);

    cfg.design = {
        align: panel.find('.mbadge-align.is-on').data('align') || 'center',
        size: panel.find('.mbadge-size').val() || 'md',
        shape: panel.find('.mbadge-shape.is-on').data('shape') || 'pill',
        icon: {
            position: panel.find('.mbadge-icon-pos.is-on').data('pos') || 'before',
            gap: 4,
            size: parseInt(panel.find('.mbadge-icon-size').val(), 10) || 16
        },
        badge: {
            fontSize: parseInt(panel.find('.mbadge-fontsize').val(), 10) || 0,
            fontWeight: '',
            paddingX: parseInt(panel.find('.mbadge-padx').val(), 10) || 0,
            paddingY: parseInt(panel.find('.mbadge-pady').val(), 10) || 0,
            borderRadius: 0,
            minWidth: parseInt(panel.find('.mbadge-minwidth').val(), 10) || 0
        },
        custom: {
            className: panel.find('.mbadge-custom-class').val() || '',
            css: panel.find('.mbadge-custom-css').val() || '',
            variantCss: {
                positive: panel.find('.mbadge-custom-css-pos').val() || '',
                negative: panel.find('.mbadge-custom-css-neg').val() || '',
                neutral: panel.find('.mbadge-custom-css-neu').val() || ''
            }
        },
        container: {
            paddingTop: parseInt(panel.find('.mbadge-pt').val(), 10) || 0,
            paddingBottom: parseInt(panel.find('.mbadge-pb').val(), 10) || 0,
            paddingRight: 4,
            paddingLeft: 4
        }
    };
    if (obj.transformConfig) cfg.transformConfig = obj.transformConfig;
    obj.configjson = JSON.stringify(cfg);
    return cfg;
}

function createDynamicSchemaBadge(data) {
    var fieldOptions = [];
    var fieldTitles = [];
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) {
            if (key.indexOf('__') !== 0) {
                fieldOptions.push(key);
                fieldTitles.push(key);
            }
        });
    }
    return {
        type: 'object',
        title: 'Configuração de Badge',
        properties: {
            valueField: {
                type: 'string',
                title: 'Campo valor',
                'enum': fieldOptions,
                options: { enum_titles: fieldTitles }
            },
            conditional: { type: 'object', title: 'Regras condicionais', additionalProperties: true },
            design: { type: 'object', title: 'Design visual', additionalProperties: true }
        }
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO PROGRESS BAR — Fonte + limiares + referência de 100%
// ══════════════════════════════════════════════════════════════════════════════

var _PROGRESS_LIST_SAMPLE_ROWS = [
    { nome: 'Café', valor: 756 },
    { nome: 'Donut', valor: 387 },
    { nome: 'Bolacha', valor: 179 },
    { nome: 'Croissant', valor: 67 }
];

var _PROGRESS_SAMPLE_CONFIG = {
    valueField: 'valor',
    valueMode: 'ratio',
    reference: {
        mode: 'static',
        value: 100,
        field: 'meta',
        label: 'Meta',
        showInLabel: true,
        format: { type: 'number', locale: 'pt-PT', minimumFractionDigits: 0, maximumFractionDigits: 0, prefix: '', suffix: '' }
    },
    valueFormat: { type: 'money', locale: 'pt-PT', minimumFractionDigits: 0, maximumFractionDigits: 0, prefix: '', suffix: ' €' },
    display: {
        mode: 'single',
        title: 'Total Vendas',
        titleField: 'titulo',
        showTitle: true,
        showValue: true,
        showPercent: true,
        showReference: false,
        showThresholdLabel: false,
        showLegend: false,
        labelPosition: 'top',
        insideBar: false
    },
    list: {
        labelField: 'nome',
        referenceMode: 'max',
        maxRows: 0,
        sortBy: 'value',
        sortDir: 'desc',
        gap: 12,
        showItemValue: true,
        showItemPercent: true,
        uniformColor: false,
        header: {
            show: true,
            title: 'Menu Vendido',
            titleField: '',
            subtitle: '',
            subtitleMode: 'sum',
            subtitleLabel: 'encomendas criadas',
            subtitleField: ''
        }
    },
    thresholds: [
        { upTo: 40, label: 'Baixo', barColor: 'phc:danger', trackColor: '', className: '' },
        { upTo: 70, label: 'Médio', barColor: 'phc:warning', trackColor: '', className: '' },
        { upTo: 100, label: 'Alto', barColor: 'phc:success', trackColor: '', className: '' }
    ],
    clamp: true,
    design: {
        variant: 'kpi',
        height: 10,
        radius: 999,
        striped: false,
        animated: true,
        gradient: true,
        glow: false,
        showMarkers: false,
        trackColor: '#e8edf5',
        defaultBarColor: 'phc:danger',
        kpi: {
            showTrend: true,
            trendField: 'variacao',
            trendUpColor: 'phc:success',
            trendDownColor: 'phc:danger',
            lineHeight: 4,
            dotSize: 10,
            showDotLabel: true
        },
        customBar: {
            enabled: false,
            html: '',
            css: ''
        },
        align: 'stretch',
        container: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16 },
        typography: { fontSize: 12, fontWeight: '600', fontFamily: 'Nunito, sans-serif', textColor: '#334155', mutedColor: '#64748b' },
        custom: { className: '', css: '' }
    }
};

function _progNormalizeConfig(rawCfg) {
    var cfg = _txtDeepMerge(JSON.parse(JSON.stringify(_PROGRESS_SAMPLE_CONFIG)), rawCfg || {});
    cfg.thresholds = _progMergeThresholds(cfg.thresholds);
    if ((cfg.display || {}).mode === 'list' && cfg.list) {
        cfg.list.uniformColor = false;
    }
    return cfg;
}

function _progMergeThresholds(rawThresholds) {
    var defaults = (_PROGRESS_SAMPLE_CONFIG && _PROGRESS_SAMPLE_CONFIG.thresholds) || [];
    var sorted = _progSortThresholds(rawThresholds);
    if (!sorted.length) return defaults.slice();
    return sorted.map(function (th) {
        th = th || {};
        var upTo = _progSafeNumber(th.upTo, 100);
        var def = null;
        var i;
        var sortedDefs = _progSortThresholds(defaults);
        for (i = 0; i < sortedDefs.length; i++) {
            if (upTo <= _progSafeNumber(sortedDefs[i].upTo, 100)) {
                def = sortedDefs[i];
                break;
            }
        }
        if (!def && sortedDefs.length) def = sortedDefs[sortedDefs.length - 1];
        def = def || {};
        return {
            upTo: upTo,
            label: th.label != null ? th.label : (def.label || ''),
            barColor: th.barColor || def.barColor || 'phc:primary',
            trackColor: th.trackColor != null ? th.trackColor : (def.trackColor || ''),
            className: th.className || def.className || ''
        };
    });
}

function _progSafeNumber(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback || 0;
    var n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    return isNaN(n) ? (fallback || 0) : n;
}

function _progSortThresholds(thresholds) {
    return (thresholds || []).slice().sort(function (a, b) {
        return _progSafeNumber(a.upTo, 0) - _progSafeNumber(b.upTo, 0);
    });
}

function _progResolveThreshold(percent, thresholds) {
    var sorted = _progSortThresholds(thresholds);
    var i;
    for (i = 0; i < sorted.length; i++) {
        if (percent <= _progSafeNumber(sorted[i].upTo, 100)) return sorted[i];
    }
    return sorted.length ? sorted[sorted.length - 1] : null;
}

function _progResolveMetrics(row, cfg, scaleCtx) {
    cfg = _progNormalizeConfig(cfg);
    scaleCtx = scaleCtx || {};
    var display = cfg.display || {};
    var list = cfg.list || {};
    var value = _progSafeNumber(row[cfg.valueField], 0);
    var ref = cfg.reference || {};
    var max = 100;

    if (cfg.valueMode === 'percent') {
        max = 100;
    } else if (display.mode === 'list' && list.referenceMode) {
        if (list.referenceMode === 'max') {
            max = scaleCtx.listMax > 0 ? scaleCtx.listMax : 100;
        } else if (list.referenceMode === 'sum') {
            max = scaleCtx.listSum > 0 ? scaleCtx.listSum : 100;
        } else if (list.referenceMode === 'static') {
            max = _progSafeNumber(ref.value, 100);
        } else if (list.referenceMode === 'field' && ref.field) {
            max = _progSafeNumber(row[ref.field], ref.value || 100);
        } else {
            if (ref.mode === 'field' && ref.field) max = _progSafeNumber(row[ref.field], ref.value || 100);
            else max = _progSafeNumber(ref.value, 100);
        }
    } else {
        if (ref.mode === 'percent') max = 100;
        else if (ref.mode === 'field' && ref.field) max = _progSafeNumber(row[ref.field], ref.value || 100);
        else max = _progSafeNumber(ref.value, 100);
    }
    if (max <= 0) max = 100;
    var percent = cfg.valueMode === 'percent' ? value : ((value / max) * 100);
    if (cfg.clamp !== false) percent = Math.max(0, Math.min(100, percent));
    var threshold = _progResolveThreshold(percent, cfg.thresholds);
    return { value: value, max: max, percent: percent, threshold: threshold };
}

function _progComputeListScale(rows, cfg) {
    var vf = cfg.valueField;
    var sum = 0;
    var max = 0;
    (rows || []).forEach(function (r) {
        var v = _progSafeNumber(r[vf], 0);
        sum += v;
        if (v > max) max = v;
    });
    return { listSum: sum, listMax: max };
}

function _progSortListRows(rows, cfg) {
    var list = cfg.list || {};
    var sorted = (rows || []).slice();
    if (list.sortBy === 'label' && list.labelField) {
        sorted.sort(function (a, b) {
            var la = String(a[list.labelField] || '');
            var lb = String(b[list.labelField] || '');
            var cmp = la.localeCompare(lb);
            return list.sortDir === 'asc' ? cmp : -cmp;
        });
    } else if (list.sortBy === 'value' && cfg.valueField) {
        sorted.sort(function (a, b) {
            var va = _progSafeNumber(a[cfg.valueField], 0);
            var vb = _progSafeNumber(b[cfg.valueField], 0);
            return list.sortDir === 'asc' ? (va - vb) : (vb - va);
        });
    }
    var maxRows = parseInt(list.maxRows, 10) || 0;
    if (maxRows > 0) sorted = sorted.slice(0, maxRows);
    return sorted;
}

function _progFormatListItemMetrics(metrics, cfg) {
    var list = cfg.list || {};
    var display = cfg.display || {};
    var valueFmt = cfg.valueFormat || {};
    var pctFmt = { type: 'number', locale: valueFmt.locale || 'pt-PT', maximumFractionDigits: 1, minimumFractionDigits: 0, suffix: '%', prefix: '' };
    var valueText = _progFormatNumber(metrics.value, valueFmt);
    var percentText = _progFormatNumber(metrics.percent, pctFmt);
    var showV = display.showValue !== false && list.showItemValue !== false;
    var showP = display.showPercent !== false && list.showItemPercent !== false;
    if (showV && showP) return valueText + ' (' + percentText + ')';
    if (showV) return valueText;
    if (showP) return percentText;
    return '';
}

function _progResolveListSubtitle(rows, cfg, scaleCtx) {
    var list = cfg.list || {};
    var hdr = list.header || {};
    var mode = hdr.subtitleMode || 'sum';
    if (mode === 'static' && hdr.subtitle) return hdr.subtitle;
    if (mode === 'field' && hdr.subtitleField && rows[0]) return String(rows[0][hdr.subtitleField] || '');
    if (mode === 'count') {
        var n = _progFormatNumber(rows.length, { type: 'number', locale: 'pt-PT', maximumFractionDigits: 0 });
        return hdr.subtitleLabel ? (n + ' ' + hdr.subtitleLabel) : n;
    }
    var sum = scaleCtx.listSum != null ? scaleCtx.listSum : _progComputeListScale(rows, cfg).listSum;
    var n = _progFormatNumber(sum, cfg.valueFormat || { type: 'number', locale: 'pt-PT', maximumFractionDigits: 0 });
    return hdr.subtitleLabel ? (n + ' ' + hdr.subtitleLabel) : n;
}

function _progGetBarHeight(design) {
    design = design || {};
    if (design.variant === 'kpi') {
        return Math.max(2, parseInt((design.kpi && design.kpi.lineHeight) || design.height, 10) || 4);
    }
    var height = Math.max(4, parseInt(design.height, 10) || 10);
    if (design.variant === 'slim') height = Math.min(height, 6);
    if (design.variant === 'pill') height = Math.max(height, 14);
    return height;
}

function _progKpiLineGradient(barColor) {
    var rgb = _progColorToRgb(barColor);
    if (!rgb) return 'linear-gradient(90deg,transparent 0%,' + barColor + ' 92%)';
    return 'linear-gradient(90deg,rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0) 0%,rgba('
        + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1) 92%)';
}

function _progResolveTrend(row, kpi) {
    kpi = kpi || {};
    if (!kpi.showTrend || !kpi.trendField) return null;
    var raw = row[kpi.trendField];
    if (raw === null || raw === undefined || raw === '') return null;
    var v = _progSafeNumber(raw, 0);
    var dir = v > 0 ? 'up' : (v < 0 ? 'down' : 'neutral');
    var fmt = kpi.trendFormat || { type: 'number', locale: 'pt-PT', maximumFractionDigits: 2, minimumFractionDigits: 2, suffix: '%', prefix: '' };
    var text = _progFormatNumber(Math.abs(v), fmt);
    var token = dir === 'up' ? (kpi.trendUpColor || 'phc:success') : (dir === 'down' ? (kpi.trendDownColor || 'phc:danger') : 'phc:info');
    return {
        direction: dir,
        text: text,
        color: _progResolveColor(token, '#22c55e')
    };
}

function _progInterpolateBarTemplate(template, ctx) {
    if (!template) return '';
    return String(template).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function (_, key) {
        return ctx[key] != null ? String(ctx[key]) : '';
    });
}

function _progBuildBarContext(metrics, barColor, trackColor, percentText, valueText) {
    var pct = Math.max(0, Math.min(100, metrics.percent));
    return {
        percent: pct.toFixed(1),
        percentRaw: String(pct),
        percentWidth: pct.toFixed(2) + '%',
        percentFormatted: percentText || '',
        value: String(metrics.value),
        valueFormatted: valueText || '',
        max: String(metrics.max),
        barColor: barColor,
        trackColor: trackColor || '#e8edf5'
    };
}

function _progInjectCustomBarCss(stamp, customBar) {
    customBar = customBar || {};
    var styleId = 'mprog-custom-bar-css-' + stamp;
    $('#' + styleId).remove();
    if (!customBar.enabled || !customBar.css) return;
    var raw = String(customBar.css);
    var scoped = raw.indexOf('.mprog-custom-bar') >= 0 || raw.indexOf('#mprog_') >= 0
        ? raw
        : ('#mprog_' + stamp + ' .mprog-custom-bar { ' + raw + ' }');
    $('head').append('<style id="' + styleId + '">' + scoped + '</style>');
}

function _progBuildCustomBarHtml(customBar, ctx) {
    if (!customBar || !customBar.enabled || !customBar.html) return '';
    return '<div class="mprog-custom-bar">' + _progInterpolateBarTemplate(customBar.html, ctx) + '</div>';
}

function _progBuildKpiTrackHtml(metrics, barColor, design, percentText) {
    design = design || {};
    var kpi = design.kpi || {};
    var lineH = _progGetBarHeight(design);
    var dotSize = Math.max(6, parseInt(kpi.dotSize, 10) || 10);
    var pct = Math.max(0, Math.min(100, metrics.percent));
    var pctLeft = pct.toFixed(2) + '%';
    var showLabel = kpi.showDotLabel !== false && percentText;
    var lineStyle = 'height:' + lineH + 'px;width:' + pctLeft + ';background:' + _progKpiLineGradient(barColor) + ';border-radius:' + lineH + 'px;';
    var dotStyle = 'left:' + pctLeft + ';width:' + dotSize + 'px;height:' + dotSize + 'px;background:'
        + barColor + ';box-shadow:0 0 0 4px ' + _progColorWithAlpha(barColor, 0.2) + ',0 0 16px ' + _progColorWithAlpha(barColor, 0.5) + ';';
    return '<div class="mprog-kpi-track-area">'
        + (showLabel ? '<div class="mprog-kpi-pct" style="left:' + pctLeft + ';color:' + barColor + ';">' + _mciEsc(percentText) + '</div>' : '')
        + '<div class="mprog-kpi-line-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '">'
        + '<div class="mprog-kpi-line" style="' + lineStyle + '"></div>'
        + '<span class="mprog-kpi-dot" style="' + dotStyle + '"></span>'
        + '</div></div>';
}

function _progBuildTrackHtml(metrics, barColor, trackColor, design, options) {
    options = options || {};
    var height = options.height != null ? options.height : _progGetBarHeight(design);
    var threshold = metrics.threshold || {};
    var percentWidth = metrics.percent.toFixed(2) + '%';
    var fillClasses = 'mprog-fill'
        + (design.striped ? ' is-striped' : '')
        + (design.striped && design.animated !== false ? ' is-animated-stripes' : '')
        + (threshold.className ? (' ' + threshold.className) : '');
    var fillStyle = _progFillVisualStyle(barColor, design, options);
    var insideLabel = options.insideLabel || '';
    var markersHtml = options.markersHtml || '';
    var trackStyle = 'height:' + height + 'px;';
    if (trackColor) trackStyle += 'background:' + trackColor + ';';
    return '<div class="mprog-track-wrap">'
        + '<div class="mprog-track" style="' + trackStyle + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(metrics.percent) + '">'
        + '<div class="' + fillClasses + '" style="width:' + percentWidth + ';' + fillStyle + '"></div>'
        + insideLabel
        + '</div>'
        + markersHtml
        + '</div>';
}

function _progFormatNumber(val, fmt) {
    fmt = fmt || {};
    if (typeof formatDataValue === 'function') {
        return formatDataValue(val, {
            type: fmt.type || 'number',
            locale: fmt.locale || 'pt-PT',
            minimumFractionDigits: fmt.minimumFractionDigits != null ? fmt.minimumFractionDigits : 0,
            maximumFractionDigits: fmt.maximumFractionDigits != null ? fmt.maximumFractionDigits : 1,
            prefix: fmt.prefix || '',
            suffix: fmt.suffix || ''
        });
    }
    return String(val);
}

function _progHexToRgb(hex) {
    if (!hex || hex.charAt(0) !== '#') return null;
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function _progColorToRgb(color) {
    if (!color) return null;
    var hexRgb = _progHexToRgb(color);
    if (hexRgb) return hexRgb;
    var m = String(color).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (m) return { r: parseInt(m[1], 10), g: parseInt(m[2], 10), b: parseInt(m[3], 10) };
    return null;
}

function _progResolveColor(val, fallback) {
    if (val == null || val === '') val = fallback;
    var s = String(val || '');
    if (s.charAt(0) === '#' || s.indexOf('rgb') === 0 || s.indexOf('hsl') === 0) return s;
    if (typeof _tblResolveColorToken === 'function') {
        var t = _tblResolveColorToken(val, fallback);
        if (t && String(t).indexOf('phc:') !== 0) return t;
    }
    if (s.indexOf('phc:') === 0) {
        var phcResolved = _tblResolvePHCColor(s);
        if (phcResolved) return phcResolved;
    }
    if (typeof mdashResolveColorValue === 'function') {
        var m = mdashResolveColorValue(s.indexOf('phc:') === 0 ? s.replace('phc:', '') : s);
        if (m && String(m).indexOf('phc:') !== 0) return m;
    }
    if (s.indexOf('phc:') === 0 && typeof getCachedColor === 'function') {
        var c = getCachedColor(s.replace('phc:', ''));
        if (c && c.background) return c.background;
    }
    return val || fallback || '';
}

function _progResolveBarColors(threshold, design, useUniform) {
    design = design || {};
    threshold = threshold || {};
    if (useUniform) {
        return {
            barColor: _progResolveColor(design.defaultBarColor, 'phc:primary'),
            trackColor: _progResolveColor(design.trackColor, '#e8edf5')
        };
    }
    return {
        barColor: _progResolveColor(threshold.barColor || design.defaultBarColor, 'phc:primary'),
        trackColor: _progResolveColor(threshold.trackColor || design.trackColor, '#e8edf5')
    };
}

function _progColorWithAlpha(color, alpha) {
    var rgb = _progColorToRgb(color);
    if (rgb) return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + alpha + ')';
    return color;
}

function _progStripesLayer() {
    return 'linear-gradient(45deg,rgba(255,255,255,.32) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.32) 50%,rgba(255,255,255,.32) 75%,transparent 75%,transparent)';
}

function _progGlossLayer(barColor) {
    var rgb = _progColorToRgb(barColor);
    if (!rgb) return 'linear-gradient(180deg,rgba(255,255,255,.24) 0%,transparent 52%,rgba(0,0,0,.14) 100%)';
    return 'linear-gradient(180deg,rgba(255,255,255,.34) 0%,rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',1) 48%,rgba('
        + Math.max(0, rgb.r - 28) + ',' + Math.max(0, rgb.g - 28) + ',' + Math.max(0, rgb.b - 28) + ',1) 100%)';
}

function _progFillVisualStyle(barColor, design, options) {
    design = design || {};
    options = options || {};
    if (options.solidFill) {
        return 'background:' + barColor + ' !important;background-image:none !important;box-shadow:none;';
    }
    var gradient = design.gradient !== false;
    var striped = !!design.striped;
    var glow = !!design.glow;
    var images = [];
    var sizes = [];
    var style = '';

    if (striped) {
        images.push(_progStripesLayer());
        sizes.push('1rem 1rem');
    }
    if (gradient) {
        images.push(_progGlossLayer(barColor));
        sizes.push('100% 100%');
    }

    if (images.length) {
        style += 'background-image:' + images.join(',') + ';';
        style += 'background-size:' + sizes.join(',') + ';';
        style += 'background-color:' + barColor + ';';
    } else {
        style += 'background-color:' + barColor + ';';
    }

    if (glow) {
        var rgb = _progColorToRgb(barColor);
        if (rgb) {
            style += 'box-shadow:0 0 18px rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',.58),0 1px 3px rgba(15,23,42,.14);';
        } else {
            style += 'box-shadow:0 0 18px rgba(59,130,246,.45),0 1px 3px rgba(15,23,42,.14);';
        }
    }

    return style;
}

function _progInjectCss() {
    var s = '';
    s += '.m-dash-progress-root{width:100%;box-sizing:border-box;font-family:Nunito,sans-serif;}';
    s += '.m-dash-progress-root .mprog-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:8px;}';
    s += '.m-dash-progress-root .mprog-title{font-size:12px;font-weight:700;color:var(--mprog-title,#334155);letter-spacing:.01em;}';
    s += '.m-dash-progress-root .mprog-metrics{font-size:12px;font-weight:700;color:var(--mprog-text,#334155);white-space:nowrap;}';
    s += '.m-dash-progress-root .mprog-ref{font-weight:500;color:var(--mprog-muted,#64748b);}';
    s += '.m-dash-progress-root .mprog-threshold-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:rgba(148,163,184,.14);color:#475569;}';
    s += '.m-dash-progress-root .mprog-track-wrap{position:relative;}';
    s += '.m-dash-progress-root .mprog-track{position:relative;width:100%;background:var(--mprog-track,#e8edf5);border-radius:var(--mprog-radius,999px);overflow:hidden;box-shadow:inset 0 1px 2px rgba(15,23,42,.06);}';
    s += '.m-dash-progress-root .mprog-fill{height:100%;width:0;border-radius:inherit;transition:width .65s cubic-bezier(.22,1,.36,1);box-shadow:0 1px 3px rgba(15,23,42,.12);background-repeat:repeat,repeat;}';
    s += '.m-dash-progress-root .mprog-fill.is-striped.is-animated-stripes{background-position:0 0,0 0;animation:mprog-stripes 1.1s linear infinite;}';
    s += '@keyframes mprog-stripes{from{background-position:1rem 0,0 0;}to{background-position:0 0,0 0;}}';
    s += '.m-dash-progress-root.is-fill-animated .mprog-fill{animation:mprog-fill-pulse 1.8s ease-in-out infinite;}';
    s += '.m-dash-progress-root.is-fill-animated .mprog-fill.is-animated-stripes{animation:mprog-stripes 1.1s linear infinite,mprog-fill-pulse 1.8s ease-in-out infinite;}';
    s += '@keyframes mprog-fill-pulse{0%,100%{filter:brightness(1);}50%{filter:brightness(1.14);}}';
    s += '.m-dash-progress-root .mprog-fill-label{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.25);pointer-events:none;}';
    s += '.m-dash-progress-root .mprog-markers{position:absolute;left:0;right:0;top:0;bottom:0;pointer-events:none;z-index:2;}';
    s += '.m-dash-progress-root .mprog-marker{position:absolute;top:2px;bottom:2px;width:1px;transform:translateX(-50%);background:rgba(255,255,255,.88);box-shadow:0 0 0 1px rgba(15,23,42,.08);border-radius:1px;opacity:.95;}';
    s += '.m-dash-progress-root .mprog-legend{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:8px;}';
    s += '.m-dash-progress-root .mprog-legend-item{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:var(--mprog-muted,#64748b);}';
    s += '.m-dash-progress-root .mprog-legend-swatch{width:10px;height:10px;border-radius:999px;flex-shrink:0;}';
    s += '.m-dash-progress-root.variant-slim .mprog-head{margin-bottom:6px;}';
    s += '.m-dash-progress-root.variant-pill .mprog-track{box-shadow:inset 0 1px 3px rgba(15,23,42,.08),0 1px 0 rgba(255,255,255,.65);}';
    s += '.m-dash-progress-root.variant-glass .mprog-track{background:rgba(226,232,240,.55);backdrop-filter:blur(6px);}';
    s += '.m-dash-progress-root.mode-list .mprog-list{display:flex;flex-direction:column;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-header{margin-bottom:12px;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-title{font-size:14px;font-weight:800;color:var(--mprog-title,#1e293b);line-height:1.25;margin:0 0 2px;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-subtitle{font-size:11px;font-weight:500;color:var(--mprog-muted,#64748b);line-height:1.35;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-item{display:flex;flex-direction:column;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-row-hd{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:5px;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-label{font-size:12px;font-weight:600;color:var(--mprog-text,#334155);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-metrics{font-size:11.5px;font-weight:600;color:var(--mprog-muted,#64748b);white-space:nowrap;flex-shrink:0;}';
    s += '.m-dash-progress-root.mode-list .mprog-list-item .mprog-track-wrap{margin-bottom:0;}';
    s += '.m-dash-progress-root.variant-kpi{position:relative;overflow:hidden;background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.06);}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-eyebrow{font-size:11px;font-weight:600;color:var(--mprog-muted,#94a3b8);letter-spacing:.02em;margin-bottom:4px;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-value{font-size:28px;font-weight:800;color:var(--mprog-title,#0f172a);line-height:1.1;letter-spacing:-.02em;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-trend{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:8px;font-size:11px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.12);}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-trend .mprog-kpi-trend-ico{font-size:9px;line-height:1;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-track-area{position:relative;padding-top:22px;margin-top:4px;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-pct{position:absolute;top:0;transform:translateX(-50%);font-size:11px;font-weight:700;line-height:1;white-space:nowrap;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-line-wrap{position:relative;height:20px;display:flex;align-items:center;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-line{position:relative;transition:width .65s cubic-bezier(.22,1,.36,1);min-width:0;}';
    s += '.m-dash-progress-root.variant-kpi .mprog-kpi-dot{position:absolute;top:50%;transform:translate(-50%,-50%);border-radius:50%;transition:left .65s cubic-bezier(.22,1,.36,1);z-index:2;}';
    s += '.m-dash-progress-root .mprog-custom-bar{width:100%;}';
    $('#mdash-progress-css').remove();
    $('head').append('<style id="mdash-progress-css">' + s + '</style>');
}

function _progInjectInstanceCss(stamp, design) {
    design = design || {};
    var custom = design.custom || {};
    var styleId = 'mprog-inst-css-' + stamp;
    $('#' + styleId).remove();
    if (!custom.css && !custom.className) return;
    var sel = '#mprog_' + stamp;
    var css = custom.css ? (sel + ' ' + custom.css) : '';
    if (css) $('head').append('<style id="' + styleId + '">' + css + '</style>');
}

function _progFetchRows(dados, cfg) {
    var rows = [];
    var wasSample = !!dados.isSample;
    var isSample = wasSample;
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    if (tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                isSample = false;
            }
        } catch (e) {
            console.warn('[MDash] renderObjectProgress transform error:', e.message);
        }
    }
    if (rows.length === 0 && dados.data && dados.data.length > 0) {
        rows = dados.data;
        isSample = false;
    }
    if (rows.length === 0) {
        var mode = (cfg.display && cfg.display.mode) || 'single';
        rows = mode === 'list' ? _PROGRESS_LIST_SAMPLE_ROWS.slice() : getMdashSampleData('progress');
        isSample = true;
    }
    var listMode = (cfg.display && cfg.display.mode) === 'list';
    if (listMode && wasSample && !tCfg) {
        rows = _PROGRESS_LIST_SAMPLE_ROWS.slice();
        isSample = true;
    }
    return { rows: rows, isSample: isSample };
}

function renderObjectProgress(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = _progNormalizeConfig(dados.config);
    var fetched = _progFetchRows(dados, cfg);
    if ((cfg.display || {}).mode === 'list') {
        _progRenderProgressList(dados, cfg, fetched);
        return;
    }
    _progRenderProgressSingle(dados, cfg, fetched);
}

function _progRenderRootStyle(design) {
    design = design || {};
    var trackColor = _progResolveColor(design.trackColor, '#e8edf5');
    var radius = design.radius != null ? design.radius : 999;
    return ''
        + '--mprog-track:' + trackColor + ';'
        + '--mprog-radius:' + (radius === 999 ? '999px' : (radius + 'px')) + ';'
        + '--mprog-text:' + ((design.typography && design.typography.textColor) || '#334155') + ';'
        + '--mprog-muted:' + ((design.typography && design.typography.mutedColor) || '#64748b') + ';'
        + 'padding:' + (design.container.paddingTop || 0) + 'px ' + (design.container.paddingRight || 0) + 'px '
        + (design.container.paddingBottom || 0) + 'px ' + (design.container.paddingLeft || 0) + 'px;'
        + 'font-family:' + ((design.typography && design.typography.fontFamily) || 'Nunito, sans-serif') + ';';
}

function _progRenderProgressList(dados, cfg, fetched) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var design = cfg.design || {};
    var display = cfg.display || {};
    var list = cfg.list || {};
    var hdr = list.header || {};
    var rows = _progSortListRows(fetched.rows, cfg);
    var scaleCtx = _progComputeListScale(fetched.rows, cfg);
    var gap = Math.max(4, parseInt(list.gap, 10) || 12);
    var rootAnimClass = '';
    var sampleHtml = fetched.isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    _progInjectCss();
    _progInjectInstanceCss(stamp, design);

    var html = sampleHtml
        + '<div id="mprog_' + stamp + '" class="m-dash-progress-root mode-list variant-' + _mciEsc(design.variant || 'default')
        + rootAnimClass
        + (design.custom && design.custom.className ? (' ' + design.custom.className) : '') + '" style="' + _progRenderRootStyle(design) + '">';

    if (hdr.show !== false) {
        var listTitle = hdr.titleField && rows[0] && rows[0][hdr.titleField] != null
            ? String(rows[0][hdr.titleField])
            : (hdr.title || display.title || '');
        var subtitle = _progResolveListSubtitle(rows, cfg, scaleCtx);
        if (listTitle || subtitle) {
            html += '<div class="mprog-list-header">';
            if (listTitle) html += '<div class="mprog-list-title">' + _mciEsc(listTitle) + '</div>';
            if (subtitle) html += '<div class="mprog-list-subtitle">' + _mciEsc(subtitle) + '</div>';
            html += '</div>';
        }
    }

    html += '<div class="mprog-list" style="gap:' + gap + 'px;">';
    rows.forEach(function (row) {
        var metrics = _progResolveMetrics(row, cfg, scaleCtx);
        var threshold = _progResolveThreshold(metrics.percent, cfg.thresholds) || metrics.threshold || {};
        metrics.threshold = threshold;
        var barColor = _progResolveColor(threshold.barColor || design.defaultBarColor, 'phc:primary');
        var trackColor = _progResolveColor(threshold.trackColor || design.trackColor, '#e8edf5');
        var label = list.labelField ? (row[list.labelField] != null ? String(row[list.labelField]) : '') : '';
        if (!label) {
            Object.keys(row).some(function (k) {
                if (k.indexOf('__') === 0 || k === cfg.valueField) return false;
                label = String(row[k]);
                return true;
            });
        }
        var metricsText = _progFormatListItemMetrics(metrics, cfg);
        html += '<div class="mprog-list-item">';
        if (label || metricsText) {
            html += '<div class="mprog-list-row-hd">';
            if (label) html += '<span class="mprog-list-label">' + _mciEsc(label) + '</span>';
            if (metricsText) html += '<span class="mprog-list-metrics">' + _mciEsc(metricsText) + '</span>';
            html += '</div>';
        }
        html += _progBuildTrackHtml(metrics, barColor, trackColor, design, {
            solidFill: true,
            insideLabel: (display.insideBar && metrics.percent > 0)
                ? '<span class="mprog-fill-label">' + _mciEsc(_progFormatNumber(metrics.percent, { type: 'number', locale: 'pt-PT', maximumFractionDigits: 1, suffix: '%', prefix: '' })) + '</span>'
                : ''
        });
        html += '</div>';
    });
    if (display.showLegend && cfg.thresholds && cfg.thresholds.length) {
        html += '<div class="mprog-legend">'
            + _progSortThresholds(cfg.thresholds).map(function (th, idx, arr) {
                var from = idx === 0 ? 0 : _progSafeNumber(arr[idx - 1].upTo, 0);
                var to = _progSafeNumber(th.upTo, 100);
                var rangeLabel = (from + 1) + '–' + to + '%';
                if (idx === 0 && from === 0) rangeLabel = '≤ ' + to + '%';
                return '<span class="mprog-legend-item"><span class="mprog-legend-swatch" style="background:' + _mciEsc(_progResolveColor(th.barColor, 'phc:primary')) + ';"></span>'
                    + _mciEsc(th.label || rangeLabel) + '</span>';
            }).join('')
            + '</div>';
    }
    html += '</div></div>';
    $(dados.containerSelector).html(html);
}

function _progRenderProgressSingle(dados, cfg, fetched) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var row = fetched.rows[0] || {};
    var metrics = _progResolveMetrics(row, cfg);
    var design = cfg.design || {};
    if (design.variant === 'kpi') {
        _progRenderProgressKpi(dados, cfg, fetched, row, metrics);
        return;
    }
    var display = cfg.display || {};
    var ref = cfg.reference || {};
    var threshold = metrics.threshold || {};
    var barColor = _progResolveColor(threshold.barColor || design.defaultBarColor, 'phc:primary');
    var trackColor = _progResolveColor(threshold.trackColor || design.trackColor, '#e8edf5');
    var height = Math.max(4, parseInt(design.height, 10) || 10);
    if (design.variant === 'slim') height = Math.min(height, 6);
    if (design.variant === 'pill') height = Math.max(height, 14);
    var radius = design.radius != null ? design.radius : 999;
    var percentWidth = metrics.percent.toFixed(2) + '%';

    var title = display.showTitle
        ? (display.titleField && row[display.titleField] != null ? String(row[display.titleField]) : (display.title || ''))
        : '';
    var valueText = display.showValue ? _progFormatNumber(metrics.value, cfg.valueFormat) : '';
    var percentText = display.showPercent ? _progFormatNumber(metrics.percent, { type: 'number', locale: cfg.valueFormat.locale || 'pt-PT', maximumFractionDigits: 1, suffix: '%', prefix: '' }) : '';
    var refText = '';
    if (display.showReference && ref.showInLabel !== false) {
        var refVal = cfg.valueMode === 'percent' ? 100 : metrics.max;
        var refLabel = ref.label || '100%';
        refText = refLabel + ': ' + _progFormatNumber(refVal, ref.format || ref);
    }

    var metricsParts = [];
    if (display.showValue && valueText && display.showPercent && percentText) {
        var vNorm = String(valueText).replace(/\s/g, '');
        var pNorm = String(percentText).replace(/\s/g, '');
        if (vNorm === pNorm) metricsParts.push(percentText);
        else { metricsParts.push(valueText); metricsParts.push(percentText); }
    } else {
        if (display.showPercent && percentText) metricsParts.push(percentText);
        else if (display.showValue && valueText) metricsParts.push(valueText);
    }
    if (refText) metricsParts.push('<span class="mprog-ref">' + _mciEsc(refText) + '</span>');

    var headLeft = '';
    if (display.showThresholdLabel && threshold.label) {
        headLeft = '<span class="mprog-threshold-pill" style="background:' + _mciEsc(_progColorWithAlpha(barColor, 0.14)) + ';color:' + _mciEsc(barColor) + ';">' + _mciEsc(threshold.label) + '</span>';
    } else if (title) {
        headLeft = '<span class="mprog-title">' + _mciEsc(title) + '</span>';
    }

    var markersHtml = '';
    if (design.showMarkers === true) {
        var markerBits = '';
        _progSortThresholds(cfg.thresholds).forEach(function (th) {
            var pos = Math.max(0, Math.min(100, _progSafeNumber(th.upTo, 0)));
            if (pos <= 0 || pos >= 100) return;
            markerBits += '<span class="mprog-marker" style="left:' + pos + '%;" title="' + _mciEsc(th.label || ('≤ ' + pos + '%')) + '"></span>';
        });
        if (markerBits) markersHtml = '<div class="mprog-markers">' + markerBits + '</div>';
    }

    var legendHtml = '';
    if (display.showLegend) {
        legendHtml = '<div class="mprog-legend">'
            + _progSortThresholds(cfg.thresholds).map(function (th, idx, arr) {
                var from = idx === 0 ? 0 : _progSafeNumber(arr[idx - 1].upTo, 0);
                var to = _progSafeNumber(th.upTo, 100);
                var rangeLabel = (from + 1) + '–' + to + '%';
                if (idx === 0 && from === 0) rangeLabel = '≤ ' + to + '%';
                return '<span class="mprog-legend-item"><span class="mprog-legend-swatch" style="background:' + _mciEsc(_progResolveColor(th.barColor, 'phc:primary')) + ';"></span>'
                    + _mciEsc(th.label || rangeLabel) + '</span>';
            }).join('')
            + '</div>';
    }

    var insideLabel = (display.insideBar && percentWidth !== '0.00%')
        ? '<span class="mprog-fill-label">' + _mciEsc(percentText || valueText) + '</span>'
        : '';

    var rootStyle = ''
        + '--mprog-track:' + trackColor + ';'
        + '--mprog-radius:' + (radius === 999 ? '999px' : (radius + 'px')) + ';'
        + '--mprog-text:' + ((design.typography && design.typography.textColor) || '#334155') + ';'
        + '--mprog-muted:' + ((design.typography && design.typography.mutedColor) || '#64748b') + ';'
        + 'padding:' + (design.container.paddingTop || 0) + 'px ' + (design.container.paddingRight || 0) + 'px '
        + (design.container.paddingBottom || 0) + 'px ' + (design.container.paddingLeft || 0) + 'px;'
        + 'font-family:' + ((design.typography && design.typography.fontFamily) || 'Nunito, sans-serif') + ';';

    var fillClasses = 'mprog-fill'
        + (design.striped ? ' is-striped' : '')
        + (design.striped && design.animated !== false ? ' is-animated-stripes' : '')
        + (threshold.className ? (' ' + threshold.className) : '');
    var fillStyle = _progFillVisualStyle(barColor, design);
    var rootAnimClass = (design.animated !== false && !design.striped) ? ' is-fill-animated' : '';

    var sampleHtml = fetched.isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    _progInjectCss();
    _progInjectInstanceCss(stamp, design);
    _progInjectCustomBarCss(stamp, design.customBar);

    var customBar = design.customBar || {};
    var barCtx = _progBuildBarContext(metrics, barColor, trackColor, percentText, valueText);
    var trackHtml = '';
    if (customBar.enabled && customBar.html) {
        trackHtml = _progBuildCustomBarHtml(customBar, barCtx);
    } else {
        trackHtml = '<div class="mprog-track-wrap">'
            + '<div class="mprog-track" style="height:' + height + 'px;" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(metrics.percent) + '">'
            + '<div class="' + fillClasses + '" style="width:' + percentWidth + ';' + fillStyle + '"></div>'
            + insideLabel
            + '</div>'
            + markersHtml
            + '</div>';
    }

    var html = sampleHtml
        + '<div id="mprog_' + stamp + '" class="m-dash-progress-root variant-' + _mciEsc(design.variant || 'default')
        + rootAnimClass
        + (design.custom && design.custom.className ? (' ' + design.custom.className) : '') + '" style="' + rootStyle + '">';

    if (display.labelPosition !== 'bottom') {
        html += '<div class="mprog-head">'
            + '<div class="mprog-head-left">' + headLeft + '</div>'
            + '<div class="mprog-metrics">' + metricsParts.join(' · ') + '</div>'
            + '</div>';
    }

    html += trackHtml;

    if (display.labelPosition === 'bottom') {
        html += '<div class="mprog-head" style="margin-top:8px;margin-bottom:0;">'
            + '<div class="mprog-head-left">' + headLeft + '</div>'
            + '<div class="mprog-metrics">' + metricsParts.join(' · ') + '</div>'
            + '</div>';
    }

    html += legendHtml + '</div>';
    $(dados.containerSelector).html(html);
}

function _progRenderProgressKpi(dados, cfg, fetched, row, metrics) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var design = cfg.design || {};
    var display = cfg.display || {};
    var kpi = design.kpi || {};
    var threshold = metrics.threshold || {};
    var barColor = _progResolveColor(design.defaultBarColor || threshold.barColor, 'phc:primary');
    var percentText = display.showPercent !== false && kpi.showDotLabel !== false
        ? _progFormatNumber(metrics.percent, { type: 'number', locale: (cfg.valueFormat && cfg.valueFormat.locale) || 'pt-PT', maximumFractionDigits: 1, suffix: '%', prefix: '' })
        : '';

    var title = display.showTitle !== false
        ? (display.titleField && row[display.titleField] != null ? String(row[display.titleField]) : (display.title || ''))
        : '';
    var valueText = display.showValue !== false
        ? _progFormatNumber(metrics.value, cfg.valueFormat || { type: 'number', locale: 'pt-PT' })
        : '';

    var trend = _progResolveTrend(row, kpi);
    var trendHtml = '';
    if (trend) {
        var arrow = trend.direction === 'down' ? '▼' : (trend.direction === 'up' ? '▲' : '●');
        trendHtml = '<div class="mprog-kpi-trend" style="background:' + _mciEsc(trend.color) + ';box-shadow:0 4px 16px ' + _mciEsc(_progColorWithAlpha(trend.color, 0.45)) + ';">'
            + _mciEsc(trend.text) + ' <span class="mprog-kpi-trend-ico">' + arrow + '</span></div>';
    }

    var rootStyle = _progRenderRootStyle(design) + '--mprog-accent:' + barColor + ';--mprog-title:' + ((design.typography && design.typography.textColor) || '#0f172a') + ';';
    var sampleHtml = fetched.isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    _progInjectCss();
    _progInjectInstanceCss(stamp, design);
    _progInjectCustomBarCss(stamp, design.customBar);

    var customBar = design.customBar || {};
    var barCtx = _progBuildBarContext(metrics, barColor, design.trackColor || '#e8edf5', percentText, valueText);
    var barHtml = (customBar.enabled && customBar.html)
        ? _progBuildCustomBarHtml(customBar, barCtx)
        : _progBuildKpiTrackHtml(metrics, barColor, design, percentText);

    var html = sampleHtml
        + '<div id="mprog_' + stamp + '" class="m-dash-progress-root variant-kpi'
        + (design.custom && design.custom.className ? (' ' + design.custom.className) : '') + '" style="' + rootStyle + '">'
        + '<div class="mprog-kpi-head">'
        + '<div class="mprog-kpi-head-left">'
        + (title ? '<div class="mprog-kpi-eyebrow">' + _mciEsc(title) + '</div>' : '')
        + (valueText ? '<div class="mprog-kpi-value">' + _mciEsc(valueText) + '</div>' : '')
        + '</div>'
        + trendHtml
        + '</div>'
        + barHtml
        + '</div>';
    $(dados.containerSelector).html(html);
}

function _progThresholdRowHtml(th, idx) {
    th = th || {};
    return '<div class="mprog-th-row" data-idx="' + idx + '" style="padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;background:#fafbfc;">'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Até (% do máximo)</label><input type="number" class="mprog-th-upto form-control input-sm" min="0" max="1000" step="1" value="' + _progSafeNumber(th.upTo, 100) + '"></div>'
        + '<div class="mcbi-field"><label>Etiqueta</label><input type="text" class="mprog-th-label form-control input-sm" value="' + _mciEsc(th.label || '') + '" placeholder="ex: Médio"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Cor da barra', 'mprog-th-bar', th.barColor || 'phc:primary', true)
        + _tblColorTokenFieldHtml('Cor do fundo', 'mprog-th-track', th.trackColor || '', true, true)
        + '</div>'
        + '<div class="mcbi-field"><label>Classe CSS (opcional)</label><input type="text" class="mprog-th-class form-control input-sm" value="' + _mciEsc(th.className || '') + '" placeholder="ex: mprog-risk-high"></div>'
        + '<button type="button" class="btn btn-xs btn-danger mprog-th-remove" style="margin-top:4px;"><i class="glyphicon glyphicon-trash"></i> Remover</button>'
        + '</div>';
}

function renderProgressPropertiesInline(obj, panel) {
    panel.off('.mproginline');
    var cfg = _progNormalizeConfig(obj.config);
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    _mciCSS();

    var _timer = null;
    function _applyConfig() {
        if (!panel.find('.mprog-props-root').length) return;
        var scrollState = _mciCaptureEditorScrollState();
        var newCfg = _progReadConfig(panel, obj);
        obj.config = newCfg;
        obj.transformConfig = newCfg.transformConfig || obj.transformConfig || null;
        if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
        if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
        _mciRerender(obj, { preserveFocus: true });
        setTimeout(function () { _mciRestoreEditorScrollState(scrollState); }, 0);
        setTimeout(function () { _mciRestoreEditorScrollState(scrollState); }, 100);
    }
    function fire(delay) {
        clearTimeout(_timer);
        _timer = setTimeout(_applyConfig, delay == null ? 400 : delay);
    }

    function _fieldOpts(cur) {
        return '<option value="">-- campo --</option>'
            + fields.map(function (f) {
                return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>';
            }).join('');
    }

    var _hasTrans = !!(obj.transformConfig && obj.transformConfig.sourceTable);
    var ref = cfg.reference || {};
    var display = cfg.display || {};
    var list = cfg.list || {};
    var listHdr = list.header || {};
    var design = cfg.design || {};
    var custom = design.custom || {};
    var customBar = design.customBar || {};
    var isList = (display.mode || 'single') === 'list';

    var sModo = '<div class="mcbi-field"><label>Modo de apresentação</label><select class="mprog-display-mode form-control input-sm">'
        + [['single', 'Barra única'], ['list', 'Lista de barras (ranking)']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((display.mode || 'single') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>';

    var sDados = sModo
        + '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(obj.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo valor actual</label><select class="mprog-valuefield form-control input-sm">' + _fieldOpts(cfg.valueField) + '</select></div>'
        + '<div class="mcbi-field"><label>Modo do valor</label><select class="mprog-valuemode form-control input-sm">'
        + [['ratio', 'Rácio (valor ÷ máximo)'], ['percent', 'Já é percentagem (0–100)']].map(function (o) {
            return '<option value="' + o[0] + '"' + (cfg.valueMode === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div></div>';

    var sLista = '<div class="mprog-list-props"' + (isList ? '' : ' style="display:none;"') + '>'
        + '<div class="mcbi-info" style="margin-bottom:8px;">Uma barra por linha da fonte — ideal para rankings (ex: produtos mais vendidos).</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Campo do rótulo</label><select class="mprog-label-field form-control input-sm">' + _fieldOpts(list.labelField || 'nome') + '</select></div>'
        + '<div class="mcbi-field"><label>Escala comum (100%)</label><select class="mprog-list-ref-mode form-control input-sm">'
        + [['max', 'Maior valor da lista'], ['sum', 'Soma de todos os valores'], ['static', 'Valor fixo (referência)'], ['field', 'Campo máximo por linha']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((list.referenceMode || 'max') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Ordenar por</label><select class="mprog-list-sort form-control input-sm">'
        + [['value', 'Valor'], ['label', 'Rótulo'], ['order', 'Ordem da fonte']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((list.sortBy || 'value') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Direcção</label><select class="mprog-list-sort-dir form-control input-sm">'
        + [['desc', 'Descendente'], ['asc', 'Ascendente']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((list.sortDir || 'desc') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Máx. linhas (0=todas)</label><input type="number" class="mprog-list-maxrows form-control input-sm" min="0" step="1" value="' + (list.maxRows || 0) + '"></div>'
        + '<div class="mcbi-field"><label>Espaçamento: <strong class="mprog-list-gap-lbl">' + (list.gap || 12) + '</strong> px</label>'
        + '<input type="range" class="mprog-list-gap form-control input-sm" min="4" max="28" step="1" value="' + (list.gap || 12) + '"></div></div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mprog-list-show-value', 'Valor por linha', list.showItemValue !== false)
        + _mciChk('mprog-list-show-percent', 'Percentagem por linha', list.showItemPercent !== false)
        + _mciChk('mprog-list-show-header', 'Cabeçalho da lista', listHdr.show !== false)
        + _mciChk('mprog-list-show-legend', 'Legenda de limiares', !!display.showLegend)
        + '</div>'
        + '<div class="mprog-list-header-props"' + (listHdr.show === false ? ' style="display:none;"' : '') + '>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Título do cabeçalho</label><input type="text" class="mprog-list-title form-control input-sm" value="' + _mciEsc(listHdr.title || '') + '" placeholder="ex: Menu Vendido"></div>'
        + '<div class="mcbi-field"><label>Campo título (opcional)</label><select class="mprog-list-title-field form-control input-sm">' + _fieldOpts(listHdr.titleField) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Subtítulo</label><select class="mprog-list-subtitle-mode form-control input-sm">'
        + [['sum', 'Soma dos valores'], ['count', 'N.º de linhas'], ['static', 'Texto fixo'], ['field', 'Campo da fonte']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((listHdr.subtitleMode || 'sum') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Sufixo do subtítulo</label><input type="text" class="mprog-list-subtitle-label form-control input-sm" value="' + _mciEsc(listHdr.subtitleLabel || '') + '" placeholder="ex: encomendas criadas"></div>'
        + '</div>'
        + '<div class="mcbi-field mprog-list-subtitle-static-wrap"><label>Texto fixo do subtítulo</label><input type="text" class="mprog-list-subtitle-text form-control input-sm" value="' + _mciEsc(listHdr.subtitle || '') + '"></div>'
        + '<div class="mcbi-field mprog-list-subtitle-field-wrap" style="display:none;"><label>Campo do subtítulo</label><select class="mprog-list-subtitle-field form-control input-sm">' + _fieldOpts(listHdr.subtitleField) + '</select></div>'
        + '</div></div>';

    var sReferencia = '<div class="mprog-single-ref"' + (isList ? ' style="display:none;"' : '') + '>'
        + '<div class="mcbi-info" style="margin-bottom:8px;">Define o que corresponde a <b>100%</b> na barra (meta, objectivo, orçamento…).</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Referência de 100%</label><select class="mprog-ref-mode form-control input-sm">'
        + [['static', 'Valor fixo'], ['field', 'Campo da fonte'], ['percent', 'Sempre 100% (valor já é %)']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((ref.mode || 'static') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field mprog-ref-static-wrap"><label>Valor máximo (100%)</label><input type="number" class="mprog-ref-value form-control input-sm" value="' + _progSafeNumber(ref.value, 100) + '" min="0" step="any"></div>'
        + '<div class="mcbi-field mprog-ref-field-wrap" style="display:none;"><label>Campo máximo</label><select class="mprog-ref-field form-control input-sm">' + _fieldOpts(ref.field) + '</select></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Rótulo do máximo</label><input type="text" class="mprog-ref-label form-control input-sm" value="' + _mciEsc(ref.label || 'Meta') + '" placeholder="ex: Meta, Objectivo, Orçamento"></div>'
        + '<div class="mcbi-field"><label>Sufixo do máximo</label><input type="text" class="mprog-ref-suffix form-control input-sm" value="' + _mciEsc((ref.format && ref.format.suffix) || '') + '" placeholder="ex: €, un."></div>'
        + '</div></div>';

    var sLimiares = '<div class="mprog-thresholds-wrap">'
        + '<div class="mcbi-info" style="margin-bottom:8px;">Limiares por ordem crescente — a primeira faixa que contém a percentagem define cor e estilo'
        + (isList ? ' de <b>cada barra</b> da lista.' : ' da barra.') + '</div>'
        + '<div class="mprog-th-list">'
        + _progSortThresholds(cfg.thresholds).map(function (th, i) { return _progThresholdRowHtml(th, i); }).join('')
        + '</div>'
        + '<button type="button" class="btn btn-xs btn-default mprog-th-add" style="width:100%;"><i class="glyphicon glyphicon-plus"></i> Adicionar limiar</button></div>';

    var isKpi = (design.variant || 'default') === 'kpi';
    var kpi = design.kpi || {};

    var sKpiDisplay = '<div class="mprog-kpi-display"' + (!isKpi || isList ? ' style="display:none;"' : '') + '">'
        + '<div class="mcbi-info" style="margin-bottom:8px;">Layout tipo cartão KPI — título, valor grande, badge de tendência e linha com ponto.</div>'
        + _mciChk('mprog-kpi-show-title', 'Título pequeno', display.showTitle !== false)
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Texto do título</label><input type="text" class="mprog-title-text form-control input-sm" value="' + _mciEsc(display.title || '') + '" placeholder="ex: Total Vendas"></div>'
        + '<div class="mcbi-field"><label>Campo título</label><select class="mprog-title-field form-control input-sm">' + _fieldOpts(display.titleField) + '</select></div>'
        + '</div>'
        + _mciChk('mprog-kpi-show-value', 'Valor principal', display.showValue !== false)
        + _mciChk('mprog-kpi-show-percent', 'Percentagem no ponto', display.showPercent !== false)
        + '<div class="mcbi-checks">'
        + _mciChk('mprog-kpi-trend', 'Badge de tendência', kpi.showTrend !== false)
        + '</div>'
        + '<div class="mcbi-field mprog-kpi-trend-wrap"' + (kpi.showTrend === false ? ' style="display:none;"' : '') + '><label>Campo tendência (%)</label><select class="mprog-kpi-trend-field form-control input-sm">' + _fieldOpts(kpi.trendField) + '</select></div>'
        + '</div>';

    var sDisplay = '<div class="mprog-single-display"' + (isList || isKpi ? ' style="display:none;"' : '') + '">'
        + _mciChk('mprog-show-percent', 'Mostrar percentagem', display.showPercent !== false)
        + _mciChk('mprog-show-value', 'Mostrar valor actual', !!display.showValue)
        + _mciChk('mprog-show-reference', 'Mostrar referência de 100%', !!display.showReference)
        + _mciChk('mprog-show-th-label', 'Mostrar etiqueta do limiar', !!display.showThresholdLabel)
        + _mciChk('mprog-show-legend', 'Legenda de limiares', !!display.showLegend)
        + _mciChk('mprog-inside-bar', 'Percentagem dentro da barra', !!display.insideBar)
        + '<div class="mcbi-field"><label>Posição dos rótulos</label><select class="mprog-label-pos form-control input-sm">'
        + [['top', 'Acima da barra'], ['bottom', 'Abaixo da barra']].map(function (o) {
            return '<option value="' + o[0] + '"' + ((display.labelPosition || 'top') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div></div>'
        + sKpiDisplay;

    var sDesign = '<div class="mcbi-field"><label>Variante</label><div class="mcbi-ct-grid3" style="grid-template-columns:repeat(5,1fr);">'
        + [['default', 'Padrão'], ['slim', 'Fina'], ['pill', 'Pill'], ['glass', 'Glass'], ['kpi', 'KPI']].map(function (v) {
            return '<button type="button" class="mcbi-ct-btn mprog-variant-btn' + ((design.variant || 'default') === v[0] ? ' is-on' : '') + '" data-variant="' + v[0] + '"><span>' + v[1] + '</span></button>';
        }).join('') + '</div></div>'
        + '<div class="mprog-kpi-design"' + (!isKpi ? ' style="display:none;"' : '') + '>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Cor destaque', 'mprog-default-bar', design.defaultBarColor || 'phc:primary', true)
        + '</div>'
        + '<div class="mprog-kpi-built-bar">'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Espessura linha: <strong class="mprog-kpi-line-lbl">' + ((kpi.lineHeight || design.height) || 4) + '</strong> px</label>'
        + '<input type="range" class="mprog-kpi-line-height form-control input-sm" min="2" max="10" step="1" value="' + ((kpi.lineHeight || design.height) || 4) + '"></div>'
        + '<div class="mcbi-field"><label>Tamanho do ponto: <strong class="mprog-kpi-dot-lbl">' + (kpi.dotSize || 10) + '</strong> px</label>'
        + '<input type="range" class="mprog-kpi-dot-size form-control input-sm" min="6" max="16" step="1" value="' + (kpi.dotSize || 10) + '"></div>'
        + '</div></div>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Tendência ▲', 'mprog-kpi-trend-up', kpi.trendUpColor || 'phc:success', true)
        + _tblColorTokenFieldHtml('Tendência ▼', 'mprog-kpi-trend-down', kpi.trendDownColor || 'phc:danger', true)
        + '</div></div>'
        + '<div class="mprog-standard-design"' + (isKpi ? ' style="display:none;"' : '') + '>'
        + '<div class="mprog-standard-built-bar">'
        + '<div class="mcbi-field"><label>Altura: <strong class="mprog-height-lbl">' + (design.height || 10) + '</strong> px</label>'
        + '<input type="range" class="mprog-height form-control input-sm" min="4" max="24" step="1" value="' + (design.height || 10) + '"></div>'
        + '<div class="mcbi-row2">'
        + _tblColorTokenFieldHtml('Cor barra (fallback)', 'mprog-default-bar', design.defaultBarColor || 'phc:primary', true)
        + _tblColorTokenFieldHtml('Cor fundo (fallback)', 'mprog-track-color', design.trackColor || '#e8edf5', true)
        + '</div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mprog-gradient', 'Gradiente na barra', design.gradient !== false)
        + _mciChk('mprog-striped', 'Listras animadas', !!design.striped)
        + _mciChk('mprog-animated', 'Animação de preenchimento', design.animated !== false)
        + _mciChk('mprog-glow', 'Brilho suave', !!design.glow)
        + _mciChk('mprog-markers', 'Marcadores nos limiares', design.showMarkers === true)
        + '</div></div>'
        + '<div class="mcbi-field"><label>Classe CSS do contentor</label><input type="text" class="mprog-custom-class form-control input-sm" value="' + _mciEsc(custom.className || '') + '"></div>'
        + '<div class="mcbi-field"><label>CSS personalizado</label><textarea class="mprog-custom-css form-control input-sm" rows="3" placeholder=".m-dash-progress-root { }">' + _mciEsc(custom.css || '') + '</textarea></div>'
        + '</div>'
        + '<div class="mprog-custom-bar-section"' + (isList ? ' style="display:none;"' : '') + '>'
        + '<div class="mcbi-info" style="margin:10px 0 8px;">Substitui a barra predefinida por HTML/CSS. Tokens: <b>{{percent}}</b>, <b>{{percentWidth}}</b>, <b>{{percentFormatted}}</b>, <b>{{value}}</b>, <b>{{valueFormatted}}</b>, <b>{{max}}</b>, <b>{{barColor}}</b>, <b>{{trackColor}}</b>.</div>'
        + _mciChk('mprog-custom-bar', 'Barra personalizada (HTML/CSS)', !!customBar.enabled)
        + '<div class="mprog-custom-bar-fields"' + (!customBar.enabled ? ' style="display:none;"' : '') + '>'
        + '<div class="mcbi-field"><label>HTML da barra</label><textarea class="mprog-custom-bar-html form-control input-sm" rows="5" placeholder="<div style=&quot;width:{{percentWidth}};height:8px;background:{{barColor}};border-radius:4px;&quot;></div>">' + _mciEsc(customBar.html || '') + '</textarea></div>'
        + '<div class="mcbi-field"><label>CSS da barra</label><textarea class="mprog-custom-bar-css form-control input-sm" rows="4" placeholder="position:relative;height:10px;border-radius:5px;background:var(--mprog-track,#e8edf5);">' + _mciEsc(customBar.css || '') + '</textarea></div>'
        + '</div></div>';

    function _sec(icon, title, body, open) {
        return '<div class="mcbi-section' + (open ? ' is-open' : '') + '">'
            + '<div class="mcbi-section-hd"><i class="' + icon + '" style="width:14px;"></i> ' + title
            + '<i class="glyphicon ' + (open ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down') + ' mcbi-chev" style="margin-left:auto;font-size:9px;"></i></div>'
            + '<div class="mcbi-section-bd">' + body + '</div></div>';
    }

    panel.html('<div class="mprog-props-root">'
        + _sec('fa fa-database', 'Dados & Fonte', sDados, true)
        + _sec('fa fa-list', 'Lista de Barras', sLista, true)
        + _sec('fa fa-bullseye', 'Referência de 100%', sReferencia, !isList)
        + _sec('fa fa-sliders', 'Limiares & Cores', sLimiares, true)
        + _sec('fa fa-eye', 'Apresentação', sDisplay, false)
        + _sec('fa fa-paint-brush', 'Design', sDesign, false)
        + '</div>');

    function _syncVariantUi() {
        var variant = panel.find('.mprog-variant-btn.is-on').data('variant') || 'default';
        var kpiOn = variant === 'kpi';
        var listOn = (panel.find('.mprog-display-mode').val() || 'single') === 'list';
        var customOn = panel.find('input.mprog-custom-bar').is(':checked');
        panel.find('.mprog-kpi-display').toggle(kpiOn && !listOn);
        panel.find('.mprog-single-display').toggle(!listOn && !kpiOn);
        panel.find('.mprog-kpi-design').toggle(kpiOn);
        panel.find('.mprog-standard-design').toggle(!kpiOn);
        panel.find('.mprog-kpi-trend-wrap').toggle(kpiOn && panel.find('input.mprog-kpi-trend').is(':checked'));
        panel.find('.mprog-custom-bar-section').toggle(!listOn);
        panel.find('.mprog-custom-bar-fields').toggle(customOn);
        panel.find('.mprog-kpi-built-bar, .mprog-standard-built-bar').toggle(!customOn);
    }
    function _syncModeUi() {
        var mode = panel.find('.mprog-display-mode').val() || 'single';
        var listOn = mode === 'list';
        panel.find('.mprog-list-props').toggle(listOn);
        panel.find('.mprog-single-ref').toggle(!listOn);
        _syncVariantUi();
    }
    function _syncListSubtitleUi() {
        var mode = panel.find('.mprog-list-subtitle-mode').val() || 'sum';
        panel.find('.mprog-list-subtitle-static-wrap').toggle(mode === 'static');
        panel.find('.mprog-list-subtitle-field-wrap').toggle(mode === 'field');
        panel.find('.mprog-list-header-props').toggle(panel.find('input.mprog-list-show-header').is(':checked'));
    }

    function _syncRefModeUi() {
        var mode = panel.find('.mprog-ref-mode').val() || 'static';
        panel.find('.mprog-ref-static-wrap').toggle(mode === 'static');
        panel.find('.mprog-ref-field-wrap').toggle(mode === 'field');
        if (mode === 'percent') panel.find('.mprog-valuemode').val('percent');
    }
    _syncRefModeUi();
    _syncModeUi();
    _syncListSubtitleUi();
    _syncVariantUi();

    panel.on('change.mproginline', '.mprog-display-mode', function () { _syncModeUi(); fire(0); });
    panel.on('change.mproginline', 'input.mprog-kpi-trend', function () { _syncVariantUi(); fire(0); });
    panel.on('change.mproginline', 'input.mprog-custom-bar', function () { _syncVariantUi(); fire(0); });
    panel.on('input.mproginline', '.mprog-kpi-line-height', function () {
        panel.find('.mprog-kpi-line-lbl').text($(this).val());
        fire();
    });
    panel.on('input.mproginline', '.mprog-kpi-dot-size', function () {
        panel.find('.mprog-kpi-dot-lbl').text($(this).val());
        fire();
    });
    panel.on('change.mproginline', '.mprog-list-subtitle-mode', function () { _syncListSubtitleUi(); fire(); });
    panel.on('change.mproginline', 'input.mprog-list-show-header', function () { _syncListSubtitleUi(); fire(0); });
    panel.on('input.mproginline', '.mprog-list-gap', function () {
        panel.find('.mprog-list-gap-lbl').text($(this).val());
        fire();
    });

    panel.on('click.mproginline', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });
    panel.on('change.mproginline', '.mprog-ref-mode', function () { _syncRefModeUi(); fire(); });
    panel.on('click.mproginline', '.mprog-variant-btn', function () {
        panel.find('.mprog-variant-btn').removeClass('is-on');
        $(this).addClass('is-on');
        _syncVariantUi();
        fire(0);
    });
    panel.on('input.mproginline', '.mprog-height', function () {
        panel.find('.mprog-height-lbl').text($(this).val());
        fire();
    });
    panel.on('change.mproginline', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire(0);
    });
    panel.on('click.mproginline', '.mprog-th-add', function () {
        panel.find('.mprog-th-list').append(_progThresholdRowHtml({ upTo: 100, label: 'Novo', barColor: 'phc:primary', trackColor: '' }, panel.find('.mprog-th-row').length));
        fire();
    });
    panel.on('click.mproginline', '.mprog-th-remove', function () {
        $(this).closest('.mprog-th-row').remove();
        fire();
    });
    panel.on('change.mproginline', '.mtbl-color-token', function () {
        var $wrap = $(this).closest('.mtbl-color-token-wrap');
        $wrap.find('input[type="color"]').toggle($(this).val() === 'custom');
        fire(0);
    });
    panel.on('change.mproginline input.mproginline', 'input.form-control, select.form-control, input[type=color], input[type=number], input[type=range]', function () {
        if ($(this).hasClass('mtbl-color-token')) return;
        fire();
    });
    panel.on('change.mproginline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        if (fs) {
            _mciOnFonteSelected(fs, obj, panel, function () {
                fields = _mciGetFields(obj);
                panel.find('.mprog-valuefield, .mprog-ref-field, .mprog-label-field, .mprog-list-title-field, .mprog-list-subtitle-field, .mprog-title-field, .mprog-kpi-trend-field').each(function () {
                    var cur = $(this).val();
                    _mciSetSelectFields($(this), fields, '-- campo --');
                    if (fields.indexOf(cur) >= 0) $(this).val(cur);
                });
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                fire();
            });
        } else {
            obj.fontestamp = '';
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            fields = _mciGetFields(obj);
            panel.find('.mprog-valuefield, .mprog-ref-field, .mprog-label-field, .mprog-list-title-field, .mprog-list-subtitle-field, .mprog-title-field, .mprog-kpi-trend-field').each(function () {
                var cur = $(this).val();
                _mciSetSelectFields($(this), fields, '-- campo --');
                if (fields.indexOf(cur) >= 0) $(this).val(cur);
            });
            if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            fire();
        }
    });
    panel.on('click.mproginline', '.mcbi-btn-transform', function () {
        var _tFnt = fontes.filter(function (f) { return f.mdashfontestamp === obj.fontestamp; })[0] || fontes[0];
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : (_tFnt ? (_tFnt.codigo || _tFnt.descricao || '') : '');
        var _tFntName = _tFnt ? (_tFnt.descricao || _tFnt.codigo || _tName) : '';
        var _tCfgRaw = obj.transformConfig || null;
        var MTB = (typeof MdashTransformBuilder !== 'undefined') ? MdashTransformBuilder : null;
        var _tConf = _tCfgRaw || (_tName && MTB ? MTB.autoConfig(_tName, 'Progresso') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        _mciOpenTransformModalFor({
            title: 'Transformação de Dados — Progresso',
            fonteName: _tFntName,
            fonte: _tFnt || null,
            objectType: 'Progresso',
            modalId: 'mprog-transform-modal',
            hostId: 'mprog-transform-modal-host',
            config: _tConf,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                fire();
            }
        });
    });
    _mciInitPropsCheckboxToggles();
    fire(0);
}

function _progReadConfig(panel, obj) {
    var cfg = _progNormalizeConfig(obj.config);
    cfg.valueField = panel.find('.mprog-valuefield').val() || '';
    cfg.reference = cfg.reference || {};
    cfg.reference.mode = panel.find('.mprog-ref-mode').val() || 'static';
    if (cfg.reference.mode === 'percent') cfg.valueMode = 'percent';
    else cfg.valueMode = panel.find('.mprog-valuemode').val() || 'ratio';
    cfg.reference.value = _progSafeNumber(panel.find('.mprog-ref-value').val(), 100);
    cfg.reference.field = panel.find('.mprog-ref-field').val() || '';
    cfg.reference.label = panel.find('.mprog-ref-label').val() || 'Meta';
    cfg.reference.showInLabel = true;
    cfg.reference.format = cfg.reference.format || {};
    cfg.reference.format.type = 'number';
    cfg.reference.format.locale = 'pt-PT';
    cfg.reference.format.suffix = panel.find('.mprog-ref-suffix').val() || '';
    var isKpiPanel = panel.find('input.mprog-kpi-show-title').length > 0;
    cfg.display = {
        mode: panel.find('.mprog-display-mode').val() || 'single',
        showPercent: isKpiPanel ? panel.find('input.mprog-kpi-show-percent').is(':checked') : panel.find('input.mprog-show-percent').is(':checked'),
        showValue: isKpiPanel ? panel.find('input.mprog-kpi-show-value').is(':checked') : panel.find('input.mprog-show-value').is(':checked'),
        showReference: panel.find('input.mprog-show-reference').is(':checked'),
        showThresholdLabel: panel.find('input.mprog-show-th-label').is(':checked'),
        showLegend: panel.find('input.mprog-list-show-legend').length
            ? panel.find('input.mprog-list-show-legend').is(':checked')
            : panel.find('input.mprog-show-legend').is(':checked'),
        insideBar: panel.find('input.mprog-inside-bar').is(':checked'),
        labelPosition: panel.find('.mprog-label-pos').val() || 'top',
        showTitle: isKpiPanel ? panel.find('input.mprog-kpi-show-title').is(':checked') : !!cfg.display.showTitle,
        title: panel.find('.mprog-title-text').val() || cfg.display.title || '',
        titleField: panel.find('.mprog-title-field').val() || cfg.display.titleField || ''
    };
    cfg.list = {
        labelField: panel.find('.mprog-label-field').val() || cfg.list.labelField || 'nome',
        referenceMode: panel.find('.mprog-list-ref-mode').val() || 'max',
        maxRows: parseInt(panel.find('.mprog-list-maxrows').val(), 10) || 0,
        sortBy: panel.find('.mprog-list-sort').val() || 'value',
        sortDir: panel.find('.mprog-list-sort-dir').val() || 'desc',
        gap: parseInt(panel.find('.mprog-list-gap').val(), 10) || 12,
        showItemValue: panel.find('input.mprog-list-show-value').is(':checked'),
        showItemPercent: panel.find('input.mprog-list-show-percent').is(':checked'),
        uniformColor: false,
        header: {
            show: panel.find('input.mprog-list-show-header').is(':checked'),
            title: panel.find('.mprog-list-title').val() || '',
            titleField: panel.find('.mprog-list-title-field').val() || '',
            subtitle: panel.find('.mprog-list-subtitle-text').val() || '',
            subtitleMode: panel.find('.mprog-list-subtitle-mode').val() || 'sum',
            subtitleLabel: panel.find('.mprog-list-subtitle-label').val() || '',
            subtitleField: panel.find('.mprog-list-subtitle-field').val() || ''
        }
    };
    cfg.thresholds = [];
    panel.find('.mprog-th-row').each(function () {
        var $row = $(this);
        cfg.thresholds.push({
            upTo: _progSafeNumber($row.find('.mprog-th-upto').val(), 100),
            label: $.trim($row.find('.mprog-th-label').val() || ''),
            barColor: _tblReadColorTokenField($row, 'mprog-th-bar') || 'phc:primary',
            trackColor: _tblReadColorTokenField($row, 'mprog-th-track') || '',
            className: $.trim($row.find('.mprog-th-class').val() || '')
        });
    });
    cfg.thresholds = _progMergeThresholds(cfg.thresholds.length ? cfg.thresholds : (obj.config && obj.config.thresholds));
    cfg.design = cfg.design || {};
    cfg.design.variant = panel.find('.mprog-variant-btn.is-on').data('variant') || 'default';
    cfg.design.height = parseInt(panel.find('.mprog-height').val(), 10) || 10;
    cfg.design.defaultBarColor = _tblReadColorTokenField(panel, 'mprog-default-bar') || 'phc:primary';
    cfg.design.trackColor = _tblReadColorTokenField(panel, 'mprog-track-color') || '#e8edf5';
    cfg.design.gradient = panel.find('input.mprog-gradient').is(':checked');
    cfg.design.striped = panel.find('input.mprog-striped').is(':checked');
    cfg.design.animated = panel.find('input.mprog-animated').is(':checked');
    cfg.design.glow = panel.find('input.mprog-glow').is(':checked');
    cfg.design.showMarkers = panel.find('input.mprog-markers').is(':checked');
    cfg.design.kpi = {
        showTrend: panel.find('input.mprog-kpi-trend').length ? panel.find('input.mprog-kpi-trend').is(':checked') : (cfg.design.kpi && cfg.design.kpi.showTrend !== false),
        trendField: panel.find('.mprog-kpi-trend-field').val() || (cfg.design.kpi && cfg.design.kpi.trendField) || 'variacao',
        trendUpColor: _tblReadColorTokenField(panel, 'mprog-kpi-trend-up') || 'phc:success',
        trendDownColor: _tblReadColorTokenField(panel, 'mprog-kpi-trend-down') || 'phc:danger',
        lineHeight: parseInt(panel.find('.mprog-kpi-line-height').val(), 10) || (cfg.design.kpi && cfg.design.kpi.lineHeight) || 4,
        dotSize: parseInt(panel.find('.mprog-kpi-dot-size').val(), 10) || (cfg.design.kpi && cfg.design.kpi.dotSize) || 10,
        showDotLabel: cfg.display.showPercent
    };
    cfg.design.customBar = {
        enabled: panel.find('input.mprog-custom-bar').is(':checked'),
        html: panel.find('.mprog-custom-bar-html').val() || '',
        css: panel.find('.mprog-custom-bar-css').val() || ''
    };
    cfg.design.custom = {
        className: panel.find('.mprog-custom-class').val() || '',
        css: panel.find('.mprog-custom-css').val() || ''
    };
    cfg.transformConfig = obj.transformConfig || null;
    return cfg;
}

function createDynamicSchemaProgress(data) {
    var fieldOptions = [];
    var fieldTitles = [];
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) {
            if (key.indexOf('__') !== 0) {
                fieldOptions.push(key);
                fieldTitles.push(key);
            }
        });
    }
    return {
        type: 'object',
        title: 'Configuração da Barra de Progresso',
        properties: {
            valueField: { type: 'string', title: 'Campo valor', 'enum': fieldOptions, options: { enum_titles: fieldTitles } },
            reference: { type: 'object', title: 'Referência de 100%', additionalProperties: true },
            thresholds: { type: 'array', title: 'Limiares', items: { type: 'object', additionalProperties: true } },
            design: { type: 'object', title: 'Design', additionalProperties: true }
        }
    };
}

function updateTextElement(containerSelector, itemObject, config, data, isConfig) {
    var textId = 'text_element_' + itemObject.mdashcontaineritemobjectstamp;
    // Limpar container
    $(containerSelector).html('');
    //$(textId).remove();
    // PREPARAR CONTEÚDO DOS DADOS - IGUAL AOS OUTROS OBJETOS
    var content = "";
    if (config.dataField && data && data.length > 0) {
        // Usar campo de dados
        if (config.content && config.content.multipleValues) {
            // Múltiplos valores
            var values = data.map(function (item) {
                return formatDataValue(_txtResolveFieldValue(item[config.dataField], config.dataFormat), config.dataFormat);
            });
            content = values.join(_txtGetSeparator(config));
        } else {
            // Primeiro valor apenas
            var rawValue = _txtResolveFieldValue(data[0][config.dataField], config.dataFormat);
            content = formatDataValue(rawValue, config.dataFormat);
        }
    } else if (config.staticText) {
        // Usar texto estático
        content = config.staticText;
        // Aplicar prefix/suffix também em texto estático
        var dfStatic = config.dataFormat || {};
        if (dfStatic.prefix) content = dfStatic.prefix + content;
        if (dfStatic.suffix) content = content + dfStatic.suffix;
    } else {
        content = "Texto personalizado aqui...";
    }
    // Construir estilos CSS
    var styles = "";
    if (config.textFormat) {
        styles += "font-size: " + (config.textFormat.fontSize || 18) + "px;";
        styles += "font-weight: " + (config.textFormat.fontWeight || "bold") + ";";
        styles += "font-style: " + (config.textFormat.fontStyle || "normal") + ";";
        styles += "font-family: " + (config.textFormat.fontFamily || "Nunito, sans-serif") + ";";
        styles += "text-align: " + (config.textFormat.textAlign || "left") + ";";
        styles += "line-height: " + (config.textFormat.lineHeight || 1.5) + ";";
    }
    if (config.colors) {
        styles += "color: " + (config.colors.textColor || "#6d7c91") + ";";
        if (config.colors.backgroundColor !== "transparent") {
            styles += "background-color: " + config.colors.backgroundColor + ";";
        }
    }
    if (config.spacing) {
        styles += "padding: " +
            (config.spacing.paddingTop || 0) + "px " +
            (config.spacing.paddingRight || 0) + "px " +
            (config.spacing.paddingBottom || 0) + "px " +
            (config.spacing.paddingLeft || 0) + "px;";
        styles += "margin: " +
            (config.spacing.marginTop || 0) + "px 0 " +
            (config.spacing.marginBottom || 0) + "px 0;";
    }
    if (config.border) {
        if (config.border.width > 0) {
            styles += "border: " + config.border.width + "px " +
                (config.border.style || "solid") + " " +
                (config.colors.borderColor || "transparent") + ";";
        }
        styles += "border-radius: " + (config.border.radius || 0) + "px;";
    }
    if (config.effects && config.effects.textShadow) {
        styles += "text-shadow: " +
            (config.effects.shadowOffsetX || 1) + "px " +
            (config.effects.shadowOffsetY || 1) + "px " +
            (config.effects.shadowBlur || 2) + "px " +
            (config.effects.shadowColor || "#666666") + ";";
    }
    if (config.dimensions) {
        styles += "width: " + (config.dimensions.width || "100%") + ";";
        if (config.dimensions.height !== "auto") {
            styles += "height: " + config.dimensions.height + ";";
        }
        if (config.dimensions.maxWidth !== "none") {
            styles += "max-width: " + config.dimensions.maxWidth + ";";
        }
    }
    // Criar elemento
    var textElement = "";
    textElement += '<div id="' + textId + '" class="m-dash-text-element" style="' + styles + '">';
    if (config.content && config.content.htmlEnabled) {
        textElement += content; // Permite HTML
    } else {
        textElement += $('<div>').text(content).html(); // Escapa HTML
    }
    textElement += '</div>';
    // Adicionar ao container
    $(containerSelector).append(textElement);
    console.log(containerSelector, 'Elemento de texto renderizado:', textId);
}
// FUNÇÃO AUXILIAR PARA FORMATAÇÃO DE DADOS
function formatDataValue(value, formatConfig) {
    // Salvaguarda — sem config devolve o valor cru
    if (!formatConfig) return value;

    var formattedValue;
    // Tratar valores vazios/null/undefined como string vazia para que
    // prefixo/sufixo possam ainda assim ser aplicados sobre eles.
    if (value === null || value === undefined) {
        formattedValue = '';
    } else {
        formattedValue = value;
    }

    function applyDecimalSeparator(val, cfg) {
        if (!cfg) return val;
        var desiredSep = cfg.decimalSeparator;
        if (desiredSep !== ',' && desiredSep !== '.') return val;

        var str = String(val);
        var maxDec = parseInt(cfg.maximumFractionDigits, 10);
        if (isNaN(maxDec) || maxDec <= 0) return str;

        var lastDot = str.lastIndexOf('.');
        var lastComma = str.lastIndexOf(',');
        var idx = Math.max(lastDot, lastComma);
        if (idx <= 0 || idx >= str.length - 1) return str;

        if (!/\d/.test(str.charAt(idx - 1))) return str;

        var j = idx + 1;
        var decDigits = 0;
        while (j < str.length && /\d/.test(str.charAt(j))) {
            decDigits++;
            j++;
        }

        if (decDigits === 0 || decDigits > maxDec) return str;
        return str.substring(0, idx) + desiredSep + str.substring(idx + 1);
    }

    try {
        switch (formatConfig.type) {
            case "number":
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 0,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2
                    }).format(num);
                    formattedValue = applyDecimalSeparator(formattedValue, formatConfig);
                }
                break;
            case "currency":
                console.log("")
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        style: "currency",
                        currency: formatConfig.currency || "EUR",
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 2,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2,
                        currencyDisplay: 'symbol'
                    }).format(num);
                    formattedValue = applyDecimalSeparator(formattedValue, formatConfig);
                    // Mover símbolo da moeda para a direita
                    if (formatConfig.currencyPosition === 'right') {
                        var parts = formattedValue.match(/^([^\d]*)([\d\s.,]+)([^\d]*)$/);
                        if (parts) {
                            var symbol = parts[1] || parts[3];
                            var number = parts[2];
                            formattedValue = number.trim() + ' ' + symbol.trim();
                        }
                    }
                }
                break;
            case "percentage":
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        style: "percent",
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 0,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2
                    }).format(num / 100);
                    formattedValue = applyDecimalSeparator(formattedValue, formatConfig);
                }
                break;
            case "date":
                var date = new Date(value);
                if (!isNaN(date.getTime())) {
                    formattedValue = new Intl.DateTimeFormat(formatConfig.locale || "pt-PT").format(date);
                }
                break;
            default:
                formattedValue = (value === null || value === undefined) ? '' : value.toString();
        }
    } catch (e) {
        console.warn("Erro na formatação do valor:", e);
        formattedValue = (value === null || value === undefined) ? '' : String(value);
    }
    // Adicionar prefixo e sufixo — SEMPRE, mesmo após erro ou valor vazio
    if (formatConfig.prefix) formattedValue = formatConfig.prefix + formattedValue;
    if (formatConfig.suffix) formattedValue = formattedValue + formatConfig.suffix;
    return formattedValue;
}

function getColorByType(type) {
    // Cria botão temporário dinamicamente
    var tempBtn = $('<button class="btn btn-' + type + '" style="display:none"></button>').appendTo('body');
    // Obtém cores
    var corFundo = tempBtn.css('background-color');
    var corTexto = tempBtn.css('color');
    // Remove o botão temporário
    tempBtn.remove();
    // Retorna objeto com as cores
    return {
        background: corFundo,
        text: corTexto
    };
}

function hexToRgb(hex) {
    // Remove # se existir
    hex = hex.replace(/^#/, '');

    // Se for rgb() já, extrai os valores
    if (hex.indexOf('rgb') !== -1) {
        var match = hex.match(/\d+/g);
        if (match && match.length >= 3) {
            return match[0] + ',' + match[1] + ',' + match[2];
        }
    }

    // Converte hex para rgb
    var r, g, b;
    if (hex.length === 3) {
        r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
        g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
        b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return '0,0,0';
    }

    return r + ',' + g + ',' + b;
}

function updatePie(containerSelector, itemObject, config, data) {
    var chartId = 'pie_chart_' + itemObject.mdashcontaineritemobjectstamp;

    var chartContainer = '<div id="' + chartId + '" style="width: ' +
        (100) + '%; height: ' +
        (config.dimensions.height || 400) + 'px;"></div>';
    $(containerSelector).html(chartContainer);

    setTimeout(function () {
        var chartDom = document.getElementById(chartId);
        if (!chartDom) {
            console.error('Container do gráfico não encontrado:', chartId);
            return;
        }
        // Inicializar ECharts
        var myChart = echarts.init(chartDom);
        // Preparar dados para o gráfico de pizza
        var items = data.map(function (item) {
            return {
                name: item[config.labelField],
                value: parseFloat(item[config.valueField]) || 0
            };
        });
        // Calcular total para texto central
        var total = items.reduce(function (sum, item) {
            return sum + item.value;
        }, 0);
        // Configurar opções do gráfico
        var option = {
            tooltip: {
                trigger: config.tooltip.trigger || 'item',
                padding: [10, 10],
                formatter: function (params) {
                    var percentage = ((params.value / total) * 100).toFixed(1);
                    var result = params.name + '<br/>';
                    result += params.seriesName + ': ' + params.value;
                    if (config.tooltip.showPercentage !== false) {
                        result += ' (' + percentage + '%)';
                    }
                    return result;
                }
            },
            legend: config.legend.show !== false ? {
                top: config.legend.position === 'top' ? '0%' :
                    config.legend.position === 'bottom' ? 'bottom' : 'auto',
                left: config.legend.align || 'center',
                bottom: config.legend.position === 'bottom' ? '0%' : 'auto',
                right: config.legend.position === 'right' ? '0%' : 'auto',
                orient: (config.legend.position === 'left' || config.legend.position === 'right') ? 'vertical' : 'horizontal'
            } : {
                show: false
            },
            color: config.colors || [
                '#f79523', '#d43f3a', '#00897B', '#91c7ae', '#749f83'
            ],
            series: [
                {
                    name: config.labelField || 'Dados',
                    type: 'pie',
                    radius: [config.radius.inner || '40%', config.radius.outer || '70%'],
                    avoidLabelOverlap: false,
                    padAngle: config.itemStyle.padAngle || 5,
                    itemStyle: {
                        borderRadius: config.itemStyle.borderRadius || 10
                    },
                    label: {
                        show: config.label.show || false,
                        position: config.label.position || 'outside',
                        fontSize: config.label.fontSize || 12,
                        formatter: function (params) {
                            if (config.label.showPercentage !== false) {
                                var percentage = ((params.value / total) * 100).toFixed(1);
                                return params.name + '\n' + percentage + '%';
                            }
                            return params.name;
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: (config.label.fontSize || 12) + 4,
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        show: config.label.show || false
                    },
                    data: items
                }
            ]
        };
        // Adicionar texto central se configurado
        if (config.centerText.show) {
            var centerTextValue = '';
            if (config.centerText.showTotal) {
                centerTextValue = total.toString();
            }
            if (config.centerText.text && config.centerText.text.trim() !== '') {
                centerTextValue = config.centerText.showTotal ?
                    config.centerText.text + '\n' + centerTextValue :
                    config.centerText.text;
            }
            option.graphic = {
                type: 'text',
                left: 'center',
                top: 'middle',
                style: {
                    text: centerTextValue,
                    fontSize: config.centerText.fontSize || 30,
                    fontWeight: config.centerText.fontWeight || 'bold',
                    fill: config.centerText.color || '#333',
                    textAlign: 'center'
                }
            };
        }
        // Aplicar configuração e renderizar
        myChart.setOption(option);
        // Responsividade
        window.addEventListener('resize', function () {
            myChart.resize();
        });

    }, 100);
}

function createTableSchema(data) {
    var fieldOptions = [];
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) {
            fieldOptions.push(key);
        });
    }
    return {
        type: "object",
        title: "Configuração da Tabela",
        properties: {
            // Configurações de hierarquia/nested
            dataTree: {
                type: "object",
                title: "Configuração Hierárquica",
                properties: {
                    enabled: {
                        type: "boolean",
                        title: "Ativar Estrutura Hierárquica",
                        'default': false
                    },
                    parentField: {
                        type: "string",
                        title: "Campo ID do Registo",
                        'enum': fieldOptions,
                        'default': "id"
                    },
                    childField: {
                        type: "string",
                        title: "Campo de Ligação (LinkStamp)",
                        'enum': fieldOptions,
                        'default': "linkstamp"
                    },
                    startExpanded: {
                        type: "boolean",
                        title: "Expandir Tudo Inicialmente",
                        'default': true
                    }
                }
            },
            // Configurações de Exportação
            exportOptions: {
                type: "object",
                title: "Opções de Exportação",
                properties: {
                    enableExcel: {
                        type: "boolean",
                        title: "Ativar Exportação Excel",
                        'default': true
                    },
                    enablePDF: {
                        type: "boolean",
                        title: "Ativar Exportação PDF",
                        'default': true
                    },
                    excelFileName: {
                        type: "string",
                        title: "Nome do Arquivo Excel",
                        'default': "dados.xlsx"
                    },
                    pdfFileName: {
                        type: "string",
                        title: "Nome do Arquivo PDF",
                        'default': "dados.pdf"
                    },
                    buttonStyle: {
                        type: "object",
                        title: "Estilo dos Botões",
                        properties: {
                            excelColor: {
                                type: "string",
                                title: "Cor do Botão Excel",
                                'enum': ["success", "primary", "info", "warning", "danger"],
                                'default': "success"
                            },
                            pdfColor: {
                                type: "string",
                                title: "Cor do Botão PDF",
                                'enum': ["danger", "primary", "info", "warning", "success"],
                                'default': "danger"
                            }
                        }
                    }
                }
            },
            // NOVA SEÇÃO: Configurações de Cores
            styling: {
                type: "object",
                title: "Configuração de Cores",
                properties: {
                    headerBackgroundColor: {
                        type: "string",
                        title: "Cor de Fundo do Cabeçalho",
                        format: "color",
                        'default': getCachedColor("primary").background
                    },
                    headerTextColor: {
                        type: "string",
                        title: "Cor do Texto do Cabeçalho",
                        format: "color",
                        'default': "#ffffff"
                    }
                }
            },
            // Configurações gerais
            layout: {
                type: "string",
                title: "Layout da Tabela",
                'enum': ["fitData", "fitColumns", "fitDataFill", "fitDataStretch"],
                options: {
                    enum_titles: ["Ajustar aos Dados", "Ajustar Colunas", "Preencher", "Esticar"]
                },
                'default': "fitData"
            },
            height: {
                type: "string",
                title: "Altura da Tabela",
                'default': "400px"
            },
            pagination: {
                type: "object",
                title: "Paginação",
                properties: {
                    enabled: {
                        type: "boolean",
                        title: "Ativar Paginação",
                        'default': false,
                        description: "Recomendado desativar com estrutura hierárquica"
                    },
                    size: {
                        type: "integer",
                        title: "Itens por Página",
                        'default': 10,
                        'enum': [5, 10, 25, 50, 100]
                    }
                }
            },
            // Configurações das colunas - COMPLETAS
            columns: {
                type: "array",
                title: "Configuração das Colunas",
                items: {
                    type: "object",
                    title: "Coluna",
                    properties: {
                        field: {
                            type: "string",
                            title: "Campo",
                            'enum': fieldOptions
                        },
                        title: {
                            type: "string",
                            title: "Título da Coluna"
                        },
                        visible: {
                            type: "boolean",
                            title: "Visível",
                            'default': true
                        },
                        width: {
                            type: "integer",
                            title: "Largura (px)",
                            minimum: 50
                        },
                        minWidth: {
                            type: "integer",
                            title: "Largura Mínima (px)",
                            'default': 40
                        },
                        resizable: {
                            type: "boolean",
                            title: "Redimensionável",
                            'default': true
                        },
                        frozen: {
                            type: "boolean",
                            title: "Congelar Coluna",
                            'default': false
                        },
                        hozAlign: {
                            type: "string",
                            title: "Alinhamento Horizontal",
                            'enum': ["left", "center", "right"],
                            'default': "left"
                        },
                        vertAlign: {
                            type: "string",
                            title: "Alinhamento Vertical",
                            'enum': ["top", "middle", "bottom"],
                            'default': "middle"
                        },
                        sorter: {
                            type: "string",
                            title: "Tipo de Ordenação",
                            'enum': ["string", "number", "alphanum", "boolean", "exists", "date", "time", "datetime"],
                            'default': "string"
                        },
                        formatter: {
                            type: "string",
                            title: "Formatador",
                            'enum': ["plaintext", "textarea", "number", "html", "money", "link", "linkButton", "datetime", "datetimediff", "tickCross", "color", "star", "traffic", "progress", "lookup", "buttonTick", "buttonCross", "rownum", "handle"],
                            'default': "plaintext"
                        },
                        formatterParams: {
                            type: "object",
                            title: "Parâmetros do Formatador",
                            properties: {
                                thousand: {
                                    type: "string",
                                    title: "Separador de milhares",
                                    'default': ","
                                },
                                decimal: {
                                    type: "string",
                                    title: "Separador decimal",
                                    'default': "."
                                },
                                precision: {
                                    type: "integer",
                                    title: "Casas decimais",
                                    'default': 2
                                },
                                symbol: {
                                    type: "string",
                                    title: "Símbolo da moeda",
                                    'default': "€"
                                }
                            }
                        },
                        headerFilter: {
                            type: "boolean",
                            title: "Filtro no Cabeçalho",
                            'default': false
                        }
                    },
                    required: ["field", "title"]
                },
                'default': fieldOptions.filter(function (field) {
                    return field !== 'linkstamp'; // Ocultar linkstamp por padrão
                }).map(function (field) {
                    return {
                        field: field,
                        title: field.charAt(0).toUpperCase() + field.slice(1),
                        visible: field !== 'id', // Ocultar ID por padrão mas manter disponível
                        resizable: true,
                        frozen: false,
                        hozAlign: "left",
                        vertAlign: "middle",
                        sorter: field === "totalsalario" || field === "totalemprestimo" || field === "funcionarios" ? "number" : "string",
                        formatter: field === "totalsalario" || field === "totalemprestimo" ? "money" : "plaintext",
                        headerFilter: false,
                        formatterParams: field === "totalsalario" || field === "totalemprestimo" ? {
                            thousand: ",",
                            decimal: ".",
                            precision: 2,
                            symbol: "€"
                        } : {}
                    };
                })
            }
        }
    };
}
// Função RECURSIVA para converter dados planos em estrutura hierárquica

function buildDataTree(data, parentField, childField) {
    var lookup = {};
    var rootNodes = [];
    console.log('Iniciando buildDataTree com', data.length, 'registos');
    // Primeira passagem: criar lookup de todos os registos
    data.forEach(function (item) {
        var itemCopy = Object.assign({}, item);
        lookup[itemCopy[parentField]] = itemCopy;
    });
    console.log('Lookup criado:', Object.keys(lookup));
    // Função recursiva interna para adicionar filhos
    function addChildren(parentId) {
        var children = [];
        data.forEach(function (item) {
            if (item[childField] === parentId) {
                var child = lookup[item[parentField]];
                if (child) {
                    var grandChildren = addChildren(item[parentField]);
                    if (grandChildren.length > 0) {
                        child._children = grandChildren;
                    }
                    children.push(child);
                }
            }
        });
        return children;
    }
    // Segunda passagem: construir árvore começando pelos nós raiz
    data.forEach(function (item) {
        if (item[childField] === null || item[childField] === undefined) {
            var rootNode = lookup[item[parentField]];
            if (rootNode) {
                var children = addChildren(item[parentField]);
                if (children.length > 0) {
                    rootNode._children = children;
                }
                rootNodes.push(rootNode);
            }
        }
    });
    console.log('Árvore construída com', rootNodes.length, 'nós raiz');
    return rootNodes;
}

// Função para atualizar a tabela Tabulator - COM APLICAÇÃO DE CORES
function updateTable(containerSelector, itemObject, config, data) {
    var tabelaId = 'tabulator-table-' + itemObject.mdashcontaineritemobjectstamp;
    var exportButtonsId = 'export-buttons-' + itemObject.mdashcontaineritemobjectstamp;
    var tabulatorInstance; // Guardar referência da instância

    try {
        // Destruir tabela existente se houver
        var existingTable = document.getElementById(tabelaId);
        if (existingTable) {
            existingTable.innerHTML = '';
        }
        // Remover botões de exportação anteriores se existirem
        var existingButtons = document.getElementById(exportButtonsId);
        if (existingButtons) {
            existingButtons.remove();
        }
        // APLICAR CORES DO CABEÇALHO DINAMICAMENTE
        if (config.styling) {
            var styleElement = document.getElementById('dynamic-table-styles-' + itemObject.mdashcontaineritemobjectstamp);
            if (styleElement) {
                styleElement.remove();
            }
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-table-styles-' + itemObject.mdashcontaineritemobjectstamp;
            // ...existing code...
            styleElement.innerHTML = "";
            styleElement.innerHTML += ".tabulator .tabulator-header {";
            styleElement.innerHTML += "    background-color: " + (config.styling.headerBackgroundColor || '#0765b7') + " !important;";
            styleElement.innerHTML += "}";
            styleElement.innerHTML += ".tabulator .tabulator-header .tabulator-col {";
            styleElement.innerHTML += "    background-color: " + (config.styling.headerBackgroundColor || '#0765b7') + " !important;";
            styleElement.innerHTML += "    color: " + (config.styling.headerTextColor || '#ffffff') + " !important;";
            styleElement.innerHTML += "}";
            // ...existing code...
            document.head.appendChild(styleElement);
        }
        // Configurar colunas visíveis
        var columns = config.columns.filter(function (col) {
            return col.visible;
        }).map(function (col) {
            var column = {
                title: col.title,
                field: col.field,
                hozAlign: col.hozAlign,
                vertAlign: col.vertAlign,
                resizable: col.resizable,
                frozen: col.frozen,
                sorter: col.sorter,
                formatter: col.formatter
            };
            if (col.width) column.width = col.width;
            if (col.minWidth) column.minWidth = col.minWidth;
            if (col.headerFilter) {
                column.headerFilter = "input";
            }
            // Configurar formatador com parâmetros
            if (col.formatter === "money" && col.formatterParams) {
                column.formatterParams = col.formatterParams;
                column.formatterParams.symbolAfter = true;
            }
            return column;
        });
        // Preparar dados - se hierárquico, converter para árvore
        var tableData = data;
        if (config.dataTree && config.dataTree.enabled) {
            tableData = buildDataTree(data, config.dataTree.parentField, config.dataTree.childField);
        }
        // Configuração do Tabulator - NATIVA
        var tabulatorConfig = {
            data: tableData,
            columns: columns,
            layout: config.layout || "fitData",
            height: config.height || "400px"
        };
        if (config.pagination && config.pagination.enabled && (!config.dataTree || !config.dataTree.enabled)) {
            tabulatorConfig.pagination = "local";
            tabulatorConfig.paginationSize = config.pagination.size || 10;
            tabulatorConfig.paginationSizeSelector = [5, 10, 25, 50, 100];
        }
        // Configurar estrutura hierárquica NATIVA do Tabulator
        if (config.dataTree && config.dataTree.enabled) {
            tabulatorConfig.dataTree = true;
            tabulatorConfig.dataTreeChildField = "_children";
            tabulatorConfig.dataTreeStartExpanded = config.dataTree.startExpanded !== false;
            // Usar primeira coluna visível para o expansor
            if (columns.length > 0) {
                tabulatorConfig.dataTreeElementColumn = columns[0].field;
            }
        }
        // ... resto da função igual (container, eventos, etc.)
        // Criar container da tabela com botões de exportação
        var tableContainer = $(containerSelector);

        // Criar botões de exportação se habilitados
        if (config.exportOptions && (config.exportOptions.enableExcel || config.exportOptions.enablePDF)) {
            var exportButtonsHTML = '<div id="' + exportButtonsId + '" style="margin-bottom: 10px; display: flex; gap: 10px; justify-content: flex-end;">';

            if (config.exportOptions.enableExcel !== false) {
                var excelColor = config.exportOptions.buttonStyle && config.exportOptions.buttonStyle.excelColor || 'success';
                exportButtonsHTML += '<button type="button" id="export-excel-' + itemObject.mdashcontaineritemobjectstamp + '" ';
                exportButtonsHTML += 'class="btn btn-' + excelColor + '" ';
                exportButtonsHTML += 'style="padding: 8px 16px; border-radius: 4px; font-weight: 500; transition: all 0.3s;">';
                exportButtonsHTML += '<i class="fa fa-file-excel-o" style="margin-right: 5px;"></i> Exportar Excel';
                exportButtonsHTML += '</button>';
            }

            if (config.exportOptions.enablePDF !== false) {
                var pdfColor = config.exportOptions.buttonStyle && config.exportOptions.buttonStyle.pdfColor || 'danger';
                exportButtonsHTML += '<button type="button" id="export-pdf-' + itemObject.mdashcontaineritemobjectstamp + '" ';
                exportButtonsHTML += 'class="btn btn-' + pdfColor + '" ';
                exportButtonsHTML += 'style="padding: 8px 16px; border-radius: 4px; font-weight: 500; transition: all 0.3s;">';
                exportButtonsHTML += '<i class="fa fa-file-pdf-o" style="margin-right: 5px;"></i> Exportar PDF';
                exportButtonsHTML += '</button>';
            }

            exportButtonsHTML += '</div>';
            tableContainer.append(exportButtonsHTML);
        }

        tableContainer.append('<div id="' + tabelaId + '"></div>');
        tabulatorConfig.langs = {
            "pt-br": {
                "columns": {
                    "name": "Nome", //substitui o título da coluna name pelo valor "Nome"
                },
                "data": {
                    "loading": "Carregando", //texto do carregador de dados
                    "error": "Erro", //texto de erro de dados
                },
                "groups": { //texto para a contagem automática de itens no cabeçalho do grupo
                    "item": "item", //singular para item
                    "items": "itens", //plural para itens
                },
                "pagination": {
                    "page_size": "Tamanho da Página", //rótulo para o elemento select de tamanho da página
                    "page_title": "Mostrar Página", //texto de tooltip para o botão de página numérica, aparece antes do número da página (ex: "Mostrar Página" resultará em tooltip "Mostrar Página 1" no botão da página 1)
                    "first": "Primeira", //texto para o botão da primeira página
                    "first_title": "Primeira Página", //texto de tooltip para o botão da primeira página
                    "last": "Última",
                    "last_title": "Última Página",
                    "prev": "Anterior",
                    "prev_title": "Página Anterior",
                    "next": "Próxima",
                    "next_title": "Próxima Página",
                    "all": "Todos",
                    "counter": {
                        "showing": "Mostrando",
                        "of": "de",
                        "rows": "linhas",
                        "pages": "páginas",
                    }
                },
                "headerFilters": {
                    "default": "filtrar coluna...", //texto padrão do placeholder do filtro de cabeçalho
                    "columns": {
                        "name": "filtrar nome...", //substitui o texto padrão do filtro de cabeçalho para a coluna name
                    }
                }
            }
        },
            tabulatorConfig.locale = "pt-br";
        // Inicializar Tabulator
        tabulatorInstance = new Tabulator('#' + tabelaId, tabulatorConfig);

        // Adicionar eventos aos botões de exportação
        if (config.exportOptions) {
            if (config.exportOptions.enableExcel !== false) {
                $('#export-excel-' + itemObject.mdashcontaineritemobjectstamp).on('click', function () {
                    var fileName = config.exportOptions.excelFileName || 'dados.xlsx';
                    tabulatorInstance.download("xlsx", fileName, { sheetName: "Dados" });
                });
            }

            if (config.exportOptions.enablePDF !== false) {
                $('#export-pdf-' + itemObject.mdashcontaineritemobjectstamp).on('click', function () {
                    var fileName = config.exportOptions.pdfFileName || 'dados.pdf';
                    tabulatorInstance.download("pdf", fileName, {
                        orientation: "landscape",
                        title: "Relatório de Dados",
                        autoTable: {
                            styles: {
                                fillColor: [100, 100, 100]
                            },
                            margin: { top: 30 }
                        }
                    });
                });
            }
        }
    } catch (e) {
        console.error('Erro ao atualizar tabela:', e);
    }
}
// Função auxiliar para expandir filhos recursivamente
function expandChildrenRecursive(row) {
    var children = row.getTreeChildren();
    children.forEach(function (child) {
        if (child.getTreeChildren && child.getTreeChildren().length > 0) {
            child.treeExpand();
            expandChildrenRecursive(child);
        }
    });
}




/**
 * getDefaultLayoutDefinitions()
 * Retorna as definições de layouts padrão no formato MdashContainerItemLayout.
 * Cada layout tem: htmltemplate (com data-mdash-slot), csstemplate, slotsdefinition, containerSelectorToRender.
 * As funções generate* originais permanecem para retrocompatibilidade geral,
 * mas o pipeline de renderização agora é unificado via renderUnifiedLayout().
 */
function getDefaultLayoutDefinitions() {

    // ── HTML Templates partilhados ──────────────────────────────────────────

    var _tplDashCardInfo =
        '<div id="mdash{{id}}" class="c-dashboardInfo {{classes}}" style="{{styles}}">' +
        '<div class="wrap c-dashboardInfo_{{tipo}}">' +
        '<h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">' +
        '<span data-mdash-slot="title"></span> <i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '</h4>' +
        '<div data-mdash-slot="header" class="{{headerClasses}}"></div>' +
        '<div data-mdash-slot="body" class="m-dash-card-body-content dashcard-body"></div>' +
        '<div data-mdash-slot="footer" class="dashcard-footer"></div>' +
        '</div></div>';

    var _tplDashCardSnapshot =
        '<div id="{{id}}" class="m-dash-item snapshot {{classes}}" style="{{styles}}">' +
        '<div class="stats-card-value-container">' +
        '<span data-mdash-slot="title" class="stats-card-label"></span>' +
        '<div data-mdash-slot="body" class="stats-card-body"></div>' +
        '</div></div>';

    var _tplMDashCardSnapV2 =
        '<div id="{{id}}" class="m-dash-card-snap-v2 {{classes}}" style="{{styles}}">' +
        '<div class="m-dash-card-snap-v2-content">' +
        '<div class="m-dash-card-snap-v2-icon bg-{{tipo}}">' +
        '<i data-mdash-slot="icon" class="material-symbols-rounded">analytics</i>' +
        '</div>' +
        '<div style="display:flex!important;flex-direction:column!important" class="m-dash-card-snap-v2-info">' +
        '<div><h4 data-mdash-slot="title" class="m-dash-card-snap-v2-title"></h4></div>' +
        '<div data-mdash-slot="body" class="m-dash-card-snap-v2-value"></div>' +
        '</div></div>' +
        '<div data-mdash-slot="footer" class="m-dash-card-snap-v2-footer"></div>' +
        '</div>';

    var _tplDashCardStandard =
        '<div id="{{id}}" class="m-dash-item {{classes}}" style="height:100%!important;{{styles}}">' +
        '<h1 data-mdash-slot="title" classa="m-dash-item-title"></h1>' +
        '<div data-mdash-slot="body" class="m-dash-standard-card-body"></div>' +
        '</div>';

    var _tplDashCardHTML =
        '<div id="{{id}}" style="height:100%!important;" class="dashcard">' +
        '<div class="dashcard-header dashcard-header-{{tipo}}">' +
        '<span data-mdash-slot="title" class="dashcard-title"></span>' +
        '</div>' +
        '<div data-mdash-slot="body" class="dashcard-body table-responsive"></div>' +
        '</div>';

    var _tplPlainCard =
        '<div id="mdash{{id}}" class="m-dash-plain-card {{classes}}" style="height:100%!important;{{styles}}">' +
        '<div class="wrap m-dash-plain-card_{{tipo}}">' +
        '<h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">' +
        '<i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '</h4>' +
        '<div data-mdash-slot="header" class="{{headerClasses}}"></div>' +
        '<div data-mdash-slot="body" class="m-dash-plain-card-body-content"></div>' +
        '<div data-mdash-slot="footer" class="m-dash-plain-card-footer"></div>' +
        '</div></div>';

    var _tplBrdMetric =
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-metrica brd-card-advanced-metrica-{{tipo}} {{classes}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-icon brd-card-advanced-icon-{{tipo}}">' +
        '<i data-mdash-slot="icon" class="material-symbols-rounded">analytics</i>' +
        '</div>' +
        '<div class="brd-card-advanced-content">' +
        '<div data-mdash-slot="title" class="brd-card-advanced-label"></div>' +
        '<div data-mdash-slot="body"></div>' +
        '</div>' +
        '</div>';

    var _tplBrdStatus =
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-status {{classes}} brd-card-advanced-status-{{tipo}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-status-header">' +
        '<i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '<span data-mdash-slot="status-badge" class="brd-card-advanced-status-badge"></span>' +
        '</div>' +
        '<div data-mdash-slot="title" class="brd-card-advanced-status-title"></div>' +
        '<div data-mdash-slot="body" class="brd-card-advanced-status-body"></div>' +
        '</div>';

    var _tplBrdAlert =
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-alert {{classes}} brd-card-advanced-alert-{{tipo}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-alert-icon">' +
        '<i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '</div>' +
        '<div class="brd-card-advanced-alert-content">' +
        '<div data-mdash-slot="title" class="brd-card-advanced-alert-title"></div>' +
        '<div data-mdash-slot="body"></div>' +
        '</div>' +
        '</div>';

    // ── Definições de slots partilhadas ─────────────────────────────────────

    var _slotsDashCardInfo = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "header", label: "Cabeçalho", type: "content" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true },
        { id: "footer", label: "Rodapé", type: "content" }
    ]);

    var _slotsDashCardSnapshot = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true }
    ]);

    var _slotsMDashCardSnapV2 = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "body", label: "Valor", type: "content", isMainContent: true },
        { id: "footer", label: "Rodapé", type: "content" }
    ]);

    var _slotsDashCardStandard = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true }
    ]);

    var _slotsDashCardHTML = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true }
    ]);

    var _slotsPlainCard = JSON.stringify([
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "header", label: "Cabeçalho", type: "content" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true },
        { id: "footer", label: "Rodapé", type: "content" }
    ]);

    var _slotsBrdMetric = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "body", label: "Conteúdo", type: "content", isMainContent: true }
    ]);

    var _slotsBrdStatus = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "status-badge", label: "Badge de Estado", type: "text" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true }
    ]);

    var _slotsBrdAlert = JSON.stringify([
        { id: "title", label: "Título", type: "text" },
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "body", label: "Conteúdo", type: "content", isMainContent: true }
    ]);

    // ── Definições dos layouts ──────────────────────────────────────────────

    return [
        // ───── Snapshots ─────
        { descricao: "Snapshot Layout v1", codigo: "snapshot_layout_v1", tipo: "snapshot", UIData: { tipo: "primary" }, htmltemplate: _tplDashCardInfo, csstemplate: "", slotsdefinition: _slotsDashCardInfo, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snapshot Layout v1 Warning", codigo: "snapshot_layout_v1_warning", tipo: "snapshot", UIData: { tipo: "warning" }, htmltemplate: _tplDashCardInfo, csstemplate: "", slotsdefinition: _slotsDashCardInfo, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snapshot layout v2", codigo: "snapshot_layout_v2", tipo: "snapshot", UIData: { tipo: "primary" }, htmltemplate: _tplDashCardSnapshot, csstemplate: "", slotsdefinition: _slotsDashCardSnapshot, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snap card Warning", codigo: "snapshot_card_warning", tipo: "snapshot", UIData: { tipo: "warning" }, htmltemplate: _tplMDashCardSnapV2, csstemplate: "", slotsdefinition: _slotsMDashCardSnapV2, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snap Card", codigo: "snap_card", tipo: "snapshot", UIData: { tipo: "primary" }, htmltemplate: _tplMDashCardSnapV2, csstemplate: "", slotsdefinition: _slotsMDashCardSnapV2, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snap Card Success", codigo: "snap_card_success", tipo: "snapshot", UIData: { tipo: "success" }, htmltemplate: _tplMDashCardSnapV2, csstemplate: "", slotsdefinition: _slotsMDashCardSnapV2, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Snap card Danger", codigo: "snapshot_card_danger", tipo: "snapshot", UIData: { tipo: "danger" }, htmltemplate: _tplMDashCardSnapV2, csstemplate: "", slotsdefinition: _slotsMDashCardSnapV2, containerSelectorToRender: '[data-mdash-slot="body"]' },
        // ───── Cards ─────
        { descricao: "Card standard", codigo: "card_standard", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplDashCardStandard, csstemplate: "", slotsdefinition: _slotsDashCardStandard, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Card header destacado", codigo: "card_header_highlighted", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplDashCardHTML, csstemplate: "", slotsdefinition: _slotsDashCardHTML, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Plain Card", codigo: "plain_card", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplPlainCard, csstemplate: "", slotsdefinition: _slotsPlainCard, containerSelectorToRender: '[data-mdash-slot="body"]' },
        // ───── BRD Metric ─────
        { descricao: "Top Border Card Advanced - Metric Primary", codigo: "brd_card_advanced_metric_primary", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Metric Success", codigo: "brd_card_advanced_metric_success", tipo: "card", UIData: { tipo: "success" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Metric Warning", codigo: "brd_card_advanced_metric_warning", tipo: "card", UIData: { tipo: "warning" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Metric Danger", codigo: "brd_card_advanced_metric_danger", tipo: "card", UIData: { tipo: "danger" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Metric Yellow", codigo: "brd_card_advanced_metric_yellow", tipo: "card", UIData: { tipo: "yellow" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Metric Black", codigo: "brd_card_advanced_metric_black", tipo: "card", UIData: { tipo: "black" }, htmltemplate: _tplBrdMetric, csstemplate: "", slotsdefinition: _slotsBrdMetric, containerSelectorToRender: '[data-mdash-slot="body"]' },
        // ───── BRD Status ─────
        { descricao: "Top Border Card Advanced - Status Primary", codigo: "brd_card_advanced_status_primary", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Success", codigo: "brd_card_advanced_status_success", tipo: "card", UIData: { tipo: "success" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Warning", codigo: "brd_card_advanced_status_warning", tipo: "card", UIData: { tipo: "warning" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Danger", codigo: "brd_card_advanced_status_danger", tipo: "card", UIData: { tipo: "danger" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Yellow", codigo: "brd_card_advanced_status_yellow", tipo: "card", UIData: { tipo: "yellow" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Black", codigo: "brd_card_advanced_status_black", tipo: "card", UIData: { tipo: "black" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        // ───── BRD Alert ─────
        { descricao: "Top Border Card Advanced - Alert Primary", codigo: "brd_card_advanced_alert_primary", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Success", codigo: "brd_card_advanced_alert_success", tipo: "card", UIData: { tipo: "success" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Warning", codigo: "brd_card_advanced_alert_warning", tipo: "card", UIData: { tipo: "warning" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Danger", codigo: "brd_card_advanced_alert_danger", tipo: "card", UIData: { tipo: "danger" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Yellow", codigo: "brd_card_advanced_alert_yellow", tipo: "card", UIData: { tipo: "yellow" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Black", codigo: "brd_card_advanced_alert_black", tipo: "card", UIData: { tipo: "black" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' }
    ].map(function (def) {
        if (def.rowsizing) return def;
        var code = String(def.codigo || '').toLowerCase();
        if (code === 'plain_card' || code === 'card_header_highlighted' || code === 'card_standard') {
            def.rowsizing = 'stretch';
        } else if (/^brd_card_advanced_alert_/i.test(code)) {
            def.rowsizing = 'stretch';
        } else {
            def.rowsizing = 'compact';
        }
        return def;
    });
}

// ── Legacy generate* removidas — renderização agora via renderUnifiedLayout() ──

function MDashCard(data) {
    var baseCardStyles = [
        'border-radius:16px',
        'border:1px solid #f1f5f9',
        'box-shadow:0 1px 2px rgba(0, 0, 0, 0.05)'
    ].join(';') + ';';

    this.title = data.title || "";
    this.id = data.id || ""
    this.tipo = data.tipo || "primary";
    this.bodyContent = data.bodyContent || "";
    this.icon = data.icon || "";
    this.customData = data.customData || {};
    this.classes = data.classes || "";
    this.styles = baseCardStyles + (data.styles || "");
    this.footer = data.footer || "";
    this.header = data.header || "";
    this.headerClasses = data.headerClasses || "";
    this.extraData = data.extraData || {};
}

function addBtnStyles(styles) {
    var cssContent = '';
    cssContent += '.heartbeat-effect {';
    cssContent += '  display: inline-block;';
    cssContent += '  transform-origin: center;';
    cssContent += '}';
    cssContent += '@keyframes heartbeat {';
    cssContent += '  0% { transform: scale(1); }';
    cssContent += '  10% { transform: scale(1.25); }';
    cssContent += '  20% { transform: scale(1); }';
    cssContent += '  30% { transform: scale(1.25); }';
    cssContent += '  40% { transform: scale(1); }';
    cssContent += '  100% { transform: scale(1); }';
    cssContent += '}';
    cssContent += '.heartbeat-effect.is-beating {';
    cssContent += '  animation: heartbeat 1.5s ease-in-out infinite;';
    cssContent += '}';
    cssContent += '@media (prefers-reduced-motion: reduce) {';
    cssContent += '  .heartbeat-effect.is-beating { animation: none !important; }';
    cssContent += '}';
    styles.push(cssContent);
}
function addDashboardStyles(styles) {
    console.log("Adicionando estilos de dashboard personalizados");
    var dashboardCSS = "";
    dashboardCSS += ".c-dashboardInfo {";
    dashboardCSS += "    margin-bottom: 15px;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo .wrap {";
    dashboardCSS += "    background: #ffffff;";
    dashboardCSS += "    box-shadow: 2px 10px 20px rgba(0, 0, 0, 0.1);";
    dashboardCSS += "    border-radius: 7px;";
    dashboardCSS += "    text-align: center;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    overflow: hidden;";
    dashboardCSS += "    padding: 28px 20px 16px;";
    dashboardCSS += "    height: auto;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo__title,";
    dashboardCSS += ".c-dashboardInfo__subInfo {";
    dashboardCSS += "    color: #6c6c6c;";
    dashboardCSS += "    font-size: 1.18em;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo span {";
    dashboardCSS += "    display: block;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo__count {";
    dashboardCSS += "    font-weight: 600;";
    dashboardCSS += "    font-size: 2.5em;";
    dashboardCSS += "    line-height: 64px;";
    dashboardCSS += "    color: #323c43;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo .wrap:after {";
    dashboardCSS += "    display: block;";
    dashboardCSS += "    position: absolute;";
    dashboardCSS += "    top: 0;";
    dashboardCSS += "    left: 0;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    height: 7px;";
    dashboardCSS += "    content: '';";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_primary:after {";
    //dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00a173 100%);";
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getCachedColor("primary").background + " 0%, " + getCachedColor("primary").background + " 100%);";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_warning:after {";
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getCachedColor("warning").background + " 0%, " + getCachedColor("warning").background + " 100%);";
    // dashboardCSS += "    background: linear-gradient(82.59deg, #f79523 0%, #d88627 100%);";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo__title svg {";
    dashboardCSS += "    color: #d7d7d7;";
    dashboardCSS += "    margin-left: 5px;";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo__title {";
    dashboardCSS += "    font-weight: 700;";
    dashboardCSS += "    font-size: 20px;";
    dashboardCSS += "}";
    dashboardCSS += "@media (max-width: 768px) {";
    dashboardCSS += "    .c-dashboardInfo {";
    dashboardCSS += "        flex: 1 1 100%;";
    dashboardCSS += "        max-width: 100%;";
    dashboardCSS += "    }";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard {";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    min-width: 0;";
    dashboardCSS += "    word-wrap: break-word;";
    dashboardCSS += "    background-color: #fff;";
    dashboardCSS += "    background-clip: border-box;";
    dashboardCSS += "    border: 1px solid #eee;";
    dashboardCSS += "    border-radius: .25rem;";
    dashboardCSS += "    border: 0;";
    dashboardCSS += "    margin-bottom: 30px;";
    dashboardCSS += "    margin-top: 30px;";
    dashboardCSS += "    border-radius: 6px;";
    dashboardCSS += "    color: #333;";
    dashboardCSS += "    background: #fff;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);";
    dashboardCSS += "    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .14);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-body {";
    dashboardCSS += "    flex: 1 1 auto;";
    dashboardCSS += "    padding: 1.25rem;";
    dashboardCSS += "    padding: .9375rem 1.875rem;";
    dashboardCSS += "    padding: .9375rem 20px;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-title {";
    dashboardCSS += "    margin-bottom: .75rem;";
    dashboardCSS += "    color: #3c4858;";
    dashboardCSS += "    text-decoration: none;";
    dashboardCSS += "    margin-top: .625rem;";
    dashboardCSS += "    margin-top: 0;";
    dashboardCSS += "    margin-bottom: 3px;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-header {";
    dashboardCSS += "    padding: .75rem 1.25rem;";
    dashboardCSS += "    margin-bottom: 0;";
    dashboardCSS += "    background-color: #fff;";
    dashboardCSS += "    border-bottom: 1px solid #eee;";
    dashboardCSS += "    border-bottom: none;";
    dashboardCSS += "    background: transparent;";
    dashboardCSS += "    z-index: 3 !important;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-header:first-child {";
    dashboardCSS += "    border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header .dashcard-title {";
    dashboardCSS += "    margin-bottom: 3px;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard [class*=dashcard-header-] {";
    dashboardCSS += "    margin: 0 15px;";
    dashboardCSS += "    padding: 0;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard [class*=dashcard-header-]:not(.dashcard-header-icon):not(.dashcard-header-text):not(.dashcard-header-image) {";
    dashboardCSS += "    border-radius: 3px;";
    dashboardCSS += "    margin-top: -20px;";
    dashboardCSS += "    padding: 15px;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-danger:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(60deg, #d43f3a, #d43f3a);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(244, 67, 54, .4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-warning:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    //dashboardCSS += "    background: linear-gradient(60deg, #f79523, #f79523);";
    dashboardCSS += "    background: linear-gradient(60deg, " + getCachedColor("warning").background + ", " + getCachedColor("warning").background + ");";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(187, 113, 16, 0.4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-success:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    // dashboardCSS += "    background: linear-gradient(60deg, #3ba94e, #3ba94e);";
    // dashboardCSS += "    background: linear-gradient(82.59deg, " + getCachedColor("primary").background + " 0%, " + getCachedColor("primary").background + " 100%);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(55, 119, 26, 0.4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-primary:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getCachedColor("primary").background + " 0%, " + getCachedColor("primary").background + " 100%);";
    // dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00897B 100%);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(39, 30, 126, 0.4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard [class*=dashcard-header-],";
    dashboardCSS += ".dashcard [class*=dashcard-header-] .dashcard-title {";
    dashboardCSS += "    color: #fff;";
    dashboardCSS += "}";
    dashboardCSS += ".box a {";
    dashboardCSS += "    color: #033076;";
    dashboardCSS += "    text-decoration: none;";
    dashboardCSS += "}";
    dashboardCSS += ".box a:hover {";
    dashboardCSS += "    color: white;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-fact-container {";
    dashboardCSS += "    border-radius: 17px;";
    dashboardCSS += "    box-shadow: 0 0 2px 2px #dbdbdb;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-fact-header {";
    dashboardCSS += "    background: linear-gradient(to right, " + getCachedColor("primary").background + ", " + getCachedColor("primary").background + ");";
    dashboardCSS += "    color: white;";
    dashboardCSS += "    padding: 10px;";
    dashboardCSS += "    border-top-left-radius: 17px;";
    dashboardCSS += "    border-top-right-radius: 17px;";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard-fact-content {";
    dashboardCSS += "    padding: 20px;";
    dashboardCSS += "}";
    dashboardCSS += ".chart-container {";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    height: 100vh;";
    dashboardCSS += "    overflow: hidden;";
    dashboardCSS += "}";
    // Novos estilos adicionados
    dashboardCSS += ".stats-card-container {";
    dashboardCSS += "    display: grid;";
    dashboardCSS += "    grid-template-columns: 1fr;";
    dashboardCSS += "    gap: 10px;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card {";
    dashboardCSS += "    background-color: #efefef;";
    dashboardCSS += "    padding: 15px;";
    dashboardCSS += "    border-radius: 5px;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card-grid {";
    dashboardCSS += "    display: grid;";
    dashboardCSS += "    grid-template-columns: 1fr;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card-chart {";
    dashboardCSS += "    height: 300px;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card-value-container {";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    gap: 2px;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card-value {";
    dashboardCSS += "    color: #999999;";
    dashboardCSS += "}";
    dashboardCSS += ".stats-card-label {";
    dashboardCSS += "    font-size: 0.9em;";
    dashboardCSS += "    font-weight: bold;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-item {";
    dashboardCSS += "    background: #FFF;";
    dashboardCSS += "    -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    -moz-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    border-radius: 12px;";
    dashboardCSS += "    padding: 30px;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    overflow-x: auto;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-item.snapshot {";
    dashboardCSS += "    padding: 20px;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-item h1 {";
    dashboardCSS += "    font-size: 1.2em;";
    dashboardCSS += "    font-weight: bold;";
    dashboardCSS += "    margin-bottom: 15px;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-charts {";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    gap: 20px;";
    dashboardCSS += "    justify-content: space-between;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-table {";
    dashboardCSS += "    font-size: 0.9em;";
    dashboardCSS += "    overflow-x: auto;";
    dashboardCSS += "    max-height: 400px;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-table table {";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "}";
    dashboardCSS += "@media screen and (min-width: 768px) {";
    dashboardCSS += "    .stats-card-container {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr;";
    dashboardCSS += "        gap: 20px;";
    dashboardCSS += "    }";
    dashboardCSS += "    .stats-card-grid {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr;";
    dashboardCSS += "    }";
    dashboardCSS += "}";
    dashboardCSS += "@media screen and (min-width: 1024px) {";
    dashboardCSS += "    .m-dash-body {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-data-headers {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-filter {";
    dashboardCSS += "        min-width: 275px;";
    dashboardCSS += "        max-width: 275px;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-charts {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .stats-card-container {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr 1fr 1fr;";
    dashboardCSS += "        gap: 30px;";
    dashboardCSS += "    }";
    dashboardCSS += "}";
    var color = getCachedColor("primary").background;

    dashboardCSS += ".m-dash-card-snap-v2 {";
    dashboardCSS += "display:flex;";
    dashboardCSS += "flex-direction:column;";
    dashboardCSS += "justify-content:space-between;";
    dashboardCSS += "background:#fff;";
    dashboardCSS += "border-radius:20px;";
    dashboardCSS += "box-shadow:0 4px 15px rgba(0,0,0,0.08);";
    dashboardCSS += "padding:1.5rem;";
    dashboardCSS += "transition:transform 0.3s ease, box-shadow 0.3s ease;";
    dashboardCSS += "height:100%;";
    //   dashboardCSS += "max-width:320px;";
    dashboardCSS += "cursor:pointer;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2:hover{";
    dashboardCSS += "transform:translateY(-6px);";
    dashboardCSS += "box-shadow:0 10px 25px rgba(0,0,0,0.12);";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-content{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "gap:1.2rem;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-icon{";
    dashboardCSS += "width:60px;";
    dashboardCSS += "height:60px;";
    dashboardCSS += "border-radius:16px;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:center;";
    dashboardCSS += "color:#fff;";
    dashboardCSS += "font-size:30px;";
    dashboardCSS += "flex-shrink:0;";
    dashboardCSS += "box-shadow:0 6px 12px rgba(0,0,0,0.15);";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-info{flex-grow:1;}";
    dashboardCSS += ".m-dash-card-snap-v2-title{";
    dashboardCSS += "font-size:1.3rem;";
    dashboardCSS += "color:#6c757d;";
    dashboardCSS += "margin:0;";
    dashboardCSS += "text-transform:capitalize;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-value{";
    dashboardCSS += "font-size:2rem;";
    dashboardCSS += "font-weight:700;";
    dashboardCSS += "color:#344767;";
    dashboardCSS += "margin:0.2rem 0 0;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-footer{";
    dashboardCSS += "font-size:1.3rem;";
    dashboardCSS += "color:#7b809a;";
    dashboardCSS += "margin-top:1rem;";
    dashboardCSS += "border-top:1px solid #eaeaea;";
    dashboardCSS += "padding-top:0.8rem;";
    dashboardCSS += "}";
    dashboardCSS += ".m-dash-card-snap-v2-footer .text-success{";
    dashboardCSS += "color:#2ecc71;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "}";
    // bg-* SCOPED para ícones de snap cards (evitar override global do Bootstrap .bg-*)
    dashboardCSS += ".m-dash-card-snap-v2-icon.bg-primary{background:linear-gradient(135deg," + getCachedColor("primary").background + "," + getCachedColor("primary").background + ");}";
    dashboardCSS += ".m-dash-card-snap-v2-icon.bg-success{background:linear-gradient(135deg,#16a34a,#15803d);}";
    dashboardCSS += ".m-dash-card-snap-v2-icon.bg-warning{background:linear-gradient(135deg," + getCachedColor("warning").background + "," + getCachedColor("warning").background + ");}";
    dashboardCSS += ".m-dash-card-snap-v2-icon.bg-danger{background:linear-gradient(135deg,#ef4444,#b91c1c);}";
    dashboardCSS += ".m-dash-card-snap-v2-icon.bg-dark{background:linear-gradient(135deg,#334155,#0f172a);}";

    dashboardCSS += ".m-dash-card-snap-v2-icon i{transition:transform 0.4s ease;}";
    dashboardCSS += ".m-dash-card-snap-v2:hover .m-dash-card-snap-v2-icon i{transform:scale(1.15) rotate(5deg);}";

    dashboardCSS += ".budget-card{";
    dashboardCSS += "background: linear-gradient(135deg, " + getCachedColor("primary").background + " 0%, " + getCachedColor("primary").background + " 100%);";
    dashboardCSS += "border-radius: 16px;";
    dashboardCSS += "box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);";
    dashboardCSS += "color: white;";
    dashboardCSS += "position: relative;";
    dashboardCSS += "overflow: hidden;";
    dashboardCSS += "height: 232px;";
    dashboardCSS += "transition: transform 0.3s ease, box-shadow 0.3s ease;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-card:hover{";
    dashboardCSS += "transform: translateY(-5px);";
    dashboardCSS += "box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);";
    dashboardCSS += "}";
    dashboardCSS += ".shape-divider{";
    dashboardCSS += "position: absolute;";
    dashboardCSS += "top: 0;";
    dashboardCSS += "left: 0;";
    dashboardCSS += "width: 30%;";
    dashboardCSS += "height: 100%;";
    dashboardCSS += "background: rgba(255, 255, 255, 0.1);";
    dashboardCSS += "clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);";
    dashboardCSS += "}";
    dashboardCSS += ".wave-shape{";
    dashboardCSS += "position: absolute;";
    dashboardCSS += "top: 0;";
    dashboardCSS += "left: 0;";
    dashboardCSS += "width: 30%;";
    dashboardCSS += "height: 100%;";
    dashboardCSS += "background: rgba(255, 255, 255, 0.15);";
    dashboardCSS += "clip-path: path(\"M0,0 L100,0 C85,20 85,50 100,70 L0,100 Z\");";
    dashboardCSS += "}";
    dashboardCSS += ".card-content{";
    dashboardCSS += "position: relative;";
    dashboardCSS += "z-index: 2;";
    dashboardCSS += "padding: 18px;";
    dashboardCSS += "height: 100%;";
    dashboardCSS += "display: flex;";
    dashboardCSS += "flex-direction: column;";
    dashboardCSS += "}";
    dashboardCSS += ".card-title{";
    dashboardCSS += "font-size: 3.5rem;";
    dashboardCSS += "font-weight: 700;";
    dashboardCSS += "margin-bottom: 5px;";
    dashboardCSS += "}";
    dashboardCSS += ".card-subtitle{";
    dashboardCSS += "font-size: 1.4rem;";
    dashboardCSS += "opacity: 0.9;";
    dashboardCSS += "margin-bottom: 15px;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-value{";
    dashboardCSS += "font-size: 2.2rem;";
    dashboardCSS += "font-weight: 700;";
    dashboardCSS += "margin-bottom: 20px;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-details{";
    dashboardCSS += "display: flex;";
    dashboardCSS += "gap: 30px;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-item{";
    dashboardCSS += "display: flex;";
    dashboardCSS += "flex-direction: column;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-label{";
    dashboardCSS += "font-size: 1.5rem;";
    dashboardCSS += "opacity: 0.9;";
    dashboardCSS += "margin-bottom: 5px;";
    dashboardCSS += "}";
    dashboardCSS += ".budget-amount{";
    dashboardCSS += "font-size: 1.5rem;";
    dashboardCSS += "font-weight: 600;";
    dashboardCSS += "}";
    dashboardCSS += ".icon-container{";
    dashboardCSS += "position: absolute;";
    dashboardCSS += "bottom: 15px;";
    dashboardCSS += "right: 20px;";
    dashboardCSS += "font-size: 3rem;";
    dashboardCSS += "opacity: 0.2;";
    dashboardCSS += "}";

    dashboardCSS += ":root{";
    dashboardCSS += " --m-time-line-dentro-prazo:#4CAF50;";
    dashboardCSS += " --m-time-line-prestes-expirar:#FF9800;";
    dashboardCSS += " --m-time-line-expirados:#F44336;";
    dashboardCSS += " --m-time-line-anotado:#2196F3;";
    dashboardCSS += " --m-time-line-visado:#9C27B0;";
    dashboardCSS += " --m-time-line-transitado-anotado:#64B5F6;";
    dashboardCSS += " --m-time-line-transitado-visado:#BA68C8;";
    dashboardCSS += " --m-time-line-bg-primary:#f8fafc;";
    dashboardCSS += " --m-time-line-bg-card:#ffffff;";
    dashboardCSS += " --m-time-line-text-primary:#1e293b;";
    dashboardCSS += " --m-time-line-text-secondary:#64748b;";
    dashboardCSS += "}";
    dashboardCSS += ".m-time-line-dashboard-container{";
    dashboardCSS += " width:100%;max-width:500px;background:var(--m-time-line-bg-card);";
    dashboardCSS += " border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);padding:25px;";
    dashboardCSS += "}";
    dashboardCSS += ".m-time-line-cards-container{display:flex;flex-direction:column;gap:20px;}";
    dashboardCSS += ".m-time-line-card{background:var(--m-time-line-bg-card);border-radius:14px;";
    dashboardCSS += " padding:20px;box-shadow:0 6px 20px rgba(0,0,0,0.1);transition:all .3s ease;position:relative;overflow:hidden;}";
    dashboardCSS += ".m-time-line-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;}";
    //dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo::before{background:linear-gradient(90deg,var(--m-time-line-dentro-prazo),#66bb6a);}";
    //dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar::before{background:linear-gradient(90deg,var(--m-time-line-prestes-expirar),#ffb74d);}";
    //dashboardCSS += ".m-time-line-card.m-time-line-expirados::before{background:linear-gradient(90deg,var(--m-time-line-expirados),#ef5350);}";
    dashboardCSS += ".m-time-line-card:hover{transform:translateY(-5px);box-shadow:0 12px 30px rgba(0,0,0,0.15);}";
    dashboardCSS += ".m-time-line-card-header{display:flex;align-items:center;margin-bottom:18px;padding-top:5px;}";
    dashboardCSS += ".m-time-line-status-count{font-size:2.2rem;font-weight:800;margin-right:15px;width:65px;height:65px;display:flex;align-items:center;justify-content:center;border-radius:16px;color:#fff;box-shadow:0 5px 15px rgba(0,0,0,0.15);}";
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-status-count{background:linear-gradient(135deg," + getCachedColor("primary").background + "," + getCachedColor("primary").background + ");}";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-status-count{background:linear-gradient(135deg,var(--m-time-line-prestes-expirar),#ffb74d);}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-status-count{background:linear-gradient(135deg,var(--m-time-line-expirados),#ef5350);}";
    dashboardCSS += ".m-time-line-status-info{flex:1;}";
    dashboardCSS += ".m-time-line-status-title{font-size:2rem;font-weight:700;color:'#626e78 !important';}";
    dashboardCSS += ".m-time-line-status-subtitle{font-size:1rem;color:var(--m-time-line-text-secondary);margin-top:3px;}";
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-status-subtitle{color:var(--m-time-line-dentro-prazo);}";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-status-subtitle{color:var(--m-time-line-prestes-expirar);}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-status-subtitle{color:var(--m-time-line-expirados);}";
    dashboardCSS += ".m-time-line-details{display:flex;flex-direction:column;gap:15px;}";
    dashboardCSS += ".m-time-line-category{display:flex;flex-direction:column;gap:8px;}";
    dashboardCSS += ".m-time-line-category-header{display:flex;align-items:center;margin-bottom:3px;}";
    dashboardCSS += ".m-time-line-category-title{font-size:1.25rem;font-weight:600;color:var(--m-time-line-text-secondary);}";
    dashboardCSS += ".m-time-line-category-items{display:grid;grid-template-columns:1fr 1fr;gap:8px;}";
    dashboardCSS += ".m-time-line-detail-item{display:flex;flex-direction:column;align-items:center;padding:10px 8px;border-radius:10px;background:#f8fafc;transition:all .2s ease;box-shadow:0 2px 5px rgba(0,0,0,0.05);}";
    dashboardCSS += ".m-time-line-detail-item:hover{background:#f1f5f9;box-shadow:0 4px 8px rgba(0,0,0,0.08);}";
    dashboardCSS += ".m-time-line-detail-label{font-size:1.75rem;color:var(--m-time-line-text-secondary);margin-bottom:5px;font-weight:500;text-align:center;}";
    dashboardCSS += ".m-time-line-detail-value{font-size:1.7rem;font-weight:700;}";
    dashboardCSS += ".m-time-line-anotado{color:var(--m-time-line-anotado);}";

    dashboardCSS += ".m-time-line-visado{color:var(--m-time-line-visado);}";
    dashboardCSS += ".m-time-line-transitado-anotado{color:var(--m-time-line-transitado-anotado);}";
    dashboardCSS += ".m-time-line-transitado-visado{color:var(--m-time-line-transitado-visado);}";
    dashboardCSS += ".m-time-line-progress-container{width:100%;height:4px;background:#e2e8f0;border-radius:2px;margin-top:8px;overflow:hidden;}";
    dashboardCSS += ".m-time-line-progress-bar{height:100%;border-radius:2px;transition:width .5s ease;}";
    dashboardCSS += ".m-time-line-anotado .m-time-line-progress-bar{background:var(--m-time-line-anotado);}";
    dashboardCSS += ".m-time-line-visado .m-time-line-progress-bar{background:var(--m-time-line-visado);}";
    dashboardCSS += ".m-time-line-transitado-anotado .m-time-line-progress-bar{background:var(--m-time-line-transitado-anotado);}";
    dashboardCSS += ".m-time-line-transitado-visado .m-time-line-progress-bar{background:var(--m-time-line-transitado-visado);}";

    // Larguras das barras por status
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-anotado .m-time-line-progress-bar{width:67%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-visado .m-time-line-progress-bar{width:33%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-transitado-anotado .m-time-line-progress-bar{width:50%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-transitado-visado .m-time-line-progress-bar{width:0%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-anotado .m-time-line-progress-bar,";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-visado .m-time-line-progress-bar,";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-transitado-anotado .m-time-line-progress-bar,";
    dashboardCSS += ".m-time-line-card.m-time-line-prestes-expirar .m-time-line-transitado-visado .m-time-line-progress-bar{width:0%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-anotado .m-time-line-progress-bar{width:50%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-visado .m-time-line-progress-bar{width:0%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-transitado-anotado .m-time-line-progress-bar{width:50%;}";
    dashboardCSS += ".m-time-line-card.m-time-line-expirados .m-time-line-transitado-visado .m-time-line-progress-bar{width:50%;}";

    // Responsivo
    dashboardCSS += "@media (max-width:768px){";
    dashboardCSS += " .m-time-line-dashboard-container{padding:20px;}";
    dashboardCSS += " .m-time-line-card{padding:18px;}";
    dashboardCSS += " .m-time-line-status-count{width:60px;height:60px;font-size:2rem;}";
    dashboardCSS += "}";
    dashboardCSS += "@media (max-width:480px){";
    dashboardCSS += " .m-time-line-category-items{grid-template-columns:1fr 1fr;}";
    dashboardCSS += " .m-time-line-detail-value{font-size:1.1rem;}";
    dashboardCSS += "}";

    // Advanced Cards Styles
    dashboardCSS += ".brd-card-advanced{";
    dashboardCSS += "background:#ffffff;";
    dashboardCSS += "border-radius:12px;";
    dashboardCSS += "box-shadow:0 4px 12px rgba(0,0,0,0.08);";
    dashboardCSS += "transition:all 0.3s cubic-bezier(0.4,0,0.2,1);";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "border-top:4px solid " + getCachedColor("primary").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced:hover{";
    dashboardCSS += "transform:translateY(-4px);";
    dashboardCSS += "box-shadow:0 8px 24px rgba(0,0,0,0.12);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced::before{";
    dashboardCSS += "content:'';";
    dashboardCSS += "position:absolute;";
    dashboardCSS += "top:0;";
    dashboardCSS += "left:0;";
    dashboardCSS += "width:100%;";
    dashboardCSS += "height:100%;";
    dashboardCSS += "background:linear-gradient(135deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.05) 100%);";
    dashboardCSS += "pointer-events:none;";
    dashboardCSS += "}";

    // Metric Card Advanced
    dashboardCSS += ".brd-card-advanced-metrica{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "padding:20px;";
    dashboardCSS += "min-height:120px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon{";
    dashboardCSS += "width:60px;";
    dashboardCSS += "height:60px;";
    dashboardCSS += "border-radius:50%;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:center;";
    dashboardCSS += "font-size:24px;";
    dashboardCSS += "margin-right:20px;";
    dashboardCSS += "flex-shrink:0;";
    dashboardCSS += "box-shadow:0 4px 8px rgba(0,0,0,0.1);";
    dashboardCSS += "transition:transform 0.3s ease;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced:hover .brd-card-advanced-icon{";
    dashboardCSS += "transform:scale(1.1) rotate(5deg);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-primary{";
    dashboardCSS += "background:linear-gradient(135deg," + getCachedColor("primary").background + "," + getCachedColor("primary").background + ");";
    dashboardCSS += "color:#ffffff;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-success{";
    dashboardCSS += "background:linear-gradient(135deg,#4CAF50,#45a049);";
    dashboardCSS += "color:#ffffff;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-warning{";
    dashboardCSS += "background:linear-gradient(135deg," + getCachedColor("warning").background + "," + getCachedColor("warning").background + ");";
    dashboardCSS += "color:#ffffff;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-danger{";
    dashboardCSS += "background:linear-gradient(135deg,#f44336,#e53935);";
    dashboardCSS += "color:#ffffff;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-yellow{";
    dashboardCSS += "background:linear-gradient(135deg,#efe21b,#c8c000);";
    dashboardCSS += "color:#1a1a00;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-icon-black{";
    dashboardCSS += "background:linear-gradient(135deg,#333333,#111111);";
    dashboardCSS += "color:#ffffff;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-metrica-yellow{";
    dashboardCSS += "border-top-color:#efe21b;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-metrica-black{";
    dashboardCSS += "border-top-color:#111111;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-content{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "min-width:0;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-label{";
    dashboardCSS += "font-size:18px;";
    dashboardCSS += "color:#64748b;";
    dashboardCSS += "margin-bottom:8px;";
    dashboardCSS += "font-weight:500;";
    dashboardCSS += "font-family:Nunito, sans-serif;";
    // dashboardCSS += "text-transform:uppercase;";
    dashboardCSS += "letter-spacing:0.5px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-value{";
    dashboardCSS += "font-size:28px;";
    dashboardCSS += "font-weight:bold!Important;";
    dashboardCSS += "color:#626e78 !important;";
    dashboardCSS += "line-height:1.2;";
    dashboardCSS += "margin-bottom:4px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-subtitle{";
    dashboardCSS += "font-size:13px;";
    dashboardCSS += "color:#94a3b8;";
    dashboardCSS += "margin-top:4px;";
    dashboardCSS += "}";

    // Status Card Advanced
    dashboardCSS += ".brd-card-advanced-status{";
    dashboardCSS += "padding:20px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-header{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "gap:12px;";
    dashboardCSS += "margin-bottom:16px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-header i{";
    dashboardCSS += "font-size:24px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-badge{";
    dashboardCSS += "padding:6px 12px;";
    dashboardCSS += "border-radius:20px;";
    dashboardCSS += "font-size:12px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "text-transform:uppercase;";
    dashboardCSS += "letter-spacing:0.5px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-primary{";
    dashboardCSS += "border-top-color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-primary .brd-card-advanced-status-header i{";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-primary .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("primary").background) + ",0.1);";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-success{";
    dashboardCSS += "border-top-color:#4CAF50;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-success .brd-card-advanced-status-header i{";
    dashboardCSS += "color:#4CAF50;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-success .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(76,201,240,0.1);";
    dashboardCSS += "color:#4CAF50;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-warning{";
    dashboardCSS += "border-top-color:" + getCachedColor("warning").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-warning .brd-card-advanced-status-header i{";
    dashboardCSS += "color:" + getCachedColor("warning").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-warning .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("warning").background) + ",0.1);";
    dashboardCSS += "color:" + getCachedColor("warning").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-danger{";
    dashboardCSS += "border-top-color:#f44336;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-danger .brd-card-advanced-status-header i{";
    dashboardCSS += "color:#f44336;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-danger .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(244,67,54,0.1);";
    dashboardCSS += "color:#f44336;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-title{";
    dashboardCSS += "font-size:18px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "color:#1e293b;";
    dashboardCSS += "margin-bottom:8px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-message{";
    dashboardCSS += "font-size:14px;";
    dashboardCSS += "color:#64748b;";
    dashboardCSS += "line-height:1.6;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-footer{";
    dashboardCSS += "margin-top:12px;";
    dashboardCSS += "padding-top:12px;";
    dashboardCSS += "border-top:1px solid #e2e8f0;";
    dashboardCSS += "font-size:13px;";
    dashboardCSS += "color:#94a3b8;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-yellow{";
    dashboardCSS += "border-top-color:#efe21b;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-yellow .brd-card-advanced-status-header i{";
    dashboardCSS += "color:#8a7f00;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-yellow .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(239,226,27,0.15);";
    dashboardCSS += "color:#8a7f00;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-black{";
    dashboardCSS += "border-top-color:#111111;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-black .brd-card-advanced-status-header i{";
    dashboardCSS += "color:#111111;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-status-black .brd-card-advanced-status-badge{";
    dashboardCSS += "background:rgba(17,17,17,0.08);";
    dashboardCSS += "color:#111111;";
    dashboardCSS += "}";

    // Alert Card Advanced
    dashboardCSS += ".brd-card-advanced-alert{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:flex-start;";
    dashboardCSS += "gap:16px;";
    dashboardCSS += "padding:20px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-icon{";
    dashboardCSS += "width:48px;";
    dashboardCSS += "height:48px;";
    dashboardCSS += "border-radius:50%;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:center;";
    dashboardCSS += "font-size:20px;";
    dashboardCSS += "flex-shrink:0;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-primary{";
    dashboardCSS += "border-top-color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("primary").background) + ",0.03);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-primary .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("primary").background) + ",0.1);";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-warning{";
    dashboardCSS += "border-top-color:" + getCachedColor("warning").background + ";";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("warning").background) + ",0.03);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-warning .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(" + hexToRgb(getCachedColor("warning").background) + ",0.1);";
    dashboardCSS += "color:" + getCachedColor("warning").background + ";";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-danger{";
    dashboardCSS += "border-top-color:#f44336;";
    dashboardCSS += "background:rgba(244,67,54,0.03);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-danger .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(244,67,54,0.1);";
    dashboardCSS += "color:#f44336;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-success{";
    dashboardCSS += "border-top-color:#4CAF50;";
    dashboardCSS += "background:rgba(76,201,240,0.03);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-success .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(76,201,240,0.1);";
    dashboardCSS += "color:#4CAF50;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-yellow{";
    dashboardCSS += "border-top-color:#efe21b;";
    dashboardCSS += "background:rgba(239,226,27,0.03);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-yellow .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(239,226,27,0.15);";
    dashboardCSS += "color:#8a7f00;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-black{";
    dashboardCSS += "border-top-color:#111111;";
    dashboardCSS += "background:rgba(17,17,17,0.02);";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-black .brd-card-advanced-alert-icon{";
    dashboardCSS += "background:rgba(17,17,17,0.08);";
    dashboardCSS += "color:#111111;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-content{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "min-width:0;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-title{";
    dashboardCSS += "font-size:16px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "color:#1e293b;";
    dashboardCSS += "margin-bottom:6px;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-message{";
    dashboardCSS += "font-size:14px;";
    dashboardCSS += "color:#64748b;";
    dashboardCSS += "line-height:1.5;";
    dashboardCSS += "}";
    dashboardCSS += ".brd-card-advanced-alert-footer{";
    dashboardCSS += "margin-top:10px;";
    dashboardCSS += "font-size:12px;";
    dashboardCSS += "color:#94a3b8;";
    dashboardCSS += "}";

    // Responsive
    dashboardCSS += "@media (max-width:768px){";
    dashboardCSS += " .brd-card-advanced-metrica{padding:16px;}";
    dashboardCSS += " .brd-card-advanced-icon{width:50px;height:50px;font-size:20px;margin-right:16px;}";
    dashboardCSS += " .brd-card-advanced-value{font-size:24px;}";
    dashboardCSS += " .brd-card-advanced-status{padding:16px;}";
    dashboardCSS += " .brd-card-advanced-alert{padding:16px;gap:12px;}";
    dashboardCSS += " .brd-card-advanced-alert-icon{width:40px;height:40px;font-size:18px;}";
    dashboardCSS += "}";

    // ============================================================================
    // MDASH 2.0 - MODERN SIDEBAR STYLES (UX/UI Senior Design)
    // ============================================================================
 
    // Layout Principal - Glass Morphism Effect
   /*
    dashboardCSS += ".mdash-modern-layout{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "height:calc(100vh - 100px);";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-modern-layout::before{";
    dashboardCSS += "content:'';";
    dashboardCSS += "position:absolute;";
    dashboardCSS += "width:400px;";
    dashboardCSS += "height:400px;";
    dashboardCSS += "background:rgba(255,255,255,0.1);";
    dashboardCSS += "border-radius:50%;";
    dashboardCSS += "top:-100px;";
    dashboardCSS += "right:-100px;";
    dashboardCSS += "animation:float 6s ease-in-out infinite;";
    dashboardCSS += "}";


    dashboardCSS += "@keyframes float{";
    dashboardCSS += "0%, 100%{transform:translateY(0px);}";
    dashboardCSS += "50%{transform:translateY(-20px);}";
    dashboardCSS += "}";

    // Sidebar - Modern Glass Effect
    dashboardCSS += ".mdash-sidebar{";
    dashboardCSS += "width:380px;";
    dashboardCSS += "background:rgba(255,255,255,0.95);";
    dashboardCSS += "backdrop-filter:blur(20px);";
    dashboardCSS += "border-right:1px solid rgba(255,255,255,0.2);";
    dashboardCSS += "display:flex;";
    dashboardCSS += "flex-direction:column;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "box-shadow:4px 0 24px rgba(0,0,0,0.08);";
    dashboardCSS += "z-index:10;";
    dashboardCSS += "}";

    // Sidebar Header - Gradient with Animation
    dashboardCSS += ".mdash-sidebar-header{";
    dashboardCSS += "padding:24px 20px;";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-header::before{";
    dashboardCSS += "content:'';";
    dashboardCSS += "position:absolute;";
    dashboardCSS += "width:200%;";
    dashboardCSS += "height:200%;";
    dashboardCSS += "background:radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);";
    dashboardCSS += "top:-50%;";
    dashboardCSS += "left:-50%;";
    dashboardCSS += "animation:shimmer 3s ease-in-out infinite;";
    dashboardCSS += "}";

    dashboardCSS += "@keyframes shimmer{";
    dashboardCSS += "0%, 100%{transform:translate(0,0);}";
    dashboardCSS += "50%{transform:translate(10px,10px);}";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-header h4{";
    dashboardCSS += "margin:0;";
    dashboardCSS += "font-size:20px;";
    dashboardCSS += "font-weight:700;";
    dashboardCSS += "letter-spacing:0.5px;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "z-index:1;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-header h4 i{";
    dashboardCSS += "margin-right:10px;";
    dashboardCSS += "font-size:22px;";
    dashboardCSS += "animation:pulse 2s ease-in-out infinite;";
    dashboardCSS += "}";

    dashboardCSS += "@keyframes pulse{";
    dashboardCSS += "0%, 100%{transform:scale(1);}";
    dashboardCSS += "50%{transform:scale(1.1);}";
    dashboardCSS += "}";

    // Sidebar Body - Custom Scrollbar
    dashboardCSS += ".mdash-sidebar-body{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "overflow-y:auto;";
    dashboardCSS += "padding:20px 16px;";
    dashboardCSS += "background:rgba(248,250,252,0.8);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-body::-webkit-scrollbar{";
    dashboardCSS += "width:6px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-body::-webkit-scrollbar-track{";
    dashboardCSS += "background:rgba(0,0,0,0.02);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-body::-webkit-scrollbar-thumb{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "border-radius:10px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-body::-webkit-scrollbar-thumb:hover{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";

    // Accordion - Modern Cards Style
    dashboardCSS += "#mdash-accordion .panel{";
    dashboardCSS += "margin-bottom:16px;";
    dashboardCSS += "border-radius:16px;";
    dashboardCSS += "border:none;";
    dashboardCSS += "background:white;";
    dashboardCSS += "box-shadow:0 4px 16px rgba(0,0,0,0.06);";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel:hover{";
    dashboardCSS += "box-shadow:0 8px 24px rgba(102,126,234,0.15);";
    dashboardCSS += "transform:translateY(-2px);";
    dashboardCSS += "}";

    // Panel Heading - Gradient Hover Effect
    dashboardCSS += "#mdash-accordion .panel-heading{";
    dashboardCSS += "background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);";
    dashboardCSS += "border:none;";
    dashboardCSS += "cursor:pointer;";
    dashboardCSS += "padding:16px 20px;";
    dashboardCSS += "transition:all 0.3s ease;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-heading::before{";
    dashboardCSS += "content:'';";
    dashboardCSS += "position:absolute;";
    dashboardCSS += "top:0;";
    dashboardCSS += "left:0;";
    dashboardCSS += "width:4px;";
    dashboardCSS += "height:100%;";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "transform:scaleY(0);";
    dashboardCSS += "transition:transform 0.3s ease;";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-heading:hover::before{";
    dashboardCSS += "transform:scaleY(1);";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-heading:hover{";
    dashboardCSS += "background:linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);";
    dashboardCSS += "padding-left:24px;";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-title{";
    dashboardCSS += "font-size:15px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "color:#1e293b;";
    dashboardCSS += "margin:0;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:space-between;";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-title i{";
    dashboardCSS += "margin-right:12px;";
    dashboardCSS += "font-size:18px;";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "transition:transform 0.3s ease;";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-heading:hover .panel-title i{";
    dashboardCSS += "transform:scale(1.2) rotate(5deg);";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-title .badge{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "font-size:11px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "padding:4px 10px;";
    dashboardCSS += "border-radius:12px;";
    dashboardCSS += "box-shadow:0 2px 8px rgba(102,126,234,0.3);";
    dashboardCSS += "}";

    dashboardCSS += "#mdash-accordion .panel-body{";
    dashboardCSS += "padding:16px 20px 20px;";
    dashboardCSS += "background:#fafbfc;";
    dashboardCSS += "}";

    // Sidebar Items - Modern Card Design
    dashboardCSS += ".mdash-sidebar-list{";
    dashboardCSS += "margin-top:12px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:space-between;";
    dashboardCSS += "padding:12px 14px;";
    dashboardCSS += "margin-bottom:8px;";
    dashboardCSS += "background:white;";
    dashboardCSS += "border-radius:12px;";
    dashboardCSS += "cursor:pointer;";
    dashboardCSS += "transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
    dashboardCSS += "border:2px solid transparent;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item::before{";
    dashboardCSS += "content:'';";
    dashboardCSS += "position:absolute;";
    dashboardCSS += "top:0;";
    dashboardCSS += "left:-100%;";
    dashboardCSS += "width:100%;";
    dashboardCSS += "height:100%;";
    dashboardCSS += "background:linear-gradient(90deg, transparent, rgba(102,126,234,0.1), transparent);";
    dashboardCSS += "transition:left 0.5s ease;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item:hover::before{";
    dashboardCSS += "left:100%;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item:hover{";
    dashboardCSS += "background:linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);";
    dashboardCSS += "border-color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "transform:translateX(4px) scale(1.02);";
    dashboardCSS += "box-shadow:0 4px 16px rgba(102,126,234,0.15);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-content{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "gap:12px;";
    dashboardCSS += "font-size:14px;";
    dashboardCSS += "color:#334155;";
    dashboardCSS += "font-weight:500;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "z-index:1;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-content i{";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "font-size:16px;";
    dashboardCSS += "min-width:20px;";
    dashboardCSS += "text-align:center;";
    dashboardCSS += "transition:transform 0.3s ease;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item:hover .mdash-sidebar-item-content i{";
    dashboardCSS += "transform:rotate(10deg) scale(1.2);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-content .badge{";
    dashboardCSS += "margin-left:auto;";
    dashboardCSS += "background:" + getCachedColor("info").background + ";";
    dashboardCSS += "font-size:10px;";
    dashboardCSS += "padding:3px 8px;";
    dashboardCSS += "border-radius:10px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "box-shadow:0 2px 6px rgba(59,130,246,0.3);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "gap:6px;";
    dashboardCSS += "opacity:0;";
    dashboardCSS += "transform:translateX(-10px);";
    dashboardCSS += "transition:all 0.3s ease;";
    dashboardCSS += "position:relative;";
    dashboardCSS += "z-index:2;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item:hover .mdash-sidebar-item-actions{";
    dashboardCSS += "opacity:1;";
    dashboardCSS += "transform:translateX(0);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions .btn{";
    dashboardCSS += "padding:6px 10px;";
    dashboardCSS += "border-radius:8px;";
    dashboardCSS += "transition:all 0.2s ease;";
    dashboardCSS += "border:none;";
    dashboardCSS += "font-size:12px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions .btn-primary{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions .btn-primary:hover{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "transform:scale(1.1);";
    dashboardCSS += "box-shadow:0 4px 12px rgba(102,126,234,0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions .btn-danger{";
    dashboardCSS += "background:" + getCachedColor("danger").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-sidebar-item-actions .btn-danger:hover{";
    dashboardCSS += "background:" + getCachedColor("danger").background + ";";
    dashboardCSS += "transform:scale(1.1);";
    dashboardCSS += "box-shadow:0 4px 12px rgba(239,68,68,0.4);";
    dashboardCSS += "}";

    // Canvas Area - Modern Design
    dashboardCSS += ".mdash-canvas{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "flex-direction:column;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "background:rgba(248,250,252,0.95);";
    dashboardCSS += "backdrop-filter:blur(10px);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-header{";
    dashboardCSS += "padding:24px 32px;";
    dashboardCSS += "background:white;";
    dashboardCSS += "border-bottom:1px solid rgba(226,232,240,0.8);";
    dashboardCSS += "display:flex;";
    dashboardCSS += "justify-content:space-between;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "box-shadow:0 2px 8px rgba(0,0,0,0.04);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-header h3{";
    dashboardCSS += "margin:0;";
    dashboardCSS += "font-size:22px;";
    dashboardCSS += "font-weight:700;";
    dashboardCSS += "color:#1e293b;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "gap:12px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-header h3 i{";
    dashboardCSS += "color:" + getCachedColor("primary").background + ";";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-body{";
    dashboardCSS += "flex:1;";
    dashboardCSS += "overflow-y:auto;";
    dashboardCSS += "padding:24px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-body::-webkit-scrollbar{";
    dashboardCSS += "width:8px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-body::-webkit-scrollbar-track{";
    dashboardCSS += "background:rgba(0,0,0,0.02);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-body::-webkit-scrollbar-thumb{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "border-radius:10px;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-empty{";
    dashboardCSS += "display:flex;";
    dashboardCSS += "flex-direction:column;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "justify-content:center;";
    dashboardCSS += "height:100%;";
    dashboardCSS += "color:#94a3b8;";
    dashboardCSS += "text-align:center;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-empty i{";
    dashboardCSS += "font-size:64px;";
    dashboardCSS += "margin-bottom:16px;";
    dashboardCSS += "opacity:0.3;";
    dashboardCSS += "}";

    // Canvas Container - Card Style
    dashboardCSS += ".mdash-canvas-container{";
    dashboardCSS += "margin-bottom:24px;";
    dashboardCSS += "background:white;";
    dashboardCSS += "border-radius:16px;";
    dashboardCSS += "box-shadow:0 4px 16px rgba(0,0,0,0.06);";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "transition:all 0.3s ease;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-container:hover{";
    dashboardCSS += "box-shadow:0 8px 24px rgba(102,126,234,0.12);";
    dashboardCSS += "transform:translateY(-2px);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-container-header{";
    dashboardCSS += "padding:20px 24px;";
    dashboardCSS += "background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);";
    dashboardCSS += "border-bottom:2px solid #e2e8f0;";
    dashboardCSS += "display:flex;";
    dashboardCSS += "justify-content:space-between;";
    dashboardCSS += "align-items:center;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-container-header h4{";
    dashboardCSS += "margin:0;";
    dashboardCSS += "font-size:18px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "color:#1e293b;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-canvas-container-body{";
    dashboardCSS += "padding:24px;";
    dashboardCSS += "}";

    // Buttons Modern Style
    dashboardCSS += ".mdash-canvas-actions .btn,";
    dashboardCSS += ".mdash-editor-wrapper .panel-body .btn-block{";
    dashboardCSS += "padding:10px 20px;";
    dashboardCSS += "border-radius:10px;";
    dashboardCSS += "font-weight:600;";
    dashboardCSS += "font-size:14px;";
    dashboardCSS += "border:none;";
    dashboardCSS += "transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
    dashboardCSS += "box-shadow:0 2px 8px rgba(0,0,0,0.1);";
    dashboardCSS += "position:relative;";
    dashboardCSS += "overflow:hidden;";
    dashboardCSS += "}";

    // Botões do editor MDash 2.0 - SCOPED para não afetar botões fora do editor
    dashboardCSS += ".mdash-editor-wrapper .btn-primary{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-editor-wrapper .btn-primary:hover{";
    dashboardCSS += "background:" + getCachedColor("primary").background + ";";
    dashboardCSS += "transform:translateY(-2px);";
    dashboardCSS += "box-shadow:0 6px 20px rgba(102,126,234,0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-editor-wrapper .btn-success{";
    dashboardCSS += "background:" + getCachedColor("success").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-editor-wrapper .btn-success:hover{";
    dashboardCSS += "background:" + getCachedColor("success").background + ";";
    dashboardCSS += "transform:translateY(-2px);";
    dashboardCSS += "box-shadow:0 6px 20px rgba(16,185,129,0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-editor-wrapper .btn-info{";
    dashboardCSS += "background:" + getCachedColor("info").background + ";";
    dashboardCSS += "color:white;";
    dashboardCSS += "}";

    dashboardCSS += ".mdash-editor-wrapper .btn-info:hover{";
    dashboardCSS += "background:" + getCachedColor("info").background + ";";
    dashboardCSS += "transform:translateY(-2px);";
    dashboardCSS += "box-shadow:0 6px 20px rgba(59,130,246,0.4);";
    dashboardCSS += "}";

    // Responsive Design
    dashboardCSS += "@media (max-width:1024px){";
    dashboardCSS += ".mdash-sidebar{width:320px;}";
    dashboardCSS += "}";

    dashboardCSS += "@media (max-width:768px){";
    dashboardCSS += ".mdash-modern-layout{flex-direction:column;}";
    dashboardCSS += ".mdash-sidebar{width:100%;max-height:40vh;}";
    dashboardCSS += ".mdash-canvas{height:60vh;}";
    dashboardCSS += "}";*/

    styles.push(dashboardCSS);
}

/**
 * Estilos para Sortable.js drag-and-drop
 */
function loadSortableStyles() {
    var sortableCSS = "";

    // Ghost element (elemento sendo arrastado)
    sortableCSS += ".sortable-ghost{opacity:0.4;background:#f0f4ff;}";

    // Chosen element (elemento selecionado)
    sortableCSS += ".sortable-chosen{cursor:grabbing !important;}";

    // Drag element  
    sortableCSS += ".sortable-drag{opacity:0.8;box-shadow:0 4px 8px rgba(0,0,0,0.2);}";

    // Drag handle para containers
    sortableCSS += ".m-dash-container-drag-handle{";
    sortableCSS += "position:absolute;top:5px;left:5px;";
    sortableCSS += "cursor:move;color:#cbd5e0;font-size:16px;";
    sortableCSS += "opacity:0;transition:opacity 0.2s;";
    sortableCSS += "z-index:10;padding:5px;";
    sortableCSS += "}";

    sortableCSS += ".home-collapse:hover .m-dash-container-drag-handle{opacity:1;}";

    // Drag handle para items
    sortableCSS += ".m-dash-item-drag-handle{";
    sortableCSS += "position:absolute;top:5px;right:35px;";
    sortableCSS += "cursor:move;color:#cbd5e0;font-size:14px;";
    sortableCSS += "opacity:0;transition:opacity 0.2s;";
    sortableCSS += "}";

    sortableCSS += ".m-dash-container-item:hover .m-dash-item-drag-handle{opacity:1;}";

    $('<style>').text(sortableCSS).appendTo('head');
    console.log('Sortable styles loaded');
}

/**
 * Carrega estilos para MDash 2.0 Builder (3 colunas drag-and-drop)
 */

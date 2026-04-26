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
    $('head').append('<style>' + globalStyle + '</style>');
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
    cardHTML += '<div id="' + (dashCard.id || 'snap-' + generateUUID()) + '" class="m-dash-card-snap ' + (dashCard.classes || '') + '" style="height: 100%!important;' + (dashCard.styles || '') + '">';
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
    cardHTML += '<div id="' + (dashCard.id || 'snapshot-' + generateUUID()) + '" class="m-dash-item snapshot ' + (dashCard.classes || '') + '" style="height: 100%!important;' + (dashCard.styles || '') + '">';
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
    code: '// Variáveis disponíveis:\n// containerSelector — selector CSS do container (string)\n// $container       — $(containerSelector) (jQuery)\n// data             — array de registos da fonte\n// config           — objecto de configuração\n// itemObject       — MdashContainerItemObject\n// fetchData()      — função que devolve array de dados da fonte+transform\n\n$container.html(\'<div style="padding:16px;color:#64748b;font-size:13px;"><i class="fa fa-code"></i> Código personalizado</div>\');',
    cssCode: '',
    executeOnEdit: true
};

// ── Renderer ────────────────────────────────────────────────────────────────
function renderObjectCustomCode(dados) {
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_CUSTOMCODE_SAMPLE_CONFIG));
    var rows = dados.data || [];
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var sel = dados.containerSelector;

    // Transform fallback
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
            }
        } catch (e) { /* silêncio */ }
    }

    var code = cfg.code || '';
    var cssCode = cfg.cssCode || '';

    if (!code) {
        $(sel).html(
            '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">'
            + '<i class="fa fa-code" style="font-size:24px;display:block;margin-bottom:6px;opacity:.5;"></i>'
            + 'Código personalizado — sem código definido'
            + '</div>'
        );
        return;
    }

    // Inject scoped CSS if present
    var styleId = 'mcc-style-' + stamp;
    $('#' + styleId).remove();
    if (cssCode) {
        $('head').append('<style id="' + styleId + '">' + cssCode + '</style>');
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
            code
        );
        fn(sel, $(sel), rows, cfg, dados.itemObject, $, fetchData);
    } catch (err) {
        $(sel).html(
            '<div style="padding:12px;font-size:12px;">'
            + '<div style="color:#dc2626;font-weight:700;margin-bottom:4px;"><i class="glyphicon glyphicon-exclamation-sign"></i> Erro no código personalizado</div>'
            + '<pre style="background:#fff5f5;border:1px solid #fecaca;color:#991b1b;padding:8px;border-radius:6px;font-size:11px;white-space:pre-wrap;max-height:200px;overflow:auto;">'
            + $('<span>').text(err.message || String(err)).html()
            + '</pre></div>'
        );
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
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }
    panel.data('_mciTimer', _timer);

    // ── Transform badge ──
    var _hasTrans = !!((obj.transformConfig && obj.transformConfig.sourceTable) || (cfg.transformConfig && cfg.transformConfig.sourceTable));

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
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc((obj.transformConfig && obj.transformConfig.sourceTable) || (cfg.transformConfig && cfg.transformConfig.sourceTable) || 'SQL') + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
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
    var sOpcoes = '<div class="mcbi-field">'
        + _mciChk('mcc-exec-edit', 'Executar no editor (live preview)', cfg.executeOnEdit !== false)
        + '</div>'
        + '<div class="mcbi-field">'
        + '<label>Campos disponíveis</label>'
        + '<div class="mcc-fields-list" style="font-size:10px;color:#64748b;max-height:120px;overflow:auto;">'
        + (fields.length ? fields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ') : '<em>Sem campos — seleccione uma fonte</em>')
        + '</div></div>';

    // ── Ajuda ──
    var sAjuda = '<div style="font-size:10.5px;color:#64748b;line-height:1.6;">'
        + '<p style="margin:0 0 6px;"><strong>Variáveis disponíveis:</strong></p>'
        + '<code>containerSelector</code> — selector CSS (string)<br>'
        + '<code>$container</code> — $(containerSelector) (jQuery)<br>'
        + '<code>data</code> — array de registos [{campo: valor}, ...]<br>'
        + '<code>config</code> — objecto de configuração<br>'
        + '<code>itemObject</code> — MdashContainerItemObject<br>'
        + '<code>$</code> — jQuery<br>'
        + '<code>fetchData()</code> — função que devolve array de dados da fonte+transform<br>'
        + '<hr style="margin:8px 0;border-color:rgba(0,0,0,.06);">'
        + '<p style="margin:0;"><strong>Exemplo:</strong></p>'
        + '<pre style="background:rgba(0,0,0,.03);padding:8px;border-radius:5px;font-size:10px;margin:4px 0 0;">'
        + '$container.empty();\nvar html = \'&lt;ul&gt;\';\ndata.forEach(function(row) {\n  html += \'&lt;li&gt;\' + row.nome + \'&lt;/li&gt;\';\n});\nhtml += \'&lt;/ul&gt;\';\n$container.html(html);'
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
    panel.off('.mcbi');

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
        obj.fontestamp = newStamp || '';
        _mciAutoApplyFonteTransform(newStamp, obj, panel);
        // Refresh fields list
        var newFields = _mciGetFields(obj);
        panel.find('.mcc-fields-list').html(
            newFields.length
                ? newFields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                : '<em>Sem campos — seleccione uma fonte</em>'
        );
        fire();
    });

    // Transform button
    panel.on('click.mcbi', '.mcbi-btn-transform', function () {
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var fonteStamp = obj.fontestamp;
        var fonte = fonteStamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
        var schema = [];
        if (fonte && typeof mdashFonteTableName === 'function' && typeof MdashTransformBuilder !== 'undefined') {
            var tbl = mdashFonteTableName(fonte);
            if (tbl) schema = MdashTransformBuilder.getTableSchema(tbl);
        }
        _mciOpenTransformModalFor({
            title: 'Transformação — Código Personalizado',
            fonteName: fonte ? (fonte.descricao || fonte.codigo) : '',
            modalId: 'mcc-transform-modal',
            hostId: 'mcc-transform-modal-host',
            config: currentTC,
            schema: schema,
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

    // Checkbox change
    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]', function () {
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

// ── Read config from panel ──────────────────────────────────────────────────
function _ccReadConfig(panel, obj) {
    var cfg = obj.config || {};
    var aceJs = panel.data('_mccAceJs');
    var aceCss = panel.data('_mccAceCss');

    cfg.code = aceJs ? aceJs.getValue() : (cfg.code || '');
    cfg.cssCode = aceCss ? aceCss.getValue() : (cfg.cssCode || '');
    cfg.executeOnEdit = panel.find('.mcc-exec-edit').is(':checked');
    cfg.transformConfig = cfg.transformConfig || null;

    obj.config = cfg;
    obj.configjson = JSON.stringify(cfg);
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
    maxHeight: '500px',
    pagination: { enabled: false, size: 15 },
    headerFilter: false,
    resizableColumns: true,
    movableColumns: false,
    selectable: false,
    stripedRows: true,
    hoverHighlight: true,
    responsiveLayout: 'collapse',
    theme: 'phcPrimary',
    columns: [],
    autoColumns: true,
    dataTree: { enabled: false, parentField: 'id', childField: 'parentId', startExpanded: true },
    exportOptions: { enableExcel: true, enablePDF: false },
    styling: {
        headerBg: '',
        headerText: '#ffffff',
        borderRadius: 10,
        fontSize: 13,
        rowHeight: 'normal',
        accentColor: ''
    },
    footer: { showRowCount: true, showColumnsInfo: false }
};

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
    minimal:    { name: 'Minimalista', headerBg: 'transparent', headerText: '#475569', accent: '#64748b', rowEven: 'transparent', rowHover: 'rgba(0,0,0,.02)', border: 'rgba(0,0,0,.06)' }
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
    { value: 'tickCross', label: 'Sim/Não' },
    { value: 'star', label: 'Estrelas' },
    { value: 'progress', label: 'Barra de Progresso' },
    { value: 'color', label: 'Cor' },
    { value: 'link', label: 'Link' },
    { value: 'html', label: 'HTML' }
];

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
    s += '.mtbl-wrap{position:relative;border-radius:var(--mtbl-radius,10px);overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);background:#fff;border:1px solid rgba(0,0,0,.06);}';
    s += '.mtbl-wrap .tabulator{border:none;background:transparent;font-size:var(--mtbl-fs,13px);font-family:"Inter","Nunito","Segoe UI",Arial,sans-serif;}';
    s += '.mtbl-wrap .tabulator .tabulator-header{background:var(--mtbl-hdr-bg,#1e293b);border-bottom:none;border-radius:var(--mtbl-radius,10px) var(--mtbl-radius,10px) 0 0;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col{background:transparent;color:var(--mtbl-hdr-text,#f8fafc);border-right:1px solid rgba(255,255,255,.08);padding:10px 14px;font-weight:600;font-size:calc(var(--mtbl-fs,13px) - 0.5px);letter-spacing:.2px;text-transform:uppercase;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col:last-child{border-right:none;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-sorter{color:var(--mtbl-hdr-text,#f8fafc);}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);color:var(--mtbl-hdr-text,#f8fafc);border-radius:5px;padding:3px 8px;font-size:11px;margin-top:4px;transition:border-color .2s;}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input::placeholder{color:rgba(255,255,255,.4);}';
    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-header-filter input:focus{border-color:var(--mtbl-accent,#2563eb);outline:none;background:rgba(255,255,255,.18);}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row{border-bottom:1px solid var(--mtbl-border,rgba(0,0,0,.06));transition:background .15s ease;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row:last-child{border-bottom:none;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-row-even{background:var(--mtbl-row-even,#f8fafc);}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row:hover{background:var(--mtbl-row-hover,rgba(37,99,235,.06)) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row .tabulator-cell{padding:10px 14px;border-right:none;color:#334155;vertical-align:middle;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-selected{background:rgba(37,99,235,.08) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder .tabulator-table .tabulator-row.tabulator-selected .tabulator-cell{color:var(--mtbl-accent,#2563eb);}';
    s += '.mtbl-wrap .tabulator .tabulator-data-tree-control{width:18px !important;height:18px !important;border-radius:4px;transition:background .15s;}';
    s += '.mtbl-wrap .tabulator .tabulator-data-tree-control:hover{background:rgba(0,0,0,.06);}';
    s += '.mtbl-wrap .tabulator .tabulator-row.tabulator-tree-level-1{background:rgba(0,0,0,.015) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-row.tabulator-tree-level-2{background:rgba(0,0,0,.03) !important;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer{background:#f8fafc;border-top:1px solid var(--mtbl-border,rgba(0,0,0,.06));padding:8px 14px;font-size:12px;color:#64748b;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page{padding:4px 10px;border-radius:5px;border:1px solid rgba(0,0,0,.1);margin:0 2px;font-size:11px;font-weight:500;background:#fff;color:#475569;transition:all .15s;}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page.active{background:var(--mtbl-accent,#2563eb);color:#fff;border-color:var(--mtbl-accent,#2563eb);}';
    s += '.mtbl-wrap .tabulator .tabulator-footer .tabulator-page:hover:not(.active){background:#e2e8f0;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar{width:6px;height:6px;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-track{background:transparent;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:3px;}';
    s += '.mtbl-wrap .tabulator .tabulator-tableholder::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.2);}';
    s += '.mtbl-toolbar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#f8fafc;border-bottom:1px solid rgba(0,0,0,.06);}';
    s += '.mtbl-toolbar-right{display:flex;gap:6px;align-items:center;}';
    s += '.mtbl-export-btn{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;border:1px solid rgba(0,0,0,.1);background:#fff;font-size:11px;font-weight:600;color:#475569;cursor:pointer;transition:all .15s;}';
    s += '.mtbl-export-btn:hover{border-color:var(--mtbl-accent,#2563eb);color:var(--mtbl-accent,#2563eb);background:#f0f4ff;}';
    s += '.mtbl-export-btn i{font-size:12px;}';
    s += '.mtbl-row-count{font-size:11px;color:#94a3b8;}';
    s += '.mtbl-row-count strong{color:#475569;font-weight:600;}';
    s += '.mtbl-money{font-variant-numeric:tabular-nums;font-feature-settings:"tnum";}';
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

    var rows = dados.data || [];
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
    if (rows.length === 0) {
        rows = getMdashSampleData('table');
        isSample = true;
    }

    _tblCSS();
    var theme = _tblResolveTheme(_TABLE_THEMES[cfg.theme] || _TABLE_THEMES.phcPrimary);
    var stl = cfg.styling || {};
    var tblId = 'mtbl_' + stamp;
    var wrapId = 'mtbl-wrap_' + stamp;

    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra \u2014 configure a fonte</div>'
        : '';

    var toolbarHtml = '';
    var exp = cfg.exportOptions || {};
    if (exp.enableExcel || exp.enablePDF) {
        toolbarHtml = '<div class="mtbl-toolbar">'
            + '<span class="mtbl-row-count"><strong>' + rows.length + '</strong> registos</span>'
            + '<div class="mtbl-toolbar-right">';
        if (exp.enableExcel) toolbarHtml += '<button type="button" class="mtbl-export-btn mtbl-exp-xlsx" title="Exportar Excel"><i class="fa fa-file-excel-o"></i> Excel</button>';
        if (exp.enablePDF) toolbarHtml += '<button type="button" class="mtbl-export-btn mtbl-exp-pdf" title="Exportar PDF"><i class="fa fa-file-pdf-o"></i> PDF</button>';
        toolbarHtml += '</div></div>';
    }

    var hdrBg = stl.headerBg || theme.headerBg;
    var accentC = stl.accentColor || theme.accent;
    var cssVars = '--mtbl-hdr-bg:' + hdrBg + ';'
        + '--mtbl-hdr-text:' + (stl.headerText || theme.headerText) + ';'
        + '--mtbl-accent:' + accentC + ';'
        + '--mtbl-row-even:' + (theme.rowEven) + ';'
        + '--mtbl-row-hover:' + (theme.rowHover) + ';'
        + '--mtbl-border:' + (theme.border) + ';'
        + '--mtbl-radius:' + (stl.borderRadius || 10) + 'px;'
        + '--mtbl-fs:' + (stl.fontSize || 13) + 'px;';

    var html = badgeHtml
        + '<div id="' + wrapId + '" class="mtbl-wrap" style="' + cssVars + '">'
        + toolbarHtml
        + '<div id="' + tblId + '"></div>'
        + '</div>';

    $(dados.containerSelector).html(html);

    setTimeout(function () {
        var dom = document.getElementById(tblId);
        if (!dom) return;

        var columns = _tblBuildColumns(cfg, rows);

        var tblCfg = {
            data: rows,
            columns: columns,
            layout: cfg.layout || 'fitColumns',
            responsiveLayout: cfg.responsiveLayout || false,
            movableColumns: cfg.movableColumns || false,
            resizableColumns: cfg.resizableColumns !== false,
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
            if (columns.length > 0) tblCfg.dataTreeElementColumn = columns[0].field;
        }

        var table = new Tabulator('#' + tblId, tblCfg);

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
                orientation: 'landscape', title: 'Relat\u00f3rio',
                autoTable: { styles: { fillColor: [30, 41, 59] }, margin: { top: 30 } }
            });
        });

        table.on('tableBuilt', function () {
            if (dom._mdashTableReady) return;
            dom._mdashTableReady = true;
            if (window.ResizeObserver) {
                var ro = new ResizeObserver(function () { table.redraw(); });
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

// ── Construir colunas Tabulator ──────────────────────────────────────────────
function _tblBuildColumns(cfg, rows) {
    var cols = cfg.columns || [];
    if ((!cols.length || cfg.autoColumns) && cfg.autoColumns !== false && rows.length > 0) {
        var keys = Object.keys(rows[0]);
        return keys.map(function (k) {
            var col = {
                title: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
                field: k,
                headerFilter: cfg.headerFilter === true ? 'input' : false,
                resizable: true,
                sorter: _tblGuessSorter(rows, k)
            };
            var sample = rows[0][k];
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
            return col;
        });
    }
    return cols.filter(function (c) { return c.visible !== false; }).map(function (c) {
        var col = {
            title: c.title || c.field,
            field: c.field,
            hozAlign: c.hozAlign || 'left',
            vertAlign: c.vertAlign || 'middle',
            resizable: c.resizable !== false,
            frozen: c.frozen || false,
            sorter: c.sorter || 'string',
            headerFilter: (cfg.headerFilter === true && c.headerFilter !== false) ? 'input' : false
        };
        if (c.width) col.width = c.width;
        if (c.minWidth) col.minWidth = c.minWidth;
        if (c.formatter) {
            col.formatter = c.formatter;
            if (c.formatterParams) {
                col.formatterParams = c.formatterParams;
                if (c.formatter === 'money') col.formatterParams.symbolAfter = true;
            }
        }
        return col;
    });
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

// ── Painel de propriedades inline da Tabela ──────────────────────────────────
function renderTablePropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_TABLE_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    _mciCSS();
    _tblCSS();

    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mtbl-root').length) return;
            _tblReadConfig(panel, obj);
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
    sTema += '</div></div>';

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
        + '<div class="mtbl-col-list" style="max-height:300px;overflow:auto;">';
    var manualCols = cfg.columns || [];
    if (manualCols.length) {
        manualCols.forEach(function (c, i) {
            sColunas += _tblColCard(c, i, fields);
        });
    } else {
        sColunas += '<div class="mcbi-info">Desative "Auto-gerar" e adicione colunas manualmente.</div>';
    }
    sColunas += '</div>'
        + '<button type="button" class="btn btn-xs btn-default mtbl-add-col" style="margin-top:6px;width:100%;"><i class="glyphicon glyphicon-plus"></i> Adicionar coluna</button>'
        + '</div>';

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

    // ── Sec\u00e7\u00e3o: Exporta\u00e7\u00e3o ──
    var expCfg = cfg.exportOptions || {};
    var sExport = '<div class="mcbi-checks">'
        + _mciChk('mtbl-exp-excel', 'Exportar Excel', expCfg.enableExcel !== false)
        + _mciChk('mtbl-exp-pdf-chk', 'Exportar PDF', expCfg.enablePDF === true)
        + '</div>';

    // ── Sec\u00e7\u00e3o: Estilo ──
    var stl = cfg.styling || {};
    var sEstilo = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Cor cabe\u00e7alho</label>'
        + '<input type="color" class="mtbl-hdrbg form-control input-sm" value="' + (stl.headerBg || '#1e293b') + '" style="width:50px;height:28px;padding:2px;"></div>'
        + '<div class="mcbi-field"><label>Texto cabe\u00e7alho</label>'
        + '<input type="color" class="mtbl-hdrtext form-control input-sm" value="' + (stl.headerText || '#f8fafc') + '" style="width:50px;height:28px;padding:2px;"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Cor destaque</label>'
        + '<input type="color" class="mtbl-accent form-control input-sm" value="' + (stl.accentColor || '#2563eb') + '" style="width:50px;height:28px;padding:2px;"></div>'
        + '<div class="mcbi-field"><label>Raio bordas</label>'
        + '<input type="number" class="mtbl-radius form-control input-sm" value="' + (stl.borderRadius || 10) + '" min="0" max="20" style="width:70px;"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Tamanho fonte</label>'
        + '<input type="number" class="mtbl-fontsize form-control input-sm" value="' + (stl.fontSize || 13) + '" min="10" max="18" style="width:70px;"> px</div>'
        + '</div>';

    // ── Montar HTML ──
    var html = '<div class="mcbi-root mtbl-root" data-stamp="' + stamp + '">'
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('tema', 'Tema Visual', 'glyphicon-eye-open', true, sTema)
        + _mciSection('layout', 'Layout', 'glyphicon-th-large', true, sLayout)
        + _mciSection('paginacao', 'Pagina\u00e7\u00e3o', 'glyphicon-forward', false, sPagination)
        + _mciSection('colunas', 'Colunas', 'glyphicon-th-list', false, sColunas)
        + _mciSection('hierarquia', 'Hierarquia', 'glyphicon-tree-deciduous', false, sTree)
        + _mciSection('exportacao', 'Exporta\u00e7\u00e3o', 'glyphicon-download-alt', false, sExport)
        + _mciSection('estilo', 'Estilo Avan\u00e7ado', 'glyphicon-tint', false, sEstilo)
        + '</div>';

    panel.html(html);

    // ── Event handlers ──
    // Limpar handlers anteriores (evita duplicação em re-renders ao mudar de tab)
    panel.off('.tblinline');

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
                    var _sRows = (typeof getMdashSampleData === 'function') ? getMdashSampleData('table') : [];
                    if (_sRows && _sRows.length) _af = Object.keys(_sRows[0]);
                }
                var $clist = panel.find('.mtbl-col-list');
                $clist.empty();
                if (_af.length) {
                    _af.forEach(function (f, idx) {
                        $clist.append(_tblColCard({
                            field: f,
                            title: f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' '),
                            visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext'
                        }, idx, _af));
                    });
                }
            }
        }
        // Tree toggle
        if ($(this).hasClass('mtbl-tree')) {
            panel.find('.mtbl-tree-opts').toggle(this.checked);
        }
        fire();
    });

    // Fonte change
    panel.on('change.tblinline', '.mcbi-fonte', function () {
        var fs = $(this).val();
        obj.fontestamp = fs;
        _mciAutoApplyFonteTransform(fs, obj, panel);
        var newFields = _mciGetFields(obj);
        _tblRefreshFieldSelects(panel, newFields);
        fire();
    });

    // Transform button
    panel.on('click.tblinline', '.mcbi-btn-transform', function () {
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        _mciOpenTransformModalFor(currentTC, obj, function (newT) {
            obj.transformConfig = newT;
            obj.transformconfigjson = JSON.stringify(newT);
            obj.config = obj.config || {};
            obj.config.transformConfig = newT;
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            var $ts = panel.find('.mcbi-transform-status');
            $ts.addClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transforma\u00e7\u00e3o: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
            var nf = _mciGetFields(obj);
            _tblRefreshFieldSelects(panel, nf);
            fire();
        });
    });

    // Theme buttons
    panel.on('click.tblinline', '.mtbl-theme-btn', function () {
        panel.find('.mtbl-theme-btn').each(function () {
            $(this).removeClass('is-on').css({ 'border-color': 'rgba(0,0,0,.08)', 'background': '#fff' });
        });
        var k = $(this).data('theme');
        var t = _tblResolveTheme(_TABLE_THEMES[k] || _TABLE_THEMES.phcPrimary);
        $(this).addClass('is-on').css({ 'border-color': t.accent, 'background': 'rgba(37,99,235,.06)' });
        // Sync style inputs from theme
        panel.find('.mtbl-hdrbg').val(t.headerBg);
        panel.find('.mtbl-hdrtext').val(t.headerText);
        panel.find('.mtbl-accent').val(t.accent);
        fire();
    });

    // Inputs change
    panel.on('input.tblinline change.tblinline', 'select, input[type="text"], input[type="number"], input[type="color"]', function () {
        fire();
    });

    // Add column
    panel.on('click.tblinline', '.mtbl-add-col', function () {
        var newFields = _mciGetFields(obj);
        if (!newFields.length) {
            var _sr = (typeof getMdashSampleData === 'function') ? getMdashSampleData('table') : [];
            if (_sr && _sr.length) newFields = Object.keys(_sr[0]);
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
        var idx = $list.find('.mtbl-col-card').length;
        $list.append(_tblColCard({ field: nextField, title: nextField, visible: true, hozAlign: 'left', sorter: 'string', formatter: 'plaintext' }, idx, newFields));
        fire();
    });

    // Remove column
    panel.on('click.tblinline', '.mtbl-col-remove', function () {
        $(this).closest('.mtbl-col-card').remove();
        fire();
    });
}

// ── Helpers de UI da tabela ──────────────────────────────────────────────────

function _tblFieldOpts(fields, current) {
    return '<option value="">-- campo --</option>'
        + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (current === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
}

function _tblColCard(col, idx, fields) {
    return '<div class="mtbl-col-card" data-idx="' + idx + '" style="padding:8px;border:1px solid rgba(0,0,0,.08);border-radius:7px;margin-bottom:4px;background:#fafbfc;">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<strong style="font-size:11px;color:#334155;">' + _mciEsc(col.title || col.field || 'Coluna') + '</strong>'
        + '<button type="button" class="mtbl-col-remove" style="border:none;background:none;color:#ef4444;cursor:pointer;font-size:13px;padding:0 2px;" title="Remover"><i class="glyphicon glyphicon-trash"></i></button>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">'
        + '<select class="mtbl-col-field form-control input-sm" style="font-size:10.5px;">'
        + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (col.field === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('')
        + '</select>'
        + '<input type="text" class="mtbl-col-title form-control input-sm" value="' + _mciEsc(col.title || '') + '" placeholder="T\u00edtulo" style="font-size:10.5px;">'
        + '<select class="mtbl-col-align form-control input-sm" style="font-size:10.5px;">'
        + _TABLE_ALIGNS.map(function (a) { return '<option value="' + a.value + '"' + ((col.hozAlign || 'left') === a.value ? ' selected' : '') + '>' + a.label + '</option>'; }).join('')
        + '</select>'
        + '<select class="mtbl-col-formatter form-control input-sm" style="font-size:10.5px;">'
        + _TABLE_FORMATTERS.map(function (f) { return '<option value="' + f.value + '"' + ((col.formatter || 'plaintext') === f.value ? ' selected' : '') + '>' + f.label + '</option>'; }).join('')
        + '</select>'
        + '</div>'
        + '<div style="display:flex;gap:8px;margin-top:4px;">'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-visible"' + (col.visible !== false ? ' checked' : '') + '> Vis\u00edvel</label>'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-frozen"' + (col.frozen ? ' checked' : '') + '> Congelar</label>'
        + '<label style="font-size:10px;color:#64748b;display:flex;align-items:center;gap:3px;"><input type="checkbox" class="mtbl-col-filter"' + (col.headerFilter !== false ? ' checked' : '') + '> Filtro</label>'
        + '</div></div>';
}

function _tblRefreshFieldSelects(panel, fields) {
    var opts = _tblFieldOpts(fields, '');
    panel.find('.mtbl-col-field, .mtbl-tree-parent, .mtbl-tree-child').each(function () {
        var cur = $(this).val();
        $(this).html(fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join(''));
    });
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
        panel.find('.mtbl-col-card').each(function () {
            cfg.columns.push({
                field: $(this).find('.mtbl-col-field').val(),
                title: $(this).find('.mtbl-col-title').val(),
                hozAlign: $(this).find('.mtbl-col-align').val() || 'left',
                formatter: $(this).find('.mtbl-col-formatter').val() || 'plaintext',
                visible: $(this).find('.mtbl-col-visible').is(':checked'),
                frozen: $(this).find('.mtbl-col-frozen').is(':checked'),
                headerFilter: $(this).find('.mtbl-col-filter').is(':checked'),
                sorter: 'string'
            });
        });
    }

    // Hierarquia
    cfg.dataTree = {
        enabled: panel.find('.mtbl-tree').is(':checked'),
        parentField: panel.find('.mtbl-tree-parent').val() || 'id',
        childField: panel.find('.mtbl-tree-child').val() || 'parentId',
        startExpanded: panel.find('.mtbl-tree-expand').is(':checked')
    };

    // Exporta\u00e7\u00e3o
    cfg.exportOptions = {
        enableExcel: panel.find('.mtbl-exp-excel').is(':checked'),
        enablePDF: panel.find('.mtbl-exp-pdf-chk').is(':checked')
    };

    // Estilo
    cfg.styling = {
        headerBg: panel.find('.mtbl-hdrbg').val() || '',
        headerText: panel.find('.mtbl-hdrtext').val() || '#f8fafc',
        accentColor: panel.find('.mtbl-accent').val() || '',
        borderRadius: parseInt(panel.find('.mtbl-radius').val(), 10) || 10,
        fontSize: parseInt(panel.find('.mtbl-fontsize').val(), 10) || 13
    };

    obj.config = cfg;
    obj.configjson = JSON.stringify(cfg);
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
                        formatter: { type: 'string', title: 'Formatador', 'enum': ['plaintext', 'number', 'money', 'tickCross', 'star', 'progress', 'color', 'link', 'html'] }
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
        { type: 'donut', label: 'Donut', svg: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="5"/><path d="M12 3A9 9 0 0 1 21 12" stroke="currentColor" stroke-width="5" opacity=".4" stroke-linecap="round"/></svg>' },
        { type: 'pie', label: 'Pizza', svg: '<svg viewBox="0 0 24 24"><path d="M12 12L12 2A10 10 0 0 1 22 12Z" fill="currentColor"/><path d="M12 12L22 12A10 10 0 0 1 6 21Z" fill="currentColor" opacity=".55"/><path d="M12 12L6 21A10 10 0 0 1 2 6Z" fill="currentColor" opacity=".3"/><path d="M12 12L2 6A10 10 0 0 1 12 2Z" fill="currentColor" opacity=".15"/></svg>' },
        { type: 'scatter', label: 'Dispersão', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="17" r="2.2"/><circle cx="9" cy="10" r="2.2"/><circle cx="14" cy="14" r="2.2"/><circle cx="19" cy="5" r="2.2"/><circle cx="21" cy="19" r="2.2"/><circle cx="7" cy="21" r="2.2"/></svg>' },
        { type: 'mixed', label: 'Misto', svg: '<svg viewBox="0 0 24 24"><rect x="1" y="11" width="5" height="12" rx="1.5" fill="currentColor" opacity=".85"/><rect x="9.5" y="7" width="5" height="16" rx="1.5" fill="currentColor" opacity=".85"/><rect x="18" y="13" width="5" height="10" rx="1.5" fill="currentColor" opacity=".85"/><polyline points="3.5,7 12,4 20.5,9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3.5" cy="7" r="2.2" fill="currentColor"/><circle cx="12" cy="4" r="2.2" fill="currentColor"/><circle cx="20.5" cy="9" r="2.2" fill="currentColor"/></svg>' },
        { type: 'funnel', label: 'Funil', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3L22 3L16 10L16 21L8 21L8 10Z" rx="1"/></svg>' }
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
        if (ct === 'bar_h') return _buildBarHOption(base, cfg, rows, t);
        return _buildCartesianOption(base, cfg, rows, t, ct);
    }

    function _tooltipBase(t, trigger) {
        return {
            trigger: trigger || 'axis',
            backgroundColor: t.tooltipBg,
            borderColor: 'transparent',
            padding: [10, 14],
            textStyle: { color: t.tooltipText, fontSize: 12 },
            extraCssText: 'border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.22);'
        };
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
                name: s.name || s.field,
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
                        var val = p.value != null ? (+p.value).toLocaleString('pt-PT', { maximumFractionDigits: 2 }) : '—';
                        out += '<div style="display:flex;align-items:center;gap:3px;padding:2px 0;">' + dot + '<span style="flex:1;opacity:0.85;">' + p.seriesName + '</span><strong style="margin-left:12px;">' + val + '</strong></div>';
                    });
                    return out;
                }
            }),
            legend: {
                show: lPos !== 'none', data: serDefs.map(function (s) { return s.name || s.field; }),
                top: lPos === 'bottom' ? 'bottom' : 'top', bottom: lPos === 'bottom' ? 6 : 'auto',
                left: 'center', itemWidth: 14, itemHeight: 8, borderRadius: 4,
                textStyle: { color: t.text, fontSize: 11 }, icon: 'roundRect', itemGap: 18
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
                axisLabel: { color: t.subtext, fontSize: 11 },
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
                name: s.name || s.field, type: 'bar',
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
            legend: { show: cfg.legend && cfg.legend.show !== false, orient: 'horizontal', bottom: 4, left: 'center', textStyle: { color: t.text, fontSize: 11 }, icon: 'circle' },
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
                name: s.name || s.field, type: 'scatter', symbolSize: s.symbolSize || 10,
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

    function _buildFunnelOption(base, cfg, rows, t) {
        var xField = cfg.xField || '';
        var vField = cfg.series && cfg.series.length > 0 ? cfg.series[0].field : '';
        var data = rows.map(function (r) { return { name: r[xField] || '?', value: parseFloat(r[vField]) || 0 }; })
            .sort(function (a, b) { return b.value - a.value; });
        return Object.assign({}, base, {
            tooltip: Object.assign(_tooltipBase(t, 'item'), {
                formatter: function (p) { return '<strong>' + p.name + '</strong>: ' + (+p.value).toLocaleString('pt-PT', { maximumFractionDigits: 2 }) + ' (' + p.percent + '%)'; }
            }),
            legend: { show: cfg.legend && cfg.legend.show !== false, orient: 'horizontal', bottom: 4, left: 'center', textStyle: { color: t.text, fontSize: 11 } },
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
        h += '<input type="color" class="mcb-sc" value="' + (s.color || '#2563EB') + '" title="Cor">';
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
            chart.setOption(option, true);
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

// Devolve [{field, type}] para uma fonte, por prioridade: schemajson → lastResultscached → PRAGMA.
function _mciGetFonteSchema(fonte) {
    if (!fonte) return [];
    if (fonte.schemajson) {
        try {
            var sc = JSON.parse(fonte.schemajson);
            if (Array.isArray(sc) && sc.length)
                return sc.map(function (c) { return { field: typeof c === 'string' ? c : (c.field || c.name || String(c)), type: c.type || 'TEXT' }; }).filter(function (c) { return c.field; });
        } catch (e) {}
    }
    if (fonte.lastResultscached) {
        try {
            var lrc = JSON.parse(fonte.lastResultscached);
            var cols = (lrc && Array.isArray(lrc.columns) && lrc.columns.length) ? lrc.columns
                : (Array.isArray(lrc) && lrc.length && typeof lrc[0] === 'object' ? Object.keys(lrc[0]) : null);
            if (cols) return cols.map(function (c) { return { field: c, type: 'TEXT' }; });
        } catch (e) {}
    }
    if (typeof MdashTransformBuilder !== 'undefined' && typeof mdashFonteTableName === 'function') {
        var tbl = mdashFonteTableName(fonte);
        if (tbl) return MdashTransformBuilder.getTableSchema(tbl);
    }
    return [];
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

    // 1. Carregar cache na DB in-memory
    if (typeof mdashExtractRowsFromCache === 'function' && typeof mdashLoadFonteIntoDb === 'function') {
        var _rows = mdashExtractRowsFromCache(fonte.lastResultscached);
        if (_rows.length) mdashLoadFonteIntoDb(fonte, _rows);
    }

    var tblName = (typeof mdashFonteTableName === 'function') ? mdashFonteTableName(fonte) : '';

    // 2. Derivar schema via helper centralizado
    var schema = _mciGetFonteSchema(fonte);

    // 3. Construir config passthrough (todas as colunas, sem filtros)
    var autoConf = tblName ? MTB.autoConfig(tblName, 'Gráfico') : { mode: 'builder', sourceTable: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null };
    if (!autoConf.columns.length && schema.length) {
        autoConf.sourceTable = tblName;
        autoConf.columns = schema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
    }
    // Guardar transformationSchema para resolução imediata de campos (evita re-execução)
    if (!autoConf.transformationSchema || !autoConf.transformationSchema.length) {
        autoConf.transformationSchema = (schema.length ? schema : autoConf.columns).map(function (s) { return s.field || s; }).filter(Boolean);
    }

    // 4. Persistir
    obj.transformConfig = autoConf;
    obj.transformconfigjson = JSON.stringify(autoConf);
    obj.config = obj.config || {};
    obj.config.transformConfig = autoConf;

    // 5. Actualizar UI se panel disponível
    if (panel) {
        var $ts = panel.find('.mcbi-transform-status');
        $ts.addClass('is-active');
        $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + (tblName || 'fonte') + '</strong>');
        $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
    }
}

function _mciGetFields(obj) {
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

function _mciRerender(obj) {
    var sel = '#mdash-slot-render-' + obj.mdashcontaineritemobjectstamp;
    if (!$(sel).length) return;
    var items = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    var ci = (items || []).find(function (x) { return x.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
    if (!ci) return;
    // Guardar scroll antes de re-render — Tabulator e outros componentes podem causar scroll durante init
    var _sTop = $(window).scrollTop();
    var _sLeft = $(window).scrollLeft();
    // Blur do elemento focado evita que o browser tente manter em viewport um elemento prestes a ser destruído
    if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
    obj.renderObjectByContainerItem(sel, ci);
    // Restaurar a 0ms (pós-render síncrono) e a 100ms (cobre init assíncrono do Tabulator)
    setTimeout(function () { $(window).scrollTop(_sTop); $(window).scrollLeft(_sLeft); }, 0);
    setTimeout(function () { $(window).scrollTop(_sTop); $(window).scrollLeft(_sLeft); }, 100);
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
        cfg.series = [];
        $root.find('.mcbi-sr').each(function () {
            var $r = $(this), fld = $r.find('.mcbi-sf').val() || '';
            cfg.series.push({
                field: fld, name: $r.find('.mcbi-sn').val().trim(), serType: $r.find('.mcbi-st').val() || 'default', stack: $r.find('.mcbi-sstack').val().trim(), color: $r.find('.mcbi-sc-phc').val() || $r.find('.mcbi-sc').val() || '', type: 'default',
                gradient: $r.find('.mcbi-s-gradient').is(':checked'),
                smooth: $r.find('.mcbi-s-smooth').is(':checked'),
                dataLabels: $r.find('.mcbi-s-labels').is(':checked'),
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
    cfg.yAxis = { show: $root.find('.mcbi-yshow').is(':checked'), name: $root.find('.mcbi-yname').val() || '' };
    cfg.legend = { show: $root.find('.mcbi-legend').is(':checked'), position: $root.find('.mcbi-legend-pos').val() || 'top' };
    cfg.title = { show: $root.find('.mcbi-title-show').is(':checked'), text: $root.find('.mcbi-title-text').val() || '' };
    cfg.tooltip = { show: true };
    cfg.transformConfig = cfg.transformConfig || null;
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
        + '<div class="mcbi-field"><label>Nome</label><input type="text" class="mcbi-sn form-control input-sm" value="' + _mciEsc(s.name || '') + '" placeholder="Nome da série"></div>'
        + '</div>'
        + '<div class="mcbi-sr-adv mcbi-row2">'
        + '<div class="mcbi-field"><label>Tipo</label><select class="mcbi-st form-control input-sm">' + stOpts + '</select></div>'
        + '<div class="mcbi-field"><label>Grupo stack</label><input type="text" class="mcbi-sstack form-control input-sm" value="' + _mciEsc(s.stack || '') + '" placeholder="ex: total"></div>'
        + '</div>'
        + '<div class="mcbi-field mcbi-sr-color-row">'
        + '<label>Cor</label>'
        + '<select class="mcbi-sc-phc form-control input-sm"><option value="">— Personalizada —</option>' + phcOpts + '</select>'
        + '<input type="color" class="mcbi-sc"' + (phcToken ? ' style="display:none"' : '') + ' value="' + hexColor + '">'
        + '</div>'
        + '<div class="mcbi-srs">'
        + '<div class="mcbi-srs-hd"><svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M2 4h12v1.5H2zM4 7.5h8V9H4zM6 11h4v1.5H6z"/></svg> Estilo da série</div>'
        + '<div class="mcbi-srs-general">'
        + '<div class="mcbi-row2" style="align-items:center">'
        + '<div class="mcbi-field" style="margin-bottom:0">' + _mciChkVal('mcbi-s-labels', 'Etiquetas', s.dataLabels === true) + '</div>'
        + '<div class="mcbi-field mcbi-s-labelcol-wrap" style="margin-bottom:0"><label>Cor etiqueta</label><input type="color" class="mcbi-s-labelcol" value="' + (s.labelColor || '#ffffff') + '"></div>'
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
// opts: { title, fonteName, modalId, hostId, config, schema, onSave }
function _mciOpenTransformModalFor(opts) {
    var MTB = window.MdashTransformBuilder || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
    if (!MTB) { if (typeof alertify !== 'undefined') alertify.error('MdashTransformBuilder não disponível.', 4000); return; }
    var modalId = opts.modalId || 'mcbi-generic-transform-modal';
    var hostId = opts.hostId || (modalId + '-host');
    $('#' + modalId).remove();
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
    MTB.render($('#' + hostId)[0], {
        config: opts.config,
        schema: (opts.schema && opts.schema.length) ? opts.schema : undefined,
        onSave: function (newT) { $modal.modal('hide'); if (opts.onSave) opts.onSave(newT); },
        onCancel: function () { $modal.modal('hide'); }
    });
    $modal.on('hidden.bs.modal', function () { $(this).remove(); });
    $modal.modal('show');
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
        + [0, 1, 2, 3, 4, 5].map(function (ci) { var cv = (cfg.piePaletteCustom && cfg.piePaletteCustom[ci]) || '#2563EB'; return '<input type="color" class="mcbi-custom-c" data-ci="' + ci + '" value="' + cv + '">'; }).join('')
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
        + '<input type="range" class="mcbi-height" min="150" max="800" step="10" value="' + (cfg.height || 320) + '"></div>';

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
            obj.configjson = JSON.stringify(newCfg);
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

        // Carregar cache na DB in-memory (para PRAGMA e botão Testar)
        if (_tFnt && typeof mdashExtractRowsFromCache === 'function' && typeof mdashLoadFonteIntoDb === 'function') {
            var _tRows = mdashExtractRowsFromCache(_tFnt.lastResultscached);
            if (_tRows.length > 0) mdashLoadFonteIntoDb(_tFnt, _tRows);
        }

        var _tSchema = _mciGetFonteSchema(_tFnt);
        var _tCfgRaw = obj.transformConfig || cfg.transformConfig || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'Gráfico') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        if (!_tConf.columns.length && _tSchema.length) {
            _tConf.sourceTable = _tName;
            _tConf.columns = _tSchema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
        }

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            modalId: 'mcbi-transform-modal',
            hostId: 'mcbi-transform-modal-host',
            config: _tConf,
            schema: _tSchema,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.transformconfigjson = JSON.stringify(newT);
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
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
        var _tSchema = _mciGetFonteSchema(_sFnt);
        var _tConf = existingTCfg || (_sName ? MTB.autoConfig(_sName, 'Série') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });

        _mciOpenTransformModalFor({
            title: 'Transformação da Série',
            fonteName: _sFntName,
            modalId: 'mcbi-sr-transform-modal',
            hostId: 'mcbi-sr-transform-modal-host',
            config: _tConf,
            schema: _tSchema,
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

    panel.off('.mcbi');

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
            var _fl = _fo ? _mciGetFonteSchema(_fo).map(function (s) { return s.field; }) : [];
            if (_fl.length) _mciSetSelectFields($sr.find('.mcbi-sf'), _fl, 'campo…');
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
        obj.fontestamp = $(this).val();
        _mciTransformInited = false;
        if (obj.fontestamp) {
            panel.find('.mcbi-sample-label').hide();
            // Auto-aplica transformação passthrough para a nova fonte
            _mciAutoApplyFonteTransform(obj.fontestamp, obj, panel);
        } else {
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
        }
        _mciRefreshFieldSelects(panel, _mciGetFields(obj));
        _mciRefreshXField(panel, obj);
        if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
        fire();
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
    // Toggle-switch checkboxes (immune to host-app CSS overrides)
    s += '.mcbi-checks{display:grid;grid-template-columns:1fr 1fr;gap:7px 10px;margin-bottom:8px;}';
    s += '.mcbi-chk{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#1e293b;cursor:pointer;margin:0;font-weight:500;line-height:1;user-select:none;}';
    s += '.mcbi-chk input[type=checkbox]{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}';
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

// ── Helper: sanitizar HTML (strip <script> e atributos on*) ─────────────────
function _htmlSanitize(html) {
    // Remove blocos <script>...</script>
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
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
    var rows = dados.data || [];
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var sel   = dados.containerSelector;

    // Transform fallback
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
            }
        } catch (e) { /* silêncio */ }
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
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }

    var _hasTrans = !!((obj.transformConfig && obj.transformConfig.sourceTable)
        || (cfg.transformConfig && cfg.transformConfig.sourceTable));

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
              + _mciEsc((obj.transformConfig && obj.transformConfig.sourceTable)
                  || (cfg.transformConfig && cfg.transformConfig.sourceTable) || 'SQL') + '</strong>'
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
    panel.off('.mhtmlinline');

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
        obj.fontestamp = $(this).val() || '';
        _mciAutoApplyFonteTransform(obj.fontestamp, obj, panel);
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
        if (_tFnt && typeof mdashExtractRowsFromCache === 'function' && typeof mdashLoadFonteIntoDb === 'function') {
            var _tRows = mdashExtractRowsFromCache(_tFnt.lastResultscached);
            if (_tRows.length > 0) mdashLoadFonteIntoDb(_tFnt, _tRows);
        }

        var _tSchema = _mciGetFonteSchema(_tFnt);
        var _tCfgRaw = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'HTML') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        if (!_tConf.columns.length && _tSchema.length) {
            _tConf.sourceTable = _tName;
            _tConf.columns = _tSchema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
        }

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            modalId: 'mhtml-transform-modal',
            hostId: 'mhtml-transform-modal-host',
            config: _tConf,
            schema: _tSchema,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.transformconfigjson = JSON.stringify(newT);
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
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
    obj.config    = cfg;
    obj.configjson = JSON.stringify(cfg);
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
        getSampleData: function () { return getMdashSampleData('table'); },
        sampleConfig: _TABLE_SAMPLE_CONFIG
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
    ]


}

// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO TEXTO — Fonte + Transformação + Editor Inline (padrão gráfico)
// ══════════════════════════════════════════════════════════════════════════════

var _TEXT_SAMPLE_CONFIG = {
    dataField: '', staticText: 'Texto personalizado aqui...',
    dataFormat: { type: 'text', locale: 'pt-PT', currency: 'EUR', currencyPosition: 'right', decimalSeparator: 'locale', minimumFractionDigits: 0, maximumFractionDigits: 2, prefix: '', suffix: '' },
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

    var rows = dados.data || [];
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
            console.warn('[MDash] renderObjectTexto fallback transform error:', e.message);
        }
    }
    if (rows.length === 0) {
        rows = getMdashSampleData('text');
        isSample = true;
    }

    var content = '';
    if (cfg.dataField && rows.length > 0) {
        if (cfg.content && cfg.content.multipleValues) {
            var values = rows.map(function (item) {
                return formatDataValue(item[cfg.dataField], cfg.dataFormat);
            });
            content = values.join(_txtGetSeparator(cfg));
        } else {
            content = formatDataValue(rows[0][cfg.dataField], cfg.dataFormat);
        }
    } else if (cfg.staticText) {
        content = cfg.staticText;
    } else {
        content = 'Texto personalizado aqui...';
    }

    var styles = _txtBuildStyles(cfg);
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';
    var textId = 'mtext_' + stamp;

    var html = badgeHtml + '<div id="' + textId + '" class="m-dash-text-element" style="' + styles + '">';
    if (cfg.content && cfg.content.htmlEnabled) {
        html += content;
    } else {
        html += $('<div>').text(content).html();
    }
    html += '</div>';
    $(dados.containerSelector).html(html);
}

function _txtBuildStyles(cfg) {
    var s = '';
    var tf = cfg.textFormat || {};
    s += 'font-size:' + (tf.fontSize || 18) + 'px;';
    s += 'font-weight:' + (tf.fontWeight || 'bold') + ';';
    s += 'font-style:' + (tf.fontStyle || 'normal') + ';';
    s += 'font-family:' + (tf.fontFamily || 'Nunito, sans-serif') + ';';
    s += 'text-align:' + (tf.textAlign || 'left') + ';';
    s += 'line-height:' + (tf.lineHeight || 1.5) + ';';
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
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = _txtNormalizeConfig(obj.config);
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var isSample = !obj.fontestamp;

    // Dados (fonte + transform)
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
        + '</div>';

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
        + '<input type="color" class="mtxt-textcolor" value="' + (cl.textColor || '#6d7c91') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Cor de fundo</label>'
        + '<input type="color" class="mtxt-bgcolor" value="' + (cl.backgroundColor && cl.backgroundColor !== 'transparent' ? cl.backgroundColor : '#ffffff') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
        + ' ' + _mciChk('mtxt-bgtransp', 'Transparente', cl.backgroundColor === 'transparent') + '</div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Cor da borda</label>'
        + '<input type="color" class="mtxt-bordercolor" value="' + (cl.borderColor && cl.borderColor !== 'transparent' ? cl.borderColor : '#cccccc') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
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
        + '<input type="color" class="mtxt-shcolor" value="' + (ef.shadowColor || '#666666') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
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
            obj.configjson = JSON.stringify(newCfg);
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
            _txtTimer = null;
            panel.removeData('_mciTimer');
        }, 300);
        panel.data('_mciTimer', _txtTimer);
    }

    // ── Transform Builder ────────────────────────────────────────────────────
    var _txtTransformInited = false;

    function _txtOpenTransformModal() {
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';
        var modalId = 'mcbi-transform-modal';
        $('#' + modalId).remove();
        _txtTransformInited = false;

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
            + '</div></div></div></div>';

        $('body').append(mHtml);
        var $modal = $('#' + modalId);
        $modal.modal('show');
        $modal.on('shown.bs.modal', function () { _txtInitTransform(); });
        $modal.on('hidden.bs.modal', function () { $(this).remove(); _txtTransformInited = false; });
    }

    function _txtInitTransform() {
        if (_txtTransformInited) return;
        var MTB = window.MdashTransformBuilder
            || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) {
            if (typeof alertify !== 'undefined') alertify.error('DATA SOURCE Operations.js não está carregado.', 6000);
            return;
        }
        _txtTransformInited = true;
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';

        if (_tFnt && typeof mdashExtractRowsFromCache === 'function' && typeof mdashLoadFonteIntoDb === 'function') {
            var _tRows = mdashExtractRowsFromCache(_tFnt.lastResultscached);
            if (_tRows.length > 0) mdashLoadFonteIntoDb(_tFnt, _tRows);
        }

        var _tSchema = _mciGetFonteSchema(_tFnt);
        var _tCfgRaw = obj.transformConfig || cfg.transformConfig || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'Texto') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        if (!_tConf.columns.length && _tSchema.length) {
            _tConf.sourceTable = _tName;
            _tConf.columns = _tSchema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
        }

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            modalId: 'mcbi-transform-modal',
            hostId: 'mcbi-transform-modal-host',
            config: _tConf,
            schema: _tSchema,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.transformconfigjson = JSON.stringify(newT);
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
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
    }

    // Section collapse
    panel.on('click.mcbi', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });

    panel.on('click.mcbi', '.mcbi-btn-transform', function () { _txtOpenTransformModal(); });

    // Fonte change
    panel.on('change.mcbi', '.mcbi-fonte', function () {
        obj.fontestamp = $(this).val();
        _txtTransformInited = false;
        if (obj.fontestamp) {
            panel.find('.mcbi-sample-label').hide();
            _mciAutoApplyFonteTransform(obj.fontestamp, obj, panel);
        } else {
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
        }
        var newFields = _mciGetFields(obj);
        fields = newFields;
        _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
        if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
        fire();
    });

    // Alignment buttons
    panel.on('click.mcbi', '.mtxt-align', function () {
        panel.find('.mtxt-align').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });

    // Checkbox toggles
    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    // Font size slider
    panel.on('input.mcbi', '.mtxt-fontsize', function () {
        panel.find('.mtxt-fs-lbl').text($(this).val()); fire();
    });

    // Line height slider
    panel.on('input.mcbi', '.mtxt-lineheight', function () {
        panel.find('.mtxt-lh-lbl').text($(this).val()); fire();
    });

    // All other inputs → fire
    panel.on('input.mcbi change.mcbi', 'input.form-control, select.form-control, input[type=color], input[type=number], input[type=range]', function () {
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
        suffix: panel.find('.mtxt-suffix').val() || ''
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

    cfg.transformConfig = cfg.transformConfig || null;
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
                    suffix: { type: "string", title: "Sufixo", 'default': "" }
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
                return formatDataValue(item[config.dataField], config.dataFormat);
            });
            content = values.join(_txtGetSeparator(config));
        } else {
            // Primeiro valor apenas
            var rawValue = data[0][config.dataField];
            content = formatDataValue(rawValue, config.dataFormat);
        }
    } else if (config.staticText) {
        // Usar texto estático
        content = config.staticText;
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
    if ((!formatConfig || !value) && (formatConfig.type != "currency" && formatConfig.type != "number")) return value;
    var formattedValue = value;

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
                formattedValue = value.toString();
        }
        // Adicionar prefixo e sufixo
        if (formatConfig.prefix) formattedValue = formatConfig.prefix + formattedValue;
        if (formatConfig.suffix) formattedValue = formattedValue + formatConfig.suffix;
    } catch (e) {
        console.warn("Erro na formatação do valor:", e);
        formattedValue = value;
    }
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
                            'enum': ["plaintext", "textarea", "number", "html", "money", "link", "datetime", "datetimediff", "tickCross", "color", "star", "traffic", "progress", "lookup", "buttonTick", "buttonCross", "rownum", "handle"],
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
        '<div id="mdash{{id}}" class="c-dashboardInfo {{classes}}" style="height:100%!important;{{styles}}">' +
        '<div class="wrap c-dashboardInfo_{{tipo}}">' +
        '<h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">' +
        '<span data-mdash-slot="title"></span> <i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '</h4>' +
        '<div data-mdash-slot="header" class="{{headerClasses}}"></div>' +
        '<div data-mdash-slot="body" class="m-dash-card-body-content dashcard-body"></div>' +
        '<div data-mdash-slot="footer" class="dashcard-footer"></div>' +
        '</div></div>';

    var _tplDashCardSnapshot =
        '<div id="{{id}}" class="m-dash-item snapshot {{classes}}" style="height:100%!important;{{styles}}">' +
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
        '<h1 data-mdash-slot="title" class="m-dash-item-title"></h1>' +
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
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-metrica {{classes}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-icon brd-card-advanced-icon-{{tipo}}">' +
        '<i data-mdash-slot="icon" class="material-symbols-rounded">analytics</i>' +
        '</div>' +
        '<div data-mdash-slot="body" class="brd-card-advanced-content"></div>' +
        '</div>';

    var _tplBrdStatus =
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-status {{classes}} brd-card-advanced-status-{{tipo}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-status-header">' +
        '<i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '<span data-mdash-slot="status-badge" class="brd-card-advanced-status-badge"></span>' +
        '</div>' +
        '<div data-mdash-slot="body" class="brd-card-advanced-status-body"></div>' +
        '</div>';

    var _tplBrdAlert =
        '<div id="{{id}}" class="brd-card-advanced brd-card-advanced-alert {{classes}} brd-card-advanced-alert-{{tipo}}" style="{{styles}}">' +
        '<div class="brd-card-advanced-alert-icon">' +
        '<i data-mdash-slot="icon" data-mdash-slot-mode="class"></i>' +
        '</div>' +
        '<div data-mdash-slot="body" class="brd-card-advanced-alert-content"></div>' +
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
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "body", label: "Conteúdo", type: "content", isMainContent: true }
    ]);

    var _slotsBrdStatus = JSON.stringify([
        { id: "icon", label: "Ícone", type: "icon" },
        { id: "status-badge", label: "Badge de Estado", type: "text" },
        { id: "body", label: "Corpo", type: "content", isMainContent: true }
    ]);

    var _slotsBrdAlert = JSON.stringify([
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
        // ───── BRD Status ─────
        { descricao: "Top Border Card Advanced - Status Primary", codigo: "brd_card_advanced_status_primary", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Success", codigo: "brd_card_advanced_status_success", tipo: "card", UIData: { tipo: "success" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Warning", codigo: "brd_card_advanced_status_warning", tipo: "card", UIData: { tipo: "warning" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Status Danger", codigo: "brd_card_advanced_status_danger", tipo: "card", UIData: { tipo: "danger" }, htmltemplate: _tplBrdStatus, csstemplate: "", slotsdefinition: _slotsBrdStatus, containerSelectorToRender: '[data-mdash-slot="body"]' },
        // ───── BRD Alert ─────
        { descricao: "Top Border Card Advanced - Alert Primary", codigo: "brd_card_advanced_alert_primary", tipo: "card", UIData: { tipo: "primary" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Success", codigo: "brd_card_advanced_alert_success", tipo: "card", UIData: { tipo: "success" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Warning", codigo: "brd_card_advanced_alert_warning", tipo: "card", UIData: { tipo: "warning" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' },
        { descricao: "Top Border Card Advanced - Alert Danger", codigo: "brd_card_advanced_alert_danger", tipo: "card", UIData: { tipo: "danger" }, htmltemplate: _tplBrdAlert, csstemplate: "", slotsdefinition: _slotsBrdAlert, containerSelectorToRender: '[data-mdash-slot="body"]' }
    ];
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
    dashboardCSS += "    padding: 40px 25px 20px;";
    dashboardCSS += "    height: 100%;";
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
    dashboardCSS += "}";

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
function loadModernDashboardStyles() {
    var primaryColor = getCachedColor("primary").background;
    var successColor = getCachedColor("success").background;
    var dangerColor = getCachedColor("danger").background;

    var builderCSS = "";

    builderCSS += ".mdash-builder-layout{display:flex;height:calc(100vh - 120px);gap:0;background:#f5f5f5;}";

    // Toolbox (left)
    builderCSS += ".mdash-toolbox{width:280px;background:white;border-right:1px solid #ddd;overflow-y:auto;display:flex;flex-direction:column;}";
    builderCSS += ".mdash-toolbox-header{padding:15px;border-bottom:1px solid #e0e0e0;background:" + primaryColor + ";color:white;font-weight:bold;font-size:14px;}";
    builderCSS += ".mdash-toolbox-section{border-bottom:1px solid #e0e0e0;}";
    builderCSS += ".mdash-toolbox-section-title{padding:12px 15px;background:#fafafa;font-weight:600;font-size:13px;color:#555;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;}";
    builderCSS += ".mdash-toolbox-section-title:hover{background:#f0f0f0;}";
    builderCSS += ".mdash-toolbox-section-title i{margin-right:8px;}";
    builderCSS += ".mdash-toolbox-section-body{padding:10px;}";
    builderCSS += ".mdash-toolbox-item{padding:10px 12px;margin-bottom:8px;background:white;border:2px dashed #ccc;border-radius:4px;cursor:move;transition:all 0.2s;font-size:13px;display:flex;align-items:center;}";
    builderCSS += ".mdash-toolbox-item:hover{background:#f9f9f9;border-color:" + primaryColor + ";box-shadow:0 2px 4px rgba(0,0,0,0.1);}";
    builderCSS += ".mdash-toolbox-item i{margin-right:8px;color:" + primaryColor + ";}";
    builderCSS += ".mdash-toolbox-item.mdash-dragging{opacity:0.5;transform:scale(0.95);}";
    builderCSS += ".mdash-toolbox-list-item{padding:8px 12px;margin-bottom:5px;background:#f9f9f9;border:1px solid #e0e0e0;border-radius:3px;cursor:pointer;transition:all 0.2s;font-size:12px;display:flex;align-items:center;justify-content:space-between;}";
    builderCSS += ".mdash-toolbox-list-item:hover{background:white;border-color:" + primaryColor + ";}";
    builderCSS += ".mdash-toolbox-list-item i{margin-right:6px;color:" + primaryColor + ";}";
    builderCSS += ".mdash-toolbox-list-item .btn{padding:2px 6px;margin-left:5px;}";

    // Canvas (center)
    builderCSS += ".mdash-canvas{flex:1;background:#f5f5f5;overflow-y:auto;display:flex;flex-direction:column;}";
    builderCSS += ".mdash-canvas-header{padding:15px 20px;background:white;border-bottom:2px solid #e0e0e0;display:flex;align-items:center;justify-content:space-between;}";
    builderCSS += ".mdash-canvas-header h3{margin:0;font-size:16px;font-weight:600;color:#333;}";
    builderCSS += ".mdash-canvas-actions{display:flex;gap:8px;}";
    builderCSS += ".mdash-canvas-body{flex:1;padding:20px;}";
    builderCSS += ".mdash-canvas-empty{text-align:center;padding:60px 20px;color:#999;}";
    builderCSS += ".mdash-canvas-empty i{font-size:48px;margin-bottom:15px;display:block;}";

    // Containers
    builderCSS += ".mdash-container-element{background:white;border:2px solid #ddd;border-radius:6px;margin-bottom:15px;transition:all 0.3s;}";
    builderCSS += ".mdash-container-element.mdash-selected{border-color:" + primaryColor + ";box-shadow:0 0 0 3px rgba(102,126,234,0.2);}";
    builderCSS += ".mdash-container-header{padding:12px 15px;background:#fafafa;border-bottom:1px solid #e0e0e0;cursor:move;display:flex;align-items:center;justify-content:space-between;user-select:none;}";
    builderCSS += ".mdash-container-header:hover{background:#f0f0f0;}";
    builderCSS += ".mdash-container-title{display:flex;align-items:center;font-weight:600;font-size:14px;color:#333;}";
    builderCSS += ".mdash-container-title i{margin-right:8px;color:" + primaryColor + ";}";
    builderCSS += ".mdash-container-actions{display:flex;gap:5px;}";
    builderCSS += ".mdash-container-body{padding:15px;min-height:80px;display:flex;flex-wrap:wrap;gap:10px;}";
    builderCSS += ".mdash-container-items-dropzone.mdash-dropzone-active{background:rgba(102,126,234,0.05);outline:2px dashed " + primaryColor + ";outline-offset:-2px;}";
    builderCSS += ".mdash-container-empty-items{width:100%;text-align:center;padding:30px;color:#999;font-size:13px;}";
    builderCSS += ".mdash-container-empty-items i{font-size:24px;margin-bottom:8px;display:block;}";

    // Items
    builderCSS += ".mdash-item-element{background:white;border:1px solid #ddd;border-radius:4px;transition:all 0.3s;min-height:60px;}";
    builderCSS += ".mdash-item-element.mdash-selected{border-color:" + successColor + ";box-shadow:0 0 0 2px rgba(16,185,129,0.2);}";
    builderCSS += ".mdash-item-element.mdash-col-1{flex:0 0 calc(8.33% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-2{flex:0 0 calc(16.66% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-3{flex:0 0 calc(25% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-4{flex:0 0 calc(33.33% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-5{flex:0 0 calc(41.66% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-6{flex:0 0 calc(50% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-7{flex:0 0 calc(58.33% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-8{flex:0 0 calc(66.66% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-9{flex:0 0 calc(75% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-10{flex:0 0 calc(83.33% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-11{flex:0 0 calc(91.66% - 10px);}";
    builderCSS += ".mdash-item-element.mdash-col-12{flex:0 0 calc(100% - 10px);}";
    builderCSS += ".mdash-item-content{padding:10px;}";
    builderCSS += ".mdash-item-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;cursor:move;user-select:none;}";
    builderCSS += ".mdash-item-header i{margin-right:6px;color:" + successColor + ";font-size:10px;}";
    builderCSS += ".mdash-item-header span{flex:1;font-weight:600;font-size:12px;color:#333;}";
    builderCSS += ".mdash-item-actions{display:flex;gap:3px;}";
    builderCSS += ".mdash-item-body{font-size:11px;color:#777;}";

    // Properties (right)
    builderCSS += ".mdash-properties{width:350px;background:white;border-left:1px solid #ddd;overflow-y:auto;display:flex;flex-direction:column;}";
    builderCSS += ".mdash-properties-header{padding:15px;border-bottom:1px solid #e0e0e0;background:" + primaryColor + ";color:white;font-weight:bold;font-size:14px;}";
    builderCSS += "#mdash-properties-panel{padding:15px;flex:1;}";
    builderCSS += "#mdash-properties-panel .form-group{margin-bottom:15px;}";
    builderCSS += "#mdash-properties-panel .form-group label{font-weight:600;font-size:12px;color:#555;margin-bottom:5px;}";
    builderCSS += "#mdash-properties-panel .form-control{font-size:13px;}";

    // Sortable effects
    builderCSS += ".mdash-sortable-ghost{opacity:0.4;background:rgba(102,126,234,0.1);}";
    builderCSS += ".mdash-sortable-chosen{cursor:grabbing !important;}";
    builderCSS += ".mdash-sortable-drag{opacity:0.8;box-shadow:0 4px 8px rgba(0,0,0,0.2);}";

    // Buttons
    builderCSS += ".btn-mdash-primary{background:" + primaryColor + ";color:white;border:none;}";
    builderCSS += ".btn-mdash-primary:hover{background:" + primaryColor + ";opacity:0.9;color:white;}";
    builderCSS += ".btn-mdash-success{background:" + successColor + ";color:white;border:none;}";
    builderCSS += ".btn-mdash-success:hover{background:" + successColor + ";opacity:0.9;color:white;}";

    // Responsive
    builderCSS += "@media (max-width:1200px){";
    builderCSS += ".mdash-toolbox{width:240px;}";
    builderCSS += ".mdash-properties{width:300px;}";
    builderCSS += "}";
    builderCSS += "@media (max-width:992px){";
    builderCSS += ".mdash-builder-layout{flex-direction:column;}";
    builderCSS += ".mdash-toolbox,.mdash-properties{width:100%;max-height:300px;}";
    builderCSS += "}";

    $('head').append('<style>' + builderCSS + '</style>');
    console.log('MDash 2.0 Builder styles loaded');
}
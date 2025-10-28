$(document).ready(function () {
    var styles = []
    addDashboardStyles(styles);
    addTabulatorStyles(styles);
    addBtnStyles(styles);
    var globalStyle = ""
    styles.forEach(function (style) {
        globalStyle += style;
    });
    $('head').append('<style>' + globalStyle + '</style>');
    applyTabulatorStylesWithJqueryMdash()
});


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
    tabulatorCSS += "    background-color:" + getColorByType("primary").background + ";";
    tabulatorCSS += "    border-bottom: none;";
    tabulatorCSS += "    border-radius: 10px 10px 0 0;";
    tabulatorCSS += "}";
    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col {";
    tabulatorCSS += "    background-color:" + getColorByType("primary").background;
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
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator .tabulator-col-resize-handle:hover {"
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-col:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    /* tabulatorCSS += ".tabulator-cell:hover ~ .tabulator-col-resize-handle {"
     tabulatorCSS += "border:6px solid " + getColorByType("primary").background + "!important;"
     tabulatorCSS += "}"*/
    tabulatorCSS += ".tabulator-cell:hover + .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    tabulatorCSS += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    tabulatorCSS += "}"
    tabulatorCSS += ".tabulator-cell input[type='checkbox'] {";
    tabulatorCSS + " -webkit-appearance: none!important;"
    tabulatorCSS += "border: 1px solid " + getColorByType("primary").background + "!important;";
    tabulatorCSS += "accent-color: " + getColorByType("warning").background + "!important;";
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
    tabulatorCSS += "    border-color: " + getColorByType("primary").background + "!important;";
    tabulatorCSS += "    background-color: " + getColorByType("primary").background + "!important;";
    tabulatorCSS += "    color: #fff!important;";
    tabulatorCSS += "}";

    styles.push(tabulatorCSS);
}
function applyTabulatorStylesWithJqueryMdash() {
    var customStyles = {}
    //console.log(("mrendThis.reportConfig", mrendThis.reportConfig)
    // Tabulator container
    $(".tabulator").css({
        "background-color": "white",
        "border-radius": "10px",
        "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "border": "none"
    });
    // Header
    $(".tabulator .tabulator-header").css({
        "background-color": customStyles.headerBackground ? customStyles.headerBackground : getColorByType("primary").background,
        "border-bottom": "none",
        "border-radius": "10px 10px 0 0",
        "padding": "13px"
    });
    // Header columns
    $(".tabulator .tabulator-header .tabulator-col").css({
        "background-color": customStyles.headerBackground ? customStyles.headerBackground : getColorByType("primary").background,
        "color": "white",
        "border-right": "none",
        /*  "padding": "12px 15px",*/
        "font-weight": "500"
    });
    $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
    $(".tabulator .tabulator-header .tabulator-col:last-child").css("border-top-right-radius", "10px");
    // Rows
    $(".tabulator-row").css({
        "border-bottom": "1px solid #e0e6ed",
        "transition": "background-color 0.2s ease"
    });
    // $(".tabulator-row.tabulator-row-even").css("background-color", "#fcfdfe");
    $(".tabulator-row")/*.hover(
        function () { $(this).css("background-color", "#f5f9ff"); },
        function () { $(this).css("background-color", ""); }
    );*/
    $(".tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid red");
    $(".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid #0000");

    // Cells
    $(".tabulator-cell").css({
        "padding": "12px 15px",
        "border-right": "none"
    });
    // Botão adicionar
    $(".btn-add").css({
        "margin": "0 0 15px 0",
        "padding": "10px 18px",
        "background-color": getColorByType("primary").background,
        "color": "white",
        "border": "none",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-weight": "500",
        "font-size": "14px",
        "transition": "all 0.2s ease",
        "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
    }).hover(
        function () {
            $(this).css({
                "background-color": "#06539e",
                "transform": "translateY(-1px)",
                "box-shadow": "0 4px 12px rgba(7, 101, 183, 0.3)"
            });
        },
        function () {
            $(this).css({
                "background-color": getColorByType("primary").background,
                "transform": "",
                "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
            });
        }
    );
    $(".btn-add i").css("margin-right", "6px");
    // Botões de ação
    $(".action-btn").css({
        "background": "none",
        "border": "none",
        //  "color": "#5a8de6",
        "cursor": "pointer",
        "font-size": "15px",
        "margin": "0 5px",
        "transition": "all 0.2s ease"
    }).hover(
        function () {
            $(this).css({
                //   "color": getColorByType("primary").background ,
                "transform": "scale(1.1)"
            });
        },
        function () {
            $(this).css({
                //   "color": "#5a8de6",
                "transform": ""
            });
        }
    );
    // Tree/indent
    $(".tabulator-row .tabulator-cell.tabulator-tree-col").css("padding-left", "15px");
    $(".tabulator-tree-branch").css({
        "border-left": "2px solid #d1e3ff",
        "margin-left": "7.5px"
    });
    $(".tabulator-tree-level-1 .tabulator-cell.tabulator-tree-col").css("padding-left", "30px");
    $(".tabulator-tree-level-2 .tabulator-cell.tabulator-tree-col").css("padding-left", "45px");
    $(".tabulator-tree-level-3 .tabulator-cell.tabulator-tree-col").css("padding-left", "60px");
    // Tree controls
    $(".tabulator-row .tabulator-cell .tabulator-data-tree-control").css({
        "align-items": "center",
        "background": "rgb(255 255 255 / 10%)",
        "border": "1px solid #2975dd",
        "border-radius": "2px",
        "display": "inline-flex",
        "height": "11px",
        "justify-content": "center",
        "margin-right": "5px",
        "overflow": "hidden",
        "vertical-align": "middle",
        "width": "11px"
    });
    $(".tabulator-tree-collapse, .tabulator-tree-expand").css({
        "color": getColorByType("primary").background,
        "border-radius": "50%",
        "width": "18px",
        "height": "18px",
        "display": "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        "margin-right": "8px",
        "transition": "all 0.2s ease"
    }).hover(
        function () { $(this).css("background-color", "rgba(7, 101, 183, 0.1)"); },
        function () { $(this).css("background-color", ""); }
    );
    // Edit list
    $(".tabulator-edit-list").css({
        "z-index": "9999",
        "position": "absolute",
        "border-radius": "6px",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.1)",
        "border": "1px solid #e0e6ed"
    });
    $(".tabulator-edit-list .tabulator-edit-list-item").css("padding", "8px 15px");
    $(".tabulator-edit-list .tabulator-edit-list-item.active").css({
        "background-color": "rgba(7, 101, 183, 0.1)",
        "color": getColorByType("primary").background
    });
    // Scrollbar (apenas para webkit browsers)
    // $("body").append('<style>::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; } ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }</style>');
}

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
function createDynamicSchemaGrafico(data) {
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
    var chartId = 'm-dash-grafico' + dados.itemObject.mdashcontaineritemobjectstamp;
    $("#" + chartId).remove(); // Remove any existing chart with the same ID
    var chartDomDiv = "<div style='width: 100%!important; height: " + (dados.config.chartContainer.height + "px" || "400px") + "; ' id='" + chartId + "' class='m-dash-grafico'></div>";

    $(dados.containerSelector).append(chartDomDiv);

    var chartElement = document.getElementById(chartId);
    var chartToRender = echarts.init(chartElement);

    updateChartOnContainer(chartToRender, dados.config, JSON.parse(JSON.stringify(dados.data)), chartId);
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
function getTiposObjectoConfig() {
    /*
     { tipo: 'chart', label: 'Gráfico', icon: '	fa fa-bar-chart' },
                { tipo: 'pie', label: 'Pizza', icon: '	fa fa-pie-chart' },
                { tipo: 'text', label: 'Texto', icon: 'fa fa-font' },
                { tipo: 'table', label: 'Tabela', icon: 'fa fa-table' },
                { tipo: 'customCode', label: 'Personalizado', icon: 'fa fa-code' }
    */
    return [{
        tipo: "Gráfico",
        descricao: "Gráfico",
        label: "Gráfico",
        icon: "fa fa-bar-chart",
        categoria: "editor",
        createDynamicSchema: createDynamicSchemaGrafico,
        renderObject: renderObjectGrafico
    },
    {
        tipo: "Pie",
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
        tipo: "Tabela",
        descricao: "Tabela",
        label: "Tabela",
        icon: "fa fa-table",
        categoria: "editor",
        createDynamicSchema: createTableSchema,
        renderObject: function (params) {
            var containerSelector = params.containerSelector;
            var itemObject = params.itemObject;
            var config = params.config;
            var data = params.data;
            if (!data || data.length === 0) {
                console.warn("Nenhum dado disponível para renderizar a tabela");
                return;
            }
            updateTable(containerSelector, itemObject, config, data);
        }
    },
    {
        tipo: "Texto",
        descricao: "Elemento de Texto",
        label: "Texto",
        icon: "fa fa-font",
        categoria: "editor",
        createDynamicSchema: function (data) {
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
                    // CAMPOS DE DADOS - IGUAL AOS OUTROS OBJETOS
                    dataField: {
                        type: "string",
                        title: "Campo de Dados",
                        'enum': fieldOptions,
                        description: "Campo dos dados que será exibido como texto"
                    },
                    staticText: {
                        type: "string",
                        title: "Texto Estático (alternativo)",
                        'default': "",
                        description: "Se não selecionar campo de dados, pode inserir texto fixo"
                    },
                    // Configurações de formatação de dados
                    dataFormat: {
                        type: "object",
                        title: "Formatação de Dados",
                        properties: {
                            type: {
                                type: "string",
                                title: "Tipo de Formatação",
                                'enum': ["text", "number", "currency", "percentage", "date"],
                                'default': "text"
                            },
                            locale: {
                                type: "string",
                                title: "Localização",
                                'enum': ["pt-PT", "pt-BR", "en-US", "en-GB", "fr-FR", "de-DE", "es-ES"],
                                'default': "pt-PT"
                            },
                            currency: {
                                type: "string",
                                title: "Código da Moeda",
                                'default': "EUR",
                                description: "Para tipo currency: EUR, USD, GBP, BRL"
                            },
                            currencyPosition: {
                                type: "string",
                                title: "Posição da Moeda",
                                'enum': ["left", "right"],
                                'default': "right",
                                description: "Posição do símbolo da moeda"
                            },
                            minimumFractionDigits: {
                                type: "integer",
                                title: "Mínimo de Casas Decimais",
                                'default': 0,
                                minimum: 0,
                                maximum: 20
                            },
                            maximumFractionDigits: {
                                type: "integer",
                                title: "Máximo de Casas Decimais",
                                'default': 2,
                                minimum: 0,
                                maximum: 20
                            },
                            prefix: {
                                type: "string",
                                title: "Prefixo",
                                'default': "",
                                description: "Texto antes do valor"
                            },
                            suffix: {
                                type: "string",
                                title: "Sufixo",
                                'default': "",
                                description: "Texto após o valor"
                            }
                        }
                    },
                    // Conteúdo do texto - MODIFICADO
                    content: {
                        type: "object",
                        title: "Configurações de Conteúdo",
                        properties: {
                            htmlEnabled: {
                                type: "boolean",
                                title: "Permitir HTML",
                                'default': false,
                                description: "Permite usar tags HTML no texto"
                            },
                            multipleValues: {
                                type: "boolean",
                                title: "Múltiplos Valores",
                                'default': false,
                                description: "Exibir todos os valores do campo (em vez de apenas o primeiro)"
                            },
                            separator: {
                                type: "string",
                                title: "Separador (para múltiplos valores)",
                                'default': ", ",
                                description: "Como separar múltiplos valores"
                            }
                        }
                    },
                    // Formatação de texto
                    textFormat: {
                        type: "object",
                        title: "Formatação do Texto",
                        properties: {
                            fontSize: {
                                type: "integer",
                                title: "Tamanho da Fonte (px)",
                                'default': 16,
                                minimum: 8,
                                maximum: 72
                            },
                            fontWeight: {
                                type: "string",
                                title: "Peso da Fonte",
                                'enum': ["normal", "bold", "lighter", "bolder", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
                                'default': "bold"
                            },
                            fontStyle: {
                                type: "string",
                                title: "Estilo da Fonte",
                                'enum': ["normal", "italic", "oblique"],
                                'default': "normal"
                            },
                            fontFamily: {
                                type: "string",
                                title: "Família da Fonte",
                                'enum': ["Arial", "Nunito, sans-serif", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Comic Sans MS", "Impact", "Trebuchet MS", "Arial Black"],
                                'default': "Nunito, sans-serif"
                            },
                            textAlign: {
                                type: "string",
                                title: "Alinhamento",
                                'enum': ["left", "center", "right", "justify"],
                                'default': "center"
                            },
                            lineHeight: {
                                type: "number",
                                title: "Altura da Linha",
                                'default': 1.5,
                                minimum: 0.5,
                                maximum: 3,
                                step: 0.1
                            }
                        }
                    },
                    // Cores
                    colors: {
                        type: "object",
                        title: "Cores",
                        properties: {
                            textColor: {
                                type: "string",
                                title: "Cor do Texto",
                                format: "color",
                                'default': "#333333"
                            },
                            backgroundColor: {
                                type: "string",
                                title: "Cor de Fundo",
                                format: "color",
                                'default': "#fff"
                            },
                            borderColor: {
                                type: "string",
                                title: "Cor da Borda",
                                format: "color",
                                'default': "transparent"
                            }
                        }
                    },
                    // Espaçamento e layout
                    spacing: {
                        type: "object",
                        title: "Espaçamento",
                        properties: {
                            paddingTop: {
                                type: "integer",
                                title: "Padding Superior (px)",
                                'default': 10,
                                minimum: 0,
                                maximum: 100
                            },
                            paddingRight: {
                                type: "integer",
                                title: "Padding Direito (px)",
                                'default': 10,
                                minimum: 0,
                                maximum: 100
                            },
                            paddingBottom: {
                                type: "integer",
                                title: "Padding Inferior (px)",
                                'default': 10,
                                minimum: 0,
                                maximum: 100
                            },
                            paddingLeft: {
                                type: "integer",
                                title: "Padding Esquerdo (px)",
                                'default': 10,
                                minimum: 0,
                                maximum: 100
                            },
                            marginTop: {
                                type: "integer",
                                title: "Margem Superior (px)",
                                'default': 0,
                                minimum: 0,
                                maximum: 100
                            },
                            marginBottom: {
                                type: "integer",
                                title: "Margem Inferior (px)",
                                'default': 0,
                                minimum: 0,
                                maximum: 100
                            }
                        }
                    },
                    // Bordas
                    border: {
                        type: "object",
                        title: "Bordas",
                        properties: {
                            width: {
                                type: "integer",
                                title: "Largura da Borda (px)",
                                'default': 0,
                                minimum: 0,
                                maximum: 20
                            },
                            style: {
                                type: "string",
                                title: "Estilo da Borda",
                                'enum': ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
                                'default': "solid"
                            },
                            radius: {
                                type: "integer",
                                title: "Raio da Borda (px)",
                                'default': 0,
                                minimum: 0,
                                maximum: 50
                            }
                        }
                    },
                    // Efeitos
                    effects: {
                        type: "object",
                        title: "Efeitos",
                        properties: {
                            textShadow: {
                                type: "boolean",
                                title: "Sombra do Texto",
                                'default': false
                            },
                            shadowColor: {
                                type: "string",
                                title: "Cor da Sombra",
                                format: "color",
                                'default': "#666666"
                            },
                            shadowBlur: {
                                type: "integer",
                                title: "Desfoque da Sombra (px)",
                                'default': 2,
                                minimum: 0,
                                maximum: 20
                            },
                            shadowOffsetX: {
                                type: "integer",
                                title: "Deslocamento X da Sombra (px)",
                                'default': 1,
                                minimum: -20,
                                maximum: 20
                            },
                            shadowOffsetY: {
                                type: "integer",
                                title: "Deslocamento Y da Sombra (px)",
                                'default': 1,
                                minimum: -20,
                                maximum: 20
                            }
                        }
                    },
                    // Dimensões
                    dimensions: {
                        type: "object",
                        title: "Dimensões",
                        properties: {
                            width: {
                                type: "string",
                                title: "Largura",
                                'enum': ["auto", "100%", "50%", "25%", "75%"],
                                'default': "100%"
                            },
                            height: {
                                type: "string",
                                title: "Altura",
                                'enum': ["auto", "100px", "200px", "300px", "400px"],
                                'default': "auto"
                            },
                            maxWidth: {
                                type: "string",
                                title: "Largura Máxima",
                                'enum': ["none", "100%", "500px", "800px", "1200px"],
                                'default': "none"
                            }
                        }
                    }
                }
            };
        },
        renderObject: function (params) {
            var containerSelector = params.containerSelector;
            var itemObject = params.itemObject;
            var config = params.config;
            var data = params.data;
            updateTextElement(containerSelector, itemObject, config, data);
        }
    },
    {
        tipo: "CustomCode",
        descricao: "Código Personalizado",
        label: "Personalizado",
        categoria: "custom",
        icon: "fa fa-code",
        createDynamicSchema: crateDynamicSchemaCustomCode,
        renderObject: function (params) {
            console.log("Renderizar código personalizado - não implementado");
        }
    },
    {
        tipo: "Detail",
        descricao: "Detalhe",
        label: "Detalhe",
        categoria: "detail",
        icon: "fa fa-ellipsis-h",
        createDynamicSchema: crateDynamicSchemaCustomCode,
        renderObject: function (params) {
            console.log("Renderizar código personalizado - não implementado");
        }
    }
    ]


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
            content = values.join(config.content.separator || ", ");
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
        styles += "font-size: " + (config.textFormat.fontSize || 16) + "px;";
        styles += "font-weight: " + (config.textFormat.fontWeight || "normal") + ";";
        styles += "font-style: " + (config.textFormat.fontStyle || "normal") + ";";
        styles += "font-family: " + (config.textFormat.fontFamily || "Arial") + ";";
        styles += "text-align: " + (config.textFormat.textAlign || "left") + ";";
        styles += "line-height: " + (config.textFormat.lineHeight || 1.5) + ";";
    }
    if (config.colors) {
        styles += "color: " + (config.colors.textColor || "#333333") + ";";
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
    try {
        switch (formatConfig.type) {
            case "number":
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 0,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2
                    }).format(num);
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
                        'default': true
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
            // NOVA SEÇÃO: Configurações de Cores
            styling: {
                type: "object",
                title: "Configuração de Cores",
                properties: {
                    headerBackgroundColor: {
                        type: "string",
                        title: "Cor de Fundo do Cabeçalho",
                        format: "color",
                        'default': getColorByType("primary").background
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
    try {
        // Destruir tabela existente se houver
        var existingTable = document.getElementById(tabelaId);
        if (existingTable) {
            existingTable.innerHTML = '';
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
        new Tabulator('#' + tabelaId, tabulatorConfig);
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




function getTemplateLayoutOptions() {
    return [
        {
            descricao: "Snapshot Layout v1",
            codigo: "snapshot_layout_v1",
            tipo: "snapshot",
            generateCard: generateDashCardInfo,
            UIData: {
                tipo: "primary"
            },
            containerSelectorToRender: ".m-dash-card-body-content"
        },
        {
            descricao: "Snapshot Layout v1 Warning",
            codigo: "snapshot_layout_v1_warning",
            tipo: "snapshot",
            UIData: {
                tipo: "warning"
            },
            generateCard: generateDashCardInfo,
            containerSelectorToRender: ".m-dash-card-body-content"
        },
        {
            descricao: "Snapshot layout v2",
            codigo: "snapshot_layout_v2",
            tipo: "snapshot",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardSnapshot,
            containerSelectorToRender: ".stats-card-body"
        },
        {
            descricao: "Snap card Warning",
            codigo: "snapshot_card_warning",
            tipo: "snapshot",
            UIData: {
                tipo: "warning"
            },
            generateCard: generateMDashCardSnapV2,
            containerSelectorToRender: ".m-dash-card-snap-v2-value"
        },
        {
            descricao: "Snap Card",
            codigo: "snap_card",
            tipo: "snapshot",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateMDashCardSnapV2,
            containerSelectorToRender: ".m-dash-card-snap-v2-value"
        },
        {
            descricao: "Snap Card Success",
            codigo: "snap_card_success",
            tipo: "snapshot",
            UIData: {
                tipo: "success"
            },
            generateCard: generateMDashCardSnapV2,
            containerSelectorToRender: ".m-dash-card-snap-v2-value"
        },
        {
            descricao: "Snap card Danger",
            codigo: "snapshot_card_danger",
            tipo: "snapshot",
            UIData: {
                tipo: "danger"
            },
            generateCard: generateMDashCardSnapV2,
            containerSelectorToRender: ".m-dash-card-snap-v2-value"
        },
        {
            descricao: "Card standard",
            codigo: "card_standard",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardStandard,
            containerSelectorToRender: ".m-dash-standard-card-body"
        },
        {
            descricao: "Card header destacado",
            codigo: "card_header_highlighted",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardHTML,
            containerSelectorToRender: ".dashcard-body"
        },
        {
            descricao: "Plain Card",
            codigo: "plain_card",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generatePlainCard,
            containerSelectorToRender: ".m-dash-plain-card-body-content"
        }
    ];
}

function generateDashCardHTML(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = '<div style="height: 100%!important;" id="' + (dashCard.id || '') + '" class="dashcard">';
    // Header
    cardHTML += '<div class="dashcard-header dashcard-header-' + (dashCard.type || "primary") + '">';
    cardHTML += '<span class="dashcard-title">' + (dashCard.title || "") + '</span>';
    cardHTML += '</div>';
    // Body
    cardHTML += '<div class="dashcard-body table-responsive">';
    cardHTML += (dashCard.bodyContent || "");
    cardHTML += '</div>';
    cardHTML += '</div>';
    return cardHTML.trim();
}


function generatePlainCard(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="mdash' + dashCard.id + '" class="m-dash-plain-card ' + dashCard.classes + '" style="height: 100%!important;' + dashCard.styles + '">';
    cardHTML += '  <div class="wrap m-dash-plain-card_' + dashCard.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += "";
    if (dashCard.icon) {
        cardHTML += ' <i class="' + dashCard.icon + '"></i>';
    }
    cardHTML += '    </h4>';
    if (dashCard.header) {
        cardHTML += '    <div class="' + dashCard.headerClasses + '">' + dashCard.header + '</div>';
    }
    cardHTML += '    <div class="m-dash-plain-card-body-content ">';
    cardHTML += dashCard.bodyContent;
    cardHTML += '    </div>';
    if (dashCard.footer) {
        cardHTML += '    <div class="m-dash-plain-card-footer">' + dashCard.footer + '</div>';
    }
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;

}

function generateDashCardInfo(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";
    cardHTML += '<div id="mdash' + dashCard.id + '" class="c-dashboardInfo ' + dashCard.classes + '" style="height: 100%!important;' + dashCard.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + dashCard.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += dashCard.title;
    if (dashCard.icon) {
        cardHTML += ' <i class="' + dashCard.icon + '"></i>';
    }
    cardHTML += '    </h4>';
    if (dashCard.header) {
        cardHTML += '    <div class="' + dashCard.headerClasses + '">' + dashCard.header + '</div>';
    }
    cardHTML += '    <div class="m-dash-card-body-content dashcard-body">';
    cardHTML += dashCard.bodyContent;
    cardHTML += '    </div>';
    if (dashCard.footer) {
        cardHTML += '    <div class="dashcard-footer">' + dashCard.footer + '</div>';
    }
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;

}


function MDashCard(data) {
    this.title = data.title || "";
    this.id = data.id || ""
    this.tipo = data.tipo || "primary";
    this.bodyContent = data.bodyContent || "";
    this.icon = data.icon || "";
    this.customData = data.customData || {};
    this.classes = data.classes || "";
    this.styles = data.styles || "";
    this.footer = data.footer || "";
    this.header = data.header || "";
    this.headerClasses = data.headerClasses || "";
    this.extraData = data.extraData || {};
}
MDashCard.prototype.generateDashCardInfo = function () {
    var cardHTML = "";
    cardHTML += '<div id="mdash' + this.id + '" class="c-dashboardInfo ' + this.classes + '" style="' + this.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + this.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += this.title;
    if (this.icon) {
        cardHTML += ' <i class="' + this.icon + '"></i>';
    }
    cardHTML += '    </h4>';
    if (this.header) {
        cardHTML += '    <div class="' + this.headerClasses + '">' + this.header + '</div>';
    }
    cardHTML += '    <div class="m-dash-card-body-content dashcard-body">';
    cardHTML += this.bodyContent;
    cardHTML += '    </div>';
    if (this.footer) {
        cardHTML += '    <div class="dashcard-footer">' + this.footer + '</div>';
    }
    cardHTML += '  </div>';
    cardHTML += '</div>';
    return cardHTML;
};
MDashCard.prototype.appendToBody = function (content) {
    $("#mdash" + this.id + " .m-dash-card-body-content").append(content);
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
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getColorByType("primary").background + " 0%, " + getColorByType("primary").background + " 100%);";
    dashboardCSS += "}";
    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_warning:after {";
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getColorByType("warning").background + " 0%, " + getColorByType("warning").background + " 100%);";
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
    dashboardCSS += "    background: linear-gradient(60deg, " + getColorByType("warning").background + ", " + getColorByType("warning").background + ");";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(187, 113, 16, 0.4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-success:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    // dashboardCSS += "    background: linear-gradient(60deg, #3ba94e, #3ba94e);";
    // dashboardCSS += "    background: linear-gradient(82.59deg, " + getColorByType("primary").background + " 0%, " + getColorByType("primary").background + " 100%);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(55, 119, 26, 0.4);";
    dashboardCSS += "}";
    dashboardCSS += ".dashcard .dashcard-header-primary:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(82.59deg, " + getColorByType("primary").background + " 0%, " + getColorByType("primary").background + " 100%);";
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
    dashboardCSS += "    background: linear-gradient(to right, " + getColorByType("primary").background + ", " + getColorByType("primary").background + ");";
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
    var color = getColorByType("primary").background;

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
    dashboardCSS += ".bg-primary{background:linear-gradient(135deg," + getColorByType("primary").background + "," + getColorByType("primary").background + ");}";
    dashboardCSS += ".bg-success{background:linear-gradient(135deg,#16a34a,#15803d);}";
    dashboardCSS += ".bg-warning{background:linear-gradient(135deg," + getColorByType("warning").background + "," + getColorByType("warning").background + ");}";
    dashboardCSS += ".bg-danger{background:linear-gradient(135deg,#ef4444,#b91c1c);}";
    dashboardCSS += ".bg-dark{background:linear-gradient(135deg,#334155,#0f172a);}";

    dashboardCSS += ".m-dash-card-snap-v2-icon i{transition:transform 0.4s ease;}";
    dashboardCSS += ".m-dash-card-snap-v2:hover .m-dash-card-snap-v2-icon i{transform:scale(1.15) rotate(5deg);}";

    dashboardCSS += ".budget-card{";
    dashboardCSS += "background: linear-gradient(135deg, " + getColorByType("primary").background + " 0%, " + getColorByType("primary").background + " 100%);";
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
    dashboardCSS += ".m-time-line-card.m-time-line-dentro-prazo .m-time-line-status-count{background:linear-gradient(135deg," + getColorByType("primary").background + "," + getColorByType("primary").background + ");}";
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

    styles.push(dashboardCSS);
}
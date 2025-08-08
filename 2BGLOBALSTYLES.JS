$(document).ready(function () {
    // Add global styles
    var styles = [];
    getSpinnerStyle(styles);
    getCollapseStyle(styles);
    addDashboardStyles(styles);
   // addDashboardStylesInfo(styles);

    var globalStyle = ""
    styles.forEach(function (style) {
        globalStyle += style;
    });
    $('head').append('<style>' + globalStyle + '</style>');


    $(document).on('click', '.home-collapse-header', function () {
        $(this).find(".glyphicon").toggleClass("glyphicon-triangle-bottom");
        //$(this).next("div").css("hidden");
        $(this).next("div").toggleClass("hidden");

    });
});



function getCollapseStyle(styles) {


    var collapseStyle = ""
    collapseStyle += ".pad {"
    collapseStyle += "    padding-top: 12px;"
    collapseStyle += "    padding-bottom: 12px;"
    collapseStyle += "  }"
    collapseStyle += ""
    collapseStyle += "  .home-collapse {"
    collapseStyle += "    background: transparent;"
    collapseStyle += "    border: 1px solid rgba(182, 182, 182, 0.5);"
    collapseStyle += "    display: flex;"
    collapseStyle += "    flex-direction: column;"
    collapseStyle += "    padding: 20px;"
    collapseStyle += "    line-height: 25px;"
    collapseStyle += "    border-radius: var(--border-radius);"
    collapseStyle += "    margin-bottom: 5px;"
    collapseStyle += "  }"
    collapseStyle += ""
    collapseStyle += "  .home-collapse-body {"
    collapseStyle += "     padding: 30px 0;"
    collapseStyle += "     display: flex;"
    collapseStyle += "     flex-direction: column;"
    collapseStyle += "     gap: 20px;"
    collapseStyle += "     -moz-transition: height 0.5s;"
    collapseStyle += "     -ms-transition: height 0.5s;"
    collapseStyle += "     -o-transition: height 0.5s;"
    collapseStyle += "     -webkit-transition: height 0.5s;"
    collapseStyle += "     transition: height 0.5s;"
    collapseStyle += "  }"
    collapseStyle += ""

    styles.push(collapseStyle);
    // Add the collapse style to the head




    /*$(document).on('input', 'input[data-type="digit"]', function () {
        var cleave = new Cleave(this, {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand', delimiter: " ",
        });
    });*/




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



function addDashboardStylesInfo(styles) {
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
    dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00a173 100%);";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_warning:after {";
    dashboardCSS += "    background: linear-gradient(82.59deg, #f79523 0%, #d88627 100%);";
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
    dashboardCSS += "    background: linear-gradient(60deg, #f79523, #f79523);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(187, 113, 16, 0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-success:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(60deg, #3ba94e, #3ba94e);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(55, 119, 26, 0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-primary:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00897B 100%);";
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
    dashboardCSS += "    background: linear-gradient(to right, #033076, #033076);";
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

    styles.push(dashboardCSS);
}


function addDashboardStyles(styles) {
    var dashboardCSS = '';

    dashboardCSS += '.c-dashboardInfo {';
    dashboardCSS += '    margin-bottom: 15px;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo .wrap {';
    dashboardCSS += '    background: #ffffff;';
    dashboardCSS += '    box-shadow: 2px 10px 20px rgba(0, 0, 0, 0.1);';
    dashboardCSS += '    border-radius: 7px;';
    dashboardCSS += '    text-align: center;';
    dashboardCSS += '    position: relative;';
    dashboardCSS += '    overflow: hidden;';
    dashboardCSS += '    padding: 40px 25px 20px;';
    dashboardCSS += '    height: 100%;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo__title,';
    dashboardCSS += '.c-dashboardInfo__subInfo {';
    dashboardCSS += '    color: #6c6c6c;';
    dashboardCSS += '    font-size: 1.18em;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo span {';
    dashboardCSS += '    display: block;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo__count {';
    dashboardCSS += '    font-weight: 600;';
    dashboardCSS += '    font-size: 2.5em;';
    dashboardCSS += '    line-height: 64px;';
    dashboardCSS += '    color: #323c43;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo .wrap:after {';
    dashboardCSS += '    display: block;';
    dashboardCSS += '    position: absolute;';
    dashboardCSS += '    top: 0;';
    dashboardCSS += '    left: 0;';
    dashboardCSS += '    width: 100%;';
    dashboardCSS += '    height: 7px;';
    dashboardCSS += '    content: "";';
    dashboardCSS += '}';

    // Obter cores dinâmicas do Bootstrap
    var primaryColors = getColorByType('primary');
    var warningColors = getColorByType('warning');
    var successColors = getColorByType('success');
    var dangerColors = getColorByType('danger');
    var infoColors = getColorByType('info');

    // Função para criar gradiente linear
    function createGradient(color) {
        return 'linear-gradient(82.59deg, ' + color + ' 0%, ' + color + ' 100%)';
    }

    // Primary
    dashboardCSS += '.c-dashboardInfo .c-dashboardInfo_primary:after {';
    dashboardCSS += '    background: ' + createGradient(primaryColors.background) + ';';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo_primary .c-dashboardInfo__count {';
    dashboardCSS += '    color: ' + primaryColors.background + ';';
    dashboardCSS += '}';

    // Warning
    dashboardCSS += '.c-dashboardInfo .c-dashboardInfo_warning:after {';
    dashboardCSS += '    background: ' + createGradient(warningColors.background) + ';';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo_warning .c-dashboardInfo__count {';
    dashboardCSS += '    color: ' + warningColors.background + ';';
    dashboardCSS += '}';

    // Success
    dashboardCSS += '.c-dashboardInfo .c-dashboardInfo_success:after {';
    dashboardCSS += '    background: ' + createGradient(successColors.background) + ';';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo_success .c-dashboardInfo__count {';
    dashboardCSS += '    color: ' + successColors.background + ';';
    dashboardCSS += '}';

    // Danger
    dashboardCSS += '.c-dashboardInfo .c-dashboardInfo_danger:after {';
    dashboardCSS += '    background: ' + createGradient(dangerColors.background) + ';';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo_danger .c-dashboardInfo__count {';
    dashboardCSS += '    color: ' + dangerColors.background + ';';
    dashboardCSS += '}';

    // Info
    dashboardCSS += '.c-dashboardInfo .c-dashboardInfo_info:after {';
    dashboardCSS += '    background: ' + createGradient(infoColors.background) + ';';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo_info .c-dashboardInfo__count {';
    dashboardCSS += '    color: ' + infoColors.background + ';';
    dashboardCSS += '}';

    // Restante do CSS...
    dashboardCSS += '.c-dashboardInfo__title svg {';
    dashboardCSS += '    color: #d7d7d7;';
    dashboardCSS += '    margin-left: 5px;';
    dashboardCSS += '}';

    dashboardCSS += '.c-dashboardInfo__title {';
    dashboardCSS += '    font-weight: 700;';
    dashboardCSS += '    font-size: 20px;';
    dashboardCSS += '}';

    // ...existing code...

    styles.push(dashboardCSS);
}




function generateButton(button) {
    var html = "<button";

    // add button attributes
    if (button.style) html += " style='" + button.style + "'";
    if (button.buttonId) html += " id='" + button.buttonId + "'";
    if (button.classes) html += " class='" + button.classes + "'";
    if (button.customData) html += " " + button.customData;

    // add onClick event
    if (button.onClick) {
        html += " onclick='" + button.onClick + "'";
    }

    html += ">" + button.label + "</button>";

    return html;
}



function generateCollapseHTML(collapseData) {
    // Start building up the collapse HTML string with the opening div
    var collapseHTML = '<div class="home-collapse" id="' + collapseData.id + '">';

    // Add the collapse header
    collapseHTML += '<div class="home-collapse-header mainformcptitulo">';
    collapseHTML += '<span class="glyphicon glyphicon-triangle-right">' + collapseData.title + '</span>';
    collapseHTML += '<div class="row"><span class="collapse-content">' + collapseData.headerContent + '</span></div>';
    collapseHTML += '</div>';

    // Add the collapse body with the provided content
    collapseHTML += '<div class="home-collapse-body hidden">';
    collapseHTML += '<p>' + collapseData.body + '</p>';
    collapseHTML += '</div>';

    // Close the collapse div
    collapseHTML += '</div>';

    return collapseHTML;
}

function getSpinnerStyle(styles) {

    var cssString = "";

    cssString += "@keyframes spinner {";
    cssString += "    to {";
    cssString += "        transform: rotate(360deg);";
    cssString += "    }";
    cssString += "}";
    cssString += ".spinner:before {";
    cssString += "    content: '';";
    cssString += "    box-sizing: border-box;";
    cssString += "    position: absolute;";
    cssString += "    top: calc(50% - 24px);";
    cssString += "    left: calc(50% - 24px);";
    cssString += "    width: 70px;";
    cssString += "    height: 70px;";
    cssString += "    margin-top: -12px;";
    cssString += "    margin-left: -12px;";
    cssString += "    border-radius: 50%;";
    cssString += "    border: 6px solid #6153d8;";
    cssString += "    border-top-color: #6153d8;";
    cssString += "    border-right-color: #1e00c7;";
    cssString += "    border-bottom-color: #08235f;";
    cssString += "    animation: spinner .6s linear infinite;";
    cssString += "}";
    cssString += ".overlay {";
    cssString += "    position: absolute;";
    cssString += "    display: none;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    right: 0;";
    cssString += "    bottom: 0;";
    cssString += "    background-color: rgba(0, 0, 0, 0.5);";
    cssString += "    z-index: 5;";
    cssString += "    cursor: pointer;";
    cssString += "}";
    cssString += ".spinner-overlay {";
    cssString += "    position: absolute;";
    cssString += "    display: none;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    right: 0;";
    cssString += "    bottom: 0;";
    cssString += "    background-color: rgba(0, 0, 0, 0.5);";
    cssString += "    z-index: 5;";
    cssString += "    cursor: pointer;";
    cssString += "}";
    cssString += ".main-spinner-overlay {";
    cssString += "    position: fixed;";
    cssString += "    display: block;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    right: 0;";
    cssString += "    bottom: 0;";
    cssString += "    background-color: rgba(255, 255, 255);";
    cssString += "    z-index: 5;";
    cssString += "    cursor: pointer;";
    cssString += "}";
    cssString += ".record {";
    cssString += "    position: fixed;";
    cssString += "    height: 100px;";
    cssString += "    width: 100px;";
    cssString += "    z-index: 999;";
    cssString += "    overflow: show;";
    cssString += "    margin: auto;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    bottom: 0;";
    cssString += "    right: 0;";
    cssString += "}";
    cssString += ".record::before {";
    cssString += "    background: url('spinnerLogo.png') no-repeat center center;";
    cssString += "    margin: auto;";
    cssString += "    display: flex;";
    cssString += "    position: absolute;";
    cssString += "    background-size: 90px;";
    cssString += "    content: '';";
    cssString += "    width: 300px;";
    cssString += "    height: 300px;";
    cssString += "    position: absolute;";
    cssString += "    height: 100px;";
    cssString += "    width: 100px;";
    cssString += "    position: fixed;";
    cssString += "    z-index: 999;";
    cssString += "    overflow: show;";
    cssString += "    margin: auto;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    bottom: 0;";
    cssString += "    right: 0;";
    cssString += "    border-radius: 25%;";
    cssString += "    animation: heartbeat 2.5s infinite;";
    cssString += "}";
    cssString += ".progressbarcontainer {";
    cssString += "    margin-top: calc(50% - 0px);";
    cssString += "}";
    cssString += ".progress-bar {";
    cssString += "    background-color: #0765b7 !important;";
    cssString += "}";
    cssString += "@keyframes heartbeat {";
    cssString += "    0% {";
    cssString += "        transform: scale(1);";
    cssString += "    }";
    cssString += "    25% {";
    cssString += "        transform: scale(1.2);";
    cssString += "    }";
    cssString += "    50% {";
    cssString += "        transform: scale(1);";
    cssString += "    }";
    cssString += "    75% {";
    cssString += "        transform: scale(1.2);";
    cssString += "    }";
    cssString += "    100% {";
    cssString += "        transform: scale(1);";
    cssString += "    }";
    cssString += "}";
    cssString += "@keyframes spin {";
    cssString += "    0% {";
    cssString += "        transform: rotate(0deg);";
    cssString += "    }";
    cssString += "    100% {";
    cssString += "        transform: rotate(360deg);";
    cssString += "    }";
    cssString += "}";
    cssString += ".file-input-container {";
    cssString += "    position: relative;";
    cssString += "    display: inline-block;";
    cssString += "}";
    cssString += ".file-input {";
    cssString += "    position: absolute;";
    cssString += "    opacity: 0;";
    cssString += "    top: 0;";
    cssString += "    left: 0;";
    cssString += "    width: 100%;";
    cssString += "    height: 100%;";
    cssString += "    cursor: pointer;";
    cssString += "}";
    cssString += ".custom-file-button {";
    cssString += "    background-color: #033076;";
    cssString += "    border: none;";
    cssString += "    color: white;";
    cssString += "    padding: 8px 16px;";
    cssString += "    text-align: center;";
    cssString += "    text-decoration: none;";
    cssString += "    display: inline-block;";
    cssString += "    font-size: 16px;";
    cssString += "    margin: 4px 2px;";
    cssString += "    cursor: pointer;";
    cssString += "    border-radius: 8px;";
    cssString += "}";
    cssString += ".file-name {";
    cssString += "    margin-left: 12px;";
    cssString += "    font-size: 14px;";
    cssString += "}";
    cssString += ".circle {";
    cssString += "    display: inline-block;";
    cssString += "    width: 20px;";
    cssString += "    height: 20px;";
    cssString += "    border-radius: 50%;";
    cssString += "    text-align: center;";
    cssString += "    line-height: 20px;";
    cssString += "    margin-right: 5px;";
    cssString += "    background-color: #3ba94e;";
    cssString += "}";
    cssString += ".sourceTabletableContainer table {";
    cssString += "    width: 100%;";
    cssString += "}";
    cssString += ".sourceTabletableContainer table thead th:nth-child(2),";
    cssString += ".sourceTabletableContainer table tbody td:nth-child(2) {";
    cssString += "    position: sticky;";
    cssString += "    left: 0;";
    cssString += "    z-index: 11;";
    cssString += "}";
    cssString += ".sourceTabletableContainertable tr th:not(:nth-child(2)),";
    cssString += ".sourceTabletableContainer table tr td:not(:nth-child(2)) {";
    cssString += "    z-index: -11;";
    cssString += "}";

    styles.push(cssString);

}
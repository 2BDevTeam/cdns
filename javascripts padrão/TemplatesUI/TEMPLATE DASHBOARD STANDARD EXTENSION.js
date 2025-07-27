
$(document).ready(function () {

    var styles = []

    addDashboardStyles(styles);
    var globalStyle = ""
    styles.forEach(function (style) {
        globalStyle += style;
    });
    $('head').append('<style>' + globalStyle + '</style>');
});


function generateDashCardSnapshot(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";

    cardHTML += '<div id="' + (dashCard.id || 'snapshot-' + generateUUID()) + '" class="m-dash-item snapshot ' + (dashCard.classes || '') + '" style="' + (dashCard.styles || '') + '">';
    cardHTML += '  <div class="stats-card-value-container">';
    cardHTML += '    <span class="stats-card-label">' + (dashCard.title || "") + '</span>';
    cardHTML += '    <span class="stats-card-value">' + (dashCard.bodyContent || "") + '</span>';
    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;
}

function generateDashCardStandard(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";

    cardHTML += '<div id="' + dashCard.id + '" class="m-dash-item ' + (dashCard.classes || '') + '" style="' + (dashCard.styles || '') + '">';
    cardHTML += '  <h1 class="m-dash-item-title">' + (dashCard.title || "Gráfico") + '</h1>';

    cardHTML += dashCard.bodyContent || "";
    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;
}

function getTemplateLayoutOptions() {

    return [
        {
            descricao: "Snapshot Layout v1",
            codigo: "snapshot_layout_v1",
            tipo: "snapshot",
            generateCard: generateDashCardInfo
        },
        {
            descricao: "Snapshot layout v2",
            codigo: "snapshot_layout_v2",
            tipo: "snapshot",
            generateCard: generateDashCardSnapshot
        },
        {
            descricao: "Card standard",
            codigo: "card_standard",
            tipo: "card",
            generateCard: generateDashCardStandard
        },
        {
            descricao: "Card header destacado",
            codigo: "card_header_highlighted",
            tipo: "card",
            generateCard: generateDashCardHTML
        },
    ];

}


function generateDashCardHTML(cardData) {

    var dashCard = new MDashCard(cardData);
    var cardHTML = '<div id="' + (dashCard.id || '') + '" class="dashcard">';
    // Header
    cardHTML += '<div class="dashcard-header dashcard-header-' + (dashCard.type || "primary") + '">';
    cardHTML += '<span class="dashcard-title">' + (dashCard.title || "") + '</span>';
    cardHTML += '</div>';
    // Body
    cardHTML += '<div class="dashcard-body">';
    cardHTML += (dashCard.bodyContent || "");
    cardHTML += '</div>';
    cardHTML += '</div>';
    return cardHTML.trim();
}


function generateDashCardInfo(cardData) {

    var dashCard = new MDashCard(cardData);

    var cardHTML = "";

    cardHTML += '<div id="mdash' + dashCard.id + '" class="c-dashboardInfo ' + dashCard.classes + '" style="' + dashCard.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + dashCard.type + '">';
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
    this.type = data.type || "primary";
    this.bodyContent = data.bodyContent || "";
    this.icon = data.icon || "";
    this.customData = data.customData || {};
    this.classes = data.classes || "";
    this.styles = data.styles || "";
    this.footer = data.footer || "";
    this.header = data.header || "";
    this.headerClasses = data.headerClasses || "";

}

MDashCard.prototype.generateDashCardInfo = function () {
    var cardHTML = "";

    cardHTML += '<div id="mdash' + this.id + '" class="c-dashboardInfo ' + this.classes + '" style="' + this.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + this.type + '">';
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







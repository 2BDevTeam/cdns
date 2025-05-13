$(document).ready(function () {
    // Add global styles
    var styles = [];
    getSpinnerStyle(styles);
    getCollapseStyle(styles);

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
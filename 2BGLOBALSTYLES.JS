$(document).ready(function () {
    // Add global styles
    var styles = [];
    getSpinnerStyle(styles);
    getCollapseStyle(styles);
   // addDashboardStyles(styles);
    getMdashStyles(styles);
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
    var collapseHTML = '<div style="padding: 20px 20px 5px 20px" class="home-collapse" id="' + collapseData.id + '">';

    // Add the collapse header
    collapseHTML += '<div class="home-collapse-header mainformcptitulo">';
    collapseHTML += '<p style="font-family:Nunito, sans-serif;"><span class="glyphicon glyphicon-triangle-right"></span> ' + collapseData.title + '</p>';
   // collapseHTML += '<div class="row"><span class="collapse-content">' + collapseData.headerContent + '</span></div>';
    collapseHTML += '</div>';

    // Add the collapse body with the provided content
    collapseHTML += '<div class="home-collapse-body hidden">';
    collapseHTML += '<p>' + collapseData.body + '</p>';
    collapseHTML += '</div>';

    // Close the collapse div
    collapseHTML += '</div>';

    return collapseHTML;
}



function getMdashStyles(gbStyles){

    var styles = "";
    styles += "/* MDash 2.0 Modern Styles */";
    styles += ".mdash-modern-header {";
    styles += "  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
    styles += "  color: white;";
    styles += "  padding: 15px 30px;";
    styles += "  display: flex;";
    styles += "  justify-content: space-between;";
    styles += "  align-items: center;";
    styles += "  box-shadow: 0 2px 10px rgba(0,0,0,0.1);";
    styles += "}";
    styles += ".mdash-header-title {";
    styles += "  display: flex;";
    styles += "  align-items: center;";
    styles += "  gap: 15px;";
    styles += "}";
    styles += ".mdash-header-title h1 {";
    styles += "  margin: 0;";
    styles += "  font-size: 24px;";
    styles += "  font-weight: 600;";
    styles += "}";
    styles += ".mdash-header-actions {";
    styles += "  display: flex;";
    styles += "  gap: 10px;";
    styles += "}";
    styles += ".mdash-btn {";
    styles += "  background: rgba(255,255,255,0.2);";
    styles += "  border: 1px solid rgba(255,255,255,0.3);";
    styles += "  color: white;";
    styles += "  padding: 8px 16px;";
    styles += "  border-radius: 6px;";
    styles += "  cursor: pointer;";
    styles += "  transition: all 0.3s;";
    styles += "  font-size: 14px;";
    styles += "  display: inline-flex;";
    styles += "  align-items: center;";
    styles += "  gap: 6px;";
    styles += "}";
    styles += ".mdash-btn:hover {";
    styles += "  background: rgba(255,255,255,0.3);";
    styles += "}";
    styles += ".mdash-btn-primary {";
    styles += "  background: #48bb78;";
    styles += "  border-color: #48bb78;";
    styles += "}";
    styles += ".mdash-btn-primary:hover {";
    styles += "  background: #38a169;";
    styles += "}";
    styles += ".mdash-btn-secondary {";
    styles += "  background: transparent;";
    styles += "}";
    styles += ".mdash-btn-block {";
    styles += "  width: 100%;";
    styles += "  justify-content: center;";
    styles += "}";
    styles += ".mdash-modern-workspace {";
    styles += "  display: flex;";
    styles += "  height: calc(100vh - 60px);";
    styles += "  overflow: hidden;";
    styles += "}";
    styles += "/* Toolbox */";
    styles += ".mdash-toolbox {";
    styles += "  width: 280px;";
    styles += "  background: white;";
    styles += "  border-right: 1px solid #e1e8ed;";
    styles += "  overflow-y: auto;";
    styles += "  padding: 20px;";
    styles += "}";
    styles += ".mdash-toolbox-section {";
    styles += "  margin-bottom: 30px;";
    styles += "}";
    styles += ".mdash-toolbox-section h3 {";
    styles += "  font-size: 12px;";
    styles += "  font-weight: 700;";
    styles += "  color: #718096;";
    styles += "  margin-bottom: 15px;";
    styles += "  letter-spacing: 1px;";
    styles += "}";
    styles += ".mdash-toolbox-section-content {";
    styles += "  padding: 10px 0;";
    styles += "}";
    styles += ".mdash-toolbox-item {";
    styles += "  background: #f7fafc;";
    styles += "  border: 2px solid #e2e8f0;";
    styles += "  border-radius: 8px;";
    styles += "  padding: 12px;";
    styles += "  margin-bottom: 10px;";
    styles += "  cursor: move;";
    styles += "  display: flex;";
    styles += "  align-items: center;";
    styles += "  gap: 10px;";
    styles += "  transition: all 0.2s;";
    styles += "}";
    styles += ".mdash-toolbox-item:hover {";
    styles += "  background: #edf2f7;";
    styles += "  border-color: #667eea;";
    styles += "  transform: translateY(-2px);";
    styles += "  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);";
    styles += "}";
    styles += ".mdash-toolbox-item i {";
    styles += "  font-size: 20px;";
    styles += "  color: #667eea;";
    styles += "}";
    styles += ".mdash-toolbox-item span {";
    styles += "  font-size: 14px;";
    styles += "  font-weight: 500;";
    styles += "  color: #4a5568;";
    styles += "}";
    styles += ".mdash-toolbox-item.mdash-dragging {";
    styles += "  opacity: 0.5;";
    styles += "}";
    styles += "/* Data Sources & Filters Lists */";
    styles += ".mdash-data-sources-list, .mdash-filters-list {";
    styles += "  margin-top: 10px;";
    styles += "}";
    styles += ".mdash-data-source-item, .mdash-filter-item {";
    styles += "  background: #f7fafc;";
    styles += "  border: 1px solid #e2e8f0;";
    styles += "  border-radius: 6px;";
    styles += "  padding: 10px;";
    styles += "  margin-bottom: 8px;";
    styles += "  display: flex;";
    styles += "  justify-content: space-between;";
    styles += "  align-items: center;";
    styles += "  cursor: pointer;";
    styles += "  transition: all 0.2s;";
    styles += "}";
    styles += ".mdash-data-source-item:hover, .mdash-filter-item:hover {";
    styles += "  background: #edf2f7;";
    styles += "  border-color: #cbd5e0;";
    styles += "}";
    styles += ".mdash-data-source-info, .mdash-filter-info {";
    styles += "  display: flex;";
    styles += "  flex-direction: column;";
    styles += "}";
    styles += ".mdash-data-source-info strong, .mdash-filter-info strong {";
    styles += "  font-size: 13px;";
    styles += "  color: #2d3748;";
    styles += "}";
    styles += ".mdash-data-source-info small, .mdash-filter-info small {";
    styles += "  font-size: 11px;";
    styles += "  color: #718096;";
    styles += "}";
    styles += ".mdash-btn-icon-small {";
    styles += "  background: transparent;";
    styles += "  border: none;";
    styles += "  color: #cbd5e0;";
    styles += "  cursor: pointer;";
    styles += "  padding: 4px;";
    styles += "  transition: color 0.2s;";
    styles += "}";
    styles += ".mdash-btn-icon-small:hover {";
    styles += "  color: #e53e3e;";
    styles += "}";
    styles += "/* Canvas */";
    styles += ".mdash-canvas {";
    styles += "  flex: 1;";
    styles += "  background: #f5f7fa;";
    styles += "  overflow-y: auto;";
    styles += "  padding: 30px;";
    styles += "}";
    styles += ".mdash-canvas-container {";
    styles += "  background: white;";
    styles += "  border-radius: 12px;";
    styles += "  box-shadow: 0 4px 20px rgba(0,0,0,0.08);";
    styles += "  padding: 30px;";
    styles += "  min-height: 600px;";
    styles += "}";
    styles += ".mdash-canvas-empty-state {";
    styles += "  display: flex;";
    styles += "  flex-direction: column;";
    styles += "  align-items: center;";
    styles += "  justify-content: center;";
    styles += "  height: 500px;";
    styles += "  border: 2px dashed #cbd5e0;";
    styles += "  border-radius: 12px;";
    styles += "  color: #a0aec0;";
    styles += "}";
    styles += ".mdash-canvas-empty-state i {";
    styles += "  font-size: 64px;";
    styles += "  margin-bottom: 20px;";
    styles += "}";
    styles += ".mdash-canvas-empty-state p {";
    styles += "  font-size: 18px;";
    styles += "  margin: 0;";
    styles += "}";
    styles += ".mdash-drop-over {";
    styles += "  background: rgba(102, 126, 234, 0.05);";
    styles += "}";
    styles += "/* Container Row */";
    styles += ".mdash-container-row {";
    styles += "  border: 2px dashed #cbd5e0;";
    styles += "  border-radius: 8px;";
    styles += "  padding: 15px;";
    styles += "  margin-bottom: 20px;";
    styles += "  transition: all 0.2s;";
    styles += "  position: relative;";
    styles += "}";
    styles += ".mdash-container-row:hover {";
    styles += "  border-color: #667eea;";
    styles += "  background: #f7fafc;";
    styles += "}";
    styles += ".mdash-container-row-header {";
    styles += "  display: flex;";
    styles += "  align-items: center;";
    styles += "  gap: 10px;";
    styles += "  margin-bottom: 15px;";
    styles += "}";
    styles += ".mdash-drag-handle {";
    styles += "  cursor: move;";
    styles += "  color: #cbd5e0;";
    styles += "  transition: color 0.2s;";
    styles += "}";
    styles += ".mdash-drag-handle:hover {";
    styles += "  color: #667eea;";
    styles += "}";
    styles += ".mdash-container-row-label {";
    styles += "  font-weight: 600;";
    styles += "  color: #4a5568;";
    styles += "  flex: 1;";
    styles += "}";
    styles += ".mdash-container-row-actions {";
    styles += "  display: flex;";
    styles += "  gap: 5px;";
    styles += "}";
    styles += ".mdash-btn-icon {";
    styles += "  background: white;";
    styles += "  border: 1px solid #e2e8f0;";
    styles += "  padding: 4px 8px;";
    styles += "  border-radius: 4px;";
    styles += "  cursor: pointer;";
    styles += "  color: #718096;";
    styles += "  transition: all 0.2s;";
    styles += "}";
    styles += ".mdash-btn-icon:hover {";
    styles += "  background: #f7fafc;";
    styles += "  border-color: #667eea;";
    styles += "  color: #667eea;";
    styles += "}";
    styles += ".mdash-container-row-content {";
    styles += "  min-height: 100px;";
    styles += "  position: relative;";
    styles += "}";
    styles += ".mdash-container-row-empty {";
    styles += "  display: flex;";
    styles += "  align-items: center;";
    styles += "  justify-content: center;";
    styles += "  height: 100px;";
    styles += "  border: 1px dashed #cbd5e0;";
    styles += "  border-radius: 6px;";
    styles += "  color: #a0aec0;";
    styles += "  font-size: 14px;";
    styles += "}";
    styles += "/* Cards */";
    styles += ".mdash-card {";
    styles += "  padding: 10px;";
    styles += "  margin-bottom: 15px;";
    styles += "}";
    styles += ".mdash-card-inner {";
    styles += "  background: white;";
    styles += "  border: 2px solid #e2e8f0;";
    styles += "  border-radius: 8px;";
    styles += "  padding: 20px;";
    styles += "  position: relative;";
    styles += "  transition: all 0.2s;";
    styles += "  cursor: pointer;";
    styles += "}";
    styles += ".mdash-card-inner:hover {";
    styles += "  border-color: #667eea;";
    styles += "  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);";
    styles += "}";
    styles += ".mdash-card.mdash-selected .mdash-card-inner {";
    styles += "  border-color: #667eea;";
    styles += "  background: rgba(102, 126, 234, 0.02);";
    styles += "  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);";
    styles += "}";
    styles += ".mdash-card-drag-handle {";
    styles += "  position: absolute;";
    styles += "  top: 10px;";
    styles += "  left: 10px;";
    styles += "  cursor: move;";
    styles += "  color: #cbd5e0;";
    styles += "  opacity: 0;";
    styles += "  transition: opacity 0.2s;";
    styles += "}";
    styles += ".mdash-card-inner:hover .mdash-card-drag-handle {";
    styles += "  opacity: 1;";
    styles += "}";
    styles += ".mdash-card-actions {";
    styles += "  position: absolute;";
    styles += "  top: 10px;";
    styles += "  right: 10px;";
    styles += "  display: flex;";
    styles += "  gap: 5px;";
    styles += "  opacity: 0;";
    styles += "  transition: opacity 0.2s;";
    styles += "}";
    styles += ".mdash-card-inner:hover .mdash-card-actions {";
    styles += "  opacity: 1;";
    styles += "}";
    styles += ".mdash-card-content {";
    styles += "  text-align: center;";
    styles += "  padding: 20px 0;";
    styles += "}";
    styles += ".mdash-card-icon {";
    styles += "  font-size: 48px;";
    styles += "  color: #667eea;";
    styles += "  margin-bottom: 15px;";
    styles += "}";
    styles += ".mdash-card-content h4 {";
    styles += "  margin: 0 0 5px 0;";
    styles += "  font-size: 16px;";
    styles += "  font-weight: 600;";
    styles += "  color: #2d3748;";
    styles += "}";
    styles += ".mdash-card-type {";
    styles += "  font-size: 12px;";
    styles += "  color: #718096;";
    styles += "  margin: 0;";
    styles += "  text-transform: uppercase;";
    styles += "  letter-spacing: 0.5px;";
    styles += "}";
    styles += ".mdash-sortable-placeholder {";
    styles += "  border: 2px dashed #667eea !important;";
    styles += "  background: #f0f4ff !important;";
    styles += "  visibility: visible !important;";
    styles += "}";
    styles += ".mdash-card-placeholder {";
    styles += "  border: 2px dashed #667eea !important;";
    styles += "  background: rgba(102, 126, 234, 0.1) !important;";
    styles += "  visibility: visible !important;";
    styles += "}";
    styles += "/* Properties Panel */";
    styles += ".mdash-properties {";
    styles += "  width: 350px;";
    styles += "  background: white;";
    styles += "  border-left: 1px solid #e1e8ed;";
    styles += "  overflow-y: auto;";
    styles += "  padding: 20px;";
    styles += "}";
    styles += ".mdash-no-selection {";
    styles += "  display: flex;";
    styles += "  flex-direction: column;";
    styles += "  align-items: center;";
    styles += "  justify-content: center;";
    styles += "  height: 400px;";
    styles += "  color: #a0aec0;";
    styles += "}";
    styles += ".mdash-no-selection i {";
    styles += "  font-size: 48px;";
    styles += "  margin-bottom: 15px;";
    styles += "}";
    styles += ".mdash-no-selection p {";
    styles += "  font-size: 14px;";
    styles += "  margin: 0;";
    styles += "}";
    styles += ".mdash-properties-header h3 {";
    styles += "  font-size: 16px;";
    styles += "  font-weight: 600;";
    styles += "  color: #2d3748;";
    styles += "  margin: 0 0 20px 0;";
    styles += "  display: flex;";
    styles += "  align-items: center;";
    styles += "  gap: 10px;";
    styles += "}";
    styles += ".mdash-properties-tabs {";
    styles += "  display: flex;";
    styles += "  gap: 5px;";
    styles += "  margin-bottom: 20px;";
    styles += "  border-bottom: 2px solid #e2e8f0;";
    styles += "}";
    styles += ".mdash-tab {";
    styles += "  background: none;";
    styles += "  border: none;";
    styles += "  padding: 10px 15px;";
    styles += "  cursor: pointer;";
    styles += "  font-size: 13px;";
    styles += "  font-weight: 600;";
    styles += "  color: #718096;";
    styles += "  border-bottom: 2px solid transparent;";
    styles += "  transition: all 0.2s;";
    styles += "}";
    styles += ".mdash-tab.active {";
    styles += "  color: #667eea;";
    styles += "  border-bottom-color: #667eea;";
    styles += "}";
    styles += ".mdash-tab:hover {";
    styles += "  color: #667eea;";
    styles += "}";
    styles += ".mdash-tab-content {";
    styles += "  display: none;";
    styles += "}";
    styles += ".mdash-tab-content.active {";
    styles += "  display: block;";
    styles += "}";
    styles += ".mdash-property-group {";
    styles += "  margin-bottom: 20px;";
    styles += "}";
    styles += ".mdash-property-group label {";
    styles += "  display: block;";
    styles += "  font-size: 13px;";
    styles += "  font-weight: 600;";
    styles += "  color: #4a5568;";
    styles += "  margin-bottom: 8px;";
    styles += "}";
    styles += ".mdash-input, .mdash-textarea {";
    styles += "  width: 100%;";
    styles += "  padding: 10px;";
    styles += "  border: 1px solid #e2e8f0;";
    styles += "  border-radius: 6px;";
    styles += "  font-size: 14px;";
    styles += "  transition: border-color 0.2s;";
    styles += "}";
    styles += ".mdash-input:focus, .mdash-textarea:focus {";
    styles += "  outline: none;";
    styles += "  border-color: #667eea;";
    styles += "}";
    styles += ".mdash-textarea {";
    styles += "  resize: vertical;";
    styles += "  min-height: 80px;";
    styles += "}";
    styles += ".mdash-code {";
    styles += "  font-family: 'Courier New', monospace;";
    styles += "  font-size: 12px;";
    styles += "}";
    styles += ".mdash-checkbox-label {";
    styles += "  display: flex !important;";
    styles += "  align-items: center;";
    styles += "  gap: 8px;";
    styles += "  cursor: pointer;";
    styles += "}";
    styles += ".mdash-checkbox-label input[type='checkbox'] {";
    styles += "  width: auto;";
    styles += "  margin: 0;";
    styles += "}";
    styles += "/* Scrollbar */";
    styles += ".mdash-toolbox::-webkit-scrollbar, .mdash-canvas::-webkit-scrollbar, .mdash-properties::-webkit-scrollbar {";
    styles += "  width: 8px;";
    styles += "}";
    styles += ".mdash-toolbox::-webkit-scrollbar-track, .mdash-canvas::-webkit-scrollbar-track, .mdash-properties::-webkit-scrollbar-track {";
    styles += "  background: #f1f1f1;";
    styles += "}";
    styles += ".mdash-toolbox::-webkit-scrollbar-thumb, .mdash-canvas::-webkit-scrollbar-thumb, .mdash-properties::-webkit-scrollbar-thumb {";
    styles += "  background: #cbd5e0;";
    styles += "  border-radius: 4px;";
    styles += "}";
    styles += ".mdash-toolbox::-webkit-scrollbar-thumb:hover, .mdash-canvas::-webkit-scrollbar-thumb:hover, .mdash-properties::-webkit-scrollbar-thumb:hover {";
    styles += "  background: #a0aec0;";
    styles += "}";

    gbStyles.push(styles);
    
   
    
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
var GRenderedTables = [new RenderedTable({})];
GRenderedTables = [];
var GEventData = new EventData({});
var GFormContainers = [new FormContainer({})];
//GFormContainers = [];

$(document).ready(function () {
    $(document).off("change keyup paste", ".custom-form-item").on("change keyup paste", ".custom-form-item", function (e) {
        var containterId = $(this).closest(".mainContainer").attr("id");
        var container = CustomFormData(containterId);
        if (!container) {
            console.warn("Container not found for ID: " + containterId);
            return
        }
        container.setContentValue($(this).attr("id"), $(this).val());
        var content = container.getContent($(this).attr("id"));
        if (content) {
            var event = content.event;
            if (event) {
                eval(event);
            }
        }
    });
    var styles = [];
    var globalStyle = "";
    addGridSystemClasses(styles);
    //addBpmCustomStyles(styles);
    getIframeLoadingStyle(styles);

    styles.forEach(function (style) {
        globalStyle += style;
    });

    $('head').append('<style>' + globalStyle + '</style>');
});


function addGridSystemClasses(styles) {
    var cssCustom = "";

    // CONTAINER RESPONSIVO
    cssCustom += ".gr-container {";
    cssCustom += "width: 100%;";
    cssCustom += "padding-left: 1rem;";
    cssCustom += "padding-right: 1rem;";
    cssCustom += "margin-left: auto;";
    cssCustom += "margin-right: auto;";
    cssCustom += "}";

    // Limites máximos do container como no Bootstrap
    cssCustom += "@media (min-width: 576px) {";
    cssCustom += ".gr-container {";
    cssCustom += "max-width: 540px;";
    cssCustom += "}";
    cssCustom += "}";

    cssCustom += "@media (min-width: 768px) {";
    cssCustom += ".gr-container {";
    cssCustom += "max-width: 720px;";
    cssCustom += "}";
    cssCustom += "}";

    cssCustom += "@media (min-width: 992px) {";
    cssCustom += ".gr-container {";
    cssCustom += "max-width: 960px;";
    cssCustom += "}";
    cssCustom += "}";

    cssCustom += "@media (min-width: 1200px) {";
    cssCustom += ".gr-container {";
    cssCustom += "max-width: 1140px;";
    cssCustom += "}";
    cssCustom += "}";

    cssCustom += "@media (min-width: 1400px) {";
    cssCustom += ".gr-container {";
    cssCustom += "max-width: 1320px;";
    cssCustom += "}";
    cssCustom += "}";

    // ROW
    cssCustom += ".gr-row {";
    cssCustom += "display: grid;";
    cssCustom += "grid-template-columns: repeat(12, 1fr);";
    cssCustom += "gap: 1rem;";
    cssCustom += "grid-auto-rows: 1fr;";
    cssCustom += "margin-bottom: 2rem;";
    cssCustom += "grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));";
    cssCustom += "}";

    // COLUNAS base
    cssCustom += "[class*=\"gr-col-\"] {";
    cssCustom += "grid-column: span 12;";
    cssCustom += "}";

    // Breakpoints xs
    cssCustom += ".gr-col-xs-1 { grid-column: span 1; }";
    cssCustom += ".gr-col-xs-2 { grid-column: span 2; }";
    cssCustom += ".gr-col-xs-3 { grid-column: span 3; }";
    cssCustom += ".gr-col-xs-4 { grid-column: span 4; }";
    cssCustom += ".gr-col-xs-5 { grid-column: span 5; }";
    cssCustom += ".gr-col-xs-6 { grid-column: span 6; }";
    cssCustom += ".gr-col-xs-7 { grid-column: span 7; }";
    cssCustom += ".gr-col-xs-8 { grid-column: span 8; }";
    cssCustom += ".gr-col-xs-9 { grid-column: span 9; }";
    cssCustom += ".gr-col-xs-10 { grid-column: span 10; }";
    cssCustom += ".gr-col-xs-11 { grid-column: span 11; }";
    cssCustom += ".gr-col-xs-12 { grid-column: span 12; }";

    // Breakpoints sm
    cssCustom += "@media (min-width: 576px) {";
    cssCustom += ".gr-col-sm-1 { grid-column: span 1; }";
    cssCustom += ".gr-col-sm-2 { grid-column: span 2; }";
    cssCustom += ".gr-col-sm-3 { grid-column: span 3; }";
    cssCustom += ".gr-col-sm-4 { grid-column: span 4; }";
    cssCustom += ".gr-col-sm-5 { grid-column: span 5; }";
    cssCustom += ".gr-col-sm-6 { grid-column: span 6; }";
    cssCustom += ".gr-col-sm-7 { grid-column: span 7; }";
    cssCustom += ".gr-col-sm-8 { grid-column: span 8; }";
    cssCustom += ".gr-col-sm-9 { grid-column: span 9; }";
    cssCustom += ".gr-col-sm-10 { grid-column: span 10; }";
    cssCustom += ".gr-col-sm-11 { grid-column: span 11; }";
    cssCustom += ".gr-col-sm-12 { grid-column: span 12; }";
    cssCustom += "}";

    // Breakpoints md
    cssCustom += "@media (min-width: 768px) {";
    cssCustom += ".gr-col-md-1 { grid-column: span 1; }";
    cssCustom += ".gr-col-md-2 { grid-column: span 2; }";
    cssCustom += ".gr-col-md-3 { grid-column: span 3; }";
    cssCustom += ".gr-col-md-4 { grid-column: span 4; }";
    cssCustom += ".gr-col-md-5 { grid-column: span 5; }";
    cssCustom += ".gr-col-md-6 { grid-column: span 6; }";
    cssCustom += ".gr-col-md-7 { grid-column: span 7; }";
    cssCustom += ".gr-col-md-8 { grid-column: span 8; }";
    cssCustom += ".gr-col-md-9 { grid-column: span 9; }";
    cssCustom += ".gr-col-md-10 { grid-column: span 10; }";
    cssCustom += ".gr-col-md-11 { grid-column: span 11; }";
    cssCustom += ".gr-col-md-12 { grid-column: span 12; }";
    cssCustom += "}";

    // Breakpoints lg
    cssCustom += "@media (min-width: 992px) {";
    cssCustom += ".gr-col-lg-1 { grid-column: span 1; }";
    cssCustom += ".gr-col-lg-2 { grid-column: span 2; }";
    cssCustom += ".gr-col-lg-3 { grid-column: span 3; }";
    cssCustom += ".gr-col-lg-4 { grid-column: span 4; }";
    cssCustom += ".gr-col-lg-5 { grid-column: span 5; }";
    cssCustom += ".gr-col-lg-6 { grid-column: span 6; }";
    cssCustom += ".gr-col-lg-7 { grid-column: span 7; }";
    cssCustom += ".gr-col-lg-8 { grid-column: span 8; }";
    cssCustom += ".gr-col-lg-9 { grid-column: span 9; }";
    cssCustom += ".gr-col-lg-10 { grid-column: span 10; }";
    cssCustom += ".gr-col-lg-11 { grid-column: span 11; }";
    cssCustom += ".gr-col-lg-12 { grid-column: span 12; }";
    cssCustom += "}";

    // Breakpoints xl
    cssCustom += "@media (min-width: 1200px) {";
    cssCustom += ".gr-col-xl-1 { grid-column: span 1; }";
    cssCustom += ".gr-col-xl-2 { grid-column: span 2; }";
    cssCustom += ".gr-col-xl-3 { grid-column: span 3; }";
    cssCustom += ".gr-col-xl-4 { grid-column: span 4; }";
    cssCustom += ".gr-col-xl-5 { grid-column: span 5; }";
    cssCustom += ".gr-col-xl-6 { grid-column: span 6; }";
    cssCustom += ".gr-col-xl-7 { grid-column: span 7; }";
    cssCustom += ".gr-col-xl-8 { grid-column: span 8; }";
    cssCustom += ".gr-col-xl-9 { grid-column: span 9; }";
    cssCustom += ".gr-col-xl-10 { grid-column: span 10; }";
    cssCustom += ".gr-col-xl-11 { grid-column: span 11; }";
    cssCustom += ".gr-col-xl-12 { grid-column: span 12; }";
    cssCustom += "}";

    styles.push(cssCustom);
}


function FormContainer(data) {
    this.containerId = data.containerId || "";
    this.spinnerId = data.spinnerId || "";
    this.hasSpinner = data.hasSpinner || false;
    this.customData = data.customData || "";
    this.renderedHtml = data.renderedHtml || "";
    this.sourceData = data.sourceData ? new FormSourceData(data.sourceData) : new FormSourceData({});
    this.items = Array.isArray(data.items) ? Array.from(data.items) : [];
}
FormContainer.prototype.getContentValue = function (contentId) {
    var content = this.items.find(function (item) {
        return item.content.id == contentId;
    });
    if (content) {
        return content.content.value;
    }
    return null;
}
FormContainer.prototype.setContentValue = function (contentId, value) {
    var content = this.items.find(function (item) {
        return item.content.id == contentId;
    });
    if (content) {
        content.content.value = value;
    }
}
FormContainer.prototype.getContent = function (contentId) {
    var content = this.items.find(function (item) {
        return item.content.id == contentId;
    });
    if (content) {
        return content.content;
    }
    return null;
}
FormContainer.prototype.getSelectedOption = function (contentId) {
    return $("#" + contentId).find("option:selected").text();
}
function FormSourceData(data) {
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
}

function FormItem(data) {
    this.colSize = data.colSize || "1";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.content = data.content ? new FormContent(data.content) : new FormContent({});
}
function FormContent(data) {
    this.contentType = data.contentType || "";
    this.id = data.id || generateUUID();
    this.type = data.type || "";
    this.classes = data.classes || "";
    this.style = data.style || "";
    this.customData = data.customData || "";
    this.selectCustomData = data.selectCustomData || "";
    this.fieldToOption = data.fieldToOption || "";
    this.fieldToValue = data.fieldToValue || "";
    this.dataType = data.dataType || "";
    this.label = data.label || "";
    this.cols = data.cols || 12;
    this.rows = data.rows || 10;
    this.selectData = data.selectData || "";
    this.isReactive = data.isReactive || false;
    this.selectVariable = data.selectVariable || "";
    this.value = data.value || "";
    this.event = data.event || "";
}

function TableHtml(data) {
    this.tableId = data.tableId || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.header = new FormHeaderHtml(data.header || {});
    this.body = new FormBodyHtml(data.body || {});
}

function EventData(data) {
    this.row = data.row ? new FormTableRow(data.row) : new FormTableRow({});
    this.cell = data.cell ? new CellObject(data.cell) : new CellObject({});
    this.renderedTable = data.renderedTable ? new RenderedTable(data.renderedTable) : new RenderedTable({});
}

function GenerateCustomFormContainer(cont) {
    var container = new FormContainer(cont);
    var mainContainer = "<div data-sourcetable='" + container.sourceData.sourceTable + "' data-sourcekey='" + container.sourceData.sourceKey + "' id='" + container.containerId + "' class='row mainContainer'>";
    if (container.hasSpinner) {
        mainContainer += "<div id='" + container.spinnerId + "' class='overlay'>";
        mainContainer += "    <div class='spinner'></div>"
        mainContainer += "    <div class='w-100 d-flex justify-content-center align-items-center'>"
        mainContainer += "    </div>"
        mainContainer += "</div>"
    }
    var renderedItems = [new FormItem({})];
    renderedItems = [];
    container.items.forEach(function (item) {

        var formItem = new FormItem(item);
        formItem.content.classes = formItem.content.classes ? formItem.content.classes + " custom-form-item" : "custom-form-item";
        mainContainer += GenerateCustomContainerCol(formItem)
        renderedItems.push(formItem);
    });
    mainContainer += "</div>";
    container.items = renderedItems;

    container.renderedHtml = mainContainer;
    GFormContainers.push(container);
    return mainContainer
}

function GenerateCustomContainerCol(containerData) {
    var containerHTML = '';
    containerHTML += ' <div';
    containerHTML += ' class=" custom-form-container-item col-md-' + containerData.colSize + (containerData.classes ? ' ' + containerData.classes : '') + '"';
    containerHTML += containerData.customData ? ' ' + containerData.customData : '';
    containerHTML += containerData.style ? " style='" + containerData.style + "'" : '';
    containerHTML += '>';
    containerHTML += HandlerCustomContainerContentGenerator(containerData.content);
    containerHTML += '</div>';
    return containerHTML;
}

function CustomFormData(containerId) {
    var container = GFormContainers.find(function (container) {
        return container.containerId == containerId;
    });
    return container
}
function HandlerCustomContainerContentGenerator(content) {
    // Debug log for ALL select fields
    if (content.contentType === "select" || content.type === "select") {
        console.log('HandlerCustomContainerContentGenerator - ' + (content.id || 'unknown') + ':', {
            contentType: content.contentType,
            type: content.type,
            id: content.id,
            multiSelect: content.multiSelect,
            hasSelectData: content.selectData && content.selectData.length,
            allKeys: Object.keys(content)
        });
    }
    
    switch (content.contentType) {
        case "input":
            return generateInput(content);
        case "textarea":
            return generateTextarea(content);
        case "select":
            if (content.isReactive && content.selectVariable) {
                return generateReactiveSelect(content);
            }
            return generateSelect(content.selectData, content.classes, content.style, content.selectCustomData, content.fieldToOption, content.fieldToValue, content.label, content.multiSelect);
        case "button":
            return generateButton(content);
        case "div":
            return generateDiv(content);
    }
}

function generateReactiveSelect(content) {
    var html = "";
    if (content.label) {
        html += "<label>" + content.label + "</label>";
    }
    html += "<select";
    if (content.style) html += " style='" + content.style + "'";
    if (content.classes) html += " class='" + content.classes + "'";
    if (content.selectCustomData) html += " " + content.selectCustomData;
    html += ">";
    html += "<option value=''></option>";
    html += "<option v-for='opt in " + content.selectVariable + "' :value='opt." + content.fieldToValue + "'>{{ opt." + content.fieldToOption + " }}</option>";
    html += "</select>";
    return html;
}
function generateDiv(content) {
    var html = "";
    if (content.label) {
        html += "<label for='" + content.id + "'>" + content.label + "</label>";
    }
    html += "<div ";
    html += " id='" + content.id + "' ";
    html += " class='" + content.classes + "' ";
    html += content.customData ? " " + content.customData : "";
    html += content.style ? " style='" + content.style + "'" : "";
    html += ">";
    html += content.value || "";
    html += "</div>";
    return html;
}

TableHtml.prototype.generateHtml = function () {
    return generateTableV2(this);
}

TableHtml.prototype.getDbData = function (filter) {
    var renderedTable = this.getRenderedTable();
    var data = [];

    var rows = renderedTable.rows;
    rows.forEach(function (rowData) {
        var row = new FormTableRow(rowData);
        var cells = row.getCells();
        var objectToBuild = {}

        cells.filter(function (cellFlt) {
            return cellFlt.column.inputdata.campodb == true
            //   return cellFlt.column.inputdata.campodb == true && eval(filter);
        }).forEach(function (cell) {
            var cellObject = new CellObject(cell);
            objectToBuild[cellObject.column.campo] = cellObject.value;
        })
        if (Object.keys(objectToBuild).length > 0) {
            data.push(objectToBuild);
        }

    })

    return data;
}



handleFormDataInputsByDataType = function (dataType, value) {
    switch (dataType) {
        case "number":
        case "digit":

            var inputValTxt = (value ? value.toString().replaceAll(" ", "").replaceAll(",", "") : "0")

            return (isNaN(inputValTxt) ? 0 : Number(inputValTxt));

        case "text":
            return value.toString();
        case "date":
            return new Date(value);

        default:
            return value;
    }
}

TableHtml.prototype.toFormData = function (filter) {
    var renderedTable = this.getRenderedTable();
    var data = [];

    var rows = renderedTable.rows;
    rows.forEach(function (rowData) {
        var row = new FormTableRow(rowData);
        var cells = row.getCells();

        //console.log("cells",cells)
        var objectToBuild = {}
        cells.filter(function (cellFlt) {
            return cellFlt.column.inputdata.campodb == true && eval(filter);
        }).forEach(function (cell) {
            var cellObject = new CellObject(cell);

            var dataType = cellObject.inputdata.dataType;
            objectToBuild[cellObject.column.campo] = handleFormDataInputsByDataType(dataType, cellObject.value);
        })
        if (Object.keys(objectToBuild).length > 0) {
            var formData = {
                sourceKey: renderedTable.tableKey,
                sourceTable: renderedTable.tableName,
                registo: objectToBuild
            }
            data.push(formData);
        }

    })

    return data;
}



TableHtml.prototype.toDataTable = function (defaultConfig, configData) {
    $("#" + this.tableId).DataTable().destroy();

    if (defaultConfig == true) {
        return $("#" + this.tableId).DataTable(configData);
    }
    var defaultConfig = {
        "language": {
            "sProcessing": "Processando...",
            "sLengthMenu": "Mostrar _MENU_ registos",
            "sZeroRecords": "Sem resultados",
            "sEmptyTable": "Sem registos",
            "sInfo": "Mostrando registos de _START_ a _END_ de um total de _TOTAL_ registos",
            "sInfoEmpty": "Mostrando registos de 0 a 0 de um total de 0 registos",
            "sInfoFiltered": "(filtrado de um total de _MAX_ registos)",
            "sInfoPostFix": "",
            "sSearch": "Pesquisar:",
            "sUrl": "",
            "sInfoThousands": ",",
            "sLoadingRecords": "Carregando..",
            "oPaginate": {
                "sFirst": "Primeiro",
                "sLast": "Último",
                "sNext": "Seguinte",
                "sPrevious": "Anterior"
            },
            "oAria": {
                "sSortAscending": ": Activar para ordenar a coluna de maneira ascendente",
                "sSortDescending": ": Activar para ordenar a coluna de maneira descendente"
            }
        }
    };
    var finalConfig = Object.assign({}, defaultConfig, configData);
    return $("#" + this.tableId).DataTable(finalConfig);
}

TableHtml.prototype.destroyDataTable = function () {
    $("#" + this.tableId).DataTable().destroy();
}
TableHtml.prototype.clearData = function () {
    if ($.fn.DataTable.isDataTable("#" + this.tableId)) {
        var table = $("#" + this.tableId).DataTable();
        table.clear().draw();
        table.clear().destroy();
    }
    $("#" + this.tableId + " tbody").empty();
    this.body.rows = [];
    var renderedTable = this.getRenderedTable();
    renderedTable.rows = [];
    renderedTable.cellObjects = [];
}
TableHtml.prototype.setListeners = function () {
    var thisTable = this;
    var renderedTable = thisTable.getRenderedTable();
    $(document).off("change keyup  paste", "#" + this.tableId + " .input-source-table-form").on("change keyup  paste", "#" + this.tableId + " .input-source-table-form", function (e) {
        var cellId = $(this).attr("id");
        var cellValue = $(this).val();
        var cellObject = thisTable.findCellObjectById(cellId);
        cellObject.setValue(cellValue);
    })
    $(document).off("click", "#" + this.tableId + " .clickable-col-form").on("click", "#" + this.tableId + " .clickable-col-form", function (e) {
        rowId = $(this).closest("tr").attr("id");
        GClickedEventRow = renderedTable.rows.find(function (row) {
            return row.rowId == rowId;
        });
        var cellId = $(this).attr("id");
        var cellObject = thisTable.findCellObjectById(cellId);

        GEventData = new EventData({ row: GClickedEventRow, cell: new CellObject(cellObject), renderedTable: renderedTable });
        eval(cellObject.column.eventoClique);


    });
}

TableHtml.prototype.render = function (component) {
    $(component).append(this.generateHtml());
}
TableHtml.prototype.getRenderedTable = function () {
    var thisTable = this;
    return GRenderedTables.find(function (table) {
        return table.tableName == thisTable.tableId.replace("formTable", "");
    });
}

TableHtml.prototype.findCellObjectById = function (cellId) {
    var thisTable = this;
    var renderedTable = thisTable.getRenderedTable();
    return renderedTable.cellObjects.find(function (cell) {
        return cell.cellId == cellId;
    })
}

TableHtml.prototype.formatTableData = function () {
    var digitElements = document.querySelectorAll('[data-type="digit"]');

    Array.from(digitElements).forEach(function (element) {


        var valueCriteria = getPureJSValueByTag(element.tagName.toLowerCase());
        var value = element[valueCriteria] || "0";

        var tmpInput = $("body").append("<input style='display:none'  class='cleaveFormatterInputTmp' type='text' value=" + value + " />");
        var cleave = new Cleave('.cleaveFormatterInputTmp', {
            numeral: true,
            numeralThousandsGroupStyle: 'thousand', delimiter: " ",
        });

        if (element.tagName.toLowerCase() == 'input') {

            var cleave = new Cleave(element, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand', delimiter: " ",
            });

        }




        var formattedValue = $(".cleaveFormatterInputTmp").val()
        element[valueCriteria] = formattedValue;
        console.log("TAG:", element.tagName.toLowerCase(), formattedValue);

        $(".cleaveFormatterInputTmp").remove();
    })
}
TableHtml.prototype.addRow = function (isRendered, rowData) {
    var renderedTable = this.getRenderedTable();
    var newRowHtml = new FormRowHtml({});
    var formTableRow = new FormTableRow({});
    newRowHtml.rowId = generateUUID();
    formTableRow.rowId = newRowHtml.rowId;
    formTableRow.tableName = renderedTable.tableName;
    newRowHtml.tableId = this.tableId;
    newRowHtml.classes = "form-table-row";
    newRowHtml.cols = [];
    var configCols = renderedTable.columns;
    var cellObjects = [];
    configCols.forEach(function (col) {

        var configCol = new FormTableColumn(col);

        var cellId = "inputId_" + col.codigocoluna + "_" + newRowHtml.rowId;
        configCol.inputdata.id = cellId;
        var dataExist = rowData.find(function (row) {
            return row.codigocoluna == configCol.codigocoluna && row.campo == configCol.campo;
        });
        var cellValue = "";
        if (dataExist) {
            cellValue = dataExist.valor;
        }

        configCol.inputdata.value = cellValue;
        var celllObjectConfig = new CellObject({
            colId: col.codigocoluna + "_" + newRowHtml.rowId,
            cellId: cellId,
            rowId: newRowHtml.rowId,
            value: cellValue,
            inputdata: configCol.inputdata,
            row: newRowHtml,
            column: configCol
        });

        var htmlCol = new FormColumnHtml(
            {
                colId: col.codigocoluna + "_" + newRowHtml.rowId,
                content: celllObjectConfig.generateHtml(),
                style: "text-align:right ;" + (col.visivel == true ? "" : " display:none"),
                classes: "form-table-cell",
                customData: "data-campo='" + configCol.campo + "' data-coluna='" + configCol.codigocoluna + "' data-row='" + newRowHtml.rowId + "'"
            });
        newRowHtml.cols.push(htmlCol);
        cellObjects.push(celllObjectConfig);
    });

    this.body.rows.push(newRowHtml);
    renderedTable.rows.push(formTableRow);
    renderedTable.cellObjects = renderedTable.cellObjects.concat(cellObjects);
    renderedTable.htmlTable = this;
    if (isRendered) {
        newRowHtml.render();
    }
}
function FormColumnHtml(data) {
    this.style = data.style || "";
    this.colId = data.colId || "";
    this.classes = data.classes || "";
    this.content = data.content || "";
    this.customData = data.customData || "";
}
// Funções nomeadas para mapeamento
function mapColumnHtml(col) {
    return new FormColumnHtml(col);
}
function mapRowHtml(row) {
    return new FormRowHtml(row);
}
function FormRowHtml(data) {
    this.style = data.style || "";
    this.rowId = data.rowId || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.tableId = data.tableId || "";
    this.cols = Array.isArray(data.cols) ? Array.from(data.cols.map(mapColumnHtml)) : [];
}
FormRowHtml.prototype.generateHtml = function () {
    return generateRowAbove(this);
}
FormRowHtml.prototype.render = function () {
    $("#" + this.tableId + " tbody").append(this.generateHtml());
}

function FormHeaderHtml(data) {
    this.rows = Array.isArray(data.rows) ? Array.from(data.rows.map(mapRowHtml)) : [];
}
function FormBodyHtml(data) {
    this.customData = data.customData || "";
    this.rows = Array.isArray(data.rows) ? Array.from(data.rows.map(mapColumnHtml)) : [];
}

function getPureJSValueByTag(tagName) {
    switch (tagName.toLowerCase()) {
        case "input":
            return "value";
        case "select":
            return "value";
        case "textarea":
            return "value";
        case "div":
            return "innerText";
        case "span":
            return "innerText";
        case "p":
            return "innerText";
        default:
            return "innerText";
    }

}

function FormTableInputData(data) {
    //console.log("FORM TABLE",data.value)
    this.contentType = data.contentType || "";
    this.type = data.type || "";
    this.value = data.value || "";
    this.label = data.label || "";
    this.placeholder = data.placeholder || "";
    this.value = data.value || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.dataType = data.dataType || "text";
    this.style = data.style || "";
    this.id = data.id || "";
    this.campodb = data.campodb || false;

}

function FormTableRow(data) {
    this.rowId = data.rowId || "";
    this.tableName = data.tableName || "";
}
FormTableRow.prototype.getTableName = function () {
    return $("#" + this.rowId).closest("table").data("tablename");
}
FormTableRow.prototype.getCells = function () {
    var thisRow = this;
    var renderedTable = GRenderedTables.find(function (table) {
        return table.tableName == thisRow.tableName
    });
    return renderedTable.cellObjects.filter(function (cell) {
        return cell.rowId == thisRow.rowId;
    });
}

function CellObject(data) {
    this.colId = data.colId || "";
    this.rowId = data.rowId || "";
    this.value = data.value || setDefaultValue(data.inputdata);
    this.cellId = data.cellId || "";
    this.inputdata = new FormTableInputData(data.inputdata || {});
    this.row = new FormTableRow(data.row || {});
    this.column = new FormTableColumn(data.column || {});
}
function setDefaultValue(data) {
    var inputData = new FormTableInputData(data ? data : {});
    if (!inputData) {
        return ""
    }
    if (inputData.contentType != "input") {
        return ""
    }
    switch (inputData.type) {
        case "checkbox":
            return false;
        case "number":
            return 0;
        case "text":
            return "";
        default:
            return ";"
    }
}
CellObject.prototype.getHtmlObject = function () {
    return $("#" + this.cellId);
}
CellObject.prototype.setValue = function (value) {
    var htmlObject = this.getHtmlObject();
    this.value = getElementValueByType(htmlObject)
}

CellObject.prototype.generateHtml = function () {
    return handlerContainerContentGenerator(this.inputdata);
}
function FormTableColumn(data) {
    this.colId = data.colId || "";
    this.codigocoluna = data.codigocoluna || "";
    this.desccoluna = data.desccoluna || "";
    this.visivel = data.visivel || false;
    this.eventoClique = data.eventoClique || "";
    this.inputdata = new FormTableInputData(data.inputdata || {});
    this.campo = data.campo || "";
}
function TableConfig(data) {
    this.tableName = data.tableName || "";
    this.tableKey = data.tableKey || "";
    this.colsConfig = Array.isArray(data.colsConfig) ? Array.from(data.colsConfig) : [];
}


function RenderedTable(data) {
    this.tableName = data.tableName || "";
    this.tableKey = data.tableKey || "";
    this.htmlTable = new TableHtml(data.htmlTable || {});
    this.rows = Array.isArray(data.rows) ? Array.from(data.rows.map(mapRowHtml)) : [];
    this.columns = Array.isArray(data.columns) ? Array.from(data.columns) : [];
    this.cellObjects = Array.isArray(data.cellObjects) ? Array.from(data.cellObjects) : [];
}


function buildHtmlTable(data) {
    colsConfig = data.colsConfig;

    var TableData = new TableHtml({})
    TableData = new TableHtml({})
    TableData.tableId = data.tableName + "formTable"
    TableData.customData = " data-tableName='" + data.tableName + "' data-tableKey='" + data.tableKey + "'"
    TableData.classes = "table form-source-table "
    TableData.body.rows = []
    TableData.header = new FormHeaderHtml({})
    setCabecalhos(TableData, data);

    var tableAlreadyRendered = GRenderedTables.find(function (table) {
        return table.tableName == data.tableName;
    });
    if (tableAlreadyRendered) {
        tableAlreadyRendered = new RenderedTable({ tableName: data.tableName, tableKey: data.tableKey, htmlTable: TableData, columns: colsConfig, rows: [], cellObjects: [] })
        return TableData;
    }

    GRenderedTables.push(new RenderedTable({ tableName: data.tableName, tableKey: data.tableKey, htmlTable: TableData, columns: colsConfig, rows: [], cellObjects: [] }));
    TableData.setListeners();
    return TableData;
}

function setCabecalhos(table, tableConfigPar) {
    var header = {
        style: "",
        rowId: "",
        classes: "defgridheader",
        customData: "",
        cols: [
        ]
    }
    var tableConfig = new TableConfig(tableConfigPar);
    var colsConfig = [new FormTableColumn({})];
    colsConfig = tableConfig.colsConfig;

    colsConfig.forEach(function (coluna) {
        header.cols.push({
            content: coluna.desccoluna,
            classes: "header-for-edit-col  header-col",
            colId: coluna.codigocoluna,
            style: "text-align:right!important " + (coluna.visivel == true ? "" : "; display:none"),
            customData: " data-campo='" + coluna.campo + "' data-desccoluna='" + coluna.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"
        });
    });

    table.header = new FormHeaderHtml({ rows: [header] });

}

function getRenderedTableByTableName(tableName) {
    return GRenderedTables.find(function (table) {
        return table.tableName == tableName;
    });
}


function generateFormContainer(mainContainerId, sourceData, containers) {

    var mainContainer = "<div data-sourcetable='" + sourceData.sourceTable + "' data-sourcekey='" + sourceData.sourceKey + "' id='" + mainContainerId + "' class='row mainContainer'>";

    containers.forEach(function (container) {

        mainContainer += generateContainerCol(container)
    });

    mainContainer += "</div>";

    return mainContainer
}

function generateContainerCol(containerData) {
    var containerHTML = '';

    containerHTML += ' <div';
    containerHTML += ' class="col-md-' + containerData.colSize + (containerData.classes ? ' ' + containerData.classes : '') + '"';
    containerHTML += containerData.customData ? ' ' + containerData.customData : '';
    containerHTML += containerData.style ? " style='" + containerData.style + "'" : '';
    containerHTML += '>';
    containerHTML += handlerContainerContentGenerator(containerData.content);
    containerHTML += '</div>';

    return containerHTML;
}

function handlerContainerContentGenerator(content) {

    switch (content.contentType) {
        case "input":
            var inputContent = content;
            if (inputContent.type && (inputContent.type.toLowerCase() === "number" || inputContent.type.toLowerCase() === "digit")) {
                inputContent = Object.assign({}, content);
                inputContent.type = "text";
                var extraData = "data-type='digit'";
                inputContent.customData = inputContent.customData ? inputContent.customData + " " + extraData : extraData;
            }
            return generateInput(inputContent);
        case "textarea":
            content.customData = content.customData ? content.customData + " data-type='text' " : " data-type='text' ";
            return generateTextarea(content);
        case "select":
            content.selectCustomData = content.selectCustomData ? content.selectCustomData + " data-type='text' " : " data-type='text' ";
            return generateSelect(content.selectData, content.classes, content.style, content.selectCustomData, content.fieldToOption, content.fieldToValue, content.label, content.multiSelect);
        case "button":
            content.customData = content.customData ? content.customData + " data-type='action' " : " data-type='action' ";
            return generateButton(content);
        case "div":


            return generateDiv(content);
        case "span":
            return generateSpan(content);
    }
}




function generateTable(table) {
    var html = "<table";

    // add table attributes
    if (table.tableId) html += " id='" + table.tableId + "'";
    if (table.classes) html += " class='" + table.classes + "'";
    if (table.customData) html += " " + table.customData;
    if (table.style) html += " style='" + table.style + "'";

    html += ">";

    // add header row
    if (table.header && table.header.row) {
        html += "<thead><tr";

        // add header row attributes
        if (table.header.row.style) html += " style='" + table.header.row.style + "'";
        if (table.header.row.rowId) html += " id='" + table.header.row.rowId + "'";
        if (table.header.row.classes) html += " class='" + table.header.row.classes + "'";
        if (table.header.row.customData) html += " " + table.header.row.customData;

        html += ">";

        // add header columns
        table.header.row.cols.forEach(function (col) {
            html += "<th";

            // add header column attributes
            if (col.style) html += " style='" + col.style + "'";
            if (col.colId) html += " id='" + col.colId + "'";
            if (col.classes) html += " class='" + col.classes + "'";
            if (col.customData) html += " " + col.customData;

            html += ">" + col.content + "</th>";
        });

        html += "</tr></thead>";
    }

    // add body rows
    if (table.body && table.body.rows) {
        html += "<tbody";

        // add body attributes
        if (table.body.customData) html += " " + table.body.customData;

        html += ">";

        table.body.rows.forEach(function (row) {
            html += "<tr";

            // add body row attributes
            if (row.style) html += " style='" + row.style + "'";
            if (row.rowId) html += " id='" + row.rowId + "'";
            if (row.classes) html += " class='" + row.classes + "'";
            if (row.customData) html += " " + row.customData;

            html += ">";

            // add body columns
            row.cols.forEach(function (col) {
                html += "<td";

                // add body column attributes
                if (col.style) html += " style='" + col.style + "'";
                if (col.colId) html += " id='" + col.colId + "'";
                if (col.classes) html += " class='" + col.classes + "'";
                if (col.customData) html += " " + col.customData;

                html += ">" + col.content + "</td>";
            });

            html += "</tr>";
        });

        html += "</tbody>";
    }

    html += "</table>";

    return html;
}


function generateTableV2(table) {
    var html = "<table";

    // add table attributes
    if (table.tableId) html += " id='" + table.tableId + "'";
    if (table.classes) html += " class='" + table.classes + "'";
    if (table.customData) html += " " + table.customData;
    if (table.style) html += " style='" + table.style + "'";

    html += ">";

    // add header rows
    if (table.header && table.header.rows) {
        html += "<thead>";

        table.header.rows.forEach(function (headerRow) {
            html += "<tr";

            // add header row attributes
            if (headerRow.style) html += " style='" + headerRow.style + "'";
            if (headerRow.rowId) html += " id='" + headerRow.rowId + "'";
            if (headerRow.classes) html += " class='" + headerRow.classes + "'";
            if (headerRow.customData) html += " " + headerRow.customData;

            html += ">";

            // add header columns
            headerRow.cols.forEach(function (col) {
                html += "<th";

                // add header column attributes
                if (col.style) html += " style='" + col.style + "'";
                if (col.colId) html += " id='" + col.colId + "'";
                if (col.classes) html += " class='" + col.classes + "'";
                if (col.customData) html += " " + col.customData;

                html += ">" + col.content + "</th>";
            });

            html += "</tr>";
        });

        html += "</thead>";
    }

    // add body rows
    if (table.body && table.body.rows) {
        html += "<tbody";

        // add body attributes
        if (table.body.customData) html += " " + table.body.customData;

        html += ">";

        table.body.rows.forEach(function (row) {
            html += "<tr";

            // add body row attributes
            if (row.style) html += " style='" + row.style + "'";
            if (row.rowId) html += " id='" + row.rowId + "'";
            if (row.classes) html += " class='" + row.classes + "'";
            if (row.customData) html += " " + row.customData;

            html += ">";

            // add body columns
            row.cols.forEach(function (col) {
                html += "<td";

                // add body column attributes
                if (col.style) html += " style='" + col.style + "'";
                if (col.colId) html += " id='" + col.colId + "'";
                if (col.classes) html += " class='" + col.classes + "'";
                if (col.customData) html += " " + col.customData;

                html += ">" + col.content + "</td>";
            });

            html += "</tr>";
        });

        html += "</tbody>";
    }

    html += "</table>";

    return html;
}




function generateToolTipForElement(element) {
    var value = element.val();
    //  //console.log(value);

    var toolTip = "<a href='#' data-toggle='tooltip' title='Hooray!'>Hover over me</a>"
    element.attr("data-toggle", "tooltip");
    //  $(this).attr("title", $(this).val());
    element.attr("data-original-title", value);
}
function generateSelectSettingSelectValue(selectData, classes, style, selectCustomData, fieldToOption, fieldToValue, selectedValue) {
    // Replace keys based on arguments
    var options = selectData.map(function (n) {
        return {
            option: n[fieldToOption],
            value: n[fieldToValue]
        };
    });

    // Generate select element
    var selectHTML = "<select";
    if (style) selectHTML += " style='" + style + "'";
    if (classes) selectHTML += " class='" + classes + "'";
    if (selectCustomData) selectHTML += " " + selectCustomData;
    selectHTML += ">"
    selectHTML += "<option selected disabled value='' ></option>";
    options.forEach(function (option) {


        var selected = (option.value == selectedValue ? "selected" : "")
        //  //console.log(selected)
        selectHTML += "<option " + selected + " value='" + option.value + "'>" + option.option + "</option>";
    });
    selectHTML += '</select>';


    return selectHTML;
}

function buildAlert(alertClass, alertText) {
    var alerta = ""
    alerta += "<div  class='alert custom-alert " + alertClass + "'>"
    alerta += "  <strong>Atenção!</strong> " + alertText
    alerta += "</div>"

    return alerta
}
function generateSelect(selectData, classes, style, selectCustomData, fieldToOption, fieldToValue, label, multiSelect) {
    // Extract field name from customData for logging
    var fieldName = 'unknown';
    if (selectCustomData) {
        var matches = selectCustomData.match(/v-model=['"]([^'"]+)['"]/);
        if (matches && matches[1]) {
            fieldName = matches[1].split('.').pop();
        }
    }
    
    // Debug log for ALL selects
   /* console.log('generateSelect called for ' + fieldName + ':', {
        multiSelect: multiSelect,
        multiSelectType: typeof multiSelect,
        selectDataLength: selectData ? selectData.length : 0,
        label: label
    });*/
    
    // Replace keys based on arguments
    var options = selectData.map(function (n) {
        return {
            option: n[fieldToOption],
            value: n[fieldToValue]
        };
    });

    // Generate select element
    var selectHTML = "";
    if (label) {
        selectHTML += "<label >" + label + "</label>";
    }
    selectHTML += "<select";
    
    // Add id attribute for multiselect to make it easier to find
    if (multiSelect && selectCustomData && selectCustomData.indexOf('v-model') !== -1) {
        // Extract field name from v-model (e.g., v-model='mrendConfigItem.blacklistheranca')
        var matches = selectCustomData.match(/v-model=['"]([^'"]+)['"]/);
        if (matches && matches[1]) {
            var fieldPath = matches[1];
            var fieldName = fieldPath.split('.').pop(); // Get last part (e.g., 'blacklistheranca')
            selectHTML += " id='" + fieldName + "'";
        }
    }
    
    if (multiSelect) selectHTML += " multiple";
    if (style) selectHTML += " style='" + style + "'";
    if (classes) selectHTML += " class='" + classes + "'";
    if (selectCustomData) selectHTML += " " + selectCustomData;
    selectHTML += ">"
    if (!multiSelect) {
        selectHTML += "<option selected disabled value='' ></option>";
    }
    options.forEach(function (option) {
        selectHTML += "<option value='" + option.value + "'>" + option.option + "</option>";
    });
    selectHTML += '</select>';
    
    // Debug log for generated HTML
    if (selectCustomData && selectCustomData.indexOf('blacklistheranca') !== -1) {
        console.log('generateSelect HTML for blacklistheranca (first 300 chars):', selectHTML.substring(0, 300));
    }

    return selectHTML;
}






function generateDiv(content) {
    var html = "<div ";
    html += " id='" + content.id + "' ";
    html += " class='" + content.classes + "' ";
    html += content.customData ? " " + content.customData : "";
    html += content.style ? " style='" + content.style + "'" : "";
    html += content.dataType ? " data-type='" + content.dataType + "' " : "";
    html += ">";
    html += content.value || "";
    html += "</div>";
    return html;
}

function generateSpan(content) {
    var html = "";
    if (content.label) {
        html += "<label for='" + content.id + "'>" + content.label + "</label>";
    }
    html += "<span";
    if (content.id) html += " id='" + content.id + "'";
    if (content.classes) html += " class='" + content.classes + "'";
    if (content.customData) html += " " + content.customData;
    if (content.style) html += " style='" + content.style + "'";
    if (content.dataType) html += " data-type='" + content.dataType + "'";
    html += ">";
    html += content.value || "";
    html += "</span>";
    return html;
}


function formatDateForBackend(date) {
    var dataSplitted = date.split(".");

    if (dataSplitted.length < 3) {

        return null;
    }
    var dataFormatada = dataSplitted[2] + "-" + dataSplitted[1] + "-" + dataSplitted[0]
    return dataFormatada
}

function submitFormContainerData(containerId, spinnerSelector, recordId) {


    var sourceTable = $("#" + containerId).data("sourcetable")
    var sourceKey = $("#" + containerId).data("sourcekey")
    var registos = []
    var registo = {

    }
    $("#" + containerId + " .input-source-form").each(function () {
        var campo = $(this).data("campo")
        var valor = getElementValueByType($(this))


        registo[campo] = valor
    })

    registo[sourceKey] = recordId ? recordId : generateUUID()
    var registoData = {
        sourceTable: sourceTable,
        sourceKey: sourceKey,
        registo: registo
    }
    registos.push(registoData)
    $("#registoJson").val(JSON.stringify(registos))


    gravarDadosFormulario(spinnerSelector, registos).then(function (response) {



    });

    //__doPostBack(target, '')

}


function gravarDadosFormulario(spinnerSelector, registos) {
    try {
        $(spinnerSelector).show()
        return submeterDadosFormulario(registos).then(function (response) {

            try {
                if (response.cod != "0000") {

                    if (response.cod == "0005") {
                        alertify.error(response.message, 10000)
                        console.log("Erro ao submeter dados response", response)
                        $(spinnerSelector).hide()
                        return
                    }

                    alertify.error("Erro ao submeter dados", 10000)
                    console.log("Erro ao submeter dados response", response)
                    $(spinnerSelector).hide()
                    return
                }
                alertify.success("Dados submetidos com sucesso", 5000)
                $(spinnerSelector).hide()
                __doPostBack('ctl00$conteudo$options4$BUACTUALIZAR', '')
            } catch (error) {
                console.log("erro interno ao submeter dados", error)
                alertify.error("Erro interno ao submeter dados", 10000)
                $(spinnerSelector).hide()
            }

        });
    } catch (error) {

        console.log("erro interno ao submeter dados", error)
        alertify.error("Erro interno ao submeter dados", 10000)
        $(spinnerSelector).hide()
    }

}

function submeterDadosFormulario(dados) {

    console.log("dados", dados)
    return $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=submeterdadosformulario",
        data: {
            '__EVENTARGUMENT': JSON.stringify(dados)
        }
    });

}


function getIframeLoadingStyle(styles) {
    var style = "";
    // Namespace: cform- (custom form) para evitar conflitos com MDash e outros estilos
    style += ".cform-iframe-loading-overlay{";
    style += "position:absolute;";
    style += "top:0;";
    style += "left:0;";
    style += "width:100%;";
    style += "height:100%;";
    style += "background-color:#ffffff;";
    style += "display:flex;";
    style += "justify-content:center;";
    style += "align-items:center;";
    style += "z-index:999999;";
    style += "}";
    style += ".cform-iframe-loading-overlay #cform-loader-icon{";
    style += "width:100px;";
    style += "height:100px;";
    style += "animation:cformRotate 1.5s linear infinite;";
    style += "}";
    style += ".cform-iframe-loading-overlay .cform-loader-path{";
    style += "fill:var(--cform-loader-color,#073e5a);";
    style += "}";
    style += "@keyframes cformRotate{";
    style += "0%{transform:rotate(0deg);}";
    style += "100%{transform:rotate(360deg);}";
    style += "}";

    style += ".cform-iframe-container{";
    style += "position:relative;";
   // style += "min-height:400px;";
    style += "}";

    styles.push(style);
}

/**
 * Sessões de iframes geridas por generateComponent (vivem no parent — sobrevivem ao postback do iframe).
 */
var GComponentSessions = GComponentSessions || {};
var CFORM_SAVE_INTENT_TTL_MS = 120000;
var CFORM_SAVE_PROBE_DELAYS_MS = [0, 100, 300, 750, 1500, 3000];

function getComponentWatchedFieldsKey(componentId) {
    return "cform_component_" + componentId + "_watched";
}

function getComponentSaveIntentKey(componentId) {
    return "cform_component_" + componentId + "_saveIntent";
}

function loadComponentWatchedFields(componentId) {
    try {
        var raw = localStorage.getItem(getComponentWatchedFieldsKey(componentId));
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function persistComponentWatchedFields(componentId, watchedFields) {
    try {
        localStorage.setItem(getComponentWatchedFieldsKey(componentId), JSON.stringify(watchedFields || {}));
    } catch (error) {
        console.warn("persistComponentWatchedFields:", error);
    }
}

function clearComponentWatchedFields(componentId) {
    try {
        localStorage.removeItem(getComponentWatchedFieldsKey(componentId));
    } catch (error) {
        console.warn("clearComponentWatchedFields:", error);
    }
}

function getIframeFieldValue(iframeDoc, fieldId) {
    var $field = iframeDoc.find("#" + fieldId);
    if ($field.length === 0) {
        return "";
    }

    if ($field.is("select")) {
        var selectedText = $field.find("option:selected").text();
        return ($field.val() || selectedText || "").toString().trim();
    }

    return ($field.val() || $field.text() || "").toString().trim();
}

function getPhcAlertifyLogs(iframeDoc) {
    return iframeDoc.find("#alertify-logs");
}

function hasPhcAlertifySuccess(iframeDoc) {
    return iframeDoc.find(
        "#alertify-logs .alertify-log-success, article.alertify-log-success, .alertify-log.alertify-log-success"
    ).length > 0;
}

function hasPhcAlertifyError(iframeDoc) {
    var $logs = getPhcAlertifyLogs(iframeDoc);
    if ($logs.length === 0) {
        return false;
    }
    return $logs.find(".alertify-log-error").length > 0;
}

function createComponentSession(componentData) {
    var session = GComponentSessions[componentData.id];

    if (!session) {
        session = {
            id: componentData.id,
            fieldWatchers: componentData.fieldWatchers || [],
            afterSaveEvent: componentData.afterSaveEvent || null,
            saveButtonId: componentData.saveButtonId || "#BUGRAVARBottom",
            customPayload: componentData.customPayload || null,
            watchedFields: loadComponentWatchedFields(componentData.id),
            savePending: false,
            completed: false,
            _alertifyObserver: null
        };
        GComponentSessions[componentData.id] = session;
        return session;
    }

    session.fieldWatchers = componentData.fieldWatchers || session.fieldWatchers;
    session.afterSaveEvent = componentData.afterSaveEvent || session.afterSaveEvent;
    session.saveButtonId = componentData.saveButtonId || session.saveButtonId;
    session.customPayload = componentData.customPayload || session.customPayload;
    session.watchedFields = loadComponentWatchedFields(componentData.id);

    return session;
}

function destroyComponentSession(componentId) {
    var session = GComponentSessions[componentId];
    if (!session) {
        return;
    }

    disconnectPhcAlertifyWatcher(session);

    try {
        sessionStorage.removeItem(getComponentSaveIntentKey(componentId));
    } catch (error) {
        console.warn("destroyComponentSession:", error);
    }

    clearComponentWatchedFields(componentId);
    delete GComponentSessions[componentId];
}

function armComponentSaveIntent(session) {
    session.savePending = true;
    try {
        sessionStorage.setItem(getComponentSaveIntentKey(session.id), String(Date.now()));
    } catch (error) {
        console.warn("armComponentSaveIntent:", error);
    }
}

function restoreComponentSaveIntent(session) {
    if (session.savePending) {
        return true;
    }

    try {
        var raw = sessionStorage.getItem(getComponentSaveIntentKey(session.id));
        if (!raw) {
            return false;
        }

        var timestamp = parseInt(raw, 10);
        if (isNaN(timestamp) || (Date.now() - timestamp) > CFORM_SAVE_INTENT_TTL_MS) {
            sessionStorage.removeItem(getComponentSaveIntentKey(session.id));
            return false;
        }

        session.savePending = true;
        return true;
    } catch (error) {
        return false;
    }
}

function clearComponentSaveIntent(session) {
    session.savePending = false;
    try {
        sessionStorage.removeItem(getComponentSaveIntentKey(session.id));
    } catch (error) {
        console.warn("clearComponentSaveIntent:", error);
    }
}

function isPhcGravarPostBackTarget(target) {
    var normalized = (target || "").toString().toUpperCase();
    return normalized.indexOf("BUGRAVAR") !== -1 || normalized.indexOf("GRAVAR") !== -1;
}

function disconnectPhcAlertifyWatcher(session) {
    if (session._alertifyObserver) {
        session._alertifyObserver.disconnect();
        session._alertifyObserver = null;
    }

    if (session._saveProbeTimeouts && session._saveProbeTimeouts.length > 0) {
        session._saveProbeTimeouts.forEach(function (timeoutId) {
            clearTimeout(timeoutId);
        });
        session._saveProbeTimeouts = [];
    }
}

function scheduleAfterSaveProbes(session, probeFn) {
    if (!session._saveProbeTimeouts) {
        session._saveProbeTimeouts = [];
    }

    session._saveProbeTimeouts.forEach(function (timeoutId) {
        clearTimeout(timeoutId);
    });
    session._saveProbeTimeouts = [];

    CFORM_SAVE_PROBE_DELAYS_MS.forEach(function (delayMs) {
        var timeoutId = setTimeout(function () {
            if (!session.completed) {
                probeFn();
            }
        }, delayMs);
        session._saveProbeTimeouts.push(timeoutId);
    });
}

/**
 * Observa o body do iframe (alertify pode injectar #alertify-logs depois do load) + probes limitados.
 */
function connectPhcAlertifyWatcher(iframeDoc, session, onChange) {
    disconnectPhcAlertifyWatcher(session);
    onChange();

    if (session.savePending) {
        scheduleAfterSaveProbes(session, onChange);
    }

    var rootNode = iframeDoc.find("body")[0] || iframeDoc[0];
    if (!rootNode || typeof MutationObserver === "undefined") {
        scheduleAfterSaveProbes(session, onChange);
        return;
    }

    session._alertifyObserver = new MutationObserver(onChange);
    session._alertifyObserver.observe(rootNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"]
    });
}

function bindComponentSaveIntent(iframeDoc, iframeEl, session, onSaveProbe) {
    var armSaveIntent = function () {
        armComponentSaveIntent(session);
        if (typeof onSaveProbe === "function") {
            scheduleAfterSaveProbes(session, onSaveProbe);
        }
    };

    iframeDoc.find(session.saveButtonId)
        .off("click.cformSave mousedown.cformSave")
        .on("click.cformSave mousedown.cformSave", armSaveIntent);

    try {
        var iframeWin = iframeEl.contentWindow;
        if (!iframeWin) {
            return;
        }

        if (typeof iframeWin.__doPostBack === "function" && !iframeWin.__cformSaveHooked) {
            var originalPostBack = iframeWin.__doPostBack;
            iframeWin.__doPostBack = function (eventTarget, eventArgument) {
                if (isPhcGravarPostBackTarget(eventTarget)) {
                    armSaveIntent();
                }
                return originalPostBack.apply(iframeWin, arguments);
            };
            iframeWin.__cformSaveHooked = true;
        }

        if (typeof iframeWin.WebForm_DoPostBackWithOptions === "function" && !iframeWin.__cformWebFormSaveHooked) {
            var originalWebFormPostBack = iframeWin.WebForm_DoPostBackWithOptions;
            iframeWin.WebForm_DoPostBackWithOptions = function (options) {
                var eventTarget = options && options.eventTarget ? options.eventTarget : "";
                if (isPhcGravarPostBackTarget(eventTarget)) {
                    armSaveIntent();
                }
                return originalWebFormPostBack.apply(iframeWin, arguments);
            };
            iframeWin.__cformWebFormSaveHooked = true;
        }
    } catch (error) {
        console.warn("bindComponentSaveIntent: postback hook", error);
    }
}

function syncWatchedFieldsFromIframe(iframeDoc, session) {
    if (!session.fieldWatchers || session.fieldWatchers.length === 0) {
        return;
    }

    session.fieldWatchers.forEach(function (watcher) {
        var key = watcher.key || watcher.fieldId;
        var value = getIframeFieldValue(iframeDoc, watcher.fieldId);
        if (value) {
            session.watchedFields[key] = value;
        }
    });

    persistComponentWatchedFields(session.id, session.watchedFields);
}

function setupComponentFieldWatchers(iframeDoc, session) {
    if (!session.fieldWatchers || session.fieldWatchers.length === 0) {
        return;
    }

    session.watchedFields = session.watchedFields || loadComponentWatchedFields(session.id);

    session.fieldWatchers.forEach(function (watcher) {
        var fieldId = watcher.fieldId;
        var key = watcher.key || fieldId;
        var events = watcher.events || ["change", "keyup", "paste"];
        var $field = iframeDoc.find("#" + fieldId);

        if ($field.length === 0) {
            console.warn("setupComponentFieldWatchers: campo não encontrado", fieldId);
            return;
        }

        var persistFieldValue = function () {
            var value = getIframeFieldValue(iframeDoc, fieldId);
            if (value) {
                session.watchedFields[key] = value;
                persistComponentWatchedFields(session.id, session.watchedFields);
            }
        };

        events.forEach(function (eventName) {
            $field.off(eventName + ".cformFieldWatcher").on(eventName + ".cformFieldWatcher", persistFieldValue);
        });

        persistFieldValue();
    });
}

function tryDispatchAfterSave(iframeDoc, iframeEl, session) {
    if (session.completed) {
        return;
    }

    restoreComponentSaveIntent(session);

    if (!session.savePending) {
        return;
    }

    if (hasPhcAlertifyError(iframeDoc)) {
        clearComponentSaveIntent(session);
        return;
    }

    if (!hasPhcAlertifySuccess(iframeDoc)) {
        return;
    }

    session.completed = true;
    clearComponentSaveIntent(session);
    disconnectPhcAlertifyWatcher(session);
    syncWatchedFieldsFromIframe(iframeDoc, session);

    if (typeof session.afterSaveEvent === "function") {
        try {
            session.afterSaveEvent({
                iframeDoc: iframeDoc,
                iframeEl: iframeEl,
                componentId: session.id,
                watchedFields: session.watchedFields || {},
                customData: session.customPayload
            });
        } catch (error) {
            console.error("afterSaveEvent error:", error);
        }
    }

    clearComponentWatchedFields(session.id);
}

function initComponentIframeSession(componentData, iframeDoc, iframeEl) {
    var session = createComponentSession(componentData);
    var probeAfterSave = function () {
        tryDispatchAfterSave(iframeDoc, iframeEl, session);
    };

    restoreComponentSaveIntent(session);
    bindComponentSaveIntent(iframeDoc, iframeEl, session, probeAfterSave);
    setupComponentFieldWatchers(iframeDoc, session);
    connectPhcAlertifyWatcher(iframeDoc, session, probeAfterSave);

    if (componentData.expressionToExecute && typeof componentData.expressionToExecute === "function") {
        try {
            componentData.expressionToExecute.call(iframeEl, iframeDoc, iframeEl, session);
        } catch (error) {
            console.error("expressionToExecute error:", error);
        }
    }
}

// ...existing code...
function generateComponent(componentData) {


    // Criar container para o iframe com posição relativa
    var containerId = componentData.id + '-container';

    destroyComponentSession(componentData.id);

    $('#' + containerId).remove(); // Remover container existente, se houver
    var container = $("<div>", {
        id: containerId,
        'class': 'cform-iframe-container'
    });

    // Criar overlay de loading (mesmo design do Mdash.html / LOADER JS.js)
    var loaderColor = '#073e5a';
    try {
        if (typeof getColorByType === 'function') {
            var loaderColorObj = getColorByType('primary');
            if (loaderColorObj && loaderColorObj.background) loaderColor = loaderColorObj.background;
        }
    } catch (e) { }

    var overlayHTML = '';
    overlayHTML += '<svg id="cform-loader-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';
    overlayHTML += '  <g>';
    overlayHTML += '    <path class="cform-loader-path" d="M83.3,67.2c-4.6,8.8-12.4,15.4-21.9,18.4c-9.5,3.1-19.7,2.2-28.6-2.4c-8.9-4.6-15.5-12.4-18.5-21.9c-3.7-11.5-1.5-23.5,4.9-32.6c4.6-6.6,11.3-11.8,19.4-14.4c7.1-2.3,14.9-2.3,22-0.3l-4,13.9c-11.5-3.5-23.8,2.5-28.1,13.8C23.9,53.6,29.9,67,41.8,71.5c5.8,2.1,12,2,17.6-0.5c5.6-2.5,9.9-7,12.1-12.8c1.7-4.4,1.9-9.2,0.9-13.7l14.1-3.2C88.6,50.1,87.4,59.2,83.3,67.2z"/>';
    overlayHTML += '    <path class="cform-loader-path" d="M70.7,39.8c-2.1-4.2-5.3-7.6-9.3-9.9l0,0l7.1-12.6l0,0c6.6,3.7,11.8,9.3,15.2,16.1l0,0L70.7,39.8L70.7,39.8z"/>';
    overlayHTML += '  </g>';
    overlayHTML += '</svg>';

    var overlay = $("<div>", {
        'class': 'cform-iframe-loading-overlay',
        style: '--cform-loader-color:' + loaderColor
    }).html(overlayHTML);

    // Criar iframe
    var iframe = $("<iframe>", {
        id: componentData.id,
        src: componentData.src,
        style: componentData.styles + '; opacity: 0; transition: opacity 0.3s ease-in-out;'
    }).attr('custom-data', componentData.customData);

    // Adicionar elementos ao container
    container.append(overlay).append(iframe);

    // Adicionar container ao parent
    $(componentData.parent).append(container);

    // Quando o iframe carregar
    $("#" + componentData.id).on('load', function () {

        var iframeDoc = $(this).contents();
        var iframeElement = this;

        // Esconder elementos
        if (componentData.elementsToHide && componentData.elementsToHide.length > 0) {
            componentData.elementsToHide.forEach(function (element) {
                iframeDoc.find(element).hide();
                iframeDoc.find(element).attr("style", "display: none !important");
            });
        }

        initComponentIframeSession(componentData, iframeDoc, iframeElement);

        // Remover overlay e mostrar iframe suavemente
        setTimeout(function () {
            overlay.fadeOut(400, function () {
                $(this).remove();
                $(iframeElement).css('opacity', '1');
            });
        }, 500); // Pequeno delay para garantir que tudo foi processado
    });

    // Fallback: se o iframe não carregar em 10 segundos
    setTimeout(function () {
        if ($('#' + containerId).find('.cform-iframe-loading-overlay').length > 0) {
            overlay.fadeOut(400, function () {
                $(this).remove();
                $('#' + componentData.id).css('opacity', '1');
            });
            console.warn('Loading timeout for iframe:', componentData.id);
        }
    }, 10000);
}
// ...existing code...

function generateRowAbove(row) {

    var html = ""
    html += "<tr";

    // add body row attributes
    if (row.style) html += " style='" + row.style + "'";
    if (row.rowId) html += " id='" + row.rowId + "'";
    if (row.classes) html += " class='" + row.classes + "'";
    if (row.customData) html += " " + row.customData;

    html += ">";

    // add body columns
    row.cols.forEach(function (col) {
        html += "<td";

        // add body column attributes
        if (col.style) html += " style='" + col.style + "'";
        if (col.colId) html += " id='" + col.colId + "'";
        if (col.classes) html += " class='" + col.classes + "'";
        if (col.customData) html += " " + col.customData;

        html += ">" + col.content + "</td>";
    });

    html += "</tr>";

    return html

}


function getElementValueByType(element) {
    if (element.is("input")) {
        if (element.attr("type") === "checkbox") {
            return element.is(":checked");
        }
        if (element.attr("data-language")) {
            return formatDateForBackend(element.val());
        }
        return element.val();
    } else if (element.is("textarea")) {
        return element.val();
    } else if (element.is("select")) {
        return element.val();
    }
    return null;
}





function setInputValueByType(type, value) {

    switch (type) {
        case "checkbox":
            return value ? "checked" : "";
        default:
            return value;

    }

}


function handleInputCustomData(type, value) {
    switch (type) {
        case "checkbox":
            return value ? " checked" : "";
        default:
            return " ";

    }
}
function generateInput(inputData) {
    var inputHTML = "";

    if (inputData.label) {
        inputHTML += "<label for='" + inputData.id + "'>" + inputData.label + "</label>";
    }

    inputHTML += "<input";

    if (inputData.type) inputHTML += " type='" + inputData.type + "'";
    if (inputData.id) inputHTML += " id='" + inputData.id + "'";
    if (inputData.name) inputHTML += " name='" + inputData.name + "'";
    if (inputData.value) inputHTML += " value='" + setInputValueByType(inputData.type, inputData.value) + "'";
    if (inputData.placeholder) inputHTML += " placeholder='" + inputData.placeholder + "'";
    if (inputData.style) inputHTML += " style='" + inputData.style + "'";
    if (inputData.classes) inputHTML += " class='" + inputData.classes + "'";
    if (inputData.customData) inputHTML += " " + inputData.customData + handleInputCustomData(inputData.type, inputData.value);

    inputHTML += ">";

    return inputHTML;
}

function generateTextarea(textareaData) {
    var textareaHTML = "";

    if (textareaData.label) {
        textareaHTML += "<label for='" + textareaData.id + "'>" + textareaData.label + "</label>";
    }

    textareaHTML += "<textarea";

    if (textareaData.id) textareaHTML += " id='" + textareaData.id + "'";
    if (textareaData.name) textareaHTML += " name='" + textareaData.name + "'";
    if (textareaData.placeholder) textareaHTML += " placeholder='" + textareaData.placeholder + "'";
    if (textareaData.style) textareaHTML += " style='" + textareaData.style + "'";
    if (textareaData.classes) textareaHTML += " class='" + textareaData.classes + "'";
    if (textareaData.customData) textareaHTML += " " + textareaData.customData;
    if (textareaData.cols) textareaHTML += " cols='" + textareaData.cols + "'";
    if (textareaData.rows) textareaHTML += " rows='" + textareaData.rows + "'";

    textareaHTML += ">";

    if (typeof textareaData.value !== "undefined" && textareaData.value !== null) textareaHTML += textareaData.value;

    textareaHTML += "</textarea>";

    return textareaHTML;
}




function generateButton(button) {
    var html = "<button";

    // add button attributes
    if (button.style) html += " style='" + button.style + "'";
    if (button.buttonId) html += " id='" + button.buttonId + "'";
    if (button.id) html += " id='" + button.id + "'";
    if (button.classes) html += " class='" + button.classes + "'";
    if (button.type) html += " type='" + button.type + "'";
    if (button.customData) html += " " + button.customData;

    // add onClick event
    if (button.onClick) {
        html += " onclick='" + button.onClick + "'";
    }

    html += ">" + button.label + "</button>";

    return html;
}

function generateModalHTML(modalData) {
    var customData = modalData.customData ? ' ' + modalData.customData.trim() : '';
    var otherClasses = modalData.otherclassess ? ' ' + modalData.otherclassess.trim() : '';
    var dialogClass = modalData.dialogClass ? ' ' + modalData.dialogClass.trim() : (modalData.title ? '' : ' modal-dialog-centered');
    var dialogStyle = modalData.dialogStyle ? ' style="' + modalData.dialogStyle + '"' : '';
    var dialogRole = modalData.dialogRole ? ' role="' + modalData.dialogRole + '"' : '';

    var modalHTML = '<div' + customData + ' class="modal' + otherClasses + '" id="' + modalData.id + '" tabindex="-1">';
    modalHTML += '<div class="modal-dialog' + dialogClass + '"' + dialogStyle + dialogRole + '>';
    modalHTML += '<div class="modal-content">';

    if (modalData.title) {
        modalHTML += '<div class="modal-header">';
        modalHTML += '<button type="button" class="close" data-dismiss="modal">×</button>';
        modalHTML += '<h3 style="font-weight: bold;" class="modal-title">' + modalData.title + '</h3>';
        modalHTML += '</div>';
    }

    modalHTML += '<div class="modal-body">' + (modalData.body || '') + '</div>';

    if (modalData.footerContent) {
        modalHTML += '<div class="modal-footer">' + modalData.footerContent + '</div>';
    }

    modalHTML += '</div></div></div>';
    return modalHTML.trim();
}

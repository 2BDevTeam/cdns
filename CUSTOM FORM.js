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
});


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
    switch (content.contentType) {
        case "input":
            return generateInput(content);
        case "textarea":
            return generateTextarea(content);
        case "select":
            return generateSelect(content.selectData, content.classes, content.style, content.selectCustomData, content.fieldToOption, content.fieldToValue, content.label);
        case "button":
            return generateButton(content);
        case "div":
            return generateDiv(content);
    }
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
            return generateSelect(content.selectData, content.classes, content.style, content.selectCustomData, content.fieldToOption, content.fieldToValue, content.label);
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
function generateSelect(selectData, classes, style, selectCustomData, fieldToOption, fieldToValue, label) {
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
    if (style) selectHTML += " style='" + style + "'";
    if (classes) selectHTML += " class='" + classes + "'";
    if (selectCustomData) selectHTML += " " + selectCustomData;
    selectHTML += ">"
    selectHTML += "<option selected disabled value='' ></option>";
    options.forEach(function (option) {
        selectHTML += "<option value='" + option.value + "'>" + option.option + "</option>";
    });
    selectHTML += '</select>';

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

// ...existing code...
function generateComponent(componentData) {


    // Criar container para o iframe com posição relativa
    var containerId = componentData.id + '-container';

    $('#' + containerId).remove(); // Remover container existente, se houver
    var container = $("<div>", {
        id: containerId,
        'class': 'iframe-container'
    });

    // Criar overlay de loading
    var overlayHTML = '';
    overlayHTML += '<div class="screen-loading-animation">';
    overlayHTML += '    <div class="loading-line"></div>';
    overlayHTML += '    <div class="loading-line"></div>';
    overlayHTML += '    <div class="loading-line"></div>';
    overlayHTML += '    <div class="loading-line"></div>';
    overlayHTML += '    <div class="connection-dot"></div>';
    overlayHTML += '    <div class="connection-dot"></div>';
    overlayHTML += '    <div class="connection-dot"></div>';
    overlayHTML += '</div>';
    overlayHTML += '<div class="loading-progress">';
    overlayHTML += '    <div class="progress-bar"></div>';
    overlayHTML += '</div>';
    overlayHTML += '<div class="loading-text">A carregar conteúdo</div>';
    overlayHTML += '<div class="loading-subtext">Aguarde um momento...</div>';

    var overlay = $("<div>", {
        'class': 'iframe-loading-overlay'
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
        componentData.elementsToHide.forEach(function (element) {

            iframeDoc.find(element).hide();
            iframeDoc.find(element).attr('style', 'display: none !important');
        });

        // Executar expressão customizada
        if (componentData.expressionToExecute && typeof componentData.expressionToExecute === 'function') {

            try {
                componentData.expressionToExecute.call(this, iframeDoc, this);
            } catch (error) {
                console.error('Error executing expression:', error);
            }
        }

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
        if ($('#' + containerId).find('.iframe-loading-overlay').length > 0) {
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
    // Generate the custom data attributes string


    // Start building up the modal HTML string with the opening div
    var modalHTML = '<div "' + modalData.customData + '"   class="modal ' + modalData.otherclassess + '" id="' + modalData.id + '" tabindex="-1">';

    // Add the modal dialog and content divs
    modalHTML += '<div class="modal-dialog ' + (modalData.title ? '' : 'modal-dialog-centered') + '">';
    modalHTML += '<div class="modal-content">';

    // Add the modal header if there is a title
    if (modalData.title) {
        modalHTML += '<div class="modal-header">';
        modalHTML += '<button type="button" class="close" data-dismiss="modal">×</button>';
        modalHTML += '<h3 style="font-weight: bold;" class="modal-title">' + modalData.title + '</h3>';

        modalHTML += '</div>';
    }
    // Add the modal body
    modalHTML += '<div class="modal-body">' + modalData.body + '</div>';

    // Add the modal footer if there is footer content
    if (modalData.footerContent) {
        modalHTML += '<div class="modal-footer">' + modalData.footerContent + '</div>';
    }

    // Close the modal content and dialog divs, and the modal div itself
    modalHTML += '</div></div></div>';

    return modalHTML.trim(); // Remove any leading/trailing whitespace
}

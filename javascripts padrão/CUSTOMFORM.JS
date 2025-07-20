

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
    this.label = data.label || "";
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
    var html = "<div ";
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




TableHtml.prototype.toFormData = function (filter) {

    var renderedTable = this.getRenderedTable();
    var data = [];


    var rows = renderedTable.rows;
    rows.forEach(function (rowData) {

        var row = new FormTableRow(rowData);
        var cells = row.getCells();

        var objectToBuild = {}
        cells.filter(function (cellFlt) {
            return cellFlt.column.inputdata.campodb == true && eval(filter);
        }).forEach(function (cell) {

            var cellObject = new CellObject(cell);
            objectToBuild[cellObject.column.campo] = cellObject.value;

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
            "sLengthMenu": "Mostrar _MENU_ registros",
            "sZeroRecords": "Sem resultados",
            "sEmptyTable": "Sem registos",
            "sInfo": "Mostrando registros de _START_ a _END_ de um total de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando registros de 0 a 0 de um total de 0 registros",
            "sInfoFiltered": "(filtrado de um total de _MAX_ registros)",
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


function FormTableInputData(data) {

    this.contentType = data.contentType || "";
    this.type = data.type || "";
    this.value = data.value || "";
    this.label = data.label || "";
    this.placeholder = data.placeholder || "";
    this.value = data.value || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
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


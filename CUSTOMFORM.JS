

var GRenderedTables = [new RenderedTable({})];
GRenderedTables = [];

var GEventData = new EventData({});
console.log("INITIALIZANDO CUSTOMFORM.JS")
var GClickedEventRow = new FormTableRow({});

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
    this.renderedTable =data.renderedTable? new RenderedTable(data.renderedTable) : new RenderedTable({});
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
    var inputData = new FormTableInputData(data?data:{});

    if(!inputData){

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


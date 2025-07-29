var GCamposOcultar = [{ campo: "" }]
GCamposOcultar = []

$(document).ready(function () {


    // Captura o evento de teclado para CTRL + I
    $(document).keydown(function (event) {
        if (event.ctrlKey && event.key.toLowerCase() === "i") {
            event.preventDefault(); // Evita ações padrão do navegador (como abrir ferramentas de desenvolvimento)
            adicionarCheckboxOcultarCampo();
        }
    });

    //formatAllInputDigits()
});



function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.substring(0, 25);
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

function getEcra() {

    return $("#FormName").val()

}


function getEcraEventos() {
    return $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=geteventosbyecra",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ ecran: getEcra() }]),
        }
    })


}

function ocultarColunaByCabecalhoNome(nomeCab, tabelaId) {

    var cabecalho = $('th').filter(function () {
        return this.textContent.trim() === nomeCab
    })

    if (cabecalho.length == 0) {
        return
    }

    cabecalho.hide()
    var colunaOcultarindex = cabecalho.index()

    $('th').filter(function () {
        return this.textContent.trim() === nomeCab
    }).hide()

    $("#" + tabelaId + " tr").each(function () {
        if (colunaOcultarindex >= 0) {
            var rows = $(this).find("td");
            rows.eq(colunaOcultarindex).hide();
        }

    });
}

$(document).on('click', '.home-collapse-header', function () {
    $(this).find(".glyphicon").toggleClass("glyphicon-triangle-bottom");
    //$(this).next("div").css("hidden");
    $(this).next("div").toggleClass("hidden");

});

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

function generateAccordionHtml(containerId, accordionData) {

    var accordionHtml = '<div class="accordion" id="' + containerId + '">';

    accordionData.forEach(function (item, index) {
        var isActive = index === 0 ? "show" : ""; // Primeiro item expandido por padrão
        var buttonCollapsed = index === 0 ? "" : "collapsed"; // Estado de colapso
        var uniqueId = "collapse" + (index + 1);
        var headingId = "heading" + (index + 1);

        // Construindo cada card
        accordionHtml +=
            '<div ' + item.containerCustomData + ' class="card">' +
            '<div class="card-header" id="' + headingId + '">' +
            '<h2 class="mb-0">' +
            '<button "' + item.customData + '"  class="btn btn-link btn-block text-left ' + accordionData.classes + '" ' +
            'type="button" ' +
            'data-toggle="collapse" ' +
            'data-target="#' + uniqueId + '" ' +
            'aria-expanded="' + (item.isActive ? 'true' : 'false') + '" ' +
            'aria-controls="' + uniqueId + '">' +
            item.title +
            '</button>' +
            '</h2>' +
            '</div>' +
            '<div id="' + uniqueId + '" class="collapse ' + item.isActive + '" ' +
            'aria-labelledby="' + headingId + '" data-parent="#' + containerId + '">' +
            '<div class="card-body">' +
            item.content +
            '</div>' +
            '</div>' +
            '</div>';
    });

    accordionHtml += '</div>'; // Fechando o container do acordeão

    return accordionHtml;
}

function generateAccordion(containerSelector, accordionData) {
    var accordionContainer = $(containerSelector);
    accordionContainer.empty(); // Limpa qualquer conteúdo existente

    accordionData.forEach(function (item, index) {
        var isActive = index === 0 ? "show" : ""; // Primeiro item expandido por padrão
        var buttonCollapsed = index === 0 ? "" : "collapsed"; // Estado de colapso
        var uniqueId = "collapse" + (index + 1);
        var headingId = "heading" + (index + 1);

        // Construindo o HTML como string
        var card =
            '<div class="card">' +
            '<div class="card-header" id="' + headingId + '">' +
            '<h2 class="mb-0">' +
            '<button class="btn btn-link btn-block text-left ' + buttonCollapsed + '" ' +
            'type="button" ' +
            'data-toggle="collapse" ' +
            'data-target="#' + uniqueId + '" ' +
            'aria-expanded="' + (isActive ? 'true' : 'false') + '" ' +
            'aria-controls="' + uniqueId + '">' +
            item.title +
            '</button>' +
            '</h2>' +
            '</div>' +
            '<div id="' + uniqueId + '" class="collapse ' + isActive + '" ' +
            'aria-labelledby="' + headingId + '" data-parent="' + containerSelector + '">' +
            '<div class="card-body">' +
            item.content +
            '</div>' +
            '</div>' +
            '</div>';

        // Adicionando ao container do acordeão
        accordionContainer.append(card);
    });
}
function generateDashFactCard(data) {
    // Start building up the dash fact card HTML string
    var dashFactCardHTML = '<div class="dash-fact-container">';
    dashFactCardHTML += '<div class="row dash-fact-title">';
    dashFactCardHTML += '<div class="col-md-6 pull-left"><h1 style="text-align:left;font-size: 20px;font-family: Nunito,sans-serif;color:#626e78;font-weight:bold">';
    dashFactCardHTML += data.title;
    dashFactCardHTML += '</h1></div>';
    dashFactCardHTML += '</div>';
    dashFactCardHTML += '<div class="row dash-fact-body">';
    dashFactCardHTML += data.body;
    dashFactCardHTML += '</div>';
    dashFactCardHTML += '</div>';

    return dashFactCardHTML;
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



function handlerContainerContentGenerator(content) {

    switch (content.contentType) {
        case "input":
            return generateInput(content);
        case "textarea":
            return generateTextarea(content);
        case "select":
            return generateSelect(content.selectData, content.classes, content.style, content.selectCustomData, content.fieldToOption, content.fieldToValue, content.label);
        case "button":
            return generateButton(content);
    }
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
function generateFormContainer(mainContainerId, sourceData, containers) {

    var mainContainer = "<div data-sourcetable='" + sourceData.sourceTable + "' data-sourcekey='" + sourceData.sourceKey + "' id='" + mainContainerId + "' class='row mainContainer'>";

    containers.forEach(function (container) {

        mainContainer += generateContainerCol(container)
    });

    mainContainer += "</div>";

    return mainContainer
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
    if (inputData.customData) inputHTML += " " + inputData.customData;

    inputHTML += handleInputCustomData(inputData.type, inputData.value)
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
function registerCollapseHeaderClickListener() {
    var collapseStyle = ""
    collapseStyle += "<style type='text/css'>.pad {"
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
    collapseStyle += "    padding: 30px 0;"
    collapseStyle += "    display: flex;"
    collapseStyle += "    flex-direction: column;"
    collapseStyle += "    gap: 20px;"
    collapseStyle += "    -moz-transition: height 0.5s;"
    collapseStyle += "    -ms-transition: height 0.5s;"
    collapseStyle += "    -o-transition: height 0.5s;"
    collapseStyle += "    -webkit-transition: height 0.5s;"
    collapseStyle += "    transition: height 0.5s;"
    collapseStyle += "  }"
    collapseStyle += "</style>"
    $("#mainPage").append(collapseStyle)


    /*$(".home-collapse-header").on("click", function () {
    
    });*/
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
        modalHTML += '<h4 class="modal-title">' + modalData.title + '</h4>';
        // modalHTML += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
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


function adicionarCheckboxOcultarCampo() {
    $(".hide-checkbox").remove()
    $("#botaoOcultarElementos").remove()
    $('.form-group.mainformfg').each(function () {
        var id = $(this).attr('id'); // Obtém o ID do elemento
        if (id && id.startsWith("ctl00_conteudo_")) {
            var campo = id.replace("ctl00_conteudo_", ""); // Remove o prefixo
            var checkbox = $('<input type="checkbox" class="hide-checkbox">')
                .attr("data-campo", campo) // Define o atributo data-campo
                .css({
                    "border": "2px solid red",
                    "width": "16px",
                    "height": "16px"
                })
                .insertBefore($(this));

            // Adiciona evento de mudança (check/uncheck) usando função anônima
            checkbox.on("change", function () {
                if ($(this).is(":checked")) {
                    GCamposOcultar.push({ campo: campo });
                } else {
                    GCamposOcultar = GCamposOcultar.filter(function (item) {
                        return item.campo !== campo;
                    });
                }
                console.log(GCamposOcultar); // Exibe o array atualizado no console
            });
        }
    });

    var botaoOcultarElementos = {
        style: "",
        buttonId: "botaoOcultarElementos",
        classes: "btn btn-warning btn-sm",
        customData: " type='button' data-tooltip='true' data-original-title='Ocultar elementos' ",
        label: "Ocultar Elementos",

        onClick: "generateVBHideScript()",
    };

    var buttonHtml = "<div class='btn-group '>"
    buttonHtml += generateButton(botaoOcultarElementos);
    buttonHtml += "</div>"

    $("#BUCANCELARBottom").parent().after(buttonHtml)
}


function ocultarCamposVb() {

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=ocultarcamposbyevento",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify({ eeventosstamp: $("#selectEvento").val(), campos: GCamposOcultar }),
        },
        success: function (response) {

            var errorMessage = "ao ocultar campos "
            try {
                console.log("Response evvv...", response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    alertify.error("Erro  " + errorMessage, 10000)
                    return false
                }

                alertify.success("Campos ocultados regrave o evento actualizado para reflectir rapidamente", 5000)
                location.reload()
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    })




}


function formatAllInputDigits() {

    var elementsDate = document.querySelectorAll('input[type="number"]');

    // Convert the NodeList to an array and apply Cleave to each input element
    Array.from(elementsDate).forEach(function (element) {

        formatarInputNumber(element.id)
    });
}


function formatarInputNumber(idElemento) {
    if ($('#' + idElemento).length == 0) {
        return false
    }

    var newCloned = $('#' + idElemento).clone().attr('data-cloned', idElemento)

    newCloned.addClass("inputformatado")
    newCloned.removeClass("source-bind-listener")
    newCloned.removeAttr("id")
    newCloned.removeAttr("name")
    newCloned.removeAttr("data-obrigatorio")
    newCloned.removeAttr("data-sourcecampo")
    newCloned.removeAttr("data-sourcename")
    newCloned.removeAttr("onblur")
    newCloned.attr("type", "text")
    newCloned.attr("value", newCloned.val().replace(/ /g, ''))
    newCloned.attr("value", newCloned.val().replace(/ /g, ''))
    var number = newCloned.val()
    newCloned.val(number.replace(/\B(?=(\d{3})+(?!\d))/g, " "));

    $('#' + idElemento).before(newCloned)
    newCloned.val()
    $("#" + idElemento).hide()


    var cleave = new Cleave(newCloned, {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand', delimiter: " ",
    });

    newCloned.off("keyup").on("keyup", function () {

        var valorNaoFormatado = Number(this.value.replaceAll(" ", "").replaceAll(",", ""))

        $("#" + $(this).data("cloned")).val(valorNaoFormatado).trigger("change")

    });




}



function generateVBHideScript() {

    $("#modalOcultarElementos").remove();
    getEcraEventos().then(function (ecraEventosResult) {

        if (ecraEventosResult.cod != "0000") {

            console.log("Erro ao trazer resultado dos eventos", ecraEventosResult)
            return
        }
        var eventosSelect = generateSelect(ecraEventosResult.data, "form-control", "width:100%", "id='selectEvento' ", "resumo", "eeventosstamp")

        var modalBodyHtml = "<div class='modalOcultarEventoContainer'>"
        modalBodyHtml += "<label>Eventos:<label/>"
        modalBodyHtml += eventosSelect
        modalBodyHtml += "</div>"

        var modalData = {
            title: "<h4>Dados do evento</h4>",
            id: "modalOcultarElementos",
            customData: "",
            otherclassess: "",
            body: modalBodyHtml,
            footerContent: "<button type='button' onClick='ocultarCamposVb()' class='btn btn-primary' >Submeter</button>"
        }
        var modalHTML = generateModalHTML(modalData);
        $("#maincontent").append(modalHTML);

        $("#selectEvento").select2({
            width: "100%",
            allowClear: false
        });

        $("#modalOcultarElementos").show();



    })



}


function generateCardHTML(cardData) {
    // Start building the card HTML
    var cardHTML = '<div id="' + (cardData.id || '') + '" style="margin-top:1em" class="dashcard">';

    // Add the card header with custom data attributes
    cardHTML += '<div class="dashcard-header dashcard-header-' + cardData.type + '" ' + (cardData.headerCustomData || '') + '>';
    cardHTML += '<div class="col-md-12 col-sm-12">';
    cardHTML += '<h4 style="text-align:left;font-size: 20px;font-family: Nunito,sans-serif;color:white;font-weight:bold">';
    cardHTML += cardData.title + '</h4>';
    cardHTML += '</div>';
    cardHTML += '</div>';

    // Add the card body with custom data attributes
    cardHTML += '<div class="dashcard-body" ' + (cardData.bodyCustomData || '') + '>';
    cardHTML += cardData.bodyContent;
    cardHTML += '</div>';

    // Close the card div
    cardHTML += '</div>';

    return cardHTML.trim(); // Remove any leading/trailing whitespace
}


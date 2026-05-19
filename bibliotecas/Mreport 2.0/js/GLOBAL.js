var GCamposOcultar = [{ campo: "" }]
GCamposOcultar = []

function spinnerHandler() {

    return;
    var myElement = document.querySelector("#ctl00_bfooter_Nup1");

    var observerOnDisplayNone = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "style") {
                var newValue = mutation.target.style.display;
                if (newValue === "none") {


                    $("#mainSpinnerContainer").css("display", "none")


                }
            }
        });
    });
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === "style") {
                var newValue = mutation.target.style.display;
                if (newValue === "block") {
                    console.log("Elemento exibido!");

                    var mainSpinnerContainer = "<div style='display:none' id='mainSpinnerContainer'>"
                    mainSpinnerContainer += " <div  class='main-spinner-overlay'>"
                    mainSpinnerContainer += "   <div class='recordx'></div>"
                    //mainSpinnerContainer += "  br <div class='text'><p>Carregando...</p></div>"

                    mainSpinnerContainer += "</div>"
                    mainSpinnerContainer += "</div>"

                    if ($("#mainSpinnerContainer").length === 0) {
                        $("#aspnetForm").append(mainSpinnerContainer);
                    }

                    console.log("main spinner", $("#mainSpinnerContainer").length)
                    $("#mainSpinnerContainer").css("display", "block")




                }
            }
        });
    });

    observer.observe(myElement, { attributes: true, attributeFilter: ["style"] });
    observerOnDisplayNone.observe(myElement, { attributes: true, attributeFilter: ["style"] });



}
$(document).ready(function () {


    $(document).on('click', '.home-collapse-header', function () {
        $(this).find(".glyphicon").toggleClass("glyphicon-triangle-bottom");
        //$(this).next("div").css("hidden");
        $(this).next("div").toggleClass("hidden");

    });

    var mainSpinnerContainer = "<div style='display:none' id='mainSpinnerContainer'>"
    mainSpinnerContainer += " <div  class='main-spinner-overlay'>"
    mainSpinnerContainer += "   <div class='recordx'></div>"
    //mainSpinnerContainer += "  br <div class='text'><p>Carregando...</p></div>"

    mainSpinnerContainer += "</div>"
    mainSpinnerContainer += "</div>"
    $("#aspnetForm").append(mainSpinnerContainer);

    spinnerHandler();




    // Captura o evento de teclado para CTRL + I
    $(document).keydown(function (event) {
        if (event.ctrlKey && event.key.toLowerCase() === "i") {
            event.preventDefault(); // Evita ações padrão do navegador (como abrir ferramentas de desenvolvimento)
            adicionarCheckboxOcultarCampo();
        }
    });

    formatAllInputDigits();
/*
    var skeletonCSS =
         +
        ".mdash-skeleton {" +
        "    background: #eee;" +
        "    border-radius: 6px;" +
        "    position: relative;" +
        "    overflow: hidden;" +
        "}" +

      
        ".mdash-skeleton::after {" +
        "    content: '';" +
        "    position: absolute;" +
        "    top: 0;" +
        "    left: -150px;" +
        "    height: 100%;" +
        "    width: 150px;" +
        "    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);" +
        "    animation: shimmer 1.5s infinite;" +
        "}" +

        "@keyframes shimmer {" +
        "    0% {" +
        "        left: -150px;" +
        "    }" +
        "    100% {" +
        "        left: 100%;" +
        "    }" +
        "}" +

      
        ".mdash-skeleton-image {" +
        "    width: 100%;" +
        "    height: 150px;" +
        "    margin-bottom: 20px;" +
        "}" +

        ".mdash-skeleton-title {" +
        "    width: 70%;" +
        "    height: 20px;" +
        "    margin: 0 auto 15px auto;" +
        "}" +

        ".mdash-skeleton-text {" +
        "    width: 90%;" +
        "    height: 15px;" +
        "    margin: 8px auto;" +
        "}";

    // Criar uma tag <style> e adicionar o CSS ao <head>

    $('head').append('<style>' + skeletonCSS + '</style>');*/

});

function isDashboard(codigodashboard) {

    params = new URLSearchParams(document.location.search);
    codigomdash = params.get("codigomdash");

    return codigomdash == codigodashboard;

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


function generateSkeleton(skeletonData) {
    var skeletonHTML = "";
    skeletonHTML += '<div id="' + skeletonData.id + '" class="mdashskeleton">';
    skeletonHTML += '    <div class="mdash-skeleton mdash-skeleton-image"></div>';
    skeletonHTML += '    <div class="mdash-skeleton mdash-skeleton-title"></div>';
    skeletonHTML += '    <div class="mdash-skeleton mdash-skeleton-text"></div>';
    skeletonHTML += '    <div class="mdash-skeleton mdash-skeleton-text"></div>';
    skeletonHTML += '</div>';

    return skeletonHTML;
}



$(document).on('click', '.home-collapse-header', function () {
    $(this).find(".glyphicon").toggleClass("glyphicon-triangle-bottom");
    //$(this).next("div").css("hidden");
    $(this).next("div").toggleClass("hidden");

});


function formatarInputNumber(idElemento) {
    return false;
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

    newCloned.off("change").on("change", function () {

        var valorNaoFormatado = Number(this.value.replaceAll(" ", "").replaceAll(",", ""))

        $("#" + $(this).data("cloned")).val(valorNaoFormatado).trigger("change")

    });




}


function registerDynamicEvent(selector, eventType, callback) {
    $(selector).removeAttr("href");
    $(document).off(eventType, selector).on(eventType, selector, callback);
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


function hideOrShowKoColunaByNomeCampo(gridData, nome, command) {
    if (typeof gridData.cols !== "function") return;

    var gridCols = gridData.cols();
    var colData = gridCols.find(function (col) {
        return col.FieldName() === nome
    });
    if (colData) {
        colData.Visible(command === "hide" ? false : true);
    }
}


function getEcra() {

    return $("#FormName").val()

}


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.substring(0, 25);
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
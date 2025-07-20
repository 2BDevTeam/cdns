


var GMDashContainers = [new MdashContainer({})];
GMDashContainers = []



//ClassesMdashContainer

function UIObjectFormConfig(data) {

    this.campo = data.campo || "";
    this.tipo = data.tipo || "";
    this.titulo = data.titulo || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.selectValues = data.selectValues || [];
    this.colSize = data.colSize || "4";
    this.fieldToOption = data.fieldToOption || "";
    this.fieldToValue = data.fieldToValue || "";
    this.contentType = data.contentType || "input";

}

function MdashContainer(data) {

    var maxOrdem = 0;
    if (Array.isArray(GMDashContainers) && GMDashContainers.length > 0) {
        maxOrdem = GMDashContainers.reduce(function (max, container) {
            return Math.max(max, container.ordem || 0);
        }, 0);
    }
    this.mdashcontainerstamp = data.mdashcontainerstamp || generateUUID();
    this.codigo = data.codigo || "";
    this.titulo = data.titulo || "";
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 12;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.dashboardstamp = data.dashboardstamp || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashcontainerstamp";
}


function getContainerUIObjectFormConfigAndSourceValues() {

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 6, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
    ]

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainers", idField: "mdashcontainerstamp" };
}











$(document).ready(function () {
    // Add global styles
    var styles = [];
    getDashboardDefaultStyles(styles);


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

    registerListenersMdash()
});




function handleConfigReactive() {

    PetiteVue.createApp({
        GMDashContainers: GMDashContainers,
        syncContainerByStamp: function (stamp) {
            var container = this.GMDashContainers.find(function (c) {
                return c.mdashcontainerstamp === stamp;
            });
            return container ? container.titulo : "";
        }
    }).mount('#m-dash-main-container');
}

function getLocalSource(source) {
    var localsource = []
    localsource = eval(source)
    return localsource
}


function registerListenersMdash() {

    $(document).off("click", ".open-config-container-btn").on("click", ".open-config-container-btn", function (e) {

        var idValue = $(this).closest(".m-dash-container").attr("idValue");
        var localsource = $(this).closest(".m-dash-container").attr("localsource");
        var idField = $(this).closest(".m-dash-container").attr("idfield");
        var componente = $(this).closest(".m-dash-container").attr("componente");
        var localSourceRes = getLocalSource(localsource);

        var mdashConfigItem = localSourceRes.find(function (obj) {
            return obj[idField] == idValue;
        });
        var objectsUIFormConfig = [new UIObjectFormConfig({})]
        if (mdashConfigItem) {

            objectsUIFormConfig = mdashConfigItem.objectsUIFormConfig;

            var sufixoForm = localsource;
            var containerId = "Container" + localsource;

            var sourceData = {
                sourceTable: localsource,
                sourceKey: localsource
            }
            var containers = [];

            objectsUIFormConfig.forEach(function (obj) {

                containers.push({
                    colSize: obj.colSize,
                    style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                    content: {
                        contentType: obj.contentType,
                        type: obj.tipo,
                        id: obj.campo,
                        classes: obj.classes + " mdashconfig-item-input",
                        customData: obj.customData + " v-model='mdashConfigItem." + obj.campo + "'",
                        style: obj.style,
                        selectCustomData: obj.customData + " v-model='mdashConfigItem." + obj.campo + "'",
                        fieldToOption: obj.fieldToOption,
                        fieldToValue: obj.fieldToValue,
                        label: obj.titulo,
                        selectData: obj.selectValues,
                        value: mdashConfigItem[obj.campo],
                        event: "",
                        placeholder: "",

                    }
                })



            });



            var indexField = 0

            $("#modalMdashConfigItem").remove()
            var containerData = {
                containerId: containerId,
                spinnerId: "overlay" + sufixoForm,
                hasSpinner: false,
                customData: "",
                sourceData: sourceData,
                items: containers
            }
            var formContainerResult = GenerateCustomFormContainer(containerData);

            var modalBodyHtml = ""
            modalBodyHtml += formContainerResult;

            var modalMdashConfigItem = {
                title: "Configuração ",
                id: "modalMdashConfigItem",
                customData: "",
                otherclassess: "",
                body: modalBodyHtml,
                footerContent: "",
            };
            var modalHTML = generateModalHTML(modalMdashConfigItem);

            $("#maincontent").append(modalHTML);

            $("#modalMdashConfigItem").modal("show");
            PetiteVue.createApp({
                mdashConfigItem: mdashConfigItem,
            }).mount('#maincontent');


        }


    })

    $(document).off("click", ".remover-container-btn").on("click", ".remover-container-btn", function (e) {


        var containerId = $(this).closest(".m-dash-container").attr("id");

        GMDashContainers = GMDashContainers.filter(function (container) {
            return container.mdashcontainerstamp !== containerId;
        });

        $(this).closest(".m-dash-container").remove();

    })

    $(document).off("click", "#addContainerMDashBtn").on("click", "#addContainerMDashBtn", function (e) {

        var mdashcontainerstamp = generateUUID();
        var codigo = "CONTAINER_" + mdashcontainerstamp;

        var containerUIObjectFormConfigResult = getContainerUIObjectFormConfigAndSourceValues();

        var mdashContainer = new MdashContainer({
            mdashcontainerstamp: mdashcontainerstamp,
            codigo: codigo,
            titulo: "Novo Container",
            objectsUIFormConfig: containerUIObjectFormConfigResult.objectsUIFormConfig,
            localsource: containerUIObjectFormConfigResult.localsource,
            idfield: containerUIObjectFormConfigResult.idField
        });

        GMDashContainers.push(mdashContainer);

        addContainerMDashConfig(mdashContainer, containerUIObjectFormConfigResult);

    })

}

function addContainerMDashConfig(container, containerUIObjectFormConfigResult) {

    var mdashContainerHTML = "<div componente='Container' idValue='" + container.mdashcontainerstamp + "' localsource='" + containerUIObjectFormConfigResult.localsource + "' idfield='" + container.idfield + "' class='m-dash-container' id='" + container.mdashcontainerstamp + "'>";
    mdashContainerHTML += "<h4 style='margin-top:0.4em' class='m-dash-container-title'>" + " {{ syncContainerByStamp('" + container.mdashcontainerstamp + "') }}" + "</h4>";

    var botaoAdicionarItem = {
        style: "",
        buttonId: "addItemContainerBtn_" + container.mdashcontainerstamp,
        classes: "btn btn-xs btn-default add-item-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Adicionar item ao container' ",
        label: "<span class='glyphicon glyphicon glyphicon-plus' ></span>",
        onClick: "",
    };
    var addItemButtonHtml = generateButton(botaoAdicionarItem);

    var botaoRemoverContainer = {
        style: "",
        buttonId: "",
        classes: "btn btn-xs btn-default  remover-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Remover container' ",
        label: "<span class='glyphicon glyphicon glyphicon-trash' ></span>",
        onClick: "",
    };
    var removerContainerHtml = generateButton(botaoRemoverContainer);

    var openConfigContainerBtn = {
        style: "",
        buttonId: "openConfigContainerBtn_" + container.mdashcontainerstamp,
        classes: "btn btn-xs btn-default open-config-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Abrir configurações do container' ",
        label: "<span class='glyphicon glyphicon-cog'></span>",
        onClick: "",
    };
    var openConfigButtonHtml = generateButton(openConfigContainerBtn);

    var actionsContainer = "<div style='display:flex;column-gap:0.5em'>"
    actionsContainer += addItemButtonHtml;
    actionsContainer += removerContainerHtml
    actionsContainer += openConfigButtonHtml;
    actionsContainer += "</div>"

    mdashContainerHTML += "<div class='m-dash-container-actions'>" + actionsContainer + "</div>";
    mdashContainerHTML += "</div>";

    mdashContainerHTML += "<div class='m-dash-container-body'>";
    mdashContainerHTML += "<div class='row'>";
    mdashContainerHTML += "</div>";
    mdashContainerHTML += "</div>";

    $("#m-dash-containers").append(mdashContainerHTML);

    handleConfigReactive();

}


function getDashboardDefaultStyles(styles) {
    var dashboardStyle = "";
    dashboardStyle += ".m-dashboard-header {";
    dashboardStyle += "    display: flex;";
    dashboardStyle += "    margin-bottom: 30px;";
    dashboardStyle += "    background: #FFF;";
    dashboardStyle += "    padding: 30px;";
    dashboardStyle += "    border-radius: 8px;";
    dashboardStyle += "    box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-body {";
    dashboardStyle += "    display: flex;";
    dashboardStyle += "    flex-direction: column;";
    dashboardStyle += "    gap: 20px;";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-header h1 {";
    dashboardStyle += "    margin: 0;";
    dashboardStyle += "    font-weight: bold;";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-filter {";
    dashboardStyle += "    background: #FFF;";
    dashboardStyle += "    -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    -moz-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    border-radius: 12px;";
    dashboardStyle += "    padding: 30px;";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-filter-btn-group {";
    dashboardStyle += "    display: flex;";
    dashboardStyle += "    flex-direction: column;";
    dashboardStyle += "    gap: 10px;";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-btn-filter {";
    dashboardStyle += "    display: flex;";
    dashboardStyle += "    justify-content: space-between;";
    dashboardStyle += "    gap: 5px;";
    dashboardStyle += "}";
    dashboardStyle += ".m-dashboard-data-headers {";
    dashboardStyle += "    background: #FFF;";
    dashboardStyle += "    -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    -moz-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardStyle += "    border-radius: 12px;";
    dashboardStyle += "    padding: 30px;";
    dashboardStyle += "    display: flex;";
    dashboardStyle += "    flex-direction: column;";
    dashboardStyle += "    gap: 10px;";
    dashboardStyle += "    font-size: 0.9em;";
    dashboardStyle += "}";
    styles.push(dashboardStyle);
}

function generateDefaultMDashboardHTML(cardData) {
    // Start building the card HTML
    var cardHTML = '<div id="' + (cardData.id || '') + '" style="margin-top:1em" class="m-dashboard">';

    // Add the card header with custom data attributes
    cardHTML += '<div class="m-dashboard-header m-dashboard-header-' + cardData.type + '" ' + (cardData.headerCustomData || '') + '>';
    cardHTML += '<div class="col-md-12 col-sm-12">';
    cardHTML += '<h4 style="text-align:left;font-size: 20px;font-family: Nunito,sans-serif;color:black;font-weight:bold">';
    cardHTML += cardData.title + '</h4>';
    cardHTML += '</div>';
    cardHTML += '</div>';

    // Add the card body with custom data attributes
    cardHTML += '<div class="m-dashboard-body" ' + (cardData.bodyCustomData || '') + '>';
    cardHTML += cardData.bodyContent;
    cardHTML += '</div>';

    // Close the card div
    cardHTML += '</div>';

    return cardHTML.trim(); // Remove any leading/trailing whitespace
}



function initConfiguracaoDashboard(config) {


    var mainContainer = "<div style='margin-top:2.5em' id='m-dash-main-container' class='row m-dash-main-container'> </div>";

    $("#campos > .row:last").after(mainContainer);

    var filterContainer = "<div class='col-md-3 m-dash-filter-container' style='margin-top:1em'>";

    var filterHTML = generateDefaultMDashboardHTML({
        id: "m-dash-filter-card",
        title: "Filtros",
        type: "primary",
        headerCustomData: "data-filter='true'",
        bodyContent: filterContainer
    });

    filterContainer += filterHTML;

    filterContainer += "</div>";

    $("#m-dash-main-container").append(filterContainer);

    var mdashContainer = "<div class='col-md-9 m-dash-data-container' style='margin-top:1em'>";

    var addContainerBtnData = {
        style: "",
        buttonId: "addContainerMDashBtn",
        classes: "btn btn-sm btn-primary add-m-dash-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Adicionar container' ",
        label: "Adicionar container <span class='glyphicon glyphicon glyphicon-plus' ></span>",
        onClick: "",
    };
    var buttonHtml = generateButton(addContainerBtnData)

    mdashContainer += "<div class='row'>"
    mdashContainer += "<div class='col-md-6 pull-left'>";
    mdashContainer += buttonHtml;
    mdashContainer += "</div>";
    mdashContainer += "</div>";
    mdashContainer += "<div id='m-dash-containers' class='m-dash-containers'></div>";

    mdashContainer += "</div>";
    $("#m-dash-main-container").append(mdashContainer);







}








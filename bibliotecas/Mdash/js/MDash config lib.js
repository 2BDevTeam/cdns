


var GMDashContainers = [new MdashContainer({})];
GMDashContainers = []

var GMDashContainerItems = [new MdashContainerItem({})];
GMDashContainerItems = [];
var GMDashStamp = "";



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
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
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

function MdashContainerItem(data) {
    // Calcula ordem máxima se não for fornecida
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItems) && GMDashContainerItems.length > 0) {
        maxOrdem = GMDashContainerItems.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemstamp = data.mdashcontaineritemstamp || generateUUID();
    this.mdashcontainerstamp = data.mdashcontainerstamp || "";
    this.codigo = data.codigo || "";
    this.titulo = data.titulo || "";
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 4;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.layoutcontaineritemdefault = data.layoutcontaineritemdefault || true;
    this.expressaolayoutcontaineritem = data.expressaolayoutcontaineritem || "";
    this.dashboardstamp = data.dashboardstamp || "";
    this.fontelocal = data.fontelocal || false;
    this.expressaodblistagem = data.expressaodblistagem || "";
    this.expressaoapresentacaodados = data.expressaoapresentacaodados || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashcontainerstamp";
}

function getContainerItemUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "layoutcontaineritemdefault", tipo: "checkbox", titulo: "Usa layout default para item do container", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaolayoutcontaineritem", tipo: "textarea", titulo: "Expressão de layout do item do container", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaodblistagem", tipo: "textarea", titulo: "Expressão de DB Listagem", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaoapresentacaodados", tipo: "textarea", titulo: "Expressão de apresentação de dados", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "fontelocal", tipo: "checkbox", titulo: "Fonte local", classes: "input-source-form", contentType: "input" })
    ]

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainerItems", idField: "mdashcontaineritemstamp" };

}




function actualizarCOnfiguracaoMDashboard() {

    var configData = [
        {
            sourceTable: "MdashContainer",
            sourceKey: "mdashcontainerstamp",
            records: GMDashContainers
        },
        {
            sourceTable: "MdashContainerItem",
            sourceKey: "mdashcontaineritemstamp",
            records: GMDashContainerItems
        }
    ];


    // console.log([{ mdashstamp: GMDashStamp, config: configData }])

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",

        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GMDashStamp, config: configData }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response);
                    alertify.error("Erro ao actualizar configuração", 9000)
                    return false
                }
                alertify.success("Dados actualizados com sucesso", 9000)
            } catch (error) {
                console.log("Erro interno " + errorMessage, response, error)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    })
}













$(document).ready(function () {
    // Add global styles
    var styles = [];
    getDashboardDefaultStyles(styles);
    getDashCardStyles(styles);


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
        GMDashContainerItems: GMDashContainerItems,
        syncContainerByStamp: function (stamp) {
            var container = this.GMDashContainers.find(function (c) {
                return c.mdashcontainerstamp === stamp;
            });
            return container ? container.titulo : "";
        },
        syncTamanhoContainerItemByStamp: function (stamp) {
            var item = this.GMDashContainerItems.find(function (c) {
                return c.mdashcontaineritemstamp === stamp;
            });
            return item ? item.tamanho : 4;
        },
        syncTituloContainerItemByStamp: function (stamp) {
            var item = this.GMDashContainerItems.find(function (c) {
                return c.mdashcontaineritemstamp === stamp;
            });
            return item ? item.titulo : "";
        }
    }).mount('#m-dash-main-container');
}

function getLocalSource(source) {
    var localsource = []
    localsource = eval(source)
    return localsource
}




function handleShowConfigContainer(data) {

    var idValue = data.idValue || "";
    var localsource = data.localsource || "";
    var idField = data.idField || "";
    var componente = data.componente || "";
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


        })


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

}



function registerListenersMdash() {


    $(document).off("click", ".remover-item-container-btn").on("click", ".remover-item-container-btn", function (e) {
        var itemId = $(this).closest(".m-dash-container-item").attr("id");
        GMDashContainerItems = GMDashContainerItems.filter(function (item) {
            return item.mdashcontaineritemstamp !== itemId;
        });
        $(this).closest(".m-dash-container-item").remove();
    })

    $(document).off("click", ".open-config-item-container").on("click", ".open-config-item-container", function (e) {

        var idValue = $(this).closest(".m-dash-container-item").attr("idValue");
        var localsource = $(this).closest(".m-dash-container-item").attr("localsource");
        var idField = $(this).closest(".m-dash-container-item").attr("idfield");
        var componente = $(this).closest(".m-dash-container-item").attr("componente");
        var localSourceRes = getLocalSource(localsource);

        handleShowConfigContainer({
            idValue: idValue,
            localsource: localsource,
            idField: idField,
            componente: componente
        });

    })

    $(document).off("click", ".open-config-container-btn").on("click", ".open-config-container-btn", function (e) {

        var idValue = $(this).closest(".m-dash-container").attr("idValue");
        var localsource = $(this).closest(".m-dash-container").attr("localsource");
        var idField = $(this).closest(".m-dash-container").attr("idfield");
        var componente = $(this).closest(".m-dash-container").attr("componente");
        var localSourceRes = getLocalSource(localsource);

        handleShowConfigContainer({
            idValue: idValue,
            localsource: localsource,
            idField: idField,
            componente: componente
        });


    })

    $(document).off("click", ".remover-container-btn").on("click", ".remover-container-btn", function (e) {


        var containerId = $(this).closest(".m-dash-container").attr("id");

        GMDashContainers = GMDashContainers.filter(function (container) {
            return container.mdashcontainerstamp !== containerId;
        });

        $(this).closest(".m-dash-container").remove();

        //Remove items

        GMDashContainerItems = GMDashContainerItems.filter(function (item) {
            return item.mdashcontainerstamp !== containerId;
        });
        $("#" + containerId + " .m-dash-container-item").remove();
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

    //add-item-container-btn
    $(document).off("click", ".add-item-container-btn").on("click", ".add-item-container-btn", function (e) {

        var containerId = $(this).closest(".m-dash-container").attr("id");
        var container = GMDashContainers.find(function (c) {
            return c.mdashcontainerstamp === containerId;
        });
        var containerUIObjectFormConfigResult = getContainerItemUIObjectFormConfigAndSourceValues();


        if (container) {
            var newItem = new MdashContainerItem({
                mdashcontaineritemstamp: generateUUID(),
                mdashcontainerstamp: container.mdashcontainerstamp,
                codigo: "ITEM_" + generateUUID(),
                titulo: "Novo Item",
                tipo: "texto",
                tamanho: 0,
                ordem: 0,
                layoutcontaineritemdefault: false,
                expressaolayoutcontaineritem: "",
                fontelocal: false,
                expressaodblistagem: "",
                expressaoapresentacaodados: "",
                objectsUIFormConfig: containerUIObjectFormConfigResult.objectsUIFormConfig,
                localsource: containerUIObjectFormConfigResult.localsource,
                idfield: containerUIObjectFormConfigResult.idField
            });

            GMDashContainerItems.push(newItem);

            addContainerItemMDashConfig(newItem, containerUIObjectFormConfigResult);


        }
    })

}



function addContainerItemMDashConfig(containerItem, containerUIObjectFormConfigResult) {




    var bodyContentHtml = "<div   class='row'>";
    var actionsContainer = "<div style='display:flex;column-gap:0.5em'>";
    var botaoRemoverItemContainer = {
        style: "",
        buttonId: "removeItemContainerBtn_" + containerItem.mdashcontaineritemstamp,
        classes: "btn btn-xs btn-default  remover-item-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Remover item do container' ",
        label: "<span class='glyphicon glyphicon glyphicon-trash' ></span>",
        onClick: "",
    };

    var removerItemContainerHtml = generateButton(botaoRemoverItemContainer);
    actionsContainer += removerItemContainerHtml;
    var botaoOpenConfigItemContainer = {
        style: "",
        buttonId: "openConfigItemContainerBtn_" + containerItem.mdashcontaineritemstamp,
        classes: "btn btn-xs btn-default open-config-item-container",
        customData: " type='button' data-tooltip='true' data-original-title='Abrir configurações do item do container' ",
        label: "<span class='glyphicon glyphicon-cog'></span>",
        onClick: "",
    };

    var openConfigItemContainerHtml = generateButton(botaoOpenConfigItemContainer);
    actionsContainer += openConfigItemContainerHtml;
    actionsContainer += "</div>"

    bodyContentHtml += " <div class='col-md-12' style='margin-bottom:0.5em'>"
    bodyContentHtml += actionsContainer;
    bodyContentHtml += " </div>"
    bodyContentHtml += "</div>"



    var cardContainerItemData = {
        id: containerItem.mdashcontaineritemstamp,
        title: " {{ syncTituloContainerItemByStamp('" + containerItem.mdashcontaineritemstamp + "') }} ",
        type: "primary",
        headerCustomData: "data-container-item='true'",
        bodyContent: bodyContentHtml
    }

    var cardContainerItemHtml = generateDashCardHTML(cardContainerItemData);
    var mdashContainerItemHTML = "<div :class=\"' m-dash-container-item col-md-' + syncTamanhoContainerItemByStamp('" + containerItem.mdashcontaineritemstamp + "')\" style='margin-bottom:1em' id='" + containerItem.mdashcontaineritemstamp + "' componente='Item' idValue='" + containerItem.mdashcontaineritemstamp + "' localsource='" + containerUIObjectFormConfigResult.localsource + "' idfield='" + containerItem.idfield + "' >";
    mdashContainerItemHTML += cardContainerItemHtml;
    mdashContainerItemHTML += "</div>";

    $("#" + containerItem.mdashcontainerstamp + " .m-dash-container-body ").append(mdashContainerItemHTML);

    handleConfigReactive();



}



function addContainerMDashConfig(container, containerUIObjectFormConfigResult) {

    var mdashContainerHTML = "<div style='border:0.2px solid grey; padding: 19px; border-radius: 10px;margin-bottom:0.5em;' componente='Container' idValue='" + container.mdashcontainerstamp + "' localsource='" + containerUIObjectFormConfigResult.localsource + "' idfield='" + container.idfield + "' class='m-dash-container' id='" + container.mdashcontainerstamp + "'>";
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

    mdashContainerHTML += "<div class='m-dash-container-body row'>";

    mdashContainerHTML += "</div>";
    mdashContainerHTML += "</div>";

    $("#m-dash-containers").append(mdashContainerHTML);

    handleConfigReactive();

}


function getDashCardStyles(styles) {
    var dashCardStyle = "";
    dashCardStyle += ".dashcard { position: relative; display: flex; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #fff; background-clip: border-box; border: 1px solid #eee; border-radius: .25rem; border: 0; margin-bottom: 30px; margin-top: 30px; border-radius: 6px; color: #333; background: #fff; width: 100%; box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12); box-shadow: 0 1px 4px 0 rgba(0,0,0,.14); }";
    dashCardStyle += ".dashcard-body { flex: 1 1 auto; padding: .9375rem 20px; position: relative; }";
    dashCardStyle += ".dashcard-title { margin-bottom: .75rem; color: #3c4858; text-decoration: none; margin-top: 0; margin-bottom: 3px; }";
    dashCardStyle += ".dashcard-header { padding: .75rem 1.25rem; margin-bottom: 0; background-color: #fff; border-bottom: 1px solid #eee; border-bottom: none; background: transparent; z-index: 3 !important; }";
    dashCardStyle += ".dashcard-header:first-child { border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0; }";
    dashCardStyle += ".dashcard-header-danger:not(.dashcard-header-icon):not(.dashcard-header-text) { background: linear-gradient(60deg, #d43f3a, #d43f3a); box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(244,67,54,.4); }";
    dashCardStyle += ".dashcard-header-warning:not(.dashcard-header-icon):not(.dashcard-header-text) { background: linear-gradient(60deg, #f79523, #f79523); box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(187,113,16,0.4); }";
    dashCardStyle += ".dashcard-header-success:not(.dashcard-header-icon):not(.dashcard-header-text) { background: linear-gradient(60deg, #3ba94e, #3ba94e); box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(55,119,26,0.4); }";
    dashCardStyle += ".dashcard-header-primary:not(.dashcard-header-icon):not(.dashcard-header-text) { background: linear-gradient(82.59deg, #00897B 0%, #00897B 100%); box-shadow: 0 4px 20px 0 rgba(0,0,0,.14), 0 7px 10px -5px rgba(39,30,126,0.4); }";
    dashCardStyle += ".dashcard [class*=dashcard-header-], .dashcard [class*=dashcard-header-] .dashcard-title { color: #fff; }";
    dashCardStyle += ".dashcard .dashcard-title { margin-top: .625rem; }";
    dashCardStyle += ".dashcard .dashcard-header .dashcard-title { margin-bottom: 3px; }";
    dashCardStyle += ".dashcard [class*=dashcard-header-] { margin: 0 15px; padding: 0; position: relative; }";
    dashCardStyle += ".dashcard [class*=dashcard-header-]:not(.dashcard-header-icon):not(.dashcard-header-text):not(.dashcard-header-image) { border-radius: 3px; margin-top: -20px; padding: 15px; }";
    dashCardStyle += ".dashcard-fact-container { border-radius: 17px; box-shadow: 0 0 2px 2px #dbdbdb; }";
    dashCardStyle += ".dashcard-fact-header { background: linear-gradient(to right, #033076, #033076); color: white; padding: 10px; border-top-left-radius: 17px; border-top-right-radius: 17px; }";
    dashCardStyle += ".dashcard-fact-content { padding: 20px; }";
    styles.push(dashCardStyle);
}

function generateDashCardHTML(cardData) {
    var cardHTML = '<div id="' + (cardData.id || '') + '" class="dashcard">';
    // Header
    cardHTML += '<div class="dashcard-header dashcard-header-' + (cardData.type || "primary") + '">';
    cardHTML += '<span class="dashcard-title">' + (cardData.title || "") + '</span>';
    cardHTML += '</div>';
    // Body
    cardHTML += '<div class="dashcard-body">';
    cardHTML += (cardData.bodyContent || "");
    cardHTML += '</div>';
    cardHTML += '</div>';
    return cardHTML.trim();
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


function fetchDadosMDash(config,dados) {


    console.log("fetchDadosMDash", dados)

    var containers = dados.containers || [];
    var containerItems = dados.containerItems || [];

    containers.forEach(function (container) {

        var containerUIConfigResult = getContainerUIObjectFormConfigAndSourceValues();
        var mdashContainer = new MdashContainer({
            mdashcontainerstamp: container.mdashcontainerstamp,
            codigo: container.codigo,
            titulo: container.titulo,
            tipo: container.tipo,
            tamanho: container.tamanho,
            ordem: container.ordem,
            dashboardstamp: config.mdashstamp || GMDashStamp,
            objectsUIFormConfig: containerUIConfigResult.objectsUIFormConfig || [],
            localsource: containerUIConfigResult.localsource || "",
            idfield: containerUIConfigResult.idField || "mdashcontainerstamp"
        });

        GMDashContainers.push(mdashContainer);
        addContainerMDashConfig(mdashContainer, containerUIConfigResult);

        var items = containerItems.filter(function (item) {
            return item.mdashcontainerstamp === container.mdashcontainerstamp;
        });

        items.forEach(function (item) {

            var containerItemUIConfigResult = getContainerItemUIObjectFormConfigAndSourceValues();
            var mdashContainerItem = new MdashContainerItem({
                mdashcontaineritemstamp: item.mdashcontaineritemstamp,
                mdashcontainerstamp: item.mdashcontainerstamp,
                codigo: item.codigo,
                titulo: item.titulo,
                tipo: item.tipo,
                tamanho: item.tamanho,
                ordem: item.ordem,
                layoutcontaineritemdefault: item.layoutcontaineritemdefault || false,
                expressaolayoutcontaineritem: item.expressaolayoutcontaineritem || "",
                fontelocal: item.fontelocal || false,
                expressaodblistagem: item.expressaodblistagem || "",
                expressaoapresentacaodados: item.expressaoapresentacaodados || "",
                objectsUIFormConfig: containerItemUIConfigResult.objectsUIFormConfig || [],
                localsource: containerItemUIConfigResult.localsource || "",
                idfield: containerItemUIConfigResult.idField || "mdashcontaineritemstamp"
            });

            GMDashContainerItems.push(mdashContainerItem);
            addContainerItemMDashConfig(mdashContainerItem, containerItemUIConfigResult);

        })

        
    })


}


function initConfiguracaoDashboard(config) {


    GMDashStamp = config.mdashstamp || "";

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

    var actualizarDashboardConfigContainer = "<div class='col-md-12' style='margin-top:1em'>"

    var buttonHtml = generateButton({
        style: "",
        buttonId: "updateDashboardConfigBtn",
        classes: "btn btn-sm btn-primary",
        customData: " type='button' data-tooltip='true' data-original-title='Actualizar configuração' ",
        label: "Actualizar configuração",
        onClick: "actualizarCOnfiguracaoMDashboard()"
    });

    actualizarDashboardConfigContainer += buttonHtml;
    actualizarDashboardConfigContainer += "</div>";

    $("#m-dash-main-container").append(actualizarDashboardConfigContainer);

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getconfiguracaomdash",
        async:false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ codigo: config.codigo }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados  da configuração do m dashboard"
            try {
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }

                fetchDadosMDash(config, response.data);
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

        }
    })







}








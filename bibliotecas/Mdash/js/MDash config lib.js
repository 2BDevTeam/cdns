


var GMDashContainers = [new MdashContainer({})];
GMDashContainers = []

var GMDashContainerItems = [new MdashContainerItem({})];
GMDashContainerItems = [];

var GMDashContainerItemObjects = [new MdashContainerItemObject({})];
GMDashContainerItemObjects = [];


var GMDashFilters = [new MdashFilter({})];
GMDashFilters = [];

var GMdashDeleteRecords = [];

var GMDashStamp = "";




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


function MdashFilter(data) {

    var maxOrdem = 0;
    if (Array.isArray(GMDashFilters) && GMDashFilters.length > 0) {
        maxOrdem = GMDashFilters.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashfilterstamp = data.mdashfilterstamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "text";
    this.tamanho = data.tamanho || 4;
    this.expressaolistagem = data.expressaolistagem || "";
    this.valordefeito = data.valordefeito || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.ordem = data.ordem || (maxOrdem + 1);
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashfilterstamp";
}

function getMdashFilterUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Texto", value: "text" },
                { option: "Radio", value: "radio" },
                { option: "Lógico", value: "logic" },
                { option: "Data", value: "date" },
                { option: "Número", value: "number" },
                { option: "Lista", value: "list" },
                { option: "Multipla escolha", value: "multiselect" }
            ]
        }),


        new UIObjectFormConfig({ colSize: 6, campo: "campooption", tipo: "text", titulo: "Campo de Opção", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "campovalor", tipo: "text", titulo: "Campo de Valor", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "valordefeito", tipo: "div", cols: 90, rows: 90, titulo: "Valor por Defeito", classes: "input-source-form m-editor", contentType: "div" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashFilters", idField: "mdashfilterstamp" };
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
    this.templatelayout = data.templatelayout || "";
    this.layoutcontaineritemdefault = data.layoutcontaineritemdefault || true;
    this.expressaolayoutcontaineritem = data.expressaolayoutcontaineritem || "";
    this.dashboardstamp = data.dashboardstamp || "";
    this.fontelocal = data.fontelocal || false;
    this.urlfetch = data.urlfetch || "";
    this.expressaodblistagem = data.expressaodblistagem || "";
    this.expressaoapresentacaodados = data.expressaoapresentacaodados || "";
    this.filters = data.filters || [];
    this.records = data.records || [];
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.dadosTemplate = data.dadosTemplate || {}
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashcontainerstamp";
}

MdashContainerItem.prototype.renderLayout = function (container, cleanContainer) {

    var self = this;
    var listaTemplates = getTemplateLayoutOptions();
    var selectedTemplate = listaTemplates.find(function (template) {
        return template.codigo === self.templatelayout;
    });

    if (selectedTemplate) {

        self.dadosTemplate = selectedTemplate
        if (cleanContainer) {
            $(container).empty();
        }

        $(container).append(selectedTemplate.generateCard({
            title: self.titulo,
            id: self.mdashcontaineritemstamp,
            tipo: selectedTemplate.UIData.tipo || "primary",
            bodyContent: "Sem conteúdo",
        }));

        self.refreshContainerItem("");
    }

}

MdashContainerItem.prototype.refreshContainerItem = function (masterContent) {

    if (!masterContent) return;

    var dadosTemplate = this.dadosTemplate;

    if (!dadosTemplate.containerSelectorToRender) {

        console.error("Container selector to render is not defined in the template data.");
        alertify.error("Erro ao renderizar item do container. Verifique o template.", 4000);
        return;
    }

    var self = this
    var containerItemObjects = GMDashContainerItemObjects.filter(function (obj) {
        return obj.mdashcontaineritemstamp === self.mdashcontaineritemstamp;
    });



    containerItemObjects.forEach(function (itemObject) {

        var concatenatedMasterContent = ".container-item-object-render-" + itemObject.mdashcontaineritemobjectstamp + " " + dadosTemplate.containerSelectorToRender;
        $(concatenatedMasterContent).empty();
        itemObject.renderObjectByContainerItem(concatenatedMasterContent, self);

    });



}

function getContainerItemUIObjectFormConfigAndSourceValues() {

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "layoutcontaineritemdefault", tipo: "checkbox", titulo: "Usa layout default para item do container", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolayoutcontaineritem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de layout do item do container", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "urlfetch", tipo: "text", titulo: "URL de Fetch", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaodblistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de DB Listagem", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaoapresentacaodados", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de apresentação de dados", classes: "input-source-form m-editor", contentType: "div" }),
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
        },
        {
            sourceTable: "MdashFilter",
            sourceKey: "mdashfilterstamp",
            records: GMDashFilters
        },
        {
            sourceTable: "MdashContainerItemObject",
            sourceKey: "mdashcontaineritemobjectstamp",
            records: GMDashContainerItemObjects
        }
    ];


    // console.log([{ mdashstamp: GMDashStamp, config: configData }])

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",

        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GMDashStamp, config: configData, recordsToDelete: GMdashDeleteRecords }]),
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
    getMeditorStyles(styles);


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
        GMDashFilters: GMDashFilters,
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
        },
        syncDescricaoFiltroByFiltroStamp: function (stamp) {
            var filter = this.GMDashFilters.find(function (f) {
                return f.mdashfilterstamp === stamp;
            });
            return filter ? filter.descricao : "";
        }
    }).mount('#m-dash-main-container');






}

function handleCodeEditor() {
    var editors = [];
    document.querySelectorAll('.m-editor').forEach(function (el, idx) {
        // Garante um id único para cada editor
        if (!el.id) el.id = 'm-editor' + idx;
        var aceEditor = ace.edit(el.id);
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode("ace/mode/sql");
        editors.push(aceEditor);
    });

    // Guarda o editor atualmente focado
    var focusedEditor = null;
    editors.forEach(function (ed) {
        ed.on('focus', function () {
            focusedEditor = ed;
        });
    });

    // Atalho: Ctrl + Shift + F para o editor focado
    document.addEventListener("keydown", function (e) {
        if (e.shiftKey && e.key.toLowerCase() === "f" && focusedEditor) {
            e.preventDefault();
            formatCode(focusedEditor);
        }
    });

    function formatCode(editorInstance) {
        var code = editorInstance.getValue();
        try {
            var formatted = prettier.format(code, {
                parser: "babel",
                plugins: [prettierPlugins.babel],
            });
            editorInstance.setValue(formatted, -1);
        } catch (err) {
            alert("Erro ao formatar: " + err.message);
        }
    }

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

            var isDiv = obj.contentType === "div";
            var customData = obj.customData + " v-model='mdashConfigItem." + obj.campo + "'";
            if (isDiv) {
                console.log("Div detected for campo: " + obj.campo);
                customData += " v-on:keyup='changeDivContent(\"" + obj.campo + "\")'";
            }

            containers.push({
                colSize: obj.colSize,
                style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                content: {
                    contentType: obj.contentType,
                    type: obj.tipo,
                    id: obj.campo,
                    classes: obj.classes + " mdashconfig-item-input",
                    customData: customData,
                    style: obj.style,
                    selectCustomData: obj.customData + " v-model='mdashConfigItem." + obj.campo + "'",
                    fieldToOption: obj.fieldToOption,
                    fieldToValue: obj.fieldToValue,
                    rows: obj.rows || 10,
                    cols: obj.cols || 10,
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
        $("#modalMdashConfigItem .modal-dialog").css("width", "90%")
        PetiteVue.createApp({
            mdashConfigItem: mdashConfigItem,
            changeDivContent: function (e) {
                var editor = ace.edit(e);
                this.mdashConfigItem[e] = editor.getValue();
            }
        }).mount('#maincontent');

        handleCodeEditor();
    }

}




//Schema
//Configuração do Objeto
//Handler de apresentação do objeto
//
function MdashContainerItemObject(data) {
    // Calcula ordem máxima se não for fornecida
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItemObjects) && GMDashContainerItemObjects.length > 0) {
        maxOrdem = GMDashContainerItemObjects.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemobjectstamp = data.mdashcontaineritemobjectstamp || generateUUID();
    this.mdashcontaineritemstamp = data.mdashcontaineritemstamp || "";
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 0;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.expressaoobjecto = data.expressaoobjecto || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";


    var config = {}

    if (data.configjson) {
        try {
            config = JSON.parse(data.configjson);
        } catch (error) {
            console.error("Erro ao analisar configjson:", error);
        }
    }

    this.config = config || {}
    this.configjson = data.configjson || ""
    this.idfield = data.idfield || "mdashcontaineritemobjectstamp";

    this.objectoConfig = data.objectoConfig || {};



    var queryConfig = data.queryConfig || {
        selectFields: [],
        filters: [],
        groupBy: [],
        orderBy: { field: "", direction: "ASC" },
        limit: null,
        generatedSQL: "",
        lastResult: []
    };

    if (data.queryconfigjson) {

        try {
            queryConfig = JSON.parse(data.queryconfigjson);
        } catch (error) {

        }

    }

    this.queryConfig = queryConfig || {
        selectFields: [],
        filters: [],
        groupBy: [],
        orderBy: { field: "", direction: "ASC" },
        limit: null,
        generatedSQL: "",
        lastResult: []
    };

    var queryConfigVoid = {
        selectFields: [],
        filters: [],
        groupBy: [],
        orderBy: { field: "", direction: "ASC" },
        limit: null,
        generatedSQL: "",
        lastResult: []
    };
    this.queryconfigjson = queryConfig ? JSON.stringify(queryConfig) : JSON.stringify(queryConfigVoid);
}


MdashContainerItemObject.prototype.renderObjectByContainerItem = function (containerSelector, containerItem) {

    var self = this;

    if (Object.keys(self.objectoConfig).length > 0 && containerItem.records.length > 0) {


        self.objectoConfig.renderObject({
            containerSelector: containerSelector,
            itemObject: self,
            queryConfig: self.queryConfig,
            config: self.config,
            containerItem: containerItem,
            data: containerItem.records || [],
        })
    }


}


function getContainerItemObjectUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({
            colSize: 12,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo de Objeto",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: [
                { option: "Gráfico", value: "chart" },
                { option: "Tabela", value: "table" },
                { option: "Card", value: "card" },
                { option: "Texto", value: "text" },
                { option: "Imagem", value: "image" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "tamanho",
            tipo: "digit",
            titulo: "Tamanho",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "ordem",
            tipo: "digit",
            titulo: "Ordem",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "expressaoobjecto",
            tipo: "div",
            cols: 90,
            rows: 90,
            titulo: "Expressão do Objeto",
            classes: "input-source-form m-editor",
            contentType: "div"
        })
    ];

    return {
        objectsUIFormConfig: objectsUIFormConfig,
        localsource: "GMDashContainerItemObjects",
        idField: "mdashcontaineritemobjectstamp"
    };
}

function getPreviewContainerItemData(containerItem) {




    var defaultRecords = []

}





// Gerar o HTML reativo para a query local
function generateReactiveQueryHTML2() {
    var queryHTML = "";

    // Campos para SELECT / Agregações
    queryHTML += "             <div class='mb-3'>";
    queryHTML += "               <label><strong>Campos de Selecção / Agregações:</strong></label>";
    queryHTML += "               <div class='selectFieldsContainer'>";
    queryHTML += "                 <div v-for='(selectField, index) in containerItemObject.queryConfig.selectFields' :key='index' class='select-row mb-2' style='display: flex; align-items: center; gap: 0.8em;margin-bottom: 0.5em;'>";
    queryHTML += "                   <select v-model='selectField.operation' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                     <option value=''>Nenhuma</option>";
    queryHTML += "                     <option value='TODOS'>Todos os campos</option>";
    queryHTML += "                     <option value='COUNT'>COUNT(*)</option>";
    queryHTML += "                     <option value='SUM'>SUM</option>";
    queryHTML += "                     <option value='AVG'>AVG</option>";
    queryHTML += "                     <option value='MIN'>MIN</option>";
    queryHTML += "                     <option value='MAX'>MAX</option>";
    queryHTML += "                   </select>";
    queryHTML += "                   <select v-model='selectField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                     <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                   </select>";
    queryHTML += "                   <input v-model='selectField.alias' placeholder='Alias' class='form-control input-sm' style='flex: 1;' />";
    queryHTML += "                   <button @click='removeSelectField(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                 </div>";
    queryHTML += "               </div>";
    queryHTML += "               <button @click='addSelectField(containerItemObject)' type='button' class='btn btn-primary btn-sm mt-2'>";
    queryHTML += "                 + Adicionar campo/agregação";
    queryHTML += "               </button>";
    queryHTML += "             </div>";

    // Filtros
    queryHTML += "             <div class='mb-3'>";
    queryHTML += "               <label><strong>Filtros:</strong></label>";
    queryHTML += "               <div class='filtersContainer'>";
    queryHTML += "                 <div v-for='(filter, index) in containerItemObject.queryConfig.filters' :key='index' class='filter-row mb-2' style='display: flex; align-items: center; gap: 0.8em;'>";
    queryHTML += "                   <select v-model='filter.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                     <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                   </select>";
    queryHTML += "                   <select v-model='filter.operator' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                     <option value='='>=</option>";
    queryHTML += "                     <option value='<'><</option>";
    queryHTML += "                     <option value='>'>></option>";
    queryHTML += "                     <option value='<='><=</option>";
    queryHTML += "                     <option value='>='>>=</option>";
    queryHTML += "                     <option value='<>'><></option>";
    queryHTML += "                     <option value='LIKE'>LIKE</option>";
    queryHTML += "                   </select>";
    queryHTML += "                   <input v-model='filter.value' placeholder='Valor' class='form-control input-sm' style='flex: 1;' />";
    queryHTML += "                   <button @click='removeFilter(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                 </div>";
    queryHTML += "               </div>";
    queryHTML += "               <button style='margin-top:0.4em' @click='addFilter(containerItemObject)' type='button' class='btn btn-primary btn-sm mt-2'>";
    queryHTML += "                 + Adicionar filtro";
    queryHTML += "               </button>";
    queryHTML += "             </div>";

    // Group By
    queryHTML += "             <div class='mb-3'>";
    queryHTML += "               <label><strong>Agrupamento:</strong></label>";
    queryHTML += "               <div class='groupByContainer'>";
    queryHTML += "                 <div v-for='(groupField, index) in containerItemObject.queryConfig.groupBy' :key='index' class='group-row mb-2' style='display: flex; align-items: center; gap: 0.8em;margin-bottom: 0.5em;'>";
    queryHTML += "                   <select v-model='groupField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                     <option value=''>-- Selecione o campo --</option>";
    queryHTML += "                     <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                   </select>";
    queryHTML += "                   <button @click='removeGroupBy(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                 </div>";
    queryHTML += "               </div>";
    queryHTML += "               <button style='margin-top:0.4em' @click='addGroupBy(containerItemObject)' type='button' class='btn btn-primary btn-sm'>";
    queryHTML += "                 + Adicionar Agrupamento";
    queryHTML += "               </button>";
    queryHTML += "             </div>";
    // Order By, Direção, Limit e Executar
    queryHTML += "             <div class='form-row align-items-center mt-3 mb-3'>";
    queryHTML += "               <div class='col-auto'>";
    queryHTML += "                 <label><strong>Ordernar por:</strong></label>";
    queryHTML += "                 <select v-model='containerItemObject.queryConfig.orderBy.field' class='form-control input-sm select-local-query'>";
    queryHTML += "                   <option value=''>-- Nenhum --</option>";
    queryHTML += "                   <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                 </select>";
    queryHTML += "               </div>";
    queryHTML += "               <div class='col-auto'>";
    queryHTML += "                 <label><strong>Ordem:</strong></label>";
    queryHTML += "                 <select v-model='containerItemObject.queryConfig.orderBy.direction' class='form-control input-sm'>";
    queryHTML += "                   <option value='ASC'>Ascendente</option>";
    queryHTML += "                   <option value='DESC'>Descendente</option>";
    queryHTML += "                 </select>";
    queryHTML += "               </div>";
    queryHTML += "               <div class='col-auto'>";
    queryHTML += "                 <label><strong>Limit:</strong></label>";
    queryHTML += "                 <input v-model.number='containerItemObject.queryConfig.limit' type='number' min='1' placeholder='Ex: 10' class='form-control input-sm' />";
    queryHTML += "               </div>";
    queryHTML += "               <div style='margin-top:0.4em' class='col-auto mt-4'>";
    queryHTML += "                 <button type='button' @click='executeQuery(containerItemObject)' class='btn btn-primary btn-sm'>Executar</button>";
    queryHTML += "               </div>";
    queryHTML += "             </div>";

    // Resultado
    queryHTML += "             <div class='mb-3'>";
    queryHTML += "               <label><strong>SQL Gerado:</strong></label>";
    queryHTML += "               <pre class='bg-light p-2 border rounded' style='font-size: 12px;'>{{ containerItemObject.queryConfig.generatedSQL || 'Nenhuma query executada ainda' }}</pre>";
    queryHTML += "             </div>";

    queryHTML += "             <div class='mb-3'>";
    queryHTML += "               <label><strong>Resultado ({{ containerItemObject.queryConfig.lastResult.length }} registros):</strong></label>";
    queryHTML += "               <div class='table-responsive' style='max-height: 300px; overflow-y: auto;'>";
    queryHTML += "                 <table id='resultTableSql' v-if='containerItemObject.queryConfig.lastResult.length > 0' class='table table-sm  table-striped'>";
    queryHTML += "                   <thead>";
    queryHTML += "                     <tr class='defgridheader' >";
    queryHTML += "                       <th v-for='(value, key) in containerItemObject.queryConfig.lastResult[0]' :key='key'>{{ key }}</th>";
    queryHTML += "                     </tr>";
    queryHTML += "                   </thead>";
    queryHTML += "                   <tbody>";
    queryHTML += "                     <tr v-for='(row, index) in containerItemObject.queryConfig.lastResult' :key='index'>";
    queryHTML += "                       <td v-for='(value, key) in row' :key='key'>{{ value }}</td>";
    queryHTML += "                     </tr>";
    queryHTML += "                   </tbody>";
    queryHTML += "                 </table>";
    queryHTML += "                 <p v-else class='text-muted'><i>Nenhum resultado encontrado</i></p>";
    queryHTML += "               </div>";
    queryHTML += "             </div>";

    return queryHTML;
}


// ...existing code...

// Gerar o HTML reativo para a query local
function generateReactiveQueryHTML() {
    var queryHTML = "";

    // Primeiro Collapse - Query Local
    queryHTML += "             <div class='home-collapse query-local-collapse'>";
    queryHTML += "               <div class='home-collapse-header mainformcptitulo'>";
    queryHTML += "                 <span class='glyphicon glyphicon-triangle-right'></span>";
    queryHTML += "                 <span class='collapse-title'>Query Local</span>";
    queryHTML += "               </div>";
    queryHTML += "               <div class='home-collapse-body hidden'>";

    // Campos para SELECT / Agregações
    queryHTML += "                 <div class='mb-3'>";
    queryHTML += "                   <label><strong>Campos de Selecção / Agregações:</strong></label>";
    queryHTML += "                   <div class='selectFieldsContainer'>";
    queryHTML += "                     <div v-for='(selectField, index) in containerItemObject.queryConfig.selectFields' :key='index' class='select-row mb-2' style='display: flex; align-items: center; gap: 0.8em;margin-bottom: 0.5em;'>";
    queryHTML += "                       <select v-model='selectField.operation' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option value=''>Nenhuma</option>";
    queryHTML += "                         <option value='TODOS'>Todos os campos</option>";
    queryHTML += "                         <option value='COUNT'>COUNT(*)</option>";
    queryHTML += "                         <option value='SUM'>SUM</option>";
    queryHTML += "                         <option value='AVG'>AVG</option>";
    queryHTML += "                         <option value='MIN'>MIN</option>";
    queryHTML += "                         <option value='MAX'>MAX</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <select v-model='selectField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <input v-model='selectField.alias' placeholder='Alias' class='form-control input-sm' style='flex: 1;' />";
    queryHTML += "                       <button @click='removeSelectField(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                     </div>";
    queryHTML += "                   </div>";
    queryHTML += "                   <button @click='addSelectField(containerItemObject)' type='button' class='btn btn-primary btn-sm mt-2'>";
    queryHTML += "                     + Adicionar campo/agregação";
    queryHTML += "                   </button>";
    queryHTML += "                 </div>";

    // Filtros
    queryHTML += "                 <div class='mb-3'>";
    queryHTML += "                   <label><strong>Filtros:</strong></label>";
    queryHTML += "                   <div class='filtersContainer'>";
    queryHTML += "                     <div v-for='(filter, index) in containerItemObject.queryConfig.filters' :key='index' class='filter-row mb-2' style='display: flex; align-items: center; gap: 0.8em;'>";
    queryHTML += "                       <select v-model='filter.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <select v-model='filter.operator' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option value='='>=</option>";
    queryHTML += "                         <option value='<'><</option>";
    queryHTML += "                         <option value='>'>></option>";
    queryHTML += "                         <option value='<='><=</option>";
    queryHTML += "                         <option value='>='>>=</option>";
    queryHTML += "                         <option value='<>'><></option>";
    queryHTML += "                         <option value='LIKE'>LIKE</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <input v-model='filter.value' placeholder='Valor' class='form-control input-sm' style='flex: 1;' />";
    queryHTML += "                       <button @click='removeFilter(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                     </div>";
    queryHTML += "                   </div>";
    queryHTML += "                   <button style='margin-top:0.4em' @click='addFilter(containerItemObject)' type='button' class='btn btn-primary btn-sm mt-2'>";
    queryHTML += "                     + Adicionar filtro";
    queryHTML += "                   </button>";
    queryHTML += "                 </div>";

    // Group By
    queryHTML += "                 <div class='mb-3'>";
    queryHTML += "                   <label><strong>Agrupamento:</strong></label>";
    queryHTML += "                   <div class='groupByContainer'>";
    queryHTML += "                     <div v-for='(groupField, index) in containerItemObject.queryConfig.groupBy' :key='index' class='group-row mb-2' style='display: flex; align-items: center; gap: 0.8em;margin-bottom: 0.5em;'>";
    queryHTML += "                       <select v-model='groupField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option value=''>-- Selecione o campo --</option>";
    queryHTML += "                         <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <button @click='removeGroupBy(index, containerItemObject)' type='button' class='btn btn-danger btn-sm'>X</button>";
    queryHTML += "                     </div>";
    queryHTML += "                   </div>";
    queryHTML += "                   <button style='margin-top:0.4em' @click='addGroupBy(containerItemObject)' type='button' class='btn btn-primary btn-sm'>";
    queryHTML += "                     + Adicionar Agrupamento";
    queryHTML += "                   </button>";
    queryHTML += "                 </div>";

    // Order By, Direção, Limit e Executar
    queryHTML += "                 <div class='form-row align-items-center mt-3 mb-3'>";
    queryHTML += "                   <div class='col-auto'>";
    queryHTML += "                     <label><strong>Ordernar por:</strong></label>";
    queryHTML += "                     <select v-model='containerItemObject.queryConfig.orderBy.field' class='form-control input-sm select-local-query'>";
    queryHTML += "                       <option value=''>-- Nenhum --</option>";
    queryHTML += "                       <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                     </select>";
    queryHTML += "                   </div>";
    queryHTML += "                   <div class='col-auto'>";
    queryHTML += "                     <label><strong>Ordem:</strong></label>";
    queryHTML += "                     <select v-model='containerItemObject.queryConfig.orderBy.direction' class='form-control input-sm'>";
    queryHTML += "                       <option value='ASC'>Ascendente</option>";
    queryHTML += "                       <option value='DESC'>Descendente</option>";
    queryHTML += "                     </select>";
    queryHTML += "                   </div>";
    queryHTML += "                   <div class='col-auto'>";
    queryHTML += "                     <label><strong>Limit:</strong></label>";
    queryHTML += "                     <input v-model.number='containerItemObject.queryConfig.limit' type='number' min='1' placeholder='Ex: 10' class='form-control input-sm' />";
    queryHTML += "                   </div>";
    queryHTML += "                   <div style='margin-top:0.4em' class='col-auto mt-4'>";
    queryHTML += "                     <button type='button' @click='executeQuery(containerItemObject)' class='btn btn-primary btn-sm'>Executar</button>";
    queryHTML += "                   </div>";
    queryHTML += "                 </div>";

    // Resultado
    queryHTML += "                 <div class='mb-3'>";
    queryHTML += "                   <label><strong>SQL Gerado:</strong></label>";
    queryHTML += "                   <pre class='bg-light p-2 border rounded' style='font-size: 12px;'>{{ containerItemObject.queryConfig.generatedSQL || 'Nenhuma query executada ainda' }}</pre>";
    queryHTML += "                 </div>";

    queryHTML += "                 <div class='mb-3'>";
    queryHTML += "                   <label><strong>Resultado ({{ containerItemObject.queryConfig.lastResult.length }} registros):</strong></label>";
    queryHTML += "                   <div class='table-responsive' style='max-height: 300px; overflow-y: auto;'>";
    queryHTML += "                     <table :id='\"resultTableSql_\" + containerItemObject.mdashcontaineritemobjectstamp' v-if='containerItemObject.queryConfig.lastResult.length > 0' class='table table-sm table-striped result-table-sql'>";
    queryHTML += "                       <thead>";
    queryHTML += "                         <tr class='defgridheader'>";
    queryHTML += "                           <th v-for='(value, key) in containerItemObject.queryConfig.lastResult[0]' :key='key'>{{ key }}</th>";
    queryHTML += "                         </tr>";
    queryHTML += "                       </thead>";
    queryHTML += "                       <tbody>";
    queryHTML += "                         <tr v-for='(row, index) in containerItemObject.queryConfig.lastResult' :key='index'>";
    queryHTML += "                           <td v-for='(value, key) in row' :key='key'>{{ value }}</td>";
    queryHTML += "                         </tr>";
    queryHTML += "                       </tbody>";
    queryHTML += "                     </table>";
    queryHTML += "                     <p v-else class='text-muted'><i>Nenhum resultado encontrado</i></p>";
    queryHTML += "                   </div>";
    queryHTML += "                 </div>";

    queryHTML += "               </div>"; // Fim do home-collapse-body para Query Local
    queryHTML += "             </div>"; // Fim do home-collapse para Query Local

    // Segundo Collapse - Configuração do Objecto
    queryHTML += "             <div v-if='containerItemObject.queryConfig.lastResult.length > 0' class='home-collapse object-config-collapse' style='margin-top: 1em;'>";
    queryHTML += "               <div class='home-collapse-header mainformcptitulo'>";
    queryHTML += "                 <span class='glyphicon glyphicon-triangle-right'></span>";
    queryHTML += "                 <span class='collapse-title'>Configuração do Objecto</span>";
    queryHTML += "               </div>";
    queryHTML += "               <div class='home-collapse-body hidden'>";


    queryHTML += "                 <div class='row'>";
    queryHTML += "                   <div class='col-md-6 pull-left'>";
    queryHTML += "                   <label><strong>Tipo de Objeto:</strong></label>";
    queryHTML += "                   <select v-model='containerItemObject.tipo' class='form-control input-sm' @change='updateObjectType(containerItemObject)'>";
    queryHTML += "                     <option value=''>-- Selecione o tipo --</option>";
    queryHTML += "                     <option v-for='tipoObj in getTiposObjectoConfig()' :key='tipoObj.tipo' :value='tipoObj.tipo'>{{ tipoObj.descricao }}</option>";
    queryHTML += "                   </select>";
    queryHTML += "                 </div>";
    queryHTML += "                 </div>";
    queryHTML += "               </div>";


    queryHTML += "                 <div class='row'>";
    queryHTML += "                        <div class='col-md-6'>";
    queryHTML += "{{initEditorObject(containerItemObject)}}"
    queryHTML += "                        <div :id='\"objectEditorContainer-\" + containerItemObject.mdashcontaineritemobjectstamp'></div>";

    queryHTML += "                        </div>";
    queryHTML += "                        <div v-if='containerItemObject.tipo' class='col-md-6'>";
    queryHTML += "                          <div :class='\"container-item-object-render-\" + containerItemObject.mdashcontaineritemobjectstamp' style='margin-top: 1em;'>";
    queryHTML += "                            <h4>Previsão do objecto</h4>";

    queryHTML += "                          </div>";
    queryHTML += "                        </div>";


    queryHTML += "                    </div>              "

    queryHTML += "               </div>"; // Fim do home-collapse-body para Configuração do Objecto
    queryHTML += "             </div>"; // Fim do home-collapse para Configuração do Objecto

    return queryHTML;
}

// ...existing code...


JSONEditor.defaults.languages.pt = {
    /**
     * When a property is not set
     */
    error_notset: "Propriedade deve ser definida",
    /**
     * When a string is too short
     */
    error_minLength: "Valor deve ter pelo menos {{0}} caracteres",
    /**
     * When a string is too long
     */
    error_maxLength: "Valor deve ter no máximo {{0}} caracteres",
    /**
     * When a number is too small
     */
    error_minimum: "Valor deve ser maior ou igual a {{0}}",
    /**
     * When a number is too big
     */
    error_maximum: "Valor deve ser menor ou igual a {{0}}",
    /**
     * When a property is not one of the enumerated values
     */
    error_enum: "Valor deve ser um dos seguintes: {{0}}",
    /**
     * When a property is not of type X
     */
    error_type: "Valor deve ser do tipo {{0}}",
    /**
     * When required property is missing
     */
    error_required: "Este campo é obrigatório",
    /**
     * Text on Delete All buttons
     */
    button_delete_all: "Excluir Todos",
    /**
     * Title on Delete All buttons
     */
    button_delete_all_title: "Excluir Todos",
    /**
     * Text on Delete Last buttons
     */
    button_delete_last: "Excluir Último {{0}}",
    /**
     * Title on Delete Last buttons
     */
    button_delete_last_title: "Excluir Último {{0}}",
    /**
     * Title on Add Row buttons
     */
    button_add_row_title: "Adicionar {{0}}",
    /**
     * Title on Move Down buttons
     */
    button_move_down_title: "Mover para baixo",
    /**
     * Title on Move Up buttons
     */
    button_move_up_title: "Mover para cima",
    /**
     * Title on Delete Row buttons
     */
    button_delete_row_title: "Excluir {{0}}",
    /**
     * Title on Delete Row buttons, short version (no parameter with the name of the removed item)
     */
    button_delete_row_title_short: "Excluir",
    /**
     * Title on Copy buttons
     */
    button_copy_row_title: "Copiar {{0}}",
    /**
     * Title on Copy buttons, short version (no parameter with the name of the copied item)
     */
    button_copy_row_title_short: "Copiar",
    /**
     * Title on Collapse buttons
     */
    button_collapse: "Recolher",
    /**
     * Title on Expand buttons
     */
    button_expand: "Expandir"
};

// Definir português como idioma padrão
JSONEditor.defaults.language = 'pt';
// Initialize the editor




function LocalMdashQuery(container, data) {
    var self = this;
    self.container = $(container);
    self.data = data;
    self.fields = Object.keys(data[0]);
    self.operacoes = [
        { label: "Todos os campos", value: "TODOS" },
        { label: "Nenhuma", value: "" },
        { label: "COUNT(*)", value: "COUNT" },
        { label: "SUM", value: "SUM" },
        { label: "AVG", value: "AVG" },
        { label: "MIN", value: "MIN" },
        { label: "MAX", value: "MAX" }
    ];
    self.operadores = ['=', '<', '>', '<=', '>=', '<>', 'LIKE'];

    self.$selectContainer = self.container.find(".selectFieldsContainer");
    self.$filterContainer = self.container.find(".filtersContainer");
    self.$groupByContainer = self.container.find(".groupByContainer");
    self.$orderByField = self.container.find(".orderByField");
    self.$orderByDirection = self.container.find(".orderByDirection");
    self.$limit = self.container.find(".limit");
    self.$btnRun = self.container.find(".btnRun");
    self.$querySqlEl = self.container.find(".querySql");
    self.$jsonResultEl = self.container.find(".jsonResult");
    self.$resultEl = self.container.find(".result");

    self.init = function () {
        self.initGroupAndOrder();
        self.addSelectField();
        self.addFilter();

        // Eventos dos botões dentro do container
        self.container.find(".btnAddSelectField").on("click", function () {
            self.addSelectField();
        });

        self.container.find(".btnAddFilter").on("click", function () {
            self.addFilter();
        });

        self.$btnRun.on("click", function () {
            self.run();
        });
    };

    self.initGroupAndOrder = function () {
        self.$groupByContainer.empty();
        self.$orderByField.empty().append('<option value="">-- Nenhum --</option>');
        for (var i = 0; i < self.fields.length; i++) {
            var f = self.fields[i];
            var $label = $("<label>").addClass("mr-3");
            var $cb = $("<input>")
                .attr("type", "checkbox")
                .attr("value", f)
                .addClass("mr-1");
            $label.append($cb).append(f);
            self.$groupByContainer.append($label);

            self.$orderByField.append($("<option>").attr("value", f).text(f));
        }
    };

    self.addSelectField = function () {
        var $div = $("<div>").addClass("select-row  mb-2");

        $div.css({
            'display': 'flex',
            'align-items': 'center',
            'gap': '0.8em'
        });


        var $opSel = $("<select>").addClass("form-control input-sm mr-2");
        for (var i = 0; i < self.operacoes.length; i++) {
            var o = self.operacoes[i];
            $opSel.append($("<option>").val(o.value).text(o.label));
        }

        var $fieldSel = $("<select>").addClass("form-control input-sm mr-2");
        for (var i = 0; i < self.fields.length; i++) {
            $fieldSel.append($("<option>").val(self.fields[i]).text(self.fields[i]));
        }

        var $aliasInput = $("<input>")
            .attr("placeholder", "Alias")
            .addClass("form-control input-sm alias-input mr-2");

        var $btn = $("<button>")
            .addClass("btn btn-danger btn-sm btn-remove")
            .attr("type", "button")
            .text("X")
            .on("click", function () {
                $div.remove();
            });

        $div.append($opSel, $fieldSel, $aliasInput, $btn);
        self.$selectContainer.append($div);
    };

    self.addFilter = function () {
        var $div = $("<div>").addClass("filter-row  mb-2");

        var $selCampo = $("<select>").addClass("form-control input-sm mr-2");
        for (var i = 0; i < self.fields.length; i++) {
            $selCampo.append($("<option>").val(self.fields[i]).text(self.fields[i]));
        }

        var $selOperador = $("<select>").addClass("form-control input-sm mr-2");
        for (var i = 0; i < self.operadores.length; i++) {
            $selOperador.append($("<option>").val(self.operadores[i]).text(self.operadores[i]));
        }

        var $inputValor = $("<input>")
            .attr("placeholder", "Valor")
            .addClass("form-control input-sm mr-2");

        var $btn = $("<button>")
            .addClass("btn btn-danger btn-sm btn-remove")
            .attr("type", "button")
            .text("X")
            .on("click", function () {
                $div.remove();
            });

        $div.append($selCampo, $selOperador, $inputValor, $btn);
        self.$filterContainer.append($div);
    };

    self.run = function () {
        var selects = [];
        var stopLoop = false;

        self.$selectContainer.children().each(function (idx, div) {
            if (stopLoop) return;

            var $div = $(div);
            var op = $div.children("select:eq(0)").val();
            var field = $div.children("select:eq(1)").val();
            var alias = $div.children("input").val().trim();

            if (op === "TODOS") {
                for (var j = 0; j < self.fields.length; j++) {
                    selects.push(self.fields[j]);
                }
                stopLoop = true;
                return;
            }

            if (op === "") {
                selects.push(alias ? field + " AS " + alias : field);
            } else if (op === "COUNT") {
                selects.push(alias ? "COUNT(*) AS " + alias : "COUNT(*)");
            } else if (
                op === "SUM" ||
                op === "AVG" ||
                op === "MIN" ||
                op === "MAX"
            ) {
                selects.push(alias ? op + "(" + field + ") AS " + alias : op + "(" + field + ")");
            } else {
                alert("Operação desconhecida: " + op);
                stopLoop = true;
                return;
            }
        });

        if (selects.length === 0) {
            alert("Selecione ao menos um campo");
            return;
        }

        var filtros = [];
        self.$filterContainer.children().each(function (idx, div) {
            var $div = $(div);
            var campo = $div.children("select:eq(0)").val();
            var op = $div.children("select:eq(1)").val();
            var val = $div.children("input").val().trim();
            if (val === "") return;

            if (isNaN(val)) {
                val = "'" + val.replace(/'/g, "\\'") + "'";
            }
            filtros.push(campo + " " + op + " " + val);
        });

        var groupBy = [];
        self.$groupByContainer.find("input[type=checkbox]:checked").each(function () {
            groupBy.push($(this).val());
        });

        var orderBy = "";
        if (self.$orderByField.val() !== "") {
            orderBy = self.$orderByField.val() + " " + self.$orderByDirection.val();
        }

        var limitVal = self.$limit.val();
        limitVal = limitVal ? parseInt(limitVal) : null;

        var query = "SELECT " + selects.join(", ") + " FROM ?";
        if (filtros.length) query += " WHERE " + filtros.join(" AND ");
        if (groupBy.length) query += " GROUP BY " + groupBy.join(", ");
        if (orderBy) query += " ORDER BY " + orderBy;
        if (limitVal) query += " LIMIT " + limitVal;

        try {
            var result = alasql(query, [self.data]);
            self.$querySqlEl.text(query);
            self.$jsonResultEl.text(JSON.stringify(result, null, 2));
            self.renderResult(result);
        } catch (e) {
            alert("Erro: " + e.message);
        }
    };

    self.renderResult = function (rows) {
        self.$resultEl.empty();
        if (rows.length === 0) {
            self.$resultEl.html("<p><i>Nenhum resultado</i></p>");
            return;
        }

        var $table = $("<table>").addClass("table table-sm table-bordered table-striped");
        var $thead = $("<thead>");
        var $tr = $("<tr>");

        for (var k in rows[0]) {
            $tr.append($("<th>").text(k));
        }
        $thead.append($tr);
        $table.append($thead);

        var $tbody = $("<tbody>");
        for (var i = 0; i < rows.length; i++) {
            var $tr = $("<tr>");
            for (var k in rows[i]) {
                $tr.append($("<td>").text(rows[i][k]));
            }
            $tbody.append($tr);
        }
        $table.append($tbody);

        self.$resultEl.append($table);
    };
}



function setMutationObserverTableSqlResult() {
    return
    var targetNode = document.getElementById("master-content");
    var config = { attributes: false, childList: true, subtree: true };

    var callback = function (mutationList, observer) {


        if ($("#resultTableSql").length > 0) {

            $("#result  zTableSql").DataTable({
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
            })



        }

    };

    var observer = new MutationObserver(callback);
    observer.observe(targetNode, config);



}

function setMutationObserverSelectQuery() {

    var targetNode = document.getElementById("master-content");
    var config = { attributes: false, childList: true, subtree: true };

    var callback = function (mutationList, observer) {


        if ($(".select-local-query").length > 0) {

            console.log("Select local query found, initializing LocalMdashQuery");

            $(".select-local-query").each(function () {
                var $this = $(this);
                if (!$this.data("initialized")) {
                    $this.select2({
                        width: '100%',
                        placeholder: "Selecione um campo",
                        allowClear: true
                    });
                    $this.data("initialized", true);
                }
            });

        }

    };

    var observer = new MutationObserver(callback);
    observer.observe(targetNode, config);


}


function registerListenersMdash() {


    // setMutationObserverSelectQuery();
    setMutationObserverTableSqlResult();
    $.getScript("https://cdn.jsdelivr.net/npm/alasql ", function () { });


    $(document).off("click", ".remover-item-filter-btn").on("click", ".remover-item-filter-btn", function (e) {


        var filterstamp = $(this).closest("tr").attr("id");
        $(this).closest("tr").remove();

        GMdashDeleteRecords.push({
            table: "MdashFilter",
            stamp: filterstamp,
            tableKey: "mdashfilterstamp"
        })

        GMDashFilters = GMDashFilters.filter(function (item) {
            return item.mdashfilterstamp !== filterstamp;
        });




    })

    $(document).off("click", ".add-container-item-object-btn").on("click", ".add-container-item-object-btn", function (e) {

        var containerItemId = $(this).attr("containeritemId");

        var containerItem = GMDashContainerItems.find(function (item) {
            return item.mdashcontaineritemstamp === containerItemId;
        });

        var containerItemObjectUIObjectFormConfigResult = getContainerItemObjectUIObjectFormConfigAndSourceValues();

        var sufixoForm = containerItemObjectUIObjectFormConfigResult.localsource;
        var containerId = "Container" + sufixoForm;
        var localsource = containerItemObjectUIObjectFormConfigResult.localsource;

        var sourceData = {
            sourceTable: localsource,
            sourceKey: localsource
        }
        var containers = [];

        if (!containerItem) {
            console.error("Container Item not found");
            alert("Container Item not found");
            return;
        }


        var addObjectoContainerItem = {
            style: "margin-bottom:0.5em;",
            buttonId: "addObjectoContainerItem",
            label: "<span class='glyphicon glyphicon glyphicon-plus' ></span>Adicionar Objeto ao Container"
            ,
            classes: "btn btn-default btn-sm pull-left",
            customData: " type='button' v-on:click='addObjectoContainerItem()'",
        };

        var buttonHtml = generateButton(addObjectoContainerItem);
        var containersObjectsListDiv = "";

        // Container principal com v-for para iterar pelos objetos
        containersObjectsListDiv += "<div class='container-item-objects-main' v-for='containerItemObject in filteredContainerItemObjects' :key='containerItemObject.mdashcontaineritemobjectstamp'>";

        // Estrutura do collapse baseada em generateCollapseHTML
        containersObjectsListDiv += "  <div class='home-collapse container-item-object' :id='\"object-collapse-\" + containerItemObject.mdashcontaineritemobjectstamp'>";

        // Header do collapse
        containersObjectsListDiv += "    <div class='home-collapse-header mainformcptitulo'>";
        containersObjectsListDiv += "      <span class='glyphicon glyphicon-triangle-right'>{{ containerItemObject.tipo || 'Objeto' }} {{ containerItemObject.ordem }}</span>";
        containersObjectsListDiv += "          <button v-on:click='removeContainerObject(containerItemObject)' type='button' class='btn btn-xs btn-danger remover-container-object-btn'";
        containersObjectsListDiv += "                  :data-object-id='containerItemObject.mdashcontaineritemobjectstamp'";
        containersObjectsListDiv += "                  data-tooltip='true' data-original-title='Remover objeto'>";
        containersObjectsListDiv += "            <i style='font-size:17px' class='fa fa-trash'></i>";
        containersObjectsListDiv += "          </button>";
        containersObjectsListDiv += "      <div class='row'><span class='collapse-content'></span></div>";
        containersObjectsListDiv += "    </div>";

        // Body do collapse
        containersObjectsListDiv += "    <div class='home-collapse-body hidden'>";
        containersObjectsListDiv += "      <div :id='\"object-\" + containerItemObject.mdashcontaineritemobjectstamp' class='container-item-object-body'>";


        // Container para o tratamento de dados (dentro do collapse body)
        containersObjectsListDiv += "        <div :id='\"tratamento-dadoscontainer-\" + containerItemObject.mdashcontaineritemobjectstamp' class='col-md-12 tratamento-dadoscontainer-item-object'>";

        containersObjectsListDiv += "          <div class='row'>";
        containersObjectsListDiv += "            <div class='col-md-12'>";
        containersObjectsListDiv += generateReactiveQueryHTML();
        containersObjectsListDiv += "            </div>";

        containersObjectsListDiv += "          </div>"; // row
        // Fechamento das divs
        containersObjectsListDiv += "      </div>"; // container-item-object-body
        containersObjectsListDiv += "    </div>"; // home-collapse-body
        containersObjectsListDiv += "  </div>"; // home-collapse container-item-object
        containersObjectsListDiv += "</div>"; // v-for container           </div>";

        containers = [
            {
                colSize: 6,
                style: "",
                content: {
                    contentType: "select",
                    type: "select",
                    id: "templatelayout",
                    classes: "mdashconfig-item-input form-control input-source-form input-sm",
                    customData: "",
                    style: "width: 100%;",
                    selectCustomData: "" + " v-model='containerItem.templatelayout' @change=handleTemplateLayoutChange(containerItem.templatelayout)",
                    fieldToOption: "descricao",
                    fieldToValue: "codigo",
                    rows: 10,
                    cols: 10,
                    label: " Layout do container ",
                    selectData: getTemplateLayoutOptions(),
                    value: containerItem.templatelayout,
                    event: "",
                    placeholder: ""
                }
            }, {
                colSize: 6,
                style: "",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "layoutdisplay",
                    classes: "",
                    customData: "",
                    style: "",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: "",
                    event: "",
                    placeholder: "",

                }
            }, {
                colSize: 12,
                style: "",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "expressaodblistagemccontainerobject",
                    classes: "m-editor mdashconfig-item-input ",
                    customData: "v-on:keyup='changeExpressaoDbListagemAndHandleFilters(\"" + "expressaodblistagemccontainerobject" + "\",\"expressaodblistagem\")'",
                    style: "width: 100%; height: 50px;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "Expressão de DB Listagem",
                    selectData: "",
                    value: containerItem.expressaodblistagem || "",
                    event: "",
                    placeholder: "",

                }
            },
            {
                colSize: 12,
                style: "",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "filtervariables",
                    classes: "",
                    customData: "",
                    style: "",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: generateFilterVariablesHTML(),
                    event: "",
                    placeholder: "",

                }
            },
            {
                colSize: 12,
                style: "",
                content: {
                    contentType: "button",
                    type: "button",
                    id: "executarexpressaodblistagem",
                    classes: "pull-left btn btn-primary btn-sm",
                    customData: "v-on:click='executarExpressaoDbListagem()'",
                    style: "margin-top:0.4em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "<span class='glyphicon glyphicon glyphicon-play' ></span>",
                    selectData: "",
                    value: "",
                    event: "",
                    placeholder: "",

                }
            },
            {
                colSize: 12,
                style: "",
                content: {
                    contentType: "div",
                    type: "actionsAddObjectContainerItem",
                    id: "",
                    classes: "pull-left",
                    customData: "",
                    style: "margin-top:0.4em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: buttonHtml,
                    event: "",
                    placeholder: ""
                }
            },
            {
                colSize: 12,
                style: "",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "containerItemObjectList",
                    classes: "row",
                    customData: "",
                    style: "margin-top:0.4em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: containersObjectsListDiv,
                    event: "",
                    placeholder: ""
                }
            }];

        $("#modalContainerItemObjectConfig").remove()
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

        var modalContainerItemObjectConfig = {
            title: "Configuração ",
            id: "modalContainerItemObjectConfig",
            customData: "",
            otherclassess: "",
            body: modalBodyHtml,
            footerContent: "",
        };
        var modalHTML = generateModalHTML(modalContainerItemObjectConfig);

        $("#maincontent").append(modalHTML);

        $("#modalContainerItemObjectConfig").modal("show");
        $("#modalContainerItemObjectConfig .modal-dialog").css("width", "90%")

        var filterValues = {};

        GMDashFilters.forEach(function (filter) {

            filterValues[filter.codigo] = "";

        });


        var filteredContainerItemObjects = GMDashContainerItemObjects.filter(function (obj) {
            return obj.mdashcontaineritemstamp === containerItem.mdashcontaineritemstamp;
        });

        PetiteVue.createApp({
            containerItem: containerItem,
            filterValues: filterValues,
            GMDashContainerItemObjects: GMDashContainerItemObjects,
            filteredContainerItemObjects: filteredContainerItemObjects,

            initEditorObject: function (containerItemObject) {

                var self = this;

                setTimeout(function () {
                    self.updateObjectType(containerItemObject);
                }, 200); // Atraso para garantir que o container está pronto

            },
            updateObjectType: function (containerItemObject) {
                var self = this;

                var tipoObjecto = getTiposObjectoConfig().find(function (tipo) {
                    return tipo.tipo === containerItemObject.tipo;
                });

                if (tipoObjecto) {

                    var schemaEditor = tipoObjecto.createDynamicSchema(containerItemObject.queryConfig.lastResult)

                    containerItemObject.objectoConfig = tipoObjecto

                    console.log('Schema Editor: ', document.getElementById('objectEditorContainer-' + containerItemObject.mdashcontaineritemobjectstamp));

                    var editor = new JSONEditor(document.getElementById('objectEditorContainer-' + containerItemObject.mdashcontaineritemobjectstamp), {
                        schema: schemaEditor,
                        theme: 'bootstrap4',
                        iconlib: 'fontawesome4',
                        disable_edit_json: true,      // Remove botão "JSON"
                        disable_properties: true,     // Remove botão "Properties"
                        no_additional_properties: true, // Evita propriedades adicionais
                        disable_array_delete_last_row: true,  // Remove "Excluir último"
                        disable_array_delete_all_rows: true,  // Remove "Excluir todos"
                        disable_array_reorder: true           // Remove "Reordenar"
                    });



                    editor.on('ready', function () {


                        if (containerItemObject.configjson && containerItemObject.configjson.trim() !== '') {
                            try {

                                var savedConfig = JSON.parse(containerItemObject.configjson);
                                console.log('Carregando configuração salva:', savedConfig);
                                editor.setValue(savedConfig);
                            } catch (error) {
                                console.warn('Erro ao carregar configuração salva:', error);
                                console.log('configjson inválido:', containerItemObject.configjson);
                                // Se não conseguir fazer parse, inicializar com configuração vazia

                            }
                        }



                        $(".json-editor-btn-collapse").css({
                            "background": "transparent",
                            "color": getColorByType("primary").background
                        });

                        $(".tratamento-dadoscontainer-item-object input").addClass("form-control input-sm");
                        $(".tratamento-dadoscontainer-item-object select").addClass("form-control input-sm");
                        $(".tratamento-dadoscontainer-item-object").css({ color: "#626e78" })

                        $(".json-editor-btntype-add").css({
                            "margin-top": "0.9em"
                        });

                        $(".je-object__title").css(
                            {
                                "font-size": "14px",
                                "font-weight": "bold"
                            }
                        )

                        $(".card-title").css(
                            {
                                "font-size": "14px",
                                "font-weight": "bold"
                            }
                        )
                        self.containerItem.renderLayout(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, true);

                    });

                    editor.on('change', function () {
                        var currentValue = editor.getValue();
                        self.containerItem.renderLayout(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, true);
                        containerItemObject.config = currentValue;
                        self.containerItem.refreshContainerItem(".container-item-object-render");
                        containerItemObject.configjson = JSON.stringify(currentValue);
                        $(".card-title").css(
                            {
                                "font-size": "14px",
                                "font-weight": "bold"
                            }
                        )
                    });






                }

            },
            changeExpressaoDbListagemAndHandleFilters: function (id, filtro) {
                var self = this;
                var value = $("#" + id).text();

                var filterCodes = extractFiltersFromExpression(value);
                var matchedFilters = [];
                filterCodes.forEach(function (filterCode) {
                    var filter = GMDashFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        self.filterValues[filter.codigo] = ""
                    }
                });

                var editor = ace.edit(id);


                self.containerItem.expressaodblistagem = editor.getValue();



            },
            getContainerRecords: function () {

                if (this.containerItem.records && this.containerItem.records.length > 0) {
                    return this.containerItem.records;
                }
                var defaultRecords = [
                    { nome: "Ana", genero: "F", salario: 1200, departamento: "RH" },
                    { nome: "João", genero: "M", salario: 1500, departamento: "TI" },
                    { nome: "Carlos", genero: "M", salario: 1000, departamento: "RH" },
                    { nome: "Maria", genero: "F", salario: 1300, departamento: "Marketing" },
                    { nome: "Pedro", genero: "M", salario: 1600, departamento: "TI" }
                ];

                this.containerItem.records = defaultRecords;

                return defaultRecords;
            },

            handleTemplateLayoutChange: function (templateCode) {

                this.containerItem.renderLayout("#layoutdisplay", true)
                this.containerItem.renderLayout(".container-item-object-render", true);
                this.containerItem.refreshContainerItem(".container-item-object-render");
            },
            executarExpressaoDbListagem: function () {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: "../programs/gensel.aspx?cscript=executeexpressaolistagemdb",

                    data: {
                        '__EVENTARGUMENT': JSON.stringify([{ expressaodblistagem: self.containerItem.expressaodblistagem, filters: self.filterValues }]),
                    },
                    success: function (response) {

                        var errorMessage = "ao trazer resultados da listagem . consulte no console do browser"
                        try {
                            console.log(response)
                            if (response.cod != "0000") {

                                console.log("Erro " + errorMessage, response)
                                alertify.error("Erro " + errorMessage, 9000)
                                return false
                            }

                            self.containerItem.records = response.data || [];

                            var containersItemObjectsList = self.GMDashContainerItemObjects.filter(function (obj) {
                                return obj.mdashcontaineritemstamp === self.containerItem.mdashcontaineritemstamp;
                            });

                            containersItemObjectsList.forEach(function (containerItemObject) {

                                containerItemObject.queryConfig = {
                                    selectFields: [],
                                    filters: [],
                                    groupBy: [],
                                    orderBy: { field: "", direction: "ASC" },
                                    limit: null,
                                    generatedSQL: "",
                                    lastResult: []
                                };

                                containerItemObject.queryconfigjson = JSON.stringify(containerItemObject.queryConfig);



                            })




                        } catch (error) {
                            console.log("Erro interno " + errorMessage, response)
                            alertify.error("Erro " + errorMessage, 9000)
                            //alertify.error("Erro interno " + errorMessage, 10000)
                        }

                        //  javascript:__doPostBack('','')
                    }
                })

            },

            // Métodos para query local
            getAvailableFields: function () {
                var records = this.getContainerRecords();
                if (records && records.length > 0) {
                    return Object.keys(records[0]);
                }
                return [];
            },

            addSelectField: function (containerItemObject) {
                var objectIndex = this.GMDashContainerItemObjects.findIndex(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                });

                if (objectIndex !== -1) {
                    this.GMDashContainerItemObjects[objectIndex].queryConfig.selectFields.push({
                        operation: '',
                        field: '',
                        alias: ''
                    });
                }
            },

            removeSelectField: function (index, containerItemObject) {
                this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                }).forEach(function (obj) {
                    if (obj.queryConfig.selectFields[index]) {
                        obj.queryConfig.selectFields.splice(index, 1);
                    }
                });
            },

            addFilter: function (containerItemObject) {
                var objectIndex = this.GMDashContainerItemObjects.findIndex(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                });

                if (objectIndex !== -1) {
                    this.GMDashContainerItemObjects[objectIndex].queryConfig.filters.push({
                        field: '',
                        operator: '=',
                        value: ''
                    });
                }
            },

            removeFilter: function (index, containerItemObject) {
                this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                }).forEach(function (obj) {


                    if (obj.queryConfig.filters[index]) {
                        obj.queryConfig.filters.splice(index, 1);
                    }
                });
            },

            executeQuery: function (containerItemObject) {
                var self = this;
                var records = this.getContainerRecords();

                // Encontrar o objeto atual
                var currentObject = this.GMDashContainerItemObjects.find(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                });

                if (!currentObject || !records || records.length === 0) {
                    console.warn("Nenhum dado disponível para executar a query");
                    return;
                }



                try {



                    if ($.fn.DataTable.isDataTable("#resultTableSql")) {
                        $("#resultTableSql").DataTable().destroy();
                        $("#resultTableSql").dataTable().fnDestroy();
                    }

                    var query = this.buildSQLQuery(currentObject.queryConfig, records);
                    currentObject.queryConfig.generatedSQL = query.sql;

                    var result = alasql(query.sql, query.params);

                    currentObject.queryConfig.lastResult = result;

                    containerItemObject.queryconfigjson = JSON.stringify(currentObject.queryConfig);
                    containerItemObject.config = {};
                    containerItemObject.configjson = "";
                    containerItemObject.tipo = "";


                } catch (error) {
                    console.error("Erro ao executar query:", error);
                    alert("Erro ao executar query: " + error.message);
                }
            },

            addGroupBy: function (containerItemObject) {
                var objectIndex = this.GMDashContainerItemObjects.findIndex(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                });

                if (objectIndex !== -1) {
                    this.GMDashContainerItemObjects[objectIndex].queryConfig.groupBy.push({
                        field: ''
                    });
                }
            },

            removeGroupBy: function (index, containerItemObject) {
                this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                }).forEach(function (obj) {
                    if (obj.queryConfig.groupBy[index]) {
                        obj.queryConfig.groupBy.splice(index, 1);
                    }
                });
            },

            // Atualizar o método buildSQLQuery para trabalhar com o novo formato do Group By
            buildSQLQuery: function (queryConfig, records) {
                var selects = [];
                var stopLoop = false;

                // Processar campos SELECT
                queryConfig.selectFields.forEach(function (selectField) {
                    if (stopLoop) return;

                    var op = selectField.operation;
                    var field = selectField.field;
                    var alias = selectField.alias.trim();

                    if (op === "TODOS") {
                        var fields = Object.keys(records[0]);
                        fields.forEach(function (f) {
                            selects.push(f);
                        });
                        stopLoop = true;
                        return;
                    }

                    if (op === "") {
                        selects.push(alias ? field + " AS " + alias : field);
                    } else if (op === "COUNT") {
                        selects.push(alias ? "COUNT(*) AS " + alias : "COUNT(*)");
                    } else if (["SUM", "AVG", "MIN", "MAX"].indexOf(op) !== -1) {
                        selects.push(alias ? op + "(" + field + ") AS " + alias : op + "(" + field + ")");
                    }
                });

                if (selects.length === 0) {
                    var fields = Object.keys(records[0]);
                    selects = fields;
                }

                // Processar filtros
                var filtros = [];
                queryConfig.filters.forEach(function (filter) {
                    if (filter.field && filter.value.trim() !== "") {
                        var value = filter.value.trim();
                        if (isNaN(value)) {
                            value = "'" + value.replace(/'/g, "\\'") + "'";
                        }
                        filtros.push(filter.field + " " + filter.operator + " " + value);
                    }
                });

                // Processar Group By - Nova implementação
                var groupByFields = [];
                queryConfig.groupBy.forEach(function (groupField) {
                    if (groupField.field && groupField.field.trim() !== "") {
                        groupByFields.push(groupField.field);
                    }
                });

                // Construir SQL
                var sql = "SELECT " + selects.join(", ") + " FROM ?";

                if (filtros.length > 0) {
                    sql += " WHERE " + filtros.join(" AND ");
                }

                if (groupByFields.length > 0) {
                    sql += " GROUP BY " + groupByFields.join(", ");
                }

                if (queryConfig.orderBy && queryConfig.orderBy.field) {
                    sql += " ORDER BY " + queryConfig.orderBy.field + " " + queryConfig.orderBy.direction;
                }

                if (queryConfig.limit && queryConfig.limit > 0) {
                    sql += " LIMIT " + queryConfig.limit;
                }

                return {
                    sql: sql,
                    params: [records]
                };
            },
            getFilterByExpressaoDb: function (expressaoDb) {
                if (!expressaoDb) return [];

                var filterCodes = extractFiltersFromExpression(expressaoDb);
                var matchedFilters = [];

                filterCodes.forEach(function (filterCode) {
                    var filter = GMDashFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        matchedFilters.push(filter);
                    }
                });
                return matchedFilters;
            },

            // ... resto dos métodos existentes
            removeContainerObject: function (containerItemObject) {
                this.GMDashContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemobjectstamp !== containerItemObject.mdashcontaineritemobjectstamp;
                });
                GMDashContainerItemObjects = this.GMDashContainerItemObjects;

                this.filteredContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemstamp === containerItemObject.mdashcontaineritemstamp;
                });

                GMdashDeleteRecords.push({
                    table: "MdashContainerItemObject",
                    stamp: containerItemObject.mdashcontaineritemobjectstamp,
                    tableKey: "mdashcontaineritemobjectstamp"
                });

            },

            addObjectoContainerItem: function () {
                var newObject = new MdashContainerItemObject({
                    mdashcontaineritemstamp: containerItem.mdashcontaineritemstamp,
                    dashboardstamp: GMDashStamp,
                    tipo: "",
                    tamanho: 4,
                    expressaoobjecto: "",
                    objectsUIFormConfig: getContainerItemObjectUIObjectFormConfigAndSourceValues().objectsUIFormConfig,
                    localsource: getContainerItemObjectUIObjectFormConfigAndSourceValues().localsource,
                    queryConfig: {
                        selectFields: [],
                        filters: [],
                        groupBy: [],
                        orderBy: { field: "", direction: "ASC" },
                        limit: null,
                        generatedSQL: "",
                        lastResult: []
                    }
                });

                this.GMDashContainerItemObjects.push(newObject);

                this.filteredContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemstamp === containerItem.mdashcontaineritemstamp;
                });
            }

        }).mount('#maincontent');


        setTimeout(function () {

            if (containerItem.templatelayout) {

                containerItem.renderLayout("#layoutdisplay", true);
            }
        }, 100);


        handleCodeEditor();
    })

    function generateFilterVariablesHTML() {
        var filterVariablesHTML = "";

        filterVariablesHTML += "<div style='display:flex;flex-direction:row;flex-wrap:wrap;' v-for=\"filter in getFilterByExpressaoDb(containerItem.expressaodblistagem)\" :key=\"filter.mdashfilterstamp\" class=\"\">";
        filterVariablesHTML += "    <label class=\"m-dash-filter-item\" :for=\"filter.codigo\">{{ filter.descricao }}</label>";
        filterVariablesHTML += "    <!-- text -->";
        filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-if=\"filter.tipo === 'text'\" type=\"text\"";
        filterVariablesHTML += "        class=\"form-control input-sm input-mdash-filter\" :id=\"filter.codigo\"";
        filterVariablesHTML += "        v-model=\"filterValues[filter.codigo]\" />";
        filterVariablesHTML += "";
        filterVariablesHTML += "    <!-- digit -->";
        filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else-if=\"filter.tipo === 'digit'\" type=\"text\"";
        filterVariablesHTML += "        class=\"form-control input-sm input-mdash-filter\" :id=\"filter.codigo\"";
        filterVariablesHTML += "        v-model=\"filterValues[filter.codigo]\" />";
        filterVariablesHTML += "";
        filterVariablesHTML += "    <!-- logic -->";
        filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else-if=\"filter.tipo === 'logic'\" type=\"checkbox\"";
        filterVariablesHTML += "        class=\"form-check-input\" :id=\"filter.codigo\" v-model=\"filterValues[filter.codigo]\" />";
        filterVariablesHTML += "";
        filterVariablesHTML += "    <!-- fallback -->";
        filterVariablesHTML += "    <input @change=\"updateFilter(filter,$event)\" v-else type=\"text\" class=\"form-control input-sm input-mdash-filter\"";
        filterVariablesHTML += "        :id=\"filter.codigo\" v-model=\"filterValues[filter.codigo]\" />";
        filterVariablesHTML += "</div>";

        return filterVariablesHTML;
    }

    function extractFiltersFromExpression(sqlExpression) {
        if (!sqlExpression) return [];

        var regexPattern = /\{([^}]+)\}/g; // Padrão para capturar texto dentro de {}
        var matches = [];
        var match;

        // Extrai todos os matches usando regex
        while ((match = regexPattern.exec(sqlExpression)) !== null) {
            var filterName = match[1].trim(); // Remove espaços em branco

            // Verifica se o filtro já não existe no array para evitar duplicatas
            if (matches.indexOf(filterName) === -1) {
                matches.push(filterName);
            }
        }

        return matches;
    }

    $(document).off("click", ".open-config-item-filter").on("click", ".open-config-item-filter", function (e) {

        var idValue = $(this).closest(".m-dash-filter-item").attr("idValue");
        var localsource = $(this).closest(".m-dash-filter-item").attr("localsource");
        var idField = $(this).closest(".m-dash-filter-item").attr("idfield");
        var componente = $(this).closest(".m-dash-filter-item").attr("componente");
        var localSourceRes = getLocalSource(localsource);

        console.log("ID Value: " + idValue);
        console.log("Local Source: ", localSourceRes);
        console.log("ID Field: " + idField);
        console.log("Componente: " + componente);

        handleShowConfigContainer({
            idValue: idValue,
            localsource: localsource,
            idField: idField,
            componente: componente
        });



    })

    $(document).off("click", "#addFilterMDashBtn").on("click", "#addFilterMDashBtn", function (e) {

        var mdashfilterstamp = generateUUID();
        var codigo = "FILTER_" + mdashfilterstamp;

        var mdashFilterUIObjectFormConfigResult = getMdashFilterUIObjectFormConfigAndSourceValues();

        var mdashFilter = new MdashFilter({
            mdashfilterstamp: mdashfilterstamp,
            codigo: codigo,
            descricao: "Novo Filtro",
            tipo: "texto",
            tamanho: 4,
            expressaolistagem: "",
            valordefeito: "",
            objectsUIFormConfig: mdashFilterUIObjectFormConfigResult.objectsUIFormConfig,
            localsource: mdashFilterUIObjectFormConfigResult.localsource,
            idfield: mdashFilterUIObjectFormConfigResult.idField
        });

        GMDashFilters.push(mdashFilter);

        addFilterMDashConfig(mdashFilter, mdashFilterUIObjectFormConfigResult);



    })


    $(document).off("click", ".remover-item-container-btn").on("click", ".remover-item-container-btn", function (e) {
        var itemId = $(this).closest(".m-dash-container-item").attr("id");
        GMDashContainerItems = GMDashContainerItems.filter(function (item) {
            return item.mdashcontaineritemstamp !== itemId;
        });
        $(this).closest(".m-dash-container-item").remove();

        GMdashDeleteRecords.push({
            table: "MdashContainerItem",
            stamp: itemId,
            tableKey: "mdashcontaineritemstamp"
        });
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

        GMdashDeleteRecords.push({
            table: "MdashContainer",
            stamp: containerId,
            tableKey: "mdashcontainerstamp"
        });

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


function addFilterMDashConfig(filter, mdashFilterUIObjectFormConfigResult) {

    var filterHtml = "<div class='row'>";
    filterHtml += "     <div class='col-md-12'>";
    filterHtml += "     <h4 class='m-dash-filter-title'>" + " {{ syncDescricaoFiltroByFiltroStamp('" + filter.mdashfilterstamp + "') }} " + "</h4>";
    filterHtml += "  </div>";

    var actionsContainer = "<div style='display:flex;column-gap:0.5em'>";

    var botaoRemoverItemFilter = {
        style: "",
        buttonId: "removeItemFilterBtn_" + filter.mdashfilterstamp,
        classes: "btn btn-xs btn-default  remover-item-filter-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Remover filtro' ",
        label: "<span class='glyphicon glyphicon glyphicon-trash' ></span>",
        onClick: "",
    };

    var removerItemFilterHtml = generateButton(botaoRemoverItemFilter);
    actionsContainer += removerItemFilterHtml;

    var botaoOpenConfigItemFilter = {
        style: "",
        buttonId: "openConfigItemFilterBtn_" + filter.mdashfilterstamp,
        classes: "btn btn-xs btn-default open-config-item-filter",
        customData: " type='button' data-tooltip='true' data-original-title='Abrir configurações do filtro' ",
        label: "<span class='glyphicon glyphicon-cog'></span>",
        onClick: "",
    };

    var openConfigItemFilterHtml = generateButton(botaoOpenConfigItemFilter);
    actionsContainer += openConfigItemFilterHtml;
    actionsContainer += "</div>"

    filterHtml += "<div class='col-md-12 m-dash-filter-item' componente='Filtro' idValue='" + filter.mdashfilterstamp + "' localsource='" + mdashFilterUIObjectFormConfigResult.localsource + "' idfield='" + mdashFilterUIObjectFormConfigResult.idField + "'   style='margin-bottom:0.5em'>";
    filterHtml += actionsContainer;
    filterHtml += "</div>";

    filterHtml += "</div>";

    var newTableRowFilter = "<tr id='" + filter.mdashfilterstamp + "'>";
    newTableRowFilter += "<td>" + filterHtml + "</td>";
    newTableRowFilter += "</tr>";

    $("#m-dash-filter-body").append(newTableRowFilter);

    handleConfigReactive();


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

    var botaoAddContainerItemObject = {
        style: "",
        buttonId: "addContainerItemObjectBtn_" + containerItem.mdashcontaineritemstamp,
        classes: "btn btn-xs btn-default add-container-item-object-btn",
        customData: " containeritemId='" + containerItem.mdashcontaineritemstamp + "' type='button' data-tooltip='true' data-original-title='Adicionar objeto ao item do container' ",
        label: "<span class='glyphicon glyphicon-stats'></span>",
        onClick: "",
    };

    var addContainerItemObjectHtml = generateButton(botaoAddContainerItemObject);
    actionsContainer += addContainerItemObjectHtml;


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
    var mdashContainerItemHTML = "<div "
        + ":class=\"'m-dash-container-item col col-lg-' + syncTamanhoContainerItemByStamp('" + containerItem.mdashcontaineritemstamp + "')"
        + " + ' col-md-' + syncTamanhoContainerItemByStamp('" + containerItem.mdashcontaineritemstamp + "')"
        + " + ' col-sm-' + syncTamanhoContainerItemByStamp('" + containerItem.mdashcontaineritemstamp + "')\""
        + " style='margin-bottom:1em' "
        + " id='" + containerItem.mdashcontaineritemstamp + "'"
        + " componente='Item' "
        + " idValue='" + containerItem.mdashcontaineritemstamp + "'"
        + " localsource='" + containerUIObjectFormConfigResult.localsource + "'"
        + " idfield='" + containerItem.idfield + "' >";
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


function getMeditorStyles(styles) {

    return
    var meditorStyle = ".m-editor{";
    meditorStyle += "width: 100%;";
    meditorStyle += "height: 200px;";
    meditorStyle += "}";
    styles.push(meditorStyle);

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


function fetchDadosMDash(config, dados) {


    var containers = dados.containers || [];
    var containerItems = dados.containerItems || [];
    var filters = dados.filters || [];
    var containerItemObjects = dados.containerItemObjects || [];

    containers.forEach(function (container) {

        var containerUIConfigResult = getContainerUIObjectFormConfigAndSourceValues();

        var mdashContainer = new MdashContainer(container);
        mdashContainer.objectsUIFormConfig = containerUIConfigResult.objectsUIFormConfig || [];
        mdashContainer.localsource = containerUIConfigResult.localsource || "";
        mdashContainer.idfield = containerUIConfigResult.idField || "mdashcontainerstamp";

        GMDashContainers.push(mdashContainer);
        addContainerMDashConfig(mdashContainer, containerUIConfigResult);

        var items = containerItems.filter(function (item) {
            return item.mdashcontainerstamp === container.mdashcontainerstamp;
        });

        items.forEach(function (item) {

            var containerItemUIConfigResult = getContainerItemUIObjectFormConfigAndSourceValues();

            var mdashContainerItem = new MdashContainerItem(item);
            mdashContainerItem.objectsUIFormConfig = containerItemUIConfigResult.objectsUIFormConfig || [];
            mdashContainerItem.localsource = containerItemUIConfigResult.localsource || "";
            mdashContainerItem.idfield = containerItemUIConfigResult.idField || "mdashcontaineritemstamp";

            GMDashContainerItems.push(mdashContainerItem);
            addContainerItemMDashConfig(mdashContainerItem, containerItemUIConfigResult);

        })


    })

    filters.forEach(function (filter) {

        var mdashFilterUIObjectFormConfigResult = getMdashFilterUIObjectFormConfigAndSourceValues();

        var mdashFilter = new MdashFilter(filter);
        mdashFilter.objectsUIFormConfig = mdashFilterUIObjectFormConfigResult.objectsUIFormConfig || [];
        mdashFilter.localsource = mdashFilterUIObjectFormConfigResult.localsource || "";
        mdashFilter.idfield = mdashFilterUIObjectFormConfigResult.idField || "mdashfilterstamp";

        GMDashFilters.push(mdashFilter);
        addFilterMDashConfig(mdashFilter, mdashFilterUIObjectFormConfigResult);



    })

    containerItemObjects.forEach(function (itemObject) {

        var containerItemObjectUIConfigResult = getContainerItemObjectUIObjectFormConfigAndSourceValues();

        var mdashContainerItemObject = new MdashContainerItemObject(itemObject);
        mdashContainerItemObject.objectsUIFormConfig = containerItemObjectUIConfigResult.objectsUIFormConfig || [];
        mdashContainerItemObject.localsource = containerItemObjectUIConfigResult.localsource || "";
        mdashContainerItemObject.idfield = containerItemObjectUIConfigResult.idField || "mdashcontaineritemobjectstamp";

        GMDashContainerItemObjects.push(mdashContainerItemObject);

    });


}


function initConfiguracaoDashboard(config) {
    GMDashStamp = config.mdashstamp || "";

    // Botão para adicionar filtro
    var botaoAddFiltro = {
        style: "",
        buttonId: "addFilterMDashBtn",
        classes: "btn btn-sm btn-default add-m-dash-filter-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Adicionar filtro' ",
        label: "Adicionar filtro <span class='glyphicon glyphicon glyphicon-plus' ></span>",
        onClick: "",
    };
    var addFilterButtonHtml = generateButton(botaoAddFiltro);

    // Container para filtros (col-md-3)
    var filterContainer = "<div class='col-md-3 m-dash-data-filter-container' style='margin-top:1em'>";
    filterContainer += "<div class='row'>";
    filterContainer += "<div class='col-md-12'>" + addFilterButtonHtml + "</div>";
    filterContainer += "</div>";
    filterContainer += "<table id='m-dash-filter-table' class='table table-striped m-dash-filter-table' style='margin-top:1em'>";
    filterContainer += "<thead><tr><th>Filtros</th></tr></thead>";
    filterContainer += "<tbody id='m-dash-filter-body'></tbody>";
    filterContainer += "</table>";
    filterContainer += "</div>";

    // Container para o conteúdo do dashboard (col-md-9)
    var dashboardContainer = "<div class='col-md-9 m-dash-data-container' style='margin-top:1em'>";
    var addContainerBtnData = {
        style: "",
        buttonId: "addContainerMDashBtn",
        classes: "btn btn-sm btn-primary add-m-dash-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Adicionar container' ",
        label: "Adicionar container <span class='glyphicon glyphicon glyphicon-plus' ></span>",
        onClick: "",
    };
    var addContainerButtonHtml = generateButton(addContainerBtnData);

    dashboardContainer += "<div class='row'>";
    dashboardContainer += "<div class='col-md-12'>" + addContainerButtonHtml + "</div>";
    dashboardContainer += "</div>";
    dashboardContainer += "<div id='m-dash-containers' class='m-dash-containers'></div>";
    dashboardContainer += "</div>";

    // Atualizar configuração do dashboard
    var atualizarDashboardConfigContainer = "<div class='col-md-12' style='margin-top:1em'>";
    var atualizarButtonHtml = generateButton({
        style: "",
        buttonId: "updateDashboardConfigBtn",
        classes: "btn btn-sm btn-primary",
        customData: " type='button' data-tooltip='true' data-original-title='Actualizar configuração' ",
        label: "Actualizar configuração",
        onClick: "actualizarCOnfiguracaoMDashboard()"
    });
    atualizarDashboardConfigContainer += atualizarButtonHtml;
    atualizarDashboardConfigContainer += "</div>";

    // Adicionar os containers ao layout principal
    var mainContainer = "<div id='m-dash-main-container' class='row m-dash-main-container'>";
    mainContainer += filterContainer; // Parte dos filtros (col-md-3)
    mainContainer += dashboardContainer; // Parte do dashboard (col-md-9)
    mainContainer += atualizarDashboardConfigContainer; // Botão de atualizar
    mainContainer += "</div>";

    // Inserir o layout no DOM
    $("#campos > .row:last").after(mainContainer);

    // Buscar dados do dashboard
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getconfiguracaomdash",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ codigo: config.codigo }]),
        },
        success: function (response) {
            var errorMessage = "ao trazer resultados da configuração do m dashboard";
            try {
                if (response.cod != "0000") {
                    console.log("Erro " + errorMessage, response);
                    return false;
                }
                fetchDadosMDash(config, response.data);
            } catch (error) {
                console.log("Erro interno " + errorMessage, response);
            }
        }
    });
}







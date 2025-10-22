var GMDashContainers = [new MdashContainer({})];
GMDashContainers = []
var Greactive
var GMDashContainerItems = [new MdashContainerItem({})];
GMDashContainerItems = [];

var GMDashContainerItemObjects = [new MdashContainerItemObject({})];
GMDashContainerItemObjects = [];
var GMDashContainerItemObjectDetails = [new MdashContainerItemObjectDetail({})];
GMDashContainerItemObjectDetails = [];
var selectedObject = {};
var GMDashFilters = [new MdashFilter({})];
GMDashFilters = [];

var GMDashFontes = [new MDashFonte({})];
GMDashFontes = []
var GMdashDeleteRecords = [];

var GMDashStamp = "";
var GTMPReactiveInstance
var GTMPDragItem = null;
var GTMPDragId = null;
var GCopiedComponentData = []

var GMdashEntityCopyConfig = [

    new MdashEntityCopy({
        idfield: "mdashcontainerstamp",
        table: "MdashContainer",
        entityToInstantiate: MdashContainer,
        localsource: "GMDashContainers",
        childs: ["MdashContainerItem"]
    }),
    new MdashEntityCopy({
        idfield: "mdashcontaineritemstamp",
        table: "MdashContainerItem",
        entityToInstantiate: MdashContainerItem,
        localsource: "GMDashContainerItems",
        childs: ["MdashContainerItemObject"]
    }),
    new MdashEntityCopy({
        idfield: "mdashcontaineritemobjectstamp",
        table: "MdashContainerItemObject",
        entityToInstantiate: MdashContainerItemObject,
        localsource: "GMDashContainerItemObjects",
        childs: []
    })

];

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

function MdashEntityCopy(data) {

    this.idfield = data.idfield || "";
    this.table = data.table || "";
    this.localsource = data.localsource || "";
    this.entityToInstantiate = data.entityToInstantiate || function () { };
    this.childs = data.childs || [];
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
    this.expressaojslistagem = data.expressaojslistagem || "";
    this.eventochange = data.eventochange || false;
    this.expressaochange = data.expressaochange || "";
    this.valordefeito = data.valordefeito || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.ordem = data.ordem || (maxOrdem + 1);
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashfilterstamp";
    this.table = "MdashFilter"
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
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaojslistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem JS", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "valordefeito", tipo: "div", cols: 90, rows: 90, titulo: "Valor por Defeito", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 4, campo: "eventochange", tipo: "checkbox", titulo: "Tem evento change", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaochange", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Change", classes: "input-source-form m-editor", contentType: "div" }),
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
    this.table = "MdashContainer";
    this.inactivo = data.inactivo || false;
}


function MdashContainerItemObjectDetail(data) {

    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItemObjectDetails) && GMDashContainerItemObjectDetails.length > 0) {
        maxOrdem = GMDashContainerItemObjectDetails.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemobjectdetailstamp = data.mdashcontaineritemobjectdetailstamp || generateUUID();
    this.mdashcontaineritemobjectstamp = data.mdashcontaineritemobjectstamp || "";
    this.dashboardstamp = data.dashboardstamp || "";
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 0;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.expressaoobjecto = data.expressaoobjecto || "";
    this.queryconfigjson = data.queryconfigjson || "";
    this.temdetalhes = data.temdetalhes || false;
    this.titulodetalhes = data.titulodetalhes || "";
    this.titulobtndetalhes = data.titulobtndetalhes || "";
}




function getContainerUIObjectFormConfigAndSourceValues() {

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 6, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
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
    this.inactivo = data.inactivo || false;
    this.tamanho = data.tamanho || 4;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.templatelayout = data.templatelayout || "";
    this.layoutcontaineritemdefault = data.layoutcontaineritemdefault || true;
    this.expressaolayoutcontaineritem = data.expressaolayoutcontaineritem || "";
    this.dashboardstamp = data.dashboardstamp || "";
    this.fontelocal = data.fontelocal || false;
    this.urlfetch = data.urlfetch || "../programs/gensel.aspx?cscript=getdbcontaineritemdata";
    this.expressaodblistagem = data.expressaodblistagem || "";
    this.expressaoapresentacaodados = data.expressaoapresentacaodados || "";
    this.filters = data.filters || [];
    this.records = data.records || [];
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.dadosTemplate = data.dadosTemplate || {}
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashcontainerstamp";
    this.table = "MdashContainerItem";

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

        console.warn("Container selector to render is not defined in the template data.");
        // alertify.error("Erro ao renderizar item do container. Verifique o template.", 4000);
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
        new UIObjectFormConfig({ colSize: 4, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "ordem", tipo: "text", titulo: "Ordem", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "layoutcontaineritemdefault", tipo: "checkbox", titulo: "Usa layout default para item do container", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolayoutcontaineritem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de layout do item do container", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "urlfetch", tipo: "text", titulo: "URL de Fetch", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaodblistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de DB Listagem", classes: "m-editor input-source-form", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaoapresentacaodados", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de apresentação de dados", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "fontelocal", tipo: "checkbox", titulo: "Fonte local", classes: "input-source-form", contentType: "input" })

    ]

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainerItems", idField: "mdashcontaineritemstamp" };

}




function actualizarConfiguracaoMDashboard() {

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
        },
        {
            sourceTable: "MDashFonte",
            sourceKey: "mdashfontestamp",
            records: GMDashFontes
        }
    ];

    // console.log("configdata", configData)
    // console.log([{ mdashstamp: GMDashStamp, config: configData }])



    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",
        async: false,
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
                alertify.success("Dados actualizados com sucesso", 9000);
                window.location.reload();
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
    objectItemEditorStyles(styles);


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
        },

        //--------------------------
        dataSources: GMDashFontes,

        openConfigReportElement: function (obj, componente) {
            var self = this;
            this.$nextTick(function () {
                handleShowConfigContainer({
                    idValue: obj[obj.idfield],
                    localsource: obj.localsource,
                    idField: obj.idfield,
                    componente: componente
                });
            });
        },
        addDataSource: function () {
            var self = this;
            var newSource = new MDashFonte({});
            newSource.setUIFormConfig();
            self.dataSources.push(newSource);
            console.log("AASDD", newSource, newSource.table, newSource.idfield)
            realTimeComponentSync(newSource, newSource.table, newSource.idfield);
        },

        removeDataSource: function (index, source) {
            var self = this;
            self.dataSources.splice(index, 1);
            GMdashDeleteRecords.push({
                table: "MDashFonte",
                stamp: source.mdashfontestamp,
                tableKey: "mdashfontestamp"
            });
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
        /* if (e.shiftKey && e.key.toLowerCase() === "f" && focusedEditor) {
             e.preventDefault();
             formatCode(focusedEditor);
         }*/
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



function generateFilterVariablesParaFonteHTML() {
    var filterVariablesHTML = "";
    filterVariablesHTML += "<div style='display:flex;flex-direction:row;flex-wrap:wrap;' v-for=\"filter in getFilterByExpressaoDb()\" :key=\"filter.mdashfilterstamp\" class=\"\">";
    filterVariablesHTML += "    <label class=\"m-report-filter-item\" :for=\"filter.codigo\">{{ filter.descricao }}</label>";
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


function generateQueryButtonOptions() {

    var schemaQueryEditorContainerHtml = "";
    schemaQueryEditorContainerHtml += "<div class='row' style='margin-top: 1em;'>";
    // Botão Executar Expressão DB
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='executarexpressaodblistagem' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-primary btn-sm' ";
    schemaQueryEditorContainerHtml += "v-on:click='executarExpressaoDbListagem()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-play'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    // Botão Query JSON Result
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='queryjsonresultbtn' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-default btn-sm' ";
    schemaQueryEditorContainerHtml += "v-if='queryJsonResult && mainQueryHasError==false' ";
    schemaQueryEditorContainerHtml += "v-on:click='abrirQueryJsonResult()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;margin-left:-4em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-th-list'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    // Botão Export JSON Result (Error)
    schemaQueryEditorContainerHtml += "<div class='col-md-1' style='margin-bottom:0.5em;'>";
    schemaQueryEditorContainerHtml += "<button type='button' id='exportjsonresultbtn' ";
    schemaQueryEditorContainerHtml += "class='pull-left btn btn-warning btn-sm' ";
    schemaQueryEditorContainerHtml += "v-if='mainQueryHasError' ";
    schemaQueryEditorContainerHtml += "v-on:click='abrirErroResult()' ";
    schemaQueryEditorContainerHtml += "style='margin-top:0.4em;background: #dc3545!important;color:white;margin-left:-8em;'>";
    schemaQueryEditorContainerHtml += "<span class='glyphicon glyphicon-info-sign'></span>";
    schemaQueryEditorContainerHtml += "</button>";
    schemaQueryEditorContainerHtml += "</div>";

    schemaQueryEditorContainerHtml += "</div>";
    return schemaQueryEditorContainerHtml;
}



function MDashFonte(data) {
    var self = this;
    var maxOrdem = 0;
    if (Array.isArray(GMDashFontes) && GMDashFontes.length > 0) {
        maxOrdem = GMDashFontes.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }
    // Propriedades baseadas na estrutura da tabela
    this.mdashfontestamp = data.mdashfontestamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "Fonte" + gerarIdNumerico();
    this.descricao = data.descricao || 'Nova Fonte ' + (data.ordem || (maxOrdem + 1));
    this.tipo = data.tipo || 'query'; // query, api, json, csv, etc.
    this.expressaolistagem = data.expressaolistagem || '';
    this.expressaojslistagem = data.expressaojslistagem || '';
    this.ordem = (data.ordem || (maxOrdem + 1));
    this.schemajson = data.schemajson || '[]';
    this.lastResultscached = data.lastResultscached || '[]';

    // propriedades adicionais para funcionalidade
    this.schema = [];
    this.lastResults = [];

    this.lastResults = forceJSONParse(this.lastResultscached, []);
    this.schema = forceJSONParse(this.schemajson, []);
    this.testData = data.testData || [];
    this.lastExecuted = data.lastExecuted || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;

    var schemaQueryEditorContainerHtml = "";
    schemaQueryEditorContainerHtml += generateQueryButtonOptions();
    schemaQueryEditorContainerHtml += generateFilterVariablesParaFonteHTML();
    this.schemaQueryEditor = schemaQueryEditorContainerHtml;
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.localsource = data.localsource || "";
    this.idfield = data.idfield || "mdashfontestamp";
    this.table = "MDashFonte";
}

MDashFonte.prototype.setTupDataOnLocalDb = function (data) {
    if (Array.isArray(this.lastResults) == false) return;

    if (this.lastResults.length == 0) return;

    var tableSchema = extractLocalDbSchema(this.lastResults[0]);
    setTupDataOnLocalDb("MDashDB", this.codigo, tableSchema, this.lastResults, this.mdashfontestamp);
}

MDashFonte.prototype.setUIFormConfig = function () {
    var UIFormConfig = getMDashFonteUIObjectFormConfigAndSourceValues();
    this.objectsUIFormConfig = UIFormConfig.objectsUIFormConfig;
    this.localsource = UIFormConfig.localsource;
    this.idfield = UIFormConfig.idField;
}

function getMDashFonteUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
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
                { option: "Query SQL", value: "query" },
            ]
        }),
        new UIObjectFormConfig({ customData: " v-on:keyup='changeExpressaoDbListagemAndHandleFilters()'", colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "schemaQueryEditor", tipo: "div", cols: 90, rows: 90, titulo: "", classes: "input-source-form", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaojslistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem JS", classes: "input-source-form m-editor ", contentType: "div" })
    ];
    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashFontes", idField: "mdashfontestamp" };
}


MDashFonte.prototype.stringifyJSONFields = function () {
    var data = this;
    data.schemajson = JSON.stringify(data.schema || []);
    data.lastResultscached = JSON.stringify(data.lastResults || []);
    return data;
}



function forceJSONParse(data, defaultValue) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return defaultValue;
        }
    }
    else {
        return data || defaultValue;
    }

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

        // console.log("sourceData", sourceData)
        var containers = [];

        objectsUIFormConfig.forEach(function (obj) {

            var isDiv = obj.contentType === "div";
            var customData = obj.customData + "  @change='handleChangeComponent'  v-model='mdashConfigItem." + obj.campo + "'";
            if (isDiv) {
                //console.log("Div detected for campo: " + obj.campo);
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
            localsource: localsource,
            mainQueryHasError: false,
            queryJsonResult: "",
            executarExpressaoDbListagem: function () {
                var self = this;
                console.log("executarExpressaoDbListagem", self.mdashConfigItem.expressaolistagem, self.filterValues)
                $.ajax({
                    type: "POST",
                    url: "../programs/gensel.aspx?cscript=executeexpressaolistagemdb",

                    data: {
                        '__EVENTARGUMENT': JSON.stringify([{ expressaodblistagem: self.mdashConfigItem.expressaolistagem, filters: self.filterValues }]),
                    },
                    success: function (response) {

                        var errorMessage = "ao trazer resultados da listagem . consulte no console do browser"
                        try {

                            //console.log(response)
                            if (response.cod != "0000") {

                                console.log("Erro " + errorMessage, response)
                                alertify.error("Erro " + errorMessage, 9000);
                                self.mainQueryError = JSON.stringify(response, null, 2);;
                                self.mainQueryHasError = true;
                                return false
                            }

                            var mappedSchema = replaceLocalDbKeywords(response.schema)
                            var queryResult = response.data.length > 0 ? response.data : generateDummyDataForSchema(mappedSchema, 3);

                            var mappedData = replaceLocalDbKeywords(queryResult);

                            console.log("Mapped Data", mappedData)

                            var lastResults = mappedData.slice(0, 340);

                            self.mdashConfigItem.schema = mappedSchema;
                            self.mdashConfigItem.lastResults = lastResults;
                            self.mdashConfigItem.stringifyJSONFields();


                            self.queryJsonResult = JSON.stringify(mappedData)
                            self.mainQueryHasError = false;

                            self.mdashConfigItem.setTupDataOnLocalDb()

                            realTimeComponentSync(self.mdashConfigItem, self.mdashConfigItem.table, self.mdashConfigItem.idfield);
                            alertify.success("Query executada com sucesso", 5000);

                        } catch (error) {
                            console.log("Erro interno " + errorMessage, error)
                            alertify.error("Erro " + errorMessage, 9000);
                            self.mainQueryError = "Erro interno " + errorMessage;
                            self.mainQueryHasError = true;
                            //alertify.error("Erro interno " + errorMessage, 10000)
                        }

                        //  javascript:__doPostBack('','')
                    }
                })

            },
            abrirQueryJsonResult: function () {

                $("#queryJsonResultModal").remove()
                var formattedJson = JSON.stringify(JSON.parse(this.queryJsonResult), null, 2);
                var modalHtmlBody = "<pre id='queryJsonResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                var modalData = {
                    title: "Resultado JSON",
                    id: "queryJsonResultModal",
                    customData: "",
                    otherclassess: "",
                    body: modalHtmlBody,
                    footerContent: ""
                };

                var modalHTML = generateModalHTML(modalData);
                $("#mainPage").append(modalHTML);
                $("#queryJsonResultModal").modal("show");
            },
            abrirErroResult: function () {

                $("#queryErrorResultModal").remove();
                var formattedJson = this.mainQueryError
                var modalHtmlBody = "<pre id='queryErrorResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                var modalData = {
                    title: "Erro na query",
                    id: "queryErrorResultModal",
                    customData: "",
                    otherclassess: "",
                    body: modalHtmlBody,
                    footerContent: ""
                };
                var modalHTML = generateModalHTML(modalData);
                $("#mainPage").append(modalHTML);
                $("#queryErrorResultModal").modal("show");
            },
            getFilterByExpressaoDb: function () {
                var expressaoDb = this.mdashConfigItem.expressaolistagem;
                if (!expressaoDb) return [];

                var filterCodes = extractFiltersFromExpression(expressaoDb);
                var matchedFilters = [];

                var lastUsedFiltersLocaStorage = localStorage.getItem("lastUsedFilters");
                lastUserFilters = {}
                try {

                    if (lastUsedFiltersLocaStorage) {

                        lastUserFilters = JSON.parse(lastUsedFiltersLocaStorage);
                    }
                } catch (error) {

                }

                this.filterValues = lastUserFilters || {}


                filterCodes.forEach(function (filterCode) {
                    var filter = GMReportFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        matchedFilters.push(filter);
                    }
                });
                return matchedFilters;
            },
            updateFilter: function (filter, event) {


                localStorage.setItem("lastUsedFilters", JSON.stringify(this.filterValues));
            },

            changeExpressaoDbListagemAndHandleFilters: function () {
                var self = this;
                var value = $("#expressaolistagem").text();

                var filterCodes = extractFiltersFromExpression(value);

                var lastUsedFiltersLocaStorage = localStorage.getItem("lastUsedFilters");
                lastUserFilters = {}
                try {

                    if (lastUsedFiltersLocaStorage) {

                        lastUserFilters = JSON.parse(lastUsedFiltersLocaStorage);
                    }
                } catch (error) {

                }


                var matchedFilters = [];
                filterCodes.forEach(function (filterCode) {
                    var filter = GMReportFilters.find(function (f) {
                        return f.codigo === filterCode;
                    });

                    if (filter) {
                        self.filterValues[filter.codigo] = lastUserFilters[filter.codigo] || "";
                    }
                });

                var editor = ace.edit("expressaolistagem");


                self.mdashConfigItem.expressaolistagem = editor.getValue();


            },

            handleChangeComponent: function () {

                realTimeComponentSync(this.mdashConfigItem, this.mdashConfigItem.table, this.mdashConfigItem.idfield);
            },
            changeDivContent: function (e) {
                var editor = ace.edit(e);
                this.mdashConfigItem[e] = editor.getValue();
                realTimeComponentSync(this.mdashConfigItem, this.mdashConfigItem.table, this.mdashConfigItem.idfield);

            }
        }).mount('#maincontent');

        handleCodeEditor();
    }

}


function gerarIdNumerico() {
    var timestamp = Date.now().toString(); // Ex: "1697558451234"
    var parteFinal = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 dígitos aleatórios
    var id = (timestamp + parteFinal).slice(0, 10); // Garante exatamente 10 dígitos
    return id;
}

function realTimeComponentSync(recordData, table, idfield) {
    var errorMessage = "ao actualizar componente em tempo real,verifique a conexão com a internet.Se o erro persistir contacte o administrador do sistema. "
    try {


        var configData = []


        if (recordData) {
            configData = [
                {
                    sourceTable: table,
                    sourceKey: idfield,
                    records: [recordData]
                }
            ];

        }

        // console.log("AJAXSS",[{ config: configData, recordsToDelete: GMdashDeleteRecords }] )

        $.ajax({
            type: "POST",
            url: "../programs/gensel.aspx?cscript=realtimecomponentsync",
            async: false,
            data: {
                '__EVENTARGUMENT': JSON.stringify([{ config: configData, recordsToDelete: GMdashDeleteRecords }]),
            },
            success: function (response) {

                try {
                    console.log(response)
                    if (response.cod != "0000") {

                        console.log("Erro " + errorMessage, response);
                        alertify.error("Erro " + errorMessage, 4000)
                        return false
                    }
                    // alertify.success("Dados actualizados com sucesso", 9000);
                } catch (error) {
                    //alertify
                    alertify.error("Erro interno " + errorMessage, 10000)
                }

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Erro " + errorMessage, xhr, thrownError);
                alertify.error(".Erro " + errorMessage, 4000)
            }
        })

    } catch (error) {
        console.log("Erro interno " + errorMessage, response, error)

    }


}


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
    this.temdetalhes = data.temdetalhes || false;
    this.detalhesqueryconfigjson = data.detalhesqueryconfigjson || "";
    this.tipoobjectodetalhes = data.tipoobjectodetalhes || "";
    this.titulodetalhes = data.titulodetalhes || "";
    this.titulobtndetalhes = data.titulobtndetalhes || "";
    this.categoria = data.categoria || "editor";
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
    this.table = "MdashContainerItemObject"

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
    var contentRecords = containerItem.records || [];

    if (Object.keys(self.objectoConfig).length > 0 && containerItem.records.length > 0) {

        ///  console.log("SELLLF",  containerItem.records)
        self.objectoConfig.renderObject({
            containerSelector: containerSelector,
            itemObject: self,
            queryConfig: self.queryConfig,
            config: self.config,
            containerItem: containerItem,
            data: containerItem.records || [],
        })
    }

    if (self.expressaoobjecto) {
        try {

            eval(self.expressaoobjecto);
        } catch (error) {

            console.error("Erro ao executar expressão do objeto:", error);
            // alertify.error("Erro ao executar expressão do objeto. Verifique o console para mais detalhes.", 4000);
        }



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
    queryHTML += "                       <select @change='updateQueryLocalConfig' v-model='selectField.operation' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option value=''>Nenhuma</option>";
    queryHTML += "                         <option value='TODOS'>Todos os campos</option>";
    queryHTML += "                         <option value='COUNT'>COUNT(*)</option>";
    queryHTML += "                         <option value='SUM'>SUM</option>";
    queryHTML += "                         <option value='AVG'>AVG</option>";
    queryHTML += "                         <option value='MIN'>MIN</option>";
    queryHTML += "                         <option value='MAX'>MAX</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <select @change='updateQueryLocalConfig' v-model='selectField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <input @change='updateQueryLocalConfig' v-model='selectField.alias' placeholder='Alias' class='form-control input-sm' style='flex: 1;' />";
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
    queryHTML += "                       <select @change='updateQueryLocalConfig' v-model='filter.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <select @change='updateQueryLocalConfig' v-model='filter.operator' class='form-control input-sm select-local-query' style='flex: 1;'>";
    queryHTML += "                         <option value='='>=</option>";
    queryHTML += "                         <option value='<'><</option>";
    queryHTML += "                         <option value='>'>></option>";
    queryHTML += "                         <option value='<='><=</option>";
    queryHTML += "                         <option value='>='>>=</option>";
    queryHTML += "                         <option value='<>'><></option>";
    queryHTML += "                         <option value='LIKE'>LIKE</option>";
    queryHTML += "                       </select>";
    queryHTML += "                       <input @change='updateQueryLocalConfig' v-model='filter.value' placeholder='Valor' class='form-control input-sm' style='flex: 1;' />";
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
    queryHTML += "                       <select @change='updateQueryLocalConfig' v-model='groupField.field' class='form-control input-sm select-local-query' style='flex: 1;'>";
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
    queryHTML += "                     <select @change='updateQueryLocalConfig' v-model='containerItemObject.queryConfig.orderBy.field' class='form-control input-sm select-local-query'>";
    queryHTML += "                       <option value=''>-- Nenhum --</option>";
    queryHTML += "                       <option v-for='field in getAvailableFields()' :key='field' :value='field'>{{ field }}</option>";
    queryHTML += "                     </select>";
    queryHTML += "                   </div>";
    queryHTML += "                   <div class='col-auto'>";
    queryHTML += "                     <label><strong>Ordem:</strong></label>";
    queryHTML += "                     <select  @change='updateQueryLocalConfig' v-model='containerItemObject.queryConfig.orderBy.direction' class='form-control input-sm'>";
    queryHTML += "                       <option value='ASC'>Ascendente</option>";
    queryHTML += "                       <option value='DESC'>Descendente</option>";
    queryHTML += "                     </select>";
    queryHTML += "                   </div>";
    queryHTML += "                   <div class='col-auto'>";
    queryHTML += "                     <label><strong>Limit:</strong></label>";
    queryHTML += "                     <input  @change='updateQueryLocalConfig' v-model.number='containerItemObject.queryConfig.limit' type='number' min='1' placeholder='Ex: 10' class='form-control input-sm' />";
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
    queryHTML += "             <div v-if='false' class='home-collapse object-config-collapse' style='margin-top: 1em;'>";
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
    // queryHTML += "{{initEditorObject(containerItemObject)}}"
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




    });

    function refreshAllEditor(containerItemId, contToRender) {


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

        var containerObjectEditor = '';

        containerObjectEditor += '    <div v-if="!containerItem.templatelayout"  class="col-md-12">';
        containerObjectEditor += "      <div class='alert alert-info' role='alert' style='margin-top:1em;'>Selecione um layout para o container</div>";
        containerObjectEditor += '     </div>';
        //#f3f7fe
        containerObjectEditor += '';
        containerObjectEditor += '  <div v-if="containerItem.templatelayout" class="row ">';
        containerObjectEditor += '    <!-- Sidebar -->';
        containerObjectEditor += '    <div class="col-md-2">';
        containerObjectEditor += '      <div class="m-dash-item ">';
        containerObjectEditor += '        <h1 class="m-dash-item-title">Objetos</h1>';
        containerObjectEditor += '        <div class="dashboard-object"  v-for="item in availableObjects" draggable="true" @dragstart="dragStart(item)">';
        containerObjectEditor += '          <i style="color:' + "#3f5670" + '" :class="item.icon"></i> <span style="color:' + "#3f5670" + '">{{ item.label }}</span>';
        containerObjectEditor += '        </div>';
        containerObjectEditor += '      </div>';
        containerObjectEditor += '    </div>';

        containerObjectEditor += '    <!-- Preview -->';
        containerObjectEditor += '    <div  id="objectPreview" class="col-md-6">';
        containerObjectEditor += gerarConteudoEditorObjecto(containerItem);
        containerObjectEditor += '    </div>';


        containerObjectEditor += '    <!-- Propriedades -->';
        containerObjectEditor += '    <div style="height:500px;overflow-y:auto;" class="col-md-4">';
        containerObjectEditor += '      <div class="m-dash-item">';
        containerObjectEditor += '        <h1 class="m-dash-item-title">Propriedades</h1>';
        containerObjectEditor += '        <div v-if="selectedObject?.queryConfig?.lastResult.length == 0" class="alert alert-info" role="alert" style="margin-top:1em;">Atenção!Para editar as propiedades do objecto deve definir uma query para o mesmo.</div>';
        //containerObjectEditor += "objectEditorContainer-{{selectedObject.mdashcontaineritemobjectstamp}}"
        containerObjectEditor += '        <div v-if="selectedObject?.queryConfig?.lastResult.length > 0" class="objectEditor" :id="\'objectEditorContainer-\' + selectedObject.mdashcontaineritemobjectstamp"></div>';
        containerObjectEditor += '      </div>';
        containerObjectEditor += '    </div>';

        containerObjectEditor += '  </div>';
        containerObjectEditor += '';


        containers = [
            {
                colSize: 6,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "select",
                    type: "select",
                    id: "templatelayout",
                    classes: "mdashconfig-item-input form-control input-source-form input-sm",
                    customData: "",
                    style: "width: 100%; ",
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
            },
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "button",
                    type: "button",
                    id: "buttonPasteContainerItemObject",
                    classes: "btn btn-default btn-sm pull-left heartbeat-effect is-beating",
                    customData: " v-on:click='pasteObjectoContainerItemObject()' ",
                    style: "display:none",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "Colar Objecto",
                    selectData: [],
                    value: "Colar Objecto",
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
                    value: containerObjectEditor,
                    event: "",
                    placeholder: ""
                }
            }];

        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);
        $(contToRender).empty();
        $(contToRender).append(formContainerResult)





        var filterValues = {};

        GMDashFilters.forEach(function (filter) {

            filterValues[filter.codigo] = "";

        });


        var filteredContainerItemObjects = GMDashContainerItemObjects.filter(function (obj) {
            return obj.mdashcontaineritemstamp === containerItem.mdashcontaineritemstamp;
        });


        setReactiveContainerItemOject(containerItem, filterValues, GMDashContainerItemObjects, filteredContainerItemObjects);



        setTimeout(function () {

            if (containerItem.templatelayout) {

                containerItem.renderLayout("#layoutdisplay", true);
            }
        }, 100);


        handleCodeEditor();

    }




    $(document).off("click", ".add-container-item-object-btn").on("click", ".add-container-item-object-btn", function (e) {

        var containerItemId = $(this).attr("containeritemId");
        $("#modalContainerItemObjectConfig").remove()

        var modalBodyHtml = "<div id='modalBodyHtmlContainerItemObjectConfig'>";
        modalBodyHtml += "</div>";
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


        refreshAllEditor(containerItemId, "#modalBodyHtmlContainerItemObjectConfig");

    })

    /*
      containerItem: containerItem,
            filterValues: filterValues,
            GMDashContainerItemObjects: GMDashContainerItemObjects,
            filteredContainerItemObjects: filteredContainerItemObjects,
    */


    function proxyToJSON(data) {

        return JSON.parse(JSON.stringify(data))
    }


    function generateDummyDataForObject() {

        var dummyData = [
            { id: 1, categoria: "Gerente", salario: 3500, nome: "João Silva", dataNascimento: "1985-03-15", genero: "M" },
            { id: 2, categoria: "Analista", salario: 2800, nome: "Maria Santos", dataNascimento: "1990-07-22", genero: "F" },
            { id: 3, categoria: "Desenvolvedor", salario: 3200, nome: "Pedro Costa", dataNascimento: "1988-11-08", genero: "M" },
            { id: 4, categoria: "Designer", salario: 2600, nome: "Ana Oliveira", dataNascimento: "1992-01-30", genero: "F" },
            { id: 5, categoria: "Técnico", salario: 2200, nome: "Carlos Ferreira", dataNascimento: "1987-09-12", genero: "M" },
            { id: 6, categoria: "Analista", salario: 2900, nome: "Sofia Rodrigues", dataNascimento: "1991-05-18", genero: "F" },
            { id: 7, categoria: "Desenvolvedor", salario: 3100, nome: "Miguel Alves", dataNascimento: "1989-12-03", genero: "M" },
            { id: 8, categoria: "Gerente", salario: 3800, nome: "Catarina Lima", dataNascimento: "1983-08-25", genero: "F" },
            { id: 9, categoria: "Designer", salario: 2700, nome: "Ricardo Sousa", dataNascimento: "1990-04-14", genero: "M" },
            { id: 10, categoria: "Técnico", salario: 2300, nome: "Isabel Martins", dataNascimento: "1993-10-07", genero: "F" },
            { id: 11, categoria: "Desenvolvedor", salario: 3000, nome: "Nuno Pereira", dataNascimento: "1986-02-28", genero: "M" },
            { id: 12, categoria: "Analista", salario: 2750, nome: "Teresa Gomes", dataNascimento: "1989-06-11", genero: "F" },
            { id: 13, categoria: "Gerente", salario: 4000, nome: "António Dias", dataNascimento: "1982-12-20", genero: "M" },
            { id: 14, categoria: "Designer", salario: 2550, nome: "Mariana Cunha", dataNascimento: "1994-03-09", genero: "F" }
        ];


        return dummyData;
    }


    function setReactiveCustomEditorObjecto(containerItemObject, selfContainterItem) {

        PetiteVue.createApp({
            containerItemObject: containerItemObject,
            selfContainterItem: selfContainterItem,
            renderCustomEditorObjecto: function () {
                var containerItem = this.selfContainterItem.containerItem;
                var containerItemObjectJson = proxyToJSON(this.containerItemObject)


                var result = containerItemObjectJson.queryConfig.lastResult.length > 0 ? containerItemObjectJson.queryConfig.lastResult : generateDummyDataForObject();

                containerItem.records = result;
                this.containerItemObject.renderObjectByContainerItem(".container-item-object-render-" + this.containerItemObject.mdashcontaineritemobjectstamp, containerItem);
            },
            initCustomEditorRender: function () {
                var self = this;
                setTimeout(function () {
                    self.renderCustomEditorObjecto();
                }, 200)
            },
            changeDivContent: function (e) {
                var editor = ace.edit(e);
                var self = this;
                this.containerItemObject[e] = editor.getValue();
                this.renderCustomEditorObjecto();

            }
        }).mount("#formConteudoCustomEditorObjecto" + containerItemObject.mdashcontaineritemobjectstamp);
    }
    function setReactiveDetailsEditor(containerItemObject, selfContainterItem) {

        // console.log("inited", $("#formConteudoDetailsEditor" + containerItemObject.mdashcontaineritemobjectstamp).length);

        PetiteVue.createApp({
            containerItemObject: containerItemObject,
            selfContainterItem: selfContainterItem,
            tipoObjectos: getTiposObjectoConfig(),
            initDetalheEditor: function () {

                var self = this;
                setTimeout(function () {
                    self.handleTipoObjectoDetalheChange(false);
                }, 200)
            },
            handleTipoObjectoDetalheChange: function (resetConfig) {

                var tipoObjecto = this.containerItemObject.tipoobjectodetalhes;
                var tipoObjecto = getTiposObjectoConfig().find(function (tipo) {
                    return tipo.tipo === tipoObjecto;
                });
                var self = this;
                var containerItemObject = this.containerItemObject;
                var containerItemObjectJson = {};
                var containerItem = this.selfContainterItem.containerItem;

                if (tipoObjecto) {

                    if (resetConfig) {
                        containerItemObject.configjson = ""
                        containerItemObject.config = {}
                    }
                    containerItemObject.objectoConfig = tipoObjecto

                    containerItemObjectJson = proxyToJSON(containerItemObject)
                    var result = containerItemObjectJson.queryConfig.lastResult.length > 0 ? containerItemObjectJson.queryConfig.lastResult : generateDummyDataForObject();

                    containerItem.records = result;
                    var schemaEditor = tipoObjecto.createDynamicSchema(result)

                    containerItemObject.objectoConfig = tipoObjecto

                    $(".object-editor-details-container").empty();

                    if (!document.getElementById('objectEditorDetailsContainer-' + containerItemObject.mdashcontaineritemobjectstamp)) {
                        return;
                    }
                    var editor = new JSONEditor(document.getElementById('objectEditorDetailsContainer-' + containerItemObject.mdashcontaineritemobjectstamp), {
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
                        );

                        var currentValue = editor.getValue();

                        if (Object.keys(containerItemObject.config).length == 0) {
                            containerItemObject.configjson = JSON.stringify(currentValue);
                            containerItemObject.config = currentValue

                        }

                        $(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp).empty();
                        containerItemObject.renderObjectByContainerItem(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, containerItem);


                    });

                    editor.on('change', function () {
                        var currentValue = editor.getValue();
                        //  self.containerItem.renderLayout(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, true);
                        containerItemObject.config = currentValue;
                        //self.containerItem.refreshContainerItem(".container-item-object-render");
                        containerItemObject.renderObjectByContainerItem(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, containerItem);
                        containerItemObject.configjson = JSON.stringify(currentValue);
                        $(".card-title").css(
                            {
                                "font-size": "14px",
                                "font-weight": "bold"
                            }
                        )
                    });


                }



            }

        }).mount("#formConteudoDetailsEditor" + containerItemObject.mdashcontaineritemobjectstamp);
    }

    function gerarConteudoCustomEditorObjecto(containerItemObject, selfContainterItem) {

        var containerId = "formConteudoCustomEditorObjecto" + containerItemObject.mdashcontaineritemobjectstamp;
        var sufixoForm = "formConteudoCustomEditorObjecto";
        var sourceData = {};
        containers = [
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "expressaoobjecto",
                    classes: "m-editor",
                    customData: " v-on:keyup='changeDivContent(\"" + "expressaoobjecto" + "\")'",
                    style: "width: 100%; height:300px;overflow:auto; ",
                    selectCustomData: "" + " ",
                    fieldToOption: "descricao",
                    fieldToValue: "tipo",
                    rows: 10,
                    cols: 10,
                    label: "Expressão do objeto ",
                    selectData: [],
                    value: "{{containerItemObject.expressaoobjecto}}",
                    event: "",
                    placeholder: ""
                }
            },
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "customEditorIniter",
                    classes: "m-editor",
                    customData: " ",
                    style: "",
                    selectCustomData: "" + " ",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: " ",
                    selectData: [],
                    value: "{{initCustomEditorRender()}}",
                    event: "",
                    placeholder: ""
                }
            }
        ];

        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);
        return formContainerResult;

    }
    function gerarConteudoDetailsEditor(containerItemObject, selfContainterItem) {



        var containerId = "formConteudoDetailsEditor" + containerItemObject.mdashcontaineritemobjectstamp;
        var sufixoForm = "formConteudoDetailsEditor";

        var sourceData = {};
        containers = [
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "input",
                    type: "text",
                    id: "titulodetalhes",
                    classes: "mdashconfig-item-input form-control input-source-form input-sm",
                    customData: "v-model='containerItemObject.titulodetalhes'",
                    style: "width: 100%; ",
                    selectCustomData: "" + " ",
                    fieldToOption: "descricao",
                    fieldToValue: "tipo",
                    rows: 10,
                    cols: 10,
                    label: "Título do objeto ",
                    selectData: [],
                    value: containerItemObject.titulodetalhes,
                    event: "",
                    placeholder: ""
                }
            },
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "select",
                    type: "select",
                    id: "tipoobjectodetalhes",
                    classes: "mdashconfig-item-input form-control input-source-form input-sm",
                    customData: "",
                    style: "width: 100%; ",
                    selectCustomData: "" + " v-model='containerItemObject.tipoobjectodetalhes' @change=handleTipoObjectoDetalheChange(true)",
                    fieldToOption: "descricao",
                    fieldToValue: "tipo",
                    rows: 10,
                    cols: 10,
                    label: " Tipo de objeto ",
                    selectData: getTiposObjectoConfig(),
                    value: containerItemObject.tipoobjectodetalhes,
                    event: "",
                    placeholder: ""
                }
            },
            {
                colSize: 12,
                style: "margin-bottom:0.8em;",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "objectEditorDetailsContainer-" + containerItemObject.mdashcontaineritemobjectstamp,
                    classes: "object-editor-details-container",
                    customData: "",
                    style: "width: 100%; ",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: " ",
                    selectData: [],
                    value: "{{initDetalheEditor()}}",
                    event: "",
                    placeholder: ""
                }
            }
        ];


        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);

        return formContainerResult



    }
    function setReactiveContainerItemOject(containerItem, filterValues, GMDashContainerItemObjects, filteredContainerItemObjects) {

        Greactive = PetiteVue.createApp({
            containerItem: containerItem,
            filterValues: filterValues,
            GMDashContainerItemObjects: GMDashContainerItemObjects,
            filteredContainerItemObjects: filteredContainerItemObjects,
            GCopiedComponentData: GCopiedComponentData,
            selectedObject: selectedObject,
            initEditorObject: function (containerItemObject) {

                var self = this;
                //console.log("inited" )

                setTimeout(function () {
                    self.updateObjectType(containerItemObject);
                }, 200);



            },

            initJSONEditor: function (containerItemObject, tipoObjecto) {

                var self = this;
                containerItemObjectJson = proxyToJSON(containerItemObject)
                var result = containerItemObjectJson.queryConfig.lastResult.length > 0 ? containerItemObjectJson.queryConfig.lastResult : generateDummyDataForObject();

                this.containerItem.records = result;
                var schemaEditor = tipoObjecto.createDynamicSchema(result)

                containerItemObject.objectoConfig = tipoObjecto

                $(".objectEditor").empty();

                if (!document.getElementById('objectEditorContainer-' + containerItemObject.mdashcontaineritemobjectstamp)) {
                    return;
                }

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
                    );

                    var currentValue = editor.getValue();

                    if (Object.keys(containerItemObject.config).length == 0) {
                        containerItemObject.configjson = JSON.stringify(currentValue);

                    }
                    containerItemObject.config = containerItemObject.config || currentValue;

                    containerItemObject.renderObjectByContainerItem(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, self.containerItem);





                });

                editor.on('change', function () {
                    var currentValue = editor.getValue();
                    //  self.containerItem.renderLayout(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, true);
                    containerItemObject.config = currentValue;
                    //self.containerItem.refreshContainerItem(".container-item-object-render");
                    containerItemObject.renderObjectByContainerItem(".container-item-object-render-" + containerItemObject.mdashcontaineritemobjectstamp, self.containerItem);
                    containerItemObject.configjson = JSON.stringify(currentValue);
                    $(".card-title").css(
                        {
                            "font-size": "14px",
                            "font-weight": "bold"
                        }
                    )

                    setTimeout(function () {
                        realTimeComponentSync(containerItemObject, containerItemObject.table, containerItemObject.idfield)
                    }, 0);
                });


            },
            initDetailEditor: function (containerItemObject) {

                var self = this;
                containerItemObjectJson = proxyToJSON(containerItemObject)
                var result = containerItemObjectJson.queryConfig.lastResult.length > 0 ? containerItemObjectJson.queryConfig.lastResult : generateDummyDataForObject();
                this.$nextTick(function () {
                    var editorForm = gerarConteudoDetailsEditor(containerItemObject, self);
                    $(".objectEditor").empty();
                    $("#objectEditorContainer-" + containerItemObject.mdashcontaineritemobjectstamp).empty();
                    $("#objectEditorContainer-" + containerItemObject.mdashcontaineritemobjectstamp).append(editorForm);
                    setReactiveDetailsEditor(containerItemObject, self);
                });

            },
            initCustomEditor: function (containerItemObject) {
                var self = this;
                containerItemObjectJson = proxyToJSON(containerItemObject)
                var result = containerItemObjectJson.queryConfig.lastResult.length > 0 ? containerItemObjectJson.queryConfig.lastResult : generateDummyDataForObject();

                this.$nextTick(function () {
                    var editorForm = gerarConteudoCustomEditorObjecto(containerItemObject, self);
                    $(".objectEditor").empty();
                    $("#objectEditorContainer-" + containerItemObject.mdashcontaineritemobjectstamp).empty();
                    $("#objectEditorContainer-" + containerItemObject.mdashcontaineritemobjectstamp).append(editorForm);
                    setReactiveCustomEditorObjecto(containerItemObject, self);
                    handleCodeEditor();
                });
            },
            updateObjectType: function (containerItemObject) {
                var self = this;

                var contItem = JSON.parse(JSON.stringify(containerItemObject))

                var tipoObjecto = getTiposObjectoConfig().find(function (tipo) {
                    return tipo.tipo === contItem.tipo;
                });

                if (tipoObjecto) {


                    switch (tipoObjecto.categoria) {
                        case "editor":
                            this.initJSONEditor(containerItemObject, tipoObjecto);
                            break;
                        case "custom":
                            this.initCustomEditor(containerItemObject);
                            break;
                        case "detail":
                            this.initDetailEditor(containerItemObject);
                            break;
                        default:
                            alertify.error("Categoria de objecto n&atilde;o suportada: " + tipoObjecto.categoria);

                    }



                }

            },

            showPasteButton: function () {

                var existingObjectsToPaste = GCopiedComponentData.filter(function (copied) {
                    return copied.table === "MdashContainerItemObject";
                }).length;
                //console.log("existingObjectsToPaste", existingObjectsToPaste)
                return existingObjectsToPaste > 0;
            },
            pasteObjectoContainerItemObject: function () {


                var filteredPasted = GCopiedComponentData.filter(function (copied) {
                    return copied.componentCopyConfig.table === "MdashContainerItemObject";
                });
                self = this

                filteredPasted.forEach(function (pasted) {


                    self.GMDashContainerItemObjects.push(pasted.componentData);
                    // this.filteredContainerItemObjects.push(newObject);
                    GMDashContainerItemObjects = self.GMDashContainerItemObjects

                    // console.log("New object added:", newObject);

                    self.filteredContainerItemObjects = self.GMDashContainerItemObjects.filter(function (obj) {
                        return obj.mdashcontaineritemstamp === containerItem.mdashcontaineritemstamp;
                    });

                    realTimeComponentSync(pasted.componentData, pasted.componentData.table, pasted.componentData.idfield)

                });

                $("#buttonPasteContainerItemObject").hide();
            },
            handleTemplateLayoutChange: function (templateCode) {


                var card = gerarConteudoEditorObjecto(this.containerItem);
                var self = this
                GTMPReactiveInstance = this

                //objectPreview
                this.$nextTick(function () {
                    $("#objectPreview").empty(); // Limpa o conteúdo anterior
                    $("#objectPreview").append(card); // Adiciona o novo card
                    refreshAllEditor(self.containerItem.mdashcontaineritemstamp, "#modalBodyHtmlContainerItemObjectConfig");
                });

                realTimeComponentSync(this.containerItem, this.containerItem.table, this.containerItem.idfield)

            },
            // ... resto dos métodos existentes
            removeContainerObject: function (containerItemObject) {


                this.GMDashContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemobjectstamp != containerItemObject.mdashcontaineritemobjectstamp;
                });


                console.log("this.GMDashContainerItemObjects", this.GMDashContainerItemObjects)
                GMdashDeleteRecords.push({
                    table: "MdashContainerItemObject",
                    stamp: containerItemObject.mdashcontaineritemobjectstamp,
                    tableKey: "mdashcontaineritemobjectstamp"
                });

                this.filteredContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemstamp == containerItemObject.mdashcontaineritemstamp;
                });

                console.log("Filtered", this.filteredContainerItemObjects)


            },

            addObjectoContainerItem: function (GTMPDragItem) {


                var newObject = new MdashContainerItemObject({
                    mdashcontaineritemobjectstamp: generateUUID(),
                    mdashcontaineritemstamp: containerItem.mdashcontaineritemstamp,
                    dashboardstamp: GMDashStamp,
                    tipo: GTMPDragItem.tipo,
                    categoria: GTMPDragItem.categoria,
                    tamanho: 4,
                    ordem: this.nextOrder++,
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
                // this.filteredContainerItemObjects.push(newObject);
                GMDashContainerItemObjects = this.GMDashContainerItemObjects

                // console.log("New object added:", newObject);

                this.filteredContainerItemObjects = this.GMDashContainerItemObjects.filter(function (obj) {
                    return obj.mdashcontaineritemstamp === containerItem.mdashcontaineritemstamp;
                });

                realTimeComponentSync(newObject, newObject.table, newObject.idfield)
            },
            availableObjects: getTiposObjectoConfig(),
            objects: [],
            dragItem: GTMPDragItem,
            dragId: GTMPDragId,
            nextOrder: 1,

            getObjectsSorted: function () {
                return this.filteredContainerItemObjects.slice().sort(function (a, b) {
                    return a.ordem - b.ordem;
                });
            },

            selectObject: function (obj) {
                console.log("Selected object:", obj);
                this.selectedObject = obj;

                console.log("Selected object after set:", this.selectedObject);
                this.initEditorObject(obj);
            },

            dragStart: function (item) {
                this.dragItem = item;
                GTMPDragItem = item;

                //  this.dragId = null;
            },
            dragExisting: function (id) {

                this.dragId = id;
                GTMPDragId = id;
                this.dragItem = this.GMDashContainerItemObjects.filter(function (o) { return o.mdashcontaineritemobjectstamp === id; })[0] || null;
                GTMPDragItem = this.dragItem;
            },
            drop: function (targetId) {


                if (!GTMPDragItem) return;

                var targetIndex = this.GMDashContainerItemObjects.length;
                if (targetId) {
                    targetIndex = this.GMDashContainerItemObjects.findIndex(function (o) { return o.mdashcontaineritemobjectstamp === targetId; });
                }

                if (GTMPDragId !== null) {
                    // mover existente
                    var index = this.GMDashContainerItemObjects.findIndex(function (o) { return o.mdashcontaineritemobjectstamp === this.dragId; }.bind(this));
                    var dragged = this.GMDashContainerItemObjects[index];
                    this.GMDashContainerItemObjects.splice(index, 1);
                    this.GMDashContainerItemObjects.splice(targetIndex, 0, dragged);


                } else {

                    this.addObjectoContainerItem(GTMPDragItem);

                }

                this.GMDashContainerItemObjects.forEach(function (o, idx) { o.ordem = idx + 1; });



               /* Promise.resolve().then(function () {

                   
                })
*/             this.filteredContainerItemObjects.forEach(function (itmObj) {

                    realTimeComponentSync(itmObj, itmObj.table, itmObj.idfield)

                });
                this.dragItem = null;
                GTMPDragItem = null;
                this.dragId = null;
                GTMPDragId = null;
            },
            abrirConfiguracaoDetalhe: function (containerItemObject) {

                $("#modalConfiguracaoDetalhe").remove();


            },
            copiarObjeto: function (containerItemObject) {

                copyMdashComponent(containerItemObject.mdashcontaineritemobjectstamp, "MdashContainerItemObject", null, null);
                $("#buttonPasteContainerItemObject").show();

            },
            abrirEditorQuery: function (containerItemObject) {

                $("#modalEditorQuery").remove()


                var conteudoEditor = gerarConteudoEditorQuery(containerItemObject, this.containerItem);
                var modalHtmlBody = "<div id='containerItemObjectQueryConfigContainer' >" + conteudoEditor + "</div>"

                var modalData = {
                    title: "Editor de query",
                    id: "modalEditorQuery",
                    customData: "",
                    otherclassess: "",
                    body: modalHtmlBody,
                    footerContent: ""
                };

                var modalHTML = generateModalHTML(modalData);
                var self = this;

                $("#mainPage").append(modalHTML);
                $("#modalEditorQuery").modal("show");

                PetiteVue.createApp({
                    containerItemObject: containerItemObject,
                    containerItem: self.containerItem,
                    filterValues: self.filterValues,
                    GMDashContainerItemObjects: self.GMDashContainerItemObjects,
                    mainQueryHasError: false,
                    mainQueryError: "",
                    queryJsonResult: "",
                    updateQueryLocalConfig: function () {


                        this.containerItemObject.queryconfigjson = JSON.stringify(this.containerItemObject.queryConfig);
                        realTimeComponentSync(this.containerItemObject, this.containerItemObject.table, this.containerItemObject.idfield);
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
                        this.updateQueryLocalConfig()
                    },

                    removeSelectField: function (index, containerItemObject) {
                        this.GMDashContainerItemObjects.filter(function (obj) {
                            return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                        }).forEach(function (obj) {
                            if (obj.queryConfig.selectFields[index]) {
                                obj.queryConfig.selectFields.splice(index, 1);
                            }
                        });

                        this.updateQueryLocalConfig()
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
                        this.updateQueryLocalConfig()
                    },

                    removeFilter: function (index, containerItemObject) {
                        this.GMDashContainerItemObjects.filter(function (obj) {
                            return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                        }).forEach(function (obj) {


                            if (obj.queryConfig.filters[index]) {
                                obj.queryConfig.filters.splice(index, 1);
                            }
                        });
                        this.updateQueryLocalConfig()
                    },
                    getContainerRecords: function () {

                        if (this.containerItem.records && this.containerItem.records.length > 0) {
                            return this.containerItem.records;
                        }


                        this.containerItem.records = [];

                        return this.containerItem.records;
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
                            //  containerItemObject.config = {};
                            //  containerItemObject.configjson = "";
                            realTimeComponentSync(containerItemObject, containerItemObject.table, containerItemObject.idfield);

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
                        this.updateQueryLocalConfig();
                    },

                    removeGroupBy: function (index, containerItemObject) {
                        this.GMDashContainerItemObjects.filter(function (obj) {
                            return obj.mdashcontaineritemobjectstamp === containerItemObject.mdashcontaineritemobjectstamp;
                        }).forEach(function (obj) {
                            if (obj.queryConfig.groupBy[index]) {
                                obj.queryConfig.groupBy.splice(index, 1);
                            }
                        });

                        this.updateQueryLocalConfig()
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
                                        alertify.error("Erro " + errorMessage, 9000);
                                        self.mainQueryError = JSON.stringify(response, null, 2);;
                                        self.mainQueryHasError = true;
                                        return false
                                    }


                                    var containersItemObjectsList = self.GMDashContainerItemObjects.filter(function (obj) {
                                        return obj.mdashcontaineritemstamp === self.containerItem.mdashcontaineritemstamp;
                                    });


                                    var queryResult = response.data.length > 0 ? response.data : generateDummyDataForSchema(response.schema, 3);

                                    self.queryJsonResult = JSON.stringify(queryResult).replaceAll("total", "tot");
                                    self.containerItem.records = JSON.parse(self.queryJsonResult);
                                    self.mainQueryHasError = false;
                                    realTimeComponentSync(self.containerItem, self.containerItem.table, self.containerItem.idfield);
                                    alertify.success("Query executada com sucesso", 5000);
                                } catch (error) {
                                    console.log("Erro interno " + errorMessage, response)
                                    alertify.error("Erro " + errorMessage, 9000);
                                    self.mainQueryError = "Erro interno " + errorMessage;
                                    self.mainQueryHasError = true;
                                    //alertify.error("Erro interno " + errorMessage, 10000)
                                }

                                //  javascript:__doPostBack('','')
                            }
                        })

                    },
                    abrirQueryJsonResult: function () {

                        $("#queryJsonResultModal").remove()
                        var formattedJson = JSON.stringify(JSON.parse(this.queryJsonResult), null, 2);
                        var modalHtmlBody = "<pre id='queryJsonResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                        var modalData = {
                            title: "Resultado JSON",
                            id: "queryJsonResultModal",
                            customData: "",
                            otherclassess: "",
                            body: modalHtmlBody,
                            footerContent: ""
                        };

                        var modalHTML = generateModalHTML(modalData);
                        $("#mainPage").append(modalHTML);
                        $("#queryJsonResultModal").modal("show");
                    },
                    abrirErroResult: function () {

                        $("#queryErrorResultModal").remove();
                        var formattedJson = this.mainQueryError
                        var modalHtmlBody = "<pre id='queryErrorResultModalBody' style='background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>" + formattedJson + "</pre>"
                        var modalData = {
                            title: "Erro na query",
                            id: "queryErrorResultModal",
                            customData: "",
                            otherclassess: "",
                            body: modalHtmlBody,
                            footerContent: ""
                        };
                        var modalHTML = generateModalHTML(modalData);
                        $("#mainPage").append(modalHTML);
                        $("#queryErrorResultModal").modal("show");
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
                        // realTimeComponentSync(self.containerItem, self.containerItem.table, self.containerItem.idfield)
                        /*  Promise.resolve().then(function () {
  
                              realTimeComponentSync(self.containerItem, self.containerItem.table, self.containerItem.idfield);
                          }
                          );*/

                        setTimeout(function () {
                            realTimeComponentSync(self.containerItem, self.containerItem.table, self.containerItem.idfield);
                        }, 0);

                    },
                }).mount('#containerItemObjectQueryConfigContainer');
                handleCodeEditor();
                $("#modalEditorQuery .modal-dialog").css("width", "90%")



            },
            removeObject: function (id) {
                var self = this;


                Swal.fire({
                    title: 'Tem certeza?',
                    text: "Deseja remover este objeto?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sim, remover',
                    cancelButtonText: 'Cancelar'
                }).then(function (result) {
                    if (result.isConfirmed) {

                        var containerItemObject = self.GMDashContainerItemObjects.find(function (obj) {
                            return obj.mdashcontaineritemobjectstamp === id;
                        });

                        if (containerItemObject) {
                            self.removeContainerObject(containerItemObject)
                        }

                    }
                });
            }

        }).mount('#maincontent');


    }


    function generateDummyDataForSchema(columns, numRecords) {
        if (!numRecords) numRecords = 3;

        var randomString = function (len) {
            if (!len) len = 5;
            var text = "";
            for (var i = 0; i < len; i++) {
                text += String.fromCharCode(97 + Math.floor(Math.random() * 26));
            }
            return text;
        };

        var randomInt = function (min, max) {
            if (typeof min === "undefined") min = 0;
            if (typeof max === "undefined") max = 200;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        var randomDate = function () {
            var start = new Date(2000, 0, 1).getTime();
            var end = new Date(2025, 11, 31).getTime();
            var date = new Date(start + Math.random() * (end - start));
            return date.toISOString().split("T")[0] + " " + date.toTimeString().split(" ")[0];
        };

        var getValueByType = function (type) {
            var t = type.toLowerCase();
            if (t.indexOf("char") !== -1) return randomString(randomInt(3, 10));
            if (t.indexOf("numeric") !== -1 || t.indexOf("int") !== -1) return randomInt();
            if (t.indexOf("bit") !== -1) return true;
            if (t.indexOf("date") !== -1) return randomDate();
            if (t.indexOf("text") !== -1) return "lorem ipsum " + randomString(10);
            return null;
        };

        var records = [];
        for (var i = 0; i < numRecords; i++) {
            var record = {};
            for (var j = 0; j < columns.length; j++) {
                var col = columns[j];
                record[col.name] = getValueByType(col.system_type_name);
            }
            records.push(record);
        }

        return records;
    }


    function gerarConteudoEditorQuery(containerItemObject, containerItem) {

        var containerId = "formContainerItemObjectQueryConfig";
        var sufixoForm = "formContainerItemObjectQueryConfig";

        var sourceData = {};
        containers = [
            {
                colSize: 12,
                style: "",
                content: {
                    contentType: "div",
                    type: "div",
                    id: "expressaodblistagemccontainerobject",
                    classes: "m-editor mdashconfig-item-input ",
                    customData: "v-on:keyup='changeExpressaoDbListagemAndHandleFilters(\"" + "expressaodblistagemccontainerobject" + "\",\"expressaodblistagem\")'",
                    style: "width: 100%; height: 250px;overflow:auto;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 120,
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
                colSize: 1,
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
                colSize: 1,
                style: "",
                content: {
                    contentType: "button",
                    type: "button",
                    id: "queryjsonresultbtn",
                    classes: "pull-left btn btn-default btn-sm",
                    customData: " v-if='queryJsonResult &&mainQueryHasError==false' v-on:click='abrirQueryJsonResult()'",
                    style: "margin-top:0.4em;margin-left:-4em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "<span class='glyphicon  glyphicon glyphicon-th-list' ></span>",
                    selectData: "",
                    value: "",
                    event: "",
                    placeholder: "",

                }
            },
            {
                colSize: 1,
                style: "",
                content: {
                    contentType: "button",
                    type: "button",
                    id: "exportjsonresultbtn",
                    classes: "pull-left btn btn-warning btn-sm",
                    customData: " v-if='mainQueryHasError' v-on:click='abrirErroResult()'",
                    style: "margin-top:0.4em;background: #dc3545!important;color:white;margin-left:-8em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "<span class='glyphicon  glyphicon glyphicon-info-sign' ></span>",
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
                    type: "button",
                    id: "numeroResultadosQuery",
                    classes: "pull-left ",
                    customData: " v-if='queryJsonResult &&mainQueryHasError==false' ",
                    style: "margin-top:1em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: "<span>Resultados: <strong>{{ containerItem.records.length }}</strong></span>",
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
                    id: "reactiveLocalQueryContainer",
                    classes: "",
                    customData: "",
                    style: "margin-top:1em;",
                    selectCustomData: "",
                    fieldToOption: "",
                    fieldToValue: "",
                    rows: 10,
                    cols: 10,
                    label: "",
                    selectData: "",
                    value: generateReactiveQueryHTML(),
                    event: "",
                    placeholder: "",

                }
            }
        ];


        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);

        return formContainerResult

    }


    function gerarConteudoEditorObjecto(containerItem) {

        var listaTemplates = getTemplateLayoutOptions();
        var selectedTemplate = listaTemplates.find(function (template) {
            return template.codigo === containerItem.templatelayout;
        });

        if (selectedTemplate) {

            containerItem.dadosTemplate = selectedTemplate;
            var containerObjectEditor = '';
            // ...existing code...
            containerObjectEditor += '        <div style="height:500px;overflow:auto;" class="dropzone" @dragover.prevent @drop="drop(null)">';
            containerObjectEditor += '           <div  @click="selectObject(obj)" v-for="obj in getObjectsSorted()" :key="obj.mdashcontaineritemobjectstamp"  draggable="true" @dragstart="dragExisting(obj.mdashcontaineritemobjectstamp)" @drop.prevent="drop(obj.mdashcontaineritemobjectstamp)" @dragover.prevent>';
            containerObjectEditor += '              <div class="dashboard-object-item-editor">';
            containerObjectEditor += "                 <div style='display:flex;align-items:center;column-gap:0.4em;justify-content:end;margin-bottom:0.3em'>";
            containerObjectEditor += '                  <button type="button" class="btn btn-warning btn-sm" @click="abrirEditorQuery(obj)"><i class="fa fa-database" ></i></button>';
            containerObjectEditor += '                  <button type="button" class="btn btn-default btn-sm" @click="copiarObjeto(obj)"><i class="fa fa-copy" ></i></button>';

            containerObjectEditor += '                  <button  type="button" class="btn btn-warning btn-sm" style="background: #dc3545!important" @click="removeObject(obj.mdashcontaineritemobjectstamp)"><i class="fa fa-trash" ></i></button>';
            containerObjectEditor += "                 </div>";
            containerObjectEditor += '                 <div  :class="\' container-item-object-render-\' + obj.mdashcontaineritemobjectstamp" >     {{ obj.tipo }} (ID: {{ obj.mdashcontaineritemobjectstamp }}, Ordem: {{ obj.ordem }})';
            containerObjectEditor += "                 </div>"; // Fecha a :class div
            containerObjectEditor += "              </div>"; // Fecha a dashboard-object-item-editor
            containerObjectEditor += '           </div>'; // Fecha a div do v-for - ESTA LINHA ESTAVA NA POSIÇÃO CORRETA
            containerObjectEditor += '        </div>'; // Fecha a dropzone
            // ...existing code...



            var cardHtml = selectedTemplate.generateCard({
                title: containerItem.titulo,
                id: containerItem.mdashcontaineritemstamp,
                tipo: selectedTemplate.UIData.tipo || "primary",
                bodyContent: containerObjectEditor,
            });


            return cardHtml;

        }

    }

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

        realTimeComponentSync(mdashFilter, mdashFilter.table, mdashFilter.idfield);



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



    function getMaxOrdemByLocalSource(localSource) {

        var maxOrdem = 0;
        if (Array.isArray(localSource) && localSource.length > 0) {
            maxOrdem = localSource.reduce(function (max, item) {
                return Math.max(max, item.ordem || 0);
            }, 0);
        }

        return maxOrdem;
    }


    function copyMdashComponent(componenteId, table, parentComponentId, parentIdField) {

        var componentCopyConfig = GMdashEntityCopyConfig.find(function (conf) {
            return conf.table == table
        });

        if (!componentCopyConfig) {

            throw new Error("Configuração de cópia não encontrada para o componente: " + table);
        }

        var localSource = eval(componentCopyConfig.localsource);

        var componentData = localSource.find(function (item) {
            return item[componentCopyConfig.idfield] === componenteId;
        });

        if (!componentData) {
            throw new Error("Componente não encontrado na fonte local: " + table);
        }

        var originalId = componentData[componentCopyConfig.idfield];

        var newComponentId = generateUUID();

        var copiedComponent = Object.assign({}, componentData);
        copiedComponent[componentCopyConfig.idfield] = newComponentId;

        if (parentComponentId && parentIdField) {
            copiedComponent[parentIdField] = parentComponentId;
        }

        copiedComponent.ordem = getMaxOrdemByLocalSource(localSource) + 1;





        var copiedData = {
            componentCopyConfig: componentCopyConfig,
            componentData: new componentCopyConfig.entityToInstantiate(copiedComponent)
        };

        GCopiedComponentData.push(copiedData);

        if (componentCopyConfig.childs && componentCopyConfig.childs.length > 0) {
            componentCopyConfig.childs.forEach(function (childTable) {
                // Encontrar configuração do filho
                var childConfig = GMdashEntityCopyConfig.find(function (conf) {
                    return conf.table == childTable;
                });

                if (childConfig) {
                    // Encontrar todos os filhos do componente original
                    var childLocalSource = eval(childConfig.localsource);
                    var children = childLocalSource.filter(function (child) {
                        return child[componentCopyConfig.idfield] === originalId;
                    });

                    // Copiar cada filho recursivamente
                    children.forEach(function (child) {
                        copyMdashComponent(
                            child[childConfig.idfield],
                            childTable,
                            newComponentId,
                            componentCopyConfig.idfield
                        );
                    });
                }
            });
        }

    }

    function handleRenderPastedUI(componenteType, componenteData) {

        switch (componenteType) {
            case "MdashContainer":
                // Renderizar UI para MdashContainer

                var containerUIObjectFormConfigResult = getContainerUIObjectFormConfigAndSourceValues();
                addContainerMDashConfig(componenteData, containerUIObjectFormConfigResult);
                break;
            case "MdashContainerItem":

                var containerUIObjectFormConfigResult = getContainerItemUIObjectFormConfigAndSourceValues();
                addContainerItemMDashConfig(componenteData, containerUIObjectFormConfigResult);
                break;
            default:
                break;
        }

        GCopiedComponentData = [];
        $("#pasteContainerMDashBtn").hide()

    }

    function pasteComponents() {
        GCopiedComponentData.forEach(function (copiedData) {
            // Aqui você pode usar copiedData para colar os componentes copiados
            var componentCopyConfig = copiedData.componentCopyConfig;
            var componentData = copiedData.componentData;

            var localSource = eval(componentCopyConfig.localsource);
            localSource.push(componentData);

            handleRenderPastedUI(componentData.table, componentData);
            realTimeComponentSync(componentData, componentData.table, componentData.idfield);
        });
    }
    $(document).off("click", ".paste-m-dash-container-btn").on("click", ".paste-m-dash-container-btn", function (e) {

        /* var copiedData = {
             componentCopyConfig: componentCopyConfig,
             componentData: copiedComponent
         };*/

        pasteComponents()




    })
    $(document).off("click", ".copy-container-btn").on("click", ".copy-container-btn", function (e) {

        var containerId = $(this).data("mdashcontainerstamp");

        $(".paste-m-dash-container-btn").show();
        copyMdashComponent(containerId, "MdashContainer", null, null);


    });

    $(document).off("click", ".copy-container-item-btn").on("click", ".copy-container-item-btn", function (e) {

        var containerItemId = $(this).data("mdashcontaineritemstamp");

        $(".paste-m-dash-container-btn").text("Colar item")
        $(".paste-m-dash-container-btn").show();
        copyMdashComponent(containerItemId, "MdashContainerItem", null, null);



    });

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

        realTimeComponentSync(mdashContainer, mdashContainer.table, mdashContainer.idfield);

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
            realTimeComponentSync(newItem, newItem.table, newItem.idfield);


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
        customData: " type='button' data-tooltip='Remover item do container' data-original-title='Remover item do container' ",
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

    var botaoCopyContainerItem = {
        style: "",
        buttonId: "copyContainerItemBtn_" + containerItem.mdashcontaineritemstamp,
        classes: "btn btn-xs btn-default copy-container-item-btn",
        customData: " data-mdashcontaineritemstamp='" + containerItem.mdashcontaineritemstamp + "' type='button' data-tooltip='true' data-original-title='Copiar item do container' ",
        label: "<span class='glyphicon glyphicon-duplicate'></span>",
        onClick: "",
    };
    var copyContainerItemHtml = generateButton(botaoCopyContainerItem);
    actionsContainer += copyContainerItemHtml;

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

    var copiarContainerBtn = {
        style: "",
        buttonId: "copyContainerBtn_" + container.mdashcontainerstamp,
        classes: "btn btn-xs btn-default copy-container-btn",
        customData: " data-mdashcontainerstamp='" + container.mdashcontainerstamp + "' type='button' data-tooltip='true' data-original-title='Copiar container' ",
        label: "<span class='glyphicon glyphicon-duplicate'></span>",
        onClick: "",
    };
    var copyContainerHtml = generateButton(copiarContainerBtn);

    var actionsContainer = "<div style='display:flex;column-gap:0.5em'>"
    actionsContainer += addItemButtonHtml;
    actionsContainer += removerContainerHtml
    actionsContainer += openConfigButtonHtml;
    actionsContainer += copyContainerHtml;
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

function objectItemEditorStyles(styles) {
    var style = "";
    style += ".dropzone {";
    style += "  border: 2px dashed #4a6cf7;";
    style += "  border-radius: 12px;";
    style += "  min-height: 300px;";
    style += "  padding: 15px;";
    style += "}";
    style += ".dashboard-object {";
    style += "  background:  #dee2e6;";
    style += "  border-radius: 10px;";
    style += "  margin: 10px 0;";
    style += "  padding: 15px;";
    style += "  position: relative;";
    style += "  text-align: center;";
    style += "  cursor: grab;";
    style += "}";
    style += ".dashboard-object-item-editor {";
    style += "  border: 1px dashed #dee2e6;";
    style += "  border-radius: 10px;";
    style += "  margin: 10px 0;";
    style += "  padding: 15px;";
    style += "  position: relative;";
    style += "  text-align: center;";
    style += "  cursor: grab;";
    style += "}";
    style += ".btn-remove-object-editor {";
    // style += "  position: absolute;";
    // style += "  top: 6px;";
    //style += "  right: 6px;";
    style += "  background: #dc3545;";
    style += "  color: white;";
    style += "  border: none;";
    style += "  border-radius: 50%;";
    style += "  width: 22px;";
    style += "  height: 22px;";
    style += "  font-size: 12px;";
    style += "  cursor: pointer;";
    style += "  display: block;";
    style += "}";
    style += ".btn-query-object-editor {";
    // style += "  position: absolute;";
    //style += "  top: 6px;";
    //style += "  right: 6px;";
    style += "  background: #deb22cff;";
    style += "  color: white;";
    style += "  border: none;";
    style += "  border-radius: 50%;";
    style += "  width: 22px;";
    style += "  height: 22px;";
    style += "  font-size: 12px;";
    style += "  cursor: pointer;";
    style += "  display: block;";
    style += "}";
    /*  style += ".dashboard-object-item-editor:hover .btn-remove {";
      style += "  display: flex;";
      style += "  align-items: center;";
      style += "  justify-content: center;";
      style += "}";*/
    styles.push(style);
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
    var fontes = dados.fontes || [];
    GMDashFontes = fontes.map(function (f) {

        try {
            var newFonte = new MDashFonte(f);
            newFonte.setUIFormConfig();
            newFonte.setTupDataOnLocalDb();
            return newFonte;
        } catch (error) {
            console.log("Erro ao processar fonte:", error);

            return newFonte;
        }

    });
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

    filterContainer += "                    <div class='mt-4 '>";
    filterContainer += "                        <h5 class='section-title'><i style='margin-left:0.3em' class='fas fa-database me-2'></i> Fontes de Dados</h5>";
    filterContainer += "                        <button style='margin-bottom:2em;' type='button' class='btn btn-primary btn-sm w-100 mb-3' @click='addDataSource'>";
    filterContainer += "                            <i class='fas fa-plus me-1'></i> Adicionar Fonte";
    filterContainer += "                        </button>";
    filterContainer += "                        <div class='filter-item' v-for='(source, index) in dataSources' :key='index'>";
    filterContainer += "                            <div style='display:flex;align-items:center;justify-content:center;column-gap:0.4em'  class='d-flex justify-content-between align-items-center mb-2'>";
    filterContainer += "                                <span class='fw-bold'>{{ source.descricao || 'Nova Fonte' }}</span>";
    filterContainer += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='openConfigReportElement(source,\"Fonte\")'>";

    filterContainer += "                                    <span class='glyphicon glyphicon-cog'></span>";
    filterContainer += "                                </button>"
    filterContainer += "                                <button type='button' class='btn btn-sm btn-outline-danger' @click='removeDataSource(index,source)'>";
    filterContainer += "                                    <i class='fas fa-times'></i>";
    filterContainer += "                                </button>";
    filterContainer += "                            </div>";
    filterContainer += "                            <div v-if='source.schema.length==0'  class='mb-2'>";
    filterContainer += "                                 <div class='alert alert-info' role='alert' style='margin-top:1em;'>Atenção!Para usar esta fonte de dados deve definir o schema. </div> ";
    filterContainer += "                            </div>";
    filterContainer += "                        </div>";
    filterContainer += "                    </div>";


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


    var pasteContainerBtnData = {
        style: "margin-left:0.5em;display:none;",
        buttonId: "pasteContainerMDashBtn",
        classes: "heartbeat-effect is-beating btn btn-sm btn-default paste-m-dash-container-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Colar container' ",
        label: "Colar container <span class='glyphicon glyphicon glyphicon-paste' ></span>",
        onClick: "",
    };
    var pasteContainerButtonHtml = generateButton(pasteContainerBtnData);

    dashboardContainer += "<div style='display:flex;column-gap:0.5em;margin-righ:0.3em;margin-bottom:0.5em'>";
    dashboardContainer += "<div >" + addContainerButtonHtml + "</div>";
    dashboardContainer += "<div >" + pasteContainerButtonHtml + "</div>";
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
        onClick: "actualizarConfiguracaoMDashboard()"
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
                console.log("Erro interno " + errorMessage, error);
            }
        }
    });
}
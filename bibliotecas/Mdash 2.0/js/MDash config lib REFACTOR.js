/**
 * ============================================================================
 * MDash 2.0 - Configuration Library (REFACTOR COMPLETO)
 * ============================================================================
 * 
 * Respeita TODA a estrutura original:
 * - MdashContainer (Containers/Rows)
 * - MdashContainerItem (Items dentro dos containers, com template/layout)
 * - MdashContainerItemObject (Objetos visuais: gráficos, tabelas, etc.)
 * - MdashFilter (Filtros do dashboard)
 * - MDashFonte (Data sources)
 * 
 * Apenas muda a FORMA de manipular (mais visual e intuitiva)
 */

// ============================================================================
// GLOBAL STATE MANAGEMENT (Mantido 100% compatível)
// ============================================================================

var GMDashContainers = [];
var GMDashConfig = [];
var GMDashContainerItems = [];
var GMDashContainerItemObjects = [];
var GMDashContainerItemObjectDetails = [];
var GMDashFilters = [];
var GMDashFontes = [];
var GMdashDeleteRecords = [];
var GMDashStamp = "";
var selectedObject = {};
var GSelectedElement = null;
var GSelectedType = "";
var GActiveTab = "general";
var GMDashReactiveInstance = null;
var GTemplateThumbCache = {};
var GMDashIsResizingItem = false;
var GExplicitDragState = {
    itemStamp: "",
    containerStamp: "",
    slot: null,
    validation: null
};

// ============================================================================
// CORE ENTITY CONSTRUCTORS (100% Mantidos da versão original)
// ============================================================================

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

function renderAllContainerItemTemplates() {
    window.appState.containerItems.forEach(function (item) {
        renderContainerItemTemplate(item);
    });
}

function renderContainerItemTemplate(item) {
    if (!item) return;
    var bodySelector = ".mdash-canvas-item[data-stamp='" + item.mdashcontaineritemstamp + "'] .mdash-canvas-item-body";
    var $body = $(bodySelector);
    if (!$body.length) return;

    var template = getTemplateLayoutOptions().find(function (t) { return t.codigo === item.templatelayout; });
    var html = "";

    if (template && typeof template.generateCard === "function") {
        // Usa o gerador do template, se existir
        html = template.generateCard({
            title: item.titulo || "Item",
            id: item.mdashcontaineritemstamp,
            tipo: (template.UIData && template.UIData.tipo) || "primary",
            bodyContent: "Pré-visualização"
        });
    } else if (template && template.sampleHtml) {
        html = template.sampleHtml;
    } else {
        // fallback simples
        html = '<div class="preview-card">'; 
        html += '  <div class="preview-card-header">' + (item.titulo || "Item sem título") + '</div>';
        html += '  <div class="preview-card-body text-muted">Selecione um layout</div>';
        html += '</div>';
    }

    $body.html(html);
}

function MdashConfig(data) {
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.temfiltro = data.temfiltro || false;
    this.categoria = data.categoria || "";
    this.filtrohorizont = data.filtrohorizont || false;
    this.u_mdashstamp = data.u_mdashstamp || "";
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
    this.localsource = "GMDashFilters";
    this.idfield = "mdashfilterstamp";
    this.table = "MdashFilter";
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
            classes: "form-control input-source-form input-sm",
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
    this.layoutmode = data.layoutmode || "auto"; // auto | explicit
    this.ordem = data.ordem || (maxOrdem + 1);
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.localsource = "GMDashContainers";
    this.idfield = "mdashcontainerstamp";
    this.table = "MdashContainer";
    this.inactivo = data.inactivo || false;
}

function MdashContainerItem(data) {
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
    this.layoutmode = data.layoutmode || "inherit"; // inherit | auto | explicit
    this.gridrow = data.gridrow !== undefined && data.gridrow !== null && data.gridrow !== "" ? parseInt(data.gridrow, 10) : null;
    this.gridcolstart = data.gridcolstart !== undefined && data.gridcolstart !== null && data.gridcolstart !== "" ? parseInt(data.gridcolstart, 10) : null;
    this.gridcolspan = data.gridcolspan !== undefined && data.gridcolspan !== null && data.gridcolspan !== "" ? parseInt(data.gridcolspan, 10) : this.tamanho;
    this.gridrowspan = data.gridrowspan !== undefined && data.gridrowspan !== null && data.gridrowspan !== "" ? parseInt(data.gridrowspan, 10) : 1;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.templatelayout = data.templatelayout || getDefaultTemplateCodigo();  // IMPORTANTE: template do layout
    this.layoutcontaineritemdefault = data.layoutcontaineritemdefault || true;
    this.expressaolayoutcontaineritem = data.expressaolayoutcontaineritem || "";
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.fontelocal = data.fontelocal || false;
    this.urlfetch = data.urlfetch || "../programs/gensel.aspx?cscript=getdbcontaineritemdata";
    this.expressaodblistagem = data.expressaodblistagem || "";
    this.expressaoapresentacaodados = data.expressaoapresentacaodados || "";
    this.filters = data.filters || [];
    this.records = data.records || [];
    this.dadosTemplate = data.dadosTemplate || {};
    this.localsource = "GMDashContainerItems";
    this.idfield = "mdashcontaineritemstamp";
    this.table = "MdashContainerItem";
}

// UI config do Container (herdado da versão original)
function getContainerUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 6, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "layoutmode", tipo: "select", titulo: "Modo de Layout (Container)", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: [{ option: "Auto", value: "auto" }, { option: "Explícito", value: "explicit" }] })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainers", idField: "mdashcontainerstamp" };
}

// UI config do ContainerItem (herdado da versão original)
function getContainerItemUIObjectFormConfigAndSourceValues() {
    // opções de layout para o select
    var templateOptions = getTemplateLayoutOptions().map(function (tpl) {
        return { option: tpl.descricao || tpl.codigo, value: tpl.codigo };
    });

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "ordem", tipo: "text", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "layoutmode", tipo: "select", titulo: "Modo de Layout (Override)", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: [{ option: "Herdar do Container", value: "inherit" }, { option: "Auto", value: "auto" }, { option: "Explícito", value: "explicit" }] }),
        new UIObjectFormConfig({ colSize: 4, campo: "gridrow", tipo: "digit", titulo: "Linha (gridrow)", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "gridcolstart", tipo: "digit", titulo: "Coluna Inicial", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "gridcolspan", tipo: "digit", titulo: "Largura (colSpan)", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "templatelayout", tipo: "select", titulo: "Layout", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: templateOptions }),
        new UIObjectFormConfig({ colSize: 4, campo: "layoutcontaineritemdefault", tipo: "checkbox", titulo: "Usa layout default para item do container", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolayoutcontaineritem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de layout do item do container", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "urlfetch", tipo: "text", titulo: "URL de Fetch", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaodblistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de DB Listagem", classes: "m-editor input-source-form", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaoapresentacaodados", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de apresentação de dados", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, campo: "fontelocal", tipo: "checkbox", titulo: "Fonte local", classes: "input-source-form", contentType: "input" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainerItems", idField: "mdashcontaineritemstamp" };
}

MdashContainerItem.prototype.renderLayout = function (container, cleanContainer) {
    var self = this;
    var listaTemplates = getTemplateLayoutOptions();
    var selectedTemplate = listaTemplates.find(function (template) {
        return template.codigo === self.templatelayout;
    });

    if (selectedTemplate) {
        self.dadosTemplate = selectedTemplate;
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
        return;
    }

    var self = this;
    var containerItemObjects = GMDashContainerItemObjects.filter(function (obj) {
        return obj.mdashcontaineritemstamp === self.mdashcontaineritemstamp;
    });

    containerItemObjects.forEach(function (itemObject) {
        var concatenatedMasterContent = ".container-item-object-render-" + itemObject.mdashcontaineritemobjectstamp + " " + dadosTemplate.containerSelectorToRender;
        $(concatenatedMasterContent).empty();
        itemObject.renderObjectByContainerItem(concatenatedMasterContent, self);
    });
}

function MdashContainerItemObject(data) {
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
    this.tipoquery = data.tipoquery || "item";
    this.objectexpressaodblistagem = data.objectexpressaodblistagem || "";
    this.localsource = "GMDashContainerItemObjects";

    var config = {};
    if (data.configjson) {
        try {
            config = JSON.parse(data.configjson);
        } catch (error) {
            console.error("Erro ao analisar configjson:", error);
        }
    }

    this.config = config || {};
    this.configjson = data.configjson || "";
    this.idfield = "mdashcontaineritemobjectstamp";
    this.table = "MdashContainerItemObject";
    this.objectoConfig = data.objectoConfig || {};

    var queryConfig = {
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
            console.error("Erro ao analisar queryconfigjson:", error);
        }
    }

    this.queryConfig = queryConfig;
    this.queryconfigjson = JSON.stringify(queryConfig);
}

MdashContainerItemObject.prototype.renderObjectByContainerItem = function (containerSelector, containerItem) {
    var self = this;
    var contentRecords = containerItem.records || [];

    if (Object.keys(self.objectoConfig).length > 0 && containerItem.records.length > 0) {
        self.objectoConfig.renderObject({
            containerSelector: containerSelector,
            itemObject: self,
            queryConfig: self.queryConfig,
            config: self.config,
            containerItem: containerItem,
            data: containerItem.records || [],
        });
    }

    if (self.expressaoobjecto) {
        try {
            eval(self.expressaoobjecto);
        } catch (error) {
            console.error("Erro ao executar expressão do objeto:", error);
        }
    }
}

function MDashFonte(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashFontes) && GMDashFontes.length > 0) {
        maxOrdem = GMDashFontes.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashfontestamp = data.mdashfontestamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "Fonte" + gerarIdNumerico();
    this.descricao = data.descricao || 'Nova Fonte ' + (data.ordem || (maxOrdem + 1));
    this.tipo = data.tipo || 'query';
    this.expressaolistagem = data.expressaolistagem || '';
    this.expressaojslistagem = data.expressaojslistagem || '';
    this.ordem = data.ordem || (maxOrdem + 1);
    this.schemajson = data.schemajson || '[]';
    this.lastResultscached = data.lastResultscached || '[]';
    this.schema = [];
    this.lastResults = [];

    this.lastResults = forceJSONParse(this.lastResultscached, []);
    this.schema = forceJSONParse(this.schemajson, []);
    this.testData = data.testData || [];
    this.lastExecuted = data.lastExecuted || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;

    this.localsource = "GMDashFontes";
    this.idfield = "mdashfontestamp";
    this.table = "MDashFonte";
}

MDashFonte.prototype.setTupDataOnLocalDb = function (data) {
    if (!Array.isArray(this.lastResults) || this.lastResults.length === 0) return;

    var tableSchema = extractLocalDbSchema(this.lastResults[0]);
    setTupDataOnLocalDb("MDashDB", this.codigo, tableSchema, this.lastResults, this.mdashfontestamp);
}

MDashFonte.prototype.stringifyJSONFields = function () {
    var data = this;
    data.schemajson = JSON.stringify(data.schema || []);
    data.lastResultscached = JSON.stringify(data.lastResults || []);
    return data;
}

// ============================================================================
// UTILITY FUNCTIONS (Mantidas)
// ============================================================================



function gerarIdNumerico() {
    var timestamp = Date.now().toString();
    var parteFinal = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    var id = (timestamp + parteFinal).slice(0, 10);
    return id;
}

function forceJSONParse(data, defaultValue) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return defaultValue;
        }
    }
    return data || defaultValue;
}

// ============================================================================
// DATA MANAGEMENT FUNCTIONS (Mantidas)
// ============================================================================

function buildMDashConfigData(options) {
    var includeHeader = options && options.includeHeader === true;

    var configData = [
        { sourceTable: "MdashContainer", sourceKey: "mdashcontainerstamp", records: GMDashContainers },
        { sourceTable: "MdashContainerItem", sourceKey: "mdashcontaineritemstamp", records: GMDashContainerItems },
        { sourceTable: "MdashFilter", sourceKey: "mdashfilterstamp", records: GMDashFilters },
        { sourceTable: "MdashContainerItemObject", sourceKey: "mdashcontaineritemobjectstamp", records: GMDashContainerItemObjects },
        { sourceTable: "MDashFonte", sourceKey: "mdashfontestamp", records: GMDashFontes }
    ];

    configData.unshift({
        sourceTable: "u_mdash",
        sourceKey: "u_mdashstamp",
        records: GMDashConfig
    });

    return configData;
}

function exportarConfiguracaoMDashboard() {
    try {
        var configData = buildMDashConfigData({ includeHeader: true });
        var payload = {
            relatoriostamp: GMDashStamp || "",
            config: configData,
            generatedAt: new Date().toISOString()
        };
        var fileContents = JSON.stringify(payload, null, 2);
        var blob = new Blob([fileContents], { type: "application/json;charset=utf-8" });
        var downloadUrl = URL.createObjectURL(blob);
        var link = document.createElement("a");
        var timestamp = new Date().toISOString().replace(/[:.-]/g, "");

        var mdashConfig = GMDashConfig[0] || {};
        var fileName = "dashboard-" + mdashConfig.descricao + timestamp + ".json";

        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
        }, 1000);
    } catch (error) {
        console.error("Erro ao exportar configuracao do MDashboard", error);
        if (typeof alertify !== "undefined") {
            alertify.error("Erro ao exportar configuracao", 9000);
        }
    }
}

function actualizarConfiguracaoMDashboard() {
    var configData = [
        { sourceTable: "MdashContainer", sourceKey: "mdashcontainerstamp", records: GMDashContainers },
        { sourceTable: "MdashContainerItem", sourceKey: "mdashcontaineritemstamp", records: GMDashContainerItems },
        { sourceTable: "MdashFilter", sourceKey: "mdashfilterstamp", records: GMDashFilters },
        { sourceTable: "MdashContainerItemObject", sourceKey: "mdashcontaineritemobjectstamp", records: GMDashContainerItemObjects },
        { sourceTable: "MDashFonte", sourceKey: "mdashfontestamp", records: GMDashFontes }
    ];

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GMDashStamp, config: configData, recordsToDelete: GMdashDeleteRecords }]),
        },
        success: function (response) {
            try {
                console.log(response);
                if (response.cod != "0000") {
                    console.log("Erro ao actualizar", response);
                    alertify.error("Erro ao actualizar configuração", 9000);
                    return false;
                }
                alertify.success("Dados actualizados com sucesso", 9000);
                window.location.reload();
            } catch (error) {
                console.log("Erro interno ao actualizar", response, error);
            }
        }
    });
}

function realTimeComponentSync(recordData, table, idfield) {

    //console.log("Sincronização em tempo real do componente:", { table: table, idfield: idfield, recordData: recordData });
    var errorMessage = "ao actualizar componente em tempo real. Verifique a conexão com a internet.";
    try {
        var configData = [];

        if (recordData) {
            configData = [{
                sourceTable: table,
                sourceKey: idfield,
                records: [recordData]
            }];
        }

        $.ajax({
            type: "POST",
            url: "../programs/gensel.aspx?cscript=realtimecomponentsync",
            async: false,
            data: {
                '__EVENTARGUMENT': JSON.stringify([{ config: configData, recordsToDelete: GMdashDeleteRecords }]),
            },
            success: function (response) {
                try {
                    console.log(response);
                    if (response.cod != "0000") {
                        console.log("Erro " + errorMessage, response);
                        alertify.error("Erro " + errorMessage, 4000);
                        return false;
                    }
                } catch (error) {
                    alertify.error("Erro interno " + errorMessage, 10000);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Erro " + errorMessage, xhr, thrownError);
                alertify.error("Erro " + errorMessage, 4000);
            }
        });
    } catch (error) {
        console.log("Erro interno " + errorMessage, error);
    }
}

// ============================================================================
// MDASH 2.0 - MODERN UI
// ============================================================================

/**
 * NOTA IMPORTANTE:
 * Esta é a versão REFATORADA que agora entende corretamente a hierarquia:
 * 
 * 1. Container (MdashContainer) - Representa uma "row" no layout
 * 2. ContainerItem (MdashContainerItem) - Representa um "card/item" dentro do container
 *    - Tem um template/layout (templatelayout) que define o visual
 * 3. ContainerItemObject (MdashContainerItemObject) - Objetos visuais dentro do item
 *    - Gráficos, tabelas, métricas, etc.
 * 
 * O fluxo correto é:
 * - Adicionar Container
 * - Adicionar ContainerItem ao Container (escolher template)
 * - Adicionar ContainerItemObjects ao ContainerItem (objetos visuais)
 */

function initConfiguracaoDashboard(config) {
    console.log("Inicializando MDash 2.0 REFATORADO com configuração:", config);
    GMDashStamp = config.u_mdashstamp;

    // Cria o container principal no DOM (fallback para body se #campos não existir)
    var mainContainerHtml = "<div id='m-dash-main-container' class='m-dash-main-container'></div>";
    var anchor = $("#campos > .row:last");
    if (anchor.length > 0) {
        anchor.after(mainContainerHtml);
    } else {
        $('body').append(mainContainerHtml);
    }

    // Carrega os dados existentes via AJAX
    loadDashboardDataFromServer(config);

    // Cria a interface moderna
    createModernDashboardUI();

    // Carrega estilos
    loadModernStyles();
}

/**
 * Carrega os dados do dashboard do servidor
 */
function loadDashboardDataFromServer(config) {
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

                // Popula as arrays globais com os dados do servidor
                //console.log("Dados recebidos do servidor:", response.data);
                if (response.data ) {
                    var dashboardData = response.data

                    // Dashboard config
                    if (dashboardData.dashboard) {
                        GMDashConfig = [new MdashConfig(dashboardData.dashboard)];
                    }

                    // Containers
                    if (dashboardData.containers) {
                        GMDashContainers = dashboardData.containers.map(function (c) {
                            return new MdashContainer(c);
                        });
                    }

                    // Container Items
                    if (dashboardData.containerItems) {
                        GMDashContainerItems = dashboardData.containerItems.map(function (item) {
                            return new MdashContainerItem(item);
                        });
                    }

                    // Container Item Objects
                    if (dashboardData.containerItemObjects) {
                        GMDashContainerItemObjects = dashboardData.containerItemObjects.map(function (obj) {
                            return new MdashContainerItemObject(obj);
                        });
                    }

                    // Filters
                    if (dashboardData.filters) {
                        GMDashFilters = dashboardData.filters.map(function (f) {
                            return new MdashFilter(f);
                        });
                    }

                    // Fontes
                    if (dashboardData.fontes) {
                        GMDashFontes = dashboardData.fontes.map(function (fonte) {
                            return new MDashFonte(fonte);
                        });
                    }
                }

                console.log("Dados carregados:", {
                    containers: GMDashContainers.length,
                    items: GMDashContainerItems.length,
                    objects: GMDashContainerItemObjects.length,
                    filters: GMDashFilters.length,
                    fontes: GMDashFontes.length,
                    codigoDash:config.codigo
                });

            } catch (error) {
                console.log("Erro interno " + errorMessage, error);
            }
        }
    });
}

function getTemplateLayoutOptions() {
    // Usa os layouts reais definidos em TEMPLATE DASHBOARD STANDARD EXTENSION.js quando disponível.
    if (typeof generateDashCardInfo === "function") {
        return [
            { descricao: "Snapshot Layout v1", codigo: "snapshot_layout_v1", tipo: "snapshot", generateCard: generateDashCardInfo, UIData: { tipo: "primary" }, containerSelectorToRender: ".m-dash-card-body-content" },
            { descricao: "Snapshot Layout v1 Warning", codigo: "snapshot_layout_v1_warning", tipo: "snapshot", UIData: { tipo: "warning" }, generateCard: generateDashCardInfo, containerSelectorToRender: ".m-dash-card-body-content" },
            { descricao: "Snapshot layout v2", codigo: "snapshot_layout_v2", tipo: "snapshot", UIData: { tipo: "primary" }, generateCard: generateDashCardSnapshot, containerSelectorToRender: ".stats-card-body" },
            { descricao: "Snap card Warning", codigo: "snapshot_card_warning", tipo: "snapshot", UIData: { tipo: "warning" }, generateCard: generateMDashCardSnapV2, containerSelectorToRender: ".m-dash-card-snap-v2-value" },
            { descricao: "Snap Card", codigo: "snap_card", tipo: "snapshot", UIData: { tipo: "primary" }, generateCard: generateMDashCardSnapV2, containerSelectorToRender: ".m-dash-card-snap-v2-value" },
            { descricao: "Snap Card Success", codigo: "snap_card_success", tipo: "snapshot", UIData: { tipo: "success" }, generateCard: generateMDashCardSnapV2, containerSelectorToRender: ".m-dash-card-snap-v2-value" },
            { descricao: "Snap card Danger", codigo: "snapshot_card_danger", tipo: "snapshot", UIData: { tipo: "danger" }, generateCard: generateMDashCardSnapV2, containerSelectorToRender: ".m-dash-card-snap-v2-value" },
            { descricao: "Card standard", codigo: "card_standard", tipo: "card", UIData: { tipo: "primary" }, generateCard: generateDashCardStandard, containerSelectorToRender: ".m-dash-standard-card-body" },
            { descricao: "Card header destacado", codigo: "card_header_highlighted", tipo: "card", UIData: { tipo: "primary" }, generateCard: generateDashCardHTML, containerSelectorToRender: ".dashcard-body" },
            { descricao: "Plain Card", codigo: "plain_card", tipo: "card", UIData: { tipo: "primary" }, generateCard: generatePlainCard, containerSelectorToRender: ".m-dash-plain-card-body-content" },
            { descricao: "Top Border Card Advanced - Metric Primary", codigo: "brd_card_advanced_metric_primary", tipo: "card", UIData: { tipo: "primary" }, generateCard: generateBrdCardAdvancedMetric, containerSelectorToRender: ".brd-card-advanced-content" },
            { descricao: "Top Border Card Advanced - Metric Success", codigo: "brd_card_advanced_metric_success", tipo: "card", UIData: { tipo: "success" }, generateCard: generateBrdCardAdvancedMetric, containerSelectorToRender: ".brd-card-advanced-content" },
            { descricao: "Top Border Card Advanced - Metric Warning", codigo: "brd_card_advanced_metric_warning", tipo: "card", UIData: { tipo: "warning" }, generateCard: generateBrdCardAdvancedMetric, containerSelectorToRender: ".brd-card-advanced-content" },
            { descricao: "Top Border Card Advanced - Metric Danger", codigo: "brd_card_advanced_metric_danger", tipo: "card", UIData: { tipo: "danger" }, generateCard: generateBrdCardAdvancedMetric, containerSelectorToRender: ".brd-card-advanced-content" },
            { descricao: "Top Border Card Advanced - Status Primary", codigo: "brd_card_advanced_status_primary", tipo: "card", UIData: { tipo: "primary" }, generateCard: generateBrdCardAdvancedStatus, containerSelectorToRender: ".brd-card-advanced-status-body" },
            { descricao: "Top Border Card Advanced - Status Success", codigo: "brd_card_advanced_status_success", tipo: "card", UIData: { tipo: "success" }, generateCard: generateBrdCardAdvancedStatus, containerSelectorToRender: ".brd-card-advanced-status-body" },
            { descricao: "Top Border Card Advanced - Status Warning", codigo: "brd_card_advanced_status_warning", tipo: "card", UIData: { tipo: "warning" }, generateCard: generateBrdCardAdvancedStatus, containerSelectorToRender: ".brd-card-advanced-status-body" },
            { descricao: "Top Border Card Advanced - Status Danger", codigo: "brd_card_advanced_status_danger", tipo: "card", UIData: { tipo: "danger" }, generateCard: generateBrdCardAdvancedStatus, containerSelectorToRender: ".brd-card-advanced-status-body" },
            { descricao: "Top Border Card Advanced - Alert Primary", codigo: "brd_card_advanced_alert_primary", tipo: "card", UIData: { tipo: "primary" }, generateCard: generateBrdCardAdvancedAlert, containerSelectorToRender: ".brd-card-advanced-alert-content" },
            { descricao: "Top Border Card Advanced - Alert Success", codigo: "brd_card_advanced_alert_success", tipo: "card", UIData: { tipo: "success" }, generateCard: generateBrdCardAdvancedAlert, containerSelectorToRender: ".brd-card-advanced-alert-content" },
            { descricao: "Top Border Card Advanced - Alert Warning", codigo: "brd_card_advanced_alert_warning", tipo: "card", UIData: { tipo: "warning" }, generateCard: generateBrdCardAdvancedAlert, containerSelectorToRender: ".brd-card-advanced-alert-content" },
            { descricao: "Top Border Card Advanced - Alert Danger", codigo: "brd_card_advanced_alert_danger", tipo: "card", UIData: { tipo: "danger" }, generateCard: generateBrdCardAdvancedAlert, containerSelectorToRender: ".brd-card-advanced-alert-content" }
        ];
    }

    // Fallback mínimo para ambientes onde o ficheiro de templates não esteja carregado.
    return [
        { codigo: "template_kpi", descricao: "KPI Card", sampleHtml: '<div class="preview-card kpi"><div class="kpi-label">Vendas</div><div class="kpi-value">123.4K</div><div class="kpi-trend up">+4.6%</div></div>' },
        { codigo: "template_table", descricao: "Tabela simples", sampleHtml: '<div class="preview-card table"><table class="table table-condensed"><thead><tr><th>Col 1</th><th>Col 2</th></tr></thead><tbody><tr><td>Valor</td><td>42</td></tr><tr><td>Valor</td><td>58</td></tr></tbody></table></div>' },
        { codigo: "template_chart", descricao: "Gráfico (placeholder)", sampleHtml: '<div class="preview-card chart"><div class="chart-placeholder">Gráfico aqui</div></div>' }
    ];
}

function getDefaultTemplateCodigo() {
    var templates = getTemplateLayoutOptions();
    return (templates[0] && templates[0].codigo) || "";
}

function getTemplateLayoutByCode(templateCode) {
    return getTemplateLayoutOptions().find(function (tpl) {
        return tpl.codigo === templateCode;
    }) || null;
}

function getTemplateThumbnailHtml(templateCode) {
    if (!templateCode) return "";
    if (GTemplateThumbCache[templateCode]) return GTemplateThumbCache[templateCode];

    var template = getTemplateLayoutByCode(templateCode);
    if (!template) {
        GTemplateThumbCache[templateCode] = '<div class="mdash-template-thumb-empty">?</div>';
        return GTemplateThumbCache[templateCode];
    }

    var thumbHtml = "";
    if (typeof template.generateCard === "function") {
        try {
            thumbHtml = template.generateCard({
                title: "Preview",
                id: "thumb-" + template.codigo,
                tipo: (template.UIData && template.UIData.tipo) || "primary",
                bodyContent: "Demo"
            });
        } catch (error) {
            thumbHtml = "";
        }
    }

    if (!thumbHtml && template.sampleHtml) {
        thumbHtml = template.sampleHtml;
    }

    if (!thumbHtml) {
        var firstLetter = (template.descricao || template.codigo || "?").charAt(0).toUpperCase();
        thumbHtml = '<div class="mdash-template-thumb-empty">' + firstLetter + '</div>';
    }

    GTemplateThumbCache[templateCode] = '<div class="mdash-template-thumb-render">' + thumbHtml + '</div>';
    return GTemplateThumbCache[templateCode];
}

// TODO: Implementar o resto das funções da UI moderna
// mas agora respeitando TODA a estrutura:
// - Lista de Containers
// - Dentro de cada Container, lista de ContainerItems
// - Dentro de cada ContainerItem, lista de ContainerItemObjects
// - Gestão de Filtros
// - Gestão de Fontes

function createModernDashboardUI() {
    // Inicializa a interface completa com sidebar + canvas
    initModernDashboardUI();
    // Renderiza pré-visualizações iniciais dos itens
    setTimeout(renderAllContainerItemTemplates, 0);
}

function loadModernStyles() {
    // Carrega todos os estilos
    loadModernDashboardStyles();
}

// ============================================================================
// MÓDULO PRINCIPAL - UI MODERNA COM SIDEBAR
// ============================================================================

/**
 * Inicializa a interface completa do MDash 2.0
 */
function initModernDashboardUI() {
    console.log("Inicializando MDash 2.0 UI Completa");
    console.info("MDash REFACTOR build: 2026.04.01");

    var mainHtml = '<div class="mdash-editor-wrapper">';
    mainHtml += '<div class="mdash-top-toolbar">';
    mainHtml += '  <div class="mdash-top-toolbar-brand"><i class="glyphicon glyphicon-th"></i> MDash 2.0</div>';
    mainHtml += '  <div class="mdash-top-toolbar-actions">';
    mainHtml += '    <button type="button" onclick="actualizarConfiguracaoMDashboard()" class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-floppy-disk"></i> Guardar</button>';
    mainHtml += '    <button type="button" onclick="exportarConfiguracaoMDashboard()" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-download-alt"></i> Exportar</button>';
    mainHtml += '  </div>';
    mainHtml += '</div>';
    mainHtml += '<div class="mdash-modern-layout" v-scope @vue:mounted="onMounted">';

    // Sidebar (listas + toolbox contextual)
    mainHtml += '  <div class="mdash-sidebar" :class="{\'is-collapsed\': isSidebarCollapsed}">';
    mainHtml += '    <div class="mdash-sidebar-header">';
    mainHtml += '      <h4><i class="glyphicon glyphicon-th"></i> Componentes</h4>';
    mainHtml += '      <button type="button" class="btn btn-default btn-xs mdash-panel-toggle mdash-sidebar-toggle" @click.stop="toggleSidebar" :title="isSidebarCollapsed ? \'Expandir componentes\' : \'Colapsar componentes\'"><i :class="isSidebarCollapsed ? \'glyphicon glyphicon-chevron-right\' : \'glyphicon glyphicon-chevron-left\'"></i></button>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-sidebar-rail-actions">';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm toolbox-container mdash-toolbox-item" data-component="container" @click="addNewContainer" title="Container (clique ou arraste para o canvas)"><i class="glyphicon glyphicon-th-large"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm toolbox-container-item mdash-toolbox-item" data-component="containerItem" @click="quickAddItemFromRail" title="Item (clique ou arraste para um container)"><i class="glyphicon glyphicon-list-alt"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="openFiltersManagerModal" title="Gerir filtros"><i class="glyphicon glyphicon-filter"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="addNewFonte" title="Nova Fonte"><i class="glyphicon glyphicon-oil"></i></button>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-sidebar-body">';
    mainHtml += '      <div class="mdash-widget-section">';
    mainHtml += '        <p class="mdash-section-label">Adicionar</p>';
    mainHtml += '        <div class="mdash-widget-grid">';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container mdash-toolbox-item" data-component="container" @click="addNewContainer" title="Clique para adicionar ou arraste para o canvas">';
    mainHtml += '            <i class="glyphicon glyphicon-th-large"></i><span>Container</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container-item mdash-toolbox-item" data-component="containerItem" title="Arraste para um Container">';
    mainHtml += '            <i class="glyphicon glyphicon-list-alt"></i><span>Item</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFilter" title="Adicionar Filtro">';
    mainHtml += '            <i class="glyphicon glyphicon-filter"></i><span>Filtro</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFonte" title="Adicionar Fonte">';
    mainHtml += '            <i class="glyphicon glyphicon-oil"></i><span>Fonte</span>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div class="mdash-sidebar-divider"></div>';

    // Accordion com os componentes (mantém filtros, listas)
    mainHtml += '      <div class="panel-group" id="mdash-accordion">';

    // Filtros
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-filters">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-filter"></i> Filtros';
    mainHtml += '              <span class="badge pull-right">{{ filters.length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-filters" class="panel-collapse collapse in">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addNewFilter" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Filtro';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="filters.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum filtro</small></p>';
    mainHtml += '                <div v-for="(filter, index) in filters" :key="filter.mdashfilterstamp" class="mdash-sidebar-item" :data-stamp="filter.mdashfilterstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editFilter(filter.mdashfilterstamp)">';
    mainHtml += '                    <i :class="getFilterTypeIcon(filter.tipo)"></i>';
    mainHtml += '                    <span>{{ filter.descricao || filter.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="deleteFilter(filter.mdashfilterstamp)" class="btn btn-xs btn-danger">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Containers
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-containers">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-th-large"></i> Containers';
    mainHtml += '              <span class="badge pull-right">{{ containers.length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-containers" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="containers.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum container</small></p>';
    mainHtml += '                <div v-for="(container, index) in $computed.sortedContainers()" :key="container.mdashcontainerstamp" class="mdash-sidebar-item mdash-sidebar-container" :data-stamp="container.mdashcontainerstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="selectContainer(container.mdashcontainerstamp)">';
    mainHtml += '                    <i class="glyphicon glyphicon-th-large"></i>';
    mainHtml += '                    <span>{{ container.titulo || container.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                    <span v-if="getContainerItemsCount(container.mdashcontainerstamp) > 0" class="badge badge-info">{{ getContainerItemsCount(container.mdashcontainerstamp) }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="deleteContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-danger">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Fontes de Dados
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-fontes">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-oil"></i> Fontes de Dados';
    mainHtml += '              <span class="badge pull-right">{{ fontes.length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-fontes" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addNewFonte" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Fonte';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="fontes.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhuma fonte</small></p>';
    mainHtml += '                <div v-for="(fonte, index) in fontes" :key="fonte.mdashfontestamp" class="mdash-sidebar-item" :data-stamp="fonte.mdashfontestamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editFonte(fonte.mdashfontestamp)">';
    mainHtml += '                    <i class="glyphicon glyphicon-oil"></i>';
    mainHtml += '                    <span>{{ fonte.descricao || fonte.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="deleteFonte(fonte.mdashfontestamp)" class="btn btn-xs btn-danger">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    mainHtml += '      </div>'; // fim accordion
    mainHtml += '    </div>'; // fim sidebar-body
    mainHtml += '  </div>'; // fim sidebar

    // Canvas (Área de trabalho)
    mainHtml += '  <div class="mdash-canvas">';
    mainHtml += '    <div class="mdash-canvas-body" id="mdash-canvas-body">';
    mainHtml += '      <div class="mdash-canvas-commandbar">';
    mainHtml += '        <div class="mdash-commandbar-title"><i class="glyphicon glyphicon-modal-window"></i> Dashboard Builder</div>';
    mainHtml += '        <div class="mdash-commandbar-actions">';
    mainHtml += '          <button type="button"  class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-eye-open"></i> Pré visualizar</button>';
   /* mainHtml += '          <button type="button" @click="addNewFilter" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-filter"></i> Novo Filtro</button>';
    mainHtml += '          <button type="button" @click="addNewFonte" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-oil"></i> Nova Fonte</button>';*/
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-if="containers.length === 0" class="mdash-canvas-empty mdash-drop-target">';
    mainHtml += '        <i class="glyphicon glyphicon-info-sign"></i>';
    mainHtml += '        <p>Arraste um Container para começar a construir seu dashboard.</p>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-for="(container, index) in $computed.sortedContainers()" :key="container.mdashcontainerstamp" class="mdash-canvas-container" :data-stamp="container.mdashcontainerstamp" @click.stop="selectContainer(container.mdashcontainerstamp)" :class="{\'is-selected\': selectedComponent.stamp === container.mdashcontainerstamp}">';
    mainHtml += '        <div class="mdash-container-label">Container {{ index + 1 }}</div>';
    mainHtml += '        <div class="mdash-canvas-container-header">';
    mainHtml += '          <div class="mdash-container-drag-handle" title="Arraste para mover o container"><i class="glyphicon glyphicon-move"></i></div>';
    mainHtml += '          <input type="text" class="mdash-inline-title" :value="container.titulo" @change.stop="updateContainerTitle(container, $event)" @click.stop placeholder="Container sem título" />';
    mainHtml += '          <div class="mdash-canvas-container-actions">';
    mainHtml += '            <button type="button" @click.stop="editContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-default" title="Configurar"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '            <button type="button" @click.stop="deleteContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-danger" title="Eliminar"><i class="glyphicon glyphicon-trash"></i></button>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '        <div class="mdash-canvas-container-body mdash-drop-target mdash-container-items" :data-container="container.mdashcontainerstamp">';
    mainHtml += '          <div class="mdash-container-items-row" :class="{\'is-empty\': getContainerItems(container.mdashcontainerstamp).length === 0}">';
    mainHtml += '            <div v-if="getContainerItems(container.mdashcontainerstamp).length === 0" class="mdash-canvas-empty-items">';
    mainHtml += '              <small class="text-muted">Arraste um Container Item para este container</small>';
    mainHtml += '            </div>';
    mainHtml += '            <div v-for="item in getContainerItems(container.mdashcontainerstamp)" :key="item.mdashcontaineritemstamp" class="mdash-canvas-item" :class="{\'is-selected\': selectedComponent.stamp === item.mdashcontaineritemstamp}" :data-stamp="item.mdashcontaineritemstamp" @click.stop="selectContainerItem(item.mdashcontaineritemstamp)" :style=\"getItemFlex(item)\">';
    mainHtml += '              <div class="mdash-canvas-item-card">';
    mainHtml += '                <div class="mdash-item-resize-handle mdash-item-resize-handle-left" title="Redimensionar (2-12 colunas; ALT para 1)"></div>';
    mainHtml += '                <div class="mdash-item-resize-handle mdash-item-resize-handle-right" title="Redimensionar (2-12 colunas; ALT para 1)"></div>';
    mainHtml += '                <div class="mdash-canvas-item-header">';
    mainHtml += '                  <div class="mdash-item-header-top">';
    mainHtml += '                    <input type="text" class="mdash-inline-title mdash-inline-title-sm" :value="item.titulo" @change.stop="updateItemTitle(item, $event)" @click.stop placeholder="Item sem título" />';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-item-header-bottom">';
    mainHtml += '                    <div class="mdash-inline-layout-picker" @click.stop>';
    mainHtml += '                      <button type="button" class="mdash-inline-layout-trigger" @click.stop="toggleTemplatePicker(item.mdashcontaineritemstamp)" title="Alterar layout">';
    mainHtml += '                        <span class="mdash-inline-layout-thumb" v-html="getTemplateThumbHtml(item.templatelayout)"></span>';
    mainHtml += '                        <span class="mdash-inline-layout-name">{{ getTemplateLabel(item.templatelayout) }}</span>';
    mainHtml += '                        <i class="glyphicon glyphicon-chevron-down"></i>';
    mainHtml += '                      </button>';
    mainHtml += '                      <div v-if="openTemplatePickerFor === item.mdashcontaineritemstamp" class="mdash-inline-layout-menu">';
    mainHtml += '                        <button type="button" class="mdash-inline-layout-option" v-for="tpl in getTemplateLayouts()" :key="tpl.codigo" @click.stop="selectItemLayout(item, tpl.codigo)">';
    mainHtml += '                          <span class="mdash-inline-layout-thumb" v-html="getTemplateThumbHtml(tpl.codigo)"></span>';
    mainHtml += '                          <span class="mdash-inline-layout-name">{{ tpl.descricao }}</span>';
    mainHtml += '                        </button>';
    mainHtml += '                      </div>';
    mainHtml += '                    </div>';
    mainHtml += '                    <div class="mdash-item-header-actions">';
    mainHtml += '                    <button type="button" @click.stop="editContainerItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-default" title="Configurar"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '                    <button type="button" @click.stop="deleteContainerItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-danger" title="Eliminar"><i class="glyphicon glyphicon-trash"></i></button>';
    mainHtml += '                  </div>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '                <div class="mdash-canvas-item-body">';
    mainHtml += '                  <small v-if="getItemObjects(item.mdashcontaineritemstamp).length === 0" class="text-muted">Nenhum objeto</small>';
    mainHtml += '                  <div v-else class="mdash-canvas-objects-list">';
    mainHtml += '                    <div v-for="obj in getItemObjects(item.mdashcontaineritemstamp)" :key="obj.mdashcontaineritemobjectstamp" @click="editContainerItemObject(obj.mdashcontaineritemobjectstamp)" class="mdash-canvas-object-badge">';
    mainHtml += '                      <i :class="getObjectTypeIcon(obj.tipo)"></i> {{ obj.tipo || \'Objeto\' }}';
    mainHtml += '                    </div>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div style="margin-top:5px;">';
    mainHtml += '                    <button type="button" @click.stop="addContainerItemObject(item.mdashcontaineritemstamp)" class="btn btn-xs btn-link" style="padding:2px 0;" title="Adicionar Objeto">';
    mainHtml += '                      <i class="glyphicon glyphicon-plus"></i> Add Objeto';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '          <div style="margin-top:6px;text-align:right;">';
    mainHtml += '            <button type="button" @click.stop="addContainerItem(container.mdashcontainerstamp)" class="btn btn-xs btn-primary">';
    mainHtml += '              <i class="glyphicon glyphicon-plus"></i> Add Item';
    mainHtml += '            </button>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '    </div>';
    mainHtml += '  </div>';

    // Coluna de propriedades
    mainHtml += '  <div class="mdash-properties" :class="{\'is-collapsed\': isPropertiesCollapsed}">';
    mainHtml += '    <div class="mdash-properties-header"><span><i class="glyphicon glyphicon-wrench"></i> Propriedades</span><button type="button" class="btn btn-default btn-xs mdash-panel-toggle mdash-properties-toggle" @click.stop="toggleProperties" :title="isPropertiesCollapsed ? \'Expandir propriedades\' : \'Colapsar propriedades\'"><i :class="isPropertiesCollapsed ? \'glyphicon glyphicon-chevron-left\' : \'glyphicon glyphicon-chevron-right\'"></i></button></div>';
    mainHtml += '    <div class="mdash-properties-rail-actions">';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="editSelectedComponent" title="Editar selecionado"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="addChildForSelected" title="Adicionar ao selecionado"><i class="glyphicon glyphicon-plus"></i></button>';
    mainHtml += '    </div>';
    mainHtml += '    <div id="mdash-properties-panel">';
    mainHtml += '      <p class="text-muted" style="margin:0;">Selecione um Container ou Item.</p>';
    mainHtml += '    </div>';
    mainHtml += '  </div>';

    mainHtml += '</div>'; // fim mdash-modern-layout
    mainHtml += '</div>'; // fim mdash-editor-wrapper

    // Injeta no DOM
    $('#m-dash-main-container').html(mainHtml);

    // Carrega estilos
    loadModernDashboardStyles();

    // Cria estado reativo global centralizado usando PetiteVue.reactive
    window.appState = PetiteVue.reactive({
        filters: GMDashFilters,
        containers: GMDashContainers,
        containerItems: GMDashContainerItems,
        containerItemObjects: GMDashContainerItemObjects,
        fontes: GMDashFontes
    });

    // Inicializa PetiteVue com reatividade (sem getters)
    GMDashReactiveInstance = PetiteVue.createApp({
        // Acessa o estado reativo global diretamente
        filters: window.appState.filters,
        containers: window.appState.containers,
        containerItems: window.appState.containerItems,
        containerItemObjects: window.appState.containerItemObjects,
        fontes: window.appState.fontes,
        selectedComponent: { type: "", stamp: "", data: null },
        isSidebarCollapsed: false,
        isPropertiesCollapsed: false,
        openTemplatePickerFor: "",
        $computed: {
            sortedFilters: function() {
                return window.appState.filters.slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            sortedContainers: function() {
                return window.appState.containers.slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            }
        },

        getFilterTypeIcon: function (tipo) {
            return getFilterTypeIcon(tipo);
        },

        getObjectTypeIcon: function (tipo) {
            return getObjectTypeIcon(tipo);
        },

        getContainerItemsCount: function (containerStamp) {
            return window.appState.containerItems.filter(function (item) {
                return item.mdashcontainerstamp === containerStamp;
            }).length;
        },

        getContainerItems: function (containerStamp) {
            return window.appState.containerItems
                .filter(function (item) {
                    return item.mdashcontainerstamp === containerStamp; // mostrar mesmo inactivos para edição
                })
                .sort(function (a, b) {
                    var aExplicit = isExplicitLayoutItem(a);
                    var bExplicit = isExplicitLayoutItem(b);
                    if (aExplicit || bExplicit) {
                        var rowDiff = (a.gridrow || 0) - (b.gridrow || 0);
                        if (rowDiff !== 0) return rowDiff;
                        var colDiff = (a.gridcolstart || 0) - (b.gridcolstart || 0);
                        if (colDiff !== 0) return colDiff;
                    }
                    return (a.ordem || 0) - (b.ordem || 0);
                });
        },

        getItemObjects: function (itemStamp) {
            return window.appState.containerItemObjects.filter(function (obj) {
                return obj.mdashcontaineritemstamp === itemStamp;
            });
        },

        getItemFlex: function (item) {
            return getItemGridStyleString(item);
        },

        getTemplateLayouts: function () {
            return getTemplateLayoutOptions();
        },

        getTemplateLabel: function (templateCode) {
            var template = getTemplateLayoutByCode(templateCode);
            return (template && (template.descricao || template.codigo)) || "Selecionar layout";
        },

        getTemplateThumbHtml: function (templateCode) {
            return getTemplateThumbnailHtml(templateCode);
        },

        toggleTemplatePicker: function (itemStamp) {
            this.openTemplatePickerFor = this.openTemplatePickerFor === itemStamp ? "" : itemStamp;
        },

        toggleSidebar: function () {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
            setTimeout(initDragAndDrop, 0);
        },

        toggleProperties: function () {
            this.isPropertiesCollapsed = !this.isPropertiesCollapsed;
        },

        selectItemLayout: function (item, templateCode) {
            this.openTemplatePickerFor = "";
            if (!templateCode || item.templatelayout === templateCode) return;
            item.templatelayout = templateCode;
            renderContainerItemTemplate(item);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        },

        // Ações (delegam para as funções globais)
        addNewFilter: function () {
            addNewFilter();
        },

        editFilter: function (stamp) {
            editFilter(stamp);
        },

        deleteFilter: function (stamp) {
            deleteFilter(stamp);
        },

        openFiltersManagerModal: function () {
            openFiltersManagerModal();
        },

        addNewContainer: function () {
            addNewContainer();
        },

        editContainer: function (stamp) {
            editContainer(stamp);
        },

        deleteContainer: function (stamp) {
            deleteContainer(stamp);
        },

        moveContainer: function (stamp, direction) {
            moveContainer(stamp, direction);
        },

        addContainerItem: function (containerStamp) {
            addContainerItem(containerStamp);
        },

        editContainerItem: function (stamp) {
            editContainerItem(stamp);
        },

        editContainerItemObject: function (stamp) {
            editContainerItemObject(stamp);
        },

        addContainerItemObject: function (itemStamp) {
            addContainerItemObject(itemStamp);
        },

        addNewFonte: function () {
            addNewFonte();
        },

        editFonte: function (stamp) {
            editFonte(stamp);
        },

        deleteFonte: function (stamp) {
            deleteFonte(stamp);
        },

        quickAddItemFromRail: function () {
            var selected = this.selectedComponent || {};
            if (selected.type === "container" && selected.stamp) {
                addContainerItem(selected.stamp);
                return;
            }
            if (this.containers.length > 0) {
                addContainerItem(this.containers[0].mdashcontainerstamp);
                return;
            }
            addNewContainer();
        },

        editSelectedComponent: function () {
            var selected = this.selectedComponent || {};
            if (!selected.stamp) return;
            if (selected.type === "container") {
                editContainer(selected.stamp);
                return;
            }
            if (selected.type === "containerItem") {
                editContainerItem(selected.stamp);
            }
        },

        addChildForSelected: function () {
            var selected = this.selectedComponent || {};
            if (selected.type === "container" && selected.stamp) {
                addContainerItem(selected.stamp);
                return;
            }
            if (selected.type === "containerItem" && selected.stamp) {
                addContainerItemObject(selected.stamp);
                return;
            }
            this.quickAddItemFromRail();
        },

        selectContainer: function (stamp) {
            this.openTemplatePickerFor = "";
            var container = window.appState.containers.find(function (c) { return c.mdashcontainerstamp === stamp; });
            if (!container) return;
            this.selectedComponent = { type: "container", stamp: stamp, data: container };
            handleComponentProperties(this.selectedComponent);
        },

        selectContainerItem: function (stamp) {
            this.openTemplatePickerFor = "";
            var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
            if (!item) return;
            this.selectedComponent = { type: "containerItem", stamp: stamp, data: item };
            handleComponentProperties(this.selectedComponent);
        },

        updateContainerTitle: function (container, event) {
            container.titulo = event.target.value.trim();
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(container, container.table, container.idfield);
            }
        },

        updateItemTitle: function (item, event) {
            item.titulo = event.target.value.trim();
            renderContainerItemTemplate(item);
            setTimeout(syncAllContainerItemsLayout, 0);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        },

        deleteContainerItem: function (stamp) {
            deleteContainerItem(stamp);
        },

        refreshCanvas: function () {
            alertify.success('Canvas atualizado');
        },

        onMounted: function () {
            console.log('MDash 2.0 montado com PetiteVue', {
                filtros: this.filters.length,
                containers: this.containers.length,
                fontes: this.fontes.length
            });
            initDragAndDrop();
            setTimeout(syncAllContainerItemsLayout, 0);
        }
    }).mount('#m-dash-main-container');
}

// ============================================================================
// DRAG & DROP ENGINE - SENIOR LEVEL ARCHITECTURE
// ============================================================================

/**
 * GridLayoutEngine - Responsável por cálculos de layout e validações
 */
var GridLayoutEngine = {
    GRID_COLUMNS: 12,
    
    /**
     * Valida se um item cabe numa linha específica
     */
    canFitInRow: function(containerStamp, targetRow, newItemSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'explicit';
        });
        
        var usedColumns = itemsInRow.reduce(function(sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);
        
        return (usedColumns + newItemSpan) <= this.GRID_COLUMNS;
    },
    
    /**
     * Calcula espaço disponível numa linha
     */
    getAvailableSpace: function(containerStamp, targetRow, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'explicit';
        });
        
        var usedColumns = itemsInRow.reduce(function(sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);
        
        return this.GRID_COLUMNS - usedColumns;
    },
    
    /**
     * Encontra item na posição específica
     */
    findItemAtPosition: function(containerStamp, row, col) {
        return GMDashContainerItems.find(function(item) {
            if (item.mdashcontainerstamp !== containerStamp) return false;
            if (getEffectiveItemLayoutMode(item) !== 'explicit') return false;
            
            var itemRow = parseInt(item.gridrow, 10);
            var itemColStart = parseInt(item.gridcolstart, 10);
            var itemSpan = getItemGridSpan(item);
            var itemColEnd = itemColStart + itemSpan - 1;
            
            return itemRow === row && col >= itemColStart && col <= itemColEnd;
        });
    },
    
    /**
     * Calcula reajuste automático de items numa linha
     */
    calculateAutoAdjust: function(containerStamp, targetRow, insertCol, insertSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'explicit';
        }).sort(function(a, b) {
            return parseInt(a.gridcolstart, 10) - parseInt(b.gridcolstart, 10);
        });
        
        var adjustments = [];
        var currentCol = 1;
        
        itemsInRow.forEach(function(item) {
            var itemColStart = parseInt(item.gridcolstart, 10);
            var itemSpan = getItemGridSpan(item);
            
            // Se o item atual está na posição de inserção, pula espaço
            if (currentCol === insertCol) {
                currentCol += insertSpan;
            }
            
            if (itemColStart !== currentCol) {
                adjustments.push({
                    item: item,
                    oldCol: itemColStart,
                    newCol: currentCol
                });
            }
            
            currentCol += itemSpan;
        });
        
        return {
            adjustments: adjustments,
            totalColumns: currentCol - 1,
            isValid: currentCol <= this.GRID_COLUMNS
        };
    }
};

/**
 * VisualFeedbackManager - Gere feedback visual durante drag
 */
var VisualFeedbackManager = {
    
    /**
     * Mostra feedback de erro (linha vermelha + ícone stop)
     */
    showErrorFeedback: function($container, message) {
        this.clearFeedback($container);
        
        $container.addClass('mdash-drop-error');
        
        var $errorOverlay = $('<div class="mdash-drop-error-overlay">' +
            '<i class="glyphicon glyphicon-ban-circle"></i>' +
            '<span>' + (message || 'Não cabe nesta linha') + '</span>' +
        '</div>');
        
        $container.append($errorOverlay);
    },
    
    /**
     * Mostra feedback de sucesso (linha verde + prévia)
     */
    showSuccessFeedback: function($container, adjustments) {
        this.clearFeedback($container);
        $container.addClass('mdash-drop-success');
        
        if (adjustments && adjustments.length > 0) {
            var message = adjustments.length + ' item(s) serão reajustados';
            var $successOverlay = $('<div class="mdash-drop-success-overlay">' +
                '<i class="glyphicon glyphicon-ok-circle"></i>' +
                '<span>' + message + '</span>' +
            '</div>');
            $container.append($successOverlay);
        }
    },
    
    /**
     * Mostra feedback de swap (troca na mesma linha)
     */
    showSwapFeedback: function($container, targetItem) {
        this.clearFeedback($container);
        $container.addClass('mdash-drop-swap');
        
        var $swapOverlay = $('<div class="mdash-drop-swap-overlay">' +
            '<i class="glyphicon glyphicon-retweet"></i>' +
            '<span>Trocar posições</span>' +
        '</div>');
        $container.append($swapOverlay);
    },
    
    /**
     * Limpa todo feedback visual
     */
    clearFeedback: function($container) {
        $container.removeClass('mdash-drop-error mdash-drop-success mdash-drop-swap');
        $container.find('.mdash-drop-error-overlay, .mdash-drop-success-overlay, .mdash-drop-swap-overlay').remove();
    }
};

/**
 * DragDropValidator - Valida operações de drag & drop
 */
var DragDropValidator = {
    
    /**
     * Valida se o drop é possível e retorna estratégia
     */
    validateDrop: function(draggedItem, targetRow, targetCol, containerStamp) {
        var draggedSpan = getItemGridSpan(draggedItem);
        var draggedRow = parseInt(draggedItem.gridrow, 10);
        
        var result = {
            isValid: false,
            strategy: null, // 'swap', 'adjust', 'invalid'
            targetItem: null,
            adjustments: [],
            message: ''
        };
        
        // Encontra item na posição alvo
        var targetItem = GridLayoutEngine.findItemAtPosition(containerStamp, targetRow, targetCol);
        
        // Caso 1: Mesma linha - SWAP
        if (draggedRow === targetRow && targetItem) {
            result.isValid = true;
            result.strategy = 'swap';
            result.targetItem = targetItem;
            result.message = 'Trocar posições';
            return result;
        }
        
        // Caso 2: Linha diferente - verifica se cabe
        var availableSpace = GridLayoutEngine.getAvailableSpace(containerStamp, targetRow, draggedItem.mdashcontaineritemstamp);
        
        if (draggedSpan > availableSpace) {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Não cabe: precisa ' + draggedSpan + ' col, disponível ' + availableSpace + ' col';
            return result;
        }
        
        // Caso 3: Cabe - calcula ajustes
        var adjustResult = GridLayoutEngine.calculateAutoAdjust(
            containerStamp, 
            targetRow, 
            targetCol, 
            draggedSpan, 
            draggedItem.mdashcontaineritemstamp
        );
        
        if (adjustResult.isValid) {
            result.isValid = true;
            result.strategy = 'adjust';
            result.adjustments = adjustResult.adjustments;
            result.message = adjustResult.adjustments.length + ' item(s) reajustados';
        } else {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Total ultrapassa ' + GridLayoutEngine.GRID_COLUMNS + ' colunas';
        }
        
        return result;
    }
};

/**
 * DragDropExecutor - Executa operações de drag & drop
 */
var DragDropExecutor = {
    
    /**
     * Executa swap entre dois items
     */
    executeSwap: function(item1, item2) {
        var temp = {
            row: item1.gridrow,
            colStart: item1.gridcolstart
        };
        
        item1.gridrow = item2.gridrow;
        item1.gridcolstart = item2.gridcolstart;
        
        item2.gridrow = temp.row;
        item2.gridcolstart = temp.colStart;
        
        console.log('🔄 SWAP executado:', {
            item1: item1.mdashcontaineritemstamp.substring(0, 8),
            item2: item2.mdashcontaineritemstamp.substring(0, 8)
        });
        
        // Sincroniza ambos
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(item1, item1.table, item1.idfield);
            realTimeComponentSync(item2, item2.table, item2.idfield);
        }
    },
    
    /**
     * Executa ajuste de items
     */
    executeAdjust: function(adjustments) {
        adjustments.forEach(function(adj) {
            adj.item.gridcolstart = adj.newCol;
            
            console.log('➡️ ADJUST:', {
                item: adj.item.mdashcontaineritemstamp.substring(0, 8),
                oldCol: adj.oldCol,
                newCol: adj.newCol
            });
            
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(adj.item, adj.item.table, adj.item.idfield);
            }
        });
    }
};

// ============================================================================

function initDragAndDrop() {
   /* if (!window.jQuery || !$.fn.draggable || !$.fn.droppable || !$.fn.sortable) {
        console.warn("jQuery UI (draggable/droppable/sortable) não disponível; drag & drop desativado.");
        return;
    }*/

    makeToolboxDraggable();
    makeCanvasDroppable();
    makeContainersSortable();
    makeContainerItemsSortable();
    initContainerItemResize();
    setTimeout(syncAllContainerItemsLayout, 0);
}

function syncAllContainerItemsLayout() {
    var items = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    if (!Array.isArray(items) || !items.length) return;

    var handledContainers = {};
    items.forEach(function (item) {
        if (!item || !item.mdashcontainerstamp) return;
        if (handledContainers[item.mdashcontainerstamp]) return;
        handledContainers[item.mdashcontainerstamp] = true;
        if (containerHasAutoLayoutItems(item.mdashcontainerstamp)) {
            normalizeContainerItemsAutoLayout(item.mdashcontainerstamp);
        } else {
            ensureExplicitItemsHaveCoordinates(item.mdashcontainerstamp);
        }
    });

    items.forEach(function (item) {
        if (!item || !item.mdashcontaineritemstamp) return;

        var selector = '.mdash-canvas-item[data-stamp="' + item.mdashcontaineritemstamp + '"]';
        var $el = $(selector);
        if (!$el.length) return;

        var cssMap = getItemGridStyleMap(item);

        // Reforça o layout por span e limpa vestígios inline do sortable.
        $el.css({
            'grid-column': cssMap.gridColumn,
            'grid-row': cssMap.gridRow,
            'width': '',
            'max-width': '',
            'left': '',
            'top': ''
        });
    });
}

function containerHasAutoLayoutItems(containerStamp) {
    if (!containerStamp) return false;

    return GMDashContainerItems.some(function (item) {
        return item.mdashcontainerstamp === containerStamp && getEffectiveItemLayoutMode(item) === "auto";
    });
}

function getContainerLayoutMode(containerStamp) {
    var containers = (window.appState && window.appState.containers) ? window.appState.containers : GMDashContainers;
    if (!Array.isArray(containers) || !containers.length) return "auto";

    var container = containers.find(function (c) {
        return c && c.mdashcontainerstamp === containerStamp;
    });

    if (!container || !container.layoutmode) return "auto";
    return container.layoutmode === "explicit" ? "explicit" : "auto";
}

function getEffectiveItemLayoutMode(item) {
    if (!item) return "auto";

    var itemMode = (item.layoutmode || "inherit").toString().toLowerCase();
    if (itemMode === "explicit") return "explicit";
    if (itemMode === "auto") return "auto";

    return getContainerLayoutMode(item.mdashcontainerstamp);
}

function isExplicitLayoutItem(item) {
    if (!item) return false;
    if (getEffectiveItemLayoutMode(item) !== "explicit") return false;

    var row = parseInt(item.gridrow, 10);
    var colStart = parseInt(item.gridcolstart, 10);
    return !!(row >= 1 && colStart >= 1);
}

function getItemGridSpan(item) {
    var span = parseInt(item.gridcolspan, 10);
    if (!span || span < 1) {
        span = parseInt(item.tamanho, 10) || 4;
    }
    if (span > 12) span = 12;
    return span;
}

function getItemGridStyleMap(item) {
    var span = getItemGridSpan(item);

    if (isExplicitLayoutItem(item)) {
        var row = parseInt(item.gridrow, 10);
        var colStart = parseInt(item.gridcolstart, 10);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;

        if (colStart < 1) colStart = 1;
        if (colStart > 12) colStart = 12;
        if ((colStart + span - 1) > 12) {
            colStart = Math.max(1, 12 - span + 1);
        }

        return {
            gridColumn: colStart + ' / span ' + span,
            gridRow: row + ' / span ' + rowSpan
        };
    }

    return {
        gridColumn: 'span ' + span + ' / span ' + span,
        gridRow: ''
    };
}

function getItemGridStyleString(item) {
    var cssMap = getItemGridStyleMap(item);
    return 'grid-column: ' + cssMap.gridColumn + '; ' + (cssMap.gridRow ? ('grid-row: ' + cssMap.gridRow + '; ') : '') + 'min-width: 0;';
}

function isGridAreaFree(occupiedMap, rowStart, colStart, colSpan, rowSpan) {
    for (var r = rowStart; r < (rowStart + rowSpan); r++) {
        for (var c = colStart; c < (colStart + colSpan); c++) {
            if (occupiedMap[r + ':' + c]) {
                return false;
            }
        }
    }
    return true;
}

function markGridAreaOccupied(occupiedMap, rowStart, colStart, colSpan, rowSpan) {
    for (var r = rowStart; r < (rowStart + rowSpan); r++) {
        for (var c = colStart; c < (colStart + colSpan); c++) {
            occupiedMap[r + ':' + c] = true;
        }
    }
}

function findNextGridSlot(occupiedMap, preferredRow, preferredCol, colSpan, rowSpan) {
    var row = parseInt(preferredRow, 10);
    var col = parseInt(preferredCol, 10);

    if (!row || row < 1) row = 1;
    if (!col || col < 1) col = 1;

    while (true) {
        if (col > 12) {
            row += Math.floor((col - 1) / 12);
            col = ((col - 1) % 12) + 1;
        }

        if ((col + colSpan - 1) > 12) {
            row += 1;
            col = 1;
            continue;
        }

        if (isGridAreaFree(occupiedMap, row, col, colSpan, rowSpan)) {
            return { row: row, colStart: col };
        }

        col += 1;
    }
}

function normalizeContainerItemsAutoLayout(containerStamp) {
    if (!containerStamp) return;

    var containerItems = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            var aMode = getEffectiveItemLayoutMode(a);
            var bMode = getEffectiveItemLayoutMode(b);

            if (aMode === "explicit" && bMode === "explicit") {
                var rowDiff = (parseInt(a.gridrow, 10) || 0) - (parseInt(b.gridrow, 10) || 0);
                if (rowDiff !== 0) return rowDiff;

                var colDiff = (parseInt(a.gridcolstart, 10) || 0) - (parseInt(b.gridcolstart, 10) || 0);
                if (colDiff !== 0) return colDiff;
            }

            if (aMode === "explicit" && bMode !== "explicit") return -1;
            if (aMode !== "explicit" && bMode === "explicit") return 1;

            return (a.ordem || 0) - (b.ordem || 0);
        });

    var occupiedMap = {};
    var autoCursorRow = 1;
    var autoCursorCol = 1;

    containerItems.forEach(function (item) {
        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var mode = getEffectiveItemLayoutMode(item);
        var preferredRow = mode === "explicit" ? item.gridrow : autoCursorRow;
        var preferredCol = mode === "explicit" ? item.gridcolstart : autoCursorCol;

        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        item.gridrow = slot.row;
        item.gridcolstart = slot.colStart;
        item.gridcolspan = span;
        item.gridrowspan = rowSpan;

        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);

        if (mode === "auto") {
            autoCursorRow = slot.row;
            autoCursorCol = slot.colStart + span;
            while (autoCursorCol > 12) {
                autoCursorRow += 1;
                autoCursorCol = 1;
            }
        }
    });
}

function ensureExplicitItemsHaveCoordinates(containerStamp) {
    if (!containerStamp) return;

    var containerItems = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            return (a.ordem || 0) - (b.ordem || 0);
        });

    var occupiedMap = {};

    containerItems.forEach(function (item) {
        if (!item) return;

        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var mode = getEffectiveItemLayoutMode(item);
        var row = parseInt(item.gridrow, 10);
        var colStart = parseInt(item.gridcolstart, 10);

        if (mode !== "explicit") {
            if (!(row >= 1 && colStart >= 1)) {
                var autoSlot = findNextGridSlot(occupiedMap, 1, 1, span, rowSpan);
                row = autoSlot.row;
                colStart = autoSlot.colStart;
                item.gridrow = row;
                item.gridcolstart = colStart;
            }

            item.gridcolspan = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, row, colStart, span, rowSpan);
            return;
        }

        if (!(row >= 1 && colStart >= 1)) {
            var explicitSlot = findNextGridSlot(occupiedMap, 1, 1, span, rowSpan);
            item.gridrow = explicitSlot.row;
            item.gridcolstart = explicitSlot.colStart;
            item.gridcolspan = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, explicitSlot.row, explicitSlot.colStart, span, rowSpan);
            return;
        }

        if (colStart > 12) colStart = 12;
        if ((colStart + span - 1) > 12) {
            colStart = Math.max(1, 12 - span + 1);
            item.gridcolstart = colStart;
        }

        if (!isGridAreaFree(occupiedMap, row, colStart, span, rowSpan)) {
            var fallbackSlot = findNextGridSlot(occupiedMap, row, colStart, span, rowSpan);
            item.gridrow = fallbackSlot.row;
            item.gridcolstart = fallbackSlot.colStart;
            item.gridcolspan = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, fallbackSlot.row, fallbackSlot.colStart, span, rowSpan);
            return;
        }

        item.gridcolspan = span;
        item.gridrowspan = rowSpan;
        markGridAreaOccupied(occupiedMap, row, colStart, span, rowSpan);
    });
}

function resolveExplicitCollisions(containerStamp, anchorItemStamp) {
    if (!containerStamp || !anchorItemStamp) return;

    var items = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            var aIsAnchor = a.mdashcontaineritemstamp === anchorItemStamp;
            var bIsAnchor = b.mdashcontaineritemstamp === anchorItemStamp;
            if (aIsAnchor && !bIsAnchor) return -1;
            if (!aIsAnchor && bIsAnchor) return 1;
            return (a.ordem || 0) - (b.ordem || 0);
        });

    if (!items.length) return;

    var occupiedMap = {};

    items.forEach(function (item) {
        if (!item || getEffectiveItemLayoutMode(item) !== 'explicit') return;

        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var preferredRow = parseInt(item.gridrow, 10);
        var preferredCol = parseInt(item.gridcolstart, 10);
        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        item.gridrow = slot.row;
        item.gridcolstart = slot.colStart;
        item.gridcolspan = span;
        item.gridrowspan = rowSpan;
        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);
    });
}

function detectZone(event, ui, containerStamp, draggedItemStamp) {
    if (!ui || !ui.item || !containerStamp) return null;

    var $grid = ui.item.closest('.mdash-container-items-row');
    if (!$grid.length) return null;

    var gridRect = $grid.get(0).getBoundingClientRect();
    if (!gridRect || !gridRect.width) return null;

    // Obter coordenadas do mouse
    var clientX = event.clientX;
    var clientY = event.clientY;

    if (!clientX && event.originalEvent) {
        clientX = event.originalEvent.clientX;
        clientY = event.originalEvent.clientY;
    }

    if (!clientX) {
        var helperRect = ui.helper && ui.helper[0] ? ui.helper[0].getBoundingClientRect() : null;
        if (helperRect) {
            clientX = helperRect.left + helperRect.width / 2;
            clientY = helperRect.top + helperRect.height / 2;
        }
    }

    if (!clientX || !clientY) return null;

    // Obter todos os items existentes neste container (exceto o que está a ser arrastado)
    var existingItems = GMDashContainerItems.filter(function (item) {
        return item.mdashcontainerstamp === containerStamp &&
               item.mdashcontaineritemstamp !== draggedItemStamp &&
               getEffectiveItemLayoutMode(item) === 'explicit' &&
               item.gridrow >= 1 &&
               item.gridcolstart >= 1;
    });

    // Agrupar items por linha
    var rowGroups = {};
    existingItems.forEach(function (item) {
        var row = parseInt(item.gridrow, 10);
        if (!rowGroups[row]) rowGroups[row] = [];
        rowGroups[row].push({
            colStart: parseInt(item.gridcolstart, 10),
            colEnd: parseInt(item.gridcolstart, 10) + getItemGridSpan(item) - 1,
            item: item
        });
    });

    // Ordenar linhas
    var sortedRows = Object.keys(rowGroups).map(function (r) { return parseInt(r, 10); }).sort(function (a, b) { return a - b; });

    // Detectar linha baseada no Y
    var yRelative = clientY - gridRect.top;
    var detectedRow = 1;

    // Procurar elementos DOM reais para detectar a linha
    var $items = $grid.find('.mdash-canvas-item').not(ui.item);
    var rowHeights = {};

    $items.each(function () {
        var $el = $(this);
        var stamp = $el.data('stamp');
        var itemData = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
        if (!itemData || itemData.mdashcontaineritemstamp === draggedItemStamp) return;

        var row = parseInt(itemData.gridrow, 10);
        if (row < 1) return;

        var rect = this.getBoundingClientRect();
        var relativeTop = rect.top - gridRect.top;
        var relativeBottom = rect.bottom - gridRect.top;

        if (!rowHeights[row] || relativeTop < rowHeights[row].top) {
            rowHeights[row] = {
                top: relativeTop,
                bottom: relativeBottom,
                height: rect.height
            };
        } else if (relativeBottom > rowHeights[row].bottom) {
            rowHeights[row].bottom = relativeBottom;
        }
    });

    // Detectar em que linha o Y está
    for (var row in rowHeights) {
        var bounds = rowHeights[row];
        if (yRelative >= bounds.top && yRelative <= bounds.bottom) {
            detectedRow = parseInt(row, 10);
            break;
        }
    }

    // Se o Y está abaixo de todas as linhas, criar nova linha
    if (sortedRows.length > 0) {
        var lastRow = sortedRows[sortedRows.length - 1];
        var lastBounds = rowHeights[lastRow];
        if (lastBounds && yRelative > lastBounds.bottom) {
            detectedRow = lastRow + 1;
        }
    }

    // Detectar coluna baseada no X
    var xRelative = clientX - gridRect.left;
    var computed = window.getComputedStyle($grid.get(0));
    var colGap = parseFloat(computed.columnGap || computed.gap || '14') || 14;
    var colUnit = (gridRect.width - (colGap * 11)) / 12;
    var detectedCol = Math.floor(xRelative / (colUnit + colGap)) + 1;

    if (detectedCol < 1) detectedCol = 1;
    if (detectedCol > 12) detectedCol = 12;

  /*  console.log('🎯 detectZone:', {
        mouseY: Math.round(yRelative),
        mouseX: Math.round(xRelative),
        detectedRow: detectedRow,
        detectedCol: detectedCol,
        rowHeights: rowHeights
    });*/

    return {
        row: detectedRow,
        col: detectedCol
    };
}

function computeExplicitDropSlot(event, ui, containerStamp, item) {
    if (!containerStamp || !item || !ui || !ui.item) return null;

    var zone = detectZone(event, ui, containerStamp, item.mdashcontaineritemstamp);
    if (!zone) return null;

    var span = getItemGridSpan(item);
    var rowSpan = parseInt(item.gridrowspan, 10) || 1;

    var targetCol = zone.col;
    var targetRow = zone.row;

    // Garantir que o item não ultrapassa a coluna 12
    if ((targetCol + span - 1) > 12) {
        targetCol = Math.max(1, 12 - span + 1);
    }

    var slot = {
        row: targetRow,
        colStart: targetCol,
        span: span,
        rowSpan: rowSpan
    };

   // console.log('📦 computeExplicitDropSlot:', slot);

    return slot;
}

function clearExplicitPlaceholder($scope) {
    if (!$scope || !$scope.length) return;
    $scope.find('.mdash-item-sort-placeholder')
        .removeClass('is-explicit-preview')
        .removeAttr('data-grid-label')
        .css({
            'grid-column': '',
            'grid-row': ''
        });
}

function setExplicitDragPreviewSlot(itemStamp, containerStamp, slot) {
    if (!itemStamp || !slot) return;
    GExplicitDragState.itemStamp = itemStamp;
    GExplicitDragState.containerStamp = containerStamp || "";
    GExplicitDragState.slot = {
        row: slot.row,
        colStart: slot.colStart,
        span: slot.span,
        rowSpan: slot.rowSpan
    };
}

function getExplicitDragPreviewSlot(itemStamp, containerStamp) {
    if (!itemStamp || !GExplicitDragState.slot) return null;
    if (GExplicitDragState.itemStamp !== itemStamp) return null;
    if (containerStamp && GExplicitDragState.containerStamp && GExplicitDragState.containerStamp !== containerStamp) return null;
    return GExplicitDragState.slot;
}

function clearExplicitDragPreviewSlot() {
    GExplicitDragState.itemStamp = "";
    GExplicitDragState.containerStamp = "";
    GExplicitDragState.slot = null;
}

function applyDroppedItemGridPosition(event, ui, containerStamp) {

    console.log("INICIANDO applyDroppedItemGridPosition com containerStamp:", containerStamp);
    if (!ui || !ui.item || !containerStamp) return;

    var currentContainerStamp = ui.item.closest('.mdash-canvas-container').data('stamp');
    if (currentContainerStamp && currentContainerStamp !== containerStamp) return;

    var itemStamp = ui.item.data('stamp');
    if (!itemStamp) return;

    var item = GMDashContainerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!item) return;

    console.log('🔵 ANTES DO DROP:', {
        itemStamp: itemStamp.substring(0, 8),
        gridrow: item.gridrow,
        gridcolstart: item.gridcolstart,
        gridcolspan: item.gridcolspan,
        layoutmode: item.layoutmode
    });

    item.mdashcontainerstamp = containerStamp;

    if (getEffectiveItemLayoutMode(item) !== "explicit") {
        return;
    }

    var slot = getExplicitDragPreviewSlot(item.mdashcontaineritemstamp, containerStamp);
    if (!slot) {
        slot = computeExplicitDropSlot(event, ui, containerStamp, item);
    }
    if (!slot) return;

    console.log('✅ applyDroppedItemGridPosition - aplicando:', {
        itemStamp: itemStamp.substring(0, 8),
        row: slot.row,
        colStart: slot.colStart,
        span: slot.span
    });

    item.gridrow = slot.row;
    item.gridcolstart = slot.colStart;
    item.gridcolspan = slot.span;
    item.gridrowspan = slot.rowSpan;

    console.log('🔴 DEPOIS DO DROP (aplicado):', {
        itemStamp: itemStamp.substring(0, 8),
        gridrow: item.gridrow,
        gridcolstart: item.gridcolstart,
        gridcolspan: item.gridcolspan
    });

    // Sync imediato se existir
    if (typeof realTimeComponentSync === 'function') {
        console.log('💾 Chamando realTimeComponentSync...');
        realTimeComponentSync(item, item.table, item.idfield);
    }

    // SEM resolveExplicitCollisions - item vai para posição exata
}

function initContainerItemResize() {
    $(document)
        .off('pointerdown.mdashItemResize mousedown.mdashItemResize')
        .on('pointerdown.mdashItemResize mousedown.mdashItemResize', '.mdash-item-resize-handle', function (event) {
            // Evita duplicação em browsers que disparam pointerdown + mousedown.
            if (event.type === 'mousedown' && window.PointerEvent) return;

            event.preventDefault();
            event.stopPropagation();

            var pointX = event.clientX;
            if ((pointX === undefined || pointX === null) && event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0]) {
                pointX = event.originalEvent.touches[0].clientX;
            }
            if (pointX === undefined || pointX === null) return;

            var $itemEl = $(this).closest('.mdash-canvas-item');
            if (!$itemEl.length) return;

            var itemStamp = $itemEl.data('stamp');
            var item = GMDashContainerItems.find(function (i) {
                return i.mdashcontaineritemstamp === itemStamp;
            });
            if (!item) return;

            var $grid = $itemEl.closest('.mdash-container-items-row');
            if (!$grid.length) return;

            var startX = pointX;
            var isLeftHandle = $(this).hasClass('mdash-item-resize-handle-left');
            var startSize = parseInt(item.tamanho, 10) || 4;
            var lastSize = startSize;
            var maxWarnShown = false;
            var minWarnShown = false;

            var gridElement = $grid.get(0);
            var computedGrid = window.getComputedStyle(gridElement);
            var gap = parseFloat(computedGrid.columnGap || computedGrid.gap || '14') || 14;
            var gridWidth = $grid.innerWidth() || $grid.width() || 0;
            var colUnit = (gridWidth - (gap * 11)) / 12;

            // Fallback quando o cálculo da grid não devolve largura válida.
            if (!colUnit || colUnit <= 0) {
                colUnit = ($itemEl.outerWidth() || 1) / Math.max(startSize, 1);
            }
            if (!colUnit || colUnit <= 0) colUnit = 20;

            $('body').addClass('mdash-resize-active');
            $itemEl.addClass('is-resizing');
            GMDashIsResizingItem = true;

            $('.mdash-container-items-row').each(function () {
                var $row = $(this);
                if ($row.data('ui-sortable')) {
                    $row.sortable('option', 'disabled', true);
                }
            });

            function readClientX(moveEvent) {
                if (moveEvent.clientX !== undefined && moveEvent.clientX !== null) return moveEvent.clientX;
                if (moveEvent.originalEvent && moveEvent.originalEvent.touches && moveEvent.originalEvent.touches[0]) {
                    return moveEvent.originalEvent.touches[0].clientX;
                }
                return null;
            }

            function applySize(proposed, moveEvent) {
                var minAllowed = (moveEvent && moveEvent.altKey) ? 1 : 2;

                if (proposed > 12) {
                    proposed = 12;
                    if (!maxWarnShown && typeof alertify !== 'undefined') {
                        alertify.warning('Tamanho maximo possivel atingido (12 colunas).', 2500);
                        maxWarnShown = true;
                    }
                }

                if (proposed < minAllowed) {
                    proposed = minAllowed;
                    if (minAllowed === 2 && !minWarnShown && typeof alertify !== 'undefined') {
                        alertify.message('Tamanho minimo recomendado: 2 colunas (ALT para permitir 1).', 2500);
                        minWarnShown = true;
                    }
                }

                if (proposed === lastSize) return;

                lastSize = proposed;
                item.tamanho = proposed;
                item.gridcolspan = proposed;
                $itemEl.css('grid-column', 'span ' + proposed);
                setTimeout(syncAllContainerItemsLayout, 0);
            }

            function onPointerMove(moveEvent) {
                var moveX = readClientX(moveEvent);
                if (moveX === null) return;
                var deltaX = moveX - startX;
                var directionFactor = isLeftHandle ? -1 : 1;
                var deltaCols = Math.round((deltaX * directionFactor) / colUnit);
                var proposed = startSize + deltaCols;
                applySize(proposed, moveEvent);
            }

            function cleanup() {
                $(document).off('pointermove.mdashItemResizeActive mousemove.mdashItemResizeActive', onPointerMove);
                $(document).off('pointerup.mdashItemResizeActive mouseup.mdashItemResizeActive', onPointerUp);
                $('body').removeClass('mdash-resize-active');
                $itemEl.removeClass('is-resizing').css('grid-column', '');
                GMDashIsResizingItem = false;

                $('.mdash-container-items-row').each(function () {
                    var $row = $(this);
                    if ($row.data('ui-sortable')) {
                        $row.sortable('option', 'disabled', false);
                    }
                });

                if (lastSize !== startSize && typeof realTimeComponentSync === 'function') {
                    realTimeComponentSync(item, item.table, item.idfield);
                }
                setTimeout(syncAllContainerItemsLayout, 0);
            }

            function onPointerUp() {
                cleanup();
            }

            $(document).on('pointermove.mdashItemResizeActive mousemove.mdashItemResizeActive', onPointerMove);
            $(document).on('pointerup.mdashItemResizeActive mouseup.mdashItemResizeActive', onPointerUp);
        });
}

function makeToolboxDraggable() {
    $('.mdash-toolbox-item').draggable({
        helper: 'clone',
        revert: 'invalid',
        appendTo: 'body',
        zIndex: 9999,
        cancel: '',
        start: function (e, ui) {
            ui.helper.addClass('dragging');
        }
    });
}

function makeCanvasDroppable() {
    $('#mdash-canvas-body').droppable({
        accept: '.toolbox-container',
        tolerance: 'pointer',
        hoverClass: 'mdash-drop-hover',
        drop: function () {
            createContainerByDrop();
        }
    });

    $('.mdash-container-items').droppable({
        accept: '.toolbox-container-item',
        tolerance: 'pointer',
        hoverClass: 'mdash-drop-hover',
        drop: function (event, ui) {
            var containerStamp = $(this).data('container');
            createContainerItemByDrop(containerStamp);
        }
    });
}

function makeContainersSortable() {
    $('#mdash-canvas-body').sortable({
        items: '.mdash-canvas-container',
        handle: '.mdash-container-drag-handle',
        axis: 'y',
        tolerance: 'intersect',
        forcePlaceholderSize: true,
        distance: 4,
        revert: 120,
        placeholder: 'mdash-sort-placeholder',
        start: function (event, ui) {
            ui.placeholder.height(ui.item.outerHeight());
            ui.placeholder.width(ui.item.outerWidth());
            ui.item.addClass('is-dragging');
        },
        stop: function (event, ui) {
            ui.item.removeClass('is-dragging');
        },
        update: function () {
            updateContainerOrderFromDom();
        }
    });
}

function makeContainerItemsSortable() {
    $('.mdash-container-items-row').each(function () {
        $(this).sortable({
            items: '.mdash-canvas-item',
            cancel: '.mdash-item-resize-handle, .mdash-item-resize-handle *',
            connectWith: '.mdash-container-items-row',
            helper: 'clone',
            appendTo: 'body',
            zIndex: 10050,
            placeholder: 'mdash-item-sort-placeholder',
            forcePlaceholderSize: true,
            refreshPositions: true,
            toleranceElement: '.mdash-canvas-item-card',
            tolerance: 'pointer',
            distance: 6,
            over: function () {
                console.log('⬇️ OVER EVENT disparado');
                $(this).addClass('is-drop-over');
            },
            out: function (event, ui) {
                console.log('⬆️ OUT EVENT disparado');
                $(this).removeClass('is-drop-over');
                clearExplicitPlaceholder($(this));
                
                // Limpa feedback visual ao sair da linha
                var $container = ui.item.closest('.mdash-canvas-container');
                VisualFeedbackManager.clearFeedback($container);
            },
            start: function (event, ui) {
                console.log('🚀 START EVENT disparado');
                if (GMDashIsResizingItem) return false;
                clearExplicitDragPreviewSlot();
                var itemSpan = ui.item && ui.item.css ? ui.item.css('grid-column') : '';
                if (ui && ui.placeholder && ui.item) {
                    ui.placeholder.height(ui.item.outerHeight());
                    ui.placeholder.width(ui.item.outerWidth());
                    if (itemSpan) {
                        ui.placeholder.css('grid-column', itemSpan);
                    }
                }
                if (ui && ui.helper) {
                    ui.helper.addClass('mdash-item-drag-helper');
                    ui.helper.css({
                        width: ui.item.outerWidth(),
                        minWidth: ui.item.outerWidth(),
                        height: ui.item.outerHeight(),
                        opacity: 0.96,
                        zIndex: 10050,
                        pointerEvents: 'none'
                    });
                }
            },
            receive: function (event, ui) {
                console.log('📥 RECEIVE EVENT iniciado (item movido entre linhas diferentes)');
                
                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var movedItemStamp = ui.item && ui.item.data('stamp');
                var movedItem = GMDashContainerItems.find(function (i) {
                    return i.mdashcontaineritemstamp === movedItemStamp;
                });

                if (movedItem && targetStamp && movedItem.mdashcontainerstamp !== targetStamp) {
                    movedItem.mdashcontainerstamp = targetStamp;
                    if (typeof realTimeComponentSync === 'function') {
                        realTimeComponentSync(movedItem, movedItem.table, movedItem.idfield);
                    }
                }

                var isExplicitMode = movedItem && getEffectiveItemLayoutMode(movedItem) === 'explicit';
                
                console.log('📥 RECEIVE: chamando applyDroppedItemGridPosition');
                applyDroppedItemGridPosition(event, ui, targetStamp);
                updateContainerItemsOrder(targetStamp, isExplicitMode);

                var sourceStamp = ui.sender ? $(ui.sender).closest('.mdash-canvas-container').data('stamp') : '';
                if (sourceStamp) {
                    updateContainerItemsOrder(sourceStamp);
                }

                setTimeout(function() {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === movedItemStamp; });
                    console.log('🏁 ESTADO FINAL RECEIVE (após syncAllContainerItemsLayout):', {
                        itemStamp: movedItemStamp.substring(0, 8),
                        gridrow: finalItem ? finalItem.gridrow : 'item não encontrado',
                        gridcolstart: finalItem ? finalItem.gridcolstart : 'item não encontrado',
                        gridcolspan: finalItem ? finalItem.gridcolspan : 'item não encontrado'
                    });
                }, 100);

                setTimeout(syncAllContainerItemsLayout, 0);
            },
            sort: function (event, ui) {
                console.log('🔄 SORT EVENT disparado');
                if (ui && ui.placeholder && ui.item) {
                    ui.placeholder.height(ui.item.outerHeight());
                    ui.placeholder.width(ui.item.outerWidth());
                }

                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                if (!targetStamp || !itemStamp) return;

                var item = GMDashContainerItems.find(function (i) {
                    return i.mdashcontaineritemstamp === itemStamp;
                });
                if (!item) return;

                if (getEffectiveItemLayoutMode(item) !== 'explicit') {
                    clearExplicitPlaceholder($(this));
                    clearExplicitDragPreviewSlot();
                    return;
                }

                var slot = computeExplicitDropSlot(event, ui, targetStamp, item);
                if (!slot) {
                    clearExplicitPlaceholder($(this));
                    clearExplicitDragPreviewSlot();
                    return;
                }

                // ⭐ VALIDAÇÃO EM TEMPO REAL
                var validation = DragDropValidator.validateDrop(item, slot.row, slot.colStart, targetStamp);
                
                console.log('✅ Validação:', validation);
                
                var $container = ui.item.closest('.mdash-canvas-container');
                
                // Feedback visual baseado na validação
                if (!validation.isValid) {
                    VisualFeedbackManager.showErrorFeedback($container, validation.message);
                    clearExplicitPlaceholder($(this));
                    // Cancela o preview
                    setExplicitDragPreviewSlot(null, null, null);
                } else {
                    // Salva validação para usar no STOP
                    setExplicitDragPreviewSlot(item.mdashcontaineritemstamp, targetStamp, slot);
                    GExplicitDragState.validation = validation;
                    
                    // Feedback visual baseado na estratégia
                    switch (validation.strategy) {
                        case 'swap':
                            VisualFeedbackManager.showSwapFeedback($container, validation.targetItem);
                            break;
                        case 'adjust':
                            VisualFeedbackManager.showSuccessFeedback($container, validation.adjustments);
                            break;
                    }
                    
                    // Atualiza placeholder
                    if (ui.placeholder && ui.placeholder.css) {
                        ui.placeholder
                            .addClass('is-explicit-preview')
                            .attr('data-grid-label', 'Linha ' + slot.row + ' Col ' + slot.colStart);
                        ui.placeholder.css({
                            'grid-column': slot.colStart + ' / span ' + slot.span,
                            'grid-row': slot.row + ' / span ' + slot.rowSpan
                        });
                    }
                }
            },
            stop: function (event, ui) {
                console.log('🛑 STOP EVENT disparado');
                $(this).removeClass('is-drop-over');
                clearExplicitPlaceholder($(this));
                
                var $container = ui.item.closest('.mdash-canvas-container');
                VisualFeedbackManager.clearFeedback($container);
                
                // APLICAR POSIÇÃO AQUI porque UPDATE/RECEIVE não disparam
                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                
                if (item && targetStamp) {
                    var isExplicitMode = getEffectiveItemLayoutMode(item) === 'explicit';
                    
                    if (isExplicitMode) {
                        console.log('🔧 STOP: Aplicando posição em modo explicit');
                        
                        // ⭐ EXECUTA ESTRATÉGIA VALIDADA
                        var validation = GExplicitDragState.validation;
                        if (validation && validation.isValid) {
                            console.log('📌 Executando estratégia:', validation.strategy);
                            
                            switch (validation.strategy) {
                                case 'swap':
                                    DragDropExecutor.executeSwap(item, validation.targetItem);
                                    break;
                                    
                                case 'adjust':
                                    // Aplica posição do item arrastado
                                    applyDroppedItemGridPosition(event, ui, targetStamp);
                                    // Executa ajustes dos outros items
                                    DragDropExecutor.executeAdjust(validation.adjustments);
                                    break;
                                    
                                default:
                                    // Fallback: apenas aplica posição
                                    applyDroppedItemGridPosition(event, ui, targetStamp);
                            }
                        } else {
                            // Sem validação: comportamento padrão
                            applyDroppedItemGridPosition(event, ui, targetStamp);
                        }
                        
                        updateContainerItemsOrder(targetStamp, true);
                        
                        setTimeout(function() {
                            var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                            console.log('🏁 ESTADO FINAL STOP:', {
                                itemStamp: itemStamp.substring(0, 8),
                                gridrow: finalItem ? finalItem.gridrow : 'N/A',
                                gridcolstart: finalItem ? finalItem.gridcolstart : 'N/A',
                                gridcolspan: finalItem ? finalItem.gridcolspan : 'N/A'
                            });
                        }, 100);
                    } else {
                        updateContainerItemsOrder(targetStamp, false);
                    }
                }
                
                // Limpa estado global
                clearExplicitDragPreviewSlot();
                GExplicitDragState.validation = null;
                
                setTimeout(syncAllContainerItemsLayout, 0);
            },
            update: function (event, ui) {
                console.log('🎬 UPDATE EVENT disparado (movimento dentro da mesma linha)');
                
                var liveContainerStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                var isExplicitMode = item && getEffectiveItemLayoutMode(item) === 'explicit';
                
                applyDroppedItemGridPosition(event, ui, liveContainerStamp);
                updateContainerItemsOrder(liveContainerStamp, isExplicitMode);
                clearExplicitPlaceholder($(this));
                clearExplicitDragPreviewSlot();
                
                setTimeout(function() {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                    console.log('🏁 ESTADO FINAL (após syncAllContainerItemsLayout):', {
                        itemStamp: itemStamp.substring(0, 8),
                        gridrow: finalItem.gridrow,
                        gridcolstart: finalItem.gridcolstart,
                        gridcolspan: finalItem.gridcolspan
                    });
                }, 100);
                
                setTimeout(syncAllContainerItemsLayout, 0);
            }
        });
    });
}

function createContainerByDrop() {
    var newContainer = new MdashContainer({ dashboardstamp: GMDashStamp });
    window.appState.containers.push(newContainer);
    
    // Sincroniza o novo container com a base de dados IMEDIATAMENTE
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(newContainer, newContainer.table, newContainer.idfield);
    }
    
    if (GMDashReactiveInstance && GMDashReactiveInstance.selectedComponent) {
        GMDashReactiveInstance.selectedComponent = { type: "container", stamp: newContainer.mdashcontainerstamp, data: newContainer };
    }
    handleComponentProperties({ type: "container", stamp: newContainer.mdashcontainerstamp, data: newContainer });
    setTimeout(initDragAndDrop, 0);
    alertify.success('Container criado');
}

function createContainerItemByDrop(containerStamp) {
    if (!containerStamp) return;
    var newItem = new MdashContainerItem({ mdashcontainerstamp: containerStamp, dashboardstamp: GMDashStamp });
    window.appState.containerItems.push(newItem);
    
    // Sincroniza o novo item com a base de dados IMEDIATAMENTE
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(newItem, newItem.table, newItem.idfield);
    }
    
    if (GMDashReactiveInstance && GMDashReactiveInstance.selectedComponent) {
        GMDashReactiveInstance.selectedComponent = { type: "containerItem", stamp: newItem.mdashcontaineritemstamp, data: newItem };
    }
    handleComponentProperties({ type: "containerItem", stamp: newItem.mdashcontaineritemstamp, data: newItem });
    setTimeout(function () {
        renderContainerItemTemplate(newItem);
        initDragAndDrop();
    }, 0);
    alertify.success('Item criado');
}

function updateContainerOrderFromDom() {
    $('#mdash-canvas-body .mdash-canvas-container').each(function (idx) {
        var stamp = $(this).data('stamp');
        var container = GMDashContainers.find(function (c) { return c.mdashcontainerstamp === stamp; });
        if (container) {
            container.ordem = idx + 1;
            if (typeof realTimeComponentSync === "function") {
                realTimeComponentSync(container, container.table, container.idfield);
            }
        }
    });
}

function updateContainerItemsOrder(containerStamp, skipCoordinateCheck) {
    if (!containerStamp) return;

    console.log('📋 updateContainerItemsOrder chamado:', {
        containerStamp: containerStamp.substring(0, 8),
        skipCoordinateCheck: skipCoordinateCheck
    });

    var selector = '.mdash-canvas-container[data-stamp=\"' + containerStamp + '\"] .mdash-canvas-item';
    $(selector).each(function (idx) {
        var stamp = $(this).data('stamp');
        var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
        if (item) {
            var oldRow = item.gridrow;
            var oldCol = item.gridcolstart;
            
            item.ordem = idx + 1;
            item.mdashcontainerstamp = containerStamp;
            if (!item.gridcolspan || item.gridcolspan < 1) {
                item.gridcolspan = getItemGridSpan(item);
            }
            
            if (item.gridrow !== oldRow || item.gridcolstart !== oldCol) {
                console.log('⚠️ updateContainerItemsOrder MUDOU posição:', {
                    itemStamp: stamp.substring(0, 8),
                    antes: { row: oldRow, col: oldCol },
                    depois: { row: item.gridrow, col: item.gridcolstart }
                });
            }
            
            // Só sincroniza se NÃO for skipCoordinateCheck (modo explicit já sincroniza em applyDroppedItemGridPosition)
            if (!skipCoordinateCheck && typeof realTimeComponentSync === "function") {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        }
    });

    if (skipCoordinateCheck) {
        console.log('⏭️ updateContainerItemsOrder: skip coordinate check');
        setTimeout(syncAllContainerItemsLayout, 0);
        return;
    }

    if (containerHasAutoLayoutItems(containerStamp)) {
        normalizeContainerItemsAutoLayout(containerStamp);
    } else {
        console.log('🔧 Chamando ensureExplicitItemsHaveCoordinates...');
        ensureExplicitItemsHaveCoordinates(containerStamp);
    }

    setTimeout(syncAllContainerItemsLayout, 0);
}

// ============================================================================
// PROPRIEDADES DINÂMICAS (lado direito)
// ============================================================================

function handleComponentProperties(selectedComponent) {
    var panel = $('#mdash-properties-panel');
    if (!panel.length) return;

    if (!selectedComponent || !selectedComponent.data) {
        panel.html('<p class=\"text-muted\" style=\"margin:0;\">Selecione um componente.</p>');
        return;
    }

    if (selectedComponent.type === "container") {
        var formConfig = getContainerUIObjectFormConfigAndSourceValues();
        renderPropertiesForm(panel, selectedComponent.data, formConfig);
    } else if (selectedComponent.type === "containerItem") {
        var formConfigItem = getContainerItemUIObjectFormConfigAndSourceValues();
        renderPropertiesForm(panel, selectedComponent.data, formConfigItem);
    } else {
        panel.html('<p class=\"text-muted\">Tipo ainda não suportado.</p>');
    }
}

function buildModalEntityTitle(typeLabel, titleValue) {
    var cleanTitle = (titleValue || "").toString().trim();
    return cleanTitle ? (typeLabel + " - " + cleanTitle) : typeLabel;
}

function resetModalOpenState(modalSelector) {
    var $existingModal = $(modalSelector);
    if ($existingModal.length) {
        $existingModal.modal('hide');
        $existingModal.remove();
    }

    $('.modal-backdrop').remove();
    if ($('.modal.in').length === 0) {
        $('body').removeClass('modal-open').css('padding-right', '');
    }
}

function renderPropertiesForm(panel, entity, formConfig) {
    if (!formConfig || !formConfig.objectsUIFormConfig) return;

    var html = '<div class=\"row\">';
    formConfig.objectsUIFormConfig.forEach(function (obj) {
        var isCheckbox = obj.tipo === "checkbox";
        var isSelect = obj.contentType === "select";
        var isDiv = obj.contentType === "div";
        var value = entity[obj.campo] || "";
        if (isCheckbox) value = !!entity[obj.campo];
        var panelColSize = 12;

        html += '<div class=\"col-md-' + panelColSize + '\" style=\"margin-bottom:0.5em;\">';
        html += '  <div class=\"form-group\">';
        html += '    <label>' + obj.titulo + '</label>';

        var commonAttrs = ' data-field=\"' + obj.campo + '\" class=\"' + (obj.classes || '') + '\" ';
        var style = obj.style ? ' style=\"' + obj.style + '\" ' : '';

        if (isCheckbox) {
            html += '    <div style=\"padding-top: 7px;\">';
            html += '      <input type=\"checkbox\" ' + commonAttrs + (value ? 'checked' : '') + ' />';
            html += '    </div>';
        } else if (isSelect) {
            html += '    <select ' + commonAttrs + style + '>';
            html += '      <option value=\"\">-- Selecione --</option>';
            (obj.selectValues || []).forEach(function (opt) {
                var optVal = opt[obj.fieldToValue];
                var optLabel = opt[obj.fieldToOption];
                var selected = value == optVal ? 'selected' : '';
                html += '      <option value=\"' + optVal + '\" ' + selected + '>' + optLabel + '</option>';
            });
            html += '    </select>';
        } else if (isDiv) {
            // Usa DIV para compatibilidade com ACE editor
            html += '    <div ' + commonAttrs + style + '>' + (value || '') + '</div>';
        } else {
            html += '    <input type=\"' + obj.tipo + '\" ' + commonAttrs + style + ' value=\"' + value + '\" />';
        }

        html += '  </div>';
        html += '</div>';
    });
    html += '</div>';

    panel.html(html);

    // Bind events
    panel.find('[data-field]').on('change keyup', function () {
        var field = $(this).data('field');
        var val;
        if (this.type === 'checkbox') {
            val = this.checked;
        } else {
            val = $(this).val();
        }
        entity[field] = val;
        if (typeof realTimeComponentSync === "function") {
            realTimeComponentSync(entity, entity.table, entity.idfield);
        }
        var isContainerItemEntity = !!entity.mdashcontaineritemstamp;
        if (isContainerItemEntity && (field === 'templatelayout' || field === 'tamanho' || field === 'titulo')) {
            renderContainerItemTemplate(entity);
        }
        if (field === 'tamanho' || field === 'gridrow' || field === 'gridcolstart' || field === 'gridcolspan' || field === 'layoutmode') {
            if (isContainerItemEntity && field === 'tamanho' && (!entity.gridcolspan || parseInt(entity.gridcolspan, 10) < 1)) {
                entity.gridcolspan = parseInt(entity.tamanho, 10) || 4;
            }
            setTimeout(syncAllContainerItemsLayout, 0);
        }
    });

    // Inicializa ACE para campos de expressão
    handleCodeEditor();
}

// ============================================================================
// MÓDULO DE FILTROS - UI MODERNA
// ============================================================================

/**
 * Retorna o ícone do tipo de objeto
 */
function getObjectTypeIcon(tipo) {
    var icons = {
        'chart': 'glyphicon glyphicon-stats',
        'table': 'glyphicon glyphicon-th',
        'card': 'glyphicon glyphicon-credit-card',
        'text': 'glyphicon glyphicon-font',
        'image': 'glyphicon glyphicon-picture'
    };
    return icons[tipo] || 'glyphicon glyphicon-stop';
}

// ============================================================================
// MÓDULO DE CONTAINERS
// ============================================================================

/**
 * Adiciona um novo container
 */
function addNewContainer() {
    var newContainer = new MdashContainer({
        dashboardstamp: GMDashStamp
    });

    // Adiciona ao estado reativo
    window.appState.containers.push(newContainer);

    // Abre modal de edição
    openContainerEditModal(newContainer);
}

/**
 * Edita um container existente
 */
function editContainer(containerStamp) {
    var container = GMDashContainers.find(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (!container) {
        alertify.error('Container não encontrado');
        return;
    }

    openContainerEditModal(container);
}

/**
 * Abre modal de edição de container
 */
function openContainerEditModal(container) {
    // Remove modal se já existir e limpa estado órfão do Bootstrap
    resetModalOpenState('#mdash-container-edit-modal');

    // Obtém a configuração do formulário
    var formConfig = getContainerUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    // Gera o HTML do formulário dinamicamente
    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isCheckbox = obj.tipo === "checkbox";
        var currentValue = container[obj.campo] || '';
        if (isCheckbox) {
            currentValue = container[obj.campo] || false;
        }

        var fieldClasses = obj.classes + " mdashconfig-item-input";
        var customData = obj.customData || '';
        customData += " v-model='mdashContainerItem." + obj.campo + "' @change='handleChangeContainer'";

        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
            formHtml += '    </div>';
        } else {
            formHtml += '    <input type="' + obj.tipo + '" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    // Monta o modal
    var containerModalTitle = buildModalEntityTitle("Container", container.titulo || container.codigo || "");
    var modalHtml = '<div class="modal fade" id="mdash-container-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-th-large"></i> ' + containerModalTitle;
    modalHtml += '        </h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <form id="mdash-container-edit-form">';
    modalHtml += formHtml;
    modalHtml += '        </form>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" onclick="saveContainerFromModal()">Guardar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    // Inicializa PetiteVue
    PetiteVue.createApp({
        mdashContainerItem: container,
        handleChangeContainer: function () {
            realTimeComponentSync(this.mdashContainerItem, this.mdashContainerItem.table, this.mdashContainerItem.idfield);
        }
    }).mount('#mdash-container-edit-modal');

    $('#mdash-container-edit-modal').modal('show');
}

/**
 * Guarda container e fecha modal
 */
function saveContainerFromModal() {
    $('#mdash-container-edit-modal').modal('hide');
    alertify.success('Container guardado com sucesso!');
}

/**
 * Elimina um container
 */
function deleteContainer(containerStamp) {
    var container = GMDashContainers.find(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (!container) {
        alertify.error('Container não encontrado');
        return;
    }

    if (!confirm('Tem a certeza que deseja eliminar o container "' + container.titulo + '"?\nTodos os items e objetos serão eliminados também.')) {
        return;
    }

    // Remove items do container
    var items = GMDashContainerItems.filter(function (item) {
        return item.mdashcontainerstamp === containerStamp;
    });

    items.forEach(function (item) {
        deleteContainerItem(item.mdashcontaineritemstamp, true);
    });

    // Remove do estado reativo
    var index = window.appState.containers.indexOf(container);
    if (index > -1) {
        window.appState.containers.splice(index, 1);
    }

    // Adiciona ao array de registos a eliminar
    GMdashDeleteRecords.push({
        table: "MdashContainer",
        stamp: containerStamp,
        tableKey: "mdashcontainerstamp"
    });

    alertify.success('Container eliminado com sucesso!');
}

/**
 * Move um container para cima/baixo e normaliza ordem
 */
function moveContainer(containerStamp, direction) {
    if (!window.appState || !Array.isArray(window.appState.containers)) return;

    var ordered = window.appState.containers.slice().sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    var currentIndex = ordered.findIndex(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (currentIndex === -1) return;

    var targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    var temp = ordered[currentIndex];
    ordered[currentIndex] = ordered[targetIndex];
    ordered[targetIndex] = temp;

    ordered.forEach(function (container, idx) {
        container.ordem = idx + 1;
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(container, container.table, container.idfield);
        }
    });
}

/**
 * Adiciona um item a um container
 */
function addContainerItem(containerStamp) {
    var newItem = new MdashContainerItem({
        mdashcontainerstamp: containerStamp,
        dashboardstamp: GMDashStamp
    });

    // Adiciona ao estado reativo
    window.appState.containerItems.push(newItem);

    openContainerItemEditModal(newItem);
}

/**
 * Edita um container item
 */
function editContainerItem(itemStamp) {
    var item = GMDashContainerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });

    if (!item) {
        alertify.error('Item não encontrado');
        return;
    }

    openContainerItemEditModal(item);
}

/**
 * Abre modal de edição de container item
 */
function openContainerItemEditModal(item) {
    resetModalOpenState('#mdash-item-edit-modal');

    var itemModalTitle = buildModalEntityTitle("Container Item", item.titulo || item.codigo || "");

    var formConfig = getContainerItemUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isCheckbox = obj.tipo === 'checkbox';
        var isSelect = obj.contentType === 'select';
        var isDiv = obj.contentType === 'div';

        var currentValue = item[obj.campo] || '';
        if (isCheckbox) currentValue = item[obj.campo] || false;

        var fieldClasses = obj.classes + ' mdashconfig-item-input';
        var customData = obj.customData || '';

        if (isDiv) {
            customData += ' v-on:keyup="changeDivContent(\"' + obj.campo + '\")';
        } else {
            customData += " v-model='mdashItemData." + obj.campo + "' @change='handleChange'";
        }

        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        if (obj.contentType === 'input' && !isCheckbox) {
            formHtml += '    <input type="' + obj.tipo + '" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
        } else if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
            formHtml += '    </div>';
        } else if (isSelect) {
            formHtml += '    <select id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + '>';
            formHtml += '      <option value="">-- Selecione --</option>';
            (obj.selectValues || []).forEach(function (opt) {
                formHtml += '      <option value="' + opt[obj.fieldToValue] + '">' + opt[obj.fieldToOption] + '</option>';
            });
            formHtml += '    </select>';
        } else if (isDiv) {
            formHtml += '    <div id="' + obj.campo + '" class="' + fieldClasses + '" style="' + (obj.style || 'width:100%;height:200px;') + '">' + currentValue + '</div>';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    var modalHtml = '<div class="modal fade" id="mdash-item-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-list-alt"></i> ' + itemModalTitle + '</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body"><form id="mdash-item-edit-form">' + formHtml + '</form></div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    PetiteVue.createApp({
        mdashItemData: item,
        handleChange: function () {
            realTimeComponentSync(this.mdashItemData, this.mdashItemData.table, this.mdashItemData.idfield);
            renderContainerItemTemplate(this.mdashItemData);
        }
    }).mount('#mdash-item-edit-modal');

    $('#mdash-item-edit-modal').modal('show');

    $('#mdash-item-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
    });
}

/**
 * Elimina um container item
 */
function deleteContainerItem(itemStamp, silent) {
    var item = GMDashContainerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });

    if (!item) return;

    // Remove objetos do item
    var objects = GMDashContainerItemObjects.filter(function (obj) {
        return obj.mdashcontaineritemstamp === itemStamp;
    });

    objects.forEach(function (obj) {
        var objIndex = GMDashContainerItemObjects.indexOf(obj);
        if (objIndex > -1) {
            GMDashContainerItemObjects.splice(objIndex, 1);
        }
        GMdashDeleteRecords.push({
            table: "MdashContainerItemObject",
            stamp: obj.mdashcontaineritemobjectstamp,
            tableKey: "mdashcontaineritemobjectstamp"
        });
    });

    // Remove item
    var index = GMDashContainerItems.indexOf(item);
    if (index > -1) {
        GMDashContainerItems.splice(index, 1);
    }

    GMdashDeleteRecords.push({
        table: "MdashContainerItem",
        stamp: itemStamp,
        tableKey: "mdashcontaineritemstamp"
    });

    if (!silent) {
        alertify.success('Item eliminado com sucesso!');
    }
}

/**
 * Adiciona um novo objeto a um container item
 */
function addContainerItemObject(itemStamp) {
    var newObj = new MdashContainerItemObject({
        mdashcontaineritemstamp: itemStamp,
        dashboardstamp: GMDashStamp
    });
    window.appState.containerItemObjects.push(newObj);
    openContainerItemObjectEditModal(newObj);
}

/**
 * Edita um objeto de container item
 */
function editContainerItemObject(objectStamp) {
    var obj = GMDashContainerItemObjects.find(function (o) {
        return o.mdashcontaineritemobjectstamp === objectStamp;
    });
    if (!obj) {
        alertify.error('Objeto não encontrado');
        return;
    }
    openContainerItemObjectEditModal(obj);
}

/**
 * Abre modal de edição/criação de objeto
 */
function openContainerItemObjectEditModal(obj) {
    resetModalOpenState('#mdash-object-edit-modal');

    var objectModalTitle = buildModalEntityTitle("Objeto", obj.titulo || obj.expressaoobjecto || "");

    var tipoOptions = [
        { value: 'chart', label: 'Gráfico' },
        { value: 'table', label: 'Tabela' },
        { value: 'card', label: 'Card / KPI' },
        { value: 'text', label: 'Texto' },
        { value: 'image', label: 'Imagem' }
    ];

    var tipoSelectHtml = tipoOptions.map(function (t) {
        return '<option value="' + t.value + '">' + t.label + '</option>';
    }).join('');

    var fonteSelectHtml = (GMDashFontes || []).map(function (f) {
        return '<option value="' + f.mdashfontestamp + '">' + (f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
    }).join('');

    if (!obj.queryConfig) obj.queryConfig = { datasource: '', query: '', parameters: '' };
    var queryVal = obj.queryConfig.query || '';

    var modalHtml = '<div class="modal fade" id="mdash-object-edit-modal" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header">';
    modalHtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="glyphicon glyphicon-stop"></i> ' + objectModalTitle + '</h4>';
    modalHtml += '</div>';
    modalHtml += '<div class="modal-body"><div class="row">';
    modalHtml += '<div class="col-md-4"><div class="form-group"><label>Tipo</label>';
    modalHtml += '<select class="form-control" v-model="objData.tipo" @change="handleChange"><option value="">-- Selecione --</option>' + tipoSelectHtml + '</select>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="col-md-8"><div class="form-group"><label>Título</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.titulo" @change="handleChange" /></div></div>';
    modalHtml += '<div class="col-md-12"><div class="form-group"><label>Expressão / Identificador</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.expressaoobjecto" @change="handleChange" placeholder="Ex: vendas_total, chart_mensal..." /></div></div>';
    modalHtml += '<div class="col-md-6"><div class="form-group"><label>Fonte de Dados</label>';
    modalHtml += '<select class="form-control" v-model="objData.queryConfig.datasource" @change="handleChange"><option value="">-- Sem fonte --</option>' + fonteSelectHtml + '</select>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="col-md-6"><div class="form-group"><label>Parâmetros (JSON)</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.queryConfig.parameters" @change="handleChange" placeholder=\'{}\' /></div></div>';
    modalHtml += '<div class="col-md-12"><div class="form-group"><label>Query SQL</label>';
    modalHtml += '<div id="mdash-obj-query-editor" class="m-editor" style="width:100%;height:180px;">' + queryVal + '</div>';
    modalHtml += '</div></div>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="modal-footer">';
    modalHtml += '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '</div></div></div></div>';

    $('body').append(modalHtml);

    PetiteVue.createApp({
        objData: obj,
        handleChange: function () {
            realTimeComponentSync(this.objData, this.objData.table, this.objData.idfield);
        }
    }).mount('#mdash-object-edit-modal');

    $('#mdash-object-edit-modal').modal('show');

    $('#mdash-object-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
        var editorEl = document.getElementById('mdash-obj-query-editor');
        if (editorEl && typeof ace !== 'undefined') {
            var aceEd = ace.edit('mdash-obj-query-editor');
            aceEd.on('change', function () {
                obj.queryConfig.query = aceEd.getValue();
                realTimeComponentSync(obj, obj.table, obj.idfield);
            });
        }
    });
}

// ============================================================================
// MÓDULO DE FONTES
// ============================================================================

/**
 * Renderiza a lista de fontes na sidebar
 */
function renderFontesList() {
    var container = $('#fontes-list');
    container.empty();

    if (!GMDashFontes || GMDashFontes.length === 0) {
        container.html('<p class="text-muted text-center" style="margin-top: 10px;"><small>Nenhuma fonte</small></p>');
        return;
    }

    GMDashFontes.forEach(function (fonte) {
        if (!fonte.mdashfontestamp) return;

        var fonteItem = '<div class="mdash-sidebar-item" data-stamp="' + fonte.mdashfontestamp + '">';
        fonteItem += '  <div class="mdash-sidebar-item-content" onclick="editFonte(\'' + fonte.mdashfontestamp + '\')">';
        fonteItem += '    <i class="glyphicon glyphicon-oil"></i>';
        fonteItem += '    <span>' + (fonte.descricao || fonte.codigo || 'Sem nome') + '</span>';
        fonteItem += '  </div>';
        fonteItem += '  <div class="mdash-sidebar-item-actions">';
        fonteItem += '    <button type="button" onclick="deleteFonte(\'' + fonte.mdashfontestamp + '\'); event.stopPropagation();" class="btn btn-xs btn-danger">';
        fonteItem += '      <i class="glyphicon glyphicon-trash"></i>';
        fonteItem += '    </button>';
        fonteItem += '  </div>';
        fonteItem += '</div>';

        container.append(fonteItem);
    });
}

/**
 * Adiciona uma nova fonte
 */
function addNewFonte() {
    var newFonte = new MDashFonte({
        dashboardstamp: GMDashStamp
    });
    window.appState.fontes.push(newFonte);
    openFonteEditModal(newFonte);
}

/**
 * Edita uma fonte
 */
function editFonte(fonteStamp) {
    var fonte = GMDashFontes.find(function (f) {
        return f.mdashfontestamp === fonteStamp;
    });
    if (!fonte) {
        alertify.error('Fonte não encontrada');
        return;
    }
    openFonteEditModal(fonte);
}

/**
 * Abre modal de edição/criação de fonte de dados
 */
function openFonteEditModal(fonte) {
    resetModalOpenState('#mdash-fonte-edit-modal');

    var fonteModalTitle = buildModalEntityTitle("Fonte", fonte.descricao || fonte.codigo || "");

    var tipoFonteOptions = [
        { value: 'cscript', label: 'CScript PHC CS Web' },
        { value: 'ajax', label: 'AJAX genérico' },
        { value: 'static', label: 'Dados estáticos' }
    ];

    var tipoFonteHtml = tipoFonteOptions.map(function (t) {
        return '<option value="' + t.value + '">' + t.label + '</option>';
    }).join('');

    var queryVal = fonte.query || '';

    var modalHtml = '<div class="modal fade" id="mdash-fonte-edit-modal" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header">';
    modalHtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="glyphicon glyphicon-oil"></i> ' + fonteModalTitle + '</h4>';
    modalHtml += '</div>';
    modalHtml += '<div class="modal-body"><div class="row">';
    modalHtml += '<div class="col-md-3"><div class="form-group"><label>Código</label>';
    modalHtml += '<input type="text" class="form-control" v-model="fonteData.codigo" @change="handleChange" /></div></div>';
    modalHtml += '<div class="col-md-9"><div class="form-group"><label>Descrição</label>';
    modalHtml += '<input type="text" class="form-control" v-model="fonteData.descricao" @change="handleChange" /></div></div>';
    modalHtml += '<div class="col-md-4"><div class="form-group"><label>Tipo de Fonte</label>';
    modalHtml += '<select class="form-control" v-model="fonteData.tipofonte" @change="handleChange"><option value="">-- Selecione --</option>' + tipoFonteHtml + '</select>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="col-md-8"><div class="form-group"><label>Parâmetros</label>';
    modalHtml += '<input type="text" class="form-control" v-model="fonteData.parametros" @change="handleChange" placeholder=\'{}\' /></div></div>';
    modalHtml += '<div class="col-md-12"><div class="form-group"><label>Query / Endpoint CScript</label>';
    modalHtml += '<div id="mdash-fonte-query-editor" class="m-editor" style="width:100%;height:180px;">' + queryVal + '</div>';
    modalHtml += '</div></div>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="modal-footer">';
    modalHtml += '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '</div></div></div></div>';

    $('body').append(modalHtml);

    PetiteVue.createApp({
        fonteData: fonte,
        handleChange: function () {
            realTimeComponentSync(this.fonteData, this.fonteData.table, this.fonteData.idfield);
        }
    }).mount('#mdash-fonte-edit-modal');

    $('#mdash-fonte-edit-modal').modal('show');

    $('#mdash-fonte-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
        var editorEl = document.getElementById('mdash-fonte-query-editor');
        if (editorEl && typeof ace !== 'undefined') {
            var aceEd = ace.edit('mdash-fonte-query-editor');
            aceEd.on('change', function () {
                fonte.query = aceEd.getValue();
                realTimeComponentSync(fonte, fonte.table, fonte.idfield);
            });
        }
    });
}

/**
 * Elimina uma fonte
 */
function deleteFonte(fonteStamp) {
    var fonte = GMDashFontes.find(function (f) {
        return f.mdashfontestamp === fonteStamp;
    });

    if (!fonte) {
        alertify.error('Fonte não encontrada');
        return;
    }

    if (!confirm('Tem a certeza que deseja eliminar a fonte "' + fonte.descricao + '"?')) {
        return;
    }

    // Remove do estado reativo
    var index = window.appState.fontes.indexOf(fonte);
    if (index > -1) {
        window.appState.fontes.splice(index, 1);
    }

    GMdashDeleteRecords.push({
        table: "MDashFonte",
        stamp: fonteStamp,
        tableKey: "mdashfontestamp"
    });

    alertify.success('Fonte eliminada com sucesso!');
}

/**
 * Retorna o label do tipo de filtro
 */
function getFilterTypeLabel(tipo) {
    var tipos = {
        'text': 'Texto',
        'radio': 'Radio',
        'logic': 'Lógico',
        'date': 'Data',
        'number': 'Número',
        'list': 'Lista',
        'multiselect': 'Múltipla escolha'
    };
    return tipos[tipo] || tipo || 'Não definido';
}

/**
 * Retorna o ícone do tipo de filtro
 */
function getFilterTypeIcon(tipo) {
    var icons = {
        'text': 'glyphicon glyphicon-font',
        'radio': 'glyphicon glyphicon-record',
        'logic': 'glyphicon glyphicon-check',
        'date': 'glyphicon glyphicon-calendar',
        'number': 'glyphicon glyphicon-plus',
        'list': 'glyphicon glyphicon-list',
        'multiselect': 'glyphicon glyphicon-th-list'
    };
    return icons[tipo] || 'glyphicon glyphicon-filter';
}

/**
 * Adiciona um novo filtro
 */
function addNewFilter() {
    var newFilter = new MdashFilter({
        dashboardstamp: GMDashStamp
    });

    // Adiciona ao estado reativo
    window.appState.filters.push(newFilter);

    // Abre modal de edição
    openFilterEditModal(newFilter);
}

/**
 * Edita um filtro existente
 */
function editFilter(filterStamp) {
    var filter = GMDashFilters.find(function (f) {
        return f.mdashfilterstamp === filterStamp;
    });

    if (!filter) {
        alertify.error('Filtro não encontrado');
        return;
    }

    openFilterEditModal(filter);
}

function openFiltersManagerModal() {
    resetModalOpenState('#mdash-filters-manager-modal');

    var filters = (window.appState && window.appState.filters ? window.appState.filters : GMDashFilters).slice();
    filters.sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    var listHtml = '';
    if (!filters.length) {
        listHtml = '<p class="text-muted text-center" style="margin: 10px 0 0;"><small>Nenhum filtro configurado</small></p>';
    } else {
        filters.forEach(function (filter) {
            var filterTitle = filter.descricao || filter.codigo || 'Sem nome';
            listHtml += '<div class="mdash-filter-manager-row">';
            listHtml += '  <div class="mdash-filter-manager-main">';
            listHtml += '    <div class="mdash-filter-manager-title">' + filterTitle + '</div>';
            listHtml += '    <div class="mdash-filter-manager-meta">' + (getFilterTypeLabel(filter.tipo) || '') + ' • Ordem ' + (filter.ordem || 0) + '</div>';
            listHtml += '  </div>';
            listHtml += '  <div class="mdash-filter-manager-actions">';
            listHtml += '    <button type="button" class="btn btn-xs btn-default" onclick="$(\'#mdash-filters-manager-modal\').modal(\'hide\'); editFilter(\'' + filter.mdashfilterstamp + '\');" title="Editar">';
            listHtml += '      <i class="glyphicon glyphicon-cog"></i>';
            listHtml += '    </button>';
            listHtml += '    <button type="button" class="btn btn-xs btn-danger" onclick="deleteFilter(\'' + filter.mdashfilterstamp + '\'); openFiltersManagerModal();" title="Eliminar">';
            listHtml += '      <i class="glyphicon glyphicon-trash"></i>';
            listHtml += '    </button>';
            listHtml += '  </div>';
            listHtml += '</div>';
        });
    }

    var modalHtml = '<div class="modal fade" id="mdash-filters-manager-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-filter"></i> Gestão de Filtros</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <div style="margin-bottom:10px;text-align:right;">';
    modalHtml += '          <button type="button" class="btn btn-primary btn-sm" onclick="$(\'#mdash-filters-manager-modal\').modal(\'hide\'); addNewFilter();">';
    modalHtml += '            <i class="glyphicon glyphicon-plus"></i> Novo Filtro';
    modalHtml += '          </button>';
    modalHtml += '        </div>';
    modalHtml += '        <div class="mdash-filter-manager-list">' + listHtml + '</div>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);
    $('#mdash-filters-manager-modal').modal('show');
}

/**
 * Abre modal de edição de filtro usando UIObjectFormConfig (abordagem original)
 */
function openFilterEditModal(filter) {
    // Remove modal se já existir e limpa estado órfão do Bootstrap (ex.: duplo clique)
    resetModalOpenState('#mdash-filter-edit-modal');

    // Obtém a configuração do formulário (UIObjectFormConfig)
    var formConfig = getMdashFilterUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    // Gera o HTML do formulário dinamicamente
    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isDiv = obj.contentType === "div";
        var isCheckbox = obj.tipo === "checkbox";
        var isSelect = obj.contentType === "select";

        // Valor atual do campo
        var currentValue = filter[obj.campo] || '';
        if (isCheckbox) {
            currentValue = filter[obj.campo] || false;
        }

        // Classes do campo
        var fieldClasses = obj.classes + " mdashconfig-item-input";

        // Custom data para v-model
        var customData = obj.customData || '';
        customData += " v-model='mdashFilterItem." + obj.campo + "'";

        if (isDiv) {
            customData += " v-on:keyup='changeDivContent(\"" + obj.campo + "\")'";
        } else {
            customData += " @change='handleChangeFilter'";
        }

        // Wrapper da coluna
        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        // Input normal
        if (obj.contentType === "input" && !isCheckbox) {
            formHtml += '    <input type="' + obj.tipo + '" ';
            formHtml += '           id="' + obj.campo + '" ';
            formHtml += '           class="' + fieldClasses + '" ';
            formHtml += '           ' + customData + ' />';
        }
        // Checkbox
        else if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" ';
            formHtml += '             id="' + obj.campo + '" ';
            formHtml += '             class="' + fieldClasses + '" ';
            formHtml += '             ' + customData + ' />';
            formHtml += '    </div>';
        }
        // Select
        else if (isSelect) {
            formHtml += '    <select id="' + obj.campo + '" ';
            formHtml += '            class="' + fieldClasses + '" ';
            formHtml += '            ' + customData + '>';
            formHtml += '      <option value="">-- Selecione --</option>';

            obj.selectValues.forEach(function (selectOption) {
                var optionValue = selectOption[obj.fieldToValue];
                var optionLabel = selectOption[obj.fieldToOption];
                formHtml += '      <option value="' + optionValue + '">' + optionLabel + '</option>';
            });

            formHtml += '    </select>';
        }
        // Div (Editor de código)
        else if (isDiv) {
            formHtml += '    <div id="' + obj.campo + '" ';
            formHtml += '         class="' + fieldClasses + '" ';
            formHtml += '         style="' + (obj.style || 'width: 100%; height: 200px;') + '">';
            formHtml += currentValue;
            formHtml += '    </div>';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    // Monta o modal
    var filterModalTitle = buildModalEntityTitle("Filtro", filter.descricao || filter.codigo || "");
    var modalHtml = '<div class="modal fade" id="mdash-filter-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';

    // Header
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-filter"></i> ' + filterModalTitle;
    modalHtml += '        </h4>';
    modalHtml += '      </div>';

    // Body com formulário gerado
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <form id="mdash-filter-edit-form">';
    modalHtml += formHtml;
    modalHtml += '        </form>';
    modalHtml += '      </div>';

    // Footer
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" onclick="saveFilterFromModal()">Guardar</button>';
    modalHtml += '      </div>';

    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    // Inicializa PetiteVue para reatividade
    PetiteVue.createApp({
        mdashFilterItem: filter,

        handleChangeFilter: function () {
            // Sincronização em tempo real
            realTimeComponentSync(this.mdashFilterItem, this.mdashFilterItem.table, this.mdashFilterItem.idfield);
        },

        changeDivContent: function (campo) {
            // Atualiza o conteúdo do editor ACE
            var editor = ace.edit(campo);
            this.mdashFilterItem[campo] = editor.getValue();
            this.handleChangeFilter();
        }
    }).mount('#mdash-filter-edit-modal');

    $('#mdash-filter-edit-modal').modal('show');

    // Inicializa editores de código ACE após o modal estar visível
    $('#mdash-filter-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
    });
}

/**
 * Callback quando o tipo de filtro muda
 */
function onFilterTypeChange() {
    // Não precisa mais - a reatividade do PetiteVue cuida disso
}

/**
 * Callback quando checkbox "Tem evento change" é alterado
 */
function onEventoChangeToggle() {
    // Não precisa mais - a reatividade do PetiteVue cuida disso
}

/**
 * Guarda as alterações do filtro (chamado pelo botão Guardar)
 */
function saveFilterFromModal() {
    // Fecha modal
    $('#mdash-filter-edit-modal').modal('hide');

    // Alertify
    alertify.success('Filtro guardado com sucesso!');
}

/**
 * Elimina um filtro
 */
function deleteFilter(filterStamp) {
    var filter = GMDashFilters.find(function (f) {
        return f.mdashfilterstamp === filterStamp;
    });

    if (!filter) {
        alertify.error('Filtro não encontrado');
        return;
    }

    if (!confirm('Tem a certeza que deseja eliminar o filtro "' + filter.descricao + '"?')) {
        return;
    }

    // Remove do estado reativo
    var index = window.appState.filters.indexOf(filter);
    if (index > -1) {
        window.appState.filters.splice(index, 1);
    }

    // Adiciona ao array de registos a eliminar
    GMdashDeleteRecords.push({
        table: "MdashFilter",
        stamp: filterStamp,
        tableKey: "mdashfilterstamp"
    });

    alertify.success('Filtro eliminado com sucesso!');
}

/**
 * Carrega os estilos modernos para todo o dashboard
 */
function loadModernDashboardStyles() {
    var styles = "";
    var primaryColor = getColorByType("primary").background;
    var primaryRgb = hexToRgb(primaryColor);
    //var primaryRgb = hexToRgb(primaryColor);
    var styleVersion = "2026.04.01-refactor";

    // Evita estilos duplicados quando a UI é reinicializada
    $('#mdash-modern-styles').remove();
    // Remove estilos antigos/duplicados injetados sem id por outras cópias do módulo
    $('style').filter(function () {
        if (this.id === 'mdash-modern-styles') return false;
        var cssText = this.textContent || '';
        return cssText.indexOf('.mdash-modern-layout') !== -1 || cssText.indexOf('.mdash-editor-wrapper') !== -1;
    }).remove();

    // ===== TOKENS =====
    styles += ".mdash-editor-wrapper { --md-primary: " + primaryColor + "; --md-primary-rgb: " + primaryRgb + "; --md-surface: #ffffff; --md-bg: #f3f6fb; --md-text: #1f2937; --md-muted: #64748b; --md-border: rgba(15,23,42,0.08); display: flex; flex-direction: column; height: calc(100vh - 60px); background: radial-gradient(circle at 10% -10%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 34%), radial-gradient(circle at 110% 120%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 32%), var(--md-bg); }";

    // ===== TOP TOOLBAR =====
    styles += ".mdash-top-toolbar { height: 54px; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.96), #101828 88%); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.18); flex-shrink: 0; box-shadow: 0 8px 24px rgba(2,6,23,0.18); }";
    styles += ".mdash-top-toolbar-brand { color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.2px; }";
    styles += ".mdash-top-toolbar-brand i { color: #fff; opacity: 0.95; }";
    styles += ".mdash-top-toolbar-actions { display: flex; align-items: center; gap: 8px; }";

    // ===== MAIN LAYOUT =====
    styles += ".mdash-modern-layout { display: flex; flex: 1; overflow: hidden; gap: 8px; padding: 8px; }";

    // ===== SIDEBAR =====
    styles += ".mdash-sidebar { width: 248px; min-width: 248px; background: linear-gradient(180deg, rgba(var(--md-primary-rgb),0.96), rgba(var(--md-primary-rgb),0.84)); border: 1px solid rgba(255,255,255,0.16); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 32px rgba(2,6,23,0.18); backdrop-filter: blur(8px); transition: width 0.22s ease, min-width 0.22s ease; }";
    styles += ".mdash-sidebar-header { position: relative; min-height: 50px; padding: 12px 38px 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.18); background: transparent; color: #fff; display: flex; align-items: center; }";
    styles += ".mdash-sidebar-header h4 { margin: 0; font-size: 22px; font-weight: 800; display:flex; align-items:center; gap:8px; line-height: 1; opacity:0.98; }";
    styles += ".mdash-sidebar-header h4 i { width: 20px; text-align: center; line-height: 1; }";
    styles += ".mdash-panel-toggle { width: 22px; height: 22px; padding: 0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transform: translateY(-50%); }";
    styles += ".mdash-panel-toggle i { font-size: 10px; line-height: 1; }";
    styles += ".mdash-sidebar-toggle { position: absolute; top: 50%; right: 8px; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.16); color: #fff; }";
    styles += ".mdash-sidebar-toggle:hover { background: rgba(255,255,255,0.26); color: #fff; border-color: rgba(255,255,255,0.7); }";
    styles += ".mdash-sidebar-header i, .mdash-sidebar-rail-actions .btn i, .mdash-properties-header i, .mdash-properties-rail-actions .btn i { animation: none !important; transition: none !important; transform: none !important; }";
    styles += ".mdash-sidebar-body { flex: 1; overflow-y: auto; padding: 10px; background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.96)); }";
    styles += ".mdash-sidebar-rail-actions { display: none; padding: 8px 6px; gap: 8px; flex-direction: column; align-items: center; border-top: 1px solid rgba(255,255,255,0.2); }";
    styles += ".mdash-sidebar-rail-actions .btn { width: 36px; min-width: 36px; height: 36px; padding: 0; border-radius: 10px; border-color: rgba(255,255,255,0.42); color: var(--md-primary); background: rgba(255,255,255,0.96); display: inline-flex; align-items: center; justify-content: center; line-height: 1; }";
    styles += ".mdash-sidebar-rail-actions .btn i { color: var(--md-primary); font-size: 14px; line-height: 1; }";
    styles += ".mdash-sidebar-rail-actions .btn:hover { background: #fff; border-color: rgba(var(--md-primary-rgb),0.58); color: var(--md-primary); box-shadow: 0 4px 10px rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-sidebar-rail-actions .btn:focus { outline: none; box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-sidebar.is-collapsed { width: 56px; min-width: 56px; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-body { display: none; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-rail-actions { display: flex; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header { min-height: 40px; padding: 8px 24px 8px 8px; display:flex; justify-content:center; align-items:center; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header h4 { margin: 0; width: 20px; height: 20px; padding: 0; border: none; background: transparent; border-radius: 0; display: flex; justify-content: center; align-items: center; gap: 0; font-size: 0; line-height: 0; color: transparent; overflow: hidden; box-shadow: none; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header h4 i { display: flex; flex: 0 0 20px; width: 20px; height: 20px; align-items: center; justify-content: center; text-align: center; font-size: 20px; margin: 0; color: #fff; line-height: 1; opacity: 0.98; position: static; left: auto; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-toggle { top: 50%; right: 4px; width: 18px; height: 18px; border-radius: 5px; }";

    // ===== WIDGET PALETTE =====
    styles += ".mdash-widget-section { padding: 2px 0 8px; }";
    styles += ".mdash-section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--md-primary); margin: 0 0 10px 2px; }";
    styles += ".mdash-widget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }";
    styles += ".mdash-widget-tile { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 76px; padding: 12px 8px; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.28); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; font-size: 12px; font-weight: 700; color: var(--md-primary); text-align: center; user-select: none; margin: 0; box-sizing: border-box; box-shadow: 0 4px 14px rgba(2,6,23,0.06); }";
    styles += ".mdash-widget-grid .mdash-widget-tile.mdash-toolbox-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 76px; padding: 12px 8px; border-radius: 12px; margin: 0; }";
    styles += ".mdash-widget-tile i { font-size: 22px; color: var(--md-primary); }";
    styles += ".mdash-widget-tile:hover { transform: translateY(-2px); border-color: var(--md-primary); box-shadow: 0 8px 20px rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-widget-tile:active { transform: translateY(0); }";
    styles += ".mdash-sidebar-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--md-primary-rgb),0.35), transparent); margin: 8px 0 12px; }";

    // ===== ACCORDION / LISTS =====
    styles += "#mdash-accordion .panel { margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--md-border); box-shadow: 0 6px 16px rgba(2,6,23,0.06); overflow: hidden; }";
    styles += "#mdash-accordion .panel-heading { background: linear-gradient(180deg, #ffffff, #f8fafc); border-bottom: 1px solid var(--md-border); cursor: pointer; padding: 12px 14px; transition: all 0.2s; }";
    styles += "#mdash-accordion .panel-title { font-size: 14px; font-weight: 700; color: var(--md-text); margin: 0; display: flex; align-items: center; justify-content: space-between; }";
    styles += "#mdash-accordion .panel-title i { margin-right: 8px; color: var(--md-primary); }";
    styles += "#mdash-accordion .panel-title .badge { background: var(--md-primary); font-size: 11px; }";
    styles += "#mdash-accordion .panel-body { padding: 10px; }";
    styles += ".mdash-sidebar-list { margin-top: 10px; }";
    styles += ".mdash-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 6px; background: #fff; border: 1px solid var(--md-border); border-radius: 8px; cursor: pointer; transition: all 0.2s; }";
    styles += ".mdash-sidebar-item:hover { border-color: rgba(var(--md-primary-rgb),0.45); transform: translateX(2px); }";
    styles += ".mdash-sidebar-item-content { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--md-text); }";
    styles += ".mdash-sidebar-item-content i { color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-sidebar-item-content .badge { margin-left: auto; background: var(--md-primary); font-size: 10px; }";
    styles += ".mdash-sidebar-item-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }";
    styles += ".mdash-sidebar-item:hover .mdash-sidebar-item-actions { opacity: 1; }";
    styles += ".mdash-filter-manager-list { max-height: 420px; overflow-y: auto; }";
    styles += ".mdash-filter-manager-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid var(--md-border); border-radius: 10px; background: #fff; margin-bottom: 8px; }";
    styles += ".mdash-filter-manager-row:last-child { margin-bottom: 0; }";
    styles += ".mdash-filter-manager-main { min-width: 0; }";
    styles += ".mdash-filter-manager-title { font-weight: 700; color: var(--md-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }";
    styles += ".mdash-filter-manager-meta { font-size: 11px; color: var(--md-muted); margin-top: 2px; }";
    styles += ".mdash-filter-manager-actions { display: flex; gap: 4px; flex-shrink: 0; }";

    // ===== CANVAS =====
    styles += ".mdash-canvas { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; border: 1px solid var(--md-border); background: var(--md-surface); box-shadow: 0 12px 28px rgba(2,6,23,0.08); }";
    styles += ".mdash-canvas-body { flex: 1; overflow-y: auto; padding: 14px; background-image: radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px); background-size: 18px 18px; background-position: -8px -8px; }";
    styles += ".mdash-canvas-commandbar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding: 10px 12px; margin-bottom: 12px; border:1px solid var(--md-border); border-radius: 12px; background: linear-gradient(180deg, #ffffff, #f8fafc); box-shadow: 0 6px 14px rgba(2,6,23,0.06); }";
    styles += ".mdash-commandbar-title { font-size: 14px; font-weight: 800; color: var(--md-text); display:flex; align-items:center; gap:8px; }";
    styles += ".mdash-commandbar-title i { color: var(--md-primary); }";
    styles += ".mdash-commandbar-actions { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }";

    // Canvas vazio
    styles += ".mdash-canvas-empty { text-align: center; padding: 80px 20px; color: var(--md-muted); border: 2px dashed rgba(var(--md-primary-rgb),0.28); border-radius: 12px; background: rgba(255,255,255,0.8); }";
    styles += ".mdash-canvas-empty i { font-size: 64px; color: var(--md-primary); margin-bottom: 20px; display: block; opacity: 0.45; }";
    styles += ".mdash-canvas-empty p { font-size: 16px; margin: 0; }";
    styles += ".mdash-drop-target { border: 2px dashed transparent; transition: border-color 0.2s, background 0.2s; }";
    styles += ".mdash-drop-hover { border-color: var(--md-primary) !important; background: rgba(var(--md-primary-rgb),0.07); }";
    styles += ".mdash-sort-placeholder { border: 2px dashed var(--md-primary); background: rgba(var(--md-primary-rgb),0.06); min-height: 60px; margin-bottom: 12px; border-radius:10px; }";

    // Container no canvas
    styles += ".mdash-canvas-container { position: relative; background: #ffffff; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 12px; padding: 12px; margin: 8px 0 14px; min-height: 0; transition: border-color 0.18s ease, box-shadow 0.18s ease; box-shadow: 0 6px 16px rgba(2,6,23,0.05); }";
    styles += ".mdash-canvas-container:hover { border-color: var(--md-primary); box-shadow: 0 10px 20px rgba(var(--md-primary-rgb),0.14); }";
    styles += ".mdash-canvas-container.is-selected { border-color: var(--md-primary); box-shadow: 0 0 0 3px rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-container-label { position: absolute; top: 8px; left: 12px; background: #fff; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); border-radius: 20px; border: 1px solid rgba(var(--md-primary-rgb),0.42); z-index: 1; }";
    styles += ".mdash-canvas-container-header { padding: 22px 0 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 6px; }";
    styles += ".mdash-container-drag-handle { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 6px; color: var(--md-primary); cursor: move; flex-shrink: 0; background: #fff; }";
    styles += ".mdash-container-drag-handle:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: var(--md-primary); }";
    styles += ".ui-sortable-helper.mdash-canvas-container { box-shadow: 0 16px 30px rgba(2,6,23,0.18); }";
    styles += ".mdash-canvas-container.is-dragging { transition: none !important; }";
    styles += ".mdash-canvas-container .mdash-container-drag-handle:active { cursor: grabbing; }";
    styles += ".mdash-canvas-container-body { padding: 4px 0 0 0; min-height: 0; }";

    // Item no canvas
    styles += ".mdash-container-items-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 14px; position: relative; }";
    styles += ".mdash-container-items-row.is-empty { min-height: 92px; align-content: start; }";
    styles += ".mdash-container-items-row.is-drop-over { outline: 2px dashed rgba(var(--md-primary-rgb),0.62); outline-offset: 3px; border-radius: 10px; background: rgba(var(--md-primary-rgb),0.04); }";
    styles += ".mdash-canvas-item { margin-bottom: 0; min-width: 0; }";
    styles += ".mdash-item-sort-placeholder { min-height: 96px; border: 2px dashed var(--md-primary); border-radius: 10px; background: rgba(var(--md-primary-rgb),0.10); box-sizing: border-box; }";
    styles += ".mdash-item-sort-placeholder.is-explicit-preview { position: relative; border-color: rgba(var(--md-primary-rgb),0.95); background: rgba(var(--md-primary-rgb),0.14); z-index: 2; }";
    styles += ".mdash-item-sort-placeholder.is-explicit-preview::after { content: attr(data-grid-label); position: absolute; top: 6px; right: 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); background: rgba(255,255,255,0.92); border: 1px solid rgba(var(--md-primary-rgb),0.36); border-radius: 999px; padding: 2px 8px; }";
    
    // ⭐ DRAG & DROP VISUAL FEEDBACK
    styles += ".mdash-canvas-container.mdash-drop-error .mdash-container-items-row { background-color: rgba(255, 0, 0, 0.08) !important; border: 2px dashed #d9534f !important; border-radius: 10px; position: relative; }";
    styles += ".mdash-canvas-container.mdash-drop-success .mdash-container-items-row { background-color: rgba(0, 255, 0, 0.04) !important; border: 2px dashed #5cb85c !important; border-radius: 10px; }";
    styles += ".mdash-canvas-container.mdash-drop-swap .mdash-container-items-row { background-color: rgba(0, 123, 255, 0.04) !important; border: 2px dashed #0275d8 !important; border-radius: 10px; }";
    styles += ".mdash-drop-error-overlay, .mdash-drop-success-overlay, .mdash-drop-swap-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: white; padding: 10px 18px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 10px; pointer-events: none; font-weight: 600; font-size: 13px; }";
    styles += ".mdash-drop-error-overlay { background: #d9534f; color: white; }";
    styles += ".mdash-drop-error-overlay i { font-size: 22px; }";
    styles += ".mdash-drop-success-overlay { background: #5cb85c; color: white; }";
    styles += ".mdash-drop-success-overlay i { font-size: 20px; }";
    styles += ".mdash-drop-swap-overlay { background: #0275d8; color: white; }";
    styles += ".mdash-drop-swap-overlay i { font-size: 20px; }";
    
    styles += ".mdash-item-drag-helper { opacity: 0.96; transform: none; box-shadow: 0 18px 32px rgba(2,6,23,0.30); border-radius: 10px; }";
    styles += ".ui-sortable-helper.mdash-canvas-item { z-index: 10050 !important; }";
    styles += ".mdash-canvas-item-card { position: relative; background: #fff; border: 1px solid var(--md-border); border-radius: 10px; padding: 10px 12px; min-height: 96px; box-shadow: 0 2px 8px rgba(2,6,23,0.06); }";
    styles += ".mdash-canvas-item-card { height: 100%; }";
    styles += ".mdash-item-resize-handle { position: absolute; top: 8px; width: 12px; height: calc(100% - 16px); border-radius: 8px; cursor: ew-resize; background: transparent; z-index: 8; touch-action: none; }";
    styles += ".mdash-item-resize-handle-left { left: -1px; }";
    styles += ".mdash-item-resize-handle-right { right: -1px; }";
    styles += ".mdash-item-resize-handle::before { content: ''; position: absolute; top: 50%; left: 50%; width: 3px; height: 26px; transform: translate(-50%, -50%); border-radius: 2px; background: rgba(var(--md-primary-rgb),0.42); transition: background 0.16s ease, height 0.16s ease, width 0.16s ease; }";
    styles += ".mdash-canvas-item:hover .mdash-item-resize-handle::before, .mdash-canvas-item.is-resizing .mdash-item-resize-handle::before { background: var(--md-primary); height: 32px; }";
    styles += "body.mdash-resize-active { cursor: ew-resize !important; user-select: none; }";
    styles += ".mdash-canvas-item-header { display: flex; flex-direction: column; align-items: stretch; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-item-header-top { width: 100%; }";
    styles += ".mdash-item-header-bottom { display: flex; align-items: center; gap: 10px; }";
    styles += ".mdash-item-header-actions { display: flex; gap: 3px; flex-shrink: 0; margin-left: auto; }";
    styles += ".mdash-canvas-item-body { min-height: 60px; }";
    styles += ".is-selected { outline: 2px solid rgba(var(--md-primary-rgb),0.3); outline-offset: 0; }";

    // Empty items
    styles += ".mdash-canvas-empty-items { grid-column: 1 / -1; text-align: center; padding: 30px 10px; color: var(--md-muted); border: 1px dashed rgba(var(--md-primary-rgb),0.28); border-radius: 8px; background: rgba(255,255,255,0.82); }";

    // Inline editing
    styles += ".mdash-inline-title { border: none; background: transparent; font-size: 15px; font-weight: 700; color: var(--md-text); width: 100%; padding: 2px 4px; outline: none; border-radius: 4px; cursor: text; transition: background 0.15s, border-bottom 0.15s; border-bottom: 2px solid transparent; min-width: 0; }";
    styles += ".mdash-inline-title:hover { background: rgba(var(--md-primary-rgb),0.06); border-bottom-color: rgba(var(--md-primary-rgb),0.42); }";
    styles += ".mdash-inline-title:focus { background: rgba(var(--md-primary-rgb),0.09); border-bottom-color: var(--md-primary); }";
    styles += ".mdash-inline-title::placeholder { color: var(--md-muted); font-weight: 500; }";
    styles += ".mdash-inline-title-sm { font-size: 13px !important; font-weight: 600 !important; width: 100%; }";
    styles += ".mdash-inline-layout-picker { position: relative; flex: 1; min-width: 0; }";
    styles += ".mdash-inline-layout-trigger { width: 100%; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(var(--md-primary-rgb),0.35); border-radius: 8px; background: #fff; color: var(--md-text); font-size: 12px; height: 40px; padding: 4px 10px; box-shadow: none; text-align: left; }";
    styles += ".mdash-inline-layout-trigger:hover { border-color: var(--md-primary); }";
    styles += ".mdash-inline-layout-trigger:focus { outline: none; border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); }";
    styles += ".mdash-inline-layout-trigger i { margin-left: auto; color: var(--md-muted); }";
    styles += ".mdash-inline-layout-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }";
    styles += ".mdash-inline-layout-thumb { width: 64px; height: 36px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(var(--md-primary-rgb),0.26); background: #f8fafc; flex-shrink: 0; display: block; }";
    styles += ".mdash-template-thumb-render { width: 240px; transform: scale(0.25); transform-origin: top left; pointer-events: none; }";
    styles += ".mdash-template-thumb-empty { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; font-weight:700; color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-inline-layout-menu { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 60; max-height: 260px; overflow-y: auto; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.24); border-radius: 10px; box-shadow: 0 14px 26px rgba(2,6,23,0.16); padding: 6px; }";
    styles += ".mdash-inline-layout-option { width: 100%; display: flex; align-items: center; gap: 10px; border: 1px solid transparent; background: #fff; border-radius: 8px; padding: 7px; color: var(--md-text); text-align: left; margin-bottom: 4px; }";
    styles += ".mdash-inline-layout-option:last-child { margin-bottom: 0; }";
    styles += ".mdash-inline-layout-option:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: rgba(var(--md-primary-rgb),0.24); }";

    // Objects badges + previews
    styles += ".mdash-canvas-objects-list { display: flex; flex-wrap: wrap; gap: 8px; }";
    styles += ".mdash-canvas-object-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.28); border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: var(--md-text); }";
    styles += ".mdash-canvas-object-badge:hover { border-color: var(--md-primary); transform: translateY(-1px); box-shadow: 0 6px 12px rgba(var(--md-primary-rgb),0.14); }";
    styles += ".mdash-canvas-object-badge i { color: var(--md-primary); }";
    styles += ".preview-card { background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.2); border-radius: 8px; padding: 10px; }";
    styles += ".preview-card.kpi { display: grid; gap: 6px; }";
    styles += ".preview-card.kpi .kpi-label { font-size: 12px; color: var(--md-muted); text-transform: uppercase; letter-spacing: 0.5px; }";
    styles += ".preview-card.kpi .kpi-value { font-size: 24px; font-weight: 700; color: var(--md-text); }";
    styles += ".preview-card.kpi .kpi-trend { font-size: 12px; font-weight: 600; color: var(--md-primary); }";
    styles += ".preview-card.chart { min-height: 120px; display: flex; align-items: center; justify-content: center; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.09), rgba(255,255,255,0.9)); color: var(--md-primary); font-weight: 700; border: 1px dashed rgba(var(--md-primary-rgb),0.4); }";
    styles += "@media (max-width: 767px) { .mdash-container-items-row { grid-template-columns: 1fr; } .mdash-canvas-item { grid-column: 1 / -1 !important; } }";

    // ===== PROPERTIES PANEL =====
    styles += ".mdash-properties { width: 300px; min-width: 300px; background: linear-gradient(180deg, #ffffff, #f8fafc); border: 1px solid var(--md-border); border-radius: 14px; padding: 12px; overflow-y: auto; box-shadow: 0 12px 24px rgba(2,6,23,0.08); transition: width 0.22s ease, min-width 0.22s ease, padding 0.22s ease; }";
    styles += ".mdash-properties-header { position: relative; font-weight: 800; color: var(--md-text); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; font-size: 18px; padding-right: 28px; }";
    styles += ".mdash-properties-header i { color: var(--md-primary); }";
    styles += ".mdash-properties-toggle { position: absolute; top: 50%; right: 0; }";
    styles += ".mdash-properties-rail-actions { display: none; flex-direction: column; gap: 6px; align-items: center; }";
    styles += ".mdash-properties-rail-actions .btn { width: 36px; height: 34px; padding: 0; border-radius: 8px; }";
    styles += ".mdash-properties.is-collapsed { width: 56px; min-width: 56px; padding: 10px 8px; overflow: hidden; }";
    styles += ".mdash-properties.is-collapsed #mdash-properties-panel { display: none; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-rail-actions { display: flex; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header { justify-content: center; align-items: center; font-size: 0; margin-bottom: 4px; padding: 0 20px 0 0; min-height: 24px; width: 100%; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header > span { font-size: 0; width: 100%; display: flex; align-items: center; justify-content: center; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header > span i { font-size: 18px; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-toggle { top: 50%; right: -1px; width: 18px; height: 18px; border-radius: 5px; }";
    styles += "#mdash-properties-panel .form-group { margin-bottom: 12px; }";
    styles += "#mdash-properties-panel label { font-size: 12px; font-weight: 700; color: var(--md-muted); letter-spacing: .2px; }";
    styles += "#mdash-properties-panel input:not([type='checkbox']), #mdash-properties-panel select { font-size: 13px; border-radius: 8px; border: 1px solid rgba(var(--md-primary-rgb),0.45); box-shadow: none; min-height: 34px; }";
    styles += "#mdash-properties-panel input:focus, #mdash-properties-panel select:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); outline: none; }";
    styles += "#mdash-properties-panel input[type='checkbox'] { width: 14px; height: 14px; min-height: 14px; accent-color: var(--md-primary); cursor: pointer; vertical-align: middle; margin: 0; }";
    styles += "@media (max-width: 1440px) { .mdash-sidebar { width: 228px; min-width: 228px; } .mdash-properties { width: 262px; min-width: 262px; } .mdash-modern-layout { gap: 6px; padding: 6px; } }";

    // ===== MODALS =====
    styles += ".modal-header { background: linear-gradient(120deg, var(--md-primary), #0f172a); color: white; }";
    styles += ".modal-header .close { color: white; opacity: 0.8; }";
    styles += ".modal-header .close:hover { opacity: 1; }";
    styles += ".modal-header .modal-title { margin: 0; color: " + primaryColor + " !important; }";
    styles += ".modal-header .modal-title i { color: " + primaryColor + " !important; }";

    $('<style id="mdash-modern-styles" data-mdash-style-version="' + styleVersion + '">').text(styles).appendTo('head');

    // Reaplica após o ciclo atual para ganhar prioridade caso outro script injete CSS depois.
    setTimeout(function () {
        $('#mdash-modern-styles').appendTo('head');
    }, 0);
}

/**
 * Inicializa editores ACE para campos com classe .m-editor
 */
function handleCodeEditor() {
    function getAceModeForEditor(el) {
        var key = [
            (el && el.id) || "",
            (el && el.getAttribute && el.getAttribute("data-field")) || "",
            (el && el.getAttribute && el.getAttribute("name")) || "",
            (el && el.className) || ""
        ].join(" ").toLowerCase();
        var sqlKeys = [
            "expressaolistagem",
            "expressaodblistagem",
            "mdash-obj-query-editor",
            "mdash-fonte-query-editor",
            "query",
            "sql"
        ];
        var jsKeys = [
            "expressaojslistagem",
            "expressaochange",
            "expressaoapresentacaodados",
            "expressaolayoutcontaineritem",
            "valordefeito"
        ];

        for (var i = 0; i < sqlKeys.length; i++) {
            if (key.indexOf(sqlKeys[i]) !== -1) return "ace/mode/sql";
        }

        for (var j = 0; j < jsKeys.length; j++) {
            if (key.indexOf(jsKeys[j]) !== -1) return "ace/mode/javascript";
        }

        // Fallback: a maioria dos campos de expressão não-DB usa JavaScript.
        return "ace/mode/javascript";
    }

    var editors = [];
    document.querySelectorAll('.m-editor').forEach(function (el, idx) {
        // Garante um id único para cada editor
        if (!el.id) el.id = 'm-editor' + idx;

        var aceEditor = ace.edit(el.id);
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode(getAceModeForEditor(el));
        aceEditor.setOptions({
            fontSize: "13px",
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        });

        editors.push(aceEditor);
    });

    // Guarda o editor atualmente focado
    var focusedEditor = null;
    editors.forEach(function (ed) {
        ed.on('focus', function () {
            focusedEditor = ed;
        });
    });
}

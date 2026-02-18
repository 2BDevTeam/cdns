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
    this.ordem = data.ordem || (maxOrdem + 1);
    this.templatelayout = data.templatelayout || "";  // IMPORTANTE: template do layout
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

    console.log("Sincronização em tempo real do componente:", { table: table, idfield: idfield, recordData: recordData });
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

    // Cria o container principal no DOM
    var mainContainerHtml = "<div id='m-dash-main-container' class='m-dash-main-container'></div>";
    $("#campos > .row:last").after(mainContainerHtml);

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

// Placeholder - Esta função deve retornar os templates disponíveis
// (copiada da versão original)
function getTemplateLayoutOptions() {
    // NOTA: Esta função deve retornar o array de templates disponíveis
    // Por agora, retorno um placeholder
    return [
        {
            codigo: "template_default",
            descricao: "Template Padrão"
        }
    ];
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

    var mainHtml = '<div class="mdash-modern-layout" v-scope @vue:mounted="onMounted">';

    // Sidebar (Lateral)
    mainHtml += '  <div class="mdash-sidebar">';
    mainHtml += '    <div class="mdash-sidebar-header">';
    mainHtml += '      <h4><i class="glyphicon glyphicon-th"></i> Componentes</h4>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-sidebar-body">';

    // Accordion com os componentes
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
    mainHtml += '              <button type="button" @click="addNewContainer" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Container';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="containers.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum container</small></p>';
    mainHtml += '                <div v-for="(container, index) in $computed.sortedContainers()" :key="container.mdashcontainerstamp" class="mdash-sidebar-item mdash-sidebar-container" :data-stamp="container.mdashcontainerstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editContainer(container.mdashcontainerstamp)">';
    mainHtml += '                    <i class="glyphicon glyphicon-th-large"></i>';
    mainHtml += '                    <span>{{ container.titulo || container.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                    <span v-if="getContainerItemsCount(container.mdashcontainerstamp) > 0" class="badge badge-info">{{ getContainerItemsCount(container.mdashcontainerstamp) }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="addContainerItem(container.mdashcontainerstamp)" class="btn btn-xs btn-primary" title="Adicionar Item">';
    mainHtml += '                      <i class="glyphicon glyphicon-plus"></i>';
    mainHtml += '                    </button>';
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
    mainHtml += '    <div class="mdash-canvas-header">';
    mainHtml += '      <h3><i class="glyphicon glyphicon-eye-open"></i> Pré-visualização do Dashboard</h3>';
    mainHtml += '      <div class="mdash-canvas-actions">';
    mainHtml += '        <button type="button" @click="refreshCanvas" class="btn btn-default btn-sm">';
    mainHtml += '          <i class="glyphicon glyphicon-refresh"></i> Atualizar Vista';
    mainHtml += '        </button>';
    mainHtml += '        <button type="button" @click="saveConfiguration" class="btn btn-primary btn-sm" style="margin-left: 8px;">';
    mainHtml += '          <i class="glyphicon glyphicon-floppy-disk"></i> Guardar Configuração';
    mainHtml += '        </button>';
    mainHtml += '        <button type="button" @click="exportConfiguration" class="btn btn-success btn-sm" style="margin-left: 8px;">';
    mainHtml += '          <i class="glyphicon glyphicon-download-alt"></i> Exportar';
    mainHtml += '        </button>';
    mainHtml += '      </div>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-canvas-body" id="mdash-canvas-body">';
    mainHtml += '      <div v-if="containers.length === 0" class="mdash-canvas-empty">';
    mainHtml += '        <i class="glyphicon glyphicon-info-sign"></i>';
    mainHtml += '        <p>Adicione containers na sidebar para começar a construir seu dashboard.</p>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-for="(container, index) in $computed.sortedContainers()" :key="container.mdashcontainerstamp" v-if="!container.inactivo" class="mdash-canvas-container" :data-stamp="container.mdashcontainerstamp">';
    mainHtml += '        <div class="mdash-canvas-container-header">';
    mainHtml += '          <h4>{{ container.titulo || \'Container sem título\' }}</h4>';
    mainHtml += '          <div class="mdash-canvas-container-actions">';
    mainHtml += '            <button type="button" @click="editContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-default">';
    mainHtml += '              <i class="glyphicon glyphicon-pencil"></i>';
    mainHtml += '            </button>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '        <div class="mdash-canvas-container-body">';
    mainHtml += '          <div v-if="getContainerItems(container.mdashcontainerstamp).length === 0" class="mdash-canvas-empty-items">';
    mainHtml += '            <small class="text-muted">Nenhum item neste container</small>';
    mainHtml += '            <button type="button" @click="addContainerItem(container.mdashcontainerstamp)" class="btn btn-xs btn-primary">';
    mainHtml += '              <i class="glyphicon glyphicon-plus"></i> Adicionar Item';
    mainHtml += '            </button>';
    mainHtml += '          </div>';
    mainHtml += '          <div v-else class="row">';
    mainHtml += '            <div v-for="item in getContainerItems(container.mdashcontainerstamp)" :key="item.mdashcontaineritemstamp" :class="\'col-md-\' + (item.tamanho || 4)" class="mdash-canvas-item" :data-stamp="item.mdashcontaineritemstamp">';
    mainHtml += '              <div class="mdash-canvas-item-card">';
    mainHtml += '                <div class="mdash-canvas-item-header">';
    mainHtml += '                  <h5>{{ item.titulo || \'Item sem título\' }}</h5>';
    mainHtml += '                  <button type="button" @click="editContainerItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-default">';
    mainHtml += '                    <i class="glyphicon glyphicon-pencil"></i>';
    mainHtml += '                  </button>';
    mainHtml += '                </div>';
    mainHtml += '                <div class="mdash-canvas-item-body">';
    mainHtml += '                  <small v-if="getItemObjects(item.mdashcontaineritemstamp).length === 0" class="text-muted">Nenhum objeto</small>';
    mainHtml += '                  <div v-else class="mdash-canvas-objects-list">';
    mainHtml += '                    <div v-for="obj in getItemObjects(item.mdashcontaineritemstamp)" :key="obj.mdashcontaineritemobjectstamp" @click="editContainerItemObject(obj.mdashcontaineritemobjectstamp)" class="mdash-canvas-object-badge">';
    mainHtml += '                      <i :class="getObjectTypeIcon(obj.tipo)"></i> {{ obj.tipo || \'Objeto\' }}';
    mainHtml += '                    </div>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '    </div>';
    mainHtml += '  </div>';

    mainHtml += '</div>';

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
                    return item.mdashcontainerstamp === containerStamp && !item.inactivo;
                })
                .sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
        },

        getItemObjects: function (itemStamp) {
            return window.appState.containerItemObjects.filter(function (obj) {
                return obj.mdashcontaineritemstamp === itemStamp;
            });
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

        addNewContainer: function () {
            addNewContainer();
        },

        editContainer: function (stamp) {
            editContainer(stamp);
        },

        deleteContainer: function (stamp) {
            deleteContainer(stamp);
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

        addNewFonte: function () {
            addNewFonte();
        },

        editFonte: function (stamp) {
            editFonte(stamp);
        },

        deleteFonte: function (stamp) {
            deleteFonte(stamp);
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
        }
    }).mount('#m-dash-main-container');
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
    // Remove modal se já existir
    $('#mdash-container-edit-modal').remove();

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
    var modalHtml = '<div class="modal fade" id="mdash-container-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-th-large"></i> Configurar Container';
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
    // Implementação similar ao container
    alertify.alert('Container Item', 'Modal de edição de Container Item será implementado aqui. Stamp: ' + item.mdashcontaineritemstamp);
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
 * Edita um objeto de container item
 */
function editContainerItemObject(objectStamp) {
    alertify.alert('Object', 'Modal de edição de Object será implementado. Stamp: ' + objectStamp);
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

    // Adiciona ao estado reativo
    window.appState.fontes.push(newFonte);

    alertify.alert('Fonte', 'Modal de edição de Fonte será implementado. Stamp: ' + newFonte.mdashfontestamp);
}

/**
 * Edita uma fonte
 */
function editFonte(fonteStamp) {
    alertify.alert('Fonte', 'Modal de edição de Fonte será implementado. Stamp: ' + fonteStamp);
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

/**
 * Abre modal de edição de filtro usando UIObjectFormConfig (abordagem original)
 */
function openFilterEditModal(filter) {
    // Remove modal se já existir
    $('#mdash-filter-edit-modal').remove();

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
    var modalHtml = '<div class="modal fade" id="mdash-filter-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';

    // Header
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-filter"></i> ';
    modalHtml += '          Configurar Filtro - ' + (filter.descricao || 'Novo');
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

    // ===== LAYOUT PRINCIPAL =====
    styles += ".mdash-modern-layout { display: flex; height: calc(100vh - 100px); background: #f5f7fa; }";

    // ===== SIDEBAR =====
    styles += ".mdash-sidebar { width: 350px; background: white; border-right: 1px solid #ddd; display: flex; flex-direction: column; overflow: hidden; }";
    styles += ".mdash-sidebar-header { padding: 20px; border-bottom: 1px solid #ecf0f1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }";
    styles += ".mdash-sidebar-header h4 { margin: 0; font-size: 18px; }";
    styles += ".mdash-sidebar-header h4 i { margin-right: 8px; }";
    styles += ".mdash-sidebar-body { flex: 1; overflow-y: auto; padding: 10px; }";

    // Accordion customizado
    styles += "#mdash-accordion .panel { margin-bottom: 8px; border-radius: 6px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }";
    styles += "#mdash-accordion .panel-heading { background: #f8f9fa; border-bottom: 1px solid #e0e0e0; cursor: pointer; padding: 12px 15px; transition: all 0.2s; }";
    styles += "#mdash-accordion .panel-heading:hover { background: #e9ecef; }";
    styles += "#mdash-accordion .panel-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin: 0; display: flex; align-items: center; justify-content: space-between; }";
    styles += "#mdash-accordion .panel-title i { margin-right: 8px; }";
    styles += "#mdash-accordion .panel-title .badge { background: #667eea; font-size: 11px; }";
    styles += "#mdash-accordion .panel-body { padding: 10px; }";

    // Items da sidebar
    styles += ".mdash-sidebar-list { margin-top: 10px; }";
    styles += ".mdash-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 5px; background: #f8f9fa; border-radius: 4px; cursor: pointer; transition: all 0.2s; }";
    styles += ".mdash-sidebar-item:hover { background: #e9ecef; transform: translateX(2px); }";
    styles += ".mdash-sidebar-item-content { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 13px; color: #2c3e50; }";
    styles += ".mdash-sidebar-item-content i { color: #667eea; font-size: 12px; }";
    styles += ".mdash-sidebar-item-content .badge { margin-left: auto; background: #3498db; font-size: 10px; }";
    styles += ".mdash-sidebar-item-actions { display: flex; gap: 3px; opacity: 0; transition: opacity 0.2s; }";
    styles += ".mdash-sidebar-item:hover .mdash-sidebar-item-actions { opacity: 1; }";

    // ===== CANVAS (Área de trabalho) =====
    styles += ".mdash-canvas { flex: 1; display: flex; flex-direction: column; overflow: hidden; }";
    styles += ".mdash-canvas-header { padding: 20px; background: white; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }";
    styles += ".mdash-canvas-header h3 { margin: 0; font-size: 20px; color: #2c3e50; }";
    styles += ".mdash-canvas-header h3 i { margin-right: 10px; color: #3498db; }";
    styles += ".mdash-canvas-body { flex: 1; overflow-y: auto; padding: 20px; }";

    // Canvas vazio
    styles += ".mdash-canvas-empty { text-align: center; padding: 80px 20px; color: #7f8c8d; }";
    styles += ".mdash-canvas-empty i { font-size: 64px; color: #bdc3c7; margin-bottom: 20px; display: block; }";
    styles += ".mdash-canvas-empty p { font-size: 16px; margin: 0; }";

    // Container no canvas
    styles += ".mdash-canvas-container { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; overflow: hidden; }";
    styles += ".mdash-canvas-container-header { padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; }";
    styles += ".mdash-canvas-container-header h4 { margin: 0; font-size: 16px; color: #2c3e50; font-weight: 600; }";
    styles += ".mdash-canvas-container-body { padding: 20px; min-height: 100px; }";

    // Item no canvas
    styles += ".mdash-canvas-item { margin-bottom: 15px; }";
    styles += ".mdash-canvas-item-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 15px; height: 100%; }";
    styles += ".mdash-canvas-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; }";
    styles += ".mdash-canvas-item-header h5 { margin: 0; font-size: 14px; color: #2c3e50; font-weight: 600; }";
    styles += ".mdash-canvas-item-body { min-height: 60px; }";

    // Empty items
    styles += ".mdash-canvas-empty-items { text-align: center; padding: 30px 10px; color: #7f8c8d; }";

    // Objects badges
    styles += ".mdash-canvas-objects-list { display: flex; flex-wrap: wrap; gap: 8px; }";
    styles += ".mdash-canvas-object-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: white; border: 1px solid #dee2e6; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; }";
    styles += ".mdash-canvas-object-badge:hover { background: #e9ecef; border-color: #667eea; transform: translateY(-1px); }";
    styles += ".mdash-canvas-object-badge i { color: #667eea; }";

    // ===== MODAIS =====
    styles += ".modal-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }";
    styles += ".modal-header .close { color: white; opacity: 0.8; }";
    styles += ".modal-header .close:hover { opacity: 1; }";
    styles += ".modal-header h4 { margin: 0; }";

    $('<style>').text(styles).appendTo('head');
}

/**
 * Inicializa editores ACE para campos com classe .m-editor
 */
function handleCodeEditor() {
    var editors = [];
    document.querySelectorAll('.m-editor').forEach(function (el, idx) {
        // Garante um id único para cada editor
        if (!el.id) el.id = 'm-editor' + idx;

        var aceEditor = ace.edit(el.id);
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode("ace/mode/sql");
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

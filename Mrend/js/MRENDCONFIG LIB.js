
function LinhaMrenderConfig(data) {

    this.linhastamp = data.linhastamp || "";
    this.linkstamp = data.linkstamp || "";
    this.relatoriostamp = data.relatoriostamp || "";
    this.parentstamp = data.parentstamp || "";
    this.temcolunas = data.temcolunas || false;
    this.tipo = data.tipo || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.origem = data.origem || "";
    this.expressao = data.expressao || "";
    this.campovalid = data.campovalid || "";
    this.sinalnegativo = data.sinalnegativo || false;
    this.temtotais = data.temtotais || false;
    this.totkey = data.totkey || "";
    this.modelo = data.modelo || false;
    this.descbtnModelo = data.descbtnModelo || "Adicionar linha";
    this.addfilho = data.addfilho || false;
    this.totfield = data.totfield || "";
    this.condicaovalidacao = data.condicaovalidacao || "";
    this.categoria = data.categoria || "";
    this.codcategoria = data.codcategoria || "";
    this.ordem = data.ordem || 0;
    this.usafnpren = data.usafnpren || false;
    this.fnpren = data.fnpren || "";
    this.tipolistagem = data.tipolistagem || "table";
    this.objectolist = data.objectolist || "";
    this.executachange = data.executachange || false;
    this.expressaochangejs = data.expressaochangejs || "";
    this.cor = data.cor || "";
    this.estilopersonalizado = data.estilopersonalizado || false;
    this.expressaoestilopersonalizado = data.expressaoestilopersonalizado || "";
    this.explist = data.explist || "";
    this.defselect = data.defselect || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.executachangesubgrupo = data.executachangesubgrupo || false;
    this.expressaochangejssubgrupo = data.expressaochangejssubgrupo || "";
    this.bindData = new BindData(data.bindData ? data.bindData : {})
    this.localSource = data.localSource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];

}

function ColunaMrenderConfig(data) {

    this.colunastamp = data.colunastamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.desccoluna = data.desccoluna || "";
    this.campo = data.campo || "";
    this.tipo = data.tipo || "text";
    this.atributo = data.atributo || "";
    this.campovalid = data.campovalid || "";
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
    this.expressaodb = data.expressaodb || "";
    this.relatoriostamp = data.relatoriostamp || "";
    this.condicaovalidacao = data.condicaovalidacao || "";
    this.validacoluna = data.validacoluna || false;
    this.expresscolfun = data.expresscolfun || "";
    this.colfunc = data.colfunc || false;
    this.ordem = data.ordem || 0;
    this.expressaotbjs = data.expressaotbjs || "";
    this.usaexpresstbjs = data.usaexpresstbjs || false;
    this.usaexpressaocoldesc = data.usaexpressaocoldesc || false;
    this.expresssaojscoldesc = data.expresssaojscoldesc || "";
    this.nometb = data.nometb || "";
    this.valtb = data.valtb || "";
    this.eventoclique = data.eventoclique || false;
    this.expressaoclique = data.expressaoclique || "";
    this.condicattr = data.condicattr || false;
    this.condicattrexpr = data.condicattrexpr || "";
    this.condictipo = data.condictipo || false;
    this.condicetipoxpr = data.condicetipoxpr || "";
    this.condicfunc = data.condicfunc || false;
    this.condicfuncexpr = data.condicfuncexpr || "";
    this.categoria = data.categoria || "default";
    this.modelo = data.modelo || false;
    this.descbtnModelo = data.descbtnModelo || "Adicionar coluna";
    this.addBtn = data.addBtn || false;
    this.setinicio = data.setinicio || false;
    this.setfim = data.setfim || false;
    // this.expressaodb = data.expressaodb || "";
    this.expressaojsevento = data.expressaojsevento || "";
    this.executaeventochange = data.executaeventochange || false;
    this.inactivo = data.inactivo || false;
    this.decimais = data.decimais || 2;
    this.proibenegativo = data.proibenegativo || false;
    this.regra = data.regra || "";
    this.fixacoluna = data.fixacoluna || false;
    this.bindData = new BindData(data.bindData ? data.bindData : {})
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {});
    this.localsource = data.localsource || "";

    this.objectsUIFormConfig = data.objectsUIFormConfig || [];

}


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


function getLinhaUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ campo: "temcolunas", tipo: "checkbox", titulo: "Tem Colunas", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "addfilho", tipo: "checkbox", titulo: "Adiciona filho", classes: "input-source-form" }),
        new UIObjectFormConfig({
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Grupo", value: "Grupo" },
                { option: "Subgrupo", value: "Subgrupo" },
                { option: "Singular", value: "Singular" }
            ]
        }),
        new UIObjectFormConfig({ campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "modelo", tipo: "checkbox", titulo: "É modelo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "descbtnModelo", tipo: "text", titulo: "Descrição Botão Modelo", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "origem", tipo: "text", titulo: "Origem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "expressao", tipo: "text", titulo: "Expressão", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "campovalid", tipo: "text", titulo: "Campo Validação", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "sinalnegativo", tipo: "checkbox", titulo: "Sinal Negativo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "temtotais", tipo: "checkbox", titulo: "Tem Totais", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "totkey", tipo: "text", titulo: "Total Key", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "totfield", tipo: "text", titulo: "Total Field", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "condicaovalidacao", tipo: "text", titulo: "Condição Validação", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "categoria", tipo: "text", titulo: "Categoria", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "codcategoria", tipo: "text", titulo: "Código Categoria", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "usafnpren", tipo: "checkbox", titulo: "Usa FnPren", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "fnpren", tipo: "text", titulo: "FnPren", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "tipolistagem", tipo: "text", titulo: "Tipo Listagem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "objectolist", tipo: "text", titulo: "Objeto Listagem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "executachange", tipo: "checkbox", titulo: "Executa Change", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "expressaochangejs", tipo: "text", titulo: "Expressão Change JS", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "cor", tipo: "text", titulo: "Cor", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "estilopersonalizado", tipo: "checkbox", titulo: "Estilo Personalizado", classes: "input-source-form" }),

        new UIObjectFormConfig({ campo: "explist", tipo: "text", titulo: "ExpList", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "defselect", tipo: "text", titulo: "DefSelect", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "campooption", tipo: "text", titulo: "Campo Option", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "campovalor", tipo: "text", titulo: "Campo Valor", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "executachangesubgrupo", tipo: "checkbox", titulo: "Executa Change Subgrupo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "expressaochangejssubgrupo", tipo: "text", titulo: "Expressão Change JS Subgrupo", classes: "form-control input-source-form  input-sm" }),
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigLinhas", idField: "linhastamp" };
}




function getColunaUIObjectFormConfigAndSourceValues() {

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ campo: "codigocoluna", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "desccoluna", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "campo", tipo: "text", titulo: "Campo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "condicattr", tipo: "checkbox", titulo: "Tem condição do atributo", classes: "input-source-form", contentType: "input", colSize: 6 }),
        new UIObjectFormConfig({ campo: "condicattrexpr", tipo: "text", titulo: "Expressão  para o atributo", classes: "form-control input-source-form  input-sm ", contentType: "input", colSize: 6 }),
        new UIObjectFormConfig({ campo: "condictipo", tipo: "checkbox", titulo: "Tem condição do Tipo", classes: "input-source-form", contentType: "input", colSize: 6 }),
        new UIObjectFormConfig({ campo: "condicetipoxpr", tipo: "text", titulo: "Expressão para definir o  Tipo", classes: "form-control input-source-form  input-sm ", contentType: "input", colSize: 6 }),
        new UIObjectFormConfig({ campo: "sourceTable", tipo: "text", titulo: "Tabela fonte", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "sourceKey", tipo: "text", titulo: "Chave fonte", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "setinicio", tipo: "checkbox", titulo: "Set Início", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "setfim", tipo: "checkbox", titulo: "Set Fim", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "eventoclique", tipo: "checkbox", titulo: "Evento clique", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaoclique", tipo: "textarea", titulo: "Expressão Clique", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "modelo", tipo: "checkbox", titulo: "É modelo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ campo: "descbtnModelo", tipo: "text", titulo: "Descrição Botão Modelo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "addBtn", tipo: "checkbox", titulo: "Botão para adicionar a coluna visível", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ campo: "fixacoluna", tipo: "checkbox", titulo: "Fixa Coluna", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ campo: "proibenegativo", tipo: "checkbox", titulo: "Proíbe Negativo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ campo: "condicfunc", tipo: "checkbox", titulo: "Tem condição para definir se é função", classes: "input-source-form", contentType: "input", colSize: 4 }),
        new UIObjectFormConfig({ campo: "condicfuncexpr", tipo: "textarea", titulo: "Expressão  para definir se tem função", classes: "form-control input-source-form  input-sm ", contentType: "input", colSize: 4 }),
        new UIObjectFormConfig({ campo: "colfunc", tipo: "checkbox", titulo: "Coluna Função", classes: "input-source-form", contentType: "input", colSize: 6 }),
        new UIObjectFormConfig({ colSize: 12, campo: "expresscolfun", tipo: "textarea", titulo: "Expressão Coluna Função", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Texto", value: "text" },
                { option: "Número", value: "digit" },
                { option: "Lógico", value: "logic" },
                { option: "Textarea", value: "textarea" },
                { option: "Tabela", value: "table" },
                { option: "Data", value: "date" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "atributo",
            tipo: "select",
            titulo: "Atributo",
            fieldToOption: "option",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            contentType: "select",
            selectValues: [
                { option: "", value: "" },
                { option: "Ativo", value: "enabled" },
                { option: "Desativado", value: "disabled" },
                { option: "Somente leitura", value: "readonly" }
            ]
        }),
        new UIObjectFormConfig({ campo: "validacoluna", tipo: "checkbox", titulo: "Valida Coluna", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ campo: "campovalid", tipo: "text", titulo: "Campo Validação", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "condicaovalidacao", tipo: "text", titulo: "Condição Validação", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "usaexpresstbjs", tipo: "checkbox", titulo: "Usa Expressão TB JS", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expressaotbjs", tipo: "textarea", titulo: "Expressão Tabela JS", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "nometb", tipo: "text", titulo: "Nome TB", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ colSize: 6, campo: "valtb", tipo: "text", titulo: "Valor TB", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaodb", tipo: "textarea", titulo: "Expressão Base de dados", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "usaexpressaocoldesc", tipo: "checkbox", titulo: "Usa Expressão Coluna Desc.", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expresssaojscoldesc", tipo: "textarea", titulo: "Expressão JS Coluna Desc.", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 2, campo: "executaeventochange", tipo: "checkbox", titulo: "Executa Evento Change", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 10, campo: "expressaojsevento", tipo: "text", titulo: "Expressão JS Evento", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "categoria", tipo: "text", titulo: "Categoria", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ campo: "decimais", tipo: "digit", titulo: "Decimais", classes: "form-control input-source-form  input-sm ", contentType: "input", }),
        new UIObjectFormConfig({ colSize: 12, campo: "regra", tipo: "textarea", titulo: "Regra", classes: "form-control input-source-form  input-sm ", contentType: "input" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigColunas", idField: "colunastamp" };
}


function getCelulaUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [

        new UIObjectFormConfig({ campo: "sinalnegativo", tipo: "checkbox", titulo: "Sinal Negativo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "desabilitado", tipo: "checkbox", titulo: "Desabilitado", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "usafnpren", tipo: "checkbox", titulo: "Usa FnPren", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "atributo", tipo: "text", titulo: "Atributo", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "fnpren", tipo: "text", titulo: "FnPren", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "fx", tipo: "text", titulo: "FX", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "temfx", tipo: "checkbox", titulo: "Tem FX", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "usaexpresstbjs", tipo: "checkbox", titulo: "Usa Expressão Tabela JS", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "expressaotbjs", tipo: "textarea", titulo: "Expressão Tabela JS", classes: "form-control input-source-form  input-sm" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigCelulas", idField: "celulastamp" };
}


function CelulaMrenderConfig(data) {
    this.linhastamp = data.linhastamp || "";
    this.celulastamp = data.celulastamp || "";
    this.colunastamp = data.colunastamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.sinalnegativo = data.sinalnegativo || "";
    this.inactivo = data.inactivo || false;
    this.desabilitado = data.desabilitado || false;
    this.usafnpren = data.usafnpren || false;
    this.atributo = data.atributo || "";
    this.fnpren = data.fnpren || "";
    this.expressaotbjs = data.expressaotbjs || "";
    this.usaexpresstbjs = data.usaexpresstbjs || false;
    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.fx = data.fx || "";
    this.temfx = data.temfx || false;
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {})
    this.localsource = data.localsource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.idField = data.idField || "";

}


function BindData(data) {

    this.sourceKey = data.sourceKey || "";
    this.sourceBind = data.sourceBind || "";
    this.extras = Array.isArray(data.extras) ? Array.from(data.extras.map(mapExtra)) : [new ExtraBindData({})];
}

function ExtraBindData(data) {

    this.sourceRef = data.sourceRef || "";
    this.selector = data.selector || "";
    this.sourceBind = data.sourceBind || "";
}

function FXData(data) {
    this.tipo = data.tipo || "";
    this.activo = data.activo || false;
    this.expressao = data.expressao || ""
    this.colrefs = Array.isArray(data.colrefs) ? Array.from(data.colrefs) : []
}



var GMrendConfigLinhas = [new LinhaMrenderConfig({})]
var GMrendConfigColunas = [new ColunaMrenderConfig({})]
var GMrendConfigCelulas = [new CelulaMrenderConfig({})];
var GlickedRowComponent
var GRelatorioStamp = ""
var GConfigCodigo = ""
GRenderedLinhas = []
GMrendConfigColunas = []
GMrendConfigLinhas = []
GMrendConfigCelulas = []
var GRendConfigTableHtml = {
    tableId: "dd",
    classes: "table table-hover config-input-report-table ",
    customData: "",
    style: "",
    header: {
        row: [{

            style: "",
            rowId: "",
            classes: "",
            customData: "",
            cols: [{
                style: "",
                colId: "",
                classes: "",
                content: "",
                customData: "",
            }]
        }]
    },
    body: {

        customData: "",
        rows: [
            {

                style: "",
                rowId: "",
                classes: "",
                customData: "",
                cols: [{
                    style: "",
                    colId: "",
                    classes: "",
                    content: "",
                    customData: "",
                }]
            }
        ]

    }
}


$(document).ready(function () {


    registerListenersMrender();
    organizarEcraMrender();

})


function organizarEcraMrender() {

    $("#ctl00_conteudo_u_mrendrelstamp").hide();
}


function initTabelaConfiguracaoMrender(config) {

    GRelatorioStamp = config.relatoriostamp || $("#ctl00_conteudo_u_mrendrelstamp_mLabel1").text();
    GConfigCodigo = config.codigo || "";
    GRendConfigTableHtml = {
        tableId: "dd",
        classes: "table table-hover config-input-report-table ",
        customData: "",
        style: "",
        header: {
            row: [{

                style: "",
                rowId: "",
                classes: "",
                customData: "",
                cols: [{
                    style: "",
                    colId: "",
                    classes: "",
                    content: "",
                    customData: "",
                }]
            }]
        },
        body: {

            customData: "",
            rows: [
                {

                    style: "",
                    rowId: "",
                    classes: "",
                    customData: "",
                    cols: [{
                        style: "",
                        colId: "",
                        classes: "",
                        content: "",
                        customData: "",
                    }]
                }
            ]

        }
    }

    GRendConfigTableHtml.tableId = "inputReportTable"

    GRendConfigTableHtml.classes = "table table-hover config-input-report-table "
    GRendConfigTableHtml.body.rows = []

    GRendConfigTableHtml.header.row.classes = "defgridheader"
    //GRendConfigTableHtml.header.row.style = "background:#033076!important"
    GRendConfigTableHtml.header.row.cols = []

    var colunaHtmlButtonAddRubrica = "<div  class='col-md-12 pull-left'>"
    colunaHtmlButtonAddRubrica += "    <button  type='button' id='addColunaBtn' class='btn btn-primary'>Adicionar Coluna</button>"

    colunaHtmlButtonAddRubrica += "  </div>"

    var tableHtml = colunaHtmlButtonAddRubrica

    tableHtml += "<div style='margin-top:2em' class='col-md-12' >" + generateTableV2(GRendConfigTableHtml) + "</div>"
    tableHtml += "<div  class='col-md-12 pull-left'>"
    tableHtml += "    <button  type='button' style='margin-left:0.4em' id='addLinhaBtn' class='btn btn-default'>Adicionar Linha</button>"
    tableHtml += "    <button onClick='actualizarConfiguracaoMrender()' type='button' style='margin-left:0.4em' id='actualizarConfig' class='btn btn-primary'>Actualizar Configuração</button>"

    tableHtml += "  </div>"
    $("#campos > .row:last").after("<div style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'>" + tableHtml + "</div>");

    fetchConfigMrender(GConfigCodigo)



}

function fetchConfigMrender(codigo) {

    $.ajax({
        type: "POST",
        async: false,
        url: "../programs/gensel.aspx?cscript=getmrendconfig",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ codigo: codigo }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
                var config = response.data;
                renderConfigMrender(config);
            } catch (error) {
                console.log("Erro interno " + errorMessage, error)
            }

        }
    });

}

function renderConfigMrender(config) {

    var colunas = [new ColunaMrenderConfig({})]
    colunas = config.colunas || [];
    var linhas = [new LinhaMrenderConfig({})];
    linhas = config.linhas || [];
    var celulas = [new CelulaMrenderConfig({})];
    celulas = config.celulas || [];

    colunasSetInicio = colunas.filter(function (coluna) {
        return coluna.setinicio;
    });

    colunasSetFim = colunas.filter(function (coluna) {
        return coluna.setfim;
    });

    colunasNormais = colunas.filter(function (coluna) {
        return !coluna.setinicio && !coluna.setfim;
    });

    var colunasAjustadas = [];
    colunasAjustadas = colunasSetInicio.concat(colunasNormais).concat(colunasSetFim);

    colunas = colunasAjustadas

    colunas.forEach(function (coluna) {

        var colunaUIObjectFormConfigAndSourceValues = getColunaUIObjectFormConfigAndSourceValues();
        var col = new ColunaMrenderConfig(coluna);
        col.objectsUIFormConfig = colunaUIObjectFormConfigAndSourceValues.objectsUIFormConfig;
        col.localsource = colunaUIObjectFormConfigAndSourceValues.localsource;
        GMrendConfigColunas.push(col);
        addColunaMrenderConfig(col, colunaUIObjectFormConfigAndSourceValues);


    })






    linhas.forEach(function (linha) {

        setLinhasConfigMrender(linha, linhas, celulas);
        var sublinhas = linhas.filter(function (sublinha) {
            return sublinha.linkstamp == linha.linhastamp && sublinha.linkstamp;
        });

        //console.log("Sublinhas", linha.descricao, sublinhas)

        sublinhas.forEach(function (sublinha) {

            setLinhasConfigMrender(sublinha, linhas, celulas);

        });


    });

    handleTableReactive();





}

function setLinhasConfigMrender(linha, linhas, celulas) {

    var linhaAdicionada = GMrendConfigLinhas.find(function (l) {
        return l.linhastamp == linha.linhastamp;
    });

    if (linhaAdicionada) {
        // Linha já existe, não adiciona novamente
        return;
    }
    var linhaUIObjectFormConfigResult = getLinhaUIObjectFormConfigAndSourceValues();
    linhaUIObjectFormConfigResult.idField = "linhastamp";

    var celulasLinha = [];

    GMrendConfigColunas.forEach(function (coluna) {
        var celulasFilt = celulas.filter(function (celula) {
            return celula.linhastamp == linha.linhastamp && celula.colunastamp == coluna.colunastamp;
        });
        if (celulasFilt.length > 0) {

            var celula = new CelulaMrenderConfig(celulasFilt[0]);
            var celulaUIObjectFormConfigAndSourceValues = getCelulaUIObjectFormConfigAndSourceValues();
            celula.objectsUIFormConfig = celulaUIObjectFormConfigAndSourceValues.objectsUIFormConfig;
            celula.localsource = celulaUIObjectFormConfigAndSourceValues.localsource;
            celula.idField = celulaUIObjectFormConfigAndSourceValues.idField;
            celulasLinha.push(celula);

        }
        else {
            celulasLinha.push(new CelulaMrenderConfig({
                linhastamp: linha.linhastamp,
                colunastamp: coluna.colunastamp,
                codigocoluna: coluna.codigocoluna,
                celulastamp: generateUUID(),
                sinalnegativo: false,
                inactivo: false,
                desabilitado: false,
                usafnpren: false,
                atributo: "",
                fnpren: "",
                fx: "",
                temfx: false,
                idField: getCelulaUIObjectFormConfigAndSourceValues().idField,
                localsource: getCelulaUIObjectFormConfigAndSourceValues().localsource,
                objectsUIFormConfig: getCelulaUIObjectFormConfigAndSourceValues().objectsUIFormConfig
            }));
        }
    })

    var linhaMrender = new LinhaMrenderConfig(linha);

    linhaMrender.objectsUIFormConfig = getLinhaUIObjectFormConfigAndSourceValues().objectsUIFormConfig;
    linhaMrender.localSource = getLinhaUIObjectFormConfigAndSourceValues().localsource;
    GMrendConfigCelulas = GMrendConfigCelulas.concat(celulasLinha);
    GMrendConfigLinhas.push(linhaMrender);

    addLinhaMrenderConfig(linhaMrender.tipo, linhaMrender, linhaUIObjectFormConfigResult, celulasLinha);




}


function handleTableReactive() {

    PetiteVue.createApp({
        GMrendConfigLinhas: GMrendConfigLinhas,
        GMrendConfigColunas: GMrendConfigColunas,
        GMrendConfigCelulas: GMrendConfigCelulas,
        GlickedRowComponent: GlickedRowComponent,
        getDescricaoByLinhaStamp: function (linhastamp) {
            var linha = this.GMrendConfigLinhas.find(function (l) {
                return l.linhastamp == linhastamp;
            });
            //console.log("getDescricaoByLinhaStamp", linha, linhastamp)
            if (linha) {
                return linha.descricao;
            }
            return "";
        },
        syncByColunaStamp: function (colunastamp) {
            var coluna = this.GMrendConfigColunas.find(function (c) {
                return c.colunastamp == colunastamp;
            });
            if (coluna) {

                this.GMrendConfigCelulas.filter(function (celula) {
                    return celula.colunastamp == coluna.colunastamp;
                }).map(function (celula) {

                    celula.codigocoluna = coluna.codigocoluna;
                    celula.desccoluna = coluna.desccoluna;
                });

                return coluna.desccoluna;
            }


            return "";
        }

    }).mount('#inputReportTable');

}

function addColunaMrenderConfig(coluna, colunaUIObjectFormConfigResult) {


    var botaoRemoverColuna = {
        style: "",
        buttonId: "",
        classes: "btn btn-xs btn-default remover-coluna-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Remover coluna' ",
        label: "<span class='glyphicon glyphicon glyphicon-trash' ></span>",
        onClick: "",
    };

    var buttonHtml = generateButton(botaoRemoverColuna)

    var contentColuna = "<div class='colunaHeader' >" + " {{ syncByColunaStamp('" + coluna.colunastamp + "') }}" + "</div>" + buttonHtml

    GRendConfigTableHtml.header.row.cols.push({
        style: "",
        colId: coluna.codigocoluna,
        classes: "colunaHeader ",
        content: contentColuna,
        customData: "",
    });

    var customData = " idValue='" + coluna.colunastamp + "' localsource='" + colunaUIObjectFormConfigResult.localsource + "'  idfield='" + colunaUIObjectFormConfigResult.idField + "'"
    var table = $("#" + GRendConfigTableHtml.tableId);
    var thHtml = "<th " + customData + " class='colunaHeader mrendconfig-item' id='" + coluna.colunastamp + "'>" + contentColuna + "</th>";

    if (table.find("thead").length > 0) {
        table.find("thead tr").append(thHtml);
    } else {
        var thAcoes = "<th class='colunaHeader' id='coluna-acoes'>Acções</th>";
        var theadHtml = "<thead><tr class='defgridheader'>" + thAcoes + thHtml + "</tr></thead>";
        table.prepend(theadHtml);
    }


    GMrendConfigLinhas.forEach(function (linha) {
        var celulastamp = generateUUID();

        var celulaUIObjectFormConfigResult = getCelulaUIObjectFormConfigAndSourceValues();
        var celula = new CelulaMrenderConfig({
            linhastamp: linha.linhastamp,
            celulastamp: celulastamp,
            colunastamp: coluna.colunastamp,
            codigocoluna: coluna.codigocoluna,
            sinalnegativo: false,
            inactivo: false,
            desabilitado: false,
            usafnpren: false,
            atributo: "",
            fnpren: "",
            fx: "",
            temfx: false,
            idField: celulaUIObjectFormConfigResult.idField,
            locasource: celulaUIObjectFormConfigResult.localsource,
            objectsUIFormConfig: celulaUIObjectFormConfigResult.objectsUIFormConfig,
        });

        GMrendConfigCelulas.push(celula);

        var textInputData = {
            type: "text",
            value: coluna.desccoluna,
            classes: "form-control bind-table-control input-sm table-input-col cell-config-inpt ",
            style: "background:#eff0f1!important",
            customData: ":value=syncByColunaStamp('" + celula.colunastamp + "')",
            placeholder: ""
        };



        var colContent = generateInput(textInputData);
        var customCelulaUIData = " idValue='" + celula.celulastamp + "' localsource='" + celulaUIObjectFormConfigResult.localsource + "'  idfield='" + celula.idField + "'"

        var $tr = table.find("tbody tr#" + linha.linhastamp);
        if ($tr.length) {
            $tr.append("<td " + customCelulaUIData + " class='mrendconfig-item' data-colunacell='" + coluna.colunastamp + "'   id='" + celula.celulastamp + "'>" + colContent + "</td>");
        }

    });

    handleTableReactive();
}


function removerColunaMrenderConfig(colunastamp) {


    if (GMrendConfigColunas.length == 1) {
        GMrendConfigCelulas = []
        GMrendConfigColunas = []
        GMrendConfigLinhas = []
        $("#" + GRendConfigTableHtml.tableId + " thead").remove();
        $("#" + GRendConfigTableHtml.tableId + " tbody").empty();
        return
    }

    var coluna = GMrendConfigColunas.find(function (col) {
        return col.colunastamp == colunastamp;
    });

    if (coluna) {
        // Remove do array de colunas
        GMrendConfigColunas.splice(GMrendConfigColunas.indexOf(coluna), 1);

        // Remove todas as células do DOM que tenham o atributo data-colunacell igual ao codigocoluna
        $("[data-colunacell='" + colunastamp + "']").closest("td").remove();

        // Remove do array de células todas que tenham colunastamp igual ao da coluna removida
        GMrendConfigCelulas = GMrendConfigCelulas.filter(function (celula) {
            return celula.colunastamp !== colunastamp;
        });

        // Remove o cabeçalho da coluna
        $("#" + colunastamp).remove();
    }


}


function getLocalSource(source) {
    var localsource = []
    localsource = eval(source)
    return localsource
}

function registerListenersMrender() {

    $(document).off("click", ".remover-coluna-btn").on("click", ".remover-coluna-btn", function (e) {
        removerColunaMrenderConfig($(this).closest("th").attr("id"));
    });

    $(document).off("click", "#addColunaBtn").on("click", "#addColunaBtn", function (e) {

        var colunastamp = generateUUID();
        var codigocoluna = "COLUNA" + colunastamp;
        var colunaUIObjectFormConfigResult = getColunaUIObjectFormConfigAndSourceValues();

        var maxOrdemColuna = GMrendConfigColunas.reduce(function (max, col) {
            return Math.max(max, col.ordem || 0);
        }, 0);
        var coluna = new ColunaMrenderConfig({
            colunastamp: colunastamp,
            codigocoluna: codigocoluna,
            desccoluna: "Coluna " + (GMrendConfigColunas.length + 1),
            campo: "campo",
            relatoriostamp: GRelatorioStamp,
            tipo: "",
            atributo: "",
            campovalid: "",
            condicaovalidacao: "",
            validacoluna: false,
            expresscolfun: "",
            colfunc: false,
            ordem: maxOrdemColuna + 1,
            expressaotbjs: "",
            usaexpresstbjs: false,
            usaexpressaocoldesc: false,
            expresssaojscoldesc: "",
            nometb: "",
            valtb: "",
            categoria: "default",
            expressaodb: "",
            expressaojsevento: "",
            executaeventochange: false,
            inactivo: false,
            decimais: 0,
            proibenegativo: false,
            objectsUIFormConfig: colunaUIObjectFormConfigResult.objectsUIFormConfig,
            localsource: colunaUIObjectFormConfigResult.localsource,
        });

        GMrendConfigColunas.push(coluna);
        addColunaMrenderConfig(coluna, colunaUIObjectFormConfigResult);
    });

    $(document).off("click", "#addLinhaBtn").on("click", "#addLinhaBtn", function (e) {

        var dadosNovaLinha = setNovaLinha("Grupo");
        var linha = dadosNovaLinha.linha;
        var linhaUIObjectFormConfigResult = dadosNovaLinha.linhaUIObjectFormConfigResult;
        var celulas = dadosNovaLinha.celulas;

        addLinhaMrenderConfig("Grupo", linha, linhaUIObjectFormConfigResult, celulas);

        GMrendConfigLinhas.push(linha);
        GMrendConfigCelulas = GMrendConfigCelulas.concat(celulas);
        handleTableReactive();


    })

    $(document).off("click", ".mrendconfig-item").on("click", ".mrendconfig-item", function (e) {

        var idValue = $(this).attr("idValue");
        var localsource = $(this).attr("localsource");
        var idField = $(this).attr("idfield");
        var localSource = getLocalSource(localsource);

        var mrendConfigItem = localSource.find(function (obj) {
            return obj[idField] == idValue;
        });
        var objectsUIFormConfig = [new UIObjectFormConfig({})]
        if (mrendConfigItem) {

            objectsUIFormConfig = mrendConfigItem.objectsUIFormConfig;

            var sufixoForm = localsource;
            var containerId = "Container" + localsource;

            var sourceData = {
                sourceTable: localsource,
                sourceKey: localsource
            }
            var containers = []
            objectsUIFormConfig.forEach(function (obj) {

                containers.push({
                    colSize: obj.colSize,
                    style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                    content: {
                        contentType: obj.contentType,
                        type: obj.tipo,
                        id: obj.campo,
                        classes: obj.classes + " mrendconfig-item-input",
                        customData: obj.customData + " v-model='mrendConfigItem." + obj.campo + "'",
                        style: obj.style,
                        selectCustomData: obj.customData + " v-model='mrendConfigItem." + obj.campo + "'",
                        fieldToOption: obj.fieldToOption,
                        fieldToValue: obj.fieldToValue,
                        label: obj.titulo,
                        selectData: obj.selectValues,
                        value: mrendConfigItem[obj.campo],
                        event: "",
                        placeholder: "",

                    }
                })


            });

            $("#modalRendConfigItem").remove()
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

            var modalRendConfigItem = {
                title: "Configuração ",
                id: "modalRendConfigItem",
                customData: "",
                otherclassess: "",
                body: modalBodyHtml,
                footerContent: "",
            };
            var modalHTML = generateModalHTML(modalRendConfigItem);

            $("#maincontent").append(modalHTML);

            $("#modalRendConfigItem").modal("show");
            PetiteVue.createApp({
                mrendConfigItem: mrendConfigItem
            }).mount('#maincontent');


        }


    });

}



function setNovaLinha(tipo) {


    var linhastamp = generateUUID();
    var linkstamp = "";

    if (tipo === "Subgrupo" && GlickedRowComponent) {
        var parentRowId = GlickedRowComponent.attr("id");
        var parentLinha = GMrendConfigLinhas.find(function (l) { return l.linhastamp === parentRowId; });
        if (parentLinha) {
            linkstamp = parentLinha.linhastamp;
        }

    }

    var linhaUIObjectFormConfigResult = getLinhaUIObjectFormConfigAndSourceValues();
    var ordem = GMrendConfigLinhas.reduce(function (max, linha) {
        return Math.max(max, linha.ordem || 0);
    }, 0);


    var linha = new LinhaMrenderConfig({
        linhastamp: linhastamp,
        linkstamp: linkstamp,
        relatoriostamp: GRelatorioStamp,
        parentstamp: "",
        temcolunas: true,
        tipo: tipo || "",
        codigo: "LINHA" + linhastamp,
        descricao: "Linha " + (GMrendConfigLinhas.length + 1),
        origem: "",
        expressao: "",
        campovalid: "",
        sinalnegativo: false,
        temtotais: false,
        totkey: "",
        totfield: "",
        condicaovalidacao: "",
        categoria: "default",
        codcategoria: "",
        ordem: ordem + 1,
        usafnpren: false,
        fnpren: "",
        tipolistagem: "table",
        objectolist: "",
        executachange: false,
        expressaochangejs: "",
        cor: "",
        localsource: linhaUIObjectFormConfigResult.localsource,
        objectsUIFormConfig: linhaUIObjectFormConfigResult.objectsUIFormConfig,
    });

    var celulas = [new CelulaMrenderConfig({})]
    celulas = [];

    GMrendConfigColunas.forEach(function (coluna) {
        var celulastamp = generateUUID();
        var celulaUIObjectFormConfigAndSourceValues = getCelulaUIObjectFormConfigAndSourceValues();
        var celula = new CelulaMrenderConfig({
            linhastamp: linhastamp,
            celulastamp: celulastamp,
            colunastamp: coluna.colunastamp,
            codigocoluna: coluna.codigocoluna,
            sinalnegativo: false,
            inactivo: false,
            desabilitado: false,
            usafnpren: false,
            atributo: "",
            fnpren: "",
            fx: "",
            temfx: false,
            idField: celulaUIObjectFormConfigAndSourceValues.idField,
            localsource: celulaUIObjectFormConfigAndSourceValues.localsource,
            objectsUIFormConfig: celulaUIObjectFormConfigAndSourceValues.objectsUIFormConfig,
        });

        celulas.push(celula);

    });


    return { linha: linha, linhaUIObjectFormConfigResult: linhaUIObjectFormConfigResult, celulas: celulas };


}
function addLinhaMrenderConfig(tipo, linha, linhaUIObjectFormConfigResult, celulas) {


    if (GMrendConfigColunas.length === 0) {
        alertify.error("Adicione colunas primeiro", 10000);
        return;
    }
    var cols = [];
    var customDataUIObjectLinha = " idValue='" + linha.linhastamp + "' localsource='" + linhaUIObjectFormConfigResult.localsource + "'  idfield='" + linhaUIObjectFormConfigResult.idField + "'"

    var cols = [];
    cols.push({
        style: "",
        colId: "acoes_" + linha.linhastamp,
        classes: "linha-acoes",
        content:
            "<button style='color:white!important;background:#d9534f!important' type='button' class='btn btn-danger btn-sm remover-linha-btn' title='Remover linha'><span class='glyphicon glyphicon-trash'></span></button> " +
            "<button type='button' class='btn btn-primary btn-sm adicionar-linha-btn' title='Adicionar linha'><span class='glyphicon glyphicon-plus'></span></button>" +
            "<span " + customDataUIObjectLinha + " class='mrendconfig-item' style='margin-left:0.3em'>" + " {{ getDescricaoByLinhaStamp('" + linha.linhastamp + "') }}" + "</span>",
        customData: ""
    });


    celulas.forEach(function (celula) {

        var coluna = GMrendConfigColunas.find(function (col) {
            return col.colunastamp == celula.colunastamp;
        });

        if (!coluna) {

            throw new Error("Coluna não encontrada: " + celula.colunastamp);
        }
        var textInputData = {
            type: "text",
            value: "",
            classes: "form-control bind-table-control input-sm table-input-col cell-config-inpt  ",
            style: "background:#eff0f1!important",
            customData: ":value=syncByColunaStamp('" + celula.colunastamp + "')",
            placeholder: ""
        };

        var customCelulaUIData = " idValue='" + celula.celulastamp + "' localsource='" + celula.localsource + "'  idfield='" + celula.idField + "'"


        var colContent = generateInput(textInputData)
        cols.push({
            style: "",
            colId: celula.celulastamp,
            classes: "mrendconfig-item",
            content: colContent,
            customData: "data-colunacell='" + coluna.colunastamp + "' " + customCelulaUIData
        });
    });

    var rowObj = {
        style: "" + (linha.tipo == "Grupo" ? "background:#e9f1ff!important" : ""),
        rowId: linha.linhastamp,
        classes: "linhaHeader",
        customData: "linkstamp='" + linha.linkstamp + "'",
        cols: cols
    };

    // Gera o HTML da linha
    var trHtml = generateRowAbove(rowObj);



    var table = $("#" + GRendConfigTableHtml.tableId);
    if (table.find("tbody").length === 0) {
        table.append("<tbody></tbody>");
    }


    if (tipo == "Subgrupo" && linha.linkstamp) {

        var $rows = table.find("tbody tr[linkstamp='" + linha.linkstamp + "']");
        if ($rows.length > 0) {
            $rows.last().after(trHtml);
        } else {
            // Se não encontrar, insere após a linha pai
            var $parentRow = table.find("tbody tr#" + linha.linkstamp);
            if ($parentRow.length) {
                $parentRow.after(trHtml);
            } else {
                table.find("tbody").append(trHtml);
            }
        }
    } else {

        table.find("tbody").append(trHtml);
    }


    table.find(".remover-linha-btn").off("click").on("click", function () {
        var $tr = $(this).closest("tr");
        var linhastamp = $tr.attr("id");
        var linhaObj = GMrendConfigLinhas.find(function (l) { return l.linhastamp === linhastamp; });

        // Função recursiva para remover filhos do DOM e dos arrays
        function removerFilhosRecursivo(parentStamp) {
            // Remove filhos do DOM
            table.find("tbody tr[linkstamp='" + parentStamp + "']").each(function () {
                var filhoStamp = $(this).attr("id");
                $(this).remove();
                // Remove do array de linhas
                GMrendConfigLinhas = GMrendConfigLinhas.filter(function (l) { return l.linhastamp !== filhoStamp; });
                // Remove do array de células
                GMrendConfigCelulas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp !== filhoStamp; });
                // Recursivo para sub-filhos
                removerFilhosRecursivo(filhoStamp);
            });
        }

        if (linhaObj && linhaObj.tipo === "Grupo") {
            removerFilhosRecursivo(linhastamp);
        }

        // Remove a linha principal do DOM
        $tr.remove();
        // Remove do array de linhas
        GMrendConfigLinhas = GMrendConfigLinhas.filter(function (l) { return l.linhastamp !== linhastamp; });
        // Remove do array de células
        GMrendConfigCelulas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp !== linhastamp; });
    });
    table.find(".adicionar-linha-btn").off("click").on("click", function () {

        GlickedRowComponent = $(this).closest("tr");
        var dadosNovaLinha = setNovaLinha("Subgrupo");
        var linha = dadosNovaLinha.linha;
        var linhaUIObjectFormConfigResult = dadosNovaLinha.linhaUIObjectFormConfigResult;
        var celulas = dadosNovaLinha.celulas;
        addLinhaMrenderConfig("Subgrupo", linha, linhaUIObjectFormConfigResult, celulas);
        GMrendConfigLinhas.push(linha);
        GMrendConfigCelulas = GMrendConfigCelulas.concat(celulas);
        GlickedRowComponent = null;
        handleTableReactive()

    });


}

function actualizarConfiguracaoMrender() {

    var configData = [{
        sourceTable: "MrendColuna",
        sourceKey: "colunastamp",
        records: GMrendConfigColunas
    },
    {
        sourceTable: "MrendLinha",
        sourceKey: "linhastamp",
        records: GMrendConfigLinhas
    },
    {
        sourceTable: "MrendCelula",
        sourceKey: "celulastamp",
        records: GMrendConfigCelulas
    }]

    console.log("configData", configData)
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizarmrendconfig",

        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GRelatorioStamp, config: configData }]),
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
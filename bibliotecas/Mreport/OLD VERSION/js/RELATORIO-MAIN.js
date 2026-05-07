var fontes = new Array()
var colunaHtmlData
var celulaHtmlData
var grupoHtmlData
var colunas = []
var celulas = []
var linhas = []
var grupos = []
var gruposRelatorio = []
var dadosLinhas = []
var dadosColunas = []
var confRelatorio = []
var referencedGroups = []
var celulaHtmlObject
var valorDinamicoHtmlObject
var selectCellMode = false
var dadosValoresDinamicos = []

function pageLoad() {
    organizarEcra()
    getFonteDados()
    registerListeners()
    listagemHandler()
    initModalColuna()
    initModalCelula()
    initmodalGrupo()
}

function getSyncstamp() {

    return $("#ctl00_conteudo_syncstamp_mLabel1").text()
}
function organizarEcra() {

    setTimeout(function () {
        $("#ctl00_conteudo_syncstamp").hide()
    }, 500)

}
function actualizarColuna(elem) {
    colunas = []
    celulas = []
    linhas = []
    grupos = []

    $("#listagemContainer .overlay").show()
    if ($("#listagemTable tbody tr").length == 0) {
        alertify.error("Adicione registos para a listagem ", 10000)
        $("#listagemContainer .overlay").hide()
        return false
    }
    $("#listagemTable thead  .coluna-conf").each(function () {
        var header = $(this)
        var colunaId = header.attr("id")
        var codigo = header.attr("data-codigo");
        var valor = header.attr("data-valor");
        var ordem = header.attr("data-ordem") ? header.attr("data-ordem") : 0



        colunas.push({
            u_colunarelstamp: colunaId,
            codigo: codigo,
            valor: valor,
            ordem: ordem,
            syncstamp: getSyncstamp()
        })
    })



    $(".grupo-item td:nth-child(2)").each(function () {

        //console.log($(this).attr("data-tipodado"),"GP TIPO DADO")
        grupos.push({
            u_gruporelstamp: $(this).closest("tr").attr("id"),
            temcalculo: $(this).attr("data-temcalculo") == "true" ? true : false,
            temtotais: $(this).attr("data-temtotais") == "true" ? true : false,
            tipodado: ($(this).attr("data-tipodado") ? $(this).attr("data-tipodado") : "text"),
            expressaogrupo: ($(this).attr("data-expressaogrupo") ? $(this).attr("data-expressaogrupo") : ""),
            colunastotais: ($(this).attr("data-colunastotais") ? $(this).attr("data-colunastotais") : ""),
            syncstamp: getSyncstamp(),
            descricao: $(this).find(".grupo-nome-span").text(),
            noderef: "",
            parent: true,
            ordem: $(this).attr("data-ordem") ? $(this).attr("data-ordem") : 0
        })

    })

    $(".subgrupo-item td:nth-child(2)").each(function () {

        grupos.push({
            u_gruporelstamp: $(this).closest("tr").attr("id"),
            descricao: $(this).find(".grupo-nome-span").text(),
            temtotais: $(this).attr("data-temtotais") == "true" ? true : false,
            temcalculo: $(this).attr("data-temcalculo") == "true" ? true : false,
            tipodado: ($(this).attr("data-tipodado") ? $(this).attr("data-tipodado") : "text"),
            expressaogrupo: ($(this).attr("data-expressaogrupo") ? $(this).attr("data-expressaogrupo") : ""),
            colunastotais: ($(this).attr("data-colunastotais") ? $(this).attr("data-colunastotais") : ""),
            syncstamp: getSyncstamp(),
            noderef: ($(this).closest("tr").attr("data-tt-parent-id") ? $(this).closest("tr").attr("data-tt-parent-id") : ""),
            parent: false,
            ordem: $(this).closest("tr").attr("data-ordem") ? $(this).closest("tr").attr("data-ordem") : 0
        });

    })

    console.log("grupos", grupos),

        console.log("colunas", colunas)

    $(".linha-item").each(function () {

        var linha = $(this)
        var Id = linha.attr("id")
        linhas.push({
            u_linhastamp: Id,
            valor: "",
            syncstamp: getSyncstamp(),
            temgrupo: linha.attr("data-temgrupo") == "true" ? true : false,
            campoagrupamento: linha.attr("data-campoagrupamento") ? linha.attr("data-campoagrupamento") : "",
            expressao: linha.attr("data-expressaolinha") ? linha.attr("data-expressaolinha") : "",
            ordem: linha.attr("data-ordem") ? linha.attr("data-ordem") : 0,
            grupostamp: $(this).attr("data-tt-parent-id") ? $(this).attr("data-tt-parent-id") : ""
        })

        linha.find(".celula-inpt").each(function () {
            var celula = $(this)
            var row = celula.closest("tr")
            var celulaId = celula.attr("data-celulaid")
            var colunaId = celula.attr("data-colunaid")
            var valor = celula.val()
            var tipo = (celula.attr("data-tipo") ? celula.attr("data-tipo") : "text");
            var valordinamico = celula.attr("data-valordinamico") ? celula.attr("data-valordinamico") : "[]";
            var temCalculo = celula.attr("data-temcalculo")
            celulas.push({
                stamplinha: Id,
                stampcoluna: colunaId,
                u_celulastamp: celulaId,
                valordinamico: valordinamico,
                tipocelula: tipo,
                valor: valor,
                calculo: (temCalculo == "true" ? true : false),
                syncstamp: getSyncstamp()
            });
        })

    });

    //console.log("linhas", linhas)

    console.log({ syncstamp: getSyncstamp(), grupos: grupos, linhas: linhas, colunas: colunas, celulas: celulas })
    var promise = $.ajax({
        type: "POST",
        // async: false,
        url: "../programs/gensel.aspx?cscript=gravarlistagem",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp(), grupos: grupos, linhas: linhas, colunas: colunas, celulas: celulas }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    $("#listagemContainer .overlay").hide()
                    return false
                }
                $("#listagemContainer .overlay").hide()
                alertify.success("Sucesso ", 10000)
                listagemHandler()
                // getListagemFixa()
            } catch (error) {
                $("#listagemContainer .overlay").hide()
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    })

    promise.then(function (response) {
        $("#listagemContainer .overlay").hide()
    })
}

function adicionarValorDinamico() {

    var dados = {
        descricao: "+",
        valor: "+",
        id: generateUUID(),
        tipo: "Standard"
    }

    dadosValoresDinamicos.push(dados);
    preencherValoresDinamicos()

}

function preencherValoresDinamicos() {

    $(".valor-dinamico-container").remove();

    var html = "<div class='col-md-12 valor-dinamico-container' ><div style='display:flex;flex-direction:column;gap:0.4em' >"

    //console.log("dadosValoresDinamicos",dadosValoresDinamicos)
    dadosValoresDinamicos.forEach(function (item) {


        html += "        <input data-toggle='tooltip'  data-html='true'  data-original-title='" + item.descricao + "' data-id='" + item.id + "' data-valor='" + item.valor + "' value='" + item.descricao + "' class='form-control input-sm descricaoValorDinamico'>"


    })
    html += "</div></div>";

    celulaHtmlObject.attr("data-valordinamico", JSON.stringify(dadosValoresDinamicos))
    $("#valoresDinamicosContainer").append(html);
    $('[data-toggle="tooltip"]').tooltip();
}
function registerListeners() {
    $(document).off("click", ".adicionar-fonte-dados").on("click", ".adicionar-fonte-dados", function () {
        adicionarFonteDados()
    })

    $(document).off("click", ".removeLinha").on("click", ".removeLinha", function () {

        $(this).closest("tr").remove()

        if ($("#listagemTable tbody tr").length == 0) {
            $("#listagemTable thead tr").empty()
        }
        opcoesTabelaHandler()

    })


    $(document).off("dblclick", ".descricaoValorDinamico").on("dblclick", ".descricaoValorDinamico", function (e) {


        valorDinamicoHtmlObject = $(this);
        selectCellMode = true;
        $(".celula-inpt").addClass("select-cell-mode");
        $("#modalCelula").modal("hide");


        //console.log("Double click")

    })

    $(document).off("keyup", ".descricaoValorDinamico").on("keyup", ".descricaoValorDinamico", function (e) {


        if (e.keyCode === 9) {
            //    console.log("Tab foi pressionado");

            return;
        }
        var id = $(this).data("id");
        if (!$(this).val() || $(this).val() == "") {


            dadosValoresDinamicos = dadosValoresDinamicos.filter(function (obj) {

                return obj.id != id
            })

            $(this).remove();
            return
        }

        var valorDinamicoData = dadosValoresDinamicos.find(function (obj) {
            return obj.id == id
        });

        if (valorDinamicoData.tipo == "Celula") {


            dadosValoresDinamicos = dadosValoresDinamicos.filter(function (obj) {

                return obj.id != id
            })

            $(this).remove();
            return
        }

        if (valorDinamicoData) {
            valorDinamicoData.descricao = $(this).val();
            valorDinamicoData.valor = $(this).val();

        }
    })

    $(document).off("click", ".coluna-conf").on("click", ".coluna-conf", function () {

        var colunaId = $(this).attr("id")
        var codigo = $(this).attr("data-codigo")
        var valor = $(this).attr("data-valor")

        $("#modalColuna #codigoColuna").val(codigo)
        $("#modalColuna #valorColuna").val(valor)
        $("#modalColuna #ordemColuna").val($(this).attr("data-ordem"))

        $("#modalColuna").modal("show")
        colunaHtmlData = $(this)

    })

    $(document).off("click", ".gravar-fonte-dados").on("click", ".gravar-fonte-dados", function () {

    })

    $(document).off("click", ".adicionar-coluna-btn").on("click", ".adicionar-coluna-btn", function () {
        adicionarColuna()

    })

    $(document).off("click", ".actualizar-coluna-btnx").on("click", ".actualizar-coluna-btnx", function () {



    })





    //console.log("celulas", celulas)



    //console.log("linha", linhas, "colunas", colunas, "celulas", celulas)

    $(document).off("click", ".subg-grupo-conf").on("click", ".subg-grupo-conf", function () {

        grupoHtmlData = $(this)
        var grupoId = $(this).closest("tr").attr("id")
        temCalculo = $(this).attr("data-temcalculo")
        var tipodado = $(this).attr("data-tipodado")
        var parent = $(this).attr("data-parent")
        var temtotais = $(this).attr("data-temtotais")
        var expressaogrupo = $(this).attr("data-expressaogrupo")
        var colunastotais = $(this).attr("data-colunastotais")

        $("#modalGrupo #temtotais").prop("checked", temtotais == "true" ? true : false)
        $("#modalGrupo #temCalculo").prop("checked", temCalculo == "true" ? true : false)
        $("#modalGrupo #descricao").val($(this).find(".grupo-nome-span").text())
        $("#modalGrupo #tipodado").val(tipodado)
        $("#modalGrupo #tipodado").trigger("change")
        $("#modalGrupo #colunastotais").val(colunastotais)
        $("#modalGrupo #expressaogrupo").val(expressaogrupo)
        $("#modalGrupo #parent").val(parent)
        $("#modalGrupo").modal("show")

    })

    $(document).off("click", ".grupo-conf").on("click", ".grupo-conf", function () {

        grupoHtmlData = $(this)
        var grupoId = $(this).closest("tr").attr("id")
        temCalculo = $(this).attr("data-temcalculo")
        var tipodado = $(this).attr("data-tipodado")
        var parent = $(this).attr("data-parent")
        var temtotais = $(this).attr("data-temtotais")
        var expressaogrupo = $(this).attr("data-expressaogrupo")
        var colunastotais = $(this).attr("data-colunastotais")

        $("#modalGrupo #temCalculo").prop("checked", temCalculo == "true" ? true : false)
        $("#modalGrupo #temtotais").prop("checked", temtotais == "true" ? true : false)
        $("#modalGrupo #descricao").val($(this).find(".grupo-nome-span").text())
        $("#modalGrupo #tipodado").val(tipodado)
        $("#modalGrupo #colunastotais").val(colunastotais)
        $("#modalGrupo #tipodado").trigger("change")
        $("#modalGrupo #expressaogrupo").val(expressaogrupo)
        $("#modalGrupo #parent").val(parent)
        $("#modalGrupo").modal("show")

    })

    $(document).off("click", ".celula-inpt").on("click", ".celula-inpt", function () {




        var celulaId = $(this).attr("data-celulaid")
        var colunaId = $(this).attr("data-colunaid")
        var valor = $(this).val()

        if (selectCellMode) {

            $("#modalCelula").modal("hide");

            selectCellMode = false;
            var colIndex = $(this).closest("td").index();
            var header = $("#listagemTable thead th").eq(colIndex);
            var linhaVal = $(this).closest("tr").find('td:eq(1) .celula-inpt').val();

            var valorCabecalho = header.data("valor");

            var descricao = linhaVal + ";" + valorCabecalho

            var valorDinamicoData = dadosValoresDinamicos.find(function (obj) {
                return obj.id == valorDinamicoHtmlObject.data("id")
            });

            if (valorDinamicoData) {

                valorDinamicoData.descricao = descricao;
                valorDinamicoData.valor = "" + celulaId + "";
                valorDinamicoData.tipo = "Celula";

            }


            $(".celula-inpt").removeClass("select-cell-mode");
            preencherValoresDinamicos();
            celulaHtmlObject.trigger("click");
            return
        }

        celulaHtmlObject = $(this);

        var temCalculo = $(this).attr("data-temcalculo")
        var tipo = $(this).attr("data-tipo")
        var expressaolinha = $(this).closest("tr").attr("data-expressaolinha");


        dadosValoresDinamicos = JSON.parse($(this).attr("data-valordinamico") ? $(this).attr("data-valordinamico") : "[]");


        $("#modalCelula #valorCelula").val(valor)
        $("#modalCelula #expressaolinha").val(expressaolinha)
        $("#modalCelula #temgrupo").prop("checked", $(this).closest("tr").attr("data-temgrupo") == "true" ? true : false)
        $("#modalCelula #campoagrupamento").val($(this).closest("tr").attr("data-campoagrupamento"))
        $("#modalCelula #temCalculo").prop("checked", temCalculo == "true" ? true : false)
        $("#modalCelula #tipocelula").val(tipo)
        $("#modalCelula #tipocelula").trigger("change");
        $("#modalCelula").modal("show")
        celulaHtmlData = $(this);

        preencherValoresDinamicos();


    })

    $(document).off("click", ".adicionar-linha-btn").on("click", ".adicionar-linha-btn", function () {
        adicionarLinha()

    })

    $(document).off("click", ".adicionar-grupo-btn").on("click", ".adicionar-grupo-btn", function () {
        adicionarGrupo()

    })
}
function actualizarDadosGrupo() {

    var descricao = $("#modalGrupo #descricao").val()
    var temCalculo = $("#modalGrupo #temCalculo").is(":checked")
    var temtotais = $("#modalGrupo #temtotais").is(":checked")
    var tipodado = $("#modalGrupo #tipodado").val()
    var colunastotais = $("#modalGrupo #colunastotais").val()
    var expressaogrupo = $("#modalGrupo #expressaogrupo").val()
    var parent = $("#modalGrupo #parent").val()
    //console.log("temCalculo",temCalculo)

    var row = grupoHtmlData.closest("tr")
    grupoHtmlData.attr("data-temcalculo", temCalculo)
    grupoHtmlData.attr("data-temtotais", temtotais)
    grupoHtmlData.attr("data-colunastotais", colunastotais)
    grupoHtmlData.attr("data-tipodado", tipodado)
    grupoHtmlData.attr("data-expressaogrupo", expressaogrupo)
    //grupoHtmlData.attr("data-parent", parent)
    grupoHtmlData.find(".grupo-nome-span").text(descricao)


    $("#modalGrupo").modal("hide")
}
function actualizarDadosColuna() {

    var codigo = $("#modalColuna #codigoColuna").val()
    var valor = $("#modalColuna #valorColuna").val()
    var ordem = $("#modalColuna #ordemColuna").val()
    colunaHtmlData.attr("data-codigo", codigo)
    colunaHtmlData.attr("data-valor", valor)
    colunaHtmlData.attr("data-ordem", ordem)
    colunaHtmlData.text(valor)
    $("#modalColuna").modal("hide")
}
function initModalColuna() {

    var colunaHtml = "<div class='row'>"
    colunaHtml += "    <div class='col-md-6'>"
    colunaHtml += "        <span class='control-label'>Ordem:</span>"
    colunaHtml += "        <input type='number' id='ordemColuna' class='form-control input-sm ordemColuna'>"
    colunaHtml += "    </div>"
    colunaHtml += "    <div class='col-md-6'>"
    colunaHtml += "        <span class='control-label'>Código:</span>"
    colunaHtml += "        <input id='codigoColuna' class='form-control input-sm codigoColuna'>"
    colunaHtml += "    </div>"
    colunaHtml += "    <div class='col-md-6'>"
    colunaHtml += "        <span class='control-label'>Nome:</span>"
    colunaHtml += "        <input id='valorColuna' class='form-control input-sm nomeColuna'>"
    colunaHtml += "    </div>"
    colunaHtml += "    </div>"
    var modalData = {
        title: "Configuração da coluna",
        id: "modalColuna",
        customData: "",
        otherclassess: "",
        body: colunaHtml,
        footerContent: "<button type='button' onClick='actualizarDadosColuna()' class='btn btn-primary'>Actualizar</button>"
    };
    var modalHTML = generateModalHTML(modalData);
    $("#maincontent").append(modalHTML)
}
function initModalCelula() {

    var celulaHtml = "<div class='row'>"
    celulaHtml += "    <div class='col-md-12'>"
    celulaHtml += "        <span class='control-label'>Tem cálculo:</span>"
    celulaHtml += "        <input type='checkbox' id='temCalculo' class='temCalculo'>"
    celulaHtml += "    </div>"
    celulaHtml += "    <div style='margin-top:0.6em' class='col-md-12'>";
    celulaHtml += "        <span class='control-label'>Tipo:</span>";
    celulaHtml += "        <select id='tipocelula' ><option value='digit'>Digit</option><option value='text'>Text</option></select>";
    celulaHtml += "    </div>";

    if ($("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val() == "Dinâmica") {

        celulaHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
        celulaHtml += "        <span class='control-label'>Expressão da listagem:</span>"
        celulaHtml += "        <textarea rows='20' id='expressaolinha' class='form-control input-sm expressaolinha'></textarea>"
        celulaHtml += "    </div>"

        celulaHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
        celulaHtml += "        <span class='control-label'>Tem grupo:</span>"
        celulaHtml += "        <input type='checkbox' id='temgrupo' class='temgrupo'>"
        celulaHtml += "    </div>"

        celulaHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
        celulaHtml += "        <span class='control-label'>Campo de agrupamento:</span>"
        celulaHtml += "        <input id='campoagrupamento' class='form-control input-sm campoagrupamento'>"
        celulaHtml += "    </div>"

    }

    if ($("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val() == "Grupo-Fixa" || $("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val() == "Fixa") {


        celulaHtml += "    <div style='margin-top:0.6em;border-radius:12px;border:1px solid #033076' class='col-md-12'>"
        celulaHtml += "        <span class='control-label'>Valores dinâmicos:</span>"
        celulaHtml += "      <div class='row' id='valoresDinamicosContainer' style='height:107px'>"
        celulaHtml += "     <div style='padding:7px' class='col-md-12 pull-left'> <button type='button' onClick='adicionarValorDinamico()' class='btn btn-primary'><i class='fa fa-plus'></i></button></div>"
        //  celulaHtml += "        <input id='campoagrupamento' class='form-control input-sm campoagrupamento'>"
        celulaHtml += "      </div>"
        celulaHtml += "    </div>"


    }

    celulaHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
    celulaHtml += "        <span class='control-label'>Valor:</span>"
    celulaHtml += "        <textarea rows='20' id='valorCelula' class='form-control input-sm nomeCelula'></textarea>"
    celulaHtml += "    </div>"

    celulaHtml += "    </div>"
    var modalData = {
        title: "Configuração da célula",
        id: "modalCelula",
        customData: "",
        otherclassess: "",
        body: celulaHtml,
        footerContent: "<button type='button' onClick='actualizarDadosCelula()' class='btn btn-primary'>Actualizar</button>"
    };
    var modalHTML = generateModalHTML(modalData);
    $("#maincontent").append(modalHTML)
    $("#tipocelula").select2({
        width: "100%",
    })
}
function initmodalGrupo() {

    var grupoHtml = "<div class='row'>"

    grupoHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
    grupoHtml += "        <span class='control-label'>Descrição:</span>"
    grupoHtml += "        <input id='descricao' class='form-control input-sm descricao'>"
    grupoHtml += "    </div>"
    grupoHtml += "    <div style='margin-top:0.6em' class='col-md-12'>";
    grupoHtml += "        <span class='control-label'>Tipo:</span>";
    grupoHtml += "        <select id='tipodado' ><option value='digit'>Digit</option><option value='text'>Text</option></select>";
    grupoHtml += "    </div>";


    grupoHtml += "    <div class='col-md-12'>"
    grupoHtml += "        <span class='control-label'>Tem cálculo:</span>"
    grupoHtml += "        <input type='checkbox' id='temCalculo' class='temCalculo'>"
    grupoHtml += "    </div>"
    grupoHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
    grupoHtml += "        <span class='control-label'>Expressão do grupo:</span>"
    grupoHtml += "        <textarea rows='20' id='expressaogrupo' class='form-control input-sm expressaolinha'></textarea>"
    grupoHtml += "    </div>"
    grupoHtml += "    <div class='col-md-12'>"
    grupoHtml += "        <span class='control-label'>Tem totais:</span>"
    grupoHtml += "        <input type='checkbox' id='temtotais' class='temtotais'>"
    grupoHtml += "    </div>"

    grupoHtml += "    <div style='margin-top:0.6em' class='col-md-12'>"
    grupoHtml += "        <span class='control-label'>Colunas de  totais:</span>"
    grupoHtml += "        <input id='colunastotais' class='form-control input-sm colunastotais'>"
    grupoHtml += "    </div>"

    grupoHtml += "    </div>"
    var modalData = {
        title: "Configuração do grupo",
        id: "modalGrupo",
        customData: "",
        otherclassess: "",
        body: grupoHtml,
        footerContent: "<button type='button' onClick='actualizarDadosGrupo()' class='btn btn-primary'>Actualizar</button>"
    };
    var modalHTML = generateModalHTML(modalData);
    $("#maincontent").append(modalHTML)
    $("#tipodado").select2({
        width: "100%",
    })
}
function actualizarDadosCelula() {

    var valor = $("#modalCelula #valorCelula").val()
    var temCalculo = $("#modalCelula #temCalculo").is(":checked")
    var tipocelula = $("#modalCelula #tipocelula").val()
    var expressaolinha = $("#modalCelula #expressaolinha").val()
    var temgrupo = $("#modalCelula #temgrupo").is(":checked")
    var campoagrupamento = $("#modalCelula #campoagrupamento").val()
    //console.log("temCalculo",temCalculo)
    var celulaId = celulaHtmlData.attr("data-celulaid")
    var colunaId = celulaHtmlData.attr("data-colunaid")
    var row = celulaHtmlData.closest("tr")

    // console.log("celulaId",celulaId)
    //console.log("colunaId",colunaId)
    $("#listagemTable tbody tr td input[data-celulaid='" + celulaId + "']").val(valor)
    $("#listagemTable tbody tr td input[data-celulaid='" + celulaId + "']").attr("data-temcalculo", temCalculo)
    $("#listagemTable tbody tr td input[data-celulaid='" + celulaId + "']").attr("data-valordinamico", JSON.stringify(dadosValoresDinamicos))

    row.attr("data-expressaolinha", expressaolinha)
    row.attr("data-temgrupo", temgrupo)
    row.attr("data-campoagrupamento", campoagrupamento)
    $("#listagemTable tbody tr td input[data-celulaid='" + celulaId + "']").attr("data-tipo", tipocelula)
    $("#modalCelula").modal("hide")

}


function removeGrupo(elem) {

    var id = $(elem).closest("tr").attr("id")
    $("#listagemTable tbody tr[data-tt-parent-id='" + id + "']").remove()
    $(elem).closest("tr").remove()

}
function adicionarGrupo() {
    var grupoId = generateUUID()
    var linhaItem = "<tr id='" + grupoId + "' class='grupo-item'>"
    linhaItem += "    <td>"
    linhaItem += "        <input readonly class='form-control input-sm grupo-nome' type='text'>"
    linhaItem += "    </td>"
    linhaItem += "    </tr>"

    var totalColunas = $("#listagemTable tbody tr").length
    // var numeroLinha = (totalLinhas > 0 ? totalLinhas + 1 : "")
    //$("#listagemTable tbody").append("<tr class='linha-item'><td><input class='form-control input-sm linha-nome' type='text'></td></tr>")

    /*  if (totalLinhas == 0) {
          $("#listagemTable thead tr").append("<th class='linha-nome'>Linha " + numeroLinha + "</th>")
      }*/

    var maxOrdem = 0; // Initialize with negative infinity to ensure any value will be greater

    $("#listagemTable tr[data-ordem]").each(function () {
        var ordem = parseInt($(this).attr("data-ordem"));

        if (ordem > maxOrdem) {
            maxOrdem = ordem;
        }
    });

    var ordem = maxOrdem + 1;
    var nomeGrupo = "Grupo" + ordem

    //  var tbody = $(this).closest("tbody")
    var coluna = "<td><button onClick=removeGrupo(this) type='button' style='color:white!important;background:#d9534f!important;margin-right:0.4em' class='btn btn-sm btn-danger removeGrupo'><i class='fa fa-trash-o'></i></button>"
    coluna += "<button type='button' onClick=adicionarSubgrupo(this)  class='btn btn-sm btn-primary addSubgrupo'><i class='fa fa-plus'></i> G</button>"
    coluna += "<button type='button' style='margin-left:0.4em;background:#417ad3!important;color:white' onClick=adicionarLinhaGrupo(this)  class='btn btn-sm  addLinhaGrupo'><i class='fa fa-plus'></i> L</button>"
    coluna += "</td>"
    coluna += "<td class='grupo-conf' colspan='" + ($("#listagemTable thead  .coluna-conf").length) + "'>"
    coluna += "        <span style='color:#033076' class='grupo-nome-span'>" + nomeGrupo + "</span>"
    coluna += "</td>"


    //console.log("TD",coluna)

    $("#listagemTable tbody").append("<tr data-parent=true data-tt-id='" + grupoId + "' style='background:#e9f1ff!important' data-parent=true data-grupoid='" + grupoId + "' data-ordem='" + ordem + "' id='" + grupoId + "' class='grupo-item'>" + coluna + "</tr>")




    //  $(this).append("<td><input class='form-control input-sm celula-inpt' type='text'></td>")
    // })

    opcoesTabelaHandler()
    //$("#listagemContainer #listagemBody").append(linhaItem);
}

function adicionarSubgrupo(elem) {
    var grupoId = generateUUID()
    var maxOrdem = 0; // Initialize with negative infinity to ensure any value will be greater

    var parentId = $(elem).closest("tr").attr("id")

    $("#listagemTable tr[data-tt-parent-id='" + parentId + "']").each(function () {
        var ordem = parseInt($(this).attr("data-ordem"));

        if (ordem > maxOrdem) {
            maxOrdem = ordem;
        }
    });

    var ordem = maxOrdem + 1;
    var nomeGrupo = "Grupo" + ordem

    //  var tbody = $(this).closest("tbody")  
    var coluna = "<td><button onClick=removeGrupo(this) type='button' style='color:white!important;background:#d9534f!important;margin-right:0.4em' class='btn btn-sm btn-danger removeGrupo'><i class='fa fa-trash-o'></i></button>"
    coluna += "<button type='button' onClick=adicionarSubgrupo(this)  class='btn btn-sm btn-primary addSubgrupo'><i class='fa fa-plus'></i> G</button>"
    coluna += "<button type='button' style='margin-left:0.4em;background:#417ad3!important;color:white' onClick=adicionarLinhaGrupo(this)  class='btn btn-sm  addLinhaGrupo'><i class='fa fa-plus'></i> L</button>"
    coluna += "</td>"
    coluna += "<td class='subg-grupo-conf' colspan='" + ($("#listagemTable thead  .coluna-conf").length) + "'>"
    coluna += "        <span style='color:#033076' class='grupo-nome-span'>" + nomeGrupo + "</span>"
    coluna += "</td>"


    //console.log("TD",coluna)

    var newRow = "<tr data-tt-parent-id='" + parentId + "' data-tt-id='" + grupoId + "' style='background:#e9f1ff!important' data-parent=true data-grupoid='" + grupoId + "' data-ordem='" + ordem + "' id='" + grupoId + "' class='subgrupo-item'>" + coluna + "</tr>";

    if ($("#listagemTable tbody tr[data-tt-parent-id='" + parentId + "']").length > 0) {
        $("#listagemTable tbody tr[data-tt-parent-id='" + parentId + "']:last").after(newRow);
    } else {
        $("#listagemTable tbody tr[id='" + parentId + "']").after(newRow);
    }
    // $("#listagemTable tbody").append("<tr data-tt-parent-id='"+parentId+"' data-tt-id='" + grupoId + "' style='background:#e9f1ff!important' data-parent=true data-grupoid='" + grupoId + "' data-ordem='" + ordem + "' id='" + grupoId + "' class='subgrupo-item'>" + coluna + "</tr>")




    //  $(this).append("<td><input class='form-control input-sm celula-inpt' type='text'></td>")
    // })

    opcoesTabelaHandler()
    inicializeGrupoTreeTable()

}
function adicionarLinha() {
    var linhaId = generateUUID()
    var linhaItem = "<tr id='" + linhaId + "' class='linha-item'>"
    linhaItem += "    <td>"
    linhaItem += "        <input readonly class='form-control input-sm linha-nome' type='text'>"
    linhaItem += "    </td>"
    linhaItem += "    </tr>"

    var totalColunas = $("#listagemTable tbody tr").length
    // var numeroLinha = (totalLinhas > 0 ? totalLinhas + 1 : "")
    //$("#listagemTable tbody").append("<tr class='linha-item'><td><input class='form-control input-sm linha-nome' type='text'></td></tr>")

    /*  if (totalLinhas == 0) {
          $("#listagemTable thead tr").append("<th class='linha-nome'>Linha " + numeroLinha + "</th>")
      }*/

    var maxOrdem = 0; // Initialize with negative infinity to ensure any value will be greater

    $("#listagemTable tr[data-ordem]").each(function () {
        var ordem = parseInt($(this).attr("data-ordem"));

        if (ordem > maxOrdem) {
            maxOrdem = ordem;
        }
    });

    var ordem = maxOrdem + 1;

    //  var tbody = $(this).closest("tbody")
    var coluna = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><span  class='glyphicon glyphicon glyphicon-trash'></span></button></td>"
    $("#listagemTable thead  .coluna-conf").each(function () {
        var header = $(this)
        var colunaId = header.attr("id")
        var celulaId = generateUUID()
        coluna += "<td><input data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text'></td>"
    })

    //console.log("TD",coluna)

    $("#listagemTable tbody").append("<tr data-ordem='" + ordem + "' id='" + linhaId + "' class='linha-item'>" + coluna + "</tr>")




    //  $(this).append("<td><input class='form-control input-sm celula-inpt' type='text'></td>")
    // })

    opcoesTabelaHandler()
    //$("#listagemContainer #listagemBody").append(linhaItem);
}

function adicionarLinhaGrupo(element) {
    var linhaId = generateUUID()

    //grupo-item branch expanded
    var maxOrdem = 0; // Initialize with negative infinity to ensure any value will be greater

    var grupoId = $(element).closest("tr").attr("id")

    $("#listagemTable tr[data-tt-parent-id='" + grupoId + "']").each(function () {
        var ordem = parseInt($(this).attr("data-ordem"));

        if (ordem > maxOrdem) {
            maxOrdem = ordem;
        }
    });

    var ordem = maxOrdem + 1;

    //  var tbody = $(this).closest("tbody")
    var coluna = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><i class='fa fa-trash-o'></i></button></td>"
    $("#listagemTable thead  .coluna-conf").each(function () {
        var header = $(this)
        var colunaId = header.attr("id")
        var celulaId = generateUUID()
        coluna += "<td><input data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text'></td>"
    })

    //console.log("TD",coluna)
    //grupo-item

    //$("#listagemTable tbody").append("<tr data-ordem='" + ordem + "' id='" + linhaId + "' class='linha-item'>" + coluna + "</tr>")


    var newRow = "<tr data-tt-id=" + linhaId + " data-tt-parent-id=" + grupoId + " data-ordem='" + ordem + "' id='" + linhaId + "' class='linha-item'>" + coluna + "</tr>";

    if ($("#listagemTable tbody tr[data-tt-parent-id='" + grupoId + "']").length > 0) {
        $("#listagemTable tbody tr[data-tt-parent-id='" + grupoId + "']:last").after(newRow);
    } else {
        $("#listagemTable tbody tr[id='" + grupoId + "']").after(newRow);
    }


    //  $(this).append("<td><input class='form-control input-sm celula-inpt' type='text'></td>")
    // })

    opcoesTabelaHandler()
    inicializeGrupoTreeTable()
    //$("#listagemContainer #listagemBody").append(linhaItem);
}
function adicionarColuna() {



    var totalColunas = $("#listagemTable thead tr th").length
    var numeroColuna = (totalColunas > 0 ? totalColunas + 1 : "")
    var colunaId = generateUUID()
    var codigo = "Codigo" + numeroColuna
    var nomeColuna = "Coluna " + numeroColuna
    // var celulaId = generateUUID()

    if (totalColunas == 0) {
        var linhaId = generateUUID()
        var actionButton = ""
        if ($("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val() == "Fixa") {

            $("#listagemTable thead tr").append("<th style='width:90%!important' class='coluna-acoes'></th>")
            actionButton = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><span  class='glyphicon glyphicon glyphicon-trash'></span></button></td>"
        }

        $("#listagemTable tbody").append("<tr id='" + linhaId + "' class='linha-item'>" + actionButton + "<td><input data-celulaid='" + generateUUID() + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text'></td></tr>")
    }
    $("#listagemTable thead tr").append("<th data-codigo='" + codigo + "' data-valor='" + nomeColuna + "' id='" + colunaId + "' class='coluna-conf'>" + nomeColuna + "</th>")

    if (totalColunas > 0) {
        // celulaId = generateUUID()
        $("#listagemTable tbody  .linha-item").each(function () {
            $(this).append("<td><input data-celulaid='" + generateUUID() + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text'></td>")
        })

        $(".grupo-conf").attr("colspan", $("#listagemTable thead  .coluna-conf").length)
    }
    opcoesTabelaHandler()
    inicializeGrupoTreeTable()
    //$("#listagemContainer #listagemBody").append(colunaItem);


}

function adicionarFonteDados() {
    var cardFonteDadosBody = "<div  class='row'>";
    cardFonteDadosBody += "    <div class='col-md-6'>";
    cardFonteDadosBody += "        <span class='control-label'>Código:</span>";
    cardFonteDadosBody += "        <input class='form-control input-sm codigo'>";
    cardFonteDadosBody += "    </div>";
    cardFonteDadosBody += "    <div class='col-md-12'>";
    cardFonteDadosBody += "        <span class='control-label'>Base query:</span>";
    cardFonteDadosBody += "        <textarea rows='20' class='form-control basequery' rows='3'></textarea>";
    cardFonteDadosBody += "    </div>";
    cardFonteDadosBody += "    <div class='col-md-12'>";
    cardFonteDadosBody += "        <span class='control-label'>Filtro:</span>";
    cardFonteDadosBody += "        <textarea rows='20' class='form-control filtro' rows='3'></textarea>";
    cardFonteDadosBody += "    </div>";
    cardFonteDadosBody += "    <div style='margin-top:1em' class='col-md-6 pull-left'>";
    // cardFonteDadosBody += "        <span class='control-label'>Filtro:</span>";
    cardFonteDadosBody += "        <button type='button'  class='btn btn-danger btn-sm'><span  class='glyphicon glyphicon glyphicon-trash'></span></button>";
    cardFonteDadosBody += "    </div>";
    cardFonteDadosBody += "</div>";

    var cardFonteDados = {
        title: "Fonte de dados",
        body: cardFonteDadosBody
    };
    var dashFactCardHTML = generateDashFactCard(cardFonteDados);
    var fonteId = generateUUID()
    var relFonteId = generateUUID()
    var fonteItem = "<div data-edit-fonte='true' data-fonteid='" + fonteId + "' data-relfonteid='" + relFonteId + "' style='margin-bottom:2em' class='col-md-12 fonte-item '>" + dashFactCardHTML + "</div>"
    $("#fonteDadosContainer #fonteDadosBody").append(fonteItem);
}
function getFonteDados() {

    $("#fonteDadosContainer").remove()
    $("#campos > .row:last").after("<div id='fonteDadosContainer' style='margin-top:2.5em' class='  '><div class='row' id='fonteDadosBody'></div><div class='row' id='fonteDadoFooter'></div></div>")

    var spinnerFonteContainer = ""
    spinnerFonteContainer += "<div class='overlay'>"
    spinnerFonteContainer += "    <div class='spinner'></div>"

    spinnerFonteContainer += "    <div class='w-100 d-flex justify-content-center align-items-center'>"

    spinnerFonteContainer += "    </div>"
    spinnerFonteContainer += "</div>"

    $("#fonteDadosContainer #fonteDadosBody").append(spinnerFonteContainer);





    var fonteContainerFooter = ""
    fonteContainerFooter += "    <div style='margin-top:1em;display:flex' class='col-md-12 '>";
    // cardFonteDadosBody += "        <span class='control-label'>Filtro:</span>";
    fonteContainerFooter += "        <button type='button' onClick='gravarFonteDados()'  class='btn btn-danger btn-sm gravar-fonte-dados'><span  class='glyphicon glyphicon-floppy-saved'></span></button>";
    fonteContainerFooter += "        <button style='margin-left:0.8em' type='button'  class='btn btn-primary btn-sm adicionar-fonte-dados'><span  class='glyphicon glyphicon glyphicon-plus'></span></button>";
    fonteContainerFooter += "    </div>";



    //  
    $("#fonteDadosContainer #fonteDadoFooter").append(fonteContainerFooter);
    $("#fonteDadosContainer .overlay").show()


    var fonteDadosResult = $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getfontedadosconfrelatorio",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    })

    $("#fonteDadosContainer .overlay").show()
    fonteDadosResult.then(function (response) {
        console.log("RESPONSE", response)
        var fontes = response.data

        var errorMessage = "ao trazer resultados "
        try {
            console.log(response)
            if (response.cod != "0000") {

                // console.log("Erro " + errorMessage, response)
                alertify.error("Erro interno " + errorMessage, 10000)
                $("#fonteDadosContainer .overlay").hide()
                return false

            }

            fontes.forEach(function (fonte) {
                var cardFonteDadosBody = "<div  class='row'>";
                cardFonteDadosBody += "    <div class='col-md-6'>";
                cardFonteDadosBody += "        <span class='control-label'>Código:</span>";
                cardFonteDadosBody += "        <input value='" + fonte.codigo + "' class='form-control input-sm codigo'>";
                cardFonteDadosBody += "    </div>";

                cardFonteDadosBody += "    <div class='col-md-12'>";
                cardFonteDadosBody += "        <span class='control-label'>Base query:</span>";
                cardFonteDadosBody += "        <textarea rows='20' class='form-control basequery' rows='3'>" + fonte.basequery + "</textarea>";
                cardFonteDadosBody += "    </div>";
                cardFonteDadosBody += "    <div class='col-md-12'>";
                cardFonteDadosBody += "        <span class='control-label'>Filtro:</span>";
                cardFonteDadosBody += "        <textarea rows='20' class='form-control filtro' rows='3'>" + fonte.filtro + "</textarea>";
                cardFonteDadosBody += "    </div>";
                cardFonteDadosBody += "    <div style='margin-top:1em' class='col-md-6 pull-left'>";
                // cardFonteDadosBody += "        <span class='control-label'>Filtro:</span>";
                cardFonteDadosBody += "        <button type='button'  class='btn btn-danger btn-sm'><span  class='glyphicon glyphicon glyphicon-trash'></span></button>";
                cardFonteDadosBody += "    </div>";
                cardFonteDadosBody += "</div>";

                var cardFonteDados = {
                    title: "Fonte de dados",
                    body: cardFonteDadosBody
                };
                var dashFactCardHTML = generateDashFactCard(cardFonteDados);
                var fonteId = generateUUID()
                var relFonteId = generateUUID()
                var fonteItem = "<div data-edit-fonte='true' data-fonteid='" + fonte.fontestamp + "' data-relfonteid='" + fonte.u_relfontestamp + "' style='margin-bottom:2em' class='col-md-12 fonte-item '>" + dashFactCardHTML + "</div>"
                $("#fonteDadosContainer #fonteDadosBody").append(fonteItem);
            })
            modoHandler()
        } catch (error) {
            console.log("Erro interno " + errorMessage, response)
            $("#fonteDadosContainer .overlay").hide()
            alertify.error("Erro interno " + errorMessage, 10000)
        }
        $("#fonteDadosContainer .overlay").hide()

    })



}


function modoHandler() {
    if (getState() == "consultar") {
        $("#fonteDadosContainer input").attr("readonly", true)
        $("#fonteDadosContainer textarea").attr("readonly", true)
        $("#fonteDadosContainer button").hide()
    }
}


function opcoesTabelaHandler() {
    var totalColunas = $("#listagemTable thead tr th").length
    var totalLinhas = $("#listagemTable tbody tr").length
    if (totalColunas == 0) {
        // alertify.error("Adicione uma coluna primeiro", 10000)
        $(".options-listagem-table").hide()
        return false
    }
    $(".options-listagem-table").show()
    return true
}


function listagemHandler() {
    var tipoListagem = $("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val()

    switch (tipoListagem) {
        case "Fixa":
            getListagemFixa()
            break;
        case "Dinâmica":
            getListagemDinamica()
            break;
        case "Grupo-Fixa":
            getListagemGrupoFixa()
            break;
    }
}

function getListagemFixa() {

    $("#listagemContainer").remove()

    $("#ctl00_conteudo_TabPanelUs_0 > .row:last").after("<div id='listagemContainer' style='margin-top:2.5em' ><div class='row' id='listagemItem'></div></div>")
    var spinnerListagemContainer = ""
    spinnerListagemContainer += "<div class='overlay'>"
    spinnerListagemContainer += "    <div class='spinner'></div>"

    spinnerListagemContainer += "    <div class='w-100 d-flex justify-content-center align-items-center'>"

    spinnerListagemContainer += "    </div>"
    spinnerListagemContainer += "</div>"
    $("#listagemContainer").append(spinnerListagemContainer);

    var listagemItem = "<div style='margin-bottom:1em'  class='col-md-12'>"
    listagemItem += "         <button type='button'  class='btn btn-sm btn-primary adicionar-coluna-btn'>Adicionar coluna</button><button onClick=actualizarColuna(this) style='margin-left:0.4em' type='button'  class='btn btn-sm btn-default '>Actualizar</button><br>"
    // listagemItem += "         <button style='margin-top:0.3em' type='button' class='btn btn-sm btn-warning adicionar-linha-btn'>Adicionar linha</button>"
    listagemItem += "   </div>"
    listagemItem += "   <div class='col-md-12'>"
    listagemItem += "      <div class='row table-responsive listagemTableContainer'>"
    listagemItem += "      <table id='listagemTable' class='table listagem-table'>"
    listagemItem += "        <thead>"
    listagemItem += "          <tr class='defgridheader' style='background:#033076!important'></tr>"
    listagemItem += "        </thead>"
    listagemItem += "        <tbody id='listagemBody'>"
    listagemItem += "        </tbody>"
    listagemItem += "      </table>"
    listagemItem += "      </div>"
    listagemItem += "      <div class='options-listagem-table row'>"
    listagemItem += "          <div class='col-md-6 pull-left'>"
    listagemItem += "         <button type='button' class='btn btn-sm btn-default adicionar-linha-btn'>Adicionar linha</button>"
    listagemItem += "          </div>"
    listagemItem += "       </div>"

    listagemItem += "   </div>"

    $("#listagemContainer #listagemItem").append(listagemItem);
    $("#listagemContainer .overlay").show()
    // $("#listagemTable thead").empty()
    //$("#listagemTable tbody").empty()

    var listagemResult = $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getlistagemrelatorio",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    });

    listagemResult.then(function (response) {

        var colunas = _.uniqBy(response.data, function (v) {
            return [v.codigocoluna, v.u_colunarelstamp, v.u_colunarelstamp].join();
        });

        var linhas = _.uniqBy(response.data, function (v) {
            return [v.u_linhastamp, v.ordemlinha].join();
        })

        linhas.sort(function (a, b) {
            return a.ordemlinha - b.ordemlinha
        })

        //console.log("linhas", linhas)
        $("#listagemTable thead tr").append("<th style='width:90%!important' class='coluna-acoes'></th>")

        colunas.sort(function (a, b) {
            return a.ordemcoluna - b.ordemcoluna
        })
        colunas.forEach(function (coluna) {
            var colunaId = coluna.u_colunarelstamp
            var codigo = coluna.codigocoluna
            var nomeColuna = coluna.valorcoluna
            var ordem = coluna.ordemcoluna
            $("#listagemTable thead tr").append("<th data-ordem='" + ordem + "' data-codigo='" + codigo + "' data-valor='" + nomeColuna + "' id='" + colunaId + "' class='coluna-conf'>" + nomeColuna + "</th>")
        })

        linhas.forEach(function (linha) {

            var linhaId = linha.u_linhastamp
            var colunaHtml = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><span  class='glyphicon glyphicon glyphicon-trash'></span></button></td>"

            colunas.forEach(function (coluna) {

                var celula = _.find(response.data, function (o) {
                    return o.u_colunarelstamp == coluna.u_colunarelstamp && o.u_linhastamp == linha.u_linhastamp
                })
                var valor = (celula ? celula.valorcelula : "");
                //  console.log("CELULA DATA", celula)
                var temCalculo = (celula ? celula.calculo : false)
                var celulaId = (celula ? celula.u_celulastamp : generateUUID());
                var valordinamico = celula.valordinamico ? celula.valordinamico : "[]"
                var colunaId = (celula ? celula.u_colunarelstamp : coluna.u_colunarelstamp)
                var tipo = (celula.tipocelula ? celula.tipocelula : "text")
                colunaHtml += "<td><input data-valordinamico='" + valordinamico + "' data-tipo='" + tipo + "' data-temcalculo='" + temCalculo + "' data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text' value='" + valor + "'></td>"

            })

            $("#listagemTable tbody").append("<tr data-ordem='" + linha.ordemlinha + "' id='" + linhaId + "' class='linha-item'>" + colunaHtml + "</tr>")
        })
        opcoesTabelaHandler()

        console.log("colunas", colunas)
        $("#listagemContainer .overlay").hide()
    })







    /*
    var result = _.uniqBy(list, function(v) {
  return [v.id, v.sequence].join();
});
    */








}



function inicializeGrupoTreeTable() {

    if ($("#ctl00_conteudo_tipolistagem_tipolistagemmBox1").val() == "Grupo-Fixa") {

        $('#listagemTable').treetable('destroy')
        $(".indenter").remove()
        $('#listagemTable').treetable({
            expandable: true
        });


        $("#listagemTable th").css("border", "0px solid");
        $('#listagemTable').treetable('expandAll');

    }

}

function getGrupoElements(grupoElement) {

    var grupoId = grupoElement.u_gruporelstamp
    var ordemGrupo = grupoElement.ordem
    var gruposNodeRef = gruposRelatorio.filter(function (obj) {
        return obj.noderef == grupoElement.u_gruporelstamp
    })

    var linhasGrupo = dadosLinhas.filter(function (obj) {
        return obj.grupostamp == grupoElement.u_gruporelstamp
    })

    var atributosListagem = " data-temtotais='" + grupoElement.temtotais + "' data-colunastotais='" + grupoElement.colunastotais + "'  data-tipodado='" + grupoElement.tipodado + "' data-temcalculo='" + grupoElement.temcalculo + "' data-expressaogrupo='" + grupoElement.expressaogrupo + "' "
    var parent = grupoElement.parent
    var coluna = "<td><button onClick=removeGrupo(this) type='button' style='color:white!important;background:#d9534f!important;margin-right:0.4em' class='btn btn-sm btn-danger removeGrupo'><i class='fa fa-trash-o'></i></button>"
    coluna += "<button type='button' onClick=adicionarSubgrupo(this)  class='btn btn-sm btn-primary addSubgrupo'><i class='fa fa-plus'></i> G</button>"
    coluna += "<button type='button' style='margin-left:0.4em;background:#417ad3!important;color:white' onClick=adicionarLinhaGrupo(this)  class='btn btn-sm  addLinhaGrupo'><i class='fa fa-plus'></i> L</button>"
    coluna += "</td>"
    coluna += "<td " + atributosListagem + " class='grupo-conf' colspan='" + (dadosColunas.length) + "'>"
    coluna += "        <span style='color:#033076' class='grupo-nome-span'>" + grupoElement.descricao + "</span>"
    coluna += "</td>"

    var classeGrupo = (grupoElement.parent ? "grupo-item" : "subgrupo-item");


    $("#listagemTable tbody").append("<tr " + (grupoElement.noderef ? " data-tt-parent-id='" + grupoElement.noderef + "'" : "") + "  data-parent='" + parent + "' data-tt-id='" + grupoId + "' style='background:#e9f1ff!important' data-parent=true data-grupoid='" + grupoId + "' data-ordem='" + ordemGrupo + "' id='" + grupoId + "' class='" + classeGrupo + "'>" + coluna + "</tr>")

    console.log("gruposNodeRef", gruposNodeRef)
    gruposNodeRef.sort(function (a, b) {
        return a.ordem - b.ordem
    })
    gruposNodeRef.forEach(function (grupoNodeRef) {

        var nodes = gruposRelatorio.filter(function (node) {
            return node.noderef == grupoNodeRef.u_gruporelstamp
        })

        var linhasNodes = dadosLinhas.filter(function (nodeLinha) {
            return nodeLinha.grupostamp == grupoNodeRef.u_gruporelstamp
        })

        if (nodes.length > 0 || linhasNodes.length > 0) {

            getGrupoElements(grupoNodeRef)
        }
    });




    linhasGrupo.sort(function (a, b) {
        return a.ordem - b.ordem
    })

    linhasGrupo.forEach(function (linha) {

        var linhaId = linha.u_linhastamp
        var colunaHtml = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><i class='fa fa-trash-o'></i></button></td>"

        dadosColunas.forEach(function (coluna) {

            var celula = _.find(confRelatorio, function (o) {
                return o.u_colunarelstamp == coluna.u_colunarelstamp && o.u_linhastamp == linha.u_linhastamp
            });
            // console.log("CELULA DATA grupo fixa",celula)
            var valor = (celula ? celula.valorcelula : "")
            var temCalculo = (celula ? celula.calculo : false)
            var celulaId = (celula ? celula.u_celulastamp : generateUUID())
            var colunaId = (celula ? celula.u_colunarelstamp : coluna.u_colunarelstamp)
            var tipo = (celula.tipocelula ? celula.tipocelula : "text");
            var valordinamico = celula.valordinamico ? celula.valordinamico : "[]"
            colunaHtml += "<td><input data-valordinamico='" + valordinamico + "'   data-tipo='" + tipo + "' data-temcalculo='" + temCalculo + "' data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text' value='" + valor + "'></td>"

        });



        $("#listagemTable tbody").append("<tr ' data-tt-id='" + linhaId + "' data-tt-parent-id=" + grupoId + " data-ordem='" + linha.ordemlinha + "' id='" + linhaId + "' class='linha-item'>" + colunaHtml + "</tr>")
    })




}

function getListagemGrupoFixa() {

    $("#listagemContainer").remove()

    $("#ctl00_conteudo_TabPanelUs_0 > .row:last").after("<div id='listagemContainer' style='margin-top:2.5em' ><div class='row' id='listagemItem'></div></div>")
    var spinnerListagemContainer = ""
    spinnerListagemContainer += "<div class='overlay'>"
    spinnerListagemContainer += "    <div class='spinner'></div>"

    spinnerListagemContainer += "    <div class='w-100 d-flex justify-content-center align-items-center'>"

    spinnerListagemContainer += "    </div>"
    spinnerListagemContainer += "</div>"
    $("#listagemContainer").append(spinnerListagemContainer);

    var listagemItem = "<div style='margin-bottom:1em'  class='col-md-12'>"
    listagemItem += "         <button type='button'  class='btn btn-sm btn-primary adicionar-coluna-btn'>Adicionar coluna</button><button style='margin-left:0.4em' type='button' onClick=actualizarColuna(this)  class='btn btn-sm btn-default '>Actualizar</button><br>"
    // listagemItem += "         <button style='margin-top:0.3em' type='button' class='btn btn-sm btn-warning adicionar-linha-btn'>Adicionar linha</button>"
    listagemItem += "   </div>"
    listagemItem += "   <div class='col-md-12'>"
    listagemItem += "      <div class='row table-responsive listagemTableContainer'>"
    listagemItem += "      <table id='listagemTable' class='table listagem-table'>"
    listagemItem += "        <thead>"
    listagemItem += "          <tr class='defgridheader' style='background:#033076!important'></tr>"
    listagemItem += "        </thead>"
    listagemItem += "        <tbody id='listagemBody'>"
    listagemItem += "        </tbody>"
    listagemItem += "      </table>"
    listagemItem += "      </div>"
    listagemItem += "      <div class='options-listagem-table row'>"
    listagemItem += "          <div class='col-md-6 pull-left'>"
    listagemItem += "         <button type='button' class='btn btn-sm btn-default adicionar-grupo-btn'>Adicionar grupo</button>"
    listagemItem += "          </div>"
    listagemItem += "       </div>"

    listagemItem += "   </div>"

    $("#listagemContainer #listagemItem").append(listagemItem);
    $("#listagemContainer .overlay").show()
    // $("#listagemTable thead").empty()
    //$("#listagemTable tbody").empty()


    var listagemResult = $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getlistagemrelatorio",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    });

    listagemResult.then(function (response) {

        var colunas = _.uniqBy(response.data, function (v) {
            return [v.codigocoluna, v.u_colunarelstamp, v.u_colunarelstamp].join();
        });

        confRelatorio = response.data


        gruposRelatorio = response.grupos



        var linhas = _.uniqBy(response.data, function (v) {
            return [v.u_linhastamp, v.ordemlinha].join();
        })

        linhas.sort(function (a, b) {
            return a.ordemlinha - b.ordemlinha
        })

        dadosLinhas = []
        dadosColunas = []
        dadosLinhas = linhas
        dadosColunas = colunas

        //console.log("linhas", linhas)
        $("#listagemTable thead tr").append("<th style='width:30%!important' class='coluna-acoes'></th>")

        colunas.sort(function (a, b) {
            return a.ordemcoluna - b.ordemcoluna
        })
        colunas.forEach(function (coluna) {
            var colunaId = coluna.u_colunarelstamp
            var codigo = coluna.codigocoluna
            var nomeColuna = coluna.valorcoluna
            var ordem = coluna.ordemcoluna
            $("#listagemTable thead tr").append("<th data-ordem='" + ordem + "' data-codigo='" + codigo + "' data-valor='" + nomeColuna + "' id='" + colunaId + "' class='coluna-conf'>" + nomeColuna + "</th>")
        })


        var gruposParent = gruposRelatorio.filter(function (obj) {
            return obj.parent == true
        })

        gruposParent.sort(function (a, b) {
            return a.ordem - b.ordem
        })


        gruposParent.forEach(function (grupoParent) {

            getGrupoElements(grupoParent)



        })
        /* linhas.forEach(function (linha) {
 
             var linhaId = linha.u_linhastamp
             var colunaHtml = "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'><span  class='glyphicon glyphicon glyphicon-trash'></span></button></td>"
 
             colunas.forEach(function (coluna) {
 
                 var celula = _.find(response.data, function (o) {
                     return o.u_colunarelstamp == coluna.u_colunarelstamp && o.u_linhastamp == linha.u_linhastamp
                 })
                 var valor = (celula ? celula.valorcelula : "")
                 var temCalculo = (celula ? celula.calculo : false)
                 var celulaId = (celula ? celula.u_celulastamp : generateUUID())
                 var colunaId = (celula ? celula.u_colunarelstamp : coluna.u_colunarelstamp)
                 var tipo = (celula.tipocelula ? celula.tipocelula : "text")
                 colunaHtml += "<td><input data-tipo='" + tipo + "' data-temcalculo='" + temCalculo + "' data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text' value='" + valor + "'></td>"
 
             })
 
             $("#listagemTable tbody").append("<tr data-ordem='" + linha.ordemlinha + "' id='" + linhaId + "' class='linha-item'>" + colunaHtml + "</tr>")
         })*/
        opcoesTabelaHandler()
        inicializeGrupoTreeTable()

        //console.log("colunas", colunas)
        $("#listagemContainer .overlay").hide()
    })




}
function getListagemDinamica() {


    $("#listagemContainer").remove()

    $("#ctl00_conteudo_TabPanelUs_0 > .row:last").after("<div id='listagemContainer' style='margin-top:2.5em' ><div class='row' id='listagemItem'></div></div>")
    var spinnerListagemContainer = ""
    spinnerListagemContainer += "<div class='overlay'>"
    spinnerListagemContainer += "    <div class='spinner'></div>"

    spinnerListagemContainer += "    <div class='w-100 d-flex justify-content-center align-items-center'>"

    spinnerListagemContainer += "    </div>"
    spinnerListagemContainer += "</div>"
    $("#listagemContainer").append(spinnerListagemContainer);

    var listagemItem = "<div style='margin-bottom:1em'  class='col-md-12'>"
    listagemItem += "   <button type='button' class='btn btn-sm btn-primary adicionar-coluna-btn'>Adicionar coluna</button><button style='margin-left:0.4em' type='button'  class='btn btn-sm btn-default' onClick='actualizarColuna(this)'>Actualizar</button><br>"
    // listagemItem += "         <button style='margin-top:0.3em' type='button' class='btn btn-sm btn-warning adicionar-linha-btn'>Adicionar linha</button>"
    listagemItem += "   </div>"
    listagemItem += "   <div class='col-md-12'>"
    listagemItem += "      <div class='row table-responsive listagemTableContainer'>"
    listagemItem += "      <table id='listagemTable' class='table listagem-table'>"
    listagemItem += "        <thead>"
    listagemItem += "          <tr class='defgridheader' style='background:#033076!important'></tr>"
    listagemItem += "        </thead>"
    listagemItem += "        <tbody id='listagemBody'>"
    listagemItem += "        </tbody>"
    listagemItem += "      </table>"
    listagemItem += "      </div>"

    listagemItem += "   </div>"

    $("#listagemContainer #listagemItem").append(listagemItem);
    $("#listagemContainer .overlay").show()
    // $("#listagemTable thead").empty()
    //$("#listagemTable tbody").empty()

    var listagemResult = $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getlistagemrelatorio",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    });

    listagemResult.then(function (response) {

        var colunas = _.uniqBy(response.data, function (v) {
            return [v.codigocoluna, v.u_colunarelstamp, v.u_colunarelstamp].join();
        });

        var linhas = _.uniqBy(response.data, function (v) {
            return [v.u_linhastamp, v.ordemlinha].join();
        })

        linhas.sort(function (a, b) {
            return a.ordemlinha - b.ordemlinha
        })

        //console.log("linhas", linhas)
        //   $("#listagemTable thead tr").append("<th class='coluna-acoes'></th>")

        colunas.sort(function (a, b) {
            return a.ordemcoluna - b.ordemcoluna
        })
        colunas.forEach(function (coluna) {
            var colunaId = coluna.u_colunarelstamp
            var codigo = coluna.codigocoluna
            var nomeColuna = coluna.valorcoluna
            var ordem = coluna.ordemcoluna
            $("#listagemTable thead tr").append("<th data-ordem='" + ordem + "' data-codigo='" + codigo + "' data-valor='" + nomeColuna + "' id='" + colunaId + "' class='coluna-conf'>" + nomeColuna + "</th>")
        })

        linhas.forEach(function (linha) {

            var linhaId = linha.u_linhastamp
            var colunaHtml = ""

            var expressaolinha = (linha.expressaolinha ? linha.expressaolinha : "")
            var temgrupo = (linha.temgrupo ? linha.temgrupo : false)
            var campoagrupamento = (linha.campoagrupamento ? linha.campoagrupamento : "")
            colunas.forEach(function (coluna) {

                var celula = _.find(response.data, function (o) {
                    return o.u_colunarelstamp == coluna.u_colunarelstamp && o.u_linhastamp == linha.u_linhastamp
                })
                var valor = (celula ? celula.valorcelula : "")
                var temCalculo = (celula ? celula.calculo : false)
                var celulaId = (celula ? celula.u_celulastamp : generateUUID())
                var colunaId = (celula ? celula.u_colunarelstamp : coluna.u_colunarelstamp)
                var tipo = (celula.tipocelula ? celula.tipocelula : "text")
                colunaHtml += "<td><input data-tipo='" + tipo + "' data-temcalculo='" + temCalculo + "' data-celulaid='" + celulaId + "' data-colunaid='" + colunaId + "' readonly class='form-control input-sm celula-inpt' type='text' value='" + valor + "'></td>"

            })

            $("#listagemTable tbody").append("<tr data-temgrupo='" + temgrupo + "' data-campoagrupamento='" + campoagrupamento + "' data-expressaolinha='" + expressaolinha + "' data-ordem='" + linha.ordemlinha + "' id='" + linhaId + "' class='linha-item'>" + colunaHtml + "</tr>")
        })
        opcoesTabelaHandler()

        console.log("colunas", colunas)
        $("#listagemContainer .overlay").hide()
    })







    /*
    var result = _.uniqBy(list, function(v) {
  return [v.id, v.sequence].join();
});
    */








}
function gravarFonteDados() {
    $("#fonteDadosContainer .overlay").show()
    $("#fonteDadosContainer .fonte-item").each(function () {
        var fonteId = $(this).attr("data-fonteid")
        var relFonteId = $(this).attr("data-relfonteid")
        var codigo = $(this).find(".codigo").val()
        var basequery = $(this).find(".basequery").val()
        var filtro = $(this).find(".filtro").val()
        var data = {
            fonteId: fonteId,
            relFonteId: relFonteId,
            codigo: codigo,
            basequery: basequery,
            filtro: filtro,
            syncstamp: getSyncstamp()
        }

        fontes.push(data)







    })

    var promises = []

    console.log("fontes", fontes)
    var promise = $.ajax({
        type: "POST",
        //   async: false,
        url: "../programs/gensel.aspx?cscript=gravarfontededados",

        data: {
            '__EVENTARGUMENT': JSON.stringify(fontes),
        },
        success: function (response) {

            var errorMessage = "ao gravar registos "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    alertify.error("Erro " + errorMessage, 10000)
                    $("#fonteDadosContainer .overlay").hide()
                    console.log("Erro " + errorMessage, response)
                    return false
                }

                alertify.success("Sucesso ", 10000)

                $("#fonteDadosContainer .overlay").hide()
                getFonteDados()
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                $("#fonteDadosContainer .overlay").hide()
                alertify.error("Erro interno " + errorMessage, 10000)
            }

        }
    })
    // promises.push(promise)
    promise.then(function () {
        fontes = []
        return true;
    });
    //console.log("pomises length", promises.length)

    /*$.when.apply($, promises).done(function () {
       // fontes = []
        console.log("fontes", fontes)
        return true
    })*/

    // fontes = []
    //console.log("fontes", fontes)
}
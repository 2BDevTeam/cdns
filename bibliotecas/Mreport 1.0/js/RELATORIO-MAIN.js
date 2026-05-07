// ============================================================
// RELATORIO-MAIN.js
// Entrypoint do editor de relatórios (Mreport 1.0).
// Toda a lógica de DOM, layout, AJAX e estado vive em
// MREPORT CONFIG LIB.js. Este ficheiro só inicializa o ecrã
// e regista listeners delegados.
// ============================================================


function pageLoad() {
    organizarEcra();
    initMreportReactive();
    initMreportModais();
    initMreportListagem();
    registerListeners();
    getFonteDados();
    listagemHandler();
}

function getSyncstamp() {

    return $("#ctl00_conteudo_syncstamp_mLabel1").text()
}
function organizarEcra() {

    setTimeout(function () {
        $("#ctl00_conteudo_syncstamp").hide()
    }, 500)
}


function registerListeners() {
    $(document).off("click", ".adicionar-fonte-dados").on("click", ".adicionar-fonte-dados", function () {
        adicionarFonteDados()
    })

    $(document).off("click", ".removeLinha").on("click", ".removeLinha", function () {
        var linhaId = $(this).closest("tr").attr("id");
        if (linhaId) GMreportState.removeLinha(linhaId);
    })


    $(document).off("dblclick", ".descricaoValorDinamico").on("dblclick", ".descricaoValorDinamico", function () {
        var id = $(this).data("id");
        GMreportState.valorDinamicoAlvo = GMreportState.valoresDinamicos.find(function (vd) {
            return vd.id === id;
        });
        GMreportState.selectCellMode = true;
        $(".celula-inpt").addClass("select-cell-mode");
        $("#modalConfigGlobal").modal("hide");
    })

    // .descricaoValorDinamico keyup — removido (PetiteVue v-model gere os valores dinamicos)

    $(document).off("click", ".coluna-conf").on("click", ".coluna-conf", function () {
        GMreportState.abrirColuna(new ColunaRelConfig({
            u_colunarelstamp: $(this).attr("id"),
            codigo:           $(this).attr("data-codigo") || "",
            valor:            $(this).attr("data-valor")  || "",
            ordem:            $(this).attr("data-ordem")  || 0
        }), $(this));
    })

    // .gravar-fonte-dados → delegado para gravarFonteDados() via onClick no botão gerado em getFonteDados()

    $(document).off("click", ".adicionar-coluna-btn").on("click", ".adicionar-coluna-btn", function () {
        adicionarColuna()

    })

    // .actualizar-coluna-btnx — removido (dead handler)





    //console.log("celulas", celulas)



    //console.log("linha", linhas, "colunas", colunas, "celulas", celulas)

    $(document).off("click", ".subg-grupo-conf").on("click", ".subg-grupo-conf", function () {
        GMreportState.abrirGrupo(new GrupoRelConfig({
            u_gruporelstamp: $(this).closest("tr").attr("id"),
            descricao:       $(this).find(".grupo-nome-span").text(),
            temcalculo:      $(this).attr("data-temcalculo")     === "true",
            temtotais:       $(this).attr("data-temtotais")      === "true",
            tipodado:        $(this).attr("data-tipodado")       || "text",
            expressaogrupo:  $(this).attr("data-expressaogrupo") || "",
            colunastotais:   $(this).attr("data-colunastotais")  || "",
            parent:          false
        }), $(this));
    })

    $(document).off("click", ".grupo-conf").on("click", ".grupo-conf", function () {
        GMreportState.abrirGrupo(new GrupoRelConfig({
            u_gruporelstamp: $(this).closest("tr").attr("id"),
            descricao:       $(this).find(".grupo-nome-span").text(),
            temcalculo:      $(this).attr("data-temcalculo")     === "true",
            temtotais:       $(this).attr("data-temtotais")      === "true",
            tipodado:        $(this).attr("data-tipodado")       || "text",
            expressaogrupo:  $(this).attr("data-expressaogrupo") || "",
            colunastotais:   $(this).attr("data-colunastotais")  || "",
            parent:          true
        }), $(this));
    })

    $(document).off("click", ".celula-inpt").on("click", ".celula-inpt", function () {




        if (GMreportState.selectCellMode) {
            GMreportState.selectCellMode = false;
            $(".celula-inpt").removeClass("select-cell-mode");

            var colIndex = $(this).closest("td").index();
            var header   = $("#listagemTable thead th").eq(colIndex);
            var linhaVal = $(this).closest("tr").find("td:eq(1) .celula-inpt").val();
            var descricao = linhaVal + ";" + header.data("valor");
            var celulaId  = $(this).attr("data-celulaid");

            if (GMreportState.valorDinamicoAlvo) {
                GMreportState.valorDinamicoAlvo.descricao = descricao;
                GMreportState.valorDinamicoAlvo.valor     = celulaId;
                GMreportState.valorDinamicoAlvo.tipo      = "Celula";
                GMreportState.sincronizarValoresDinamicos();
            }

            if (GMreportState.activeElement) { GMreportState.activeElement.trigger("click"); }
            return;
        }

        GMreportState.abrirCelula(new CelulaConfig({
            u_celulastamp: $(this).attr("data-celulaid")     || generateUUID(),
            stamplinha:    $(this).closest("tr").attr("id"),
            stampcoluna:   $(this).attr("data-colunaid")     || "",
            valor:         $(this).val(),
            tipocelula:    $(this).attr("data-tipo")         || "text",
            calculo:       $(this).attr("data-temcalculo")   === "true",
            valordinamico: $(this).attr("data-valordinamico") || "[]"
        }), $(this));
    })

    $(document).off("click", ".adicionar-linha-btn").on("click", ".adicionar-linha-btn", function () {
        adicionarLinha()

    })

    $(document).off("click", ".adicionar-grupo-btn").on("click", ".adicionar-grupo-btn", function () {
        adicionarGrupo()

    })
}
// guardarGrupo / guardarColuna / guardarCelula
// → lógica movida para GMreportState.syncToElement() em MREPORT CONFIG LIB.js



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

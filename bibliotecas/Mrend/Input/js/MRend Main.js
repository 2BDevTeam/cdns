function pageLoad() {
    organizarEcra();
    registerListeners();
}
function organizarEcra() {
    var codigo = $("#mainPage").data("state") == "consultar" ? $("#ctl00_conteudo_codigo_mLabel1").text() : $("#ctl00_conteudo_codigo_codigomBox1").val();
    
    var divExtraConfig = "<div id='mrend-init-config-container'></div>";
    
    $("#campos > .row:last").after("<div style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'>" + divExtraConfig + "</div>");


    initTabelaConfiguracaoMrender({
        codigo: codigo,
        extraConfigContainer: "#mrend-init-config-container",
        relatorioTable: "u_nota",
        relatorioTableKey: "u_notastamp",
        relatorioTableFilterField: "nota",
        defaultInitConfig: {
            enableEdit: "$(\"#mainPage\").data(\"state\") == \"editar\"",
            resetSourceStamp: "$(\"#mainPage\").data(\"state\") != \"editar\"",
            remoteFetch: "true",
            codigo: codigo,
            remoteFetchData: {
                type: "POST",
                url: "../programs/gensel.aspx?cscript=getdatafromphc",
                data: {
                    '__EVENTARGUMENT': "JSON.stringify([{ codigo: '" + codigo + "', filtroval: getRecordStamp() }])"
                }
            },
            datasourceName: "u_reportl",
            tableSourceName: "u_reportl",
            table: "u_reportl",
            dbTableToMrendObject: {
                defaultColumnName: "",
                chunkMapping: true,
                table: "u_reportl",
                dbName: "",
                tableKey: "u_reportlstamp",
                extras: {
                    ordemField: "naturezaordem",
                    linkField: "gruporowid",
                    cellIdField: "u_reportlstamp",
                    colunaField: "rubrica",
                    linhaField: "natureza",
                    rowIdField: "naturezasubrowid",
                    descLinhaField: "descnatureza",
                    descColunaField: "descrubrica",
                    ordemColunaField: "grupolordem",
                    tipocolField: "tipocol"
                }
            },
            schemas: [
                "u_reportlstamp",
                "naturezasubrowid",
                "naturezaordem",
                "saldo",
                "rubrica",
                "natureza",
                "descnatureza",
                "gruporowid",
                "grupolordem",
                "gruponatureza",
                "descrubrica",
                "saldoanoant",
                "saldoanoact",
                "u_reportcstamp",
                "ousrinis",
                "ousrdata",
                "ousrhora",
                "usrinis",
                "usrdata",
                "usrhora",
                "nota",
                "descgrupnatureza",
                "prcntdetida",
                "cvalor",
                "linhamodelo",
                "nome",
                "categoria",
                "expfonte",
                "totalrelatorio",
                "codigo",
                "totalcoluna",
                "dectotrelatorio",
                "defdescoluna",
                "rendopt",
                "dectotcoluna",
                "tipocol"
            ]
        }
    });

}
function registerListeners() {
     $(document).on('click', '.home-collapse-header', function () {
        $(this).find(".glyphicon").toggleClass("glyphicon-triangle-bottom");
        //$(this).next("div").css("hidden");
        $(this).next("div").toggleClass("hidden");

    });
}
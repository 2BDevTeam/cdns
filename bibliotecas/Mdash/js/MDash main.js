function pageLoad() {
    registerListeners()
    organizarCampos()
    outrasFuncoes()
}
function organizarCampos() {
    try {
        setTimeout(function () {
            $("#ctl00_conteudo_u_mdashstamp").hide()
        }, 1000)
    } catch (error) {
    }
}
function outrasFuncoes() {
    try {
        var codigo = $("#ctl00_conteudo_codigo_codigomBox1").val();
        if ($("#mainPage").data("state") == "consultar") {
            codigo = $("#ctl00_conteudo_codigo_mLabel1").text();
        }
        var config = {
            mdashstamp: $("#ctl00_conteudo_u_mdashstamp_mLabel1").text(),
            u_mdashstamp: $("#ctl00_conteudo_u_mdashstamp_mLabel1").text(),
            codigo: $("#ctl00_conteudo_codigo_mLabel1").text(),
            descricao: $("#ctl00_conteudo_descricao_mLabel1").text(),
            categoria: $("#ctl00_conteudo_categoria_mLabel1").text(),
            filtrohorizont:$("#ctl00_conteudo_filtrohorizont_mBox1").is(":checked"),
            temfiltro:$("#ctl00_conteudo_temfiltro_mBox1").is(":checked"),
            exportBtnSelector:"#options2 .NextActionButtons"
        }

        initConfiguracaoDashboard(config)
    } catch (error) {
    }
}

function registerListeners() {
    try {
    } catch (error) {
    }
}
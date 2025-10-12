


function pageLoad() {

    registerListeners()
    organizarCampos()

    outrasFuncoes()

}



function organizarCampos() {

    try {

        setTimeout(function () {

            $("#ctl00_conteudo_u_mreportstamp_mLabel1").hide()

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
            mreportstamp: $("#ctl00_conteudo_u_mreportstamp_mLabel1").text(),
            codigo: codigo
        }

        initConfiguracaoMReport(config)

    } catch (error) {

    }

}




function registerListeners() {

    try {

    } catch (error) {

    }
}
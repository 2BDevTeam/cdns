

$(document).ready(function () {

    getDadosEmpresa()
});


function getDadosEmpresa() {
    $.ajax({
        type: "POST",
        async: false,
        url: "../programs/gensel.aspx?cscript=getdadosperfilempresa",

        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                // console.log("EMPRESA", response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }

                if (response.data.length == 0) {
                    console.log("Nenhum dado encontrado")
                    return false
                }


                var nomeEmpreaLi = '';

                //nomeEmpreaLi += '<li class="hidden-xs">';
                nomeEmpreaLi += '  <div style="margin-top:0.1em" class="logotipo left">';
                nomeEmpreaLi += '    <a style="font-weight:bold!important;color:#4d5760!important;font-family:Nunito,sans-serif;" title="" class="dropdown-toggle forceFlex" data-toggle="dropdown" data-tooltip="true"';
                nomeEmpreaLi += '      data-original-title="">  ' + response.data[0].nomecomp + ' <div';
                nomeEmpreaLi += '        class="menu-mobile-title">' + response.data[0].nomecomp + '</div> </a>';

                nomeEmpreaLi += '  </div>';
                // nomeEmpreaLi += '</li>';

                $(".logotipo").after(nomeEmpreaLi)

            } catch (error) {

            }

        }
    })
}
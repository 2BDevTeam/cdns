$.ajax({
    type: "POST",
    url: "../programs/gensel.aspx?cscript=scriptexamplewthparameter",



    data: {
        '__EVENTARGUMENT': JSON.stringify([{ ano: "2023" }]),
    },
    success: function (response) {

        var errorMessage = "ao trazer resultados "
        try {
            console.log(response)
            if (response.cod != "0000") {

                console.log("Erro "+errorMessage,response)
                return false
            }
        } catch (error) {
            console.log("Erro interno " + errorMessage, response)
            //alertify.error("Erro interno " + errorMessage, 10000)
        }

        //  javascript:__doPostBack('','')
    }
})




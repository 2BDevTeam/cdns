var GVIEWMODEL = null;


function pageLoad() {

    registerListeners()
    organizarCampos()

    outrasFuncoes()

}



function organizarCampos() {

    try {

    } catch (error) {

    }


}


function outrasFuncoes() {
    try {

    } catch (error) {

    }

}


function handleGrelhasPHC() {

    if (GVIEWMODEL != null) {

        $("body").trigger("mainformAfterCreateViewModel", GVIEWMODEL);

    }

    $(document).off("mainformAfterCreateViewModel").on("mainformAfterCreateViewModel", function (event, viewModel) {
        try {

        

        } catch (error) {
            console.error("Erro ao configurar o ViewModel:", error);
        }
    });

}



function registerListeners() {

    try {
        handleGrelhasPHC()

    } catch (error) {
        console.error("Erro ao registar listeners:", error);
    }
}
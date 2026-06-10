prm.add_pageLoaded(function () {



    var searchFilterDataObject = $("#searchFilterData").length ? JSON.parse($("#searchFilterData").val()) : {};





    var oritable = $.isEmptyObject(searchFilterDataObject) ? '' : searchFilterDataObject.Table.toUpperCase();





    if (oritable != 'JSU') {

        loaderRegister();

        observeTarget();

        console.log("Loader JS ativo para " + oritable);

    }

});



$(document).ready(function () {

    $("#overlay-loader").hide();

});



function getOverlayLoaderColor() {

    var color = '#073e5a';

    try {

        if (typeof getColorByType === 'function') {

            var c = getColorByType('primary');

            if (c && c.background) color = c.background;

        }

    } catch (e) { }

    return color;

}



function loaderRegister() {

    var overlayLoader = ""

        + "<div id='overlay-loader' style='display:none;'>"

        + "  <svg id='loader' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>"

        + "    <g>"
        + "      <path class='overlay-loader-path' d='M83.3,67.2c-4.6,8.8-12.4,15.4-21.9,18.4c-9.5,3.1-19.7,2.2-28.6-2.4c-8.9-4.6-15.5-12.4-18.5-21.9"

        + "        c-3.7-11.5-1.5-23.5,4.9-32.6c4.6-6.6,11.3-11.8,19.4-14.4c7.1-2.3,14.9-2.3,22-0.3l-4,13.9c-11.5-3.5-23.8,2.5-28.1,13.8"

        + "        C23.9,53.6,29.9,67,41.8,71.5c5.8,2.1,12,2,17.6-0.5c5.6-2.5,9.9-7,12.1-12.8c1.7-4.4,1.9-9.2,0.9-13.7l14.1-3.2"

        + "        C88.6,50.1,87.4,59.2,83.3,67.2z' />"

        + "      <path class='overlay-loader-path' d='M70.7,39.8c-2.1-4.2-5.3-7.6-9.3-9.9l0,0l7.1-12.6l0,0c6.6,3.7,11.8,9.3,15.2,16.1l0,0L70.7,39.8L70.7,39.8z' />"

        + "    </g>"

        + "  </svg>"

        + "</div>"

        + "<style>"

        + "  #overlay-loader {"

        + "    position: fixed;"

        + "    top: 0;"

        + "    left: 0;"

        + "    width: 100%;"

        + "    height: 100%;"

        + "    background-color: #ffffff;"

        + "    display: flex;"

        + "    justify-content: center;"

        + "    align-items: center;"

        + "    z-index: 999999;"

        + "  }"

        + "  #overlay-loader #loader {"

        + "    width: 100px;"

        + "    height: 100px;"

        + "    animation: overlay-loader-rotate 1.5s linear infinite;"

        + "  }"

        + "  #overlay-loader .overlay-loader-path {"

        + "    fill: var(--overlay-loader-color, #073e5a);"

        + "  }"

        + "  @keyframes overlay-loader-rotate {"

        + "    0% { transform: rotate(0deg); }"

        + "    100% { transform: rotate(360deg); }"

        + "  }"

        + "</style>";



    document.body.insertAdjacentHTML("beforeend", overlayLoader);



    var overlayEl = document.getElementById('overlay-loader');

    if (overlayEl) {

        overlayEl.style.setProperty('--overlay-loader-color', getOverlayLoaderColor());

    }

}



function observeTarget() {

    var target = document.querySelector("#ctl00_bfooter_Nup1");

    if (!target) return;



    // Mostrar/ocultar logo no início

    toggleLoader($(target).is(":visible"));



    // Observar mudanças de atributos (style/class)

    var observer = new MutationObserver(function () {

        toggleLoader($(target).is(":visible"));

    });



    observer.observe(target, { attributes: true, attributeFilter: ["style", "class"] });

}



function toggleLoader(show) {

    if (show) {

        $("#overlay-loader").show();

    } else {

        $("#overlay-loader").hide();

    }

}



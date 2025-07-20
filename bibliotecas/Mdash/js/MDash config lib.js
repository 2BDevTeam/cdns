function generateBootstrapCardHTML(cardData) {
    // Start building the card HTML
    var cardHTML = '<div id="' + (cardData.id || '') + '" style="margin-top:1em" class="card">';

    // Add the card header with custom data attributes
    cardHTML += '<div class="card-header card-header-' + cardData.type + '" ' + (cardData.headerCustomData || '') + '>';
    cardHTML += '<div class="col-md-12 col-sm-12">';
    cardHTML += '<h4 style="text-align:left;font-size: 20px;font-family: Nunito,sans-serif;color:white;font-weight:bold">';
    cardHTML += cardData.title + '</h4>';
    cardHTML += '</div>';
    cardHTML += '</div>';

    // Add the card body with custom data attributes
    cardHTML += '<div class="card-body" ' + (cardData.bodyCustomData || '') + '>';
    cardHTML += cardData.bodyContent;
    cardHTML += '</div>';

    // Close the card div
    cardHTML += '</div>';

    return cardHTML.trim(); // Remove any leading/trailing whitespace
}



function initConfiguracaoDashboard(config) {


    var mainContainer = "<div style='margin-top:2.5em' class='row m-dash-main-container'> </div>";

    $("#campos > .row:last").after(mainContainer);


}









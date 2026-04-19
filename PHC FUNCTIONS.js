
function getDocType() {

    return $("#mainPage").data("doctype");
}

function isDocType(ndoc) {

    return getDocType() === ndoc;
}

function getState() {
    return $("#mainPage").data("state")
}
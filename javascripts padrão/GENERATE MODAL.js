var modalHtmlBody = "<div id='modalExemploBody' ></div>"
var modalData = {
    title: "exemplo",
    id: "modalExemplo",
    customData: "",
    otherclassess: "",
    body: modalHtmlBody,
    footerContent: ""
};

var modalHTML = generateModalHTML(modalData);
$("#mainPage").append(modalHTML);
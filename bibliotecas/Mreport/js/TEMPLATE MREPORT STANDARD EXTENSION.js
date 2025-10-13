function getTiposObjectoConfig() {


    return [
        {
            id: 1,
            tipo: "Texto",
            descricao: "Elemento de Texto",
            label: "Texto",
            icon: "fa fa-font",
            categoria: "editor",
            createDynamicSchema: function (data) {
                var fieldOptions = data.fieldOptions || [];

                

               /* if (data && data.length > 0) {
                    Object.keys(data[0]).forEach(function (key) {
                        fieldOptions.push(key);
                    });
                }*/

                return {
                    type: "object",
                    title: "Configuração de Texto",
                    properties: {
                        // CAMPOS DE DADOS - IGUAL AOS OUTROS OBJETOS
                        dataField: {
                            type: "string",
                            title: "Campo de Dados",
                            'enum': fieldOptions,
                            description: "Campo dos dados que será exibido como texto"
                        },
                        staticText: {
                            type: "string",
                            title: "Texto Estático (alternativo)",
                            'default': "",
                            description: "Se não selecionar campo de dados, pode inserir texto fixo"
                        },

                        // Configurações de formatação de dados
                        dataFormat: {
                            type: "object",
                            title: "Formatação de Dados",
                            properties: {
                                type: {
                                    type: "string",
                                    title: "Tipo de Formatação",
                                    'enum': ["text", "number", "currency", "percentage", "date"],
                                    'default': "text"
                                },
                                locale: {
                                    type: "string",
                                    title: "Localização",
                                    'enum': ["pt-PT", "pt-BR", "en-US", "en-GB", "fr-FR", "de-DE", "es-ES"],
                                    'default': "pt-PT"
                                },
                                currency: {
                                    type: "string",
                                    title: "Código da Moeda",
                                    'default': "EUR",
                                    description: "Para tipo currency: EUR, USD, GBP, BRL"
                                },
                                currencyPosition: {
                                    type: "string",
                                    title: "Posição da Moeda",
                                    'enum': ["left", "right"],
                                    'default': "right",
                                    description: "Posição do símbolo da moeda"
                                },
                                minimumFractionDigits: {
                                    type: "integer",
                                    title: "Mínimo de Casas Decimais",
                                    'default': 0,
                                    minimum: 0,
                                    maximum: 20
                                },
                                maximumFractionDigits: {
                                    type: "integer",
                                    title: "Máximo de Casas Decimais",
                                    'default': 2,
                                    minimum: 0,
                                    maximum: 20
                                },
                                prefix: {
                                    type: "string",
                                    title: "Prefixo",
                                    'default': "",
                                    description: "Texto antes do valor"
                                },
                                suffix: {
                                    type: "string",
                                    title: "Sufixo",
                                    'default': "",
                                    description: "Texto após o valor"
                                }
                            }
                        },

                        // Conteúdo do texto - MODIFICADO
                        content: {
                            type: "object",
                            title: "Configurações de Conteúdo",
                            properties: {
                                htmlEnabled: {
                                    type: "boolean",
                                    title: "Permitir HTML",
                                    'default': false,
                                    description: "Permite usar tags HTML no texto"
                                },
                                multipleValues: {
                                    type: "boolean",
                                    title: "Múltiplos Valores",
                                    'default': false,
                                    description: "Exibir todos os valores do campo (em vez de apenas o primeiro)"
                                },
                                separator: {
                                    type: "string",
                                    title: "Separador (para múltiplos valores)",
                                    'default': ", ",
                                    description: "Como separar múltiplos valores"
                                }
                            }
                        },

                        // Formatação de texto
                        textFormat: {
                            type: "object",
                            title: "Formatação do Texto",
                            properties: {
                                fontSize: {
                                    type: "integer",
                                    title: "Tamanho da Fonte (px)",
                                    'default': 16,
                                    minimum: 8,
                                    maximum: 72
                                },
                                fontWeight: {
                                    type: "string",
                                    title: "Peso da Fonte",
                                    'enum': ["normal", "bold", "lighter", "bolder", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
                                    'default': "bold"
                                },
                                fontStyle: {
                                    type: "string",
                                    title: "Estilo da Fonte",
                                    'enum': ["normal", "italic", "oblique"],
                                    'default': "normal"
                                },
                                fontFamily: {
                                    type: "string",
                                    title: "Família da Fonte",
                                    'enum': ["Arial", "Nunito, sans-serif", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Comic Sans MS", "Impact", "Trebuchet MS", "Arial Black"],
                                    'default': "Nunito, sans-serif"
                                },
                                textAlign: {
                                    type: "string",
                                    title: "Alinhamento",
                                    'enum': ["left", "center", "right", "justify"],
                                    'default': "center"
                                },
                                lineHeight: {
                                    type: "number",
                                    title: "Altura da Linha",
                                    'default': 1.5,
                                    minimum: 0.5,
                                    maximum: 3,
                                    step: 0.1
                                }
                            }
                        },

                        // Cores
                        colors: {
                            type: "object",
                            title: "Cores",
                            properties: {
                                textColor: {
                                    type: "string",
                                    title: "Cor do Texto",
                                    format: "color",
                                    'default': "#333333"
                                },
                                backgroundColor: {
                                    type: "string",
                                    title: "Cor de Fundo",
                                    format: "color",
                                    'default': "#fff"
                                },
                                borderColor: {
                                    type: "string",
                                    title: "Cor da Borda",
                                    format: "color",
                                    'default': "transparent"
                                }
                            }
                        },

                        // Espaçamento e layout
                        spacing: {
                            type: "object",
                            title: "Espaçamento",
                            properties: {
                                paddingTop: {
                                    type: "integer",
                                    title: "Padding Superior (px)",
                                    'default': 10,
                                    minimum: 0,
                                    maximum: 100
                                },
                                paddingRight: {
                                    type: "integer",
                                    title: "Padding Direito (px)",
                                    'default': 10,
                                    minimum: 0,
                                    maximum: 100
                                },
                                paddingBottom: {
                                    type: "integer",
                                    title: "Padding Inferior (px)",
                                    'default': 10,
                                    minimum: 0,
                                    maximum: 100
                                },
                                paddingLeft: {
                                    type: "integer",
                                    title: "Padding Esquerdo (px)",
                                    'default': 10,
                                    minimum: 0,
                                    maximum: 100
                                },
                                marginTop: {
                                    type: "integer",
                                    title: "Margem Superior (px)",
                                    'default': 0,
                                    minimum: 0,
                                    maximum: 100
                                },
                                marginBottom: {
                                    type: "integer",
                                    title: "Margem Inferior (px)",
                                    'default': 0,
                                    minimum: 0,
                                    maximum: 100
                                }
                            }
                        },

                        // Bordas
                        border: {
                            type: "object",
                            title: "Bordas",
                            properties: {
                                width: {
                                    type: "integer",
                                    title: "Largura da Borda (px)",
                                    'default': 0,
                                    minimum: 0,
                                    maximum: 20
                                },
                                style: {
                                    type: "string",
                                    title: "Estilo da Borda",
                                    'enum': ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
                                    'default': "solid"
                                },
                                radius: {
                                    type: "integer",
                                    title: "Raio da Borda (px)",
                                    'default': 0,
                                    minimum: 0,
                                    maximum: 50
                                }
                            }
                        },

                        // Efeitos
                        effects: {
                            type: "object",
                            title: "Efeitos",
                            properties: {
                                textShadow: {
                                    type: "boolean",
                                    title: "Sombra do Texto",
                                    'default': false
                                },
                                shadowColor: {
                                    type: "string",
                                    title: "Cor da Sombra",
                                    format: "color",
                                    'default': "#666666"
                                },
                                shadowBlur: {
                                    type: "integer",
                                    title: "Desfoque da Sombra (px)",
                                    'default': 2,
                                    minimum: 0,
                                    maximum: 20
                                },
                                shadowOffsetX: {
                                    type: "integer",
                                    title: "Deslocamento X da Sombra (px)",
                                    'default': 1,
                                    minimum: -20,
                                    maximum: 20
                                },
                                shadowOffsetY: {
                                    type: "integer",
                                    title: "Deslocamento Y da Sombra (px)",
                                    'default': 1,
                                    minimum: -20,
                                    maximum: 20
                                }
                            }
                        },

                        // Dimensões
                        dimensions: {
                            type: "object",
                            title: "Dimensões",
                            properties: {
                                width: {
                                    type: "string",
                                    title: "Largura",
                                    'enum': ["auto", "100%", "50%", "25%", "75%"],
                                    'default': "100%"
                                },
                                height: {
                                    type: "string",
                                    title: "Altura",
                                    'enum': ["auto", "100px", "200px", "300px", "400px"],
                                    'default': "auto"
                                },
                                maxWidth: {
                                    type: "string",
                                    title: "Largura Máxima",
                                    'enum': ["none", "100%", "500px", "800px", "1200px"],
                                    'default': "none"
                                }
                            }
                        }
                    }
                };
            },
            renderObject: function (params) {
                var containerSelector = params.containerSelector;
                var itemObject = params.itemObject;
                var config = params.config;
                var data = params.data;

                updateTextElementMReport(containerSelector, itemObject, config, data,false);
            }
        }
    ]




}


function formatDataValue(value, formatConfig) {
    if (!formatConfig || !value) return value;

    var formattedValue = value;

    try {
        switch (formatConfig.type) {
            case "number":
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 0,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2
                    }).format(num);
                }
                break;

            case "currency":
                console.log("")
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        style: "currency",
                        currency: formatConfig.currency || "EUR",
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 2,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2,
                        currencyDisplay: 'symbol'
                    }).format(num);

                    // Mover símbolo da moeda para a direita
                    if (formatConfig.currencyPosition === 'right') {
                        var parts = formattedValue.match(/^([^\d]*)([\d\s.,]+)([^\d]*)$/);
                        if (parts) {
                            var symbol = parts[1] || parts[3];
                            var number = parts[2];
                            formattedValue = number.trim() + ' ' + symbol.trim();
                        }
                    }
                }
                break;

            case "percentage":
                var num = parseFloat(value);
                if (!isNaN(num)) {
                    formattedValue = new Intl.NumberFormat(formatConfig.locale || "pt-PT", {
                        style: "percent",
                        minimumFractionDigits: formatConfig.minimumFractionDigits || 0,
                        maximumFractionDigits: formatConfig.maximumFractionDigits || 2
                    }).format(num / 100);
                }
                break;

            case "date":
                var date = new Date(value);
                if (!isNaN(date.getTime())) {
                    formattedValue = new Intl.DateTimeFormat(formatConfig.locale || "pt-PT").format(date);
                }
                break;

            default:
                formattedValue = value.toString();
        }

        // Adicionar prefixo e sufixo
        if (formatConfig.prefix) formattedValue = formatConfig.prefix + formattedValue;
        if (formatConfig.suffix) formattedValue = formattedValue + formatConfig.suffix;

    } catch (e) {
        console.warn("Erro na formatação do valor:", e);
        formattedValue = value;
    }

    return formattedValue;
}


function updateTextElementMReport(containerSelector, itemObject, config, data, isConfig) {
    var textId = 'text_element_' + itemObject.mreportobjectstamp;

    // Limpar container
    $(containerSelector).html('');
    //$(textId).remove();
    // PREPARAR CONTEÚDO DOS DADOS - IGUAL AOS OUTROS OBJETOS
    var content = "";

     data = findDataByMapCode(config.dataField);
    var dataFieldSplitted=config.dataField.split("-")


    if (config.dataField && data && data.length > 0) {
        // Usar campo de dados
        if (config.content && config.content.multipleValues) {
            // Múltiplos valores
            var values = data.map(function (item) {
                

                return formatDataValue(item[dataFieldSplitted[1]], config.dataFormat);
            });
            content = values.join(config.content.separator || ", ");
        } else {
            // Primeiro valor apenas
            var rawValue = data[0][dataFieldSplitted[1]];
            //console.log("rawValuerawValue",rawValue)
            content = formatDataValue(rawValue, config.dataFormat);
        }
    } else if (config.staticText) {
        // Usar texto estático
        content = config.staticText;
    } else {
        content = "Texto personalizado aqui...";
    }

    // Construir estilos CSS
    var styles = "";

    if (config.textFormat) {
        styles += "font-size: " + (config.textFormat.fontSize || 16) + "px;";
        styles += "font-weight: " + (config.textFormat.fontWeight || "normal") + ";";
        styles += "font-style: " + (config.textFormat.fontStyle || "normal") + ";";
        styles += "font-family: " + (config.textFormat.fontFamily || "Arial") + ";";
        styles += "text-align: " + (config.textFormat.textAlign || "left") + ";";
        styles += "line-height: " + (config.textFormat.lineHeight || 1.5) + ";";
    }

    if (config.colors) {
        styles += "color: " + (config.colors.textColor || "#333333") + ";";
        if (config.colors.backgroundColor !== "transparent") {
            styles += "background-color: " + config.colors.backgroundColor + ";";
        }
    }

    if (config.spacing) {
        styles += "padding: " +
            (config.spacing.paddingTop || 0) + "px " +
            (config.spacing.paddingRight || 0) + "px " +
            (config.spacing.paddingBottom || 0) + "px " +
            (config.spacing.paddingLeft || 0) + "px;";
        styles += "margin: " +
            (config.spacing.marginTop || 0) + "px 0 " +
            (config.spacing.marginBottom || 0) + "px 0;";
    }

    if (config.border) {
        if (config.border.width > 0) {
            styles += "border: " + config.border.width + "px " +
                (config.border.style || "solid") + " " +
                (config.colors.borderColor || "transparent") + ";";
        }
        styles += "border-radius: " + (config.border.radius || 0) + "px;";
    }

    if (config.effects && config.effects.textShadow) {
        styles += "text-shadow: " +
            (config.effects.shadowOffsetX || 1) + "px " +
            (config.effects.shadowOffsetY || 1) + "px " +
            (config.effects.shadowBlur || 2) + "px " +
            (config.effects.shadowColor || "#666666") + ";";
    }

    if (config.dimensions) {
        styles += "width: " + (config.dimensions.width || "100%") + ";";
        if (config.dimensions.height !== "auto") {
            styles += "height: " + config.dimensions.height + ";";
        }
        if (config.dimensions.maxWidth !== "none") {
            styles += "max-width: " + config.dimensions.maxWidth + ";";
        }
    }

    // Criar elemento
    var textElement = "";
    textElement += '<div id="' + textId + '" class="m-dash-text-element" style="' + styles + '">';

    if (config.content && config.content.htmlEnabled) {
        textElement += content; // Permite HTML
    } else {
        textElement += $('<div>').text(content).html(); // Escapa HTML
    }

    textElement += '</div>';

    // Adicionar ao container
    $(containerSelector).append(textElement);

    //console.log(containerSelector, 'Elemento de texto renderizado:', textId);
}
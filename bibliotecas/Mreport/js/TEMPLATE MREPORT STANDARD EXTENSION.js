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

                updateTextElementMReport(containerSelector, itemObject, config, data, false);
            }
        },
        {
            id: 2,
            tipo: "Tabela",
            descricao: "Tabela",
            label: "Tabela",
            icon: "fa fa-table",
            categoria: "editor",
            createDynamicSchema: createTableSchema,
            renderObject: function (params) {
                var containerSelector = params.containerSelector;
                var itemObject = params.itemObject;
                var config = params.config;
                var data = params.data;

                /*if (!data || data.length === 0) {
                    console.warn("Nenhum dado disponível para renderizar a tabela");
                    return;
                }*/

                updateTable(containerSelector, itemObject, config, data);
            }
        },
    ]




}


function createTableSchema(data) {
    var fieldOptions = [];

    data = alasql("select  * from BALANCETE  ")
    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(function (key) {
            fieldOptions.push(key);
        });
    }

    return {
        type: "object",
        title: "Configuração da Tabela",
        properties: {
            // Configurações de hierarquia/nested
            dataTree: {
                type: "object",
                title: "Configuração Hierárquica",
                properties: {
                    enabled: {
                        type: "boolean",
                        title: "Ativar Estrutura Hierárquica",
                        'default': true
                    },
                    parentField: {
                        type: "string",
                        title: "Campo ID do Registo",
                        'enum': fieldOptions,
                        'default': "id"
                    },
                    childField: {
                        type: "string",
                        title: "Campo de Ligação (LinkStamp)",
                        'enum': fieldOptions,
                        'default': "linkstamp"
                    },
                    startExpanded: {
                        type: "boolean",
                        title: "Expandir Tudo Inicialmente",
                        'default': true
                    }
                }
            },

            // NOVA SEÇÃO: Configurações de Cores
            styling: {
                type: "object",
                title: "Configuração de Cores",
                properties: {
                    headerBackgroundColor: {
                        type: "string",
                        title: "Cor de Fundo do Cabeçalho",
                        format: "color",
                        'default': getColorByType("primary").background
                    },
                    headerTextColor: {
                        type: "string",
                        title: "Cor do Texto do Cabeçalho",
                        format: "color",
                        'default': "#ffffff"
                    }
                }
            },

            // Configurações gerais
            layout: {
                type: "string",
                title: "Layout da Tabela",
                'enum': ["fitData", "fitColumns", "fitDataFill", "fitDataStretch"],
                options: {
                    enum_titles: ["Ajustar aos Dados", "Ajustar Colunas", "Preencher", "Esticar"]
                },
                'default': "fitData"
            },
            height: {
                type: "string",
                title: "Altura da Tabela",
                'default': "400px"
            },
            pagination: {
                type: "object",
                title: "Paginação",
                properties: {
                    enabled: {
                        type: "boolean",
                        title: "Ativar Paginação",
                        'default': false,
                        description: "Recomendado desativar com estrutura hierárquica"
                    },
                    size: {
                        type: "integer",
                        title: "Itens por Página",
                        'default': 10,
                        'enum': [5, 10, 25, 50, 100]
                    }
                }
            },
            columns: {
                type: "array",
                title: "Configuração das Colunas",
                items: {
                    type: "object",
                    title: "Coluna",
                    properties: {
                        field: {
                            type: "string",
                            title: "Campo",
                            'enum': fieldOptions
                        },
                        title: {
                            type: "string",
                            title: "Título da Coluna"
                        },
                        visible: {
                            type: "boolean",
                            title: "Visível",
                            'default': true
                        },
                        width: {
                            type: "integer",
                            title: "Largura (px)",
                            minimum: 50
                        },
                        minWidth: {
                            type: "integer",
                            title: "Largura Mínima (px)",
                            'default': 40
                        },
                        resizable: {
                            type: "boolean",
                            title: "Redimensionável",
                            'default': true
                        },
                        frozen: {
                            type: "boolean",
                            title: "Congelar Coluna",
                            'default': false
                        },
                        hozAlign: {
                            type: "string",
                            title: "Alinhamento Horizontal",
                            'enum': ["left", "center", "right"],
                            'default': "left"
                        },
                        vertAlign: {
                            type: "string",
                            title: "Alinhamento Vertical",
                            'enum': ["top", "middle", "bottom"],
                            'default': "middle"
                        },
                        sorter: {
                            type: "string",
                            title: "Tipo de Ordenação",
                            'enum': ["string", "number", "alphanum", "boolean", "exists", "date", "time", "datetime"],
                            'default': "string"
                        },
                        formatter: {
                            type: "string",
                            title: "Formatador",
                            'enum': ["plaintext", "textarea", "number", "html", "money", "link", "datetime", "datetimediff", "tickCross", "color", "star", "traffic", "progress", "lookup", "buttonTick", "buttonCross", "rownum", "handle"],
                            'default': "plaintext"
                        },
                        formatterParams: {
                            type: "object",
                            title: "Parâmetros do Formatador",
                            properties: {
                                thousand: {
                                    type: "string",
                                    title: "Separador de milhares",
                                    'default': ","
                                },
                                decimal: {
                                    type: "string",
                                    title: "Separador decimal",
                                    'default': "."
                                },
                                precision: {
                                    type: "integer",
                                    title: "Casas decimais",
                                    'default': 2
                                },
                                symbol: {
                                    type: "string",
                                    title: "Símbolo da moeda",
                                    'default': "€"
                                }
                            }
                        },
                        headerFilter: {
                            type: "boolean",
                            title: "Filtro no Cabeçalho",
                            'default': false
                        }
                    },
                    required: ["field", "title"]
                },
                'default': fieldOptions.filter(function (field) {
                    return field !== 'linkstamp'; // Ocultar linkstamp por padrão
                }).map(function (field) {
                    return {
                        field: field,
                        title: field.charAt(0).toUpperCase() + field.slice(1),
                        visible: field !== 'id', // Ocultar ID por padrão mas manter disponível
                        resizable: true,
                        frozen: false,
                        hozAlign: "left",
                        vertAlign: "middle",
                        sorter: field === "totalsalario" || field === "totalemprestimo" || field === "funcionarios" ? "number" : "string",
                        formatter: field === "totalsalario" || field === "totalemprestimo" ? "money" : "plaintext",
                        headerFilter: false,
                        formatterParams: field === "totalsalario" || field === "totalemprestimo" ? {
                            thousand: ",",
                            decimal: ".",
                            precision: 2,
                            symbol: "€"
                        } : {}
                    };
                })
            }
        }
    };
}


function updateTable(containerSelector, itemObject, config, data) {
    data = alasql("select  * from BALANCETE  ");

    var tabelaId = 'tabulator-table-' + itemObject.mdashcontaineritemobjectstamp;
    try {
        // Destruir tabela existente se houver
        var existingTable = document.getElementById(tabelaId);
        if (existingTable) {
            existingTable.innerHTML = '';
        }

        // APLICAR CORES DO CABEÇALHO DINAMICAMENTE
        if (config.styling) {
            var styleElement = document.getElementById('dynamic-table-styles-' + itemObject.mdashcontaineritemobjectstamp);
            if (styleElement) {
                styleElement.remove();
            }

            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-table-styles-' + itemObject.mdashcontaineritemobjectstamp;
            // ...existing code...

            styleElement.innerHTML = "";
            styleElement.innerHTML += ".tabulator .tabulator-header {";
            styleElement.innerHTML += "    background-color: " + (config.styling.headerBackgroundColor || '#0765b7') + " !important;";
            styleElement.innerHTML += "}";
            styleElement.innerHTML += ".tabulator .tabulator-header .tabulator-col {";
            styleElement.innerHTML += "    background-color: " + (config.styling.headerBackgroundColor || '#0765b7') + " !important;";
            styleElement.innerHTML += "    color: " + (config.styling.headerTextColor || '#ffffff') + " !important;";
            styleElement.innerHTML += "}";

            // ...existing code...
            document.head.appendChild(styleElement);
        }

        // Configurar colunas visíveis
        var columns = config.columns.filter(function (col) {
            return col.visible;
        }).map(function (col) {
            var column = {
                title: col.title,
                field: col.field,
                hozAlign: col.hozAlign,
                vertAlign: col.vertAlign,
                resizable: col.resizable,
                frozen: col.frozen,
                sorter: col.sorter,
                formatter: col.formatter
            };

            if (col.width) column.width = col.width;
            if (col.minWidth) column.minWidth = col.minWidth;
            if (col.headerFilter) {
                column.headerFilter = "input";
            }

            // Configurar formatador com parâmetros
            if (col.formatter === "money" && col.formatterParams) {
                column.formatterParams = col.formatterParams;
                column.formatterParams.symbolAfter = true;
            }

            return column;
        });

        // Preparar dados - se hierárquico, converter para árvore
        var tableData = data;
        if (config.dataTree && config.dataTree.enabled) {
            tableData = buildDataTree(data, config.dataTree.parentField, config.dataTree.childField);
        }

        // Configuração do Tabulator - NATIVA
        var tabulatorConfig = {
            data: tableData,
            columns: columns,
            layout: config.layout || "fitData",
            height: config.height || "400px"
        };

        if (config.pagination && config.pagination.enabled && (!config.dataTree || !config.dataTree.enabled)) {
            tabulatorConfig.pagination = "local";
            tabulatorConfig.paginationSize = config.pagination.size || 10;
            tabulatorConfig.paginationSizeSelector = [5, 10, 25, 50, 100];
        }

        // Configurar estrutura hierárquica NATIVA do Tabulator
        if (config.dataTree && config.dataTree.enabled) {
            tabulatorConfig.dataTree = true;
            tabulatorConfig.dataTreeChildField = "_children";
            tabulatorConfig.dataTreeStartExpanded = config.dataTree.startExpanded !== false;

            // Usar primeira coluna visível para o expansor
            if (columns.length > 0) {
                tabulatorConfig.dataTreeElementColumn = columns[0].field;
            }
        }

        // ... resto da função igual (container, eventos, etc.)

        // Criar container da tabela com botões de exportação
        var tableContainer = $(containerSelector);

        tableContainer.append('<div id="' + tabelaId + '"></div>');

        tabulatorConfig.langs = {
            "pt-br": {
                "columns": {
                    "name": "Nome", //substitui o título da coluna name pelo valor "Nome"
                },
                "data": {
                    "loading": "Carregando", //texto do carregador de dados
                    "error": "Erro", //texto de erro de dados
                },
                "groups": { //texto para a contagem automática de itens no cabeçalho do grupo
                    "item": "item", //singular para item
                    "items": "itens", //plural para itens
                },
                "pagination": {
                    "page_size": "Tamanho da Página", //rótulo para o elemento select de tamanho da página
                    "page_title": "Mostrar Página", //texto de tooltip para o botão de página numérica, aparece antes do número da página (ex: "Mostrar Página" resultará em tooltip "Mostrar Página 1" no botão da página 1)
                    "first": "Primeira", //texto para o botão da primeira página
                    "first_title": "Primeira Página", //texto de tooltip para o botão da primeira página
                    "last": "Última",
                    "last_title": "Última Página",
                    "prev": "Anterior",
                    "prev_title": "Página Anterior",
                    "next": "Próxima",
                    "next_title": "Próxima Página",
                    "all": "Todos",
                    "counter": {
                        "showing": "Mostrando",
                        "of": "de",
                        "rows": "linhas",
                        "pages": "páginas",
                    }
                },
                "headerFilters": {
                    "default": "filtrar coluna...", //texto padrão do placeholder do filtro de cabeçalho
                    "columns": {
                        "name": "filtrar nome...", //substitui o texto padrão do filtro de cabeçalho para a coluna name
                    }
                }
            }
        },

            tabulatorConfig.locale = "pt-br";

            tabulatorConfig.rowHeight=25;
        // Inicializar Tabulator
        new Tabulator('#' + tabelaId, tabulatorConfig);

    } catch (e) {
        console.error('Erro ao atualizar tabela:', e);
    }
}


// Função auxiliar para expandir filhos recursivamente
function expandChildrenRecursive(row) {
    var children = row.getTreeChildren();
    children.forEach(function (child) {
        if (child.getTreeChildren && child.getTreeChildren().length > 0) {
            child.treeExpand();
            expandChildrenRecursive(child);
        }
    });
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
    var dataFieldSplitted = config.dataField.split("-")


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
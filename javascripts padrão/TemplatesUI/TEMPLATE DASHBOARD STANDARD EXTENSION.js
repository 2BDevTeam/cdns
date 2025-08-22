
$(document).ready(function () {

    var styles = []

    addDashboardStyles(styles);
    addTabulatorStyles(styles);
    var globalStyle = ""
    styles.forEach(function (style) {
        globalStyle += style;
    });
    $('head').append('<style>' + globalStyle + '</style>');
});




// ...existing code...

function addTabulatorStyles(styles) {
    var tabulatorCSS = "";

    tabulatorCSS += ".visualization-container {";
    tabulatorCSS += "    border: 1px solid #dee2e6;";
    tabulatorCSS += "    border-radius: 0.375rem;";
    tabulatorCSS += "    padding: 1rem;";
    tabulatorCSS += "    min-height: 400px;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-tree-level-1 {";
    tabulatorCSS += "    background-color: #f8f9fa !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-tree-level-2 {";
    tabulatorCSS += "    background-color: #e9ecef !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-tree-level-3 {";
    tabulatorCSS += "    background-color: #dee2e6 !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-tree-level-4 {";
    tabulatorCSS += "    background-color: #ced4da !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-tree-level-5 {";
    tabulatorCSS += "    background-color: #adb5bd !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator {";
    tabulatorCSS += "    background-color: white;";
    tabulatorCSS += "    border-radius: 10px;";
    tabulatorCSS += "    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);";
    tabulatorCSS += "    border: none;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator .tabulator-header {";
    tabulatorCSS += "    background-color: #0765b7;";
    tabulatorCSS += "    border-bottom: none;";
    tabulatorCSS += "    border-radius: 10px 10px 0 0;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col {";
    tabulatorCSS += "    background-color: #0765b7;";
    tabulatorCSS += "    color: white;";
    tabulatorCSS += "    border-right: none;";
    tabulatorCSS += "    padding: 12px 15px;";
    tabulatorCSS += "    font-weight: 500;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col:first-child {";
    tabulatorCSS += "    border-top-left-radius: 10px;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator .tabulator-header .tabulator-col:last-child {";
    tabulatorCSS += "    border-top-right-radius: 10px;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row {";
    tabulatorCSS += "    border-bottom: 1px solid #e0e6ed;";
    tabulatorCSS += "    transition: background-color 0.2s ease;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row.tabulator-row-even {";
    tabulatorCSS += "    background-color: #fcfdfe;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-row:hover {";
    tabulatorCSS += "    background-color: #f5f9ff !important;";
    tabulatorCSS += "}";

    tabulatorCSS += ".tabulator-cell {";
    tabulatorCSS += "    padding: 12px 15px;";
    tabulatorCSS += "    border-right: none;";
    tabulatorCSS += "}";

    styles.push(tabulatorCSS);
}

// ...existing code...

function generateDashCardSnapshot(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";

    cardHTML += '<div id="' + (dashCard.id || 'snapshot-' + generateUUID()) + '" class="m-dash-item snapshot ' + (dashCard.classes || '') + '" style="height: 100%!important;' + (dashCard.styles || '') + '">';
    cardHTML += '  <div class="stats-card-value-container">';
    cardHTML += '    <span class="stats-card-label">' + (dashCard.title || "") + '</span>';
    cardHTML += '    <div class="stats-card-body">' + (dashCard.bodyContent || "") + '</div>';
    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;
}

function generateDashCardStandard(cardData) {
    var dashCard = new MDashCard(cardData);
    var cardHTML = "";

    cardHTML += '<div id="' + dashCard.id + '" class="m-dash-item ' + (dashCard.classes || '') + '" style="height: 100%!important;' + (dashCard.styles || '') + '">';
    cardHTML += '  <h1 class="m-dash-item-title">' + (dashCard.title || "Gráfico") + '</h1>';

    cardHTML += "<div class='m-dash-standard-card-body' >" + (dashCard.bodyContent || "") + "</div>";
    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;
}


function createDynamicSchemaGrafico(data) {
    var availableFields = Object.keys(data[0]);

    return {
        type: "object",
        title: "Configuração de gráficos",
        properties: {
            chartContainer: {
                type: "object",
                title: "Container do Gráfico",
                properties: {
                    width: {
                        type: "string",
                        title: "Largura",
                        'default': "600"
                    },
                    height: {
                        type: "string",
                        title: "Altura",
                        'default': "400"
                    }
                }
            },
            title: {
                type: "object",
                title: "Título",
                properties: {
                    text: {
                        type: "string",
                        title: "Texto do Título",
                        'default': "Meu Gráfico"
                    },
                    show: {
                        type: "boolean",
                        title: "Mostrar Título",
                        'default': true
                    }
                }
            },
            xAxis: {
                type: "object",
                title: "Eixo X",
                properties: {
                    type: {
                        type: "string",
                        title: "Tipo",
                        'enum': ["category", "value", "time", "log"],
                        'default': "category"
                    },
                    dataField: {
                        type: "string",
                        title: "Campo para Eixo X",
                        'enum': availableFields,
                        'default': "mes"
                    }
                }
            },
            yAxis: {
                type: "object",
                title: "Eixo Y",
                properties: {
                    type: {
                        type: "string",
                        title: "Tipo",
                        'enum': ["category", "value", "time", "log"],
                        'default': "value"
                    },
                    dataField: {
                        type: "string",
                        title: "Campo para Eixo Y",
                        'enum': availableFields,
                        'default': "mes"
                    }
                }
            },
            series: {
                type: "array",
                title: "Séries",
                items: {
                    type: "object",
                    title: "Série",
                    properties: {
                        name: {
                            type: "string",
                            title: "Nome da Série"
                        },
                        dataField: {
                            type: "string",
                            title: "Campo de Dados",
                            'enum': availableFields,
                            'default': "totalsalario"
                        },
                        type: {
                            type: "string",
                            title: "Tipo de Gráfico",
                            'enum': ["line", "bar", "pie", "scatter", "area"],
                            'default': "line"
                        },
                        color: {
                            type: "string",
                            title: "Cor",
                            format: "color"
                        },
                        barWidth: {
                            type: "number",
                            title: "Largura da Barra (%)",
                            'default': 60,
                            minimum: 10,
                            maximum: 100,
                            description: "Largura das barras em percentagem (10-100)"
                        },
                        itemStyle: {
                            type: "object", title: "Estilo dos Itens",
                            properties: {
                                borderRadius: {
                                    type: "array",
                                    title: "Raio das Bordas [topo-esq, topo-dir, baixo-dir, baixo-esq]",
                                    items: {
                                        type: "number"
                                    },
                                    'default': [6, 6, 0, 0],
                                    maxItems: 4,
                                    minItems: 4
                                }
                            }
                        }
                    }
                }
            }
            // ...existing code...
        }
    };
}


function renderObjectGrafico(dados) {

    var chartId = 'm-dash-grafico' + dados.itemObject.mdashcontaineritemobjectstamp;
    $("#" + chartId).remove(); // Remove any existing chart with the same ID
    var chartDomDiv = "<div style='width: " + ("100" + "%" || "600px") + "; height: " + (dados.config.chartContainer.height + "px" || "400px") + ";' id='" + chartId + "' class='m-dash-grafico'></div>";

    console.log("dados.containerSelector", dados.containerSelector)
    $(dados.containerSelector).append(chartDomDiv);


    var chartElement = document.getElementById(chartId);
    var chartToRender = echarts.init(chartElement);



    updateChartOnContainer(chartToRender, dados.config, JSON.parse(JSON.stringify(dados.data)));
}


function updateChartOnContainer(chart, config, data) {
    try {
        var option = {
            title: {
                text: config.title ? config.title.text : '',
                show: config.title ? config.title.show : false
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: config.series ? config.series.map(function (s) { return s.name; }) : []
            },
            xAxis: {
                type: config.xAxis.type,
                data: data.map(function (item) {
                    return item[config.xAxis.dataField];
                })
            },
            yAxis: {
                type: config.yAxis.type,
                data: data.map(function (item) {
                    return item[config.xAxis.dataField];
                })
            },
            series: config.series ? config.series.map(function (serie) {
                var serieConfig = {
                    name: serie.name,
                    type: serie.type,
                    data: data.map(function (item) {
                        return item[serie.dataField];
                    })
                };

                // Adicionar cor se definida
                if (serie.color) {
                    serieConfig.itemStyle = serieConfig.itemStyle || {};
                    serieConfig.itemStyle.color = serie.color;
                }

                // Adicionar barWidth concatenando % na renderização
                if (serie.barWidth) {
                    serieConfig.barWidth = serie.barWidth + '%';
                }

                // Adicionar itemStyle se definido
                if (serie.itemStyle) {
                    serieConfig.itemStyle = serieConfig.itemStyle || {};
                    if (serie.itemStyle.borderRadius) {
                        serieConfig.itemStyle.borderRadius = serie.itemStyle.borderRadius;
                    }
                }

                return serieConfig;
            }) : []
        };

        chart.setOption(option, true);
        console.log('Gráfico atualizado:', option);
    } catch (e) {
        console.error('Erro ao atualizar gráfico:', e);
    }
}

function getTiposObjectoConfig() {

    return [{
        tipo: "Gráfico",
        descricao: "Gráfico",
        createDynamicSchema: createDynamicSchemaGrafico,
        renderObject: renderObjectGrafico
    },
    {
        tipo: "Pie",
        descricao: "Gráfico de Pizza",
        createDynamicSchema: function (data) {
            var fieldOptions = [];
            var fieldTitles = [];

            if (data && data.length > 0) {
                Object.keys(data[0]).forEach(function (key) {
                    fieldOptions.push(key);
                    fieldTitles.push(key);
                });
            }

            return {
                type: "object",
                title: "Configuração do Gráfico de Pizza",
                properties: {
                    // Campos de dados
                    labelField: {
                        type: "string",
                        title: "Campo para Rótulos",
                        'enum': fieldOptions,
                        options: {
                            enum_titles: fieldTitles
                        },
                        description: "Campo que será usado como rótulo das fatias"
                    },
                    valueField: {
                        type: "string",
                        title: "Campo para Valores",
                        'enum': fieldOptions,
                        options: {
                            enum_titles: fieldTitles
                        },
                        description: "Campo que será usado como valor das fatias"
                    },

                    // Configurações visuais
                    radius: {
                        type: "object",
                        title: "Configuração do Raio",
                        properties: {
                            inner: {
                                type: "string",
                                title: "Raio Interno",
                                'default': "40%",
                                description: "Raio interno (para donut chart)"
                            },
                            outer: {
                                type: "string",
                                title: "Raio Externo",
                                'default': "70%",
                                description: "Raio externo do gráfico"
                            }
                        }
                    },

                    // Configurações de aparência
                    itemStyle: {
                        type: "object",
                        title: "Estilo dos Itens",
                        properties: {
                            borderRadius: {
                                type: "integer",
                                title: "Raio das Bordas",
                                'default': 10,
                                minimum: 0,
                                maximum: 50
                            },
                            padAngle: {
                                type: "integer",
                                title: "Espaçamento entre Fatias",
                                'default': 5,
                                minimum: 0,
                                maximum: 20
                            }
                        }
                    },

                    // Configurações da legenda
                    legend: {
                        type: "object",
                        title: "Configuração da Legenda",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Legenda",
                                'default': true
                            },
                            position: {
                                type: "string",
                                title: "Posição da Legenda",
                                'enum': ["top", "bottom", "left", "right"],
                                options: {
                                    enum_titles: ["Superior", "Inferior", "Esquerda", "Direita"]
                                },
                                'default': "top"
                            },
                            align: {
                                type: "string",
                                title: "Alinhamento",
                                'enum': ["left", "center", "right"],
                                options: {
                                    enum_titles: ["Esquerda", "Centro", "Direita"]
                                },
                                'default': "center"
                            }
                        }
                    },

                    // Configurações dos rótulos
                    label: {
                        type: "object",
                        title: "Configuração dos Rótulos",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Rótulos",
                                'default': false
                            },
                            position: {
                                type: "string",
                                title: "Posição dos Rótulos",
                                'enum': ["outside", "inside", "center"],
                                options: {
                                    enum_titles: ["Fora", "Dentro", "Centro"]
                                },
                                'default': "outside"
                            },
                            showPercentage: {
                                type: "boolean",
                                title: "Mostrar Percentual",
                                'default': true
                            },
                            fontSize: {
                                type: "integer",
                                title: "Tamanho da Fonte",
                                'default': 12,
                                minimum: 8,
                                maximum: 24
                            }
                        }
                    },

                    // Configurações de tooltip
                    tooltip: {
                        type: "object",
                        title: "Configuração do Tooltip",
                        properties: {
                            trigger: {
                                type: "string",
                                title: "Tipo de Trigger",
                                'enum': ["item", "axis"],
                                options: {
                                    enum_titles: ["Item", "Eixo"]
                                },
                                'default': "item"
                            },
                            showPercentage: {
                                type: "boolean",
                                title: "Mostrar Percentual no Tooltip",
                                'default': true
                            }
                        }
                    },

                    // Texto central (para donut charts)
                    centerText: {
                        type: "object",
                        title: "Texto Central",
                        properties: {
                            show: {
                                type: "boolean",
                                title: "Mostrar Texto Central",
                                'default': false
                            },
                            text: {
                                type: "string",
                                title: "Texto",
                                'default': "Total"
                            },
                            showTotal: {
                                type: "boolean",
                                title: "Mostrar Total",
                                'default': true,
                                description: "Mostrar a soma dos valores no centro"
                            },
                            fontSize: {
                                type: "integer",
                                title: "Tamanho da Fonte",
                                'default': 30,
                                minimum: 12,
                                maximum: 60
                            },
                            fontWeight: {
                                type: "string",
                                title: "Peso da Fonte",
                                'enum': ["normal", "bold"],
                                options: {
                                    enum_titles: ["Normal", "Negrito"]
                                },
                                'default': "bold"
                            },
                            color: {
                                type: "string",
                                title: "Cor do Texto",
                                format: "color",
                                'default': "#333"
                            }
                        }
                    },

                    // Cores personalizadas
                    colors: {
                        type: "array",
                        title: "Cores Personalizadas",
                        items: {
                            type: "string",
                            format: "color"
                        },
                        'default': [
                            '#f79523',
                            '#d43f3a',
                            '#00897B',
                            '#91c7ae',
                            '#749f83',
                            '#ca8622',
                            '#bda29a',
                            '#6e7074',
                            '#546570',
                            '#c4ccd3'
                        ]
                    },

                    // Dimensões
                    dimensions: {
                        type: "object",
                        title: "Dimensões do Gráfico",
                        properties: {
                            width: {
                                type: "string",
                                title: "Largura",
                                'default': 400
                            },
                            height: {
                                type: "integer",
                                title: "Altura (px)",
                                'default': 400,
                                minimum: 200,
                                maximum: 800
                            }
                        }
                    }
                },
                required: ["labelField", "valueField"]
            };
        },
        renderObject: function (params) {
            var containerSelector = params.containerSelector;
            var itemObject = params.itemObject;
            var config = params.config;
            var data = params.data;

            if (!config.labelField || !config.valueField) {
                console.warn("Campos obrigatórios não configurados para o gráfico de pizza");
                return;
            }

            updatePie(containerSelector, itemObject, config, data);
        }
    },
    {
        tipo: "Tabela",
        descricao: "Tabela",
        createDynamicSchema: createTableSchema,
        renderObject: function (params) {
            var containerSelector = params.containerSelector;
            var itemObject = params.itemObject;
            var config = params.config;
            var data = params.data;

            if (!data || data.length === 0) {
                console.warn("Nenhum dado disponível para renderizar a tabela");
                return;
            }

            updateTable(containerSelector, itemObject, config, data);
        }
    },
    {
        tipo: "Texto",
        descricao: "Elemento de Texto",
        createDynamicSchema: function (data) {
            var fieldOptions = [];

            if (data && data.length > 0) {
                Object.keys(data[0]).forEach(function (key) {
                    fieldOptions.push(key);
                });
            }

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
                                'default': "normal"
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
                                'enum': ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Courier New", "Comic Sans MS", "Impact", "Trebuchet MS", "Arial Black"],
                                'default': "Arial"
                            },
                            textAlign: {
                                type: "string",
                                title: "Alinhamento",
                                'enum': ["left", "center", "right", "justify"],
                                'default': "left"
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
                                'default': "transparent"
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

            updateTextElement(containerSelector, itemObject, config, data);
        }
    }


    ]




}



function updateTextElement(containerSelector, itemObject, config, data) {
    var textId = 'text_element_' + itemObject.mdashcontaineritemobjectstamp;

    // Limpar container
    $(containerSelector).html('');

    // PREPARAR CONTEÚDO DOS DADOS - IGUAL AOS OUTROS OBJETOS
    var content = "";

    if (config.dataField && data && data.length > 0) {
        // Usar campo de dados
        if (config.content && config.content.multipleValues) {
            // Múltiplos valores
            var values = data.map(function (item) {
                return formatDataValue(item[config.dataField], config.dataFormat);
            });
            content = values.join(config.content.separator || ", ");
        } else {
            // Primeiro valor apenas
            var rawValue = data[0][config.dataField];
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
            (config.spacing.paddingTop || 10) + "px " +
            (config.spacing.paddingRight || 10) + "px " +
            (config.spacing.paddingBottom || 10) + "px " +
            (config.spacing.paddingLeft || 10) + "px;";
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
    $(containerSelector).html(textElement);

    console.log('Elemento de texto renderizado:', textId);
}

// FUNÇÃO AUXILIAR PARA FORMATAÇÃO DE DADOS
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


function getColorByType(type) {
    // Cria botão temporário dinamicamente
    var tempBtn = $('<button class="btn btn-' + type + '" style="display:none"></button>').appendTo('body');

    // Obtém cores
    var corFundo = tempBtn.css('background-color');
    var corTexto = tempBtn.css('color');

    // Remove o botão temporário
    tempBtn.remove();

    // Retorna objeto com as cores
    return {
        background: corFundo,
        text: corTexto
    };
}



function updatePie(containerSelector, itemObject, config, data) {
    var chartId = 'pie_chart_' + itemObject.mdashcontaineritemobjectstamp;

    // Preparar container do gráfico
    //vendaunt
    //vndsmcom
    var chartContainer = '<div id="' + chartId + '" style="width: ' +
        (100) + '%; height: ' +
        (config.dimensions.height || 400) + 'px;"></div>';

    $(containerSelector).html(chartContainer);

    // Aguardar o DOM estar pronto
    setTimeout(function () {
        var chartDom = document.getElementById(chartId);

        if (!chartDom) {
            console.error('Container do gráfico não encontrado:', chartId);
            return;
        }

        // Inicializar ECharts
        var myChart = echarts.init(chartDom);

        // Preparar dados para o gráfico de pizza
        var items = data.map(function (item) {
            return {
                name: item[config.labelField],
                value: parseFloat(item[config.valueField]) || 0
            };
        });

        // Calcular total para texto central
        var total = items.reduce(function (sum, item) {
            return sum + item.value;
        }, 0);

        // Configurar opções do gráfico
        var option = {
            tooltip: {
                trigger: config.tooltip.trigger || 'item',
                padding: [10, 10],
                formatter: function (params) {
                    var percentage = ((params.value / total) * 100).toFixed(1);
                    var result = params.name + '<br/>';
                    result += params.seriesName + ': ' + params.value;
                    if (config.tooltip.showPercentage !== false) {
                        result += ' (' + percentage + '%)';
                    }
                    return result;
                }
            },

            legend: config.legend.show !== false ? {
                top: config.legend.position === 'top' ? '0%' :
                    config.legend.position === 'bottom' ? 'bottom' : 'auto',
                left: config.legend.align || 'center',
                bottom: config.legend.position === 'bottom' ? '0%' : 'auto',
                right: config.legend.position === 'right' ? '0%' : 'auto',
                orient: (config.legend.position === 'left' || config.legend.position === 'right') ? 'vertical' : 'horizontal'
            } : {
                show: false
            },

            color: config.colors || [
                '#f79523', '#d43f3a', '#00897B', '#91c7ae', '#749f83'
            ],

            series: [
                {
                    name: config.labelField || 'Dados',
                    type: 'pie',
                    radius: [config.radius.inner || '40%', config.radius.outer || '70%'],
                    avoidLabelOverlap: false,
                    padAngle: config.itemStyle.padAngle || 5,
                    itemStyle: {
                        borderRadius: config.itemStyle.borderRadius || 10
                    },
                    label: {
                        show: config.label.show || false,
                        position: config.label.position || 'outside',
                        fontSize: config.label.fontSize || 12,
                        formatter: function (params) {
                            if (config.label.showPercentage !== false) {
                                var percentage = ((params.value / total) * 100).toFixed(1);
                                return params.name + '\n' + percentage + '%';
                            }
                            return params.name;
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: (config.label.fontSize || 12) + 4,
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    labelLine: {
                        show: config.label.show || false
                    },
                    data: items
                }
            ]
        };

        // Adicionar texto central se configurado
        if (config.centerText.show) {
            var centerTextValue = '';

            if (config.centerText.showTotal) {
                centerTextValue = total.toString();
            }

            if (config.centerText.text && config.centerText.text.trim() !== '') {
                centerTextValue = config.centerText.showTotal ?
                    config.centerText.text + '\n' + centerTextValue :
                    config.centerText.text;
            }

            option.graphic = {
                type: 'text',
                left: 'center',
                top: 'middle',
                style: {
                    text: centerTextValue,
                    fontSize: config.centerText.fontSize || 30,
                    fontWeight: config.centerText.fontWeight || 'bold',
                    fill: config.centerText.color || '#333',
                    textAlign: 'center'
                }
            };
        }

        // Aplicar configuração e renderizar
        myChart.setOption(option);

        // Responsividade
        window.addEventListener('resize', function () {
            myChart.resize();
        });

        console.log('Gráfico de pizza renderizado com sucesso:', chartId);

    }, 100);
}



function createTableSchema(data) {
    var fieldOptions = [];

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
                        'default': "#0765b7"
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

            // Configurações das colunas - COMPLETAS
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
                            'enum': ["plaintext", "textarea","number", "html", "money", "link", "datetime", "datetimediff", "tickCross", "color", "star", "traffic", "progress", "lookup", "buttonTick", "buttonCross", "rownum", "handle"],
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
// Função RECURSIVA para converter dados planos em estrutura hierárquica



function buildDataTree(data, parentField, childField) {
    var lookup = {};
    var rootNodes = [];

    console.log('Iniciando buildDataTree com', data.length, 'registos');

    // Primeira passagem: criar lookup de todos os registos
    data.forEach(function (item) {
        var itemCopy = Object.assign({}, item);
        lookup[itemCopy[parentField]] = itemCopy;
    });

    console.log('Lookup criado:', Object.keys(lookup));

    // Função recursiva interna para adicionar filhos
    function addChildren(parentId) {
        var children = [];

        data.forEach(function (item) {
            if (item[childField] === parentId) {
                var child = lookup[item[parentField]];
                if (child) {
                    var grandChildren = addChildren(item[parentField]);
                    if (grandChildren.length > 0) {
                        child._children = grandChildren;
                    }
                    children.push(child);
                }
            }
        });

        return children;
    }

    // Segunda passagem: construir árvore começando pelos nós raiz
    data.forEach(function (item) {
        if (item[childField] === null || item[childField] === undefined) {
            var rootNode = lookup[item[parentField]];
            if (rootNode) {
                var children = addChildren(item[parentField]);
                if (children.length > 0) {
                    rootNode._children = children;
                }
                rootNodes.push(rootNode);
            }
        }
    });

    console.log('Árvore construída com', rootNodes.length, 'nós raiz');
    return rootNodes;
}



// Função para atualizar a tabela Tabulator - COM APLICAÇÃO DE CORES
function updateTable(containerSelector, itemObject, config, data) {

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








function getTemplateLayoutOptions() {

    return [
        {
            descricao: "Snapshot Layout v1",
            codigo: "snapshot_layout_v1",
            tipo: "snapshot",
            generateCard: generateDashCardInfo,
            UIData: {
                tipo: "primary"
            },
            containerSelectorToRender: ".m-dash-card-body-content"
        },
        {
            descricao: "Snapshot Layout v1 Warning",
            codigo: "snapshot_layout_v1_warning",
            tipo: "snapshot",
            UIData: {
                tipo: "warning"
            },
            generateCard: generateDashCardInfo,
            containerSelectorToRender: ".m-dash-card-body-content"
        },
        {
            descricao: "Snapshot layout v2",
            codigo: "snapshot_layout_v2",
            tipo: "snapshot",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardSnapshot,
            containerSelectorToRender: ".stats-card-body"
        },
        {
            descricao: "Card standard",
            codigo: "card_standard",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardStandard,
            containerSelectorToRender: ".m-dash-standard-card-body"
        },
        {
            descricao: "Card header destacado",
            codigo: "card_header_highlighted",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generateDashCardHTML,
            containerSelectorToRender: ".dashcard-body"
        },

        {
            descricao: "Plain Card",
            codigo: "plain_card",
            tipo: "card",
            UIData: {
                tipo: "primary"
            },
            generateCard: generatePlainCard,
            containerSelectorToRender: ".m-dash-plain-card-body-content"
        }
    ];

}


function generateDashCardHTML(cardData) {

    var dashCard = new MDashCard(cardData);
    var cardHTML = '<div style="height: 100%!important;" id="' + (dashCard.id || '') + '" class="dashcard">';
    // Header
    cardHTML += '<div class="dashcard-header dashcard-header-' + (dashCard.type || "primary") + '">';
    cardHTML += '<span class="dashcard-title">' + (dashCard.title || "") + '</span>';
    cardHTML += '</div>';
    // Body
    cardHTML += '<div class="dashcard-body table-responsive">';
    cardHTML += (dashCard.bodyContent || "");
    cardHTML += '</div>';
    cardHTML += '</div>';
    return cardHTML.trim();
}




function generatePlainCard(cardData) {

    var dashCard = new MDashCard(cardData);

    var cardHTML = "";

    cardHTML += '<div id="mdash' + dashCard.id + '" class="m-dash-plain-card ' + dashCard.classes + '" style="height: 100%!important;' + dashCard.styles + '">';
    cardHTML += '  <div class="wrap m-dash-plain-card_' + dashCard.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += "";
    if (dashCard.icon) {
        cardHTML += ' <i class="' + dashCard.icon + '"></i>';
    }
    cardHTML += '    </h4>';

    if (dashCard.header) {
        cardHTML += '    <div class="' + dashCard.headerClasses + '">' + dashCard.header + '</div>';
    }

    cardHTML += '    <div class="m-dash-plain-card-body-content ">';
    cardHTML += dashCard.bodyContent;
    cardHTML += '    </div>';

    if (dashCard.footer) {
        cardHTML += '    <div class="m-dash-plain-card-footer">' + dashCard.footer + '</div>';
    }

    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;


}



function generateDashCardInfo(cardData) {

    var dashCard = new MDashCard(cardData);

    var cardHTML = "";

    cardHTML += '<div id="mdash' + dashCard.id + '" class="c-dashboardInfo ' + dashCard.classes + '" style="height: 100%!important;' + dashCard.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + dashCard.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += dashCard.title;
    if (dashCard.icon) {
        cardHTML += ' <i class="' + dashCard.icon + '"></i>';
    }
    cardHTML += '    </h4>';

    if (dashCard.header) {
        cardHTML += '    <div class="' + dashCard.headerClasses + '">' + dashCard.header + '</div>';
    }

    cardHTML += '    <div class="m-dash-card-body-content dashcard-body">';
    cardHTML += dashCard.bodyContent;
    cardHTML += '    </div>';

    if (dashCard.footer) {
        cardHTML += '    <div class="dashcard-footer">' + dashCard.footer + '</div>';
    }

    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;


}




function MDashCard(data) {

    this.title = data.title || "";
    this.id = data.id || ""
    this.tipo = data.tipo || "primary";
    this.bodyContent = data.bodyContent || "";
    this.icon = data.icon || "";
    this.customData = data.customData || {};
    this.classes = data.classes || "";
    this.styles = data.styles || "";
    this.footer = data.footer || "";
    this.header = data.header || "";
    this.headerClasses = data.headerClasses || "";

}

MDashCard.prototype.generateDashCardInfo = function () {
    var cardHTML = "";

    cardHTML += '<div id="mdash' + this.id + '" class="c-dashboardInfo ' + this.classes + '" style="' + this.styles + '">';
    cardHTML += '  <div class="wrap c-dashboardInfo_' + this.tipo + '">';
    cardHTML += '    <h4 class="heading heading5 hind-font medium-font-weight c-dashboardInfo__title">';
    cardHTML += this.title;
    if (this.icon) {
        cardHTML += ' <i class="' + this.icon + '"></i>';
    }
    cardHTML += '    </h4>';

    if (this.header) {
        cardHTML += '    <div class="' + this.headerClasses + '">' + this.header + '</div>';
    }

    cardHTML += '    <div class="m-dash-card-body-content dashcard-body">';
    cardHTML += this.bodyContent;
    cardHTML += '    </div>';

    if (this.footer) {
        cardHTML += '    <div class="dashcard-footer">' + this.footer + '</div>';
    }

    cardHTML += '  </div>';
    cardHTML += '</div>';

    return cardHTML;
};

MDashCard.prototype.appendToBody = function (content) {

    $("#mdash" + this.id + " .m-dash-card-body-content").append(content);

}



function addDashboardStyles(styles) {
    var dashboardCSS = "";

    dashboardCSS += ".c-dashboardInfo {";
    dashboardCSS += "    margin-bottom: 15px;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo .wrap {";
    dashboardCSS += "    background: #ffffff;";
    dashboardCSS += "    box-shadow: 2px 10px 20px rgba(0, 0, 0, 0.1);";
    dashboardCSS += "    border-radius: 7px;";
    dashboardCSS += "    text-align: center;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    overflow: hidden;";
    dashboardCSS += "    padding: 40px 25px 20px;";
    dashboardCSS += "    height: 100%;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo__title,";
    dashboardCSS += ".c-dashboardInfo__subInfo {";
    dashboardCSS += "    color: #6c6c6c;";
    dashboardCSS += "    font-size: 1.18em;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo span {";
    dashboardCSS += "    display: block;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo__count {";
    dashboardCSS += "    font-weight: 600;";
    dashboardCSS += "    font-size: 2.5em;";
    dashboardCSS += "    line-height: 64px;";
    dashboardCSS += "    color: #323c43;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo .wrap:after {";
    dashboardCSS += "    display: block;";
    dashboardCSS += "    position: absolute;";
    dashboardCSS += "    top: 0;";
    dashboardCSS += "    left: 0;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    height: 7px;";
    dashboardCSS += "    content: '';";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_primary:after {";
    dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00a173 100%);";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo .c-dashboardInfo_warning:after {";
    dashboardCSS += "    background: linear-gradient(82.59deg, #f79523 0%, #d88627 100%);";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo__title svg {";
    dashboardCSS += "    color: #d7d7d7;";
    dashboardCSS += "    margin-left: 5px;";
    dashboardCSS += "}";

    dashboardCSS += ".c-dashboardInfo__title {";
    dashboardCSS += "    font-weight: 700;";
    dashboardCSS += "    font-size: 20px;";
    dashboardCSS += "}";

    dashboardCSS += "@media (max-width: 768px) {";
    dashboardCSS += "    .c-dashboardInfo {";
    dashboardCSS += "        flex: 1 1 100%;";
    dashboardCSS += "        max-width: 100%;";
    dashboardCSS += "    }";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard {";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    min-width: 0;";
    dashboardCSS += "    word-wrap: break-word;";
    dashboardCSS += "    background-color: #fff;";
    dashboardCSS += "    background-clip: border-box;";
    dashboardCSS += "    border: 1px solid #eee;";
    dashboardCSS += "    border-radius: .25rem;";
    dashboardCSS += "    border: 0;";
    dashboardCSS += "    margin-bottom: 30px;";
    dashboardCSS += "    margin-top: 30px;";
    dashboardCSS += "    border-radius: 6px;";
    dashboardCSS += "    color: #333;";
    dashboardCSS += "    background: #fff;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);";
    dashboardCSS += "    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .14);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-body {";
    dashboardCSS += "    flex: 1 1 auto;";
    dashboardCSS += "    padding: 1.25rem;";
    dashboardCSS += "    padding: .9375rem 1.875rem;";
    dashboardCSS += "    padding: .9375rem 20px;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-title {";
    dashboardCSS += "    margin-bottom: .75rem;";
    dashboardCSS += "    color: #3c4858;";
    dashboardCSS += "    text-decoration: none;";
    dashboardCSS += "    margin-top: .625rem;";
    dashboardCSS += "    margin-top: 0;";
    dashboardCSS += "    margin-bottom: 3px;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-header {";
    dashboardCSS += "    padding: .75rem 1.25rem;";
    dashboardCSS += "    margin-bottom: 0;";
    dashboardCSS += "    background-color: #fff;";
    dashboardCSS += "    border-bottom: 1px solid #eee;";
    dashboardCSS += "    border-bottom: none;";
    dashboardCSS += "    background: transparent;";
    dashboardCSS += "    z-index: 3 !important;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-header:first-child {";
    dashboardCSS += "    border-radius: calc(.25rem - 1px) calc(.25rem - 1px) 0 0;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header .dashcard-title {";
    dashboardCSS += "    margin-bottom: 3px;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard [class*=dashcard-header-] {";
    dashboardCSS += "    margin: 0 15px;";
    dashboardCSS += "    padding: 0;";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard [class*=dashcard-header-]:not(.dashcard-header-icon):not(.dashcard-header-text):not(.dashcard-header-image) {";
    dashboardCSS += "    border-radius: 3px;";
    dashboardCSS += "    margin-top: -20px;";
    dashboardCSS += "    padding: 15px;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-danger:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(60deg, #d43f3a, #d43f3a);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(244, 67, 54, .4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-warning:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(60deg, #f79523, #f79523);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(187, 113, 16, 0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-success:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(60deg, #3ba94e, #3ba94e);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(55, 119, 26, 0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard .dashcard-header-primary:not(.dashcard-header-icon):not(.dashcard-header-text) {";
    dashboardCSS += "    background: linear-gradient(82.59deg, #00897B 0%, #00897B 100%);";
    dashboardCSS += "    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, .14), 0 7px 10px -5px rgba(39, 30, 126, 0.4);";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard [class*=dashcard-header-],";
    dashboardCSS += ".dashcard [class*=dashcard-header-] .dashcard-title {";
    dashboardCSS += "    color: #fff;";
    dashboardCSS += "}";

    dashboardCSS += ".box a {";
    dashboardCSS += "    color: #033076;";
    dashboardCSS += "    text-decoration: none;";
    dashboardCSS += "}";

    dashboardCSS += ".box a:hover {";
    dashboardCSS += "    color: white;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-fact-container {";
    dashboardCSS += "    border-radius: 17px;";
    dashboardCSS += "    box-shadow: 0 0 2px 2px #dbdbdb;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-fact-header {";
    dashboardCSS += "    background: linear-gradient(to right, #033076, #033076);";
    dashboardCSS += "    color: white;";
    dashboardCSS += "    padding: 10px;";
    dashboardCSS += "    border-top-left-radius: 17px;";
    dashboardCSS += "    border-top-right-radius: 17px;";
    dashboardCSS += "}";

    dashboardCSS += ".dashcard-fact-content {";
    dashboardCSS += "    padding: 20px;";
    dashboardCSS += "}";

    dashboardCSS += ".chart-container {";
    dashboardCSS += "    position: relative;";
    dashboardCSS += "    height: 100vh;";
    dashboardCSS += "    overflow: hidden;";
    dashboardCSS += "}";

    // Novos estilos adicionados
    dashboardCSS += ".stats-card-container {";
    dashboardCSS += "    display: grid;";
    dashboardCSS += "    grid-template-columns: 1fr;";
    dashboardCSS += "    gap: 10px;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card {";
    dashboardCSS += "    background-color: #efefef;";
    dashboardCSS += "    padding: 15px;";
    dashboardCSS += "    border-radius: 5px;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card-grid {";
    dashboardCSS += "    display: grid;";
    dashboardCSS += "    grid-template-columns: 1fr;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card-chart {";
    dashboardCSS += "    height: 300px;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card-value-container {";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    gap: 2px;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card-value {";
    dashboardCSS += "    color: #999999;";
    dashboardCSS += "}";

    dashboardCSS += ".stats-card-label {";
    dashboardCSS += "    font-size: 0.9em;";
    dashboardCSS += "    font-weight: bold;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-item {";
    dashboardCSS += "    background: #FFF;";
    dashboardCSS += "    -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    -moz-box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    box-shadow: 0 4px 8px rgba(0, 0, 0, .08);";
    dashboardCSS += "    border-radius: 12px;";
    dashboardCSS += "    padding: 30px;";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "    overflow-x: auto;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-item.snapshot {";
    dashboardCSS += "    padding: 20px;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-item h1 {";
    dashboardCSS += "    font-size: 1.2em;";
    dashboardCSS += "    font-weight: bold;";
    dashboardCSS += "    margin-bottom: 15px;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-charts {";
    dashboardCSS += "    display: flex;";
    dashboardCSS += "    flex-direction: column;";
    dashboardCSS += "    gap: 20px;";
    dashboardCSS += "    justify-content: space-between;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-table {";
    dashboardCSS += "    font-size: 0.9em;";
    dashboardCSS += "    overflow-x: auto;";
    dashboardCSS += "    max-height: 400px;";
    dashboardCSS += "}";

    dashboardCSS += ".m-dash-table table {";
    dashboardCSS += "    width: 100%;";
    dashboardCSS += "}";

    dashboardCSS += "@media screen and (min-width: 768px) {";
    dashboardCSS += "    .stats-card-container {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr;";
    dashboardCSS += "        gap: 20px;";
    dashboardCSS += "    }";
    dashboardCSS += "    .stats-card-grid {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr;";
    dashboardCSS += "    }";
    dashboardCSS += "}";

    dashboardCSS += "@media screen and (min-width: 1024px) {";
    dashboardCSS += "    .m-dash-body {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-data-headers {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-filter {";
    dashboardCSS += "        min-width: 275px;";
    dashboardCSS += "        max-width: 275px;";
    dashboardCSS += "    }";
    dashboardCSS += "    .m-dash-charts {";
    dashboardCSS += "        flex-direction: row;";
    dashboardCSS += "    }";
    dashboardCSS += "    .stats-card-container {";
    dashboardCSS += "        grid-template-columns: 1fr 1fr 1fr 1fr;";
    dashboardCSS += "        gap: 30px;";
    dashboardCSS += "    }";
    dashboardCSS += "}";

    styles.push(dashboardCSS);
}







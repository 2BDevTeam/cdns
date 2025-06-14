
var GDefaultConfig;
var GRenderData = {};
var GReportConfig = new ReportConfig({});
var GRenderedData;
var GTableData = new TableHtml({})
var GRows = []
var GRenderedColunas = [new RenderedColuna({})]
var GRenderedLinhas = [new RenderedLinha({})]

var GContainerToRender = "#campos > .row:last"
GRenderedLinhas = []
GRenderedColunas = []
var GBatchSize = 30;
var GCurrentIndex = 0;
var GTotalData = 0;
var GCellObjectsConfig = [new CellObjectConfig({ cellid: "DEFAULTCELL" })];
var GCellObjectsConfig = [];
var TMPCellObjectCOnfig = []
var GTmpListTableObject = [];
var relatoriosNotReadonly = []
var db
var GDB
var GNewRecords = [];

function ColumnHtml(data) {
    this.style = data.style || "";
    this.colId = data.colId || "";
    this.classes = data.classes || "";
    this.content = data.content || "";
    this.customData = data.customData || "";
    // this.cellObjectConfig = new CellObjectConfig(data.cellObjectConfig ? data.cellObjectConfig : {});
}



function HeaderHtml(data) {
    this.rows = Array.isArray(data.rows) ? Array.from(data.rows.map(mapRowHtml)) : [];
}

function BodyHtml(data) {
    this.customData = data.customData || "";
    this.rows = Array.isArray(data.rows) ? Array.from(data.rows.map(mapColumnHtml)) : [];
}

function TableHtml(data) {
    this.tableId = data.tableId || "";
    this.lazyLoad = data.lazyLoad || false;
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.header = new HeaderHtml(data.header || {});
    this.body = new BodyHtml(data.body || {});
}


function CachedUI(data) {
    this.renderedHtml = data.renderedHtml || "";
    this.GDefaultConfig = data.GDefaultConfig || {};
    this.GReportConfig = data.GReportConfig || {};
    this.GRenderedData = data.GRenderedData || {};
    this.GRenderData = data.GRenderData || {};
    this.GTableData = data.GTableData || {};
    this.GRenderedLinhas = data.GRenderedLinhas || [];
    this.GRenderedColunas = data.GRenderedColunas || [];
    this.GCellObjectsConfig = data.GCellObjectsConfig || [];
    this.GTmpListTableObject = data.GTmpListTableObject || [];
    this.TMPCellObjectCOnfig = data.TMPCellObjectCOnfig || [];
}


CachedUI.prototype.toJson = function () {
    return Flatted.parse(Flatted.stringify(this));

}


CachedUI.prototype.syncOnDb = function () {
    var thisCachedUI = this;
    /*
    
        console.log("thisCachedUI",thisCachedUI)
        navigator.locks.request("SyncOnDbLock", function (lock) {
    
            GDB["UI"].clear().then(function () {
                console.log("Todos os itens na tabela 'UI' foram removidos.");
    
                GDB["UI"].bulkAdd([thisCachedUI.toJson()]).then(function () {
                    console.log("GDB sync complete");
                }).catch(function (err) {
                    console.error("Error syncing GDB:", err);
                });
            }).catch(function (err) {
                console.error("Error clearing table 'UI':", err);
            });
        });
    */
}


CachedUI.prototype.renderTable = function () {

    $(".sourceTabletableContainer").empty();
    $("#campos > .row:last").after("<div id='sourceTabletableContainer' style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'></div>")
    var container = $(".sourceTabletableContainer");
    container.append(this.renderedHtml);
}

CachedUI.prototype.fillAndRender = function () {

    var thisCachedUI = this;
    GRenderedLinhas = thisCachedUI.GRenderedLinhas;
    GTableData = new TableHtml(thisCachedUI.GTableData);
    GDefaultConfig = thisCachedUI.GDefaultConfig;
    GReportConfig = thisCachedUI.GReportConfig;
    GRenderedData = thisCachedUI.GRenderedData;
    GRenderData = thisCachedUI.GRenderData;
    GRenderedColunas = thisCachedUI.GRenderedColunas.map(function (coluna) {

        coluna = new RenderedColuna(coluna);
        return coluna;
    });

    GCellObjectsConfig = thisCachedUI.GCellObjectsConfig.map(function (cellObject) {

        cellObject = new CellObjectConfig(cellObject);
        return cellObject;
    });

    GTmpListTableObject = thisCachedUI.GTmpListTableObject;
    TMPCellObjectCOnfig = thisCachedUI.TMPCellObjectCOnfig;
    // this.renderTable();
}

function MrendObject(data) {

    this.cellId = data.cellId || "";
    this.coluna = data.coluna || "";
    this.rowid = data.rowid || "";
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
    this.sourceKeyValue = data.sourceKeyValue || "";
    this.valor = data.valor || "";
    this.campo = data.campo || "";
    this.linkId = data.linkId || "";
    this.linkfield = data.linkfield || "";
    this.codigolinha = data.codigolinha || "";
    this.ordemField = data.ordemField || "";
    this.ordem = data.ordem || 0;

}

function getCampoMrend() {

    return "campo"
}


function getMrendSchema(tableSourceName) {

    var schema = new MrendObject({});

    return { datasourceName: "MrendDb", tableSourceName: tableSourceName, tableSourceSchema: schema }

}

function RowHtml(data) {
    this.style = data.style || "";
    this.rowId = data.rowId || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.cols = Array.isArray(data.cols) ? Array.from(data.cols.map(mapColumnHtml)) : [];
}

RowHtml.prototype.generateHtml = function () {




    return generateRowAbove(this)

}

function applyCodeToSingularRow(row) {
    var elementsDate = row.querySelectorAll('input[data-type="date"]');

    // Aplicar Cleave para cada input de data
    Array.from(elementsDate).forEach(function (element) {
        var cleave = new Cleave(element, {
            date: true,
            delimiter: ".",
            datePattern: ['d', 'm', 'Y']
        });
    });

    var elements = row.querySelectorAll('input[data-type="digit"]');

    // Aplicar Cleave para cada input de dígito


    row.querySelectorAll("input").forEach(function (input) {
        $(input).css("text-align", "right");
    });
    row.querySelectorAll("select").forEach(function (select) {
        $(select).css("text-align", "right");
    });
}

function initSelectForRow(rowElement, changeStyle) {
    // Inicializa apenas os selects dentro da linha especificada
    $(rowElement).find('select').each(function () {
        $(this).select2({
            width: "100%",
            allowClear: false
        });
    });

    /*if (changeStyle) {
        $(rowElement).find('.select2-selection.select2-selection--single, input[type=text], input[type=number]').css({
            'background-color': '#ffffff',
            'border-radius': 'var(--border-radius-input)',
            'border-bottom': '0'
        });
    }*/
}

function modoEcraHandlerByRow(rowElement) {
    if ($("#mainPage").data("state") == "consultar") {
        var target = rowElement ? $(rowElement) : $('.sourced-table');

        target.find('*').prop('disabled', true);
        target.find('select').prop('disabled', true);

        // Só esconde as zonas de ação se for global (sem linha específica)
        if (!rowElement) {
        }
        $(".source-table-options").hide();
        $(".action-zone button").hide();
    }
}

TableHtml.prototype.lazyLoadRendering = function () {

    var tableStructure = generateTableStructure(this);
    $(".sourceTabletableContainer").append(tableStructure);
    var spinner = "";
    spinner += "<div id='lazyLoaderSpinner' class='overlay'>"
    spinner += "    <div class='spinner'></div>"
    spinner += "    </div>"
    spinner += "</div>"
    $(".sourceTabletableContainer").append(spinner);
    this.freezyHeaders();


    var digitInputData = {
        type: "text",
        value: "",
        label: "Filtro",
        classes: "form-control  input-sm table-input-col ",
        style: "",
        customData: " id='filtro' ",
        placeholder: ""
    };
    var filtroInput = generateInput(digitInputData);

    $("#" + GTableData.tableId).before("<div class='col-md-12 pull-left' style='margin-bottom:0.5em'>" + filtroInput + "</div>")



    var targetNode = document.body; // ou use um container mais específico

    // Configuração do observer para escutar adições de nós filhos
    var config = { childList: true, subtree: true };

    // Função callback executada quando uma mutação ocorre
    var callback = function (mutationsList, observer) {
        mutationsList.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1 && node.classList.contains('Singular-row')) {

                        //console.log('Nova linha adicionada:', node);
                        applyCodeToSingularRow(node);
                        initSelectForRow(node, true); // Inicializa os selects na nova linha
                        modoEcraHandlerByRow(node);

                        // Aqui você pode executar qualquer lógica extra com a linha
                    }
                });
            }
        })
    };
    var observer = new MutationObserver(callback);
    observer.observe(targetNode, config);



    var rows = [];

    GTableData.body.rows.forEach(function (row) {

        var rowHtml = generateRowAbove(row)
        GRows.push(rowHtml);

        rows.push({ rowId: row.rowId, rowHtml: rowHtml })

    })


    var clusterize = new Clusterize({
        scrollId: 'sourceTabletableContainer',
        contentId: 'table-body',
        rows: GRows,
        batchSize: 10,
        scrollTimeout: 0,
        rows_in_block: 10,
        blocks_in_cluster: 4,
        callbacks: {
            clusterWillChange: function () {

                $("#lazyLoaderSpinner").show();
            },
            clusterChanged: function () {
                $("#lazyLoaderSpinner").hide()
            },
            scrollingProgress: function (progress) {
                //  $("#lazyLoaderSpinner").show();
            },
        }
    });


    var rowHtmlMap = new Map();
    rows.forEach(function (rowHtmlObj) {
        rowHtmlMap.set(rowHtmlObj.rowId, rowHtmlObj.rowHtml);
    });


    function applyFilter(keyword) {
        var lowerKeyword = keyword.toLowerCase();

        var filteredConfigCells = GCellObjectsConfig.filter(function (cell) {
            var valorMatch = cell.valor && cell.valor.toString().toLowerCase().includes(lowerKeyword);

            var outrosMatch = Array.isArray(cell.outrosValores) &&
                cell.outrosValores.some(function (val) {
                    return val && val.toString().toLowerCase().includes(lowerKeyword);
                });

            return valorMatch || outrosMatch;
        });

        var distinctRowIds = new Set();
        filteredConfigCells.forEach(function (cell) {
            distinctRowIds.add(cell.rowid);
        });

        var rowsFilter = [];
        distinctRowIds.forEach(function (rowid) {
            var rowHtml = rowHtmlMap.get(rowid);
            if (rowHtml) {
                rowsFilter.push(rowHtml);
            }
        });

        clusterize.update(rowsFilter);
    }

    function debounce(func, delay) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, delay);
        };
    }


    $("#filtro").on("input", debounce(function () {
        var keyword = $(this).val();
        applyFilter(keyword);
    }, 500));



}

TableHtml.prototype.loadMoreRows = function () {

    var $tbody = $("#" + this.tableId + " tbody");
    if ($tbody.length === 0 || !this.body || !this.body.rows) {
        console.warn("Corpo da tabela não encontrado ou dados ausentes.");
        return GCurrentIndex;
    }

    GTotalData = this.body.rows.length;

    for (var i = 0; i < GBatchSize && GCurrentIndex < GTotalData; i++, GCurrentIndex++) {
        var row = this.body.rows[GCurrentIndex];
        var html = generateRowAbove(row);
        $tbody.append(html);
    }

    return GCurrentIndex;


}





function initAllSelects() {

    GCellObjectsConfig.filter(function (cellObject) {
        return cellObject.dataType == "table"
    }).map(function (cellObjectMp) {

        var selectElement = $("#" + cellObjectMp.cellid);
        if (selectElement.length > 0) {

            var colConfig = cellObjectMp.getColunaConfig();

            cellObjectMp.setSelectedValue();

            selectElement.select2({
                width: "100%",
                placeholder: 'Procurar...',
                allowClear: false,
                minimumInputLength: 0,  // Permite abrir sem digitar nada
                ajax: {
                    transport: function (params, success, failure) {
                        var termo = params.data.term || '';
                        var pagina = params.data.page || 1;

                        var resultado = cellObjectMp.findLocalColData(termo, pagina, 200);


                        success({
                            results: resultado.resultados,
                            pagination: { more: resultado.temMais }
                        });
                    },
                    processResults: function (data) {
                        return data;
                    },
                    delay: 250,
                    cache: true
                }
            });
            // selectElement.val(cellObjectMp.valor).trigger('change');

        }


    })

}
TableHtml.prototype.handleUI = function (options) {

    var thisTable = this;

    initSelect(".table-select", true);
    initAllSelects()

    if (!this.lazyLoad) {
        thisTable.freezyHeaders();
        thisTable.freezyTotalRow();
    }

    formatAllTablesDigitInputsMrend();
    generateToolTipsForSourcedTable();






    if (!options.notRefreshTree) {
        var totalParents = GRenderedLinhas.filter(function (linha) {
            return linha.isParent == true

        });

        if (totalParents) {

            initTreeForTable('#' + thisTable.tableId);
        }
    }

    this.setReactive();




}

function getCell(rowid, codigocoluna) {
    return GCellObjectsConfig.find(function (cell) {
        return cell.rowid == rowid && cell.codigocoluna == codigocoluna;
    });
}


function formatToCleaveInput(value) {



}

TableHtml.prototype.setReactive = function () {


    var state = PetiteVue.reactive({
        GRenderedLinhas: GRenderedLinhas,
        GRenderedColunas: GRenderedColunas,
        GCellObjectsConfig: GCellObjectsConfig,

        getCell: function (rowid, codigocoluna) {

            return this.GCellObjectsConfig.find(function (cell) {
                return cell.rowid == rowid && cell.codigocoluna == codigocoluna;
            });
        },
        extractCellValue: function (expression, rowid) {

            var regex = /\{([^}]+)\}/g; // Encontra tudo entre { e }
            var match;
            var orgExpr = expression;

            while ((match = regex.exec(expression)) !== null) {
                var colName = match[1];

                var celulaData = this.GCellObjectsConfig.find(function (obj) {
                    return obj.codigocoluna == colName && obj.rowid == rowid;
                });

                var valor = celulaData.getValueOrDefault()

                // Substituição manual para manter compatibilidade com ES5
                var token = "{" + colName + "}";
                while (orgExpr.indexOf(token) !== -1) {
                    orgExpr = orgExpr.replace(token, valor);
                }
            }

            return orgExpr;
        },

        executeColFunc: function (expression, rowid, codigocoluna) {

            try {
                var self = this;

                var cell = self.getCell(rowid, codigocoluna);

                var exprFinal = this.extractCellValue(expression, rowid);

                var exprResult = eval(exprFinal);
                cell.valor = exprResult;


                return handleUIValue(cell, exprResult);;
            } catch (e) {
                console.warn("warn", e)
                //console.error("Erro ao avaliar expressão:", e);
                return exprFinal;
            }
        },
        applyFormatter: function ($el, rowid, codigocoluna) {
            try {
                var cleaveNumeral = new Cleave($el, {
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand',
                    numeralDecimalScale: 2,
                    numeralDecimalMark: '.',
                    // numeralPositiveOnly: !configData.proibenegativo,
                    delimiter: ' '
                });
                //  return handleUIValue(cell, exprResult);
            } catch (e) {
                console.warn("warn", e)
                //console.error("Erro ao avaliar expressão:", e);
                return exprFinal;
            }
        }
    })

    Object.assign(state, GRenderData.scopeFunctions);
    window.appState = state;
    PetiteVue.createApp(state).mount('#sourceTabletableContainer');





}



TableHtml.prototype.generateTableButtons = function () {

    if (getState() == "consultar") {

        return
    }
    if (GReportConfig.relatorio.adicionalinha) {

        var thisTable = this;
        var tableButtons = $("<div id='tableButtons' class='col-md-12 pull-left tableButtons'></div>");
        $("#" + this.tableId).after(tableButtons);

        GReportConfig.relatorio.modelos.forEach(function (modelo) {


            var botaoId = "btnAdd" + modelo;
            var configuracaoLinha = GReportConfig.linhas.find(function (linha) {
                return linha.codigo == modelo

            });
            var descbtnModelo = "Adiciona linha";

            if (configuracaoLinha) {
                descbtnModelo = configuracaoLinha.descbtnModelo || "Adiciona linha";
            }
            var botaoAdLinha = {
                style: "margin-left:0.4em",
                buttonId: botaoId,
                classes: "btn btn-primary btn-sm",
                customData: " type='button' data-modelo='" + modelo + "' data-tooltip='true' data-original-title='" + descbtnModelo + "' ",
                label: descbtnModelo + " <span style='color:white;'  class='glyphicon glyphicon-plus'></span>",
                onClick: "",
            };

            var buttonHtml = generateButton(botaoAdLinha);

            $("#tableButtons").append(buttonHtml);
            $("#" + botaoId).on("click", function () {

                thisTable.addLinhaByModelo(modelo);
            });

            ///console.log("Confirma adicao da linha", $("#" + this.tableId))


        })




    }


}


TableHtml.prototype.addLinhaByModelo = function (modelo) {

    var linhaModelo = GReportConfig.linhas.find(function (linha) {

        return linha.codigo == modelo
    });

    console.log("linhaModelo", linhaModelo)

    if (linhaModelo) {


        var renderedLinha = new RenderedLinha({ novoregisto: true, rowid: generateUUID(), linkid: "", parentid: "", config: linhaModelo })
        renderedLinha.addToLocalRenderedLinhasList([], "", {}, false);

        var linha = new RowHtml(setLinha(renderedLinha, "", []));
        var linhaHtml = linha.generateHtml();

        $("#" + this.tableId).append(linhaHtml)
    }

    addNewRecords()
    this.handleUI({ notRefreshTree: true });

}

TableHtml.prototype.addLinhasByLazyLoad = function (modelo) {

    /* for (var i = 0; i < batchSize && currentIndex < totalData; i++, currentIndex++) {
 
         
 
 
     }*/


}

TableHtml.prototype.calcularTotalRelatorio = function () {

    var linhaTotalRelatorio = getLinhaById("TOTALRELATORIOROWID");

    if (linhaTotalRelatorio) {

        var celulasLinhaTotalRelatorio = linhaTotalRelatorio.getLinhaCellObjects()
    }



    GRenderedColunas.forEach(function (coluna) {


        if (coluna.config.tipo == "digit") {

            var totalColuna = getTotalCelulasByFiltro("cellObject.dataType == 'digit' && cellObject.codigocoluna=='" + coluna.codigocoluna + "' && cellObject.rowid!='" + linhaTotalRelatorio.rowid + "' && cellObject.unionkey!='TOTALRELATORIOROWID' && cellObject.unionkey.includes('SUBTOTAL')==false")

            var colunaTotalRelatorio = celulasLinhaTotalRelatorio.find(function (celulaLinhaRelatorio) {

                return celulaLinhaRelatorio.codigocoluna == coluna.codigocoluna
            });

            if (colunaTotalRelatorio) {
                colunaTotalRelatorio.setValue(totalColuna, false)
            }
        }



    })


}


TableHtml.prototype.freezyHeaders = function () {

    $('.sourceTabletableContainer').css({
        'max-height': '450px',
        'overflow-y': 'auto',
        'width': '100%'
    });



    // Apply styles to table header cells (thead th)
    $('thead th').css({
        'position': 'sticky',
        'top': '0',
        //"background-color": "#033076",

        'z-index': '10000000000000000'
    });




}

TableHtml.prototype.freezyTotalRow = function () {


    $('#TOTALRELATORIOROWID').css({
        'position': 'sticky',
        'bottom': '0',
        'background-color': '#033076',
        'z-index': '10000000000000000'
    });



}

// Funções nomeadas para mapeamento
function mapColumnHtml(col) {
    return new ColumnHtml(col);
}

function mapRowHtml(row) {
    return new RowHtml(row);
}


function BindData(data) {

    this.sourceKey = data.sourceKey || "";
    this.sourceBind = data.sourceBind || "";
    this.extras = Array.isArray(data.extras) ? Array.from(data.extras.map(mapExtra)) : [new ExtraBindData({})];
}


function ExtraBindData(data) {

    this.sourceRef = data.sourceRef || "";
    this.selector = data.selector || "";
    this.sourceBind = data.sourceBind || "";
}


function Linha(data) {

    this.linhastamp = data.linhastamp || "";
    this.linkstamp = data.linkstamp || "";
    this.parentstamp = data.parentstamp || "";
    this.temcolunas = data.temcolunas || false;
    this.addfilho = data.addfilho || false;
    this.modelo = data.modelo || false;
    this.tipo = data.tipo || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.origem = data.origem || "";
    this.descbtnModelo = data.descbtnModelo || "";
    this.expressao = data.expressao || "";
    this.campovalid = data.campovalid || "";
    this.sinalnegativo = data.sinalnegativo || false;
    this.temtotais = data.temtotais || false;
    this.totkey = data.totkey || "";
    this.totfield = data.totfield || "";
    this.condicaovalidacao = data.condicaovalidacao || "";
    this.categoria = data.categoria || "";
    this.codcategoria = data.codcategoria || "";
    this.ordem = data.ordem || 0;
    this.usafnpren = data.usafnpren || false;
    this.fnpren = data.fnpren || "";
    this.tipolistagem = data.tipolistagem || "table";
    this.objectolist = data.objectolist || "";
    this.executachange = data.executachange || false;
    this.expressaochangejs = data.expressaochangejs || "";
    this.cor = data.cor || "";
    this.explist = data.explist || "";
    this.defselect = data.defselect || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.executachangesubgrupo = data.executachangesubgrupo || false;
    this.expressaochangejssubgrupo = data.expressaochangejssubgrupo || "";
    this.bindData = new BindData(data.bindData ? data.bindData : {});

}

function Coluna(data) {

    this.colunastamp = data.colunastamp || "";
    this.relatoriostamp = data.relatoriostamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.desccoluna = data.desccoluna || "";
    this.campo = data.campo || "";
    this.tipo = data.tipo || "";
    this.atributo = data.atributo || "";
    this.campovalid = data.campovalid || "";
    this.condicaovalidacao = data.condicaovalidacao || "";
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
    this.validacoluna = data.validacoluna || false;
    this.expresscolfun = data.expresscolfun || "";
    this.colfunc = data.colfunc || false;
    this.ordem = data.ordem || 0;
    this.expressaotbjs = data.expressaotbjs || "";
    this.usaexpresstbjs = data.usaexpresstbjs || false;
    this.usaexpressrubdesc = data.usaexpressrubdesc || false;
    this.expressaojsrubdesc = data.expressaojsrubdesc || "";
    this.nometb = data.nometb || "";
    this.valtb = data.valtb || "";
    this.categoria = data.categoria || "default";
    // this.expressaodb = data.expressaodb || "";
    this.expressaojsevento = data.expressaojsevento || "";
    this.executaeventochange = data.executaeventochange || false;
    this.inactivo = data.inactivo || false;
    this.decimais = data.decimais || 2;
    this.proibenegativo = data.proibenegativo || false;
    this.regra = data.regra || "";
    this.fixacoluna = data.fixacoluna || false;
    this.bindData = new BindData(data.bindData ? data.bindData : {})
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {})

}


function buildColRefs(expressao) {
    var regex = /<([^>]+)>/g; // Find all values between angle brackets
    var match;
    var refs = []

    while ((match = regex.exec(expressao)) !== null) {
        var extracted = match[1];


        refs.push(extracted)

    }

    return refs
}



function FXData(data) {
    this.tipo = data.tipo || "";
    this.activo = data.activo || false;
    this.expressao = data.expressao || ""
    this.colrefs = Array.isArray(data.colrefs) ? Array.from(data.colrefs) : []
}
Coluna.prototype.setFxData = function () {

    if (this.colfunc) {

        var fxData = {
            tipo: "coluna",
            activo: true,
            expressao: this.expresscolfun,
            colrefs: buildColRefs(this.expresscolfun)
        }

        this.fxdata = new FXData(fxData);
        return

    }

    this.fxdata = new FXData({})

}

function Celula(data) {
    this.linhastamp = data.linhastamp || "";
    this.celulastamp = data.celulastamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.sinalnegativo = data.sinalnegativo || null;
    this.inactivo = data.inactivo || false;
    this.desabilitado = data.desabilitado || false;
    this.usafnpren = data.usafnpren || false;
    this.atributo = data.atributo || null;
    this.fnpren = data.fnpren || "";
    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.fx = data.fx || "";
    this.temfx = data.temfx || false;
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {})
}


Celula.prototype.getTotalColuna = function (filtro) {

    var totalColuna = 0;
    totalColuna = getTotalCelulasByFiltro("cellObject.dataType == 'digit' && " + filtro)
    return totalColuna;
}





function isExpression(input) {
    try {
        // Tenta criar uma função que retorna a expressão
        new Function('return ' + input)();
        return true; // Se criou a função, é uma expressão válida
    }
    catch (err) {
        return false; // Se deu erro, não é uma expressão válida
    }
}

function evaluateExpression(expression) {

    try {

        var isExpressionResult = isExpression(expression)

        if (isExpressionResult) {


            return new Function('return ' + expression)();

        }

        return expression
    } catch (error) {

    }
}

function CellObjectConfig(data) {
    var _valor = isStringEmpty(data.valor) || isUndefinedOrNull(data.valor) || data.valor == 0 ? null : data.valor;

    this.readonly = data.readonly || false;
    this.atributo = data.atributo || "";
    this.campo = data.campo || "";
    this.fxData = data.fxData || ""
    this.customClasses = data.customClasses || ""
    this.customStyles = data.customStyles || ""
    this.dataType = data.dataType;
    this.tipolistagem = data.tipolistagem || "";
    this.performancelist = data.performancelist || true;
    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.campovalor = data.campovalor || "";
    this.campooption = data.campooption || ""
    this.novoregisto = data.novoregisto || false;
    this.proibenegativo = data.proibenegativo || null;
    this.outrosValores = Array.isArray(data.outrosValores) ? Array.from(data.outrosValores) : [];
    this.renderedColuna = new RenderedColuna(data.renderedColuna ? data.renderedColuna : {});
    this.component = data.component || ""
    this.componentcategoria = data.componentcategoria || ""
    this.usaexpresstbjs = data.usaexpresstbjs || false;
    this.expressaotbjs = data.expressaotbjs || ""
    this.expressao = data.expressao || false;
    this.renderelinha = new RenderedLinha(data.renderelinha ? data.renderelinha : {})
    this.celula = new Celula(data.celula ? data.celula : {})
    this.funcaolistagem = typeof data.funcaolistagem === "function" ? data.funcaolistagem : function () { };
    this.rowid = data.rowid || null;
    this.linkid = data.linkid || null;
    this.codigocoluna = data.codigocoluna || null;
    this.parentid = data.parentid || null;
    this.cellid = data.cellid || "";
    this.categoria = data.categoria || "default"
    this.unionkey = data.rowid;
    this.jsonStringData = JSON.stringify(data);
    this.changedb = data.changedb || false;
    this.events = Array.isArray(data.events) ? Array.from(data.events) : [];
    this._valorChanged = false;

    var selfObject = this;

    Object.defineProperty(this, "valor", {
        get: function () {
            return _valor;
        },
        set: function (newValue) {

            var formattedValue = handleDataType(this.dataType, newValue);

            if (_valor !== formattedValue) {
                this._valorChanged = true;

                var self = this;

                syncChangesToDB(this, handleDataTypeDB(this.dataType, newValue)).then(function () {
                    try {

                    } catch (error) {
                        console.log("Error focusing next input:", error);
                    }

                });


            }
            _valor = formattedValue;


        },
        enumerable: true,
        configurable: true
    });

    this.valor = _valor;

}





function syncChangesToDB(cellObject, valor) {

    if (cellObject.changedb == false) {
        console.log("syncChangesToDB - changedb is false, skipping DB update");
        return
    }
    var htmlComponent = getCellHtmlComponent(cellObject.cellid);
    var varlorF = valor == "Infinity" || valor == "-Infinity" || valor == Infinity ? 0 : valor;

   
    var buildChangeResult = buildChangedObjectUpdateData(htmlComponent, cellObject, varlorF);

    var table = GRenderData.tableSourceName;



    return updateCellOnDB(buildChangeResult, table).then(function (updateResult) {


    }).catch(function (err) {
        console.log("ERR", err)
    })


}

function getCellHtmlComponent(cellid) {

    return $("#" + cellid);

}

CellObjectConfig.prototype.setSelectedValue = function () {

    var configColuna = this.getColunaConfig();
    var localData = configColuna.localData;

    var valorExistente = this.valor ? this.valor.toString() : "";
    var filtroValorExistente = localData.filter(function (item) {
        return item[configColuna.config.valtb] == valorExistente;
    });
    if (filtroValorExistente.length > 0) {
        var option = "<option value='" + filtroValorExistente[0][configColuna.config.valtb] + "' selected>" + filtroValorExistente[0][configColuna.config.nometb] + "</option>";
        $("#" + this.cellid).append(option);
    }

}

CellObjectConfig.prototype.findLocalColData = function (termo, pagina, tamanhoPagina) {

    tamanhoPagina = tamanhoPagina || 20;

    var termoLower = termo.toLowerCase();

    var configColuna = this.getColunaConfig();

    var localData = configColuna.localData;



    var resultadosFiltrados = termoLower
        ? localData.filter(function (item) { return item[configColuna.config.nometb].toLowerCase().includes(termoLower); })
        : localData;

    var inicio = (pagina - 1) * tamanhoPagina;
    var fim = inicio + tamanhoPagina;



    var paginaAtual = resultadosFiltrados.slice(inicio, fim);

    return {
        resultados: paginaAtual.map(function (item) {
            return {
                id: item[configColuna.config.valtb],
                text: item[configColuna.config.nometb],
            };
        }),
        temMais: fim < resultadosFiltrados.length
    };
}

CellObjectConfig.prototype.getHtmlValueOrText = function (isText) {

    var htmlComponent = $("#" + this.cellid);


    if (htmlComponent.val()) {
        switch (this.dataType) {
            case "digit":
                return htmlComponent.val()
            case "text":
                return htmlComponent.val()
            case "date":
                return htmlComponent.val()
            case "table":
                return isText ? htmlComponent.find("option:selected").text() : htmlComponent.val();
            default:
                return ""

        }
    }

    return ""

}

CellObjectConfig.prototype.fillTableData = function () {

    var codColuna = this.codigocoluna
    var dadosColuna = GRenderedColunas.find(function (coluna) {
        return coluna.codigocoluna == codColuna
    });

    if (this.tipolistagem == "EXPR") {
        eval(this.expressao)
        return
    }

    if (this.tipolistagem == "PROPREG") {

        var tmpcomponentcategoria = this.componentcategoria
        var linhaTipoFiltered = GReportConfig.linhas.filter(function (linhaGrupo) {

            return linhaGrupo.tipo == tmpcomponentcategoria
        });
        GTmpListTableObject = linhaTipoFiltered
        return
    }




    if (dadosColuna.config.usaexpresstbjs) {
        eval(dadosColuna.config.expressaotbjs)
    }
    return


};

CellObjectConfig.prototype.getColunaConfig = function () {

    var celulaConfig = this
    return GRenderedColunas.find(function (coluna) {

        return coluna.codigocoluna == celulaConfig.codigocoluna
    })

};


CellObjectConfig.prototype.getCelulaConfig = function () {

    var celulaConfig = this;
    var celulaFound = GReportConfig.celulas.find(function (celula) {

        return celula.linhastamp == celulaConfig.renderelinha.config.linhastamp && celula.codigocoluna == celulaConfig.codigocoluna
    });

    return celulaFound ? new Celula(celulaFound) : new Celula({})

};



CellObjectConfig.prototype.getColsRefered = function () {

    var celulaConfig = this;

    var celula = celulaConfig.getCelulaConfig();
    var coluna = celulaConfig.getColunaConfig();

    return GRenderedColunas.filter(function (colRef) {

        return colRef.config.fxdata.colrefs.filter(function (cRef) { return cRef == coluna.codigocoluna }).length > 0
    });


};



CellObjectConfig.prototype.getCelsRefered = function () {

    var celulaConfig = this;

    var celula = celulaConfig.getCelulaConfig();
    var coluna = celulaConfig.getColunaConfig();

    return []


};

CellObjectConfig.prototype.handleFx = function () {

    var celulaConfig = this;

    var celula = celulaConfig.getCelulaConfig();

    var referedCols = celulaConfig.getColsRefered()

    var referedCels = celulaConfig.getCelsRefered();

    if (referedCels.length > 0) {

        return
    }

    referedCols.forEach(function (refCol) {

        var fxExpression = refCol.setFXExpression("cellObject.rowid=='" + celulaConfig.rowid + "'");

        var expressionResult = eval(fxExpression);

        var celula = getCelulasByFiltro("cellObject.rowid=='" + celulaConfig.rowid + "' && cellObject.codigocoluna=='" + refCol.codigocoluna + "' && cellObject.dataType=='digit'")[0];

        if (celula) {

            celula.setValue(expressionResult, true)
        }

    })




};


function handleDefaultValue(dataType, valor) {
    switch (dataType.trim()) {
        case "digit":
            var inputValTxt = (String(valor) ? String(valor).replaceAll(" ", "").replaceAll(",", "") : "0")

            return inputValTxt;
            return isNaN(inputValTxt) || inputValTxt == null || inputValTxt == undefined || inputValTxt == "" ? 0 : inputValTxt;

        case "text":

            return valor ? valor : "";
        default:
            return valor;
    }
}
CellObjectConfig.prototype.getValueOrDefault = function () {

    return handleDefaultValue(this.dataType, this.valor)

};


function handleFormatInput(value, dataType) {

    switch (dataType) {
        case "digit":

            return formatInputValue(parseFloat(value).toFixed(2))


        default:
            return value;
    }
}


CellObjectConfig.prototype.setValue = function (value, triggerChange) {

    this.valor = value;
    $("#" + this.cellid).val(handleFormatInput(value, this.dataType));


    if (triggerChange) {
        $("#" + this.cellid).trigger("change")
    }
};



function calcularSubtotais() {

    var linhasComTotais = GRenderedLinhas.filter(function (linha) {

        return linha.config.temtotais == true

    });


    linhasComTotais.forEach(function (linhaComTotal) {

        linhaComTotal.actualizarTotaisColunasLinha();

    })


}


CellObjectConfig.prototype.syncReactive = function (htmlComponent) {

    var thisCellObjectConfig = this;

    var valor = handleDataType(thisCellObjectConfig.dataType, htmlComponent.val());
    if (window.appState) {

        var cellObj = window.appState.GCellObjectsConfig.find(function (cell) {
            return cell.cellid == thisCellObjectConfig.cellid;
        });

        if (cellObj) {

            cellObj.valor = valor;
        }
    }

}

CellObjectConfig.prototype.updateOnDB = function (htmlComponent) {


    cellObject.valor = handleDataType(cellObject.dataType, htmlComponent.val());


}

CellObjectConfig.prototype.updateOnDBPassingVal = function (htmlComponent, valor) {
    /*
        var cellObject = this
        if (cellObject.changedb == false) {
    
            return
        }
    
        var buildChangeResult = buildChangedObjectUpdateData(htmlComponent, this, valor);
    
        var table = GRenderData.tableSourceName;
    
    
        return updateCellOnDB(buildChangeResult, table).then(function (updateResult) {
    
            cellObject.valor = handleDataType(cellObject.dataType, htmlComponent.val());
    
            cellObject.handleFx();
            cellObject.executeChangeEvents()
            cellObject.calcularTotalLinha();
            calcularSubtotais();
    
            if (GReportConfig.relatorio.totalrelatorio) {
    
                GTableData.calcularTotalRelatorio();
            }
        }).catch(function (err) {
            console.log("ERR", err)
        })
            */


}



CellObjectConfig.prototype.executeChangeEvents = function (htmlComponent) {

    var cellObject = this
    this.events.forEach(function (event) {

        eval(event)

    })


}

CellObjectConfig.prototype.calcularTotalLinha = function () {

    if (this.dataType != "digit" && GReportConfig.relatorio.totalcoluna) {

        return;
    }

    this.renderelinha.actualizarTotalLinha();


}


CellObjectConfig.prototype.getHtmlComponent = function () {



    return $("#" + this.cellid);



}


CellObjectConfig.prototype.toJsonString = function () {


    return JSON.stringify(this);

}

CellObjectConfig.prototype.toJsonString = function () {


    return JSON.stringify(this);

}



CellObjectConfig.prototype.toJsonString = function () {


    return JSON.stringify(this);

}

CellObjectConfig.prototype.setDefaultValue = function () {

    validateCellObjectConfig(this)
    this.unionkey = this.rowid + "UNION" + this.codigocoluna;
    this.celula = this.getCelulaConfig();
    if (this.tipolistagem == "EXPR" && this.novoregisto) {
        this.valor = evaluateExpression(this.expressao);
        this.valor = handleDefaultValue(this.dataType, this.valor)
        return;
    }
    this.valor = handleDefaultValue(this.dataType, this.valor);
    this.setEvents();
    this.addToLocalCellList();

};

CellObjectConfig.prototype.setEvents = function () {
    var events = [];

    if (this.renderelinha.config.tipo == "Grupo" && this.codigocoluna == "DEFCOL") {

        if (this.renderelinha.config.executachange) {
            this.renderelinha.config.expressaochangejs ? events.push(this.renderelinha.config.expressaochangejs) : null;
            this.renderelinha.config.expressao ? events.push(this.renderelinha.config.expressao) : null;
        }

    }

    if (this.renderelinha.config.tipo == "Subgrupo" && this.codigocoluna == "DEFCOL") {

        if (this.renderelinha.config.executachange) {
            this.renderelinha.config.expressaochangejs ? events.push(this.renderelinha.config.expressaochangejs) : null;
            this.renderelinha.config.expressao ? events.push(this.renderelinha.config.expressao) : null;
        }

        var linkLinha = getLinhaById(this.renderelinha.linkid);

        if (linkLinha) {

            if (linkLinha.config.executachangesubgrupo) {
                linkLinha.config.expressaochangejssubgrupo ? events.push(linkLinha.config.expressaochangejssubgrupo) : null;
            }
        }

    }

    var coluna = getColunaByCodigo(this.codigocoluna);

    if (coluna) {

        coluna.config.executaeventochange == true && coluna.config.expressaojsevento ? events.push(coluna.config.expressaojsevento) : null;

    }


    this.events = events





};



function updateCellOnDB(updtData, tableName) {

    var updateData = new UpdateData(updtData);

    return new Promise(function (resolve, reject) {

        return GDB[tableName]
            .where(updateData.sourceKey)
            .equals(updateData.sourceValue)
            .modify(updateData.changedData).then(function (res) {
                resolve(res)
            }).catch(function (err) {
                reject(err)
            })
    }
    )
}
function validateCellObjectConfig(cellObject) {

    var cellObjectConfig = new CellObjectConfig(cellObject);

    var fieldsToValidate = ["codigocoluna", "rowid", "cellid"];

    var cellKeys = Object.keys(cellObjectConfig);

    cellKeys.forEach(function (cellKey) {

        var fieldToValidate = fieldsToValidate.find(function (fvalidate) {

            return fvalidate == cellKey
        });

        if (fieldToValidate) {

            var fielValue = cellObjectConfig[cellKey];

            if (isStringEmpty(fielValue) || isUndefinedOrNull(fielValue)) {

                throw new Error("O CAMPO " + cellKey + "  DEVE SER DEFINIDO");
            }

        }

    })


}


CellObjectConfig.prototype.showMeAll = function () {

    console.log("Showing All", this)

};

CellObjectConfig.prototype.addToLocalCellList = function () {


    GCellObjectsConfig.unshift(this);

}




function RenderedColuna(data) {
    this.codigocoluna = data.codigocoluna || "";
    this.config = new Coluna(data.config || {});
    this.tipolistagem = data.tipolistagem || "";
    this.preGen = data.preGen || "";
    this.localData = data.localData || [];
}

RenderedColuna.prototype.fillTableData = function () {


    if (this.tipolistagem == "EXPR") {
        eval(this.expressao)
        return
    }

    if (this.tipolistagem == "PROPREG") {

        var tmpcomponentcategoria = this.componentcategoria
        var linhaTipoFiltered = GReportConfig.linhas.filter(function (linhaGrupo) {

            return linhaGrupo.tipo == tmpcomponentcategoria
        });
        GTmpListTableObject = linhaTipoFiltered
        return
    }




    if (this.config.usaexpresstbjs) {
        eval(this.config.expressaotbjs);
    }
    return


};


RenderedColuna.prototype.preGenHtml = function () {

    if (this.config.tipo == "table") {

        this.fillTableData();

        var campooption = this.config.nometb
        var campovalor = this.config.valtb

        var selectHtml = generateSelect([], "form-control source-bind-table-control  table-select", "", " id=" + "[selectId]" + " source-key='" + this.config.bindData.sourceKey + "' source-bind='" + this.config.bindData.sourceBind + "' ", campooption, campovalor)

        this.localData = GTmpListTableObject;
        this.preGen = selectHtml;
    }

}



RenderedColuna.prototype.getTotalRenderedColuna = function (filtro) {

    return getTotalCelulasByFiltro("cellObject.dataType == 'digit' && cellObject.codigocoluna=='" + this.codigocoluna + "' &&" + filtro)
}


RenderedColuna.prototype.setFXExpression = function (filtro) {

    var regex = /<([^>]+)>/g; // Find all values between angle brackets
    var match;
    var refs = [];
    var expressao = this.config.fxdata.expressao
    var orgExpr = "";
    orgExpr = expressao

    while ((match = regex.exec(expressao)) !== null) {
        var extracted = match[1];

        var celula = getCelulasByFiltro(filtro + "&& cellObject.codigocoluna=='" + extracted + "' && cellObject.dataType=='digit'")[0];
        orgExpr = orgExpr.replaceAll("<" + extracted + ">", celula ? celula.getValueOrDefault() : "0")
        refs.push(extracted)

    }

    return orgExpr

}


function Relatorio(data) {
    this.totalrelatorio = data.totalrelatorio || false
    this.totalcoluna = data.totalcoluna || false
    this.dectotrelatorio = data.dectotrelatorio || ""
    this.dectotcoluna = data.dectotcoluna || ""
    this.defdesccoluna = data.defdesccoluna || ""
    this.adicionalinha = data.adicionalinha || false
    this.linhamodelo = data.linhamodelo || ""
    this.modelos = Array.isArray(data.modelos) ? Array.from(data.modelos) : [];
    this.codigo = data.codigo || ""
    this.nome = data.nome || ""
    this.categoria = data.categoria || ""
    this.relatoriostamp = data.relatoriostamp || ""
}
function ReportConfig(data) {
    this.linhas = Array.isArray(data.linhas) ? Array.from(data.linhas.map(mapLinha)) : [new Linha({})];
    this.celulas = Array.isArray(data.celulas) ? Array.from(data.celulas.map(mapCelula)) : [new Celula({})];
    this.colunas = Array.isArray(data.colunas) ? Array.from(data.colunas.map(mapColuna)) : [new Coluna({})];
    this.relatorio = new Relatorio(data.relatorio || {});
}

function mapLinha(data) {
    return new Linha(data);
}

function mapExtra(data) {
    return new ExtraBindData(data)
}

function mapColuna(data) {
    return new Coluna(data);
}

function mapCelula(data) {
    return new Celula(data);
}

function mapFields(sourceObject, mappingConfig) {
    function mapReducer(mappedObject, targetKey) {
        var sourceKey = mappingConfig[targetKey];
        mappedObject[targetKey] = sourceObject[sourceKey];
        return mappedObject;
    }
    return Object.keys(mappingConfig).reduce(mapReducer, {});
}

function mapConfigComponentByDestiny(destiny, mapConfigs, configData, EntityToInstantiate) {

    var mapConfigFilt = mapConfigs.filter(function (obj) {

        return obj.mapDestiny == destiny
    });

    var mappedComponentRecord = []


    mapConfigFilt.forEach(function (mapConfig) {

        var filteredConfig = configData[mapConfig.mapSource];

        if (!Array.isArray(filteredConfig)) {

            if (mapConfig.bindData) {
                filteredData.bindData = mapConfig.bindData
            }



            var mapResult = new EntityToInstantiate(mapFields(filteredConfig, mapConfig.mapData));



            mappedComponentRecord.push(mapResult)

        } else {

            filteredConfig.forEach(function (filteredData) {

                if (mapConfig.bindData) {
                    filteredData.bindData = mapConfig.bindData
                }

                var mapResult = new EntityToInstantiate(mapFields(filteredData, mapConfig.mapData));



                mappedComponentRecord.push(mapResult)
            });
        }



    })



    return mappedComponentRecord;
}


function GetConfig(url, args) {

    return executeScriptOnPHC(url, args)
}

function MapConfig(mapConfigs, configData) {

    var celulas = mapConfigComponentByDestiny("Celula", mapConfigs, configData, Celula);
    var linhas = mapConfigComponentByDestiny("Linha", mapConfigs, configData, Linha);
    var colunas = mapConfigComponentByDestiny("Coluna", mapConfigs, configData, Coluna);
    var relatorio = mapConfigComponentByDestiny("Relatorio", mapConfigs, configData, Relatorio)[0];

    if (relatorio) {

        if (relatorio.adicionalinha) {

            var linhasModelo = linhas.filter(function (linha) {
                return linha.modelo == true
            }).map(function (linha) {
                relatorio.modelos.push(linha.codigo);
            });

        }

    }

    return new ReportConfig({ linhas: linhas, celulas: celulas, colunas: colunas, relatorio: relatorio });
}



function getMapConfigByComponent(renderConfig, component) {

    return renderConfig.mapping.find(function (obj) {

        return obj.component == component
    })
}


function getMappingByKey(key) {

    return GRenderData[key].mapping
}


function setLinhaRender(linha, linkid, parentid, records) {


    //No futuro se por exemplo for dito que o utilizador poderá apagar as linhas dos grupos e subgrupos . Para garantir que ao ter records (records.length>0) se liste exactamente o numero de grupos e subgrupos uma vez que podem ser apagados.
    //Deve se Filtrar o array que vai preencher os grupos e subgrupos se por acaso este não varar dos records ou seja : records.find(function (obj) return obj[mapConfig.mapData[config.bindData.sourceKey]] == config.codigo { if (linhaData) {}
    var config = new Linha(linha);

    var mapConfig = getMapConfigByComponent(GRenderData.renderConfig, config.tipo);
    var sourceBinds = config.bindData.sourceBind.split(",")
    var linhaData = records.find(function (obj) {
        return obj[sourceBinds[0]] == config.codigo
    });

    var linhaid = generateUUID();
    var novoregisto = true;

    if (linhaData) {
        linhaid = linhaData[config.bindData.sourceKey];
        novoregisto = false;
    }


    return new RenderedLinha({ novoregisto: novoregisto, rowid: linhaid, linkid: linkid, parentid: parentid, config: config })


}


function setColunasRender(colunas, records) {

    var renderedColunas = [new RenderedColuna({})]
    renderedColunas = []


    colunas.filter(function (colunaNegativa) {

        return colunaNegativa.ordem < 0
    }).forEach(function (coluna) {

        var colunaRendered = new Coluna(coluna);
        colunaRendered.setFxData();
        var renderedColuna = new RenderedColuna({
            codigocoluna: coluna.codigocoluna,
            config: colunaRendered
        });
        renderedColuna.preGenHtml();
        renderedColunas.push(renderedColuna);

    });



    if (!GReportConfig.relatorio.adicionalinha) {

        var dadosColuna = new Coluna({
            codigocoluna: "DEFCOL",
            desccoluna: GReportConfig.relatorio.defdesccoluna,
            tipo: "text",
            decimais: "",
            categoria: "defcol"
        });

        var renderedColuna = new RenderedColuna({
            codigocoluna: "DEFCOL",
            config: new Coluna(dadosColuna)
        });
        console.log("renderedColuna", renderedColuna)
        renderedColuna.preGenHtml();
        renderedColunas.push(renderedColuna);
    }



    colunas.filter(function (colunaNegativa) {

        return colunaNegativa.ordem >= 0
    }).forEach(function (coluna) {

        var colunaRendered = new Coluna(coluna);
        colunaRendered.setFxData()
        var renderedColuna = new RenderedColuna({
            codigocoluna: coluna.codigocoluna,
            config: colunaRendered
        });
        renderedColuna.preGenHtml();
        renderedColunas.push(renderedColuna);

    });


    if (GReportConfig.relatorio.totalcoluna) {


        var dadosColuna = new Coluna({
            codigocoluna: "TOTALCOLUNA",
            desccoluna: "Total",
            tipo: "digit",
            decimais: "2",
            categoria: "total"
        });


        renderedColunas.push(new RenderedColuna({
            codigocoluna: "TOTALCOLUNA",
            config: new Coluna(dadosColuna)
        }))

    }

    return renderedColunas
}


function setCabecalhos(records) {

    var header = {
        style: "text-align:right!important;",
        rowId: "",
        classes: "defgridheader",
        customData: "",
        cols: [
        ],
    }


    header.cols.push({
        content: "Acções",
        style: "width:4%!important;text-align:left!important",
        classes: "action-zone",
        colId: "ACTIONDEFCOL"

    });


    GRenderedColunas.forEach(function (coluna) {

        var mapConfig = getMapConfigByComponent(GRenderData.renderConfig, "Colunas")
        header.cols.push({
            content: coluna.config.desccoluna,
            classes: "header-for-edit-col  header-col",
            colId: coluna.codigocoluna,
            style: "text-align:right!important",
            customData: " data-fixacoluna='" + coluna.config.fixacoluna + "' data-proibenegativo='" + coluna.config.proibenegativo + "'  data-decimais='" + coluna.config.decimais + "' data-cikybastamp='" + coluna.config.colunastamp + "' data-desccoluna='" + coluna.config.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"
        });
    });



    GTableData.header = new HeaderHtml({ rows: [header] });


}


function handleDefaultValueByDataType(dataType, valor) {

    switch (dataType) {
        case "digit":

            return isNaN(valor) || valor == null ? 0 : valor;

        case "text":

            return valor ? valor : "";
        case "date":
            return valor ? valor : "1900-01-01";
        case "table":
            return valor ? valor : "";
        default:
            return valor;
    }
}



function getDistinctWithKeys(records, key) {
    return _.uniqBy(records, key);
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.substring(0, 25);
}






function formatInputValue(value, configData) {
    // Cria um input temporário

    var tmpInput = $("body").append("<input style='display:none'  class='cleaveFormatterInputTmp' type='text' value=" + String(value) + " />")

    var cleave = new Cleave('.cleaveFormatterInputTmp', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        numeralDecimalScale: 2,
        numeralDecimalMark: '.',
        //   numeralPositiveOnly: !configData.proibenegativo,
        delimiter: ' '
    });

    var formattedValue = $(".cleaveFormatterInputTmp").val();
    $(".cleaveFormatterInputTmp").remove();


    return formattedValue;
}

function handleUIValue(cellObject, value) {

    // console.log("handleUIValue", cellObject.codigocoluna, value)
    var configColuna = getColunaConfig(cellObject);
    if (!configColuna) {

        return value;
    }
    var configData = configColuna.config;
    switch (cellObject.dataType) {
        case "digit":
            return formatInputValue(value, configData);
        default:
            return value;
    }
}

function getColunaConfig(cellObject) {

    var configColuna = GRenderedColunas.find(function (coluna) {
        return coluna.codigocoluna == cellObject.codigocoluna;
    });

    if (!configColuna) {
        // console.warn("Coluna não encontrada para o cellObject:", cellObject);
        return null;
    }

    return configColuna;

}



function ConvertMrendObjectToTable(records) {


    var distinctSources = getDistinctWithKeys(records, "sourceTable");



    var sources = []

    distinctSources.forEach(function (source) {


        var tableData = []
        var sourceRecords = records.filter(function (record) {
            return record.sourceTable == source.sourceTable;
        });

        var distinctRows = getDistinctWithKeys(sourceRecords, "rowid");

        distinctRows.forEach(function (row) {

            var tableRow = {}
            var rowCells = records.filter(function (cell) {
                return cell.rowid == row.rowid
            })

            rowCells.forEach(function (cell) {
                var colunaConfig = GReportConfig.colunas.find(function (coluna) {
                    return coluna.codigocoluna == cell.coluna
                });

                tableRow[cell.campo] = handleDefaultValueByDataType(colunaConfig.tipo, cell[cell.campo])
            });
            tableRow[source.sourceKey] = row.sourceKeyValue
            tableRow[source.linkfield] = row.linkid || "";
            tableRow[source.ordemField] = row.ordem || 0;



            tableData.push(tableRow)


        });

        sources.push({
            sourceTable: source.sourceTable,
            sourceKey: source.sourceKey,
            records: tableData
        });



    })


    return sources;

}

function ConvertDbTableToMrendObject(data, MrendConversionConfig) {

    if (!data[0]) {

        return []
    }
    var keys = Object.keys(data[0]);
    var mrendObjects = []



    data.forEach(function (record) {
        keys.forEach(function (key) {

            var configCol = GReportConfig.colunas.find(function (coluna) {
                return coluna.codigocoluna == key
            })

            if (MrendConversionConfig.tableKey != key && configCol) {


                var rowid = record[MrendConversionConfig.tableKey]
                var mrendObject = new MrendObject({});
                mrendObject.campo = key;
                mrendObject[configCol.campo] = record[key];
                mrendObject.coluna = key;
                mrendObject.rowid = rowid;
                mrendObject.codigolinha = MrendConversionConfig.table;
                mrendObject.cellId = key + "COLUNA___LINHA" + rowid.trim();
                mrendObject.ordemField = MrendConversionConfig.ordemField;

                mrendObject.ordem = record[MrendConversionConfig.ordemField] || 0;

                mrendObject.sourceTable = MrendConversionConfig.table
                mrendObject.sourceKey = MrendConversionConfig.tableKey;
                mrendObject.sourceKeyValue = record[MrendConversionConfig.tableKey];

                if (configCol.sourceTable) {
                    mrendObject.sourceTable = configCol.sourceTable;
                    mrendObject.sourceKey = configCol.sourceKey;
                    mrendObject.sourceKeyValue = record[configCol.sourceKey];
                }




                if (MrendConversionConfig.extras) {

                    if (MrendConversionConfig.extras.linkfield) {

                        mrendObject.linkid = record[MrendConversionConfig.extras.linkfield];
                        mrendObject.linkfield = MrendConversionConfig.extras.linkfield;
                    }
                }

                mrendObjects.push(mrendObject)
            }

        })

    })

    return mrendObjects;

}







function initTableDataAndContainer() {


    $(".sourceTabletableContainer").remove();
    GTableData = new TableHtml({})
    GTableData.tableId = GRenderData.tableSourceName + "SourcedTable"
    GTableData.customData = "data-source='" + GRenderData.dataSource + "'"
    GTableData.classes = "table sourced-table "
    GTableData.body.rows = []
    GTableData.header = new HeaderHtml({});

    GCellObjectsConfig = []
    TMPCellObjectCOnfig = []
    GRenderedColunas = []
    GRenderedLinhas = []

    $(GContainerToRender).after("<div id='sourceTabletableContainer' style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'></div>")
}

function RenderReport(renderData) {

    if ($("#mainPage").data("state") == "eof") {
        return new Promise(function (resolve, reject) {

            resolve({ rendered: false, message: "Screen on mode eof" })
        })
    }
    mainSpinner("show")
    return InitDB(renderData.datasourceName, renderData.schemas).then(function (initDBResult) {

        return this.GetConfig(renderData.reportConfig.url, renderData.reportConfig.args).then(function (configDataResult) {

            if (configDataResult.cod != "0000") {

                console.log("Error on get config data", configDataResult)
                customReportMessageError("Erro ao gerar grelha do relatório. Contacte o admnistrador do sistema")
                return { rendered: false, message: "Erro ao gerar grelha do relatório. Contacte o admnistrador do sistema" }
            }

            GDefaultConfig = configDataResult.data;
            GRenderData = renderData
            var mapConfigs = renderData.reportConfig.mapping;
            GReportConfig = MapConfig(mapConfigs, configDataResult.data);
            GDB = initDBResult.db
            db = initDBResult.db;
            GContainerToRender = renderData.containerToRender;


            if (renderData.records.length > 0) {
                var records = ConvertDbTableToMrendObject(renderData.records, renderData.dbTableToMrendObject);

                deleteAllRecords(renderData.tableSourceName).then(function (deleteResult) {

                    RenderHandler(records);

                })




            }
            return fetchFromSource(renderData.table, renderData.codigo, renderData.recordData.stamp, initDBResult.db, renderData.dbTableToMrendObject).then(function (fetchResult) {

                mainSpinner("show");

                $(".sourceTabletableContainer").remove()
                if (fetchResult.novoRegisto == true && $("#mainPage").data("state") == "consultar") {
                    customReportMessageError("Sem resultados")
                    return { rendered: false, message: "No records" }

                }

                databaseAndTableHasRecords(initDBResult.db, GRenderData.tableSourceName)
                    .then(function (result) {
                        mainSpinner("show")
                        if (result.exists) {


                            RenderHandler(result.data);


                        } else {


                            RenderHandler(fetchResult.records)
                            //console.log(renderData.recordData.stamp)
                            storeStampRegisto(renderData.recordData.stamp)
                            addBulkData(initDBResult.db, GRenderData.tableSourceName, fetchResult.records)


                        }
                    })
                    .catch(function (error) {
                        relatorioErrorMessageHandler()
                        console.error('An error occurred:', error);
                    });

                return { rendered: true, message: "Rendered" }

            })

        })

    })





}

function buildAlert(alertClass, alertText) {
    var alerta = ""
    alerta += "<div  class='alert custom-alert " + alertClass + "'>"
    alerta += "  <strong>Atenção!</strong> " + alertText
    alerta += "</div>"

    return alerta
}
function dbExists(dbName) {
    return Dexie.exists(dbName);
}

function buildAlert(alertClass, alertText) {
    var alerta = ""
    alerta += "<div  class='alert custom-alert " + alertClass + "'>"
    alerta += "  <strong>Atenção!</strong> " + alertText
    alerta += "</div>"

    return alerta
}


function relatorioErrorMessageHandler() {
    var alertHtml = buildAlert("alert-danger", "Erro ao gerar grelha do relatório. Contacte o admnistrador do sistema")
    $("#campos > .row:last").after("<div style='margin-top:2.5em' '>" + alertHtml + "</div>")

    mainSpinner("hide")
}



function ExecuteRenderAfterWebWorker(event) {
    var resultado = JSON.parse(event.data);

    var cacheUI = new CachedUI(resultado);
    cacheUI.fillAndRender();

    $(".sourceTabletableContainer").empty();
    $("#campos > .row:last").after("<div id='sourceTabletableContainer' style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'></div>")
    var tableHtml = generateTableV2(resultado.GTableData);
    var parts = 15;
    var partSize = Math.ceil(tableHtml.length / parts);
    var container = $(".sourceTabletableContainer");

    function appendParts(index) {
        if (index >= parts) return;

        var start = index * partSize;
        var end = start + partSize;
        var chunk = tableHtml.substring(start, end);

        container.append(chunk);
        setTimeout(function () {
            appendParts(index + 1);
        }, 0);
    }

    // Começa a adição das partes
    appendParts(0);
    mainSpinner("hide");
}

function setStyle(styleGroup, component, property) {

    var styleGroupsHandlers = [{
        styleGroup: "Color",
        styleFunction: function () {

            return colorHandler(component, property)
        }
    }];

    var styleGroupHandler = styleGroupsHandlers.find(function (obj) {

        return obj.styleGroup == styleGroup
    });

    if (styleGroupHandler) {
        return styleGroupHandler.styleFunction();
    }

    return "";

}

function colorHandler(component, color) {

    switch (component) {

        case "Grupo":

            return (color ? color : "#e9f1ff");
        case "Subgrupo":
            return (color ? color : "#ffff");
        case "Singular":
            return (color ? color : "#ffff");

        case "Total":
            return (color ? color : "#033076");


    }
}

function inputToNumber(inputVal) {


    return inputVal;
    var inputValTxt = (inputVal ? inputVal.replaceAll(" ", "").replaceAll(",", "") : "0")

    return (isNaN(inputValTxt) ? 0 : Number(inputValTxt));
}


function inputToNumberDB(inputVal) {


    var inputValTxt = (inputVal ? inputVal.replaceAll(" ", "").replaceAll(",", "") : "0")

    return (isNaN(inputValTxt) ? 0 : Number(inputValTxt));
}



function handleCustomDataForCellObject(cellObjectConfig) {

    var customData = ""

    var colunaConfig = cellObjectConfig.getColunaConfig();

    if (colunaConfig.config.colfunc) {
        customData += "v-model='executeColFunc(\"" + colunaConfig.config.expresscolfun + "\", \"" + cellObjectConfig.rowid + "\", \"" + cellObjectConfig.codigocoluna + "\")'"
    }

    if (cellObjectConfig.dataType == "digit") {
        customData += " @vue:mounted=\"applyFormatter($el, '" + cellObjectConfig.rowid + "', '" + cellObjectConfig.codigocoluna + "')\"";
    }



    return customData;


}


function handleReactiveClasses(cellObjectConfig) {

    switch (cellObjectConfig.dataType) {
        case "table":
            return " reactive-select-mrend";
        default:
            return ""
    }

}
function generateHtmlObject(config) {



    var cellObjectConfig = config

    var localConfigStyles = cellObjectConfig.celula.desabilitado ? " background:transparent!important" : ""
    var localConfigAttr = cellObjectConfig.celula.desabilitado ? " disabled" : ""

    var globalCustomData = ""
    globalCustomData += handleCustomDataForCellObject(cellObjectConfig);
    globalCustomData += "v-model='getCell(\"" + cellObjectConfig.rowid + "\",\"" + cellObjectConfig.codigocoluna + "\").valor'";

    var reactiveClasses = " "
    reactiveClasses += handleReactiveClasses(cellObjectConfig);


    if (cellObjectConfig.dataType == "digit") {

        var valueNumber = (isNaN(Number(cellObjectConfig.valor))) ? '0' : cellObjectConfig.valor
        var inputDigitClass = cellObjectConfig.categoria == "default" ? " source-bind-table-control " : " source-bind-table-tot "

        var digitInputData = {
            type: "text",
            value: valueNumber,
            classes: "form-control  input-sm table-input-col " + inputDigitClass + cellObjectConfig.customClasses,
            style: "background:#eff0f1!important;" + cellObjectConfig.customStyles + localConfigStyles,
            customData: " id=" + cellObjectConfig.cellid + " " + cellObjectConfig.atributo + "  data-type='digit' " + cellObjectConfig.fxData + "  source-key='" + cellObjectConfig.bindData.sourceKey + "' source-bind='" + cellObjectConfig.bindData.sourceBind + "'" + localConfigAttr + globalCustomData,
            placeholder: ""
        };
        return generateInput(digitInputData)

        // return "<input type='text' class='form-control source-bind-table-control input-sm table-input-col ' style='background:#eff0f1!important;' id='DEFCOLTOTALSUBTOTAL' source-key='DEFCOLTOTAL' source-bind='SUBTOTAL' data-type='text'  placeholder='' >"



    }

    if (cellObjectConfig.dataType == "text") {

        var textInputData = {
            type: "text",
            value: cellObjectConfig.valor,
            classes: "form-control source-bind-table-control input-sm table-input-col " + reactiveClasses,
            style: "background:#eff0f1!important;" + cellObjectConfig.customStyles + localConfigStyles,
            customData: "id=" + cellObjectConfig.cellid + " data-type='text' " + cellObjectConfig.fxData + " " + cellObjectConfig.atributo + " source-key='" + cellObjectConfig.bindData.sourceKey + "' source-bind='" + cellObjectConfig.bindData.sourceBind + "'" + localConfigAttr + globalCustomData,
            placeholder: ""
        };
        return generateInput(textInputData)
        //return "<input type='text' class='form-control source-bind-table-control input-sm table-input-col ' style='background:#eff0f1!important;' id='DEFCOLTOTALSUBTOTAL' source-key='DEFCOLTOTAL' source-bind='SUBTOTAL' data-type='text'  placeholder='' >"
    }

    if (cellObjectConfig.dataType == "date") {
        var dateInputData = {
            type: "text",
            value: cellObjectConfig.valor,
            classes: "form-control source-bind-table-control input-sm table-input-col sourced-table-date-field " + reactiveClasses,
            style: "background:#eff0f1!important;" + cellObjectConfig.customStyles + localConfigStyles,
            customData: "id=" + cellObjectConfig.cellid + " data-language='pt' data-type='date' " + cellObjectConfig.fxData + " " + cellObjectConfig.atributo + " source-key='" + cellObjectConfig.bindData.sourceKey + "' source-bind='" + cellObjectConfig.bindData.sourceBind + "'" + localConfigAttr + globalCustomData,
            placeholder: ""
        };


        return generateInput(dateInputData)
        //return "<input type='text' class='form-control source-bind-table-control input-sm table-input-col ' style='background:#eff0f1!important;' id='DEFCOLTOTALSUBTOTAL' source-key='DEFCOLTOTAL' source-bind='SUBTOTAL' data-type='text'  placeholder='' >"
    }


    if (cellObjectConfig.dataType == "table") {

        if (cellObjectConfig.performancelistener == true) {

            var selectMarcadoData = marcarOptionSelecionado(cellObjectConfig.renderedColuna.preGen, cellObjectConfig.valor);
            var selectMarcado = selectMarcadoData.html;
            cellObjectConfig.outrosValores.push(selectMarcadoData.selectedText);
            selectMarcado = selectMarcado.replaceAll("[selectId]", cellObjectConfig.cellid)
            return selectMarcado;

        }

        cellObjectConfig.fillTableData();

        var dadosColuna = GRenderedColunas.find(function (coluna) {
            return coluna.codigocoluna == cellObjectConfig.codigocoluna
        })

        var campooption = cellObjectConfig.campooption ? cellObjectConfig.campooption : dadosColuna.config.nometb;
        var campovalor = cellObjectConfig.campovalor ? cellObjectConfig.campovalor : dadosColuna.config.valtb;


        return generateSelectSettingSelectValue([], "form-control source-bind-table-control  table-select " + reactiveClasses, "", " id=" + cellObjectConfig.cellid + " source-key='" + cellObjectConfig.bindData.sourceKey + "' source-bind='" + cellObjectConfig.bindData.sourceBind + "' " + globalCustomData, campooption, campovalor, cellObjectConfig.valor)


    }

    if (cellObjectConfig.dataType == "logic") {

        var checkBoxInputData = {
            type: "checkbox",
            value: value,
            classes: " source-bind-table-control table-input-col " + reactiveClasses,
            style: "" + cellObjectConfig.customStyles + localConfigStyles,
            customData: " id=" + cellObjectConfig.cellid + " data-type='logic' " + cellObjectConfig.fxData + " " + cellObjectConfig.atributo + " source-key='" + sourceKey + "' source-bind='" + cellObjectConfig.sourceBind + "'" + (cellObjectConfig.valor == "on" ? " checked" : " ") + localConfigAttr + globalCustomData,
            placeholder: ""
        };

        return generateInput(checkBoxInputData)


    }

}



function getDefaultColunaHtmlObject(linh, records) {

    var linha = new RenderedLinha(linh);

    switch (linha.config.tipolistagem) {

        case "Próprio Registo":

            var linhaTipoFiltered = GReportConfig.linhas.filter(function (linhaGrupo) {

                return linhaGrupo.tipo == linha.config.tipo
            });


        default:

    }


}

function evalOrDefault(expression) {
    try {

        return eval(expression)
    } catch (e) {

        console.warn("ev", e)
        return expression
    }
}
function getFilteredRecord(records, filters) {

    return records.find(function (record) {
        return eval(filters)
    })

}


function setLinhaGrupoAndSubgrupo(linh, parentid, records) {

    var linha = new RenderedLinha(linh);
    linha.parentid = parentid;

    var linhaId = linha.rowid;



    var customStyles = ""
    if (linha.config.cor) {
        customStyles = "background:" + setStyle("Color", linha.config.tipo, linha.config.cor) + "!important"
    }
    var linhaHtml = {
        rowId: linhaId,
        style: customStyles,
        classes: "" + linha.config.tipo + "-row",
        customData: "",
        cols: []

    }

    var cellActionZoneObjectConfig = new CellObjectConfig(
        {
            bindData: {},
            tipolistagem: "",
            component: "Celula",
            componentcategoria: linha.config.tipo,
            novoregisto: linha.novoregisto,
            expressao: "Celula",
            categoria: "action",
            dataType: "",
            valor: "",
            campovalor: "",
            campooption: "",
            changedb: false,
            linkid: linha.linkid,
            cellid: "ACTIONDEFCOL" + linhaId,
            codigocoluna: "ACTIONDEFCOL",
            rowid: linha.rowid
        });

    cellActionZoneObjectConfig.setDefaultValue();

    linhaHtml.cols.push({
        style: "",
        colId: "",
        classes: "action-zone",
        content: "<button type='button' style='color:white!important;margin-right:0.3em' class='btn  btn-sm btn-primary groupRowAddBtn'><span  class='glyphicon glyphicon glyphicon-plus'></span></button>",
        customData: "",
    })


    if (linha.config.temcolunas) {

        var mapping = getMappingByKey("renderConfig");
        var colunaMap = mapping.find(function (smap) {
            return smap.component == "Coluna"
        });

        GRenderedColunas.map(function (coluna) {

            var recFlt = records.filter(function (record) {
                return record[colunaMap.mapData.colunaid] == coluna.codigocoluna
            });
            //console.log("recFlt",recFlt)
            setCelula(linhaHtml, linha, coluna, recFlt, coluna.config.categoria, "", {})

            return coluna;
        });

    }



    // }



    if (linha.config.temcolunas == false) {

        linhaHtml.cols.push({
            style: "",
            colId: "",
            classes: "",
            content: "",
            customData: "colspan=" + (GRenderedColunas.length).toString() + "",
        })


    }


    GTableData.body.rows.push(linhaHtml);


    var subLinhas = GRenderedLinhas.filter(function (linhaObj) {

        return linhaObj.linkid == linha.rowid && linhaObj.linkid != ""
    });


    subLinhas.sort(function (a, b) {
        return a.config.ordem - b.config.ordem;
    });

    subLinhas.forEach(function (subLinha) {

        setLinha(subLinha, "", records);


    });

    if (linha.config.temtotais) {

        var renderedLinhaTotalRelatorio = setLinhaRenderTotal({ codigo: "SUBTOTALINHA", descricao: "Total", cor: "#417ad3", linkid: linha.rowid, rowid: "SUBTOTAL" + linha.rowid });
        renderedLinhaTotalRelatorio.addToLocalRenderedLinhasList([], "", {}, false);
        setLinha(renderedLinhaTotalRelatorio, "", [])


    }


    return linhaHtml;

}



function setLinhaModeloOuSingular(linh, parentid, records) {

    var linha = linh;
    linha.parentid = parentid;

    var linhaId = linha.rowid;

    var customStyles = ""
    if (linha.config.cor) {
        customStyles = "background:" + setStyle("Color", linha.config.tipo, linha.config.cor) + "!important"
    }


    var customDataParent = linha.isParent ? " data-id='" + linhaId + "' " : "";
    var customDataLink = linha.linkid ? " data-id='" + linhaId + "' data-parent-id='" + linha.linkid + "' " : "";
    var linhaHtml = {
        rowId: linhaId,
        style: customStyles,
        classes: "" + linha.config.tipo + "-row",
        customData: customDataLink + customDataParent,
        cols: []

    }
    var cellActionZoneObjectConfig = new CellObjectConfig(
        {
            bindData: {},
            tipolistagem: "",
            component: "Celula",
            componentcategoria: linha.config.tipo,
            novoregisto: linha.novoregisto,
            expressao: "Celula",
            categoria: "action",
            dataType: "",
            valor: "",
            campovalor: "",
            campooption: "",
            changedb: false,
            linkid: linha.linkid,
            cellid: "ACTIONDEFCOL" + linhaId,
            codigocoluna: "ACTIONDEFCOL",
            rowid: linha.rowid
        });

    // cellActionZoneObjectConfig.setDefaultValue();


    var addFilhoBtn = "<button data-modelo='" + linha.config.codigo + "' type='button' style='margin-left:0.3em;color:#0765b7!important;background:transparent;margin-right:0.3em' class='btn  btn-xs  addFilho'><span  class='glyphicon glyphicon glyphicon-plus'></span></button>"
    var removeBtn = "<button type='button' style='color:#d9534f!important;background:transparent' class='btn btn-xs  removeTableRow'><span  class='glyphicon glyphicon glyphicon-trash'></span></button>"


    var divContainerAcionsZone = "<div style='display:flex;flex-direction:row' class='container-action-zone'>"
    divContainerAcionsZone += removeBtn;
    divContainerAcionsZone += (linha.config.addfilho ? addFilhoBtn : "");
    divContainerAcionsZone += "</div>"

    linhaHtml.cols.push({
        style: "" + (linha.config.addfilho ? "" : ""),
        colId: "",
        classes: "action-zone",
        content: divContainerAcionsZone,
        customData: "",
    });


    if (linha.config.temcolunas) {


        GRenderedColunas.forEach(function (coluna) {

            var recFlt = records.filter(function (rec) {
                return rec.coluna == coluna.codigocoluna
            });
            setCelula(linhaHtml, linha, coluna, recFlt, coluna.config.categoria, "", {})

        });



    }



    if (linha.config.temcolunas == false) {

        linhaHtml.cols.push({
            style: "",
            colId: "",
            classes: "",
            content: "",
            customData: "colspan=" + (GRenderedColunas.length).toString() + "",
        })


    }


    GTableData.body.rows.push(linhaHtml);



    return linhaHtml


}


function setLinhaTotal(linh) {

    var linha = new RenderedLinha(linh);


    var cellObjectConfig = new CellObjectConfig(
        {
            bindData: linha.config.bindData,
            tipolistagem: linha.config.tipolistagem,
            component: "Linha",
            componentcategoria: linha.config.tipo,
            novoregisto: linha.novoregisto,
            expressao: linha.config.expressao,
            dataType: linha.config.objectolist,
            valor: linha.config.codigo,
            campovalor: "codigo",
            campooption: "descricao",
            linkid: linha.linkid,
            cellid: "DEFCOLTOTAL" + linha.rowid,
            codigocoluna: "DEFCOLTOTAL",
            rowid: linha.rowid
        });

    cellObjectConfig.setDefaultValue();

    var linhaDefaultColumnHtmlObject = generateHtmlObject(cellObjectConfig);

    var customStyles = ""
    if (linha.config.cor) {
        customStyles = "background:" + setStyle("Color", linha.config.tipo, linha.config.cor) + "!important"
    }

    var linhaHtml = {
        rowId: linha.rowid,
        style: customStyles,
        classes: "" + linha.config.tipo + "-row",
        customData: "",
        cols: [{
            style: "color:white;text-align:left;width:10%;font-weight:bold",
            colId: "",
            classes: "action-zone",
            content: linha.config.descricao,
            customData: "",
        }]

    }

    GRenderedColunas.forEach(function (coluna) {

        var extraData = { customClasses: "", customStyles: "background:transparent!important;font-weight:bold!important;color:white!important" }
        setCelula(linhaHtml, linha, coluna, [], "total", extraData)

    });

    GTableData.body.rows.push(linhaHtml);

    return linhaHtml


}

function setLinha(linh, parentid, records) {


    switch (linh.config.tipo) {
        case "Grupo":
        case "Subgrupo":

            return setLinhaGrupoAndSubgrupo(linh, parentid, records)

        case "Singular":
            return setLinhaModeloOuSingular(linh, parentid, records);

        case "Total":
            return setLinhaTotal(linh);


        default:
            throw new Error("TIPO DE LINHA NÃO RECONHECIDO PARA GERAÇÃO.");
    }






}


function setLinhaRenderTotal(data) {


    var linha = new Linha({ tipo: "Total", codigo: data.codigo, descricao: data.descricao, cor: data.cor })
    return new RenderedLinha({ linkid: data.linkid, rowid: data.rowid, config: linha });
}









function buildCelulaDefCol(linhaHtml, linh, colun, records) {

    var linha = new RenderedLinha(linh);
    var coluna = new RenderedColuna(colun);


    var cellObjectConfig = new CellObjectConfig(
        {
            bindData: linha.config.bindData,
            tipolistagem: linha.config.tipolistagem,
            component: "Linha",
            componentcategoria: linha.config.tipo,
            novoregisto: linha.novoregisto,
            expressao: linha.config.expressao,
            dataType: linha.config.objectolist,
            valor: linha.config.codigo,
            campovalor: "codigo",
            campooption: "descricao",
            linkid: linha.linkid,
            cellid: linha.rowid,
            codigocoluna: "DEFCOL",
            changedb: true,
            renderelinha: linha,
            rowid: linha.rowid,
            performancelist: false

        });

    cellObjectConfig.setDefaultValue();

    var celulaHtmlObject = generateHtmlObject(cellObjectConfig);

    linhaHtml.cols.push({
        content: celulaHtmlObject,
        classes: "",
        style: "width:40%",
        colId: "",
        customData: "data-desccoluna='" + coluna.config.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"

    });
}


function inputGenerationTst() {


    return "<input type='text' class='form-control source-bind-table-control input-sm table-input-col ' style='background:#eff0f1!important;' id='DEFCOLTOTALSUBTOTAL' source-key='DEFCOLTOTAL' source-bind='SUBTOTAL' data-type='text'  placeholder='' >"
}



function buildDefaultCelula(linhaHtml, linh, colun, records) {

    var linha = linh;
    var coluna = colun;
    var configCelula = GReportConfig.celulas.find(function (configCelula) {
        return configCelula.linhastamp == linha.config.linhastamp && configCelula.codigocoluna == coluna.codigocoluna
    });



    var linhaRecord;


    var mapping = getMappingByKey("renderConfig");
    var subGrupoMap = mapping.find(function (smap) {
        return smap.component == "Subgrupo"
    });

    var grupoMap = mapping.find(function (smap) {
        return smap.component == "Grupo"
    });

    var colunaMap = mapping.find(function (smap) {
        return smap.component == "Coluna"
    });

    var singularMap = mapping.find(function (smap) {
        return smap.component == "Singular"
    });

    var linhaFilterKey = (linha.config.tipo == "Grupo" ? grupoMap.mapData.gruporowid : subGrupoMap.mapData.subrowid);

    switch (linha.config.tipo) {
        case "Grupo":
            linhaFilterKey = grupoMap.mapData.gruporowid;
            break;
        case "Subgrupo":
            linhaFilterKey = subGrupoMap.mapData.subrowid;
            break;
        case "Singular":
            linhaFilterKey = singularMap.mapData.rowid;
            break;

        default:
            break;
    }



    linhaRecord = records[0]



    var cellId = null;
    var novoRegisto = false;

    if (linhaRecord) {

        cellId = linhaRecord[configCelula.bindData.sourceKey]

    }
    if (!linhaRecord) {
        linhaRecord = JSON.parse(JSON.stringify(GRenderData.schemas[0].tableSourceSchema))
        cellId = generateUUID();
        novoRegisto = true


    }

    if (GRenderData.records.length > 0) {

        GNewRecords.push(linhaRecord);
    }

    var cellObjectConfig = new CellObjectConfig(
        {
            bindData: new BindData({ sourceKey: configCelula.bindData.sourceKey, sourceBind: coluna.config.campo }),
            tipolistagem: "",
            component: "Celula",
            componentcategoria: "Celula",
            expressao: "",
            atributo: isUndefinedOrNull(configCelula.atributo) ? coluna.config.atributo : configCelula.atributo,
            proibenegativo: isUndefinedOrNull(configCelula.proibenegativo) ? "" : configCelula.proibenegativo,
            dataType: coluna.config.tipo,
            valor: linhaRecord[coluna.config.campo],
            campovalor: "",
            linkid: linha.linkid,
            row: linha.rowid,
            campooption: "",
            renderedColuna: coluna,
            codigocoluna: coluna.codigocoluna,
            rowid: linha.rowid,
            cellid: cellId,
            changedb: true,
            renderelinha: linha
        });

    cellObjectConfig.setDefaultValue();
    //TMPCellObjectCOnfig.unshift(cellObjectConfig);



    var celulaHtmlObject = generateHtmlObject(cellObjectConfig);

    var cellValue = cellObjectConfig.valor;

    if (novoRegisto) {

        linhaRecord[configCelula.bindData.sourceKey] = cellId;
        linhaRecord[coluna.config.campo] = cellValue;
        linhaRecord[colunaMap.mapData.colunaid] = coluna.codigocoluna

        if (linha.config.tipo == "Grupo") {

            linhaRecord[subGrupoMap.mapData.subrowid] = linha.config.tipo == "Subgrupo" ? linha.rowid : ""
            linhaRecord[subGrupoMap.mapData.codigosubgrupo] = linha.config.tipo == "Subgrupo" ? linha.config.codigo : ""
            linhaRecord[subGrupoMap.mapData.descricao] = linha.config.descricao;

        }


        if (linha.config.tipo == "Subgrupo") {

            linhaRecord[grupoMap.mapData.descricao] = linha.config.linkdescricao;
            linhaRecord[grupoMap.mapData.codigogrupo] = linha.config.tipo == "Subgrupo" ? linha.linkcodigo : linha.config.codigo;
            linhaRecord[grupoMap.mapData.gruporowid] = linha.config.tipo == "Grupo" ? linha.rowid : linha.linkid
        }

        if (linha.config.tipo == "Singular") {
            linhaRecord[singularMap.mapData.rowid] = linha.rowid;
            linhaRecord[singularMap.mapData.codigolinha] = linha.config.codigo;
        }

        if (GRenderData.dbTableToMrendObject.convert) {

            linhaRecord[getCampoMrend()] = coluna.config.campo;
            linhaRecord.linkid = linha.linkid;
            linhaRecord.linkfield = GRenderData.dbTableToMrendObject.extras.linkfield;
            linhaRecord.sourceTable = GRenderData.dbTableToMrendObject.table;
            linhaRecord.sourceKey = GRenderData.dbTableToMrendObject.tableKey;
            linhaRecord.sourceKeyValue = linha.rowid;
            linhaRecord.ordem = linha.ordem
            linhaRecord.ordemField = GRenderData.dbTableToMrendObject.ordemField;

            if (coluna.config.sourceTable) {

                linhaRecord.sourceTable = coluna.config.sourceTable;
                linhaRecord.sourceKey = coluna.config.sourceKey;
                linhaRecord.sourceKeyValue = linha.rowid;
            }


        }


        GNewRecords.push(linhaRecord);
    }

    linhaHtml.cols.push({
        content: celulaHtmlObject,
        classes: "skeleton",
        colId: "",
        customData: "data-desccoluna='" + coluna.config.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"

    });


}


function InitDB(datasourceName, schemas) {

    return new Promise(function (resolve, reject) {
        db = new Dexie(datasourceName);
        var promises = []; // Armazena todas as Promises do loop

        return configureDataBase(db, schemas[0].tableSourceName, 1, Object.keys(schemas[0].tableSourceSchema)).then(function (result) {
            db = result;
            resolve({ inited: true, message: "Success", db: result }); // Resolve quando todas as promessas concluírem
        });

    });
}


function executeScriptOnPHC(url, args) {

    return $.ajax({
        type: "POST",
        url: url,
        data: {
            '__EVENTARGUMENT': JSON.stringify([args ? args : {}]),
        }
    })

}



function fetchFromSource(tableName, codigo, registo, db, dbTableToMrendObject) {



    return new Promise(function (resolve, reject) {

        getDataFromPHC(codigo, registo)
            .then(function (response) {

                if (dbTableToMrendObject) {

                    if (dbTableToMrendObject.convert == true) {

                        var dbConverstion = ConvertDbTableToMrendObject(response.data, dbTableToMrendObject);

                        response.data = dbConverstion
                    }

                }

                if (response.cod != "0000") {
                    reject(response)
                }

                if (getState() == "consultar") {

                    if (response.data.length > 0) {
                        deleteAllRecords(tableName).then(function (data) {
                            addBulkData(db, tableName, response.data)
                            resolve({ novoRegisto: false, response: response, records: response.data });
                        })
                    }
                    else {
                        resolve({ novoRegisto: true, response: response, records: response.data });
                    }
                }



                if (getState() != "consultar") {


                    if (registo.trim() != getSourceStamp().trim()) {

                        storeDataSourceStamp(registo)
                        //  storeNota(getNotaData().nota)
                        deleteAllRecords(tableName).then(function (data) {

                            if (response.data.length > 0) {
                                addBulkData(db, tableName, response.data)

                                resolve({ novoRegisto: false, response: response, records: response.data });
                            }

                            else {
                                resolve({ novoRegisto: true, response: response, records: [] });
                            }
                        })

                    }

                    else {
                        resolve({ novoRegisto: false, response: null, records: response.data });
                    }
                }

            })
            .catch(function (error) {
                reject(error);
            });

    });
}


function getState() {
    return $("#mainPage").data("state")
}

function storeStampRegisto(stampregisto) {
    window.localStorage.setItem("stampregisto", stampregisto)
}
function storeDataSourceStamp(sourceStamp) {

    window.localStorage.setItem("sourcestamp", sourceStamp.trim())
}

function clearStamps() {
    window.localStorage.clear("sourcestamp")
    window.localStorage.clear("stampregisto")
}

function getSourceStamp() {
    return window.localStorage.getItem("sourcestamp")
}



function deleteAllRecords(tableName) {
    return new Promise(function (resolve, reject) {

        if (db['_allTables'][tableName]) {
            return db[tableName].clear().then(function () {
                // //console.log(`All records from ${tableName} have been deleted successfully.`);
                resolve(true)
            }).catch(function (error) {

                reject(error)
                // console.error(`Error deleting all records from ${tableName}:`, error);
            });

        }
        else {
            resolve(true)
        }



    });
}



function addData(db, tableName, data) {
    try {
        // db[tableName].add(data);
        return db[tableName].add(data);
        // //console.log('Data added with primary key:', primaryKey);
    } catch (error) {
        console.error('Error adding data:', error);
    }
}

function deleteData(db, tableName, fieldName, filedValue) {
    return db[tableName].where(fieldName).equals(filedValue).delete()
}

function addBulkData(db, tableName, dataArray) {

    //console.log("tableName",tableName)
    if (db['_allTables'][tableName]) {
        return db[tableName].bulkPut(dataArray)
    } else {
        return db[tableName].bulkAdd(dataArray)
    }

}



function getDataFromPHC(codigo, filtroval) {
    ////console.log(tabela, opcaoEcraId, coluna, registo)

    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "POST",
            url: "../programs/gensel.aspx?cscript=getdatafromphc",
            data: {
                //  '__EVENTTARGET': opcaoEcraId,
                '__EVENTARGUMENT': JSON.stringify([{ codigo: codigo, filtroval: filtroval }]),
            },
            success: function (response) {

                resolve(response);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

function configureDataBase(db, tableName, version, indexes) {

    //console.log(indexes)
    return new Promise(function (resolve, reject) {

        db.close()  //.then(function () {
        var schemaConfig = {};

        schemaConfig[tableName] = indexes.join(",");
        db.version(version).stores(schemaConfig);

        db.version(1).stores({
            UI: '++id, GRenderedLinhas, GTableData, GDefaultConfig, GReportConfig, GRenderedData, GRenderData, GRenderedColunas, GCellObjectsConfig, GTmpListTableObject, TMPCellObjectCOnfig'
        });

        // Open the database
        db.open().then(function () {
            // Resolve the database instance
            resolve(db);
        }).catch(function (error) {
            // Reject the promise if there's an error
            reject(error);
        });
    })

    //   });
}


function tablesHasRecords(db, tableName) {

    return db[tableName].count()

}

function databaseAndTableHasRecords(db, tableName) {
    return new Promise(function (resolve, reject) {
        if (db['_allTables'][tableName]) {


            db[tableName].count()
                .then(function (count) {
                    if (count > 0) {
                        // If there are records, return all records
                        return db[tableName].toArray();
                    } else {
                        // If no records, resolve with an object indicating that the data does not exist
                        resolve({ exists: false, data: null });
                        return null; // Return null to skip the next 'then' block
                    }
                })
                .then(function (data) {
                    if (data) {
                        // If data is not null, resolve with an object indicating that the data exists and include the data
                        resolve({ exists: true, data: data });
                    }
                })
                .catch(function (error) {
                    reject(new Error('Error while opening or checking record count: ' + error));
                })
                .finally(function () {
                    // db.close();
                });
        } else {
            resolve({ exists: false, data: null });
        }
    });
}

function isTableExist(db, tableName) {
    return db.tables.has(tableName);
}


function buildCelulaSemImputacao(linhaHtml, linh, colun) {

    var linha = new RenderedLinha(linh);
    var coluna = new RenderedColuna(colun);
    var cellId = generateUUID();


    var cellObjectConfig = new CellObjectConfig(
        {
            bindData: new BindData({}),
            tipolistagem: "",
            component: "Celula",
            componentcategoria: "Celula",
            expressao: "",
            atributo: "readonly",
            proibenegativo: "",
            dataType: coluna.config.tipo,
            valor: "",
            campovalor: "",
            linkid: linha.linkid,
            row: linha.rowid,
            changedb: false,
            campooption: "",
            codigocoluna: coluna.codigocoluna,
            rowid: linha.rowid,
            cellid: cellId,
            renderelinha: linha,
            customStyles: "background:transparent!important;font-weight:bold!important;"
        });

    cellObjectConfig.setDefaultValue();
    var celulaHtmlObject = generateHtmlObject(cellObjectConfig);



    linhaHtml.cols.push({
        content: celulaHtmlObject,
        classes: "",
        colId: "",
        customData: "data-desccoluna='" + coluna.config.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"

    });
}



function buildTotalCelula(linhaHtml, linh, colun, extraData) {

    var linha = new RenderedLinha(linh);
    var coluna = new RenderedColuna(colun);
    var cellId = coluna.codigocoluna + "»»" + linha.rowid

    var cellObjectConfig = new CellObjectConfig(
        {
            bindData: new BindData({}),
            tipolistagem: "",
            component: "Celula",
            componentcategoria: "Celula",
            expressao: "",
            categoria: "total",
            atributo: "readonly",
            proibenegativo: "",
            customStyles: extraData.customStyles,
            customClasses: extraData.customClasses,
            dataType: coluna.config.tipo,
            valor: "",
            linkid: linha.linkid,
            rowid: linha.rowid,
            campovalor: "",
            campooption: "",
            codigocoluna: coluna.codigocoluna,
            rowid: linha.rowid,
            cellid: cellId,
            renderelinha: linha
        });

    cellObjectConfig.setDefaultValue()
    cellObjectConfig.addToLocalCellList();

    var celulaHtmlObject = generateHtmlObject(cellObjectConfig);



    linhaHtml.cols.push({
        content: celulaHtmlObject,
        classes: "",
        colId: "",
        customData: "  data-desccoluna='" + coluna.config.desccoluna + "' data-coluna='" + coluna.codigocoluna + "'"

    });


}


function setCelula(linhaHtml, linh, colun, records, categoria, extraData) {
    switch (categoria) {
        case "defcol":

            buildCelulaDefCol(linhaHtml, linh, colun, records);
            break;
        case "default":

            buildDefaultCelula(linhaHtml, linh, colun, records)
            break;

        case "semimputacao":
            buildCelulaSemImputacao(linhaHtml, linh, colun, extraData);
            break;

        case "total":
            buildTotalCelula(linhaHtml, linh, colun, extraData)
        default:
            break;
    }
}


function addNewRecords() {

    if (GNewRecords.length > 0) {
        addBulkData(GDB, GRenderData.tableSourceName, GNewRecords).then(function (data) {
            console.log("NEW ROWS INSERTED", data);
            GNewRecords = []

            GCellObjectsConfig = GCellObjectsConfig.concat(TMPCellObjectCOnfig);

        }).catch(function (err) {
            console.log("ERROR ON INSERT NEW ROWS", err)
        });
    }
}
function marcarOptionSelecionado(selectHtml, valorCelula) {
    // Verifica se alguma option tem o valor correspondente
    var regex = new RegExp('<option value=[\'"]' + valorCelula + '[\'"]>', 'i');
    var selectedValue = null;

    if (regex.test(selectHtml)) {
        // Adiciona o atributo selected à option correta
        selectHtml = selectHtml.replace(
            new RegExp('(<option value=[\'"]' + valorCelula + '[\'"])(>)', 'i'),
            '$1 selected$2'
        );

        // Extrai o texto do option selecionado
        var textRegex = new RegExp('<option value=[\'"]' + valorCelula + '[\'"][^>]*>(.*?)</option>', 'i');
        var match = textRegex.exec(selectHtml);
        if (match) {
            selectedValue = match[1]; // O texto do option selecionado
        }
    }

    return {
        html: selectHtml, // O HTML do select com o option marcado
        selectedText: selectedValue // O texto do option selecionado
    };
}


function RenderSourceTable() {


    addNewRecords()

    var lazyLoadThreshold = 1000; // Tamanho do limite para o carregamento lento

    if (GRenderedLinhas.length > lazyLoadThreshold) {


        GTableData.lazyLoad = true;
        GTableData.lazyLoadRendering()

    } else {

        var tableHtml = generateTableV2(GTableData);
        $(".sourceTabletableContainer").append(tableHtml);

    }






    modoEcraHandler()
    registerClickGravar()

    handleCellEvents()
    handleTotais();
    GTableData.handleUI({});
    GTableData.generateTableButtons();
    mainSpinner("hide")
    GCellObjectsConfig = GCellObjectsConfig.concat(TMPCellObjectCOnfig);



}

function generateTableStructure(table) {
    var html = "<table";

    if (table.tableId) html += " id='" + table.tableId + "'";
    if (table.classes) html += " class='" + table.classes + "'";
    if (table.style) html += " style='" + table.style + "'";
    if (table.customData) html += " data-custom='" + table.customData + "'";

    html += ">";

    // Cabeçalho
    if (table.header && table.header.rows) {
        html += "<thead>";
        table.header.rows.forEach(function (headerRow) {
            html += "<tr";

            if (headerRow.rowId) html += " id='" + headerRow.rowId + "'";
            if (headerRow.classes) html += " class='" + headerRow.classes + "'";
            if (headerRow.style) html += " style='" + headerRow.style + "'";
            if (headerRow.customData) html += " data-custom='" + headerRow.customData + "'";

            html += ">";

            headerRow.cols.forEach(function (col) {
                html += "<th";

                if (col.colId) html += " id='" + col.colId + "'";
                if (col.classes) html += " class='" + col.classes + "'";
                if (col.style) html += " style='" + col.style + "'";
                if (col.customData) html += " data-custom='" + col.customData + "'";

                html += ">" + col.content + "</th>";
            });

            html += "</tr>";
        });
        html += "</thead>";
    }


    html += "<tbody   id='table-body'";
    if (table.body && table.body.customData)
        html += " data-custom='" + table.body.customData + "'";
    html += "></tbody>";

    html += "</table>";

    return html;
}




function handleCellEvents() {

    if (GTableData.lazyLoad == true) {
        return
    }

    var celulas = GCellObjectsConfig.filter(function (cellObj) { return cellObj.events.length > 0 });


    celulas.forEach(function (cellObjectConfig) {

        cellObjectConfig.executeChangeEvents()
    })

}

function handleTotais() {
    if (GReportConfig.relatorio.totalcoluna) {

        GRenderedLinhas.forEach(function (linha) {

            linha.actualizarTotalLinha();
        })
    }

    calcularSubtotais();
    if (GReportConfig.relatorio.totalrelatorio) {

        GTableData.calcularTotalRelatorio();

    }
}


function getRenderedLinhas(records) {


    var renderedLinhas = [new RenderedLinha({})];
    renderedLinhas = [];
    var notExistLinhas = [new Linha({})]
    notExistLinhas = []
    novasLinhas = [];

    var contadorIteraccoes = 0;
    var mapping = getMappingByKey("renderConfig");
    var grupoMap = mapping.find(function (smap) {
        return smap.component == "Grupo"
    });

    var subGrupoMap = mapping.find(function (smap) {
        return smap.component == "Subgrupo"
    });

    var singularMap = mapping.find(function (smap) {
        return smap.component == "Singular"
    });

    var gruposDistinct = getDistinctWithKeys(records, grupoMap.mapData.gruporowid);


    var linhaModelo = GReportConfig.linhas.filter(function (linha) {

        return linha.tipo == "Singular"
    });

    linhaModelo.forEach(function (linhModelo) {

        var recordData = records.find(function (record) {

            return record[singularMap.mapData.codigolinha] == linhModelo.codigo
        });


        if (recordData) {

            var linhaRecords = records.filter(function (record) {
                return record[singularMap.mapData.codigolinha] == linhModelo.codigo
            }
            );

            var distinctRowIds = _.uniqBy(linhaRecords, singularMap.mapData.rowid);

            distinctRowIds.sort(function (a, b) {
                return (a.ordem || 0) - (b.ordem || 0);
            });


            distinctRowIds.forEach(function (distinctRow) {

                var linhasFilhas = linhaRecords.filter(function (rec) {
                    return rec.linkid == distinctRow[singularMap.mapData.rowid]
                }
                );

                setSingularLinha(distinctRow, linhaRecords, linhModelo, singularMap, renderedLinhas, linhasFilhas.length > 0);



                var distinctRowFilhas = _.uniqBy(linhasFilhas, singularMap.mapData.rowid);

                distinctRowFilhas.forEach(function (filha) {

                    setSingularLinha(filha, linhaRecords, linhModelo, singularMap, renderedLinhas, false);
                });



            });


        }
        else {

            var linha = new Linha(linhModelo);
            var rendered = new RenderedLinha({ novoregisto: true, rowid: generateUUID(), linkid: "", parentid: "", config: linha });
            rendered.addToLocalRenderedLinhasList([], "", {}, false);
            renderedLinhas.push(rendered)
        }

    })



    gruposDistinct.forEach(function (grupo) {

        var linhasGrupo = records.filter(function (item) {
            return item[grupoMap.mapData.gruporowid] == grupo[grupoMap.mapData.gruporowid]
        });
        var codigoGrupo = grupo[grupoMap.mapData.codigogrupo];

        var linhaGrupoConfig = GReportConfig.linhas.find(function (linhaConfig) {

            return linhaConfig['codigo'] == codigoGrupo
        });

        if (linhaGrupoConfig) {

            var configLinhaGrupo = new Linha(linhaGrupoConfig);
            var rendered = new RenderedLinha({ novoregisto: false, rowid: grupo[grupoMap.mapData.gruporowid], linkid: "", parentid: "", config: configLinhaGrupo })
            rendered.addToLocalRenderedLinhasList(linhasGrupo, grupo, grupoMap, true);
            renderedLinhas.push(rendered)
        }

        var distinctSubgrupos = linhasGrupo.filter(function (item, index, self) {
            return self.findIndex(function (other) {
                return other[subGrupoMap.mapData.subrowid] === item[subGrupoMap.mapData.subrowid] && other[subGrupoMap.mapData.subrowid] != "";
            }) === index;
        });


        distinctSubgrupos.forEach(function (subGrupo) {

            var codigoSubgrupo = subGrupo[subGrupoMap.mapData.codigosubgrupo];

            var linhaSubgrupoConfig = GReportConfig.linhas.find(function (linhaConfig) {

                return linhaConfig['codigo'] == codigoSubgrupo
            });

            var subGrupoRecords = linhasGrupo.filter(function (item) {
                return item[subGrupoMap.mapData.subrowid] == subGrupo[subGrupoMap.mapData.subrowid]
            });

            if (linhaSubgrupoConfig) {

                var configLinhaSubgrupo = new Linha(linhaSubgrupoConfig);
                var rendered = new RenderedLinha({ novoregisto: false, linkdescricao: grupo[grupoMap.mapData.descricao], linkcodigo: grupo[grupoMap.mapData.codigogrupo], rowid: subGrupo[subGrupoMap.mapData.subrowid], linkid: grupo[grupoMap.mapData.gruporowid], parentid: "", config: configLinhaSubgrupo })
                renderedLinhas.push(rendered)
                rendered.addToLocalRenderedLinhasList(subGrupoRecords, subGrupo, subGrupoMap, true);

            }

        });


    })





    GReportConfig.linhas.map(function (linha) {

        var config = new Linha(linha);

        var linhaExists = renderedLinhas.find(function (linhaExist) {

            return linhaExist.config.codigo == config.codigo
        });

        if (!linhaExists) {

            notExistLinhas.push(config)
        }

    });


    var notExistsGrupo = notExistLinhas.filter(function (linha) {

        return linha.tipo == "Grupo"
    })

    notExistsGrupo.forEach(function (grupo) {

        var gruporowid = generateUUID();

        var rendered = new RenderedLinha({ novoregisto: true, rowid: gruporowid, linkid: "", parentid: "", config: grupo })
        rendered.addToLocalRenderedLinhasList([], grupoMap, true);
        renderedLinhas.push(rendered);



        var subgrupos = notExistLinhas.filter(function (linha) {

            return linha.linkstamp == grupo.linhastamp;
        });



        subgrupos.forEach(function (subgrupo) {

            var subgruporowid = generateUUID();
            var rendered = new RenderedLinha({ novoregisto: true, rowid: subgruporowid, linkcodigo: grupo.codigo, linkdescricao: grupo.descricao, linkid: gruporowid, parentid: "", config: subgrupo })
            rendered.addToLocalRenderedLinhasList([], subGrupoMap, true);
            renderedLinhas.push(rendered)

        });



    })



    return renderedLinhas;

}



function setSingularLinha(distinctRow, linhaRecords, linhModelo, singularMap, renderedLinhas, isParent) {

    var linhaAdicionada = GRenderedLinhas.find(function (linha) {
        return linha.rowid == distinctRow[singularMap.mapData.rowid]
    });

    if (linhaAdicionada) {

        return;
    }

    var linha = new Linha(linhModelo);
    var rendered = new RenderedLinha({ novoregisto: false, isParent: isParent, rowid: distinctRow[singularMap.mapData.rowid], linkid: distinctRow.linkid, parentid: "", config: linha })
    renderedLinhas.push(rendered);

    var recFlt = linhaRecords.filter(function (rec) {
        return rec[singularMap.mapData.rowid] == distinctRow[singularMap.mapData.rowid]
    }
    );
    rendered.addToLocalRenderedLinhasList(recFlt, distinctRow, singularMap, true);
}

function RenderHandler(records) {


    GDB["UI"].toArray().then(function (cachedData) {
        if (cachedData.length > 0) {

            console.log("Cached data found, using it to render the table.", cachedData);
            var cacheUI = new CachedUI(cachedData[0]);
            cacheUI.fillAndRender();
            mainSpinner("hide")

        } else {

            ViewRender(records)
        }
    }).catch(function (err) {
        console.error("Error fetching data On RenderHandler:", err);
    });

}

function ViewRender(records) {


    initTableDataAndContainer();

    GRenderedColunas = setColunasRender(GReportConfig.colunas);
    setCabecalhos(records);
    var renderedLinhas = getRenderedLinhas(records);

    GRenderedLinhas = renderedLinhas

    /*
    var linhasGrupo = GRenderedLinhas.filter(function (linhaGrupo) {

        return linhaGrupo.config.tipo == "Grupo"
    });

    linhasGrupo.sort(function (a, b) {
        return a.config.ordem - b.config.ordem;
    });

    linhasGrupo.forEach(function (grupo) {

        setLinha(grupo, "", records);

    });
    */

    var linhasModelo = GRenderedLinhas.filter(function (linha) {

        return linha.config.tipo == "Singular"
    });

    var linhaCont = 0;


    if (GReportConfig.relatorio.totalrelatorio) {


        var renderedLinhaTotalRelatorio = setLinhaRenderTotal({ codigo: "TOTALRELATORIO", descricao: "Total do relatório", cor: "#033076", linkid: "", rowid: "TOTALRELATORIOROWID" });
        renderedLinhaTotalRelatorio.addToLocalRenderedLinhasList([], "", {}, false);

        setLinha(renderedLinhaTotalRelatorio, "", [])
    }


    RenderSourceTable();

}


function getCellObjectConfigByCellId(cellId) {

    return GCellObjectsConfig.find(function (obj) {
        return obj.cellid == cellId
    });
}


function handleDataType(dataType, value) {

    switch (dataType) {
        case "digit":

            return inputToNumber(value ? value.toString() : 0);

        default:
            return value
    }
}

function handleDataTypeDB(dataType, value) {

    switch (dataType) {
        case "digit":

            return inputToNumberDB(value ? value.toString() : 0);

        default:
            return value
    }
}

function buildChangedObjectUpdateData(htmlComponent, cellObjectConfigPar, val) {

    var cellObjectConfig = cellObjectConfigPar;
    var updateData = new UpdateData({});


    updateData.sourceKey = cellObjectConfig.bindData.sourceKey;
    updateData.sourceValue = cellObjectConfig.cellid;

    updateData.changedData[cellObjectConfig.bindData.sourceBind] = handleDataTypeDB(cellObjectConfig.dataType,val);

    cellObjectConfig.bindData.extras.forEach(function (extra) {

        var extraBindData = new ExtraBindData(extra);

        switch (extraBindData.sourceRef) {

            case "option":
                updateData.changedData[extraBindData.sourceBind] = handleDataType(cellObjectConfig.dataType, htmlComponent.find("option:selected").text());
                break;

            default:

                break;
        }

    })

    return updateData;



}
function registerMrendListeners() {

    $(document).off("change keyup  paste", ".source-bind-table-control").on("change keyup paste", ".source-bind-table-control", function (event) {

        /*
              var selfInp = $(this);
              var componentId = $(selfInp).attr("id");
              var cellObjectConfig = getCellObjectConfigByCellId(componentId);
              if (!cellObjectConfig) {
                  return
              }
      
            
              var configColuna=cellObjectConfig.getColunaConfig();
              if(configColuna.config.tipo == "digit"){
                  var valur=handleDataType(configColuna.config.tipo, selfInp.val());
                  var uiValue=handleUIValue(cellObjectConfig,valur)
                  $(selfInp).val(uiValue)
              }
                  */
        /*


       

        

        if (!cellObjectConfig) {
            throw new Error("COMPONENTE " + componentId + " NÃO ENCONTRADO")
        }*/


    });

    $(document).off("change", ".reactive-select-mrend").on("change", ".reactive-select-mrend", function (event) {

        var selfInp = $(this);


        var componentId = $(selfInp).attr("id");
        var cellObjectConfig = getCellObjectConfigByCellId(componentId);

        if (!cellObjectConfig) {
            throw new Error("COMPONENTE " + componentId + " NÃO ENCONTRADO")
        }

        cellObjectConfig.syncReactive(selfInp);

    })

    $(document).on('keydown', '.sourced-table input', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita o comportamento padrão

            var inputs = $('.sourced-table input:visible'); // Seleciona apenas os inputs visíveis na tabela
            var index = inputs.index(this); // Obtém o índice do input atual

            if (index !== -1 && index + 1 < inputs.length) {
                inputs.eq(index + 1).focus(); // Move o foco para o próximo input
            }
        }
    });

    $(document).off("click", ".removeTableRow").on("click", ".removeTableRow", function () {

        var rowId = $(this).closest("tr").attr("id");
        var row = GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowId
        });

        if (row) {

            row.deleteRow();
        }


    })

    $(document).off("click", ".addFilho").on("click", ".addFilho", function () {
        var rowId = $(this).closest("tr").attr("id");
        var linha = GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowId
        });

        if (linha) {

            linha.addLinhaFilha();
            $('#' + GTableData.tableId).simpleTreeTable();
        }

        //console.log("row", row)

    })
}


$(document).ready(function () {

    registerMrendListeners();


})




function initTreeForTable(tableSelector) {
    var $table = $(tableSelector);

    // Memoriza quais IDs estão expandidos
    var expandedIds = new Set();
    $table.find('.tree-toggle.fa-angle-down').each(function () {
        var $row = $(this).closest('tr');
        var id = $row.data('id');
        if (id) expandedIds.add(id);
    });

    // Remove ícones antigos de expansão, mantendo o conteúdo
    $table.find('.tree-toggle').remove();

    // Prepara e oculta filhos
    $table.find('tbody tr').each(function () {
        var $tr = $(this);
        var parentId = $tr.data('parent-id');
        if (parentId) {
            $tr.hide().addClass('child-row');
        } else {
            $tr.removeClass('child-row').show();
        }

        var hasChildren = $table.find('tr[data-parent-id="' + $tr.data("id") + '"]').length > 0;
        var icon = hasChildren
            ? '<i class="tree-toggle fa fa-angle-right" style="cursor: pointer;color:#626e78; font-size: 20px; font-weight: bold; margin-right: 8px;"></i>'
            : '<span style="display: inline-block; width: 20px; margin-right: 8px;"></span>';

        var $actionZone = $tr.find('.container-action-zone');
        if ($actionZone.length > 0 && $actionZone.find('.tree-toggle, .empty-toggle').length === 0) {
            $actionZone.prepend(icon);
        }
    });

    // Calcula profundidade (indentação)
    $table.find('tbody tr').each(function () {
        var depth = 0;
        var current = $(this);
        while (current.data("parent-id")) {
            depth++;
            current = $table.find('tr[data-id="' + current.data("parent-id") + '"]');
        }

        // Aplica padding diretamente à action-zone ou linha
        var $actionZone = $(this).find('.container-action-zone');
        if ($actionZone.length > 0) {
            $actionZone.css('padding-left', (depth * 32) + 'px');
        } else {
            $(this).css("padding-left", (depth * 32) + "px");
        }
    });

    // Comportamento de expandir/colapsar
    $table.find('.tree-toggle').off('click').on('click', function (e) {
        e.stopPropagation();
        var $icon = $(this);
        var $row = $icon.closest('tr');
        var id = $row.data('id');
        var isExpanded = $icon.hasClass('fa-angle-down');

        $icon.toggleClass('fa-angle-right fa-angle-down');
        toggleChildren(id, !isExpanded, $table);
    });

    function toggleChildren(parentId, show, $table) {
        $table.find('tr[data-parent-id="' + parentId + '"]').each(function () {
            var $child = $(this);
            $child.toggle(show);
            if (!show) {
                $child.find(".tree-toggle").removeClass("fa-angle-down").addClass("fa-angle-right");
                toggleChildren($child.data("id"), false, $table);
            }
        });
    }

    // Restaura estado expandido
    expandedIds.forEach(function (id) {
        var $row = $table.find('tr[data-id="' + id + '"]');
        $row.find(".tree-toggle").removeClass("fa-angle-right").addClass("fa-angle-down");
        toggleChildren(id, true, $table);
    });
}



function registerClickGravar() {

    if (GCellObjectsConfig.length > 0 || GTmpListTableObject.length > 0) {
        setTimeout(function () {

            $("#BUGRAVARBottom").removeAttr("href")
        }, 1000)

        $(document).off("click", "#BUGRAVARBottom").on("click", "#BUGRAVARBottom", function () {
            console.log("BUGRAVARBottom clicked")
            db[GRenderData.tableSourceName].toArray().then(function (records) {

                var recordsToSave = [];
                if (GRenderData.dbTableToMrendObject.convert) {


                    recordsToSave = ConvertMrendObjectToTable(records)

                    console.log("recordsToSave", recordsToSave)

                    $("#registoJson").val(JSON.stringify(recordsToSave))
                    $("#registoJson").trigger("change")
                    WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$conteudo$options5$BUGRAVARBottom", "", true, "", "", false, true));

                    return

                }
                else {

                    $("#registoJson").val(JSON.stringify(records))
                    $("#registoJson").trigger("change")

                    WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$conteudo$options5$BUGRAVARBottom", "", true, "", "", false, true))

                }


            }).catch(function (err) {
                console.error("Error fetching records from database:", err);
            });

        })
    }



}



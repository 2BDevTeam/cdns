

function Mrend(options) {


    var mrendThis = this;

    this.GTable = {};
    this.GDefaultConfig = undefined;
    this.GRenderData = {};
    this.GReportConfig = new ReportConfig({});
    this.GRenderedData = undefined;
    this.GTableData = new TableHtml({});
    this.GRows = [];
    this.GRenderedColunas = [new RenderedColuna({})];
    this.GRenderedLinhas = [new RenderedLinha({})];
    this.colunaTmpSetup = new RenderedColuna({}); // Variável temporária para armazenar a coluna que está sendo configurada
    this.GGridData = []
    this.GContainerToRender = "#campos > .row:last";
    this.GTMPFilhas = [];
    this.GRenderedLinhas = [];
    this.GRenderedColunas = [];
    this.GBatchSize = 30;
    this.GCurrentIndex = 0;
    this.GTotalData = 0;
    this.GCellObjectsConfig = [new CellObjectConfig({ cellid: "DEFAULTCELL" })];
    this.GCellObjectsConfig = [];
    this.TMPCellObjectCOnfig = [];
    this.GTmpListTableObject = [];
    this.relatoriosNotReadonly = [];
    this.db = undefined;
    this.db = undefined;
    this.reactiveData = PetiteVue.reactive({
        customTotal: customTotal,
        // Pode adicionar outros totais aqui
        totalPcusto: 0,
        totalVenda: 0,
        totais: [
            { codigocoluna: 'pcusto', valor: 20000, label: 'Preço de Custo' },
            { codigocoluna: 'pvenda', valor: 45000, label: 'Valor Total de Venda' },
            { codigocoluna: 'u_txtrans2', valor: 0, label: 'Valor do Transporte' },
            { codigocoluna: 'u_taxamo', valor: 0, label: 'Valor das taxas aduaneiras' },
            { codigocoluna: 'u_moprg', valor: 0, label: 'Valor da mão de obra' },
            { codigocoluna: 'u_equipprc', valor: 0, label: 'Valor da comissão' }
        ]
    });

    this.refreshReactiveData = function () {
        //  return 
        mrendThis.reactiveData.cells = JSON.parse(JSON.stringify(mrendThis.GCellObjectsConfig));
    }

    this.GNewRecords = [];
    this.enableEdit = options.enableEdit || false;
    this.resetSourceStamp = options.resetSourceStamp || false;
    this.datasourceName = options.datasourceName || "";
    this.schemas = Array.isArray(options.schemas) ? options.schemas.map(function (s) { return new MrendSchema(s); }) : [];
    this.containerToRender = options.containerToRender || "";
    this.records = Array.isArray(options.records) ? options.records : [];
    this.tableSourceName = options.tableSourceName || "";
    this.table = options.table || "";
    this.codigo = options.codigo || "";
    this.dbTableToMrendObject = new DbTableToMrendObject(options.dbTableToMrendObject) ? new DbTableToMrendObject(options.dbTableToMrendObject) : {};
    this.recordData = options.recordData || {};
    this.scopeFunctions = options.scopeFunctions || {};
    this.reportConfig = options.reportConfig ? new ReportConfigWrapper(options.reportConfig) : {};
    this.remoteFetch = options.remoteFetch || false;
    this.remoteFetchData = options.remoteFetchData ? new RemoteFetchData(options.remoteFetchData) : new RemoteFetchData({});

    this.getTotalCelulasByFiltro = function (filtro) {
        _.sumBy(propostaMrendConfig.GCellObjectsConfig, function (cellObject) {
            if (eval(filtro)) {
                return isNaN(cellObject.valor) ? 0 : Number(cellObject.valor);
            }
            return 0;
        });
    }

    this.getTotalCelulaByCodigoColuna = function (codigoColuna) {

        return _.sumBy(propostaMrendConfig.GCellObjectsConfig, function (cellObject) {
            if (cellObject.codigocoluna == codigoColuna) {
                return isNaN(cellObject.valor) ? 0 : Number(cellObject.valor);
            }
            return 0;
        });
    }


    function RemoteFetchData(data) {

        this.url = data.url || "";
        this.type = data.type || "GET";
        this.data = data.data || {};
    }

    // Classe para schemas
    function MrendSchema(data) {
        this.datasourceName = data.datasourceName || "";
        this.tableSourceName = data.tableSourceName || "";
        this.tableSourceSchema = data.tableSourceSchema || {};
    }

    // Classe para dbTableToMrendObject
    function DbTableToMrendObject(data) {
        this.defaultColumnName = data.defaultColumnName || "";
        this.chunkMapping = data.chunkMapping || false;
        this.table = data.table || "";
        this.dbName = data.dbName || "MrendDb" + this.table;
        this.tableKey = data.tableKey || "";
        this.extras = data.extras ? new DbTableExtras(data.extras) : {};
    }

    // Classe para extras de dbTableToMrendObject

    function DbTableExtras(data) {
        this.ordemField = data.ordemField || "";
        this.linkField = data.linkField || "";
        this.cellIdField = data.cellIdField || "";
        this.colunaField = data.colunaField || "";
        this.linhaField = data.linhaField || "";
        this.rowIdField = data.rowIdField || "";
        this.descLinhaField = data.descLinhaField || "";
        this.descColunaField = data.descColunaField || "";
        this.ordemColunaField = data.ordemColunaField || "";
        this.tipocolField = data.tipocolField || "";

    }

    // Classe para reportConfig
    function ReportConfigWrapper(data) {
        this.config = new MrendConfigData(data) || new MrendConfigData({ celulas: [], linhas: [], colunas: [], relatorio: {}, extra: {} }); // Default empty config
    }


    function MrendConfigData(data) {

        var config = data.config || {};
        this.celulas = Array.isArray(config.celulas) ? config.celulas.map(function (s) { return new Celula(s); }) : [];
        this.linhas = Array.isArray(config.linhas) ? config.linhas.map(function (s) { return new Linha(s); }) : [];
        this.colunas = Array.isArray(config.colunas) ? config.colunas.map(function (s) { return new Coluna(s); }) : [];
        this.extra = data.extra || {};


        this.relatorio = config.relatorio ? new Relatorio(config.relatorio) : {};
        var self = this;

        var linhasModelo = self.linhas.filter(function (linha) {
            return linha.modelo == true
        }).map(function (linha) {
            self.relatorio.modelos.push(linha.codigo);
        });


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
        this.linkid = data.linkId || "";
        this.linkField = data.linkField || "";
        this.codigolinha = data.codigolinha || "";
        this.ordemField = data.ordemField || "";
        this.descColuna = data.descColuna || "";
        this.descColunaField = data.descColunaField || "";
        this.cellIdField = data.cellIdField || "";
        this.rowIdField = data.rowIdField || "";
        this.colunaField = data.colunaField || "";
        this.linhaField = data.linhaField || "";
        this.ordemColunaField = data.ordemColunaField || "";
        this.ordemcoluna = data.ordemcoluna || 0;
        this.ordem = data.ordem || 0;
        this.tipocolField = data.tipocolField || "";
        this.tipocol = data.tipocol || "";

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
        this.eventoadd = data.eventoadd || false;
        this.eventoaddexpr = data.eventoaddexpr || "";
        this.eventodelete = data.eventodelete || false;
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
        this.leitura = data.leitura || false;
        this.executachange = data.executachange || false;
        this.expressaochangejs = data.expressaochangejs || "";
        this.cor = data.cor || "";
        this.estilopersonalizado = data.estilopersonalizado || false;
        this.expressaoestilopersonalizado = data.expressaoestilopersonalizado || "";
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
        this.temlinhadesc = data.temlinhadesc || false;
        this.colfunc = data.colfunc || false;
        this.eventoclique = data.eventoclique || false;
        this.expressaoclique = data.expressaoclique || "";
        this.ordem = data.ordem || 0;
        this.expressaotbjs = data.expressaotbjs || "";
        this.usaexpresstbjs = data.usaexpresstbjs || false;
        this.usaexpressrubdesc = data.usaexpressrubdesc || false;
        this.expressaojsrubdesc = data.expressaojsrubdesc || "";

        this.condicattr = data.condicattr || false;
        this.condicattrexpr = data.condicattrexpr || "";

        this.condictipo = data.condictipo || false;
        this.condicetipoxpr = data.condicetipoxpr || "";

        this.condicfunc = data.condicfunc || false;
        this.condicfuncexpr = data.condicfuncexpr || "";
        this.tamanho = data.tamanho || 150;
        this.alinhamento = data.alinhamento || "left";

        this.nometb = data.nometb || "";
        this.valtb = data.valtb || "";
        this.setinicio = data.setinicio || false;
        this.setfim = data.setfim || false;
        this.categoria = data.categoria || "default";
        this.modelo = data.modelo || false;
        this.descbtnModelo = data.descbtnModelo || "Adicionar coluna";
        this.addBtn = data.addBtn || false;
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
        this.condicinactivo = data.condicinactivo || false;
        this.condicinactexpr = data.condicinactexpr || "";
        this.desabilitado = data.desabilitado || false;
        this.usafnpren = data.usafnpren || false;
        this.atributo = data.atributo || null;
        this.fnpren = data.fnpren || "";
        this.bindData = new BindData(data.bindData ? data.bindData : {});
        this.fx = data.fx || "";
        this.temfx = data.temfx || false;
        this.localData = Array.isArray(data.localData) ? Array.from(data.localData) : [];
        this.fxdata = new FXData(data.fxdata ? data.fxdata : {});
        this.valordefeito = data.valordefeito || false;
        this.valordefeitoexpr = data.valordefeitoexpr || "";
        this.valdefafinstancia = data.valdefafinstancia || false;

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



                    if (mrendThis.reactiveData.global) {

                        var reactiveDataFound = mrendThis.reactiveData.cells.find(function (cellObject) {
                            return cellObject.cellid == self.cellid;
                        });

                        if (reactiveDataFound) {
                            reactiveDataFound.valor = newValue;

                        }

                    }





                    //mrendThis.reactiveData.global.GCellObjectsConfig[0].valor = 78999

                    syncChangesToDB(this, handleDataTypeDB(this.dataType, newValue)).then(function () {
                        try {

                        } catch (error) {
                            //console.log(("Error focusing next input:", error);
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
            //console.log(("syncChangesToDB - changedb is false, skipping mrendThis.db update");
            return
        }
        var htmlComponent = getCellHtmlComponent(cellObject.cellid);
        var varlorF = valor == "Infinity" || valor == "-Infinity" || valor == Infinity ? 0 : valor;


        var buildChangeResult = buildChangedObjectUpdateData(htmlComponent, cellObject, varlorF);


        var table = mrendThis.tableSourceName;
        return updateCellOnDB(buildChangeResult, table).then(function (updateResult) {


        }).catch(function (err) {
            //console.log(("ERR", err)
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

        /* var codColuna = this.codigocoluna
         var dadosColuna = mrendThis.GRenderedColunas.find(function (coluna) {
             return coluna.codigocoluna == codColuna
         });
 
         if (this.tipolistagem == "EXPR") {
             eval(this.expressao)
             return
         }
 
         if (this.tipolistagem == "PROPREG") {
 
             var tmpcomponentcategoria = this.componentcategoria
             var linhaTipoFiltered = mrendThis.reportConfig.config.linhas.filter(function (linhaGrupo) {
 
                 return linhaGrupo.tipo == tmpcomponentcategoria
             });
             mrendThis.GTmpListTableObject = linhaTipoFiltered
             return
         }
 
 
 
 
         if (dadosColuna.config.usaexpresstbjs) {
             eval(dadosColuna.config.expressaotbjs)
         }
         return*/


    };

    CellObjectConfig.prototype.getColunaConfig = function () {

        var celulaConfig = this
        return mrendThis.GRenderedColunas.find(function (coluna) {

            return coluna.codigocoluna == celulaConfig.codigocoluna
        })

    };


    CellObjectConfig.prototype.getCelulaConfig = function () {

        var celulaConfig = this;
        var celulaFound = mrendThis.reportConfig.config.celulas.find(function (celula) {

            return celula.linhastamp == celulaConfig.renderelinha.config.linhastamp && celula.codigocoluna == celulaConfig.codigocoluna
        });

        return celulaFound ? new Celula(celulaFound) : new Celula({})

    };



    CellObjectConfig.prototype.getColsRefered = function () {

        var celulaConfig = this;

        var celula = celulaConfig.getCelulaConfig();
        var coluna = celulaConfig.getColunaConfig();

        return mrendThis.GRenderedColunas.filter(function (colRef) {

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

        var linhasComTotais = mrendThis.GRenderedLinhas.filter(function (linha) {

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



    }



    CellObjectConfig.prototype.executeChangeEvents = function (htmlComponent) {

        var cellObject = this
        this.events.forEach(function (event) {

            eval(event)

        })


    }

    CellObjectConfig.prototype.calcularTotalLinha = function () {

        if (this.dataType != "digit" && mrendThis.reportConfig.config.relatorio.totalcoluna) {

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

            return mrendThis.db[tableName]
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

        //console.log(("Showing All", this)

    };

    CellObjectConfig.prototype.addToLocalCellList = function () {


        mrendThis.GCellObjectsConfig.unshift(this);

    }




    function UpdateData(data) {
        this.sourceKey = data.sourceKey || null;
        this.sourceValue = data.sourceValue || null;
        this.changedData = data.changedData || {};
    }
    function generateLinhaOrdem() {


        var maxOrdemLinha = (mrendThis.GRenderedLinhas || []).reduce(function (max, linha) {
            return Math.max(max, linha.ordem || 0);
        }, 0);

        if (maxOrdemLinha == 0) {
            return 1000;
        }

        return maxOrdemLinha + 1;
    }


    function RenderedLinha(data) {
        this.index = generateLinhaOrdem();
        this.linkid = data.linkid || "";
        this.codigo = data.codigo || "";
        this.rowid = data.rowid || "";
        this.isParent = data.isParent || false;
        this.linkcodigo = data.linkcodigo || "";
        this.linkdescricao = data.linkdescricao || ""
        this.UIObject = data.UIObject || {};

        this.eventodeleteexpr = data.eventodeleteexpr || "";
        this.ordem = data.ordem || (generateLinhaOrdem());
        this.parentid = data.parentid || "";
        this.novoregisto = data.novoregisto
        this.config = new Linha(data.config || new Linha({}));
        var cod = data.codigo || "";
        this.isInstance = cod.includes("___") ? true : false;

    }


    RenderedLinha.prototype.addLinhaFilha = function () {

        var codigoLinha = this.config.codigo + "___" + generateTimestampNumber(10);
        var ordem = generateLinhaOrdem();
        var renderedLinha = new RenderedLinha({ ordem: ordem, codigo: codigoLinha, novoregisto: true, rowid: generateUUID(), linkid: this.rowid, parentid: "", config: this.config });

        renderedLinha.UIObject = {
            id: renderedLinha.rowid,
            rowid: renderedLinha.rowid
            //_children: []
        };

        renderedLinha.addToLocalRenderedLinhasList([], "", {}, false, false);

        this.isParent = true;
        addNewRecords();

        return renderedLinha;



    }


    RenderedLinha.prototype.deleteRow = function () {
        var tableName = mrendThis.tableSourceName; // Nome da tabela no Dexie
        var rowId = this.rowid; // ID da linha a ser removida
        var thisRow = this;



        return new Promise(function (resolve, reject) {
            mrendThis.db[tableName]
                .where("rowid") // Filtra os registros pelo campo "rowid"
                .equals(rowId) // Verifica se o valor de "rowid" é igual ao da linha atual
                .delete() // Remove os registros correspondentes
                .then(function () {
                    // Remove a linha da lista local de linhas renderizadas

                    mrendThis.GCellObjectsConfig = mrendThis.GCellObjectsConfig.filter(function (cellObject) {
                        return cellObject.rowid != rowId
                    });

                    mrendThis.GRenderedLinhas = mrendThis.GRenderedLinhas.filter(function (linha) {
                        return linha.rowid != rowId
                    })

                    mrendThis.refreshReactiveData();

                    resolve("Linha removida com sucesso.");
                })
                .catch(function (err) {
                    reject("Erro ao remover a linha: " + err);
                });
        });
    };


    RenderedLinha.prototype.getParent = function () {
        var self = this;
        var parentLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == self.linkid;
        }, this);
        return parentLinha || null;
    }

    // ...existing code...

    RenderedLinha.prototype.getChildren = function () {
        var self = this;

        return mrendThis.GRenderedLinhas.filter(function (obj) {

            return obj.linkid == self.rowid
        })
    };

    // ...existing code...





    RenderedLinha.prototype.addToLocalRenderedLinhasList = function (linhaRecords, distinctRow, renderCelula, setChildren) {



        mrendThis.GRenderedLinhas.push(this);

        if (renderCelula) {
            var recFlt = linhaRecords.filter(function (rec) {
                return rec.rowid == distinctRow.rowid
            }
            );
            setLinha(this, "", recFlt);

            var self = this;
            if (this.linkid && setChildren == true) {


                var parentLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid.trim() == self.linkid.trim()
                });


                if (parentLinha) {

                    parentLinha.UIObject._children = parentLinha.UIObject._children || [];


                    parentLinha.UIObject._children.push(this.UIObject);

                    parentLinha.UIObject._children.sort(function (a, b) {

                        var renderedLinhaA = mrendThis.GRenderedLinhas.find(function (linha) {
                            return linha.rowid == a.rowid;
                        });

                        var renderedLinhaB = mrendThis.GRenderedLinhas.find(function (linha) {
                            return linha.rowid == b.rowid;
                        });


                        var ordemA = renderedLinhaA ? (renderedLinhaA.ordem || 0) : 0;
                        var ordemB = renderedLinhaB ? (renderedLinhaB.ordem || 0) : 0;

                        return ordemA - ordemB;
                    });

                }



            }
        }




    }

    var getLinhaById = function (id) {

        return mrendThis.GRenderedLinhas.find(function (linha) {

            return linha.rowid == id;
        });


    }

    var getColunaByCodigo = function (codigo) {

        return mrendThis.GRenderedColunas.find(function (coluna) {

            return coluna.codigocoluna == codigo
        })
    }


    RenderedLinha.prototype.getLinhaSubtotal = function () {

        var linhaRendered = this

        return mrendThis.GRenderedLinhas.find(function (linhaSubtotal) {

            return linhaSubtotal.linkid == linhaRendered.rowid && linhaSubtotal.config.codigo == "SUBTOTALINHA"
        })

    }
    RenderedLinha.prototype.actualizarTotaisColunasLinha = function () {


        var linhaSubtotal = this.getLinhaSubtotal();
        var renderedLinha = this



        if (linhaSubtotal) {

            var celulasLinha = linhaSubtotal.getLinhaCellObjects();


            mrendThis.GRenderedColunas.map(function (renderedColuna) {

                if (renderedColuna.config.tipo == "digit") {
                    totalColuna = renderedColuna.getTotalRenderedColuna("cellObject.linkid=='" + renderedLinha.rowid + "' && cellObject.unionkey.includes('SUBTOTAL')==false ");

                    var celulaSubtotal = celulasLinha.find(function (celula) {
                        return celula.codigocoluna == renderedColuna.codigocoluna && celula.categoria == "total"
                    });


                    if (celulaSubtotal) {

                        celulaSubtotal.setValue(totalColuna, false)
                    }
                }



            });

        }





    }

    RenderedLinha.prototype.getLinhaCellObjects = function () {


        var renderedLinha = this;
        var totalLinha = 0;
        return mrendThis.GCellObjectsConfig.filter(function (cellObject) {

            return cellObject.rowid == renderedLinha.rowid
        })


    }

    RenderedLinha.prototype.getCelulaLinha = function (coluna) {


        var renderedLinha = this;

        var celulasLinha = this.getLinhaCellObjects();
        return celulasLinha.find(function (cellObject) {

            return cellObject.codigocoluna == coluna && cellObject.rowid == renderedLinha.rowid
        });


    }





    RenderedLinha.prototype.findCelulaTotal = function () {

        var renderedLinha = this;

        return mrendThis.GCellObjectsConfig.find(function (cellObject) {

            return cellObject.rowid == renderedLinha.rowid && cellObject.categoria == "total"
        })


    }

    RenderedLinha.prototype.getTotalLinha = function () {


        return getTotalCelulasByFiltro("cellObject.rowid == '" + this.rowid + "' & cellObject.dataType == 'digit' && cellObject.categoria!='total'");
    }

    RenderedLinha.prototype.actualizarTotalLinha = function () {

        var celulaTotal = this.findCelulaTotal();
        var totLinha = this.getTotalLinha();
        if (celulaTotal) {

            celulaTotal.setValue(totLinha, true);
        }


    }



    function getTotalCelulasByFiltro(filtro) {

        return _.sumBy(mrendThis.GCellObjectsConfig, function (cellObject) {
            if (eval(filtro)) {
                return isNaN(cellObject.valor) ? 0 : Number(cellObject.valor);
            }
            return 0;
        });



    }



    function getCelulasByFiltro(filtro) {



        return mrendThis.GCellObjectsConfig.filter(function (cellObject) {

            return eval(filtro)
        })



    }



    function setValueOnCell(celulaId, valorUpdt) {
        var celulaCOnfigClone = mrendThis.GCellObjectsConfig.slice()


        celulaCOnfigClone.forEach(function (celulaCloneObj) {

            if (celulaCloneObj.cellid == celulaId && celulaCloneObj.categoria == "total") {
                celulaCloneObj.valor = 0;
                celulaCloneObj.valor = valorUpdt;

                $("#" + celulaCloneObj.cellid).val(formatInputValue(parseFloat(valorUpdt).toFixed(2)));

            }

            new CellObjectConfig(celulaCloneObj)
        });

        mrendThis.GCellObjectsConfig = celulaCOnfigClone.slice()




    }

    this.setNewRenderedColuna = function (data) {

        var renderedColuna = new RenderedColuna(data);
        return renderedColuna;

    }
    function RenderedColuna(data) {

        var configColuna = new Coluna(data.config || {});

        if (configColuna.modelo === true
            && data.codigocoluna &&
            data.codigocoluna !== configColuna.codigocoluna
            &&
            !String(data.codigocoluna).includes(configColuna.codigocoluna + "___")
        ) {
            this.codigocoluna = configColuna.codigocoluna + "___" + data.codigocoluna;
        }
        else {
            this.codigocoluna = data.codigocoluna || "";
        }

        this.desccoluna = data.desccoluna || "";
        this.config = new Coluna(data.config || {});
        this.tipolistagem = data.tipolistagem || "";
        this.ordem = data.ordem || 0;
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
            var linhaTipoFiltered = mrendThis.reportConfig.config.linhas.filter(function (linhaGrupo) {

                return linhaGrupo.tipo == tmpcomponentcategoria
            });
            mrendThis.GTmpListTableObject = linhaTipoFiltered
            return
        }




        if (this.config.usaexpresstbjs) {
            try {

                this.localData = eval(this.config.expressaotbjs);
            } catch (error) {

            }
        }
        return


    };


    RenderedColuna.prototype.preGenHtml = function () {

        if (this.config.tipo == "table") {

            this.fillTableData();

            var campooption = this.config.nometb
            var campovalor = this.config.valtb

            var selectHtml = generateSelect([], "form-control source-bind-table-control  table-select", "", " id=" + "[selectId]" + " source-key='" + this.config.bindData.sourceKey + "' source-bind='" + this.config.bindData.sourceBind + "' ", campooption, campovalor)

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
        this.estilopersonalizado = data.estilopersonalizado || {};
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


    function getMapConfigByComponent(renderConfig, component) {

        return renderConfig.mapping.find(function (obj) {

            return obj.component == component
        })
    }


    function getMappingByKey(key) {

        return mrendThis[key].mapping
    }


    function setLinhaRender(linha, linkid, parentid, records) {


        //No futuro se por exemplo for dito que o utilizador poderá apagar as linhas dos grupos e subgrupos . Para garantir que ao ter records (records.length>0) se liste exactamente o numero de grupos e subgrupos uma vez que podem ser apagados.
        //Deve se Filtrar o array que vai preencher os grupos e subgrupos se por acaso este não varar dos records ou seja : records.find(function (obj) return obj[mapConfig.mapData[config.bindData.sourceKey]] == config.codigo { if (linhaData) {}
        var config = new Linha(linha);

        var mapConfig = getMapConfigByComponent(mrendThis.renderConfig, config.tipo);
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
        renderedColunas = [];
        var renderedDynamicColunas = [];


        colunas.filter(function (dadosColuna) {

            return dadosColuna.modelo == false
        }).forEach(function (coluna) {

            var colunaRendered = new Coluna(coluna);
            var renderedColuna = new RenderedColuna({
                codigocoluna: coluna.codigocoluna,
                desccoluna: coluna.desccoluna,
                ordem: coluna.ordem,
                config: colunaRendered
            });
            renderedColuna.preGenHtml();
            renderedColunas.push(renderedColuna);

        });

        colunas.filter(function (dadosColunaModelo) {
            return dadosColunaModelo.modelo == true
        }).forEach(function (coluna) {


            var recordsColuna = records.filter(function (record) {
                return record.coluna.indexOf(coluna.codigocoluna.trim() + "___") > -1;
            });

            var distinctColunas = getDistinctWithKeys(recordsColuna, "coluna");
            distinctColunas.sort(function (a, b) {
                return a.ordemcoluna - b.ordemcoluna;
            });

            distinctColunas.forEach(function (distinctColuna) {
                var renderedColuna = new RenderedColuna({
                    codigocoluna: distinctColuna.coluna,
                    desccoluna: distinctColuna.descColuna,
                    ordem: distinctColuna.ordemColuna || 0,
                    config: coluna
                });

                renderedColuna.preGenHtml();
                renderedDynamicColunas.push(renderedColuna);

            })

        });



        renderedDynamicColunas.sort(function (a, b) {
            return a.ordem - b.ordem;
        });


        renderedColunas = renderedColunas.concat(renderedDynamicColunas);

        var colunasSetInicio = renderedColunas.filter(function (coluna) {
            return coluna.config.setinicio == true
        });

        var colunasSetFim = renderedColunas.filter(function (coluna) {
            return coluna.config.setfim == true
        });

        var colunasSemInicioFim = renderedColunas.filter(function (coluna) {
            return coluna.config.setinicio == false && coluna.config.setfim == false
        });

        var finalRenderedColunas = [];
        finalRenderedColunas = colunasSetInicio.concat(colunasSemInicioFim).concat(colunasSetFim);

        renderedColunas = finalRenderedColunas;
        return renderedColunas
    }




    function handleDefaultValueByDataType(dataType, valor) {

        switch (dataType) {
            case "digit":

                return isNaN(valor) || valor == null || isNumber(valor) == false ? 0 : valor;

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

    function freezyColunas() {
        $('.sourced-table th[data-fixacoluna=true]').each(function () {

            addFreezyColumnByHeader($(this))
            //////console.log(("sss") 
        })
    }

    function modoEcraHandler() {
        if ($("#mainPage").data("state") == "consultar") {
            $('.sourced-table').find('*').prop('disabled', true);
            $('.sourced-table select').prop('disabled', true);
            $(".source-table-options").hide()
            $(".action-zone button").hide()
        }


        addFreezyColumnByHeader($('.sourced-table th:nth-child(2)'))
        freezyColunas()
        addFreezingEvent()
    }

    function initSelect(component, changeStyle) {
        return;
        $(component).select2({
            width: "100%",
            allowClear: false
        })

        /* if (changeStyle) {
             $('.table .select2-selection.select2-selection--single, #maincontent .table input[type=text], #maincontent .table input[type="number"]').css({
                 'background-color': '#ffffff',
                 'border-radius': 'var(--border-radius-input)',
                 'border-bottom': '0'
             });
         }*/

    }


    function sourcedTableStyle() {
        $(".sourced-table input").css("text-align", "right")
        $(".sourced-table select").css("text-align", "right")
        $(".sourced-table th").css("text-align", "right")
        $(".sourced-table").css("text-align", "right")
        $(".sourced-table span").css("text-align", "right")

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

        // //console.log(("handleUIValue", cellObject.codigocoluna, value)
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

        var configColuna = mrendThis.GRenderedColunas.find(function (coluna) {
            return coluna.codigocoluna == cellObject.codigocoluna;
        });

        if (!configColuna) {
            // console.warn("Coluna não encontrada para o cellObject:", cellObject);
            return null;
        }

        return configColuna;

    }


    function formatAllTablesDigitInputs() {


        var elementsDate = document.querySelectorAll('input[data-type="date"]');

        // Convert the NodeList to an array and apply Cleave to each input element
        Array.from(elementsDate).forEach(function (element) {

            var cleave = new Cleave(element, {
                date: true,
                delimiter: ".",
                datePattern: ['d', 'm', 'Y']
            });
        })




        var elements = document.querySelectorAll('input[data-type="digit"]');


        sourcedTableStyle()

        if ($(".header-for-edit-col").length > 8) {

            $(".sourced-table .select2-container").css("width", "220px")

            $(".sourced-table input").css("width", "150px")
        }

        if ($(".sourced-table input").length < 8) {
            $(".sourced-table input").css("width", "100%")
        }

        if ($(".header-for-edit-col").length < 2) {
            // $(".sourced-table input").css("width", "100%")
            $(".header-for-edit-col").css("width", "16%")
            $(".sourced-table ").css("width", "67%")
        }
        // $(".sourced-table-date-field").datepicker()
        $(".sourced-table-date-field").datepicker({
            onSelect: function (dateText, date, inst) {

                // $(inst.el).css("background-color","red")
                $(inst.el).trigger('change');
            }
        });

        // $("tr[data-gruporowid] input[readonly]").css("background-color", "#dee5eb");
        $("tr[data-gruporowid] input[readonly]:not(.footer-row input)").css("background-color", "#dee5eb");



        $('#master-content').css('overflow-x', 'hidden');


    }


    function generateToolTipsForSourcedTable() {

        $('.sourced-table input, .sourced-table select').each(function () {
            var value = $(this).val();
            //  ////console.log((value);

            var toolTip = "<a href='#' data-toggle='tooltip' title='Hooray!'>Hover over me</a>"
            $(this).attr("data-toggle", "tooltip");
            //  $(this).attr("title", $(this).val());
            $(this).attr("data-original-title", $(this).val());

            // Perform any desired operations with the value here
        });

        $('[data-toggle="tooltip"]').tooltip();
    }


    function formatAllTablesDigitInputsMrend() {
        /*$('table input[data-type="digit"]').each(function () {
             var formattedValue = formatInputValue($(this).val());
             $(this).val(formattedValue);
         });*/

        var elements = document.querySelectorAll('input[data-type="digit"]');
        Array.from(elements).forEach(function (element) {


            var cleaveNumeral = new Cleave(element, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand',
                numeralDecimalScale: 2,
                numeralDecimalMark: '.',
                // numeralPositiveOnly: !configData.proibenegativo,
                delimiter: ' '
            });
        })

        var elementsDate = document.querySelectorAll('input[data-type="date"]');

        // Convert the NodeList to an array and apply Cleave to each input element
        Array.from(elementsDate).forEach(function (element) {

            var cleave = new Cleave(element, {
                date: true,
                delimiter: ".",
                datePattern: ['d', 'm', 'Y']
            });
        })






        Array.from(elements).forEach(function (element) {



            var cleaveNumeral = new Cleave(element, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand',
                numeralDecimalScale: 2,
                numeralDecimalMark: '.',
                // numeralPositiveOnly: !configData.proibenegativo,
                delimiter: ' '
            });
        })

        // Convert the NodeList to an array and apply Cleave to each input element



        $(".sourced-table input").css("text-align", "right")
        $(".sourced-table select").css("text-align", "right")
        // $(".sourced-table th").css("text-align", "right")
        $(".sourced-table").css("text-align", "right")
        $(".sourced-table span").css("text-align", "right")



        if ($(".header-for-edit-col").length > 8) {

            $(".sourced-table .select2-container").css("width", "220px")

            $(".sourced-table input").css("width", "150px")
        }

        if ($(".sourced-table input").length < 8) {
            $(".sourced-table input").css("width", "100%")
        }

        if ($(".header-for-edit-col").length < 2) {
            // $(".sourced-table input").css("width", "100%")
            $(".header-for-edit-col").css("width", "16%")
            $(".sourced-table ").css("width", "67%")
        }
        // $(".sourced-table-date-field").datepicker()
        $(".sourced-table-date-field").datepicker({
            onSelect: function (dateText, date, inst) {

                // $(inst.el).css("background-color","red")
                $(inst.el).trigger('change');
            }
        });

        // $("tr[data-gruporowid] input[readonly]").css("background-color", "#dee5eb");
        $("tr[data-gruporowid] input[readonly]:not(.footer-row input)").css("background-color", "#dee5eb");


        $('#master-content').css('overflow-x', 'hidden');


    }



    function addFreezingEvent() {
        $(".sourceTabletableContainer table tbody td:nth-child(3)").css({
            "position": "sticky",
            "left": "0",
            "z-index": "0"
        });
        $(".sourceTabletableContainer").off("scroll");
        $(".sourceTabletableContainer").on("scroll", function () {
            var scrollPos = $(this).scrollLeft();

            if (scrollPos > 0) {
                $('.freeze-header-first-element-item, .freeze-header-element-item, .freeze-first-element-item, .freeze-element-item')
                    .addClass("freeze-element")
                    .find('select, input').css({ 'z-index': 20, 'position': 'relative' });
            }

            if (scrollPos <= 78.18) {
                $('.freeze-header-first-element-item, .freeze-header-element-item, .freeze-first-element-item, .freeze-element-item')
                    .removeClass("freeze-element")
                    .find('select, input').css({ 'z-index': '', 'position': '' }); // Remove estilos quando não for necessário
            }
        });
    }




    function addFreezyColumnByHeader(thElement) {

        var index = thElement.index() + 1;

        var classtoAddForHeader = (index <= 2) ? "freeze-header-first-element-item" : "freeze-header-element-item";
        var classtoAddForBody = (index <= 2) ? "freeze-first-element-item" : "freeze-element-item";
        $(thElement).addClass(classtoAddForHeader);
        // $('.sourced-table td:nth-child(' + index + ')').addClass(classtoAddForBody);
        // Adiciona z-index 20 para selects e inputs dentro das células congeladas
        var $cells = $('.sourced-table td:nth-child(' + index + ')').addClass(classtoAddForBody);

        $cells.find('select, input').css('z-index', 20);
    }




    function ConvertMrendObjectToTable(records) {


        var distinctSources = getDistinctWithKeys(records, "sourceTable");



        var sources = []


        if (mrendThis.dbTableToMrendObject.chunkMapping == false) {


            distinctSources.forEach(function (source) {

                var tableData = []
                var sourceRecords = records.filter(function (record) {
                    return record.sourceTable == source.sourceTable;
                });


                sourceRecords.forEach(function (tableRow) {

                    mrendThis.GRenderedColunas.forEach(function (coluna) {


                        tableRow[coluna.config.campo] = handleDefaultValueByDataType(coluna.config.tipo, tableRow[coluna.config.campo]);
                        tableRow[source.linkField] = tableRow.linkid || "";


                        setIfSourceFieldExists(tableRow, source, "ordemField", source.ordemField, 0, tableRow, "ordem");
                        setIfSourceFieldExists(tableRow, source, "linhaField", source.linhaField, "", tableRow, "codigolinha");
                        setIfSourceFieldExists(tableRow, source, "descLinhaField", source.descLinhaField, "", tableRow, "descLinha");
                        setIfSourceFieldExists(tableRow, source, "descColunaField", source.descColunaField, "", tableRow, "descColuna");
                        setIfSourceFieldExists(tableRow, source, "ordemColunaField", source.ordemColunaField, 0, tableRow, "ordemColuna");
                        setIfSourceFieldExists(tableRow, source, "cellIdField", source.cellIdField, "", tableRow, "cellId");

                        setIfSourceFieldExists(tableRow, source, "colunaField", source.colunaField, "", tableRow, "coluna");
                        setIfSourceFieldExists(tableRow, source, "rowIdField", source.rowIdField, "", tableRow, "rowid");
                        setIfSourceFieldExists(tableRow, source, "tipocolField", source.tipocolField, "", tableRow, "tipocol");


                    });
                    tableData.push(tableRow)


                });

                sources.push({
                    sourceTable: source.sourceTable,
                    sourceKey: source.sourceKey,
                    records: tableData
                });


            });




            return sources;

        }



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

                    var colunaConfig = mrendThis.GRenderedColunas.find(function (coluna) {
                        return coluna.codigocoluna == cell.coluna
                    });

                    if (colunaConfig) {

                        tableRow[cell.campo] = handleDefaultValueByDataType(colunaConfig.config.tipo, cell[cell.campo])

                    } else {
                        console.warn("ALERTA ConvertMrendObjectToTable:  Coluna não encontrada para o cellObject: ", cell);
                    }
                });

                tableRow[source.sourceKey] = row.sourceKeyValue
                tableRow[source.linkField] = row.linkid || "";

                setIfSourceFieldExists(tableRow, source, "ordemField", source.ordemField, 0, row, "ordem");
                setIfSourceFieldExists(tableRow, source, "linhaField", source.linhaField, "", row, "codigolinha");
                setIfSourceFieldExists(tableRow, source, "descLinhaField", source.descLinhaField, "", row, "descLinha");
                setIfSourceFieldExists(tableRow, source, "descColunaField", source.descColunaField, "", row, "descColuna");
                setIfSourceFieldExists(tableRow, source, "ordemColunaField", source.ordemColunaField, "", row, "ordemColuna");
                setIfSourceFieldExists(tableRow, source, "cellIdField", source.cellIdField, "", row, "cellId");

                setIfSourceFieldExists(tableRow, source, "colunaField", source.colunaField, "", row, "coluna");
                setIfSourceFieldExists(tableRow, source, "rowIdField", source.rowIdField, "", row, "rowid");



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

    function setIfSourceFieldExists(targetObj, source, sourceField, targetField, defaultValue, row, rowField) {
        if (source[sourceField]) {
            targetObj[source[sourceField]] = row && row[rowField] !== undefined && row[rowField] != "" ? row[rowField] : defaultValue;
        }
    }

    function mapRecordToMrendObject(record, MrendConversionConfig) {
        var extras = MrendConversionConfig.extras || {};
        return new MrendObject({
            cellId: record[extras.cellIdField] || "",
            rowid: record[extras.rowIdField] || "",
            rowIdField: extras.rowIdField || "", // <-- Adicionado aqui
            coluna: record[extras.colunaField] || "",
            sourceTable: MrendConversionConfig.table || "",
            sourceKey: MrendConversionConfig.tableKey || "",
            sourceKeyValue: record[MrendConversionConfig.tableKey] || "",
            valor: record.valor || "",
            campo: record.campo || "",
            linkId: record[extras.linkField] || "",
            linkField: extras.linkField || "",
            codigolinha: record[extras.linhaField] || "",
            ordemField: extras.ordemField || "",
            cellIdField: extras.cellIdField || "",
            colunaField: extras.colunaField || "",
            descLinhaField: extras.descLinhaField || "",
            linhaField: extras.linhaField || "",
            descLinha: record[extras.descLinhaField] || "",
            descColunaField: extras.descColunaField || "",
            descColuna: record[extras.descColunaField] || "",
            ordemColunaField: extras.ordemColunaField || "",
            ordemcoluna: record[extras.ordemColunaField] || 0,
            descColuna: record[extras.descColunaField] || "",
            tipocolField: extras.tipocolField || "",
            tipocol: record[extras.tipocolField] || "",
            ordem: record[extras.ordemField] || 0
        });
    }


    function ConvertDbTableToMrendObject(data, MrendConversionConfig) {
        if (!data[0]) {

            return []
        }
        var keys = Object.keys(data[0]);
        var mrendObjects = []


        if (MrendConversionConfig.chunkMapping == false) {

            distinctKey = getDistinctWithKeys(data, MrendConversionConfig.extras.colunaField);

            keys = distinctKey.map(function (obj) {
                return obj[MrendConversionConfig.extras.colunaField];
            });

            console.log(" mrendThis.reportConfig.config.colunas", mrendThis.reportConfig.config.colunas)
            data.forEach(function (record) {

                var mrendObject = new MrendObject({});

                mrendObject = mapRecordToMrendObject(record, MrendConversionConfig);



                var colunaInstance = mrendObject.coluna.split("___")[0];

                var colunaConfig = mrendThis.reportConfig.config.colunas.filter(function (coluna) {
                    return coluna.codigocoluna == colunaInstance || coluna.codigocoluna == mrendObject.coluna;
                });

                if (colunaConfig.length > 0) {

                    mrendObject.campo = colunaConfig[0].campo;
                    mrendObject[colunaConfig[0].campo] = record[colunaConfig[0].campo];


                    if (!mrendObject.tipocol) {
                        mrendObject.tipocol = colunaConfig[0].tipo || "text";
                    }

                }

                mrendObjects.push(mrendObject);


            });



            return mrendObjects;

        }







        data.forEach(function (record) {
            var mrendObject = new MrendObject({});
            keys.forEach(function (key) {

                var configCol = mrendThis.reportConfig.config.colunas.find(function (coluna) {
                    return coluna.codigocoluna == key
                })

                if (MrendConversionConfig.chunkMapping == true) {

                    mrendObject = new MrendObject({});
                }

                if (MrendConversionConfig.tableKey != key && configCol) {


                    var rowid = record[MrendConversionConfig.tableKey]

                    // //console.log((configCol.campo, record[configCol.campo])
                    mrendObject.campo = MrendConversionConfig.chunkMapping == true ? key : configCol.campo;
                    mrendObject[configCol.campo] = MrendConversionConfig.chunkMapping == true ? record[key] : record[configCol.campo];
                    mrendObject.coluna = key;
                    mrendObject.rowid = rowid;
                    mrendObject.codigolinha = MrendConversionConfig.table;
                    mrendObject.cellId = key + "COLUNA___LINHA" + rowid.trim();
                    mrendObject.ordemField = MrendConversionConfig.extras.ordemField;
                    mrendObject.tipocolField = MrendConversionConfig.extras.tipocolField;
                    mrendObject.tipocol = configCol.tipo || "text";


                    mrendObject.ordem = record[MrendConversionConfig.extras.ordemField] || 0;

                    mrendObject.sourceTable = MrendConversionConfig.table
                    mrendObject.sourceKey = MrendConversionConfig.tableKey;
                    mrendObject.sourceKeyValue = record[MrendConversionConfig.tableKey];
                    mrendObject.codigocoluna = configCol.codigocoluna;

                    if (configCol.sourceTable) {
                        mrendObject.sourceTable = configCol.sourceTable;
                        mrendObject.sourceKey = configCol.sourceKey;
                        mrendObject.sourceKeyValue = record[configCol.sourceKey];
                    }

                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "linkField", "linkid");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "cellIdField", "cellId");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "colunaField", "codigocoluna");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "ordemColunaField", "ordemcoluna");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "rowIdField", "rowid");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "linhaField", "codigolinha");
                    applyExtraField(mrendObject, record, MrendConversionConfig.extras, "tipocolField", "tipocol");


                    if (MrendConversionConfig.chunkMapping == true) {

                        mrendObjects.push(mrendObject)
                    }

                }

            })

            if (MrendConversionConfig.chunkMapping == false) {

                mrendObjects.push(mrendObject)
            }

        })

        //  //console.log(("ConvertDbTableToMrendObject Final", mrendObjects)


        return mrendObjects;

    }




    function applyExtraField(mrendObject, record, extras, extraKey, objKey) {

        if (extras && extras[extraKey]) {
            mrendObject[objKey] = record[extras[extraKey]];
            mrendObject[extraKey] = extras[extraKey];
        }

    }

    function initTableDataAndContainer() {


        $("#sourceTabletableContainer" + mrendThis.table).remove();

        mrendThis.GCellObjectsConfig = []
        mrendThis.TMPCellObjectCOnfig = []
        mrendThis.GRenderedColunas = []
        mrendThis.GRenderedLinhas = []

        $(mrendThis.containerToRender).append("<div id='sourceTabletableContainer" + mrendThis.table + "' style='margin-top:2.5em' class='row table-responsive'></div>")
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

            var dadosColuna = mrendThis.GRenderedColunas.find(function (coluna) {
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

                var linhaTipoFiltered = mrendThis.reportConfig.config.linhas.filter(function (linhaGrupo) {

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

            mrendThis.GRenderedColunas.map(function (coluna) {

                var recFlt = records.filter(function (record) {
                    return record[colunaMap.mapData.colunaid] == coluna.codigocoluna
                });
                ////console.log(("recFlt",recFlt)
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
                customData: "colspan=" + (mrendThis.GRenderedColunas.length).toString() + "",
            })


        }


        GTableData.body.rows.push(linhaHtml);


        var subLinhas = mrendThis.GRenderedLinhas.filter(function (linhaObj) {

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
            renderedLinhaTotalRelatorio.addToLocalRenderedLinhasList([], "", {}, false, true);
            setLinha(renderedLinhaTotalRelatorio, "", [])


        }


        return linhaHtml;

    }



    function setLinhaToRender(linh, parentid, records) {

        var linha = linh;
        linha.parentid = parentid;

        var linhaId = linha.rowid;


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



        mrendThis.GRenderedColunas.forEach(function (coluna) {

            var recFlt = records.filter(function (rec) {
                return rec.coluna == coluna.codigocoluna
            });
            setCelula({}, linha, coluna, recFlt, coluna.config.categoria, "", {})

        });

        return {}


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

        mrendThis.GRenderedColunas.forEach(function (coluna) {

            var extraData = { customClasses: "", customStyles: "background:transparent!important;font-weight:bold!important;color:white!important" }
            setCelula(linhaHtml, linha, coluna, [], "total", extraData)

        });

        GTableData.body.rows.push(linhaHtml);

        return linhaHtml


    }

    function setLinha(linh, parentid, records) {

        //Colocou-se uma função dentro de outra para que no futuro seja possível adicionar mais tipos de linhas

        return setLinhaToRender(linh, parentid, records);

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




    function buildDefaultCelula(linhaHtml, linh, colun, records) {

        var linha = linh;
        var coluna = colun;
        var configCelula = colun.config;

        var linhaRecord;

        var linhaFilterKey = "rowid";
        linhaRecord = records[0];

        var cellId = null;
        var novoRegisto = false;

        if (linhaRecord) {

            cellId = linhaRecord.cellId

        }


        if (!linhaRecord) {
            linhaRecord = JSON.parse(JSON.stringify(mrendThis.schemas[0].tableSourceSchema))
            cellId = generateUUID();
            novoRegisto = true


        }

        var cellObjectConfig = new CellObjectConfig(
            {
                bindData: new BindData({ sourceKey: "cellId", sourceBind: coluna.config.campo }),
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
        linh.UIObject[mrendThis.dbTableToMrendObject.chunkMapping ? coluna.config.campo : coluna.codigocoluna] = cellObjectConfig.valor;
        linh.UIObject.cellId = cellObjectConfig.cellid;

        var cellValue = cellObjectConfig.valor;

        if (novoRegisto) {

            linhaRecord.cellId = cellId;
            linhaRecord[coluna.config.campo] = cellValue;
            linhaRecord.coluna = coluna.codigocoluna
            linhaRecord.rowid = linha.rowid;
            linhaRecord.codigolinha = linha.codigo
            linhaRecord.campo = coluna.config.campo;
            linhaRecord.linkid = linha.linkid;
            linhaRecord.linkField = mrendThis.dbTableToMrendObject.extras.linkField;
            linhaRecord.sourceTable = mrendThis.dbTableToMrendObject.table;
            linhaRecord.sourceKey = mrendThis.dbTableToMrendObject.tableKey;
            linhaRecord.sourceKeyValue = linha.rowid;
            linhaRecord.ordem = linha.ordem
            linhaRecord.ordemField = mrendThis.dbTableToMrendObject.extras.ordemField;
            linhaRecord.colunaField = mrendThis.dbTableToMrendObject.extras.colunaField;
            linhaRecord.linhaField = mrendThis.dbTableToMrendObject.extras.linhaField;
            linhaRecord.descLinhaField = mrendThis.dbTableToMrendObject.extras.descLinhaField;
            linhaRecord.cellIdField = mrendThis.dbTableToMrendObject.extras.cellIdField;
            linhaRecord.descColunaField = mrendThis.dbTableToMrendObject.extras.descColunaField;
            linhaRecord.ordemColunaField = mrendThis.dbTableToMrendObject.extras.ordemColunaField;
            linhaRecord.tipocolField = mrendThis.dbTableToMrendObject.extras.tipocolField;
            linhaRecord.tipocol = coluna.config.tipo || "text";
            linhaRecord.rowIdField = mrendThis.dbTableToMrendObject.extras.rowIdField;
            linhaRecord.ordemColuna = coluna.ordem || 0;
            linhaRecord.descColuna = coluna.desccoluna;
            linhaRecord.descLinha = linha.config.descricao;



            if (coluna.config.sourceTable) {

                linhaRecord.sourceTable = coluna.config.sourceTable;
                linhaRecord.sourceKey = coluna.config.sourceKey;
                linhaRecord.sourceKeyValue = linha.rowid;
            }


            mrendThis.GNewRecords.push(linhaRecord);
        }


    }

    function InitDB(datasourceName, schemas) {

        return new Promise(function (resolve, reject) {
            mrendThis.db = new Dexie(datasourceName);
            var promises = []; // Armazena todas as Promises do loop

            return configureDataBase(mrendThis.db, schemas[0].tableSourceName, 1, Object.keys(schemas[0].tableSourceSchema)).then(function (result) {
                mrendThis.db = result;
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



    function getState() {
        return $("#mainPage").data("state")
    }

    function storeStampRegisto(stampregisto) {
        window.localStorage.setItem("stampregisto", stampregisto)
    }
    function storeDataSourceStamp(sourceStamp) {


        window.localStorage.setItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName, sourceStamp.trim())
    }

    function clearStamps() {
        window.localStorage.clear("sourcestamp")
        window.localStorage.clear("stampregisto")
    }

    function getSourceStamp() {

        return window.localStorage.getItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName) ? window.localStorage.getItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName).trim() : "";
    }



    function deleteAllRecords(tableName) {
        return new Promise(function (resolve, reject) {

            if (mrendThis.db['_allTables'][tableName]) {
                return mrendThis.db[tableName].clear().then(function () {
                    // ////console.log((`All records from ${tableName} have been deleted successfully.`);
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
            // mrendThis.db[tableName].add(data);
            return mrendThis.db[tableName].add(data);
            // ////console.log(('Data added with primary key:', primaryKey);
        } catch (error) {
            console.error('Error adding data:', error);
        }
    }

    function deleteData(db, tableName, fieldName, filedValue) {
        return mrendThis.db[tableName].where(fieldName).equals(filedValue).delete()
    }

    function addBulkData(db, tableName, dataArray) {

        if (mrendThis.db['_allTables'][tableName]) {
            return mrendThis.db[tableName].bulkPut(dataArray)
        } else {
            return mrendThis.db[tableName].bulkAdd(dataArray)
        }

    }



    function getDataFromRemote() {

        return new Promise(function (resolve, reject) {
            $.ajax({
                type: mrendThis.remoteFetchData.type,
                url: mrendThis.remoteFetchData.url,
                data: mrendThis.remoteFetchData.data,
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

        ////console.log((indexes)
        return new Promise(function (resolve, reject) {

            mrendThis.db.close()  //.then(function () {
            var schemaConfig = {};

            schemaConfig[tableName] = indexes.join(",");
            mrendThis.db.version(1).stores(schemaConfig);

            // Open the database
            mrendThis.db.open().then(function () {
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

        return mrendThis.db[tableName].count()

    }

    function databaseAndTableHasRecords(db, tableName) {
        return new Promise(function (resolve, reject) {
            if (db['_allTables'][tableName]) {


                db[tableName].count()
                    .then(function (count) {

                        //console.log(("count tableName", tableName, count);

                        if (count > 0) {
                            // If there are records, return all records
                            return mrendThis.db[tableName].toArray();
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
                        // mrendThis.db.close();
                    });
            } else {
                resolve({ exists: false, data: null });
            }
        });
    }

    function isTableExist(db, tableName) {
        return mrendThis.db.tables.has(tableName);
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
        if (mrendThis.GNewRecords.length > 0) {
            addBulkData(mrendThis.db, mrendThis.tableSourceName, mrendThis.GNewRecords).then(function (data) {
                mrendThis.GNewRecords = []

                mrendThis.GCellObjectsConfig = mrendThis.GCellObjectsConfig.concat(mrendThis.TMPCellObjectCOnfig);

                if (mrendThis.reactiveData.cells) {
                    console.log("Refreshing reactive cells after adding new records");
                    mrendThis.refreshReactiveData()
                }

            }).catch(function (err) {
                //console.log(("ERROR ON INSERT NEW ROWS", err)
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


    function formatNumber(value, colunaConfig) {
        var input = document.createElement("input");

        var cleave = new Cleave(input, {
            numeral: true,
            numeralThousandsGroupStyle: "thousand",
            numeralDecimalScale: colunaConfig.decimais || 2,
            numeralPositiveOnly: colunaConfig.proibenegativo || false,
            numeralDecimalMark: ".",
            delimiter: " "
        });
        cleave.setRawValue(value || 0);
        return input.value;
    }

    function numberFormatCustomEditor(cell, onRendered, success, cancel, editorParams) {

        var input = document.createElement("input");
        input.type = "text";
        input.style.width = "100%";
        input.style.boxSizing = "border-box";
        input.style.padding = "8px 12px";
        input.style.border = "0px solid #e0e6ed";
        input.style.borderRadius = "4px";
        input.style.fontFamily = "inherit";
        input.value = formatNumber(cell.getValue(), editorParams.colunaConfig);

        var cleave = new Cleave(input, {
            numeral: true,
            numeralThousandsGroupStyle: "thousand",
            numeralDecimalScale: editorParams.colunaConfig.decimais || 2,
            numeralPositiveOnly: editorParams.colunaConfig.proibenegativo || false,
            numeralDecimalMark: ".",
            delimiter: " "
        });

        onRendered(function () {
            input.focus();
            input.select();
        });

        input.addEventListener("blur", function () {
            var raw = input.value.replace(/\./g, "").replace(",", ".");
            var num = inputToNumberDB(input.value);
            success(isNaN(num) ? 0 : num);
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") input.blur();
            else if (e.key === "Escape") cancel();
        });

        return input;
    }


    function getRenderedLinhaFromTabulator(cell, colunaConfig, colunaUIConfig) {

        var rowData = cell.getRow().getData();

        var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowData.rowid;
        });
        if (!renderedLinha) {
            throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
        }

        return renderedLinha;
    }


    function getCelulaConfigFromTabulator(cell, colunaConfig, colunaUIConfig) {

        var rowData = cell.getRow().getData();

        var renderedLinha = getRenderedLinhaFromTabulator(cell, colunaConfig, colunaUIConfig);
        if (!renderedLinha) {
            throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
        }

        var renderedColuna = mrendThis.GRenderedColunas.find(function (coluna) {
            return coluna.codigocoluna == cell.getField();
        });

        if (!renderedColuna) {

            throw new Error("Coluna renderedColuna com codigocoluna " + cell.getField() + " não encontrada.");
        }

        var celula = mrendThis.reportConfig.config.celulas.find(function (celula) {
            return celula.codigocoluna.trim() == renderedColuna.config.codigocoluna && celula.linhastamp.trim() == renderedLinha.config.linhastamp.trim();
        });


        if (!celula) {
            throw new Error("Celula com codigocoluna " + cell.getField() + " e linhastamp " + renderedLinha.config.linhastamp + " não encontrada.");
        }

        return celula;

    }


    function generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content) {

        var styles = ""
        if (colunaConfig.atributo == "readonly" || colunaConfig.colfunc) {

            styles = "background:#dee5eb;"
        }

        if (colunaConfig.tipo == "textarea") {
           
            styles+=" resize: none; overflow: hidden; white-space: pre-wrap; word-wrap: break-word;"

        }

        return "<div style='" + styles + "' class='mrend-input-cell'>" + content + "</div>";
    }

    function handleColFormatter(cell, colunaConfig, colunaUIConfig) {


        var celula = getCelulaConfigFromTabulator(cell, colunaConfig, colunaUIConfig);
        var renderedColuna = colunaConfig;
        var rowData = cell.getRow().getData();

        var condicinactivo = celula.condicinactivo;
        if (condicinactivo) {
            var resultCondicInactivo = eval(celula.condicinactexpr);
            if (resultCondicInactivo) {
                return ""
            }
        }


        if (celula.inactivo && condicinactivo == false) {
            return "";
        }

        function ensureMinContent(content) {
            // Se o conteúdo está vazio, nulo, undefined ou só espaços
            if (!content || content.toString().trim() === "") {
                return "&nbsp;"; // Espaço não-quebrado para manter altura
            }
            return content;
        }



        switch (colunaConfig.tipo) {

            case "digit":
                var formattedValue = formatNumber(cell.getValue(), colunaConfig);
                var content = ensureMinContent(formattedValue);
                return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content)
                break;

            case "table":

                if (renderedColuna.colfunc || celula.usafnpren) {
                    var content = ensureMinContent(cell.getValue());
                    return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content)
                }

                if (renderedColuna.usaexpresstbjs && celula.localData.length == 0) {
                    list = eval(renderedColuna.expressaotbjs);
                    celula.localData = list;
                }

                selectedLabel = cell.getValue();
                var selectedData = celula.localData.find(function (item) {
                    return item[renderedColuna.valtb] == cell.getValue()
                });

                if (selectedData) {
                    selectedLabel = selectedData[renderedColuna.nometb];
                }

                var content = ensureMinContent(selectedLabel);
                return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content);

            default:
                var content = ensureMinContent(cell.getValue());
                return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content);
                break;
        }

    }

    function handleEditor(coluna, colunaUIConfig) {

        if (!mrendThis.enableEdit) {
            return {};
        }
        if (coluna.config.tipo === "digit") {
            return {
                editor: numberFormatCustomEditor,
                editorParams: { colunaConfig: coluna.config }
            };
        }

        if (coluna.config.tipo === "text") {
            return { editor: "input" };
        }

        if (coluna.config.tipo === "textarea") {
            return { editor: "textarea" };
        }

        if (coluna.config.tipo === "table") {
            var values = (coluna.localData || []).map(function (item) {
                return {
                    value: item[coluna.config.valtb],
                    label: item[coluna.config.nometb]
                };
            });
            return {
                editor: "list",
                editorParams: {
                    valuesLookup: function (cell) {
                        var rowData = cell.getRow().getData();
                        var list = [];
                        var renderedColuna = coluna;

                        var celula = getCelulaConfigFromTabulator(cell, coluna.config, colunaUIConfig);

                        if (coluna.config.usaexpresstbjs && celula.localData.length == 0) {
                            celula.localData = eval(coluna.config.expressaotbjs);

                        }

                        list = celula.localData || [];

                        return (list || []).map(function (item) {

                            return {
                                value: item[coluna.config.valtb],
                                label: item[coluna.config.nometb]
                            };
                        });
                    },
                    autocomplete: true,
                    freetext: true,
                    popupContainer: document.body,
                    listItemFormatter: function (value, text) {
                        return "<div style='padding: 6px 12px; transition: all 0.2s;'>" + text + "</div>";
                    }
                }
            };
        }


        return { editor: "input" };
    }


    var customMutator = function (value, data, type, params, component) {

        return data.qtt * data.pcusto;
    }

    var extractCellValue = function (expression, colunaConfig, rowData) {

        var regex = /\{([^}]+)\}/g; // Encontra tudo entre { e }
        var match;
        var orgExpr = expression;

        while ((match = regex.exec(expression)) !== null) {
            var colName = match[1];


            var valor = rowData[colName]

            if (colunaConfig.tipo == "digit") {

                valor = valor == "Infinity" || valor == "-Infinity" || valor == Infinity || isNaN(valor) ? 0 : valor;
            }

            var token = "{" + colName + "}";
            while (orgExpr.indexOf(token) !== -1) {
                orgExpr = orgExpr.replace(token, valor);
            }
        }
        return orgExpr;
    }


    function handleMutator(coluna) {

        var renderedColuna = new RenderedColuna(coluna);



        return {
            mutator: function (value, rowData, type, params, component) {




                var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == rowData.rowid;
                });

                if (!renderedLinha) {
                    throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
                }

                var celula = mrendThis.reportConfig.config.celulas.find(function (celula) {
                    return celula.codigocoluna.trim() == renderedColuna.config.codigocoluna && celula.linhastamp.trim() == renderedLinha.config.linhastamp.trim();
                });


                if (!celula) {
                    throw new Error("Celula com codigocoluna " + renderedColuna.config.codigocoluna + " e linhastamp " + renderedLinha.config.linhastamp + " não encontrada.");
                }

                if (celula.valordefeito == true && renderedLinha.novoregisto == true) {
                    try {
                        var expressaoValDefeito = eval(celula.valordefeitoexpr);


                        if (renderedLinha.isInstance == true && celula.valdefafinstancia == true) {

                            var rowupdated = {};
                            rowupdated[renderedColuna.codigocoluna] = expressaoValDefeito;
                            rowupdated.rowid = rowData.rowid;
                            updateCellObjectConfig(renderedColuna.codigocoluna, rowupdated);

                            return expressaoValDefeito;
                        }


                        if (renderedLinha.isInstance == false) {

                            var rowupdated = {};
                            rowupdated[renderedColuna.codigocoluna] = expressaoValDefeito;
                            rowupdated.rowid = rowData.rowid;
                            updateCellObjectConfig(renderedColuna.codigocoluna, rowupdated);

                            return expressaoValDefeito;

                        }
                    } catch (error) {

                        console.warn("ERRO NO VALOR POR DEFEITO PARA COLUNA", renderedColuna.codigocoluna, "Célula ", celula, error)
                    }




                }


                if (renderedLinha.isInstance == false && renderedColuna.config.temlinhadesc) {

                    var rowupdated = {}
                    var descricao = renderedLinha.config.descricao;
                    rowupdated[renderedColuna.codigocoluna] = descricao;
                    rowupdated.rowid = rowData.rowid;
                    updateCellObjectConfig(renderedColuna.codigocoluna, rowupdated);

                    return descricao

                }

                if (renderedColuna.config.colfunc || celula.usafnpren) {

                    var condicColFunc = renderedColuna.config.condicfunc;
                    var resultCondicColFunc = true;
                    if (condicColFunc) {

                        resultCondicColFunc = eval(renderedColuna.config.condicfuncexpr);
                    }

                    if (!resultCondicColFunc) {
                        return value; // Se a condição não for atendida, retorna o valor original
                    }

                    var expressaoColFunc = renderedColuna.config.expresscolfun;

                    if (celula.usafnpren) {

                        expressaoColFunc = celula.fnpren;
                    }


                    var expression = extractCellValue(expressaoColFunc, renderedColuna.config, rowData);

                    var expressionResult = eval(expression);

                    if (renderedColuna.tipo == "digit") {

                        expressionResult = expressionResult == "Infinity" || expressionResult == "-Infinity" || expressionResult == Infinity || isNaN(expressionResult) ? 0 : expressionResult;
                    }



                    var rowupdated = {}
                    rowupdated[renderedColuna.codigocoluna] = expressionResult;
                    rowupdated.rowid = rowData.rowid;



                    updateCellObjectConfig(renderedColuna.codigocoluna, rowupdated);

                    return renderedColuna.tipo == "digit" ? Number(expressionResult) : expressionResult;
                };


                return value;
            },
            mutatorParams: { colunaConfig: coluna.config }
        }
        // Adicione outros mutators por tipo/código aqui se necessário
        return {};
    }

    function updateCellObjectConfig(coluna, rowData) {

        var cellObjectConfig = mrendThis.GCellObjectsConfig.find(function (obj) {
            return obj.codigocoluna == coluna && obj.rowid == rowData.rowid;
        });

        if (cellObjectConfig) {

            cellObjectConfig.valor = rowData[coluna];
        }
    }


    function deleteRowById(rowid) {

        var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowid;
        });

        if (renderedLinha) {

            mrendThis.GRenderedLinhas = mrendThis.GRenderedLinhas.filter(function (linha) {
                return linha.rowid != rowid
            })


            renderedLinha.deleteRow();
        }
    }

    function addLinhaFilha(rowid) {

        var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowid;
        });

        var renderedFilha = null;
        if (!renderedLinha) {

            throw new Error("Linha com rowid " + rowid + " não encontrada.");


        }
        renderedFilha = renderedLinha.addLinhaFilha();


        return renderedFilha;

    }

    function deleteRowAndChildren(row) {
        var children = row.getTreeChildren();
        children.forEach(function (child) {
            deleteRowAndChildren(child); // Chamada recursiva para remover subfilhos
        });
        row.delete();
        deleteRowById(row.getData().rowid);
    }


    function addTabulatorColumns(colunas, columns) {

        colunas.forEach(function (coluna) {
            var colunaUIConfig = {
                title: coluna.desccoluna,
                field: coluna.codigocoluna,
                width: coluna.config.tamanho,
                hozAlign: coluna.config.alinhamento,
                frozen: coluna.config.fixacoluna,
                headerTooltip: function (e, cell, onRendered) {
                    //e - mouseover event
                    //cell - cell component
                    //onRendered - onRendered callback registration function

                    //console.log(("headerTooltip", cell._column.getDefinition().title);
                    var titulo = cell._column.getDefinition().title
                    var el = document.createElement("a");
                    el.style.backgroundColor = "#e9f1ff";
                    el.style.color = "#6c6c6c";
                    el.style.padding = "0.2em 0.5em";
                    el.style.borderRadius = "4px";
                    el.innerText = titulo

                    return el;
                },
                formatter: function (cell) {
                    return handleColFormatter(cell, coluna.config, colunaUIConfig);
                }


            }

            var editorConfig = handleEditor(coluna, colunaUIConfig);
            Object.assign(colunaUIConfig, editorConfig);

            var mutatorConfig = handleMutator(coluna);
            Object.assign(colunaUIConfig, mutatorConfig);

            if (coluna.config.eventoclique) {

                colunaUIConfig.cellClick = function (e, cell) {

                    if (e.detail > 0) {
                        return
                    }

                    var rowData = cell.getRow().getData();
                    var renderedColuna = mrendThis.GRenderedColunas.find(function (coluna) {
                        return coluna.codigocoluna == cell.getField();
                    });

                    if (!renderedColuna) {

                        throw new Error("Coluna renderedColuna com codigocoluna " + cell.getField() + " não encontrada.");
                    }


                    eval(renderedColuna.config.expressaoclique)






                }

            }



            colunaUIConfig.editable = function (cell) {

                var rowData = cell.getRow().getData()
                var renderedColuna = mrendThis.GRenderedColunas.find(function (coluna) {
                    return coluna.codigocoluna == cell.getField();
                });

                if (!renderedColuna) {

                    throw new Error("Coluna renderedColuna set editable com codigocoluna " + cell.getField() + " não encontrada.");
                }

                var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == rowData.rowid;
                });

                if (!renderedLinha) {
                    throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
                }

                if (renderedLinha.isInstance == false && renderedLinha.config.leitura) {

                    return false;
                }

                var condicAttrResult = ""
                if (renderedColuna.config.condicattr) {

                    condicAttrResult = eval(renderedColuna.config.condicattrexpr);

                }

                if (condicAttrResult == "readonly" || condicAttrResult == "disabled") {
                    return false;
                }

                if (renderedColuna.config.atributo == "readonly" || renderedColuna.config.atributo == "disabled") {
                    return false;
                }

                var celula = getCelulaConfigFromTabulator(cell, coluna.config, colunaUIConfig);

                if (celula.atributo == "readonly" || celula.atributo == "disabled") {
                    return false;
                }

                var condicinactivo = celula.condicinactivo;
                if (condicinactivo) {
                    var resultCondicInactivo = eval(celula.condicinactexpr);
                    if (resultCondicInactivo) {
                        return false
                    }
                }

                if (celula.inactivo && condicinactivo == false) {
                    return false;
                }


                return true

            }
            columns.push(colunaUIConfig);
        })

    }



    function handleRowEvent(row, operation) {
        var rowData = row.getData();
        var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowData.rowid;
        });
        if (!renderedLinha) {
            throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
        }



        switch (operation) {
            case "add":

                if (renderedLinha.config.eventoadd) {
                    // console.log("Executing add event for rowid:", renderedLinha.config.eventoaddexpr);
                    eval(renderedLinha.config.eventoaddexpr);
                }

                break;
            case "delete":

                if (renderedLinha.config.eventodelete) {
                    // console.log("Executing delete event for rowid:", renderedLinha.config.eventodeleteexpr);
                    eval(renderedLinha.config.eventoaddexpr);
                }

            default:
                break;
        }


    }

    function RenderSourceTable() {


        addNewRecords()

        mrendThis.GCellObjectsConfig = mrendThis.GCellObjectsConfig.concat(mrendThis.TMPCellObjectCOnfig);

        var columns = [
            {
                title: "#",
                field: "idx",
                width: 120

            },

            {
                title: "Ações",

                formatter: function (cell, formatterParams) {

                    var rowData = cell.getRow().getData()

                    var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {

                        return linha.rowid == rowData.rowid;
                    });

                    if (!renderedLinha) {

                        throw new Error("Linha com rowid " + rowData.rowid + " não encontrada.");
                    }


                    if (!mrendThis.enableEdit) {
                        return "";
                    }



                    var botãoAddFilho = ""
                    var botaoRemover = "";

                    if (renderedLinha.config.addfilho) {

                        botãoAddFilho = "<div class='btn btn-primary btn-sm action-btn add-child' ><span class='glyphicon glyphicon-plus action-btn add-child' title='Adicionar Filho'></span> </div>"
                    }


                    if (renderedLinha.config.modelo || renderedLinha.isInstance) {

                        botaoRemover = "<div style='background:#d9534f;color:white' class='btn btn-danger btn-sm action-btn remove-row' ><span class='glyphicon glyphicon-trash action-btn remove-row' title='Remover Linha'></span> </div>"
                    }

                    var globalBotoes = "<div style='display:flex;column-gap:0.3em'>" + botãoAddFilho + botaoRemover + "</div>";

                    return globalBotoes;
                },
                width: 110,
                hozAlign: "center",
                headerSort: false,
                visible: mrendThis.enableEdit,
                cellClick: function (e, cell) {
                    var row = cell.getRow();
                    var target = e.target;
                    //  console.log("target.classList",target.classList)
                    if (target.classList.contains("add-child")) {


                        var addFilhaResult = addLinhaFilha(row.getData().rowid);
                        row.addTreeChild(addFilhaResult.UIObject);
                        row.treeExpand();
                        mrendThis.applyTabulatorStylesWithJquery(mrendThis);
                        handleRowEvent(row, "add");



                    }

                    if (target.classList.contains("remove-row")) {
                        var row = cell.getRow();
                        var children = row.getTreeChildren();

                        deleteRowById(row.getData().rowid);
                        if (children.length > 0) {
                            if (confirm("Esta linha tem filhos. Deseja remover tudo?")) {
                                deleteRowAndChildren(row);
                            }
                        } else {
                            row.delete();
                        }
                        mrendThis.refreshReactiveData();


                    }
                }
            }

        ];

        addTabulatorColumns(mrendThis.GRenderedColunas, columns);

        function observeTabulatorChanges() {
            var tabulatorContainer = document.querySelector(".tabulator");
            if (!tabulatorContainer) return;

            // Cria o observer
            var observer = new MutationObserver(function (mutationsList, observer) {
                // Sempre que houver alteração, reaplica os estilos
                /////console.log(("Tabulator styles changed, reapplying styles...");
                mrendThis.applyTabulatorStylesWithJquery(mrendThis);
            });

            // Configura para observar alterações em filhos e subárvores
            observer.observe(tabulatorContainer, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }

        // Chame após criar o Tabulator
        setTimeout(function () {
            observeTabulatorChanges();
        }, 1000);
        /*
         'enum': ["fitData", "fitColumns", "fitDataFill", "fitDataStretch"],
        
        */

        $(mrendThis.containerToRender).css({
            "font-family": "Nunito, sans-serif",
            "color": "#161616",
            "zoom": "0.75",
            //"transform-origin": "top left",
        });

        var botaoId = "btn-zoom-in-" + generateUUID();
        var buttonZoomIn = {
            style: "",
            buttonId: botaoId,
            classes: "btn btn-primary btn-sm btn-zoom-in btn-zoom-mrend",
            customData: "  type='button' data-zoom-scale='0.75' data-zoomin='true' data-container='" + mrendThis.containerToRender + "'",
            label: " <span class='glyphicon glyphicon-plus'></span>",
            onClick: "handleZoomMrend(this, \"" + mrendThis.dbTableToMrendObject.dbName + "\", \"" + mrendThis.tableSourceName + "\");",
        };
        var buttonZoomInHtml = generateButton(buttonZoomIn);

        var botaoIdZoomOut = "btn-zoom-out-" + generateUUID();
        var buttonZoomOut = {
            style: "",
            buttonId: botaoIdZoomOut,
            classes: "btn btn-default btn-sm btn-zoom-out btn-zoom-mrend",
            customData: " type='button' data-zoomout='true' data-zoom-scale='0.75' data-container='" + mrendThis.containerToRender + "'",
            label: "<span class='glyphicon glyphicon-minus'></span>",
            onClick: "handleZoomMrend(this, \"" + mrendThis.dbTableToMrendObject.dbName + "\", \"" + mrendThis.tableSourceName + "\");",
        };
        var buttonZoomOutHtml = generateButton(buttonZoomOut);

        /* $(document).off("click", ".btn-zoom-mrend").on("click", ".btn-zoom-mrend", function (e) {
 
             e.preventDefault();
             e.stopPropagation();
             handleZoomMrend(this, mrendThis);
 
 
         })*/






        var zoomAreaContainerButtons = "<div style='display:flex;column-gap:0.3em;justify-content:right;margin-bottom:0.5em'>"
        zoomAreaContainerButtons += " " + buttonZoomInHtml
        zoomAreaContainerButtons += " " + buttonZoomOutHtml

        zoomAreaContainerButtons += "</div>"
        $(mrendThis.containerToRender).before(zoomAreaContainerButtons);




        console.log("Columns definition",columns)

        mrendThis.GTable = new Tabulator(mrendThis.containerToRender, {
            data: mrendThis.GGridData,
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildIndent: 25,
            popupContainer: "body",
            layout: "fitDataFill",
            height: "400px", // altura fixa para ativar scroll e fixar cabeçalho
            rowFormatter: function (row) {

                var data = row.getData();
                var rowData = data;
                if (row.getTreeParent()) {
                    row.getElement().style.backgroundColor = "#f8fafc";
                }
                var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == data.rowid;
                });



                if (!renderedLinha) {
                    throw new Error("Linha com rowid " + data.rowid + " não encontrada.");
                }

                var customStyles = {
                    backgroundColor: renderedLinha.config.cor || "#f8fafc",
                }

                if (renderedLinha.config.estilopersonalizado) {
                    customStyles = eval(renderedLinha.config.expressaoestilopersonalizado);
                }

                var customStylesKey = Object.keys(customStyles);

                customStylesKey.forEach(function (key) {
                    row.getElement().style[key] = customStyles[key];
                })



            },
            columns: columns,

        });

        mrendThis.GTable.on("cellEdited", function (cell) {
            var rowData = cell.getRow().getData();

            var columnField = cell.getField(); // <-- Aqui você pega o nome/campo da coluna editada
            var updateData = {};
            Object.keys(rowData).forEach(function (key) {
                if (key !== "_children" && key !== "id") {
                    updateData[key] = rowData[key];
                }
            });
            cell.getRow().update(updateData);

            updateCellObjectConfig(columnField, rowData);

        });


        mrendThis.GTable.on("dataTreeRowExpanded", function (row, level) {
            mrendThis.applyTabulatorStylesWithJquery(mrendThis);
        });


        mrendThis.GTable.on("dataTreeRowCollapsed", function (row, level) {

            mrendThis.applyTabulatorStylesWithJquery(mrendThis);
        });



        var tableBuiltEvent = function (data) {


            var currentScale = 0.75;
            var UIConfig = localStorage.getItem("UICONFIG_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName);
            if (UIConfig) {

                try {
                    var parsedConfig = JSON.parse(UIConfig);

                    if (parsedConfig.zoomScale) {
                        currentScale = parsedConfig.zoomScale;
                    }

                    $(mrendThis.containerToRender).css({
                        "font-family": "Nunito, sans-serif",
                        "color": "#161616",
                        "zoom": currentScale
                    });


                } catch (e) {
                    console.error("Erro ao analisar UIConfig:", e);
                }
            }
            $(mrendThis.containerToRender).attr("data-zoom-scale", currentScale);

            mrendThis.applyTabulatorStylesWithJquery(mrendThis);

            var cells = JSON.parse(JSON.stringify(mrendThis.GCellObjectsConfig));

            mrendThis.reactiveData = PetiteVue.reactive({
                global: mrendThis,
                cells: cells
            });


            /* setInterval(function () {
              //   applyTabulatorStylesWithJquery();
             }, 1000);*/
        }

        mrendThis.GTable.on("rowAdded", function (row) {
            //row - row component
            handleRowEvent(row, "add");

        });

        mrendThis.GTable.on("rowDeleted", function (row) {

            /* setTimeout(function () {
 
                 handleRowEvent(row, "delete");
 
             },3000)*/
            //row - row component
        });



        mrendThis.GTable.on("tableBuilt", tableBuiltEvent);


        setTimeout(function () {
            mrendThis.applyTabulatorStylesWithJquery(mrendThis);
        }, 500);



        generateTableButtons();
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

        var celulas = mrendThis.GCellObjectsConfig.filter(function (cellObj) { return cellObj.events.length > 0 });


        celulas.forEach(function (cellObjectConfig) {

            cellObjectConfig.executeChangeEvents()
        })

    }

    function handleTotais() {
        if (mrendThis.reportConfig.config.relatorio.totalcoluna) {

            mrendThis.GRenderedLinhas.forEach(function (linha) {

                linha.actualizarTotalLinha();
            })
        }

        calcularSubtotais();
        if (mrendThis.reportConfig.config.relatorio.totalrelatorio) {

            GTableData.calcularTotalRelatorio();

        }
    }


    function getRenderedLinhas(records) {



        var renderedLinhas = [new RenderedLinha({})];
        renderedLinhas = [];
        var notExistLinhas = [new Linha({})]
        notExistLinhas = []
        novasLinhas = [];



        var linhasToRender = mrendThis.reportConfig.config.linhas;

        linhasToRender.sort(function (a, b) {
            return (a.ordem || 0) - (b.ordem || 0);
        });



        linhasToRender.forEach(function (linhaToRender) {

            var recordData = records.find(function (record) {

                return record.codigolinha == linhaToRender.codigo || String(record.codigolinha.trim()).includes(linhaToRender.codigo.trim() + "___")
            });

            //console.log(("linhasToRender", linhasToRender, recordData)

            if (recordData) {

                var linhaRecords = records.filter(function (record) {
                    return record.codigolinha == linhaToRender.codigo || String(record.codigolinha.trim()).includes(linhaToRender.codigo.trim() + "___")
                }
                );

                var distinctRowIds = _.uniqBy(linhaRecords, "rowid");

                distinctRowIds.sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });


                distinctRowIds.forEach(function (distinctRow) {

                    var linhasFilhas = linhaRecords.filter(function (rec) {
                        return rec.linkid == distinctRow.rowid
                    }
                    );


                    /*linhasFilhas.sort(function (a, b) {
                        return (a.ordem || 0) - (b.ordem || 0);
                    });*/



                    addLinha(distinctRow, linhaRecords, linhaToRender, renderedLinhas, linhasFilhas.length > 0, true, false);
                    var distinctRowFilhas = _.uniqBy(linhasFilhas, "rowid");

                    distinctRowFilhas.sort(function (a, b) {
                        return (a.ordem || 0) - (b.ordem || 0);
                    });

                    distinctRowFilhas.forEach(function (filha) {
                        // //console.log(("ADDING FILHA")
                        addLinha(filha, linhaRecords, linhaToRender, renderedLinhas, true, true, false);
                    });


                });


            }
            else {
                var isFilhaRendered = mrendThis.GTMPFilhas.find(function (filha) {

                    return filha.codigo.trim() == linhaToRender.codigo.trim();
                });

                if (!isFilhaRendered) {

                    var rowid = generateUUID();
                    var dstRow = {
                        rowid: rowid,
                        linkid: "",
                        codigolinha: linhaToRender.codigo,
                    }

                    var linhasFilhas = [];

                    linhasFilhas = mrendThis.reportConfig.config.linhas.filter(function (linha) {
                        return linha.linkstamp == linhaToRender.linhastamp
                    });



                    linhasFilhas.sort(function (a, b) {
                        return (a.ordem || 0) - (b.ordem || 0);
                    });

                    addLinha(dstRow, records, linhaToRender, renderedLinhas, linhasFilhas.length > 0, linhaToRender.modelo != true, true);

                    if (linhasFilhas.length > 0) {
                        processFilhasRecursivo(linhaToRender, dstRow.rowid, renderedLinhas, true);
                    }


                }


            }

        })




        var tmpGrData = []
        mrendThis.GGridData = mrendThis.GRenderedLinhas.map(function (lin) {

            var someCellObjectConfig = mrendThis.GCellObjectsConfig.find(function (cellObj) {
                return cellObj.rowid.trim() == lin.rowid.trim()
            })

            if (!lin.linkid.trim().replaceAll(" ", "") && someCellObjectConfig) {
                tmpGrData.push(lin.UIObject);
            }
        });

        mrendThis.GGridData = tmpGrData;
        mrendThis.GTMPFilhas = []


        return renderedLinhas;

    }


    function processFilhasRecursivo(linhaPai, rowidPai, renderedLinhas, novoRegisto) {
        var linhasFilhas = mrendThis.reportConfig.config.linhas.filter(function (linha) {
            return linha.linkstamp == linhaPai.linhastamp;
        });

        linhasFilhas.sort(function (a, b) {
            return (a.ordem || 0) - (b.ordem || 0);
        });

        linhasFilhas.forEach(function (linhaFilha) {
            var rowidFilha = generateUUID();
            var dstRowFilha = {
                rowid: rowidFilha,
                linkid: rowidPai,
                codigolinha: linhaFilha.codigo,
            };

            addLinha(dstRowFilha, [], linhaFilha, renderedLinhas, true, linhaFilha.modelo != true, novoRegisto);
            mrendThis.GTMPFilhas.push(linhaFilha);
            processFilhasRecursivo(linhaFilha, rowidFilha, renderedLinhas, novoRegisto);


        });
    }


    function addLinha(distinctRow, linhaRecords, linhModelo, renderedLinhas, isParent, renderCelula, novoRegisto) {

        var linhaAdicionada = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == distinctRow.rowid
        });
        if (linhaAdicionada) {

            return;
        }

        var UIObject = {
            rowid: distinctRow.rowid,
            id: distinctRow.rowid
        }


        var linha = new Linha(linhModelo);




        var rendered = new RenderedLinha({ codigo: distinctRow.codigolinha, novoregisto: false, isParent: isParent, rowid: distinctRow.rowid, linkid: distinctRow.linkid, parentid: "", config: linha, UIObject: UIObject, novoregisto: novoRegisto });

        if (distinctRow.ordem) {
            rendered.ordem = distinctRow.ordem

        }


        if (!rendered.linkid && linha.linkstamp) {

            var configuracaoLinha = mrendThis.reportConfig.config.linhas.find(function (linhaC) {
                return linhaC.linhastamp == linha.linkstamp

            });

            if (configuracaoLinha) {


                var findOnRecordsResult = linhaRecords.find(function (rec) {
                    return rec.codigolinha == configuracaoLinha.codigo
                });

                if (findOnRecordsResult) {
                    rendered.linkid = findOnRecordsResult.rowid;
                    distinctRow.linkid = findOnRecordsResult.rowid;
                }

            }


        }


        renderedLinhas.push(rendered);

        var recFlt = linhaRecords.filter(function (rec) {
            return rec.rowid == distinctRow.rowid
        }
        );
        rendered.addToLocalRenderedLinhasList(recFlt, distinctRow, renderCelula, true);
    }

    function RenderHandler(records) {

        ViewRender(records)

    }

    function ViewRender(records) {


        initTableDataAndContainer();


        mrendThis.GRenderedColunas = setColunasRender(mrendThis.reportConfig.config.colunas, records);


        var renderedLinhas = getRenderedLinhas(records);

        mrendThis.GRenderedLinhas = renderedLinhas

        RenderSourceTable();

    }


    function getCellObjectConfigByCellId(cellId) {

        return mrendThis.GCellObjectsConfig.find(function (obj) {
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

        updateData.changedData[cellObjectConfig.bindData.sourceBind] = handleDataTypeDB(cellObjectConfig.dataType, val);

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
            var row = mrendThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid == rowId
            });

            if (row) {

                mrendThis.GRenderedLinhas = mrendThis.GRenderedLinhas.filter(function (linha) {
                    return linha.rowid != rowId
                })

                row.deleteRow();
            }


        })

        $(document).off("click", ".addFilho").on("click", ".addFilho", function () {
            var rowId = $(this).closest("tr").attr("id");
            var linha = mrendThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid == rowId
            });

            if (linha) {

                linha.addLinhaFilha();
                $('#' + GTableData.tableId).simpleTreeTable();
            }

            ////console.log(("row", row)

        })
    }




    function handleReportRecords() {
        return new Promise(function (resolve, reject) {
            var stampAtual = (mrendThis.recordData.stamp || "").trim();
            var stampArmazenado = getSourceStamp().trim();



            return databaseAndTableHasRecords(mrendThis.db, mrendThis.tableSourceName)
                .then(function (result) {

                    if (stampAtual === stampArmazenado) {
                        mrendThis.records = result.data || [];
                        return resolve({ refetchDb: false, records: result.data || [] });
                    }

                    storeDataSourceStamp(mrendThis.recordData.stamp);

                    //console.log(("Source stamp updated or local DB empty, refetching data...", mrendThis.recordData.stamp, stampArmazenado);

                    if (mrendThis.remoteFetch === true) {

                        return getDataFromRemote()
                            .then(function (remoteData) {
                                console.log("Remote data fetched successfully.........DNELSE", remoteData);
                                mrendThis.records = remoteData && remoteData.data ? remoteData.data : [];
                                return resolve({ refetchDb: true, records: mrendThis.records, remoteFetch: true });
                            })
                            .catch(reject);
                    }

                    resolve({ refetchDb: true, records: mrendThis.records });
                })
                .catch(reject);
        }).then(function (result) {

            return new Promise(function (resolve, reject) {

                if (result.refetchDb) {
                    return deleteAllRecords(mrendThis.table).then(function (data) {

                        var dbConverstion = ConvertDbTableToMrendObject(mrendThis.records, mrendThis.dbTableToMrendObject);
                        mrendThis.records = dbConverstion;
                        return addBulkData(mrendThis.db, mrendThis.table, dbConverstion).then(function (data) {
                            return resolve(result);
                        })
                    })
                }
                return resolve(result)
            })
        });
    }
    this.clearSourceStamp = function () {

        localStorage.removeItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName);


    }


    function addLinhaByModelo(modelo) {


        var linhaModelo = mrendThis.reportConfig.config.linhas.find(function (linha) {

            return linha.codigo == modelo
        });

        var renderedLinha
        if (linhaModelo) {

            var codigo = linhaModelo.codigo + "___" + generateTimestampNumber(10);
            var ordem = generateLinhaOrdem();
            renderedLinha = new RenderedLinha({ ordem: ordem, codigo: codigo, novoregisto: true, rowid: generateUUID(), linkid: "", parentid: "", config: linhaModelo })

            renderedLinha.UIObject = {
                rowid: renderedLinha.rowid,
                id: renderedLinha.rowid
            };


            renderedLinha.addToLocalRenderedLinhasList([], "", {}, true, true);




        }

        addNewRecords();


        return renderedLinha;


    }
    function generateTableButtons() {

        if (!mrendThis.enableEdit) {
            return;
        }


        var tableButtonsId = "tableButtons" + mrendThis.table;
        var tableButtons = $("<div id='" + tableButtonsId + "' class='col-md-12 pull-left tableButtons'></div>");
        $(mrendThis.containerToRender).after(tableButtons);

        mrendThis.reportConfig.config.relatorio.modelos.forEach(function (modelo) {


            var botaoId = "btnAdd" + modelo;
            var configuracaoLinha = mrendThis.reportConfig.config.linhas.find(function (linha) {
                return linha.codigo == modelo

            });
            var descbtnModelo = "Adiciona linha";

            if (configuracaoLinha) {
                descbtnModelo = configuracaoLinha.descbtnModelo || "Adiciona linha";
            }
            var botaoAdLinha = {
                style: "margin-top:1.2em",
                buttonId: botaoId,
                classes: "btn btn-primary btn-sm",
                customData: " type='button' data-modelo='" + modelo + "' data-tooltip='true' data-original-title='" + descbtnModelo + "' ",
                label: descbtnModelo + " <span style='color:white;'  class='glyphicon glyphicon-plus'></span>",
                onClick: "",
            };

            var buttonHtml = generateButton(botaoAdLinha);

            $("#" + tableButtonsId).append(buttonHtml);
            $("#" + botaoId).on("click", function () {
                var modelo = $(this).data("modelo");



                var linhaByModeloResult = addLinhaByModelo(modelo);

                // //console.log(("Linha adicionada por modelo", linhaByModeloResult)
                mrendThis.GTable.addRow(linhaByModeloResult.UIObject, false).then(function (row) {
                    row.treeExpand();
                    mrendThis.applyTabulatorStylesWithJquery(mrendThis);

                });


                //   thisTable.addLinhaByModelo(modelo);
            });

        })








        var colunasModelos = mrendThis.reportConfig.config.colunas.filter(function (coluna) {
            return coluna.modelo == true;
        })

        if (colunasModelos.length > 0) {

            var tableButtonsColId = "tableButtonsCol" + mrendThis.table;
            var tableButtonsCol = $("<div id='" + tableButtonsColId + "' class='col-md-12 pull-left tableButtonsCol'></div>");
            $(mrendThis.containerToRender).before(tableButtonsCol);

        }


        colunasModelos.forEach(function (coluna) {

            if (coluna.addBtn) {

                var botaoId = "btnAddColuna" + coluna.codigocoluna;
                var descbtnModelo = coluna.descbtnModelo || "Adiciona coluna";
                var botaoAddColuna = {
                    style: "margin-bottom:0.6em;",
                    buttonId: botaoId,
                    classes: "btn btn-primary btn-sm",
                    customData: " type='button' data-modelo='" + coluna.codigocoluna + "' data-tooltip='true' data-original-title='" + descbtnModelo + "' ",
                    label: descbtnModelo + " <span style='color:white;'  class='glyphicon glyphicon-plus'></span>",
                    onClick: "",
                };

                var buttonHtml = generateButton(botaoAddColuna);

                $("#" + tableButtonsColId).append(buttonHtml);
                $("#" + botaoId).on("click", function () {
                    var modelo = $(this).data("modelo");
                    mrendThis.openAddColunaModal(modelo);

                });

            }
        })
    }


    function generateTimestampNumber(size) {
        size = size || 10

        if (!Number.isInteger(size) || size <= 0) {
            throw new Error("O parâmetro 'size' deve ser um inteiro positivo.");
        }

        var ts = Date.now().toString();
        var tsLen = ts.length;

        if (tsLen >= size) {

            return Number(ts.slice(0, size));
        }

        var extra = (
            performance.now().toString().replace('.', '') +
            Math.floor(Math.random() * 1e6).toString()
        ).padEnd(size - tsLen, '0');

        var full = ts + extra;
        var fixed = full.slice(0, size);

        return size <= 15 ? Number(fixed) : fixed;
    }

    this.openAddColunaModal = function (modelo) {

        $("#modalAddColuna").remove();
        var sufixoForm = "addColunaForm";
        var containerId = "Container" + sufixoForm;

        var sourceData = {
            sourceTable: "coluna",
            sourceKey: "colunaid"
        }
        var containers = []

        containers = [{
            colSize: 12,
            style: "margin-bottom:0.5em;",
            content: {
                contentType: "input",
                type: "text",
                id: "desccoluna",
                classes: " colunadynam-item-input form-control input-sm ",
                customData: " v-model='colunaTmpSetup.desccoluna' ",
                style: "",
                selectCustomData: " v-model='colunaTmpSetup.desccoluna'",
                fieldToOption: "",
                fieldToValue: "",
                label: "Descrição da Coluna",
                selectData: [],
                value: "Coluna",
                event: "",
                placeholder: ""
            }
        }]


        $("#modalRendConfigItem").remove()
        var containerData = {
            containerId: containerId,
            spinnerId: "overlay" + sufixoForm,
            hasSpinner: false,
            customData: "",
            sourceData: sourceData,
            items: containers
        }
        var formContainerResult = GenerateCustomFormContainer(containerData);

        var modalBodyHtml = ""
        modalBodyHtml += formContainerResult;



        var modalAddColunaConfig = {
            title: "Dados da coluna ",
            id: "modalAddColuna",
            customData: "",
            otherclassess: "",
            body: modalBodyHtml,
            footerContent: "<button type='button' class='btn btn-primary' id='btnAddColunaDyn'>Adicionar Coluna</button>",
        };
        var modalHTML = generateModalHTML(modalAddColunaConfig);

        $("#maincontent").append(modalHTML);
        $("#modalAddColuna").modal("show");


        var dadosColunaConfig = mrendThis.reportConfig.config.colunas.find(function (coluna) {
            return coluna.codigocoluna == modelo;
        });

        var colConfig = new Coluna(dadosColunaConfig);

        var maxOrdemColuna = mrendThis.GRenderedColunas.reduce(function (max, col) {
            return Math.max(max, col.ordem || 0);
        }, 0);

        var ordemColuna = maxOrdemColuna + 1;
        var colunaToRender = new RenderedColuna({
            // codigocoluna: colConfig.codigocoluna + "___" + generateTimestampNumber(10),
            codigocoluna: generateTimestampNumber(10),
            ordem: ordemColuna,
            desccoluna: "Coluna " + ordemColuna,
            config: colConfig
        });

        mrendThis.colunaTmpSetup = colunaToRender

        PetiteVue.createApp({
            colunaTmpSetup: mrendThis.colunaTmpSetup
        }).mount('#maincontent');


        $("#btnAddColunaDyn").off("click").on("click", function () {

            var desccoluna = mrendThis.colunaTmpSetup.desccoluna || "Coluna";
            if (!desccoluna) {
                alert("Descrição da coluna é obrigatória");
                return;
            }

            var newColuna = mrendThis.colunaTmpSetup;

            var colunas = [newColuna]

            mrendThis.addColunasByModelo(colunas);


            $("#modalAddColuna").modal("hide");
            mrendThis.colunaTmpSetup = new RenderedColuna({})



        })


    }

    this.deleteColuna = function (codigocoluna) {
        var colunaToDelete = mrendThis.GRenderedColunas.find(function (coluna) {
            return coluna.codigocoluna == codigocoluna;
        });

        if (!colunaToDelete) {
            throw new Error("Coluna para remover com código " + codigocoluna + " não encontrada.");
        }

        mrendThis.GRenderedColunas = mrendThis.GRenderedColunas.filter(function (coluna) {
            return coluna.codigocoluna != codigocoluna;
        });

        mrendThis.GTable.deleteColumn(colunaToDelete.codigocoluna, false);
        mrendThis.GCellObjectsConfig = mrendThis.GCellObjectsConfig.filter(function (cellObj) {
            return cellObj.codigocoluna != codigocoluna;
        });

        mrendThis.db[mrendThis.table].where("coluna").equals(codigocoluna).delete().then(function () {
            //console.log(("Coluna deletada com sucesso:", codigocoluna);
        });
    }
    this.addColunasByModelo = function (colunas) {

        var lastRendered = ""

        colunas.forEach(function (coluna) {

            var renderedLinhas = mrendThis.GRenderedLinhas.filter(function (linha) {

                return linha.config.modelo != true;
            });

            renderedLinhas.forEach(function (linha) {

                setCelula({}, linha, coluna, [], coluna.config.categoria, "", {})
            })

            mrendThis.GRenderedColunas.push(coluna);
            lastRendered = coluna.codigocoluna;
            addNewRecords();

        });
        var columns = [];
        addTabulatorColumns(colunas, columns);
        columns.forEach(function (col) {

            mrendThis.GTable.addColumn(col, false).then(function () {
                ////console.log(("Coluna adicionada:", col);
            });



        });

        var colunasSetFim = mrendThis.GRenderedColunas.filter(function (coluna) {

            return coluna.config.setfim == true;
        });

        colunasSetFim.sort(function (a, b) {
            return (b.ordem || 0) - (a.ordem || 0);
        });

        // //console.log(("colunasSetFim", colunasSetFim)
        colunasSetFim.forEach(function (coluna) {

            var columnExists = mrendThis.GTable.getColumn(lastRendered.trim())
            if (columnExists) {

                mrendThis.GTable.moveColumn(coluna.codigocoluna.trim(), lastRendered.trim(), true);
            }

        })



        mrendThis.applyTabulatorStylesWithJquery(mrendThis);
    }

    function findRowByIdColuna(rowid, coluna, value) {
        // Busca recursiva em todas as linhas (inclusive filhas)
        function search(rows) {
            rows.forEach(function (row) {

                if (row.getData().rowid == rowid) {

                    var updateData = {};
                    var rowData = row.getData();
                    rowData[coluna] = value;

                    Object.keys(rowData).forEach(function (key) {

                        if (key !== "_children" && key !== "id") {

                            updateData[key] = rowData[key];
                        }

                    });

                    updateData[coluna] = value;

                    var cellObjectConfig = mrendThis.GCellObjectsConfig.find(function (obj) {
                        return obj.rowid == rowid && obj.codigocoluna == coluna;
                    });


                    row.update(updateData);


                    if (cellObjectConfig) {
                        cellObjectConfig.valor = updateData[coluna];

                    }
                    else {
                        console.warn("CellObjectConfig não encontrado para rowid:", rowid, "e coluna:", coluna);
                    }




                    return row;
                }

                var children = row.getTreeChildren ? row.getTreeChildren() : [];
                var found = search(children);
                if (found) return found;
            })
            return null;
        }
        return search(mrendThis.GTable.getRows());
    }

    function findRowById(rowid, coluna) {
        // Busca recursiva em todas as linhas (inclusive filhas)
        function search(rows) {
            rows.forEach(function (row) {

                if (row.getData().rowid == rowid) {

                    var updateData = {};
                    var rowData = row.getData();

                    Object.keys(rowData).forEach(function (key) {

                        if (key !== "_children" && key !== "id") {

                            updateData[key] = rowData[key];
                        }

                    });

                    var cellObjectConfig = mrendThis.GCellObjectsConfig.find(function (obj) {
                        return obj.rowid == rowid && obj.codigocoluna == coluna;
                    });


                    if (cellObjectConfig) {
                        cellObjectConfig.valor = updateData[coluna];
                        row.update(updateData);
                    }
                    else {
                        console.warn("CellObjectConfig não encontrado para rowid:", rowid, "e coluna:", coluna);
                    }




                    return row;
                }

                var children = row.getTreeChildren ? row.getTreeChildren() : [];
                var found = search(children);
                if (found) return found;
            })
            return null;
        }
        return search(mrendThis.GTable.getRows());
    }
    this.updateTableRow = function (rowid, rowData, coluna) {

        /* var updateData = {};
 
         Object.keys(rowData).forEach(function (key) {
 
             if (key !== "_children" && key !== "id") {
 
                 updateData[key] = rowData[key]
             }
 
 
         });*/

        var row = findRowById(rowid, coluna);


    }

    this.updateTableRowColumnValue = function (rowid, rowData, coluna, value) {

        var row = findRowByIdColuna(rowid, coluna, value);


    }


    function loadAssetsPromiseAll() {
        var scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.3/dexie.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
            'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js',
            'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js',
            'https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js',
            'https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS',
            'https://unpkg.com/petite-vue',
            'https://uicdn.toast.com/tui-grid/latest/tui-grid.min.js',
            'https://cdn.jsdelivr.net/npm/observable-slim@0.1.6/observable-slim.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/imask/7.6.1/imask.js'
        ];

        var cssLinks = [
            { href: 'https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css', rel: 'stylesheet' },
            { href: 'https://uicdn.toast.com/tui-grid/latest/tui-grid.min.css', rel: 'stylesheet' },
            { href: 'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css', rel: 'stylesheet' }
        ];

        // Carrega CSS normalmente (não precisa Promise)
        cssLinks.forEach(function (asset) {
            if (!document.querySelector('link[href="' + asset.href + '"]')) {
                var link = document.createElement('link');
                link.href = asset.href;
                link.rel = asset.rel;
                document.head.appendChild(link);
            }
        });

        // Função para carregar um script e retornar uma Promise
        function loadScriptPromise(src) {
            return new Promise(function (resolve, reject) {
                // Já existe?
                if (Array.from(document.getElementsByTagName('script')).some(function (s) {
                    return s.src && s.src.indexOf(src) !== -1;
                })) {
                    resolve();
                    return;
                }
                var script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // Retorna uma Promise que resolve quando TODOS os scripts carregarem
        return Promise.all(scripts.map(loadScriptPromise));
    }



    this.applyTabulatorStylesWithJquery = function (repInstance) {

        var customStyles = {}

        if (repInstance.reportConfig.config.extra) {
            customStyles = repInstance.reportConfig.config.extra.customStyles || {};
        }
        // Tabulator container
        $(".tabulator").css({
            "background-color": "white",
            "border-radius": "10px",
            "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
            "border": "none"
        });

        // Header
        $(".tabulator .tabulator-header").css({
            "background-color": customStyles.headerBackground ? customStyles.headerBackground : getColorByType("primary").background,
            "border-bottom": "none",
            "border-radius": "10px 10px 0 0",
            "padding": "0px",
            "font-size": "14px",
            "font-family": "Nunito, sans-serif",
            "font-weight": "bold"
            //"height": "70px",
        });


        // Header columns
        $(".tabulator .tabulator-header .tabulator-col").css({
            "background-color": customStyles.headerBackground ? customStyles.headerBackground : getColorByType("primary").background,
            "color": "white",
            "border-right": "none",
            "border-right": "1px solid rgba(255, 255, 255, 0.2)",
            /*  "padding": "12px 15px",*/
            "font-weight": "500"
        });



        /* $(".tabulator .tabulator-header .tabulator-col").css({
             "background-color": customStyles.headerBackground ? customStyles.headerBackground : "#0765b7",
             "color": "white",
             "border-right": "1px solid rgba(255, 255, 255, 0.2)",
             "padding": "12px 15px",
             "font-weight": "500"
         });*/

        $(".tabulator .tabulator-header .tabulator-col:last-child").css({
            "border-top-right-radius": "10px",
            "border-right": "none"
        });

        $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
        $(".tabulator .tabulator-header .tabulator-col:last-child").css("border-top-right-radius", "10px");

        // Rows
        $(".tabulator-row").css({
            "border-bottom": "0px solid #e0e6ed",
            "transition": "background-color 0.2s ease"
        });

        $(".tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid red");
        $(".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid #0000");

        // Cells
        $(".tabulator-cell").css({
            "padding": "12px 15px",
            "border-right": "none"
        });

        // Botão adicionar
        /*  $(".btn-add").css({
              "margin": "0 0 15px 0",
              "padding": "10px 18px",
              "background-color": "#0765b7",
              "color": "white",
              "border": "none",
              "border-radius": "6px",
              "cursor": "pointer",
              "font-weight": "500",
              "font-size": "14px",
              "transition": "all 0.2s ease",
              "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
          }).hover(
              function () {
                  $(this).css({
                      "background-color": "#06539e",
                      "transform": "translateY(-1px)",
                      "box-shadow": "0 4px 12px rgba(7, 101, 183, 0.3)"
                  });
              },
              function () {
                  $(this).css({
                      "background-color": "#0765b7",
                      "transform": "",
                      "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
                  });
              }
          );
  
          $(".btn-add i").css("margin-right", "6px");
  
          // Botões de ação
          $(".action-btn").css({
              "background": "none",
              "border": "none",
              "cursor": "pointer",
              "font-size": "15px",
              "margin": "0 5px",
              "transition": "all 0.2s ease"
          }).hover(
              function () {
                  $(this).css({
                      "transform": "scale(1.1)"
                  });
              },
              function () {
                  $(this).css({
                      "transform": ""
                  });
              }
          );
  */
        // Tree/indent
        $(".tabulator-row .tabulator-cell.tabulator-tree-col").css("padding-left", "15px");
        $(".tabulator-tree-branch").css({
            "border-left": "2px solid #d1e3ff",
            "margin-left": "7.5px"
        });
        $(".tabulator-tree-level-1 .tabulator-cell.tabulator-tree-col").css("padding-left", "30px");
        $(".tabulator-tree-level-2 .tabulator-cell.tabulator-tree-col").css("padding-left", "45px");
        $(".tabulator-tree-level-3 .tabulator-cell.tabulator-tree-col").css("padding-left", "60px");

        // Tree controls
        $(".tabulator-row .tabulator-cell .tabulator-data-tree-control").css({
            "align-items": "center",
            "background": "rgb(255 255 255 / 10%)",
            "border": "1px solid #2975dd",
            "border-radius": "2px",
            "display": "inline-flex",
            "height": "11px",
            "justify-content": "center",
            "margin-right": "5px",
            "overflow": "hidden",
            "vertical-align": "middle",
            "width": "11px"
        });

        $(".tabulator-tree-collapse, .tabulator-tree-expand").css({
            "color": "#0765b7",
            "border-radius": "50%",
            "width": "18px",
            "height": "18px",
            "display": "inline-flex",
            "align-items": "center",
            "justify-content": "center",
            "margin-right": "8px",
            "transition": "all 0.2s ease"
        }).hover(
            function () { $(this).css("background-color", "rgba(7, 101, 183, 0.1)"); },
            function () { $(this).css("background-color", ""); }
        );

        // Edit list
        $(".tabulator-edit-list").css({
            "z-index": "9999",
            "position": "absolute",
            "border-radius": "6px",
            "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.1)",
            "border": "1px solid #e0e6ed"
        });
        $(".tabulator-edit-list .tabulator-edit-list-item").css("padding", "8px 15px");
        $(".tabulator-edit-list .tabulator-edit-list-item.active").css({
            "background-color": "rgba(7, 101, 183, 0.1)",
            "color": "#0765b7"
        });







    };

    this.render = function () {
        return loadAssetsPromiseAll().then(function () {


            return InitDB(mrendThis.dbTableToMrendObject.dbName, mrendThis.schemas).then(function (initDBResult) {
                if (mrendThis.resetSourceStamp) {
                    mrendThis.clearSourceStamp();
                }
                handleReportRecords().then(function (reportRecordResult) {
                    RenderHandler(mrendThis.records)
                })
            });
        });
    }

    this.getDbData = function () {

        return new Promise(function (resolve, reject) {
            mrendThis.db[mrendThis.tableSourceName].toArray().then(function (records) {

                var recordsConverted = ConvertMrendObjectToTable(records)


                return resolve(recordsConverted);
            }).catch(function (error) {
                console.error("Erro ao obter dados do banco:", error);
                return reject(error);
            })

        });

    }




}
function handleZoomMrend(button, dbName, tableName) {
    var $button = $(button);
    var $container = $($button.data("container"));
    var zoomIn = $button.data("zoomin");
    var zoomOut = $button.data("zoomout");

    var currentScale = parseFloat($container.attr("data-zoom-scale")) || 1.0;
    var change = zoomIn ? 0.05 : zoomOut ? -0.05 : 0;
    var newScale = currentScale + change;

    console.log("newScale", newScale)
    if (newScale < 0.25 || newScale > 1.0) return;

    animateZoom($container, currentScale, newScale, 200);
    $container.attr("data-zoom-scale", newScale);

    localStorage.setItem("UICONFIG_" + dbName + "_" + tableName, JSON.stringify({
        zoomScale: newScale
    }));
}

function animateZoom($container, from, to, duration) {
    var start = null;
    var step = function (timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var scale = from + (to - from) * progress;
        $container.css("zoom", scale);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

function loadAssetsWithGetScript() {

    var scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.3/dexie.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
        'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js',
        'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js',
        'https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js',
        'https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS',
        'https://unpkg.com/petite-vue',
        'https://uicdn.toast.com/tui-grid/latest/tui-grid.min.js',
        'https://cdn.jsdelivr.net/npm/observable-slim@0.1.6/observable-slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/imask/7.6.1/imask.js'
    ];

    // Carrega CSS normalmente
    var cssLinks = [
        { href: 'https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css', rel: 'stylesheet' },
        { href: 'https://uicdn.toast.com/tui-grid/latest/tui-grid.min.css', rel: 'stylesheet' },
        { href: 'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css', rel: 'stylesheet' }
    ];
    cssLinks.forEach(function (asset) {
        if (!document.querySelector('link[href="' + asset.href + '"]')) {
            var link = document.createElement('link');
            link.href = asset.href;
            link.rel = asset.rel;
            document.head.appendChild(link);
        }
    });

    // Carrega scripts usando jQuery.getScript se ainda não existem
    scripts.forEach(function (src) {
        var exists = Array.from(document.getElementsByTagName('script')).some(function (s) {
            return s.src && s.src.indexOf(src) !== -1;
        });
        if (!exists) {
            $.getScript(src);
        }
    });
}

// Chame no início do seu JS principal



$(document).ready(function () {
    var cssContent = "";
    cssContent += ".mrend-input-cell{";
    cssContent += "    background: rgb(239, 240, 241);";
    cssContent += "    text-align: right;";
    cssContent += "    padding: 5px 15px 5px 5px;";
    cssContent += "    border-radius: 4px;";
    cssContent += "     overflow: auto; ";
    cssContent += "    width: 100%;";
    //cssContent += "    resize: none;";                /* evita resize manual */
    //cssContent += "    overflow: hidden;";            /* esconde scrollbar */
    //cssContent += "    white-space: pre-wrap;";        /* mantém quebras de linha */
    //cssContent += "    word-wrap: break-word;";        /* quebra palavras grandes */
    cssContent += "    }";
    cssContent += ".tabulator-row {";
    cssContent += "    border-bottom: 0px solid #e0e6ed!important;";
    cssContent += "    transition: background-color 0.2s ease!important;";
    cssContent += "    background-color: white;";
    cssContent += "}";


    $('head').append('<style>' + cssContent + '</style>');
    loadAssetsWithGetScript();
    // loadMrendAssets()

});


function assetExists(type, url) {
    if (type === 'script') {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf(url) !== -1) {
                return true;
            }
        }
    } else if (type === 'link') {
        var links = document.getElementsByTagName('link');
        for (var i = 0; i < links.length; i++) {
            if (links[i].href && links[i].href.indexOf(url) !== -1) {
                return true;
            }
        }
    }
    return false;
}

function loadMrendAssets() {



    var assets = [

        { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.3/dexie.min.js' },
        { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js' },
        { type: 'script', src: 'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js' },
        { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js' },
        { type: 'link', href: 'https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css', rel: 'stylesheet' },
        { type: 'script', src: 'https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js' },
        { type: 'script', src: 'https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS' },
        { type: 'script', src: 'https://unpkg.com/petite-vue' },
        { type: 'script', src: 'https://cdn.jsdelivr.net/npm/observable-slim@0.1.6/observable-slim.min.js' },
        { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/imask/7.6.1/imask.js' }
    ];

    assets.forEach(function (asset) {
        if (asset.type === 'script') {
            if (!assetExists('script', asset.src)) {
                var script = document.createElement('script');
                script.src = asset.src;
                script.async = false;
                document.head.appendChild(script);
            }
        } else if (asset.type === 'link') {
            if (!assetExists('link', asset.href)) {
                var link = document.createElement('link');
                link.href = asset.href;
                link.rel = asset.rel;
                document.head.appendChild(link);
            }
        }
    });
}





function applyTabulatorStylesWithJquery() {

    var customStyles = {}

    //console.log(("mrendThis.reportConfig", mrendThis.reportConfig)
    if (mrendThis.reportConfig.config.extra) {
        customStyles = mrendThis.reportConfig.config.extra.customStyles || {};
    }
    // Tabulator container
    $(".tabulator").css({
        "background-color": "white",
        "border-radius": "10px",
        "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "border": "none"
    });

    // Header
    $(".tabulator .tabulator-header").css({
        "background-color": customStyles.headerBackground ? customStyles.headerBackground : "#0765b7",
        "border-bottom": "none",
        "border-radius": "10px 10px 0 0",
        "padding": "13px"
    });

    // Header columns
    $(".tabulator .tabulator-header .tabulator-col").css({
        "background-color": customStyles.headerBackground ? customStyles.headerBackground : "#0765b7",
        "color": "white",
        "border-right": "none",
        /*  "padding": "12px 15px",*/
        "font-weight": "500"
    });

    $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
    $(".tabulator .tabulator-header .tabulator-col:last-child").css("border-top-right-radius", "10px");

    // Rows
    $(".tabulator-row").css({
        "border-bottom": "1px solid #e0e6ed",
        "transition": "background-color 0.2s ease"
    });
    // $(".tabulator-row.tabulator-row-even").css("background-color", "#fcfdfe");
    $(".tabulator-row")/*.hover(
        function () { $(this).css("background-color", "#f5f9ff"); },
        function () { $(this).css("background-color", ""); }
    );*/

    $(".tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid red");
    $(".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid #0000");


    // Cells
    $(".tabulator-cell").css({
        "padding": "12px 15px",
        "border-right": "none"
    });

    // Botão adicionar
    $(".btn-add").css({
        "margin": "0 0 15px 0",
        "padding": "10px 18px",
        "background-color": "#0765b7",
        "color": "white",
        "border": "none",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-weight": "500",
        "font-size": "14px",
        "transition": "all 0.2s ease",
        "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
    }).hover(
        function () {
            $(this).css({
                "background-color": "#06539e",
                "transform": "translateY(-1px)",
                "box-shadow": "0 4px 12px rgba(7, 101, 183, 0.3)"
            });
        },
        function () {
            $(this).css({
                "background-color": "#0765b7",
                "transform": "",
                "box-shadow": "0 2px 8px rgba(7, 101, 183, 0.2)"
            });
        }
    );

    $(".btn-add i").css("margin-right", "6px");

    // Botões de ação
    $(".action-btn").css({
        "background": "none",
        "border": "none",
        //  "color": "#5a8de6",
        "cursor": "pointer",
        "font-size": "15px",
        "margin": "0 5px",
        "transition": "all 0.2s ease"
    }).hover(
        function () {
            $(this).css({
                //   "color": "#0765b7",
                "transform": "scale(1.1)"
            });
        },
        function () {
            $(this).css({
                //   "color": "#5a8de6",
                "transform": ""
            });
        }
    );

    // Tree/indent
    $(".tabulator-row .tabulator-cell.tabulator-tree-col").css("padding-left", "15px");
    $(".tabulator-tree-branch").css({
        "border-left": "2px solid #d1e3ff",
        "margin-left": "7.5px"
    });
    $(".tabulator-tree-level-1 .tabulator-cell.tabulator-tree-col").css("padding-left", "30px");
    $(".tabulator-tree-level-2 .tabulator-cell.tabulator-tree-col").css("padding-left", "45px");
    $(".tabulator-tree-level-3 .tabulator-cell.tabulator-tree-col").css("padding-left", "60px");

    // Tree controls
    $(".tabulator-row .tabulator-cell .tabulator-data-tree-control").css({
        "align-items": "center",
        "background": "rgb(255 255 255 / 10%)",
        "border": "1px solid #2975dd",
        "border-radius": "2px",
        "display": "inline-flex",
        "height": "11px",
        "justify-content": "center",
        "margin-right": "5px",
        "overflow": "hidden",
        "vertical-align": "middle",
        "width": "11px"
    });

    $(".tabulator-tree-collapse, .tabulator-tree-expand").css({
        "color": "#0765b7",
        "border-radius": "50%",
        "width": "18px",
        "height": "18px",
        "display": "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        "margin-right": "8px",
        "transition": "all 0.2s ease"
    }).hover(
        function () { $(this).css("background-color", "rgba(7, 101, 183, 0.1)"); },
        function () { $(this).css("background-color", ""); }
    );

    // Edit list
    $(".tabulator-edit-list").css({
        "z-index": "9999",
        "position": "absolute",
        "border-radius": "6px",
        "box-shadow": "0 5px 15px rgba(0, 0, 0, 0.1)",
        "border": "1px solid #e0e6ed"
    });
    $(".tabulator-edit-list .tabulator-edit-list-item").css("padding", "8px 15px");
    $(".tabulator-edit-list .tabulator-edit-list-item.active").css({
        "background-color": "rgba(7, 101, 183, 0.1)",
        "color": "#0765b7"
    });

    // Scrollbar (apenas para webkit browsers)
    // $("body").append('<style>::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; } ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }</style>');
}


function getCampoMrend() {

    return "campo"
}

function MrendObject(data) {

    this.cellId = data.cellId || "";
    this.rowid = data.rowid || "";
    this.coluna = data.coluna || "";
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
    this.sourceKeyValue = data.sourceKeyValue || "";
    this.valor = data.valor || "";
    this.campo = data.campo || "";
    this.linkId = data.linkId || "";
    this.linkField = data.linkField || "";
    this.codigolinha = data.codigolinha || "";
    this.ordemField = data.ordemField || "";
    this.cellIdField = data.cellIdField || "";
    this.colunaField = data.colunaField || "";
    this.tipocolField = data.tipocolField || "";
    this.tipocol = data.tipocol || "";
    this.descLinhaField = data.descLinhaField || "";
    this.descLinha = data.descLinha || "";
    this.descColunaField = data.descColunaField || "";
    this.ordemColunaField = data.ordemColunaField || "";
    this.ordemColuna = data.ordemColuna || 0;
    this.descColuna = data.descColuna || "";
    this.ordem = data.ordem || 0;

}

function getMrendSchema(tableSourceName) {

    var schema = new MrendObject({});

    return { datasourceName: "MrendDb", tableSourceName: tableSourceName, tableSourceSchema: schema }

}

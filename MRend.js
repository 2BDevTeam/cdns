

function Mrend(options) {


    var globalThis = this;

    this.GTable = {};
    this.GDefaultConfig = undefined;
    this.GRenderData = {};
    this.GReportConfig = new ReportConfig({});
    this.GRenderedData = undefined;
    this.GTableData = new TableHtml({});
    this.GRows = [];
    this.GRenderedColunas = [new RenderedColuna({})];
    this.GRenderedLinhas = [new RenderedLinha({})];
    this.GGridData = []
    this.GContainerToRender = "#campos > .row:last";
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
    this.GNewRecords = [];

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
        this.tableKey = data.tableKey || "";
        this.extras = data.extras ? new DbTableExtras(data.extras) : {};
    }

    // Classe para extras de dbTableToMrendObject
    function DbTableExtras(data) {
        this.ordemField = data.ordemField || "";
        this.linkfield = data.linkfield || "";
        this.cellIdField = data.cellIdField || "";
        this.colunaField = data.colunaField || "";
    }

    // Classe para reportConfig
    function ReportConfigWrapper(data) {
        this.config = new MrendConfigData(data.config) || new MrendConfigData({ celulas: [], linhas: [], colunas: [], relatorio: {} }); // Default empty config
    }


    function MrendConfigData(data) {

        this.celulas = Array.isArray(data.celulas) ? data.celulas.map(function (s) { return new Celula(s); }) : [];
        this.linhas = Array.isArray(data.linhas) ? data.linhas.map(function (s) { return new Linha(s); }) : [];
        this.colunas = Array.isArray(data.colunas) ? data.colunas.map(function (s) { return new Coluna(s); }) : [];


        this.relatorio = data.relatorio ? new Relatorio(data.relatorio) : {};
        var self = this;
        if (data.relatorio.adicionalinha) {

            var linhasModelo = self.linhas.filter(function (linha) {
                return linha.modelo == true
            }).map(function (linha) {
                self.relatorio.modelos.push(linha.codigo);
            });

        }
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
        this.linkfield = data.linkfield || "";
        this.codigolinha = data.codigolinha || "";
        this.ordemField = data.ordemField || "";
        this.cellIdField = data.cellIdField || "";
        this.colunaField = data.colunaField || "";
        this.ordem = data.ordem || 0;

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
            console.log("syncChangesToDB - changedb is false, skipping globalThis.db update");
            return
        }
        var htmlComponent = getCellHtmlComponent(cellObject.cellid);
        var varlorF = valor == "Infinity" || valor == "-Infinity" || valor == Infinity ? 0 : valor;


        var buildChangeResult = buildChangedObjectUpdateData(htmlComponent, cellObject, varlorF);


        var table = globalThis.tableSourceName;
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
        var dadosColuna = globalThis.GRenderedColunas.find(function (coluna) {
            return coluna.codigocoluna == codColuna
        });

        if (this.tipolistagem == "EXPR") {
            eval(this.expressao)
            return
        }

        if (this.tipolistagem == "PROPREG") {

            var tmpcomponentcategoria = this.componentcategoria
            var linhaTipoFiltered = globalThis.reportConfig.config.linhas.filter(function (linhaGrupo) {

                return linhaGrupo.tipo == tmpcomponentcategoria
            });
            globalThis.GTmpListTableObject = linhaTipoFiltered
            return
        }




        if (dadosColuna.config.usaexpresstbjs) {
            eval(dadosColuna.config.expressaotbjs)
        }
        return


    };

    CellObjectConfig.prototype.getColunaConfig = function () {

        var celulaConfig = this
        return globalThis.GRenderedColunas.find(function (coluna) {

            return coluna.codigocoluna == celulaConfig.codigocoluna
        })

    };


    CellObjectConfig.prototype.getCelulaConfig = function () {

        var celulaConfig = this;
        var celulaFound = globalThis.reportConfig.config.celulas.find(function (celula) {

            return celula.linhastamp == celulaConfig.renderelinha.config.linhastamp && celula.codigocoluna == celulaConfig.codigocoluna
        });

        return celulaFound ? new Celula(celulaFound) : new Celula({})

    };



    CellObjectConfig.prototype.getColsRefered = function () {

        var celulaConfig = this;

        var celula = celulaConfig.getCelulaConfig();
        var coluna = celulaConfig.getColunaConfig();

        return globalThis.GRenderedColunas.filter(function (colRef) {

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

        var linhasComTotais = globalThis.GRenderedLinhas.filter(function (linha) {

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

        if (this.dataType != "digit" && globalThis.reportConfig.config.relatorio.totalcoluna) {

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

            return globalThis.db[tableName]
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


        globalThis.GCellObjectsConfig.unshift(this);

    }




    function UpdateData(data) {
        this.sourceKey = data.sourceKey || null;
        this.sourceValue = data.sourceValue || null;
        this.changedData = data.changedData || {};
    }
    function getMaxRenderedLinha() {


        return isArray(globalThis.GRenderedLinhas) ? globalThis.GRenderedLinhas.length : 0;
    }


    function RenderedLinha(data) {
        this.index = getMaxRenderedLinha();
        this.linkid = data.linkid || "";
        this.rowid = data.rowid || "";
        this.isParent = data.isParent || false;
        this.linkcodigo = data.linkcodigo || "";
        this.linkdescricao = data.linkdescricao || ""
        this.UIObject = data.UIObject || {};
        this.ordem = getMaxRenderedLinha() * 1000 || 0;
        this.parentid = data.parentid || "";
        this.novoregisto = data.novoregisto
        this.config = new Linha(data.config || new Linha({}));

    }


    RenderedLinha.prototype.addLinhaFilha = function () {


        var renderedLinha = new RenderedLinha({ novoregisto: true, rowid: generateUUID(), linkid: this.rowid, parentid: "", config: this.config });

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
        var tableName = globalThis.tableSourceName; // Nome da tabela no Dexie
        var rowId = this.rowid; // ID da linha a ser removida
        var thisRow = this;



        return new Promise(function (resolve, reject) {
            globalThis.db[tableName]
                .where("rowid") // Filtra os registros pelo campo "rowid"
                .equals(rowId) // Verifica se o valor de "rowid" é igual ao da linha atual
                .delete() // Remove os registros correspondentes
                .then(function () {
                    // Remove a linha da lista local de linhas renderizadas

                    globalThis.GCellObjectsConfig = globalThis.GCellObjectsConfig.filter(function (cellObject) {
                        return cellObject.rowid != rowId
                    })

                    resolve("Linha removida com sucesso.");
                })
                .catch(function (err) {
                    reject("Erro ao remover a linha: " + err);
                });
        });
    };



    RenderedLinha.prototype.addToLocalRenderedLinhasList = function (linhaRecords, distinctRow, renderCelula, setChildren) {



        globalThis.GRenderedLinhas.push(this);

        if (renderCelula) {

            var recFlt = linhaRecords.filter(function (rec) {
                return rec.rowid == distinctRow.rowid
            }
            );
            setLinha(this, "", recFlt);

            if (this.linkid && setChildren == true) {

                var self = this;
                var parentLinha = globalThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == self.linkid
                });


                if (parentLinha) {

                    parentLinha.UIObject._children = parentLinha.UIObject._children || [];
                    parentLinha.UIObject._children.push(this.UIObject);

                }



            }
        }




    }

    var getLinhaById = function (id) {

        return globalThis.GRenderedLinhas.find(function (linha) {

            return linha.rowid == id;
        });


    }

    var getColunaByCodigo = function (codigo) {

        return globalThis.GRenderedColunas.find(function (coluna) {

            return coluna.codigocoluna == codigo
        })
    }


    RenderedLinha.prototype.getLinhaSubtotal = function () {

        var linhaRendered = this

        return globalThis.GRenderedLinhas.find(function (linhaSubtotal) {

            return linhaSubtotal.linkid == linhaRendered.rowid && linhaSubtotal.config.codigo == "SUBTOTALINHA"
        })

    }
    RenderedLinha.prototype.actualizarTotaisColunasLinha = function () {


        var linhaSubtotal = this.getLinhaSubtotal();
        var renderedLinha = this



        if (linhaSubtotal) {

            var celulasLinha = linhaSubtotal.getLinhaCellObjects();


            globalThis.GRenderedColunas.map(function (renderedColuna) {

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
        return globalThis.GCellObjectsConfig.filter(function (cellObject) {

            return cellObject.rowid == renderedLinha.rowid
        })


    }

    RenderedLinha.prototype.findCelulaTotal = function () {

        var renderedLinha = this;

        return globalThis.GCellObjectsConfig.find(function (cellObject) {

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

        return _.sumBy(globalThis.GCellObjectsConfig, function (cellObject) {
            if (eval(filtro)) {
                return isNaN(cellObject.valor) ? 0 : Number(cellObject.valor);
            }
            return 0;
        });



    }



    function getCelulasByFiltro(filtro) {



        return globalThis.GCellObjectsConfig.filter(function (cellObject) {

            return eval(filtro)
        })



    }



    function setValueOnCell(celulaId, valorUpdt) {
        var celulaCOnfigClone = globalThis.GCellObjectsConfig.slice()


        celulaCOnfigClone.forEach(function (celulaCloneObj) {

            if (celulaCloneObj.cellid == celulaId && celulaCloneObj.categoria == "total") {
                celulaCloneObj.valor = 0;
                celulaCloneObj.valor = valorUpdt;

                $("#" + celulaCloneObj.cellid).val(formatInputValue(parseFloat(valorUpdt).toFixed(2)));

            }

            new CellObjectConfig(celulaCloneObj)
        });

        globalThis.GCellObjectsConfig = celulaCOnfigClone.slice()




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
            var linhaTipoFiltered = globalThis.reportConfig.config.linhas.filter(function (linhaGrupo) {

                return linhaGrupo.tipo == tmpcomponentcategoria
            });
            globalThis.GTmpListTableObject = linhaTipoFiltered
            return
        }




        if (this.config.usaexpresstbjs) {

            this.localData = eval(this.config.expressaotbjs);
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

        return globalThis[key].mapping
    }


    function setLinhaRender(linha, linkid, parentid, records) {


        //No futuro se por exemplo for dito que o utilizador poderá apagar as linhas dos grupos e subgrupos . Para garantir que ao ter records (records.length>0) se liste exactamente o numero de grupos e subgrupos uma vez que podem ser apagados.
        //Deve se Filtrar o array que vai preencher os grupos e subgrupos se por acaso este não varar dos records ou seja : records.find(function (obj) return obj[mapConfig.mapData[config.bindData.sourceKey]] == config.codigo { if (linhaData) {}
        var config = new Linha(linha);

        var mapConfig = getMapConfigByComponent(globalThis.renderConfig, config.tipo);
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



        if (!globalThis.reportConfig.config.relatorio.adicionalinha) {

            var dadosColuna = new Coluna({
                codigocoluna: "DEFCOL",
                desccoluna: globalThis.reportConfig.config.relatorio.defdesccoluna,
                tipo: "text",
                decimais: "",
                categoria: "defcol"
            });

            var renderedColuna = new RenderedColuna({
                codigocoluna: "DEFCOL",
                config: new Coluna(dadosColuna)
            });
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


        if (globalThis.reportConfig.config.relatorio.totalcoluna) {


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


        globalThis.GRenderedColunas.forEach(function (coluna) {

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

    function freezyColunas() {
        $('.sourced-table th[data-fixacoluna=true]').each(function () {

            addFreezyColumnByHeader($(this))
            ////console.log("sss") 
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

        var configColuna = globalThis.GRenderedColunas.find(function (coluna) {
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
            //  //console.log(value);

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
                    var colunaConfig = globalThis.reportConfig.config.colunas.find(function (coluna) {
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
        console.log("ConvertDbTableToMrendObject", MrendConversionConfig)
        if (!data[0]) {

            return []
        }
        var keys = Object.keys(data[0]);
        var mrendObjects = []



        data.forEach(function (record) {
            keys.forEach(function (key) {

                var configCol = globalThis.reportConfig.config.colunas.find(function (coluna) {
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


        $("#sourceTabletableContainer" + globalThis.table).remove();

        globalThis.GCellObjectsConfig = []
        globalThis.TMPCellObjectCOnfig = []
        globalThis.GRenderedColunas = []
        globalThis.GRenderedLinhas = []

        $(globalThis.containerToRender).append("<div id='sourceTabletableContainer" + globalThis.table + "' style='margin-top:2.5em' class='row table-responsive'></div>")
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

            var dadosColuna = globalThis.GRenderedColunas.find(function (coluna) {
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

                var linhaTipoFiltered = globalThis.reportConfig.config.linhas.filter(function (linhaGrupo) {

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

            globalThis.GRenderedColunas.map(function (coluna) {

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
                customData: "colspan=" + (globalThis.GRenderedColunas.length).toString() + "",
            })


        }


        GTableData.body.rows.push(linhaHtml);


        var subLinhas = globalThis.GRenderedLinhas.filter(function (linhaObj) {

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



    function setLinhaModeloOuSingular(linh, parentid, records) {

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




        if (linha.config.temcolunas) {


            globalThis.GRenderedColunas.forEach(function (coluna) {

                var recFlt = records.filter(function (rec) {
                    return rec.coluna == coluna.codigocoluna
                });
                setCelula({}, linha, coluna, recFlt, coluna.config.categoria, "", {})

            });



        }








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

        globalThis.GRenderedColunas.forEach(function (coluna) {

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




    function buildDefaultCelula(linhaHtml, linh, colun, records) {

        var linha = linh;
        var coluna = colun;
        var configCelula = globalThis.reportConfig.config.celulas.find(function (configCelula) {
            return configCelula.linhastamp == linha.config.linhastamp && configCelula.codigocoluna == coluna.codigocoluna
        });

        var linhaRecord;

        var linhaFilterKey = "rowid";


        linhaRecord = records[0]

        var cellId = null;
        var novoRegisto = false;

        if (linhaRecord) {

            cellId = linhaRecord.cellId

        }
        if (!linhaRecord) {
            linhaRecord = JSON.parse(JSON.stringify(globalThis.schemas[0].tableSourceSchema))
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
        linh.UIObject[coluna.config.campo] = cellObjectConfig.valor;
        linh.UIObject.cellId = cellObjectConfig.cellid;

        var cellValue = cellObjectConfig.valor;

        if (novoRegisto) {

            linhaRecord.cellId = cellId;
            linhaRecord[coluna.config.campo] = cellValue;
            linhaRecord.coluna = coluna.codigocoluna


            if (linha.config.tipo == "Singular") {
                linhaRecord.rowid = linha.rowid;
                linhaRecord.codigolinha = linha.config.codigo;
            }


            linhaRecord.campo = coluna.config.campo;
            linhaRecord.linkid = linha.linkid;
            linhaRecord.linkfield = globalThis.dbTableToMrendObject.extras.linkfield;
            linhaRecord.sourceTable = globalThis.dbTableToMrendObject.table;
            linhaRecord.sourceKey = globalThis.dbTableToMrendObject.tableKey;
            linhaRecord.sourceKeyValue = linha.rowid;
            linhaRecord.ordem = linha.ordem
            linhaRecord.ordemField = globalThis.dbTableToMrendObject.ordemField;

            if (coluna.config.sourceTable) {

                linhaRecord.sourceTable = coluna.config.sourceTable;
                linhaRecord.sourceKey = coluna.config.sourceKey;
                linhaRecord.sourceKeyValue = linha.rowid;
            }


            globalThis.GNewRecords.push(linhaRecord);
        }


    }

    function InitDB(datasourceName, schemas) {

        return new Promise(function (resolve, reject) {
            globalThis.db = new Dexie(datasourceName);
            var promises = []; // Armazena todas as Promises do loop

            return configureDataBase(globalThis.db, schemas[0].tableSourceName, 1, Object.keys(schemas[0].tableSourceSchema)).then(function (result) {
                globalThis.db = result;
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

            getDataFromRemote(codigo, registo)
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

        window.localStorage.setItem("sourcestamp" + globalThis.tableSourceName, sourceStamp.trim())
    }

    function clearStamps() {
        window.localStorage.clear("sourcestamp")
        window.localStorage.clear("stampregisto")
    }

    function getSourceStamp() {
        return window.localStorage.getItem("sourcestamp" + globalThis.tableSourceName) ? window.localStorage.getItem("sourcestamp" + globalThis.tableSourceName).trim() : "";
    }



    function deleteAllRecords(tableName) {
        return new Promise(function (resolve, reject) {

            if (globalThis.db['_allTables'][tableName]) {
                return globalThis.db[tableName].clear().then(function () {
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
            // globalThis.db[tableName].add(data);
            return globalThis.db[tableName].add(data);
            // //console.log('Data added with primary key:', primaryKey);
        } catch (error) {
            console.error('Error adding data:', error);
        }
    }

    function deleteData(db, tableName, fieldName, filedValue) {
        return globalThis.db[tableName].where(fieldName).equals(filedValue).delete()
    }

    function addBulkData(db, tableName, dataArray) {

        //console.log("tableName",tableName)
        if (globalThis.db['_allTables'][tableName]) {
            return globalThis.db[tableName].bulkPut(dataArray)
        } else {
            return globalThis.db[tableName].bulkAdd(dataArray)
        }

    }



    function getDataFromRemote() {

        return new Promise(function (resolve, reject) {
            $.ajax({
                type: globalThis.remoteFetchData.type,
                url: globalThis.remoteFetchData.url,
                data: globalThis.remoteFetchData.data,
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

            globalThis.db.close()  //.then(function () {
            var schemaConfig = {};

            schemaConfig[tableName] = indexes.join(",");
            globalThis.db.version(version).stores(schemaConfig);

            // Open the database
            globalThis.db.open().then(function () {
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

        return globalThis.db[tableName].count()

    }

    function databaseAndTableHasRecords(db, tableName) {
        return new Promise(function (resolve, reject) {
            if (db['_allTables'][tableName]) {


                globalThis.db[tableName].count()
                    .then(function (count) {
                        if (count > 0) {
                            // If there are records, return all records
                            return globalThis.db[tableName].toArray();
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
                        // globalThis.db.close();
                    });
            } else {
                resolve({ exists: false, data: null });
            }
        });
    }

    function isTableExist(db, tableName) {
        return globalThis.db.tables.has(tableName);
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

        if (globalThis.GNewRecords.length > 0) {
            addBulkData(globalThis.db, globalThis.tableSourceName, globalThis.GNewRecords).then(function (data) {
                globalThis.GNewRecords = []

                globalThis.GCellObjectsConfig = globalThis.GCellObjectsConfig.concat(globalThis.TMPCellObjectCOnfig);

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


    function handleColFormatter(cell, colunaConfig, colunaUIConfig) {

        switch (colunaConfig.tipo) {

            case "digit":

                return formatNumber(cell.getValue(), colunaConfig);
                break;

            default:

                return cell.getValue();
                break;

        }

    }

    function handleEditor(coluna) {
        if (coluna.config.tipo === "digit" && !coluna.config.colfunc) {
            return {
                editor: numberFormatCustomEditor,
                editorParams: { colunaConfig: coluna.config }
            };
        }
        if (coluna.config.tipo === "text" && !coluna.config.colfunc) {
            return { editor: "input" };
        }

        if (coluna.config.tipo === "table" && !coluna.config.colfunc) {
            var values = (coluna.localData || []).map(function (item) {
                return {
                    value: item[coluna.config.valtb],
                    label: item[coluna.config.nometb]
                };
            });
            return {
                editor: "list",
                editorParams: {
                    values: values,
                    autocomplete: true,
                    freetext: true,
                    popupContainer: document.body,
                    listItemFormatter: function (value, text) {
                        return "<div style='padding: 6px 12px; transition: all 0.2s;'>" + text + "</div>";
                    }
                }
            };
        }

        if (coluna.config.colfunc) {
            return {}
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

            var valor = rowData[colName] || "0";

            valor = valor == "Infinity" || valor == "-Infinity" || valor == Infinity || isNaN(valor) ? 0 : valor;

            // Substituição manual para manter compatibilidade com ES5
            var token = "{" + colName + "}";
            while (orgExpr.indexOf(token) !== -1) {
                orgExpr = orgExpr.replace(token, valor);
            }
        }
        return orgExpr;
    }

    function handleMutator(coluna) {

        var renderedColuna = new RenderedColuna(coluna);
        if (renderedColuna.config.colfunc) {
            return {
                mutator: function (value, rowData, type, params, component) {

                    var expression = extractCellValue(renderedColuna.config.expresscolfun, renderedColuna.config, rowData);
                    var expressionResult = eval(expression);
                    expressionResult = expressionResult == "Infinity" || expressionResult == "-Infinity" || expressionResult == Infinity || isNaN(expressionResult) ? 0 : expressionResult;

                    var rowupdated = {}
                    rowupdated[renderedColuna.codigocoluna] = expressionResult;
                    rowupdated.rowid = rowData.rowid;



                    updateCellObjectConfig(renderedColuna.codigocoluna, rowupdated);

                    return Number(expressionResult);
                },
                mutatorParams: { colunaConfig: coluna.config }
            };
        }
        // Adicione outros mutators por tipo/código aqui se necessário
        return {};
    }

    function updateCellObjectConfig(coluna, rowData) {

        var cellObjectConfig = globalThis.GCellObjectsConfig.find(function (obj) {
            return obj.codigocoluna == coluna && obj.rowid == rowData.rowid;
        });

        if (cellObjectConfig) {

            cellObjectConfig.valor = rowData[coluna];
        }
    }


    function deleteRowById(rowid) {

        var renderedLinha = globalThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid == rowid;
        });

        if (renderedLinha) {

            renderedLinha.deleteRow();
        }
    }

    function addLinhaFilha(rowid) {

        var renderedLinha = globalThis.GRenderedLinhas.find(function (linha) {
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
    }


    function RenderSourceTable() {


        // addNewRecords()

        globalThis.GCellObjectsConfig = globalThis.GCellObjectsConfig.concat(globalThis.TMPCellObjectCOnfig);

        var columns = [
            {
                title: "#",
                field: "idx",
                width: 120

            },
            {
                title: "Ações",
                formatter: function (cell, formatterParams) {
                    return "<i style='color:#0765b7' class='fa fa-plus-circle action-btn add-child' title='Adicionar Filho'></i><i style='color:#d9534f!important;' class='fa fa-trash action-btn remove-row' title='Remover Linha'></i> ";
                },
                width: 110,
                hozAlign: "center",
                headerSort: false,
                cellClick: function (e, cell) {
                    var row = cell.getRow();
                    var target = e.target;

                    if (target.classList.contains("add-child")) {

                        var addFilhaResult = addLinhaFilha(row.getData().rowid);
                        row.addTreeChild(addFilhaResult.UIObject);
                        row.treeExpand();
                        applyTabulatorStylesWithJquery();

                    }

                    if (target.classList.contains("remove-row")) {
                        var row = cell.getRow();
                        var children = row.getTreeChildren();

                        if (children.length > 0) {
                            if (confirm("Esta linha tem filhos. Deseja remover tudo?")) {
                                deleteRowAndChildren(row);
                            }
                        } else {
                            row.delete();
                        }

                        deleteRowById(row.getData().rowid);

                    }
                }
            }

        ];

        globalThis.GRenderedColunas.forEach(function (coluna) {

            var colunaUIConfig = {
                title: coluna.config.desccoluna,
                field: coluna.codigocoluna,
                width: 310,
                frozen: coluna.config.fixacoluna,
                formatter: function (cell) {
                    return handleColFormatter(cell, coluna.config, colunaUIConfig);
                }


            }


            var editorConfig = handleEditor(coluna);
            Object.assign(colunaUIConfig, editorConfig);

            var mutatorConfig = handleMutator(coluna);
            Object.assign(colunaUIConfig, mutatorConfig);

            columns.push(colunaUIConfig);

        })


        globalThis.GTable = new Tabulator(globalThis.containerToRender, {
            data: globalThis.GGridData,
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildIndent: 15,
            popupContainer: "body",
            layout: "fitData",
            rowFormatter: function (row) {

                var data = row.getData();
                if (row.getTreeParent()) {
                    row.getElement().style.backgroundColor = "#f8fafc";
                }
            },
            columns: columns
        });

        globalThis.GTable.on("cellEdited", function (cell) {
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


        globalThis.GTable.on("dataTreeRowExpanded", function (row, level) {
            applyTabulatorStylesWithJquery();
        });


        globalThis.GTable.on("dataTreeRowCollapsed", function (row, level) {

            applyTabulatorStylesWithJquery();
        });




        setTimeout(function () {

            applyTabulatorStylesWithJquery();
        }, 100); // Atraso para garantir que o Tabulator é renderizado após a adição de novas linhas

        setTimeout(function () {

            applyTabulatorStylesWithJquery();
        }, 500); // Atraso para garantir que o Tabulator é renderizado após a adição de novas linhas

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

        var celulas = globalThis.GCellObjectsConfig.filter(function (cellObj) { return cellObj.events.length > 0 });


        celulas.forEach(function (cellObjectConfig) {

            cellObjectConfig.executeChangeEvents()
        })

    }

    function handleTotais() {
        if (globalThis.reportConfig.config.relatorio.totalcoluna) {

            globalThis.GRenderedLinhas.forEach(function (linha) {

                linha.actualizarTotalLinha();
            })
        }

        calcularSubtotais();
        if (globalThis.reportConfig.config.relatorio.totalrelatorio) {

            GTableData.calcularTotalRelatorio();

        }
    }


    function getRenderedLinhas(records) {


        var renderedLinhas = [new RenderedLinha({})];
        renderedLinhas = [];
        var notExistLinhas = [new Linha({})]
        notExistLinhas = []
        novasLinhas = [];



        var linhaModelo = globalThis.reportConfig.config.linhas.filter(function (linha) {

            return linha.tipo == "Singular"
        });

        linhaModelo.forEach(function (linhModelo) {

            var recordData = records.find(function (record) {

                return record.codigolinha == linhModelo.codigo
            });


            if (recordData) {

                var linhaRecords = records.filter(function (record) {
                    return record.codigolinha == linhModelo.codigo
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


                    setSingularLinha(distinctRow, linhaRecords, linhModelo, renderedLinhas, linhasFilhas.length > 0);
                    var distinctRowFilhas = _.uniqBy(linhasFilhas, "rowid");

                    distinctRowFilhas.forEach(function (filha) {

                        setSingularLinha(filha, linhaRecords, linhModelo, renderedLinhas, true);
                    });



                });


            }
            else {

                var linha = new Linha(linhModelo);
                var rowid = generateUUID();
                var UIObject = {
                    rowid: rowid,
                    id: rowid
                }
                var rendered = new RenderedLinha({ novoregisto: true, rowid: rowid, linkid: "", parentid: "", config: linha, UIObject: UIObject });
                rendered.addToLocalRenderedLinhasList([], "", {}, false, true);
                renderedLinhas.push(rendered)
            }

        })




        var tmpGrData = []
        globalThis.GGridData = globalThis.GRenderedLinhas.map(function (lin) {

            if (!lin.linkid) {

                tmpGrData.push(lin.UIObject);
            }
        });

        globalThis.GGridData = tmpGrData;


        return renderedLinhas;

    }




    function setSingularLinha(distinctRow, linhaRecords, linhModelo, renderedLinhas, isParent) {

        var linhaAdicionada = globalThis.GRenderedLinhas.find(function (linha) {
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


        var rendered = new RenderedLinha({ novoregisto: false, isParent: isParent, rowid: distinctRow.rowid, linkid: distinctRow.linkid, parentid: "", config: linha, UIObject: UIObject });
        renderedLinhas.push(rendered);

        var recFlt = linhaRecords.filter(function (rec) {
            return rec.rowid == distinctRow.rowid
        }
        );
        rendered.addToLocalRenderedLinhasList(recFlt, distinctRow, true, true);
    }

    function RenderHandler(records) {

        ViewRender(records)

    }

    function ViewRender(records) {


        initTableDataAndContainer();


        globalThis.GRenderedColunas = setColunasRender(globalThis.reportConfig.config.colunas);


        var renderedLinhas = getRenderedLinhas(records);

        globalThis.GRenderedLinhas = renderedLinhas

        RenderSourceTable();

    }


    function getCellObjectConfigByCellId(cellId) {

        return globalThis.GCellObjectsConfig.find(function (obj) {
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
            var row = globalThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid == rowId
            });

            if (row) {

                row.deleteRow();
            }


        })

        $(document).off("click", ".addFilho").on("click", ".addFilho", function () {
            var rowId = $(this).closest("tr").attr("id");
            var linha = globalThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid == rowId
            });

            if (linha) {

                linha.addLinhaFilha();
                $('#' + GTableData.tableId).simpleTreeTable();
            }

            //console.log("row", row)

        })
    }




    function handleReportRecords() {
        return new Promise(function (resolve, reject) {
            var stampAtual = (globalThis.recordData.stamp || "").trim();
            var stampArmazenado = getSourceStamp().trim();

            return databaseAndTableHasRecords(globalThis.db, globalThis.tableSourceName)
                .then(function (result) {
                    // Se stamp bateu e TEM dados locais, retorna sem refetch

                    if (stampAtual === stampArmazenado && result.exists && Array.isArray(result.data) && result.data.length > 0) {
                        globalThis.records = result.data;
                        return resolve({ refetchDb: false, records: result.data });
                    }

                    storeDataSourceStamp(globalThis.recordData.stamp);
                    console.log("Source stamp updated or local DB empty, refetching data...", globalThis.recordData.stamp, stampArmazenado);

                    if (globalThis.remoteFetch === true) {
                        return getDataFromRemote()
                            .then(function (remoteData) {

                                globalThis.records = remoteData && remoteData.data ? remoteData.data : [];
                                return resolve({ refetchDb: true, records: globalThis.records, remoteFetch: true });
                            })
                            .catch(reject);
                    }

                    resolve({ refetchDb: true, records: globalThis.records });
                })
                .catch(reject);
        }).then(function (result) {

            return new Promise(function (resolve, reject) {

                if (result.refetchDb) {
                    return deleteAllRecords(globalThis.table).then(function (data) {
                        var dbConverstion = ConvertDbTableToMrendObject(globalThis.records, globalThis.dbTableToMrendObject);
                        return addBulkData(globalThis.db, globalThis.table, dbConverstion).then(function (data) {
                            console.log("Records refetched for DB....");
                            return resolve(result);
                        })
                    })
                }
                return resolve(result)
            })
        });
    }
    this.clearSourceStamp = function () {

        localStorage.removeItem("sourcestamp" + globalThis.tableSourceName);
    }


    function addLinhaByModelo(modelo) {


        var linhaModelo = globalThis.reportConfig.config.linhas.find(function (linha) {

            return linha.codigo == modelo
        });

        var renderedLinha
        if (linhaModelo) {


            renderedLinha = new RenderedLinha({ novoregisto: true, rowid: generateUUID(), linkid: "", parentid: "", config: linhaModelo })

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

        if (globalThis.reportConfig.config.relatorio.adicionalinha) {

            var tableButtons = $("<div id='tableButtons' class='col-md-12 pull-left tableButtons'></div>");
            $(globalThis.containerToRender).after(tableButtons);

            globalThis.reportConfig.config.relatorio.modelos.forEach(function (modelo) {


                var botaoId = "btnAdd" + modelo;
                var configuracaoLinha = globalThis.reportConfig.config.linhas.find(function (linha) {
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
                    var modelo = $(this).data("modelo");



                    var linhaByModeloResult = addLinhaByModelo(modelo);

                    // console.log("Linha adicionada por modelo", linhaByModeloResult)
                    globalThis.GTable.addRow(linhaByModeloResult.UIObject, false).then(function (row) {
                        row.treeExpand();
                        applyTabulatorStylesWithJquery();

                    });


                    //   thisTable.addLinhaByModelo(modelo);
                });

                ///console.log("Confirma adicao da linha", $("#" + this.tableId))


            })




        }
    }


    this.render = function () {

        return InitDB(globalThis.datasourceName, globalThis.schemas).then(function (initDBResult) {

            handleReportRecords().then(function (reportRecordResult) {

                RenderHandler(globalThis.records)



            })

        });

    }




}



$(document).ready(function () {


});




function applyTabulatorStylesWithJquery() {
    // Tabulator container
    $(".tabulator").css({
        "background-color": "white",
        "border-radius": "10px",
        "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "border": "none"
    });

    // Header
    $(".tabulator .tabulator-header").css({
        "background-color": "#0765b7",
        "border-bottom": "none",
        "border-radius": "10px 10px 0 0"
    });

    // Header columns
    $(".tabulator .tabulator-header .tabulator-col").css({
        "background-color": "#0765b7",
        "color": "white",
        "border-right": "none",
        "padding": "12px 15px",
        "font-weight": "500"
    });

    $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
    $(".tabulator .tabulator-header .tabulator-col:last-child").css("border-top-right-radius", "10px");

    // Rows
    $(".tabulator-row").css({
        "border-bottom": "1px solid #e0e6ed",
        "transition": "background-color 0.2s ease"
    });
    $(".tabulator-row.tabulator-row-even").css("background-color", "#fcfdfe");
    $(".tabulator-row").hover(
        function () { $(this).css("background-color", "#f5f9ff"); },
        function () { $(this).css("background-color", ""); }
    );

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
    $("body").append('<style>::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; } ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }</style>');
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
    this.linkfield = data.linkfield || "";
    this.codigolinha = data.codigolinha || "";
    this.ordemField = data.ordemField || "";
    this.cellIdField = data.cellIdField || "";
    this.colunaField = data.colunaField || "";
    this.ordem = data.ordem || 0;

}

function getMrendSchema(tableSourceName) {

    var schema = new MrendObject({});

    return { datasourceName: "MrendDb", tableSourceName: tableSourceName, tableSourceSchema: schema }

}

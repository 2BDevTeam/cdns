

function Mrend(options) {

    var mrendThis = this;
    this.GTable = {};
    this.GDefaultConfig = undefined;
    this.GRenderData = {};
    this.GReportConfig = new ReportConfig({});
    this.GRenderedData = undefined;
    this.GTableData = new TableHtml({});
    this.GGrupoColunas = [];
    this.GGrupoColunasItems = [];
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
        customTotal: 0,
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
    this.global = {};

    this.setTableEditable = function (editable) {

        mrendThis.GTable.getColumns().forEach(function (col) {
            col.updateDefinition({
                editable: editable,   // pode ser true/false ou até função
            });
        });
    }


    this.addLinhaComRegistos = function (modelo, registo) {

        var linhaByModeloResult = addLinhaByModelo(modelo, registo);

        function doAddRow() {
            mrendThis.GTable.addRow(registo, false).then(function (row) {
                linhaByModeloResult;
                row.treeExpand();
                mrendThis.applyTabulatorStylesWithJquery(mrendThis);
            });
        }

        if (mrendThis._tableBuiltPromise) {
            mrendThis._tableBuiltPromise.then(doAddRow);
        } else {
            doAddRow();
        }

    }

    // Para chunkMapping: false — recebe array de células (EAV/tall format), agrupadas por rowIdField.
    // Cada grupo de células com o mesmo rowIdField origina uma linha na grelha.
    // Opções:
    //   resetIds: true  — gera novos IDs para tableKey (ex: u_reportlstamp) e rowIdField
    //                     (ex: naturezasubrowid), garantindo que são registos novos na BD.
    //                     Usar quando os dados vêm de outro relatório/fonte e não se quer
    //                     afectar os registos originais.
    // Exemplo: addLinhaComCelulas("u_reportl", dados, { resetIds: true })
    this.addLinhaComCelulas = function (modelo, celulas, opcoes) {

        if (!Array.isArray(celulas) || celulas.length === 0) return;

        var resetIds = opcoes && opcoes.resetIds === true;

        var linhaModelo = mrendThis.reportConfig.config.linhas.find(function (linha) {
            return linha.codigo == modelo;
        });

        if (!linhaModelo) return;

        var rowIdField = mrendThis.dbTableToMrendObject.extras.rowIdField;
        var tableKey = mrendThis.dbTableToMrendObject.tableKey;
        var colunaField = mrendThis.dbTableToMrendObject.extras.colunaField;

        // Agrupar células pelo rowIdField original
        var grupos = {};
        var ordemGrupos = [];
        celulas.forEach(function (celula) {
            var grupoId = celula[rowIdField] || celula[tableKey] || generateUUID();
            if (!grupos[grupoId]) {
                grupos[grupoId] = [];
                ordemGrupos.push(grupoId);
            }
            grupos[grupoId].push(celula);
        });

        // Adicionar uma linha por grupo
        ordemGrupos.forEach(function (grupoIdOriginal) {
            var grupoCelulas = grupos[grupoIdOriginal];

            // Se resetIds, gera novo rowid para este grupo e novo tableKey por célula
            var rowid = resetIds ? generateUUID() : grupoIdOriginal;
            if (resetIds) {
                grupoCelulas = grupoCelulas.map(function (celula) {
                    var nova = Object.assign({}, celula);
                    nova[tableKey] = generateUUID();
                    nova[rowIdField] = rowid;
                    return nova;
                });
            }
            var codigo = linhaModelo.codigo + "___" + generateTimestampNumber(10);
            var ordem = generateLinhaOrdem();

            var UIObject = { rowid: rowid, id: rowid };
            grupoCelulas.forEach(function (celula) {
                var coluna = celula[colunaField];
                var colConfig = mrendThis.reportConfig.config.colunas.find(function (c) {
                    return c.codigocoluna == coluna;
                });
                if (colConfig) {
                    UIObject[coluna] = celula[colConfig.campo] !== undefined
                        ? celula[colConfig.campo]
                        : celula.cvalor || celula.valor || 0;
                }
            });

            var renderedLinha = new RenderedLinha({ UIObject: UIObject, ordem: ordem, codigo: codigo, novoregisto: true, rowid: rowid, linkid: "", parentid: "", config: linhaModelo });

            var dbConverstion = ConvertDbTableToMrendObject(grupoCelulas, mrendThis.dbTableToMrendObject);

            renderedLinha.addToLocalRenderedLinhasList(dbConverstion, { rowid: rowid }, {}, true, true);

            mrendThis.GNewRecords = dbConverstion.concat(mrendThis.GNewRecords);

            addNewRecords();

            (function (uiObj) {
                function doAddCelulasRow() {
                    mrendThis.GTable.addRow(uiObj, false).then(function (row) {
                        row.treeExpand();
                        mrendThis.applyTabulatorStylesWithJquery(mrendThis);
                    });
                }

                if (mrendThis._tableBuiltPromise) {
                    mrendThis._tableBuiltPromise.then(doAddCelulasRow);
                } else {
                    doAddCelulasRow();
                }
            })(UIObject);
        });

    }


    this.refreshReactiveData = function () {
        //  return 
        mrendThis.reactiveData.cells = JSON.parse(JSON.stringify(mrendThis.GCellObjectsConfig));
    }

    // Executa fn após a tabela estar completamente inicializada.
    // Uso: GMRENDREPORTC.whenReady(function() { ... })
    this.whenReady = function (fn) {
        if (mrendThis._tableBuiltPromise) {
            return mrendThis._tableBuiltPromise.then(fn);
        }
        return Promise.resolve(fn());
    }

    this.getTotalRows = function () {
        return mrendThis.whenReady(function () {
            return mrendThis.GTable.getRows().length;
        });
    }

    this.hasRows = function () {
        return mrendThis.whenReady(function () {
            return mrendThis.GTable.getRows().length > 0;
        });
    }

    this.getColunaByCodigo = function (codigo) {

        return mrendThis.GRenderedColunas.find(function (coluna) {

            return coluna.codigocoluna == codigo
        })
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
    this.tabulatorHeight = options.tabulatorHeight || "400px";

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
        this.linkCodigoField = data.linkCodigoField || "";
        this.descLinkField = data.descLinkField || "";
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
        this.config = new MrendConfigData(data) || new MrendConfigData({ celulas: [], linhas: [], colunas: [], relatorio: {}, grupocolunas: [], grupocolunaItems: [], extra: {} }); // Default empty config
    }


    function MrendConfigData(data) {

        var config = data.config || {};
        this.celulas = Array.isArray(config.celulas) ? config.celulas.map(function (s) { return new Celula(s); }) : [];
        this.linhas = Array.isArray(config.linhas) ? config.linhas.map(function (s) { return new Linha(s); }) : [];
        this.colunas = Array.isArray(config.colunas) ? config.colunas.map(function (s) { return new Coluna(s); }) : [];
        this.grupocolunas = Array.isArray(config.grupocolunas) ? config.grupocolunas.map(function (s) { return new GrupoColuna(s); }) : [];
        this.grupocolunaItems = Array.isArray(config.grupocolunaItems) ? config.grupocolunaItems.map(function (s) { return new GrupoColunaItem(s); }) : [];
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
        // Codigo textual da linha-pai (ex: gruponatureza) e respectiva descricao.
        // Permite mapear ate ao nivel de BD ao gravar registos novos.
        this.linkCodigo = data.linkCodigo || "";
        this.linkCodigoField = data.linkCodigoField || "";
        this.descLink = data.descLink || "";
        this.descLinkField = data.descLinkField || "";
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

    // ────────────────────────────────────────────────────────────────────────────
    // BLACKLIST UTILITIES - Senior Level Centralized Logic
    // ────────────────────────────────────────────────────────────────────────────

    /**
     * Parse blacklist from multiple formats: array, JSON string, CSV string
     * @param {Array|string} blacklistValue - The blacklist value to parse
     * @returns {Array<string>} - Clean array of property names
     */
    function parseBlacklist(blacklistValue) {
        if (!blacklistValue) return [];

        // Already an array - return copy
        if (Array.isArray(blacklistValue)) {
            return blacklistValue.map(function (item) {
                return String(item).trim();
            });
        }

        // String processing
        if (typeof blacklistValue === 'string') {
            var str = blacklistValue.trim();

            // JSON format (array or object)
            if (str.startsWith('[') || str.startsWith('{')) {
                try {
                    var parsed = JSON.parse(str);
                    if (!Array.isArray(parsed)) {
                        parsed = [parsed];
                    }
                    return parsed.map(function (item) {
                        return String(item).trim();
                    });
                } catch (e) {
                    console.warn('[parseBlacklist] JSON parse failed, falling back to CSV split:', e);
                }
            }

            // CSV format - split and clean
            return str.split(',')
                .map(function (item) {
                    return item.trim().replace(/[\[\]"']/g, '');
                })
                .filter(function (item) {
                    return item.length > 0;
                });
        }

        return [];
    }

    /**
     * Apply blacklist to a config object, resetting specified properties
     * @param {Object} config - Config object to modify
     * @param {Array|string} blacklistValue - Blacklist to apply
     * @returns {Object} - Modified config (same reference)
     */
    function applyBlacklistToConfig(config, blacklistValue) {
        if (!config || !blacklistValue) return config;

        var blacklist = parseBlacklist(blacklistValue);

        blacklist.forEach(function (prop) {
            if (config[prop] !== undefined) {
                var tipo = typeof config[prop];
                config[prop] = tipo === 'boolean' ? false : tipo === 'number' ? 0 : '';
            }
        });

        return config;
    }

    /**
     * CENTRAL: Resolve a linha-filha config from a parent config.
     * - Looks up the REAL child template by linkstamp (canonical relationship)
     * - Optionally narrows by filhaRecord.codigolinha when several children exist
     * - Deep-clones the result so caller can mutate freely
     * - Applies parent's blacklistheranca to strip inherited group/title flags
     *
     * USE THIS in every place that materialises a filha (add manual, refresh, recursive).
     * Single source of truth → no risk of divergent behaviour between code paths.
     *
     * @param {Object} parentConfig - The parent Linha config (has linhastamp + blacklistheranca)
     * @param {Object} [filhaRecord] - Optional record (with codigolinha) to disambiguate siblings
     * @returns {Object} cleaned filha config clone
     */
    function resolveFilhaConfig(parentConfig, filhaRecord) {
        if (!parentConfig) return null;

        var filhaTemplates = mrendThis.reportConfig.config.linhas.filter(function (l) {
            return l.linkstamp === parentConfig.linhastamp;
        });

        var base = null;
        if (filhaRecord && filhaRecord.codigolinha && filhaTemplates.length > 0) {
            var codigoFilha = String(filhaRecord.codigolinha).split("___")[0].trim();
            base = filhaTemplates.find(function (l) {
                return String(l.codigo || "").trim() === codigoFilha;
            });
        }
        if (!base) base = filhaTemplates[0];
        if (!base) {
            // Fallback: no child template found. Use parent config but still strip blacklist.
            base = parentConfig;
        }

        var clone = JSON.parse(JSON.stringify(base));
        if (parentConfig.blacklistheranca) {
            applyBlacklistToConfig(clone, parentConfig.blacklistheranca);
        }
        return clone;
    }

    /**
     * Initialize UIObject with all column fields and default values
     * @param {string} rowid - Row identifier
     * @returns {Object} - UIObject with all column fields initialized
     */
    function createUIObjectWithColumns(rowid) {
        var UIObject = {
            id: rowid,
            rowid: rowid
        };

        // Initialize all column fields with default values based on type
        mrendThis.GRenderedColunas.forEach(function (coluna) {
            var valorDefault = "";

            if (coluna.config.tipo === "digit") {
                valorDefault = 0;
            } else if (coluna.config.tipo === "date") {
                valorDefault = null;
            } else if (coluna.config.tipo === "bool") {
                valorDefault = false;
            }

            UIObject[coluna.codigocoluna] = valorDefault;
        });

        return UIObject;
    }

    // ── Totais por linha (Tabulator dataTree) ────────────────────────────────
    function parseColunasTotais(colunastotais) {
        if (!colunastotais || !colunastotais.toString().trim()) {
            return [];
        }
        return colunastotais.toString().split(",").map(function (c) {
            return c.trim();
        }).filter(Boolean);
    }

    function getColunaBaseCodigo(codigocoluna) {
        if (!codigocoluna) {
            return "";
        }
        var marker = "___";
        var idx = codigocoluna.indexOf(marker);
        return idx > -1 ? codigocoluna.substring(0, idx) : codigocoluna;
    }

    /**
     * colunastotais pode referir o código base (ex: valorperiodo) ou instâncias
     * (ex: valorperiodo___2037). Colunas modelo só existem como instâncias no Tabulator.
     */
    function shouldTotalizeColumn(codigocoluna, colunasParaTotalizar) {
        if (colunasParaTotalizar.length === 0) {
            return true;
        }
        if (colunasParaTotalizar.indexOf(codigocoluna) !== -1) {
            return true;
        }
        var baseCodigo = getColunaBaseCodigo(codigocoluna);
        return baseCodigo !== codigocoluna && colunasParaTotalizar.indexOf(baseCodigo) !== -1;
    }

    function getDigitColunasParaTotalizar(colunasParaTotalizar) {
        return (mrendThis.GRenderedColunas || []).filter(function (coluna) {
            return coluna.config.tipo === "digit" &&
                shouldTotalizeColumn(coluna.codigocoluna, colunasParaTotalizar);
        });
    }

    function resolveTituloColunaLinha(linhaConfig) {
        if (linhaConfig && linhaConfig.colunatitulo) {
            return linhaConfig.colunatitulo.trim();
        }
        var colunas = Array.isArray(mrendThis.GRenderedColunas) ? mrendThis.GRenderedColunas : [];
        var fixa = colunas.find(function (c) {
            return c.config && c.config.fixacoluna;
        });
        return fixa ? fixa.codigocoluna : (colunas[0] ? colunas[0].codigocoluna : "");
    }

    function migrateLegacyLineTotalConfig(data) {
        var legacyTotais = data.temtotais === true || data.temtotais === 1 || data.temtotais === "true";
        var linhatemtotal = data.linhatemtotal === true || data.linhatemtotal === 1 || data.linhatemtotal === "true";
        var colunastotais = data.colunastotais || data.totkey || "";
        return {
            linhatemtotal: linhatemtotal || legacyTotais,
            colunastotais: colunastotais,
            tituloparatotal: data.tituloparatotal || (legacyTotais ? "Total" : "")
        };
    }

    function getLinhaNumericValueForTotal(linha, codigocoluna) {
        if (!linha) {
            return 0;
        }
        var valor = null;
        var celula = mrendThis.GCellObjectsConfig.find(function (c) {
            return c.rowid === linha.rowid && c.codigocoluna === codigocoluna;
        });
        if (celula) {
            valor = celula.valor;
        } else if (linha.UIObject && linha.UIObject[codigocoluna] !== undefined && linha.UIObject[codigocoluna] !== null) {
            valor = linha.UIObject[codigocoluna];
        }
        if (valor !== null && valor !== "") {
            return parseFloat(valor) || 0;
        }
        return 0;
    }

    function getDirectChildRenderedLinhas(parentRowId) {
        return (mrendThis.GRenderedLinhas || []).filter(function (linha) {
            return linha &&
                linha.rowid &&
                linha.rowid.indexOf("ROWTOTAL_") !== 0 &&
                linha.linkid === parentRowId;
        });
    }

    function hasTotalRowChild(linha) {
        return !!(linha &&
            linha.UIObject &&
            linha.UIObject._children &&
            linha.UIObject._children.some(function (child) {
                return child._isTotalRow;
            }));
    }

    function getLineTotalRowStoredValue(parentRowId, codigocoluna) {
        var parentLinha = mrendThis.GRenderedLinhas.find(function (l) {
            return l.rowid === parentRowId;
        });
        if (!parentLinha || !parentLinha.UIObject || !parentLinha.UIObject._children) {
            return 0;
        }
        var totalChild = parentLinha.UIObject._children.find(function (child) {
            return child._isTotalRow;
        });
        if (!totalChild) {
            return 0;
        }
        return getLinhaNumericValueForTotal({ rowid: totalChild.rowid, UIObject: totalChild }, codigocoluna);
    }

    function getLinhaDepth(linha) {
        var depth = 0;
        var current = linha;
        while (current && current.linkid) {
            depth++;
            current = mrendThis.GRenderedLinhas.find(function (l) {
                return l.rowid === current.linkid;
            });
        }
        return depth;
    }

    /**
     * Agrega valores numéricos de toda a sub-árvore (n níveis).
     * Se um filho tem linhatemtotal e a linha de total já existe, usa esse valor.
     */
    function sumSubtreeColumnForLineTotal(rowId, codigocoluna) {
        var linha = mrendThis.GRenderedLinhas.find(function (l) {
            return l.rowid === rowId;
        });
        var directChildren = getDirectChildRenderedLinhas(rowId);
        if (!directChildren.length) {
            return getLinhaNumericValueForTotal(linha, codigocoluna);
        }

        var soma = getLinhaNumericValueForTotal(linha, codigocoluna);
        directChildren.forEach(function (child) {
            if (child.config.linhatemtotal && hasTotalRowChild(child)) {
                soma += getLineTotalRowStoredValue(child.rowid, codigocoluna);
            } else {
                soma += sumSubtreeColumnForLineTotal(child.rowid, codigocoluna);
            }
        });
        return soma;
    }

    function sumColumnForLineTotal(parentRowId, codigocoluna) {
        return sumSubtreeColumnForLineTotal(parentRowId, codigocoluna);
    }

    function getParentLinhaConfigForTotalRow(rowData) {
        if (!rowData || !rowData._isTotalRow || !rowData._parentRowId) {
            return null;
        }
        var parentLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid === rowData._parentRowId;
        });
        return parentLinha ? parentLinha.config : null;
    }

    function getTotalRowColor(linhaConfig) {
        if (linhaConfig && linhaConfig.cortotallinha && linhaConfig.cortotallinha.toString().trim()) {
            return linhaConfig.cortotallinha.toString().trim();
        }
        return "#e8edf2";
    }

    function getTotalRowTextColor(linhaConfig) {
        if (linhaConfig && linhaConfig.cortextototallinha && linhaConfig.cortextototallinha.toString().trim()) {
            return linhaConfig.cortextototallinha.toString().trim();
        }
        return "";
    }

    function getTotalRowTextColorCss(linhaConfig) {
        var cor = getTotalRowTextColor(linhaConfig);
        return cor ? "color:" + cor + ";" : "";
    }

    /**
     * Avalia expressaototal com contexto por coluna.
     * Variáveis: soma (desta coluna), codigocoluna.
     * Referências: <codigocoluna> substituídas pela soma dessa coluna.
     */
    function evalExpressaoTotal(expressaototal, parentRowId, codigocoluna) {
        var soma = sumColumnForLineTotal(parentRowId, codigocoluna);
        var expr = expressaototal;
        var regex = /<([^>]+)>/g;
        var match;

        while ((match = regex.exec(expressaototal)) !== null) {
            var refCol = match[1];
            var refVal = sumColumnForLineTotal(parentRowId, refCol);
            expr = expr.split("<" + refCol + ">").join(String(refVal));
        }

        return (function (somaColuna, codigoColunaAtual) {
            return eval(expr);
        })(soma, codigocoluna);
    }

    /**
     * Fonte única do valor de uma célula de total — cálculo explícito (build/refresh).
     * Não recalcula no mutator Tabulator (performance).
     */
    function computeLineTotalCellValue(parentRowId, codigocoluna, linhaConfig) {
        if (!linhaConfig || !shouldTotalizeColumn(codigocoluna, parseColunasTotais(linhaConfig.colunastotais))) {
            return null;
        }

        if (linhaConfig.temexpressaototal && linhaConfig.expressaototal && linhaConfig.expressaototal.toString().trim()) {
            try {
                var result = evalExpressaoTotal(linhaConfig.expressaototal, parentRowId, codigocoluna);
                return isNaN(result) ? 0 : Number(result);
            } catch (e) {
                console.warn("[MRend] expressaototal inválida para linha", parentRowId, "coluna", codigocoluna, e);
            }
        }

        return sumColumnForLineTotal(parentRowId, codigocoluna);
    }

    function syncTotalRowChildPatch(parentLinha, patch) {
        if (!parentLinha || !parentLinha.UIObject || !parentLinha.UIObject._children || !patch) {
            return;
        }
        var totalChild = parentLinha.UIObject._children.find(function (child) {
            return child._isTotalRow;
        });
        if (totalChild) {
            Object.keys(patch).forEach(function (key) {
                totalChild[key] = patch[key];
            });
        }
    }

    function getParentLinhasAfetadasPorEdicao(editedRowId) {
        var parents = [];
        if (!editedRowId || editedRowId.indexOf("ROWTOTAL_") === 0) {
            return parents;
        }

        var current = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid === editedRowId;
        });
        if (!current) {
            return parents;
        }

        if (current.config.linhatemtotal) {
            parents.push(current);
        }

        while (current && current.linkid) {
            var parent = mrendThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid === current.linkid;
            });
            if (!parent) {
                break;
            }
            if (parent.config.linhatemtotal) {
                parents.push(parent);
            }
            current = parent;
        }

        parents.sort(function (a, b) {
            return getLinhaDepth(b) - getLinhaDepth(a);
        });

        return parents;
    }

    /**
     * Actualiza só as colunas de total indicadas (incremental).
     * Calcula explicitamente e faz patch na linha de total — sem mutator.
     */
    function refreshLineTotalColumns(parentLinha, columnFields) {
        if (!parentLinha || !parentLinha.config.linhatemtotal || !mrendThis.GTable) {
            return;
        }

        var fields = Array.isArray(columnFields) ? columnFields : [columnFields];
        if (!fields.length) {
            return;
        }

        var colunasParaTotalizar = parseColunasTotais(parentLinha.config.colunastotais);
        var totalRow = findTabulatorRowByRowId("ROWTOTAL_" + parentLinha.rowid);
        if (!totalRow) {
            return;
        }

        var patch = {};
        fields.forEach(function (field) {
            if (!field || !shouldTotalizeColumn(field, colunasParaTotalizar)) {
                return;
            }
            var renderedColuna = mrendThis.GRenderedColunas.find(function (coluna) {
                return coluna.codigocoluna === field;
            });
            if (!renderedColuna || renderedColuna.config.tipo !== "digit") {
                return;
            }
            patch[field] = computeLineTotalCellValue(parentLinha.rowid, field, parentLinha.config);
        });

        if (!Object.keys(patch).length) {
            return;
        }

        totalRow.update(patch);
        syncTotalRowChildPatch(parentLinha, patch);
    }

    function refreshLineTotalColumnsForEdit(editedRowId, columnFields) {
        var parents = getParentLinhasAfetadasPorEdicao(editedRowId);
        parents.forEach(function (parentLinha) {
            refreshLineTotalColumns(parentLinha, columnFields);
        });
    }

    function refreshAllLineTotalColumns(parentLinha) {
        if (!parentLinha || !parentLinha.config.linhatemtotal) {
            return;
        }
        var colunasParaTotalizar = parseColunasTotais(parentLinha.config.colunastotais);
        var fields = getDigitColunasParaTotalizar(colunasParaTotalizar).map(function (coluna) {
            return coluna.codigocoluna;
        });
        refreshLineTotalColumns(parentLinha, fields);
    }

    function buildLineTotalRowData(parentLinha) {
        var config = parentLinha.config;
        var totalRowId = "ROWTOTAL_" + parentLinha.rowid;
        var titulo = (config.tituloparatotal || "Total").replace(/{thisRow}/g, config.descricao || "");
        var colunasParaTotalizar = parseColunasTotais(config.colunastotais);
        var totalData = createUIObjectWithColumns(totalRowId);

        totalData.rowid = totalRowId;
        totalData.id = totalRowId;
        totalData._isTotalRow = true;
        totalData._parentRowId = parentLinha.rowid;
        totalData._totalTitle = titulo;

        var tituloCol = resolveTituloColunaLinha(config);
        if (tituloCol) {
            totalData[tituloCol] = titulo;
        }

        // Valores numéricos: cálculo explícito (refresh incremental em edição)
        getDigitColunasParaTotalizar(colunasParaTotalizar).forEach(function (coluna) {
            totalData[coluna.codigocoluna] = computeLineTotalCellValue(
                parentLinha.rowid,
                coluna.codigocoluna,
                config
            );
        });

        return totalData;
    }

    function attachLineTotalRows() {
        var linhasComTotal = mrendThis.GRenderedLinhas.filter(function (linha) {
            return linha.config.linhatemtotal && linha.UIObject;
        });

        // Filhos antes dos pais: totais de subgrupos disponíveis para o grupo raiz
        linhasComTotal.sort(function (a, b) {
            return getLinhaDepth(b) - getLinhaDepth(a);
        });

        linhasComTotal.forEach(function (linha) {
            linha.UIObject._children = linha.UIObject._children || [];
            linha.UIObject._children = linha.UIObject._children.filter(function (child) {
                return !child._isTotalRow;
            });

            linha.UIObject._children.push(buildLineTotalRowData(linha));
            linha.UIObject._children.sort(function (a, b) {
                if (a._isTotalRow) return 1;
                if (b._isTotalRow) return -1;
                var linhaA = mrendThis.GRenderedLinhas.find(function (l) { return l.rowid === a.rowid; });
                var linhaB = mrendThis.GRenderedLinhas.find(function (l) { return l.rowid === b.rowid; });
                return (linhaA ? linhaA.ordem || 0 : 0) - (linhaB ? linhaB.ordem || 0 : 0);
            });
        });
    }

    function findTabulatorRowByRowId(rowid) {
        if (!mrendThis.GTable || !rowid) {
            return null;
        }

        try {
            var byIndex = mrendThis.GTable.getRow(rowid);
            if (byIndex && byIndex.getData && byIndex.getData().rowid === rowid) {
                return byIndex;
            }
        } catch (e) { /* fallback abaixo */ }

        function walkRows(rows) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (row.getData().rowid === rowid) {
                    return row;
                }
                if (row.getTreeChildren) {
                    var nested = walkRows(row.getTreeChildren());
                    if (nested) {
                        return nested;
                    }
                }
            }
            return null;
        }

        return walkRows(mrendThis.GTable.getRows());
    }

    function syncCellValueFromEdit(rowid, coluna, valor) {
        if (!rowid || rowid.indexOf("ROWTOTAL_") === 0) {
            return;
        }

        var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
            return linha.rowid === rowid;
        });
        if (renderedLinha && renderedLinha.UIObject) {
            renderedLinha.UIObject[coluna] = valor;
        }

        var cellObjectConfig = mrendThis.GCellObjectsConfig.find(function (obj) {
            return obj.codigocoluna == coluna && obj.rowid == rowid;
        });
        if (cellObjectConfig) {
            cellObjectConfig.valor = valor;
        }
    }

    function refreshLineTotalRowInTabulator(parentLinha) {
        if (!mrendThis.GTable || !parentLinha || !parentLinha.config.linhatemtotal) {
            return;
        }

        try {
            var totalData = buildLineTotalRowData(parentLinha);
            var parentRow = findTabulatorRowByRowId(parentLinha.rowid);
            if (!parentRow) {
                return;
            }

            var totalRow = findTabulatorRowByRowId(totalData.rowid);
            if (totalRow) {
                refreshAllLineTotalColumns(parentLinha);
            } else {
                parentRow.addTreeChild(totalData);
                parentRow.treeExpand();
            }

            if (parentLinha.UIObject) {
                parentLinha.UIObject._children = parentLinha.UIObject._children || [];
                parentLinha.UIObject._children = parentLinha.UIObject._children.filter(function (child) {
                    return !child._isTotalRow;
                });
                parentLinha.UIObject._children.push(totalData);
            }
        } catch (e) {
            console.warn("[MRend] refreshLineTotalRow:", e);
        }
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
        // Comportamento automático de grupo: desabilita células, aplica cor de fundo
        this.comportamentogrupo = data.comportamentogrupo || false;
        this.corcomportgrupo = data.corcomportgrupo || "";
        // Código da coluna que fica visível/editável como título na linha de grupo
        this.colunatitulo = data.colunatitulo || "";
        // Se true, a coluna título leva a descrição da linha (readonly)
        this.levadesclinha = data.levadesclinha || false;
        // Totais por linha (Tabulator) — migra temtotais/totkey legado se existir
        var migratedTotalConfig = migrateLegacyLineTotalConfig(data);
        this.linhatemtotal = migratedTotalConfig.linhatemtotal;
        this.tituloparatotal = migratedTotalConfig.tituloparatotal;
        this.colunastotais = migratedTotalConfig.colunastotais;
        this.temexpressaototal = data.temexpressaototal || false;
        this.expressaototal = data.expressaototal || "";
        this.cortotallinha = data.cortotallinha || "";
        this.cortextototallinha = data.cortextototallinha || "";
        // Blacklist: properties not inherited by child lines
        var defaultBlacklist = "comportamentogrupo,corcomportgrupo,colunatitulo,levadesclinha,linhatemtotal,colunastotais,tituloparatotal,cortotallinha,cortextototallinha,modelo";
        this.blacklistheranca = data.blacklistheranca || defaultBlacklist;

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
        this.forcaeditavel = data.forcaeditavel || false;
        this.expresscolfun = data.expresscolfun || "";
        this.botaohtml = data.botaohtml || "";
        this.temlinhadesc = data.temlinhadesc || false;
        this.colfunc = data.colfunc || false;
        this.eventoclique = data.eventoclique || false;
        this.expressaoclique = data.expressaoclique || "";
        this.ordem = data.ordem || 0;
        this.expressaotbjs = data.expressaotbjs || "";
        this.usaexpresstbjs = data.usaexpresstbjs || false;
        this.usaexpressrubdesc = data.usaexpressrubdesc || false;
        this.expressaojsrubdesc = data.expressaojsrubdesc || "";
        this.usaexpressaocoldesc = data.usaexpressaocoldesc || false;
        this.expresssaojscoldesc = data.expresssaojscoldesc || "";

        this.condicattr = data.condicattr || false;
        this.condicattrexpr = data.condicattrexpr || "";

        this.condictipo = data.condictipo || false;
        this.condicetipoxpr = data.condicetipoxpr || "";

        this.condicfunc = data.condicfunc || false;
        this.condicfuncexpr = data.condicfuncexpr || "";
        this.tamanho = data.tamanho || 150;
        this.alinhamento = data.alinhamento || "left";
        this.levadesclinha = data.levadesclinha || false;

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

        this.fxdata = new FXData({});

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





    // ── Pending edits: localStorage para sobreviver a overwrite do Dexie por re-fetch ──
    function _pendingEditsKey() {
        return "mrend_pedits_" + (mrendThis.dbTableToMrendObject.dbName || "") + "_" + mrendThis.tableSourceName;
    }
    function _savePendingEdit(cellId, campo, value) {
        try {
            var key = _pendingEditsKey();
            var raw = localStorage.getItem(key);
            var edits = raw ? JSON.parse(raw) : {};
            if (!edits[cellId]) edits[cellId] = {};
            edits[cellId][campo] = value;
            localStorage.setItem(key, JSON.stringify(edits));
        } catch (e) { /* localStorage indisponível ou quota excedida */ }
    }
    function _applyPendingEdits() {
        try {
            var key = _pendingEditsKey();
            var raw = localStorage.getItem(key);
            if (!raw) return Promise.resolve();
            var edits = JSON.parse(raw);
            var cellIds = Object.keys(edits);
            if (!cellIds.length) return Promise.resolve();
            var promises = cellIds.map(function (cellId) {
                return mrendThis.db[mrendThis.tableSourceName]
                    .where("cellId").equals(cellId)
                    .modify(edits[cellId])
                    .catch(function () { /* registo pode não existir ainda */ });
            });
            return Promise.all(promises);
        } catch (e) { return Promise.resolve(); }
    }
    function _clearPendingEdits() {
        try { localStorage.removeItem(_pendingEditsKey()); } catch (e) { }
    }
    // ─────────────────────────────────────────────────────────────────────────────

    function syncChangesToDB(cellObject, valor) {

        if (cellObject.changedb == false) {
            return Promise.resolve();
        }
        var htmlComponent = getCellHtmlComponent(cellObject.cellid);
        var varlorF = valor == "Infinity" || valor == "-Infinity" || valor == Infinity ? 0 : valor;

        var buildChangeResult = buildChangedObjectUpdateData(htmlComponent, cellObject, varlorF);

        console.log("[MRend DEBUG] syncChangesToDB | cellid:", cellObject.cellid, "| campo:", buildChangeResult && buildChangeResult.changedData ? Object.keys(buildChangeResult.changedData)[0] : "?", "| valor:", varlorF, "| sourceValue:", buildChangeResult && buildChangeResult.sourceValue);

        // Guardar edição pendente antes de tentar persistir no Dexie
        if (buildChangeResult && buildChangeResult.sourceValue && buildChangeResult.changedData) {
            var campo = Object.keys(buildChangeResult.changedData)[0];
            if (campo !== undefined) {
                _savePendingEdit(buildChangeResult.sourceValue, campo, buildChangeResult.changedData[campo]);
            }
        } else {
            console.warn("[MRend DEBUG] _savePendingEdit NÃO chamado — sourceValue vazio ou changedData vazio. cellid:", cellObject.cellid);
        }

        var table = mrendThis.tableSourceName;
        return updateCellOnDB(buildChangeResult, table).then(function(modified) {
            console.log("[MRend DEBUG] updateCellOnDB modificou", modified, "registo(s). cellid:", cellObject.cellid);
        }).catch(function (err) {
            console.warn("[MRend] syncChangesToDB falhou:", err);
        });
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

        // CENTRAL: usa resolveFilhaConfig para garantir config-filha correta + blacklist aplicada.
        // MESMA função usada no refresh (getRenderedLinhas) e na recursão (processFilhasRecursivo).
        var filhaConfig = resolveFilhaConfig(this.config, null);
        if (!filhaConfig) filhaConfig = JSON.parse(JSON.stringify(this.config));

        var codigoLinha = filhaConfig.codigo + "___" + generateTimestampNumber(10);
        var ordem = generateLinhaOrdem();
        var rowid = generateUUID();
        var renderedLinha = new RenderedLinha({ ordem: ordem, codigo: codigoLinha, novoregisto: true, rowid: rowid, linkid: this.rowid, parentid: "", config: filhaConfig });

        // Initialize UIObject with all column fields using centralized utility
        renderedLinha.UIObject = createUIObjectWithColumns(rowid);

        // renderCelula=true: cria uma célula vazia por coluna com linkid=pai → salva no Dexie.
        // Sem isto, a linha filha não tem registos e desaparece no refresh.
        renderedLinha.addToLocalRenderedLinhasList([], { rowid: rowid }, true, false);

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


    function GrupoColuna(data) {

        this.grupocolunastamp = data.grupocolunastamp || "";
        this.relatoriostamp = data.relatoriostamp || "";
        this.codigogrupo = data.codigogrupo || "";
        this.descgrupo = data.descgrupo || "";
        this.fixa = data.fixa || false;
        this.ordem = data.ordem || 0
        this.extras = data.extras || ""
    }


    function GrupoColunaItem(data) {

        this.grupocolunaitemstamp = data.grupocolunaitemstamp || "";
        this.grupocolunastamp = data.grupocolunastamp || "";
        this.relatoriostamp = data.relatoriostamp || "";
        this.colunastamp = data.colunastamp || "";
        this.ordem = data.ordem || 0;
        this.extras = data.extras || "";

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
        this.grupocolunas = Array.isArray(data.grupocolunas) ? Array.from(data.grupocolunas.map(mapGrupoColuna)) : [];
        this.grupocolunaItems = Array.isArray(data.grupocolunaItems) ? Array.from(data.grupocolunaItems.map(mapGrupoColunaItem)) : [];
    }

    function mapGrupoColuna(data) {
        return new GrupoColuna(data);
    }

    function mapGrupoColunaItem(data) {
        return new GrupoColunaItem(data);
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
        var staticColumnCodes = {};
        var claimedDynamicCodes = {};

        colunas.forEach(function (cfgColuna) {
            staticColumnCodes[String(cfgColuna.codigocoluna || "").trim()] = true;
        });


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


            var prefix = String((coluna.codigocoluna || "").trim()) + "___";
            var recordsColuna = records.filter(function (record) {
                var recordColuna = String(record && record.coluna || "").trim();
                if (!recordColuna || claimedDynamicCodes[recordColuna] || staticColumnCodes[recordColuna]) {
                    return false;
                }
                if (recordColuna.indexOf(prefix) === 0) {
                    return true;
                }
                // Compatibilidade com inst?ncias criadas por vers?es antigas sem prefixo.
                var sameField = String(record.campo || "") === String(coluna.campo || "");
                var sameType = String(record.tipocol || "") === String(coluna.tipo || "");
                return sameField && sameType;
            });
            var distinctColunas = getDistinctWithKeys(recordsColuna, "coluna");
            distinctColunas.sort(function (a, b) {
                return resolveOrdemColunaValue(a) - resolveOrdemColunaValue(b);
            });

            distinctColunas.forEach(function (distinctColuna) {
                claimedDynamicCodes[String(distinctColuna.coluna || "").trim()] = true;
                var renderedColuna = new RenderedColuna({
                    codigocoluna: distinctColuna.coluna,
                    desccoluna: distinctColuna.descColuna || distinctColuna.desccoluna || "",
                    ordem: resolveOrdemColunaValue(distinctColuna),
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
                break;

            case "text":

                return valor ? valor : "";
                break;
            case "date":
                return valor ? valor : "1900-01-01";
                break;
            case "table":
                return valor ? valor : "";
                break;
            default:
                return valor;
        }
    }



    function getDistinctWithKeys(records, key) {
        return _.uniqBy(records, key);
    }

    // Lê ordem da coluna independentemente de camelCase/lowercase (Dexie/EAV).
    function resolveOrdemColunaValue(obj) {
        if (!obj) {
            return 0;
        }
        var raw = obj.ordemColuna;
        if (raw === undefined || raw === null || raw === "") {
            raw = obj.ordemcoluna;
        }
        if (raw === undefined || raw === null || raw === "") {
            raw = obj.ordem;
        }
        var n = Number(raw);
        return isNaN(n) ? 0 : n;
    }

    // Próxima ordem de coluna = max(GRenderedColunas, células, new records) + 1.
    function generateColunaOrdem() {
        var maxOrdem = 0;
        function consider(v) {
            var n = Number(v);
            if (!isNaN(n) && n > maxOrdem) {
                maxOrdem = n;
            }
        }
        (mrendThis.GRenderedColunas || []).forEach(function (col) {
            consider(col.ordem);
        });
        (mrendThis.GCellObjectsConfig || []).forEach(function (cell) {
            consider(resolveOrdemColunaValue(cell));
        });
        (mrendThis.GNewRecords || []).forEach(function (rec) {
            consider(resolveOrdemColunaValue(rec));
        });
        return maxOrdem + 1;
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

                    // chunkMapping:false = EAV format: each tableRow is ONE cell for ONE column.
                    // Only apply handleDefaultValueByDataType for the column that matches this cell.
                    var matchingColuna = mrendThis.GRenderedColunas.find(function (coluna) {
                        return coluna.codigocoluna == tableRow.coluna;
                    });
                    if (matchingColuna) {
                        tableRow[matchingColuna.config.campo] = handleDefaultValueByDataType(matchingColuna.config.tipo, tableRow[matchingColuna.config.campo]);
                    }

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
                    setIfSourceFieldExists(tableRow, source, "linkCodigoField", source.linkCodigoField, "", tableRow, "linkCodigo");
                    setIfSourceFieldExists(tableRow, source, "descLinkField", source.descLinkField, "", tableRow, "descLink");

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


                        tableRow[cell.campo] = handleDefaultValueByDataType(colunaConfig.config.tipo, cell[colunaConfig.config.campo])

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
                setIfSourceFieldExists(tableRow, source, "linkCodigoField", source.linkCodigoField, "", row, "linkCodigo");
                setIfSourceFieldExists(tableRow, source, "descLinkField", source.descLinkField, "", row, "descLink");



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
        var mrendObject = new MrendObject({
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
            linkCodigo: record[extras.linkCodigoField] || "",
            linkCodigoField: extras.linkCodigoField || "",
            descLink: record[extras.descLinkField] || "",
            descLinkField: extras.descLinkField || "",
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
            // camelCase (MrendObject) — NÃO usar só "ordemcoluna" aqui: o construtor ignora lowercase.
            ordemColuna: record[extras.ordemColunaField] || record.ordemColuna || record.ordemcoluna || 0,
            ordemcoluna: record[extras.ordemColunaField] || record.ordemcoluna || record.ordemColuna || 0,
            descColuna: record[extras.descColunaField] || "",
            tipocolField: extras.tipocolField || "",
            tipocol: record[extras.tipocolField] || "",
            ordem: record[extras.ordemField] || 0
        });

        // Materializa também os nomes físicos dos campos no objeto Dexie.
        // Sem isto, updateCellOnDB(where(sourceKey)) falha em chunkMapping:false
        // porque o registo local tinha apenas aliases internos (cellId/rowid/coluna).
        applyExtraField(mrendObject, record, extras, "linkField", "linkId");
        applyExtraField(mrendObject, record, extras, "cellIdField", "cellId");
        applyExtraField(mrendObject, record, extras, "colunaField", "coluna");
        applyExtraField(mrendObject, record, extras, "ordemColunaField", "ordemcoluna");
        // Mantém alias camelCase alinhado com o campo físico.
        if (extras.ordemColunaField && record[extras.ordemColunaField] != null && record[extras.ordemColunaField] !== "") {
            mrendObject.ordemColuna = record[extras.ordemColunaField];
        }
        applyExtraField(mrendObject, record, extras, "rowIdField", "rowid");
        applyExtraField(mrendObject, record, extras, "linhaField", "codigolinha");
        applyExtraField(mrendObject, record, extras, "tipocolField", "tipocol");
        applyExtraField(mrendObject, record, extras, "descLinhaField", "descLinha");
        applyExtraField(mrendObject, record, extras, "descColunaField", "descColuna");

        return mrendObject;
    }


    this.ConvertDbTableToMrendObject = function (data, MrendConversionConfig) {
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


                    var rowid = record[MrendConversionConfig.tableKey] || record.rowid || "";

                    // //console.log((configCol.campo, record[configCol.campo])
                    mrendObject.campo = MrendConversionConfig.chunkMapping == true ? key : configCol.campo;
                    mrendObject[configCol.campo] = MrendConversionConfig.chunkMapping == true ? record[key] : record[configCol.campo];
                    mrendObject.coluna = key;
                    mrendObject.rowid = rowid;
                    mrendObject.codigolinha = MrendConversionConfig.table;
                    mrendObject.cellId = key + "COLUNA___LINHA" + String(rowid != null ? rowid : "").trim();
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


                    var rowid = record[MrendConversionConfig.tableKey] || record.rowid || "";

                    // //console.log((configCol.campo, record[configCol.campo])
                    mrendObject.campo = MrendConversionConfig.chunkMapping == true ? key : configCol.campo;
                    mrendObject[configCol.campo] = MrendConversionConfig.chunkMapping == true ? record[key] : record[configCol.campo];
                    mrendObject.coluna = key;
                    mrendObject.rowid = rowid;
                    mrendObject.codigolinha = MrendConversionConfig.table;
                    mrendObject.cellId = key + "COLUNA___LINHA" + String(rowid != null ? rowid : "").trim();
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


    /**
     * Determina se uma coluna é a "coluna título" do grupo para uma linha com comportamentogrupo.
     * Prioridade:
     *   1. linha.colunatitulo (se definido)
     *   2. linha.levadesclinha → primeira coluna fixa ou primeira coluna do grid
     *   3. coluna.fixacoluna (fallback legado)
     */
    function isColunaTituloGrupo(linhaConfig, codigocoluna, colunaConfig) {

        if (linhaConfig.colunatitulo) {
            return codigocoluna === linhaConfig.colunatitulo;
        }

        if (linhaConfig.levadesclinha) {
            var colunas = Array.isArray(mrendThis.GRenderedColunas) ? mrendThis.GRenderedColunas : [];
            var primeiraColuna = colunas.find(function (c) { return c.config && c.config.fixacoluna; })
                || colunas[0];
            return primeiraColuna ? codigocoluna === primeiraColuna.codigocoluna : false;
        }

        return colunaConfig ? !!colunaConfig.fixacoluna : false;
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


    function setLinha(linh, parentid, records) {

        //Colocou-se uma função dentro de outra para que no futuro seja possível adicionar mais tipos de linhas

        return setLinhaToRender(linh, parentid, records);

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
        // Compatibilidade com o comportamento estável do MREND 24 ABR 2026:
        // 1) tenta achar a célula pela coluna exata
        // 2) se falhar, reutiliza o primeiro record da linha em vez de assumir novo registo
        // Isto evita materializar células duplicadas no refresh quando a correspondência
        // de `coluna` falha em clientes antigos/configurações legadas.
        linhaRecord = records.find(function (rec) {
            return rec && String(rec.coluna || "").trim() === String(coluna.codigocoluna || "").trim();
        });
        if (!linhaRecord) {
            linhaRecord = records.find(function (rec) {
                return rec && String(rec.campo || "").trim() === String(coluna.config.campo || "").trim();
            });
        }
        if (!linhaRecord) {
            linhaRecord = records[0];
        }

        var cellId = null;
        var novoRegisto = false;

        if (linhaRecord) {

            cellId = linhaRecord.cellId

        }


        if (!linhaRecord) {
            // Constrói registo vazio a partir dos campos de MrendObject
            linhaRecord = new MrendObject({});
            cellId = generateUUID();
            novoRegisto = true;
        }

        // ── Se coluna OU linha tem levadesclinha, usa descricao da linha como valor ──
        // FIX: O dado real está no campo específico (ex: cvalor), NÃO em 'valor'.
        // 'valor' é apenas um alias/metadata. Sempre priorizar o campo real da coluna.
        var valorCampoEspecifico = linhaRecord[coluna.config.campo];
        var valorCelula;
        if (valorCampoEspecifico !== undefined && valorCampoEspecifico !== null && valorCampoEspecifico !== '') {
            valorCelula = valorCampoEspecifico;
        } else if (linhaRecord.valor !== undefined && linhaRecord.valor !== null && linhaRecord.valor !== '') {
            valorCelula = linhaRecord.valor;
        } else {
            valorCelula = valorCampoEspecifico !== undefined ? valorCampoEspecifico : linhaRecord.valor;
        }
        var atributoCelula = isUndefinedOrNull(configCelula.atributo) ? coluna.config.atributo : configCelula.atributo;

        var deveLevarDescLinha = false;

        // Caso 1: Coluna configurada para sempre levar descrição
        if (coluna.config.levadesclinha) {
            deveLevarDescLinha = true;
        }

        // Caso 2: Linha com comportamento grupo + levadesclinha + é a coluna título
        // (apenas para linhas-pai — filhas com linkid nunca são cabeçalho de grupo)
        if (!linha.linkid && linha.config.comportamentogrupo && linha.config.levadesclinha && linha.config.colunatitulo) {
            var isTitulo = linha.config.colunatitulo === coluna.codigocoluna ||
                (coluna.config.fixacoluna && !linha.config.colunatitulo);
            if (isTitulo) {
                deveLevarDescLinha = true;
            }
        }

        if (deveLevarDescLinha) {
            valorCelula = linha.config.descricao || "";
            atributoCelula = "readonly";
        }


        var cellObjectConfig = new CellObjectConfig(
            {
                // Compatibilidade com o fluxo estável usado no MREND 24 ABR 2026:
                // a edição de células resolve sempre pelo `cellId` interno do Dexie.
                bindData: new BindData({ sourceKey: "cellId", sourceBind: coluna.config.campo }),
                tipolistagem: "",
                component: "Celula",
                componentcategoria: "Celula",
                expressao: "",
                atributo: atributoCelula,
                proibenegativo: isUndefinedOrNull(configCelula.proibenegativo) ? "" : configCelula.proibenegativo,
                dataType: coluna.config.tipo,
                valor: valorCelula,
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
        // Tabulator usa o `field` da coluna (codigocoluna). Em chunkMapping=true,
        // usar `campo` causa colisão entre instâncias do mesmo modelo.
        linh.UIObject[coluna.codigocoluna] = cellObjectConfig.valor;
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
            // Propagar codigo/descricao da linha-pai (ex: gruponatureza/descgrupnatureza)
            // para o registo a gravar. Resolve o pai a partir do rowid (linha.linkid).
            var __linkCodigoField = mrendThis.dbTableToMrendObject.extras.linkCodigoField;
            var __descLinkField = mrendThis.dbTableToMrendObject.extras.descLinkField;
            var __linhaPai = null;
            if (linha.linkid && Array.isArray(mrendThis.GRenderedLinhas)) {
                __linhaPai = mrendThis.GRenderedLinhas.find(function (rl) {
                    return rl && rl.rowid === linha.linkid;
                });
            }
            var __linkCodigoVal = __linhaPai ? (__linhaPai.codigo || "") : (linha.linkcodigo || "");
            var __descLinkVal = __linhaPai && __linhaPai.config ? (__linhaPai.config.descricao || "") : (linha.linkdescricao || "");
            // Normalizar codigo: instancias usam "<codigo>___<timestamp>" — guardar so a raiz.
            if (typeof __linkCodigoVal === "string" && __linkCodigoVal.indexOf("___") > -1) {
                __linkCodigoVal = __linkCodigoVal.split("___")[0];
            }
            linhaRecord.linkCodigo = __linkCodigoVal;
            linhaRecord.linkCodigoField = __linkCodigoField || "";
            linhaRecord.descLink = __descLinkVal;
            linhaRecord.descLinkField = __descLinkField || "";
            if (__linkCodigoField) {
                linhaRecord[__linkCodigoField] = __linkCodigoVal;
            }
            if (__descLinkField) {
                linhaRecord[__descLinkField] = __descLinkVal;
            }
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
            var ordemColunaVal = resolveOrdemColunaValue(coluna);
            if (!ordemColunaVal) {
                ordemColunaVal = generateColunaOrdem();
                coluna.ordem = ordemColunaVal;
            }
            linhaRecord.ordemColuna = ordemColunaVal;
            linhaRecord.ordemcoluna = ordemColunaVal;
            if (linhaRecord.ordemColunaField) {
                linhaRecord[linhaRecord.ordemColunaField] = ordemColunaVal;
            }
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

            // Deriva os campos do schema a partir de MrendObject — ignora o array schemas
            // (que contém MrendSchema wrappers vazios usados para outro fim)
            // cellId é a chave primária; os restantes campos de MrendObject são indexes secundários
            var mrendObjectFields = Object.keys(new MrendObject({}));
            var primaryKey = "cellId";
            var secondaryIndexes = mrendObjectFields.filter(function (f) { return f !== primaryKey; });
            var schemaFields = [primaryKey].concat(secondaryIndexes);

            return configureDataBase(mrendThis.db, mrendThis.tableSourceName, 1, schemaFields).then(function (result) {
                mrendThis.db = result;
                resolve({ inited: true, message: "Success", db: result });
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
        window.localStorage.setItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName, (sourceStamp || "").trim())
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

        if (!mrendThis.db[tableName]) {
            console.error("addBulkData: tabela '" + tableName + "' não existe no Dexie. Tabelas registadas:", Object.keys(mrendThis.db['_allTables'] || {}));
            return Promise.reject(new Error("Tabela '" + tableName + "' não encontrada no Dexie."));
        }

        return mrendThis.db[tableName].bulkPut(dataArray);

    }



    function getDataFromRemote() {

        return new Promise(function (resolve, reject) {
            $.ajax({
                type: mrendThis.remoteFetchData.type,
                url: mrendThis.remoteFetchData.url,
                data: mrendThis.remoteFetchData.data,
                success: function (response) {
                    console.log("Data fetched from remote:", response);
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
        if (mrendThis.GNewRecords.length === 0) {
            return Promise.resolve([]);
        }

        // Retira imediatamente o lote da fila para chamadas concorrentes não o gravarem
        // novamente enquanto o bulkPut ainda está em curso.
        var pendingRecords = mrendThis.GNewRecords.splice(0, mrendThis.GNewRecords.length);
        var previousWrite = mrendThis._addNewRecordsPromise || Promise.resolve();

        var writePromise = previousWrite.then(function () {
            if (mrendThis.dbTableToMrendObject.chunkMapping !== false) {
                return pendingRecords;
            }

            // Em EAV, rowid + coluna identifica logicamente uma célula. O cellId é um
            // UUID técnico e não pode transformar a mesma célula num novo registo.
            return mrendThis.db[mrendThis.tableSourceName].toArray().then(function (existingRecords) {
                var logicalCells = {};

                existingRecords.forEach(function (record) {
                    logicalCells[getLogicalCellKey(record)] = true;
                });

                return pendingRecords.filter(function (record) {
                    var logicalKey = getLogicalCellKey(record);
                    if (logicalCells[logicalKey]) {
                        console.warn("MREND: insert EAV duplicado ignorado", {
                            rowid: record.rowid,
                            coluna: record.coluna,
                            cellId: record.cellId
                        });
                        return false;
                    }
                    logicalCells[logicalKey] = true;
                    return true;
                });
            });
        }).then(function (recordsToInsert) {
            if (recordsToInsert.length === 0) {
                return [];
            }
            return addBulkData(mrendThis.db, mrendThis.tableSourceName, recordsToInsert);
        }).then(function (data) {
            mrendThis.GCellObjectsConfig = mrendThis.GCellObjectsConfig.concat(mrendThis.TMPCellObjectCOnfig);

            if (mrendThis.reactiveData.cells) {
                console.log("Refreshing reactive cells after adding new records");
                mrendThis.refreshReactiveData()
            }
            return data;
        }).catch(function (err) {
            // Mantém os registos disponíveis para uma tentativa posterior.
            mrendThis.GNewRecords = pendingRecords.concat(mrendThis.GNewRecords);
            console.error("MREND: erro ao inserir novos registos", err);
            return [];
        });

        mrendThis._addNewRecordsPromise = writePromise;
        return writePromise;
    }

    function getLogicalCellKey(record) {
        var rowid = String(record && record.rowid != null ? record.rowid : "").trim();
        var coluna = String(record && record.coluna != null ? record.coluna : "").trim();
        if (!rowid || !coluna) {
            return "\u0001" + String(record && record.cellId != null ? record.cellId : generateUUID());
        }
        return rowid + "\u0000" + coluna;
    }

    function reconcileEavRecords(records) {
        if (mrendThis.dbTableToMrendObject.chunkMapping !== false || !Array.isArray(records)) {
            return Promise.resolve(records || []);
        }

        var pendingEdits = {};
        try {
            var rawPendingEdits = localStorage.getItem(_pendingEditsKey());
            pendingEdits = rawPendingEdits ? JSON.parse(rawPendingEdits) : {};
        } catch (e) { }

        var recordsByLogicalCell = {};
        var duplicateCellIds = [];

        records.forEach(function (record) {
            var logicalKey = getLogicalCellKey(record);
            var current = recordsByLogicalCell[logicalKey];

            if (!current) {
                recordsByLogicalCell[logicalKey] = record;
                return;
            }

            var keepRecord = getEavRecordScore(record, pendingEdits) > getEavRecordScore(current, pendingEdits)
                ? record
                : current;
            var duplicateRecord = keepRecord === record ? current : record;

            recordsByLogicalCell[logicalKey] = keepRecord;
            if (duplicateRecord.cellId && duplicateRecord.cellId !== keepRecord.cellId) {
                duplicateCellIds.push(duplicateRecord.cellId);
            }
        });

        var reconciledRecords = Object.keys(recordsByLogicalCell).map(function (key) {
            return recordsByLogicalCell[key];
        });

        if (duplicateCellIds.length === 0) {
            return Promise.resolve(reconciledRecords);
        }

        console.warn("MREND: removendo células EAV duplicadas", duplicateCellIds.length);
        return mrendThis.db[mrendThis.tableSourceName].bulkDelete(duplicateCellIds).then(function () {
            return reconciledRecords;
        });
    }

    function getEavRecordScore(record, pendingEdits) {
        var score = pendingEdits && pendingEdits[record.cellId] ? 1000 : 0;
        var fieldValue = record && record.campo ? record[record.campo] : undefined;

        if (fieldValue !== undefined && fieldValue !== null && String(fieldValue).trim() !== "") {
            score += 100;
        }
        if (record && record.valor !== undefined && record.valor !== null && String(record.valor).trim() !== "") {
            score += 10;
        }
        return score;
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

    function jqueryDateEditor(cell, onRendered, success, cancel) {
        // cria o input
        var input = document.createElement("input");
        input.setAttribute("type", "text");

        input.setAttribute("data-language", "pt");

        input.value = cell.getValue() || "";

        onRendered(function () {
            $(input).datepicker({
                dateFormat: "dd.mm.yyyy",   // formato da data
                onSelect: function (dateText) {
                    success(dateText);    // devolve o valor selecionado ao Tabulator
                },
                onClose: function () {
                    cancel();             // fecha edição
                }
            }).datepicker("show");

            input.focus();
        });

        return input;
    }


    function getRenderedLinhaFromTabulator(cell, colunaConfig, colunaUIConfig) {

        var rowData = cell.getRow().getData();

        // ── Se for linha de total, retornar objeto dummy ──
        if (rowData._isTotalRow) {
            return {
                rowid: rowData.rowid,
                config: { tipo: "TotalLinha" },
                UIObject: rowData
            };
        }

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

        // ── Se for linha de total, retornar objeto dummy ──
        if (renderedLinha.config && renderedLinha.config.tipo === "TotalLinha") {
            return {
                inactivo: false,
                condicinactivo: false,
                desabilitado: true,
                valordefeito: false
            };
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
        var deveSerReadonly = colunaConfig.atributo == "readonly" || colunaConfig.colfunc || colunaConfig.levadesclinha;

        // Verifica se a linha também tem levadesclinha configurado
        if (!deveSerReadonly && cell) {
            try {
                var rowData = cell.getRow().getData();
                var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == rowData.rowid;
                });

                if (renderedLinha && !renderedLinha.linkid && renderedLinha.config.comportamentogrupo && renderedLinha.config.levadesclinha && renderedLinha.config.colunatitulo) {
                    var isTitulo = renderedLinha.config.colunatitulo === colunaConfig.codigocoluna ||
                        (colunaConfig.fixacoluna && !renderedLinha.config.colunatitulo);
                    if (isTitulo) {
                        deveSerReadonly = true;
                    }
                }
            } catch (e) {
                // Ignora erro se não conseguir obter linha
            }
        }

        if (deveSerReadonly) {
            styles = "background:#dee5eb;"
        }

        if (colunaConfig.tipo == "textarea") {

            styles += " resize: none; overflow: hidden; white-space: pre-wrap; word-wrap: break-word;"

        }

        return "<div style='" + styles + ";text-align:" + colunaConfig.alinhamento + "' class='mrend-input-cell'>" + content + "</div>";
    }


    function isInactivo(cell, renderedColuna, colunaUIConfig, rowData) {

        // ── Se a coluna tem levadesclinha, deve ser readonly ──
        if (renderedColuna.levadesclinha) {
            return true;
        }

        // ── Se a linha tem comportamentogrupo + levadesclinha + esta é a coluna título, deve ser readonly ──
        try {
            var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                return linha.rowid == rowData.rowid;
            });

            if (renderedLinha && !renderedLinha.linkid && renderedLinha.config.comportamentogrupo && renderedLinha.config.levadesclinha && renderedLinha.config.colunatitulo) {
                var isTitulo = renderedLinha.config.colunatitulo === renderedColuna.codigocoluna ||
                    (renderedColuna.config.fixacoluna && !renderedLinha.config.colunatitulo);
                if (isTitulo) {
                    return true;
                }
            }
        } catch (e) {
            // Ignora erro
        }

        var condicAttrResult = ""
        if (renderedColuna.condicattr) {

            condicAttrResult = eval(renderedColuna.condicattrexpr);

        }

        if (condicAttrResult == "readonly" || condicAttrResult == "disabled") {
            return true;
        }

        if (renderedColuna.atributo == "readonly" || renderedColuna.atributo == "disabled") {
            return true;
        }

        var celula = getCelulaConfigFromTabulator(cell, renderedColuna, colunaUIConfig);

        if (celula.atributo == "readonly" || celula.atributo == "disabled") {
            return true;
        }

        var condicinactivo = celula.condicinactivo;
        if (condicinactivo) {
            var resultCondicInactivo = eval(celula.condicinactexpr);
            if (resultCondicInactivo) {
                return true
            }
        }

        if (celula.inactivo && condicinactivo == false) {
            return true;
        }

    }

    function handleColFormatter(cell, colunaConfig, colunaUIConfig) {


        var renderedColuna = colunaConfig;
        var rowData = cell.getRow().getData();

        // ── Linha de total (filha dataTree, não editável) ──
        if (rowData._isTotalRow) {
            var parentLinha = mrendThis.GRenderedLinhas.find(function (l) {
                return l.rowid === rowData._parentRowId;
            });
            var parentConfig = parentLinha ? parentLinha.config : null;
            var corTotal = getTotalRowColor(parentConfig);
            var corTextoCss = getTotalRowTextColorCss(parentConfig);
            var tituloCol = parentConfig ? resolveTituloColunaLinha(parentConfig) : "";
            var fieldName = (cell.getField() || "").trim();

            if (tituloCol && fieldName === tituloCol) {
                var titulo = rowData._totalTitle || rowData[tituloCol] || "Total";
                return "<div style='background:" + corTotal + ";font-weight:bold;" + corTextoCss + "text-align:left;padding:4px 8px;' class='mrend-input-cell'>" + titulo + "</div>";
            }

            var value = cell.getValue();
            if (colunaConfig.tipo === "digit" && value !== undefined && value !== null && value !== "") {
                var formattedValue = formatNumber(value, colunaConfig);
                return "<div style='background:" + corTotal + ";font-weight:bold;" + corTextoCss + "text-align:" + colunaConfig.alinhamento + "' class='mrend-input-cell'>" + formattedValue + "</div>";
            }
            return "<div style='background:" + corTotal + ";font-weight:bold;" + corTextoCss + "' class='mrend-input-cell'>&nbsp;</div>";
        }

        // ── Se a coluna tem levadesclinha, usa descLinha como valor ──
        /*if (renderedColuna.levadesclinha) {
            var valorDescLinha = rowData.descLinha || "";
            console.log("levadesclinha formatter", valorDescLinha)
            var content = valorDescLinha ? valorDescLinha.toString() : "&nbsp;";
            return generateMrendCellContainer(cell, renderedColuna, colunaUIConfig, content);
        }*/

        // ── comportamentogrupo: não-título → fundo colorido vazio; título → valor directo ──
        // (feito antes de getCelulaConfigFromTabulator porque a célula pode ter inactivo=true
        //  na config — herança da linha de grupo — o que esconderia o valor do título)
        var renderedLinhaGrupo = mrendThis.GRenderedLinhas.find(function (l) {
            return l.rowid == rowData.rowid;
        });

        if (renderedLinhaGrupo && renderedLinhaGrupo.config.comportamentogrupo && !renderedLinhaGrupo.linkid) {
            var fieldName = (cell.getField() || "").trim();
            var isTitulo = isColunaTituloGrupo(renderedLinhaGrupo.config, fieldName, colunaConfig);
            var cor = renderedLinhaGrupo.config.corcomportgrupo || "#e8edf2";

            if (!isTitulo) {
                var emptyDiv = document.createElement("div");
                emptyDiv.style.cssText = "background:" + cor + ";width:100%;height:100%;min-height:24px;";
                return emptyDiv;
            }

            // Coluna título: prioriza descrição da linha quando levadesclinha estiver activo
            var deveLevarDesc = colunaConfig.levadesclinha || renderedLinhaGrupo.config.levadesclinha;
            var val = cell.getValue();

            if (deveLevarDesc || val == null || val.toString().trim() === "") {
                val = renderedLinhaGrupo.config.descricao || "";
            }

            var content = val ? val.toString() : "&nbsp;";
            return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content);
        }
        // ─────────────────────────────────────────────────────────────────────────────

        var celula = getCelulaConfigFromTabulator(cell, colunaConfig, colunaUIConfig);

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
            case "logic":

                var checkboxContainer = document.createElement("div");
                checkboxContainer.style.textAlign = colunaConfig.alinhamento;
                var inactivo = isInactivo(cell, colunaConfig, colunaUIConfig, rowData);

                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "formatted-checkbox";
                checkbox.checked = cell.getValue() ? true : false;
                checkbox.disabled = inactivo
                // Adiciona o evento diretamente ao checkbox
                checkbox.addEventListener("change", function () {
                    var row = cell.getRow();
                    var rowData = row.getData();
                    var columnField = cell.getField();
                    var updateData = {};
                    Object.keys(rowData).forEach(function (key) {
                        if (key !== "_children" && key !== "id") {
                            updateData[key] = rowData[key];
                        }
                    });

                    updateData[columnField] = checkbox.checked;
                    row.update(updateData);

                    updateCellObjectConfig(columnField, row.getData(), checkbox.checked);

                });

                // Adiciona o checkbox ao container
                checkboxContainer.appendChild(checkbox);

                return checkboxContainer;

            case "button":
                return colunaConfig.botaohtml;
            case "date":

                try {

                    var date = new Date(cell.getValue());

                    var formatter = new Intl.DateTimeFormat("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    });
                    var formattedValue = formatter.format(date)
                    var content = ensureMinContent(formattedValue);
                    return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content);
                } catch (error) {
                    var content = ensureMinContent(cell.getValue());
                    return generateMrendCellContainer(cell, colunaConfig, colunaUIConfig, content);
                }

            case "table":

                var rowData = cell.getRow().getData();           // dados da linha (todas as colunas)
                var renderedLinha = getRenderedLinhaFromTabulator(cell, colunaConfig, colunaUIConfig);

                //console.log("Table formatter - rowData:", colunaConfig);
              //  console.log("Table formatter - renderedLinha:", renderedLinha);

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

    function checkboxCustomEditor(cell, onRendered, success, cancel) {
        // Cria o elemento checkbox
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = cell.getValue() === true;

        // Adiciona eventos ao checkbox
        checkbox.addEventListener("change", function () {
            success(checkbox.checked); // Retorna o novo valor ao Tabulator
        });

        checkbox.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                cancel(); // Cancela a edição
            }
        });

        // Foca no checkbox quando renderizado
        onRendered(function () {
            checkbox.focus();
        });

        return checkbox;
    }

    function handleEditor(coluna, colunaUIConfig) {

        if (!mrendThis.enableEdit && coluna.config.forcaeditavel == false) {
            return {};
        }
        if (coluna.config.tipo === "digit") {
            return {
                editor: numberFormatCustomEditor,
                editorParams: { colunaConfig: coluna.config }
            };
        }

        if (coluna.config.tipo === "date") {
            return {
                editor: jqueryDateEditor,
                editorParams: { colunaConfig: coluna.config }
            };
        }

        if (coluna.config.tipo === "logic") {

            return {

            };

        }
        if (coluna.config.tipo === "button") {

            return {
                editor: function (cell, onRendered, success, cancel) {
                    // Cria o botão editor
                    // var botaoHtml = coluna.config.botaohtml
                    var botaoHtml = coluna.config.botaohtml;
                    var epress
                    var $btn = $(botaoHtml)
                        .on("click", function () {
                            // Pega os dados da célula/linha
                            var rowData = cell.getRow().getData();
                            eval(coluna.config.expressaoclique)


                        });

                    onRendered(function () {
                        // Foca no botão se necessário
                        var rowData = cell.getRow().getData();
                        $btn.focus();
                        eval(coluna.config.expressaoclique)
                    });

                    return $btn[0];
                }
            }

        }

        if (coluna.config.tipo === "text") {
            return { editor: "input" };
        }

        if (coluna.config.tipo === "textarea") {
            return { editor: "textarea" };
        }

        if (coluna.config.tipo === "table") {

            var localDataArray = Array.isArray(coluna.localData) ? coluna.localData : [];
            var values = localDataArray.map(function (item) {
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
                        var renderedLinha = getRenderedLinhaFromTabulator(cell, coluna.config, colunaUIConfig);
                        var colunaConfig = coluna.config;
                        var celula = getCelulaConfigFromTabulator(cell, coluna.config, colunaUIConfig);

                        if (coluna.config.usaexpresstbjs && (!celula.localData || celula.localData.length == 0)) {
                            var evalResult = eval(coluna.config.expressaotbjs);
                            celula.localData = Array.isArray(evalResult) ? evalResult : [];
                        }

                        list = Array.isArray(celula.localData) ? celula.localData : [];

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

                // ── Linha de total: valor já vem de buildLineTotalRowData / refreshLineTotalColumns ──
                if (rowData._isTotalRow) {
                    return value;
                }

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

                // FIX: Só aplicar valordefeito e temlinhadesc se NÃO for edição manual
                // type === "edit" significa que o usuário está editando manualmente
                if (type !== "edit") {

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

    function updateCellObjectConfig(coluna, rowData, explicitValue) {
        if (!rowData || !rowData.rowid || rowData._isTotalRow) {
            return;
        }

        var valor = explicitValue !== undefined ? explicitValue : rowData[coluna];
        syncCellValueFromEdit(rowData.rowid, coluna, valor);
        refreshLineTotalColumnsForEdit(rowData.rowid, coluna);
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
            var colunaTitle = coluna.desccoluna;
            if (coluna.config.usaexpressaocoldesc && coluna.config.expresssaojscoldesc) {
                try {
                    colunaTitle = eval(coluna.config.expresssaojscoldesc);
                } catch (e) {
                    console.error("Erro ao avaliar expresssaojscoldesc para coluna " + coluna.codigocoluna, e);
                }
            }
            var colunaUIConfig = {
                title: colunaTitle,
                field: coluna.codigocoluna,
                width: coluna.config.tamanho,
                hozAlign: coluna.config.alinhamento,
                headerHozAlign: coluna.config.alinhamento,
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

            // Lata de lixo no cabeçalho só em colunas dinâmicas (modelo + "___")
            // quando "Botão para adicionar a coluna visível" (addBtn) está true.
            // Sem botão de adicionar coluna → sem lata (ex.: anos do Plano de negócio).
            if (coluna.config && coluna.config.modelo === true
                && String(coluna.codigocoluna || "").indexOf("___") > -1
                && !!coluna.config.addBtn) {
                var fieldRemovivel = coluna.codigocoluna;
                var tituloRemovivel = colunaTitle;
                colunaUIConfig.titleFormatter = function (cell, formatterParams, onRendered) {
                    var wrap = document.createElement("span");
                    wrap.className = "mrend-col-title-removable";
                    wrap.style.cssText = "display:inline-flex;align-items:center;gap:0.45em;max-width:100%;";

                    var label = document.createElement("span");
                    label.textContent = tituloRemovivel;
                    label.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

                    var trash = document.createElement("span");
                    trash.className = "glyphicon glyphicon-trash mrend-col-trash";
                    trash.setAttribute("title", "Remover coluna");
                    trash.setAttribute("role", "button");
                    trash.setAttribute("aria-label", "Remover coluna " + tituloRemovivel);
                    trash.style.cssText = "flex:0 0 auto;font-size:11px;opacity:0.55;cursor:pointer;padding:2px 3px;border-radius:3px;transition:opacity .15s,background-color .15s;";

                    trash.addEventListener("mouseenter", function () {
                        trash.style.opacity = "1";
                        trash.style.backgroundColor = "rgba(255,255,255,0.18)";
                    });
                    trash.addEventListener("mouseleave", function () {
                        trash.style.opacity = "0.55";
                        trash.style.backgroundColor = "transparent";
                    });
                    trash.addEventListener("click", function (ev) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (confirm("Remover esta coluna? Os dados desta coluna serão apagados.")) {
                            mrendThis.deleteColuna(fieldRemovivel);
                        }
                    });
                    trash.addEventListener("mousedown", function (ev) {
                        // Evita disparar sort do cabeçalho Tabulator
                        ev.preventDefault();
                        ev.stopPropagation();
                    });

                    wrap.appendChild(label);
                    wrap.appendChild(trash);
                    return wrap;
                };
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


                    if (coluna.config.tipo != "button") {
                        eval(renderedColuna.config.expressaoclique)

                    }






                }

            }



            colunaUIConfig.editable = function (cell) {

                var rowData = cell.getRow().getData()

                // ── Linhas de total não são editáveis ──
                if (rowData._isTotalRow) {
                    return false;
                }

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

                // comportamentogrupo: só a colunatitulo é editável (apenas linhas pai, sem linkid)
                if (renderedLinha.config.comportamentogrupo && !renderedLinha.linkid) {
                    var fieldName = (cell.getField() || "").trim();
                    var colunatituloVal = (renderedLinha.config.colunatitulo || "").trim();
                    return colunatituloVal
                        ? fieldName == colunatituloVal
                        : renderedColuna.config.fixacoluna;
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

        // ── Linhas de total não têm eventos ──
        if (rowData._isTotalRow) {
            return;
        }

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
            "zoom": "1",
            "padding-bottom": "30px",
            "overflow-x": "auto",
            "max-width": "100%"
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


        /*
        columns:[
        {
            title:"Column Group",
            frozen:true,//frozen column group on left of table
            columns:[
                {title:"Name", field:"name"},
                {title:"Age", field:"age"},
            ]
        }
        {title:"Eye Colour", field:"eyes"},
        {title:"Height", field:"height", frozen:true}, //frozen column on right of table
        ]
        
        */
        var grupoColuna = mrendThis.reportConfig.config.grupocolunas;

        grupoColuna.sort(function (a, b) {
            return a.ordem - b.ordem;
        });

        var grupoColunaItems = mrendThis.reportConfig.config.grupocolunaItems;
        var colunasCnfg = mrendThis.reportConfig.config.colunas;

        var columnsDefinition = [
            {
                title: "#",
                field: "idx",
                width: 120,
                frozen: true

            },

            {
                title: "Ações",
                frozen: true,
                formatter: function (cell, formatterParams) {

                    var rowData = cell.getRow().getData()

                    // ── Linhas de total não têm ações ──
                    if (rowData._isTotalRow) {
                        return "";
                    }

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
                        getParentLinhasAfetadasPorEdicao(addFilhaResult.rowid).forEach(function (parentLinha) {
                            refreshAllLineTotalColumns(parentLinha);
                        });
                        handleRowEvent(row, "add");



                    }

                    if (target.classList.contains("remove-row")) {
                        var row = cell.getRow();
                        var children = row.getTreeChildren();
                        var rowDataToDelete = row.getData();
                        var renderedToDelete = mrendThis.GRenderedLinhas.find(function (linha) {
                            return linha.rowid === rowDataToDelete.rowid;
                        });
                        var parentLinkId = renderedToDelete ? renderedToDelete.linkid : "";

                        deleteRowById(rowDataToDelete.rowid);
                        if (children.length > 0) {
                            if (confirm("Esta linha tem filhos. Deseja remover tudo?")) {
                                deleteRowAndChildren(row);
                            }
                        } else {
                            row.delete();
                        }

                        if (parentLinkId) {
                            var parentLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                                return linha.rowid === parentLinkId;
                            });
                            if (parentLinha) {
                                refreshAllLineTotalColumns(parentLinha);
                            }
                        }

                        mrendThis.refreshReactiveData();


                    }
                }
            }
        ];
        var addedToColGroup = [];
        var sortableEntries = [];

        grupoColuna.forEach(function (grupo) {

            var minOrdemGrupo = Infinity;
            var tmpGrupoColunaDefinition = {

                title: grupo.descgrupo,
                frozen: grupo.fixa,
                columns: []
            };

            var grupoColumnItems = grupoColunaItems.filter(function (objColumnItem) {

                return objColumnItem.grupocolunastamp === grupo.grupocolunastamp;
            });

            grupoColumnItems.sort(function (a, b) {
                return a.ordem - b.ordem;
            });

            grupoColumnItems.forEach(function (colunaItem) {

                var colunaCnfgFound = colunasCnfg.find(function (objColunaCnfg) {

                    return objColunaCnfg.colunastamp === colunaItem.colunastamp;
                });

                if (colunaCnfgFound) {

                    // Atualizar minOrdemGrupo com base na config, independentemente
                    // de a coluna estar renderizada ou ser modelo sem instâncias
                    if (colunaCnfgFound.ordem < minOrdemGrupo) {
                        minOrdemGrupo = colunaCnfgFound.ordem;
                    }

                    // Colunas modelo: adicionar todas as instâncias (field começa com codigocoluna + "___")
                    if (colunaCnfgFound.modelo) {
                        var prefixModelo = colunaCnfgFound.codigocoluna.trim() + "___";
                        var instanceCols = columns.filter(function (colDef) {
                            if (colDef.field.indexOf(prefixModelo) === 0) {
                                return true;
                            }

                            // Compatibilidade: também aceitar instâncias antigas sem prefixo
                            // desde que pertençam ao mesmo colunastamp de modelo.
                            var renderedCol = mrendThis.GRenderedColunas.find(function (rc) {
                                return rc.codigocoluna === colDef.field;
                            });
                            return renderedCol
                                && renderedCol.config
                                && renderedCol.config.colunastamp === colunaCnfgFound.colunastamp;
                        });
                        instanceCols.forEach(function (colDefinition) {
                            colDefinition.frozen = false;
                            tmpGrupoColunaDefinition.columns.push(colDefinition);
                            addedToColGroup.push(colDefinition);
                        });
                    } else {
                        var colDefinition = columns.find(function (colDef) {

                            return colDef.field === colunaCnfgFound.codigocoluna;
                        });

                        if (colDefinition) {
                            colDefinition.frozen = false;
                            tmpGrupoColunaDefinition.columns.push(colDefinition);
                            addedToColGroup.push(colDefinition);
                        }
                    }

                }

            });

            // Se o grupo não tem colunas (ex: todas são modelo sem instâncias),
            // adicionar uma coluna placeholder para o Tabulator não crashar
            if (tmpGrupoColunaDefinition.columns.length === 0) {
                tmpGrupoColunaDefinition.columns.push({
                    title: "",
                    field: "_placeholder_" + grupo.grupocolunastamp,
                    width: 1,
                    minWidth: 1,
                    headerSort: false,
                    cssClass: "mrender-placeholder-col",
                    formatter: function () { return ""; }
                });
            }

            var ordemFinal = minOrdemGrupo === Infinity ? grupo.ordem : minOrdemGrupo;
            sortableEntries.push({ ordem: ordemFinal, def: tmpGrupoColunaDefinition });

        });

        columns.forEach(function (cl) {

            var addedToColGroupResult = addedToColGroup.find(function (colDef) {
                return colDef.field === cl.field;
            });

            if (!addedToColGroupResult) {

                var colunaCnfg = colunasCnfg.find(function (c) {
                    return c.codigocoluna === cl.field;
                });
                var ordemCl = colunaCnfg ? colunaCnfg.ordem : 9999;
                sortableEntries.push({ ordem: ordemCl, def: cl });
            }

        });

        sortableEntries.sort(function (a, b) {
            return a.ordem - b.ordem;
        });

        sortableEntries.forEach(function (entry) {
            columnsDefinition.push(entry.def);
        });

        // ── Distribuição de largura estilo Bootstrap ──────────────────────────
        // Com ≤ 5 colunas de dados: mede o container (já a zoom=1), subtrai as
        // colunas frozen e os tamanhos definidos, e distribui o espaço restante
        // igualmente pelas colunas de dados — preenchendo a largura total.
        // Com > 5 colunas: usa fitDataFill com os tamanhos definidos e scroll-x.
        var nDataCols = 0;
        (function distribuirLarguras() {
            // Colunas de dados (não-frozen) da columnsDefinition
            var dataCols = [];
            (function collectData(defs) {
                defs.forEach(function (col) {
                    if (col.columns) { collectData(col.columns); }
                    else if (!col.frozen) { dataCols.push(col); }
                });
            })(columnsDefinition);

            nDataCols = dataCols.length;

            if (dataCols.length > 0 && dataCols.length <= 5) {
                // fitColumns com widthGrow=1 em todas as colunas de dados:
                // O Tabulator distribui o espaço restante (após as frozen) de forma
                // perfectamente igual — sem medições manuais de scrollbar, zoom ou
                // containerWidth. widthGrow=1 em todas = partes iguais garantidas,
                // independentemente de dataTree controls, padding, ou bordas.
                dataCols.forEach(function (col) {
                    delete col.width;
                    col.widthGrow = 1;
                });
            }
        })();

        var tabulatorLayout = nDataCols <= 5 ? "fitColumns" : "fitDataFill";

        if (mrendThis.GTable) {
            try { mrendThis.GTable.destroy(); } catch (e) { /* ignore destroy errors on re-render */ }
            mrendThis.GTable = null;
        }
        if (mrendThis._styleInterval) {
            clearInterval(mrendThis._styleInterval);
            mrendThis._styleInterval = null;
        }

        var tabulatorTarget = document.querySelector(mrendThis.containerToRender);
        if (!tabulatorTarget) {
            console.error("MRend: containerToRender '" + mrendThis.containerToRender + "' não existe no DOM. Tabulator não pode ser inicializado.");
            return;
        }

        // Promise que resolve quando o Tabulator dispara tableBuilt
        mrendThis._tableBuiltPromise = new Promise(function (resolve) {
            mrendThis._tableBuiltResolve = resolve;
        });

        mrendThis.GTable = new Tabulator(mrendThis.containerToRender, {
            data: mrendThis.GGridData,
            index: "rowid",
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildIndent: 25,
            popupContainer: "body",
            layout: tabulatorLayout,
            columnHeaderVertAlign: "bottom",
            height: mrendThis.tabulatorHeight || "400px", // altura configurável via optrender
            rowFormatter: function (row) {

                var data = row.getData();

                // ── Formatação especial para linhas de total ──
                if (data._isTotalRow) {
                    var parentConfigTotal = getParentLinhaConfigForTotalRow(data);
                    row.getElement().style.backgroundColor = getTotalRowColor(parentConfigTotal);
                    row.getElement().style.fontWeight = "bold";
                    var corTextoTotal = getTotalRowTextColor(parentConfigTotal);
                    if (corTextoTotal) {
                        row.getElement().style.color = corTextoTotal;
                    }
                    return;
                }

                if (row.getTreeParent()) {
                    row.getElement().style.backgroundColor = "#f8fafc";
                }
                var renderedLinha = mrendThis.GRenderedLinhas.find(function (linha) {
                    return linha.rowid == data.rowid;
                });

                if (!renderedLinha) {
                    console.warn("[MRend] rowFormatter: linha rowid=" + data.rowid + " não encontrada em GRenderedLinhas.");
                    return;
                }

                var customStyles = {
                    backgroundColor: renderedLinha.config.cor || "#f8fafc",
                };

                if (renderedLinha.config.estilopersonalizado) {
                    customStyles = eval(renderedLinha.config.expressaoestilopersonalizado);
                }

                Object.keys(customStyles).forEach(function (key) {
                    row.getElement().style[key] = customStyles[key];
                });

                // ── comportamentogrupo: fundo da linha — apenas linhas pai (sem linkid) ──
                if (renderedLinha.config.comportamentogrupo && !renderedLinha.linkid) {
                    var cor = renderedLinha.config.corcomportgrupo || "#e8edf2";
                    row.getElement().style.backgroundColor = cor;
                }
                // ────────────────────────────────────────────────────────────────────────

            },
            movableColumns: true, // Permite arrastar colunas para reordenar
            columns: columnsDefinition,

        });

        // Callback quando uma coluna é movida
        mrendThis.GTable.on("columnMoved", function (column, columns) {
            console.log("Coluna movida:", column.getField());

            // Atualiza o array GMrendConfigColunas com a nova ordem
            if (typeof GMrendConfigColunas !== 'undefined' && Array.isArray(GMrendConfigColunas)) {
                // Mapeamento: posição visual -> codigocoluna
                columns.forEach(function (col, index) {
                    var codigocoluna = col.getField();
                    var colunaConfig = GMrendConfigColunas.find(function (c) {
                        return c.codigocoluna === codigocoluna;
                    });
                    if (colunaConfig) {
                        colunaConfig.ordem = index + 1;
                    }
                });

                // Ordena o array pela nova ordem
                GMrendConfigColunas.sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });

                console.log("GMrendConfigColunas atualizado com nova ordem:", GMrendConfigColunas.map(function (c) {
                    return c.codigocoluna + ":" + c.ordem;
                }));

                alertify.success("Ordem das colunas atualizada! Clique em 'Actualizar Configuração' para guardar.");
            }
        });

        mrendThis.GTable.on("cellEdited", function (cell) {
            var row = cell.getRow();
            var rowData = row.getData();
            if (rowData._isTotalRow) {
                return;
            }

            var columnField = cell.getField();
            syncCellValueFromEdit(rowData.rowid, columnField, cell.getValue());

            var updateData = {};
            Object.keys(rowData).forEach(function (key) {
                if (key !== "_children" && key !== "id") {
                    updateData[key] = rowData[key];
                }
            });
            row.update(updateData);

            refreshLineTotalColumnsForEdit(rowData.rowid, columnField);

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
                } catch (e) {
                    console.error("Erro ao analisar UIConfig:", e);
                }
            }

            // Resolve a promise para que addColunasByModelo possa chamar addColumn com segurança
            if (mrendThis._tableBuiltResolve) {
                mrendThis._tableBuiltResolve();
                mrendThis._tableBuiltResolve = null;
            }

            // Redraw enquanto zoom=1 para que fitColumns meça a largura real do container.
            // As colunas ficam definidas em px naturais. O zoom CSS aplicado a seguir
            // escala-as proporcionalmente — preenchendo sempre a largura visual como
            // uma tabela Bootstrap independentemente do nível de zoom.
            mrendThis.GTable.redraw(true);

            // Aplicar zoom APÓS o redraw para não influenciar a medição das colunas
            $(mrendThis.containerToRender).css("zoom", currentScale);
            $(mrendThis.containerToRender).attr("data-zoom-scale", currentScale);

            mrendThis.applyTabulatorStylesWithJquery(mrendThis);

            var cells = JSON.parse(JSON.stringify(mrendThis.GCellObjectsConfig));

            mrendThis.reactiveData = PetiteVue.reactive({
                global: mrendThis,
                cells: cells
            });
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


        mrendThis._styleInterval = setInterval(function () {
            if (mrendThis.GTable) {
                mrendThis.applyTabulatorStylesWithJquery(mrendThis);
            }
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

        // codigosProcessados evita processar o mesmo template duas vezes (dedup por codigo)
        var codigosProcessados = {};

        linhasToRender.forEach(function (linhaToRender) {

            var codigoLinhaToRender = String(linhaToRender && linhaToRender.codigo != null ? linhaToRender.codigo : "").trim();

            // Pular se este código já foi processado (evita duplicação)
            if (codigosProcessados[codigoLinhaToRender]) {
                return;
            }
            codigosProcessados[codigoLinhaToRender] = true;

            var recordData = records.find(function (record) {

                var codigoLinhaRecord = String(record && record.codigolinha != null ? record.codigolinha : "").trim();
                return codigoLinhaRecord === codigoLinhaToRender || codigoLinhaRecord.indexOf(codigoLinhaToRender + "___") !== -1
            });

            //console.log(("linhasToRender", linhasToRender, recordData)

            if (recordData) {

                var linhaRecords = records.filter(function (record) {
                    var codigoLinhaRecord = String(record && record.codigolinha != null ? record.codigolinha : "").trim();
                    return codigoLinhaRecord === codigoLinhaToRender || codigoLinhaRecord.indexOf(codigoLinhaToRender + "___") !== -1
                }
                );

                var distinctRowIds = _.uniqBy(linhaRecords, "rowid");

                distinctRowIds.sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });


                // Recursão por dados EAV: adiciona pai + filhos + filhos dos filhos a qualquer profundidade.
                // visitados evita loops infinitos em caso de referências circulares na BD.
                var visitados = {};
                function addLinhaRecursivo(distinctRow, linhaConfig, allRecords) {
                    var rowidStr = String(distinctRow.rowid).trim();
                    if (visitados[rowidStr]) return;
                    visitados[rowidStr] = true;

                    var celulasRow = allRecords.filter(function (rec) {
                        return String(rec && rec.rowid != null ? rec.rowid : "").trim() === rowidStr;
                    });

                    var filhasDesteRow = allRecords.filter(function (rec) {
                        return rec.linkid && rec.linkid.trim() === rowidStr;
                    });

                    addLinha(distinctRow, celulasRow, linhaConfig, renderedLinhas, filhasDesteRow.length > 0, true, false);

                    var distinctFilhas = _.uniqBy(filhasDesteRow, "rowid");
                    distinctFilhas.sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });

                    distinctFilhas.forEach(function (filha) {
                        var configFilhaClone = resolveFilhaConfig(linhaConfig, filha);
                        if (!configFilhaClone) configFilhaClone = JSON.parse(JSON.stringify(linhaConfig));
                        addLinhaRecursivo(filha, configFilhaClone, allRecords);
                    });
                }

                distinctRowIds.forEach(function (distinctRow) {
                    // Pular rows que são FILHAS (têm linkid) — serão adicionadas pela recursão do PAI.
                    if (distinctRow.linkid && String(distinctRow.linkid).trim() !== "") {
                        return;
                    }
                    addLinhaRecursivo(distinctRow, linhaToRender, records);
                });


            }
            else {
                var isFilhaRendered = mrendThis.GTMPFilhas.find(function (filha) {

                    var codigoFilha = String(filha && filha.codigo != null ? filha.codigo : "").trim();
                    return codigoFilha === codigoLinhaToRender;
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




        attachLineTotalRows();

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
            // CENTRAL: usa resolveFilhaConfig (mesma função do add manual e refresh).
            // Passa um pseudo-record para que a função saiba qual template usar quando há vários filhos.
            var linhaFilhaConfig = resolveFilhaConfig(linhaPai, { codigolinha: linhaFilha.codigo });
            if (!linhaFilhaConfig) linhaFilhaConfig = JSON.parse(JSON.stringify(linhaFilha));

            var rowidFilha = generateUUID();
            var dstRowFilha = {
                rowid: rowidFilha,
                linkid: rowidPai,
                codigolinha: linhaFilhaConfig.codigo,
            };

            addLinha(dstRowFilha, [], linhaFilhaConfig, renderedLinhas, true, linhaFilhaConfig.modelo != true, novoRegisto);
            mrendThis.GTMPFilhas.push(linhaFilhaConfig);
            processFilhasRecursivo(linhaFilhaConfig, rowidFilha, renderedLinhas, novoRegisto);


        });
    }


    function addLinha(distinctRow, linhaRecords, linhModelo, renderedLinhas, isParent, renderCelula, novoRegisto) {

        // Verificar no array LOCAL (renderedLinhas) em vez do global (mrendThis.GRenderedLinhas)
        // para evitar duplicação durante refresh (o global ainda tem dados antigos durante o build)
        var linhaAdicionada = renderedLinhas.find(function (linha) {
            return linha.rowid == distinctRow.rowid
        });
        if (linhaAdicionada) {
            return;
        }

        // Initialize UIObject with all column fields using centralized utility
        var UIObject = createUIObjectWithColumns(distinctRow.rowid);

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

        // Limpar array global ANTES de processar para evitar acumulação em refresh
        mrendThis.GRenderedLinhas = [];

        mrendThis.GRenderedColunas = setColunasRender(mrendThis.reportConfig.config.colunas, records);

        var renderedLinhas = getRenderedLinhas(records);

        mrendThis.GRenderedLinhas = renderedLinhas;

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

                    console.log("Comparing source stamps...", { stampAtual: stampAtual, stampArmazenado: stampArmazenado });
                    if (stampAtual === stampArmazenado) {
                        mrendThis.records = result.data || [];
                        return resolve({ refetchDb: false, records: result.data || [] });
                    }

                    storeDataSourceStamp(mrendThis.recordData.stamp);

                    //console.log(("Source stamp updated or local DB empty, refetching data...", mrendThis.recordData.stamp, stampArmazenado);

                    if (mrendThis.remoteFetch === true) {

                        return getDataFromRemote()
                            .then(function (remoteData) {
                                console.log("Remote data fetched successfully.........", remoteData);
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
                    return deleteAllRecords(mrendThis.tableSourceName).then(function (data) {
                        var dbConverstion = ConvertDbTableToMrendObject(mrendThis.records, mrendThis.dbTableToMrendObject);
                        mrendThis.records = dbConverstion;
                        return addBulkData(mrendThis.db, mrendThis.tableSourceName, dbConverstion).then(function () {
                            // Re-aplicar edições pendentes que existiam antes do overwrite
                            return _applyPendingEdits().then(function () {
                                // Ler de volta o Dexie com os valores corrigidos
                                return mrendThis.db[mrendThis.tableSourceName].toArray().then(function (mergedRecords) {
                                    mrendThis.records = mergedRecords;
                                    return resolve(result);
                                });
                            });
                        });
                    });
                }
                return resolve(result)
            })
        });
    }
    this.isSourceStampValid = function (currentStamp) {
        var stored = getSourceStamp();
        var current = String(currentStamp != null ? currentStamp : "").trim();
        return current !== "" && current === stored;
    }

    this.clearSourceStamp = function () {

        localStorage.removeItem("sourcestamp_" + mrendThis.dbTableToMrendObject.dbName + "_" + mrendThis.tableSourceName);

    }

    this.clearAllSources = function () {

        var keysToRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf("sourcestamp_") === 0) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(function (key) {
            localStorage.removeItem(key);
        });

    }

    // Chamar após gravar com sucesso no servidor para limpar edições pendentes
    this.clearPendingEdits = function () {
        _clearPendingEdits();
    }


    function addLinhaByModelo(modelo, record) {


        var linhaModelo = mrendThis.reportConfig.config.linhas.find(function (linha) {

            return linha.codigo == modelo
        });

        var rowid = generateUUID();
        if (Object.keys(record || {}).length > 0) {

            rowid = record.rowid || generateUUID();
        }

        var renderedLinha
        if (linhaModelo) {

            var codigo = linhaModelo.codigo + "___" + generateTimestampNumber(10);
            var ordem = generateLinhaOrdem();

            var records = [];
            var UIObject;

            if (Object.keys(record || {}).length > 0) {
                records.push(record);
                UIObject = record;
            } else {
                // Initialize UIObject with all column fields using centralized utility
                UIObject = createUIObjectWithColumns(rowid);
            }

            renderedLinha = new RenderedLinha({ UIObject: UIObject, ordem: ordem, codigo: codigo, novoregisto: true, rowid: rowid, linkid: "", parentid: "", config: linhaModelo })


            var dbConverstion = ConvertDbTableToMrendObject(records, mrendThis.dbTableToMrendObject);

            renderedLinha.addToLocalRenderedLinhasList(dbConverstion, { rowid: rowid }, {}, true, true);

            mrendThis.GNewRecords = dbConverstion.concat(mrendThis.GNewRecords);



        }

        addNewRecords();


        return renderedLinha;


    }
    function generateTableButtons() {

        if (!mrendThis.enableEdit) {
            return;
        }

        // Limpa divs de botões existentes para evitar duplicação em re-renders
        var tableButtonsId = "tableButtons" + mrendThis.table;
        $("#" + tableButtonsId).remove();
        var tableButtonsColId = "tableButtonsCol" + mrendThis.table;
        $("#" + tableButtonsColId).remove();

        var tableButtons = $("<div id='" + tableButtonsId + "' style='margin-top:0.6em;display:flex;flex-wrap:wrap;gap:0.4em;' class='tableButtons'></div>");
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



                var linhaByModeloResult = addLinhaByModelo(modelo, {});

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

            var tableButtonsCol = $("<div id='" + tableButtonsColId + "' style='margin-bottom:0.6em;display:flex;flex-wrap:wrap;gap:0.4em;' class='tableButtonsCol'></div>");
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
        // Limpa chips legados (se existirem); a remoção passa a ser só no cabeçalho.
        mrendThis.renderRemovableColunaButtons();
    }

    // Remoção de colunas dinâmicas (modelo + "___"):
    // - NUNCA cria chips por cima da grelha
    // - lata de lixo no titleFormatter do cabeçalho (ver addTabulatorColumns)
    // Esta função só remove wraps/chips antigos do DOM.
    this.renderRemovableColunaButtons = function () {
        $("#tableButtonsColRemovable" + mrendThis.table).remove();
        $(".tableButtonsColRemovable").remove();
        $(mrendThis.containerToRender).siblings(".tableButtonsColRemovable").remove();
        $("[data-remove-coluna]").closest(".tableButtonsColRemovable, .btn-default.btn-sm").each(function () {
            var $el = $(this);
            if ($el.hasClass("tableButtonsColRemovable") || $el.parent().hasClass("tableButtonsColRemovable")) {
                $el.remove();
            }
        });
        // Remover chips avulsos (legado) imediatamente antes do container da grelha
        $(mrendThis.containerToRender).prevAll().filter(function () {
            return $(this).hasClass("tableButtonsColRemovable")
                || ($(this).find && $(this).find("[data-remove-coluna]").length > 0);
        }).remove();
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

        var ordemColuna = generateColunaOrdem();
        var colunaToRender = new RenderedColuna({
            codigocoluna: (colConfig.codigocoluna || "").trim() + "___" + generateTimestampNumber(10),
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
            // Recalcular no clique: cada "Adicionar" incrementa face às colunas já existentes.
            newColuna.ordem = generateColunaOrdem();

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
            mrendThis.applyTabulatorStylesWithJquery(mrendThis);
            mrendThis.renderRemovableColunaButtons();
        });
    }
    this.addColunasByModelo = function (colunas) {

        var doAdd = function () {

            var lastRendered = ""

            colunas.forEach(function (coluna) {

                // Garantir ordem incremental em cada coluna adicionada no lote.
                if (!resolveOrdemColunaValue(coluna)) {
                    coluna.ordem = generateColunaOrdem();
                }

                // "config.modelo" indica que o TIPO de linha suporta "Adicionar Linha" (propriedade
                // do tipo, não da instância) — a generalidade das linhas reais tem config.modelo=true,
                // pelo que filtrar por esse campo excluía (por engano) todas as linhas e nenhuma célula
                // era criada para a nova coluna. O único registo a excluir é o stub inicial vazio
                // (this.GRenderedLinhas = [new RenderedLinha({})]), que não tem rowid.
                var renderedLinhas = mrendThis.GRenderedLinhas.filter(function (linha) {

                    return !!linha.rowid;
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

            var grupoColunaItemsCfg = (mrendThis.reportConfig && mrendThis.reportConfig.config && mrendThis.reportConfig.config.grupocolunaItems) || [];
            var grupoColunasCfg = (mrendThis.reportConfig && mrendThis.reportConfig.config && mrendThis.reportConfig.config.grupocolunas) || [];
            var colunasCfg = (mrendThis.reportConfig && mrendThis.reportConfig.config && mrendThis.reportConfig.config.colunas) || [];

            function getGrupoStampByColunaStamp(colunaStamp) {
                var item = grupoColunaItemsCfg.find(function (it) {
                    return it.colunastamp === colunaStamp;
                });
                return item ? item.grupocolunastamp : "";
            }

            function getGrupoStampByField(field) {
                if (!field) {
                    return "";
                }

                if (field.indexOf("_placeholder_") === 0) {
                    return field.replace("_placeholder_", "");
                }

                var rendered = mrendThis.GRenderedColunas.find(function (rc) {
                    return rc.codigocoluna === field;
                });
                if (rendered && rendered.config && rendered.config.colunastamp) {
                    return getGrupoStampByColunaStamp(rendered.config.colunastamp);
                }

                var cfg = colunasCfg.find(function (c) {
                    return c.codigocoluna === field;
                });
                if (cfg && cfg.colunastamp) {
                    return getGrupoStampByColunaStamp(cfg.colunastamp);
                }

                return "";
            }

            function getOrderByField(field) {
                if (!field) {
                    return 999999;
                }

                if (field.indexOf("_placeholder_") === 0) {
                    return 999999;
                }

                var rendered = mrendThis.GRenderedColunas.find(function (rc) {
                    return rc.codigocoluna === field;
                });

                if (rendered && rendered.config && rendered.config.colunastamp) {
                    var item = grupoColunaItemsCfg.find(function (it) {
                        return it.colunastamp === rendered.config.colunastamp;
                    });
                    if (item) {
                        return item.ordem || 0;
                    }

                    return rendered.ordem || 0;
                }

                var cfg = colunasCfg.find(function (c) {
                    return c.codigocoluna === field;
                });
                if (cfg) {
                    var itemCfg = grupoColunaItemsCfg.find(function (it) {
                        return it.colunastamp === cfg.colunastamp;
                    });
                    if (itemCfg) {
                        return itemCfg.ordem || 0;
                    }

                    return cfg.ordem || 0;
                }

                return 999999;
            }

            function findGroupDefinition(definitions, grupoStamp) {
                var found = null;

                function walk(defs) {
                    if (!Array.isArray(defs) || found) {
                        return;
                    }

                    defs.forEach(function (def) {
                        if (found || !def || !Array.isArray(def.columns)) {
                            return;
                        }

                        var isTarget = def.columns.some(function (sub) {
                            return getGrupoStampByField(sub && sub.field) === grupoStamp;
                        });

                        if (isTarget) {
                            found = def;
                            return;
                        }

                        walk(def.columns);
                    });
                }

                walk(definitions);
                return found;
            }

            function getGrupoSortedItems(grupoStamp) {
                return grupoColunaItemsCfg
                    .filter(function (it) {
                        return it.grupocolunastamp === grupoStamp;
                    })
                    .sort(function (a, b) {
                        return (a.ordem || 0) - (b.ordem || 0);
                    });
            }

            function getRenderedFieldsForItem(item) {
                var colunaBaseCfg = colunasCfg.find(function (cfg) {
                    return cfg.colunastamp === item.colunastamp;
                });

                if (!colunaBaseCfg) {
                    return [];
                }

                if (colunaBaseCfg.modelo === true) {
                    var prefix = (colunaBaseCfg.codigocoluna || "").trim() + "___";
                    return mrendThis.GRenderedColunas
                        .filter(function (rc) {
                            var isPrefixedInstance = (rc.codigocoluna || "").indexOf(prefix) === 0;
                            var isSameModelStamp = rc.config && rc.config.colunastamp === colunaBaseCfg.colunastamp;
                            return (isPrefixedInstance || isSameModelStamp) && mrendThis.GTable.getColumn(rc.codigocoluna);
                        })
                        .sort(function (a, b) {
                            return (a.ordem || 0) - (b.ordem || 0);
                        })
                        .map(function (rc) {
                            return rc.codigocoluna;
                        });
                }

                var field = (colunaBaseCfg.codigocoluna || "").trim();
                return mrendThis.GTable.getColumn(field) ? [field] : [];
            }

            function getAnchorForGroup(grupoStamp, colunaOrdem) {
                var itemDefs = getGrupoSortedItems(grupoStamp);
                var orderedFields = [];

                itemDefs.forEach(function (itemDef) {
                    var fields = getRenderedFieldsForItem(itemDef);
                    fields.forEach(function (f) {
                        orderedFields.push({ field: f, ordem: itemDef.ordem || 0 });
                    });
                });

                var placeholderField = "_placeholder_" + grupoStamp;
                var hasPlaceholder = !!mrendThis.GTable.getColumn(placeholderField);

                if (orderedFields.length === 0 && hasPlaceholder) {
                    return { field: placeholderField, before: true, removePlaceholder: true };
                }

                if (orderedFields.length === 0) {
                    return null;
                }

                var prev = null;
                var next = null;
                orderedFields.forEach(function (entry) {
                    if (entry.ordem <= (colunaOrdem || 0)) {
                        prev = entry;
                    }
                    if (!next && entry.ordem > (colunaOrdem || 0)) {
                        next = entry;
                    }
                });

                if (prev) {
                    return { field: prev.field, before: false, removePlaceholder: hasPlaceholder };
                }
                if (next) {
                    return { field: next.field, before: true, removePlaceholder: hasPlaceholder };
                }

                return { field: orderedFields[orderedFields.length - 1].field, before: false, removePlaceholder: hasPlaceholder };
            }

            var currentDefinitions = mrendThis.GTable.getColumnDefinitions();

            columns.forEach(function (col) {
                var renderedColuna = colunas.find(function (rc) {
                    return rc.codigocoluna === col.field;
                });
                var colunaStamp = renderedColuna && renderedColuna.config ? renderedColuna.config.colunastamp : "";
                var grupoStamp = colunaStamp ? getGrupoStampByColunaStamp(colunaStamp) : "";

                if (!grupoStamp) {
                    currentDefinitions.push(col);
                    return;
                }

                var groupDef = findGroupDefinition(currentDefinitions, grupoStamp);

                if (!groupDef) {
                    var grupoCfg = grupoColunasCfg.find(function (g) {
                        return g.grupocolunastamp === grupoStamp;
                    });

                    groupDef = {
                        title: grupoCfg ? grupoCfg.descgrupo : "",
                        frozen: grupoCfg ? grupoCfg.fixa : false,
                        columns: []
                    };

                    currentDefinitions.push(groupDef);
                }

                if (!Array.isArray(groupDef.columns)) {
                    groupDef.columns = [];
                }

                groupDef.columns = groupDef.columns.filter(function (sub) {
                    return !(sub && sub.field && sub.field === "_placeholder_" + grupoStamp);
                });

                var newOrder = getOrderByField(col.field);
                var insertAt = groupDef.columns.findIndex(function (sub) {
                    return getOrderByField(sub && sub.field) > newOrder;
                });

                if (insertAt === -1) {
                    groupDef.columns.push(col);
                } else {
                    groupDef.columns.splice(insertAt, 0, col);
                }
            });

            mrendThis.GTable.setColumns(currentDefinitions);

            attachLineTotalRows();

            var refreshedGridData = [];
            mrendThis.GRenderedLinhas.forEach(function (lin) {
                var hasCell = mrendThis.GCellObjectsConfig.find(function (cellObj) {
                    return cellObj.rowid && lin.rowid && cellObj.rowid.trim() == lin.rowid.trim();
                });
                if (!String(lin.linkid || "").trim().replaceAll(" ", "") && hasCell) {
                    refreshedGridData.push(lin.UIObject);
                }
            });
            mrendThis.GGridData = refreshedGridData;
            mrendThis.GTable.replaceData(refreshedGridData);
            mrendThis.GTable.redraw(true);

            var colunasSetFim = mrendThis.GRenderedColunas.filter(function (coluna) {

                return coluna.config.setfim == true;
            });

            colunasSetFim.sort(function (a, b) {
                return (b.ordem || 0) - (a.ordem || 0);
            });

            // //console.log(("colunasSetFim", colunasSetFim)
            colunasSetFim.forEach(function (coluna) {

                var grupoStampColuna = "";
                if (coluna && coluna.config && coluna.config.colunastamp) {
                    grupoStampColuna = getGrupoStampByColunaStamp(coluna.config.colunastamp);
                }

                // Colunas de grupo não devem ser movidas globalmente para evitar
                // sair do respetivo group header.
                if (grupoStampColuna) {
                    return;
                }

                var columnExists = mrendThis.GTable.getColumn(lastRendered.trim())
                if (columnExists) {

                    mrendThis.GTable.moveColumn(coluna.codigocoluna.trim(), lastRendered.trim(), true);
                }

            })



            mrendThis.applyTabulatorStylesWithJquery(mrendThis);
            mrendThis.renderRemovableColunaButtons();

        }; // end doAdd

        if (mrendThis._tableBuiltPromise) {
            mrendThis._tableBuiltPromise.then(doAdd);
        } else {
            doAdd();
        }
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

    this.updateTableRowColumnValue = function (rowid, coluna, value) {

        console.log("Updating row:", rowid, "column:", coluna, "with value:", value);


    }


    function loadAssetsPromiseAll() {
        var scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.3/dexie.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
            // 'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js',
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
        // Tabulator container — ocupa 100% do container pai (comportamento Bootstrap).
        $(".tabulator").css({
            "background-color": "white",
            "border-radius": "10px",
            "box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
            "border": "none",
            "width": "100%"
        });

        // Header — base
        var headerBg = customStyles.headerBackground ? customStyles.headerBackground : getColorByType("primary").background;

        $(".tabulator .tabulator-header").css({
            "background-color": headerBg,
            "border-bottom": "none",
            "border-radius": "10px 10px 0 0",
            "padding": "0px",
            "font-size": "14px",
            "font-family": "Nunito, sans-serif",
            "font-weight": "bold",
        });

        // Todas as colunas (base comum)
        $(".tabulator .tabulator-header .tabulator-col").css({
            "background-color": headerBg,
            "color": "white",
            "border-right": "1px solid rgba(255, 255, 255, 0.2)",
            "font-weight": "500",
            "box-sizing": "border-box",
        });

        // Col-content das colunas simples (sem grupo): padding normal
        $(".tabulator .tabulator-header .tabulator-col:not(.tabulator-col-group) > .tabulator-col-content").css({
            "padding": "10px 10px",
            "display": "flex",
            "align-items": "center",
            "min-height": "38px",
        });

        // ── Column GROUPS — injectado via <style> para sobrepor height inline do Tabulator ──
        var existingGroupStyle = document.getElementById("mrend-colgroup-styles");
        if (existingGroupStyle) existingGroupStyle.remove();
        var groupStyle = document.createElement("style");
        groupStyle.id = "mrend-colgroup-styles";
        groupStyle.innerHTML = [
            ".tabulator .tabulator-header .tabulator-col-group { overflow: visible !important; }",
            ".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content { height: 30px !important; min-height: 30px !important; overflow: visible !important; padding: 0 10px !important; border-bottom: 1px solid rgba(255,255,255,0.25) !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: center !important; }",
            ".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content .tabulator-col-title { font-size: 12px !important; font-weight: 700 !important; letter-spacing: 0.8px !important; text-transform: none !important; white-space: nowrap !important; color: white !important; }",
            ".tabulator .tabulator-header .tabulator-col-group-cols { overflow: visible !important; }",
            ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col { overflow: visible !important; }",
            ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col > .tabulator-col-content { height: 42px !important; min-height: 42px !important; padding: 16px 10px 6px 10px !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; overflow: visible !important; }",
            ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col .tabulator-col-title { font-size: 12px !important; font-weight: 500 !important; white-space: nowrap !important; color: rgba(255,255,255,0.95) !important; line-height: 1.4 !important; align-self: center !important; }",
        ].join("\n");
        document.head.appendChild(groupStyle);
        // ─────────────────────────────────────────────────────────────

        $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
        $(".tabulator .tabulator-header .tabulator-col:last-child").css({
            "border-top-right-radius": "10px",
            "border-right": "none"
        });

        // Rows
        $(".tabulator-row").css({
            "border-bottom": "0px solid #e0e6ed",
            "transition": "background-color 0.2s ease",
            "min-height": "48px",
            "height": "auto",
            "overflow": "visible"
        });

        $(".tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid red");
        $(".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid #0000");

        // Cells
        $(".tabulator-cell").css({
            "padding": "12px 15px",
            "border-right": "none",
            "height": "auto",
            "overflow": "visible"
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
            "height": "18px",
            "justify-content": "center",
            "margin-right": "5px",
            "overflow": "visible",
            "vertical-align": "middle",
            "width": "18px"
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
        /*  return loadAssetsPromiseAll().then(function () {
  
  
            
          });*/

        return InitDB(mrendThis.dbTableToMrendObject.dbName, mrendThis.schemas).then(function (initDBResult) {
            if (mrendThis.resetSourceStamp) {
                mrendThis.clearSourceStamp();
            }
            return handleReportRecords().then(function (reportRecordResult) {
                return reconcileEavRecords(mrendThis.records).then(function (records) {
                    mrendThis.records = records;
                    return RenderHandler(records);
                });
            })
        });
    }

    this.getDbData = function () {

        return new Promise(function (resolve, reject) {
            mrendThis.db[mrendThis.tableSourceName].toArray().then(function (records) {

                var avCritRecords = records.filter(function (r) { return r.sourceTable === "u_avcrit"; });
                console.log("getDbData u_avcrit records:", avCritRecords);

                var recordsConverted = ConvertMrendObjectToTable(records)


                return resolve(recordsConverted);
            }).catch(function (error) {
                console.error("Erro ao obter dados do banco:", error);
                return reject(error);
            })

        });

    }

    this.getDbDataToSchema = function () {

        return new Promise(function (resolve, reject) {
            mrendThis.db[mrendThis.tableSourceName].toArray().then(function (records) {

                var mrendInternalKeys = Object.keys(new MrendObject({}));
                var distinctSources = getDistinctWithKeys(records, "sourceTable");
                var sources = [];

                distinctSources.forEach(function (source) {

                    var sourceRecords = records.filter(function (r) {
                        return r.sourceTable === source.sourceTable;
                    });

                    var distinctRows = getDistinctWithKeys(sourceRecords, "rowid");
                    var tableData = [];

                    distinctRows.forEach(function (row) {

                        var rowCells = sourceRecords.filter(function (cell) {
                            return cell.rowid === row.rowid;
                        });

                        var tableRow = {};
                        tableRow[source.sourceKey] = row.sourceKeyValue;

                        rowCells.forEach(function (cell) {
                            var val = cell[cell.campo];
                            tableRow[cell.coluna] = val !== undefined ? val : "";
                        });

                        // Incluir campos extra que não sejam campos internos do MrendObject
                        var firstCell = rowCells[0] || {};
                        Object.keys(firstCell).forEach(function (key) {
                            if (mrendInternalKeys.indexOf(key) === -1 && tableRow[key] === undefined) {
                                tableRow[key] = firstCell[key];
                            }
                        });

                        tableData.push(tableRow);
                    });

                    sources.push({
                        sourceTable: source.sourceTable,
                        sourceKey: source.sourceKey,
                        records: tableData
                    });
                });

                return resolve(sources);

            }).catch(function (error) {
                console.error("Erro ao obter dados do schema:", error);
                return reject(error);
            });
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
        //'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js',
        'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js',
        'https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js',
        //'https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS',
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
    cssContent += "    min-height: 48px!important;";
    cssContent += "    height: auto!important;";
    cssContent += "    overflow: visible!important;";
    cssContent += "}";

    cssContent += ".tabulator .tabulator-col-resize-handle:hover {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"

    cssContent += ".tabulator .tabulator-col-resize-handle:hover {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"
    cssContent += ".tabulator-col:hover .tabulator-col-resize-handle {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"
    cssContent += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"

    /* cssContent += ".tabulator-cell:hover ~ .tabulator-col-resize-handle {"
     cssContent += "border:6px solid " + getColorByType("primary").background + "!important;"
     cssContent += "}"*/
    cssContent += ".tabulator-cell:hover + .tabulator-col-resize-handle {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"
    cssContent += ".tabulator-cell:hover .tabulator-col-resize-handle {"
    cssContent += "border:9px solid " + getColorByType("primary").background + "!important;border-radius:8px"
    cssContent += "}"

    cssContent += ".tabulator-cell input[type='checkbox'] {";
    cssContent + " -webkit-appearance: none!important;"
    cssContent += "border: 1px solid " + getColorByType("primary").background + "!important;";
    cssContent += "accent-color: " + getColorByType("warning").background + "!important;";
    cssContent += "transform: scale(1.7)!important;";
    cssContent += "}";
    cssContent += ".tabulator-data-tree-control{ "
    cssContent += "width:20px!important;"
    cssContent += "height:20px!important;"
    cssContent += "}"
    cssContent += ".tabulator-row .tabulator-cell .tabulator-data-tree-control .tabulator-data-tree-control-collapse:after{"
    cssContent += "font-size:16px!important;"
    cssContent += "color:#3f5670!important;";
    cssContent += "}"

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
        //{ type: 'script', src: 'https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js' },
        { type: 'script', src: 'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js' },
        { type: 'link', href: 'https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css', rel: 'stylesheet' },
        { type: 'script', src: 'https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js' },
        // { type: 'script', src: 'https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS' },
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

    // Header — base
    var headerBg = customStyles.headerBackground ? customStyles.headerBackground : "#0765b7";

    $(".tabulator .tabulator-header").css({
        "background-color": headerBg,
        "border-bottom": "none",
        "border-radius": "10px 10px 0 0",
        "padding": "0px",
        "font-size": "14px",
        "font-family": "Nunito, sans-serif",
        "font-weight": "bold",
    });

    // Todas as colunas (base comum)
    $(".tabulator .tabulator-header .tabulator-col").css({
        "background-color": headerBg,
        "color": "white",
        "border-right": "1px solid rgba(255, 255, 255, 0.2)",
        "font-weight": "500",
        "box-sizing": "border-box",
    });

    // Col-content das colunas simples (sem grupo): padding normal
    $(".tabulator .tabulator-header .tabulator-col:not(.tabulator-col-group) > .tabulator-col-content").css({
        "padding": "10px 10px",
        "display": "flex",
        "align-items": "center",
        "min-height": "38px",
    });

    // ── Column GROUPS ────────────────────────────────────────────
    // Título do grupo (linha de cima)
    $(".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content").css({
        "padding": "7px 10px 5px",
        "min-height": "34px",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "border-bottom": "1px solid rgba(255,255,255,0.35)",
    });
    $(".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content .tabulator-col-title").css({
        "text-align": "center",
        "font-size": "12px",
        "font-weight": "700",
        "letter-spacing": "0.5px",
        "text-transform": "none",
        "white-space": "nowrap",
        "color": "white",
    });

    // ── Column GROUPS — injectado via <style> para sobrepor height inline do Tabulator ──
    var existingGroupStyle2 = document.getElementById("mrend-colgroup-styles");
    if (existingGroupStyle2) existingGroupStyle2.remove();
    var groupStyle2 = document.createElement("style");
    groupStyle2.id = "mrend-colgroup-styles";
    groupStyle2.innerHTML = [
        ".tabulator .tabulator-header .tabulator-col-group { overflow: visible !important; }",
        ".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content { height: 30px !important; min-height: 30px !important; overflow: visible !important; padding: 0 10px !important; border-bottom: 1px solid rgba(255,255,255,0.25) !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: center !important; }",
        ".tabulator .tabulator-header .tabulator-col-group > .tabulator-col-content .tabulator-col-title { font-size: 12px !important; font-weight: 700 !important; letter-spacing: 0.8px !important; text-transform: none !important; white-space: nowrap !important; color: white !important; }",
        ".tabulator .tabulator-header .tabulator-col-group-cols { overflow: visible !important; }",
        ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col { overflow: visible !important; }",
        ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col > .tabulator-col-content { height: 42px !important; min-height: 42px !important; padding: 16px 10px 6px 10px !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; overflow: visible !important; }",
        ".tabulator .tabulator-header .tabulator-col-group-cols .tabulator-col .tabulator-col-title { font-size: 12px !important; font-weight: 500 !important; white-space: nowrap !important; color: rgba(255,255,255,0.95) !important; line-height: 1.4 !important; align-self: center !important; }",
    ].join("\n");
    document.head.appendChild(groupStyle2);
    // ─────────────────────────────────────────────────────────────

    $(".tabulator .tabulator-header .tabulator-col:first-child").css("border-top-left-radius", "10px");
    $(".tabulator .tabulator-header .tabulator-col:last-child").css({
        "border-top-right-radius": "10px",
        "border-right": "none"
    });

    // Rows
    $(".tabulator-row").css({
        "border-bottom": "1px solid #e0e6ed",
        "transition": "background-color 0.2s ease",
        "min-height": "48px",
        "height": "auto",
        "overflow": "visible"
    });
    // $(".tabulator-row.tabulator-row-even").css("background-color", "#fcfdfe");
    /* $(".tabulator-row").hover(
        function () { $(this).css("background-color", "#f5f9ff"); },
        function () { $(this).css("background-color", ""); }
    ); */
    $(".tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid red");
    $(".tabulator-row .tabulator-cell.tabulator-frozen.tabulator-frozen-right").css("border-left", "0px solid #0000");


    // Cells
    $(".tabulator-cell").css({
        "padding": "12px 15px",
        "border-right": "none",
        "height": "auto",
        "overflow": "visible"
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
        "height": "18px",
        "justify-content": "center",
        "margin-right": "5px",
        "overflow": "visible",
        "vertical-align": "middle",
        "width": "18px"
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
    this.linkCodigo = data.linkCodigo || "";
    this.linkCodigoField = data.linkCodigoField || "";
    this.descLink = data.descLink || "";
    this.descLinkField = data.descLinkField || "";
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
    // Aceita ordemColuna (API) e ordemcoluna (campo físico / Dexie).
    this.ordemColuna = (data.ordemColuna != null && data.ordemColuna !== "")
        ? data.ordemColuna
        : (data.ordemcoluna || 0);
    this.ordemcoluna = (data.ordemcoluna != null && data.ordemcoluna !== "")
        ? data.ordemcoluna
        : this.ordemColuna;
    this.descColuna = data.descColuna || "";
    this.ordem = data.ordem || 0;

}

function getMrendSchema(tableSourceName) {

    var schema = new MrendObject({});

    return { datasourceName: "MrendDb", tableSourceName: tableSourceName, tableSourceSchema: schema }

}



var GMRENDAVALIACOESCOT = null;
var GREQUISICOES = [];

// ============================================================
// Wrapper: addLinhaComRegistos + restaurar valores dinâmicos
// buildDefaultCelula (MRend.js) sobreescreve UIObject[dynamicKey]
// com "" para colunas dinâmicas (porque não encontra record).
// Este wrapper guarda e restaura esses valores.
// ============================================================
function addLinhaPreservandoDinamicas(modelo, UIObject) {
    var savedDynamic = {};
    Object.keys(UIObject).forEach(function (key) {
        if (key.indexOf("___") !== -1) {
            savedDynamic[key] = UIObject[key];
        }
    });

    GMRENDAVALIACOESCOT.addLinhaComRegistos(modelo, UIObject);

    // Restaurar valores dinâmicos sobreescritos por buildDefaultCelula
    Object.keys(savedDynamic).forEach(function (key) {
        UIObject[key] = savedDynamic[key];
    });
}

// ============================================================
// Registar hook para persistir edições de células no Dexie
// (MRend só persiste em memória via updateCellObjectConfig)
// ============================================================
function registarPersistenciaCelulas() {
    if (!GMRENDAVALIACOESCOT || !GMRENDAVALIACOESCOT.GTable) return;

    GMRENDAVALIACOESCOT.GTable.on("cellEdited", function (cell) {
        var field = cell.getField();
        var rowData = cell.getRow().getData();
        var rowid = String(rowData.rowid || "");
        var newValue = cell.getValue();

        if (!GMRENDAVALIACOESCOT.db || !GMRENDAVALIACOESCOT.tableSourceName) return;

        GMRENDAVALIACOESCOT.db[GMRENDAVALIACOESCOT.tableSourceName]
            .where("rowid").equals(rowid)
            .filter(function (rec) { return rec.coluna === field; })
            .first()
            .then(function (rec) {
                if (rec) {
                    rec[rec.campo] = newValue;
                    rec.valor = newValue;
                    return GMRENDAVALIACOESCOT.db[GMRENDAVALIACOESCOT.tableSourceName].put(rec);
                }
            })
            .catch(function (err) {
                console.warn("registarPersistenciaCelulas: erro ao persistir edição", err);
            });
    });
}

function getRecordStamp() {
    var stamp = "";

    return $("#bodata").data("bostamp") || "";
}
function initGrelhaAvaliacaoCotacoes() {

    if (!isDocType(43)) {
        return;
    }

    $("#u_avcrit").hide();
    var divExtraConfig = "<div id='mrend-report-container'></div>";
    $("#campos > .row:last").after("<div style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'>" + divExtraConfig + "</div>");
    // $("#dataArea").before("<div style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'>" + divExtraConfig + "</div>");


    inicializarMrendBycodigo({
        codigo: "Avaliação da cotação",
        relatorioTable: "",
        relatorioTableKey: "",
        relatorioTableFilterField: "",
        containerToRender: "#mrend-report-container",
        onSuccess: function (mrend) {
            //console.log("Mrend inicializado", mrend);
            GMRENDAVALIACOESCOT = mrend;

            if (getState() == "consultar") {
                try {
                    renderAvaliacaoConsulta();
                } catch (error) {
                    console.log("Erro ao renderizar avaliação em modo consulta", error);
                }
            } else {
                try {

                    if (getState() == "editar" && getRecordStamp()) {
                        renderAvaliacaoEdicao();
                    } else {
                        var cotacoes = getRequisicoesByCotacao($("#ctl00_conteudo_u_requis_u_requismBox1").val());
                        handleColunasFornecedores(cotacoes);
                        handleLinhasCotacoes(cotacoes);
                        handleColunasCriterios();
                        registerClickGravarRelatorio();
                    }

                } catch (error) {
                    console.log("Erro ao processar cotações e critérios", error);
                }
            }

            // Registar persistência de edições ao Dexie
            GMRENDAVALIACOESCOT.whenReady(function () {
                registarPersistenciaCelulas();
            });

            try {
                $(document).off("click", "#BUCANCELARBottom").on("click", "#BUCANCELARBottom", function (e) {
                    clearAllSourcesByInstance(GMRENDAVALIACOESCOT);
                    __doPostBack('ctl00$conteudo$options5$BUCANCELARBottom', '');
                });
            } catch (error) { }
        }
    });




}

function handleColunasCriteriosFromList(criteriosList) {
    if (!criteriosList || criteriosList.length === 0) {
        console.warn("handleColunasCriteriosFromList: sem critérios");
        return;
    }

    var colunaConfig = GMRENDAVALIACOESCOT.reportConfig.config.colunas.find(function (col) {
        return col.codigocoluna == "criterio";
    });

    if (!colunaConfig) {
        console.warn("handleColunasCriteriosFromList: coluna modelo 'criterio' não encontrada na configuração");
        return;
    }

    var criterioColunaConfig = $.extend(true, {}, colunaConfig, {
        levadesclinha: false,
        atributo: ""
    });

    var maxOrdemColuna = GMRENDAVALIACOESCOT.GRenderedColunas.reduce(function (max, col) {
        return Math.max(max, col.ordem || 0);
    }, 0) + 1;

    var colunasToRender = [];

    criteriosList.forEach(function (criterio) {
        var codigocoluna = "criterio___criterio_" + (criterio.codigo || criterio.descricao);
        var desccoluna = criterio.descricao;

        var colToRender = GMRENDAVALIACOESCOT.setNewRenderedColuna({
            codigocoluna: codigocoluna,
            desccoluna: desccoluna,
            config: criterioColunaConfig,
            ordem: maxOrdemColuna
        });

        var existente = GMRENDAVALIACOESCOT.GRenderedColunas.find(function (col) {
            return col.codigocoluna == colToRender.codigocoluna;
        }) || colunasToRender.find(function (col) {
            return col.codigocoluna == colToRender.codigocoluna;
        });

        if (!existente) {
            colunasToRender.push(colToRender);
        }

        maxOrdemColuna++;
    });

    if (colunasToRender.length > 0) {
        GMRENDAVALIACOESCOT.addColunasByModelo(colunasToRender);
    }
}

function getRequisicoesByCotacao(requisicao) {
    var requisicoes = [];
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getdossiercotacoes",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ requisicao: requisicao }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados  das cotações da requisição " + requisicao;
            try {
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
                requisicoes = response.data || [];
                GREQUISICOES = requisicoes;
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
            }
        }
    });

    return requisicoes;

}

function getFornecedoresRequisicoes() {
    var resultado = [{ nome: "" }];
    var nomesVistos = {};
    GREQUISICOES.forEach(function (r) {
        var nome = (r.nome || "").trim();
        if (nome && !nomesVistos[nome]) {
            nomesVistos[nome] = true;
            resultado.push({ nome: nome });
        }
    });
    return resultado;
}


function handleColunasCriterios() {
    //console.log("handleColunasCriterios: GCriteriosAvaliacao");
    // return true
    if (!GCriteriosAvaliacao || GCriteriosAvaliacao.length === 0) {
        console.warn("handleColunasCriterios: sem critérios seleccionados");
        return;
    }

    var colunaConfig = GMRENDAVALIACOESCOT.reportConfig.config.colunas.find(function (col) {
        return col.codigocoluna == "criterio";
    });

    if (!colunaConfig) {
        console.warn("handleColunasCriterios: coluna modelo 'criterio' não encontrada na configuração");
        return;
    }

    var criterioColunaConfig = $.extend(true, {}, colunaConfig, {
        levadesclinha: false,
        atributo: ""
    });

    var maxOrdemColuna = GMRENDAVALIACOESCOT.GRenderedColunas.reduce(function (max, col) {
        return Math.max(max, col.ordem || 0);
    }, 0) + 1;

    var colunasToRender = [];

    for (var i = 0; i < GCriteriosAvaliacao.length; i++) {
        var criterio = GCriteriosAvaliacao[i];
        var codigocoluna = "criterio___criterio_" + (criterio.codigo || criterio.descricao);
        var desccoluna = criterio.descricao;

        var colToRender = GMRENDAVALIACOESCOT.setNewRenderedColuna({
            codigocoluna: codigocoluna,
            desccoluna: desccoluna,
            config: criterioColunaConfig,
            ordem: maxOrdemColuna
        });

        var existente = GMRENDAVALIACOESCOT.GRenderedColunas.find(function (col) {
            return col.codigocoluna == colToRender.codigocoluna;
        }) || colunasToRender.find(function (col) {
            return col.codigocoluna == colToRender.codigocoluna;
        });

        if (!existente) {
            colunasToRender.push(colToRender);
        }

        maxOrdemColuna++;
    }

    GMRENDAVALIACOESCOT.addColunasByModelo(colunasToRender);
}


function handleColunasFornecedores(cotacoes) {
    if (!cotacoes || cotacoes.length === 0) {
        console.warn("handleColunasFornecedores: sem cotações");
        return;
    }

    var fornecedores = _.uniqBy(cotacoes, "no");

    var colunaDebitoConfig = GMRENDAVALIACOESCOT.reportConfig.config.colunas.find(function (col) {
        return col.codigocoluna == "debito";
    });

    var colunaNomeConfig = GMRENDAVALIACOESCOT.reportConfig.config.colunas.find(function (col) {
        return col.codigocoluna == "nome";
    });

    if (!colunaDebitoConfig) {
        console.warn("handleColunasFornecedores: coluna modelo 'debito' não encontrada na configuração");
        return;
    }

    if (!colunaNomeConfig) {
        console.warn("handleColunasFornecedores: coluna modelo 'nome' não encontrada na configuração");
        return;
    }

    var maxOrdemColuna = GMRENDAVALIACOESCOT.GRenderedColunas.reduce(function (max, col) {
        return Math.max(max, col.ordem || 0);
    }, 0) + 1;

    var todasColunasFornecedores = [];

    for (var i = 0; i < fornecedores.length; i++) {
        var fornecedor = fornecedores[i];
        var no = fornecedor.no;
        var nomeFornecedor = (fornecedor.nome || "").trim();

        // Coluna preço unitário (debito) — vem primeiro
        var codigoDebito = "debito___" + no + "debito";
        var colDebito = GMRENDAVALIACOESCOT.setNewRenderedColuna({
            codigocoluna: codigoDebito,
            desccoluna: "Preço Unitário",
            config: colunaDebitoConfig,
            ordem: maxOrdemColuna
        });

        if (!GMRENDAVALIACOESCOT.GRenderedColunas.find(function (col) { return col.codigocoluna == colDebito.codigocoluna; })) {
            todasColunasFornecedores.push(colDebito);
        }
        maxOrdemColuna++;

        // Coluna com nome do fornecedor — vem ao lado do preço
        var codigoNome = "nome___" + no + "nome";
        var colNome = GMRENDAVALIACOESCOT.setNewRenderedColuna({
            codigocoluna: codigoNome,
            desccoluna: nomeFornecedor,
            config: colunaNomeConfig,
            ordem: maxOrdemColuna
        });

        if (!GMRENDAVALIACOESCOT.GRenderedColunas.find(function (col) { return col.codigocoluna == colNome.codigocoluna; })) {
            todasColunasFornecedores.push(colNome);
        }
        maxOrdemColuna++;
    }

    // Adicionar todas as colunas de fornecedores numa só chamada (evita múltiplos setColumns)
    if (todasColunasFornecedores.length > 0) {
        GMRENDAVALIACOESCOT.addColunasByModelo(todasColunasFornecedores);
    }

    // Reordenar: mover cada coluna nome para ao lado do seu debito correspondente
    GMRENDAVALIACOESCOT.whenReady(function () {
        for (var j = 0; j < fornecedores.length; j++) {
            var fNo = fornecedores[j].no;
            var debitoField = "debito___" + fNo + "debito";
            var nomeField = "nome___" + fNo + "nome";
            if (GMRENDAVALIACOESCOT.GTable.getColumn(nomeField) && GMRENDAVALIACOESCOT.GTable.getColumn(debitoField)) {
                GMRENDAVALIACOESCOT.GTable.moveColumn(nomeField, debitoField, true);
            }
        }
    });
}


function handleLinhasCotacoes(cotacoes) {
    if (!cotacoes || cotacoes.length === 0) {
        console.warn("handleLinhasCotacoes: sem cotações");
        return;
    }

    var linhaModeloConfig = GMRENDAVALIACOESCOT.reportConfig.config.linhas.find(function (l) {
        return l.modelo == true;
    });

    if (!linhaModeloConfig) {
        console.warn("handleLinhasCotacoes: linha modelo não encontrada na configuração");
        return;
    }

    // Agrupar cotações por ref (cada ref = uma linha)
    var gruposPorRef = _.groupBy(cotacoes, function (c) { return String(c && c.ref != null ? c.ref : "").trim(); });
    var refKeys = Object.keys(gruposPorRef).filter(function (ref) { return ref !== ""; });

    function atualizarCellObject(rowid, codigo, valor) {
        var rowidStr = String(rowid || "").trim();
        var cell = GMRENDAVALIACOESCOT.GCellObjectsConfig.find(function (c) {
            return String(c.rowid || "").trim() == rowidStr && c.codigocoluna == codigo;
        });
        if (cell) {
            cell.valor = valor;
        }
    }

    function aplicarDadosLinha(tabulatorRow, ref, items) {
        if (!items || items.length === 0) return;

        var rowData = tabulatorRow.getData();
        var rowid = rowData.rowid;
        var firstItem = items[0] || {};

        rowData.ref = ref;
        rowData.design = String(firstItem.design || "").trim();
        rowData.qtt = firstItem.qtt;

        atualizarCellObject(rowid, "ref", rowData.ref);
        atualizarCellObject(rowid, "design", rowData.design);
        atualizarCellObject(rowid, "qtt", rowData.qtt);

        items.forEach(function (cot) {
            var totalFornecedor = (cot.qtt || 0) * (cot.edebito || 0);
            var debitoKey = "debito___" + cot.no + "debito";
            var nomeKey = "nome___" + cot.no + "nome";

            rowData[debitoKey] = cot.edebito;
            rowData[nomeKey] = totalFornecedor;

            atualizarCellObject(rowid, debitoKey, cot.edebito);
            atualizarCellObject(rowid, nomeKey, totalFornecedor);
        });

        var linha = GMRENDAVALIACOESCOT.GRenderedLinhas.find(function (l) {
            return l.rowid == rowid;
        });

        if (linha && linha.UIObject) {
            linha.UIObject.ref = rowData.ref;
            linha.UIObject.design = rowData.design;
            linha.UIObject.qtt = rowData.qtt;
        }

        tabulatorRow.update(rowData);
    }

    function addLinhaPersistente(modeloCodigo, uiObject) {
        addLinhaPreservandoDinamicas(modeloCodigo, uiObject);
    }

    function construirUIObject(ref, items) {
        var firstItem = items[0] || {};
        var uid = generateUUID();
        var UIObject = {
            rowid: uid,
            id: uid,
            ref: ref,
            design: String(firstItem.design || "").trim(),
            qtt: firstItem.qtt
        };

        items.forEach(function (cot) {
            var totalFornecedor = (cot.qtt || 0) * (cot.edebito || 0);
            UIObject["debito___" + cot.no + "debito"] = cot.edebito;
            UIObject["nome___" + cot.no + "nome"] = totalFornecedor;
        });

        return UIObject;
    }


    // CRUD: comparar estado do IndexedDB com cotações frescas do servidor
    GMRENDAVALIACOESCOT.getDbData().then(function (sources) {

        // Extrair registos existentes (wide rows para chunkMapping=true)
        var existingRecords = [];
        (sources || []).forEach(function (src) {
            existingRecords = existingRecords.concat(src.records || []);
        });

        // Indexar registos existentes por ref
        var existentesPorRef = {};
        existingRecords.forEach(function (rec) {
            var ref = String(rec.ref != null ? rec.ref : "").trim();
            if (ref) {
                existentesPorRef[ref] = rec;
            }
        });

        // Categorizar: novas, removidas, mantidas
        var novasRefs = refKeys.filter(function (r) { return !existentesPorRef[r]; });
        var removidasRefs = Object.keys(existentesPorRef).filter(function (r) { return !gruposPorRef[r]; });

        // 1. Criar linhas para refs novas (antes de whenReady, para ficarem na fila de rendering)
        novasRefs.forEach(function (ref) {
            var items = gruposPorRef[ref] || [];
            if (items.length === 0) return;
            addLinhaPersistente(linhaModeloConfig.codigo, construirUIObject(ref, items));
        });

        // 2. Quando a tabela estiver pronta: remover obsoletas + hidratar todas
        GMRENDAVALIACOESCOT.whenReady(function () {

            // Remover linhas cujo ref já não existe nas cotações
            if (removidasRefs.length > 0) {
                var rows = GMRENDAVALIACOESCOT.GTable.getRows();
                var deletePromises = [];

                rows.forEach(function (tabulatorRow) {
                    var rowData = tabulatorRow.getData();
                    var ref = String(rowData && rowData.ref != null ? rowData.ref : "").trim();

                    if (ref && removidasRefs.indexOf(ref) !== -1) {
                        var renderedLinha = GMRENDAVALIACOESCOT.GRenderedLinhas.find(function (l) {
                            return l.rowid == rowData.rowid;
                        });
                        if (renderedLinha) {
                            deletePromises.push(renderedLinha.deleteRow());
                        }
                        tabulatorRow.delete();
                    }
                });

                Promise.all(deletePromises).then(function () {
                    hidratarLinhas();
                });
            }
            else {
                hidratarLinhas();
            }

            function hidratarLinhas() {
                var currentRows = GMRENDAVALIACOESCOT.GTable.getRows();
                currentRows.forEach(function (tabulatorRow, idx) {
                    var rowData = tabulatorRow.getData();
                    var refAtual = String(rowData && rowData.ref != null ? rowData.ref : "").trim();
                    var refTarget = (refAtual && gruposPorRef[refAtual]) ? refAtual : (refKeys[idx] || "");
                    if (refTarget && gruposPorRef[refTarget]) {
                        aplicarDadosLinha(tabulatorRow, refTarget, gruposPorRef[refTarget]);
                    }
                });

                // Persistir todas as células (incluindo dinâmicas) no IndexedDB
                var allUIObjects = GMRENDAVALIACOESCOT.GRenderedLinhas
                    .filter(function (l) { return l.UIObject && l.UIObject.rowid; })
                    .map(function (l) { return l.UIObject; });
                persistDynamicCellsToIndexedDB(allUIObjects);
                GMRENDAVALIACOESCOT.GTable.redraw(true);
            }
        });

    }).catch(function (err) {
        console.error("handleLinhasCotacoes: erro ao obter dados do DB", err);
    });
}


// ============================================================
// Limpar estado do MRend (linhas + IndexedDB) antes de reconstruir
// ============================================================

function clearMrendState() {
    var mrend = GMRENDAVALIACOESCOT;
    if (!mrend) return Promise.resolve();

    return new Promise(function (resolve) {
        mrend.whenReady(function () {
            // 1. Remover rows do Tabulator (seguro pois table está built)
            try {
                if (mrend.GTable) {
                    var rows = mrend.GTable.getRows();
                    for (var i = rows.length - 1; i >= 0; i--) {
                        rows[i].delete();
                    }
                }
            } catch (e) {
                console.warn("clearMrendState: erro ao remover rows do Tabulator", e);
            }

            // 2. Limpar arrays internos (seguro agora que rows do Tabulator foram removidas)
            mrend.GRenderedLinhas = [];
            mrend.GCellObjectsConfig = [];
            mrend.GNewRecords = [];
            mrend.GGridData = [];

            // 3. Limpar IndexedDB
            if (mrend.db && mrend.tableSourceName && mrend.db[mrend.tableSourceName]) {
                mrend.db[mrend.tableSourceName].clear().then(resolve).catch(function () { resolve(); });
            } else {
                resolve();
            }
        });
    });
}

// ============================================================
// Persistir TODAS as células (incluindo dinâmicas) no IndexedDB
// ============================================================

function persistDynamicCellsToIndexedDB(uiObjectsList) {
    var mrend = GMRENDAVALIACOESCOT;
    if (!mrend || !mrend.db || !mrend.tableSourceName) return;

    // Construir TODAS as células (base + dinâmicas) a partir dos UIObjects
    var cellsToPut = [];

    uiObjectsList.forEach(function (uiObj) {
        var rowid = String(uiObj.rowid || "");

        mrend.GRenderedColunas.forEach(function (coluna) {
            var codigocoluna = coluna.codigocoluna;
            var modelCode = (coluna.config && coluna.config.codigocoluna) || codigocoluna;
            var campo = (coluna.config && coluna.config.campo) || codigocoluna;

            var isCriterio = modelCode === "criterio";
            var sourceTable = isCriterio ? "u_avcrit" : ((coluna.config && coluna.config.sourceTable) || mrend.dbTableToMrendObject.table);
            var sourceKey = isCriterio ? "u_avcritstamp" : ((coluna.config && coluna.config.sourceKey) || mrend.dbTableToMrendObject.tableKey);

            // O codigocoluna já tem o formato correto (ex: "criterio___criterio_PREC", "debito___4debito")
            var valor = uiObj[codigocoluna];
            if (valor === undefined) valor = "";

            var newCell = {
                cellId: generateUUID(),
                coluna: codigocoluna,
                rowid: rowid,
                sourceTable: sourceTable,
                sourceKey: sourceKey,
                sourceKeyValue: rowid,
                valor: valor,
                campo: campo,
                linkid: "",
                linkField: "",
                codigolinha: "",
                ordemField: "",
                descColuna: coluna.desccoluna || "",
                descColunaField: "",
                cellIdField: "",
                rowIdField: "",
                colunaField: "",
                linhaField: "",
                ordemColunaField: "",
                ordemcoluna: coluna.ordem || 0,
                ordem: 0,
                tipocolField: "",
                tipocol: (coluna.config && coluna.config.tipo) || "text"
            };
            newCell[campo] = valor;
            cellsToPut.push(newCell);
        });
    });

    if (cellsToPut.length === 0) return;

    // Clear primeiro (garante que writes pendentes do addNewRecords completam via transaction serialization)
    // depois escreve o conjunto completo de células
    mrend.db[mrend.tableSourceName].clear().then(function () {
        return mrend.db[mrend.tableSourceName].bulkPut(cellsToPut);
    }).then(function () {
        console.log("persistDynamicCellsToIndexedDB: " + cellsToPut.length + " cells persisted (clean write)");
    }).catch(function (err) {
        console.error("persistDynamicCellsToIndexedDB: erro ao persistir células", err);
    });
}

// ============================================================
// MODO CONSULTA — Fetch do backend + reconstrução de wide rows
// ============================================================

function getAvaliacaoCotacoes(bostamp) {
    var resultado = { bi: [], avcrit: [] };
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getavaliacaocotacoes",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ bostamp: bostamp }])
        },
        success: function (response) {
            try {
                if (response.cod != "0000") {
                    console.log("Erro ao obter avaliação de cotações", response);
                    return;
                }
                resultado.bi = response.bi || [];
                resultado.avcrit = response.avcrit || [];
            } catch (error) {
                console.log("Erro interno ao obter avaliação de cotações", error);
            }
        }
    });
    return resultado;
}

function renderAvaliacaoConsulta() {
    var bostamp = getRecordStamp();
    if (!bostamp) {
        console.warn("renderAvaliacaoConsulta: sem bostamp");
        return;
    }

    var saved = getAvaliacaoCotacoes(bostamp);
    var biFlat = saved.bi || [];
    var avcritFlat = saved.avcrit || [];

    if (biFlat.length === 0) {
        console.warn("renderAvaliacaoConsulta: sem registos bi gravados");
        return;
    }

    // --- 1. Extrair fornecedores únicos (por no) e criar colunas dinâmicas ---
    var fornecedores = [];
    var nosVistos = {};
    biFlat.forEach(function (rec) {
        var no = rec.no;
        if (no && !nosVistos[no]) {
            nosVistos[no] = true;
            fornecedores.push({ no: no, nome: (rec.nome || "").trim() });
        }
    });

    // Usar handleColunasFornecedores com dados simulando formato cotações
    handleColunasFornecedores(fornecedores.map(function (f) {
        return { no: f.no, nome: f.nome };
    }));

    // --- 2. Extrair critérios únicos e criar colunas ---
    var criterios = [];
    var codsVistos = {};
    avcritFlat.forEach(function (rec) {
        var cod = rec.codcrit;
        if (cod && !codsVistos[cod]) {
            codsVistos[cod] = true;
            criterios.push({ codigo: cod, descricao: rec.desccrit || cod });
        }
    });

    // Fallback: quando avcrit está vazio, usar critérios do formulário
    if (criterios.length === 0 && typeof GCriteriosAvaliacao !== "undefined" && GCriteriosAvaliacao && GCriteriosAvaliacao.length > 0) {
        GCriteriosAvaliacao.forEach(function (crit) {
            var cod = crit.codigo || crit.descricao;
            if (cod && !codsVistos[cod]) {
                codsVistos[cod] = true;
                criterios.push({ codigo: cod, descricao: crit.descricao || cod });
            }
        });
    }

    if (criterios.length > 0) {
        handleColunasCriteriosFromList(criterios);
    }

    // --- 3. Indexar u_avcrit por bistamp para lookup rápido ---
    var avcritPorBistamp = {};
    avcritFlat.forEach(function (rec) {
        var bs = rec.bistamp || "";
        if (!avcritPorBistamp[bs]) avcritPorBistamp[bs] = [];
        avcritPorBistamp[bs].push(rec);
    });

    // --- 4. Agrupar bi por ref (distinct) e recompor wide rows ---
    var gruposPorRef = _.groupBy(biFlat, function (rec) {
        return String(rec.ref || "").trim();
    });

    var linhaModeloConfig = GMRENDAVALIACOESCOT.reportConfig.config.linhas.find(function (l) {
        return l.modelo == true;
    });

    if (!linhaModeloConfig) {
        console.warn("renderAvaliacaoConsulta: linha modelo não encontrada");
        return;
    }

    var allUIObjects = [];

    // Limpar estado anterior do MRend para evitar linhas duplicadas
    clearMrendState().then(function () {

    Object.keys(gruposPorRef).forEach(function (ref) {
        var items = gruposPorRef[ref];
        if (!items || items.length === 0) return;

        var firstItem = items[0];
        // Usar o bistamp da primeira entrada como rowid (mantém ligação com u_avcrit)
        var rowid = firstItem.bistamp || generateUUID();

        var UIObject = {
            rowid: rowid,
            id: rowid,
            ref: ref,
            design: String(firstItem.design || "").trim(),
            qtt: firstItem.qtt || 0
        };

        // Pivotar fornecedores para colunas dinâmicas
        items.forEach(function (biRec) {
            var no = biRec.no;
            if (!no) return;
            var edebito = biRec.edebito || 0;
            var qtt = biRec.qtt || firstItem.qtt || 0;
            UIObject["debito___" + no + "debito"] = edebito;
            UIObject["nome___" + no + "nome"] = edebito * qtt;
        });

        // Adicionar critérios: procurar no u_avcrit pelo bistamp de qualquer item desta ref
        items.forEach(function (biRec) {
            var crits = avcritPorBistamp[biRec.bistamp] || [];
            crits.forEach(function (crit) {
                var critKey = "criterio___criterio_" + crit.codcrit;
                UIObject[critKey] = crit.status || "";
            });
        });

        // Garantir que critérios sem valor gravado também existem no UIObject
        criterios.forEach(function (crit) {
            var critKey = "criterio___criterio_" + crit.codigo;
            if (UIObject[critKey] === undefined) {
                UIObject[critKey] = "";
            }
        });

        allUIObjects.push(UIObject);
        addLinhaPreservandoDinamicas(linhaModeloConfig.codigo, UIObject);
    });

    // Forçar redraw e persistir células dinâmicas no IndexedDB
    GMRENDAVALIACOESCOT.whenReady(function () {
        persistDynamicCellsToIndexedDB(allUIObjects);
        GMRENDAVALIACOESCOT.GTable.redraw(true);
    });

    }); // fim clearMrendState
}

function renderAvaliacaoEdicao() {
    var bostamp = getRecordStamp();
    var requisicao = $("#ctl00_conteudo_u_requis_u_requismBox1").val();
    var currentCotacoes = getRequisicoesByCotacao(requisicao);
    var saved = bostamp ? getAvaliacaoCotacoes(bostamp) : { bi: [], avcrit: [] };
    var biFlat = saved.bi || [];
    var avcritFlat = saved.avcrit || [];

    function toNumberOrZero(value) {
        if (typeof value === "number") {
            return isFinite(value) ? value : 0;
        }
        if (value == null) {
            return 0;
        }
        var normalized = String(value)
            .replace(/\s+/g, "")
            .replace(",", ".");
        var parsed = Number(normalized);
        return isFinite(parsed) ? parsed : 0;
    }

    function getStatusValue(crit) {
        if (!crit) {
            return "";
        }
        if (crit.status != null) {
            return crit.status;
        }
        if (crit.STATUS != null) {
            return crit.STATUS;
        }
        return "";
    }

    var currentByRef = _.groupBy(currentCotacoes || [], function (rec) {
        return String(rec && rec.ref != null ? rec.ref : "").trim();
    });
    var savedByRef = _.groupBy(biFlat || [], function (rec) {
        return String(rec && rec.ref != null ? rec.ref : "").trim();
    });

    var fornecedoresMap = {};
    (currentCotacoes || []).forEach(function (rec) {
        var no = String(rec && rec.no != null ? rec.no : "").trim();
        if (no) {
            fornecedoresMap[no] = { no: rec.no, nome: String(rec.nome || "").trim() };
        }
    });
    (biFlat || []).forEach(function (rec) {
        var no = String(rec && rec.no != null ? rec.no : "").trim();
        if (no && !fornecedoresMap[no]) {
            fornecedoresMap[no] = { no: rec.no, nome: String(rec.nome || "").trim() };
        }
    });
    var fornecedores = Object.keys(fornecedoresMap).map(function (no) {
        return fornecedoresMap[no];
    });
    if (fornecedores.length > 0) {
        handleColunasFornecedores(fornecedores);
    }

    var criteriosMap = {};
    (GCriteriosAvaliacao || []).forEach(function (crit) {
        var cod = String(crit && (crit.codigo || crit.descricao) || "").trim();
        if (cod) {
            criteriosMap[cod] = { codigo: cod, descricao: crit.descricao || cod };
        }
    });
    (avcritFlat || []).forEach(function (rec) {
        var cod = String(rec && rec.codcrit || "").trim();
        if (cod && !criteriosMap[cod]) {
            criteriosMap[cod] = { codigo: cod, descricao: rec.desccrit || cod };
        }
    });
    var criterios = Object.keys(criteriosMap).map(function (cod) {
        return criteriosMap[cod];
    });
    if (criterios.length > 0) {
        handleColunasCriteriosFromList(criterios);
    }

    var savedCriteriaByRef = {};
    Object.keys(savedByRef).forEach(function (ref) {
        var savedItems = savedByRef[ref] || [];
        var stamps = {};
        savedItems.forEach(function (item) {
            var bistamp = String(item && item.bistamp || "").trim();
            if (bistamp) {
                stamps[bistamp] = true;
            }
        });

        savedCriteriaByRef[ref] = {};
        (avcritFlat || []).forEach(function (crit) {
            var bistamp = String(crit && crit.bistamp || "").trim();
            var codcrit = String(crit && crit.codcrit || "").trim();
            if (bistamp && codcrit && stamps[bistamp] && savedCriteriaByRef[ref][codcrit] == null) {
                savedCriteriaByRef[ref][codcrit] = getStatusValue(crit);
            }
        });
    });

    var allRefsMap = {};
    Object.keys(currentByRef).forEach(function (ref) { if (ref) { allRefsMap[ref] = true; } });
    Object.keys(savedByRef).forEach(function (ref) { if (ref) { allRefsMap[ref] = true; } });
    var allRefs = Object.keys(allRefsMap);

    var linhaModeloConfig = GMRENDAVALIACOESCOT.reportConfig.config.linhas.find(function (l) {
        return l.modelo == true;
    });

    if (!linhaModeloConfig) {
        console.warn("renderAvaliacaoEdicao: linha modelo não encontrada");
        return;
    }

    var allUIObjects = [];

    // Limpar estado anterior do MRend para evitar linhas duplicadas
    clearMrendState().then(function () {

    allRefs.forEach(function (ref) {
        var currentItems = currentByRef[ref] || [];
        var savedItems = savedByRef[ref] || [];
        var firstCurrent = currentItems[0] || {};
        var firstSaved = savedItems[0] || {};
        var rowid = firstSaved.bistamp || generateUUID();
        var qtt = toNumberOrZero(firstCurrent.qtt != null ? firstCurrent.qtt : firstSaved.qtt);
        var rowRef = String((firstCurrent.ref != null ? firstCurrent.ref : firstSaved.ref) || ref || "").trim();

        var UIObject = {
            rowid: rowid,
            id: rowid,
            ref: rowRef,
            design: String((firstCurrent.design != null ? firstCurrent.design : firstSaved.design) || "").trim(),
            qtt: qtt
        };

        var currentByNo = _.keyBy(currentItems, function (item) {
            return String(item && item.no != null ? item.no : "").trim();
        });
        var savedByNo = _.keyBy(savedItems, function (item) {
            return String(item && item.no != null ? item.no : "").trim();
        });

        fornecedores.forEach(function (fornecedor) {
            var no = String(fornecedor && fornecedor.no != null ? fornecedor.no : "").trim();
            if (!no) {
                return;
            }

            var currentFornecedor = currentByNo[no];
            var savedFornecedor = savedByNo[no];
            var effectiveFornecedor = currentFornecedor || savedFornecedor;

            if (!effectiveFornecedor) {
                return;
            }

            var edebito = toNumberOrZero(effectiveFornecedor.edebito);
            UIObject["debito___" + no + "debito"] = edebito;
            UIObject["nome___" + no + "nome"] = edebito * qtt;
        });

        var criteriosRef = savedCriteriaByRef[ref] || {};
        criterios.forEach(function (crit) {
            var cod = String(crit && crit.codigo || "").trim();
            if (!cod) {
                return;
            }
            UIObject["criterio___criterio_" + cod] = criteriosRef[cod] || "";
        });

        allUIObjects.push(UIObject);
        addLinhaPreservandoDinamicas(linhaModeloConfig.codigo, UIObject);
    });

    registerClickGravarRelatorio();

    // Persistir células dinâmicas no IndexedDB e forçar redraw
    GMRENDAVALIACOESCOT.whenReady(function () {
        persistDynamicCellsToIndexedDB(allUIObjects);
        GMRENDAVALIACOESCOT.GTable.redraw(true);
    });

    }); // fim clearMrendState
}


function registerClickGravarRelatorio() {
    $("#BUGRAVARBottom").removeAttr("href");

    $(document).off("click", "#BUGRAVARBottom").on("click", "#BUGRAVARBottom", function (e) {

        GMRENDAVALIACOESCOT.getDbData().then(function (reportData) {

            function toNumberOrZero(value) {
                if (typeof value === "number") {
                    return isFinite(value) ? value : 0;
                }
                if (value == null) {
                    return 0;
                }
                var normalized = String(value)
                    .replace(/\s+/g, "")
                    .replace(",", ".");
                var parsed = Number(normalized);
                return isFinite(parsed) ? parsed : 0;
            }

            // Encontrar bi source (wide rows do MRend)
            var biSource = reportData.find(function (s) { return s.sourceTable !== "u_avcrit"; });
            var biRecords = (biSource && biSource.records) || [];

            // Fonte principal para valores dinâmicos: dados atuais da grelha
            var tableRows = (GMRENDAVALIACOESCOT.GTable && GMRENDAVALIACOESCOT.GTable.getData)
                ? (GMRENDAVALIACOESCOT.GTable.getData() || [])
                : [];
            var tableRowsByRef = {};
            tableRows.forEach(function (row) {
                var refKey = String(row && row.ref != null ? row.ref : "").trim();
                if (refKey) {
                    tableRowsByRef[refKey] = row;
                }
            });

            // --- Decompor wide rows em 1 bi record por ref × fornecedor ---
            var fornecedores = _.uniqBy(GREQUISICOES, "no");
            if (!fornecedores || fornecedores.length === 0) {
                var nosFromGrid = {};
                tableRows.forEach(function (row) {
                    Object.keys(row || {}).forEach(function (k) {
                        var match = /^debito___(.+)debito$/.exec(k);
                        if (match && match[1]) {
                            nosFromGrid[match[1]] = true;
                        }
                    });
                });
                fornecedores = Object.keys(nosFromGrid).map(function (no) {
                    return { no: no, nome: "" };
                });
            }
            var decomposedBiRecords = [];

            biRecords.forEach(function (wideRow) {
                var originalStamp = wideRow[biSource.sourceKey] || "";
                var isFirst = true;
                var refKey = String(wideRow && wideRow.ref != null ? wideRow.ref : "").trim();
                var sourceRow = tableRowsByRef[refKey] || wideRow;

                fornecedores.forEach(function (fornecedor) {
                    var no = fornecedor.no;
                    var debitoKey = "debito___" + no + "debito";
                    var nomeKey = "nome___" + no + "nome";

                    var edebito = sourceRow[debitoKey];
                    var totalFornecedor = sourceRow[nomeKey];

                    // Fallback para getDbData() quando a linha não estiver no Tabulator
                    if (edebito == null || edebito === "") {
                        edebito = wideRow[debitoKey];
                    }
                    if (totalFornecedor == null || totalFornecedor === "") {
                        totalFornecedor = wideRow[nomeKey];
                    }

                    edebito = toNumberOrZero(edebito);
                    totalFornecedor = toNumberOrZero(totalFornecedor);

                    // Copiar campos base (excluindo dinâmicos com ___)
                    var biRec = {};
                    Object.keys(wideRow).forEach(function (key) {
                        if (key.indexOf("___") === -1) {
                            biRec[key] = wideRow[key];
                        }
                    });

                    // Primeiro fornecedor mantém bistamp original (u_avcrit.bistamp liga aqui)
                    biRec[biSource.sourceKey] = isFirst ? originalStamp : generateUUID();
                    isFirst = false;

                    // Campos específicos do fornecedor
                    biRec.no = no;
                    biRec.nome = (fornecedor.nome || "").trim();
                    biRec.edebito = edebito;
                    biRec.debito = totalFornecedor;

                    delete biRec[""];
                    decomposedBiRecords.push(biRec);
                });
            });

            // Query direta ao Dexie para obter raw MrendObjects u_avcrit
            GMRENDAVALIACOESCOT.db[GMRENDAVALIACOESCOT.tableSourceName].toArray().then(function (rawRecords) {
                var avCritCells = rawRecords.filter(function (r) { return r.sourceTable === "u_avcrit"; });

                // 1 record por cada cell (combinação bistamp + critério)
                var avCritRecords = [];
                avCritCells.forEach(function (cell) {
                    var coluna = cell.coluna || "";
                    var codcrit = coluna.replace("criterio___criterio_", "");

                    avCritRecords.push({
                        u_avcritstamp: cell.cellId || "",
                        bistamp: cell.rowid || "",
                        bostamp: "",
                        codcrit: codcrit,
                        desccrit: cell.descColuna || "",
                        status: cell[cell.campo] || ""
                    });
                });

                // bi decomposto (1 record por ref × fornecedor)
                var biRecord = [{
                    sourceTable: "bi",
                    sourceKey: biSource.sourceKey,
                    records: decomposedBiRecords
                }];

                // u_avcrit construído manualmente
                var avCritRecord = [];
                if (avCritRecords.length > 0) {
                    avCritRecord.push({
                        sourceTable: "u_avcrit",
                        sourceKey: "u_avcritstamp",
                        records: avCritRecords
                    });
                }

                // bi2: 1 record por cada bi decomposto
                var bi2Records = [];
                decomposedBiRecords.forEach(function (rec) {
                    bi2Records.push({
                        bi2stamp: rec[biSource.sourceKey] || "",
                        bostamp: getRecordStamp()
                    });
                });

                var record = [{
                    instance: "bi",
                    data: biRecord
                }];

                record.push({
                    instance: "bi2",
                    data: [{
                        sourceTable: "bi2",
                        sourceKey: "bi2stamp",
                        records: bi2Records
                    }]
                });

                record.push({
                    instance: "u_avcrit",
                    data: avCritRecord
                });

                console.log("Payload para gravar:record", record);
                persistRecord(record);
            });
        });
    });
}

function persistRecord(records) {
    $("#registoJson").val(JSON.stringify(records));
    $("#registoJson").trigger("change");
    __doPostBack('ctl00$conteudo$options5$BUGRAVARBottom', '');
}


function inicializarMrendBycodigo(config) {

    var cfg = config || {};

    var codigo = cfg.codigo;
    var relatorioTable = cfg.relatorioTable || "u_mrendrel";
    var relatorioTableKey = cfg.relatorioTableKey || "u_mrendrelstamp";
    var relatorioTableFilterField = cfg.relatorioTableFilterField || "codigo";
    var containerToRender = cfg.containerToRender || "#mrend-report-container";
    var mrendOptions = cfg.mrendOptions || {};
    var onSuccess = typeof cfg.onSuccess === "function" ? cfg.onSuccess : null;
    var onError = typeof cfg.onError === "function" ? cfg.onError : null;

    if (!codigo) {
        console.error("inicializarMrendBycodigo: 'codigo' é obrigatório");
        return;
    }

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getmrendconfig",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                codigo: codigo,
                relatorioTable: relatorioTable,
                relatorioTableKey: relatorioTableKey,
                relatorioTableFilterField: relatorioTableFilterField
            }])
        },
        success: function (response) {

            if (!response || response.cod !== "0000") {
                console.error("inicializarMrendBycodigo: erro ao carregar configuração", response);
                if (onError) onError(response);
                return;
            }

            var configData = response.data || {};

            var relatorioRecord = Array.isArray(configData.relatorio)
                ? (configData.relatorio[0] || {})
                : (configData.relatorio || {});

            var initConfig = {};
            try {
                initConfig = JSON.parse(relatorioRecord.rendopt || "{}");
            } catch (e) {
                console.warn("inicializarMrendBycodigo: rendopt inválido", e);
            }

            // --- Normalizar schemas (migração de formatos anteriores) ---
            // schemas deve chegar a InitDB como [{tableSourceName, tableSourceSchema}]
            if (typeof initConfig.schemas === 'string') {
                try {
                    var parsed = JSON.parse(initConfig.schemas);
                    initConfig.schemas = Array.isArray(parsed) ? parsed : [];
                } catch (e) { initConfig.schemas = []; }
            }

            // --- Avaliar expressões JS guardadas como string ---
            if (typeof initConfig.enableEdit === "string") { try { initConfig.enableEdit = eval(initConfig.enableEdit); } catch (e) { initConfig.enableEdit = false; } }
            if (typeof initConfig.resetSourceStamp === "string") { try { initConfig.resetSourceStamp = eval(initConfig.resetSourceStamp); } catch (e) { initConfig.resetSourceStamp = false; } }
            if (typeof initConfig.remoteFetch === "string") { try { initConfig.remoteFetch = eval(initConfig.remoteFetch); } catch (e) { initConfig.remoteFetch = false; } }
            /* if (initConfig.remoteFetchData && initConfig.remoteFetchData.data && typeof initConfig.remoteFetchData.data.__EVENTARGUMENT === "string") {
                 try { initConfig.remoteFetchData.data.__EVENTARGUMENT = eval(initConfig.remoteFetchData.data.__EVENTARGUMENT); } catch (e) { }
             }*/

            if (initConfig.remoteFetchData && initConfig.remoteFetchData.data && typeof initConfig.remoteFetchData.data.__EVENTARGUMENT === "string") {
                try {
                    initConfig.remoteFetchData.data.__EVENTARGUMENT = eval(initConfig.remoteFetchData.data.__EVENTARGUMENT);
                } catch (e) {
                    console.error("inicializarMrendBycodigo: erro ao avaliar remoteFetchData.__EVENTARGUMENT:", initConfig.remoteFetchData.data.__EVENTARGUMENT, e);
                    delete initConfig.remoteFetchData.data.__EVENTARGUMENT;
                }
            }

            if (initConfig.recordData && typeof initConfig.recordData.stamp === "string" && initConfig.recordData.stamp) {
                try {
                    initConfig.recordData.stamp = String(eval(initConfig.recordData.stamp) || "");
                } catch (e) {
                    initConfig.recordData.stamp = "";
                }
            }

            // console.log("initConfig.remoteFetchData", initConfig.remoteFetchData);

            var finalOptions = $.extend(true, {}, initConfig, {
                containerToRender: containerToRender,
                reportConfig: {
                    config: {
                        linhas: configData.linhas || [],
                        colunas: configData.colunas || [],
                        celulas: configData.celulas || [],
                        relatorio: relatorioRecord,
                        ligacoes: configData.ligacoes || [],
                        grupocolunas: configData.grupocolunas || [],
                        grupocolunaItems: configData.grupocolunaItems || []
                    }
                }
            }, mrendOptions);

            // schemas chega aqui como array de strings → InitDB passa-o directamente ao configureDataBase
            GMRENDREPORTC = new Mrend(finalOptions);
            GMRENDREPORTC.render().then(function () {
                if (onSuccess) onSuccess(GMRENDREPORTC);
            });
        },
        error: function (err) {
            console.error("inicializarMrendBycodigo: erro AJAX", err);
            if (onError) onError(err);
        }
    });
}


var GMRENDAVALIACOESCOT = null;
var GREQUISICOES = [];
var GFORNECEDORESNOMES = {};
var GLASTNOMESBOSTAMP = "";

// ============================================================
// Utilitários
// ============================================================

function getRecordStamp() {
    return $("#bodata").data("bostamp") || "";
}

function toNum(v) {
    if (typeof v === "number") return isFinite(v) ? v : 0;
    if (v == null) return 0;
    var n = Number(String(v).replace(/\s+/g, "").replace(",", "."));
    return isFinite(n) ? n : 0;
}

function isEmptyValue(v) {
    return v == null || String(v).trim() === "";
}

function normalizeTextForCompare(v) {
    return String(v == null ? "" : v)
        .toLowerCase()
        .replace(/[áàâãä]/g, "a")
        .replace(/[éèêë]/g, "e")
        .replace(/[íìîï]/g, "i")
        .replace(/[óòôõö]/g, "o")
        .replace(/[úùûü]/g, "u")
        .replace(/ç/g, "c");
}

function isCriterioPreco(criterio) {
    var cod = normalizeTextForCompare(criterio && criterio.codigo);
    var desc = normalizeTextForCompare(criterio && criterio.descricao);
    return cod === "preco" || cod === "preco total" || desc === "preco" || desc === "preco total";
}

function getFornecedorMaisBaratoNome(ui, fornecedores) {
    if (!ui) return "";

    var mapNome = {};
    (fornecedores || []).forEach(function (f) {
        var no = String(f && f.no || "").trim();
        if (!no) return;
        var nome = String(f && f.nome || "").trim();
        mapNome[no] = nome || getFornecedorNomeByNo(no) || no;
    });

    Object.keys(ui).forEach(function (k) {
        var m = /^debito___(.+)debito$/.exec(String(k));
        if (!m || !m[1]) return;
        var no = String(m[1]).trim();
        if (!mapNome[no]) mapNome[no] = getFornecedorNomeByNo(no) || no;
    });

    var melhorNo = "";
    var melhorTotal = null;
    var qtt = toNum(ui.qtt);

    Object.keys(mapNome).forEach(function (no) {
        var totalKey = "nome___" + no + "nome";
        var unitKey = "debito___" + no + "debito";
        var temTotal = !isEmptyValue(ui[totalKey]);
        var temUnit = !isEmptyValue(ui[unitKey]);
        if (!temTotal && !temUnit) return;

        var total = temTotal ? toNum(ui[totalKey]) : (toNum(ui[unitKey]) * qtt);
        if (melhorTotal == null || total < melhorTotal) {
            melhorTotal = total;
            melhorNo = no;
        }
    });

    return melhorNo ? (mapNome[melhorNo] || melhorNo) : "";
}

function getAutoPrecoCriterioUpdates(ui, criterios, fornecedores) {
    var updates = {};
    if (!ui || !criterios || !criterios.length) return updates;

    var fornecedorMaisBarato = "";
    criterios.forEach(function (c) {
        if (!isCriterioPreco(c)) return;

        var key = "criterio___criterio_" + c.codigo;
        if (!isEmptyValue(ui[key])) return;

        if (!fornecedorMaisBarato) {
            fornecedorMaisBarato = getFornecedorMaisBaratoNome(ui, fornecedores);
        }

        if (!isEmptyValue(fornecedorMaisBarato)) {
            updates[key] = fornecedorMaisBarato;
        }
    });

    return updates;
}

function mergeNonDynamicFields(dst, src) {
    if (!dst || !src) return dst;

    var skip = {
        rowid: true,
        id: true,
        parentid: true,
        linkid: true,
        codigolinha: true
    };

    Object.keys(src).forEach(function (k) {
        if (!k || skip[k]) return;
        if (k.indexOf("___") !== -1) return;
        dst[k] = src[k];
    });

    return dst;
}

function normalizeUiByColumnFieldMap(ui) {
    var mr = GMRENDAVALIACOESCOT;
    if (!ui || !mr) return ui;

    (mr.GRenderedColunas || []).forEach(function (col) {
        var codigo = String(col && col.codigocoluna || "").trim();
        var campo = String(col && col.config && col.config.campo || "").trim();
        if (!codigo || !campo || codigo === campo) return;

        if (ui[codigo] === undefined && ui[campo] !== undefined) {
            ui[codigo] = ui[campo];
        }
        if (ui[campo] === undefined && ui[codigo] !== undefined) {
            ui[campo] = ui[codigo];
        }
    });

    return ui;
}

function getFornecedorStampBase(no) {
    return String(no == null ? "" : no).trim().replace(/[^A-Za-z0-9_-]/g, "_");
}

function getFornecedorGroupStamp(no) {
    return "grp_forn_" + getFornecedorStampBase(no);
}

function getFornecedorNomeByNo(no) {
    var noStr = String(no || "").trim();
    if (!noStr) return "";

    var fromReq = (GREQUISICOES || []).find(function (f) {
        return String(f.no || "").trim() === noStr;
    });
    if (fromReq && String(fromReq.nome || "").trim()) {
        return String(fromReq.nome || "").trim();
    }

    if (GFORNECEDORESNOMES[noStr]) {
        return GFORNECEDORESNOMES[noStr];
    }

    var bostamp = getRecordStamp();
    if (bostamp && GLASTNOMESBOSTAMP !== bostamp) {
        var saved = getAvaliacaoCotacoes(bostamp);
        (saved.bi || []).forEach(function (r) {
            var codNo = String(r && r.no || "").trim();
            var nomeNo = String(r && r.nome || "").trim();
            if (codNo && nomeNo && !GFORNECEDORESNOMES[codNo]) {
                GFORNECEDORESNOMES[codNo] = nomeNo;
            }
        });
        GLASTNOMESBOSTAMP = bostamp;

        if (GFORNECEDORESNOMES[noStr]) {
            return GFORNECEDORESNOMES[noStr];
        }
    }

    var mr = GMRENDAVALIACOESCOT;
    var grupos = (mr && mr.reportConfig && mr.reportConfig.config && mr.reportConfig.config.grupocolunas) || [];
    var grp = grupos.find(function (g) {
        return String(g.grupocolunastamp || "") === getFornecedorGroupStamp(noStr);
    });
    return grp ? String(grp.descgrupo || "").trim() : "";
}

function rememberFornecedoresNomes(fornecedores) {
    (fornecedores || []).forEach(function (f) {
        var no = String(f && f.no || "").trim();
        var nome = String(f && f.nome || "").trim();
        if (no && nome && !GFORNECEDORESNOMES[no]) {
            GFORNECEDORESNOMES[no] = nome;
        }
    });
}

function ensureFornecedorGroupConfig(no, nomeFornecedor, debitoColunaStamp, totalColunaStamp, ordemBase) {
    var mr = GMRENDAVALIACOESCOT;
    if (!mr || !mr.reportConfig || !mr.reportConfig.config) return;

    var cfg = mr.reportConfig.config;
    cfg.grupocolunas = cfg.grupocolunas || [];
    cfg.grupocolunaItems = cfg.grupocolunaItems || [];

    var groupStamp = getFornecedorGroupStamp(no);
    var existingGroup = cfg.grupocolunas.find(function (g) {
        return String(g.grupocolunastamp || "") === groupStamp;
    });

    if (!existingGroup) {
        cfg.grupocolunas.push({
            grupocolunastamp: groupStamp,
            descgrupo: String(nomeFornecedor || no || "").trim(),
            ordem: ordemBase || 0,
            fixa: false
        });
    } else if (nomeFornecedor) {
        existingGroup.descgrupo = String(nomeFornecedor).trim();
    }

    var hasDebitoItem = cfg.grupocolunaItems.some(function (it) {
        return String(it.grupocolunastamp || "") === groupStamp && String(it.colunastamp || "") === String(debitoColunaStamp || "");
    });
    if (!hasDebitoItem) {
        cfg.grupocolunaItems.push({
            grupocolunaitemstamp: "gci_" + groupStamp + "_debito",
            grupocolunastamp: groupStamp,
            colunastamp: debitoColunaStamp,
            ordem: 1
        });
    }

    var hasTotalItem = cfg.grupocolunaItems.some(function (it) {
        return String(it.grupocolunastamp || "") === groupStamp && String(it.colunastamp || "") === String(totalColunaStamp || "");
    });
    if (!hasTotalItem) {
        cfg.grupocolunaItems.push({
            grupocolunaitemstamp: "gci_" + groupStamp + "_total",
            grupocolunastamp: groupStamp,
            colunastamp: totalColunaStamp,
            ordem: 2
        });
    }
}

function getFieldsFromColumnDef(def) {
    var fields = [];
    if (!def) return fields;
    if (def.field) fields.push(String(def.field));
    (def.columns || []).forEach(function (sub) {
        fields = fields.concat(getFieldsFromColumnDef(sub));
    });
    return fields;
}

function getLeafColumnDefs(defs, out) {
    out = out || [];
    (defs || []).forEach(function (def) {
        if (def && Array.isArray(def.columns) && def.columns.length) {
            getLeafColumnDefs(def.columns, out);
            return;
        }
        if (def && def.field) out.push(def);
    });
    return out;
}

function reorderFornecedorGroupsBeforeCriterios() {
    var mr = GMRENDAVALIACOESCOT;
    if (!mr || !mr.GTable || !mr.GTable.getColumnDefinitions) return;

    var defs = mr.GTable.getColumnDefinitions() || [];
    if (!defs.length) return;

    var leafs = getLeafColumnDefs(defs, []);
    if (!leafs.length) return;

    var baseCols = [];
    var criterioCols = [];
    var fornecedorOrder = [];
    var fornecedorMap = {};

    leafs.forEach(function (colDef) {
        var field = String(colDef.field || "");
        var mDeb = /^debito___(.+)debito$/.exec(field);
        var mTot = /^nome___(.+)nome$/.exec(field);

        if (mDeb && mDeb[1]) {
            var noDeb = mDeb[1];
            if (!fornecedorMap[noDeb]) {
                fornecedorMap[noDeb] = { debito: null, total: null };
                fornecedorOrder.push(noDeb);
            }
            fornecedorMap[noDeb].debito = $.extend(true, {}, colDef, { title: "Preço Unitário" });
            return;
        }

        if (mTot && mTot[1]) {
            var noTot = mTot[1];
            if (!fornecedorMap[noTot]) {
                fornecedorMap[noTot] = { debito: null, total: null };
                fornecedorOrder.push(noTot);
            }
            fornecedorMap[noTot].total = $.extend(true, {}, colDef, { title: "Total" });
            return;
        }

        if (field.indexOf("criterio___criterio_") === 0) {
            criterioCols.push(colDef);
            return;
        }

        baseCols.push(colDef);
    });

    var fornecedorGroups = fornecedorOrder.map(function (no) {
        var g = fornecedorMap[no] || {};
        var cols = [];
        if (g.debito) cols.push(g.debito);
        if (g.total) cols.push(g.total);
        return {
            title: getFornecedorNomeByNo(no) || no,
            columns: cols
        };
    }).filter(function (g) {
        return g.columns && g.columns.length;
    });

    var finalDefs = baseCols.concat(fornecedorGroups);
    if (criterioCols.length) {
        finalDefs.push({ title: "Avaliação", columns: criterioCols });
    }

    if (!fornecedorGroups.length) return;
    mr.GTable.setColumns(finalDefs);
}

function getCriteriosFromControl() {
    var out = [];
    var seen = {};

    $("#u_avcrit option:selected").each(function () {
        var codigo = String($(this).val() || "").trim();
        var descricao = String($(this).text() || "").trim();
        if (!codigo) {
            codigo = descricao;
        }
        if (!codigo || seen[codigo]) return;
        seen[codigo] = true;
        out.push({ codigo: codigo, descricao: descricao || codigo });
    });

    return out;
}

function collectCriteriosAtuais(avcritFlat) {
    var selecionados = getCriteriosFromControl();
    if (selecionados.length) {
        return selecionados;
    }

    var map = {};

    (typeof GCriteriosAvaliacao !== "undefined" && GCriteriosAvaliacao || []).forEach(function (c) {
        var cod = String(c && (c.codigo || c.descricao) || "").trim();
        if (cod && !map[cod]) map[cod] = { codigo: cod, descricao: c.descricao || cod };
    });

    (avcritFlat || []).forEach(function (r) {
        var cod = String(r && r.codcrit || "").trim();
        if (cod && !map[cod]) map[cod] = { codigo: cod, descricao: r.desccrit || cod };
    });

    getCriteriosFromControl().forEach(function (c) {
        var cod = String(c && c.codigo || "").trim();
        if (cod && !map[cod]) map[cod] = { codigo: cod, descricao: c.descricao || cod };
    });

    return Object.keys(map).map(function (k) { return map[k]; });
}

function ensureCriteriosColumnsAndCells() {
    var mr = GMRENDAVALIACOESCOT;
    if (!mr || !mr.GTable) return;

    var bostamp = getRecordStamp();
    var saved = bostamp ? getAvaliacaoCotacoes(bostamp) : { avcrit: [] };
    var criterios = collectCriteriosAtuais(saved.avcrit || []);
    if (!criterios.length) return;

    var existentes = {};
    (mr.GRenderedColunas || []).forEach(function (c) {
        var m = /^criterio___criterio_(.+)$/.exec(String(c && c.codigocoluna || ""));
        if (m && m[1]) existentes[m[1]] = true;
    });

    var missing = criterios.filter(function (c) {
        return !existentes[String(c.codigo || "").trim()];
    });

    var ativos = {};
    criterios.forEach(function (c) {
        var cod = String(c && c.codigo || "").trim();
        if (cod) ativos[cod] = true;
    });

    var extra = [];
    (mr.GRenderedColunas || []).forEach(function (c) {
        var m = /^criterio___criterio_(.+)$/.exec(String(c && c.codigocoluna || ""));
        if (m && m[1] && !ativos[m[1]]) {
            extra.push("criterio___criterio_" + m[1]);
        }
    });

    extra.forEach(function (codCol) {
        try { mr.deleteColuna(codCol); } catch (e) { console.warn("Erro ao remover coluna critério", codCol, e); }
    });

    if (missing.length) {
        addColunasCriterios(missing);
    }

    mr.whenReady(function () {
        var rows = mr.GTable.getRows ? mr.GTable.getRows() : [];
        var changedAny = false;

        rows.forEach(function (row) {
            var data = row.getData ? row.getData() : {};
            var patch = {};

            criterios.forEach(function (c) {
                var key = "criterio___criterio_" + c.codigo;
                if (data[key] === undefined) {
                    patch[key] = "";
                }
            });

            var rowPreview = $.extend({}, data, patch);
            var autoPreco = getAutoPrecoCriterioUpdates(rowPreview, criterios, []);
            Object.keys(autoPreco).forEach(function (k) {
                if (isEmptyValue(data[k])) {
                    patch[k] = autoPreco[k];
                }
            });

            if (Object.keys(patch).length) {
                changedAny = true;
                row.update(patch);
            }
        });

        if (changedAny || missing.length || extra.length) {
            persistCellsToIndexedDB(mr.GTable.getData());
            mr.GTable.redraw(true);
        }

        reorderFornecedorGroupsBeforeCriterios();
    });
}

// ============================================================
// Inicialização principal
// ============================================================

function initGrelhaAvaliacaoCotacoes() {
    if (!isDocType(43)) return;

    $("#u_avcrit").hide();
   /* $("#campos > .row:last").after(
        "<div style='margin-top:2.5em' class='row table-responsive sourceTabletableContainer'>" +
        "<div id='mrend-report-container'></div></div>"
    );*/

     $("#dataArea").before(
        "<div style='margin-top:2.5em' class='row table-responsive sourceTabletableContainer'>" +
        "<div id='mrend-report-container'></div></div>"
    );

    var bostamp = getRecordStamp();

    inicializarMrendBycodigo({
        codigo: "Avaliação da cotação",
        containerToRender: "#mrend-report-container",
        mrendOptions: {
            resetSourceStamp: false,
            recordData: { stamp: bostamp || ("novo_" + Date.now()) }
        },
        onSuccess: function (mrend) {
            GMRENDAVALIACOESCOT = mrend;

            // Verificar se IndexedDB realmente tem registos (pode ter sido limpo manualmente ou corrompido)
            mrend.db[mrend.tableSourceName].count().then(function (dbCount) {
                var jaCarregado = dbCount > 0 && mrend.GRenderedLinhas && mrend.GRenderedLinhas.length > 0;

                if (!jaCarregado) {
                    try {
                        buildAndRenderAvaliacao(getState());
                    } catch (err) {
                        console.error("Erro ao construir grelha de avaliação", err);
                    }
                } else {
                    console.log("initGrelha: " + dbCount + " registos no IndexedDB, skip build");
                    var state = getState();
                    if (state !== "consultar") registerClickGravarRelatorio();
                }

                mrend.whenReady(function () { registarPersistenciaCelulas(); });
                mrend.whenReady(function () { reorderFornecedorGroupsBeforeCriterios(); });
                mrend.whenReady(function () { ensureCriteriosColumnsAndCells(); });

                $(document).off("change", "#u_avcrit").on("change", "#u_avcrit", function () {
                    ensureCriteriosColumnsAndCells();
                });
            });

            $(document).off("click", "#BUCANCELARBottom").on("click", "#BUCANCELARBottom", function () {
                try { clearAllSourcesByInstance(mrend); } catch (e) { }
                __doPostBack('ctl00$conteudo$options5$BUCANCELARBottom', '');
            });
        }
    });
}

// ============================================================
// Hook: persistir edições individuais de células no Dexie
// ============================================================

function registarPersistenciaCelulas() {
    var mrend = GMRENDAVALIACOESCOT;
    if (!mrend || !mrend.GTable) return;
    var db = mrend.db, tbl = mrend.tableSourceName;
    if (!db || !tbl) return;

    mrend.GTable.on("cellEdited", function (cell) {
        var field = cell.getField();
        var rowid = String(cell.getRow().getData().rowid || "");
        var val = cell.getValue();

        db[tbl].where("rowid").equals(rowid)
            .filter(function (r) { return r.coluna === field; })
            .first()
            .then(function (r) {
                if (r) { r[r.campo] = val; r.valor = val; return db[tbl].put(r); }
            })
            .catch(function (e) { console.warn("Erro ao persistir célula editada", e); });
    });
}

// ============================================================
// Construir e renderizar grelha (unificado para todos os modos)
// ============================================================

function buildAndRenderAvaliacao(state) {
    // 1) Obter dados do servidor
    var data = fetchAvaliacaoData(state);

    if (!data.uiObjects || data.uiObjects.length === 0) {
        console.warn("buildAndRenderAvaliacao: sem dados para renderizar");
        return;
    }

    // 2) Colunas dinâmicas
    if (data.fornecedores.length) addColunasFornecedores(data.fornecedores);
    if (data.criterios.length) addColunasCriterios(data.criterios);
    GMRENDAVALIACOESCOT.whenReady(function () { reorderFornecedorGroupsBeforeCriterios(); });
    GMRENDAVALIACOESCOT.whenReady(function () { ensureCriteriosColumnsAndCells(); });

    // 3) Linhas
    var linhaModelo = GMRENDAVALIACOESCOT.reportConfig.config.linhas.find(function (l) { return l.modelo; });
    if (!linhaModelo) { console.warn("Linha modelo não encontrada"); return; }

    data.uiObjects.forEach(function (ui) {
        addLinhaPreservandoDinamicas(linhaModelo.codigo, ui);
    });

    // 4) Botão gravar (exceto consulta)
    if (state !== "consultar") registerClickGravarRelatorio();

    // 5) Persistir no IndexedDB + redraw
    var uiObjectsRef = data.uiObjects;
    GMRENDAVALIACOESCOT.whenReady(function () {
        persistCellsToIndexedDB(uiObjectsRef);
        GMRENDAVALIACOESCOT.GTable.redraw(true);
    });
}

// ============================================================
// Fetch + merge de dados (cotações atuais + salvos no servidor)
// ============================================================

function fetchAvaliacaoData(state) {
    var bostamp = getRecordStamp();
    var requisicao = $("#ctl00_conteudo_u_requis_mLabel1").text();

    var cotacoes = (state !== "consultar") ? getRequisicoesByCotacao(requisicao) : [];
    var saved = bostamp ? getAvaliacaoCotacoes(bostamp) : { bi: [], avcrit: [] };
    var biFlat = saved.bi || [];
    var avcritFlat = saved.avcrit || [];

    // Fornecedores (union cotações + saved)
    var fornMap = {};
    cotacoes.concat(biFlat).forEach(function (r) {
        var no = String(r.no || "").trim();
        if (no && !fornMap[no]) fornMap[no] = { no: r.no, nome: (r.nome || "").trim() };
    });
    var fornecedores = Object.keys(fornMap).map(function (k) { return fornMap[k]; });
    rememberFornecedoresNomes(fornecedores);

    // Critérios (formulário + saved)
    var critMap = {};
    (typeof GCriteriosAvaliacao !== "undefined" && GCriteriosAvaliacao || []).forEach(function (c) {
        var cod = String(c.codigo || c.descricao || "").trim();
        if (cod) critMap[cod] = { codigo: cod, descricao: c.descricao || cod };
    });
    avcritFlat.forEach(function (r) {
        var cod = String(r.codcrit || "").trim();
        if (cod && !critMap[cod]) critMap[cod] = { codigo: cod, descricao: r.desccrit || cod };
    });
    var criterios = Object.keys(critMap).map(function (k) { return critMap[k]; });

    // Merge por ref
    var curByRef = _.groupBy(cotacoes, function (r) { return String(r.ref || "").trim(); });
    var savByRef = _.groupBy(biFlat, function (r) { return String(r.ref || "").trim(); });

    // Critérios gravados por ref
    var savCritByRef = {};
    Object.keys(savByRef).forEach(function (ref) {
        var stamps = {};
        (savByRef[ref] || []).forEach(function (i) { if (i.bistamp) stamps[i.bistamp] = true; });
        savCritByRef[ref] = {};
        avcritFlat.forEach(function (c) {
            if (c.bistamp && c.codcrit && stamps[c.bistamp] && savCritByRef[ref][c.codcrit] == null)
                savCritByRef[ref][c.codcrit] = c.status != null ? c.status : (c.STATUS || "");
        });
    });

    // Union de todas as refs
    var allRefsMap = {};
    Object.keys(curByRef).concat(Object.keys(savByRef)).forEach(function (r) { if (r) allRefsMap[r] = true; });

    // Construir UIObjects
    var especifRenderedMap = (GMRENDAVALIACOESCOT && GMRENDAVALIACOESCOT.GRenderedColunas || []).filter(function (c) {
        var codigo = String(c && c.codigocoluna || "").toLowerCase();
        var campo = String(c && c.config && c.config.campo || "").toLowerCase();
        return codigo.indexOf("especif") !== -1 || campo.indexOf("especif") !== -1;
    }).map(function (c) {
        return {
            codigocoluna: c.codigocoluna,
            campo: c && c.config ? c.config.campo : ""
        };
    });

    if (especifRenderedMap.length) {
        console.log("[AvaliacaoCotacoes][fetch] mapa colunas especif:", especifRenderedMap);
    }

    var uiObjects = [];
    Object.keys(allRefsMap).forEach(function (ref) {
        var cur = curByRef[ref] || [];
        var sav = savByRef[ref] || [];
        var base = cur[0] || sav[0] || {};
        var rowid = (sav[0] && sav[0].bistamp) || generateUUID();
        var qtt = toNum(base.qtt);

        var ui = { rowid: rowid, id: rowid, ref: ref, design: String(base.design || "").trim(), qtt: qtt };

        // Merge de campos estáticos (não dinâmicos): saved -> current
        // para manter no grid campos adicionais configurados no MRend.
        mergeNonDynamicFields(ui, sav[0] || {});
        mergeNonDynamicFields(ui, cur[0] || {});

        // Garantir campos-base coerentes para o render.
        ui.ref = ref;
        ui.design = String((ui.design != null ? ui.design : base.design) || "").trim();
        ui.qtt = toNum(ui.qtt != null ? ui.qtt : qtt);
        normalizeUiByColumnFieldMap(ui);

        // Diagnóstico: rastrear campos "especif" da origem até ao UI final.
        if (
            base.u_especif !== undefined ||
            (cur[0] && cur[0].u_especif !== undefined) ||
            (sav[0] && sav[0].u_especif !== undefined) ||
            ui.u_especif !== undefined ||
            Object.keys(ui).some(function (k) { return String(k).toLowerCase().indexOf("especif") !== -1; })
        ) {
            var uiEspecifKeys = {};
            Object.keys(ui).forEach(function (k) {
                if (String(k).toLowerCase().indexOf("especif") !== -1) {
                    uiEspecifKeys[k] = ui[k];
                }
            });

            console.log("[AvaliacaoCotacoes][fetch][especif]", {
                ref: ref,
                base_u_especif: base.u_especif,
                cur_u_especif: cur[0] ? cur[0].u_especif : undefined,
                sav_u_especif: sav[0] ? sav[0].u_especif : undefined,
                ui_u_especif: ui.u_especif,
                ui_especif_keys: uiEspecifKeys
            });
        }

        // Fornecedores: current tem prioridade sobre saved
        var curNo = _.keyBy(cur, function (i) { return String(i.no || "").trim(); });
        var savNo = _.keyBy(sav, function (i) { return String(i.no || "").trim(); });
        fornecedores.forEach(function (f) {
            var no = String(f.no || "").trim();
            var item = curNo[no] || savNo[no];
            if (!item) return;
            var ed = toNum(item.edebito);
            ui["debito___" + no + "debito"] = ed;
            ui["nome___" + no + "nome"] = ed * qtt;
        });

        // Critérios
        var cRef = savCritByRef[ref] || {};
        criterios.forEach(function (c) {
            ui["criterio___criterio_" + c.codigo] = cRef[c.codigo] || "";
        });

        var autoPreco = getAutoPrecoCriterioUpdates(ui, criterios, fornecedores);
        Object.keys(autoPreco).forEach(function (k) {
            ui[k] = autoPreco[k];
        });

        uiObjects.push(ui);
    });

    return { fornecedores: fornecedores, criterios: criterios, uiObjects: uiObjects };
}

// ============================================================
// Wrapper: preservar dynamic keys contra buildDefaultCelula
// ============================================================

function addLinhaPreservandoDinamicas(modelo, ui) {
    var saved = {};
    Object.keys(ui).forEach(function (k) {
        if (k.indexOf("___") !== -1) saved[k] = ui[k];
    });
    GMRENDAVALIACOESCOT.addLinhaComRegistos(modelo, ui);
    Object.keys(saved).forEach(function (k) { ui[k] = saved[k]; });
}

// ============================================================
// Colunas dinâmicas: fornecedores
// ============================================================

function addColunasFornecedores(fornecedores) {
    var cfgDebito = findColunaConfig("debito");
    var cfgNome = findColunaConfig("nome");
    if (!cfgDebito || !cfgNome) return;

    var maxOrdem = getMaxOrdemColuna() + 1;
    var novas = [];

    fornecedores.forEach(function (f, idx) {
        var no = f.no;
        var stampBase = getFornecedorStampBase(no);

        var cfgDebitoDyn = $.extend(true, {}, cfgDebito, { colunastamp: "forn_" + stampBase + "_debito" });
        var cfgTotalDyn = $.extend(true, {}, cfgNome, { colunastamp: "forn_" + stampBase + "_total" });

        ensureFornecedorGroupConfig(
            no,
            String(f.nome || "").trim(),
            cfgDebitoDyn.colunastamp,
            cfgTotalDyn.colunastamp,
            maxOrdem + (idx * 2)
        );

        var colD = criarColunaSemDuplicar("debito___" + no + "debito", "Preço Unitário", cfgDebitoDyn, maxOrdem++, novas);
        if (colD) novas.push(colD);

        var colN = criarColunaSemDuplicar("nome___" + no + "nome", "Total", cfgTotalDyn, maxOrdem++, novas);
        if (colN) novas.push(colN);
    });

    if (novas.length) GMRENDAVALIACOESCOT.addColunasByModelo(novas);
}

// ============================================================
// Colunas dinâmicas: critérios
// ============================================================

function addColunasCriterios(criterios) {
    var cfg = findColunaConfig("criterio");
    if (!cfg) return;

    var critCfg = $.extend(true, {}, cfg, { levadesclinha: false, atributo: "" });
    var maxOrdem = getMaxOrdemColuna() + 1;
    var novas = [];

    criterios.forEach(function (c) {
        var col = criarColunaSemDuplicar("criterio___criterio_" + c.codigo, c.descricao, critCfg, maxOrdem++, novas);
        if (col) novas.push(col);
    });

    if (novas.length) GMRENDAVALIACOESCOT.addColunasByModelo(novas);
}

// ============================================================
// Helpers de colunas
// ============================================================

function findColunaConfig(codigo) {
    return GMRENDAVALIACOESCOT.reportConfig.config.colunas.find(function (c) {
        return c.codigocoluna === codigo;
    });
}

function getMaxOrdemColuna() {
    return GMRENDAVALIACOESCOT.GRenderedColunas.reduce(function (m, c) {
        return Math.max(m, c.ordem || 0);
    }, 0);
}

function criarColunaSemDuplicar(codigo, desc, cfg, ordem, batch) {
    var col = GMRENDAVALIACOESCOT.setNewRenderedColuna({
        codigocoluna: codigo, desccoluna: desc, config: cfg, ordem: ordem
    });
    var existe = GMRENDAVALIACOESCOT.GRenderedColunas.some(function (c) {
        return c.codigocoluna === col.codigocoluna;
    }) || (batch || []).some(function (c) {
        return c.codigocoluna === col.codigocoluna;
    });
    return existe ? null : col;
}

// ============================================================
// Persistir todas as células no IndexedDB (clean write)
// ============================================================

function persistCellsToIndexedDB(uiObjects) {
    var mrend = GMRENDAVALIACOESCOT;
    if (!mrend || !mrend.db || !mrend.tableSourceName) return;

    var cells = [];
    uiObjects.forEach(function (ui) {
        var rowid = String(ui.rowid || "");

        mrend.GRenderedColunas.forEach(function (col) {
            var codigo = col.codigocoluna;
            var modelCode = (col.config && col.config.codigocoluna) || codigo;
            var campo = (col.config && col.config.campo) || codigo;
            var isCrit = modelCode === "criterio";
            var valor = ui[codigo] !== undefined ? ui[codigo] : (ui[campo] !== undefined ? ui[campo] : "");

            var cell = {
                cellId: generateUUID(),
                coluna: codigo,
                rowid: rowid,
                sourceTable: isCrit ? "u_avcrit" : ((col.config && col.config.sourceTable) || mrend.dbTableToMrendObject.table),
                sourceKey: isCrit ? "u_avcritstamp" : ((col.config && col.config.sourceKey) || mrend.dbTableToMrendObject.tableKey),
                sourceKeyValue: rowid,
                valor: valor,
                campo: campo,
                linkid: "", linkField: "",
                codigolinha: (function () {
                    var lm = mrend.reportConfig.config.linhas.find(function (l) { return l.modelo; });
                    return lm ? lm.codigo : "";
                })(),
                ordemField: "",
                descColuna: col.desccoluna || "",
                descColunaField: "", cellIdField: "", rowIdField: "",
                colunaField: "", linhaField: "", ordemColunaField: "",
                ordemcoluna: col.ordem || 0,
                ordem: 0,
                tipocolField: "",
                tipocol: (col.config && col.config.tipo) || "text"
            };
            cell[campo] = valor;
            cells.push(cell);
        });
    });

    if (!cells.length) return;

    mrend.db[mrend.tableSourceName].clear()
        .then(function () { return mrend.db[mrend.tableSourceName].bulkPut(cells); })
        .then(function () { console.log("persistCellsToIndexedDB: " + cells.length + " cells"); })
        .catch(function (e) { console.error("persistCellsToIndexedDB erro:", e); });
}

// ============================================================
// Backend calls
// ============================================================

function getRequisicoesByCotacao(requisicao) {
    var result = [];
    $.ajax({
        type: "POST", async: false,
        url: "../programs/gensel.aspx?cscript=getdossiercotacoes",
        data: { '__EVENTARGUMENT': JSON.stringify([{ requisicao: requisicao }]) },
        success: function (r) {
            try {
                if (r.cod === "0000") { result = r.data || []; GREQUISICOES = result; }
                else console.warn("getRequisicoesByCotacao erro:", r);
            } catch (e) { console.error("getRequisicoesByCotacao:", e); }
        }
    });
    return result;
}

function getAvaliacaoCotacoes(bostamp) {
    var result = { bi: [], avcrit: [] };
    $.ajax({
        type: "POST", async: false,
        url: "../programs/gensel.aspx?cscript=getavaliacaocotacoes",
        data: { '__EVENTARGUMENT': JSON.stringify([{ bostamp: bostamp }]) },
        success: function (r) {
            try {
                if (r.cod === "0000") { result.bi = r.bi || []; result.avcrit = r.avcrit || []; }
                else console.warn("getAvaliacaoCotacoes erro:", r);
            } catch (e) { console.error("getAvaliacaoCotacoes:", e); }
        }
    });
    return result;
}

function getFornecedoresRequisicoes() {
    if (!GREQUISICOES || !GREQUISICOES.length) {
        var requisicao = $("#ctl00_conteudo_u_requis_mLabel1").text();
        if (requisicao) getRequisicoesByCotacao(requisicao);
    }
    var resultado = [{ nome: "" }];
    var vistos = {};
    GREQUISICOES.forEach(function (r) {
        var nome = (r.nome || "").trim();
        if (nome && !vistos[nome]) { vistos[nome] = true; resultado.push({ nome: nome }); }
    });
    return resultado;
}

// ============================================================
// Gravar (decomposição wide → flat para o servidor)
// ============================================================

function registerClickGravarRelatorio() {
    $("#BUGRAVARBottom").removeAttr("href");

    $(document).off("click", "#BUGRAVARBottom").on("click", "#BUGRAVARBottom", function () {

        GMRENDAVALIACOESCOT.getDbData().then(function (reportData) {
            var biSource = reportData.find(function (s) { return s.sourceTable !== "u_avcrit"; });
            var biRecords = (biSource && biSource.records) || [];
            var tbl = GMRENDAVALIACOESCOT.GTable;
            var tableRows = tbl && tbl.getData ? tbl.getData() : [];
            var rowsByRef = {};
            tableRows.forEach(function (r) {
                var ref = String(r.ref || "").trim();
                if (ref) rowsByRef[ref] = r;
            });

            // Fornecedores do grid ou de GREQUISICOES
            var fornecedores = _.uniqBy(GREQUISICOES, "no");
            if (!fornecedores.length) {
                var nos = {};
                tableRows.forEach(function (r) {
                    Object.keys(r || {}).forEach(function (k) {
                        var m = /^debito___(.+)debito$/.exec(k);
                        if (m && m[1]) nos[m[1]] = true;
                    });
                });
                fornecedores = Object.keys(nos).map(function (no) {
                    return { no: no, nome: getFornecedorNomeByNo(no) };
                });
            }

            // Decompor wide rows: 1 bi por ref × fornecedor
            var biDecomp = [];
            biRecords.forEach(function (wide) {
                var origStamp = wide[biSource.sourceKey] || "";
                var isFirst = true;
                var ref = String(wide.ref || "").trim();
                var src = rowsByRef[ref] || wide;

                fornecedores.forEach(function (f) {
                    var no = f.no;
                    var rec = {};

                    // Merge de campos estáticos:
                    // 1) base vindo do registo wide (servidor)
                    // 2) override com valores atuais da linha no grid
                    mergeNonDynamicFields(rec, wide);
                    mergeNonDynamicFields(rec, src);

                    rec[biSource.sourceKey] = isFirst ? origStamp : generateUUID();
                    isFirst = false;
                    rec.no = no;
                    rec.nome = (f.nome || "").trim();
                    rec.edebito = toNum(src["debito___" + no + "debito"] || wide["debito___" + no + "debito"]);
                    rec.debito = toNum(src["nome___" + no + "nome"] || wide["nome___" + no + "nome"]);
                    delete rec[""];
                    biDecomp.push(rec);
                });
            });

            // Critérios do Dexie
            GMRENDAVALIACOESCOT.db[GMRENDAVALIACOESCOT.tableSourceName].toArray().then(function (raw) {
                var critRecords = raw.filter(function (r) { return r.sourceTable === "u_avcrit"; }).map(function (c) {
                    return {
                        u_avcritstamp: c.cellId || "",
                        bistamp: c.rowid || "",
                        bostamp: "",
                        codcrit: (c.coluna || "").replace("criterio___criterio_", ""),
                        desccrit: c.descColuna || "",
                        status: c[c.campo] || ""
                    };
                });

                var bi2Records = biDecomp.map(function (r) {
                    return { bi2stamp: r[biSource.sourceKey] || "", bostamp: getRecordStamp() };
                });

                var payload = [
                    { instance: "bi", data: [{ sourceTable: "bi", sourceKey: biSource.sourceKey, records: biDecomp }] },
                    { instance: "bi2", data: [{ sourceTable: "bi2", sourceKey: "bi2stamp", records: bi2Records }] },
                    { instance: "u_avcrit", data: critRecords.length ? [{ sourceTable: "u_avcrit", sourceKey: "u_avcritstamp", records: critRecords }] : [] }
                ];

                console.log("Payload para gravar:", payload);
                persistRecord(payload);
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
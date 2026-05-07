// ============================================================
// MREPORT CONFIG LIB.js
// Classes de configuraÃ§Ã£o e funÃ§Ãµes de suporte ao editor de
// relatÃ³rios (Mreport 1.0).
// PadrÃ£o baseado no MRENDCONFIG LIB.js do Mrend.
// ============================================================


// ------------------------------------------------------------
// UIObjectFormConfig â€” descriptor de um campo do modal
// ------------------------------------------------------------
function UIObjectFormConfig(data) {
    this.campo        = data.campo        || "";
    this.tipo         = data.tipo         || "text";  // text | digit | checkbox | select | textarea
    this.titulo       = data.titulo       || "";
    this.classes      = data.classes      || "";
    this.customData   = data.customData   || "";
    this.style        = data.style        || "";
    this.colSize      = data.colSize      || 6;
    this.selectValues = data.selectValues || [];   // [{option, value}]
    this.fieldToOption = data.fieldToOption || "option";
    this.fieldToValue  = data.fieldToValue  || "value";
    this.contentType  = data.contentType  || "input"; // input | select | textarea | checkbox
}


// ------------------------------------------------------------
// ColunaRelConfig â€” representa uma coluna do relatÃ³rio
// Tabela BD: u_colunarel
// ------------------------------------------------------------
function ColunaRelConfig(data) {
    this.u_colunarelstamp = data.u_colunarelstamp || generateUUID();
    this.syncstamp        = data.syncstamp        || getSyncstamp();
    this.codigo           = data.codigo           || "";
    this.valor            = data.valor            || "";  // nome visÃ­vel na coluna
    this.ordem            = data.ordem            || 0;
}

function getColunaRelUIConfig() {
    return [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text",  titulo: "CÃ³digo",    classes: "form-control input-sm" }),
        new UIObjectFormConfig({ colSize: 5, campo: "valor",  tipo: "text",  titulo: "Nome",      classes: "form-control input-sm" }),
        new UIObjectFormConfig({ colSize: 3, campo: "ordem",  tipo: "digit", titulo: "Ordem",     classes: "form-control input-sm" }),
    ];
}


// ------------------------------------------------------------
// GrupoRelConfig â€” representa um grupo ou subgrupo do relatÃ³rio
// Tabela BD: u_gruporel
// ------------------------------------------------------------
function GrupoRelConfig(data) {
    this.u_gruporelstamp = data.u_gruporelstamp || generateUUID();
    this.syncstamp       = data.syncstamp       || getSyncstamp();
    this.descricao       = data.descricao       || "";
    this.tipodado        = data.tipodado        || "text";   // text | digit
    this.temcalculo      = data.temcalculo      || false;
    this.temtotais       = data.temtotais       || false;
    this.expressaogrupo  = data.expressaogrupo  || "";
    this.colunastotais   = data.colunastotais   || "";
    this.parent          = (data.parent !== undefined) ? data.parent : true;
    this.noderef         = data.noderef         || "";      // stamp do grupo pai (se subgrupo)
    this.ordem           = data.ordem           || 0;
}

function getGrupoRelUIConfig() {
    return [
        new UIObjectFormConfig({ colSize: 12, campo: "descricao",      tipo: "text",     titulo: "DescriÃ§Ã£o",           classes: "form-control input-sm" }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "tipodado",
            tipo: "select",
            titulo: "Tipo de dado",
            contentType: "select",
            classes: "form-control input-sm",
            selectValues: [
                { option: "Texto",   value: "text"  },
                { option: "NÃºmero",  value: "digit" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 3, campo: "temcalculo",      tipo: "checkbox", titulo: "Tem CÃ¡lculo",         classes: "" }),
        new UIObjectFormConfig({ colSize: 3, campo: "temtotais",       tipo: "checkbox", titulo: "Tem Totais",          classes: "" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaogrupo", tipo: "textarea", titulo: "ExpressÃ£o do Grupo",  classes: "form-control input-sm" }),
        new UIObjectFormConfig({ colSize: 12, campo: "colunastotais",  tipo: "text",     titulo: "Colunas de Totais",   classes: "form-control input-sm" }),
    ];
}


// ------------------------------------------------------------
// CelulaConfig â€” representa uma cÃ©lula (intersecÃ§Ã£o linha Ã— coluna)
// Tabela BD: u_celula
// ------------------------------------------------------------
function CelulaConfig(data) {
    this.u_celulastamp  = data.u_celulastamp  || generateUUID();
    this.syncstamp      = data.syncstamp      || getSyncstamp();
    this.stamplinha     = data.stamplinha     || "";
    this.stampcoluna    = data.stampcoluna    || "";
    this.valor          = data.valor          || "";
    this.tipocelula     = data.tipocelula     || "text";   // text | digit
    this.calculo        = data.calculo        || false;
    this.valordinamico  = data.valordinamico  || "[]";
}

function getCelulaUIConfig() {
    return [
        new UIObjectFormConfig({ colSize: 12, campo: "valor",     tipo: "textarea", titulo: "Valor",        classes: "form-control input-sm" }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "tipocelula",
            tipo: "select",
            titulo: "Tipo",
            contentType: "select",
            classes: "form-control input-sm",
            selectValues: [
                { option: "Texto",   value: "text"  },
                { option: "NÃºmero",  value: "digit" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 6, campo: "calculo", tipo: "checkbox", titulo: "Tem CÃ¡lculo", classes: "" }),
    ];
}


// ------------------------------------------------------------
// LinhaRelConfig — representa uma linha do relatório
// Tabela BD: u_linha
// ------------------------------------------------------------
function LinhaRelConfig(data) {
    this.u_linhastamp     = data.u_linhastamp     || generateUUID();
    this.syncstamp        = data.syncstamp        || getSyncstamp();
    this.temgrupo         = (data.temgrupo === true || data.temgrupo === "true") || false;
    this.campoagrupamento = data.campoagrupamento || "";
    this.expressao        = data.expressao        || data.expressaolinha || "";
    this.ordem            = data.ordem            || data.ordemlinha     || 0;
    this.grupostamp       = data.grupostamp       || "";
}


// ------------------------------------------------------------
// FonteRelConfig â€” fonte de dados associada a um relatÃ³rio
// Tabelas BD: u_fontedados + u_relfonte
// ------------------------------------------------------------
function FonteRelConfig(data) {
    this.u_fontedadosstamp = data.u_fontedadosstamp || generateUUID();
    this.u_relfontestamp   = data.u_relfontestamp   || generateUUID();
    this.syncstamp         = data.syncstamp         || getSyncstamp();
    this.codigo            = data.codigo            || "";
    this.basequery         = data.basequery         || "";
    this.filtro            = data.filtro            || "";
}


// ------------------------------------------------------------
// ValorDinamicoConfig â€” entrada na expressÃ£o dinÃ¢mica de uma cÃ©lula
// Tipos: "Standard" (literal) | "Celula" (referÃªncia a outra cÃ©lula)
// ------------------------------------------------------------
function ValorDinamicoConfig(data) {
    this.id        = data.id        || generateUUID();
    this.tipo      = data.tipo      || "Standard";  // Standard | Celula
    this.descricao = data.descricao || "+";
    this.valor     = data.valor     || "+";
}


// ============================================================
// Estado reactivo global (PetiteVue)
// Inicializado em initMreportReactive() apÃ³s o DOM estar pronto
// ============================================================
var GMreportState = null;

function initMreportReactive() {
    GMreportState = PetiteVue.reactive({

        // â”€â”€ config activo no modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        activeConfig:   {},    // objecto em ediÃ§Ã£o (ColunaRelConfig | GrupoRelConfig | CelulaConfig)
        activeElement:  null,  // jQuery elem que foi clicado
        activeType:     "",    // "coluna" | "grupo" | "celula"
        activeTitle:    "",
        activeUIConfig: [],    // UIObjectFormConfig[] do tipo activo

        // â”€â”€ valores dinÃ¢micos da cÃ©lula activa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        valoresDinamicos:  [],
        selectCellMode:    false,
        valorDinamicoAlvo: null,

        // â”€â”€ listas lidas da BD (para buildSavePayload) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        colunas:         [],
        grupos:          [],
        linhas:          [],
        celulas:         [],
        fontes:          [],
        recordsToDelete: [],

        // -- modo de listagem actual + estado UI -------------------------
        tipoListagem:    "",      // "Fixa" | "Dinâmica" | "Grupo-Fixa"
        loadingListagem: false,

        // -- aplica activeConfig ao elemento HTML em tempo real ----------
        syncToElement: function () {
            var cfg = this.activeConfig;
            var $el = this.activeElement;
            if (!$el || !this.activeType) return;

            if (this.activeType === "coluna") {
                $el.attr("data-codigo", cfg.codigo);
                $el.attr("data-valor",  cfg.valor);
                $el.attr("data-ordem",  cfg.ordem);
                $el.text(cfg.valor);

            } else if (this.activeType === "grupo") {
                $el.attr("data-temcalculo",     cfg.temcalculo);
                $el.attr("data-temtotais",      cfg.temtotais);
                $el.attr("data-colunastotais",  cfg.colunastotais);
                $el.attr("data-tipodado",       cfg.tipodado);
                $el.attr("data-expressaogrupo", cfg.expressaogrupo);
                $el.find(".grupo-nome-span").text(cfg.descricao);

            } else if (this.activeType === "celula") {
                this.sincronizarValoresDinamicos();
                var $inp = $("#listagemTable tbody tr td input[data-celulaid='" + cfg.u_celulastamp + "']");
                $inp.val(cfg.valor);
                $inp.attr("data-temcalculo",    cfg.calculo);
                $inp.attr("data-tipo",          cfg.tipocelula);
                $inp.attr("data-valordinamico", cfg.valordinamico);
            }
        },

        // -- abrir modal ------------------------------------------------
        // Procura o objecto reactivo em colunas/grupos/celulas pelo stamp
        // recebido. Se existir, usa-o como activeConfig (edição flui para
        // o array). Caso contrário, usa o objecto recebido tal como veio.
        abrirColuna: function (coluna, $elem) {
            var existing = this.findColuna(coluna.u_colunarelstamp);
            this.activeConfig   = existing || coluna;
            this.activeElement  = $elem;
            this.activeType     = "coluna";
            this.activeTitle    = "Coluna";
            this.activeUIConfig = getColunaRelUIConfig();
            $("#modalConfigGlobal").modal("show");
        },

        abrirGrupo: function (grupo, $elem) {
            var existing = this.findGrupo(grupo.u_gruporelstamp);
            this.activeConfig   = existing || grupo;
            this.activeElement  = $elem;
            this.activeType     = "grupo";
            this.activeTitle    = "Grupo";
            this.activeUIConfig = getGrupoRelUIConfig();
            $("#modalConfigGlobal").modal("show");
        },

        abrirCelula: function (celula, $elem) {
            var existing = this.findCelula(celula.u_celulastamp);
            this.activeConfig   = existing || celula;
            this.activeElement  = $elem;
            this.activeType     = "celula";
            this.activeTitle    = "Célula";
            this.activeUIConfig = getCelulaUIConfig();
            try {
                this.valoresDinamicos = JSON.parse(this.activeConfig.valordinamico || "[]").map(function (vd) {
                    return new ValorDinamicoConfig(vd);
                });
            } catch (e) {
                this.valoresDinamicos = [];
            }
            $("#modalConfigGlobal").modal("show");
        },

        // â”€â”€ valores dinÃ¢micos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        adicionarValorDinamico: function () {
            this.valoresDinamicos.push(new ValorDinamicoConfig({}));
            this.sincronizarValoresDinamicos();
        },

        removerValorDinamico: function (id) {
            this.valoresDinamicos = this.valoresDinamicos.filter(function (vd) {
                return vd.id !== id;
            });
            this.sincronizarValoresDinamicos();
        },

        sincronizarValoresDinamicos: function () {
            if (this.activeType === "celula") {
                this.activeConfig.valordinamico = JSON.stringify(this.valoresDinamicos);
            }
        },

        // -- payload para ACTUALIZAR MREPORT ----------------------------
        // Lê dos arrays reactivos (não do DOM). Garante syncstamp em todos.
        buildSavePayload: function (syncstamp) {
            var self = this;
            self.sincronizarValoresDinamicos();
            self.syncCelulasFromDOM();   // garante valores actuais dos inputs

            var stamp = syncstamp || getSyncstamp();
            function withSync(rec) { rec.syncstamp = stamp; return rec; }

            return [{
                sourceTable: "u_colunarel", sourceKey: "u_colunarelstamp",
                records: self.colunas.map(function (c) { return withSync(new ColunaRelConfig(c)); })
            }, {
                sourceTable: "u_gruporel", sourceKey: "u_gruporelstamp",
                records: self.grupos.map(function (g) { return withSync(new GrupoRelConfig(g)); })
            }, {
                sourceTable: "u_linha", sourceKey: "u_linhastamp",
                records: self.linhas.map(function (l) { return withSync(new LinhaRelConfig(l)); })
            }, {
                sourceTable: "u_celula", sourceKey: "u_celulastamp",
                records: self.celulas.map(function (c) { return withSync(new CelulaConfig(c)); })
            }];
        },

        // -- populadores a partir da resposta do servidor ---------------
        populateFromListagem: function (response, tipo) {
            var self = this;
            var data = response.data || [];
            var grupos = response.grupos || [];

            if (tipo) self.tipoListagem = tipo;

            // colunas únicas
            var colunasRaw = _.uniqBy(data, function (v) { return v.u_colunarelstamp; });
            self.colunas = colunasRaw.map(function (c) {
                return new ColunaRelConfig({
                    u_colunarelstamp: c.u_colunarelstamp,
                    codigo:           c.codigocoluna,
                    valor:            c.valorcoluna,
                    ordem:            c.ordemcoluna
                });
            });

            // grupos
            self.grupos = grupos.map(function (g) { return new GrupoRelConfig(g); });

            // linhas únicas
            var linhasRaw = _.uniqBy(data, function (v) { return v.u_linhastamp; });
            self.linhas = linhasRaw.map(function (l) {
                return new LinhaRelConfig({
                    u_linhastamp:     l.u_linhastamp,
                    temgrupo:         l.temgrupo,
                    campoagrupamento: l.campoagrupamento,
                    expressao:        l.expressaolinha,
                    ordem:            l.ordemlinha,
                    grupostamp:       l.grupostamp || ""
                });
            });

            // células (uma por intersecção real)
            self.celulas = data
                .filter(function (d) { return d.u_celulastamp; })
                .map(function (d) {
                    return new CelulaConfig({
                        u_celulastamp: d.u_celulastamp,
                        stamplinha:    d.u_linhastamp,
                        stampcoluna:   d.u_colunarelstamp,
                        valor:         d.valorcelula,
                        tipocelula:    d.tipocelula,
                        calculo:       d.calculo,
                        valordinamico: d.valordinamico || "[]"
                    });
                });

            // garantir que todas as combinações linha×coluna têm célula
            self.ensureCelulasGrelha();
        },

        // -- lê valores actuais dos inputs e actualiza array celulas ----
        syncCelulasFromDOM: function () {
            var self = this;
            $("#listagemTable .celula-inpt").each(function () {
                var stamp = $(this).attr("data-celulaid");
                if (!stamp) return;
                var cel = self.findCelula(stamp);
                if (cel) {
                    cel.valor = $(this).val();
                } else {
                    self.celulas.push(new CelulaConfig({
                        u_celulastamp: stamp,
                        stamplinha:    $(this).closest("tr").attr("id"),
                        stampcoluna:   $(this).attr("data-colunaid"),
                        valor:         $(this).val(),
                        tipocelula:    $(this).attr("data-tipo")          || "text",
                        calculo:       $(this).attr("data-temcalculo")    === "true",
                        valordinamico: $(this).attr("data-valordinamico") || "[]"
                    }));
                }
            });
        },

        // -- lookup helpers ---------------------------------------------
        findColuna: function (stamp) { return this.colunas.find(function (c) { return c.u_colunarelstamp === stamp; }); },
        findGrupo:  function (stamp) { return this.grupos .find(function (g) { return g.u_gruporelstamp  === stamp; }); },
        findLinha:  function (stamp) { return this.linhas .find(function (l) { return l.u_linhastamp     === stamp; }); },
        findCelula: function (stamp) { return this.celulas.find(function (c) { return c.u_celulastamp    === stamp; }); },

        // -- view helpers (consumidos pelo template PetiteVue) -----------
        sortedColunas: function () {
            return this.colunas.slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
        },
        linhasSoltas: function () {
            return this.linhas
                .filter(function (l) { return !l.grupostamp; })
                .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
        },
        gruposParent: function () {
            return this.grupos
                .filter(function (g) { return g.parent === true || !g.noderef; })
                .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
        },
        // Helpers para o template: devolvem [] no modo errado, evitando v-if no <tr>
        linhasSoltasParaRender: function () {
            if (this.tipoListagem === "Grupo-Fixa") return [];
            return this.linhasSoltas();
        },
        itemsGrupoFixaParaRender: function () {
            // Devolve array intercalado de grupos + linhas na ordem correta para o treetable.
            // Cada item tem _key e _fullTrHtml (TR completo com atributos e conteúdo).
            if (this.tipoListagem !== "Grupo-Fixa") return [];
            
            var self = this;
            var result = [];
            var parentsFirst = this.grupos.filter(function (g) { return g.parent === true || !g.noderef; })
                                          .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
            
            function addGroupWithDescendants(grupo) {
                // 1. Adicionar o grupo
                grupo._tipo = "grupo";
                var isChild = !!grupo.noderef;
                var classGrupo = isChild ? "subgrupo-item" : "grupo-item";
                var classTd = isChild ? "subg-grupo-conf" : "grupo-conf";
                
                // Construir TR completo do grupo
                var trHtml = "<tr data-tt-id='" + grupo.u_gruporelstamp + "'";
                if (grupo.noderef) {
                    trHtml += " data-tt-parent-id='" + grupo.noderef + "'";
                }
                trHtml += " data-parent='" + (grupo.parent || false) + "'";
                trHtml += " data-grupoid='" + grupo.u_gruporelstamp + "'";
                trHtml += " data-ordem='" + (grupo.ordem || 0) + "'";
                trHtml += " id='" + grupo.u_gruporelstamp + "'";
                trHtml += " style='background:#e9f1ff!important' class='" + classGrupo + "'>";
                
                trHtml += "<td style='width:220px; padding: 8px;'>";
                trHtml += "<button onClick='removeGrupo(this)' type='button' style='color:white!important;background:#d9534f!important;margin-right:0.4em' class='btn btn-sm btn-danger removeGrupo'><i class='fa fa-trash-o'></i></button>";
                trHtml += "<button type='button' onClick='adicionarSubgrupo(this)' class='btn btn-sm btn-primary addSubgrupo'><i class='fa fa-plus'></i> G</button>";
                trHtml += "<button type='button' style='margin-left:0.4em;background:#417ad3!important;color:white' onClick='adicionarLinhaGrupo(this)' class='btn btn-sm  addLinhaGrupo'><i class='fa fa-plus'></i> L</button>";
                trHtml += "</td>";
                trHtml += "<td class='" + classTd + "' colspan='" + self.colunas.length + "'";
                trHtml += " data-temtotais='" + (grupo.temtotais || false) + "'";
                trHtml += " data-colunastotais='" + (grupo.colunastotais || "") + "'";
                trHtml += " data-tipodado='" + (grupo.tipodado || "text") + "'";
                trHtml += " data-temcalculo='" + (grupo.temcalculo || false) + "'";
                trHtml += " data-expressaogrupo='" + (grupo.expressaogrupo || "") + "'>";
                trHtml += "<span style='color:#033076' class='grupo-nome-span'>" + (grupo.descricao || "") + "</span>";
                trHtml += "</td></tr>";
                
                result.push({ _key: "g_" + grupo.u_gruporelstamp, _fullTrHtml: trHtml });
                
                // 2. Adicionar TODAS as linhas deste grupo
                var linhasDoGrupo = self.linhas
                    .filter(function (l) { return l.grupostamp === grupo.u_gruporelstamp; })
                    .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
                
                linhasDoGrupo.forEach(function (linha) {
                    // Construir TR completo da linha
                    var trLinhaHtml = "<tr data-tt-id='" + linha.u_linhastamp + "'";
                    trLinhaHtml += " data-tt-parent-id='" + linha.grupostamp + "'";
                    trLinhaHtml += " data-ordem='" + (linha.ordem || 0) + "'";
                    trLinhaHtml += " data-temgrupo='" + (linha.temgrupo || false) + "'";
                    trLinhaHtml += " id='" + linha.u_linhastamp + "' class='linha-item'>";
                    
                    trLinhaHtml += "<td style='width:220px; padding: 8px;'>";
                    trLinhaHtml += "<button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'>";        
                    trLinhaHtml += "<i class='fa fa-trash-o'></i></button></td>";
                    
                    self.sortedColunas().forEach(function (coluna) {
                        var celula = self.getCelula(linha.u_linhastamp, coluna.u_colunarelstamp) || new CelulaConfig({
                            stamplinha: linha.u_linhastamp,
                            stampcoluna: coluna.u_colunarelstamp
                        });
                        trLinhaHtml += "<td style='min-width:180px; padding: 8px;'><input";
                        trLinhaHtml += " data-valordinamico='" + (celula.valordinamico || "[]") + "'";
                        trLinhaHtml += " data-tipo='" + (celula.tipocelula || "text") + "'";
                        trLinhaHtml += " data-temcalculo='" + (celula.calculo || false) + "'";
                        trLinhaHtml += " data-celulaid='" + celula.u_celulastamp + "'";
                        trLinhaHtml += " data-colunaid='" + coluna.u_colunarelstamp + "'";
                        trLinhaHtml += " value='" + (celula.valor || "") + "'";
                        trLinhaHtml += " readonly class='form-control input-sm celula-inpt' type='text'></td>";
                    });
                    
                    trLinhaHtml += "</tr>";
                    result.push({ _key: "l_" + linha.u_linhastamp, _fullTrHtml: trLinhaHtml });
                });
                
                // 3. Recursivamente adicionar child grupos + suas linhas
                var children = self.grupos
                    .filter(function (g) { return g.noderef === grupo.u_gruporelstamp; })
                    .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
                children.forEach(addGroupWithDescendants);
            }
            
            parentsFirst.forEach(addGroupWithDescendants);
            return result;
        },
        // Renderiza o tbody do modo Grupo-Fixa usando jQuery (imperativo).
        // Chamado após load e mutações. Inicializa treetable após render.
        renderGrupoFixaTbody: function () {
            console.log("[renderGrupoFixaTbody] tipoListagem=", this.tipoListagem);
            if (this.tipoListagem !== "Grupo-Fixa") return;
            
            var tbody = $("#listagemTable tbody");
            console.log("[renderGrupoFixaTbody] tbody encontrado:", tbody.length);
            tbody.empty();
            
            var items = this.itemsGrupoFixaParaRender();
            console.log("[renderGrupoFixaTbody] items=", items.length);
            items.forEach(function (item) {
                tbody.append(item._fullTrHtml);
            });
            
            // delay maior para garantir que o DOM está estável
            setTimeout(_safeInitTreeTable, 100);
        },
        getCelula: function (linhaStamp, colunaStamp) {
            return this.celulas.find(function (c) {
                return c.stamplinha === linhaStamp && c.stampcoluna === colunaStamp;
            });
        },
        // garante que existe uma célula para cada (linha × coluna)
        ensureCelulasGrelha: function () {
            var self = this;
            self.linhas.forEach(function (l) {
                self.colunas.forEach(function (c) {
                    if (!self.getCelula(l.u_linhastamp, c.u_colunarelstamp)) {
                        self.celulas.push(new CelulaConfig({
                            stamplinha:  l.u_linhastamp,
                            stampcoluna: c.u_colunarelstamp
                        }));
                    }
                });
            });
        },

        // -- add helpers (devolvem o objecto reactivo criado) -----------
        addColuna: function (data) {
            var c = new ColunaRelConfig(data || {});
            this.colunas.push(c);
            return c;
        },
        addGrupo: function (data) {
            var g = new GrupoRelConfig(data || {});
            this.grupos.push(g);
            return g;
        },
        addLinha: function (data) {
            var l = new LinhaRelConfig(data || {});
            this.linhas.push(l);
            return l;
        },
        addCelula: function (data) {
            var c = new CelulaConfig(data || {});
            this.celulas.push(c);
            return c;
        },

        // -- remove helpers (com cascata) -------------------------------
        removeLinha: function (stamp) {
            this.linhas  = this.linhas .filter(function (l) { return l.u_linhastamp  !== stamp; });
            this.celulas = this.celulas.filter(function (c) { return c.stamplinha    !== stamp; });
        },
        removeColuna: function (stamp) {
            this.colunas = this.colunas.filter(function (c) { return c.u_colunarelstamp !== stamp; });
            this.celulas = this.celulas.filter(function (c) { return c.stampcoluna      !== stamp; });
        },
        removeGrupo: function (stamp) {
            var self = this;
            // recolher subgrupos (cascata)
            var idsRemover = [stamp];
            var changed = true;
            while (changed) {
                changed = false;
                self.grupos.forEach(function (g) {
                    if (g.noderef && idsRemover.indexOf(g.noderef) !== -1 && idsRemover.indexOf(g.u_gruporelstamp) === -1) {
                        idsRemover.push(g.u_gruporelstamp);
                        changed = true;
                    }
                });
            }
            self.grupos  = self.grupos .filter(function (g) { return idsRemover.indexOf(g.u_gruporelstamp) === -1; });
            // remover linhas (e respectivas células) que pertenciam a esses grupos
            var linhasRemover = self.linhas.filter(function (l) { return idsRemover.indexOf(l.grupostamp) !== -1; });
            linhasRemover.forEach(function (l) { self.removeLinha(l.u_linhastamp); });
        }
    });

    return GMreportState;
}


// ============================================================
// Modal Ãºnico global â€” campos renderizados em tempo real com
// PetiteVue v-for sobre GMreportState.activeUIConfig.
// Qualquer alteraÃ§Ã£o Ã© aplicada ao elemento HTML imediatamente
// via syncToElement() â€” sem botÃ£o "Guardar".
// ============================================================

function initMreportModais() {
    var h = "";
    h += "<div id='modalConfigGlobal' class='modal fade' tabindex='-1' role='dialog'>";
    h += "  <div class='modal-dialog' role='document'>";
    h += "    <div class='modal-content'>";
    h += "      <div class='modal-header'>";
    h += "        <button type='button' class='close' data-dismiss='modal'><span>&times;</span></button>";
    h += "        <h4 class='modal-title' v-text='GMreportState.activeTitle'></h4>";
    h += "      </div>";
    h += "      <div class='modal-body'>";
    h += "        <div class='row'>";

    // â”€â”€ campos dinÃ¢micos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    h += "          <template v-for='field in GMreportState.activeUIConfig'>";
    h += "            <div :class=\"'col-md-' + field.colSize\" style='margin-bottom:0.8em'>";
    h += "              <span v-if=\"field.tipo !== 'checkbox'\" class='control-label' v-text='field.titulo'></span>";

    // input text / digit
    h += "              <input";
    h += "                v-if=\"field.tipo !== 'checkbox' && field.tipo !== 'textarea' && field.contentType !== 'select'\"";
    h += "                :type=\"field.tipo === 'digit' ? 'number' : 'text'\"";
    h += "                :value='GMreportState.activeConfig[field.campo]'";
    h += "                @input='GMreportState.activeConfig[field.campo] = $event.target.value; GMreportState.syncToElement()'";
    h += "                :class='field.classes'>";

    // select
    h += "              <select";
    h += "                v-if=\"field.contentType === 'select'\"";
    h += "                :value='GMreportState.activeConfig[field.campo]'";
    h += "                @change='GMreportState.activeConfig[field.campo] = $event.target.value; GMreportState.syncToElement()'";
    h += "                :class='field.classes'>";
    h += "                <option v-for='sv in field.selectValues' :value='sv.value' v-text='sv.option'></option>";
    h += "              </select>";

    // textarea
    h += "              <textarea";
    h += "                v-if=\"field.tipo === 'textarea'\"";
    h += "                :value='GMreportState.activeConfig[field.campo]'";
    h += "                @input='GMreportState.activeConfig[field.campo] = $event.target.value; GMreportState.syncToElement()'";
    h += "                :class='field.classes' rows='4'></textarea>";

    // checkbox
    h += "              <label v-if=\"field.tipo === 'checkbox'\" style='display:flex;align-items:center;gap:0.4em;cursor:pointer'>";
    h += "                <input type='checkbox'";
    h += "                  :checked='GMreportState.activeConfig[field.campo]'";
    h += "                  @change='GMreportState.activeConfig[field.campo] = $event.target.checked; GMreportState.syncToElement()'";
    h += "                  :class='field.classes'>";
    h += "                <span class='control-label' style='margin:0' v-text='field.titulo'></span>";
    h += "              </label>";
    h += "            </div>";
    h += "          </template>";

    // â”€â”€ valores dinÃ¢micos (apenas para cÃ©lulas) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    h += "          <div v-if=\"GMreportState.activeType === 'celula'\"";
    h += "               class='col-md-12'";
    h += "               style='margin-top:1em;border-radius:8px;border:1px solid #033076;padding:0.6em'>";
    h += "            <span class='control-label'>Valores DinÃ¢micos</span>";
    h += "            <div style='display:flex;flex-direction:column;gap:0.4em;margin-top:0.4em'>";
    h += "              <template v-for='vd in GMreportState.valoresDinamicos'>";
    h += "                <div style='display:flex;gap:0.4em;align-items:center'>";
    h += "                  <input";
    h += "                    :value='vd.descricao'";
    h += "                    @input='vd.descricao = $event.target.value; GMreportState.sincronizarValoresDinamicos()'";
    h += "                    :data-id='vd.id'";
    h += "                    :title='vd.tipo === \"Celula\" ? \"ReferÃªncia: \" + vd.valor : \"\"'";
    h += "                    :class='\"form-control input-sm descricaoValorDinamico\" + (vd.tipo === \"Celula\" ? \" vd-celula\" : \"\")'";
    h += "                    :readonly='vd.tipo === \"Celula\"'>";
    h += "                  <button type='button' @click='GMreportState.removerValorDinamico(vd.id)' class='btn btn-xs btn-danger'>";
    h += "                    <span class='glyphicon glyphicon-trash'></span>";
    h += "                  </button>";
    h += "                </div>";
    h += "              </template>";
    h += "            </div>";
    h += "            <button type='button' style='margin-top:0.6em'";
    h += "                    @click='GMreportState.adicionarValorDinamico()'";
    h += "                    class='btn btn-sm btn-default'>";
    h += "              <span class='glyphicon glyphicon-plus'></span> Adicionar";
    h += "            </button>";
    h += "          </div>";

    h += "        </div>";
    h += "      </div>";
    h += "      <div class='modal-footer'>";
    h += "        <button type='button' class='btn btn-default' data-dismiss='modal'>Fechar</button>";
    h += "      </div>";
    h += "    </div>";
    h += "  </div>";
    h += "</div>";

    $("#maincontent").append(h);
    PetiteVue.createApp({ GMreportState: GMreportState }).mount("#modalConfigGlobal");
}


// ============================================================
// initMreportListagem — cria #listagemContainer reactivo (uma vez)
// e monta PetiteVue. As mutações em GMreportState reflectem-se
// automaticamente na tabela.
// ============================================================
function initMreportListagem() {
    $("#listagemContainer").remove();
    $("#ctl00_conteudo_TabPanelUs_0 > .row:last").after(MreportLayout.listagemReactiveTemplate());
    PetiteVue.createApp({ GMreportState: GMreportState }).mount("#listagemContainer");
}

// Wrapper seguro: inicializa o treetable diretamente.
// Não depende da função inicializeGrupoTreeTable() da página HTML.
function _safeInitTreeTable() {
    var $table = $("#listagemTable");
    if ($table.length === 0) {
        console.warn("[treetable] #listagemTable não encontrado");
        return;
    }
    var trCount = $table.find("tbody tr").length;
    console.log("[treetable] Inicializando com " + trCount + " TRs");
    
    if (typeof $.fn.treetable !== "function") {
        console.warn("[treetable] Plugin jquery.treetable não carregado");
        return;
    }
    
    // Injetar CSS customizado para remover bordas estranhas do treetable
    if (!document.getElementById("mreportTreeTableStyles")) {
        var style = document.createElement("style");
        style.id = "mreportTreeTableStyles";
        var cssRules = "";
        
        // Remover bordas do treetable
        cssRules += "#listagemTable.treetable, ";
        cssRules += "#listagemTable.treetable tbody tr td, ";
        cssRules += "#listagemTable.treetable thead tr th { ";
        cssRules += "border: none !important; ";
        cssRules += "}";
        
        // Manter bordas do header
        cssRules += "#listagemTable thead th { ";
        cssRules += "border: 0px solid !important; ";
        cssRules += "}";
        
        style.textContent = cssRules;
        document.head.appendChild(style);
    }
    
    // destroy se já inicializado
    try {
        if ($table.data("treetable")) {
            $table.treetable("destroy");
        }
    } catch (e) { /* ignorar */ }
    
    $(".indenter").remove();
    
    try {
        $table.treetable({ expandable: true });
        $table.treetable("expandAll");
        console.log("[treetable] Inicializado com sucesso");
    } catch (e) {
        console.error("[treetable] Erro ao inicializar:", e);
    }
}


// ============================================================
// MreportLayout — todos os builders HTML do editor de relatórios
// (fonte de dados, listagem, colunas, linhas, células, grupos).
// RELATORIO-MAIN.js apenas chama estas funções; nenhum HTML
// inline deve permanecer fora deste namespace.
// ============================================================
var MreportLayout = {

    // -- overlay/spinner reutilizável --------------------------
    spinnerOverlay: function () {
        var h = "";
        h += "<div class='overlay'>";
        h += "    <div class='spinner'></div>";
        h += "    <div class='w-100 d-flex justify-content-center align-items-center'></div>";
        h += "</div>";
        return h;
    },

    // -- Fonte de dados ----------------------------------------
    fonteContainer: function () {
        return "<div id='fonteDadosContainer' style='margin-top:2.5em' class='  '>" +
               "<div class='row' id='fonteDadosBody'></div>" +
               "<div class='row' id='fonteDadoFooter'></div></div>";
    },

    fonteFooter: function () {
        var h = "";
        h += "<div style='margin-top:1em;display:flex' class='col-md-12 '>";
        h += "    <button type='button' onClick='gravarFonteDados()' class='btn btn-danger btn-sm gravar-fonte-dados'><span class='glyphicon glyphicon-floppy-saved'></span></button>";
        h += "    <button style='margin-left:0.8em' type='button' class='btn btn-primary btn-sm adicionar-fonte-dados'><span class='glyphicon glyphicon glyphicon-plus'></span></button>";
        h += "</div>";
        return h;
    },

    fonteCardBody: function (fonte) {
        fonte = fonte || {};
        var codigo    = fonte.codigo    || "";
        var basequery = fonte.basequery || "";
        var filtro    = fonte.filtro    || "";
        var h = "";
        h += "<div class='row'>";
        h += "    <div class='col-md-6'>";
        h += "        <span class='control-label'>Código:</span>";
        h += "        <input value='" + codigo + "' class='form-control input-sm codigo'>";
        h += "    </div>";
        h += "    <div class='col-md-12'>";
        h += "        <span class='control-label'>Base query:</span>";
        h += "        <textarea rows='20' class='form-control basequery'>" + basequery + "</textarea>";
        h += "    </div>";
        h += "    <div class='col-md-12'>";
        h += "        <span class='control-label'>Filtro:</span>";
        h += "        <textarea rows='20' class='form-control filtro'>" + filtro + "</textarea>";
        h += "    </div>";
        h += "    <div style='margin-top:1em' class='col-md-6 pull-left'>";
        h += "        <button type='button' class='btn btn-danger btn-sm'><span class='glyphicon glyphicon glyphicon-trash'></span></button>";
        h += "    </div>";
        h += "</div>";
        return h;
    },

    fonteItem: function (fonte) {
        fonte = fonte || {};
        var fonteId    = fonte.fontestamp      || generateUUID();
        var relFonteId = fonte.u_relfontestamp || generateUUID();
        var card = generateDashFactCard({ title: "Fonte de dados", body: this.fonteCardBody(fonte) });
        return "<div data-edit-fonte='true' data-fonteid='" + fonteId +
               "' data-relfonteid='" + relFonteId +
               "' style='margin-bottom:2em' class='col-md-12 fonte-item '>" + card + "</div>";
    },

    // -- Container/Toolbar do editor de listagem ---------------
    listagemContainer: function () {
        return "<div id='listagemContainer' style='margin-top:2.5em'>" +
               "<div class='row' id='listagemItem'></div></div>";
    },

    listagemToolbar: function (opts) {
        // opts: { tipo: "Fixa" | "Dinâmica" | "Grupo-Fixa" }
        opts = opts || {};
        var tipo = opts.tipo || "Fixa";

        var h = "";
        h += "<div style='margin-bottom:1em' class='col-md-12'>";
        h += "    <button type='button' class='btn btn-sm btn-primary adicionar-coluna-btn'>Adicionar coluna</button>";
        h += "    <button onClick='actualizarColuna(this)' style='margin-left:0.4em' type='button' class='btn btn-sm btn-default'>Actualizar</button><br>";
        h += "</div>";
        h += "<div class='col-md-12'>";
        h += "    <div class='row table-responsive listagemTableContainer'>";
        h += "    <table id='listagemTable' class='table listagem-table'>";
        h += "        <thead>";
        h += "          <tr class='defgridheader' style='background:#033076!important'></tr>";
        h += "        </thead>";
        h += "        <tbody id='listagemBody'></tbody>";
        h += "    </table>";
        h += "    </div>";

        if (tipo !== "Dinâmica") {
            var bottomBtn = (tipo === "Grupo-Fixa")
                ? "<button type='button' class='btn btn-sm btn-default adicionar-grupo-btn'>Adicionar grupo</button>"
                : "<button type='button' class='btn btn-sm btn-default adicionar-linha-btn'>Adicionar linha</button>";
            h += "    <div class='options-listagem-table row'>";
            h += "        <div class='col-md-6 pull-left'>" + bottomBtn + "</div>";
            h += "    </div>";
        }
        h += "</div>";
        return h;
    },

    // -- Cabeçalhos da tabela ----------------------------------
    colunaAcoesHeader: function (largura) {
        var w = largura || "90%";
        return "<th style='width:" + w + "!important' class='coluna-acoes'></th>";
    },

    colunaHeader: function (coluna) {
        // coluna: { u_colunarelstamp|id, codigocoluna|codigo, valorcoluna|valor, ordemcoluna|ordem }
        coluna = coluna || {};
        var colunaId   = coluna.u_colunarelstamp || coluna.id     || "";
        var codigo     = coluna.codigocoluna     || coluna.codigo || "";
        var nomeColuna = coluna.valorcoluna      || coluna.valor  || "";
        var ordem      = coluna.ordemcoluna      || coluna.ordem  || 0;
        return "<th data-ordem='" + ordem + "' data-codigo='" + codigo +
               "' data-valor='" + nomeColuna + "' id='" + colunaId +
               "' class='coluna-conf'>" + nomeColuna + "</th>";
    },

    // -- Células / linhas / acções -----------------------------
    removerLinhaTd: function (icone) {
        // icone: "glyphicon" | "fa"
        var iconHtml = (icone === "fa")
            ? "<i class='fa fa-trash-o'></i>"
            : "<span class='glyphicon glyphicon glyphicon-trash'></span>";
        return "<td><button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'>" + iconHtml + "</button></td>";
    },

    celulaInputTd: function (opts) {
        opts = opts || {};
        var celulaId      = opts.celulaId      || generateUUID();
        var colunaId      = opts.colunaId      || "";
        var valor         = opts.valor         || "";
        var temCalculo    = (opts.temCalculo === true || opts.temCalculo === "true");
        var tipo          = opts.tipo          || "text";
        var valordinamico = opts.valordinamico || "[]";
        return "<td><input data-valordinamico='" + valordinamico +
               "' data-tipo='" + tipo +
               "' data-temcalculo='" + temCalculo +
               "' data-celulaid='" + celulaId +
               "' data-colunaid='" + colunaId +
               "' readonly class='form-control input-sm celula-inpt' type='text' value='" + valor + "'></td>";
    },

    linhaRow: function (opts) {
        // opts: { linhaId, ordem, celulasHtml, classe, parentId, dataAttrs, ttId }
        opts = opts || {};
        var linhaId   = opts.linhaId  || generateUUID();
        var ordem     = opts.ordem    || 0;
        var classe    = opts.classe   || "linha-item";
        var dataAttrs = opts.dataAttrs || "";
        var ttId      = opts.ttId ? " data-tt-id='" + opts.ttId + "'" : "";
        var ttParent  = opts.parentId ? " data-tt-parent-id='" + opts.parentId + "'" : "";
        return "<tr" + ttId + ttParent + dataAttrs +
               " data-ordem='" + ordem + "' id='" + linhaId +
               "' class='" + classe + "'>" + (opts.celulasHtml || "") + "</tr>";
    },

    // -- Grupos / Subgrupos ------------------------------------
    grupoAcoesTd: function () {
        var h = "<td>";
        h += "<button onClick='removeGrupo(this)' type='button' style='color:white!important;background:#d9534f!important;margin-right:0.4em' class='btn btn-sm btn-danger removeGrupo'><i class='fa fa-trash-o'></i></button>";
        h += "<button type='button' onClick='adicionarSubgrupo(this)' class='btn btn-sm btn-primary addSubgrupo'><i class='fa fa-plus'></i> G</button>";
        h += "<button type='button' style='margin-left:0.4em;background:#417ad3!important;color:white' onClick='adicionarLinhaGrupo(this)' class='btn btn-sm  addLinhaGrupo'><i class='fa fa-plus'></i> L</button>";
        h += "</td>";
        return h;
    },

    grupoConfTd: function (opts) {
        // opts: { parent (bool), colspan, descricao, dataAttrs }
        opts = opts || {};
        var classe    = (opts.parent === false) ? "subg-grupo-conf" : "grupo-conf";
        var colspan   = opts.colspan   || 1;
        var dataAttrs = opts.dataAttrs || "";
        var desc      = opts.descricao || "";
        return "<td " + dataAttrs + " class='" + classe + "' colspan='" + colspan + "'>" +
               "<span style='color:#033076' class='grupo-nome-span'>" + desc + "</span></td>";
    },

    grupoRow: function (opts) {
        // opts: { grupoId, ordem, parent, colspan, descricao, dataAttrs, parentId }
        opts = opts || {};
        var grupoId   = opts.grupoId   || generateUUID();
        var ordem     = opts.ordem     || 0;
        var parent    = (opts.parent !== false);
        var classe    = parent ? "grupo-item" : "subgrupo-item";
        var ttParent  = opts.parentId ? " data-tt-parent-id='" + opts.parentId + "'" : "";
        var inner = this.grupoAcoesTd() + this.grupoConfTd({
            parent:    parent,
            colspan:   opts.colspan,
            descricao: opts.descricao,
            dataAttrs: opts.dataAttrs
        });
        return "<tr" + ttParent + " data-tt-id='" + grupoId +
               "' style='background:#e9f1ff!important' data-parent='" + parent +
               "' data-grupoid='" + grupoId + "' data-ordem='" + ordem +
               "' id='" + grupoId + "' class='" + classe + "'>" + inner + "</tr>";
    },

    grupoDataAttrs: function (g) {
        g = g || {};
        return " data-temtotais='" + (g.temtotais || false) +
               "' data-colunastotais='" + (g.colunastotais || "") +
               "' data-tipodado='" + (g.tipodado || "text") +
               "' data-temcalculo='" + (g.temcalculo || false) +
               "' data-expressaogrupo='" + (g.expressaogrupo || "") + "' ";
    },

    // -- Template reactivo da listagem (PetiteVue v-for) -------
    // Renderiza a tabela inteira a partir de GMreportState.
    // NOTA: não usar <template> dentro de <tbody> — o parser HTML
    // hoista <template> para fora de <tbody>, partindo o PetiteVue.
    listagemReactiveTemplate: function () {
        var getCel = "GMreportState.getCelula(linha.u_linhastamp, coluna.u_colunarelstamp)";
        var h = "";
        h += "<div id='listagemContainer' style='margin-top:2.5em' v-scope>";

        // overlay de loading
        h += "  <div v-if='GMreportState.loadingListagem' class='overlay'>";
        h += "    <div class='spinner'></div>";
        h += "    <div class='w-100 d-flex justify-content-center align-items-center'></div>";
        h += "  </div>";

        h += "  <div class='row' id='listagemItem' v-if='GMreportState.tipoListagem'>";

        // Toolbar
        h += "    <div style='margin-bottom:1em' class='col-md-12'>";
        h += "      <button type='button' class='btn btn-sm btn-primary adicionar-coluna-btn'>Adicionar coluna</button>";
        h += "      <button onClick='actualizarColuna(this)' style='margin-left:0.4em' type='button' class='btn btn-sm btn-default'>Actualizar</button>";
        h += "    </div>";

        h += "    <div class='col-md-12'>";
        h += "      <div class='row table-responsive listagemTableContainer'>";
        h += "        <table id='listagemTable' class='table listagem-table'>";
        h += "          <thead>";
        h += "            <tr class='defgridheader' style='background:#033076!important'>";

        // Cabeçalho de acções
        h += "              <th v-if=\"GMreportState.tipoListagem !== 'Dinâmica'\"";
        h += "                  :style=\"'width:' + (GMreportState.tipoListagem === 'Grupo-Fixa' ? '220px' : '160px') + ' !important'\"";
        h += "                  class='coluna-acoes'></th>";

        // Cabeçalhos de coluna
        h += "              <th v-for='coluna in GMreportState.sortedColunas()'";
        h += "                  :key='coluna.u_colunarelstamp'";
        h += "                  :data-ordem='coluna.ordem'";
        h += "                  :data-codigo='coluna.codigo'";
        h += "                  :data-valor='coluna.valor'";
        h += "                  :id='coluna.u_colunarelstamp'";
        h += "                  class='coluna-conf'";
        h += "                  style='min-width:180px; padding: 8px;'";
        h += "                  v-text='coluna.valor'></th>";
        h += "            </tr>";
        h += "          </thead>";
        h += "          <tbody id='listagemBody'>";

        // Linhas soltas (Fixa, Dinâmica) — helper devolve [] em Grupo-Fixa
        h += "            <tr v-for='linha in GMreportState.linhasSoltasParaRender()'";
        h += "                :key='\"sl_\" + linha.u_linhastamp'";
        h += "                :id='linha.u_linhastamp'";
        h += "                :data-ordem='linha.ordem'";
        h += "                :data-temgrupo='linha.temgrupo'";
        h += "                :data-campoagrupamento='linha.campoagrupamento'";
        h += "                :data-expressaolinha='linha.expressao'";
        h += "                class='linha-item'>";
        h += "              <td v-if=\"GMreportState.tipoListagem === 'Fixa'\" style='width:160px; padding: 8px;'>";
        h += "                <button type='button' style='color:white!important;background:#d9534f!important' class='btn btn-sm btn-danger removeLinha'>";
        h += "                  <span class='glyphicon glyphicon glyphicon-trash'></span>";
        h += "                </button>";
        h += "              </td>";
        h += "              <td v-for='coluna in GMreportState.sortedColunas()'";
        h += "                  :key='coluna.u_colunarelstamp + \"_\" + linha.u_linhastamp'";
        h += "                  style='min-width:180px; padding: 8px;'>";
        h += "                <input :data-valordinamico='" + getCel + ".valordinamico'";
        h += "                       :data-tipo='" + getCel + ".tipocelula'";
        h += "                       :data-temcalculo='" + getCel + ".calculo'";
        h += "                       :data-celulaid='" + getCel + ".u_celulastamp'";
        h += "                       :data-colunaid='coluna.u_colunarelstamp'";
        h += "                       :value='" + getCel + ".valor'";
        h += "                       @input='" + getCel + ".valor = $event.target.value'";
        h += "                       readonly class='form-control input-sm celula-inpt' type='text'>";
        h += "              </td>";
        h += "            </tr>";

        // Modo Grupo-Fixa: renderizo com jQuery (imperative) porque o PetiteVue não funciona bem
        // com tabelas complexas + treetable plugin
        h += "            <!-- Grupo-Fixa é renderizado imperativamente via GMreportState.renderGrupoFixaTbody() -->";

        h += "          </tbody>";
        h += "        </table>";
        h += "      </div>";

        // Botões inferiores
        h += "      <div v-if=\"GMreportState.tipoListagem !== 'Dinâmica' && GMreportState.colunas.length > 0\" class='options-listagem-table row'>";
        h += "        <div class='col-md-6 pull-left'>";
        h += "          <button v-if=\"GMreportState.tipoListagem === 'Grupo-Fixa'\" type='button' class='btn btn-sm btn-default adicionar-grupo-btn'>Adicionar grupo</button>";
        h += "          <button v-else type='button' class='btn btn-sm btn-default adicionar-linha-btn'>Adicionar linha</button>";
        h += "        </div>";
        h += "      </div>";
        h += "    </div>";

        h += "  </div>";
        h += "</div>";
        return h;
    }
};


// ============================================================
// Globais do editor (lidas pelo servidor) â€” usadas em
// getGrupoElements e getListagemGrupoFixa.
// ============================================================
// â”€â”€ listas lidas do servidor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var confRelatorio   = [];
var gruposRelatorio = [];
var dadosLinhas     = [];
var dadosColunas    = [];

// ============================================================
// actualizarColuna — gravar configuração completa do relatório
// Lê a configuração dos arrays reactivos em GMreportState.
// ============================================================
function actualizarColuna() {
    var syncstamp = getSyncstamp();

    if ($("#listagemTable tbody tr").length === 0) {
        alertify.error("Adicione registos para a listagem", 5000);
        return;
    }

    $("#listagemContainer .overlay").show();

    var config = GMreportState.buildSavePayload(syncstamp);

    $.ajax({
        type: "POST",
        url:  "../programs/gensel.aspx?cscript=actualizarmreportconfig",
        data: { "__EVENTARGUMENT": JSON.stringify([{ syncstamp: syncstamp, config: config }]) }
    }).then(function (response) {
        $("#listagemContainer .overlay").hide();
        if (response.cod !== "0000") {
            alertify.error("Erro ao gravar: " + (response.message || ""), 8000);
            return;
        }
        alertify.success("Sucesso", 4000);
        listagemHandler();
    }).fail(function () {
        $("#listagemContainer .overlay").hide();
        alertify.error("Erro de rede ao gravar", 8000);
    });
}

// adicionarValorDinamico / preencherValoresDinamicos

// ============================================================
// Operações de edição (mutam GMreportState; PetiteVue re-renderiza)
// ============================================================

function removeGrupo(elem) {
    var id = $(elem).closest("tr").attr("id");
    GMreportState.removeGrupo(id);
    GMreportState.renderGrupoFixaTbody();
}

function adicionarGrupo() {
    var maxOrdem = 0;
    GMreportState.grupos.forEach(function (g) {
        if (g.parent && (g.ordem || 0) > maxOrdem) maxOrdem = g.ordem || 0;
    });
    var ordem = maxOrdem + 1;
    GMreportState.addGrupo({
        descricao: "Grupo" + ordem,
        parent:    true,
        ordem:     ordem
    });
    GMreportState.renderGrupoFixaTbody();
}

function adicionarSubgrupo(elem) {
    var parentId = $(elem).closest("tr").attr("id");
    var maxOrdem = 0;
    GMreportState.grupos.forEach(function (g) {
        if (g.noderef === parentId && (g.ordem || 0) > maxOrdem) maxOrdem = g.ordem || 0;
    });
    var ordem = maxOrdem + 1;
    GMreportState.addGrupo({
        descricao: "Grupo" + ordem,
        parent:    false,
        noderef:   parentId,
        ordem:     ordem
    });
    GMreportState.renderGrupoFixaTbody();
}

function adicionarLinha() {
    var maxOrdem = 0;
    GMreportState.linhasSoltas().forEach(function (l) {
        if ((l.ordem || 0) > maxOrdem) maxOrdem = l.ordem || 0;
    });
    var linhaId = generateUUID();
    GMreportState.addLinha({ u_linhastamp: linhaId, ordem: maxOrdem + 1 });
    GMreportState.colunas.forEach(function (c) {
        GMreportState.addCelula({
            stamplinha:  linhaId,
            stampcoluna: c.u_colunarelstamp
        });
    });
}

function adicionarLinhaGrupo(element) {
    var grupoId = $(element).closest("tr").attr("id");
    var maxOrdem = 0;
    GMreportState.linhas.forEach(function (l) {
        if (l.grupostamp === grupoId && (l.ordem || 0) > maxOrdem) maxOrdem = l.ordem || 0;
    });
    var linhaId = generateUUID();
    GMreportState.addLinha({
        u_linhastamp: linhaId,
        ordem:        maxOrdem + 1,
        grupostamp:   grupoId,
        temgrupo:     true
    });
    GMreportState.colunas.forEach(function (c) {
        GMreportState.addCelula({
            stamplinha:  linhaId,
            stampcoluna: c.u_colunarelstamp
        });
    });
    GMreportState.renderGrupoFixaTbody();
}

function adicionarColuna() {
    var maxOrdem = 0;
    GMreportState.colunas.forEach(function (c) {
        if ((c.ordem || 0) > maxOrdem) maxOrdem = c.ordem || 0;
    });
    var ordem = maxOrdem + 1;
    var colunaId = generateUUID();
    GMreportState.addColuna({
        u_colunarelstamp: colunaId,
        codigo:           "Codigo" + (GMreportState.colunas.length + 1),
        valor:            "Coluna " + (GMreportState.colunas.length + 1),
        ordem:            ordem
    });

    // Se não havia linhas e estamos em modo Fixa, criar uma linha inicial.
    if (GMreportState.linhas.length === 0 && GMreportState.tipoListagem === "Fixa") {
        GMreportState.addLinha({ ordem: 1 });
    }

    // Garantir células para todas as combinações.
    GMreportState.ensureCelulasGrelha();

    if (GMreportState.tipoListagem === "Grupo-Fixa") {
        setTimeout(_safeInitTreeTable, 0);
    }
}

function adicionarFonteDados() {
    $("#fonteDadosContainer #fonteDadosBody").append(MreportLayout.fonteItem());
}
function getFonteDados() {

    $("#fonteDadosContainer").remove();
    $("#campos > .row:last").after(MreportLayout.fonteContainer());
    $("#fonteDadosContainer #fonteDadosBody").append(MreportLayout.spinnerOverlay());
    $("#fonteDadosContainer #fonteDadoFooter").append(MreportLayout.fonteFooter());
    $("#fonteDadosContainer .overlay").show();

    var fonteDadosResult = $.ajax({
        type: "POST",
        url:  "../programs/gensel.aspx?cscript=getfontedadosconfrelatorio",
        data: { '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]) }
    });

    fonteDadosResult.then(function (response) {
        var errorMessage = "ao trazer resultados ";
        try {
            if (response.cod != "0000") {
                alertify.error("Erro interno " + errorMessage, 10000);
                $("#fonteDadosContainer .overlay").hide();
                return false;
            }
            (response.data || []).forEach(function (fonte) {
                $("#fonteDadosContainer #fonteDadosBody").append(MreportLayout.fonteItem(fonte));
            });
            modoHandler();
        } catch (error) {
            console.log("Erro interno " + errorMessage, response);
            alertify.error("Erro interno " + errorMessage, 10000);
        }
        $("#fonteDadosContainer .overlay").hide();
    });
}
function modoHandler() {
    if (getState() == "consultar") {
        $("#fonteDadosContainer input").attr("readonly", true)
        $("#fonteDadosContainer textarea").attr("readonly", true)
        $("#fonteDadosContainer button").hide()
    }
}


function opcoesTabelaHandler() {
    // PetiteVue controla a visibilidade dos botões via v-if;
    // mantém-se a função para chamadas legadas. Devolve true se há colunas.
    return GMreportState.colunas.length > 0;
}


// ============================================================
// Carregamento de listagens — apenas AJAX + popular GMreportState.
// PetiteVue renderiza automaticamente.
// ============================================================

function _carregarListagem(tipo, callback) {
    GMreportState.tipoListagem    = tipo;
    GMreportState.loadingListagem = true;

    return $.ajax({
        type: "POST",
        url:  "../programs/gensel.aspx?cscript=getlistagemrelatorio",
        data: { '__EVENTARGUMENT': JSON.stringify([{ syncstamp: getSyncstamp() }]) }
    }).then(function (response) {
        GMreportState.populateFromListagem(response, tipo);
        GMreportState.loadingListagem = false;
        if (tipo === "Grupo-Fixa") {
            GMreportState.renderGrupoFixaTbody();
        }
        if (typeof callback === "function") callback();
    }).fail(function () {
        GMreportState.loadingListagem = false;
        alertify.error("Erro ao carregar listagem", 8000);
    });
}

function getListagemFixa() {
    _carregarListagem("Fixa");
}

function getListagemDinamica() {
    _carregarListagem("Dinâmica");
}

function getListagemGrupoFixa() {
    _carregarListagem("Grupo-Fixa", function () {
        setTimeout(_safeInitTreeTable, 0);
    });
}

// getGrupoElements — desnecessário (template PetiteVue + treetable plugin
// reorganizam a árvore com base em data-tt-id / data-tt-parent-id).
function gravarFonteDados() {
    var fontes = [];
    $("#fonteDadosContainer .overlay").show()
    $("#fonteDadosContainer .fonte-item").each(function () {
        var fonteId = $(this).attr("data-fonteid")
        var relFonteId = $(this).attr("data-relfonteid")
        var codigo = $(this).find(".codigo").val()
        var basequery = $(this).find(".basequery").val()
        var filtro = $(this).find(".filtro").val()
        var data = {
            fonteId: fonteId,
            relFonteId: relFonteId,
            codigo: codigo,
            basequery: basequery,
            filtro: filtro,
            syncstamp: getSyncstamp()
        }

        fontes.push(data)







    })

    var promises = []

    console.log("fontes", fontes)
    var promise = $.ajax({
        type: "POST",
        //   async: false,
        url: "../programs/gensel.aspx?cscript=gravarfontededados",

        data: {
            '__EVENTARGUMENT': JSON.stringify(fontes),
        },
        success: function (response) {

            var errorMessage = "ao gravar registos "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    alertify.error("Erro " + errorMessage, 10000)
                    $("#fonteDadosContainer .overlay").hide()
                    console.log("Erro " + errorMessage, response)
                    return false
                }

                alertify.success("Sucesso ", 10000)

                $("#fonteDadosContainer .overlay").hide()
                getFonteDados()
            } catch (error) {
                console.log("Erro interno " + errorMessage, response)
                $("#fonteDadosContainer .overlay").hide()
                alertify.error("Erro interno " + errorMessage, 10000)
            }

        }
    })
    // promises.push(promise)
    promise.then(function () {
        fontes = []
        return true;
    });
    //console.log("pomises length", promises.length)

    /*$.when.apply($, promises).done(function () {
       // fontes = []
        console.log("fontes", fontes)
        return true
    })*/

    // fontes = []
    //console.log("fontes", fontes)
}

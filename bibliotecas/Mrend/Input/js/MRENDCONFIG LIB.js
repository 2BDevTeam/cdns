
function LinhaMrenderConfig(data) {

    this.linhastamp = data.linhastamp || "";
    this.linkstamp = data.linkstamp || "";
    this.relatoriostamp = data.relatoriostamp || "";
    this.parentstamp = data.parentstamp || "";
    this.temcolunas = data.temcolunas || false;
    this.tipo = data.tipo || "";
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.origem = data.origem || "";
    this.expressao = data.expressao || "";
    this.campovalid = data.campovalid || "";
    this.sinalnegativo = data.sinalnegativo || false;
    this.temtotais = data.temtotais || false;
    this.totkey = data.totkey || "";
    this.modelo = data.modelo || false;
    this.descbtnModelo = data.descbtnModelo || "Adicionar linha";
    this.addfilho = data.addfilho || false;
    this.eventoadd = data.eventoadd || false;
    this.eventoaddexpr = data.eventoaddexpr || "";
    this.eventodelete = data.eventodelete || false;
    this.eventodeleteexpr = data.eventodeleteexpr || "";
    this.totfield = data.totfield || "";
    this.leitura = data.leitura || false;
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
    this.estilopersonalizado = data.estilopersonalizado || false;
    this.expressaoestilopersonalizado = data.expressaoestilopersonalizado || "";
    this.explist = data.explist || "";
    this.defselect = data.defselect || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.executachangesubgrupo = data.executachangesubgrupo || false;
    this.expressaochangejssubgrupo = data.expressaochangejssubgrupo || "";
    this.comportamentogrupo = data.comportamentogrupo || false;
    this.corcomportgrupo = data.corcomportgrupo || "";
    this.colunatitulo = data.colunatitulo || "";
    this.levadesclinha = data.levadesclinha || false;
    this.linhatemtotal = data.linhatemtotal || false;
    this.tituloparatotal = data.tituloparatotal || "";
    this.colunastotais = data.colunastotais || "";
    this.temexpressaototal = data.temexpressaototal || false;
    this.expressaototal = data.expressaototal || "";
    // Convert blacklistheranca from CSV string to array for Vue multiselect
    var defaultBlacklist = "comportamentogrupo,corcomportgrupo,colunatitulo,levadesclinha,temtotais,modelo";
    if (data.blacklistheranca) {
        this.blacklistheranca = typeof data.blacklistheranca === "string"
            ? data.blacklistheranca.split(',').map(function (s) { return s.trim(); })
            : data.blacklistheranca;
    } else {
        this.blacklistheranca = defaultBlacklist.split(',').map(function (s) { return s.trim(); });
    }
    this.bindData = new BindData(data.bindData ? data.bindData : {})
    this.localSource = data.localSource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.ligacoes = [];
    this.relationRecords = handleRelationDataByComponente("Linha", this.linhastamp, this);

}

// Helper function to initialize select2 on multiple selects
function initMultipleSelects(containerSelector, vueScope) {
    console.log("initMultipleSelects called for container:", containerSelector);

    setTimeout(function () {
        console.log("Looking for selects in:", containerSelector);
        var $allSelects = $(containerSelector + ' select');
        console.log("Total selects found:", $allSelects.length);

        // Log details of all selects found
        $allSelects.each(function (index) {
            var $s = $(this);
            console.log("  Select " + index + ":", {
                name: $s.attr('name'),
                id: $s.attr('id'),
                hasMultiple: $s.attr('multiple') !== undefined,
                vModel: $s.attr('v-model'),
                classes: $s.attr('class')
            });
        });

        var $multipleSelects = $(containerSelector + ' select[multiple]');
        console.log("Multiple selects found:", $multipleSelects.length);

        $multipleSelects.each(function () {
            var $select = $(this);
            var selectId = $select.attr('id') || $select.attr('name');
            console.log("Processing select:", selectId, "Has multiple attr:", $select.attr('multiple'));

            // Extract v-model binding to get current value
            var vModelAttr = $select.attr('v-model');
            console.log("v-model attribute:", vModelAttr);

            // Se temos vueScope e v-model, definir os valores selecionados
            if (vueScope && vModelAttr) {
                try {
                    // Parse v-model path (e.g., "mrendConfigItem.blacklistheranca")
                    var parts = vModelAttr.split('.');
                    var value = vueScope;
                    for (var i = 0; i < parts.length; i++) {
                        value = value[parts[i]];
                    }

                    console.log("Current value from Vue:", value);

                    if (value && Array.isArray(value) && value.length > 0) {
                        console.log("Setting select values to:", value);
                        $select.val(value);
                    }
                } catch (e) {
                    console.warn("Error extracting v-model value:", e);
                }
            }

            if (!$select.data('select2')) {
                console.log("Initializing select2 for", selectId);
                $select.select2({
                    width: '100%',
                    allowClear: true,
                    placeholder: 'Selecione as opções',
                    closeOnSelect: false
                });

                // Trigger change event for Vue reactivity
                $select.on('change', function () {
                    var selectedValues = $select.val() || [];
                    console.log("Select changed, new values:", selectedValues);

                    // Update Vue data directly
                    if (vueScope && vModelAttr) {
                        try {
                            var parts = vModelAttr.split('.');
                            var obj = vueScope;
                            for (var i = 0; i < parts.length - 1; i++) {
                                obj = obj[parts[i]];
                            }
                            obj[parts[parts.length - 1]] = selectedValues;
                            console.log("Updated Vue data:", parts.join('.'), "=", selectedValues);
                        } catch (e) {
                            console.warn("Error updating v-model:", e);
                        }
                    }

                    var event = new Event('input', { bubbles: true });
                    this.dispatchEvent(event);
                });
            } else {
                console.log("Select2 already initialized for", selectId);
            }
        });
    }, 500);
}

/**
 * Initialize manual multi-select fields with Select2 and bind directly to a data object.
 * This bypasses the broken generic form system for multi-select rendering.
 * 
 * @param {Object} dataObject - The object whose properties will be updated (e.g., mrendConfigItem)
 * @param {Array} multiSelectFields - Array of UIObjectFormConfig objects with multiSelect:true
 * @param {String} idValue - The unique id used to namespace select element ids
 */
function initMrendMultiSelects(dataObject, multiSelectFields, idValue) {
    if (!multiSelectFields || multiSelectFields.length === 0) return;

    // Wait for DOM to be ready after modal show + Vue mount
    setTimeout(function () {
        multiSelectFields.forEach(function (obj) {
            var selectId = "multiselect_" + obj.campo + "_" + idValue;
            var $select = $("#" + selectId);

            if ($select.length === 0) {
                console.warn("initMrendMultiSelects: select not found for", obj.campo);
                return;
            }

            // Get current value from data object (may be string or array)
            var currentValue = dataObject[obj.campo];
            if (typeof currentValue === "string") {
                currentValue = currentValue.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
            }
            if (!Array.isArray(currentValue)) {
                currentValue = [];
            }

            // Pre-select current values BEFORE Select2 init
            $select.val(currentValue);

            // Destroy any prior Select2 instance
            if ($select.data("select2")) {
                $select.select2("destroy");
            }

            // Initialize Select2
            $select.select2({
                width: "100%",
                allowClear: true,
                placeholder: "Selecione as opções",
                closeOnSelect: false
            });

            // Bind change: update dataObject directly with array of selected values
            $select.on("change.mrendMultiselect", function () {
                var selectedValues = $(this).val() || [];
                dataObject[obj.campo] = selectedValues;
                console.log("MultiSelect [" + obj.campo + "] updated:", selectedValues);
            });
        });
    }, 200);
}

function getLinhaUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [

        // ── Identificação ──────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({
            colSize: 4,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Grupo", value: "Grupo" },
                { option: "Subgrupo", value: "Subgrupo" },
                { option: "Singular", value: "Singular" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 4, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form  input-sm" }),

        // ── Comportamento ──────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "temcolunas", tipo: "checkbox", titulo: "Tem Colunas", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 4, campo: "modelo", tipo: "checkbox", titulo: "É modelo", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 4, campo: "addfilho", tipo: "checkbox", titulo: "Adiciona filho", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 4, campo: "leitura", tipo: "checkbox", titulo: "Leitura", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 8, campo: "descbtnModelo", tipo: "text", titulo: "Descrição Botão Modelo", classes: "form-control input-source-form  input-sm" }),

        // ── Grupo automático ───────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "comportamentogrupo", tipo: "checkbox", titulo: "Comportamento Grupo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "corcomportgrupo", tipo: "text", titulo: "Cor Comportamento Grupo", classes: "form-control input-source-form  input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "colunatitulo", tipo: "text", titulo: "Coluna Título", classes: "form-control input-source-form  input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "levadesclinha", tipo: "checkbox", titulo: "Leva Descrição da Linha", classes: "input-source-form", contentType: "input" }),

        // ── Herança para Linhas Filhas ────────────────────────────────
        new UIObjectFormConfig({
            colSize: 12,
            campo: "blacklistheranca",
            tipo: "select",
            titulo: "Propriedades que NÃO herdam para linhas filhas",
            classes: "form-control input-source-form input-sm",
            contentType: "select",
            multiSelect: true,
            fieldToOption: "option",
            fieldToValue: "value",
            selectValues: [
                // Grupo automático
                { option: "Comportamento Grupo", value: "comportamentogrupo" },
                { option: "Cor Comportamento Grupo", value: "corcomportgrupo" },
                { option: "Coluna Título", value: "colunatitulo" },
                { option: "Leva Descrição da Linha", value: "levadesclinha" },
                // Totais
                { option: "Tem Totais", value: "temtotais" },
                { option: "Total Key", value: "totkey" },
                { option: "Total Field", value: "totfield" },
                { option: "Linha Tem Total", value: "linhatemtotal" },
                { option: "Título para Total", value: "tituloparatotal" },
                { option: "Colunas Totais", value: "colunastotais" },
                { option: "Tem Expressão Total", value: "temexpressaototal" },
                { option: "Expressão Total", value: "expressaototal" },
                // Modelo
                { option: "É Modelo", value: "modelo" },
                { option: "Descrição Botão Modelo", value: "descbtnModelo" },
                { option: "Adiciona Filho", value: "addfilho" },
                // Eventos
                { option: "Evento Add", value: "eventoadd" },
                { option: "Expressão Evento Add", value: "eventoaddexpr" },
                { option: "Evento Delete", value: "eventodelete" },
                { option: "Expressão Evento Delete", value: "eventodeleteexpr" },
                { option: "Executa Change", value: "executachange" },
                { option: "Expressão Change JS", value: "expressaochangejs" },
                { option: "Executa Change Subgrupo", value: "executachangesubgrupo" },
                { option: "Expressão Change JS Subgrupo", value: "expressaochangejssubgrupo" },
                // Estilo
                { option: "Cor", value: "cor" },
                { option: "Estilo Personalizado", value: "estilopersonalizado" },
                { option: "Expressão Estilo Personalizado", value: "expressaoestilopersonalizado" },
                // Estrutura
                { option: "Tem Colunas", value: "temcolunas" },
                { option: "Leitura", value: "leitura" },
                { option: "Tipo", value: "tipo" },
                // Validação
                { option: "Campo Validação", value: "campovalid" },
                { option: "Condição Validação", value: "condicaovalidacao" },
                { option: "Sinal Negativo", value: "sinalnegativo" },
                // Listagem
                { option: "Tipo Listagem", value: "tipolistagem" },
                { option: "Objeto Listagem", value: "objectolist" },
                { option: "ExpList", value: "explist" },
                { option: "DefSelect", value: "defselect" },
                { option: "Campo Option", value: "campooption" },
                { option: "Campo Valor", value: "campovalor" },
                // Outros
                { option: "Usa FnPren", value: "usafnpren" },
                { option: "FnPren", value: "fnpren" },
                { option: "Categoria", value: "categoria" },
                { option: "Código Categoria", value: "codcategoria" }
            ]
        }),

        // ── Origem / Expressão ─────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "origem", tipo: "text", titulo: "Origem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "expressao", tipo: "text", titulo: "Expressão", classes: "form-control input-source-form  input-sm" }),

        // ── Validação ──────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "campovalid", tipo: "text", titulo: "Campo Validação", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "condicaovalidacao", tipo: "text", titulo: "Condição Validação", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "sinalnegativo", tipo: "checkbox", titulo: "Sinal Negativo", classes: "input-source-form" }),

        // ── Totais ─────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "temtotais", tipo: "checkbox", titulo: "Tem Totais", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 4, campo: "totkey", tipo: "text", titulo: "Total Key", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "totfield", tipo: "text", titulo: "Total Field", classes: "form-control input-source-form  input-sm" }),

        // ── Totais por Linha ───────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 3, campo: "linhatemtotal", tipo: "checkbox", titulo: "Linha Tem Total", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 9, campo: "tituloparatotal", tipo: "text", titulo: "Título para Total (use {thisRow})", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 12, campo: "colunastotais", tipo: "text", titulo: "Colunas Totais (separadas por vírgula, ex: coluna1,coluna2)", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "temexpressaototal", tipo: "checkbox", titulo: "Tem Expressão Total", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expressaototal", tipo: "textarea", titulo: "Expressão Total", classes: "form-control input-source-form  input-sm" }),

        // ── Classificação ──────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "categoria", tipo: "text", titulo: "Categoria", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "codcategoria", tipo: "text", titulo: "Código Categoria", classes: "form-control input-source-form  input-sm" }),

        // ── Eventos ────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "eventoadd", tipo: "checkbox", titulo: "Evento Add", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 6, campo: "eventoaddexpr", tipo: "text", titulo: "Expressão Evento Add", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "eventodelete", tipo: "checkbox", titulo: "Evento Delete", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 6, campo: "eventodeleteexpr", tipo: "text", titulo: "Expressão Evento Delete", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "executachange", tipo: "checkbox", titulo: "Executa Change", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expressaochangejs", tipo: "text", titulo: "Expressão Change JS", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "executachangesubgrupo", tipo: "checkbox", titulo: "Executa Change Subgrupo", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expressaochangejssubgrupo", tipo: "text", titulo: "Expressão Change JS Subgrupo", classes: "form-control input-source-form  input-sm" }),

        // ── Estilo ─────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "cor", tipo: "text", titulo: "Cor", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 4, campo: "estilopersonalizado", tipo: "checkbox", titulo: "Estilo Personalizado", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaoestilopersonalizado", tipo: "textarea", titulo: "Expressão Estilo Personalizado", classes: "form-control input-source-form  input-sm" }),

        // ── Pré-preenchimento ──────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "usafnpren", tipo: "checkbox", titulo: "Usa FnPren", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 8, campo: "fnpren", tipo: "text", titulo: "FnPren", classes: "form-control input-source-form  input-sm" }),

        // ── Listagem ───────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "tipolistagem", tipo: "text", titulo: "Tipo Listagem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "objectolist", tipo: "text", titulo: "Objeto Listagem", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "explist", tipo: "text", titulo: "ExpList", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "defselect", tipo: "text", titulo: "DefSelect", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "campooption", tipo: "text", titulo: "Campo Option", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ colSize: 6, campo: "campovalor", tipo: "text", titulo: "Campo Valor", classes: "form-control input-source-form  input-sm" })

    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigLinhas", idField: "linhastamp" };
}

function ColunaMrenderConfig(data) {

    this.colunastamp = data.colunastamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.desccoluna = data.desccoluna || "";
    this.campo = data.campo || "cvalor";
    this.tipo = data.tipo || "text";
    this.atributo = data.atributo || "";
    this.campovalid = data.campovalid || "";
    this.sourceTable = data.sourceTable || "";
    this.sourceKey = data.sourceKey || "";
    this.expressaodb = data.expressaodb || "";
    this.relatoriostamp = data.relatoriostamp || "";
    this.condicaovalidacao = data.condicaovalidacao || "";
    this.botaohtml = data.botaohtml || "";
    this.validacoluna = data.validacoluna || false;
    this.forcaeditavel = data.forcaeditavel || false;
    this.expresscolfun = data.expresscolfun || "";
    this.colfunc = data.colfunc || false;
    this.ordem = data.ordem || 0;
    this.expressaotbjs = data.expressaotbjs || "";
    this.usaexpresstbjs = data.usaexpresstbjs || false;
    this.usaexpressaocoldesc = data.usaexpressaocoldesc || false;
    this.expresssaojscoldesc = data.expresssaojscoldesc || "";
    this.nometb = data.nometb || "";
    this.valtb = data.valtb || "";
    this.eventoclique = data.eventoclique || false;
    this.expressaoclique = data.expressaoclique || "";
    this.condicattr = data.condicattr || false;
    this.condicattrexpr = data.condicattrexpr || "";
    this.condictipo = data.condictipo || false;
    this.condicetipoxpr = data.condicetipoxpr || "";
    this.condicfunc = data.condicfunc || false;
    this.condicfuncexpr = data.condicfuncexpr || "";
    this.categoria = data.categoria || "default";
    this.modelo = data.modelo || false;
    this.descbtnModelo = data.descbtnModelo || "Adicionar coluna";
    this.addBtn = data.addBtn || false;
    this.setinicio = data.setinicio || false;
    this.setfim = data.setfim || false;
    this.tamanho = data.tamanho || 150;
    this.alinhamento = data.alinhamento || "left";
    this.temlinhadesc = data.temlinhadesc || false;
    // this.expressaodb = data.expressaodb || "";
    this.expressaojsevento = data.expressaojsevento || "";
    this.executaeventochange = data.executaeventochange || false;
    this.inactivo = data.inactivo || false;
    this.decimais = data.decimais || 2;
    this.proibenegativo = data.proibenegativo || false;
    this.regra = data.regra || "";
    this.fixacoluna = data.fixacoluna || false;
    this.levadesclinha = data.levadesclinha || false;
    this.bindData = new BindData(data.bindData ? data.bindData : {})
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {});
    this.localsource = data.localsource || "";

    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.ligacoes = [];
    this.relationRecords = handleRelationDataByComponente("Coluna", this.colunastamp, this);



}



function handleDefaultValue(tipo) {

    switch (tipo) {

        case "text":
            return ""
        case "digit":
            return 0
        case "checkbox":
            return false
        default:
            return ""
    }
}


function handleRelationDataByComponente(componente, componentestamp, componenteData) {
    try {

        if (!componentestamp) {

            return []
        }
        if (!Array.isArray(GMrendLigacoesPredefinidas)) {
            return {}
        }

        var ligacoesPredefinidas = GMrendLigacoesPredefinidas.filter(function (item) {
            return item.elemento == componente;
        });


        var relationRecords = [];

        var ligacoes = [new Mrendconfigligacao({})];
        ligacoes = []


        ligacoesPredefinidas.forEach(function (item) {
            //filtrarpor relacoes por componente+tabela+stampcomponente

            var ligacaoExistente = GMrendLigacoesExistentes.find(function (ligacao) {
                return ligacao.elemento.trim() == componente.trim() && ligacao.tabela.trim() == item.tabela.trim() && ligacao.componentelibstamp.trim() == componentestamp.trim()
            });

            var relationData = {
                sourceTable: item.tabela || "",
                sourceKey: item.componentenegfield,
                UIObjectsUIFormConfig: item.UIObjectsUIFormConfig || [],
                record: {}
            }

            var recordExistente = ligacaoExistente ? ligacaoExistente.record : {};

            ligacaoExistente = ligacaoExistente || {};

            var mrendligacoesstamp = ligacaoExistente.mrendligacoesstamp || generateUUID();
            var componentenegstamp = ligacaoExistente.componentenegstamp || componentestamp;


            if (Object.keys(recordExistente).length == 0) {

                relationData.record[item.componentenegfield] = componentenegstamp;
                item.UIObjectsUIFormConfig.forEach(function (UIObject) {

                    relationData.record[UIObject.campo] = handleDefaultValue(UIObject.tipo);
                });

            } else {
                relationData.record = recordExistente;
            }

            relationRecords.push(relationData);

            var ligacaoData = new Mrendconfigligacao({
                mrendligacoesstamp: mrendligacoesstamp,
                elemento: componente,
                tabela: item.tabela || "",
                componentenegstamp: componentenegstamp,
                componentenegfield: item.componentenegfield || "",
                componentelibstamp: componentestamp
            })
            ligacoes.push(ligacaoData);

            GMrendLigacoes.push(ligacaoData);


        });

        componenteData.ligacoes = ligacoes;
        return relationRecords
    } catch (error) {

        console.log("ERROR NO HANDLE EXTRA FIELDS BY COMPONENTE", error)
        return []
    }



}


function MrendGrupoColuna(data) {

    this.grupocolunastamp = data.grupocolunastamp || generateUUID();
    this.relatoriostamp = data.relatoriostamp || GRelatorioStamp || "";
    this.codigogrupo = data.codigogrupo || "";
    this.descgrupo = data.descgrupo || "";
    this.fixa = data.fixa || false;
    this.ordem = data.ordem || (function () {
        var maxOrdem = (GMrendGrupoColunas || []).reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
        return maxOrdem + 1;
    })();
    this.extras = data.extras || "";
    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.localsource = data.localsource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.ligacoes = [];
    this.relationRecords = handleRelationDataByComponente("GrupoColuna", this.grupocolunastamp, this);
}

function getMrendGrupoColunaUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({
            colSize: 3,
            campo: "codigogrupo",
            tipo: "text",
            titulo: "Código do Grupo",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 3,
            campo: "descgrupo",
            tipo: "text",
            titulo: "Descrição do Grupo",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 3,
            campo: "fixa",
            tipo: "checkbox",
            titulo: "Fixa",
            classes: "input-source-form",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 3,
            campo: "ordem",
            tipo: "digit",
            titulo: "Ordem",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        /*  new UIObjectFormConfig({
              colSize: 12,
              campo: "extras",
              tipo: "textarea",
              titulo: "Extras",
              classes: "form-control input-source-form input-sm",
              contentType: "input"
          })*/
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendGrupoColunas", idField: "grupocolunastamp" };
}

function MrendGrupoColunaItem(data) {
    this.grupocolunaitemstamp = data.grupocolunaitemstamp || generateUUID();
    this.grupocolunastamp = data.grupocolunastamp || "";
    this.relatoriostamp = data.relatoriostamp || GRelatorioStamp || "";
    this.colunastamp = data.colunastamp || "";
    this.ordem = data.ordem || (function () {
        var maxOrdem = (GMrendGrupoColunaItems || []).reduce(function (max, item) {
            return Math.max(max, Number(isNumber(item.ordem) ? item.ordem : 0) || 0);
        }, 0);
        return maxOrdem + 1;
    })();
    this.extras = data.extras || "";
    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.localsource = data.localsource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.ligacoes = [];
    this.relationRecords = handleRelationDataByComponente("GrupoColunaItem", this.grupocolunaitemstamp, this);
}

function getMrendGrupoColunaItemUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [

        new UIObjectFormConfig({
            colSize: 12,
            campo: "colunastamp",
            tipo: "select",
            titulo: "Coluna",
            fieldToOption: "desccoluna",
            contentType: "select",
            fieldToValue: "colunastamp",
            selectCustomData: "",
            selectVariable: "GMrendConfigColunas",
            isReactive: true,
            selectValues: [],
            classes: "form-control input-source-form input-sm"
        }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "ordem",
            tipo: "digit",
            titulo: "Ordem",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "grupocolunaitemstamp",
            tipo: "button",
            style: "background:#d9534f!important;color:white",
            titulo: "<span class='glyphicon glyphicon-trash'></span>",
            customData: "type='button' @click='removeGrupoColunaItem(colunaGrupoItem)'",
            classes: "btn btn-sm btn-danger",
            contentType: "button"
        }),
        /* new UIObjectFormConfig({
             colSize: 12,
             campo: "extras",
             tipo: "textarea",
             titulo: "Extras",
             classes: "form-control input-source-form input-sm",
             contentType: "input"
         })*/
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendGrupoColunaItems", idField: "grupocolunaitemstamp" };
}





function Mrendconfigligacao(data) {

    this.mrendligacoesstamp = data.mrendligacoesstamp || generateUUID();
    this.elemento = data.elemento || "";
    this.tabela = data.tabela || "";
    this.componentenegstamp = data.componentenegstamp || "";
    this.componentenegfield = data.componentenegfield || "";
    this.componentelibstamp = data.componentelibstamp || "";
    this.relatoriostamp = GRelatorioStamp || "";
    this.ligacaokey = (this.componentelibstamp || "") + "___" + (this.componentenegstamp || "");
    this.UIObjectsUIFormConfig = data.UIObjectsUIFormConfig || [];
    this.record = data.record || {};

}


function UIObjectFormConfig(data) {

    this.campo = data.campo || "";
    this.tipo = data.tipo || "";
    this.titulo = data.titulo || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.selectValues = data.selectValues || [];
    this.colSize = data.colSize || "4";
    this.isReactive = data.isReactive || false;
    this.selectVariable = data.selectVariable || "";
    this.fieldToOption = data.fieldToOption || "";
    this.fieldToValue = data.fieldToValue || "";
    this.contentType = data.contentType || "input";
    this.multiSelect = data.multiSelect || false;
}




function getColunaUIObjectFormConfigAndSourceValues() {

    var objectsUIFormConfig = [

        // ── Identificação ──────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 3, campo: "codigocoluna", tipo: "text", titulo: "Código", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "desccoluna", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "campo", tipo: "text", titulo: "Campo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "categoria", tipo: "text", titulo: "Categoria", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Apresentação ──────────────────────────────────────────────
        new UIObjectFormConfig({
            colSize: 6,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Texto", value: "text" },
                { option: "Número", value: "digit" },
                { option: "Lógico", value: "logic" },
                { option: "Textarea", value: "textarea" },
                { option: "Tabela", value: "table" },
                { option: "Botão", value: "button" },
                { option: "Data", value: "date" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 3, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 3,
            campo: "alinhamento",
            tipo: "select",
            titulo: "Alinhamento",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            selectValues: [
                { option: "Esquerda", value: "left" },
                { option: "Centro", value: "center" },
                { option: "Direita", value: "right" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 3, campo: "decimais", tipo: "digit", titulo: "Decimais", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "temlinhadesc", tipo: "checkbox", titulo: "Tem Descrição da linha.", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "fixacoluna", tipo: "checkbox", titulo: "Fixa Coluna", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "levadesclinha", tipo: "checkbox", titulo: "Leva Descrição da Linha", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "proibenegativo", tipo: "checkbox", titulo: "Proíbe Negativo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "setinicio", tipo: "checkbox", titulo: "Set Início", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 3, campo: "setfim", tipo: "checkbox", titulo: "Set Fim", classes: "input-source-form", contentType: "input" }),

        // ── Modelo ────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "modelo", tipo: "checkbox", titulo: "É modelo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "descbtnModelo", tipo: "text", titulo: "Descrição Botão Modelo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "addBtn", tipo: "checkbox", titulo: "Botão para adicionar a coluna visível", classes: "input-source-form", contentType: "input" }),

        // ── Atributo / Condições ──────────────────────────────────────
        new UIObjectFormConfig({
            colSize: 6,
            campo: "atributo",
            tipo: "select",
            titulo: "Atributo",
            fieldToOption: "option",
            fieldToValue: "value",
            classes: "form-control input-source-form  input-sm ",
            contentType: "select",
            selectValues: [
                { option: "", value: "" },
                { option: "Ativo", value: "enabled" },
                { option: "Desativado", value: "disabled" },
                { option: "Somente leitura", value: "readonly" }
            ]
        }),
        new UIObjectFormConfig({ colSize: 6, campo: "forcaeditavel", tipo: "checkbox", titulo: "Força coluna para ser editável", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "condicattr", tipo: "checkbox", titulo: "Tem condição do atributo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "condicattrexpr", tipo: "text", titulo: "Expressão  para o atributo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "condictipo", tipo: "checkbox", titulo: "Tem condição do Tipo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "condicetipoxpr", tipo: "text", titulo: "Expressão para definir o  Tipo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Validação ─────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "validacoluna", tipo: "checkbox", titulo: "Valida Coluna", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "campovalid", tipo: "text", titulo: "Campo Validação", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "condicaovalidacao", tipo: "text", titulo: "Condição Validação", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Função ────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "colfunc", tipo: "checkbox", titulo: "Coluna Função", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "condicfunc", tipo: "checkbox", titulo: "Tem condição para definir se é função", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "condicfuncexpr", tipo: "textarea", titulo: "Expressão  para definir se tem função", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expresscolfun", tipo: "textarea", titulo: "Expressão Coluna Função", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Tabela (Source) ───────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "sourceTable", tipo: "text", titulo: "Tabela fonte", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "sourceKey", tipo: "text", titulo: "Chave fonte", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "usaexpresstbjs", tipo: "checkbox", titulo: "Usa Expressão TB JS", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expressaotbjs", tipo: "textarea", titulo: "Expressão Tabela JS", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "nometb", tipo: "text", titulo: "Nome TB", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "valtb", tipo: "text", titulo: "Valor TB", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaodb", tipo: "textarea", titulo: "Expressão Base de dados", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Descrição da coluna ───────────────────────────────────────
        new UIObjectFormConfig({ colSize: 4, campo: "usaexpressaocoldesc", tipo: "checkbox", titulo: "Usa Expressão Coluna Desc.", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 8, campo: "expresssaojscoldesc", tipo: "textarea", titulo: "Expressão JS Coluna Desc.", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── Eventos ───────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 6, campo: "eventoclique", tipo: "checkbox", titulo: "Evento clique", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "expressaoclique", tipo: "textarea", titulo: "Expressão Clique", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 2, campo: "executaeventochange", tipo: "checkbox", titulo: "Executa Evento Change", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 10, campo: "expressaojsevento", tipo: "text", titulo: "Expressão JS Evento", classes: "form-control input-source-form  input-sm ", contentType: "input" }),

        // ── HTML ──────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 12, campo: "botaohtml", tipo: "textarea", titulo: "Botão HTML", classes: "form-control input-source-form  input-sm ", contentType: "textarea" }),

        // ── Regra ─────────────────────────────────────────────────────
        new UIObjectFormConfig({ colSize: 12, campo: "regra", tipo: "textarea", titulo: "Regra", classes: "form-control input-source-form  input-sm ", contentType: "input" })

    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigColunas", idField: "colunastamp" };
}





function CelulaMrenderConfig(data) {

    this.linhastamp = data.linhastamp || "";
    this.celulastamp = data.celulastamp || "";
    this.colunastamp = data.colunastamp || "";
    this.codigocoluna = data.codigocoluna || "";
    this.sinalnegativo = data.sinalnegativo || "";
    this.inactivo = data.inactivo || false;
    this.condicinactivo = data.condicinactivo || false;
    this.condicinactexpr = data.condicinactexpr || "";
    this.desabilitado = data.desabilitado || false;
    this.usafnpren = data.usafnpren || false;
    this.atributo = data.atributo || "";
    this.fnpren = data.fnpren || "";
    this.expressaotbjs = data.expressaotbjs || "";
    this.usaexpresstbjs = data.usaexpresstbjs || false;


    // Novos campos
    this.valordefeito = data.valordefeito || false;
    this.valordefeitoexpr = data.valordefeitoexpr || "";
    this.valdefafinstancia = data.valdefafinstancia || false;

    this.bindData = new BindData(data.bindData ? data.bindData : {});
    this.fx = data.fx || "";
    this.temfx = data.temfx || false;
    this.fxdata = new FXData(data.fxdata ? data.fxdata : {})
    this.localsource = data.localsource || "";
    this.objectsUIFormConfig = data.objectsUIFormConfig || [];
    this.idField = data.idField || "";
    this.ligacoes = [];
    this.relationRecords = handleRelationDataByComponente("Celula", this.celulastamp, this);

}

function getCelulaUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [

        new UIObjectFormConfig({ campo: "sinalnegativo", tipo: "checkbox", titulo: "Sinal Negativo", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 6, campo: "condicinactivo", tipo: "checkbox", titulo: "Condição Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "condicinactexpr", tipo: "text", titulo: "Expressão Inactivo", classes: "form-control input-source-form  input-sm ", contentType: "input" }),
        new UIObjectFormConfig({ campo: "desabilitado", tipo: "checkbox", titulo: "Desabilitado", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "usafnpren", tipo: "checkbox", titulo: "Usa FnPren", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "atributo", tipo: "text", titulo: "Atributo", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "fnpren", tipo: "text", titulo: "FnPren", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "fx", tipo: "text", titulo: "FX", classes: "form-control input-source-form  input-sm" }),
        new UIObjectFormConfig({ campo: "temfx", tipo: "checkbox", titulo: "Tem FX", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "usaexpresstbjs", tipo: "checkbox", titulo: "Usa Expressão Tabela JS", classes: "input-source-form" }),
        new UIObjectFormConfig({ campo: "expressaotbjs", tipo: "textarea", titulo: "Expressão Tabela JS", classes: "form-control input-source-form  input-sm" }),

        // Novos campos de valor defeito
        new UIObjectFormConfig({ colSize: 6, campo: "valordefeito", tipo: "checkbox", titulo: "Valor Defeito", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 6, campo: "valdefafinstancia", tipo: "checkbox", titulo: "Valor Defeito Após Instância", classes: "input-source-form" }),
        new UIObjectFormConfig({ colSize: 12, campo: "valordefeitoexpr", tipo: "textarea", titulo: "Expressão Valor Defeito", classes: "form-control input-source-form  input-sm" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMrendConfigCelulas", idField: "celulastamp" };
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

function FXData(data) {
    this.tipo = data.tipo || "";
    this.activo = data.activo || false;
    this.expressao = data.expressao || ""
    this.colrefs = Array.isArray(data.colrefs) ? Array.from(data.colrefs) : []
}



var GMrendConfigLinhas = [new LinhaMrenderConfig({})]
var GMrendConfigColunas = [new ColunaMrenderConfig({})]
var GMrendConfigCelulas = [new CelulaMrenderConfig({})];
var GlickedRowComponent

// Função para atualizar o estilo de uma linha baseado se tem filhos ou não
function atualizarEstiloLinhaComFilhos(linhastamp) {
    var table = $("#" + GRendConfigTableHtml.tableId);
    var $row = table.find("tbody tr#" + linhastamp);

    if ($row.length === 0) return;

    // Verificar se tem filhos
    var temFilhos = GMrendConfigLinhas.some(function (l) {
        return l.linkstamp === linhastamp;
    });

    if (temFilhos) {
        $row.css("background", "#e9f1ff");
        $row.addClass("linha-com-filhos");
    } else {
        $row.css("background", "");
        $row.removeClass("linha-com-filhos");
    }
}

var GRelatorioStamp = ""
var GConfigCodigo = ""
var GExtraConfigContainer = ""
var GDefaultInitConfig = null
var GRelatorioConfig = null
var GRelatorioTable = "u_mrendrel"
var GRelatorioTableKey = "u_mrendrelstamp"
var GRelatorioTableFilterField = "codigo"
GRenderedLinhas = []
GMrendConfigColunas = []
GMrendConfigLinhas = []
GMrendConfigCelulas = [];

var GMrendLigacoes = [new Mrendconfigligacao({})];
GMrendLigacoes = [];

var GMrendLigacoesExistentes = [new Mrendconfigligacao({})];
GMrendLigacoesExistentes = [];

var GMrendLigacoesPredefinidas = [new Mrendconfigligacao({})];

var GMrendGrupoColunas = [new MrendGrupoColuna({})];
GMrendGrupoColunas = [];

var GMrendGrupoColunaItems = [new MrendGrupoColunaItem({})];
GMrendGrupoColunaItems = [];

var GMrendDeleteRecords = [];

// Initialize treetable for hierarchical display
function initMrendConfigTreeTable() {
    var table = $("#" + GRendConfigTableHtml.tableId);
    if (table.length === 0) {
        console.warn("TreeTable: table #" + GRendConfigTableHtml.tableId + " not found in DOM");
        return;
    }

    // Inject custom styles for treetable - similar to otherStyles() pattern
    if (!document.getElementById("mrendConfigTreeTableStyles")) {
        var style = document.createElement("style");
        style.id = "mrendConfigTreeTableStyles";

        var cssRules = "";

        // Remove borders from treetable elements
        cssRules += "#inputReportTable.treetable, #inputReportTable.treetable tbody tr td, #inputReportTable.treetable thead tr th { border: none !important; }";

        // Treetable indenter styles - minimal interference
        //cssRules += "#inputReportTable.treetable tr.collapsed span.indenter a, #inputReportTable.treetable tr.expanded span.indenter a { background: none !important; display: inline-block !important; }";
        //  cssRules += "#inputReportTable.treetable tr.collapsed, #inputReportTable.treetable tr.expanded { background: inherit !important; }";
        // cssRules += "#inputReportTable.treetable span.indenter { display: inline-block !important; width: 19px !important; margin-right: 5px !important; vertical-align: middle !important; }";
        // cssRules += "#inputReportTable.treetable span.indenter a { width: 16px !important; height: 16px !important; display: inline-block !important; }";
        //  cssRules += "#inputReportTable.treetable tbody tr td { padding: 8px !important; vertical-align: middle !important; }";
        //cssRules += "#inputReportTable.treetable { border-collapse: separate !important; }";

        // Fix button widths and icon centering
        //cssRules += "#inputReportTable.treetable td.linha-acoes { white-space: nowrap !important; }";
        //cssRules += "#inputReportTable.treetable td.linha-acoes .btn { display: inline-block !important; padding: 5px 10px !important; line-height: 1.42857143 !important; text-align: center !important; width: auto !important; }";
        //cssRules += "#inputReportTable.treetable td.linha-acoes .btn .glyphicon { display: inline-block !important; vertical-align: middle !important; }";
        //cssRules += "#inputReportTable.treetable td.linha-acoes > div { display: contents !important; }";

        style.textContent = cssRules;
        document.head.appendChild(style);
    }

    // Destroy existing treetable instance if any
    try {
        table.treetable('destroy');
        $(".indenter").remove();
    } catch (e) {
        // No existing instance, continue
    }

    // Verify we have rows with data-tt-id before initializing
    var rowsWithTreeData = table.find('tbody tr[data-tt-id]');
    if (rowsWithTreeData.length === 0) {
        console.warn("TreeTable: no rows with data-tt-id found");
        return;
    }

    // Initialize treetable
    try {
        table.treetable({
            expandable: true,
            initialState: 'expanded'
        });

        console.log("TreeTable initialized successfully with " + rowsWithTreeData.length + " rows");

        // Expand all nodes by default
        table.treetable('expandAll');
    } catch (error) {
        console.error("Error initializing treetable:", error);
    }
}

var GRendConfigTableHtml = {
    tableId: "dd",
    classes: "table table-hover config-input-report-table ",
    customData: "",
    style: "",
    header: {
        row: [{

            style: "",
            rowId: "",
            classes: "",
            customData: "",
            cols: [{
                style: "",
                colId: "",
                classes: "",
                content: "",
                customData: "",
            }]
        }]
    },
    body: {

        customData: "",
        rows: [
            {

                style: "",
                rowId: "",
                classes: "",
                customData: "",
                cols: [{
                    style: "",
                    colId: "",
                    classes: "",
                    content: "",
                    customData: "",
                }]
            }
        ]

    }
}


function MrendInitConfig(data) {
    // Espelha exatamente new Mrend(options)
    // enableEdit, resetSourceStamp e remoteFetch sao expressoes JS (string)
    // que serao avaliadas com eval() no momento de inicializar o Mrend
    this.enableEdit = data.enableEdit || "";
    this.resetSourceStamp = data.resetSourceStamp || "";
    this.containerToRender = data.containerToRender || "";
    this.datasourceName = data.datasourceName || "";
    this.tableSourceName = data.tableSourceName || "";
    this.table = data.table || "";
    this.codigo = data.codigo || "";
    this.remoteFetch = data.remoteFetch || "";

    // RemoteFetchData: url, type, data  (igual ao construtor interno do Mrend)
    this.remoteFetchData = data.remoteFetchData || { url: "", "type": "GET", "data": {} };

    // DbTableToMrendObject
    this.dbTableToMrendObject = data.dbTableToMrendObject || {
        defaultColumnName: "",
        chunkMapping: false,
        table: "",
        dbName: "",
        tableKey: "",
        extras: {
            ordemField: "",
            linkField: "",
            cellIdField: "",
            colunaField: "",
            linhaField: "",
            rowIdField: "",
            descLinhaField: "",
            descColunaField: "",
            ordemColunaField: "",
            tipocolField: ""
        }
    };

    this.recordData = { stamp: (data.recordData && data.recordData.stamp) ? data.recordData.stamp : "" };
    this.afterRenderCallback = data.afterRenderCallback || "";
    this.configjson = data.configjson || "";
    this.config = data.config || {};
    this.schemas = data.schemas || [];
    this.tabulatorHeight = data.tabulatorHeight || "400px";
}

MrendInitConfig.createDynamicSchema = function () {
    return {
        "type": "object",
        "title": "Configuração de Inicialização Mrend",
        "properties": {
            "enableEdit": { "type": "string", "title": "Permitir Edição (expressão JS)", "description": "Ex: $(\"#mainPage\").data(\"state\") == \"editar\"" },
            "resetSourceStamp": { "type": "string", "title": "Reset Source Stamp (expressão JS)", "description": "Ex: $(\"#mainPage\").data(\"state\") != \"editar\"" },
            "containerToRender": { "type": "string", "title": "Selector do Container de Render" },
            "schemas": {
                "type": "array",
                "title": "Colunas Dexie (1ª = PK)",
                "items": { "type": "string", "title": "Campo" }
            },
            "datasourceName": { "type": "string", "title": "Nome do Datasource (Dexie)" },
            "tableSourceName": { "type": "string", "title": "Nome da Tabela Source no Datasource" },
            "table": { "type": "string", "title": "Tabela (options.table)" },
            "codigo": { "type": "string", "title": "Código do Relatório" },
            "remoteFetch": { "type": "string", "title": "Usar Fetch Remoto (expressão JS)", "description": "Ex: true" },
            "remoteFetchData": {
                "type": "object",
                "title": "RemoteFetchData",
                "properties": {
                    "url": { "type": "string", "title": "URL do pedido" },
                    "type": { "type": "string", "title": "Método HTTP", "enum": ["GET", "POST"] },
                    "data": {
                        "type": "object",
                        "title": "Parâmetros enviados no pedido (data do $.ajax)",
                        "properties": {
                            "__EVENTARGUMENT": { "type": "string", "title": "__EVENTARGUMENT (JSON.stringify dos args)" }
                        }
                    }
                }
            },
            "dbTableToMrendObject": {
                "type": "object",
                "title": "DbTableToMrendObject",
                "properties": {
                    "table": { "type": "string", "title": "Tabela BD" },
                    "dbName": { "type": "string", "title": "Nome da BD Local (Dexie)" },
                    "tableKey": { "type": "string", "title": "Chave da Tabela" },
                    "defaultColumnName": { "type": "string", "title": "Nome da Coluna por Defeito" },
                    "chunkMapping": { "type": "boolean", "title": "Chunk Mapping", "format": "checkbox" },
                    "extras": {
                        "type": "object",
                        "title": "DbTableExtras",
                        "properties": {
                            "ordemField": { "type": "string", "title": "Campo Ordem" },
                            "linkField": { "type": "string", "title": "Campo Link (rowid pai)" },
                            "linkCodigoField": { "type": "string", "title": "Campo Link Codigo (codigo pai)" },
                            "descLinkField": { "type": "string", "title": "Campo Desc. Link (descricao pai)" },
                            "cellIdField": { "type": "string", "title": "Campo Cell ID" },
                            "colunaField": { "type": "string", "title": "Campo Coluna" },
                            "linhaField": { "type": "string", "title": "Campo Linha" },
                            "rowIdField": { "type": "string", "title": "Campo Row ID" },
                            "descLinhaField": { "type": "string", "title": "Campo Desc. Linha" },
                            "descColunaField": { "type": "string", "title": "Campo Desc. Coluna" },
                            "ordemColunaField": { "type": "string", "title": "Campo Ordem Coluna" },
                            "tipocolField": { "type": "string", "title": "Campo Tipo Coluna" }
                        }
                    }
                }
            },
            "recordData": {
                "type": "object",
                "title": "Record Data (campos do registo PHC)",
                "required": ["stamp"],
                "properties": {
                    "stamp": { "type": "string", "title": "Stamp (expressão JS)", "description": "Ex: getReportStamp() ou $(\"#ctl00_conteudo_mlstamp_mLabel1\").text()", "default": "" }
                }
            },
            "afterRenderCallback": { "type": "string", "title": "Callback Apos Render (nome da funcao)" },
            "tabulatorHeight": { "type": "string", "title": "Altura da grelha (ex: 400px, 600px)", "description": "Altura fixa para ativar scroll e fixar cabeçalho", "default": "400px" }

        }
    };
};

function initJSONEditorMrendConfig(relatorioConfig) {
    // O servidor devolve DataTable serializada → array; extraímos o primeiro registo
    var relatorioRecord = Array.isArray(relatorioConfig) ? (relatorioConfig[0] || {}) : (relatorioConfig || {});
    GRelatorioConfig = relatorioRecord;
    if (!GExtraConfigContainer) return;
    var container = document.querySelector(GExtraConfigContainer);
    if (!container) return;

    container.innerHTML = "";

    var schema = MrendInitConfig.createDynamicSchema();
    var editor = new JSONEditor(container, {
        schema: schema,
        theme: 'bootstrap4',
        iconlib: 'fontawesome4',
        disable_edit_json: true,
        disable_properties: true,
        disable_array_delete_last_row: true,
        disable_array_delete_all_rows: true,
        collapsed: true
    });

    // Campo da BD é rendopt (não extras)
    var extrasjson = relatorioRecord.rendopt || relatorioRecord.extras || "";

    editor.on('ready', function () {
        var configToLoad;
        if (extrasjson && extrasjson.trim() !== '') {
            try {
                configToLoad = JSON.parse(extrasjson);
            } catch (error) {
                console.warn('Erro ao carregar configuração extra do relatório:', error);
            }
        }
        if (!configToLoad) {
            configToLoad = new MrendInitConfig(GDefaultInitConfig || {});
        } else {
            // Merge: preencher campos em falta no rendopt existente com os valores do defaultInitConfig
            var defaults = new MrendInitConfig(GDefaultInitConfig || {});
            Object.keys(defaults).forEach(function (key) {
                var missing = configToLoad[key] === undefined || configToLoad[key] === null;
                var emptyArr = Array.isArray(configToLoad[key]) && configToLoad[key].length === 0;
                if (missing || emptyArr) {
                    configToLoad[key] = defaults[key];
                }
            });
            // Deep-merge de dbTableToMrendObject.extras: garantir que NOVAS chaves
            // declaradas no schema (ex: linkCodigoField, descLinkField) existem no
            // valor carregado — caso contrario o JSONEditor (disable_properties:true)
            // nao renderiza inputs para chaves ausentes.
            try {
                var defExtras = defaults && defaults.dbTableToMrendObject && defaults.dbTableToMrendObject.extras;
                if (defExtras && configToLoad.dbTableToMrendObject) {
                    if (!configToLoad.dbTableToMrendObject.extras) {
                        configToLoad.dbTableToMrendObject.extras = {};
                    }
                    Object.keys(defExtras).forEach(function (k) {
                        if (configToLoad.dbTableToMrendObject.extras[k] === undefined ||
                            configToLoad.dbTableToMrendObject.extras[k] === null) {
                            configToLoad.dbTableToMrendObject.extras[k] = defExtras[k] || "";
                        }
                    });
                }
            } catch (e) {
                console.warn("Merge extras falhou:", e);
            }
        }
        // Normalizar schemas: pode vir como string JSON de versões anteriores
        if (typeof configToLoad.schemas === 'string') {
            try {
                var parsed = JSON.parse(configToLoad.schemas);
                // formato antigo: array de objectos [{tableSourceName, tableSourceSchema}]
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                    configToLoad.schemas = parsed[0].tableSourceSchema || [];
                } else {
                    configToLoad.schemas = Array.isArray(parsed) ? parsed : [];
                }
            } catch (e) {
                configToLoad.schemas = [];
            }
        }
        // formato antigo: array de objectos [{tableSourceName, tableSourceSchema:[...]}]
        if (Array.isArray(configToLoad.schemas) && configToLoad.schemas.length > 0 && typeof configToLoad.schemas[0] === 'object') {
            configToLoad.schemas = configToLoad.schemas[0].tableSourceSchema || [];
        }
        editor.setValue(configToLoad);

        // Manter collapsed após setValue (setValue expande todos os nós)
        setTimeout(function () {
            for (var key in editor.editors) {
                if (editor.editors.hasOwnProperty(key)) {
                    var ed = editor.editors[key];
                    if (!ed || !ed.schema) continue;
                    if (['array', 'object'].indexOf(ed.schema.type) !== -1 && ed.editor_holder) {
                        ed.editor_holder.style.display = 'none';
                        ed.collapsed = true;
                        if (ed.toggle_button) {
                            ed.setButtonText(ed.toggle_button, '', 'expand', ed.translate('button_expand'));
                        }
                    }
                }
            }
        }, 0);
    });

    editor.on('change', function () {
        var currentValue = editor.getValue();
        relatorioRecord.rendopt = JSON.stringify(currentValue);
    });
}

$(document).ready(function () {

    loadMrendSortableStyles(); // estilos partilhados por drag&drop de colunas e linhas
    registerListenersMrender();
    organizarEcraMrender();

})


function organizarEcraMrender() {

    $("#ctl00_conteudo_u_mrendrelstamp").hide();
}

/**
 * Resolve o relatoriostamp canónico para esta sessão.
 * Regra única (usar em todos os pontos):
 *   1) Lê o valor do label do registo aberto. O nome do campo stamp é
 *      configurável via initTabelaConfiguracaoMrender({ relatorioTableKey })
 *      e fica em GRelatorioTableKey (default: "u_mrendrelstamp").
 *      Selector: #ctl00_conteudo_<GRelatorioTableKey>_mLabel1
 *   2) Se vier vazio, gera um novo UUID.
 * Esta função é a fonte da verdade para o stamp do relatório, usada também no import.
 */
function resolveRelatorioStamp() {
    var stampField = GRelatorioTableKey || "u_mrendrelstamp";
    var domStamp = "";
    try {
        domStamp = ($("#ctl00_conteudo_u_mrendrelstamp").text() || "").trim();
    } catch (e) { /* sem DOM */ }
    if (domStamp) return domStamp;
    return (typeof generateUUID === "function") ? generateUUID() : "";
}

/**
 * Lê os campos do registo aberto da tabela de relatório directamente do DOM.
 * A tabela de relatório por defeito é u_mrendrel, mas pode ser sobreposta via
 * initTabelaConfiguracaoMrender({ relatorioTable, relatorioTableKey, relatorioTableFilterField }).
 * Os campos são labels read-only no ecrã PHC, por isso devem ser sempre
 * obtidos do DOM (e não de GRelatorioConfig, que pode estar desactualizado).
 *
 * Mapping campo -> selector:
 *   relatoriostamp -> #ctl00_conteudo_<GRelatorioTableKey>_mLabel1         (dinâmico)
 *   codigo         -> #ctl00_conteudo_<GRelatorioTableFilterField>_mLabel1 (dinâmico)
 *   nome           -> #ctl00_conteudo_nome_mLabel1
 *   categoria      -> #ctl00_conteudo_categoria_mLabel1
 *   expfonte       -> #ctl00_conteudo_expfonte_mLabel  (sem o sufixo 1)
 *   tipo           -> #ctl00_conteudo_tipo_mLabel1
 *
 * Para o stamp aplica-se a regra do resolveRelatorioStamp (DOM -> UUID).
 */
function readRelatorioFromDOM() {
    function readLabel(id) {
        var $el = $("#" + id);
        if (!$el.length) return "";
        // .text() para labels PHC; .val() como fallback para inputs/selects
        var txt = ($el.text() || "").trim();
        if (txt) return txt;
        try { return (($el.val() || "") + "").trim(); } catch (e) { return ""; }
    }
    var codigoField = GRelatorioTableFilterField || "codigo";
    return {
        relatoriostamp: resolveRelatorioStamp(),
        codigo: readLabel("ctl00_conteudo_" + codigoField + "_mLabel1"),
        nome: readLabel("ctl00_conteudo_nome_mLabel1"),
        categoria: readLabel("ctl00_conteudo_categoria_mLabel1"),
        expfonte: readLabel("ctl00_conteudo_expfonte_mLabel"),
        tipo: readLabel("ctl00_conteudo_tipo_mLabel1")
    };
}

/**
 * Escreve valores no formulário PHC (cabeçalho do relatório) tanto no
 * input editável (`#ctl00_conteudo_<field>`) como na label de visualização
 * (`#ctl00_conteudo_<field>_mLabel1`). Cobre <input>, <select>, <textarea>,
 * <span>/<label>. Útil ao importar uma config base para um relatório novo.
 *
 * @param {Object} values  { codigo, nome, categoria, tipo, expfonte }
 *                         A chave 'codigo' é mapeada para o campo dinamico
 *                         GRelatorioTableFilterField.
 */
function writeRelatorioToDOM(values) {
    if (!values) return;
    var codigoField = GRelatorioTableFilterField || "codigo";
    var map = [
        { key: "codigo", field: codigoField, labelSuffix: "_mLabel1" },
        { key: "nome", field: "nome", labelSuffix: "_mLabel1" },
        { key: "categoria", field: "categoria", labelSuffix: "_mLabel1" },
        { key: "tipo", field: "tipo", labelSuffix: "_mLabel1" },
        { key: "expfonte", field: "expfonte", labelSuffix: "_mLabel" }
    ];
    map.forEach(function (m) {
        if (!Object.prototype.hasOwnProperty.call(values, m.key)) return;
        var val = values[m.key];
        if (val == null) return;
        // Input/select/textarea editavel
        var $input = $("#ctl00_conteudo_" + m.field);
        if ($input.length) {
            try { $input.val(val).trigger("change"); } catch (e) { /* noop */ }
        }
        // Label read-only (modo visualizacao)
        var $label = $("#ctl00_conteudo_" + m.field + m.labelSuffix);
        if ($label.length) {
            // Para spans/labels usa .text(); para inputs hidden tambem .val()
            try { $label.text(val); } catch (e) { /* noop */ }
            try { $label.val(val); } catch (e) { /* noop */ }
        }
    });
}


function initTabelaConfiguracaoMrender(config) {

    GMrendLigacoesPredefinidas = config.ligacoes || [];
    GConfigCodigo = config.codigo || "";
    GExtraConfigContainer = config.extraConfigContainer || "";
    GDefaultInitConfig = config.defaultInitConfig || null;
    GRelatorioTable = config.relatorioTable || "u_mrendrel";
    GRelatorioTableKey = config.relatorioTableKey || "u_mrendrelstamp";
    GRelatorioTableFilterField = config.relatorioTableFilterField || "codigo";
    // Resolve o stamp DEPOIS de definir GRelatorioTableKey, para que resolveRelatorioStamp
    // use o selector correcto (#ctl00_conteudo_<GRelatorioTableKey>_mLabel1).
    GRelatorioStamp = config.relatoriostamp || resolveRelatorioStamp();
    GRendConfigTableHtml = {
        tableId: "dd",
        classes: "table table-hover config-input-report-table ",
        customData: "",
        style: "",
        header: {
            row: [{

                style: "",
                rowId: "",
                classes: "",
                customData: "",
                cols: [{
                    style: "",
                    colId: "",
                    classes: "",
                    content: "",
                    customData: "",
                }]
            }]
        },
        body: {

            customData: "",
            rows: [
                {

                    style: "",
                    rowId: "",
                    classes: "",
                    customData: "",
                    cols: [{
                        style: "",
                        colId: "",
                        classes: "",
                        content: "",
                        customData: "",
                    }]
                }
            ]

        }
    }

    GRendConfigTableHtml.tableId = "inputReportTable"

    GRendConfigTableHtml.classes = "table table-hover config-input-report-table "
    GRendConfigTableHtml.body.rows = []

    GRendConfigTableHtml.header.row.classes = "defgridheader"
    //GRendConfigTableHtml.header.row.style = "background:#033076!important"
    GRendConfigTableHtml.header.row.cols = []

    var colunaHtmlButtonAddRubrica = "<div id='colunaGrupoContainer'  class='row'>"
    colunaHtmlButtonAddRubrica += "   <div class='col-md-12'><div style='display:flex;column-gap:0.5em' >"
    colunaHtmlButtonAddRubrica += "      <div><button  type='button' id='addColunaBtn' class='btn btn-primary'>Adicionar Coluna</button></div>"
    colunaHtmlButtonAddRubrica += "      <div><button @click='addGrupoColuna' type='button' id='addGrupoColunaBtn' class='btn btn-default'>Adicionar Grupo de colunas</button></div>"
    colunaHtmlButtonAddRubrica += "      </div>"
    colunaHtmlButtonAddRubrica += "   </div>"

    colunaHtmlButtonAddRubrica += "<div  style='margin-top:0.9em' class='coluna-grupo-container col-md-12'></div>"

    colunaHtmlButtonAddRubrica += "  </div>"




    var tableHtml = colunaHtmlButtonAddRubrica;

    tableHtml += "<div style='margin-top:2em' class='col-md-12' >" + generateTableV2(GRendConfigTableHtml) + "</div>"
    tableHtml += "<div  class='col-md-12 pull-left'>"
    tableHtml += "    <button  type='button' style='margin-left:0.4em' id='addLinhaBtn' class='btn btn-default'>Adicionar Linha</button>"
    tableHtml += "    <button onClick='actualizarConfiguracaoMrender()' type='button' style='margin-left:0.4em' id='actualizarConfig' class='btn btn-primary'>Actualizar Configuração</button>"
    tableHtml += "    <button onClick='exportarConfiguracaoMrender()' type='button' style='margin-left:0.4em' id='exportarConfigBtn' class='btn btn-default' title='Exportar configuração para ficheiro JSON'><span class='glyphicon glyphicon-download-alt'></span> Exportar</button>"
    tableHtml += "    <button onClick='importarConfiguracaoMrender()' type='button' style='margin-left:0.4em' id='importarConfigBtn' class='btn btn-default' title='Importar configuração a partir de ficheiro JSON'><span class='glyphicon glyphicon-import'></span> Importar</button>"
    tableHtml += "    <input type='file' id='mrendConfigImportFile' accept='.json,application/json' style='display:none' />"

    tableHtml += "  </div>"
    $("#campos > .row:last").after("<div style='margin-top:2.5em' class='row table-responsive  sourceTabletableContainer'>" + tableHtml + "</div>");

    fetchConfigMrender(GConfigCodigo);




}

function setColunaGrupoReactive() {

    var $colunaGrupoContainer = $(".coluna-grupo-container");
    $colunaGrupoContainer.empty(); // Clear existing content

    var colunaGrupoCollapse = "<div v-for='grupoColuna in GMrendGrupoColunas'>";
    // Create a new collapse element
    colunaGrupoCollapse += '<div style="padding: 20px 20px 5px 20px" class="home-collapse" :id="grupoColuna.codigogrupo">';

    // Add the collapse header
    colunaGrupoCollapse += '<div class="home-collapse-header mainformcptitulo">';
    colunaGrupoCollapse += '<p style="font-family:Nunito, sans-serif;"><span class="glyphicon glyphicon-triangle-right"></span> {{ grupoColuna.descgrupo}}</p>';
    // collapseHTML += '<div class="row"><span class="collapse-content">' + collapseData.headerContent + '</span></div>';
    colunaGrupoCollapse += '</div>';

    // Add the collapse body with the provided content
    colunaGrupoCollapse += '<div class="home-collapse-body hidden">';

    var objectsUIFormConfig = getMrendGrupoColunaUIObjectFormConfigAndSourceValues().objectsUIFormConfig

    var id = generateUUID();
    var sufixoForm = "Container" + id;
    var containerId = "Container" + id;

    var sourceData = {
        sourceTable: "MrendGrupoColunas",
        sourceKey: "grupocolunastamp"
    }
    var containers = [];

    objectsUIFormConfig.forEach(function (obj) {

        containers.push({
            colSize: obj.colSize,
            style: " margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
            content: {
                contentType: obj.contentType,
                type: obj.tipo,
                id: obj.campo,
                classes: obj.classes + " mrendconfig-item-input ",
                customData: obj.customData + " v-model='grupoColuna." + obj.campo + "'",
                style: obj.style,
                selectCustomData: obj.customData + " v-model='grupoColuna." + obj.campo + "'",
                fieldToOption: obj.fieldToOption,
                fieldToValue: obj.fieldToValue,
                label: obj.titulo,
                selectData: obj.selectValues,
                multiSelect: obj.multiSelect || false,
                value: "",
                event: "",
                placeholder: "",

            }
        })



    });

    var containerData = {
        containerId: containerId,
        spinnerId: "overlay" + sufixoForm,
        hasSpinner: false,
        customData: "",
        sourceData: sourceData,
        items: containers
    }
    var formContainerResult = GenerateCustomFormContainer(containerData);

    colunaGrupoCollapse += formContainerResult;
    colunaGrupoCollapse += "<div class='grupo-coluna-items-container'>"
    colunaGrupoCollapse += "<div class='grupo-coluna-items-options' style='display:flex;column-gap:0.5em;'>"
    colunaGrupoCollapse += "<button @click='addGrupoColunaItem(grupoColuna)' type='button' class='btn btn-default'>Adicionar Item ao Grupo</button>"
    colunaGrupoCollapse += "</div>"
    colunaGrupoCollapse += "<div style='margin-top:1em' class='grupo-coluna-items-list'>"
    var colunaGrupoItemobjectsUIFormConfig = getMrendGrupoColunaItemUIObjectFormConfigAndSourceValues().objectsUIFormConfig;
    var headerCols = [{
        style: "",
        colId: "",
        classes: "",
        content: "<span>{{ colunaGrupoItem.titulo }}</span>",
        customData: "",
    }];

    var cols = [{
        style: "",
        colId: "",
        classes: "",
        content: "<span>{{ colunaGrupoItem.titulo }}</span>",
        customData: "",
    }];

    headerCols = [];
    cols = [];
    var containersGrupoItem = [];


    colunaGrupoItemobjectsUIFormConfig.forEach(function (obj) {

        var frmItem = {
            colSize: obj.colSize,
            style: " margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
            content: {
                contentType: obj.contentType,
                type: obj.tipo,
                id: obj.campo,
                classes: obj.classes + " mrendconfig-item-input ",
                customData: obj.customData + " v-model='colunaGrupoItem." + obj.campo + "'",
                style: obj.style,
                selectCustomData: obj.customData + " v-model='colunaGrupoItem." + obj.campo + "'",
                fieldToOption: obj.fieldToOption,
                isReactive: obj.isReactive,
                selectVariable: obj.selectVariable,
                fieldToValue: obj.fieldToValue,
                label: obj.tipo == "button" ? obj.titulo : "",
                selectData: obj.selectValues,
                multiSelect: obj.multiSelect || false,
                value: "",
                event: "",
                placeholder: "",

            }
        }
        var formItem = new FormItem(frmItem);
        formItem.content.classes = formItem.content.classes ? formItem.content.classes + " custom-form-item" : "custom-form-item";

        cols.push({
            style: "",
            colId: "",
            classes: "",
            content: GenerateCustomContainerCol(formItem),
            customData: "",
        });

        headerCols.push({
            style: "",
            colId: "",
            classes: "",
            content: obj.tipo != "button" ? obj.titulo : "",
            customData: "",
        });

    })

    var tableData = {
        tableId: "dd",
        classes: "table ",
        customData: "",
        style: "",
        header: {
            rows: [
                {
                    style: "",
                    rowId: "",
                    classes: "defgridheader",
                    customData: "",
                    cols: headerCols
                },

            ],
        },
        body: {
            customData: "",
            rows: [
                {
                    style: "",
                    rowId: "",
                    classes: "",
                    customData: "v-for=\"colunaGrupoItem in getItemsForGrupo(grupoColuna.grupocolunastamp)\"",
                    cols: cols
                }

            ],
        },
    };


    tableData.tableId = "tabelaGrupoColuna"
    tableData.customData = ""
    tableData.classes = "table  "

    //tableData.header.rows = []


    var tableHtml = generateTableV2(tableData);
    colunaGrupoCollapse += tableHtml;

    colunaGrupoCollapse += "</div>"
    colunaGrupoCollapse += "</div>"
    colunaGrupoCollapse += '</div>';

    colunaGrupoCollapse += ' </div>';
    // Close the collapse div
    colunaGrupoCollapse += '</div>';

    $colunaGrupoContainer.append(colunaGrupoCollapse);

    PetiteVue.createApp({
        GMrendGrupoColunas: GMrendGrupoColunas,
        GMrendGrupoColunaItems: GMrendGrupoColunaItems,
        GMrendConfigColunas: GMrendConfigColunas,
        getItemsForGrupo: function (grupocolunastamp) {
            return this.GMrendGrupoColunaItems.filter(function (i) {
                return i.grupocolunastamp === grupocolunastamp;
            });
        },
        addGrupoColuna: function () {
            var grupoColuna = new MrendGrupoColuna({
                codigogrupo: generateUUID(),
                descgrupo: "Grupo " + (GMrendGrupoColunas.length + 1)
            });

            this.GMrendGrupoColunas.push(grupoColuna);

            // Reinitialize select2 after Vue updates the DOM
            initMultipleSelects('#colunaGrupoContainer');

        },
        removeGrupoColuna: function (grupoColuna) {
            this.GMrendGrupoColunas = this.GMrendGrupoColunas.filter(function (gc) {
                return gc.grupocolunastamp !== grupoColuna.grupocolunastamp;
            });

            GMrendGrupoColunas = this.GMrendGrupoColunas;

            GMrendDeleteRecords.push({
                table: "MrendGrupoColuna",
                stamp: grupoColuna.grupocolunastamp,
                tableKey: "grupocolunastamp"
            });
        },
        addGrupoColunaItem: function (grupoColuna) {
            var grupoColunaItem = new MrendGrupoColunaItem({
                grupocolunastamp: grupoColuna.grupocolunastamp,
                colunastamp: ""
            });
            this.GMrendGrupoColunaItems.push(grupoColunaItem);

            // Reinitialize select2 after Vue updates the DOM
            initMultipleSelects('#colunaGrupoContainer');
        },
        removeGrupoColunaItem: function (grupoColunaItem) {
            this.GMrendGrupoColunaItems = this.GMrendGrupoColunaItems.filter(function (gci) {
                return gci.grupocolunaitemstamp !== grupoColunaItem.grupocolunaitemstamp;
            });
            GMrendGrupoColunaItems = this.GMrendGrupoColunaItems;

            GMrendDeleteRecords.push({
                table: "MrendGrupoColunaItem",
                stamp: grupoColunaItem.grupocolunaitemstamp,
                tableKey: "grupocolunaitemstamp"
            });
        }

    }).mount('#colunaGrupoContainer');

    // Initialize select2 on multiple selects
    initMultipleSelects('#colunaGrupoContainer');

}


function fetchConfigMrender(codigo) {

    console.log("Fetching config for codigo:", codigo);

    $.ajax({
        type: "POST",
        async: false,
        url: "../programs/gensel.aspx?cscript=getmrendconfig",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ codigo: codigo, relatorioTable: GRelatorioTable, relatorioTableKey: GRelatorioTableKey, relatorioTableFilterField: GRelatorioTableFilterField }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response)
                    return false
                }
                var config = response.data;
                var ligacoesResponse = config.ligacoes || [];

                var ligacoes = ligacoesResponse.map(function (ligacao) {

                    var confLigacao = new Mrendconfigligacao(ligacao);

                    $.ajax({
                        type: "POST",
                        url: "../programs/gensel.aspx?cscript=getregistomrend",
                        async: false,
                        data: {
                            '__EVENTARGUMENT': JSON.stringify([{
                                coluna: confLigacao.componentenegfield,
                                registo: confLigacao.componentenegstamp,
                                tabela: confLigacao.tabela
                            }]),
                        },
                        success: function (response) {

                            var errorMessage = "ao trazer resultados da ligação"
                            try {
                                if (response.cod != "0000") {

                                    console.log("Erro " + errorMessage, response)
                                    return false
                                }

                                var dadosLigacaoPredefinida = GMrendLigacoesPredefinidas.filter(function (ligacaoPredefinida) {
                                    return ligacaoPredefinida.elemento == confLigacao.elemento
                                });

                                var recordData = {}
                                dadosLigacaoPredefinida.map(function (ligg) {

                                    var uiObjects = ligg.UIObjectsUIFormConfig;

                                    var recc = response.data[0] || {}
                                    uiObjects.forEach(function (uiObject) {
                                        recordData[uiObject.campo] = recc[uiObject.campo] || handleDefaultValue(uiObject.tipo);
                                    });


                                    recordData[ligg.componentenegfield] = recc[ligg.componentenegfield];



                                })

                                confLigacao.record = recordData
                            } catch (error) {
                                console.log("Erro interno " + errorMessage, response)
                                //alertify.error("Erro interno " + errorMessage, 10000)
                            }

                            //  javascript:__doPostBack('','')
                        }
                    })

                    return confLigacao;
                });

                GMrendLigacoesExistentes = ligacoes;

                renderConfigMrender(config);
            } catch (error) {
                console.log("Erro interno " + errorMessage, error)
            }

        }
    });

}

function renderConfigMrender(config) {

    GMrendConfigColunas = [];
    GMrendConfigLinhas = [];
    GMrendConfigCelulas = [];
    GMrendGrupoColunas = [];
    GMrendGrupoColunaItems = [];
    var colunas = [new ColunaMrenderConfig({})]
    colunas = config.colunas || [];
    var linhas = [new LinhaMrenderConfig({})];
    linhas = config.linhas || [];
    var celulas = [new CelulaMrenderConfig({})];
    celulas = config.celulas || [];

    GMrendGrupoColunas = config.grupocolunas.map(function (grupoColuna) {
        return new MrendGrupoColuna(grupoColuna);
    });

    GMrendGrupoColunas.sort(function (a, b) {
        return a.ordem - b.ordem;
    });

    GMrendGrupoColunaItems = config.grupocolunaItems.map(function (grupoColunaItem) {
        return new MrendGrupoColunaItem(grupoColunaItem);
    });

    GMrendGrupoColunaItems.sort(function (a, b) {
        return a.ordem - b.ordem;
    });

    colunasSetInicio = colunas.filter(function (coluna) {
        return coluna.setinicio;
    });

    colunasSetFim = colunas.filter(function (coluna) {
        return coluna.setfim;
    });

    colunasNormais = colunas.filter(function (coluna) {
        return !coluna.setinicio && !coluna.setfim;
    });

    var colunasAjustadas = [];
    colunasAjustadas = colunasSetInicio.concat(colunasNormais).concat(colunasSetFim);

    colunas = colunasAjustadas

    colunas.forEach(function (coluna) {

        var colunaUIObjectFormConfigAndSourceValues = getColunaUIObjectFormConfigAndSourceValues();
        var col = new ColunaMrenderConfig(coluna);
        col.objectsUIFormConfig = colunaUIObjectFormConfigAndSourceValues.objectsUIFormConfig;
        col.localsource = colunaUIObjectFormConfigAndSourceValues.localsource;
        GMrendConfigColunas.push(col);
        addColunaMrenderConfig(col, colunaUIObjectFormConfigAndSourceValues);


    })


    // Recursive function to process linha and all its descendants
    function processLinhaHierarchy(linha, linhas, celulas) {
        setLinhasConfigMrender(linha, linhas, celulas);

        // Find and process all direct children
        var sublinhas = linhas.filter(function (sublinha) {
            return sublinha.linkstamp == linha.linhastamp && sublinha.linkstamp;
        });

        sublinhas.forEach(function (sublinha) {
            processLinhaHierarchy(sublinha, linhas, celulas); // Recursive call
        });
    }

    // Process all root linhas (without linkstamp or where linkstamp doesn't match any existing linha)
    var rootLinhas = linhas.filter(function (linha) {
        return !linha.linkstamp || !linhas.find(function (l) { return l.linhastamp === linha.linkstamp; });
    });

    rootLinhas.forEach(function (linha) {
        processLinhaHierarchy(linha, linhas, celulas);
    });

    handleTableReactive();
    setColunaGrupoReactive();
    initJSONEditorMrendConfig(config.relatorio || {});

    // Comentado: Tabulator usa movableColumns nativo (não precisa de jQuery UI Sortable)
    // if (typeof makeColunasSortable === 'function') {
    //     setTimeout(makeColunasSortable, 200);
    // }




}

function setLinhasConfigMrender(linha, linhas, celulas) {

    var linhaAdicionada = GMrendConfigLinhas.find(function (l) {
        return l.linhastamp == linha.linhastamp;
    });

    if (linhaAdicionada) {
        // Linha já existe, não adiciona novamente
        return;
    }
    var linhaUIObjectFormConfigResult = getLinhaUIObjectFormConfigAndSourceValues();
    linhaUIObjectFormConfigResult.idField = "linhastamp";

    var celulasLinha = [];

    GMrendConfigColunas.forEach(function (coluna) {
        var celulasFilt = celulas.filter(function (celula) {
            return celula.linhastamp == linha.linhastamp && celula.colunastamp == coluna.colunastamp;
        });
        if (celulasFilt.length > 0) {

            var celula = new CelulaMrenderConfig(celulasFilt[0]);
            var celulaUIObjectFormConfigAndSourceValues = getCelulaUIObjectFormConfigAndSourceValues();
            celula.objectsUIFormConfig = celulaUIObjectFormConfigAndSourceValues.objectsUIFormConfig;
            celula.localsource = celulaUIObjectFormConfigAndSourceValues.localsource;
            celula.idField = celulaUIObjectFormConfigAndSourceValues.idField;
            celulasLinha.push(celula);

        }
        else {
            celulasLinha.push(new CelulaMrenderConfig({
                linhastamp: linha.linhastamp,
                colunastamp: coluna.colunastamp,
                codigocoluna: coluna.codigocoluna,
                celulastamp: generateUUID(),
                sinalnegativo: false,
                inactivo: false,
                desabilitado: false,
                usafnpren: false,
                atributo: "",
                fnpren: "",
                fx: "",
                temfx: false,
                idField: getCelulaUIObjectFormConfigAndSourceValues().idField,
                localsource: getCelulaUIObjectFormConfigAndSourceValues().localsource,
                objectsUIFormConfig: getCelulaUIObjectFormConfigAndSourceValues().objectsUIFormConfig
            }));
        }
    })

    var linhaMrender = new LinhaMrenderConfig(linha);

    linhaMrender.objectsUIFormConfig = getLinhaUIObjectFormConfigAndSourceValues().objectsUIFormConfig;
    linhaMrender.localSource = getLinhaUIObjectFormConfigAndSourceValues().localsource;
    GMrendConfigCelulas = GMrendConfigCelulas.concat(celulasLinha);
    GMrendConfigLinhas.push(linhaMrender);

    addLinhaMrenderConfig(linhaMrender.tipo, linhaMrender, linhaUIObjectFormConfigResult, celulasLinha);




}


function handleTableReactive() {

    PetiteVue.createApp({
        GMrendConfigLinhas: GMrendConfigLinhas,
        GMrendConfigColunas: GMrendConfigColunas,
        GMrendConfigCelulas: GMrendConfigCelulas,
        GlickedRowComponent: GlickedRowComponent,
        getDescricaoByLinhaStamp: function (linhastamp) {
            var linha = this.GMrendConfigLinhas.find(function (l) {
                return l.linhastamp == linhastamp;
            });
            //console.log("getDescricaoByLinhaStamp", linha, linhastamp)
            if (linha) {
                return linha.descricao;
            }
            return "";
        },
        syncByColunaStamp: function (colunastamp) {
            var coluna = this.GMrendConfigColunas.find(function (c) {
                return c.colunastamp == colunastamp;
            });
            if (coluna) {

                this.GMrendConfigCelulas.filter(function (celula) {
                    return celula.colunastamp == coluna.colunastamp;
                }).map(function (celula) {

                    celula.codigocoluna = coluna.codigocoluna;
                    celula.desccoluna = coluna.desccoluna;
                });

                return coluna.desccoluna;
            }


            return "";
        }

    }).mount('#inputReportTable');

    // Initialize select2 on multiple selects
    initMultipleSelects('#inputReportTable');

    // Initialize treetable after reactive updates - with delay to ensure DOM is ready
    setTimeout(function () {
        // Atualizar estilos de todas as linhas que têm filhos
        GMrendConfigLinhas.forEach(function (linha) {
            if (linha.linhastamp) {
                var temFilhos = GMrendConfigLinhas.some(function (l) {
                    return l.linkstamp === linha.linhastamp;
                });
                if (temFilhos) {
                    var $row = $("#" + GRendConfigTableHtml.tableId + " tbody tr#" + linha.linhastamp);
                    $row.css("background", "#e9f1ff");
                    $row.addClass("linha-com-filhos");
                }
            }
        });

        initMrendConfigTreeTable();
    }, 100);

}

function addColunaMrenderConfig(coluna, colunaUIObjectFormConfigResult) {


    var botaoRemoverColuna = {
        style: "",
        buttonId: "",
        classes: "btn btn-xs btn-default remover-coluna-btn",
        customData: " type='button' data-tooltip='true' data-original-title='Remover coluna' ",
        label: "<span class='glyphicon glyphicon glyphicon-trash' ></span>",
        onClick: "",
    };

    var buttonHtml = generateButton(botaoRemoverColuna)

    var contentColuna = "<div class='colunaHeader' >" + " {{ syncByColunaStamp('" + coluna.colunastamp + "') }}" + "</div>" + buttonHtml

    GRendConfigTableHtml.header.row.cols.push({
        style: "",
        colId: coluna.codigocoluna,
        classes: "colunaHeader ",
        content: contentColuna,
        customData: "",
    });

    var customData = " componente='Coluna' idValue='" + coluna.colunastamp + "' localsource='" + colunaUIObjectFormConfigResult.localsource + "'  idfield='" + colunaUIObjectFormConfigResult.idField + "'"
    var table = $("#" + GRendConfigTableHtml.tableId);
    var thHtml = "<th " + customData + " class='colunaHeader mrendconfig-item' id='" + coluna.colunastamp + "'>" + contentColuna + "</th>";

    if (table.find("thead").length > 0) {
        table.find("thead tr").append(thHtml);
    } else {
        var thAcoes = "<th class='colunaHeader' id='coluna-acoes'>Acções</th>";
        var theadHtml = "<thead><tr class='defgridheader'>" + thAcoes + thHtml + "</tr></thead>";
        table.prepend(theadHtml);
    }


    GMrendConfigLinhas.forEach(function (linha) {
        var celulastamp = generateUUID();

        var celulaUIObjectFormConfigResult = getCelulaUIObjectFormConfigAndSourceValues();
        var celula = new CelulaMrenderConfig({
            linhastamp: linha.linhastamp,
            celulastamp: celulastamp,
            colunastamp: coluna.colunastamp,
            codigocoluna: coluna.codigocoluna,
            sinalnegativo: false,
            inactivo: false,
            desabilitado: false,
            usafnpren: false,
            atributo: "",
            fnpren: "",
            fx: "",
            temfx: false,
            idField: celulaUIObjectFormConfigResult.idField,
            locasource: celulaUIObjectFormConfigResult.localsource,
            objectsUIFormConfig: celulaUIObjectFormConfigResult.objectsUIFormConfig,
        });

        GMrendConfigCelulas.push(celula);

        var textInputData = {
            type: "text",
            value: coluna.desccoluna,
            classes: "form-control bind-table-control input-sm table-input-col cell-config-inpt ",
            style: "background:#eff0f1!important",
            customData: ":value=syncByColunaStamp('" + celula.colunastamp + "')",
            placeholder: ""
        };



        var colContent = generateInput(textInputData);
        var customCelulaUIData = " componente='Linha' idValue='" + celula.celulastamp + "' localsource='" + celulaUIObjectFormConfigResult.localsource + "'  idfield='" + celula.idField + "'"

        var $tr = table.find("tbody tr#" + linha.linhastamp);
        if ($tr.length) {
            $tr.append("<td " + customCelulaUIData + " class='mrendconfig-item' data-colunacell='" + coluna.colunastamp + "'   id='" + celula.celulastamp + "'>" + colContent + "</td>");
        }

    });

    handleTableReactive();

    // Comentado: Tabulator usa movableColumns nativo (não precisa de jQuery UI Sortable)
    // if (typeof makeColunasSortable === 'function') {
    //     setTimeout(makeColunasSortable, 100);
    // }
}


function removerColunaMrenderConfig(colunastamp) {


    if (GMrendConfigColunas.length == 1) {
        GMrendConfigCelulas = []
        GMrendConfigColunas = []
        GMrendConfigLinhas = []
        $("#" + GRendConfigTableHtml.tableId + " thead").remove();
        $("#" + GRendConfigTableHtml.tableId + " tbody").empty();
        return
    }

    var coluna = GMrendConfigColunas.find(function (col) {
        return col.colunastamp == colunastamp;
    });

    if (coluna) {
        // Remove do array de colunas
        GMrendConfigColunas.splice(GMrendConfigColunas.indexOf(coluna), 1);

        // Adiciona ao array de deletes
        GMrendDeleteRecords.push({
            table: "MrendColuna",
            stamp: colunastamp,
            tableKey: "colunastamp"
        });

        // Remove todas as células do DOM que tenham o atributo data-colunacell igual ao codigocoluna
        $("[data-colunacell='" + colunastamp + "']").closest("td").remove();

        // Track and remove células associated with this coluna (cascade)
        var celulasRemovidas = GMrendConfigCelulas.filter(function (celula) {
            return celula.colunastamp === colunastamp;
        });
        celulasRemovidas.forEach(function (celula) {
            GMrendDeleteRecords.push({
                table: "MrendCelula",
                stamp: celula.celulastamp,
                tableKey: "celulastamp"
            });
        });
        // Remove do array de células todas que tenham colunastamp igual ao da coluna removida
        GMrendConfigCelulas = GMrendConfigCelulas.filter(function (celula) {
            return celula.colunastamp !== colunastamp;
        });

        // Remove o cabeçalho da coluna
        $("#" + colunastamp).remove();
    }


}


function getLocalSource(source) {
    var localsource = []
    localsource = eval(source)
    return localsource
}

function registerListenersMrender() {

    $(document).off("click", ".remover-coluna-btn").on("click", ".remover-coluna-btn", function (e) {
        removerColunaMrenderConfig($(this).closest("th").attr("id"));
    });

    $(document).off("click", "#addColunaBtn").on("click", "#addColunaBtn", function (e) {

        var colunastamp = generateUUID();
        var codigocoluna = "COLUNA" + colunastamp;
        var colunaUIObjectFormConfigResult = getColunaUIObjectFormConfigAndSourceValues();

        var maxOrdemColuna = GMrendConfigColunas.reduce(function (max, col) {
            return Math.max(max, col.ordem || 0);
        }, 0);
        var coluna = new ColunaMrenderConfig({
            colunastamp: colunastamp,
            codigocoluna: codigocoluna,
            desccoluna: "Coluna " + (GMrendConfigColunas.length + 1),
            campo: "campo",
            relatoriostamp: GRelatorioStamp,
            tipo: "",
            atributo: "",
            campovalid: "",
            condicaovalidacao: "",
            validacoluna: false,
            expresscolfun: "",
            colfunc: false,
            ordem: maxOrdemColuna + 1,
            expressaotbjs: "",
            usaexpresstbjs: false,
            usaexpressaocoldesc: false,
            expresssaojscoldesc: "",
            nometb: "",
            valtb: "",
            categoria: "default",
            expressaodb: "",
            expressaojsevento: "",
            executaeventochange: false,
            inactivo: false,
            decimais: 0,
            proibenegativo: false,
            objectsUIFormConfig: colunaUIObjectFormConfigResult.objectsUIFormConfig,
            localsource: colunaUIObjectFormConfigResult.localsource,
        });

        GMrendConfigColunas.push(coluna);
        addColunaMrenderConfig(coluna, colunaUIObjectFormConfigResult);
    });


    $(document).off("click", "#addLinhaBtn").on("click", "#addLinhaBtn", function (e) {

        var dadosNovaLinha = setNovaLinha("Grupo");
        var linha = dadosNovaLinha.linha;
        var linhaUIObjectFormConfigResult = dadosNovaLinha.linhaUIObjectFormConfigResult;
        var celulas = dadosNovaLinha.celulas;

        addLinhaMrenderConfig("Grupo", linha, linhaUIObjectFormConfigResult, celulas);

        GMrendConfigLinhas.push(linha);
        GMrendConfigCelulas = GMrendConfigCelulas.concat(celulas);
        handleTableReactive();


    })

    $(document).off("click", ".mrendconfig-item").on("click", ".mrendconfig-item", function (e) {

        var idValue = $(this).attr("idValue");
        var localsource = $(this).attr("localsource");
        var idField = $(this).attr("idfield");
        var componente = $(this).attr("componente");
        var localSource = getLocalSource(localsource);



        var mrendConfigItem = localSource.find(function (obj) {
            return obj[idField] == idValue;
        });
        var objectsUIFormConfig = [new UIObjectFormConfig({})]
        if (mrendConfigItem) {

            objectsUIFormConfig = mrendConfigItem.objectsUIFormConfig;

            var sufixoForm = localsource;
            var containerId = "Container" + localsource;

            var sourceData = {
                sourceTable: localsource,
                sourceKey: localsource
            }
            var containers = [];
            var multiSelectFields = []; // Campos multiSelect renderizados separadamente

            objectsUIFormConfig.forEach(function (obj) {

                // Multi-select fields are handled manually outside the generic system
                if (obj.multiSelect === true) {
                    multiSelectFields.push(obj);
                    return;
                }

                var containerContent = {
                    contentType: obj.contentType,
                    type: obj.tipo,
                    id: obj.campo,
                    classes: obj.classes + " mrendconfig-item-input",
                    customData: obj.customData + " v-model='mrendConfigItem." + obj.campo + "'",
                    style: obj.style,
                    selectCustomData: obj.customData + " v-model='mrendConfigItem." + obj.campo + "'",
                    fieldToOption: obj.fieldToOption,
                    fieldToValue: obj.fieldToValue,
                    label: obj.titulo,
                    selectData: obj.selectValues,
                    multiSelect: false,
                    value: mrendConfigItem[obj.campo],
                    event: "",
                    placeholder: ""
                };

                containers.push({
                    colSize: obj.colSize,
                    style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                    content: containerContent
                });



            });



            var indexField = 0

            var relationRecords = mrendConfigItem.relationRecords || [];
            if (relationRecords.length > 0) {

                containers.push({
                    colSize: 12,
                    style: "margin-bottom:0.5em;",
                    content: {
                        contentType: "div",
                        type: "div",
                        id: "",
                        classes: "",
                        customData: "",
                        style: "",
                        selectCustomData: "",
                        fieldToOption: "",
                        fieldToValue: "",
                        label: "",
                        selectData: "",
                        value: "<h4 style='font-weight:bolf' >Campos extra</h4><hr>",
                        event: "",
                        placeholder: "",

                    }
                })


            }

            relationRecords.forEach(function (extraFieldData) {


                extraFieldData.UIObjectsUIFormConfig.forEach(function (obj) {

                    containers.push({
                        colSize: obj.colSize,
                        style: "margin-bottom:0.5em; " + (obj.tipo == "checkbox" ? "display:flex;flex-direction:column" : ""),
                        content: {
                            contentType: obj.contentType,
                            type: obj.tipo,
                            id: obj.campo,
                            classes: obj.classes + " relationData-item-input",
                            customData: obj.customData + " v-model='mrendConfigItem.relationRecords[" + indexField + "].record." + obj.campo + "'",
                            style: obj.style,
                            selectCustomData: obj.customData + " v-model='mrendConfigItem.relationRecords[" + indexField + "].record." + obj.campo + "'",
                            fieldToOption: obj.fieldToOption,
                            fieldToValue: obj.fieldToValue,
                            label: obj.titulo,
                            selectData: obj.selectValues,
                            multiSelect: obj.multiSelect || false,
                            value: mrendConfigItem.relationRecords[indexField].record[obj.campo],
                            event: "",
                            placeholder: "",

                        }
                    })



                })

                indexField++;

            })





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

            // Build manual HTML for multiSelect fields (bypass broken generic system)
            multiSelectFields.forEach(function (obj) {
                var selectId = "multiselect_" + obj.campo + "_" + idValue;
                var optionsHtml = "";
                obj.selectValues.forEach(function (opt) {
                    optionsHtml += "<option value='" + opt[obj.fieldToValue] + "'>" + opt[obj.fieldToOption] + "</option>";
                });

                modalBodyHtml += ""
                    + "<div class='col-md-" + (obj.colSize || 12) + "' style='margin-bottom:0.5em;'>"
                    + "<label>" + obj.titulo + "</label>"
                    + "<select id='" + selectId + "' "
                    + "data-mrend-multiselect='true' "
                    + "data-mrend-field='" + obj.campo + "' "
                    + "data-mrend-idvalue='" + idValue + "' "
                    + "data-mrend-localsource='" + localsource + "' "
                    + "data-mrend-idfield='" + idField + "' "
                    + "multiple "
                    + "class='" + (obj.classes || "form-control") + "' "
                    + "style='width:100%;'>"
                    + optionsHtml
                    + "</select>"
                    + "</div>";
            });

            var modalRendConfigItem = {
                title: "Configuração ",
                id: "modalRendConfigItem",
                customData: "",
                otherclassess: "",
                body: modalBodyHtml,
                footerContent: "",
            };
            var modalHTML = generateModalHTML(modalRendConfigItem);

            $("#maincontent").append(modalHTML);

            $("#modalRendConfigItem").modal("show");
            var vueApp = PetiteVue.createApp({
                mrendConfigItem: mrendConfigItem,
            });
            vueApp.mount('#maincontent');

            // Initialize manual multi-selects with Select2 + direct binding to mrendConfigItem
            initMrendMultiSelects(mrendConfigItem, multiSelectFields, idValue);


        }


    });

}



function setNovaLinha(tipo, parentLinha) {


    var linhastamp = generateUUID();
    var linkstamp = "";

    if (GlickedRowComponent) {
        var parentRowId = GlickedRowComponent.attr("id");
        var parent = GMrendConfigLinhas.find(function (l) { return l.linhastamp === parentRowId; });
        if (parent) {
            linkstamp = parent.linhastamp;
            parentLinha = parent;
        }
    }

    // ── Determinar tipo do filho baseado no tipo do pai ──
    if (parentLinha) {
        if (parentLinha.tipo === "Grupo") {
            tipo = "Subgrupo";
        } else if (parentLinha.tipo === "Subgrupo") {
            tipo = "Singular";
        } else {
            tipo = "Singular"; // default para qualquer outro caso
        }
    } else if (!tipo) {
        tipo = "Grupo"; // Se não há pai, é um Grupo raiz
    }

    var linhaUIObjectFormConfigResult = getLinhaUIObjectFormConfigAndSourceValues();
    var ordem = GMrendConfigLinhas.reduce(function (max, linha) {
        return Math.max(max, linha.ordem || 0);
    }, 0);


    var linha = new LinhaMrenderConfig({
        linhastamp: linhastamp,
        linkstamp: linkstamp,
        relatoriostamp: GRelatorioStamp,
        parentstamp: "",
        temcolunas: true,
        tipo: tipo || "",
        codigo: "LINHA" + linhastamp,
        descricao: "Linha " + (GMrendConfigLinhas.length + 1),
        origem: "",
        expressao: "",
        campovalid: "",
        sinalnegativo: false,
        temtotais: false,
        totkey: "",
        totfield: "",
        condicaovalidacao: "",
        categoria: "default",
        codcategoria: "",
        ordem: ordem + 1,
        usafnpren: false,
        fnpren: "",
        tipolistagem: "table",
        objectolist: "",
        executachange: false,
        expressaochangejs: "",
        cor: "",
        localsource: linhaUIObjectFormConfigResult.localsource,
        objectsUIFormConfig: linhaUIObjectFormConfigResult.objectsUIFormConfig,
    });

    var celulas = [new CelulaMrenderConfig({})]
    celulas = [];

    GMrendConfigColunas.forEach(function (coluna) {
        var celulastamp = generateUUID();
        var celulaUIObjectFormConfigAndSourceValues = getCelulaUIObjectFormConfigAndSourceValues();
        var celula = new CelulaMrenderConfig({
            linhastamp: linhastamp,
            celulastamp: celulastamp,
            colunastamp: coluna.colunastamp,
            codigocoluna: coluna.codigocoluna,
            sinalnegativo: false,
            inactivo: false,
            desabilitado: false,
            usafnpren: false,
            atributo: "",
            fnpren: "",
            fx: "",
            temfx: false,
            idField: celulaUIObjectFormConfigAndSourceValues.idField,
            localsource: celulaUIObjectFormConfigAndSourceValues.localsource,
            objectsUIFormConfig: celulaUIObjectFormConfigAndSourceValues.objectsUIFormConfig,
        });

        celulas.push(celula);

    });


    return { linha: linha, linhaUIObjectFormConfigResult: linhaUIObjectFormConfigResult, celulas: celulas };


}
function addLinhaMrenderConfig(tipo, linha, linhaUIObjectFormConfigResult, celulas) {


    if (GMrendConfigColunas.length === 0) {
        alertify.error("Adicione colunas primeiro", 10000);
        return;
    }

    var cols = [];
    var customDataUIObjectLinha = " componente='Linha' idValue='" + linha.linhastamp + "' localsource='" + linhaUIObjectFormConfigResult.localsource + "'  idfield='" + linhaUIObjectFormConfigResult.idField + "'"

    var cols = [];

    // Action buttons wrapped in a container to prevent treetable indenter interference
    var actionButtons = "<div style='display:inline-block;white-space:nowrap'>";
    actionButtons += "<button style='color:white!important;background:#d9534f!important;margin-right:0.4em' type='button' class='btn btn-danger btn-sm remover-linha-btn' title='Remover linha'><span class='glyphicon glyphicon-trash'></span></button>";
    actionButtons += "<button type='button' class='btn btn-primary btn-sm adicionar-linha-btn' title='Adicionar linha'><span class='glyphicon glyphicon-plus'></span></button>";
    actionButtons += "<button " + customDataUIObjectLinha + " style='margin-left:0.6em' type='button' class='btn btn-default btn-sm mrendconfig-item' title='Configurar linha'><span class='glyphicon glyphicon-cog'></span></button>";
    actionButtons += "</div>";
    actionButtons += "<span class='mrendconfig-item' style='margin-left:0.3em'>" + " {{ getDescricaoByLinhaStamp('" + linha.linhastamp + "') }}" + "</span>";

    cols.push({
        style: "",
        colId: "acoes_" + linha.linhastamp,
        classes: "linha-acoes",
        content: actionButtons,
        customData: ""
    });


    celulas.forEach(function (celula) {

        var coluna = GMrendConfigColunas.find(function (col) {
            return col.colunastamp == celula.colunastamp;
        });

        if (!coluna) {

            throw new Error("Coluna não encontrada: " + celula.colunastamp);
        }
        var textInputData = {
            type: "text",
            value: "",
            classes: "form-control bind-table-control input-sm table-input-col cell-config-inpt  ",
            style: "background:#eff0f1!important",
            customData: ":value=syncByColunaStamp('" + celula.colunastamp + "')",
            placeholder: ""
        };

        var customCelulaUIData = " componente='Celula'  idValue='" + celula.celulastamp + "' localsource='" + celula.localsource + "'  idfield='" + celula.idField + "'"


        var colContent = generateInput(textInputData)
        cols.push({
            style: "",
            colId: celula.celulastamp,
            classes: "mrendconfig-item",
            content: colContent,
            customData: "data-colunacell='" + coluna.colunastamp + "' " + customCelulaUIData
        });
    });

    // Build treetable attributes for hierarchy
    var treeTableAttrs = "data-tt-id='" + linha.linhastamp + "'";
    if (linha.linkstamp) {
        treeTableAttrs += " data-tt-parent-id='" + linha.linkstamp + "'";
    }

    // Verificar se esta linha tem filhos para aplicar cor
    var temFilhos = GMrendConfigLinhas.some(function (l) {
        return l.linkstamp === linha.linhastamp;
    });

    var rowObj = {
        style: "" + (temFilhos ? "background:#e9f1ff!important" : ""),
        rowId: linha.linhastamp,
        classes: "linhaHeader linha-tipo-" + linha.tipo.toLowerCase() + (temFilhos ? " linha-com-filhos" : ""),
        customData: "linkstamp='" + linha.linkstamp + "' " + treeTableAttrs,
        cols: cols
    };

    // Gera o HTML da linha
    var trHtml = generateRowAbove(rowObj);



    var table = $("#" + GRendConfigTableHtml.tableId);
    if (table.find("tbody").length === 0) {
        table.append("<tbody></tbody>");
    }


    // ── Lógica de inserção hierárquica melhorada ──
    if (linha.linkstamp) {
        // Se tem linkstamp, é filho de alguém

        // 1. Procurar por irmãos (outras linhas com mesmo parent)
        var $siblings = table.find("tbody tr[data-tt-parent-id='" + linha.linkstamp + "']");

        if ($siblings.length > 0) {
            // Se existem irmãos, precisamos inserir após o último descendente do último irmão
            var $lastSibling = $siblings.last();
            var lastSiblingId = $lastSibling.attr('id');

            // Encontrar todos os descendentes deste último irmão
            var $descendants = table.find("tbody tr[data-tt-parent-id='" + lastSiblingId + "']");

            if ($descendants.length > 0) {
                // Inserir após o último descendente do último irmão (recursivamente)
                var insertAfter = function (parentId) {
                    var $children = table.find("tbody tr[data-tt-parent-id='" + parentId + "']");
                    if ($children.length > 0) {
                        var lastChildId = $children.last().attr('id');
                        return insertAfter(lastChildId); // recursivo
                    }
                    return table.find("tbody tr#" + parentId);
                };
                insertAfter(lastSiblingId).after(trHtml);
            } else {
                // Se último irmão não tem filhos, inserir logo após ele
                $lastSibling.after(trHtml);
            }
        } else {
            // Se não existem irmãos, inserir após a linha pai
            var $parentRow = table.find("tbody tr#" + linha.linkstamp);
            if ($parentRow.length) {
                $parentRow.after(trHtml);
            } else {
                table.find("tbody").append(trHtml);
            }
        }
    } else {
        // Se não tem linkstamp, é raiz - inserir no final
        table.find("tbody").append(trHtml);
    }

    // Atualizar estilo da linha pai se esta linha tem linkstamp
    if (linha.linkstamp) {
        atualizarEstiloLinhaComFilhos(linha.linkstamp);
    }

    // Initialize treetable to apply hierarchical styling - with delay
    setTimeout(function () {
        initMrendConfigTreeTable();
        // Reinicializar drag-and-drop de linhas apos cada insercao (mesmo padrao das colunas)
        if (typeof makeLinhasSortable === 'function') {
            makeLinhasSortable();
        }
    }, 50);


    table.find(".remover-linha-btn").off("click").on("click", function () {
        var $tr = $(this).closest("tr");
        var linhastamp = $tr.attr("id");
        var linhaObj = GMrendConfigLinhas.find(function (l) { return l.linhastamp === linhastamp; });

        // Função recursiva para remover filhos do DOM e dos arrays
        function removerFilhosRecursivo(parentStamp) {
            // Remove filhos do DOM usando data-tt-parent-id
            table.find("tbody tr[data-tt-parent-id='" + parentStamp + "']").each(function () {
                var filhoStamp = $(this).attr("id");
                $(this).remove();
                // Remove do array de linhas
                GMrendConfigLinhas = GMrendConfigLinhas.filter(function (l) { return l.linhastamp !== filhoStamp; });
                // Remove do array de células (cascade)
                var celulasRemovidas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp === filhoStamp; });
                celulasRemovidas.forEach(function (celula) {
                    GMrendDeleteRecords.push({
                        table: "MrendCelula",
                        stamp: celula.celulastamp,
                        tableKey: "celulastamp"
                    });
                });
                GMrendConfigCelulas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp !== filhoStamp; });
                // Adiciona linha ao array de deletes
                GMrendDeleteRecords.push({
                    table: "MrendLinha",
                    stamp: filhoStamp,
                    tableKey: "linhastamp"
                });
                // Recursivo para sub-filhos
                removerFilhosRecursivo(filhoStamp);
            });
        }

        if (linhaObj && linhaObj.tipo === "Grupo") {
            removerFilhosRecursivo(linhastamp);
        }

        // Remove a linha principal do DOM
        $tr.remove();
        // Remove do array de linhas
        GMrendConfigLinhas = GMrendConfigLinhas.filter(function (l) { return l.linhastamp !== linhastamp; });
        // Remove do array de células (cascade)
        var celulasRemovidas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp === linhastamp; });
        celulasRemovidas.forEach(function (celula) {
            GMrendDeleteRecords.push({
                table: "MrendCelula",
                stamp: celula.celulastamp,
                tableKey: "celulastamp"
            });
        });
        GMrendConfigCelulas = GMrendConfigCelulas.filter(function (c) { return c.linhastamp !== linhastamp; });
        // Adiciona linha ao array de deletes
        GMrendDeleteRecords.push({
            table: "MrendLinha",
            stamp: linhastamp,
            tableKey: "linhastamp"
        });

        // Atualizar estilo da linha pai (pode ter perdido todos os filhos)
        if (linhaObj && linhaObj.linkstamp) {
            atualizarEstiloLinhaComFilhos(linhaObj.linkstamp);
        }

        // Reinitialize treetable after removal - with delay
        setTimeout(function () {
            initMrendConfigTreeTable();
        }, 50);
    });
    table.find(".adicionar-linha-btn").off("click").on("click", function () {

        GlickedRowComponent = $(this).closest("tr");
        var dadosNovaLinha = setNovaLinha(); // Remove tipo fixo, será determinado automaticamente
        var linha = dadosNovaLinha.linha;
        var linhaUIObjectFormConfigResult = dadosNovaLinha.linhaUIObjectFormConfigResult;
        var celulas = dadosNovaLinha.celulas;
        addLinhaMrenderConfig(linha.tipo, linha, linhaUIObjectFormConfigResult, celulas); // Usa o tipo da linha
        GMrendConfigLinhas.push(linha);
        GMrendConfigCelulas = GMrendConfigCelulas.concat(celulas);
        GlickedRowComponent = null;
        handleTableReactive()

    });


}

function groupRecordsBySource(arr, relationKey) {
    var extraRecords = [];
    arr.forEach(function (item) {
        var relationRecords = item[relationKey] || [];
        var distinctTabelas = _.uniqBy(relationRecords, "sourceTable");
        distinctTabelas.forEach(function (tabela) {
            var extraRecordExists = extraRecords.find(function (record) {
                return record.sourceTable == tabela.sourceTable;
            });
            var records = relationRecords.filter(function (record) {
                return record.sourceTable == tabela.sourceTable;
            }).map(function (recc) {

                return recc.record
            });
            if (!extraRecordExists) {
                extraRecords.push({
                    sourceTable: tabela.sourceTable,
                    sourceKey: tabela.sourceKey,
                    records: records
                });
            } else {
                extraRecordExists.records = extraRecordExists.records.concat(records);
            }
        });
    });
    return extraRecords;
}

/**
 * Constrói o configData no formato usado pelo backend de gravação e pelo export JSON.
 * Único ponto que conhece a estrutura (sourceTable / sourceKey / records).
 */
function buildMrendConfigData() {
    var configData = [
        { sourceTable: "MrendColuna", sourceKey: "colunastamp", records: GMrendConfigColunas },
        { sourceTable: "MrendLinha", sourceKey: "linhastamp", records: GMrendConfigLinhas },
        { sourceTable: "MrendCelula", sourceKey: "celulastamp", records: GMrendConfigCelulas },
        { sourceTable: "Mrendconfigligacao", sourceKey: "mrendligacoesstamp", records: GMrendLigacoes },
        { sourceTable: "MrendGrupoColuna", sourceKey: "grupocolunastamp", records: GMrendGrupoColunas },
        { sourceTable: "MrendGrupoColunaItem", sourceKey: "grupocolunaitemstamp", records: GMrendGrupoColunaItems },
        {
            sourceTable: GRelatorioTable,
            sourceKey: GRelatorioTableFilterField,
            records: GRelatorioConfig ? [(function () {
                var r = {};
                // Chaves dinamicas em funcao da tabela de relatorio configurada.
                // Default: u_mrendrel -> {u_mrendrelstamp, codigo}. Override em initTabelaConfiguracaoMrender.
                r[GRelatorioTableFilterField] = GRelatorioConfig[GRelatorioTableFilterField] || GConfigCodigo;
                r[GRelatorioTableKey] = GRelatorioConfig[GRelatorioTableKey] || GRelatorioConfig.relatoriostamp || GRelatorioStamp;
                r.rendopt = GRelatorioConfig.rendopt || "";
                return r;
            }())] : []
        }
    ];

    var extraRecordsColunas = groupRecordsBySource(GMrendConfigColunas, "relationRecords");
    var extraRecordsLinhas = groupRecordsBySource(GMrendConfigLinhas, "relationRecords");
    var extraRecordsCelulas = groupRecordsBySource(GMrendConfigCelulas, "relationRecords");
    var allExtraRecords = [].concat(extraRecordsColunas, extraRecordsLinhas, extraRecordsCelulas);

    return configData.concat(allExtraRecords);
}


// ============================================================================
// EXPORT / IMPORT — Configuração Mrend
// ----------------------------------------------------------------------------
// Padrão inspirado no Mdash (exportarConfiguracaoMDashboard / importLayouts).
//   - exportarConfiguracaoMrender()    descarrega ficheiro JSON
//   - importarConfiguracaoMrender()    abre file picker
//   - pedirOpcaoImportMrend()          pergunta se gera novos stamps
//   - regenerateMrendStamps()          regenera stamps mantendo relações (genérico)
//   - aplicarImportMrendConfig()       aplica payload às variáveis globais
// O relatoriostamp tem regra própria (resolveRelatorioStamp) — sempre o do
// registo aberto; só gera novo se o DOM estiver vazio.
// ============================================================================

function exportarConfiguracaoMrender() {
    try {
        var configData = buildMrendConfigData();
        var relatorioDOM = readRelatorioFromDOM();

        // Substitui (ou cria) o record da tabela do relatório no configData
        // com os valores REAIS lidos do ecrã PHC.
        var relatorioGroup = configData.find(function (g) { return g.sourceTable === GRelatorioTable; });
        if (!relatorioGroup) {
            relatorioGroup = { sourceTable: GRelatorioTable, sourceKey: GRelatorioTableFilterField, records: [] };
            configData.push(relatorioGroup);
        }
        var existing = (relatorioGroup.records && relatorioGroup.records[0]) || {};
        // rendopt vem de GRelatorioConfig (gerado pelo JSONEditor)
        var rendopt = (GRelatorioConfig && GRelatorioConfig.rendopt) || existing.rendopt || "";
        // Chaves dinamicas: PK -> GRelatorioTableKey, filtro -> GRelatorioTableFilterField.
        // Defaults: u_mrendrelstamp / codigo. No MRend Main.js (u_nota): u_notastamp / nota.
        var novoRecord = Object.assign({}, existing, {
            nome: relatorioDOM.nome || existing.nome || "",
            categoria: relatorioDOM.categoria || existing.categoria || "",
            expfonte: relatorioDOM.expfonte || existing.expfonte || "",
            tipo: relatorioDOM.tipo || existing.tipo || "",
            rendopt: rendopt
        });
        novoRecord[GRelatorioTableKey] = relatorioDOM.relatoriostamp;
        novoRecord[GRelatorioTableFilterField] = relatorioDOM.codigo
            || existing[GRelatorioTableFilterField]
            || existing.codigo
            || GConfigCodigo
            || "";
        relatorioGroup.records = [novoRecord];

        var payload = {
            config: configData,
            generatedAt: new Date().toISOString(),
            version: "1.0",
            nome: relatorioDOM.nome,
            categoria: relatorioDOM.categoria,
            expfonte: relatorioDOM.expfonte,
            tipo: relatorioDOM.tipo
        };
        // Chaves dinamicas no topo do payload (para inspeccao e nome de ficheiro)
        payload[GRelatorioTableKey] = relatorioDOM.relatoriostamp;
        payload[GRelatorioTableFilterField] = relatorioDOM.codigo || GConfigCodigo || "";
        var fileContents = JSON.stringify(payload, null, 2);
        var blob = new Blob([fileContents], { type: "application/json;charset=utf-8" });
        var downloadUrl = URL.createObjectURL(blob);
        var link = document.createElement("a");
        var timestamp = new Date().toISOString().replace(/[:.-]/g, "");
        var fileName = "mrend-config-" + (payload[GRelatorioTableFilterField] || payload.codigo || "sem-codigo") + "-" + timestamp + ".json";

        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 1000);

        if (typeof alertify !== "undefined") {
            alertify.success("Configuracao exportada: " + fileName, 4000);
        }
    } catch (error) {
        console.error("Erro ao exportar configuracao Mrend", error);
        if (typeof alertify !== "undefined") {
            alertify.error("Erro ao exportar configuracao: " + error.message, 9000);
        }
    }
}

function importarConfiguracaoMrender() {
    var fileInput = document.getElementById("mrendConfigImportFile");
    if (!fileInput) {
        if (typeof alertify !== "undefined") alertify.error("Input de importacao nao encontrado", 6000);
        return;
    }
    fileInput.value = "";
    fileInput.onchange = function (event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        if (!/\.json$/i.test(file.name)) {
            if (typeof alertify !== "undefined") alertify.error("Selecione um ficheiro .json", 3000);
            return;
        }
        var reader = new FileReader();
        reader.onload = function (ev) {
            try {
                var parsed = JSON.parse(ev.target.result);
                pedirOpcaoImportMrend(parsed);
            } catch (err) {
                console.error("Erro ao ler ficheiro de importacao", err);
                if (typeof alertify !== "undefined") alertify.error("Ficheiro JSON invalido: " + err.message, 5000);
            }
        };
        reader.readAsText(file);
    };
    fileInput.click();
}

function pedirOpcaoImportMrend(payload) {
    // Em modo "consultar" (registo já existe e está aberto em visualização)
    // queremos um fluxo simples: confirmar overwrite, manter stamp/codigo do
    // registo actual e marcar os componentes existentes para delete.
    var state = "";
    try { state = $("#mainPage").data("state") || ""; } catch (e) { state = ""; }
    if (state === "consultar") {
        var ok = window.confirm("Sobrescrever a configuração do relatório actual com o conteúdo do ficheiro importado?\n\nOs componentes existentes (linhas, colunas, células, ligações, grupos) serão substituídos.");
        if (!ok) return;
        importarOverwriteRelatorioActual(payload);
        return;
    }
    // Caso geral: abre modal com inputs editaveis (codigo/nome/categoria/tipo/expfonte)
    // pre-preenchidos a partir do payload, permitindo ao utilizador alterar
    // antes de confirmar (caso de uso: usar config base de outro relatorio).
    abrirModalImportMrend(payload);
}

/**
 * Importa um payload sobrescrevendo o relatório actualmente aberto:
 *   - relatoriostamp e codigo vêm do DOM do registo actual (campos dinamicos)
 *   - regenera todos os stamps dos componentes (linhas, colunas, células...)
 *   - faz replace do código antigo pelo novo dentro do JSON string rendopt
 *   - marca todos os componentes actuais (GMrend*) em recordsToDelete
 *   - chama directamente cscript=actualizarmrendconfig
 *   - recarrega a página em caso de sucesso
 */
function importarOverwriteRelatorioActual(payload) {
    if (!payload || !Array.isArray(payload.config)) {
        if (typeof alertify !== "undefined") alertify.error("Ficheiro inválido: 'config' em falta", 5000);
        return;
    }

    // 1) Stamp e codigo do registo actual a partir do DOM (campos dinamicos)
    var stampField = GRelatorioTableKey || "u_mrendrelstamp";
    var filterField = GRelatorioTableFilterField || "codigo";
    var relStamp = ($("#ctl00_conteudo_u_mrendrelstamp_mLabel1").text() || "").trim();
    var novoCodigo = ($("#ctl00_conteudo_codigo_mLabel1").text() || "").trim();
    if (!relStamp) {
        if (typeof alertify !== "undefined") alertify.error("Não foi possível obter o stamp do relatório actual a partir do DOM", 7000);
        return;
    }
    if (!novoCodigo) {
        if (typeof alertify !== "undefined") alertify.error("Não foi possível obter o código do relatório actual a partir do DOM", 7000);
        return;
    }

    // 2) Clona o configData do payload e regenera stamps dos componentes
    var configData = JSON.parse(JSON.stringify(payload.config));
    regenerateMrendStamps(configData);

    // 3) Identifica o codigo antigo (do payload) para substituir no rendopt
    var relatorioGroup = configData.find(function (x) { return x.sourceTable === GRelatorioTable; });
    var relatorioRec = (relatorioGroup && relatorioGroup.records && relatorioGroup.records[0]) || null;
    var codigoAntigo = "";
    if (relatorioRec) {
        codigoAntigo = relatorioRec[filterField] || relatorioRec.codigo || "";
    }
    if (!codigoAntigo && payload) {
        codigoAntigo = payload[filterField] || payload.codigo || "";
    }

    // 4) Substitui o codigo antigo pelo novo dentro do rendopt (string JSON)
    if (relatorioRec && relatorioRec.rendopt && codigoAntigo && codigoAntigo !== novoCodigo) {
        try {
            var rendoptStr = String(relatorioRec.rendopt);
            // Replace global de todas as ocorrencias do codigo antigo
            var safeOld = codigoAntigo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            rendoptStr = rendoptStr.replace(new RegExp(safeOld, "g"), novoCodigo);
            relatorioRec.rendopt = rendoptStr;
        } catch (e) {
            console.warn("Falha no replace do codigo antigo no rendopt:", e);
        }
    }

    // 5) Força FK relatoriostamp em todos os records auxiliares
    configData.forEach(function (group) {
        if (!group || !Array.isArray(group.records)) return;
        group.records.forEach(function (rec) {
            if (rec && Object.prototype.hasOwnProperty.call(rec, "relatoriostamp")) {
                rec.relatoriostamp = relStamp;
            }
        });
    });

    // 6) Acerta as chaves dinamicas do registo do relatorio
    if (relatorioRec) {
        if (stampField !== "relatoriostamp" && Object.prototype.hasOwnProperty.call(relatorioRec, "relatoriostamp")) {
            delete relatorioRec.relatoriostamp;
        }
        if (filterField !== "codigo" && Object.prototype.hasOwnProperty.call(relatorioRec, "codigo")) {
            delete relatorioRec.codigo;
        }
        relatorioRec[stampField] = relStamp;
        relatorioRec[filterField] = novoCodigo;
    }

    // 7) Marca TODOS os componentes actuais (em memória) para delete
    var recordsToDelete = [];
    function pushDeletes(arr, tabela, tableKey) {
        (arr || []).forEach(function (r) {
            var stamp = r && r[tableKey];
            if (stamp) recordsToDelete.push({ table: tabela, stamp: stamp, tableKey: tableKey });
        });
    }
    pushDeletes(GMrendConfigColunas, "MrendColuna", "colunastamp");
    pushDeletes(GMrendConfigLinhas, "MrendLinha", "linhastamp");
    pushDeletes(GMrendConfigCelulas, "MrendCelula", "celulastamp");
    pushDeletes(GMrendLigacoes, "Mrendconfigligacao", "mrendligacoesstamp");
    pushDeletes(GMrendGrupoColunas, "MrendGrupoColuna", "grupocolunastamp");
    pushDeletes(GMrendGrupoColunaItems, "MrendGrupoColunaItem", "grupocolunaitemstamp");

    console.log("Overwrite import: relStamp=", relStamp, "codigoAntigo=", codigoAntigo, "novoCodigo=", novoCodigo, "deletes=", recordsToDelete.length);

    // 8) Chamada DIRECTA ao cscript actualizarmrendconfig
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizarmrendconfig",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                relatoriostamp: relStamp,
                config: configData,
                recordsToDelete: recordsToDelete
            }])
        },
        success: function (response) {
            try {
                console.log("Resposta overwrite import:", response);
                if (response && response.cod && response.cod !== "0000") {
                    if (typeof alertify !== "undefined") alertify.error("Erro ao gravar (cod " + response.cod + ")", 9000);
                    return;
                }
                if (typeof alertify !== "undefined") alertify.success("Importação concluída. A recarregar...", 3000);
                setTimeout(function () { location.reload(); }, 600);
            } catch (error) {
                console.error("Erro interno na resposta do overwrite import", error);
                if (typeof alertify !== "undefined") alertify.error("Erro interno ao gravar importação", 9000);
            }
        },
        error: function (xhr, status, err) {
            console.error("Erro AJAX overwrite import", status, err);
            if (typeof alertify !== "undefined") alertify.error("Falha de comunicação: " + (err || status), 9000);
        }
    });
}

function abrirModalImportMrend(payload) {
    // Remove modal anterior se existir
    $("#modalImportMrendConfig").remove();

    // Determina valores pre-preenchidos: prioridade ao record da tabela
    // do relatorio dentro do payload.config; fallback aos campos top-level.
    var relatorioRec = null;
    if (payload && Array.isArray(payload.config)) {
        var g = payload.config.find(function (x) { return x && x.sourceTable === GRelatorioTable; });
        if (g && Array.isArray(g.records) && g.records.length) relatorioRec = g.records[0];
    }
    function pick(field) {
        if (relatorioRec && relatorioRec[field] != null && relatorioRec[field] !== "") return relatorioRec[field];
        if (payload && payload[field] != null) return payload[field];
        return "";
    }
    // codigo/filter pode estar sob a chave dinamica ou sob "codigo" legado
    var codigoVal = "";
    if (relatorioRec) {
        codigoVal = relatorioRec[GRelatorioTableFilterField] || relatorioRec.codigo || "";
    }
    if (!codigoVal && payload) {
        codigoVal = payload[GRelatorioTableFilterField] || payload.codigo || "";
    }

    var nomeVal = pick("nome");
    var categoriaVal = pick("categoria");
    var tipoVal = pick("tipo");
    var expfonteVal = pick("expfonte");

    var filterLabel = GRelatorioTableFilterField || "codigo";

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    var html = ""
        + "<div class='modal fade' id='modalImportMrendConfig' tabindex='-1' role='dialog'>"
        + "  <div class='modal-dialog modal-lg' role='document'>"
        + "    <div class='modal-content'>"
        + "      <div class='modal-header'>"
        + "        <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
        + "        <h4 class='modal-title'><span class='glyphicon glyphicon-import'></span> Importar Configuração Mrend</h4>"
        + "      </div>"
        + "      <div class='modal-body'>"
        + "        <p class='text-muted' style='margin-bottom:1em'>Reveja/edite os campos do relatório antes de confirmar a importação. Pode usar uma configuração base de outro relatório e ajustar aqui os identificadores.</p>"
        + "        <div class='row'>"
        + "          <div class='form-group col-md-6'>"
        + "            <label for='impMrend_codigo'>" + esc(filterLabel) + " *</label>"
        + "            <input type='text' class='form-control input-sm' id='impMrend_codigo' value='" + esc(codigoVal) + "' />"
        + "          </div>"
        + "          <div class='form-group col-md-6'>"
        + "            <label for='impMrend_nome'>Nome</label>"
        + "            <input type='text' class='form-control input-sm' id='impMrend_nome' value='" + esc(nomeVal) + "' />"
        + "          </div>"
        + "          <div class='form-group col-md-6'>"
        + "            <label for='impMrend_categoria'>Categoria</label>"
        + "            <input type='text' class='form-control input-sm' id='impMrend_categoria' value='" + esc(categoriaVal) + "' />"
        + "          </div>"
        + "          <div class='form-group col-md-6'>"
        + "            <label for='impMrend_tipo'>Tipo</label>"
        + "            <input type='text' class='form-control input-sm' id='impMrend_tipo' value='" + esc(tipoVal) + "' />"
        + "          </div>"
        + "          <div class='form-group col-md-12'>"
        + "            <label for='impMrend_expfonte'>Expressão Fonte</label>"
        + "            <input type='text' class='form-control input-sm' id='impMrend_expfonte' value='" + esc(expfonteVal) + "' />"
        + "          </div>"
        + "        </div>"
        + "        <hr/>"
        + "        <div class='checkbox'>"
        + "          <label><input type='checkbox' id='impMrend_gerarNovos' checked /> <strong>Gerar NOVOS stamps</strong> para os componentes (recomendado para criar novo relatório a partir de uma base)</label>"
        + "        </div>"
        + "        <p class='text-muted' style='font-size:0.9em;margin-top:0.5em'>Desmarque apenas para migração/substituição mantendo stamps originais.</p>"
        + "      </div>"
        + "      <div class='modal-footer'>"
        + "        <button type='button' class='btn btn-default' data-dismiss='modal'>Cancelar</button>"
        + "        <button type='button' class='btn btn-primary' id='impMrend_confirmBtn'><span class='glyphicon glyphicon-ok'></span> Confirmar Importação</button>"
        + "      </div>"
        + "    </div>"
        + "  </div>"
        + "</div>";

    $("body").append(html);
    $("#modalImportMrendConfig").modal({ backdrop: "static", keyboard: true }).modal("show");

    $("#impMrend_confirmBtn").off("click").on("click", function () {
        var overrides = {
            codigo: $("#impMrend_codigo").val(),
            nome: $("#impMrend_nome").val(),
            categoria: $("#impMrend_categoria").val(),
            tipo: $("#impMrend_tipo").val(),
            expfonte: $("#impMrend_expfonte").val()
        };
        if (!overrides.codigo || !String(overrides.codigo).trim()) {
            if (typeof alertify !== "undefined") alertify.error("Campo '" + filterLabel + "' obrigatório", 4000);
            $("#impMrend_codigo").focus();
            return;
        }
        var gerarNovos = $("#impMrend_gerarNovos").is(":checked");
        $("#modalImportMrendConfig").modal("hide");
        setTimeout(function () { $("#modalImportMrendConfig").remove(); }, 400);
        aplicarImportMrendConfig(payload, gerarNovos, overrides);
    });
}

/**
 * Regenera stamps mantendo relacoes.
 * Pass 1: PK (sourceKey) de cada record -> stampMap old->new (excepto tabela do relatorio)
 * Pass 2: substitui em qualquer campo string que corresponda a um stamp conhecido (cobre FKs)
 * Pass 3: reconstroi ligacaokey
 */
function regenerateMrendStamps(configData) {
    var stampMap = {};

    configData.forEach(function (group) {
        if (!group || !Array.isArray(group.records)) return;
        if (!group.sourceKey) return;
        if (group.sourceTable === GRelatorioTable) return;
        group.records.forEach(function (rec) {
            if (!rec) return;
            var old = rec[group.sourceKey];
            if (old && typeof old === "string" && !stampMap[old]) {
                stampMap[old] = generateUUID();
            }
        });
    });

    configData.forEach(function (group) {
        if (!group || !Array.isArray(group.records)) return;
        group.records.forEach(function (rec) {
            if (!rec) return;
            Object.keys(rec).forEach(function (field) {
                var val = rec[field];
                if (typeof val === "string" && stampMap[val]) {
                    rec[field] = stampMap[val];
                }
            });
        });
    });

    configData.forEach(function (group) {
        if (group.sourceTable !== "Mrendconfigligacao") return;
        group.records.forEach(function (rec) {
            if (!rec) return;
            rec.ligacaokey = (rec.componentelibstamp || "") + "___" + (rec.componentenegstamp || "");
        });
    });

    return stampMap;
}

/**
 * Aplica o payload importado as variaveis globais G* e re-renderiza.
 * @param {Object}  payload      O JSON carregado (payload.config = array)
 * @param {boolean} gerarNovos   true = regenera stamps dos componentes
 * @param {Object}  [overrides]  Valores editados no modal: {codigo, nome, categoria, tipo, expfonte}
 *                               Quando presentes, têm prioridade sobre o DOM (permite criar novo
 *                               relatório a partir de uma config base).
 */
function aplicarImportMrendConfig(payload, gerarNovos, overrides) {
    if (!payload || !Array.isArray(payload.config)) {
        if (typeof alertify !== "undefined") alertify.error("Ficheiro invalido: 'config' em falta", 5000);
        return;
    }

    var configData = JSON.parse(JSON.stringify(payload.config));

    if (gerarNovos) {
        regenerateMrendStamps(configData);
    }

    // relatoriostamp: SEMPRE do DOM do registo aberto; se vazio, novo UUID.
    // Aplica independentemente da opcao gerarNovos (regra explicita do utilizador).
    var relatorioDOM = readRelatorioFromDOM();
    var relStamp = relatorioDOM.relatoriostamp;
    GRelatorioStamp = relStamp;

    // Merge: overrides (modal) > DOM > payload.
    overrides = overrides || {};
    function ov(field) {
        if (overrides[field] != null && String(overrides[field]).trim() !== "") return overrides[field];
        return relatorioDOM[field];
    }
    var finalCodigo = ov("codigo");
    var finalNome = ov("nome");
    var finalCategoria = ov("categoria");
    var finalTipo = ov("tipo");
    var finalExpfonte = (overrides.expfonte != null) ? overrides.expfonte : relatorioDOM.expfonte;

    configData.forEach(function (group) {
        if (!group || !Array.isArray(group.records)) return;
        group.records.forEach(function (rec) {
            if (rec && Object.prototype.hasOwnProperty.call(rec, "relatoriostamp")) {
                rec.relatoriostamp = relStamp;
            }
        });
    });

    function getRecords(table) {
        var g = configData.find(function (x) { return x.sourceTable === table; });
        return (g && Array.isArray(g.records)) ? g.records : [];
    }

    var relatorioGroup = configData.find(function (x) { return x.sourceTable === GRelatorioTable; });
    var relatorioRec = (relatorioGroup && relatorioGroup.records && relatorioGroup.records[0]) || null;
    if (relatorioRec) {
        // As chaves PK e filtro dependem da tabela configurada (GRelatorioTableKey / GRelatorioTableFilterField).
        // Limpa chaves legadas hardcoded para evitar duplicacao quando o JSON importado vem com nomes diferentes.
        if (GRelatorioTableKey !== "relatoriostamp" && Object.prototype.hasOwnProperty.call(relatorioRec, "relatoriostamp")) {
            delete relatorioRec.relatoriostamp;
        }
        if (GRelatorioTableFilterField !== "codigo" && Object.prototype.hasOwnProperty.call(relatorioRec, "codigo")) {
            delete relatorioRec.codigo;
        }
        relatorioRec[GRelatorioTableKey] = relStamp;
        if (finalCodigo) relatorioRec[GRelatorioTableFilterField] = finalCodigo;
        if (finalNome) relatorioRec.nome = finalNome;
        if (finalCategoria) relatorioRec.categoria = finalCategoria;
        if (finalExpfonte != null) relatorioRec.expfonte = finalExpfonte;
        if (finalTipo) relatorioRec.tipo = finalTipo;
    }

    // Espelha os valores finais no cabeçalho do formulário PHC (inputs + labels)
    // para que o utilizador veja o estado e o PHC grave os campos correctos.
    writeRelatorioToDOM({
        codigo: finalCodigo,
        nome: finalNome,
        categoria: finalCategoria,
        tipo: finalTipo,
        expfonte: finalExpfonte
    });

    var configForRender = {
        colunas: getRecords("MrendColuna"),
        linhas: getRecords("MrendLinha"),
        celulas: getRecords("MrendCelula"),
        grupocolunas: getRecords("MrendGrupoColuna"),
        grupocolunaItems: getRecords("MrendGrupoColunaItem"),
        ligacoes: getRecords("Mrendconfigligacao"),
        relatorio: relatorioRec || {}
    };

    GMrendDeleteRecords = [];
    try {
        GMrendLigacoes = (configForRender.ligacoes || []).map(function (l) {
            return (typeof Mrendconfigligacao === "function") ? new Mrendconfigligacao(l) : l;
        });
    } catch (e) {
        GMrendLigacoes = (configForRender.ligacoes || []).slice();
    }
    GMrendLigacoesExistentes = GMrendLigacoes.slice();

    try {
        renderConfigMrender(configForRender);
    } catch (err) {
        console.error("Erro ao aplicar configuracao importada", err);
        if (typeof alertify !== "undefined") alertify.error("Erro ao aplicar configuracao: " + err.message, 9000);
        return;
    }

    // Grava IMEDIATAMENTE no backend usando o mesmo cscript de actualizarConfiguracaoMrender.
    // O backend é abstracto: aceita o configData no formato { sourceTable, sourceKey, records }.
    persistImportMrendConfig(configData, relStamp, gerarNovos);
}

/**
 * Persiste o configData importado chamando directamente o cscript
 * `actualizarmrendconfig` (mesmo endpoint usado por actualizarConfiguracaoMrender).
 * O backend é abstracto sobre as sourceTables, por isso pode receber o payload
 * importado tal como foi montado em aplicarImportMrendConfig.
 */
function persistImportMrendConfig(configData, relStamp, gerarNovos) {
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizarmrendconfig",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                relatoriostamp: relStamp,
                config: configData,
                recordsToDelete: []
            }])
        },
        success: function (response) {
            try {
                console.log("Resposta da gravacao da importacao:", response);
                if (response && response.cod && response.cod !== "0000") {
                    if (typeof alertify !== "undefined") {
                        alertify.error("Erro ao gravar configuracao importada (cod " + response.cod + ")", 9000);
                    }
                    return;
                }
                GMrendDeleteRecords = [];
                if (typeof alertify !== "undefined") {
                    alertify.success(
                        gerarNovos
                            ? "Configuracao importada e gravada com NOVOS stamps."
                            : "Configuracao importada e gravada (stamps originais).",
                        7000
                    );
                }
                // Refresca a partir da BD para garantir consistencia com o que foi gravado.
                try {
                    var codigoToFetch = GConfigCodigo || (GRelatorioConfig && GRelatorioConfig[GRelatorioTableFilterField]);
                    if (codigoToFetch) {
                        fetchConfigMrender(codigoToFetch);
                    }
                } catch (e) {
                    console.warn("Falha ao refrescar configuracao apos import:", e);
                }
            } catch (error) {
                console.error("Erro interno ao processar resposta da importacao", error);
                if (typeof alertify !== "undefined") alertify.error("Erro interno ao gravar importacao", 9000);
            }
        },
        error: function (xhr, status, err) {
            console.error("Erro AJAX ao gravar importacao", status, err);
            if (typeof alertify !== "undefined") alertify.error("Falha de comunicacao ao gravar importacao: " + (err || status), 9000);
        }
    });
}

function actualizarConfiguracaoMrender() {

    var configData = buildMrendConfigData();

    console.log("configData Records", configData)
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizarmrendconfig",

        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GRelatorioStamp, config: configData, recordsToDelete: GMrendDeleteRecords }]),
        },
        success: function (response) {

            var errorMessage = "ao trazer resultados "
            try {
                console.log(response)
                if (response.cod != "0000") {

                    console.log("Erro " + errorMessage, response);
                    alertify.error("Erro ao actualizar configuração", 9000)
                    return false
                }
                // Clear delete records array after successful save
                GMrendDeleteRecords = [];
                alertify.success("Dados actualizados com sucesso", 9000)
            } catch (error) {
                console.log("Erro interno " + errorMessage, response, error)
                //alertify.error("Erro interno " + errorMessage, 10000)
            }

            //  javascript:__doPostBack('','')
        }
    })

}


/**
 * ---------------------------------------------------------------------------
 * DRAG & DROP - REORDENAR COLUNAS
 * ---------------------------------------------------------------------------
 * Sistema de drag-and-drop para reordenar colunas de forma intuitiva.
 * Atualiza automaticamente o campo "ordem" e sincroniza com backend.
 */

/**
 * Carrega os estilos CSS para drag & drop de colunas
 */
function loadMrendSortableStyles() {
    if (document.getElementById("mrendSortableStyles")) return;

    var style = document.createElement("style");
    style.id = "mrendSortableStyles";

    var css = "";

    // Estilo do ghost (elemento sendo arrastado)
    css += ".mrend-coluna-sortable-ghost { ";
    css += "  opacity: 0.4 !important; ";
    css += "  background: #e3f2fd !important; ";
    css += "  border: 2px dashed #2196f3 !important; ";
    css += "} ";

    // Estilo do placeholder (onde vai soltar)
    css += ".mrend-coluna-sortable-placeholder { ";
    css += "  background: #c5e1a5 !important; ";
    css += "  border: 2px dashed #66bb6a !important; ";
    css += "  visibility: visible !important; ";
    css += "} ";

    // Estilo durante o drag
    css += ".mrend-coluna-sortable-chosen { ";
    css += "  cursor: grabbing !important; ";
    css += "  background: #fff3e0 !important; ";
    css += "} ";

    // Handle de drag (�cone que aparece ao hover)
    css += ".mrend-coluna-drag-handle { ";
    css += "  position: absolute; ";
    css += "  top: 5px; ";
    css += "  right: 30px; ";
    css += "  cursor: move; ";
    css += "  cursor: grab; ";
    css += "  color: #9e9e9e; ";
    css += "  font-size: 14px; ";
    css += "  opacity: 0; ";
    css += "  transition: opacity 0.2s ease; ";
    css += "  z-index: 10; ";
    css += "  padding: 3px; ";
    css += "} ";

    css += ".colunaHeader:hover .mrend-coluna-drag-handle { ";
    css += "  opacity: 1; ";
    css += "} ";

    css += ".mrend-coluna-drag-handle:active { ";
    css += "  cursor: grabbing; ";
    css += "} ";

    // Adiciona cursor de grab nas colunas
    css += ".colunaHeader.ui-sortable-handle { ";
    css += "  cursor: move; ";
    css += "  cursor: grab; ";
    css += "} ";

    // ── ESTILOS PARA DRAG & DROP DE LINHAS ──────────────────────────
    // Espelha a estrutura das colunas, adaptado para eixo vertical e treetable

    // Ghost (linha sendo arrastada)
    css += ".mrend-linha-sortable-ghost { ";
    css += "  opacity: 0.4 !important; ";
    css += "  background: #e3f2fd !important; ";
    css += "  outline: 2px dashed #2196f3 !important; ";
    css += "} ";

    // Placeholder (onde vai soltar)
    css += "tr.mrend-linha-sortable-placeholder { ";
    css += "  background: #c5e1a5 !important; ";
    css += "  outline: 2px dashed #66bb6a !important; ";
    css += "  visibility: visible !important; ";
    css += "} ";

    // Durante o drag
    css += ".mrend-linha-sortable-chosen { ";
    css += "  cursor: grabbing !important; ";
    css += "  background: #fff3e0 !important; ";
    css += "} ";

    // Handle (icone que aparece ao hover na linha-acoes)
    css += ".mrend-linha-drag-handle { ";
    css += "  display: inline-block; ";
    css += "  cursor: move; ";
    css += "  cursor: grab; ";
    css += "  color: #9e9e9e; ";
    css += "  font-size: 16px; ";
    css += "  opacity: 0; ";
    css += "  transition: opacity 0.2s ease; ";
    css += "  margin-right: 6px; ";
    css += "  padding: 2px 4px; ";
    css += "  vertical-align: middle; ";
    css += "  user-select: none; ";
    css += "} ";

    css += "tr.linhaHeader:hover .mrend-linha-drag-handle { ";
    css += "  opacity: 1; ";
    css += "} ";

    css += ".mrend-linha-drag-handle:active { ";
    css += "  cursor: grabbing; ";
    css += "} ";

    // Feedback visual quando drop e invalido (entre paizes diferentes)
    css += ".mrend-linha-drop-invalid { ";
    css += "  background: #ffebee !important; ";
    css += "  outline: 2px dashed #e53935 !important; ";
    css += "} ";

    style.textContent = css;
    document.head.appendChild(style);
}

/**
 * Torna as colunas do header arrast�veis para reordenar
 */
function makeColunasSortable() {
    // Verifica se jQuery UI Sortable est� dispon�vel
    if (!$.fn.sortable) {
        console.warn("MRend Sortable: jQuery UI Sortable n�o est� dispon�vel. Tentando novamente em 500ms...");
        setTimeout(makeColunasSortable, 500);
        return;
    }

    var $thead = $('#inputReportTable thead tr');

    if (!$thead.length) {
        console.warn("MRend Sortable: <thead> n�o encontrado");
        return;
    }

    console.log("MRend Sortable: Inicializando drag-and-drop nas colunas...");

    // Destroy sortable existente se houver
    if ($thead.hasClass('ui-sortable')) {
        try {
            $thead.sortable('destroy');
        } catch (e) {
            console.warn("Erro ao destruir sortable existente:", e);
        }
    }

    // Adiciona �cones de drag a cada coluna (exceto "Ac��es")
    $thead.find('th.colunaHeader').each(function () {
        var $th = $(this);

        // N�o adiciona handle se j� existe
        if ($th.find('.mrend-coluna-drag-handle').length > 0) return;

        // N�o adiciona handle na coluna de Ac��es
        if ($th.attr('id') === 'coluna-acoes') return;

        var $dragHandle = $('<span class="mrend-coluna-drag-handle" title="Arrastar para reordenar">&#8942;&#8942;</span>');
        $th.prepend($dragHandle);
    });

    // Inicializa jQuery UI Sortable
    $thead.sortable({
        items: '> th.colunaHeader:not(#coluna-acoes)', // Exclui coluna de Ac��es
        axis: 'x',
        tolerance: 'pointer',
        distance: 5,
        cursor: 'grabbing',
        placeholder: 'mrend-coluna-sortable-placeholder',
        helper: 'clone',
        forcePlaceholderSize: true,
        containment: 'parent',

        start: function (event, ui) {
            ui.item.addClass('mrend-coluna-sortable-chosen');
            ui.placeholder.height(ui.item.outerHeight());
            console.log("Drag start:", ui.item.attr('id'));
        },

        stop: function (event, ui) {
            ui.item.removeClass('mrend-coluna-sortable-chosen');
            console.log("Drag stop:", ui.item.attr('id'));

            // Atualiza a ordem das colunas baseado na nova posi��o no DOM
            updateColunasOrdemFromDOM();
        },

        change: function (event, ui) {
            // Feedback visual durante o movimento
            console.log("Posi��o alterada");
        }
    });

    var colunasCount = $thead.find('> th.colunaHeader:not(#coluna-acoes)').length;
    console.log("✓ MRend Sortable: " + colunasCount + " colunas configuradas para drag & drop");
    console.log("✓ Para arrastar: passe o mouse sobre a coluna e clique no ícone ⋮⋮");
}

/**
 * Atualiza o campo "ordem" de todas as colunas baseado na posi��o atual no DOM
 */
function updateColunasOrdemFromDOM() {
    var $thead = $('#inputReportTable thead tr');
    var ordem = 1;

    $thead.find('th.colunaHeader:not(#coluna-acoes)').each(function () {
        var colunastamp = $(this).attr('id');

        if (!colunastamp) return;

        // Encontra a coluna no array GMrendConfigColunas
        var coluna = GMrendConfigColunas.find(function (col) {
            return col.colunastamp === colunastamp;
        });

        if (coluna && coluna.ordem !== ordem) {
            console.log("Atualizando ordem:", coluna.desccoluna, "de", coluna.ordem, "para", ordem);
            coluna.ordem = ordem;
        }

        ordem++;
    });

    // Re-sort array GMrendConfigColunas pela nova ordem
    GMrendConfigColunas.sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    // NOTA: updateTbodyCellsOrder() desabilitado - requer recarga da tabela para aplicar nova ordem
    // updateTbodyCellsOrder();

    // Feedback ao utilizador
    alertify.success("Ordem das colunas atualizada! Clique em 'Actualizar Configura��o' para gravar e recarregue a p�gina.", 4000);

    console.log("? Ordem das colunas atualizada:", GMrendConfigColunas.map(function (c) {
        return c.desccoluna + " (" + c.ordem + ")";
    }));
}

/**
 * Atualiza a ordem das c�lulas (<td>) nas linhas para corresponder � nova ordem das colunas
 */
function updateTbodyCellsOrder() {
    var $table = $('#inputReportTable');
    var $thead = $table.find('thead tr');
    var $tbody = $table.find('tbody');

    // Obtem a ordem correta das colunas baseado no <thead>
    var colunaOrder = [];
    $thead.find('th.colunaHeader:not(#coluna-acoes)').each(function () {
        var colunastamp = $(this).attr('id');
        if (colunastamp) {
            colunaOrder.push(colunastamp);
        }
    });

    // Para cada linha no tbody, reordena as c�lulas
    $tbody.find('tr').each(function () {
        var $tr = $(this);
        var $acoesCell = $tr.find('td:first'); // C�lula de a��es (primeira coluna)
        var cells = {};

        // Coleta todas as c�lulas indexadas por colunastamp
        $tr.find('td[data-colunacell]').each(function () {
            var colunastamp = $(this).attr('data-colunacell');
            cells[colunastamp] = $(this).detach();
        });

        // Reinsere as c�lulas na ordem correta
        colunaOrder.forEach(function (colunastamp) {
            if (cells[colunastamp]) {
                $tr.append(cells[colunastamp]);
            }
        });
    });

    console.log("? C�lulas do tbody reordenadas");
}


/**
 * ---------------------------------------------------------------------------
 * DRAG & DROP - REORDENAR LINHAS
 * ---------------------------------------------------------------------------
 * Espelha a arquitetura usada para colunas (loadMrendSortableStyles +
 * makeColunasSortable + updateColunasOrdemFromDOM), adaptada para:
 *   - eixo vertical (axis: 'y')
 *   - hierarquia treetable: ao arrastar uma linha pai, todos os descendentes
 *     (data-tt-parent-id encadeado) movem-se em conjunto
 *   - restricao: so e permitido reordenar entre irmaos (mesmo parent).
 *     Drop fora do grupo de irmaos e cancelado.
 *
 * Hooks de inicializacao:
 *   - loadMrendSortableStyles()  -> $(document).ready (uma vez)
 *   - makeLinhasSortable()       -> apos cada insercao/remocao de linha
 *
 * Persistencia:
 *   - updateLinhasOrdemFromDOM() atualiza GMrendConfigLinhas[].ordem com base
 *     na nova ordem visual no DOM. O save final usa o array como single source
 *     of truth (igual ao fluxo das colunas).
 */

/**
 * Devolve a linha + todos os seus descendentes (recursivo) na ordem em que
 * aparecem no DOM. Util para mover uma subtree como bloco unico.
 *
 * @param {jQuery} $tr - Elemento <tr> raiz da subtree
 * @returns {jQuery} Coleccao jQuery com $tr e todos os descendentes
 */
function getLinhaSubtree($tr) {
    var $result = $tr;
    var stamp = $tr.attr("id");
    if (!stamp) return $result;

    var $table = $tr.closest("table");
    var $directChildren = $table.find("tbody tr[data-tt-parent-id='" + stamp + "']");

    $directChildren.each(function () {
        $result = $result.add(getLinhaSubtree($(this)));
    });

    return $result;
}

/**
 * Torna as linhas do tbody arrastaveis para reordenar.
 * Espelha makeColunasSortable() para manter o codigo familiar a quem ja
 * conhece o sistema das colunas.
 */
function makeLinhasSortable() {
    if (!$.fn.sortable) {
        console.warn("MRend Sortable: jQuery UI Sortable nao esta disponivel. Tentando novamente em 500ms...");
        setTimeout(makeLinhasSortable, 500);
        return;
    }

    var $tbody = $('#' + (GRendConfigTableHtml && GRendConfigTableHtml.tableId ? GRendConfigTableHtml.tableId : 'inputReportTable') + ' tbody');

    if (!$tbody.length) {
        console.warn("MRend Sortable Linhas: <tbody> nao encontrado");
        return;
    }

    // Destroy sortable existente se houver (idempotente)
    if ($tbody.hasClass('ui-sortable')) {
        try { $tbody.sortable('destroy'); } catch (e) { console.warn("Erro ao destruir sortable de linhas:", e); }
    }

    // Adiciona handle de drag em cada linha (na celula .linha-acoes)
    $tbody.find('tr.linhaHeader').each(function () {
        var $tr = $(this);
        var $acoes = $tr.find('td.linha-acoes');
        if (!$acoes.length) return;
        if ($acoes.find('.mrend-linha-drag-handle').length > 0) return;

        var $handle = $('<span class="mrend-linha-drag-handle" title="Arrastar para reordenar">&#8942;&#8942;</span>');
        $acoes.prepend($handle);
    });

    // Estado de drag (para validacao e movimento da subtree)
    var dragState = { $subtree: null, originalParent: null, originalIndex: -1 };

    $tbody.sortable({
        items: '> tr.linhaHeader',
        handle: '.mrend-linha-drag-handle, td.linha-acoes',
        axis: 'y',
        tolerance: 'pointer',
        distance: 5,
        cursor: 'grabbing',
        placeholder: 'mrend-linha-sortable-placeholder',
        helper: 'clone',
        forcePlaceholderSize: true,

        start: function (event, ui) {
            ui.item.addClass('mrend-linha-sortable-chosen');
            ui.placeholder.height(ui.item.outerHeight());

            dragState.$subtree = getLinhaSubtree(ui.item);
            dragState.originalParent = ui.item.attr('data-tt-parent-id') || '';
            dragState.originalIndex = ui.item.index();

            // Esconde os descendentes durante o drag (movem em conjunto no stop)
            dragState.$subtree.not(ui.item).hide();

            console.log("Linha drag start:", ui.item.attr('id'), "(subtree:", dragState.$subtree.length, "linhas)");
        },

        stop: function (event, ui) {
            ui.item.removeClass('mrend-linha-sortable-chosen');

            var $movedRow = ui.item;
            var newParent = '';

            // Determinar novo parent: irmao acima (mesmo parent) ou raiz se nao houver
            var $prev = $movedRow.prevAll('tr.linhaHeader:visible').first();
            if ($prev.length) {
                newParent = $prev.attr('data-tt-parent-id') || '';
                // Se prev e o proprio parent original e nao filho de outro contexto, mantem
            }

            // REGRA: so e permitido reordenar entre irmaos (mesmo parent)
            if (newParent !== dragState.originalParent) {
                console.warn("Linha drop invalido: parent diferente. Original='" + dragState.originalParent + "' Novo='" + newParent + "'. Cancelando.");
                $tbody.sortable('cancel');
                dragState.$subtree.show();
                alertify.warning("So e possivel reordenar entre linhas irmas (mesmo nivel hierarquico).", 4000);
                return;
            }

            // Reanexa os descendentes logo apos a linha movida, preservando ordem
            var $descendants = dragState.$subtree.not($movedRow);
            $descendants.show();
            var $insertAfter = $movedRow;
            $descendants.each(function () {
                $insertAfter.after(this);
                $insertAfter = $(this);
            });

            console.log("Linha drag stop:", $movedRow.attr('id'));
            updateLinhasOrdemFromDOM();

            dragState.$subtree = null;
        },

        change: function () {
            // hook reservado para feedback visual futuro
        }
    });

    var linhasCount = $tbody.find('> tr.linhaHeader').length;
    console.log("✓ MRend Sortable: " + linhasCount + " linhas configuradas para drag & drop (axis Y, restrito a irmaos)");
}

/**
 * Atualiza o campo "ordem" de todas as linhas baseado na posicao atual no DOM.
 * Espelha updateColunasOrdemFromDOM().
 */
function updateLinhasOrdemFromDOM() {
    var tableId = (GRendConfigTableHtml && GRendConfigTableHtml.tableId) ? GRendConfigTableHtml.tableId : 'inputReportTable';
    var $tbody = $('#' + tableId + ' tbody');
    var ordem = 1;
    var alteracoes = 0;

    $tbody.find('tr.linhaHeader').each(function () {
        var linhastamp = $(this).attr('id');
        if (!linhastamp) return;

        var linha = GMrendConfigLinhas.find(function (l) {
            return l.linhastamp === linhastamp;
        });

        if (linha && linha.ordem !== ordem) {
            console.log("Atualizando ordem linha:", (linha.descricao || linha.codigo || linhastamp), "de", linha.ordem, "para", ordem);
            linha.ordem = ordem;
            alteracoes++;
        }

        ordem++;
    });

    // Re-sort GMrendConfigLinhas pela nova ordem (single source of truth)
    GMrendConfigLinhas.sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    if (alteracoes > 0) {
        alertify.success("Ordem das linhas atualizada! Clique em 'Actualizar Configuracao' para gravar.", 4000);
    }

    console.log("Ordem das linhas atualizada:", GMrendConfigLinhas.map(function (l) {
        return (l.descricao || l.codigo || l.linhastamp) + " (" + l.ordem + ")";
    }));
}


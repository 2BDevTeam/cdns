// ============================================================================
// MDASH 2.0 — Mdash Library.js
// ----------------------------------------------------------------------------
// Sistema de BIBLIOTECAS/RECURSOS (hoje: ícones). Ficheiro autónomo para não
// misturar com o "MDash config lib.js". O config lib apenas consome estas
// funções globais (ex.: getMdashLayoutIconOptions, buildMdashLayoutIconPickerHtml).
//
// Depende de globais definidos no config lib (resolvidos em runtime):
//   jQuery ($), generateUUID, gerarIdNumerico, forceJSONParse,
//   realTimeComponentSync, GMdashDeleteRecords
//
// IMPORTANTE: este ficheiro tem de ser incluído na página (a par do config lib).
// A ordem de carregamento não é crítica (só há chamadas em runtime).
// ============================================================================

// ============================================================================
// SISTEMA DE BIBLIOTECAS DE ÍCONES (registo extensível)
// ----------------------------------------------------------------------------
// Cada biblioteca tem: id, label, kind ('material' | 'prefix'), e uma lista de
// ícones. Quem cria layouts pode registar/importar novas bibliotecas com
// registerMdashIconLibrary({...}). O picker mostra tudo agrupado por categoria.
// ============================================================================

/** Ícones Material Symbols (curados). */
function mdashDefaultMaterialIcons() {
    return [
        { value: 'dashboard', label: 'Dashboard' }, { value: 'analytics', label: 'Analytics' },
        { value: 'monitoring', label: 'Monitoring' }, { value: 'trending_up', label: 'Tendência subir' },
        { value: 'trending_down', label: 'Tendência descer' }, { value: 'bar_chart', label: 'Gráfico barras' },
        { value: 'pie_chart', label: 'Gráfico circular' }, { value: 'show_chart', label: 'Gráfico linhas' },
        { value: 'timeline', label: 'Timeline' }, { value: 'leaderboard', label: 'Leaderboard' },
        { value: 'speed', label: 'Velocímetro' }, { value: 'percent', label: 'Percentagem' },
        { value: 'check_circle', label: 'Verificado' }, { value: 'task_alt', label: 'Tarefa OK' },
        { value: 'cancel', label: 'Cancelar' }, { value: 'warning', label: 'Aviso' },
        { value: 'error', label: 'Erro' }, { value: 'info', label: 'Informação' },
        { value: 'star', label: 'Estrela' }, { value: 'favorite', label: 'Coração' },
        { value: 'bolt', label: 'Raio' }, { value: 'verified', label: 'Verificado' },
        { value: 'rocket_launch', label: 'Foguetão' }, { value: 'schedule', label: 'Relógio' },
        { value: 'calendar_month', label: 'Calendário' }, { value: 'person', label: 'Pessoa' },
        { value: 'group', label: 'Grupo' }, { value: 'shopping_cart', label: 'Carrinho' },
        { value: 'attach_money', label: 'Dinheiro' }, { value: 'euro', label: 'Euro' },
        { value: 'payments', label: 'Pagamentos' }, { value: 'account_balance', label: 'Banco' },
        { value: 'savings', label: 'Poupança' }, { value: 'receipt_long', label: 'Recibo' },
        { value: 'inventory_2', label: 'Inventário' }, { value: 'local_shipping', label: 'Envio' },
        { value: 'assignment', label: 'Tarefa' }, { value: 'description', label: 'Documento' },
        { value: 'folder', label: 'Pasta' }, { value: 'home', label: 'Início' },
        { value: 'settings', label: 'Definições' }, { value: 'notifications', label: 'Notificação' },
        { value: 'mail', label: 'Correio' }, { value: 'phone', label: 'Telefone' },
        { value: 'location_on', label: 'Localização' }, { value: 'flag', label: 'Bandeira' },
        { value: 'thumb_up', label: 'Gosto' }, { value: 'visibility', label: 'Visível' },
        { value: 'search', label: 'Procurar' }
    ];
}

/** Glyphicons (Bootstrap 3) — normalmente já carregados na app PHC. */
function mdashDefaultGlyphicons() {
    var names = ['home','user','cog','stats','signal','ok','remove','warning-sign','info-sign','star','heart',
        'flash','fire','flag','envelope','earphone','phone','calendar','time','shopping-cart','usd','eur',
        'credit-card','folder-open','file','list-alt','tasks','th-large','tag','bell','map-marker','eye-open',
        'search','thumbs-up','plus','minus','refresh','download-alt','upload','print','filter','random','dashboard'];
    return names.map(function (n) { return { value: n, label: n.replace(/-/g, ' ') }; });
}

/** Font Awesome (compatível com 'fa fa-*', v4/v5-shim). */
function mdashDefaultFontAwesome() {
    var names = ['home','user','cog','tachometer','line-chart','bar-chart','pie-chart','area-chart','check-circle',
        'times-circle','exclamation-triangle','info-circle','star','heart','bolt','flag','envelope','phone',
        'calendar','clock-o','shopping-cart','money','eur','credit-card','folder-open','file','list','tasks',
        'th','tag','bell','map-marker','eye','search','thumbs-up','plus','minus','refresh','download','upload',
        'print','filter','rocket','users','trophy','database','cloud','cube'];
    return names.map(function (n) { return { value: n, label: n.replace(/-/g, ' ') }; });
}

function mdashNormalizeIconLib(def) {
    var lib = {
        id: def.id,
        label: def.label || def.id,
        kind: def.kind || 'material',
        base: def.base || '',
        prefix: def.prefix || '',
        materialClass: def.materialClass || 'material-symbols-rounded',
        fontUrl: def.fontUrl || '',
        fontId: def.fontId || ('mdash-iconfont-' + def.id),
        icons: Array.isArray(def.icons) ? def.icons.slice() : []
    };
    lib.render = (typeof def.render === 'function') ? def.render : function (v, cls) {
        if (lib.kind === 'material') return '<span class="' + (cls || lib.materialClass) + '">' + v + '</span>';
        var c = $.trim((lib.base ? lib.base + ' ' : '') + lib.prefix + v);
        return '<i class="' + c + '"></i>';
    };
    lib.store = (typeof def.store === 'function') ? def.store : function (v) {
        if (lib.kind === 'material') return v;
        return $.trim((lib.base ? lib.base + ' ' : '') + lib.prefix + v);
    };
    return lib;
}

/** Regista (ou funde) uma biblioteca de ícones. Público: para importar libs. */
function registerMdashIconLibrary(def) {
    if (!def || !def.id) return null;
    if (!window.__mdashIconLibs) window.__mdashIconLibs = {};
    var reg = window.__mdashIconLibs;
    if (reg[def.id]) {
        if (Array.isArray(def.icons) && def.icons.length) reg[def.id].icons = reg[def.id].icons.concat(def.icons);
        if (def.fontUrl) reg[def.id].fontUrl = def.fontUrl;
        return reg[def.id];
    }
    reg[def.id] = mdashNormalizeIconLib(def);
    return reg[def.id];
}
window.registerMdashIconLibrary = registerMdashIconLibrary;

/** Devolve o registo de bibliotecas (inicializa os defaults na 1ª chamada). */
function getMdashIconLibraryRegistry() {
    if (!window.__mdashIconLibs || !window.__mdashIconLibs.material) {
        registerMdashIconLibrary({
            id: 'material', label: 'Material Symbols', kind: 'material',
            materialClass: 'material-symbols-rounded',
            fontUrl: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
            icons: mdashDefaultMaterialIcons()
        });
        registerMdashIconLibrary({
            id: 'glyphicon', label: 'Glyphicons', kind: 'prefix', base: 'glyphicon', prefix: 'glyphicon-',
            icons: mdashDefaultGlyphicons()
        });
        registerMdashIconLibrary({
            id: 'fa', label: 'Font Awesome', kind: 'prefix', base: 'fa', prefix: 'fa-',
            fontUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
            icons: mdashDefaultFontAwesome()
        });
    }
    return window.__mdashIconLibs;
}
window.getMdashIconLibraryRegistry = getMdashIconLibraryRegistry;

/** Garante que as fontes das bibliotecas com fontUrl estão carregadas. */
function mdashEnsureIconLibFonts() {
    var reg = getMdashIconLibraryRegistry();
    Object.keys(reg).forEach(function (id) {
        var lib = reg[id];
        if (!lib.fontUrl || document.getElementById(lib.fontId)) return;
        try {
            var link = document.createElement('link');
            link.id = lib.fontId;
            link.rel = 'stylesheet';
            link.href = lib.fontUrl;
            document.head.appendChild(link);
        } catch (e) { /* offline / intranet — ignora */ }
    });
}

/** Lista plana (retrocompat) — tokens prontos a guardar, com metadados de biblioteca. */
function getMdashLayoutIconOptions() {
    var reg = getMdashIconLibraryRegistry();
    var out = [];
    Object.keys(reg).forEach(function (id) {
        var lib = reg[id];
        lib.icons.forEach(function (ic) {
            out.push({ value: lib.store(ic.value), name: ic.value, label: ic.label || ic.value, library: id });
        });
    });
    return out;
}
window.getMdashLayoutIconOptions = getMdashLayoutIconOptions;

/** True se o valor guardado é um token de classes CSS (não ligatura material). */
function mdashIsIconClassToken(value) {
    var v = $.trim(String(value || ''));
    if (!v) return false;
    if (/(^|\s)glyphicon(\s|-)/.test(v)) return true;
    if (/(^|\s)fa[srlbd]?(\s|-)/.test(v)) return true;
    if (/(^|\s)fi(\s|-)/.test(v)) return true;
    if (/(^|\s)bi(\s|-)/.test(v)) return true;
    // token multi-classe genérico (ex.: "fi fi-rr-home")
    if (/\s/.test(v) && !/material-symbols|material-icons/.test(v)) return true;
    return false;
}
window.mdashIsIconClassToken = mdashIsIconClassToken;

/** Deteta a biblioteca a que um valor/token pertence. */
function mdashIconLibForValue(value) {
    var v = $.trim(String(value || ''));
    if (/(^|\s)glyphicon(\s|-)/.test(v)) return 'glyphicon';
    if (/(^|\s)fa[srlbd]?(\s|-)/.test(v)) return 'fa';
    if (/(^|\s)fi(\s|-)/.test(v)) return 'fi';
    if (/(^|\s)bi(\s|-)/.test(v)) return 'bi';
    return 'material';
}
window.mdashIconLibForValue = mdashIconLibForValue;

/** HTML de pré-visualização de um ícone (a partir do token guardado). */
function mdashRenderIconPreviewHtml(token, materialClass) {
    var v = $.trim(String(token || ''));
    if (!v) return '<span class="' + (materialClass || 'material-symbols-rounded') + '">help</span>';
    if (mdashIsIconClassToken(v)) {
        return '<i class="' + lbSrcEscapeIconAttr(v) + '"></i>';
    }
    return '<span class="' + (materialClass || 'material-symbols-rounded') + '">' + v + '</span>';
}
window.mdashRenderIconPreviewHtml = mdashRenderIconPreviewHtml;

/** Garante que a fonte Material Symbols está carregada (para o seletor fora do card). */
function mdashEnsureMaterialSymbolsFont() {
    if (document.getElementById('mdash-material-symbols-font')) return;
    try {
        var link = document.createElement('link');
        link.id = 'mdash-material-symbols-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
        document.head.appendChild(link);
    } catch (e) { /* offline / intranet — ignora */ }
}

/** Normaliza a classe de fonte de ícone usada por um layout. */
function mdashNormalizeIconClass(iconClass) {
    var c = $.trim(String(iconClass || ''));
    if (!c) return 'material-symbols-rounded';
    var m = c.match(/material-symbols-(rounded|outlined|sharp)/);
    if (m) return m[0];
    if (/material-symbols/.test(c)) return 'material-symbols-outlined';
    if (/material-icons/.test(c)) return 'material-icons';
    return c;
}
window.mdashNormalizeIconClass = mdashNormalizeIconClass;

function lbSrcEscapeIconAttr(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * @param {string} value      nome/ligatura do ícone selecionado
 * @param {string} inputId    id do input escondido
 * @param {string} iconClass  classe de fonte do layout (ex: material-symbols-rounded).
 *                            Por defeito material-symbols-rounded; varia conforme o layout.
 */
function buildMdashLayoutIconPickerHtml(value, inputId, iconClass) {
    inputId = inputId || 'mdash-layout-icon-value';
    value = value != null ? String(value) : '';
    iconClass = mdashNormalizeIconClass(iconClass);
    // Carrega (uma vez) as bibliotecas globais da BD para o registo do picker
    if (!window.__mdashIconLibsLoaded && typeof loadIconLibrariesFromServer === 'function') {
        window.__mdashIconLibsLoaded = true;
        try { loadIconLibrariesFromServer(); } catch (e) { /* mantém defaults */ }
    }
    mdashEnsureIconLibFonts();
    var reg = getMdashIconLibraryRegistry();
    var libIds = Object.keys(reg);

    var html = '<div class="mdash-layout-icon-picker" data-icon-input-id="' + inputId + '" data-icon-class="' + iconClass + '">';
    html += '<div class="mdash-layout-icon-search"><span class="' + iconClass + '">search</span>';
    html += '<input type="text" class="mdash-layout-icon-filter" placeholder="Procurar \u00edcone..." /></div>';

    // Categorias (tabs) — 1ª = Todos, depois cada biblioteca registada
    html += '<div class="mdash-layout-icon-cats">';
    html += '<button type="button" class="mdash-layout-icon-cat is-active" data-cat="all">Todos</button>';
    for (var c = 0; c < libIds.length; c++) {
        var lib0 = reg[libIds[c]];
        html += '<button type="button" class="mdash-layout-icon-cat" data-cat="' + lib0.id + '">' + lbSrcEscapeIconAttr(lib0.label) + '</button>';
    }
    html += '</div>';

    html += '<div class="mdash-layout-icon-grid">';
    for (var k = 0; k < libIds.length; k++) {
        var lib = reg[libIds[k]];
        for (var i = 0; i < lib.icons.length; i++) {
            var ic = lib.icons[i];
            var token = lib.store(ic.value);
            var on = value === token ? ' is-active' : '';
            var inner = lib.render(ic.value, iconClass);
            html += '<button type="button" class="mdash-layout-icon-btn' + on + '"'
                + ' data-icon="' + lbSrcEscapeIconAttr(token) + '"'
                + ' data-lib="' + lib.id + '"'
                + ' data-name="' + lbSrcEscapeIconAttr(ic.value) + '"'
                + ' title="' + lbSrcEscapeIconAttr((ic.label || ic.value) + ' \u00b7 ' + lib.label) + '">' + inner + '</button>';
        }
    }
    html += '</div>';

    html += '<div class="mdash-layout-icon-current"><span class="mdash-layout-icon-current-lbl">Selecionado:</span> '
        + '<span class="mdash-layout-icon-preview">' + mdashRenderIconPreviewHtml(value, iconClass) + '</span> '
        + '<code class="mdash-layout-icon-name">' + (value ? lbSrcEscapeIconAttr(value) : '\u2014') + '</code></div>';
    html += '<input type="hidden" class="mdash-layout-icon-value" id="' + inputId + '" value="' + lbSrcEscapeIconAttr(value) + '" />';
    html += '</div>';
    return html;
}
window.buildMdashLayoutIconPickerHtml = buildMdashLayoutIconPickerHtml;

function mdashFilterIconPicker($picker) {
    var q = ($picker.find('.mdash-layout-icon-filter').val() || '').toLowerCase();
    var cat = $picker.find('.mdash-layout-icon-cat.is-active').data('cat') || 'all';
    $picker.find('.mdash-layout-icon-btn').each(function () {
        var $b = $(this);
        var name = ('' + ($b.attr('data-name') || '')).toLowerCase();
        var title = ($b.attr('title') || '').toLowerCase();
        var lib = '' + ($b.data('lib') || '');
        var okText = !q || name.indexOf(q) >= 0 || title.indexOf(q) >= 0;
        var okCat = cat === 'all' || lib === cat;
        $b.toggle(okText && okCat);
    });
}

function bindMdashLayoutIconPicker($root, onChange) {
    if (!$root || !$root.length) return;
    $root.off('click.mdashLayoutIcon', '.mdash-layout-icon-btn').on('click.mdashLayoutIcon', '.mdash-layout-icon-btn', function () {
        // .attr() em vez de .data() — jQuery pode corromper valores com hífens (ex. fi-rr-chart-line-up)
        var val = $.trim($(this).attr('data-icon') || '');
        var $picker = $(this).closest('.mdash-layout-icon-picker');
        var iconClass = $picker.attr('data-icon-class') || $picker.data('icon-class') || 'material-symbols-rounded';
        mdashEnsureIconLibFonts();
        $picker.find('.mdash-layout-icon-btn').removeClass('is-active');
        $(this).addClass('is-active');
        $picker.find('.mdash-layout-icon-value').val(val).trigger('change');
        $picker.find('.mdash-layout-icon-preview').html(mdashRenderIconPreviewHtml(val, iconClass));
        $picker.find('.mdash-layout-icon-name').text(val);
        if (typeof onChange === 'function') onChange(val);
    });
    $root.off('click.mdashLayoutIconCat', '.mdash-layout-icon-cat').on('click.mdashLayoutIconCat', '.mdash-layout-icon-cat', function () {
        var $picker = $(this).closest('.mdash-layout-icon-picker');
        $picker.find('.mdash-layout-icon-cat').removeClass('is-active');
        $(this).addClass('is-active');
        mdashFilterIconPicker($picker);
    });
    $root.off('input.mdashLayoutIcon', '.mdash-layout-icon-filter').on('input.mdashLayoutIcon', '.mdash-layout-icon-filter', function () {
        mdashFilterIconPicker($(this).closest('.mdash-layout-icon-picker'));
    });
}
window.bindMdashLayoutIconPicker = bindMdashLayoutIconPicker;

// ============================================================================
// BIBLIOTECAS/RECURSOS PERSISTENTES (tabela abstracta MdashLibrary, tipo='icon')
// ----------------------------------------------------------------------------
// Bibliotecas globais importadas/criadas pelo utilizador, guardadas na BD e
// aplicadas ao registo do picker (registerMdashIconLibrary) no arranque.
// A tabela é genérica (campo 'tipo'); aqui tratamos o tipo 'icon'. As
// especificidades vão em configjson ({kind, base, prefix}) e a lista em itemsjson.
// ============================================================================

var GMDashIconLibraries = [];
var MDASH_LIBRARY_TYPE_ICON = 'icon';

function MdashIconLibrary(data) {
    data = data || {};
    var maxOrdem = 0;
    if (Array.isArray(GMDashIconLibraries) && GMDashIconLibraries.length > 0) {
        maxOrdem = GMDashIconLibraries.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }
    var cfg = forceJSONParse(data.configjson, {}) || {};
    this.mdashlibrarystamp = data.mdashlibrarystamp || data.mdashiconlibrarystamp || generateUUID();
    this.tipo = data.tipo || MDASH_LIBRARY_TYPE_ICON;
    this.codigo = data.codigo || ('lib' + gerarIdNumerico());
    this.label = data.label || 'Nova biblioteca';
    // Config específica do tipo 'icon' (aceita formato antigo achatado como fallback)
    this.kind = data.kind || cfg.kind || 'prefix';
    this.base = data.base || cfg.base || '';
    this.prefix = data.prefix || cfg.prefix || '';
    this.cdn = data.cdn || data.fontcdn || '';
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = data.inactivo || false;

    this.itemsList = forceJSONParse(data.itemsjson || data.iconsjson, []);

    this.localsource = "GMDashIconLibraries";
    this.idfield = "mdashlibrarystamp";
    this.table = "MdashLibrary";
}

MdashIconLibrary.prototype.stringifyJSONFields = function () {
    this.tipo = this.tipo || MDASH_LIBRARY_TYPE_ICON;
    this.configjson = JSON.stringify({ kind: this.kind, base: this.base, prefix: this.prefix });
    this.itemsjson = JSON.stringify(this.itemsList || []);
    return this;
};
window.MdashIconLibrary = MdashIconLibrary;

/** Aplica as bibliotecas da BD ao registo do picker. */
function applyDbIconLibrariesToRegistry() {
    getMdashIconLibraryRegistry(); // garante defaults
    (GMDashIconLibraries || []).forEach(function (lib) {
        if (!lib || lib.inactivo || !lib.codigo) return;
        if (lib.tipo && lib.tipo !== MDASH_LIBRARY_TYPE_ICON) return;
        registerMdashIconLibrary({
            id: lib.codigo,
            label: lib.label || lib.codigo,
            kind: lib.kind || 'prefix',
            base: lib.base || '',
            prefix: lib.prefix || '',
            fontUrl: lib.cdn || '',
            icons: Array.isArray(lib.itemsList) ? lib.itemsList : forceJSONParse(lib.itemsjson, [])
        });
    });
    mdashEnsureIconLibFonts();
}
window.applyDbIconLibrariesToRegistry = applyDbIconLibrariesToRegistry;

/**
 * Hidrata GMDashIconLibraries a partir de response.data do GET CONFIGURAÇÃO
 * (editor: getconfiguracaomdash | viewer: getconfiguracaoclientmdash).
 * @param {Object} dashboardData  response.data com campo .libraries
 */
function hydrateMdashLibrariesFromDashboardData(dashboardData) {
    window.__mdashIconLibsLoaded = true;
    var rows = dashboardData && dashboardData.libraries;
    if (Array.isArray(rows)) {
        GMDashIconLibraries = rows
            .map(function (l) { return new MdashIconLibrary(l); })
            .filter(function (l) { return l.tipo === MDASH_LIBRARY_TYPE_ICON; });
        window.GMDashIconLibraries = GMDashIconLibraries;
    }
    applyDbIconLibrariesToRegistry();
    return GMDashIconLibraries;
}
window.hydrateMdashLibrariesFromDashboardData = hydrateMdashLibrariesFromDashboardData;
window.GMDashIconLibraries = GMDashIconLibraries;

/**
 * Garante que o registo do picker está aplicado.
 * As bibliotecas vêm do load principal do dashboard (hydrateMdashLibrariesFromDashboardData).
 * Se ainda não hidratado, mantém só os defaults embutidos.
 */
function loadIconLibrariesFromServer() {
    if (window.__mdashIconLibsLoaded) {
        applyDbIconLibrariesToRegistry();
        return GMDashIconLibraries;
    }
    window.__mdashIconLibsLoaded = true;
    applyDbIconLibrariesToRegistry();
    return GMDashIconLibraries;
}
window.loadIconLibrariesFromServer = loadIconLibrariesFromServer;

/** Grava uma biblioteca na BD (usa o sync genérico). */
function saveIconLibraryToServer(lib) {
    if (!lib) return;
    if (typeof lib.stringifyJSONFields === 'function') lib.stringifyJSONFields();
    realTimeComponentSync(lib, lib.table, lib.idfield);
}
window.saveIconLibraryToServer = saveIconLibraryToServer;

/** Marca uma biblioteca para eliminação e sincroniza. */
function deleteIconLibraryFromServer(lib) {
    if (!lib) return;
    var idx = -1;
    for (var i = 0; i < GMDashIconLibraries.length; i++) {
        if (GMDashIconLibraries[i].mdashlibrarystamp === lib.mdashlibrarystamp) { idx = i; break; }
    }
    if (idx > -1) GMDashIconLibraries.splice(idx, 1);
    if (typeof GMdashDeleteRecords !== 'undefined' && GMdashDeleteRecords.push) {
        GMdashDeleteRecords.push({ table: 'MdashLibrary', stamp: lib.mdashlibrarystamp, tableKey: 'mdashlibrarystamp' });
    }
    realTimeComponentSync(null, null, null);
}
window.deleteIconLibraryFromServer = deleteIconLibraryFromServer;

/**
 * Deteta ícones a partir de texto CSS de uma fonte de ícones.
 * Procura seletores do tipo .prefixo-nome::before { content: ... }.
 * @param {string} cssText  conteúdo CSS
 * @param {string} prefix   prefixo a filtrar (ex: 'fa-', 'bi-'); vazio = todos
 * @return {Array} [{value, label}]  value já sem o prefixo (pronto para store())
 */
function mdashDetectIconsFromCssText(cssText, prefix) {
    var out = [];
    var seen = {};
    var css = String(cssText || '');
    prefix = String(prefix || '');
    var re = /\.([a-zA-Z0-9_-]+)\s*::?before\s*\{[^}]*content\s*:/g;
    var m;
    while ((m = re.exec(css)) !== null) {
        var cls = m[1];
        if (prefix) {
            if (cls.indexOf(prefix) !== 0) continue;
            cls = cls.substring(prefix.length);
        }
        if (!cls || seen[cls]) continue;
        seen[cls] = true;
        out.push({ value: cls, label: cls.replace(/[-_]+/g, ' ') });
    }
    return out;
}
window.mdashDetectIconsFromCssText = mdashDetectIconsFromCssText;

/**
 * Tenta detetar ícones a partir das folhas de estilo já carregadas na página.
 * Só funciona para CSS same-origin ou com CORS permissivo; caso contrário
 * lança SecurityError ao ler cssRules e essa folha é ignorada.
 */
function mdashDetectIconsFromStylesheets(prefix, hrefContains) {
    var text = '';
    try {
        for (var s = 0; s < document.styleSheets.length; s++) {
            var sheet = document.styleSheets[s];
            if (hrefContains && (!sheet.href || sheet.href.indexOf(hrefContains) < 0)) continue;
            var rules = null;
            try { rules = sheet.cssRules || sheet.rules; } catch (e) { continue; }
            if (!rules) continue;
            for (var r = 0; r < rules.length; r++) {
                if (rules[r] && rules[r].cssText) text += rules[r].cssText + '\n';
            }
        }
    } catch (e) { /* ignora */ }
    return mdashDetectIconsFromCssText(text, prefix);
}
window.mdashDetectIconsFromStylesheets = mdashDetectIconsFromStylesheets;

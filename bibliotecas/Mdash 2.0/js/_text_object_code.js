// ══════════════════════════════════════════════════════════════════════════════
// ██  OBJECTO TEXTO — Fonte + Transformação + Editor Inline (padrão gráfico)
// ══════════════════════════════════════════════════════════════════════════════

var _TEXT_SAMPLE_CONFIG = {
    dataField: '', staticText: 'Texto personalizado aqui...',
    dataFormat: { type: 'text', locale: 'pt-PT', currency: 'EUR', currencyPosition: 'right', minimumFractionDigits: 0, maximumFractionDigits: 2, prefix: '', suffix: '' },
    content: { htmlEnabled: false, multipleValues: false, separator: ', ' },
    textFormat: { fontSize: 16, fontWeight: 'bold', fontStyle: 'normal', fontFamily: 'Nunito, sans-serif', textAlign: 'center', lineHeight: 1.5 },
    colors: { textColor: '#333333', backgroundColor: 'transparent', borderColor: 'transparent' },
    spacing: { paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, marginTop: 0, marginBottom: 0 },
    border: { width: 0, style: 'solid', radius: 0 },
    effects: { textShadow: false, shadowColor: '#666666', shadowBlur: 2, shadowOffsetX: 1, shadowOffsetY: 1 },
    dimensions: { width: '100%', height: 'auto', maxWidth: 'none' }
};

function renderObjectTexto(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = dados.config ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_TEXT_SAMPLE_CONFIG));
    var isSample = !!dados.isSample;

    var rows = dados.data || [];
    var tCfg = dados.transformConfig || cfg.transformConfig || null;
    if (rows.length === 0 && tCfg && tCfg.sourceTable && typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(tCfg);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                isSample = false;
            }
        } catch (e) {
            console.warn('[MDash] renderObjectTexto fallback transform error:', e.message);
        }
    }
    if (rows.length === 0) {
        rows = getMdashSampleData('text');
        isSample = true;
    }

    var content = '';
    if (cfg.dataField && rows.length > 0) {
        if (cfg.content && cfg.content.multipleValues) {
            var values = rows.map(function (item) {
                return formatDataValue(item[cfg.dataField], cfg.dataFormat);
            });
            content = values.join((cfg.content && cfg.content.separator) || ', ');
        } else {
            content = formatDataValue(rows[0][cfg.dataField], cfg.dataFormat);
        }
    } else if (cfg.staticText) {
        content = cfg.staticText;
    } else {
        content = 'Texto personalizado aqui...';
    }

    var styles = _txtBuildStyles(cfg);
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge" style="font-size:9px;color:#64748b;background:rgba(243,246,251,.95);padding:2px 8px;text-align:center;letter-spacing:.2px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:2px;"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';
    var textId = 'mtext_' + stamp;

    var html = badgeHtml + '<div id="' + textId + '" class="m-dash-text-element" style="' + styles + '">';
    if (cfg.content && cfg.content.htmlEnabled) {
        html += content;
    } else {
        html += $('<div>').text(content).html();
    }
    html += '</div>';
    $(dados.containerSelector).html(html);
}

function _txtBuildStyles(cfg) {
    var s = '';
    var tf = cfg.textFormat || {};
    s += 'font-size:' + (tf.fontSize || 16) + 'px;';
    s += 'font-weight:' + (tf.fontWeight || 'normal') + ';';
    s += 'font-style:' + (tf.fontStyle || 'normal') + ';';
    s += 'font-family:' + (tf.fontFamily || 'Arial') + ';';
    s += 'text-align:' + (tf.textAlign || 'left') + ';';
    s += 'line-height:' + (tf.lineHeight || 1.5) + ';';
    var cl = cfg.colors || {};
    s += 'color:' + (cl.textColor || '#333333') + ';';
    if (cl.backgroundColor && cl.backgroundColor !== 'transparent') s += 'background-color:' + cl.backgroundColor + ';';
    var sp = cfg.spacing || {};
    s += 'padding:' + (sp.paddingTop || 0) + 'px ' + (sp.paddingRight || 0) + 'px ' + (sp.paddingBottom || 0) + 'px ' + (sp.paddingLeft || 0) + 'px;';
    s += 'margin:' + (sp.marginTop || 0) + 'px 0 ' + (sp.marginBottom || 0) + 'px 0;';
    var bd = cfg.border || {};
    if (bd.width > 0) s += 'border:' + bd.width + 'px ' + (bd.style || 'solid') + ' ' + (cl.borderColor || 'transparent') + ';';
    s += 'border-radius:' + (bd.radius || 0) + 'px;';
    var ef = cfg.effects || {};
    if (ef.textShadow) s += 'text-shadow:' + (ef.shadowOffsetX || 1) + 'px ' + (ef.shadowOffsetY || 1) + 'px ' + (ef.shadowBlur || 2) + 'px ' + (ef.shadowColor || '#666666') + ';';
    var dm = cfg.dimensions || {};
    s += 'width:' + (dm.width || '100%') + ';';
    if (dm.height && dm.height !== 'auto') s += 'height:' + dm.height + ';';
    if (dm.maxWidth && dm.maxWidth !== 'none') s += 'max-width:' + dm.maxWidth + ';';
    return s;
}

function renderTextPropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_TEXT_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);
    var isSample = !obj.fontestamp;

    // Dados (fonte + transform)
    var _hasTrans = !!(cfg.transformConfig && cfg.transformConfig.sourceTable);
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
                + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + (!fontes.length ? '<div class="mcbi-info">Nenhuma fonte disponível neste dashboard.</div>' : '')
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(cfg.transformConfig.sourceTable) + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans ? '<i class="glyphicon glyphicon-pencil"></i> Editar' : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    // Conteúdo
    function _txtFieldOpts(cur) {
        return '<option value="">-- campo --</option>'
            + fields.map(function (f) { return '<option value="' + _mciEsc(f) + '"' + (cur === f ? ' selected' : '') + '>' + _mciEsc(f) + '</option>'; }).join('');
    }
    var ct = cfg.content || {};
    var sConteudo = '<div class="mcbi-field"><label>Campo de dados</label>'
        + '<select class="mtxt-datafield form-control input-sm">' + _txtFieldOpts(cfg.dataField) + '</select></div>'
        + '<div class="mcbi-field"><label>Texto estático (alternativo)</label>'
        + '<input type="text" class="mtxt-static form-control input-sm" value="' + _mciEsc(cfg.staticText || '') + '" placeholder="Texto fixo se não selecionar campo"></div>'
        + '<div class="mcbi-checks">'
        + _mciChk('mtxt-multi', 'Múltiplos valores', ct.multipleValues)
        + _mciChk('mtxt-html', 'Permitir HTML', ct.htmlEnabled)
        + '</div>'
        + '<div class="mcbi-field"><label>Separador</label>'
        + '<input type="text" class="mtxt-sep form-control input-sm" value="' + _mciEsc(ct.separator || ', ') + '" style="width:80px;"></div>';

    // Formatação de dados
    var df = cfg.dataFormat || {};
    var sFormato = '<div class="mcbi-field"><label>Tipo de formatação</label>'
        + '<select class="mtxt-fmttype form-control input-sm">'
        + [['text', 'Texto'], ['number', 'Número'], ['currency', 'Moeda'], ['percentage', 'Percentagem'], ['date', 'Data']].map(function (o) {
            return '<option value="' + o[0] + '"' + (df.type === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Localização</label>'
        + '<select class="mtxt-locale form-control input-sm">'
        + ['pt-PT', 'pt-BR', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'].map(function (l) {
            return '<option value="' + l + '"' + (df.locale === l ? ' selected' : '') + '>' + l + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Moeda</label>'
        + '<input type="text" class="mtxt-currency form-control input-sm" value="' + _mciEsc(df.currency || 'EUR') + '" style="width:60px;"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Min. decimais</label>'
        + '<input type="number" class="mtxt-mindec form-control input-sm" value="' + (df.minimumFractionDigits || 0) + '" min="0" max="20"></div>'
        + '<div class="mcbi-field"><label>Max. decimais</label>'
        + '<input type="number" class="mtxt-maxdec form-control input-sm" value="' + (df.maximumFractionDigits || 2) + '" min="0" max="20"></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Prefixo</label>'
        + '<input type="text" class="mtxt-prefix form-control input-sm" value="' + _mciEsc(df.prefix || '') + '"></div>'
        + '<div class="mcbi-field"><label>Sufixo</label>'
        + '<input type="text" class="mtxt-suffix form-control input-sm" value="' + _mciEsc(df.suffix || '') + '"></div>'
        + '</div>';

    // Tipografia
    var tx = cfg.textFormat || {};
    var sTipo = '<div class="mcbi-field"><label>Tamanho: <strong class="mtxt-fs-lbl">' + (tx.fontSize || 16) + '</strong> px</label>'
        + '<input type="range" class="mtxt-fontsize mcbi-height" min="8" max="72" step="1" value="' + (tx.fontSize || 16) + '"></div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Família</label>'
        + '<select class="mtxt-family form-control input-sm">'
        + ['Arial', 'Nunito, sans-serif', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Trebuchet MS', 'Arial Black', 'Inter, sans-serif', 'Segoe UI, sans-serif'].map(function (f) {
            return '<option value="' + f + '"' + (tx.fontFamily === f ? ' selected' : '') + '>' + f.split(',')[0] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Peso</label>'
        + '<select class="mtxt-weight form-control input-sm">'
        + [['normal', 'Normal'], ['bold', 'Bold'], ['lighter', 'Lighter'], ['100', '100'], ['200', '200'], ['300', '300'], ['400', '400'], ['500', '500'], ['600', '600'], ['700', '700'], ['800', '800'], ['900', '900']].map(function (o) {
            return '<option value="' + o[0] + '"' + (tx.fontWeight === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '</div>'
        + '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Estilo</label>'
        + '<select class="mtxt-style form-control input-sm">'
        + [['normal', 'Normal'], ['italic', 'Italic'], ['oblique', 'Oblique']].map(function (o) {
            return '<option value="' + o[0] + '"' + (tx.fontStyle === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Altura linha: <strong class="mtxt-lh-lbl">' + (tx.lineHeight || 1.5) + '</strong></label>'
        + '<input type="range" class="mtxt-lineheight mcbi-height" min="0.5" max="3" step="0.1" value="' + (tx.lineHeight || 1.5) + '"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Alinhamento</label>'
        + '<div class="mcbi-ct-grid3" style="grid-template-columns:repeat(4,1fr);">'
        + [['left', 'glyphicon-align-left'], ['center', 'glyphicon-align-center'], ['right', 'glyphicon-align-right'], ['justify', 'glyphicon-align-justify']].map(function (a) {
            return '<button type="button" class="mcbi-ct-btn mtxt-align' + (tx.textAlign === a[0] ? ' is-on' : '') + '" data-align="' + a[0] + '"><i class="glyphicon ' + a[1] + '"></i><span>' + a[0] + '</span></button>';
        }).join('') + '</div></div>';

    // Cores
    var cl = cfg.colors || {};
    var sCores = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Cor do texto</label>'
        + '<input type="color" class="mtxt-textcolor" value="' + (cl.textColor || '#333333') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Cor de fundo</label>'
        + '<input type="color" class="mtxt-bgcolor" value="' + (cl.backgroundColor && cl.backgroundColor !== 'transparent' ? cl.backgroundColor : '#ffffff') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
        + ' ' + _mciChk('mtxt-bgtransp', 'Transparente', cl.backgroundColor === 'transparent') + '</div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Cor da borda</label>'
        + '<input type="color" class="mtxt-bordercolor" value="' + (cl.borderColor && cl.borderColor !== 'transparent' ? cl.borderColor : '#cccccc') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;">'
        + ' ' + _mciChk('mtxt-bordertransp', 'Transparente', cl.borderColor === 'transparent') + '</div>';

    // Espaçamento
    var sp = cfg.spacing || {};
    var sEspac = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Padding top</label><input type="number" class="mtxt-pt form-control input-sm" value="' + (sp.paddingTop || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Padding bottom</label><input type="number" class="mtxt-pb form-control input-sm" value="' + (sp.paddingBottom || 0) + '" min="0" max="100"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Padding left</label><input type="number" class="mtxt-pl form-control input-sm" value="' + (sp.paddingLeft || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Padding right</label><input type="number" class="mtxt-pr form-control input-sm" value="' + (sp.paddingRight || 0) + '" min="0" max="100"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Margem top</label><input type="number" class="mtxt-mt form-control input-sm" value="' + (sp.marginTop || 0) + '" min="0" max="100"></div>'
        + '<div class="mcbi-field"><label>Margem bottom</label><input type="number" class="mtxt-mb form-control input-sm" value="' + (sp.marginBottom || 0) + '" min="0" max="100"></div>'
        + '</div>';

    // Bordo
    var bd = cfg.border || {};
    var sBordo = '<div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Largura (px)</label><input type="number" class="mtxt-bw form-control input-sm" value="' + (bd.width || 0) + '" min="0" max="20"></div>'
        + '<div class="mcbi-field"><label>Raio (px)</label><input type="number" class="mtxt-brad form-control input-sm" value="' + (bd.radius || 0) + '" min="0" max="50"></div>'
        + '</div>'
        + '<div class="mcbi-field"><label>Estilo</label>'
        + '<select class="mtxt-bstyle form-control input-sm">'
        + ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'].map(function (st) {
            return '<option value="' + st + '"' + (bd.style === st ? ' selected' : '') + '>' + st + '</option>';
        }).join('') + '</select></div>';

    // Efeitos
    var ef = cfg.effects || {};
    var sEfeitos = _mciChk('mtxt-shadow', 'Sombra do texto', ef.textShadow)
        + '<div class="mcbi-row2" style="margin-top:8px;">'
        + '<div class="mcbi-field"><label>Cor sombra</label>'
        + '<input type="color" class="mtxt-shcolor" value="' + (ef.shadowColor || '#666666') + '" style="width:40px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,.12);cursor:pointer;"></div>'
        + '<div class="mcbi-field"><label>Desfoque</label><input type="number" class="mtxt-shblur form-control input-sm" value="' + (ef.shadowBlur || 2) + '" min="0" max="20"></div>'
        + '</div><div class="mcbi-row2">'
        + '<div class="mcbi-field"><label>Offset X</label><input type="number" class="mtxt-shx form-control input-sm" value="' + (ef.shadowOffsetX || 1) + '" min="-20" max="20"></div>'
        + '<div class="mcbi-field"><label>Offset Y</label><input type="number" class="mtxt-shy form-control input-sm" value="' + (ef.shadowOffsetY || 1) + '" min="-20" max="20"></div>'
        + '</div>';

    // Dimensões
    var dm = cfg.dimensions || {};
    var sDimensoes = '<div class="mcbi-field"><label>Largura</label>'
        + '<select class="mtxt-width form-control input-sm">'
        + ['auto', '100%', '75%', '50%', '25%'].map(function (w) {
            return '<option value="' + w + '"' + (dm.width === w ? ' selected' : '') + '>' + w + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Altura</label>'
        + '<select class="mtxt-height form-control input-sm">'
        + ['auto', '100px', '200px', '300px', '400px'].map(function (h) {
            return '<option value="' + h + '"' + (dm.height === h ? ' selected' : '') + '>' + h + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-field"><label>Largura máxima</label>'
        + '<select class="mtxt-maxw form-control input-sm">'
        + ['none', '100%', '500px', '800px', '1200px'].map(function (m) {
            return '<option value="' + m + '"' + (dm.maxWidth === m ? ' selected' : '') + '>' + m + '</option>';
        }).join('') + '</select></div>';

    // ── Assemble HTML ───────────────────────────────────────────────────────
    var h = '<div class="mcbi-root mtxt-root" data-stamp="' + stamp + '">'
        + (isSample ? '<div class="mcbi-sample-label"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra — configure a fonte</div>' : '')
        + _mciSection('txt-dados',     'Dados',        'glyphicon-hdd',              true,  sDados)
        + _mciSection('txt-conteudo',  'Conteúdo',     'glyphicon-text-size',        true,  sConteudo)
        + _mciSection('txt-formato',   'Formatação',   'glyphicon-list-alt',         false, sFormato)
        + _mciSection('txt-tipografia','Tipografia',    'glyphicon-font',             true,  sTipo)
        + _mciSection('txt-cores',     'Cores',         'glyphicon-tint',             false, sCores)
        + _mciSection('txt-espac',     'Espaçamento',   'glyphicon-resize-full',      false, sEspac)
        + _mciSection('txt-bordo',     'Bordo',         'glyphicon-unchecked',        false, sBordo)
        + _mciSection('txt-efeitos',   'Efeitos',       'glyphicon-flash',            false, sEfeitos)
        + _mciSection('txt-dimens',    'Dimensões',     'glyphicon-resize-horizontal', false, sDimensoes)
        + '</div>';

    var _openSecs = {};
    panel.find('[data-sec]').each(function () { _openSecs[$(this).data('sec')] = $(this).closest('.mcbi-section').hasClass('is-open'); });

    panel.html(h + _mciCSS());

    panel.find('[data-sec]').each(function () {
        var id = $(this).data('sec');
        if (_openSecs[id] !== undefined) {
            var $sec = $(this).closest('.mcbi-section');
            $sec.toggleClass('is-open', _openSecs[id]);
            $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', _openSecs[id]).toggleClass('glyphicon-chevron-down', !_openSecs[id]);
        }
    });

    // ── Events ─────────────────────────────────────────────────────────────
    var _txtTimer = null;
    panel.data('_mciTimer', null);
    function fire() {
        clearTimeout(_txtTimer);
        _txtTimer = setTimeout(function () {
            if (!panel.find('.mtxt-root').length) { _txtTimer = null; panel.removeData('_mciTimer'); return; }
            var newCfg = _txtReadConfig(panel, obj);
            obj.config = newCfg;
            obj.configjson = JSON.stringify(newCfg);
            if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
            _txtTimer = null;
            panel.removeData('_mciTimer');
        }, 300);
        panel.data('_mciTimer', _txtTimer);
    }

    // ── Transform Builder ────────────────────────────────────────────────────
    var _txtTransformInited = false;

    function _txtOpenTransformModal() {
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';
        var modalId = 'mcbi-transform-modal';
        $('#' + modalId).remove();
        _txtTransformInited = false;

        var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
            + '<div class="modal-dialog" style="width:860px;max-width:96vw;margin:32px auto;">'
            + '<div class="modal-content" style="border-radius:14px;overflow:hidden;border:none;box-shadow:0 24px 80px rgba(0,0,0,.24);">'
            + '<div style="display:flex;align-items:center;gap:10px;padding:14px 20px;background:#fff;border-bottom:1px solid rgba(0,0,0,.08);">'
            + '<i class="glyphicon glyphicon-filter" style="color:var(--md-primary,#5b8dee);font-size:15px;opacity:.9;"></i>'
            + '<span style="font-size:14px;font-weight:700;color:#1e293b;">Transformação de Dados</span>'
            + (_tFntName ? '<span style="font-size:11px;color:#64748b;border-left:1px solid rgba(0,0,0,.1);padding-left:10px;margin-left:4px;">' + _mciEsc(_tFntName) + '</span>' : '')
            + '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar" style="margin-left:auto;font-size:20px;line-height:1;padding:2px 6px;opacity:.5;">&times;</button>'
            + '</div>'
            + '<div style="background:#f8fafc;overflow-y:auto;max-height:80vh;">'
            + '<div id="mcbi-transform-modal-host" style="max-width:780px;margin:0 auto;padding:16px;"></div>'
            + '</div></div></div></div>';

        $('body').append(mHtml);
        var $modal = $('#' + modalId);
        $modal.modal('show');
        $modal.on('shown.bs.modal', function () { _txtInitTransform(); });
        $modal.on('hidden.bs.modal', function () { $(this).remove(); _txtTransformInited = false; });
    }

    function _txtInitTransform() {
        if (_txtTransformInited) return;
        var MTB = window.MdashTransformBuilder
            || (typeof MdashTransformBuilder !== 'undefined' ? MdashTransformBuilder : null);
        if (!MTB) {
            if (typeof alertify !== 'undefined') alertify.error('DATA SOURCE Operations.js não está carregado.', 6000);
            return;
        }
        _txtTransformInited = true;
        var _tFnt = _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === obj.fontestamp; });
        var _tName = (_tFnt && typeof mdashFonteTableName === 'function') ? mdashFonteTableName(_tFnt) : '';
        var _tFntName = (_tFnt && (_tFnt.descricao || _tFnt.codigo)) || '';

        if (_tFnt && typeof mdashExtractRowsFromCache === 'function' && typeof mdashLoadFonteIntoDb === 'function') {
            var _tRows = mdashExtractRowsFromCache(_tFnt.lastResultscached);
            if (_tRows.length > 0) mdashLoadFonteIntoDb(_tFnt, _tRows);
        }

        var _tSchema = _mciGetFonteSchema(_tFnt);
        var _tCfgRaw = obj.transformConfig || cfg.transformConfig || null;
        var _tConf = _tCfgRaw || (_tName ? MTB.autoConfig(_tName, 'Texto') : { mode: 'sql', sourceTable: '', sqlFree: '', columns: [], measures: [], filters: [], groupBy: [], orderBy: [], limit: null });
        if (!_tConf.columns.length && _tSchema.length) {
            _tConf.sourceTable = _tName;
            _tConf.columns = _tSchema.map(function (s) { return { field: s.field, alias: '', aggregate: 'none', visible: true }; });
        }

        _mciOpenTransformModalFor({
            title: 'Transformação de Dados',
            fonteName: _tFntName,
            modalId: 'mcbi-transform-modal',
            hostId: 'mcbi-transform-modal-host',
            config: _tConf,
            schema: _tSchema,
            onSave: function (newT) {
                obj.transformConfig = newT;
                obj.transformconfigjson = JSON.stringify(newT);
                cfg.transformConfig = newT;
                obj.config = obj.config || {};
                obj.config.transformConfig = newT;
                if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
                var $ts = panel.find('.mcbi-transform-status');
                $ts.addClass('is-active');
                $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>' + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
                $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-pencil"></i> Editar');
                var newFields = _mciGetFields(obj);
                fields = newFields;
                _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
                fire();
            }
        });
    }

    // Section collapse
    panel.on('click.mcbi', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
    });

    panel.on('click.mcbi', '.mcbi-btn-transform', function () { _txtOpenTransformModal(); });

    // Fonte change
    panel.on('change.mcbi', '.mcbi-fonte', function () {
        obj.fontestamp = $(this).val();
        _txtTransformInited = false;
        if (obj.fontestamp) {
            panel.find('.mcbi-sample-label').hide();
            _mciAutoApplyFonteTransform(obj.fontestamp, obj, panel);
        } else {
            panel.find('.mcbi-sample-label').show();
            obj.transformConfig = null;
            obj.transformconfigjson = null;
            if (obj.config) obj.config.transformConfig = null;
            var $ts = panel.find('.mcbi-transform-status');
            $ts.removeClass('is-active');
            $ts.find('.mcbi-ts-badge').html('<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados');
            $ts.find('.mcbi-btn-transform').html('<i class="glyphicon glyphicon-plus"></i> Configurar');
        }
        var newFields = _mciGetFields(obj);
        fields = newFields;
        _mciSetSelectFields(panel.find('.mtxt-datafield'), newFields, '-- campo --');
        if (typeof realTimeComponentSync === 'function') realTimeComponentSync(obj, obj.table, obj.idfield);
        fire();
    });

    // Alignment buttons
    panel.on('click.mcbi', '.mtxt-align', function () {
        panel.find('.mtxt-align').removeClass('is-on');
        $(this).addClass('is-on');
        fire();
    });

    // Checkbox toggles
    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    // Font size slider
    panel.on('input.mcbi', '.mtxt-fontsize', function () {
        panel.find('.mtxt-fs-lbl').text($(this).val()); fire();
    });

    // Line height slider
    panel.on('input.mcbi', '.mtxt-lineheight', function () {
        panel.find('.mtxt-lh-lbl').text($(this).val()); fire();
    });

    // All other inputs → fire
    panel.on('input.mcbi change.mcbi', 'input.form-control, select.form-control, input[type=color], input[type=number], input[type=range]', function () {
        fire();
    });
}

function _txtReadConfig(panel, obj) {
    var cfg = obj.config ? JSON.parse(JSON.stringify(obj.config)) : {};

    cfg.dataField = panel.find('.mtxt-datafield').val() || '';
    cfg.staticText = panel.find('.mtxt-static').val() || '';

    cfg.content = {
        multipleValues: panel.find('.mtxt-multi').is(':checked'),
        htmlEnabled: panel.find('.mtxt-html').is(':checked'),
        separator: panel.find('.mtxt-sep').val() || ', '
    };

    cfg.dataFormat = {
        type: panel.find('.mtxt-fmttype').val() || 'text',
        locale: panel.find('.mtxt-locale').val() || 'pt-PT',
        currency: panel.find('.mtxt-currency').val() || 'EUR',
        currencyPosition: 'right',
        minimumFractionDigits: parseInt(panel.find('.mtxt-mindec').val()) || 0,
        maximumFractionDigits: parseInt(panel.find('.mtxt-maxdec').val()) || 2,
        prefix: panel.find('.mtxt-prefix').val() || '',
        suffix: panel.find('.mtxt-suffix').val() || ''
    };

    var align = panel.find('.mtxt-align.is-on').data('align') || 'center';
    cfg.textFormat = {
        fontSize: parseInt(panel.find('.mtxt-fontsize').val()) || 16,
        fontFamily: panel.find('.mtxt-family').val() || 'Nunito, sans-serif',
        fontWeight: panel.find('.mtxt-weight').val() || 'bold',
        fontStyle: panel.find('.mtxt-style').val() || 'normal',
        textAlign: align,
        lineHeight: parseFloat(panel.find('.mtxt-lineheight').val()) || 1.5
    };

    var bgTransp = panel.find('.mtxt-bgtransp').is(':checked');
    var borderTransp = panel.find('.mtxt-bordertransp').is(':checked');
    cfg.colors = {
        textColor: panel.find('.mtxt-textcolor').val() || '#333333',
        backgroundColor: bgTransp ? 'transparent' : (panel.find('.mtxt-bgcolor').val() || '#ffffff'),
        borderColor: borderTransp ? 'transparent' : (panel.find('.mtxt-bordercolor').val() || '#cccccc')
    };

    cfg.spacing = {
        paddingTop: parseInt(panel.find('.mtxt-pt').val()) || 0,
        paddingRight: parseInt(panel.find('.mtxt-pr').val()) || 0,
        paddingBottom: parseInt(panel.find('.mtxt-pb').val()) || 0,
        paddingLeft: parseInt(panel.find('.mtxt-pl').val()) || 0,
        marginTop: parseInt(panel.find('.mtxt-mt').val()) || 0,
        marginBottom: parseInt(panel.find('.mtxt-mb').val()) || 0
    };

    cfg.border = {
        width: parseInt(panel.find('.mtxt-bw').val()) || 0,
        style: panel.find('.mtxt-bstyle').val() || 'solid',
        radius: parseInt(panel.find('.mtxt-brad').val()) || 0
    };

    cfg.effects = {
        textShadow: panel.find('.mtxt-shadow').is(':checked'),
        shadowColor: panel.find('.mtxt-shcolor').val() || '#666666',
        shadowBlur: parseInt(panel.find('.mtxt-shblur').val()) || 2,
        shadowOffsetX: parseInt(panel.find('.mtxt-shx').val()) || 1,
        shadowOffsetY: parseInt(panel.find('.mtxt-shy').val()) || 1
    };

    cfg.dimensions = {
        width: panel.find('.mtxt-width').val() || '100%',
        height: panel.find('.mtxt-height').val() || 'auto',
        maxWidth: panel.find('.mtxt-maxw').val() || 'none'
    };

    cfg.transformConfig = cfg.transformConfig || null;
    return cfg;
}

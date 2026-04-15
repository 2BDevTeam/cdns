// ── Custom Code Object Type ─────────────────────────────────────────────────
// Permite ao utilizador escrever JavaScript personalizado que é executado
// com acesso directo ao containerSelector, data (rows), config e jQuery.
// Funciona tanto no builder (editor) como no dashboard renderizado (mdash.html).
// ────────────────────────────────────────────────────────────────────────────

var _CUSTOMCODE_SAMPLE_CONFIG = {
    code: '// Variáveis disponíveis:\n// containerSelector — selector CSS do container (string)\n// $container       — $(containerSelector) (jQuery)\n// data             — array de registos da fonte\n// config           — objecto de configuração\n// itemObject       — MdashContainerItemObject\n\n$container.html(\'<div style="padding:16px;color:#64748b;font-size:13px;"><i class="fa fa-code"></i> Código personalizado</div>\');',
    cssCode: '',
    executeOnEdit: true
};

// ── Renderer ────────────────────────────────────────────────────────────────
function renderObjectCustomCode(dados) {
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_CUSTOMCODE_SAMPLE_CONFIG));
    var rows = dados.data || [];
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var sel = dados.containerSelector;

    // Transform fallback
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
            }
        } catch (e) { /* silêncio */ }
    }

    var code = cfg.code || '';
    var cssCode = cfg.cssCode || '';

    if (!code) {
        $(sel).html(
            '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">'
            + '<i class="fa fa-code" style="font-size:24px;display:block;margin-bottom:6px;opacity:.5;"></i>'
            + 'Código personalizado — sem código definido'
            + '</div>'
        );
        return;
    }

    // Inject scoped CSS if present
    var styleId = 'mcc-style-' + stamp;
    $('#' + styleId).remove();
    if (cssCode) {
        $('head').append('<style id="' + styleId + '">' + cssCode + '</style>');
    }

    // Execute user code via Function constructor (safer than eval, no access to local scope)
    try {
        var fn = new Function(
            'containerSelector', '$container', 'data', 'config', 'itemObject', '$',
            code
        );
        fn(sel, $(sel), rows, cfg, dados.itemObject, $);
    } catch (err) {
        $(sel).html(
            '<div style="padding:12px;font-size:12px;">'
            + '<div style="color:#dc2626;font-weight:700;margin-bottom:4px;"><i class="glyphicon glyphicon-exclamation-sign"></i> Erro no código personalizado</div>'
            + '<pre style="background:#fff5f5;border:1px solid #fecaca;color:#991b1b;padding:8px;border-radius:6px;font-size:11px;white-space:pre-wrap;max-height:200px;overflow:auto;">'
            + $('<span>').text(err.message || String(err)).html()
            + '</pre></div>'
        );
    }
}

// ── Inline Properties Editor ────────────────────────────────────────────────
function renderCustomCodePropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_CUSTOMCODE_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    _mciCSS();

    // ── fire() — debounce save + re-render ──
    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.mcc-root').length) return;
            _ccReadConfig(panel, obj);
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }
    panel.data('_mciTimer', _timer);

    // ── Transform badge ──
    var _hasTrans = !!(cfg.transformConfig && cfg.transformConfig.sourceTable);

    // ── Section: Dados (fonte + transform) ──
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm"><option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '')
                + '>' + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('')
        + '</select></div>'
        + '<div class="mcbi-field" style="margin-top:6px;">'
        + '<button type="button" class="btn btn-xs btn-default mcbi-btn-transform" style="width:100%;">'
        + '<i class="glyphicon glyphicon-filter"></i> '
        + (_hasTrans ? 'Editar Transformação' : 'Configurar Transformação')
        + '</button>'
        + (_hasTrans ? '<span class="mcc-trans-badge" style="display:block;font-size:10px;color:#64748b;margin-top:3px;"><i class="glyphicon glyphicon-ok" style="color:#22c55e;"></i> ' + _mciEsc(cfg.transformConfig.sourceTable || 'SQL') + '</span>' : '')
        + '</div>';

    // ── Section: Código JavaScript ──
    var codeValue = cfg.code || _CUSTOMCODE_SAMPLE_CONFIG.code;
    var sCodigo = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">JavaScript</label>'
        + '<button type="button" class="btn btn-xs btn-default mcc-expand-code" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mcc-ace-' + stamp + '" class="mcc-ace-editor" style="width:100%;height:220px;border:1px solid rgba(0,0,0,.12);border-radius:6px;">'
        + '</div>'
        + '</div>';

    // ── Section: CSS ──
    var cssValue = cfg.cssCode || '';
    var sCSS = '<div class="mcbi-field">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<label style="margin:0;">CSS (opcional)</label>'
        + '<button type="button" class="btn btn-xs btn-default mcc-expand-css" title="Editar CSS em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i></button>'
        + '</div>'
        + '<div id="mcc-ace-css-' + stamp + '" class="mcc-ace-editor" style="width:100%;height:100px;border:1px solid rgba(0,0,0,.12);border-radius:6px;">'
        + '</div>'
        + '</div>';

    // ── Section: Opções ──
    var sOpcoes = '<div class="mcbi-field">'
        + _mciChk('mcc-exec-edit', 'Executar no editor (live preview)', cfg.executeOnEdit !== false)
        + '</div>'
        + '<div class="mcbi-field">'
        + '<label>Campos disponíveis</label>'
        + '<div class="mcc-fields-list" style="font-size:10px;color:#64748b;max-height:120px;overflow:auto;">'
        + (fields.length ? fields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ') : '<em>Sem campos — seleccione uma fonte</em>')
        + '</div></div>';

    // ── Ajuda ──
    var sAjuda = '<div style="font-size:10.5px;color:#64748b;line-height:1.6;">'
        + '<p style="margin:0 0 6px;"><strong>Variáveis disponíveis:</strong></p>'
        + '<code>containerSelector</code> — selector CSS (string)<br>'
        + '<code>$container</code> — $(containerSelector) (jQuery)<br>'
        + '<code>data</code> — array de registos [{campo: valor}, ...]<br>'
        + '<code>config</code> — objecto de configuração<br>'
        + '<code>itemObject</code> — MdashContainerItemObject<br>'
        + '<code>$</code> — jQuery<br>'
        + '<hr style="margin:8px 0;border-color:rgba(0,0,0,.06);">'
        + '<p style="margin:0;"><strong>Exemplo:</strong></p>'
        + '<pre style="background:rgba(0,0,0,.03);padding:8px;border-radius:5px;font-size:10px;margin:4px 0 0;">'
        + '$container.empty();\nvar html = \'&lt;ul&gt;\';\ndata.forEach(function(row) {\n  html += \'&lt;li&gt;\' + row.nome + \'&lt;/li&gt;\';\n});\nhtml += \'&lt;/ul&gt;\';\n$container.html(html);'
        + '</pre></div>';

    // ── Assemble HTML ──
    var html = '<div class="mcbi-root mcc-root" data-stamp="' + stamp + '">'
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('codigo', 'Código JavaScript', 'glyphicon-console', true, sCodigo)
        + _mciSection('css', 'CSS', 'glyphicon-tint', false, sCSS)
        + _mciSection('opcoes', 'Opções', 'glyphicon-cog', false, sOpcoes)
        + _mciSection('ajuda', 'Ajuda', 'glyphicon-question-sign', false, sAjuda)
        + '</div>';

    panel.html(html);

    // ── Init ACE editors ──
    var aceJsId = 'mcc-ace-' + stamp;
    var aceCssId = 'mcc-ace-css-' + stamp;
    var aceJs = null, aceCss = null;

    if (typeof ace !== 'undefined') {
        // JS editor
        aceJs = ace.edit(aceJsId);
        aceJs.session.setMode('ace/mode/javascript');
        aceJs.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceJs.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 30, minLines: 8 });
        aceJs.setValue(codeValue, -1);
        aceJs.on('change', function () { fire(); });

        // CSS editor
        aceCss = ace.edit(aceCssId);
        aceCss.session.setMode('ace/mode/css');
        aceCss.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        aceCss.setOptions({ fontSize: '11px', showPrintMargin: false, wrap: true, maxLines: 15, minLines: 3 });
        aceCss.setValue(cssValue, -1);
        aceCss.on('change', function () { fire(); });
    }

    // ── Store ace references on panel for readConfig ──
    panel.data('_mccAceJs', aceJs);
    panel.data('_mccAceCss', aceCss);

    // ── Event handlers ──
    panel.off('.mcbi');

    // Section collapse
    panel.on('click.mcbi', '.mcbi-section-hd', function () {
        var $s = $(this).closest('.mcbi-section');
        $s.toggleClass('is-open');
        var open = $s.hasClass('is-open');
        $(this).find('.mcbi-chev').toggleClass('glyphicon-chevron-up', open).toggleClass('glyphicon-chevron-down', !open);
        // Resize ACE editors when section opens
        if (open && aceJs) setTimeout(function () { aceJs.resize(); if (aceCss) aceCss.resize(); }, 50);
    });

    // Fonte change
    panel.on('change.mcbi', '.mcbi-fonte', function () {
        var newStamp = $(this).val();
        obj.fontestamp = newStamp || '';
        _mciAutoApplyFonteTransform(newStamp, obj, panel);
        // Refresh fields list
        var newFields = _mciGetFields(obj);
        panel.find('.mcc-fields-list').html(
            newFields.length
                ? newFields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                : '<em>Sem campos — seleccione uma fonte</em>'
        );
        fire();
    });

    // Transform button
    panel.on('click.mcbi', '.mcbi-btn-transform', function () {
        var currentTC = obj.config && obj.config.transformConfig ? obj.config.transformConfig : null;
        var fonteStamp = obj.fontestamp;
        var fonte = fonteStamp && _mciGetFontes(obj).find(function (f) { return f.mdashfontestamp === fonteStamp; });
        var schema = [];
        if (fonte && typeof mdashFonteTableName === 'function' && typeof MdashTransformBuilder !== 'undefined') {
            var tbl = mdashFonteTableName(fonte);
            if (tbl) schema = MdashTransformBuilder.getTableSchema(tbl);
        }
        _mciOpenTransformModalFor({
            title: 'Transformação — Código Personalizado',
            fonteName: fonte ? (fonte.descricao || fonte.codigo) : '',
            modalId: 'mcc-transform-modal',
            hostId: 'mcc-transform-modal-host',
            config: currentTC,
            schema: schema,
            onSave: function (newT) {
                if (!obj.config) obj.config = {};
                obj.config.transformConfig = newT;
                obj.transformConfig = newT;
                // Update badge
                panel.find('.mcc-trans-badge').remove();
                panel.find('.mcbi-btn-transform')
                    .html('<i class="glyphicon glyphicon-filter"></i> Editar Transformação')
                    .after('<span class="mcc-trans-badge" style="display:block;font-size:10px;color:#64748b;margin-top:3px;"><i class="glyphicon glyphicon-ok" style="color:#22c55e;"></i> ' + _mciEsc(newT.sourceTable || 'SQL') + '</span>');
                // Refresh fields
                var newFields = _mciGetFields(obj);
                panel.find('.mcc-fields-list').html(
                    newFields.length
                        ? newFields.map(function (f) { return '<code style="background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;margin:1px;">' + _mciEsc(f) + '</code>'; }).join(' ')
                        : '<em>Sem campos</em>'
                );
                fire();
            }
        });
    });

    // Expand JS editor to full screen modal
    panel.on('click.mcbi', '.mcc-expand-code', function () {
        _mccOpenEditorModal('javascript', aceJs, function (newVal) {
            if (aceJs) aceJs.setValue(newVal, -1);
            fire();
        });
    });

    // Expand CSS editor to full screen modal
    panel.on('click.mcbi', '.mcc-expand-css', function () {
        _mccOpenEditorModal('css', aceCss, function (newVal) {
            if (aceCss) aceCss.setValue(newVal, -1);
            fire();
        });
    });

    // Checkbox change
    panel.on('change.mcbi', '.mcbi-chk input[type=checkbox]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });
}

// ── Full-screen editor modal ────────────────────────────────────────────────
function _mccOpenEditorModal(mode, aceRef, onApply) {
    var modalId = 'mcc-editor-fullscreen-modal';
    $('#' + modalId).remove();

    var currentVal = aceRef ? aceRef.getValue() : '';
    var aceMode = mode === 'css' ? 'ace/mode/css' : 'ace/mode/javascript';
    var title = mode === 'css' ? 'Editar CSS' : 'Editar JavaScript';

    var mHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
        + '<div class="modal-dialog" style="width:90%;margin:2% auto;" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-header" style="padding:8px 14px;">'
        + '  <button type="button" class="close" data-dismiss="modal">&times;</button>'
        + '  <h4 class="modal-title" style="font-size:14px;"><i class="glyphicon glyphicon-pencil"></i> ' + title + '</h4>'
        + '</div>'
        + '<div class="modal-body" style="padding:0;">'
        + '  <div id="mcc-modal-ace-editor" style="width:100%;height:calc(80vh - 100px);"></div>'
        + '</div>'
        + '<div class="modal-footer" style="padding:8px 14px;">'
        + '  <button type="button" class="btn btn-primary btn-sm" id="mcc-editor-modal-save"><i class="glyphicon glyphicon-floppy-disk"></i> Aplicar</button>'
        + '  <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancelar</button>'
        + '</div>'
        + '</div></div></div>';

    $('body').append(mHtml);
    var $modal = $('#' + modalId);
    $modal.modal('show');

    $modal.on('shown.bs.modal', function () {
        var modalAce = ace.edit('mcc-modal-ace-editor');
        modalAce.session.setMode(aceMode);
        modalAce.setTheme(typeof getMDashEditorTheme === 'function' ? getMDashEditorTheme('dark') : 'ace/theme/monokai');
        modalAce.setOptions({ fontSize: '13px', showPrintMargin: false, wrap: true });
        modalAce.setValue(currentVal, -1);
        modalAce.focus();

        $('#mcc-editor-modal-save').off('click').on('click', function () {
            var newValue = modalAce.getValue();
            if (onApply) onApply(newValue);
            $modal.modal('hide');
        });
    });
    $modal.on('hidden.bs.modal', function () { $(this).remove(); });
}

// ── Read config from panel ──────────────────────────────────────────────────
function _ccReadConfig(panel, obj) {
    var cfg = obj.config || {};
    var aceJs = panel.data('_mccAceJs');
    var aceCss = panel.data('_mccAceCss');

    cfg.code = aceJs ? aceJs.getValue() : (cfg.code || '');
    cfg.cssCode = aceCss ? aceCss.getValue() : (cfg.cssCode || '');
    cfg.executeOnEdit = panel.find('.mcc-exec-edit').is(':checked');
    cfg.transformConfig = cfg.transformConfig || null;

    obj.config = cfg;
    obj.configjson = JSON.stringify(cfg);
}


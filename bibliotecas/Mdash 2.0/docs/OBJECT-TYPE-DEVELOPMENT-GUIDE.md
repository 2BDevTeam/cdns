# MDash 2.0 — Guia de Desenvolvimento de Objectos

## Prompt genérico para criar um novo tipo de objecto

> **Instrução**: Copie o bloco abaixo e substitua `{{TIPO}}` pelo nome do novo tipo.

---

```
Preciso de implementar o objecto do tipo "{{TIPO}}" no MDash 2.0.
Segue os padrões EXACTOS já estabelecidos nos objectos chart, text e customCode.

### Ficheiros a alterar

1. **TEMPLATE DASHBOARD STANDARD EXTENSION.js** (via PowerShell — ficheiro OneDrive com ReparsePoint)
2. **MDash config lib REFACTOR.js** (via replace_string_in_file — funciona normalmente)

### Componentes obrigatórios (EXTENSION.js)

| # | Artefacto | Padrão de referência | Descrição |
|---|-----------|---------------------|-----------|
| 1 | `_{{TIPO}}_SAMPLE_CONFIG` | `_MCHART_SAMPLE_CONFIG`, `_TEXT_SAMPLE_CONFIG`, `_CUSTOMCODE_SAMPLE_CONFIG` | Objecto JS com configuração por defeito completa |
| 2 | `renderObject{{Tipo}}(dados)` | `renderObjectGrafico`, `renderObjectTexto`, `renderObjectCustomCode` | Recebe `{containerSelector, itemObject, config, data, transformConfig, isSample}` e renderiza HTML no container |
| 3 | `render{{Tipo}}PropertiesInline(obj, panel)` | `renderChartPropertiesInline`, `renderTextPropertiesInline`, `renderCustomCodePropertiesInline` | Painel de propriedades inline (3ª coluna) com secções colapsáveis |
| 4 | `_{{tipo}}ReadConfig(panel, obj)` | `_ccReadConfig` | Lê valores do painel e persiste em `obj.config` + `obj.configjson` |
| 5 | `createDynamicSchema{{Tipo}}(data)` | `createDynamicSchemaGrafico`, `createDynamicSchemaTexto` | JSON Schema do objecto (legacy compat) |
| 6 | Registo em `getTiposObjectoConfig()` | Ver secção abaixo | Entrada no array de tipos |

### Estrutura do registo de tipo

```javascript
{
    tipo: "{{tipo}}",
    descricao: "{{Descrição}}",
    label: "{{Label curto}}",
    icon: "fa fa-{{icon}}",
    categoria: "editor",
    renderPropertiesInline: render{{Tipo}}PropertiesInline,
    createDynamicSchema: createDynamicSchema{{Tipo}},
    renderObject: renderObject{{Tipo}},
    getSampleData: function () { return getMdashSampleData('{{tipo}}'); },
    sampleConfig: _{{TIPO}}_SAMPLE_CONFIG
}
```

### Catálogo (MDash config lib REFACTOR.js)
Adicionar entrada em `getObjectCatalogDefinitions()` na categoria adequada:
```javascript
{ value: '{{tipo}}', label: '{{Label}}', icon: 'glyphicon glyphicon-{{icon}}', color: 'rgba(R,G,B,0.12)', description: '{{Descrição curta}}' }
```

---

## Padrão da função `renderObject` (render)

```javascript
function renderObject{{Tipo}}(dados) {
    var stamp = dados.itemObject.mdashcontaineritemobjectstamp;
    var cfg = dados.config
        ? JSON.parse(JSON.stringify(dados.config))
        : JSON.parse(JSON.stringify(_{{TIPO}}_SAMPLE_CONFIG));
    var isSample = !!dados.isSample;

    // 1. Obter dados (rows)
    var rows = dados.data || [];

    // 2. Fallback: transformConfig → MdashTransformBuilder.executeRaw
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
            console.warn('[MDash] renderObject{{Tipo}} fallback transform error:', e.message);
        }
    }

    // 3. Sem dados → sample data
    if (rows.length === 0) {
        rows = getMdashSampleData('{{tipo}}');
        isSample = true;
    }

    // 4. Badge de amostra
    var badgeHtml = isSample
        ? '<div class="mchart-sample-badge"><i class="glyphicon glyphicon-info-sign"></i> Dados de amostra</div>'
        : '';

    // 5. Renderizar HTML
    var html = badgeHtml + '... HTML do objecto ...';
    $(dados.containerSelector).html(html);
}
```

---

## Padrão do painel de propriedades inline

```javascript
function render{{Tipo}}PropertiesInline(obj, panel) {
    var stamp = obj.mdashcontaineritemobjectstamp;
    var cfg = obj.config
        ? JSON.parse(JSON.stringify(obj.config))
        : JSON.parse(JSON.stringify(_{{TIPO}}_SAMPLE_CONFIG));
    var fontes = _mciGetFontes(obj);
    var fields = _mciGetFields(obj);

    // Injectar CSS partilhado
    _mciCSS();

    // ── fire() — debounce save + re-render ──
    var _timer = null;
    function fire() {
        clearTimeout(_timer);
        _timer = setTimeout(function () {
            if (!panel.find('.m{{tipo}}-root').length) return;
            _{{tipo}}ReadConfig(panel, obj);
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            _mciRerender(obj);
        }, 400);
    }

    // ── Transform badge (padrão partilhado) ──
    var _hasTrans = !!((obj.transformConfig && obj.transformConfig.sourceTable)
        || (cfg.transformConfig && cfg.transformConfig.sourceTable));

    // ── Secção: Dados (fonte + transform) ──
    var sDados = '<div class="mcbi-field"><label>Fonte de dados</label>'
        + '<select class="mcbi-fonte form-control input-sm">'
        + '<option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            return '<option value="' + _mciEsc(f.mdashfontestamp) + '"'
                + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '')
                + '>' + _mciEsc(f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('') + '</select></div>'
        + '<div class="mcbi-transform-status' + (_hasTrans ? ' is-active' : '') + '">'
        + '<span class="mcbi-ts-badge">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>'
              + _mciEsc((obj.transformConfig && obj.transformConfig.sourceTable)
                || (cfg.transformConfig && cfg.transformConfig.sourceTable) || 'SQL')
              + '</strong>'
            : '<i class="glyphicon glyphicon-filter"></i> Sem transformação de dados')
        + '</span>'
        + '<button type="button" class="mcbi-btn-transform">'
        + (_hasTrans
            ? '<i class="glyphicon glyphicon-pencil"></i> Editar'
            : '<i class="glyphicon glyphicon-plus"></i> Configurar')
        + '</button></div>';

    // ── Secções específicas do tipo ──
    var sConfig = '... campos específicos do tipo ...';

    // ── Montar HTML final ──
    var html = '<div class="mcbi-root m{{tipo}}-root" data-stamp="' + stamp + '">'
        + _mciSection('dados', 'Dados', 'glyphicon-hdd', true, sDados)
        + _mciSection('config', 'Configuração', 'glyphicon-cog', true, sConfig)
        + '</div>';

    panel.html(html);

    // ── Event handlers ──

    // Fonte change → auto-apply transform
    panel.on('change', '.mcbi-fonte', function () {
        var fs = $(this).val();
        obj.fontestamp = fs;
        _mciAutoApplyFonteTransform(fs, obj, panel);
        // Refresh field selects
        var newFields = _mciGetFields(obj);
        _mciRefreshFieldSelects(panel, newFields);
        fire();
    });

    // Transform button → open modal
    panel.on('click', '.mcbi-btn-transform', function () {
        var currentTC = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
        _mciOpenTransformModalFor(currentTC, obj, function (newT) {
            // Persistir em todas as localizações
            obj.transformConfig = newT;
            obj.transformconfigjson = JSON.stringify(newT);
            obj.config = obj.config || {};
            obj.config.transformConfig = newT;
            if (typeof realTimeComponentSync === 'function')
                realTimeComponentSync(obj, obj.table, obj.idfield);
            // Actualizar badge
            var $ts = panel.find('.mcbi-transform-status');
            $ts.addClass('is-active');
            $ts.find('.mcbi-ts-badge').html(
                '<i class="glyphicon glyphicon-ok-sign"></i> Transformação: <strong>'
                + _mciEsc(newT.sourceTable || 'SQL') + '</strong>');
            $ts.find('.mcbi-btn-transform').html(
                '<i class="glyphicon glyphicon-pencil"></i> Editar');
            // Refresh field selects
            _mciRefreshFieldSelects(panel, _mciGetFields(obj));
            fire();
        });
    });

    // Section toggle (padrão partilhado)
    panel.on('click', '.mcbi-section-hd', function () {
        var sec = $(this).closest('.mcbi-section');
        sec.toggleClass('is-open');
        $(this).find('.mcbi-chev')
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    });

    // Checkbox toggle (padrão partilhado)
    panel.on('change', 'input[type="checkbox"]', function () {
        $(this).closest('.mcbi-chk').toggleClass('is-on', this.checked);
        fire();
    });

    // Inputs change
    panel.on('input change', 'input, select, textarea', function () {
        fire();
    });
}
```

---

## Padrão readConfig

```javascript
function _{{tipo}}ReadConfig(panel, obj) {
    var cfg = obj.config || {};
    // Ler valores dos inputs do painel
    // cfg.campo = panel.find('.m{{tipo}}-campo').val();
    obj.config = cfg;
    obj.configjson = JSON.stringify(cfg);
}
```

---

## Helpers partilhados disponíveis

| Helper | Assinatura | Descrição |
|--------|-----------|-----------|
| `_mciEsc(s)` | `string → string` | Escapa HTML |
| `_mciSection(id, label, icon, open, body)` | → HTML string | Secção colapsável |
| `_mciChk(cls, label, checked)` | → HTML string | Checkbox toggle |
| `_mciGetFontes(obj)` | → Array | Fontes disponíveis para o objecto |
| `_mciGetFields(obj)` | → Array<string> | Campos da transformação/fonte |
| `_mciRefreshFieldSelects(panel, fields)` | void | Actualiza `<select>`s de campos |
| `_mciAutoApplyFonteTransform(fonteStamp, obj, panel)` | void | Auto-configura o transform ao seleccionar fonte |
| `_mciOpenTransformModalFor(tc, obj, onSave)` | void | Abre modal do Transform Builder |
| `_mciCSS()` | void | Injecta CSS partilhado `.mcbi-*` (idempotente) |
| `_mciRerender(obj)` | void | Re-renderiza o objecto no dashboard |
| `realTimeComponentSync(obj, table, idfield)` | void | Persiste alterações no backend |
| `getMdashSampleData(tipo)` | → Array | Dados de amostra |
| `formatDataValue(value, formatConfig)` | → string | Formata valores (número, moeda, %, data) |

---

## Convenções de CSS

### Classes do painel de propriedades
- `.mcbi-root` — container raiz do painel
- `.mcbi-section` / `.mcbi-section.is-open` — secção colapsável
- `.mcbi-section-hd` — cabeçalho da secção (clicável)
- `.mcbi-section-bd` — corpo da secção 
- `.mcbi-field` — campo com label + input
- `.mcbi-row2` — grelha de 2 colunas (`display:grid; grid-template-columns:1fr 1fr`)
- `.mcbi-checks` — grupo de checkboxes
- `.mcbi-chk` / `.mcbi-chk.is-on` — checkbox toggle
- `.mcbi-tog` — indicador visual do toggle
- `.mcbi-info` — mensagem informativa
- `.mcbi-transform-status` / `.mcbi-transform-status.is-active` — card de status de transformação
- `.mcbi-ts-badge` — badge de texto dentro do transform status
- `.mcbi-btn-transform` — botão do transform

### Badge de amostra
```css
.mchart-sample-badge — fundo claro, texto pequeno, ícone info-sign
```

### Scoping obrigatório
Estilos globais DEVEM ser scoped a `.mdash-editor-wrapper` para não afectar a página PHC.

---

## Configuração armazenada no objecto

```
obj.config          — objecto JS com configuração
obj.configjson      — JSON.stringify(config) 
obj.transformConfig — config do Transform Builder (canónica)
obj.transformconfigjson — JSON.stringify(transformConfig)
obj.fontestamp      — stamp da fonte seleccionada
```

**ATENÇÃO**: O `MdashContainerItemObject` construtor migra `obj.config.transformConfig` para `obj.transformConfig` e apaga de `obj.config`. Ler SEMPRE `obj.transformConfig` primeiro.

---

## Checklist para novo tipo

- [ ] `_{{TIPO}}_SAMPLE_CONFIG` — configuração por defeito
- [ ] `renderObject{{Tipo}}(dados)` — renderização
- [ ] `render{{Tipo}}PropertiesInline(obj, panel)` — painel inline com secções
- [ ] `_{{tipo}}ReadConfig(panel, obj)` — leitura de config
- [ ] `createDynamicSchema{{Tipo}}(data)` — JSON Schema
- [ ] Registo em `getTiposObjectoConfig()` com todas as propriedades
- [ ] Entrada no catálogo em `getObjectCatalogDefinitions()` (REFACTOR.js)
- [ ] CSS específico (se necessário) — injectado via função idempotente
- [ ] Dados de amostra — fallback via `getMdashSampleData()`
- [ ] Transform fallback — `MdashTransformBuilder.executeRaw(tCfg)`

---

## Notas técnicas

- **OneDrive ReparsePoint**: O ficheiro EXTENSION.js está no OneDrive e `replace_string_in_file` reporta sucesso mas NÃO persiste. Usar PowerShell:
  ```powershell
  $f = "caminho\TEMPLATE DASHBOARD STANDARD EXTENSION.js"
  $v = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
  # ... manipulação ...
  [System.IO.File]::WriteAllText($f, $v2, [System.Text.Encoding]::UTF8)
  ```
- **MDash config lib REFACTOR.js** funciona com `replace_string_in_file` normalmente.
- **Tabulator.js** — Biblioteca de tabelas utilizada para objectos do tipo tabela.
- **ECharts** — Biblioteca de gráficos utilizada para objectos do tipo chart.
- **ACE Editor** — Utilizado para edição de código (customCode).

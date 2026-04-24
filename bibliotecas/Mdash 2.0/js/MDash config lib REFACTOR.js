/**
 * ============================================================================
 * MDash 2.0 - Configuration Library (REFACTOR COMPLETO)
 * ============================================================================
 * 
 * Respeita TODA a estrutura original:
 * - MdashContainer (Containers/Rows)
 * - MdashContainerItem (Items dentro dos containers, com template/layout)
 * - MdashContainerItemObject (Objetos visuais: gráficos, tabelas, etc.)
 * - MdashFilter (Filtros do dashboard)
 * - MDashFonte (Data sources)
 * 
 * Apenas muda a FORMA de manipular (mais visual e intuitiva)
 */

// ============================================================================
// GLOBAL STATE MANAGEMENT (Mantido 100% compatível)
// ============================================================================

var GMDashContainers = [];
var GMDashConfig = [];
var GMDashContainerItems = [];
var GMDashContainerItemObjects = [];
var GMDashContainerItemObjectDetails = [];
var GMDashFilters = [];
var GMDashFontes = [];
var GMDashTabs = [];
var GMDashContainerItemLayouts = [];
var GMdashDeleteRecords = [];
var GMDashTempRecordToDelete = null; // Armazém temporário para confirmações de eliminação
var GMDashStamp = "";
var selectedObject = {};
var GSelectedElement = null;
var GSelectedType = "";
var GActiveTab = "general";
var GMDashReactiveInstance = null;
var _currentSelectedComponent = null; // espelho externo do selectedComponent (PetiteVue mount() não expõe o scope reactivo)
var GTemplateThumbCache = {};
var GMDashIsResizingItem = false;
var GMDashTabsRuntime = null;
var GManualDragState = {
    itemStamp: "",
    containerStamp: "",
    slot: null,
    validation: null
};

// ============================================================================
// CLIPBOARD & MULTI-SELECTION STATE
// ============================================================================
var GMDashClipboard = {
    type: '',          // 'container' | 'containerItem' | 'object'
    items: [],         // Array de snapshots (deep clones) dos itens copiados
    sourceStamps: []   // Stamps originais (para visual "copied" feedback)
};
var GMDashMultiSelection = {
    type: '',          // enforce same type for all selected items
    stamps: [],        // ordered array of selected stamps
    anchorStamp: ''    // for Shift+Click range selection
};

// ============================================================================
// CLIPBOARD ENGINE — Copy / Paste uniforme para Container, Item e Object
// ============================================================================

/**
 * Deep-clone um objecto simples (JSON-safe). Remove referências circulares.
 */
function _clipDeepClone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return {}; }
}

/**
 * Extrai um snapshot persistível de qualquer entidade MDash.
 * Copia apenas as propriedades que existem na BD (exclui runtime: records, dadosTemplate…).
 */
function _clipSnapshot(entity) {
    var snap = _clipDeepClone(entity);
    // remover props runtime que não devem ser copiadas
    delete snap.records;
    delete snap.dadosTemplate;
    delete snap.localsource;
    delete snap.objectoConfig;
    return snap;
}

/**
 * Copia a selecção actual (single ou multi) para o clipboard.
 * Se há multi-selecção, copia todos; senão copia o selectedComponent.
 */
function mdashCopySelection() {
    var sel = GMDashMultiSelection;
    var type, stamps, snapshots;

    if (sel.stamps.length > 0) {
        type = sel.type;
        stamps = sel.stamps.slice();
    } else if (_currentSelectedComponent && _currentSelectedComponent.type && _currentSelectedComponent.stamp) {
        var t = _currentSelectedComponent.type;
        if (t !== 'container' && t !== 'containerItem' && t !== 'object') return;
        type = t;
        stamps = [_currentSelectedComponent.stamp];
    } else {
        return;
    }

    snapshots = [];
    var lookup;
    if (type === 'container') {
        lookup = window.appState.containers;
        stamps.forEach(function (st) {
            var c = lookup.find(function (x) { return x.mdashcontainerstamp === st; });
            if (!c) return;
            var snap = _clipSnapshot(c);
            // Incluir items filhos + objectos filhos como sub-árvore
            snap._children = [];
            window.appState.containerItems
                .filter(function (i) { return i.mdashcontainerstamp === st; })
                .forEach(function (item) {
                    var itemSnap = _clipSnapshot(item);
                    itemSnap._objects = window.appState.containerItemObjects
                        .filter(function (o) { return o.mdashcontaineritemstamp === item.mdashcontaineritemstamp; })
                        .map(function (o) {
                            var os = _clipSnapshot(o);
                            if (typeof o.stringifyJSONFields === 'function') {
                                o.stringifyJSONFields();
                                os.configjson = o.configjson;
                                os.transformconfigjson = o.transformconfigjson;
                                os.fontesstampsjson = o.fontesstampsjson;
                                os.queryconfigjson = o.queryconfigjson || JSON.stringify(o.queryConfig || {});
                            }
                            return os;
                        });
                    snap._children.push(itemSnap);
                });
            snapshots.push(snap);
        });
    } else if (type === 'containerItem') {
        lookup = window.appState.containerItems;
        stamps.forEach(function (st) {
            var item = lookup.find(function (x) { return x.mdashcontaineritemstamp === st; });
            if (!item) return;
            var snap = _clipSnapshot(item);
            snap._objects = window.appState.containerItemObjects
                .filter(function (o) { return o.mdashcontaineritemstamp === st; })
                .map(function (o) {
                    var os = _clipSnapshot(o);
                    if (typeof o.stringifyJSONFields === 'function') {
                        o.stringifyJSONFields();
                        os.configjson = o.configjson;
                        os.transformconfigjson = o.transformconfigjson;
                        os.fontesstampsjson = o.fontesstampsjson;
                        os.queryconfigjson = o.queryconfigjson || JSON.stringify(o.queryConfig || {});
                    }
                    return os;
                });
            snapshots.push(snap);
        });
    } else if (type === 'object') {
        lookup = window.appState.containerItemObjects;
        stamps.forEach(function (st) {
            var o = lookup.find(function (x) { return x.mdashcontaineritemobjectstamp === st; });
            if (!o) return;
            if (typeof o.stringifyJSONFields === 'function') o.stringifyJSONFields();
            var snap = _clipSnapshot(o);
            snap.configjson = o.configjson;
            snap.transformconfigjson = o.transformconfigjson;
            snap.fontesstampsjson = o.fontesstampsjson;
            snap.queryconfigjson = o.queryconfigjson || JSON.stringify(o.queryConfig || {});
            snapshots.push(snap);
        });
    }

    if (!snapshots.length) return;

    GMDashClipboard.type = type;
    GMDashClipboard.items = snapshots;
    GMDashClipboard.sourceStamps = stamps.slice();

    // Actualizar estado reactivo para os botões de paste
    window.appState.clipboardType = type;

    // Visual feedback — marcar como "copied"
    _clipUpdateCopiedVisuals();

    var labels = { container: 'container(s)', containerItem: 'item(ns)', object: 'objecto(s)' };
    if (typeof alertify !== 'undefined') {
        alertify.success(snapshots.length + ' ' + (labels[type] || 'elemento(s)') + ' copiado(s) — Ctrl+V para colar');
    }
}

/**
 * Cola o conteúdo do clipboard no contexto adequado.
 *  - Containers: colados ao dashboard (nova cópia)
 *  - ContainerItems: colados no container seleccionado (ou no container do item seleccionado)
 *  - Objects: colados no item seleccionado (ou no item do objecto seleccionado)
 */
function mdashPasteClipboard() {
    var clip = GMDashClipboard;
    if (!clip.type || !clip.items.length) {
        if (typeof alertify !== 'undefined') alertify.warning('Nada para colar. Use Ctrl+C primeiro.');
        return;
    }

    var pastedCount = 0;

    if (clip.type === 'container') {
        clip.items.forEach(function (snap) {
            pastedCount += _clipPasteContainer(snap);
        });
    } else if (clip.type === 'containerItem') {
        // Determinar container destino
        var targetContainerStamp = _clipResolveTargetContainer();
        if (!targetContainerStamp) {
            if (typeof alertify !== 'undefined') alertify.warning('Seleccione um container para colar o(s) item(ns).');
            return;
        }
        clip.items.forEach(function (snap) {
            pastedCount += _clipPasteContainerItem(snap, targetContainerStamp);
        });
    } else if (clip.type === 'object') {
        var targetItemStamp = _clipResolveTargetItem();
        if (!targetItemStamp) {
            if (typeof alertify !== 'undefined') alertify.warning('Seleccione um item para colar o(s) objecto(s).');
            return;
        }
        clip.items.forEach(function (snap) {
            pastedCount += _clipPasteObject(snap, targetItemStamp);
        });
    }

    if (pastedCount > 0) {
        setTimeout(function () {
            renderAllContainerItemTemplates();
            if (typeof initDragAndDrop === 'function') initDragAndDrop();
        }, 50);
        var labels = { container: 'container(s)', containerItem: 'item(ns)', object: 'objecto(s)' };
        if (typeof alertify !== 'undefined') alertify.success(pastedCount + ' ' + (labels[clip.type] || 'elemento(s)') + ' colado(s)');
    }
}

// ── Paste helpers ──────────────────────────────────────────────────────────

function _clipPasteContainer(snap) {
    var newStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashcontainerstamp = newStamp;
    data.dashboardstamp = GMDashStamp;
    data.titulo = (data.titulo || 'Container') + ' (cópia)';
    data.ordem = (window.appState.containers.length + 1);
    delete data._children;

    var newContainer = new MdashContainer(data);
    window.appState.containers.push(newContainer);
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newContainer, newContainer.table, newContainer.idfield);

    // Colar items filhos
    if (snap._children && snap._children.length) {
        snap._children.forEach(function (childSnap) {
            _clipPasteContainerItem(childSnap, newStamp);
        });
    }
    return 1;
}

function _clipPasteContainerItem(snap, targetContainerStamp) {
    var newStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashcontaineritemstamp = newStamp;
    data.mdashcontainerstamp = targetContainerStamp;
    data.dashboardstamp = GMDashStamp;
    data.ordem = window.appState.containerItems.filter(function (i) { return i.mdashcontainerstamp === targetContainerStamp; }).length + 1;
    delete data._objects;

    var newItem = new MdashContainerItem(data);
    window.appState.containerItems.push(newItem);
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newItem, newItem.table, newItem.idfield);

    // Colar objectos filhos
    if (snap._objects && snap._objects.length) {
        snap._objects.forEach(function (objSnap) {
            _clipPasteObject(objSnap, newStamp);
        });
    }

    setTimeout(function () { renderContainerItemTemplate(newItem); }, 0);
    return 1;
}

function _clipPasteObject(snap, targetItemStamp) {
    var newStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashcontaineritemobjectstamp = newStamp;
    data.mdashcontaineritemstamp = targetItemStamp;
    data.dashboardstamp = GMDashStamp;

    var newObj = new MdashContainerItemObject(data);
    window.appState.containerItemObjects.push(newObj);
    if (typeof newObj.stringifyJSONFields === 'function') newObj.stringifyJSONFields();
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newObj, newObj.table, newObj.idfield);
    return 1;
}

// ── Resolve target helpers ─────────────────────────────────────────────────

function _clipResolveTargetContainer() {
    var sel = _currentSelectedComponent;
    if (!sel) return '';
    if (sel.type === 'container' && sel.stamp) return sel.stamp;
    if (sel.type === 'containerItem' && sel.data && sel.data.mdashcontainerstamp) return sel.data.mdashcontainerstamp;
    if (sel.type === 'slot' && sel.data && sel.data.item) return sel.data.item.mdashcontainerstamp;
    if (sel.type === 'object' && sel.data && sel.data.mdashcontaineritemstamp) {
        var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === sel.data.mdashcontaineritemstamp; });
        return item ? item.mdashcontainerstamp : '';
    }
    // Ultimo recurso: se só há um container
    if (window.appState.containers.length === 1) return window.appState.containers[0].mdashcontainerstamp;
    return '';
}

function _clipResolveTargetItem() {
    var sel = _currentSelectedComponent;
    if (!sel) return '';
    if (sel.type === 'containerItem' && sel.stamp) return sel.stamp;
    if (sel.type === 'slot' && sel.data && sel.data.itemStamp) return sel.data.itemStamp;
    if (sel.type === 'object' && sel.data && sel.data.mdashcontaineritemstamp) return sel.data.mdashcontaineritemstamp;
    return '';
}

// ── Visual feedback ────────────────────────────────────────────────────────

function _clipUpdateCopiedVisuals() {
    $('.mdash-clipboard-copied').removeClass('mdash-clipboard-copied');
    var clip = GMDashClipboard;
    if (!clip.sourceStamps.length) return;
    clip.sourceStamps.forEach(function (st) {
        $("[data-stamp='" + st + "']").addClass('mdash-clipboard-copied');
    });
}

// ============================================================================
// MULTI-SELECTION ENGINE — Ctrl+Click, Shift+Click (estilo Windows Explorer)
// ============================================================================

/**
 * Gere a selecção múltipla. Chamado pelos click handlers de container, item e object.
 *
 * @param {string} type      - 'container' | 'containerItem' | 'object'
 * @param {string} stamp     - stamp do elemento clicado
 * @param {object} event     - evento DOM (para ler ctrlKey/metaKey/shiftKey)
 * @param {Array}  orderedList - lista ordenada de stamps do mesmo tipo visíveis (para Shift range)
 * @returns {boolean} true se o click foi tratado como multi-select, false se deve prosseguir com single-select
 */
function mdashHandleMultiSelect(type, stamp, event, orderedList) {
    var ms = GMDashMultiSelection;

    // Tecla Ctrl/Cmd — toggle individual
    if (event.ctrlKey || event.metaKey) {
        if (ms.type && ms.type !== type) {
            // Tipo diferente → limpar e começar nova selecção
            ms.stamps = [];
        }
        ms.type = type;
        var idx = ms.stamps.indexOf(stamp);
        if (idx > -1) {
            ms.stamps.splice(idx, 1);
            if (!ms.stamps.length) { ms.type = ''; ms.anchorStamp = ''; }
        } else {
            ms.stamps.push(stamp);
            ms.anchorStamp = stamp;
        }
        _multiSelUpdateVisuals(type);
        return true;
    }

    // Tecla Shift — range selection
    if (event.shiftKey && ms.anchorStamp && ms.type === type && orderedList && orderedList.length) {
        var anchorIdx = orderedList.indexOf(ms.anchorStamp);
        var currentIdx = orderedList.indexOf(stamp);
        if (anchorIdx === -1 || currentIdx === -1) return false;
        var start = Math.min(anchorIdx, currentIdx);
        var end = Math.max(anchorIdx, currentIdx);
        ms.stamps = orderedList.slice(start, end + 1);
        _multiSelUpdateVisuals(type);
        return true;
    }

    // Click normal sem modificadores → limpar multi-selecção
    if (ms.stamps.length > 0) {
        mdashClearMultiSelection();
    }
    // Definir anchor para futura Shift-selection
    ms.type = type;
    ms.anchorStamp = stamp;
    return false;
}

/**
 * Limpa toda a multi-selecção.
 */
function mdashClearMultiSelection() {
    GMDashMultiSelection.type = '';
    GMDashMultiSelection.stamps = [];
    GMDashMultiSelection.anchorStamp = '';
    _multiSelUpdateVisuals('');
}

/**
 * Actualiza classes CSS de multi-selecção no DOM.
 */
function _multiSelUpdateVisuals(type) {
    // Limpar todas as marcações anteriores
    $('.mdash-multi-selected').removeClass('mdash-multi-selected');
    var ms = GMDashMultiSelection;
    if (!ms.stamps.length) return;

    ms.stamps.forEach(function (st) {
        if (type === 'container') {
            $(".mdash-canvas-container[data-stamp='" + st + "']").addClass('mdash-multi-selected');
            // Sidebar
            $(".mdash-sidebar-item[data-stamp='" + st + "']").addClass('mdash-multi-selected');
        } else if (type === 'containerItem') {
            $(".mdash-canvas-item[data-stamp='" + st + "']").addClass('mdash-multi-selected');
        } else if (type === 'object') {
            $(".mdash-slot-zone-render[data-object-stamp='" + st + "']").addClass('mdash-multi-selected');
        }
    });
}

// ============================================================================
// KEYBOARD SHORTCUTS — Ctrl+C, Ctrl+V, Delete, Escape
// ============================================================================

function _mdashInitKeyboardShortcuts() {
    $(document).off('keydown.mdashclip').on('keydown.mdashclip', function (e) {
        // Ignorar se o foco está num input/textarea/select/editor
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if ($(e.target).closest('.m-editor, .ace_editor, [contenteditable]').length) return;

        // Ctrl+C — Copiar
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            if (!_currentSelectedComponent && !GMDashMultiSelection.stamps.length) return;
            e.preventDefault();
            mdashCopySelection();
            return;
        }

        // Ctrl+V — Colar
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            if (!GMDashClipboard.items.length) return;
            e.preventDefault();
            mdashPasteClipboard();
            return;
        }

        // Ctrl+A — Seleccionar todos do mesmo tipo no contexto
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            if (!_currentSelectedComponent) return;
            var t = _currentSelectedComponent.type;
            if (t !== 'container' && t !== 'containerItem' && t !== 'object') return;
            e.preventDefault();
            _mdashSelectAll(t);
            return;
        }

        // Delete — Eliminar selecção
        if (e.key === 'Delete') {
            if (GMDashMultiSelection.stamps.length > 0) {
                e.preventDefault();
                _mdashDeleteMultiSelection();
                return;
            }
            if (_currentSelectedComponent && _currentSelectedComponent.stamp) {
                var ct = _currentSelectedComponent.type;
                if (ct === 'container') { e.preventDefault(); deleteContainer(_currentSelectedComponent.stamp); }
                if (ct === 'containerItem') { e.preventDefault(); deleteContainerItem(_currentSelectedComponent.stamp); }
            }
            return;
        }

        // Escape — Limpar selecção
        if (e.key === 'Escape') {
            mdashClearMultiSelection();
            return;
        }
    });
}

function _mdashSelectAll(type) {
    var stamps = [];
    if (type === 'container') {
        stamps = window.appState.containers.map(function (c) { return c.mdashcontainerstamp; });
    } else if (type === 'containerItem') {
        // Seleccionar todos os items do container actual
        var cs = _clipResolveTargetContainer();
        if (cs) {
            stamps = window.appState.containerItems
                .filter(function (i) { return i.mdashcontainerstamp === cs; })
                .map(function (i) { return i.mdashcontaineritemstamp; });
        }
    } else if (type === 'object') {
        var is = _clipResolveTargetItem();
        if (is) {
            stamps = window.appState.containerItemObjects
                .filter(function (o) { return o.mdashcontaineritemstamp === is; })
                .map(function (o) { return o.mdashcontaineritemobjectstamp; });
        }
    }
    if (stamps.length) {
        GMDashMultiSelection.type = type;
        GMDashMultiSelection.stamps = stamps;
        _multiSelUpdateVisuals(type);
        var labels = { container: 'containers', containerItem: 'items', object: 'objectos' };
        if (typeof alertify !== 'undefined') alertify.success(stamps.length + ' ' + (labels[type] || '') + ' seleccionados');
    }
}

function _mdashDeleteMultiSelection() {
    var ms = GMDashMultiSelection;
    if (!ms.stamps.length) return;

    var count = ms.stamps.length;
    var labels = { container: 'container(s)', containerItem: 'item(ns)', object: 'objecto(s)' };
    var label = labels[ms.type] || 'elemento(s)';

    showDeleteConfirmation({
        title: 'Eliminar selecção',
        message: 'Tem a certeza que deseja eliminar ' + count + ' ' + label + '?',
        recordToDelete: { table: '', stamp: '', tableKey: '' },
        onConfirm: function () {
            var type = ms.type;
            var stamps = ms.stamps.slice();
            mdashClearMultiSelection();

            stamps.forEach(function (st) {
                if (type === 'container') executeDeleteContainer(st);
                else if (type === 'containerItem') {
                    GMdashDeleteRecords.push({ table: 'MdashContainerItem', stamp: st, tableKey: 'mdashcontaineritemstamp' });
                    var itemsArr = (window.appState && window.appState.containerItems) || GMDashContainerItems;
                    var objsArr = (window.appState && window.appState.containerItemObjects) || GMDashContainerItemObjects;
                    executeDeleteContainerItem(st, itemsArr, objsArr);
                } else if (type === 'object') {
                    var objIdx = window.appState.containerItemObjects.findIndex(function (o) { return o.mdashcontaineritemobjectstamp === st; });
                    if (objIdx > -1) {
                        var obj = window.appState.containerItemObjects[objIdx];
                        GMdashDeleteRecords.push({ table: 'MdashContainerItemObject', stamp: st, tableKey: 'mdashcontaineritemobjectstamp' });
                        window.appState.containerItemObjects.splice(objIdx, 1);
                    }
                }
            });

            if (type === 'containerItem' || type === 'object') {
                setTimeout(function () { renderAllContainerItemTemplates(); }, 50);
            }
            if (typeof alertify !== 'undefined') alertify.success(count + ' ' + label + ' eliminado(s)');
        }
    });
}

// ============================================================================
// CORE ENTITY CONSTRUCTORS (100% Mantidos da versão original)
// ============================================================================

function UIObjectFormConfig(data) {
    this.campo = data.campo || "";
    this.tipo = data.tipo || "";
    this.titulo = data.titulo || "";
    this.classes = data.classes || "";
    this.customData = data.customData || "";
    this.style = data.style || "";
    this.selectValues = data.selectValues || [];
    this.colSize = data.colSize || "4";
    this.fieldToOption = data.fieldToOption || "";
    this.fieldToValue = data.fieldToValue || "";
    this.contentType = data.contentType || "input";
    this.seccao = data.seccao || "Geral";
}

function renderAllContainerItemTemplates() {
    window.appState.containerItems.forEach(function (item) {
        renderContainerItemTemplate(item);
    });
}

function renderContainerItemTemplate(item) {
    if (!item) return;
    var bodySelector = ".mdash-canvas-item[data-stamp='" + item.mdashcontaineritemstamp + "'] .mdash-canvas-item-body";
    var $body = $(bodySelector);
    if (!$body.length) return;

    var template = getTemplateLayoutOptions().find(function (t) { return t.codigo === item.templatelayout; });
    var html = "";

    if (template && typeof template.generateCard === "function") {
        // Carrega CDNs do layout (deduplicated — só carrega novos)
        ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);

        // Renderiza o card real com dados de pré-visualização (cores, icons, título)
        html = template.generateCard({
            title: item.titulo || "Item",
            id: item.mdashcontaineritemstamp,
            tipo: (template.UIData && template.UIData.tipo) || "primary",
            bodyContent: ""
        });
    } else if (template && template.sampleHtml) {
        html = template.sampleHtml;
    } else {
        // fallback simples
        html = '<div class="preview-card">'; 
        html += '  <div class="preview-card-header">' + (item.titulo || "Item sem título") + '</div>';
        html += '  <div class="preview-card-body text-muted">Selecione um layout</div>';
        html += '</div>';
    }

    $body.html(html);

    // Injeta mini drop-zones apenas nos slots de conteúdo
    if (template && template.htmltemplate) {
        injectSlotDropOverlays(item.mdashcontaineritemstamp, template);
    }
}

function MdashConfig(data) {
    data = data || {};
    if (Array.isArray(data)) data = data[0] || {};
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.temfiltro = data.temfiltro || false;
    this.categoria = data.categoria || "";
    this.filtrohorizont = data.filtrohorizont || false;
    this.u_mdashstamp = data.u_mdashstamp || "";
    this.configjson = data.configjson || '{}';
    this.table = 'u_mdash';
    this.idfield = 'u_mdashstamp';
}

MdashConfig.prototype.getConfig = function () {
    try { return JSON.parse(this.configjson || '{}') || {}; } catch (e) { return {}; }
};

MdashConfig.prototype.setConfig = function (cfg) {
    this.configjson = JSON.stringify(cfg || {});
};

function MdashFilter(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashFilters) && GMDashFilters.length > 0) {
        maxOrdem = GMDashFilters.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashfilterstamp = data.mdashfilterstamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "";
    this.descricao = data.descricao || "";
    this.tipo = data.tipo || "text";
    this.tamanho = data.tamanho || 4;
    this.expressaolistagem = data.expressaolistagem || "";
    this.expressaojslistagem = data.expressaojslistagem || "";
    this.eventochange = data.eventochange || false;
    this.expressaochange = data.expressaochange || "";
    this.valordefeito = data.valordefeito || "";
    this.campooption = data.campooption || "";
    this.campovalor = data.campovalor || "";
    this.escopo = data.escopo || 'global';
    this.mdashtabstamp = data.mdashtabstamp || '';
    this.ordem = data.ordem || (maxOrdem + 1);
    this.localsource = "GMDashFilters";
    this.idfield = "mdashfilterstamp";
    this.table = "MdashFilter";
}

function MdashTab(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashTabs) && GMDashTabs.length > 0) {
        maxOrdem = GMDashTabs.reduce(function (max, tab) {
            return Math.max(max, tab.ordem || 0);
        }, 0);
    }

    this.mdashtabstamp = data.mdashtabstamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.titulo = data.titulo || 'Nova Aba';
    this.icone = data.icone || 'glyphicon glyphicon-list-alt';
    this.configjson = data.configjson || '{}';
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = data.inactivo || false;
    this.localsource = 'GMDashTabs';
    this.idfield = 'mdashtabstamp';
    this.table = 'MdashTab';
}

MdashTab.prototype.getConfig = function () {
    try { return JSON.parse(this.configjson || '{}') || {}; } catch (e) { return {}; }
};

MdashTab.prototype.setConfig = function (cfg) {
    this.configjson = JSON.stringify(cfg || {});
};

function getMdashFilterUIObjectFormConfigAndSourceValues() {
    var tabOptions = [{ option: 'Sem tab', value: '' }];
    (GMDashTabs || []).slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); }).forEach(function (t) {
        tabOptions.push({ option: t.titulo || t.mdashtabstamp, value: t.mdashtabstamp });
    });

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "tipo",
            tipo: "select",
            titulo: "Tipo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: [
                { option: "Texto", value: "text" },
                { option: "Radio", value: "radio" },
                { option: "Lógico", value: "logic" },
                { option: "Data", value: "date" },
                { option: "Número", value: "number" },
                { option: "Lista", value: "list" },
                { option: "Multipla escolha", value: "multiselect" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "escopo",
            tipo: "select",
            titulo: "Escopo",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: [
                { option: "Global", value: "global" },
                { option: "Por tab", value: "tab" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 6,
            campo: "mdashtabstamp",
            tipo: "select",
            titulo: "Separador",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: tabOptions
        }),
        new UIObjectFormConfig({ colSize: 6, campo: "campooption", tipo: "text", titulo: "Campo de Opção", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "campovalor", tipo: "text", titulo: "Campo de Valor", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaojslistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Listagem JS", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "valordefeito", tipo: "div", cols: 90, rows: 90, titulo: "Valor por Defeito", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 4, campo: "eventochange", tipo: "checkbox", titulo: "Tem evento change", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaochange", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de Change", classes: "input-source-form m-editor", contentType: "div" }),
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashFilters", idField: "mdashfilterstamp" };
}

function MdashContainer(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainers) && GMDashContainers.length > 0) {
        maxOrdem = GMDashContainers.reduce(function (max, container) {
            return Math.max(max, container.ordem || 0);
        }, 0);
    }

    this.mdashcontainerstamp = data.mdashcontainerstamp || generateUUID();
    this.codigo = data.codigo || "";
    this.titulo = data.titulo || "";
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 12;
    this.layoutmode = data.layoutmode || "auto"; // auto | manual (padrão: manual)
    this.ordem = data.ordem || (maxOrdem + 1);
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.mdashtabstamp = data.mdashtabstamp || '';
    this.localsource = "GMDashContainers";
    this.idfield = "mdashcontainerstamp";
    this.table = "MdashContainer";
    this.inactivo = data.inactivo || false;
}

function MdashContainerItem(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItems) && GMDashContainerItems.length > 0) {
        maxOrdem = GMDashContainerItems.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemstamp = data.mdashcontaineritemstamp || generateUUID();
    this.mdashcontainerstamp = data.mdashcontainerstamp || "";
    this.codigo = data.codigo || "";
    this.titulo = data.titulo || "";
    this.tipo = data.tipo || "";
    this.inactivo = data.inactivo || false;
    this.tamanho = data.tamanho || 4;
    this.layoutmode = data.layoutmode || "inherit"; // inherit | auto | manual
    this.gridrow = data.gridrow !== undefined && data.gridrow !== null && data.gridrow !== "" ? parseInt(data.gridrow, 10) : null;
    this.gridcolstart = data.gridcolstart !== undefined && data.gridcolstart !== null && data.gridcolstart !== "" ? parseInt(data.gridcolstart, 10) : null;
    this.gridrowspan = data.gridrowspan !== undefined && data.gridrowspan !== null && data.gridrowspan !== "" ? parseInt(data.gridrowspan, 10) : 1;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.templatelayout = data.templatelayout || getDefaultTemplateCodigo();  // IMPORTANTE: template do layout
    this.layoutcontaineritemdefault = data.layoutcontaineritemdefault || true;
    this.expressaolayoutcontaineritem = data.expressaolayoutcontaineritem || "";
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.fontelocal = data.fontelocal || false;
    this.urlfetch = data.urlfetch || "../programs/gensel.aspx?cscript=getdbcontaineritemdata";
    this.expressaodblistagem = data.expressaodblistagem || "";
    this.expressaoapresentacaodados = data.expressaoapresentacaodados || "";
    this.filters = data.filters || [];
    this.records = data.records || [];
    this.dadosTemplate = data.dadosTemplate || {};
    // ── Configuração dos slots (JSON persistido na BD) ──
    this.slotsconfigjson = data.slotsconfigjson || '[]';
    this.slotsconfig = []; // array de MdashSlot — preenchido pelo initSlotsConfig()
    this.localsource = "GMDashContainerItems";
    this.idfield = "mdashcontaineritemstamp";
    this.table = "MdashContainerItem";

    // Inicializar slots a partir do JSON persistido
    this.initSlotsConfig();
}

/**
 * Inicializa this.slotsconfig a partir do JSON persistido.
 * Merge com a definição do template (garante que novos slots do layout são adicionados).
 */
MdashContainerItem.prototype.initSlotsConfig = function () {
    var saved = forceJSONParse(this.slotsconfigjson, []);
    var savedMap = {};
    saved.forEach(function (s) { savedMap[s.id] = s; });

    // Obter definição de slots do template actual
    var template = getTemplateLayoutByCode(this.templatelayout);
    var templateSlots = template ? (template.slots || forceJSONParse(template.slotsdefinition, [])) : [];

    var result = [];
    templateSlots.forEach(function (tplSlot) {
        var merged = savedMap[tplSlot.id]
            ? Object.assign({}, tplSlot, savedMap[tplSlot.id])  // persistido sobrepõe template
            : Object.assign({}, tplSlot);
        result.push(new MdashSlot(merged));
        delete savedMap[tplSlot.id]; // marcar como processado
    });

    // Slots extra que existem no JSON mas não no template (custom layouts antigos, etc.)
    Object.keys(savedMap).forEach(function (key) {
        result.push(new MdashSlot(savedMap[key]));
    });

    this.slotsconfig = result;
};

/**
 * Devolve o MdashSlot com o id indicado, ou null.
 */
MdashContainerItem.prototype.getSlot = function (slotId) {
    return this.slotsconfig.find(function (s) { return s.id === slotId; }) || null;
};

/**
 * Actualiza a config de um slot e persiste.
 */
MdashContainerItem.prototype.updateSlotConfig = function (slotId, newConfig) {
    var slot = this.getSlot(slotId);
    if (!slot) return;
    slot.config = Object.assign({}, slot.config, newConfig);
    this.stringifySlotsConfig();
};

/**
 * Serializa slotsconfig para JSON (para persistência na BD).
 */
MdashContainerItem.prototype.stringifySlotsConfig = function () {
    this.slotsconfigjson = JSON.stringify(this.slotsconfig.map(function (s) { return s.toJSON(); }));
};

// UI config do Container (herdado da versão original)
function getContainerUIObjectFormConfigAndSourceValues() {
    var objectsUIFormConfig = [
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 6, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 6, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 6, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 6, campo: "layoutmode", tipo: "select", titulo: "Modo de Layout (Container)", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: [{ option: "Auto", value: "auto" }, { option: "Manual", value: "manual" }] })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainers", idField: "mdashcontainerstamp" };
}

// UI config do ContainerItem (herdado da versão original)
function getContainerItemUIObjectFormConfigAndSourceValues() {
    // opções de layout para o select
    var templateOptions = getTemplateLayoutOptions().map(function (tpl) {
        return { option: tpl.descricao || tpl.codigo, value: tpl.codigo };
    });

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 4, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 12, campo: "ordem", tipo: "text", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 4, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Identidade", colSize: 4, campo: "titulo", tipo: "text", titulo: "Título", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 6, campo: "tamanho", tipo: "digit", titulo: "Tamanho", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 6, campo: "layoutmode", tipo: "select", titulo: "Modo de Layout (Override)", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: [{ option: "Herdar do Container", value: "inherit" }, { option: "Auto", value: "auto" }, { option: "Manual", value: "manual" }] }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 4, campo: "gridrow", tipo: "digit", titulo: "Linha (gridrow)", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 4, campo: "gridcolstart", tipo: "digit", titulo: "Coluna Inicial", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 6, campo: "templatelayout", tipo: "select", titulo: "Layout", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: templateOptions }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 4, campo: "layoutcontaineritemdefault", tipo: "checkbox", titulo: "Usa layout default para item do container", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Layout", colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaolayoutcontaineritem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de layout do item do container", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ seccao: "Dados", colSize: 12, campo: "urlfetch", tipo: "text", titulo: "URL de Fetch", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ seccao: "Dados", colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaodblistagem", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de DB Listagem", classes: "m-editor input-source-form", contentType: "div" }),
        new UIObjectFormConfig({ seccao: "Dados", colSize: 12, style: "width: 100%; height: 200px;", campo: "expressaoapresentacaodados", tipo: "div", cols: 90, rows: 90, titulo: "Expressão de apresentação de dados", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ seccao: "Dados", colSize: 12, campo: "fontelocal", tipo: "checkbox", titulo: "Fonte local", classes: "input-source-form", contentType: "input" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainerItems", idField: "mdashcontaineritemstamp" };
}

MdashContainerItem.prototype.renderLayout = function (container, cleanContainer) {
    var self = this;
    var listaTemplates = getTemplateLayoutOptions();
    var selectedTemplate = listaTemplates.find(function (template) {
        return template.codigo === self.templatelayout;
    });

    if (selectedTemplate) {
        self.dadosTemplate = selectedTemplate;

        // Carrega CDNs do layout (deduplicated — reutiliza os já carregados)
        ensureMdashCDNsLoaded(selectedTemplate.cssCdnsList, selectedTemplate.jsCdnsList);

        if (cleanContainer) {
            $(container).empty();
        }

        $(container).append(selectedTemplate.generateCard({
            title: self.titulo,
            id: self.mdashcontaineritemstamp,
            tipo: selectedTemplate.UIData.tipo || "primary",
            bodyContent: "Sem conteúdo",
        }));

        self.refreshContainerItem("");
    }
}

MdashContainerItem.prototype.refreshContainerItem = function (masterContent) {
    if (!masterContent) return;

    var dadosTemplate = this.dadosTemplate;
    if (!dadosTemplate.containerSelectorToRender) {
        console.warn("Container selector to render is not defined in the template data.");
        return;
    }

    var self = this;
    var containerItemObjects = GMDashContainerItemObjects.filter(function (obj) {
        return obj.mdashcontaineritemstamp === self.mdashcontaineritemstamp;
    });

    containerItemObjects.forEach(function (itemObject) {
        var concatenatedMasterContent = ".container-item-object-render-" + itemObject.mdashcontaineritemobjectstamp + " " + dadosTemplate.containerSelectorToRender;
        $(concatenatedMasterContent).empty();
        itemObject.renderObjectByContainerItem(concatenatedMasterContent, self);
    });
}

function MdashContainerItemObject(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItemObjects) && GMDashContainerItemObjects.length > 0) {
        maxOrdem = GMDashContainerItemObjects.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemobjectstamp = data.mdashcontaineritemobjectstamp || generateUUID();
    this.mdashcontaineritemstamp = data.mdashcontaineritemstamp || "";
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.tipo = data.tipo || "";
    this.tamanho = data.tamanho || 0;
    this.ordem = data.ordem || (maxOrdem + 1);
    this.expressaoobjecto = data.expressaoobjecto || "";
    this.temdetalhes = data.temdetalhes || false;
    this.detalhesqueryconfigjson = data.detalhesqueryconfigjson || "";
    this.tipoobjectodetalhes = data.tipoobjectodetalhes || "";
    this.titulodetalhes = data.titulodetalhes || "";
    this.titulobtndetalhes = data.titulobtndetalhes || "";
    this.categoria = data.categoria || "editor";
    this.tipoquery = data.tipoquery || "item";
    this.slotid = data.slotid || "";
    this.objectexpressaodblistagem = data.objectexpressaodblistagem || "";
    this.fontestamp = data.fontestamp || "";          // vínculo directo à fonte de dados
    this.fontesstampsjson = data.fontesstampsjson || '';   // fontes adicionais (array JSON de stamps)
    this.fontesstamps = forceJSONParse(data.fontesstampsjson, []);
    this.processaFonte = data.processaFonte !== undefined ? data.processaFonte : true;  // false = objecto estático (não precisa de dados)
    this.localsource = "GMDashContainerItemObjects";

    var config = {};
    if (data.configjson) {
        try {
            config = JSON.parse(data.configjson);
        } catch (error) {
            console.error("Erro ao analisar configjson:", error);
        }
    }

    this.config = config || {};
    this.configjson = data.configjson || "";
    // transformConfig — coluna própria na BD, com migração automática do configjson legado
    this.transformconfigjson = data.transformconfigjson || '';
    this.transformConfig = data.transformconfigjson
        ? forceJSONParse(data.transformconfigjson, null)
        : ((this.config && this.config.transformConfig) || null);
    if (this.transformConfig && !data.transformconfigjson && this.config && this.config.transformConfig) {
        // migrar: retirar transformConfig do configjson e colocar na coluna própria
        delete this.config.transformConfig;
        this.configjson = JSON.stringify(this.config);
        this.transformconfigjson = JSON.stringify(this.transformConfig);
    }
    this.idfield = "mdashcontaineritemobjectstamp";
    this.table = "MdashContainerItemObject";
    this.objectoConfig = data.objectoConfig || {};
    // Nota: objectoConfig é resolvido de forma lazy via resolveObjectoConfig()
    // quando renderObject for chamado — nunca no construtor.

    var queryConfig = {
        selectFields: [],
        filters: [],
        groupBy: [],
        orderBy: { field: "", direction: "ASC" },
        limit: null,
        generatedSQL: "",
        lastResult: []
    };

    if (data.queryconfigjson) {
        try {
            queryConfig = JSON.parse(data.queryconfigjson);
        } catch (error) {
            console.error("Erro ao analisar queryconfigjson:", error);
        }
    }

    this.queryConfig = queryConfig;
    this.queryconfigjson = JSON.stringify(queryConfig);
}

/**
 * Serializa os campos JSON de MdashContainerItemObject antes de gravar na BD.
 * Deve ser chamado antes de qualquer realTimeComponentSync neste objecto.
 */
MdashContainerItemObject.prototype.stringifyJSONFields = function () {
    this.transformconfigjson = JSON.stringify(this.transformConfig || null);
    this.fontesstampsjson    = JSON.stringify(this.fontesstamps || []);
    this.configjson          = JSON.stringify(this.config || {});
};

/**
 * getMdashObjectTypeEntry(tipo)
 * Função utilitária pura — nunca guarda nada em propriedades reactivas.
 * Devolve a entrada de getTiposObjectoConfig() para o tipo indicado, ou null.
 * Pode ser chamada a qualquer momento, mesmo antes da extensão estar carregada
 * (devolve null nesse caso).
 */
function getMdashObjectTypeEntry(tipo) {
    if (!tipo) return null;
    var tipoStr = '' + tipo;

    // Normalização de nomes legados (valores guardados em BD com nomes Portugueses)
    var _legacy = { 'gráfico': 'chart', 'grafico': 'chart', 'pie': 'pie', 'pizza': 'pie',
                    'tabela': 'table', 'texto': 'text', 'customcode': 'customCode',
                    'detail': 'detail', 'detalhe': 'detail' };
    var normalized = _legacy[tipoStr.toLowerCase()];
    if (normalized) tipoStr = normalized;

    if (typeof getTiposObjectoConfig !== 'function') {
        console.error('[MDash DEBUG] getMdashObjectTypeEntry: getTiposObjectoConfig NÃO EXISTE — a extensão não está carregada. tipo="' + tipoStr + '"');
        return null;
    }
    var allTypes = getTiposObjectoConfig();
    var entry = allTypes.find(function (t) { return t.tipo === tipoStr; }) || null;
    if (!entry) {
        console.error('[MDash DEBUG] getMdashObjectTypeEntry: tipo="' + tipoStr + '" NÃO ENCONTRADO. Tipos registados: [' + allTypes.map(function(t){ return t.tipo; }).join(', ') + ']');
    }
    return entry;
}

/**
 * getMdashObjectProcessaFonte(tipo, dataProcessaFonte)
 * Devolve o valor correcto de processaFonte para um tipo de objecto.
 * O tipo tem precedência sobre o default guardado em base de dados,
 * a menos que `dataProcessaFonte` tenha sido explicitamente guardado (BD).
 */
function getMdashObjectProcessaFonte(tipo, dataProcessaFonte) {
    var entry = getMdashObjectTypeEntry(tipo);
    if (entry && entry.processaFonte !== undefined) {
        return entry.processaFonte;
    }
    return dataProcessaFonte !== undefined ? dataProcessaFonte : true;
}

/**
 * resolveObjectoConfig()
 * Mantido para compatibilidade e para resolver processaFonte na instância
 * quando esta não vem da BD. NÃO guarda objectoConfig na instância — a lookup
 * é feita sempre via getMdashObjectTypeEntry() em tempo de render para evitar
 * problemas com o sistema reactivo PetiteVue (o proxy Vue não preserva funções
 * em propriedades de objectos nested de forma fiável).
 */
MdashContainerItemObject.prototype.resolveObjectoConfig = function () {
    if (!this.tipo) return;
    // Resolve processaFonte se ainda não foi resolvido a partir do tipo
    if (this.processaFonte === true && !this._processaFonteFromDB) {
        var entry = getMdashObjectTypeEntry(this.tipo);
        if (entry && entry.processaFonte !== undefined) {
            this.processaFonte = entry.processaFonte;
        }
    }
};

MdashContainerItemObject.prototype.renderObjectByContainerItem = function (containerSelector, containerItem) {
    var self = this;

    var tipoStr = '' + (self.tipo || '');
   
    var entry = getMdashObjectTypeEntry(tipoStr);
 

    if (entry && typeof entry.renderObject === 'function') {
        var processaFonte = (entry.processaFonte !== undefined) ? entry.processaFonte : self.processaFonte;
        // Resolver dados através da função central (transform → fonte → containerItem.records)
        var resolved = mdashResolveObjectData(self, containerItem.records);
        var podeRenderizar = processaFonte === false || resolved.data.length > 0;
       // console.log('  processaFonte =', processaFonte, '| podeRenderizar =', podeRenderizar, '| data.length =', resolved.data.length);
        if (podeRenderizar) {
           
            console.groupEnd();
            entry.renderObject({
                containerSelector: containerSelector,
                itemObject: self,
                queryConfig: self.queryConfig,
                config: self.config,
                transformConfig: self.transformConfig,
                containerItem: containerItem,
                data: resolved.data,
                isSample: resolved.isSample
            });
        } else if (typeof entry.getSampleData === 'function') {
            // Sem dados reais ainda — renderizar com dados de amostra
           
            entry.renderObject({
                containerSelector: containerSelector,
                itemObject: self,
                queryConfig: self.queryConfig,
                config: self.config,
                transformConfig: self.transformConfig,
                containerItem: containerItem,
                data: entry.getSampleData(),
                isSample: true
            });
        } else {
         
            $(containerSelector).html(
                '<div class="mdash-slot-zone-render-placeholder"><i class="' + (getObjectTypeIcon(tipoStr) || 'glyphicon glyphicon-stop') + '"></i> ' + (tipoStr || 'Objecto') + '</div>'
            );
        }
    } else {
        console.error('  → WARNING ICON — entry null ou sem renderObject');
        console.groupEnd();
        $(containerSelector).html(
            '<div class="mdash-slot-zone-render-placeholder" style="color:#c0392b;"><i class="glyphicon glyphicon-warning-sign"></i> ' + (tipoStr || '?') + '</div>'
        );
    }

    if (self.expressaoobjecto) {
        try {
            eval(self.expressaoobjecto);
        } catch (error) {
            console.error("Erro ao executar expressão do objeto:", error);
        }
    }
}

// ============================================================================
// mdashResolveObjectData
// Função central de resolução de dados para qualquer MdashContainerItemObject.
// Hierarquia:
//   1. obj.transformConfig + sourceTable  → MdashTransformBuilder.executeRaw()
//      (garante tabelas adicionais de fontesstamps em SQLite antes de correr)
//   2. obj.fontestamp                     → fonte.lastResults (dados em memória)
//   3. fallbackData                       → containerItem.records (legado)
// Retorna: { data: Array, isSample: Boolean }
// ============================================================================
function mdashResolveObjectData(obj, fallbackData) {
    var allFontes = (window.appState && window.appState.fontes) || GMDashFontes || [];

    // ── 1. Garantir que fontes adicionais (fontesstamps) estão no SQLite ──
    if (obj && Array.isArray(obj.fontesstamps) && obj.fontesstamps.length > 0) {
        obj.fontesstamps.forEach(function (stamp) {
            var f = allFontes.filter(function (x) { return x.mdashfontestamp === stamp; })[0];
            if (f && f.lastResults && f.lastResults.length > 0 && typeof mdashLoadFonteIntoDb === 'function') {
                mdashLoadFonteIntoDb(f, f.lastResults);
            }
        });
    }

    // ── 2. transformConfig → query sobre SQLite in-memory ──
    if (obj && obj.transformConfig && obj.transformConfig.sourceTable &&
            typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(obj.transformConfig);
            if (!raw.error && raw.rows && raw.columns && raw.rows.length > 0) {
                var rows = raw.rows.map(function (r) {
                    var o = {};
                    raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                    return o;
                });
                return { data: rows, isSample: false };
            }
        } catch (e) {
            console.warn('[MDash] mdashResolveObjectData: erro no transform —', e.message);
        }
    }

    // ── 3. Fonte primária → lastResults em memória ──
    if (obj && obj.fontestamp) {
        var fonte = allFontes.filter(function (f) { return f.mdashfontestamp === obj.fontestamp; })[0];
        if (fonte && fonte.lastResults && fonte.lastResults.length > 0) {
            return { data: fonte.lastResults, isSample: false };
        }
    }

    // ── 4. Fallback legado (containerItem.records) ──
    var fd = fallbackData || [];
    return { data: fd, isSample: false };
}

// ============================================================================
// MDashFonte v2 - Fontes de dados generalizadas com scope hierárquico
// scope: 'global' | 'container' | 'containeritem' | 'object'
// tipo:  'directquery' | 'javascript' | 'api' | 'stored'
// ============================================================================
function MDashFonte(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashFontes) && GMDashFontes.length > 0) {
        maxOrdem = GMDashFontes.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    // ── Identidade ──
    this.mdashfontestamp = data.mdashfontestamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "Fonte" + gerarIdNumerico();
    this.descricao = data.descricao || 'Nova Fonte ' + (data.ordem || (maxOrdem + 1));
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = data.inactivo || false;

    // ── Scope: a quem pertence esta fonte ──
    this.scope = data.scope || 'global';           // 'global' | 'container' | 'containeritem' | 'object'
    this.scopestamp = data.scopestamp || '';         // stamp do owner (vazio = global)

    // ── Tipo de fonte ──
    this.tipo = data.tipo || 'directquery';         // 'directquery' | 'javascript' | 'api' | 'stored'

    // ── DirectQuery ──
    this.expressaolistagem = data.expressaolistagem || '';
    this.urlfetch = data.urlfetch || '../programs/gensel.aspx?cscript=getdbcontaineritemdata';

    // ── JavaScript ──
    this.expressaojslistagem = data.expressaojslistagem || '';

    // ── API (preparado para futuro) ──
    this.apiurl = data.apiurl || '';
    this.apimethod = data.apimethod || 'GET';
    this.apiheadersjson = data.apiheadersjson || '{}';
    this.apibodyjson = data.apibodyjson || '{}';

    // ── Schema ──
    this.schemamode = data.schemamode || 'auto';    // 'auto' | 'manual'
    this.schemajson = data.schemajson || '[]';
    this.schema = forceJSONParse(this.schemajson, []);

    // ── Parâmetros dinâmicos ──
    this.parametrosjson = data.parametrosjson || '[]';
    this.parametros = forceJSONParse(this.parametrosjson, []);

    // ── Refresh ──
    this.refreshmode = data.refreshmode || 'onload';  // 'onload' | 'onfilterchange' | 'manual' | 'interval'
    this.refreshintervalsec = data.refreshintervalsec || 0;

    // ── Cache/Resultados ──
    this.lastResultscached = data.lastResultscached || '[]';
    this.lastResults = forceJSONParse(this.lastResultscached, []);
    this.lastexecuted = data.lastexecuted || null;

    // ── Runtime (não persistido) ──
    this.apiheaders = forceJSONParse(this.apiheadersjson, {});
    this.apibody = forceJSONParse(this.apibodyjson, {});
    this.status = 'idle';                           // 'idle' | 'loading' | 'loaded' | 'error'
    this.errorMessage = '';

    // ── Metadata CRUD ──
    this.localsource = "GMDashFontes";
    this.idfield = "mdashfontestamp";
    this.table = "MDashFonte";
}

/**
 * Serializa todos os campos JSON para persistência na BD.
 */
MDashFonte.prototype.stringifyJSONFields = function () {
    this.schemajson = JSON.stringify(this.schema || []);
    this.lastResultscached = JSON.stringify(this.lastResults || []);
    this.parametrosjson = JSON.stringify(this.parametros || []);
    this.apiheadersjson = JSON.stringify(this.apiheaders || {});
    this.apibodyjson = JSON.stringify(this.apibody || {});
    return this;
}

/**
 * Devolve apenas os campos que existem na tabela MDashFonte no SQL Server.
 * Usar sempre que se chama realTimeComponentSync para evitar que propriedades
 * de runtime (lastResults, schema, apiheaders, apibody, parametros, status,
 * errorMessage) cheguem ao backend e causem erros de conversão de tipos.
 */
MDashFonte.prototype.toDbRecord = function () {
    return {
        mdashfontestamp:       this.mdashfontestamp,
        dashboardstamp:        this.dashboardstamp,
        codigo:                this.codigo,
        descricao:             this.descricao,
        ordem:                 this.ordem,
        inactivo:              this.inactivo ? 1 : 0,
        scope:                 this.scope,
        scopestamp:            this.scopestamp,
        tipo:                  this.tipo,
        expressaolistagem:     this.expressaolistagem,
        urlfetch:              this.urlfetch,
        expressaojslistagem:   this.expressaojslistagem,
        apiurl:                this.apiurl,
        apimethod:             this.apimethod,
        apiheadersjson:        this.apiheadersjson,
        apibodyjson:           this.apibodyjson,
        schemamode:            this.schemamode,
        schemajson:            this.schemajson,
        parametrosjson:        this.parametrosjson,
        refreshmode:           this.refreshmode,
        refreshintervalsec:    this.refreshintervalsec,
        lastResultscached:     this.lastResultscached,
        lastexecuted:          (function (d) {
            if (!d) return null;
            var s = String(d);
            // /Date(ms)/ format (ASP.NET JSON)
            var m = s.match(/\/Date\((-?\d+)/);
            if (m) return new Date(parseInt(m[1], 10)).toISOString().slice(0, 19).replace('T', ' ');
            // ISO 8601 or "YYYY-MM-DD HH:mm:ss" — normalise to SQL Server format
            if (s.length >= 19) return s.slice(0, 19).replace('T', ' ');
            return null;
        })(this.lastexecuted)
    };
}

/**
 * Extrai automaticamente o schema a partir dos últimos resultados.
 * Retorna array de { field, type, label }.
 */
MDashFonte.prototype.extractSchemaFromResults = function () {
    if (!Array.isArray(this.lastResults) || this.lastResults.length === 0) return [];
    var firstRow = this.lastResults[0];
    var schema = [];
    Object.keys(firstRow).forEach(function (key) {
        var val = firstRow[key];
        var type = 'string';
        if (typeof val === 'number') type = 'number';
        else if (typeof val === 'boolean') type = 'boolean';
        else if (val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)) && /^\d{4}-\d{2}-\d{2}/.test(val))) type = 'date';
        schema.push({ field: key, type: type, label: key });
    });
    return schema;
}

/**
 * Executa a fonte. Delega no MdashExecutorRegistry (DATA SOURCE Operations.js).
 * Garante que o método existe mesmo que DATA SOURCE Operations.js ainda não tenha sido carregado.
 */
MDashFonte.prototype.execute = function (context, callback) {
    var self = this;
    context = context || {};

    // Se o registry já foi carregado, delega nele (DATA SOURCE Operations.js)
    if (typeof MdashExecutorRegistry !== 'undefined') {
        var handler = MdashExecutorRegistry.getHandler(self.tipo);
        if (handler) {
            self.status = 'loading';
            self.errorMessage = '';
            handler.execute(self, context, function (err, rows) {
                if (err) {
                    self.status = 'error';
                    self.errorMessage = err.message || String(err);
                    console.error('[MDashFonte] Erro na fonte "' + self.codigo + '":', err);
                    if (typeof callback === 'function') callback(err, null);
                    return;
                }
                self.lastResults  = Array.isArray(rows) ? rows : [];
                self.lastexecuted = new Date().toISOString().slice(0, 19).replace('T', ' ');
                self.status       = 'loaded';
                if (self.schemamode === 'auto' && self.lastResults.length > 0) {
                    self.schema = self.extractSchemaFromResults();
                }
                if (self.lastResults.length > 0 && typeof mdashLoadFonteIntoDb === 'function') {
                    mdashLoadFonteIntoDb(self, self.lastResults);
                }
                if (typeof callback === 'function') callback(null, self.lastResults);
            });
            return;
        }
    }

    // Fallback: directquery via AJAX (caso DATA SOURCE Operations.js não esteja carregado)
    self.status = 'loading';
    self.errorMessage = '';
    var expression = self.expressaolistagem || '';
    if (typeof resolveExpressionTokens === 'function') {
        expression = resolveExpressionTokens(expression, self.parametros, context.parameters);
    }
    $.ajax({
        type: 'POST',
        url: '../programs/gensel.aspx?cscript=executeexpressaolistagemdb',
        async: true,
        data: { '__EVENTARGUMENT': JSON.stringify([{ expressaodblistagem: expression, filters: {} }]) },
        success: function (response) {
            if (response && response.cod === '0000') {
                self.lastResults  = response.data || [];
                self.lastexecuted = new Date().toISOString().slice(0, 19).replace('T', ' ');
                self.status       = 'loaded';
                if (typeof callback === 'function') callback(null, self.lastResults);
            } else {
                self.status = 'error';
                self.errorMessage = (response && response.message) || 'Resposta inválida';
                if (typeof callback === 'function') callback(new Error(self.errorMessage), null);
            }
        },
        error: function (xhr, status, error) {
            self.status = 'error';
            self.errorMessage = 'AJAX error: ' + (error || status);
            if (typeof callback === 'function') callback(new Error(self.errorMessage), null);
        }
    });
};

/**
 * Devolve as fontes visíveis para um determinado scope (herança em cascata).
 * Um Object vê: fontes do object + containeritem + container + global
 * Um ContainerItem vê: fontes do containeritem + container + global
 * Um Container vê: fontes do container + global
 * @param {string} scopeType - 'object' | 'containeritem' | 'container' | 'global'
 * @param {string} scopeStamp - stamp da entidade
 * @param {string} [parentContainerItemStamp] - stamp do containerItem pai (para objects)
 * @param {string} [parentContainerStamp] - stamp do container pai
 * @returns {MDashFonte[]} array de fontes acessíveis
 */
MDashFonte.getAvailableFontes = function (scopeType, scopeStamp, parentContainerItemStamp, parentContainerStamp) {
    var fontes = window.appState ? window.appState.fontes : GMDashFontes;
    return fontes.filter(function (f) {
        if (f.inactivo) return false;
        // Globais são sempre visíveis
        if (f.scope === 'global') return true;
        // Fontes do próprio scope
        if (f.scope === scopeType && f.scopestamp === scopeStamp) return true;
        // Herança: object herda de containeritem e container
        if (scopeType === 'object') {
            if (f.scope === 'containeritem' && f.scopestamp === parentContainerItemStamp) return true;
            if (f.scope === 'container' && f.scopestamp === parentContainerStamp) return true;
        }
        // Herança: containeritem herda de container
        if (scopeType === 'containeritem') {
            if (f.scope === 'container' && f.scopestamp === parentContainerStamp) return true;
        }
        return false;
    });
}

/**
 * Devolve as fontes globais do dashboard (para a sidebar).
 * @returns {MDashFonte[]}
 */
MDashFonte.getGlobalFontes = function () {
    var fontes = window.appState ? window.appState.fontes : GMDashFontes;
    return fontes.filter(function (f) { return f.scope === 'global'; });
}

// ============================================================================
// MdashSlot - Instância de slot de um ContainerItem (runtime + persistência)
// ============================================================================
// Cada ContainerItem armazena um array JSON `slotsconfig` com a config dos
// seus slots. MdashSlot é a representação em memória de cada slot.
// Propriedades: id, label, type + config editável pelo utilizador.

function MdashSlot(data) {
    this.id = data.id || "";                       // identificador do slot (ex: "body", "header")
    this.label = data.label || data.id || "";       // nome amigável
    this.type = data.type || "content";             // "text" | "icon" | "content" | "html"
    this.isMainContent = data.isMainContent || false;

    // ── Propriedades editáveis pelo utilizador ──
    this.config = data.config || {};
    // config pode conter: { cssClass, inlineStyle, minHeight, maxHeight, overflow, background, padding, hidden }
}

/**
 * Devolve as propriedades editáveis e os seus defaults.
 * Usado para gerar o formulário de propriedades do slot.
 */
MdashSlot.getEditableProperties = function () {
    return [
        { field: "cssClass",    title: "Classes CSS",      type: "text",     defaultValue: "" },
        { field: "inlineStyle", title: "Estilo Inline",    type: "text",     defaultValue: "" },
        { field: "minHeight",   title: "Altura Mínima",    type: "text",     defaultValue: "" },
        { field: "maxHeight",   title: "Altura Máxima",    type: "text",     defaultValue: "" },
        { field: "overflow",    title: "Overflow",         type: "select",   defaultValue: "visible", options: ["visible", "hidden", "auto", "scroll"] },
        { field: "background",  title: "Fundo",            type: "color",    defaultValue: "" },
        { field: "padding",     title: "Padding",          type: "text",     defaultValue: "" }
    ];
};

MdashSlot.prototype.toJSON = function () {
    return {
        id: this.id,
        label: this.label,
        type: this.type,
        isMainContent: this.isMainContent,
        config: this.config
    };
};

/**
 * Aplica estilos inline ao elemento DOM do slot (data-mdash-slot).
 */
MdashSlot.prototype.applyToElement = function ($el) {
    if (!$el || !$el.length) return;
    var c = this.config || {};
    if (c.cssClass)    $el.addClass(c.cssClass);
    if (c.inlineStyle) $el.attr('style', ($el.attr('style') || '') + ';' + c.inlineStyle);
    if (c.minHeight)   $el.css('min-height', c.minHeight);
    if (c.maxHeight)   $el.css('max-height', c.maxHeight);
    if (c.overflow)    $el.css('overflow', c.overflow);
    if (c.background)  $el.css('background', c.background);
    if (c.padding)     $el.css('padding', c.padding);
};

// ============================================================================
// MdashContainerItemLayout - Layouts reutilizáveis para cards
// ============================================================================

function MdashContainerItemLayout(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashContainerItemLayouts) && GMDashContainerItemLayouts.length > 0) {
        maxOrdem = GMDashContainerItemLayouts.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashcontaineritemlayoutstamp = data.mdashcontaineritemlayoutstamp || generateUUID();
    this.codigo = data.codigo || "Layout" + gerarIdNumerico();
    this.descricao = data.descricao || 'Novo Layout ' + (data.ordem || (maxOrdem + 1));
    this.layoutsystem = data.layoutsystem || 'HBF';
    this.htmltemplate = data.htmltemplate || '';
    this.csstemplate = data.csstemplate || '';
    this.jstemplate = data.jstemplate || '';
    this.slotsdefinition = data.slotsdefinition || '[]';
    this.iconcdn = data.iconcdn || '';
    this.jscdns = data.jscdns || '[]';
    this.csscdns = data.csscdns || '[]';
    this.thumbnail = data.thumbnail || '';
    this.ispublic = data.ispublic !== undefined ? data.ispublic : true;
    this.versao = data.versao || 1;
    this.categoria = data.categoria || '';
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = data.inactivo || false;

    // Parsed JSON fields (in-memory only)
    this.slots = forceJSONParse(this.slotsdefinition, []);
    this.jsCdnsList = forceJSONParse(this.jscdns, []);
    this.cssCdnsList = forceJSONParse(this.csscdns, []);

    // Metadata for CRUD operations
    this.localsource = "GMDashContainerItemLayouts";
    this.idfield = "mdashcontaineritemlayoutstamp";
    this.table = "MdashContainerItemLayout";
}

MdashContainerItemLayout.prototype.stringifyJSONFields = function () {
    this.slotsdefinition = JSON.stringify(this.slots || []);
    this.jscdns = JSON.stringify(this.jsCdnsList || []);
    this.csscdns = JSON.stringify(this.cssCdnsList || []);
    return this;
}

/**
 * Gera o HTML completo do layout com CSS scoped e JS injectados
 * Usado para pré-visualização no builder e renderização no dashboard
 */
MdashContainerItemLayout.prototype.renderPreview = function (containerSelector) {
    var scopeId = 'lb_' + this.mdashcontaineritemlayoutstamp;
    var html = '';
    if (this.csstemplate) {
        html += '<style>' + scopeLayoutCSS(this.csstemplate, scopeId) + '</style>';
    }
    html += '<div data-mdash-scope="' + scopeId + '">';
    html += this.htmltemplate || '<div class="text-muted text-center p-3">Sem template HTML definido</div>';
    html += '</div>';
    
    if (containerSelector) {
        $(containerSelector).html(html);
        // Execute JS template in context
        if (this.jstemplate) {
            try { eval(this.jstemplate); } catch (e) { console.error("Erro no JS do layout:", e); }
        }
    }
    return html;
}

/**
 * Retorna este layout como template option compatível com o sistema unificado.
 * Usa renderUnifiedLayout() — o mesmo pipeline de defaults e customs.
 */
MdashContainerItemLayout.prototype.toTemplateOption = function () {
    var self = this;
    return {
        descricao: this.descricao || this.codigo,
        codigo: 'custom_' + this.mdashcontaineritemlayoutstamp,
        tipo: 'custom',
        isCustomLayout: true,
        layoutStamp: this.mdashcontaineritemlayoutstamp,
        UIData: { tipo: 'primary' },
        htmltemplate: this.htmltemplate || '',
        csstemplate: this.csstemplate || '',
        slotsdefinition: this.slotsdefinition || '[]',
        slots: this.slots || [],
        cssCdnsList: this.cssCdnsList || [],
        jsCdnsList: this.jsCdnsList || [],
        containerSelectorToRender: '[data-mdash-slot="body"]',
        generateCard: function (cardData) {
            return renderUnifiedLayout(this, cardData);
        }
    };
}

function getContainerItemLayoutUIObjectFormConfigAndSourceValues() {
    var layoutSystemOptions = [
        { option: "Header / Body / Footer (HBF)", value: "HBF" }
        // Extensível: adicionar novos sistemas aqui
    ];

    var categoriaOptions = [
        { option: "Snapshot", value: "snapshot" },
        { option: "Card", value: "card" },
        { option: "Chart", value: "chart" },
        { option: "Table", value: "table" },
        { option: "Custom", value: "custom" }
    ];

    var objectsUIFormConfig = [
        new UIObjectFormConfig({ colSize: 4, campo: "inactivo", tipo: "checkbox", titulo: "Inactivo", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "codigo", tipo: "text", titulo: "Código", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "descricao", tipo: "text", titulo: "Descrição", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 6, campo: "layoutsystem", tipo: "select", titulo: "Sistema de Layout", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: layoutSystemOptions }),
        new UIObjectFormConfig({ colSize: 6, campo: "categoria", tipo: "select", titulo: "Categoria", classes: "form-control input-source-form input-sm", contentType: "select", fieldToOption: "option", fieldToValue: "value", selectValues: categoriaOptions }),
        new UIObjectFormConfig({ colSize: 4, campo: "versao", tipo: "digit", titulo: "Versão", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "ordem", tipo: "digit", titulo: "Ordem", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 4, campo: "ispublic", tipo: "checkbox", titulo: "Público", classes: "input-source-form", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, campo: "iconcdn", tipo: "text", titulo: "URL Ícone CDN", classes: "form-control input-source-form input-sm", contentType: "input" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 300px;", campo: "htmltemplate", tipo: "div", titulo: "HTML Template", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "csstemplate", tipo: "div", titulo: "CSS Template", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 200px;", campo: "jstemplate", tipo: "div", titulo: "JS Template", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 150px;", campo: "slotsdefinition", tipo: "div", titulo: "Slots Definition (JSON)", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 100px;", campo: "jscdns", tipo: "div", titulo: "JS CDNs (JSON array)", classes: "input-source-form m-editor", contentType: "div" }),
        new UIObjectFormConfig({ colSize: 12, style: "width: 100%; height: 100px;", campo: "csscdns", tipo: "div", titulo: "CSS CDNs (JSON array)", classes: "input-source-form m-editor", contentType: "div" })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashContainerItemLayouts", idField: "mdashcontaineritemlayoutstamp" };
}

// ============================================================================
// UTILITY FUNCTIONS (Mantidas)
// ============================================================================

/**
 * Modal genérica de confirmação de eliminação
 * Coloca o registo em GMDashTempRecordToDelete e só move para GMdashDeleteRecords se confirmar
 */
function showDeleteConfirmation(options) {
    // options: { title, message, recordToDelete, onConfirm, onCancel }
    GMDashTempRecordToDelete = options.recordToDelete || null;
    
    // Remove modal anterior se existir
    $('#mdash-delete-confirm-modal').remove();
    
    // Cria modal Bootstrap customizada
    var modalHtml = '';
    modalHtml += '<div class="modal fade" id="mdash-delete-confirm-modal" tabindex="-1" role="dialog">';
    modalHtml += '  <div class="modal-dialog modal-sm" role="document">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header bg-danger text-white">';
    modalHtml += '        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Fechar">';
    modalHtml += '          <span aria-hidden="true">&times;</span>';
    modalHtml += '        </button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-exclamation-sign"></i> ' + (options.title || 'Confirmar eliminação') + '</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <p>' + (options.message || 'Tem a certeza?') + '</p>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn mdash-btn-delete" id="mdash-delete-confirm-btn">Eliminar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';
    
    $('body').append(modalHtml);
    
    // Handler do botão confirmar
    $('#mdash-delete-confirm-btn').off('click').on('click', function() {
        // Confirmado: move para GMdashDeleteRecords e executa callback
        if (GMDashTempRecordToDelete) {
            GMdashDeleteRecords.push(GMDashTempRecordToDelete);
        }
        GMDashTempRecordToDelete = null;
        
        $('#mdash-delete-confirm-modal').modal('hide');
        
        if (typeof options.onConfirm === 'function') {
            options.onConfirm();
        }
    });
    
    // Handler do cancelamento (fechar modal ou botão cancelar)
    $('#mdash-delete-confirm-modal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
        // Se ainda há registo temporário, foi cancelado
        if (GMDashTempRecordToDelete !== null) {
            GMDashTempRecordToDelete = null;
            
            if (typeof options.onCancel === 'function') {
                options.onCancel();
            } else {
                alertify.message('Eliminação cancelada');
            }
        }
        
        // Remove modal do DOM
        $(this).remove();
    });
    
    // Mostra modal
    $('#mdash-delete-confirm-modal').modal({
        backdrop: 'static',
        keyboard: true
    });
}



function gerarIdNumerico() {
    var timestamp = Date.now().toString();
    var parteFinal = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    var id = (timestamp + parteFinal).slice(0, 10);
    return id;
}

function forceJSONParse(data, defaultValue) {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (e) {
            return defaultValue;
        }
    }
    return data || defaultValue;
}

/**
 * Extrai tokens {token} de uma expressão (SQL, JS, URL, etc.).
 * Formato: {nomeDoToken} — chavetas simples, compatível com MDash v1.
 * Retorna array de nomes únicos (sem duplicatas).
 * @param {string} expression - A expressão a analisar
 * @returns {string[]} Array de nomes de tokens encontrados
 */
function extractTokensFromExpression(expression) {
    if (!expression) return [];
    var regex = /\{([^}]+)\}/g;
    var tokens = [];
    var match;
    while ((match = regex.exec(expression)) !== null) {
        var token = match[1].trim();
        if (token && tokens.indexOf(token) === -1) {
            tokens.push(token);
        }
    }
    return tokens;
}

/**
 * Resolve os tokens {token} numa expressão usando os parâmetros da fonte e os filtros do dashboard.
 * Ordem de resolução: 1) Valor do filtro mapeado, 2) context.parameters, 3) defaultValue do parâmetro
 * @param {string} expression - Expressão com tokens {token}
 * @param {Array} parametros - Array de parâmetros da fonte [{token, source, filterstamp, defaultValue}]
 * @param {object} contextParams - Parâmetros passados no context.parameters
 * @returns {string} Expressão com tokens substituídos
 */
function resolveExpressionTokens(expression, parametros, contextParams) {
    if (!expression) return expression;
    var filters = window.appState ? window.appState.filters : GMDashFilters;

    return expression.replace(/\{([^}]+)\}/g, function (fullMatch, tokenName) {
        tokenName = tokenName.trim();

        // Procurar o parâmetro correspondente
        var param = null;
        if (Array.isArray(parametros)) {
            param = parametros.find(function (p) { return p.token === tokenName; });
        }

        // 1) Se mapeado a um filtro, usar o valor actual do filtro
        if (param && param.source === 'filter' && param.filterstamp) {
            var filter = filters.find(function (f) { return f.mdashfilterstamp === param.filterstamp; });
            if (filter) {
                // Tentar obter o valor do input do filtro no DOM
                var filterInput = document.querySelector('[data-filterstamp="' + param.filterstamp + '"]');
                if (filterInput) return filterInput.value || param.defaultValue || '';
                // Fallback: valor de defeito do filtro
                return filter.valordefeito || param.defaultValue || '';
            }
        }

        // 2) Valor passado via context.parameters
        if (contextParams && contextParams[tokenName] !== undefined) {
            return contextParams[tokenName];
        }

        // 3) defaultValue do parâmetro
        if (param && param.defaultValue) return param.defaultValue;

        // 4) Sem resolução — manter o token original
        return fullMatch;
    });
}

/**
 * Sincroniza os parâmetros de uma fonte com os tokens detectados na expressão activa.
 * Adiciona parâmetros novos e remove os que já não existem na expressão.
 * @param {MDashFonte} fonte - A fonte a sincronizar
 * @returns {boolean} true se houve alterações
 */
function syncFonteParametros(fonte) {
    var expression = '';
    if (fonte.tipo === 'directquery') expression = fonte.expressaolistagem || '';
    else if (fonte.tipo === 'javascript') expression = fonte.expressaojslistagem || '';
    else if (fonte.tipo === 'api') expression = (fonte.apiurl || '') + ' ' + (fonte.apibodyjson || '');

    var detectedTokens = extractTokensFromExpression(expression);
    var existing = Array.isArray(fonte.parametros) ? fonte.parametros : [];
    var changed = false;

    // Adicionar novos tokens
    detectedTokens.forEach(function (token) {
        var exists = existing.find(function (p) { return p.token === token; });
        if (!exists) {
            existing.push({
                token: token,
                source: 'filter',          // defeito: mapeado a filtro
                filterstamp: '',            // por mapear
                defaultValue: '',
                description: ''
            });
            changed = true;
        }
    });

    // Remover tokens que já não existem na expressão
    var before = existing.length;
    fonte.parametros = existing.filter(function (p) {
        return detectedTokens.indexOf(p.token) !== -1;
    });
    if (fonte.parametros.length !== before) changed = true;

    return changed;
}

/**
 * Gera o HTML do interior da lista de parâmetros de uma fonte.
 * Usada tanto na renderização inicial como para actualizações live.
 */
function buildFonteParamsListHtml(fonte) {
    var html = '';
    if (fonte.parametros && fonte.parametros.length > 0) {
        fonte.parametros.forEach(function (param, idx) {
            html += '<div class="mdash-fonte-param-row" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;" data-param-idx="' + idx + '">';
            html += '  <label style="margin:0;min-width:70px;font-size:12px;"><code>{' + param.token + '}</code></label>';
            html += '  <input type="text" class="form-control input-sm mdash-param-value" data-param-idx="' + idx + '" placeholder="valor de teste" value="' + (param.defaultValue || '') + '" style="flex:1;" />';
            html += '</div>';
        });
    }
    return html;
}

// ============================================================================
// DATA MANAGEMENT FUNCTIONS (Mantidas)
// ============================================================================

function buildMDashConfigData(options) {
    var includeHeader = options && options.includeHeader === true;

    var configData = [
        { sourceTable: "MdashTab", sourceKey: "mdashtabstamp", records: GMDashTabs },
        { sourceTable: "MdashContainer", sourceKey: "mdashcontainerstamp", records: GMDashContainers },
        { sourceTable: "MdashContainerItem", sourceKey: "mdashcontaineritemstamp", records: GMDashContainerItems },
        { sourceTable: "MdashFilter", sourceKey: "mdashfilterstamp", records: GMDashFilters },
        { sourceTable: "MdashContainerItemObject", sourceKey: "mdashcontaineritemobjectstamp", records: GMDashContainerItemObjects },
        { sourceTable: "MDashFonte", sourceKey: "mdashfontestamp", records: GMDashFontes }
    ];

    configData.unshift({
        sourceTable: "u_mdash",
        sourceKey: "u_mdashstamp",
        records: GMDashConfig
    });

    return configData;
}

function exportarConfiguracaoMDashboard() {
    try {
        var configData = buildMDashConfigData({ includeHeader: true });
        var payload = {
            relatoriostamp: GMDashStamp || "",
            config: configData,
            generatedAt: new Date().toISOString()
        };
        var fileContents = JSON.stringify(payload, null, 2);
        var blob = new Blob([fileContents], { type: "application/json;charset=utf-8" });
        var downloadUrl = URL.createObjectURL(blob);
        var link = document.createElement("a");
        var timestamp = new Date().toISOString().replace(/[:.-]/g, "");

        var mdashConfig = GMDashConfig[0] || {};
        var fileName = "dashboard-" + mdashConfig.descricao + timestamp + ".json";

        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
        }, 1000);
    } catch (error) {
        console.error("Erro ao exportar configuracao do MDashboard", error);
        if (typeof alertify !== "undefined") {
            alertify.error("Erro ao exportar configuracao", 9000);
        }
    }
}

function actualizarConfiguracaoMDashboard() {
    // Usar sempre o array reactivo que tem os valores mais recentes (escritas via proxy PetiteVue)
    var fontesParaGravar = (window.appState && window.appState.fontes) ? window.appState.fontes : GMDashFontes;

    // Serializar campos JSON de todas as fontes antes de enviar para a BD
    fontesParaGravar.forEach(function (f) {
        if (typeof f.stringifyJSONFields === 'function') f.stringifyJSONFields();
    });

    // Usar toDbRecord() para garantir que só vão campos da tabela (sem runtime props nem datas ISO)
    var fontesDbRecords = fontesParaGravar.map(function (f) {
        return (typeof f.toDbRecord === 'function') ? f.toDbRecord() : f;
    });

    // Garantir serialização de configjson do dashboard antes do save full
    if (window.appState && window.appState.dashboardConfig && typeof window.appState.dashboardConfig.setConfig === 'function') {
        window.appState.dashboardConfig.setConfig(window.appState.dashboardSettings || {});
    }

    var configData = [
        { sourceTable: "u_mdash", sourceKey: "u_mdashstamp", records: GMDashConfig },
        { sourceTable: "MdashTab", sourceKey: "mdashtabstamp", records: GMDashTabs },
        { sourceTable: "MdashContainer", sourceKey: "mdashcontainerstamp", records: GMDashContainers },
        { sourceTable: "MdashContainerItem", sourceKey: "mdashcontaineritemstamp", records: GMDashContainerItems },
        { sourceTable: "MdashFilter", sourceKey: "mdashfilterstamp", records: GMDashFilters },
        { sourceTable: "MdashContainerItemObject", sourceKey: "mdashcontaineritemobjectstamp", records: GMDashContainerItemObjects },
        { sourceTable: "MDashFonte", sourceKey: "mdashfontestamp", records: fontesDbRecords }
    ];

    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatoriostamp: GMDashStamp, config: configData, recordsToDelete: GMdashDeleteRecords }]),
        },
        success: function (response) {
            try {
                console.log(response);
                if (response.cod != "0000") {
                    console.log("Erro ao actualizar", response);
                    alertify.error("Erro ao actualizar configuração", 9000);
                    return false;
                }
                alertify.success("Dados actualizados com sucesso", 9000);
                window.location.reload();
            } catch (error) {
                console.log("Erro interno ao actualizar", response, error);
            }
        }
    });
}

function realTimeComponentSync(recordData, table, idfield) {

    //console.log("Sincronização em tempo real do componente:", { table: table, idfield: idfield, recordData: recordData });
    var errorMessage = "ao actualizar componente em tempo real. Verifique a conexão com a internet.";
    try {
        var configData = [];

        if (recordData) {
            configData = [{
                sourceTable: table,
                sourceKey: idfield,
                records: [recordData]
            }];
        }

        var __payload = JSON.stringify([{ config: configData, recordsToDelete: GMdashDeleteRecords }]);
        console.log('[realTimeComponentSync] table=', table, '| payload=', __payload);

        $.ajax({
            type: "POST",
            url: "../programs/gensel.aspx?cscript=realtimecomponentsync",
            async: false,
            data: {
                '__EVENTARGUMENT': __payload,
            },
            success: function (response) {
                try {
                    console.log(response);
                    if (response.cod != "0000") {
                        console.log("Erro " + errorMessage, response);
                        alertify.error("Erro " + errorMessage, 4000);
                        return false;
                    }
                } catch (error) {
                    alertify.error("Erro interno " + errorMessage, 10000);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Erro " + errorMessage, xhr, thrownError);
                alertify.error("Erro " + errorMessage, 4000);
            }
        });
    } catch (error) {
        console.log("Erro interno " + errorMessage, error);
    }
}

// ============================================================================
// MDASH 2.0 - MODERN UI
// ============================================================================

/**
 * NOTA IMPORTANTE:
 * Esta é a versão REFATORADA que agora entende corretamente a hierarquia:
 * 
 * 1. Container (MdashContainer) - Representa uma "row" no layout
 * 2. ContainerItem (MdashContainerItem) - Representa um "card/item" dentro do container
 *    - Tem um template/layout (templatelayout) que define o visual
 * 3. ContainerItemObject (MdashContainerItemObject) - Objetos visuais dentro do item
 *    - Gráficos, tabelas, métricas, etc.
 * 
 * O fluxo correto é:
 * - Adicionar Container
 * - Adicionar ContainerItem ao Container (escolher template)
 * - Adicionar ContainerItemObjects ao ContainerItem (objetos visuais)
 */

function initConfiguracaoDashboard(config) {
    console.log("Inicializando MDash 2.0 REFATORADO com configuração:", config);
    GMDashStamp = config.u_mdashstamp;

    // Cria o container principal no DOM (fallback para body se #campos não existir)
    var mainContainerHtml = "<div id='m-dash-main-container' class='m-dash-main-container'></div>";
    var anchor = $("#campos > .row:last");
    if (anchor.length > 0) {
        anchor.after(mainContainerHtml);
    } else {
        $('body').append(mainContainerHtml);
    }

    // Carrega os dados existentes via AJAX
    loadDashboardDataFromServer(config);

    // Runtime reutilizável para gestão/render de tabs
    GMDashTabsRuntime = new MdashTabsManager();

    // Cria a interface moderna
    createModernDashboardUI();

    // Carrega estilos
    loadModernStyles();
}

/**
 * Carrega os dados do dashboard do servidor
 */
function loadDashboardDataFromServer(config) {
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getconfiguracaomdash",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ codigo: config.codigo }]),
        },
        success: function (response) {
            var errorMessage = "ao trazer resultados da configuração do m dashboard";
            try {
                if (response.cod != "0000") {
                    console.log("Erro " + errorMessage, response);
                    return false;
                }

                // Popula as arrays globais com os dados do servidor
                //console.log("Dados recebidos do servidor:", response.data);
                if (response.data ) {
                    var dashboardData = response.data

                    // Dashboard config
                    if (dashboardData.dashboard) {
                        GMDashConfig = [new MdashConfig(dashboardData.dashboard)];
                    } else if (!GMDashConfig.length) {
                        GMDashConfig = [new MdashConfig({ u_mdashstamp: GMDashStamp })];
                    }

                    // Tabs
                    if (dashboardData.tabs || dashboardData.mdashTabs) {
                        var tabsData = dashboardData.tabs || dashboardData.mdashTabs;
                        console.log('[loadDashboard] raw tabsData from server:', JSON.stringify(tabsData));
                        GMDashTabs = tabsData.map(function (t) {
                            return new MdashTab(t);
                        });
                        console.log('[loadDashboard] GMDashTabs after construction:', GMDashTabs.map(function(t){ return { stamp: t.mdashtabstamp, configjson: t.configjson }; }));
                    }

                    // Containers
                    if (dashboardData.containers) {
                        GMDashContainers = dashboardData.containers.map(function (c) {
                            return new MdashContainer(c);
                        });
                    }

                    // Container Items
                    if (dashboardData.containerItems) {
                        GMDashContainerItems = dashboardData.containerItems.map(function (item) {
                            return new MdashContainerItem(item);
                        });
                    }

                    // Container Item Objects
                    if (dashboardData.containerItemObjects) {
                        GMDashContainerItemObjects = dashboardData.containerItemObjects.map(function (obj) {
                            return new MdashContainerItemObject(obj);
                        });
                    }

                    // Filters
                    if (dashboardData.filters) {
                        GMDashFilters = dashboardData.filters.map(function (f) {
                            return new MdashFilter(f);
                        });
                    }

                    // Fontes
                    if (dashboardData.fontes) {
                        GMDashFontes = dashboardData.fontes.map(function (fonte) {
                            return new MDashFonte(fonte);
                        });
                        // Carrega lastResultscached de todas as fontes para a DB in-memory
                        if (typeof mdashInitFontesFromCache === 'function') {
                            mdashInitFontesFromCache(GMDashFontes);
                        }
                    }

                    // Container Item Layouts (global, sem dashboardstamp)
                    if (dashboardData.containerItemLayouts) {
                        GMDashContainerItemLayouts = dashboardData.containerItemLayouts.map(function (l) {
                            return new MdashContainerItemLayout(l);
                        });
                    }
                }

                console.log("Dados carregados:", {
                    tabs: GMDashTabs.length,
                    containers: GMDashContainers.length,
                    items: GMDashContainerItems.length,
                    objects: GMDashContainerItemObjects.length,
                    filters: GMDashFilters.length,
                    fontes: GMDashFontes.length,
                    layouts: GMDashContainerItemLayouts.length,
                    codigoDash:config.codigo
                });

            } catch (error) {
                console.log("Erro interno " + errorMessage, error);
            }
        }
    });
}

// ============================================================================
// TABS MANAGER (reutilizável para Editor e runtime de visualização)
// ============================================================================

function MdashTabsManager() {}

MdashTabsManager.prototype.getDashboardSettings = function () {
    var dash = (window.appState && window.appState.dashboardConfig)
        ? window.appState.dashboardConfig
        : (GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp }));
    if (!GMDashConfig.length) GMDashConfig = [dash];
    return (typeof dash.getConfig === 'function') ? dash.getConfig() : {};
};

MdashTabsManager.prototype.setDashboardSettings = function (settings, syncRealtime) {
    var dash = (window.appState && window.appState.dashboardConfig)
        ? window.appState.dashboardConfig
        : (GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp }));
    if (!GMDashConfig.length) GMDashConfig = [dash];
    if (typeof dash.setConfig === 'function') dash.setConfig(settings || {});
    if (window.appState) window.appState.dashboardSettings = settings || {};
    if (syncRealtime && typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(dash, dash.table, dash.idfield);
    }
};

MdashTabsManager.prototype.isEnabled = function () {
    var s = this.getDashboardSettings();
    return !!s.activarMultiSeparadores;
};

MdashTabsManager.prototype.getSortedTabs = function () {
    return (window.appState && window.appState.tabs ? window.appState.tabs : GMDashTabs)
        .slice()
        .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
};

MdashTabsManager.prototype.getActiveTabStamp = function () {
    return (window.appState && window.appState.activeTabStamp) || '';
};

MdashTabsManager.prototype.ensureActiveTab = function (syncRealtime) {
    var tabs = this.getSortedTabs();
    if (!tabs.length) {
        if (window.appState) window.appState.activeTabStamp = '';
        return '';
    }
    var current = this.getActiveTabStamp();
    var exists = tabs.some(function (t) { return t.mdashtabstamp === current; });
    if (exists) return current;
    var first = tabs[0].mdashtabstamp;
    if (window.appState) window.appState.activeTabStamp = first;
    var s = this.getDashboardSettings();
    s.activeTabStamp = first;
    this.setDashboardSettings(s, !!syncRealtime);
    return first;
};

MdashTabsManager.prototype.getVisibleContainers = function (containers) {
    var list = containers || (window.appState ? window.appState.containers : GMDashContainers) || [];
    if (!this.isEnabled()) return list;
    var active = this.ensureActiveTab(false);
    if (!active) return [];
    return list.filter(function (c) { return (c.mdashtabstamp || '') === active; });
};

MdashTabsManager.prototype.resolveNewContainerTabStamp = function () {
    if (!this.isEnabled()) return '';
    return this.ensureActiveTab(true);
};

MdashTabsManager.prototype._resolvePhcColor = function (phcType) {
    // Hex/rgb/named custom colors are returned as-is
    if (typeof phcType === 'string' && phcType.charAt(0) === '#') return phcType;
    if (typeof phcType === 'string' && (phcType.indexOf('rgb') === 0 || phcType.indexOf('hsl') === 0)) return phcType;
    var bg = '#2563eb';
    try {
        if (typeof getColorByType === 'function') {
            var c = getColorByType(phcType || 'primary');
            if (c && c.background) bg = c.background;
        }
    } catch (e) { }
    return bg;
};

MdashTabsManager.prototype._readTabConfig = function (tab) {
    if (!tab) return {};
    try { return JSON.parse(tab.configjson || '{}') || {}; } catch (e) { return {}; }
};

MdashTabsManager.prototype.getTabPhcType = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.cor || 'primary';
};

MdashTabsManager.prototype.getTabIconColorType = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.corIcone || cfg.cor || 'primary';
};

MdashTabsManager.prototype.getTabTextColorType = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.corTexto || 'default';
};

MdashTabsManager.prototype.getTabFontFamily = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.fontFamily || '';
};

MdashTabsManager.prototype.getTabStyle = function (tab) {
    var bg = this._resolvePhcColor(this.getTabPhcType(tab));
    var ic = this._resolvePhcColor(this.getTabIconColorType(tab));
    var txtType = this.getTabTextColorType(tab);
    // 'default' = auto (based on bg luminance)
    var txt = (txtType && txtType !== 'default') ? this._resolvePhcColor(txtType) : this._getContrastColor(bg);
    var style = '--mdash-tab-accent:' + bg + ';--mdash-tab-icon:' + ic + ';--mdash-tab-text:' + txt + ';';
    var ff = this.getTabFontFamily(tab);
    if (ff) style += '--mdash-tab-font:' + ff + ';';
    return style;
};

MdashTabsManager.prototype._getContrastColor = function (hex) {
    try {
        var c = hex.charAt(0) === '#' ? hex.substring(1) : hex;
        if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        var r = parseInt(c.substring(0, 2), 16);
        var g = parseInt(c.substring(2, 4), 16);
        var b = parseInt(c.substring(4, 6), 16);
        // relative luminance (sRGB)
        var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum > 0.62 ? '#0f172a' : '#ffffff';
    } catch (e) { return '#0f172a'; }
};

MdashTabsManager.prototype.getTabAccentStyle = function (tab) {
    var color = this._resolvePhcColor(this.getTabPhcType(tab));
    return 'background:' + color + ';';
};

MdashTabsManager.prototype.createTab = function (data) {
    var tab = new MdashTab(data || {});
    if (window.appState && window.appState.tabs) window.appState.tabs.push(tab);
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(tab, tab.table, tab.idfield);
    }
    return tab;
};

MdashTabsManager.prototype.removeTab = function (tabStamp) {
    var tabs = window.appState && window.appState.tabs ? window.appState.tabs : GMDashTabs;
    var idx = tabs.findIndex(function (t) { return t.mdashtabstamp === tabStamp; });
    if (idx < 0) return false;
    tabs.splice(idx, 1);
    return true;
};

function mdashSyncDashboardConfigRealtime() {
    if (!GMDashTabsRuntime || !window.appState) return;
    GMDashTabsRuntime.setDashboardSettings(window.appState.dashboardSettings || {}, true);
}

// ============================================================================
// CDN LOADER — Carregamento lazy e deduplicated de CDNs para layouts
// ============================================================================

var GMdashLoadedCDNs = {}; // { url: 'css'|'js' } — registo de CDNs já injectados no DOM

/**
 * ensureMdashCDNsLoaded(cssCdns, jsCdns)
 * Injecta CDNs em <head> de forma deduplicated (cada URL só é carregada uma vez).
 * CSS: <link rel="stylesheet"> — non-blocking (browser aplica quando pronto)
 * JS: <script> — carregados sequencialmente para preservar ordem de dependências
 *
 * Performance:
 * - Deduplicação global via GMdashLoadedCDNs (O(1) lookup)
 * - CSS nunca bloqueia — injectado imediatamente
 * - JS carregado sequencialmente com onload (garante dependências)
 * - CDNs ficam em cache do browser após primeiro carregamento
 * - Usado tanto no editor como na renderização do dashboard
 *
 * @param {string[]} cssCdns - Array de URLs de CSS CDNs
 * @param {string[]} jsCdns  - Array de URLs de JS CDNs
 * @returns {Promise|undefined} Promise que resolve quando todos os JS estiverem carregados
 */
function ensureMdashCDNsLoaded(cssCdns, jsCdns) {
    var cssList = cssCdns || [];
    var jsList = jsCdns || [];

    // Inject CSS CDNs (non-blocking — browser aplica quando ready)
    cssList.forEach(function (url) {
        url = (url || '').trim();
        if (!url || GMdashLoadedCDNs[url]) return;
        GMdashLoadedCDNs[url] = 'css';
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.setAttribute('data-mdash-cdn', url);
        document.head.appendChild(link);
    });

    // Filter JS CDNs que ainda não foram carregados
    var jsToLoad = jsList.filter(function (url) {
        return (url || '').trim() && !GMdashLoadedCDNs[(url || '').trim()];
    });

    if (jsToLoad.length === 0) {
        return typeof Promise !== 'undefined' ? Promise.resolve() : undefined;
    }

    // Carrega JS sequencialmente (preserva ordem de dependências)
    if (typeof Promise !== 'undefined') {
        return jsToLoad.reduce(function (chain, url) {
            return chain.then(function () {
                return new Promise(function (resolve) {
                    url = url.trim();
                    GMdashLoadedCDNs[url] = 'js';
                    var script = document.createElement('script');
                    script.src = url;
                    script.setAttribute('data-mdash-cdn', url);
                    script.onload = resolve;
                    script.onerror = function () {
                        console.warn('[MDash] CDN load failed:', url);
                        resolve(); // Não bloqueia em caso de falha
                    };
                    document.head.appendChild(script);
                });
            });
        }, Promise.resolve());
    } else {
        // Fallback sem Promise — fire and forget
        jsToLoad.forEach(function (url) {
            url = url.trim();
            GMdashLoadedCDNs[url] = 'js';
            var script = document.createElement('script');
            script.src = url;
            script.setAttribute('data-mdash-cdn', url);
            document.head.appendChild(script);
        });
    }
}

/**
 * Verifica se um URL de CDN já está carregado.
 * @param {string} url
 * @returns {boolean}
 */
function isMdashCDNLoaded(url) {
    return !!GMdashLoadedCDNs[(url || '').trim()];
}

// ============================================================================
// RENDERIZAÇÃO UNIFICADA DE LAYOUTS (default + custom)
// ============================================================================

/**
 * scopeLayoutCSS(css, scopeAttrValue)
 * Transforma CSS livre em CSS isolado (scoped) para um layout específico.
 * Cada regra é prefixada com [data-mdash-scope="<scopeAttrValue>"] de modo
 * a que o CSS NUNCA afecte elementos fora desse wrapper.
 *
 * Trata correctamente:
 * - @media, @keyframes, @font-face, @supports (não prefixa @-rules, mas prefixa o conteúdo)
 * - Múltiplos selectores separados por vírgula
 * - body/html → substituído pelo scope selector
 * - :root → substituído pelo scope selector
 *
 * @param {string} css  - CSS original escrito pelo dev
 * @param {string} scopeAttrValue - valor único para o atributo data-mdash-scope
 * @returns {string} CSS com todas as regras prefixadas
 */
function scopeLayoutCSS(css, scopeAttrValue) {
    if (!css || !scopeAttrValue) return css || '';
    var scope = '[data-mdash-scope="' + scopeAttrValue + '"]';

    // Strip comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');

    // Resultados
    var output = '';
    var i = 0;
    var len = css.length;

    while (i < len) {
        // Skip whitespace
        while (i < len && /\s/.test(css[i])) { output += css[i]; i++; }
        if (i >= len) break;

        // Detect @-rules
        if (css[i] === '@') {
            var atRuleStart = i;
            // Read the @-rule name
            var atMatch = css.substring(i).match(/^@([\w-]+)/);
            if (!atMatch) { output += css[i]; i++; continue; }

            var atName = atMatch[1].toLowerCase();

            if (atName === 'media' || atName === 'supports') {
                // Read up to opening brace — the condition
                var bracePos = css.indexOf('{', i);
                if (bracePos === -1) { output += css.substring(i); break; }
                output += css.substring(i, bracePos + 1);
                i = bracePos + 1;
                // Now recursively scope the content inside
                var depth = 1;
                var innerStart = i;
                while (i < len && depth > 0) {
                    if (css[i] === '{') depth++;
                    else if (css[i] === '}') depth--;
                    if (depth > 0) i++;
                }
                var innerCSS = css.substring(innerStart, i);
                output += scopeLayoutCSS(innerCSS, scopeAttrValue);
                output += '}';
                i++; // skip closing }
                continue;
            }

            if (atName === 'keyframes' || atName === 'font-face' || atName === 'import') {
                // Pass through unchanged — find matching closing brace
                var bracePos2 = css.indexOf('{', i);
                if (bracePos2 === -1) { output += css.substring(i); break; }
                var depth2 = 1;
                var j = bracePos2 + 1;
                while (j < len && depth2 > 0) {
                    if (css[j] === '{') depth2++;
                    else if (css[j] === '}') depth2--;
                    j++;
                }
                output += css.substring(i, j);
                i = j;
                continue;
            }

            // Other @-rules (e.g. @charset) — pass through to semicolon
            var semiPos = css.indexOf(';', i);
            if (semiPos === -1) { output += css.substring(i); break; }
            output += css.substring(i, semiPos + 1);
            i = semiPos + 1;
            continue;
        }

        // Normal rule: read selectors up to '{'
        var braceIdx = css.indexOf('{', i);
        if (braceIdx === -1) { output += css.substring(i); break; }

        var selectorsStr = css.substring(i, braceIdx);
        i = braceIdx + 1;

        // Find matching closing brace for the declaration block
        var depth3 = 1;
        var declStart = i;
        while (i < len && depth3 > 0) {
            if (css[i] === '{') depth3++;
            else if (css[i] === '}') depth3--;
            if (depth3 > 0) i++;
        }
        var declarations = css.substring(declStart, i);
        i++; // skip closing }

        // Scope each selector
        var scopedSelectors = selectorsStr.split(',').map(function (sel) {
            sel = sel.trim();
            if (!sel) return sel;
            // body, html, :root → scope itself
            if (/^(body|html|:root)$/i.test(sel)) return scope;
            if (/^(body|html|:root)\s+/i.test(sel)) return sel.replace(/^(body|html|:root)\s+/i, scope + ' ');
            return scope + ' ' + sel;
        }).join(', ');

        output += scopedSelectors + ' {' + declarations + '}';
    }

    return output;
}

/**
 * renderUnifiedLayout(layout, cardData)
 * Pipeline único de renderização para qualquer layout (default ou custom).
 * 1. Substitui tokens {{variable}} no htmltemplate
 * 2. Preenche data-mdash-slot com dados do cardData (via regex string, sem jQuery)
 * 3. Isola o CSS com scope automático (data-mdash-scope) se existir csstemplate
 * 4. Envolve tudo num wrapper com o atributo de scope
 * @param {Object} layout - Objecto de layout com htmltemplate, csstemplate, UIData
 * @param {Object} cardData - Dados do card (title, id, tipo, bodyContent, icon, etc.)
 * @returns {string} HTML final renderizado com CSS scoped
 */
function renderUnifiedLayout(layout, cardData) {
    var html = layout.htmltemplate || '';
    var css = layout.csstemplate || '';

    // Build token replacement map
    var tipo = cardData.tipo || (layout.UIData && layout.UIData.tipo) || 'primary';
    var tokenMap = {
        id: cardData.id || '',
        tipo: tipo,
        classes: cardData.classes || '',
        styles: cardData.styles || '',
        headerClasses: cardData.headerClasses || '',
        title: cardData.title || '',
        bodyContent: cardData.bodyContent || '',
        icon: cardData.icon || '',
        footer: cardData.footer || '',
        header: cardData.header || '',
        subtitle: (cardData.extraData && cardData.extraData.subtitle) || '',
        status: (cardData.extraData && cardData.extraData.status) || ''
    };

    // Replace {{variable}} tokens
    html = html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return tokenMap.hasOwnProperty(key) ? tokenMap[key] : '';
    });

    // Slot content map
    var slotContent = {
        'title': cardData.title || '',
        'icon': cardData.icon || '',
        'header': cardData.header || '',
        'body': cardData.bodyContent || '',
        'footer': cardData.footer || '',
        'subtitle': (cardData.extraData && cardData.extraData.subtitle) || '',
        'status-badge': (cardData.extraData && cardData.extraData.status) || ''
    };

    // Fill data-mdash-slot elements via pure string regex (no jQuery DOM creation)
    // Pattern: match an opening tag with data-mdash-slot="slotName", capture up to the closing tag
    html = html.replace(/<([a-z][a-z0-9]*)\b([^>]*data-mdash-slot="([^"]+)"[^>]*)>([\s\S]*?)(<\/\1>)/gi, function (fullMatch, tag, attrs, slotName, innerContent, closeTag) {
        var content = slotContent[slotName];
        if (content === undefined || content === '') return fullMatch;

        // Check for class-mode (icons)
        if (/data-mdash-slot-mode="class"/.test(attrs)) {
            // Replace the class attribute entirely, or add class if none
            if (/\bclass="[^"]*"/.test(attrs)) {
                attrs = attrs.replace(/\bclass="[^"]*"/, 'class="' + content + '"');
            } else {
                attrs += ' class="' + content + '"';
            }
            return '<' + tag + attrs + '>' + innerContent + closeTag;
        }

        // Default: replace innerHTML
        return '<' + tag + attrs + '>' + content + closeTag;
    });

    // Gera scope ID único: layout codigo + card id (garante isolamento por instância)
    var scopeId = (layout.codigo || 'layout') + '_' + (cardData.id || Math.random().toString(36).substr(2, 6));

    var result = '';
    if (css) {
        result += '<style>' + scopeLayoutCSS(css, scopeId) + '</style>';
    }
    // Wrapper com atributo de scope — todas as regras CSS ficam contidas aqui
    result += '<div data-mdash-scope="' + scopeId + '">' + html + '</div>';
    return result;
}

/**
 * injectSlotDropOverlays(itemStamp, template)
 * Após o card ser renderizado com renderUnifiedLayout (cores/icons visíveis),
 * injeta mini drop-zones nos slots de tipo "content", "text" e "html".
 * Slots de tipo "icon" mantêm o conteúdo default do card.
 */
function injectSlotDropOverlays(itemStamp, template) {
    var $body = $(".mdash-canvas-item[data-stamp='" + itemStamp + "'] .mdash-canvas-item-body");
    if (!$body.length) return;

    // Determina quais slots recebem drop zone
    var slots = template.slots || forceJSONParse(template.slotsdefinition, []);
    var contentSlotIds = {};
    var isCustom = template.isCustomLayout;

    // Nos layouts default, "content" e "text" são slots de drop (title, body, header, footer)
    // Nos layouts custom (Layout Builder), todos os slots (type "html") recebem drop zone
    slots.forEach(function (s) {
        if (s.type === 'content' || s.type === 'html' || s.type === 'text') {
            contentSlotIds[s.id] = s;
        } else if (isCustom) {
            contentSlotIds[s.id] = s;
        }
    });

    // Obter instância do item para aceder à slotsconfig
    var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });

    $body.find('[data-mdash-slot]').each(function () {
        var $el = $(this);
        var slotId = $el.attr('data-mdash-slot');
        var slotDef = contentSlotIds[slotId];

        // Custom layouts: slot no HTML sem definição → trata como content
        if (!slotDef && isCustom) {
            slotDef = { id: slotId, label: slotId, type: 'html' };
        }
        if (!slotDef) return; // Layout default, slot visual — manter visual default

        // Limpa conteúdo do slot e injeta drop zone
        $el.empty();
        var objs = window.appState.containerItemObjects.filter(function (o) {
            return o.mdashcontaineritemstamp === itemStamp && o.slotid === slotId;
        });

        var dropHtml;

        if (objs.length > 0) {
            // ── Slot ocupado: um bloco empilhado por objecto ──
            dropHtml = '<div class="mdash-slot-zone-drop has-object" data-slot-id="' + slotId + '" data-item-stamp="' + itemStamp + '">';
            objs.forEach(function (obj) {
                var renderDivId = 'mdash-slot-render-' + obj.mdashcontaineritemobjectstamp;
                var objEntry = getMdashObjectTypeEntry(obj.tipo);
                var objProcessaFonte = objEntry ? (objEntry.processaFonte !== undefined ? objEntry.processaFonte : obj.processaFonte) : obj.processaFonte;
                dropHtml += '<div class="mdash-slot-zone-obj-block">';
                dropHtml += '<div class="mdash-slot-zone-toolbar">';
                // Lado esquerdo: opções do SLOT
                dropHtml += '<button type="button" class="mdash-slot-zone-settings mdash-slot-zone-toolbar-left" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '" title="Propriedades do slot"><i class="glyphicon glyphicon-cog"></i> Slot</button>';
                // Centro: propriedades do OBJECTO (mostra o tipo em vez de "Propriedades")
                dropHtml += '<button type="button" class="mdash-slot-zone-obj-props" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Propriedades do objecto"><i class="' + getObjectTypeIcon(obj.tipo) + '"></i> ' + (obj.tipo || 'Objecto') + '</button>';
                // Copiar objecto
                dropHtml += '<button type="button" class="mdash-slot-zone-obj-copy mdash-clip-btn" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Copiar objecto"><i class="glyphicon glyphicon-copy"></i></button>';
                // Lado direito: remover OBJECTO
                dropHtml += '<button type="button" class="mdash-slot-zone-remove mdash-slot-zone-toolbar-right" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Remover objecto"><i class="glyphicon glyphicon-remove"></i> Remover</button>';
                dropHtml += '</div>';
                dropHtml += '<div class="mdash-slot-zone-render" id="' + renderDivId + '" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '">';
                if (objProcessaFonte !== false) {
                    dropHtml += '<div class="mdash-slot-zone-render-placeholder"><i class="' + getObjectTypeIcon(obj.tipo) + '"></i> ' + (obj.tipo || 'Objecto') + '</div>';
                }
                dropHtml += '</div>';
                dropHtml += '</div>'; // .mdash-slot-zone-obj-block
            });
            dropHtml += '</div>';
        } else {
            // ── Slot vazio: mesma toolbar overlay + hint de drag ──
            dropHtml = '<div class="mdash-slot-zone-drop" data-slot-id="' + slotId + '" data-item-stamp="' + itemStamp + '">';
            dropHtml += '<div class="mdash-slot-zone-toolbar">';
            dropHtml += '<button type="button" class="mdash-slot-zone-settings mdash-slot-zone-toolbar-left" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '" title="Propriedades do slot"><i class="glyphicon glyphicon-cog"></i> Slot</button>';
            dropHtml += '</div>';
            dropHtml += '<span class="mdash-slot-zone-hint"><i class="glyphicon glyphicon-plus-sign"></i> ' + (slotDef.label || slotId) + '</span>';
            dropHtml += '</div>';
        }

        $el.html(dropHtml);

        // Aplicar configuração persistida do slot
        if (item) {
            var mdashSlot = item.getSlot(slotId);
            if (mdashSlot) mdashSlot.applyToElement($el);
        }

        // Renderizar imediatamente no editor — um render por objecto
        if (objs.length > 0 && item) {
            objs.forEach(function (obj) {
                var renderDivId = 'mdash-slot-render-' + obj.mdashcontaineritemobjectstamp;
                var $renderDiv = $('#' + renderDivId);
                if ($renderDiv.length) {
                    obj.renderObjectByContainerItem('#' + renderDivId, item);
                }
            });
        }

        // ── Bind directo nos elementos criados (não delegado) ──
        var $drop = $el.find('.mdash-slot-zone-drop');
        bindSlotDropZoneEvents($drop, itemStamp, slotId);
    });
}

/**
 * Bind directo dos eventos de click (slot settings, object edit, remove) + drag/drop
 * num .mdash-slot-zone-drop específico.
 */
function bindSlotDropZoneEvents($drop, itemStamp, slotId) {
    // Drag/drop para receber objectos
    $drop.on('dragover', function (e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        $(this).addClass('drag-over');
    });
    $drop.on('dragleave', function () {
        $(this).removeClass('drag-over');
    });
    $drop.on('drop', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        var raw = e.originalEvent.dataTransfer.getData('application/mdash-object');
        if (!raw) return;
        var objDef;
        try { objDef = JSON.parse(raw); } catch (err) { return; }
        var newObj = new MdashContainerItemObject({
            mdashcontaineritemstamp: itemStamp,
            dashboardstamp: GMDashStamp,
            tipo: objDef.value,
            slotid: slotId
        });
        window.appState.containerItemObjects.push(newObj);
        refreshSlotOverlays(itemStamp);
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(newObj, newObj.table, newObj.idfield);
        }
    });

    // Click na área de renderização → propriedades do objecto (com multi-select)
    $drop.on('click', '.mdash-slot-zone-render', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('object-stamp');
        if (!stamp) return;
        var obj = window.appState.containerItemObjects.find(function (o) {
            return o.mdashcontaineritemobjectstamp === stamp;
        });
        if (!obj) return;

        // Multi-select: Ctrl+Click ou Shift+Click
        var orderedStamps = window.appState.containerItemObjects
            .filter(function (o) { return o.mdashcontaineritemstamp === itemStamp; })
            .map(function (o) { return o.mdashcontaineritemobjectstamp; });
        if (mdashHandleMultiSelect('object', stamp, e, orderedStamps)) return;

        $('.mdash-slot-zone-render.is-selected').removeClass('is-selected');
        $(this).addClass('is-selected');
        _currentSelectedComponent = { type: 'object', stamp: stamp, data: obj };
        handleComponentProperties(_currentSelectedComponent);
    });

    // Click no botão ✏ Propriedades → mesma acção que clicar na render area
    $drop.on('click', '.mdash-slot-zone-obj-props', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('object-stamp');
        if (!stamp) return;
        var obj = window.appState.containerItemObjects.find(function (o) {
            return o.mdashcontaineritemobjectstamp === stamp;
        });
        if (!obj) return;
        var $block = $(this).closest('.mdash-slot-zone-obj-block');
        $('.mdash-slot-zone-render.is-selected').removeClass('is-selected');
        $block.find('.mdash-slot-zone-render').addClass('is-selected');
        _currentSelectedComponent = { type: 'object', stamp: stamp, data: obj };
        handleComponentProperties(_currentSelectedComponent);
    });

    // Hover ⚙ slot → realça a borda do slot inteiro (azul)
    $drop.on('mouseenter', '.mdash-slot-zone-settings', function () {
        $drop.addClass('slot-action-hover');
    }).on('mouseleave', '.mdash-slot-zone-settings', function () {
        $drop.removeClass('slot-action-hover');
    });

    // Hover ✏ propriedades do objecto → contorno no render
    $drop.on('mouseenter', '.mdash-slot-zone-obj-props', function () {
        $(this).closest('.mdash-slot-zone-obj-block').addClass('object-props-hover');
    }).on('mouseleave', '.mdash-slot-zone-obj-props', function () {
        $(this).closest('.mdash-slot-zone-obj-block').removeClass('object-props-hover');
    });

    // Click 📋 copiar objecto
    $drop.on('click', '.mdash-slot-zone-obj-copy', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('object-stamp');
        if (!stamp) return;
        _currentSelectedComponent = { type: 'object', stamp: stamp, data: null };
        GMDashMultiSelection.stamps = [];
        GMDashMultiSelection.type = '';
        mdashCopySelection();
    });

    // Hover × remove → realça o bloco do objecto (vermelho)
    $drop.on('mouseenter', '.mdash-slot-zone-remove', function () {
        $(this).closest('.mdash-slot-zone-obj-block').addClass('object-remove-hover');
    }).on('mouseleave', '.mdash-slot-zone-remove', function () {
        $(this).closest('.mdash-slot-zone-obj-block').removeClass('object-remove-hover');
    });

    // Click no gear (toolbar ou slot vazio) → propriedades do slot
    $drop.on('click', '.mdash-slot-zone-settings', function (e) {
        e.stopPropagation();
        var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
        var slot = item ? item.getSlot(slotId) : null;
        _currentSelectedComponent = {
            type: 'slot',
            stamp: itemStamp + '::' + slotId,
            data: { item: item, slot: slot, itemStamp: itemStamp, slotId: slotId }
        };
        $('.mdash-slot-zone-drop.is-selected').removeClass('is-selected');
        $drop.addClass('is-selected');
        showSlotPropertiesEditor(itemStamp, slotId);
    });

    // Click no remove → confirmação + registo em GMdashDeleteRecords para guardar a posteriori
    $drop.on('click', '.mdash-slot-zone-remove', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var objectStamp = $(this).data('object-stamp');
        var idx = window.appState.containerItemObjects.findIndex(function (obj) {
            return obj.mdashcontaineritemobjectstamp === objectStamp;
        });
        if (idx === -1) return;
        var obj = window.appState.containerItemObjects[idx];
        showDeleteConfirmation({
            title: 'Remover objecto',
            message: 'Tem a certeza que pretende remover o objecto <strong>' + (obj.tipo || 'Objecto') + '</strong> deste slot?',
            recordToDelete: {
                table: obj.table,
                tableKey: obj.idfield,
                stamp: obj[obj.idfield]
            },
            onConfirm: function () {
                // Remove do array reactivo apenas após confirmação
                var currentIdx = window.appState.containerItemObjects.findIndex(function (o) {
                    return o.mdashcontaineritemobjectstamp === objectStamp;
                });
                if (currentIdx !== -1) {
                    window.appState.containerItemObjects.splice(currentIdx, 1);
                }
                refreshSlotOverlays(itemStamp);
            }
        });
    });

    // Click no slot vazio (não na render area, não no gear, não no remove) → slot properties
    $drop.on('click', function (e) {
        var $t = $(e.target);
        if ($t.closest('.mdash-slot-zone-render').length) return;
        if ($t.closest('.mdash-slot-zone-settings').length) return;
        if ($t.closest('.mdash-slot-zone-remove').length) return;
        e.preventDefault();
        e.stopPropagation();
        var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
        var slot = item ? item.getSlot(slotId) : null;
        _currentSelectedComponent = {
            type: 'slot',
            stamp: itemStamp + '::' + slotId,
            data: { item: item, slot: slot, itemStamp: itemStamp, slotId: slotId }
        };
        $('.mdash-slot-zone-drop.is-selected').removeClass('is-selected');
        $drop.addClass('is-selected');
        showSlotPropertiesEditor(itemStamp, slotId);
    });
}

/**
 * refreshSlotOverlays(itemStamp)
 * Recalcula os drop overlays para um item — chamado após drag/drop.
 */
function refreshSlotOverlays(itemStamp) {
    var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
    if (!item) return;
    var template = getTemplateLayoutOptions().find(function (t) { return t.codigo === item.templatelayout; });
    if (template && template.htmltemplate) {
        injectSlotDropOverlays(itemStamp, template);
    }
}

function getTemplateLayoutOptions() {
    var templates = [];

    // Layouts padrão definidos em TEMPLATE DASHBOARD STANDARD EXTENSION.js
    if (typeof getDefaultLayoutDefinitions === "function") {
        var defaults = getDefaultLayoutDefinitions();
        templates = defaults.map(function (def) {
            return {
                descricao: def.descricao,
                codigo: def.codigo,
                tipo: def.tipo,
                UIData: def.UIData,
                htmltemplate: def.htmltemplate,
                csstemplate: def.csstemplate || '',
                slotsdefinition: def.slotsdefinition || '[]',
                slots: forceJSONParse(def.slotsdefinition, []),
                cssCdnsList: def.cssCdnsList || [],
                jsCdnsList: def.jsCdnsList || [],
                containerSelectorToRender: def.containerSelectorToRender || '[data-mdash-slot="body"]',
                isCustomLayout: false,
                generateCard: function (cardData) {
                    return renderUnifiedLayout(this, cardData);
                }
            };
        });
    } else {
        // Fallback mínimo para ambientes onde o ficheiro de templates não esteja carregado.
        templates = [
            { codigo: "template_kpi", descricao: "KPI Card", slots: [], slotsdefinition: '[]', sampleHtml: '<div class="preview-card kpi"><div class="kpi-label">Vendas</div><div class="kpi-value">123.4K</div><div class="kpi-trend up">+4.6%</div></div>' },
            { codigo: "template_table", descricao: "Tabela simples", slots: [], slotsdefinition: '[]', sampleHtml: '<div class="preview-card table"><table class="table table-condensed"><thead><tr><th>Col 1</th><th>Col 2</th></tr></thead><tbody><tr><td>Valor</td><td>42</td></tr><tr><td>Valor</td><td>58</td></tr></tbody></table></div>' },
            { codigo: "template_chart", descricao: "Gráfico (placeholder)", slots: [], slotsdefinition: '[]', sampleHtml: '<div class="preview-card chart"><div class="chart-placeholder">Gráfico aqui</div></div>' }
        ];
    }

    // Integração híbrida: adicionar layouts customizados do Layout Builder
    if (typeof getCustomLayoutTemplateOptions === "function") {
        var customLayouts = getCustomLayoutTemplateOptions();
        if (customLayouts.length > 0) {
            templates = templates.concat(customLayouts);
        }
    }

    return templates;
}

function getDefaultTemplateCodigo() {
    var templates = getTemplateLayoutOptions();
    return (templates[0] && templates[0].codigo) || "";
}

function getTemplateLayoutByCode(templateCode) {
    return getTemplateLayoutOptions().find(function (tpl) {
        return tpl.codigo === templateCode;
    }) || null;
}

function getTemplateThumbnailHtml(templateCode) {
    if (!templateCode) return "";
    if (GTemplateThumbCache[templateCode]) return GTemplateThumbCache[templateCode];

    var template = getTemplateLayoutByCode(templateCode);
    if (!template) {
        GTemplateThumbCache[templateCode] = '<div class="mdash-template-thumb-empty">?</div>';
        return GTemplateThumbCache[templateCode];
    }

    var thumbHtml = "";
    if (typeof template.generateCard === "function") {
        try {
            thumbHtml = template.generateCard({
                title: "Preview",
                id: "thumb-" + template.codigo,
                tipo: (template.UIData && template.UIData.tipo) || "primary",
                bodyContent: "Demo"
            });
            // CSS é automaticamente scoped via scopeLayoutCSS() → data-mdash-scope wrapper
        } catch (error) {
            thumbHtml = "";
        }
    }

    if (!thumbHtml && template.sampleHtml) {
        thumbHtml = template.sampleHtml;
    }

    if (!thumbHtml) {
        var firstLetter = (template.descricao || template.codigo || "?").charAt(0).toUpperCase();
        thumbHtml = '<div class="mdash-template-thumb-empty">' + firstLetter + '</div>';
    }

    GTemplateThumbCache[templateCode] = '<div class="mdash-template-thumb-render">' + thumbHtml + '</div>';
    return GTemplateThumbCache[templateCode];
}

// TODO: Implementar o resto das funções da UI moderna
// mas agora respeitando TODA a estrutura:
// - Lista de Containers
// - Dentro de cada Container, lista de ContainerItems
// - Dentro de cada ContainerItem, lista de ContainerItemObjects
// - Gestão de Filtros
// - Gestão de Fontes

function createModernDashboardUI() {
    // Inicializa a interface completa com sidebar + canvas
    initModernDashboardUI();
    // Renderiza pré-visualizações iniciais dos itens
    setTimeout(renderAllContainerItemTemplates, 0);
}

function loadModernStyles() {
    // Carrega todos os estilos
    loadModernDashboardStyles();
}

// ============================================================================
// MÓDULO PRINCIPAL - UI MODERNA COM SIDEBAR
// ============================================================================

/**
 * Inicializa a interface completa do MDash 2.0
 */
function initModernDashboardUI() {
    console.log("Inicializando MDash 2.0 UI Completa");
    console.info("MDash REFACTOR build: 2026.04.01");

    var mainHtml = '<div class="mdash-editor-wrapper">';
    mainHtml += '<div class="mdash-top-toolbar">';
    mainHtml += '  <div class="mdash-top-toolbar-brand"><i class="glyphicon glyphicon-th"></i> MDash 2.0</div>';
    mainHtml += '  <div class="mdash-top-toolbar-actions">';
    mainHtml += '    <button type="button" onclick="actualizarConfiguracaoMDashboard()" class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-floppy-disk"></i> Guardar</button>';
    mainHtml += '    <button type="button" onclick="exportarConfiguracaoMDashboard()" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-download-alt"></i> Exportar</button>';
    mainHtml += '  </div>';
    mainHtml += '</div>';
    mainHtml += '<div class="mdash-modern-layout" v-scope @vue:mounted="onMounted">';

    // Sidebar (listas + toolbox contextual)
    mainHtml += '  <div class="mdash-sidebar" :class="{\'is-collapsed\': isSidebarCollapsed}">';
    mainHtml += '    <div class="mdash-sidebar-header">';
    mainHtml += '      <h4><i class="glyphicon glyphicon-th"></i> Componentes</h4>';
    mainHtml += '      <button type="button" class="btn btn-default btn-xs mdash-panel-toggle mdash-sidebar-toggle" @click.stop="toggleSidebar" :title="isSidebarCollapsed ? \'Expandir componentes\' : \'Colapsar componentes\'"><i :class="isSidebarCollapsed ? \'glyphicon glyphicon-chevron-right\' : \'glyphicon glyphicon-chevron-left\'"></i></button>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-sidebar-rail-actions">';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm toolbox-container mdash-toolbox-item" data-component="container" @click="addNewContainer" title="Container (clique ou arraste para o canvas)"><i class="glyphicon glyphicon-th-large"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm toolbox-container-item mdash-toolbox-item" data-component="containerItem" @click="quickAddItemFromRail" title="Item (clique ou arraste para um container)"><i class="glyphicon glyphicon-list-alt"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="openFiltersManagerModal" title="Gerir filtros"><i class="glyphicon glyphicon-filter"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="addNewFonte" title="Nova Fonte"><i class="glyphicon glyphicon-hdd"></i></button>';
    mainHtml += '    </div>';
    mainHtml += '    <div class="mdash-sidebar-body">';
    mainHtml += '      <div class="mdash-widget-section">';
    mainHtml += '        <p class="mdash-section-label">Adicionar</p>';
    mainHtml += '        <div class="mdash-widget-grid">';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container mdash-toolbox-item" data-component="container" @click="addNewContainer" title="Clique para adicionar ou arraste para o canvas">';
    mainHtml += '            <i class="glyphicon glyphicon-th-large"></i><span>Container</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container-item mdash-toolbox-item" data-component="containerItem" title="Arraste para um Container">';
    mainHtml += '            <i class="glyphicon glyphicon-list-alt"></i><span>Item</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFilter" title="Adicionar Filtro">';
    mainHtml += '            <i class="glyphicon glyphicon-filter"></i><span>Filtro</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFonte" title="Adicionar Fonte">';
    mainHtml += '            <i class="glyphicon glyphicon-hdd"></i><span>Fonte</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="openLayoutBuilder" title="Layout Builder">';
    mainHtml += '            <i class="glyphicon glyphicon-blackboard"></i><span>Layouts</span>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div class="mdash-sidebar-divider"></div>';

    // Accordion com os componentes (mantém filtros, listas)
    mainHtml += '      <div class="panel-group" id="mdash-accordion">';

    // Separadores (Tabs do dashboard)
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-tabs">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-folder-close"></i> Separadores';
    mainHtml += '              <span class="badge pull-right">{{ tabs.length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-tabs" class="panel-collapse collapse in">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addDashboardTab" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Separador';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="tabs.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum separador</small></p>';
    mainHtml += '                <div v-for="tab in $computed.sortedTabs()" :key="tab.mdashtabstamp" class="mdash-sidebar-item mdash-sidebar-tab" :class="{\'is-active\': activeTabStamp === tab.mdashtabstamp}" :data-stamp="tab.mdashtabstamp" :style="getTabInlineStyle(tab)">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="selectDashboardTab(tab.mdashtabstamp)">';
    mainHtml += '                    <span class="mdash-sidebar-tab-accent"></span>';
    mainHtml += '                    <i :class="tab.icone || \'glyphicon glyphicon-list-alt\'"></i>';
    mainHtml += '                    <span>{{ tab.titulo || \'Sem nome\' }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions mdash-tab-color-wrap">';
    mainHtml += '                    <button type="button" class="mdash-tab-color-swatch" :style="getPhcSwatchStyle(getTabColor(tab))" @click.stop="toggleTabColorPicker(tab.mdashtabstamp)" title="Cor do separador"></button>';
    mainHtml += '                    <div v-if="tabColorPickerOpenFor === tab.mdashtabstamp" class="mdash-phc-color-picker" @click.stop>';
    mainHtml += '                      <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabColor(tab) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabColor(tab, opt.value)"></button>';
    mainHtml += '                    </div>';
    mainHtml += '                    <button type="button" @click.stop="deleteDashboardTab(tab.mdashtabstamp)" class="btn btn-xs mdash-btn-delete" title="Remover separador">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // ── Objetos (catálogo de componentes visuais) ──
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-objects">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-object-align-bottom"></i> Objetos';
    mainHtml += '              <span class="badge pull-right">{{ getObjectCatalogCount() }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-objects" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body mdash-objects-panel">';
    mainHtml += '              <div class="mdash-objects-search-wrapper">';
    mainHtml += '                <i class="glyphicon glyphicon-search"></i>';
    mainHtml += '                <input type="text" class="mdash-objects-search" placeholder="Pesquisar objetos..." v-model="objectSearchQuery" />';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-objects-catalog">';
    mainHtml += '                <div v-for="cat in getFilteredObjectCatalog()" :key="cat.category" class="mdash-obj-category">';
    mainHtml += '                  <p class="mdash-obj-category-label">{{ cat.category }}</p>';
    mainHtml += '                  <div class="mdash-obj-tiles">';
    mainHtml += '                    <div v-for="obj in cat.items" :key="obj.value" class="mdash-obj-tile" :data-object-type="obj.value" :title="obj.description" draggable="true" @dragstart="onObjectDragStart($event, obj)">';
    mainHtml += '                      <div class="mdash-obj-tile-icon" :style="\'background:\' + obj.color">';
    mainHtml += '                        <i :class="obj.icon"></i>';
    mainHtml += '                      </div>';
    mainHtml += '                      <div class="mdash-obj-tile-info">';
    mainHtml += '                        <span class="mdash-obj-tile-name">{{ obj.label }}</span>';
    mainHtml += '                        <span class="mdash-obj-tile-desc">{{ obj.description }}</span>';
    mainHtml += '                      </div>';
    mainHtml += '                    </div>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '                <p v-if="getFilteredObjectCatalog().length === 0" class="text-muted text-center" style="padding:16px 0;"><small><i class="glyphicon glyphicon-info-sign"></i> Nenhum objeto encontrado</small></p>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Filtros
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-filters">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-filter"></i> Filtros';
    mainHtml += '              <span class="badge pull-right">{{ $computed.visibleFilters().length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-filters" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addNewFilter" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Filtro';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="$computed.visibleFilters().length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum filtro</small></p>';
    mainHtml += '                <div v-for="(filter, index) in $computed.visibleFilters()" :key="filter.mdashfilterstamp" class="mdash-sidebar-item" :data-stamp="filter.mdashfilterstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editFilter(filter.mdashfilterstamp)">';
    mainHtml += '                    <i :class="getFilterTypeIcon(filter.tipo)"></i>';
    mainHtml += '                    <span>{{ filter.descricao || filter.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                    <small class="mdash-filter-scope-badge">{{ (filter.escopo || \'global\') === \'global\' ? \'Global\' : \'Tab\' }}</small>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="deleteFilter(filter.mdashfilterstamp)" class="btn btn-xs mdash-btn-delete">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Containers
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-containers">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-th-large"></i> Containers';
    mainHtml += '              <span class="badge pull-right">{{ $computed.visibleContainers().length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-containers" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="$computed.visibleContainers().length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum container</small></p>';
    mainHtml += '                <div v-for="(container, index) in $computed.visibleContainers()" :key="container.mdashcontainerstamp" class="mdash-sidebar-item mdash-sidebar-container" :data-stamp="container.mdashcontainerstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="selectContainer(container.mdashcontainerstamp, $event)">';
    mainHtml += '                    <i class="glyphicon glyphicon-th-large"></i>';
    mainHtml += '                    <span>{{ container.titulo || container.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                    <span v-if="getContainerItemsCount(container.mdashcontainerstamp) > 0" class="badge badge-info">{{ getContainerItemsCount(container.mdashcontainerstamp) }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="clipCopy(\'container\', container.mdashcontainerstamp)" class="btn btn-xs btn-default mdash-clip-btn" title="Copiar container"><i class="glyphicon glyphicon-copy"></i></button>';
    mainHtml += '                    <button type="button" v-if="$computed.clipboardType() === \'containerItem\'" @click.stop="clipPasteIntoContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-default mdash-clip-btn mdash-clip-paste" title="Colar item(ns) aqui"><i class="glyphicon glyphicon-paste"></i></button>';
    mainHtml += '                    <button type="button" @click.stop="deleteContainer(container.mdashcontainerstamp)" class="btn btn-xs mdash-btn-delete">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Fontes de Dados (apenas globais na sidebar)
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-fontes">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-hdd"></i> Fontes Globais';
    mainHtml += '              <span class="badge pull-right">{{ getGlobalFontesCount() }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-fontes" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addNewFonte" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Fonte Global';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="getGlobalFontesCount() === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhuma fonte global</small></p>';
    mainHtml += '                <div v-for="(fonte, index) in getGlobalFontes()" :key="fonte.mdashfontestamp" class="mdash-sidebar-item" :data-stamp="fonte.mdashfontestamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editFonte(fonte.mdashfontestamp)">';
    mainHtml += '                    <i class="glyphicon glyphicon-hdd"></i>';
    mainHtml += '                    <span>{{ fonte.descricao || fonte.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                    <span class="mdash-fonte-status" :class="\'status-\' + (fonte.status || \'idle\')"></span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <button type="button" @click.stop="deleteFonte(fonte.mdashfontestamp)" class="btn btn-xs mdash-btn-delete">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    mainHtml += '      </div>'; // fim accordion
    mainHtml += '    </div>'; // fim sidebar-body
    mainHtml += '  </div>'; // fim sidebar

    // Canvas (Área de trabalho)
    mainHtml += '  <div class="mdash-canvas">';
    mainHtml += '    <div class="mdash-canvas-body" id="mdash-canvas-body">';
    mainHtml += '      <div class="mdash-canvas-commandbar">';
    mainHtml += '        <div class="mdash-commandbar-title"><i class="glyphicon glyphicon-modal-window"></i> Dashboard Builder</div>';
    mainHtml += '        <div class="mdash-commandbar-actions">';
    mainHtml += '          <label class="mdash-tabs-toggle" title="Activar multi-separadores">';
    mainHtml += '            <input type="checkbox" :checked="$computed.isMultiTabsEnabled()" @change="toggleMultiTabs($event)" />';
    mainHtml += '            <span>Multi separadores</span>';
    mainHtml += '          </label>';
    mainHtml += '          <button type="button"  class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-eye-open"></i> Pré visualizar</button>';
   /* mainHtml += '          <button type="button" @click="addNewFilter" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-filter"></i> Novo Filtro</button>';
    mainHtml += '          <button type="button" @click="addNewFonte" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-oil"></i> Nova Fonte</button>';*/
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-if="$computed.isMultiTabsEnabled()" class="mdash-dashboard-tabs-wrap">';
    mainHtml += '        <div class="mdash-dashboard-tabs" id="mdash-dashboard-tabs">';
    mainHtml += '          <div v-for="tab in $computed.sortedTabs()" :key="tab.mdashtabstamp" class="mdash-dashboard-tab" :class="{\'is-active\': activeTabStamp === tab.mdashtabstamp}" :style="getTabInlineStyle(tab)" :data-stamp="tab.mdashtabstamp" @click="selectDashboardTab(tab.mdashtabstamp)">';
    mainHtml += '            <span class="mdash-dashboard-tab-accent"></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-curve mdash-dashboard-tab-curve-l" aria-hidden="true"></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-curve mdash-dashboard-tab-curve-r" aria-hidden="true"></span>';
    mainHtml += '            <button type="button" class="mdash-dashboard-tab-iconbtn" @click.stop="toggleTabEditor(tab.mdashtabstamp)" title="Alterar ícone / cor"><i :class="tab.icone || \'glyphicon glyphicon-list-alt\'"></i></button>';
    mainHtml += '            <input type="text" :value="tab.titulo" @click.stop="selectDashboardTab(tab.mdashtabstamp)" @change.stop="updateDashboardTabTitle(tab, $event)" class="mdash-dashboard-tab-title" placeholder="Sem nome" />';
    mainHtml += '            <span class="mdash-dashboard-tab-close" @click.stop="deleteDashboardTab(tab.mdashtabstamp)" title="Remover separador"><i class="glyphicon glyphicon-remove"></i></span>';
    mainHtml += '            <div v-if="tabEditorOpenFor === tab.mdashtabstamp" class="mdash-tab-editor-popover" @click.stop>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor de fundo</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabColor(tab) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabColor(tab, opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabColor(tab)}" :style="getPhcSwatchStyle(getTabCustomColorValue(tab))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabCustomColorValue(tab)" @input.stop="setTabCustomColor(tab, $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor do ícone</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabIconColor(tab) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabIconColor(tab, opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabIconColor(tab)}" :style="getPhcSwatchStyle(getTabIconCustomColorValue(tab))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabIconCustomColorValue(tab)" @input.stop="setTabIconCustomColor(tab, $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor do texto</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button type="button" class="mdash-phc-color-option mdash-phc-color-auto" :class="{\'is-active\': getTabTextColor(tab) === \'default\'}" title="Automático" @click.stop="setTabTextColor(tab, \'default\')"><i class="glyphicon glyphicon-adjust"></i></button>';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabTextColor(tab) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabTextColor(tab, opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabTextColor(tab)}" :style="getPhcSwatchStyle(getTabTextCustomColorValue(tab))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabTextCustomColorValue(tab)" @input.stop="setTabTextCustomColor(tab, $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Fonte</div>';
    mainHtml += '                <select class="mdash-tab-editor-font" :value="getTabFontFamily(tab)" @change.stop="setTabFontFamily(tab, $event)">';
    mainHtml += '                  <option value="">(Padrão)</option>';
    mainHtml += '                  <option v-for="f in getTabFontOptions()" :key="f.value" :value="f.value" :style="\'font-family:\' + f.value">{{ f.label }}</option>';
    mainHtml += '                </select>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Ícone</div>';
    mainHtml += '                <div class="mdash-tab-editor-icons">';
    mainHtml += '                  <button v-for="ic in getTabIconOptions()" :key="ic" type="button" class="mdash-tab-editor-icon" :class="{\'is-active\': (tab.icone||\'\') === ic}" @click.stop="setTabIcon(tab, ic)"><i :class="ic"></i></button>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '          <button type="button" class="mdash-dashboard-tab-add" @click="addDashboardTab" title="Adicionar separador"><i class="glyphicon glyphicon-plus"></i></button>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-if="$computed.visibleContainers().length === 0" class="mdash-canvas-empty mdash-drop-target">';
    mainHtml += '        <i class="glyphicon glyphicon-info-sign"></i>';
    mainHtml += '        <p>Arraste um Container para começar a construir seu dashboard.</p>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-for="(container, index) in $computed.visibleContainers()" :key="container.mdashcontainerstamp" class="mdash-canvas-container" :data-stamp="container.mdashcontainerstamp" @click.stop="selectContainer(container.mdashcontainerstamp, $event)" :class="{\'is-selected\': selectedComponent.stamp === container.mdashcontainerstamp}">';
    mainHtml += '        <div class="mdash-container-label">Container {{ index + 1 }}</div>';
    mainHtml += '        <div class="mdash-canvas-container-header">';
    mainHtml += '          <div class="mdash-container-drag-handle" title="Arraste para mover o container"><i class="glyphicon glyphicon-move"></i></div>';
    mainHtml += '          <input type="text" class="mdash-inline-title" :value="container.titulo" @change.stop="updateContainerTitle(container, $event)" @click.stop placeholder="Container sem título" />';
    mainHtml += '          <div class="mdash-canvas-container-actions">';
    mainHtml += '            <button type="button" @click.stop="clipCopy(\'container\', container.mdashcontainerstamp)" class="btn btn-xs btn-default mdash-clip-btn" title="Copiar container"><i class="glyphicon glyphicon-copy"></i></button>';
    mainHtml += '            <button type="button" v-if="$computed.clipboardType() === \'containerItem\'" @click.stop="clipPasteIntoContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-default mdash-clip-btn mdash-clip-paste" title="Colar item(ns) aqui"><i class="glyphicon glyphicon-paste"></i></button>';
    mainHtml += '            <button type="button" @click.stop="editContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-default" title="Configurar"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '            <button type="button" @click.stop="deleteContainer(container.mdashcontainerstamp)" class="btn btn-xs btn-primary" title="Eliminar"><i class="glyphicon glyphicon-trash"></i></button>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '        <div class="mdash-canvas-container-body mdash-drop-target mdash-container-items" :data-container="container.mdashcontainerstamp">';
    mainHtml += '          <div class="mdash-container-items-row" :class="{\'is-empty\': getContainerItems(container.mdashcontainerstamp).length === 0}">';
    mainHtml += '            <div v-if="getContainerItems(container.mdashcontainerstamp).length === 0" class="mdash-canvas-empty-items">';
    mainHtml += '              <small class="text-muted">Arraste um Container Item para este container</small>';
    mainHtml += '            </div>';
    mainHtml += '            <div v-for="item in getContainerItems(container.mdashcontainerstamp)" :key="item.mdashcontaineritemstamp" class="mdash-canvas-item" :class="{\'is-selected\': selectedComponent.stamp === item.mdashcontaineritemstamp}" :data-stamp="item.mdashcontaineritemstamp" @click.stop="selectContainerItem(item.mdashcontaineritemstamp, $event)" :style=\"getItemFlex(item)\">';
    mainHtml += '              <div class="mdash-canvas-item-card">';
    mainHtml += '                <div class="mdash-item-resize-handle mdash-item-resize-handle-left" title="Redimensionar (2-12 colunas; ALT para 1)"></div>';
    mainHtml += '                <div class="mdash-item-resize-handle mdash-item-resize-handle-right" title="Redimensionar (2-12 colunas; ALT para 1)"></div>';
    mainHtml += '                <div class="mdash-canvas-item-header">';
    mainHtml += '                  <div class="mdash-item-header-top">';
    mainHtml += '                    <div class="mdash-item-title-wrapper" @mousedown.stop>';
    mainHtml += '                      <input type="text" class="mdash-inline-title mdash-inline-title-sm" :value="item.titulo" @input="updateItemTitleInput(item, $event)" @blur="updateItemTitleBlur(item, $event)" placeholder="Item sem título" />';
    mainHtml += '                      <span class="mdash-item-size-badge" :data-item-stamp="item.mdashcontaineritemstamp" :title="\'Largura: \' + getItemSize(item) + \' colunas\'">{{ getItemSize(item) }} col</span>';
    mainHtml += '                    </div>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-item-header-bottom">';
    mainHtml += '                    <div class="mdash-inline-layout-picker" @click.stop>';
    mainHtml += '                      <button type="button" class="mdash-inline-layout-trigger" @click.stop="toggleTemplatePicker(item.mdashcontaineritemstamp)" title="Alterar layout">';
    mainHtml += '                        <span class="mdash-inline-layout-thumb" v-html="getTemplateThumbHtml(item.templatelayout)"></span>';
    mainHtml += '                        <span class="mdash-inline-layout-name">{{ getTemplateLabel(item.templatelayout) }}</span>';
    mainHtml += '                        <i class="glyphicon glyphicon-chevron-down"></i>';
    mainHtml += '                      </button>';
    mainHtml += '                      <div v-if="openTemplatePickerFor === item.mdashcontaineritemstamp" class="mdash-inline-layout-menu">';
    mainHtml += '                        <button type="button" class="mdash-inline-layout-option" v-for="tpl in getTemplateLayouts()" :key="tpl.codigo" @click.stop="selectItemLayout(item, tpl.codigo)">';
    mainHtml += '                          <span class="mdash-inline-layout-thumb" v-html="getTemplateThumbHtml(tpl.codigo)"></span>';
    mainHtml += '                          <span class="mdash-inline-layout-name">{{ tpl.descricao }}</span>';
    mainHtml += '                        </button>';
    mainHtml += '                      </div>';
    mainHtml += '                    </div>';
    mainHtml += '                    <div class="mdash-item-header-actions">';
    mainHtml += '                    <button type="button" @click.stop="clipCopy(\'containerItem\', item.mdashcontaineritemstamp)" class="btn btn-xs btn-default mdash-clip-btn" title="Copiar item"><i class="glyphicon glyphicon-copy"></i></button>';
    mainHtml += '                    <button type="button" v-if="$computed.clipboardType() === \'object\'" @click.stop="clipPasteIntoItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-default mdash-clip-btn mdash-clip-paste" title="Colar objecto(s) aqui"><i class="glyphicon glyphicon-paste"></i></button>';
    mainHtml += '                    <button type="button" @click.stop="editContainerItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-default" title="Configurar"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '                    <button type="button" @click.stop="deleteContainerItem(item.mdashcontaineritemstamp)" class="btn btn-xs btn-primary" title="Eliminar"><i class="glyphicon glyphicon-trash"></i></button>';
    mainHtml += '                  </div>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    // ── Canvas item body: renderizado via renderContainerItemTemplate() + injectSlotDropOverlays() ──
    mainHtml += '                <div class="mdash-canvas-item-body">';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '          <div style="margin-top:6px;text-align:right;">';
    mainHtml += '            <button type="button" @click.stop="addContainerItem(container.mdashcontainerstamp)" class="btn btn-xs btn-primary">';
    mainHtml += '              <i class="glyphicon glyphicon-plus"></i> Add Item';
    mainHtml += '            </button>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '    </div>';
    mainHtml += '  </div>';

    // Coluna de propriedades (3 tabs: Propriedades, Fontes, Acções) — FlutterFlow-inspired
    mainHtml += '  <div class="mdash-properties" :class="{\'is-collapsed\': isPropertiesCollapsed}">';

    // ── Header com tipo do componente seleccionado (estilo FlutterFlow dark header) ──
    mainHtml += '    <div class="mdash-props-component-header" id="mdash-props-component-header">';
    mainHtml += '      <div class="mdash-props-component-info">';
    mainHtml += '        <span class="mdash-props-component-icon"><i class="glyphicon glyphicon-stop"></i></span>';
    mainHtml += '        <span class="mdash-props-component-name">Nenhum seleccionado</span>';
    mainHtml += '      </div>';
    mainHtml += '      <button type="button" class="btn btn-link btn-xs mdash-properties-toggle" @click.stop="toggleProperties" :title="isPropertiesCollapsed ? \'Expandir\' : \'Colapsar\'"><i :class="isPropertiesCollapsed ? \'glyphicon glyphicon-chevron-left\' : \'glyphicon glyphicon-chevron-right\'"></i></button>';
    mainHtml += '    </div>';

    mainHtml += '    <div class="mdash-properties-rail-actions">';
    mainHtml += '      <div class="mdash-properties-header"><span><i class="glyphicon glyphicon-wrench"></i></span><button type="button" class="btn btn-default btn-xs mdash-panel-toggle mdash-properties-toggle" @click.stop="toggleProperties"><i :class="isPropertiesCollapsed ? \'glyphicon glyphicon-chevron-left\' : \'glyphicon glyphicon-chevron-right\'"></i></button></div>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="editSelectedComponent" title="Editar selecionado"><i class="glyphicon glyphicon-cog"></i></button>';
    mainHtml += '      <button type="button" class="btn btn-default btn-sm" @click="addChildForSelected" title="Adicionar ao selecionado"><i class="glyphicon glyphicon-plus"></i></button>';
    mainHtml += '    </div>';

    // ── Tab bar com ícones + labels (estilo FlutterFlow icon row) ──
    mainHtml += '    <ul class="mdash-props-tabs" id="mdash-props-tabs">';
    mainHtml += '      <li class="mdash-props-tab is-active" data-tab="properties" title="Propriedades"><i class="glyphicon glyphicon-wrench"></i><span>Propriedades</span></li>';
    mainHtml += '      <li class="mdash-props-tab" data-tab="fontes" title="Fontes de Dados"><i class="glyphicon glyphicon-hdd"></i><span>Fontes</span></li>';
    mainHtml += '      <li class="mdash-props-tab" data-tab="actions" title="Acções / Eventos"><i class="glyphicon glyphicon-flash"></i><span>Acções</span></li>';
    mainHtml += '    </ul>';

    // ── Conteúdo das tabs ──
    mainHtml += '    <div class="mdash-props-tab-content">';
    mainHtml += '      <div class="mdash-props-tab-pane is-active" data-tab-pane="properties" id="mdash-properties-panel">';
    mainHtml += '        <div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hand-up"></i><p>Selecione um Container ou Item</p></div>';
    mainHtml += '      </div>';
    mainHtml += '      <div class="mdash-props-tab-pane" data-tab-pane="fontes" id="mdash-fontes-panel">';
    mainHtml += '        <div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hdd"></i><p>Selecione um componente para ver as fontes</p></div>';
    mainHtml += '      </div>';
    mainHtml += '      <div class="mdash-props-tab-pane" data-tab-pane="actions" id="mdash-actions-panel">';
    mainHtml += '        <div class="mdash-props-empty-state"><i class="glyphicon glyphicon-flash"></i><p>Selecione um componente para configurar acções</p></div>';
    mainHtml += '      </div>';
    mainHtml += '    </div>';
    mainHtml += '  </div>';

    mainHtml += '</div>'; // fim mdash-modern-layout
    mainHtml += '</div>'; // fim mdash-editor-wrapper

    // Injeta no DOM
    $('#m-dash-main-container').html(mainHtml);

    // Carrega estilos
    loadModernDashboardStyles();

    // Cria estado reativo global centralizado usando PetiteVue.reactive
    var _dashCfg = GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp });
    if (!GMDashConfig.length) GMDashConfig = [_dashCfg];
    var _dashSettings = (typeof _dashCfg.getConfig === 'function') ? _dashCfg.getConfig() : {};
    // Normaliza settings vindos da BD (legacy: 1/0, chaves antigas como primeiroTabStamp)
    _dashSettings.activarMultiSeparadores = !!_dashSettings.activarMultiSeparadores;
    if (!_dashSettings.activeTabStamp && _dashSettings.primeiroTabStamp) {
        _dashSettings.activeTabStamp = _dashSettings.primeiroTabStamp;
    }
    delete _dashSettings.primeiroTabStamp;
    var _initialActiveTab = _dashSettings.activeTabStamp || ((GMDashTabs[0] && GMDashTabs[0].mdashtabstamp) || '');

    window.appState = PetiteVue.reactive({
        tabs: GMDashTabs,
        filters: GMDashFilters,
        containers: GMDashContainers,
        containerItems: GMDashContainerItems,
        containerItemObjects: GMDashContainerItemObjects,
        fontes: GMDashFontes,
        dashboardConfig: _dashCfg,
        dashboardSettings: _dashSettings,
        activeTabStamp: _initialActiveTab,
        clipboardType: ''
    });

    // Inicializa PetiteVue com reatividade (sem getters)
    GMDashReactiveInstance = PetiteVue.createApp({
        // Acessa o estado reativo global diretamente
        tabs: window.appState.tabs,
        filters: window.appState.filters,
        containers: window.appState.containers,
        containerItems: window.appState.containerItems,
        containerItemObjects: window.appState.containerItemObjects,
        fontes: window.appState.fontes,
        activeTabStamp: window.appState.activeTabStamp,
        selectedComponent: { type: "", stamp: "", data: null },
        isSidebarCollapsed: false,
        isPropertiesCollapsed: false,
        openTemplatePickerFor: "",
        tabColorPickerOpenFor: "",
        tabEditorOpenFor: "",
        objectSearchQuery: "",
        $computed: {
            sortedFilters: function() {
                return window.appState.filters.slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            sortedContainers: function() {
                return window.appState.containers.slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            sortedTabs: function () {
                if (!GMDashTabsRuntime) return window.appState.tabs.slice();
                return GMDashTabsRuntime.getSortedTabs();
            },

            isMultiTabsEnabled: function () {
                return !!(window.appState.dashboardSettings && window.appState.dashboardSettings.activarMultiSeparadores);
            },

            visibleContainers: function () {
                if (!GMDashTabsRuntime) {
                    return window.appState.containers.slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
                }
                return GMDashTabsRuntime.getVisibleContainers(window.appState.containers)
                    .slice()
                    .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
            },

            visibleFilters: function () {
                var all = window.appState.filters || [];
                if (!GMDashTabsRuntime || !GMDashTabsRuntime.isEnabled()) return all;
                var active = window.appState.activeTabStamp || '';
                return all.filter(function (f) {
                    var scope = f.escopo || 'global';
                    if (scope === 'global') return true;
                    return (f.mdashtabstamp || '') === active;
                });
            },

            clipboardType: function () {
                return window.appState.clipboardType || '';
            }
        },

        getFilterTypeIcon: function (tipo) {
            return getFilterTypeIcon(tipo);
        },

        getObjectTypeIcon: function (tipo) {
            return getObjectTypeIcon(tipo);
        },

        getObjectCatalog: function () {
            return getObjectCatalogDefinitions();
        },

        getObjectCatalogCount: function () {
            return getObjectCatalogDefinitions().reduce(function (sum, cat) { return sum + cat.items.length; }, 0);
        },

        getFilteredObjectCatalog: function () {
            var q = (this.objectSearchQuery || '').toLowerCase().trim();
            var catalog = getObjectCatalogDefinitions();
            if (!q) return catalog;
            return catalog.map(function (cat) {
                var filtered = cat.items.filter(function (item) {
                    return item.label.toLowerCase().indexOf(q) !== -1 ||
                           item.description.toLowerCase().indexOf(q) !== -1 ||
                           item.value.toLowerCase().indexOf(q) !== -1;
                });
                return filtered.length > 0 ? { category: cat.category, items: filtered } : null;
            }).filter(Boolean);
        },

        getSlotObject: function (itemStamp, slotId) {
            return window.appState.containerItemObjects.find(function (obj) {
                return obj.mdashcontaineritemstamp === itemStamp && obj.slotid === slotId;
            }) || null;
        },

        removeObjectFromSlot: function (itemStamp, slotId) {
            var idx = window.appState.containerItemObjects.findIndex(function (obj) {
                return obj.mdashcontaineritemstamp === itemStamp && obj.slotid === slotId;
            });
            if (idx !== -1) {
                var obj = window.appState.containerItemObjects[idx];
                window.appState.containerItemObjects.splice(idx, 1);
                if (typeof deleteGenericRecord === 'function') {
                    deleteGenericRecord(obj.table, obj.idfield, obj[obj.idfield]);
                }
            }
        },

        onObjectDragStart: function (event, obj) {
            event.dataTransfer.setData('application/mdash-object', JSON.stringify(obj));
            event.dataTransfer.effectAllowed = 'copy';
        },

        // ── Fontes globais (para sidebar) ──
        getGlobalFontes: function () {
            return window.appState.fontes.filter(function (f) { return f.scope === 'global'; });
        },

        getGlobalFontesCount: function () {
            return window.appState.fontes.filter(function (f) { return f.scope === 'global'; }).length;
        },

        getContainerItemsCount: function (containerStamp) {
            return window.appState.containerItems.filter(function (item) {
                return item.mdashcontainerstamp === containerStamp;
            }).length;
        },

        getTabInlineStyle: function (tab) {
            return GMDashTabsRuntime ? GMDashTabsRuntime.getTabStyle(tab) : '';
        },

        getTabColor: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab && tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.cor || 'primary';
        },

        getTabAccentStyle: function (tab) {
            return GMDashTabsRuntime ? GMDashTabsRuntime.getTabAccentStyle(tab) : '';
        },

        getPhcColorOptions: function () {
            return [
                { value: 'primary', label: 'Primary' },
                { value: 'success', label: 'Success' },
                { value: 'info',    label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'danger',  label: 'Danger' },
                { value: 'default', label: 'Default' }
            ];
        },

        getPhcSwatchStyle: function (phcType) {
            if (typeof phcType === 'string' && phcType.charAt(0) === '#') return 'background:' + phcType + ';';
            var bg = '#2563eb';
            try {
                if (typeof getColorByType === 'function') {
                    var c = getColorByType(phcType || 'primary');
                    if (c && c.background) bg = c.background;
                }
            } catch (e) { }
            return 'background:' + bg + ';';
        },

        isCustomTabColor: function (tab) {
            var v = this.getTabColor(tab);
            return typeof v === 'string' && v.charAt(0) === '#';
        },

        getTabCustomColorValue: function (tab) {
            var v = this.getTabColor(tab);
            return (typeof v === 'string' && v.charAt(0) === '#') ? v : '#2563eb';
        },

        setTabCustomColor: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            if (!val) return;
            this.setTabColor(tab, val);
        },

        toggleTabColorPicker: function (tabStamp) {
            var _this = this;
            var wasOpen = this.tabColorPickerOpenFor === tabStamp;
            this.tabColorPickerOpenFor = wasOpen ? '' : tabStamp;
            if (!wasOpen) {
                setTimeout(function () {
                    $(document).one('click.mdashTabColor', function () {
                        _this.tabColorPickerOpenFor = '';
                    });
                }, 0);
            }
        },

        setTabColor: function (tab, phcType) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.cor = phcType || 'primary';
            tab.configjson = JSON.stringify(cfg);
            this.tabColorPickerOpenFor = '';
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },

        // ── Icon color (independent from background) ─────────────────────
        getTabIconColor: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.corIcone || 'primary';
        },
        isCustomTabIconColor: function (tab) {
            var v = this.getTabIconColor(tab);
            return typeof v === 'string' && v.charAt(0) === '#';
        },
        getTabIconCustomColorValue: function (tab) {
            var v = this.getTabIconColor(tab);
            return (typeof v === 'string' && v.charAt(0) === '#') ? v : '#2563eb';
        },
        setTabIconColor: function (tab, phcType) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.corIcone = phcType || 'primary';
            tab.configjson = JSON.stringify(cfg);
            console.log('[setTabIconColor] phcType=', phcType, '| tab.configjson AFTER=', tab.configjson, '| tab=', tab);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },
        setTabIconCustomColor: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            if (!val) return;
            this.setTabIconColor(tab, val);
        },

        // ── Text color (with 'default' = auto contrast) ──────────────────
        getTabTextColor: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.corTexto || 'default';
        },
        isCustomTabTextColor: function (tab) {
            var v = this.getTabTextColor(tab);
            return typeof v === 'string' && v.charAt(0) === '#';
        },
        getTabTextCustomColorValue: function (tab) {
            var v = this.getTabTextColor(tab);
            return (typeof v === 'string' && v.charAt(0) === '#') ? v : '#0f172a';
        },
        setTabTextColor: function (tab, val) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.corTexto = val || 'default';
            tab.configjson = JSON.stringify(cfg);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },
        setTabTextCustomColor: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            if (!val) return;
            this.setTabTextColor(tab, val);
        },

        // ── Font family ──────────────────────────────────────────────────
        getTabFontOptions: function () {
            return [
                { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
                { value: 'Roboto, sans-serif', label: 'Roboto' },
                { value: '"Segoe UI", Tahoma, sans-serif', label: 'Segoe UI' },
                { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica' },
                { value: 'Georgia, "Times New Roman", serif', label: 'Georgia' },
                { value: '"Courier New", monospace', label: 'Courier New' },
                { value: '"JetBrains Mono", "Fira Code", monospace', label: 'JetBrains Mono' },
                { value: 'Poppins, sans-serif', label: 'Poppins' },
                { value: 'Montserrat, sans-serif', label: 'Montserrat' },
                { value: '"Open Sans", sans-serif', label: 'Open Sans' }
            ];
        },
        getTabFontFamily: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.fontFamily || '';
        },
        setTabFontFamily: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.fontFamily = val || '';
            tab.configjson = JSON.stringify(cfg);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },

        getTabIconOptions: function () {
            return [
                'glyphicon glyphicon-home',
                'glyphicon glyphicon-list-alt',
                'glyphicon glyphicon-folder-open',
                'glyphicon glyphicon-stats',
                'glyphicon glyphicon-dashboard',
                'glyphicon glyphicon-th-large',
                'glyphicon glyphicon-user',
                'glyphicon glyphicon-briefcase',
                'glyphicon glyphicon-shopping-cart',
                'glyphicon glyphicon-usd',
                'glyphicon glyphicon-tag',
                'glyphicon glyphicon-calendar',
                'glyphicon glyphicon-envelope',
                'glyphicon glyphicon-cog',
                'glyphicon glyphicon-star',
                'glyphicon glyphicon-heart',
                'glyphicon glyphicon-globe',
                'glyphicon glyphicon-map-marker',
                'glyphicon glyphicon-eye-open',
                'glyphicon glyphicon-flag'
            ];
        },

        setTabIcon: function (tab, iconClass) {
            tab.icone = iconClass || 'glyphicon glyphicon-list-alt';
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },

        toggleTabEditor: function (tabStamp) {
            var _this = this;
            var wasOpen = this.tabEditorOpenFor === tabStamp;
            this.tabEditorOpenFor = wasOpen ? '' : tabStamp;
            if (!wasOpen) {
                setTimeout(function () {
                    $(document).one('click.mdashTabEditor', function () {
                        _this.tabEditorOpenFor = '';
                    });
                }, 0);
            }
        },

        toggleMultiTabs: function (event) {
            var enabled = !!(event && event.target && event.target.checked);
            var settings = window.appState.dashboardSettings || {};
            settings.activarMultiSeparadores = enabled;

            if (enabled) {
                if (!window.appState.tabs.length) {
                    var firstTab = GMDashTabsRuntime.createTab({
                        dashboardstamp: GMDashStamp,
                        titulo: 'Geral',
                        icone: 'glyphicon glyphicon-home',
                        configjson: JSON.stringify({ cor: 'primary' })
                    });
                    window.appState.activeTabStamp = firstTab.mdashtabstamp;
                }
                settings.activeTabStamp = window.appState.activeTabStamp || (window.appState.tabs[0] && window.appState.tabs[0].mdashtabstamp) || '';
            } else {
                settings.activeTabStamp = '';
                window.appState.activeTabStamp = '';
            }

            window.appState.dashboardSettings = settings;
            mdashSyncDashboardConfigRealtime();
            setTimeout(function () { if (typeof initDragAndDrop === 'function') initDragAndDrop(); }, 0);
        },

        addDashboardTab: function () {
            var nextIndex = (window.appState.tabs.length || 0) + 1;
            var tab = GMDashTabsRuntime.createTab({
                dashboardstamp: GMDashStamp,
                titulo: 'Separador ' + nextIndex,
                icone: 'glyphicon glyphicon-folder-open',
                configjson: JSON.stringify({ cor: 'primary', corIcone: '#ffffff', corTexto: '#ffffff' })
            });

            window.appState.activeTabStamp = tab.mdashtabstamp;
            this.activeTabStamp = tab.mdashtabstamp;

            var settings = window.appState.dashboardSettings || {};
            settings.activarMultiSeparadores = true;
            settings.activeTabStamp = tab.mdashtabstamp;
            window.appState.dashboardSettings = settings;
            mdashSyncDashboardConfigRealtime();
            setTimeout(function () { if (typeof initDragAndDrop === 'function') initDragAndDrop(); }, 0);
            alertify.success('Separador criado');
        },

        selectDashboardTab: function (tabStamp) {
            window.appState.activeTabStamp = tabStamp;
            this.activeTabStamp = tabStamp;
            var settings = window.appState.dashboardSettings || {};
            settings.activeTabStamp = tabStamp;
            window.appState.dashboardSettings = settings;
            mdashSyncDashboardConfigRealtime();
            // Re-render item templates (bodies são injectados imperativamente — PetiteVue
            // recria os nós .mdash-canvas-item-body vazios ao trocar de tab) e
            // rebind jQuery UI sortable/droppable dos novos nós.
            setTimeout(function () {
                if (typeof renderAllContainerItemTemplates === 'function') renderAllContainerItemTemplates();
                if (typeof syncAllContainerItemsLayout === 'function') syncAllContainerItemsLayout();
                if (typeof initDragAndDrop === 'function') initDragAndDrop();
            }, 0);
        },

        updateDashboardTabTitle: function (tab, event) {
            tab.titulo = (event && event.target ? event.target.value : tab.titulo || '').trim();
            if (!tab.titulo) tab.titulo = 'Sem nome';
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },

        updateDashboardTabColor: function (tab, phcType) {
            // legacy entry point — delegates to setTabColor (PHC type picker)
            this.setTabColor(tab, phcType || 'primary');
        },

        deleteDashboardTab: function (tabStamp) {
            var tab = window.appState.tabs.find(function (t) { return t.mdashtabstamp === tabStamp; });
            if (!tab) return;
            if ((window.appState.tabs || []).length <= 1 && (window.appState.dashboardSettings || {}).activarMultiSeparadores) {
                alertify.warning('Deve existir pelo menos um separador quando multi separadores está activo.');
                return;
            }

            var _this = this;
            var containersInTab = window.appState.containers.filter(function (c) { return (c.mdashtabstamp || '') === tabStamp; });
            showDeleteConfirmation({
                title: 'Remover separador',
                message: 'Tem a certeza que deseja remover o separador <strong>' + (tab.titulo || 'Sem nome') + '</strong>?<br><small>' + containersInTab.length + ' container(s) serão removidos em cascata.</small>',
                recordToDelete: { table: 'MdashTab', stamp: tabStamp, tableKey: 'mdashtabstamp' },
                onConfirm: function () {
                    containersInTab.forEach(function (c) {
                        GMdashDeleteRecords.push({ table: 'MdashContainer', stamp: c.mdashcontainerstamp, tableKey: 'mdashcontainerstamp' });
                        executeDeleteContainer(c.mdashcontainerstamp);
                    });
                    GMDashTabsRuntime.removeTab(tabStamp);

                    var sorted = GMDashTabsRuntime.getSortedTabs();
                    var nextTab = sorted.length ? sorted[0].mdashtabstamp : '';
                    window.appState.activeTabStamp = nextTab;
                    _this.activeTabStamp = nextTab;

                    var settings = window.appState.dashboardSettings || {};
                    settings.activeTabStamp = nextTab;
                    settings.activarMultiSeparadores = sorted.length > 0 && !!settings.activarMultiSeparadores;
                    window.appState.dashboardSettings = settings;
                    mdashSyncDashboardConfigRealtime();
                    setTimeout(function () { if (typeof initDragAndDrop === 'function') initDragAndDrop(); }, 0);
                    alertify.success('Separador removido');
                }
            });
        },

        getContainerItems: function (containerStamp) {
            return window.appState.containerItems
                .filter(function (item) {
                    return item.mdashcontainerstamp === containerStamp; // mostrar mesmo inactivos para edição
                })
                .sort(function (a, b) {
                    var aManual = isManualLayoutItem(a);
                    var bManual = isManualLayoutItem(b);
                    if (aManual || bManual) {
                        var rowDiff = (a.gridrow || 0) - (b.gridrow || 0);
                        if (rowDiff !== 0) return rowDiff;
                        var colDiff = (a.gridcolstart || 0) - (b.gridcolstart || 0);
                        if (colDiff !== 0) return colDiff;
                    }
                    return (a.ordem || 0) - (b.ordem || 0);
                });
        },

        getItemObjects: function (itemStamp) {
            return window.appState.containerItemObjects.filter(function (obj) {
                return obj.mdashcontaineritemstamp === itemStamp;
            });
        },

        getItemFlex: function (item) {
            return getItemGridStyleString(item);
        },
        
        getItemSize: function (item) {
            return getItemGridSpan(item);
        },

        getTemplateLayouts: function () {
            return getTemplateLayoutOptions();
        },

        getLayoutSlots: function (templateCode) {
            var template = getTemplateLayoutByCode(templateCode);
            if (!template) return [];
            return template.slots || forceJSONParse(template.slotsdefinition, []);
        },

        getSlotTypeIcon: function (type) {
            switch (type) {
                case 'text': return 'glyphicon glyphicon-font';
                case 'icon': return 'glyphicon glyphicon-picture';
                case 'content': return 'glyphicon glyphicon-th-large';
                default: return 'glyphicon glyphicon-stop';
            }
        },

        getTemplateLabel: function (templateCode) {
            var template = getTemplateLayoutByCode(templateCode);
            return (template && (template.descricao || template.codigo)) || "Selecionar layout";
        },

        getTemplateThumbHtml: function (templateCode) {
            return getTemplateThumbnailHtml(templateCode);
        },

        toggleTemplatePicker: function (itemStamp) {
            this.openTemplatePickerFor = this.openTemplatePickerFor === itemStamp ? "" : itemStamp;
        },

        toggleSidebar: function () {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
            setTimeout(initDragAndDrop, 0);
        },

        toggleProperties: function () {
            this.isPropertiesCollapsed = !this.isPropertiesCollapsed;
        },

        selectItemLayout: function (item, templateCode) {
            this.openTemplatePickerFor = "";
            if (!templateCode || item.templatelayout === templateCode) return;
            item.templatelayout = templateCode;
            renderContainerItemTemplate(item);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        },

        // Ações (delegam para as funções globais)
        addNewFilter: function () {
            addNewFilter();
        },

        editFilter: function (stamp) {
            editFilter(stamp);
        },

        deleteFilter: function (stamp) {
            deleteFilter(stamp);
        },

        openFiltersManagerModal: function () {
            openFiltersManagerModal();
        },

        addNewContainer: function () {
            addNewContainer();
        },

        editContainer: function (stamp) {
            editContainer(stamp);
        },

        deleteContainer: function (stamp) {
            deleteContainer(stamp);
        },

        moveContainer: function (stamp, direction) {
            moveContainer(stamp, direction);
        },

        addContainerItem: function (containerStamp) {
            addContainerItem(containerStamp);
        },

        editContainerItem: function (stamp) {
            editContainerItem(stamp);
        },

        editContainerItemObject: function (stamp) {
            editContainerItemObject(stamp);
        },

        addContainerItemObject: function (itemStamp) {
            addContainerItemObject(itemStamp);
        },

        addNewFonte: function () {
            addNewFonte();
        },

        openLayoutBuilder: function () {
            openLayoutBuilder();
        },

        editFonte: function (stamp) {
            editFonte(stamp);
        },

        deleteFonte: function (stamp) {
            deleteFonte(stamp);
        },

        // ── Copy / Paste via botões UI ──────────────────────────────
        clipCopy: function (type, stamp) {
            // Configura single-selection temporária e copia
            _currentSelectedComponent = { type: type, stamp: stamp, data: null };
            GMDashMultiSelection.stamps = [];
            GMDashMultiSelection.type = '';
            mdashCopySelection();
        },

        clipPasteIntoContainer: function (containerStamp) {
            // Paste de containerItems no container indicado
            if (!GMDashClipboard.items.length || GMDashClipboard.type !== 'containerItem') return;
            var pastedCount = 0;
            GMDashClipboard.items.forEach(function (snap) {
                pastedCount += _clipPasteContainerItem(snap, containerStamp);
            });
            if (pastedCount > 0) {
                setTimeout(function () {
                    renderAllContainerItemTemplates();
                    if (typeof initDragAndDrop === 'function') initDragAndDrop();
                }, 50);
                if (typeof alertify !== 'undefined') alertify.success(pastedCount + ' item(ns) colado(s)');
            }
        },

        clipPasteIntoItem: function (itemStamp) {
            // Paste de objectos no item indicado
            if (!GMDashClipboard.items.length || GMDashClipboard.type !== 'object') return;
            var pastedCount = 0;
            GMDashClipboard.items.forEach(function (snap) {
                pastedCount += _clipPasteObject(snap, itemStamp);
            });
            if (pastedCount > 0) {
                setTimeout(function () {
                    renderAllContainerItemTemplates();
                    if (typeof initDragAndDrop === 'function') initDragAndDrop();
                }, 50);
                if (typeof alertify !== 'undefined') alertify.success(pastedCount + ' objecto(s) colado(s)');
            }
        },

        quickAddItemFromRail: function () {
            var selected = this.selectedComponent || {};
            if (selected.type === "container" && selected.stamp) {
                addContainerItem(selected.stamp);
                return;
            }
            var vis = this.$computed.visibleContainers();
            if (vis.length > 0) {
                addContainerItem(vis[0].mdashcontainerstamp);
                return;
            }
            addNewContainer();
        },

        editSelectedComponent: function () {
            var selected = this.selectedComponent || {};
            if (!selected.stamp) return;
            if (selected.type === "container") {
                editContainer(selected.stamp);
                return;
            }
            if (selected.type === "containerItem") {
                editContainerItem(selected.stamp);
            }
        },

        addChildForSelected: function () {
            var selected = this.selectedComponent || {};
            if (selected.type === "container" && selected.stamp) {
                addContainerItem(selected.stamp);
                return;
            }
            if (selected.type === "containerItem" && selected.stamp) {
                addContainerItemObject(selected.stamp);
                return;
            }
            this.quickAddItemFromRail();
        },

        selectContainer: function (stamp, evt) {
            evt = evt || {};
            // Multi-select: Ctrl+Click ou Shift+Click
            var orderedStamps = this.$computed.visibleContainers()
                .slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); })
                .map(function (c) { return c.mdashcontainerstamp; });
            if (mdashHandleMultiSelect('container', stamp, evt, orderedStamps)) return;
            this.openTemplatePickerFor = "";
            $('.mdash-slot-zone-drop.is-selected').removeClass('is-selected');
            var container = window.appState.containers.find(function (c) { return c.mdashcontainerstamp === stamp; });
            if (!container) return;
            this.selectedComponent = { type: "container", stamp: stamp, data: container };
            handleComponentProperties(this.selectedComponent);
        },

        selectContainerItem: function (stamp, evt) {
            evt = evt || {};
            // Multi-select: Ctrl+Click ou Shift+Click
            // Ordered list: items do mesmo container
            var item = window.appState.containerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
            if (!item) return;
            var parentStamp = item.mdashcontainerstamp;
            var orderedStamps = window.appState.containerItems
                .filter(function (i) { return i.mdashcontainerstamp === parentStamp; })
                .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); })
                .map(function (i) { return i.mdashcontaineritemstamp; });
            if (mdashHandleMultiSelect('containerItem', stamp, evt, orderedStamps)) return;
            this.openTemplatePickerFor = "";
            $('.mdash-slot-zone-drop.is-selected').removeClass('is-selected');
            this.selectedComponent = { type: "containerItem", stamp: stamp, data: item };
            handleComponentProperties(this.selectedComponent);
        },

        updateContainerTitle: function (container, event) {
            container.titulo = event.target.value.trim();
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(container, container.table, container.idfield);
            }
        },

        updateItemTitleInput: function (item, event) {
            // Durante a digitação, não faz trim para permitir espaços
            item.titulo = event.target.value;
        },
        
        updateItemTitleBlur: function (item, event) {
            // Quando perde foco, faz trim e sincroniza
            item.titulo = event.target.value.trim();
            renderContainerItemTemplate(item);
            setTimeout(syncAllContainerItemsLayout, 0);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        },
        
        updateItemTitle: function (item, event) {
            item.titulo = event.target.value.trim();
            renderContainerItemTemplate(item);
            setTimeout(syncAllContainerItemsLayout, 0);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        },

        deleteContainerItem: function (stamp) {
            deleteContainerItem(stamp);
        },

        refreshCanvas: function () {
            alertify.success('Canvas atualizado');
        },

        onMounted: function () {
            console.log('MDash 2.0 montado com PetiteVue', {
                filtros: this.filters.length,
                containers: this.containers.length,
                fontes: this.fontes.length
            });
            initDragAndDrop();
            initPropertiesTabs();
            _mdashInitKeyboardShortcuts();
            if (GMDashTabsRuntime) {
                GMDashTabsRuntime.ensureActiveTab(false);
                this.activeTabStamp = window.appState.activeTabStamp;
            }
            setTimeout(syncAllContainerItemsLayout, 0);
        }
    }).mount('#m-dash-main-container');
}

// ============================================================================
// PROPERTIES PANEL - TAB SYSTEM
// ============================================================================

/**
 * Inicializa o sistema de tabs da coluna de propriedades.
 * Tabs: Propriedades | Fontes | Acções
 */
function initPropertiesTabs() {
    $(document).off('click.propstab').on('click.propstab', '.mdash-props-tab', function () {
        var $tab = $(this);
        var tabId = $tab.data('tab');

        // Actualiza tab activa
        $('.mdash-props-tab').removeClass('is-active');
        $tab.addClass('is-active');

        // Actualiza pane activo
        $('.mdash-props-tab-pane').removeClass('is-active');
        $('.mdash-props-tab-pane[data-tab-pane="' + tabId + '"]').addClass('is-active');

        // Re-render do painel activo sempre que o utilizador muda de tab,
        // garantindo que qualquer alteração feita noutro painel (ex: criar fonte)
        // é reflectida imediatamente sem precisar de actualizações cirúrgicas externas.
        if (_currentSelectedComponent) {
            if (tabId === 'fontes') {
                renderFontesPanel(_currentSelectedComponent);
            } else if (tabId === 'properties' && _currentSelectedComponent.type === 'object') {
                // Re-render apenas do painel de propriedades inline (não tocar nas tabs nem no fontes panel)
                _renderObjectPropertiesPanel(_currentSelectedComponent.data);
            }
        }
    });
}

/**
 * Activa programaticamente uma tab das propriedades.
 * @param {string} tabId - 'properties' | 'fontes' | 'actions'
 */
function activatePropertiesTab(tabId) {
    $('.mdash-props-tab').removeClass('is-active');
    $('.mdash-props-tab[data-tab="' + tabId + '"]').addClass('is-active');
    $('.mdash-props-tab-pane').removeClass('is-active');
    $('.mdash-props-tab-pane[data-tab-pane="' + tabId + '"]').addClass('is-active');
}

// ── Resolução de scope ────────────────────────────────────────────────────────
// Cada entrada define como derivar { scopeType, scopeStamp, parentContainerItemStamp,
// parentContainerStamp, label } a partir de (type, data).
// Para adicionar um novo tipo de componente basta acrescentar uma entrada aqui.

var _SCOPE_RESOLVERS = {
    container: function (data) {
        return {
            scopeType:  'container',
            scopeStamp: data.mdashcontainerstamp,
            parentContainerItemStamp: '',
            parentContainerStamp:     '',
            label: 'Container'
        };
    },
    containerItem: function (data) {
        return {
            scopeType:  'containeritem',
            scopeStamp: data.mdashcontaineritemstamp,
            parentContainerItemStamp: '',
            parentContainerStamp:     data.mdashcontainerstamp,
            label: 'Container Item'
        };
    },
    slot: function (data) {
        var ciStamp = data.itemStamp || '';
        var ci = ((window.appState && window.appState.containerItems) || [])
                    .find(function (i) { return i.mdashcontaineritemstamp === ciStamp; });
        return {
            scopeType:  'containeritem',
            scopeStamp: ciStamp,
            parentContainerItemStamp: '',
            parentContainerStamp:     ci ? ci.mdashcontainerstamp : '',
            label: 'Slot'
        };
    },
    object: function (data) {
        var ciStamp = data.mdashcontaineritemstamp || '';
        var ci = ((window.appState && window.appState.containerItems) || [])
                    .find(function (i) { return i.mdashcontaineritemstamp === ciStamp; });
        return {
            scopeType:  'object',
            scopeStamp: data.mdashcontaineritemobjectstamp,
            parentContainerItemStamp: ciStamp,
            parentContainerStamp:     ci ? ci.mdashcontainerstamp : '',
            label: 'Objecto'
        };
    },
    global: function () {
        return {
            scopeType:  'global',
            scopeStamp: '',
            parentContainerItemStamp: '',
            parentContainerStamp:     '',
            label: 'Global'
        };
    }
};

/**
 * Renderiza o painel de fontes para o componente seleccionado.
 * Mostra fontes próprias do scope + fontes herdadas (em cascata) + botão para adicionar.
 */
function renderFontesPanel(selectedComponent) {
    var panel = $('#mdash-fontes-panel');
    if (!panel.length) return;

    if (!selectedComponent || !selectedComponent.data) {
        panel.html('<p class="text-muted" style="margin:0;">Selecione um componente para gerir fontes.</p>');
        return;
    }

    var resolver = _SCOPE_RESOLVERS[selectedComponent.type];
    if (!resolver) {
        panel.html('<p class="text-muted" style="margin:0;">Tipo não suportado para fontes.</p>');
        return;
    }

    var scope = resolver(selectedComponent.data);

    var allFontes     = MDashFonte.getAvailableFontes(scope.scopeType, scope.scopeStamp, scope.parentContainerItemStamp, scope.parentContainerStamp);
    var isOwn         = function (f) { return f.scope === scope.scopeType && f.scopestamp === scope.scopeStamp; };
    var ownFontes      = allFontes.filter(isOwn);
    var inheritedFontes = allFontes.filter(function (f) { return !isOwn(f); });

    var sections = [
        { fontes: ownFontes,       canRemove: true,  icon: 'glyphicon-hdd',  label: 'Fontes deste ' + scope.label, marginTop: false },
        { fontes: inheritedFontes, canRemove: false, icon: 'glyphicon-link', label: 'Fontes herdadas',             marginTop: true  }
    ];

    var html = '<div class="mdash-fonte-add-bar">'
        + '  <span class="mdash-fonte-add-label">' + scope.label + '</span>'
        + '  <button type="button" class="mdash-fonte-add-btn mdash-add-scoped-fonte"'
        + '    data-scope="' + scope.scopeType + '" data-scopestamp="' + scope.scopeStamp + '" title="Nova Fonte">'
        + '    <i class="glyphicon glyphicon-plus"></i>'
        + '  </button>'
        + '</div>'
        + sections.map(function (s) {
            if (!s.fontes.length) return '';
            return '<p class="mdash-fonte-section-label"' + (s.marginTop ? ' style="margin-top:10px;"' : '') + '>'
                + '<i class="glyphicon ' + s.icon + '"></i> ' + s.label + '</p>'
                + renderFontesList(s.fontes, s.canRemove);
        }).join('')
        + (!ownFontes.length && !inheritedFontes.length
            ? '<p class="text-muted text-center" style="margin-top:12px;"><small>Nenhuma fonte disponível.</small></p>'
            : '');

    panel.html(html);

    var bindings = [
        { ns: 'addfonte',   sel: '.mdash-add-scoped-fonte', stop: false, fn: function () { addScopedFonte($(this).data('scope'), $(this).data('scopestamp')); } },
        { ns: 'editfonte',  sel: '.mdash-fonte-list-item',  stop: false, fn: function () { var s = $(this).data('fontestamp'); if (s) editFonteInPanel(s); } },
        { ns: 'removefonte',sel: '.mdash-fonte-remove',      stop: true,  fn: function () { var s = $(this).data('fontestamp'); if (s) removeScopedFonte(s); } },
        { ns: 'runfonte',   sel: '.mdash-fonte-run',         stop: true,  fn: function () { var s = $(this).data('fontestamp'); if (s) executeFonteByStamp(s); } }
    ];

    bindings.forEach(function (b) {
        panel.off('click.' + b.ns).on('click.' + b.ns, b.sel, function (e) {
            if (b.stop) e.stopPropagation();
            b.fn.call(this);
        });
    });
}

/**
 * Gera HTML de uma lista de fontes (para o painel de fontes).
 */
function renderFontesList(fontes, canRemove) {
    var html = '<div class="mdash-fonte-list">';
    fontes.forEach(function (f) {
        // Leitura defensiva — PetiteVue reactive proxies podem devolver undefined em edge-cases
        var fDescricao = (f.descricao != null && String(f.descricao) !== 'undefined') ? String(f.descricao) : '';
        var fCodigo = (f.codigo != null && String(f.codigo) !== 'undefined') ? String(f.codigo) : '';
        var fTipo = (f.tipo != null && String(f.tipo) !== 'undefined') ? String(f.tipo) : 'directquery';
        var fScope = (f.scope != null) ? String(f.scope) : '';
        var fStatus = (f.status != null) ? String(f.status) : 'idle';
        var fStamp = (f.mdashfontestamp != null) ? String(f.mdashfontestamp) : '';
        var statusClass = 'status-' + fStatus;
        var tipoIcon = getFonteTypeIcon(fTipo);
        var scopeLabel = fScope === 'global' ? 'Global' : fScope === 'container' ? 'Container' : fScope === 'containeritem' ? 'Item' : 'Object';
        var displayName = fDescricao || fCodigo || 'Sem nome';

        html += '<div class="mdash-fonte-list-item" data-fontestamp="' + fStamp + '">';
        html += '  <div class="mdash-fonte-list-icon"><i class="' + tipoIcon + '"></i></div>';
        html += '  <div class="mdash-fonte-list-info">';
        html += '    <span class="mdash-fonte-list-name">' + displayName + '</span>';
        html += '    <span class="mdash-fonte-list-meta">' + fTipo + ' · ' + scopeLabel + '</span>';
        html += '  </div>';
        html += '  <div class="mdash-fonte-list-actions">';
        html += '    <span class="mdash-fonte-status ' + statusClass + '" title="' + fStatus + '"></span>';
        html += '    <button type="button" class="btn btn-xs btn-default mdash-fonte-run" data-fontestamp="' + fStamp + '" title="Executar"><i class="glyphicon glyphicon-play"></i></button>';
        if (canRemove) {
            html += '    <button type="button" class="btn btn-xs mdash-btn-delete mdash-fonte-remove" data-fontestamp="' + fStamp + '" title="Remover"><i class="glyphicon glyphicon-trash"></i></button>';
        }
        html += '  </div>';
        html += '</div>';
    });
    html += '</div>';
    return html;
}

/**
 * Ícone por tipo de fonte.
 */
function getFonteTypeIcon(tipo) {
    var icons = {
        'directquery': 'glyphicon glyphicon-flash',
        'javascript': 'glyphicon glyphicon-console',
        'api': 'glyphicon glyphicon-cloud',
        'stored': 'glyphicon glyphicon-save'
    };
    return icons[tipo] || 'glyphicon glyphicon-hdd';
}

/**
 * Reconstrói o selector de fontes (.mcbi-fonte) no painel de propriedades inline,
 * sempre que a lista de fontes disponíveis para o objecto seleccionado muda
 * (fonte adicionada, removida ou executada).
 * Preserva a selecção actual.
 */
function _refreshInlineObjFonteSelect() {
    var $sel = $('#mdash-properties-panel .mcbi-fonte');
    if (!$sel.length) return;
    if (!_currentSelectedComponent || _currentSelectedComponent.type !== 'object') return;

    var obj = _currentSelectedComponent.data;
    if (!obj) return;

    var allCIs = (window.appState && window.appState.containerItems) || [];
    var pCI    = allCIs.find(function (i) { return i.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
    var fontes = MDashFonte.getAvailableFontes(
        'object',
        obj.mdashcontaineritemobjectstamp,
        obj.mdashcontaineritemstamp || '',
        pCI ? pCI.mdashcontainerstamp : ''
    );

    var cur = $sel.val();
    $sel.html(
        '<option value="">-- seleccione uma fonte --</option>'
        + fontes.map(function (f) {
            var stamp = String(f.mdashfontestamp || '');
            var label = String(f.descricao || f.codigo || stamp);
            return '<option value="' + stamp + '"' + (cur === stamp ? ' selected' : '') + '>' + label + '</option>';
        }).join('')
    );
}

/**
 * Adiciona uma nova fonte ao scope indicado.
 */
function addScopedFonte(scope, scopestamp) {
    var newFonte = new MDashFonte({
        scope: scope,
        scopestamp: scopestamp
    });

    // Garantir que propriedades essenciais estão definidas (proteção contra edge-cases reactivos)
    if (!newFonte.descricao || newFonte.descricao === 'undefined') newFonte.descricao = 'Nova Fonte';
    if (!newFonte.codigo || newFonte.codigo === 'undefined') newFonte.codigo = 'Fonte' + Date.now().toString().slice(-6);
    if (!newFonte.tipo || newFonte.tipo === 'undefined') newFonte.tipo = 'directquery';

    // Serializar campos JSON antes de enviar para a BD
    newFonte.stringifyJSONFields();

    window.appState.fontes.push(newFonte);

    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(newFonte.toDbRecord(), newFonte.table, newFonte.idfield);
    }

    // Refrescar painel de fontes + selector inline (reactivo imediato)
    if (_currentSelectedComponent) {
        renderFontesPanel(_currentSelectedComponent);
    }

    // Auto-abrir editor da nova fonte
    setTimeout(function () { editFonteInPanel(newFonte.mdashfontestamp); }, 60);
}

/**
 * Remove uma fonte pelo stamp.
 */
function removeScopedFonte(fonteStamp) {
    showDeleteConfirmation({
        title: 'Eliminar Fonte',
        message: 'Tem a certeza que deseja eliminar esta fonte de dados?',
        recordToDelete: { table: 'MDashFonte', tableKey: 'mdashfontestamp', stamp: fonteStamp },
        onConfirm: function () {
            var idx = window.appState.fontes.findIndex(function (f) { return f.mdashfontestamp === fonteStamp; });
            if (idx !== -1) window.appState.fontes.splice(idx, 1);
            if (_currentSelectedComponent) renderFontesPanel(_currentSelectedComponent);
        }
    });
}

/**
 * Executa uma fonte pelo stamp e actualiza o seu estado.
 */
function executeFonteByStamp(fonteStamp) {
    var fonte = window.appState.fontes.find(function (f) { return f.mdashfontestamp === fonteStamp; });
    if (!fonte) return;

    fonte.execute({}, function (err, results) {
        if (!err) {
            fonte.stringifyJSONFields();
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(fonte.toDbRecord(), fonte.table, fonte.idfield);
            }
        }
        // Refrescar UI
        if (_currentSelectedComponent) renderFontesPanel(_currentSelectedComponent);
        if (typeof alertify !== 'undefined') {
            if (err) alertify.error('Erro ao executar fonte: ' + fonte.errorMessage);
            else alertify.success('Fonte "' + (fonte.descricao || fonte.codigo) + '" executada (' + (results || []).length + ' registos)');
        }
    });
}

/**
 * Abre o editor de fonte inline no painel de fontes.
 */
function editFonteInPanel(fonteStamp) {
    var fonte = window.appState.fontes.find(function (f) {
        return String(f.mdashfontestamp) === String(fonteStamp);
    });
    if (!fonte) return;

    // Leitura defensiva de propriedades (proxy PetiteVue pode devolver undefined)
    var _codigo = (fonte.codigo != null && String(fonte.codigo) !== 'undefined') ? String(fonte.codigo) : '';
    var _descricao = (fonte.descricao != null && String(fonte.descricao) !== 'undefined') ? String(fonte.descricao) : '';
    var _tipo = (fonte.tipo != null && String(fonte.tipo) !== 'undefined') ? String(fonte.tipo) : 'directquery';
    var _urlfetch = (fonte.urlfetch != null && String(fonte.urlfetch) !== 'undefined') ? String(fonte.urlfetch) : '';
    var _expressaolistagem = (fonte.expressaolistagem != null && String(fonte.expressaolistagem) !== 'undefined') ? String(fonte.expressaolistagem) : '';
    var _expressaojslistagem = (fonte.expressaojslistagem != null && String(fonte.expressaojslistagem) !== 'undefined') ? String(fonte.expressaojslistagem) : '';
    var _apiurl = (fonte.apiurl != null && String(fonte.apiurl) !== 'undefined') ? String(fonte.apiurl) : '';
    var _apimethod = (fonte.apimethod != null && String(fonte.apimethod) !== 'undefined') ? String(fonte.apimethod) : 'GET';
    var _apiheadersjson = (fonte.apiheadersjson != null && String(fonte.apiheadersjson) !== 'undefined') ? String(fonte.apiheadersjson) : '{}';
    var _apibodyjson = (fonte.apibodyjson != null && String(fonte.apibodyjson) !== 'undefined') ? String(fonte.apibodyjson) : '{}';
    var _schemamode = (fonte.schemamode != null && String(fonte.schemamode) !== 'undefined') ? String(fonte.schemamode) : 'auto';
    var _refreshmode = (fonte.refreshmode != null && String(fonte.refreshmode) !== 'undefined') ? String(fonte.refreshmode) : 'onload';

    var panel = $('#mdash-fontes-panel');
    if (!panel.length) return;

    var tipoOptions = [
        { option: 'Query Directa', value: 'directquery' },
        { option: 'JavaScript', value: 'javascript' },
        { option: 'API', value: 'api' },
        { option: 'Cache', value: 'stored' }
    ];
    var schemaModeOptions = [
        { option: 'Automático', value: 'auto' },
        { option: 'Manual', value: 'manual' }
    ];
    var refreshModeOptions = [
        { option: 'Ao carregar', value: 'onload' },
        { option: 'Ao mudar filtro', value: 'onfilterchange' },
        { option: 'Manual', value: 'manual' },
        { option: 'Intervalo', value: 'interval' }
    ];

    var html = '';
    html += '<div class="mdash-fonte-editor">';
    html += '  <div class="mdash-fonte-editor-header">';
    html += '    <button type="button" class="btn btn-xs btn-default mdash-fonte-back" title="Voltar à lista"><i class="glyphicon glyphicon-arrow-left"></i></button>';
    html += '    <span>' + (_descricao || _codigo || 'Fonte') + '</span>';
    html += '  </div>';

    // Campos de identidade
    html += '  <div class="row">';
    html += '    <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>Código</label><input type="text" class="form-control input-sm" data-fonte-field="codigo" value="' + _codigo + '" /></div></div>';
    html += '    <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>Descrição</label><input type="text" class="form-control input-sm" data-fonte-field="descricao" value="' + _descricao + '" /></div></div>';
    html += '    <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>Tipo</label><select class="form-control input-sm" data-fonte-field="tipo">';
    tipoOptions.forEach(function (o) { html += '<option value="' + o.value + '"' + (_tipo === o.value ? ' selected' : '') + '>' + o.option + '</option>'; });
    html += '    </select></div></div>';

    // DirectQuery fields
    html += '    <div class="mdash-fonte-section" data-fonte-section="directquery"' + (_tipo !== 'directquery' ? ' style="display:none"' : '') + '>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>URL Fetch</label><input type="text" class="form-control input-sm" data-fonte-field="urlfetch" value="' + _urlfetch + '" /></div></div>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group">';
    html += '        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">';
    html += '          <label style="margin:0;">Expressão de Listagem</label>';
    html += '          <button type="button" class="btn btn-xs btn-default mdash-editor-expand" data-editor-field="expressaolistagem" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i> Editar</button>';
    html += '        </div>';
    html += '        <div class="m-editor" data-fonte-field="expressaolistagem" style="width:100%;height:160px;">' + _expressaolistagem + '</div>';
    html += '      </div></div>';
      // Parâmetros detectados na expressão (acima do botão executar)
    html += '      <div class="col-md-12 mdash-fonte-params-section"' + (fonte.parametros && fonte.parametros.length > 0 ? '' : ' style="display:none"') + ' style="margin-bottom:0.5em;">';
    html += '        <label style="font-size:11px;color:#888;margin-bottom:4px;"><i class="glyphicon glyphicon-filter"></i> Filtros de teste</label>';
    html += '        <div class="mdash-fonte-params-list">' + buildFonteParamsListHtml(fonte) + '</div>';
    html += '      </div>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;">';
    html += '        <button type="button" class="btn btn-success btn-sm btn-block mdash-fonte-execute" data-fontestamp="' + String(fonte.mdashfontestamp || fonteStamp) + '">';
    html += '          <i class="glyphicon glyphicon-play"></i> Executar & Obter Schema';
    html += '        </button>';
    var _lastexecuted = (fonte.lastexecuted != null && String(fonte.lastexecuted) !== 'undefined') ? String(fonte.lastexecuted) : '';
    if (_lastexecuted) { html += '        <small class="text-muted" style="display:block;margin-top:3px;">Última execução: ' + _lastexecuted + '</small>'; }
    html += '      </div>';
    html += '    </div>';

    // JavaScript fields
    html += '    <div class="mdash-fonte-section" data-fonte-section="javascript"' + (_tipo !== 'javascript' ? ' style="display:none"' : '') + '>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group">';
    html += '        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">';
    html += '          <label style="margin:0;">Expressão JavaScript</label>';
    html += '          <button type="button" class="btn btn-xs btn-default mdash-editor-expand" data-editor-field="expressaojslistagem" title="Editar em ecrã completo"><i class="glyphicon glyphicon-fullscreen"></i> Editar</button>';
    html += '        </div>';
    html += '        <div class="m-editor" data-fonte-field="expressaojslistagem" style="width:100%;height:160px;">' + _expressaojslistagem + '</div>';
    html += '      </div></div>';
    html += '    </div>';

    // API fields
    html += '    <div class="mdash-fonte-section" data-fonte-section="api"' + (_tipo !== 'api' ? ' style="display:none"' : '') + '>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>URL da API</label><input type="text" class="form-control input-sm" data-fonte-field="apiurl" value="' + _apiurl + '" /></div></div>';
    html += '      <div class="col-md-6" style="margin-bottom:0.5em;"><div class="form-group"><label>Método</label><select class="form-control input-sm" data-fonte-field="apimethod"><option value="GET"' + (_apimethod === 'GET' ? ' selected' : '') + '>GET</option><option value="POST"' + (_apimethod === 'POST' ? ' selected' : '') + '>POST</option><option value="PUT"' + (_apimethod === 'PUT' ? ' selected' : '') + '>PUT</option></select></div></div>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>Headers (JSON)</label><div class="m-editor" data-fonte-field="apiheadersjson" style="width:100%;height:80px;">' + _apiheadersjson + '</div></div></div>';
    html += '      <div class="col-md-12" style="margin-bottom:0.5em;"><div class="form-group"><label>Body (JSON)</label><div class="m-editor" data-fonte-field="apibodyjson" style="width:100%;height:80px;">' + _apibodyjson + '</div></div></div>';
    html += '    </div>';

    // Schema & Refresh
    html += '    <div class="col-md-6" style="margin-bottom:0.5em;"><div class="form-group"><label>Schema</label><select class="form-control input-sm" data-fonte-field="schemamode">';
    schemaModeOptions.forEach(function (o) { html += '<option value="' + o.value + '"' + (_schemamode === o.value ? ' selected' : '') + '>' + o.option + '</option>'; });
    html += '    </select></div></div>';
    html += '    <div class="col-md-6" style="margin-bottom:0.5em;"><div class="form-group"><label>Refresh</label><select class="form-control input-sm" data-fonte-field="refreshmode">';
    refreshModeOptions.forEach(function (o) { html += '<option value="' + o.value + '"' + (_refreshmode === o.value ? ' selected' : '') + '>' + o.option + '</option>'; });
    html += '    </select></div></div>';

    // Schema display (read-only) — colapsado por defeito
    if (fonte.schema && fonte.schema.length > 0) {
        var _schemaCollapseId = 'mdash-schema-collapse-' + String(fonteStamp).replace(/[^a-zA-Z0-9]/g, '_');
        html += '    <div class="col-md-12" style="margin-bottom:0.5em;">';
        html += '      <button type="button" class="mdash-schema-toggle collapsed" data-toggle="collapse" data-target="#' + _schemaCollapseId + '">';
        html += '        <span class="mdash-schema-toggle-left">';
        html += '          <i class="glyphicon glyphicon-list-alt"></i>';
        html += '          <span>Schema</span>';
        html += '          <span class="mdash-schema-badge">' + fonte.schema.length + '</span>';
        html += '        </span>';
        html += '        <i class="glyphicon glyphicon-chevron-right mdash-schema-chevron"></i>';
        html += '      </button>';
        html += '      <div id="' + _schemaCollapseId + '" class="collapse">';
        html += '        <div class="mdash-fonte-schema-table">';
        html += '          <table class="table table-condensed" style="margin:0;">';
        html += '            <thead><tr><th>Campo</th><th>Tipo</th></tr></thead><tbody>';
        fonte.schema.forEach(function (s) {
            html += '            <tr><td>' + s.field + '</td><td><span class="mdash-schema-type-badge">' + s.type + '</span></td></tr>';
        });
        html += '            </tbody></table>';
        html += '        </div>';
        html += '      </div>';
        html += '    </div>';
    }

    html += '  </div>'; // fim row
    html += '</div>'; // fim fonte-editor

    panel.html(html);

    // Helper: serializar e persistir a fonte na BD
    function _persistFonte() {
        fonte.stringifyJSONFields();
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(fonte.toDbRecord(), fonte.table, fonte.idfield);
        }
    }

    // Bind: voltar à lista — guardar antes de sair
    panel.off('click.fonteback').on('click.fonteback', '.mdash-fonte-back', function () {
        _persistFonte();
        renderFontesPanel(_currentSelectedComponent);
    });

    // Bind: mudar tipo → mostrar/esconder secções e sincronizar
    panel.off('change.fontetype').on('change.fontetype', '[data-fonte-field="tipo"]', function () {
        var tipo = $(this).val();
        fonte.tipo = tipo;
        panel.find('.mdash-fonte-section').hide();
        panel.find('.mdash-fonte-section[data-fonte-section="' + tipo + '"]').show();
        _persistFonte();
    });

    // Bind: campos de texto/select — actualiza a fonte e sincroniza com a BD
    var _fonteSyncTimer = null;
    panel.off('change.fontefields keyup.fontefields').on('change.fontefields keyup.fontefields', '[data-fonte-field]:not(.m-editor)', function () {
        var field = $(this).data('fonte-field');
        var val = this.type === 'checkbox' ? this.checked : $(this).val();
        fonte[field] = val;
        clearTimeout(_fonteSyncTimer);
        _fonteSyncTimer = setTimeout(_persistFonte, 600);
    });

    // Bind: executar — persiste primeiro, depois corre e abre modal com resultado/erro
    panel.off('click.fonteexec').on('click.fonteexec', '.mdash-fonte-execute', function () {
        var $btn = $(this);
        var stamp = $btn.data('fontestamp');
        var fonteExec = window.appState.fontes.find(function (f) { return String(f.mdashfontestamp) === String(stamp); });
        if (!fonteExec) return;

        _persistFonte();
        $btn.prop('disabled', true).html('<i class="glyphicon glyphicon-refresh spinning"></i> A executar...');

        // Construir filtros a partir dos parametros da fonte (usa defaultValue como valor de teste)
        var execFilters = {};
        if (Array.isArray(fonteExec.parametros)) {
            fonteExec.parametros.forEach(function (param) {
                execFilters[param.token] = param.defaultValue || '';
            });
        }

        fonteExec.execute({ filters: execFilters }, function (err, results) {
            $btn.prop('disabled', false).html('<i class="glyphicon glyphicon-play"></i> Executar & Obter Schema');

            var modalId = 'mdash-fonte-query-result-modal';
            $('#' + modalId).remove();

            var modalTitle, modalBody;

            if (err) {
                var errMsg = err.message || String(err);
                modalTitle = '<span class="text-danger"><i class="glyphicon glyphicon-exclamation-sign"></i> Erro na query</span>';
                modalBody = '<pre style="background:#fff8f8;border:1px solid #f5c6cb;color:#721c24;padding:14px;border-radius:5px;max-height:460px;overflow-y:auto;font-size:12px;white-space:pre-wrap;word-break:break-all;">'
                    + $('<div>').text(errMsg).html() + '</pre>';
            } else {
                var count = (results || []).length;
                modalTitle = '<i class="glyphicon glyphicon-th"></i> Resultado  <small class="text-muted">' + count + ' registo(s)</small>';
                var jsonFormatted;
                try { jsonFormatted = JSON.stringify(results || [], null, 2); } catch (e) { jsonFormatted = String(results); }
                modalBody = '<pre id="mdash-fonte-query-result-pre" style="background:#f8f9fa;padding:14px;border-radius:5px;max-height:460px;overflow-y:auto;font-size:12px;">'
                    + $('<div>').text(jsonFormatted).html() + '</pre>';
                // Re-renderizar para actualizar schema após execução bem sucedida
                editFonteInPanel(stamp);
            }

            var modalHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
                + '<div class="modal-dialog modal-lg" role="document">'
                + '<div class="modal-content">'
                + '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button><h4 class="modal-title">' + modalTitle + '</h4></div>'
                + '<div class="modal-body" style="padding:12px;">' + modalBody + '</div>'
                + '<div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button></div>'
                + '</div></div></div>';

            $('body').append(modalHtml);
            $('#' + modalId).modal('show');
            $('#' + modalId).on('hidden.bs.modal', function () { $(this).remove(); });
        });
    });

    // Bind: abrir editor em modal full-screen
    panel.off('click.editorexpand').on('click.editorexpand', '.mdash-editor-expand', function () {
        var field = $(this).data('editor-field');
        var $editorDiv = panel.find('.m-editor[data-fonte-field="' + field + '"]');
        var editorId = $editorDiv.attr('id');
        var currentValue = (editorId && typeof ace !== 'undefined' && ace.edit) ? ace.edit(editorId).getValue() : $editorDiv.text();

        var modalId = 'mdash-fonte-editor-modal';
        $('#' + modalId).remove();

        var modalHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">'
            + '<div class="modal-dialog" style="width:90%;margin:2% auto;" role="document">'
            + '<div class="modal-content">'
            + '<div class="modal-header" style="padding:8px 14px;">'
            + '  <button type="button" class="close" data-dismiss="modal">&times;</button>'
            + '  <h4 class="modal-title" style="font-size:14px;"><i class="glyphicon glyphicon-pencil"></i> Editar expressão</h4>'
            + '</div>'
            + '<div class="modal-body" style="padding:0;">'
            + '  <div id="mdash-modal-ace-editor" style="width:100%;height:calc(80vh - 100px);"></div>'
            + '</div>'
            + '<div class="modal-footer" style="padding:8px 14px;">'
            + '  <button type="button" class="btn btn-primary btn-sm" id="mdash-editor-modal-save"><i class="glyphicon glyphicon-floppy-disk"></i> Aplicar</button>'
            + '  <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancelar</button>'
            + '</div>'
            + '</div></div></div>';

        $('body').append(modalHtml);

        var $modal = $('#' + modalId);
        $modal.modal('show');

        $modal.on('shown.bs.modal', function () {
            var modalAce = ace.edit('mdash-modal-ace-editor');
            var mode = (field === 'expressaojslistagem') ? 'ace/mode/javascript' : 'ace/mode/sql';
            modalAce.session.setMode(mode);
            modalAce.setTheme(getMDashEditorTheme('dark'));
            modalAce.setOptions({ fontSize: '13px', showPrintMargin: false, wrap: true });
            modalAce.setValue(currentValue, -1);
            modalAce.focus();

            // Aplicar: copiar valor para o editor no painel e persistir
            $('#mdash-editor-modal-save').off('click').on('click', function () {
                var newValue = modalAce.getValue();
                // Actualizar ACE no painel
                if (editorId && ace.edit) {
                    ace.edit(editorId).setValue(newValue, -1);
                }
                // Actualizar modelo
                fonte[field] = newValue;
                _persistFonte();
                syncFonteParametros(fonte);
                var $ps = panel.find('.mdash-fonte-params-section');
                $ps.find('.mdash-fonte-params-list').html(buildFonteParamsListHtml(fonte));
                $ps.toggle(fonte.parametros && fonte.parametros.length > 0);
                $modal.modal('hide');
            });
        });

        $modal.on('hidden.bs.modal', function () { $(this).remove(); });
    });

    // Bind: parâmetros — alterar valor de teste
    panel.off('change.paramvalue keyup.paramvalue').on('change.paramvalue keyup.paramvalue', '.mdash-param-value', function () {
        var idx = parseInt($(this).data('param-idx'), 10);
        fonte.parametros[idx].defaultValue = $(this).val();
    });

    // Inicializa ACE para campos de expressão
    handleCodeEditor();

    // Attach ACE change handlers directamente por ID (evita referências stale ao DOM)
    // Usamos um único timer partilhado para debounce entre todos os editores
    var _aceSyncTimer = null;
    panel.find('.m-editor').each(function () {
        var editorId = this.id; // atribuído por handleCodeEditor()
        var $editorEl = $(this);
        if (!editorId || typeof ace === 'undefined' || !ace.edit) return;
        var aceEditor = ace.edit(editorId);
        if (!aceEditor) return;

        aceEditor.getSession().on('change', function () {
            var field = $editorEl.data('fonte-field');
            if (!field) return;
            fonte[field] = aceEditor.getValue();
            clearTimeout(_aceSyncTimer);
            _aceSyncTimer = setTimeout(_persistFonte, 800);
            syncFonteParametros(fonte);
            var $paramSection = panel.find('.mdash-fonte-params-section');
            var $paramList = $paramSection.find('.mdash-fonte-params-list');
            $paramList.html(buildFonteParamsListHtml(fonte));
            $paramSection.toggle(fonte.parametros && fonte.parametros.length > 0);
        });
    });
}

// ============================================================================
// DRAG & DROP ENGINE - SENIOR LEVEL ARCHITECTURE
// ============================================================================

/**
 * GridLayoutEngine - Responsável por cálculos de layout e validações
 */
var GridLayoutEngine = {
    GRID_COLUMNS: 12,
    
    /**
     * Valida se um item cabe numa linha específica
     */
    canFitInRow: function(containerStamp, targetRow, newItemSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'manual';
        });
        
        var usedColumns = itemsInRow.reduce(function(sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);
        
        return (usedColumns + newItemSpan) <= this.GRID_COLUMNS;
    },
    
    /**
     * Calcula espaço disponível numa linha
     */
    getAvailableSpace: function(containerStamp, targetRow, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'manual';
        });
        
        var usedColumns = itemsInRow.reduce(function(sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);
        
        return this.GRID_COLUMNS - usedColumns;
    },
    
    /**
     * Encontra item na posição específica
     */
    findItemAtPosition: function(containerStamp, row, col) {
        return GMDashContainerItems.find(function(item) {
            if (item.mdashcontainerstamp !== containerStamp) return false;
            if (getEffectiveItemLayoutMode(item) !== 'manual') return false;
            
            var itemRow = parseInt(item.gridrow, 10);
            var itemColStart = parseInt(item.gridcolstart, 10);
            var itemSpan = getItemGridSpan(item);
            var itemColEnd = itemColStart + itemSpan - 1;
            
            return itemRow === row && col >= itemColStart && col <= itemColEnd;
        });
    },
    
    /**
     * Calcula reajuste automático de items numa linha
     */
    calculateAutoAdjust: function(containerStamp, targetRow, insertCol, insertSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function(item) {
            return item.mdashcontainerstamp === containerStamp &&
                   parseInt(item.gridrow, 10) === targetRow &&
                   item.mdashcontaineritemstamp !== excludeItemStamp &&
                   getEffectiveItemLayoutMode(item) === 'manual';
        }).sort(function(a, b) {
            return parseInt(a.gridcolstart, 10) - parseInt(b.gridcolstart, 10);
        });
        
        console.log('🔧 calculateAutoAdjust:', {
            targetRow: targetRow,
            insertCol: insertCol,
            insertSpan: insertSpan,
            excludeItemStamp: excludeItemStamp ? excludeItemStamp.substring(0, 8) : 'none',
            itemsInRow: itemsInRow.length
        });
        
        var adjustments = [];
        var currentCol = 1;
        var itemInserted = false; // Flag para saber se já inserimos o item
        
        itemsInRow.forEach(function(item) {
            var itemColStart = parseInt(item.gridcolstart, 10);
            var itemSpan = getItemGridSpan(item);
            
            // Se chegamos na posição de inserção e ainda não inserimos, reserva espaço
            if (!itemInserted && currentCol >= insertCol) {
                console.log('  📍 Inserindo item na col', insertCol);
                currentCol = insertCol + insertSpan;
                itemInserted = true;
            }
            
            // Se o item atual precisa ser movido
            if (itemColStart !== currentCol) {
                console.log('  ↔️ Ajuste:', item.mdashcontaineritemstamp.substring(0, 8), 'de col', itemColStart, 'para col', currentCol);
                adjustments.push({
                    item: item,
                    oldCol: itemColStart,
                    newCol: currentCol
                });
            }
            
            currentCol += itemSpan;
        });
        
        // Se o item deve ser inserido no final
        if (!itemInserted) {
            console.log('  📍 Inserindo item no final, col', currentCol);
            currentCol += insertSpan;
        }
        
        var totalColumns = currentCol - 1;
        var isValid = totalColumns <= this.GRID_COLUMNS;
        
        console.log('✅ Resultado:', {
            totalColumns: totalColumns,
            isValid: isValid,
            adjustments: adjustments.length
        });
        
        return {
            adjustments: adjustments,
            totalColumns: totalColumns,
            isValid: isValid
        };
    }
};

/**
 * VisualFeedbackManager - Gere feedback visual durante drag
 */
var VisualFeedbackManager = {
    
    /**
     * Mostra feedback de erro (linha vermelha + ícone stop)
     * @param {jQuery} $row - O container de items (grid)
     * @param {number} targetGridRow - Número da grid-row específica
     * @param {string} message - Mensagem de erro
     */
    showErrorFeedback: function($row, targetGridRow, message) {
        this.clearFeedback($row);
        
        // Cria overlay que se posiciona na grid-row específica
        var $errorOverlay = $('<div class="mdash-drop-error-overlay" style="grid-row: ' + targetGridRow + '; grid-column: 1 / -1;">' +
            '<div class="mdash-drop-overlay-bg mdash-drop-error-bg"></div>' +
            '<div class="mdash-drop-overlay-content">' +
                '<i class="glyphicon glyphicon-ban-circle"></i>' +
                '<span>' + (message || 'Não cabe nesta linha') + '</span>' +
            '</div>' +
        '</div>');
        
        $row.append($errorOverlay);
    },
    
    /**
     * Mostra feedback de sucesso (linha verde + prévia)
     * @param {jQuery} $row - O container de items (grid)
     * @param {number} targetGridRow - Número da grid-row específica
     * @param {Array} adjustments - Items que serão reajustados
     */
    showSuccessFeedback: function($row, targetGridRow, adjustments) {
        this.clearFeedback($row);
        
        // Sempre mostra feedback verde quando validação passa
        var message = (adjustments && adjustments.length > 0) 
            ? adjustments.length + ' item(s) serão reajustados'
            : '✓ Válido';
            
        var $successOverlay = $('<div class="mdash-drop-success-overlay" style="grid-row: ' + targetGridRow + '; grid-column: 1 / -1;">' +
            '<div class="mdash-drop-overlay-bg mdash-drop-success-bg"></div>' +
            '<div class="mdash-drop-overlay-content">' +
                '<i class="glyphicon glyphicon-ok-circle"></i>' +
                '<span>' + message + '</span>' +
            '</div>' +
        '</div>');
        $row.append($successOverlay);
    },
    
    /**
     * Mostra feedback de swap (troca na mesma linha)
     * @param {jQuery} $row - O container de items (grid)
     * @param {number} targetGridRow - Número da grid-row específica
     * @param {Object} targetItem - Item com quem vai trocar
     */
    showSwapFeedback: function($row, targetGridRow, targetItem) {
        this.clearFeedback($row);
        
        var $swapOverlay = $('<div class="mdash-drop-swap-overlay" style="grid-row: ' + targetGridRow + '; grid-column: 1 / -1;">' +
            '<div class="mdash-drop-overlay-bg mdash-drop-swap-bg"></div>' +
            '<div class="mdash-drop-overlay-content">' +
                '<i class="glyphicon glyphicon-retweet"></i>' +
                '<span>Trocar posições</span>' +
            '</div>' +
        '</div>');
        $row.append($swapOverlay);
    },
    
    /**
     * Limpa todo feedback visual
     * @param {jQuery} $row - A linha ou container para limpar
     */
    clearFeedback: function($row) {
        $row.find('.mdash-drop-error-overlay, .mdash-drop-success-overlay, .mdash-drop-swap-overlay').remove();
    }
};

/**
 * DragDropValidator - Valida operações de drag & drop
 */
var DragDropValidator = {
    
    /**
     * Valida se o drop é possível e retorna estratégia
     */
    validateDrop: function(draggedItem, targetRow, targetCol, containerStamp) {
        var draggedSpan = getItemGridSpan(draggedItem);
        var draggedRow = parseInt(draggedItem.gridrow, 10);
        
        console.log('🔍 validateDrop:', {
            item: draggedItem.mdashcontaineritemstamp.substring(0, 8),
            fromRow: draggedRow,
            toRow: targetRow,
            toCol: targetCol,
            span: draggedSpan
        });
        
        var result = {
            isValid: false,
            strategy: null, // 'swap', 'adjust', 'reposition', 'invalid'
            targetItem: null,
            adjustments: [],
            message: ''
        };
        
        // Encontra item na posição alvo
        var targetItem = GridLayoutEngine.findItemAtPosition(containerStamp, targetRow, targetCol);
        
        // ⭐ CASO 1: MESMA LINHA
        if (draggedRow === targetRow) {
            console.log('  🔄 Mesma linha detectada');
            
            // Subcaso 1a: Arrastando SOBRE outro item na mesma linha → SWAP
            if (targetItem && targetItem.mdashcontaineritemstamp !== draggedItem.mdashcontaineritemstamp) {
                console.log('  🔀 SWAP com', targetItem.mdashcontaineritemstamp.substring(0, 8));
                result.isValid = true;
                result.strategy = 'swap';
                result.targetItem = targetItem;
                result.message = 'Trocar posições';
                return result;
            }
            
            // Subcaso 1b: Reposicionando na mesma linha (espaço vazio ou mesma posição)
            console.log('  📌 REPOSITION na mesma linha');
            // Valida se o reajuste cabe na linha
            var adjustResult = GridLayoutEngine.calculateAutoAdjust(
                containerStamp, 
                targetRow, 
                targetCol, 
                draggedSpan, 
                draggedItem.mdashcontaineritemstamp
            );
            
            if (adjustResult.isValid) {
                result.isValid = true;
                result.strategy = 'reposition'; // Nova estratégia para mesma linha
                result.adjustments = adjustResult.adjustments;
                result.message = adjustResult.adjustments.length > 0 
                    ? adjustResult.adjustments.length + ' item(s) reajustados'
                    : 'Reposicionar';
                console.log('  ✅ REPOSITION válido');
            } else {
                result.isValid = false;
                result.strategy = 'invalid';
                result.message = 'Total ultrapassa ' + GridLayoutEngine.GRID_COLUMNS + ' colunas após reajuste';
                console.log('  ❌ REPOSITION inválido:', result.message);
            }
            
            return result;
        }
        
        // ⭐ CASO 2: LINHA DIFERENTE - verifica se cabe
        console.log('  🆕 Linha diferente detectada');
        var availableSpace = GridLayoutEngine.getAvailableSpace(containerStamp, targetRow, draggedItem.mdashcontaineritemstamp);
        
        if (draggedSpan > availableSpace) {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Não cabe: precisa ' + draggedSpan + ' col, disponível ' + availableSpace + ' col';
            console.log('  ❌ Não cabe:', result.message);
            return result;
        }
        
        // ⭐ CASO 3: Cabe - calcula ajustes
        var adjustResult = GridLayoutEngine.calculateAutoAdjust(
            containerStamp, 
            targetRow, 
            targetCol, 
            draggedSpan, 
            draggedItem.mdashcontaineritemstamp
        );
        
        if (adjustResult.isValid) {
            result.isValid = true;
            result.strategy = 'adjust';
            result.adjustments = adjustResult.adjustments;
            result.message = adjustResult.adjustments.length + ' item(s) reajustados';
            console.log('  ✅ ADJUST válido');
        } else {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Total ultrapassa ' + GridLayoutEngine.GRID_COLUMNS + ' colunas';
            console.log('  ❌ ADJUST inválido:', result.message);
        }
        
        return result;
    }
};

/**
 * DragDropExecutor - Executa operações de drag & drop
 */
var DragDropExecutor = {
    
    /**
     * Executa swap entre dois items
     */
    executeSwap: function(item1, item2) {
        var temp = {
            row: item1.gridrow,
            colStart: item1.gridcolstart
        };
        
        item1.gridrow = item2.gridrow;
        item1.gridcolstart = item2.gridcolstart;
        
        item2.gridrow = temp.row;
        item2.gridcolstart = temp.colStart;
        
        console.log('🔄 SWAP executado:', {
            item1: item1.mdashcontaineritemstamp.substring(0, 8),
            item2: item2.mdashcontaineritemstamp.substring(0, 8)
        });
        
        // Sincroniza ambos
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(item1, item1.table, item1.idfield);
            realTimeComponentSync(item2, item2.table, item2.idfield);
        }
    },
    
    /**
     * Executa ajuste de items
     */
    executeAdjust: function(adjustments) {
        adjustments.forEach(function(adj) {
            adj.item.gridcolstart = adj.newCol;
            
            console.log('➡️ ADJUST:', {
                item: adj.item.mdashcontaineritemstamp.substring(0, 8),
                oldCol: adj.oldCol,
                newCol: adj.newCol
            });
            
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(adj.item, adj.item.table, adj.item.idfield);
            }
        });
    }
};

// ============================================================================

function initDragAndDrop() {
   /* if (!window.jQuery || !$.fn.draggable || !$.fn.droppable || !$.fn.sortable) {
        console.warn("jQuery UI (draggable/droppable/sortable) não disponível; drag & drop desativado.");
        return;
    }*/

    makeToolboxDraggable();
    makeCanvasDroppable();
    makeContainersSortable();
    makeContainerItemsSortable();
    makeDashboardTabsSortable();
    initContainerItemResize();
    initSlotDropZones();
    setTimeout(syncAllContainerItemsLayout, 0);
}

/**
 * Enables Chrome-style drag-to-reorder on the dashboard tabs bar.
 * Persists the new "ordem" on each tab via realTimeComponentSync.
 */
function makeDashboardTabsSortable() {
    var $tabs = $('#mdash-dashboard-tabs');
    if (!$tabs.length) return;
    if ($tabs.hasClass('ui-sortable')) {
        try { $tabs.sortable('destroy'); } catch (e) { }
    }
    $tabs.sortable({
        items: '> .mdash-dashboard-tab',
        axis: 'x',
        tolerance: 'pointer',
        distance: 4,
        cancel: 'input, button, .mdash-tab-editor-popover, .mdash-dashboard-tab-close, .mdash-dashboard-tab-iconbtn, .mdash-dashboard-tab-title',
        placeholder: 'mdash-dashboard-tab-placeholder',
        helper: 'original',
        forcePlaceholderSize: true,
        containment: 'parent',
        start: function (ev, ui) {
            ui.item.addClass('is-dragging');
        },
        stop: function (ev, ui) {
            ui.item.removeClass('is-dragging');
            var tabsArr = (window.appState && window.appState.tabs) ? window.appState.tabs : GMDashTabs;
            if (!Array.isArray(tabsArr) || !tabsArr.length) return;
            var order = 1;
            $tabs.find('> .mdash-dashboard-tab').each(function () {
                var stamp = $(this).attr('data-stamp');
                var tab = tabsArr.find(function (t) { return t.mdashtabstamp === stamp; });
                if (!tab) return;
                if (tab.ordem !== order) {
                    tab.ordem = order;
                    if (typeof realTimeComponentSync === 'function') {
                        realTimeComponentSync(tab, tab.table, tab.idfield);
                    }
                }
                order++;
            });
            if (typeof mdashSyncDashboardConfigRealtime === 'function') mdashSyncDashboardConfigRealtime();
        }
    });
}

/**
 * Inicializa drop zones — agora apenas limpa handlers antigos delegados.
 * Os eventos reais são ligados directamente em cada drop zone via bindSlotDropZoneEvents()
 * (chamado por injectSlotDropOverlays), porque @click.stop no .mdash-canvas-item (PetiteVue)
 * bloqueia o bubbling necessário para delegação jQuery no canvas.
 */
function initSlotDropZones() {
    var $canvas = $('#mdash-canvas-body');
    // Limpar handlers delegados legados (se existirem de versões anteriores)
    $canvas.off('dragover.slotdrop dragleave.slotdrop drop.slotdrop click.slotzone click.slotsettings');
}

function syncAllContainerItemsLayout() {
    var items = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    if (!Array.isArray(items) || !items.length) return;

    var handledContainers = {};
    items.forEach(function (item) {
        if (!item || !item.mdashcontainerstamp) return;
        if (handledContainers[item.mdashcontainerstamp]) return;
        handledContainers[item.mdashcontainerstamp] = true;
        if (containerHasAutoLayoutItems(item.mdashcontainerstamp)) {
            normalizeContainerItemsAutoLayout(item.mdashcontainerstamp);
        } else {
            ensureManualItemsHaveCoordinates(item.mdashcontainerstamp);
        }
    });

    items.forEach(function (item) {
        if (!item || !item.mdashcontaineritemstamp) return;

        var selector = '.mdash-canvas-item[data-stamp="' + item.mdashcontaineritemstamp + '"]';
        var $el = $(selector);
        if (!$el.length) return;

        var cssMap = getItemGridStyleMap(item);

        // Reforça o layout por span e limpa vestígios inline do sortable.
        $el.css({
            'grid-column': cssMap.gridColumn,
            'grid-row': cssMap.gridRow,
            'width': '',
            'max-width': '',
            'left': '',
            'top': ''
        });
    });
}

function containerHasAutoLayoutItems(containerStamp) {
    if (!containerStamp) return false;

    return GMDashContainerItems.some(function (item) {
        return item.mdashcontainerstamp === containerStamp && getEffectiveItemLayoutMode(item) === "auto";
    });
}

function getContainerLayoutMode(containerStamp) {
    var containers = (window.appState && window.appState.containers) ? window.appState.containers : GMDashContainers;
    if (!Array.isArray(containers) || !containers.length) return "auto";

    var container = containers.find(function (c) {
        return c && c.mdashcontainerstamp === containerStamp;
    });

    if (!container || !container.layoutmode) return "auto";
    return container.layoutmode === "manual" ? "manual" : "auto";
}

function getEffectiveItemLayoutMode(item) {
    if (!item) return "auto";

    var itemMode = (item.layoutmode || "inherit").toString().toLowerCase();
    if (itemMode === "manual") return "manual";
    if (itemMode === "auto") return "auto";

    return getContainerLayoutMode(item.mdashcontainerstamp);
}

function isManualLayoutItem(item) {
    if (!item) return false;
    if (getEffectiveItemLayoutMode(item) !== "manual") return false;

    var row = parseInt(item.gridrow, 10);
    var colStart = parseInt(item.gridcolstart, 10);
    return !!(row >= 1 && colStart >= 1);
}

function getItemGridSpan(item) {
    var span = parseInt(item.tamanho, 10);
    if (!span || span < 1) {
        span = 4;
    }
    if (span > 12) span = 12;
    return span;
}

function getItemGridStyleMap(item) {
    var span = getItemGridSpan(item);

    if (isManualLayoutItem(item)) {
        var row = parseInt(item.gridrow, 10);
        var colStart = parseInt(item.gridcolstart, 10);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;

        if (colStart < 1) colStart = 1;
        if (colStart > 12) colStart = 12;
        if ((colStart + span - 1) > 12) {
            colStart = Math.max(1, 12 - span + 1);
        }

        return {
            gridColumn: colStart + ' / span ' + span,
            gridRow: row + ' / span ' + rowSpan
        };
    }

    return {
        gridColumn: 'span ' + span + ' / span ' + span,
        gridRow: ''
    };
}

function getItemGridStyleString(item) {
    var cssMap = getItemGridStyleMap(item);
    return 'grid-column: ' + cssMap.gridColumn + '; ' + (cssMap.gridRow ? ('grid-row: ' + cssMap.gridRow + '; ') : '') + 'min-width: 0;';
}

function isGridAreaFree(occupiedMap, rowStart, colStart, colSpan, rowSpan) {
    for (var r = rowStart; r < (rowStart + rowSpan); r++) {
        for (var c = colStart; c < (colStart + colSpan); c++) {
            if (occupiedMap[r + ':' + c]) {
                return false;
            }
        }
    }
    return true;
}

function markGridAreaOccupied(occupiedMap, rowStart, colStart, colSpan, rowSpan) {
    for (var r = rowStart; r < (rowStart + rowSpan); r++) {
        for (var c = colStart; c < (colStart + colSpan); c++) {
            occupiedMap[r + ':' + c] = true;
        }
    }
}

function findNextGridSlot(occupiedMap, preferredRow, preferredCol, colSpan, rowSpan) {
    var row = parseInt(preferredRow, 10);
    var col = parseInt(preferredCol, 10);

    if (!row || row < 1) row = 1;
    if (!col || col < 1) col = 1;

    while (true) {
        if (col > 12) {
            row += Math.floor((col - 1) / 12);
            col = ((col - 1) % 12) + 1;
        }

        if ((col + colSpan - 1) > 12) {
            row += 1;
            col = 1;
            continue;
        }

        if (isGridAreaFree(occupiedMap, row, col, colSpan, rowSpan)) {
            return { row: row, colStart: col };
        }

        col += 1;
    }
}

function normalizeContainerItemsAutoLayout(containerStamp) {
    if (!containerStamp) return;

    var containerItems = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            var aMode = getEffectiveItemLayoutMode(a);
            var bMode = getEffectiveItemLayoutMode(b);

            if (aMode === "manual" && bMode === "manual") {
                var rowDiff = (parseInt(a.gridrow, 10) || 0) - (parseInt(b.gridrow, 10) || 0);
                if (rowDiff !== 0) return rowDiff;

                var colDiff = (parseInt(a.gridcolstart, 10) || 0) - (parseInt(b.gridcolstart, 10) || 0);
                if (colDiff !== 0) return colDiff;
            }

            if (aMode === "manual" && bMode !== "manual") return -1;
            if (aMode !== "manual" && bMode === "manual") return 1;

            return (a.ordem || 0) - (b.ordem || 0);
        });

    var occupiedMap = {};
    var autoCursorRow = 1;
    var autoCursorCol = 1;

    containerItems.forEach(function (item) {
        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var mode = getEffectiveItemLayoutMode(item);
        var preferredRow = mode === "manual" ? item.gridrow : autoCursorRow;
        var preferredCol = mode === "manual" ? item.gridcolstart : autoCursorCol;

        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        item.gridrow = slot.row;
        item.gridcolstart = slot.colStart;
        item.tamanho = span;
        item.gridrowspan = rowSpan;

        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);

        if (mode === "auto") {
            autoCursorRow = slot.row;
            autoCursorCol = slot.colStart + span;
            while (autoCursorCol > 12) {
                autoCursorRow += 1;
                autoCursorCol = 1;
            }
        }
    });
}

function ensureManualItemsHaveCoordinates(containerStamp) {
    if (!containerStamp) return;

    var containerItems = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            return (a.ordem || 0) - (b.ordem || 0);
        });

    var occupiedMap = {};

    containerItems.forEach(function (item) {
        if (!item) return;

        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var mode = getEffectiveItemLayoutMode(item);
        var row = parseInt(item.gridrow, 10);
        var colStart = parseInt(item.gridcolstart, 10);

        if (mode !== "manual") {
            if (!(row >= 1 && colStart >= 1)) {
                var autoSlot = findNextGridSlot(occupiedMap, 1, 1, span, rowSpan);
                row = autoSlot.row;
                colStart = autoSlot.colStart;
                item.gridrow = row;
                item.gridcolstart = colStart;
            }

            item.tamanho = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, row, colStart, span, rowSpan);
            return;
        }

        if (!(row >= 1 && colStart >= 1)) {
            var manualSlot = findNextGridSlot(occupiedMap, 1, 1, span, rowSpan);
            item.gridrow = manualSlot.row;
            item.gridcolstart = manualSlot.colStart;
            item.tamanho = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, manualSlot.row, manualSlot.colStart, span, rowSpan);
            return;
        }

        if (colStart > 12) colStart = 12;
        if ((colStart + span - 1) > 12) {
            colStart = Math.max(1, 12 - span + 1);
            item.gridcolstart = colStart;
        }

        if (!isGridAreaFree(occupiedMap, row, colStart, span, rowSpan)) {
            var fallbackSlot = findNextGridSlot(occupiedMap, row, colStart, span, rowSpan);
            item.gridrow = fallbackSlot.row;
            item.gridcolstart = fallbackSlot.colStart;
            item.tamanho = span;
            item.gridrowspan = rowSpan;
            markGridAreaOccupied(occupiedMap, fallbackSlot.row, fallbackSlot.colStart, span, rowSpan);
            return;
        }

        item.tamanho = span;
        item.gridrowspan = rowSpan;
        markGridAreaOccupied(occupiedMap, row, colStart, span, rowSpan);
    });
}

function resolveManualCollisions(containerStamp, anchorItemStamp) {
    if (!containerStamp || !anchorItemStamp) return;

    var items = GMDashContainerItems
        .filter(function (item) {
            return item.mdashcontainerstamp === containerStamp;
        })
        .sort(function (a, b) {
            var aIsAnchor = a.mdashcontaineritemstamp === anchorItemStamp;
            var bIsAnchor = b.mdashcontaineritemstamp === anchorItemStamp;
            if (aIsAnchor && !bIsAnchor) return -1;
            if (!aIsAnchor && bIsAnchor) return 1;
            return (a.ordem || 0) - (b.ordem || 0);
        });

    if (!items.length) return;

    var occupiedMap = {};

    items.forEach(function (item) {
        if (!item || getEffectiveItemLayoutMode(item) !== 'manual') return;

        var span = getItemGridSpan(item);
        var rowSpan = parseInt(item.gridrowspan, 10) || 1;
        var preferredRow = parseInt(item.gridrow, 10);
        var preferredCol = parseInt(item.gridcolstart, 10);
        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        item.gridrow = slot.row;
        item.gridcolstart = slot.colStart;
        item.tamanho = span;
        item.gridrowspan = rowSpan;
        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);
    });
}

function detectZone(event, ui, containerStamp, draggedItemStamp) {
    if (!ui || !ui.item || !containerStamp) return null;

    var $grid = ui.item.closest('.mdash-container-items-row');
    if (!$grid.length) return null;

    var gridRect = $grid.get(0).getBoundingClientRect();
    if (!gridRect || !gridRect.width) return null;

    // Obter coordenadas do mouse
    var clientX = event.clientX;
    var clientY = event.clientY;

    if (!clientX && event.originalEvent) {
        clientX = event.originalEvent.clientX;
        clientY = event.originalEvent.clientY;
    }

    if (!clientX) {
        var helperRect = ui.helper && ui.helper[0] ? ui.helper[0].getBoundingClientRect() : null;
        if (helperRect) {
            clientX = helperRect.left + helperRect.width / 2;
            clientY = helperRect.top + helperRect.height / 2;
        }
    }

    if (!clientX || !clientY) return null;

    // Obter todos os items existentes neste container (exceto o que está a ser arrastado)
    var existingItems = GMDashContainerItems.filter(function (item) {
        return item.mdashcontainerstamp === containerStamp &&
               item.mdashcontaineritemstamp !== draggedItemStamp &&
               getEffectiveItemLayoutMode(item) === 'manual' &&
               item.gridrow >= 1 &&
               item.gridcolstart >= 1;
    });

    // Agrupar items por linha
    var rowGroups = {};
    existingItems.forEach(function (item) {
        var row = parseInt(item.gridrow, 10);
        if (!rowGroups[row]) rowGroups[row] = [];
        rowGroups[row].push({
            colStart: parseInt(item.gridcolstart, 10),
            colEnd: parseInt(item.gridcolstart, 10) + getItemGridSpan(item) - 1,
            item: item
        });
    });

    // Ordenar linhas
    var sortedRows = Object.keys(rowGroups).map(function (r) { return parseInt(r, 10); }).sort(function (a, b) { return a - b; });

    // Detectar linha baseada no Y
    var yRelative = clientY - gridRect.top;
    var detectedRow = 1;

    // Procurar elementos DOM reais para detectar a linha
    var $items = $grid.find('.mdash-canvas-item').not(ui.item);
    var rowHeights = {};

    $items.each(function () {
        var $el = $(this);
        var stamp = $el.data('stamp');
        var itemData = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
        if (!itemData || itemData.mdashcontaineritemstamp === draggedItemStamp) return;

        var row = parseInt(itemData.gridrow, 10);
        if (row < 1) return;

        var rect = this.getBoundingClientRect();
        var relativeTop = rect.top - gridRect.top;
        var relativeBottom = rect.bottom - gridRect.top;

        if (!rowHeights[row] || relativeTop < rowHeights[row].top) {
            rowHeights[row] = {
                top: relativeTop,
                bottom: relativeBottom,
                height: rect.height
            };
        } else if (relativeBottom > rowHeights[row].bottom) {
            rowHeights[row].bottom = relativeBottom;
        }
    });

    // Detectar em que linha o Y está
    for (var row in rowHeights) {
        var bounds = rowHeights[row];
        if (yRelative >= bounds.top && yRelative <= bounds.bottom) {
            detectedRow = parseInt(row, 10);
            break;
        }
    }

    // Se o Y está abaixo de todas as linhas, criar nova linha
    if (sortedRows.length > 0) {
        var lastRow = sortedRows[sortedRows.length - 1];
        var lastBounds = rowHeights[lastRow];
        if (lastBounds && yRelative > lastBounds.bottom) {
            detectedRow = lastRow + 1;
        }
    }

    // Detectar coluna baseada no X
    var xRelative = clientX - gridRect.left;
    var computed = window.getComputedStyle($grid.get(0));
    var colGap = parseFloat(computed.columnGap || computed.gap || '14') || 14;
    var colUnit = (gridRect.width - (colGap * 11)) / 12;
    var detectedCol = Math.floor(xRelative / (colUnit + colGap)) + 1;

    if (detectedCol < 1) detectedCol = 1;
    if (detectedCol > 12) detectedCol = 12;

  /*  console.log('🎯 detectZone:', {
        mouseY: Math.round(yRelative),
        mouseX: Math.round(xRelative),
        detectedRow: detectedRow,
        detectedCol: detectedCol,
        rowHeights: rowHeights
    });*/

    return {
        row: detectedRow,
        col: detectedCol
    };
}

function computeManualDropSlot(event, ui, containerStamp, item) {
    if (!containerStamp || !item || !ui || !ui.item) return null;

    var zone = detectZone(event, ui, containerStamp, item.mdashcontaineritemstamp);
    if (!zone) return null;

    var span = getItemGridSpan(item);
    var rowSpan = parseInt(item.gridrowspan, 10) || 1;

    var targetCol = zone.col;
    var targetRow = zone.row;

    // Garantir que o item não ultrapassa a coluna 12
    if ((targetCol + span - 1) > 12) {
        targetCol = Math.max(1, 12 - span + 1);
    }

    var slot = {
        row: targetRow,
        colStart: targetCol,
        span: span,
        rowSpan: rowSpan
    };

   // console.log('📦 computeManualDropSlot:', slot);

    return slot;
}

function clearManualPlaceholder($scope) {
    if (!$scope || !$scope.length) return;
    $scope.find('.mdash-item-sort-placeholder')
        .removeClass('is-manual-preview')
        .removeAttr('data-grid-label')
        .css({
            'grid-column': '',
            'grid-row': ''
        });
}

function setManualDragPreviewSlot(itemStamp, containerStamp, slot) {
    if (!itemStamp || !slot) return;
    GManualDragState.itemStamp = itemStamp;
    GManualDragState.containerStamp = containerStamp || "";
    GManualDragState.slot = {
        row: slot.row,
        colStart: slot.colStart,
        span: slot.span,
        rowSpan: slot.rowSpan
    };
}

function getManualDragPreviewSlot(itemStamp, containerStamp) {
    if (!itemStamp || !GManualDragState.slot) return null;
    if (GManualDragState.itemStamp !== itemStamp) return null;
    if (containerStamp && GManualDragState.containerStamp && GManualDragState.containerStamp !== containerStamp) return null;
    return GManualDragState.slot;
}

function clearManualDragPreviewSlot() {
    GManualDragState.itemStamp = "";
    GManualDragState.containerStamp = "";
    GManualDragState.slot = null;
}

function applyDroppedItemGridPosition(event, ui, containerStamp) {

    console.log("INICIANDO applyDroppedItemGridPosition com containerStamp:", containerStamp);
    if (!ui || !ui.item || !containerStamp) return;

    var currentContainerStamp = ui.item.closest('.mdash-canvas-container').data('stamp');
    if (currentContainerStamp && currentContainerStamp !== containerStamp) return;

    var itemStamp = ui.item.data('stamp');
    if (!itemStamp) return;

    var item = GMDashContainerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!item) return;

    console.log('🔵 ANTES DO DROP:', {
        itemStamp: itemStamp.substring(0, 8),
        gridrow: item.gridrow,
        gridcolstart: item.gridcolstart,
        tamanho: item.tamanho,
        layoutmode: item.layoutmode
    });

    item.mdashcontainerstamp = containerStamp;

    if (getEffectiveItemLayoutMode(item) !== "manual") {
        return;
    }

    var slot = getManualDragPreviewSlot(item.mdashcontaineritemstamp, containerStamp);
    if (!slot) {
        slot = computeManualDropSlot(event, ui, containerStamp, item);
    }
    if (!slot) return;

    console.log('✅ applyDroppedItemGridPosition - aplicando:', {
        itemStamp: itemStamp.substring(0, 8),
        row: slot.row,
        colStart: slot.colStart,
        span: slot.span
    });

    item.gridrow = slot.row;
    item.gridcolstart = slot.colStart;
    item.tamanho = slot.span;
    item.gridrowspan = slot.rowSpan;

    console.log('🔴 DEPOIS DO DROP (aplicado):', {
        itemStamp: itemStamp.substring(0, 8),
        gridrow: item.gridrow,
        gridcolstart: item.gridcolstart,
        tamanho: item.tamanho
    });

    // Sync imediato se existir
    if (typeof realTimeComponentSync === 'function') {
        console.log('💾 Chamando realTimeComponentSync...');
        realTimeComponentSync(item, item.table, item.idfield);
    }

    // SEM resolveManualCollisions - item vai para posição exata
}

function initContainerItemResize() {
    $(document)
        .off('pointerdown.mdashItemResize mousedown.mdashItemResize')
        .on('pointerdown.mdashItemResize mousedown.mdashItemResize', '.mdash-item-resize-handle', function (event) {
            // Evita duplicação em browsers que disparam pointerdown + mousedown.
            if (event.type === 'mousedown' && window.PointerEvent) return;

            event.preventDefault();
            event.stopPropagation();

            var pointX = event.clientX;
            if ((pointX === undefined || pointX === null) && event.originalEvent && event.originalEvent.touches && event.originalEvent.touches[0]) {
                pointX = event.originalEvent.touches[0].clientX;
            }
            if (pointX === undefined || pointX === null) return;

            var $itemEl = $(this).closest('.mdash-canvas-item');
            if (!$itemEl.length) return;

            var itemStamp = $itemEl.data('stamp');
            var item = GMDashContainerItems.find(function (i) {
                return i.mdashcontaineritemstamp === itemStamp;
            });
            if (!item) return;

            var $grid = $itemEl.closest('.mdash-container-items-row');
            if (!$grid.length) return;

            var startX = pointX;
            var isLeftHandle = $(this).hasClass('mdash-item-resize-handle-left');
            var startSize = parseInt(item.tamanho, 10) || 4;
            var lastSize = startSize;
            var maxWarnShown = false;
            var minWarnShown = false;

            var gridElement = $grid.get(0);
            var computedGrid = window.getComputedStyle(gridElement);
            var gap = parseFloat(computedGrid.columnGap || computedGrid.gap || '14') || 14;
            var gridWidth = $grid.innerWidth() || $grid.width() || 0;
            var colUnit = (gridWidth - (gap * 11)) / 12;

            // Fallback quando o cálculo da grid não devolve largura válida.
            if (!colUnit || colUnit <= 0) {
                colUnit = ($itemEl.outerWidth() || 1) / Math.max(startSize, 1);
            }
            if (!colUnit || colUnit <= 0) colUnit = 20;

            $('body').addClass('mdash-resize-active');
            $itemEl.addClass('is-resizing');
            GMDashIsResizingItem = true;

            $('.mdash-container-items-row').each(function () {
                var $row = $(this);
                if ($row.data('ui-sortable')) {
                    $row.sortable('option', 'disabled', true);
                }
            });

            function readClientX(moveEvent) {
                if (moveEvent.clientX !== undefined && moveEvent.clientX !== null) return moveEvent.clientX;
                if (moveEvent.originalEvent && moveEvent.originalEvent.touches && moveEvent.originalEvent.touches[0]) {
                    return moveEvent.originalEvent.touches[0].clientX;
                }
                return null;
            }

            function applySize(proposed, moveEvent) {
                var minAllowed = (moveEvent && moveEvent.altKey) ? 1 : 2;

                if (proposed > 12) {
                    proposed = 12;
                    if (!maxWarnShown && typeof alertify !== 'undefined') {
                        alertify.warning('Tamanho maximo possivel atingido (12 colunas).', 2500);
                        maxWarnShown = true;
                    }
                }

                if (proposed < minAllowed) {
                    proposed = minAllowed;
                    if (minAllowed === 2 && !minWarnShown && typeof alertify !== 'undefined') {
                        alertify.message('Tamanho minimo recomendado: 2 colunas (ALT para permitir 1).', 2500);
                        minWarnShown = true;
                    }
                }

                if (proposed === lastSize) return;

                lastSize = proposed;
                item.tamanho = proposed;
                $itemEl.css('grid-column', 'span ' + proposed);
                
                // Atualiza o badge diretamente no DOM durante o resize usando data-attribute
                var $badge = $itemEl.find('.mdash-item-size-badge[data-item-stamp="' + itemStamp + '"]');
                if ($badge.length) {
                    $badge.text(proposed + ' col');
                    $badge.attr('title', 'Largura: ' + proposed + ' colunas');
                }
                
                setTimeout(syncAllContainerItemsLayout, 0);
            }

            function onPointerMove(moveEvent) {
                var moveX = readClientX(moveEvent);
                if (moveX === null) return;
                var deltaX = moveX - startX;
                var directionFactor = isLeftHandle ? -1 : 1;
                var deltaCols = Math.round((deltaX * directionFactor) / colUnit);
                var proposed = startSize + deltaCols;
                applySize(proposed, moveEvent);
            }

            function cleanup() {
                $(document).off('pointermove.mdashItemResizeActive mousemove.mdashItemResizeActive', onPointerMove);
                $(document).off('pointerup.mdashItemResizeActive mouseup.mdashItemResizeActive', onPointerUp);
                $('body').removeClass('mdash-resize-active');
                $itemEl.removeClass('is-resizing').css('grid-column', '');
                GMDashIsResizingItem = false;

                $('.mdash-container-items-row').each(function () {
                    var $row = $(this);
                    if ($row.data('ui-sortable')) {
                        $row.sortable('option', 'disabled', false);
                    }
                });

                if (lastSize !== startSize && typeof realTimeComponentSync === 'function') {
                    realTimeComponentSync(item, item.table, item.idfield);
                }
                setTimeout(syncAllContainerItemsLayout, 0);
            }

            function onPointerUp() {
                cleanup();
            }

            $(document).on('pointermove.mdashItemResizeActive mousemove.mdashItemResizeActive', onPointerMove);
            $(document).on('pointerup.mdashItemResizeActive mouseup.mdashItemResizeActive', onPointerUp);
        });
}

function makeToolboxDraggable() {
    $('.mdash-toolbox-item').draggable({
        helper: 'clone',
        revert: 'invalid',
        appendTo: 'body',
        zIndex: 9999,
        cancel: '',
        start: function (e, ui) {
            ui.helper.addClass('dragging');
        }
    });
}

function makeCanvasDroppable() {
    $('#mdash-canvas-body').droppable({
        accept: '.toolbox-container',
        tolerance: 'pointer',
        hoverClass: 'mdash-drop-hover',
        drop: function () {
            createContainerByDrop();
        }
    });

    $('.mdash-container-items').droppable({
        accept: '.toolbox-container-item',
        tolerance: 'pointer',
        hoverClass: 'mdash-drop-hover',
        drop: function (event, ui) {
            var containerStamp = $(this).data('container');
            createContainerItemByDrop(containerStamp);
        }
    });
}

function makeContainersSortable() {
    $('#mdash-canvas-body').sortable({
        items: '.mdash-canvas-container',
        handle: '.mdash-container-drag-handle',
        axis: 'y',
        tolerance: 'intersect',
        forcePlaceholderSize: true,
        distance: 4,
        revert: 120,
        placeholder: 'mdash-sort-placeholder',
        start: function (event, ui) {
            ui.placeholder.height(ui.item.outerHeight());
            ui.placeholder.width(ui.item.outerWidth());
            ui.item.addClass('is-dragging');
        },
        stop: function (event, ui) {
            ui.item.removeClass('is-dragging');
        },
        update: function () {
            updateContainerOrderFromDom();
        }
    });
}

function makeContainerItemsSortable() {
    $('.mdash-container-items-row').each(function () {
        $(this).sortable({
            items: '.mdash-canvas-item',
            cancel: '.mdash-item-resize-handle, .mdash-item-resize-handle *',
            connectWith: '.mdash-container-items-row',
            helper: 'clone',
            appendTo: 'body',
            zIndex: 10050,
            placeholder: 'mdash-item-sort-placeholder',
            forcePlaceholderSize: true,
            refreshPositions: true,
            toleranceElement: '.mdash-canvas-item-card',
            tolerance: 'pointer',
            distance: 6,
            over: function () {
                console.log('⬇️ OVER EVENT disparado');
                $(this).addClass('is-drop-over');
            },
            out: function (event, ui) {
                console.log('⬆️ OUT EVENT disparado');
                $(this).removeClass('is-drop-over');
                clearManualPlaceholder($(this));
                
                // Limpa feedback visual ao sair da linha
                VisualFeedbackManager.clearFeedback($(this));
            },
            start: function (event, ui) {
                console.log('🚀 START EVENT disparado');
                if (GMDashIsResizingItem) return false;
                clearManualDragPreviewSlot();
                var itemSpan = ui.item && ui.item.css ? ui.item.css('grid-column') : '';
                if (ui && ui.placeholder && ui.item) {
                    ui.placeholder.height(ui.item.outerHeight());
                    ui.placeholder.width(ui.item.outerWidth());
                    if (itemSpan) {
                        ui.placeholder.css('grid-column', itemSpan);
                    }
                }
                if (ui && ui.helper) {
                    ui.helper.addClass('mdash-item-drag-helper');
                    ui.helper.css({
                        width: ui.item.outerWidth(),
                        minWidth: ui.item.outerWidth(),
                        height: ui.item.outerHeight(),
                        opacity: 0.96,
                        zIndex: 10050,
                        pointerEvents: 'none'
                    });
                }
            },
            receive: function (event, ui) {
                console.log('📥 RECEIVE EVENT iniciado (item movido entre linhas diferentes)');
                
                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var movedItemStamp = ui.item && ui.item.data('stamp');
                var movedItem = GMDashContainerItems.find(function (i) {
                    return i.mdashcontainerstamp === movedItemStamp;
                });
                
                var isManualMode = movedItem && getEffectiveItemLayoutMode(movedItem) === 'manual';
                
                // ⭐ VERIFICA VALIDAÇÃO ANTES DE EXECUTAR
                if (isManualMode) {
                    var validation = GManualDragState.validation;
                    if (!validation || !validation.isValid) {
                        console.log('❌ RECEIVE: Validação falhou - bloqueando operação');
                        $(this).sortable('cancel');
                        return; // SAI sem fazer nada
                    }
                }

                if (movedItem && targetStamp && movedItem.mdashcontainerstamp !== targetStamp) {
                    movedItem.mdashcontainerstamp = targetStamp;
                    if (typeof realTimeComponentSync === 'function') {
                        realTimeComponentSync(movedItem, movedItem.table, movedItem.idfield);
                    }
                }
                
                console.log('📥 RECEIVE: chamando applyDroppedItemGridPosition');
                applyDroppedItemGridPosition(event, ui, targetStamp);
                updateContainerItemsOrder(targetStamp, isManualMode);

                var sourceStamp = ui.sender ? $(ui.sender).closest('.mdash-canvas-container').data('stamp') : '';
                if (sourceStamp) {
                    updateContainerItemsOrder(sourceStamp);
                }

                setTimeout(function() {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === movedItemStamp; });
                    console.log('🏁 ESTADO FINAL RECEIVE (após syncAllContainerItemsLayout):', {
                        itemStamp: movedItemStamp.substring(0, 8),
                        gridrow: finalItem ? finalItem.gridrow : 'item não encontrado',
                        gridcolstart: finalItem ? finalItem.gridcolstart : 'item não encontrado',
                        tamanho: finalItem ? finalItem.tamanho : 'item não encontrado'
                    });
                }, 100);

                setTimeout(syncAllContainerItemsLayout, 0);
            },
            sort: function (event, ui) {
                console.log('🔄 SORT EVENT disparado');
                if (ui && ui.placeholder && ui.item) {
                    ui.placeholder.height(ui.item.outerHeight());
                    ui.placeholder.width(ui.item.outerWidth());
                }

                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                if (!targetStamp || !itemStamp) return;

                var item = GMDashContainerItems.find(function (i) {
                    return i.mdashcontaineritemstamp === itemStamp;
                });
                if (!item) return;

                if (getEffectiveItemLayoutMode(item) !== 'manual') {
                    clearManualPlaceholder($(this));
                    clearManualDragPreviewSlot();
                    return;
                }

                var slot = computeManualDropSlot(event, ui, targetStamp, item);
                if (!slot) {
                    clearManualPlaceholder($(this));
                    clearManualDragPreviewSlot();
                    return;
                }

                // ⭐ VALIDAÇÃO EM TEMPO REAL
                var validation = DragDropValidator.validateDrop(item, slot.row, slot.colStart, targetStamp);
                
                console.log('✅ Validação:', validation);
                
                var $targetRow = $(this); // A grid onde está a arrastar
                
                // Feedback visual baseado na validação (apenas na grid-row específica)
                if (!validation.isValid) {
                    VisualFeedbackManager.showErrorFeedback($targetRow, slot.row, validation.message);
                    // Mantém o placeholder para mostrar onde está a tentar soltar
                    if (ui.placeholder && ui.placeholder.css) {
                        ui.placeholder
                            .removeClass('mdash-placeholder-success') // Remove classe de sucesso
                            .addClass('is-manual-preview mdash-placeholder-error')
                            .attr('data-grid-label', '❌ ' + validation.message);
                        ui.placeholder.css({
                            'grid-column': slot.colStart + ' / span ' + slot.span,
                            'grid-row': slot.row + ' / span ' + slot.rowSpan
                        });
                    }
                    // ⭐ CANCELA O ESTADO - DROP SERÁ BLOQUEADO NO STOP
                    setManualDragPreviewSlot(null, null, null);
                    GManualDragState.validation = null;
                    
                    console.log('❌ SORT: Validação falhou - drop será bloqueado');
                } else {
                    // Salva validação para usar no STOP
                    setManualDragPreviewSlot(item.mdashcontaineritemstamp, targetStamp, slot);
                    GManualDragState.validation = validation;
                    
                    // Feedback visual baseado na estratégia (apenas na grid-row específica)
                    switch (validation.strategy) {
                        case 'swap':
                            VisualFeedbackManager.showSwapFeedback($targetRow, slot.row, validation.targetItem);
                            break;
                        case 'adjust':
                        case 'reposition': // Mesma linha ou linha diferente com ajustes
                            VisualFeedbackManager.showSuccessFeedback($targetRow, slot.row, validation.adjustments);
                            break;
                    }
                    
                    // Atualiza placeholder
                    if (ui.placeholder && ui.placeholder.css) {
                        ui.placeholder
                            .removeClass('mdash-placeholder-error') // Remove classe de erro
                            .addClass('is-manual-preview mdash-placeholder-success')
                            .attr('data-grid-label', '✓ Linha ' + slot.row + ' Col ' + slot.colStart);
                        ui.placeholder.css({
                            'grid-column': slot.colStart + ' / span ' + slot.span,
                            'grid-row': slot.row + ' / span ' + slot.rowSpan
                        });
                    }
                }
            },
            stop: function (event, ui) {
                console.log('🛑 STOP EVENT disparado');
                $(this).removeClass('is-drop-over');
                clearManualPlaceholder($(this));
                
                // Limpa feedback visual da linha
                VisualFeedbackManager.clearFeedback($(this));
                
                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                
                if (item && targetStamp) {
                    var isManualMode = getEffectiveItemLayoutMode(item) === 'manual';
                    
                    if (isManualMode) {
                        var validation = GManualDragState.validation;
                        
                        // ⭐ BLOQUEIA DROP SE VALIDAÇÃO FALHOU
                        if (!validation || !validation.isValid) {
                            console.log('❌ STOP: Validação falhou - cancelando drop e revertendo');
                            
                            // Cancela o sortable - item volta ao lugar original
                            $(this).sortable('cancel');
                            
                            // Limpa estado global
                            clearManualDragPreviewSlot();
                            GManualDragState.validation = null;
                            
                            // Força re-render IMEDIATO para garantir que item voltou visualmente
                            syncAllContainerItemsLayout();
                            
                            console.log('🔙 Item revertido para posição original');
                            return; // SAI AQUI - não executa mais nada
                        }
                        
                        // ✅ VALIDAÇÃO OK - EXECUTA ESTRATÉGIA
                        console.log('📌 Executando estratégia:', validation.strategy);
                        
                        switch (validation.strategy) {
                            case 'swap':
                                DragDropExecutor.executeSwap(item, validation.targetItem);
                                break;
                                
                            case 'reposition':
                                // Reposiciona na mesma linha
                                applyDroppedItemGridPosition(event, ui, targetStamp);
                                // Executa ajustes dos outros items (se houver)
                                if (validation.adjustments && validation.adjustments.length > 0) {
                                    DragDropExecutor.executeAdjust(validation.adjustments);
                                }
                                break;
                                
                            case 'adjust':
                                // Aplica posição do item arrastado (linha diferente)
                                applyDroppedItemGridPosition(event, ui, targetStamp);
                                // Executa ajustes dos outros items
                                DragDropExecutor.executeAdjust(validation.adjustments);
                                break;
                                
                            default:
                                // Fallback: apenas aplica posição
                                applyDroppedItemGridPosition(event, ui, targetStamp);
                        }
                        
                        // Atualiza ordem (com flag para NÃO sincronizar coordinates - já foi feito acima)
                        updateContainerItemsOrder(targetStamp, true);
                        
                        setTimeout(function() {
                            var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                            console.log('🏁 ESTADO FINAL STOP:', {
                                itemStamp: itemStamp.substring(0, 8),
                                gridrow: finalItem ? finalItem.gridrow : 'N/A',
                                gridcolstart: finalItem ? finalItem.gridcolstart : 'N/A',
                                tamanho: finalItem ? finalItem.tamanho : 'N/A'
                            });
                        }, 100);
                    } else {
                        // Modo auto: sempre permite
                        updateContainerItemsOrder(targetStamp, false);
                    }
                }
                
                // Limpa estado global
                clearManualDragPreviewSlot();
                GManualDragState.validation = null;
                
                setTimeout(syncAllContainerItemsLayout, 0);
            },
            update: function (event, ui) {
                console.log('🎬 UPDATE EVENT disparado (movimento dentro da mesma linha)');
                
                var liveContainerStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                var isManualMode = item && getEffectiveItemLayoutMode(item) === 'manual';
                
                // ⭐ VERIFICA VALIDAÇÃO ANTES DE EXECUTAR
                if (isManualMode) {
                    var validation = GManualDragState.validation;
                    if (!validation || !validation.isValid) {
                        console.log('❌ UPDATE: Validação falhou - bloqueando operação');
                        $(this).sortable('cancel');
                        clearManualPlaceholder($(this));
                        clearManualDragPreviewSlot();
                        return; // SAI sem fazer nada
                    }
                }
                
                applyDroppedItemGridPosition(event, ui, liveContainerStamp);
                updateContainerItemsOrder(liveContainerStamp, isManualMode);
                clearManualPlaceholder($(this));
                clearManualDragPreviewSlot();
                
                setTimeout(function() {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                    console.log('🏁 ESTADO FINAL (após syncAllContainerItemsLayout):', {
                        itemStamp: itemStamp.substring(0, 8),
                        gridrow: finalItem.gridrow,
                        gridcolstart: finalItem.gridcolstart,
                        tamanho: finalItem.tamanho
                    });
                }, 100);
                
                setTimeout(syncAllContainerItemsLayout, 0);
            }
        });
    });
}

function createContainerByDrop() {
    var tabStamp = (GMDashTabsRuntime && typeof GMDashTabsRuntime.resolveNewContainerTabStamp === 'function')
        ? GMDashTabsRuntime.resolveNewContainerTabStamp()
        : '';
    var newContainer = new MdashContainer({ dashboardstamp: GMDashStamp, layoutmode: "manual", mdashtabstamp: tabStamp });
    window.appState.containers.push(newContainer);
    
    // Sincroniza o novo container com a base de dados IMEDIATAMENTE
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(newContainer, newContainer.table, newContainer.idfield);
    }
    
    var selComp = { type: "container", stamp: newContainer.mdashcontainerstamp, data: newContainer };
    _currentSelectedComponent = selComp;
    handleComponentProperties(selComp);
    setTimeout(initDragAndDrop, 0);
    alertify.success('Container criado');
}

function createContainerItemByDrop(containerStamp) {
    if (!containerStamp) return;
    var newItem = new MdashContainerItem({ mdashcontainerstamp: containerStamp, dashboardstamp: GMDashStamp });
    window.appState.containerItems.push(newItem);
    
    // Sincroniza o novo item com a base de dados IMEDIATAMENTE
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(newItem, newItem.table, newItem.idfield);
    }
    
    var selComp = { type: "containerItem", stamp: newItem.mdashcontaineritemstamp, data: newItem };
    _currentSelectedComponent = selComp;
    handleComponentProperties(selComp);
    setTimeout(function () {
        renderContainerItemTemplate(newItem);
        initDragAndDrop();
    }, 0);
    alertify.success('Item criado');
}

function updateContainerOrderFromDom() {
    $('#mdash-canvas-body .mdash-canvas-container').each(function (idx) {
        var stamp = $(this).data('stamp');
        var container = GMDashContainers.find(function (c) { return c.mdashcontainerstamp === stamp; });
        if (container) {
            container.ordem = idx + 1;
            if (typeof realTimeComponentSync === "function") {
                realTimeComponentSync(container, container.table, container.idfield);
            }
        }
    });
}

function updateContainerItemsOrder(containerStamp, skipCoordinateCheck) {
    if (!containerStamp) return;

    console.log('📋 updateContainerItemsOrder chamado:', {
        containerStamp: containerStamp.substring(0, 8),
        skipCoordinateCheck: skipCoordinateCheck
    });

    var selector = '.mdash-canvas-container[data-stamp=\"' + containerStamp + '\"] .mdash-canvas-item';
    $(selector).each(function (idx) {
        var stamp = $(this).data('stamp');
        var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === stamp; });
        if (item) {
            var oldRow = item.gridrow;
            var oldCol = item.gridcolstart;
            
            item.ordem = idx + 1;
            item.mdashcontainerstamp = containerStamp;
            if (!item.tamanho || item.tamanho < 1) {
                item.tamanho = getItemGridSpan(item);
            }
            
            if (item.gridrow !== oldRow || item.gridcolstart !== oldCol) {
                console.log('⚠️ updateContainerItemsOrder MUDOU posição:', {
                    itemStamp: stamp.substring(0, 8),
                    antes: { row: oldRow, col: oldCol },
                    depois: { row: item.gridrow, col: item.gridcolstart }
                });
            }
            
            // Só sincroniza se NÃO for skipCoordinateCheck (modo manual já sincroniza em applyDroppedItemGridPosition)
            if (!skipCoordinateCheck && typeof realTimeComponentSync === "function") {
                realTimeComponentSync(item, item.table, item.idfield);
            }
        }
    });

    if (skipCoordinateCheck) {
        console.log('⏭️ updateContainerItemsOrder: skip coordinate check');
        setTimeout(syncAllContainerItemsLayout, 0);
        return;
    }

    if (containerHasAutoLayoutItems(containerStamp)) {
        normalizeContainerItemsAutoLayout(containerStamp);
    } else {
        console.log('🔧 Chamando ensureManualItemsHaveCoordinates...');
        ensureManualItemsHaveCoordinates(containerStamp);
    }

    setTimeout(syncAllContainerItemsLayout, 0);
}

// ============================================================================
// PROPRIEDADES DINÂMICAS (lado direito)
// ============================================================================

/**
 * Actualiza o header do componente no painel de propriedades (estilo FlutterFlow).
 * Mostra ícone + tipo + nome do componente seleccionado.
 */
function updatePropsComponentHeader(selectedComponent) {
    var header = document.getElementById('mdash-props-component-header');
    if (!header) return;

    var iconClass = 'glyphicon glyphicon-stop';
    var typeLabel = 'Nenhum seleccionado';
    var nameLabel = '';

    if (selectedComponent && selectedComponent.data) {
        var d = selectedComponent.data;
        if (selectedComponent.type === 'container') {
            iconClass = 'glyphicon glyphicon-th-large';
            typeLabel = 'Container';
            nameLabel = d.titulo || d.mdashcontainerstamp || '';
        } else if (selectedComponent.type === 'containerItem') {
            iconClass = 'glyphicon glyphicon-th';
            typeLabel = 'Container Item';
            nameLabel = d.titulo || d.mdashcontaineritemstamp || '';
        } else if (selectedComponent.type === 'slot') {
            iconClass = 'glyphicon glyphicon-modal-window';
            typeLabel = 'Slot';
            nameLabel = d.slotId || '';
        } else if (selectedComponent.type === 'object') {
            iconClass = getObjectTypeIcon(d.tipo || '') || 'glyphicon glyphicon-stop';
            typeLabel = 'Objecto';
            nameLabel = d.tipo || d.mdashcontaineritemobjectstamp || '';
        } else if (selectedComponent.type === 'global') {
            iconClass = 'glyphicon glyphicon-hdd';
            typeLabel = 'Fontes Globais';
            nameLabel = '';
        }
    }

    var infoEl = header.querySelector('.mdash-props-component-info');
    if (infoEl) {
        var displayName = nameLabel ? typeLabel + ' — ' + nameLabel : typeLabel;
        infoEl.innerHTML = '<span class="mdash-props-component-icon"><i class="' + iconClass + '"></i></span>' +
            '<span class="mdash-props-component-name">' + displayName + '</span>';
    }
}

function handleComponentProperties(selectedComponent) {
    var panel = $('#mdash-properties-panel');
    if (!panel.length) return;

    // Cancelar qualquer timer pendente do editor de gráficos
    var _pendingTimer = panel.data('_mciTimer');
    if (_pendingTimer) { clearTimeout(_pendingTimer); panel.removeData('_mciTimer'); }

    // Limpar TODOS os handlers delegados do contexto anterior (chart / object / slot)
    // para evitar que change events no novo editor disparem callbacks stale
    panel.off('.mcbi .objprops .slotprops');

    // Restaurar tabs (podem estar ocultas se o último contexto era um slot)
    $('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').show();

    // Activa sempre a tab de propriedades quando muda componente
    activatePropertiesTab('properties');

    // ── Guardar referência acessível fora do PetiteVue ──
    _currentSelectedComponent = selectedComponent || null;

    // ── Actualizar header do componente (estilo FlutterFlow) ──
    updatePropsComponentHeader(selectedComponent);

    if (!selectedComponent || !selectedComponent.data) {
        panel.html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hand-up"></i><p>Selecione um componente</p></div>');
        $('#mdash-fontes-panel').html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hdd"></i><p>Selecione um componente para gerir fontes</p></div>');
        $('#mdash-actions-panel').html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-flash"></i><p>Selecione um componente para configurar acções</p></div>');
        return;
    }

    if (selectedComponent.type === "container") {
        var formConfig = getContainerUIObjectFormConfigAndSourceValues();
        renderPropertiesForm(panel, selectedComponent.data, formConfig);
    } else if (selectedComponent.type === "containerItem") {
        var formConfigItem = getContainerItemUIObjectFormConfigAndSourceValues();
        renderPropertiesForm(panel, selectedComponent.data, formConfigItem);
    } else if (selectedComponent.type === "slot") {
        var slotData = selectedComponent.data;
        if (slotData && slotData.itemStamp && slotData.slotId) {
            showSlotPropertiesEditor(slotData.itemStamp, slotData.slotId);
        }
    } else if (selectedComponent.type === "object") {
        showObjectPropertiesEditor(selectedComponent.data);
    } else {
        panel.html('<p class=\"text-muted\">Tipo ainda não suportado.</p>');
    }

    // Actualiza fontes panel (sempre pré-renderiza para estar pronto ao mudar de tab)
    renderFontesPanel(selectedComponent);

    // Actualiza actions panel (placeholder para já)
    $('#mdash-actions-panel').html('<div class="mdash-props-empty-state" style="padding-top:40px;"><i class="glyphicon glyphicon-flash"></i><p>Acções e eventos<br/><small style="opacity:0.5;">Em desenvolvimento</small></p></div>');
}

function buildModalEntityTitle(typeLabel, titleValue) {
    var cleanTitle = (titleValue || "").toString().trim();
    return cleanTitle ? (typeLabel + " - " + cleanTitle) : typeLabel;
}

function resetModalOpenState(modalSelector) {
    var $existingModal = $(modalSelector);
    if ($existingModal.length) {
        $existingModal.modal('hide');
        $existingModal.remove();
    }

    $('.modal-backdrop').remove();
    if ($('.modal.in').length === 0) {
        $('body').removeClass('modal-open').css('padding-right', '');
    }
}

function renderPropertiesForm(panel, entity, formConfig) {
    if (!formConfig || !formConfig.objectsUIFormConfig) return;

    // Agrupar campos por secção (estilo FlutterFlow collapsible sections)
    var sections = {};
    var sectionOrder = [];
    formConfig.objectsUIFormConfig.forEach(function (obj) {
        var sec = obj.seccao || 'Geral';
        if (!sections[sec]) {
            sections[sec] = [];
            sectionOrder.push(sec);
        }
        sections[sec].push(obj);
    });

    var sectionIcons = {
        'Identidade': 'glyphicon-tag',
        'Layout': 'glyphicon-th-large',
        'Dados': 'glyphicon-hdd',
        'Geral': 'glyphicon-cog'
    };

    var html = '';
    sectionOrder.forEach(function (secName) {
        var fields = sections[secName];
        var secIcon = sectionIcons[secName] || 'glyphicon-option-horizontal';
        var secId = 'mdash-prop-sec-' + secName.toLowerCase().replace(/\s+/g, '-');

        html += '<div class="mdash-prop-section" data-section="' + secId + '">';
        html += '  <div class="mdash-prop-section-header" data-toggle-section="' + secId + '">';
        html += '    <span class="mdash-prop-section-title"><i class="glyphicon ' + secIcon + '"></i> ' + secName + '</span>';
        html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
        html += '  </div>';
        html += '  <div class="mdash-prop-section-body" id="' + secId + '">';
        html += '    <div class="row">';

        fields.forEach(function (obj) {
            var isCheckbox = obj.tipo === "checkbox";
            var isSelect = obj.contentType === "select";
            var isDiv = obj.contentType === "div";
            var value = entity[obj.campo] || "";
            if (isCheckbox) value = !!entity[obj.campo];

            html += '<div class="col-md-12" style="margin-bottom:6px;">';
            html += '  <div class="mdash-prop-field">';

            var commonAttrs = ' data-field="' + obj.campo + '" class="' + (obj.classes || '') + '" ';
            var style = obj.style ? ' style="' + obj.style + '" ' : '';

            if (isCheckbox) {
                html += '    <label class="mdash-prop-field-check"><input type="checkbox" ' + commonAttrs + (value ? 'checked' : '') + ' /><span>' + obj.titulo + '</span></label>';
            } else if (isSelect) {
                html += '    <label>' + obj.titulo + '</label>';
                html += '    <select ' + commonAttrs + style + '>';
                html += '      <option value="">-- Selecione --</option>';
                (obj.selectValues || []).forEach(function (opt) {
                    var optVal = opt[obj.fieldToValue];
                    var optLabel = opt[obj.fieldToOption];
                    var selected = value == optVal ? 'selected' : '';
                    html += '      <option value="' + optVal + '" ' + selected + '>' + optLabel + '</option>';
                });
                html += '    </select>';
            } else if (isDiv) {
                html += '    <label>' + obj.titulo + '</label>';
                html += '    <div ' + commonAttrs + style + '>' + (value || '') + '</div>';
            } else {
                html += '    <label>' + obj.titulo + '</label>';
                html += '    <input type="' + obj.tipo + '" ' + commonAttrs + style + ' value="' + value + '" />';
            }

            html += '  </div>';
            html += '</div>';
        });

        html += '    </div>'; // row
        html += '  </div>'; // section-body
        html += '</div>'; // section
    });

    panel.html(html);

    // Bind: toggle secções colapsáveis
    panel.find('.mdash-prop-section-header').on('click', function () {
        var $section = $(this).closest('.mdash-prop-section');
        $section.toggleClass('is-collapsed');
    });

    // Bind events para campos
    panel.find('[data-field]').on('change keyup', function () {
        var field = $(this).data('field');
        var val;
        if (this.type === 'checkbox') {
            val = this.checked;
        } else {
            val = $(this).val();
        }
        entity[field] = val;
        if (typeof realTimeComponentSync === "function") {
            realTimeComponentSync(entity, entity.table, entity.idfield);
        }
        var isContainerItemEntity = !!entity.mdashcontaineritemstamp;
        if (isContainerItemEntity && (field === 'templatelayout' || field === 'tamanho' || field === 'titulo')) {
            renderContainerItemTemplate(entity);
        }
        if (field === 'tamanho' || field === 'gridrow' || field === 'gridcolstart' || field === 'layoutmode') {
            setTimeout(syncAllContainerItemsLayout, 0);
        }
    });

    // Inicializa ACE para campos de expressão
    handleCodeEditor();
}

// ============================================================================
// MÓDULO DE FILTROS - UI MODERNA
// ============================================================================

/**
 * Retorna o ícone do tipo de objeto
 */
function getObjectTypeIcon(tipo) {
    var icons = {
        'chart': 'glyphicon glyphicon-stats',
        'table': 'glyphicon glyphicon-th',
        'card': 'glyphicon glyphicon-credit-card',
        'text': 'glyphicon glyphicon-font',
        'image': 'glyphicon glyphicon-picture',
        'title': 'glyphicon glyphicon-header',
        'kpi': 'glyphicon glyphicon-dashboard',
        'list': 'glyphicon glyphicon-list',
        'separator': 'glyphicon glyphicon-minus',
        'html': 'glyphicon glyphicon-console',
        'filter': 'glyphicon glyphicon-filter'
    };
    return icons[tipo] || 'glyphicon glyphicon-stop';
}

/**
 * Catálogo de objetos disponíveis para arrastar para slots.
 * Organizado por categorias, com ícone, cor e descrição.
 * Este catálogo é extensível — basta adicionar novos items ao array.
 */
function getObjectCatalogDefinitions() {
    return [
        {
            category: 'Dados',
            items: [
                { value: 'chart', label: 'Gráfico', icon: 'glyphicon glyphicon-stats', color: 'rgba(59,130,246,0.12)', description: 'Gráfico de barras, linhas ou pizza' },
                { value: 'table', label: 'Tabela', icon: 'glyphicon glyphicon-th', color: 'rgba(16,185,129,0.12)', description: 'Tabela de dados com colunas' },
                { value: 'kpi', label: 'KPI', icon: 'glyphicon glyphicon-dashboard', color: 'rgba(245,158,11,0.12)', description: 'Indicador numérico com tendência' },
                { value: 'list', label: 'Lista', icon: 'glyphicon glyphicon-list', color: 'rgba(139,92,246,0.12)', description: 'Lista de registos ou items' }
            ]
        },
        {
            category: 'Conteúdo',
            items: [
                { value: 'TituloItem', label: 'Título do Item', icon: 'glyphicon glyphicon-header', color: 'rgba(236,72,153,0.12)', description: 'Mostra o título do Card (sem fonte de dados)' },
                { value: 'text', label: 'Texto', icon: 'glyphicon glyphicon-font', color: 'rgba(107,114,128,0.12)', description: 'Bloco de texto livre' },
                { value: 'image', label: 'Imagem', icon: 'glyphicon glyphicon-picture', color: 'rgba(6,182,212,0.12)', description: 'Imagem ou ícone visual' },
                { value: 'html', label: 'HTML', icon: 'glyphicon glyphicon-console', color: 'rgba(249,115,22,0.12)', description: 'Conteúdo HTML personalizado' },
                { value: 'customCode', label: 'Código', icon: 'fa fa-code', color: 'rgba(99,102,241,0.12)', description: 'Código JavaScript personalizado' }
            ]
        },
        {
            category: 'Layout',
            items: [
                { value: 'card', label: 'Card', icon: 'glyphicon glyphicon-credit-card', color: 'rgba(59,130,246,0.12)', description: 'Card informativo compacto' },
                { value: 'separator', label: 'Separador', icon: 'glyphicon glyphicon-minus', color: 'rgba(203,213,225,0.18)', description: 'Linha separadora visual' },
                { value: 'filter', label: 'Filtro', icon: 'glyphicon glyphicon-filter', color: 'rgba(168,85,247,0.12)', description: 'Filtro inline no dashboard' }
            ]
        }
    ];
}

// ============================================================================
// MÓDULO DE CONTAINERS
// ============================================================================

/**
 * Adiciona um novo container
 */
function addNewContainer() {
    var tabStamp = (GMDashTabsRuntime && typeof GMDashTabsRuntime.resolveNewContainerTabStamp === 'function')
        ? GMDashTabsRuntime.resolveNewContainerTabStamp()
        : '';
    var newContainer = new MdashContainer({
        dashboardstamp: GMDashStamp,
        layoutmode: "manual",
        mdashtabstamp: tabStamp
    });

    // Adiciona ao estado reativo
    window.appState.containers.push(newContainer);

    // Abre modal de edição
    openContainerEditModal(newContainer);
}

/**
 * Edita um container existente
 */
function editContainer(containerStamp) {
    var container = GMDashContainers.find(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (!container) {
        alertify.error('Container não encontrado');
        return;
    }

    openContainerEditModal(container);
}

/**
 * Abre modal de edição de container
 */
function openContainerEditModal(container) {
    // Remove modal se já existir e limpa estado órfão do Bootstrap
    resetModalOpenState('#mdash-container-edit-modal');

    // Obtém a configuração do formulário
    var formConfig = getContainerUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    // Gera o HTML do formulário dinamicamente
    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isCheckbox = obj.tipo === "checkbox";
        var currentValue = container[obj.campo] || '';
        if (isCheckbox) {
            currentValue = container[obj.campo] || false;
        }

        var fieldClasses = obj.classes + " mdashconfig-item-input";
        var customData = obj.customData || '';
        customData += " v-model='mdashContainerItem." + obj.campo + "' @change='handleChangeContainer'";

        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
            formHtml += '    </div>';
        } else {
            formHtml += '    <input type="' + obj.tipo + '" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    // Monta o modal
    var containerModalTitle = buildModalEntityTitle("Container", container.titulo || container.codigo || "");
    var modalHtml = '<div class="modal fade" id="mdash-container-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-th-large"></i> ' + containerModalTitle;
    modalHtml += '        </h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <form id="mdash-container-edit-form">';
    modalHtml += formHtml;
    modalHtml += '        </form>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" onclick="saveContainerFromModal()">Guardar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    // Inicializa PetiteVue
    PetiteVue.createApp({
        mdashContainerItem: container,
        handleChangeContainer: function () {
            realTimeComponentSync(this.mdashContainerItem, this.mdashContainerItem.table, this.mdashContainerItem.idfield);
        }
    }).mount('#mdash-container-edit-modal');

    $('#mdash-container-edit-modal').modal('show');
}

/**
 * Guarda container e fecha modal
 */
function saveContainerFromModal() {
    $('#mdash-container-edit-modal').modal('hide');
    alertify.success('Container guardado com sucesso!');
}

/**
 * Elimina um container
 */
function deleteContainer(containerStamp) {
    var container = GMDashContainers.find(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (!container) {
        alertify.error('Container não encontrado');
        return;
    }

    var containerTitle = container.titulo || 'Container sem título';
    
    showDeleteConfirmation({
        title: 'Confirmar eliminação',
        message: 'Tem a certeza que deseja eliminar o container "' + containerTitle + '"?<br><small>Todos os items e objetos serão eliminados também.</small>',
        recordToDelete: {
            table: "MdashContainer",
            stamp: containerStamp,
            tableKey: "mdashcontainerstamp"
        },
        onConfirm: function() {
            executeDeleteContainer(containerStamp);
        }
    });
}

function executeDeleteContainer(containerStamp) {
    var container = GMDashContainers.find(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (!container) return;

    // Remove items do container
    var items = GMDashContainerItems.filter(function (item) {
        return item.mdashcontainerstamp === containerStamp;
    });

    items.forEach(function (item) {
        deleteContainerItem(item.mdashcontaineritemstamp, true);
    });

    // Remove do estado reativo
    var index = window.appState.containers.indexOf(container);
    if (index > -1) {
        window.appState.containers.splice(index, 1);
    }

    alertify.success('Container eliminado com sucesso!');
}

/**
 * Move um container para cima/baixo e normaliza ordem
 */
function moveContainer(containerStamp, direction) {
    if (!window.appState || !Array.isArray(window.appState.containers)) return;

    var ordered = window.appState.containers.slice().sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    var currentIndex = ordered.findIndex(function (c) {
        return c.mdashcontainerstamp === containerStamp;
    });

    if (currentIndex === -1) return;

    var targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    var temp = ordered[currentIndex];
    ordered[currentIndex] = ordered[targetIndex];
    ordered[targetIndex] = temp;

    ordered.forEach(function (container, idx) {
        container.ordem = idx + 1;
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(container, container.table, container.idfield);
        }
    });
}

/**
 * Adiciona um item a um container
 */
function addContainerItem(containerStamp) {
    var newItem = new MdashContainerItem({
        mdashcontainerstamp: containerStamp,
        dashboardstamp: GMDashStamp
    });

    // Adiciona ao estado reativo
    window.appState.containerItems.push(newItem);

    openContainerItemEditModal(newItem);
}

/**
 * Edita um container item
 */
function editContainerItem(itemStamp) {
    var item = GMDashContainerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });

    if (!item) {
        alertify.error('Item não encontrado');
        return;
    }

    openContainerItemEditModal(item);
}

/**
 * Abre modal de edição de container item
 */
function openContainerItemEditModal(item) {
    resetModalOpenState('#mdash-item-edit-modal');

    var itemModalTitle = buildModalEntityTitle("Container Item", item.titulo || item.codigo || "");

    var formConfig = getContainerItemUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isCheckbox = obj.tipo === 'checkbox';
        var isSelect = obj.contentType === 'select';
        var isDiv = obj.contentType === 'div';

        var currentValue = item[obj.campo] || '';
        if (isCheckbox) currentValue = item[obj.campo] || false;

        var fieldClasses = obj.classes + ' mdashconfig-item-input';
        var customData = obj.customData || '';

        if (isDiv) {
            customData += ' v-on:keyup="changeDivContent(\"' + obj.campo + '\")';
        } else {
            customData += " v-model='mdashItemData." + obj.campo + "' @change='handleChange'";
        }

        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        if (obj.contentType === 'input' && !isCheckbox) {
            formHtml += '    <input type="' + obj.tipo + '" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
        } else if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + ' />';
            formHtml += '    </div>';
        } else if (isSelect) {
            formHtml += '    <select id="' + obj.campo + '" class="' + fieldClasses + '" ' + customData + '>';
            formHtml += '      <option value="">-- Selecione --</option>';
            (obj.selectValues || []).forEach(function (opt) {
                formHtml += '      <option value="' + opt[obj.fieldToValue] + '">' + opt[obj.fieldToOption] + '</option>';
            });
            formHtml += '    </select>';
        } else if (isDiv) {
            formHtml += '    <div id="' + obj.campo + '" class="' + fieldClasses + '" style="' + (obj.style || 'width:100%;height:200px;') + '">' + currentValue + '</div>';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    var modalHtml = '<div class="modal fade" id="mdash-item-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-list-alt"></i> ' + itemModalTitle + '</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body"><form id="mdash-item-edit-form">' + formHtml + '</form></div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    PetiteVue.createApp({
        mdashItemData: item,
        handleChange: function () {
            realTimeComponentSync(this.mdashItemData, this.mdashItemData.table, this.mdashItemData.idfield);
            renderContainerItemTemplate(this.mdashItemData);
        }
    }).mount('#mdash-item-edit-modal');

    $('#mdash-item-edit-modal').modal('show');

    $('#mdash-item-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
    });
}

/**
 * Elimina um container item
 */
function deleteContainerItem(itemStamp, silent) {
    // Usa o array reativo se disponível
    var containerItemsArray = (window.appState && window.appState.containerItems) ? window.appState.containerItems : GMDashContainerItems;
    var containerItemObjectsArray = (window.appState && window.appState.containerItemObjects) ? window.appState.containerItemObjects : GMDashContainerItemObjects;
    
    var item = containerItemsArray.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });

    if (!item) return;
    
    // Confirmação antes de eliminar (exceto quando silent)
    if (!silent) {
        var itemTitle = item.titulo || 'Item sem título';
        
        showDeleteConfirmation({
            title: 'Confirmar eliminação',
            message: 'Tem a certeza que deseja eliminar o item "' + itemTitle + '"?<br><small>Todos os objetos associados serão eliminados também.</small>',
            recordToDelete: {
                table: "MdashContainerItem",
                stamp: itemStamp,
                tableKey: "mdashcontaineritemstamp"
            },
            onConfirm: function() {
                executeDeleteContainerItem(itemStamp, containerItemsArray, containerItemObjectsArray);
                alertify.success('Item eliminado com sucesso!');
            }
        });
        return;
    }
    
    // Se silent = true, elimina diretamente sem confirmação
    // Neste caso precisa adicionar o registo ao GMdashDeleteRecords
    if (silent) {
        GMdashDeleteRecords.push({
            table: "MdashContainerItem",
            stamp: itemStamp,
            tableKey: "mdashcontaineritemstamp"
        });
    }
    
    executeDeleteContainerItem(itemStamp, containerItemsArray, containerItemObjectsArray);
}

function executeDeleteContainerItem(itemStamp, containerItemsArray, containerItemObjectsArray) {
    var item = containerItemsArray.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });

    if (!item) return;

    // Remove objetos do item do array reativo
    var objects = containerItemObjectsArray.filter(function (obj) {
        return obj.mdashcontaineritemstamp === itemStamp;
    });

    objects.forEach(function (obj) {
        var objIndex = containerItemObjectsArray.indexOf(obj);
        if (objIndex > -1) {
            containerItemObjectsArray.splice(objIndex, 1);
        }
        GMdashDeleteRecords.push({
            table: "MdashContainerItemObject",
            stamp: obj.mdashcontaineritemobjectstamp,
            tableKey: "mdashcontaineritemobjectstamp"
        });
    });

    // Remove item do array reativo
    var index = containerItemsArray.indexOf(item);
    if (index > -1) {
        containerItemsArray.splice(index, 1);
    }
}

/**
 * Adiciona um novo objeto a um container item
 */
function addContainerItemObject(itemStamp) {
    var newObj = new MdashContainerItemObject({
        mdashcontaineritemstamp: itemStamp,
        dashboardstamp: GMDashStamp
    });
    window.appState.containerItemObjects.push(newObj);
    openContainerItemObjectEditModal(newObj);
}

/**
 * Edita um objeto de container item
 */
function editContainerItemObject(objectStamp) {
    var obj = GMDashContainerItemObjects.find(function (o) {
        return o.mdashcontaineritemobjectstamp === objectStamp;
    });
    if (!obj) {
        alertify.error('Objeto não encontrado');
        return;
    }
    openContainerItemObjectEditModal(obj);
}

/**
 * Abre modal de edição/criação de objeto
 */
function openContainerItemObjectEditModal(obj) {
    resetModalOpenState('#mdash-object-edit-modal');

    var objectModalTitle = buildModalEntityTitle("Objeto", obj.titulo || obj.expressaoobjecto || "");

    var tipoOptions = [
        { value: 'chart', label: 'Gráfico' },
        { value: 'table', label: 'Tabela' },
        { value: 'kpi', label: 'KPI' },
        { value: 'list', label: 'Lista' },
        { value: 'title', label: 'Título' },
        { value: 'text', label: 'Texto' },
        { value: 'image', label: 'Imagem' },
        { value: 'html', label: 'HTML' },
        { value: 'card', label: 'Card' },
        { value: 'separator', label: 'Separador' },
        { value: 'filter', label: 'Filtro' }
    ];

    var tipoSelectHtml = tipoOptions.map(function (t) {
        return '<option value="' + t.value + '">' + t.label + '</option>';
    }).join('');

    var fonteSelectHtml = (GMDashFontes || []).map(function (f) {
        return '<option value="' + f.mdashfontestamp + '">' + (f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
    }).join('');

    if (!obj.queryConfig) obj.queryConfig = { datasource: '', query: '', parameters: '' };
    var queryVal = obj.queryConfig.query || '';

    var modalHtml = '<div class="modal fade" id="mdash-object-edit-modal" tabindex="-1">';
    modalHtml += '<div class="modal-dialog modal-lg"><div class="modal-content">';
    modalHtml += '<div class="modal-header">';
    modalHtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '<h4 class="modal-title"><i class="glyphicon glyphicon-stop"></i> ' + objectModalTitle + '</h4>';
    modalHtml += '</div>';
    modalHtml += '<div class="modal-body"><div class="row">';
    modalHtml += '<div class="col-md-4"><div class="form-group"><label>Tipo</label>';
    modalHtml += '<select class="form-control" v-model="objData.tipo" @change="handleChange"><option value="">-- Selecione --</option>' + tipoSelectHtml + '</select>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="col-md-8"><div class="form-group"><label>Título</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.titulo" @change="handleChange" /></div></div>';
    modalHtml += '<div class="col-md-12"><div class="form-group"><label>Expressão / Identificador</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.expressaoobjecto" @change="handleChange" placeholder="Ex: vendas_total, chart_mensal..." /></div></div>';
    modalHtml += '<div class="col-md-6"><div class="form-group"><label>Fonte de Dados</label>';
    modalHtml += '<select class="form-control" v-model="objData.queryConfig.datasource" @change="handleChange"><option value="">-- Sem fonte --</option>' + fonteSelectHtml + '</select>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="col-md-6"><div class="form-group"><label>Parâmetros (JSON)</label>';
    modalHtml += '<input type="text" class="form-control" v-model="objData.queryConfig.parameters" @change="handleChange" placeholder=\'{}\' /></div></div>';
    modalHtml += '<div class="col-md-12"><div class="form-group"><label>Query SQL</label>';
    modalHtml += '<div id="mdash-obj-query-editor" class="m-editor" style="width:100%;height:180px;">' + queryVal + '</div>';
    modalHtml += '</div></div>';
    modalHtml += '</div></div>';
    modalHtml += '<div class="modal-footer">';
    modalHtml += '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '</div></div></div></div>';

    $('body').append(modalHtml);

    PetiteVue.createApp({
        objData: obj,
        handleChange: function () {
            realTimeComponentSync(this.objData, this.objData.table, this.objData.idfield);
        }
    }).mount('#mdash-object-edit-modal');

    $('#mdash-object-edit-modal').modal('show');

    $('#mdash-object-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
        var editorEl = document.getElementById('mdash-obj-query-editor');
        if (editorEl && typeof ace !== 'undefined') {
            var aceEd = ace.edit('mdash-obj-query-editor');
            aceEd.on('change', function () {
                obj.queryConfig.query = aceEd.getValue();
                realTimeComponentSync(obj, obj.table, obj.idfield);
            });
        }
    });
}

// ============================================================================
// EDITOR DE PROPRIEDADES DO OBJECTO
// ============================================================================

/**
 * Mostra as propriedades de um MdashContainerItemObject no painel col 3.
 * @param {MdashContainerItemObject} obj
 */
function showObjectPropertiesEditor(obj) {
    var panel = $('#mdash-properties-panel');
    if (!panel.length) return;
    if (!obj) {
        panel.html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-stop"></i><p>Objecto não encontrado</p></div>');
        return;
    }

    activatePropertiesTab('properties');
    var $propsPanel = $('.mdash-properties');
    if ($propsPanel.hasClass('is-collapsed')) $propsPanel.removeClass('is-collapsed');

    _renderObjectPropertiesPanel(obj, panel);
}

/**
 * Renderiza o conteúdo do painel de propriedades para um objecto.
 * Separado de showObjectPropertiesEditor para poder ser invocado sem mudar a tab activa
 * (ex: re-render silencioso ao voltar à tab Propriedades).
 */
function _renderObjectPropertiesPanel(obj, panel) {
    panel = panel || $('#mdash-properties-panel');
    if (!panel.length || !obj) return;

    // Cancelar qualquer timer pendente do editor de gráficos anterior
    var _pendingTimer = panel.data('_mciTimer');
    if (_pendingTimer) { clearTimeout(_pendingTimer); panel.removeData('_mciTimer'); }

    // Limpar handlers delegados do contexto anterior (slot / objecto genérico)
    panel.off('.slotprops');

    // ── Delegate to type-specific inline editor if one is registered ──────
    var tipoEntry = getMdashObjectTypeEntry(obj.tipo);
    if (tipoEntry && typeof tipoEntry.renderPropertiesInline === 'function') {
        // A tab Fontes mantém-se visível — gerida pelo painel de fontes (col 3, tab própria).
        // Apenas as Acções ficam ocultas (não há suporte ainda).
        $('.mdash-props-tab[data-tab="actions"]').hide();
        $('.mdash-props-tab[data-tab="fontes"]').show();
        panel.off('.objprops');
        tipoEntry.renderPropertiesInline(obj, panel);
        return;
    }

    // ── Generic properties editor ─────────────────────────────────────────

    // Ocultar tabs Fontes e Acções para objectos estáticos
    if (obj.processaFonte === false) {
        $('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').hide();
    } else {
        $('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').show();
    }

    // Fontes — filtradas por scope (herança: object → containeritem → container → global)
    var _objParentCI = (window.appState && window.appState.containerItems || []).find(function (i) { return i.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
    var _objParentCIStamp = obj.mdashcontaineritemstamp || '';
    var _objParentCStamp = _objParentCI ? _objParentCI.mdashcontainerstamp : '';
    var allFontes = (typeof MDashFonte !== 'undefined' && typeof MDashFonte.getAvailableFontes === 'function')
        ? MDashFonte.getAvailableFontes('object', obj.mdashcontaineritemobjectstamp, _objParentCIStamp, _objParentCStamp)
        : ((window.appState && window.appState.fontes) || GMDashFontes || []);
    if (!allFontes.length) {
        console.warn('[MDash] showObjectPropertiesEditor: nenhuma fonte disponível. GMDashFontes.length =', GMDashFontes ? GMDashFontes.length : 'N/A');
    }
    var fonteOptions = allFontes.map(function (f) {
        return '<option value="' + f.mdashfontestamp + '"' + (obj.fontestamp === f.mdashfontestamp ? ' selected' : '') + '>'
            + (f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
    }).join('');

    var html = '<div class="mdash-object-props-editor" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '">';

    // ── Secção Identidade ──
    html += '<div class="mdash-prop-section">';
    html += '  <div class="mdash-prop-section-header" data-toggle-section="obj-sec-identity">';
    html += '    <span class="mdash-prop-section-title"><i class="glyphicon glyphicon-info-sign"></i> Identidade</span>';
    html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
    html += '  </div>';
    html += '  <div class="mdash-prop-section-body" id="obj-sec-identity">';
    html += '    <div class="row">';
    html += '      <div class="col-md-12" style="margin-bottom:6px;"><div class="mdash-prop-field">';
    html += '        <label>Tipo</label>';
    html += '        <input type="text" class="form-control input-sm" value="' + (obj.tipo || '') + '" readonly style="background:var(--md-surface-2,#f5f5f5);color:var(--md-muted);" />';
    html += '      </div></div>';
    html += '      <div class="col-md-12" style="margin-bottom:6px;"><div class="mdash-prop-field">';
    html += '        <label>Slot</label>';
    html += '        <input type="text" class="form-control input-sm" value="' + (obj.slotid || '') + '" readonly style="background:var(--md-surface-2,#f5f5f5);color:var(--md-muted);" />';
    html += '      </div></div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // ── Secção Dados ──
    html += '<div class="mdash-prop-section">';
    html += '  <div class="mdash-prop-section-header" data-toggle-section="obj-sec-data">';
    html += '    <span class="mdash-prop-section-title"><i class="glyphicon glyphicon-hdd"></i> Dados</span>';
    html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
    html += '  </div>';
    html += '  <div class="mdash-prop-section-body" id="obj-sec-data">';
    html += '    <div class="row">';
    var processaBadgeColor  = obj.processaFonte !== false ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)';
    var processaBadgeText   = obj.processaFonte !== false ? 'Sim' : 'Não';
    var processaBadgeBorder = obj.processaFonte !== false ? 'rgba(16,185,129,0.4)' : 'rgba(107,114,128,0.3)';
    var processaBadgeFg     = obj.processaFonte !== false ? '#0d7a55' : '#555';
    html += '      <div class="col-md-12" style="margin-bottom:6px;"><div class="mdash-prop-field">';
    html += '        <label>Processa Fonte</label>';
    html += '        <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">';
    html += '          <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;background:' + processaBadgeColor + ';border:1px solid ' + processaBadgeBorder + ';color:' + processaBadgeFg + ';">' + processaBadgeText + '</span>';
    html += '          <span style="font-size:11px;color:var(--md-muted);">Definido pelo tipo de objecto</span>';
    html += '        </div>';
    html += '      </div></div>';
    if (obj.processaFonte !== false) {
        html += '      <div class="col-md-12 mdash-obj-fonte-row" style="margin-bottom:6px;"><div class="mdash-prop-field">';
        html += '        <label>Fonte de Dados</label>';
        html += '        <select class="form-control input-sm mdash-obj-prop" data-field="fontestamp"><option value="">-- Sem fonte --</option>' + fonteOptions + '</select>';
        if (!allFontes.length) html += '        <small style="color:#e67e22;font-size:10px;">Nenhuma fonte carregada neste dashboard</small>';
        html += '      </div></div>';
        var fonteMultiOptions = allFontes.map(function (f) {
            var isSel = Array.isArray(obj.fontesstamps) && obj.fontesstamps.indexOf(f.mdashfontestamp) !== -1;
            return '<option value="' + f.mdashfontestamp + '"' + (isSel ? ' selected' : '') + '>' + (f.descricao || f.codigo || f.mdashfontestamp) + '</option>';
        }).join('');
        html += '      <div class="col-md-12 mdash-obj-fonte-row" style="margin-bottom:6px;"><div class="mdash-prop-field">';
        html += '        <label>Fontes adicionais <span style="font-size:10px;color:var(--md-muted,#94a3b8);">Ctrl+click para múltiplas</span></label>';
        html += '        <select multiple class="form-control input-sm mdash-obj-prop-multi" data-field="fontesstamps" style="height:72px;">' + fonteMultiOptions + '</select>';
        html += '      </div></div>';
    }
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // ── Botão abrir editor ──
    var hasCustomModal = tipoEntry && typeof tipoEntry.openConfigModal === 'function';
    var btnLabel = hasCustomModal
        ? '<i class="glyphicon glyphicon-pencil"></i> Editor avançado'
        : '<i class="glyphicon glyphicon-pencil"></i> Abrir editor completo';
    html += '<div style="padding:10px 0 4px;">';
    html += '  <button type="button" class="btn btn-sm btn-default btn-block mdash-obj-open-editor">' + btnLabel + '</button>';
    html += '</div>';

    html += '</div>';
    panel.html(html);

    // Toggle de secções
    panel.find('.mdash-prop-section-header').on('click', function () {
        $(this).closest('.mdash-prop-section').toggleClass('is-collapsed');
    });

    panel.off('change.objprops');
    panel.on('change.objprops', '.mdash-obj-prop, .mdash-obj-prop-multi', function () {
        var field = $(this).data('field');
        var val;
        if ($(this).is('select[multiple]')) {
            val = $(this).val() || [];
        } else if ($(this).is(':checkbox')) {
            val = $(this).is(':checked');
        } else {
            val = $(this).val();
        }
        obj[field] = val;
        if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(obj, obj.table, obj.idfield);
        }
    });

    panel.off('click.objprops');
    panel.on('click.objprops', '.mdash-obj-open-editor', function () {
        var entry = getMdashObjectTypeEntry(obj.tipo);
        if (entry && typeof entry.openConfigModal === 'function') {
            entry.openConfigModal(obj);
        } else {
            openContainerItemObjectEditModal(obj);
        }
    });
}

// ============================================================================
// EDITOR DE PROPRIEDADES DO SLOT
// ============================================================================

/**
 * Abre modal para editar as propriedades visuais de um slot.
 * @param {string} itemStamp - stamp do MdashContainerItem
 * @param {string} slotId    - id do slot dentro do layout
 */
function showSlotPropertiesEditor(itemStamp, slotId) {
    var panel = $('#mdash-properties-panel');
    if (!panel.length) return;

    // Cancelar qualquer timer pendente do editor de gráficos para evitar que
    // um fire() tardio leia DOM vazio e limpe a config do objecto anterior
    var _pendingTimer = panel.data('_mciTimer');
    if (_pendingTimer) { clearTimeout(_pendingTimer); panel.removeData('_mciTimer'); }

    // Remover handlers delegados do editor de gráficos e de propriedades genéricas
    // para que change events nos inputs do slot editor não disparem fire() stale
    panel.off('.mcbi .objprops');

    var item = window.appState.containerItems.find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!item) { alertify.error('ContainerItem não encontrado'); return; }

    // Garante que o slot existe na slotsconfig do item
    var slot = item.getSlot(slotId);
    if (!slot) {
        slot = new MdashSlot({ id: slotId, label: slotId, type: 'html' });
        item.slotsconfig.push(slot);
    }

    // Activar tab de propriedades e expandir painel se necessário
    activatePropertiesTab('properties');
    var $propsPanel = $('.mdash-properties');
    if ($propsPanel.hasClass('is-collapsed')) {
        $propsPanel.removeClass('is-collapsed');
    }

    var props = MdashSlot.getEditableProperties();

    // Ocultar tabs Fontes e Acções — não aplicável a slots
    $('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').hide();

    // Agrupar props por secção (mesma lógica de renderPropertiesForm)
    var sections = {};
    var sectionOrder = [];
    props.forEach(function (prop) {
        var sec = prop.section || 'Geral';
        if (!sections[sec]) { sections[sec] = []; sectionOrder.push(sec); }
        sections[sec].push(prop);
    });
    var sectionIcons = { 'Layout': 'glyphicon-th-large', 'Estilo': 'glyphicon-adjust', 'Geral': 'glyphicon-cog' };

    var html = '<div class="mdash-slot-props-editor" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '">';

    sectionOrder.forEach(function (secName) {
        var secIcon = sectionIcons[secName] || 'glyphicon-option-horizontal';
        var secId = 'mdash-slot-sec-' + secName.toLowerCase().replace(/\s+/g, '-');
        html += '<div class="mdash-prop-section" data-section="' + secId + '">';
        html += '  <div class="mdash-prop-section-header" data-toggle-section="' + secId + '">';
        html += '    <span class="mdash-prop-section-title"><i class="glyphicon ' + secIcon + '"></i> ' + secName + '</span>';
        html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
        html += '  </div>';
        html += '  <div class="mdash-prop-section-body" id="' + secId + '">';
        html += '    <div class="row">';

        sections[secName].forEach(function (prop) {
            var val = slot.config[prop.field] !== undefined ? slot.config[prop.field] : (prop.defaultValue || '');
            html += '<div class="col-md-12" style="margin-bottom:6px;"><div class="mdash-prop-field">';

            if (prop.type === 'checkbox') {
                html += '<label class="mdash-prop-field-check"><input type="checkbox" class="mdash-slot-prop" data-field="' + prop.field + '"' + (val ? ' checked' : '') + ' /><span>' + prop.title + '</span></label>';
            } else if (prop.type === 'select' && prop.options) {
                html += '<label>' + prop.title + '</label>';
                html += '<select class="form-control input-sm mdash-slot-prop" data-field="' + prop.field + '">';
                prop.options.forEach(function (opt) {
                    html += '<option value="' + opt + '"' + (val === opt ? ' selected' : '') + '>' + opt + '</option>';
                });
                html += '</select>';
            } else if (prop.type === 'color') {
                html += '<label>' + prop.title + '</label>';
                html += '<div style="display:flex;gap:6px;align-items:center;">';
                html += '<input type="color" class="mdash-slot-prop" data-field="' + prop.field + '" value="' + (val || '#ffffff') + '" style="width:32px;height:28px;padding:1px;border:1px solid rgba(0,0,0,0.15);border-radius:6px;cursor:pointer;" />';
                html += '<input type="text" class="form-control input-sm mdash-slot-prop-text" data-field="' + prop.field + '" value="' + (val || '') + '" placeholder="#f5f5f5 / rgba(...)" />';
                html += '</div>';
            } else {
                html += '<label>' + prop.title + '</label>';
                html += '<input type="text" class="form-control input-sm mdash-slot-prop" data-field="' + prop.field + '" value="' + (val || '') + '" />';
            }

            html += '</div></div>';
        });

        html += '    </div></div></div>';
    });

    html += '</div>';

    panel.html(html);

    // Bind: toggle secções (mesma lógica de renderPropertiesForm)
    panel.find('.mdash-prop-section-header').on('click', function () {
        $(this).closest('.mdash-prop-section').toggleClass('is-collapsed');
    });

    // Remover handlers anteriores para evitar que alterações afectem slots/items antigos
    panel.off('change.slotprops');

    // Bind — actualizar config do slot em tempo real
    panel.on('change.slotprops', '.mdash-slot-prop, .mdash-slot-prop-text', function () {
        var field = $(this).data('field');
        var val;
        if ($(this).is(':checkbox')) {
            val = $(this).is(':checked');
        } else {
            val = $(this).val();
        }

        // Sincronizar color picker ↔ text input
        if ($(this).is('input[type="color"]')) {
            $(this).siblings('.mdash-slot-prop-text[data-field="' + field + '"]').val(val);
        } else if ($(this).hasClass('mdash-slot-prop-text')) {
            $(this).siblings('input[type="color"][data-field="' + field + '"]').val(val || '#ffffff');
        }

        slot.config[field] = val;

        // Persistir
        item.stringifySlotsConfig();
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(item, item.table, item.idfield);
        }

        // Aplicar imediatamente ao DOM (scope restrito ao body do card, excluindo thumbnails)
        var $slotEl = $(".mdash-canvas-item[data-stamp='" + itemStamp + "'] .mdash-canvas-item-body [data-mdash-slot='" + slotId + "']");
        if ($slotEl.length) {
            slot.applyToElement($slotEl);
        }
    });
}

// ============================================================================
// MÓDULO DE FONTES (unificado — todas as funções globais redirigem para o
// sistema inline: addScopedFonte / editFonteInPanel / removeScopedFonte)
// ============================================================================

/**
 * Selecciona o scope "global" no painel de propriedades, activando a tab Fontes.
 * Reutilizado por addNewFonte, editFonte e deleteFonte para garantir
 * que o painel da direita mostra o contexto correcto.
 */
function _selectGlobalFontesScope() {
    _currentSelectedComponent = { type: 'global', data: {} };
    updatePropsComponentHeader(_currentSelectedComponent);
    var $propsPanel = $('.mdash-properties');
    if ($propsPanel.hasClass('is-collapsed')) $propsPanel.removeClass('is-collapsed');
    activatePropertiesTab('fontes');
    renderFontesPanel(_currentSelectedComponent);
}

/**
 * Adiciona uma nova fonte
 */
function addNewFonte() {
    _selectGlobalFontesScope();
    addScopedFonte('global', '');
}

/**
 * Edita uma fonte
 */
function editFonte(fonteStamp) {
    _selectGlobalFontesScope();
    editFonteInPanel(fonteStamp);
}

/**
 * Elimina uma fonte global (redirige para o sistema unificado).
 */
function deleteFonte(fonteStamp) {
    _selectGlobalFontesScope();
    removeScopedFonte(fonteStamp);
}

/**
 * Retorna o label do tipo de filtro
 */
function getFilterTypeLabel(tipo) {
    var tipos = {
        'text': 'Texto',
        'radio': 'Radio',
        'logic': 'Lógico',
        'date': 'Data',
        'number': 'Número',
        'list': 'Lista',
        'multiselect': 'Múltipla escolha'
    };
    return tipos[tipo] || tipo || 'Não definido';
}

/**
 * Retorna o ícone do tipo de filtro
 */
function getFilterTypeIcon(tipo) {
    var icons = {
        'text': 'glyphicon glyphicon-font',
        'radio': 'glyphicon glyphicon-record',
        'logic': 'glyphicon glyphicon-check',
        'date': 'glyphicon glyphicon-calendar',
        'number': 'glyphicon glyphicon-plus',
        'list': 'glyphicon glyphicon-list',
        'multiselect': 'glyphicon glyphicon-th-list'
    };
    return icons[tipo] || 'glyphicon glyphicon-filter';
}

/**
 * Adiciona um novo filtro
 */
function addNewFilter() {
    var newFilter = new MdashFilter({
        dashboardstamp: GMDashStamp
    });

    // Adiciona ao estado reativo
    window.appState.filters.push(newFilter);

    // Abre modal de edição
    openFilterEditModal(newFilter);
}

/**
 * Edita um filtro existente
 */
function editFilter(filterStamp) {
    var filter = GMDashFilters.find(function (f) {
        return f.mdashfilterstamp === filterStamp;
    });

    if (!filter) {
        alertify.error('Filtro não encontrado');
        return;
    }

    openFilterEditModal(filter);
}

function openFiltersManagerModal() {
    resetModalOpenState('#mdash-filters-manager-modal');

    var filters = (window.appState && window.appState.filters ? window.appState.filters : GMDashFilters).slice();
    filters.sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });

    var listHtml = '';
    if (!filters.length) {
        listHtml = '<p class="text-muted text-center" style="margin: 10px 0 0;"><small>Nenhum filtro configurado</small></p>';
    } else {
        filters.forEach(function (filter) {
            var filterTitle = filter.descricao || filter.codigo || 'Sem nome';
            listHtml += '<div class="mdash-filter-manager-row">';
            listHtml += '  <div class="mdash-filter-manager-main">';
            listHtml += '    <div class="mdash-filter-manager-title">' + filterTitle + '</div>';
            listHtml += '    <div class="mdash-filter-manager-meta">' + (getFilterTypeLabel(filter.tipo) || '') + ' • Ordem ' + (filter.ordem || 0) + '</div>';
            listHtml += '  </div>';
            listHtml += '  <div class="mdash-filter-manager-actions">';
            listHtml += '    <button type="button" class="btn btn-xs btn-default" onclick="$(\'#mdash-filters-manager-modal\').modal(\'hide\'); editFilter(\'' + filter.mdashfilterstamp + '\');" title="Editar">';
            listHtml += '      <i class="glyphicon glyphicon-cog"></i>';
            listHtml += '    </button>';
            listHtml += '    <button type="button" class="btn btn-xs mdash-btn-delete" onclick="deleteFilter(\'' + filter.mdashfilterstamp + '\'); openFiltersManagerModal();" title="Eliminar">';
            listHtml += '      <i class="glyphicon glyphicon-trash"></i>';
            listHtml += '    </button>';
            listHtml += '  </div>';
            listHtml += '</div>';
        });
    }

    var modalHtml = '<div class="modal fade" id="mdash-filters-manager-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-filter"></i> Gestão de Filtros</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <div style="margin-bottom:10px;text-align:right;">';
    modalHtml += '          <button type="button" class="btn btn-primary btn-sm" onclick="$(\'#mdash-filters-manager-modal\').modal(\'hide\'); addNewFilter();">';
    modalHtml += '            <i class="glyphicon glyphicon-plus"></i> Novo Filtro';
    modalHtml += '          </button>';
    modalHtml += '        </div>';
    modalHtml += '        <div class="mdash-filter-manager-list">' + listHtml + '</div>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);
    $('#mdash-filters-manager-modal').modal('show');
}

/**
 * Abre modal de edição de filtro usando UIObjectFormConfig (abordagem original)
 */
function openFilterEditModal(filter) {
    // Remove modal se já existir e limpa estado órfão do Bootstrap (ex.: duplo clique)
    resetModalOpenState('#mdash-filter-edit-modal');

    // Obtém a configuração do formulário (UIObjectFormConfig)
    var formConfig = getMdashFilterUIObjectFormConfigAndSourceValues();
    var objectsUIFormConfig = formConfig.objectsUIFormConfig;

    // Gera o HTML do formulário dinamicamente
    var formHtml = '<div class="row">';

    objectsUIFormConfig.forEach(function (obj) {
        var isDiv = obj.contentType === "div";
        var isCheckbox = obj.tipo === "checkbox";
        var isSelect = obj.contentType === "select";

        // Valor atual do campo
        var currentValue = filter[obj.campo] || '';
        if (isCheckbox) {
            currentValue = filter[obj.campo] || false;
        }

        // Classes do campo
        var fieldClasses = obj.classes + " mdashconfig-item-input";

        // Custom data para v-model
        var customData = obj.customData || '';
        customData += " v-model='mdashFilterItem." + obj.campo + "'";

        if (isDiv) {
            customData += " v-on:keyup='changeDivContent(\"" + obj.campo + "\")'";
        } else {
            customData += " @change='handleChangeFilter'";
        }

        // Wrapper da coluna
        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';

        // Input normal
        if (obj.contentType === "input" && !isCheckbox) {
            formHtml += '    <input type="' + obj.tipo + '" ';
            formHtml += '           id="' + obj.campo + '" ';
            formHtml += '           class="' + fieldClasses + '" ';
            formHtml += '           ' + customData + ' />';
        }
        // Checkbox
        else if (isCheckbox) {
            formHtml += '    <div style="padding-top: 7px;">';
            formHtml += '      <input type="checkbox" ';
            formHtml += '             id="' + obj.campo + '" ';
            formHtml += '             class="' + fieldClasses + '" ';
            formHtml += '             ' + customData + ' />';
            formHtml += '    </div>';
        }
        // Select
        else if (isSelect) {
            formHtml += '    <select id="' + obj.campo + '" ';
            formHtml += '            class="' + fieldClasses + '" ';
            formHtml += '            ' + customData + '>';
            formHtml += '      <option value="">-- Selecione --</option>';

            obj.selectValues.forEach(function (selectOption) {
                var optionValue = selectOption[obj.fieldToValue];
                var optionLabel = selectOption[obj.fieldToOption];
                formHtml += '      <option value="' + optionValue + '">' + optionLabel + '</option>';
            });

            formHtml += '    </select>';
        }
        // Div (Editor de código)
        else if (isDiv) {
            formHtml += '    <div id="' + obj.campo + '" ';
            formHtml += '         class="' + fieldClasses + '" ';
            formHtml += '         style="' + (obj.style || 'width: 100%; height: 200px;') + '">';
            formHtml += currentValue;
            formHtml += '    </div>';
        }

        formHtml += '  </div>';
        formHtml += '</div>';
    });

    formHtml += '</div>';

    // Monta o modal
    var filterModalTitle = buildModalEntityTitle("Filtro", filter.descricao || filter.codigo || "");
    var modalHtml = '<div class="modal fade" id="mdash-filter-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';

    // Header
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title">';
    modalHtml += '          <i class="glyphicon glyphicon-filter"></i> ' + filterModalTitle;
    modalHtml += '        </h4>';
    modalHtml += '      </div>';

    // Body com formulário gerado
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <form id="mdash-filter-edit-form">';
    modalHtml += formHtml;
    modalHtml += '        </form>';
    modalHtml += '      </div>';

    // Footer
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" onclick="saveFilterFromModal()">Guardar</button>';
    modalHtml += '      </div>';

    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    // Inicializa PetiteVue para reatividade
    PetiteVue.createApp({
        mdashFilterItem: filter,

        handleChangeFilter: function () {
            if ((this.mdashFilterItem.escopo || 'global') === 'global') {
                this.mdashFilterItem.mdashtabstamp = '';
            } else if (!this.mdashFilterItem.mdashtabstamp && window.appState && window.appState.activeTabStamp) {
                this.mdashFilterItem.mdashtabstamp = window.appState.activeTabStamp;
            }
            // Sincronização em tempo real
            realTimeComponentSync(this.mdashFilterItem, this.mdashFilterItem.table, this.mdashFilterItem.idfield);
        },

        changeDivContent: function (campo) {
            // Atualiza o conteúdo do editor ACE
            var editor = ace.edit(campo);
            this.mdashFilterItem[campo] = editor.getValue();
            this.handleChangeFilter();
        }
    }).mount('#mdash-filter-edit-modal');

    $('#mdash-filter-edit-modal').modal('show');

    // Inicializa editores de código ACE após o modal estar visível
    $('#mdash-filter-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
    });
}

/**
 * Callback quando o tipo de filtro muda
 */
function onFilterTypeChange() {
    // Não precisa mais - a reatividade do PetiteVue cuida disso
}

/**
 * Callback quando checkbox "Tem evento change" é alterado
 */
function onEventoChangeToggle() {
    // Não precisa mais - a reatividade do PetiteVue cuida disso
}

/**
 * Guarda as alterações do filtro (chamado pelo botão Guardar)
 */
function saveFilterFromModal() {
    // Fecha modal
    $('#mdash-filter-edit-modal').modal('hide');

    // Alertify
    alertify.success('Filtro guardado com sucesso!');
}

/**
 * Elimina um filtro
 */
function deleteFilter(filterStamp) {
    var filter = GMDashFilters.find(function (f) {
        return f.mdashfilterstamp === filterStamp;
    });

    if (!filter) {
        alertify.error('Filtro não encontrado');
        return;
    }

    var filterDesc = filter.descricao || 'Filtro sem descrição';
    
    showDeleteConfirmation({
        title: 'Confirmar eliminação',
        message: 'Tem a certeza que deseja eliminar o filtro "' + filterDesc + '"?',
        recordToDelete: {
            table: "MdashFilter",
            stamp: filterStamp,
            tableKey: "mdashfilterstamp"
        },
        onConfirm: function() {
            executeDeleteFilter(filterStamp);
        }
    });
}

function executeDeleteFilter(filterStamp) {
    var filter = GMDashFilters.find(function (f) {
        return f.mdashfilterstamp === filterStamp;
    });

    if (!filter) return;

    // Remove do estado reativo
    var index = window.appState.filters.indexOf(filter);
    if (index > -1) {
        window.appState.filters.splice(index, 1);
    }

    alertify.success('Filtro eliminado com sucesso!');
}

/**
 * Carrega os estilos modernos para todo o dashboard
 */
/**
 * Devolve as cores do painel (colunas 1 e 3) para o modo indicado.
 * 'dark'  → fundo escuro, texto claro
 * 'light' → fundo branco, texto escuro
 * Hardcoded 'dark' em todos os call sites. No futuro, ler de preferência do utilizador.
 */
function getMDashPanelTheme(mode) {
    if (mode === 'dark') {
        return {
            bodyBg:           'linear-gradient(180deg,#1a2335,#1e2a3d)',
            panelHeadingBg:   'linear-gradient(180deg,#1e2a3d,#212f47)',
            panelBodyBg:      '#1a2335',
            sectionBorder:    'rgba(255,255,255,0.07)',
            sectionHoverBg:   'rgba(255,255,255,0.04)',
            sectionTitleColor:'#e2e8f0',
            chevronColor:     'rgba(255,255,255,0.3)',
            labelColor:       '#94a3b8',
            textColor:        '#e2e8f0',
            mutedColor:       'rgba(255,255,255,0.28)',
            inputBg:          '#253048',
            inputBorder:      'rgba(255,255,255,0.12)',
            inputColor:       '#e2e8f0',
            itemBg:           'rgba(255,255,255,0.05)',
            itemBorder:       'rgba(255,255,255,0.08)',
        };
    }
    return {
        bodyBg:           'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.97))',
        panelHeadingBg:   'linear-gradient(180deg,#ffffff,#f8fafc)',
        panelBodyBg:      '#ffffff',
        sectionBorder:    'rgba(0,0,0,0.06)',
        sectionHoverBg:   'rgba(0,0,0,0.03)',
        sectionTitleColor:'#1e293b',
        chevronColor:     'rgba(0,0,0,0.28)',
        labelColor:       '#475569',
        textColor:        '#1e293b',
        mutedColor:       'rgba(0,0,0,0.38)',
        inputBg:          '#fff',
        inputBorder:      'rgba(0,0,0,0.12)',
        inputColor:       '#1e293b',
        itemBg:           '#fff',
        itemBorder:       'var(--md-border)',
    };
}

function loadModernDashboardStyles() {
    var styles = "";
    var t = getMDashPanelTheme('light');
    var primaryColor = getColorByType("primary").background;
    var primaryRgb = hexToRgb(primaryColor);
    //var primaryRgb = hexToRgb(primaryColor);
    var styleVersion = "2026.04.01-refactor";

    // Evita estilos duplicados quando a UI é reinicializada
    $('#mdash-modern-styles').remove();
    // Remove estilos antigos/duplicados injetados sem id por outras cópias do módulo
    $('style').filter(function () {
        if (this.id === 'mdash-modern-styles') return false;
        var cssText = this.textContent || '';
        return cssText.indexOf('.mdash-modern-layout') !== -1 || cssText.indexOf('.mdash-editor-wrapper') !== -1;
    }).remove();

    // ===== TOKENS =====
    styles += ".mdash-editor-wrapper { --md-primary: " + primaryColor + "; --md-primary-rgb: " + primaryRgb + "; --md-surface: #ffffff; --md-bg: #f3f6fb; --md-text: #1f2937; --md-muted: #64748b; --md-border: rgba(15,23,42,0.08); display: flex; flex-direction: column; height: calc(100vh - 60px); background: radial-gradient(circle at 10% -10%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 34%), radial-gradient(circle at 110% 120%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 32%), var(--md-bg); }";

    // ===== TOP TOOLBAR =====
    styles += ".mdash-top-toolbar { height: 54px; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.96), #101828 88%); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.18); flex-shrink: 0; box-shadow: 0 8px 24px rgba(2,6,23,0.18); }";
    styles += ".mdash-top-toolbar-brand { color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.2px; }";
    styles += ".mdash-top-toolbar-brand i { color: #fff; opacity: 0.95; }";
    styles += ".mdash-top-toolbar-actions { display: flex; align-items: center; gap: 8px; }";

    // ===== MAIN LAYOUT =====
    styles += ".mdash-modern-layout { display: flex; flex: 1; overflow: hidden; gap: 8px; padding: 8px; }";

    // ===== SIDEBAR =====
    styles += ".mdash-sidebar { width: 248px; min-width: 248px; background: linear-gradient(180deg, rgba(var(--md-primary-rgb),0.96), rgba(var(--md-primary-rgb),0.84)); border: 1px solid rgba(255,255,255,0.16); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 32px rgba(2,6,23,0.18); backdrop-filter: blur(8px); transition: width 0.22s ease, min-width 0.22s ease; }";
    styles += ".mdash-sidebar-header { position: relative; min-height: 50px; padding: 12px 38px 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.18); background: transparent; color: #fff; display: flex; align-items: center; }";
    styles += ".mdash-sidebar-header h4 { margin: 0; font-size: 22px; font-weight: 800; display:flex; align-items:center; gap:8px; line-height: 1; opacity:0.98; }";
    styles += ".mdash-sidebar-header h4 i { width: 20px; text-align: center; line-height: 1; }";
    styles += ".mdash-panel-toggle { width: 22px; height: 22px; padding: 0; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transform: translateY(-50%); }";
    styles += ".mdash-panel-toggle i { font-size: 10px; line-height: 1; }";
    styles += ".mdash-sidebar-toggle { position: absolute; top: 50%; right: 8px; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.16); color: #fff; }";
    styles += ".mdash-sidebar-toggle:hover { background: rgba(255,255,255,0.26); color: #fff; border-color: rgba(255,255,255,0.7); }";
    styles += ".mdash-sidebar-header i, .mdash-sidebar-rail-actions .btn i, .mdash-properties-header i, .mdash-properties-rail-actions .btn i { animation: none !important; transition: none !important; transform: none !important; }";
    styles += ".mdash-sidebar-body { flex: 1; overflow-y: auto; padding: 10px; background: " + t.bodyBg + "; }";
    styles += ".mdash-sidebar-rail-actions { display: none; padding: 8px 6px; gap: 8px; flex-direction: column; align-items: center; border-top: 1px solid rgba(255,255,255,0.2); }";
    styles += ".mdash-sidebar-rail-actions .btn { width: 36px; min-width: 36px; height: 36px; padding: 0; border-radius: 10px; border-color: rgba(255,255,255,0.42); color: var(--md-primary); background: rgba(255,255,255,0.96); display: inline-flex; align-items: center; justify-content: center; line-height: 1; }";
    styles += ".mdash-sidebar-rail-actions .btn i { color: var(--md-primary); font-size: 14px; line-height: 1; }";
    styles += ".mdash-sidebar-rail-actions .btn:hover { background: #fff; border-color: rgba(var(--md-primary-rgb),0.58); color: var(--md-primary); box-shadow: 0 4px 10px rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-sidebar-rail-actions .btn:focus { outline: none; box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-sidebar.is-collapsed { width: 56px; min-width: 56px; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-body { display: none; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-rail-actions { display: flex; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header { min-height: 40px; padding: 8px 24px 8px 8px; display:flex; justify-content:center; align-items:center; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header h4 { margin: 0; width: 20px; height: 20px; padding: 0; border: none; background: transparent; border-radius: 0; display: flex; justify-content: center; align-items: center; gap: 0; font-size: 0; line-height: 0; color: transparent; overflow: hidden; box-shadow: none; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-header h4 i { display: flex; flex: 0 0 20px; width: 20px; height: 20px; align-items: center; justify-content: center; text-align: center; font-size: 20px; margin: 0; color: #fff; line-height: 1; opacity: 0.98; position: static; left: auto; }";
    styles += ".mdash-sidebar.is-collapsed .mdash-sidebar-toggle { top: 50%; right: 4px; width: 18px; height: 18px; border-radius: 5px; }";

    // ===== WIDGET PALETTE =====
    styles += ".mdash-widget-section { padding: 2px 0 8px; }";
    styles += ".mdash-section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--md-primary); margin: 0 0 10px 2px; }";
    styles += ".mdash-widget-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }";
    styles += ".mdash-widget-tile { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 76px; padding: 12px 8px; background: " + t.itemBg + "; border: 1px solid rgba(var(--md-primary-rgb),0.28); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; font-size: 12px; font-weight: 700; color: var(--md-primary); text-align: center; user-select: none; margin: 0; box-sizing: border-box; box-shadow: 0 4px 14px rgba(2,6,23,0.06); }";
    styles += ".mdash-widget-grid .mdash-widget-tile.mdash-toolbox-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 76px; padding: 12px 8px; border-radius: 12px; margin: 0; }";
    styles += ".mdash-widget-tile i { font-size: 22px; color: var(--md-primary); }";
    styles += ".mdash-widget-tile:hover { transform: translateY(-2px); border-color: var(--md-primary); box-shadow: 0 8px 20px rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-widget-tile:active { transform: translateY(0); }";
    styles += ".mdash-sidebar-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(var(--md-primary-rgb),0.35), transparent); margin: 8px 0 12px; }";

    // ===== ACCORDION / LISTS =====
    styles += "#mdash-accordion .panel { margin-bottom: 10px; border-radius: 10px; border: 1px solid var(--md-border); box-shadow: 0 6px 16px rgba(2,6,23,0.06); overflow: hidden; }";
    styles += "#mdash-accordion .panel-heading { background: " + t.panelHeadingBg + "; border-bottom: 1px solid " + t.sectionBorder + "; cursor: pointer; padding: 12px 14px; transition: all 0.2s; }";
    styles += "#mdash-accordion .panel-title { font-size: 14px; font-weight: 700; color: " + t.textColor + "; margin: 0; display: flex; align-items: center; justify-content: space-between; }";
    styles += "#mdash-accordion .panel-title i { margin-right: 8px; color: var(--md-primary); }";
    styles += "#mdash-accordion .panel-title .badge { background: var(--md-primary); font-size: 11px; }";
    styles += "#mdash-accordion .panel-body { padding: 10px; background: " + t.panelBodyBg + "; }";
    styles += ".mdash-sidebar-list { margin-top: 10px; }";
    styles += ".mdash-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 6px; background: " + t.itemBg + "; border: 1px solid " + t.itemBorder + "; border-radius: 8px; cursor: pointer; transition: all 0.2s; }";
    styles += ".mdash-sidebar-item:hover { border-color: rgba(var(--md-primary-rgb),0.45); transform: translateX(2px); }";
    styles += ".mdash-sidebar-item-content { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 13px; color: " + t.textColor + "; }";
    styles += ".mdash-sidebar-item-content i { color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-sidebar-item-content .badge { margin-left: auto; background: var(--md-primary); font-size: 10px; }";

    // ── Botão de eliminar unificado (substitui btn-danger para evitar interferência do PHC) ──
    styles += ".mdash-btn-delete { background: #d43f3a !important; border: 1px solid #d43f3a !important; color: #fff !important; border-radius: 5px; transition: background 0.15s, border-color 0.15s; opacity: 1 !important; visibility: visible !important; display: inline-flex !important; align-items: center; justify-content: center; }";
    styles += ".mdash-btn-delete:hover, .mdash-btn-delete:focus { background: #b52f2b !important; border-color: #b52f2b !important; color: #fff !important; opacity: 1 !important; }";
    styles += ".mdash-btn-delete:active { background: #962522 !important; border-color: #962522 !important; color: #fff !important; }";
    styles += ".mdash-btn-delete i { color: #fff !important; }";
    styles += ".mdash-sidebar-item-actions { display: flex !important; gap: 4px; opacity: 1 !important; visibility: visible !important; }";

    styles += ".mdash-filter-manager-list { max-height: 420px; overflow-y: auto; }";
    styles += ".mdash-filter-manager-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid var(--md-border); border-radius: 10px; background: #fff; margin-bottom: 8px; }";
    styles += ".mdash-filter-manager-row:last-child { margin-bottom: 0; }";
    styles += ".mdash-filter-manager-main { min-width: 0; }";
    styles += ".mdash-filter-manager-title { font-weight: 700; color: var(--md-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }";
    styles += ".mdash-filter-manager-meta { font-size: 11px; color: var(--md-muted); margin-top: 2px; }";
    styles += ".mdash-filter-manager-actions { display: flex; gap: 4px; flex-shrink: 0; }";


    // ===== CANVAS =====
    styles += ".mdash-canvas { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; border: 1px solid var(--md-border); background: var(--md-surface); box-shadow: 0 12px 28px rgba(2,6,23,0.08); }";
    styles += ".mdash-canvas-body { flex: 1; overflow-y: auto; padding: 14px; background-image: radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px); background-size: 18px 18px; background-position: -8px -8px; }";
    styles += ".mdash-canvas-commandbar { display:flex; align-items:center; justify-content:space-between; gap:10px; padding: 10px 12px; margin-bottom: 12px; border:1px solid var(--md-border); border-radius: 12px; background: linear-gradient(180deg, #ffffff, #f8fafc); box-shadow: 0 6px 14px rgba(2,6,23,0.06); }";
    styles += ".mdash-commandbar-title { font-size: 14px; font-weight: 800; color: var(--md-text); display:flex; align-items:center; gap:8px; }";
    styles += ".mdash-commandbar-title i { color: var(--md-primary); }";
    styles += ".mdash-commandbar-actions { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }";

    // Canvas vazio
    styles += ".mdash-canvas-empty { text-align: center; padding: 80px 20px; color: var(--md-muted); border: 2px dashed rgba(var(--md-primary-rgb),0.28); border-radius: 12px; background: rgba(255,255,255,0.8); }";
    styles += ".mdash-canvas-empty i { font-size: 64px; color: var(--md-primary); margin-bottom: 20px; display: block; opacity: 0.45; }";
    styles += ".mdash-canvas-empty p { font-size: 16px; margin: 0; }";
    styles += ".mdash-drop-target { border: 2px dashed transparent; transition: border-color 0.2s, background 0.2s; }";
    styles += ".mdash-drop-hover { border-color: var(--md-primary) !important; background: rgba(var(--md-primary-rgb),0.07); }";
    styles += ".mdash-sort-placeholder { border: 2px dashed var(--md-primary); background: rgba(var(--md-primary-rgb),0.06); min-height: 60px; margin-bottom: 12px; border-radius:10px; }";

    // Container no canvas
    styles += ".mdash-canvas-container { position: relative; background: #ffffff; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 12px; padding: 12px; margin: 8px 0 14px; min-height: 0; transition: border-color 0.18s ease, box-shadow 0.18s ease; box-shadow: 0 6px 16px rgba(2,6,23,0.05); }";
    styles += ".mdash-canvas-container:hover { border-color: var(--md-primary); box-shadow: 0 10px 20px rgba(var(--md-primary-rgb),0.14); }";
    styles += ".mdash-canvas-container.is-selected { border-color: var(--md-primary); box-shadow: 0 0 0 3px rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-container-label { position: absolute; top: 8px; left: 12px; background: #fff; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); border-radius: 20px; border: 1px solid rgba(var(--md-primary-rgb),0.42); z-index: 1; }";
    styles += ".mdash-canvas-container-header { padding: 22px 0 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 6px; }";
    styles += ".mdash-container-drag-handle { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 6px; color: var(--md-primary); cursor: move; flex-shrink: 0; background: #fff; }";
    styles += ".mdash-container-drag-handle:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: var(--md-primary); }";
    styles += ".ui-sortable-helper.mdash-canvas-container { box-shadow: 0 16px 30px rgba(2,6,23,0.18); }";
    styles += ".mdash-canvas-container.is-dragging { transition: none !important; }";
    styles += ".mdash-canvas-container .mdash-container-drag-handle:active { cursor: grabbing; }";
    styles += ".mdash-canvas-container-body { padding: 4px 0 0 0; min-height: 0; }";

    // Item no canvas
    styles += ".mdash-container-items-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 14px; position: relative; }";
    styles += ".mdash-container-items-row.is-empty { min-height: 92px; align-content: start; }";
    styles += ".mdash-container-items-row.is-drop-over { outline: 2px dashed rgba(var(--md-primary-rgb),0.62); outline-offset: 3px; border-radius: 10px; background: rgba(var(--md-primary-rgb),0.04); }";
    styles += ".mdash-canvas-item { margin-bottom: 0; min-width: 0; }";
    styles += ".mdash-item-sort-placeholder { min-height: 96px; border: 2px dashed var(--md-primary); border-radius: 10px; background: rgba(var(--md-primary-rgb),0.10); box-sizing: border-box; }";
    styles += ".mdash-item-sort-placeholder.is-manual-preview { position: relative; border-color: rgba(var(--md-primary-rgb),0.95); background: rgba(var(--md-primary-rgb),0.14); z-index: 2; }";
    styles += ".mdash-item-sort-placeholder.is-manual-preview::after { content: attr(data-grid-label); position: absolute; top: 6px; right: 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); background: rgba(255,255,255,0.92); border: 1px solid rgba(var(--md-primary-rgb),0.36); border-radius: 999px; padding: 2px 8px; }";
    
    // ⭐ DRAG & DROP VISUAL FEEDBACK (posicionado na grid-row específica)
    styles += ".mdash-drop-error-overlay, .mdash-drop-success-overlay, .mdash-drop-swap-overlay { position: relative; display: grid; min-height: 100px; z-index: 5; }";
    
    // Background que cobre toda a grid-row
    styles += ".mdash-drop-overlay-bg { grid-column: 1 / -1; grid-row: 1; min-height: 100px; border-radius: 10px; }";
    styles += ".mdash-drop-error-bg { background-color: rgba(255, 0, 0, 0.06); border: 3px dashed #d9534f; }";
    styles += ".mdash-drop-success-bg { background-color: rgba(0, 255, 0, 0.03); border: 3px dashed #5cb85c; }";
    styles += ".mdash-drop-swap-bg { background-color: rgba(0, 123, 255, 0.03); border: 3px dashed #0275d8; }";
    
    // Conteúdo centralizado (overlay com mensagem)
    styles += ".mdash-drop-overlay-content { grid-column: 1 / -1; grid-row: 1; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 18px; z-index: 6; pointer-events: none; }";
    styles += ".mdash-drop-overlay-content { background: transparent; }";
    
    // Badge com mensagem
    styles += ".mdash-drop-error-overlay .mdash-drop-overlay-content { background: linear-gradient(135deg, #d9534f 0%, #c9302c 100%); color: white; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.3); font-weight: 700; font-size: 13px; white-space: nowrap; width: fit-content; margin: auto; }";
    styles += ".mdash-drop-success-overlay .mdash-drop-overlay-content { background: linear-gradient(135deg, #5cb85c 0%, #449d44 100%); color: white; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.3); font-weight: 700; font-size: 13px; white-space: nowrap; width: fit-content; margin: auto; }";
    styles += ".mdash-drop-swap-overlay .mdash-drop-overlay-content { background: linear-gradient(135deg, #0275d8 0%, #025aa5 100%); color: white; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; box-shadow: 0 6px 16px rgba(0,0,0,0.3); font-weight: 700; font-size: 13px; white-space: nowrap; width: fit-content; margin: auto; }";
    
    // Ícones com animações
    styles += ".mdash-drop-error-overlay i { font-size: 24px; animation: shake 0.5s ease-in-out infinite; }";
    styles += "@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }";
    
    styles += ".mdash-drop-success-overlay i { font-size: 20px; }";
    
    styles += ".mdash-drop-swap-overlay i { font-size: 20px; animation: rotate 1s ease-in-out infinite; }";
    styles += "@keyframes rotate { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } }";
    
    // Placeholder em estado de erro
    styles += ".mdash-item-sort-placeholder.mdash-placeholder-error { border-color: #d9534f !important; background: rgba(217, 83, 79, 0.15) !important; }";
    styles += ".mdash-item-sort-placeholder.mdash-placeholder-error::after { background: #d9534f !important; color: white !important; border-color: rgba(255,255,255,0.6) !important; font-weight: 700 !important; }";
    
    // Placeholder em estado de sucesso (válido)
    styles += ".mdash-item-sort-placeholder.mdash-placeholder-success { border-color: #5cb85c !important; background: rgba(92, 184, 92, 0.15) !important; }";
    styles += ".mdash-item-sort-placeholder.mdash-placeholder-success::after { background: #5cb85c !important; color: white !important; border-color: rgba(255,255,255,0.6) !important; font-weight: 700 !important; }";
    
    styles += ".mdash-item-drag-helper { opacity: 0.96; transform: none; box-shadow: 0 18px 32px rgba(2,6,23,0.30); border-radius: 10px; }";
    styles += ".ui-sortable-helper.mdash-canvas-item { z-index: 10050 !important; }";
    styles += ".mdash-canvas-item-card { position: relative; background: #fff; border: 1px solid var(--md-border); border-radius: 10px; padding: 10px 12px; min-height: 96px; box-shadow: 0 2px 8px rgba(2,6,23,0.06); }";
    styles += ".mdash-canvas-item-card { height: 100%; }";
    styles += ".mdash-item-resize-handle { position: absolute; top: 8px; width: 12px; height: calc(100% - 16px); border-radius: 8px; cursor: ew-resize; background: transparent; z-index: 8; touch-action: none; }";
    styles += ".mdash-item-resize-handle-left { left: -1px; }";
    styles += ".mdash-item-resize-handle-right { right: -1px; }";
    styles += ".mdash-item-resize-handle::before { content: ''; position: absolute; top: 50%; left: 50%; width: 3px; height: 26px; transform: translate(-50%, -50%); border-radius: 2px; background: rgba(var(--md-primary-rgb),0.42); transition: background 0.16s ease, height 0.16s ease, width 0.16s ease; }";
    styles += ".mdash-canvas-item:hover .mdash-item-resize-handle::before, .mdash-canvas-item.is-resizing .mdash-item-resize-handle::before { background: var(--md-primary); height: 32px; }";
    styles += "body.mdash-resize-active { cursor: ew-resize !important; user-select: none; }";
    styles += ".mdash-canvas-item-header { display: flex; flex-direction: column; align-items: stretch; gap: 8px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-item-header-top { width: 100%; }";
    styles += ".mdash-item-header-bottom { display: flex; align-items: center; gap: 10px; }";
    styles += ".mdash-item-header-actions { display: flex; gap: 3px; flex-shrink: 0; margin-left: auto; }";
    styles += ".mdash-canvas-item-body { min-height: 60px; }";
    styles += ".is-selected { outline: 2px solid rgba(var(--md-primary-rgb),0.3); outline-offset: 0; }";

    // Empty items
    styles += ".mdash-canvas-empty-items { grid-column: 1 / -1; text-align: center; padding: 30px 10px; color: var(--md-muted); border: 1px dashed rgba(var(--md-primary-rgb),0.28); border-radius: 8px; background: rgba(255,255,255,0.82); }";

    // Inline editing
    styles += ".mdash-inline-title { border: none; background: transparent; font-size: 15px; font-weight: 700; color: var(--md-text); width: 100%; padding: 2px 4px; outline: none; border-radius: 4px; cursor: text; transition: background 0.15s, border-bottom 0.15s; border-bottom: 2px solid transparent; min-width: 0; }";
    styles += ".mdash-inline-title:hover { background: rgba(var(--md-primary-rgb),0.06); border-bottom-color: rgba(var(--md-primary-rgb),0.42); }";
    styles += ".mdash-inline-title:focus { background: rgba(var(--md-primary-rgb),0.09); border-bottom-color: var(--md-primary); }";
    styles += ".mdash-inline-title::placeholder { color: var(--md-muted); font-weight: 500; }";
    styles += ".mdash-inline-title-sm { font-size: 13px !important; font-weight: 600 !important; flex: 1; min-width: 0; cursor: text !important; }";
    
    // Wrapper do título com badge de tamanho
    styles += ".mdash-item-title-wrapper { display: flex; align-items: center; gap: 8px; width: 100%; }";
    styles += ".mdash-item-size-badge { flex-shrink: 0; background: linear-gradient(135deg, rgba(var(--md-primary-rgb), 0.12) 0%, rgba(var(--md-primary-rgb), 0.08) 100%); border: 1px solid rgba(var(--md-primary-rgb), 0.24); color: var(--md-primary); font-size: 9px; font-weight: 700; padding: 3px 6px; border-radius: 5px; letter-spacing: 0.5px; text-transform: uppercase; cursor: default; transition: all 0.2s ease; white-space: nowrap; line-height: 1; user-select: none; }";
    styles += ".mdash-item-size-badge:hover { background: linear-gradient(135deg, rgba(var(--md-primary-rgb), 0.18) 0%, rgba(var(--md-primary-rgb), 0.12) 100%); border-color: rgba(var(--md-primary-rgb), 0.36); }";
    
    styles += ".mdash-inline-layout-picker { position: relative; flex: 1; min-width: 0; }";
    styles += ".mdash-inline-layout-trigger { width: 100%; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(var(--md-primary-rgb),0.35); border-radius: 8px; background: #fff; color: var(--md-text); font-size: 12px; height: 40px; padding: 4px 10px; box-shadow: none; text-align: left; }";
    styles += ".mdash-inline-layout-trigger:hover { border-color: var(--md-primary); }";
    styles += ".mdash-inline-layout-trigger:focus { outline: none; border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); }";
    styles += ".mdash-inline-layout-trigger i { margin-left: auto; color: var(--md-muted); }";
    styles += ".mdash-inline-layout-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }";
    styles += ".mdash-inline-layout-thumb { width: 64px; height: 36px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(var(--md-primary-rgb),0.26); background: #f8fafc; flex-shrink: 0; display: block; contain: strict; isolation: isolate; }";
    styles += ".mdash-template-thumb-render { all: initial; display: block; font-family: 'Inter',system-ui,sans-serif; width: 240px; transform: scale(0.25); transform-origin: top left; pointer-events: none; }";
    styles += ".mdash-template-thumb-empty { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; font-weight:700; color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-inline-layout-menu { position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 60; max-height: 260px; overflow-y: auto; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.24); border-radius: 10px; box-shadow: 0 14px 26px rgba(2,6,23,0.16); padding: 6px; }";
    styles += ".mdash-inline-layout-option { width: 100%; display: flex; align-items: center; gap: 10px; border: 1px solid transparent; background: #fff; border-radius: 8px; padding: 7px; color: var(--md-text); text-align: left; margin-bottom: 4px; }";
    styles += ".mdash-inline-layout-option:last-child { margin-bottom: 0; }";
    styles += ".mdash-inline-layout-option:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: rgba(var(--md-primary-rgb),0.24); }";

    // ===== SLOT PLACEHOLDERS (canvas item body) =====
    styles += ".mdash-slot-placeholders { display: flex; flex-direction: column; gap: 6px; }";
    styles += ".mdash-slot-placeholder { border: 1px dashed rgba(var(--md-primary-rgb),0.28); border-radius: 8px; background: rgba(var(--md-primary-rgb),0.02); transition: all 0.2s; }";
    styles += ".mdash-slot-placeholder.is-main { border-color: rgba(var(--md-primary-rgb),0.40); background: rgba(var(--md-primary-rgb),0.04); }";
    styles += ".mdash-slot-ph-header { display: flex; align-items: center; gap: 5px; padding: 5px 8px; border-bottom: 1px solid rgba(var(--md-primary-rgb),0.08); }";
    styles += ".mdash-slot-ph-header i { font-size: 10px; color: var(--md-primary); opacity: 0.7; }";
    styles += ".mdash-slot-ph-label { font-size: 10px; font-weight: 700; color: var(--md-text); text-transform: uppercase; letter-spacing: 0.4px; }";
    styles += ".mdash-slot-ph-type { font-size: 9px; color: var(--md-muted); margin-left: auto; font-style: italic; }";
    styles += ".mdash-slot-ph-drop { min-height: 40px; padding: 6px 8px; display: flex; align-items: center; justify-content: center; transition: background 0.2s; border-radius: 0 0 7px 7px; }";
    styles += ".mdash-slot-ph-drop.drag-over { background: rgba(var(--md-primary-rgb),0.10); border-color: var(--md-primary); }";
    styles += ".mdash-slot-ph-empty { display: flex; align-items: center; gap: 6px; color: var(--md-muted); font-size: 11px; padding: 4px 0; }";
    styles += ".mdash-slot-ph-empty i { font-size: 14px; opacity: 0.5; }";
    styles += ".mdash-slot-ph-object { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.28); border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: var(--md-text); width: 100%; }";
    styles += ".mdash-slot-ph-object:hover { border-color: var(--md-primary); box-shadow: 0 2px 8px rgba(var(--md-primary-rgb),0.12); }";
    styles += ".mdash-slot-ph-object i { color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-slot-ph-remove { margin-left: auto; border: none; background: none; color: var(--md-muted); cursor: pointer; padding: 2px 4px; font-size: 10px; opacity: 0; transition: opacity 0.2s, color 0.2s; }";
    styles += ".mdash-slot-ph-object:hover .mdash-slot-ph-remove { opacity: 1; }";
    styles += ".mdash-slot-ph-remove:hover { color: #d9534f; }";
    styles += ".mdash-slot-ph-objects-list { display: flex; flex-direction: column; gap: 4px; width: 100%; }";

    // ===== SLOT ZONES (mini drop overlays inside rendered cards) =====
    styles += ".mdash-slot-zone-drop { min-height: 24px; padding: 3px 8px; display: flex; flex-direction: column; align-items: stretch; justify-content: center; border: 1px dashed rgba(var(--md-primary-rgb),0.35); border-radius: 5px; background: rgba(var(--md-primary-rgb),0.03); transition: background 0.15s, border-color 0.15s; position: relative; }";
    styles += ".mdash-slot-zone-drop.has-object { min-height: 0; padding: 0; border-style: solid; border-color: rgba(var(--md-primary-rgb),0.20); }";
    styles += ".mdash-slot-zone-drop.drag-over { background: rgba(var(--md-primary-rgb),0.10); border-color: var(--md-primary); border-style: solid; }";
    styles += ".mdash-slot-zone-drop.is-selected { border-color: var(--md-primary); border-style: solid; box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.18); }";
    // Hint for empty slots
    styles += ".mdash-slot-zone-hint { display: flex; align-items: center; justify-content: center; gap: 4px; color: var(--md-muted); font-size: 10px; }";
    styles += ".mdash-slot-zone-hint i { font-size: 10px; opacity: 0.5; }";
    // Toolbar: absolute overlay — anchored left, grows to fit content (never clipped)
    styles += ".mdash-slot-zone-toolbar { position: absolute; top: 0; left: 0; width: max-content; min-width: 100%; z-index: 10; display: flex; align-items: center; gap: 3px; padding: 2px 4px; background: rgba(0,0,0,0.60); border-radius: 4px 4px 0 0; font-size: 11px; color: #fff; opacity: 0; pointer-events: none; transition: opacity 0.15s; box-sizing: border-box; }";
    styles += ".mdash-slot-zone-drop:hover .mdash-slot-zone-toolbar { opacity: 1; pointer-events: auto; }";
    styles += ".mdash-slot-zone-toolbar i { color: #fff !important; font-size: 11px; }";
    // Slot button (left): blue pill
    styles += ".mdash-slot-zone-toolbar-left { display:inline-flex; align-items:center; gap:3px; background:rgba(var(--md-primary-rgb),0.85); color:#fff !important; border:none; border-radius:3px; padding:2px 8px; font-size:10px; font-weight:600; cursor:pointer; transition:background 0.15s, box-shadow 0.15s; line-height:1.4; flex-shrink:0; }";
    styles += ".mdash-slot-zone-toolbar-left:hover { background:var(--md-primary); box-shadow:0 0 0 2px rgba(var(--md-primary-rgb),0.45); }";
    // Object properties button (centre): grey pill
    styles += ".mdash-slot-zone-obj-props { display:inline-flex; align-items:center; gap:3px; background:rgba(255,255,255,0.18); color:#fff !important; border:none; border-radius:3px; padding:2px 8px; font-size:10px; font-weight:600; cursor:pointer; transition:background 0.15s, box-shadow 0.15s; line-height:1.4; flex-shrink:0; }";
    styles += ".mdash-slot-zone-obj-props:hover { background:rgba(255,255,255,0.32); box-shadow:0 0 0 2px rgba(255,255,255,0.35); }";
    // Remove button (right): red pill
    styles += ".mdash-slot-zone-toolbar-right { display:inline-flex; align-items:center; gap:3px; background:rgba(217,83,79,0.85); color:#fff !important; border:none; border-radius:3px; padding:2px 8px; font-size:10px; font-weight:600; cursor:pointer; transition:background 0.15s, box-shadow 0.15s; line-height:1.4; margin-left:auto; flex-shrink:0; }";
    styles += ".mdash-slot-zone-toolbar-right:hover { background:#d9534f; box-shadow:0 0 0 2px rgba(217,83,79,0.45); }";
    // Cross-element hover highlights
    styles += ".mdash-slot-zone-drop.slot-action-hover { border-color:var(--md-primary) !important; border-style:solid !important; box-shadow:0 0 0 3px rgba(var(--md-primary-rgb),0.22) !important; }";
    styles += ".mdash-slot-zone-obj-block.object-remove-hover { background:rgba(217,83,79,0.07); }";
    styles += ".mdash-slot-zone-obj-block.object-remove-hover .mdash-slot-zone-render { opacity:0.45; }";
    styles += ".mdash-slot-zone-obj-block.object-props-hover .mdash-slot-zone-render { outline:2px solid rgba(var(--md-primary-rgb),0.55); outline-offset:-1px; }";
    // Each object block inside an occupied slot — sem overflow:hidden para não cortar a toolbar
    styles += ".mdash-slot-zone-obj-block { position: relative; transition: background 0.15s; }";
    // A toolbar usa box-sizing border-box; o span encolhe, os botões não
    styles += ".mdash-slot-zone-toolbar { box-sizing: border-box; }";
    // Render area — content rendered directly here, no min-height so slot fits content
    styles += ".mdash-slot-zone-render { width: 100%; cursor: pointer; overflow: hidden; }";
    styles += ".mdash-slot-zone-render.is-selected { outline: 2px solid var(--md-primary); outline-offset: -1px; }";
    styles += ".mdash-slot-zone-render-placeholder { padding: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--md-muted); font-size: 11px; font-style: italic; }";
    styles += ".mdash-slot-zone-render-placeholder i { color: var(--md-muted); font-size: 12px; }";

    // ===== OBJECTS PANEL (sidebar) =====
    styles += ".mdash-objects-panel { padding: 8px !important; }";
    styles += ".mdash-objects-search-wrapper { position: relative; margin-bottom: 10px; }";
    styles += ".mdash-objects-search-wrapper > i { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--md-muted); pointer-events: none; }";
    styles += ".mdash-objects-search { width: 100%; padding: 7px 10px 7px 30px; border: 1px solid " + t.inputBorder + "; border-radius: 8px; font-size: 12px; color: " + t.inputColor + "; background: " + t.inputBg + "; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }";
    styles += ".mdash-objects-search:focus { border-color: var(--md-primary); box-shadow: 0 0 0 3px rgba(var(--md-primary-rgb),0.12); }";
    styles += ".mdash-objects-search::placeholder { color: var(--md-muted); }";
    styles += ".mdash-obj-category { margin-bottom: 10px; }";
    styles += ".mdash-obj-category:last-child { margin-bottom: 0; }";
    styles += ".mdash-obj-category-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--md-muted); margin: 0 0 6px 2px; }";
    styles += ".mdash-obj-tiles { display: flex; flex-direction: column; gap: 4px; }";
    styles += ".mdash-obj-tile { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: " + t.itemBg + "; border: 1px solid " + t.itemBorder + "; border-radius: 8px; cursor: grab; transition: all 0.2s; user-select: none; }";
    styles += ".mdash-obj-tile:hover { border-color: rgba(var(--md-primary-rgb),0.45); transform: translateX(2px); box-shadow: 0 4px 12px rgba(var(--md-primary-rgb),0.10); }";
    styles += ".mdash-obj-tile:active { cursor: grabbing; transform: scale(0.98); }";
    styles += ".mdash-obj-tile-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }";
    styles += ".mdash-obj-tile-icon i { font-size: 14px; color: var(--md-primary); }";
    styles += ".mdash-obj-tile-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }";
    styles += ".mdash-obj-tile-name { font-size: 12px; font-weight: 700; color: " + t.textColor + "; line-height: 1.2; }";
    styles += ".mdash-obj-tile-desc { font-size: 10px; color: var(--md-muted); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }";

    // Objects badges (legacy, kept for compatibility)
    styles += ".mdash-canvas-objects-list { display: flex; flex-wrap: wrap; gap: 8px; }";
    styles += ".mdash-canvas-object-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.28); border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; color: var(--md-text); }";
    styles += ".mdash-canvas-object-badge:hover { border-color: var(--md-primary); transform: translateY(-1px); box-shadow: 0 6px 12px rgba(var(--md-primary-rgb),0.14); }";
    styles += ".mdash-canvas-object-badge i { color: var(--md-primary); }";
    styles += ".preview-card { background: #fff; border: 1px solid rgba(var(--md-primary-rgb),0.2); border-radius: 8px; padding: 10px; }";
    styles += ".preview-card.kpi { display: grid; gap: 6px; }";
    styles += ".preview-card.kpi .kpi-label { font-size: 12px; color: var(--md-muted); text-transform: uppercase; letter-spacing: 0.5px; }";
    styles += ".preview-card.kpi .kpi-value { font-size: 24px; font-weight: 700; color: var(--md-text); }";
    styles += ".preview-card.kpi .kpi-trend { font-size: 12px; font-weight: 600; color: var(--md-primary); }";
    styles += ".preview-card.chart { min-height: 120px; display: flex; align-items: center; justify-content: center; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.09), rgba(255,255,255,0.9)); color: var(--md-primary); font-weight: 700; border: 1px dashed rgba(var(--md-primary-rgb),0.4); }";
    styles += "@media (max-width: 767px) { .mdash-container-items-row { grid-template-columns: 1fr; } .mdash-canvas-item { grid-column: 1 / -1 !important; } }";

    // ===== PROPERTIES PANEL (matches sidebar gradient) =====
    styles += ".mdash-properties { width: 320px; min-width: 320px; background: linear-gradient(180deg, rgba(var(--md-primary-rgb),0.96), rgba(var(--md-primary-rgb),0.84)); border: 1px solid rgba(255,255,255,0.16); border-radius: 14px; padding: 0; overflow-y: auto; box-shadow: 0 16px 32px rgba(2,6,23,0.18); backdrop-filter: blur(8px); transition: width 0.22s ease, min-width 0.22s ease, padding 0.22s ease; display: flex; flex-direction: column; }";

    // ── Component header (transparent over gradient, like sidebar header) ──
    styles += ".mdash-props-component-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.18); border-radius: 14px 14px 0 0; flex-shrink: 0; }";
    styles += ".mdash-props-component-info { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }";
    styles += ".mdash-props-component-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }";
    styles += ".mdash-props-component-icon i { font-size: 12px; color: #fff; }";
    styles += ".mdash-props-component-name { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.95; }";
    styles += ".mdash-props-component-header .mdash-properties-toggle { background: none; border: none; color: rgba(255,255,255,0.55); font-size: 12px; padding: 4px; cursor: pointer; transition: color 0.2s; }";
    styles += ".mdash-props-component-header .mdash-properties-toggle:hover { color: #fff; }";

    // ── Legacy header (hidden when not collapsed) ──
    styles += ".mdash-properties-header { display: none; }";
    styles += ".mdash-properties-rail-actions { display: none; flex-direction: column; gap: 6px; align-items: center; }";
    styles += ".mdash-properties-rail-actions .btn { width: 36px; height: 34px; padding: 0; border-radius: 8px; }";

    // ── Collapsed state ──
    styles += ".mdash-properties.is-collapsed { width: 56px; min-width: 56px; padding: 10px 8px; overflow: hidden; }";
    styles += ".mdash-properties.is-collapsed .mdash-props-tabs, .mdash-properties.is-collapsed .mdash-props-tab-content { display: none; }";
    styles += ".mdash-properties.is-collapsed .mdash-props-component-header { display: none; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header { display: flex; justify-content: center; align-items: center; font-size: 0; margin-bottom: 4px; padding: 0 20px 0 0; min-height: 24px; width: 100%; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header > span { font-size: 0; width: 100%; display: flex; align-items: center; justify-content: center; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-header > span i { font-size: 18px; color: #fff; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-toggle { top: 50%; right: -1px; width: 18px; height: 18px; border-radius: 5px; color: rgba(255,255,255,0.7); }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-rail-actions { display: flex; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-rail-actions .btn { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.28); color: #fff; }";
    styles += ".mdash-properties.is-collapsed .mdash-properties-rail-actions .btn:hover { background: rgba(255,255,255,0.26); }";

    // ── Properties form fields (light theme) ──
    styles += "#mdash-properties-panel .form-group { margin-bottom: 8px; }";
    styles += "#mdash-properties-panel label { font-size: 11px; font-weight: 600; color: " + t.labelColor + "; letter-spacing: .3px; margin-bottom: 3px; display: block; }";
    styles += "#mdash-properties-panel input:not([type='checkbox']), #mdash-properties-panel select { font-size: 12px; border-radius: 7px; border: 1px solid " + t.inputBorder + "; background: " + t.inputBg + "; color: " + t.inputColor + "; box-shadow: none; min-height: 32px; transition: border-color 0.2s, box-shadow 0.2s; }";
    styles += "#mdash-properties-panel input:focus, #mdash-properties-panel select:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.15); outline: none; background: " + t.inputBg + "; }";
    styles += "#mdash-properties-panel input[type='checkbox'] { width: 16px; height: 16px; min-height: 16px; accent-color: var(--md-primary); cursor: pointer; vertical-align: middle; margin: 0; }";

    // ===== COLLAPSIBLE SECTIONS (FlutterFlow style — light) =====
    styles += ".mdash-prop-section { border-bottom: 1px solid " + t.sectionBorder + "; }";
    styles += ".mdash-prop-section:last-child { border-bottom: none; }";
    styles += ".mdash-prop-section-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; user-select: none; transition: background 0.15s; }";
    styles += ".mdash-prop-section-header:hover { background: " + t.sectionHoverBg + "; }";
    styles += ".mdash-prop-section-title { font-size: 12px; font-weight: 700; color: " + t.sectionTitleColor + "; display: flex; align-items: center; gap: 6px; letter-spacing: 0.2px; }";
    styles += ".mdash-prop-section-title i { font-size: 11px; color: var(--md-primary); opacity: 0.8; }";
    styles += ".mdash-prop-section-chevron { font-size: 10px; color: " + t.chevronColor + "; transition: transform 0.25s ease; }";
    styles += ".mdash-prop-section.is-collapsed .mdash-prop-section-chevron { transform: rotate(-90deg); }";
    styles += ".mdash-prop-section-body { padding: 4px 14px 12px; transition: max-height 0.3s ease, opacity 0.2s ease; overflow: hidden; }";
    styles += ".mdash-prop-section.is-collapsed .mdash-prop-section-body { max-height: 0 !important; padding: 0 14px; opacity: 0; }";

    // ── Field styling inside sections (light) ──
    styles += ".mdash-prop-field { margin-bottom: 2px; }";
    styles += ".mdash-prop-field label { font-size: 11px; font-weight: 600; color: " + t.labelColor + "; margin-bottom: 3px; display: block; }";
    styles += ".mdash-prop-field input:not([type='checkbox']), .mdash-prop-field select { width: 100%; font-size: 12px; border-radius: 7px; border: 1px solid " + t.inputBorder + "; background: " + t.inputBg + "; color: " + t.inputColor + "; box-shadow: none; min-height: 32px; padding: 4px 10px; transition: border-color 0.2s, box-shadow 0.2s; }";
    styles += ".mdash-prop-field input:focus, .mdash-prop-field select:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.15); outline: none; background: " + t.inputBg + "; }";
    styles += ".mdash-prop-field-check { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; }";
    styles += ".mdash-prop-field-check input[type='checkbox'] { width: 16px; height: 16px; accent-color: var(--md-primary); cursor: pointer; flex-shrink: 0; }";
    styles += ".mdash-prop-field-check span { font-size: 12px; color: " + t.textColor + "; font-weight: 500; }";
    styles += ".mdash-prop-field .m-editor { border: 1px solid rgba(0,0,0,0.12); border-radius: 7px; overflow: hidden; }";

    // ── Empty state ──
    styles += ".mdash-props-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 16px; gap: 8px; }";
    styles += ".mdash-props-empty-state i { font-size: 28px; color: " + t.mutedColor + "; }";
    styles += ".mdash-props-empty-state p { font-size: 12px; color: " + t.mutedColor + "; text-align: center; margin: 0; }";

    // ===== PROPERTIES TABS (over gradient, like sidebar header area) =====
    styles += ".mdash-props-tabs { display: flex; list-style: none; margin: 0; padding: 0; background: rgba(0,0,0,0.08); border-bottom: 1px solid rgba(255,255,255,0.12); flex-shrink: 0; }";
    styles += ".mdash-props-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 10px 4px 8px; cursor: pointer; color: rgba(255,255,255,0.5); border-bottom: 2px solid transparent; transition: all 0.2s; }";
    styles += ".mdash-props-tab:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.06); }";
    styles += ".mdash-props-tab.is-active { color: #fff; border-bottom-color: #fff; }";
    styles += ".mdash-props-tab i { font-size: 14px; }";
    styles += ".mdash-props-tab span { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }";
    styles += ".mdash-props-tab-content { flex: 1; overflow-y: auto; background: " + t.bodyBg + "; border-radius: 0 0 14px 14px; }";
    styles += ".mdash-props-tab-pane { display: none; }";
    styles += ".mdash-props-tab-pane.is-active { display: block; }";
    styles += ".mdash-properties.is-collapsed .mdash-props-tabs { display: none; }";
    styles += ".mdash-properties.is-collapsed .mdash-props-tab-content { display: none; }";

    // ── Scoped Bootstrap overrides: .form-control / label / btn-default inside the dark panel bodies
    styles += ".mdash-sidebar-body .form-control, .mdash-sidebar-body input:not([type='checkbox']), .mdash-sidebar-body select { background: " + t.inputBg + " !important; color: " + t.inputColor + " !important; border-color: " + t.inputBorder + " !important; }";
    styles += ".mdash-sidebar-body label { color: " + t.labelColor + " !important; }";
    styles += ".mdash-props-tab-content .form-control, .mdash-props-tab-content input:not([type='checkbox']), .mdash-props-tab-content select { background: " + t.inputBg + " !important; color: " + t.inputColor + " !important; border-color: " + t.inputBorder + " !important; }";
    styles += ".mdash-props-tab-content label { color: " + t.labelColor + " !important; }";
    styles += ".mdash-props-tab-content .btn-default { background: " + t.itemBg + " !important; border-color: " + t.inputBorder + " !important; color: " + t.textColor + " !important; }";
    styles += ".mdash-props-tab-content .btn-default:hover { background: rgba(255,255,255,0.12) !important; }";

    // ===== FONTES PANEL =====
    styles += "#mdash-fontes-panel { padding: 8px 0; }";

    // ── Add bar (compact header with scope label + circular add button) ──
    styles += ".mdash-fonte-add-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 14px 8px; }";
    styles += ".mdash-fonte-add-label { font-size: 11px; font-weight: 700; color: " + t.labelColor + "; letter-spacing: 0.2px; }";
    styles += ".mdash-fonte-add-btn { width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(var(--md-primary-rgb),0.3); background: rgba(var(--md-primary-rgb),0.08); color: var(--md-primary); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; padding: 0; font-size: 11px; line-height: 1; }";
    styles += ".mdash-fonte-add-btn:hover { background: rgba(var(--md-primary-rgb),0.18); border-color: var(--md-primary); transform: scale(1.08); }";

    styles += ".mdash-fonte-section-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: " + t.mutedColor + "; margin: 8px 14px 6px; }";
    styles += ".mdash-fonte-section-label i { margin-right: 4px; font-size: 10px; }";
    styles += ".mdash-fonte-list { display: flex; flex-direction: column; gap: 3px; padding: 0 8px; }";
    styles += ".mdash-fonte-list-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: " + t.itemBg + "; border: 1px solid " + t.itemBorder + "; border-radius: 8px; cursor: pointer; transition: all 0.18s; }";
    styles += ".mdash-fonte-list-item:hover { border-color: rgba(var(--md-primary-rgb),0.35); background: rgba(var(--md-primary-rgb),0.06); }";
    styles += ".mdash-fonte-list-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(var(--md-primary-rgb),0.10); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }";
    styles += ".mdash-fonte-list-icon i { font-size: 12px; color: var(--md-primary); }";
    styles += ".mdash-fonte-list-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }";
    styles += ".mdash-fonte-list-name { font-size: 12px; font-weight: 700; color: " + t.textColor + "; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }";
    styles += ".mdash-fonte-list-meta { font-size: 10px; color: " + t.mutedColor + "; line-height: 1.2; }";
    styles += ".mdash-fonte-list-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }";
    styles += ".mdash-fonte-list-actions .btn { width: 22px; height: 22px; padding: 0; font-size: 10px; border-radius: 5px; display: flex; align-items: center; justify-content: center; background: " + t.itemBg + "; border-color: " + t.itemBorder + "; color: " + t.mutedColor + "; }";
    styles += ".mdash-fonte-list-actions .btn:hover { background: rgba(var(--md-primary-rgb),0.12); color: var(--md-primary); border-color: rgba(var(--md-primary-rgb),0.3); }";

    styles += ".mdash-fonte-status { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }";
    styles += ".mdash-fonte-status.status-idle { background: #94a3b8; }";
    styles += ".mdash-fonte-status.status-loading { background: #f59e0b; }";
    styles += ".mdash-fonte-status.status-loaded { background: #22c55e; }";
    styles += ".mdash-fonte-status.status-error { background: #ef4444; }";

    // ── Fontes panel buttons ──
    styles += "#mdash-fontes-panel .btn-primary { background: var(--md-primary); border-color: var(--md-primary); color: #fff; border-radius: 7px; font-size: 12px; font-weight: 600; }";
    styles += "#mdash-fontes-panel .btn-primary:hover { filter: brightness(1.15); }";
    styles += "#mdash-fontes-panel > div { padding: 0 10px; }";

    // Fonte editor (inline no painel — light theme)
    styles += ".mdash-fonte-editor { padding: 0 14px; }";
    styles += ".mdash-fonte-editor-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.08); }";
    styles += ".mdash-fonte-editor-header span { font-size: 13px; font-weight: 700; color: #1e293b; }";
    styles += ".mdash-fonte-editor-header .btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: rgba(0,0,0,0.55); }";
    styles += ".mdash-fonte-editor .form-group { margin-bottom: 6px; }";
    styles += ".mdash-fonte-editor label { font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px; }";
    styles += ".mdash-fonte-editor .form-control { background: #fff; border-color: rgba(0,0,0,0.12); color: #1e293b; border-radius: 7px; }";
    styles += ".mdash-fonte-editor .form-control:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.15); background: #fff; }";
    styles += ".mdash-fonte-section[style*='display:none'] { display: none; }";
    styles += ".mdash-fonte-schema-table { overflow-y: auto; border: 1px solid rgba(0,0,0,0.08); border-radius: 0 0 7px 7px; }";
    styles += ".mdash-fonte-schema-table .table { margin: 0; background: transparent; color: #1e293b; }";
    styles += ".mdash-fonte-schema-table .table th { background: rgba(0,0,0,0.03); color: #475569; border-color: rgba(0,0,0,0.06); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }";
    styles += ".mdash-fonte-schema-table .table td { border-color: rgba(0,0,0,0.05); font-size: 11px; }";
    styles += ".mdash-schema-type-badge { font-size: 9px; font-weight: 700; background: rgba(var(--md-primary-rgb),0.10); color: var(--md-primary); padding: 2px 7px; border-radius: 4px; font-family: 'SF Mono', Consolas, monospace; }";
    styles += ".mdash-schema-toggle { width: 100%; text-align: left; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.025); border: 1px solid rgba(0,0,0,0.07); border-radius: 7px; padding: 7px 10px; cursor: pointer; transition: background 0.15s, border-color 0.15s; }";
    styles += ".mdash-schema-toggle:not(.collapsed) { border-radius: 7px 7px 0 0; border-bottom-color: transparent; background: rgba(var(--md-primary-rgb),0.05); border-color: rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-schema-toggle:hover { background: rgba(var(--md-primary-rgb),0.06); border-color: rgba(var(--md-primary-rgb),0.22); }";
    styles += ".mdash-schema-toggle-left { display: flex; align-items: center; gap: 6px; }";
    styles += ".mdash-schema-toggle-left .glyphicon { font-size: 11px; color: var(--md-primary); }";
    styles += ".mdash-schema-toggle-left > span:not(.mdash-schema-badge) { font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.2px; }";
    styles += ".mdash-schema-badge { font-size: 9px; font-weight: 700; background: rgba(var(--md-primary-rgb),0.12); color: var(--md-primary); padding: 2px 7px; border-radius: 10px; }";
    styles += ".mdash-schema-chevron { font-size: 10px; color: #94a3b8; transition: transform 0.2s ease; }";
    styles += ".mdash-schema-toggle:not(.collapsed) .mdash-schema-chevron { transform: rotate(90deg); color: var(--md-primary); }";
    styles += ".collapse + .mdash-fonte-schema-table, .collapsing + .mdash-fonte-schema-table { border-top: none; }";
    // Schema container: remove top border radius when expanded (connected visual)
    styles += ".mdash-schema-toggle:not(.collapsed) + .collapse .mdash-fonte-schema-table, .mdash-schema-toggle:not(.collapsed) + .collapsing .mdash-fonte-schema-table { border-radius: 0 0 7px 7px; border-top: none; }";
    styles += ".mdash-fonte-editor .btn-success { background: var(--md-primary); border-color: var(--md-primary); border-radius: 7px; font-weight: 600; }";
    styles += ".mdash-fonte-editor .btn-success:hover { filter: brightness(1.15); }";
    // Expand editor button
    styles += ".mdash-editor-expand { padding: 1px 7px; font-size: 11px; }";
    // Spinner animation for execute button
    styles += "@keyframes mdash-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
    styles += ".spinning { display: inline-block; animation: mdash-spin 0.8s linear infinite; }";

    // ── Parâmetros / Tokens (light theme) ──
    styles += ".mdash-fonte-params-section { margin-top: 8px; }";
    styles += ".mdash-fonte-params-section > label { font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px; }";
    styles += ".mdash-fonte-params-section > label .glyphicon { font-size: 10px; color: var(--md-primary); }";
    styles += ".mdash-fonte-params-list { margin-top: 4px; }";
    styles += ".mdash-fonte-param-row { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.07); border-radius: 7px; padding: 8px 10px; margin-bottom: 6px; }";
    styles += ".mdash-param-token-name { margin-bottom: 4px; }";
    styles += ".mdash-param-token-name code { background: var(--md-primary); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }";
    styles += ".mdash-param-fields .row { margin-left: -4px; margin-right: -4px; }";
    styles += ".mdash-param-fields .row > [class*='col-'] { padding-left: 4px; padding-right: 4px; }";
    styles += ".mdash-param-fields select, .mdash-param-fields input { font-size: 11px; background: #fff; border-color: rgba(0,0,0,0.12); color: #1e293b; border-radius: 6px; }";

    // ── Actions panel (light theme) ──
    styles += "#mdash-actions-panel { padding: 14px; }";
    styles += "#mdash-actions-panel .text-muted { color: rgba(0,0,0,0.38) !important; }";
    styles += "#mdash-actions-panel i { color: rgba(0,0,0,0.12); }";

    styles += "@media (max-width: 1440px) { .mdash-sidebar { width: 228px; min-width: 228px; } .mdash-properties { width: 280px; min-width: 280px; } .mdash-modern-layout { gap: 6px; padding: 6px; } }";

    // ===== MODALS =====
    styles += ".modal-header { background: linear-gradient(120deg, var(--md-primary), #0f172a); color: white; }";
    styles += ".modal-header .close { color: white; opacity: 0.8; }";
    styles += ".modal-header .close:hover { opacity: 1; }";
    styles += ".modal-header .modal-title { margin: 0; color: " + primaryColor + " !important; }";
    styles += ".modal-header .modal-title i { color: " + primaryColor + " !important; }";
    
    // ===== MODAL DE CONFIRMAÇÃO DE ELIMINAÇÃO =====
    styles += "#mdash-delete-confirm-modal .modal-dialog { margin-top: 160px; }";
    styles += "#mdash-delete-confirm-modal .modal-header { background: linear-gradient(120deg, #dc3545, #991d28); padding: 14px 18px; }";
    styles += "#mdash-delete-confirm-modal .modal-header .modal-title { font-size: 16px; font-weight: 700; color: white !important; }";
    styles += "#mdash-delete-confirm-modal .modal-header i { margin-right: 6px; color: white !important; }";
    styles += "#mdash-delete-confirm-modal .modal-body { padding: 24px 18px; font-size: 14px; color: #1f2937; line-height: 1.6; }";
    styles += "#mdash-delete-confirm-modal .modal-body small { display: block; margin-top: 8px; color: #64748b; font-size: 12px; }";
    styles += "#mdash-delete-confirm-modal .modal-footer { padding: 12px 18px; background: #f9fafb; border-top: 1px solid #e5e7eb; }";
    styles += "#mdash-delete-confirm-modal .btn { border-radius: 6px; font-weight: 600; font-size: 13px; padding: 8px 18px; transition: all 0.2s; }";
    styles += "#mdash-delete-confirm-modal .btn-default { background: white; border: 1px solid #d1d5db; color: #374151; }";
    styles += "#mdash-delete-confirm-modal .btn-default:hover { background: #f9fafb; border-color: #9ca3af; }";
    styles += "#mdash-delete-confirm-modal .mdash-btn-delete { background: linear-gradient(135deg, #dc3545, #c82333); border: none; color: white; box-shadow: 0 2px 8px rgba(220,53,69,0.3); }";
    styles += "#mdash-delete-confirm-modal .mdash-btn-delete:hover { background: linear-gradient(135deg, #c82333, #bd2130); box-shadow: 0 4px 12px rgba(220,53,69,0.4); transform: translateY(-1px); }";

    // ===== MULTI-SELECTION & CLIPBOARD VISUALS =====
    styles += ".mdash-multi-selected { outline: 2px dashed var(--md-primary) !important; outline-offset: 2px; position: relative; }";
    styles += ".mdash-multi-selected::after { content: '✓'; position: absolute; top: 4px; right: 8px; background: var(--md-primary); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 20; box-shadow: 0 2px 6px rgba(0,0,0,0.2); pointer-events: none; }";
    styles += ".mdash-clipboard-copied { outline: 2px dashed #22c55e !important; outline-offset: 1px; }";
    styles += "@keyframes mdash-copied-pulse { 0% { outline-color: #22c55e; } 50% { outline-color: #86efac; } 100% { outline-color: #22c55e; } }";
    styles += ".mdash-clipboard-copied { animation: mdash-copied-pulse 1.5s ease-in-out 2; }";
    // Sidebar multi-select
    styles += ".mdash-sidebar-item.mdash-multi-selected { background: rgba(var(--md-primary-rgb),0.12) !important; }";
    styles += ".mdash-sidebar-item.mdash-multi-selected::after { top: 50%; right: 6px; transform: translateY(-50%); }";

    // ===== COPY / PASTE BUTTONS =====
    styles += ".mdash-clip-btn { padding: 2px 5px !important; font-size: 11px !important; opacity: 0.55; transition: opacity 0.15s, background 0.15s; }";
    styles += ".mdash-clip-btn:hover { opacity: 1; }";
    styles += ".mdash-clip-paste { opacity: 0.85; color: #22c55e !important; border-color: #22c55e !important; }";
    styles += ".mdash-clip-paste:hover { opacity: 1; background: rgba(34,197,94,0.1) !important; }";
    // Object toolbar copy button
    styles += ".mdash-slot-zone-obj-copy { display:inline-flex; align-items:center; gap:3px; background:rgba(255,255,255,0.18); color:#fff !important; border:none; border-radius:3px; padding:2px 6px; font-size:10px; cursor:pointer; transition:background 0.15s, box-shadow 0.15s; line-height:1.4; flex-shrink:0; opacity:0.7; }";
    styles += ".mdash-slot-zone-obj-copy:hover { background:rgba(255,255,255,0.38); opacity:1; box-shadow:0 0 0 2px rgba(255,255,255,0.25); }";

    // ===== DASHBOARD TABS (Browser-like, enterprise) =====
    styles += ".mdash-tabs-toggle { display:inline-flex; align-items:center; gap:7px; margin-right:8px; font-size:11px; font-weight:700; color:#475569; background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:999px; padding:4px 10px; }";
    styles += ".mdash-tabs-toggle input[type='checkbox'] { accent-color: var(--md-primary); margin:0; }";
    // ── Dashboard tabs bar (Chrome-style, bg-filled) ─────────────────────
    styles += ".mdash-dashboard-tabs-wrap { --mdash-tabs-canvas: #ffffff; margin: 14px 0 -1px; overflow: visible; padding: 8px 4px 0; position:relative; }";
    styles += ".mdash-dashboard-tabs-wrap::after { content:''; position:absolute; left:0; right:0; bottom:0; height:1px; background:rgba(15,23,42,0.08); }";
    styles += ".mdash-dashboard-tabs { display:flex; align-items:flex-end; gap:2px; min-width:max-content; position:relative; z-index:1; padding-bottom:0; }";
    // Inactive: faded bg using tab accent at low alpha via mix; Active: full accent bg.
    styles += ".mdash-dashboard-tab { --mdash-tab-accent: var(--md-primary); --mdash-tab-icon: var(--md-primary); --mdash-tab-text: #475569; --mdash-tab-font: inherit; position:relative; min-width:168px; max-width:260px; height:40px; padding:0 34px 0 12px; display:inline-flex; align-items:center; gap:8px; cursor:grab; background:color-mix(in srgb, var(--mdash-tab-accent) 14%, #edf1f7); color:var(--mdash-tab-text); font-family:var(--mdash-tab-font); border-radius:10px 10px 0 0; transition:background .18s ease, color .18s ease, box-shadow .18s ease, transform .15s ease, filter .18s ease; margin-bottom:0; }";
    styles += ".mdash-dashboard-tab:active { cursor:grabbing; }";
    styles += ".mdash-dashboard-tab:hover { background:color-mix(in srgb, var(--mdash-tab-accent) 22%, #edf1f7); filter:brightness(1.02); }";
    styles += ".mdash-dashboard-tab.is-active { background:var(--mdash-tab-accent); color:var(--mdash-tab-text); box-shadow:0 -2px 10px rgba(15,23,42,0.08); z-index:3; }";
    // Bottom accent strip — solid accent line underlining the active tab
    styles += ".mdash-dashboard-tab > .mdash-dashboard-tab-accent { display:block; position:absolute; left:0; right:0; bottom:0; height:3px; background:var(--mdash-tab-accent); opacity:0; transition:opacity .18s ease; pointer-events:none; z-index:4; }";
    styles += ".mdash-dashboard-tab.is-active > .mdash-dashboard-tab-accent { opacity:0; }"; // not needed when bg is already accent
    styles += ".mdash-dashboard-tab-curve { display:none !important; }";
    // Icon colour is independent
    styles += ".mdash-dashboard-tab i { font-size:12px; flex-shrink:0; color:var(--mdash-tab-icon); }";
    styles += ".mdash-dashboard-tab-iconbtn i { color:var(--mdash-tab-icon); }";
    // Title inherits text color and font
    styles += ".mdash-dashboard-tab-title { border:none !important; background:transparent !important; color:inherit; font-family:inherit; width:100%; min-width:0; font-size:12px; font-weight:600; line-height:1; letter-spacing:.01em; outline:none !important; padding:0; cursor:text; box-shadow:none !important; -webkit-appearance:none; appearance:none; text-overflow:ellipsis; }";
    styles += ".mdash-dashboard-tab-title:focus, .mdash-dashboard-tab-title:active, .mdash-dashboard-tab-title:hover { outline:none !important; box-shadow:none !important; background:transparent !important; border:none !important; }";
    styles += ".mdash-dashboard-tab-title::placeholder { color:currentColor; opacity:.5; font-weight:500; }";
    // Close button — adapts to current text color
    styles += ".mdash-dashboard-tab-close { position:absolute; right:8px; top:50%; transform:translateY(-50%); width:18px; height:18px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:9px; color:currentColor; opacity:0; transition:opacity .15s, background .15s, color .15s, transform .15s; cursor:pointer; }";
    styles += ".mdash-dashboard-tab:hover .mdash-dashboard-tab-close, .mdash-dashboard-tab.is-active .mdash-dashboard-tab-close { opacity:.7; }";
    styles += ".mdash-dashboard-tab-close:hover { opacity:1 !important; background:rgba(220,38,38,.18); color:#fff; transform:translateY(-50%) scale(1.1); }";
    // + add tab
    styles += ".mdash-dashboard-tab-add { min-width:32px; width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; margin-left:6px; margin-bottom:2px; background:transparent; color:#94a3b8; border:none; border-radius:50%; cursor:pointer; transition:background .15s, color .15s, transform .15s; align-self:flex-end; }";
    styles += ".mdash-dashboard-tab-add:hover { background:rgba(var(--md-primary-rgb),.1); color:var(--md-primary); transform:scale(1.08); }";
    styles += ".mdash-dashboard-tab-add i { font-size:13px; }";
    // Sortable states
    styles += ".mdash-dashboard-tab.is-dragging, .mdash-dashboard-tab.ui-sortable-helper { opacity:.92; cursor:grabbing; box-shadow:0 12px 28px rgba(15,23,42,.18); transform:translateY(-2px) rotate(-1deg); z-index:10; }";
    styles += ".mdash-dashboard-tab-placeholder { min-width:168px; height:40px; background:rgba(var(--md-primary-rgb),.08); border:1px dashed rgba(var(--md-primary-rgb),.35); border-bottom:none; border-radius:10px 10px 0 0; box-sizing:border-box; visibility:visible !important; margin-bottom:0; }";
    // Auto-contrast swatch (checker pattern)
    styles += ".mdash-phc-color-auto { background:linear-gradient(135deg, #fff 50%, #0f172a 50%) !important; display:inline-flex; align-items:center; justify-content:center; color:transparent; }";
    styles += ".mdash-phc-color-auto i { color:rgba(15,23,42,.65); font-size:10px; mix-blend-mode:difference; }";
    // Font family select inside the tab editor
    styles += ".mdash-tab-editor-font { width:100%; padding:5px 8px; border:1px solid rgba(15,23,42,.14); border-radius:6px; background:#fff; color:#1f2937; font-size:12px; cursor:pointer; outline:none; transition:border-color .15s, box-shadow .15s; }";
    styles += ".mdash-tab-editor-font:focus { border-color:var(--md-primary); box-shadow:0 0 0 2px rgba(var(--md-primary-rgb),.15); }";

    // Icon button on tab
    styles += ".mdash-dashboard-tab-iconbtn { flex-shrink:0; width:22px; height:22px; padding:0; border:none; background:transparent; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; border-radius:4px; color:var(--mdash-tab-accent); transition:background 0.15s; }";
    styles += ".mdash-dashboard-tab-iconbtn:hover { background:rgba(var(--md-primary-rgb),0.12); }";
    styles += ".mdash-dashboard-tab-iconbtn i { font-size:13px; }";

    // Tab editor popover (icon + color)
    styles += ".mdash-tab-editor-popover { position:absolute; top:calc(100% + 4px); left:0; z-index:1050; background:#fff; border:1px solid rgba(15,23,42,0.12); border-radius:10px; box-shadow:0 12px 32px rgba(15,23,42,0.18); padding:10px 12px; min-width:220px; }";
    styles += ".mdash-tab-editor-section + .mdash-tab-editor-section { margin-top:10px; padding-top:10px; border-top:1px solid rgba(15,23,42,0.06); }";
    styles += ".mdash-tab-editor-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#64748b; margin-bottom:6px; }";
    styles += ".mdash-tab-editor-colors { display:grid; grid-template-columns:repeat(7, 24px); gap:6px; align-items:center; }";
    styles += ".mdash-phc-color-custom { position:relative; width:22px; height:22px; border-radius:50%; border:2px solid #fff; padding:0; margin:0; cursor:pointer; box-shadow:0 0 0 1px rgba(15,23,42,0.15); display:inline-flex; align-items:center; justify-content:center; overflow:hidden; }";
    styles += ".mdash-phc-color-custom:hover { transform:scale(1.15); }";
    styles += ".mdash-phc-color-custom.is-active { box-shadow:0 0 0 2px var(--md-primary), 0 2px 6px rgba(0,0,0,0.25); }";
    styles += ".mdash-phc-color-custom i { color:#fff; font-size:10px; text-shadow:0 1px 1px rgba(0,0,0,0.35); pointer-events:none; }";
    styles += ".mdash-phc-color-custom input[type=color] { position:absolute; inset:0; width:100%; height:100%; opacity:0; border:none; padding:0; cursor:pointer; }";
    styles += ".mdash-tab-editor-icons { display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; max-height:140px; overflow-y:auto; }";
    styles += ".mdash-tab-editor-icon { width:30px; height:30px; padding:0; border:1px solid rgba(15,23,42,0.1); border-radius:6px; background:#fff; color:#475569; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:all 0.12s; }";
    styles += ".mdash-tab-editor-icon:hover { border-color:var(--md-primary); color:var(--md-primary); background:rgba(var(--md-primary-rgb),0.06); }";
    styles += ".mdash-tab-editor-icon.is-active { background:var(--md-primary); color:#fff; border-color:var(--md-primary); }";
    styles += ".mdash-tab-editor-icon i { font-size:13px; }";

    // Sidebar tab entry
    styles += ".mdash-sidebar-tab { --mdash-tab-accent: var(--md-primary); position:relative; padding-left:10px; }";
    styles += ".mdash-sidebar-tab .mdash-sidebar-tab-accent { position:absolute; left:0; top:6px; bottom:6px; width:3px; border-radius:2px; background:var(--mdash-tab-accent); opacity:0.75; }";
    styles += ".mdash-sidebar-tab.is-active { border-color: rgba(var(--md-primary-rgb),0.4) !important; background: rgba(var(--md-primary-rgb),0.08) !important; }";
    styles += ".mdash-sidebar-tab.is-active .mdash-sidebar-tab-accent { opacity:1; }";

    // PHC color picker (reused: tabs + future)
    styles += ".mdash-tab-color-wrap { position:relative; display:inline-flex; align-items:center; gap:4px; }";
    styles += ".mdash-tab-color-swatch { width:18px; height:18px; border:2px solid #fff; border-radius:50%; padding:0; cursor:pointer; box-shadow:0 0 0 1px rgba(15,23,42,0.2), 0 1px 3px rgba(0,0,0,0.15); transition:transform 0.15s; }";
    styles += ".mdash-tab-color-swatch:hover { transform:scale(1.12); }";
    styles += ".mdash-phc-color-picker { position:absolute; top:calc(100% + 6px); right:0; display:grid; grid-template-columns:repeat(3, 22px); gap:5px; padding:8px; background:#fff; border:1px solid rgba(15,23,42,0.12); border-radius:8px; box-shadow:0 8px 24px rgba(15,23,42,0.18); z-index:1000; }";
    styles += ".mdash-phc-color-picker::before { content:''; position:absolute; top:-5px; right:8px; width:10px; height:10px; background:#fff; border-left:1px solid rgba(15,23,42,0.12); border-top:1px solid rgba(15,23,42,0.12); transform:rotate(45deg); }";
    styles += ".mdash-phc-color-option { width:22px; height:22px; border-radius:50%; border:2px solid #fff; padding:0; cursor:pointer; box-shadow:0 0 0 1px rgba(15,23,42,0.15); transition:transform 0.12s; }";
    styles += ".mdash-phc-color-option:hover { transform:scale(1.15); }";
    styles += ".mdash-phc-color-option.is-active { box-shadow:0 0 0 2px var(--md-primary), 0 2px 6px rgba(0,0,0,0.25); }";
    styles += ".mdash-filter-scope-badge { margin-left:8px; padding:1px 6px; border-radius:999px; font-size:9px; font-weight:700; background:rgba(var(--md-primary-rgb),0.12); color:var(--md-primary); }";

    $('<style id="mdash-modern-styles" data-mdash-style-version="' + styleVersion + '">').text(styles).appendTo('head');

    // Reaplica após o ciclo atual para ganhar prioridade caso outro script injete CSS depois.
    setTimeout(function () {
        $('#mdash-modern-styles').appendTo('head');
    }, 0);
}

/**
 * Devolve o tema ACE a usar nos editores de expressão.
 * 'dark'  → ace/theme/monokai
 * 'light' → ace/theme/chrome
 * Hardcoded para 'dark'. No futuro, ler de uma preferência do utilizador.
 */
function getMDashEditorTheme(mode) {
    return mode === 'light' ? 'ace/theme/chrome' : 'ace/theme/monokai';
}

/**
 * Inicializa editores ACE para campos com classe .m-editor
 */
function handleCodeEditor() {
    function getAceModeForEditor(el) {
        var key = [
            (el && el.id) || "",
            (el && el.getAttribute && el.getAttribute("data-field")) || "",
            (el && el.getAttribute && el.getAttribute("data-fonte-field")) || "",
            (el && el.getAttribute && el.getAttribute("name")) || "",
            (el && el.className) || ""
        ].join(" ").toLowerCase();
        var sqlKeys = [
            "expressaolistagem",
            "expressaodblistagem",
            "mdash-obj-query-editor",
            "mdash-fonte-query-editor",
            "query",
            "sql"
        ];
        var jsKeys = [
            "expressaojslistagem",
            "expressaochange",
            "expressaoapresentacaodados",
            "expressaolayoutcontaineritem",
            "valordefeito"
        ];

        for (var i = 0; i < sqlKeys.length; i++) {
            if (key.indexOf(sqlKeys[i]) !== -1) return "ace/mode/sql";
        }

        for (var j = 0; j < jsKeys.length; j++) {
            if (key.indexOf(jsKeys[j]) !== -1) return "ace/mode/javascript";
        }

        // Fallback: a maioria dos campos de expressão não-DB usa JavaScript.
        return "ace/mode/javascript";
    }

    var editors = [];
    document.querySelectorAll('.m-editor').forEach(function (el, idx) {
        // Garante um id único para cada editor
        if (!el.id) el.id = 'm-editor' + idx;

        var aceEditor = ace.edit(el.id);
        aceEditor.setTheme(getMDashEditorTheme('dark'));
        aceEditor.session.setMode(getAceModeForEditor(el));

        // Carrega ext-language_tools antes de activar autocompletion
        var aceOpts = { fontSize: "13px" };
        if (ace.require && ace.require("ace/ext/language_tools")) {
            aceOpts.enableBasicAutocompletion = true;
            aceOpts.enableLiveAutocompletion = true;
        }
        aceEditor.setOptions(aceOpts);

        editors.push(aceEditor);
    });

    // Guarda o editor atualmente focado
    var focusedEditor = null;
    editors.forEach(function (ed) {
        ed.on('focus', function () {
            focusedEditor = ed;
        });
    });
}

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
var GMDashAccesses = [];
var GMDashFontes = [];
var GMDashTabs = [];
var GMDashContainerItemLayouts = [];
var GMdashDeleteRecords = [];
var MDASH_ITEM_OVERLAY_SLOT = 'overlay';
var GMDashTempRecordToDelete = null; // Armazém temporário para confirmações de eliminação
var GMDashStamp = "";
var selectedObject = {};
var GSelectedElement = null;
var GSelectedType = "";
var GActiveTab = "general";
var GMDashReactiveInstance = null;
var _currentSelectedComponent = null; // espelho externo do selectedComponent (PetiteVue mount() não expõe o scope reactivo)
var _currentFontesPanelSelector = '#mdash-fontes-panel';
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

/** True quando o dashboard está a ser editado (não em mdash.html runtime). */
function mdashIsEditorMode() {
    return $('.mdash-editor-wrapper').length > 0;
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
        if (t !== 'container' && t !== 'containerItem' && t !== 'object' && t !== 'tab') return;
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
    } else if (type === 'tab') {
        lookup = window.appState.tabs || GMDashTabs;
        stamps.forEach(function (st) {
            var tab = lookup.find(function (x) { return x.mdashtabstamp === st; });
            if (!tab) return;
            var snap = _clipSnapshot(tab);
            // Incluir todos os containers desta tab + items + objectos
            snap._containers = (window.appState.containers || [])
                .filter(function (c) { return c.mdashtabstamp === st; })
                .map(function (c) {
                    var cSnap = _clipSnapshot(c);
                    cSnap._children = (window.appState.containerItems || [])
                        .filter(function (i) { return i.mdashcontainerstamp === c.mdashcontainerstamp; })
                        .map(function (item) {
                            var itemSnap = _clipSnapshot(item);
                            itemSnap._objects = (window.appState.containerItemObjects || [])
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
                            return itemSnap;
                        });
                    return cSnap;
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

    // Toggle de classe no body ? faz aparecer o botão "Colar" em slots quando há objecto copiado
    try {
        $('body').toggleClass('mdash-has-object-clipboard', type === 'object');
    } catch (e) { }

    if (typeof updateOverlayDesignerPasteButtonState === 'function') updateOverlayDesignerPasteButtonState();

    // Visual feedback — marcar como "copied"
    _clipUpdateCopiedVisuals();

    var labels = { container: 'container(s)', containerItem: 'item(ns)', object: 'objecto(s)', tab: 'separador(es)' };
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
    var pastedToOverlay = false;

    if (clip.type === 'tab') {
        clip.items.forEach(function (snap) {
            pastedCount += _clipPasteTab(snap);
        });
    } else if (clip.type === 'container') {
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
        var target = _clipResolveTargetItemSlot();
        if (!target.itemStamp) {
            if (typeof alertify !== 'undefined') alertify.warning('Seleccione um slot (ou item) para colar o(s) objecto(s).');
            return;
        }
                if (target.overlayOptions && target.overlayOptions.createNewPlace) {
            var pasteItem = (window.appState.containerItems || []).find(function (i) {
                return i.mdashcontaineritemstamp === target.itemStamp;
            });
            if (pasteItem) {
                var newPlace = addOverlayPlace(target.itemStamp, { select: false, skipSync: true });
                target.overlayOptions.overlayPlaceId = newPlace.id;
                target.overlayOptions.createNewPlace = false;
                target.slotId = getOverlayPlaceMainSlotId(newPlace.templatelayout);
            }
        }
        var lastPastedStamp = '';
        clip.items.forEach(function (snap) {
            var newStamp = _clipPasteObject(snap, target.itemStamp, target.slotId, target.overlayOptions);
            if (newStamp) {
                pastedCount += 1;
                lastPastedStamp = newStamp;
            }
        });
        if (target.overlayOptions && target.itemStamp && typeof refreshMdashOverlayDesignerSurface === 'function') {
            pastedToOverlay = true;
            var overlayItemStamp = target.itemStamp;
            var selectStamp = lastPastedStamp;
            var pastedPlaceId = target.overlayOptions.overlayPlaceId;
            setTimeout(function () {
                if (pastedPlaceId) {
                    syncOverlayGridLayoutAfterChange(overlayItemStamp, {
                        placeRefresh: pastedPlaceId,
                        preserveSelection: selectStamp || undefined
                    });
                } else {
                    refreshMdashOverlayDesignerSurface(overlayItemStamp, {
                        preserveSelection: selectStamp || undefined,
                        immediate: true
                    });
                }
                updateOverlayDesignerPasteButtonState();
            }, 0);
        }
    }

    if (pastedCount > 0) {
        if (!pastedToOverlay) {
            setTimeout(function () {
                renderAllContainerItemTemplates();
                if (typeof initDragAndDrop === 'function') initDragAndDrop();
            }, 50);
        }
        var labels = { container: 'container(s)', containerItem: 'item(ns)', object: 'objecto(s)', tab: 'separador(es)' };
        if (typeof alertify !== 'undefined') alertify.success(pastedCount + ' ' + (labels[clip.type] || 'elemento(s)') + ' colado(s)');
    }
}

// -- Paste helpers ----------------------------------------------------------

function _clipPasteTab(snap) {
    var newTabStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashtabstamp = newTabStamp;
    data.dashboardstamp = GMDashStamp;
    data.titulo = (data.titulo || 'Separador') + ' (cópia)';
    var tabs = window.appState.tabs || GMDashTabs;
    data.ordem = (tabs.length || 0) + 1;
    delete data._containers;
    delete data.localsource;
    delete data.idfield;
    delete data.table;

    var newTab = new MdashTab(data);
    tabs.push(newTab);
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newTab, newTab.table, newTab.idfield);

    // Colar containers filhos com novo mdashtabstamp
    if (snap._containers && snap._containers.length) {
        snap._containers.forEach(function (cSnap) {
            _clipPasteContainer(cSnap, newTabStamp);
        });
    }

    // Activar a nova tab
    window.appState.activeTabStamp = newTabStamp;
    var settings = window.appState.dashboardSettings || {};
    settings.activeTabStamp = newTabStamp;
    window.appState.dashboardSettings = settings;
    if (typeof mdashSyncDashboardConfigRealtime === 'function') mdashSyncDashboardConfigRealtime();

    return 1;
}

function _clipPasteContainer(snap, overrideTabStamp) {
    var newStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashcontainerstamp = newStamp;
    data.dashboardstamp = GMDashStamp;
    if (typeof overrideTabStamp === 'string') {
        data.mdashtabstamp = overrideTabStamp;
    }
    // Só sufixa '(cópia)' se for cópia individual de container — quando vem de uma tab,
    // mantemos o título original (a tab é que ganha o sufixo).
    if (typeof overrideTabStamp !== 'string') {
        data.titulo = (data.titulo || 'Container') + ' (cópia)';
    }
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

function _clipPasteObject(snap, targetItemStamp, targetSlotId, pasteOptions) {
    var newStamp = generateUUID();
    var data = _clipDeepClone(snap);
    data.mdashcontaineritemobjectstamp = newStamp;
    data.mdashcontaineritemstamp = targetItemStamp;
    data.dashboardstamp = GMDashStamp;
    // Se foi especificado um slot destino, sobrepõe o slotid original.
    // Se NÃO foi especificado (cola dentro do mesmo item ou grupo), mantém o slotid original
    // para preservar o layout.
    if (typeof targetSlotId === 'string') {
        data.slotid = targetSlotId;
    }
    if (pasteOptions && pasteOptions.categoria) {
        data.categoria = pasteOptions.categoria;
    }
    if (pasteOptions && pasteOptions.tamanho) {
        data.tamanho = pasteOptions.tamanho;
    }
    if (pasteOptions && pasteOptions.overlayPlaceId) {
        var pasteCfg = {};
        if (data.configjson) {
            try { pasteCfg = JSON.parse(data.configjson) || {}; } catch (e) { pasteCfg = {}; }
        }
        pasteCfg.overlayPlaceId = pasteOptions.overlayPlaceId;
        data.configjson = JSON.stringify(pasteCfg);
    }

    var newObj = new MdashContainerItemObject(data);
    if (pasteOptions && pasteOptions.overlayPlaceId) {
        if (!newObj.config || typeof newObj.config !== 'object') newObj.config = {};
        newObj.config.overlayPlaceId = pasteOptions.overlayPlaceId;
        syncOverlayObjectConfigjson(newObj);
    }
    window.appState.containerItemObjects.push(newObj);
    if (typeof newObj.stringifyJSONFields === 'function') newObj.stringifyJSONFields();
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newObj, newObj.table, newObj.idfield);
    return newStamp;
}

// -- Resolve target helpers -------------------------------------------------

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

/**
 * Resolve o destino para um paste de 'object' (objecto dentro de slot).
 * Devolve { itemStamp, slotId }. `slotId` pode ser undefined — nesse caso o
 * objecto será colado preservando o `slotid` original do snapshot (ou vazio se não tinha).
 */
function _getOpenOverlayDesignerItemStamp() {
    var $modal = $('#mdash-overlay-designer-modal');
    if (!$modal.length) return '';
    if (!$modal.hasClass('in') && !$modal.hasClass('show') && !$modal.is(':visible')) return '';
    return $modal.data('item-stamp') || '';
}

function _clipResolveTargetItemSlot() {
    var sel = _currentSelectedComponent;
    var overlayItemStamp = _getOpenOverlayDesignerItemStamp();
    if (overlayItemStamp) {
        var containerItem = (window.appState.containerItems || []).find(function (i) {
            return i.mdashcontaineritemstamp === overlayItemStamp;
        });
        var overlayPlaceId = '';
        var slotId = MDASH_ITEM_OVERLAY_SLOT;

        if (sel && sel.type === 'overlayPlace' && sel.stamp) {
            overlayPlaceId = sel.stamp;
            slotId = sel.data && sel.data.mainSlotId ? sel.data.mainSlotId : getOverlayPlaceMainSlotId(sel.data && sel.data.templatelayout);
        } else if (sel && sel.type === 'slot' && sel.data && sel.data.itemStamp === overlayItemStamp && sel.data.slotId) {
            overlayPlaceId = sel.data.overlayPlaceId || '';
            slotId = sel.data.slotId;
        } else if (sel && sel.type === 'object' && sel.surface === 'overlay' && sel.data) {
            overlayPlaceId = (sel.data.config && sel.data.config.overlayPlaceId) || '';
            slotId = sel.data.slotid || getOverlayPlaceMainSlotId();
        }

        if (!overlayPlaceId && containerItem) {
            var places = getItemOverlayPlaces(containerItem);
            if (places.length === 1) {
                overlayPlaceId = places[0].id;
                slotId = getOverlayPlaceMainSlotId(places[0].templatelayout);
            }
        }

        return {
            itemStamp: overlayItemStamp,
            slotId: slotId,
            overlayOptions: {
                categoria: 'overlay',
                overlayPlaceId: overlayPlaceId || undefined,
                createNewPlace: !overlayPlaceId
            }
        };
    }

    if (!sel) return { itemStamp: '', slotId: undefined };

    if (sel.surface === 'overlay' && sel.data && sel.data.mdashcontaineritemstamp) {
        return {
            itemStamp: sel.data.mdashcontaineritemstamp,
            slotId: MDASH_ITEM_OVERLAY_SLOT,
            overlayOptions: { categoria: 'overlay' }
        };
    }

    // Prioridade 1: slot seleccionado ? destino é esse slot específico
    if (sel.type === 'slot' && sel.data && sel.data.itemStamp) {
        return { itemStamp: sel.data.itemStamp, slotId: sel.data.slotId };
    }
    // Prioridade 2: objecto seleccionado ? colar no mesmo slot (duplicação lateral)
    if (sel.type === 'object' && sel.data) {
        return {
            itemStamp: sel.data.mdashcontaineritemstamp || '',
            slotId: sel.data.slotid || ''
        };
    }
    // Prioridade 3: item seleccionado ? slot indefinido (mantém o original do snapshot)
    if (sel.type === 'containerItem' && sel.stamp) {
        return { itemStamp: sel.stamp, slotId: undefined };
    }
    return { itemStamp: '', slotId: undefined };
}

// -- Visual feedback --------------------------------------------------------

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
            // Tipo diferente ? limpar e começar nova selecção
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

    // Click normal sem modificadores ? limpar multi-selecção
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
        var $target = $(e.target);
        var isTabTitleInput = $target.hasClass('mdash-dashboard-tab-title');
        var isFormElement = (tag === 'input' || tag === 'textarea' || tag === 'select');

        // Excepção: se o foco está no input do título de uma tab e não há texto seleccionado,
        // permitir Ctrl+C / Ctrl+V para copiar/colar a tab inteira (UX mais previsível).
        if (isFormElement && !isTabTitleInput) return;
        if ($target.closest('.m-editor, .ace_editor, [contenteditable]').length) return;

        var hasInputSelection = false;
        if (isTabTitleInput) {
            try {
                var inp = e.target;
                hasInputSelection = (typeof inp.selectionStart === 'number' &&
                    typeof inp.selectionEnd === 'number' &&
                    inp.selectionEnd > inp.selectionStart);
            } catch (err) { hasInputSelection = false; }
        }

        // Ctrl+C — Copiar
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            if (isTabTitleInput && hasInputSelection) return; // deixa o browser copiar texto
            if (!_currentSelectedComponent && !GMDashMultiSelection.stamps.length) return;
            e.preventDefault();
            // Se a selecção MDash não é uma tab mas o foco está no input de título da tab,
            // tirar foco para evitar que o próximo Ctrl+V caia dentro do input.
            if (isTabTitleInput && _currentSelectedComponent && _currentSelectedComponent.type !== 'tab') {
                try { e.target.blur(); } catch (err) { }
            }
            mdashCopySelection();
            return;
        }

        // Ctrl+V — Colar
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            // Se temos componentes MDash no clipboard, PREVALECE sempre (mesmo dentro do input
            // do título da tab) — evita que o utilizador cole por engano o objecto/container no
            // campo de texto da tab. Só devolvemos controlo ao browser em textareas ou editores.
            if (GMDashClipboard.items.length) {
                e.preventDefault();
                // Tirar foco do input para não ficar a cursor piscar em campo desactualizado
                if (isTabTitleInput) { try { e.target.blur(); } catch (err) { } }
                mdashPasteClipboard();
            }
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
        // Verifica se há erros nas fontes e adiciona indicação visual
        setTimeout(function () {
            checkAndIndicateSourceErrors(item);
        }, 500);
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
        ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
        mountUnifiedLayout($body, template, {
            title: item.titulo || "Item",
            id: item.mdashcontaineritemstamp,
            tipo: (template.UIData && template.UIData.tipo) || "primary",
            bodyContent: ""
        });
        applyContainerItemLayoutProps(item, bodySelector);
    } else if (template && template.sampleHtml) {
        $body.html(template.sampleHtml);
    } else {
        html = '<div class="preview-card">';
        html += '  <div class="preview-card-header">' + (item.titulo || "Item sem título") + '</div>';
        html += '  <div class="preview-card-body text-muted">Selecione um layout</div>';
        html += '</div>';
        $body.html(html);
    }

    // Injeta mini drop-zones apenas nos slots de conteúdo
    if (template && template.htmltemplate) {
        injectSlotDropOverlays(item.mdashcontaineritemstamp, template);
    }
}

// ============================================================================
// UNIVERSAL ERROR DISPLAY SYSTEM - Funciona em Editor e Preview
// ============================================================================

function generateSourceErrorHTML(issues) {
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
        return '';
    }

    var errorCount = issues.length;
    var debugBtnId = 'debug-errors-' + Math.random().toString(36).substr(2, 9);
    var countLabel = errorCount === 1 ? '1 dependência com problema' : errorCount + ' dependências com problema';

    // Estado de erro enterprise — preenche o slot do objeto (inline, não flutuante),
    // garantindo que cada slot ocupa espaço real e nunca se sobrepõe a vizinhos.
    var errorHtml = '';
    errorHtml += '<div class="mdash-slot-error-state mdash-error-btn-trigger" data-error-id="' + debugBtnId + '" data-error-issues=\'' + JSON.stringify(issues).replace(/'/g, "&apos;") + '\' title="Clique para ver detalhes técnicos">';
    errorHtml += '  <div class="mdash-slot-error-icon">';
    errorHtml += '    <i class="glyphicon glyphicon-wrench"></i>';
    errorHtml += '    <span class="mdash-slot-error-count">' + errorCount + '</span>';
    errorHtml += '  </div>';
    errorHtml += '  <div class="mdash-slot-error-body">';
    errorHtml += '    <div class="mdash-slot-error-title">Erro interno</div>';
    errorHtml += '    <div class="mdash-slot-error-sub">' + countLabel + '</div>';
    errorHtml += '  </div>';
    errorHtml += '</div>';

    return errorHtml;
}

function renderUniversalSourceError(containerSelector, issues) {
    var errorHtml = generateSourceErrorHTML(issues);

    var $container = $(containerSelector);
    if ($container.length === 0) {
        console.warn('[renderUniversalSourceError] Seletor não encontrado:', containerSelector);
        return;
    }

    // O indicador fica DENTRO do próprio slot do objeto (não num pai partilhado).
    // Assim cada objeto que falha mostra o seu próprio indicador no seu slot,
    // evitando que múltiplos botões se empilhem no mesmo card.
    if ($container.css('position') === 'static') {
        $container.css('position', 'relative');
    }

    // Limpa qualquer conteúdo anterior do slot (render bloqueado) e o indicador anterior
    $container.find('.mdash-error-indicator-minimal').remove();
    $container.html(errorHtml);

    // Attach handlers para os botões de erro (com delay para garantir DOM)
    setTimeout(attachErrorButtonHandlers, 50);
}

function attachErrorButtonHandlers() {
    $(document).off('click', '.mdash-error-btn-trigger').on('click', '.mdash-error-btn-trigger', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $indicator = $(this);
        var issuesJson = $indicator.data('error-issues');

        // Se issues for string, fazer parse
        if (typeof issuesJson === 'string') {
            try {
                issuesJson = JSON.parse(issuesJson);
            } catch (err) {
                console.error('[attachErrorButtonHandlers] Erro ao parsear issues:', err);
                console.error('Issues JSON:', issuesJson);
                return;
            }
        }

        if (Array.isArray(issuesJson)) {
            openSourceErrorDetailsModalUniversal(issuesJson);
        } else {
            console.warn('[attachErrorButtonHandlers] Issues não é um array:', issuesJson);
        }
    });
}

function showContainerItemSourceErrors(containerItemStamp, issues) {
    var bodySelector = ".mdash-canvas-item[data-stamp='" + containerItemStamp + "'] .mdash-canvas-item-body";
    var $body = $(bodySelector);
    if (!$body.length) {
        console.warn('[showContainerItemSourceErrors] Elemento não encontrado:', bodySelector);
        return;
    }

    if (!issues || !Array.isArray(issues)) {
        console.warn('[showContainerItemSourceErrors] Issues inválido:', issues);
        return;
    }

    var errorHtml = generateSourceErrorHTML(issues);
    $body.html(errorHtml);

    // Attach handlers para os botões de erro
    setTimeout(attachErrorButtonHandlers, 100);
}

function openSourceErrorDetailsModalUniversal(issues) {
    if (!issues || !Array.isArray(issues)) {
        console.error('[openSourceErrorDetailsModalUniversal] Issues inválido:', issues);
        return;
    }

    var modalBody = '';

    // Apenas lista técnica de erros (sem blá blá)
    modalBody += '<div class="mdash-modal-technical-errors">';
    issues.forEach(function (issue, idx) {
        modalBody += '<div class="mdash-tech-error-item">';
        modalBody += '  <code class="mdash-tech-error-type">' + (issue.type || 'unknown') + '</code>';
        modalBody += '  <div class="mdash-tech-error-content">';
        modalBody += '    <strong>' + (issue.source || 'Unknown') + '</strong>';
        modalBody += '    <pre class="mdash-tech-error-message">' + escapeHtml(issue.message || '') + '</pre>';
        modalBody += '  </div>';
        modalBody += '</div>';
    });
    modalBody += '</div>';

    var modalId = 'modal-source-errors-' + Math.random().toString(36).substr(2, 9);
    var modalData = {
        title: 'Erros Técnicos (' + issues.length + ')',
        id: modalId,
        body: modalBody,
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>'
    };

    $('#' + modalId).remove();
    var modalHTML = generateModalHTML(modalData);
    $('body').append(modalHTML);
    $('#' + modalId).modal('show');
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Alias para compatibilidade
function openSourceErrorDetailsModal(containerItemStamp, issues) {
    openSourceErrorDetailsModalUniversal(issues);
}

function showContainerItemError(containerItemStamp, error, errorDetails) {
    var bodySelector = ".mdash-canvas-item[data-stamp='" + containerItemStamp + "'] .mdash-canvas-item-body";
    var $body = $(bodySelector);
    if (!$body.length) return;

    var errorId = 'error-' + containerItemStamp;
    var debugBtnId = 'debug-btn-' + containerItemStamp;

    var errorHtml = '';
    errorHtml += '<div class="mdash-error-container" style="padding: 20px; background: #fff5f5; border: 2px solid #f56565; border-radius: 6px; text-align: center;">';
    errorHtml += '  <div style="margin-bottom: 15px;">';
    errorHtml += '    <i class="glyphicon glyphicon-exclamation-sign" style="color: #f56565; font-size: 32px;"></i>';
    errorHtml += '  </div>';
    errorHtml += '  <h4 style="color: #c53030; margin: 10px 0;">Erro ao Renderizar</h4>';
    errorHtml += '  <p style="color: #742a2a; margin: 10px 0; font-size: 13px;">' + (error || 'Erro desconhecido') + '</p>';
    errorHtml += '  <button type="button" id="' + debugBtnId + '" class="btn btn-sm btn-danger" title="Ver detalhes do erro">';
    errorHtml += '    <i class="glyphicon glyphicon-bug"></i> Debug';
    errorHtml += '  </button>';
    errorHtml += '</div>';

    $body.html(errorHtml);

    // Evento para abrir modal com erro completo
    $('#' + debugBtnId).on('click', function () {
        openContainerItemErrorModal(containerItemStamp, error, errorDetails);
    });
}

function openContainerItemErrorModal(containerItemStamp, error, errorDetails) {
    var errorDetailsHtml = '<pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto; font-size: 12px; color: #d63031;">';
    errorDetailsHtml += 'ERRO:\n' + (error || 'Erro desconhecido') + '\n\n';
    if (errorDetails) {
        errorDetailsHtml += 'DETALHES:\n' + JSON.stringify(errorDetails, null, 2);
    }
    errorDetailsHtml += '</pre>';

    var modalData = {
        title: 'Erro ao Renderizar ContainerItem',
        id: 'modal-error-' + containerItemStamp,
        body: errorDetailsHtml,
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>'
    };

    // Remove modal anterior se existir
    $('#' + modalData.id).remove();

    // Gera HTML do modal usando função do CUSTOM FORM.js
    var modalHTML = generateModalHTML(modalData);
    $('body').append(modalHTML);

    // Abre modal
    $('#' + modalData.id).modal('show');
}

function checkAndIndicateSourceErrors(containerItem) {
    if (!containerItem) return;

    var containerItemStamp = containerItem.mdashcontaineritemstamp;
    var sourceErrors = [];

    // Procura objetos que usam fontes
    var itemObjects = window.appState && window.appState.containerItemObjects ?
        window.appState.containerItemObjects.filter(function (obj) {
            return obj.mdashcontaineritemstamp === containerItemStamp;
        }) : [];

    itemObjects.forEach(function (itemObj) {
        if (itemObj.fontestamp) {
            var fonte = window.appState && window.appState.fontes ?
                window.appState.fontes.find(function (f) { return f.mdashfontestamp === itemObj.fontestamp; }) : null;

            if (fonte && fonte.status === 'error') {
                sourceErrors.push({
                    codigo: fonte.codigo,
                    message: fonte.errorMessage || 'Erro desconhecido'
                });
            }
        }
    });

    // Se houver erros, adiciona badge
    if (sourceErrors.length > 0) {
        addSourceErrorBadgeToContainerItem(containerItemStamp, sourceErrors);
    }
}

function addSourceErrorBadgeToContainerItem(containerItemStamp, sourceErrors) {
    var containerSelector = ".mdash-canvas-item[data-stamp='" + containerItemStamp + "']";
    var $container = $(containerSelector);
    if (!$container.length) return;

    var badgeId = 'source-error-badge-' + containerItemStamp;

    // Remove badge anterior se existir
    $('#' + badgeId).remove();

    var errorMessages = sourceErrors.map(function (err) {
        return err.codigo + ': ' + err.message;
    }).join('\n');

    var badgeHtml = '';
    badgeHtml += '<div id="' + badgeId + '" class="mdash-source-error-badge" title="Erro ao carregar dados. Clique para ver detalhes">';
    badgeHtml += '  <i class="glyphicon glyphicon-warning-sign"></i>';
    badgeHtml += '  <span class="badge-text">Dados desatualizados</span>';
    badgeHtml += '</div>';

    $container.prepend(badgeHtml);

    // Evento para abrir modal com erro das fontes
    $('#' + badgeId).on('click', function () {
        openSourceErrorModal(containerItemStamp, sourceErrors);
    });
}

function openSourceErrorModal(containerItemStamp, sourceErrors) {
    var errorHtml = '<div style="max-height: 400px; overflow-y: auto;">';

    errorHtml += '<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ffc107;">';
    errorHtml += '  <strong style="color: #856404;">⚠️ Aviso:</strong>';
    errorHtml += '  <p style="margin: 8px 0 0 0; color: #856404; font-size: 13px;">Os dados exibidos podem estar desatualizados. Houve erro ao carregar as fontes de dados:</p>';
    errorHtml += '</div>';

    sourceErrors.forEach(function (err, idx) {
        errorHtml += '<div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #dc3545;">';
        errorHtml += '  <strong style="color: #d63031; font-size: 13px;">' + (idx + 1) + '. ' + err.codigo + '</strong>';
        errorHtml += '  <pre style="background: #fff; padding: 10px; border-radius: 4px; font-size: 11px; color: #d63031; margin: 8px 0 0 0; overflow-x: auto;">' + err.message + '</pre>';
        errorHtml += '</div>';
    });

    errorHtml += '</div>';

    var modalData = {
        title: 'Erro nas Fontes de Dados',
        id: 'modal-source-error-' + containerItemStamp,
        body: errorHtml,
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>'
    };

    // Remove modal anterior se existir
    $('#' + modalData.id).remove();

    var modalHTML = generateModalHTML(modalData);
    $('body').append(modalHTML);
    $('#' + modalData.id).modal('show');
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
    this.mdashtabstamp = normalizeMdashFilterTabStampField(data.mdashtabstamp || '');
    this.ordem = data.ordem || (maxOrdem + 1);
    this.localsource = "GMDashFilters";
    this.idfield = "mdashfilterstamp";
    this.table = "MdashFilter";
}

/**
 * Lista de stamps de separadores associados a um filtro (escopo tab).
 * Aceita string CSV legada ou valor único.
 */
function parseMdashFilterTabStamps(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map(function (v) { return String(v || '').trim(); }).filter(Boolean);
    }
    return String(value)
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
}

function joinMdashFilterTabStamps(stamps) {
    if (!stamps || !stamps.length) return '';
    var seen = {};
    var out = [];
    stamps.forEach(function (st) {
        var v = String(st || '').trim();
        if (!v || seen[v]) return;
        seen[v] = true;
        out.push(v);
    });
    return out.join(',');
}

function normalizeMdashFilterTabStampField(value) {
    return joinMdashFilterTabStamps(parseMdashFilterTabStamps(value));
}

function mdashFilterAppliesToTab(filter, activeTabStamp) {
    if (!filter) return false;
    if ((filter.escopo || 'global') === 'global') return true;
    var active = String(activeTabStamp || '').trim();
    if (!active) return false;
    var stamps = parseMdashFilterTabStamps(filter.mdashtabstamp);
    if (!stamps.length) return false;
    return stamps.indexOf(active) !== -1;
}

function getMdashFilterTabOptions() {
    return (GMDashTabs || []).slice().sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    }).map(function (t) {
        return { option: t.titulo || t.mdashtabstamp, value: t.mdashtabstamp };
    });
}

function getMdashFilterScopeSummary(filter, tabs) {
    if (!filter || (filter.escopo || 'global') === 'global') return 'Global';
    var stamps = parseMdashFilterTabStamps(filter.mdashtabstamp);
    if (!stamps.length) return 'Separadores (nenhum)';
    tabs = tabs || GMDashTabs || (window.appState && window.appState.tabs) || [];
    return stamps.map(function (st) {
        var tab = tabs.find(function (t) { return t.mdashtabstamp === st; });
        return (tab && tab.titulo) ? String(tab.titulo).trim() : st;
    }).join(', ');
}

function initFilterTabScopeMultiselect(filter) {
    var $sel = $('#mdash-filter-edit-modal #mdashtabstamp');
    if (!$sel.length || typeof $.fn.select2 !== 'function') return;
    if ($sel.data('select2')) {
        try { $sel.select2('destroy'); } catch (e) { /* ignore */ }
    }
    $sel.select2({
        width: '100%',
        placeholder: 'Selecione um ou mais separadores',
        allowClear: true,
        closeOnSelect: false
    });
    var escopo = (filter.escopo || 'global');
    var stamps = parseMdashFilterTabStamps(filter.mdashtabstamp);
    if (escopo === 'tab' && !stamps.length && window.appState && window.appState.activeTabStamp) {
        stamps = [window.appState.activeTabStamp];
        filter.mdashtabstamp = joinMdashFilterTabStamps(stamps);
    }
    $sel.val(stamps).trigger('change.select2');
    $sel.prop('disabled', escopo !== 'tab');
    $sel.off('change.mdashFilterTabScope').on('change.mdashFilterTabScope', function () {
        if (!window.__mdashFilterModalVm) return;
        window.__mdashFilterModalVm.syncFilterTabScopeFromSelect();
        window.__mdashFilterModalVm.handleChangeFilter();
    });
}

window.parseMdashFilterTabStamps = parseMdashFilterTabStamps;
window.joinMdashFilterTabStamps = joinMdashFilterTabStamps;
window.normalizeMdashFilterTabStampField = normalizeMdashFilterTabStampField;
window.mdashFilterAppliesToTab = mdashFilterAppliesToTab;
window.getMdashFilterScopeSummary = getMdashFilterScopeSummary;

function MdashAccess(data) {
    var maxOrdem = 0;
    if (Array.isArray(GMDashAccesses) && GMDashAccesses.length > 0) {
        maxOrdem = GMDashAccesses.reduce(function (max, item) {
            return Math.max(max, item.ordem || 0);
        }, 0);
    }

    this.mdashaccessstamp = data.mdashaccessstamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "";
    this.nome = data.nome || data.descricao || "";
    this.descricao = data.descricao || data.nome || "";
    this.origem = (data.origem || "phc").toLowerCase();
    this.escopo = data.escopo || "global";
    this.mdashtabstamp = data.mdashtabstamp || "";
    this.pfstamp = data.pfstamp || "";
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = !!data.inactivo;
    this.localsource = "GMDashAccesses";
    this.idfield = "mdashaccessstamp";
    this.table = "MdashAccess";
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
    var tabOptions = getMdashFilterTabOptions();

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
                { option: "Por separador", value: "tab" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 12,
            campo: "mdashtabstamp",
            tipo: "multiselect",
            titulo: "Separadores",
            fieldToOption: "option",
            contentType: "multiselect",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm mdash-filter-tab-multiselect",
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

function getMdashAccessUIObjectFormConfigAndSourceValues() {
    var tabOptions = [{ option: 'Todo o dashboard', value: '' }];
    (GMDashTabs || []).slice().sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); }).forEach(function (t) {
        tabOptions.push({ option: t.titulo || t.mdashtabstamp, value: t.mdashtabstamp });
    });

    var objectsUIFormConfig = [
        new UIObjectFormConfig({
            colSize: 4,
            campo: "origem",
            tipo: "select",
            titulo: "Origem do acesso",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: [
                { option: "PHC", value: "phc" },
                { option: "Nativo", value: "nativo" }
            ]
        }),
        new UIObjectFormConfig({
            colSize: 4,
            campo: "codigo",
            tipo: "text",
            titulo: "Código",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 4,
            campo: "pfstamp",
            tipo: "text",
            titulo: "Stamp PHC",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 8,
            campo: "nome",
            tipo: "text",
            titulo: "Nome do acesso",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        }),
        new UIObjectFormConfig({
            colSize: 4,
            campo: "escopo",
            tipo: "select",
            titulo: "Aplicar em",
            fieldToOption: "option",
            contentType: "select",
            fieldToValue: "value",
            classes: "form-control input-source-form input-sm",
            selectValues: [
                { option: "Todo o dashboard", value: "global" },
                { option: "Separador específico", value: "tab" }
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
        new UIObjectFormConfig({
            colSize: 6,
            campo: "descricao",
            tipo: "text",
            titulo: "Descrição",
            classes: "form-control input-source-form input-sm",
            contentType: "input"
        })
    ];

    return { objectsUIFormConfig: objectsUIFormConfig, localsource: "GMDashAccesses", idField: "mdashaccessstamp" };
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
    this.lastMeasuredHeight = parseInt(data.lastMeasuredHeight, 10) || 0;
    this._pendingFetchPromise = null;
    this._pendingFetchKey = "";
    // -- Configuração dos slots (JSON persistido na BD) --
    this.slotsconfigjson = data.slotsconfigjson || '[]';
    this.slotsconfig = []; // array de MdashSlot — preenchido pelo initSlotsConfig()
    // -- Acções / eventos do item (modal, navegação, refresh, expressão JS) --
    this.eventsconfigjson = data.eventsconfigjson || '{}';
    // -- Propriedades dinâmicas do layout (valores por item) --
    this.layoutpropsjson = data.layoutpropsjson || '{}';
    this.layoutprops = {};
    this.localsource = "GMDashContainerItems";
    this.idfield = "mdashcontaineritemstamp";
    this.table = "MdashContainerItem";

    // Inicializar slots a partir do JSON persistido
    this.initSlotsConfig();
    this.initLayoutProps();
}

/**
 * Inicializa this.layoutprops a partir do schema do layout + JSON persistido.
 */
MdashContainerItem.prototype.initLayoutProps = function () {
    var schema = getLayoutPropsSchemaForItem(this);
    var saved = forceJSONParse(this.layoutpropsjson, {});
    var typeRegistry = getMdashLayoutPropTypeRegistry();
    var merged = {};

    schema.forEach(function (propDef) {
        if (!propDef || !propDef.id) return;
        var typeMeta = typeRegistry[propDef.type] || {};
        var fallback = propDef.default !== undefined ? propDef.default : typeMeta.defaultValue;
        merged[propDef.id] = saved.hasOwnProperty(propDef.id) ? saved[propDef.id] : fallback;
    });

    this.layoutprops = merged;
};

MdashContainerItem.prototype.stringifyLayoutProps = function () {
    this.layoutpropsjson = JSON.stringify(this.layoutprops || {});
};

MdashContainerItem.prototype.setLayoutPropValue = function (propId, value, isExpression) {
    if (!this.layoutprops) this.layoutprops = {};
    if (isExpression) {
        this.layoutprops[propId] = { expr: true, v: value };
    } else {
        this.layoutprops[propId] = value;
    }
    this.stringifyLayoutProps();
};

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

function getDefaultMdashItemEventsConfig() {
    return {
        version: 1,
        overlayLayout: {
            mode: 'grid',
            templatelayout: '',
            layoutmode: 'auto'
        },
        overlayPlaces: [],
        interactions: [{
            id: 'primary',
            enabled: false,
            trigger: 'click',
            behavior: 'openModal',
            modalTitle: '',
            buttonLabel: 'Ver detalhes',
            buttonIcon: 'glyphicon-search',
            url: '',
            expressaojs: ''
        }]
    };
}

MdashContainerItem.prototype.parseEventsConfig = function () {
    var parsed = forceJSONParse(this.eventsconfigjson, null);
    if (!parsed || typeof parsed !== 'object') {
        return getDefaultMdashItemEventsConfig();
    }
    if (!Array.isArray(parsed.interactions) || !parsed.interactions.length) {
        parsed.interactions = getDefaultMdashItemEventsConfig().interactions;
    }
    if (!parsed.overlayLayout) {
        parsed.overlayLayout = getDefaultMdashItemEventsConfig().overlayLayout;
    }
    if (!Array.isArray(parsed.overlayPlaces)) {
        parsed.overlayPlaces = [];
    }
    return parsed;
};

MdashContainerItem.prototype.getEventsConfig = function () {
    return this.parseEventsConfig();
};

MdashContainerItem.prototype.setEventsConfig = function (config) {
    this.eventsconfigjson = JSON.stringify(config || getDefaultMdashItemEventsConfig());
};

MdashContainerItem.prototype.stringifyEventsConfig = function () {
    if (this._eventsConfigCache) {
        this.eventsconfigjson = JSON.stringify(this._eventsConfigCache);
    }
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
 *
 * DEFENSIVO: recupera transformConfig de QUALQUER uma das 3 localizações
 * (root canónico, config embebido, ou parse do JSON string) antes de
 * serializar. Garante que nunca se grava o literal "null" (que ao recarregar
 * faria JSON.parse devolver null e apagar a transformação).
 *
 * Invariante triplicada após esta função:
 *   this.transformConfig            → objecto JS ou null
 *   this.transformconfigjson        → string JSON do objecto, ou "" se nulo
 *   this.config.transformConfig     → mesma referência que root
 */
MdashContainerItemObject.prototype.stringifyJSONFields = function () {
    // Recuperar tc de qualquer localização disponível (root → config → json)
    var tc = this.transformConfig
        || (this.config && this.config.transformConfig)
        || null;
    if (!tc && this.transformconfigjson) {
        try {
            var parsed = JSON.parse(this.transformconfigjson);
            if (parsed && typeof parsed === 'object') tc = parsed;
        } catch (e) { /* string inválida — ignorar */ }
    }

    // DEBUG: Log antes da sincronização
    console.log('[stringifyJSONFields] ANTES:', {
        'obj.transformConfig': this.transformConfig ? 'EXISTS' : 'null',
        'obj.config.transformConfig': (this.config && this.config.transformConfig) ? 'EXISTS' : 'null',
        'obj.transformconfigjson': this.transformconfigjson ? (this.transformconfigjson.length + ' chars') : 'empty/null',
        'tc recuperado': tc ? 'EXISTS' : 'null'
    });

    // Replicar para as 3 localizações (INVARIANTE TRIPLICADA)
    this.transformConfig = tc || null;
    this.transformconfigjson = tc ? JSON.stringify(tc) : ''; // "" em vez de "null" — evita parse(null)
    this.config = this.config || {};

    // CRÍTICO: Sempre sincronizar config.transformConfig (adicionar OU remover)
    if (tc) {
        this.config.transformConfig = tc;
    } else {
        // Se não há transformConfig, remover completamente de config para evitar fantasmas
        delete this.config.transformConfig;
    }

    this.fontesstampsjson = JSON.stringify(this.fontesstamps || []);
    this.configjson = JSON.stringify(this.config || {});

    // DEBUG: Log após a sincronização
    console.log('[stringifyJSONFields] DEPOIS:', {
        'obj.transformConfig': this.transformConfig ? 'EXISTS' : 'null',
        'obj.config.transformConfig': this.config.transformConfig ? 'EXISTS' : 'null',
        'obj.transformconfigjson': this.transformconfigjson ? (this.transformconfigjson.length + ' chars') : 'empty',
        'obj.configjson': this.configjson ? (this.configjson.length + ' chars') : 'empty'
    });
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
    var _legacy = {
        'gráfico': 'chart', 'grafico': 'chart', 'pie': 'pie', 'pizza': 'pie',
        'tabela': 'table', 'texto': 'text', 'customcode': 'customCode',
        'detail': 'detail', 'detalhe': 'detail',
        'overlay': 'overlay', 'modal': 'overlay',
        'kpi': 'badge',
        'progressbar': 'progress', 'barraprogresso': 'progress'
    };
    var normalized = _legacy[tipoStr.toLowerCase()];
    if (normalized) tipoStr = normalized;

    if (typeof getTiposObjectoConfig !== 'function') {
        console.error('[MDash DEBUG] getMdashObjectTypeEntry: getTiposObjectoConfig NÃO EXISTE — a extensão não está carregada. tipo="' + tipoStr + '"');
        return null;
    }
    var allTypes = getTiposObjectoConfig();
    var entry = allTypes.find(function (t) { return t.tipo === tipoStr; }) || null;
    if (!entry) {
        console.error('[MDash DEBUG] getMdashObjectTypeEntry: tipo="' + tipoStr + '" NÃO ENCONTRADO. Tipos registados: [' + allTypes.map(function (t) { return t.tipo; }).join(', ') + ']');
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

    try {
        var tipoStr = '' + (self.tipo || '');

        var entry = getMdashObjectTypeEntry(tipoStr);


        if (entry && typeof entry.renderObject === 'function') {
            var processaFonte = (entry.processaFonte !== undefined) ? entry.processaFonte : self.processaFonte;
            // Resolver dados através da função central (transform ? fonte ? containerItem.records)
            var resolved = mdashResolveObjectData(self, containerItem.records);

            // Verifica se há erros críticos nas dependências
            var hasCriticalErrors = resolved.analyzer && resolved.analyzer.getCriticalIssues().length > 0;

            if (hasCriticalErrors) {
                // Bloqueia renderização se há erros críticos nas fontes
                var criticalIssues = resolved.analyzer.getCriticalIssues();
                console.error('[RenderObjectByContainerItem] BLOQUEADO - Erros críticos nas dependências:', criticalIssues);
                console.error('[RenderObjectByContainerItem] ContainerItem Stamp:', containerItem.mdashcontaineritemstamp);
                console.error('[RenderObjectByContainerItem] Seletor DOM:', ".mdash-canvas-item[data-stamp='" + containerItem.mdashcontaineritemstamp + "'] .mdash-canvas-item-body");
                console.groupEnd();

                // Usa função universal que funciona em qualquer contexto
                renderUniversalSourceError(containerSelector, criticalIssues);
                return;
            }

            var hasSource = mdashObjectHasDataSource(self);
            var podeRenderizar = processaFonte === false || resolved.data.length > 0 || hasSource;
            // console.log('  processaFonte =', processaFonte, '| podeRenderizar =', podeRenderizar, '| data.length =', resolved.data.length);
            if (podeRenderizar) {

                console.groupEnd();
                try {
                    entry.renderObject({
                        containerSelector: containerSelector,
                        itemObject: self,
                        queryConfig: self.queryConfig,
                        config: self.config,
                        transformConfig: self.transformConfig,
                        containerItem: containerItem,
                        data: resolved.data,
                        isSample: false,
                        isEditor: mdashIsEditorMode()
                    });
                } catch (renderError) {
                    console.error('[RenderObject] Erro ao renderizar objeto:', renderError);
                    var containerItemStamp = self.mdashcontaineritemobjectstamp;
                    showContainerItemError(containerItemStamp, renderError.message, renderError);
                }
            } else if (typeof entry.getSampleData === 'function' && typeof mdashIsEditorMode === 'function' && mdashIsEditorMode()) {
                // Sem fonte configurada — preview com dados de amostra apenas no editor

                try {
                    entry.renderObject({
                        containerSelector: containerSelector,
                        itemObject: self,
                        queryConfig: self.queryConfig,
                        config: self.config,
                        transformConfig: self.transformConfig,
                        containerItem: containerItem,
                        data: entry.getSampleData(),
                        isSample: true,
                        isEditor: mdashIsEditorMode()
                    });
                } catch (renderError) {
                    console.error('[RenderObject] Erro ao renderizar objeto com dados de amostra:', renderError);
                    var containerItemStamp = self.mdashcontaineritemobjectstamp;
                    showContainerItemError(containerItemStamp, renderError.message, renderError);
                }
            } else {
                try {
                    entry.renderObject({
                        containerSelector: containerSelector,
                        itemObject: self,
                        queryConfig: self.queryConfig,
                        config: self.config,
                        transformConfig: self.transformConfig,
                        containerItem: containerItem,
                        data: [],
                        isSample: false,
                        isEditor: typeof mdashIsEditorMode === 'function' ? mdashIsEditorMode() : false
                    });
                } catch (renderError) {
                    console.error('[RenderObject] Erro ao renderizar objeto vazio:', renderError);
                    var containerItemStampEmpty = self.mdashcontaineritemobjectstamp;
                    showContainerItemError(containerItemStampEmpty, renderError.message, renderError);
                }
            }
        } else {
            console.error('  ? WARNING ICON — entry null ou sem renderObject');
            console.groupEnd();
            $(containerSelector).html(
                '<div class="mdash-slot-zone-render-placeholder" style="color:#c0392b;"><i class="glyphicon glyphicon-warning-sign"></i> ' + (tipoStr || '?') + '</div>'
            );
        }

    } catch (outerError) {
        console.error('[renderObjectByContainerItem] Erro geral ao renderizar:', outerError);
        showContainerItemError(self.mdashcontaineritemobjectstamp, outerError.message, outerError);
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
// ============================================================================
// DEPENDENCY RESOLUTION SYSTEM - Sistema Centralizado de Gerenciamento de Dependências
//
// Responsável por:
//   1. Analisar todas as fontes que um objeto depende
//   2. Verificar status de cada fonte (loaded, error, pending)
//   3. Determinar se objeto pode ser renderizado
//   4. Fornecer informações detalhadas sobre erros
//
// Extensível para: gráficos, tabelas, textos, imagens e futuros tipos
// ============================================================================

function MdashObjectDependencyAnalyzer(obj) {
    this.object = obj;
    this.dependencies = {
        primary: null,           // fontestamp principal
        transform: null,         // sourceTable da transformação
        secondary: [],           // fontesstamps adicionais
    };
    this.issues = [];            // Erros e avisos
    this.canRender = true;       // Flag se pode ser renderizado
    this.initialize();
}

MdashObjectDependencyAnalyzer.prototype.initialize = function () {
    var self = this;
    var allFontes = (window.appState && window.appState.fontes) || GMDashFontes || [];

    // Analisa fonte primária
    if (self.object && self.object.fontestamp) {
        var primaryFonte = allFontes.find(function (f) {
            return f.mdashfontestamp === self.object.fontestamp;
        });
        self.dependencies.primary = {
            stamp: self.object.fontestamp,
            codigo: primaryFonte ? primaryFonte.codigo : 'DESCONHECIDA',
            fonte: primaryFonte,
            status: primaryFonte ? primaryFonte.status : 'missing'
        };
    }

    // Analisa transformação (sourceTable)
    if (self.object && self.object.transformConfig && self.object.transformConfig.sourceTable) {
        self.dependencies.transform = {
            sourceTable: self.object.transformConfig.sourceTable,
            status: 'pending' // Será validada ao executar
        };
    }

    // Analisa fontes secundárias
    if (self.object && Array.isArray(self.object.fontesstamps)) {
        self.object.fontesstamps.forEach(function (stamp) {
            var fonte = allFontes.find(function (f) {
                return f.mdashfontestamp === stamp;
            });
            self.dependencies.secondary.push({
                stamp: stamp,
                codigo: fonte ? fonte.codigo : 'DESCONHECIDA',
                fonte: fonte,
                status: fonte ? fonte.status : 'missing'
            });
        });
    }

    // Valida dependências
    self.validate();
};

MdashObjectDependencyAnalyzer.prototype.validate = function () {
    var self = this;

    // Verifica fonte primária
    if (self.dependencies.primary) {
        var primary = self.dependencies.primary;
        if (primary.status === 'error') {
            self.issues.push({
                severity: 'critical',
                type: 'source_error',
                source: primary.codigo,
                message: primary.fonte ? primary.fonte.errorMessage : 'Erro ao carregar fonte'
            });
            self.canRender = false;
        } else if (primary.status === 'missing') {
            self.issues.push({
                severity: 'critical',
                type: 'source_missing',
                source: primary.codigo,
                message: 'Fonte primária não encontrada'
            });
            self.canRender = false;
        } else if (primary.status === 'pending') {
            self.issues.push({
                severity: 'warning',
                type: 'source_loading',
                source: primary.codigo,
                message: 'Fonte ainda está carregando'
            });
        }
    }

    // Verifica fontes secundárias
    self.dependencies.secondary.forEach(function (sec) {
        if (sec.status === 'error') {
            self.issues.push({
                severity: 'critical',
                type: 'source_error',
                source: sec.codigo,
                message: sec.fonte ? sec.fonte.errorMessage : 'Erro ao carregar fonte'
            });
            self.canRender = false;
        } else if (sec.status === 'missing') {
            self.issues.push({
                severity: 'warning',
                type: 'source_missing',
                source: sec.codigo,
                message: 'Fonte secundária não encontrada'
            });
        }
    });
};

MdashObjectDependencyAnalyzer.prototype.getIssues = function (severity) {
    if (!severity) return this.issues;
    return this.issues.filter(function (issue) {
        return issue.severity === severity;
    });
};

MdashObjectDependencyAnalyzer.prototype.getCriticalIssues = function () {
    return this.getIssues('critical');
};

MdashObjectDependencyAnalyzer.prototype.getWarnings = function () {
    return this.getIssues('warning');
};

// ============================================================================
// mdashResolveObjectData
// Função central de resolução de dados para qualquer MdashContainerItemObject.
// Hierarquia:
//   1. obj.transformConfig + sourceTable  ? MdashTransformBuilder.executeRaw()
//      (garante tabelas adicionais de fontesstamps em SQLite antes de correr)
//   2. obj.fontestamp                     ? fonte.lastResults (dados em memória)
//   3. fallbackData                       ? containerItem.records (legado)
// Retorna: { data: Array, isSample: Boolean, analyzer: MdashObjectDependencyAnalyzer }
// ============================================================================
function mdashObjectHasDataSource(obj) {
    if (!obj) return false;
    if (obj.fontestamp) return true;
    var tc = obj.transformConfig || (obj.config && obj.config.transformConfig) || null;
    if (tc && tc.sourceTable) return true;
    if (Array.isArray(obj.fontesstamps) && obj.fontesstamps.length > 0) return true;
    if (obj.queryConfig && obj.queryConfig.generatedSQL) return true;
    return false;
}

function mdashResolveObjectData(obj, fallbackData) {
    var allFontes = (window.appState && window.appState.fontes) || GMDashFontes || [];

    // -- 1. Garantir que fontes adicionais (fontesstamps) estão no SQLite --
    if (obj && Array.isArray(obj.fontesstamps) && obj.fontesstamps.length > 0) {
        obj.fontesstamps.forEach(function (stamp) {
            var f = allFontes.filter(function (x) { return x.mdashfontestamp === stamp; })[0];
            if (f && f.lastResults && f.lastResults.length > 0 && typeof mdashLoadFonteIntoDb === 'function') {
                mdashLoadFonteIntoDb(f, f.lastResults);
            }
        });
    }

    // -- 2. transformConfig ? query sobre SQLite in-memory --
    var transformConfig = (obj && (obj.transformConfig || (obj.config && obj.config.transformConfig))) || null;
    if (transformConfig && transformConfig.sourceTable &&
        typeof MdashTransformBuilder !== 'undefined') {
        try {
            var raw = MdashTransformBuilder.executeRaw(transformConfig);
            if (!raw.error && raw.rows && raw.columns) {
                if (raw.rows.length > 0) {
                    var rows = raw.rows.map(function (r) {
                        var o = {};
                        raw.columns.forEach(function (c, i) { o[c] = r[i]; });
                        return o;
                    });
                    return { data: rows, isSample: false };
                }
                return { data: [], isSample: false };
            }
        } catch (e) {
            console.warn('[MDash] mdashResolveObjectData: erro no transform —', e.message);
        }
    }

    // Cria analisador de dependências
    var analyzer = new MdashObjectDependencyAnalyzer(obj);

    // -- 3. Fonte primária ? lastResults em memória --
    if (obj && obj.fontestamp) {
        var fonte = allFontes.filter(function (f) { return f.mdashfontestamp === obj.fontestamp; })[0];
        if (fonte) {
            return {
                data: fonte.lastResults || [],
                isSample: false,
                analyzer: analyzer,
                hasErrors: !analyzer.canRender
            };
        }
    }

    // -- 4. Fallback legado (containerItem.records) --
    var fd = fallbackData || [];
    return { data: fd, isSample: false, analyzer: analyzer, hasErrors: !analyzer.canRender };
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

    // -- Identidade --
    this.mdashfontestamp = data.mdashfontestamp || generateUUID();
    this.dashboardstamp = data.dashboardstamp || GMDashStamp;
    this.codigo = data.codigo || "Fonte" + gerarIdNumerico();
    this.descricao = data.descricao || 'Nova Fonte ' + (data.ordem || (maxOrdem + 1));
    this.ordem = data.ordem || (maxOrdem + 1);
    this.inactivo = data.inactivo || false;

    // -- Scope: a quem pertence esta fonte --
    this.scope = data.scope || 'global';           // 'global' | 'container' | 'containeritem' | 'object'
    this.scopestamp = data.scopestamp || '';         // stamp do owner (vazio = global)

    // -- Tipo de fonte --
    this.tipo = data.tipo || 'directquery';         // 'directquery' | 'javascript' | 'api' | 'stored'

    // -- DirectQuery --
    this.expressaolistagem = data.expressaolistagem || '';
    this.urlfetch = data.urlfetch || '../programs/gensel.aspx?cscript=getdbcontaineritemdata';

    // -- JavaScript --
    this.expressaojslistagem = data.expressaojslistagem || '';

    // -- API (preparado para futuro) --
    this.apiurl = data.apiurl || '';
    this.apimethod = data.apimethod || 'GET';
    this.apiheadersjson = data.apiheadersjson || '{}';
    this.apibodyjson = data.apibodyjson || '{}';

    // -- Schema --
    this.schemamode = data.schemamode || 'auto';    // 'auto' | 'manual'
    this.schemajson = data.schemajson || '[]';
    this.schema = forceJSONParse(this.schemajson, []);

    // -- Parâmetros dinâmicos --
    this.parametrosjson = data.parametrosjson || '[]';
    this.parametros = forceJSONParse(this.parametrosjson, []);

    // -- Refresh --
    this.refreshmode = data.refreshmode || 'onload';  // 'onload' | 'onfilterchange' | 'manual' | 'interval'
    this.refreshintervalsec = data.refreshintervalsec || 0;

    // -- Cache/Resultados --
    this.lastResultscached = data.lastResultscached || '[]';
    this.lastResults = forceJSONParse(this.lastResultscached, []);
    this.lastexecuted = data.lastexecuted || null;

    // -- Runtime (não persistido) --
    this.apiheaders = forceJSONParse(this.apiheadersjson, {});
    this.apibody = forceJSONParse(this.apibodyjson, {});
    this.status = 'idle';                           // 'idle' | 'loading' | 'loaded' | 'error'
    this.errorMessage = '';

    // -- Metadata CRUD --
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
        mdashfontestamp: this.mdashfontestamp,
        dashboardstamp: this.dashboardstamp,
        codigo: this.codigo,
        descricao: this.descricao,
        ordem: this.ordem,
        inactivo: this.inactivo ? 1 : 0,
        scope: this.scope,
        scopestamp: this.scopestamp,
        tipo: this.tipo,
        expressaolistagem: this.expressaolistagem,
        urlfetch: this.urlfetch,
        expressaojslistagem: this.expressaojslistagem,
        apiurl: this.apiurl,
        apimethod: this.apimethod,
        apiheadersjson: this.apiheadersjson,
        apibodyjson: this.apibodyjson,
        schemamode: this.schemamode,
        schemajson: this.schemajson,
        parametrosjson: this.parametrosjson,
        refreshmode: this.refreshmode,
        refreshintervalsec: this.refreshintervalsec,
        lastResultscached: this.lastResultscached,
        lastexecuted: (function (d) {
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
                self.lastResults = Array.isArray(rows) ? rows : [];
                self.lastexecuted = new Date().toISOString().slice(0, 19).replace('T', ' ');
                self.status = 'loaded';
                if (self.schemamode === 'auto' && self.lastResults.length > 0) {
                    self.schema = self.extractSchemaFromResults();
                }
                if (typeof mdashEnsureFonteInDb === 'function') {
                    mdashEnsureFonteInDb(self);
                } else if (self.lastResults.length > 0 && typeof mdashLoadFonteIntoDb === 'function') {
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
                self.lastResults = response.data || [];
                self.lastexecuted = new Date().toISOString().slice(0, 19).replace('T', ' ');
                self.status = 'loaded';
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

    // -- Propriedades editáveis pelo utilizador --
    this.config = data.config || {};
    // config pode conter: { cssClass, inlineStyle, minHeight, maxHeight, overflow, background, padding, hidden }
}

/**
 * Devolve as propriedades editáveis e os seus defaults.
 * Usado para gerar o formulário de propriedades do slot.
 */
MdashSlot.getEditableProperties = function () {
    return [
        { field: "cssClass", title: "Classes CSS", type: "text", defaultValue: "" },
        { field: "inlineStyle", title: "Estilo Inline", type: "text", defaultValue: "" },
        { field: "minHeight", title: "Altura Mínima", type: "text", defaultValue: "" },
        { field: "maxHeight", title: "Altura Máxima", type: "text", defaultValue: "" },
        { field: "overflow", title: "Overflow", type: "select", defaultValue: "visible", options: ["visible", "hidden", "auto", "scroll"] },
        { field: "background", title: "Fundo", type: "color", defaultValue: "" },
        { field: "padding", title: "Padding", type: "text", defaultValue: "" }
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
    if (c.cssClass) $el.addClass(c.cssClass);
    if (c.inlineStyle) $el.attr('style', ($el.attr('style') || '') + ';' + c.inlineStyle);
    if (c.minHeight) $el.css('min-height', c.minHeight);
    if (c.maxHeight) $el.css('max-height', c.maxHeight);
    if (c.overflow) $el.css('overflow', c.overflow);
    if (c.background) $el.css('background', c.background);
    if (c.padding) $el.css('padding', c.padding);
};

// ============================================================================
// LAYOUT PROPS — tipos dinâmicos, behaviors e runtime
// ============================================================================
// O designer define propriedades (só tipo + label + default) e behaviors no
// Layout Builder. No editor, ao seleccionar um item com esse layout, aparecem
// os campos correspondentes. Em runtime os behaviors aplicam o valor resolvido.

function getMdashLayoutPropTypeRegistry() {
    var registry = {};
    registry['color'] = { label: 'Cor', editor: 'color', defaultValue: 'var(--md-primary)' };
    registry['text'] = { label: 'Texto', editor: 'text', defaultValue: '' };
    registry['number'] = { label: 'Número', editor: 'number', defaultValue: 0 };
    registry['boolean'] = { label: 'Booleano', editor: 'checkbox', defaultValue: false };
    registry['icon'] = { label: 'Ícone', editor: 'icon', defaultValue: 'star' };
    registry['select'] = { label: 'Selecção', editor: 'select', defaultValue: '' };
    return registry;
}

/** Cores do tema MDash + tokens PHC para propriedades de layout tipo cor */
function getMdashLayoutThemeColorOptions() {
    return [
        { value: 'var(--md-primary)', label: 'Principal' },
        { value: 'var(--md-surface)', label: 'Superfície' },
        { value: 'var(--md-bg)', label: 'Fundo' },
        { value: 'var(--md-text)', label: 'Texto' },
        { value: 'var(--md-muted)', label: 'Secundário' },
        { value: 'var(--md-border)', label: 'Borda' },
        { value: 'primary', label: 'PHC Primary' },
        { value: 'success', label: 'PHC Success' },
        { value: 'info', label: 'PHC Info' },
        { value: 'warning', label: 'PHC Warning' },
        { value: 'danger', label: 'PHC Danger' },
        { value: 'default', label: 'PHC Default' }
    ];
}
window.getMdashLayoutThemeColorOptions = getMdashLayoutThemeColorOptions;

function mdashResolveColorValue(val) {
    if (val == null || val === '') return val;
    var s = String(val);
    if (s.charAt(0) === '#' || s.indexOf('rgb') === 0 || s.indexOf('hsl') === 0) return s;
    if (s.indexOf('var(') === 0) {
        var tokens = typeof getMdashThemeTokens === 'function' ? getMdashThemeTokens() : {};
        if (s === 'var(--md-primary)') return tokens.primary || '#2563eb';
        if (s === 'var(--md-surface)') return tokens.surface || '#ffffff';
        if (s === 'var(--md-bg)') return tokens.bg || '#f3f6fb';
        if (s === 'var(--md-text)') return tokens.text || '#1f2937';
        if (s === 'var(--md-muted)') return tokens.muted || '#64748b';
        if (s === 'var(--md-border)') return tokens.border || 'rgba(15,23,42,0.08)';
        return s;
    }
    try {
        if (typeof getColorByType === 'function') {
            var c = getColorByType(s);
            if (c && c.background) return c.background;
        }
    } catch (e) { /* fallback */ }
    return s;
}
window.mdashResolveColorValue = mdashResolveColorValue;

function mdashResolveLayoutColorForCss(val) {
    if (val == null || val === '') return val;
    var s = String(val);
    if (s.indexOf('var(') === 0) return s;
    return mdashResolveColorValue(val);
}

/**
 * Resolve tokens de tema {{...}} dentro do CSS de um layout (design tokens do PHC).
 * Whitelist (sem eval — seguro):
 *   {{primary}} {{warning}} {{success}} {{danger}} {{info}}  -> getColorByType(x).background
 *   {{primary.text}}                                          -> cor de texto do tema
 *   {{primary.rgb}}                                           -> "r,g,b" (para rgba()/gradientes)
 *   {{getColorByType("warning")}}  {{getColorByType('x').text}}
 *   {{self}} {{self.text}} {{self.rgb}}                       -> usa context.tipo (tipo do card)
 *   {{var(--md-primary)}}                                     -> passthrough da CSS var
 * Tokens não reconhecidos ficam intactos (com aviso na consola).
 *
 * Os tokens são guardados tal-e-qual na BD e resolvidos no render, por isso
 * acompanham automaticamente o tema PHC.
 */
function mdashResolveThemeTokensInCss(css, context) {
    if (!css || String(css).indexOf('{{') === -1) return css || '';
    context = context || {};
    var selfType = context.tipo || context.type || 'primary';

    function colorFor(type) {
        type = String(type || '').trim();
        if (type === 'self') type = selfType;
        if (!type) return null;
        try {
            if (typeof getCachedColor === 'function') return getCachedColor(type);
            if (typeof getColorByType === 'function') return getColorByType(type);
        } catch (e) { /* fallback */ }
        return null;
    }

    function resolve(type, part) {
        var c = colorFor(type);
        if (!c) return null;
        part = (part || 'background').toLowerCase();
        if (part === 'text' || part === 'color') return c.text || '';
        if (part === 'rgb') {
            var bg = c.background || '';
            return (typeof hexToRgb === 'function') ? hexToRgb(bg) : bg;
        }
        return c.background || '';
    }

    return String(css).replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (full, expr) {
        expr = String(expr).trim();
        if (/^var\(\s*--/.test(expr)) return expr;
        var m = expr.match(/^getColorByType\(\s*['"]([^'"]+)['"]\s*\)(?:\s*\.\s*(background|text|rgb|color))?$/i);
        if (m) { var r1 = resolve(m[1], m[2]); return r1 != null ? r1 : full; }
        var m2 = expr.match(/^([a-zA-Z_][\w-]*)(?:\s*\.\s*(background|text|rgb|color))?$/);
        if (m2) { var r2 = resolve(m2[1], m2[2]); return r2 != null ? r2 : full; }
        if (typeof console !== 'undefined' && console.warn) {
            console.warn('[MDash] token de tema não reconhecido no CSS: {{' + expr + '}}');
        }
        return full;
    });
}
window.mdashResolveThemeTokensInCss = mdashResolveThemeTokensInCss;

function mdashLayoutColorSwatchStyle(value) {
    var resolved = mdashResolveColorValue(value || '#cccccc');
    return 'background:' + resolved + ';';
}

function mdashIsCustomLayoutColorValue(value) {
    if (value == null || value === '') return true;
    var s = String(value);
    if (s.charAt(0) === '#') return true;
    if (s.indexOf('rgb') === 0 || s.indexOf('hsl') === 0) return true;
    var opts = getMdashLayoutThemeColorOptions();
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === s) return false;
    }
    return true;
}

function mdashLayoutColorPickerCustomHex(value) {
    if (typeof value === 'string' && value.charAt(0) === '#') return value;
    return '#3b82f6';
}

function buildMdashLayoutColorPickerHtml(value, inputId, includeThemeColors) {
    inputId = inputId || 'mdash-layout-color-value';
    value = value != null ? value : 'var(--md-primary)';
    if (includeThemeColors === undefined) includeThemeColors = true;
    var options = includeThemeColors ? getMdashLayoutThemeColorOptions() : [];
    var html = '<div class="mdash-layout-color-picker" data-color-input-id="' + inputId + '">';
    if (includeThemeColors) {
        html += '<div class="mdash-tab-editor-title" style="margin-bottom:4px;">Cores do tema</div>';
    }
    html += '<div class="mdash-tab-editor-colors">';
    var i;
    for (i = 0; i < options.length; i++) {
        var opt = options[i];
        var isOn = value === opt.value ? ' is-active' : '';
        html += '<button type="button" class="mdash-phc-color-option mdash-layout-theme-color' + isOn + '" data-theme-color="' + opt.value + '" style="' + mdashLayoutColorSwatchStyle(opt.value) + '" title="' + opt.label + '"></button>';
    }
    var customOn = mdashIsCustomLayoutColorValue(value) ? ' is-active' : '';
    var customHex = mdashLayoutColorPickerCustomHex(value);
    html += '<label class="mdash-phc-color-custom mdash-layout-custom-color' + customOn + '" style="' + mdashLayoutColorSwatchStyle(customHex) + '" title="Cor personalizada">';
    html += '<i class="glyphicon glyphicon-tint"></i>';
    html += '<input type="color" class="mdash-layout-color-native" value="' + customHex + '" />';
    html += '</label>';
    html += '</div>';
    html += '<input type="hidden" class="mdash-layout-color-value" id="' + inputId + '" value="' + value + '" />';
    html += '</div>';
    return html;
}

function bindMdashLayoutColorPicker($root, onChange) {
    if (!$root || !$root.length) return;
    $root.off('click.mdashLayoutColor', '.mdash-layout-theme-color');
    $root.on('click.mdashLayoutColor', '.mdash-layout-theme-color', function () {
        var val = $(this).data('theme-color');
        var $picker = $(this).closest('.mdash-layout-color-picker');
        $picker.find('.mdash-layout-theme-color, .mdash-layout-custom-color').removeClass('is-active');
        $(this).addClass('is-active');
        $picker.find('.mdash-layout-color-value').val(val).trigger('change');
        if (typeof onChange === 'function') onChange(val);
    });
    $root.off('input.mdashLayoutColor change.mdashLayoutColor', '.mdash-layout-color-native');
    $root.on('input.mdashLayoutColor change.mdashLayoutColor', '.mdash-layout-color-native', function () {
        var val = $(this).val();
        var $picker = $(this).closest('.mdash-layout-color-picker');
        $picker.find('.mdash-layout-theme-color, .mdash-layout-custom-color').removeClass('is-active');
        $picker.find('.mdash-layout-custom-color').addClass('is-active').css('background', val);
        $picker.find('.mdash-layout-color-value').val(val).trigger('change');
        if (typeof onChange === 'function') onChange(val);
    });
}
window.buildMdashLayoutColorPickerHtml = buildMdashLayoutColorPickerHtml;
window.bindMdashLayoutColorPicker = bindMdashLayoutColorPicker;

// ============================================================================
// Fontes de valor de propriedade (tema / classe / personalizada)
// ----------------------------------------------------------------------------
// A "fonte" é uma característica transversal a qualquer propriedade: o valor
// pode vir do tema PHC, de uma classe predefinida (variante) ou de um valor
// personalizado. Guardamos { src: 'theme'|'class'|'custom', value: '...' }.
// ============================================================================

/** Normaliza a config de fontes de uma propriedade (com retrocompat do legacy). */
function mdashGetPropSources(propDef) {
    propDef = propDef || {};
    var raw = propDef.sources;
    var classesOpts = [];
    var classPrefix = '';
    var themeOn, customOn, classesOn;

    if (raw && typeof raw === 'object') {
        // se theme existir como objecto respeita enabled, senão desligado
        themeOn = raw.theme ? (raw.theme.enabled !== false) : false;
        customOn = raw.custom ? (raw.custom.enabled !== false) : false;
        if (raw.classes) {
            classesOn = raw.classes.enabled !== false;
            classPrefix = raw.classes.classPrefix || '';
            classesOpts = Array.isArray(raw.classes.options) ? raw.classes.options : [];
        } else {
            classesOn = false;
        }
    } else {
        // Legacy: só existia includeThemeColors + custom para cor
        themeOn = propDef.includeThemeColors !== false;
        customOn = true;
        classesOn = false;
    }

    return {
        theme: { enabled: !!themeOn },
        classes: { enabled: !!classesOn, classPrefix: classPrefix, options: classesOpts },
        custom: { enabled: !!customOn }
    };
}
window.mdashGetPropSources = mdashGetPropSources;

/** Infere/normaliza o valor guardado de uma propriedade para { src, value }. */
function mdashGetPropSourceValue(stored, propDef) {
    var sources = mdashGetPropSources(propDef);

    // Já vem com fonte explícita
    if (stored && typeof stored === 'object' && !Array.isArray(stored) && stored.src) {
        return { src: stored.src, value: stored.value };
    }

    var value = stored;
    var def = propDef ? propDef.default : undefined;
    if (value === undefined || value === null || value === '') {
        if (def && typeof def === 'object' && def.src) return { src: def.src, value: def.value };
        value = def;
    }

    var s = value != null ? String(value) : '';

    // Corresponde a uma classe predefinida?
    if (sources.classes.enabled) {
        for (var i = 0; i < sources.classes.options.length; i++) {
            var ov = sources.classes.options[i] && sources.classes.options[i].value;
            if (ov != null && String(ov) === s) return { src: 'class', value: s };
        }
    }

    // Token de tema (var(...) ou nome de cor do tema)
    if (s.indexOf('var(') === 0) return { src: 'theme', value: s };
    if (typeof getMdashLayoutThemeColorOptions === 'function') {
        var topts = getMdashLayoutThemeColorOptions();
        for (var j = 0; j < topts.length; j++) {
            if (topts[j].value === s) return { src: 'theme', value: s };
        }
    }

    return { src: 'custom', value: s };
}
window.mdashGetPropSourceValue = mdashGetPropSourceValue;

function mdashSrcEscapeAttr(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Selector unificado de cor para o editor do dashboard.
 * Combina, numa única lista: cores do tema PHC, estilos predefinidos (classes)
 * e cor personalizada — conforme as fontes activadas na definição da propriedade.
 */
function buildMdashLayoutColorSourcePickerHtml(propDef, sv, inputId) {
    inputId = inputId || 'mdash-layout-src-value';
    var sources = mdashGetPropSources(propDef);
    sv = sv || { src: 'theme', value: 'var(--md-primary)' };

    var html = '<div class="mdash-layout-source-picker" data-source-input-id="' + inputId + '">';

    if (sources.theme.enabled) {
        html += '<div class="mdash-src-group-title">Cores do tema</div>';
        html += '<div class="mdash-src-swatches">';
        var opts = getMdashLayoutThemeColorOptions();
        for (var i = 0; i < opts.length; i++) {
            var onT = (sv.src === 'theme' && sv.value === opts[i].value) ? ' is-active' : '';
            html += '<button type="button" class="mdash-phc-color-option mdash-src-theme-opt' + onT + '" data-value="' + mdashSrcEscapeAttr(opts[i].value) + '" style="' + mdashLayoutColorSwatchStyle(opts[i].value) + '" title="' + mdashSrcEscapeAttr(opts[i].label) + '"></button>';
        }
        html += '</div>';
    }

    if (sources.classes.enabled && sources.classes.options.length) {
        html += '<div class="mdash-src-group-title">Estilos predefinidos</div>';
        html += '<div class="mdash-src-chips">';
        for (var j = 0; j < sources.classes.options.length; j++) {
            var o = sources.classes.options[j];
            var val = (o && o.value != null) ? o.value : '';
            var lbl = (o && o.label) ? o.label : val;
            var onC = (sv.src === 'class' && String(sv.value) === String(val)) ? ' is-active' : '';
            var dot = o && o.color ? ('background:' + o.color + ';') : '';
            html += '<button type="button" class="mdash-src-class-chip' + onC + '" data-value="' + mdashSrcEscapeAttr(val) + '" title="' + mdashSrcEscapeAttr(lbl) + '"><span class="mdash-src-chip-dot" style="' + dot + '"></span><span class="mdash-src-chip-lbl">' + mdashSrcEscapeAttr(lbl) + '</span></button>';
        }
        html += '</div>';
    }

    if (sources.custom.enabled) {
        html += '<div class="mdash-src-group-title">Personalizada</div>';
        html += '<div class="mdash-src-swatches">';
        var customHex = mdashLayoutColorPickerCustomHex(sv.src === 'custom' ? sv.value : '#3b82f6');
        var onCust = sv.src === 'custom' ? ' is-active' : '';
        html += '<label class="mdash-phc-color-custom mdash-src-custom' + onCust + '" style="' + mdashLayoutColorSwatchStyle(customHex) + '" title="Cor personalizada"><i class="glyphicon glyphicon-tint"></i><input type="color" class="mdash-src-custom-native" value="' + customHex + '" /></label>';
        html += '</div>';
    }

    html += '<input type="hidden" class="mdash-layout-prop-input mdash-layout-prop-source-value" data-prop-id="' + (propDef && propDef.id) + '" id="' + inputId + '" value="' + mdashSrcEscapeAttr(JSON.stringify(sv)) + '" />';
    html += '</div>';
    return html;
}
window.buildMdashLayoutColorSourcePickerHtml = buildMdashLayoutColorSourcePickerHtml;

function bindMdashLayoutColorSourcePicker($root) {
    if (!$root || !$root.length) return;
    function commit($btn, sv) {
        var $picker = $btn.closest('.mdash-layout-source-picker');
        $picker.find('.is-active').removeClass('is-active');
        $picker.find('.mdash-layout-prop-source-value').val(JSON.stringify(sv)).trigger('change');
        return $picker;
    }
    $root.off('click.mdashSrc', '.mdash-src-theme-opt')
        .on('click.mdashSrc', '.mdash-src-theme-opt', function () {
            commit($(this), { src: 'theme', value: String($(this).attr('data-value')) });
            $(this).addClass('is-active');
        });
    $root.off('click.mdashSrc', '.mdash-src-class-chip')
        .on('click.mdashSrc', '.mdash-src-class-chip', function () {
            commit($(this), { src: 'class', value: String($(this).attr('data-value')) });
            $(this).addClass('is-active');
        });
    $root.off('input.mdashSrc change.mdashSrc', '.mdash-src-custom-native')
        .on('input.mdashSrc change.mdashSrc', '.mdash-src-custom-native', function () {
            var val = $(this).val();
            var $picker = commit($(this), { src: 'custom', value: val });
            $picker.find('.mdash-src-custom').addClass('is-active').css('background', val);
        });
}
window.bindMdashLayoutColorSourcePicker = bindMdashLayoutColorSourcePicker;

// ============================================================================
// BIBLIOTECAS DE ÍCONES / RECURSOS  ->  MOVIDO PARA "Mdash Library.js"
// ----------------------------------------------------------------------------
// Todo o sistema de ícones (registo de bibliotecas, picker, modelo MdashLibrary,
// load/save/delete/detect) vive agora em "Mdash Library.js". O config lib apenas
// CONSOME estas funções globais:
//   getMdashLayoutIconOptions, buildMdashLayoutIconPickerHtml, bindMdashLayoutIconPicker,
//   mdashRenderIconPreviewHtml, mdashNormalizeIconClass, registerMdashIconLibrary,
//   getMdashIconLibraryRegistry, mdashEnsureIconLibFonts, MdashIconLibrary,
//   loadIconLibrariesFromServer, saveIconLibraryToServer, deleteIconLibraryFromServer,
//   applyDbIconLibrariesToRegistry, mdashDetectIconsFromCssText/Stylesheets, GMDashIconLibraries
// NOTA: "Mdash Library.js" TEM de ser incluído na página (a par deste ficheiro).
// ============================================================================

function getMdashLayoutPropBehaviorRegistry() {
    return {
        setCssVariable: {
            label: 'Definir variável CSS',
            fields: [
                { key: 'varName', label: 'Variável CSS', placeholder: '--md-accent' }
            ]
        },
        setCssProperty: {
            label: 'Definir propriedade CSS',
            fields: [
                { key: 'property', label: 'Propriedade', placeholder: 'background-color' }
            ]
        },
        setIcon: {
            label: 'Definir ícone',
            fields: [
                { key: 'iconLibrary', label: 'Biblioteca', placeholder: 'material | glyphicon | fa' }
            ]
        },
        setAttribute: {
            label: 'Definir atributo HTML',
            fields: [
                { key: 'attribute', label: 'Atributo', placeholder: 'data-variant' }
            ]
        },
        setClass: {
            label: 'Definir classe CSS',
            fields: [
                { key: 'classPrefix', label: 'Prefixo (opcional)', placeholder: 'm-card--' },
                { key: 'mode', label: 'Modo', placeholder: 'replace | append' }
            ]
        },
        toggleClass: {
            label: 'Alternar classe por valor',
            fields: [
                { key: 'classPrefix', label: 'Prefixo', placeholder: 'm-card--' }
            ]
        },
        setText: {
            label: 'Definir texto',
            fields: []
        }
    };
}

function parseLayoutPropsDefinition(layoutOrJson) {
    if (!layoutOrJson) return [];
    if (Array.isArray(layoutOrJson)) return layoutOrJson;
    if (Array.isArray(layoutOrJson.props)) return layoutOrJson.props;
    var raw = layoutOrJson.propsdefinition || layoutOrJson.propsDefinition || '[]';
    return forceJSONParse(raw, []);
}

function getLayoutPropsSchemaForTemplate(template) {
    if (!template) return [];
    if (Array.isArray(template.props) && template.props.length) return template.props;
    var fromDef = parseLayoutPropsDefinition(template);
    if (fromDef.length) return fromDef;
    if (template.layoutStamp && Array.isArray(GMDashContainerItemLayouts)) {
        var layout = GMDashContainerItemLayouts.find(function (l) {
            return l && l.mdashcontaineritemlayoutstamp === template.layoutStamp;
        });
        if (layout) return parseLayoutPropsDefinition(layout);
    }
    return [];
}

function getLayoutPropsSchemaForItem(containerItem) {
    if (!containerItem) return [];
    var template = getTemplateLayoutByCode(containerItem.templatelayout);
    return getLayoutPropsSchemaForTemplate(template);
}

function mdashNormalizeLayoutPropStorage(raw) {
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.expr) {
        return { isExpression: true, value: raw.v != null ? raw.v : '' };
    }
    return { isExpression: false, value: raw };
}

function mdashCoerceLayoutPropValue(propDef, value) {
    var type = (propDef && propDef.type) || 'text';
    if (value === undefined || value === null) value = propDef ? propDef.default : '';
    if (type === 'number') return parseFloat(value) || 0;
    if (type === 'boolean') return value === true || value === 'true' || value === 1 || value === '1';
    return value;
}

function resolveLayoutPropValue(propDef, storedValue, context) {
    context = context || {};
    var norm = mdashNormalizeLayoutPropStorage(storedValue);
    var val;
    if (norm.isExpression) {
        try {
            var fn = new Function(
                'item', 'data', 'props', 'filters', 'Math', 'Number', 'String', 'Date',
                'return (' + norm.value + ');'
            );
            val = fn(
                context.item || {},
                context.data || {},
                context.props || {},
                context.filters || {},
                Math, Number, String, Date
            );
        } catch (err) {
            console.warn('[MDash] expressão da propriedade de layout falhou:', propDef.id, err);
            val = propDef.default;
        }
    } else {
        val = storedValue !== undefined && storedValue !== null ? storedValue : propDef.default;
    }
    return mdashCoerceLayoutPropValue(propDef, val);
}

function resolveAllLayoutPropValues(schema, layoutProps, context) {
    var resolved = {};
    (schema || []).forEach(function (propDef) {
        if (!propDef || !propDef.id) return;
        var stored = layoutProps ? layoutProps[propDef.id] : undefined;
        resolved[propDef.id] = resolveLayoutPropValue(propDef, stored, Object.assign({}, context, { props: resolved }));
    });
    return resolved;
}

function mdashResolveLayoutPropTargets($scope, targetSelector) {
    var sel = (targetSelector || '').trim();
    if (!sel || sel === ':scope' || sel === ':root') return $scope;
    var $found = $scope.find(sel);
    if (!$found.length && $scope.is(sel)) return $scope;
    return $found;
}

function applyLayoutPropBehavior($targets, behavior, value, propDef) {
    if (!$targets || !$targets.length || !behavior) return;
    var kind = behavior.kind || behavior.type;
    var behaviorRegistry = getMdashLayoutPropBehaviorRegistry();

    $targets.each(function () {
        var el = this;
        var $el = $(el);

        if (kind === 'setCssVariable') {
            var varName = behavior.varName || behavior.param || ('--md-prop-' + (propDef.id || 'value'));
            el.style.setProperty(varName, value);
            return;
        }
        if (kind === 'setCssProperty') {
            var cssProp = behavior.property || behavior.param || 'color';
            var cssVal = value;
            if (propDef && propDef.type === 'color') {
                cssVal = mdashResolveLayoutColorForCss(value);
            }
            $el.css(cssProp, cssVal);
            return;
        }
        if (kind === 'setIcon') {
            var iconVal = $.trim(String(value || ''));
            if (!iconVal) return;
            // ignora quando o valor é apenas o nome da fonte (não um ícone)
            if (/^(material-symbols(-(rounded|outlined|sharp))?|material-icons)$/.test(iconVal)) {
                return;
            }
            // A biblioteca é inferida do próprio valor/token (material vs classe)
            var isClassToken = (typeof mdashIsIconClassToken === 'function')
                ? mdashIsIconClassToken(iconVal)
                : (/(^|\s)glyphicon(\s|-)/.test(iconVal) || /(^|\s)fa[srlbd]?(\s|-)/.test(iconVal) || /(^|\s)fi(\s|-)/.test(iconVal));
            var iconSelector = 'i, .material-icons, [class*="material-symbols"], [class*="glyphicon"], .fa, [class*="fa-"], [class*="fi-"], [class*="bi-"]';
            var $icon = $el.is(iconSelector) ? $el : $el.find(iconSelector).first();

            if (isClassToken) {
                var cls = iconVal;
                if (/glyphicon/.test(iconVal) && !/(^|\s)glyphicon(\s|$)/.test(iconVal)) {
                    cls = 'glyphicon ' + iconVal.replace(/^glyphicon-/, 'glyphicon-');
                }
                if (/(^|\s)fa-/.test(iconVal) && !/(^|\s)fa[srlbd]?(\s|$)/.test(iconVal)) {
                    cls = 'fa ' + iconVal;
                }
                if (/(^|\s)fi-/.test(iconVal) && !/(^|\s)fi(\s|$)/.test(iconVal)) {
                    cls = 'fi ' + iconVal;
                }
                if (/(^|\s)bi-/.test(iconVal) && !/(^|\s)bi(\s|$)/.test(iconVal)) {
                    cls = 'bi ' + iconVal;
                }
                if (!$icon.length) { $el.prepend('<i class="' + cls + '"></i>'); return; }
                $icon.text('');
                $icon.attr('class', cls);
                return;
            }

            // material ligature
            if (!$icon.length) { $el.prepend('<span class="material-symbols-rounded">' + iconVal + '</span>'); return; }
            var curCls = $icon.attr('class') || '';
            if (!/material-symbols|material-icons/.test(curCls)) {
                // elemento era glyphicon/fa -> converter para material
                $icon.attr('class', 'material-symbols-rounded');
            }
            $icon.text(iconVal);
            return;
        }
        if (kind === 'setAttribute') {
            $el.attr(behavior.attribute || behavior.param || 'data-mdash-prop', value);
            return;
        }
        if (kind === 'setClass') {
            var cls = behavior.classPrefix ? (behavior.classPrefix + value) : String(value || '');
            if ((behavior.mode || '').toLowerCase() === 'append') $el.addClass(cls);
            else $el.attr('class', cls);
            return;
        }
        if (kind === 'toggleClass') {
            var prefix = behavior.classPrefix || '';
            var classes = ($el.attr('class') || '').split(/\s+/).filter(function (c) {
                return c && (!prefix || c.indexOf(prefix) !== 0);
            });
            if (value) classes.push(prefix + value);
            $el.attr('class', classes.join(' '));
            return;
        }
        if (kind === 'setText') {
            $el.text(value);
            return;
        }
        if (!behaviorRegistry[kind]) {
            console.warn('[MDash] behavior de layout desconhecido:', kind);
        }
    });
}

function applyLayoutPropsToScope($scope, template, containerItem, options) {
    if (!$scope || !$scope.length || !containerItem) return;
    options = options || {};
    var schema = getLayoutPropsSchemaForTemplate(template);
    if (!schema.length) return;

    if (typeof containerItem.initLayoutProps === 'function') {
        containerItem.initLayoutProps();
    }
    var layoutProps = containerItem.layoutprops || forceJSONParse(containerItem.layoutpropsjson, {});
    var context = {
        item: containerItem,
        data: options.data || (containerItem.records && containerItem.records[0]) || containerItem.dadosTemplate || {},
        filters: options.filters || (typeof GFiltros !== 'undefined' ? GFiltros : {})
    };
    var resolved = resolveAllLayoutPropValues(schema, layoutProps, context);

    schema.forEach(function (propDef) {
        if (!propDef || !propDef.id) return;
        var behaviors = Array.isArray(propDef.behaviors) ? propDef.behaviors : [];
        if (!behaviors.length) {
            behaviors = mdashInferDefaultBehaviorsForProp(propDef);
        }

        var storedRaw = layoutProps ? layoutProps[propDef.id] : undefined;
        var normStore = mdashNormalizeLayoutPropStorage(storedRaw);

        // Aplicação por fonte (tema / classe / personalizada) — cor por agora.
        if (!normStore.isExpression && propDef.type === 'color') {
            var sv = mdashGetPropSourceValue(storedRaw, propDef);
            if (sv.src === 'class') {
                var srcCfg = mdashGetPropSources(propDef);
                var prefix = (srcCfg.classes && srcCfg.classes.classPrefix) || '';
                var primary = behaviors[0] || { target: ':scope' };
                var $classTargets = mdashResolveLayoutPropTargets($scope, primary.target);
                applyLayoutPropBehavior($classTargets, { kind: 'toggleClass', target: primary.target, classPrefix: prefix }, sv.value, propDef);
                return;
            }
            behaviors.forEach(function (behavior) {
                var $t = mdashResolveLayoutPropTargets($scope, behavior.target);
                applyLayoutPropBehavior($t, behavior, sv.value, propDef);
            });
            return;
        }

        var value = resolved[propDef.id];
        behaviors.forEach(function (behavior) {
            var $targets = mdashResolveLayoutPropTargets($scope, behavior.target);
            applyLayoutPropBehavior($targets, behavior, value, propDef);
        });
    });

    $scope.attr('data-mdash-layout-props-applied', '1');
}

function mdashInferDefaultBehaviorsForProp(propDef) {
    var type = (propDef && propDef.type) || 'text';
    if (type === 'color') {
        return [{ kind: 'setCssVariable', target: ':scope', varName: '--md-prop-' + propDef.id }];
    }
    if (type === 'icon') {
        return [{ kind: 'setIcon', target: '[data-mdash-prop="' + propDef.id + '"]', iconLibrary: 'material' }];
    }
    return [{ kind: 'setText', target: '[data-mdash-prop="' + propDef.id + '"]' }];
}

function applyContainerItemLayoutProps(containerItem, hostSelector, options) {
    if (typeof $ !== 'function' || !containerItem || !hostSelector) return;
    var template = getTemplateLayoutByCode(containerItem.templatelayout);
    if (!template) return;
    var $host = $(hostSelector);
    var $scope = $host.find('[data-mdash-scope]').first();
    if (!$scope.length) $scope = $host;
    applyLayoutPropsToScope($scope, template, containerItem, options);
}
window.applyContainerItemLayoutProps = applyContainerItemLayoutProps;

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
    this.propsdefinition = data.propsdefinition || '[]';
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
    this.props = forceJSONParse(this.propsdefinition, []);
    this.jsCdnsList = forceJSONParse(this.jscdns, []);
    this.cssCdnsList = forceJSONParse(this.csscdns, []);

    // Metadata for CRUD operations
    this.localsource = "GMDashContainerItemLayouts";
    this.idfield = "mdashcontaineritemlayoutstamp";
    this.table = "MdashContainerItemLayout";
}

MdashContainerItemLayout.prototype.stringifyJSONFields = function () {
    this.slotsdefinition = JSON.stringify(this.slots || []);
    this.propsdefinition = JSON.stringify(this.props || []);
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
    var layoutSlots = this.slots || forceJSONParse(this.slotsdefinition, []);
    var mainSlotId = 'body';
    var mainSlot = layoutSlots.find(function (slot) { return slot && slot.isMainContent && slot.id; });
    if (mainSlot) {
        mainSlotId = mainSlot.id;
    } else {
        ['body', 'slotbody', 'content', 'main'].some(function (preferredId) {
            if (layoutSlots.some(function (slot) { return slot && slot.id === preferredId; })) {
                mainSlotId = preferredId;
                return true;
            }
            return false;
        });
    }
    return {
        descricao: this.descricao || this.codigo,
        codigo: 'custom_' + this.mdashcontaineritemlayoutstamp,
        tipo: 'custom',
        isCustomLayout: true,
        layoutStamp: this.mdashcontaineritemlayoutstamp,
        UIData: { tipo: 'primary' },
        htmltemplate: this.htmltemplate || '',
        csstemplate: this.csstemplate || '',
        jstemplate: this.jstemplate || '',
        slotsdefinition: this.slotsdefinition || '[]',
        slots: layoutSlots,
        propsdefinition: this.propsdefinition || '[]',
        props: this.props || forceJSONParse(this.propsdefinition, []),
        cssCdnsList: this.cssCdnsList || [],
        jsCdnsList: this.jsCdnsList || [],
        containerSelectorToRender: '[data-mdash-slot="' + mainSlotId + '"]',
        rowsizing: this.rowsizing || this.rowSizing || 'compact',
        generateCard: function (cardData) {
            return renderUnifiedLayout(this, cardData, { cssTarget: 'head' });
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
    $('#mdash-delete-confirm-btn').off('click').on('click', function () {
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
    $('#mdash-delete-confirm-modal').off('hidden.bs.modal').on('hidden.bs.modal', function () {
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
        { sourceTable: "MdashAccess", sourceKey: "mdashaccessstamp", records: GMDashAccesses },
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

function openDashboardPreview() {
    var mdashConfig = (window.appState && window.appState.dashboardConfig)
        ? window.appState.dashboardConfig
        : (GMDashConfig[0] || {});
    var codigo = mdashConfig.codigo || "";
    if (!codigo) {
        if (typeof alertify !== "undefined") alertify.error("Defina o Código do dashboard antes de pré-visualizar.", 6000);
        else alert("Defina o Código do dashboard antes de pré-visualizar.");
        return;
    }
    var url = "../programs/ewpview.aspx?codigo=mdash&codigomdash=" + encodeURIComponent(codigo);

    if (document.getElementById("mdash-preview-overlay")) return; // já aberto

    var overlay = document.createElement("div");
    overlay.id = "mdash-preview-overlay";
    overlay.className = "mdash-preview-overlay";

    var bar = document.createElement("div");
    bar.className = "mdash-preview-overlay-bar";
    bar.innerHTML = '<span><i class="glyphicon glyphicon-eye-open" style="margin-right:6px"></i>Pré-visualização — ' + codigo + '</span>'
        + '<button onclick="document.getElementById(\'mdash-preview-overlay\').remove()"><i class="glyphicon glyphicon-remove" style="margin-right:4px"></i>Fechar</button>';

    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "fullscreen";

    overlay.appendChild(bar);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
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

function addExportImportButtons(selector) {
    var container = $(selector);
    if (!container.length) return;

    var buttonsHtml = '';
    buttonsHtml += '<button type="button" onclick="document.getElementById(\'importDashboardConfigFileInput\').click()" class="btn btn-default btn-sm" title="Importar configuração"><i class="glyphicon glyphicon-upload"></i> Importar</button>';
    buttonsHtml += '<button type="button" onclick="exportarConfiguracaoMDashboard()" class="btn btn-default btn-sm" title="Exportar configuração"><i class="glyphicon glyphicon-download-alt"></i> Exportar</button>';
    buttonsHtml += '<input type="file" id="importDashboardConfigFileInput" accept=".json" style="display: none;" onchange="importarConfiguracaoDashboard()" />';

    container.append(buttonsHtml);
}

function importarConfiguracaoDashboard() {
    var fileInput = document.getElementById('importDashboardConfigFileInput');
    var file = fileInput.files[0];
    if (!file) {
        alertify.error("Por favor, selecione um ficheiro para importar.", 5000);
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var content = e.target.result;
            var json = JSON.parse(content);
            json.recordsToDelete = [];
            $.ajax({
                type: "POST",
                url: "../programs/gensel.aspx?cscript=actualizaconfiguracaomrelatorio",
                async: false,
                data: {
                    '__EVENTARGUMENT': JSON.stringify([json]),
                },
                success: function (response) {
                    var errorMessage = "ao importar resultados ";
                    try {
                        console.log(response);
                        if (response.cod != "0000") {
                            console.log("Erro " + errorMessage, response);
                            alertify.error("Erro ao importar configuração", 9000);
                            return false;
                        }
                        alertify.success("Dados importados com sucesso", 9000);
                        window.location.reload();
                    } catch (error) {
                        console.log("Erro interno " + errorMessage, response, error);
                    }
                }
            });
        } catch (error) {
            alertify.error("Erro ao importar configuração: " + error.message, 5000);
        }
    };
    reader.readAsText(file);
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

    // CRÍTICO: Serializar campos JSON de TODOS os objetos antes de persistir
    // Garante que transformConfig/configjson estão sincronizados (invariante triplicada)
    console.log('[actualizarConfiguracaoMDashboard] Serializando ' + GMDashContainerItemObjects.length + ' objetos...');
    GMDashContainerItemObjects.forEach(function (obj) {
        if (typeof obj.stringifyJSONFields === 'function') {
            obj.stringifyJSONFields();
        }
    });

    // Garantir serialização de configjson do dashboard antes do save full
    if (window.appState && window.appState.dashboardConfig && typeof window.appState.dashboardConfig.setConfig === 'function') {
        window.appState.dashboardConfig.setConfig(window.appState.dashboardSettings || {});
    }

    var configData = [
        { sourceTable: "u_mdash", sourceKey: "u_mdashstamp", records: GMDashConfig },
        { sourceTable: "MdashAccess", sourceKey: "mdashaccessstamp", records: GMDashAccesses },
        { sourceTable: "MdashTab", sourceKey: "mdashtabstamp", records: GMDashTabs },
        { sourceTable: "MdashContainer", sourceKey: "mdashcontainerstamp", records: GMDashContainers },
        { sourceTable: "MdashContainerItem", sourceKey: "mdashcontaineritemstamp", records: GMDashContainerItems },
        { sourceTable: "MdashFilter", sourceKey: "mdashfilterstamp", records: GMDashFilters },
        { sourceTable: "MdashContainerItemObject", sourceKey: "mdashcontaineritemobjectstamp", records: GMDashContainerItemObjects },
        { sourceTable: "MDashFonte", sourceKey: "mdashfontestamp", records: fontesDbRecords }
    ];

    console.log('[actualizarConfiguracaoMDashboard] Enviando configuração completa para backend...');

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

    // DEBUG: Log do que está sendo enviado para persistência
    console.log('[realTimeComponentSync] Persistindo objeto:', {
        table: table,
        idfield: idfield,
        'recordData.transformConfig': recordData.transformConfig ? 'EXISTS (sourceTable: ' + (recordData.transformConfig.sourceTable || 'N/A') + ')' : 'null',
        'recordData.transformconfigjson': recordData.transformconfigjson ? (recordData.transformconfigjson.length + ' chars') : 'empty/null',
        'recordData.config.transformConfig': (recordData.config && recordData.config.transformConfig) ? 'EXISTS' : 'null'
    });

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

        $.ajax({
            type: "POST",
            url: "../programs/gensel.aspx?cscript=realtimecomponentsync",
            async: false,
            data: {
                '__EVENTARGUMENT': JSON.stringify([{ config: configData, recordsToDelete: GMdashDeleteRecords }]),
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

var GMDashboardConfig = null;

function initConfiguracaoDashboard(config) {
    console.log("Inicializando MDash 2.0 REFATORADO com configuração:", config);
    GMDashStamp = config.u_mdashstamp;
    GMDashboardConfig = config;

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

    // Cria a interface moderna apenas quando o editor deve ser renderizado
    if (config.renderEditor !== false) {
        createModernDashboardUI();
    } else {
        console.log("MDash editor render skipped because config.renderEditor is false");
    }

    // Carrega estilos
    loadModernStyles();

    // Adiciona botões de importação/exportação no local especificado pela config
    if (config.exportBtnSelector && $(config.exportBtnSelector).length > 0) {
        addExportImportButtons(config.exportBtnSelector);
    }
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
                if (response.data) {
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
                        GMDashTabs = tabsData.map(function (t) {
                            return new MdashTab(t);
                        });
                    }

                    // Accessos
                    if (dashboardData.accesses) {
                        GMDashAccesses = dashboardData.accesses.map(function (a) {
                            return new MdashAccess(a);
                        });
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

                    // Bibliotecas globais (MdashLibrary, tipo icon)
                    if (typeof hydrateMdashLibrariesFromDashboardData === 'function') {
                        hydrateMdashLibrariesFromDashboardData(dashboardData);
                    } else if (typeof loadIconLibrariesFromServer === 'function') {
                        loadIconLibrariesFromServer();
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
                    libraries: (typeof GMDashIconLibraries !== 'undefined' && GMDashIconLibraries) ? GMDashIconLibraries.length : 0,
                    codigoDash: config.codigo
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

function MdashTabsManager() { }

MdashTabsManager.prototype.getDashboardSettings = function () {
    var dash = (window.appState && window.appState.dashboardConfig)
        ? window.appState.dashboardConfig
        : (GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp }));
    if (!GMDashConfig.length) GMDashConfig = [dash];
    if (typeof dash.getConfig === 'function') return dash.getConfig();
    if (dash.settings && typeof dash.settings === 'object') return dash.settings;
    try { return JSON.parse(dash.configjson || '{}') || {}; } catch (e) { return {}; }
};

MdashTabsManager.prototype.setDashboardSettings = function (settings, syncRealtime) {
    var dash = (window.appState && window.appState.dashboardConfig)
        ? window.appState.dashboardConfig
        : (GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp }));
    if (!GMDashConfig.length) GMDashConfig = [dash];
    if (typeof dash.setConfig === 'function') {
        dash.setConfig(settings || {});
    } else {
        dash.settings = settings || {};
        dash.configjson = JSON.stringify(settings || {});
    }
    if (window.appState) window.appState.dashboardSettings = settings || {};
    if (syncRealtime && typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(dash, dash.table, dash.idfield);
    }
};

MdashTabsManager.prototype.isEnabled = function () {
    var s = this.getDashboardSettings();
    return !!s.activarMultiSeparadores;
};

MdashTabsManager.prototype.getTabOverflowMode = function () {
    var s = this.getDashboardSettings();
    return s.tabOverflowMode === 'wrap' ? 'wrap' : 'squeeze';
};

MdashTabsManager.prototype.getTabWrapAfterCount = function () {
    var s = this.getDashboardSettings();
    var count = parseInt(s.tabWrapAfterCount, 10);
    if (isNaN(count)) count = 5;
    if (count < 1) count = 1;
    if (count > 20) count = 20;
    return count;
};

MdashTabsManager.prototype.shouldWrapTabs = function (tabCount) {
    var count = typeof tabCount === 'number' ? tabCount : this.getSortedTabs().length;
    return this.getTabOverflowMode() === 'wrap' && count > this.getTabWrapAfterCount();
};

MdashTabsManager.prototype.getTabsLayoutClass = function (tabCount) {
    var shouldWrap = this.shouldWrapTabs(tabCount);
    return {
        'is-wrap-mode': shouldWrap,
        'is-squeeze-mode': !shouldWrap
    };
};

function getMdashDashboardTabSizeTokens() {
    return {
        basis: '96px',
        min: '68px',
        max: '132px'
    };
}

/** Larguras para o editor — espaço para título + ícone + acções (copiar/definições/remover). */
function getMdashDashboardTabEditorSizeTokens() {
    return {
        basis: '176px',
        min: '152px',
        max: '240px'
    };
}

function getMdashDashboardTabSizeCssVars() {
    var t = getMdashDashboardTabSizeTokens();
    return '--md-tab-basis:' + t.basis + ';--md-tab-min:' + t.min + ';--md-tab-max:' + t.max + ';';
}

function getMdashDashboardTabEditorSizeCssVars() {
    var t = getMdashDashboardTabEditorSizeTokens();
    return '--md-tab-basis:' + t.basis + ';--md-tab-min:' + t.min + ';--md-tab-max:' + t.max + ';';
}
window.getMdashDashboardTabSizeTokens = getMdashDashboardTabSizeTokens;
window.getMdashDashboardTabEditorSizeTokens = getMdashDashboardTabEditorSizeTokens;
window.getMdashDashboardTabSizeCssVars = getMdashDashboardTabSizeCssVars;
window.getMdashDashboardTabEditorSizeCssVars = getMdashDashboardTabEditorSizeCssVars;

MdashTabsManager.prototype._getTabsLayoutFlexStyle = function (tabCount) {
    var shouldWrap = this.shouldWrapTabs(tabCount);
    return shouldWrap
        ? 'flex-wrap:wrap;overflow:visible;'
        : 'flex-wrap:nowrap;overflow-x:auto;overflow-y:visible;';
};

MdashTabsManager.prototype.getTabsLayoutStyle = function (tabCount) {
    return this._getTabsLayoutFlexStyle(tabCount) + getMdashDashboardTabSizeCssVars();
};

MdashTabsManager.prototype.getTabsLayoutStyleEditor = function (tabCount) {
    return this._getTabsLayoutFlexStyle(tabCount) + getMdashDashboardTabEditorSizeCssVars();
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
    return cfg.cor || '#ffffff';
};

MdashTabsManager.prototype.getTabIconColorType = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.corIcone || 'default';
};

MdashTabsManager.prototype.getTabTextColorType = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.corTexto || 'default';
};

MdashTabsManager.prototype.getTabFontFamily = function (tab) {
    var cfg = this._readTabConfig(tab);
    return cfg.fontFamily || '';
};

MdashTabsManager.prototype.getTabTooltipTitle = function (tab) {
    var cfg = this._readTabConfig(tab);
    var tooltipTitle = (cfg.tooltipTitle || '').trim();
    if (tooltipTitle) return tooltipTitle;
    return (tab && tab.titulo ? String(tab.titulo).trim() : '') || 'Sem nome';
};

MdashTabsManager.prototype.getTabStyle = function (tab) {
    var cfg = this._readTabConfig(tab);
    var bg = this._resolvePhcColor(this.getTabPhcType(tab));
    var iconType = this.getTabIconColorType(tab);
    var txtType = this.getTabTextColorType(tab);
    var legacyWhiteIcon = typeof iconType === 'string' && /^(#fff|#ffffff)$/i.test(iconType);
    var legacyWhiteText = typeof txtType === 'string' && /^(#fff|#ffffff)$/i.test(txtType);
    var contrast = this._getContrastColor(bg);
    var hasExplicitIconColor = !!cfg.corIcone && cfg.corIcone !== 'default' && !legacyWhiteIcon;
    var ic = hasExplicitIconColor ? this._resolvePhcColor(iconType) : contrast;
    var txt = (txtType && txtType !== 'default' && !legacyWhiteText) ? this._resolvePhcColor(txtType) : contrast;
    var style = '--mdash-tab-bg:' + bg + ';--mdash-tab-accent:' + contrast + ';--mdash-tab-icon:' + ic + ';--mdash-tab-text:' + txt + ';';
    var ff = this.getTabFontFamily(tab);
    if (ff) style += '--mdash-tab-font:' + ff + ';';
    return style;
};

function getMdashDashboardTabsSharedStyles() {
    var tabSize = getMdashDashboardTabSizeTokens();
    var s = '';
    s += ".mdash-dashboard-tabs-wrap{--mdash-tabs-canvas:transparent;overflow:visible;padding:6px 8px 0;position:relative;background:transparent;border:none;border-radius:0;box-shadow:none}";
    s += ".mdash-dashboard-tabs-wrap::before{display:none;content:none}.mdash-dashboard-tabs-wrap::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:rgba(15,23,42,.08);pointer-events:none}";
    s += ".mdash-dashboard-tabs{--md-tab-basis:" + tabSize.basis + ";--md-tab-min:" + tabSize.min + ";--md-tab-max:" + tabSize.max + ";display:flex;align-items:flex-end;align-content:flex-end;flex-wrap:nowrap;gap:0;min-width:0;width:100%;position:relative;z-index:1;padding:0;overflow-x:auto;overflow-y:visible;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}";
    s += ".mdash-dashboard-tabs::-webkit-scrollbar{height:3px}.mdash-dashboard-tabs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}.mdash-dashboard-tabs.is-wrap-mode{flex-wrap:wrap!important;gap:3px 0!important;overflow:visible!important}.mdash-dashboard-tabs.is-squeeze-mode{flex-wrap:nowrap!important;overflow-x:auto}";
    s += ".mdash-dashboard-tab{--mdash-tab-bg:#fff;--mdash-tab-accent:var(--md-primary,#2563eb);--mdash-tab-icon:#475569;--mdash-tab-text:#334155;--mdash-tab-font:inherit;position:relative;flex:0 0 var(--md-tab-basis);min-width:var(--md-tab-min);max-width:var(--md-tab-max);height:auto;padding:5px 10px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;background:#ffffff;color:#475569;font-family:var(--mdash-tab-font);border-radius:8px 8px 0 0;border:1px solid transparent;border-bottom:none;transition:background .15s,color .15s,filter .15s,box-shadow .15s,border-color .15s;overflow:hidden;box-shadow:none;filter:none;user-select:none;outline:none;z-index:1}";
    s += ".mdash-dashboard-tab:not(.is-active){background:#ffffff;box-shadow:rgba(149,157,165,.2) 0 1px 1px}";
    s += ".mdash-dashboard-tab:not(.is-active)::after{display:none;content:none}.mdash-dashboard-tab:hover::after,.mdash-dashboard-tab.is-active+.mdash-dashboard-tab::after{opacity:0}";
    s += ".mdash-dashboard-tab:not(.is-active) i,.mdash-dashboard-tab:not(.is-active) .mdash-dashboard-tab-iconbtn{color:#64748b}.mdash-dashboard-tab:not(.is-active):hover{background:#ffffff;color:#334155;border-color:rgba(15,23,42,.08);border-radius:8px;filter:none}.mdash-dashboard-tab.is-active{background:var(--mdash-tab-bg);color:var(--mdash-tab-text);filter:none;border:1px solid transparent;border-bottom:none;box-shadow:0 -3px 10px rgba(15,23,42,.06);z-index:3}";
    s += ".mdash-dashboard-tab.is-active::before,.mdash-dashboard-tab.is-active::after{content:'';position:absolute;bottom:0;width:7px;height:7px;pointer-events:none;z-index:4}.mdash-dashboard-tab.is-active::before{left:-7px;background:radial-gradient(circle at 0 0,transparent 6.5px,var(--mdash-tab-bg) 7px)}.mdash-dashboard-tab.is-active::after{right:-7px;background:radial-gradient(circle at 100% 0,transparent 6.5px,var(--mdash-tab-bg) 7px)}.mdash-dashboard-tab>.mdash-dashboard-tab-accent{display:none}.mdash-dashboard-tab-curve{display:none!important}";
    s += ".mdash-dashboard-tab i{font-size:11px;flex-shrink:0;color:var(--mdash-tab-icon)}.mdash-dashboard-tab-iconbtn{border:none!important;background:transparent!important;padding:0!important;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;width:15px;height:15px;color:var(--mdash-tab-icon);margin-left:0}.mdash-dashboard-tab-iconbtn i{font-size:11px;color:inherit}";
    s += ".mdash-dashboard-tab-title,.mdash-dashboard-tab-label{border:none!important;background:transparent!important;color:inherit;font-family:inherit;flex:1;min-width:0;font-size:10.5px;font-weight:600;line-height:1.1;letter-spacing:.015em;outline:none!important;padding:0;box-shadow:none!important;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.mdash-dashboard-tab-title{width:100%;cursor:text;-webkit-appearance:none;appearance:none}";
    s += "@media (min-width:1440px){.mdash-dashboard-tabs{--md-tab-basis:108px;--md-tab-max:148px}}";
    return s;
}
window.getMdashDashboardTabsSharedStyles = getMdashDashboardTabsSharedStyles;

function getMdashContainerItemMainSlotId(containerItem) {
    if (!containerItem) return 'body';

    var slotDefs = [];
    if (Array.isArray(containerItem.slotsconfig) && containerItem.slotsconfig.length) {
        slotDefs = containerItem.slotsconfig.map(function (slot) {
            return slot && typeof slot.toJSON === 'function' ? slot.toJSON() : slot;
        });
    } else {
        slotDefs = forceJSONParse(containerItem.slotsconfigjson, []);
    }

    function findMainSlot(slots) {
        if (!Array.isArray(slots)) return null;
        return slots.find(function (slot) { return slot && slot.isMainContent && slot.id; }) || null;
    }

    var mainSlot = findMainSlot(slotDefs);
    if (mainSlot) return mainSlot.id;

    var template = getTemplateLayoutByCode(containerItem.templatelayout);
    var templateSlots = template
        ? (template.slots || forceJSONParse(template.slotsdefinition, []))
        : [];

    mainSlot = findMainSlot(templateSlots);
    if (mainSlot) return mainSlot.id;

    if (template && template.containerSelectorToRender) {
        var selectorMatch = String(template.containerSelectorToRender).match(/data-mdash-slot="([^"]+)"/);
        if (selectorMatch && selectorMatch[1]) return selectorMatch[1];
    }

    var preferredIds = ['body', 'slotbody', 'content', 'main'];
    var preferredMatch = null;
    preferredIds.some(function (preferredId) {
        var existsInTemplate = templateSlots.some(function (slot) { return slot && slot.id === preferredId; });
        var existsInSaved = slotDefs.some(function (slot) { return slot && slot.id === preferredId; });
        if (existsInTemplate || existsInSaved) {
            preferredMatch = preferredId;
            return true;
        }
        return false;
    });
    if (preferredMatch) return preferredMatch;

    var decorativeSlotIds = { header: true, footer: true, title: true, icon: true, subtitle: true };
    var contentSlot = templateSlots.find(function (slot) {
        return slot
            && slot.id
            && !decorativeSlotIds[slot.id]
            && (slot.type === 'html' || slot.type === 'content' || slot.type === 'text');
    });
    if (contentSlot) return contentSlot.id;

    contentSlot = slotDefs.find(function (slot) {
        return slot
            && slot.id
            && !decorativeSlotIds[slot.id]
            && (slot.type === 'html' || slot.type === 'content' || slot.type === 'text');
    });
    if (contentSlot) return contentSlot.id;

    return 'body';
}
window.getMdashContainerItemMainSlotId = getMdashContainerItemMainSlotId;

function mdashIsStructuralSlot($el) {
    return !!($el && $el.length && $el.find('[data-mdash-slot]').length > 0);
}

function mdashFindLeafSlotsInRoot($root) {
    if (!$root || !$root.length) return $();
    return $root.find('[data-mdash-slot]').filter(function () {
        return $(this).find('[data-mdash-slot]').length === 0;
    });
}

function mdashGetSlotRenderDepth($slot) {
    if (!$slot || !$slot.length) return -1;
    return $slot.parents('[data-mdash-slot]').length;
}

/**
 * Quando o slot principal é um contentor (ex.: body com slots aninhados),
 * devolve o slot-folha onde injectar skeleton/conteúdo — alinhado com injectSlotDropOverlays.
 */
function resolveMdashContainerItemSlotForContent(containerItem, slotId, hostSelector) {
    var $slot = resolveMdashContainerItemSlot(containerItem, slotId, hostSelector);
    if (!$slot || !$slot.length || !mdashIsStructuralSlot($slot)) return $slot;

    var preferredId = slotId || getMdashContainerItemMainSlotId(containerItem);
    var $leafSlots = mdashFindLeafSlotsInRoot($slot);
    if (!$leafSlots.length) return $slot;

    var $preferred = $leafSlots.filter('[data-mdash-slot="' + preferredId + '"]');
    if ($preferred.length) return $preferred.first();

    var mainSlotId = getMdashContainerItemMainSlotId(containerItem);
    if (mainSlotId && mainSlotId !== preferredId) {
        $preferred = $leafSlots.filter('[data-mdash-slot="' + mainSlotId + '"]');
        if ($preferred.length) return $preferred.first();
    }

    return $leafSlots.first();
}
window.resolveMdashContainerItemSlotForContent = resolveMdashContainerItemSlotForContent;

function resolveMdashContainerItemSlot(containerItem, slotId, hostSelector) {
    if (typeof $ !== 'function' || !containerItem) return null;
    var rootSelector = hostSelector || ('#' + containerItem.mdashcontaineritemstamp);
    var resolvedSlotId = slotId || getMdashContainerItemMainSlotId(containerItem);
    var $byAttr = $(rootSelector + ' [data-mdash-slot="' + resolvedSlotId + '"]');
    if ($byAttr.length) return $byAttr.first();
    if (resolvedSlotId !== 'body') {
        $byAttr = $(rootSelector + ' [data-mdash-slot="body"]');
        if ($byAttr.length && !mdashIsStructuralSlot($byAttr)) return $byAttr.first();
    }
    if (resolvedSlotId === 'body' && containerItem.dadosTemplate && containerItem.dadosTemplate.containerSelectorToRender) {
        var $legacy = $(rootSelector + ' ' + containerItem.dadosTemplate.containerSelectorToRender);
        if ($legacy.length && !mdashIsStructuralSlot($legacy)) return $legacy.first();
    }
    var $body = $(rootSelector + ' .mdash-card__body, ' + rootSelector + ' .dashcard-body');
    if ($body.length) return $body.first();
    var $anySlot = $(rootSelector + ' [data-mdash-slot]').filter(function () {
        return !mdashIsStructuralSlot($(this));
    });
    return $anySlot.length ? $anySlot.first() : null;
}
window.resolveMdashContainerItemSlot = resolveMdashContainerItemSlot;

function renderMdashContainerItemLayout(containerItem, hostSelector, cardData) {
    if (typeof $ !== 'function' || !containerItem || !hostSelector) return null;
    var template = getTemplateLayoutByCode(containerItem.templatelayout);
    if (!template || typeof template.generateCard !== 'function') return null;

    containerItem.dadosTemplate = template;
    ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
    mountUnifiedLayout($(hostSelector), template, cardData || {});
    applyContainerItemLayoutProps(containerItem, hostSelector, { data: cardData });

    if (isCompactContainerItemLayout(containerItem.templatelayout)) {
        mdashResetCompactLayoutHeights(hostSelector);
    }
    mdashSyncContainerItemRowSizing(containerItem);

    if (template.jstemplate) {
        try {
            (new Function('containerItem', 'hostSelector', template.jstemplate))(containerItem, hostSelector);
        } catch (error) {
            console.error('[MDash] erro no JavaScript do layout', template.codigo, error);
        }
    }
    return template;
}
window.renderMdashContainerItemLayout = renderMdashContainerItemLayout;

function mdashResetCompactLayoutHeights(hostSelector) {
    if (typeof $ !== 'function' || !hostSelector) return;
    var $host = $(hostSelector);
    $host.css({ height: 'auto', 'min-height': '0', '--md-item-min-h': '0px' });
    $host.find('[data-mdash-scope], [data-mdash-scope] > *').add($host.children()).each(function () {
        this.style.setProperty('height', 'auto', 'important');
        this.style.setProperty('min-height', '0', 'important');
        this.style.setProperty('max-height', 'none', 'important');
    });
}
window.mdashResetCompactLayoutHeights = mdashResetCompactLayoutHeights;

/**
 * Monta os objetos do item nos slots definidos pelo layout já renderizado.
 * Este é o runtime único usado pelo viewer; o editor usa o mesmo contrato
 * `data-mdash-slot` e os mesmos objetos/configurações.
 */
function renderMdashContainerItemSlots(containerItem, itemObjects, options) {
    options = options || {};
    if (typeof $ !== 'function' || !containerItem) {
        return { renderedObjects: [], detailObjects: [], overlayObjects: [], missingSlots: [] };
    }

    var objects = Array.isArray(itemObjects) ? itemObjects : [];
    var itemStamp = containerItem.mdashcontaineritemstamp;
    var hostSelector = options.hostSelector || ('#' + itemStamp);
    var renderedObjects = [];
    var detailObjects = [];
    var overlayObjects = [];
    var missingSlots = [];
    var slotMap = {};
    var slotConfigs = Array.isArray(containerItem.slotsconfig)
        ? containerItem.slotsconfig
        : forceJSONParse(containerItem.slotsconfigjson, []);

    $(hostSelector + ' [data-mdash-slot]').each(function () {
        var $slotElement = $(this);
        var slotId = $slotElement.attr('data-mdash-slot');
        var savedSlot = slotConfigs.find(function (slot) { return slot && slot.id === slotId; });
        if (!savedSlot) return;
        var mdashSlot = savedSlot instanceof MdashSlot ? savedSlot : new MdashSlot(savedSlot);
        mdashSlot.applyToElement($slotElement);
    });

    objects
        .filter(function (obj) { return obj && obj.mdashcontaineritemstamp === itemStamp; })
        .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); })
        .forEach(function (obj) {
            var entry = getMdashObjectTypeEntry(obj.tipo);
            var category = obj.categoria || (entry && entry.categoria) || 'editor';
            if (category === 'detail') {
                detailObjects.push(obj);
                return;
            }
            if (category === 'overlay') {
                overlayObjects.push(obj);
                return;
            }
            if (category === 'datasource' || category === 'filter') return;

            var slotId = obj.slotid || getMdashContainerItemMainSlotId(containerItem);
            if (!slotMap[slotId]) slotMap[slotId] = [];
            slotMap[slotId].push(obj);
        });

    var sortedSlotIds = Object.keys(slotMap).sort(function (slotA, slotB) {
        var $slotA = resolveMdashContainerItemSlot(containerItem, slotA, hostSelector);
        var $slotB = resolveMdashContainerItemSlot(containerItem, slotB, hostSelector);
        return mdashGetSlotRenderDepth($slotB) - mdashGetSlotRenderDepth($slotA);
    });

    sortedSlotIds.forEach(function (slotId) {
        var $slot = resolveMdashContainerItemSlot(containerItem, slotId, hostSelector);
        if (!$slot || !$slot.length) {
            missingSlots.push(slotId);
            return;
        }

        if (mdashIsStructuralSlot($slot)) {
            console.warn(
                '[MDash] objectos atribuídos ao slot contentor "' + slotId
                + '" — use slots folha (aninhados). Objectos ignorados no item', itemStamp
            );
            missingSlots.push(slotId);
            return;
        }

        $slot.empty();
        slotMap[slotId].forEach(function (obj) {
            var objectStamp = obj.mdashcontaineritemobjectstamp;
            var hostId = 'cont-item-obj-' + objectStamp;
            $slot.append(
                '<div id="' + hostId + '" class="cont-item-object-rendered"'
                + ' style="display:block;width:100%;max-width:100%;align-self:stretch;"></div>'
            );
            try {
                obj.renderObjectByContainerItem('#' + hostId, containerItem);
                renderedObjects.push(obj);
            } catch (error) {
                console.error('[MDash] erro a renderizar objecto', obj.tipo, error);
                $('#' + hostId).html(
                    '<div class="mdash-state mdash-state--error">'
                    + '<i class="glyphicon glyphicon-warning-sign mdash-state__icon"></i>'
                    + '<span class="mdash-state__text">Falha a renderizar ' + (obj.tipo || 'objecto') + '</span>'
                    + '</div>'
                );
            }
        });
    });

    if (missingSlots.length) {
        console.warn('[MDash] slots não encontrados no layout do item', itemStamp, missingSlots);
    }

    return {
        renderedObjects: renderedObjects,
        detailObjects: detailObjects,
        overlayObjects: overlayObjects,
        missingSlots: missingSlots
    };
}
window.renderMdashContainerItemSlots = renderMdashContainerItemSlots;

// ============================================================================
// ITEM EVENTS & OVERLAY MODAL
// ============================================================================

function mdashGetObjectCategory(obj) {
    if (!obj) return 'editor';
    if (obj.categoria) return obj.categoria;
    var entry = getMdashObjectTypeEntry(obj.tipo);
    return (entry && entry.categoria) || 'editor';
}

function getItemOverlayObjects(itemStamp, sourceObjects) {
    var objects = sourceObjects;
    if (!Array.isArray(objects)) {
        objects = (window.appState && window.appState.containerItemObjects) || GMDashContainerItemObjects || [];
    }
    return objects
        .filter(function (obj) {
            return obj && obj.mdashcontaineritemstamp === itemStamp && mdashGetObjectCategory(obj) === 'overlay';
        })
        .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
}

function mdashResolveItemOverlayObjects(containerItem, allObjects) {
    var itemStamp = containerItem && containerItem.mdashcontaineritemstamp;
    if (!itemStamp) return [];
    var overlay = getItemOverlayObjects(itemStamp, allObjects);
    var layoutCfg = getItemOverlayLayoutConfig(containerItem);
    var places = getItemOverlayPlaces(containerItem);

    if (!places.length) {
        if (layoutCfg.mode !== 'template' || !layoutCfg.templatelayout) {
            overlay = overlay.filter(function (obj) {
                return !obj.slotid || obj.slotid === MDASH_ITEM_OVERLAY_SLOT;
            });
        }
    }
    if (overlay.length) return overlay;
    return (allObjects || []).filter(function (obj) {
        return obj && obj.mdashcontaineritemstamp === itemStamp && mdashGetObjectCategory(obj) === 'detail';
    }).sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
}

function persistItemEventsConfig(item) {
    if (!item) return;
    if (item._eventsConfigCache) {
        item.eventsconfigjson = JSON.stringify(item._eventsConfigCache);
    }
    if (typeof realTimeComponentSync === 'function') {
        realTimeComponentSync(item, item.table, item.idfield);
    }
}

function mdashGetItemPrimaryInteraction(containerItem) {
    if (!containerItem) return null;
    var cfg;
    if (typeof containerItem.getEventsConfig === 'function') {
        cfg = containerItem.getEventsConfig();
    } else {
        cfg = forceJSONParse(containerItem.eventsconfigjson, getDefaultMdashItemEventsConfig());
    }
    var interactions = (cfg && cfg.interactions) || [];
    return interactions.length ? interactions[0] : null;
}

function mdashEnsureItemOverlayModalShell(containerItem, interaction) {
    interaction = interaction || {};
    var itemStamp = containerItem.mdashcontaineritemstamp;
    var modalId = 'mdash-item-overlay-' + itemStamp;
    var bodyHostId = 'mdash-item-overlay-body-' + itemStamp;
    var title = interaction.modalTitle || ('Detalhes — ' + (containerItem.titulo || ''));

    if (!$('#' + modalId).length) {
        var modalHtml = generateModalHTML({
            title: title,
            id: modalId,
            customData: 'data-item-stamp="' + itemStamp + '"',
            otherclassess: 'mdash-item-overlay-modal',
            body: '<div id="' + bodyHostId + '" class="mdash-item-overlay-body mdash-container-items-row"></div>',
            footerContent: ''
        });
        var $parent = $('#mainPage').length ? $('#mainPage') : $('body');
        $parent.append(modalHtml);
        $('#' + modalId + ' .modal-dialog').addClass('modal-lg');
        $('#' + modalId).off('hidden.bs.modal.mdashOverlayCleanup').on('hidden.bs.modal.mdashOverlayCleanup', function () {
            setTimeout(mdashCleanupOrphanModalBackdrop, 0);
        });
    }
    return { modalId: modalId, bodyHostId: bodyHostId };
}

function mdashCleanupOrphanModalBackdrop() {
    if (typeof $ !== 'function') return;
    if ($('.modal.in:visible').length === 0) {
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open').css('padding-right', '');
    }
}

function mdashShowItemOverlayModal($modal) {
    if (!$modal || !$modal.length) return;
    mdashCleanupOrphanModalBackdrop();
    $modal.modal('show');
}

function mdashOpenItemOverlayRuntime(containerItem, runtimeCtx, options) {
    options = options || {};
    if (!containerItem || typeof $ !== 'function') return;

    ensureMdashOverlayRuntimeStyles();

    var mdashInstance = (runtimeCtx && runtimeCtx.mdash) || containerItem._mdash || null;
    var allObjects = (mdashInstance && Array.isArray(mdashInstance.containerItemObjects))
        ? mdashInstance.containerItemObjects
        : ((window.appState && window.appState.containerItemObjects) || GMDashContainerItemObjects || []);
    var overlayObjects = mdashResolveItemOverlayObjects(containerItem, allObjects);
    if (!overlayObjects.length) return;

    var interaction = mdashGetItemPrimaryInteraction(containerItem) || {};
    var shell = mdashEnsureItemOverlayModalShell(containerItem, Object.assign({}, interaction, {
        modalTitle: options.title || interaction.modalTitle
    }));
    var $body = $('#' + shell.bodyHostId).empty();
    var $modal = $('#' + shell.modalId);
    var modalTitle = options.title || interaction.modalTitle || ('Detalhes — ' + (containerItem.titulo || ''));
    $modal.find('.modal-title').html(modalTitle);

    var overlayLayout = getItemOverlayLayoutConfig(containerItem);
    var useTemplate = overlayLayout.mode === 'template' && overlayLayout.templatelayout;

    if (useTemplate) {
        var template = getTemplateLayoutByCode(overlayLayout.templatelayout);
        if (template) {
            ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
            var cardHtml = template.generateCard
                ? template.generateCard({ title: '', id: 'overlay-' + containerItem.mdashcontaineritemstamp, tipo: 'primary', bodyContent: '' })
                : (template.sampleHtml || '');
            $body.removeClass('mdash-container-items-row').html('<div class="mdash-overlay-runtime-template">' + cardHtml + '</div>');
            var $templateRoot = $body.find('.mdash-overlay-runtime-template');
            var hostSelector = '#' + shell.bodyHostId + ' .mdash-overlay-runtime-template';
            overlayObjects.forEach(function (obj) {
                var slotId = obj.slotid || getMdashContainerItemMainSlotId(containerItem);
                var $slot = resolveMdashContainerItemSlot(containerItem, slotId, hostSelector);
                if (!$slot || !$slot.length) {
                    $slot = mdashFindLeafSlotsInRoot($templateRoot).first();
                }
                if (!$slot || !$slot.length) return;
                var hostId = 'cont-item-obj-overlay-' + obj.mdashcontaineritemobjectstamp;
                $slot.append(
                    '<div class="mdash-overlay-runtime-object-wrap">'
                    + '<div id="' + hostId + '" class="cont-item-object-rendered mdash-overlay-object-host"></div>'
                    + '</div>'
                );
                try {
                    obj.renderObjectByContainerItem('#' + hostId, containerItem);
                } catch (error) {
                    console.error('[MDash] erro a renderizar overlay (template)', obj.tipo, error);
                }
            });
            mdashShowItemOverlayModal($modal);
            return;
        }
    }

    $body.addClass('mdash-container-items-row');
    normalizeOverlayPlacesAutoLayout(containerItem.mdashcontaineritemstamp, overlayLayout.layoutmode || 'auto');

    var places = getItemOverlayPlaces(containerItem);
    if (places.length) {
        places.forEach(function (place) {
            var placeHostId = 'overlay-runtime-place-' + place.id;
            var gridStyle = getOverlayPlaceGridStyleString(place);
            var template = getTemplateLayoutByCode(place.templatelayout || getDefaultOverlayPlaceTemplateCodigo());
            if (template) ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
            $body.append(buildMdashOverlayRuntimePlaceHtml(placeHostId, gridStyle, template, place));

            getOverlayObjectsForPlace(containerItem.mdashcontaineritemstamp, place.id).forEach(function (obj) {
                var slotId = obj.slotid || getOverlayPlaceMainSlotId(place.templatelayout);
                var $slot = resolveMdashContainerItemSlot(containerItem, slotId, '#' + placeHostId);
                if (!$slot || !$slot.length) {
                    $slot = mdashFindLeafSlotsInRoot($('#' + placeHostId)).first();
                }
                if (!$slot || !$slot.length) return;
                var hostId = 'cont-item-obj-overlay-' + obj.mdashcontaineritemobjectstamp;
                $slot.append(
                    '<div class="mdash-overlay-runtime-object-wrap">'
                    + '<div id="' + hostId + '" class="cont-item-object-rendered mdash-overlay-object-host"></div>'
                    + '</div>'
                );
                try {
                    obj.renderObjectByContainerItem('#' + hostId, containerItem);
                } catch (error) {
                    console.error('[MDash] erro a renderizar overlay (zona)', obj.tipo, error);
                }
            });
        });
    } else {
        overlayObjects.forEach(function (obj) {
            var hostId = 'cont-item-obj-overlay-' + obj.mdashcontaineritemobjectstamp;
            var gridStyle = getOverlayObjectGridStyleString(obj);
            $body.append(buildMdashOverlayRuntimeCellHtml(hostId, gridStyle));
            try {
                obj.renderObjectByContainerItem('#' + hostId, containerItem);
            } catch (error) {
                console.error('[MDash] erro a renderizar overlay', obj.tipo, error);
            }
        });
    }

    mdashShowItemOverlayModal($modal);
}
window.mdashOpenItemOverlayRuntime = mdashOpenItemOverlayRuntime;

function mdashMountLegacyDetailButton(containerItem, detailObjects) {
    if (!containerItem || !detailObjects || !detailObjects.length || typeof $ !== 'function') return;

    var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
    var btnId = 'botao-detalhe-' + containerItem.mdashcontaineritemstamp;
    var modalId = 'detalhe-modal-' + containerItem.mdashcontaineritemstamp;
    var $footer = $(hostSelector + ' .mdash-card__footer').first();
    var $target = $footer.length ? $footer : $(hostSelector + ' .mdash-card__body, ' + hostSelector + ' .dashcard-body').first();

    if (!$('#' + btnId).length) {
        var btnHtml = '<button id="' + btnId + '" type="button" class="mdash-card__detail-btn" data-tooltip="true" title="Ver detalhes">'
            + '<i class="glyphicon glyphicon-search"></i>Detalhes</button>';
        $target.append(btnHtml);
    }

    if (!$('#' + modalId).length) {
        var modalHtml = generateModalHTML({
            title: 'Detalhes — ' + (containerItem.titulo || ''),
            id: modalId,
            customData: '',
            otherclassess: 'mdash-detail-modal',
            body: "<div id='detalhe-container-body-" + containerItem.mdashcontaineritemstamp + "'></div>",
            footerContent: ''
        });
        var $parent = $('#mainPage').length ? $('#mainPage') : $('body');
        $parent.append(modalHtml);
        $('#' + modalId + ' .modal-dialog').addClass('modal-lg');
    }

    $(document).off('click.' + btnId).on('click.' + btnId, '#' + btnId, function (e) {
        e.preventDefault();
        var $body = $('#detalhe-container-body-' + containerItem.mdashcontaineritemstamp).empty();
        detailObjects.forEach(function (obj) {
            var hostId = 'cont-item-obj-detalhe-' + obj.mdashcontaineritemobjectstamp;
            $body.append('<div id="' + hostId + '" class="cont-item-object-rendered"></div>');
            try { obj.renderObjectByContainerItem('#' + hostId, containerItem); } catch (err) { console.error(err); }
        });
        $('#' + modalId).modal('show');
    });
}
window.mdashMountLegacyDetailButton = mdashMountLegacyDetailButton;

function mdashMountItemOverlayButton(containerItem, runtimeCtx, interaction) {
    interaction = interaction || {};
    var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
    var btnId = 'mdash-item-overlay-btn-' + containerItem.mdashcontaineritemstamp;
    var $footer = $(hostSelector + ' .mdash-card__footer').first();
    var $target = $footer.length ? $footer : $(hostSelector + ' .mdash-card__body, ' + hostSelector + ' .dashcard-body').first();
    var label = interaction.buttonLabel || 'Ver detalhes';
    var icon = interaction.buttonIcon || 'glyphicon-search';

    if (!$('#' + btnId).length) {
        var btnHtml = '<button id="' + btnId + '" type="button" class="mdash-card__detail-btn mdash-item-overlay-trigger" data-tooltip="true" title="' + label + '">'
            + '<i class="glyphicon ' + icon + '"></i>' + label + '</button>';
        $target.append(btnHtml);
    }

    $(document).off('click.' + btnId).on('click.' + btnId, '#' + btnId, function (e) {
        e.preventDefault();
        e.stopPropagation();
        mdashOpenItemOverlayRuntime(containerItem, runtimeCtx, { title: interaction.modalTitle });
    });
}

function mdashBindItemInteractionRuntime(containerItem, runtimeCtx) {
    if (!containerItem || typeof $ !== 'function') return;

    var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
    var interaction = mdashGetItemPrimaryInteraction(containerItem);
    var itemStamp = containerItem.mdashcontaineritemstamp;
    var btnId = 'mdash-item-overlay-btn-' + itemStamp;

    $(hostSelector).removeClass('mdash-item-has-overlay mdash-item-interactive');
    $(hostSelector).off('click.mdashItemInteraction');
    $(document).off('click.' + btnId);
    $(hostSelector).find('.mdash-item-overlay-trigger').remove();

    if (!interaction || !interaction.enabled) return;

    var mdashInstance = (runtimeCtx && runtimeCtx.mdash) || containerItem._mdash || null;
    var allObjects = (mdashInstance && Array.isArray(mdashInstance.containerItemObjects))
        ? mdashInstance.containerItemObjects
        : [];
    var overlayObjects = mdashResolveItemOverlayObjects(containerItem, allObjects);

    if (interaction.behavior === 'openModal') {
        if (!overlayObjects.length) return;

        if (interaction.trigger === 'button') {
            mdashMountItemOverlayButton(containerItem, runtimeCtx, interaction);
        } else {
            $(hostSelector).addClass('mdash-item-has-overlay mdash-item-interactive');
            $(hostSelector).on('click.mdashItemInteraction', function (e) {
                if ($(e.target).closest('a,button,input,select,textarea,.mdash-card__action,.mdash-item-overlay-trigger').length) return;
                mdashOpenItemOverlayRuntime(containerItem, runtimeCtx, { title: interaction.modalTitle });
            });
        }
        return;
    }

    if (interaction.behavior === 'refresh') {
        $(hostSelector).addClass('mdash-item-interactive');
        $(hostSelector).on('click.mdashItemInteraction', function (e) {
            if ($(e.target).closest('a,button,input,select,textarea').length) return;
            if (typeof containerItem.refreshContent === 'function') {
                containerItem.refreshContent({ skipItemFetch: false });
            }
        });
        return;
    }

    if (interaction.behavior === 'navigate' && interaction.url) {
        $(hostSelector).addClass('mdash-item-interactive');
        $(hostSelector).on('click.mdashItemInteraction', function (e) {
            if ($(e.target).closest('a,button,input,select,textarea').length) return;
            window.location.href = interaction.url;
        });
        return;
    }

    if (interaction.behavior === 'expression' && interaction.expressaojs) {
        $(hostSelector).addClass('mdash-item-interactive');
        $(hostSelector).on('click.mdashItemInteraction', function (e) {
            if ($(e.target).closest('a,button,input,select,textarea').length) return;
            try {
                var fn = new Function('item', 'event', 'mdash', interaction.expressaojs);
                fn(containerItem, e, mdashInstance);
            } catch (err) {
                console.error('[MDash] expressão de acção do item', err);
            }
        });
    }
}
window.mdashBindItemInteractionRuntime = mdashBindItemInteractionRuntime;

function getItemOverlayLayoutConfig(item) {
    var cfg = (item && typeof item.getEventsConfig === 'function')
        ? item.getEventsConfig()
        : forceJSONParse(item && item.eventsconfigjson, getDefaultMdashItemEventsConfig());
    return Object.assign({ mode: 'grid', templatelayout: '', layoutmode: 'auto' }, (cfg && cfg.overlayLayout) || {});
}

function setItemOverlayLayoutConfig(item, overlayLayout) {
    if (!item) return;
    var cfg = item._eventsConfigCache || (typeof item.getEventsConfig === 'function'
        ? item.getEventsConfig()
        : forceJSONParse(item.eventsconfigjson, getDefaultMdashItemEventsConfig()));
    cfg.overlayLayout = Object.assign({ mode: 'grid', templatelayout: '', layoutmode: 'auto' }, overlayLayout || {});
    item._eventsConfigCache = cfg;
    item.eventsconfigjson = JSON.stringify(cfg);
    persistItemEventsConfig(item);
}

function getDefaultOverlayPlaceTemplateCodigo() {
    var options = getTemplateLayoutOptions();
    var plain = options.find(function (tpl) { return tpl.codigo === 'plain_card'; });
    if (plain) return 'plain_card';
    return getDefaultTemplateCodigo() || (options[0] && options[0].codigo) || 'plain_card';
}

function getOverlayPlaceMainSlotId(templateCodigo) {
    return getMdashContainerItemMainSlotId({ templatelayout: templateCodigo || getDefaultOverlayPlaceTemplateCodigo() });
}

function ensureOverlayPlaceGridMeta(place) {
    if (!place.overlayGrid || typeof place.overlayGrid !== 'object') {
        place.overlayGrid = { layoutmode: 'auto', gridrow: null, gridcolstart: null, gridrowspan: 1 };
    }
    return place.overlayGrid;
}

function getOverlayPlaceGridStyleString(place) {
    var gridMeta = ensureOverlayPlaceGridMeta(place);
    var pseudoItem = {
        tamanho: getItemGridSpan(place),
        gridrow: gridMeta.gridrow,
        gridcolstart: gridMeta.gridcolstart,
        gridrowspan: gridMeta.gridrowspan || 1,
        layoutmode: (gridMeta.gridrow && gridMeta.gridcolstart) ? 'manual' : 'auto'
    };
    return getItemGridStyleString(pseudoItem);
}

function persistItemOverlayPlaces(item, places) {
    if (!item) return;
    var cfg = item._eventsConfigCache || item.getEventsConfig();
    cfg.overlayPlaces = places || [];
    item._eventsConfigCache = cfg;
    persistItemEventsConfig(item);
}

function ensureOverlayPlacesFromLegacy(item) {
    if (!item) return [];
    var cfg = item._eventsConfigCache || item.getEventsConfig();
    if (Array.isArray(cfg.overlayPlaces) && cfg.overlayPlaces.length) {
        return cfg.overlayPlaces;
    }

    var itemStamp = item.mdashcontaineritemstamp;
    var allOverlay = getItemOverlayObjects(itemStamp);
    var knownPlaceIds = [];
    allOverlay.forEach(function (obj) {
        if (obj.config && obj.config.overlayPlaceId && knownPlaceIds.indexOf(obj.config.overlayPlaceId) < 0) {
            knownPlaceIds.push(obj.config.overlayPlaceId);
        }
    });

    if (knownPlaceIds.length) {
        cfg.overlayPlaces = knownPlaceIds.map(function (placeId, idx) {
            var linkedObj = allOverlay.find(function (o) {
                return o.config && o.config.overlayPlaceId === placeId;
            });
            var gridMeta = linkedObj ? ensureOverlayObjectGridMeta(linkedObj) : {};
            return {
                id: placeId,
                titulo: '',
                templatelayout: getDefaultOverlayPlaceTemplateCodigo(),
                tamanho: linkedObj ? getItemGridSpan(linkedObj) : 6,
                ordem: idx + 1,
                overlayGrid: {
                    layoutmode: gridMeta.layoutmode || 'auto',
                    gridrow: gridMeta.gridrow || null,
                    gridcolstart: gridMeta.gridcolstart || null,
                    gridrowspan: gridMeta.gridrowspan || 1
                }
            };
        });
        item._eventsConfigCache = cfg;
        return cfg.overlayPlaces;
    }

    var legacyObjects = allOverlay.filter(function (obj) {
        return !obj.config || !obj.config.overlayPlaceId;
    });

    if (!legacyObjects.length) {
        cfg.overlayPlaces = [];
        item._eventsConfigCache = cfg;
        return cfg.overlayPlaces;
    }

    cfg.overlayPlaces = legacyObjects.map(function (obj, idx) {
        var gridMeta = ensureOverlayObjectGridMeta(obj);
        return {
            id: generateUUID(),
            titulo: '',
            templatelayout: getDefaultOverlayPlaceTemplateCodigo(),
            tamanho: getItemGridSpan(obj),
            ordem: idx + 1,
            overlayGrid: {
                layoutmode: gridMeta.layoutmode || 'auto',
                gridrow: gridMeta.gridrow,
                gridcolstart: gridMeta.gridcolstart,
                gridrowspan: gridMeta.gridrowspan || 1
            }
        };
    });

    legacyObjects.forEach(function (obj, idx) {
        if (!obj.config || typeof obj.config !== 'object') {
            try { obj.config = JSON.parse(obj.configjson || '{}') || {}; } catch (e) { obj.config = {}; }
        }
        obj.config.overlayPlaceId = cfg.overlayPlaces[idx].id;
        obj.slotid = getOverlayPlaceMainSlotId(cfg.overlayPlaces[idx].templatelayout);
        syncOverlayObjectConfigjson(obj);
        if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
    });

    item._eventsConfigCache = cfg;
    persistItemEventsConfig(item);
    return cfg.overlayPlaces;
}

function getItemOverlayPlaces(item) {
    if (!item) return [];
    ensureOverlayPlacesFromLegacy(item);
    var cfg = item._eventsConfigCache || item.getEventsConfig();
    return (cfg.overlayPlaces || []).slice().sort(function (a, b) {
        return (a.ordem || 0) - (b.ordem || 0);
    });
}

function findOverlayPlace(item, placeId) {
    return getItemOverlayPlaces(item).find(function (place) { return place && place.id === placeId; }) || null;
}

function getOverlayObjectsForPlace(itemStamp, placeId) {
    return getItemOverlayObjects(itemStamp).filter(function (obj) {
        return obj && obj.config && obj.config.overlayPlaceId === placeId;
    });
}

function getDefaultOverlayPlaceSpan(itemStamp) {
    var item = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    var places = item ? getItemOverlayPlaces(item) : [];
    if (!places.length) return 6;

    var occupiedMap = {};
    var lastRow = 1;
    var lastRowUsed = 0;
    places.forEach(function (place) {
        var gridMeta = ensureOverlayPlaceGridMeta(place);
        var span = getItemGridSpan(place);
        var row = parseInt(gridMeta.gridrow, 10) || 1;
        var colStart = parseInt(gridMeta.gridcolstart, 10) || 1;
        markGridAreaOccupied(occupiedMap, row, colStart, span, 1);
        if (row >= lastRow) {
            lastRow = row;
            lastRowUsed = Math.max(lastRowUsed, (colStart + span - 1));
        }
    });

    var remaining = 12 - lastRowUsed;
    if (remaining >= 4) return Math.min(6, remaining);
    if (remaining >= 2) return remaining;
    return 6;
}

function addOverlayPlace(itemStamp, options) {
    options = options || {};
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return null;

    var places = getItemOverlayPlaces(containerItem);
    var maxOrdem = places.reduce(function (max, place) { return Math.max(max, place.ordem || 0); }, 0);
    var newPlace = {
        id: generateUUID(),
        titulo: options.titulo || '',
        templatelayout: options.templatelayout || getDefaultOverlayPlaceTemplateCodigo(),
        tamanho: options.tamanho || getDefaultOverlayPlaceSpan(itemStamp),
        ordem: maxOrdem + 1,
        overlayGrid: { layoutmode: 'auto', gridrow: null, gridcolstart: null, gridrowspan: 1 }
    };
    places.push(newPlace);
    persistItemOverlayPlaces(containerItem, places);
    if (!options.skipSync) {
        syncOverlayGridLayoutAfterChange(itemStamp, {
            preserveSelection: options.select === false ? undefined : newPlace.id,
            preserveSelectionType: 'overlayPlace',
            immediate: true
        });
    }
    return newPlace;
}

function setOverlayPlaceTemplate(itemStamp, placeId, templateCode) {
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem || !placeId || !templateCode) return;
    var places = getItemOverlayPlaces(containerItem);
    var place = places.find(function (p) { return p.id === placeId; });
    if (!place || place.templatelayout === templateCode) return;
    place.templatelayout = templateCode;
    getOverlayObjectsForPlace(itemStamp, placeId).forEach(function (obj) {
        obj.slotid = getOverlayPlaceMainSlotId(templateCode);
        syncOverlayObjectConfigjson(obj);
        if (typeof obj.stringifyJSONFields === 'function') obj.stringifyJSONFields();
    });
    persistItemOverlayPlaces(containerItem, places);
    refreshMdashOverlayDesignerSurface(itemStamp, { preserveSelection: placeId, preserveSelectionType: 'overlayPlace', immediate: true });
}

function deleteOverlayPlace(placeId, itemStamp) {
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return;

    var objs = window.appState.containerItemObjects || [];
    for (var i = objs.length - 1; i >= 0; i--) {
        var obj = objs[i];
        if (obj.mdashcontaineritemstamp === itemStamp
            && mdashGetObjectCategory(obj) === 'overlay'
            && obj.config
            && obj.config.overlayPlaceId === placeId) {
            GMdashDeleteRecords.push({ table: 'MdashContainerItemObject', stamp: obj.mdashcontaineritemobjectstamp, tableKey: 'mdashcontaineritemobjectstamp' });
            objs.splice(i, 1);
        }
    }

    var places = getItemOverlayPlaces(containerItem).filter(function (place) { return place.id !== placeId; });
    persistItemOverlayPlaces(containerItem, places);
    refreshMdashOverlayDesignerSurface(itemStamp);
    showOverlayDesignerPropsEmpty();
}

function normalizeOverlayPlacesAutoLayout(itemStamp, layoutMode) {
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return;

    var places = getItemOverlayPlaces(containerItem);
    if (!places.length) return;

    var occupiedMap = {};
    var autoCursorRow = 1;
    var autoCursorCol = 1;
    var mode = layoutMode || 'auto';

    places.forEach(function (place) {
        var gridMeta = ensureOverlayPlaceGridMeta(place);
        var span = getItemGridSpan(place);
        var rowSpan = parseInt(gridMeta.gridrowspan, 10) || 1;
        var isManual = mode === 'manual' && gridMeta.gridrow && gridMeta.gridcolstart;
        var preferredRow = isManual ? gridMeta.gridrow : autoCursorRow;
        var preferredCol = isManual ? gridMeta.gridcolstart : autoCursorCol;
        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        gridMeta.gridrow = slot.row;
        gridMeta.gridcolstart = slot.colStart;
        gridMeta.layoutmode = isManual ? 'manual' : 'auto';
        place.tamanho = span;

        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);

        if (!isManual) {
            autoCursorRow = slot.row;
            autoCursorCol = slot.colStart + span;
            while (autoCursorCol > 12) {
                autoCursorRow += 1;
                autoCursorCol = 1;
            }
        }
    });

    persistItemOverlayPlaces(containerItem, places);
}

function ensureOverlayObjectGridMeta(obj) {
    if (!obj.config || typeof obj.config !== 'object') {
        try { obj.config = JSON.parse(obj.configjson || '{}') || {}; } catch (e) { obj.config = {}; }
    }
    if (!obj.config.overlayGrid) {
        obj.config.overlayGrid = { layoutmode: 'auto', gridrow: null, gridcolstart: null, gridrowspan: 1 };
    }
    return obj.config.overlayGrid;
}

function syncOverlayObjectConfigjson(obj) {
    if (!obj.config) obj.config = {};
    obj.configjson = JSON.stringify(obj.config);
}

function getOverlayObjectGridStyleString(obj) {
    var gridMeta = ensureOverlayObjectGridMeta(obj);
    var pseudoItem = {
        tamanho: getItemGridSpan(obj),
        gridrow: gridMeta.gridrow,
        gridcolstart: gridMeta.gridcolstart,
        gridrowspan: gridMeta.gridrowspan || 1,
        layoutmode: (gridMeta.gridrow && gridMeta.gridcolstart) ? 'manual' : 'auto'
    };
    return getItemGridStyleString(pseudoItem);
}

function normalizeOverlayObjectsAutoLayout(itemStamp, layoutMode) {
    var objects = getItemOverlayObjects(itemStamp);
    if (!objects.length) return;

    var occupiedMap = {};
    var autoCursorRow = 1;
    var autoCursorCol = 1;
    var mode = layoutMode || 'auto';

    objects.forEach(function (obj) {
        var gridMeta = ensureOverlayObjectGridMeta(obj);
        var span = getItemGridSpan(obj);
        var rowSpan = parseInt(gridMeta.gridrowspan, 10) || 1;
        var isManual = mode === 'manual' && gridMeta.gridrow && gridMeta.gridcolstart;
        var preferredRow = isManual ? gridMeta.gridrow : autoCursorRow;
        var preferredCol = isManual ? gridMeta.gridcolstart : autoCursorCol;
        var slot = findNextGridSlot(occupiedMap, preferredRow, preferredCol, span, rowSpan);

        gridMeta.gridrow = slot.row;
        gridMeta.gridcolstart = slot.colStart;
        gridMeta.layoutmode = isManual ? 'manual' : 'auto';
        obj.tamanho = span;
        syncOverlayObjectConfigjson(obj);

        markGridAreaOccupied(occupiedMap, slot.row, slot.colStart, span, rowSpan);

        if (!isManual) {
            autoCursorRow = slot.row;
            autoCursorCol = slot.colStart + span;
            while (autoCursorCol > 12) {
                autoCursorRow += 1;
                autoCursorCol = 1;
            }
        }
    });
}

function syncOverlayGridLayoutAfterChange(itemStamp, options) {
    options = options || {};
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return;

    var layoutCfg = getItemOverlayLayoutConfig(containerItem);
    var layoutMode = layoutCfg.layoutmode || 'auto';

    if (layoutMode !== 'manual') {
        getItemOverlayPlaces(containerItem).forEach(function (place) {
            var gridMeta = ensureOverlayPlaceGridMeta(place);
            gridMeta.gridrow = null;
            gridMeta.gridcolstart = null;
            gridMeta.layoutmode = 'auto';
        });
        persistItemOverlayPlaces(containerItem, getItemOverlayPlaces(containerItem));
    }

    normalizeOverlayPlacesAutoLayout(itemStamp, layoutMode);

    if (options.layoutOnly) {
        applyOverlayDesignerLayoutOnly(itemStamp, options);
        return;
    }
    if (options.placeRefresh) {
        refreshOverlayDesignerPlace(itemStamp, options.placeRefresh, options);
        return;
    }
    refreshMdashOverlayDesignerSurface(itemStamp, options);
}

function applyOverlayDesignerLayoutOnly(itemStamp, options) {
    options = options || {};
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return;

    getItemOverlayPlaces(containerItem).forEach(function (place) {
        var span = getItemGridSpan(place);
        var $el = $('.mdash-overlay-canvas-place[data-place-id="' + place.id + '"]');
        if (!$el.length) return;
        $el.attr('style', getOverlayPlaceGridStyleString(place));
        var $badge = $el.find('.mdash-item-size-badge[data-place-id="' + place.id + '"]');
        if ($badge.length) {
            $badge.text(span + ' col').attr('title', 'Largura: ' + span + ' colunas');
        }
    });

    if (options.preserveSelection) {
        if (options.preserveSelectionType === 'overlayPlace') {
            selectOverlayDesignerPlace(options.preserveSelection, itemStamp);
        } else {
            selectOverlayDesignerObject(options.preserveSelection, itemStamp);
        }
    }
}

function refreshOverlayDesignerPlace(itemStamp, placeId, options) {
    options = options || {};
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    var place = containerItem ? findOverlayPlace(containerItem, placeId) : null;
    if (!place || !containerItem) {
        refreshMdashOverlayDesignerSurface(itemStamp, options);
        return;
    }

    var $placeEl = $('.mdash-overlay-canvas-place[data-place-id="' + placeId + '"]');
    if (!$placeEl.length) {
        refreshMdashOverlayDesignerSurface(itemStamp, options);
        return;
    }

    var template = getTemplateLayoutByCode(place.templatelayout || getDefaultOverlayPlaceTemplateCodigo());
    if (!template) return;

    ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
    var cardHtml = template.generateCard
        ? template.generateCard({ title: '', id: 'overlay-place-' + place.id, tipo: 'primary', bodyContent: '' })
        : (template.sampleHtml || '');
    $placeEl.find('.mdash-overlay-place-template').html(cardHtml);

    injectSlotDropOverlays(itemStamp, template, {
        bodySelector: '.mdash-overlay-place-template[data-place-id="' + place.id + '"]',
        overlayOnly: true,
        overlayDesigner: true,
        overlayPlaceId: place.id
    });

    if (options.preserveSelection) {
        if (options.preserveSelectionType === 'overlayPlace') {
            selectOverlayDesignerPlace(options.preserveSelection, itemStamp);
        } else {
            selectOverlayDesignerObject(options.preserveSelection, itemStamp);
        }
    }
}

var _overlayDesignerRefreshTimer = null;
var _overlayDesignerRefreshPending = null;

function refreshMdashOverlayDesignerSurface(itemStamp, options) {
    options = options || {};
    if (!$('#mdash-overlay-designer-host').length) return;

    if (options.immediate) {
        clearTimeout(_overlayDesignerRefreshTimer);
        _overlayDesignerRefreshPending = null;
        renderMdashItemEditSurface('#mdash-overlay-designer-host', itemStamp, options);
        return;
    }

    _overlayDesignerRefreshPending = { itemStamp: itemStamp, options: options };
    clearTimeout(_overlayDesignerRefreshTimer);
    _overlayDesignerRefreshTimer = setTimeout(function () {
        var pending = _overlayDesignerRefreshPending;
        _overlayDesignerRefreshPending = null;
        if (!pending || !$('#mdash-overlay-designer-host').length) return;
        renderMdashItemEditSurface('#mdash-overlay-designer-host', pending.itemStamp, pending.options);
    }, 100);
}
window.refreshMdashOverlayDesignerSurface = refreshMdashOverlayDesignerSurface;

function getDefaultOverlayObjectSpan(itemStamp) {
    return getDefaultOverlayPlaceSpan(itemStamp);
}

function mdashRefreshOverlayObjectPreview(objectStamp, containerItem) {
    var hostId = '#mdash-overlay-preview-' + objectStamp;
    var $host = $(hostId);
    if (!$host.length) return;
    var obj = (window.appState.containerItemObjects || []).find(function (o) {
        return o.mdashcontaineritemobjectstamp === objectStamp;
    });
    if (!obj || !containerItem) return;
    $host.empty();
    try {
        obj.renderObjectByContainerItem(hostId, containerItem);
    } catch (e) {
        console.warn('[MDash] refresh overlay preview', e);
    }
}

function buildOverlayDesignerCatalogHtml() {
    var catalog = getObjectCatalogDefinitions();
    var html = '<div class="mdash-objects-catalog" id="mdash-overlay-objects-catalog">';
    catalog.forEach(function (cat) {
        html += '<div class="mdash-obj-category">';
        html += '<p class="mdash-obj-category-label">' + cat.category + '</p>';
        html += '<div class="mdash-obj-tiles">';
        cat.items.forEach(function (obj) {
            html += '<div class="mdash-obj-tile mdash-overlay-obj-tile" data-object-type="' + obj.value + '" draggable="true" title="' + (obj.description || obj.label) + '">';
            html += '<div class="mdash-obj-tile-icon" style="background:' + obj.color + '"><i class="' + obj.icon + '"></i></div>';
            html += '<div class="mdash-obj-tile-info">';
            html += '<span class="mdash-obj-tile-name">' + obj.label + '</span>';
            html += '<span class="mdash-obj-tile-desc">' + (obj.description || '') + '</span>';
            html += '</div></div>';
        });
        html += '</div></div>';
    });
    html += '</div>';
    return html;
}

function buildOverlayDesignerShellHtml(itemStamp) {
    return ''
        + '<div class="mdash-overlay-designer-shell mdash-modern-layout" data-item-stamp="' + itemStamp + '">'
        + '  <div class="mdash-sidebar" id="mdash-overlay-designer-sidebar">'
        + '    <div class="mdash-sidebar-header">'
        + '      <h4><i class="glyphicon glyphicon-th"></i> Componentes</h4>'
        + '    </div>'
        + '    <div class="mdash-sidebar-body">'
        + '      <div class="mdash-widget-section">'
        + '        <p class="mdash-section-label">Adicionar</p>'
        + '        <button type="button" class="btn btn-default btn-sm btn-block" id="mdash-overlay-paste-btn" title="Colar objecto do clipboard">'
        + '          <i class="glyphicon glyphicon-paste"></i> Colar'
        + '        </button>'
        + '      </div>'
        + '      <div class="mdash-sidebar-divider"></div>'
        + '      <div class="mdash-objects-panel" style="padding:0;">'
        + buildOverlayDesignerCatalogHtml()
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '  <div class="mdash-canvas">'
        + '    <div class="mdash-canvas-body" id="mdash-overlay-canvas-body">'
        + '      <div id="mdash-overlay-designer-host"></div>'
        + '    </div>'
        + '  </div>'
        + '  <div class="mdash-properties" id="mdash-overlay-properties-root">'
        + '    <div class="mdash-props-component-header" id="mdash-overlay-props-component-header">'
        + '      <div class="mdash-props-component-info">'
        + '        <span class="mdash-props-component-icon"><i class="glyphicon glyphicon-hand-up"></i></span>'
        + '        <span class="mdash-props-component-name">Seleccione um objecto</span>'
        + '      </div>'
        + '      <button type="button" class="btn btn-link btn-xs" id="mdash-overlay-delete-selected" title="Eliminar objecto" style="display:none;color:rgba(255,255,255,0.85);">'
        + '        <i class="glyphicon glyphicon-trash"></i>'
        + '      </button>'
        + '    </div>'
        + '    <ul class="mdash-props-tabs">'
        + '      <li class="mdash-props-tab is-active" data-tab="properties" title="Propriedades"><i class="glyphicon glyphicon-wrench"></i><span>Propriedades</span></li>'
        + '      <li class="mdash-props-tab" data-tab="fontes" title="Fontes de Dados"><i class="glyphicon glyphicon-hdd"></i><span>Fontes</span></li>'
        + '    </ul>'
        + '    <div class="mdash-props-tab-content">'
        + '      <div class="mdash-props-tab-pane is-active" data-tab-pane="properties" id="mdash-overlay-props-panel">'
        + '        <div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hand-up"></i><p>Seleccione um objecto para editar propriedades</p></div>'
        + '      </div>'
        + '      <div class="mdash-props-tab-pane" data-tab-pane="fontes" id="mdash-overlay-fontes-panel">'
        + '        <div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hdd"></i><p>Seleccione um objecto para gerir fontes</p></div>'
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>';
}

function updateOverlayDesignerPasteButtonState() {
    var $btn = $('#mdash-overlay-paste-btn');
    if (!$btn.length) return;
    var canPaste = !!(GMDashClipboard && GMDashClipboard.type === 'object' && GMDashClipboard.items.length);
    $btn.prop('disabled', !canPaste);
    $btn.toggleClass('disabled', !canPaste);
    $btn.attr('title', canPaste ? 'Colar objecto do clipboard' : 'Copie um objecto (Ctrl+C) antes de colar');
}

function initOverlayDesignerCatalogInteractions(itemStamp) {
    var $modal = $('#mdash-overlay-designer-modal');
    if (!$modal.length) return;

    $modal.off('click.overlayCatalogAdd').on('click.overlayCatalogAdd', '.mdash-overlay-obj-tile', function (e) {
        e.preventDefault();
        var tipo = $(this).data('object-type');
        if (tipo) addOverlayContainerItemObject(itemStamp, tipo);
    });

    $modal.off('dragstart.overlayCatalog').on('dragstart.overlayCatalog', '.mdash-overlay-obj-tile', function (e) {
        var tipo = $(this).data('object-type');
        var catalog = getObjectCatalogDefinitions();
        var objDef = null;
        catalog.some(function (cat) {
            return cat.items.some(function (item) {
                if (item.value === tipo) { objDef = item; return true; }
                return false;
            });
        });
        if (objDef && e.originalEvent && e.originalEvent.dataTransfer) {
            e.originalEvent.dataTransfer.setData('application/mdash-object', JSON.stringify(objDef));
            e.originalEvent.dataTransfer.effectAllowed = 'copy';
        }
    });
}

function showOverlayDesignerPropsEmpty() {
    _currentSelectedComponent = null;
    updatePropsComponentHeader(null, { headerId: 'mdash-overlay-props-component-header' });
    $('#mdash-overlay-props-panel').html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hand-up"></i><p>Seleccione um objecto para editar propriedades</p></div>');
    $('#mdash-overlay-fontes-panel').html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hdd"></i><p>Seleccione um objecto para gerir fontes</p></div>');
    $('#mdash-overlay-delete-selected').hide();
    activateOverlayDesignerTab('properties');
}

function selectOverlayDesignerPlace(placeId, itemStamp) {
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    var place = containerItem ? findOverlayPlace(containerItem, placeId) : null;
    if (!place) return;

    $('.mdash-overlay-canvas-place, .mdash-overlay-canvas-object, .mdash-slot-zone-render').removeClass('is-selected');
    $('.mdash-overlay-canvas-place[data-place-id="' + placeId + '"]').addClass('is-selected');

    _currentSelectedComponent = {
        type: 'overlayPlace',
        stamp: placeId,
        data: Object.assign({}, place, { mainSlotId: getOverlayPlaceMainSlotId(place.templatelayout) }),
        surface: 'overlay'
    };

    var template = getTemplateLayoutByCode(place.templatelayout);
    var label = (template && (template.descricao || template.codigo)) || 'Zona';
    updatePropsComponentHeader({
        type: 'overlayPlace',
        stamp: placeId,
        data: { tipo: 'overlayPlace', titulo: place.titulo || label }
    }, { headerId: 'mdash-overlay-props-component-header' });
    $('#mdash-overlay-delete-selected').show();

    $('#mdash-overlay-props-panel').html(
        '<div class="panel panel-default" style="margin:0;border:none;box-shadow:none;">'
        + '<div class="panel-body" style="padding:12px;">'
        + '<div class="form-group"><label>Título da zona</label>'
        + '<input type="text" class="form-control input-sm" id="mdash-overlay-place-title" value="' + (place.titulo || '').replace(/"/g, '&quot;') + '" placeholder="Opcional"></div>'
        + '<p class="text-muted" style="font-size:11px;margin:0;">Use o selector de layout no header da zona para alternar entre Plain Card e outros cards.</p>'
        + '</div></div>'
    );
    $('#mdash-overlay-fontes-panel').html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-hdd"></i><p>As fontes pertencem aos objectos dentro da zona</p></div>');
    activateOverlayDesignerTab('properties');

    $('#mdash-overlay-place-title').off('input.overlayPlaceTitle').on('input.overlayPlaceTitle', function () {
        place.titulo = $(this).val();
        persistItemOverlayPlaces(containerItem, getItemOverlayPlaces(containerItem));
        $('.mdash-overlay-canvas-place[data-place-id="' + placeId + '"] .mdash-overlay-place-title-input').val(place.titulo);
    });
}

function buildOverlayPlaceLayoutPickerHtml(place) {
    var templateOptions = getTemplateLayoutOptions();
    var currentTemplate = getTemplateLayoutByCode(place.templatelayout);
    var currentLabel = (currentTemplate && (currentTemplate.descricao || currentTemplate.codigo)) || 'Layout';
    var html = '<div class="mdash-inline-layout-picker mdash-overlay-place-layout-picker" data-place-id="' + place.id + '">';
    html += '<button type="button" class="mdash-inline-layout-trigger mdash-overlay-place-layout-trigger" title="Alterar layout da zona">';
    html += '<span class="mdash-inline-layout-thumb">' + getTemplateThumbnailHtml(place.templatelayout) + '</span>';
    html += '<span class="mdash-inline-layout-name">' + currentLabel + '</span>';
    html += '<i class="glyphicon glyphicon-chevron-down"></i></button>';
    html += '<div class="mdash-inline-layout-menu mdash-overlay-place-layout-menu" style="display:none;">';
    templateOptions.forEach(function (tpl) {
        html += '<button type="button" class="mdash-inline-layout-option mdash-overlay-place-layout-option" data-template-code="' + tpl.codigo + '">';
        html += '<span class="mdash-inline-layout-thumb">' + getTemplateThumbnailHtml(tpl.codigo) + '</span>';
        html += '<span class="mdash-inline-layout-name">' + (tpl.descricao || tpl.codigo) + '</span>';
        html += '</button>';
    });
    html += '</div></div>';
    return html;
}

function renderOverlayPlaceDesignerCell(place, itemStamp, containerItem) {
    var template = getTemplateLayoutByCode(place.templatelayout || getDefaultOverlayPlaceTemplateCodigo());
    var gridStyle = getOverlayPlaceGridStyleString(place);
    var sizeCols = parseInt(place.tamanho, 10) || 6;
    var templateLabel = (template && (template.descricao || template.codigo)) || 'Zona';
    var placeTitle = (place.titulo || '').trim() || templateLabel;

    var html = '<div class="mdash-canvas-item mdash-overlay-canvas-place" data-place-id="' + place.id + '" style="' + gridStyle + '">';
    html += '<div class="mdash-canvas-item-card">';
    html += '<div class="mdash-item-resize-handle mdash-item-resize-handle-left" title="Redimensionar"></div>';
    html += '<div class="mdash-item-resize-handle mdash-item-resize-handle-right" title="Redimensionar"></div>';
    html += '<div class="mdash-canvas-item-header">';
    html += '<div class="mdash-item-header-top">';
    html += '<div class="mdash-overlay-item-drag-handle" title="Arrastar para reposicionar"><i class="glyphicon glyphicon-move"></i></div>';
    html += '<div class="mdash-item-title-wrapper">';
    html += '<input type="text" class="mdash-inline-title mdash-inline-title-sm mdash-overlay-place-title-input" data-place-id="' + place.id + '" value="' + (place.titulo || '').replace(/"/g, '&quot;') + '" placeholder="' + templateLabel + '">';
    html += '<span class="mdash-item-size-badge" data-place-id="' + place.id + '" title="Largura: ' + sizeCols + ' colunas">' + sizeCols + ' col</span>';
    html += '</div>';
    html += '<div class="mdash-item-header-actions">';
    html += '<button type="button" class="btn btn-xs btn-primary mdash-overlay-place-delete" data-place-id="' + place.id + '" title="Eliminar zona"><i class="glyphicon glyphicon-trash"></i></button>';
    html += '</div></div>';
    html += '<div class="mdash-item-header-bottom">';
    html += buildOverlayPlaceLayoutPickerHtml(place);
    html += '</div></div>';
    html += '<div class="mdash-canvas-item-body mdash-overlay-place-body">';
    if (template) {
        ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
        var cardHtml = template.generateCard
            ? template.generateCard({ title: '', id: 'overlay-place-' + place.id, tipo: 'primary', bodyContent: '' })
            : (template.sampleHtml || '');
        html += '<div class="mdash-overlay-place-template" data-place-id="' + place.id + '">' + cardHtml + '</div>';
    } else {
        html += '<div class="mdash-overlay-designer-empty">Layout não encontrado.</div>';
    }
    html += '</div></div></div>';
    return html;
}

function initOverlayPlaceLayoutPickers(itemStamp) {
    var $host = $('#mdash-overlay-designer-host');
    $host.off('click.overlayPlaceLayoutTrigger').on('click.overlayPlaceLayoutTrigger', '.mdash-overlay-place-layout-trigger', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $picker = $(this).closest('.mdash-overlay-place-layout-picker');
        $host.find('.mdash-overlay-place-layout-menu').not($picker.find('.mdash-overlay-place-layout-menu')).hide();
        $picker.find('.mdash-overlay-place-layout-menu').toggle();
    });
    $host.off('click.overlayPlaceLayoutOption').on('click.overlayPlaceLayoutOption', '.mdash-overlay-place-layout-option', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var placeId = $(this).closest('[data-place-id]').data('place-id');
        var templateCode = $(this).data('template-code');
        $host.find('.mdash-overlay-place-layout-menu').hide();
        if (placeId && templateCode) setOverlayPlaceTemplate(itemStamp, placeId, templateCode);
    });
    $(document).off('click.overlayPlaceLayoutDismiss').on('click.overlayPlaceLayoutDismiss', function (e) {
        if ($(e.target).closest('.mdash-overlay-place-layout-picker').length) return;
        $host.find('.mdash-overlay-place-layout-menu').hide();
    });
}

function selectOverlayDesignerObject(objectStamp, itemStamp) {
    var obj = (window.appState.containerItemObjects || []).find(function (o) {
        return o.mdashcontaineritemobjectstamp === objectStamp;
    });
    if (!obj) return;

    $('.mdash-overlay-canvas-place, .mdash-overlay-canvas-object, .mdash-slot-zone-render').removeClass('is-selected');
    $('.mdash-overlay-canvas-object[data-stamp="' + objectStamp + '"]').addClass('is-selected');
    $('#mdash-slot-render-' + objectStamp).addClass('is-selected');
    if (obj.config && obj.config.overlayPlaceId) {
        $('.mdash-overlay-canvas-place[data-place-id="' + obj.config.overlayPlaceId + '"]').addClass('is-selected');
    }

    _currentSelectedComponent = {
        type: 'object',
        stamp: objectStamp,
        data: obj,
        surface: 'overlay'
    };

    updatePropsComponentHeader(_currentSelectedComponent, { headerId: 'mdash-overlay-props-component-header' });
    $('#mdash-overlay-delete-selected').show();

    showObjectPropertiesEditor(obj, '#mdash-overlay-props-panel');
    renderFontesPanel(_currentSelectedComponent, '#mdash-overlay-fontes-panel');
}

function _deleteOverlayObject(objectStamp, itemStamp) {
    var objs = window.appState.containerItemObjects || [];
    var idx = objs.findIndex(function (o) { return o.mdashcontaineritemobjectstamp === objectStamp; });
    if (idx < 0) return;
    var removed = objs[idx];
    var placeId = removed && removed.config && removed.config.overlayPlaceId;
    GMdashDeleteRecords.push({ table: 'MdashContainerItemObject', stamp: objectStamp, tableKey: 'mdashcontaineritemobjectstamp' });
    objs.splice(idx, 1);

    if ($('#mdash-overlay-designer-modal').is(':visible')) {
        if (placeId) {
            syncOverlayGridLayoutAfterChange(itemStamp, { placeRefresh: placeId });
        } else {
            refreshMdashOverlayDesignerSurface(itemStamp, { immediate: true });
        }
        showOverlayDesignerPropsEmpty();
    } else if (typeof renderContainerItemTemplate === 'function') {
        var item = (window.appState.containerItems || []).find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
        if (item) renderContainerItemTemplate(item);
    }
}

function addOverlayContainerItemObject(itemStamp, tipo, slotId, options) {
    options = options || {};
    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    var layoutCfg = getItemOverlayLayoutConfig(containerItem);
    var place = null;
    var resolvedSlot = slotId;
    var createdNewPlace = false;

    if (layoutCfg.mode === 'template' && layoutCfg.templatelayout && containerItem) {
        resolvedSlot = slotId || getMdashContainerItemMainSlotId({
            templatelayout: layoutCfg.templatelayout,
            slotsconfigjson: containerItem.slotsconfigjson || '[]'
        });
    } else {
        if (options.placeId) {
            place = findOverlayPlace(containerItem, options.placeId);
        } else if (_currentSelectedComponent
            && _currentSelectedComponent.type === 'overlayPlace'
            && _currentSelectedComponent.stamp) {
            place = findOverlayPlace(containerItem, _currentSelectedComponent.stamp);
        }
        if (!place) {
            place = addOverlayPlace(itemStamp, { select: false, skipSync: true, tamanho: getDefaultOverlayPlaceSpan(itemStamp) });
            createdNewPlace = true;
        }
        resolvedSlot = slotId || getOverlayPlaceMainSlotId(place.templatelayout);
    }

    var maxOrdem = (window.appState.containerItemObjects || [])
        .filter(function (o) { return o.mdashcontaineritemstamp === itemStamp && mdashGetObjectCategory(o) === 'overlay'; })
        .reduce(function (max, o) { return Math.max(max, o.ordem || 0); }, 0);
    var newObj = new MdashContainerItemObject({
        mdashcontaineritemstamp: itemStamp,
        dashboardstamp: GMDashStamp,
        tipo: tipo || 'table',
        categoria: 'overlay',
        slotid: resolvedSlot || MDASH_ITEM_OVERLAY_SLOT,
        tamanho: getDefaultOverlayObjectSpan(itemStamp),
        ordem: maxOrdem + 1
    });
    if (place) {
        if (!newObj.config || typeof newObj.config !== 'object') newObj.config = {};
        newObj.config.overlayPlaceId = place.id;
        syncOverlayObjectConfigjson(newObj);
    }
    window.appState.containerItemObjects.push(newObj);
    if (typeof newObj.stringifyJSONFields === 'function') newObj.stringifyJSONFields();
    if (typeof realTimeComponentSync === 'function') realTimeComponentSync(newObj, newObj.table, newObj.idfield);
    if (createdNewPlace) {
        syncOverlayGridLayoutAfterChange(itemStamp, { preserveSelection: newObj.mdashcontaineritemobjectstamp, immediate: true });
    } else if (place && place.id) {
        syncOverlayGridLayoutAfterChange(itemStamp, { placeRefresh: place.id, preserveSelection: newObj.mdashcontaineritemobjectstamp });
    } else {
        syncOverlayGridLayoutAfterChange(itemStamp, { preserveSelection: newObj.mdashcontaineritemobjectstamp, immediate: true });
    }
}

function renderOverlayTemplateDesignerCanvas(itemStamp, containerItem, templateCodigo) {
    var template = getTemplateLayoutByCode(templateCodigo);
    if (!template) {
        return '<div class="mdash-overlay-designer-empty">Layout não encontrado.</div>';
    }

    ensureMdashCDNsLoaded(template.cssCdnsList, template.jsCdnsList);
    var html = template.generateCard
        ? template.generateCard({ title: 'Pré-visualização', id: 'overlay-design-' + itemStamp, tipo: 'primary', bodyContent: '' })
        : (template.sampleHtml || '');

    return '<div class="mdash-overlay-template-canvas" data-item-stamp="' + itemStamp + '">' + html + '</div>';
}

function renderOverlayGridDesignerCanvas(itemStamp, containerItem, layoutMode) {
    var places = getItemOverlayPlaces(containerItem);
    normalizeOverlayPlacesAutoLayout(itemStamp, layoutMode || 'auto');

    var html = '<div class="mdash-overlay-objects-row mdash-container-items-row" data-item-stamp="' + itemStamp + '">';
    if (!places.length) {
        html += '<div class="mdash-overlay-designer-empty mdash-overlay-designer-empty--inline">Adicione uma zona (card/plain) e depois arraste ou cole objectos para dentro — cada zona pode ter layout diferente</div>';
    } else {
        places.forEach(function (place) {
            html += renderOverlayPlaceDesignerCell(place, itemStamp, containerItem);
        });
    }
    html += '</div>';
    return html;
}

function initOverlayDesignerGridInteractions(itemStamp, containerItem) {
    var $row = $('.mdash-overlay-objects-row[data-item-stamp="' + itemStamp + '"]');
    if (!$row.length) return;

    if ($row.data('ui-sortable')) {
        $row.sortable('destroy');
    }

    $row.sortable({
        items: '.mdash-overlay-canvas-place',
        handle: '.mdash-overlay-item-drag-handle',
        cancel: '.mdash-item-resize-handle, .mdash-item-resize-handle *, .mdash-overlay-place-delete, .mdash-overlay-place-body, .mdash-overlay-place-body *, .mdash-inline-layout-picker, .mdash-inline-layout-picker *',
        helper: 'clone',
        appendTo: '#mdash-overlay-designer-modal .mdash-overlay-designer-canvas',
        zIndex: 10050,
        placeholder: 'mdash-item-sort-placeholder',
        forcePlaceholderSize: true,
        refreshPositions: true,
        tolerance: 'pointer',
        distance: 8,
        start: function (event, ui) {
            if (GMDashIsResizingItem) return false;
            ui.placeholder.height(ui.item.outerHeight());
            var span = ui.item.css('grid-column') || ui.item.css('gridColumn');
            if (span) ui.placeholder.css('grid-column', span);
            if (ui.helper) {
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
        stop: function (event, ui) {
            var movedPlaceId = ui.item.data('place-id');
            var places = getItemOverlayPlaces(containerItem);
            var orderMap = {};
            $row.find('.mdash-overlay-canvas-place').each(function (idx) {
                var placeId = $(this).data('place-id');
                if (placeId) orderMap[placeId] = idx + 1;
            });
            places.forEach(function (place) {
                if (orderMap[place.id]) place.ordem = orderMap[place.id];
            });
            persistItemOverlayPlaces(containerItem, places);
            syncOverlayGridLayoutAfterChange(itemStamp, {
                preserveSelection: movedPlaceId,
                preserveSelectionType: 'overlayPlace',
                layoutOnly: true
            });
        }
    });

    $row.off('click.overlayPlaceDelete').on('click.overlayPlaceDelete', '.mdash-overlay-place-delete', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var placeId = $(this).data('place-id');
        if (!placeId) return;
        if (typeof showDeleteConfirmation === 'function') {
            showDeleteConfirmation({
                title: 'Eliminar zona',
                message: 'Tem a certeza que deseja eliminar esta zona e os objectos dentro dela?',
                onConfirm: function () {
                    deleteOverlayPlace(placeId, itemStamp);
                }
            });
        } else if (window.confirm('Eliminar esta zona da modal?')) {
            deleteOverlayPlace(placeId, itemStamp);
        }
    });

    $row.off('click.overlayPlaceSelect').on('click.overlayPlaceSelect', '.mdash-overlay-canvas-place', function (e) {
        if ($(e.target).closest('.mdash-item-resize-handle, .mdash-overlay-place-delete, .mdash-overlay-item-drag-handle, .mdash-inline-layout-picker, .mdash-slot-zone-drop, .mdash-slot-zone-toolbar, .mdash-slot-zone-render').length) return;
        selectOverlayDesignerPlace($(this).data('place-id'), itemStamp);
    });

    $row.off('dragover.overlayGridDrop dragleave.overlayGridDrop drop.overlayGridDrop');
    $row.on('dragover.overlayGridDrop', function (e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        $(this).addClass('drag-over');
    });
    $row.on('dragleave.overlayGridDrop', function () {
        $(this).removeClass('drag-over');
    });
    $row.on('drop.overlayGridDrop', function (e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
        var raw = e.originalEvent.dataTransfer.getData('application/mdash-object');
        if (!raw) return;
        var objDef;
        try { objDef = JSON.parse(raw); } catch (err) { return; }
        if (objDef && objDef.value) addOverlayContainerItemObject(itemStamp, objDef.value);
    });

    initOverlayPlaceLayoutPickers(itemStamp);

    getItemOverlayPlaces(containerItem).forEach(function (place) {
        var template = getTemplateLayoutByCode(place.templatelayout || getDefaultOverlayPlaceTemplateCodigo());
        if (!template) return;
        injectSlotDropOverlays(itemStamp, template, {
            bodySelector: '.mdash-overlay-place-template[data-place-id="' + place.id + '"]',
            overlayOnly: true,
            overlayDesigner: true,
            overlayPlaceId: place.id
        });
    });
}

function renderMdashItemEditSurface(hostSelector, itemStamp, options) {
    options = options || {};
    var $host = $(hostSelector);
    if (!$host.length) return;

    var containerItem = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!containerItem) return;

    var layoutCfg = getItemOverlayLayoutConfig(containerItem);
    var templateOptions = getTemplateLayoutOptions().map(function (tpl) {
        return { value: tpl.codigo, label: tpl.descricao || tpl.codigo };
    });

    var html = '<div class="mdash-overlay-designer" data-item-stamp="' + itemStamp + '">';
    html += '<div class="mdash-canvas-commandbar">';
    html += '<div class="mdash-commandbar-title"><i class="glyphicon glyphicon-new-window"></i> Conteúdo da modal</div>';
    html += '<div class="mdash-commandbar-actions">';
    html += '<label class="mdash-overlay-layout-picker" style="margin:0;display:inline-flex;align-items:center;gap:6px;">';
    html += '<span style="font-size:11px;font-weight:600;">Layout</span>';
    html += '<select class="form-control input-sm" id="mdash-overlay-layout-mode" style="width:auto;min-width:150px;height:28px;">';
    html += '<option value="grid"' + (layoutCfg.mode === 'grid' ? ' selected' : '') + '>Grelha livre (body)</option>';
    html += '<option value="template"' + (layoutCfg.mode === 'template' ? ' selected' : '') + '>Card com slots</option>';
    html += '</select>';
    html += '<select class="form-control input-sm" id="mdash-overlay-template-select" style="display:' + (layoutCfg.mode === 'template' ? 'inline-block' : 'none') + ';width:auto;min-width:180px;height:28px;">';
    html += '<option value="">— escolher layout —</option>';
    templateOptions.forEach(function (tpl) {
        html += '<option value="' + tpl.value + '"' + (layoutCfg.templatelayout === tpl.value ? ' selected' : '') + '>' + tpl.label + '</option>';
    });
    html += '</select>';
    html += '<span class="text-muted" style="font-size:11px;margin-left:4px;">Grelha 12 colunas — cada zona pode ter card/plain diferente; arraste objectos para dentro</span>';
    html += '<button type="button" class="btn btn-default btn-xs" id="mdash-overlay-add-place-btn" style="margin-left:8px;"><i class="glyphicon glyphicon-plus"></i> Zona</button>';
    html += '</label></div></div>';
    html += '<div class="mdash-overlay-designer-canvas">';

    if (layoutCfg.mode === 'template' && layoutCfg.templatelayout) {
        html += renderOverlayTemplateDesignerCanvas(itemStamp, containerItem, layoutCfg.templatelayout);
    } else {
        html += renderOverlayGridDesignerCanvas(itemStamp, containerItem, layoutCfg.layoutmode);
    }

    html += '</div></div>';
    $host.html(html);

    if (layoutCfg.mode === 'template' && layoutCfg.templatelayout) {
        var template = getTemplateLayoutByCode(layoutCfg.templatelayout);
        if (template && template.htmltemplate) {
            injectSlotDropOverlays(itemStamp, template, {
                bodySelector: '.mdash-overlay-template-canvas[data-item-stamp="' + itemStamp + '"]',
                overlayOnly: true,
                overlayDesigner: true
            });
        }
    } else {
        initOverlayDesignerGridInteractions(itemStamp, containerItem);
    }

    $host.off('.overlayDesigner');
    $host.on('click.overlayDesigner', '#mdash-overlay-add-place-btn', function (e) {
        e.preventDefault();
        addOverlayPlace(itemStamp);
    });
    $host.on('change.overlayDesigner', '#mdash-overlay-layout-mode', function () {
        var mode = $(this).val() || 'grid';
        setItemOverlayLayoutConfig(containerItem, {
            mode: mode,
            templatelayout: mode === 'template' ? layoutCfg.templatelayout : '',
            layoutmode: layoutCfg.layoutmode || 'auto'
        });
        refreshMdashOverlayDesignerSurface(itemStamp);
    });
    $host.on('change.overlayDesigner', '#mdash-overlay-template-select', function () {
        setItemOverlayLayoutConfig(containerItem, {
            mode: 'template',
            templatelayout: $(this).val() || '',
            layoutmode: layoutCfg.layoutmode || 'auto'
        });
        refreshMdashOverlayDesignerSurface(itemStamp);
    });

    if (options.preserveSelection) {
        if (options.preserveSelectionType === 'overlayPlace') {
            selectOverlayDesignerPlace(options.preserveSelection, itemStamp);
        } else {
            selectOverlayDesignerObject(options.preserveSelection, itemStamp);
        }
    }
}
window.renderMdashItemEditSurface = renderMdashItemEditSurface;

function openOverlayDesignerModal(itemStamp) {
    var item = (window.appState.containerItems || []).find(function (i) {
        return i.mdashcontaineritemstamp === itemStamp;
    });
    if (!item) {
        if (typeof alertify !== 'undefined') alertify.error('Item não encontrado');
        return;
    }

    resetModalOpenState('#mdash-overlay-designer-modal');
    var modalData = {
        title: '<i class="glyphicon glyphicon-new-window"></i> Conteúdo da modal — ' + (item.titulo || item.codigo || ''),
        id: 'mdash-overlay-designer-modal',
        dialogClass: 'mdash-overlay-designer-dialog',
        body: buildOverlayDesignerShellHtml(itemStamp),
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>'
    };

    $('body').append(generateModalHTML(modalData));
    var $modal = $('#' + modalData.id);
    $modal.data('item-stamp', itemStamp);
    applyMdashThemeToElement($modal[0]);
    applyMdashThemeToElement($modal.find('.mdash-overlay-designer-shell')[0]);
    $modal.find('.modal-dialog').css({ width: '98%', maxWidth: '1680px', margin: '12px auto' });
    $modal.find('.modal-body').css({ padding: '0', maxHeight: 'calc(100vh - 120px)', overflow: 'hidden' });

    showOverlayDesignerPropsEmpty();
    initOverlayDesignerCatalogInteractions(itemStamp);
    renderMdashItemEditSurface('#mdash-overlay-designer-host', itemStamp, { immediate: true });

    $modal.off('click.overlayPaste').on('click.overlayPaste', '#mdash-overlay-paste-btn', function (e) {
        e.preventDefault();
        if ($(this).prop('disabled')) return;
        if (typeof mdashPasteClipboard === 'function') mdashPasteClipboard();
    });

    updateOverlayDesignerPasteButtonState();
    $modal.off('shown.bs.modal.overlayPaste').on('shown.bs.modal.overlayPaste', function () {
        updateOverlayDesignerPasteButtonState();
    });

    $modal.off('click.overlayDeleteSelected').on('click.overlayDeleteSelected', '#mdash-overlay-delete-selected', function (e) {
        e.preventDefault();
        if (_currentSelectedComponent && _currentSelectedComponent.surface === 'overlay') {
            if (_currentSelectedComponent.type === 'overlayPlace' && _currentSelectedComponent.stamp) {
                deleteOverlayPlace(_currentSelectedComponent.stamp, itemStamp);
            } else if (_currentSelectedComponent.stamp) {
                _deleteOverlayObject(_currentSelectedComponent.stamp, itemStamp);
            }
        }
    });

    $modal.on('hidden.bs.modal', function () {
        $modal.removeData('item-stamp');
        if (typeof renderContainerItemTemplate === 'function') renderContainerItemTemplate(item);
    });
    $modal.modal('show');
}
window.openOverlayDesignerModal = openOverlayDesignerModal;

function renderMdashItemActionsPanel(selectedComponent) {
    var $panel = $('#mdash-actions-panel');
    if (!$panel.length) return;

    if (!selectedComponent || selectedComponent.type !== 'containerItem' || !selectedComponent.data) {
        $panel.html('<div class="mdash-props-empty-state" style="padding-top:40px;"><i class="glyphicon glyphicon-flash"></i><p>Selecione um item para configurar acções</p></div>');
        return;
    }

    var item = selectedComponent.data;
    var cfg = (typeof item.getEventsConfig === 'function')
        ? item.getEventsConfig()
        : forceJSONParse(item.eventsconfigjson, getDefaultMdashItemEventsConfig());
    item._eventsConfigCache = cfg;
    var interaction = (cfg.interactions && cfg.interactions[0]) ? cfg.interactions[0] : getDefaultMdashItemEventsConfig().interactions[0];
    var overlayCount = getItemOverlayObjects(item.mdashcontaineritemstamp).length;

    var html = '<div class="mdash-item-actions-editor" data-item-stamp="' + item.mdashcontaineritemstamp + '">';
    html += '<div class="mdash-prop-section">';
    html += '<div class="mdash-prop-section-header is-open" data-toggle-section="item-actions-main">';
    html += '<span class="mdash-prop-section-title"><i class="glyphicon glyphicon-flash"></i> Interacção principal</span>';
    html += '<i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i></div>';
    html += '<div class="mdash-prop-section-body" id="item-actions-main">';

    html += '<div class="form-group"><label class="checkbox-inline">';
    html += '<input type="checkbox" id="mdash-action-enabled"' + (interaction.enabled ? ' checked' : '') + '> Activar acção</label></div>';

    html += '<div class="form-group"><label>Comportamento</label>';
    html += '<select class="form-control input-sm" id="mdash-action-behavior">';
    [
        { v: 'openModal', l: 'Abrir modal' },
        { v: 'refresh', l: 'Actualizar item' },
        { v: 'navigate', l: 'Navegar (URL)' },
        { v: 'expression', l: 'Expressão JS' }
    ].forEach(function (opt) {
        html += '<option value="' + opt.v + '"' + (interaction.behavior === opt.v ? ' selected' : '') + '>' + opt.l + '</option>';
    });
    html += '</select></div>';

    html += '<div class="form-group mdash-action-field mdash-action-field--trigger">';
    html += '<label>Disparador</label><select class="form-control input-sm" id="mdash-action-trigger">';
    html += '<option value="click"' + (interaction.trigger === 'click' ? ' selected' : '') + '>Clique no card</option>';
    html += '<option value="button"' + (interaction.trigger === 'button' ? ' selected' : '') + '>Botão no rodapé</option>';
    html += '</select></div>';

    html += '<div class="form-group mdash-action-field mdash-action-field--modal">';
    html += '<label>Título da modal</label><input type="text" class="form-control input-sm" id="mdash-action-modal-title" value="' + (interaction.modalTitle || '') + '" placeholder="Opcional"></div>';

    html += '<div class="form-group mdash-action-field mdash-action-field--button">';
    html += '<label>Texto do botão</label><input type="text" class="form-control input-sm" id="mdash-action-button-label" value="' + (interaction.buttonLabel || 'Ver detalhes') + '"></div>';

    html += '<div class="form-group mdash-action-field mdash-action-field--url">';
    html += '<label>URL</label><input type="text" class="form-control input-sm" id="mdash-action-url" value="' + (interaction.url || '') + '" placeholder="https://..."></div>';

    html += '<div class="form-group mdash-action-field mdash-action-field--expression">';
    html += '<label>Expressão JS</label><textarea class="form-control input-sm" id="mdash-action-expression" rows="4" placeholder="// item, event, mdash">' + (interaction.expressaojs || '') + '</textarea></div>';

    html += '</div></div>';

    html += '<div class="mdash-prop-section" style="margin-top:12px;">';
    html += '<div class="mdash-prop-section-header is-open">';
    html += '<span class="mdash-prop-section-title"><i class="glyphicon glyphicon-new-window"></i> Conteúdo da modal</span></div>';
    html += '<div class="mdash-prop-section-body">';
    html += '<p class="text-muted" style="font-size:12px;margin-bottom:10px;">' + overlayCount + ' objecto(s) overlay. Objectos com categoria <code>overlay</code> não aparecem no card.</p>';
    html += '<button type="button" class="btn btn-sm btn-primary btn-block" id="mdash-open-overlay-designer"><i class="glyphicon glyphicon-pencil"></i> Editar conteúdo</button>';
    html += '</div></div>';
    html += '</div>';

    $panel.html(html);
    $panel.off('.itemActions');

    function syncActionFieldVisibility() {
        var behavior = $('#mdash-action-behavior').val();
        $panel.find('.mdash-action-field').hide();
        if (behavior === 'openModal') {
            $panel.find('.mdash-action-field--trigger,.mdash-action-field--modal,.mdash-action-field--button').show();
        } else if (behavior === 'navigate') {
            $panel.find('.mdash-action-field--url').show();
        } else if (behavior === 'expression') {
            $panel.find('.mdash-action-field--expression').show();
        }
    }

    function saveItemActionsFromPanel() {
        var cache = item._eventsConfigCache || getDefaultMdashItemEventsConfig();
        var primary = cache.interactions[0] || getDefaultMdashItemEventsConfig().interactions[0];
        primary.enabled = $('#mdash-action-enabled').is(':checked');
        primary.behavior = $('#mdash-action-behavior').val() || 'openModal';
        primary.trigger = $('#mdash-action-trigger').val() || 'click';
        primary.modalTitle = $('#mdash-action-modal-title').val() || '';
        primary.buttonLabel = $('#mdash-action-button-label').val() || 'Ver detalhes';
        primary.url = $('#mdash-action-url').val() || '';
        primary.expressaojs = $('#mdash-action-expression').val() || '';
        cache.interactions[0] = primary;
        item._eventsConfigCache = cache;
        item.eventsconfigjson = JSON.stringify(cache);
        persistItemEventsConfig(item);
    }

    syncActionFieldVisibility();

    $panel.on('change.itemActions input.itemActions', '#mdash-action-enabled,#mdash-action-behavior,#mdash-action-trigger,#mdash-action-modal-title,#mdash-action-button-label,#mdash-action-url', saveItemActionsFromPanel);
    $panel.on('blur.itemActions', '#mdash-action-expression', saveItemActionsFromPanel);
    $panel.on('change.itemActions', '#mdash-action-behavior', syncActionFieldVisibility);
    $panel.on('click.itemActions', '#mdash-open-overlay-designer', function (e) {
        e.preventDefault();
        openOverlayDesignerModal(item.mdashcontaineritemstamp);
    });
}
window.renderMdashItemActionsPanel = renderMdashItemActionsPanel;

function mdashBuildContainerItemCardData(containerItem, extra) {
    extra = extra || {};
    var mainSlotId = getMdashContainerItemMainSlotId(containerItem);
    var template = typeof getTemplateLayoutByCode === 'function'
        ? getTemplateLayoutByCode(containerItem.templatelayout)
        : null;
    var resolvedTipo = extra.tipo
        || (template && template.UIData && template.UIData.tipo)
        || containerItem.tipo
        || 'primary';

    var cardData = {
        title: extra.title !== undefined ? extra.title : (containerItem.titulo || ''),
        id: extra.id || ('m-dash-layout-' + containerItem.mdashcontaineritemstamp),
        tipo: resolvedTipo,
        bodyContent: '',
        slotContents: {}
    };

    if (extra.bodyContent) {
        if (mainSlotId === 'body') {
            cardData.bodyContent = extra.bodyContent;
        } else {
            cardData.slotContents[mainSlotId] = extra.bodyContent;
        }
    }

    if (extra.slotContents && typeof extra.slotContents === 'object') {
        Object.keys(extra.slotContents).forEach(function (slotKey) {
            cardData.slotContents[slotKey] = extra.slotContents[slotKey];
        });
    }

    return cardData;
}

function mdashGenerateRuntimeSkeleton(data) {
    data = data || {};
    var id = data.id || '';
    var fixedHeight = parseInt(data.fixedHeight, 10);
    var parsedHeight = parseInt(data.minHeight, 10);
    var minHeight = isNaN(parsedHeight) ? 132 : Math.max(96, Math.min(parsedHeight, 210));
    var hasFixedHeight = !isNaN(fixedHeight) && fixedHeight > 0;
    var shellSizeStyle = hasFixedHeight
        ? 'height:' + fixedHeight + 'px;min-height:' + fixedHeight + 'px;max-height:' + fixedHeight + 'px;'
        : '--md-skel-min-h:' + minHeight + 'px';
    var label = data.title ? String(data.title) : 'A carregar dados';
    var html = '';
    html += '<div id="' + id + '" class="mdash-skel-shell mdash-skel-shell--compact" style="' + shellSizeStyle + '" aria-label="' + label + '">';
    html += '  <div class="mdash-skel-row"><span class="mdash-skel-dot"></span><span class="mdash-skel-line w-45"></span><span class="mdash-skel-chip" style="margin-left:auto"></span></div>';
    html += '  <div class="mdash-skel-grid"><span class="mdash-skel-block"></span><span class="mdash-skel-block"></span></div>';
    html += '  <div class="mdash-skel-row"><span class="mdash-skel-line w-100"></span></div>';
    html += '  <div class="mdash-skel-row"><span class="mdash-skel-line w-70"></span></div>';
    html += '  <div class="mdash-skel-table">';
    html += '    <span class="mdash-skel-line w-100"></span><span class="mdash-skel-line w-100"></span><span class="mdash-skel-line w-100"></span>';
    html += '    <span class="mdash-skel-line w-55"></span><span class="mdash-skel-line w-35"></span><span class="mdash-skel-line w-20"></span>';
    html += '  </div>';
    html += '</div>';
    return html;
}
window.mdashGenerateRuntimeSkeleton = mdashGenerateRuntimeSkeleton;

function mdashContainerItemHasRenderableObjects(containerItem, mdashInstance) {
    var itemStamp = containerItem && containerItem.mdashcontaineritemstamp;
    if (!itemStamp) return false;
    var objects = (mdashInstance && Array.isArray(mdashInstance.containerItemObjects))
        ? mdashInstance.containerItemObjects
        : [];
    return objects.some(function (obj) {
        if (!obj || obj.mdashcontaineritemstamp !== itemStamp) return false;
        var category = mdashGetObjectCategory(obj);
        return category !== 'detail' && category !== 'overlay' && category !== 'datasource' && category !== 'filter';
    });
}

function mdashRenderContainerItemState(containerItem, state, runtimeCtx) {
    runtimeCtx = runtimeCtx || {};
    if (typeof $ !== 'function' || !containerItem || !state) return;

    var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
    var cls = 'mdash-state' + (state.type === 'error' ? ' mdash-state--error' : '');
    var html = '<div class="' + cls + '">'
        + '<i class="' + (state.icon || 'glyphicon glyphicon-info-sign') + ' mdash-state__icon"></i>'
        + '<span class="mdash-state__text">' + (state.text || '') + '</span>'
        + '</div>';

    var mainSlotId = getMdashContainerItemMainSlotId(containerItem);
    var $slot = resolveMdashContainerItemSlotForContent(containerItem, mainSlotId, hostSelector);
    if ($slot && $slot.length && !mdashIsStructuralSlot($slot)) {
        $slot.empty().append(html);
        return;
    }

    if (typeof renderMdashContainerItemLayout === 'function') {
        var rendered = renderMdashContainerItemLayout(containerItem, hostSelector, mdashBuildContainerItemCardData(containerItem, {
            bodyContent: html
        }));
        if (rendered) return;
    }

    if (typeof runtimeCtx.renderFallbackCard === 'function') {
        $(hostSelector).empty().append(runtimeCtx.renderFallbackCard({
            id: 'm-dash-layout-' + containerItem.mdashcontaineritemstamp,
            title: containerItem.titulo || '',
            tipo: 'default',
            bodyContent: html
        }));
    }
}
window.mdashRenderContainerItemState = mdashRenderContainerItemState;

function mdashHandleContainerItemLayoutRuntime(containerItem, runtimeCtx) {
    runtimeCtx = runtimeCtx || {};
    if (!containerItem) return false;

    var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
    var measuredCardHeight = 0;
    var measuredBodyHeight = 0;
    var mainSlotId = getMdashContainerItemMainSlotId(containerItem);
    var isCompactLayout = isCompactContainerItemLayout(containerItem.templatelayout);
    mdashSyncContainerItemRowSizing(containerItem);

    try {
        var $existingCard = $(hostSelector + ' .mdash-card, ' + hostSelector + ' .dashcard, ' + hostSelector + ' [data-mdash-scope]').first();
        if ($existingCard && $existingCard.length) {
            measuredCardHeight = Math.round($existingCard.get(0).getBoundingClientRect().height || 0);
        }
        var $existingBody = resolveMdashContainerItemSlotForContent(containerItem, mainSlotId, hostSelector);
        if ($existingBody && $existingBody.length) {
            measuredBodyHeight = Math.round($existingBody.get(0).getBoundingClientRect().height || 0);
        }
    } catch (e) { measuredBodyHeight = 0; }

    if (isCompactLayout) {
        measuredCardHeight = 0;
        measuredBodyHeight = 0;
    }

    containerItem.skeletonId = 'skeleton-' + containerItem.mdashcontaineritemstamp;
    var loadingHeight = typeof containerItem._calculateLoadingHeight === 'function'
        ? containerItem._calculateLoadingHeight()
        : 0;

    if (typeof containerItem._lockHostMinHeight === 'function') {
        if (isCompactLayout) containerItem._lockHostMinHeight(0);
        else if (measuredCardHeight > 40) containerItem._lockHostMinHeight(measuredCardHeight);
        else containerItem._lockHostMinHeight(0);
    }

    if (isCompactLayout) loadingHeight = 0;

    if (measuredBodyHeight > 40) loadingHeight = measuredBodyHeight;

    var skeletonHTML = (typeof runtimeCtx.generateSkeleton === 'function')
        ? runtimeCtx.generateSkeleton({
            id: containerItem.skeletonId,
            title: containerItem.titulo,
            minHeight: loadingHeight,
            fixedHeight: measuredBodyHeight > 40 ? measuredBodyHeight : 0
        })
        : mdashGenerateRuntimeSkeleton({
            id: containerItem.skeletonId,
            title: containerItem.titulo,
            minHeight: loadingHeight,
            fixedHeight: measuredBodyHeight > 40 ? measuredBodyHeight : 0
        });

    try {
        var $slotForSkeleton = resolveMdashContainerItemSlotForContent(containerItem, mainSlotId, hostSelector);
        if ($slotForSkeleton && $slotForSkeleton.length && !mdashIsStructuralSlot($slotForSkeleton) && measuredBodyHeight > 40 && !isCompactLayout) {
            $slotForSkeleton.empty().append(skeletonHTML);
            return true;
        }
    } catch (e) { /* continua para render completo */ }

    if (!containerItem.layoutcontaineritemdefault && containerItem.expressaolayoutcontaineritem) {
        try { eval(containerItem.expressaolayoutcontaineritem); return true; } catch (e) {
            console.warn('[MDash] expressaolayoutcontaineritem', e);
        }
    }

    try {
        var renderedTemplate = renderMdashContainerItemLayout(
            containerItem,
            hostSelector,
            mdashBuildContainerItemCardData(containerItem, { bodyContent: skeletonHTML })
        );
        if (renderedTemplate) return true;
    } catch (e) {
        console.warn('[MDash] render central do layout falhou, a usar fallback', e);
    }

    if (typeof runtimeCtx.renderFallbackCard === 'function') {
        $(hostSelector).empty().append(runtimeCtx.renderFallbackCard({
            id: 'm-dash-layout-' + containerItem.mdashcontaineritemstamp,
            title: containerItem.titulo || '',
            tipo: 'primary',
            icon: 'glyphicon glyphicon-stats',
            bodyContent: skeletonHTML
        }));
        return true;
    }

    return false;
}
window.mdashHandleContainerItemLayoutRuntime = mdashHandleContainerItemLayoutRuntime;

function mdashRefreshContainerItemRuntime(containerItem, runtimeCtx, options) {
    runtimeCtx = runtimeCtx || {};
    options = options || {};
    if (!containerItem) return Promise.resolve(false);

    var mdashInstance = runtimeCtx.mdash || containerItem._mdash || null;
    var skipItemFetch = !!options.skipItemFetch;
    var hasRenderableObjects = mdashContainerItemHasRenderableObjects(containerItem, mdashInstance);
    var urlfetch = containerItem.urlfetch || '../programs/gensel.aspx?cscript=getdbcontaineritemdata';

    if (!urlfetch && !hasRenderableObjects) {
        mdashRenderContainerItemState(containerItem, {
            type: 'error',
            icon: 'glyphicon glyphicon-link',
            text: 'URL para listagem não definida'
        }, runtimeCtx);
        return Promise.resolve(false);
    }

    return Promise.resolve().then(function () {
        mdashHandleContainerItemLayoutRuntime(containerItem, runtimeCtx);

        if (skipItemFetch || !urlfetch) {
            return null;
        }

        var requestData = {
            codigo: mdashInstance && mdashInstance.dashboardconfig ? mdashInstance.dashboardconfig.codigo : '',
            mdashcontaineritemstamp: containerItem.mdashcontaineritemstamp,
            mdashcontaineritemobjectstamp: '',
            tipoquery: 'item',
            filters: (mdashInstance && mdashInstance.filterValues) ? mdashInstance.filterValues : {}
        };
        var requestKey = [urlfetch || '', JSON.stringify(requestData.filters || {})].join('|');

        if (containerItem._pendingFetchPromise && containerItem._pendingFetchKey === requestKey) {
            return containerItem._pendingFetchPromise;
        }

        containerItem._pendingFetchKey = requestKey;
        containerItem._pendingFetchPromise = $.ajax({
            type: 'POST',
            url: urlfetch,
            data: { '__EVENTARGUMENT': JSON.stringify([requestData]) }
        });

        return containerItem._pendingFetchPromise.finally(function () {
            containerItem._pendingFetchPromise = null;
            containerItem._pendingFetchKey = '';
        });
    }).then(function (response) {
        if (response && response.cod && response.cod !== '0000') {
            mdashRenderContainerItemState(containerItem, {
                type: 'error',
                icon: 'glyphicon glyphicon-exclamation-sign',
                text: 'Erro ao trazer resultados (' + response.cod + ')'
            }, runtimeCtx);
            return false;
        }

        if (response && Array.isArray(response.data)) {
            containerItem.records = response.data;
        }

        var allObjectsSource = (mdashInstance && Array.isArray(mdashInstance.containerItemObjects))
            ? mdashInstance.containerItemObjects
            : [];
        var hostSelector = '#' + containerItem.mdashcontaineritemstamp;
        var slotRenderResult = renderMdashContainerItemSlots(containerItem, allObjectsSource, {
            hostSelector: hostSelector
        });

        if (containerItem.expressaoapresentacaodados) {
            try { eval(containerItem.expressaoapresentacaodados); } catch (e) {
                console.warn('[MDash] expressaoapresentacaodados', e);
            }
        }

        var primaryInteraction = mdashGetItemPrimaryInteraction(containerItem);
        var useEventsSystem = primaryInteraction && primaryInteraction.enabled;

        if (useEventsSystem && typeof mdashBindItemInteractionRuntime === 'function') {
            mdashBindItemInteractionRuntime(containerItem, runtimeCtx);
        } else if (slotRenderResult && slotRenderResult.detailObjects && slotRenderResult.detailObjects.length > 0) {
            if (typeof containerItem._mountDetailButton === 'function') {
                containerItem._mountDetailButton(slotRenderResult.detailObjects);
            } else if (typeof mdashMountLegacyDetailButton === 'function') {
                mdashMountLegacyDetailButton(containerItem, slotRenderResult.detailObjects);
            }
        }

        if (typeof containerItem.hideSkeleton === 'function') {
            containerItem.hideSkeleton();
        } else if (containerItem.skeletonId) {
            $('#' + containerItem.skeletonId).hide();
        }

        if (typeof containerItem._lockHostMinHeight === 'function') {
            containerItem._lockHostMinHeight(0);
        }

        mdashSyncContainerItemRowSizing(containerItem);

        $(hostSelector).find('.mdash-card, [data-mdash-scope]').addClass('mdash-content-fade-in');

        if (typeof containerItem._captureRenderedHeight === 'function' && !isCompactContainerItemLayout(containerItem.templatelayout)) {
            containerItem._captureRenderedHeight();
        }
        if (typeof runtimeCtx.onHeightSync === 'function') {
            runtimeCtx.onHeightSync();
        }

        return true;
    }).catch(function (error) {
        console.error('[MDash] erro em refreshContentRuntime', error);
        mdashRenderContainerItemState(containerItem, {
            type: 'error',
            icon: 'glyphicon glyphicon-exclamation-sign',
            text: 'Erro interno: ' + (error && error.message ? error.message : '')
        }, runtimeCtx);
        return false;
    });
}
window.mdashRefreshContainerItemRuntime = mdashRefreshContainerItemRuntime;

MdashContainerItem.prototype._measureRenderedContentHeight = function () {
    var host = document.getElementById(this.mdashcontaineritemstamp);
    if (!host) return 0;
    var contentEl = host.querySelector('.mdash-card, .dashcard, [data-mdash-scope], .cont-item-object-rendered');
    var target = contentEl || host;
    return Math.round(target.getBoundingClientRect().height || 0);
};

MdashContainerItem.prototype._calculateLoadingHeight = function () {
    var currentHeight = this._measureRenderedContentHeight();
    if (currentHeight > 40) {
        this.lastMeasuredHeight = currentHeight;
        return currentHeight;
    }
    if (this.lastMeasuredHeight > 40) return this.lastMeasuredHeight;
    if (typeof getMdashSkeletonMinHeightBySize === 'function') {
        return getMdashSkeletonMinHeightBySize(this.tamanho);
    }
    return 0;
};

MdashContainerItem.prototype._lockHostMinHeight = function (height) {
    var host = document.getElementById(this.mdashcontaineritemstamp);
    if (!host) return;
    var h = parseInt(height, 10) || 0;
    if (h > 0) {
        host.style.setProperty('--md-item-min-h', h + 'px');
    } else {
        host.style.removeProperty('--md-item-min-h');
    }
};

MdashContainerItem.prototype._captureRenderedHeight = function () {
    var containerItem = this;
    var host = document.getElementById(containerItem.mdashcontaineritemstamp);
    if (!host) return;
    var syncHeight = (containerItem._runtimeCtx && typeof containerItem._runtimeCtx.onHeightSync === 'function')
        ? containerItem._runtimeCtx.onHeightSync
        : (typeof scheduleMdashSidebarHeightSync === 'function' ? scheduleMdashSidebarHeightSync : null);
    [80, 260].forEach(function (delay) {
        setTimeout(function () {
            var h = containerItem._measureRenderedContentHeight();
            if (h > 40) {
                containerItem.lastMeasuredHeight = h;
            }
            host.style.removeProperty('--md-item-min-h');
            if (syncHeight) syncHeight();
        }, delay);
    });
};

MdashContainerItem.prototype.hideSkeleton = function () {
    if (this.skeletonId) {
        var el = document.getElementById(this.skeletonId);
        if (el) el.style.display = 'none';
    }
};

MdashContainerItem.prototype.handleLayout = function (runtimeCtx) {
    return mdashHandleContainerItemLayoutRuntime(this, runtimeCtx || this._runtimeCtx || {});
};

MdashContainerItem.prototype.refreshContent = function (runtimeCtx, options) {
    if (runtimeCtx && typeof runtimeCtx === 'object' && (runtimeCtx.skipItemFetch !== undefined || runtimeCtx.mdash)) {
        options = runtimeCtx;
        runtimeCtx = this._runtimeCtx || {};
    }
    return mdashRefreshContainerItemRuntime(this, runtimeCtx || this._runtimeCtx || {}, options || {});
};

MdashContainerItem.prototype._renderState = function (state, runtimeCtx) {
    mdashRenderContainerItemState(this, state, runtimeCtx || this._runtimeCtx || {});
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
 * - body/html ? substituído pelo scope selector
 * - :root ? substituído pelo scope selector
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
            // body, html, :root ? scope itself
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
// Fallback (sem jQuery): preenche slots via regex. NÃO suporta slots aninhados
// — usado apenas quando `$` não está disponível. O caminho normal usa DOM.
function _fillSlotsViaRegex(html, slotContent) {
    return html.replace(/<([a-z][a-z0-9]*)\b([^>]*data-mdash-slot="([^"]+)"[^>]*)>([\s\S]*?)(<\/\1>)/gi, function (fullMatch, tag, attrs, slotName, innerContent, closeTag) {
        var content = slotContent[slotName];
        if (content === undefined || content === '') return fullMatch;
        if (/data-mdash-slot-mode="class"/.test(attrs)) {
            if (/\bclass="[^"]*"/.test(attrs)) {
                attrs = attrs.replace(/\bclass="[^"]*"/, 'class="' + content + '"');
            } else {
                attrs += ' class="' + content + '"';
            }
            return '<' + tag + attrs + '>' + innerContent + closeTag;
        }
        return '<' + tag + attrs + '>' + content + closeTag;
    });
}

function _normalizeLayoutTemplateSources(layout) {
    var html = (layout && layout.htmltemplate) || '';
    var css = (layout && layout.csstemplate) || '';
    // Layout com CSS (ou CSS já scoped) guardado no campo HTML — evita mostrar CSS como texto no editor
    if (html && html.indexOf('<') === -1 && /[{]/.test(html)) {
        var stripped = html.replace(/^\[data-mdash-scope="[^"]+"\]\s*/gm, '');
        if (!css) css = stripped;
        html = '<div data-mdash-slot="body" class="mdash-layout-fallback-slot"></div>';
        console.warn('[MDash] htmltemplate parece CSS no layout "' + ((layout && layout.codigo) || '') + '" — a usar slot body por defeito.');
    }
    return { html: html, css: css };
}

function _layoutCssHeadId(scopeId) {
    return 'mdash-layout-css-' + String(scopeId || 'layout').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function injectUnifiedLayoutCss(scopeId, scopedCss) {
    if (!scopedCss || typeof $ !== 'function') return;
    var styleId = _layoutCssHeadId(scopeId);
    $('#' + styleId).remove();
    $('head').append(
        '<style id="' + styleId + '" data-mdash-layout-scope="' + String(scopeId || '').replace(/"/g, '') + '">'
        + scopedCss + '</style>'
    );
}

function buildUnifiedLayoutParts(layout, cardData) {
    cardData = cardData || {};
    var sources = _normalizeLayoutTemplateSources(layout);
    var html = sources.html;
    var css = sources.css;

    var tipo = (layout.UIData && layout.UIData.tipo) || cardData.tipo || 'primary';
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

    html = html.replace(/\{\{(\w+)\}\}/g, function (match, key) {
        return tokenMap.hasOwnProperty(key) ? tokenMap[key] : '';
    });

    var slotContent = {
        'title': cardData.title || '',
        'icon': cardData.icon || '',
        'header': cardData.header || '',
        'body': cardData.bodyContent || '',
        'footer': cardData.footer || '',
        'subtitle': (cardData.extraData && cardData.extraData.subtitle) || '',
        'status-badge': (cardData.extraData && cardData.extraData.status) || ''
    };
    if (cardData.slotContents && typeof cardData.slotContents === 'object') {
        Object.keys(cardData.slotContents).forEach(function (slotKey) {
            if (cardData.slotContents[slotKey] !== undefined && cardData.slotContents[slotKey] !== null) {
                slotContent[slotKey] = cardData.slotContents[slotKey];
            }
        });
    }

    if (typeof $ === 'function') {
        try {
            var $frag = $('<div></div>').html(html);
            $frag.find('[data-mdash-slot]').each(function () {
                var $el = $(this);
                if ($el.find('[data-mdash-slot]').length > 0) return;
                var slotName = $el.attr('data-mdash-slot');
                var content = slotContent[slotName];
                if (content === undefined || content === '') return;
                if ($el.attr('data-mdash-slot-mode') === 'class') {
                    $el.attr('class', content);
                } else {
                    $el.html(content);
                }
            });
            html = $frag.html();
        } catch (domErr) {
            console.warn('[MDash] buildUnifiedLayoutParts: fill via DOM falhou, fallback regex —', domErr);
            html = _fillSlotsViaRegex(html, slotContent);
        }
    } else {
        html = _fillSlotsViaRegex(html, slotContent);
    }

    var scopeId = (layout.codigo || 'layout') + '_' + (cardData.id || Math.random().toString(36).substr(2, 6));
    var rowSizing = layout.rowsizing || layout.rowSizing
        || (String(layout.tipo || '').toLowerCase() === 'snapshot' ? 'compact' : 'stretch');
    var resolvedCss = css ? mdashResolveThemeTokensInCss(css, { tipo: tipo }) : '';
    var scopedCss = resolvedCss ? scopeLayoutCSS(resolvedCss, scopeId) : '';
    var wrapperHtml = '<div data-mdash-scope="' + scopeId + '" data-mdash-row-sizing="' + rowSizing + '" class="mdash-layout-scope mdash-layout-scope--' + rowSizing + '">' + html + '</div>';

    return { scopeId: scopeId, scopedCss: scopedCss, html: wrapperHtml };
}

/** Monta layout: CSS no head, HTML no alvo (evita <style> visível no canvas do editor). */
function mountUnifiedLayout(target, layout, cardData) {
    var parts = buildUnifiedLayoutParts(layout, cardData);
    injectUnifiedLayoutCss(parts.scopeId, parts.scopedCss);
    var $target = (target && target.jquery) ? target : $(target);
    $target.html(parts.html);
    return parts;
}

function renderUnifiedLayout(layout, cardData, options) {
    options = options || {};
    var parts = buildUnifiedLayoutParts(layout, cardData);

    if (options.cssTarget === 'head') {
        injectUnifiedLayoutCss(parts.scopeId, parts.scopedCss);
        return parts.html;
    }

    var result = '';
    if (parts.scopedCss && options.includeInlineStyle !== false) {
        result += '<style data-mdash-layout-scope="' + parts.scopeId + '">' + parts.scopedCss + '</style>';
    }
    result += parts.html;
    return result;
}

/**
 * Constrói o HTML de UM bloco de objecto (toolbar + render area), com a
 * disposição-padrão: [Slot] [objecto] [copiar] [colar] ... [Remover].
 * Usado tanto nos slots normais como no fallback de objectos órfãos, para
 * garantir disposição idêntica.
 */
function _mdashBuildSlotObjectBlockHtml(obj, itemStamp, slotId, overlayPlaceAttr) {
    overlayPlaceAttr = overlayPlaceAttr || '';
    var renderDivId = 'mdash-slot-render-' + obj.mdashcontaineritemobjectstamp;
    var objEntry = getMdashObjectTypeEntry(obj.tipo);
    var objProcessaFonte = objEntry ? (objEntry.processaFonte !== undefined ? objEntry.processaFonte : obj.processaFonte) : obj.processaFonte;
    var h = '<div class="mdash-slot-zone-obj-block' + ((obj.tipo === 'badge' || obj.tipo === 'kpi' || obj.tipo === 'progress') ? ' is-compact-object' : '') + (obj.tipo === 'customCode' ? ' is-custom-code-object' : '') + '">';
    h += '<div class="mdash-slot-zone-toolbar">';
    h += '<button type="button" class="mdash-slot-zone-settings mdash-slot-zone-toolbar-left" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '" title="Propriedades do slot"><i class="glyphicon glyphicon-cog"></i> Slot</button>';
    h += '<button type="button" class="mdash-slot-zone-obj-props" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Propriedades do objecto"><i class="' + getObjectTypeIcon(obj.tipo) + '"></i> ' + (obj.tipo || 'Objecto') + '</button>';
    h += '<button type="button" class="mdash-slot-zone-obj-copy mdash-clip-btn" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Copiar objecto"><i class="glyphicon glyphicon-copy"></i></button>';
    h += '<button type="button" class="mdash-slot-zone-obj-paste mdash-clip-btn mdash-clip-paste" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '"' + overlayPlaceAttr + ' title="Colar objecto do clipboard aqui"><i class="glyphicon glyphicon-paste"></i></button>';
    h += '<button type="button" class="mdash-slot-zone-remove mdash-slot-zone-toolbar-right" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '" title="Remover objecto"><i class="glyphicon glyphicon-remove"></i> Remover</button>';
    h += '</div>';
    h += '<div class="mdash-slot-zone-render" id="' + renderDivId + '" data-object-stamp="' + obj.mdashcontaineritemobjectstamp + '">';
    if (objProcessaFonte !== false || obj.tipo === 'customCode') {
        h += '<div class="mdash-slot-zone-render-placeholder"><i class="' + getObjectTypeIcon(obj.tipo) + '"></i> ' + (obj.tipo || 'Objecto') + '</div>';
    }
    h += '</div>';
    h += '</div>';
    return h;
}

/**
 * injectSlotDropOverlays(itemStamp, template)
 * Após o card ser renderizado com renderUnifiedLayout (cores/icons visíveis),
 * injeta mini drop-zones nos slots de tipo "content", "text" e "html".
 * Slots de tipo "icon" mantêm o conteúdo default do card.
 */
function injectSlotDropOverlays(itemStamp, template, options) {
    options = options || {};
    var bodySelector = options.bodySelector
        || (".mdash-canvas-item[data-stamp='" + itemStamp + "'] .mdash-canvas-item-body");
    var $body = $(bodySelector);
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

        // Slots-contentor (que contêm slots aninhados, ex.: body > slotv/labelslt)
        // NÃO recebem dropzone — senão o $el.empty() abaixo apagaria os slots
        // internos antes de serem processados (não apareceriam no editor).
        // Apenas os slots-folha são drop targets.
        if ($el.find('[data-mdash-slot]').length > 0) return;

        var slotDef = contentSlotIds[slotId];

        // Custom layouts: slot no HTML sem definição ? trata como content
        if (!slotDef && isCustom) {
            slotDef = { id: slotId, label: slotId, type: 'html' };
        }
        if (!slotDef) return; // Layout default, slot visual — manter visual default

        // Limpa conteúdo do slot e injeta drop zone
        $el.empty();
        var objs = window.appState.containerItemObjects.filter(function (o) {
            if (o.mdashcontaineritemstamp !== itemStamp || o.slotid !== slotId) return false;
            var category = mdashGetObjectCategory(o);
            if (options.overlayOnly) {
                if (category !== 'overlay') return false;
            } else if (category === 'overlay') {
                return false;
            }
            if (options.overlayPlaceId) {
                return !!(o.config && o.config.overlayPlaceId === options.overlayPlaceId);
            }
            return true;
        }).sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });

        var hasCustomCode = objs.some(function (o) { return o.tipo === 'customCode'; });
        var inEditorMode = typeof mdashIsEditorMode === 'function' && mdashIsEditorMode();

        var dropHtml;
        var overlayPlaceAttr = options.overlayPlaceId ? ' data-overlay-place-id="' + options.overlayPlaceId + '"' : '';

        if (objs.length > 0) {
            // -- Slot ocupado: um bloco empilhado por objecto --
            dropHtml = '<div class="mdash-slot-zone-drop has-object' + (hasCustomCode ? ' has-custom-code-slot' : '') + '" data-slot-id="' + slotId + '" data-item-stamp="' + itemStamp + '"' + overlayPlaceAttr + '>';
            objs.forEach(function (obj) {
                dropHtml += _mdashBuildSlotObjectBlockHtml(obj, itemStamp, slotId, overlayPlaceAttr);
            });
            dropHtml += '</div>';
        } else {
            // -- Slot vazio: mesma toolbar overlay + hint de drag --
            dropHtml = '<div class="mdash-slot-zone-drop" data-slot-id="' + slotId + '" data-item-stamp="' + itemStamp + '"' + overlayPlaceAttr + '>';
            dropHtml += '<div class="mdash-slot-zone-toolbar">';
            dropHtml += '<button type="button" class="mdash-slot-zone-settings mdash-slot-zone-toolbar-left" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '" title="Propriedades do slot"><i class="glyphicon glyphicon-cog"></i> Slot</button>';
            dropHtml += '<button type="button" class="mdash-slot-zone-obj-paste mdash-clip-btn mdash-clip-paste" data-item-stamp="' + itemStamp + '" data-slot-id="' + slotId + '"' + overlayPlaceAttr + ' title="Colar objecto do clipboard aqui"><i class="glyphicon glyphicon-paste"></i></button>';
            dropHtml += '</div>';
            dropHtml += '<span class="mdash-slot-zone-hint"><i class="glyphicon glyphicon-plus-sign"></i> ' + (slotDef.label || slotId) + '</span>';
            dropHtml += '</div>';
        }

        $el.html(dropHtml);
        if (hasCustomCode) {
            $el.addClass('mdash-slot-has-custom-code');
        } else {
            $el.removeClass('mdash-slot-has-custom-code');
        }

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
            if (typeof mdashRefreshCustomCodeEditorShells === 'function') {
                mdashRefreshCustomCodeEditorShells(objs);
            }
        }

        // -- Bind directo nos elementos criados (não delegado) --
        var $drop = $el.find('.mdash-slot-zone-drop');
        bindSlotDropZoneEvents($drop, itemStamp, slotId, options);
    });

    // -- Fallback para objectos órfãos -----------------------------------------
    // Alguns layouts custom têm slots que não geram drop zone-folha (slot
    // aninhado, sem data-mdash-slot correspondente, escondido ou com altura 0).
    // Esses objectos ficariam invisíveis e impossíveis de editar. Garantimos
    // aqui uma superfície de edição com a MESMA disposição dos objectos normais.
    // Dedupe por stamp: um objecto que já tem render div visível NUNCA é órfão.
    var _isOverlayInject = options.overlayOnly || options.overlayDesigner || options.overlayPlaceId;
    var _inEditorMode = typeof mdashIsEditorMode !== 'function' || mdashIsEditorMode();
    $body.find('.mdash-slot-orphan-zone').remove();
    if (!_isOverlayInject && _inEditorMode && item) {
        var _seen = {};
        var orphans = window.appState.containerItemObjects.filter(function (o) {
            if (o.mdashcontaineritemstamp !== itemStamp) return false;
            if (mdashGetObjectCategory(o) === 'overlay') return false;
            var st = o.mdashcontaineritemobjectstamp;
            if (_seen[st]) return false;               // dedupe por stamp
            _seen[st] = true;
            return $body.find('#mdash-slot-render-' + st).length === 0;
        });

        if (orphans.length) {
            // Agrupar por slot para manter a noção de slot na barra
            var bySlot = {};
            var slotOrder = [];
            orphans.forEach(function (o) {
                var sid = o.slotid || '';
                if (!bySlot[sid]) { bySlot[sid] = []; slotOrder.push(sid); }
                bySlot[sid].push(o);
            });

            var zoneHtml = '<div class="mdash-slot-orphan-zone" data-item-stamp="' + itemStamp + '">';
            slotOrder.forEach(function (sid) {
                var sObjs = bySlot[sid].sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
                var hasCC = sObjs.some(function (o) { return o.tipo === 'customCode'; });
                zoneHtml += '<div class="mdash-slot-zone-drop has-object mdash-slot-zone-orphan' + (hasCC ? ' has-custom-code-slot' : '') + '" data-slot-id="' + sid + '" data-item-stamp="' + itemStamp + '">';
                sObjs.forEach(function (o) {
                    zoneHtml += _mdashBuildSlotObjectBlockHtml(o, itemStamp, sid, '');
                });
                zoneHtml += '</div>';
            });
            zoneHtml += '</div>';
            $body.append(zoneHtml);

            // Render + bind por slot (igual aos slots normais)
            slotOrder.forEach(function (sid) {
                bySlot[sid].forEach(function (o) {
                    var rid = 'mdash-slot-render-' + o.mdashcontaineritemobjectstamp;
                    if ($('#' + rid).length) o.renderObjectByContainerItem('#' + rid, item);
                });
                if (typeof mdashRefreshCustomCodeEditorShells === 'function') {
                    mdashRefreshCustomCodeEditorShells(bySlot[sid]);
                }
                var $od = $body.find('.mdash-slot-zone-orphan[data-slot-id="' + sid + '"]');
                bindSlotDropZoneEvents($od, itemStamp, sid, options);
            });
        }
    }
}

/**
 * Bind directo dos eventos de click (slot settings, object edit, remove) + drag/drop
 * num .mdash-slot-zone-drop específico.
 */
function bindSlotDropZoneEvents($drop, itemStamp, slotId, options) {
    options = options || {};

    function selectObjectInDesigner(stamp, obj, $renderEl) {
        if (options.overlayDesigner) {
            $('.mdash-overlay-canvas-object, .mdash-slot-zone-render').removeClass('is-selected');
            if ($renderEl && $renderEl.length) $renderEl.addClass('is-selected');
            selectOverlayDesignerObject(stamp, itemStamp);
            return true;
        }
        return false;
    }
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
            slotid: slotId,
            categoria: options.overlayDesigner ? 'overlay' : undefined
        });
        if (options.overlayDesigner && options.overlayPlaceId) {
            if (!newObj.config || typeof newObj.config !== 'object') newObj.config = {};
            newObj.config.overlayPlaceId = options.overlayPlaceId;
            syncOverlayObjectConfigjson(newObj);
        }
        window.appState.containerItemObjects.push(newObj);
        if (options.overlayDesigner) {
            if (typeof newObj.stringifyJSONFields === 'function') newObj.stringifyJSONFields();
            if (options.overlayPlaceId) {
                syncOverlayGridLayoutAfterChange(itemStamp, {
                    placeRefresh: options.overlayPlaceId,
                    preserveSelection: newObj.mdashcontaineritemobjectstamp
                });
            } else {
                refreshMdashOverlayDesignerSurface(itemStamp, { preserveSelection: newObj.mdashcontaineritemobjectstamp, immediate: true });
            }
            selectOverlayDesignerObject(newObj.mdashcontaineritemobjectstamp, itemStamp);
        } else {
            refreshSlotOverlays(itemStamp);
        }
        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(newObj, newObj.table, newObj.idfield);
        }
    });

    // Click na área de renderização ? propriedades do objecto (com multi-select)
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
        if (selectObjectInDesigner(stamp, obj, $(this))) return;

        _currentSelectedComponent = { type: 'object', stamp: stamp, data: obj };
        handleComponentProperties(_currentSelectedComponent);
    });

    // Click no botão ? Propriedades ? mesma acção que clicar na render area
    $drop.on('click', '.mdash-slot-zone-obj-props', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('object-stamp');
        if (!stamp) return;
        var obj = window.appState.containerItemObjects.find(function (o) {
            return o.mdashcontaineritemobjectstamp === stamp;
        });
        if (!obj) return;
        var $block = $(this).closest('.mdash-slot-zone-obj-block');
        var $render = $block.find('.mdash-slot-zone-render');
        if (selectObjectInDesigner(stamp, obj, $render)) return;

        $('.mdash-slot-zone-render.is-selected').removeClass('is-selected');
        $render.addClass('is-selected');
        _currentSelectedComponent = { type: 'object', stamp: stamp, data: obj };
        handleComponentProperties(_currentSelectedComponent);
    });

    // Hover ? slot ? realça a borda do slot inteiro (azul)
    $drop.on('mouseenter', '.mdash-slot-zone-settings', function () {
        $drop.addClass('slot-action-hover');
    }).on('mouseleave', '.mdash-slot-zone-settings', function () {
        $drop.removeClass('slot-action-hover');
    });

    // Hover ? propriedades do objecto ? contorno no render
    $drop.on('mouseenter', '.mdash-slot-zone-obj-props', function () {
        $(this).closest('.mdash-slot-zone-obj-block').addClass('object-props-hover');
    }).on('mouseleave', '.mdash-slot-zone-obj-props', function () {
        $(this).closest('.mdash-slot-zone-obj-block').removeClass('object-props-hover');
    });

    // Click ?? copiar objecto
    $drop.on('click', '.mdash-slot-zone-obj-copy', function (e) {
        e.stopPropagation();
        var stamp = $(this).data('object-stamp');
        if (!stamp) return;
        _currentSelectedComponent = { type: 'object', stamp: stamp, data: null };
        GMDashMultiSelection.stamps = [];
        GMDashMultiSelection.type = '';
        mdashCopySelection();
    });

    // Click ?? colar objecto no slot — destino é SEMPRE este slot específico
    $drop.on('click', '.mdash-slot-zone-obj-paste', function (e) {
        e.stopPropagation();
        if (!GMDashClipboard.items.length || GMDashClipboard.type !== 'object') {
            if (typeof alertify !== 'undefined') alertify.warning('Clipboard não contém objectos. Copie um objecto primeiro (Ctrl+C).');
            return;
        }
        var $btn = $(this);
        var targetItemStamp = $btn.data('item-stamp');
        var targetSlotId = $btn.data('slot-id');
        var overlayPlaceId = $btn.data('overlay-place-id');
        if (!targetItemStamp) return;

        var pasteOptions = options.overlayDesigner
            ? { categoria: 'overlay', overlayPlaceId: overlayPlaceId || undefined }
            : undefined;
        var pastedCount = 0;
        GMDashClipboard.items.forEach(function (snap) {
            if (_clipPasteObject(snap, targetItemStamp, String(targetSlotId || ''), pasteOptions)) pastedCount += 1;
        });
        if (pastedCount > 0) {
            setTimeout(function () {
                if (options.overlayDesigner && typeof refreshMdashOverlayDesignerSurface === 'function') {
                    if (overlayPlaceId) {
                        syncOverlayGridLayoutAfterChange(targetItemStamp, { placeRefresh: overlayPlaceId });
                    } else {
                        refreshMdashOverlayDesignerSurface(targetItemStamp);
                    }
                } else if (typeof refreshSlotOverlays === 'function') {
                    refreshSlotOverlays(targetItemStamp);
                }
                if (!options.overlayDesigner && typeof renderAllContainerItemTemplates === 'function') renderAllContainerItemTemplates();
                if (!options.overlayDesigner && typeof initDragAndDrop === 'function') initDragAndDrop();
            }, 50);
            if (typeof alertify !== 'undefined') alertify.success(pastedCount + ' objecto(s) colado(s) neste slot');
        }
    });

    // Hover × remove ? realça o bloco do objecto (vermelho)
    $drop.on('mouseenter', '.mdash-slot-zone-remove', function () {
        $(this).closest('.mdash-slot-zone-obj-block').addClass('object-remove-hover');
    }).on('mouseleave', '.mdash-slot-zone-remove', function () {
        $(this).closest('.mdash-slot-zone-obj-block').removeClass('object-remove-hover');
    });

    // Click no gear (toolbar ou slot vazio) ? propriedades do slot
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

    // Click no remove ? confirmação + registo em GMdashDeleteRecords para guardar a posteriori
    $drop.on('click', '.mdash-slot-zone-remove', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var objectStamp = $(this).data('object-stamp');
        var idx = window.appState.containerItemObjects.findIndex(function (obj) {
            return obj.mdashcontaineritemobjectstamp === objectStamp;
        });
        if (idx === -1) return;
        var obj = window.appState.containerItemObjects[idx];

        if (options.overlayDesigner) {
            showDeleteConfirmation({
                title: 'Remover objecto',
                message: 'Tem a certeza que pretende remover o objecto <strong>' + (obj.tipo || 'Objecto') + '</strong> da modal?',
                recordToDelete: {
                    table: obj.table,
                    tableKey: obj.idfield,
                    stamp: obj[obj.idfield]
                },
                onConfirm: function () {
                    _deleteOverlayObject(objectStamp, itemStamp);
                }
            });
            return;
        }

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

    // Click no slot vazio (não na render area, não no gear, não no remove) ? slot properties
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
                rowsizing: def.rowsizing || 'stretch',
                isCustomLayout: false,
                generateCard: function (cardData) {
                    return renderUnifiedLayout(this, cardData, { cssTarget: 'head' });
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

    // Integração híbrida: adicionar layouts customizados do Layout Builder.
    // Lê GMDashContainerItemLayouts directamente (toTemplateOption está nesta
    // lib) para NÃO depender de getCustomLayoutTemplateOptions (que vive no
    // Mdash Layout Builder.js e pode não estar carregado no viewer). Assim os
    // layouts custom também funcionam na pré-visualização do dashboard.
    try {
        if (Array.isArray(GMDashContainerItemLayouts) && GMDashContainerItemLayouts.length) {
            var customLayouts = GMDashContainerItemLayouts
                .filter(function (l) { return l && !l.inactivo && l.ispublic; })
                .map(function (l) {
                    return (typeof l.toTemplateOption === 'function')
                        ? l.toTemplateOption()
                        : null;
                })
                .filter(function (o) { return !!o; });
            if (customLayouts.length > 0) {
                templates = templates.concat(customLayouts);
            }
        }
    } catch (e) {
        try { console.warn('[MDash] merge de layouts custom falhou:', e); } catch (ignore) { }
    }

    return templates;
}

function getDefaultTemplateCodigo() {
    var templates = getTemplateLayoutOptions();
    return (templates[0] && templates[0].codigo) || "";
}

function getTemplateLayoutByCode(templateCode) {
    var template = getTemplateLayoutOptions().find(function (tpl) {
        return tpl.codigo === templateCode;
    }) || null;

    if (template) return template;

    // Fallback direto para layouts custom já atribuídos a items do dashboard.
    // O picker pode continuar a filtrar por `ispublic`, mas o runtime do item
    // precisa conseguir resolver o layout mesmo quando ele ainda está privado.
    try {
        if (templateCode && /^custom_/i.test(String(templateCode)) && Array.isArray(GMDashContainerItemLayouts)) {
            var directMatch = GMDashContainerItemLayouts.find(function (layout) {
                return layout
                    && !layout.inactivo
                    && ('custom_' + layout.mdashcontaineritemlayoutstamp) === templateCode;
            });
            if (directMatch && typeof directMatch.toTemplateOption === 'function') {
                return directMatch.toTemplateOption();
            }
        }
    } catch (e) {
        try { console.warn('[MDash] fallback getTemplateLayoutByCode(custom) falhou:', e); } catch (ignore) { }
    }

    return null;
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
            var thumbParts = buildUnifiedLayoutParts(template, {
                title: "Preview",
                id: "thumb-" + template.codigo,
                tipo: (template.UIData && template.UIData.tipo) || "primary",
                bodyContent: "123",
                icon: "analytics",
                header: "Header",
                footer: "+4.6%",
                extraData: { subtitle: "subtitle", status: "OK" }
            });
            injectUnifiedLayoutCss(thumbParts.scopeId, thumbParts.scopedCss);
            thumbHtml = thumbParts.html;
        } catch (error) {
            try { console.warn("[mdash] thumbnail generateCard falhou para", templateCode, error); } catch (e) { }
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

$(document).ready(function () {
    loadModernDashboardStyles();
});


function createModernDashboardUI() {
    // Inicializa a interface completa com sidebar + canvas


    initModernDashboardUI();
    // Renderiza pré-visualizações iniciais dos itens
    setTimeout(renderAllContainerItemTemplates, 0);
}

function loadModernStyles() {
    // Carrega todos os estilos
    // Nota: loadModernDashboardStyles() é chamado automaticamente em initModernDashboardUI()
    // e também disponível via $(document).ready() para uso standalone
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
    mainHtml += '    <button type="button" onclick="openDashboardPreview()" class="btn btn-success btn-sm mdash-preview-btn"><i class="glyphicon glyphicon-eye-open"></i> Pré-visualizar</button>';
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
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFilter" title="Adicionar Filtro">';
    mainHtml += '            <i class="glyphicon glyphicon-filter"></i><span>Filtro</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container mdash-toolbox-item" data-component="container" @click="addNewContainer" title="Clique para adicionar ou arraste para o canvas">';
    mainHtml += '            <i class="glyphicon glyphicon-th-large"></i><span>Container</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile toolbox-container-item mdash-toolbox-item" data-component="containerItem" title="Arraste para um Container">';
    mainHtml += '            <i class="glyphicon glyphicon-list-alt"></i><span>Item</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="addNewFonte" title="Adicionar Fonte">';
    mainHtml += '            <i class="glyphicon glyphicon-hdd"></i><span>Fonte</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="openLayoutBuilder" title="Layout Builder">';
    mainHtml += '            <i class="glyphicon glyphicon-blackboard"></i><span>Layouts</span>';
    mainHtml += '          </div>';
    mainHtml += '          <div class="mdash-widget-tile" @click="openIconLibraryManager" title="Bibliotecas de ícones">';
    mainHtml += '            <i class="glyphicon glyphicon-picture"></i><span>Ícones</span>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div class="mdash-sidebar-divider"></div>';

    // Accordion com os componentes (objetos e filtros primeiro — uso mais frequente na configuração)
    mainHtml += '      <div class="panel-group" id="mdash-accordion">';

    // -- Objetos (catálogo de componentes visuais) --
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
    mainHtml += '              <div id="mdash-filters-sidebar-list" class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="$computed.visibleFilters().length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum filtro</small></p>';
    mainHtml += '                <div v-for="(filter, index) in $computed.visibleFilters()" :key="filter.mdashfilterstamp" class="mdash-sidebar-item mdash-sidebar-filter" :data-stamp="filter.mdashfilterstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editFilter(filter.mdashfilterstamp)">';
    mainHtml += '                    <i :class="getFilterTypeIcon(filter.tipo) + \' mdash-sidebar-filter-handle\'" title="Arrastar para reordenar"></i>';
    mainHtml += '                    <div class="mdash-sidebar-filter-main">';
    mainHtml += '                      <span class="mdash-sidebar-filter-title">{{ filter.descricao || filter.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                      <span v-if="(filter.escopo || \'global\') === \'tab\'" class="mdash-filter-scope-badge" :title="getFilterScopeSummary(filter)">{{ getFilterScopeSummary(filter) }}</span>';
    mainHtml += '                    </div>';
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

    // Acessos
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-accesses">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-lock"></i> Perfis de acesso';
    mainHtml += '              <span class="badge pull-right">{{ $computed.sortedAccesses().length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-accesses" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addNewAccess" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar perfil de  acesso';
    mainHtml += '              </button>';
    mainHtml += '              <div class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="$computed.sortedAccesses().length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum acesso configurado</small></p>';
    mainHtml += '                <div v-for="access in $computed.sortedAccesses()" :key="access.mdashaccessstamp" class="mdash-sidebar-item" :data-stamp="access.mdashaccessstamp">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="editAccess(access.mdashaccessstamp)">';
    mainHtml += '                    <i :class="getAccessOriginIcon(access.origem)"></i>';
    mainHtml += '                    <span>{{ access.nome || access.codigo || \'Sem nome\' }}</span>';
    mainHtml += '                  </div>';
    mainHtml += '                  <div class="mdash-sidebar-item-actions">';
    mainHtml += '                    <span class="badge badge-info mdash-access-origin-badge">{{ (access.origem || \'phc\').toUpperCase() }}</span>';
    mainHtml += '                    <button type="button" @click.stop="deleteAccess(access.mdashaccessstamp)" class="btn btn-xs mdash-btn-delete">';
    mainHtml += '                      <i class="glyphicon glyphicon-trash"></i>';
    mainHtml += '                    </button>';
    mainHtml += '                  </div>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </div>';
    mainHtml += '        </div>';

    // Separadores (Tabs do dashboard)
    mainHtml += '        <div class="panel panel-default">';
    mainHtml += '          <div class="panel-heading" data-toggle="collapse" data-target="#collapse-tabs">';
    mainHtml += '            <h4 class="panel-title">';
    mainHtml += '              <i class="glyphicon glyphicon-folder-close"></i> Separadores';
    mainHtml += '              <span class="badge pull-right">{{ tabs.length }}</span>';
    mainHtml += '            </h4>';
    mainHtml += '          </div>';
    mainHtml += '          <div id="collapse-tabs" class="panel-collapse collapse">';
    mainHtml += '            <div class="panel-body">';
    mainHtml += '              <button type="button" @click="addDashboardTab" class="btn btn-primary btn-sm btn-block">';
    mainHtml += '                <i class="glyphicon glyphicon-plus"></i> Adicionar Separador';
    mainHtml += '              </button>';
    mainHtml += '              <div id="mdash-tabs-sidebar-list" class="mdash-sidebar-list">';
    mainHtml += '                <p v-if="tabs.length === 0" class="text-muted text-center" style="margin-top: 10px;"><small>Nenhum separador</small></p>';
    mainHtml += '                <div v-for="tab in $computed.sortedTabs()" :key="tab.mdashtabstamp" class="mdash-sidebar-item mdash-sidebar-tab" :class="{\'is-active\': activeTabStamp === tab.mdashtabstamp}" :data-stamp="tab.mdashtabstamp" :style="getTabInlineStyle(tab)">';
    mainHtml += '                  <div class="mdash-sidebar-item-content" @click="selectDashboardTab(tab.mdashtabstamp)">';
    mainHtml += '                    <span class="mdash-sidebar-tab-accent"></span>';
    mainHtml += '                    <i class="glyphicon glyphicon-move mdash-sidebar-tab-handle" title="Arrastar para reordenar"></i>';
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
    mainHtml += '          <div v-if="$computed.isMultiTabsEnabled()" class="mdash-tabs-layout-controls">';
    mainHtml += '            <label class="mdash-tabs-layout-field" title="Comportamento quando houver muitas tabs">';
    mainHtml += '              <span>Tabs</span>';
    mainHtml += '              <select class="mdash-tabs-layout-select" :value="getDashboardTabOverflowMode()" @change="setDashboardTabOverflowMode($event)">';
    mainHtml += '                <option value="squeeze">Apertar</option>';
    mainHtml += '                <option value="wrap">Quebrar linha</option>';
    mainHtml += '              </select>';
    mainHtml += '            </label>';
    mainHtml += '            <label v-if="getDashboardTabOverflowMode() === \'wrap\'" class="mdash-tabs-layout-field mdash-tabs-layout-field-count" title="Quebrar linha quando ultrapassar este nÃºmero de tabs">';
    mainHtml += '              <span>ApÃ³s</span>';
    mainHtml += '              <input type="number" min="1" max="20" class="mdash-tabs-layout-input" :value="getDashboardTabWrapAfterCount()" @change="setDashboardTabWrapAfterCount($event)" />';
    mainHtml += '            </label>';
    mainHtml += '          </div>';
    //  mainHtml += '          <button type="button"  class="btn btn-primary btn-sm"><i class="glyphicon glyphicon-eye-open"></i> Pré visualizar</button>';
    /* mainHtml += '          <button type="button" @click="addNewFilter" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-filter"></i> Novo Filtro</button>';
     mainHtml += '          <button type="button" @click="addNewFonte" class="btn btn-default btn-sm"><i class="glyphicon glyphicon-oil"></i> Nova Fonte</button>';*/
    mainHtml += '        </div>';
    mainHtml += '      </div>';
    mainHtml += '      <div v-if="$computed.isMultiTabsEnabled()" class="mdash-dashboard-tabs-wrap">';
    mainHtml += '        <div class="mdash-dashboard-tabs" :class="getDashboardTabsClass()" :style="getDashboardTabsStyle()" id="mdash-dashboard-tabs">';
    mainHtml += '          <div v-for="tab in $computed.sortedTabs()" :key="tab.mdashtabstamp" class="mdash-dashboard-tab" :class="{\'is-active\': activeTabStamp === tab.mdashtabstamp}" :style="getTabInlineStyle(tab)" :data-stamp="tab.mdashtabstamp" :title="getTabTooltipTitle(tab)" @click="selectDashboardTab(tab.mdashtabstamp)">';
    mainHtml += '            <span class="mdash-dashboard-tab-accent"></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-curve mdash-dashboard-tab-curve-l" aria-hidden="true"></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-curve mdash-dashboard-tab-curve-r" aria-hidden="true"></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-handle" title="Arrastar para reordenar"><i class="glyphicon glyphicon-move"></i></span>';
    mainHtml += '            <button v-if="isTabIconVisible(tab)" type="button" class="mdash-dashboard-tab-iconbtn" @click.stop="toggleTabEditor(tab.mdashtabstamp, $event)" title="Alterar ícone / cor"><i :class="tab.icone || \'glyphicon glyphicon-list-alt\'"></i></button>';
    mainHtml += '            <input type="text" :value="tab.titulo" @click.stop="selectDashboardTab(tab.mdashtabstamp)" @change.stop="updateDashboardTabTitle(tab, $event)" class="mdash-dashboard-tab-title" placeholder="Sem nome" :title="getTabTooltipTitle(tab)" />';
    mainHtml += '            <span class="mdash-dashboard-tab-duplicate" @click.stop="duplicateDashboardTab(tab.mdashtabstamp)" title="Duplicar separador"><i class="glyphicon glyphicon-duplicate"></i></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-settings" @click.stop="toggleTabEditor(tab.mdashtabstamp, $event)" title="Propriedades do separador"><i class="glyphicon glyphicon-cog"></i></span>';
    mainHtml += '            <span class="mdash-dashboard-tab-close" @click.stop="deleteDashboardTab(tab.mdashtabstamp)" title="Remover separador"><i class="glyphicon glyphicon-remove"></i></span>';
    mainHtml += '          </div>';
    mainHtml += '          <template v-if="tabEditorOpenFor !== \'\'">';
    mainHtml += '            <div class="mdash-tab-editor-popover" :style="\'top:\' + tabEditorPos.top + \'px;left:\' + tabEditorPos.left + \'px\'" @click.stop>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor de fundo</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabColor(getTabEditorTarget()) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabColor(getTabEditorTarget(), opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabColor(getTabEditorTarget())}" :style="getPhcSwatchStyle(getTabCustomColorValue(getTabEditorTarget()))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabCustomColorValue(getTabEditorTarget())" @input.stop="setTabCustomColor(getTabEditorTarget(), $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor do ícone</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabIconColor(getTabEditorTarget()) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabIconColor(getTabEditorTarget(), opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabIconColor(getTabEditorTarget())}" :style="getPhcSwatchStyle(getTabIconCustomColorValue(getTabEditorTarget()))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabIconCustomColorValue(getTabEditorTarget())" @input.stop="setTabIconCustomColor(getTabEditorTarget(), $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Cor do texto</div>';
    mainHtml += '                <div class="mdash-tab-editor-colors">';
    mainHtml += '                  <button type="button" class="mdash-phc-color-option mdash-phc-color-auto" :class="{\'is-active\': getTabTextColor(getTabEditorTarget()) === \'default\'}" title="Automático" @click.stop="setTabTextColor(getTabEditorTarget(), \'default\')"><i class="glyphicon glyphicon-adjust"></i></button>';
    mainHtml += '                  <button v-for="opt in getPhcColorOptions()" :key="opt.value" type="button" class="mdash-phc-color-option" :class="{\'is-active\': getTabTextColor(getTabEditorTarget()) === opt.value}" :style="getPhcSwatchStyle(opt.value)" :title="opt.label" @click.stop="setTabTextColor(getTabEditorTarget(), opt.value)"></button>';
    mainHtml += '                  <label class="mdash-phc-color-custom" :class="{\'is-active\': isCustomTabTextColor(getTabEditorTarget())}" :style="getPhcSwatchStyle(getTabTextCustomColorValue(getTabEditorTarget()))" title="Cor personalizada" @click.stop>';
    mainHtml += '                    <i class="glyphicon glyphicon-tint"></i>';
    mainHtml += '                    <input type="color" :value="getTabTextCustomColorValue(getTabEditorTarget())" @input.stop="setTabTextCustomColor(getTabEditorTarget(), $event)" @click.stop />';
    mainHtml += '                  </label>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Fonte</div>';
    mainHtml += '                <select class="mdash-tab-editor-font" :value="getTabFontFamily(getTabEditorTarget())" @change.stop="setTabFontFamily(getTabEditorTarget(), $event)">';
    mainHtml += '                  <option value="">(Padrão)</option>';
    mainHtml += '                  <option v-for="f in getTabFontOptions()" :key="f.value" :value="f.value" :style="\'font-family:\' + f.value">{{ f.label }}</option>';
    mainHtml += '                </select>';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Tooltip</div>';
    mainHtml += '                <input type="text" class="mdash-tab-editor-font" :value="getTabTooltipInputValue(getTabEditorTarget())" @change.stop="setTabTooltipTitle(getTabEditorTarget(), $event)" placeholder="Usar o título do separador" />';
    mainHtml += '              </div>';
    mainHtml += '              <div class="mdash-tab-editor-section">';
    mainHtml += '                <label class="mdash-tab-editor-toggle"><span>Mostrar ícone</span><input type="checkbox" :checked="isTabIconVisible(getTabEditorTarget())" @change.stop="setTabIconVisible(getTabEditorTarget(), $event)" /></label>';
    mainHtml += '              </div>';
    mainHtml += '              <div v-if="isTabIconVisible(getTabEditorTarget())" class="mdash-tab-editor-section"><div class="mdash-tab-editor-title">Ícone</div>';
    mainHtml += '                <div class="mdash-tab-editor-icons">';
    mainHtml += '                  <button v-for="ic in getTabIconOptions()" :key="ic" type="button" class="mdash-tab-editor-icon" :class="{\'is-active\': (getTabEditorTarget().icone||\'\') === ic}" @click.stop="setTabIcon(getTabEditorTarget(), ic)"><i :class="ic"></i></button>';
    mainHtml += '                </div>';
    mainHtml += '              </div>';
    mainHtml += '            </div>';
    mainHtml += '          </template>';
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
    mainHtml += '            <div v-for="item in getContainerItems(container.mdashcontainerstamp)" :key="item.mdashcontaineritemstamp" class="mdash-canvas-item" :class="{\'is-selected\': selectedComponent.stamp === item.mdashcontaineritemstamp, \'mdash-item-compact\': isCompactLayoutItem(item)}" :data-stamp="item.mdashcontaineritemstamp" @click.stop="selectContainerItem(item.mdashcontaineritemstamp, $event)" :style=\"getItemFlex(item)\">';
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
    // -- Canvas item body: renderizado via renderContainerItemTemplate() + injectSlotDropOverlays() --
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

    // -- Header com tipo do componente seleccionado (estilo FlutterFlow dark header) --
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

    // -- Tab bar com ícones + labels (estilo FlutterFlow icon row) --
    mainHtml += '    <ul class="mdash-props-tabs" id="mdash-props-tabs">';
    mainHtml += '      <li class="mdash-props-tab is-active" data-tab="properties" title="Propriedades"><i class="glyphicon glyphicon-wrench"></i><span>Propriedades</span></li>';
    mainHtml += '      <li class="mdash-props-tab" data-tab="fontes" title="Fontes de Dados"><i class="glyphicon glyphicon-hdd"></i><span>Fontes</span></li>';
    mainHtml += '      <li class="mdash-props-tab" data-tab="actions" title="Acções / Eventos"><i class="glyphicon glyphicon-flash"></i><span>Acções</span></li>';
    mainHtml += '    </ul>';

    // -- Conteúdo das tabs --
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
    //loadModernDashboardStyles();

    // Cria estado reativo global centralizado usando PetiteVue.reactive
    var _dashCfg = GMDashConfig[0] || new MdashConfig({ u_mdashstamp: GMDashStamp });
    if (!GMDashConfig.length) GMDashConfig = [_dashCfg];
    var _dashSettings = (typeof _dashCfg.getConfig === 'function') ? _dashCfg.getConfig() : {};
    // Normaliza settings vindos da BD (legacy: 1/0, chaves antigas como primeiroTabStamp)
    _dashSettings.activarMultiSeparadores = !!_dashSettings.activarMultiSeparadores;
    _dashSettings.tabOverflowMode = _dashSettings.tabOverflowMode === 'wrap' ? 'wrap' : 'squeeze';
    var _tabWrapAfterCount = parseInt(_dashSettings.tabWrapAfterCount, 10);
    if (isNaN(_tabWrapAfterCount)) _tabWrapAfterCount = 5;
    _dashSettings.tabWrapAfterCount = Math.max(1, Math.min(20, _tabWrapAfterCount));
    if (!_dashSettings.activeTabStamp && _dashSettings.primeiroTabStamp) {
        _dashSettings.activeTabStamp = _dashSettings.primeiroTabStamp;
    }
    delete _dashSettings.primeiroTabStamp;
    var _initialActiveTab = _dashSettings.activeTabStamp || ((GMDashTabs[0] && GMDashTabs[0].mdashtabstamp) || '');

    window.appState = PetiteVue.reactive({
        tabs: GMDashTabs,
        accesses: GMDashAccesses,
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
        accesses: window.appState.accesses,
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
        tabEditorPos: { top: 0, left: 0 },
        objectSearchQuery: "",
        $computed: {
            sortedFilters: function () {
                return window.appState.filters.slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            sortedAccesses: function () {
                return (window.appState.accesses || []).slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            sortedContainers: function () {
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
                return (window.appState.filters || []).slice().sort(function (a, b) {
                    return (a.ordem || 0) - (b.ordem || 0);
                });
            },

            clipboardType: function () {
                return window.appState.clipboardType || '';
            }
        },

        getFilterTypeIcon: function (tipo) {
            return getFilterTypeIcon(tipo);
        },

        getFilterScopeSummary: function (filter) {
            return getMdashFilterScopeSummary(filter, window.appState.tabs);
        },

        getAccessOriginIcon: function (origem) {
            return getAccessOriginIcon(origem);
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

        // -- Fontes globais (para sidebar) --
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

        getDashboardTabOverflowMode: function () {
            if (GMDashTabsRuntime) return GMDashTabsRuntime.getTabOverflowMode();
            var settings = window.appState.dashboardSettings || {};
            return settings.tabOverflowMode === 'wrap' ? 'wrap' : 'squeeze';
        },

        getDashboardTabWrapAfterCount: function () {
            if (GMDashTabsRuntime) return GMDashTabsRuntime.getTabWrapAfterCount();
            var settings = window.appState.dashboardSettings || {};
            var count = parseInt(settings.tabWrapAfterCount, 10);
            if (isNaN(count)) count = 5;
            return Math.max(1, Math.min(20, count));
        },

        getDashboardTabsClass: function () {
            var count = this.$computed.sortedTabs().length;
            if (GMDashTabsRuntime && typeof GMDashTabsRuntime.getTabsLayoutClass === 'function') {
                return GMDashTabsRuntime.getTabsLayoutClass(count);
            }
            var shouldWrap = this.shouldWrapDashboardTabs();
            return { 'is-wrap-mode': shouldWrap, 'is-squeeze-mode': !shouldWrap };
        },

        getDashboardTabsStyle: function () {
            var count = this.$computed.sortedTabs().length;
            if (GMDashTabsRuntime && typeof GMDashTabsRuntime.getTabsLayoutStyleEditor === 'function') {
                return GMDashTabsRuntime.getTabsLayoutStyleEditor(count);
            }
            var shouldWrap = this.shouldWrapDashboardTabs();
            return (shouldWrap ? 'flex-wrap:wrap;overflow:visible;' : 'flex-wrap:nowrap;overflow-x:auto;overflow-y:visible;')
                + (typeof getMdashDashboardTabEditorSizeCssVars === 'function'
                    ? getMdashDashboardTabEditorSizeCssVars()
                    : '--md-tab-basis:176px;--md-tab-min:152px;--md-tab-max:240px;');
        },

        shouldWrapDashboardTabs: function () {
            var count = this.$computed.sortedTabs().length;
            return this.getDashboardTabOverflowMode() === 'wrap' && count > this.getDashboardTabWrapAfterCount();
        },

        setDashboardTabOverflowMode: function (ev) {
            var val = ev && ev.target ? ev.target.value : 'squeeze';
            var settings = window.appState.dashboardSettings || {};
            settings.tabOverflowMode = val === 'wrap' ? 'wrap' : 'squeeze';
            window.appState.dashboardSettings = settings;
            mdashSyncDashboardConfigRealtime();
            setTimeout(function () { if (typeof _rebindTabsSortableOnly === 'function') _rebindTabsSortableOnly(); }, 0);
        },

        setDashboardTabWrapAfterCount: function (ev) {
            var val = ev && ev.target ? parseInt(ev.target.value, 10) : 5;
            if (isNaN(val)) val = 5;
            val = Math.max(1, Math.min(20, val));
            var settings = window.appState.dashboardSettings || {};
            settings.tabWrapAfterCount = val;
            window.appState.dashboardSettings = settings;
            mdashSyncDashboardConfigRealtime();
            setTimeout(function () { if (typeof _rebindTabsSortableOnly === 'function') _rebindTabsSortableOnly(); }, 0);
        },

        getTabColor: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab && tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.cor || '#ffffff';
        },

        getTabAccentStyle: function (tab) {
            return GMDashTabsRuntime ? GMDashTabsRuntime.getTabAccentStyle(tab) : '';
        },

        getPhcColorOptions: function () {
            return [
                { value: '#ffffff', label: 'Branco' },
                { value: 'primary', label: 'Primary' },
                { value: 'success', label: 'Success' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'danger', label: 'Danger' },
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
            cfg.cor = phcType || '#ffffff';
            tab.configjson = JSON.stringify(cfg);
            this.tabColorPickerOpenFor = '';
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },

        // -- Icon color (independent from background) ---------------------
        getTabIconColor: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.corIcone || 'default';
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
            cfg.corIcone = phcType || 'default';
            tab.configjson = JSON.stringify(cfg);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },
        setTabIconCustomColor: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            if (!val) return;
            this.setTabIconColor(tab, val);
        },

        // -- Text color (with 'default' = auto contrast) ------------------
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

        // -- Font family --------------------------------------------------
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
        getTabTooltipInputValue: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            return cfg.tooltipTitle || '';
        },
        getTabTooltipTitle: function (tab) {
            return GMDashTabsRuntime ? GMDashTabsRuntime.getTabTooltipTitle(tab) : (((tab && tab.titulo) || '').trim() || 'Sem nome');
        },
        setTabTooltipTitle: function (tab, ev) {
            var val = ev && ev.target ? ev.target.value : '';
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.tooltipTitle = (val || '').trim();
            tab.configjson = JSON.stringify(cfg);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(tab, tab.table, tab.idfield);
            }
        },
        isTabIconVisible: function (tab) {
            var cfg = {};
            try { cfg = JSON.parse((tab && tab.configjson) || '{}') || {}; } catch (e) { }
            return cfg.mostrarIcone !== false;
        },
        setTabIconVisible: function (tab, ev) {
            if (!tab) return;
            var cfg = {};
            try { cfg = JSON.parse(tab.configjson || '{}') || {}; } catch (e) { }
            cfg.mostrarIcone = !!(ev && ev.target && ev.target.checked);
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

        toggleTabEditor: function (tabStamp, evt) {
            var _this = this;
            var wasOpen = this.tabEditorOpenFor === tabStamp;
            this.tabEditorOpenFor = wasOpen ? '' : tabStamp;
            if (!wasOpen) {
                var anchorRect = null;
                if (evt && evt.currentTarget) {
                    anchorRect = evt.currentTarget.getBoundingClientRect();
                    this.tabEditorPos = { top: anchorRect.bottom + 6, left: anchorRect.left };
                }
                setTimeout(function () {
                    var popover = document.querySelector('.mdash-tab-editor-popover');
                    if (popover && anchorRect) {
                        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                        var margin = 10;
                        var popoverRect = popover.getBoundingClientRect();
                        var availableBelow = viewportHeight - anchorRect.bottom - margin;
                        var availableAbove = anchorRect.top - margin;
                        var openAbove = availableBelow < Math.min(popoverRect.height, 360) && availableAbove > availableBelow;
                        var top = openAbove
                            ? Math.max(margin, anchorRect.top - popoverRect.height - 6)
                            : Math.min(anchorRect.bottom + 6, viewportHeight - popoverRect.height - margin);
                        var left = Math.min(anchorRect.left, viewportWidth - popoverRect.width - margin);
                        _this.tabEditorPos = {
                            top: Math.max(margin, top),
                            left: Math.max(margin, left)
                        };
                    }
                    $(document).one('click.mdashTabEditor', function () {
                        _this.tabEditorOpenFor = '';
                    });
                }, 0);
            }
        },

        getTabEditorTarget: function () {
            var stamp = this.tabEditorOpenFor;
            if (!stamp) return {};
            var tabs = (window.appState && window.appState.tabs) || [];
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].mdashtabstamp === stamp) return tabs[i];
            }
            return {};
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
                        configjson: JSON.stringify({ cor: '#ffffff', corIcone: 'default', corTexto: 'default' })
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
                configjson: JSON.stringify({ cor: '#ffffff', corIcone: 'default', corTexto: 'default' })
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

            // Marcar tab como componente seleccionado para Ctrl+C / Ctrl+V
            var tabObj = (window.appState.tabs || GMDashTabs).find(function (t) { return t.mdashtabstamp === tabStamp; });
            if (tabObj) {
                this.selectedComponent = { type: 'tab', stamp: tabStamp, data: tabObj };
                _currentSelectedComponent = { type: 'tab', stamp: tabStamp, data: tabObj };
            }

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

        duplicateDashboardTab: function (tabStamp) {
            var tab = (window.appState.tabs || GMDashTabs).find(function (t) { return t.mdashtabstamp === tabStamp; });
            if (!tab) return;
            // Selecciona, copia e cola — usa o motor existente do clipboard para garantir
            // que toda a árvore (containers + items + objectos) é duplicada com novos stamps.
            this.selectDashboardTab(tabStamp);
            _currentSelectedComponent = { type: 'tab', stamp: tabStamp, data: tab };
            GMDashMultiSelection.stamps = [];
            GMDashMultiSelection.type = '';
            mdashCopySelection();
            mdashPasteClipboard();
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
            var accessesInTab = (window.appState.accesses || []).filter(function (a) { return (a.escopo || 'global') === 'tab' && (a.mdashtabstamp || '') === tabStamp; });
            showDeleteConfirmation({
                title: 'Remover separador',
                message: 'Tem a certeza que deseja remover o separador <strong>' + (tab.titulo || 'Sem nome') + '</strong>?<br><small>' + containersInTab.length + ' container(s) serão removidos em cascata.</small>',
                recordToDelete: { table: 'MdashTab', stamp: tabStamp, tableKey: 'mdashtabstamp' },
                onConfirm: function () {
                    containersInTab.forEach(function (c) {
                        GMdashDeleteRecords.push({ table: 'MdashContainer', stamp: c.mdashcontainerstamp, tableKey: 'mdashcontainerstamp' });
                        executeDeleteContainer(c.mdashcontainerstamp);
                    });
                    accessesInTab.forEach(function (a) {
                        GMdashDeleteRecords.push({ table: 'MdashAccess', stamp: a.mdashaccessstamp, tableKey: 'mdashaccessstamp' });
                        executeDeleteAccess(a.mdashaccessstamp);
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

        isCompactLayoutItem: function (item) {
            return isCompactContainerItemLayout(item && item.templatelayout);
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

        addNewAccess: function () {
            addNewAccess();
        },

        editAccess: function (stamp) {
            editAccess(stamp);
        },

        deleteAccess: function (stamp) {
            deleteAccess(stamp);
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

        openIconLibraryManager: function () {
            if (typeof lbOpenIconLibraryManager === 'function') lbOpenIconLibraryManager();
        },

        editFonte: function (stamp) {
            editFonte(stamp);
        },

        deleteFonte: function (stamp) {
            deleteFonte(stamp);
        },

        // -- Copy / Paste via botões UI ------------------------------
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
                if (_clipPasteObject(snap, itemStamp)) pastedCount += 1;
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
            setTimeout(function () { if (typeof initTabsSortable === 'function') initTabsSortable(); }, 100);
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
        var $propsRoot = $tab.closest('.mdash-properties');
        if (!$propsRoot.length) return;

        $propsRoot.find('.mdash-props-tab').removeClass('is-active');
        $tab.addClass('is-active');

        $propsRoot.find('.mdash-props-tab-pane').removeClass('is-active');
        $propsRoot.find('.mdash-props-tab-pane[data-tab-pane="' + tabId + '"]').addClass('is-active');

        if (_currentSelectedComponent) {
            var $fontesPane = $propsRoot.find('.mdash-props-tab-pane[data-tab-pane="fontes"]');
            var $propsPane = $propsRoot.find('.mdash-props-tab-pane[data-tab-pane="properties"]');
            var fontesSelector = $fontesPane.length ? ('#' + $fontesPane.attr('id')) : '#mdash-fontes-panel';
            var propsSelector = $propsPane.length ? ('#' + $propsPane.attr('id')) : '#mdash-properties-panel';

            if (tabId === 'fontes') {
                renderFontesPanel(_currentSelectedComponent, fontesSelector);
            } else if (tabId === 'properties' && _currentSelectedComponent.type === 'object') {
                _renderObjectPropertiesPanel(_currentSelectedComponent.data, $(propsSelector));
            }
        }
    });
}

/**
 * Activa programaticamente uma tab das propriedades.
 * @param {string} tabId - 'properties' | 'fontes' | 'actions'
 */
function activatePropertiesTab(tabId, propsRootSelector) {
    var $root = propsRootSelector ? $(propsRootSelector) : $('.mdash-properties').not('#mdash-overlay-designer-modal .mdash-properties').first();
    if (!$root.length) $root = $('.mdash-properties').first();
    $root.find('.mdash-props-tab').removeClass('is-active');
    $root.find('.mdash-props-tab[data-tab="' + tabId + '"]').addClass('is-active');
    $root.find('.mdash-props-tab-pane').removeClass('is-active');
    $root.find('.mdash-props-tab-pane[data-tab-pane="' + tabId + '"]').addClass('is-active');
}

function activateOverlayDesignerTab(tabId) {
    activatePropertiesTab(tabId, '#mdash-overlay-designer-modal .mdash-properties');
}

// -- Resolução de scope --------------------------------------------------------
// Cada entrada define como derivar { scopeType, scopeStamp, parentContainerItemStamp,
// parentContainerStamp, label } a partir de (type, data).
// Para adicionar um novo tipo de componente basta acrescentar uma entrada aqui.

var _SCOPE_RESOLVERS = {
    container: function (data) {
        return {
            scopeType: 'container',
            scopeStamp: data.mdashcontainerstamp,
            parentContainerItemStamp: '',
            parentContainerStamp: '',
            label: 'Container'
        };
    },
    containerItem: function (data) {
        return {
            scopeType: 'containeritem',
            scopeStamp: data.mdashcontaineritemstamp,
            parentContainerItemStamp: '',
            parentContainerStamp: data.mdashcontainerstamp,
            label: 'Container Item'
        };
    },
    slot: function (data) {
        var ciStamp = data.itemStamp || '';
        var ci = ((window.appState && window.appState.containerItems) || [])
            .find(function (i) { return i.mdashcontaineritemstamp === ciStamp; });
        return {
            scopeType: 'containeritem',
            scopeStamp: ciStamp,
            parentContainerItemStamp: '',
            parentContainerStamp: ci ? ci.mdashcontainerstamp : '',
            label: 'Slot'
        };
    },
    object: function (data) {
        var ciStamp = data.mdashcontaineritemstamp || '';
        var ci = ((window.appState && window.appState.containerItems) || [])
            .find(function (i) { return i.mdashcontaineritemstamp === ciStamp; });
        return {
            scopeType: 'object',
            scopeStamp: data.mdashcontaineritemobjectstamp,
            parentContainerItemStamp: ciStamp,
            parentContainerStamp: ci ? ci.mdashcontainerstamp : '',
            label: 'Objecto'
        };
    },
    global: function () {
        return {
            scopeType: 'global',
            scopeStamp: '',
            parentContainerItemStamp: '',
            parentContainerStamp: '',
            label: 'Global'
        };
    }
};

/**
 * Selector do painel de fontes activo (dashboard principal vs modal overlay).
 */
function _resolveFontesPanelSelector() {
    if (_currentSelectedComponent && _currentSelectedComponent.surface === 'overlay'
        && $('#mdash-overlay-designer-modal').is(':visible')
        && $('#mdash-overlay-fontes-panel').length) {
        return '#mdash-overlay-fontes-panel';
    }
    return '#mdash-fontes-panel';
}

/**
 * Renderiza o painel de fontes para o componente seleccionado.
 * Mostra fontes próprias do scope + fontes herdadas (em cascata) + botão para adicionar.
 */
function renderFontesPanel(selectedComponent, panelSelector) {
    var resolvedSelector = panelSelector || _resolveFontesPanelSelector();
    _currentFontesPanelSelector = resolvedSelector;
    var panel = $(resolvedSelector);
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

    var allFontes = MDashFonte.getAvailableFontes(scope.scopeType, scope.scopeStamp, scope.parentContainerItemStamp, scope.parentContainerStamp);
    var isOwn = function (f) { return f.scope === scope.scopeType && f.scopestamp === scope.scopeStamp; };
    var ownFontes = allFontes.filter(isOwn);
    var inheritedFontes = allFontes.filter(function (f) { return !isOwn(f); });

    var sections = [
        { fontes: ownFontes, canRemove: true, icon: 'glyphicon-hdd', label: 'Fontes deste ' + scope.label, marginTop: false },
        { fontes: inheritedFontes, canRemove: false, icon: 'glyphicon-link', label: 'Fontes herdadas', marginTop: true }
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
        { ns: 'addfonte', sel: '.mdash-add-scoped-fonte', stop: false, fn: function () { addScopedFonte($(this).data('scope'), $(this).data('scopestamp')); } },
        { ns: 'editfonte', sel: '.mdash-fonte-list-item', stop: false, fn: function () { var s = $(this).data('fontestamp'); if (s) editFonteInPanel(s, resolvedSelector); } },
        { ns: 'removefonte', sel: '.mdash-fonte-remove', stop: true, fn: function () { var s = $(this).data('fontestamp'); if (s) removeScopedFonte(s); } },
        { ns: 'runfonte', sel: '.mdash-fonte-run', stop: true, fn: function () { var s = $(this).data('fontestamp'); if (s) executeFonteByStamp(s); } }
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
    var pCI = allCIs.find(function (i) { return i.mdashcontaineritemstamp === obj.mdashcontaineritemstamp; });
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
            if (typeof mdashEnsureFonteInDb === 'function') mdashEnsureFonteInDb(fonte);
            fonte.stringifyJSONFields();
            if (typeof mdashNotifySchemaUpdated === 'function') mdashNotifySchemaUpdated(fonte.mdashfontestamp);
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
function editFonteInPanel(fonteStamp, panelSelector) {
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

    var resolvedSelector = panelSelector || _currentFontesPanelSelector || _resolveFontesPanelSelector();
    _currentFontesPanelSelector = resolvedSelector;
    var panel = $(resolvedSelector);
    if (!panel.length) return;

    if (resolvedSelector === '#mdash-overlay-fontes-panel') {
        activateOverlayDesignerTab('fontes');
    }

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
        renderFontesPanel(_currentSelectedComponent, resolvedSelector);
    });

    // Bind: mudar tipo ? mostrar/esconder secções e sincronizar
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
                try {
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
                } catch (error) {
                    console.error('[MDash] Erro ao aplicar transformação da fonte:', error);
                    if (typeof alertify !== 'undefined') {
                        alertify.error('Erro ao aplicar transformação: ' + (error.message || error));
                    }
                } finally {
                    // SEMPRE fecha o modal, mesmo se houver erro
                    $modal.modal('hide');
                }
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
    canFitInRow: function (containerStamp, targetRow, newItemSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function (item) {
            return item.mdashcontainerstamp === containerStamp &&
                parseInt(item.gridrow, 10) === targetRow &&
                item.mdashcontaineritemstamp !== excludeItemStamp &&
                getEffectiveItemLayoutMode(item) === 'manual';
        });

        var usedColumns = itemsInRow.reduce(function (sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);

        return (usedColumns + newItemSpan) <= this.GRID_COLUMNS;
    },

    /**
     * Calcula espaço disponível numa linha
     */
    getAvailableSpace: function (containerStamp, targetRow, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function (item) {
            return item.mdashcontainerstamp === containerStamp &&
                parseInt(item.gridrow, 10) === targetRow &&
                item.mdashcontaineritemstamp !== excludeItemStamp &&
                getEffectiveItemLayoutMode(item) === 'manual';
        });

        var usedColumns = itemsInRow.reduce(function (sum, item) {
            return sum + getItemGridSpan(item);
        }, 0);

        return this.GRID_COLUMNS - usedColumns;
    },

    /**
     * Encontra item na posição específica
     */
    findItemAtPosition: function (containerStamp, row, col) {
        return GMDashContainerItems.find(function (item) {
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
    calculateAutoAdjust: function (containerStamp, targetRow, insertCol, insertSpan, excludeItemStamp) {
        var itemsInRow = GMDashContainerItems.filter(function (item) {
            return item.mdashcontainerstamp === containerStamp &&
                parseInt(item.gridrow, 10) === targetRow &&
                item.mdashcontaineritemstamp !== excludeItemStamp &&
                getEffectiveItemLayoutMode(item) === 'manual';
        }).sort(function (a, b) {
            return parseInt(a.gridcolstart, 10) - parseInt(b.gridcolstart, 10);
        });

        console.log('?? calculateAutoAdjust:', {
            targetRow: targetRow,
            insertCol: insertCol,
            insertSpan: insertSpan,
            excludeItemStamp: excludeItemStamp ? excludeItemStamp.substring(0, 8) : 'none',
            itemsInRow: itemsInRow.length
        });

        var adjustments = [];
        var currentCol = 1;
        var itemInserted = false; // Flag para saber se já inserimos o item

        itemsInRow.forEach(function (item) {
            var itemColStart = parseInt(item.gridcolstart, 10);
            var itemSpan = getItemGridSpan(item);

            // Se chegamos na posição de inserção e ainda não inserimos, reserva espaço
            if (!itemInserted && currentCol >= insertCol) {
                console.log('  ?? Inserindo item na col', insertCol);
                currentCol = insertCol + insertSpan;
                itemInserted = true;
            }

            // Se o item atual precisa ser movido
            if (itemColStart !== currentCol) {
                console.log('  ?? Ajuste:', item.mdashcontaineritemstamp.substring(0, 8), 'de col', itemColStart, 'para col', currentCol);
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
            console.log('  ?? Inserindo item no final, col', currentCol);
            currentCol += insertSpan;
        }

        var totalColumns = currentCol - 1;
        var isValid = totalColumns <= this.GRID_COLUMNS;

        console.log('? Resultado:', {
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
    showErrorFeedback: function ($row, targetGridRow, message) {
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
    showSuccessFeedback: function ($row, targetGridRow, adjustments) {
        this.clearFeedback($row);

        // Sempre mostra feedback verde quando validação passa
        var message = (adjustments && adjustments.length > 0)
            ? adjustments.length + ' item(s) serão reajustados'
            : '? Válido';

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
    showSwapFeedback: function ($row, targetGridRow, targetItem) {
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
    clearFeedback: function ($row) {
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
    validateDrop: function (draggedItem, targetRow, targetCol, containerStamp) {
        var draggedSpan = getItemGridSpan(draggedItem);
        var draggedRow = parseInt(draggedItem.gridrow, 10);

        console.log('?? validateDrop:', {
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

        // ? CASO 1: MESMA LINHA
        if (draggedRow === targetRow) {
            console.log('  ?? Mesma linha detectada');

            // Subcaso 1a: Arrastando SOBRE outro item na mesma linha ? SWAP
            if (targetItem && targetItem.mdashcontaineritemstamp !== draggedItem.mdashcontaineritemstamp) {
                console.log('  ?? SWAP com', targetItem.mdashcontaineritemstamp.substring(0, 8));
                result.isValid = true;
                result.strategy = 'swap';
                result.targetItem = targetItem;
                result.message = 'Trocar posições';
                return result;
            }

            // Subcaso 1b: Reposicionando na mesma linha (espaço vazio ou mesma posição)
            console.log('  ?? REPOSITION na mesma linha');
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
                console.log('  ? REPOSITION válido');
            } else {
                result.isValid = false;
                result.strategy = 'invalid';
                result.message = 'Total ultrapassa ' + GridLayoutEngine.GRID_COLUMNS + ' colunas após reajuste';
                console.log('  ? REPOSITION inválido:', result.message);
            }

            return result;
        }

        // ? CASO 2: LINHA DIFERENTE - verifica se cabe
        console.log('  ?? Linha diferente detectada');
        var availableSpace = GridLayoutEngine.getAvailableSpace(containerStamp, targetRow, draggedItem.mdashcontaineritemstamp);

        if (draggedSpan > availableSpace) {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Não cabe: precisa ' + draggedSpan + ' col, disponível ' + availableSpace + ' col';
            console.log('  ? Não cabe:', result.message);
            return result;
        }

        // ? CASO 3: Cabe - calcula ajustes
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
            console.log('  ? ADJUST válido');
        } else {
            result.isValid = false;
            result.strategy = 'invalid';
            result.message = 'Total ultrapassa ' + GridLayoutEngine.GRID_COLUMNS + ' colunas';
            console.log('  ? ADJUST inválido:', result.message);
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
    executeSwap: function (item1, item2) {
        var temp = {
            row: item1.gridrow,
            colStart: item1.gridcolstart
        };

        item1.gridrow = item2.gridrow;
        item1.gridcolstart = item2.gridcolstart;

        item2.gridrow = temp.row;
        item2.gridcolstart = temp.colStart;

        console.log('?? SWAP executado:', {
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
    executeAdjust: function (adjustments) {
        adjustments.forEach(function (adj) {
            adj.item.gridcolstart = adj.newCol;

            console.log('?? ADJUST:', {
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
    initTabsSortable();
    makeFiltersSortable();
    initContainerItemResize();
    initSlotDropZones();
    setTimeout(syncAllContainerItemsLayout, 0);
}

function _rebindTabsSortableOnly() {
    makeDashboardTabsPointerReorder();
    makeSidebarTabsSortable();
}

/**
 * Recolhe nós reordenáveis pela ordem visual (linha → coluna).
 */
function _mdashCollectFlowItems(listEl, itemSelector, excludeNodes) {
    var skip = excludeNodes || [];
    var items = [];
    var i, node, rect;
    for (i = 0; i < listEl.children.length; i++) {
        node = listEl.children[i];
        if (skip.indexOf(node) >= 0) continue;
        if (!node.matches || !node.matches(itemSelector)) continue;
        rect = node.getBoundingClientRect();
        if (rect.width < 1 && rect.height < 1) continue;
        items.push({ node: node, rect: rect });
    }
    items.sort(function (a, b) {
        var dy = a.rect.top - b.rect.top;
        if (Math.abs(dy) > 8) return dy;
        return a.rect.left - b.rect.left;
    });
    return items;
}

function _mdashGroupFlowRows(items, rowEpsilon) {
    rowEpsilon = rowEpsilon == null ? 10 : rowEpsilon;
    if (!items.length) return [];
    var rows = [[items[0]]];
    var i, row, rowTop;
    for (i = 1; i < items.length; i++) {
        row = rows[rows.length - 1];
        rowTop = row[0].rect.top;
        if (Math.abs(items[i].rect.top - rowTop) <= rowEpsilon) row.push(items[i]);
        else rows.push([items[i]]);
    }
    rows.forEach(function (r) {
        r.sort(function (a, b) { return a.rect.left - b.rect.left; });
    });
    return rows;
}

/**
 * Índice de inserção (0..n) pela posição do ponteiro na grelha flex-wrap.
 */
function _mdashFlowInsertIndex(items, clientX, clientY) {
    if (!items.length) return 0;

    var tops = items.map(function (it) { return it.rect.top; });
    var lefts = items.map(function (it) { return it.rect.left; });
    var minTop = Math.min.apply(null, tops);
    var maxTop = Math.max.apply(null, tops);
    var minLeft = Math.min.apply(null, lefts);
    var maxLeft = Math.max.apply(null, lefts);
    var singleRow = (maxTop - minTop) < 12;
    var singleColumn = (maxLeft - minLeft) < 12;

    if (singleColumn && !singleRow) {
        for (var vi = 0; vi < items.length; vi++) {
            if (clientY < items[vi].rect.top + (items[vi].rect.height * 0.5)) return vi;
        }
        return items.length;
    }

    if (singleRow) {
        var si, bx;
        for (si = 1; si <= items.length; si++) {
            bx = _mdashSlotBoundaryX(items, si);
            if (clientX < bx) return si - 1;
        }
        return items.length;
    }

    var rows = _mdashGroupFlowRows(items);
    var flat = [];
    rows.forEach(function (r) { flat = flat.concat(r); });

    var rowBounds = rows.map(function (row) {
        var rowTop = Infinity;
        var rowBottom = -Infinity;
        row.forEach(function (it) {
            rowTop = Math.min(rowTop, it.rect.top);
            rowBottom = Math.max(rowBottom, it.rect.bottom);
        });
        return { top: rowTop, bottom: rowBottom };
    });

    if (clientY < rowBounds[0].top) return 0;
    if (clientY > rowBounds[rowBounds.length - 1].bottom) return flat.length;

    var targetRow = rows.length - 1;
    var r, bandEnd;
    for (r = 0; r < rows.length; r++) {
        bandEnd = rowBounds[r].bottom;
        if (r < rows.length - 1) {
            bandEnd = rowBounds[r].bottom + ((rowBounds[r + 1].top - rowBounds[r].bottom) * 0.5);
        }
        if (clientY <= bandEnd) {
            targetRow = r;
            break;
        }
    }

    var row = rows[targetRow];
    var c, bx;
    for (c = 1; c <= row.length; c++) {
        bx = _mdashSlotBoundaryX(row, c);
        if (clientX < bx) return flat.indexOf(row[c - 1]);
    }
    return flat.indexOf(row[row.length - 1]) + 1;
}

/**
 * Posição X do limiar entre dois slots de inserção adjacentes.
 */
function _mdashSlotBoundaryX(items, slotIndex) {
    if (!items.length) return 0;
    if (slotIndex <= 0) return items[0].rect.left;
    if (slotIndex >= items.length) return items[items.length - 1].rect.right;
    var prev = items[slotIndex - 1].rect;
    var next = items[slotIndex].rect;
    return prev.right + ((next.left - prev.right) * 0.5);
}

/**
 * Evita oscilar no limiar entre dois slots adjacentes (histerese em px).
 * Saltos longos (ex.: Suporte → Compras) aplicam-se de imediato.
 */
function _mdashStabilizeInsertIndex(items, nextIndex, prevIndex, clientX, clientY, margin) {
    margin = margin == null ? 8 : margin;
    if (prevIndex == null || prevIndex < 0 || nextIndex === prevIndex) return nextIndex;
    if (!items.length) return nextIndex;

    var diff = Math.abs(nextIndex - prevIndex);
    if (diff > 1) return nextIndex;

    var tops = items.map(function (it) { return it.rect.top; });
    var lefts = items.map(function (it) { return it.rect.left; });
    var singleRow = (Math.max.apply(null, tops) - Math.min.apply(null, tops)) < 12;
    var singleColumn = (Math.max.apply(null, lefts) - Math.min.apply(null, lefts)) < 12;

    if (!singleRow && !singleColumn && diff === 1) {
        var lo = Math.min(nextIndex, prevIndex);
        var hi = Math.max(nextIndex, prevIndex);
        if (lo >= 0 && hi < items.length) {
            var aTop = items[lo].rect.top;
            var bTop = items[hi].rect.top;
            if (Math.abs(aTop - bTop) > 10) return nextIndex;
        }
    }

    if (singleColumn && !singleRow) {
        var boundary = Math.max(nextIndex, prevIndex);
        if (boundary <= 0) return nextIndex;
        if (boundary >= items.length) {
            var lastY = items[items.length - 1].rect.top + (items[items.length - 1].rect.height * 0.5);
            if (nextIndex > prevIndex && clientY < lastY + margin) return prevIndex;
            return nextIndex;
        }
        var splitY = items[boundary].rect.top + (items[boundary].rect.height * 0.5);
        if (nextIndex > prevIndex && clientY < splitY + margin) return prevIndex;
        if (nextIndex < prevIndex && clientY > splitY - margin) return prevIndex;
        return nextIndex;
    }

    var slot = Math.max(nextIndex, prevIndex);
    if (slot <= 0 || slot > items.length) return nextIndex;
    var boundaryX = _mdashSlotBoundaryX(items, slot);
    if (nextIndex > prevIndex && clientX < boundaryX + margin) return prevIndex;
    if (nextIndex < prevIndex && clientX > boundaryX - margin) return prevIndex;
    return nextIndex;
}

/**
 * Rectângulo visual do slot de inserção (placeholder overlay, sem reflow).
 */
function _mdashFlowSlotRect(flowItems, insertIndex, w, h) {
    if (!flowItems.length) return null;
    if (insertIndex <= 0) {
        var first = flowItems[0].rect;
        return { left: first.left, top: first.top, width: w, height: h };
    }
    if (insertIndex >= flowItems.length) {
        var last = flowItems[flowItems.length - 1].rect;
        return { left: last.right, top: last.top, width: w, height: h };
    }
    var prev = flowItems[insertIndex - 1].rect;
    var next = flowItems[insertIndex].rect;
    if (Math.abs(prev.top - next.top) < 10) {
        var gap = next.left - prev.right;
        return {
            left: prev.right + Math.max(0, (gap - w) * 0.5),
            top: prev.top,
            width: w,
            height: h
        };
    }
    return { left: next.left, top: next.top, width: w, height: h };
}

function _mdashPositionOverlayPlaceholder(placeholder, listEl, flowItems, insertIndex, w, h) {
    var slot = _mdashFlowSlotRect(flowItems, insertIndex, w, h);
    if (!slot) return;
    var listRect = listEl.getBoundingClientRect();
    placeholder.style.position = 'absolute';
    placeholder.style.left = (slot.left - listRect.left + listEl.scrollLeft) + 'px';
    placeholder.style.top = (slot.top - listRect.top + listEl.scrollTop) + 'px';
    placeholder.style.width = w + 'px';
    placeholder.style.minWidth = w + 'px';
    placeholder.style.height = h + 'px';
    placeholder.style.flex = 'none';
    placeholder.style.margin = '0';
    placeholder.style.zIndex = '8';
    placeholder.style.pointerEvents = 'none';
}

function _mdashResolveInsertBefore(listEl, flowItems, index, anchorSelector) {
    var insertBefore = (flowItems && index < flowItems.length) ? flowItems[index].node : null;
    if (!insertBefore && anchorSelector) {
        insertBefore = listEl.querySelector(anchorSelector);
    }
    return insertBefore;
}

/**
 * Reordenação por pointer events — vertical (sidebar) ou flow (barra flex-wrap).
 */
function mdashInitPointerListReorder(listEl, options) {
    if (!listEl) return;
    options = options || {};
    var itemSelector = options.itemSelector;
    var handleSelector = options.handleSelector;
    var placeholderClass = options.placeholderClass || 'mdash-drag-placeholder';
    var mode = options.mode || 'vertical';
    var anchorSelector = options.anchorSelector || null;
    var overlayPlaceholder = !!options.overlayPlaceholder;
    var onReorder = options.onReorder;

    if (listEl._mdashPtrReorderHandler) {
        listEl.removeEventListener('pointerdown', listEl._mdashPtrReorderHandler);
    }

    listEl._mdashPtrReorderHandler = function (e) {
        var handle = e.target && e.target.closest ? e.target.closest(handleSelector) : null;
        if (!handle || !listEl.contains(handle)) return;
        if (e.button !== 0) return;

        var item = handle.closest(itemSelector);
        if (!item || !listEl.contains(item) || item.parentElement !== listEl) return;

        e.preventDefault();
        e.stopPropagation();

        var startX = e.clientX;
        var startY = e.clientY;
        var dragging = false;
        var placeholder = document.createElement('div');
        placeholder.className = placeholderClass;
        var helper = null;
        var insertIndex = -1;
        var rafId = 0;
        var pendingX = 0;
        var pendingY = 0;
        var itemW = 0;
        var itemH = 0;

        function collectFlowItems() {
            var skip = overlayPlaceholder ? [item] : [item, placeholder];
            return _mdashCollectFlowItems(listEl, itemSelector, skip);
        }

        function applyInsertIndex(index, flowItems) {
            if (index === insertIndex) return;
            insertIndex = index;
            if (overlayPlaceholder) {
                _mdashPositionOverlayPlaceholder(placeholder, listEl, flowItems, index, itemW, itemH);
                return;
            }
            var insertBefore = _mdashResolveInsertBefore(listEl, flowItems, index, anchorSelector);
            if (insertBefore) listEl.insertBefore(placeholder, insertBefore);
            else listEl.appendChild(placeholder);
        }

        function movePlaceholderFlow(clientX, clientY) {
            var flowItems = collectFlowItems();
            var rawIndex = _mdashFlowInsertIndex(flowItems, clientX, clientY);
            var stableIndex = _mdashStabilizeInsertIndex(flowItems, rawIndex, insertIndex, clientX, clientY, 8);
            applyInsertIndex(stableIndex, flowItems);
        }

        function processPointerMove(clientX, clientY) {
            if (!dragging) {
                var dx = Math.abs(clientX - startX);
                var dy = Math.abs(clientY - startY);
                if (dx < 5 && dy < 5) return;
                dragging = true;
                itemW = item.offsetWidth;
                itemH = item.offsetHeight;
                placeholder.style.width = itemW + 'px';
                placeholder.style.minWidth = itemW + 'px';
                placeholder.style.height = itemH + 'px';
                if (mode === 'flow' && !overlayPlaceholder) placeholder.style.flex = '0 0 ' + itemW + 'px';
                item.classList.add('is-dragging');
                var startIdx = 0;
                var seen = 0;
                var ci, child;
                for (ci = 0; ci < listEl.children.length; ci++) {
                    child = listEl.children[ci];
                    if (!child.matches || !child.matches(itemSelector)) continue;
                    if (child === item) {
                        startIdx = seen;
                        break;
                    }
                    seen++;
                }
                item.style.display = 'none';
                if (overlayPlaceholder) {
                    listEl.appendChild(placeholder);
                    insertIndex = startIdx >= 0 ? startIdx : 0;
                    _mdashPositionOverlayPlaceholder(placeholder, listEl, _mdashCollectFlowItems(listEl, itemSelector, [item]), insertIndex, itemW, itemH);
                } else {
                    listEl.insertBefore(placeholder, item);
                    insertIndex = -1;
                }
                helper = item.cloneNode(true);
                helper.classList.add('mdash-pointer-drag-helper');
                helper.style.cssText = 'position:fixed;z-index:10060;pointer-events:none;opacity:.94;box-shadow:0 8px 24px rgba(15,23,42,.14);width:' + itemW + 'px;';
                document.body.appendChild(helper);
            }
            if (helper) {
                helper.style.left = (clientX + 14) + 'px';
                helper.style.top = (clientY - (itemH * 0.5)) + 'px';
            }
            movePlaceholderFlow(clientX, clientY);
        }

        function onPointerMove(ev) {
            pendingX = ev.clientX;
            pendingY = ev.clientY;
            if (rafId) return;
            rafId = requestAnimationFrame(function () {
                rafId = 0;
                processPointerMove(pendingX, pendingY);
            });
        }

        function onPointerEnd() {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerEnd);
            document.removeEventListener('pointercancel', onPointerEnd);
            if (!dragging) return;
            if (helper && helper.parentNode) helper.parentNode.removeChild(helper);
            item.style.display = '';
            var flowItems = collectFlowItems();
            var finalIndex = insertIndex >= 0 ? insertIndex : _mdashFlowInsertIndex(flowItems, pendingX, pendingY);
            var insertBefore = _mdashResolveInsertBefore(listEl, flowItems, finalIndex, anchorSelector);
            if (overlayPlaceholder) {
                if (insertBefore) listEl.insertBefore(item, insertBefore);
                else listEl.appendChild(item);
                if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
            } else {
                listEl.insertBefore(item, placeholder);
                if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
            }
            item.classList.remove('is-dragging');
            insertIndex = -1;
            var blockClick = function (ev) {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                listEl.removeEventListener('click', blockClick, true);
            };
            listEl.addEventListener('click', blockClick, true);
            setTimeout(function () {
                listEl.removeEventListener('click', blockClick, true);
            }, 350);
            if (typeof onReorder === 'function') onReorder($(listEl));
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerEnd);
        document.addEventListener('pointercancel', onPointerEnd);
    };

    listEl.addEventListener('pointerdown', listEl._mdashPtrReorderHandler);
}

/**
 * Inicializa reordenação inline das tabs (barra + sidebar).
 */
function initTabsSortable() {
    $(document).off('shown.bs.collapse.mdashTabs', '#collapse-tabs')
        .on('shown.bs.collapse.mdashTabs', '#collapse-tabs', function () {
            setTimeout(_rebindTabsSortableOnly, 30);
        });
    _rebindTabsSortableOnly();
}

/** Drag inline na barra de tabs (uma ou várias linhas). */
function makeDashboardTabsPointerReorder() {
    var listEl = document.getElementById('mdash-dashboard-tabs');
    if (!listEl) return;
    mdashInitPointerListReorder(listEl, {
        itemSelector: '.mdash-dashboard-tab',
        handleSelector: '.mdash-dashboard-tab-handle',
        placeholderClass: 'mdash-dashboard-tab-placeholder',
        mode: 'flow',
        anchorSelector: '.mdash-dashboard-tab-add',
        overlayPlaceholder: true,
        onReorder: function ($list) {
            updateTabOrderFromDom($list, '> .mdash-dashboard-tab');
        }
    });
}

/** Drag vertical no painel Separadores (sidebar). */
function makeSidebarTabsSortable() {
    var listEl = document.getElementById('mdash-tabs-sidebar-list');
    if (!listEl) return;
    mdashInitPointerListReorder(listEl, {
        itemSelector: '.mdash-sidebar-tab',
        handleSelector: '.mdash-sidebar-tab-handle',
        placeholderClass: 'mdash-sidebar-tab-placeholder',
        mode: 'flow',
        onReorder: function ($list) {
            updateTabOrderFromDom($list, '> .mdash-sidebar-tab');
        }
    });
}

function updateTabOrderFromDom($container, itemsSelector) {
    var tabsArr = (window.appState && window.appState.tabs) ? window.appState.tabs : GMDashTabs;
    if (!Array.isArray(tabsArr) || !tabsArr.length || !$container || !$container.length) return;
    var order = 1;
    $container.find(itemsSelector).each(function () {
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

/**
 * Enables drag-to-reorder on the filters sidebar list.
 * Persists the new "ordem" on each filter via realTimeComponentSync.
 */
function makeFiltersSortable() {
    var $list = $('#mdash-filters-sidebar-list');
    if (!$list.length) return;
    if ($list.hasClass('ui-sortable')) {
        try { $list.sortable('destroy'); } catch (e) { }
    }
    $list.sortable({
        items: '> .mdash-sidebar-filter',
        handle: '.mdash-sidebar-filter-handle',
        axis: 'y',
        tolerance: 'pointer',
        distance: 4,
        cancel: '.mdash-sidebar-item-actions, .mdash-btn-delete, button',
        placeholder: 'mdash-sidebar-filter-placeholder',
        forcePlaceholderSize: true,
        start: function (ev, ui) {
            ui.item.addClass('is-dragging');
            if (ui.placeholder) ui.placeholder.height(ui.item.outerHeight());
        },
        stop: function (ev, ui) {
            ui.item.removeClass('is-dragging');
            updateFilterOrderFromDom($list);
        }
    });
}

function updateFilterOrderFromDom($list) {
    var filtersArr = (window.appState && window.appState.filters) ? window.appState.filters : GMDashFilters;
    if (!Array.isArray(filtersArr) || !filtersArr.length || !$list || !$list.length) return;
    var order = 1;
    $list.find('> .mdash-sidebar-filter').each(function () {
        var stamp = $(this).attr('data-stamp');
        var filter = filtersArr.find(function (f) { return f.mdashfilterstamp === stamp; });
        if (!filter) return;
        if (filter.ordem !== order) {
            filter.ordem = order;
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(filter, filter.table, filter.idfield);
            }
        }
        order++;
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

function mdashSyncContainerItemRowSizing(containerItem) {
    if (!containerItem || !containerItem.mdashcontaineritemstamp) return;
    var host = document.getElementById(containerItem.mdashcontaineritemstamp);
    if (!host) return;

    var sizing = getContainerItemRowSizing(containerItem.templatelayout);
    host.classList.remove('m-dash-item-compact', 'm-dash-item-host');
    host.classList.add(sizing === 'stretch' ? 'm-dash-item-host' : 'm-dash-item-compact');

    host.style.removeProperty('height');
    host.style.removeProperty('min-height');
    host.style.setProperty('--md-item-min-h', '0px');

    if (sizing === 'compact') {
        mdashResetCompactLayoutHeights('#' + containerItem.mdashcontaineritemstamp);
    }
}
window.mdashSyncContainerItemRowSizing = mdashSyncContainerItemRowSizing;

function getContainerItemRowSizing(templateCode) {
    var code = String(templateCode || '').toLowerCase();
    var tpl = typeof getTemplateLayoutByCode === 'function' ? getTemplateLayoutByCode(templateCode) : null;

    if (tpl) {
        var sizing = tpl.rowsizing || tpl.rowSizing;
        if (sizing === 'compact' || sizing === 'stretch') return sizing;
        if (String(tpl.tipo || '').toLowerCase() === 'snapshot') return 'compact';
    }

    // Fallback: só cards "altos" esticam; todo o resto do containerItem fica compacto
    if (code === 'plain_card' || code === 'card_header_highlighted' || code === 'card_standard') return 'stretch';
    if (code.indexOf('brd_card_advanced_alert') !== -1) return 'stretch';
    return 'compact';
}
window.getContainerItemRowSizing = getContainerItemRowSizing;

function isCompactContainerItemLayout(templateCode) {
    return getContainerItemRowSizing(templateCode) === 'compact';
}
window.isCompactContainerItemLayout = isCompactContainerItemLayout;

function getMdashEditorGridLayoutTokens() {
    var colMin = 88;
    var gap = 14;
    return {
        colMin: colMin,
        gap: gap,
        columns: 12,
        minWidth: (12 * colMin) + (11 * gap)
    };
}
window.getMdashEditorGridLayoutTokens = getMdashEditorGridLayoutTokens;

function getItemGridStyleString(item) {
    var cssMap = getItemGridStyleMap(item);
    var s = 'grid-column: ' + cssMap.gridColumn + '; ' + (cssMap.gridRow ? ('grid-row: ' + cssMap.gridRow + '; ') : '');
    if (getContainerItemRowSizing(item && item.templatelayout) === 'compact') {
        s += ' align-self: start;';
    } else {
        s += ' height: 100%; align-self: stretch;';
    }
    return s;
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

    /*  console.log('?? detectZone:', {
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

    // console.log('?? computeManualDropSlot:', slot);

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

    console.log('?? ANTES DO DROP:', {
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

    console.log('? applyDroppedItemGridPosition - aplicando:', {
        itemStamp: itemStamp.substring(0, 8),
        row: slot.row,
        colStart: slot.colStart,
        span: slot.span
    });

    item.gridrow = slot.row;
    item.gridcolstart = slot.colStart;
    item.tamanho = slot.span;
    item.gridrowspan = slot.rowSpan;

    console.log('?? DEPOIS DO DROP (aplicado):', {
        itemStamp: itemStamp.substring(0, 8),
        gridrow: item.gridrow,
        gridcolstart: item.gridcolstart,
        tamanho: item.tamanho
    });

    // Sync imediato se existir
    if (typeof realTimeComponentSync === 'function') {
        console.log('?? Chamando realTimeComponentSync...');
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

            var $itemEl = $(this).closest('.mdash-canvas-item, .mdash-overlay-canvas-object, .mdash-overlay-canvas-place');
            if (!$itemEl.length) return;

            var isOverlayPlace = $itemEl.hasClass('mdash-overlay-canvas-place');
            var isOverlayObject = $itemEl.hasClass('mdash-overlay-canvas-object');
            var itemStamp = $itemEl.data('stamp');
            var item;
            if (isOverlayPlace) {
                var overlayItemStamp = $itemEl.closest('.mdash-overlay-objects-row').data('item-stamp');
                var containerItem = (window.appState.containerItems || []).find(function (i) {
                    return i.mdashcontaineritemstamp === overlayItemStamp;
                });
                item = containerItem ? findOverlayPlace(containerItem, $itemEl.data('place-id')) : null;
                itemStamp = $itemEl.data('place-id');
            } else if (isOverlayObject) {
                item = (window.appState.containerItemObjects || []).find(function (o) {
                    return o.mdashcontaineritemobjectstamp === itemStamp;
                });
            } else {
                item = GMDashContainerItems.find(function (i) {
                    return i.mdashcontaineritemstamp === itemStamp;
                });
            }
            if (!item) return;

            var $grid = $itemEl.closest('.mdash-container-items-row, .mdash-overlay-objects-row');
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

            $('.mdash-container-items-row, .mdash-overlay-objects-row').each(function () {
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
                if (isOverlayPlace) {
                    var overlayContainerItem = (window.appState.containerItems || []).find(function (i) {
                        return i.mdashcontaineritemstamp === $itemEl.closest('.mdash-overlay-objects-row').data('item-stamp');
                    });
                    if (overlayContainerItem) persistItemOverlayPlaces(overlayContainerItem, getItemOverlayPlaces(overlayContainerItem));
                    $itemEl.attr('style', getOverlayPlaceGridStyleString(item));
                } else if (isOverlayObject) {
                    syncOverlayObjectConfigjson(item);
                    $itemEl.attr('style', getOverlayObjectGridStyleString(item));
                } else {
                    $itemEl.css('grid-column', 'span ' + proposed);
                }

                // Atualiza o badge diretamente no DOM durante o resize
                var $badge = $itemEl.find('.mdash-item-size-badge[data-item-stamp="' + itemStamp + '"], .mdash-item-size-badge[data-overlay-stamp="' + itemStamp + '"], .mdash-item-size-badge[data-place-id="' + itemStamp + '"]');
                if ($badge.length) {
                    $badge.text(proposed + ' col');
                    $badge.attr('title', 'Largura: ' + proposed + ' colunas');
                }

                if (!isOverlayObject) {
                    setTimeout(syncAllContainerItemsLayout, 0);
                }
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
                $itemEl.removeClass('is-resizing');
                GMDashIsResizingItem = false;

                $('.mdash-container-items-row, .mdash-overlay-objects-row').each(function () {
                    var $row = $(this);
                    if ($row.data('ui-sortable')) {
                        $row.sortable('option', 'disabled', false);
                    }
                });

                if (isOverlayPlace) {
                    if (lastSize !== startSize) {
                        var overlayItemStampPlace = $itemEl.closest('.mdash-overlay-objects-row').data('item-stamp');
                        if (overlayItemStampPlace) {
                            syncOverlayGridLayoutAfterChange(overlayItemStampPlace, {
                                preserveSelection: itemStamp,
                                preserveSelectionType: 'overlayPlace',
                                layoutOnly: true
                            });
                        } else {
                            $itemEl.attr('style', getOverlayPlaceGridStyleString(item));
                        }
                    } else {
                        $itemEl.attr('style', getOverlayPlaceGridStyleString(item));
                    }
                } else if (isOverlayObject) {
                    if (typeof item.stringifyJSONFields === 'function') item.stringifyJSONFields();
                    if (lastSize !== startSize) {
                        var overlayItemStamp = $itemEl.closest('.mdash-overlay-objects-row').data('item-stamp');
                        if (overlayItemStamp) {
                            syncOverlayGridLayoutAfterChange(overlayItemStamp, { preserveSelection: itemStamp });
                        } else {
                            $itemEl.attr('style', getOverlayObjectGridStyleString(item));
                        }
                    } else {
                        $itemEl.attr('style', getOverlayObjectGridStyleString(item));
                    }
                } else {
                    $itemEl.css('grid-column', '');
                }

                if (lastSize !== startSize && typeof realTimeComponentSync === 'function') {
                    if (isOverlayObject && typeof item.stringifyJSONFields === 'function') {
                        item.stringifyJSONFields();
                        realTimeComponentSync(item, item.table, item.idfield);
                    } else if (isOverlayPlace) {
                        var syncItem = (window.appState.containerItems || []).find(function (i) {
                            return i.mdashcontaineritemstamp === $itemEl.closest('.mdash-overlay-objects-row').data('item-stamp');
                        });
                        if (syncItem) realTimeComponentSync(syncItem, syncItem.table, syncItem.idfield);
                    } else {
                        realTimeComponentSync(item, item.table, item.idfield);
                    }
                }
                if (!isOverlayObject) {
                    setTimeout(syncAllContainerItemsLayout, 0);
                }
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
                console.log('?? OVER EVENT disparado');
                $(this).addClass('is-drop-over');
            },
            out: function (event, ui) {
                console.log('?? OUT EVENT disparado');
                $(this).removeClass('is-drop-over');
                clearManualPlaceholder($(this));

                // Limpa feedback visual ao sair da linha
                VisualFeedbackManager.clearFeedback($(this));
            },
            start: function (event, ui) {
                console.log('?? START EVENT disparado');
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
                console.log('?? RECEIVE EVENT iniciado (item movido entre linhas diferentes)');

                var targetStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var movedItemStamp = ui.item && ui.item.data('stamp');
                var movedItem = GMDashContainerItems.find(function (i) {
                    return i.mdashcontainerstamp === movedItemStamp;
                });

                var isManualMode = movedItem && getEffectiveItemLayoutMode(movedItem) === 'manual';

                // ? VERIFICA VALIDAÇÃO ANTES DE EXECUTAR
                if (isManualMode) {
                    var validation = GManualDragState.validation;
                    if (!validation || !validation.isValid) {
                        console.log('? RECEIVE: Validação falhou - bloqueando operação');
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

                console.log('?? RECEIVE: chamando applyDroppedItemGridPosition');
                applyDroppedItemGridPosition(event, ui, targetStamp);
                updateContainerItemsOrder(targetStamp, isManualMode);

                var sourceStamp = ui.sender ? $(ui.sender).closest('.mdash-canvas-container').data('stamp') : '';
                if (sourceStamp) {
                    updateContainerItemsOrder(sourceStamp);
                }

                setTimeout(function () {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === movedItemStamp; });
                    console.log('?? ESTADO FINAL RECEIVE (após syncAllContainerItemsLayout):', {
                        itemStamp: movedItemStamp.substring(0, 8),
                        gridrow: finalItem ? finalItem.gridrow : 'item não encontrado',
                        gridcolstart: finalItem ? finalItem.gridcolstart : 'item não encontrado',
                        tamanho: finalItem ? finalItem.tamanho : 'item não encontrado'
                    });
                }, 100);

                setTimeout(syncAllContainerItemsLayout, 0);
            },
            sort: function (event, ui) {
                console.log('?? SORT EVENT disparado');
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

                // ? VALIDAÇÃO EM TEMPO REAL
                var validation = DragDropValidator.validateDrop(item, slot.row, slot.colStart, targetStamp);

                console.log('? Validação:', validation);

                var $targetRow = $(this); // A grid onde está a arrastar

                // Feedback visual baseado na validação (apenas na grid-row específica)
                if (!validation.isValid) {
                    VisualFeedbackManager.showErrorFeedback($targetRow, slot.row, validation.message);
                    // Mantém o placeholder para mostrar onde está a tentar soltar
                    if (ui.placeholder && ui.placeholder.css) {
                        ui.placeholder
                            .removeClass('mdash-placeholder-success') // Remove classe de sucesso
                            .addClass('is-manual-preview mdash-placeholder-error')
                            .attr('data-grid-label', '? ' + validation.message);
                        ui.placeholder.css({
                            'grid-column': slot.colStart + ' / span ' + slot.span,
                            'grid-row': slot.row + ' / span ' + slot.rowSpan
                        });
                    }
                    // ? CANCELA O ESTADO - DROP SERÁ BLOQUEADO NO STOP
                    setManualDragPreviewSlot(null, null, null);
                    GManualDragState.validation = null;

                    console.log('? SORT: Validação falhou - drop será bloqueado');
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
                            .attr('data-grid-label', '? Linha ' + slot.row + ' Col ' + slot.colStart);
                        ui.placeholder.css({
                            'grid-column': slot.colStart + ' / span ' + slot.span,
                            'grid-row': slot.row + ' / span ' + slot.rowSpan
                        });
                    }
                }
            },
            stop: function (event, ui) {
                console.log('?? STOP EVENT disparado');
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

                        // ? BLOQUEIA DROP SE VALIDAÇÃO FALHOU
                        if (!validation || !validation.isValid) {
                            console.log('? STOP: Validação falhou - cancelando drop e revertendo');

                            // Cancela o sortable - item volta ao lugar original
                            $(this).sortable('cancel');

                            // Limpa estado global
                            clearManualDragPreviewSlot();
                            GManualDragState.validation = null;

                            // Força re-render IMEDIATO para garantir que item voltou visualmente
                            syncAllContainerItemsLayout();

                            console.log('?? Item revertido para posição original');
                            return; // SAI AQUI - não executa mais nada
                        }

                        // ? VALIDAÇÃO OK - EXECUTA ESTRATÉGIA
                        console.log('?? Executando estratégia:', validation.strategy);

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

                        setTimeout(function () {
                            var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                            console.log('?? ESTADO FINAL STOP:', {
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
                console.log('?? UPDATE EVENT disparado (movimento dentro da mesma linha)');

                var liveContainerStamp = $(this).closest('.mdash-canvas-container').data('stamp');
                var itemStamp = ui.item && ui.item.data('stamp');
                var item = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                var isManualMode = item && getEffectiveItemLayoutMode(item) === 'manual';

                // ? VERIFICA VALIDAÇÃO ANTES DE EXECUTAR
                if (isManualMode) {
                    var validation = GManualDragState.validation;
                    if (!validation || !validation.isValid) {
                        console.log('? UPDATE: Validação falhou - bloqueando operação');
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

                setTimeout(function () {
                    var finalItem = GMDashContainerItems.find(function (i) { return i.mdashcontaineritemstamp === itemStamp; });
                    console.log('?? ESTADO FINAL (após syncAllContainerItemsLayout):', {
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

    console.log('?? updateContainerItemsOrder chamado:', {
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
                console.log('?? updateContainerItemsOrder MUDOU posição:', {
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
        console.log('?? updateContainerItemsOrder: skip coordinate check');
        setTimeout(syncAllContainerItemsLayout, 0);
        return;
    }

    if (containerHasAutoLayoutItems(containerStamp)) {
        normalizeContainerItemsAutoLayout(containerStamp);
    } else {
        console.log('?? Chamando ensureManualItemsHaveCoordinates...');
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
function updatePropsComponentHeader(selectedComponent, options) {
    options = options || {};
    var header = document.getElementById(options.headerId || 'mdash-props-component-header');
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

function appendContainerItemLayoutPropsSection(panel, containerItem) {
    if (!panel || !panel.length || !containerItem) return;
    panel.find('[data-mdash-layout-props-section]').remove();

    var schema = getLayoutPropsSchemaForItem(containerItem);
    if (!schema.length) return;

    containerItem.initLayoutProps();
    var typeRegistry = getMdashLayoutPropTypeRegistry();
    var secId = 'mdash-prop-sec-layout-props';

    var html = '<div class="mdash-prop-section" data-mdash-layout-props-section data-section="' + secId + '">';
    html += '  <div class="mdash-prop-section-header" data-toggle-section="' + secId + '">';
    html += '    <span class="mdash-prop-section-title"><i class="glyphicon glyphicon-adjust"></i> Propriedades do Layout</span>';
    html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
    html += '  </div>';
    html += '  <div class="mdash-prop-section-body" id="' + secId + '">';
    html += '    <p class="text-muted" style="font-size:11px;margin:0 0 10px 0;">Definidas no Layout Builder — tipos e behaviors do template activo.</p>';

    schema.forEach(function (propDef) {
        if (!propDef || !propDef.id) return;
        var typeMeta = typeRegistry[propDef.type] || typeRegistry.text;
        var stored = containerItem.layoutprops[propDef.id];
        var norm = mdashNormalizeLayoutPropStorage(stored);
        var displayVal = norm.isExpression ? norm.value : (stored !== undefined ? stored : propDef.default);
        var fieldId = 'mdash-layout-prop-' + propDef.id;

        html += '<div class="mdash-prop-field mdash-layout-prop-field" data-prop-id="' + propDef.id + '" style="margin-bottom:10px;">';
        html += '  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">';
        html += '    <label style="margin:0;">' + (propDef.label || propDef.id) + ' <span class="text-muted">(' + (typeMeta.label || propDef.type) + ')</span></label>';
        html += '    <button type="button" class="btn btn-xs btn-default mdash-layout-prop-expr-toggle" data-prop-id="' + propDef.id + '" title="Alternar valor estático / expressão JS">';
        html += '      <i class="glyphicon glyphicon-console"></i> ' + (norm.isExpression ? 'Expr' : 'Estático');
        html += '    </button>';
        html += '  </div>';

        if (norm.isExpression) {
            html += '  <textarea class="form-control input-sm mdash-layout-prop-input" data-prop-id="' + propDef.id + '" data-expr="1" rows="2" placeholder="ex: data.valor &gt; 100 ? \'#ef4444\' : \'#22c55e\'">' + (displayVal || '') + '</textarea>';
        } else if ((typeMeta.editor || propDef.type) === 'color') {
            var colorInputId = fieldId + '-color';
            var svEditor = mdashGetPropSourceValue(stored, propDef);
            html += '  ' + buildMdashLayoutColorSourcePickerHtml(propDef, svEditor, colorInputId);
        } else if ((typeMeta.editor || propDef.type) === 'number') {
            html += '  <input type="number" class="form-control input-sm mdash-layout-prop-input" data-prop-id="' + propDef.id + '" value="' + (displayVal != null ? displayVal : 0) + '" />';
        } else if ((typeMeta.editor || propDef.type) === 'checkbox' || propDef.type === 'boolean') {
            html += '  <label class="mdash-prop-field-check" style="margin-top:4px;"><input type="checkbox" class="mdash-layout-prop-input" data-prop-id="' + propDef.id + '"' + (displayVal ? ' checked' : '') + ' /><span>Activado</span></label>';
        } else if ((typeMeta.editor || propDef.type) === 'select' && Array.isArray(propDef.options) && propDef.options.length) {
            html += '  <select class="form-control input-sm mdash-layout-prop-input" data-prop-id="' + propDef.id + '">';
            propDef.options.forEach(function (opt) {
                var optVal = (opt && opt.value !== undefined) ? opt.value : opt;
                var optLabel = (opt && opt.label !== undefined) ? opt.label : optVal;
                html += '<option value="' + optVal + '"' + (displayVal == optVal ? ' selected' : '') + '>' + optLabel + '</option>';
            });
            html += '  </select>';
        } else if ((typeMeta.editor || propDef.type) === 'icon') {
            var iconInputId = fieldId + '-icon';
            html += '  ' + buildMdashLayoutIconPickerHtml(displayVal || 'star', iconInputId, propDef.iconClass);
            html += '  <input type="hidden" class="mdash-layout-prop-input mdash-layout-prop-icon-value" data-prop-id="' + propDef.id + '" value="' + (displayVal || 'star') + '" />';
        } else {
            html += '  <input type="text" class="form-control input-sm mdash-layout-prop-input" data-prop-id="' + propDef.id + '" value="' + (displayVal != null ? displayVal : '') + '" />';
        }

        if (Array.isArray(propDef.behaviors) && propDef.behaviors.length) {
            html += '  <div class="text-muted" style="font-size:10px;margin-top:4px;">';
            propDef.behaviors.forEach(function (b) {
                html += '<span class="label label-default" style="margin-right:4px;font-weight:500;">' + (b.kind || b.type || 'behavior') + '</span>';
            });
            html += '  </div>';
        }
        html += '</div>';
    });

    html += '  </div>';
    html += '</div>';

    panel.prepend(html);

    bindMdashLayoutColorSourcePicker(panel);

    bindMdashLayoutIconPicker(panel);
    panel.off('change.mdashLayoutIconProp', '.mdash-layout-icon-value').on('change.mdashLayoutIconProp', '.mdash-layout-icon-value', function () {
        var val = $(this).val();
        var propId = $(this).closest('.mdash-layout-prop-field').data('prop-id');
        panel.find('.mdash-layout-prop-icon-value[data-prop-id="' + propId + '"]').val(val).trigger('change');
    });

    panel.find('.mdash-prop-section-header[data-toggle-section="' + secId + '"]').off('click.mdashLayoutProps').on('click.mdashLayoutProps', function () {
        $(this).closest('.mdash-prop-section').toggleClass('is-collapsed');
    });

    panel.off('change.mdashLayoutProps', '.mdash-layout-prop-input')
        .on('change.mdashLayoutProps', '.mdash-layout-prop-input', function () {
            var propId = $(this).data('prop-id');
            var isExpr = $(this).data('expr') === 1 || $(this).data('expr') === '1';
            var val;
            if (this.type === 'checkbox') val = this.checked;
            else if ($(this).hasClass('mdash-layout-prop-source-value')) {
                try { val = JSON.parse($(this).val()); } catch (e) { val = $(this).val(); }
            }
            else val = $(this).val();
            containerItem.setLayoutPropValue(propId, val, isExpr);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(containerItem, containerItem.table, containerItem.idfield);
            }
            renderContainerItemTemplate(containerItem);
        });

    panel.off('click.mdashLayoutProps', '.mdash-layout-prop-expr-toggle')
        .on('click.mdashLayoutProps', '.mdash-layout-prop-expr-toggle', function () {
            var propId = $(this).data('prop-id');
            var current = containerItem.layoutprops[propId];
            var norm = mdashNormalizeLayoutPropStorage(current);
            if (norm.isExpression) {
                containerItem.setLayoutPropValue(propId, norm.value, false);
            } else {
                var seed = current;
                if (seed && typeof seed === 'object' && seed.src) seed = seed.value;
                containerItem.setLayoutPropValue(propId, String(seed != null ? seed : ''), true);
            }
            appendContainerItemLayoutPropsSection(panel, containerItem);
            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(containerItem, containerItem.table, containerItem.idfield);
            }
            renderContainerItemTemplate(containerItem);
        });
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

    // -- Guardar referência acessível fora do PetiteVue --
    _currentSelectedComponent = selectedComponent || null;

    // -- Actualizar header do componente (estilo FlutterFlow) --
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
        appendContainerItemLayoutPropsSection(panel, selectedComponent.data);
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

    // Actualiza actions panel
    renderMdashItemActionsPanel(selectedComponent);
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
            if (field === 'templatelayout' && typeof entity.initLayoutProps === 'function') {
                entity.initLayoutProps();
                entity.stringifyLayoutProps();
            }
            renderContainerItemTemplate(entity);
            if (field === 'templatelayout') {
                appendContainerItemLayoutPropsSection(panel, entity);
            }
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
        'badge': 'glyphicon glyphicon-tag',
        'progress': 'glyphicon glyphicon-signal',
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
                { value: 'badge', label: 'Badge', icon: 'glyphicon glyphicon-tag', color: 'rgba(245,158,11,0.12)', description: 'Indicador delta % com cor condicional, regras e design configurável' },
                { value: 'progress', label: 'Progresso', icon: 'glyphicon glyphicon-signal', color: 'rgba(14,165,233,0.12)', description: 'Barra de progresso com meta (100%), limiares e cores por faixa' },
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
        layoutmode: "auto",
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
        onConfirm: function () {
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
            onConfirm: function () {
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
        { value: 'badge', label: 'Badge' },
        { value: 'progress', label: 'Progresso' },
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
function showObjectPropertiesEditor(obj, panelSelector) {
    var panel = panelSelector ? $(panelSelector) : $('#mdash-properties-panel');
    if (!panel.length) return;
    if (!obj) {
        panel.html('<div class="mdash-props-empty-state"><i class="glyphicon glyphicon-stop"></i><p>Objecto não encontrado</p></div>');
        return;
    }

    var isOverlayPanel = panelSelector === '#mdash-overlay-props-panel'
        || panel.closest('#mdash-overlay-designer-modal').length > 0;

    if (isOverlayPanel) {
        activateOverlayDesignerTab('properties');
    } else {
        activatePropertiesTab('properties');
        var $propsPanel = $('.mdash-properties').not('#mdash-overlay-designer-modal .mdash-properties').first();
        if ($propsPanel.hasClass('is-collapsed')) $propsPanel.removeClass('is-collapsed');
    }

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

    // -- Delegate to type-specific inline editor if one is registered ------
    var tipoEntry = getMdashObjectTypeEntry(obj.tipo);
    var $propsScope = panel.closest('.mdash-properties');
    if (!$propsScope.length) $propsScope = $(document);
    if (tipoEntry && typeof tipoEntry.renderPropertiesInline === 'function') {
        $propsScope.find('.mdash-props-tab[data-tab="actions"]').hide();
        $propsScope.find('.mdash-props-tab[data-tab="fontes"]').show();
        panel.off('.objprops');
        tipoEntry.renderPropertiesInline(obj, panel);
        return;
    }

    // -- Generic properties editor -----------------------------------------

    // Ocultar tabs Fontes e Acções para objectos estáticos
    if (obj.processaFonte === false) {
        $propsScope.find('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').hide();
    } else {
        $propsScope.find('.mdash-props-tab[data-tab="fontes"], .mdash-props-tab[data-tab="actions"]').show();
    }

    // Fontes — filtradas por scope (herança: object ? containeritem ? container ? global)
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

    // -- Secção Identidade --
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

    // -- Secção Dados --
    html += '<div class="mdash-prop-section">';
    html += '  <div class="mdash-prop-section-header" data-toggle-section="obj-sec-data">';
    html += '    <span class="mdash-prop-section-title"><i class="glyphicon glyphicon-hdd"></i> Dados</span>';
    html += '    <i class="glyphicon glyphicon-chevron-down mdash-prop-section-chevron"></i>';
    html += '  </div>';
    html += '  <div class="mdash-prop-section-body" id="obj-sec-data">';
    html += '    <div class="row">';
    var processaBadgeColor = obj.processaFonte !== false ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)';
    var processaBadgeText = obj.processaFonte !== false ? 'Sim' : 'Não';
    var processaBadgeBorder = obj.processaFonte !== false ? 'rgba(16,185,129,0.4)' : 'rgba(107,114,128,0.3)';
    var processaBadgeFg = obj.processaFonte !== false ? '#0d7a55' : '#555';
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

    // -- Botão abrir editor --
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
        if (_currentSelectedComponent && _currentSelectedComponent.surface === 'overlay') {
            var parentItem = (window.appState.containerItems || []).find(function (i) {
                return i.mdashcontaineritemstamp === obj.mdashcontaineritemstamp;
            });
            mdashRefreshOverlayObjectPreview(obj.mdashcontaineritemobjectstamp, parentItem);
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

        // Sincronizar color picker ? text input
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

function getAccessOriginLabel(origem) {
    return (origem || 'phc').toLowerCase() === 'nativo' ? 'Nativo' : 'PHC';
}

function getAccessOriginIcon(origem) {
    return (origem || 'phc').toLowerCase() === 'nativo'
        ? 'glyphicon glyphicon-user'
        : 'glyphicon glyphicon-lock';
}

function getAccessScopeLabel(access) {
    if (!access || (access.escopo || 'global') !== 'tab') return 'Todo o dashboard';
    var tab = (window.appState && window.appState.tabs ? window.appState.tabs : GMDashTabs).find(function (t) {
        return t.mdashtabstamp === access.mdashtabstamp;
    });
    return 'Separador: ' + ((tab && tab.titulo) || 'Sem nome');
}

function addNewAccess() {
    openAccessOriginModal(function (origem) {
        var newAccess = new MdashAccess({
            dashboardstamp: GMDashStamp,
            origem: origem || 'phc'
        });
        newAccess.__pendingSetup = true;
        newAccess.__skipPendingCleanup = false;

        window.appState.accesses.push(newAccess);

        if ((newAccess.origem || 'phc') === 'phc') {
            openPhcAccessPickerModal(newAccess);
        } else {
            openAccessEditModal(newAccess);
        }
    });
}

function editAccess(accessStamp) {
    var access = GMDashAccesses.find(function (a) {
        return a.mdashaccessstamp === accessStamp;
    });

    if (!access) {
        alertify.error('Acesso não encontrado');
        return;
    }

    openAccessEditModal(access);
}

function openAccessOriginModal(onSelect) {
    resetModalOpenState('#mdash-access-origin-modal');

    var modalHtml = '';
    modalHtml += '<div class="modal fade" id="mdash-access-origin-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-sm">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-lock"></i> Origem do perfil de acesso</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <p class="text-muted" style="margin-bottom:14px;">Escolha primeiro onde este acesso será gerido.</p>';
    modalHtml += '        <button type="button" class="btn btn-primary btn-block" id="mdash-access-origin-phc"><i class="glyphicon glyphicon-briefcase"></i> PHC</button>';
    modalHtml += '        <button type="button" class="btn btn-default btn-block" id="mdash-access-origin-native" style="margin-top:8px;"><i class="glyphicon glyphicon-user"></i> Nativo</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);
    $('#mdash-access-origin-modal').modal('show');

    $('#mdash-access-origin-phc').on('click', function () {
        $('#mdash-access-origin-modal').modal('hide');
        if (typeof onSelect === 'function') onSelect('phc');
    });

    $('#mdash-access-origin-native').on('click', function () {
        $('#mdash-access-origin-modal').modal('hide');
        if (typeof onSelect === 'function') onSelect('nativo');
    });
}

function fetchPhcAccesses(onDone) {
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getacessosphcmdash",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{}])
        },
        success: function (response) {
            if (response.cod !== "0000") {
                alertify.error('Não foi possível carregar os acessos PHC.');
                if (typeof onDone === 'function') onDone([]);
                return;
            }
            if (typeof onDone === 'function') onDone(response.data || []);
        },
        error: function () {
            alertify.error('Erro ao obter os acessos PHC.');
            if (typeof onDone === 'function') onDone([]);
        }
    });
}

function openPhcAccessPickerModal(access) {
    resetModalOpenState('#mdash-phc-access-picker-modal');
    access.__skipPendingCleanup = false;
    window.__mdashPhcAccessPickerCache = [];
    window.__mdashPhcAccessPickerSelected = '';
    window.__mdashPhcAccessPickerQuery = '';

    var modalHtml = '';
    modalHtml += '<div class="modal fade" id="mdash-phc-access-picker-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-lock"></i> Selecionar perfil de acesso PHC</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body">';
    modalHtml += '        <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;">';
    modalHtml += '          <div class="text-muted"><small>Escolha um perfil existente da tabela <strong>pf</strong> ou crie um novo.</small></div>';
    modalHtml += '          <div style="display:flex;gap:8px;flex-wrap:wrap;">';
    modalHtml += '            <button type="button" class="btn btn-default btn-sm" id="btn-refresh-phc-accesses"><i class="glyphicon glyphicon-refresh"></i> Atualizar</button>';
    modalHtml += '            <button type="button" class="btn btn-default btn-sm" id="btn-new-phc-access"><i class="glyphicon glyphicon-plus"></i> Novo perfil de acesso PHC</button>';
    modalHtml += '            <button type="button" class="btn btn-default btn-sm" id="btn-open-native-access"><i class="glyphicon glyphicon-pencil"></i> Preencher manualmente</button>';
    modalHtml += '          </div>';
    modalHtml += '        </div>';
    modalHtml += '        <div class="mdash-objects-search-wrapper" style="margin-bottom:12px;">';
    modalHtml += '          <i class="glyphicon glyphicon-search"></i>';
    modalHtml += '          <input type="text" class="mdash-objects-search" id="mdash-phc-access-search" placeholder="Filtrar por código, nome, descrição ou stamp..." />';
    modalHtml += '        </div>';
    modalHtml += '        <div id="mdash-phc-access-picker-list"><p class="text-muted text-center" style="padding:20px 0;">A carregar acessos...</p></div>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" id="btn-apply-phc-access">Usar acesso</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);
    $('#mdash-phc-access-picker-modal').modal('show');
    $('#mdash-phc-access-picker-modal').on('hidden.bs.modal', function () {
        var shouldCleanup = access && access.__pendingSetup && !access.__skipPendingCleanup && !access.codigo && !access.nome;
        if (access) access.__skipPendingCleanup = false;
        if (shouldCleanup) {
            executeDeleteAccess(access.mdashaccessstamp, true);
        }
    });

    function getFilteredRows(rows) {
        var q = (window.__mdashPhcAccessPickerQuery || '').toLowerCase().trim();
        if (!q) return rows || [];
        return (rows || []).filter(function (row) {
            return [
                row.codigo || '',
                row.nome || '',
                row.resumo || '',
                row.descricao || '',
                row.pfstamp || ''
            ].join(' ').toLowerCase().indexOf(q) !== -1;
        });
    }

    function renderAccessRows(rows) {
        var filteredRows = getFilteredRows(rows);
        var html = '';
        if (!filteredRows.length) {
            html = '<p class="text-muted text-center" style="padding:20px 0;">Nenhum perfil de acesso PHC encontrado para o filtro atual.</p>';
        } else {
            filteredRows.forEach(function (row) {
                var rowName = row.nome || row.resumo || row.descricao || row.codigo || 'Sem nome';
                html += '<button type="button" class="btn btn-default btn-block mdash-phc-access-row" data-pfstamp="' + (row.pfstamp || '') + '" style="text-align:left;margin-bottom:8px;">';
                html += '  <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">';
                html += '    <div>';
                html += '      <div style="font-weight:700;color:#1f2937;">' + escapeHtml(rowName) + '</div>';
                html += '      <div class="text-muted"><small>Código: ' + escapeHtml(row.codigo || '') + ' • Stamp: ' + escapeHtml(row.pfstamp || '') + '</small></div>';
                if (row.descricao) {
                    html += '      <div class="text-muted"><small>' + escapeHtml(row.descricao) + '</small></div>';
                }
                html += '    </div>';
                html += '    <span class="badge">PHC</span>';
                html += '  </div>';
                html += '</button>';
            });
        }
        $('#mdash-phc-access-picker-list').html(html);
    }

    function reloadPhcAccessRows() {
        $('#mdash-phc-access-picker-list').html('<p class="text-muted text-center" style="padding:20px 0;">A carregar acessos...</p>');
        fetchPhcAccesses(function (rows) {
            window.__mdashPhcAccessPickerCache = rows || [];
            renderAccessRows(window.__mdashPhcAccessPickerCache);
        });
    }

    reloadPhcAccessRows();

    $(document).off('click.mdashPhcAccessRow').on('click.mdashPhcAccessRow', '.mdash-phc-access-row', function () {
        $('.mdash-phc-access-row').removeClass('active');
        $(this).addClass('active');
        window.__mdashPhcAccessPickerSelected = $(this).attr('data-pfstamp') || '';
    });
    $('#mdash-phc-access-search').on('input', function () {
        window.__mdashPhcAccessPickerQuery = $(this).val() || '';
        renderAccessRows(window.__mdashPhcAccessPickerCache || []);
    });

    $('#btn-refresh-phc-accesses').on('click', reloadPhcAccessRows);
    $('#btn-new-phc-access').on('click', function () {
        access.__skipPendingCleanup = true;
        $('#mdash-phc-access-picker-modal').modal('hide');
        openPhcAccessCreateModal(access);
    });
    $('#btn-open-native-access').on('click', function () {
        access.origem = 'nativo';
        access.pfstamp = '';
        access.__skipPendingCleanup = true;
        $('#mdash-phc-access-picker-modal').modal('hide');
        openAccessEditModal(access);
    });
    $('#btn-apply-phc-access').on('click', function () {
        var selectedStamp = window.__mdashPhcAccessPickerSelected || '';
        var selected = (window.__mdashPhcAccessPickerCache || []).find(function (row) {
            return (row.pfstamp || '') === selectedStamp;
        });

        if (!selected) {
            alertify.warning('Selecione primeiro um acesso PHC.');
            return;
        }

        access.origem = 'phc';
        access.pfstamp = selected.pfstamp || '';
        access.codigo = selected.codigo || '';
        access.nome = selected.nome || selected.resumo || selected.codigo || '';
        access.descricao = selected.descricao || selected.resumo || access.nome || '';
        if ((access.escopo || 'global') === 'tab' && !access.mdashtabstamp && window.appState.activeTabStamp) {
            access.mdashtabstamp = window.appState.activeTabStamp;
        }

        if (typeof realTimeComponentSync === 'function') {
            realTimeComponentSync(access, access.table, access.idfield);
        }

        $('#mdash-phc-access-picker-modal').modal('hide');
        openAccessEditModal(access);
    });
}

function openPhcAccessCreateModal(access) {
    resetModalOpenState('#mdash-phc-access-create-modal');
    access.__skipPendingCleanup = false;

    var modalData = {
        title: '<i class="glyphicon glyphicon-plus"></i> Novo perfil de acesso PHC',
        id: 'mdash-phc-access-create-modal',
        dialogClass: 'mdash-phc-access-create-dialog',
        dialogStyle: 'width:95vw;max-width:95vw;margin:20px auto;',
        body: '<div class="text-muted" style="margin-bottom:10px;"><small>Crie  perfil de acesso no PHC e depois volte para atualizar a lista.</small></div><div id="mdash-phc-access-create-host" style="min-height:78vh;"></div>',
        footerContent: '<button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button><button type="button" class="btn btn-primary" id="btn-back-to-phc-picker">Voltar à lista</button>'
    };

    $('#' + modalData.id).remove();
    $('body').append(generateModalHTML(modalData));
     $("#"+modalData.id +" .modal-dialog").css("width", "90%");
    $('#' + modalData.id).on('hidden.bs.modal', function () {
        var shouldCleanup = access && access.__pendingSetup && !access.__skipPendingCleanup && !access.codigo && !access.nome;
        if (access) access.__skipPendingCleanup = false;
        if (shouldCleanup) {
            executeDeleteAccess(access.mdashaccessstamp, true);
        }
    });

    var mountPhcAccessIframe = function () {
        var hostSelector = '#mdash-phc-access-create-host';
        $(hostSelector).empty();
        var iframeUrl = '../programs/pfform.aspx?fazer=introduzir';
        var mountIframeFallback = function () {
            $(hostSelector).html('<iframe id="mdash-phc-access-create-iframe-fallback" src="' + iframeUrl + '" style="width:100%;height:78vh;border:none;background:#fff;"></iframe>');
        };

        if (typeof generateComponent === 'function') {
            try {
                generateComponent({
                    id: 'mdash-phc-access-create-iframe',
                    src: iframeUrl,
                    styles: 'width:100%;height:78vh;border:none;background:#fff;',
                    customData: '',
                    parent: hostSelector,
                    elementsToHide: ["header", "header", ".headerZone", "#history", "footer", "#ShowSearch", "#options4", "#options3", "#options5"]

                });
                setTimeout(function () {
                    var hasGeneratedIframe = $('#mdash-phc-access-create-iframe-container iframe').length > 0;
                    if (!hasGeneratedIframe) {
                        mountIframeFallback();
                    }
                }, 250);
            } catch (e) {
                console.warn('[MDash] generateComponent falhou para acesso PHC:', e);
                mountIframeFallback();
            }
        } else {
            mountIframeFallback();
        }
    };

    mountPhcAccessIframe();
    $('#' + modalData.id).modal('show');
    $('#' + modalData.id).on('shown.bs.modal', function () {
        setTimeout(function () {
            if (!$('#mdash-phc-access-create-host iframe').length) {
                mountPhcAccessIframe();
            }
        }, 100);
    });

    $('#btn-back-to-phc-picker').on('click', function () {
        access.__skipPendingCleanup = true;
        $('#mdash-phc-access-create-modal').modal('hide');
        openPhcAccessPickerModal(access);
    });
}

function openAccessEditModal(access) {
    resetModalOpenState('#mdash-access-edit-modal');
    access.__skipPendingCleanup = false;

    var modalHtml = '';
    modalHtml += '<div class="modal fade" id="mdash-access-edit-modal" tabindex="-1">';
    modalHtml += '  <div class="modal-dialog modal-lg">';
    modalHtml += '    <div class="modal-content">';
    modalHtml += '      <div class="modal-header">';
    modalHtml += '        <button type="button" class="close" data-dismiss="modal">&times;</button>';
    modalHtml += '        <h4 class="modal-title"><i class="glyphicon glyphicon-lock"></i> ' + buildModalEntityTitle('Acesso', access.nome || access.codigo || '') + '</h4>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-body" id="mdash-access-edit-modal-body">';
    modalHtml += '        <div class="row">';
    modalHtml += '          <div class="col-md-4"><div class="form-group"><label>Origem do acesso</label><select class="form-control input-sm" v-model="mdashAccessItem.origem" @change="handleChangeAccess"><option value="phc">PHC</option><option value="nativo">Nativo</option></select></div></div>';
    modalHtml += '          <div class="col-md-4"><div class="form-group"><label>Código</label><input type="text" class="form-control input-sm" v-model="mdashAccessItem.codigo" @change="handleChangeAccess" /></div></div>';
    modalHtml += '          <div class="col-md-4" style="display:none;"><div class="form-group"><label>Stamp PHC</label><input type="text" class="form-control input-sm" v-model="mdashAccessItem.pfstamp" :readonly="(mdashAccessItem.origem || \'phc\') === \'phc\'" @change="handleChangeAccess" /></div></div>';
    modalHtml += '          <div class="col-md-8"><div class="form-group"><label>Nome do acesso</label><input type="text" class="form-control input-sm" v-model="mdashAccessItem.nome" @change="handleChangeAccess" /></div></div>';
    modalHtml += '          <div class="col-md-4"><div class="form-group"><label>Aplicar em</label><select class="form-control input-sm" v-model="mdashAccessItem.escopo" @change="handleChangeAccess"><option value="global">Todo o dashboard</option><option value="tab">Separador específico</option></select></div></div>';
    modalHtml += '          <div class="col-md-6"><div class="form-group"><label>Separador</label><select class="form-control input-sm" v-model="mdashAccessItem.mdashtabstamp" :disabled="mdashAccessItem.escopo !== \'tab\'" @change="handleChangeAccess"><option value="">Todo o dashboard</option><option v-for="tab in getTabOptions()" :value="tab.mdashtabstamp">{{ tab.titulo || tab.mdashtabstamp }}</option></select></div></div>';
    modalHtml += '          <div class="col-md-6"><div class="form-group"><label>Descrição</label><input type="text" class="form-control input-sm" v-model="mdashAccessItem.descricao" @change="handleChangeAccess" /></div></div>';
    modalHtml += '        </div>';
    modalHtml += '        <div class="alert alert-info" style="margin-bottom:0;" v-if="(mdashAccessItem.origem || \'phc\') === \'phc\'">';
    modalHtml += '          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;">';
    modalHtml += '            <span><strong>Fonte de acessos:</strong> PHC. Pode escolher um perfil existente ou criar um novo.</span>';
    modalHtml += '            <span style="display:flex;gap:8px;flex-wrap:wrap;">';
    modalHtml += '              <button type="button" class="btn btn-default btn-sm" @click="choosePhcAccess"><i class="glyphicon glyphicon-search"></i> Escolher no PHC</button>';
    modalHtml += '              <button type="button" class="btn btn-default btn-sm" @click="createPhcAccess"><i class="glyphicon glyphicon-plus"></i> Novo perfil de acesso PHC</button>';
    modalHtml += '            </span>';
    modalHtml += '          </div>';
    modalHtml += '        </div>';
    modalHtml += '      </div>';
    modalHtml += '      <div class="modal-footer">';
    modalHtml += '        <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>';
    modalHtml += '        <button type="button" class="btn btn-primary" onclick="saveAccessFromModal()">Guardar</button>';
    modalHtml += '      </div>';
    modalHtml += '    </div>';
    modalHtml += '  </div>';
    modalHtml += '</div>';

    $('body').append(modalHtml);

    var accessModalVm = {
        mdashAccessItem: access,
        getTabOptions: function () {
            return (window.appState && window.appState.tabs ? window.appState.tabs : GMDashTabs).slice().sort(function (a, b) {
                return (a.ordem || 0) - (b.ordem || 0);
            });
        },
        handleChangeAccess: function () {
            if ((this.mdashAccessItem.escopo || 'global') === 'global') {
                this.mdashAccessItem.mdashtabstamp = '';
            } else if (!this.mdashAccessItem.mdashtabstamp && window.appState && window.appState.activeTabStamp) {
                this.mdashAccessItem.mdashtabstamp = window.appState.activeTabStamp;
            }

            if ((this.mdashAccessItem.origem || 'phc') !== 'phc') {
                this.mdashAccessItem.pfstamp = '';
            }

            if (typeof realTimeComponentSync === 'function') {
                realTimeComponentSync(this.mdashAccessItem, this.mdashAccessItem.table, this.mdashAccessItem.idfield);
            }
        },
        choosePhcAccess: function () {
            this.mdashAccessItem.__skipPendingCleanup = true;
            $('#mdash-access-edit-modal').modal('hide');
            openPhcAccessPickerModal(this.mdashAccessItem);
        },
        createPhcAccess: function () {
            this.mdashAccessItem.__skipPendingCleanup = true;
            $('#mdash-access-edit-modal').modal('hide');
            openPhcAccessCreateModal(this.mdashAccessItem);
        }
    };

    window.__mdashAccessModalVm = accessModalVm;
    PetiteVue.createApp(accessModalVm).mount('#mdash-access-edit-modal-body');
    $('#mdash-access-edit-modal').modal('show');
    $('#mdash-access-edit-modal').on('hidden.bs.modal', function () {
        var shouldCleanup = access && access.__pendingSetup && !access.__skipPendingCleanup && !access.codigo && !access.nome;
        if (access) access.__skipPendingCleanup = false;
        if (shouldCleanup) {
            executeDeleteAccess(access.mdashaccessstamp, true);
        }
    });
}

function saveAccessFromModal() {
    if (window.__mdashAccessModalVm && window.__mdashAccessModalVm.handleChangeAccess) {
        window.__mdashAccessModalVm.mdashAccessItem.__pendingSetup = false;
        window.__mdashAccessModalVm.handleChangeAccess();
    }
    $('#mdash-access-edit-modal').modal('hide');
    alertify.success('Acesso guardado com sucesso!');
}

function deleteAccess(accessStamp) {
    var access = GMDashAccesses.find(function (a) {
        return a.mdashaccessstamp === accessStamp;
    });

    if (!access) {
        alertify.error('Acesso não encontrado');
        return;
    }

    showDeleteConfirmation({
        title: 'Confirmar eliminação',
        message: 'Tem a certeza que deseja eliminar o acesso "' + (access.nome || access.codigo || 'Sem nome') + '"?',
        recordToDelete: {
            table: "MdashAccess",
            stamp: accessStamp,
            tableKey: "mdashaccessstamp"
        },
        onConfirm: function () {
            executeDeleteAccess(accessStamp);
        }
    });
}

function executeDeleteAccess(accessStamp, silent) {
    var access = GMDashAccesses.find(function (a) {
        return a.mdashaccessstamp === accessStamp;
    });

    if (!access) return;

    var index = window.appState.accesses.indexOf(access);
    if (index > -1) {
        window.appState.accesses.splice(index, 1);
    }

    if (!silent) alertify.success('Acesso eliminado com sucesso!');
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
            listHtml += '    <div class="mdash-filter-manager-meta">' + (getFilterTypeLabel(filter.tipo) || '') + ' • ' + getMdashFilterScopeSummary(filter, (window.appState && window.appState.tabs) || GMDashTabs) + ' • Ordem ' + (filter.ordem || 0) + '</div>';
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
        var isMultiselect = obj.contentType === "multiselect";

        // Valor atual do campo
        var currentValue = filter[obj.campo] || '';
        if (isCheckbox) {
            currentValue = filter[obj.campo] || false;
        }

        // Classes do campo
        var fieldClasses = obj.classes + " mdashconfig-item-input";

        // Custom data para v-model
        var customData = obj.customData || '';
        if (!isMultiselect) {
            customData += " v-model='mdashFilterItem." + obj.campo + "'";
        }

        if (isDiv) {
            customData += " v-on:keyup='changeDivContent(\"" + obj.campo + "\")'";
        } else if (!isMultiselect) {
            customData += " @change='handleChangeFilterEscopo'";
        }

        // Wrapper da coluna
        formHtml += '<div class="col-md-' + obj.colSize + '" style="margin-bottom:0.5em;">';
        formHtml += '  <div class="form-group">';
        formHtml += '    <label>' + obj.titulo + '</label>';
        if (isMultiselect) {
            formHtml += '    <small class="text-muted" style="display:block;margin-bottom:4px;">Aplica o filtro aos separadores seleccionados (apenas quando o escopo é «Por separador»).</small>';
        }

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
        // Multiselect (separadores do filtro)
        else if (isMultiselect) {
            var selectedStamps = parseMdashFilterTabStamps(filter[obj.campo]);
            formHtml += '    <select id="' + obj.campo + '" multiple ';
            formHtml += '            class="' + fieldClasses + '" ';
            formHtml += '            data-mdash-filter-tab-scope-select>';
            obj.selectValues.forEach(function (selectOption) {
                var optionValue = selectOption[obj.fieldToValue];
                var optionLabel = selectOption[obj.fieldToOption];
                var selectedAttr = selectedStamps.indexOf(optionValue) !== -1 ? ' selected' : '';
                formHtml += '      <option value="' + optionValue + '"' + selectedAttr + '>' + optionLabel + '</option>';
            });
            formHtml += '    </select>';
        }
        // Div (Editor de código)
        else if (isDiv) {
            formHtml += '    <div id="' + obj.campo + '" ';
            formHtml += '         data-field="' + obj.campo + '" ';
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
    var filterModalVm = {
        mdashFilterItem: filter,

        syncFilterTabScopeFromSelect: function () {
            var $sel = $('#mdash-filter-edit-modal #mdashtabstamp');
            if (!$sel.length) return;
            var vals = $sel.val() || [];
            this.mdashFilterItem.mdashtabstamp = joinMdashFilterTabStamps(vals);
        },

        handleChangeFilterEscopo: function () {
            if ((this.mdashFilterItem.escopo || 'global') === 'global') {
                this.mdashFilterItem.mdashtabstamp = '';
                var $sel = $('#mdash-filter-edit-modal #mdashtabstamp');
                if ($sel.length) {
                    if ($sel.data('select2')) {
                        $sel.val(null).trigger('change.select2');
                    }
                    $sel.prop('disabled', true);
                }
            } else {
                var $selTab = $('#mdash-filter-edit-modal #mdashtabstamp');
                if ($selTab.length) {
                    $selTab.prop('disabled', false);
                    var stamps = parseMdashFilterTabStamps(this.mdashFilterItem.mdashtabstamp);
                    if (!stamps.length && window.appState && window.appState.activeTabStamp) {
                        stamps = [window.appState.activeTabStamp];
                        this.mdashFilterItem.mdashtabstamp = joinMdashFilterTabStamps(stamps);
                    }
                    if ($selTab.data('select2')) {
                        $selTab.val(stamps).trigger('change.select2');
                    }
                }
            }
            this.handleChangeFilter();
        },

        handleChangeFilter: function () {
            this.syncFilterTabScopeFromSelect();
            this.mdashFilterItem.mdashtabstamp = normalizeMdashFilterTabStampField(this.mdashFilterItem.mdashtabstamp || '');
            // Sincronização em tempo real
            realTimeComponentSync(this.mdashFilterItem, this.mdashFilterItem.table, this.mdashFilterItem.idfield);
        },

        changeDivContent: function (campo) {
            // Atualiza o conteúdo do editor ACE
            var nextValue = '';
            try {
                if (typeof ace !== 'undefined' && ace.edit) {
                    nextValue = ace.edit(campo).getValue();
                } else {
                    nextValue = $('#' + campo).text();
                }
            } catch (e) {
                nextValue = $('#' + campo).text();
            }
            this.mdashFilterItem[campo] = nextValue;
            this.handleChangeFilter();
        }
    };

    window.__mdashFilterModalVm = filterModalVm;

    PetiteVue.createApp(filterModalVm).mount('#mdash-filter-edit-modal');

    $('#mdash-filter-edit-modal').modal('show');

    // Inicializa editores de código ACE após o modal estar visível
    $('#mdash-filter-edit-modal').on('shown.bs.modal', function () {
        handleCodeEditor();
        initFilterTabScopeMultiselect(filter);

        // Bind robust real-time sync from ACE (does not rely on DOM keyup bubbling).
        $('#mdash-filter-edit-modal .m-editor').each(function () {
            var editorId = this.id;
            var fieldName = $(this).attr('data-field') || editorId;
            if (!editorId || !fieldName || typeof ace === 'undefined' || !ace.edit) return;

            var aceEd = ace.edit(editorId);
            if (!aceEd || !aceEd.session) return;

            var syncTimer = null;
            aceEd.session.on('change', function () {
                if (syncTimer) clearTimeout(syncTimer);
                syncTimer = setTimeout(function () {
                    if (!window.__mdashFilterModalVm || !window.__mdashFilterModalVm.mdashFilterItem) return;
                    window.__mdashFilterModalVm.mdashFilterItem[fieldName] = aceEd.getValue();
                    window.__mdashFilterModalVm.handleChangeFilter();
                }, 260);
            });
        });
    }).on('hidden.bs.modal', function () {
        var $sel = $('#mdash-filter-edit-modal #mdashtabstamp');
        if ($sel.length && $sel.data('select2')) {
            try { $sel.select2('destroy'); } catch (e) { /* ignore */ }
        }
        window.__mdashFilterModalVm = null;
        $(this).remove();
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
    if (window.__mdashFilterModalVm && window.__mdashFilterModalVm.mdashFilterItem) {
        if (typeof window.__mdashFilterModalVm.syncFilterTabScopeFromSelect === 'function') {
            window.__mdashFilterModalVm.syncFilterTabScopeFromSelect();
        }
        $('#mdash-filter-edit-modal .m-editor').each(function () {
            var editorId = this.id;
            var fieldName = $(this).attr('data-field') || editorId;
            if (!fieldName) return;

            var val = '';
            try {
                if (typeof ace !== 'undefined' && ace.edit && editorId) {
                    val = ace.edit(editorId).getValue();
                } else {
                    val = $(this).text();
                }
            } catch (e) {
                val = $(this).text();
            }
            window.__mdashFilterModalVm.mdashFilterItem[fieldName] = val;
        });

        window.__mdashFilterModalVm.handleChangeFilter();
    }

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
        onConfirm: function () {
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
 * 'dark'  ? fundo escuro, texto claro
 * 'light' ? fundo branco, texto escuro
 * Hardcoded 'dark' em todos os call sites. No futuro, ler de preferência do utilizador.
 */
function getMDashPanelTheme(mode) {
    if (mode === 'dark') {
        return {
            bodyBg: 'linear-gradient(180deg,#1a2335,#1e2a3d)',
            panelHeadingBg: 'linear-gradient(180deg,#1e2a3d,#212f47)',
            panelBodyBg: '#1a2335',
            sectionBorder: 'rgba(255,255,255,0.07)',
            sectionHoverBg: 'rgba(255,255,255,0.04)',
            sectionTitleColor: '#e2e8f0',
            chevronColor: 'rgba(255,255,255,0.3)',
            labelColor: '#94a3b8',
            textColor: '#e2e8f0',
            mutedColor: 'rgba(255,255,255,0.28)',
            inputBg: '#253048',
            inputBorder: 'rgba(255,255,255,0.12)',
            inputColor: '#e2e8f0',
            itemBg: 'rgba(255,255,255,0.05)',
            itemBorder: 'rgba(255,255,255,0.08)',
        };
    }
    return {
        bodyBg: 'linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.97))',
        panelHeadingBg: 'linear-gradient(180deg,#ffffff,#f8fafc)',
        panelBodyBg: '#ffffff',
        sectionBorder: 'rgba(0,0,0,0.06)',
        sectionHoverBg: 'rgba(0,0,0,0.03)',
        sectionTitleColor: '#1e293b',
        chevronColor: 'rgba(0,0,0,0.28)',
        labelColor: '#475569',
        textColor: '#1e293b',
        mutedColor: 'rgba(0,0,0,0.38)',
        inputBg: '#fff',
        inputBorder: 'rgba(0,0,0,0.12)',
        inputColor: '#1e293b',
        itemBg: '#fff',
        itemBorder: 'var(--md-border)',
    };
}

/**
 * Tokens de tema MDash (primary via getColorByType).
 * Usado no editor principal e em modais fora do .mdash-editor-wrapper.
 */
function getMdashThemeTokens() {
    var primaryColor = '#2563eb';
    if (typeof getColorByType === 'function') {
        try {
            primaryColor = getColorByType('primary').background || primaryColor;
        } catch (e) { /* fallback */ }
    }
    return {
        primary: primaryColor,
        primaryRgb: hexToRgb(primaryColor),
        surface: '#ffffff',
        bg: '#f3f6fb',
        text: '#1f2937',
        muted: '#64748b',
        border: 'rgba(15,23,42,0.08)'
    };
}

function buildMdashThemeVarsCss(selector) {
    var t = getMdashThemeTokens();
    return selector + ' { --md-primary: ' + t.primary + '; --md-primary-rgb: ' + t.primaryRgb
        + '; --md-surface: ' + t.surface + '; --md-bg: ' + t.bg + '; --md-text: ' + t.text
        + '; --md-muted: ' + t.muted + '; --md-border: ' + t.border + '; }';
}

function applyMdashThemeToElement(el) {
    if (!el || !el.style) return;
    var t = getMdashThemeTokens();
    el.style.setProperty('--md-primary', t.primary);
    el.style.setProperty('--md-primary-rgb', t.primaryRgb);
    el.style.setProperty('--md-surface', t.surface);
    el.style.setProperty('--md-bg', t.bg);
    el.style.setProperty('--md-text', t.text);
    el.style.setProperty('--md-muted', t.muted);
    el.style.setProperty('--md-border', t.border);
}
window.applyMdashThemeToElement = applyMdashThemeToElement;

function getMdashOverlayRuntimeStylesCss() {
    // Apenas layout da grelha de conteúdo — a modal usa o design nativo PHC (sem personalizar header/body).
    var gridLayout = getMdashEditorGridLayoutTokens();
    var css = '';
    css += '.mdash-item-overlay-body { display: grid; grid-template-columns: repeat(12, minmax(' + gridLayout.colMin + 'px, 1fr)); gap: ' + gridLayout.gap + 'px; min-width: ' + gridLayout.minWidth + 'px; width: 100%; box-sizing: border-box; align-content: start; align-items: start; min-height: 0; }';
    css += '.mdash-item-overlay-cell { margin: 0; }';
    css += '.mdash-overlay-object-host { min-height: 48px; width: 100%; }';
    css += '.mdash-overlay-runtime-template { min-height: 48px; }';
    css += '.mdash-overlay-runtime-object-wrap { min-height: 48px; width: 100%; }';
    css += '@media (max-width: 767px) { .mdash-item-overlay-body { grid-template-columns: 1fr; } .mdash-item-overlay-cell { grid-column: 1 / -1 !important; } }';
    return css;
}

function ensureMdashOverlayRuntimeStyles() {
    $('#mdash-overlay-runtime-styles').remove();
    $('head').append('<style id="mdash-overlay-runtime-styles">' + getMdashOverlayRuntimeStylesCss() + '</style>');
}
window.ensureMdashOverlayRuntimeStyles = ensureMdashOverlayRuntimeStyles;

function buildMdashOverlayRuntimeCellHtml(hostId, gridStyle) {
    return ''
        + '<div class="mdash-item-overlay-cell" style="' + gridStyle + '">'
        + '  <div id="' + hostId + '" class="cont-item-object-rendered mdash-overlay-object-host"></div>'
        + '</div>';
}

function buildMdashOverlayRuntimePlaceHtml(placeHostId, gridStyle, template, place) {
    var cardHtml = '';
    if (template && typeof template.generateCard === 'function') {
        cardHtml = template.generateCard({
            title: (place && place.titulo) || '',
            id: placeHostId + '-card',
            tipo: 'primary',
            bodyContent: ''
        });
    } else if (template && template.sampleHtml) {
        cardHtml = template.sampleHtml;
    }
    return ''
        + '<div class="mdash-item-overlay-cell" style="' + gridStyle + '">'
        + '  <div class="mdash-overlay-runtime-place" id="' + placeHostId + '">' + cardHtml + '</div>'
        + '</div>';
}

function loadModernDashboardStyles() {
    var styles = "";
    var t = getMDashPanelTheme('light');
    var themeTokens = getMdashThemeTokens();
    var primaryColor = themeTokens.primary;
    var primaryRgb = themeTokens.primaryRgb;
    var gridLayout = getMdashEditorGridLayoutTokens();
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
    styles += buildMdashThemeVarsCss('.mdash-editor-wrapper');
    styles += buildMdashThemeVarsCss('#mdash-overlay-designer-modal');
    styles += ".mdash-editor-wrapper { display: flex; flex-direction: column; height: calc(100vh - 60px); background: radial-gradient(circle at 10% -10%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 34%), radial-gradient(circle at 110% 120%, rgba(var(--md-primary-rgb),0.12) 0%, transparent 32%), var(--md-bg); }";

    // ===== TOP TOOLBAR =====
    styles += ".mdash-top-toolbar { height: 54px; background: linear-gradient(120deg, rgba(var(--md-primary-rgb),0.96), #101828 88%); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(255,255,255,0.18); flex-shrink: 0; box-shadow: 0 8px 24px rgba(2,6,23,0.18); }";
    styles += ".mdash-top-toolbar-brand { color: #fff; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.2px; }";
    styles += ".mdash-top-toolbar-brand i { color: #fff; opacity: 0.95; }";
    styles += ".mdash-top-toolbar-actions { display: flex; align-items: center; gap: 8px; }";
    styles += ".mdash-preview-btn { background: #22c55e !important; border-color: #16a34a !important; color: #fff !important; font-weight: 600; }";
    styles += ".mdash-preview-btn:hover { background: #16a34a !important; border-color: #15803d !important; }";
    styles += ".mdash-preview-overlay { position: fixed; inset: 0; z-index: 99999; background: #000; display: flex; flex-direction: column; }";
    styles += ".mdash-preview-overlay-bar { background: #101828; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.12); }";
    styles += ".mdash-preview-overlay-bar span { font-size: 14px; font-weight: 600; opacity: 0.9; }";
    styles += ".mdash-preview-overlay-bar button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px; padding: 4px 14px; cursor: pointer; font-size: 14px; }";
    styles += ".mdash-preview-overlay-bar button:hover { background: rgba(255,255,255,0.2); }";
    styles += ".mdash-preview-overlay iframe { flex: 1; width: 100%; border: none; }";

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
    styles += ".mdash-sidebar-filter-handle { flex-shrink: 0; cursor: grab; }";
    styles += ".mdash-sidebar-filter.is-dragging .mdash-sidebar-filter-handle, .mdash-sidebar-filter.ui-sortable-helper .mdash-sidebar-filter-handle { cursor: grabbing; }";
    styles += ".mdash-sidebar-filter.is-dragging, .mdash-sidebar-filter.ui-sortable-helper { cursor: grabbing; opacity: .9; box-shadow: 0 8px 20px rgba(15,23,42,.12); z-index: 10; }";
    styles += ".mdash-sidebar-filter-placeholder { margin-bottom: 6px; border: 1px dashed rgba(var(--md-primary-rgb),0.35); border-radius: 8px; background: rgba(var(--md-primary-rgb),0.05); box-sizing: border-box; }";
    styles += ".mdash-sidebar-filter .mdash-sidebar-item-content { align-items: flex-start; min-width: 0; }";
    styles += ".mdash-sidebar-filter-main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }";
    styles += ".mdash-sidebar-filter-title { display: block; width: 100%; font-size: 13px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }";
    styles += ".mdash-sidebar-filter .mdash-sidebar-item-actions { flex-shrink: 0; margin-left: 6px; padding-top: 1px; }";
    styles += ".mdash-sidebar-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 6px; background: " + t.itemBg + "; border: 1px solid " + t.itemBorder + "; border-radius: 8px; cursor: pointer; transition: all 0.2s; }";
    styles += ".mdash-sidebar-item:hover { border-color: rgba(var(--md-primary-rgb),0.45); transform: translateX(2px); }";
    styles += ".mdash-sidebar-item-content { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 13px; color: " + t.textColor + "; }";
    styles += ".mdash-sidebar-item-content i { color: var(--md-primary); font-size: 12px; }";
    styles += ".mdash-sidebar-item-content .badge { margin-left: auto; background: var(--md-primary); font-size: 10px; }";
    styles += ".mdash-access-origin-badge { margin-right: 6px; background: rgba(var(--md-primary-rgb),0.12); color: var(--md-primary); border: 1px solid rgba(var(--md-primary-rgb),0.2); }";
    styles += ".mdash-phc-access-row.active, .mdash-phc-access-row.active:hover { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.16); background: rgba(var(--md-primary-rgb),0.04); }";
    styles += "#mdash-phc-access-create-modal .modal-content { min-height: calc(100vh - 40px); }";
    styles += "#mdash-phc-access-create-modal .modal-body { padding: 12px 16px; }";
    styles += "#mdash-phc-access-create-host { width: 100%; min-height: 78vh; }";
    styles += "#mdash-phc-access-create-host .cform-iframe-container, #mdash-phc-access-create-host iframe { width: 100%; min-height: 78vh; }";

    // -- Botão de eliminar unificado (substitui btn-danger para evitar interferência do PHC) --
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
    styles += ".mdash-canvas { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; border: 1px solid var(--md-border); background: var(--md-surface); box-shadow: 0 12px 28px rgba(2,6,23,0.08); }";
    styles += ".mdash-canvas-body { flex: 1; min-width: 0; overflow-x: hidden; overflow-y: auto; padding: 14px; background-image: radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px); background-size: 18px 18px; background-position: -8px -8px; }";
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
    styles += ".mdash-canvas-container { position: relative; width: 100%; max-width: 100%; min-width: 0; box-sizing: border-box; overflow: hidden; background: #ffffff; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 12px; padding: 12px; margin: 8px 0 14px; min-height: 0; transition: border-color 0.18s ease, box-shadow 0.18s ease; box-shadow: 0 6px 16px rgba(2,6,23,0.05); }";
    styles += ".mdash-canvas-container:hover { border-color: var(--md-primary); box-shadow: 0 10px 20px rgba(var(--md-primary-rgb),0.14); }";
    styles += ".mdash-canvas-container.is-selected { border-color: var(--md-primary); box-shadow: 0 0 0 3px rgba(var(--md-primary-rgb),0.18); }";
    styles += ".mdash-container-label { position: absolute; top: 8px; left: 12px; background: #fff; padding: 2px 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); border-radius: 20px; border: 1px solid rgba(var(--md-primary-rgb),0.42); z-index: 1; }";
    styles += ".mdash-canvas-container-header { padding: 22px 0 8px 0; display: flex; justify-content: space-between; align-items: center; gap: 6px; }";
    styles += ".mdash-container-drag-handle { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 6px; color: var(--md-primary); cursor: move; flex-shrink: 0; background: #fff; }";
    styles += ".mdash-container-drag-handle:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: var(--md-primary); }";
    styles += ".ui-sortable-helper.mdash-canvas-container { box-shadow: 0 16px 30px rgba(2,6,23,0.18); }";
    styles += ".mdash-canvas-container.is-dragging { transition: none !important; }";
    styles += ".mdash-canvas-container .mdash-container-drag-handle:active { cursor: grabbing; }";
    styles += ".mdash-canvas-container-body { padding: 4px 0 0 0; min-height: 0; min-width: 0; max-width: 100%; overflow-x: auto; overflow-y: visible; }";

    // Item no canvas
    styles += ".mdash-container-items-row { display: grid; grid-template-columns: repeat(12, minmax(" + gridLayout.colMin + "px, 1fr)); gap: " + gridLayout.gap + "px; min-width: " + gridLayout.minWidth + "px; width: 100%; box-sizing: border-box; position: relative; align-items: stretch; }";
    styles += ".mdash-container-items-row.is-empty { min-height: 92px; align-content: start; }";
    styles += ".mdash-container-items-row.is-drop-over { outline: 2px dashed rgba(var(--md-primary-rgb),0.62); outline-offset: 3px; border-radius: 10px; background: rgba(var(--md-primary-rgb),0.04); }";
    styles += ".mdash-canvas-item { margin-bottom: 0; display: flex; flex-direction: column; align-self: stretch; min-height: 0; }";
    styles += ".mdash-container-items-row > .mdash-canvas-item.mdash-item-compact { align-self: start; height: auto; }";
    styles += ".mdash-container-items-row > .mdash-canvas-item.mdash-item-compact > .mdash-canvas-item-card { height: auto; flex: 0 0 auto; }";
    styles += ".mdash-item-sort-placeholder { min-height: 96px; border: 2px dashed var(--md-primary); border-radius: 10px; background: rgba(var(--md-primary-rgb),0.10); box-sizing: border-box; }";
    styles += ".mdash-item-sort-placeholder.is-manual-preview { position: relative; border-color: rgba(var(--md-primary-rgb),0.95); background: rgba(var(--md-primary-rgb),0.14); z-index: 2; }";
    styles += ".mdash-item-sort-placeholder.is-manual-preview::after { content: attr(data-grid-label); position: absolute; top: 6px; right: 8px; font-size: 11px; font-weight: 700; color: var(--md-primary); background: rgba(255,255,255,0.92); border: 1px solid rgba(var(--md-primary-rgb),0.36); border-radius: 999px; padding: 2px 8px; }";

    // ? DRAG & DROP VISUAL FEEDBACK (posicionado na grid-row específica)
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
    styles += ".mdash-canvas-item-card { position: relative; background: #fff; border: 1px solid var(--md-border); border-radius: 10px; padding: 10px 12px; min-height: 96px; box-shadow: 0 2px 8px rgba(2,6,23,0.06); display: flex; flex-direction: column; flex: 1 1 auto; }";
    styles += ".mdash-container-items-row > .mdash-canvas-item:not(.mdash-layout-compact) > .mdash-canvas-item-card { height: 100%; }";
    styles += ".mdash-container-items-row > .mdash-canvas-item.mdash-layout-compact { align-self: start; height: auto; }";
    styles += ".mdash-container-items-row > .mdash-canvas-item.mdash-layout-compact > .mdash-canvas-item-card { height: auto; flex: 0 0 auto; }";
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
    styles += ".mdash-canvas-item-body { flex: 1 1 auto; min-height: 60px; display: flex; flex-direction: column; }";
    styles += ".mdash-container-items-row .mdash-canvas-item-body > *,";
    styles += ".mdash-container-items-row .mdash-canvas-item-body > [data-mdash-scope] { flex: 1 1 auto; height: 100%; min-height: 0; display: flex; flex-direction: column; margin: 0 !important; }";
    styles += ".mdash-container-items-row .mdash-canvas-item.mdash-item-compact .mdash-canvas-item-body > *,";
    styles += ".mdash-container-items-row .mdash-canvas-item.mdash-item-compact .mdash-canvas-item-body > [data-mdash-scope] { flex: 0 0 auto; height: auto !important; margin: 0 !important; }";
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
    styles += ".mdash-template-thumb-render { display: block; font-family: 'Inter',system-ui,sans-serif; width: 240px; height: 140px; transform: scale(0.26); transform-origin: top left; pointer-events: none; box-sizing: border-box; }";
    styles += ".mdash-template-thumb-render > [data-mdash-scope] { display: block; width: 100%; height: 100%; box-sizing: border-box; }";
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
    styles += ".mdash-slot-zone-drop.has-object { min-height: 0; padding: 0; border-style: solid; border-color: rgba(var(--md-primary-rgb),0.20); overflow: visible; }";
    styles += ".mdash-slot-zone-drop.drag-over { background: rgba(var(--md-primary-rgb),0.10); border-color: var(--md-primary); border-style: solid; }";
    styles += ".mdash-slot-zone-drop.is-selected { border-color: var(--md-primary); border-style: solid; box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.18); }";
    // Hint for empty slots
    styles += ".mdash-slot-zone-hint { display: flex; align-items: center; justify-content: center; gap: 4px; color: var(--md-muted); font-size: 10px; }";
    styles += ".mdash-slot-zone-hint i { font-size: 10px; opacity: 0.5; }";
    // Toolbar: absolute overlay — anchored left, grows to fit content (never clipped)
    styles += ".mdash-slot-zone-toolbar { position: absolute; top: 0; left: 0; width: max-content; min-width: 100%; z-index: 10; display: flex; align-items: center; gap: 3px; padding: 2px 4px; background: rgba(0,0,0,0.60); border-radius: 4px 4px 0 0; font-size: 11px; color: #fff; opacity: 0; pointer-events: none; transition: opacity 0.15s; box-sizing: border-box; flex-wrap: nowrap; white-space: nowrap; }";
    styles += ".mdash-slot-zone-drop:hover .mdash-slot-zone-toolbar { opacity: 1; pointer-events: auto; }";
    styles += ".mdash-slot-zone-toolbar .material-symbols-rounded { font-size: 11px; line-height: 1; color: #fff !important; }";
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
    styles += ".mdash-slot-zone-obj-block { position: relative; transition: background 0.15s; overflow: visible; }";
    styles += ".mdash-slot-zone-obj-block.is-compact-object .mdash-slot-zone-toolbar { min-width: 260px; width: max-content; max-width: none; }";
    styles += ".mdash-slot-zone-drop.has-object:hover .mdash-slot-zone-obj-block.is-compact-object { padding-top: 22px; }";
    styles += ".mdash-slot-zone-drop.has-object:hover { z-index: 12; }";
    // A toolbar usa box-sizing border-box; o span encolhe, os botões não
    styles += ".mdash-slot-zone-toolbar { box-sizing: border-box; }";
    // Render area — content rendered directly here, no min-height so slot fits content
    styles += ".mdash-slot-zone-render { width: 100%; cursor: pointer; overflow: hidden; }";
    styles += ".mdash-slot-zone-render.is-selected { outline: 2px solid var(--md-primary); outline-offset: -1px; }";
    styles += ".mdash-slot-zone-render-placeholder { padding: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--md-muted); font-size: 11px; font-style: italic; }";
    styles += ".mdash-slot-zone-render-placeholder i { color: var(--md-muted); font-size: 12px; }";
    styles += ".mdash-slot-zone-obj-block.is-custom-code-object .mdash-slot-zone-render { min-height: 34px; overflow: visible; }";
    styles += ".mdash-editor-wrapper .mdash-slot-zone-obj-block.is-custom-code-object { min-height: 36px; border-top: 1px dashed rgba(var(--md-primary-rgb),0.28); margin-top: 2px; }";
    styles += ".mdash-editor-wrapper .mdash-slot-zone-obj-block.is-custom-code-object .mdash-slot-zone-toolbar { opacity: 1; pointer-events: auto; }";
    styles += ".mdash-customcode-editor-shell { padding: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 34px; color: var(--md-muted); font-size: 11px; font-style: italic; text-align: center; }";
    styles += ".mdash-customcode-editor-shell i { font-size: 12px; opacity: 0.75; }";
    styles += ".mdash-editor-wrapper .mdash-slot-zone-drop.has-custom-code-slot { display: flex; flex-direction: column; overflow: visible !important; position: relative; z-index: 3; }";
    styles += ".mdash-editor-wrapper [data-mdash-slot].mdash-slot-has-custom-code { overflow: visible !important; height: auto !important; max-height: none !important; }";
    styles += ".mdash-editor-wrapper .mdash-canvas-item-body { overflow: visible; }";
    // Zona de objectos órfãos — mesma disposição dos slots normais, empilhados
    styles += ".mdash-slot-orphan-zone { margin-top: 6px; display: flex; flex-direction: column; gap: 6px; }";
    styles += ".mdash-slot-zone-orphan { position: relative; }";

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

    // -- Component header (transparent over gradient, like sidebar header) --
    styles += ".mdash-props-component-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.18); border-radius: 14px 14px 0 0; flex-shrink: 0; }";
    styles += ".mdash-props-component-info { display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; }";
    styles += ".mdash-props-component-icon { width: 28px; height: 28px; border-radius: 7px; background: rgba(255,255,255,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }";
    styles += ".mdash-props-component-icon i { font-size: 12px; color: #fff; }";
    styles += ".mdash-props-component-name { font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.95; }";
    styles += ".mdash-props-component-header .mdash-properties-toggle { background: none; border: none; color: rgba(255,255,255,0.55); font-size: 12px; padding: 4px; cursor: pointer; transition: color 0.2s; }";
    styles += ".mdash-props-component-header .mdash-properties-toggle:hover { color: #fff; }";

    // -- Legacy header (hidden when not collapsed) --
    styles += ".mdash-properties-header { display: none; }";
    styles += ".mdash-properties-rail-actions { display: none; flex-direction: column; gap: 6px; align-items: center; }";
    styles += ".mdash-properties-rail-actions .btn { width: 36px; height: 34px; padding: 0; border-radius: 8px; }";

    // -- Collapsed state --
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

    // -- Properties form fields (light theme) --
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

    // -- Field styling inside sections (light) --
    styles += ".mdash-prop-field { margin-bottom: 2px; }";
    styles += ".mdash-prop-field label { font-size: 11px; font-weight: 600; color: " + t.labelColor + "; margin-bottom: 3px; display: block; }";
    styles += ".mdash-prop-field input:not([type='checkbox']), .mdash-prop-field select { width: 100%; font-size: 12px; border-radius: 7px; border: 1px solid " + t.inputBorder + "; background: " + t.inputBg + "; color: " + t.inputColor + "; box-shadow: none; min-height: 32px; padding: 4px 10px; transition: border-color 0.2s, box-shadow 0.2s; }";
    styles += ".mdash-prop-field input:focus, .mdash-prop-field select:focus { border-color: var(--md-primary); box-shadow: 0 0 0 2px rgba(var(--md-primary-rgb),0.15); outline: none; background: " + t.inputBg + "; }";
    styles += ".mdash-prop-field-check { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; }";
    styles += ".mdash-prop-field-check input[type='checkbox'] { width: 16px; height: 16px; accent-color: var(--md-primary); cursor: pointer; flex-shrink: 0; }";
    styles += ".mdash-prop-field-check span { font-size: 12px; color: " + t.textColor + "; font-weight: 500; }";
    styles += ".mdash-prop-field .m-editor { border: 1px solid rgba(0,0,0,0.12); border-radius: 7px; overflow: hidden; }";

    // -- Empty state --
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

    // -- Scoped Bootstrap overrides: .form-control / label / btn-default inside the dark panel bodies
    styles += ".mdash-sidebar-body .form-control, .mdash-sidebar-body input:not([type='checkbox']), .mdash-sidebar-body select { background: " + t.inputBg + " !important; color: " + t.inputColor + " !important; border-color: " + t.inputBorder + " !important; }";
    styles += ".mdash-sidebar-body label { color: " + t.labelColor + " !important; }";
    styles += ".mdash-props-tab-content .form-control, .mdash-props-tab-content input:not([type='checkbox']), .mdash-props-tab-content select { background: " + t.inputBg + " !important; color: " + t.inputColor + " !important; border-color: " + t.inputBorder + " !important; }";
    styles += ".mdash-props-tab-content label { color: " + t.labelColor + " !important; }";
    styles += ".mdash-props-tab-content .btn-default { background: " + t.itemBg + " !important; border-color: " + t.inputBorder + " !important; color: " + t.textColor + " !important; }";
    styles += ".mdash-props-tab-content .btn-default:hover { background: rgba(255,255,255,0.12) !important; }";

    // ===== FONTES PANEL =====
    styles += "#mdash-fontes-panel, #mdash-overlay-fontes-panel { padding: 8px 0; }";

    // -- Add bar (compact header with scope label + circular add button) --
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

    // -- Fontes panel buttons --
    styles += "#mdash-fontes-panel .btn-primary, #mdash-overlay-fontes-panel .btn-primary { background: var(--md-primary); border-color: var(--md-primary); color: #fff; border-radius: 7px; font-size: 12px; font-weight: 600; }";
    styles += "#mdash-fontes-panel .btn-primary:hover, #mdash-overlay-fontes-panel .btn-primary:hover { filter: brightness(1.15); }";
    styles += "#mdash-fontes-panel > div, #mdash-overlay-fontes-panel > div { padding: 0 10px; }";

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

    // -- Parâmetros / Tokens (light theme) --
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

    // -- Actions panel (light theme) --
    styles += "#mdash-actions-panel { padding: 14px; }";
    styles += "#mdash-actions-panel .text-muted { color: rgba(0,0,0,0.38) !important; }";
    styles += "#mdash-actions-panel i { color: rgba(0,0,0,0.12); }";
    styles += ".mdash-item-actions-editor .form-group { margin-bottom: 10px; }";
    styles += ".mdash-item-actions-editor label { font-size: 11px; font-weight: 600; color: #475569; }";
    styles += ".mdash-item-has-overlay { cursor: pointer; }";
    styles += ".mdash-item-has-overlay .mdash-card:hover, .mdash-item-has-overlay [data-mdash-scope]:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.12); }";
    styles += ".mdash-item-interactive { position: relative; }";
    styles += "#mdash-overlay-designer-modal .modal-body { background: var(--md-bg, #f3f6fb); padding: 0; overflow: hidden; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-designer-shell { height: calc(100vh - 120px); min-height: 480px; max-height: none; flex: 1; }";
    styles += "#mdash-overlay-designer-modal .mdash-sidebar-body .mdash-section-label { color: var(--md-primary); }";
    styles += "#mdash-overlay-designer-modal .mdash-sidebar-body .mdash-obj-category-label { color: #64748b; }";
    styles += "#mdash-overlay-designer-modal .mdash-sidebar-body .mdash-obj-tile-name { color: #1f2937; }";
    styles += "#mdash-overlay-designer-modal .mdash-sidebar-body .mdash-obj-tile-desc { color: #64748b; }";
    styles += "#mdash-overlay-designer-modal #mdash-overlay-paste-btn.disabled, #mdash-overlay-designer-modal #mdash-overlay-paste-btn:disabled { opacity: 0.45; cursor: not-allowed; }";
    styles += "#mdash-overlay-designer-modal .mdash-canvas-body { flex: 1; overflow: auto; padding: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-designer-canvas { padding: 12px 14px 20px; min-height: 360px; max-width: 100%; overflow-x: auto; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-objects-row { min-height: 280px; align-content: start; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-objects-row.drag-over { outline: 2px dashed rgba(var(--md-primary-rgb),0.45); outline-offset: 4px; border-radius: 10px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place { margin-bottom: 0; min-width: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-canvas-item-card { overflow: hidden; display: flex; flex-direction: column; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-canvas-item-header { flex-shrink: 0; position: relative; z-index: 3; background: #fff; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-item-header-top { display: flex; align-items: center; gap: 8px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-item-header-bottom { display: flex; align-items: center; gap: 8px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-overlay-item-drag-handle { flex-shrink: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-item-title-wrapper { flex: 1; min-width: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-item-header-actions { flex-shrink: 0; margin-left: auto; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-canvas-item-body { flex: 1 1 auto; min-height: 80px; overflow: hidden; position: relative; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place .mdash-overlay-place-template { height: 100%; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-place.is-selected .mdash-canvas-item-card { outline: 2px solid var(--md-primary); outline-offset: 1px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object { margin-bottom: 0; min-width: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-canvas-item-card { overflow: hidden; display: flex; flex-direction: column; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-canvas-item-header { flex-shrink: 0; position: relative; z-index: 3; background: #fff; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-item-header-top { display: flex; align-items: center; gap: 8px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-item-drag-handle { width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed rgba(var(--md-primary-rgb),0.45); border-radius: 6px; color: var(--md-primary); cursor: move; flex-shrink: 0; background: #fff; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-item-drag-handle:hover { background: rgba(var(--md-primary-rgb),0.08); border-color: var(--md-primary); }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-item-title-wrapper { flex: 1; min-width: 0; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-item-header-actions { flex-shrink: 0; margin-left: auto; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object .mdash-canvas-item-body { flex: 1 1 auto; min-height: 80px; overflow: hidden; position: relative; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-object-preview { min-height: 72px; max-height: 420px; overflow: auto; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-canvas-object.is-selected .mdash-canvas-item-card { outline: 2px solid var(--md-primary); outline-offset: 1px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-template-canvas { background: #fff; border: 1px dashed rgba(15,23,42,0.12); border-radius: 12px; padding: 10px; margin: 12px 14px; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-designer-empty { border: 2px dashed rgba(15,23,42,0.12); border-radius: 10px; padding: 48px 16px; text-align: center; color: #64748b; font-size: 13px; background: #fff; }";
    styles += "#mdash-overlay-designer-modal .mdash-overlay-designer-empty--inline { grid-column: 1 / -1; margin: 8px 0; }";
    styles += "#mdash-overlay-designer-modal #mdash-overlay-props-panel .mdash-prop-section, #mdash-overlay-designer-modal #mdash-overlay-fontes-panel .mdash-fonte-list { font-size: 12px; }";
    styles += getMdashOverlayRuntimeStylesCss();

    styles += "@media (max-width: 1440px) { .mdash-sidebar { width: 228px; min-width: 228px; } .mdash-properties { width: 280px; min-width: 280px; } .mdash-modern-layout { gap: 6px; padding: 6px; } }";

    // ===== MODALS (apenas modais do editor MDash — não afectar modais nativas PHC) =====
    styles += ".modal:not(.mdash-item-overlay-modal):not(.mdash-detail-modal):not(#mdash-overlay-designer-modal) .modal-header { background: linear-gradient(120deg, var(--md-primary), #0f172a); color: white; }";
    styles += ".modal:not(.mdash-item-overlay-modal):not(.mdash-detail-modal):not(#mdash-overlay-designer-modal) .modal-header .close { color: white; opacity: 0.8; }";
    styles += ".modal:not(.mdash-item-overlay-modal):not(.mdash-detail-modal):not(#mdash-overlay-designer-modal) .modal-header .close:hover { opacity: 1; }";
    styles += ".modal:not(.mdash-item-overlay-modal):not(.mdash-detail-modal):not(#mdash-overlay-designer-modal) .modal-header .modal-title { margin: 0; color: " + primaryColor + " !important; }";
    styles += ".modal:not(.mdash-item-overlay-modal):not(.mdash-detail-modal):not(#mdash-overlay-designer-modal) .modal-header .modal-title i { color: " + primaryColor + " !important; }";

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
    styles += ".mdash-multi-selected::after { content: '?'; position: absolute; top: 4px; right: 8px; background: var(--md-primary); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 20; box-shadow: 0 2px 6px rgba(0,0,0,0.2); pointer-events: none; }";
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
    // Paste button in slot toolbar — hidden by default, appears only when clipboard has an object
    styles += ".mdash-slot-zone-obj-paste { display:none; align-items:center; gap:3px; background:rgba(16,185,129,0.25); color:#fff !important; border:none; border-radius:3px; padding:2px 6px; font-size:10px; cursor:pointer; transition:background 0.15s, box-shadow 0.15s, transform 0.15s; line-height:1.4; flex-shrink:0; }";
    styles += "body.mdash-has-object-clipboard .mdash-slot-zone-obj-paste { display:inline-flex; }";
    styles += ".mdash-slot-zone-obj-paste:hover { background:rgba(16,185,129,0.55); box-shadow:0 0 0 2px rgba(16,185,129,0.35); transform:scale(1.06); }";

    // ===== DASHBOARD TABS (Browser-like, enterprise) =====
    styles += ".mdash-tabs-toggle { display:inline-flex; align-items:center; gap:7px; margin-right:8px; font-size:11px; font-weight:700; color:#475569; background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:999px; padding:4px 10px; }";
    styles += ".mdash-tabs-toggle input[type='checkbox'] { accent-color: var(--md-primary); margin:0; }";
    styles += ".mdash-tabs-layout-controls { display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; }";
    styles += ".mdash-tabs-layout-field { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#475569; background:#fff; border:1px solid rgba(0,0,0,0.1); border-radius:999px; padding:4px 8px; }";
    styles += ".mdash-tabs-layout-field span { white-space:nowrap; }";
    styles += ".mdash-tabs-layout-select, .mdash-tabs-layout-input { height:24px; border:1px solid rgba(15,23,42,0.12); background:#fff; color:#0f172a; border-radius:999px; padding:0 8px; font-size:11px; outline:none; }";
    styles += ".mdash-tabs-layout-select { min-width:112px; }";
    styles += ".mdash-tabs-layout-input { width:58px; text-align:center; }";
    // -- Dashboard tabs bar (Chrome-style) ---------------------
    // CSS central consumido também pelo viewer final.
    styles += getMdashDashboardTabsSharedStyles();
    var editorTabSize = getMdashDashboardTabEditorSizeTokens();
    styles += ".mdash-editor-wrapper .mdash-dashboard-tabs-wrap { margin:14px 0 0; }";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tabs{--md-tab-basis:" + editorTabSize.basis + ";--md-tab-min:" + editorTabSize.min + ";--md-tab-max:" + editorTabSize.max + "}";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tab { cursor:default; padding:5px 92px 5px 6px; overflow:visible; max-width:none; }";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tab-title { min-width:56px; flex:1 1 auto; padding-right:0 !important; font-size:11px; }";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tab-close, .mdash-editor-wrapper .mdash-dashboard-tab-settings, .mdash-editor-wrapper .mdash-dashboard-tab-duplicate { opacity:.72; pointer-events:auto; }";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tab-placeholder { height:auto; }";
    styles += ".mdash-dashboard-tab-handle { flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; cursor:grab; color:#94a3b8; opacity:.85; margin-right:2px; user-select:none; touch-action:none; }";
    styles += ".mdash-dashboard-tab-handle i { font-size:11px; pointer-events:none; color:inherit; }";
    styles += ".mdash-dashboard-tab-handle:hover { opacity:1; color:var(--md-primary,#2563eb); }";
    styles += ".mdash-dashboard-tab.is-dragging .mdash-dashboard-tab-handle { cursor:grabbing; }";
    styles += ".mdash-dashboard-tab-title:focus, .mdash-dashboard-tab-title:active, .mdash-dashboard-tab-title:hover { outline:none !important; box-shadow:none !important; background:transparent !important; border:none !important; }";
    styles += ".mdash-dashboard-tab-title::placeholder { color:currentColor; opacity:.45; font-weight:500; }";
    // Action buttons — hidden by default; on hover/active they appear over a fade gradient anchored to the right edge.
    styles += ".mdash-dashboard-tab-close, .mdash-dashboard-tab-settings, .mdash-dashboard-tab-duplicate { position:absolute; top:50%; transform:translateY(-50%); width:18px; height:18px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:8px; color:#64748b; opacity:0; pointer-events:none; transition:opacity .14s,background .14s,transform .14s,color .14s; cursor:pointer; z-index:6; }";
    styles += ".mdash-dashboard-tab-close { right:6px; }";
    styles += ".mdash-dashboard-tab-settings { right:30px; }";
    styles += ".mdash-dashboard-tab-duplicate { right:60px; }";
    styles += ".mdash-dashboard-tab-duplicate::after { content:''; position:absolute; right:-7px; top:3px; bottom:3px; width:1px; background:rgba(15,23,42,.10); pointer-events:none; }";
    // Reveal actions on hover/active; the title gets right padding so text doesn't sit under the icons
    styles += ".mdash-dashboard-tab:hover .mdash-dashboard-tab-close, .mdash-dashboard-tab.is-active .mdash-dashboard-tab-close, .mdash-dashboard-tab:hover .mdash-dashboard-tab-settings, .mdash-dashboard-tab.is-active .mdash-dashboard-tab-settings, .mdash-dashboard-tab:hover .mdash-dashboard-tab-duplicate, .mdash-dashboard-tab.is-active .mdash-dashboard-tab-duplicate { opacity:.7; pointer-events:auto; }";
    styles += ".mdash-dashboard-tab:hover .mdash-dashboard-tab-title, .mdash-dashboard-tab.is-active .mdash-dashboard-tab-title { padding-right:72px; }";
    styles += ".mdash-editor-wrapper .mdash-dashboard-tab:hover .mdash-dashboard-tab-title, .mdash-editor-wrapper .mdash-dashboard-tab.is-active .mdash-dashboard-tab-title { padding-right:0; }";
    styles += ".mdash-dashboard-tab-close:hover { opacity:1 !important; background:rgba(220,38,38,.15); color:#dc2626; transform:translateY(-50%) scale(1.15); }";
    styles += ".mdash-dashboard-tab-settings:hover { opacity:1 !important; background:rgba(16,185,129,.15); color:#059669; transform:translateY(-50%) scale(1.15); }";
    styles += ".mdash-dashboard-tab-duplicate:hover { opacity:1 !important; background:rgba(37,99,235,.15); color:#2563eb; transform:translateY(-50%) scale(1.15); }";
    // + add tab button
    styles += ".mdash-dashboard-tab-add { flex:0 0 auto; min-width:26px; width:26px; height:26px; display:inline-flex; align-items:center; justify-content:center; margin-left:5px; margin-bottom:3px; background:#ffffff; color:#94a3b8; border:1px solid rgba(15,23,42,0.08); border-radius:8px; cursor:pointer; transition:color .15s,transform .15s,border-color .15s,box-shadow .15s; align-self:flex-end; }";
    styles += ".mdash-dashboard-tab-add:hover { background:#ffffff; color:var(--md-primary); border-color:rgba(var(--md-primary-rgb),.28); box-shadow:0 5px 14px rgba(15,23,42,.07); transform:translateY(-1px); }";
    styles += ".mdash-dashboard-tab-add i { font-size:12px; }";
    // Inline drag placeholder (barra de tabs; overlay em wrap evita reflow)
    styles += ".mdash-dashboard-tab-placeholder { flex:0 0 auto !important; min-width:0 !important; max-width:none !important; background:rgba(var(--md-primary-rgb),.07); border:1px dashed rgba(var(--md-primary-rgb),.32); border-radius:8px; box-sizing:border-box; visibility:visible !important; margin:0; }";
    styles += ".mdash-dashboard-tab.is-dragging, .mdash-pointer-drag-helper { opacity:.94; }";
    styles += ".mdash-pointer-drag-helper { list-style:none; }";
    // Auto-contrast swatch (checker pattern)
    styles += ".mdash-phc-color-auto { background:linear-gradient(135deg, #fff 50%, #0f172a 50%) !important; display:inline-flex; align-items:center; justify-content:center; color:transparent; }";
    styles += ".mdash-phc-color-auto i { color:rgba(15,23,42,.65); font-size:10px; mix-blend-mode:difference; }";
    // Font family select inside the tab editor
    styles += ".mdash-tab-editor-font { width:100%; padding:5px 8px; border:1px solid rgba(15,23,42,.14); border-radius:6px; background:#fff; color:#1f2937; font-size:12px; cursor:pointer; outline:none; transition:border-color .15s, box-shadow .15s; }";
    styles += ".mdash-tab-editor-font:focus { border-color:var(--md-primary); box-shadow:0 0 0 2px rgba(var(--md-primary-rgb),.15); }";
    styles += ".mdash-tab-editor-toggle { display:flex; align-items:center; justify-content:space-between; gap:16px; margin:0; color:#334155; font-size:12px; font-weight:600; cursor:pointer; }";
    styles += ".mdash-tab-editor-toggle input { width:16px; height:16px; margin:0; accent-color:var(--md-primary); cursor:pointer; }";

    // Tab editor popover (icon + color)
    styles += ".mdash-tab-editor-popover { position:fixed; z-index:9999; box-sizing:border-box; width:290px; max-width:calc(100vw - 20px); max-height:calc(100vh - 20px); max-height:calc(100dvh - 20px); background:#fff; border:1px solid rgba(15,23,42,0.12); border-radius:10px; box-shadow:0 12px 32px rgba(15,23,42,0.18); padding:10px 12px; overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent; }";
    styles += ".mdash-tab-editor-popover::-webkit-scrollbar{width:6px}.mdash-tab-editor-popover::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:8px}.mdash-tab-editor-popover::-webkit-scrollbar-track{background:transparent}";
    styles += ".mdash-tab-editor-section + .mdash-tab-editor-section { margin-top:10px; padding-top:10px; border-top:1px solid rgba(15,23,42,0.06); }";
    styles += ".mdash-tab-editor-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#64748b; margin-bottom:6px; }";
    styles += ".mdash-tab-editor-colors { display:grid; grid-template-columns:repeat(7, 24px); gap:6px; align-items:center; }";
    styles += ".mdash-phc-color-custom { position:relative; width:22px; height:22px; border-radius:50%; border:2px solid #fff; padding:0; margin:0; cursor:pointer; box-shadow:0 0 0 1px rgba(15,23,42,0.15); display:inline-flex; align-items:center; justify-content:center; overflow:hidden; }";
    styles += ".mdash-phc-color-custom:hover { transform:scale(1.15); }";
    styles += ".mdash-phc-color-custom.is-active { box-shadow:0 0 0 2px var(--md-primary,#7c3aed), 0 2px 6px rgba(0,0,0,0.25); }";
    styles += ".mdash-phc-color-custom i { color:#fff; font-size:10px; text-shadow:0 1px 1px rgba(0,0,0,0.35); pointer-events:none; }";
    styles += ".mdash-phc-color-custom input[type=color] { position:absolute; inset:0; width:100%; height:100%; opacity:0; border:none; padding:0; cursor:pointer; }";
    styles += ".mdash-tab-editor-icons { display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; max-height:140px; overflow-y:auto; }";
    styles += ".mdash-tab-editor-icon { width:30px; height:30px; padding:0; border:1px solid rgba(15,23,42,0.1); border-radius:6px; background:#fff; color:#475569; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; transition:all 0.12s; }";
    styles += ".mdash-tab-editor-icon:hover { border-color:var(--md-primary); color:var(--md-primary); background:rgba(var(--md-primary-rgb),0.06); }";
    styles += ".mdash-tab-editor-icon.is-active { background:var(--md-primary); color:#fff; border-color:var(--md-primary); }";
    styles += ".mdash-tab-editor-icon i { font-size:13px; }";
    styles += "@media (max-height:720px),(max-width:700px){.mdash-tab-editor-popover{width:270px;padding:8px 10px}.mdash-tab-editor-section+.mdash-tab-editor-section{margin-top:7px;padding-top:7px}.mdash-tab-editor-title{margin-bottom:4px}.mdash-tab-editor-colors{grid-template-columns:repeat(7,22px);gap:5px}.mdash-phc-color-option,.mdash-phc-color-custom{width:20px!important;height:20px!important}.mdash-tab-editor-icons{max-height:96px}.mdash-tab-editor-icon{width:27px;height:27px}.mdash-tab-editor-font{padding:4px 7px}}";

    // Sidebar tab entry
    styles += ".mdash-sidebar-tab-handle { flex-shrink:0; cursor:grab; color:#94a3b8 !important; font-size:12px; opacity:.9; user-select:none; touch-action:none; }";
    styles += ".mdash-sidebar-tab-handle:hover { color:#64748b; opacity:1; }";
    styles += ".mdash-sidebar-tab.is-dragging, .mdash-pointer-drag-helper { opacity:.94; }";
    styles += ".mdash-sidebar-tab.is-dragging .mdash-sidebar-tab-handle { cursor:grabbing; }";
    styles += ".mdash-sidebar-tab-placeholder { margin-bottom:6px; border:1px dashed rgba(var(--md-primary-rgb),0.35); border-radius:8px; background:rgba(var(--md-primary-rgb),0.05); box-sizing:border-box; }";
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
    styles += ".mdash-phc-color-option.is-active { box-shadow:0 0 0 2px var(--md-primary,#7c3aed), 0 2px 6px rgba(0,0,0,0.25); }";

    // ===== SOURCE PICKER (fonte de cor: tema / classe / personalizada) =====
    styles += ".mdash-layout-source-picker { border:1px solid rgba(15,23,42,0.1); border-radius:10px; padding:8px 10px; background:#fff; }";
    styles += ".mdash-src-group-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--md-muted,#64748b); margin:2px 0 5px; }";
    styles += ".mdash-src-group-title + .mdash-src-group-title, .mdash-src-swatches + .mdash-src-group-title, .mdash-src-chips + .mdash-src-group-title { margin-top:10px; }";
    styles += ".mdash-src-swatches { display:flex; flex-wrap:wrap; gap:7px; align-items:center; }";
    styles += ".mdash-src-chips { display:flex; flex-wrap:wrap; gap:6px; }";
    styles += ".mdash-src-class-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 10px 4px 7px; border:1px solid rgba(15,23,42,0.12); border-radius:999px; background:#f8fafc; cursor:pointer; font-size:11px; font-weight:600; color:#334155; transition:all 0.12s; }";
    styles += ".mdash-src-class-chip:hover { border-color:var(--md-primary,#2563eb); color:var(--md-primary,#2563eb); background:rgba(var(--md-primary-rgb,37,99,235),0.06); }";
    styles += ".mdash-src-class-chip.is-active { border-color:var(--md-primary,#2563eb); background:var(--md-primary,#2563eb); color:#fff; box-shadow:0 2px 8px rgba(var(--md-primary-rgb,37,99,235),0.30); }";
    styles += ".mdash-src-chip-dot { width:12px; height:12px; border-radius:50%; background:rgba(15,23,42,0.18); box-shadow:0 0 0 1px rgba(15,23,42,0.12) inset; flex:0 0 auto; }";
    styles += ".mdash-src-class-chip.is-active .mdash-src-chip-dot { box-shadow:0 0 0 1px rgba(255,255,255,0.6) inset; }";

    // ===== ICON PICKER (propriedades de layout) =====
    styles += ".mdash-layout-icon-picker { border:1px solid rgba(15,23,42,0.1); border-radius:10px; padding:8px; background:#fff; }";
    styles += ".mdash-layout-icon-search { display:flex; align-items:center; gap:6px; padding:4px 8px; border:1px solid rgba(15,23,42,0.12); border-radius:8px; margin-bottom:8px; background:#f8fafc; }";
    styles += ".mdash-layout-icon-search > span { font-size:16px; color:var(--md-muted,#64748b); }";
    styles += ".mdash-layout-icon-filter { border:none; outline:none; background:transparent; font-size:12px; width:100%; color:#1f2937; }";
    styles += ".mdash-layout-icon-cats { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }";
    styles += ".mdash-layout-icon-cat { font-size:11px; font-weight:600; padding:3px 10px; border:1px solid rgba(15,23,42,0.12); border-radius:999px; background:#f8fafc; color:#475569; cursor:pointer; transition:all 0.12s; }";
    styles += ".mdash-layout-icon-cat:hover { border-color:var(--md-primary,#2563eb); color:var(--md-primary,#2563eb); }";
    styles += ".mdash-layout-icon-cat.is-active { border-color:var(--md-primary,#2563eb); background:var(--md-primary,#2563eb); color:#fff; box-shadow:0 2px 6px rgba(var(--md-primary-rgb,37,99,235),0.30); }";
    styles += ".mdash-layout-icon-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(34px, 1fr)); gap:4px; max-height:150px; overflow-y:auto; padding:2px; }";
    styles += ".mdash-layout-icon-btn { width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(15,23,42,0.08); border-radius:8px; background:#fff; cursor:pointer; color:#475569; padding:0; transition:all 0.12s; }";
    styles += ".mdash-layout-icon-btn > span, .mdash-layout-icon-btn > i { font-size:20px; line-height:1; }";
    styles += ".mdash-layout-icon-btn:hover { border-color:var(--md-primary,#2563eb); color:var(--md-primary,#2563eb); background:rgba(var(--md-primary-rgb,37,99,235),0.06); transform:translateY(-1px); }";
    styles += ".mdash-layout-icon-btn.is-active { border-color:var(--md-primary,#2563eb); background:var(--md-primary,#2563eb); color:#fff; box-shadow:0 2px 8px rgba(var(--md-primary-rgb,37,99,235),0.35); }";
    styles += ".mdash-layout-icon-current { display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:8px; padding-top:8px; border-top:1px solid rgba(15,23,42,0.08); font-size:11px; color:var(--md-muted,#64748b); min-width:0; }";
    styles += ".mdash-layout-icon-current .mdash-layout-icon-preview { font-size:20px; color:var(--md-primary,#2563eb); flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; }";
    styles += ".mdash-layout-icon-current .mdash-layout-icon-preview > i, .mdash-layout-icon-current .mdash-layout-icon-preview > span { font-size:20px; line-height:1; }";
    styles += ".mdash-layout-icon-current code.mdash-layout-icon-name { font-size:11px; background:rgba(15,23,42,0.05); padding:1px 6px; border-radius:4px; color:#334155; word-break:break-all; overflow-wrap:anywhere; flex:1; min-width:0; }";

    styles += ".mdash-filter-scope-badge { display: inline-block; max-width: 100%; padding: 2px 7px; border-radius: 999px; font-size: 9px; font-weight: 700; line-height: 1.35; background: rgba(var(--md-primary-rgb),0.12); color: var(--md-primary); white-space: normal; word-break: break-word; box-sizing: border-box; }";

    // ===== ERROR DISPLAY =====
    styles += ".mdash-error-container { padding: 20px; background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); border: 2px solid #f56565; border-radius: 8px; text-align: center; box-shadow: 0 4px 12px rgba(245, 101, 101, 0.15); }";
    styles += ".mdash-error-container i { color: #f56565; font-size: 32px; margin-bottom: 12px; }";
    styles += ".mdash-error-container h4 { color: #c53030; margin: 10px 0; font-weight: 600; font-size: 15px; }";
    styles += ".mdash-error-container p { color: #742a2a; margin: 10px 0; font-size: 13px; line-height: 1.4; }";
    styles += ".mdash-error-container .btn-danger { background: #f56565 !important; border-color: #e53e3e !important; color: #fff !important; margin-top: 10px; }";
    styles += ".mdash-error-container .btn-danger:hover { background: #e53e3e !important; border-color: #c53030 !important; }";

    // ===== SLOT ERROR STATE - ENTERPRISE (preenche o slot, nunca sobrepõe) =====
    styles += ".mdash-slot-error-state { box-sizing: border-box; width: 100%; height: 100%; min-height: 90px; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 14px; padding: 16px 20px; cursor: pointer; background: linear-gradient(135deg, #fdf3f3 0%, #fbeaea 100%); border: 1px solid #f1c6c6; border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none; -webkit-user-select: none; text-align: left; }";
    styles += ".mdash-slot-error-state:hover { border-color: #e09a9a; box-shadow: 0 4px 16px rgba(220, 53, 69, 0.12); transform: translateY(-1px); }";
    styles += ".mdash-slot-error-state:active { transform: translateY(0); }";

    styles += ".mdash-slot-error-icon { position: relative; flex: 0 0 auto; width: 44px; height: 44px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.28); }";
    styles += ".mdash-slot-error-icon > i { color: #fff; font-size: 20px; line-height: 1; }";
    styles += ".mdash-slot-error-count { position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; padding: 0 5px; box-sizing: border-box; background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: #1a1a1a; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; border: 2.5px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); font-family: 'Courier New', monospace; }";

    styles += ".mdash-slot-error-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }";
    styles += ".mdash-slot-error-title { color: #b02a37; font-size: 14px; font-weight: 700; line-height: 1.2; }";
    styles += ".mdash-slot-error-sub { color: #8a5a5a; font-size: 12px; font-weight: 500; line-height: 1.2; }";

    // ===== TECHNICAL ERROR MODAL (Developers Only) =====
    styles += ".mdash-modal-technical-errors { }";
    styles += ".mdash-tech-error-item { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-bottom: 10px; font-family: 'Courier New', monospace; font-size: 12px; }";
    styles += ".mdash-tech-error-type { background: #dc3545; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; display: inline-block; margin-bottom: 6px; }";
    styles += ".mdash-tech-error-content { }";
    styles += ".mdash-tech-error-content strong { display: block; color: #212529; margin-bottom: 4px; font-size: 13px; }";
    styles += ".mdash-tech-error-message { background: #fff; border: 1px solid #dee2e6; padding: 8px; border-radius: 3px; margin: 0; color: #dc3545; overflow-x: auto; max-height: 200px; font-size: 11px; line-height: 1.4; }";

    // ===== SOURCE ERROR BADGE =====
    styles += ".mdash-source-error-badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; box-shadow: 0 3px 8px rgba(255, 152, 0, 0.25); transition: all 0.2s ease; z-index: 10; }";
    styles += ".mdash-source-error-badge:hover { transform: translateY(-2px); box-shadow: 0 5px 12px rgba(255, 152, 0, 0.35); background: linear-gradient(135deg, #ffb300 0%, #ff8c00 100%); }";
    styles += ".mdash-source-error-badge i { font-size: 14px; }";
    styles += ".mdash-source-error-badge .badge-text { display: none; }";
    styles += "@media (min-width: 768px) { .mdash-source-error-badge .badge-text { display: inline; } }";

    $('<style id="mdash-modern-styles" data-mdash-style-version="' + styleVersion + '">').text(styles).appendTo('head');

    // Reaplica após o ciclo atual para ganhar prioridade caso outro script injete CSS depois.
    setTimeout(function () {
        $('#mdash-modern-styles').appendTo('head');
    }, 0);
}

// ============================================================================
// INICIALIZAÇÃO AUTOMÁTICA DE ESTILOS
// ============================================================================



/**
 * Devolve o tema ACE a usar nos editores de expressão.
 * 'dark'  ? ace/theme/monokai
 * 'light' ? ace/theme/chrome
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

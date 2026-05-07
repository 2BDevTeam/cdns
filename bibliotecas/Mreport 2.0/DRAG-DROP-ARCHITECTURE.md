# Drag-Drop Architecture — Mreport 2.0

> Inspirado em [bibliotecas/Mdash 2.0/DRAG-DROP-ARCHITECTURE.md](../Mdash%202.0/DRAG-DROP-ARCHITECTURE.md).
> Adaptado às particularidades do report designer (3+ secções, posicionamento absoluto + grid).

---

## 1. Camadas

```
┌──────────────────────────────────────────────────────────┐
│ MReportRenderer.initDragDrop()                            │
│  - liga interact.js a .report-object e a slots            │
│  - delega VALIDATION ao DragDropValidator                 │
│  - delega APPLY ao MReportLib.updateObjectPosition()      │
└────────────┬─────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────┐
│ MReportDragDropValidator                                  │
│   .validateDrop(obj, target)  → { isValid, message, hint }│
│   .canFitInGrid(obj, row, col, span)                      │
│   .calculateAutoAdjust(obj, target)                       │
└────────────┬─────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────┐
│ window.appState.objects (single source of truth)          │
│  →  MReportDataLayer.syncReal(obj)  (debounced 300ms)    │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Tipos de target válidos

Um objecto pode ser largado em:

| Target | Selector | Resultado |
|---|---|---|
| Secção (modo absoluto) | `.report-section[data-section] .section-content` | `x/y/width/height` actualizados |
| Slot de layout | `[data-mreport-slot="..."]` | `slotid` + `mreportsectionstamp` actualizados |
| Célula de grid | `.report-grid-cell[data-row][data-col]` | `gridrow/gridcolstart/gridcolspan` actualizados |
| Sidebar de componentes (clone) | `.component-library [data-tipo]` | cria novo `MReportObject` no destino |

---

## 3. Pipeline de drop

```
dragstart   → guardar snapshot (rollback se falhar)
dragmove    → atualizar transform CSS apenas (DOM-only, sem AJAX)
dragend     → 1) detectar target via document.elementsFromPoint
              2) DragDropValidator.validateDrop(obj, target)
              3) se inválido: rollback + alertify.error(msg)
              4) se válido: aplicar mudanças em appState
              5) MReportRenderer.rerenderObject(obj)
              6) MReportDataLayer.syncReal(obj)  (debounce 300ms)
```

---

## 4. Validação

```js
MReportDragDropValidator.validateDrop = function (obj, target) {

    // 1. Target existe?
    if (!target) return { isValid: false, message: "Sem destino válido" };

    // 2. Limites da secção (modo absoluto)
    if (target.type === "section-absolute") {
        var rect  = target.el.getBoundingClientRect();
        var fitsX = (obj.x + obj.width)  <= (rect.width  - PADDING);
        var fitsY = (obj.y + obj.height) <= (rect.height - PADDING);
        if (!fitsX || !fitsY) {
            return { isValid: false, message: "Não cabe na secção" };
        }
    }

    // 3. Slot ocupado?
    if (target.type === "slot") {
        var occupied = appState.objects.some(o =>
            o.slotid === target.slotid &&
            o.mreportsectionstamp === target.sectionStamp &&
            o.mreportobjectstamp !== obj.mreportobjectstamp
        );
        if (occupied) {
            return { isValid: false, message: "Slot ocupado", hint: "swap" };
        }
    }

    // 4. Grid: colisão de spans
    if (target.type === "grid-cell") {
        if (!this.canFitInGrid(obj, target.row, target.col, obj.gridcolspan)) {
            var adj = this.calculateAutoAdjust(obj, target);
            return adj
                ? { isValid: true, autoAdjust: adj }
                : { isValid: false, message: "Sem espaço no grid" };
        }
    }

    return { isValid: true };
};
```

---

## 5. Snap (interact.js)

```js
interact('.report-object').draggable({
    modifiers: [
        interact.modifiers.snap({
            targets: [interact.snappers.grid({ x: 10, y: 10 })],
            range: Infinity,
            relativePoints: [{ x: 0, y: 0 }]
        }),
        interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: false
        })
    ],
    autoScroll: true,
    listeners: {
        start: onDragStart,
        move:  onDragMove,
        end:   onDragEnd
    }
})
```

---

## 6. Multi-drag (várias selecções de uma vez)

Quando `appState.multiSelection.stamps.length > 1`:

1. `dragstart` no objecto-âncora — calcular `delta = (currentX - originalX)` para todos os outros.
2. `dragmove` — aplicar mesmo delta a todos os elementos seleccionados.
3. `dragend` — validar **cada um** separadamente; se algum falhar, **rollback de todos** (atomic).
4. `syncReal` envia o array completo.

---

## 7. Resize

```js
interact('.report-object').resizable({
    edges: { left: false, right: true, bottom: true, top: false },
    modifiers: [
        interact.modifiers.snapSize({
            targets: [interact.snappers.grid({ width: 10, height: 10 })]
        }),
        interact.modifiers.restrictSize({
            min: { width: 50, height: 30 }
        })
    ],
    listeners: { move: onResizeMove, end: onResizeEnd }
})
```

`onResizeEnd` chama `validateDrop` (mesma função, com novas dimensões) — **se invalidar, rollback**.

---

## 8. Falhas conhecidas a evitar (vindas do v1)

| Problema | Mitigação 2.0 |
|---|---|
| Posição persistida no DOM mas falhou AJAX → desincroniza | `syncReal` com retry exponencial + flag `obj._dirty` em `appState` |
| Drag por engano em modo "consultar" | `if (getState() === 'consultar') interact(el).unset()` no init |
| Múltiplos `drop` triggers ao soltar perto da fronteira | usar `document.elementsFromPoint` + filtro pela camada superior |
| Slot pré-existente perde conteúdo ao swap | confirmar com `confirm()` ou trocar (swap) automaticamente |

---

## 9. Telemetria (opcional)

Eventos a emitir para auditoria/analytics:

```
mreport.drag.start    {objectStamp, fromSection}
mreport.drag.end      {objectStamp, toSection, durationMs, valid}
mreport.drag.rejected {objectStamp, reason}
mreport.resize.end    {objectStamp, w, h, valid}
```

Ouvinte: `MReportLib.on('mreport.*', handler)` (event bus interno).

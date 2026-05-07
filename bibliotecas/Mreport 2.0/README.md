# Mreport 2.0

Refactor da biblioteca **Mreport** seguindo a arquitectura do **Mdash 2.0**.

> Status: **scaffolding inicial** — schema SQL e esqueleto de pastas estabelecidos.
> A migração funcional dos ecrãs ainda não está feita; ver [Roadmap](#roadmap).

---

## 1. Objectivos

| Objectivo | Mreport 1.x | Mreport 2.0 |
|---|---|---|
| Separação de camadas | monolito (`MREPORT CONFIG LIB.js` ~97 KB) | LIB / DATA / RENDERER / EXTENSION |
| Modelo de dados | flat (3 secções fixas, valores dinâmicos em JSON) | normalizado (Tab, Section, Layout, Object, Detail, ValorDinamico) |
| Layout | posição absoluta `x/y` sempre | grid + slots + posição absoluta como fallback |
| Templates reutilizáveis | ❌ | ✅ `MReportLayout` (HBF, slots, CDNs por template) |
| Drag-Drop | `interact.js` livre, sem regras | snap a grid + validação `canFit` (à Mdash) |
| Clipboard / multi-select / atalhos | ❌ | ✅ Ctrl+C/V, Shift+Click, Del, Esc |
| Cache de fontes | só AlaSQL local | Cache Architecture 4-níveis (CDC + delta + IndexedDB) |
| Estado global | jQuery DOM-as-state | `window.appState` reactivo + PetiteVue |

---

## 2. Estrutura de pastas

```
bibliotecas/Mreport 2.0/
├── README.md                       ← este ficheiro
├── Cache Architecture.md           ← cache 4-níveis (reutiliza Mdash)
├── DRAG-DROP-ARCHITECTURE.md       ← regras de validação/snap
├── docs/                           ← documentação técnica adicional
├── Eventos/                        ← scripts VB.NET (PHC CS Web events)
├── images/                         ← thumbnails de layouts/ícones
├── js/                             ← biblioteca JS
│   ├── MREPORT CONFIG LIB.js       ← API pública + state + engines
│   ├── MREPORT CONFIG MAIN.js      ← bootstrap do ecrã de configuração
│   ├── MREPORT DATA LAYER.js       ← AJAX + IndexedDB
│   ├── MREPORT RENDERER.js         ← geração de HTML + drag-drop init
│   ├── MREPORT LAYOUT BUILDER.js   ← editor de templates (3 ACE editors + preview)
│   ├── TEMPLATE MREPORT STANDARD EXTENSION.js  ← defaults + tema
│   └── Local DB Operations.js      ← AlaSQL helpers
├── Mockups/                        ← protótipos HTML
├── páginas de internet/            ← páginas .aspx que consomem a lib
├── rascunhos/                      ← exploratório
├── samples/                        ← exemplos completos
├── scripts/                        ← scripts auxiliares (build, gen)
├── SQL/
│   ├── Mreport tables.sql          ← schema principal
│   └── migrations/
│       └── 001_migrate_from_v1.sql ← migração idempotente do legacy
└── tests/                          ← testes unitários e de integração
```

---

## 3. Modelo de dados

```
u_mreport (1) ─┬─ (N) MReportTab
               ├─ (N) MReportSection ──── (0/1) MReportLayout
               ├─ (N) MReportFilter
               ├─ (N) MReportFonte ───────── cache_control + <ft>_cache + delta (Mdash)
               └─ (N) MReportObject ─┬─ (N) MReportObjectDetail
                                     ├─ (N) MReportValorDinamico
                                     └─ (0/1) MReportFonte
```

### Tabelas

| Tabela | Função |
|---|---|
| `u_mreport` | Cabeçalho do relatório (orientação, margens, page size, layout default, multi-tabs) |
| `MReportTab` | Separadores opcionais (legacy = sem tabs) |
| `MReportLayout` | Templates HBF reutilizáveis com `data-mreport-slot` |
| `MReportSection` | Secções configuráveis (substitui o triplo header/content/footer fixo) |
| `MReportFilter` | Filtros (com `escopo: global/tab/section`) |
| `MReportFonte` | Fontes SQL (com flag `usacache` + `cacheversion`) |
| `MReportObject` | Objectos no canvas (texto, tabela, chart, KPI, imagem, ...) |
| `MReportObjectDetail` | Drill-down / linhas detalhe |
| `MReportValorDinamico` | Tokens dinâmicos por objecto (Standard, Celula, Variavel, Filtro) |

Schema completo: [SQL/Mreport tables.sql](SQL/Mreport%20tables.sql).

---

## 4. Camadas JS

```
┌─────────────────────────────────────────────┐
│ MREPORT CONFIG MAIN.js                       │  ← entry point por página
│  - bootstrap; instancia state; PetiteVue     │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────▼───────────────────────┐
│ MREPORT CONFIG LIB.js                        │  ← API pública
│  window.MReportLib = {init, copy, paste,     │
│                       sync, commit, ...}     │
│  + Engines (Clipboard, MultiSelection,       │
│             DragDropValidator, RenderUnified)│
└────────┬────────────────────────────┬───────┘
         │                            │
┌────────▼─────────┐         ┌────────▼──────────┐
│ MREPORT          │         │ MREPORT           │
│ DATA LAYER.js    │         │ RENDERER.js       │
│  - AJAX gensel   │         │  - HTML templates │
│  - IndexedDB     │         │  - drag-drop init │
│  - cache delta   │         │  - property panel │
└──────────────────┘         └───────────────────┘
         │
┌────────▼─────────┐
│ Local DB         │
│ Operations.js    │
│  - AlaSQL        │
└──────────────────┘
```

API mínima:

```js
window.MReportLib = {
    init(reportStamp, config),       // carrega + popula appState
    getState(),                      // → { config, sections, objects, filters, fontes, ... }
    copy(),                          // Ctrl+C
    paste(),                         // Ctrl+V
    selectObject(stamp, multi),
    deleteSelected(),
    sync(records),                   // realtime
    commit()                         // upsert final + soft-deletes
}
```

---

## 5. Endpoints `gensel.aspx?cscript=...`

Mantidos do Mreport 1.x (compatibilidade):

| cscript | Uso |
|---|---|
| `getconfiguracaomreport` | fetch inicial completo |
| `executeexpressaolistagemdb` | executar SQL de fonte |
| `realtimecomponentsync` | sync incremental de qualquer registo |
| `actualizaconfiguracaomrelatorio` | commit final + soft-deletes |

Novos (a criar):

| cscript | Uso |
|---|---|
| `getmreportlayouts` | listar `MReportLayout` públicos |
| `getmreportsections` | sections + slots para um relatório |
| `getcacheversion` | (Mdash) versão de cache por fonte |
| `getcachechanges` | (Mdash) delta desde versão X |

---

## 6. Roadmap

### Fase 1 — Fundação ✅
- [x] Schema SQL completo (`SQL/Mreport tables.sql`)
- [x] Migração idempotente do v1 (`SQL/migrations/001_*.sql`)
- [x] Estrutura de pastas + README

### Fase 2 — Esqueleto JS
- [ ] `MREPORT CONFIG LIB.js` — `window.appState` + API pública (stub)
- [ ] `MREPORT DATA LAYER.js` — wrappers AJAX
- [ ] `MREPORT RENDERER.js` — render unificado com slots
- [ ] `Local DB Operations.js` — copiar do v1 e ajustar a cacheversion

### Fase 3 — Engines
- [ ] Clipboard Engine (Ctrl+C/V)
- [ ] MultiSelection Engine (Ctrl/Shift-click)
- [ ] DragDrop Validator (snap + canFit)
- [ ] Keyboard shortcuts (Del / Esc)

### Fase 4 — UI
- [ ] Adoptar layout 3-colunas do `Mockups/Mreport v9.html`
- [ ] Property panel dinâmico com JSONEditor por tipo
- [ ] Layout Builder (3 ACE + preview)

### Fase 5 — Cache
- [ ] Cscripts `getcacheversion` / `getcachechanges` para fontes Mreport
- [ ] Polling 30s no frontend
- [ ] Apply delta a IndexedDB

### Fase 6 — Runtime
- [ ] Migrar `Balanço e DR.html` para consumir nova API
- [ ] PDF export consistente (`html2pdf`)

---

## 7. Notas de migração

- Tudo idempotente: `IF OBJECT_ID(...) IS NULL` em cada `CREATE TABLE`.
- Soft-delete generalizado (`inactivo BIT`).
- A coluna `MReportObject.section` é **mantida** (legacy/runtime); a fonte de verdade passa a ser `mreportsectionstamp`.
- `mreportlayoutstamp = ''` em `u_mreport` significa "usar template default em código".
- A tabela de cache (`<ft>_cache`, `<ft>_cache_delta`, `cache_control`) é **partilhada com Mdash** — não duplicar.

Ver também: [Cache Architecture.md](Cache%20Architecture.md), [DRAG-DROP-ARCHITECTURE.md](DRAG-DROP-ARCHITECTURE.md).

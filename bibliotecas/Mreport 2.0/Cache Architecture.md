# Cache Architecture — Mreport 2.0

> Reutiliza integralmente a arquitectura de cache do **Mdash 2.0**.
> Ver original: [bibliotecas/Mdash 2.0/Cache Architecture.md](../Mdash%202.0/Cache%20Architecture.md).
>
> Este documento descreve **como o Mreport 2.0 se integra** nessa cache para acelerar fontes de dados grandes.

---

## 1. Pirâmide de 4 níveis

```
┌─────────────────────────────────────────────────────────┐
│ Nível 0 - Tabela ORIGINAL (ex: ft, fl, cc, ...)         │
│  Volátil, multi-utilizador, sem optimização para report │
└──────────────────────┬──────────────────────────────────┘
                       │ CDC (Change Data Capture) ou triggers
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Nível 1 - <ft>_cache  (Columnstore, append-only)        │
│  Espelho denormalizado para queries analíticas          │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Agent Job (~1 min)
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Nível 2 - <ft>_cache_delta  (registos alterados)        │
│  Versão incremental por linha; lido pelo frontend       │
└──────────────────────┬──────────────────────────────────┘
                       │ AJAX gensel.aspx?cscript=getcachechanges
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Nível 3 - IndexedDB local + AlaSQL                      │
│  Queries SQL no browser, sem round-trip                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tabelas envolvidas (partilhadas com Mdash)

| Tabela | Função | Script |
|---|---|---|
| `cache_control` | versão actual por fonte/tabela | [Mdash QUERY_CREATE_CACHE_CONTROL.sql](../Mdash%202.0/SQL/QUERY_CREATE_CACHE_CONTROL.sql) |
| `<ft>_cache` | espelho columnstore | [Mdash QUERY FT_CACHE(TABLE CACHE).sql](../Mdash%202.0/SQL/QUERY%20FT_CACHE(TABLE%20CACHE).sql) |
| `<ft>_cache_delta` | versão incremental | [Mdash QUERY_CREATE_FT_CACHE_DELTA.sql](../Mdash%202.0/SQL/QUERY_CREATE_FT_CACHE_DELTA.sql) |
| Stored Proc | aplica mudanças | [Mdash STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql](../Mdash%202.0/SQL/STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql) |
| Job | corre a SP a cada minuto | [Mdash JOB PARA SINCRONIZAR MUDANÇAS.sql](../Mdash%202.0/SQL/JOB%20PARA%20SINCRONIZAR%20MUDANÇAS.sql) |
| SP limpeza | retenção delta | [Mdash SP_LIMPEZA_DELTA.sql](../Mdash%202.0/SQL/SP_LIMPEZA_DELTA.sql) |

> **Não duplicar**: se o Mdash já criou estas tabelas para uma `ft`, o Mreport reutiliza-as.

---

## 3. Integração no `MReportFonte`

```sql
-- Campos relevantes
usacache       BIT      DEFAULT 0    -- liga/desliga
cacheversion   BIGINT   DEFAULT 0    -- última versão sincronizada para esta fonte
retencaodias   INT      DEFAULT 30
```

Quando `usacache = 1`:

1. O frontend, ao carregar a fonte, regista no IndexedDB as colunas (`schemajson`) e a versão actual (`cacheversion`).
2. Polling a `gensel.aspx?cscript=getcacheversion&fonte={stamp}` (~30 s).
3. Se versão server > versão local → `getcachechanges&fonte={stamp}&fromVersion={local}`.
4. Aplica delta no IndexedDB (`upsert` por `stamp`, `delete` se `op='D'`).
5. Queries da fonte (em `expressaolistagem`) executam em AlaSQL contra o IndexedDB local.

---

## 4. Fluxo do lado do Mreport

```
MReportLib.init()
   │
   ├─► MReportDataLayer.fetchConfig()       (gensel: getconfiguracaomreport)
   │      → recebe fontes com usacache=1
   │
   ├─► para cada fonte com usacache:
   │      ├─ MReportLocalDB.ensureSchema(fonte.schemajson)
   │      ├─ MReportLocalDB.getVersion(fonte.stamp)
   │      └─ MReportFonte.startCachePolling(intervalMs=30000)
   │              ├─ getcacheversion → if newer:
   │              ├─ getcachechanges&fromVersion=local
   │              └─ MReportLocalDB.applyDelta(records)
   │
   └─► MReportRenderer.renderDesigner(...)
```

Se `usacache = 0`, comportamento legacy: cada execução de fonte vai ao server (`executeexpressaolistagemdb`).

---

## 5. Decisão: quando ligar `usacache`

| Cenário | usacache |
|---|---|
| Fonte com < 5k linhas e poucas execuções/min | **0** (não vale a pena) |
| Fonte com 50k+ linhas, várias visualizações abertas | **1** |
| Fonte agregada/composta (várias joins) | **1** |
| Dados sensíveis que mudam por sessão (ex: filtros de utilizador) | **0** |

---

## 6. Limpeza / retenção

A SP `SP_LIMPEZA_DELTA` (Mdash) usa o campo `retencaodias` (definido por fonte) para podar o `<ft>_cache_delta`. Após esse período, clientes que ainda tenham versão antiga forçam **full reload** da fonte (ignoram delta).

---

## 7. Falhas e fallback

| Situação | Comportamento |
|---|---|
| IndexedDB indisponível (private mode, browser antigo) | `usacache` desligado em runtime; fallback a `executeexpressaolistagemdb` |
| Versão local muito atrasada (delta podado) | Full reload via `executeexpressaolistagemdb` + reset `cacheversion` |
| `cache_control` sem entrada para a fonte | Cscript devolve `cod="0001"`, frontend ignora cache |
| Schema diferente entre IndexedDB e server | `MReportLocalDB.ensureSchema` recria store local; full reload |

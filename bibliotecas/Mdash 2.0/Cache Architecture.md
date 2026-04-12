# Cache Architecture — MDash

> **Versão:** 1.1
> **Data:** Abril 2026
> **Âmbito:** Arquitectura genérica do sistema de cache do MDash. A tabela `ft` (fornecedores/terceiros) é usada como **caso de estudo** para ilustrar o padrão — o mesmo aplica-se a qualquer tabela PHC.

---

## Princípio Central

> **O programador que configura um dashboard MDash não precisa de criar tabelas, stored procedures, jobs, ou activar CDC manualmente.**
> O MDash detecta a necessidade de cache para uma fonte de dados e provisiona toda a infraestrutura automaticamente.

O programador apenas declara:
```js
new MDashFonte({
    tabela: "ft",           // tabela PHC de origem
    campos: ["no", "nome", "fdata", "ftstamp"],
    chave: "ftstamp",       // campo chave natural
    retencaoDias: 30        // politica de limpeza de deltas
})
```
O resto — CDC, tabelas de cache, stored procedure, SQL Agent Job — é criado e gerido pelo MDash sem intervenção do programador.

---

## Os 4 Niveis de Dados

| Nivel | Onde | Tecnologia | Proposito |
|-------|------|------------|-----------|
| 0 | SQL Server — tabela original (ex: `ft`) | T-SQL | Fonte de verdade. Nunca consultada directamente pelo frontend |
| 1 | SQL Server — `<tabela>_cache` (ex: `ft_cache`) | Columnstore Index | Snapshot optimizado para leitura; actualizado por CDC |
| 2 | SQL Server — `<tabela>_cache_delta` (ex: `ft_cache_delta`) | Tabela de log | Registo incremental de mudancas por Version; consumido de forma incremental pelo frontend |
| 3 | Browser — IndexedDB | AlaSQL | Copia local no cliente; todas as queries sao feitas aqui, sem round-trip ao servidor |

---

## Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────────────┐
│  SQL SERVER                                                           │
│                                                                       │
│  ┌──────────┐   CDC    ┌──────────────────┐                          │
│  │    ft    │ ───────► │  cdc.dbo_ft_CT   │                          │
│  │ (fonte   │          │  (log CDC)       │                          │
│  │ verdade) │          └──────────────────┘                          │
│  └──────────┘                   │                                    │
│                                 │  sp_SyncFtCache (SQL Agent, 1 min) │
│                                 ▼                                    │
│                    ┌────────────────────────┐                        │
│                    │       ft_cache         │ ← Columnstore Index    │
│                    │  (snapshot completo)   │   optimizado leitura   │
│                    └────────────────────────┘                        │
│                                 │                                    │
│                    ┌────────────────────────┐                        │
│                    │    ft_cache_delta      │ ← Log por Version      │
│                    │  Version | Op | Dados  │   consumo incremental  │
│                    └────────────────────────┘                        │
│                                 │                                    │
│                    ┌────────────────────────┐                        │
│                    │     cache_control      │ ← LSN + Version actual │
│                    │  TableName | Version   │                        │
│                    └────────────────────────┘                        │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
                     CScript PHC CS Web
              gensel.aspx?cscript=<nome_script>
                                  │
         ┌────────────────────────┴──────────────────────┐
         │                        │                      │
         │     ┌──────────────────▼──────────────────┐   │
         │     │  Script VB.NET (CScript)             │   │
         │     │                                      │   │
         │     │  getcacheversion                     │   │
         │     │  → SELECT Version, Status            │   │
         │     │    FROM cache_control                │   │
         │     │    WHERE TableName = 'ft'            │   │
         │     │                                      │   │
         │     │  getcachechanges                     │   │
         │     │  → SELECT * FROM ft_cache_delta      │   │
         │     │    WHERE Version > @since_version    │   │
         │     │    (ou fullRefresh se expirado)      │   │
         │     │                                      │   │
         │     │  getcachefull                        │   │
         │     │  → SELECT * FROM ft_cache            │   │
         │     │    (paginado, usado em fullRefresh)  │   │
         │     └──────────────────────────────────────┘   │
         │                        │                       │
         │  ┌─────────────────────▼─────────────────────┐ │
         │  │  BROWSER                                   │ │
         │  │                                            │ │
         │  │  ┌───────────────┐   ┌─────────────────┐  │ │
         │  │  │   IndexedDB   │   │  AlaSQL Engine  │  │ │
         │  │  │  (ft local)   │◄──│  (queries SQL)  │  │ │
         │  │  └───────────────┘   └─────────────────┘  │ │
         │  │         ▲                                  │ │
         │  │  Polling getcacheversion  (ex: 30s)        │ │
         │  └────────────────────────────────────────────┘ │
         └───────────────────────────────────────────────────┘
```

---

## Backend: CScripts PHC CS Web

O MDash nao expoe endpoints REST proprios. A comunicacao com o servidor e feita atraves do mecanismo nativo do **PHC CS Web**: scripts de utilizador (CScript) em VB.NET, invocados via:

```
../programs/gensel.aspx?cscript=<nome_do_script>
```

Os parametros sao enviados via `__EVENTARGUMENT` (POST, JSON) e a resposta e JSON.

### Padrao de um CScript (exemplo: `getcacheversion`)

```vb
Dim ExecuteQuery = Function(ByVal fQuery As String,
                            ByVal fParams As List(Of SqlParameter)) As DataTable
    Dim table As New DataTable
    Using conn As SqlConnection = SqlHelp.GetNewConnection()
        Using cmd As New SqlCommand(fQuery, conn)
            If fParams IsNot Nothing Then
                For Each p As SqlParameter In fParams
                    cmd.Parameters.Add(p)
                Next
            End If
            Using adapter As New SqlDataAdapter(cmd)
                adapter.Fill(table)
            End Using
        End Using
    End Using
    Return table
End Function

Try
    Dim parametro As String = HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim req As JObject = JArray.Parse(parametro)(0)

    Dim tableName As String = req("tableName").ToString()

    Dim sql As String = "SELECT Version, Status, TotalRows, LastUpdated
                         FROM cache_control
                         WHERE TableName = @tableName"
    Dim params As New List(Of SqlParameter)
    params.Add(New SqlParameter("@tableName", tableName))

    Dim result As DataTable = ExecuteQuery(sql, params)

    ' Resposta ao frontend
    Response.Write(JsonConvert.SerializeObject(result))
Catch ex As Exception
    Response.Write("{""error"":""" & ex.Message & """}")
End Try
```

### Os 3 CScripts necessarios por fonte de dados

| CScript | Invocacao | Descricao |
|---------|-----------|-----------|
| `getcacheversion` | Polling leve (ex: 30s) | Retorna `{ version, status, totalRows }` de `cache_control` |
| `getcachechanges` | Quando version mudou | Retorna deltas desde `since_version` ou `{ fullRefresh: true }` |
| `getcachefull` | Em fullRefresh | Retorna `<tabela>_cache` completo, paginado |

> Estes scripts sao **gerados automaticamente pelo MDash** com base na configuracao da fonte de dados declarada pelo programador. O programador nao os escreve manualmente.

---

## Auto-Provisionamento pelo MDash

Quando o MDash detecta uma nova fonte com `fontelocal: true`, executa o seguinte fluxo de provisionamento **automaticamente**:

```
MDash detecta nova MDashFonte com fontelocal: true
         │
         ▼
CDC activo na tabela de origem?
    NAO ─► EXEC sys.sp_cdc_enable_table (tabela, 'dbo_<tabela>')
         │
         ▼
<tabela>_cache existe?
    NAO ─► CREATE TABLE <tabela>_cache (campos + CachedAt)
            CREATE CLUSTERED COLUMNSTORE INDEX
         │
         ▼
<tabela>_cache_delta existe?
    NAO ─► CREATE TABLE <tabela>_cache_delta (Id, Version, Operation, chave, campos, CreatedAt)
            CREATE INDEX IX_..._Version
         │
         ▼
Linha em cache_control existe?
    NAO ─► INSERT INTO cache_control (TableName, Status, Version)
         │
         ▼
sp_Sync<Tabela>Cache existe?
    NAO ─► CREATE PROCEDURE sp_Sync<Tabela>Cache (gerada dinamicamente)
         │
         ▼
SQL Agent Job existe?
    NAO ─► sp_add_job + sp_add_jobstep + sp_add_schedule (1 minuto)
         │
         ▼
CScripts (getcacheversion, getcachechanges, getcachefull) existem?
    NAO ─► Gerar e registar scripts VB.NET no PHC CS Web
         │
         ▼
PRONTO — cache operacional
```

---

## Estrutura das Tabelas (geradas automaticamente)

### `<tabela>_cache` — Snapshot completo (ex: `ft_cache`)

```sql
CREATE TABLE ft_cache (
    no          NUMERIC(16)     DEFAULT 0,
    nome        NVARCHAR(255)   DEFAULT '',
    fdata       DATETIME        DEFAULT '19000101',
    ftstamp     VARCHAR(25)     DEFAULT '',     -- chave natural
    CachedAt    DATETIME        DEFAULT GETUTCDATE()
);
CREATE CLUSTERED COLUMNSTORE INDEX IX_ft_cache_cs ON ft_cache;
```

### `<tabela>_cache_delta` — Log incremental (ex: `ft_cache_delta`)

```sql
CREATE TABLE ft_cache_delta (
    Id          BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Version     INT             NOT NULL,   -- version de cache_control quando foi gerado
    Operation   CHAR(1)         NOT NULL,   -- 'I' Insert | 'U' Update | 'D' Delete
    ftstamp     VARCHAR(100)    NOT NULL,   -- chave natural
    no          NUMERIC(16)     NULL,
    nome        NVARCHAR(255)   NULL,
    fdata       DATETIME        NULL,
    CreatedAt   DATETIME        NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_ft_cache_delta_Version ON ft_cache_delta (Version ASC);
```

### `cache_control` — Partilhado por todas as fontes

```sql
CREATE TABLE cache_control (
    TableName   NVARCHAR(100)   NOT NULL PRIMARY KEY,
    LastUpdated DATETIME        NOT NULL DEFAULT GETUTCDATE(),
    TotalRows   INT             NULL,
    Status      NVARCHAR(20)    NOT NULL DEFAULT 'READY', -- READY | BUILDING | ERROR
    Version     INT             NOT NULL DEFAULT 0,       -- incrementa a cada sync com mudancas
    last_lsn    BINARY(10)      NULL,
    BuildStart  DATETIME        NULL,
    BuildEnd    DATETIME        NULL
);
```

---

## Fluxo de Sincronizacao Backend (`sp_Sync<Tabela>Cache`)

```
SQL Agent Job — executa cada 1 minuto
         │
         ▼
last_lsn NULL? (primeira execucao / reset)
    SIM ──► TRUNCATE <tabela>_cache
            INSERT directo da tabela de origem
            Version = 1
            RETURN
         │
         ▼ NAO
from_lsn = fn_cdc_increment_lsn(last_lsn)
from_lsn > to_lsn?
    SIM ──► RETURN (sem novas transaccoes)
         │
         ▼ NAO
changes = COUNT(*) no intervalo CDC
    = 0 ──► UPDATE last_lsn apenas (Version inalterada)
            RETURN
         │
         ▼ > 0
new_version = Version + 1

Deduplica CDC por chave (ROW_NUMBER por __$seqval DESC)
         │
DELETE <tabela>_cache  (operacao 1)
MERGE  <tabela>_cache  (operacoes 2, 4)
INSERT <tabela>_cache_delta  (todas, com new_version)
         │
UPDATE cache_control: Version = new_version
```

---

## Fluxo de Sincronizacao Frontend

```
App abre / timer 30s
         │
         ▼
CScript: getcacheversion  →  { version: N, status: 'READY' }
         │
versao_local == N?
    SIM ──► Nada a fazer
         │
         ▼ NAO
CScript: getcachechanges?since_version=versao_local
         │
    { fullRefresh: true } ──► Limpar IndexedDB
                               CScript: getcachefull (paginado)
                               Reconstruir IndexedDB
                               Guardar version = N
         │
    { changes: [...] }    ──► Aplicar delta ao IndexedDB:
                               'I' → indexedDB.put(record)
                               'U' → indexedDB.put(record)
                               'D' → indexedDB.delete(chave)
                               Guardar version = currentVersion
```

### Quando ocorre `fullRefresh: true`?

O CScript `getcachechanges` responde `fullRefresh: true` quando `since_version` e inferior ao minimo disponivel em `<tabela>_cache_delta` (deltas expirados pela politica de retencao):

```vb
Dim minVersion As Integer = CInt(ExecuteQuery(
    "SELECT ISNULL(MIN(Version), 0) FROM ft_cache_delta", Nothing).Rows(0)(0))

If sinceVersion < minVersion Then
    Response.Write("{""fullRefresh"":true}")
    Return
End If
```

---

## Exemplo de Resposta do CScript `getcachechanges`

```json
{
  "currentVersion": 47,
  "fullRefresh": false,
  "changes": [
    { "operation": "U", "ftstamp": "ELB18050351564.951428697", "no": 2149, "nome": "SYNC NOME", "fdata": "2018-05-03" },
    { "operation": "D", "ftstamp": "ABC12300000000000000000000", "no": null, "nome": null, "fdata": null },
    { "operation": "I", "ftstamp": "XYZ45600000000000000000000", "no": 3000, "nome": "Novo Fornecedor", "fdata": "2026-01-15" }
  ]
}
```

---

## Manutencao — Limpeza de Deltas

```sql
-- Gerado e agendado automaticamente pelo MDash
-- Default: 30 dias de retencao (configuravel por MDashFonte)
EXEC sp_CleanFtCacheDelta @retention_days = 30;
```

A politica de retencao deve ser >= ao maximo de dias que um utilizador pode estar inactivo. Se um utilizador nao abre a app ha 31 dias e a retencao e 30 dias → `fullRefresh` automatico na proxima abertura.

---

## Reset Manual

Se necessario forcar reconstrucao completa do cache:

```sql
UPDATE cache_control SET last_lsn = NULL, Version = 0 WHERE TableName = 'ft';
-- proxima execucao do Job faz carga inicial completa
```

---

## Ficheiros SQL — Caso de Estudo `ft`

> Estes ficheiros existem como **prova de conceito e referencia**. Em producao, o MDash gera e executa estes scripts automaticamente.

| Ficheiro | Proposito |
|----------|-----------|
| `QUERY FT_CACHE(TABLE CACHE).sql` | Criacao de `ft_cache` + carga inicial |
| `QUERY_CREATE_CACHE_CONTROL.sql` | Criacao de `cache_control` |
| `ALTER_CACHE_CONTROL_ADD_VERSION.sql` | Adiciona coluna `Version` a `cache_control` |
| `QUERY_CREATE_FT_CACHE_DELTA.sql` | Criacao de `ft_cache_delta` + indice |
| `STORAGE_PROCEDURE_PARA_ACTUALIZAR_MUDANCAS_GERIR_CACHE.sql` | `sp_SyncFtCache` — motor principal |
| `SP_LIMPEZA_DELTA.sql` | `sp_CleanFtCacheDelta` — retencao de deltas |
| `JOB PARA SINCRONIZAR MUDANCAS.sql` | SQL Agent Job (1 minuto) |
| `QUERY_PARA_ACTIVAR_DETECAO DE MUDANCAS.sql` | Activacao do CDC na tabela `ft` |
| `QUERY_TESTE_UPDATE_CHANGES.sql` | Diagnostico: estado do checkpoint e CDC |

---

## Consideracoes de Seguranca

- **`getcachefull`** deve ter paginacao obrigatoria (`OFFSET / FETCH`) — nunca retorna a tabela completa de uma vez.
- **`since_version`** deve ser validado no CScript como inteiro positivo antes de ser usado em query.
- **`querySanitized`** (funcao padrao dos CScripts MDash) bloqueia palavras-chave de escrita em qualquer expressao dinamica.
- **`<tabela>_cache_delta`** nao deve conter colunas com dados pessoais sensiveis (NIF, morada, etc.).
- O SQL Agent Job deve correr com conta de servico com permissoes minimas: `EXECUTE` na SP, `SELECT/INSERT/UPDATE/DELETE` apenas nas tabelas de cache.

---

## Extensibilidade

Este padrao e completamente generico. Para qualquer nova tabela PHC (ex: `cc` — centros de custo), o programador declara a fonte no MDash e o sistema:

1. Activa CDC em `cc`
2. Cria `cc_cache`, `cc_cache_delta`, linha em `cache_control`
3. Gera `sp_SyncCcCache` e agenda o Job
4. Gera os CScripts `getcacheversion`, `getcachechanges`, `getcachefull` para `cc`

A coluna `TableName` em `cache_control` e o design da `<tabela>_cache_delta` foram pensados precisamente para suportar multiplas entidades em paralelo, partilhando a mesma infraestrutura de controlo.

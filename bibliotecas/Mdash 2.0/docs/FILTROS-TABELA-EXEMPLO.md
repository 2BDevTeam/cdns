# Sistema de Filtros - Guia Completo

## 🆕 NOVO: Dropdown de Valores Pré-definidos

**Agora você pode selecionar valores facilmente!**

Ao editar um filtro, o campo **Valor** apresenta um **dropdown** com:
- 🗓️ **Hoje** (TODAY)
- 🗓️ **Ontem** (YESTERDAY)
- 🗓️ **Início da Semana** (WEEK_START)
- 🗓️ **Fim da Semana** (WEEK_END)
- 🗓️ **Últimos 7 Dias** (LAST_7_DAYS)
- 🗓️ **Últimos 30 Dias** (LAST_30_DAYS)
- 🔧 **Personalizado** → Campo livre para números ou expressões JavaScript

**Ver documentação completa:** [FILTROS-VALORES-PERSONALIZADOS.md](FILTROS-VALORES-PERSONALIZADOS.md)

---

## 🔍 Debug: Como Identificar o Problema

Abra o **Console do Browser (F12)** e procure por estas mensagens:

### 1. Ao Renderizar a Tabela
```
[Table] Renderizando tabela. Config filters: {enabled: true, definitions: [...]}
[Table Filters] _tblRenderFilters chamado: {enabled: true, ...}
[Table Filters] Renderizando 4 filtros
[Table Filters] Filtro: Todos count: 5 active: true
[Table Filters] HTML gerado: 1234 chars
```

**Se não aparecer**: A configuração não está no objeto `cfg.filters`

### 2. Ao Adicionar Filtro
```
[Table Filters] Adicionar filtro clicado
[Table Filters] Filtro adicionado, idx: 0 total: 1
[Table Filters] Item adicionado ao DOM
```

### 3. Ao Salvar Propriedades
```
[Table Filters] Config lida do painel: {enabled: true, definitions: [...]}
[Table Filters] ConfigJSON salvo: {"filters":{"enabled":true...
```

---

## ✅ Sistema de Datas (HOJE, ESTA SEMANA, etc.)

**Você NÃO precisa usar JavaScript** - O sistema já tem constantes prontas!

### Constantes Disponíveis

| Constante | Descrição | Equivalente |
|-----------|-----------|-------------|
| `TODAY` | Data de hoje (00:00:00) | `new Date()` sem horas |
| `YESTERDAY` | Ontem | Hoje - 1 dia |
| `WEEK_START` | Segunda-feira desta semana | Início da semana |
| `WEEK_END` | Domingo desta semana | Fim da semana |
| `LAST_7_DAYS` | 7 dias atrás | Hoje - 7 dias |
| `LAST_30_DAYS` | 30 dias atrás | Hoje - 30 dias |

### Como Usar

No campo **Valor** do filtro, digite a constante como **texto normal**:

```json
{
  "field": "data_criacao",
  "operator": "dateEq",
  "value": "TODAY"
}
```

O sistema automaticamente converte:
- `"TODAY"` → Data de hoje
- `"WEEK_START"` → Segunda-feira desta semana

---

## 📋 Exemplo Completo: Aprovações Pendentes

### Configuração JSON Completa

```json
{
  "filters": {
    "enabled": true,
    "activeFilterKey": "todos",
    "definitions": [
      {
        "key": "todos",
        "label": "Todos",
        "type": "button",
        "icon": "glyphicon-th-list",
        "default": true,
        "badge": {
          "enabled": true,
          "format": "{count}"
        },
        "conditions": [
          {
            "field": null,
            "operator": null,
            "value": null,
            "logic": "AND"
          }
        ]
      },
      {
        "key": "urgentes",
        "label": "Urgentes",
        "type": "button",
        "icon": "glyphicon-exclamation-sign",
        "badge": {
          "enabled": true,
          "format": "{count}"
        },
        "style": {
          "activeColor": "#ef4444"
        },
        "conditions": [
          {
            "field": "prioridade",
            "operator": "eq",
            "value": "Urgente",
            "logic": "AND"
          }
        ]
      },
      {
        "key": "hoje",
        "label": "Hoje",
        "type": "button",
        "icon": "glyphicon-calendar",
        "badge": {
          "enabled": true,
          "format": "{count}"
        },
        "conditions": [
          {
            "field": "data_aprovacao",
            "operator": "dateEq",
            "value": "TODAY",
            "logic": "AND"
          }
        ]
      },
      {
        "key": "esta_semana",
        "label": "Esta Semana",
        "type": "button",
        "icon": "glyphicon-time",
        "badge": {
          "enabled": true,
          "format": "{count}"
        },
        "conditions": [
          {
            "field": "data_aprovacao",
            "operator": "dateGt",
            "value": "WEEK_START",
            "logic": "AND"
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 Operadores Disponíveis

### Texto
- `eq` - Igual
- `neq` - Diferente
- `contains` - Contém
- `startsWith` - Começa com

### Números
- `gt` - Maior que
- `gte` - Maior ou igual
- `lt` - Menor que
- `lte` - Menor ou igual

### Datas
- `dateEq` - Data igual a
- `dateGt` - Data posterior a
- `dateLt` - Data anterior a
- `dateBetween` - Entre datas (usa array: `["WEEK_START", "WEEK_END"]`)

### Outros
- `in` - Em lista (usa array: `["valor1", "valor2"]`)
- `isNull` - É nulo
- `isNotNull` - Não é nulo

---

## 🔧 Como Configurar no MDash

### Método 1: Via Interface (Recomendado)

1. Abra a **Tabela** no MDash
2. No painel de propriedades, expanda **"Filtros Rápidos"**
3. Marque **"Ativar filtros rápidos"**
4. Clique **"Adicionar"**
5. Digite o **Label** (ex: "Hoje")
6. Clique no ícone de **engrenagem** (⚙️)
7. Configure:
   - **Ícone**: `glyphicon-calendar`
   - **Tipo**: Botão
   - **Badge**: Marque "Mostrar contador"
8. Adicione condição:
   - **Campo**: Selecione o campo de data
   - **Operador**: `Data igual`
   - **Valor**: Digite `TODAY`
9. Clique **"Guardar"**

### Método 2: Via SQL (Para testes rápidos)

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{"filters":{"enabled":true,"definitions":[...]}}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI'
```

---

## 🐛 Problemas Comuns

### 1. Filtros não aparecem na tabela

**Console deve mostrar**:
```
[Table Filters] Filtros não renderizados: {hasConfig: true, enabled: false, ...}
```

**Solução**: 
- Verifique se `filters.enabled = true`
- Verifique se `filters.definitions` tem pelo menos 1 item

### 2. Botão "Adicionar" faz collapse

**Console deve mostrar**:
```
[Table Filters] Adicionar filtro clicado
```

**Se não aparecer**: O event handler não está registrado. Recarregue a página.

### 3. Contadores mostram 0

**Verifique**:
- O campo na `condition.field` existe nos dados
- O operador está correto
- Para datas, use operadores `dateEq`, `dateGt`, `dateLt`

### 4. Datas não funcionam

**Console pode mostrar erro de parsing**. Verifique:
- Campo contém data válida (ISO 8601 ou DD/MM/YYYY)
- Operador é de data (`dateEq`, não `eq`)
- Valor usa constante (`TODAY`) ou formato válido

---

## 📊 Exemplo Completo: Filtros com AND/OR

```json
{
  "key": "urgentes_esta_semana",
  "label": "Urgentes Esta Semana",
  "type": "button",
  "conditions": [
    {
      "field": "prioridade",
      "operator": "eq",
      "value": "Urgente",
      "logic": "AND"
    },
    {
      "field": "data_criacao",
      "operator": "dateGt",
      "value": "WEEK_START",
      "logic": "AND"
    }
  ]
}
```

Resultado: `prioridade = 'Urgente' AND data_criacao > WEEK_START`

Para usar OR:
```json
{
  "logic": "OR"  // ← Segunda condição usa OR
}
```

---

## 🎨 Estilo Personalizado

```json
{
  "style": {
    "activeColor": "#ef4444"  // Vermelho quando ativo
  }
}
```

Cores sugeridas:
- Urgente: `#ef4444` (vermelho)
- Normal: `#2563eb` (azul - padrão)
- Concluído: `#10b981` (verde)
- Aviso: `#f59e0b` (laranja)

---

## ✨ Próximas Funcionalidades

- [ ] Filtro tipo "search" (barra de pesquisa)
- [ ] Filtro tipo "daterange" (seletor de intervalo)
- [ ] Filtro tipo "chips" (multi-select com tags)
- [ ] Salvar filtro favorito por utilizador
- [ ] Exportar/importar configurações
- [ ] Filtros por URL (deep linking)

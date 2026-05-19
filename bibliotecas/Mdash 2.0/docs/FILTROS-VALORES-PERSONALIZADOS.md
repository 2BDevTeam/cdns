# 🎯 Sistema de Valores nos Filtros MDash

## 📋 Visão Geral

O sistema de filtros MDash suporta **dois tipos de valores**:
1. **Valores Pré-definidos** (constantes de data)
2. **Valores Personalizados** (números ou expressões JavaScript)

---

## 🔷 1. Valores Pré-definidos (Constantes de Data)

### Dropdown de Seleção
Ao editar um filtro, o campo **Valor** apresenta um dropdown com as seguintes opções:

| Opção | Valor | Descrição |
|-------|-------|-----------|
| 🗓️ **Hoje** | `TODAY` | Data atual (00:00:00) |
| 🗓️ **Ontem** | `YESTERDAY` | Data de ontem (00:00:00) |
| 🗓️ **Início da Semana** | `WEEK_START` | Segunda-feira da semana atual |
| 🗓️ **Fim da Semana** | `WEEK_END` | Domingo da semana atual |
| 🗓️ **Últimos 7 Dias** | `LAST_7_DAYS` | Há 7 dias atrás |
| 🗓️ **Últimos 30 Dias** | `LAST_30_DAYS` | Há 30 dias atrás |
| 🔧 **Personalizado** | `CUSTOM` | Permite valor livre |

### Como Funciona
```javascript
// Configuração JSON
{
  "field": "data_criacao",
  "operator": "dateGt",
  "value": "TODAY"  // Constante é resolvida automaticamente
}
```

**Resolução automática:**
- `TODAY` → `new Date().setHours(0,0,0,0)`
- `YESTERDAY` → Data de ontem
- `WEEK_START` → Segunda-feira da semana
- etc.

---

## 🔧 2. Valores Personalizados

### Quando Usar
Selecione **🔧 Personalizado** no dropdown para ativar o campo de entrada livre.

### Tipos de Valores Personalizados

#### a) Números Simples
```javascript
{
  "field": "quantidade",
  "operator": "gt",
  "value": "100"  // Número direto
}
```

#### b) Texto Livre
```javascript
{
  "field": "estado",
  "operator": "eq",
  "value": "Pendente"
}
```

#### c) Expressões JavaScript
Para cálculos dinâmicos, use expressões que:
- Começam com `=`
- Contêm `row.`
- Usam operadores matemáticos
- Usam funções JavaScript

```javascript
// Valor calculado
{
  "field": "total",
  "operator": "gt",
  "value": "=row.quantidade * row.preco"
}

// Valor com percentagem
{
  "field": "desconto",
  "operator": "lt",
  "value": "=row.preco * 0.15"
}

// Cálculo de margem
{
  "field": "margem",
  "operator": "lt",
  "value": "=((row.preco_venda - row.custo) / row.preco_venda) * 100"
}

// Stock mínimo com margem de segurança
{
  "field": "stock_atual",
  "operator": "lt",
  "value": "=row.stock_minimo * 1.2"
}
```

---

## 🎨 Interface do Utilizador

### Modal de Edição de Filtro

Quando clica na engrenagem ⚙️ de um filtro, a modal mostra:

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Editar Filtro: Aprovações Pendentes                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Campo:     [data_criacao ▼]                             │
│ Operador:  [Data posterior ▼]                           │
│ Valor:     [🗓️ Hoje ▼] [                              ] │
│                                                          │
│ ↑ Dropdown    ↑ Input (oculto se não for Personalizado) │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Comportamento Dinâmico

**Quando seleciona constante (ex: TODAY):**
- Input de texto fica **oculto**
- Valor final = `"TODAY"`

**Quando seleciona Personalizado:**
- Input de texto fica **visível e focado**
- Pode digitar qualquer valor (número, texto, expressão)
- Valor final = conteúdo do input

---

## 📊 Exemplos Práticos

### Exemplo 1: Filtro de Data com Constante
```json
{
  "key": "criados_hoje",
  "label": "Criados Hoje",
  "icon": "glyphicon-calendar",
  "conditions": [
    {
      "field": "data_criacao",
      "operator": "dateEq",
      "value": "TODAY"
    }
  ]
}
```

### Exemplo 2: Filtro com Expressão JavaScript
```json
{
  "key": "valor_alto",
  "label": "Total > €1000",
  "icon": "glyphicon-euro",
  "conditions": [
    {
      "field": "total",
      "operator": "gt",
      "value": "=row.quantidade * row.preco_unitario"
    }
  ]
}
```

### Exemplo 3: Combinação de Constante e Custom
```json
{
  "key": "urgente",
  "label": "Urgentes",
  "icon": "glyphicon-fire",
  "conditions": [
    {
      "field": "data_limite",
      "operator": "dateLt",
      "value": "LAST_7_DAYS",
      "logic": "AND"
    },
    {
      "field": "prioridade",
      "operator": "eq",
      "value": "Alta"
    }
  ]
}
```

### Exemplo 4: Stock Crítico com Cálculo
```json
{
  "key": "stock_baixo",
  "label": "Stock Crítico",
  "icon": "glyphicon-warning-sign",
  "conditions": [
    {
      "field": "stock_atual",
      "operator": "lt",
      "value": "=row.stock_minimo * 1.2"
    }
  ]
}
```

---

## 🔐 Segurança nas Expressões JavaScript

### Contexto Controlado
Expressões são avaliadas via `new Function()` com acesso **apenas** a:
- `row` - Linha atual (todos os campos)
- `allRows` - Todas as linhas da tabela
- `Math`, `Number`, `String`, `Date`
- `parseFloat`, `parseInt`

### Sem Acesso a:
❌ `window`  
❌ `document`  
❌ `eval`  
❌ `fetch`  
❌ `localStorage`  
❌ Qualquer API do browser

### Try/Catch Automático
```javascript
try {
  var result = eval_expression(value);
  console.log('[Filter] Expressão avaliada:', value, '→', result);
  return result;
} catch(e) {
  console.error('[Filter] Erro ao avaliar expressão:', value, e);
  return value; // Fallback seguro
}
```

---

## 🎯 Fluxo de Processamento

```
┌─────────────────────────────────────┐
│ Utilizador edita filtro             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Seleciona opção no dropdown         │
│ • TODAY / YESTERDAY / etc.          │
│ • CUSTOM (Personalizado)            │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┐
         │           │
         ▼           ▼
┌────────────┐  ┌──────────────────┐
│ Constante  │  │ Personalizado     │
│ (TODAY)    │  │ (Input visível)   │
└──────┬─────┘  └──────┬───────────┘
       │                │
       │         ┌──────┴─────────────┐
       │         │ Número, Texto ou   │
       │         │ Expressão JS       │
       │         └──────┬─────────────┘
       │                │
       ▼                ▼
┌─────────────────────────────────────┐
│ Valor final gravado em condition    │
│ • "TODAY"                           │
│ • "100"                             │
│ • "=row.quantidade * row.preco"     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Na renderização/filtragem:          │
│ • Constantes → resolvidas para Date │
│ • Expressões → avaliadas com row    │
│ • Outros → usados diretamente       │
└─────────────────────────────────────┘
```

---

## 🎨 Ícone Padrão

### Antes
```javascript
icon: 'glyphicon-filter'  // ❌ Antigo
```

### Agora
```javascript
icon: 'glyphicon-tag'  // ✅ Novo padrão
```

O ícone **glyphicon-tag** é mais apropriado para filtros de dados e pode ser personalizado por cada filtro.

---

## 💡 Dicas de Utilização

### ✅ Boas Práticas

1. **Use constantes de data** para filtros temporais:
   ```json
   {"field": "data", "operator": "dateGt", "value": "TODAY"}
   ```

2. **Use expressões** para cálculos dinâmicos:
   ```json
   {"field": "total", "operator": "gt", "value": "=row.qtd * row.preco"}
   ```

3. **Use valores simples** para comparações estáticas:
   ```json
   {"field": "estado", "operator": "eq", "value": "Aprovado"}
   ```

### ❌ Evite

1. **Expressões complexas** que afetam performance
2. **Constantes de data** em campos não-data
3. **Valores vazios** quando o operador requer valor

---

## 🐛 Debug

### Console do Browser (F12)

**Quando seleciona no dropdown:**
```
[Filter] Preset selecionado: TODAY
[Filter] Custom input: oculto
```

**Quando digita valor personalizado:**
```
[Filter] Preset selecionado: CUSTOM
[Filter] Custom input: visível
[Filter] Valor personalizado: =row.quantidade * row.preco
```

**Ao guardar:**
```
[Table Filters] Modal salvo. FilterDef: {
  conditions: [{
    field: "total",
    operator: "gt",
    value: "=row.quantidade * row.preco"
  }]
}
```

**Na filtragem:**
```
[Filter] Expressão avaliada: =row.quantidade * row.preco → 1500
[Table Filters] Filtrado: 45 → 23 linhas
```

---

## 📚 Ver Também

- **[FILTROS-EXPRESSOES-JAVASCRIPT.md](FILTROS-EXPRESSOES-JAVASCRIPT.md)** - Expressões JavaScript avançadas
- **[FILTROS-TABELA-EXEMPLO.md](FILTROS-TABELA-EXEMPLO.md)** - Guia completo do sistema de filtros
- **[FILTROS-TABELA-EXEMPLOS.sql](FILTROS-TABELA-EXEMPLOS.sql)** - Exemplos SQL prontos a usar
- **[FILTROS-CORES-TOGGLE.md](FILTROS-CORES-TOGGLE.md)** - Personalização visual

---

## 🎓 Resumo

| Tipo de Valor | Quando Usar | Exemplo |
|--------------|-------------|---------|
| **Constantes de Data** | Filtros temporais relativos | `TODAY`, `LAST_7_DAYS` |
| **Números** | Comparações numéricas fixas | `100`, `0.5` |
| **Texto** | Comparações de string | `"Pendente"`, `"Alta"` |
| **Expressões JS** | Cálculos dinâmicos | `=row.qtd * row.preco` |

**Ícone padrão:** `glyphicon-tag` ✅

---

**Atualizado:** Maio 2026  
**Versão MDash:** 2.0 Refactor

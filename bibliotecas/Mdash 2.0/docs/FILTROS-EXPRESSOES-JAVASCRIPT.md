# 🧮 Filtros com Expressões JavaScript

## 🆕 NOVO: Interface Melhorada

**Agora é mais fácil usar expressões!**

Na modal de edição de filtros, o campo **Valor** tem um dropdown com:
- **Valores Pré-definidos**: TODAY, YESTERDAY, WEEK_START, etc.
- **🔧 Personalizado**: Permite digitar números ou **expressões JavaScript**

**Para usar expressões:**
1. Selecione **🔧 Personalizado** no dropdown
2. Digite a expressão no campo que aparece
3. Use `row.campo` para referenciar campos da linha

**Ver documentação completa do dropdown:** [FILTROS-VALORES-PERSONALIZADOS.md](FILTROS-VALORES-PERSONALIZADOS.md)

---

## 📋 Overview

Os operadores de filtro agora suportam **expressões JavaScript** que são avaliadas dinamicamente para cada linha da tabela. Isso permite comparações complexas e cálculos em tempo real.

---

## ✨ Funcionalidades

### Operadores que Suportam Expressões

Todos os operadores de comparação suportam expressões JavaScript:
- `eq` (Igual)
- `neq` (Diferente)
- `gt` (Maior que)
- `gte` (Maior ou igual)
- `lt` (Menor que)
- `lte` (Menor ou igual)

### Como Funciona

O sistema detecta automaticamente se o valor é uma expressão JavaScript quando:
1. **Começa com `=`**: `"=row.quantidade * row.preco"`
2. **Contém `row.` ou `row[`**: `"row.valor * 1.23"`
3. **Contém operadores matemáticos**: `"100 + 50"`
4. **Contém funções**: `"Math.max(row.a, row.b)"`

### Variáveis Disponíveis

Dentro das expressões, você tem acesso a:

```javascript
row        // Objeto da linha atual (todos os campos)
allRows    // Array com todas as linhas da tabela
Math       // Objeto Math do JavaScript
Number     // Construtor Number
String     // Construtor String
Date       // Construtor Date
parseFloat // Função parseFloat
parseInt   // Função parseInt
```

---

## 📊 Exemplos Práticos

### Exemplo 1: Cálculo Simples

**Filtrar produtos onde valor total > 1000**

```json
{
  "key": "valor_alto",
  "label": "Valor Total > €1000",
  "conditions": [
    {
      "field": "total",
      "operator": "gt",
      "value": "=row.quantidade * row.preco_unitario"
    }
  ]
}
```

### Exemplo 2: Percentagem

**Filtrar onde desconto > 10%**

```json
{
  "key": "desconto_alto",
  "label": "Desconto > 10%",
  "conditions": [
    {
      "field": "desconto",
      "operator": "gt",
      "value": "=row.preco * 0.10"
    }
  ]
}
```

### Exemplo 3: Comparação entre Campos

**Filtrar onde stock atual < stock mínimo**

```json
{
  "key": "stock_baixo",
  "label": "Stock Baixo",
  "conditions": [
    {
      "field": "stock_atual",
      "operator": "lt",
      "value": "=row.stock_minimo"
    }
  ]
}
```

### Exemplo 4: Funções Math

**Filtrar valores acima da média**

```json
{
  "key": "acima_media",
  "label": "Acima da Média",
  "conditions": [
    {
      "field": "valor",
      "operator": "gt",
      "value": "=allRows.reduce((sum, r) => sum + r.valor, 0) / allRows.length"
    }
  ]
}
```

### Exemplo 5: Condições Complexas

**Filtrar encomendas urgentes (prazo < 3 dias E valor > €500)**

```json
{
  "key": "urgentes_altos",
  "label": "Urgentes Alto Valor",
  "conditions": [
    {
      "field": "dias_prazo",
      "operator": "lt",
      "value": "3",
      "logic": "AND"
    },
    {
      "field": "valor",
      "operator": "gt",
      "value": "=row.quantidade * row.preco + row.taxa_urgencia",
      "logic": "AND"
    }
  ]
}
```

### Exemplo 6: Margem de Lucro

**Filtrar produtos com margem < 20%**

```json
{
  "key": "margem_baixa",
  "label": "Margem < 20%",
  "conditions": [
    {
      "field": "margem",
      "operator": "lt",
      "value": "=((row.preco_venda - row.custo) / row.preco_venda) * 100"
    }
  ]
}
```

### Exemplo 7: Valor com IVA

**Filtrar onde total com IVA > €1000**

```json
{
  "key": "total_iva_alto",
  "label": "Total c/ IVA > €1000",
  "conditions": [
    {
      "field": "total_iva",
      "operator": "gt",
      "value": "=row.total * 1.23"
    }
  ]
}
```

### Exemplo 8: Status Dinâmico

**Filtrar encomendas atrasadas**

```json
{
  "key": "atrasados",
  "label": "Atrasados",
  "conditions": [
    {
      "field": "dias_atraso",
      "operator": "gt",
      "value": "=Math.max(0, Math.floor((Date.now() - new Date(row.data_entrega).getTime()) / (1000 * 60 * 60 * 24)))"
    }
  ]
}
```

### Exemplo 9: Top 10%

**Filtrar valores no top 10%**

```json
{
  "key": "top_10",
  "label": "Top 10%",
  "conditions": [
    {
      "field": "valor",
      "operator": "gte",
      "value": "=allRows.map(r => r.valor).sort((a,b) => b-a)[Math.floor(allRows.length * 0.1)]"
    }
  ]
}
```

### Exemplo 10: Ratio entre Campos

**Filtrar onde ratio vendas/visitas > 0.05**

```json
{
  "key": "conversao_alta",
  "label": "Alta Conversão",
  "conditions": [
    {
      "field": "conversao",
      "operator": "gt",
      "value": "=row.vendas / Math.max(1, row.visitas)"
    }
  ]
}
```

---

## 🎯 Casos de Uso Avançados

### Caso 1: Dashboard Financeiro

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "margem_positiva",
        "label": "Margem Positiva",
        "icon": "glyphicon-arrow-up",
        "style": {"activeColor": "#10b981"},
        "conditions": [
          {
            "field": "margem",
            "operator": "gt",
            "value": "=row.preco_venda - row.custo"
          }
        ]
      },
      {
        "key": "roi_alto",
        "label": "ROI > 20%",
        "icon": "glyphicon-stats",
        "style": {"activeColor": "#f59e0b"},
        "conditions": [
          {
            "field": "roi",
            "operator": "gt",
            "value": "=((row.receita - row.investimento) / row.investimento) * 100"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP';
```

### Caso 2: Gestão de Stock

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "reposicao",
        "label": "Necessita Reposição",
        "icon": "glyphicon-refresh",
        "style": {"activeColor": "#ef4444"},
        "badge": {"enabled": true, "format": "⚠ {count}"},
        "conditions": [
          {
            "field": "stock",
            "operator": "lt",
            "value": "=row.stock_minimo + (row.consumo_medio * 7)"
          }
        ]
      },
      {
        "key": "rotacao_baixa",
        "label": "Rotação Baixa",
        "icon": "glyphicon-time",
        "style": {"activeColor": "#64748b"},
        "conditions": [
          {
            "field": "dias_stock",
            "operator": "gt",
            "value": "=row.stock / Math.max(0.01, row.vendas_dia)"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP';
```

### Caso 3: CRM / Vendas

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "hot_leads",
        "label": "Hot Leads",
        "icon": "glyphicon-fire",
        "style": {"activeColor": "#ef4444"},
        "conditions": [
          {
            "field": "score",
            "operator": "gt",
            "value": "=(row.visitas * 2) + (row.interacoes * 5) + (row.downloads * 10)"
          }
        ]
      },
      {
        "key": "clientes_vip",
        "label": "Clientes VIP",
        "icon": "glyphicon-star",
        "style": {"activeColor": "#f59e0b"},
        "conditions": [
          {
            "field": "lifetime_value",
            "operator": "gt",
            "value": "=row.compras_total * row.ticket_medio * 1.5"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP';
```

---

## 🔒 Segurança

### Contexto Seguro

As expressões são executadas em um contexto controlado usando `new Function()`, com acesso apenas a:
- Variáveis seguras (`row`, `allRows`)
- Objetos nativos do JavaScript (`Math`, `Date`, etc.)
- **Sem acesso** a `window`, `document`, `eval`, `fetch`, etc.

### Try/Catch

Todas as expressões são envolvidas em `try/catch`. Se houver erro:
- O erro é logado no Console
- O filtro usa o valor original (fallback seguro)
- O sistema continua funcionando

### Logs de Debug

```javascript
// Console mostra:
[Filter] Expressão avaliada: =row.quantidade * row.preco → 1500
[Filter] Erro ao avaliar expressão: =row.campo_invalido.erro SyntaxError: ...
```

---

## ⚡ Performance

### Boas Práticas

✅ **Recomendado:**
```javascript
"value": "=row.quantidade * row.preco"  // Acesso direto aos campos
"value": "=row.valor * 1.23"            // Cálculo simples
```

❌ **Evitar:**
```javascript
"value": "=allRows.filter(...).reduce(...).map(...)"  // Muitas iterações
"value": "=JSON.parse(row.campo)"                     // Parsing complexo
```

### Otimização

- Expressões são avaliadas **uma vez por linha** durante a filtragem
- Use expressões simples quando possível
- Calcule valores complexos no backend e traga como campos separados
- Para filtros que não precisam de expressões, use valores estáticos

---

## 📝 Sintaxe Rápida

### Prefixo `=` (Opcional mas Recomendado)

```json
"value": "=row.campo"      // Com prefixo (explícito)
"value": "row.campo"       // Sem prefixo (auto-detectado)
```

### Acessar Campos

```javascript
row.campo           // Campo direto
row["campo"]        // Campo com nome dinâmico
row.campo || 0      // Com fallback
row?.campo          // Optional chaining (se suportado)
```

### Operadores Matemáticos

```javascript
row.a + row.b       // Soma
row.a - row.b       // Subtração
row.a * row.b       // Multiplicação
row.a / row.b       // Divisão
row.a % row.b       // Módulo
row.a ** 2          // Potência
```

### Funções Math

```javascript
Math.max(row.a, row.b)
Math.min(row.a, row.b)
Math.round(row.valor)
Math.floor(row.valor)
Math.ceil(row.valor)
Math.abs(row.valor)
Math.sqrt(row.valor)
```

### Operadores Lógicos

```javascript
row.a && row.b      // AND
row.a || row.b      // OR
!row.ativo          // NOT
row.a ? row.b : row.c  // Ternário
```

### Arrays (allRows)

```javascript
allRows.length
allRows[0].campo
allRows.map(r => r.valor)
allRows.filter(r => r.ativo)
allRows.reduce((sum, r) => sum + r.valor, 0)
allRows.find(r => r.id === row.parent_id)
```

---

## 🧪 Testes

### Testar Expressão no Console

```javascript
// Simular dados
var row = {quantidade: 10, preco: 150, desconto: 0.1};
var allRows = [{valor: 100}, {valor: 200}, {valor: 300}];

// Testar expressão
var expr = "row.quantidade * row.preco * (1 - row.desconto)";
var fn = new Function('row', 'allRows', 'Math', 'return (' + expr + ');');
console.log(fn(row, allRows, Math));  // 1350
```

### Debug de Filtros

1. Abra Console (F12)
2. Ative o filtro
3. Veja logs: `[Filter] Expressão avaliada: ... → resultado`
4. Se erro: `[Filter] Erro ao avaliar expressão: ...`

---

## 🎓 Exemplos SQL Completos

### Dashboard de E-commerce

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "carrinho_abandono",
        "label": "Carrinho Abandonado",
        "icon": "glyphicon-shopping-cart",
        "style": {"activeColor": "#f59e0b"},
        "badge": {"enabled": true, "format": "{count}"},
        "conditions": [
          {
            "field": "valor_carrinho",
            "operator": "gt",
            "value": "0"
          },
          {
            "field": "dias_inativo",
            "operator": "gt",
            "value": "3",
            "logic": "AND"
          },
          {
            "field": "taxa_conversao",
            "operator": "lt",
            "value": "=row.compras / Math.max(1, row.sessoes)",
            "logic": "AND"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP';
```

---

## 💡 Dicas Finais

1. **Sempre teste** suas expressões no Console primeiro
2. **Use logs** para debug: `console.log('[Filter]', ...)`
3. **Fallback seguro**: Se erro, o sistema usa o valor original
4. **Performance**: Evite expressões muito complexas com `allRows`
5. **Documentação**: Comente expressões complexas nos seus configs

---

**Versão:** MDash 2.0 - 2026.05.16  
**Feature:** Filtros com Expressões JavaScript  
**Status:** ✅ Implementado e Testado

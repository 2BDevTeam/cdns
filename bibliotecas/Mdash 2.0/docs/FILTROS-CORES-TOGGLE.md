# 🎨 Filtros com Cores Personalizadas e Toggle

## ✨ Funcionalidades Implementadas

### 1️⃣ **Toggle de Filtros (Marcar/Desmarcar)**

Os botões de filtro agora funcionam como **toggle**:
- **Clicar em filtro inativo** → Ativa e aplica o filtro
- **Clicar em filtro ativo** → Desativa e mostra todos os dados

```
Estado inicial: [Todos] [Urgentes] [Hoje]
↓ Clique em "Urgentes"
[Todos] [Urgentes✓] [Hoje]  ← Filtro ativo, tabela filtrada
↓ Clique em "Urgentes" novamente
[Todos] [Urgentes] [Hoje]    ← Filtro desativado, tabela completa
```

### 2️⃣ **Cores Personalizadas**

Cada filtro pode ter sua **própria cor** quando ativo:
- Configurável via modal de edição
- Campo "Cor personalizada (quando ativo)"
- Cor aplicada ao fundo, borda e mantém texto branco

### 3️⃣ **Estilos Visuais Modernos**

- Botões com bordas arredondadas
- Efeito hover com elevação
- Badge integrado para contadores
- Animações suaves (transition 0.2s)
- Responsivo (mobile-friendly)

---

## 🎯 Como Configurar

### Via Interface (Painel de Propriedades)

1. **Selecione a tabela** no MDash
2. **Ative "Ativar filtros rápidos"**
3. **Clique "Adicionar"**
4. **Configure o filtro:**
   - **Label:** Nome do botão (ex: "Urgentes")
   - **Clique no ícone engrenagem** para editar
5. **Na modal de edição:**
   - **Ícone:** `glyphicon-exclamation-sign`
   - **Mostrar contador:** ✅ Ativado
   - **Cor personalizada:** `#ef4444` (vermelho)
   - **Condições:**
     - Campo: `prioridade`
     - Operador: `Igual (=)`
     - Valor: `Urgente`

### Via SQL (Configuração Direta)

```sql
UPDATE mdashcontaineritemobject
SET configjson = '{
  "theme": "phcPrimary",
  "filters": {
    "enabled": true,
    "activeFilterKey": null,
    "definitions": [
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
        "key": "altas",
        "label": "Prioridade Alta",
        "type": "button",
        "icon": "glyphicon-arrow-up",
        "badge": {
          "enabled": true,
          "format": "({count})"
        },
        "style": {
          "activeColor": "#f59e0b"
        },
        "conditions": [
          {
            "field": "prioridade",
            "operator": "eq",
            "value": "Alta",
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
        "style": {
          "activeColor": "#10b981"
        },
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateEq",
            "value": "TODAY",
            "logic": "AND"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';
```

---

## 🎨 Paleta de Cores Sugeridas

```javascript
// Cores PHC Standard
"#2563eb"  // Azul primário (default)
"#ef4444"  // Vermelho - Urgente, Erro, Crítico
"#f59e0b"  // Laranja - Aviso, Alta prioridade
"#10b981"  // Verde - Sucesso, Completo, Ativo
"#8b5cf6"  // Roxo - Especial, Premium
"#6366f1"  // Índigo - Informação, Novo
"#ec4899"  // Rosa - Favorito, Destacado
"#14b8a6"  // Teal - Progresso, Em andamento
"#64748b"  // Cinza - Normal, Padrão

// Cores de Status
"#dc2626"  // Vermelho escuro - Bloqueado, Rejeitado
"#ea580c"  // Laranja escuro - Pendente, Atrasado
"#84cc16"  // Verde limão - Aprovado, Validado
"#06b6d4"  // Ciano - Draft, Rascunho
"#71717a"  // Cinza médio - Arquivado, Inativo
```

---

## 📊 Exemplos de Uso

### Exemplo 1: Dashboard de Aprovações

```json
{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "pendentes",
        "label": "Pendentes",
        "icon": "glyphicon-time",
        "style": { "activeColor": "#f59e0b" },
        "conditions": [
          { "field": "estado", "operator": "eq", "value": "Pendente" }
        ]
      },
      {
        "key": "aprovados",
        "label": "Aprovados",
        "icon": "glyphicon-ok",
        "style": { "activeColor": "#10b981" },
        "conditions": [
          { "field": "estado", "operator": "eq", "value": "Aprovado" }
        ]
      },
      {
        "key": "rejeitados",
        "label": "Rejeitados",
        "icon": "glyphicon-remove",
        "style": { "activeColor": "#ef4444" },
        "conditions": [
          { "field": "estado", "operator": "eq", "value": "Rejeitado" }
        ]
      }
    ]
  }
}
```

**Resultado Visual:**
```
┌────────────────────────────────────────────────────────────┐
│ [Pendentes 12] [Aprovados 45] [Rejeitados 3]              │ ← Barra de filtros
│  (laranja)      (verde)         (vermelho)                │
└────────────────────────────────────────────────────────────┘
```

### Exemplo 2: Filtros de Data com Cores

```json
{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "hoje",
        "label": "Hoje",
        "icon": "glyphicon-calendar",
        "style": { "activeColor": "#2563eb" },
        "badge": { "enabled": true, "format": "{count}" },
        "conditions": [
          { "field": "data", "operator": "dateEq", "value": "TODAY" }
        ]
      },
      {
        "key": "esta_semana",
        "label": "Esta Semana",
        "icon": "glyphicon-time",
        "style": { "activeColor": "#8b5cf6" },
        "badge": { "enabled": true, "format": "{count}" },
        "conditions": [
          { "field": "data", "operator": "dateGt", "value": "WEEK_START" }
        ]
      },
      {
        "key": "atrasados",
        "label": "Atrasados",
        "icon": "glyphicon-alert",
        "style": { "activeColor": "#dc2626" },
        "badge": { "enabled": true, "format": "⚠ {count}" },
        "conditions": [
          { "field": "data_limite", "operator": "dateLt", "value": "TODAY" },
          { "field": "estado", "operator": "neq", "value": "Completo", "logic": "AND" }
        ]
      }
    ]
  }
}
```

### Exemplo 3: Filtros de Valor com Gradiente

```json
{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "baixo",
        "label": "< €100",
        "icon": "glyphicon-chevron-down",
        "style": { "activeColor": "#64748b" },
        "conditions": [
          { "field": "valor", "operator": "lt", "value": "100" }
        ]
      },
      {
        "key": "medio",
        "label": "€100-€500",
        "icon": "glyphicon-minus",
        "style": { "activeColor": "#f59e0b" },
        "conditions": [
          { "field": "valor", "operator": "gte", "value": "100" },
          { "field": "valor", "operator": "lte", "value": "500", "logic": "AND" }
        ]
      },
      {
        "key": "alto",
        "label": "> €500",
        "icon": "glyphicon-chevron-up",
        "style": { "activeColor": "#10b981" },
        "conditions": [
          { "field": "valor", "operator": "gt", "value": "500" }
        ]
      }
    ]
  }
}
```

---

## 🔧 Comportamento Técnico

### Toggle Logic

```javascript
// Quando clica em botão de filtro:
if (botaoEstavaAtivo) {
  // DESATIVAR
  1. Remove classe .is-active
  2. Remove estilos inline (cor personalizada)
  3. Mostra TODOS os dados (table.setData(allData))
  4. Atualiza activeFilterKey = null
  5. Persiste estado na base de dados
} else {
  // ATIVAR
  1. Desativa todos os outros botões
  2. Adiciona .is-active ao botão clicado
  3. Aplica cor personalizada via CSS inline
  4. Filtra dados (_tblApplyFilter)
  5. Atualiza Tabulator (table.setData(filteredData))
  6. Atualiza activeFilterKey = filterKey
  7. Persiste estado na base de dados
}
```

### Persistência de Estado

```javascript
// Estado do filtro é guardado em:
obj.config.filters.activeFilterKey = 'urgentes' // ou null se nenhum ativo

// Ao recarregar a página:
- Se activeFilterKey existe → Renderiza botão com .is-active e aplica filtro
- Se activeFilterKey = null → Mostra todos os dados sem filtros ativos
```

### Logs de Debug

```javascript
// Console mostra:
[Table Filters] Filtro ativado: urgentes registos: 15
// ou
[Table Filters] Filtro desativado: urgentes
```

---

## 🎯 Casos de Uso

### ✅ Quando Usar Toggle

- **Dashboards exploratórios:** Usuário precisa ver "todos" vs "filtrado"
- **Comparação de categorias:** Alterna entre diferentes segmentos
- **Análise ad-hoc:** Ativa/desativa filtros conforme necessário

### ❌ Quando NÃO Usar Toggle

- **Filtro "Todos" explícito:** Se tem botão "Todos", não precisa toggle
- **Seleção múltipla:** Se precisa ativar vários filtros simultaneamente (use checkbox)
- **Filtro obrigatório:** Se sempre tem que ter algum filtro ativo

---

## 🚀 Próximos Passos

Após validar o toggle básico:

1. **Filtros múltiplos simultâneos:** Permitir Ctrl+Click para ativar vários filtros
2. **Grupos de filtros:** Agrupar filtros relacionados (datas, status, valores)
3. **Preset de filtros:** Salvar combinações de filtros como atalhos
4. **Filtro avançado:** Modal com builder visual para condições complexas
5. **Animações:** Transição suave ao aplicar/remover filtros

---

## 📋 Checklist de Validação

Teste estas funcionalidades:

- [ ] **Clicar em filtro inativo** → Ativa e filtra dados
- [ ] **Clicar em filtro ativo** → Desativa e mostra todos
- [ ] **Cor personalizada** → Botão ativo usa cor definida
- [ ] **Cor padrão** → Se não definida, usa azul #2563eb
- [ ] **Badge contador** → Mostra número correto de registos
- [ ] **Hover effect** → Animação ao passar mouse
- [ ] **Estado persiste** → Após F5, filtro ativo mantém-se
- [ ] **Logs console** → Mensagens de ativação/desativação aparecem
- [ ] **Múltiplos filtros** → Só um ativo por vez
- [ ] **Contador atualiza** → Após toggle, contador reflete dados visíveis

---

**Versão:** MDash 2.0 - 2026.05.16  
**Autor:** Sistema de Filtros com Toggle  
**Status:** ✅ Implementado e testado

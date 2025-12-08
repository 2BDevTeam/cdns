# Advanced Cards - Top Border Design

## 📋 Visão Geral

Foram adicionadas 3 novas funções de geração de cards com design moderno baseado em top border ao arquivo **TEMPLATE DASHBOARD STANDARD EXTENSION.js**:

1. **generateBrdCardAdvancedMetric** - Cards de métricas com ícones
2. **generateBrdCardAdvancedStatus** - Cards de status com badges
3. **generateBrdCardAdvancedAlert** - Cards de alertas com ícones laterais

## 🎨 Características

- ✅ Design moderno com borda superior colorida (top border)
- ✅ Animações suaves de hover e transformação
- ✅ Suporte completo para tipos: `primary`, `success`, `warning`, `danger`
- ✅ Gradientes dinâmicos usando `getColorByType()`
- ✅ Compatível com ES5 (sem arrow functions, template literals, spread operators)
- ✅ Totalmente responsivo (mobile-first)
- ✅ Integração com MDashCard class
- ✅ Prefixo de classe: `brd-card-advanced`

## 📦 Estrutura de Arquivos Modificados

```
javascripts padrão/TemplatesUI/
└── TEMPLATE DASHBOARD STANDARD EXTENSION.js
    ├── generateBrdCardAdvancedMetric()      [NOVA FUNÇÃO - linha ~490]
    ├── generateBrdCardAdvancedStatus()      [NOVA FUNÇÃO - linha ~512]
    ├── generateBrdCardAdvancedAlert()       [NOVA FUNÇÃO - linha ~540]
    ├── hexToRgb()                           [NOVA FUNÇÃO - linha ~1900]
    └── addDashboardStyles()                 [CSS ADICIONADO - linha ~3150+]
```

## 🚀 Como Usar

### 1. Metric Card Advanced

Ideal para exibir métricas e KPIs com valores grandes.

```javascript
var cardData = {
    id: 'metric-revenue',
    title: 'Total Revenue',
    tipo: 'primary',           // primary | success | warning | danger
    icon: 'fas fa-dollar-sign',
    extraData: {
        value: '€ 45,320',
        subtitle: '+12% from last month'  // Opcional
    }
};

var html = generateBrdCardAdvancedMetric(cardData);
$('#container').html(html);
```

**Resultado:**
```
┌─────────────────────────────────────────┐ ← Border Top (Primary)
│  [💰]  TOTAL REVENUE                    │
│         € 45,320                        │
│         +12% from last month            │
└─────────────────────────────────────────┘
```

### 2. Status Card Advanced

Ideal para status de sistemas, conexões e processos.

```javascript
var cardData = {
    id: 'status-system',
    title: 'System Status',
    bodyContent: 'All systems operational. No issues detected.',
    footer: 'Last checked: 2 minutes ago',  // Opcional
    tipo: 'success',
    icon: 'fas fa-check-circle',
    extraData: {
        status: 'Online'  // Texto do badge
    }
};

var html = generateBrdCardAdvancedStatus(cardData);
$('#container').html(html);
```

**Resultado:**
```
┌─────────────────────────────────────────┐ ← Border Top (Success)
│  ✓  [Online]                            │
│                                         │
│  System Status                          │
│  All systems operational...             │
│  ─────────────────────────────────      │
│  Last checked: 2 minutes ago            │
└─────────────────────────────────────────┘
```

### 3. Alert Card Advanced

Ideal para notificações, avisos e mensagens importantes.

```javascript
var cardData = {
    id: 'alert-storage',
    title: 'Storage Warning',
    bodyContent: 'Disk space is running low. Consider freeing up space.',
    footer: 'Current usage: 85%',  // Opcional
    tipo: 'warning',
    icon: 'fas fa-exclamation-triangle'
};

var html = generateBrdCardAdvancedAlert(cardData);
$('#container').html(html);
```

**Resultado:**
```
┌─────────────────────────────────────────┐ ← Border Top (Warning)
│  [⚠]  Storage Warning                   │
│        Disk space is running low...     │
│        Current usage: 85%               │
└─────────────────────────────────────────┘
```

## 🎨 Tipos de Card (tipo)

Todos os cards suportam 4 tipos com cores dinâmicas:

| Tipo      | Cor           | Uso Recomendado                    |
|-----------|---------------|------------------------------------|
| `primary` | Azul          | Informações gerais, métricas       |
| `success` | Verde         | Status positivos, confirmações     |
| `warning` | Laranja       | Avisos, atenção necessária         |
| `danger`  | Vermelho      | Erros, alertas críticos            |

## 📐 Classes CSS Adicionadas

### Classes Base
- `.brd-card-advanced` - Container principal
- `.brd-card-advanced:hover` - Efeito de elevação

### Metric Card
- `.brd-card-advanced-metrica`
- `.brd-card-advanced-icon`
- `.brd-card-advanced-icon-{tipo}`
- `.brd-card-advanced-content`
- `.brd-card-advanced-label`
- `.brd-card-advanced-value`
- `.brd-card-advanced-subtitle`

### Status Card
- `.brd-card-advanced-status`
- `.brd-card-advanced-status-{tipo}`
- `.brd-card-advanced-status-header`
- `.brd-card-advanced-status-badge`
- `.brd-card-advanced-status-title`
- `.brd-card-advanced-status-message`
- `.brd-card-advanced-status-footer`

### Alert Card
- `.brd-card-advanced-alert`
- `.brd-card-advanced-alert-{tipo}`
- `.brd-card-advanced-alert-icon`
- `.brd-card-advanced-alert-content`
- `.brd-card-advanced-alert-title`
- `.brd-card-advanced-alert-message`
- `.brd-card-advanced-alert-footer`

## 🔧 Propriedades do MDashCard

```javascript
{
    id: String,              // ID único do card
    title: String,           // Título principal
    bodyContent: String,     // Conteúdo/mensagem (Status e Alert)
    footer: String,          // Rodapé opcional
    tipo: String,            // primary|success|warning|danger
    icon: String,            // Classe Font Awesome (ex: 'fas fa-chart-line')
    classes: String,         // Classes CSS adicionais
    styles: String,          // Estilos inline adicionais
    extraData: {
        value: String,       // Valor métrico (Metric Card)
        subtitle: String,    // Subtítulo (Metric Card)
        status: String       // Texto do badge (Status Card)
    }
}
```

## 💡 Exemplos Práticos

### Dashboard de Monitoramento
```javascript
// Métrica de usuários ativos
generateBrdCardAdvancedMetric({
    title: 'Active Users',
    tipo: 'success',
    icon: 'fas fa-users',
    extraData: { 
        value: '2,847', 
        subtitle: '+5% from yesterday' 
    }
});

// Status da conexão
generateBrdCardAdvancedStatus({
    title: 'Database Connection',
    bodyContent: 'Connected to primary database.',
    footer: 'Response time: 45ms',
    tipo: 'primary',
    icon: 'fas fa-database',
    extraData: { status: 'Connected' }
});

// Alerta de backup
generateBrdCardAdvancedAlert({
    title: 'Backup Complete',
    bodyContent: 'System backup completed successfully.',
    footer: 'Completed: 11:45 AM',
    tipo: 'success',
    icon: 'fas fa-check'
});
```

### Grid Responsivo
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
    <!-- Cards serão adicionados aqui -->
</div>
```

```javascript
$('#container').append(generateBrdCardAdvancedMetric(cardData1));
$('#container').append(generateBrdCardAdvancedMetric(cardData2));
$('#container').append(generateBrdCardAdvancedStatus(cardData3));
```

## 🎯 Features Implementadas

### Animações
- ✅ Elevação ao hover (`translateY(-4px)`)
- ✅ Ampliação do ícone (`scale(1.1) rotate(5deg)`)
- ✅ Transições suaves (`cubic-bezier(0.4,0,0.2,1)`)
- ✅ Box-shadow dinâmico

### Responsividade
- ✅ Breakpoint 768px (tablet)
  - Padding reduzido
  - Ícones menores
  - Fonte ajustada

### Cores Dinâmicas
- ✅ Integração com `getColorByType()` para cores do Bootstrap
- ✅ Gradientes automáticos para ícones
- ✅ Transparências com `hexToRgb()` helper
- ✅ Border-top colorido por tipo

## 📱 Compatibilidade

- ✅ ES5 (IE11+)
- ✅ Bootstrap 4/5
- ✅ Font Awesome 5/6
- ✅ jQuery 3+
- ✅ Mobile/Tablet/Desktop

## 🧪 Teste

Para testar os novos cards, abra o arquivo:
```
Mockups/brd-card-advanced-examples.html
```

Este arquivo contém:
- ✅ Exemplos completos de todos os tipos de cards
- ✅ Diferentes variações de cores
- ✅ Exemplos de código comentados
- ✅ Grid responsivo demonstrativo

## 📚 Documentação Técnica

### Função Helper: hexToRgb()

Converte cores hexadecimais ou RGB para formato "r,g,b" usado em rgba().

```javascript
hexToRgb('#0ea5e9')  // → "14,165,233"
hexToRgb('rgb(14, 165, 233)')  // → "14,165,233"
```

**Uso:**
```javascript
background: rgba(" + hexToRgb(getColorByType("primary").background) + ", 0.1);
// Resultado: rgba(14,165,233,0.1)
```

## 🔄 Integração com Sistema Existente

Os novos cards seguem o mesmo padrão das funções existentes:
- `generateDashCardBudget()`
- `generateCardTimeLine()`
- `generateMDashCardSnap()`

Podem ser usados em qualquer lugar que aceite HTML gerado dinamicamente:
- Dashboards MDash
- Reports MReport
- Custom Forms
- Modal dialogs
- Grid containers

## 🎨 Personalização

### Adicionar Novas Cores
```javascript
// No CSS (addDashboardStyles)
dashboardCSS += ".brd-card-advanced-icon-info{";
dashboardCSS += "background:linear-gradient(135deg,#17a2b8,#138496);";
dashboardCSS += "color:#ffffff;";
dashboardCSS += "}";
```

### Customizar Tamanhos
```javascript
var cardData = {
    // ... outros dados
    styles: 'min-height: 150px; max-width: 400px;'
};
```

### Adicionar Classes Customizadas
```javascript
var cardData = {
    // ... outros dados
    classes: 'my-custom-class shadow-lg'
};
```

## 📝 Notas Importantes

1. **Dependências**: Certifique-se de que Font Awesome está carregado para os ícones
2. **Bootstrap**: Cores são derivadas dos botões Bootstrap via `getColorByType()`
3. **Ordem de Carga**: O CSS é injetado no $(document).ready()
4. **IDs Únicos**: Use `generateUUID()` ou forneça IDs manuais
5. **MDashCard**: Sempre use a classe MDashCard para estruturar os dados

## 🐛 Troubleshooting

### Ícones não aparecem
- Verifique se Font Awesome está carregado
- Confirme a classe do ícone (ex: 'fas fa-chart-line')

### Cores não aplicam corretamente
- Verifique se Bootstrap está carregado antes do script
- Confirme que `getColorByType()` retorna cores válidas

### Cards não respondem
- Verifique breakpoints CSS
- Teste em diferentes viewports
- Confirme que não há CSS conflitante

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este README
2. Consulte o arquivo de exemplo: `brd-card-advanced-examples.html`
3. Revise o código em: `TEMPLATE DASHBOARD STANDARD EXTENSION.js`

---

**Autor**: Dashboard Template System  
**Versão**: 1.0  
**Data**: 2024  
**Compatibilidade**: ES5, Bootstrap 4/5, jQuery 3+

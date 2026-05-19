-- ══════════════════════════════════════════════════════════════════════════════
-- EXEMPLO: Configurar Filtros em Tabela MDash 2.0 com CORES PERSONALIZADAS
-- ══════════════════════════════════════════════════════════════════════════════

-- 🎨 EXEMPLO COM CORES: Aprovações Pendentes (TODOS, URGENTES, HOJE, ESTA SEMANA)
UPDATE mdashcontaineritemobject
SET configjson = '{
  "theme": "phcPrimary",
  "layout": "fitColumns",
  "height": "auto",
  "maxHeight": "500px",
  "stripedRows": true,
  "hoverHighlight": true,
  "pagination": {
    "enabled": true,
    "size": 15
  },
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
        "style": {
          "activeColor": "#8b5cf6"
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
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 2️⃣ EXEMPLO AVANÇADO: Filtros com múltiplas condições (AND/OR)
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "urgentes_pendentes",
        "label": "Urgentes Pendentes",
        "type": "button",
        "icon": "glyphicon-alert",
        "badge": {
          "enabled": true,
          "format": "({count})"
        },
        "conditions": [
          {
            "field": "prioridade",
            "operator": "eq",
            "value": "Urgente",
            "logic": "AND"
          },
          {
            "field": "estado",
            "operator": "eq",
            "value": "Pendente",
            "logic": "AND"
          }
        ]
      },
      {
        "key": "alta_ou_urgente",
        "label": "Alta/Urgente",
        "type": "button",
        "conditions": [
          {
            "field": "prioridade",
            "operator": "eq",
            "value": "Alta",
            "logic": "OR"
          },
          {
            "field": "prioridade",
            "operator": "eq",
            "value": "Urgente",
            "logic": "OR"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 3️⃣ EXEMPLO DATAS: Usando constantes TODAY, WEEK_START, etc.
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "criados_hoje",
        "label": "Criados Hoje",
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateEq",
            "value": "TODAY"
          }
        ]
      },
      {
        "key": "criados_esta_semana",
        "label": "Esta Semana",
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateGt",
            "value": "WEEK_START"
          }
        ]
      },
      {
        "key": "ultimos_7_dias",
        "label": "Últimos 7 Dias",
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateGt",
            "value": "LAST_7_DAYS"
          }
        ]
      },
      {
        "key": "mes_passado",
        "label": "Mês Passado",
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateGt",
            "value": "LAST_30_DAYS"
          },
          {
            "field": "data_criacao",
            "operator": "dateLt",
            "value": "TODAY",
            "logic": "AND"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 4️⃣ EXEMPLO NUMÉRICO: Valores, Quantidades
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "valor_alto",
        "label": "Valor > €1000",
        "icon": "glyphicon-euro",
        "conditions": [
          {
            "field": "valor_total",
            "operator": "gt",
            "value": "1000"
          }
        ]
      },
      {
        "key": "valor_baixo",
        "label": "Valor < €100",
        "conditions": [
          {
            "field": "valor_total",
            "operator": "lt",
            "value": "100"
          }
        ]
      },
      {
        "key": "quantidade_zero",
        "label": "Sem Stock",
        "conditions": [
          {
            "field": "quantidade",
            "operator": "lte",
            "value": "0"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 5️⃣ EXEMPLO TEXTO: Contém, Começa com
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "clientes_lisboa",
        "label": "Lisboa",
        "conditions": [
          {
            "field": "cidade",
            "operator": "eq",
            "value": "Lisboa"
          }
        ]
      },
      {
        "key": "nome_contem_silva",
        "label": "Nome c/ \"Silva\"",
        "conditions": [
          {
            "field": "nome",
            "operator": "contains",
            "value": "Silva"
          }
        ]
      },
      {
        "key": "codigo_comeca_FT",
        "label": "Faturas (FT*)",
        "conditions": [
          {
            "field": "documento",
            "operator": "startsWith",
            "value": "FT"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 6️⃣ EXEMPLO NULL: Campos vazios ou preenchidos
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "sem_observacoes",
        "label": "Sem Observações",
        "conditions": [
          {
            "field": "observacoes",
            "operator": "isNull"
          }
        ]
      },
      {
        "key": "com_email",
        "label": "Com Email",
        "conditions": [
          {
            "field": "email",
            "operator": "isNotNull"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 7️⃣ EXEMPLO LISTA: Operador IN (múltiplos valores)
-- NOTA: Para usar IN, o value deve ser um ARRAY (use aspas duplas no JSON)
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "estados_ativos",
        "label": "Ativos",
        "conditions": [
          {
            "field": "estado",
            "operator": "in",
            "value": ["Ativo", "Em Progresso", "Aprovado"]
          }
        ]
      },
      {
        "key": "prioridades_altas",
        "label": "Alta Prioridade",
        "conditions": [
          {
            "field": "prioridade",
            "operator": "in",
            "value": ["Alta", "Urgente", "Crítica"]
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 📋 VERIFICAR CONFIGURAÇÃO ATUAL
SELECT 
    mdashcontaineritemobjectstamp,
    nome,
    tipo,
    CAST(configjson AS VARCHAR(MAX)) as config
FROM mdashcontaineritemobject
WHERE tipo = 'table'
  AND nome LIKE '%sua_tabela%';

-- ══════════════════════════════════════════════════════════════════════════════

-- 🔧 ATIVAR FILTROS EM TABELA EXISTENTE (mantém config anterior)
UPDATE mdashcontaineritemobject
SET configjson = JSON_MODIFY(
    configjson,
    '$.filters',
    JSON_QUERY('{
      "enabled": true,
      "activeFilterKey": null,
      "definitions": []
    }')
)
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 🗑️ DESATIVAR FILTROS (mantém config, só desativa)
UPDATE mdashcontaineritemobject
SET configjson = JSON_MODIFY(configjson, '$.filters.enabled', 'false')
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 💡 DICAS:
-- 1. Substitua "SEU_STAMP_AQUI" pelo stamp real da sua tabela
-- 2. Substitua nomes de campos (prioridade, data_aprovacao, etc.) pelos campos reais dos seus dados
-- 3. Use as constantes de data: TODAY, YESTERDAY, WEEK_START, WEEK_END, LAST_7_DAYS, LAST_30_DAYS
-- 4. Use expressões JavaScript com "=" ou "row." para cálculos dinâmicos
-- 5. Para debug, abra Console do browser (F12) e procure por "[Table Filters]"
-- 6. Sempre teste com poucos filtros primeiro, depois adicione mais

-- ══════════════════════════════════════════════════════════════════════════════

-- 8️⃣ EXEMPLO EXPRESSÕES JAVASCRIPT: Cálculos Dinâmicos
-- NOTA: Valores podem ser expressões JavaScript que começam com "=" ou contêm "row."
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "valor_alto",
        "label": "Total > €1000",
        "icon": "glyphicon-euro",
        "badge": {"enabled": true, "format": "{count}"},
        "style": {"activeColor": "#10b981"},
        "conditions": [
          {
            "field": "total",
            "operator": "gt",
            "value": "=row.quantidade * row.preco_unitario"
          }
        ]
      },
      {
        "key": "margem_baixa",
        "label": "Margem < 20%",
        "icon": "glyphicon-stats",
        "style": {"activeColor": "#ef4444"},
        "conditions": [
          {
            "field": "margem_percentual",
            "operator": "lt",
            "value": "=((row.preco_venda - row.custo) / row.preco_venda) * 100"
          }
        ]
      },
      {
        "key": "stock_baixo",
        "label": "Stock Crítico",
        "icon": "glyphicon-warning-sign",
        "style": {"activeColor": "#f59e0b"},
        "conditions": [
          {
            "field": "stock_atual",
            "operator": "lt",
            "value": "=row.stock_minimo * 1.2"
          }
        ]
      },
      {
        "key": "desconto_alto",
        "label": "Desconto > 15%",
        "icon": "glyphicon-tag",
        "conditions": [
          {
            "field": "desconto",
            "operator": "gt",
            "value": "=row.preco * 0.15"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- ══════════════════════════════════════════════════════════════════════════════

-- 9️⃣ EXEMPLO VALORES PRÉ-DEFINIDOS: Usando Dropdown de Constantes e Personalizado
-- NOVO: Dropdown permite selecionar TODAY, WEEK_START, etc. ou Personalizado
UPDATE mdashcontaineritemobject
SET configjson = '{
  "filters": {
    "enabled": true,
    "definitions": [
      {
        "key": "criados_hoje",
        "label": "Criados Hoje",
        "icon": "glyphicon-calendar",
        "badge": {"enabled": true, "format": "{count}"},
        "style": {"activeColor": "#3b82f6"},
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateEq",
            "value": "TODAY"
          }
        ]
      },
      {
        "key": "esta_semana",
        "label": "Esta Semana",
        "icon": "glyphicon-time",
        "style": {"activeColor": "#10b981"},
        "conditions": [
          {
            "field": "data_criacao",
            "operator": "dateGt",
            "value": "WEEK_START"
          }
        ]
      },
      {
        "key": "ultimos_7_dias",
        "label": "Últimos 7 Dias",
        "icon": "glyphicon-calendar",
        "style": {"activeColor": "#8b5cf6"},
        "conditions": [
          {
            "field": "data_aprovacao",
            "operator": "dateGt",
            "value": "LAST_7_DAYS"
          }
        ]
      },
      {
        "key": "valor_calculado",
        "label": "Total > €500",
        "icon": "glyphicon-euro",
        "badge": {"enabled": true},
        "style": {"activeColor": "#f59e0b"},
        "conditions": [
          {
            "field": "total",
            "operator": "gt",
            "value": "=row.quantidade * row.preco_unitario"
          }
        ]
      }
    ]
  }
}'
WHERE mdashcontaineritemobjectstamp = 'SEU_STAMP_AQUI';

-- NOTA: No dropdown da interface:
-- • Constantes (TODAY, WEEK_START, etc.) são selecionadas direto no dropdown
-- • Expressões JavaScript (=row.campo * row.outro) requerem selecionar "Personalizado"
-- • Números simples também usam "Personalizado"

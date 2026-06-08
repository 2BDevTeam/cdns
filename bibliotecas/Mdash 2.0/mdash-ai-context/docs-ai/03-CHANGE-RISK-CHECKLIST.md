# Checklist de risco antes/depois de alterar MDash

## Antes de alterar
- A mudança é no builder, runtime, backend ou renderer?
- Existe campo novo? Se sim, precisa de SQL/VB/configData/runtime?
- Afeta `configjson`, `objectoConfig`, `slotsconfigjson` ou `fontesstampsjson`?
- Afeta `stamp`/identidade? Se sim, alto risco.
- Afeta preview e final? Testar ambos.

## Depois de alterar
Testar manualmente:
- Abrir dashboard existente.
- Abrir builder/configuração.
- Criar/editar container.
- Criar/editar item.
- Adicionar objeto.
- Mudar tab.
- Mudar filtro.
- Confirmar fonte com dados.
- Confirmar objeto estático `processaFonte=false`.
- Salvar e recarregar.
- Ver dashboard final em `Mdash.html`.

## Áreas de alto risco
- `Mdash.html` runtime.
- Pipeline de fontes/filtros.
- `slotsconfigjson`.
- Renderers de tabela/gráfico.
- SQL adapter.
- Scripts VB de configuração.

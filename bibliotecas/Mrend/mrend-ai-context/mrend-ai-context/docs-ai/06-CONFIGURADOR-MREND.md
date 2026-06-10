# 06 — Configurador MRend

## Ficheiro principal
- `Input/js/MRENDCONFIG LIB.js`

## Responsabilidade
Tela/configuração para criar e manter:
- Relatório
- Linhas
- Colunas
- Células
- Grupos de colunas
- Ligações/config inicial
- Import/export de configuração
- Reordenação/sortable

## Classes/funções importantes
- `LinhaMrenderConfig`
- `ColunaMrenderConfig`
- `CelulaMrenderConfig`
- `MrendGrupoColuna`
- `MrendGrupoColunaItem`
- `MrendInitConfig`
- `UIObjectFormConfig`
- `initTabelaConfiguracaoMrender`
- `renderConfigMrender`
- `fetchConfigMrender`
- `setLinhasConfigMrender`
- `addLinhaMrenderConfig`
- `addColunaMrenderConfig`
- `exportarConfiguracaoMrender`
- `importarConfiguracaoMrender`
- `regenerateMrendStamps`
- `actualizarConfiguracaoMrender`
- `makeColunasSortable`

## Quando mexer aqui
- Novo campo de configuração.
- Novo tipo de coluna disponível no formulário.
- Alteração do ecrã de configuração.
- Import/export não preserva campo.
- Reordenação de colunas/linhas.

## Regra
Se adicionares propriedade nova numa classe config, garantir:
1. Construtor recebe default.
2. UI form permite editar, se aplicável.
3. Export/import preserva.
4. Persistência PHC/SQL aceita o campo, se for coluna real.
5. Motor `MRend.js` lê a propriedade.

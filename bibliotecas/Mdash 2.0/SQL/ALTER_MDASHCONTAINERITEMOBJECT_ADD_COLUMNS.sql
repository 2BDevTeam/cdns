-- Adiciona colunas em falta à tabela MdashContainerItemObject
-- fontestamp   : vínculo directo à fonte de dados (MDashFonte)
-- slotid       : identificador do slot do template a que o objecto pertence
-- processaFonte: indica se o objecto precisa de dados de uma fonte (0 = não, 1 = sim/padrão)

ALTER TABLE MdashContainerItemObject
    ADD fontestamp VARCHAR(25) NOT NULL DEFAULT '';

ALTER TABLE MdashContainerItemObject
    ADD slotid VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE MdashContainerItemObject
    ADD processaFonte BIT NOT NULL DEFAULT 1;

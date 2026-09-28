ALTER TABLE funcionario
    ADD COLUMN data_desligamento TIMESTAMP WITH TIME ZONE;

ALTER TABLE funcionario
    ADD COLUMN motivo_desligamento VARCHAR(255);

ALTER TABLE funcionario
    ADD COLUMN desligado_por_id BIGINT;

ALTER TABLE funcionario
    ADD COLUMN desligado_por_nome VARCHAR(180);

ALTER TABLE funcionario
    ADD COLUMN data_desligamento TIMESTAMPTZ,
    ADD COLUMN motivo_desligamento VARCHAR(255),
    ADD COLUMN desligado_por_id BIGINT,
    ADD COLUMN desligado_por_nome VARCHAR(180);

ALTER TABLE funcionario
    ADD COLUMN data_admissao DATE;

UPDATE funcionario
SET data_admissao = CAST(criado_em AS DATE)
WHERE status_admissao = 'ATIVO';

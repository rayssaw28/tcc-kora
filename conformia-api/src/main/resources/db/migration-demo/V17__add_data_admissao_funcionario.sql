ALTER TABLE funcionario
    ADD COLUMN data_admissao DATE;

UPDATE funcionario
SET data_admissao = CASE email
    WHEN 'gregorio@conformia.demo' THEN DATE '2010-01-11'
    WHEN 'admin@korainc.com.br' THEN DATE '2016-03-14'
    WHEN 'patricia@conformia.demo' THEN DATE '2017-08-07'
    WHEN 'carlos@korainc.com.br' THEN DATE '2019-02-18'
    WHEN 'maria@korainc.com.br' THEN DATE '2021-05-10'
    WHEN 'pedro@korainc.com.br' THEN DATE '2023-01-16'
    WHEN 'ana@korainc.com.br' THEN DATE '2024-04-08'
    ELSE CAST(criado_em AS DATE)
END
WHERE status_admissao = 'ATIVO';


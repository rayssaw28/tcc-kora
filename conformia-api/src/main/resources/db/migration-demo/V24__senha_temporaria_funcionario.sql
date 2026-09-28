ALTER TABLE funcionario
    ADD COLUMN senha_temporaria BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE funcionario
SET senha_temporaria = TRUE
WHERE status_admissao = 'PRE_ADMISSAO';

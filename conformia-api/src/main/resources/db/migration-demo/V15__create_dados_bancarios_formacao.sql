CREATE TABLE funcionario_dados_bancarios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT NOT NULL UNIQUE,
    banco VARCHAR(120) NOT NULL,
    tipo_conta VARCHAR(30) NOT NULL,
    agencia VARCHAR(20) NOT NULL,
    conta VARCHAR(30) NOT NULL,
    chave_pix VARCHAR(180) NOT NULL,
    CONSTRAINT fk_dados_bancarios_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE TABLE funcionario_formacao_academica (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT NOT NULL,
    escolaridade VARCHAR(30) NOT NULL,
    instituicao_ensino VARCHAR(180) NOT NULL,
    curso VARCHAR(180) NOT NULL,
    ano_conclusao INTEGER NOT NULL,
    CONSTRAINT fk_formacao_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE INDEX idx_formacao_funcionario
    ON funcionario_formacao_academica (funcionario_id);

INSERT INTO funcionario_dados_bancarios (
    funcionario_id, banco, tipo_conta, agencia, conta, chave_pix
)
SELECT id, 'Banco Kora', 'CORRENTE', '0001', CONCAT('1000', id, '-0'), email
FROM funcionario;

INSERT INTO funcionario_formacao_academica (
    funcionario_id, escolaridade, instituicao_ensino, curso, ano_conclusao
)
SELECT id, 'GRADUACAO', 'Universidade Kora', 'Administracao', 2012
FROM funcionario
WHERE email = 'admin@korainc.com.br';

INSERT INTO funcionario_formacao_academica (
    funcionario_id, escolaridade, instituicao_ensino, curso, ano_conclusao
)
SELECT id, 'GRADUACAO', 'Universidade Estadual de Campinas', 'Ciencia da Computacao', 2010
FROM funcionario
WHERE email = 'carlos@korainc.com.br';

INSERT INTO funcionario_formacao_academica (
    funcionario_id, escolaridade, instituicao_ensino, curso, ano_conclusao
)
SELECT id, 'GRADUACAO', 'Faculdade de Tecnologia de Sao Paulo', 'Analise e Desenvolvimento de Sistemas', 2018
FROM funcionario
WHERE email = 'pedro@korainc.com.br';

INSERT INTO funcionario_formacao_academica (
    funcionario_id, escolaridade, instituicao_ensino, curso, ano_conclusao
)
SELECT id, 'GRADUACAO', 'Universidade Federal do Rio de Janeiro', 'Design', 2020
FROM funcionario
WHERE email = 'ana@korainc.com.br';

INSERT INTO funcionario_formacao_academica (
    funcionario_id, escolaridade, instituicao_ensino, curso, ano_conclusao
)
SELECT id, 'GRADUACAO', 'Universidade Federal de Minas Gerais', 'Psicologia', 2015
FROM funcionario
WHERE email = 'maria@korainc.com.br';

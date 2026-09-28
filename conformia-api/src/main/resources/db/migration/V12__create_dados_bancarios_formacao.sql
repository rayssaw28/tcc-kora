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

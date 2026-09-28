CREATE TABLE notificacao_funcionario (
    id             BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT       NOT NULL,
    titulo         VARCHAR(120) NOT NULL,
    descricao      VARCHAR(255) NOT NULL,
    aba            VARCHAR(40)  NOT NULL,
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_notificacao_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE INDEX idx_notificacao_funcionario ON notificacao_funcionario (funcionario_id, ativo, criado_em);

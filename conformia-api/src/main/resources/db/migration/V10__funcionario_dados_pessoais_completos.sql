ALTER TABLE funcionario ADD COLUMN uf_natal VARCHAR(2);
ALTER TABLE funcionario ADD COLUMN cidade_natal VARCHAR(120);
ALTER TABLE funcionario ADD COLUMN genero VARCHAR(20);
ALTER TABLE funcionario ADD COLUMN nome_social VARCHAR(180);
ALTER TABLE funcionario ADD COLUMN estado_civil VARCHAR(30);

CREATE TABLE funcionario_nacionalidade (
    funcionario_id BIGINT NOT NULL,
    pais VARCHAR(100) NOT NULL,
    CONSTRAINT pk_funcionario_nacionalidade PRIMARY KEY (funcionario_id, pais),
    CONSTRAINT fk_nacionalidade_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE TABLE funcionario_historico (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT NOT NULL,
    alterado_por_id BIGINT NOT NULL,
    alterado_por_nome VARCHAR(180) NOT NULL,
    campo VARCHAR(60) NOT NULL,
    valor_anterior VARCHAR(1000),
    valor_novo VARCHAR(1000),
    alterado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_historico_funcionario
        FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);

CREATE INDEX idx_historico_funcionario
    ON funcionario_historico (funcionario_id, alterado_em);

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

UPDATE funcionario SET
    telefone = '11911111111',
    data_nascimento = DATE '1985-05-20',
    uf_natal = 'SP',
    cidade_natal = 'São Paulo',
    genero = 'OUTRO',
    estado_civil = 'CASADO'
WHERE email = 'admin@korainc.com.br';

UPDATE funcionario SET
    telefone = '11922222222',
    data_nascimento = DATE '1988-03-12',
    uf_natal = 'SP',
    cidade_natal = 'Campinas',
    genero = 'HOMEM',
    estado_civil = 'CASADO'
WHERE email = 'carlos@korainc.com.br';

UPDATE funcionario SET
    telefone = '11933333333',
    data_nascimento = DATE '1995-07-08',
    uf_natal = 'SP',
    cidade_natal = 'Santos',
    genero = 'HOMEM',
    estado_civil = 'SOLTEIRO'
WHERE email = 'pedro@korainc.com.br';

UPDATE funcionario SET
    telefone = '11944444444',
    data_nascimento = DATE '1997-09-16',
    uf_natal = 'RJ',
    cidade_natal = 'Rio de Janeiro',
    genero = 'MULHER',
    estado_civil = 'SOLTEIRO'
WHERE email = 'ana@korainc.com.br';

UPDATE funcionario SET
    telefone = '11955555555',
    data_nascimento = DATE '1992-11-25',
    uf_natal = 'MG',
    cidade_natal = 'Belo Horizonte',
    genero = 'MULHER',
    estado_civil = 'UNIAO_ESTAVEL'
WHERE email = 'maria@korainc.com.br';

INSERT INTO funcionario_nacionalidade (funcionario_id, pais)
SELECT id, 'Brasil' FROM funcionario;

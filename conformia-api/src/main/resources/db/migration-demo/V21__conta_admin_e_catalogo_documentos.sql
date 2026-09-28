ALTER TABLE cargo ADD COLUMN lider_direto_id BIGINT;
ALTER TABLE cargo ADD CONSTRAINT fk_cargo_lider_direto
    FOREIGN KEY (lider_direto_id) REFERENCES funcionario (id);
ALTER TABLE cargo DROP COLUMN nivel_hierarquico;

CREATE TABLE requisito_documento (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL UNIQUE,
    tipo VARCHAR(40) NOT NULL,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO requisito_documento (titulo, tipo, descricao)
VALUES
    ('CPF', 'CPF', 'Documento de identificacao fiscal.'),
    ('Carteira de Trabalho', 'CARTEIRA_TRABALHO', 'Dados e anexo da CTPS.'),
    ('Comprovante de residencia', 'COMPROVANTE_RESIDENCIA', 'Comprovante de endereco atualizado.');

ALTER TABLE documento ADD COLUMN requisito_id BIGINT;
ALTER TABLE documento ADD CONSTRAINT fk_documento_requisito
    FOREIGN KEY (requisito_id) REFERENCES requisito_documento (id);

UPDATE documento
SET requisito_id = (
    SELECT MIN(id)
    FROM requisito_documento r
    WHERE (documento.tipo = r.tipo AND documento.tipo <> 'OUTRO')
       OR (documento.tipo = 'OUTRO' AND LOWER(documento.titulo_personalizado) = LOWER(r.titulo))
);

UPDATE funcionario
SET gestor_id = NULL, cargo_id = NULL, departamento_id = NULL
WHERE perfil = 'ADMIN';

CREATE INDEX idx_cargo_lider_direto ON cargo (lider_direto_id);
CREATE INDEX idx_documento_requisito ON documento (requisito_id);

-- ============================================================================
-- V4 - Documentos (RF04) e Holerites (RF08).
-- RNF05: o banco guarda apenas o caminho do arquivo (os bytes ficam em disco).
-- ============================================================================

CREATE TABLE documento (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT      NOT NULL,
    tipo          VARCHAR(40)  NOT NULL,
    nome_arquivo  VARCHAR(255) NOT NULL,
    caminho       VARCHAR(512) NOT NULL,
    content_type  VARCHAR(120),
    tamanho_bytes BIGINT       NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_documento_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);
CREATE INDEX idx_documento_funcionario ON documento (funcionario_id);

CREATE TABLE holerite (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT      NOT NULL,
    mes           INTEGER      NOT NULL,
    ano           INTEGER      NOT NULL,
    nome_arquivo  VARCHAR(255) NOT NULL,
    caminho       VARCHAR(512) NOT NULL,
    content_type  VARCHAR(120),
    tamanho_bytes BIGINT       NOT NULL,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT fk_holerite_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id),
    CONSTRAINT uk_holerite_competencia UNIQUE (funcionario_id, ano, mes)
);
CREATE INDEX idx_holerite_funcionario ON holerite (funcionario_id);

-- ============================================================================
-- V6 - Atestados mÃ©dicos (RF10): funcionÃ¡rio anexa p/ justificar faltas.
-- RNF05: bytes em disco; aqui sÃ³ metadados + perÃ­odo coberto + status do RH.
-- ============================================================================

CREATE TABLE atestado (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT      NOT NULL,
    data_inicio   DATE         NOT NULL,
    data_fim      DATE         NOT NULL,
    observacao    VARCHAR(255),
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    nome_arquivo  VARCHAR(255) NOT NULL,
    caminho       VARCHAR(512) NOT NULL,
    content_type  VARCHAR(120),
    tamanho_bytes BIGINT       NOT NULL,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
    CONSTRAINT fk_atestado_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);
CREATE INDEX idx_atestado_funcionario ON atestado (funcionario_id);


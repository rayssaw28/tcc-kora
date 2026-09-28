-- ============================================================================
-- V8 - Benefícios associados ao funcionário (RF07). Gerenciado pelo RH.
-- ============================================================================

CREATE TABLE beneficio (
    id            BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT       NOT NULL,
    tipo          VARCHAR(40)   NOT NULL,
    valor         NUMERIC(12,2),
    descricao     VARCHAR(255),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT fk_beneficio_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);
CREATE INDEX idx_beneficio_funcionario ON beneficio (funcionario_id);

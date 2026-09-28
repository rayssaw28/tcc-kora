-- ============================================================================
-- V9 - Consentimento LGPD do titular (RF12). Log append-only de aceite/revogaÃ§Ã£o.
-- ============================================================================

CREATE TABLE consentimento_lgpd (
    id            BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id BIGINT     NOT NULL,
    versao_termo  VARCHAR(20) NOT NULL,
    aceito        BOOLEAN     NOT NULL,
    ip_origem     VARCHAR(64),
    registrado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_consentimento_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id)
);
CREATE INDEX idx_consentimento_funcionario ON consentimento_lgpd (funcionario_id);


-- ============================================================================
-- V7 - AvaliaÃ§Ã£o de desempenho (RF11): formulÃ¡rio (cabeÃ§alho + itens).
-- ============================================================================

CREATE TABLE avaliacao_desempenho (
    id               BIGINT        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    avaliado_id      BIGINT        NOT NULL,
    avaliador_id     BIGINT        NOT NULL,
    periodo          VARCHAR(20)   NOT NULL,
    comentario_geral VARCHAR(1000),
    nota_final       DOUBLE PRECISION,
    status           VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO',
    ativo            BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em        TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
    atualizado_em    TIMESTAMP WITH TIME ZONE   NOT NULL DEFAULT now(),
    CONSTRAINT fk_avaliacao_avaliado  FOREIGN KEY (avaliado_id)  REFERENCES funcionario (id),
    CONSTRAINT fk_avaliacao_avaliador FOREIGN KEY (avaliador_id) REFERENCES funcionario (id)
);
CREATE INDEX idx_avaliacao_avaliado ON avaliacao_desempenho (avaliado_id);

CREATE TABLE avaliacao_item (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    avaliacao_id  BIGINT       NOT NULL,
    criterio      VARCHAR(120) NOT NULL,
    nota          INTEGER      NOT NULL,
    comentario    VARCHAR(500),
    CONSTRAINT fk_item_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacao_desempenho (id)
);
CREATE INDEX idx_avaliacao_item_avaliacao ON avaliacao_item (avaliacao_id);


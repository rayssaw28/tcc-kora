-- ============================================================================
-- V5 - Espelho de ponto mensal consolidado (RF09), recebido de sistema terceiro.
-- Saldo/extras/faltantes/classificaÃ§Ã£o sÃ£o derivados no recebimento (CalculoHoras).
-- ============================================================================

CREATE TABLE espelho_ponto (
    id                        BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    funcionario_id            BIGINT      NOT NULL,
    ano                       INTEGER     NOT NULL,
    mes                       INTEGER     NOT NULL,
    dias_uteis                INTEGER,
    horas_previstas_minutos   INTEGER     NOT NULL,
    horas_trabalhadas_minutos INTEGER     NOT NULL,
    saldo_minutos             INTEGER     NOT NULL,
    horas_extras_minutos      INTEGER     NOT NULL,
    horas_faltantes_minutos   INTEGER     NOT NULL,
    classificacao             VARCHAR(20) NOT NULL,
    origem                    VARCHAR(120),
    ativo                     BOOLEAN     NOT NULL DEFAULT TRUE,
    criado_em                 TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT fk_espelho_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionario (id),
    CONSTRAINT uk_espelho_competencia UNIQUE (funcionario_id, ano, mes)
);
CREATE INDEX idx_espelho_funcionario ON espelho_ponto (funcionario_id);


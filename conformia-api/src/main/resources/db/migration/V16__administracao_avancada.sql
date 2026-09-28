ALTER TABLE documento ADD COLUMN motivo_reprovacao VARCHAR(255);
ALTER TABLE atestado ADD COLUMN motivo_reprovacao VARCHAR(255);

CREATE TABLE termo_lgpd (
    id            BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    versao        VARCHAR(20)  NOT NULL,
    url           VARCHAR(500) NOT NULL,
    publicado_em  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_termo_lgpd_versao UNIQUE (versao)
);

INSERT INTO termo_lgpd (versao, url, publicado_em)
VALUES ('v2.0', 'https://example.com/?termo-lgpd=kora-v2', TIMESTAMPTZ '2026-06-10 09:00:00-03:00');

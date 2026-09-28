ALTER TABLE funcionario ADD COLUMN ctps_numero VARCHAR(30);
ALTER TABLE funcionario ADD COLUMN ctps_serie VARCHAR(20);
ALTER TABLE funcionario ADD COLUMN ctps_uf_emissor VARCHAR(2);
ALTER TABLE funcionario ADD COLUMN pis VARCHAR(11);
ALTER TABLE funcionario ADD COLUMN ctps_digital BOOLEAN;

UPDATE funcionario SET
    ctps_numero = CONCAT('CTPS-', id),
    ctps_serie = '001',
    ctps_uf_emissor = COALESCE(uf_natal, 'SP'),
    pis = CONCAT('120000000', RIGHT(CONCAT('00', id), 2)),
    ctps_digital = TRUE;

INSERT INTO documento (
    funcionario_id, tipo, nome_arquivo, caminho, content_type, tamanho_bytes, status
)
SELECT id, 'CARTEIRA_TRABALHO', 'carteira-trabalho.pdf',
       'demo/documentos/carteira-trabalho.pdf',
       'application/pdf', 176128, 'APROVADO'
FROM funcionario;

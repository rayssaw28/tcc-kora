ALTER TABLE documento
    ADD COLUMN titulo_personalizado VARCHAR(120);

UPDATE documento
SET tipo = 'OUTRO',
    titulo_personalizado = 'RG'
WHERE tipo = 'RG';

ALTER TABLE cargo
    ADD COLUMN departamento_id BIGINT;

ALTER TABLE cargo
    ADD COLUMN nivel_hierarquico INTEGER DEFAULT 1 NOT NULL;

ALTER TABLE cargo
    ADD CONSTRAINT fk_cargo_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento (id);

UPDATE cargo c
SET departamento_id = (
    SELECT MIN(f.departamento_id)
    FROM funcionario f
    WHERE f.cargo_id = c.id
      AND f.departamento_id IS NOT NULL
)
WHERE c.departamento_id IS NULL;

UPDATE cargo
SET departamento_id = (SELECT MIN(id) FROM departamento)
WHERE departamento_id IS NULL;

UPDATE cargo
SET nivel_hierarquico = CASE
    WHEN LOWER(nome) LIKE '%ceo%' OR LOWER(nome) LIKE '%presidente%' THEN 1
    WHEN LOWER(nome) LIKE '%diretor%' THEN 2
    WHEN LOWER(nome) LIKE '%gestor%' OR LOWER(nome) LIKE '%gerente%' THEN 3
    WHEN LOWER(nome) LIKE '%coordenador%' OR LOWER(nome) LIKE '%lider%' THEN 4
    ELSE 5
END;

CREATE INDEX idx_cargo_departamento ON cargo (departamento_id);

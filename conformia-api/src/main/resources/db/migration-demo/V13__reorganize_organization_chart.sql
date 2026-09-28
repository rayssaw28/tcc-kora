-- ============================================================================
-- V13 - Reorganização executiva do organograma demo.
--
-- Gregório Alfredo (CEO)
--   |- Administrador RH (Diretor de Pessoas e Performance)
--   |    `- Maria (Analista de RH)
--   `- Patrícia Marfim (Diretora de Tecnologia)
--        `- Carlos (Gerente de Engenharia)
--             |- Pedro
--             `- Ana
-- ============================================================================

MERGE INTO departamento (nome, descricao, ativo)
KEY (nome)
VALUES ('Presidência', 'Direção geral e estratégia corporativa.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('CEO', 'Responsável pela direção executiva da companhia.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Diretora de Tecnologia', 'Responsável pela estratégia e operação de tecnologia.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES (
    'Diretor de Pessoas e Performance',
    'Responsável por pessoas, cultura e performance organizacional.',
    TRUE
);

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo,
    telefone, data_nascimento, uf_natal, cidade_natal, genero, estado_civil,
    departamento_id, cargo_id, gestor_id
)
KEY (email)
VALUES (
    'Gregório Alfredo',
    '55555555555',
    'gregorio@conformia.demo',
    '$2a$10$WpgxiyrZUhP0WNJn3gbYCes6I9ZFncAPoNzaDZIZ.jCp0aZt3z6yO',
    'ADMIN',
    'ATIVO',
    TRUE,
    '11966666666',
    DATE '1978-02-14',
    'SP',
    'São Paulo',
    'HOMEM',
    'CASADO',
    (SELECT id FROM departamento WHERE nome = 'Presidência'),
    (SELECT id FROM cargo WHERE nome = 'CEO'),
    NULL
);

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo,
    telefone, data_nascimento, uf_natal, cidade_natal, genero, estado_civil,
    departamento_id, cargo_id, gestor_id
)
KEY (email)
VALUES (
    'Patrícia Marfim',
    '66666666666',
    'patricia@conformia.demo',
    '$2a$10$WpgxiyrZUhP0WNJn3gbYCes6I9ZFncAPoNzaDZIZ.jCp0aZt3z6yO',
    'GESTOR',
    'ATIVO',
    TRUE,
    '11977777777',
    DATE '1982-08-21',
    'SP',
    'São Paulo',
    'MULHER',
    'CASADO',
    (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    (SELECT id FROM cargo WHERE nome = 'Diretora de Tecnologia'),
    (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
);

INSERT INTO funcionario_nacionalidade (funcionario_id, pais)
SELECT id, 'Brasil'
FROM funcionario
WHERE email IN ('gregorio@conformia.demo', 'patricia@conformia.demo');

UPDATE funcionario SET
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Diretor de Pessoas e Performance'),
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Pessoas e Cultura'),
    gestor_id = (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
WHERE email = 'admin@korainc.com.br';

UPDATE funcionario SET
    gestor_id = (SELECT id FROM funcionario WHERE email = 'patricia@conformia.demo')
WHERE email = 'carlos@korainc.com.br';

UPDATE funcionario SET
    gestor_id = (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br')
WHERE email = 'maria@korainc.com.br';

UPDATE avaliacao_desempenho SET
    avaliador_id = (SELECT id FROM funcionario WHERE email = 'patricia@conformia.demo')
WHERE avaliado_id = (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br');

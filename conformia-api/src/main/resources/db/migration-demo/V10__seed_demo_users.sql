-- ============================================================================
-- V10 - Usuarios e hierarquia para demonstracao dos perfis e da RN01.
--
-- Hierarquia:
-- Administrador RH
--   |- Carlos Bueno Santos
--   |    `- Pedro Teixeira Rodrigues
--   |         `- Ana Paula Garcia
--   `- Maria Eloisa Neves
-- ============================================================================

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo, gestor_id
)
KEY (email)
VALUES (
    'Carlos Bueno Santos',
    '11111111111',
    'carlos@korainc.com.br',
    '$2a$10$oa14sPGEnR7hmFyXeoO3auDyIH/4o22yyybo.vscIRr0MLHx62MOO',
    'GESTOR',
    'ATIVO',
    TRUE,
    (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br')
);

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo, gestor_id
)
KEY (email)
VALUES (
    'Pedro Teixeira Rodrigues',
    '22222222222',
    'pedro@korainc.com.br',
    '$2a$10$PI3sH.J.bwR5HpYAWwy6Y.Q.jM9HkgjGk/AIaqdWyTT1x9BsOyEge',
    'FUNCIONARIO',
    'ATIVO',
    TRUE,
    (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br')
);

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo, gestor_id
)
KEY (email)
VALUES (
    'Ana Paula Garcia',
    '33333333333',
    'ana@korainc.com.br',
    '$2a$10$9pZm5zPXW6m/E740OiqegOuAIbhSd94g3jkBs0u1B0tb9WAyhfwZq',
    'FUNCIONARIO',
    'ATIVO',
    TRUE,
    (SELECT id FROM funcionario WHERE email = 'pedro@korainc.com.br')
);

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo, gestor_id
)
KEY (email)
VALUES (
    'Maria Eloisa Neves',
    '44444444444',
    'maria@korainc.com.br',
    '$2a$10$f.7HOrgYqlhWp3UDdFZmYOQbAWJv9N3wThJwtGzEb3y/xpQhhNOE6',
    'FUNCIONARIO',
    'ATIVO',
    TRUE,
    (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br')
);

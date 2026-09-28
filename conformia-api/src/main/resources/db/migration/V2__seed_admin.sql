-- ============================================================================
-- V2 - Usuário administrador (RH) inicial para bootstrap do sistema (RF01).
-- Senha em texto puro: Admin@123  (hash BCrypt abaixo) -> TROCAR após o 1º login.
-- ============================================================================

INSERT INTO funcionario (nome, cpf, email, senha_hash, perfil, status_admissao, ativo)
VALUES (
    'Administrador RH',
    '00000000000',
    'admin@conformia.com',
    '$2a$10$WpgxiyrZUhP0WNJn3gbYCes6I9ZFncAPoNzaDZIZ.jCp0aZt3z6yO',
    'ADMIN',
    'ATIVO',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

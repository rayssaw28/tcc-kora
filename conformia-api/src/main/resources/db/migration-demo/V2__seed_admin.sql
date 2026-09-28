-- ============================================================================
-- V2 - UsuÃ¡rio administrador (RH) inicial para bootstrap do sistema (RF01).
-- Senha em texto puro: Admin@123  (hash BCrypt abaixo) -> TROCAR apÃ³s o 1Âº login.
-- ============================================================================

MERGE INTO funcionario (nome, cpf, email, senha_hash, perfil, status_admissao, ativo)
KEY (email)
VALUES (
    'Administrador RH',
    '00000000000',
    'admin@korainc.com.br',
    '$2a$10$WpgxiyrZUhP0WNJn3gbYCes6I9ZFncAPoNzaDZIZ.jCp0aZt3z6yO',
    'ADMIN',
    'ATIVO',
    TRUE
);


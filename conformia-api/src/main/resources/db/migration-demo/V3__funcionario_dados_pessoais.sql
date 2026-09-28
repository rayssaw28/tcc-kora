-- ============================================================================
-- V3 - Dados pessoais preenchidos pelo funcionÃ¡rio na prÃ©-admissÃ£o (RF03).
-- Colunas opcionais; tornam-se obrigatÃ³rias apenas no momento de submeter.
-- ============================================================================

ALTER TABLE funcionario ADD COLUMN telefone        VARCHAR(20);
ALTER TABLE funcionario ADD COLUMN data_nascimento DATE;


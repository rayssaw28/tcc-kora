-- ============================================================================
-- V3 - Dados pessoais preenchidos pelo funcionário na pré-admissão (RF03).
-- Colunas opcionais; tornam-se obrigatórias apenas no momento de submeter.
-- ============================================================================

ALTER TABLE funcionario ADD COLUMN telefone        VARCHAR(20);
ALTER TABLE funcionario ADD COLUMN data_nascimento DATE;

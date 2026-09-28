-- ============================================================================
-- V1 - Schema inicial do Conformia
-- Tabelas base: departamento, cargo, funcionario
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DEPARTAMENTO
-- ----------------------------------------------------------------------------
CREATE TABLE departamento (
    id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    descricao   VARCHAR(255),
    -- RN02 (Soft Delete): registros nÃ£o sÃ£o apagados, apenas marcados como inativos.
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uk_departamento_nome UNIQUE (nome)
);

-- ----------------------------------------------------------------------------
-- CARGO
-- ----------------------------------------------------------------------------
CREATE TABLE cargo (
    id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    descricao   VARCHAR(255),
    -- RN02 (Soft Delete)
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uk_cargo_nome UNIQUE (nome)
);

-- ----------------------------------------------------------------------------
-- FUNCIONARIO
-- Inclui credenciais de login, papel de acesso, status de admissÃ£o (RN03),
-- soft delete (RN02) e a auto-referÃªncia de gestor para a Ã¡rvore de
-- subordinaÃ§Ã£o (base da RN01 - Isolamento de Dados).
-- ----------------------------------------------------------------------------
CREATE TABLE funcionario (
    id              BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome            VARCHAR(180) NOT NULL,
    cpf             VARCHAR(11)  NOT NULL,

    -- Credenciais de login
    email           VARCHAR(180) NOT NULL,
    senha_hash      VARCHAR(100) NOT NULL,            -- senha criptografada com BCrypt

    -- Papel de acesso: ADMIN (RH), GESTOR, FUNCIONARIO
    perfil          VARCHAR(20)  NOT NULL DEFAULT 'FUNCIONARIO',

    -- RN03: fluxo de admissÃ£o. FuncionÃ¡rio sÃ³ fica ATIVO apÃ³s RH aprovar documentos.
    status_admissao VARCHAR(30)  NOT NULL DEFAULT 'PRE_ADMISSAO',

    -- RN02 (Soft Delete): desligamento marca ativo = false, preservando histÃ³rico.
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Relacionamentos
    departamento_id BIGINT,
    cargo_id        BIGINT,
    gestor_id       BIGINT,                            -- auto-referÃªncia (hierarquia / RN01)

    criado_em       TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),

    -- Unicidade de credenciais / documento
    CONSTRAINT uk_funcionario_email UNIQUE (email),
    CONSTRAINT uk_funcionario_cpf   UNIQUE (cpf),

    -- Chaves estrangeiras
    CONSTRAINT fk_funcionario_departamento FOREIGN KEY (departamento_id) REFERENCES departamento (id),
    CONSTRAINT fk_funcionario_cargo        FOREIGN KEY (cargo_id)        REFERENCES cargo (id),
    CONSTRAINT fk_funcionario_gestor       FOREIGN KEY (gestor_id)       REFERENCES funcionario (id)
);

-- ----------------------------------------------------------------------------
-- Ãndices de apoio Ã s consultas mais frequentes
-- ----------------------------------------------------------------------------
CREATE INDEX idx_funcionario_gestor        ON funcionario (gestor_id);
CREATE INDEX idx_funcionario_departamento  ON funcionario (departamento_id);
CREATE INDEX idx_funcionario_cargo         ON funcionario (cargo_id);
CREATE INDEX idx_funcionario_ativo         ON funcionario (ativo);


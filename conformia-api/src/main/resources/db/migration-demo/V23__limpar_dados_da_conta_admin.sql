-- A conta ADMIN e operacional: nao representa um colaborador da empresa.
DELETE FROM avaliacao_item
WHERE avaliacao_id IN (
    SELECT avaliacao.id
    FROM avaliacao_desempenho avaliacao
    JOIN funcionario avaliado ON avaliado.id = avaliacao.avaliado_id
    JOIN funcionario avaliador ON avaliador.id = avaliacao.avaliador_id
    WHERE avaliado.perfil = 'ADMIN' OR avaliador.perfil = 'ADMIN'
);

DELETE FROM avaliacao_desempenho
WHERE avaliado_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN')
   OR avaliador_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM documento
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM holerite
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM espelho_ponto
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM atestado
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM beneficio
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM consentimento_lgpd
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM funcionario_dados_bancarios
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM funcionario_formacao_academica
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM funcionario_nacionalidade
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

DELETE FROM funcionario_historico
WHERE funcionario_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

UPDATE cargo
SET lider_direto_id = NULL
WHERE lider_direto_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

UPDATE funcionario
SET gestor_id = NULL
WHERE gestor_id IN (SELECT id FROM funcionario WHERE perfil = 'ADMIN');

UPDATE funcionario
SET telefone = NULL,
    data_nascimento = NULL,
    data_admissao = NULL,
    uf_natal = NULL,
    cidade_natal = NULL,
    genero = NULL,
    nome_social = NULL,
    estado_civil = NULL,
    ctps_numero = NULL,
    ctps_serie = NULL,
    ctps_uf_emissor = NULL,
    pis = NULL,
    ctps_digital = NULL,
    departamento_id = NULL,
    cargo_id = NULL,
    gestor_id = NULL
WHERE perfil = 'ADMIN';

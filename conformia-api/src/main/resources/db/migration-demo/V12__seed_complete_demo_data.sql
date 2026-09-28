-- ============================================================================
-- V12 - Cenario completo para demonstracao do aplicativo.
-- ============================================================================

-- Estrutura organizacional
MERGE INTO departamento (nome, descricao, ativo)
KEY (nome)
VALUES ('Diretoria', 'Direção executiva e estratégia da empresa.', TRUE);

MERGE INTO departamento (nome, descricao, ativo)
KEY (nome)
VALUES ('Tecnologia', 'Engenharia de software e infraestrutura.', TRUE);

MERGE INTO departamento (nome, descricao, ativo)
KEY (nome)
VALUES ('Produto e Design', 'Descoberta, experiência e evolução do produto.', TRUE);

MERGE INTO departamento (nome, descricao, ativo)
KEY (nome)
VALUES ('Pessoas e Cultura', 'Operações de RH e desenvolvimento humano.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Diretora de Pessoas', 'Responsável pela estratégia de pessoas e cultura.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Gerente de Engenharia', 'Liderança técnica e gestão de entregas.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Desenvolvedor de Software', 'Desenvolvimento e manutenção das soluções.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Designer de Produto', 'Pesquisa, UX e interface do produto.', TRUE);

MERGE INTO cargo (nome, descricao, ativo)
KEY (nome)
VALUES ('Analista de RH', 'Atendimento aos colaboradores e rotinas de RH.', TRUE);

UPDATE funcionario SET
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Diretoria'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Diretora de Pessoas'),
    gestor_id = NULL
WHERE email = 'admin@korainc.com.br';

UPDATE funcionario SET
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Gerente de Engenharia'),
    gestor_id = (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br')
WHERE email = 'carlos@korainc.com.br';

UPDATE funcionario SET
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Desenvolvedor de Software'),
    gestor_id = (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br')
WHERE email = 'pedro@korainc.com.br';

UPDATE funcionario SET
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Produto e Design'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Designer de Produto'),
    gestor_id = (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br')
WHERE email = 'ana@korainc.com.br';

UPDATE funcionario SET
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Pessoas e Cultura'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'Analista de RH'),
    gestor_id = (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br')
WHERE email = 'maria@korainc.com.br';

-- Documentos: dois aprovados e um pendente por colaborador.
INSERT INTO documento (
    funcionario_id, tipo, nome_arquivo, caminho, content_type, tamanho_bytes, status
)
SELECT id, 'RG', 'rg.pdf', 'demo/documentos/rg.pdf', 'application/pdf', 184320, 'APROVADO'
FROM funcionario;

INSERT INTO documento (
    funcionario_id, tipo, nome_arquivo, caminho, content_type, tamanho_bytes, status
)
SELECT id, 'CPF', 'cpf.pdf', 'demo/documentos/cpf.pdf', 'application/pdf', 126976, 'APROVADO'
FROM funcionario;

INSERT INTO documento (
    funcionario_id, tipo, nome_arquivo, caminho, content_type, tamanho_bytes, status
)
SELECT id, 'COMPROVANTE_RESIDENCIA', 'comprovante-residencia-maio-2026.pdf',
       'demo/documentos/comprovante-residencia-maio-2026.pdf',
       'application/pdf', 231424, 'PENDENTE'
FROM funcionario;

-- Holerites recentes.
INSERT INTO holerite (
    funcionario_id, mes, ano, nome_arquivo, caminho, content_type, tamanho_bytes
)
SELECT id, 4, 2026, 'holerite-04-2026.pdf',
       'demo/holerites/holerite-04-2026.pdf', 'application/pdf', 94208
FROM funcionario;

INSERT INTO holerite (
    funcionario_id, mes, ano, nome_arquivo, caminho, content_type, tamanho_bytes
)
SELECT id, 5, 2026, 'holerite-05-2026.pdf',
       'demo/holerites/holerite-05-2026.pdf', 'application/pdf', 98304
FROM funcionario;

-- Benefícios comuns.
INSERT INTO beneficio (funcionario_id, tipo, valor, descricao)
SELECT id, 'VALE_REFEICAO', 880.00, 'Crédito mensal no cartão de benefícios.'
FROM funcionario;

INSERT INTO beneficio (funcionario_id, tipo, valor, descricao)
SELECT id, 'PLANO_SAUDE', 0.00, 'Plano de saúde empresarial com cobertura nacional.'
FROM funcionario;

INSERT INTO beneficio (funcionario_id, tipo, valor, descricao)
SELECT id, 'SEGURO_VIDA', 0.00, 'Seguro de vida coletivo custeado pela empresa.'
FROM funcionario;

INSERT INTO beneficio (funcionario_id, tipo, valor, descricao)
SELECT id, 'VALE_TRANSPORTE', 240.00, 'Auxílio para deslocamento ao escritório.'
FROM funcionario
WHERE email IN ('pedro@korainc.com.br', 'ana@korainc.com.br', 'maria@korainc.com.br');

-- Espelhos de ponto de abril e maio de 2026.
INSERT INTO espelho_ponto (
    funcionario_id, ano, mes, dias_uteis,
    horas_previstas_minutos, horas_trabalhadas_minutos,
    saldo_minutos, horas_extras_minutos, horas_faltantes_minutos,
    classificacao, origem
)
SELECT id, 2026, 4, 20, 9600, 9720, 120, 120, 0, 'POSITIVO', 'Ponto Kora'
FROM funcionario;

INSERT INTO espelho_ponto (
    funcionario_id, ano, mes, dias_uteis,
    horas_previstas_minutos, horas_trabalhadas_minutos,
    saldo_minutos, horas_extras_minutos, horas_faltantes_minutos,
    classificacao, origem
)
SELECT id, 2026, 5, 21, 10080,
       CASE email
           WHEN 'admin@korainc.com.br' THEN 10080
           WHEN 'carlos@korainc.com.br' THEN 10230
           WHEN 'pedro@korainc.com.br' THEN 10140
           WHEN 'ana@korainc.com.br' THEN 9990
           ELSE 10020
       END,
       CASE email
           WHEN 'admin@korainc.com.br' THEN 0
           WHEN 'carlos@korainc.com.br' THEN 150
           WHEN 'pedro@korainc.com.br' THEN 60
           WHEN 'ana@korainc.com.br' THEN -90
           ELSE -60
       END,
       CASE email
           WHEN 'carlos@korainc.com.br' THEN 150
           WHEN 'pedro@korainc.com.br' THEN 60
           ELSE 0
       END,
       CASE email
           WHEN 'ana@korainc.com.br' THEN 90
           WHEN 'maria@korainc.com.br' THEN 60
           ELSE 0
       END,
       CASE email
           WHEN 'admin@korainc.com.br' THEN 'NEUTRO'
           WHEN 'carlos@korainc.com.br' THEN 'POSITIVO'
           WHEN 'pedro@korainc.com.br' THEN 'POSITIVO'
           ELSE 'NEGATIVO'
       END,
       'Ponto Kora'
FROM funcionario;

-- Atestados em situações diferentes para demonstrar os status.
INSERT INTO atestado (
    funcionario_id, data_inicio, data_fim, observacao, status,
    nome_arquivo, caminho, content_type, tamanho_bytes
)
SELECT id, DATE '2026-03-10', DATE '2026-03-11',
       'Afastamento médico de dois dias.', 'APROVADO',
       'atestado-marco-2026.pdf', 'demo/atestados/atestado-marco-2026.pdf',
       'application/pdf', 118784
FROM funcionario
;

INSERT INTO atestado (
    funcionario_id, data_inicio, data_fim, observacao, status,
    nome_arquivo, caminho, content_type, tamanho_bytes
)
SELECT id, DATE '2026-06-05', DATE '2026-06-05',
       'Consulta médica.', 'PENDENTE',
       'atestado-junho-2026.pdf', 'demo/atestados/atestado-junho-2026.pdf',
       'application/pdf', 104448
FROM funcionario
WHERE email IN ('ana@korainc.com.br', 'maria@korainc.com.br');

-- Avaliações finalizadas pelo líder direto.
INSERT INTO avaliacao_desempenho (
    avaliado_id, avaliador_id, periodo, comentario_geral, nota_final, status
)
SELECT
    (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br'),
    (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br'),
    '2026-1',
    'Liderança consistente, boa previsibilidade de entregas e evolução do time.',
    4.67,
    'FINALIZADA';

INSERT INTO avaliacao_desempenho (
    avaliado_id, avaliador_id, periodo, comentario_geral, nota_final, status
)
SELECT
    (SELECT id FROM funcionario WHERE email = 'pedro@korainc.com.br'),
    (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br'),
    '2026-1',
    'Boa evolução técnica e colaboração. Próximo foco: ampliar autonomia nas decisões.',
    4.33,
    'FINALIZADA';

INSERT INTO avaliacao_desempenho (
    avaliado_id, avaliador_id, periodo, comentario_geral, nota_final, status
)
SELECT
    (SELECT id FROM funcionario WHERE email = 'ana@korainc.com.br'),
    (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br'),
    '2026-1',
    'Excelente qualidade visual e parceria com engenharia nas entregas do semestre.',
    4.67,
    'FINALIZADA';

INSERT INTO avaliacao_desempenho (
    avaliado_id, avaliador_id, periodo, comentario_geral, nota_final, status
)
SELECT
    (SELECT id FROM funcionario WHERE email = 'maria@korainc.com.br'),
    (SELECT id FROM funcionario WHERE email = 'admin@korainc.com.br'),
    '2026-1',
    'Atendimento cuidadoso e ótimo acompanhamento das demandas dos colaboradores.',
    4.33,
    'FINALIZADA';

INSERT INTO avaliacao_item (avaliacao_id, criterio, nota, comentario)
SELECT id, 'Qualidade das entregas', 5, 'Mantém alto padrão e atenção aos detalhes.'
FROM avaliacao_desempenho;

INSERT INTO avaliacao_item (avaliacao_id, criterio, nota, comentario)
SELECT id, 'Colaboração', 5, 'Contribui de forma positiva com colegas e áreas parceiras.'
FROM avaliacao_desempenho
WHERE avaliado_id IN (
    SELECT id FROM funcionario WHERE email IN ('carlos@korainc.com.br', 'ana@korainc.com.br')
);

INSERT INTO avaliacao_item (avaliacao_id, criterio, nota, comentario)
SELECT id, 'Colaboração', 4, 'Boa parceria, com espaço para compartilhar mais contexto.'
FROM avaliacao_desempenho
WHERE avaliado_id IN (
    SELECT id FROM funcionario WHERE email IN ('pedro@korainc.com.br', 'maria@korainc.com.br')
);

INSERT INTO avaliacao_item (avaliacao_id, criterio, nota, comentario)
SELECT id, 'Autonomia e iniciativa',
       CASE
           WHEN avaliado_id IN (
               SELECT id FROM funcionario WHERE email IN ('carlos@korainc.com.br', 'ana@korainc.com.br')
           ) THEN 4
           ELSE 4
       END,
       'Demonstra iniciativa e responde bem aos desafios do período.'
FROM avaliacao_desempenho;

-- Consentimento LGPD vigente.
INSERT INTO consentimento_lgpd (funcionario_id, versao_termo, aceito, ip_origem)
SELECT id, 'v1.0', TRUE, '127.0.0.1'
FROM funcionario;

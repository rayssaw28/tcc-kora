UPDATE funcionario
SET perfil = 'GESTOR',
    departamento_id = (SELECT id FROM departamento WHERE nome = 'Presidência'),
    cargo_id = (SELECT id FROM cargo WHERE nome = 'CEO'),
    gestor_id = NULL
WHERE email = 'gregorio@conformia.demo';

MERGE INTO funcionario (
    nome, cpf, email, senha_hash, perfil, status_admissao, ativo,
    telefone, data_nascimento, uf_natal, cidade_natal, genero, estado_civil,
    departamento_id, cargo_id, gestor_id
)
KEY (email)
VALUES (
    'Marina Duarte',
    '77777777777',
    'marina@conformia.demo',
    '$2a$10$WpgxiyrZUhP0WNJn3gbYCes6I9ZFncAPoNzaDZIZ.jCp0aZt3z6yO',
    'GESTOR',
    'ATIVO',
    TRUE,
    '11988888888',
    DATE '1980-05-17',
    'SP',
    'Sao Paulo',
    'MULHER',
    'CASADO',
    (SELECT id FROM departamento WHERE nome = 'Pessoas e Cultura'),
    (SELECT id FROM cargo WHERE nome = 'Diretor de Pessoas e Performance'),
    (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
);

INSERT INTO funcionario_nacionalidade (funcionario_id, pais)
SELECT id, 'Brasil'
FROM funcionario
WHERE email = 'marina@conformia.demo'
  AND NOT EXISTS (
      SELECT 1
      FROM funcionario_nacionalidade nacionalidade
      WHERE nacionalidade.funcionario_id = funcionario.id
        AND nacionalidade.pais = 'Brasil'
  );

UPDATE funcionario
SET gestor_id = (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
WHERE email = 'patricia@conformia.demo';

UPDATE funcionario
SET gestor_id = (SELECT id FROM funcionario WHERE email = 'patricia@conformia.demo')
WHERE email = 'carlos@korainc.com.br';

UPDATE funcionario
SET gestor_id = (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br')
WHERE email IN ('ana@korainc.com.br', 'pedro@korainc.com.br');

UPDATE funcionario
SET gestor_id = (SELECT id FROM funcionario WHERE email = 'marina@conformia.demo')
WHERE email = 'maria@korainc.com.br';

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Presidência')
WHERE nome = 'CEO' AND departamento_id IS NULL;

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    lider_direto_id = (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
WHERE nome = 'Diretora de Tecnologia';

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Pessoas e Cultura'),
    lider_direto_id = (SELECT id FROM funcionario WHERE email = 'gregorio@conformia.demo')
WHERE nome = 'Diretor de Pessoas e Performance';

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    lider_direto_id = (SELECT id FROM funcionario WHERE email = 'patricia@conformia.demo')
WHERE nome = 'Gerente de Engenharia';

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Tecnologia'),
    lider_direto_id = (SELECT id FROM funcionario WHERE email = 'carlos@korainc.com.br')
WHERE nome = 'Desenvolvedor de Software';

UPDATE cargo
SET departamento_id = (SELECT id FROM departamento WHERE nome = 'Pessoas e Cultura'),
    lider_direto_id = (SELECT id FROM funcionario WHERE email = 'marina@conformia.demo')
WHERE nome = 'Analista de RH';

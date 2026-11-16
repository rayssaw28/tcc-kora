# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Três perfis de acesso, com peso igual, cada um com painel próprio:

- **RH / administrador:** cadastra funcionários, conduz a pré-admissão, aprova ou reprova documentos e atestados, gere holerites, benefícios, cargos e departamentos. Trabalha sobretudo em tela ampla.
- **Gestor:** acompanha a própria equipe pelo organograma, vê jornada, documentos e avaliações dos subordinados e envia avaliações e feedbacks.
- **Colaborador:** consulta holerites, documentos, benefícios, jornada e organograma, envia atestados e documentos, acompanha pendências e registra consentimentos LGPD.

## Product Purpose

O Conformia é um MVP acadêmico de gestão de pessoas que centraliza os processos de RH em um ambiente único, seguro e organizado por perfil e hierarquia. Reduz tarefas manuais e dá mais autonomia ao colaborador e mais controle ao RH. Sucesso: pré-admissões concluídas sem documentos pendentes, menos solicitações manuais ao RH e mais consultas digitais a documentos e holerites.

## Positioning

Fluxo contínuo da pré-admissão à gestão do colaborador, com informações visíveis conforme o perfil e a hierarquia de quem acessa, demonstrativo de holerite explicado de forma simples e mural de pendências e novidades. Alvo: pequenas e médias empresas, com RH reduzido e estrutura hierárquica extensa, que ainda usam papel, planilhas e e-mail.

## Operating Context

Aplicação web responsiva (Expo / React Native Web) sobre uma API REST em Java com Spring Boot e PostgreSQL. Autenticação por JWT e acesso por escopo hierárquico. A demonstração usa o perfil `demo`, com banco H2 e dados fictícios. Os documentos tratados são CPF, CTPS, comprovante de residência, documentos admissionais, atestados médicos e holerites em PDF.

## Capabilities and Constraints

- Pré-admissão digital: cadastro, envio de documentos, análise e aprovação pelo RH.
- Documentos, atestados e holerites (PDF) com envio, consulta, aprovação/reprovação e download.
- Benefícios e salários demonstrativos; demonstrativo detalhado do holerite.
- Jornada e espelho de ponto, com saldos e integração por chave de API.
- Organograma interativo em árvore, avaliações de desempenho e feedbacks.
- Mural de notificações e pendências; consentimento LGPD.
- Idioma da interface: português do Brasil.
- Em aberto: o download real de arquivos ainda é provisório (redirecionamento de teste); o modelo de preços e a hospedagem não estão definidos além do Lean Canvas.

## Brand Commitments

Nome Conformia e logo atuais. Sem compromisso fixo de paleta ou estilo: a marca ainda pode evoluir. Obrigatório manter modo claro e modo escuro.

## Evidence on Hand

- `documentos/LEAN_CANVAS.md` e `documentos/Apresentacao_Academica_Conformia.pptx`: problema, segmentos, proposta de valor e métricas.
- `README.md` e `conformia-api/COMO-TESTAR.md`: funcionalidades e roteiro de demonstração.
- Dados de demonstração fictícios no perfil `demo`.
- Não existem depoimentos, clientes reais, benchmarks nem preços publicados; não inventar.

## Product Principles

1. Cada perfil enxerga só o que o seu papel e a sua posição na hierarquia permitem.
2. Reduzir o trabalho manual do RH sem tirar o controle dele sobre aprovações.
3. Dar ao colaborador clareza e autonomia: ele vê o que falta, o que foi aprovado e por quê.
4. Dados pessoais e financeiros são tratados com cuidado visível: consentimento e acesso explícitos.
5. Informação densa de RH deve ser rápida de escanear antes de ser bonita.

## Accessibility & Inclusion

Modo claro e escuro com texto legível em ambos. Nenhum padrão formal adotado além disso; o projeto já busca contraste AA, mas não é um requisito confirmado.

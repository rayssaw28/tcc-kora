# Auditoria de segurança da `conformia-api`

Data: 2026-11-09 · Branch: `organograma-interativo`

## Escopo e limitações

Revisão manual do código-fonte: autenticação, JWT, controle de acesso nos controllers e serviços, armazenamento de arquivos e integração de ponto. Nada foi executado e a API em execução não foi testada.

Não seguiu o fluxo completo da skill `security-audit` (sem subagentes, sem ledger de cobertura). A auditoria é **parcial** e não prova ausência de falhas no que não foi lido. A configuração real de produção não foi vista, então alguns itens "dependem do deploy".

## Achados

| # | Severidade | Achado | Onde |
|---|---|---|---|
| 1 | **Alta, se faltar a variável de ambiente** | Segredo do JWT com valor padrão público no repositório | `application.properties` |
| 2 | **Média** | Admin de produção com senha conhecida; login do app já vem preenchido com ela | `V2__seed_admin.sql`, `src/app/index.tsx:27-28` |
| 3 | **Média** | Sem limite de tentativas de login; senha mínima de 6 caracteres | `/auth/login`, `AlteracaoSenhaRequest` |
| 4 | Baixa | Token continua válido por 24 h após troca/redefinição de senha | `JwtService`, `FuncionarioService` |
| 5 | Baixa | Swagger público em todos os perfis | `SecurityConfig` |
| 6 | Baixa | Chave da integração de ponto comparada com `equals` (não é tempo constante) | `IntegracaoController` |
| 7 | Baixa, latente | Upload de documentos e atestados sem validação de tipo | `DocumentoService`, `AtestadoService` |
| 8 | Informativa | Qualquer usuário autenticado vê o organograma completo e o diretório de feedback | `/api/organograma`, `/diretorio-feedback` |

### 1. Segredo do JWT com padrão público

O padrão é `troque-este-segredo-de-desenvolvimento-conformia-2026-min-32-bytes`. A validação do token confere apenas o e-mail e a expiração. Se produção subir sem `JWT_SECRET`, quem conhece o e-mail do admin (está no seed) forja um token de ADMIN e acessa tudo. O banco também tem usuário e senha padrão `conformia`.

**Correção:** remover o valor padrão de `jwt.secret` e das credenciais do banco, e fazer a aplicação falhar ao iniciar quando faltarem.

### 2. Admin conhecido

O seed `V2` cria `admin@korainc.com.br` com a senha `Admin@123`, escrita no comentário do SQL. Nenhum passo força a troca no primeiro login. O app web preenche e-mail e senha no estado inicial da tela de login.

**Correção:** remover o preenchimento do login; marcar `senha_temporaria = true` no seed ou gerar a senha no primeiro deploy.

### 3. Força bruta

O item 2 dá um alvo previsível, o que agrava esta falha.

**Correção:** limite por IP e por e-mail (por exemplo Bucket4j) e política de senha mais forte.

### 4. Token após troca de senha

O JWT não é revogado. Contas desligadas estão tratadas (`@SQLRestriction("ativo = true")` faz o filtro rejeitar o token).

**Correção:** guardar a data da última troca de senha no token e rejeitar tokens anteriores a ela.

### 5 e 6. Swagger e chave de integração

Restringir o Swagger ao perfil `demo`. Usar `MessageDigest.isEqual` para comparar a chave da integração. A chave `conformia-demo-2026` está em `application-demo.properties`; em produção o padrão é vazio e o endpoint responde 503 (seguro).

### 7. Upload sem validação de tipo

Só o holerite exige PDF. Os demais guardam a extensão enviada pelo usuário. Não é explorável hoje, porque o download é um redirecionamento provisório para `https://example.com/?arquivo=...` e nenhum arquivo é servido.

**Correção (quando o download real for implementado):** lista de tipos permitidos e `Content-Disposition: attachment`.

## O que está bem

- Os endpoints de dados de funcionário checam o dono ou o escopo do gestor (`EscopoService`) em todos os controllers lidos.
- Ações administrativas usam `@PreAuthorize("hasRole('ADMIN')")`.
- O armazenamento de arquivos impede path traversal e salva com nome UUID.
- Senhas usam BCrypt; erros de login não revelam se o e-mail existe; o tratador de exceções não vaza stack trace.
- CORS restrito a localhost por padrão e sem credenciais; acesso a dados por JPA, sem SQL concatenado.

## Não coberto

- Dependências com CVEs (`pom.xml`)
- Restante de `AvaliacaoService`, `BeneficioService` e `DadosComplementaresService`
- Lógica de negócio de aprovação de documentos
- Configuração real de produção (HTTPS, proxy, variáveis de ambiente)

## Status das correções

- [ ] 1. Remover segredo JWT e credenciais padrão
- [ ] 2. Remover login pré-preenchido e forçar troca da senha do admin
- [ ] 3. Limite de tentativas de login e política de senha
- [ ] 4. Invalidar tokens após troca de senha
- [ ] 5. Restringir Swagger ao perfil `demo`
- [ ] 6. Comparação de chave em tempo constante
- [ ] 7. Validação de tipo nos uploads

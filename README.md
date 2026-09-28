<p align="center">
  <img src="assets/images/icon.png" alt="Logotipo do Conformia" width="150">
</p>

<h1 align="center">Conformia</h1>

<p align="center">
  Plataforma acadêmica para centralização e organização de processos de Recursos Humanos.
</p>

## Sobre o projeto

O Conformia é um MVP de gestão de pessoas desenvolvido para facilitar a rotina
de profissionais de RH, gestores e colaboradores. O sistema reúne informações,
documentos e atividades em um ambiente centralizado, responsivo e organizado
por perfis de acesso.

A aplicação possui uma interface multiplataforma em React Native e Expo e uma
API REST desenvolvida em Java com Spring Boot.

## Funcionalidades

- Autenticação com JWT e controle de acesso por perfil.
- Painéis específicos para administrador, gestor e funcionário.
- Cadastro e acompanhamento de funcionários, cargos e departamentos.
- Fluxo de pré-admissão com análise e aprovação pelo RH.
- Envio, consulta, aprovação, reprovação e download de documentos.
- Gestão de benefícios e informações salariais demonstrativas.
- Envio e consulta de holerites em PDF.
- Demonstrativo detalhado dos valores do holerite.
- Gestão de atestados médicos.
- Consulta de jornada e espelho de ponto.
- Organograma e estrutura hierárquica.
- Avaliações de desempenho e feedbacks.
- Mural de notificações e solicitações pendentes.
- Registro de consentimentos relacionados à LGPD.

## Tecnologias

### Frontend

| Tecnologia | Versão |
|---|---:|
| Expo | 54 |
| React | 19.1 |
| React Native | 0.81.5 |
| React Native Web | 0.21 |
| Expo Router | 6 |
| TypeScript | 5.9 |
| Axios | 1.17 |
| Lucide React Native | 0.544 |

### Backend

| Tecnologia | Versão |
|---|---:|
| Java | 21 |
| Spring Boot | 4.0.6 |
| Maven Wrapper | 3.9.16 |
| PostgreSQL | 12 ou superior |
| H2 | Perfil de demonstração |
| Flyway | Gerenciado pelo Spring Boot |
| JJWT | 0.12.5 |
| Springdoc OpenAPI | 2.8.13 |

## Estrutura

```text
.
├── assets/          # Imagens e identidade visual
├── conformia-api/   # API REST em Java e Spring Boot
├── documentos/      # Lean Canvas e documentação acadêmica
├── src/             # Aplicação Expo
├── app.json         # Configuração do Expo
├── package.json     # Dependências e comandos do frontend
└── README.md        # Documentação principal
```

Os arquivos `README.md` dentro de `conformia-api` documentam especificamente o
backend. Este arquivo, localizado na raiz, é a documentação principal exibida
pelo GitHub.

## Pré-requisitos

- Node.js 20 LTS ou superior.
- npm.
- Java 21.
- PostgreSQL 12 ou superior apenas para execução fora do perfil de demonstração.

## Execução rápida

Para uma apresentação acadêmica, utilize o perfil `demo`. Ele inicia um banco
H2 em memória com dados fictícios e não exige configuração do PostgreSQL.

### 1. Iniciar o backend

No PowerShell:

```powershell
cd conformia-api
$env:SPRING_PROFILES_ACTIVE = "demo"
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
cd conformia-api
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```

A API será disponibilizada em `http://localhost:8080`.

### 2. Iniciar o frontend

Em outro terminal, a partir da raiz do projeto:

```powershell
npm install
npm run web -- --port 8081
```

A aplicação será disponibilizada em `http://localhost:8081`.

## Contas de demonstração

| Usuário | E-mail | Senha | Perfil |
|---|---|---|---|
| Administrador RH | `admin@korainc.com.br` | `Admin@123` | Administrador |
| Carlos Bueno Santos | `carlos@korainc.com.br` | `Carlos@123` | Gestor |
| Ana Paula Garcia | `ana@korainc.com.br` | `Ana@1234` | Funcionária |

Os usuários e dados do perfil `demo` são fictícios e destinados exclusivamente
à apresentação do sistema.

## Configuração do frontend

Por padrão, a versão web acessa a API em `http://localhost:8080`. O endereço
pode ser alterado pela variável `EXPO_PUBLIC_API_URL`.

```powershell
$env:EXPO_PUBLIC_API_URL = "http://IP_DA_MAQUINA:8080"
npm run start
```

Esse ajuste é necessário para testar em um celular físico conectado à mesma
rede do computador. No emulador Android, o endereço padrão é
`http://10.0.2.2:8080`.

## Execução com PostgreSQL

Para executar sem o perfil de demonstração, crie o banco e o usuário:

```sql
CREATE USER conformia WITH PASSWORD 'conformia';
CREATE DATABASE conformia OWNER conformia;
```

Depois, inicie o backend normalmente:

```powershell
cd conformia-api
.\mvnw.cmd spring-boot:run
```

O Flyway aplicará automaticamente as migrações necessárias.

### Variáveis do backend

| Variável | Finalidade | Valor local padrão |
|---|---|---|
| `DB_URL` | Endereço JDBC do PostgreSQL | `jdbc:postgresql://localhost:5432/conformia` |
| `DB_USER` | Usuário do banco | `conformia` |
| `DB_PASSWORD` | Senha do banco | `conformia` |
| `JWT_SECRET` | Chave de assinatura dos tokens | Chave de desenvolvimento |
| `JWT_EXPIRATION` | Validade do token em milissegundos | `86400000` |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Origens autorizadas | Endereços locais |
| `STORAGE_LOCATION` | Diretório de arquivos enviados | `./storage` |
| `INTEGRACAO_API_KEY` | Chave da integração de ponto | Vazia |

Em um ambiente publicado, senhas e chaves devem ser definidas por variáveis de
ambiente próprias.

## Documentação da API

Com o backend em execução:

- Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

Rotas protegidas exigem o token retornado por `POST /auth/login`:

```text
Authorization: Bearer <token>
```

## Validação e testes

Frontend:

```powershell
npm run validate
```

Backend:

```powershell
cd conformia-api
.\mvnw.cmd test
```

O backend possui 22 testes automatizados cobrindo regras de admissão, jornada,
documentos, avaliações, organograma, atestados e controle de acesso.

## Escopo acadêmico

O Conformia é um MVP para apresentação acadêmica. Informações salariais,
holerites, usuários e registros do perfil de demonstração são simulações
didáticas. O sistema não substitui uma plataforma oficial de folha de
pagamento, contabilidade ou consultoria trabalhista.

## Versão

| Componente | Versão |
|---|---:|
| Aplicação Expo | 1.0.0 |
| API | 1.0.0 |

## Autores

- Rayssa Rodrigues
- Pedro Assumpção
- Kauã Honorato
- Wagner Gomes

## Licença

Este projeto está disponibilizado sob a [Licença MIT](LICENSE).

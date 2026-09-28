# Conformia API

API REST do Conformia, projeto acadêmico de gestão de pessoas desenvolvido com
Java 21 e Spring Boot 4.

## Funcionalidades

- Autenticação JWT com perfis de administrador, gestor e funcionário.
- Cadastro de departamentos, cargos e colaboradores.
- Pré-admissão com envio e aprovação de documentos.
- Holerites em PDF e demonstrativos salariais didáticos.
- Benefícios, atestados e espelho de ponto.
- Organograma, avaliações, feedbacks e histórico profissional.
- Consentimentos relacionados à LGPD.

## Tecnologias

| Tecnologia | Versão |
|---|---:|
| Java | 21 |
| Spring Boot | 4.0.6 |
| PostgreSQL | 12 ou superior |
| Flyway | Migrations V1 a V21 |
| JJWT | 0.12.5 |
| Springdoc OpenAPI | 2.8.13 |

O perfil `demo` utiliza H2 e migrations próprias de V1 a V23.

## Execução rápida

No Windows:

```powershell
$env:SPRING_PROFILES_ACTIVE = "demo"
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
SPRING_PROFILES_ACTIVE=demo ./mvnw spring-boot:run
```

A API será iniciada em `http://localhost:8080`.

## Acesso de demonstração

| Campo | Valor |
|---|---|
| E-mail | `admin@korainc.com.br` |
| Senha | `Admin@123` |
| Perfil | Administrador de RH |

## PostgreSQL

Sem o perfil `demo`, a aplicação utiliza PostgreSQL:

```sql
CREATE USER conformia WITH PASSWORD 'conformia';
CREATE DATABASE conformia OWNER conformia;
```

As configurações podem ser alteradas pelas variáveis:

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `STORAGE_LOCATION`
- `INTEGRACAO_API_KEY`
- `CORS_ALLOWED_ORIGIN_PATTERNS`

## Documentação da API

Com o backend em execução:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

## Testes e empacotamento

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

O JAR será criado em `target/conformia-api-1.0.0.jar`.

## Observação acadêmica

Os dados do perfil `demo`, a integração de ponto e os demonstrativos de salário
são recursos de apresentação. Os cálculos exibidos não substituem uma folha de
pagamento oficial.

Consulte [COMO-TESTAR.md](COMO-TESTAR.md) para um roteiro de demonstração.

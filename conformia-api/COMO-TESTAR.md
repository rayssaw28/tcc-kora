# Roteiro de demonstração do Conformia

Este roteiro utiliza o perfil acadêmico `demo`, com banco H2 em memória e dados
fictícios preparados para a apresentação.

## 1. Iniciar o backend

```powershell
cd conformia-api
$env:SPRING_PROFILES_ACTIVE = "demo"
.\mvnw.cmd spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

## 2. Iniciar o frontend

Em outro terminal:

```powershell
cd conformia-mobile
npm install
npm run web
```

## 3. Entrar como administrador

| Campo | Valor |
|---|---|
| E-mail | `admin@korainc.com.br` |
| Senha | `Admin@123` |

## 4. Sequência sugerida para apresentação

1. Apresente o painel inicial e o mural de notificações.
2. Abra o módulo **Colaboradores** e mostre a estrutura por departamento.
3. Demonstre dados pessoais, documentos e fluxo de pré-admissão.
4. Abra **Benefícios e salários**, selecione um departamento e um colaborador.
5. Mostre o demonstrativo salarial e o download do holerite.
6. Apresente o espelho de ponto e os saldos de jornada.
7. Mostre o organograma e a relação entre gestores e equipes.
8. Finalize com avaliações, feedbacks, atestados e consentimento LGPD.

## 5. Testar a API pelo Swagger

Abra `http://localhost:8080/swagger-ui.html`.

1. Execute `POST /auth/login` com:

```json
{
  "email": "admin@korainc.com.br",
  "senha": "Admin@123"
}
```

2. Copie o token retornado.
3. Clique em **Authorize** e informe o token.
4. Execute as rotas desejadas.

## 6. Integração demonstrativa de ponto

No perfil `demo`, a chave é `conformia-demo-2026`.

```powershell
$body = @{
  funcionarioId = 2
  ano = 2026
  mes = 5
  horasPrevistasMinutos = 9600
  horasTrabalhadasMinutos = 9750
} | ConvertTo-Json

Invoke-RestMethod "http://localhost:8080/api/integracao/espelho-ponto" `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{ "X-API-Key" = "conformia-demo-2026" } `
  -Body $body
```

## 7. Validação técnica

Backend:

```powershell
.\mvnw.cmd test
```

Frontend:

```powershell
npm run validate
```

## Observação

Os usuários, salários, documentos e registros do perfil `demo` são fictícios.
Os demonstrativos financeiros têm finalidade exclusivamente acadêmica.

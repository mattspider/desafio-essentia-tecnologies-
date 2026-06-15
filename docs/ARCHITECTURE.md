# Decisões de Arquitetura — TechX To-Do List

Este documento descreve as escolhas arquiteturais adotadas no projeto, com foco no backend e na organização geral do monorepo.

## Visão geral

O projeto adota uma **arquitetura em camadas** (Layered Architecture) no backend, organizada da seguinte forma:

```
HTTP Request
     │
     ▼
Controller  ──►  Service  ──►  Repository  ──►  Banco de dados
 (apresentação)   (negócio)      (persistência)
```

Cada camada possui uma responsabilidade única e se comunica apenas com a camada imediatamente abaixo. Services e repositories são definidos por **interfaces**, e as implementações concretas são registradas em um **container de injeção de dependências** (TSyringe).

---

## Por que esta arquitetura?

### 1. Clareza e manutenibilidade

Em um desafio técnico — e em projetos reais de porte similar — a legibilidade conta. A separação `Controller → Service → Repository` torna óbvio onde cada tipo de código deve viver:

| Camada | Responsabilidade | O que **não** deve fazer |
|--------|------------------|--------------------------|
| **Controller** | Receber requisições HTTP, delegar ao service, retornar respostas | Regras de negócio, acesso a banco |
| **Service** | Regras de negócio, orquestração, validações de domínio | Conhecer detalhes de HTTP ou SQL |
| **Repository** | Persistência e recuperação de dados | Decidir se uma operação é válida no negócio |

Um desenvolvedor novo no projeto consegue localizar rapidamente onde implementar uma feature ou corrigir um bug.

### 2. Princípios SOLID

A arquitetura foi escolhida porque aplica SOLID de forma prática, sem cerimônia excessiva:

#### Single Responsibility Principle (SRP)

Cada classe tem uma razão para mudar:

- `TaskController` muda se a API HTTP mudar (rotas, status codes).
- `TaskService` muda se as regras de negócio mudarem (ex.: validar ownership da tarefa).
- `TaskRepository` muda se a forma de persistir dados mudar (ex.: trocar Prisma por outro ORM).

#### Open/Closed Principle (OCP)

Novos comportamentos podem ser adicionados estendendo interfaces, sem modificar código existente. Exemplo: adicionar `ITaskMetadataRepository` (MongoDB) sem alterar a interface `ITaskRepository` (MySQL).

#### Liskov Substitution Principle (LSP)

Qualquer implementação de `ITaskRepository` pode substituir outra sem quebrar o `TaskService`. Em testes, um mock de repositório substitui a implementação Prisma transparentemente.

#### Interface Segregation Principle (ISP)

Interfaces pequenas e focadas:

- `IUserRepository` — apenas operações de usuário.
- `ITaskRepository` — apenas operações de tarefa.
- `ITaskMetadataRepository` — apenas metadados no MongoDB.

Evita interfaces “gordas” que obrigam implementações a métodos que não usam.

#### Dependency Inversion Principle (DIP)

Services dependem de **abstrações** (`ITaskRepository`), não de implementações concretas (`TaskRepository` com Prisma). O container TSyringe resolve essa inversão na inicialização da aplicação.

---

## Design patterns utilizados

| Pattern | Onde se aplica | Benefício |
|---------|----------------|-----------|
| **Layered Architecture** | Estrutura geral do backend | Separação de concerns |
| **Repository** | `repositories/` | Abstrai acesso a MySQL e MongoDB |
| **Service Layer** | `services/` | Centraliza regras de negócio |
| **Dependency Injection** | `container/` + TSyringe | Desacoplamento e testabilidade |
| **DTO** | `dtos/` | Validação e contratos de entrada/saída |
| **Middleware (Chain of Responsibility)** | `middlewares/` | Auth (cookie/Bearer), CSRF, tratamento global de erros |

---

## Por que interfaces em Services e Repositories?

### Repository com interface — sempre

O repository é o ponto de contato com infraestrutura (Prisma, Mongoose). A interface garante que:

- Testes unitários mockam persistência sem banco real.
- A camada de negócio não importa tipos gerados pelo ORM.
- Trocar tecnologia de persistência impacta apenas a implementação concreta.

### Service com interface — quando faz sentido

Neste projeto, services também possuem interfaces (`ITaskService`, `IAuthService`) porque:

- Controllers dependem de contratos, não de implementações.
- Facilita testes do controller com service mockado.
- Demonstra aplicação consciente do DIP em avaliação técnica.

---

## Fluxo de uma requisição (exemplo)

```
POST /api/tasks
     │
     ▼
auth.middleware.ts          → valida JWT (cookie HttpOnly ou Bearer), extrai userId
csrf.middleware.ts          → double-submit em POST/PUT/PATCH/DELETE
     │
     ▼
TaskController.create()     → valida DTO (Zod), chama service
     │
     ▼
TaskService.create()        → regra de negócio, chama repository
     │
     ▼
TaskRepository.create()     → Prisma INSERT no MySQL
     │
     ▼
TaskService                 → opcional: cria metadata default no Mongo
     │
     ▼
TaskController              → retorna 201 + JSON
```

### Autenticação (sessão)

```
POST /api/auth/login
     │
     ▼
AuthController              → valida credenciais, assina JWT
     │
     ▼
auth-cookies.ts             → Set-Cookie: techx_access_token (HttpOnly)
     │                         Set-Cookie: techx_csrf_token (legível ao JS)
     ▼
Resposta { user, csrfToken }  → frontend guarda csrfToken em memória (AuthService)

Requisições mutáveis (POST/PUT/PATCH/DELETE):
     Header X-CSRF-Token === cookie techx_csrf_token
     Cookie techx_access_token → auth.middleware valida JWT
```

Fallback para clientes API: header `Authorization: Bearer <token>`.

---

## Organização de pastas (backend)

```
backend/src/
├── controllers/       # Camada de apresentação HTTP
├── services/
│   └── interfaces/    # Contratos dos services
├── repositories/
│   └── interfaces/    # Contratos dos repositories
├── models/            # Entidades / tipos de domínio
├── dtos/              # Data Transfer Objects (entrada/saída)
├── middlewares/       # Auth, error handler, validação
├── infrastructure/    # Clientes Prisma, Mongoose
├── container/         # Bindings TSyringe
├── routes/            # Definição de rotas Express
├── errors/            # Erros de domínio tipados
└── server.ts          # Bootstrap da aplicação
```

---

## Frontend

O frontend Angular usa organização por **features** com `core/`, `features/` e `shared/`, seguindo o padrão **smart/dumb**:

| Pasta | Responsabilidade |
|-------|------------------|
| `core/` | `AuthService`, `TaskService`, guards, interceptor CSRF/cookies, `ThemeService`, models |
| `features/auth/` | Login e cadastro (smart) + componentes de layout reutilizáveis |
| `features/tasks/` | Página de tarefas (smart) + componentes de UI por responsabilidade |
| `shared/` | Componentes e pipes reutilizáveis entre features |

### Smart vs dumb

| Tipo | Exemplos | Responsabilidade |
|------|----------|------------------|
| **Smart (container)** | `LoginComponent`, `RegisterComponent`, `TaskListComponent` | Composição de layout, delegação ao facade, logout |
| **Facade** | `TaskFacadeService` | Estado das tarefas (signals), forms de edição/metadados, chamadas HTTP, snackbars |
| **Dumb (presentational)** | `AuthShellComponent`, `TaskComposerComponent`, `TaskPanelComponent`, … | Renderização, `@Input()` / `@Output()`, sem acesso direto à API |

### Estrutura `features/auth/`

```
features/auth/
├── components/
│   ├── auth-shell/           # layout split (brand + painel + theme toggle)
│   ├── auth-card/            # card Material com título e footer
│   └── auth-password-field/  # campo senha com toggle de visibilidade
├── constants/                # conteúdo do painel lateral (login vs register)
├── models/
├── login/
└── register/
```

### Estrutura `features/tasks/`

```
features/tasks/
├── components/
│   ├── app-header/           # brand, user chip, logout
│   ├── task-stats/           # cards total / pendentes / concluídas
│   ├── task-composer/        # formulário de nova tarefa
│   ├── task-board/           # loading, empty state, lista
│   ├── task-panel/           # expansion panel de uma tarefa
│   ├── task-badges/          # status, prioridade, tags
│   ├── task-edit-form/       # edição inline
│   ├── task-metadata-form/   # prioridade, tags, notas
│   └── task-history-list/    # histórico de alterações
├── models/                   # TaskViewModel
├── utils/                    # labels e helpers de display
├── services/
│   └── task-facade.service.ts  # estado + API + feedback (scoped à rota)
└── task-list/                # TaskListComponent (smart container fino)
```

### Estrutura `shared/`

```
shared/
├── components/
│   ├── theme-toggle/
│   ├── user-chip/
│   ├── stat-card/
│   ├── loading-state/
│   └── empty-state/
└── pipes/
    └── user-initials.pipe.ts
```

### Autenticação no frontend

1. **`APP_INITIALIZER`** — `AuthService.bootstrap()` obtém token CSRF (`GET /auth/csrf`).
2. **Login/register** — cookies HttpOnly definidos pelo backend; corpo retorna `{ user, csrfToken }` (token **não** vai para `localStorage`).
3. **Interceptor** — `withCredentials: true`; mutações enviam `X-CSRF-Token`.
4. **Guards** — `restoreSession()` via `GET /auth/me` antes de rotas protegidas.

**UI:** design tokens CSS (`_tokens.scss`, `_auth.scss`, `_badges.scss`), tema claro/escuro, Angular Material, layout em duas colunas (composer + board).

---

## Decisões complementares de stack

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Framework HTTP | Express | Requisito do desafio, leve, compatível com DI manual |
| Container DI | TSyringe | Simples, decorators, integração natural com TypeScript |
| ORM relacional | Prisma | Tipagem forte, migrations, produtividade |
| ODM NoSQL | Mongoose | Metadados extras das tarefas (desafio extra) |
| Validação | Zod | Schemas declarativos, inferência de tipos |
| Auth | JWT (cookie HttpOnly) + bcrypt + CSRF | JWT assinado no servidor; cookie inacessível ao JS; mutações validadas |
| UI | Angular Material | Componentes maduros, acessibilidade, produtividade |

Deploy e variáveis de produção: seção [Deploy](../README.md#deploy) do README principal.

---

## Cuidados para manter a arquitetura saudável

1. **Não colocar regra de negócio no controller** — apenas orquestração HTTP.
2. **Não colocar regra de negócio no repository** — apenas persistência.
3. **Evitar “God Service”** — se `TaskService` crescer demais, extrair sub-responsabilidades.
4. **Usar DTOs na borda HTTP** — não expor tipos internos do Prisma na API.
5. **Erros de domínio tipados** — `TaskNotFoundError`, `UnauthorizedError`; o middleware traduz em status HTTP.
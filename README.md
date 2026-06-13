# TechX To-Do List — Desafio Essentia Technologies

Aplicação full-stack de gerenciamento de tarefas desenvolvida para o desafio técnico da TechX.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Angular 17+, Angular Material, TypeScript |
| Backend | Node.js, Express, TypeScript, TSyringe |
| Bancos | MySQL (Prisma), MongoDB (Mongoose) |
| Auth | JWT + bcrypt |

## Arquitetura

Monorepo com separação `frontend/` e `backend/`. O backend segue camadas:

```
Controller → Service → Repository
```

Com interfaces para services e repositories, injeção de dependências via TSyringe e princípios SOLID.

> Documentação detalhada das decisões arquiteturais: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Estrutura do projeto

```
.
├── backend/              # API REST (Express + TypeScript)
├── frontend/             # SPA Angular
├── docs/
│   └── ARCHITECTURE.md   # Decisões de arquitetura e SOLID
├── .env.example          # Variáveis de ambiente de referência
└── docker-compose.yml    # (Fase 1+) MySQL + MongoDB
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (a partir da Fase 1)
- Angular CLI (a partir da Fase 8)

## Configuração local (Fase 0)

1. Clone o repositório e acesse a pasta do projeto.

2. Copie as variáveis de ambiente:

   ```bash
   cp .env.example backend/.env
   ```

3. **Suba os bancos de dados (Fase 1):**

   ```bash
   docker compose up -d
   ```

   Aguarde os containers `techx-mysql` e `techx-mongo` ficarem healthy.

4. Instale as dependências do backend e aplique migrations:

   ```bash
   cd backend
   npm install
   npm run db:migrate:deploy
   npm run db:generate
   ```

5. Execute em modo desenvolvimento:

   ```bash
   npm run dev
   ```

## Docker (MySQL + MongoDB)

O arquivo [`docker-compose.yml`](docker-compose.yml) provisiona:

| Serviço | Imagem | Porta | Credenciais |
|---------|--------|-------|-------------|
| MySQL | `mysql:8` | 3306 | user: `techx`, senha: `techx123`, db: `techx_todo` |
| MongoDB | `mongo:7` | 27017 | sem auth (dev local) |

Comandos úteis:

```bash
docker compose up -d      # iniciar bancos
docker compose ps         # status
docker compose down       # parar
docker compose down -v    # parar e remover volumes
```

## Scripts do backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor com hot reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa a build de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Cria/aplica migrations (dev) |
| `npm run db:migrate:deploy` | Aplica migrations (prod/CI) |
| `npm run db:studio` | Abre Prisma Studio |

## Status de implementação

- [x] Fase 0 — Bootstrap do monorepo
- [x] Fase 1 — Infraestrutura (Docker, Prisma, Mongoose)
- [x] Fase 2 — Injeção de dependências (TSyringe + Express)
- [ ] Fase 3 — Autenticação JWT
- [ ] Fase 4 — CRUD de tarefas + metadados MongoDB
- [ ] Fase 5 — Docker completo
- [ ] Fase 6 — Testes unitários
- [ ] Fase 7 — CI/CD (GitHub Actions + Vercel)
- [ ] Fase 8–10 — Frontend Angular
- [ ] Fase 11 — Documentação final

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
├── backend/
│   ├── .env.example      # Template backend (copie para backend/.env)
│   └── ...
├── frontend/
│   ├── .env.example      # Template frontend (copie para frontend/.env)
│   └── ...
├── docs/
│   └── ARCHITECTURE.md   # Decisões de arquitetura e SOLID
├── postman/              # Collections Postman para testes da API
└── docker-compose.yml    # MySQL + MongoDB + Backend
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (a partir da Fase 1)
- Angular CLI (a partir da Fase 8)

## Configuração local

1. Clone o repositório e acesse a pasta do projeto.

2. Copie as variáveis de ambiente:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Suba os bancos de dados:

   ```bash
   docker compose up -d mysql mongo
   ```

4. Instale dependências e aplique migrations:

   ```bash
   cd backend
   npm install
   npm run db:migrate:deploy
   ```

5. Execute a API em modo desenvolvimento:

   ```bash
   npm run dev
   ```

> **Backend:** segredos e infra em `backend/.env` (MySQL, MongoDB, JWT, porta, CORS).  
> **Frontend:** só config pública em `frontend/.env` (`API_URL`). Nunca coloque JWT ou credenciais de banco no frontend.

## Docker

### Opção A — Somente bancos (dev local com `npm run dev`)

```bash
docker compose up -d mysql mongo
cd backend && npm run dev
```

O `backend/.env` usa `localhost` para MySQL e MongoDB (portas expostas pelo Docker).

### Opção B — Stack completa (API + bancos no Docker)

1. Garanta que `backend/.env` existe (`cp backend/.env.example backend/.env`).

2. Suba todos os serviços:

   ```bash
   docker compose up -d --build
   ```

3. A API estará em `http://localhost:3000`.

O Compose carrega `backend/.env` e **sobrescreve** apenas `DATABASE_URL` e `MONGODB_URI` para os hosts internos `mysql` e `mongo`.

| Serviço | Imagem / build | Porta | Descrição |
|---------|----------------|-------|-----------|
| MySQL | `mysql:8` | 3306 | user: `techx`, senha: `techx123`, db: `techx_todo` |
| MongoDB | `mongo:7` | 27017 | sem auth (dev local) |
| Backend | `backend/Dockerfile` | 3000 | API Express + Prisma migrate deploy |

Comandos úteis:

```bash
docker compose up -d --build   # build + iniciar stack completa
docker compose up -d mysql mongo   # somente bancos
docker compose ps              # status
docker compose logs -f backend # logs da API
docker compose down            # parar
docker compose down -v         # parar e remover volumes
```

> **Nota:** não rode `npm run dev` na porta 3000 ao mesmo tempo que o container `backend` estiver ativo.

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
| `npm test` | Executa testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com relatório de cobertura |

## Status de implementação

- [x] Fase 0 — Bootstrap do monorepo
- [x] Fase 1 — Infraestrutura (Docker, Prisma, Mongoose)
- [x] Fase 2 — Injeção de dependências (TSyringe + Express)
- [x] Fase 3 — Autenticação JWT
- [x] Fase 4 — CRUD de tarefas + metadados MongoDB
- [x] Fase 5 — Docker completo
- [x] Fase 6 — Testes unitários
- [ ] Fase 7 — CI/CD (GitHub Actions + Vercel)
- [ ] Fase 8–10 — Frontend Angular
- [ ] Fase 11 — Documentação final

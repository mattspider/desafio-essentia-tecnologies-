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

3. Instale as dependências do backend:

   ```bash
   cd backend
   npm install
   ```

4. Execute em modo desenvolvimento:

   ```bash
   npm run dev
   ```

## Scripts do backend

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor com hot reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Executa a build de produção |
| `npm run lint` | Verifica código com ESLint |
| `npm run format` | Formata código com Prettier |

## Status de implementação

- [x] Fase 0 — Bootstrap do monorepo
- [ ] Fase 1 — Infraestrutura (Docker, Prisma, Mongoose)
- [ ] Fase 2 — Injeção de dependências (TSyringe)
- [ ] Fase 3 — Autenticação JWT
- [ ] Fase 4 — CRUD de tarefas + metadados MongoDB
- [ ] Fase 5 — Docker completo
- [ ] Fase 6 — Testes unitários
- [ ] Fase 7 — CI/CD (GitHub Actions + Vercel)
- [ ] Fase 8–10 — Frontend Angular
- [ ] Fase 11 — Documentação final

# TechX To-Do — Frontend

SPA **Angular 19** + **Angular Material**. Documentação geral na [raiz do repositório](../README.md).

## Funcionalidades

- Login e cadastro (`features/auth`)
- Lista de tarefas com CRUD, toggle e metadados MongoDB (`features/tasks`)
- Interceptor JWT, `AuthGuard`, tema claro/escuro (`ThemeService`)

## Scripts

```bash
npm install
npm start              # http://localhost:4200 (dev)
npm run build          # prebuild (API_URL) + build production
npm run build:ci       # build production (CI/Vercel)
npm test               # Karma (watch)
npm run test:ci        # Karma headless (CI)
```

## Ambientes

| Arquivo | Quando usa |
|---------|------------|
| `environment.development.ts` | `ng serve` → `http://localhost:3000/api` |
| `environment.production.ts` | Build — gerado por `scripts/generate-env.js` |

## Variáveis

| Variável | Onde definir | Uso |
|----------|--------------|-----|
| `API_URL` | Vercel, CI ou `frontend/.env` no build local | Base da API (com `/api`) |

`frontend/.env` **não** é lido pelo `ng serve` — apenas no `prebuild` de `npm run build`.

## Deploy (Vercel)

1. Root directory: `frontend`
2. Production env: `API_URL=https://sua-api.com/api`
3. No backend: `CORS_ORIGIN` = URL exata do app Vercel

Passo a passo: [docs/DEPLOY.md](../docs/DEPLOY.md)

## Estrutura

```
src/app/
├── core/           # auth.service, task.service, guards, interceptor, theme
├── features/
│   ├── auth/       # login, register
│   └── tasks/      # task-list (smart component)
└── shared/         # theme-toggle
src/styles/         # tokens, auth layout, material overrides
```

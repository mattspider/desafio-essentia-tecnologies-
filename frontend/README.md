# TechX To-Do — Frontend

SPA **Angular 19** + **Angular Material**. Documentação geral na [raiz do repositório](../README.md).

## Funcionalidades

- Login e cadastro com componentes reutilizáveis (`AuthShell`, `AuthCard`, `AuthPasswordField`)
- Dashboard de tarefas componentizado (`TaskStats`, `TaskBoard`, `TaskPanel`, …)
- Sessão via cookie HttpOnly + CSRF (`AuthService`, interceptor, guards assíncronos)
- Tema claro/escuro persistente (`ThemeService`)

## Scripts

```bash
npm install
npm start              # http://localhost:4200 (dev)
npm run build          # prebuild (API_URL) + build production
npm run build:ci       # build production (CI/Vercel)
npm test               # Karma (watch)
npm run test:ci        # Karma headless (CI) — 43 specs
```

Cobertura principal: utils, pipes, componentes dumb, `TaskFacadeService` (estado + API) e `TaskListComponent` (delegação).

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

## Estrutura

```
src/app/
├── core/
│   ├── services/       # auth.service, task.service, theme.service
│   ├── guards/         # authGuard, guestGuard
│   ├── interceptors/   # CSRF + withCredentials
│   ├── models/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── components/ # auth-shell, auth-card, auth-password-field
│   │   ├── constants/
│   │   ├── login/
│   │   └── register/
│   └── tasks/
│       ├── components/ # app-header, task-board, task-panel, …
│       ├── models/
│       ├── utils/
│       ├── services/   # task-facade.service (estado + API)
│       └── task-list/  # smart container fino
└── shared/
    ├── components/     # theme-toggle, stat-card, user-chip, …
    └── pipes/          # userInitials
src/styles/             # _tokens, _auth, _badges, _material-overrides
```

## Padrão smart/dumb

- **Smart:** `TaskListComponent`, `LoginComponent`, `RegisterComponent` — layout e delegação.
- **Facade:** `TaskFacadeService` — estado, CRUD, metadados e snackbars na feature tasks.
- **Dumb:** demais componentes em `features/*/components/` e `shared/` — apenas apresentação via `@Input()` / `@Output()`.

Detalhes: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md#frontend).

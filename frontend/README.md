# TechX To-Do — Frontend

SPA Angular 19 + Material. Documentação na [raiz do repositório](../README.md).

## Scripts

```bash
npm install
npm start              # http://localhost:4200 (dev)
npm run build          # gera env de produção + build
npm run build:ci       # build production (CI/Vercel)
npm test               # Karma (watch)
npm run test:ci        # Karma headless (CI)
```

## Variáveis de ambiente

| Variável | Onde | Uso |
|----------|------|-----|
| `API_URL` | Vercel / CI / build local | Injetada em `environment.production.ts` via `scripts/generate-env.js` |

Desenvolvimento usa `src/environments/environment.development.ts` (`http://localhost:3000/api`).

## Deploy (Vercel)

1. Root directory: `frontend`
2. Env var: `API_URL=https://sua-api.com/api`
3. Ajuste `CORS_ORIGIN` no backend para a URL do Vercel

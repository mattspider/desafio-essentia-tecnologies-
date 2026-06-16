# Observabilidade — TechX To-Do List

## Arquitetura

```
Express API (/metrics)  →  Prometheus  →  Grafana
```

| Componente | Tecnologia | Responsabilidade |
|------------|------------|------------------|
| Instrumentação | `prom-client` | Counter `http_requests_total`, Histogram `http_request_duration_seconds`, métricas de processo Node |
| Coleta | Prometheus | Scrape a cada 15s |
| Visualização | Grafana | Dashboard provisionado `TechX API` |

## URLs locais (Docker Compose)

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Métricas (Prometheus format) | http://localhost:3000/metrics | — |
| Prometheus UI | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | `admin` / `admin` |
| Swagger UI | http://localhost:3000/api/docs | — |

## Como subir

```bash
docker compose up -d --build
```

Aguarde os healthchecks de MySQL e MongoDB. O Prometheus depende do backend; o Grafana depende do Prometheus.

## Dashboard Grafana

O dashboard **TechX API** é provisionado automaticamente em `observability/grafana/provisioning/dashboards/techx-api.json`.

| Painel | Métrica | O que mostra |
|--------|---------|--------------|
| Request rate by route | `rate(http_requests_total[5m])` | Requisições/s por rota |
| Error rate (5xx) | `rate(http_requests_total{status=~"5.."}[5m])` | Erros de servidor |
| Latency p95 by route | `histogram_quantile(0.95, ...)` | Latência no percentil 95 |
| Process memory (RSS) | `process_resident_memory_bytes` | Memória residente do Node |

## Como gerar tráfego de teste

```bash
# Health check (gera métricas)
curl http://localhost:3000/api/health

# Várias requisições
for i in $(seq 1 20); do curl -s http://localhost:3000/api/health > /dev/null; done
```

Abra o Grafana → pasta **TechX** → dashboard **TechX API**. Os painéis atualizam a cada 10s.

## Produção (Railway)

O endpoint `GET /metrics` está **público** em produção:

```
https://desafio-essentia-tecnologies-production.up.railway.app/metrics
```
## Arquivos de configuração

```
observability/
├── prometheus.yml
└── grafana/
    └── provisioning/
        ├── datasources/prometheus-datasource.yml
        └── dashboards/
            ├── dashboards.yml
            └── techx-api.json
```

## API Docs (Swagger)

Documentação OpenAPI interativa disponível em:

- Local: http://localhost:3000/api/docs
- Produção: https://desafio-essentia-tecnologies-production.up.railway.app/api/docs
- Spec raw: `/api/docs/openapi.yaml`

Ver [README](../README.md#api-docs) para fluxo de autenticação no Swagger UI.

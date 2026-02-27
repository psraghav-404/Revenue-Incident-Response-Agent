# 📚 Documentation — RevenueGuard AI

This directory contains supplementary documentation for the project.

## Quick Links

| Document | Description |
|---|---|
| [README.md](../README.md) | Project overview and quick start |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System design and agent orchestration |
| [SETUP.md](../SETUP.md) | Installation and configuration guide |
| [DEMO.md](../DEMO.md) | Judge walkthrough and demo instructions |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](../SECURITY.md) | Security policy |

## API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `GET` | `/api/agent/analyze?service=<name>` | Trigger agent investigation |
| `GET` | `/api/intelligence` | Unified investigation proxy |
| `GET` | `/api/anomalies` | Anomaly detection results |
| `GET` | `/api/deployment-impact?service=<name>` | Deployment causal analysis |
| `GET` | `/api/risk-score` | Composite risk score |
| `GET` | `/api/financial-loss` | Revenue loss quantification |
| `GET` | `/api/business-impact` | Regional & service impact |
| `GET` | `/api/timeline` | Time-series with deployment markers |
| `GET` | `/api/services` | Per-service health summary |
| `GET` | `/api/alerts` | Active threshold-based alerts |

## Data Schema

See the `data/` directory for sample JSON files that illustrate the schema for each data type:
- `invoices.json` — Billing records
- `transactions.json` — Payment events
- `system_events.json` — Deployment history
- `churn_events.json` — Customer churn signals
- `subscriptions.json` — Subscription data
- `support_tickets.json` — Customer complaints
- `pricing_versions.json` — Pricing configuration versions

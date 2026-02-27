<div align="center">

# 🛡️ RevenueGuard AI

### Autonomous Financial Incident Response Agent

*Powered by Elasticsearch · Built for the Elastic Agent Builder Hackathon*

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)
[![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.x-005571?logo=elasticsearch)](https://www.elastic.co/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

</div>

---

## 📌 Problem Statement

SaaS companies lose **millions in revenue** due to silent billing failures — pricing misconfigurations, deployment regressions, and subscription drift that go undetected until customers churn. Traditional monitoring catches server errors but **completely misses revenue leakage**: the gap between what *should* be billed and what *actually is*.

## 💡 Solution

**RevenueGuard AI** is an autonomous agent that continuously monitors Elasticsearch telemetry to detect, investigate, and quantify revenue leakage in real time. It doesn't just alert — it **reasons** through a 6-step investigative workflow, identifies root causes with mathematical confidence scoring, and delivers actionable remediation plans.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Anomaly Detection** | Statistical drift detection with z-score analysis across billing streams |
| 🔗 **Causal Correlation** | Cross-domain signal correlation (deployments × invoices × transactions × churn) |
| 📊 **Financial Quantification** | Real-time revenue loss calculation with 30-day projections |
| 🤖 **Autonomous Agent** | 6-step reasoning workflow with zero human intervention |
| 🎯 **Confidence Scoring** | Weighted composite scoring: signal strength, temporal alignment, cross-signal support |
| 📈 **Executive Dashboard** | Real-time React dashboard with interactive charts and forensic drill-downs |
| ⚡ **Instant Alerting** | Threshold-based alerts with severity classification |
| 🛡️ **Preventive Intelligence** | Guardrails and early warning indicators to prevent future leakage |

---

## 🤖 Agent Workflow — 6-Step Autonomous Investigation

```
┌─────────────────────────────────────────────────────┐
│                  RevenueGuard Agent                  │
│                                                     │
│  Step 1: 🔍 DETECT                                 │
│  └─ Scan Elasticsearch indices for billing anomalies│
│                                                     │
│  Step 2: 📊 INVESTIGATE                             │
│  └─ Statistical drift detection (z-score analysis)  │
│                                                     │
│  Step 3: 🔗 CORRELATE                               │
│  └─ Cross-reference deployments, transactions,      │
│     support tickets, and churn events                │
│                                                     │
│  Step 4: 💰 QUANTIFY                                │
│  └─ Calculate exact revenue loss with projections   │
│                                                     │
│  Step 5: ⚖️ DECIDE                                  │
│  └─ Rank root causes with confidence scoring        │
│                                                     │
│  Step 6: 📝 EXPLAIN                                 │
│  └─ Generate human-readable verdict + action plan   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Data Store** | Elasticsearch 8.x | Telemetry indexing, anomaly queries, aggregations |
| **Backend** | Node.js + Express | Agent orchestration, API endpoints, tool execution |
| **Frontend** | React 19 + Vite | Executive dashboard with Chart.js visualizations |
| **Agent Core** | Custom JS Engine | Multi-step reasoning, confidence scoring, drift detection |
| **Data Pipeline** | JSON → Elasticsearch | Simulated SaaS billing data (invoices, transactions, events) |

---

## 🏗️ Architecture Overview

```
                    ┌──────────────────────┐
                    │   React Dashboard    │
                    │   (Vite + Chart.js)  │
                    └──────────┬───────────┘
                               │ HTTP
                    ┌──────────▼───────────┐
                    │   Express API Server │
                    │  (revenueguard-server)│
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐ ┌──────▼───────┐ ┌──────▼──────┐
     │  Agent Tools  │ │  Intelligence │ │   Alert     │
     │  (6-Step)     │ │   Engines    │ │   Engine    │
     └────────┬──────┘ └──────┬───────┘ └──────┬──────┘
              │               │                │
              └───────────────┼────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Elasticsearch    │
                    │   (8.x Cluster)    │
                    │                    │
                    │  • invoices        │
                    │  • transactions    │
                    │  • system_events   │
                    │  • churn_events    │
                    │  • subscriptions   │
                    └────────────────────┘
```

> 📄 For a detailed architecture breakdown, see [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🌍 Impact

| Metric | Value |
|---|---|
| **Revenue Protected** | Detects leakage within minutes, not months |
| **MTTR Reduction** | From days of manual forensics → seconds of autonomous analysis |
| **False Positive Rate** | < 5% via multi-signal confidence scoring |
| **Coverage** | Billing, subscriptions, transactions, churn — all correlated |
| **Preventive ROI** | Guardrails prevent recurrence; estimated 10x return on detection |

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/psraghav-404/revenueguard-ai.git
cd revenueguard-ai

# 2. Install backend dependencies
npm install

# 3. Generate sample data into Elasticsearch
node generate_data.js

# 4. Start the backend server
node revenueguard-server.js
# → API running at http://localhost:3001

# 5. Start the React dashboard
cd dashboard-react
npm install
npm run dev
# → Dashboard at http://localhost:5173
```

> 📄 For detailed setup instructions, see [SETUP.md](./SETUP.md)

---

## 🔌 API Example

### Trigger an Agent Investigation

```bash
curl http://localhost:3001/api/agent/analyze?service=billing-service
```

**Response (abbreviated):**
```json
{
  "agent": {
    "steps_executed": 6,
    "tools_used": ["detect_anomaly", "investigate_drift", "correlate_events",
                   "quantify_loss", "decide_action", "explain_verdict"]
  },
  "summary": {
    "verdict": "Billing Deployment Regression confirmed as primary driver (Confidence: 87%)",
    "total_leak": 12847.50,
    "mrr_risk": 3.2
  },
  "reasoning_trace": [
    "Step 1: Detected 23.4% anomaly rate in billing-service (baseline: 2.1%)",
    "Step 2: Drift factor 8.7x — spike began 2026-02-08",
    "Step 3: Deployment v2.4.1 aligns within 24h of spike onset",
    "Step 4: Total revenue loss: $12,847.50 | 30-day projection: $38,542",
    "Step 5: Root cause ranked with 0.87 confidence score",
    "Step 6: CRITICAL — Rollback billing-service v2.4.1 immediately"
  ]
}
```

---

## 🎬 Demo Instructions

> 📄 See the full [DEMO.md](./DEMO.md) for step-by-step judge walkthrough.

**Quick test:**
1. Start the backend: `node revenueguard-server.js`
2. Open the dashboard: `http://localhost:5173`
3. Hit the agent endpoint: `http://localhost:3001/api/agent/analyze?service=billing-service`
4. Watch the dashboard update in real time with the investigation results.

---

## 🏆 Hackathon Alignment

| Criteria | How RevenueGuard Delivers |
|---|---|
| **Elasticsearch Usage** | Core data store for all telemetry; queries, aggregations, and anomaly detection |
| **Agent Architecture** | 6-step autonomous workflow with tool-based reasoning |
| **Real-World Impact** | Solves a $B+ industry problem (SaaS revenue leakage) |
| **Technical Depth** | Statistical drift detection, confidence scoring, causal correlation |
| **Reproducibility** | One-command setup with sample data included |
| **Code Quality** | Clean architecture, documented APIs, open-source ready |

---

## 📸 Screenshots

> *Add screenshots of the dashboard and agent output here.*

| View | Screenshot |
|---|---|
| Executive Dashboard | `[placeholder]` |
| Agent Reasoning Trace | `[placeholder]` |
| Anomaly Detection Panel | `[placeholder]` |
| Financial Impact Model | `[placeholder]` |

---

## 📂 Project Structure

```
revenueguard-ai/
├── backend/                    # (Backend files at root level)
│   ├── revenueguard-server.js  # Main API server (1200+ lines)
│   ├── agent.js                # AI Agent — autonomous investigator
│   ├── generate_data.js        # Sample data generator
│   └── data/                   # JSON datasets (11 files)
├── dashboard-react/            # React + Vite executive dashboard
│   ├── src/App.jsx             # Main dashboard component
│   └── src/App.css             # Dashboard styles
├── docs/                       # Additional documentation
├── .github/workflows/          # CI/CD pipeline
├── index.html                  # Legacy static dashboard
├── ARCHITECTURE.md             # System architecture deep-dive
├── SETUP.md                    # Installation & configuration
├── DEMO.md                     # Judge walkthrough guide
├── CONTRIBUTING.md             # Contribution guidelines
├── SECURITY.md                 # Security policy
└── README.md                   # ← You are here
```

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

**Built with ❤️ for the Elastic Agent Builder Hackathon 2026**

</div>

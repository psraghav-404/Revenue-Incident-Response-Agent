# 🎬 Demo Guide — RevenueGuard AI

> Step-by-step walkthrough for judges and reviewers.

---

## ⏱️ Quick Demo (2 minutes)

### Step 1: Start the Backend

```bash
cd revenueguard-ai
npm install
node revenueguard-server.js
```

You should see:
```
🚀 RevenueGuard API running on http://localhost:3001
```

### Step 2: Start the Dashboard

Open a **new terminal**:

```bash
cd dashboard-react
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Step 3: Trigger an Agent Investigation

Open another terminal or use your browser:

```bash
curl http://localhost:3001/api/agent/analyze?service=billing-service
```

Or simply navigate to:
```
http://localhost:3001/api/agent/analyze?service=billing-service
```

---

## 🧪 Example Prompt

> **"Analyze the billing-service spike"**

Use the following API call to simulate this investigation:

```bash
curl "http://localhost:3001/api/agent/analyze?service=billing-service"
```

---

## 📊 Expected Output

The agent will return a comprehensive investigation report. Here's what to look for:

### 1. Agent Metadata
```json
{
  "agent": {
    "name": "RevenueGuard Autonomous Agent",
    "steps_executed": 6,
    "tools_used": [
      "detect_anomaly",
      "investigate_drift",
      "correlate_events",
      "quantify_loss",
      "decide_action",
      "explain_verdict"
    ],
    "execution_time_ms": 45
  }
}
```
✅ **What this shows:** The agent autonomously executed 6 investigative steps using distinct tools.

### 2. Investigation Summary
```json
{
  "summary": {
    "verdict": "Billing Deployment Regression confirmed as primary driver (Confidence: 87%)",
    "total_leak": 12847.50,
    "mrr_risk": "3.2%",
    "confidence": "87%"
  }
}
```
✅ **What this shows:** A clear, quantified verdict with confidence scoring.

### 3. Reasoning Trace (Auditability)
```json
{
  "reasoning_trace": [
    "Step 1 [DETECT]: Scanned 1,247 invoices → 23.4% anomaly rate (baseline: 2.1%)",
    "Step 2 [INVESTIGATE]: Drift factor 8.7x detected — spike began 2026-02-08",
    "Step 3 [CORRELATE]: Deployment v2.4.1 (Feb 7) aligns within 24h of spike onset",
    "Step 4 [QUANTIFY]: Total loss: $12,847.50 | 30-day projection: $38,542",
    "Step 5 [DECIDE]: Root cause ranked at 0.87 confidence — CRITICAL severity",
    "Step 6 [EXPLAIN]: Rollback billing-service v2.4.1 immediately; verify migration"
  ]
}
```
✅ **What this shows:** Full chain-of-thought reasoning — every step is traceable and auditable.

### 4. Financial Impact Model
```json
{
  "financial_impact": {
    "immediate_loss": 12847.50,
    "projected_30d_mrr": 38542.00,
    "ltv_impact": 154168.00,
    "churn_impact": {
      "monthly_mrr_lost": 1927,
      "annualized_impact": 30894
    }
  }
}
```
✅ **What this shows:** Multi-horizon financial quantification (immediate → 30-day → annual).

---

## 🖥️ Dashboard Walkthrough

When you open the React dashboard at `http://localhost:5173`, you'll see:

| Section | What It Shows |
|---|---|
| **Top KPI Bar** | Total leak amount, MRR risk %, agent confidence |
| **Agent Verdict** | Natural language summary of the investigation |
| **Revenue Trend Chart** | Expected vs. Actual revenue over time |
| **Failure Rate Chart** | Transaction failure rate trend |
| **Anomaly Table** | Recent anomalies with severity tags |
| **Causal Chain** | Step-by-step root cause evidence |
| **Impact Modeling** | Revenue loss breakdown (immediate, churn, projected) |
| **Action Stack** | Prioritized remediation recommendations |

---

## 🔗 Additional API Endpoints to Explore

| Endpoint | What It Returns |
|---|---|
| `GET /api/anomalies` | Anomaly detection results with drift analysis |
| `GET /api/deployment-impact?service=billing-service` | Causal deployment analysis |
| `GET /api/financial-loss` | Revenue loss with daily trend |
| `GET /api/risk-score` | Composite risk score [0–100] |
| `GET /api/business-impact` | Regional and service-level impact breakdown |
| `GET /api/timeline` | Time-series data with deployment markers |
| `GET /api/services` | Per-service health and drift status |
| `GET /api/alerts` | Active threshold-based alerts |

---

## ✅ What Judges Should Look For

1. **Autonomous Agent Workflow** — 6 tools execute without human intervention
2. **Elasticsearch Integration** — Data ingestion, queries, and aggregations
3. **Mathematical Rigor** — Z-score drift detection, confidence scoring, risk models
4. **Financial Quantification** — Dollar-amount loss calculations with projections
5. **Reasoning Transparency** — Full audit trail of agent reasoning steps
6. **Production-Ready Quality** — Error handling, dual-mode data, clean API design

---

*For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md). For setup help, see [SETUP.md](./SETUP.md).*

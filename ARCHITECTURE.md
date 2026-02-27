# 🏗️ Architecture — RevenueGuard AI

> Deep-dive into the system design, agent orchestration, and Elasticsearch integration.

---

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│   ┌──────────────────────┐        ┌──────────────────────────┐      │
│   │   React Dashboard    │        │   Static Dashboard       │      │
│   │  (Vite + Chart.js)   │        │  (index.html + app.js)   │      │
│   └──────────┬───────────┘        └──────────┬───────────────┘      │
│              │                               │                      │
└──────────────┼───────────────────────────────┼──────────────────────┘
               │           REST API            │
┌──────────────▼───────────────────────────────▼──────────────────────┐
│                       API SERVER LAYER                              │
│                   (revenueguard-server.js)                          │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   Express Router                            │   │
│   │                                                             │   │
│   │  /api/health          → System health check                 │   │
│   │  /api/anomalies       → Anomaly detection results           │   │
│   │  /api/deployment-impact → Deployment causal analysis        │   │
│   │  /api/risk-score       → Composite risk model               │   │
│   │  /api/financial-loss   → Revenue loss quantification        │   │
│   │  /api/business-impact  → Regional & service-level impact    │   │
│   │  /api/timeline         → Time-series with deployment marks  │   │
│   │  /api/services         → Per-service health summary         │   │
│   │  /api/alerts           → Threshold-based alert engine       │   │
│   │  /api/agent/analyze    → ★ Agent orchestration endpoint     │   │
│   │  /api/intelligence     → Unified investigation proxy        │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────┐  ┌────────────────────────────────────┐   │
│   │   AGENT ENGINE      │  │   INTELLIGENCE ENGINES             │   │
│   │                     │  │                                    │   │
│   │  ┌───────────────┐  │  │  ┌──────────────────────────────┐  │   │
│   │  │ 6-Step Tool   │  │  │  │ computeDriftDetection()      │  │   │
│   │  │ Orchestrator  │  │  │  │ Statistical z-score analysis │  │   │
│   │  └───────────────┘  │  │  └──────────────────────────────┘  │   │
│   │                     │  │  ┌──────────────────────────────┐  │   │
│   │  Tools:             │  │  │ computeConfidence()          │  │   │
│   │  • detect_anomaly   │  │  │ Multi-factor scoring model   │  │   │
│   │  • investigate_drift│  │  │ (recency × drift × anomaly)  │  │   │
│   │  • correlate_events │  │  └──────────────────────────────┘  │   │
│   │  • quantify_loss    │  │  ┌──────────────────────────────┐  │   │
│   │  • decide_action    │  │  │ computeRiskScore()           │  │   │
│   │  • explain_verdict  │  │  │ Normalized composite model   │  │   │
│   │                     │  │  └──────────────────────────────┘  │   │
│   └─────────────────────┘  └────────────────────────────────────┘   │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                          READ / WRITE
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                        DATA LAYER                                   │
│                                                                     │
│   ┌──────────────────────┐       ┌──────────────────────────┐       │
│   │   Elasticsearch 8.x │       │   JSON Fallback          │       │
│   │   (Primary Store)   │       │   (data/ directory)      │       │
│   │                     │       │                          │       │
│   │   Indices:          │       │   Files:                 │       │
│   │   • invoices        │       │   • invoices.json        │       │
│   │   • transactions    │       │   • transactions.json    │       │
│   │   • system_events   │       │   • system_events.json   │       │
│   │   • subscriptions   │       │   • churn_events.json    │       │
│   │   • churn_events    │       │   • subscriptions.json   │       │
│   │   • support_tickets │       │   • support_tickets.json │       │
│   │   • pricing_versions│       │   • pricing_versions.json│       │
│   └──────────────────────┘       └──────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Orchestration Flow

The agent follows a **deterministic 6-step pipeline**. Each step is a discrete *tool* that receives input from the previous step and passes structured output to the next.

```
 ┌──────────┐     ┌──────────────┐     ┌────────────┐
 │  DETECT  │────▶│ INVESTIGATE  │────▶│ CORRELATE  │
 │          │     │              │     │            │
 │ Scan for │     │ Z-score      │     │ Cross-ref  │
 │ anomalies│     │ drift        │     │ deployments│
 └──────────┘     └──────────────┘     └─────┬──────┘
                                             │
                                             ▼
 ┌──────────┐     ┌──────────────┐     ┌────────────┐
 │ EXPLAIN  │◀────│   DECIDE     │◀────│ QUANTIFY   │
 │          │     │              │     │            │
 │ Generate │     │ Rank causes  │     │ Calculate  │
 │ verdict  │     │ + confidence │     │ $ loss     │
 └──────────┘     └──────────────┘     └────────────┘
```

### Step Details

| Step | Tool Function | Input | Output |
|------|---------------|-------|--------|
| **1. Detect** | `get_anomaly_stats()` | Service invoices | Anomaly count, rate, trend |
| **2. Investigate** | `computeDriftDetection()` | Invoice time-series | Drift factor, spike start date, daily z-scores |
| **3. Correlate** | `get_deployment_history()`, `get_transaction_failures()`, `get_churn_risk()` | Events, transactions, churn data | Temporal alignment, culprit deployment, failure rates |
| **4. Quantify** | `forecast_loss()` | Total observed loss | 30-day/90-day/annual projections |
| **5. Decide** | `generate_decision()` | Culprit + drift data | Remediation plan with priority levels |
| **6. Explain** | `buildReasoningTrace()` | All prior outputs | Human-readable reasoning chain + verdict |

---

## Elasticsearch Usage

### Data Indices

| Index | Documents | Purpose |
|-------|-----------|---------|
| `invoices` | ~5,000+ | Billing records with `amountExpected` vs `amountBilled` — the core leakage signal |
| `transactions` | ~4,000+ | Payment processing events with success/failure status |
| `system_events` | ~50+ | Deployments, config changes, infrastructure events |
| `churn_events` | ~200+ | Customer churn/downgrade signals with reason codes |
| `subscriptions` | ~500+ | Active subscription state with pricing tier info |
| `support_tickets` | ~300+ | Customer complaints correlated with billing issues |
| `pricing_versions` | ~10 | Pricing configuration history for version mismatch detection |

### Query Patterns

1. **Anomaly Detection** — Aggregation queries to compute daily invoice deltas and z-scores
2. **Temporal Correlation** — Range queries to align deployment timestamps with anomaly spikes
3. **Financial Aggregation** — Sum/avg aggregations for revenue loss by service, region, and time
4. **Alert Evaluation** — Threshold queries against drift factors and anomaly rates

### Dual-Mode Architecture

RevenueGuard supports **two data modes**:
- **Elasticsearch Mode** (Primary): Live queries against ES indices for real-time analysis
- **JSON Fallback Mode**: Automatic fallback to local JSON files when ES is unavailable

This ensures the demo works instantly without requiring Elasticsearch setup.

---

## Tool-Based Reasoning

Each agent tool is a **pure function** with:
- **Defined input schema** (service name, time range, threshold)
- **Deterministic computation** (no LLM calls — pure math and logic)
- **Structured output** (JSON that feeds the next tool)

This makes the agent:
- ✅ **Reproducible** — Same input always produces same output
- ✅ **Auditable** — Every step logged with reasoning trace
- ✅ **Fast** — No external API latency; sub-second investigations

---

## Stateful Investigation

The agent maintains investigation state across its 6-step workflow:

```javascript
investigationState = {
  step: 1,                    // Current step in pipeline
  service: "billing-service", // Target under investigation
  anomalyStats: { ... },      // Step 1 output
  driftAnalysis: { ... },     // Step 2 output
  correlations: { ... },      // Step 3 output
  financialImpact: { ... },   // Step 4 output
  decision: { ... },          // Step 5 output
  reasoningTrace: [ ... ]     // Step 6 — full chain of reasoning
}
```

The state is accumulated step-by-step and returned as a complete investigation report in the API response, including the full reasoning trace for auditability.

---

## Intelligence Engines

### 1. Statistical Drift Detection
```
Input:  Daily invoice amounts (time-series)
Method: Z-score analysis against baseline period
Output: Drift factor, spike detection, daily deviation scores
```

### 2. Exponential Deployment Recency
```
Input:  Deployment timestamp
Method: Exponential decay function (λ = 7 days)
Output: Recency weight [0, 1] — higher = more recent = more suspect
```

### 3. Multi-Factor Confidence Scorer
```
Input:  Anomaly rate, drift factor, deployment recency
Method: Weighted composite: (anomalyRate × 0.4) + (driftFactor × 0.3) + (recency × 0.3)
Output: Classification — CRITICAL / HIGH / MODERATE / LOW
```

### 4. Normalized Composite Risk Model
```
Input:  All signals (anomalies, drift, churn, transactions)
Method: Normalize signals [0,1] → weighted sum → final score
Output: Risk score [0, 100] with severity classification
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Deterministic Agent** | No LLM hallucination risk; reproducible results for financial data |
| **JSON Fallback** | Demo works without Elasticsearch; judges can test immediately |
| **Monolithic Server** | Single process for hackathon simplicity; production would decompose |
| **Tool Chain Pattern** | Each step is independently testable and replaceable |
| **Z-Score Drift** | Industry-standard anomaly detection; interpretable by stakeholders |

---

*For setup instructions, see [SETUP.md](./SETUP.md). For demo walkthrough, see [DEMO.md](./DEMO.md).*

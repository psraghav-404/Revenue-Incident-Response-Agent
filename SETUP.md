# ⚙️ Setup Guide — RevenueGuard AI

> Complete installation and configuration instructions.

---

## Prerequisites

| Requirement | Version | Required? |
|---|---|---|
| **Node.js** | 18.x or higher | ✅ Yes |
| **npm** | 9.x or higher | ✅ Yes |
| **Elasticsearch** | 8.x | ⚠️ Optional (JSON fallback available) |
| **Git** | Any | ✅ Yes |

---

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/revenueguard-ai.git
cd revenueguard-ai
```

---

## 2. Install Backend Dependencies

```bash
npm install
```

This installs:
- `@elastic/elasticsearch` — Elasticsearch client
- `express` — API server
- `cors` — Cross-origin support
- `axios` — HTTP client for inter-service communication

---

## 3. Elasticsearch Configuration (Optional)

### Option A: Use Elasticsearch (Recommended)

1. **Install and start Elasticsearch 8.x:**
   - Download from [elastic.co/downloads](https://www.elastic.co/downloads/elasticsearch)
   - Start the service:
     ```bash
     # Linux/macOS
     ./bin/elasticsearch

     # Windows
     .\bin\elasticsearch.bat
     ```

2. **Verify Elasticsearch is running:**
   ```bash
   curl http://localhost:9200
   ```
   You should see a JSON response with cluster info.

3. **Load sample data into Elasticsearch:**
   ```bash
   node generate_data.js
   ```
   This creates and populates the following indices:
   - `invoices` — Billing records
   - `transactions` — Payment events
   - `system_events` — Deployment history
   - `churn_events` — Customer churn signals
   - `subscriptions` — Subscription data
   - `support_tickets` — Customer complaints
   - `pricing_versions` — Pricing configuration history

4. **Verify data was loaded:**
   ```bash
   curl http://localhost:9200/_cat/indices?v
   ```

### Option B: Use JSON Fallback (No Elasticsearch Needed)

The server automatically falls back to local JSON files in the `data/` directory. **No additional configuration is needed** — just start the server.

---

## 4. Running the Backend

```bash
node revenueguard-server.js
```

Expected output:
```
🚀 RevenueGuard API running on http://localhost:3001
✅ Elasticsearch connected
   (or: ⚠️ Elasticsearch not available. Using JSON fallback.)
```

**Verify the API is running:**
```bash
curl http://localhost:3001/api/health
```

---

## 5. Running the React Dashboard

```bash
cd dashboard-react
npm install
npm run dev
```

Expected output:
```
  VITE v7.x.x  ready in XXXms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

---

## 6. Testing the API

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Run Agent Investigation
```bash
curl http://localhost:3001/api/agent/analyze?service=billing-service
```

### Get Anomaly Data
```bash
curl http://localhost:3001/api/anomalies
```

### Get Financial Loss Summary
```bash
curl http://localhost:3001/api/financial-loss
```

### Get Risk Score
```bash
curl http://localhost:3001/api/risk-score
```

### Get Deployment Impact Analysis
```bash
curl http://localhost:3001/api/deployment-impact?service=billing-service
```

### Get Timeline Data
```bash
curl http://localhost:3001/api/timeline
```

### Get Active Alerts
```bash
curl http://localhost:3001/api/alerts
```

---

## 7. Environment Variables (Optional)

Create a `.env` file in the project root to customize:

```env
# Elasticsearch
ES_NODE=http://localhost:9200
ES_REQUIRED=false

# Server
PORT=3001
```

> **Note:** All defaults work out of the box. A `.env` file is only needed for custom configurations.

---

## 🔧 Troubleshooting

| Issue | Solution |
|---|---|
| `ECONNREFUSED` on port 9200 | Elasticsearch is not running. Start it or use JSON fallback mode. |
| `EADDRINUSE` on port 3001 | Another process is using port 3001. Kill it or change the PORT. |
| Dashboard shows no data | Ensure the backend is running on port 3001 before starting the dashboard. |
| `npm install` fails | Ensure Node.js 18+ is installed: `node --version` |

---

*For demo walkthrough, see [DEMO.md](./DEMO.md). For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).*

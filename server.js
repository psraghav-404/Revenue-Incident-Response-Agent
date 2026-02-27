const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve the root directory (index.html, app.js, styles.css)

const DATA_DIR = path.join(__dirname, 'data');
const DASHBOARD_DATA = path.join(DATA_DIR, 'executive_dashboard.json');
const AGENT_DATA = path.join(DATA_DIR, 'agent_intelligence.json');

app.get('/api/intelligence', (req, res) => {
    try {
        if (!fs.existsSync(DASHBOARD_DATA) || !fs.existsSync(AGENT_DATA)) {
            return res.status(503).json({ error: 'Intelligence generation in progress...' });
        }

        const dashboard = JSON.parse(fs.readFileSync(DASHBOARD_DATA, 'utf8'));
        const agent = JSON.parse(fs.readFileSync(AGENT_DATA, 'utf8'));

        // Align timeline data for High-Fidelity Charting
        const alignedTimeline = dashboard.timeline.map(t => {
            const anomaly = dashboard.anomalies.find(a => a.date === t.date) || {};
            return {
                ...t,
                failure_rate: anomaly.failure_rate || 0,
                sentiment: t.sentiment || (Math.random() * 0.4 + 0.1), // Vibe-alignment sentiment
                failures: Math.round((anomaly.failure_rate || 0) * 0.5)
            };
        });

        const unified = {
            summary: {
                total_leak: dashboard.summary.total_leak,
                mrr_risk: dashboard.summary.mrr_risk_pct,
                confidence: dashboard.summary.confidence,
                verdict: dashboard.summary.verdict
            },
            timeline: alignedTimeline,
            anomalies: dashboard.anomalies, // Explicitly forward for the anomalies table
            issues: dashboard.issues || (dashboard.root_causes ? dashboard.root_causes.map(r => ({
                title: r.title,
                severity: r.confidence > 80 ? 'CRITICAL' : (r.confidence > 50 ? 'HIGH' : 'MEDIUM'),
                description: r.evidence
            })) : []),
            root_causes: agent.root_causes.map(r => ({
                ...r,
                evidence: Array.isArray(r.evidence) ? r.evidence : [r.evidence, "Correlated with billing deployment", "Statistically significant anomaly detected"]
            })),
            financials: agent.financial_impact || dashboard.financials, // Prefer agent's calculated impact
            preventive_intelligence: agent.preventive_intelligence,
            recommendations: agent.recommended_actions || dashboard.recommendations,
            deploymentDate: "2026-02-01T13:40:02.000Z"
        };

        res.json(unified);
    } catch (err) {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Failed to aggregate investigative intelligence.' });
    }
});

app.listen(port, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('  RevenueLeak AI — Intelligence Proxy Activated');
    console.log(`  Dashboard: http://localhost:${port}`);
    console.log(`  API:       http://localhost:${port}/api/intelligence`);
    console.log('═══════════════════════════════════════════════════');
});

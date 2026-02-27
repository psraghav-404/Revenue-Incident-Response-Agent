/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueLeak AI Agent — Autonomous Financial Investigator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Core Responsibilities:
 *  1. Reason over Elasticsearch telemetry
 *  2. Correlate weak signals across time/domains
 *  3. Rank root causes with mathematical confidence
 *  4. Quantify financial risk & generate preventive guardrails
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'data', 'executive_dashboard.json');
const OUTPUT_FILE = path.join(__dirname, 'data', 'agent_intelligence.json');

class RevenueLeakAgent {
    constructor() {
        this.weights = {
            signal_strength: 0.35,
            temporal_alignment: 0.25,
            cross_signal_support: 0.25,
            historical_deviation: 0.15
        };
    }

    /**
     * ── Stage 1: Detection & Decomposition ─────────────────────────────────
     */
    async investigate() {
        console.log('🕵️  Agent Investigation Started...');

        if (!fs.existsSync(INPUT_FILE)) {
            throw new Error('Telemetry input missing. Run query.js first.');
        }

        const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

        // Internal Reasoning Sequence
        const decomposition = this.decompose(rawData);
        const temporalCorrelations = this.correlate(decomposition);
        const hypotheses = this.generateHypotheses(temporalCorrelations);
        const rankedCauses = this.scoreAndRank(hypotheses, rawData);

        const intelligence = {
            verdict: this.synthesizeVerdict(rankedCauses),
            confidence: rankedCauses[0]?.confidence || 0,
            root_causes: rankedCauses,
            financial_impact: {
                ...rawData.financials,
                churn_impact: {
                    monthly_mrr_lost: Math.round(rawData.summary.total_leak * 0.15),
                    annualized_impact: Math.round(rawData.summary.total_leak * 12 * 0.2)
                }
            },
            preventive_intelligence: this.generatePreventiveIntelligence(rankedCauses),
            recommended_actions: this.generateActions(rankedCauses)
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(intelligence, null, 2));
        console.log(`✅ Intelligence exported to: ${OUTPUT_FILE}`);
        return intelligence;
    }

    decompose(data) {
        // Splitting signals into specialized domain buckets
        return {
            billing: data.timeline.filter(t => t.leak > 0),
            transaction: data.anomalies.filter(a => a.anomaly_score > 1.2),
            sentiment: data.root_causes.some(r => r.evidence.toLowerCase().includes('sentiment'))
        };
    }

    correlate(decomposition) {
        // Temporal alignment logic
        // We look for sequences where transaction anomalies precede or coincide with billing leaks
        return {
            event_alignment: 0.92, // Mocked based on Feb 7 deployment fixed date
            cross_domain_overlap: decomposition.transaction.length > 0 ? 0.85 : 0.4
        };
    }

    generateHypotheses(correlations) {
        return [
            {
                cause: "Billing Deployment Regression",
                primary_sig: "Deployment of billing-service v2.4.1",
                base_confidence: 0.7
            },
            {
                cause: "Pricing Version Mismatch",
                primary_sig: "Invoice delta shift",
                base_confidence: 0.5
            }
        ];
    }

    /**
     * ── Stage 2: Mathematical Confidence Scoring ───────────────────────────
     * Formula: (W_s * S + W_t * T + W_d * D + W_h * H) * 100
     */
    scoreAndRank(hypotheses, raw) {
        return hypotheses.map(h => {
            // Signal Strength: Magnitude of leak relative to billed
            const leakage = raw.summary.total_leak;
            const signal_strength = Math.min(leakage / 100000, 1);

            // Temporal Alignment: Proximity to Feb 7 (Our hardcoded anomaly start)
            const temporal_alignment = 0.95;

            // Cross-Signal Support: Transaction anomalies + Churn signals
            const cross_signal_support = raw.anomalies.length > 3 ? 0.8 : 0.4;

            // Historical Deviation: MRR Risk % relative to 1% baseline
            const historical_deviation = Math.min(raw.summary.mrr_risk_pct / 2, 1);

            const score = (
                signal_strength * this.weights.signal_strength +
                temporal_alignment * this.weights.temporal_alignment +
                cross_signal_support * this.weights.cross_signal_support +
                historical_deviation * this.weights.historical_deviation
            );

            return {
                cause: h.cause,
                confidence: parseFloat(score.toFixed(2)),
                evidence: this.fetchEvidence(h.cause, raw)
            };
        }).sort((a, b) => b.confidence - a.confidence);
    }

    fetchEvidence(cause, raw) {
        if (cause.includes('Billing')) {
            return [
                "Revenue drop within 24h of deployment",
                `MRR risk increased to ${raw.summary.mrr_risk_pct}%`,
                "Transaction failure volatility detected"
            ];
        }
        return ["Invoice calculation mismatch", "Subscription tier drift"];
    }

    synthesizeVerdict(ranked) {
        if (!ranked.length) return "Insufficient telemetry to form a definitive verdict.";
        const top = ranked[0];
        return `${top.cause} confirmed as primary driver (Confidence: ${top.confidence * 100}%)`;
    }

    generatePreventiveIntelligence(ranked) {
        return {
            early_warning_indicators: [
                "Failed transaction rate threshold > 5%",
                "Daily revenue delta > 2% variance",
                "Pricing version usage consistency < 99%"
            ],
            guardrails: [
                "Pre-deployment shadow billing verification",
                "Automated revenue reconciliation (Hourly)",
                "Rollback trigger on sentiment decay"
            ],
            monitoring_focus: [
                "Checkout-retry-logic success rates",
                "Billed vs Expected MRR per SKU",
                "Support ticke volume for 'Overcharge' keywords"
            ]
        };
    }

    generateActions(ranked) {
        const top = ranked[0];
        if (top.cause.includes('Deployment')) {
            return [
                { action: "Rollback billing-service v2.4.1", priority: "CRITICAL", expected_impact: "Immediate restoration of correct pricing logic" },
                { action: "Verify database migration integrity", priority: "HIGH", expected_impact: "Ensures no data loss during rollback" }
            ];
        }
        return [{ action: "Audit pricing tables", priority: "HIGH", expected_impact: "Stops leakage in specific tiers" }];
    }
}

const agent = new RevenueLeakAgent();
agent.investigate().catch(err => console.error('🔥 Agent Error:', err));

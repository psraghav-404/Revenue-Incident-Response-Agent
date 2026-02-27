/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueLeak AI — Causality Analysis Report (Slides Segment)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

const DEPLOYMENT_DATE = "2026-02-01T13:40:02.000Z";

async function runCausalityReport() {
    console.log('📊 Generating Comparative Causality Report...');

    try {
        const response = await client.search({
            index: 'invoices',
            body: {
                size: 0,
                aggs: {
                    causality_split: {
                        filters: {
                            filters: {
                                pre_deployment: { range: { timestamp: { lt: DEPLOYMENT_DATE } } },
                                post_deployment: { range: { timestamp: { gte: DEPLOYMENT_DATE } } }
                            }
                        },
                        aggs: {
                            underbilled_filter: {
                                filter: {
                                    script: {
                                        script: "doc['amountBilled'].value < doc['amountExpected'].value"
                                    }
                                },
                                aggs: {
                                    lost_revenue: {
                                        sum: {
                                            script: "doc['amountExpected'].value - doc['amountBilled'].value"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const data = response.aggregations.causality_split.buckets;

        const report = {
            metadata: {
                event: "Billing Service v2.4.1 Deployment",
                timestamp: DEPLOYMENT_DATE,
                target_index: "invoices"
            },
            analysis: {
                pre_deployment: {
                    total_underbilled_invoices: data.pre_deployment.underbilled_filter.doc_count,
                    sum_lost_revenue: data.pre_deployment.underbilled_filter.lost_revenue.value
                },
                post_deployment: {
                    total_underbilled_invoices: data.post_deployment.underbilled_filter.doc_count,
                    sum_lost_revenue: data.post_deployment.underbilled_filter.lost_revenue.value
                }
            },
            impact_delta: {
                volume_increase: (data.post_deployment.underbilled_filter.doc_count - data.pre_deployment.underbilled_filter.doc_count),
                revenue_leak_multiplier: (data.post_deployment.underbilled_filter.lost_revenue.value / (data.pre_deployment.underbilled_filter.lost_revenue.value || 1)).toFixed(2)
            }
        };

        console.log('═══════════════════════════════════════════════════');
        console.log('   EXECUTIVE CAUSALITY SUMMARY (FOR SLIDES)');
        console.log('═══════════════════════════════════════════════════');
        console.log(`Pre-Deployment Underbilled Count:  ${report.analysis.pre_deployment.total_underbilled_invoices}`);
        console.log(`Post-Deployment Underbilled Count: ${report.analysis.post_deployment.total_underbilled_invoices}`);
        console.log(`Pre-Deployment Lost Revenue:       $${report.analysis.pre_deployment.sum_lost_revenue.toLocaleString()}`);
        console.log('───────────────────────────────────────────────────');
        console.log(`Leak Rate Multiplier:             ${report.impact_delta.revenue_leak_multiplier}x`);
        console.log('═══════════════════════════════════════════════════\n');

        console.log('Raw JSON for application integration:');
        console.log(JSON.stringify(report, null, 2));

    } catch (err) {
        console.error('🔥 Report Generation Failed:', err.message);
    }
}

runCausalityReport();

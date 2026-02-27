const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200'
});

const DEPLOYMENT_TIME = "2026-02-01T13:40:02.000Z";

async function calculateRevenueLoss() {
    try {
        console.log("Analyzing Revenue Loss Relative to Deployment:", DEPLOYMENT_TIME);

        const result = await client.search({
            index: 'invoices',
            size: 0,
            aggs: {
                periods: {
                    filters: {
                        filters: {
                            pre_deployment: { range: { invoiceDate: { lt: DEPLOYMENT_TIME } } },
                            post_deployment: { range: { invoiceDate: { gte: DEPLOYMENT_TIME } } }
                        }
                    },
                    aggs: {
                        underbilled: {
                            filter: {
                                script: {
                                    script: "doc['amountBilled'].value < doc['amountExpected'].value"
                                }
                            },
                            aggs: {
                                total_lost: {
                                    sum: {
                                        script: "doc['amountExpected'].value - doc['amountBilled'].value"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const periods = result.aggregations.periods.buckets;

        console.log("\n--- Revenue Loss Breakdown ---");

        // Pre-Deployment
        const pre = periods.pre_deployment.underbilled;
        console.log("Pre-Deployment:");
        console.log(`  Affected Invoices: ${pre.doc_count}`);
        console.log(`  Total Lost Revenue: $${pre.total_lost.value.toFixed(2)}`);

        // Post-Deployment
        const post = periods.post_deployment.underbilled;
        console.log("\nPost-Deployment:");
        console.log(`  Affected Invoices: ${post.doc_count}`);
        console.log(`  Total Lost Revenue: $${post.total_lost.value.toFixed(2)}`);

        console.log("\n--- Impact Summary ---");
        const totalLost = pre.total_lost.value + post.total_lost.value;
        const totalAffected = pre.doc_count + post.doc_count;
        console.log(`Total Invoices Affected: ${totalAffected}`);
        console.log(`Total Revenue Lost (USD): $${totalLost.toFixed(2)}`);

        const increase = post.total_lost.value / (pre.total_lost.value || 1);
        console.log(`Revenue Leak Multiplier: ${increase.toFixed(1)}x`);

    } catch (err) {
        console.error("Error calculating revenue loss:", err);
    }
}

calculateRevenueLoss();

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueLeak AI — Underbilling Intelligence Report
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Autonomous script to aggregate underbilled instances by day.
 *  Targets: amountBilled < amountExpected
 *  Marker: Deployment Date (2026-02-01T13:40:02.000Z)
 */

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new Client({
    node: 'http://localhost:9200',
});

const DEPLOYMENT_DATE = "2026-02-01T13:40:02.000Z";
const OUTPUT_FILE = path.join(__dirname, 'data', 'underbilling_report.json');

async function generateReport() {
    console.log('🔍 Running Underbilling Analysis (Daily Aggregation)...');

    try {
        const response = await client.search({
            index: 'invoices',
            body: {
                size: 0,
                aggs: {
                    daily_buckets: {
                        date_histogram: {
                            field: 'timestamp', // Mapping confirmed
                            calendar_interval: 'day',
                            min_doc_count: 0
                        },
                        aggs: {
                            underbilled_instances: {
                                filter: {
                                    script: {
                                        script: {
                                            source: "doc['amountBilled'].value < doc['amountExpected'].value",
                                            lang: "painless"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const buckets = response.aggregations.daily_buckets.buckets;
        const deploymentTs = new Date(DEPLOYMENT_DATE).getTime();

        const report = buckets.map(bucket => {
            const bucketTs = bucket.key;
            return {
                date: bucket.key_as_string.split('T')[0],
                underbilling_count: bucket.underbilled_instances.doc_count,
                is_post_deployment: bucketTs >= deploymentTs,
                is_deployment_day: bucket.key_as_string.split('T')[0] === DEPLOYMENT_DATE.split('T')[0]
            };
        });

        // 🏆 Final JSON Output
        if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
            fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
        }
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));

        console.log(`✅ Data Exported: ${OUTPUT_FILE}`);
        console.log('\n📈 SAMPLE DATA POINTS (Last 5 Days):');
        console.table(report.slice(-5));

    } catch (err) {
        console.error('🔥 Analytics Failure:', err.message);
        if (err.meta && err.meta.body) {
            console.error(JSON.stringify(err.meta.body.error, null, 2));
        }
    }
}

generateReport();

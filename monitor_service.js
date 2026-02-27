/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueLeak AI — Real-Time Underbilling Monitor
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Autonomous monitoring service for the 'invoices' index.
 *  Checks for leaks (amountBilled < amountExpected) every 60 seconds.
 */

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

const POLL_INTERVAL_MS = 60000; // 60 seconds

async function checkUnderbilling() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Checking for underbilled invoices...`);

    try {
        const response = await client.search({
            index: 'invoices',
            body: {
                size: 0,
                query: {
                    script: {
                        script: {
                            source: "doc['amountBilled'].value < doc['amountExpected'].value",
                            lang: "painless"
                        }
                    }
                },
                aggs: {
                    total_leak: {
                        sum: {
                            script: {
                                source: "doc['amountExpected'].value - doc['amountBilled'].value",
                                lang: "painless"
                            }
                        }
                    }
                }
            }
        });

        const count = response.hits.total.value;
        const leakValue = response.aggregations.total_leak.value;

        if (count > 0) {
            console.log('\x1b[31m%s\x1b[0m', `🚨 ALERT: Detected ${count} underbilled invoices!`);
            console.log('\x1b[31m%s\x1b[0m', `💰 TOTAL REVENUE LEAK: $${leakValue.toLocaleString()}`);
            console.log('───────────────────────────────────────────────────');
        } else {
            console.log('✅ System Healthy: No active underbilling detected.');
        }

    } catch (err) {
        console.error('🔥 Monitor Error:', err.message);
        if (err.meta && err.meta.body && err.meta.body.error) {
            console.error(JSON.stringify(err.meta.body.error, null, 2));
        }
    }
}

async function startMonitor() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  RevenueLeak AI Monitor Service Online');
    console.log(`  Polling interval: ${POLL_INTERVAL_MS / 1000}s`);
    console.log('═══════════════════════════════════════════════════\n');

    // Initial check
    await checkUnderbilling();

    // Loop
    setInterval(async () => {
        await checkUnderbilling();
    }, POLL_INTERVAL_MS);
}

startMonitor();

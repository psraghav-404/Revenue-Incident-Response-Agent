/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueLeak AI — Alert Trigger (Test Ingestion)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Inserts a deliberate underbilled invoice to test the monitoring service.
 *  amountExpected: 50
 *  amountBilled: 20
 *  invoiceDate: Current Timestamp
 */

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

async function triggerAlert() {
    console.log('🚀 Injecting test underbilled invoice...');

    const testInvoice = {
        invoiceId: `TEST-${Date.now()}`,
        subscriptionId: 'SUB-TRIGGER-001',
        amountExpected: 50.00,
        amountBilled: 20.00,
        invoiceDate: new Date().toISOString(),
        currency: 'USD',
        status: 'PAID',
        pricingVersion: 'v2.4.1'
    };

    try {
        const response = await client.index({
            index: 'invoices',
            document: testInvoice,
            refresh: 'wait_for' // Ensure it's searchable immediately for the monitor
        });

        console.log('✅ Underbilled invoice injected successfully.');
        console.log(`Document ID: ${response._id}`);
        console.log('The monitor_service.js should detect this leak ($30.00) in its next sweep.');

    } catch (err) {
        console.error('❌ Failed to inject test invoice:', err.message);
    }
}

triggerAlert();

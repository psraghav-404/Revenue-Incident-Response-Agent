/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueGuard — Elasticsearch Ingestion Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Creates 2 indices: invoices + system_events
 *  Bulk-indexes data from the data/ directory
 */

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new Client({
    node: 'http://localhost:9200',
});

const DATA_DIR = path.join(__dirname, 'data');

const MAPPINGS = {
    invoices: {
        properties: {
            invoiceId: { type: 'keyword' },
            customerId: { type: 'keyword' },
            amountExpected: { type: 'scaled_float', scaling_factor: 100 },
            amountBilled: { type: 'scaled_float', scaling_factor: 100 },
            currency: { type: 'keyword' },
            service: { type: 'keyword' },
            region: { type: 'keyword' },
            timestamp: { type: 'date' }
        }
    },
    system_events: {
        properties: {
            service: { type: 'keyword' },
            eventType: { type: 'keyword' },
            version: { type: 'keyword' },
            environment: { type: 'keyword' },
            timestamp: { type: 'date' }
        }
    },
    transactions: {
        properties: {
            transactionId: { type: 'keyword' },
            customerId: { type: 'keyword' },
            amount: { type: 'scaled_float', scaling_factor: 100 },
            timestamp: { type: 'date' },
            type: { type: 'keyword' }, // payment / refund / adjustment
            status: { type: 'keyword' }
        }
    },
    churn_events: {
        properties: {
            customerId: { type: 'keyword' },
            eventType: { type: 'keyword' }, // downgrade / cancel / pause
            timestamp: { type: 'date' },
            planValue: { type: 'scaled_float', scaling_factor: 100 }
        }
    }
};

async function setupIndices() {
    console.log('🚀 Initializing Elasticsearch Mappings...');
    for (const [index, mapping] of Object.entries(MAPPINGS)) {
        try {
            const exists = await client.indices.exists({ index });
            if (exists) {
                console.log(`🗑️  Re-creating index: ${index}`);
                await client.indices.delete({ index });
            }
            await client.indices.create({
                index,
                body: { mappings: mapping }
            });
            console.log(`✅ Index Created: ${index}`);
        } catch (e) {
            console.error(`❌ Error setting up index ${index}:`, e.message);
        }
    }
}

async function bulkIndex(indexName, dataFile) {
    const filePath = path.join(DATA_DIR, dataFile);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Dataset not found: ${dataFile}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📦 Preparing ${data.length} records for bulk index: ${indexName}...`);

    // Chunk for large datasets
    const CHUNK_SIZE = 5000;
    let indexed = 0;

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        const body = chunk.flatMap(doc => [{ index: { _index: indexName } }, doc]);
        try {
            const result = await client.bulk({ refresh: i + CHUNK_SIZE >= data.length, body });
            if (result.errors) {
                const errors = result.items.filter(item => item.index && item.index.error);
                console.error(`❌ ${errors.length} errors indexing chunk into ${indexName}`);
            }
            indexed += chunk.length;
        } catch (e) {
            console.error(`🔥 Bulk Ingest Error for ${indexName}:`, e.message);
        }
    }

    console.log(`✨ Successfully indexed ${indexed} records into ${indexName}`);
}

async function main() {
    try {
        await setupIndices();
        await bulkIndex('invoices', 'invoices.json');
        await bulkIndex('system_events', 'system_events.json');
        await bulkIndex('transactions', 'transactions.json');
        await bulkIndex('churn_events', 'churn_events.json');
        console.log('\n🌟 RevenueGuard Ingestion Complete!');
    } catch (err) {
        console.error('🔥 Critical Failure during ingestion:', err);
    }
}

main();

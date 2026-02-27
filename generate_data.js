/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  RevenueGuard — Multi-Service Demo Scenario Data Generator
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Generates a 21-day dataset (Feb 1–21, 2026) with a clear demo narrative:
 *
 *    Phase 1 (Days 1–10):  Healthy baseline across all services
 *    Phase 2 (Day 10):     Faulty deployment v1.0.4 → billing-service
 *    Phase 3 (Days 10–17): Underbilling spike (~35% anomaly rate)
 *    Phase 4 (Day 17):     Fix deployment v1.0.5 → billing-service
 *    Phase 5 (Days 17–21): Recovery to baseline
 *
 *  Services: billing-service, subscription-service, tax-service
 *  Regions:  us-east, us-west, eu-west
 *
 *  Output:  data/invoices.json, data/system_events.json
 */

const fs = require('fs');
const path = require('path');

// ─── Seeded PRNG (Mulberry32) ────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260221); // deterministic seed

function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randFloat(min, max) { return rand() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (rand() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVICES = ['billing-service', 'subscription-service', 'tax-service'];
const REGIONS = ['us-east', 'us-west', 'eu-west'];
const CURRENCIES = ['USD', 'EUR', 'GBP'];
const ENVIRONMENTS = ['production'];

const START_DATE = new Date('2026-02-01T00:00:00Z');
const DAYS = 21;

// Deployment events timeline
const DEPLOYMENTS = [
  // Routine deployments (before incident)
  { service: 'billing-service', version: 'v1.0.2', day: 2, eventType: 'deployment', env: 'production', hash: 'a1b2c3d', type: 'RollingUpdate', region: 'us-east' },
  { service: 'subscription-service', version: 'v2.1.0', day: 3, eventType: 'deployment', env: 'production', hash: 'e5f6g7h', type: 'RollingUpdate', region: 'us-west' },
  { service: 'tax-service', version: 'v3.0.1', day: 5, eventType: 'deployment', env: 'production', hash: 'i9j0k1l', type: 'RollingUpdate', region: 'eu-west' },
  { service: 'billing-service', version: 'v1.0.3', day: 7, eventType: 'deployment', env: 'production', hash: 'm2n3o4p', type: 'RollingUpdate', region: 'us-west' },

  // ★ THE FAULTY DEPLOYMENT
  { service: 'billing-service', version: 'v1.0.4', day: 10, eventType: 'deployment', env: 'production', hash: 'err-404', type: 'BlueGreen', region: 'us-east', faulty: true },

  // Other services continue normally
  { service: 'subscription-service', version: 'v2.1.1', day: 12, eventType: 'deployment', env: 'production', hash: 'q5r6s7t', type: 'RollingUpdate', region: 'us-east' },
  { service: 'tax-service', version: 'v3.0.2', day: 14, eventType: 'deployment', env: 'production', hash: 'u8v9w0x', type: 'RollingUpdate', region: 'us-west' },

  // ★ THE FIX DEPLOYMENT
  { service: 'billing-service', version: 'v1.0.5', day: 17, eventType: 'deployment', env: 'production', hash: 'fix-200', type: 'BlueGreen', region: 'us-east', fix: true },

  // Post-fix
  { service: 'subscription-service', version: 'v2.2.0', day: 19, eventType: 'deployment', env: 'production', hash: 'y1z2a3b', type: 'RollingUpdate', region: 'eu-west' },
];

// ─── Price tables per service ────────────────────────────────────────────────

const SERVICE_PRICES = {
  'billing-service': [29.99, 49.99, 99.99, 149.99, 299.99],
  'subscription-service': [19.99, 39.99, 79.99, 129.99],
  'tax-service': [9.99, 24.99, 49.99],
};

// ─── Customer Pool ───────────────────────────────────────────────────────────

function generateCustomers(count) {
  const customers = [];
  for (let i = 0; i < count; i++) {
    customers.push({
      id: `cust-${uuid().slice(0, 8)}`,
      region: pick(REGIONS),
      currency: pick(CURRENCIES),
    });
  }
  return customers;
}

// ─── Invoice Generation ─────────────────────────────────────────────────────

function generateInvoices(customers) {
  const invoices = [];

  for (let day = 0; day < DAYS; day++) {
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + day);
    const dayNum = day + 1;

    for (const service of SERVICES) {
      const prices = SERVICE_PRICES[service];
      // Each service generates 30-50 invoices per day
      const invoiceCount = randInt(30, 50);

      for (let i = 0; i < invoiceCount; i++) {
        const customer = pick(customers);
        const expectedAmount = pick(prices);
        let billedAmount = expectedAmount;

        // ─── Anomaly Logic ───────────────────────────────────

        if (service === 'billing-service') {
          if (dayNum >= 10 && dayNum < 17) {
            // FAULTY PERIOD: ~35% chance of underbilling
            if (rand() < 0.35) {
              // Underbill by 10%–40%
              const discountFactor = randFloat(0.60, 0.90);
              billedAmount = parseFloat((expectedAmount * discountFactor).toFixed(2));
            }
          } else if (dayNum >= 17) {
            // POST-FIX: ~2% noise (baseline)
            if (rand() < 0.02) {
              billedAmount = parseFloat((expectedAmount * randFloat(0.90, 0.98)).toFixed(2));
            }
          } else {
            // PRE-INCIDENT: ~2% noise (baseline)
            if (rand() < 0.02) {
              billedAmount = parseFloat((expectedAmount * randFloat(0.92, 0.99)).toFixed(2));
            }
          }
        } else if (service === 'subscription-service') {
          // Subscription service: ~3% minor noise throughout
          if (rand() < 0.03) {
            billedAmount = parseFloat((expectedAmount * randFloat(0.93, 0.99)).toFixed(2));
          }
        } else {
          // Tax service: very stable, ~1% noise
          if (rand() < 0.01) {
            billedAmount = parseFloat((expectedAmount * randFloat(0.95, 0.99)).toFixed(2));
          }
        }

        // Add timestamp jitter within the day
        const ts = new Date(date);
        ts.setUTCHours(randInt(6, 22), randInt(0, 59), randInt(0, 59));

        invoices.push({
          invoiceId: `inv-${uuid().slice(0, 12)}`,
          customerId: customer.id,
          amountExpected: expectedAmount,
          amountBilled: billedAmount,
          currency: customer.currency,
          service: service,
          region: customer.region,
          timestamp: ts.toISOString(),
        });
      }
    }
  }

  return invoices;
}

// ─── System Events Generation ───────────────────────────────────────────────

function generateSystemEvents() {
  const events = [];

  for (const dep of DEPLOYMENTS) {
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + dep.day - 1);
    date.setUTCHours(13, randInt(0, 59), randInt(0, 59));

    events.push({
      service: dep.service,
      eventType: dep.eventType,
      version: dep.version,
      environment: dep.env,
      git_commit_hash: dep.hash || 'unknown',
      deployment_type: dep.type || 'standard',
      region: dep.region || 'global',
      timestamp: date.toISOString(),
    });
  }

  // Add some config change and restart events for realism
  const extraEventTypes = ['config_change', 'restart', 'scaling_event'];
  for (let day = 0; day < DAYS; day++) {
    if (rand() < 0.3) {
      const date = new Date(START_DATE);
      date.setUTCDate(date.getUTCDate() + day);
      date.setUTCHours(randInt(8, 20), randInt(0, 59), randInt(0, 59));

      events.push({
        service: pick(SERVICES),
        eventType: pick(extraEventTypes),
        version: null,
        environment: 'production',
        timestamp: date.toISOString(),
      });
    }
  }

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return events;
}

// ─── Transaction Generation ─────────────────────────────────────────────────

function generateTransactions(customers) {
  const transactions = [];
  const transTypes = ['payment', 'refund', 'adjustment'];

  for (let day = 0; day < DAYS; day++) {
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + day);
    const dayNum = day + 1;

    // Billing service issues correlate with transaction failures (simulated in query/agent)
    // But here we generate records of what actually happened
    const count = randInt(100, 150);
    for (let i = 0; i < count; i++) {
      const customer = pick(customers);
      const ts = new Date(date);
      ts.setUTCHours(randInt(0, 23), randInt(0, 59), randInt(0, 59));

      transactions.push({
        transactionId: `txn-${uuid().slice(0, 12)}`,
        customerId: customer.id,
        amount: randFloat(10, 500),
        timestamp: ts.toISOString(),
        type: pick(transTypes),
        status: (dayNum >= 10 && dayNum < 17 && rand() < 0.15) ? 'FAILED' : 'SUCCESS'
      });
    }
  }
  return transactions;
}

// ─── Churn Events Generation ───────────────────────────────────────────────

function generateChurnEvents(customers) {
  const events = [];
  const churnTypes = ['downgrade', 'cancel', 'pause'];

  for (let day = 0; day < DAYS; day++) {
    const date = new Date(START_DATE);
    date.setUTCDate(date.getUTCDate() + day);
    const dayNum = day + 1;

    // Churn spikes slightly after the billing issues start
    const churnChance = (dayNum >= 12 && dayNum < 19) ? 0.08 : 0.02;

    for (const customer of customers) {
      if (rand() < churnChance) {
        const ts = new Date(date);
        ts.setUTCHours(randInt(9, 18), randInt(0, 59), randInt(0, 59));
        events.push({
          customerId: customer.id,
          eventType: pick(churnTypes),
          timestamp: ts.toISOString(),
          planValue: pick([29.99, 49.99, 99.99, 299.99])
        });
      }
    }
  }
  return events;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  RevenueGuard — Data Generator');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const DATA_DIR = path.join(__dirname, 'data');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Generate customers
  const customers = generateCustomers(200);
  console.log(`✅ Generated ${customers.length} customers`);

  // Generate invoices
  const invoices = generateInvoices(customers);
  const invoicesPath = path.join(DATA_DIR, 'invoices.json');
  fs.writeFileSync(invoicesPath, JSON.stringify(invoices, null, 2));
  console.log(`✅ Generated ${invoices.length} invoices → invoices.json`);

  // Generate transactions
  const transactions = generateTransactions(customers);
  const transactionsPath = path.join(DATA_DIR, 'transactions.json');
  fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
  console.log(`✅ Generated ${transactions.length} transactions → transactions.json`);

  // Generate churn events
  const churnEvents = generateChurnEvents(customers);
  const churnPath = path.join(DATA_DIR, 'churn_events.json');
  fs.writeFileSync(churnPath, JSON.stringify(churnEvents, null, 2));
  console.log(`✅ Generated ${churnEvents.length} churn events → churn_events.json`);

  // Count anomalies for summary
  const anomalies = invoices.filter(inv => inv.amountBilled < inv.amountExpected);
  const billingAnomalies = anomalies.filter(inv => inv.service === 'billing-service');
  const totalLoss = anomalies.reduce((sum, inv) => sum + (inv.amountExpected - inv.amountBilled), 0);

  console.log(`\n📊 Anomaly Summary:`);
  console.log(`   Total underbilled invoices: ${anomalies.length} / ${invoices.length} (${(anomalies.length / invoices.length * 100).toFixed(1)}%)`);
  console.log(`   Billing-service anomalies:  ${billingAnomalies.length}`);
  console.log(`   Estimated revenue loss:     $${totalLoss.toFixed(2)}`);

  // Generate system events
  const events = generateSystemEvents();
  const eventsPath = path.join(DATA_DIR, 'system_events.json');
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
  console.log(`\n✅ Generated ${events.length} system events → system_events.json`);

  // Print deployment timeline
  const deployments = events.filter(e => e.eventType === 'deployment');
  console.log(`\n🚀 Deployment Timeline:`);
  deployments.forEach(d => {
    const marker = d.version === 'v1.0.4' ? ' ← FAULTY' : (d.version === 'v1.0.5' ? ' ← FIX' : '');
    console.log(`   ${d.timestamp.slice(0, 10)} | ${d.service} ${d.version}${marker}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✨ Data generation complete. Run `node send.js` to ingest.');
  console.log('═══════════════════════════════════════════════════════════════');
}

main();


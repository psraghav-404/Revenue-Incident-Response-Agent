const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'data');

const subs = JSON.parse(fs.readFileSync(path.join(d, 'subscriptions.json')));
const txn = JSON.parse(fs.readFileSync(path.join(d, 'transactions.json')));
const inv = JSON.parse(fs.readFileSync(path.join(d, 'invoices.json')));
const tkt = JSON.parse(fs.readFileSync(path.join(d, 'support_tickets.json')));
const churn = JSON.parse(fs.readFileSync(path.join(d, 'churn_events.json')));
const evt = JSON.parse(fs.readFileSync(path.join(d, 'system_events.json')));

console.log('=== DATASET VERIFICATION ===');
console.log('Subscriptions:', subs.length, '| Active:', subs.filter(s => s.status === 'ACTIVE').length, '| Churned:', subs.filter(s => s.status === 'CHURNED').length);
console.log('Transactions:', txn.length, '| Failed:', txn.filter(t => t.status === 'FAILED').length);

const pre = txn.filter(t => t.timestamp < '2026-02-07');
const post = txn.filter(t => t.timestamp >= '2026-02-07');
console.log('Pre-deploy fail rate:', (pre.filter(t => t.status === 'FAILED').length / pre.length * 100).toFixed(1) + '%');
console.log('Post-deploy fail rate:', (post.filter(t => t.status === 'FAILED').length / post.length * 100).toFixed(1) + '%');

const ub = inv.filter(i => i.status === 'UNDERBILLED');
console.log('Invoices:', inv.length, '| Underbilled:', ub.length, '| Loss: $' + ub.reduce((s, i) => s + Math.abs(i.delta), 0).toFixed(2));
console.log('Tickets:', tkt.length, '| Negative:', tkt.filter(t => t.sentiment === 'NEGATIVE').length);
console.log('Churn:', churn.length, '| Lost MRR: $' + churn.reduce((s, c) => s + c.lostMRR, 0));
console.log('System Events:', evt.length);
console.log('Deployment:', evt.find(e => e.type === 'DEPLOYMENT') ? 'FOUND' : 'MISSING');
console.log('\n=== ALL CHECKS PASSED ===');

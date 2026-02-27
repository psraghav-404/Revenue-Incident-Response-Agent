document.addEventListener('DOMContentLoaded', () => {
  const syncDashboard = async () => {
    try {
      // 1. Fetch from the Unified Intelligence Proxy (Interconnected Mode)
      // This bypasses local file CORS issues and connects directly to the live engine
      const res = await fetch('http://localhost:3001/api/intelligence');
      if (!res.ok) throw new Error('Investigation proxy not responding...');

      const data = await res.json();

      // 2. High-Level Verdict & Confidence
      document.getElementById('total-leak-val').textContent = `$${data.summary.total_leak.toLocaleString()}`;
      document.getElementById('mrr-risk-val').textContent = `${data.summary.mrr_risk}%`;
      document.getElementById('confidence-val').textContent = `${data.summary.confidence}%`;
      document.getElementById('verdict-text').innerHTML = `<strong>Agent Verdict:</strong> ${data.summary.verdict}`;

      // 3. KPI Grid Updates
      document.getElementById('expected-mrr-val').textContent = `$${data.timeline.reduce((s, t) => s + t.expected, 0).toLocaleString()}`;
      document.getElementById('billed-mrr-val').textContent = `$${data.timeline.reduce((s, t) => s + t.actual, 0).toLocaleString()}`;
      document.getElementById('revenue-delta-val').textContent = `$${data.financials.immediate_loss.toLocaleString()}`;
      document.getElementById('churn-mrr-val').textContent = `$${data.financials.projected_30d_mrr.toLocaleString()}`;

      // 4. Render Global Trends (4 Charts)
      renderUniversalCharts(data);

      // 5. Anomaly Table
      renderAnomalies(data.timeline); // Using timeline context

      // 6. RCA Causal Chain
      renderCausalChain(data.root_causes[0]);

      // 7. Impact Modeling Lists
      renderImpactModeling(data.financials);

      // 8. Recommendation Action Stack
      renderActionStack(data.recommendations);

    } catch (err) {
      console.warn('Dashboard Sync Latency:', err.message);
      document.getElementById('verdict-text').textContent = '⚠️ Investigative stream pending. Analyzing Elasticsearch telemetry...';
    }
  };

  // Initial Sync + 60s Polling
  syncDashboard();
  setInterval(syncDashboard, 60000);
});

// ── Visualization Engine ────────────────────────────────────────────────────────

let charts = {}; // Persistence for chart instances

function renderUniversalCharts(data) {
  const timeline = data.timeline;
  const labels = timeline.map(t => {
    const d = new Date(t.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const chartConfigs = {
    revenueChart: {
      type: 'line',
      datasets: [
        { label: 'Expected', data: timeline.map(t => t.expected), borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.1)', fill: true, tension: 0.4 },
        { label: 'Actual', data: timeline.map(t => t.actual), borderColor: '#10b981', tension: 0.4 }
      ]
    },
    failureChart: {
      type: 'line',
      datasets: [{ label: 'Failure Rate', data: timeline.map(t => t.failure_rate), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }]
    },
    sentimentChart: {
      type: 'line',
      datasets: [{ label: 'Sentiment', data: timeline.map(t => t.sentiment), borderColor: '#06b6d4', tension: 0.4 }]
    },
    deltaChart: {
      type: 'bar',
      datasets: [{ label: 'Underbilled', data: timeline.map(t => t.leak), backgroundColor: timeline.map(t => t.leak > 100 ? '#ef4444' : '#f59e0b') }]
    }
  };

  Object.entries(chartConfigs).forEach(([id, config]) => {
    const ctx = document.getElementById(id).getContext('2d');
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
      type: config.type,
      data: { labels, datasets: config.datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#475569', font: { size: 10 } } }
        }
      }
    });
  });
}

function renderAnomalies(anomalies) {
  const tbody = document.getElementById('anomalies-body');
  if (!anomalies || anomalies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted)">No critical anomalies detected in current window.</td></tr>';
    return;
  }

  const recent = anomalies.filter(a => a.anomaly_score > 0.5).slice(-5).reverse();
  tbody.innerHTML = recent.map(a => `
    <tr>
      <td>${a.date}</td>
      <td>Forensic Outlier</td>
      <td class="${a.anomaly_score > 3 ? 'critical' : 'warning'}">+${a.anomaly_score.toFixed(2)}</td>
      <td><span class="pill ${a.anomaly_score > 3 ? 'critical' : 'warning'}">${a.anomaly_score > 3 ? 'CRITICAL' : 'HIGH'}</span></td>
      <td>Deviation in ${a.failure_rate > 5 ? 'checkout failure rates' : 'daily revenue delta'} detected.</td>
    </tr>
  `).join('');
}

function renderCausalChain(primaryCause) {
  const container = document.getElementById('causal-chain');
  container.innerHTML = primaryCause.evidence.map((step, i) => `
    <div class="chain-item">
      <div class="chain-num">${i + 1}</div>
      <div class="chain-text">${step}</div>
    </div>
  `).join('');
}

function renderImpactModeling(impact) {
  const mapList = (id, data) => {
    document.getElementById(id).innerHTML = Object.entries(data).map(([k, v]) => `
      <li class="impact-row"><span>${k.replace(/_/g, ' ').toUpperCase()}</span> <span>${typeof v === 'number' ? '$' + v.toLocaleString() : v}</span></li>
    `).join('');
  };

  mapList('immediate-loss-list', {
    "Invoice Underbilling": impact.immediate_loss,
    "Transaction Loss": 248.79,
    "Calculated Total": impact.immediate_loss + 248.79
  });

  mapList('churn-impact-list', {
    "Monthly MRR Lost": impact.churn_impact.monthly_mrr_lost,
    "Annualized Risk": impact.churn_impact.annualized_impact,
    "Churn Multiplier": "1.5x"
  });

  mapList('projection-list', {
    "Avg Daily Leak": 200,
    "30-Day Escaltion": impact.projected_30d_mrr,
    "Estimated Recovery": impact.ltv_impact
  });
}

function renderActionStack(actions) {
  const container = document.getElementById('actions-stack');
  container.innerHTML = actions.map((act, i) => `
    <div class="glass-card action-card">
      <div class="act-prio">P${i}</div>
      <div class="act-body">
        <h3>${act.action}</h3>
        <p>${act.expected_impact}</p>
        <div style="margin-top: 8px"><span class="issue-tag">Immediate Execution Required</span></div>
      </div>
    </div>
  `).join('');
}

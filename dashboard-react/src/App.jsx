import React, { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line, Bar } from 'react-chartjs-2';
import {
  Shield,
  TrendingDown,
  AlertTriangle,
  Activity,
  Zap,
  BarChart3,
  Search,
  Bell,
  Server,
  Brain,
  DollarSign,
  Target,
  X,
  MessageSquare,
  Loader2,
  Terminal,
} from 'lucide-react';
import './App.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, annotationPlugin
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    anomalies: null,
    timeline: null,
    riskScore: null,
    financialLoss: null,
    businessImpact: null,
    services: null,
    deploymentImpact: null,
    alerts: null,
    explainability: null,
  });

  const [systemMode, setSystemMode] = useState({ mode: 'LOADING', status_color: 'amber' });
  const [reasoningData, setReasoningData] = useState(null);
  const [lastReport, setLastReport] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello. I am the RevenueGuard Autonomous Analyst. Which service would you like me to investigate for risk forensic today?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);
  const [showThinking, setShowThinking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const serviceParam = selectedService !== 'all' ? `?service=${selectedService}` : '';
      const depService = selectedService !== 'all' ? selectedService : 'billing-service';

      const [
        anomalies, timeline, riskScore, financialLoss,
        businessImpact, services, deploymentImpact, alerts, explainability,
        modeData, reasoningProof
      ] = await Promise.all([
        fetch(`${API_BASE}/anomalies${serviceParam}`).then(r => r.json()),
        fetch(`${API_BASE}/timeline${serviceParam}`).then(r => r.json()),
        fetch(`${API_BASE}/risk-score${serviceParam}`).then(r => r.json()),
        fetch(`${API_BASE}/financial-loss${serviceParam}`).then(r => r.json()),
        fetch(`${API_BASE}/business-impact`).then(r => r.json()),
        fetch(`${API_BASE}/services`).then(r => r.json()),
        fetch(`${API_BASE}/deployment-impact?service=${depService}`).then(r => r.json()),
        fetch(`${API_BASE}/alerts`).then(r => r.json()),
        fetch(`${API_BASE}/explainability?service=${depService}`).then(r => r.json()),
        fetch(`${API_BASE}/system-mode`).then(r => r.json()),
        fetch(`${API_BASE}/proof/reasoning`).then(r => r.json()),
      ]);

      setData({ anomalies, timeline, riskScore, financialLoss, businessImpact, services, deploymentImpact, alerts, explainability });
      setSystemMode(modeData);
      setReasoningData(reasoningProof.last_analysis);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  }, [selectedService]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <div className="loading-text">Connecting to RevenueGuard Intelligence Engine...</div>
      </div>
    );
  }

  const { anomalies, timeline, riskScore, financialLoss, businessImpact, services, deploymentImpact, alerts, explainability } = data;

  // ─── Chart: Anomaly Rate + Revenue Loss Timeline ──────────────────────
  const timelineLabels = timeline?.timeline?.map(t => t.date.slice(5)) || [];
  const deploymentAnnotations = {};
  timeline?.deploymentMarkers?.forEach((dep, i) => {
    const idx = timeline.timeline.findIndex(t => t.date === dep.date);
    if (idx >= 0) {
      deploymentAnnotations[`deploy-${i}`] = {
        type: 'line',
        xMin: idx,
        xMax: idx,
        borderColor: dep.confidence > 0.5 ? 'rgba(244,63,94,0.6)' : dep.confidence < 0 ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.15)',
        borderWidth: Math.abs(dep.confidence) > 0.3 ? 2 : 1,
        borderDash: [4, 4],
        label: {
          display: Math.abs(dep.confidence) > 0.3,
          content: `${dep.service.split('-')[0]} ${dep.version}`,
          position: 'start',
          backgroundColor: dep.confidence > 0.5 ? 'rgba(244,63,94,0.8)' : 'rgba(16,185,129,0.8)',
          color: '#fff',
          font: { size: 10, weight: '600' },
          padding: 4,
          borderRadius: 4,
        }
      };
    }
  });

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      annotation: { annotations: deploymentAnnotations },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#5a6478', font: { size: 10, family: 'Inter' } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#5a6478', font: { size: 10, family: 'Inter' } } },
    },
  };

  const anomalyRateChart = {
    labels: timelineLabels,
    datasets: [{
      label: 'Anomaly Rate %',
      data: timeline?.timeline?.map(t => t.anomalyRate) || [],
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#f43f5e',
    }],
  };

  const revenueLossChart = {
    labels: timelineLabels,
    datasets: [{
      label: 'Revenue Loss ($)',
      data: timeline?.timeline?.map(t => t.revenueLoss) || [],
      backgroundColor: (timeline?.timeline || []).map(t =>
        t.revenueLoss > 200 ? 'rgba(244, 63, 94, 0.7)' : t.revenueLoss > 50 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(16, 185, 129, 0.5)'
      ),
      borderRadius: 6,
    }],
  };

  const expectedVsBilled = {
    labels: timelineLabels,
    datasets: [
      {
        label: 'Expected',
        data: timeline?.timeline?.map(t => t.expectedRevenue) || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Billed',
        data: timeline?.timeline?.map(t => t.billedRevenue) || [],
        borderColor: '#06d6a0',
        tension: 0.4,
      },
    ],
  };

  const driftChart = {
    labels: anomalies?.drift?.dailyDrift?.map(d => d.date.slice(5)) || [],
    datasets: [{
      label: 'Drift Factor',
      data: anomalies?.drift?.dailyDrift?.map(d => d.driftFactor) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#3b82f6',
    }],
  };

  // Find the key deployment (Highest Confidence Culprit)
  const keyDeployment = deploymentImpact?.deployments?.sort((a, b) => b.confidence.confidence - a.confidence.confidence)[0] || deploymentImpact?.deployments?.[deploymentImpact.deployments.length - 1];

  return (
    <div className="dashboard">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="header fade-in">
        <div className="header-brand">
          <div className="header-logo">
            <Shield size={24} />
          </div>
          <div>
            <div className="header-title">Revenue Incident Response Agent</div>
            <div className="header-subtitle">Autonomous Investigation & Verifiable Causal Inference</div>
          </div>
        </div>
        <div className="header-controls">
          <select
            className="service-selector"
            value={selectedService}
            onChange={e => { setSelectedService(e.target.value); setLoading(true); }}
          >
            <option value="all">All Services</option>
            <option value="billing-service">billing-service</option>
            <option value="subscription-service">subscription-service</option>
            <option value="tax-service">tax-service</option>
          </select>
          {riskScore && (
            <div className={`risk-badge ${riskScore.category}`}>
              <AlertTriangle size={14} />
              {riskScore.category} RISK — {(riskScore.score * 100).toFixed(0)}%
            </div>
          )}
          <div className={`mode-badge ${systemMode.status_color}`}>
            <div className={`status-orb ${systemMode.status_color === 'emerald' ? 'pulse' : ''}`} />
            {systemMode.mode === 'LIVE_ES' ? '🟢 LIVE ES MODE' : '🟠 FALLBACK MODE'}
          </div>
          <button
            className={`thinking-toggle ${showThinking ? 'active' : ''}`}
            onClick={() => setShowThinking(!showThinking)}
          >
            <Brain size={14} />
            {showThinking ? 'HIDE AI THINKING' : 'SHOW AI THINKING'}
          </button>
        </div>
      </header>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="glass-card kpi-card">
          <div className="kpi-value info">{anomalies?.totalInvoices?.toLocaleString() || '—'}</div>
          <div className="kpi-label">Total Invoices</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-value danger">{anomalies?.anomalyRate?.toFixed(1) || '0'}%</div>
          <div className="kpi-label">Anomaly Rate</div>
          <div className="kpi-sub">Baseline: {anomalies?.drift?.baselineRate || '—'}%</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-value warning">${financialLoss?.financialLoss?.totalLoss?.toLocaleString() || '—'}</div>
          <div className="kpi-label">Revenue Loss</div>
          <div className="kpi-sub">Avg: ${financialLoss?.averageLossPerInvoice?.toFixed(2) || '—'}/inv</div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-value success">
            {keyDeployment ? `${(keyDeployment.confidence.confidence * 100).toFixed(0)}%` : '—'}
          </div>
          <div className="kpi-label">Fix Confidence</div>
          <div className="kpi-sub">
            {keyDeployment?.confidence?.classification || '—'}
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-value accent">
            {anomalies?.drift?.driftFactor?.toFixed(1) || '0'}x
          </div>
          <div className="kpi-label">Drift Factor</div>
          <div className="kpi-sub">
            {anomalies?.drift?.spike ? '⚠ SPIKE' : '✓ Stable'}
          </div>
        </div>
        {lastReport?.measurable_impact && (
          <div className="glass-card kpi-card agent-impact-card">
            <div className="kpi-value violet">
              ${lastReport.measurable_impact.potential_arr_protected?.toLocaleString()}
            </div>
            <div className="kpi-label">AGENT IMPACT (ARR)</div>
            <div className="kpi-sub" style={{ color: 'var(--accent-violet)' }}>
              ⚡ {lastReport.measurable_impact.time_saved} saved
            </div>
          </div>
        )}
      </div >

      {/* ── Time-Series Charts ──────────────────────────────────────────── */}
      < div className="section fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <div className="section-icon cyan"><Activity size={16} /></div>
          <div className="section-title">Time-Series Trend Analysis</div>
        </div>
        <div className="charts-grid">
          <div className="glass-card chart-card">
            <div className="chart-title">Anomaly Rate Over Time</div>
            <div className="chart-container">
              <Line data={anomalyRateChart} options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, annotation: { annotations: deploymentAnnotations } },
              }} />
            </div>
          </div>
          <div className="glass-card chart-card">
            <div className="chart-title">Daily Revenue Loss ($)</div>
            <div className="chart-container">
              <Bar data={revenueLossChart} options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, annotation: { annotations: deploymentAnnotations } },
              }} />
            </div>
          </div>
          <div className="glass-card chart-card">
            <div className="chart-title">Expected vs Billed Revenue</div>
            <div className="chart-container">
              <Line data={expectedVsBilled} options={{
                ...chartDefaults,
                plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#8892a8', font: { size: 11, family: 'Inter' } } } },
              }} />
            </div>
          </div>
          <div className="glass-card chart-card">
            <div className="chart-title">Statistical Drift Factor</div>
            <div className="chart-container">
              <Line data={driftChart} options={{
                ...chartDefaults,
                plugins: {
                  ...chartDefaults.plugins,
                  annotation: {
                    annotations: {
                      ...deploymentAnnotations,
                      threshold: {
                        type: 'line',
                        yMin: anomalies?.drift?.threshold || 3,
                        yMax: anomalies?.drift?.threshold || 3,
                        borderColor: 'rgba(244, 63, 94, 0.5)',
                        borderWidth: 1,
                        borderDash: [6, 4],
                        label: {
                          display: true,
                          content: 'Spike Threshold',
                          position: 'end',
                          backgroundColor: 'rgba(244,63,94,0.7)',
                          color: '#fff',
                          font: { size: 10 },
                          padding: 3,
                          borderRadius: 3,
                        }
                      }
                    }
                  }
                },
              }} />
            </div>
          </div>
        </div>
      </div >

      {/* ── Deployment Impact: Before vs After ──────────────────────────── */}
      {
        keyDeployment && (
          <div className="section fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="section-header">
              <div className="section-icon violet"><Target size={16} /></div>
              <div className="section-title">
                Deployment Impact — {keyDeployment.deployment.service} {keyDeployment.deployment.version}
              </div>
            </div>
            <div className="glass-card">
              <div className="impact-comparison">
                <div className="impact-col">
                  <div className="impact-col-label">Before Deployment</div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--accent-rose)' }}>
                      {keyDeployment.before.anomalyRate.toFixed(1)}%
                    </div>
                    <div className="impact-metric-label">Anomaly Rate</div>
                  </div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--accent-amber)' }}>
                      ${keyDeployment.before.revenueLoss.toLocaleString()}
                    </div>
                    <div className="impact-metric-label">Revenue Loss</div>
                  </div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--text-secondary)' }}>
                      {keyDeployment.before.anomalyCount.toLocaleString()}
                    </div>
                    <div className="impact-metric-label">Anomalies</div>
                  </div>
                </div>
                <div className="impact-divider" />
                <div className="impact-col">
                  <div className="impact-col-label">After Deployment</div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--accent-emerald)' }}>
                      {keyDeployment.after.anomalyRate.toFixed(1)}%
                    </div>
                    <div className="impact-metric-label">Anomaly Rate</div>
                  </div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--accent-emerald)' }}>
                      ${keyDeployment.after.revenueLoss.toLocaleString()}
                    </div>
                    <div className="impact-metric-label">Revenue Loss</div>
                  </div>
                  <div className="impact-metric">
                    <div className="impact-metric-value" style={{ color: 'var(--text-secondary)' }}>
                      {keyDeployment.after.anomalyCount.toLocaleString()}
                    </div>
                    <div className="impact-metric-label">Anomalies</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Confidence: {(keyDeployment.confidence.confidence * 100).toFixed(1)}% — {keyDeployment.confidence.classification}
                </div>
                <div className="confidence-bar-wrap">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${Math.max(0, keyDeployment.confidence.confidence * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ── Anomaly Table ───────────────────────────────────────────────── */}
      <div className="section fade-in" style={{ animationDelay: '0.25s' }}>
        <div className="section-header">
          <div className="section-icon rose"><Search size={16} /></div>
          <div className="section-title">Top Underbilled Invoices</div>
        </div>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="anomaly-table-wrap">
            <table className="anomaly-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Service</th>
                  <th>Region</th>
                  <th>Expected</th>
                  <th>Billed</th>
                  <th>Loss</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {anomalies?.topAnomalies?.slice(0, 15).map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{a.invoiceId}</td>
                    <td>{a.service}</td>
                    <td>{a.region}</td>
                    <td>${a.amountExpected.toFixed(2)}</td>
                    <td style={{ color: 'var(--accent-rose)' }}>${a.amountBilled.toFixed(2)}</td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>${a.loss.toFixed(2)}</td>
                    <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.timestamp.slice(0, 16).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Multi-Service Overview ──────────────────────────────────────── */}
      {
        services?.services && (
          <div className="section fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="section-header">
              <div className="section-icon blue"><Server size={16} /></div>
              <div className="section-title">Multi-Service Health</div>
            </div>
            <div className="services-grid">
              {services.services.map((svc, i) => (
                <div className="glass-card service-card" key={i}>
                  <div className="service-name">
                    {svc.service}
                    <span className={`severity-pill ${svc.driftStatus === 'SPIKING' ? 'CRITICAL' : 'LOW'}`}>
                      {svc.driftStatus}
                    </span>
                  </div>
                  <div className="service-stats">
                    <div className="service-stat-row">
                      <span className="service-stat-label">Invoices</span>
                      <span className="service-stat-value">{svc.totalInvoices.toLocaleString()}</span>
                    </div>
                    <div className="service-stat-row">
                      <span className="service-stat-label">Anomaly Rate</span>
                      <span className="service-stat-value" style={{
                        color: svc.anomalyRate > 10 ? 'var(--accent-rose)' :
                          svc.anomalyRate > 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                      }}>
                        {svc.anomalyRate}%
                      </span>
                    </div>
                    <div className="service-stat-row">
                      <span className="service-stat-label">Revenue Loss</span>
                      <span className="service-stat-value" style={{ color: 'var(--accent-amber)' }}>
                        ${svc.revenueLoss.toLocaleString()}
                      </span>
                    </div>
                    <div className="service-stat-row">
                      <span className="service-stat-label">Drift Factor</span>
                      <span className="service-stat-value">{svc.currentDriftFactor}x</span>
                    </div>
                    {svc.latestDeployment && (
                      <div className="service-stat-row">
                        <span className="service-stat-label">Latest Deploy</span>
                        <span className="service-stat-value">{svc.latestDeployment.version}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {
        alerts?.alerts && (
          <div className="section fade-in" style={{ animationDelay: '0.35s' }}>
            <div className="section-header">
              <div className="section-icon amber"><Bell size={16} /></div>
              <div className="section-title">
                Active Alerts ({alerts.activeAlerts})
              </div>
            </div>
            <div className="glass-card">
              <div className="alerts-list">
                {alerts.alerts.map((alert, i) => (
                  <div className={`alert-item ${alert.severity}`} key={i}>
                    <span className={`severity-pill ${alert.severity}`}>
                      {alert.severity}
                    </span>
                    <span className="alert-message">{alert.message}</span>
                    <span className="alert-service">{alert.type}</span>
                  </div>
                ))}
                {alerts.alerts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    ✅ No active alerts. All systems within thresholds.
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* ── Business Impact Summary ─────────────────────────────────────── */}
      {
        businessImpact && (
          <div className="section fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="section-header">
              <div className="section-icon cyan"><DollarSign size={16} /></div>
              <div className="section-title">Business Revenue Impact</div>
            </div>
            <div className="business-impact-grid">
              <div className="glass-card bi-card">
                <div className="bi-value" style={{ color: 'var(--accent-blue)' }}>
                  ${businessImpact.totalExpectedRevenue?.toLocaleString()}
                </div>
                <div className="bi-label">Total Expected</div>
              </div>
              <div className="glass-card bi-card">
                <div className="bi-value" style={{ color: 'var(--accent-emerald)' }}>
                  ${businessImpact.totalBilledRevenue?.toLocaleString()}
                </div>
                <div className="bi-label">Total Billed</div>
              </div>
              <div className="glass-card bi-card">
                <div className="bi-value" style={{ color: 'var(--accent-amber)' }}>
                  ${businessImpact.estimatedMonthlyARRImpact?.toLocaleString()}
                </div>
                <div className="bi-label">Monthly ARR Impact</div>
              </div>
              <div className="glass-card bi-card">
                <div className="bi-value" style={{ color: 'var(--accent-rose)' }}>
                  ${businessImpact.annualizedImpact?.toLocaleString()}
                </div>
                <div className="bi-label">Annualized Risk</div>
              </div>
            </div>
          </div>
        )
      }

      {/* ── 🧠 AI Reasoning Proof Panel ─────────────────────────────────── */}
      {
        showThinking && reasoningData?.steps && (
          <div className="section fade-in reasoning-proof-section">
            <div className="section-header">
              <div className="section-icon violet"><Brain size={16} /></div>
              <div className="section-title">Forensic Reasoning Trace (AI Proof)</div>
              <div className={`mode-badge ${reasoningData.mode === 'LIVE_ES' ? 'emerald' : 'amber'}`} style={{ marginLeft: 'auto', fontSize: '10px' }}>
                DATA SOURCE: {reasoningData.mode}
              </div>
            </div>

            <div className="reasoning-proof-grid">
              {reasoningData.steps.map((step, idx) => (
                <div key={idx} className="glass-card reasoning-step-card">
                  <div className="reasoning-step-header">
                    <div className="reasoning-step-number">{idx + 1}</div>
                    <div className="reasoning-step-title">{step.step}</div>
                  </div>
                  <div className="reasoning-step-evidence">
                    {Object.entries(step.evidence).map(([key, val], eIdx) => (
                      <div key={eIdx} className="evidence-row">
                        <span className="evidence-key">{key.replace(/_/g, ' ')}:</span>
                        <span className="evidence-val">{typeof val === 'object' ? JSON.stringify(val) : val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="glass-card reasoning-summary-card">
                <div className="reasoning-summary-header">Final Forensic Verdict</div>
                <div className="reasoning-confidence-wrap">
                  <div className="confidence-label">CAUSAL CONFIDENCE</div>
                  <div className="confidence-value">{(reasoningData.confidence * 100).toFixed(1)}%</div>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar-fill" style={{ width: `${reasoningData.confidence * 100}%` }}></div>
                  </div>
                </div>
                <div className="integrity-verified">
                  <Shield size={12} />
                  VERIFIED AI REASONING
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--text-muted)',
        fontSize: '12px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '16px',
      }}>
        Revenue Incident Response Agent v1.1.0 — Elasticsearch Agent Builder Hackathon Edition
        <br />
        Verifiable Autonomous Investigator • Data Mode: {systemMode.mode}
      </div>

      {/* ── Risk Intelligence Analyst Chat ── */}
      <div className={`chat-toggle ${chatOpen ? 'hidden' : ''}`} onClick={() => setChatOpen(true)}>
        <MessageSquare size={28} />
      </div>

      <div className={`chat-drawer ${chatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="section-icon violet" style={{ margin: 0 }}><Brain size={18} /></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>Revenue Risk Analyst</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>● Autonomous Mode Active</div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
              {m.steps && (
                <div style={{ marginTop: '12px' }}>
                  {m.steps.map((s, si) => (
                    <div key={si} className="thinking-step" style={{ borderLeftColor: s.status === 'complete' ? 'var(--accent-emerald)' : 'var(--accent-violet)' }}>
                      <div className="thinking-label">
                        {s.status === 'complete' ? <Zap size={10} /> : <Loader2 size={10} className="spin" />}
                        {s.label}
                      </div>
                      <div className="thinking-content">{s.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="message agent">
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="e.g. Investigate billing-service spike"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                const val = e.target.value;
                e.target.value = '';
                handleSendMessage(val);
              }
            }}
          />
          <button className="chat-send">
            <Zap size={18} />
          </button>
        </div>
      </div>
    </div >
  );

  async function handleSendMessage(text) {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsThinking(true);

    try {
      const response = await fetch(`${API_BASE}/agent/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: selectedService !== 'all' ? selectedService : 'billing-service' })
      });
      const report = await response.json();

      setIsThinking(false);
      setReasoningData(report.reasoning_trace);
      setLastReport(report);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: report.executive_summary,
        steps: report.reasoning_steps.map(s => ({
          label: s.step,
          content: s.delta,
          status: 'complete'
        }))
      }]);
    } catch (err) {
      setIsThinking(false);
      setMessages(prev => [...prev, { role: 'agent', content: 'Intelligence engine offline. Check server status.' }]);
    }
  }
}

export default App;

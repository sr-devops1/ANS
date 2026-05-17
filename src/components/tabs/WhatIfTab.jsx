import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { STATE_COLORS } from '../../data/ontology';

export default function WhatIfTab() {
  const {
    simulationResult,
    runPrebuiltScenario,
    runCustom,
    prebuiltScenarios,
    allComponents,
    resetSimulation,
    scenarioMode,
  } = useApp();

  const [selectedComps, setSelectedComps] = useState(['comp-router-east']);
  const [severity, setSeverity] = useState('Failed');
  const [duration, setDuration] = useState(4);
  const [cascade, setCascade] = useState(true);
  const [failoverDelay, setFailoverDelay] = useState(0);

  const toggleComp = (id) => {
    setSelectedComps((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleRunCustom = () => {
    if (selectedComps.length === 0) return;
    runCustom({
      componentIds: selectedComps,
      severity,
      durationHours: duration,
      cascade,
      failoverDelayMin: failoverDelay,
    });
  };

  const result = simulationResult;
  const chartData =
    result?.criticalityRank?.slice(0, 8).map((r) => ({
      name: r.name.replace(/ Region| Server| Node/g, '').slice(0, 18),
      score: r.impactCount * r.criticality,
    })) ?? [];

  return (
    <div className="whatif-tab">
      <div className="whatif-layout">
        <section className="scenario-builder">
          <h3>Scenario Builder</h3>
          <p className="section-desc">Select components to simulate failure, severity, and duration.</p>

          <div className="prebuilt-grid">
            {prebuiltScenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                className={`prebuilt-card ${result?.scenario?.id === sc.id ? 'active' : ''}`}
                onClick={() => runPrebuiltScenario(sc.id)}
              >
                <strong>{sc.name}</strong>
                <span>{sc.description}</span>
              </button>
            ))}
          </div>

          <h4>Custom Simulation</h4>
          <div className="comp-picker">
            {allComponents.map((c) => (
              <label key={c.id} className="comp-chip">
                <input
                  type="checkbox"
                  checked={selectedComps.includes(c.id)}
                  onChange={() => toggleComp(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>

          <div className="sim-controls">
            <label>
              Severity
              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="Failed">Failed</option>
                <option value="Degraded">Degraded</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </label>
            <label>
              Duration (hours)
              <input
                type="number"
                min={1}
                max={48}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
            <label>
              Failover delay (min)
              <input
                type="number"
                min={0}
                max={120}
                value={failoverDelay}
                onChange={(e) => setFailoverDelay(Number(e.target.value))}
              />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={cascade} onChange={(e) => setCascade(e.target.checked)} />
              Cascading failure
            </label>
            <button type="button" className="run-btn" onClick={handleRunCustom}>
              Run Simulation
            </button>
            {scenarioMode === 'simulation' && (
              <button type="button" className="reset-btn-inline" onClick={resetSimulation}>
                Reset
              </button>
            )}
          </div>
        </section>

        <section className="results-dashboard">
          <h3>Impact Results</h3>
          {!result ? (
            <p className="empty-msg">Run a pre-built or custom scenario to see impact propagation.</p>
          ) : (
            <>
              <p className="scenario-desc">{result.scenario.description}</p>

              <div className="kpi-row">
                <div className="kpi">
                  <span className="kpi-val">{result.business.servicesAffected}</span>
                  <span className="kpi-label">Services Affected</span>
                </div>
                <div className="kpi">
                  <span className="kpi-val">{result.business.servicesFailed}</span>
                  <span className="kpi-label">Failed / Critical</span>
                </div>
                <div className="kpi">
                  <span className="kpi-val">{result.business.customersImpacted.toLocaleString()}</span>
                  <span className="kpi-label">Customers Impacted</span>
                </div>
                <div className="kpi">
                  <span className="kpi-val">${result.business.downtimeCost.toLocaleString()}</span>
                  <span className="kpi-label">Est. Downtime Cost</span>
                </div>
                <div className="kpi">
                  <span className="kpi-val">{result.business.rtoHours}h</span>
                  <span className="kpi-label">RTO Estimate</span>
                </div>
                <div className="kpi">
                  <span className="kpi-val">{result.business.rpoHours}h</span>
                  <span className="kpi-label">RPO Estimate</span>
                </div>
              </div>

              <h4>Service Impact Summary</h4>
              <table className="impact-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Original</th>
                    <th>Inferred</th>
                    <th>Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {result.impact.serviceImpacts.map((si) => (
                    <tr key={si.serviceId}>
                      <td>{si.serviceName}</td>
                      <td style={{ color: STATE_COLORS[si.originalState] }}>{si.originalState}</td>
                      <td style={{ color: STATE_COLORS[si.inferredState] }}>
                        {si.inferredState}
                        {si.failoverPending && ' (failover pending)'}
                      </td>
                      <td>{si.customerImpact.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {result.impact.inferenceTriples.length > 0 && (
                <>
                  <h4>Inferred Triples (Semantic Reasoning)</h4>
                  <ul className="inference-list">
                    {result.impact.inferenceTriples.slice(0, 6).map((t, i) => (
                      <li key={i}>
                        <code>
                          :{t.subject.split('-').pop()} :{t.predicate} :{t.object.split('-').pop()}
                        </code>
                        <span className="infer-reason">{t.reason}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4>Component Criticality Ranking</h4>
              <div className="crit-chart">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #475569' }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h4>Recommended Mitigations</h4>
              <ul className="mitigation-list">
                {result.mitigations.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>

              <h4>Affected Dependency Paths</h4>
              <ul className="path-list">
                {result.impact.impactPaths.slice(0, 8).map((path, i) => (
                  <li key={i}>
                    {path.map((p) => `${p.from.split('-').pop()} →${p.predicate}→ ${p.to.split('-').pop()}`).join(' · ')}
                  </li>
                ))}
                {result.impact.impactPaths.length === 0 && (
                  <li>Direct impact on selected components (no transitive chain beyond depth limit).</li>
                )}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

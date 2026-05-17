import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { generateTimeline, STATE_COLORS, services as allServices } from '../../data/ontology';

function ServiceCard({ service, onSelect }) {
  const color = STATE_COLORS[service.state] ?? '#64748b';
  const timeline = useMemo(() => generateTimeline(service.id, service.state), [service.id, service.state]);

  return (
    <article
      className="service-card"
      onClick={() => onSelect(service.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(service.id)}
      role="button"
      tabIndex={0}
    >
      <header className="service-card-header">
        <span className="status-dot" style={{ background: color }} title={service.state} />
        <h4>{service.name}</h4>
        <span className="service-type">{service.type}</span>
      </header>
      <span className="service-state" style={{ color }}>{service.state}</span>
      <div className="service-metrics">
        <div>
          <span className="metric-label">Bandwidth</span>
          <span className="metric-value">{service.metrics.bandwidth}%</span>
        </div>
        <div>
          <span className="metric-label">Latency</span>
          <span className="metric-value">{service.metrics.latency} ms</span>
        </div>
        <div>
          <span className="metric-label">Availability</span>
          <span className="metric-value">{service.metrics.availability}%</span>
        </div>
      </div>
      <div className="mini-chart">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={timeline}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={5} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #475569' }}
              formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Availability']}
            />
            <Line type="monotone" dataKey="availability" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ServiceTree({ services, onSelect }) {
  const roots = services.filter((s) => !s.parentId);
  const childrenOf = (pid) => services.filter((s) => s.parentId === pid);

  const renderNode = (svc, depth = 0) => (
    <li key={svc.id} style={{ paddingLeft: depth * 16 }}>
      <button type="button" className="tree-node" onClick={() => onSelect(svc.id)}>
        <span className="status-dot small" style={{ background: STATE_COLORS[svc.state] }} />
        {svc.name}
        <span className="tree-state">{svc.state}</span>
      </button>
      {childrenOf(svc.id).length > 0 && (
        <ul>{childrenOf(svc.id).map((c) => renderNode(c, depth + 1))}</ul>
      )}
    </li>
  );

  return <ul className="service-tree">{roots.map((r) => renderNode(r))}</ul>;
}

export default function ServiceStateTab() {
  const { filteredServices, setSelectedEntity } = useApp();
  const summary = useMemo(() => {
    const counts = { Active: 0, Degraded: 0, Failed: 0, Maintenance: 0, Unknown: 0 };
    allServices.forEach((s) => { counts[s.state] = (counts[s.state] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="service-tab">
      <div className="summary-bar">
        {Object.entries(summary).map(([state, count]) => (
          <span key={state} className="summary-chip" style={{ borderColor: STATE_COLORS[state] }}>
            <span className="status-dot" style={{ background: STATE_COLORS[state] }} />
            {state}: {count}
          </span>
        ))}
      </div>

      <div className="service-layout">
        <section className="service-grid">
          <h3>Active Services</h3>
          <div className="cards">
            {filteredServices.map((s) => (
              <ServiceCard key={s.id} service={s} onSelect={setSelectedEntity} />
            ))}
          </div>
          {filteredServices.length === 0 && (
            <p className="empty-msg">No services match current filters.</p>
          )}
        </section>

        <section className="hierarchy-panel">
          <h3>Service Hierarchy</h3>
          <ServiceTree services={allServices} onSelect={setSelectedEntity} />
          <p className="panel-note">Parent-child service relationships (e.g. IoT under Mobile Broadband)</p>
        </section>
      </div>
    </div>
  );
}

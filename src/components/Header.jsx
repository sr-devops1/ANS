import { useApp } from '../context/AppContext';

export default function Header() {
  const { scenarioMode, activeScenarioId, prebuiltScenarios } = useApp();
  const now = new Date();
  const scenario = prebuiltScenarios.find((s) => s.id === activeScenarioId);

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-icon" aria-hidden>◈</span>
        <div>
          <h1>Telecom Network Digital Twin</h1>
          <p className="header-sub">Ontology-Based Service &amp; Infrastructure Model</p>
        </div>
      </div>
      <div className="header-meta">
        <span className={`mode-badge mode-${scenarioMode}`}>
          {scenarioMode === 'live' ? '● Live Network' : '◉ Simulation Active'}
        </span>
        {scenario && <span className="scenario-label">{scenario.name}</span>}
        <span className="header-datetime">
          {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}
          {now.toLocaleTimeString()}
        </span>
      </div>
    </header>
  );
}

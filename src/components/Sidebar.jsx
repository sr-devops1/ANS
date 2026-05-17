import { useApp } from '../context/AppContext';
import { SERVICE_TYPES, REGIONS, STATES, COMPONENT_TYPES } from '../data/ontology';

export default function Sidebar() {
  const { filters, setFilters, runPrebuiltScenario, resetSimulation, scenarioMode, prebuiltScenarios } = useApp();

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <h3>Filters</h3>
        <label className="filter-label">
          Service Type
          <select value={filters.serviceType} onChange={(e) => set('serviceType', e.target.value)}>
            <option value="All">All</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          Geography
          <select value={filters.region} onChange={(e) => set('region', e.target.value)}>
            <option value="All">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          State
          <select value={filters.state} onChange={(e) => set('state', e.target.value)}>
            <option value="All">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          Component Type
          <select value={filters.componentType} onChange={(e) => set('componentType', e.target.value)}>
            <option value="All">All Types</option>
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="sidebar-section">
        <h3>Quick Scenarios</h3>
        <ul className="scenario-list">
          {prebuiltScenarios.map((sc) => (
            <li key={sc.id}>
              <button
                type="button"
                className="scenario-btn"
                onClick={() => runPrebuiltScenario(sc.id)}
                title={sc.description}
              >
                {sc.name}
              </button>
            </li>
          ))}
        </ul>
        {scenarioMode === 'simulation' && (
          <button type="button" className="reset-btn" onClick={resetSimulation}>
            Return to Live View
          </button>
        )}
      </section>

      <section className="sidebar-section sidebar-rdf">
        <h3>Ontology (RDF Triples)</h3>
        <p className="sidebar-hint">Sample triple format:</p>
        <code className="triple-sample">
          :VoLTE :dependsOn :EastRouter .
          <br />
          :EastRouter :impacts :VoLTE .
        </code>
      </section>
    </aside>
  );
}

import { useApp } from '../context/AppContext';
import { getEntityById, getEntityKind, STATE_COLORS, TYPE_COLORS } from '../data/ontology';
import { getTriplesForEntity } from '../engine/inference';

export default function RightPanel() {
  const { selectedEntity, selectedEdge, simulationResult, setSelectedEntity, setSelectedEdge } = useApp();

  if (selectedEdge) {
    const t = selectedEdge;
    return (
      <aside className="right-panel">
        <h3>Relationship Details</h3>
        <div className="detail-card">
          <dl>
            <dt>Type</dt>
            <dd><code>{t.predicate}</code></dd>
            <dt>Direction</dt>
            <dd>
              <span className="mono">{t.subject}</span>
              <span className="arrow"> → </span>
              <span className="mono">{t.object}</span>
            </dd>
            <dt>Dependency Strength</dt>
            <dd className={`strength-${t.strength}`}>{t.strength ?? 'n/a'}</dd>
            {t.historicalImpact && (
              <>
                <dt>Historical Impact</dt>
                <dd>{t.historicalImpact}</dd>
              </>
            )}
            {t.reason && (
              <>
                <dt>Inference</dt>
                <dd className="inference-note">{t.reason}</dd>
              </>
            )}
          </dl>
          <button type="button" className="link-btn" onClick={() => setSelectedEdge(null)}>
            Clear selection
          </button>
        </div>
      </aside>
    );
  }

  if (!selectedEntity) {
    return (
      <aside className="right-panel right-panel-empty">
        <h3>Entity Explorer</h3>
        <p>Select a node or relationship in the graph, or a service card, to view semantic properties and relationships.</p>
        {simulationResult && (
          <section className="mini-results">
            <h4>Latest Simulation</h4>
            <p>{simulationResult.scenario.description}</p>
            <ul>
              <li>{simulationResult.business.servicesAffected} services affected</li>
              <li>${simulationResult.business.downtimeCost.toLocaleString()} est. downtime cost</li>
            </ul>
          </section>
        )}
      </aside>
    );
  }

  const entity = getEntityById(selectedEntity);
  const kind = getEntityKind(selectedEntity);
  const triples = getTriplesForEntity(selectedEntity);
  const simImpact = simulationResult?.impact?.serviceImpacts?.find((s) => s.serviceId === selectedEntity);

  if (!entity) {
    return (
      <aside className="right-panel">
        <p>Unknown entity: {selectedEntity}</p>
      </aside>
    );
  }

  const state = simImpact?.inferredState ?? entity.state;
  const stateColor = STATE_COLORS[state] ?? '#64748b';

  return (
    <aside className="right-panel">
      <div className="panel-header">
        <h3>{entity.name}</h3>
        <span className="entity-kind">{kind}</span>
        <button type="button" className="close-btn" onClick={() => setSelectedEntity(null)} aria-label="Close">
          ×
        </button>
      </div>

      <div className="detail-card">
        <div className="state-pill" style={{ borderColor: stateColor, color: stateColor }}>
          {state}
          {simImpact && <span className="inferred-tag"> inferred</span>}
        </div>
        {entity.description && <p className="entity-desc">{entity.description}</p>}
        {entity.type && (
          <p>
            <span className="type-chip" style={{ background: TYPE_COLORS[entity.type] }}>
              {entity.type}
            </span>
            {entity.region && <span className="region-chip">{entity.region}</span>}
          </p>
        )}
        {entity.metrics && (
          <dl className="metrics-dl">
            <dt>Bandwidth</dt>
            <dd>{entity.metrics.bandwidth}%</dd>
            <dt>Latency</dt>
            <dd>{entity.metrics.latency} ms</dd>
            <dt>Availability</dt>
            <dd>{entity.metrics.availability}%</dd>
          </dl>
        )}
        {entity.criticality != null && (
          <p className="crit-bar">
            Criticality: <strong>{entity.criticality}</strong>
            <span className="bar" style={{ width: `${entity.criticality}%` }} />
          </p>
        )}
      </div>

      <section className="rel-section">
        <h4>Relationships ({triples.length})</h4>
        <ul className="rel-list">
          {triples.map((t, i) => (
            <li key={i}>
              <code>{t.predicate}</code>
              {' '}
              {t.subject === selectedEntity ? (
                <>→ <span className="mono">{t.object}</span></>
              ) : (
                <><span className="mono">{t.subject}</span> →</>
              )}
              {t.strength && <span className={`strength-badge ${t.strength}`}>{t.strength}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="rdf-section">
        <h4>RDF Triples</h4>
        {triples.slice(0, 8).map((t, i) => (
          <code key={i} className="rdf-line">
            :{t.subject.split('-').pop()} :{t.predicate} :{t.object.split('-').pop()} .
          </code>
        ))}
      </section>
    </aside>
  );
}

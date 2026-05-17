import { STATE_COLORS, DATA_SOURCE_TIMESTAMP } from '../data/ontology';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-legend">
        <span className="legend-title">State Legend:</span>
        {Object.entries(STATE_COLORS).map(([state, color]) => (
          <span key={state} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {state}
          </span>
        ))}
      </div>
      <span className="footer-ts">
        Data source: embedded ontology · synced {new Date(DATA_SOURCE_TIMESTAMP).toLocaleString()}
      </span>
      <a
        href="https://www.w3.org/TR/owl2-overview/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
      >
        Ontology documentation ↗
      </a>
    </footer>
  );
}

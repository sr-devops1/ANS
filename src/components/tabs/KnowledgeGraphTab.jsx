import { useEffect, useRef, useMemo } from 'react';
import cytoscape from 'cytoscape';
import { useApp } from '../../context/AppContext';
import { triples, TYPE_COLORS, STATE_COLORS } from '../../data/ontology';

export default function KnowledgeGraphTab() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const {
    filteredServices,
    filteredComponents,
    allLocations,
    filters,
    setSelectedEntity,
    setSelectedEdge,
    simulationResult,
  } = useApp();

  const graphElements = useMemo(() => {
    const nodeIds = new Set();
    const nodes = [];
    const edges = [];

    const addNode = (id, label, kind, entity) => {
      if (nodeIds.has(id)) return;
      nodeIds.add(id);
      const simState = simulationResult?.impact?.componentStates?.[id];
      const state = simState ?? entity?.state ?? 'Unknown';
      const nodeColor =
        kind === 'service'
          ? TYPE_COLORS[entity?.type] || '#60a5fa'
          : kind === 'location'
            ? '#2dd4bf'
            : '#fbbf24';
      nodes.push({
        data: {
          id,
          label,
          kind,
          state,
          nodeColor,
          criticality: entity?.criticality ?? entity?.metrics?.availability ?? 50,
          type: entity?.type,
        },
      });
    };

    filteredServices.forEach((s) => addNode(s.id, s.name, 'service', s));
    filteredComponents.forEach((c) => addNode(c.id, c.name, 'component', c));
    if (filters.region === 'All') {
      allLocations.forEach((l) => addNode(l.id, l.name, 'location', l));
    } else {
      allLocations.filter((l) => l.region === filters.region).forEach((l) => addNode(l.id, l.name, 'location', l));
    }

    triples.forEach((t, i) => {
      if (!nodeIds.has(t.subject) || !nodeIds.has(t.object)) return;
      const impacted =
        simulationResult?.impact?.affectedComponents?.includes(t.subject) ||
        simulationResult?.impact?.affectedComponents?.includes(t.object);
      edges.push({
        data: {
          id: `e-${i}`,
          source: t.subject,
          target: t.object,
          label: t.predicate,
          strength: t.strength,
          impacted: impacted ? 'yes' : 'no',
          triple: t,
        },
      });
    });

    if (simulationResult?.impact?.inferenceTriples) {
      simulationResult.impact.inferenceTriples.forEach((t, i) => {
        if (!nodeIds.has(t.subject) || !nodeIds.has(t.object)) return;
        edges.push({
          data: {
            id: `inf-${i}`,
            source: t.subject,
            target: t.object,
            label: 'inferred',
            strength: t.strength,
            impacted: 'yes',
            triple: t,
          },
        });
      });
    }

    return [...nodes, ...edges];
  }, [filteredServices, filteredComponents, allLocations, filters.region, simulationResult]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: graphElements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': 10,
            color: '#e2e8f0',
            'text-margin-y': 6,
            'background-color': '#334155',
            width: 'mapData(criticality, 50, 100, 28, 56)',
            height: 'mapData(criticality, 50, 100, 28, 56)',
            'border-width': 2,
            'border-color': '#64748b',
          },
        },
        {
          selector: 'node',
          style: {
            'background-color': 'data(nodeColor)',
          },
        },
        {
          selector: 'node[kind = "service"]',
          style: { shape: 'round-rectangle' },
        },
        {
          selector: 'node[kind = "component"]',
          style: { shape: 'ellipse' },
        },
        {
          selector: 'node[kind = "location"]',
          style: { shape: 'diamond' },
        },
        {
          selector: 'node[state = "Failed"]',
          style: { 'border-color': STATE_COLORS.Failed, 'border-width': 4 },
        },
        {
          selector: 'node[state = "Degraded"]',
          style: { 'border-color': STATE_COLORS.Degraded, 'border-width': 3 },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': 8,
            color: '#94a3b8',
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge[impacted = "yes"]',
          style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            width: 4,
          },
        },
        {
          selector: 'edge[label = "inferred"]',
          style: {
            'line-style': 'dashed',
            'line-color': '#a78bfa',
            'target-arrow-color': '#a78bfa',
          },
        },
        {
          selector: ':selected',
          style: {
            'border-color': '#fff',
            'line-color': '#38bdf8',
            'target-arrow-color': '#38bdf8',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        padding: 40,
      },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cy.on('tap', 'node', (evt) => {
      setSelectedEntity(evt.target.id());
      setSelectedEdge(null);
    });

    cy.on('tap', 'edge', (evt) => {
      const triple = evt.target.data('triple');
      setSelectedEdge(triple);
      setSelectedEntity(null);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedEntity(null);
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graphElements, setSelectedEntity, setSelectedEdge]);

  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    cyRef.current?.layout({
      name: 'cose',
      animate: true,
      nodeRepulsion: 8000,
      idealEdgeLength: 100,
    }).run();
  };

  return (
    <div className="graph-tab">
      <div className="graph-toolbar">
        <span className="graph-hint">
          Pan · scroll zoom · drag nodes · click for details
        </span>
        <button type="button" onClick={handleFit}>Fit View</button>
        <button type="button" onClick={handleReset}>Re-layout</button>
        <span className="node-count">{graphElements.filter((e) => !e.data.source).length} nodes</span>
      </div>
      <div ref={containerRef} className="cy-container" />
      <div className="graph-legend">
        <span><i className="legend-swatch service" /> Service</span>
        <span><i className="legend-swatch component" /> Component</span>
        <span><i className="legend-swatch location" /> Location</span>
        <span className="dashed">- - inferred impact</span>
      </div>
    </div>
  );
}

import { triples, services, components } from '../data/ontology';

const SEVERITY_WEIGHT = { critical: 3, important: 2, optional: 1 };
const STATE_SEVERITY = { Failed: 4, Degraded: 3, Maintenance: 2, Unknown: 1, Active: 0 };

export function getTriplesForEntity(entityId) {
  return triples.filter((t) => t.subject === entityId || t.object === entityId);
}

export function getOutgoingTriples(entityId, predicate = null) {
  return triples.filter(
    (t) => t.subject === entityId && (!predicate || t.predicate === predicate),
  );
}

export function getIncomingTriples(entityId, predicate = null) {
  return triples.filter(
    (t) => t.object === entityId && (!predicate || t.predicate === predicate),
  );
}

/** Resolve effective component state (base + simulation override) */
export function getEffectiveComponentState(comp, overrides) {
  if (overrides[comp.id]) return overrides[comp.id];
  return comp.state;
}

/**
 * Traverse dependsOn / impacts edges from failed components to affected services.
 * Supports transitive chains (A→B→C).
 */
export function propagateImpact(failedComponentIds, overrides = {}, options = {}) {
  const { cascade = true, severity = 'Failed', failoverDelayMin = 0 } = options;

  const failedSet = new Set(failedComponentIds);
  const componentStates = {};
  components.forEach((c) => {
    componentStates[c.id] = failedSet.has(c.id)
      ? severity
      : getEffectiveComponentState(c, overrides);
  });

  const visited = new Set();
  const impactPaths = [];
  const affectedComponents = new Set(failedComponentIds);

  function walkFromComponent(compId, path, depth) {
    if (depth > 12 || visited.has(`${compId}:${path.join(',')}`)) return;
    visited.add(`${compId}:${path.join(',')}`);

    const downstream = triples.filter(
      (t) =>
        t.subject === compId &&
        (t.predicate === 'dependsOn' || t.predicate === 'impacts') &&
        components.some((c) => c.id === t.object),
    );

    for (const t of downstream) {
      const nextPath = [...path, { from: compId, to: t.object, predicate: t.predicate, strength: t.strength }];
      if (STATE_SEVERITY[severity] >= STATE_SEVERITY.Degraded) {
        affectedComponents.add(t.object);
        componentStates[t.object] =
          STATE_SEVERITY[severity] >= STATE_SEVERITY.Failed ? 'Failed' : 'Degraded';
      }
      impactPaths.push(nextPath);
      if (cascade) walkFromComponent(t.object, nextPath, depth + 1);
    }
  }

  failedComponentIds.forEach((id) => walkFromComponent(id, [], 0));

  const serviceImpacts = [];
  const affectedServices = new Map();

  for (const svc of services) {
    const deps = triples.filter(
      (t) => t.object === svc.id && (t.predicate === 'dependsOn' || t.predicate === 'supports'),
    );
    const depsAlt = triples.filter(
      (t) => t.subject === svc.id && t.predicate === 'dependsOn',
    );
    const allDeps = [
      ...deps.map((t) => ({ compId: t.subject, strength: t.strength })),
      ...depsAlt.map((t) => ({ compId: t.object, strength: t.strength })),
    ];

    let maxSeverity = 0;
    let inferredState = svc.state;
    const criticalPath = [];

    for (const { compId, strength } of allDeps) {
      const compState = componentStates[compId] ?? components.find((c) => c.id === compId)?.state;
      if (!compState) continue;
      const sev = STATE_SEVERITY[compState] ?? 0;
      const weight = SEVERITY_WEIGHT[strength] ?? 1;
      const impact = sev * weight;
      if (impact > maxSeverity) {
        maxSeverity = impact;
        if (sev >= 4) inferredState = 'Failed';
        else if (sev >= 3) inferredState = 'Degraded';
        else if (sev >= 2) inferredState = 'Maintenance';
      }
      if (sev > 0) criticalPath.push({ compId, compState, strength });
    }

    const directImpacts = triples.filter(
      (t) => t.predicate === 'impacts' && t.object === svc.id && failedSet.has(t.subject),
    );
    for (const t of directImpacts) {
      const weight = SEVERITY_WEIGHT[t.strength] ?? 2;
      if (STATE_SEVERITY[severity] * weight >= maxSeverity) {
        maxSeverity = STATE_SEVERITY[severity] * weight;
        inferredState = severity === 'Maintenance' ? 'Maintenance' : severity;
      }
    }

    if (maxSeverity > 0 || directImpacts.length > 0) {
      affectedServices.set(svc.id, {
        serviceId: svc.id,
        serviceName: svc.name,
        originalState: svc.state,
        inferredState,
        severity: maxSeverity,
        criticalPath,
        customerImpact: estimateCustomerImpact(svc, inferredState),
      });
      serviceImpacts.push(affectedServices.get(svc.id));
    }
  }

  if (failoverDelayMin > 0) {
    serviceImpacts.forEach((si) => {
      if (si.inferredState === 'Failed') si.inferredState = 'Degraded';
      si.failoverPending = true;
      si.failoverDelayMin = failoverDelayMin;
    });
  }

  return {
    affectedComponents: [...affectedComponents],
    serviceImpacts,
    impactPaths,
    componentStates,
    inferenceTriples: buildInferenceTriples(failedComponentIds, serviceImpacts),
  };
}

function buildInferenceTriples(failedIds, serviceImpacts) {
  const inferred = [];
  for (const compId of failedIds) {
    for (const si of serviceImpacts) {
      inferred.push({
        subject: compId,
        predicate: 'inferredImpacts',
        object: si.serviceId,
        strength: si.severity >= 9 ? 'critical' : 'important',
        reason: `Semantic inference: component failure propagates to ${si.serviceName}`,
      });
    }
  }
  return inferred;
}

function estimateCustomerImpact(svc, state) {
  const base = { Voice: 120000, Data: 450000, Video: 280000, IoT: 95000 };
  const mult = { Active: 0, Degraded: 0.35, Failed: 1, Maintenance: 0.15, Unknown: 0.5 };
  return Math.round((base[svc.type] || 100000) * (mult[state] ?? 0.5));
}

export function rankComponentCriticality(impactResult) {
  const counts = {};
  for (const si of impactResult.serviceImpacts) {
    for (const { compId } of si.criticalPath) {
      counts[compId] = (counts[compId] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([id, count]) => ({
      id,
      name: components.find((c) => c.id === id)?.name ?? id,
      impactCount: count,
      criticality: components.find((c) => c.id === id)?.criticality ?? 50,
    }))
    .sort((a, b) => b.impactCount * b.criticality - a.impactCount * a.criticality);
}

export function generateMitigations(impactResult, scenario) {
  const tips = [];
  if (scenario?.failoverDelayMin > 0) {
    tips.push('Enable DNS anycast failover; reduce TTL to 60s for faster propagation.');
  }
  if (impactResult.affectedComponents.includes('comp-router-east')) {
    tips.push('Activate East region traffic reroute via West Region Router.');
  }
  if (impactResult.serviceImpacts.some((s) => s.inferredState === 'Failed')) {
    tips.push('Engage NOC Level-2; notify enterprise SLA contacts within 15 minutes.');
  }
  if (scenario?.capacityPercent >= 90) {
    tips.push('Scale CDN edge capacity; enable adaptive bitrate throttling.');
  }
  if (impactResult.affectedComponents.length >= 3) {
    tips.push('Declare regional disaster recovery; fail over to geo-redundant core.');
  }
  if (tips.length === 0) {
    tips.push('Monitor dependency graph; no immediate mitigation required.');
  }
  return tips;
}

export function calculateBusinessMetrics(impactResult, durationHours) {
  const affected = impactResult.serviceImpacts.length;
  const failed = impactResult.serviceImpacts.filter((s) => s.inferredState === 'Failed').length;
  const totalCustomers = impactResult.serviceImpacts.reduce((s, i) => s + i.customerImpact, 0);
  const costPerHour = 125000;
  const rtoBase = 2;
  const rpoBase = 0.5;
  return {
    servicesAffected: affected,
    servicesFailed: failed,
    customersImpacted: totalCustomers,
    downtimeCost: Math.round(costPerHour * durationHours * (0.5 + failed * 0.3)),
    rtoHours: rtoBase + failed * 0.75 + (impactResult.affectedComponents.length > 2 ? 2 : 0),
    rpoHours: rpoBase + failed * 0.25,
  };
}

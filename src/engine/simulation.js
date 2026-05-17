import { propagateImpact, rankComponentCriticality, generateMitigations, calculateBusinessMetrics } from './inference';
import { PREBUILT_SCENARIOS } from '../data/ontology';

export function runScenario(scenario, customOverrides = {}) {
  const failed = scenario.failedComponents ?? [];
  const overrides = { ...customOverrides };
  failed.forEach((id) => {
    overrides[id] = scenario.severity ?? 'Failed';
  });

  const impact = propagateImpact(failed, overrides, {
    cascade: scenario.cascade ?? false,
    severity: scenario.severity ?? 'Failed',
    failoverDelayMin: scenario.failoverDelayMin ?? 0,
  });

  const duration = scenario.durationHours ?? 1;
  const criticalityRank = rankComponentCriticality(impact);
  const mitigations = generateMitigations(impact, scenario);
  const business = calculateBusinessMetrics(impact, duration);

  return {
    scenario,
    impact,
    criticalityRank,
    mitigations,
    business,
    timestamp: new Date().toISOString(),
  };
}

export function runCustomSimulation({ componentIds, severity, durationHours, cascade, failoverDelayMin, capacityPercent }) {
  const scenario = {
    id: 'custom',
    name: 'Custom Scenario',
    description: `Simulated failure: ${componentIds.join(', ')}`,
    failedComponents: componentIds,
    severity,
    durationHours,
    cascade,
    failoverDelayMin: failoverDelayMin ?? 0,
    capacityPercent,
  };
  return runScenario(scenario);
}

export function getPrebuiltScenario(id) {
  return PREBUILT_SCENARIOS.find((s) => s.id === id);
}

export { PREBUILT_SCENARIOS };

import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { services, components, locations } from '../data/ontology';
import { runScenario, runCustomSimulation, PREBUILT_SCENARIOS } from '../engine/simulation';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('services');
  const [scenarioMode, setScenarioMode] = useState('live');
  const [filters, setFilters] = useState({
    serviceType: 'All',
    region: 'All',
    state: 'All',
    componentType: 'All',
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (filters.serviceType !== 'All' && s.type !== filters.serviceType) return false;
      if (filters.state !== 'All' && s.state !== filters.state) return false;
      return true;
    });
  }, [filters]);

  const filteredComponents = useMemo(() => {
    return components.filter((c) => {
      if (filters.region !== 'All' && c.region !== filters.region) return false;
      if (filters.state !== 'All' && c.state !== filters.state) return false;
      if (filters.componentType !== 'All' && c.type !== filters.componentType) return false;
      return true;
    });
  }, [filters]);

  const runPrebuiltScenario = useCallback((scenarioId) => {
    const scenario = PREBUILT_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const result = runScenario(scenario);
    setSimulationResult(result);
    setActiveScenarioId(scenarioId);
    setScenarioMode('simulation');
    setActiveTab('whatif');
  }, []);

  const runCustom = useCallback((params) => {
    const result = runCustomSimulation(params);
    setSimulationResult(result);
    setActiveScenarioId('custom');
    setScenarioMode('simulation');
    setActiveTab('whatif');
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationResult(null);
    setActiveScenarioId(null);
    setScenarioMode('live');
  }, []);

  const value = {
    activeTab,
    setActiveTab,
    scenarioMode,
    filters,
    setFilters,
    selectedEntity,
    setSelectedEntity,
    selectedEdge,
    setSelectedEdge,
    simulationResult,
    activeScenarioId,
    runPrebuiltScenario,
    runCustom,
    resetSimulation,
    filteredServices,
    filteredComponents,
    allServices: services,
    allComponents: components,
    allLocations: locations,
    prebuiltScenarios: PREBUILT_SCENARIOS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

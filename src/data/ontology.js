/** RDF-like ontology: entities, states, and semantic triples */

export const STATES = ['Active', 'Degraded', 'Failed', 'Maintenance', 'Unknown'];

export const STATE_COLORS = {
  Active: '#22c55e',
  Degraded: '#eab308',
  Failed: '#ef4444',
  Maintenance: '#94a3b8',
  Unknown: '#64748b',
};

export const SERVICE_TYPES = ['Voice', 'Data', 'Video', 'IoT'];

export const RELATIONSHIP_TYPES = ['dependsOn', 'supports', 'impacts', 'locatedAt'];

export const REGIONS = ['North', 'South', 'East', 'West'];

export const COMPONENT_TYPES = [
  'Base Station',
  'Router',
  'Core Network',
  'Load Balancer',
  'DNS Server',
  'CDN Node',
  'Auth Server',
  'Endpoint',
];

export const services = [
  {
    id: 'svc-volte',
    name: 'VoLTE',
    type: 'Voice',
    parentId: null,
    state: 'Active',
    criticality: 95,
    metrics: { bandwidth: 42, latency: 18, availability: 99.7 },
    description: 'Voice over LTE — carrier-grade voice service',
  },
  {
    id: 'svc-mbb',
    name: 'Mobile Broadband',
    type: 'Data',
    parentId: null,
    state: 'Degraded',
    criticality: 90,
    metrics: { bandwidth: 78, latency: 45, availability: 97.2 },
    description: '4G/5G mobile data connectivity for subscribers',
  },
  {
    id: 'svc-iot',
    name: 'IoT Connectivity',
    type: 'IoT',
    parentId: 'svc-mbb',
    state: 'Active',
    criticality: 70,
    metrics: { bandwidth: 12, latency: 85, availability: 99.1 },
    description: 'NB-IoT and LTE-M machine connectivity platform',
  },
  {
    id: 'svc-video',
    name: 'Video Streaming',
    type: 'Video',
    parentId: null,
    state: 'Active',
    criticality: 80,
    metrics: { bandwidth: 91, latency: 32, availability: 98.8 },
    description: 'OTT and carrier video delivery network',
  },
  {
    id: 'svc-vpn',
    name: 'Enterprise VPN',
    type: 'Data',
    parentId: null,
    state: 'Active',
    criticality: 88,
    metrics: { bandwidth: 55, latency: 28, availability: 99.5 },
    description: 'MPLS and IPsec enterprise private networking',
  },
  {
    id: 'svc-fixed',
    name: 'Fixed Line Broadband',
    type: 'Data',
    parentId: null,
    state: 'Maintenance',
    criticality: 75,
    metrics: { bandwidth: 0, latency: 0, availability: 0 },
    description: 'FTTH residential and business broadband',
  },
];

export const components = [
  { id: 'comp-bs-north', name: 'North Region BS Cluster', type: 'Base Station', region: 'North', state: 'Active', criticality: 75 },
  { id: 'comp-bs-south', name: 'South Region BS Cluster', type: 'Base Station', region: 'South', state: 'Degraded', criticality: 80 },
  { id: 'comp-bs-east', name: 'East Region BS Cluster', type: 'Base Station', region: 'East', state: 'Active', criticality: 72 },
  { id: 'comp-bs-west', name: 'West Region BS Cluster', type: 'Base Station', region: 'West', state: 'Active', criticality: 70 },
  { id: 'comp-router-east', name: 'East Region Router', type: 'Router', region: 'East', state: 'Failed', criticality: 92 },
  { id: 'comp-router-south', name: 'South Region Router', type: 'Router', region: 'South', state: 'Active', criticality: 88 },
  { id: 'comp-router-north', name: 'North Region Router', type: 'Router', region: 'North', state: 'Active', criticality: 85 },
  { id: 'comp-router-west', name: 'West Region Router', type: 'Router', region: 'West', state: 'Active', criticality: 84 },
  { id: 'comp-core-1', name: 'Core Router 1', type: 'Core Network', region: 'North', state: 'Active', criticality: 98 },
  { id: 'comp-core-2', name: 'Core Router 2', type: 'Core Network', region: 'South', state: 'Active', criticality: 97 },
  { id: 'comp-lb-1', name: 'Primary Load Balancer', type: 'Load Balancer', region: 'East', state: 'Active', criticality: 86 },
  { id: 'comp-lb-2', name: 'Secondary Load Balancer', type: 'Load Balancer', region: 'West', state: 'Active', criticality: 82 },
  { id: 'comp-dns-primary', name: 'Primary DNS Server', type: 'DNS Server', region: 'North', state: 'Active', criticality: 90 },
  { id: 'comp-dns-secondary', name: 'Secondary DNS Server', type: 'DNS Server', region: 'South', state: 'Active', criticality: 75 },
  { id: 'comp-cdn-1', name: 'CDN Node East', type: 'CDN Node', region: 'East', state: 'Degraded', criticality: 78 },
  { id: 'comp-cdn-2', name: 'CDN Node West', type: 'CDN Node', region: 'West', state: 'Active', criticality: 76 },
  { id: 'comp-auth-1', name: 'Authentication Server A', type: 'Auth Server', region: 'North', state: 'Active', criticality: 94 },
  { id: 'comp-auth-2', name: 'Authentication Server B', type: 'Auth Server', region: 'South', state: 'Active', criticality: 91 },
  { id: 'comp-ep-mme', name: 'MME Endpoint Pool', type: 'Endpoint', region: 'East', state: 'Active', criticality: 88 },
];

export const locations = [
  { id: 'loc-north', name: 'North Zone DC', region: 'North', lat: 52.5, lng: -1.9 },
  { id: 'loc-south', name: 'South Zone DC', region: 'South', lat: 51.4, lng: -0.1 },
  { id: 'loc-east', name: 'East Zone DC', region: 'East', lat: 51.5, lng: 0.1 },
  { id: 'loc-west', name: 'West Zone DC', region: 'West', lat: 51.45, lng: -2.6 },
];

/** RDF triples: { subject, predicate, object, strength?, metadata? } */
export const triples = [
  // dependsOn — services → components
  { subject: 'svc-volte', predicate: 'dependsOn', object: 'comp-bs-east', strength: 'critical' },
  { subject: 'svc-volte', predicate: 'dependsOn', object: 'comp-core-1', strength: 'critical' },
  { subject: 'svc-volte', predicate: 'dependsOn', object: 'comp-auth-1', strength: 'important' },
  { subject: 'svc-volte', predicate: 'dependsOn', object: 'comp-ep-mme', strength: 'critical' },
  { subject: 'svc-mbb', predicate: 'dependsOn', object: 'comp-bs-south', strength: 'critical' },
  { subject: 'svc-mbb', predicate: 'dependsOn', object: 'comp-router-south', strength: 'critical' },
  { subject: 'svc-mbb', predicate: 'dependsOn', object: 'comp-core-2', strength: 'important' },
  { subject: 'svc-mbb', predicate: 'dependsOn', object: 'comp-lb-1', strength: 'optional' },
  { subject: 'svc-iot', predicate: 'dependsOn', object: 'comp-bs-north', strength: 'important' },
  { subject: 'svc-iot', predicate: 'dependsOn', object: 'comp-core-1', strength: 'critical' },
  { subject: 'svc-iot', predicate: 'dependsOn', object: 'comp-auth-2', strength: 'optional' },
  { subject: 'svc-video', predicate: 'dependsOn', object: 'comp-cdn-1', strength: 'critical' },
  { subject: 'svc-video', predicate: 'dependsOn', object: 'comp-cdn-2', strength: 'important' },
  { subject: 'svc-video', predicate: 'dependsOn', object: 'comp-lb-2', strength: 'important' },
  { subject: 'svc-video', predicate: 'dependsOn', object: 'comp-dns-primary', strength: 'optional' },
  { subject: 'svc-vpn', predicate: 'dependsOn', object: 'comp-core-1', strength: 'critical' },
  { subject: 'svc-vpn', predicate: 'dependsOn', object: 'comp-core-2', strength: 'critical' },
  { subject: 'svc-vpn', predicate: 'dependsOn', object: 'comp-router-north', strength: 'important' },
  { subject: 'svc-vpn', predicate: 'dependsOn', object: 'comp-auth-1', strength: 'critical' },
  { subject: 'svc-fixed', predicate: 'dependsOn', object: 'comp-router-west', strength: 'critical' },
  { subject: 'svc-fixed', predicate: 'dependsOn', object: 'comp-bs-west', strength: 'important' },
  { subject: 'svc-fixed', predicate: 'dependsOn', object: 'comp-dns-secondary', strength: 'optional' },

  // supports — components → services
  { subject: 'comp-bs-east', predicate: 'supports', object: 'svc-volte', strength: 'critical' },
  { subject: 'comp-core-1', predicate: 'supports', object: 'svc-volte', strength: 'critical' },
  { subject: 'comp-cdn-1', predicate: 'supports', object: 'svc-video', strength: 'critical' },
  { subject: 'comp-lb-1', predicate: 'supports', object: 'svc-mbb', strength: 'important' },
  { subject: 'comp-auth-1', predicate: 'supports', object: 'svc-vpn', strength: 'critical' },

  // impacts — component failure impacts services
  { subject: 'comp-router-east', predicate: 'impacts', object: 'svc-volte', strength: 'critical', historicalImpact: '3 outages / 12mo, avg 47min' },
  { subject: 'comp-router-east', predicate: 'impacts', object: 'svc-mbb', strength: 'important', historicalImpact: '2 outages / 12mo' },
  { subject: 'comp-dns-primary', predicate: 'impacts', object: 'svc-video', strength: 'critical', historicalImpact: 'DNS cascade 2024-Q3, 2.1M users' },
  { subject: 'comp-dns-primary', predicate: 'impacts', object: 'svc-iot', strength: 'important', historicalImpact: 'Provisioning delays' },
  { subject: 'comp-cdn-1', predicate: 'impacts', object: 'svc-video', strength: 'critical', historicalImpact: 'Buffering spike +340%' },
  { subject: 'comp-bs-south', predicate: 'impacts', object: 'svc-mbb', strength: 'critical', historicalImpact: 'Regional congestion events' },
  { subject: 'comp-core-2', predicate: 'impacts', object: 'svc-vpn', strength: 'critical', historicalImpact: 'Enterprise SLA breach risk' },

  // locatedAt — components → locations
  { subject: 'comp-bs-north', predicate: 'locatedAt', object: 'loc-north', strength: 'critical' },
  { subject: 'comp-bs-south', predicate: 'locatedAt', object: 'loc-south', strength: 'critical' },
  { subject: 'comp-bs-east', predicate: 'locatedAt', object: 'loc-east', strength: 'critical' },
  { subject: 'comp-bs-west', predicate: 'locatedAt', object: 'loc-west', strength: 'critical' },
  { subject: 'comp-router-east', predicate: 'locatedAt', object: 'loc-east', strength: 'critical' },
  { subject: 'comp-router-south', predicate: 'locatedAt', object: 'loc-south', strength: 'critical' },
  { subject: 'comp-core-1', predicate: 'locatedAt', object: 'loc-north', strength: 'critical' },
  { subject: 'comp-core-2', predicate: 'locatedAt', object: 'loc-south', strength: 'critical' },
  { subject: 'comp-dns-primary', predicate: 'locatedAt', object: 'loc-north', strength: 'critical' },
  { subject: 'comp-cdn-1', predicate: 'locatedAt', object: 'loc-east', strength: 'critical' },
  { subject: 'comp-auth-1', predicate: 'locatedAt', object: 'loc-north', strength: 'critical' },
  { subject: 'comp-auth-2', predicate: 'locatedAt', object: 'loc-south', strength: 'critical' },

  // transitive component dependencies (impacts chains)
  { subject: 'comp-bs-east', predicate: 'dependsOn', object: 'comp-router-east', strength: 'critical' },
  { subject: 'comp-ep-mme', predicate: 'dependsOn', object: 'comp-router-east', strength: 'critical' },
  { subject: 'comp-lb-1', predicate: 'dependsOn', object: 'comp-router-east', strength: 'important' },
  { subject: 'comp-cdn-1', predicate: 'dependsOn', object: 'comp-lb-1', strength: 'important' },
  { subject: 'comp-dns-secondary', predicate: 'dependsOn', object: 'comp-dns-primary', strength: 'optional' },
];

export const PREBUILT_SCENARIOS = [
  {
    id: 'scenario-spof-east-router',
    name: 'Single Point of Failure',
    description: 'What if East Region Router fails?',
    failedComponents: ['comp-router-east'],
    severity: 'Failed',
    durationHours: 4,
    cascade: false,
    failoverDelayMin: 0,
    capacityPercent: null,
  },
  {
    id: 'scenario-dns-cascade',
    name: 'Cascading Failure',
    description: 'What if Primary DNS Server fails + automatic failover delays?',
    failedComponents: ['comp-dns-primary'],
    severity: 'Failed',
    durationHours: 2,
    cascade: true,
    failoverDelayMin: 45,
    capacityPercent: null,
  },
  {
    id: 'scenario-cdn-exhaust',
    name: 'Resource Exhaustion',
    description: 'What if CDN Node capacity reaches 95%?',
    failedComponents: ['comp-cdn-1'],
    severity: 'Degraded',
    durationHours: 6,
    cascade: false,
    failoverDelayMin: 0,
    capacityPercent: 95,
  },
  {
    id: 'scenario-south-disaster',
    name: 'Geographic Disaster',
    description: 'What if entire South region loses connectivity?',
    failedComponents: [
      'comp-bs-south',
      'comp-router-south',
      'comp-core-2',
      'comp-auth-2',
      'comp-dns-secondary',
    ],
    severity: 'Failed',
    durationHours: 12,
    cascade: true,
    failoverDelayMin: 0,
    capacityPercent: null,
  },
  {
    id: 'scenario-core2-maint',
    name: 'Maintenance Window',
    description: 'What if we take Core Router 2 offline for 2 hours?',
    failedComponents: ['comp-core-2'],
    severity: 'Maintenance',
    durationHours: 2,
    cascade: false,
    failoverDelayMin: 0,
    capacityPercent: null,
  },
];

/** Generate 24h timeline data for a service */
export function generateTimeline(serviceId, baseState) {
  const points = [];
  const now = Date.now();
  const states = ['Active', 'Active', 'Active', 'Degraded', 'Active', 'Failed', 'Degraded', 'Active'];
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 3600000);
    const idx = (i + serviceId.length) % states.length;
    let state = states[idx];
    if (baseState === 'Failed' && i < 3) state = 'Failed';
    if (baseState === 'Degraded' && i < 6) state = 'Degraded';
    if (baseState === 'Maintenance' && i < 8) state = 'Maintenance';
    points.push({
      hour: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      availability: state === 'Active' ? 99 + Math.random() : state === 'Degraded' ? 92 + Math.random() * 4 : state === 'Failed' ? 40 + Math.random() * 20 : 0,
      state,
    });
  }
  return points;
}

export function getEntityById(id) {
  return (
    services.find((s) => s.id === id) ||
    components.find((c) => c.id === id) ||
    locations.find((l) => l.id === id) ||
    null
  );
}

export function getEntityKind(id) {
  if (services.some((s) => s.id === id)) return 'service';
  if (components.some((c) => c.id === id)) return 'component';
  if (locations.some((l) => l.id === id)) return 'location';
  return 'unknown';
}

export const TYPE_COLORS = {
  Voice: '#60a5fa',
  Data: '#34d399',
  Video: '#f472b6',
  IoT: '#a78bfa',
  service: '#60a5fa',
  component: '#fbbf24',
  location: '#2dd4bf',
};

export const DATA_SOURCE_TIMESTAMP = new Date().toISOString();

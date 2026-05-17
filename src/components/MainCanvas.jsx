import { useApp } from '../context/AppContext';
import ServiceStateTab from './tabs/ServiceStateTab';
import KnowledgeGraphTab from './tabs/KnowledgeGraphTab';
import WhatIfTab from './tabs/WhatIfTab';

const TABS = [
  { id: 'services', label: 'Service State Dashboard' },
  { id: 'graph', label: 'Semantic Relationship Graph' },
  { id: 'whatif', label: 'What-If Analysis' },
];

export default function MainCanvas() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <main className="main-canvas">
      <div className="tab-bar" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === 'services' && <ServiceStateTab />}
        {activeTab === 'graph' && <KnowledgeGraphTab />}
        {activeTab === 'whatif' && <WhatIfTab />}
      </div>
    </main>
  );
}

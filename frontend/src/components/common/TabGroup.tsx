import { useState } from 'react';

interface Tab {
  id: string;
  name: string;
}

interface TabGroupProps {
  tabs: Tab[];
  onChange: (tabId: string) => void;
  defaultTab?: string;
}

export default function TabGroup({ tabs, onChange, defaultTab }: TabGroupProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    onChange(tabId);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                selectedTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
} 
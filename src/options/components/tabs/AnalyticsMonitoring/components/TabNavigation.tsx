import { Icon, IconName } from '@/shared/components/Icon';

type TabId = 'overview' | 'rules' | 'performance' | 'errors' | 'suggestions';

const NAVIGATION_TABS: Array<{ id: TabId; label: string; icon: IconName }> = [
  { id: 'overview', label: 'Overview', icon: 'bar-chart' },
  { id: 'rules', label: 'Rule Effectiveness', icon: 'target' },
  { id: 'performance', label: 'Performance', icon: 'zap' },
  { id: 'errors', label: 'Error Tracking', icon: 'alert-triangle' },
  { id: 'suggestions', label: 'Suggestions', icon: 'lightbulb' },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8">
        {NAVIGATION_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export type { TabId };

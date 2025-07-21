import { useState, useEffect, useRef } from 'preact/hooks';

import { Icon, type IconName } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';

type TabType =
  | 'rules'
  | 'profiles'
  | 'templates'
  | 'variables'
  | 'conditional-rules'
  | 'rule-testing'
  | 'performance'
  | 'analytics'
  | 'settings'
  | 'import-export'
  | 'help';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  mobileOnly?: boolean;
}

interface Tab {
  id: TabType;
  label: string;
  icon: IconName;
  description: string;
  group: 'core' | 'advanced' | 'system' | 'support';
}

interface TabGroup {
  id: string;
  label: string;
  tabs: Tab[];
}

export function TabNavigation({
  activeTab,
  onTabChange,
  mobileOnly = false,
}: Readonly<TabNavigationProps>) {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Create localized tabs
  const localizedTabs: Tab[] = [
    // Core Functions
    {
      id: 'rules',
      label: t('tab_rule_management'),
      icon: 'target',
      description: t('options_tab_rules_desc'),
      group: 'core',
    },
    {
      id: 'profiles',
      label: t('options_tab_profiles'),
      icon: 'users',
      description: t('options_tab_profiles_desc'),
      group: 'core',
    },
    {
      id: 'templates',
      label: t('tab_rule_templates'),
      icon: 'file-text',
      description: t('options_tab_templates_desc'),
      group: 'core',
    },
    {
      id: 'variables',
      label: t('tab_variable_manager'),
      icon: 'sparkles',
      description: t('options_tab_variables_desc'),
      group: 'core',
    },
    // Advanced Features
    {
      id: 'conditional-rules',
      label: t('tab_conditional_rules'),
      icon: 'git-branch',
      description: t('options_tab_conditional_rules_desc'),
      group: 'advanced',
    },
    {
      id: 'rule-testing',
      label: t('options_tab_rule_testing'),
      icon: 'test-tube',
      description: t('options_tab_rule_testing_desc'),
      group: 'advanced',
    },
    {
      id: 'performance',
      label: t('tab_performance'),
      icon: 'zap',
      description: t('options_tab_performance_desc'),
      group: 'advanced',
    },
    // System & Analytics
    {
      id: 'analytics',
      label: t('options_tab_analytics'),
      icon: 'bar-chart',
      description: t('options_tab_analytics_desc'),
      group: 'system',
    },
    {
      id: 'settings',
      label: t('tab_general_settings'),
      icon: 'settings',
      description: t('options_tab_settings_desc'),
      group: 'system',
    },
    // Support & Tools
    {
      id: 'import-export',
      label: t('options_tab_import_export'),
      icon: 'package',
      description: t('options_tab_import_export_desc'),
      group: 'support',
    },
    {
      id: 'help',
      label: t('options_tab_help'),
      icon: 'help-circle',
      description: t('options_tab_help_desc'),
      group: 'support',
    },
  ];

  const localizedTabGroups: TabGroup[] = [
    {
      id: 'core',
      label: t('options_group_core'),
      tabs: localizedTabs.filter(tab => tab.group === 'core'),
    },
    {
      id: 'advanced',
      label: t('group_advanced_features'),
      tabs: localizedTabs.filter(tab => tab.group === 'advanced'),
    },
    {
      id: 'system',
      label: t('options_group_system'),
      tabs: localizedTabs.filter(tab => tab.group === 'system'),
    },
    {
      id: 'support',
      label: t('options_group_support'),
      tabs: localizedTabs.filter(tab => tab.group === 'support'),
    },
  ];

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleTabClick = (tabId: TabType) => {
    onTabChange(tabId);
    // Auto-close mobile menu after selection
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent, tabId: TabType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(tabId);
    }
  };

  const renderTabButton = (
    tab: Tab,
    showDescription = true,
    className = ''
  ) => (
    <button
      key={tab.id}
      onClick={() => handleTabClick(tab.id)}
      onKeyDown={e => handleKeyDown(e, tab.id)}
      onMouseEnter={() => setHoveredTab(tab.id)}
      onMouseLeave={() => setHoveredTab(null)}
      className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
        activeTab === tab.id
          ? 'bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      } ${className}`}
      aria-current={activeTab === tab.id ? 'page' : undefined}
      title={!showDescription ? tab.description : undefined}
    >
      <div className="flex items-start space-x-3">
        <Icon name={tab.icon} size={20} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{tab.label}</p>
          {showDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tab.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );

  const renderTabGroup = (group: TabGroup, showDescription = true) => (
    <div key={group.id} className="space-y-1">
      {showDescription && (
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {group.label}
        </h3>
      )}
      {group.tabs.map(tab => renderTabButton(tab, showDescription))}
    </div>
  );

  // If mobileOnly is true, render only the mobile hamburger button and overlay
  if (mobileOnly) {
    return (
      <>
        {/* Mobile Hamburger Button */}
        <button
          ref={hamburgerRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Icon
            name={isMobileMenuOpen ? 'close' : 'menu'}
            size={20}
            className="text-gray-700 dark:text-gray-300"
          />
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 animate-in fade-in-0"
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Menu */}
        <nav
          ref={overlayRef}
          id="mobile-navigation"
          className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Main navigation"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </h2>
          </div>
          <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
            {localizedTabGroups.map(group => renderTabGroup(group, true))}
          </div>
        </nav>
      </>
    );
  }

  // Regular navigation for tablet and desktop
  return (
    <>
      {/* Tablet Compact Sidebar */}
      <nav
        className="hidden md:block lg:hidden w-16 space-y-1"
        aria-label="Main navigation"
      >
        {localizedTabs.map(tab => (
          <div key={tab.id} className="relative group">
            <button
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={e => handleKeyDown(e, tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={`${tab.label} - ${tab.description}`}
            >
              <Icon name={tab.icon} size={20} className="flex-shrink-0" />
            </button>
            {/* Tooltip on hover */}
            {hoveredTab === tab.id && (
              <div className="absolute left-full top-0 ml-2 z-10 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap animate-in fade-in-0 slide-in-from-left-2">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-75 mt-1">{tab.description}</div>
                {/* Arrow */}
                <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Desktop Full Sidebar */}
      <nav
        className="hidden lg:block w-64 min-w-64 max-w-64 space-y-6"
        aria-label="Main navigation"
      >
        {localizedTabGroups.map(group => renderTabGroup(group, true))}
      </nav>
    </>
  );
}

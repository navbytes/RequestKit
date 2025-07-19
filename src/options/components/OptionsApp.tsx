import { useState, useEffect } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import { AnalyticsMonitor } from '@/lib/integrations/analytics-monitor';
import { ThemeIcon } from '@/shared/components/ThemeIcon';
import { Alert } from '@/shared/components/ui/Alert';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';
import { ThemeManager } from '@/shared/utils/theme';

import { EnhancedImportExport } from './EnhancedImportExport';
import { TabNavigation } from './TabNavigation';
import { AnalyticsMonitoring } from './tabs/AnalyticsMonitoring';
import { ConditionalRuleBuilder } from './tabs/ConditionalRuleBuilder';
import { GeneralSettings } from './tabs/GeneralSettings';
import { HelpAbout } from './tabs/HelpAbout';
import { PerformanceOptimization } from './tabs/PerformanceOptimization';
import { ProfileManager } from './tabs/ProfileManager';
import { RuleManagement } from './tabs/RuleManagement';
import { RuleTestingFrameworkComponent } from './tabs/RuleTestingFramework';
import { TemplateManager } from './tabs/TemplateManager';
import { VariableManager } from './tabs/VariableManager';

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

interface OptionsState {
  activeTab: TabType;
  rules: HeaderRule[];
  settings: ExtensionSettings;
  loading: boolean;
  error: string | null;
  notification: {
    show: boolean;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  } | null;
}

// Get logger for this module
const logger = loggers.shared;

// Utility function to get tab from URL hash
const getTabFromUrl = (): TabType => {
  const hash = window.location.hash.slice(1); // Remove the '#'
  const validTabs: TabType[] = [
    'rules',
    'profiles',
    'templates',
    'variables',
    'conditional-rules',
    'rule-testing',
    'performance',
    'analytics',
    'settings',
    'import-export',
    'help',
  ];

  return validTabs.includes(hash as TabType) ? (hash as TabType) : 'rules';
};

// Utility function to update URL hash
const updateUrlHash = (tab: TabType) => {
  window.history.replaceState(null, '', `#${tab}`);
};

// Utility function to clean URL parameters
const cleanUrlParameters = () => {
  const url = new URL(window.location.href);
  url.search = ''; // Remove all query parameters
  window.history.replaceState(null, '', url.toString());
};

export function OptionsApp() {
  const { t } = useI18n();
  const [state, setState] = useState<OptionsState>({
    activeTab: getTabFromUrl(),
    rules: [],
    settings: {
      enabled: true,
      debugMode: false,
      logLevel: 'info' as const,
      notifications: {
        enabled: true,
        showRuleMatches: false,
        showErrors: true,
        showUpdates: true,
      },
      ui: {
        theme: 'auto' as const,
        compactMode: false,
        showAdvancedOptions: false,
        defaultTab: 'rules',
      },
      performance: {
        maxRules: 100,
        cacheTimeout: 300,
        enableMetrics: false,
      },
      backup: {
        autoBackup: true,
        backupInterval: 24,
        maxBackups: 5,
      },
      security: {
        requireConfirmation: false,
        allowExternalImport: true,
        validatePatterns: true,
      },
    },
    loading: true,
    error: null,
    notification: null,
  });

  // Check for URL parameters to determine initial tab and actions
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const storage = (await ChromeApiUtils.storage.get([
          STORAGE_KEYS.RULES,
          STORAGE_KEYS.SETTINGS,
        ])) as Record<string, unknown>;
        const rules = Object.values(
          (storage[STORAGE_KEYS.RULES] as Record<string, HeaderRule>) || {}
        );
        const settings = (storage[
          STORAGE_KEYS.SETTINGS
        ] as ExtensionSettings) || {
          enabled: true,
          debugMode: false,
          logLevel: 'info' as const,
          notifications: {
            enabled: true,
            showRuleMatches: false,
            showErrors: true,
            showUpdates: true,
          },
          ui: {
            theme: 'auto' as const,
            compactMode: false,
            showAdvancedOptions: false,
            defaultTab: 'rules',
          },
          performance: {
            maxRules: 100,
            cacheTimeout: 300,
            enableMetrics: false,
          },
          backup: {
            autoBackup: true,
            backupInterval: 24,
            maxBackups: 5,
          },
          security: {
            requireConfirmation: false,
            allowExternalImport: true,
            validatePatterns: true,
          },
        };

        setState(prev => ({
          ...prev,
          rules,
          settings,
          loading: false,
        }));
      } catch (error) {
        logger.error('Failed to load options data:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: t('options_error_load_data'),
        }));
      }
    };
    // Initialize theme manager
    ThemeManager.getInstance();

    // Initialize analytics monitor
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    analyticsMonitor.initialize();

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const ruleId = urlParams.get('ruleId');

    logger.info('URL parameters detected:', { action, ruleId });

    if (action === 'create') {
      setState(prev => ({ ...prev, activeTab: 'rules' }));
      updateUrlHash('rules');
      // We'll handle the create action in RuleManagement component
    } else if (action === 'edit' && ruleId) {
      setState(prev => ({ ...prev, activeTab: 'rules' }));
      updateUrlHash('rules');
      logger.info('Edit action detected for rule:', ruleId);
      // We'll handle the edit action in RuleManagement component
    }

    // Listen for hash changes (browser back/forward navigation)
    const handleHashChange = () => {
      const newTab = getTabFromUrl();
      setState(prev => ({ ...prev, activeTab: newTab }));
    };

    window.addEventListener('hashchange', handleHashChange);

    loadData();

    // Cleanup event listener
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [t]);

  const handleTabChange = (tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));

    // Clean URL parameters when navigating away from rules tab
    // This removes edit/create action parameters when switching tabs
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has('action') || currentParams.has('ruleId')) {
      cleanUrlParameters();
    }

    // Update URL hash
    updateUrlHash(tab);

    // Track tab navigation
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    analyticsMonitor.trackUserAction('tab_navigation', { tab });
  };

  const handleRulesUpdate = (rules: HeaderRule[]) => {
    const previousCount = state.rules.length;
    const newCount = rules.length;

    setState(prev => ({ ...prev, rules }));

    // Track rule changes
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    if (newCount > previousCount) {
      analyticsMonitor.trackUserAction('rule_created');
    } else if (newCount < previousCount) {
      analyticsMonitor.trackUserAction('rule_deleted');
    } else {
      analyticsMonitor.trackUserAction('rule_modified');
    }
  };

  const handleSettingsUpdate = (settings: ExtensionSettings) => {
    setState(prev => ({ ...prev, settings }));
  };

  const showNotification = (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    setState(prev => ({
      ...prev,
      notification: { show: true, message, variant },
    }));

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        notification: null,
      }));
    }, 5000);
  };

  const handleTemplateApply = (rule: HeaderRule) => {
    const updatedRules = [...state.rules, rule];
    handleRulesUpdate(updatedRules);

    // Show success notification
    const templateName = rule.name.replace(' - Applied from Template', '');
    showNotification(t('options_template_applied_success', [templateName]));

    // Navigate to rules tab
    setState(prev => ({ ...prev, activeTab: 'rules' }));
    updateUrlHash('rules');

    // Track template application
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    analyticsMonitor.trackUserAction('template_applied', {
      templateName: rule.name,
    });
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('options_loading')}
          </p>
        </div>
      </div>
    );
  }

  const containerClasses = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className={containerClasses}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {/* Mobile Hamburger Button - Only visible on mobile */}
              <div className="md:hidden">
                <TabNavigation
                  activeTab={state.activeTab}
                  onTabChange={handleTabChange}
                  mobileOnly={true}
                />
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1">
                <ThemeIcon
                  lightSrc="/assets/icons/icon-32.png"
                  darkSrc="/assets/icons/icon-white-32.png"
                  alt="RequestKit"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('options_title')}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {state.rules.length} {t('options_rules_configured')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {state.error && (
        <div className="bg-error-50 border-l-4 border-error-400 p-4">
          <div className={containerClasses}>
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-error-700">{state.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {state.notification && (
        <div className={containerClasses}>
          <div className="py-4">
            <Alert
              variant={state.notification.variant}
              onClose={() =>
                setState(prev => ({ ...prev, notification: null }))
              }
            >
              {state.notification.message}
            </Alert>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${containerClasses} py-8`}>
        <div className="flex gap-8">
          {/* Navigation Sidebar - Hidden on mobile, sticky on tablet/desktop */}
          <div className="hidden md:flex flex-shrink-0 sticky top-8 self-start">
            <TabNavigation
              activeTab={state.activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {state.activeTab === 'rules' && (
                <RuleManagement
                  rules={state.rules}
                  onRulesUpdate={handleRulesUpdate}
                  initialAction={new URLSearchParams(
                    window.location.search
                  ).get('action')}
                  initialRuleId={new URLSearchParams(
                    window.location.search
                  ).get('ruleId')}
                  initialUrl={new URLSearchParams(window.location.search).get(
                    'url'
                  )}
                />
              )}
              {state.activeTab === 'profiles' && (
                <ProfileManager
                  rules={state.rules}
                  onRulesUpdate={handleRulesUpdate}
                />
              )}
              {state.activeTab === 'templates' && (
                <TemplateManager onTemplateApply={handleTemplateApply} />
              )}
              {state.activeTab === 'variables' && <VariableManager />}
              {state.activeTab === 'conditional-rules' && (
                <ConditionalRuleBuilder
                  rules={state.rules}
                  onRulesUpdate={handleRulesUpdate}
                />
              )}
              {state.activeTab === 'rule-testing' && (
                <RuleTestingFrameworkComponent rules={state.rules} />
              )}
              {state.activeTab === 'performance' && (
                <PerformanceOptimization
                  rules={state.rules}
                  onRulesUpdate={handleRulesUpdate}
                />
              )}
              {state.activeTab === 'analytics' && <AnalyticsMonitoring />}
              {state.activeTab === 'settings' && (
                <GeneralSettings
                  settings={state.settings}
                  onSettingsUpdate={handleSettingsUpdate}
                />
              )}
              {state.activeTab === 'import-export' && (
                <EnhancedImportExport
                  rules={state.rules}
                  settings={state.settings}
                  onRulesUpdate={handleRulesUpdate}
                  onSettingsUpdate={handleSettingsUpdate}
                />
              )}
              {state.activeTab === 'help' && <HelpAbout />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

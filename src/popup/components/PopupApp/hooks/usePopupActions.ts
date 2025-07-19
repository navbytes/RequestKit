import { useCallback } from 'preact/hooks';

import { STORAGE_KEYS } from '@/config/constants';
import { matchURLPattern } from '@/lib/core';
import { AnalyticsMonitor } from '@/lib/integrations';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

interface PopupState {
  enabled: boolean;
  rules: HeaderRule[];
  activeRulesCount: number;
  loading: boolean;
  error: string | null;
  settings: ExtensionSettings | null;
  activeProfile: string;
}

interface StatusResponse {
  enabled: boolean;
}

// Get logger for this module
const logger = loggers.shared;

export function usePopupActions(
  state: PopupState,
  setState: (updater: (prev: PopupState) => PopupState) => void,
  currentTab: chrome.tabs.Tab | null,
  setShowQuickCreator: (show: boolean) => void
) {
  const calculateActiveRulesCount = (
    rules: HeaderRule[],
    currentUrl?: string
  ) => {
    if (!currentUrl) return 0;
    return rules.filter(rule => {
      if (!rule.enabled) return false;
      try {
        const result = matchURLPattern(currentUrl, rule.pattern);
        return result.matches;
      } catch {
        return false;
      }
    }).length;
  };

  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get status from background script
      const response = (await ChromeApiUtils.runtime.sendMessage({
        type: 'GET_STATUS',
      })) as StatusResponse;

      // Get active profile
      const profileResponse = (await ChromeApiUtils.runtime.sendMessage({
        type: 'GET_PROFILES',
      })) as { profiles: unknown[]; activeProfile: string };

      // Load rules from storage
      const storage = (await ChromeApiUtils.storage.get([
        STORAGE_KEYS.RULES,
        STORAGE_KEYS.SETTINGS,
      ])) as Record<string, unknown>;
      const rules = Object.values(
        (storage[STORAGE_KEYS.RULES] as Record<string, HeaderRule>) || {}
      ) as HeaderRule[];
      const settings = storage[STORAGE_KEYS.SETTINGS] as ExtensionSettings;

      setState(prev => ({
        ...prev,
        enabled: response.enabled || settings?.enabled || true,
        rules,
        activeRulesCount: 0, // Will be calculated when currentTab is available
        loading: false,
        error: null,
        settings,
        activeProfile: profileResponse?.activeProfile || 'dev-profile',
      }));
    } catch (error) {
      logger.error('Failed to load popup data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load extension data',
      }));
    }
  }, [setState]);

  const getCurrentTab = useCallback(async () => {
    try {
      const tabs = (await ChromeApiUtils.tabs.query({
        active: true,
        currentWindow: true,
      })) as chrome.tabs.Tab[];
      return tabs[0] || null;
    } catch (error) {
      logger.error('Failed to get current tab:', error);
      return null;
    }
  }, []);

  const handleToggleExtension = async () => {
    try {
      const newEnabled = !state.enabled;

      // Send message to background script
      await ChromeApiUtils.runtime.sendMessage({
        type: 'TOGGLE_EXTENSION',
        enabled: newEnabled,
      });

      setState(prev => ({ ...prev, enabled: newEnabled }));

      // Track extension toggle
      const analyticsMonitor = AnalyticsMonitor.getInstance();
      analyticsMonitor.trackUserAction('extension_toggle', {
        enabled: newEnabled,
      });
    } catch (error) {
      logger.error('Failed to toggle extension:', error);
      setState(prev => ({ ...prev, error: 'Failed to toggle extension' }));
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      const rule = state.rules.find(r => r.id === ruleId);
      if (!rule) return;

      const updatedRule = { ...rule, enabled: !rule.enabled };
      const updatedRules = state.rules.map(r =>
        r.id === ruleId ? updatedRule : r
      );

      // Update storage
      const rulesObject = updatedRules.reduce(
        (acc, rule) => {
          acc[rule.id] = rule;
          return acc;
        },
        {} as Record<string, HeaderRule>
      );

      await ChromeApiUtils.storage.set({
        [STORAGE_KEYS.RULES]: rulesObject,
      });

      setState(prev => ({
        ...prev,
        rules: updatedRules,
        activeRulesCount: calculateActiveRulesCount(
          updatedRules,
          currentTab?.url
        ),
      }));

      // Track rule toggle
      const analyticsMonitor = AnalyticsMonitor.getInstance();
      analyticsMonitor.trackUserAction('rule_toggle', {
        ruleId,
        enabled: updatedRule.enabled,
      });
    } catch (error) {
      logger.error('Failed to toggle rule:', error);
      setState(prev => ({ ...prev, error: 'Failed to toggle rule' }));
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const updatedRules = state.rules.filter(r => r.id !== ruleId);

      // Update storage
      const rulesObject = updatedRules.reduce(
        (acc, rule) => {
          acc[rule.id] = rule;
          return acc;
        },
        {} as Record<string, HeaderRule>
      );

      await ChromeApiUtils.storage.set({
        [STORAGE_KEYS.RULES]: rulesObject,
      });

      setState(prev => ({
        ...prev,
        rules: updatedRules,
        activeRulesCount: calculateActiveRulesCount(
          updatedRules,
          currentTab?.url
        ),
      }));
    } catch (error) {
      logger.error('Failed to delete rule:', error);
      setState(prev => ({ ...prev, error: 'Failed to delete rule' }));
    }
  };

  const handleQuickRuleCreated = async (rule: HeaderRule) => {
    try {
      // Add the new rule to storage
      const updatedRules = [...state.rules, rule];
      const rulesObject = updatedRules.reduce(
        (acc, rule) => {
          acc[rule.id] = rule;
          return acc;
        },
        {} as Record<string, HeaderRule>
      );

      await ChromeApiUtils.storage.set({
        [STORAGE_KEYS.RULES]: rulesObject,
      });

      // Update state
      setState(prev => ({
        ...prev,
        rules: updatedRules,
        activeRulesCount: calculateActiveRulesCount(
          updatedRules,
          currentTab?.url
        ),
      }));

      // Hide the creator
      setShowQuickCreator(false);

      // Notify background script to update rules
      ChromeApiUtils.runtime.sendMessage({ type: 'RULES_UPDATED' });

      // Track rule creation
      const analyticsMonitor = AnalyticsMonitor.getInstance();
      analyticsMonitor.trackUserAction('rule_created', {
        source: 'popup_quick_creator',
        ruleId: rule.id,
      });
    } catch (error) {
      logger.error('Failed to create rule:', error);
      setState(prev => ({ ...prev, error: 'Failed to create rule' }));
    }
  };

  const handleEditRule = (ruleId: string) => {
    const optionsUrl = ChromeApiUtils.runtime.getURL('src/options/index.html');
    const editUrl = `${optionsUrl}?action=edit&ruleId=${encodeURIComponent(
      ruleId
    )}`;
    ChromeApiUtils.tabs.create({ url: editUrl });
    window.close();
  };

  const openOptionsPage = () => {
    ChromeApiUtils.runtime.openOptionsPage();
    window.close();
  };

  const openAdvancedRuleCreator = () => {
    if (currentTab?.url) {
      const optionsUrl = ChromeApiUtils.runtime.getURL(
        'src/options/index.html'
      );
      const createUrl = `${optionsUrl}?action=create&url=${encodeURIComponent(
        currentTab.url
      )}`;
      ChromeApiUtils.tabs.create({ url: createUrl });
      window.close();
    }
  };

  const handleProfileChange = useCallback(
    (profileId: string) => {
      setState(prev => ({
        ...prev,
        activeProfile: profileId,
      }));
    },
    [setState]
  );

  return {
    loadInitialData,
    getCurrentTab,
    handleToggleExtension,
    handleToggleRule,
    handleDeleteRule,
    handleQuickRuleCreated,
    handleEditRule,
    openOptionsPage,
    openAdvancedRuleCreator,
    handleProfileChange,
  };
}

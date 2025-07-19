import { useState, useEffect } from 'preact/hooks';

import { matchURLPattern } from '@/lib/core/pattern-matcher';
import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';

import { LoadingSpinner } from '../LoadingSpinner';
import { PopupHeader } from '../PopupHeader';

import { usePopupActions } from './hooks/usePopupActions';
import { usePopupState } from './hooks/usePopupState';
import { useThemeManager } from './hooks/useThemeManager';
import { PopupContent } from './PopupContent';

export function PopupApp() {
  const { t } = useI18n();
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);

  const { state, setState } = usePopupState();
  const { handleToggleTheme } = useThemeManager();

  const {
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
  } = usePopupActions(state, setState, currentTab, setShowQuickCreator);

  useEffect(() => {
    loadInitialData();
    getCurrentTab().then(setCurrentTab);
  }, [getCurrentTab, loadInitialData]);

  // Recalculate active rules count when current tab changes
  useEffect(() => {
    if (currentTab?.url && state.rules.length > 0) {
      const activeCount = state.rules.filter((rule: HeaderRule) => {
        if (!rule.enabled) return false;
        try {
          if (!currentTab.url) return false;
          const result = matchURLPattern(currentTab.url, rule.pattern);
          return result.matches;
        } catch {
          return false;
        }
      }).length;

      setState(prev => ({
        ...prev,
        activeRulesCount: activeCount,
      }));
    }
  }, [currentTab?.url, setState, state.rules]);

  if (state.loading) {
    return (
      <div
        className={`${state.settings?.ui?.compactMode ? 'w-80 h-80' : 'w-96 h-96'} flex items-center justify-center`}
      >
        <LoadingSpinner />
      </div>
    );
  }

  const isCompact = state.settings?.ui?.compactMode || false;

  return (
    <div
      className={`${isCompact ? 'w-80 max-h-80' : 'w-96 max-h-96'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
    >
      <PopupHeader
        enabled={state.enabled}
        activeRulesCount={state.activeRulesCount}
        onOpenOptions={openOptionsPage}
        onToggleTheme={handleToggleTheme}
      />

      {state.error && (
        <div className="mx-4 mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-800 text-sm">
          {state.error}
        </div>
      )}

      <PopupContent
        state={state}
        currentTab={currentTab}
        showQuickCreator={showQuickCreator}
        showTemplateBrowser={showTemplateBrowser}
        isCompact={isCompact}
        onToggleExtension={handleToggleExtension}
        onToggleRule={handleToggleRule}
        onEditRule={handleEditRule}
        onDeleteRule={handleDeleteRule}
        onQuickRuleCreated={handleQuickRuleCreated}
        onCreateRuleForCurrentPage={() => setShowQuickCreator(true)}
        onOpenAdvancedRuleCreator={openAdvancedRuleCreator}
        onShowTemplateBrowser={() => setShowTemplateBrowser(true)}
        onCancelQuickCreator={() => setShowQuickCreator(false)}
        onCloseTemplateBrowser={() => setShowTemplateBrowser(false)}
        onProfileChange={handleProfileChange}
      />
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('popup_footer_license')}
          <br />
          {t('popup_footer_built_with')}&nbsp;
          <Icon
            name="heart"
            className="w-4 h-4 inline mx-1 text-red-500"
          />{' '}
          {t('popup_footer_developers')}
        </p>
      </div>
    </div>
  );
}

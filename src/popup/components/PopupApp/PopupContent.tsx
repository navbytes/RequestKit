import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';

import { ProfileSwitcher } from '../ProfileSwitcher';
import { QuickRuleCreator } from '../QuickRuleCreator';
import { QuickToggle } from '../QuickToggle';
import { RulesList } from '../RulesList';
import { TemplateBrowser } from '../TemplateBrowser';

interface PopupState {
  enabled: boolean;
  rules: HeaderRule[];
  activeRulesCount: number;
  loading: boolean;
  error: string | null;
  settings: ExtensionSettings | null;
  activeProfile: string;
}

interface PopupContentProps {
  state: PopupState;
  currentTab: chrome.tabs.Tab | null;
  showQuickCreator: boolean;
  showTemplateBrowser: boolean;
  isCompact: boolean;
  onToggleExtension: () => void;
  onToggleRule: (ruleId: string) => void;
  onEditRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onQuickRuleCreated: (rule: HeaderRule) => void;
  onCreateRuleForCurrentPage: () => void;
  onOpenAdvancedRuleCreator: () => void;
  onShowTemplateBrowser: () => void;
  onCancelQuickCreator: () => void;
  onCloseTemplateBrowser: () => void;
  onProfileChange: (profileId: string) => void;
}

export function PopupContent({
  state,
  currentTab,
  showQuickCreator,
  showTemplateBrowser,
  isCompact,
  onToggleExtension,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  onQuickRuleCreated,
  onCreateRuleForCurrentPage,
  onOpenAdvancedRuleCreator,
  onShowTemplateBrowser,
  onCancelQuickCreator,
  onCloseTemplateBrowser,
  onProfileChange,
}: Readonly<PopupContentProps>) {
  const { t } = useI18n();

  // Filter rules based on active profile
  const filteredRules = state.rules.filter(rule => {
    if (state.activeProfile === 'unassigned') {
      // Show rules without profileId or with empty profileId
      return !rule.profileId || rule.profileId === '';
    } else {
      // Show rules that match the active profile
      return rule.profileId === state.activeProfile;
    }
  });

  const isFirstRun = state.rules.length === 0;
  const showOnboarding =
    isFirstRun && !showQuickCreator && !showTemplateBrowser;

  return (
    <div className={`${isCompact ? 'p-3 space-y-3' : 'p-4 space-y-4'}`}>
      <QuickToggle
        enabled={state.enabled}
        onToggle={onToggleExtension}
        compact={isCompact}
      />

      {/* Profile Switcher — only meaningful once rules exist */}
      {!isFirstRun && (
        <ProfileSwitcher
          className="w-full"
          activeProfile={state.activeProfile}
          onProfileChange={onProfileChange}
        />
      )}

      {showOnboarding && (
        <div className="text-center py-4 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon
              name="zap"
              className="w-6 h-6 text-primary-600 dark:text-primary-400"
            />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t('popup_onboarding_title')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('popup_onboarding_description')}
            </p>
          </div>
          <button
            onClick={
              currentTab?.url
                ? onCreateRuleForCurrentPage
                : onOpenAdvancedRuleCreator
            }
            className="w-full btn btn-primary btn-sm"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            {t('action_create_rule')}
          </button>
          <div className="flex items-center justify-center gap-3 text-xs">
            <button
              onClick={onShowTemplateBrowser}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('template_browser_title')}
            </button>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <button
              onClick={onOpenAdvancedRuleCreator}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('popup_create_advanced_rule')}
            </button>
          </div>
        </div>
      )}

      {!isFirstRun && (
        <RulesList
          rules={filteredRules}
          currentUrl={currentTab?.url}
          onToggleRule={onToggleRule}
          onEditRule={onEditRule}
          onDeleteRule={onDeleteRule}
          compact={isCompact}
        />
      )}

      {!isFirstRun && currentTab?.url && !showQuickCreator && (
        <div className={`${isCompact ? 'space-y-1' : 'space-y-2'}`}>
          <button
            onClick={onCreateRuleForCurrentPage}
            className={`w-full ${isCompact ? 'p-2' : 'p-3'} border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group`}
          >
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">
              <Icon
                name="plus"
                className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}
              />
              <span className={`font-medium ${isCompact ? 'text-sm' : ''}`}>
                {t('popup_quick_rule')}
              </span>
            </div>
            {!isCompact && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {t('popup_quick_rule_description')}
              </p>
            )}
          </button>

          <div className={`${isCompact ? 'space-y-1' : 'space-y-2'}`}>
            <button
              onClick={onShowTemplateBrowser}
              className={`w-full btn btn-outline ${isCompact ? 'btn-xs' : 'btn-sm'}`}
            >
              <Icon
                name="file-text"
                className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`}
              />
              {t('template_browser_title')}
            </button>

            <button
              onClick={onOpenAdvancedRuleCreator}
              className={`w-full btn btn-secondary ${isCompact ? 'btn-xs' : 'btn-sm'}`}
            >
              {t('popup_create_advanced_rule')}
            </button>
          </div>
        </div>
      )}

      {currentTab?.url && showQuickCreator && (
        <QuickRuleCreator
          currentUrl={currentTab.url}
          onRuleCreated={onQuickRuleCreated}
          onCancel={onCancelQuickCreator}
        />
      )}

      {showTemplateBrowser && (
        <TemplateBrowser
          currentUrl={currentTab?.url || ''}
          onTemplateApply={onQuickRuleCreated}
          onClose={onCloseTemplateBrowser}
        />
      )}
    </div>
  );
}

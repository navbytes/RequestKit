import { TabDescription } from '@/shared/components/TabDescription';
import { DangerZone } from '@/shared/components/ui/DangerZone';
import { useI18n } from '@/shared/hooks/useI18n';
import type { ExtensionSettings } from '@/shared/types/storage';

import { DebugSettingsSection } from './components/DebugSettingsSection';
import { ExtensionStatusSection } from './components/ExtensionStatusSection';
import { NotificationsSection } from './components/NotificationsSection';
import { PerformanceSection } from './components/PerformanceSection';
import { SecuritySection } from './components/SecuritySection';
import { UISettingsSection } from './components/UISettingsSection';
import { useSettingsOperations } from './hooks/useSettingsOperations';
import { useSettingsState } from './hooks/useSettingsState';

interface GeneralSettingsProps {
  settings: ExtensionSettings;
  onSettingsUpdate: (settings: ExtensionSettings) => void;
}

export function GeneralSettings({
  settings,
  onSettingsUpdate,
}: Readonly<GeneralSettingsProps>) {
  const { t } = useI18n();
  const {
    localSettings,
    saving,
    resetting,
    updateLocalSettings,
    updateNestedSetting,
    setSaving,
    setResetting,
  } = useSettingsState(settings);

  const {
    handleSave,
    handleThemeChange,
    handleResetToDefaults,
    handleDebugSettingsChange,
  } = useSettingsOperations(onSettingsUpdate);

  const onSave = async () => {
    await handleSave(localSettings, setSaving);
  };

  const onThemeChange = async (newTheme: string) => {
    await handleThemeChange(newTheme, localSettings, updateLocalSettings);
  };

  const onResetToDefaults = async () => {
    await handleResetToDefaults(updateLocalSettings, setResetting);
  };

  return (
    <div
      className={`p-6 ${localSettings.ui.compactMode ? 'compact-mode' : ''}`}
    >
      <TabDescription
        title={t('tab_general_settings')}
        description={t('settings_general_description')}
        icon="settings"
        features={[
          t('settings_general_features_1'),
          t('settings_general_features_2'),
          t('settings_general_features_3'),
          t('settings_general_features_4'),
          t('settings_general_features_5'),
        ]}
        useCases={[
          t('settings_general_use_cases_1'),
          t('settings_general_use_cases_2'),
          t('settings_general_use_cases_3'),
          t('settings_general_use_cases_4'),
          t('settings_general_use_cases_5'),
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary ml-auto"
        >
          {saving ? t('status_saving') : t('settings_save')}
        </button>
      </div>

      <div className="space-y-8">
        <ExtensionStatusSection
          enabled={localSettings.enabled}
          onToggle={enabled => updateLocalSettings({ enabled })}
        />

        <DebugSettingsSection
          debugMode={localSettings.debugMode}
          logLevel={localSettings.logLevel}
          onDebugModeChange={debugMode => {
            const updatedSettings = { ...localSettings, debugMode };
            updateLocalSettings({ debugMode });
            handleDebugSettingsChange(updatedSettings);
          }}
          onLogLevelChange={logLevel => {
            const updatedSettings = {
              ...localSettings,
              logLevel: logLevel as 'error' | 'warn' | 'info' | 'debug',
            };
            updateLocalSettings({
              logLevel: logLevel as 'error' | 'warn' | 'info' | 'debug',
            });
            handleDebugSettingsChange(updatedSettings);
          }}
        />

        <NotificationsSection
          notifications={localSettings.notifications}
          onNotificationChange={(key, value) =>
            updateNestedSetting(`notifications.${key}`, value)
          }
        />

        <UISettingsSection
          ui={localSettings.ui}
          onThemeChange={onThemeChange}
          onUISettingChange={(key, value) =>
            updateNestedSetting(`ui.${key}`, value)
          }
        />

        {localSettings.ui.showAdvancedOptions && (
          <>
            <PerformanceSection
              performance={localSettings.performance}
              onPerformanceChange={(key, value) =>
                updateNestedSetting(`performance.${key}`, value)
              }
            />

            <SecuritySection
              security={localSettings.security}
              onSecurityChange={(key, value) =>
                updateNestedSetting(`security.${key}`, value)
              }
            />
          </>
        )}

        <DangerZone
          title={t('settings_reset_title')}
          description={t('settings_reset_description')}
          actionLabel={
            resetting ? t('status_resetting') : t('settings_reset_action')
          }
          onAction={onResetToDefaults}
          actionLoading={resetting}
        />
      </div>
    </div>
  );
}

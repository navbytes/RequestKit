import { TabDescription } from '@/shared/components/TabDescription';
import { DangerZone } from '@/shared/components/ui/DangerZone';
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
}: GeneralSettingsProps) {
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
        title="General Settings"
        description="Configure extension behavior, appearance, and performance settings. Control how RequestKit operates, customize the user interface, and adjust advanced options for optimal performance."
        icon="settings"
        features={[
          'Enable/disable extension functionality',
          'Debug mode and logging controls',
          'Notification preferences',
          'Theme and UI customization',
          'Performance optimization settings',
        ]}
        useCases={[
          'Customize extension appearance',
          'Enable debug mode for troubleshooting',
          'Configure notification preferences',
          'Optimize performance for large rule sets',
          'Set up security and validation options',
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn btn-primary ml-auto"
        >
          {saving ? 'Saving...' : 'Save Settings'}
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
          title="Reset to Defaults"
          description="Reset all extension settings, rules, templates, variables, and profiles to their default values. This action cannot be undone."
          actionLabel={resetting ? 'Resetting...' : 'Reset All Settings'}
          onAction={onResetToDefaults}
          actionLoading={resetting}
        />
      </div>
    </div>
  );
}

import { DEFAULT_SETTINGS } from '@/config/constants';
import { StorageUtils } from '@/lib/core';
import type { ExtensionSettings } from '@/shared/types/storage';
import {
  loggers,
  enableDebugLogging,
  enableSpecificDebugLogging,
  disableDebugLogging,
} from '@/shared/utils/debug';
import { ThemeManager, type Theme } from '@/shared/utils/theme';

import { resetExtensionData } from '../utils/resetExtensionData';

/**
 * Custom hook for settings operations (save, theme change, reset)
 */

// Get logger for this module
const logger = loggers.shared;

/**
 * Apply debug settings to the debug library
 */
function applyDebugSettings(settings: ExtensionSettings): void {
  if (settings.debugMode) {
    // Enable debug logging based on log level
    switch (settings.logLevel) {
      case 'error':
        enableSpecificDebugLogging(['*:error']);
        break;
      case 'warn':
        enableSpecificDebugLogging(['*:error', '*:warn']);
        break;
      case 'info':
        enableSpecificDebugLogging(['*:error', '*:warn', '*:info']);
        break;
      case 'debug':
        enableDebugLogging(); // Enable all debug logs
        break;
    }
    logger.info(`Debug logging enabled with level: ${settings.logLevel}`);
  } else {
    disableDebugLogging();
    logger.info('Debug logging disabled');
  }
}

export function useSettingsOperations(
  onSettingsUpdate: (settings: ExtensionSettings) => void
) {
  const handleSave = async (
    localSettings: ExtensionSettings,
    setSaving: (saving: boolean) => void
  ): Promise<boolean> => {
    try {
      setSaving(true);
      await StorageUtils.saveSettings(localSettings);

      // Apply debug settings immediately
      applyDebugSettings(localSettings);

      onSettingsUpdate(localSettings);
      return true;
    } catch (error) {
      logger.error('Failed to save settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDebugSettingsChange = (settings: ExtensionSettings): void => {
    // Apply debug settings immediately when they change
    applyDebugSettings(settings);
  };

  const handleThemeChange = async (
    newTheme: string,
    localSettings: ExtensionSettings,
    updateLocalSettings: (updates: Partial<ExtensionSettings>) => void
  ): Promise<void> => {
    const theme = newTheme as Theme;
    updateLocalSettings({
      ui: {
        ...localSettings.ui,
        theme: newTheme as 'light' | 'dark' | 'auto',
      },
    });

    // Apply theme immediately
    const themeManager = ThemeManager.getInstance();
    await themeManager.setTheme(theme);

    // Save settings immediately to persist theme change
    try {
      const updatedSettings = {
        ...localSettings,
        ui: {
          ...localSettings.ui,
          theme: newTheme as 'light' | 'dark' | 'auto',
        },
      };
      await StorageUtils.saveSettings(updatedSettings);
      onSettingsUpdate(updatedSettings);
    } catch (error) {
      logger.error('Failed to save theme:', error);
    }
  };

  const handleResetToDefaults = async (
    updateLocalSettings: (settings: ExtensionSettings) => void,
    setResetting: (resetting: boolean) => void
  ): Promise<void> => {
    if (
      !confirm(
        'Are you sure you want to reset all settings to defaults? This will:\n\n' +
          '• Reset all extension settings to default values\n' +
          '• Delete all custom rules\n' +
          '• Delete all custom templates\n' +
          '• Delete all variables\n' +
          '• Delete all profiles (except default)\n' +
          '• Clear all analytics and performance data\n' +
          '• Clear all statistics\n\n' +
          'This action cannot be undone!'
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      await resetExtensionData();

      updateLocalSettings(DEFAULT_SETTINGS);
      onSettingsUpdate(DEFAULT_SETTINGS);

      alert(
        'All settings have been reset to defaults. The extension will reload to apply changes.'
      );
      window.location.reload();
    } catch (error) {
      logger.error('[Reset] Failed to reset settings:', error);
      alert('Failed to reset settings. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return {
    handleSave,
    handleThemeChange,
    handleResetToDefaults,
    handleDebugSettingsChange,
  };
}

import { useState, useCallback } from 'preact/hooks';

import { StorageUtils } from '@/lib/core';
import type { ExtensionSettings } from '@/shared/types/storage';
import { loggers } from '@/shared/utils/debug';
import { ThemeManager, type Theme } from '@/shared/utils/theme';

interface SettingsState {
  settings: ExtensionSettings;
  loading: boolean;
  saving: boolean;
  error: Error | null;
}

interface SettingsActions {
  updateSettings: (updates: Partial<ExtensionSettings>) => void;
  updateNestedSetting: (path: string, value: unknown) => void;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
}

/**
 * Custom hook for managing extension settings
 */

// Get logger for this module
const logger = loggers.shared;

export function useSettings(
  initialSettings: ExtensionSettings
): SettingsState & SettingsActions {
  const [state, setState] = useState<SettingsState>({
    settings: initialSettings,
    loading: false,
    saving: false,
    error: null,
  });

  const updateSettings = useCallback((updates: Partial<ExtensionSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const updateNestedSetting = useCallback((path: string, value: unknown) => {
    setState(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev.settings));
      const keys = path.split('.');
      let current: Record<string, unknown> = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key) {
          current = current[key] as Record<string, unknown>;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }

      return {
        ...prev,
        settings: newSettings as ExtensionSettings,
      };
    });
  }, []);

  const saveSettings = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      await StorageUtils.saveSettings(state.settings);
      setState(prev => ({ ...prev, saving: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, [state.settings]);

  const loadSettings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const settings = await StorageUtils.getSettings();
      setState(prev => ({ ...prev, settings, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, []);

  const resetSettings = useCallback(async () => {
    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      await loadSettings();
      setState(prev => ({ ...prev, saving: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      throw error;
    }
  }, [loadSettings]);

  const updateTheme = useCallback(
    async (theme: Theme) => {
      updateNestedSetting('ui.theme', theme);

      try {
        const themeManager = ThemeManager.getInstance();
        await themeManager.setTheme(theme);

        // Save immediately for theme changes
        const updatedSettings = {
          ...state.settings,
          ui: { ...state.settings.ui, theme },
        };
        await StorageUtils.saveSettings(updatedSettings as ExtensionSettings);
      } catch (error) {
        logger.error('Failed to update theme:', error);
        throw error;
      }
    },
    [state.settings, updateNestedSetting]
  );

  return {
    ...state,
    updateSettings,
    updateNestedSetting,
    saveSettings,
    loadSettings,
    resetSettings,
    updateTheme,
  };
}

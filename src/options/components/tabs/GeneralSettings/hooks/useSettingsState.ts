import { useState } from 'preact/hooks';

import type { ExtensionSettings } from '@/shared/types/storage';

interface SettingsState {
  localSettings: ExtensionSettings;
  saving: boolean;
  resetting: boolean;
}

/**
 * Custom hook for managing settings state
 */
export function useSettingsState(initialSettings: ExtensionSettings) {
  const [state, setState] = useState<SettingsState>({
    localSettings: initialSettings,
    saving: false,
    resetting: false,
  });

  const updateLocalSettings = (updates: Partial<ExtensionSettings>) => {
    setState(prev => ({
      ...prev,
      localSettings: { ...prev.localSettings, ...updates },
    }));
  };

  const updateNestedSetting = (path: string, value: unknown) => {
    setState(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev.localSettings));
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
        localSettings: newSettings,
      };
    });
  };

  const setSaving = (saving: boolean) => {
    setState(prev => ({ ...prev, saving }));
  };

  const setResetting = (resetting: boolean) => {
    setState(prev => ({ ...prev, resetting }));
  };

  return {
    ...state,
    updateLocalSettings,
    updateNestedSetting,
    setSaving,
    setResetting,
  };
}

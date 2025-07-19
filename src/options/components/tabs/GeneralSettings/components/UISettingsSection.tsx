import { ButtonGroup } from '@/shared/components/forms';
import type { ExtensionSettings } from '@/shared/types/storage';

import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' as const },
  { value: 'dark', label: 'Dark', icon: 'moon' as const },
  { value: 'auto', label: 'Auto', icon: 'monitor' as const },
];

interface UISettingsSectionProps {
  ui: ExtensionSettings['ui'];
  onThemeChange: (theme: string) => void;
  onUISettingChange: (
    key: keyof ExtensionSettings['ui'],
    value: boolean
  ) => void;
}

export function UISettingsSection({
  ui,
  onThemeChange,
  onUISettingChange,
}: UISettingsSectionProps) {
  return (
    <SettingsSection title="User Interface">
      <div className="space-y-4">
        <div>
          <label htmlFor="theme-selector" className="form-label">
            Theme
          </label>
          <div id="theme-selector">
            <ButtonGroup
              options={THEME_OPTIONS}
              value={ui.theme}
              onChange={onThemeChange}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Choose your preferred color scheme
          </p>
        </div>

        <ToggleSetting
          title="Compact Mode"
          description="Use a more compact interface layout"
          checked={ui.compactMode}
          onChange={checked => onUISettingChange('compactMode', checked)}
        />

        <ToggleSetting
          title="Show Advanced Options"
          description="Display advanced configuration options"
          checked={ui.showAdvancedOptions}
          onChange={checked =>
            onUISettingChange('showAdvancedOptions', checked)
          }
        />
      </div>
    </SettingsSection>
  );
}

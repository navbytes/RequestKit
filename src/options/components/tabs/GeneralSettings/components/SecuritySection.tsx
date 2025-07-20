import type { ExtensionSettings } from '@/shared/types/storage';

import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

interface SecuritySectionProps {
  security: ExtensionSettings['security'];
  onSecurityChange: (
    key: keyof ExtensionSettings['security'],
    value: boolean
  ) => void;
}

export function SecuritySection({
  security,
  onSecurityChange,
}: Readonly<SecuritySectionProps>) {
  return (
    <SettingsSection title="Security">
      <div className="space-y-4">
        <ToggleSetting
          title="Require Confirmation"
          description="Ask for confirmation before applying potentially dangerous rules"
          checked={security.requireConfirmation}
          onChange={checked => onSecurityChange('requireConfirmation', checked)}
        />

        <ToggleSetting
          title="Allow External Import"
          description="Allow importing rules from external sources"
          checked={security.allowExternalImport}
          onChange={checked => onSecurityChange('allowExternalImport', checked)}
        />

        <ToggleSetting
          title="Validate Patterns"
          description="Validate URL patterns for security issues"
          checked={security.validatePatterns}
          onChange={checked => onSecurityChange('validatePatterns', checked)}
        />
      </div>
    </SettingsSection>
  );
}

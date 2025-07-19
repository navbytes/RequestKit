import type { ExtensionSettings } from '@/shared/types/storage';

import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

interface NotificationsSectionProps {
  notifications: ExtensionSettings['notifications'];
  onNotificationChange: (
    key: keyof ExtensionSettings['notifications'],
    value: boolean
  ) => void;
}

export function NotificationsSection({
  notifications,
  onNotificationChange,
}: NotificationsSectionProps) {
  return (
    <SettingsSection title="Notifications">
      <div className="space-y-4">
        <ToggleSetting
          title="Enable Notifications"
          description="Show browser notifications for extension events"
          checked={notifications.enabled}
          onChange={checked => onNotificationChange('enabled', checked)}
        />

        <ToggleSetting
          title="Show Rule Matches"
          description="Notify when rules are applied to requests"
          checked={notifications.showRuleMatches}
          onChange={checked => onNotificationChange('showRuleMatches', checked)}
        />

        <ToggleSetting
          title="Show Errors"
          description="Notify when errors occur"
          checked={notifications.showErrors}
          onChange={checked => onNotificationChange('showErrors', checked)}
        />
      </div>
    </SettingsSection>
  );
}

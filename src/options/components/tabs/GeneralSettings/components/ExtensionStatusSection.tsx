import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

interface ExtensionStatusSectionProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function ExtensionStatusSection({
  enabled,
  onToggle,
}: ExtensionStatusSectionProps) {
  return (
    <SettingsSection title="Extension Status">
      <ToggleSetting
        title="Enable RequestKit"
        description="Master switch for all header injection functionality"
        checked={enabled}
        onChange={onToggle}
      />
    </SettingsSection>
  );
}

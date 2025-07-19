import { Toggle } from '@/shared/components/forms';

interface ToggleSettingProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSetting({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={title}
      />
    </div>
  );
}

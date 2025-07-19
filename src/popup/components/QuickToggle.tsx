import { Toggle } from '@/shared/components/forms';
import { useI18n } from '@/shared/hooks/useI18n';

interface QuickToggleProps {
  enabled: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function QuickToggle({
  enabled,
  onToggle,
  compact = false,
}: Readonly<QuickToggleProps>) {
  const { t } = useI18n();

  return (
    <div
      className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-800 rounded-lg`}
    >
      <div>
        <h3
          className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : ''}`}
        >
          {t('ui_label_extension_status')}
        </h3>
        {!compact && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {enabled
              ? t('notifications_extension_enabled')
              : t('notifications_extension_disabled')}
          </p>
        )}
      </div>

      <Toggle
        checked={enabled}
        onChange={onToggle}
        size={compact ? 'sm' : 'md'}
        aria-label={
          enabled
            ? t('ui_aria_disable_extension')
            : t('ui_aria_enable_extension')
        }
      />
    </div>
  );
}

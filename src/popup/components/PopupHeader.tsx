import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';

interface PopupHeaderProps {
  enabled: boolean;
  activeRulesCount: number;
  onOpenOptions: () => void;
  onToggleTheme?: () => void;
}

export function PopupHeader({
  enabled,
  activeRulesCount,
  onOpenOptions,
  onToggleTheme,
}: Readonly<PopupHeaderProps>) {
  const { t } = useI18n();

  return (
    <div className="bg-primary-600 text-white p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1">
            <img
              src="/assets/icons/icon-white-48.png"
              alt="RequestKit"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-semibold text-lg">{t('extensionName')}</h1>
            <p className="text-primary-100 text-xs">
              {enabled
                ? `${activeRulesCount} ${t('ui_label_rules_active')}`
                : t('ui_label_extension_disabled')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
              title={t('popup_toggle_theme')}
            >
              <Icon name="moon" className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onOpenOptions}
            className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
            title={t('ui_tooltip_open_options')}
          >
            <Icon name="settings" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

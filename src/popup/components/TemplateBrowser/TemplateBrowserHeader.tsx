import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';

interface TemplateBrowserHeaderProps {
  readonly onClose: () => void;
}

export function TemplateBrowserHeader({ onClose }: TemplateBrowserHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('template_browser_title')}
      </h2>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <Icon name="close" className="w-5 h-5" />
      </button>
    </div>
  );
}

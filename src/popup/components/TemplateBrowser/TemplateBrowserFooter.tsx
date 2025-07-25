import { useI18n } from '@/shared/hooks/useI18n';

interface TemplateBrowserFooterProps {
  currentUrl: string;
}

export function TemplateBrowserFooter({
  currentUrl,
}: Readonly<TemplateBrowserFooterProps>) {
  const { t } = useI18n();

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return t('common_unknown');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {t('popup_templates_will_be_applied')}{' '}
        <span className="font-medium">{getDomainFromUrl(currentUrl)}</span>
      </div>
    </div>
  );
}

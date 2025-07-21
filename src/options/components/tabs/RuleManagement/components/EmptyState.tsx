import { Icon } from '@/shared/components/Icon';
import { useI18n } from '@/shared/hooks/useI18n';

interface EmptyStateProps {
  onCreateRule: () => void;
}

export function EmptyState({ onCreateRule }: Readonly<EmptyStateProps>) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center py-12">
      <Icon name="file-text" size={60} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {t('rules_empty_state_title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {t('rules_empty_state_description')}
      </p>
      <button onClick={onCreateRule} className="btn btn-primary">
        {t('action_create_first')}
      </button>
    </div>
  );
}

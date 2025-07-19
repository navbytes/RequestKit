import { Icon } from '@/shared/components/Icon';

interface EmptyStateProps {
  onCreateRule: () => void;
}

export function EmptyState({ onCreateRule }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12">
      <Icon name="file-text" size={60} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No rules created yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Create your first rule to start modifying headers
      </p>
      <button onClick={onCreateRule} className="btn btn-primary">
        Create Your First Rule
      </button>
    </div>
  );
}

import { Icon } from '@/shared/components/Icon';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Icon name="bar-chart" size={48} className="text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Analytics Data Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Analytics data will appear here once your rules start processing web
        requests. Browse websites that match your rule patterns to see real
        analytics data.
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>• Make sure your extension is enabled</p>
        <p>• Visit websites that match your rule patterns</p>
        <p>• Check that your rules are active and properly configured</p>
      </div>
    </div>
  );
}

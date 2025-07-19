import type { UsageAnalytics } from '@/lib/integrations/analytics-monitor';

interface UserActivityCardProps {
  readonly userBehavior: UsageAnalytics['userBehavior'];
}

export function UserActivityCard({ userBehavior }: UserActivityCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        User Activity
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Rules Created
          </span>
          <span className="font-medium">{userBehavior.rulesCreated}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Rules Modified
          </span>
          <span className="font-medium">{userBehavior.rulesModified}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Templates Used
          </span>
          <span className="font-medium">{userBehavior.templatesUsed}</span>
        </div>
      </div>
    </div>
  );
}

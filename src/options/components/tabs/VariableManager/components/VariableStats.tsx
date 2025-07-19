import { Icon } from '@/shared/components/Icon';
import { Card } from '@/shared/components/ui';

interface VariableStatsProps {
  stats: {
    globalCount: number;
    profileCount: number;
    ruleCount: number;
    totalCount: number;
    profilesWithVariables: string[];
  };
}

export function VariableStats({ stats }: Readonly<VariableStatsProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="globe" className="text-blue-500" size={24} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Global Variables
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.globalCount}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="users" className="text-green-500" size={24} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Profile Variables
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.profileCount}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="target" className="text-orange-500" size={24} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rule Variables
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.ruleCount}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="sparkles" className="text-purple-500" size={24} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Variables
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCount}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

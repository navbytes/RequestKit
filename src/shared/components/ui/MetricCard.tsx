import { FunctionComponent } from 'preact';

import { Icon, IconName } from '../Icon';

import { Card } from './Card';

interface MetricCardProps {
  iconName?: IconName;
  title: string;
  value?: string;
  subtitle?: string;
}

export const MetricCard: FunctionComponent<MetricCardProps> = ({
  iconName,
  title,
  value,
  subtitle,
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        {iconName && (
          <Icon name={iconName} className="text-blue-500" size={24} />
        )}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {value && (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

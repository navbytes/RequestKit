import type { ComponentChildren } from 'preact';

import { Icon, type IconName } from '@/shared/components/Icon';

import { Button } from './Button';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ComponentChildren;
  className?: string;
}

export function EmptyState({
  icon = 'file-text',
  title,
  description,
  actionLabel,
  onAction,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <Icon name={icon} className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      )}
      {children && <div className="mb-4">{children}</div>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

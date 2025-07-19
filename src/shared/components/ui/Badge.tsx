import type { ComponentChildren } from 'preact';

import { Icon, type IconName } from '@/shared/components/Icon';

interface BadgeProps {
  children: ComponentChildren;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline';
  size?: 'xs' | 'sm' | 'md';
  icon?: IconName;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  icon,
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    primary:
      'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success:
      'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    warning:
      'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
    error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
    outline:
      'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
  };

  const iconSizeClasses = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && (
        <Icon
          name={icon}
          className={`${iconSizeClasses[size]} ${children ? 'mr-1' : ''}`}
        />
      )}
      {children}
    </span>
  );
}

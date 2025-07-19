import type { ComponentChildren } from 'preact';

import { Icon, type IconName } from '@/shared/components/Icon';

interface AlertProps {
  children: ComponentChildren;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: IconName;
  className?: string;
  onClose?: () => void;
}

export function Alert({
  children,
  variant = 'info',
  title,
  icon,
  className = '',
  onClose,
}: AlertProps) {
  const baseClasses = 'rounded-lg p-4 border';

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    success:
      'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-200',
    warning:
      'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-200',
    error:
      'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-200',
  };

  const defaultIcons: Record<string, IconName> = {
    info: 'info',
    success: 'check-circle',
    warning: 'warning',
    error: 'alert-circle',
  };

  const alertIcon = icon || defaultIcons[variant];

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {alertIcon && <Icon name={alertIcon} className="w-5 h-5" />}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className={`text-sm ${title ? '' : 'mt-0'}`}>{children}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

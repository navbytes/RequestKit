import type { ComponentChildren } from 'preact';

interface CardProps {
  children: ComponentChildren;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: Readonly<CardProps>) {
  const baseClasses = 'rounded-lg border transition-colors';

  const variantClasses = {
    default: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
    primary:
      'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20',
    success:
      'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20',
    warning:
      'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20',
    error:
      'border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

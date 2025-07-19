import type { ComponentChildren } from 'preact';

import { Icon, type IconName } from '@/shared/components/Icon';

interface ButtonProps {
  children: ComponentChildren;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  className?: string;
  loading?: boolean;
}

export function Button({
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  loading = false,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 focus:ring-gray-500',
    success:
      'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    warning:
      'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    ghost:
      'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:ring-gray-500',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <div
          className={`${iconSizeClasses[size]} mr-2 border-2 border-current border-t-transparent rounded-full animate-spin`}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          className={`${iconSizeClasses[size]} ${children ? 'mr-2' : ''}`}
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          className={`${iconSizeClasses[size]} ${children ? 'ml-2' : ''}`}
        />
      )}
    </button>
  );
}

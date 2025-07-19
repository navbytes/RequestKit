import { Icon, type IconName } from '@/shared/components/Icon';

interface ButtonGroupOption {
  value: string;
  label: string;
  icon?: IconName;
  color?: string;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonGroup({
  options,
  value,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}: ButtonGroupProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden ${className}`}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={`
            flex-1 font-medium transition-colors flex items-center justify-center space-x-2
            ${sizeClasses[size]}
            ${
              value === option.value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            ${index > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {option.icon && (
            <Icon
              name={option.icon}
              className={`${iconSizeClasses[size]} ${option.color || ''}`}
            />
          )}
          <span className={value === option.value ? '' : option.color || ''}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}

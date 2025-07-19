interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: Readonly<ToggleProps>) {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5',
    lg: 'w-12 h-6',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${sizeClasses[size]}
        ${
          checked
            ? 'bg-primary-600 hover:bg-primary-700'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out
          ${thumbSizeClasses[size]}
          ${
            checked
              ? size === 'sm'
                ? 'translate-x-4'
                : size === 'md'
                  ? 'translate-x-5'
                  : 'translate-x-6'
              : 'translate-x-0.5'
          }
        `}
      />
    </button>
  );
}

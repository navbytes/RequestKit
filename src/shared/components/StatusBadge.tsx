interface StatusBadgeProps {
  status: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getStatusColorClasses(status: number): string {
  if (status >= 200 && status < 300) {
    return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
  }
  if (status >= 300 && status < 400) {
    return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
  }
  if (status >= 400 && status < 500) {
    return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200';
  }
  if (status >= 500 && status < 600) {
    return 'bg-error-200 text-error-900 dark:bg-error-950 dark:text-error-300';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export function StatusBadge({
  status,
  className = '',
  size = 'md',
}: Readonly<StatusBadgeProps>) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const colorClasses = getStatusColorClasses(status);

  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-semibold rounded-full ${colorClasses} ${sizeClasses[size]} ${className}`}
    >
      {status}
    </span>
  );
}

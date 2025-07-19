import { ComponentChildren } from 'preact';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  warning?: string;
  help?: string;
  children: ComponentChildren;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  warning,
  help,
  children,
  className = '',
}: Readonly<FormFieldProps>) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {warning && !error && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{warning}</span>
        </p>
      )}

      {help && !error && !warning && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{help}</p>
      )}
    </div>
  );
}

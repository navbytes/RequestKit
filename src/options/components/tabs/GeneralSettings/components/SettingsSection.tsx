interface SettingsSectionProps {
  title: string;
  children: preact.ComponentChildren;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

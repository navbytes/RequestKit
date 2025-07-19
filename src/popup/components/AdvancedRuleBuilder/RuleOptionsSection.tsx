interface RuleOptionsSectionProps {
  enabled: boolean;
  onUpdate: (updates: { enabled: boolean }) => void;
}

export function RuleOptionsSection({
  enabled,
  onUpdate,
}: RuleOptionsSectionProps) {
  return (
    <div className="flex items-center space-x-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e =>
            onUpdate({ enabled: (e.target as HTMLInputElement).checked })
          }
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Enable rule immediately
        </span>
      </label>
    </div>
  );
}

import { Toggle } from '@/shared/components/forms';

interface QuickToggleProps {
  enabled: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function QuickToggle({
  enabled,
  onToggle,
  compact = false,
}: QuickToggleProps) {
  return (
    <div
      className={`flex items-center justify-between ${compact ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-800 rounded-lg`}
    >
      <div>
        <h3
          className={`font-medium text-gray-900 dark:text-white ${compact ? 'text-sm' : ''}`}
        >
          Extension Status
        </h3>
        {!compact && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {enabled ? 'RequestKit is active' : 'RequestKit is disabled'}
          </p>
        )}
      </div>

      <Toggle
        checked={enabled}
        onChange={onToggle}
        size={compact ? 'sm' : 'md'}
        aria-label={enabled ? 'Disable extension' : 'Enable extension'}
      />
    </div>
  );
}

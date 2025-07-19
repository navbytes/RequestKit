import type { ExtensionSettings } from '@/shared/types/storage';

import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

interface PerformanceSectionProps {
  performance: ExtensionSettings['performance'];
  onPerformanceChange: (
    key: keyof ExtensionSettings['performance'],
    value: number | boolean
  ) => void;
}

export function PerformanceSection({
  performance,
  onPerformanceChange,
}: PerformanceSectionProps) {
  return (
    <SettingsSection title="Performance">
      <div className="space-y-4">
        <div>
          <label htmlFor="max-rules" className="form-label">
            Maximum Rules
          </label>
          <input
            id="max-rules"
            type="number"
            className="input"
            value={performance.maxRules}
            onInput={e =>
              onPerformanceChange(
                'maxRules',
                parseInt(e.currentTarget.value) || 100
              )
            }
            min="1"
            max="1000"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Maximum number of rules that can be active simultaneously
          </p>
        </div>

        <div>
          <label htmlFor="cache-timeout" className="form-label">
            Cache Timeout (seconds)
          </label>
          <input
            id="cache-timeout"
            type="number"
            className="input"
            value={performance.cacheTimeout}
            onInput={e =>
              onPerformanceChange(
                'cacheTimeout',
                parseInt(e.currentTarget.value) || 300
              )
            }
            min="60"
            max="3600"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            How long to cache rule matching results
          </p>
        </div>

        <ToggleSetting
          title="Enable Metrics"
          description="Collect performance metrics and statistics"
          checked={performance.enableMetrics}
          onChange={checked => onPerformanceChange('enableMetrics', checked)}
        />
      </div>
    </SettingsSection>
  );
}

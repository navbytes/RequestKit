import { SettingsSection } from './SettingsSection';
import { ToggleSetting } from './ToggleSetting';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Array<{
  value: LogLevel;
  label: string;
  color: string;
}> = [
  {
    value: 'error',
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
  },
  {
    value: 'warn',
    label: 'Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    value: 'info',
    label: 'Info',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'debug',
    label: 'Debug',
    color: 'text-gray-600 dark:text-gray-400',
  },
];

interface DebugSettingsSectionProps {
  debugMode: boolean;
  logLevel: string;
  onDebugModeChange: (enabled: boolean) => void;
  onLogLevelChange: (level: string) => void;
}

export function DebugSettingsSection({
  debugMode,
  logLevel,
  onDebugModeChange,
  onLogLevelChange,
}: Readonly<DebugSettingsSectionProps>) {
  return (
    <SettingsSection title="Debug & Logging">
      <div className="space-y-4">
        <ToggleSetting
          title="Debug Mode"
          description="Enable detailed logging and debugging information"
          checked={debugMode}
          onChange={onDebugModeChange}
        />

        <div>
          <label htmlFor="log-level-buttons" className="form-label">
            Log Level
          </label>
          <div
            id="log-level-buttons"
            className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
          >
            {LOG_LEVELS.map((level, index) => (
              <button
                key={level.value}
                onClick={() => onLogLevelChange(level.value)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  logLevel === level.value
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${index > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}`}
              >
                <span className={logLevel === level.value ? '' : level.color}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

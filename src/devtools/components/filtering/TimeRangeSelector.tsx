/**
 * Time Range Selector for RequestKit DevTools
 * Date/time picker for temporal filtering
 */

import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';

interface TimeRange {
  start: Date;
  end: Date;
}

interface TimeRangeSelectorProps {
  value?: TimeRange | undefined;
  onChange: (timeRange: TimeRange | undefined) => void;
  className?: string;
}

const QUICK_RANGES = [
  { label: 'Last 5 minutes', minutes: 5 },
  { label: 'Last 15 minutes', minutes: 15 },
  { label: 'Last 30 minutes', minutes: 30 },
  { label: 'Last hour', minutes: 60 },
  { label: 'Last 2 hours', minutes: 120 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 24 hours', minutes: 1440 },
];

export function TimeRangeSelector({
  value,
  onChange,
  className = '',
}: TimeRangeSelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  };

  const parseDateTime = (dateTimeString: string): Date => {
    return new Date(dateTimeString);
  };

  const handleQuickRange = (minutes: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - minutes * 60 * 1000);
    onChange({ start, end });
    setIsCustomMode(false);
  };

  const handleStartChange = (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const startDate = parseDateTime(target.value);
    if (value) {
      onChange({ start: startDate, end: value.end });
    } else {
      const endDate = new Date();
      onChange({ start: startDate, end: endDate });
    }
  };

  const handleEndChange = (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;
    const endDate = parseDateTime(target.value);
    if (value) {
      onChange({ start: value.start, end: endDate });
    } else {
      const startDate = new Date(endDate.getTime() - 60 * 60 * 1000); // 1 hour before
      onChange({ start: startDate, end: endDate });
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setIsCustomMode(false);
  };

  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode);
    if (!isCustomMode && !value) {
      // Set default range when entering custom mode
      const end = new Date();
      const start = new Date(end.getTime() - 60 * 60 * 1000); // 1 hour ago
      onChange({ start, end });
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quick Range Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="time-range-quick"
            className="text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            Quick Ranges
          </label>
          {value && (
            <button
              onClick={handleClear}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>

        <div id="time-range-quick" className="flex flex-wrap gap-2">
          {QUICK_RANGES.map(range => (
            <button
              key={range.minutes}
              onClick={() => handleQuickRange(range.minutes)}
              className="px-3 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Toggle */}
      <div>
        <button
          onClick={toggleCustomMode}
          className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Icon
            name={isCustomMode ? 'chevron-down' : 'chevron-down'}
            className={`w-4 h-4 transition-transform ${isCustomMode ? 'rotate-180' : ''}`}
          />
          <span>Custom Range</span>
        </button>
      </div>

      {/* Custom Range Inputs */}
      {isCustomMode && (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="time-range-start"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Start Time
              </label>
              <input
                id="time-range-start"
                type="datetime-local"
                value={value ? formatDateTime(value.start) : ''}
                onChange={handleStartChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="time-range-end"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                End Time
              </label>
              <input
                id="time-range-end"
                type="datetime-local"
                value={value ? formatDateTime(value.end) : ''}
                onChange={handleEndChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Range Validation */}
          {value && value.start >= value.end && (
            <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
              <Icon name="alert-circle" className="w-3 h-3" />
              <span>Start time must be before end time</span>
            </div>
          )}

          {/* Range Summary */}
          {value && value.start < value.end && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Duration:{' '}
              {Math.round(
                (value.end.getTime() - value.start.getTime()) / (1000 * 60)
              )}{' '}
              minutes
            </div>
          )}
        </div>
      )}

      {/* Current Range Display */}
      {value && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
            Active Time Range
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div>From: {value.start.toLocaleString()}</div>
            <div>To: {value.end.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

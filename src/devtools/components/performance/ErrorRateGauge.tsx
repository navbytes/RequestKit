// Error rate gauge component
import { useMemo } from 'preact/hooks';

interface ErrorRateGaugeProps {
  value: number; // Error rate as percentage (0-100)
  size?: number;
  className?: string;
}

export function ErrorRateGauge({
  value,
  size = 120,
  className = '',
}: Readonly<ErrorRateGaugeProps>) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));

  // Calculate gauge properties
  const gaugeData = useMemo(() => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset =
      circumference - (clampedValue / 100) * circumference;

    // Determine color based on error rate
    let color = '#10b981'; // green
    let bgColor = '#dcfce7'; // light green
    let severity = 'Good';

    if (clampedValue > 5) {
      color = '#f59e0b'; // yellow
      bgColor = '#fef3c7'; // light yellow
      severity = 'Warning';
    }

    if (clampedValue > 15) {
      color = '#ef4444'; // red
      bgColor = '#fee2e2'; // light red
      severity = 'Critical';
    }

    return {
      radius,
      circumference,
      strokeDasharray,
      strokeDashoffset,
      color,
      bgColor,
      severity,
    };
  }, [clampedValue, size]);

  const center = size / 2;
  const strokeWidth = 8;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Gauge */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={gaugeData.radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-600"
          />

          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={gaugeData.radius}
            fill="none"
            stroke={gaugeData.color}
            strokeWidth={strokeWidth}
            strokeDasharray={gaugeData.strokeDasharray}
            strokeDashoffset={gaugeData.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-2xl font-bold"
            style={{ color: gaugeData.color }}
          >
            {clampedValue.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Error Rate
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: gaugeData.color }}
          >
            {gaugeData.severity}
          </div>
        </div>
      </div>

      {/* Gauge scale */}
      <div className="mt-4 w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>0%</span>
          <span>5%</span>
          <span>15%</span>
          <span>25%</span>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Scale segments */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-green-500"></div>
            <div className="flex-1 bg-yellow-500"></div>
            <div className="flex-1 bg-red-500"></div>
            <div className="flex-1 bg-red-600"></div>
          </div>

          {/* Current value indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-gray-800 dark:bg-white"
            style={{ left: `${Math.min(clampedValue * 4, 100)}%` }}
          />
        </div>
      </div>

      {/* Error rate interpretation */}
      <div className="mt-3 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {clampedValue === 0 && 'No errors detected'}
          {clampedValue > 0 && clampedValue <= 1 && 'Very low error rate'}
          {clampedValue > 1 && clampedValue <= 5 && 'Acceptable error rate'}
          {clampedValue > 5 &&
            clampedValue <= 15 &&
            'Elevated error rate - monitor closely'}
          {clampedValue > 15 && 'High error rate - requires attention'}
        </div>
      </div>

      {/* Threshold indicators */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <div className="text-gray-500 dark:text-gray-400">Good</div>
          <div className="text-gray-400 dark:text-gray-500">≤ 5%</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
          <div className="text-gray-500 dark:text-gray-400">Warning</div>
          <div className="text-gray-400 dark:text-gray-500">5-15%</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
          <div className="text-gray-500 dark:text-gray-400">Critical</div>
          <div className="text-gray-400 dark:text-gray-500">&gt; 15%</div>
        </div>
      </div>
    </div>
  );
}

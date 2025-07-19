// Memory usage chart component
import { useMemo } from 'preact/hooks';

import type { PerformanceTimeSeriesData } from '../../types/performance';

interface MemoryUsageChartProps {
  data: PerformanceTimeSeriesData[];
  height?: number;
  className?: string;
}

export function MemoryUsageChart({
  data,
  height = 200,
  className = '',
}: MemoryUsageChartProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], values: [], maxValue: 100 };
    }

    const labels = data.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    const values = data.map(point => point.memoryUsage || 0);
    const maxValue = Math.max(...values, 100); // Minimum scale of 100%

    return { labels, values, maxValue };
  }, [data]);

  // Generate SVG path for the area chart
  const generateAreaPath = (
    values: number[],
    maxValue: number,
    width: number,
    height: number
  ) => {
    if (values.length === 0) return '';

    const stepX = width / (values.length - 1 || 1);
    const scaleY = height / maxValue;

    let path = `M 0 ${height}`;
    values.forEach((value, index) => {
      const x = index * stepX;
      const y = height - value * scaleY;
      path += ` L ${x} ${y}`;
    });
    path += ` L ${width} ${height} Z`;

    return path;
  };

  // Generate line path
  const generateLinePath = (
    values: number[],
    maxValue: number,
    width: number,
    height: number
  ) => {
    if (values.length === 0) return '';

    const stepX = width / (values.length - 1 || 1);
    const scaleY = height / maxValue;

    let path = '';
    values.forEach((value, index) => {
      const x = index * stepX;
      const y = height - value * scaleY;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  // Get color based on memory usage level
  const getMemoryColor = (percentage: number) => {
    if (percentage < 50) return { stroke: '#10b981', fill: '#10b981' }; // green
    if (percentage < 75) return { stroke: '#f59e0b', fill: '#f59e0b' }; // yellow
    return { stroke: '#ef4444', fill: '#ef4444' }; // red
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-sm">No memory usage data available</div>
          <div className="text-xs mt-1">Memory monitoring will appear here</div>
        </div>
      </div>
    );
  }

  const chartWidth = 400;
  const chartHeight = height - 60;
  const currentMemory = chartData.values[chartData.values.length - 1] || 0;
  const memoryColor = getMemoryColor(currentMemory);
  const linePath = generateLinePath(
    chartData.values,
    chartData.maxValue,
    chartWidth,
    chartHeight
  );
  const areaPath = generateAreaPath(
    chartData.values,
    chartData.maxValue,
    chartWidth,
    chartHeight
  );

  return (
    <div className={`${className}`} style={{ height }}>
      <div className="relative">
        {/* Chart SVG */}
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth + 60} ${height}`}
          className="overflow-visible"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient
              id="memoryGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={memoryColor.fill}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={memoryColor.fill}
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>

          {/* Grid lines and labels */}
          <g className="text-xs text-gray-400 dark:text-gray-500">
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map(percentage => {
              const y = 30 + (chartHeight * (100 - percentage)) / 100;
              return (
                <g key={percentage}>
                  <line
                    x1="50"
                    y1={y}
                    x2={chartWidth + 50}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeDasharray="2,2"
                  />
                  <text
                    x="45"
                    y={y + 3}
                    textAnchor="end"
                    className="fill-current"
                  >
                    {percentage}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* Chart area */}
          <g transform="translate(50, 30)">
            {/* Area fill */}
            <path d={areaPath} fill="url(#memoryGradient)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={memoryColor.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.values.map((value, index) => {
              const x =
                index * (chartWidth / (chartData.values.length - 1 || 1));
              const y =
                chartHeight - (value * chartHeight) / chartData.maxValue;

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={memoryColor.stroke}
                  className="hover:r-3 transition-all duration-200"
                >
                  <title>{`${chartData.labels[index]}: ${value.toFixed(1)}%`}</title>
                </circle>
              );
            })}
          </g>

          {/* X-axis labels */}
          <g className="text-xs text-gray-400 dark:text-gray-500">
            {chartData.labels.map((label, index) => {
              // Show only every nth label to avoid crowding
              const showLabel =
                chartData.labels.length <= 10 ||
                index % Math.ceil(chartData.labels.length / 8) === 0;
              if (!showLabel) return null;

              const x =
                50 + index * (chartWidth / (chartData.labels.length - 1 || 1));
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-current"
                >
                  {label}
                </text>
              );
            })}
          </g>
        </svg>

        {/* Current memory usage indicator */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: memoryColor.stroke }}
            >
              {currentMemory.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Current Usage
            </div>
          </div>
        </div>

        {/* Memory usage status */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: memoryColor.stroke }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {currentMemory < 50
              ? 'Normal'
              : currentMemory < 75
                ? 'Moderate'
                : 'High'}{' '}
            Usage
          </span>
        </div>
      </div>

      {/* Memory statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.max(...chartData.values).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Peak</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {(
              chartData.values.reduce((a, b) => a + b, 0) /
                chartData.values.length || 0
            ).toFixed(1)}
            %
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Average
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.min(...chartData.values).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Minimum
          </div>
        </div>
      </div>
    </div>
  );
}

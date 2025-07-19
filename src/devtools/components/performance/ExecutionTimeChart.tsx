// Execution time chart component
import { useMemo } from 'preact/hooks';

import type { PerformanceTimeSeriesData } from '../../types/performance';

interface ExecutionTimeChartProps {
  data: PerformanceTimeSeriesData[];
  height?: number;
  className?: string;
}

export function ExecutionTimeChart({
  data,
  height = 200,
  className = '',
}: Readonly<ExecutionTimeChartProps>) {
  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], values: [], maxValue: 0 };
    }

    const labels = data.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    const values = data.map(point => point.executionTime);
    const maxValue = Math.max(...values, 10); // Minimum scale of 10ms

    return { labels, values, maxValue };
  }, [data]);

  // Generate SVG path for the line chart
  const generatePath = (
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

  // Generate area path for gradient fill
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

  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-sm">No execution time data available</div>
          <div className="text-xs mt-1">
            Start monitoring to see performance trends
          </div>
        </div>
      </div>
    );
  }

  const chartWidth = 400;
  const chartHeight = height - 60; // Leave space for labels
  const linePath = generatePath(
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
              id="executionTimeGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="text-xs text-gray-400 dark:text-gray-500">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = 30 + chartHeight * ratio;
              const value = chartData.maxValue * (1 - ratio);
              return (
                <g key={ratio}>
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
                    {value.toFixed(1)}ms
                  </text>
                </g>
              );
            })}
          </g>

          {/* Chart area */}
          <g transform="translate(50, 30)">
            {/* Area fill */}
            <path d={areaPath} fill="url(#executionTimeGradient)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
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
                  r="3"
                  fill="#3b82f6"
                  className="hover:r-4 transition-all duration-200"
                >
                  <title>{`${chartData.labels[index]}: ${value.toFixed(2)}ms`}</title>
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

        {/* Chart statistics */}
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
          <div className="text-xs space-y-1">
            <div className="flex justify-between space-x-4">
              <span className="text-gray-500 dark:text-gray-400">Avg:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(
                  chartData.values.reduce((a, b) => a + b, 0) /
                    chartData.values.length || 0
                ).toFixed(2)}
                ms
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-500 dark:text-gray-400">Max:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.max(...chartData.values).toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-500 dark:text-gray-400">Min:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.min(...chartData.values).toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

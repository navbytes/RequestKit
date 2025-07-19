// Utility Functions for Performance Optimization
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
    case 'low':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getPerformanceColor = (
  value: number,
  thresholds: { good: number; warning: number }
) => {
  if (value <= thresholds.good) return 'text-green-600 dark:text-green-400';
  if (value <= thresholds.warning)
    return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getPerformanceStatus = (
  value: number,
  thresholds: { good: number; warning: number },
  labels: { good: string; warning: string; poor: string }
) => {
  if (value <= thresholds.good) return labels.good;
  if (value <= thresholds.warning) return labels.warning;
  return labels.poor;
};

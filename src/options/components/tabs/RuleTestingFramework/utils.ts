// Utility Functions for Rule Testing Framework
export const getConflictSeverityColor = (severity: number) => {
  switch (severity) {
    case 1:
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
    case 2:
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900 dark:text-orange-300';
    case 3:
      return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getPerformanceImpactColor = (impact: string) => {
  switch (impact) {
    case 'low':
      return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high':
      return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300';
  }
};

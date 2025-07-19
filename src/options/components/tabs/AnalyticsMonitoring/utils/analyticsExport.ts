import { AnalyticsMonitor } from '@/lib/integrations';

/**
 * Export analytics data to JSON file
 */
export const exportAnalytics = (): void => {
  const analyticsMonitor = AnalyticsMonitor.getInstance();
  const data = analyticsMonitor.exportAnalytics();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `requestkit-analytics-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Clear all analytics data with confirmation
 */
export const clearAnalytics = async (onSuccess: () => void): Promise<void> => {
  if (
    confirm(
      'Are you sure you want to clear all analytics data? This action cannot be undone.'
    )
  ) {
    const analyticsMonitor = AnalyticsMonitor.getInstance();
    await analyticsMonitor.clearAnalytics();
    onSuccess();
  }
};

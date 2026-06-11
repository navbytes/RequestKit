import type { OptimizationSuggestion } from '@/lib/integrations/analytics-monitor';
import { TabDescription } from '@/shared/components/TabDescription';

import { EmptyState } from './components/EmptyState';
import { HeaderActions } from './components/HeaderActions';
import { LoadingState } from './components/LoadingState';
import { OverviewTab } from './components/OverviewTab';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { exportAnalytics, clearAnalytics } from './utils/analyticsExport';

interface AnalyticsMonitoringProps {
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void;
}

export function AnalyticsMonitoring(_props: AnalyticsMonitoringProps) {
  const { analytics, suggestions, isLoading, loadAnalyticsData } =
    useAnalyticsData();

  const handleExport = () => exportAnalytics();
  const handleClear = () => clearAnalytics(loadAnalyticsData);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!analytics) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <TabDescription
        title="Analytics & Monitoring"
        description="Local-only insights into rule usage, performance metrics, and optimization opportunities. All data stays on this device — nothing is ever transmitted anywhere. Track how your rules perform, identify patterns, and get suggestions for improvements."
        icon="bar-chart"
        features={[
          '100% local — data never leaves your device',
          'Rule effectiveness tracking and success rates',
          'Error monitoring and debugging insights',
          'Optimization suggestions',
          'Data export and historical analysis',
        ]}
        useCases={[
          'Monitor rule performance and identify bottlenecks',
          'Analyze error rates and troubleshoot issues',
          'Get automated suggestions for rule improvements',
        ]}
      />

      <HeaderActions onExport={handleExport} onClear={handleClear} />

      <div className="mt-6">
        <OverviewTab analytics={analytics} suggestions={suggestions} />
      </div>
    </div>
  );
}

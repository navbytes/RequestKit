import { useState } from 'preact/hooks';

import type { OptimizationSuggestion } from '@/lib/integrations/analytics-monitor';
import { TabDescription } from '@/shared/components/TabDescription';

import { EmptyState } from './components/EmptyState';
import { HeaderActions } from './components/HeaderActions';
import { LoadingState } from './components/LoadingState';
import { OverviewTab } from './components/OverviewTab';
import { TabNavigation, type TabId } from './components/TabNavigation';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { exportAnalytics, clearAnalytics } from './utils/analyticsExport';

interface AnalyticsMonitoringProps {
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void;
}

export function AnalyticsMonitoring(_props: AnalyticsMonitoringProps) {
  const { analytics, suggestions, isLoading, loadAnalyticsData } =
    useAnalyticsData();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

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
        description="Comprehensive insights into rule usage, performance metrics, and optimization opportunities. Track how your rules perform, identify patterns, and get intelligent suggestions for improvements."
        icon="bar-chart"
        features={[
          'Real-time usage analytics and performance metrics',
          'Rule effectiveness tracking and success rates',
          'Error monitoring and debugging insights',
          'Intelligent optimization suggestions',
          'Data export and historical analysis',
        ]}
        useCases={[
          'Monitor rule performance and identify bottlenecks',
          'Track user behavior and extension usage patterns',
          'Analyze error rates and troubleshoot issues',
          'Get automated suggestions for rule improvements',
        ]}
      />

      <HeaderActions onExport={handleExport} onClear={handleClear} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab analytics={analytics} suggestions={suggestions} />
        )}
        {/* Other tab content would be rendered here based on activeTab */}
        {activeTab !== 'overview' && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab
              content coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

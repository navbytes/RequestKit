import type {
  UsageAnalytics,
  OptimizationSuggestion,
} from '@/lib/integrations/analytics-monitor';
import { MetricCard } from '@/shared/components/ui';

import { formatDuration, formatBytes } from '../utils/analyticsFormatting';

import { PerformanceSummaryCard } from './PerformanceSummaryCard';
import { TopSuggestionsCard } from './TopSuggestionsCard';
import { UserActivityCard } from './UserActivityCard';

interface OverviewTabProps {
  analytics: UsageAnalytics;
  suggestions: OptimizationSuggestion[];
}

export function OverviewTab({
  analytics,
  suggestions,
}: Readonly<OverviewTabProps>) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          iconName="layers"
          title="Total Rules"
          value={analytics.totalRules.toString()}
          subtitle={`${analytics.activeRules} active`}
        />
        <MetricCard
          iconName="activity"
          title="Requests Processed"
          value={analytics.totalRequests.toString()}
          subtitle={`${analytics.modifiedRequests} modified`}
        />
        <MetricCard
          iconName="clock"
          title="Session Duration"
          value={formatDuration(analytics.userBehavior.sessionDuration)}
          subtitle="Current session"
        />
        <MetricCard
          iconName="hardDrive"
          title="Memory Usage"
          value={formatBytes(analytics.performanceMetrics.memoryUsage)}
          subtitle="Current usage"
        />
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceSummaryCard metrics={analytics.performanceMetrics} />
        <UserActivityCard userBehavior={analytics.userBehavior} />
      </div>

      {/* Top Suggestions */}
      {suggestions.length > 0 && (
        <TopSuggestionsCard suggestions={suggestions.slice(0, 3)} />
      )}
    </div>
  );
}

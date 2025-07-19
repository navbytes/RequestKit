import type { UsageAnalytics } from '@/lib/integrations/analytics-monitor';

interface PerformanceSummaryCardProps {
  readonly metrics: UsageAnalytics['performanceMetrics'];
}

export function PerformanceSummaryCard({
  metrics,
}: PerformanceSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Performance Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Avg Processing Time
          </span>
          <span className="font-medium">
            {metrics.averageProcessingTime.toFixed(2)}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Cache Hit Rate
          </span>
          <span className="font-medium">
            {(metrics.cacheHitRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Error Rate</span>
          <span className="font-medium">
            {(metrics.errorRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

import type { PerformanceReport } from '@/lib/integrations';
import { Icon } from '@/shared/components/Icon';
import { MetricCard } from '@/shared/components/ui';

import { getPerformanceStatus } from './utils';

interface MetricsTabProps {
  performanceReport: PerformanceReport | null;
  loading: boolean;
  onGenerateReport: () => void;
  onResetMetrics: () => void;
}

export function MetricsTab({
  performanceReport,
  loading,
  onGenerateReport,
  onResetMetrics,
}: MetricsTabProps) {
  if (!performanceReport || performanceReport.summary.totalExecutions === 0) {
    return <EmptyMetricsState />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          iconName="activity"
          title="Total Executions"
          value={performanceReport.summary.totalExecutions.toLocaleString()}
        />
        <MetricCard
          iconName="clock"
          title="Avg Execution Time"
          value={`${performanceReport.summary.averageExecutionTime.toFixed(2)}ms`}
          subtitle={getPerformanceStatus(
            performanceReport.summary.averageExecutionTime,
            { good: 2, warning: 5 },
            {
              good: 'Good performance',
              warning: 'Moderate performance',
              poor: 'Needs optimization',
            }
          )}
        />
        <MetricCard
          iconName="memory-stick"
          title="Memory Usage"
          value={`${performanceReport.summary.memoryUsage.toFixed(1)}MB`}
          subtitle={getPerformanceStatus(
            performanceReport.summary.memoryUsage,
            { good: 25, warning: 50 },
            { good: 'Low usage', warning: 'Moderate usage', poor: 'High usage' }
          )}
        />
        <MetricCard
          iconName="target"
          title="Cache Hit Rate"
          value={`${performanceReport.summary.cacheHitRate.toFixed(1)}%`}
          subtitle={getPerformanceStatus(
            100 - performanceReport.summary.cacheHitRate,
            { good: 20, warning: 50 },
            {
              good: 'Excellent hit rate',
              warning: 'Good hit rate',
              poor: 'Poor hit rate',
            }
          )}
        />
      </div>

      {/* Cache Statistics */}
      <CacheStatistics cache={performanceReport.cache} />

      {/* Slowest Rules */}
      {performanceReport.slowestRules.length > 0 && (
        <SlowestRules rules={performanceReport.slowestRules} />
      )}

      {/* Recommendations */}
      {performanceReport.recommendations.length > 0 && (
        <PerformanceRecommendations
          recommendations={performanceReport.recommendations}
        />
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onGenerateReport}
          className="btn btn-secondary"
          disabled={loading}
        >
          <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
          {loading ? 'Refreshing...' : 'Refresh Report'}
        </button>
        <button
          onClick={onResetMetrics}
          className="btn bg-yellow-600 text-white hover:bg-yellow-700"
        >
          <Icon name="trash" className="w-4 h-4 mr-2" />
          Reset Metrics
        </button>
      </div>
    </div>
  );
}

function EmptyMetricsState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        <Icon
          name="activity"
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Performance Data Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Performance metrics will appear here once your rules start processing
          web requests. Browse websites that match your rule patterns to see
          real performance data.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>• Make sure your extension is enabled</p>
          <p>• Visit websites that match your rule patterns</p>
          <p>• Check that your rules are active and properly configured</p>
        </div>
      </div>
    </div>
  );
}

interface CacheStatisticsProps {
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

function CacheStatistics({ cache }: CacheStatisticsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {cache.size}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cache Size
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {cache.hits}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cache Hits
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {cache.misses}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cache Misses
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {cache.hitRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hit Rate
          </div>
        </div>
      </div>
    </div>
  );
}

interface SlowestRulesProps {
  rules: Array<{
    ruleId: string;
    averageTime: number;
    executionCount: number;
  }>;
}

function SlowestRules({ rules }: SlowestRulesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Slowest Rules</h3>
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div
            key={rule.ruleId}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Rule #{index + 1}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ID: {rule.ruleId}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900 dark:text-white">
                {rule.averageTime.toFixed(2)}ms avg
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {rule.executionCount} executions
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PerformanceRecommendationsProps {
  recommendations: string[];
}

function PerformanceRecommendations({
  recommendations,
}: PerformanceRecommendationsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">
        Performance Recommendations
      </h3>
      <div className="space-y-2">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900 rounded"
          >
            <Icon
              name="lightbulb"
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
            />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {recommendation}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { CacheStats } from '@/lib';
import { Icon } from '@/shared/components/Icon';

interface CacheManagementTabProps {
  cacheStats: CacheStats | null;
  loading: boolean;
  onClearCache: () => void;
  onOptimizeCache: () => void;
  onRefreshStats: () => void;
}

export function CacheManagementTab({
  cacheStats,
  loading,
  onClearCache,
  onOptimizeCache,
  onRefreshStats,
}: CacheManagementTabProps) {
  return (
    <div className="space-y-6">
      <CacheOverview
        cacheStats={cacheStats}
        loading={loading}
        onRefreshStats={onRefreshStats}
      />

      {cacheStats && (
        <>
          <CacheDetails cacheStats={cacheStats} />
          <CacheActions
            onClearCache={onClearCache}
            onOptimizeCache={onOptimizeCache}
          />
        </>
      )}
    </div>
  );
}

interface CacheOverviewProps {
  cacheStats: CacheStats | null;
  loading: boolean;
  onRefreshStats: () => void;
}

function CacheOverview({
  cacheStats,
  loading,
  onRefreshStats,
}: CacheOverviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Cache Overview</h3>
        <button
          onClick={onRefreshStats}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          {loading ? (
            <Icon name="loader" className="w-4 h-4 animate-spin" />
          ) : (
            <Icon name="refresh-cw" className="w-4 h-4" />
          )}
        </button>
      </div>

      {cacheStats ? (
        <CacheStatsGrid cacheStats={cacheStats} />
      ) : (
        <EmptyCacheState />
      )}
    </div>
  );
}

interface CacheStatsGridProps {
  cacheStats: CacheStats;
}

function CacheStatsGrid({ cacheStats }: CacheStatsGridProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRate =
    totalRequests > 0
      ? ((cacheStats.hits / totalRequests) * 100).toFixed(1)
      : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {cacheStats.size}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Cache Entries
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatBytes(cacheStats.size * 1024)} {/* Estimate size in bytes */}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Est. Cache Size
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {hitRate}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {totalRequests}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Requests
        </div>
      </div>
    </div>
  );
}

function EmptyCacheState() {
  return (
    <div className="text-center py-8">
      <Icon name="database" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">
        No cache statistics available
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        Cache data will appear here once rules are processed
      </p>
    </div>
  );
}

interface CacheDetailsProps {
  cacheStats: CacheStats;
}

function CacheDetails({ cacheStats }: CacheDetailsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h4 className="font-semibold mb-4">Cache Details</h4>

      <div className="space-y-4">
        <CachePerformanceMetrics cacheStats={cacheStats} />
        <CacheHealthIndicators cacheStats={cacheStats} />
      </div>
    </div>
  );
}

interface CachePerformanceMetricsProps {
  cacheStats: CacheStats;
}

function CachePerformanceMetrics({ cacheStats }: CachePerformanceMetricsProps) {
  const totalRequests = cacheStats.hits + cacheStats.misses;

  return (
    <div>
      <h5 className="font-medium mb-2">Performance Metrics</h5>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Requests
          </div>
          <div className="text-lg font-semibold">
            {totalRequests.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cache Hits
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {cacheStats.hits.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Cache Misses
          </div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {cacheStats.misses.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CacheHealthIndicatorsProps {
  cacheStats: CacheStats;
}

function CacheHealthIndicators({ cacheStats }: CacheHealthIndicatorsProps) {
  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRate =
    totalRequests > 0 ? (cacheStats.hits / totalRequests) * 100 : 0;

  const getHealthStatus = (hitRate: number) => {
    if (hitRate >= 80)
      return {
        status: 'Excellent',
        color: 'text-green-600 dark:text-green-400',
      };
    if (hitRate >= 60)
      return { status: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (hitRate >= 40)
      return { status: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { status: 'Poor', color: 'text-red-600 dark:text-red-400' };
  };

  const health = getHealthStatus(hitRate);

  return (
    <div>
      <h5 className="font-medium mb-2">Cache Health</h5>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              health.status === 'Excellent'
                ? 'bg-green-500'
                : health.status === 'Good'
                  ? 'bg-blue-500'
                  : health.status === 'Fair'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
            }`}
          />
          <span className={`font-medium ${health.color}`}>{health.status}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hit rate: {hitRate.toFixed(1)}%
        </div>
      </div>

      {hitRate < 60 && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <div className="flex items-start space-x-2">
            <Icon
              name="warning"
              className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5"
            />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Cache Performance Warning
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Low cache hit rate detected. Consider optimizing your rules or
                clearing outdated cache entries.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CacheActionsProps {
  onClearCache: () => void;
  onOptimizeCache: () => void;
}

function CacheActions({ onClearCache, onOptimizeCache }: CacheActionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h4 className="font-semibold mb-4">Cache Management</h4>

      <div className="space-y-4">
        <ClearCacheSection onClearCache={onClearCache} />
        <OptimizeCacheSection onOptimizeCache={onOptimizeCache} />
      </div>
    </div>
  );
}

interface ClearCacheSectionProps {
  onClearCache: () => void;
}

function ClearCacheSection({ onClearCache }: ClearCacheSectionProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h5 className="font-medium mb-2">Clear Cache</h5>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Remove all cached data to free up memory and force fresh rule
        processing. This may temporarily slow down rule execution.
      </p>
      <button onClick={onClearCache} className="btn btn-danger">
        <Icon name="trash" className="w-4 h-4 mr-2" />
        Clear All Cache
      </button>
    </div>
  );
}

interface OptimizeCacheSectionProps {
  onOptimizeCache: () => void;
}

function OptimizeCacheSection({ onOptimizeCache }: OptimizeCacheSectionProps) {
  return (
    <div>
      <h5 className="font-medium mb-2">Optimize Cache</h5>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Remove outdated entries and optimize cache structure for better
        performance. This keeps frequently used data while cleaning up unused
        entries.
      </p>
      <button onClick={onOptimizeCache} className="btn btn-primary">
        <Icon name="settings" className="w-4 h-4 mr-2" />
        Optimize Cache
      </button>
    </div>
  );
}

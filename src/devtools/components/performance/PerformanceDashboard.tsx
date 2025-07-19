// Main performance dashboard component
import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { loggers } from '@/shared/utils/debug';

import { usePerformanceData } from '../../hooks/usePerformanceData';
import type {
  PerformanceDashboardData,
  PerformanceThresholds,
  SystemPerformanceStats,
  PerformanceTimeSeriesData,
  RulePerformanceStats,
  PerformanceAlert,
} from '../../types/performance';

import { ErrorRateGauge } from './ErrorRateGauge';
import { ExecutionTimeChart } from './ExecutionTimeChart';
import { MemoryUsageChart } from './MemoryUsageChart';
import { PerformanceAlerts } from './PerformanceAlerts';
import { RulePerformanceTable } from './RulePerformanceTable';

interface PerformanceDashboardProps {
  className?: string;
}

// Get logger for this module
const logger = loggers.shared;

export function PerformanceDashboard({
  className = '',
}: Readonly<PerformanceDashboardProps>) {
  const {
    dashboardData,
    systemStats,
    ruleStats,
    alerts,
    timeSeriesData,
    isLoading,
    isRefreshing,
    refreshData,
    clearData,
    acknowledgeAlert,
    clearAlerts,
    exportData,
    updateThresholds,
    startCollection,
    stopCollection,
    isCollecting,
    error,
  } = usePerformanceData({
    autoRefresh: true,
    refreshInterval: 5000,
    enableAlerts: true,
  });

  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'rules' | 'alerts' | 'settings'
  >('overview');
  // const [showThresholdSettings, setShowThresholdSettings] = useState(false); // Removed unused variable

  // Handle data export
  const handleExport = () => {
    try {
      const data = exportData();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requestkit-performance-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      logger.error('Failed to export performance data:', err);
    }
  };

  // Handle threshold updates
  const handleThresholdUpdate = (
    newThresholds: Partial<PerformanceThresholds>
  ) => {
    updateThresholds(newThresholds);
    // setShowThresholdSettings(false); // Removed unused variable
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon name="alert-circle" className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 font-medium">
              Performance Monitoring Error
            </span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button onClick={refreshData} className="mt-2 btn btn-sm btn-error">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Dashboard
            </h2>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isCollecting ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isCollecting ? 'Collecting' : 'Stopped'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={isCollecting ? stopCollection : startCollection}
              className={`btn btn-sm ${isCollecting ? 'btn-warning' : 'btn-success'}`}
            >
              <Icon
                name={isCollecting ? 'pause' : 'play'}
                className="w-4 h-4 mr-1"
              />
              {isCollecting ? 'Stop' : 'Start'}
            </button>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="btn btn-sm btn-secondary"
            >
              <Icon
                name="refresh-cw"
                className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>

            <button onClick={handleExport} className="btn btn-sm btn-primary">
              <Icon name="download" className="w-4 h-4 mr-1" />
              Export
            </button>

            <button onClick={clearData} className="btn btn-sm btn-error">
              <Icon name="trash" className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: 'bar-chart-2' },
            { id: 'rules', label: 'Rules', icon: 'list' },
            {
              id: 'alerts',
              label: 'Alerts',
              icon: 'alert-triangle',
              badge: alerts.length,
            },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() =>
                setSelectedTab(
                  tab.id as 'overview' | 'rules' | 'alerts' | 'settings'
                )
              }
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon
                name={
                  tab.icon as
                    | 'bar-chart-2'
                    | 'list'
                    | 'alert-triangle'
                    | 'settings'
                }
                className="w-4 h-4 mr-2"
              />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedTab === 'overview' && (
          <div className="h-full overflow-y-auto p-4">
            <OverviewTab
              systemStats={systemStats}
              dashboardData={dashboardData}
              timeSeriesData={timeSeriesData}
            />
          </div>
        )}

        {selectedTab === 'rules' && (
          <div className="h-full overflow-y-auto p-4">
            <RulesTab ruleStats={ruleStats} />
          </div>
        )}

        {selectedTab === 'alerts' && (
          <div className="h-full overflow-y-auto p-4">
            <AlertsTab
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onClearAll={clearAlerts}
            />
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="h-full overflow-y-auto p-4">
            <SettingsTab onUpdateThresholds={handleThresholdUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  readonly systemStats: SystemPerformanceStats | null;
  readonly dashboardData: PerformanceDashboardData | null;
  readonly timeSeriesData: PerformanceTimeSeriesData[];
}

function OverviewTab({
  systemStats,
  dashboardData,
  timeSeriesData,
}: OverviewTabProps) {
  if (!systemStats || !dashboardData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No performance data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={systemStats.totalRequests.toLocaleString()}
          icon="globe"
          color="blue"
        />
        <MetricCard
          title="Rule Executions"
          value={systemStats.totalRuleExecutions.toLocaleString()}
          icon="zap"
          color="green"
        />
        <MetricCard
          title="Avg Processing Time"
          value={`${systemStats.averageRequestProcessingTime.toFixed(2)}ms`}
          icon="clock"
          color="yellow"
        />
        <MetricCard
          title="Error Rate"
          value={`${(systemStats.errorRate * 100).toFixed(1)}%`}
          icon="alert-circle"
          color={systemStats.errorRate > 0.1 ? 'red' : 'green'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Execution Time Trend
          </h3>
          <ExecutionTimeChart data={timeSeriesData} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Memory Usage
          </h3>
          <MemoryUsageChart data={timeSeriesData} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Error Rate
          </h3>
          <ErrorRateGauge value={systemStats.errorRate * 100} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cache Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Hit Rate
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {(systemStats.cacheStats.hitRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStats.cacheStats.hitRate * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Hits: </span>
                <span className="font-medium">
                  {systemStats.cacheStats.hits}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Misses:{' '}
                </span>
                <span className="font-medium">
                  {systemStats.cacheStats.misses}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Slowest Rules */}
      {dashboardData.topSlowestRules.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Slowest Rules
          </h3>
          <div className="space-y-2">
            {dashboardData.topSlowestRules.map(
              (
                rule: {
                  ruleId: string;
                  ruleName: string;
                  averageExecutionTime: number;
                  totalExecutions: number;
                },
                index: number
              ) => (
                <div
                  key={rule.ruleId}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {rule.ruleName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {rule.averageExecutionTime.toFixed(2)}ms
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {rule.totalExecutions} executions
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Rules Tab Component
function RulesTab({
  ruleStats,
}: {
  readonly ruleStats: RulePerformanceStats[];
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Rule Performance Details
      </h3>
      <RulePerformanceTable data={ruleStats} />
    </div>
  );
}

// Alerts Tab Component
interface AlertsTabProps {
  readonly alerts: PerformanceAlert[];
  readonly onAcknowledge: (alertId: string) => void;
  readonly onClearAll: () => void;
}

function AlertsTab({ alerts, onAcknowledge, onClearAll }: AlertsTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Performance Alerts
        </h3>
        {alerts.length > 0 && (
          <button onClick={onClearAll} className="btn btn-sm btn-secondary">
            Clear All
          </button>
        )}
      </div>
      <PerformanceAlerts alerts={alerts} onAcknowledge={onAcknowledge} />
    </div>
  );
}

// Settings Tab Component
interface SettingsTabProps {
  readonly onUpdateThresholds: (thresholds: Record<string, number>) => void;
}

function SettingsTab({ onUpdateThresholds }: SettingsTabProps) {
  const [thresholds, setThresholds] = useState({
    slowRuleThreshold: 10,
    highMemoryThreshold: 50,
    highErrorRateThreshold: 0.1,
    lowCacheHitRateThreshold: 0.7,
  });

  const handleSave = () => {
    onUpdateThresholds(thresholds);
  };

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Performance Thresholds
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="slow-rule-threshold"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Slow Rule Threshold (ms)
          </label>
          <input
            id="slow-rule-threshold"
            type="number"
            value={thresholds.slowRuleThreshold}
            onChange={e =>
              setThresholds(prev => ({
                ...prev,
                slowRuleThreshold: Number(
                  (e.target instanceof HTMLInputElement
                    ? e.target
                    : e.currentTarget
                  ).value
                ),
              }))
            }
            className="input w-full"
          />
        </div>

        <div>
          <label
            htmlFor="high-memory-threshold"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            High Memory Threshold (MB)
          </label>
          <input
            id="high-memory-threshold"
            type="number"
            value={thresholds.highMemoryThreshold}
            onChange={e =>
              setThresholds(prev => ({
                ...prev,
                highMemoryThreshold: Number(
                  (e.target instanceof HTMLInputElement
                    ? e.target
                    : e.currentTarget
                  ).value
                ),
              }))
            }
            className="input w-full"
          />
        </div>

        <div>
          <label
            htmlFor="high-error-rate-threshold"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            High Error Rate Threshold (%)
          </label>
          <input
            id="high-error-rate-threshold"
            type="number"
            step="0.01"
            value={thresholds.highErrorRateThreshold * 100}
            onChange={e =>
              setThresholds(prev => ({
                ...prev,
                highErrorRateThreshold:
                  Number(
                    (e.target instanceof HTMLInputElement
                      ? e.target
                      : e.currentTarget
                    ).value
                  ) / 100,
              }))
            }
            className="input w-full"
          />
        </div>

        <div>
          <label
            htmlFor="low-cache-hit-rate-threshold"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Low Cache Hit Rate Threshold (%)
          </label>
          <input
            id="low-cache-hit-rate-threshold"
            type="number"
            step="0.01"
            value={thresholds.lowCacheHitRateThreshold * 100}
            onChange={e =>
              setThresholds(prev => ({
                ...prev,
                lowCacheHitRateThreshold:
                  Number(
                    (e.target instanceof HTMLInputElement
                      ? e.target
                      : e.currentTarget
                    ).value
                  ) / 100,
              }))
            }
            className="input w-full"
          />
        </div>

        <button onClick={handleSave} className="btn btn-primary w-full">
          Save Thresholds
        </button>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  readonly title: string;
  readonly value: string;
  readonly icon: string;
  readonly color: 'blue' | 'green' | 'yellow' | 'red';
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    green: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
    yellow:
      'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    red: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center">
        <div
          className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}
        >
          <Icon
            name={icon as 'globe' | 'zap' | 'clock' | 'alert-circle'}
            className="w-5 h-5"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

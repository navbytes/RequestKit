import { useState, useEffect } from 'preact/hooks';

import {
  PerformanceMonitor,
  type PerformanceReport,
  type RuleOptimizationResult,
} from '@/lib/integrations';
import { Icon } from '@/shared/components/Icon';
import { TabDescription } from '@/shared/components/TabDescription';
import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import { CacheManagementTab } from './CacheManagementTab';
import { MetricsTab } from './MetricsTab';
import { OptimizationTab } from './OptimizationTab';

interface PerformanceOptimizationProps {
  rules: HeaderRule[];
  onRulesUpdate: (rules: HeaderRule[]) => void;
}

// Get logger for this module
const logger = loggers.shared;

const NAVIGATION_TABS = [
  { id: 'metrics', label: 'Performance Metrics', icon: 'bar-chart' as const },
  { id: 'optimization', label: 'Rule Optimization', icon: 'zap' as const },
  { id: 'cache', label: 'Cache Management', icon: 'memory-stick' as const },
] as const;

// Custom Hooks
function usePerformanceData() {
  const [performanceReport, setPerformanceReport] =
    useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Load metrics from storage first (for cross-context data)
      await PerformanceMonitor.loadMetricsFromStorage();
      const report = PerformanceMonitor.generatePerformanceReport();
      setPerformanceReport(report);
    } catch (error) {
      logger.error('Failed to generate performance report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial performance report
    generateReport();

    // Start cache cleanup
    PerformanceMonitor.startCacheCleanup();

    // Set up periodic report updates
    const interval = setInterval(() => {
      generateReport();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    performanceReport,
    loading,
    generateReport,
  };
}

function useRuleOptimization(
  rules: HeaderRule[],
  onRulesUpdate: (rules: HeaderRule[]) => void
) {
  const [optimizationResult, setOptimizationResult] =
    useState<RuleOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimizeRules = () => {
    setLoading(true);
    try {
      const result = PerformanceMonitor.optimizeRules(rules);
      setOptimizationResult(result);
    } catch (error) {
      logger.error('Failed to optimize rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimizations = (generateReport: () => void) => {
    if (!optimizationResult) return;

    if (
      confirm(
        'Apply optimizations to your rules? This will update existing rules.'
      )
    ) {
      onRulesUpdate(optimizationResult.optimizedRules);
      setOptimizationResult(null);
      generateReport();
    }
  };

  const handleCancelOptimization = () => {
    setOptimizationResult(null);
  };

  return {
    optimizationResult,
    loading,
    handleOptimizeRules,
    handleApplyOptimizations,
    handleCancelOptimization,
  };
}

function useCacheManagement() {
  const handleClearCache = (generateReport: () => void) => {
    if (
      confirm(
        'Clear all performance cache? This will reset performance metrics.'
      )
    ) {
      PerformanceMonitor.clearCache();
      generateReport();
    }
  };

  const handleResetMetrics = (generateReport: () => void) => {
    if (
      confirm('Reset all performance metrics? This action cannot be undone.')
    ) {
      PerformanceMonitor.resetMetrics();
      generateReport();
    }
  };

  const handleCleanupCache = () => {
    PerformanceMonitor.cleanupCache();
  };

  return {
    handleClearCache,
    handleResetMetrics,
    handleCleanupCache,
  };
}

// Main Component
export function PerformanceOptimization({
  rules,
  onRulesUpdate,
}: PerformanceOptimizationProps) {
  const [activeTab, setActiveTab] = useState<
    'metrics' | 'optimization' | 'cache'
  >('metrics');

  const {
    performanceReport,
    loading: reportLoading,
    generateReport,
  } = usePerformanceData();
  const {
    optimizationResult,
    loading: optimizationLoading,
    handleOptimizeRules,
    handleApplyOptimizations,
    handleCancelOptimization,
  } = useRuleOptimization(rules, onRulesUpdate);
  const { handleClearCache, handleResetMetrics, handleCleanupCache } =
    useCacheManagement();

  return (
    <div className="p-6">
      <TabDescription
        title="Performance Optimization"
        description="Monitor and optimize rule performance for better extension efficiency. Track execution metrics, identify bottlenecks, and apply automated optimizations to improve your rules' performance."
        icon="zap"
        features={[
          'Real-time performance metrics and monitoring',
          'Rule execution time analysis and optimization',
          'Memory usage tracking and cache management',
          'Automated performance suggestions and improvements',
          'Cache hit rate monitoring and cleanup tools',
        ]}
        useCases={[
          'Monitor rule performance and identify slow rules',
          'Optimize rule execution for better browser performance',
          'Manage cache to reduce memory usage',
          'Apply automated optimizations to improve efficiency',
        ]}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-8">
          {NAVIGATION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as 'metrics' | 'optimization' | 'cache')
              }
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'metrics' && (
        <MetricsTab
          performanceReport={performanceReport}
          loading={reportLoading}
          onGenerateReport={generateReport}
          onResetMetrics={() => handleResetMetrics(generateReport)}
        />
      )}

      {activeTab === 'optimization' && (
        <OptimizationTab
          rules={rules}
          optimizationResult={optimizationResult}
          loading={optimizationLoading}
          onOptimizeRules={handleOptimizeRules}
          onApplyOptimizations={() => handleApplyOptimizations(generateReport)}
          onCancelOptimization={handleCancelOptimization}
        />
      )}

      {activeTab === 'cache' && (
        <CacheManagementTab
          cacheStats={performanceReport?.cache || null}
          loading={reportLoading}
          onClearCache={() => handleClearCache(generateReport)}
          onOptimizeCache={handleCleanupCache}
          onRefreshStats={generateReport}
        />
      )}
    </div>
  );
}

// React hook for performance data management
import { useState, useEffect, useCallback } from 'preact/hooks';

import { loggers } from '@/shared/utils/debug';

import { performanceService } from '../services/PerformanceService';
import type {
  PerformanceDashboardData,
  PerformanceAlert,
  RulePerformanceStats,
  SystemPerformanceStats,
  PerformanceTimeSeriesData,
  PerformanceThresholds,
} from '../types/performance';


// Get logger for this module
const logger = loggers.shared;

export interface UsePerformanceDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAlerts?: boolean;
}

export interface UsePerformanceDataReturn {
  // Data
  dashboardData: PerformanceDashboardData | null;
  systemStats: SystemPerformanceStats | null;
  ruleStats: RulePerformanceStats[];
  alerts: PerformanceAlert[];
  timeSeriesData: PerformanceTimeSeriesData[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  refreshData: () => Promise<void>;
  clearData: () => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  exportData: (timeRange?: { start: string; end: string }) => unknown;
  updateThresholds: (thresholds: Partial<PerformanceThresholds>) => void;

  // Control
  startCollection: () => void;
  stopCollection: () => void;
  isCollecting: boolean;

  // Error handling
  error: string | null;
}

export function usePerformanceData(
  options: UsePerformanceDataOptions = {}
): UsePerformanceDataReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableAlerts = true,
  } = options;

  // State
  const [dashboardData, setDashboardData] =
    useState<PerformanceDashboardData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemPerformanceStats | null>(
    null
  );
  const [ruleStats, setRuleStats] = useState<RulePerformanceStats[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<
    PerformanceTimeSeriesData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollecting, setIsCollecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh data from performance service
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      if (!isLoading) {
        setIsRefreshing(true);
      }

      // Get comprehensive dashboard data
      const data = performanceService.getDashboardData();
      setDashboardData(data);
      setSystemStats(data.systemStats);
      setRuleStats(data.ruleStats);
      setTimeSeriesData(data.timeSeriesData);

      // Get alerts if enabled
      if (enableAlerts) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to refresh performance data'
      );
      logger.error('Performance data refresh error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading, enableAlerts]);

  // Clear all performance data
  const clearData = useCallback(() => {
    try {
      performanceService.clearData();
      setDashboardData(null);
      setSystemStats(null);
      setRuleStats([]);
      setAlerts([]);
      setTimeSeriesData([]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to clear performance data'
      );
    }
  }, []);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    try {
      performanceService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to acknowledge alert'
      );
    }
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    try {
      performanceService.clearAlerts();
      setAlerts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear alerts');
    }
  }, []);

  // Export performance data
  const exportData = useCallback(
    (timeRange?: { start: string; end: string }) => {
      try {
        return performanceService.exportData(timeRange);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to export performance data'
        );
        return null;
      }
    },
    []
  );

  // Update performance thresholds
  const updateThresholds = useCallback(
    (thresholds: Partial<PerformanceThresholds>) => {
      try {
        performanceService.updateThresholds(thresholds);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update thresholds'
        );
      }
    },
    []
  );

  // Start performance collection
  const startCollection = useCallback(() => {
    try {
      performanceService.startCollection();
      setIsCollecting(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start collection'
      );
    }
  }, []);

  // Stop performance collection
  const stopCollection = useCallback(() => {
    try {
      performanceService.stopCollection();
      setIsCollecting(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to stop collection'
      );
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isLoading) {
        refreshData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isLoading, refreshData]);

  // Performance tracking integration
  useEffect(() => {
    // Listen for performance events from the background script
    const handlePerformanceUpdate = (event: Event & { type: string }) => {
      if (event.type === 'performance_update') {
        // Refresh data when performance updates are received
        refreshData();
      }
    };

    // Set up event listener for performance updates
    window.addEventListener('performance_update', handlePerformanceUpdate);

    return () => {
      window.removeEventListener('performance_update', handlePerformanceUpdate);
    };
  }, [refreshData]);

  return {
    // Data
    dashboardData,
    systemStats,
    ruleStats,
    alerts,
    timeSeriesData,

    // Loading states
    isLoading,
    isRefreshing,

    // Actions
    refreshData,
    clearData,
    acknowledgeAlert,
    clearAlerts,
    exportData,
    updateThresholds,

    // Control
    startCollection,
    stopCollection,
    isCollecting,

    // Error handling
    error,
  };
}

// Helper hook for specific rule performance data
export function useRulePerformance(ruleId: string) {
  const [ruleStats, setRuleStats] = useState<RulePerformanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRuleStats = useCallback(async () => {
    try {
      setError(null);
      const stats = performanceService.getRuleStats(ruleId);
      setRuleStats(stats || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get rule performance'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ruleId]);

  useEffect(() => {
    refreshRuleStats();
  }, [refreshRuleStats]);

  return {
    ruleStats,
    isLoading,
    error,
    refresh: refreshRuleStats,
  };
}

// Helper hook for system performance monitoring
export function useSystemPerformance() {
  const [systemStats, setSystemStats] = useState<SystemPerformanceStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSystemStats = useCallback(async () => {
    try {
      setError(null);
      const stats = performanceService.getSystemStats();
      setSystemStats(stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get system performance'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSystemStats();

    // Auto-refresh every 2 seconds for real-time monitoring
    const interval = setInterval(refreshSystemStats, 2000);
    return () => clearInterval(interval);
  }, [refreshSystemStats]);

  return {
    systemStats,
    isLoading,
    error,
    refresh: refreshSystemStats,
  };
}

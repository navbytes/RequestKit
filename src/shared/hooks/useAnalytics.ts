import { useState, useEffect, useCallback } from 'preact/hooks';

import { AnalyticsMonitor } from '@/lib/integrations';
import type {
  UsageAnalytics,
  OptimizationSuggestion,
} from '@/lib/integrations/analytics-monitor';
import { loggers } from '@/shared/utils/debug';

interface AnalyticsState {
  analytics: UsageAnalytics | null;
  suggestions: OptimizationSuggestion[];
  effectivenessReport: Record<string, unknown> | null;
  isLoading: boolean;
  error: Error | null;
}

interface AnalyticsActions {
  loadAnalytics: () => Promise<void>;
  exportAnalytics: () => void;
  clearAnalytics: () => Promise<void>;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing analytics data and operations
 */

// Get logger for this module
const logger = loggers.shared;

export function useAnalytics(
  autoRefresh: boolean = true
): AnalyticsState & AnalyticsActions {
  const [state, setState] = useState<AnalyticsState>({
    analytics: null,
    suggestions: [],
    effectivenessReport: null,
    isLoading: true,
    error: null,
  });

  const analyticsMonitor = AnalyticsMonitor.getInstance();

  const loadAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await analyticsMonitor.loadStoredAnalytics();

      const analytics = analyticsMonitor.getAnalytics();
      const suggestions = analyticsMonitor.getOptimizationSuggestions();
      const effectivenessReport = analyticsMonitor.getRuleEffectivenessReport();

      setState({
        analytics,
        suggestions,
        effectivenessReport,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [analyticsMonitor]);

  const exportAnalytics = useCallback(() => {
    try {
      const data = analyticsMonitor.exportAnalytics();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `requestkit-analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to export analytics:', error);
    }
  }, [analyticsMonitor]);

  const clearAnalytics = useCallback(async () => {
    try {
      await analyticsMonitor.clearAnalytics();
      await loadAnalytics();
    } catch (error) {
      logger.error('Failed to clear analytics:', error);
      throw error;
    }
  }, [analyticsMonitor, loadAnalytics]);

  const refreshData = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadAnalytics();

    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [loadAnalytics, autoRefresh]);

  return {
    ...state,
    loadAnalytics,
    exportAnalytics,
    clearAnalytics,
    refreshData,
  };
}

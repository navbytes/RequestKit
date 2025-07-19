// Performance monitoring types for DevTools

export interface PerformanceMetrics {
  ruleId: string;
  ruleName: string;
  executionTime: number;
  matchTime: number;
  modificationTime: number;
  memoryUsage?: number | undefined;
  timestamp: string;
  success: boolean;
  error?: string | undefined;
}

export interface RulePerformanceStats {
  ruleId: string;
  ruleName: string;
  totalExecutions: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  totalMatchTime: number;
  totalModificationTime: number;
  successRate: number;
  errorCount: number;
  lastExecuted?: string | undefined;
  lastError?: string | undefined;
}

export interface SystemPerformanceStats {
  totalRequests: number;
  totalRuleExecutions: number;
  averageRequestProcessingTime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errorRate: number;
  timestamp: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_rule' | 'high_memory' | 'high_error_rate' | 'cache_miss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ruleId?: string;
  ruleName?: string;
  value: number;
  threshold: number;
  timestamp: string;
  suggestions: string[];
  acknowledged?: boolean;
}

export interface PerformanceTimeSeriesData {
  timestamp: string;
  executionTime: number;
  memoryUsage: number;
  errorRate: number;
  cacheHitRate: number;
  requestCount: number;
}

export interface PerformanceDashboardData {
  systemStats: SystemPerformanceStats;
  ruleStats: RulePerformanceStats[];
  alerts: PerformanceAlert[];
  timeSeriesData: PerformanceTimeSeriesData[];
  topSlowestRules: Array<{
    ruleId: string;
    ruleName: string;
    averageExecutionTime: number;
    totalExecutions: number;
  }>;
  optimizationSuggestions: Array<{
    type: 'rule_optimization' | 'cache_optimization' | 'memory_optimization';
    priority: 'low' | 'medium' | 'high';
    description: string;
    ruleId?: string;
    ruleName?: string;
    estimatedImprovement: string;
  }>;
}

export interface PerformanceChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

export interface PerformanceThresholds {
  slowRuleThreshold: number; // ms
  highMemoryThreshold: number; // MB
  highErrorRateThreshold: number; // percentage (0-1)
  lowCacheHitRateThreshold: number; // percentage (0-1)
}

export interface PerformanceExportData {
  metrics: Record<string, PerformanceMetrics[]>;
  ruleStats: RulePerformanceStats[];
  systemStats: SystemPerformanceStats[];
  alerts: PerformanceAlert[];
  exportTimestamp: string;
  timeRange: {
    start: string;
    end: string;
  };
}

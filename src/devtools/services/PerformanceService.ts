// Performance monitoring service for DevTools
import type {
  PerformanceMetrics,
  RulePerformanceStats,
  SystemPerformanceStats,
  PerformanceAlert,
  PerformanceTimeSeriesData,
  PerformanceDashboardData,
  PerformanceThresholds,
  PerformanceExportData,
} from '../types/performance';

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics = new Map<string, PerformanceMetrics[]>();
  private ruleStats = new Map<string, RulePerformanceStats>();
  private systemStats: SystemPerformanceStats[] = [];
  private timeSeriesData: PerformanceTimeSeriesData[] = [];
  private alerts: PerformanceAlert[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalRequests = 0;
  private totalErrors = 0;
  private isCollecting = false;

  // Performance thresholds
  private thresholds: PerformanceThresholds = {
    slowRuleThreshold: 10, // ms
    highMemoryThreshold: 50, // MB
    highErrorRateThreshold: 0.1, // 10%
    lowCacheHitRateThreshold: 0.7, // 70%
  };

  private constructor() {
    this.startDataCollection();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Start collecting performance data
   */
  public startCollection(): void {
    this.isCollecting = true;
    this.startDataCollection();
  }

  /**
   * Stop collecting performance data
   */
  public stopCollection(): void {
    this.isCollecting = false;
  }

  /**
   * Track rule execution performance
   */
  public trackRuleExecution(
    ruleId: string,
    ruleName: string,
    executionTime: number,
    matchTime: number,
    modificationTime: number,
    success: boolean,
    error?: string
  ): void {
    if (!this.isCollecting) return;

    const timestamp = new Date().toISOString();

    // Store detailed metrics
    const metric: PerformanceMetrics = {
      ruleId,
      ruleName,
      executionTime,
      matchTime,
      modificationTime,
      memoryUsage: this.getMemoryUsage(),
      timestamp,
      success,
      error,
    };

    const existing = this.metrics.get(ruleId) || [];
    existing.push(metric);
    this.metrics.set(ruleId, existing);

    // Update rule statistics
    this.updateRuleStats(
      ruleId,
      ruleName,
      executionTime,
      matchTime,
      modificationTime,
      success,
      error
    );

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    // Cleanup old metrics (keep last 1000 per rule)
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
  }

  /**
   * Track request processing
   */
  public trackRequest(processingTime: number, success: boolean): void {
    if (!this.isCollecting) return;

    this.totalRequests++;

    if (!success) {
      this.totalErrors++;
    }

    // Update system stats
    this.updateSystemStats(processingTime);
  }

  /**
   * Track cache performance
   */
  public trackCacheHit(): void {
    if (!this.isCollecting) return;
    this.cacheHits++;
  }

  public trackCacheMiss(): void {
    if (!this.isCollecting) return;
    this.cacheMisses++;
  }

  /**
   * Get comprehensive dashboard data
   */
  public getDashboardData(): PerformanceDashboardData {
    const systemStats = this.getSystemStats();
    const ruleStats = this.getAllRuleStats();
    const alerts = this.getAlerts();
    const timeSeriesData = this.getTimeSeriesData();
    const topSlowestRules = this.getSlowestRules(5);
    const optimizationSuggestions = this.getOptimizationSuggestions();

    return {
      systemStats,
      ruleStats,
      alerts,
      timeSeriesData,
      topSlowestRules,
      optimizationSuggestions,
    };
  }

  /**
   * Get performance statistics for a specific rule
   */
  public getRuleStats(ruleId: string): RulePerformanceStats | undefined {
    return this.ruleStats.get(ruleId);
  }

  /**
   * Get all rule performance statistics
   */
  public getAllRuleStats(): RulePerformanceStats[] {
    return Array.from(this.ruleStats.values());
  }

  /**
   * Get system performance statistics
   */
  public getSystemStats(): SystemPerformanceStats {
    const now = new Date().toISOString();
    const totalExecutions = Array.from(this.ruleStats.values()).reduce(
      (sum, stats) => sum + stats.totalExecutions,
      0
    );

    const averageProcessingTime =
      this.systemStats.length > 0
        ? this.systemStats.reduce(
            (sum, stats) => sum + stats.averageRequestProcessingTime,
            0
          ) / this.systemStats.length
        : 0;

    const errorRate =
      this.totalRequests > 0 ? this.totalErrors / this.totalRequests : 0;
    const totalCacheOperations = this.cacheHits + this.cacheMisses;
    const hitRate =
      totalCacheOperations > 0 ? this.cacheHits / totalCacheOperations : 0;

    return {
      totalRequests: this.totalRequests,
      totalRuleExecutions: totalExecutions,
      averageRequestProcessingTime: averageProcessingTime,
      memoryUsage: {
        used: this.getMemoryUsage() || 0,
        total: this.getMaxMemory() || 0,
        percentage: this.getMemoryPercentage() || 0,
      },
      cacheStats: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate,
      },
      errorRate,
      timestamp: now,
    };
  }

  /**
   * Get time series data for charts
   */
  public getTimeSeriesData(limit = 50): PerformanceTimeSeriesData[] {
    return this.timeSeriesData.slice(-limit);
  }

  /**
   * Get performance alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts]
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Clear all alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get top slowest rules
   */
  public getSlowestRules(limit = 10): Array<{
    ruleId: string;
    ruleName: string;
    averageExecutionTime: number;
    totalExecutions: number;
  }> {
    return Array.from(this.ruleStats.values())
      .sort((a, b) => b.averageExecutionTime - a.averageExecutionTime)
      .slice(0, limit)
      .map(stats => ({
        ruleId: stats.ruleId,
        ruleName: stats.ruleName,
        averageExecutionTime: stats.averageExecutionTime,
        totalExecutions: stats.totalExecutions,
      }));
  }

  /**
   * Get optimization suggestions
   */
  public getOptimizationSuggestions(): Array<{
    type: 'rule_optimization' | 'cache_optimization' | 'memory_optimization';
    priority: 'low' | 'medium' | 'high';
    description: string;
    ruleId?: string;
    ruleName?: string;
    estimatedImprovement: string;
  }> {
    const suggestions: Array<{
      type: 'rule_optimization' | 'cache_optimization' | 'memory_optimization';
      priority: 'low' | 'medium' | 'high';
      description: string;
      ruleId?: string;
      ruleName?: string;
      estimatedImprovement: string;
    }> = [];

    // Check for slow rules
    const slowRules = this.getSlowestRules(5);
    for (const rule of slowRules) {
      if (rule.averageExecutionTime > this.thresholds.slowRuleThreshold) {
        suggestions.push({
          type: 'rule_optimization',
          priority:
            rule.averageExecutionTime > this.thresholds.slowRuleThreshold * 2
              ? 'high'
              : 'medium',
          description: `Rule "${rule.ruleName}" has high execution time (${rule.averageExecutionTime.toFixed(2)}ms)`,
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          estimatedImprovement: `${Math.round(((rule.averageExecutionTime - this.thresholds.slowRuleThreshold) / rule.averageExecutionTime) * 100)}% faster`,
        });
      }
    }

    // Check cache hit rate
    const systemStats = this.getSystemStats();
    if (
      systemStats.cacheStats.hitRate < this.thresholds.lowCacheHitRateThreshold
    ) {
      suggestions.push({
        type: 'cache_optimization',
        priority: 'medium',
        description: `Low cache hit rate (${(systemStats.cacheStats.hitRate * 100).toFixed(1)}%)`,
        estimatedImprovement: `${Math.round((this.thresholds.lowCacheHitRateThreshold - systemStats.cacheStats.hitRate) * 100)}% improvement possible`,
      });
    }

    // Check memory usage
    if (systemStats.memoryUsage.percentage > 80) {
      suggestions.push({
        type: 'memory_optimization',
        priority: systemStats.memoryUsage.percentage > 90 ? 'high' : 'medium',
        description: `High memory usage (${systemStats.memoryUsage.percentage.toFixed(1)}%)`,
        estimatedImprovement: `${Math.round(systemStats.memoryUsage.percentage - 70)}% reduction possible`,
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Export performance data
   */
  public exportData(timeRange?: {
    start: string;
    end: string;
  }): PerformanceExportData {
    const now = new Date().toISOString();
    const start =
      timeRange?.start ||
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const end = timeRange?.end || now;

    return {
      metrics: Object.fromEntries(this.metrics),
      ruleStats: Array.from(this.ruleStats.values()),
      systemStats: this.systemStats.filter(
        stat => stat.timestamp >= start && stat.timestamp <= end
      ),
      alerts: this.alerts.filter(
        alert => alert.timestamp >= start && alert.timestamp <= end
      ),
      exportTimestamp: now,
      timeRange: { start, end },
    };
  }

  /**
   * Clear all performance data
   */
  public clearData(): void {
    this.metrics.clear();
    this.ruleStats.clear();
    this.systemStats = [];
    this.timeSeriesData = [];
    this.alerts = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalRequests = 0;
    this.totalErrors = 0;
  }

  /**
   * Update performance thresholds
   */
  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Get current thresholds
   */
  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  // Private methods

  private updateRuleStats(
    ruleId: string,
    ruleName: string,
    executionTime: number,
    matchTime: number,
    modificationTime: number,
    success: boolean,
    error?: string
  ): void {
    const existing = this.ruleStats.get(ruleId);

    if (!existing) {
      this.ruleStats.set(ruleId, {
        ruleId,
        ruleName,
        totalExecutions: 1,
        averageExecutionTime: executionTime,
        minExecutionTime: executionTime,
        maxExecutionTime: executionTime,
        totalMatchTime: matchTime,
        totalModificationTime: modificationTime,
        successRate: success ? 1 : 0,
        errorCount: success ? 0 : 1,
        lastExecuted: new Date().toISOString(),
        lastError: error,
      });
    } else {
      const totalExecutions = existing.totalExecutions + 1;
      const successCount =
        Math.round(existing.successRate * existing.totalExecutions) +
        (success ? 1 : 0);

      this.ruleStats.set(ruleId, {
        ...existing,
        totalExecutions,
        averageExecutionTime:
          (existing.averageExecutionTime * existing.totalExecutions +
            executionTime) /
          totalExecutions,
        minExecutionTime: Math.min(existing.minExecutionTime, executionTime),
        maxExecutionTime: Math.max(existing.maxExecutionTime, executionTime),
        totalMatchTime: existing.totalMatchTime + matchTime,
        totalModificationTime:
          existing.totalModificationTime + modificationTime,
        successRate: successCount / totalExecutions,
        errorCount: existing.errorCount + (success ? 0 : 1),
        lastExecuted: new Date().toISOString(),
        lastError: error || existing.lastError,
      });
    }
  }

  private updateSystemStats(processingTime: number): void {
    const now = new Date().toISOString();

    // Keep only last 100 system stats entries
    if (this.systemStats.length >= 100) {
      this.systemStats.shift();
    }

    this.systemStats.push({
      totalRequests: this.totalRequests,
      totalRuleExecutions: Array.from(this.ruleStats.values()).reduce(
        (sum, stats) => sum + stats.totalExecutions,
        0
      ),
      averageRequestProcessingTime: processingTime,
      memoryUsage: {
        used: this.getMemoryUsage() || 0,
        total: this.getMaxMemory() || 0,
        percentage: this.getMemoryPercentage() || 0,
      },
      cacheStats: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate:
          this.cacheHits + this.cacheMisses > 0
            ? this.cacheHits / (this.cacheHits + this.cacheMisses)
            : 0,
      },
      errorRate:
        this.totalRequests > 0 ? this.totalErrors / this.totalRequests : 0,
      timestamp: now,
    });
  }

  private checkPerformanceAlerts(metric: PerformanceMetrics): void {
    const now = new Date().toISOString();

    // Check for slow rule execution
    if (metric.executionTime > this.thresholds.slowRuleThreshold) {
      this.alerts.push({
        id: `slow-rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'slow_rule',
        severity:
          metric.executionTime > this.thresholds.slowRuleThreshold * 2
            ? 'high'
            : 'medium',
        message: `Rule "${metric.ruleName}" executed slowly (${metric.executionTime.toFixed(2)}ms)`,
        ruleId: metric.ruleId,
        ruleName: metric.ruleName,
        value: metric.executionTime,
        threshold: this.thresholds.slowRuleThreshold,
        timestamp: now,
        suggestions: [
          'Consider simplifying the rule pattern',
          'Check if conditions can be optimized',
          'Review header modification complexity',
        ],
      });
    }

    // Check for high memory usage
    if (
      metric.memoryUsage &&
      metric.memoryUsage > this.thresholds.highMemoryThreshold
    ) {
      this.alerts.push({
        id: `high-memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'high_memory',
        severity:
          metric.memoryUsage > this.thresholds.highMemoryThreshold * 2
            ? 'critical'
            : 'high',
        message: `High memory usage detected (${metric.memoryUsage.toFixed(2)}MB)`,
        value: metric.memoryUsage,
        threshold: this.thresholds.highMemoryThreshold,
        timestamp: now,
        suggestions: [
          'Clear performance data cache',
          'Reduce number of active rules',
          'Check for memory leaks in custom conditions',
        ],
      });
    }

    // Check error rate
    if (!metric.success && metric.error) {
      const ruleStats = this.ruleStats.get(metric.ruleId);
      if (
        ruleStats &&
        ruleStats.successRate < 1 - this.thresholds.highErrorRateThreshold
      ) {
        this.alerts.push({
          id: `high-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'high_error_rate',
          severity: 'high',
          message: `Rule "${metric.ruleName}" has high error rate (${((1 - ruleStats.successRate) * 100).toFixed(1)}%)`,
          ruleId: metric.ruleId,
          ruleName: metric.ruleName,
          value: 1 - ruleStats.successRate,
          threshold: this.thresholds.highErrorRateThreshold,
          timestamp: now,
          suggestions: [
            'Review rule configuration',
            'Check URL pattern validity',
            'Validate header names and values',
          ],
        });
      }
    }

    // Limit alerts to last 50
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  private startDataCollection(): void {
    // Collect time series data every 5 seconds
    setInterval(() => {
      if (!this.isCollecting) return;

      const systemStats = this.getSystemStats();
      const timeSeriesPoint: PerformanceTimeSeriesData = {
        timestamp: new Date().toISOString(),
        executionTime: systemStats.averageRequestProcessingTime,
        memoryUsage: systemStats.memoryUsage.percentage,
        errorRate: systemStats.errorRate * 100,
        cacheHitRate: systemStats.cacheStats.hitRate * 100,
        requestCount: systemStats.totalRequests,
      };

      this.timeSeriesData.push(timeSeriesPoint);

      // Keep only last 200 data points (about 16 minutes at 5-second intervals)
      if (this.timeSeriesData.length > 200) {
        this.timeSeriesData.shift();
      }
    }, 5000);
  }

  private getMemoryUsage(): number | undefined {
    interface PerformanceWithMemory extends Performance {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }

    if (typeof performance !== 'undefined') {
      const perfWithMemory = performance as PerformanceWithMemory;
      if (perfWithMemory.memory) {
        return perfWithMemory.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      }
    }
    return undefined;
  }

  private getMaxMemory(): number | undefined {
    interface PerformanceWithMemory extends Performance {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }

    if (typeof performance !== 'undefined') {
      const perfWithMemory = performance as PerformanceWithMemory;
      if (perfWithMemory.memory) {
        return perfWithMemory.memory.totalJSHeapSize / 1024 / 1024; // Convert to MB
      }
    }
    return undefined;
  }

  private getMemoryPercentage(): number | undefined {
    const used = this.getMemoryUsage();
    const total = this.getMaxMemory();

    if (used !== undefined && total !== undefined && total > 0) {
      return (used / total) * 100;
    }

    return undefined;
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance();

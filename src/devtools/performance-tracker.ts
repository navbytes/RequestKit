// Performance tracking for DevTools
export interface PerformanceMetrics {
  ruleId: string;
  ruleName: string;
  executionTime: number;
  matchTime: number;
  modificationTime: number;
  memoryUsage?: number | undefined;
  timestamp: string;
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
  type: 'slow_rule' | 'high_memory' | 'high_error_rate' | 'cache_miss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  ruleId?: string | undefined;
  ruleName?: string | undefined;
  value: number;
  threshold: number;
  timestamp: string;
  suggestions: string[];
}

export class PerformanceTracker {
  private metrics = new Map<string, PerformanceMetrics[]>();
  private ruleStats = new Map<string, RulePerformanceStats>();
  private systemStats: SystemPerformanceStats[] = [];
  private alerts: PerformanceAlert[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private totalRequests = 0;
  private totalErrors = 0;

  // Performance thresholds
  private readonly SLOW_RULE_THRESHOLD = 10; // ms
  private readonly HIGH_MEMORY_THRESHOLD = 50; // MB
  private readonly HIGH_ERROR_RATE_THRESHOLD = 0.1; // 10%
  private readonly LOW_CACHE_HIT_RATE_THRESHOLD = 0.7; // 70%

  /**
   * Track rule execution performance
   */
  trackRuleExecution(
    ruleId: string,
    ruleName: string,
    executionTime: number,
    matchTime: number,
    modificationTime: number,
    success: boolean,
    error?: string | undefined
  ): void {
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
    this.checkPerformanceAlerts(metric, success, error);

    // Cleanup old metrics (keep last 1000 per rule)
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }
  }

  /**
   * Track request processing
   */
  trackRequest(processingTime: number, success: boolean): void {
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
  trackCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Track cache miss
   */
  trackCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Get performance statistics for a specific rule
   */
  getRuleStats(ruleId: string): RulePerformanceStats | undefined {
    return this.ruleStats.get(ruleId);
  }

  /**
   * Get all rule performance statistics
   */
  getAllRuleStats(): RulePerformanceStats[] {
    return Array.from(this.ruleStats.values());
  }

  /**
   * Get system performance statistics
   */
  getSystemStats(): SystemPerformanceStats {
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
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Clear performance alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get top slowest rules
   */
  getSlowestRules(limit = 10): Array<{
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
  getOptimizationSuggestions(): Array<{
    type: 'rule_optimization' | 'cache_optimization' | 'memory_optimization';
    priority: 'low' | 'medium' | 'high';
    description: string;
    ruleId?: string | undefined;
    ruleName?: string | undefined;
    estimatedImprovement: string;
  }> {
    const suggestions: Array<{
      type: 'rule_optimization' | 'cache_optimization' | 'memory_optimization';
      priority: 'low' | 'medium' | 'high';
      description: string;
      ruleId?: string | undefined;
      ruleName?: string | undefined;
      estimatedImprovement: string;
    }> = [];

    // Check for slow rules
    const slowRules = this.getSlowestRules(5);
    for (const rule of slowRules) {
      if (rule.averageExecutionTime > this.SLOW_RULE_THRESHOLD) {
        suggestions.push({
          type: 'rule_optimization',
          priority:
            rule.averageExecutionTime > this.SLOW_RULE_THRESHOLD * 2
              ? 'high'
              : 'medium',
          description: `Rule "${rule.ruleName}" has high execution time (${rule.averageExecutionTime.toFixed(2)}ms)`,
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          estimatedImprovement: `${Math.round(((rule.averageExecutionTime - this.SLOW_RULE_THRESHOLD) / rule.averageExecutionTime) * 100)}% faster`,
        });
      }
    }

    // Check cache hit rate
    const systemStats = this.getSystemStats();
    if (systemStats.cacheStats.hitRate < this.LOW_CACHE_HIT_RATE_THRESHOLD) {
      suggestions.push({
        type: 'cache_optimization',
        priority: 'medium',
        description: `Low cache hit rate (${(systemStats.cacheStats.hitRate * 100).toFixed(1)}%)`,
        estimatedImprovement: `${Math.round((this.LOW_CACHE_HIT_RATE_THRESHOLD - systemStats.cacheStats.hitRate) * 100)}% improvement possible`,
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
  exportData(): {
    metrics: Record<string, PerformanceMetrics[]>;
    ruleStats: RulePerformanceStats[];
    systemStats: SystemPerformanceStats[];
    alerts: PerformanceAlert[];
    exportTimestamp: string;
  } {
    return {
      metrics: Object.fromEntries(this.metrics),
      ruleStats: Array.from(this.ruleStats.values()),
      systemStats: this.systemStats,
      alerts: this.alerts,
      exportTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear all performance data
   */
  clearData(): void {
    this.metrics.clear();
    this.ruleStats.clear();
    this.systemStats = [];
    this.alerts = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalRequests = 0;
    this.totalErrors = 0;
  }

  /**
   * Update rule statistics
   */
  private updateRuleStats(
    ruleId: string,
    ruleName: string,
    executionTime: number,
    matchTime: number,
    modificationTime: number,
    success: boolean,
    error?: string | undefined
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

  /**
   * Update system statistics
   */
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

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(
    metric: PerformanceMetrics,
    success: boolean,
    error?: string | undefined
  ): void {
    const now = new Date().toISOString();

    // Check for slow rule execution
    if (metric.executionTime > this.SLOW_RULE_THRESHOLD) {
      this.alerts.push({
        type: 'slow_rule',
        severity:
          metric.executionTime > this.SLOW_RULE_THRESHOLD * 2
            ? 'high'
            : 'medium',
        message: `Rule "${metric.ruleName}" executed slowly (${metric.executionTime.toFixed(2)}ms)`,
        ruleId: metric.ruleId,
        ruleName: metric.ruleName,
        value: metric.executionTime,
        threshold: this.SLOW_RULE_THRESHOLD,
        timestamp: now,
        suggestions: [
          'Consider simplifying the rule pattern',
          'Check if conditions can be optimized',
          'Review header modification complexity',
        ],
      });
    }

    // Check for high memory usage
    if (metric.memoryUsage && metric.memoryUsage > this.HIGH_MEMORY_THRESHOLD) {
      this.alerts.push({
        type: 'high_memory',
        severity:
          metric.memoryUsage > this.HIGH_MEMORY_THRESHOLD * 2
            ? 'critical'
            : 'high',
        message: `High memory usage detected (${metric.memoryUsage.toFixed(2)}MB)`,
        value: metric.memoryUsage,
        threshold: this.HIGH_MEMORY_THRESHOLD,
        timestamp: now,
        suggestions: [
          'Clear performance data cache',
          'Reduce number of active rules',
          'Check for memory leaks in custom conditions',
        ],
      });
    }

    // Check error rate
    if (!success && error) {
      const ruleStats = this.ruleStats.get(metric.ruleId);
      if (
        ruleStats &&
        ruleStats.successRate < 1 - this.HIGH_ERROR_RATE_THRESHOLD
      ) {
        this.alerts.push({
          type: 'high_error_rate',
          severity: 'high',
          message: `Rule "${metric.ruleName}" has high error rate (${((1 - ruleStats.successRate) * 100).toFixed(1)}%)`,
          ruleId: metric.ruleId,
          ruleName: metric.ruleName,
          value: 1 - ruleStats.successRate,
          threshold: this.HIGH_ERROR_RATE_THRESHOLD,
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

  /**
   * Get current memory usage (mock implementation)
   */
  private getMemoryUsage(): number | undefined {
    // In a real implementation, this would use performance.memory or similar
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (
        performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
          };
        }
      ).memory;
      return memory ? memory.usedJSHeapSize / 1024 / 1024 : undefined; // Convert to MB
    }
    return undefined;
  }

  /**
   * Get maximum memory (mock implementation)
   */
  private getMaxMemory(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (
        performance as Performance & {
          memory?: {
            totalJSHeapSize: number;
          };
        }
      ).memory;
      return memory ? memory.totalJSHeapSize / 1024 / 1024 : undefined; // Convert to MB
    }
    return undefined;
  }

  /**
   * Get memory usage percentage
   */
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
export const performanceTracker = new PerformanceTracker();

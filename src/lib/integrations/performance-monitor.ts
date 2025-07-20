import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

/**
 * Performance monitoring and optimization for RequestKit
 */

// Get logger for this module
const logger = loggers.shared;

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {
    ruleExecutionTimes: new Map(),
    totalExecutions: 0,
    averageExecutionTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    lastUpdated: new Date(),
  };

  private static cache: RuleCache = new Map();
  private static cacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
  };

  /**
   * Start performance monitoring for a rule execution
   */
  static startRuleExecution(ruleId: string): PerformanceTimer {
    return {
      ruleId,
      startTime:
        typeof performance !== 'undefined' ? performance.now() : Date.now(),
      startMemory: this.getMemoryUsage(),
    };
  }

  /**
   * End performance monitoring and record metrics
   */
  static endRuleExecution(timer: PerformanceTimer): void {
    const endTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executionTime = endTime - timer.startTime;
    const endMemory = this.getMemoryUsage();

    // Update rule-specific metrics
    const existing = this.metrics.ruleExecutionTimes.get(timer.ruleId) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      lastExecuted: new Date(),
    };

    existing.count++;
    existing.totalTime += executionTime;
    existing.averageTime = existing.totalTime / existing.count;
    existing.minTime = Math.min(existing.minTime, executionTime);
    existing.maxTime = Math.max(existing.maxTime, executionTime);
    existing.lastExecuted = new Date();

    this.metrics.ruleExecutionTimes.set(timer.ruleId, existing);

    // Update global metrics
    this.metrics.totalExecutions++;
    this.metrics.averageExecutionTime =
      (this.metrics.averageExecutionTime * (this.metrics.totalExecutions - 1) +
        executionTime) /
      this.metrics.totalExecutions;
    this.metrics.memoryUsage = endMemory;
    this.metrics.lastUpdated = new Date();

    // Store metrics in Chrome storage for cross-context access
    this.saveMetricsToStorage();

    // Log slow executions
    if (executionTime > 10) {
      // 10ms threshold
      logger.warn(
        `Slow rule execution: ${timer.ruleId} took ${executionTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetrics {
    this.metrics.cacheHitRate = this.calculateCacheHitRate();
    return { ...this.metrics };
  }

  /**
   * Get performance metrics for a specific rule
   */
  static getRuleMetrics(ruleId: string): RulePerformanceMetrics | null {
    return this.metrics.ruleExecutionTimes.get(ruleId) || null;
  }

  /**
   * Get top slowest rules
   */
  static getSlowestRules(
    limit = 10
  ): Array<{ ruleId: string; metrics: RulePerformanceMetrics }> {
    return Array.from(this.metrics.ruleExecutionTimes.entries())
      .map(([ruleId, metrics]) => ({ ruleId, metrics }))
      .sort((a, b) => b.metrics.averageTime - a.metrics.averageTime)
      .slice(0, limit);
  }

  /**
   * Get memory usage estimate
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      return perfWithMemory.memory?.usedJSHeapSize
        ? perfWithMemory.memory.usedJSHeapSize / 1024 / 1024
        : 0; // MB
    }
    return 0;
  }

  /**
   * Calculate cache hit rate
   */
  private static calculateCacheHitRate(): number {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return total > 0 ? (this.cacheStats.hits / total) * 100 : 0;
  }

  /**
   * Cache a rule evaluation result
   */
  static cacheRuleResult(key: string, result: unknown, ttl = 60000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { result, expiry });
    this.cacheStats.size = this.cache.size;
  }

  /**
   * Get cached rule result
   */
  static getCachedResult(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) {
      this.cacheStats.misses++;
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      this.cacheStats.size = this.cache.size;
      return null;
    }

    this.cacheStats.hits++;
    return cached.result;
  }

  /**
   * Clear expired cache entries
   */
  static cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.cacheStats.size = this.cache.size;

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Clear all cache
   */
  static clearCache(): void {
    this.cache.clear();
    this.cacheStats = { hits: 0, misses: 0, size: 0 };
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  /**
   * Optimize rules for better performance
   */
  static optimizeRules(rules: HeaderRule[]): RuleOptimizationResult {
    const suggestions: OptimizationSuggestion[] = [];
    const optimizedRules: HeaderRule[] = [];

    for (const rule of rules) {
      const optimizedRule = { ...rule };
      const ruleMetrics = this.getRuleMetrics(rule.id);

      // Check for slow rules
      if (ruleMetrics && ruleMetrics.averageTime > 5) {
        suggestions.push({
          type: 'performance',
          severity: 'medium',
          ruleId: rule.id,
          ruleName: rule.name,
          message: `Rule has slow average execution time: ${ruleMetrics.averageTime.toFixed(2)}ms`,
          suggestion: 'Consider simplifying the rule pattern or conditions',
        });
      }

      // Check for overly broad patterns
      if (
        rule.pattern.domain === '*' &&
        (!rule.pattern.path || rule.pattern.path === '/*')
      ) {
        suggestions.push({
          type: 'pattern',
          severity: 'high',
          ruleId: rule.id,
          ruleName: rule.name,
          message:
            'Rule uses overly broad pattern that matches all domains and paths',
          suggestion: 'Make the pattern more specific to improve performance',
        });
      }

      // Check for complex regex patterns
      if ('conditions' in rule && rule.conditions) {
        const regexConditions = rule.conditions.filter(
          c => c.operator === 'regex'
        );
        if (regexConditions.length > 2) {
          suggestions.push({
            type: 'conditions',
            severity: 'medium',
            ruleId: rule.id,
            ruleName: rule.name,
            message: `Rule has ${regexConditions.length} regex conditions which may impact performance`,
            suggestion: 'Consider using simpler operators where possible',
          });
        }
      }

      // Check for too many headers
      if (rule.headers.length > 10) {
        suggestions.push({
          type: 'headers',
          severity: 'low',
          ruleId: rule.id,
          ruleName: rule.name,
          message: `Rule modifies ${rule.headers.length} headers`,
          suggestion:
            'Consider splitting into multiple rules for better maintainability',
        });
      }

      // Optimize rule priority
      if (rule.priority > 100) {
        optimizedRule.priority = Math.min(rule.priority, 100);
        suggestions.push({
          type: 'priority',
          severity: 'low',
          ruleId: rule.id,
          ruleName: rule.name,
          message: 'Rule priority was capped at 100 for better performance',
          suggestion: 'Use priorities between 1-100 for optimal performance',
        });
      }

      optimizedRules.push(optimizedRule);
    }

    return {
      originalRuleCount: rules.length,
      optimizedRuleCount: optimizedRules.length,
      suggestions,
      optimizedRules,
      estimatedPerformanceGain: this.calculatePerformanceGain(suggestions),
    };
  }

  /**
   * Calculate estimated performance gain from optimizations
   */
  private static calculatePerformanceGain(
    suggestions: OptimizationSuggestion[]
  ): number {
    let gain = 0;

    suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'performance':
          gain +=
            suggestion.severity === 'high'
              ? 30
              : suggestion.severity === 'medium'
                ? 20
                : 10;
          break;
        case 'pattern':
          gain +=
            suggestion.severity === 'high'
              ? 25
              : suggestion.severity === 'medium'
                ? 15
                : 5;
          break;
        case 'conditions':
          gain +=
            suggestion.severity === 'high'
              ? 20
              : suggestion.severity === 'medium'
                ? 10
                : 5;
          break;
        default:
          gain += 5;
      }
    });

    return Math.min(gain, 100); // Cap at 100%
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): PerformanceReport {
    const metrics = this.getMetrics();
    const cacheStats = this.getCacheStats();
    const slowestRules = this.getSlowestRules(5);

    return {
      timestamp: new Date(),
      summary: {
        totalExecutions: metrics.totalExecutions,
        averageExecutionTime: metrics.averageExecutionTime,
        memoryUsage: metrics.memoryUsage,
        cacheHitRate: metrics.cacheHitRate,
      },
      cache: {
        size: cacheStats.size,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: this.calculateCacheHitRate(),
      },
      slowestRules: slowestRules.map(({ ruleId, metrics }) => ({
        ruleId,
        averageTime: metrics.averageTime,
        maxTime: metrics.maxTime,
        executionCount: metrics.count,
      })),
      recommendations: this.generateRecommendations(metrics, cacheStats),
    };
  }

  /**
   * Generate performance recommendations
   */
  private static generateRecommendations(
    metrics: PerformanceMetrics,
    _cacheStats: CacheStats
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.averageExecutionTime > 5) {
      recommendations.push(
        'Average rule execution time is high. Consider optimizing rule patterns.'
      );
    }

    if (this.calculateCacheHitRate() < 50) {
      recommendations.push(
        'Cache hit rate is low. Consider increasing cache TTL or reviewing rule patterns.'
      );
    }

    if (metrics.memoryUsage > 50) {
      recommendations.push(
        'Memory usage is high. Consider clearing cache or reducing active rules.'
      );
    }

    if (metrics.totalExecutions > 10000) {
      recommendations.push(
        'High number of rule executions detected. Monitor for performance impact.'
      );
    }

    return recommendations;
  }

  /**
   * Reset all performance metrics
   */
  static resetMetrics(): void {
    this.metrics = {
      ruleExecutionTimes: new Map(),
      totalExecutions: 0,
      averageExecutionTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      lastUpdated: new Date(),
    };
    this.clearCache();

    // Also clear the data from Chrome storage
    this.clearMetricsFromStorage();
  }

  /**
   * Start automatic cache cleanup
   */
  static startCacheCleanup(intervalMs = 300000): void {
    // 5 minutes - only start in environments that support setInterval
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.cleanupCache();
      }, intervalMs);
    }
  }

  /**
   * Save metrics to Chrome storage for cross-context access
   */
  private static async saveMetricsToStorage(): Promise<void> {
    try {
      // Convert Map to plain object for storage
      const metricsForStorage = {
        ...this.metrics,
        ruleExecutionTimes: Object.fromEntries(this.metrics.ruleExecutionTimes),
        lastUpdated: this.metrics.lastUpdated.toISOString(),
      };

      // Store in Chrome storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          performanceMetrics: metricsForStorage,
          performanceCacheStats: this.cacheStats,
        });
      }
    } catch (error) {
      logger.error(
        '[PerformanceMonitor] Failed to save metrics to storage:',
        error
      );
    }
  }

  /**
   * Load metrics from Chrome storage
   */
  static async loadMetricsFromStorage(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([
          'performanceMetrics',
          'performanceCacheStats',
        ]);

        if (result.performanceMetrics) {
          const storedMetrics = result.performanceMetrics;

          // Restore metrics
          this.metrics = {
            ...storedMetrics,
            ruleExecutionTimes: new Map(
              Object.entries(storedMetrics.ruleExecutionTimes || {})
            ),
            lastUpdated: new Date(storedMetrics.lastUpdated),
          };

          // Restore cache stats
          if (result.performanceCacheStats) {
            this.cacheStats = result.performanceCacheStats;
          }
        }
      }
    } catch (error) {
      logger.error(
        '[PerformanceMonitor] Failed to load metrics from storage:',
        error
      );
    }
  }

  /**
   * Clear metrics from Chrome storage
   */
  static async clearMetricsFromStorage(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove([
          'performanceMetrics',
          'performanceCacheStats',
        ]);
      }
    } catch (error) {
      logger.error(
        '[PerformanceMonitor] Failed to clear metrics from storage:',
        error
      );
    }
  }
}

/**
 * Performance monitoring types
 */
export interface PerformanceTimer {
  ruleId: string;
  startTime: number;
  startMemory: number;
}

export interface PerformanceMetrics {
  ruleExecutionTimes: Map<string, RulePerformanceMetrics>;
  totalExecutions: number;
  averageExecutionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  lastUpdated: Date;
}

export interface RulePerformanceMetrics {
  count: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  lastExecuted: Date;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

export interface OptimizationSuggestion {
  type: 'performance' | 'pattern' | 'conditions' | 'headers' | 'priority';
  severity: 'low' | 'medium' | 'high';
  ruleId: string;
  ruleName: string;
  message: string;
  suggestion: string;
}

export interface RuleOptimizationResult {
  originalRuleCount: number;
  optimizedRuleCount: number;
  suggestions: OptimizationSuggestion[];
  optimizedRules: HeaderRule[];
  estimatedPerformanceGain: number;
}

export interface PerformanceReport {
  timestamp: Date;
  summary: {
    totalExecutions: number;
    averageExecutionTime: number;
    memoryUsage: number;
    cacheHitRate: number;
  };
  cache: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  slowestRules: Array<{
    ruleId: string;
    averageTime: number;
    maxTime: number;
    executionCount: number;
  }>;
  recommendations: string[];
}

type RuleCache = Map<string, { result: unknown; expiry: number }>;

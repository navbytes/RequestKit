// Analytics and monitoring system for RequestKit
import type { HeaderRule } from '@/shared/types/rules';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export interface UsageAnalytics {
  totalRules: number;
  activeRules: number;
  totalRequests: number;
  modifiedRequests: number;
  ruleEffectiveness: Map<string, RuleEffectiveness>;
  performanceMetrics: PerformanceMetrics;
  errorTracking: ErrorTracking;
  userBehavior: UserBehavior;
}

export interface RuleEffectiveness {
  ruleId: string;
  ruleName: string;
  matchCount: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  lastUsed: Date;
  popularityScore: number;
  impactScore: number;
}

export interface PerformanceMetrics {
  averageProcessingTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkLatency: number;
  cpuUsage: number;
  throughput: number;
  errorRate: number;
}

export interface ErrorTracking {
  totalErrors: number;
  errorsByType: Map<string, number>;
  errorsByRule: Map<string, number>;
  recentErrors: ErrorEntry[];
  errorTrends: Array<{ timestamp: number; count: number }>;
}

export interface ErrorEntry {
  id: string;
  timestamp: Date;
  type: 'rule_error' | 'pattern_error' | 'network_error' | 'system_error';
  message: string;
  ruleId?: string;
  url?: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserBehavior {
  sessionDuration: number;
  rulesCreated: number;
  rulesModified: number;
  rulesDeleted: number;
  templatesUsed: number;
  featuresUsed: string[];
  preferredSettings: Record<string, unknown>;
  workflowPatterns: WorkflowPattern[];
}

export interface WorkflowPattern {
  pattern: string;
  frequency: number;
  averageTime: number;
  successRate: number;
}

export interface OptimizationSuggestion {
  type:
    | 'performance'
    | 'rule_optimization'
    | 'pattern_improvement'
    | 'error_reduction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  action: string;
  estimatedImprovement: number;
  ruleIds?: string[];
}

export class AnalyticsMonitor {
  private static instance: AnalyticsMonitor;
  private analytics: UsageAnalytics;
  private sessionStart: Date;
  private metricsInterval: number | null = null;

  static getInstance(): AnalyticsMonitor {
    if (!AnalyticsMonitor.instance) {
      AnalyticsMonitor.instance = new AnalyticsMonitor();
    }
    return AnalyticsMonitor.instance;
  }

  constructor() {
    this.sessionStart = new Date();
    this.analytics = {
      totalRules: 0,
      activeRules: 0,
      totalRequests: 0,
      modifiedRequests: 0,
      ruleEffectiveness: new Map(),
      performanceMetrics: {
        averageProcessingTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        networkLatency: 0,
        cpuUsage: 0,
        throughput: 0,
        errorRate: 0,
      },
      errorTracking: {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByRule: new Map(),
        recentErrors: [],
        errorTrends: [],
      },
      userBehavior: {
        sessionDuration: 0,
        rulesCreated: 0,
        rulesModified: 0,
        rulesDeleted: 0,
        templatesUsed: 0,
        featuresUsed: [],
        preferredSettings: {},
        workflowPatterns: [],
      },
    };
  }

  /**
   * Initialize analytics monitoring
   */
  initialize(): void {
    this.loadStoredAnalytics();
    this.startMetricsCollection();
    this.setupEventListeners();
  }

  /**
   * Start collecting metrics periodically
   */
  private startMetricsCollection(): void {
    // Only start metrics collection in browser contexts (not service workers)
    if (typeof window !== 'undefined') {
      this.metricsInterval = window.setInterval(() => {
        this.collectPerformanceMetrics();
        this.updateSessionDuration();
        this.saveAnalytics();
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Setup event listeners for user behavior tracking
   */
  private setupEventListeners(): void {
    // Only setup event listeners in browser contexts (not service workers)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.saveAnalytics();
        }
      });

      // Track before unload
      window.addEventListener('beforeunload', () => {
        this.saveAnalytics();
      });
    }
  }

  /**
   * Load stored analytics data
   */
  async loadStoredAnalytics(): Promise<void> {
    try {
      const result = await ChromeApiUtils.storage.local.get(['analytics']);

      if ((result as Record<string, unknown>).analytics) {
        const stored = (result as Record<string, unknown>).analytics as Record<
          string,
          unknown
        >;

        // Restore rule effectiveness with proper Date objects
        const ruleEffectiveness = new Map();
        if (
          stored.ruleEffectiveness &&
          Array.isArray(stored.ruleEffectiveness)
        ) {
          (
            stored.ruleEffectiveness as Array<[string, Record<string, unknown>]>
          ).forEach(([ruleId, data]) => {
            ruleEffectiveness.set(ruleId, {
              ...data,
              lastUsed: new Date(data.lastUsed as string), // Convert string back to Date
            });
          });
        }

        // Restore error tracking with proper Date objects
        const storedErrorTracking = stored.errorTracking as
          | Record<string, unknown>
          | undefined;
        const errorTracking = {
          ...this.analytics.errorTracking,
          ...(storedErrorTracking || {}),
          errorsByType: new Map(
            (storedErrorTracking?.errorsByType as Array<[string, number]>) || []
          ),
          errorsByRule: new Map(
            (storedErrorTracking?.errorsByRule as Array<[string, number]>) || []
          ),
          recentErrors: (
            (storedErrorTracking?.recentErrors as Array<
              Record<string, unknown>
            >) || []
          ).map(
            error =>
              ({
                ...error,
                timestamp: new Date(error.timestamp as string), // Convert string back to Date
              }) as ErrorEntry
          ),
        };

        this.analytics = {
          ...this.analytics,
          ...stored,
          ruleEffectiveness,
          errorTracking,
        };
      } else {
        // No stored analytics data found, using defaults
        logger.info('No stored analytics data found, using default values');
      }
    } catch (error) {
      logger.error('Failed to load analytics data:', error);
    }
  }

  /**
   * Save analytics data to storage
   */
  private async saveAnalytics(): Promise<void> {
    try {
      const dataToSave = {
        ...this.analytics,
        ruleEffectiveness: Array.from(
          this.analytics.ruleEffectiveness.entries()
        ),
        errorTracking: {
          ...this.analytics.errorTracking,
          errorsByType: Array.from(
            this.analytics.errorTracking.errorsByType.entries()
          ),
          errorsByRule: Array.from(
            this.analytics.errorTracking.errorsByRule.entries()
          ),
        },
      };
      await ChromeApiUtils.storage.local.set({ analytics: dataToSave });
    } catch (error) {
      logger.error('Failed to save analytics data:', error);
    }
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): void {
    // Only collect performance metrics in browser contexts
    if (typeof performance !== 'undefined') {
      // Memory usage
      const perfWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      const memoryInfo = perfWithMemory.memory;
      if (memoryInfo) {
        this.analytics.performanceMetrics.memoryUsage =
          memoryInfo.usedJSHeapSize;
      }

      // Performance timing
      try {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.analytics.performanceMetrics.networkLatency =
            navigation.responseEnd - navigation.requestStart;
        }
      } catch (error) {
        // Performance API might not be available in all contexts
        logger.debug('Performance timing not available:', error);
      }
    }

    // Update session duration
    this.updateSessionDuration();
  }

  /**
   * Update session duration
   */
  private updateSessionDuration(): void {
    this.analytics.userBehavior.sessionDuration =
      Date.now() - this.sessionStart.getTime();
  }

  /**
   * Track rule usage
   */
  trackRuleUsage(
    ruleId: string,
    ruleName: string,
    success: boolean,
    responseTime: number
  ): void {
    try {
      let effectiveness = this.analytics.ruleEffectiveness.get(ruleId);

      if (!effectiveness) {
        effectiveness = {
          ruleId,
          ruleName,
          matchCount: 0,
          successRate: 0,
          averageResponseTime: 0,
          errorCount: 0,
          lastUsed: new Date(),
          popularityScore: 0,
          impactScore: 0,
        };
      }

      // Ensure lastUsed is a Date object
      if (!(effectiveness.lastUsed instanceof Date)) {
        effectiveness.lastUsed = new Date(effectiveness.lastUsed);
      }

      effectiveness.matchCount++;
      effectiveness.lastUsed = new Date();

      if (success) {
        effectiveness.averageResponseTime =
          (effectiveness.averageResponseTime * (effectiveness.matchCount - 1) +
            responseTime) /
          effectiveness.matchCount;
      } else {
        effectiveness.errorCount++;
      }

      effectiveness.successRate =
        ((effectiveness.matchCount - effectiveness.errorCount) /
          effectiveness.matchCount) *
        100;

      // Calculate popularity score (recent usage weighted)
      const daysSinceLastUsed =
        (Date.now() - effectiveness.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      effectiveness.popularityScore =
        effectiveness.matchCount / (1 + daysSinceLastUsed);

      // Calculate impact score (success rate * usage frequency)
      effectiveness.impactScore =
        effectiveness.successRate * effectiveness.popularityScore;

      this.analytics.ruleEffectiveness.set(ruleId, effectiveness);
      this.analytics.totalRequests++;

      if (success) {
        this.analytics.modifiedRequests++;
      }

      // Save analytics to storage for cross-context access
      this.saveAnalytics();
    } catch (error) {
      logger.error('Error tracking rule usage:', error);
    }
  }

  /**
   * Track error occurrence
   */
  trackError(error: Omit<ErrorEntry, 'id' | 'timestamp'>): void {
    const errorEntry: ErrorEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...error,
    };

    this.analytics.errorTracking.recentErrors.push(errorEntry);
    this.analytics.errorTracking.totalErrors++;

    // Update error counts by type
    const typeCount =
      this.analytics.errorTracking.errorsByType.get(error.type) || 0;
    this.analytics.errorTracking.errorsByType.set(error.type, typeCount + 1);

    // Update error counts by rule
    if (error.ruleId) {
      const ruleCount =
        this.analytics.errorTracking.errorsByRule.get(error.ruleId) || 0;
      this.analytics.errorTracking.errorsByRule.set(
        error.ruleId,
        ruleCount + 1
      );
    }

    // Keep only last 100 errors
    if (this.analytics.errorTracking.recentErrors.length > 100) {
      this.analytics.errorTracking.recentErrors =
        this.analytics.errorTracking.recentErrors.slice(-100);
    }

    // Update error trends
    this.updateErrorTrends();
  }

  /**
   * Update error trends
   */
  private updateErrorTrends(): void {
    const now = Date.now();
    const hourBucket = Math.floor(now / (1000 * 60 * 60)) * (1000 * 60 * 60);

    const existingTrend = this.analytics.errorTracking.errorTrends.find(
      trend => trend.timestamp === hourBucket
    );

    if (existingTrend) {
      existingTrend.count++;
    } else {
      this.analytics.errorTracking.errorTrends.push({
        timestamp: hourBucket,
        count: 1,
      });
    }

    // Keep only last 24 hours
    const cutoff = now - 24 * 60 * 60 * 1000;
    this.analytics.errorTracking.errorTrends =
      this.analytics.errorTracking.errorTrends.filter(
        trend => trend.timestamp > cutoff
      );
  }

  /**
   * Track user behavior
   */
  trackUserAction(action: string, details?: Record<string, unknown>): void {
    switch (action) {
      case 'rule_created':
        this.analytics.userBehavior.rulesCreated++;
        break;
      case 'rule_modified':
        this.analytics.userBehavior.rulesModified++;
        break;
      case 'rule_deleted':
        this.analytics.userBehavior.rulesDeleted++;
        break;
      case 'template_used':
        this.analytics.userBehavior.templatesUsed++;
        break;
    }

    // Track feature usage
    if (!this.analytics.userBehavior.featuresUsed.includes(action)) {
      this.analytics.userBehavior.featuresUsed.push(action);
    }

    // Store additional details
    if (details) {
      this.analytics.userBehavior.preferredSettings = {
        ...this.analytics.userBehavior.preferredSettings,
        ...details,
      };
    }
  }

  /**
   * Update rule statistics
   */
  updateRuleStats(rules: HeaderRule[]): void {
    this.analytics.totalRules = rules.length;
    this.analytics.activeRules = rules.filter(rule => rule.enabled).length;

    // Save analytics to storage for cross-context access
    this.saveAnalytics();
  }

  /**
   * Get analytics data
   */
  getAnalytics(): UsageAnalytics {
    return {
      ...this.analytics,
      ruleEffectiveness: new Map(this.analytics.ruleEffectiveness),
      errorTracking: {
        ...this.analytics.errorTracking,
        errorsByType: new Map(this.analytics.errorTracking.errorsByType),
        errorsByRule: new Map(this.analytics.errorTracking.errorsByRule),
      },
    };
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Performance suggestions
    if (this.analytics.performanceMetrics.averageProcessingTime > 100) {
      suggestions.push({
        type: 'performance',
        priority: 'high',
        title: 'High Processing Time Detected',
        description: 'Rule processing is taking longer than expected',
        impact: 'Reduced browser performance and slower page loads',
        action:
          'Consider optimizing complex rules or reducing the number of active rules',
        estimatedImprovement: 30,
      });
    }

    // Rule optimization suggestions
    const ineffectiveRules = Array.from(
      this.analytics.ruleEffectiveness.values()
    ).filter(rule => rule.successRate < 50 && rule.matchCount > 10);

    if (ineffectiveRules.length > 0) {
      suggestions.push({
        type: 'rule_optimization',
        priority: 'medium',
        title: 'Ineffective Rules Found',
        description: `${ineffectiveRules.length} rules have low success rates`,
        impact: 'Wasted processing time and potential conflicts',
        action: 'Review and optimize or disable underperforming rules',
        estimatedImprovement: 20,
        ruleIds: ineffectiveRules.map(rule => rule.ruleId),
      });
    }

    // Error reduction suggestions
    if (this.analytics.errorTracking.totalErrors > 50) {
      suggestions.push({
        type: 'error_reduction',
        priority: 'high',
        title: 'High Error Rate',
        description: 'Multiple errors detected in rule processing',
        impact: 'Reduced reliability and user experience',
        action: 'Review error logs and fix problematic rules',
        estimatedImprovement: 40,
      });
    }

    // Memory usage suggestions
    if (this.analytics.performanceMetrics.memoryUsage > 50 * 1024 * 1024) {
      // 50MB
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: 'High Memory Usage',
        description: 'Extension is using significant memory',
        impact: 'Potential browser slowdown',
        action: 'Clear cache or reduce the number of active rules',
        estimatedImprovement: 25,
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get rule effectiveness report
   */
  getRuleEffectivenessReport(): {
    topPerforming: RuleEffectiveness[];
    underperforming: RuleEffectiveness[];
    mostUsed: RuleEffectiveness[];
    recentlyUsed: RuleEffectiveness[];
  } {
    try {
      const rules = Array.from(this.analytics.ruleEffectiveness.values());

      return {
        topPerforming: rules
          .filter(rule => rule.matchCount > 5)
          .sort((a, b) => b.impactScore - a.impactScore)
          .slice(0, 10),
        underperforming: rules
          .filter(rule => rule.successRate < 70 && rule.matchCount > 5)
          .sort((a, b) => a.successRate - b.successRate)
          .slice(0, 10),
        mostUsed: rules
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 10),
        recentlyUsed: rules
          .filter(rule => rule.lastUsed instanceof Date) // Ensure lastUsed is a Date
          .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
          .slice(0, 10),
      };
    } catch (error) {
      logger.error('Error generating rule effectiveness report:', error);
      return {
        topPerforming: [],
        underperforming: [],
        mostUsed: [],
        recentlyUsed: [],
      };
    }
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const data = {
      exportDate: new Date().toISOString(),
      sessionDuration: this.analytics.userBehavior.sessionDuration,
      analytics: this.getAnalytics(),
      suggestions: this.getOptimizationSuggestions(),
      effectivenessReport: this.getRuleEffectivenessReport(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear analytics data
   */
  async clearAnalytics(): Promise<void> {
    this.analytics = {
      totalRules: 0,
      activeRules: 0,
      totalRequests: 0,
      modifiedRequests: 0,
      ruleEffectiveness: new Map(),
      performanceMetrics: {
        averageProcessingTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        networkLatency: 0,
        cpuUsage: 0,
        throughput: 0,
        errorRate: 0,
      },
      errorTracking: {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByRule: new Map(),
        recentErrors: [],
        errorTrends: [],
      },
      userBehavior: {
        sessionDuration: 0,
        rulesCreated: 0,
        rulesModified: 0,
        rulesDeleted: 0,
        templatesUsed: 0,
        featuresUsed: [],
        preferredSettings: {},
        workflowPatterns: [],
      },
    };

    await ChromeApiUtils.storage.local.remove(['analytics']);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.metricsInterval && typeof window !== 'undefined') {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    this.saveAnalytics();
  }
}

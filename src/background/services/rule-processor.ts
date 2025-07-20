/**
 * Rule processing and analysis service
 */

import { STORAGE_KEYS } from '@/config/constants';
import { VariableResolver } from '@/lib/core/variable-resolver';
import { getAllVariables } from '@/lib/core/variable-storage/utils/storageUtils';
import type { HeaderRule, RuleCondition } from '@/shared/types/rules';
import type { VariableContext, Variable } from '@/shared/types/variables';
import { ChromeApiUtils } from '@/shared/utils/chrome-api';
import { loggers } from '@/shared/utils/debug';

import type {
  RequestData,
  AnalysisResult,
  TestRuleMatchResult,
  MatchedRule,
  HeaderModification,
  RuleMatchResult,
  UrlPattern,
  UrlMatchResult,
  DomainMatchResult,
  PathMatchResult,
  QueryMatchResult,
} from '../types/service-worker';

// Get logger for this module
const logger = loggers.shared;

// Rule processor specific interfaces
interface RulePerformanceStats {
  ruleId: string;
  matchCount: number;
  averageExecutionTime: number;
  lastMatched: Date | null;
  errorCount: number;
  lastError: string | null;
}

export class RuleProcessor {
  /**
   * Analyze a network request against active rules
   */
  static async analyzeRequest(
    requestData: RequestData,
    rules: Record<string, HeaderRule>,
    activeProfile: string
  ): Promise<AnalysisResult> {
    const startTime = performance.now();

    // Get active rules for current profile
    const activeRules = Object.values(rules).filter(rule => {
      if (!rule.enabled) return false;

      if (activeProfile === 'unassigned') {
        // When "unassigned" is selected, only include rules without profileId
        return !rule.profileId;
      } else {
        // Normal profile filtering: include rules that belong to the active profile
        // Also exclude unassigned rules when a specific profile is active
        return rule.profileId === activeProfile;
      }
    });

    const matchedRules: MatchedRule[] = [];
    const headerModifications: HeaderModification[] = [];

    // Analyze each rule against the request
    for (const rule of activeRules) {
      const matchResult = await this.analyzeRuleMatch(rule, requestData);

      if (matchResult.matches) {
        matchedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matchScore: matchResult.score,
          executionTime: matchResult.executionTime,
          priority: rule.priority,
        });

        // Analyze header modifications
        if (rule.headers && rule.headers.length > 0) {
          for (const header of rule.headers) {
            headerModifications.push({
              ruleId: rule.id,
              ruleName: rule.name,
              headerName: header.name,
              headerValue: header.value,
              operation: header.operation,
              target: header.target,
            });
          }
        }
      }
    }

    const executionTime = performance.now() - startTime;

    // Update rule performance stats
    await this.updateRulePerformanceStats(matchedRules, executionTime);

    return {
      url: requestData.url,
      method: requestData.method,
      matchedRules,
      headerModifications,
      executionTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test a specific rule against a URL and request data
   */
  static async testRuleMatch(
    ruleId: string,
    url: string,
    requestData: RequestData,
    rules: Record<string, HeaderRule>
  ): Promise<TestRuleMatchResult> {
    const rule = rules[ruleId];
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const testRequestData = {
      ...requestData,
      url,
      method: requestData?.method || 'GET',
      headers: requestData?.headers || {},
    };

    const matchResult = await this.analyzeRuleMatch(rule, testRequestData);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      testUrl: url,
      matches: matchResult.matches,
      matchScore: matchResult.score,
      executionTime: matchResult.executionTime,
      matchDetails: matchResult.matchDetails,
      appliedHeaders: matchResult.matches ? rule.headers : [],
    };
  }

  /**
   * Analyze if a rule matches a request
   */
  private static async analyzeRuleMatch(
    rule: HeaderRule,
    requestData: RequestData
  ): Promise<RuleMatchResult> {
    return await this.analyzeRequestWithVariables(rule, requestData);
  }

  /**
   * Enhanced request analysis with variable resolution
   */
  private static async analyzeRequestWithVariables(
    rule: HeaderRule,
    requestData: RequestData
  ): Promise<RuleMatchResult> {
    const startTime = performance.now();

    try {
      // Build variable context with request information
      const contextData: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        tabId?: number;
      } = {
        url: requestData.url,
        method: requestData.method,
      };

      if (requestData.headers) {
        contextData.headers = requestData.headers;
      }

      if (requestData.tabId) {
        contextData.tabId = requestData.tabId;
      }

      const context = await this.buildVariableContext(contextData);

      // Basic URL pattern matching
      const urlMatches = this.matchUrlPattern(rule.pattern, requestData.url);

      if (!urlMatches.matches) {
        return {
          matches: false,
          score: 0,
          executionTime: performance.now() - startTime,
          matchDetails: urlMatches,
        };
      }

      // Analyze header modifications with variable resolution
      const headerAnalysis = [];
      if (rule.headers && rule.headers.length > 0) {
        for (const header of rule.headers) {
          let resolvedValue = header.value;
          let resolutionError = null;

          if (header.operation !== 'remove' && header.value) {
            try {
              const cacheKey = `analysis_${rule.id}_${header.name}_${header.value}`;
              resolvedValue = await this.resolveHeaderValue(
                header.value,
                context,
                cacheKey
              );
            } catch (error) {
              resolutionError =
                error instanceof Error ? error.message : 'Unknown error';
              logger.warn(
                `Variable resolution failed for header ${header.name}:`,
                error
              );
            }
          }

          headerAnalysis.push({
            name: header.name,
            originalValue: header.value,
            resolvedValue,
            operation: header.operation,
            target: header.target,
            resolutionError,
          });
        }
      }

      // Check conditions if they exist
      if (rule.conditions && rule.conditions.length > 0) {
        const conditionsMatch = await this.evaluateRuleConditions(
          rule.conditions,
          requestData
        );

        if (!conditionsMatch) {
          return {
            matches: false,
            score: urlMatches.score * 0.5, // Partial match
            executionTime: performance.now() - startTime,
            matchDetails: { ...urlMatches, conditionsMatch: false },
            headerAnalysis,
          };
        }
      }

      return {
        matches: true,
        score: urlMatches.score,
        executionTime: performance.now() - startTime,
        matchDetails: { ...urlMatches, conditionsMatch: true },
        headerAnalysis,
        variableContext: {
          globalVariablesCount: context.globalVariables.length,
          profileVariablesCount: context.profileVariables.length,
          requestContextAvailable: !!context.requestContext,
        },
      };
    } catch (error) {
      logger.error('Error analyzing request with variables:', error);
      return {
        matches: false,
        score: 0,
        executionTime: performance.now() - startTime,
        matchDetails: {
          matches: false,
          score: 0,
          matchedParts: {},
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Build variable context for rule processing
   */
  private static async buildVariableContext(requestDetails?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    tabId?: number;
  }): Promise<VariableContext> {
    // Get current variables from storage
    const variablesData = await getAllVariables();
    const globalVariables = variablesData.global || {};
    const profileVariables = variablesData.profiles || {};

    // Get active profile
    const profileData = await ChromeApiUtils.storage.sync.get([
      STORAGE_KEYS.ACTIVE_PROFILE,
    ]);
    const activeProfile =
      ((profileData as Record<string, unknown>)[
        STORAGE_KEYS.ACTIVE_PROFILE
      ] as string) || 'dev-profile';

    const context: VariableContext = {
      systemVariables: [], // System variables are handled by VariableResolver
      globalVariables: Object.values(globalVariables).filter(
        (v: Variable) => v.enabled !== false
      ),
      profileVariables: Object.values(
        profileVariables[activeProfile] || {}
      ).filter((v: Variable) => v.enabled !== false),
      ruleVariables: [], // Rule-specific variables would be added per rule
      profileId: activeProfile,
    };

    // Add request context if available
    if (requestDetails) {
      context.requestContext =
        VariableResolver.buildRequestContext(requestDetails);
    }

    return context;
  }

  /**
   * Resolve variables in a header value
   */
  private static async resolveHeaderValue(
    value: string,
    context: VariableContext,
    _cacheKey?: string
  ): Promise<string> {
    // Check if value contains variables
    const parseResult = VariableResolver.parseTemplate(value);

    if (!parseResult.variables.length && !parseResult.functions.length) {
      return value;
    }

    try {
      const result = await VariableResolver.resolve(value, context);

      if (result.success && result.value) {
        let finalValue = result.value;

        // Check if the resolved value still contains variables/functions and resolve recursively
        if (finalValue.includes('${') || finalValue.includes('{{')) {
          const recursiveResult = await VariableResolver.resolve(
            finalValue,
            context
          );

          if (recursiveResult.success && recursiveResult.value) {
            finalValue = recursiveResult.value;
          }
        }

        return finalValue;
      } else {
        logger.warn(`Variable resolution failed for "${value}":`, result.error);
        return value; // Return original value on failure
      }
    } catch (error) {
      logger.error(`Variable resolution error for "${value}":`, error);
      return value; // Return original value on error
    }
  }

  /**
   * Match URL patterns
   */
  private static matchUrlPattern(
    pattern: UrlPattern,
    url: string
  ): UrlMatchResult {
    try {
      const urlObj = new URL(url);
      let score = 0;
      const matchedParts: UrlMatchResult['matchedParts'] = {};

      // Protocol matching
      if (pattern.protocol && pattern.protocol !== '*') {
        if (urlObj.protocol === `${pattern.protocol}:`) {
          matchedParts.protocol = true;
          score += 0.1;
        } else {
          return { matches: false, score: 0, matchedParts };
        }
      } else {
        matchedParts.protocol = true;
        score += 0.1;
      }

      // Domain matching (supports wildcards)
      if (pattern.domain) {
        const domainMatch = this.matchDomainPattern(
          pattern.domain,
          urlObj.hostname
        );
        if (domainMatch.matches) {
          matchedParts.domain = true;
          score += domainMatch.score * 0.4;
        } else {
          return { matches: false, score: 0, matchedParts };
        }
      }

      // Path matching (supports wildcards)
      if (pattern.path && pattern.path !== '/*') {
        const pathMatch = this.matchPathPattern(pattern.path, urlObj.pathname);
        if (pathMatch.matches) {
          matchedParts.path = true;
          score += pathMatch.score * 0.3;
        } else {
          return { matches: false, score: 0, matchedParts };
        }
      } else {
        matchedParts.path = true;
        score += 0.3;
      }

      // Port matching
      if (pattern.port) {
        const port =
          urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
        if (pattern.port === port) {
          matchedParts.port = true;
          score += 0.1;
        } else {
          return { matches: false, score: 0, matchedParts };
        }
      } else {
        matchedParts.port = true;
        score += 0.1;
      }

      // Query matching
      if (pattern.query) {
        const queryMatch = this.matchQueryPattern(pattern.query, urlObj.search);
        if (queryMatch.matches) {
          matchedParts.query = true;
          score += queryMatch.score * 0.1;
        } else {
          return { matches: false, score: 0, matchedParts };
        }
      } else {
        matchedParts.query = true;
        score += 0.1;
      }

      return {
        matches: true,
        score: Math.min(score, 1.0),
        matchedParts,
      };
    } catch (error) {
      logger.error('Error matching URL pattern:', error);
      return { matches: false, score: 0, matchedParts: {} };
    }
  }

  /**
   * Match domain patterns with wildcards
   */
  private static matchDomainPattern(
    pattern: string,
    domain: string
  ): DomainMatchResult {
    if (pattern === '*' || pattern === domain) {
      return { matches: true, score: 1.0 };
    }

    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');

      if (regex.test(domain)) {
        // Calculate score based on specificity
        const wildcardCount = (pattern.match(/\*/g) || []).length;
        const score = Math.max(0.3, 1.0 - wildcardCount * 0.2);
        return { matches: true, score };
      }
    }

    return { matches: false, score: 0 };
  }

  /**
   * Match path patterns with wildcards
   */
  private static matchPathPattern(
    pattern: string,
    path: string
  ): PathMatchResult {
    if (pattern === '/*' || pattern === path) {
      return { matches: true, score: 1.0 };
    }

    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);

      if (regex.test(path)) {
        const wildcardCount = (pattern.match(/\*/g) || []).length;
        const score = Math.max(0.3, 1.0 - wildcardCount * 0.1);
        return { matches: true, score };
      }
    }

    return { matches: false, score: 0 };
  }

  /**
   * Match query patterns
   */
  private static matchQueryPattern(
    pattern: string,
    query: string
  ): QueryMatchResult {
    if (!pattern) {
      return { matches: true, score: 1.0 };
    }

    if (pattern === query) {
      return { matches: true, score: 1.0 };
    }

    // Simple contains matching for now
    if (query.includes(pattern)) {
      return { matches: true, score: 0.7 };
    }

    return { matches: false, score: 0 };
  }

  /**
   * Evaluate rule conditions
   */
  private static async evaluateRuleConditions(
    conditions: RuleCondition[],
    requestData: RequestData
  ): Promise<boolean> {
    try {
      // For now, implement basic condition evaluation
      // This can be expanded to use the existing conditional rule engine

      for (const condition of conditions) {
        const result = await this.evaluateCondition(condition, requestData);
        if (!result) {
          return false; // All conditions must pass (AND logic for now)
        }
      }

      return true;
    } catch (error) {
      logger.error('Error evaluating rule conditions:', error);
      return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  private static async evaluateCondition(
    condition: RuleCondition,
    requestData: RequestData
  ): Promise<boolean> {
    try {
      const conditionValue = String(condition.value);

      switch (condition.type) {
        case 'requestMethod':
          return condition.operator === 'equals'
            ? requestData.method === conditionValue
            : requestData.method
                .toLowerCase()
                .includes(conditionValue.toLowerCase());

        case 'header': {
          const headerValue = requestData.headers?.[conditionValue];
          if (condition.operator === 'exists') {
            return !!headerValue;
          }
          if (condition.operator === 'equals') {
            return headerValue === conditionValue;
          }
          if (condition.operator === 'contains') {
            return headerValue?.includes(conditionValue) || false;
          }
          break;
        }

        case 'url': {
          if (condition.operator === 'contains') {
            return requestData.url.includes(conditionValue);
          }
          if (condition.operator === 'regex') {
            const regex = new RegExp(conditionValue);
            return regex.test(requestData.url);
          }
          break;
        }

        default:
          logger.warn(`Unknown condition type: ${condition.type}`);
          return true; // Default to true for unknown conditions
      }

      return true;
    } catch (error) {
      logger.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Update rule performance statistics
   */
  private static async updateRulePerformanceStats(
    matchedRules: MatchedRule[],
    totalExecutionTime: number
  ): Promise<void> {
    try {
      if (matchedRules.length === 0) return;

      const data = await ChromeApiUtils.storage.sync.get([STORAGE_KEYS.STATS]);
      const stats =
        ((data as Record<string, unknown>)[STORAGE_KEYS.STATS] as Record<
          string,
          RulePerformanceStats
        >) || {};

      for (const ruleMatch of matchedRules) {
        const ruleId = ruleMatch.ruleId;

        if (!stats[ruleId]) {
          stats[ruleId] = {
            ruleId,
            matchCount: 0,
            averageExecutionTime: 0,
            lastMatched: null,
            errorCount: 0,
            lastError: null,
          };
        }

        // Store reference with null check
        const ruleStats = stats[ruleId];
        if (!ruleStats) continue;

        // Update stats
        ruleStats.matchCount++;
        ruleStats.lastMatched = new Date();

        // Update average execution time
        const currentAvg = ruleStats.averageExecutionTime || 0;
        const count = ruleStats.matchCount;
        const executionTime =
          ruleMatch.executionTime || totalExecutionTime / matchedRules.length;
        ruleStats.averageExecutionTime =
          (currentAvg * (count - 1) + executionTime) / count;
      }

      await ChromeApiUtils.storage.sync.set({
        [STORAGE_KEYS.STATS]: stats,
      });
    } catch (error) {
      logger.error('Failed to update rule performance stats:', error);
    }
  }
}

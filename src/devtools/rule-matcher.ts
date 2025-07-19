// Rule matching engine for DevTools
import type { ResourceType } from '@/config/constants';
import type {
  HeaderRule,
  URLPattern,
  RuleCondition,
} from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export interface RequestData {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  status?: number;
  response?: {
    status?: number;
  };
}

export interface MatchDetails {
  protocol?: boolean;
  domain?: boolean;
  path?: boolean;
  query?: boolean;
  port?: boolean;
  conditionsMatch?: boolean;
  resourceTypeMatch?: boolean;
  error?: string;
}

export interface RuleMatchResult {
  matches: boolean;
  score: number;
  executionTime: number;
  matchDetails: {
    protocol?: boolean;
    domain?: boolean;
    path?: boolean;
    query?: boolean;
    port?: boolean;
    conditionsMatch?: boolean;
    resourceTypeMatch?: boolean;
    error?: string;
  };
}

export interface RequestAnalysis {
  url: string;
  method: string;
  matchedRules: Array<{
    ruleId: string;
    ruleName: string;
    matchScore: number;
    executionTime: number;
    priority: number;
  }>;
  headerModifications: Array<{
    ruleId: string;
    ruleName: string;
    headerName: string;
    headerValue: string;
    operation: string;
    target: string;
  }>;
  executionTime: number;
  timestamp: string;
}

export class RuleMatcher {
  private performanceCache = new Map<string, number>();

  /**
   * Analyze a network request against all active rules
   */
  async analyzeRequest(
    requestData: RequestData,
    activeRules: HeaderRule[]
  ): Promise<RequestAnalysis> {
    const startTime = performance.now();

    const matchedRules: RequestAnalysis['matchedRules'] = [];
    const headerModifications: RequestAnalysis['headerModifications'] = [];

    // Sort rules by priority (higher priority first)
    const sortedRules = [...activeRules].sort(
      (a, b) => (b.priority || 1) - (a.priority || 1)
    );

    for (const rule of sortedRules) {
      const matchResult = await this.matchRule(rule, requestData);

      if (matchResult.matches) {
        matchedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matchScore: matchResult.score,
          executionTime: matchResult.executionTime,
          priority: rule.priority || 1,
        });

        // Collect header modifications
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

      // Cache performance data
      this.performanceCache.set(rule.id, matchResult.executionTime);
    }

    const executionTime = performance.now() - startTime;

    return {
      url: requestData.url,
      method: requestData.method || 'GET',
      matchedRules,
      headerModifications,
      executionTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test a specific rule against request data
   */
  async matchRule(
    rule: HeaderRule,
    requestData: RequestData
  ): Promise<RuleMatchResult> {
    const startTime = performance.now();

    try {
      // Check URL pattern matching
      const urlMatches = this.matchUrlPattern(rule.pattern, requestData.url);

      if (!urlMatches.matches) {
        return {
          matches: false,
          score: 0,
          executionTime: performance.now() - startTime,
          matchDetails: urlMatches.matchDetails,
        };
      }

      // Check resource type filtering
      if (rule.resourceTypes && rule.resourceTypes.length > 0) {
        const resourceType = this.inferResourceType(requestData);
        if (!rule.resourceTypes.includes(resourceType)) {
          return {
            matches: false,
            score: urlMatches.score * 0.3,
            executionTime: performance.now() - startTime,
            matchDetails: {
              ...urlMatches.matchDetails,
              resourceTypeMatch: false,
            },
          };
        }
      }

      // Check conditions if they exist
      if (rule.conditions && rule.conditions.length > 0) {
        const conditionsMatch = await this.evaluateConditions(
          rule.conditions,
          requestData
        );

        if (!conditionsMatch) {
          return {
            matches: false,
            score: urlMatches.score * 0.5,
            executionTime: performance.now() - startTime,
            matchDetails: {
              ...urlMatches.matchDetails,
              conditionsMatch: false,
            },
          };
        }
      }

      return {
        matches: true,
        score: urlMatches.score,
        executionTime: performance.now() - startTime,
        matchDetails: { ...urlMatches.matchDetails, conditionsMatch: true },
      };
    } catch (error) {
      logger.error('Error matching rule:', error);
      return {
        matches: false,
        score: 0,
        executionTime: performance.now() - startTime,
        matchDetails: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Match URL pattern with support for wildcards and regex
   */
  private matchUrlPattern(
    pattern: URLPattern,
    url: string
  ): {
    matches: boolean;
    score: number;
    matchDetails: MatchDetails;
  } {
    try {
      const urlObj = new URL(url);
      let score = 0;
      const matchDetails: MatchDetails = {};

      // Protocol matching
      if (pattern.protocol && pattern.protocol !== '*') {
        if (urlObj.protocol === `${pattern.protocol}:`) {
          matchDetails.protocol = true;
          score += 0.1;
        } else {
          return { matches: false, score: 0, matchDetails };
        }
      } else {
        matchDetails.protocol = true;
        score += 0.1;
      }

      // Domain matching
      if (pattern.domain) {
        const domainMatch = this.matchDomainPattern(
          pattern.domain,
          urlObj.hostname
        );
        if (domainMatch.matches) {
          matchDetails.domain = true;
          score += domainMatch.score * 0.4;
        } else {
          return { matches: false, score: 0, matchDetails };
        }
      }

      // Path matching
      if (pattern.path && pattern.path !== '/*') {
        const pathMatch = this.matchPathPattern(pattern.path, urlObj.pathname);
        if (pathMatch.matches) {
          matchDetails.path = true;
          score += pathMatch.score * 0.3;
        } else {
          return { matches: false, score: 0, matchDetails };
        }
      } else {
        matchDetails.path = true;
        score += 0.3;
      }

      // Port matching
      if (pattern.port) {
        const port =
          urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
        if (pattern.port === port) {
          matchDetails.port = true;
          score += 0.1;
        } else {
          return { matches: false, score: 0, matchDetails };
        }
      } else {
        matchDetails.port = true;
        score += 0.1;
      }

      // Query matching
      if (pattern.query) {
        const queryMatch = this.matchQueryPattern(pattern.query, urlObj.search);
        if (queryMatch.matches) {
          matchDetails.query = true;
          score += queryMatch.score * 0.1;
        } else {
          return { matches: false, score: 0, matchDetails };
        }
      } else {
        matchDetails.query = true;
        score += 0.1;
      }

      return {
        matches: true,
        score: Math.min(score, 1.0),
        matchDetails,
      };
    } catch (error) {
      logger.error('Error matching URL pattern:', error);
      return {
        matches: false,
        score: 0,
        matchDetails: { error: 'Invalid URL' },
      };
    }
  }

  /**
   * Match domain pattern with wildcard support
   */
  private matchDomainPattern(
    pattern: string,
    domain: string
  ): {
    matches: boolean;
    score: number;
  } {
    if (pattern === '*' || pattern === domain) {
      return { matches: true, score: 1.0 };
    }

    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`, 'i');

      if (regex.test(domain)) {
        const wildcardCount = (pattern.match(/\*/g) || []).length;
        const score = Math.max(0.3, 1.0 - wildcardCount * 0.2);
        return { matches: true, score };
      }
    }

    return { matches: false, score: 0 };
  }

  /**
   * Match path pattern with wildcard support
   */
  private matchPathPattern(
    pattern: string,
    path: string
  ): {
    matches: boolean;
    score: number;
  } {
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
   * Match query pattern
   */
  private matchQueryPattern(
    pattern: string,
    query: string
  ): {
    matches: boolean;
    score: number;
  } {
    if (!pattern) {
      return { matches: true, score: 1.0 };
    }

    if (pattern === query) {
      return { matches: true, score: 1.0 };
    }

    if (query.includes(pattern)) {
      return { matches: true, score: 0.7 };
    }

    return { matches: false, score: 0 };
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateConditions(
    conditions: RuleCondition[],
    requestData: RequestData
  ): Promise<boolean> {
    try {
      for (const condition of conditions) {
        const result = await this.evaluateCondition(condition, requestData);
        if (condition.negate ? result : !result) {
          return false; // AND logic - all conditions must pass
        }
      }
      return true;
    } catch (error) {
      logger.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(
    condition: RuleCondition,
    requestData: RequestData
  ): Promise<boolean> {
    try {
      const { type, operator, value, caseSensitive = false } = condition;

      switch (type) {
        case 'requestMethod': {
          const method = caseSensitive
            ? requestData.method
            : requestData.method?.toLowerCase();
          const expectedMethod = caseSensitive
            ? value
            : String(value).toLowerCase();

          switch (operator) {
            case 'equals':
              return method === expectedMethod;
            case 'contains':
              return method?.includes(String(expectedMethod)) || false;
            default:
              return false;
          }
        }

        case 'header': {
          const headerName = String(value);
          const headerValue = requestData.headers?.[headerName];

          switch (operator) {
            case 'exists':
              return !!headerValue;
            case 'equals':
              return headerValue === value;
            case 'contains':
              return headerValue?.includes(String(value)) || false;
            case 'regex':
              try {
                const regex = new RegExp(
                  String(value),
                  caseSensitive ? '' : 'i'
                );
                return regex.test(headerValue || '');
              } catch {
                return false;
              }
            default:
              return false;
          }
        }

        case 'url': {
          const url = requestData.url || '';
          const urlValue = caseSensitive ? url : url.toLowerCase();
          const expectedUrl = caseSensitive
            ? String(value)
            : String(value).toLowerCase();

          switch (operator) {
            case 'equals':
              return urlValue === expectedUrl;
            case 'contains':
              return urlValue.includes(expectedUrl);
            case 'regex':
              try {
                const regex = new RegExp(
                  String(value),
                  caseSensitive ? '' : 'i'
                );
                return regex.test(url);
              } catch {
                return false;
              }
            default:
              return false;
          }
        }

        case 'responseStatus': {
          const status = requestData.status || requestData.response?.status;
          const statusValue = Number(value);

          switch (operator) {
            case 'equals':
              return status === statusValue;
            case 'greater':
              return status != null && status > statusValue;
            case 'less':
              return status != null && status < statusValue;
            default:
              return false;
          }
        }

        case 'userAgent': {
          const userAgent = requestData.headers?.['user-agent'] || '';
          const uaValue = caseSensitive ? userAgent : userAgent.toLowerCase();
          const expectedUA = caseSensitive
            ? String(value)
            : String(value).toLowerCase();

          switch (operator) {
            case 'equals':
              return uaValue === expectedUA;
            case 'contains':
              return uaValue.includes(expectedUA);
            case 'regex':
              try {
                const regex = new RegExp(
                  String(value),
                  caseSensitive ? '' : 'i'
                );
                return regex.test(userAgent);
              } catch {
                return false;
              }
            default:
              return false;
          }
        }

        case 'cookie': {
          const cookieHeader = requestData.headers?.['cookie'] || '';
          const cookieName = String(value);

          switch (operator) {
            case 'exists':
              return cookieHeader.includes(`${cookieName}=`);
            case 'equals':
            case 'contains': {
              // Extract cookie value and compare
              const cookieMatch = cookieHeader.match(
                new RegExp(`${cookieName}=([^;]*)`)
              );
              if (!cookieMatch) return false;

              const cookieValue = cookieMatch[1];
              return operator === 'equals'
                ? cookieValue === String(value)
                : cookieValue?.includes(String(value)) || false;
            }
            default:
              return false;
          }
        }

        case 'time': {
          const now = new Date();
          const timeValue = String(value);

          // Simple time-based conditions (can be expanded)
          switch (operator) {
            case 'equals':
              return now.getHours().toString() === timeValue;
            case 'greater':
              return now.getHours() > Number(timeValue);
            case 'less':
              return now.getHours() < Number(timeValue);
            default:
              return false;
          }
        }

        default:
          logger.warn(`Unknown condition type: ${type}`);
          return true; // Default to true for unknown conditions
      }
    } catch (error) {
      logger.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Infer resource type from request data
   */
  private inferResourceType(requestData: RequestData): ResourceType {
    const url = requestData.url || '';
    const contentType = requestData.headers?.['content-type'] || '';

    // Check for common patterns
    if (url.includes('/api/') || contentType.includes('application/json')) {
      return 'xmlhttprequest';
    }

    if (contentType.includes('text/html')) {
      return 'main_frame';
    }

    if (contentType.includes('text/css') || url.endsWith('.css')) {
      return 'stylesheet';
    }

    if (contentType.includes('javascript') || url.endsWith('.js')) {
      return 'script';
    }

    if (
      contentType.includes('image/') ||
      /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url)
    ) {
      return 'image';
    }

    if (contentType.includes('font/') || /\.(woff|woff2|ttf|otf)$/i.test(url)) {
      return 'font';
    }

    if (contentType.includes('video/') || contentType.includes('audio/')) {
      return 'media';
    }

    return 'object';
  }

  /**
   * Get performance statistics for rules
   */
  getPerformanceStats(): Map<string, number> {
    return new Map(this.performanceCache);
  }

  /**
   * Clear performance cache
   */
  clearPerformanceCache(): void {
    this.performanceCache.clear();
  }
}

// Export singleton instance
export const ruleMatcher = new RuleMatcher();

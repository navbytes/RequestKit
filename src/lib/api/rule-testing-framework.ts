import { AdvancedPatternMatcher } from '@/lib/core/advanced-pattern-matcher';
import {
  ConditionalRuleEngine,
  type RuleEvaluationContext,
} from '@/lib/engines/conditional-rule-engine';
import type {
  HeaderRule,
  ConditionalRule,
  RuleTestResult,
  URLPattern,
  HeaderEntry,
} from '@/shared/types/rules';

/**
 * Rule Testing Framework for validating and testing header rules
 */
export class RuleTestingFramework {
  /**
   * Test a rule against a mock request
   */
  static async testRule(
    rule: HeaderRule,
    testContext: TestContext
  ): Promise<RuleTestResult> {
    const startTime = performance.now();

    try {
      // Test URL pattern matching
      const patternMatch = AdvancedPatternMatcher.matchAdvancedPattern(
        testContext.url,
        rule.pattern
      );

      // Convert MatchResult to PatternMatchResult
      const matchDetails = {
        matches: patternMatch.matches,
        score: patternMatch.matches ? 1 : 0,
        matchedParts: {
          protocol: true,
          domain: true,
          path: true,
          query: true,
          port: true,
        },
      };

      if (!patternMatch.matches) {
        return {
          rule,
          testUrl: testContext.url,
          matches: false,
          appliedHeaders: [],
          matchDetails,
          executionTime: performance.now() - startTime,
          errors: [],
          warnings: [],
        };
      }

      // Test conditional logic if it's a conditional rule
      let conditionsPassed = true;
      const conditionErrors: string[] = [];

      if (
        'conditions' in rule &&
        rule.conditions &&
        rule.conditions.length > 0
      ) {
        const conditionalRule = rule as ConditionalRule;
        const evaluationContext: RuleEvaluationContext = {
          url: testContext.url,
          ...(testContext.requestMethod && {
            requestMethod: testContext.requestMethod,
          }),
          ...(testContext.userAgent && { userAgent: testContext.userAgent }),
          ...(testContext.responseStatus && {
            responseStatus: testContext.responseStatus,
          }),
          ...(testContext.requestHeaders && {
            requestHeaders: testContext.requestHeaders,
          }),
          ...(testContext.cookies && { cookies: testContext.cookies }),
          ...(testContext.currentTime && {
            currentTime: testContext.currentTime,
          }),
        };

        try {
          conditionsPassed = ConditionalRuleEngine.evaluateRule(
            conditionalRule,
            evaluationContext
          );
        } catch (error) {
          conditionsPassed = false;
          conditionErrors.push(
            `Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Determine which headers would be applied
      const appliedHeaders = conditionsPassed ? rule.headers : [];

      // Check for potential conflicts with existing headers
      const warnings: string[] = [];
      if (testContext.existingHeaders) {
        appliedHeaders.forEach(header => {
          if (testContext.existingHeaders?.[header.name.toLowerCase()]) {
            warnings.push(
              `Header "${header.name}" would override existing header`
            );
          }
        });
      }

      return {
        rule,
        testUrl: testContext.url,
        matches: conditionsPassed,
        appliedHeaders,
        matchDetails,
        executionTime: performance.now() - startTime,
        errors: conditionErrors,
        warnings,
      };
    } catch (error) {
      return {
        rule,
        testUrl: testContext.url,
        matches: false,
        appliedHeaders: [],
        matchDetails: { matches: false, score: 0, matchedParts: {} },
        executionTime: performance.now() - startTime,
        errors: [
          `Rule testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
      };
    }
  }

  /**
   * Test multiple rules against a context
   */
  static async testMultipleRules(
    rules: HeaderRule[],
    testContext: TestContext
  ): Promise<RuleTestResult[]> {
    const results: RuleTestResult[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = await this.testRule(rule, testContext);
      results.push(result);
    }

    return results;
  }

  /**
   * Detect conflicts between rules
   */
  static detectRuleConflicts(rules: HeaderRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    const enabledRules = rules.filter(rule => rule.enabled);

    for (let i = 0; i < enabledRules.length; i++) {
      for (let j = i + 1; j < enabledRules.length; j++) {
        const rule1 = enabledRules[i];
        const rule2 = enabledRules[j];

        if (rule1 && rule2) {
          const conflict = this.checkRuleConflict(rule1, rule2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two rules conflict
   */
  private static checkRuleConflict(
    rule1: HeaderRule,
    rule2: HeaderRule
  ): RuleConflict | null {
    // Check if rules have overlapping patterns
    const patternsOverlap = this.checkPatternOverlap(
      rule1.pattern,
      rule2.pattern
    );
    if (!patternsOverlap) return null;

    // Check for header conflicts
    const headerConflicts: HeaderConflict[] = [];

    rule1.headers.forEach(header1 => {
      rule2.headers.forEach(header2 => {
        if (
          header1.name.toLowerCase() === header2.name.toLowerCase() &&
          header1.target === header2.target
        ) {
          const conflictType = this.getHeaderConflictType(header1, header2);
          if (conflictType) {
            headerConflicts.push({
              headerName: header1.name,
              rule1Operation: header1.operation,
              rule2Operation: header2.operation,
              rule1Value: header1.value,
              rule2Value: header2.value,
              conflictType,
              severity: this.getConflictSeverity(conflictType),
            });
          }
        }
      });
    });

    if (headerConflicts.length === 0) return null;

    return {
      rule1: rule1.id,
      rule2: rule2.id,
      rule1Name: rule1.name,
      rule2Name: rule2.name,
      headerConflicts,
      severity: Math.max(...headerConflicts.map(c => c.severity)),
      resolution: this.suggestConflictResolution(headerConflicts),
    };
  }

  /**
   * Check if two URL patterns overlap
   */
  private static checkPatternOverlap(
    pattern1: URLPattern,
    pattern2: URLPattern
  ): boolean {
    // Simple overlap check - in a real implementation, this would be more sophisticated
    if (pattern1.domain === '*' || pattern2.domain === '*') return true;
    if (pattern1.domain === pattern2.domain) return true;

    // Check for wildcard subdomain overlaps
    if (pattern1.domain.startsWith('*.') || pattern2.domain.startsWith('*.')) {
      const domain1 = pattern1.domain.replace('*.', '');
      const domain2 = pattern2.domain.replace('*.', '');
      return (
        domain1 === domain2 ||
        pattern1.domain === domain2 ||
        pattern2.domain === domain1
      );
    }

    return false;
  }

  /**
   * Get header conflict type
   */
  private static getHeaderConflictType(
    header1: HeaderEntry,
    header2: HeaderEntry
  ): HeaderConflictType | null {
    if (header1.operation === 'set' && header2.operation === 'set') {
      return header1.value === header2.value ? 'duplicate' : 'override';
    }
    if (header1.operation === 'remove' && header2.operation === 'set') {
      return 'remove_vs_set';
    }
    if (header1.operation === 'set' && header2.operation === 'remove') {
      return 'set_vs_remove';
    }
    if (header1.operation === 'append' && header2.operation === 'set') {
      return 'append_vs_set';
    }
    return null;
  }

  /**
   * Get conflict severity (1-3, where 3 is most severe)
   */
  private static getConflictSeverity(conflictType: HeaderConflictType): number {
    const severityMap: Record<HeaderConflictType, number> = {
      duplicate: 1,
      override: 2,
      remove_vs_set: 3,
      set_vs_remove: 3,
      append_vs_set: 2,
    };
    return severityMap[conflictType] || 1;
  }

  /**
   * Suggest conflict resolution
   */
  private static suggestConflictResolution(
    conflicts: HeaderConflict[]
  ): string[] {
    const suggestions: string[] = [];

    conflicts.forEach(conflict => {
      switch (conflict.conflictType) {
        case 'duplicate':
          suggestions.push(
            `Remove duplicate header "${conflict.headerName}" from one of the rules`
          );
          break;
        case 'override':
          suggestions.push(
            `Adjust rule priorities or merge values for header "${conflict.headerName}"`
          );
          break;
        case 'remove_vs_set':
        case 'set_vs_remove':
          suggestions.push(
            `Resolve conflicting operations for header "${conflict.headerName}" - one rule sets while another removes`
          );
          break;
        case 'append_vs_set':
          suggestions.push(
            `Consider using append operation in both rules for header "${conflict.headerName}"`
          );
          break;
      }
    });

    return suggestions;
  }

  /**
   * Validate rule performance impact
   */
  static analyzePerformanceImpact(rules: HeaderRule[]): PerformanceAnalysis {
    const analysis: PerformanceAnalysis = {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      conditionalRules: rules.filter(
        r => 'conditions' in r && r.conditions?.length
      ).length,
      regexPatterns: 0,
      complexConditions: 0,
      estimatedImpact: 'low',
      recommendations: [],
    };

    rules.forEach(rule => {
      // Check for regex patterns
      if (
        rule.pattern.domain?.includes('*') ||
        rule.pattern.path?.includes('*')
      ) {
        analysis.regexPatterns++;
      }

      // Check for complex conditions
      if ('conditions' in rule && rule.conditions) {
        const conditionalRule = rule as ConditionalRule;
        conditionalRule.conditions.forEach(condition => {
          if (condition.operator === 'regex') {
            analysis.regexPatterns++;
          }
          if (condition.type === 'time' || condition.type === 'cookie') {
            analysis.complexConditions++;
          }
        });
      }
    });

    // Estimate performance impact
    if (analysis.enabledRules > 50 || analysis.regexPatterns > 10) {
      analysis.estimatedImpact = 'high';
      analysis.recommendations.push(
        'Consider reducing the number of active rules'
      );
      analysis.recommendations.push(
        'Optimize regex patterns for better performance'
      );
    } else if (analysis.enabledRules > 20 || analysis.regexPatterns > 5) {
      analysis.estimatedImpact = 'medium';
      analysis.recommendations.push(
        'Monitor performance with current rule set'
      );
    }

    if (analysis.complexConditions > 5) {
      analysis.recommendations.push(
        'Complex conditions may impact performance'
      );
    }

    return analysis;
  }

  /**
   * Generate test scenarios for a rule
   */
  static generateTestScenarios(rule: HeaderRule): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Basic matching scenario
    scenarios.push({
      name: 'Basic Pattern Match',
      description: 'Test if rule matches its intended pattern',
      context: {
        url: this.generateMatchingUrl(rule.pattern),
        requestMethod: 'GET',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        requestHeaders: {},
      },
      expectedResult: {
        shouldMatch: true,
        expectedHeaders: rule.headers.length,
      },
    });

    // Non-matching scenario
    scenarios.push({
      name: 'Pattern Mismatch',
      description: 'Test that rule does not match unintended patterns',
      context: {
        url: 'https://different-domain.com/path',
        requestMethod: 'GET',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        requestHeaders: {},
      },
      expectedResult: {
        shouldMatch: false,
        expectedHeaders: 0,
      },
    });

    // Conditional scenarios for conditional rules
    if ('conditions' in rule && rule.conditions?.length) {
      scenarios.push({
        name: 'Conditions Met',
        description: 'Test rule when all conditions are satisfied',
        context: {
          url: this.generateMatchingUrl(rule.pattern),
          requestMethod: 'POST',
          userAgent: 'Mozilla/5.0 (Chrome Test)',
          responseStatus: 200,
          requestHeaders: { authorization: 'Bearer token' },
          cookies: { sessionId: 'test123' },
        },
        expectedResult: {
          shouldMatch: true,
          expectedHeaders: rule.headers.length,
        },
      });

      scenarios.push({
        name: 'Conditions Not Met',
        description: 'Test rule when conditions are not satisfied',
        context: {
          url: this.generateMatchingUrl(rule.pattern),
          requestMethod: 'GET',
          userAgent: 'Mozilla/5.0 (Firefox Test)',
          responseStatus: 404,
          requestHeaders: {},
          cookies: {},
        },
        expectedResult: {
          shouldMatch: false,
          expectedHeaders: 0,
        },
      });
    }

    return scenarios;
  }

  /**
   * Generate a URL that matches the given pattern
   */
  private static generateMatchingUrl(pattern: URLPattern): string {
    const protocol =
      pattern.protocol === '*' ? 'https' : pattern.protocol || 'https';
    const domain = pattern.domain.replace('*.', 'test.');
    const path = pattern.path?.replace('*', 'example') || '/';

    return `${protocol}://${domain}${path}`;
  }

  /**
   * Run automated tests for a rule
   */
  static async runAutomatedTests(
    rule: HeaderRule
  ): Promise<AutomatedTestResult> {
    const scenarios = this.generateTestScenarios(rule);
    const results: TestScenarioResult[] = [];

    for (const scenario of scenarios) {
      const testResult = await this.testRule(rule, scenario.context);

      const passed =
        testResult.matches === scenario.expectedResult.shouldMatch &&
        testResult.appliedHeaders.length ===
          scenario.expectedResult.expectedHeaders;

      results.push({
        scenario: scenario.name,
        passed,
        actualResult: {
          matched: testResult.matches,
          headersApplied: testResult.appliedHeaders.length,
          executionTime: testResult.executionTime,
        },
        expectedResult: scenario.expectedResult,
        errors: testResult.errors,
      });
    }

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;

    return {
      rule: rule.id,
      ruleName: rule.name,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: (passedTests / totalTests) * 100,
      results,
      overallPassed: passedTests === totalTests,
    };
  }
}

/**
 * Test context for rule testing
 */
export interface TestContext {
  url: string;
  requestMethod?: string;
  userAgent?: string;
  responseStatus?: number;
  requestHeaders?: Record<string, string>;
  cookies?: Record<string, string>;
  currentTime?: Date;
  existingHeaders?: Record<string, string>;
}

/**
 * Rule conflict detection types
 */
export interface RuleConflict {
  rule1: string;
  rule2: string;
  rule1Name: string;
  rule2Name: string;
  headerConflicts: HeaderConflict[];
  severity: number;
  resolution: string[];
}

export interface HeaderConflict {
  headerName: string;
  rule1Operation: string;
  rule2Operation: string;
  rule1Value: string;
  rule2Value: string;
  conflictType: HeaderConflictType;
  severity: number;
}

export type HeaderConflictType =
  | 'duplicate'
  | 'override'
  | 'remove_vs_set'
  | 'set_vs_remove'
  | 'append_vs_set';

/**
 * Performance analysis types
 */
export interface PerformanceAnalysis {
  totalRules: number;
  enabledRules: number;
  conditionalRules: number;
  regexPatterns: number;
  complexConditions: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

/**
 * Test scenario types
 */
export interface TestScenario {
  name: string;
  description: string;
  context: TestContext;
  expectedResult: {
    shouldMatch: boolean;
    expectedHeaders: number;
  };
}

export interface TestScenarioResult {
  scenario: string;
  passed: boolean;
  actualResult: {
    matched: boolean;
    headersApplied: number;
    executionTime: number;
  };
  expectedResult: {
    shouldMatch: boolean;
    expectedHeaders: number;
  };
  errors: string[];
}

export interface AutomatedTestResult {
  rule: string;
  ruleName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  results: TestScenarioResult[];
  overallPassed: boolean;
}

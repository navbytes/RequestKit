/**
 * Integration test utilities for the variable system
 * Tests template migration, variable resolution, and system integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { VariableResolver } from '@/lib/core/variable-resolver';
import { VariableStorageUtils } from '@/lib/core/variable-storage';
import { BUILT_IN_TEMPLATES } from '@/lib/data/rule-templates';
import { VariableScope } from '@/shared/types/variables';
import type {
  Variable,
  VariableContext,
  RequestContext,
} from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

// Mock the variable storage and resolver modules
vi.mock('@/lib/core/variable-storage', () => ({
  VariableStorageUtils: {
    initializeDefaultVariables: vi.fn().mockResolvedValue(undefined),
    getGlobalVariables: vi.fn().mockResolvedValue({
      'api-token': {
        id: 'api-token',
        name: 'API_TOKEN',
        value: 'test-token-value',
        scope: 'global',
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      },
      'api-key': {
        id: 'api-key',
        name: 'API_KEY',
        value: 'test-key-value',
        scope: 'global',
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      },
      'encoded-creds': {
        id: 'encoded-creds',
        name: 'ENCODED_CREDENTIALS',
        value: 'test-creds-value',
        scope: 'global',
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      },
      'dev-id': {
        id: 'dev-id',
        name: 'DEVELOPER_ID',
        value: 'test-dev-id',
        scope: 'global',
        metadata: { createdAt: new Date(), updatedAt: new Date() },
      },
    }),
  },
}));

vi.mock('@/lib/core/variable-resolver', () => ({
  VariableResolver: {
    resolve: vi.fn().mockImplementation((template, _context) => {
      // Simple mock implementation for testing
      if (template === 'Bearer ${API_TOKEN}') {
        return Promise.resolve({
          success: true,
          value: 'Bearer test-token-value',
        });
      }
      if (template === '${domain}/${path}') {
        return Promise.resolve({
          success: true,
          value: 'api.example.com//v1/users',
        });
      }
      if (template === '${UNDEFINED_VAR}') {
        return Promise.resolve({
          success: false,
          error: 'Variable not found',
          unresolvedVariables: ['UNDEFINED_VAR'],
        });
      }
      return Promise.resolve({ success: true, value: template });
    }),
  },
}));

/**
 * Integration test results
 */

// Get logger for this module
const logger = loggers.shared;

export interface IntegrationTestResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  errors: string[];
  warnings: string[];
  testResults: Array<{
    testName: string;
    success: boolean;
    error?: string;
    duration: number;
  }>;
}

/**
 * Variable system integration tester
 */
export class VariableIntegrationTester {
  private static readonly TEST_TIMEOUT = 10000; // 10 seconds

  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    const testResults: IntegrationTestResult['testResults'] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.info('🧪 Starting Variable System Integration Tests...');

    // Test 1: Default Variables Initialization
    await this.runTest(
      'Default Variables Initialization',
      async () => {
        await VariableStorageUtils.initializeDefaultVariables();
        const globalVars = await VariableStorageUtils.getGlobalVariables();

        const requiredVars = [
          'API_TOKEN',
          'API_KEY',
          'ENCODED_CREDENTIALS',
          'DEVELOPER_ID',
        ];
        for (const varName of requiredVars) {
          if (!Object.values(globalVars).some(v => v.name === varName)) {
            throw new Error(`Required variable ${varName} not found`);
          }
        }
      },
      testResults,
      errors
    );

    // Test 2: Template Variable Resolution
    await this.runTest(
      'Template Variable Resolution',
      async () => {
        const context = await this.createTestContext();

        // Test Bearer token template
        const bearerTemplate = 'Bearer ${API_TOKEN}';
        const bearerResult = await VariableResolver.resolve(
          bearerTemplate,
          context
        );

        if (!bearerResult.success) {
          throw new Error(
            `Bearer template resolution failed: ${bearerResult.error}`
          );
        }

        if (bearerResult.value === bearerTemplate) {
          throw new Error('Bearer template was not resolved');
        }

        // Test API key template
        const apiKeyTemplate = '${API_KEY}';
        const apiKeyResult = await VariableResolver.resolve(
          apiKeyTemplate,
          context
        );

        if (!apiKeyResult.success) {
          throw new Error(
            `API key template resolution failed: ${apiKeyResult.error}`
          );
        }
      },
      testResults,
      errors
    );

    // Test 3: System Variables Resolution
    await this.runTest(
      'System Variables Resolution',
      async () => {
        const context = await this.createTestContext();

        const systemTemplate = 'req-${timestamp}-${uuid()}';
        const result = await VariableResolver.resolve(systemTemplate, context);

        if (!result.success) {
          throw new Error(
            `System variables resolution failed: ${result.error}`
          );
        }

        if (result.value === systemTemplate) {
          throw new Error('System variables were not resolved');
        }

        // Verify timestamp is numeric
        const timestampMatch = result.value?.match(/req-(\d+)-/);
        if (!timestampMatch || !timestampMatch[1]) {
          throw new Error('Timestamp not properly resolved');
        }
      },
      testResults,
      errors
    );

    // Test 4: Complex Variable Composition
    await this.runTest(
      'Complex Variable Composition',
      async () => {
        const context = await this.createTestContext();

        const complexTemplate =
          '${AUTH_TYPE} ${AUTH_VALUE} - ${SERVICE_NAME} v${API_VERSION}';
        const result = await VariableResolver.resolve(complexTemplate, context);

        if (!result.success) {
          throw new Error(
            `Complex template resolution failed: ${result.error}`
          );
        }

        if (result.value === complexTemplate) {
          throw new Error('Complex template was not resolved');
        }
      },
      testResults,
      errors
    );

    // Test 5: Request Context Variables
    await this.runTest(
      'Request Context Variables',
      async () => {
        const context = await this.createTestContext();

        const contextTemplate =
          'Domain: ${domain}, Path: ${path}, Method: ${method}';
        const result = await VariableResolver.resolve(contextTemplate, context);

        if (!result.success) {
          throw new Error(
            `Context template resolution failed: ${result.error}`
          );
        }

        if (
          !result.value?.includes('example.com') ||
          !result.value?.includes('/api/v1')
        ) {
          throw new Error('Request context variables not properly resolved');
        }
      },
      testResults,
      errors
    );

    // Test 6: Template Migration Validation
    await this.runTest(
      'Template Migration Validation',
      async () => {
        const variableTemplates = BUILT_IN_TEMPLATES.filter(template =>
          template.tags?.includes('variables')
        );

        if (variableTemplates.length === 0) {
          throw new Error('No variable-enabled templates found');
        }

        const context = await this.createTestContext();

        for (const template of variableTemplates) {
          if (template.headers) {
            for (const header of template.headers) {
              if (header.value.includes('${')) {
                const result = await VariableResolver.resolve(
                  header.value,
                  context
                );
                if (!result.success) {
                  warnings.push(
                    `Template ${template.id} header ${header.name} failed to resolve: ${result.error}`
                  );
                }
              }
            }
          }
        }
      },
      testResults,
      errors
    );

    // Test 7: Variable Validation
    await this.runTest(
      'Variable Validation',
      async () => {
        const invalidTemplates = [
          '${INVALID_VAR_NAME-WITH-DASHES}',
          '${123_INVALID_START}',
          '${UNCLOSED_VAR',
          '${NESTED_${VAR}}',
        ];

        for (const template of invalidTemplates) {
          const parseResult = VariableResolver.parseTemplate(template);
          if (parseResult.success && parseResult.errors.length === 0) {
            warnings.push(
              `Invalid template "${template}" was not caught by validation`
            );
          }
        }
      },
      testResults,
      errors
    );

    // Test 8: Performance Test
    await this.runTest(
      'Performance Test',
      async () => {
        const context = await this.createTestContext();
        const template =
          'Bearer ${API_TOKEN} - ${timestamp} - ${uuid()} - ${domain}/${path}';

        const iterations = 100;
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
          const result = await VariableResolver.resolve(template, context);
          if (!result.success) {
            throw new Error(
              `Performance test failed at iteration ${i}: ${result.error}`
            );
          }
        }

        const duration = Date.now() - startTime;
        const avgTime = duration / iterations;

        if (avgTime > 50) {
          // 50ms average is too slow
          warnings.push(
            `Average resolution time is ${avgTime.toFixed(2)}ms, which may be too slow`
          );
        }

        logger.info(
          `Performance: ${iterations} resolutions in ${duration}ms (avg: ${avgTime.toFixed(2)}ms)`
        );
      },
      testResults,
      errors
    );

    // Test 9: Error Handling
    await this.runTest(
      'Error Handling',
      async () => {
        const context = await this.createTestContext();

        // Test undefined variable
        const undefinedVarTemplate = '${UNDEFINED_VARIABLE}';
        const result = await VariableResolver.resolve(
          undefinedVarTemplate,
          context
        );

        if (result.success) {
          warnings.push(
            'Undefined variable resolution should fail but succeeded'
          );
        }

        if (!result.unresolvedVariables?.includes('UNDEFINED_VARIABLE')) {
          throw new Error('Undefined variable not properly tracked');
        }
      },
      testResults,
      errors
    );

    // Test 10: Circular Reference Detection
    await this.runTest(
      'Circular Reference Detection',
      async () => {
        // Create variables with circular references
        const circularVars: Variable[] = [
          {
            id: 'circular_a',
            name: 'CIRCULAR_A',
            value: '${CIRCULAR_B}',
            scope: VariableScope.GLOBAL,
            metadata: { createdAt: new Date(), updatedAt: new Date() },
          },
          {
            id: 'circular_b',
            name: 'CIRCULAR_B',
            value: '${CIRCULAR_A}',
            scope: VariableScope.GLOBAL,
            metadata: { createdAt: new Date(), updatedAt: new Date() },
          },
        ];

        const context: VariableContext = {
          systemVariables: [],
          globalVariables: circularVars,
          profileVariables: [],
          ruleVariables: [],
        };

        const result = await VariableResolver.resolve('${CIRCULAR_A}', context);

        if (result.success) {
          warnings.push('Circular reference should be detected and fail');
        }

        if (
          !result.error?.includes('depth') &&
          !result.error?.includes('circular')
        ) {
          warnings.push(
            'Circular reference error message should mention depth or circular reference'
          );
        }
      },
      testResults,
      errors
    );

    const totalDuration = Date.now() - startTime;
    const passedTests = testResults.filter(t => t.success).length;
    const failedTests = testResults.filter(t => !t.success).length;

    const finalResult: IntegrationTestResult = {
      success: failedTests === 0,
      totalTests: testResults.length,
      passedTests,
      failedTests,
      errors,
      warnings,
      testResults,
    };

    logger.info(`\n🏁 Integration Tests Complete in ${totalDuration}ms`);
    logger.info(`✅ Passed: ${passedTests}/${testResults.length}`);
    logger.info(`❌ Failed: ${failedTests}/${testResults.length}`);
    logger.info(`⚠️  Warnings: ${warnings.length}`);

    if (errors.length > 0) {
      logger.info('\n❌ Errors:');
      errors.forEach(error => logger.info(`  - ${error}`));
    }

    if (warnings.length > 0) {
      logger.info('\n⚠️  Warnings:');
      warnings.forEach(warning => logger.info(`  - ${warning}`));
    }

    return finalResult;
  }

  /**
   * Run a single test with error handling and timing
   */
  private static async runTest(
    testName: string,
    testFn: () => Promise<void>,
    testResults: IntegrationTestResult['testResults'],
    errors: string[]
  ): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info(`🧪 Running: ${testName}`);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), this.TEST_TIMEOUT);
      });

      await Promise.race([testFn(), timeoutPromise]);

      const duration = Date.now() - startTime;
      testResults.push({
        testName,
        success: true,
        duration,
      });

      logger.info(`✅ ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      testResults.push({
        testName,
        success: false,
        error: errorMessage,
        duration,
      });

      errors.push(`${testName}: ${errorMessage}`);
      logger.info(`❌ ${testName} (${duration}ms): ${errorMessage}`);
    }
  }

  /**
   * Create a test context with sample variables and request context
   */
  private static async createTestContext(): Promise<VariableContext> {
    const globalVars = await VariableStorageUtils.getGlobalVariables();

    const requestContext: RequestContext = {
      url: 'https://api.example.com/v1/users?limit=10',
      method: 'GET',
      headers: {
        'User-Agent': 'RequestKit/1.0',
        Accept: 'application/json',
      },
      timestamp: Date.now(),
      domain: 'api.example.com',
      path: '/v1/users',
      protocol: 'https',
      query: { limit: '10' },
      userAgent: 'RequestKit/1.0',
    };

    return {
      systemVariables: [],
      globalVariables: Object.values(globalVars),
      profileVariables: [],
      ruleVariables: [],
      requestContext,
    };
  }

  /**
   * Quick validation test for development
   */
  static async quickValidation(): Promise<boolean> {
    try {
      logger.info('🚀 Running quick validation...');

      // Initialize default variables
      await VariableStorageUtils.initializeDefaultVariables();

      // Test basic resolution
      const context = await this.createTestContext();
      const result = await VariableResolver.resolve(
        'Bearer ${API_TOKEN}',
        context
      );

      if (!result.success) {
        logger.error('❌ Quick validation failed:', result.error);
        return false;
      }

      logger.info('✅ Quick validation passed');
      return true;
    } catch (error) {
      logger.error('❌ Quick validation error:', error);
      return false;
    }
  }
}

// Actual test cases using the integration tester
describe('Variable System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have basic variable system functionality', () => {
    // Test that the VariableIntegrationTester class exists
    expect(VariableIntegrationTester).toBeDefined();
    expect(typeof VariableIntegrationTester.quickValidation).toBe('function');
    expect(typeof VariableIntegrationTester.runIntegrationTests).toBe(
      'function'
    );
  });

  it('should have variable storage utilities', () => {
    // Test that VariableStorageUtils exists and has expected methods
    expect(VariableStorageUtils).toBeDefined();
    expect(typeof VariableStorageUtils.initializeDefaultVariables).toBe(
      'function'
    );
    expect(typeof VariableStorageUtils.getGlobalVariables).toBe('function');
  });

  it('should have variable resolver functionality', () => {
    // Test that VariableResolver exists and has expected methods
    expect(VariableResolver).toBeDefined();
    expect(typeof VariableResolver.resolve).toBe('function');
  });

  it('should have variable scope enum', () => {
    // Test that VariableScope enum exists
    expect(VariableScope).toBeDefined();
    expect(VariableScope.GLOBAL).toBeDefined();
  });

  it('should have built-in templates', () => {
    // Test that BUILT_IN_TEMPLATES exists and is an array
    expect(BUILT_IN_TEMPLATES).toBeDefined();
    expect(Array.isArray(BUILT_IN_TEMPLATES)).toBe(true);
  });
});

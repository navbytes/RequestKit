/**
 * Demo script to test variable resolution display in DevTools
 * This simulates variable resolution for demonstration purposes
 */

import { VariableResolver } from '@/lib/core/variable-resolver';
import type { VariableContext } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

/**
 * Create a demo variable context with sample variables
 */

// Get logger for this module
const logger = loggers.shared;

export function createDemoVariableContext(): VariableContext {
  return {
    globalVariables: [
      {
        id: 'global_api_key',
        name: 'api_key',
        value: 'sk-demo-${uuid()}',
        scope: VariableScope.GLOBAL,
        description: 'Global API key for authentication',
        enabled: true,
        tags: ['auth', 'api'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: 'global_base_url',
        name: 'base_url',
        value: 'https://api.example.com',
        scope: VariableScope.GLOBAL,
        description: 'Base URL for API requests',
        enabled: true,
        tags: ['url', 'api'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
    profileVariables: [
      {
        id: 'profile_user_id',
        name: 'user_id',
        value: '${uuid()}',
        scope: VariableScope.PROFILE,
        description: 'Current user ID',
        enabled: true,
        tags: ['user', 'id'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: 'profile_session',
        name: 'session_token',
        value: 'sess_${timestamp()}_${random(1000, 9999)}',
        scope: VariableScope.PROFILE,
        description: 'Session token with timestamp',
        enabled: true,
        tags: ['session', 'auth'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
    ruleVariables: [
      {
        id: 'rule_request_id',
        name: 'request_id',
        value: 'req_${timestamp()}_${random(100, 999)}',
        scope: VariableScope.RULE,
        description: 'Unique request identifier',
        enabled: true,
        tags: ['request', 'tracking'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
    systemVariables: [],
    requestContext: {
      url: 'https://api.example.com/users/${user_id}',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ${api_key}',
        'X-Session-Token': '${session_token}',
        'X-Request-ID': '${request_id}',
      },
      timestamp: Date.now(),
      domain: 'api.example.com',
      path: '/users/${user_id}',
      protocol: 'https',
      query: {},
    },
    profileId: 'demo-profile',
    ruleId: 'demo-rule',
  };
}

/**
 * Demo templates to test variable resolution
 */
export const DEMO_TEMPLATES = [
  {
    name: 'Simple Variable',
    template: '${api_key}',
    description: 'Basic variable substitution',
  },
  {
    name: 'Function Call',
    template: '${uuid()}',
    description: 'Function execution',
  },
  {
    name: 'Nested Variables',
    template: 'Bearer ${api_key}',
    description: 'Variable containing other variables',
  },
  {
    name: 'Complex Template',
    template:
      '${base_url}/users/${user_id}?session=${session_token}&request=${request_id}',
    description: 'Multiple variables and functions',
  },
  {
    name: 'Function with Parameters',
    template: '${random(1000, 9999)}',
    description: 'Function with parameters',
  },
  {
    name: 'Date Functions',
    template: '${iso_date()}_${timestamp()}',
    description: 'Date and timestamp functions',
  },
];

/**
 * Run demo variable resolution and return traces
 */
export async function runDemoResolution() {
  const context = createDemoVariableContext();
  const results = [];

  for (const demo of DEMO_TEMPLATES) {
    try {
      const result = await VariableResolver.resolve(demo.template, context);

      results.push({
        demo,
        result,
        trace: null, // No trace available with basic resolve method
      });
    } catch (error) {
      logger.error(`Demo resolution failed for ${demo.name}:`, error);
      results.push({
        demo,
        result: {
          success: false,
          error: `Resolution failed: ${error}`,
          resolvedVariables: [],
          unresolvedVariables: [],
          resolutionTime: 0,
        },
        trace: null,
      });
    }
  }

  return results;
}

/**
 * Log demo results to console for testing
 */
export async function logDemoResults() {
  logger.info('🚀 Running Variable Resolution Demo...');

  const results = await runDemoResolution();

  results.forEach(({ demo, result }) => {
    logger.info(`Demo: ${demo.name} - ${demo.template}`, {
      description: demo.description,
      result,
      trace: 'Not available (using basic resolve)',
    });
  });

  logger.info('✅ Demo completed!');
  return results;
}

// Export for use in DevTools console
declare global {
  interface Window {
    RequestKitDemo: {
      createDemoVariableContext: typeof createDemoVariableContext;
      runDemoResolution: typeof runDemoResolution;
      logDemoResults: typeof logDemoResults;
      DEMO_TEMPLATES: typeof DEMO_TEMPLATES;
    };
  }
}

if (typeof window !== 'undefined') {
  window.RequestKitDemo = {
    createDemoVariableContext,
    runDemoResolution,
    logDemoResults,
    DEMO_TEMPLATES,
  };
}

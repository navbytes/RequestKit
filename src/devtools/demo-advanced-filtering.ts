/**
 * Demo script for Advanced Filtering functionality
 * This demonstrates the complete filtering system implementation
 */

import { loggers } from '@/shared/utils/debug';

import { FilterService } from './services/FilterService';
import type { FilterableRequest, FilterCriteria } from './types/filtering';

// Sample request data for testing

// Get logger for this module
const logger = loggers.shared;

const sampleRequests: FilterableRequest[] = [
  {
    id: '1',
    url: 'https://api.example.com/users',
    method: 'GET',
    status: 200,
    timestamp: new Date('2024-01-01T10:00:00Z'),
    domain: 'api.example.com',
    requestHeaders: {
      Authorization: 'Bearer token123',
      'Content-Type': 'application/json',
    },
    responseHeaders: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    modifiedHeaders: {
      request: [
        {
          name: 'Authorization',
          value: 'Bearer token123',
          operation: 'add',
          ruleId: 'auth-rule',
        },
      ],
      response: [],
    },
    matchedRules: ['auth-rule'],
    profileId: 'dev-profile',
  },
  {
    id: '2',
    url: 'https://cdn.example.com/assets/style.css',
    method: 'GET',
    status: 304,
    timestamp: new Date('2024-01-01T10:01:00Z'),
    domain: 'cdn.example.com',
    requestHeaders: { 'If-None-Match': '"abc123"' },
    responseHeaders: { 'Content-Type': 'text/css', ETag: '"abc123"' },
    modifiedHeaders: { request: [], response: [] },
    matchedRules: [],
    profileId: 'dev-profile',
  },
  {
    id: '3',
    url: 'https://api.example.com/posts',
    method: 'POST',
    status: 201,
    timestamp: new Date('2024-01-01T10:02:00Z'),
    domain: 'api.example.com',
    requestHeaders: {
      Authorization: 'Bearer token123',
      'Content-Type': 'application/json',
    },
    responseHeaders: {
      'Content-Type': 'application/json',
      Location: '/posts/123',
    },
    modifiedHeaders: {
      request: [
        {
          name: 'Authorization',
          value: 'Bearer token123',
          operation: 'add',
          ruleId: 'auth-rule',
        },
      ],
      response: [
        {
          name: 'X-Custom-Header',
          value: 'custom-value',
          operation: 'add',
          ruleId: 'custom-rule',
        },
      ],
    },
    matchedRules: ['auth-rule', 'custom-rule'],
    profileId: 'dev-profile',
  },
];

// Demo function to test filtering capabilities
export async function demoAdvancedFiltering() {
  logger.info('🚀 RequestKit Advanced Filtering Demo');
  logger.info('=====================================');

  const filterService = new FilterService();

  // Test 1: Basic domain filtering
  logger.info('\n📍 Test 1: Domain Filtering');
  const domainCriteria: FilterCriteria = {
    domains: ['api.example.com'],
  };

  const domainResult = await filterService.filterRequests(
    sampleRequests,
    domainCriteria
  );
  logger.info(
    `Found ${domainResult.filteredCount} of ${domainResult.totalCount} requests from api.example.com`
  );
  logger.info(`Execution time: ${domainResult.executionTime.toFixed(2)}ms`);

  // Test 2: Method and status filtering
  logger.info('\n🔧 Test 2: Method and Status Filtering');
  const methodStatusCriteria: FilterCriteria = {
    methods: ['GET'],
    statusCodes: [200, 304],
  };

  const methodStatusResult = await filterService.filterRequests(
    sampleRequests,
    methodStatusCriteria
  );
  logger.info(
    `Found ${methodStatusResult.filteredCount} GET requests with 200/304 status`
  );

  // Test 3: Rule-based filtering
  logger.info('\n⚡ Test 3: Rule-based Filtering');
  const ruleCriteria: FilterCriteria = {
    hasRuleMatches: true,
    matchedRules: ['auth-rule'],
  };

  const ruleResult = await filterService.filterRequests(
    sampleRequests,
    ruleCriteria
  );
  logger.info(
    `Found ${ruleResult.filteredCount} requests with auth-rule matches`
  );

  // Test 4: Modification filtering
  logger.info('\n🔨 Test 4: Modification Filtering');
  const modificationCriteria: FilterCriteria = {
    hasModifications: true,
    modificationType: 'both',
  };

  const modificationResult = await filterService.filterRequests(
    sampleRequests,
    modificationCriteria
  );
  logger.info(
    `Found ${modificationResult.filteredCount} requests with both request and response modifications`
  );

  // Test 5: Regex URL filtering
  logger.info('\n🔍 Test 5: Regex URL Filtering');
  const regexCriteria: FilterCriteria = {
    urlPattern: '/api/.*',
    useRegex: true,
  };

  const regexResult = await filterService.filterRequests(
    sampleRequests,
    regexCriteria
  );
  logger.info(
    `Found ${regexResult.filteredCount} requests matching API pattern`
  );

  // Test 6: Time range filtering
  logger.info('\n⏰ Test 6: Time Range Filtering');
  const timeRangeCriteria: FilterCriteria = {
    timeRange: {
      start: new Date('2024-01-01T10:00:00Z'),
      end: new Date('2024-01-01T10:01:30Z'),
    },
  };

  const timeRangeResult = await filterService.filterRequests(
    sampleRequests,
    timeRangeCriteria
  );
  logger.info(`Found ${timeRangeResult.filteredCount} requests in time range`);

  // Test 7: Complex combined filtering
  logger.info('\n🎯 Test 7: Complex Combined Filtering');
  const complexCriteria: FilterCriteria = {
    domains: ['api.example.com'],
    methods: ['GET', 'POST'],
    hasRuleMatches: true,
    statusCodes: [200, 201],
  };

  const complexResult = await filterService.filterRequests(
    sampleRequests,
    complexCriteria
  );
  logger.info(
    `Found ${complexResult.filteredCount} requests matching complex criteria`
  );
  logger.info(`Applied criteria:`, complexResult.appliedCriteria);

  // Test 8: Quick filters
  logger.info('\n⚡ Test 8: Quick Filters');
  const quickFilters = filterService.getQuickFilters();
  logger.info(
    `Available quick filters: ${quickFilters.map(f => f.name).join(', ')}`
  );

  const modifiedOnlyFilter = quickFilters.find(f => f.id === 'modified-only');
  if (modifiedOnlyFilter) {
    const quickResult = await filterService.filterRequests(
      sampleRequests,
      modifiedOnlyFilter.criteria
    );
    logger.info(
      `"${modifiedOnlyFilter.name}" quick filter found ${quickResult.filteredCount} requests`
    );
  }

  // Test 9: Performance metrics
  logger.info('\n📊 Test 9: Performance Metrics');
  const metrics = filterService.getPerformanceMetrics();
  logger.info('Performance metrics:', {
    totalExecutions: metrics.totalExecutionTime,
    averageTime: metrics.filterApplicationTime,
    cacheHitRate:
      (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100,
  });

  logger.info('\n✅ Advanced Filtering Demo Complete!');
  logger.info('=====================================');
}

// Export for use in DevTools console
declare global {
  interface Window {
    demoAdvancedFiltering: typeof demoAdvancedFiltering;
  }
}

window.demoAdvancedFiltering = demoAdvancedFiltering;

/**
 * API-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

// Constants
const REQUESTKIT_AUTHOR = 'RequestKit';
const TEMPLATE_DATE = new Date('2025-01-01');

export const API_TEMPLATES: RuleTemplate[] = [
  {
    id: 'json-api-headers',
    name: 'JSON API Headers',
    description: 'Standard headers for JSON API requests',
    category: 'api',
    templateType: 'headers',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'Accept',
        value: 'application/json',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['api', 'json', 'content-type'],
    popularity: 90,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
  {
    id: 'rest-api-testing',
    name: 'REST API Testing Headers',
    description: 'Common headers for REST API testing and development',
    category: 'api',
    templateType: 'headers',
    headers: [
      {
        name: 'Content-Type',
        value: 'application/json',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'Accept',
        value: 'application/json',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Requested-With',
        value: 'XMLHttpRequest',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'User-Agent',
        value: 'RequestKit-API-Tester/1.0',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['api', 'rest', 'testing', 'json'],
    popularity: 83,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
  {
    id: 'dynamic-api-headers',
    name: 'Dynamic API Headers',
    description:
      'Comprehensive API headers using multiple variables for environment-aware requests. Demonstrates variable composition and system variables.',
    category: 'api',
    templateType: 'headers',
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer ${API_TOKEN}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-API-Version',
        value: '${API_VERSION}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Environment',
        value: '${ENVIRONMENT}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Service-Name',
        value: '${SERVICE_NAME}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Request-ID',
        value: '${request_id}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Session-ID',
        value: '${SESSION_ID}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-User-ID',
        value: '${USER_ID}',
        operation: 'set',
        target: 'request',
      },
    ],
    pattern: {
      domain: 'api.*',
      path: '/v*/*',
      protocol: 'https',
    },
    tags: ['api', 'variables', 'dynamic', 'comprehensive', 'environment'],
    popularity: 88,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
];

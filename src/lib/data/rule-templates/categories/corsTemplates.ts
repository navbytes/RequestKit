/**
 * CORS-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

export const CORS_TEMPLATES: RuleTemplate[] = [
  {
    id: 'cors-local-dev',
    name: 'CORS for Local Development',
    description:
      'Enable CORS for local development with localhost and common dev ports',
    category: 'cors',
    templateType: 'headers',
    headers: [
      {
        name: 'Access-Control-Allow-Origin',
        value: '*',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, X-Requested-With',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Allow-Credentials',
        value: 'true',
        operation: 'set',
        target: 'response',
      },
    ],
    pattern: {
      domain: 'localhost',
      path: '/*',
      protocol: 'http',
    },
    tags: ['cors', 'development', 'localhost'],
    popularity: 95,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'cors-api-testing',
    name: 'CORS for API Testing',
    description: 'Permissive CORS headers for testing APIs from any origin',
    category: 'cors',
    templateType: 'headers',
    headers: [
      {
        name: 'Access-Control-Allow-Origin',
        value: '*',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Allow-Methods',
        value: '*',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Allow-Headers',
        value: '*',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Access-Control-Max-Age',
        value: '86400',
        operation: 'set',
        target: 'response',
      },
    ],
    tags: ['cors', 'testing', 'api'],
    popularity: 88,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
];

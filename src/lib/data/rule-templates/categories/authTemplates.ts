/**
 * Authentication-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

// Constants
const REQUESTKIT_AUTHOR = 'RequestKit';
const TEMPLATE_DATE = new Date('2025-01-01');

export const AUTH_TEMPLATES: RuleTemplate[] = [
  {
    id: 'bearer-token-auth',
    name: 'Bearer Token Authentication',
    description:
      'Add Bearer token authorization header for API requests. Uses ${API_TOKEN} variable for secure token management.',
    category: 'auth',
    templateType: 'headers',
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer ${API_TOKEN}',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['auth', 'bearer', 'token', 'api', 'variables'],
    popularity: 92,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
  {
    id: 'api-key-auth',
    name: 'API Key Authentication',
    description:
      'Add API key header for services that use X-API-Key authentication. Uses ${API_KEY} variable for secure key management.',
    category: 'auth',
    templateType: 'headers',
    headers: [
      {
        name: 'X-API-Key',
        value: '${API_KEY}',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['auth', 'api-key', 'api', 'variables'],
    popularity: 85,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
  {
    id: 'basic-auth',
    name: 'Basic Authentication',
    description:
      'Add Basic authentication header with base64-encoded credentials. Uses ${ENCODED_CREDENTIALS} variable for secure credential management.',
    category: 'auth',
    templateType: 'headers',
    headers: [
      {
        name: 'Authorization',
        value: 'Basic ${ENCODED_CREDENTIALS}',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['auth', 'basic', 'credentials', 'variables'],
    popularity: 70,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
  {
    id: 'multi-auth-variable',
    name: 'Multi-Authentication with Variables',
    description:
      'Flexible authentication template supporting multiple auth methods using variables. Switch between Bearer, API Key, and Basic auth by changing variable values.',
    category: 'auth',
    templateType: 'conditional',
    headers: [
      {
        name: 'Authorization',
        value: '${AUTH_TYPE} ${AUTH_VALUE}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-API-Key',
        value: '${API_KEY}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Auth-Method',
        value: '${AUTH_TYPE}',
        operation: 'set',
        target: 'request',
      },
    ],
    conditions: [
      {
        type: 'url',
        operator: 'contains',
        value: 'api',
      },
    ],
    tags: ['auth', 'variables', 'flexible', 'multi-method', 'conditional'],
    popularity: 78,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
];

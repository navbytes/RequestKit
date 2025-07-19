/**
 * Advanced rule templates (performance, conditional, file, complete)
 */

import type { RuleTemplate } from '@/shared/types/templates';

export const ADVANCED_TEMPLATES: RuleTemplate[] = [
  // Performance Templates
  {
    id: 'cache-optimization',
    name: 'Cache Optimization',
    description: 'Optimize caching for static resources',
    category: 'performance',
    templateType: 'headers',
    headers: [
      {
        name: 'Cache-Control',
        value: 'public, max-age=31536000',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'ETag',
        value: '"${timestamp}"',
        operation: 'set',
        target: 'response',
      },
    ],
    pattern: {
      domain: '*',
      path: '/*.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)',
      protocol: 'https',
    },
    tags: ['performance', 'cache', 'static-assets'],
    popularity: 68,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'compression-headers',
    name: 'Compression Headers',
    description: 'Enable compression for better performance',
    category: 'performance',
    templateType: 'headers',
    headers: [
      {
        name: 'Accept-Encoding',
        value: 'gzip, deflate, br',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['performance', 'compression', 'gzip'],
    popularity: 60,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },

  // Conditional Rule Templates
  {
    id: 'conditional-debug-headers',
    name: 'Conditional Debug Headers',
    description: 'Add debug headers only during business hours on weekdays',
    category: 'conditional',
    templateType: 'conditional',
    headers: [
      {
        name: 'X-Debug-Mode',
        value: 'enabled',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Time',
        value: '${timestamp}',
        operation: 'set',
        target: 'request',
      },
    ],
    conditions: [
      {
        type: 'time',
        operator: 'greater',
        value: '09:00',
      },
      {
        type: 'time',
        operator: 'less',
        value: '17:00',
      },
    ],
    conditionalLogic: {
      operator: 'AND',
      conditions: [
        {
          type: 'time',
          operator: 'greater',
          value: '09:00',
        },
        {
          type: 'time',
          operator: 'less',
          value: '17:00',
        },
      ],
    },
    schedule: {
      enabled: true,
      timeRanges: [
        {
          start: '09:00',
          end: '17:00',
          days: [1, 2, 3, 4, 5], // Monday to Friday
        },
      ],
    },
    tags: ['conditional', 'debug', 'time', 'business-hours'],
    popularity: 60,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'conditional-auth-by-domain',
    name: 'Conditional Auth by Domain',
    description:
      'Apply different authentication based on domain and user agent',
    category: 'conditional',
    templateType: 'conditional',
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer ${domain-specific-token}',
        operation: 'set',
        target: 'request',
      },
    ],
    conditions: [
      {
        type: 'url',
        operator: 'contains',
        value: 'api.example.com',
      },
      {
        type: 'userAgent',
        operator: 'contains',
        value: 'Chrome',
      },
    ],
    conditionalLogic: {
      operator: 'AND',
      conditions: [
        {
          type: 'url',
          operator: 'contains',
          value: 'api.example.com',
        },
        {
          type: 'userAgent',
          operator: 'contains',
          value: 'Chrome',
        },
      ],
    },
    tags: ['conditional', 'auth', 'domain', 'user-agent'],
    popularity: 55,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },

  // File Interception Templates
  {
    id: 'file-download-redirect',
    name: 'File Download Redirect',
    description: 'Redirect file downloads to CDN and add tracking headers',
    category: 'file',
    templateType: 'file',
    fileInterceptions: [
      {
        id: 'file-redirect-1',
        enabled: true,
        pattern: {
          domain: 'example.com',
          path: '/downloads/*',
        },
        operation: 'redirect',
        target: 'download',
        fileTypes: ['pdf', 'zip', 'tar.gz'],
        modifications: {
          headers: [
            {
              name: 'X-Download-Source',
              value: 'CDN-Redirect',
              operation: 'set',
              target: 'response',
            },
          ],
        },
      },
    ],
    tags: ['file', 'redirect', 'cdn', 'download'],
    popularity: 45,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },

  // Advanced Feature Templates
  {
    id: 'rate-limited-api-headers',
    name: 'Rate Limited API Headers',
    description: 'API headers with rate limiting and scheduling',
    category: 'advanced',
    templateType: 'advanced',
    headers: [
      {
        name: 'X-API-Key',
        value: 'rate-limited-key',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Rate-Limit-Info',
        value: 'managed-by-requestkit',
        operation: 'set',
        target: 'request',
      },
    ],
    limits: {
      maxMatches: 1000,
      maxMatchesPerHour: 100,
      maxMatchesPerDay: 500,
      cooldownPeriod: 60,
    },
    schedule: {
      enabled: true,
      timeRanges: [
        {
          start: '08:00',
          end: '20:00',
          days: [1, 2, 3, 4, 5, 6, 7],
        },
      ],
    },
    pattern: {
      domain: 'api.example.com',
      path: '/v1/*',
    },
    tags: ['advanced', 'rate-limit', 'api', 'scheduling'],
    popularity: 40,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },

  // Complete Rule Templates
  {
    id: 'complete-api-management',
    name: 'Complete API Management',
    description: 'Comprehensive API rule with headers, conditions, and limits',
    category: 'advanced',
    templateType: 'complete',
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer complete-api-token',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-API-Version',
        value: '2.0',
        operation: 'set',
        target: 'request',
      },
    ],
    conditions: [
      {
        type: 'requestMethod',
        operator: 'equals',
        value: 'POST',
      },
    ],
    limits: {
      maxMatchesPerHour: 50,
      cooldownPeriod: 30,
    },
    resourceTypes: ['xmlhttprequest', 'script'],
    pattern: {
      domain: 'api.example.com',
      path: '/v2/*',
      protocol: 'https',
    },
    tags: ['complete', 'api', 'comprehensive', 'advanced'],
    popularity: 85,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
];

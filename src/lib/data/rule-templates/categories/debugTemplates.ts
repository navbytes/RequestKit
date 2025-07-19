/**
 * Debug and development-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

export const DEBUG_TEMPLATES: RuleTemplate[] = [
  {
    id: 'debug-headers',
    name: 'Debug Information Headers',
    description: 'Add debugging headers to track requests and responses',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'X-Debug-Mode',
        value: 'true',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Request-ID',
        value: 'req-${timestamp}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-User-Agent-Debug',
        value: 'RequestKit-Debug',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['debug', 'development', 'tracking'],
    popularity: 80,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'cache-disable',
    name: 'Disable Caching',
    description: 'Disable all caching for debugging and development',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'Cache-Control',
        value: 'no-cache, no-store, must-revalidate',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Pragma',
        value: 'no-cache',
        operation: 'set',
        target: 'response',
      },
      { name: 'Expires', value: '0', operation: 'set', target: 'response' },
    ],
    tags: ['debug', 'cache', 'development'],
    popularity: 75,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'mirrord-sharding',
    name: 'Mirrord Sharding',
    description:
      'Add developer ID header for Mirrord traffic sharding and routing. Uses ${USERNAME} variable for personalized development routing.',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'X-Mirrord-User',
        value: '${USERNAME}',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: [
      'mirrord',
      'sharding',
      'development',
      'routing',
      'developer-id',
      'variables',
    ],
    popularity: 75,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'variable-debug-headers',
    name: 'Variable-Enhanced Debug Headers',
    description:
      'Advanced debugging headers using both static and dynamic variables. Perfect for development environments with comprehensive request tracking.',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'X-Debug-Mode',
        value: 'true',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Environment',
        value: '${ENVIRONMENT}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Timestamp',
        value: '${timestamp}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Session',
        value: '${SESSION_ID}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-User',
        value: '${USER_ID}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Request-ID',
        value: 'req-${timestamp}-${random(1000, 9999)}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Domain',
        value: '${domain}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-Debug-Path',
        value: '${path}',
        operation: 'set',
        target: 'request',
      },
    ],
    pattern: {
      domain: '*',
      path: '/*',
      protocol: '*',
    },
    tags: ['debug', 'variables', 'development', 'tracking', 'comprehensive'],
    popularity: 82,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-chrome-desktop',
    name: 'Chrome Desktop User-Agent',
    description:
      'Set User-Agent to latest Chrome on Windows for desktop testing',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'chrome', 'desktop', 'testing', 'browser'],
    popularity: 85,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-mobile-ios',
    name: 'Mobile Safari iOS User-Agent',
    description: 'Set User-Agent to iPhone Safari for mobile testing',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'mobile', 'ios', 'safari', 'testing', 'iphone'],
    popularity: 80,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-mobile-android',
    name: 'Mobile Chrome Android User-Agent',
    description: 'Set User-Agent to Android Chrome for mobile testing',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'mobile', 'android', 'chrome', 'testing'],
    popularity: 78,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-bot-googlebot',
    name: 'Googlebot User-Agent',
    description:
      'Set User-Agent to Googlebot for SEO testing and crawler simulation',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'bot', 'googlebot', 'seo', 'crawler', 'testing'],
    popularity: 70,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-firefox-desktop',
    name: 'Firefox Desktop User-Agent',
    description:
      'Set User-Agent to latest Firefox on Windows for cross-browser testing',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'firefox', 'desktop', 'testing', 'browser'],
    popularity: 65,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-edge-desktop',
    name: 'Microsoft Edge User-Agent',
    description: 'Set User-Agent to Microsoft Edge for Windows testing',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'edge', 'microsoft', 'desktop', 'testing', 'browser'],
    popularity: 60,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'user-agent-custom-variable',
    name: 'Custom Variable User-Agent',
    description:
      'Set User-Agent using a custom variable for flexible testing scenarios',
    category: 'debugging',
    templateType: 'headers',
    headers: [
      {
        name: 'User-Agent',
        value: '${CUSTOM_USER_AGENT}',
        operation: 'set',
        target: 'request',
      },
    ],
    tags: ['user-agent', 'custom', 'variable', 'testing', 'flexible'],
    popularity: 75,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
];

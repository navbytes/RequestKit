/**
 * Debug and development-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

// Constants
const REQUESTKIT_AUTHOR = 'RequestKit';
const TEMPLATE_DATE = new Date('2025-01-01');
const SET_OPERATION = 'set';
const REQUEST_TARGET = 'request';
const TESTING_TAG = 'testing';
const USER_AGENT_TAG = 'user-agent';
const BROWSER_TAG = 'browser';
const USER_AGENT_HEADER = 'User-Agent';

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
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Request-ID',
        value: 'req-${timestamp}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-User-Agent-Debug',
        value: 'RequestKit-Debug',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: ['debug', 'development', 'tracking'],
    popularity: 80,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        operation: SET_OPERATION,
        target: 'response',
      },
      {
        name: 'Pragma',
        value: 'no-cache',
        operation: SET_OPERATION,
        target: 'response',
      },
      {
        name: 'Expires',
        value: '0',
        operation: SET_OPERATION,
        target: 'response',
      },
    ],
    tags: ['debug', 'cache', 'development'],
    popularity: 75,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
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
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Environment',
        value: '${ENVIRONMENT}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Timestamp',
        value: '${timestamp}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Session',
        value: '${SESSION_ID}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-User',
        value: '${USER_ID}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Request-ID',
        value: 'req-${timestamp}-${random(1000, 9999)}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Domain',
        value: '${domain}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
      {
        name: 'X-Debug-Path',
        value: '${path}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    pattern: {
      domain: '*',
      path: '/*',
      protocol: '*',
    },
    tags: ['debug', 'variables', 'development', 'tracking', 'comprehensive'],
    popularity: 82,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'chrome', 'desktop', TESTING_TAG, BROWSER_TAG],
    popularity: 85,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'mobile', 'ios', 'safari', TESTING_TAG, 'iphone'],
    popularity: 80,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'mobile', 'android', 'chrome', TESTING_TAG],
    popularity: 78,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'bot', 'googlebot', 'seo', 'crawler', TESTING_TAG],
    popularity: 70,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'firefox', 'desktop', TESTING_TAG, BROWSER_TAG],
    popularity: 65,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [
      USER_AGENT_TAG,
      'edge',
      'microsoft',
      'desktop',
      TESTING_TAG,
      BROWSER_TAG,
    ],
    popularity: 60,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
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
        name: USER_AGENT_HEADER,
        value: '${CUSTOM_USER_AGENT}',
        operation: SET_OPERATION,
        target: REQUEST_TARGET,
      },
    ],
    tags: [USER_AGENT_TAG, 'custom', 'variable', TESTING_TAG, 'flexible'],
    popularity: 75,
    author: REQUESTKIT_AUTHOR,
    createdAt: TEMPLATE_DATE,
    updatedAt: TEMPLATE_DATE,
    isBuiltIn: true,
  },
];

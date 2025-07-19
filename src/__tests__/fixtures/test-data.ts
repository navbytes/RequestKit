/**
 * Test data fixtures for component testing
 * Provides mock data for rules, profiles, variables, and common test scenarios
 */

import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';

/**
 * Mock header rules for testing
 */
export const mockRules: HeaderRule[] = [
  {
    id: 'rule-1',
    name: 'API Authorization Header',
    enabled: true,
    pattern: {
      domain: 'api.example.com',
      path: '/v1/*',
      protocol: 'https',
    },
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer ${api_token}',
        operation: 'set',
        target: 'request',
      },
      {
        name: 'X-API-Version',
        value: '1.0',
        operation: 'set',
        target: 'request',
      },
    ],
    priority: 1,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    description: 'Adds authorization header for API requests',
    tags: ['api', 'auth'],
    resourceTypes: ['xmlhttprequest', 'fetch'],
    profileId: 'dev-profile',
  },
  {
    id: 'rule-2',
    name: 'CORS Headers',
    enabled: false,
    pattern: {
      domain: '*.localhost',
      path: '*',
      protocol: '*',
      port: '3000',
    },
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
    ],
    priority: 2,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    description: 'Enables CORS for local development',
    tags: ['cors', 'development'],
    resourceTypes: ['main_frame', 'sub_frame'],
    profileId: 'dev-profile',
  },
  {
    id: 'rule-3',
    name: 'Production Security Headers',
    enabled: true,
    pattern: {
      domain: 'app.production.com',
      path: '*',
      protocol: 'https',
    },
    headers: [
      {
        name: 'X-Frame-Options',
        value: 'DENY',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'X-Content-Type-Options',
        value: 'nosniff',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
        operation: 'set',
        target: 'response',
      },
    ],
    priority: 3,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    description: 'Security headers for production environment',
    tags: ['security', 'production'],
    resourceTypes: ['main_frame'],
    profileId: 'prod-profile',
  },
  {
    id: 'rule-4',
    name: 'Unassigned Rule',
    enabled: true,
    pattern: {
      domain: 'test.example.com',
      path: '*',
    },
    headers: [
      {
        name: 'X-Test-Header',
        value: 'test-value',
        operation: 'set',
        target: 'request',
      },
    ],
    priority: 4,
    createdAt: new Date('2024-01-04T00:00:00Z'),
    updatedAt: new Date('2024-01-04T00:00:00Z'),
    description: 'Rule not assigned to any profile',
    tags: ['test'],
    // No profileId - this is an unassigned rule
  },
];

/**
 * Mock profiles for testing
 */
export const mockProfiles: Profile[] = [
  {
    id: 'dev-profile',
    name: 'Development',
    description: 'Development environment profile',
    color: '#10b981',
    environment: 'development',
    rules: ['rule-1', 'rule-2'],
    enabled: true,
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    settings: {
      debugMode: true,
      logLevel: 'debug',
      notifications: {
        enabled: true,
        showRuleMatches: true,
        showErrors: true,
      },
      performance: {
        maxRules: 50,
        enableMetrics: true,
      },
    },
  },
  {
    id: 'staging-profile',
    name: 'Staging',
    description: 'Staging environment profile',
    color: '#f59e0b',
    environment: 'staging',
    rules: [],
    enabled: true,
    isDefault: false,
    createdAt: new Date('2024-01-02T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    settings: {
      debugMode: true,
      logLevel: 'info',
      notifications: {
        enabled: true,
        showErrors: true,
      },
    },
  },
  {
    id: 'prod-profile',
    name: 'Production',
    description: 'Production environment profile',
    color: '#ef4444',
    environment: 'production',
    rules: ['rule-3'],
    enabled: false,
    isDefault: false,
    createdAt: new Date('2024-01-03T00:00:00Z'),
    updatedAt: new Date('2024-01-03T00:00:00Z'),
    settings: {
      debugMode: false,
      logLevel: 'error',
      notifications: {
        enabled: false,
      },
    },
  },
];

/**
 * Mock variables for testing
 */
export const mockVariables: Variable[] = [
  {
    id: 'var-1',
    name: 'api_token',
    value: 'sk-test-1234567890abcdef',
    scope: VariableScope.GLOBAL,
    description: 'API token for authentication',
    isSecret: true,
    enabled: true,
    tags: ['api', 'auth'],
    metadata: {
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      usageCount: 5,
      lastUsed: new Date('2024-01-05T00:00:00Z'),
    },
    validation: {
      required: true,
      pattern: '^sk-[a-zA-Z0-9]+$',
      minLength: 10,
    },
  },
  {
    id: 'var-2',
    name: 'user_id',
    value: '${uuid()}',
    scope: VariableScope.PROFILE,
    description: 'Current user identifier',
    enabled: true,
    tags: ['user', 'id'],
    profileId: 'dev-profile',
    metadata: {
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      usageCount: 12,
      lastUsed: new Date('2024-01-06T00:00:00Z'),
    },
  },
  {
    id: 'var-3',
    name: 'request_timestamp',
    value: '${timestamp()}',
    scope: VariableScope.SYSTEM,
    description: 'Current request timestamp',
    enabled: true,
    tags: ['time', 'system'],
    metadata: {
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      usageCount: 100,
      lastUsed: new Date('2024-01-07T00:00:00Z'),
    },
  },
  {
    id: 'var-4',
    name: 'rule_specific_header',
    value: 'custom-rule-value',
    scope: VariableScope.RULE,
    description: 'Rule-specific header value',
    enabled: true,
    tags: ['rule', 'custom'],
    ruleId: 'rule-1',
    metadata: {
      createdAt: new Date('2024-01-03T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z'),
      usageCount: 3,
    },
  },
];

/**
 * Mock extension settings
 */
export const mockSettings = {
  enabled: true,
  debugMode: true,
  logLevel: 'debug' as const,
  notifications: {
    enabled: true,
    showRuleMatches: true,
    showErrors: true,
    showUpdates: true,
  },
  ui: {
    theme: 'auto' as const,
    compactMode: false,
    showAdvancedOptions: true,
    defaultTab: 'rules' as const,
  },
  performance: {
    maxRules: 100,
    cacheTimeout: 300000,
    enableMetrics: true,
  },
  backup: {
    autoBackup: true,
    backupInterval: 24,
    maxBackups: 5,
  },
  security: {
    requireConfirmation: false,
    allowExternalImport: true,
    validatePatterns: true,
  },
};

/**
 * Mock Chrome tabs for testing
 */
export const mockTabs = {
  activeTab: {
    id: 1,
    index: 0,
    windowId: 1,
    highlighted: false,
    active: true,
    pinned: false,
    incognito: false,
    selected: true,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'https://api.example.com/v1/users',
    title: 'API Example',
    favIconUrl: 'https://api.example.com/favicon.ico',
    status: 'complete' as const,
  },
  localTab: {
    id: 2,
    index: 1,
    windowId: 1,
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'http://localhost:3000/app',
    title: 'Local Development',
    status: 'complete' as const,
  },
  productionTab: {
    id: 3,
    index: 2,
    windowId: 1,
    highlighted: false,
    active: false,
    pinned: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'https://app.production.com/dashboard',
    title: 'Production App',
    status: 'complete' as const,
  },
};

/**
 * Common test scenarios
 */
export const testScenarios = {
  /**
   * Empty state - no data loaded
   */
  emptyState: {
    rules: [],
    profiles: [],
    variables: [],
    settings: mockSettings,
    enabled: true,
    activeProfile: 'dev-profile',
  },

  /**
   * Loading state - data is being fetched
   */
  loadingState: {
    // Omit properties entirely for loading state to be compatible with exactOptionalPropertyTypes
  },

  /**
   * Normal state with data
   */
  normalState: {
    rules: mockRules,
    profiles: mockProfiles,
    variables: mockVariables,
    settings: mockSettings,
    enabled: true,
    activeProfile: 'dev-profile',
  },

  /**
   * Extension disabled state
   */
  disabledState: {
    rules: mockRules,
    profiles: mockProfiles,
    variables: mockVariables,
    settings: { ...mockSettings, enabled: false },
    enabled: false,
    activeProfile: 'dev-profile',
  },

  /**
   * Error state
   */
  errorState: {
    rules: [],
    profiles: [],
    variables: [],
    settings: mockSettings,
    enabled: false,
    activeProfile: 'dev-profile',
    error: 'Failed to load extension data',
  },

  /**
   * Compact mode state
   */
  compactState: {
    rules: mockRules.slice(0, 2), // Fewer rules for compact view
    profiles: mockProfiles,
    variables: mockVariables,
    settings: {
      ...mockSettings,
      ui: { ...mockSettings.ui, compactMode: true },
    },
    enabled: true,
    activeProfile: 'dev-profile',
  },

  /**
   * Production profile active
   */
  productionState: {
    rules: mockRules.filter(rule => rule.profileId === 'prod-profile'),
    profiles: mockProfiles,
    variables: mockVariables,
    settings: mockSettings,
    enabled: true,
    activeProfile: 'prod-profile',
  },

  /**
   * Unassigned rules view
   */
  unassignedState: {
    rules: mockRules.filter(rule => !rule.profileId),
    profiles: mockProfiles,
    variables: mockVariables,
    settings: mockSettings,
    enabled: true,
    activeProfile: 'unassigned',
  },
};

/**
 * Helper functions to create test data variations
 */
export const createTestData = {
  /**
   * Create a rule with custom properties
   */
  rule: (overrides: Partial<HeaderRule> = {}): HeaderRule => ({
    id: `rule-${Date.now()}`,
    name: 'Test Rule',
    enabled: true,
    pattern: { domain: 'example.com' },
    headers: [
      {
        name: 'X-Test',
        value: 'test',
        operation: 'set',
        target: 'request',
      },
    ],
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create a profile with custom properties
   */
  profile: (overrides: Partial<Profile> = {}): Profile => ({
    id: `profile-${Date.now()}`,
    name: 'Test Profile',
    color: '#10b981',
    environment: 'development',
    rules: [],
    enabled: true,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Create a variable with custom properties
   */
  variable: (overrides: Partial<Variable> = {}): Variable => ({
    id: `var-${Date.now()}`,
    name: 'test_var',
    value: 'test-value',
    scope: VariableScope.GLOBAL,
    enabled: true,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...overrides,
  }),

  /**
   * Create Chrome tab with custom properties
   */
  tab: (overrides: Partial<chrome.tabs.Tab> = {}): chrome.tabs.Tab => ({
    id: Date.now(),
    index: 0,
    windowId: 1,
    highlighted: false,
    active: true,
    pinned: false,
    incognito: false,
    selected: true,
    discarded: false,
    autoDiscardable: true,
    groupId: -1,
    url: 'https://example.com',
    title: 'Test Tab',
    status: 'complete',
    ...overrides,
  }),
};

/**
 * Default export with all test data
 */
export default {
  mockRules,
  mockProfiles,
  mockVariables,
  mockSettings,
  mockTabs,
  testScenarios,
  createTestData,
};

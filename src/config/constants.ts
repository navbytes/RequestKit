// Application constants

export const APP_NAME = 'RequestKit';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  RULES: 'rules',
  TEMPLATES: 'templates',
  PROFILES: 'profiles',
  SETTINGS: 'settings',
  STATS: 'stats',
  PROFILE_STATS: 'profileStats',
  ACTIVE_PROFILE: 'activeProfile',
  VERSION: 'version',
  LAST_BACKUP: 'lastBackup',
  VARIABLES: 'variables',
  GLOBAL_VARIABLES: 'variables.global',
  PROFILE_VARIABLES: 'variables.profiles',
  NETWORK_REQUESTS: 'networkRequests',
  DEVTOOLS_CAPTURE_ENABLED: 'devtools.captureEnabled',
  DEVTOOLS_SETTINGS: 'devtools.settings',
} satisfies Record<string, string>;

// Default settings
export const DEFAULT_SETTINGS = {
  enabled: true,
  debugMode: false,
  logLevel: 'info' as const,
  notifications: {
    enabled: true,
    showRuleMatches: false,
    showErrors: true,
    showUpdates: true,
  },
  ui: {
    theme: 'auto' as const,
    compactMode: false,
    showAdvancedOptions: false,
    defaultTab: 'rules',
  },
  performance: {
    maxRules: 100,
    cacheTimeout: 300000, // 5 minutes
    enableMetrics: true,
  },
  backup: {
    autoBackup: true,
    backupInterval: 24, // hours
    maxBackups: 5,
  },
  security: {
    requireConfirmation: true,
    allowExternalImport: false,
    validatePatterns: true,
  },
};

// Rule priorities
export const RULE_PRIORITIES = {
  VERY_LOW: 1,
  LOW: 25,
  NORMAL: 50,
  HIGH: 75,
  VERY_HIGH: 100,
} satisfies Record<string, number>;

// Header operations
export const HEADER_OPERATIONS = {
  SET: 'set',
  APPEND: 'append',
  REMOVE: 'remove',
} satisfies Record<string, string>;

// Pattern matching
export const PATTERN_WILDCARDS = {
  ANY: '*',
  SINGLE: '?',
} satisfies Record<string, string>;

// URL protocols
export const PROTOCOLS = {
  HTTP: 'http',
  HTTPS: 'https',
  ANY: '*',
} satisfies Record<string, string>;

// Rule condition types
export const CONDITION_TYPES = {
  URL: 'url',
  METHOD: 'method',
  HEADER: 'header',
  TIME: 'time',
  CUSTOM: 'custom',
} satisfies Record<string, string>;

// Rule condition operators
export const CONDITION_OPERATORS = {
  EQUALS: 'equals',
  CONTAINS: 'contains',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  REGEX: 'regex',
  EXISTS: 'exists',
  NOT: 'not',
} satisfies Record<string, string>;

// HTTP methods
export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'CONNECT',
  'TRACE',
] satisfies readonly string[];

// Common header names
export const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Origin',
  'Referer',
  'User-Agent',
  'X-Requested-With',
  'X-Forwarded-For',
  'X-Real-IP',
  'X-Custom-Header',
] satisfies readonly string[];

// Template categories
export const TEMPLATE_CATEGORIES = {
  AUTHENTICATION: 'Authentication',
  CORS: 'CORS',
  SECURITY: 'Security',
  DEBUGGING: 'Debugging',
  PERFORMANCE: 'Performance',
  CUSTOM: 'Custom',
} satisfies Record<string, string>;

// Built-in templates
export const BUILT_IN_TEMPLATES = [
  {
    id: 'cors-headers',
    name: 'CORS Headers',
    description: 'Enable Cross-Origin Resource Sharing',
    category: TEMPLATE_CATEGORIES.CORS,
    headers: [
      { name: 'Access-Control-Allow-Origin', value: '*', operation: 'set' },
      {
        name: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
        operation: 'set',
      },
      {
        name: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization',
        operation: 'set',
      },
    ],
    tags: ['cors', 'api', 'development'],
    isBuiltIn: true,
  },
  {
    id: 'auth-bearer',
    name: 'Bearer Token',
    description: 'Add Authorization header with Bearer token',
    category: TEMPLATE_CATEGORIES.AUTHENTICATION,
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer YOUR_TOKEN_HERE',
        operation: 'set',
      },
    ],
    tags: ['auth', 'bearer', 'token'],
    isBuiltIn: true,
  },
  {
    id: 'debug-headers',
    name: 'Debug Headers',
    description: 'Add debugging information headers',
    category: TEMPLATE_CATEGORIES.DEBUGGING,
    headers: [
      { name: 'X-Debug-Mode', value: 'true', operation: 'set' },
      { name: 'X-Request-ID', value: '{{uuid}}', operation: 'set' },
      { name: 'X-Timestamp', value: '{{timestamp}}', operation: 'set' },
    ],
    tags: ['debug', 'development', 'testing'],
    isBuiltIn: true,
  },
  {
    id: 'security-headers',
    name: 'Security Headers',
    description: 'Add common security headers',
    category: TEMPLATE_CATEGORIES.SECURITY,
    headers: [
      { name: 'X-Content-Type-Options', value: 'nosniff', operation: 'set' },
      { name: 'X-Frame-Options', value: 'DENY', operation: 'set' },
      { name: 'X-XSS-Protection', value: '1; mode=block', operation: 'set' },
    ],
    tags: ['security', 'protection', 'headers'],
    isBuiltIn: true,
  },
] satisfies readonly {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly headers: readonly {
    readonly name: string;
    readonly value: string;
    readonly operation: string;
  }[];
  readonly tags: readonly string[];
  readonly isBuiltIn: boolean;
}[];

// Validation patterns
export const VALIDATION_PATTERNS = {
  DOMAIN:
    /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  URL_PATH: /^\/.*$/,
  HEADER_NAME: /^[a-zA-Z0-9-_]+$/,
  PORT: /^(\d{1,5}|\*)$/,
} satisfies Record<string, RegExp>;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_DOMAIN: 'Invalid domain pattern',
  INVALID_PATH: 'Path must start with /',
  INVALID_HEADER_NAME: 'Header name contains invalid characters',
  INVALID_PORT: 'Port must be a number between 1-65535 or *',
  RULE_NOT_FOUND: 'Rule not found',
  TEMPLATE_NOT_FOUND: 'Template not found',
  STORAGE_ERROR: 'Failed to save data',
  IMPORT_ERROR: 'Failed to import data',
  EXPORT_ERROR: 'Failed to export data',
} satisfies Record<string, string>;

// UI constants
export const UI_CONSTANTS = {
  MAX_RULE_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_HEADER_VALUE_LENGTH: 2000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} satisfies Record<string, number>;

// Chrome extension limits
export const CHROME_LIMITS = {
  MAX_DYNAMIC_RULES: 5000,
  MAX_STATIC_RULES: 30000,
  MAX_RULE_PRIORITY: 2147483647,
  MIN_RULE_PRIORITY: 1,
} satisfies Record<string, number>;

// Icon paths for different themes
export const ICON_PATHS = {
  LIGHT: {
    16: 'assets/icons/icon-16.png',
    32: 'assets/icons/icon-32.png',
    48: 'assets/icons/icon-48.png',
    128: 'assets/icons/icon-128.png',
  },
  DARK: {
    16: 'assets/icons/icon-white-16.png',
    32: 'assets/icons/icon-white-32.png',
    48: 'assets/icons/icon-white-48.png',
    128: 'assets/icons/icon-white-128.png',
  },
} satisfies Record<'LIGHT' | 'DARK', Record<string, string>>;

// Theme detection
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} satisfies Record<string, string>;

// Default profiles - function to avoid Date() execution at module load time
export const getDefaultProfiles = () => {
  const now = new Date();
  return {
    'dev-profile': {
      id: 'dev-profile',
      name: 'Development',
      description:
        'Profile for development environment with debug features enabled',
      color: '#10b981',
      environment: 'development' satisfies
        | 'development'
        | 'staging'
        | 'production',
      rules: [],
      enabled: true,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: true,
        logLevel: 'debug' as const,
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
    'prod-profile': {
      id: 'prod-profile',
      name: 'Production',
      description: 'Profile for production environment with minimal logging',
      color: '#ef4444',
      environment: 'production' satisfies
        | 'development'
        | 'staging'
        | 'production',
      rules: [],
      enabled: false,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      settings: {
        debugMode: false,
        logLevel: 'error' as const,
        notifications: {
          enabled: false,
          showRuleMatches: false,
          showErrors: true,
        },
        performance: {
          maxRules: 100,
          enableMetrics: false,
        },
      },
    },
  } satisfies Record<
    string,
    {
      readonly id: string;
      readonly name: string;
      readonly description: string;
      readonly color: string;
      readonly environment: 'development' | 'staging' | 'production';
      readonly rules: readonly unknown[];
      readonly enabled: boolean;
      readonly isDefault: boolean;
      readonly createdAt: Date;
      readonly updatedAt: Date;
      readonly settings: {
        readonly debugMode: boolean;
        readonly logLevel: 'info' | 'debug' | 'warn' | 'error';
        readonly notifications: {
          readonly enabled: boolean;
          readonly showRuleMatches: boolean;
          readonly showErrors: boolean;
        };
        readonly performance: {
          readonly maxRules: number;
          readonly enableMetrics: boolean;
        };
      };
    }
  >;
};

// Removed DEFAULT_PROFILES export to avoid Date() execution at module load time
// Use getDefaultProfiles() function instead, but only in non-service-worker contexts

// Resource types for enhanced filtering
export const RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'csp_report',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
] satisfies readonly string[];

export type ResourceType = (typeof RESOURCE_TYPES)[number];

/**
 * Supported locale codes
 */
const LOCALE_DISPLAY_DATA = {
  en: {
    en: 'English',
    hi: 'Hindi',
  },
  hi: {
    en: 'अंग्रेजी',
    hi: 'हिंदी',
  },
} as const;

// Generate everything from the single source
export type SupportedLocale = keyof typeof LOCALE_DISPLAY_DATA;

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = Object.keys(
  LOCALE_DISPLAY_DATA
) as SupportedLocale[];

export const SUPPORTED_LOCALES_DISPLAY_NAMES: typeof LOCALE_DISPLAY_DATA =
  LOCALE_DISPLAY_DATA;

export const SUPPORTED_LOCALES_NATIVE_DISPLAY_NAMES: Record<
  SupportedLocale,
  string
> = {
  en: LOCALE_DISPLAY_DATA.en.en,
  hi: LOCALE_DISPLAY_DATA.hi.hi,
};

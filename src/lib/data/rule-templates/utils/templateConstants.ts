/**
 * Template constants and configuration
 */

/**
 * Available template categories
 */
export const TEMPLATE_CATEGORIES = {
  CORS: 'cors',
  AUTH: 'auth',
  SECURITY: 'security',
  DEBUGGING: 'debugging',
  API: 'api',
  PERFORMANCE: 'performance',
  CONDITIONAL: 'conditional',
  FILE: 'file',
  ADVANCED: 'advanced',
} as const;

/**
 * Available template types
 */
export const TEMPLATE_TYPES = {
  HEADERS: 'headers',
  CONDITIONAL: 'conditional',
  FILE: 'file',
  ADVANCED: 'advanced',
  COMPLETE: 'complete',
} as const;

/**
 * Default template configuration
 */
export const DEFAULT_TEMPLATE_CONFIG = {
  popularity: 50,
  author: 'User',
  isBuiltIn: false,
  tags: [],
} as const;

/**
 * Template validation limits
 */
export const TEMPLATE_LIMITS = {
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_HEADERS: 20,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
} as const;

/**
 * Common template tags
 */
export const COMMON_TAGS = [
  'cors',
  'auth',
  'security',
  'debug',
  'api',
  'performance',
  'variables',
  'development',
  'testing',
  'production',
] as const;

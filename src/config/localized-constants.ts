/**
 * Localized constants - provides message keys for internationalization
 * This file replaces hardcoded strings with i18n message keys
 */

import { I18nUtils } from '@/shared/utils/i18n';

// Application constants (now using i18n)
export const APP_NAME_KEY = 'extensionName';
export const APP_VERSION_KEY = 'app_version';

// Get localized app name and version
export const getAppName = (): string => I18nUtils.getMessage(APP_NAME_KEY);
export const getAppVersion = (): string =>
  I18nUtils.getMessage(APP_VERSION_KEY);

// Error message keys (replacing ERROR_MESSAGES)
export const ERROR_MESSAGE_KEYS = {
  INVALID_DOMAIN: 'errors_validation_domain_invalid',
  INVALID_PATH: 'errors_validation_path_invalid',
  INVALID_HEADER_NAME: 'errors_validation_header_name_invalid',
  INVALID_PORT: 'errors_validation_port_invalid',
  RULE_NOT_FOUND: 'errors_rule_not_found',
  TEMPLATE_NOT_FOUND: 'errors_template_not_found',
  STORAGE_ERROR: 'errors_storage_error',
  IMPORT_ERROR: 'errors_import_error',
  EXPORT_ERROR: 'errors_export_error',
  NETWORK_ERROR: 'errors_network_error',
  PERMISSION_DENIED: 'errors_permission_denied',
  INVALID_FORMAT: 'errors_invalid_format',
} satisfies Record<string, string>;

// Template category keys (replacing TEMPLATE_CATEGORIES)
export const TEMPLATE_CATEGORY_KEYS = {
  AUTHENTICATION: 'templates_category_authentication',
  CORS: 'templates_category_cors',
  SECURITY: 'templates_category_security',
  DEBUGGING: 'templates_category_debugging',
  PERFORMANCE: 'templates_category_performance',
  CUSTOM: 'templates_category_custom',
} satisfies Record<string, string>;

// Header operation keys (replacing display names)
export const HEADER_OPERATION_KEYS = {
  SET: 'operation_set',
  APPEND: 'operation_append',
  REMOVE: 'operation_remove',
} satisfies Record<string, string>;

// Rule priority keys (replacing display names)
export const RULE_PRIORITY_KEYS = {
  VERY_LOW: 'rules_priority_very_low',
  LOW: 'rules_priority_low',
  NORMAL: 'rules_priority_normal',
  HIGH: 'rules_priority_high',
  VERY_HIGH: 'rules_priority_very_high',
} satisfies Record<string, string>;

// Theme keys
export const THEME_KEYS = {
  LIGHT: 'settings_theme_light',
  DARK: 'settings_theme_dark',
  AUTO: 'settings_theme_auto',
} satisfies Record<string, string>;

// Settings tab keys
export const SETTINGS_TAB_KEYS = {
  GENERAL: 'settings_general',
  NOTIFICATIONS: 'settings_notifications',
  PERFORMANCE: 'tab_performance',
  SECURITY: 'settings_security',
  BACKUP: 'settings_backup',
} satisfies Record<string, string>;

// UI button keys
export const UI_BUTTON_KEYS = {
  SAVE: 'ui_button_save',
  CANCEL: 'common_cancel',
  DELETE: 'ui_button_delete',
  EDIT: 'ui_button_edit',
  ADD: 'ui_button_add',
  CREATE: 'ui_button_create',
  UPDATE: 'ui_button_update',
  REMOVE: 'common_remove',
  CLOSE: 'ui_button_close',
  BACK: 'ui_button_back',
  NEXT: 'ui_button_next',
  FINISH: 'ui_button_finish',
  APPLY: 'ui_button_apply',
  RESET: 'ui_button_reset',
  CLEAR: 'ui_button_clear',
  REFRESH: 'ui_button_refresh',
  EXPORT: 'ui_button_export',
  IMPORT: 'common_import',
  COPY: 'ui_button_copy',
  PASTE: 'ui_button_paste',
} satisfies Record<string, string>;

// UI label keys
export const UI_LABEL_KEYS = {
  NAME: 'ui_label_name',
  DESCRIPTION: 'ui_label_description',
  URL: 'common_url',
  METHOD: 'common_method',
  HEADERS: 'common_headers',
  VALUE: 'ui_label_value',
  ENABLED: 'ui_label_enabled',
  DISABLED: 'common_disabled',
  PRIORITY: 'ui_label_priority',
  PATTERN: 'ui_label_pattern',
  OPERATION: 'ui_label_operation',
  STATUS: 'common_status',
  TYPE: 'ui_label_type',
  CATEGORY: 'ui_label_category',
  TAGS: 'ui_label_tags',
} satisfies Record<string, string>;

// Context menu keys
export const CONTEXT_MENU_KEYS = {
  CREATE_RULE: 'contextmenu_create_rule',
  OPEN_OPTIONS: 'contextmenu_open_options',
  TOGGLE_EXTENSION: 'contextmenu_toggle_extension',
} satisfies Record<string, string>;

// DevTools keys
export const DEVTOOLS_KEYS = {
  PANEL_TITLE: 'extensionName',
  REQUESTS_TAB: 'devtools_requests_tab',
  RULES_TAB: 'tab_rules',
  PERFORMANCE_TAB: 'tab_performance',
  NO_REQUESTS: 'devtools_no_requests_captured',
  REQUEST_DETAILS: 'devtools_request_details',
  MATCHED_RULES: 'devtools_matched_rules_label',
} satisfies Record<string, string>;

// Notification message keys
export const NOTIFICATION_KEYS = {
  RULE_CREATED: 'notifications_rule_created',
  RULE_UPDATED: 'notifications_rule_updated',
  RULE_DELETED: 'notifications_rule_deleted',
  PROFILE_SWITCHED: 'notifications_profile_switched',
  EXTENSION_ENABLED: 'notifications_extension_enabled',
  EXTENSION_DISABLED: 'notifications_extension_disabled',
  BACKUP_CREATED: 'notifications_backup_created',
  DATA_IMPORTED: 'notifications_data_imported',
} satisfies Record<string, string>;

// Built-in template keys (replacing BUILT_IN_TEMPLATES with localized versions)
export const BUILT_IN_TEMPLATE_KEYS = {
  CORS_NAME: 'templates_cors_name',
  CORS_DESCRIPTION: 'templates_cors_description',
  AUTH_BEARER_NAME: 'templates_auth_bearer_name',
  AUTH_BEARER_DESCRIPTION: 'templates_auth_bearer_description',
  DEBUG_NAME: 'templates_debug_name',
  DEBUG_DESCRIPTION: 'templates_debug_description',
  SECURITY_NAME: 'templates_security_name',
  SECURITY_DESCRIPTION: 'templates_security_description',
} satisfies Record<string, string>;

// Profile keys
export const PROFILE_KEYS = {
  DEFAULT_DEV_NAME: 'profiles_default_dev_name',
  DEFAULT_DEV_DESCRIPTION: 'profiles_default_dev_description',
  DEFAULT_PROD_NAME: 'profiles_default_prod_name',
  DEFAULT_PROD_DESCRIPTION: 'profiles_default_prod_description',
} satisfies Record<string, string>;

/**
 * Helper functions to get localized strings
 */
export const LocalizedStrings = {
  // Error messages
  getErrorMessage: (key: keyof typeof ERROR_MESSAGE_KEYS): string =>
    I18nUtils.getMessage(ERROR_MESSAGE_KEYS[key]),

  // Template categories
  getTemplateCategory: (key: keyof typeof TEMPLATE_CATEGORY_KEYS): string =>
    I18nUtils.getMessage(TEMPLATE_CATEGORY_KEYS[key]),

  // Header operations
  getHeaderOperation: (key: keyof typeof HEADER_OPERATION_KEYS): string =>
    I18nUtils.getMessage(HEADER_OPERATION_KEYS[key]),

  // Rule priorities
  getRulePriority: (key: keyof typeof RULE_PRIORITY_KEYS): string =>
    I18nUtils.getMessage(RULE_PRIORITY_KEYS[key]),

  // Themes
  getTheme: (key: keyof typeof THEME_KEYS): string =>
    I18nUtils.getMessage(THEME_KEYS[key]),

  // Settings tabs
  getSettingsTab: (key: keyof typeof SETTINGS_TAB_KEYS): string =>
    I18nUtils.getMessage(SETTINGS_TAB_KEYS[key]),

  // UI buttons
  getButton: (key: keyof typeof UI_BUTTON_KEYS): string =>
    I18nUtils.getMessage(UI_BUTTON_KEYS[key]),

  // UI labels
  getLabel: (key: keyof typeof UI_LABEL_KEYS): string =>
    I18nUtils.getMessage(UI_LABEL_KEYS[key]),

  // Context menu
  getContextMenu: (key: keyof typeof CONTEXT_MENU_KEYS): string =>
    I18nUtils.getMessage(CONTEXT_MENU_KEYS[key]),

  // DevTools
  getDevTools: (key: keyof typeof DEVTOOLS_KEYS): string =>
    I18nUtils.getMessage(DEVTOOLS_KEYS[key]),

  // Notifications
  getNotification: (
    key: keyof typeof NOTIFICATION_KEYS,
    substitutions?: string[]
  ): string => I18nUtils.getMessage(NOTIFICATION_KEYS[key], substitutions),

  // Templates
  getTemplate: (key: keyof typeof BUILT_IN_TEMPLATE_KEYS): string =>
    I18nUtils.getMessage(BUILT_IN_TEMPLATE_KEYS[key]),

  // Profiles
  getProfile: (key: keyof typeof PROFILE_KEYS): string =>
    I18nUtils.getMessage(PROFILE_KEYS[key]),
};

/**
 * Get localized built-in templates
 */
export const getLocalizedBuiltInTemplates = () => [
  {
    id: 'cors-headers',
    name: LocalizedStrings.getTemplate('CORS_NAME'),
    description: LocalizedStrings.getTemplate('CORS_DESCRIPTION'),
    category: LocalizedStrings.getTemplateCategory('CORS'),
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
    name: LocalizedStrings.getTemplate('AUTH_BEARER_NAME'),
    description: LocalizedStrings.getTemplate('AUTH_BEARER_DESCRIPTION'),
    category: LocalizedStrings.getTemplateCategory('AUTHENTICATION'),
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
    name: LocalizedStrings.getTemplate('DEBUG_NAME'),
    description: LocalizedStrings.getTemplate('DEBUG_DESCRIPTION'),
    category: LocalizedStrings.getTemplateCategory('DEBUGGING'),
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
    name: LocalizedStrings.getTemplate('SECURITY_NAME'),
    description: LocalizedStrings.getTemplate('SECURITY_DESCRIPTION'),
    category: LocalizedStrings.getTemplateCategory('SECURITY'),
    headers: [
      { name: 'X-Content-Type-Options', value: 'nosniff', operation: 'set' },
      { name: 'X-Frame-Options', value: 'DENY', operation: 'set' },
      { name: 'X-XSS-Protection', value: '1; mode=block', operation: 'set' },
    ],
    tags: ['security', 'protection', 'headers'],
    isBuiltIn: true,
  },
];

/**
 * Get localized default profiles
 */
export const getLocalizedDefaultProfiles = () => {
  const now = new Date();
  return {
    'dev-profile': {
      id: 'dev-profile',
      name: LocalizedStrings.getProfile('DEFAULT_DEV_NAME'),
      description: LocalizedStrings.getProfile('DEFAULT_DEV_DESCRIPTION'),
      color: '#10b981',
      environment: 'development' as const,
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
      name: LocalizedStrings.getProfile('DEFAULT_PROD_NAME'),
      description: LocalizedStrings.getProfile('DEFAULT_PROD_DESCRIPTION'),
      color: '#ef4444',
      environment: 'production' as const,
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
  };
};

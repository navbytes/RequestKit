// Main shared module exports

// Hooks (for React/Preact contexts)
export * from './hooks';

// Export types with specific naming to avoid conflicts
export type {
  HeaderRule,
  URLPattern,
  HeaderEntry,
  FileInterception,
  RuleCondition,
  ConditionalRule,
  PatternMatchResult,
  RuleValidationResult,
  RuleStats,
  ConditionalLogic,
  AdvancedRule,
  RuleSchedule,
  RuleLimits,
  RuleExportFormat,
  RuleExportData,
} from './types';

// Export other types without conflicts
export * from './types/chrome';
export * from './types/profiles';
export * from './types/storage';
export * from './types/variables';

// Export templates with specific naming
export type {
  RuleTemplate,
  TemplateExample,
  TemplateCategory,
  AdvancedPattern,
  TemplateCategoryId,
} from './types';

export { TEMPLATE_CATEGORIES } from './types';

// Re-export RuleTestResult with specific naming to avoid conflicts
export type { RuleTestResult as TypesRuleTestResult } from './types';

// Utility exports
export { ChromeApiUtils } from './utils/chrome-api';
export { ThemeManager, useTheme, initializeTheme } from './utils/theme';
export type { Theme } from './utils/theme';
export {
  validateHeaderRule,
  validateRuleTemplate,
  validateURLPatternDetailed,
  validateHeaderName,
  validateHeaderValue,
  validateRuleCondition,
  validateRuleNameUniqueness,
  validateImportData,
  validateURL,
  validateFileSize,
  sanitizeInput,
  isValidJSON,
} from './utils/validation';
export type { ValidationResult } from './utils/validation';

// Components and data are context-specific, so they should be imported directly
// when needed rather than re-exported from the main shared module

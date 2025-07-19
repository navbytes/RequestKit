// Type definitions exports
export * from './chrome';
export * from './profiles';
export * from './storage';
export * from './variables';

// Export rules types but exclude RuleTemplate to avoid conflict
export type {
  HeaderRule,
  URLPattern,
  HeaderEntry,
  FileInterception,
  RuleCondition,
  ConditionalRule,
  PatternMatchResult,
  RuleValidationResult,
  RuleTestResult,
  RuleStats,
  ConditionalLogic,
  AdvancedRule,
  RuleSchedule,
  RuleLimits,
  RuleExportFormat,
  RuleExportData,
} from './rules';

// Export templates with specific naming to avoid conflicts
export type {
  RuleTemplate,
  TemplateExample,
  TemplateCategory,
  AdvancedPattern,
  TemplateCategoryId,
} from './templates';

export { TEMPLATE_CATEGORIES } from './templates';

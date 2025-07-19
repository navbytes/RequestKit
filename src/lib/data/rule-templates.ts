/**
 * Built-in rule templates for common use cases
 *
 * This file now uses the modular template system for better maintainability.
 * The original 951-line file has been refactored into focused modules.
 */

// Re-export everything from the modular system
export {
  BUILT_IN_TEMPLATES,
  searchTemplates,
  getTemplatesByCategory,
  getPopularTemplates,
  advancedSearchTemplates,
  getSearchSuggestions,
  getTemplatesByTags,
  getBuiltInTemplates,
  getCustomTemplates,
  getTemplatesByType,
  getRecentTemplates,
  getTemplatesByAuthor,
  getUniqueCategories,
  getUniqueTags,
  validateTemplate,
  validateTemplates,
  checkDuplicateIds,
  cloneTemplate,
  mergeTemplateHeaders,
  extractTemplateVariables,
  templateUsesVariables,
  generateTemplateSummary,
  TEMPLATE_CATEGORIES,
  TEMPLATE_TYPES,
  DEFAULT_TEMPLATE_CONFIG,
  TEMPLATE_LIMITS,
  COMMON_TAGS,
  CORS_TEMPLATES,
  AUTH_TEMPLATES,
  SECURITY_TEMPLATES,
  DEBUG_TEMPLATES,
  API_TEMPLATES,
  ADVANCED_TEMPLATES,
} from './rule-templates/index';

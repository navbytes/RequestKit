/**
 * Rule Templates System - Main Orchestrator
 * Modular architecture for managing built-in rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

// Import all template categories
import { ADVANCED_TEMPLATES } from './categories/advancedTemplates';
import { API_TEMPLATES } from './categories/apiTemplates';
import { AUTH_TEMPLATES } from './categories/authTemplates';
import { CORS_TEMPLATES } from './categories/corsTemplates';
import { DEBUG_TEMPLATES } from './categories/debugTemplates';
import { SECURITY_TEMPLATES } from './categories/securityTemplates';
// Import operations
import {
  getTemplatesByCategory,
  getPopularTemplates,
  getTemplatesByTags,
  getBuiltInTemplates,
  getCustomTemplates,
  getTemplatesByType,
  getRecentTemplates,
  getTemplatesByAuthor,
  getUniqueCategories,
  getUniqueTags,
} from './operations/templateFiltering';
import {
  searchTemplates,
  advancedSearchTemplates,
  getSearchSuggestions,
} from './operations/templateSearch';
import {
  validateTemplate,
  validateTemplates,
  checkDuplicateIds,
  type TemplateValidationResult,
} from './operations/templateValidation';
// Import utilities
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_TYPES,
  DEFAULT_TEMPLATE_CONFIG,
  TEMPLATE_LIMITS,
  COMMON_TAGS,
} from './utils/templateConstants';
import {
  cloneTemplate,
  mergeTemplateHeaders,
  extractTemplateVariables,
  templateUsesVariables,
  generateTemplateSummary,
} from './utils/templateUtils';

/**
 * All built-in templates combined
 */
export const BUILT_IN_TEMPLATES: RuleTemplate[] = [
  ...CORS_TEMPLATES,
  ...AUTH_TEMPLATES,
  ...SECURITY_TEMPLATES,
  ...DEBUG_TEMPLATES,
  ...API_TEMPLATES,
  ...ADVANCED_TEMPLATES,
];

// Re-export all operations for backward compatibility
export {
  // Search operations
  searchTemplates,
  advancedSearchTemplates,
  getSearchSuggestions,

  // Filtering operations
  getTemplatesByCategory,
  getPopularTemplates,
  getTemplatesByTags,
  getBuiltInTemplates,
  getCustomTemplates,
  getTemplatesByType,
  getRecentTemplates,
  getTemplatesByAuthor,
  getUniqueCategories,
  getUniqueTags,

  // Validation operations
  validateTemplate,
  validateTemplates,
  checkDuplicateIds,
  type TemplateValidationResult,

  // Utility functions
  cloneTemplate,
  mergeTemplateHeaders,
  extractTemplateVariables,
  templateUsesVariables,
  generateTemplateSummary,

  // Constants
  TEMPLATE_CATEGORIES,
  TEMPLATE_TYPES,
  DEFAULT_TEMPLATE_CONFIG,
  TEMPLATE_LIMITS,
  COMMON_TAGS,
};

// Re-export individual template categories
export {
  CORS_TEMPLATES,
  AUTH_TEMPLATES,
  SECURITY_TEMPLATES,
  DEBUG_TEMPLATES,
  API_TEMPLATES,
  ADVANCED_TEMPLATES,
};

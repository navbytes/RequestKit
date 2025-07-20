/**
 * Template validation operations
 */

import type { RuleTemplate } from '@/shared/types/templates';

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a single template
 */
export function validateTemplate(
  template: RuleTemplate
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!template.id) {
    errors.push('Template ID is required');
  }

  if (!template.name) {
    errors.push('Template name is required');
  }

  if (!template.description) {
    errors.push('Template description is required');
  }

  if (!template.category) {
    errors.push('Template category is required');
  }

  if (!template.templateType) {
    errors.push('Template type is required');
  }

  // Headers validation
  if (!template.headers || template.headers.length === 0) {
    warnings.push('Template has no headers defined');
  } else {
    template.headers.forEach((header, index) => {
      if (!header.name) {
        errors.push(`Header ${index + 1}: name is required`);
      }
      if (!header.value) {
        errors.push(`Header ${index + 1}: value is required`);
      }
      if (!header.operation) {
        errors.push(`Header ${index + 1}: operation is required`);
      }
      if (!header.target) {
        errors.push(`Header ${index + 1}: target is required`);
      }
    });
  }

  // Tags validation
  if (!template.tags || template.tags.length === 0) {
    warnings.push('Template has no tags defined');
  }

  // Popularity validation
  if (
    template.popularity !== undefined &&
    (template.popularity < 0 || template.popularity > 100)
  ) {
    warnings.push('Popularity should be between 0 and 100');
  }

  // Author validation
  if (!template.author) {
    warnings.push('Template author is not specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple templates
 */
export function validateTemplates(templates: RuleTemplate[]): {
  isValid: boolean;
  results: Array<{
    template: RuleTemplate;
    validation: TemplateValidationResult;
  }>;
  summary: { total: number; valid: number; invalid: number; warnings: number };
} {
  const results = templates.map(template => ({
    template,
    validation: validateTemplate(template),
  }));

  const summary = {
    total: templates.length,
    valid: results.filter(r => r.validation.isValid).length,
    invalid: results.filter(r => !r.validation.isValid).length,
    warnings: results.filter(r => r.validation.warnings.length > 0).length,
  };

  return {
    isValid: summary.invalid === 0,
    results,
    summary,
  };
}

/**
 * Check for duplicate template IDs
 */
export function checkDuplicateIds(templates: RuleTemplate[]): string[] {
  const ids = new Map<string, number>();
  const duplicates: string[] = [];

  templates.forEach(template => {
    const count = ids.get(template.id) || 0;
    ids.set(template.id, count + 1);
  });

  ids.forEach((count, id) => {
    if (count > 1) {
      duplicates.push(id);
    }
  });

  return duplicates;
}

/**
 * Template utility functions
 */

import type { RuleTemplate } from '@/shared/types/templates';

/**
 * Clone a template with a new ID
 */
export function cloneTemplate(
  template: RuleTemplate,
  newId: string
): RuleTemplate {
  return {
    ...template,
    id: newId,
    name: `${template.name} (Copy)`,
    isBuiltIn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Merge template headers with existing headers
 */
export function mergeTemplateHeaders(
  template: RuleTemplate,
  existingHeaders: Array<{
    name: string;
    value: string;
    operation: string;
    target: string;
  }>
): Array<{ name: string; value: string; operation: string; target: string }> {
  const merged = [...existingHeaders];

  template.headers?.forEach(templateHeader => {
    const existingIndex = merged.findIndex(h => h.name === templateHeader.name);
    if (existingIndex >= 0) {
      // Replace existing header
      merged[existingIndex] = templateHeader;
    } else {
      // Add new header
      merged.push(templateHeader);
    }
  });

  return merged;
}

/**
 * Extract variables from template headers
 */
export function extractTemplateVariables(template: RuleTemplate): string[] {
  const variables = new Set<string>();

  template.headers?.forEach(header => {
    const matches = header.value.matchAll(/\$\{([^}]+)\}/g);
    for (const match of matches) {
      if (match[1]) {
        variables.add(match[1]);
      }
    }
  });

  return Array.from(variables);
}

/**
 * Check if template uses variables
 */
export function templateUsesVariables(template: RuleTemplate): boolean {
  return extractTemplateVariables(template).length > 0;
}

/**
 * Generate template summary
 */
export function generateTemplateSummary(template: RuleTemplate): {
  headerCount: number;
  variableCount: number;
  hasPattern: boolean;
  hasConditions: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
} {
  const headerCount = template.headers?.length || 0;
  const variableCount = extractTemplateVariables(template).length;
  const hasPattern = !!template.pattern;
  const hasConditions = !!(
    template.conditions && template.conditions.length > 0
  );

  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';

  if (
    variableCount > 3 ||
    hasConditions ||
    template.templateType === 'conditional'
  ) {
    complexity = 'complex';
  } else if (variableCount > 0 || hasPattern || headerCount > 3) {
    complexity = 'moderate';
  } else {
    // Default complexity is already 'simple'
  }

  return {
    headerCount,
    variableCount,
    hasPattern,
    hasConditions,
    complexity,
  };
}

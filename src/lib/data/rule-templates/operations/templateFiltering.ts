/**
 * Template filtering operations
 */

import type { RuleTemplate } from '@/shared/types/templates';

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: string,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template => template.category === category);
}

/**
 * Get popular templates
 */
export function getPopularTemplates(
  limit: number = 5,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
}

/**
 * Get templates by tags
 */
export function getTemplatesByTags(
  tags: string[],
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template =>
    tags.some(tag => template.tags.includes(tag))
  );
}

/**
 * Get built-in templates
 */
export function getBuiltInTemplates(
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template => template.isBuiltIn === true);
}

/**
 * Get custom templates (non-built-in)
 */
export function getCustomTemplates(
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template => template.isBuiltIn !== true);
}

/**
 * Get templates by template type
 */
export function getTemplatesByType(
  templateType: string,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template => template.templateType === templateType);
}

/**
 * Get recently created templates
 */
export function getRecentTemplates(
  limit: number = 5,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/**
 * Get templates by author
 */
export function getTemplatesByAuthor(
  author: string,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  return templates.filter(template => template.author === author);
}

/**
 * Get all unique categories from templates
 */
export function getUniqueCategories(templates: RuleTemplate[] = []): string[] {
  const categories = new Set(templates.map(template => template.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags from templates
 */
export function getUniqueTags(templates: RuleTemplate[] = []): string[] {
  const tags = new Set<string>();
  templates.forEach(template => {
    template.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

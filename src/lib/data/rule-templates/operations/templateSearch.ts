/**
 * Template search operations
 */

import type { RuleTemplate } from '@/shared/types/templates';

/**
 * Search templates by query string
 */
export function searchTemplates(
  query: string,
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(
    template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * Search templates by multiple criteria
 */
export function advancedSearchTemplates(
  criteria: {
    query?: string;
    category?: string;
    tags?: string[];
    templateType?: string;
    minPopularity?: number;
  },
  templates: RuleTemplate[] = []
): RuleTemplate[] {
  let results = templates;

  // Filter by query
  if (criteria.query) {
    results = searchTemplates(criteria.query, results);
  }

  // Filter by category
  if (criteria.category) {
    results = results.filter(
      template => template.category === criteria.category
    );
  }

  // Filter by template type
  if (criteria.templateType) {
    results = results.filter(
      template => template.templateType === criteria.templateType
    );
  }

  // Filter by tags
  if (criteria.tags && criteria.tags.length > 0) {
    const tags = criteria.tags;
    results = results.filter(template =>
      tags.some(tag => template.tags.includes(tag))
    );
  }

  // Filter by minimum popularity
  if (criteria.minPopularity !== undefined) {
    const minPopularity = criteria.minPopularity;
    results = results.filter(
      template => (template.popularity || 0) >= minPopularity
    );
  }

  return results;
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(
  partialQuery: string,
  templates: RuleTemplate[] = []
): string[] {
  const query = partialQuery.toLowerCase();
  const suggestions = new Set<string>();

  templates.forEach(template => {
    // Add matching template names
    if (template.name.toLowerCase().includes(query)) {
      suggestions.add(template.name);
    }

    // Add matching tags
    template.tags.forEach(tag => {
      if (tag.toLowerCase().includes(query)) {
        suggestions.add(tag);
      }
    });

    // Add matching categories
    if (template.category.toLowerCase().includes(query)) {
      suggestions.add(template.category);
    }
  });

  return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
}

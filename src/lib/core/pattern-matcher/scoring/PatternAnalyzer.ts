/**
 * Pattern analysis utilities
 */

import type { URLPattern } from '@/shared/types/rules';

import { hasWildcards, countWildcards } from '../utils/wildcardUtils';

/**
 * Test if a pattern would match any URLs (not too restrictive)
 */
export function isPatternTooRestrictive(pattern: URLPattern): boolean {
  // A pattern is considered too restrictive if it has very specific constraints
  const hasSpecificPath =
    pattern.path && pattern.path !== '/*' && !hasWildcards(pattern.path);
  const hasSpecificQuery = pattern.query && !hasWildcards(pattern.query);
  const hasSpecificPort = pattern.port && pattern.port !== '*';
  const hasSpecificDomain = pattern.domain && !hasWildcards(pattern.domain);

  // If more than 2 specific constraints, it might be too restrictive
  const specificConstraints = [
    hasSpecificPath,
    hasSpecificQuery,
    hasSpecificPort,
    hasSpecificDomain,
  ].filter(Boolean).length;

  return specificConstraints > 2;
}

/**
 * Analyze pattern complexity
 */
export function analyzePatternComplexity(pattern: URLPattern): {
  complexity: 'simple' | 'moderate' | 'complex';
  wildcardCount: number;
  hasRegexLike: boolean;
} {
  let wildcardCount = 0;
  let hasRegexLike = false;

  if (pattern.domain) {
    wildcardCount += countWildcards(pattern.domain);
  }
  if (pattern.path) {
    wildcardCount += countWildcards(pattern.path);
    hasRegexLike =
      hasRegexLike || pattern.path.includes('[') || pattern.path.includes('{');
  }
  if (pattern.query) {
    wildcardCount += countWildcards(pattern.query);
  }

  let complexity: 'simple' | 'moderate' | 'complex';
  if (wildcardCount === 0 && !hasRegexLike) {
    complexity = 'simple';
  } else if (wildcardCount <= 2 && !hasRegexLike) {
    complexity = 'moderate';
  } else {
    complexity = 'complex';
  }

  return { complexity, wildcardCount, hasRegexLike };
}

/**
 * Pattern match scoring utilities
 */

import { PROTOCOLS } from '@/config/constants';
import type { URLPattern } from '@/shared/types/rules';

import { countWildcards } from '../utils/wildcardUtils';

/**
 * Calculate match score based on pattern specificity
 */
export function calculateMatchScore(pattern: URLPattern, _url: string): number {
  let score = 0;

  // Protocol specificity (10 points for specific protocol)
  if (pattern.protocol && pattern.protocol !== PROTOCOLS.ANY) {
    score += 10;
  }

  // Domain specificity
  if (pattern.domain) {
    if (pattern.domain === '*') {
      score += 1; // Wildcard domain gets minimal points
    } else if (pattern.domain.startsWith('*.')) {
      score += 5; // Subdomain wildcard gets moderate points
    } else {
      score += 15; // Exact domain gets high points
    }
  }

  // Path specificity
  if (pattern.path) {
    const wildcardCount = countWildcards(pattern.path);
    score += Math.max(1, 10 - wildcardCount * 2); // More wildcards = lower score
  }

  // Port specificity (5 points for specific port)
  if (pattern.port && pattern.port !== '*') {
    score += 5;
  }

  // Query specificity (3 points for query pattern)
  if (pattern.query) {
    score += 3;
  }

  return score;
}

/**
 * Calculate pattern specificity level
 */
export function getSpecificityLevel(
  pattern: URLPattern
): 'low' | 'medium' | 'high' {
  const score = calculateMatchScore(pattern, '');

  if (score <= 5) return 'low';
  if (score <= 20) return 'medium';
  return 'high';
}

/**
 * Compare two patterns by specificity
 */
export function comparePatternSpecificity(
  a: URLPattern,
  b: URLPattern
): number {
  const scoreA = calculateMatchScore(a, '');
  const scoreB = calculateMatchScore(b, '');
  return scoreB - scoreA; // Higher score first
}

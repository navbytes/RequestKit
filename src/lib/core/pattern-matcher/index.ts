/**
 * Pattern matcher main orchestrator
 * Provides a clean API for URL pattern matching with modular architecture
 */

import type { URLPattern, PatternMatchResult } from '@/shared/types/rules';

// Import all matchers
import { matchDomain } from './matchers/DomainMatcher';
import { matchPath } from './matchers/PathMatcher';
import { matchPort } from './matchers/PortMatcher';
import { matchProtocol } from './matchers/ProtocolMatcher';
import { matchQuery } from './matchers/QueryMatcher';
// Import scoring and analysis
import { calculateMatchScore } from './scoring/MatchScorer';
import { isPatternTooRestrictive } from './scoring/PatternAnalyzer';
// Import utilities
import {
  normalizeURLPattern,
  patternToString,
  parseURLToPattern,
} from './utils/patternNormalization';
import { validateURLPattern } from './utils/patternValidation';

// Re-export utilities for backward compatibility
export { wildcardToRegex } from './utils/wildcardUtils';

/**
 * Check if a URL matches a URL pattern and return detailed results
 */
export function matchURLPattern(
  url: string,
  pattern: URLPattern
): PatternMatchResult {
  const matchedParts = {
    protocol: matchProtocol(url, pattern.protocol),
    domain: matchDomain(url, pattern.domain),
    path: matchPath(url, pattern.path),
    query: matchQuery(url, pattern.query),
    port: matchPort(url, pattern.port),
  };

  const matches = Object.values(matchedParts).every(Boolean);
  const score = matches ? calculateMatchScore(pattern, url) : 0;

  return {
    matches,
    score,
    matchedParts,
  };
}

/**
 * Find the best matching pattern from a list of patterns
 */
export function findBestMatch(
  url: string,
  patterns: URLPattern[]
): {
  pattern: URLPattern | null;
  result: PatternMatchResult | null;
} {
  let bestPattern: URLPattern | null = null;
  let bestResult: PatternMatchResult | null = null;
  let highestScore = 0;

  for (const pattern of patterns) {
    const result = matchURLPattern(url, pattern);

    if (result.matches && result.score > highestScore) {
      bestPattern = pattern;
      bestResult = result;
      highestScore = result.score;
    }
  }

  return { pattern: bestPattern, result: bestResult };
}

// Re-export all utilities for external use
export {
  // Individual matchers
  matchDomain,
  matchPath,
  matchProtocol,
  matchPort,
  matchQuery,

  // Scoring and analysis
  calculateMatchScore,
  isPatternTooRestrictive,

  // Validation and normalization
  validateURLPattern,
  normalizeURLPattern,
  patternToString,
  parseURLToPattern,
};

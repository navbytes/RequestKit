/**
 * Wildcard pattern utilities for URL pattern matching
 */

/**
 * Convert a wildcard pattern to a regular expression
 */
export function wildcardToRegex(
  pattern: string,
  caseSensitive = false
): RegExp {
  // Escape special regex characters except * and ?
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const flags = caseSensitive ? '' : 'i';
  return new RegExp(`^${escaped}$`, flags);
}

/**
 * Check if a pattern contains wildcards
 */
export function hasWildcards(pattern: string): boolean {
  return pattern.includes('*') || pattern.includes('?');
}

/**
 * Count wildcards in a pattern
 */
export function countWildcards(pattern: string): number {
  return (
    (pattern.match(/\*/g) || []).length + (pattern.match(/\?/g) || []).length
  );
}

/**
 * Escape special characters for literal matching
 */
export function escapePattern(pattern: string): string {
  return pattern.replace(/[.+^${}()|[\]\\*?]/g, '\\$&');
}

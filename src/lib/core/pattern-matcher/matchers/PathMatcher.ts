/**
 * Path pattern matching utilities
 */

import { wildcardToRegex } from '../utils/wildcardUtils';

/**
 * Check if a URL matches a path pattern
 */
export function matchPath(url: string, pathPattern?: string): boolean {
  if (!pathPattern) {
    return true; // No path pattern means match all paths
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    return wildcardToRegex(pathPattern).test(pathname);
  } catch {
    return false;
  }
}

/**
 * Extract path from URL
 */
export function extractPath(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

/**
 * Check if path pattern is valid
 */
export function isValidPathPattern(pattern: string): boolean {
  return !pattern || pattern.startsWith('/');
}

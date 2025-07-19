/**
 * Query pattern matching utilities
 */

import { wildcardToRegex } from '../utils/wildcardUtils';

/**
 * Check if a URL matches a query pattern
 */
export function matchQuery(url: string, queryPattern?: string): boolean {
  if (!queryPattern) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const search = urlObj.search;

    return wildcardToRegex(queryPattern).test(search);
  } catch {
    return false;
  }
}

/**
 * Extract query string from URL
 */
export function extractQuery(url: string): string | null {
  try {
    return new URL(url).search;
  } catch {
    return null;
  }
}

/**
 * Extract query parameters from URL
 */
export function extractQueryParams(url: string): Record<string, string> | null {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return null;
  }
}

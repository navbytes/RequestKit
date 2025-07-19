/**
 * Domain pattern matching utilities
 */

import { wildcardToRegex } from '../utils/wildcardUtils';

/**
 * Check if a URL matches a domain pattern
 */
export function matchDomain(url: string, domainPattern: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pattern = domainPattern.toLowerCase();

    // Handle wildcard subdomain patterns like *.example.com
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return hostname === baseDomain || hostname.endsWith(`.${  baseDomain}`);
    }

    // Handle exact match or wildcard
    if (pattern === '*') {
      return true;
    }

    return wildcardToRegex(pattern).test(hostname);
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Check if domain pattern is valid
 */
export function isValidDomainPattern(pattern: string): boolean {
  if (!pattern || pattern.includes('..')) {
    return false;
  }
  return true;
}

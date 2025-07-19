/**
 * Pattern normalization utilities
 */

import type { URLPattern } from '@/shared/types/rules';

/**
 * Normalize a URL pattern for consistent matching
 */
export function normalizeURLPattern(pattern: URLPattern): URLPattern {
  const normalized: URLPattern = {
    domain: pattern.domain.toLowerCase(),
    path: pattern.path || '/*',
  };

  if (pattern.protocol) {
    normalized.protocol = pattern.protocol.toLowerCase();
  }

  if (pattern.query) {
    normalized.query = pattern.query;
  }

  if (pattern.port) {
    normalized.port = pattern.port;
  }

  return normalized;
}

/**
 * Convert URL pattern to human-readable string
 */
export function patternToString(pattern: URLPattern): string {
  const protocol = pattern.protocol || '*';
  const domain = pattern.domain;
  const path = pattern.path || '';
  const port = pattern.port ? `:${pattern.port}` : '';
  const query = pattern.query ? `?${pattern.query}` : '';

  return `${protocol}://${domain}${port}${path}${query}`;
}

/**
 * Parse a URL string into a URL pattern
 */
export function parseURLToPattern(url: string): URLPattern | null {
  try {
    const urlObj = new URL(url);

    const pattern: URLPattern = {
      domain: urlObj.hostname,
      path: urlObj.pathname,
    };

    const protocol = urlObj.protocol.slice(0, -1);
    if (protocol) {
      pattern.protocol = protocol;
    }

    const query = urlObj.search.slice(1);
    if (query) {
      pattern.query = query;
    }

    if (urlObj.port) {
      pattern.port = urlObj.port;
    }

    return pattern;
  } catch {
    return null;
  }
}

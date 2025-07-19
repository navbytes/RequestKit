// Advanced URL pattern matching with regex and exclusion support

import type { AdvancedPattern } from '@/shared/types/templates';

export interface MatchResult {
  matches: boolean;
  reason?: string;
  matchedPattern?: string;
  excludedBy?: string;
}

export class AdvancedPatternMatcher {
  /**
   * Match a URL against an advanced pattern with includes/excludes and regex support
   */
  static matchAdvancedPattern(
    url: string,
    pattern: AdvancedPattern
  ): MatchResult {
    try {
      const urlObj = new URL(url);

      // Check basic URL pattern first
      const basicMatch = this.matchBasicPattern(urlObj, pattern);
      if (!basicMatch.matches) {
        return basicMatch;
      }

      // Check regex pattern if provided
      if (pattern.regex) {
        const regexMatch = this.matchRegexPattern(
          url,
          pattern.regex,
          pattern.caseSensitive
        );
        if (!regexMatch.matches) {
          return regexMatch;
        }
      }

      // Check method restrictions
      if (pattern.methods && pattern.methods.length > 0) {
        // Note: We can't get the HTTP method from a URL alone
        // This would need to be checked at request time
        // For now, we'll assume GET method for URL-only matching
        const method = 'GET';
        if (!pattern.methods.includes(method)) {
          return {
            matches: false,
            reason: `Method ${method} not in allowed methods: ${pattern.methods.join(', ')}`,
          };
        }
      }

      // Check port restrictions
      if (pattern.ports && pattern.ports.length > 0) {
        const port = urlObj.port
          ? parseInt(urlObj.port)
          : urlObj.protocol === 'https:'
            ? 443
            : 80;
        if (!pattern.ports.includes(port)) {
          return {
            matches: false,
            reason: `Port ${port} not in allowed ports: ${pattern.ports.join(', ')}`,
          };
        }
      }

      // Check scheme restrictions
      if (pattern.schemes && pattern.schemes.length > 0) {
        const scheme = urlObj.protocol.replace(':', '');
        if (!pattern.schemes.includes(scheme)) {
          return {
            matches: false,
            reason: `Scheme ${scheme} not in allowed schemes: ${pattern.schemes.join(', ')}`,
          };
        }
      }

      // Check include patterns
      if (pattern.includes && pattern.includes.length > 0) {
        const includeMatch = this.matchIncludePatterns(
          url,
          pattern.includes,
          pattern.caseSensitive
        );
        if (!includeMatch.matches) {
          return includeMatch;
        }
      }

      // Check exclude patterns
      if (pattern.excludes && pattern.excludes.length > 0) {
        const excludeMatch = this.matchExcludePatterns(
          url,
          pattern.excludes,
          pattern.caseSensitive
        );
        if (!excludeMatch.matches) {
          return excludeMatch;
        }
      }

      return {
        matches: true,
        matchedPattern: this.formatPatternString(pattern),
      };
    } catch (error) {
      return {
        matches: false,
        reason: `Invalid URL or pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Match basic URL pattern (protocol, domain, path, query)
   */
  private static matchBasicPattern(
    urlObj: URL,
    pattern: AdvancedPattern
  ): MatchResult {
    // Check protocol
    if (pattern.protocol && pattern.protocol !== '*') {
      const expectedProtocol = pattern.protocol.endsWith(':')
        ? pattern.protocol
        : `${pattern.protocol}:`;
      if (urlObj.protocol !== expectedProtocol) {
        return {
          matches: false,
          reason: `Protocol mismatch: expected ${expectedProtocol}, got ${urlObj.protocol}`,
        };
      }
    }

    // Check domain
    if (pattern.domain && pattern.domain !== '*') {
      const domainMatch = this.matchDomainPattern(
        urlObj.hostname,
        pattern.domain,
        pattern.caseSensitive
      );
      if (!domainMatch) {
        return {
          matches: false,
          reason: `Domain mismatch: ${urlObj.hostname} does not match ${pattern.domain}`,
        };
      }
    }

    // Check path
    if (pattern.path && pattern.path !== '/*') {
      const pathMatch = this.matchPathPattern(
        urlObj.pathname,
        pattern.path,
        pattern.caseSensitive
      );
      if (!pathMatch) {
        return {
          matches: false,
          reason: `Path mismatch: ${urlObj.pathname} does not match ${pattern.path}`,
        };
      }
    }

    // Check query
    if (pattern.query) {
      const queryMatch = this.matchQueryPattern(
        urlObj.search,
        pattern.query,
        pattern.caseSensitive
      );
      if (!queryMatch) {
        return {
          matches: false,
          reason: `Query mismatch: ${urlObj.search} does not match ${pattern.query}`,
        };
      }
    }

    return { matches: true };
  }

  /**
   * Match regex pattern against full URL
   */
  private static matchRegexPattern(
    url: string,
    regex: string,
    caseSensitive?: boolean
  ): MatchResult {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regexObj = new RegExp(regex, flags);
      const matches = regexObj.test(url);

      if (matches) {
        return {
          matches: true,
          matchedPattern: regex,
        };
      } else {
        return {
          matches: false,
          reason: `URL does not match regex: ${regex}`,
        };
      }
    } catch (error) {
      return {
        matches: false,
        reason: `Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Check if URL matches any include pattern
   */
  private static matchIncludePatterns(
    url: string,
    includes: string[],
    caseSensitive?: boolean
  ): MatchResult {
    for (const pattern of includes) {
      if (this.matchWildcardPattern(url, pattern, caseSensitive)) {
        return {
          matches: true,
          matchedPattern: pattern,
        };
      }
    }

    return {
      matches: false,
      reason: `URL does not match any include pattern: ${includes.join(', ')}`,
    };
  }

  /**
   * Check if URL matches any exclude pattern (should NOT match)
   */
  private static matchExcludePatterns(
    url: string,
    excludes: string[],
    caseSensitive?: boolean
  ): MatchResult {
    for (const pattern of excludes) {
      if (this.matchWildcardPattern(url, pattern, caseSensitive)) {
        return {
          matches: false,
          reason: `URL matches exclude pattern: ${pattern}`,
          excludedBy: pattern,
        };
      }
    }

    return { matches: true };
  }

  /**
   * Match domain with wildcard support
   */
  private static matchDomainPattern(
    domain: string,
    pattern: string,
    caseSensitive?: boolean
  ): boolean {
    if (!caseSensitive) {
      domain = domain.toLowerCase();
      pattern = pattern.toLowerCase();
    }

    // Exact match
    if (pattern === domain) return true;

    // Wildcard subdomain matching (*.example.com)
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.slice(2);
      return domain === baseDomain || domain.endsWith(`.${baseDomain}`);
    }

    // Wildcard matching
    return this.matchWildcardPattern(domain, pattern, caseSensitive);
  }

  /**
   * Match path with wildcard support
   */
  private static matchPathPattern(
    path: string,
    pattern: string,
    caseSensitive?: boolean
  ): boolean {
    if (!caseSensitive) {
      path = path.toLowerCase();
      pattern = pattern.toLowerCase();
    }

    // Exact match
    if (pattern === path) return true;

    // Wildcard matching
    return this.matchWildcardPattern(path, pattern, caseSensitive);
  }

  /**
   * Match query string
   */
  private static matchQueryPattern(
    query: string,
    pattern: string,
    caseSensitive?: boolean
  ): boolean {
    if (!caseSensitive) {
      query = query.toLowerCase();
      pattern = pattern.toLowerCase();
    }

    // Remove leading ? if present
    query = query.startsWith('?') ? query.slice(1) : query;
    pattern = pattern.startsWith('?') ? pattern.slice(1) : pattern;

    return this.matchWildcardPattern(query, pattern, caseSensitive);
  }

  /**
   * Generic wildcard pattern matching
   */
  private static matchWildcardPattern(
    text: string,
    pattern: string,
    caseSensitive?: boolean
  ): boolean {
    if (!caseSensitive) {
      text = text.toLowerCase();
      pattern = pattern.toLowerCase();
    }

    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*/g, '.*') // Convert * to .*
      .replace(/\?/g, '.'); // Convert ? to .

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(text);
  }

  /**
   * Format pattern as human-readable string
   */
  private static formatPatternString(pattern: AdvancedPattern): string {
    const parts: string[] = [];

    if (pattern.protocol) parts.push(`${pattern.protocol}://`);
    if (pattern.domain) parts.push(pattern.domain);
    if (pattern.path) parts.push(pattern.path);
    if (pattern.query) parts.push(`?${pattern.query}`);

    let result = parts.join('');

    if (pattern.regex) {
      result += ` (regex: ${pattern.regex})`;
    }

    if (pattern.includes?.length) {
      result += ` (includes: ${pattern.includes.join(', ')})`;
    }

    if (pattern.excludes?.length) {
      result += ` (excludes: ${pattern.excludes.join(', ')})`;
    }

    return result || 'Any URL';
  }

  /**
   * Validate an advanced pattern
   */
  static validatePattern(pattern: AdvancedPattern): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate regex if provided
    if (pattern.regex) {
      try {
        new RegExp(pattern.regex);
      } catch (error) {
        errors.push(
          `Invalid regex: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Validate protocol
    if (
      pattern.protocol &&
      !['http', 'https', '*', 'http:', 'https:'].includes(pattern.protocol)
    ) {
      errors.push(
        `Invalid protocol: ${pattern.protocol}. Must be 'http', 'https', or '*'`
      );
    }

    // Validate schemes
    if (pattern.schemes) {
      const validSchemes = ['http', 'https', 'ftp', 'file', 'ws', 'wss'];
      const invalidSchemes = pattern.schemes.filter(
        scheme => !validSchemes.includes(scheme)
      );
      if (invalidSchemes.length > 0) {
        errors.push(`Invalid schemes: ${invalidSchemes.join(', ')}`);
      }
    }

    // Validate ports
    if (pattern.ports) {
      const invalidPorts = pattern.ports.filter(
        port => port < 1 || port > 65535
      );
      if (invalidPorts.length > 0) {
        errors.push(
          `Invalid ports: ${invalidPorts.join(', ')}. Must be between 1 and 65535`
        );
      }
    }

    // Validate methods
    if (pattern.methods) {
      const validMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'HEAD',
        'OPTIONS',
      ];
      const invalidMethods = pattern.methods.filter(
        method => !validMethods.includes(method.toUpperCase())
      );
      if (invalidMethods.length > 0) {
        errors.push(`Invalid methods: ${invalidMethods.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test a pattern against multiple URLs
   */
  static testPattern(
    pattern: AdvancedPattern,
    testUrls: string[]
  ): Array<{ url: string; result: MatchResult }> {
    return testUrls.map(url => ({
      url,
      result: this.matchAdvancedPattern(url, pattern),
    }));
  }
}

// Export utility functions for backward compatibility
export function matchAdvancedPattern(
  url: string,
  pattern: AdvancedPattern
): MatchResult {
  return AdvancedPatternMatcher.matchAdvancedPattern(url, pattern);
}

export function validateAdvancedPattern(pattern: AdvancedPattern): {
  valid: boolean;
  errors: string[];
} {
  return AdvancedPatternMatcher.validatePattern(pattern);
}

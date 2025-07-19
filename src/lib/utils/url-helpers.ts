import type { URLPattern } from '@/shared/types/rules';

/**
 * Shared URL utilities for consistent URL handling across components
 */
export class UrlUtils {
  /**
   * Extract domain from URL
   */
  static getDomainFromUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Extract protocol from URL
   */
  static getProtocolFromUrl(url: string): 'http' | 'https' | 'unknown' {
    try {
      const protocol = new URL(url).protocol.replace(':', '');
      return protocol === 'http' || protocol === 'https' ? protocol : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Extract path from URL
   */
  static getPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname === '/' ? '' : urlObj.pathname;
    } catch {
      return '';
    }
  }

  /**
   * Extract port from URL
   */
  static getPortFromUrl(url: string): string | undefined {
    try {
      const port = new URL(url).port;
      return port || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Create URL pattern from URL
   */
  static createPatternFromUrl(url: string): URLPattern {
    try {
      const urlObj = new URL(url);
      const pattern: URLPattern = {
        domain: urlObj.hostname,
        path: urlObj.pathname === '/' ? '' : urlObj.pathname,
        protocol: urlObj.protocol.replace(':', '') as 'http' | 'https',
      };

      if (urlObj.port) {
        pattern.port = urlObj.port;
      }

      return pattern;
    } catch {
      return {
        domain: 'unknown',
        path: '',
        protocol: 'https',
      };
    }
  }

  /**
   * Create a user-friendly domain display name
   */
  static getDomainDisplayName(url: string): string {
    const domain = this.getDomainFromUrl(url);
    if (domain === 'unknown') {
      return 'this page';
    }
    return domain;
  }

  /**
   * Check if URL is valid
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL for comparison
   */
  static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove trailing slash from pathname unless it's the root
      if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
        urlObj.pathname = urlObj.pathname.slice(0, -1);
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Check if URL matches localhost patterns
   */
  static isLocalhost(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.endsWith('.local')
      );
    } catch {
      return false;
    }
  }

  /**
   * Get URL without query parameters and hash
   */
  static getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  /**
   * Create a pattern suggestion based on URL
   */
  static suggestPattern(url: string): {
    exact: URLPattern;
    domain: URLPattern;
    subdomain: URLPattern;
    path: URLPattern;
  } {
    const base = this.createPatternFromUrl(url);
    const domain = this.getDomainFromUrl(url);

    return {
      exact: base,
      domain: {
        ...base,
        path: '/*',
      },
      subdomain: {
        ...base,
        domain: domain.includes('.')
          ? `*.${domain.split('.').slice(-2).join('.')}`
          : domain,
        path: '/*',
      },
      path: {
        ...base,
        domain: '*',
      },
    };
  }

  /**
   * Format URL pattern for display
   */
  static formatPatternForDisplay(pattern: URLPattern): string {
    const protocol =
      pattern.protocol && pattern.protocol !== '*'
        ? `${pattern.protocol}://`
        : '';
    const domain = pattern.domain || '*';
    const port = pattern.port ? `:${pattern.port}` : '';
    const path = pattern.path || '/*';

    return `${protocol}${domain}${port}${path}`;
  }
}

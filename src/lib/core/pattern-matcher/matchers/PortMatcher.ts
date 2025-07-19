/**
 * Port pattern matching utilities
 */

/**
 * Check if a URL matches a port pattern
 */
export function matchPort(url: string, portPattern?: string): boolean {
  if (!portPattern || portPattern === '*') {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const port = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');

    return port === portPattern;
  } catch {
    return false;
  }
}

/**
 * Extract port from URL
 */
export function extractPort(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
  } catch {
    return null;
  }
}

/**
 * Check if port pattern is valid
 */
export function isValidPortPattern(pattern: string): boolean {
  if (!pattern || pattern === '*') {
    return true;
  }

  const portNum = parseInt(pattern, 10);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

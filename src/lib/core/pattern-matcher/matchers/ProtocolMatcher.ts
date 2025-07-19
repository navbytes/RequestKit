/**
 * Protocol pattern matching utilities
 */

import { PROTOCOLS } from '@/config/constants';

/**
 * Check if a URL matches a protocol pattern
 */
export function matchProtocol(url: string, protocolPattern?: string): boolean {
  if (!protocolPattern || protocolPattern === PROTOCOLS.ANY) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.slice(0, -1); // Remove trailing colon

    return protocol === protocolPattern;
  } catch {
    return false;
  }
}

/**
 * Extract protocol from URL
 */
export function extractProtocol(url: string): string | null {
  try {
    return new URL(url).protocol.slice(0, -1);
  } catch {
    return null;
  }
}

/**
 * Check if protocol pattern is valid
 */
export function isValidProtocolPattern(pattern: string): boolean {
  return !pattern || Object.values(PROTOCOLS).includes(pattern as string);
}

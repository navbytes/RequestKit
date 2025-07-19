/**
 * Pattern validation utilities
 */

import type { URLPattern } from '@/shared/types/rules';

import { isValidDomainPattern } from '../matchers/DomainMatcher';
import { isValidPathPattern } from '../matchers/PathMatcher';
import { isValidPortPattern } from '../matchers/PortMatcher';
import { isValidProtocolPattern } from '../matchers/ProtocolMatcher';

/**
 * Validate a URL pattern for correctness
 */
export function validateURLPattern(pattern: URLPattern): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate domain
  if (!pattern.domain) {
    errors.push('Domain is required');
  } else if (!isValidDomainPattern(pattern.domain)) {
    errors.push('Invalid domain pattern');
  }

  // Validate protocol
  if (pattern.protocol && !isValidProtocolPattern(pattern.protocol)) {
    errors.push('Invalid protocol');
  }

  // Validate path
  if (pattern.path && !isValidPathPattern(pattern.path)) {
    errors.push('Path must start with /');
  }

  // Validate port
  if (pattern.port && !isValidPortPattern(pattern.port)) {
    errors.push('Port must be a number between 1 and 65535 or *');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple patterns
 */
export function validatePatterns(patterns: URLPattern[]): {
  isValid: boolean;
  errors: Array<{ index: number; errors: string[] }>;
} {
  const allErrors: Array<{ index: number; errors: string[] }> = [];

  patterns.forEach((pattern, index) => {
    const validation = validateURLPattern(pattern);
    if (!validation.isValid) {
      allErrors.push({ index, errors: validation.errors });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

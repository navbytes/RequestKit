import { VALIDATION_MESSAGES } from '@/shared/constants/ui';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';

/**
 * Service for validation logic across the application
 */
export class ValidationService {
  private static instance: ValidationService;

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Validate a header rule
   */
  public validateRule(rule: Partial<HeaderRule>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!rule.name?.trim()) {
      errors.push('Rule name is required');
    }

    if (!rule.pattern?.domain?.trim()) {
      errors.push('Domain pattern is required');
    }

    if (
      rule.pattern?.domain &&
      !this.isValidDomainPattern(rule.pattern.domain)
    ) {
      errors.push('Invalid domain pattern');
    }

    if (rule.headers && rule.headers.length === 0) {
      errors.push('At least one header is required');
    }

    if (rule.headers) {
      rule.headers.forEach((header, index) => {
        if (!header.name?.trim()) {
          errors.push(`Header ${index + 1}: Name is required`);
        }
        if (header.operation !== 'remove' && !header.value?.trim()) {
          errors.push(
            `Header ${index + 1}: Value is required for ${header.operation} operation`
          );
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a variable
   */
  public validateVariable(variable: Partial<Variable>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!variable.name?.trim()) {
      errors.push('Variable name is required');
    }

    if (variable.name && !this.isValidVariableName(variable.name)) {
      errors.push(
        'Variable name must contain only letters, numbers, and underscores'
      );
    }

    if (!variable.value?.trim()) {
      errors.push('Variable value is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate domain pattern
   */
  private isValidDomainPattern(domain: string): boolean {
    // Allow wildcards and basic domain validation
    const pattern =
      /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    return pattern.test(domain.replace(/^\*\./, ''));
  }

  /**
   * Validate variable name
   */
  private isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  /**
   * Validate URL
   */
  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate email
   */
  public isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  /**
   * Get validation message
   */
  public getValidationMessage(
    type: keyof typeof VALIDATION_MESSAGES,
    ...args: unknown[]
  ): string {
    const message = VALIDATION_MESSAGES[type];
    if (typeof message === 'function') {
      return (message as (...args: unknown[]) => string)(...args);
    }
    return message;
  }
}

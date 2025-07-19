import {
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  UI_CONSTANTS,
} from '@/config/constants';
import {
  validateRule,
  validateTemplate,
  RuleConditionSchema,
} from '@/config/schemas';
import type {
  HeaderRule,
  RuleTemplate,
  URLPattern,
  RuleCondition,
} from '@/types/rules';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a header rule
 */
export function validateHeaderRule(
  rule: Partial<HeaderRule>
): ValidationResult {
  const result = validateRule(rule);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      warnings: generateRuleWarnings(rule as HeaderRule),
    };
  }

  return {
    isValid: false,
    errors: result.error.errors.map(
      err => `${err.path.join('.')}: ${err.message}`
    ),
    warnings: [],
  };
}

/**
 * Validate a rule template
 */
export function validateRuleTemplate(
  template: Partial<RuleTemplate>
): ValidationResult {
  const result = validateTemplate(template);

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      warnings: generateTemplateWarnings(template as RuleTemplate),
    };
  }

  return {
    isValid: false,
    errors: result.error.errors.map(
      err => `${err.path.join('.')}: ${err.message}`
    ),
    warnings: [],
  };
}

/**
 * Validate URL pattern
 */
export function validateURLPatternDetailed(
  pattern: Partial<URLPattern>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate domain
  if (!pattern.domain) {
    errors.push('Domain is required');
  } else {
    if (!VALIDATION_PATTERNS.DOMAIN.test(pattern.domain)) {
      errors.push(ERROR_MESSAGES.INVALID_DOMAIN);
    }

    if (pattern.domain === '*') {
      warnings.push('Wildcard domain (*) will match all domains');
    }

    if (pattern.domain.startsWith('*.')) {
      warnings.push('Subdomain wildcard will match all subdomains');
    }
  }

  // Validate protocol
  if (pattern.protocol && !['http', 'https', '*'].includes(pattern.protocol)) {
    errors.push('Protocol must be http, https, or *');
  }

  // Validate path
  if (pattern.path) {
    if (!VALIDATION_PATTERNS.URL_PATH.test(pattern.path)) {
      errors.push(ERROR_MESSAGES.INVALID_PATH);
    }

    if (pattern.path === '/*') {
      warnings.push('Wildcard path (/*) will match all paths');
    }
  }

  // Validate port
  if (pattern.port) {
    if (!VALIDATION_PATTERNS.PORT.test(pattern.port)) {
      errors.push(ERROR_MESSAGES.INVALID_PORT);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate header name
 */
export function validateHeaderName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) {
    errors.push('Header name is required');
  } else {
    if (!VALIDATION_PATTERNS.HEADER_NAME.test(name)) {
      errors.push(ERROR_MESSAGES.INVALID_HEADER_NAME);
    }

    // Check for common header names that might cause issues
    const problematicHeaders = ['host', 'content-length', 'connection'];
    if (problematicHeaders.includes(name.toLowerCase())) {
      warnings.push(`Header "${name}" might be overridden by the browser`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate header value
 */
export function validateHeaderValue(value: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value.length > UI_CONSTANTS.MAX_HEADER_VALUE_LENGTH) {
    errors.push(
      `Header value too long (max ${UI_CONSTANTS.MAX_HEADER_VALUE_LENGTH} characters)`
    );
  }

  // Check for potentially problematic characters
  if (value.includes('\n') || value.includes('\r')) {
    errors.push('Header value cannot contain line breaks');
  }

  // Check for template variables
  if (value.includes('{{') && value.includes('}}')) {
    warnings.push('Header value contains template variables');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate rule condition
 */
export function validateRuleCondition(
  condition: Partial<RuleCondition>
): ValidationResult {
  const result = RuleConditionSchema.safeParse(condition);

  if (result.success) {
    const warnings: string[] = [];

    // Check for regex conditions
    if (condition.operator === 'regex' && condition.value) {
      try {
        new RegExp(condition.value.toString());
      } catch {
        return {
          isValid: false,
          errors: ['Invalid regular expression'],
          warnings: [],
        };
      }

      warnings.push('Regular expressions can impact performance');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
    };
  }

  return {
    isValid: false,
    errors: result.error.errors.map(
      err => `${err.path.join('.')}: ${err.message}`
    ),
    warnings: [],
  };
}

/**
 * Generate warnings for a rule
 */
function generateRuleWarnings(rule: HeaderRule): string[] {
  const warnings: string[] = [];

  // Check for overly broad patterns
  if (
    rule.pattern.domain === '*' &&
    (!rule.pattern.path || rule.pattern.path === '/*')
  ) {
    warnings.push(
      'Rule matches all domains and paths - consider making it more specific'
    );
  }

  // Check for high priority rules
  if (rule.priority > 90) {
    warnings.push('High priority rules should be used sparingly');
  }

  // Check for many headers
  if (rule.headers.length > 10) {
    warnings.push('Rules with many headers might impact performance');
  }

  // Check for remove operations
  const removeHeaders = rule.headers.filter(h => h.operation === 'remove');
  if (removeHeaders.length > 0) {
    warnings.push('Remove operations might affect website functionality');
  }

  return warnings;
}

/**
 * Generate warnings for a template
 */
function generateTemplateWarnings(template: RuleTemplate): string[] {
  const warnings: string[] = [];

  // Check for template variables in headers
  const hasTemplateVars = template.headers.some(
    h => h.value.includes('{{') && h.value.includes('}}')
  );

  if (hasTemplateVars) {
    warnings.push('Template contains variables that need to be replaced');
  }

  return warnings;
}

/**
 * Validate rule name uniqueness
 */
export function validateRuleNameUniqueness(
  name: string,
  existingRules: HeaderRule[],
  excludeId?: string
): ValidationResult {
  const duplicate = existingRules.find(
    rule =>
      rule.name.toLowerCase() === name.toLowerCase() && rule.id !== excludeId
  );

  if (duplicate) {
    return {
      isValid: false,
      errors: ['A rule with this name already exists'],
      warnings: [],
    };
  }

  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Type guard for import data structure
 */
function isImportDataStructure(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null;
}

/**
 * Type guard for rules object in import data
 */
function isRulesObject(rules: unknown): rules is Record<string, unknown> {
  return typeof rules === 'object' && rules !== null;
}

/**
 * Type guard for templates object in import data
 */
function isTemplatesObject(
  templates: unknown
): templates is Record<string, unknown> {
  return typeof templates === 'object' && templates !== null;
}

/**
 * Validate rules in import data
 */
function validateImportRules(rules: unknown): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRulesObject(rules)) {
    errors.push('Rules must be an object');
    return { errors, warnings };
  }

  Object.entries(rules).forEach(([id, rule]) => {
    const validation = validateHeaderRule(rule as Partial<HeaderRule>);
    if (!validation.isValid) {
      errors.push(`Rule ${id}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `Rule ${id}: ${w}`));
  });

  return { errors, warnings };
}

/**
 * Validate templates in import data
 */
function validateImportTemplates(templates: unknown): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isTemplatesObject(templates)) {
    errors.push('Templates must be an object');
    return { errors, warnings };
  }

  Object.entries(templates).forEach(([id, template]) => {
    const validation = validateRuleTemplate(template as Partial<RuleTemplate>);
    if (!validation.isValid) {
      errors.push(`Template ${id}: ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `Template ${id}: ${w}`));
  });

  return { errors, warnings };
}

/**
 * Validate version compatibility
 */
function validateVersionCompatibility(version: unknown): string[] {
  const warnings: string[] = [];

  if (typeof version === 'string') {
    const [major] = version.split('.');
    if (major && parseInt(major, 10) > 1) {
      warnings.push(
        'Import data is from a newer version and might not be fully compatible'
      );
    }
  }

  return warnings;
}

/**
 * Validate import data
 */
export function validateImportData(data: unknown): ValidationResult {
  try {
    // Basic structure validation
    if (!isImportDataStructure(data)) {
      return {
        isValid: false,
        errors: ['Invalid import data format'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate rules if present
    if (data.rules) {
      const rulesValidation = validateImportRules(data.rules);
      errors.push(...rulesValidation.errors);
      warnings.push(...rulesValidation.warnings);
    }

    // Validate templates if present
    if (data.templates) {
      const templatesValidation = validateImportTemplates(data.templates);
      errors.push(...templatesValidation.errors);
      warnings.push(...templatesValidation.warnings);
    }

    // Check version compatibility
    warnings.push(...validateVersionCompatibility(data.version));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch {
    return {
      isValid: false,
      errors: ['Failed to parse import data'],
      warnings: [],
    };
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate URL format
 */
export function validateURL(url: string): ValidationResult {
  try {
    new URL(url);
    return {
      isValid: true,
      errors: [],
      warnings: [],
    };
  } catch {
    return {
      isValid: false,
      errors: ['Invalid URL format'],
      warnings: [],
    };
  }
}

/**
 * Check if a string is a valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file size for imports
 */
export function validateFileSize(
  size: number,
  maxSize = 10 * 1024 * 1024
): ValidationResult {
  if (size > maxSize) {
    return {
      isValid: false,
      errors: [
        `File size too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`,
      ],
      warnings: [],
    };
  }

  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

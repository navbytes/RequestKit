/**
 * Variable validation utilities
 */

import type {
  Variable,
  VariableValidationResult,
} from '@/shared/types/variables';
import { VariableScope, VARIABLE_PATTERNS } from '@/shared/types/variables';
import { loggers } from '@/shared/utils/debug';

// Get variable storage logger
const logger = loggers.coreVariableStorage;

/**
 * Validate a variable object
 */
export function validateVariable(variable: unknown): VariableValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    // Check if variable is an object
    if (!variable || typeof variable !== 'object') {
      return {
        isValid: false,
        errors: ['Variable must be an object'],
        warnings: [],
        suggestions: [
          'Provide a valid variable object with required properties',
        ],
      };
    }

    const varObj = variable as Record<string, unknown>;

    // Validate required properties
    if (!varObj.id || typeof varObj.id !== 'string') {
      errors.push('Variable must have a valid id (string)');
    }

    if (!varObj.name || typeof varObj.name !== 'string') {
      errors.push('Variable must have a valid name (string)');
    } else {
      // Validate name format
      if (!VARIABLE_PATTERNS.VARIABLE_NAME.test(varObj.name)) {
        errors.push(
          'Variable name must start with a letter or underscore and contain only alphanumeric characters and underscores'
        );
        suggestions.push('Use a name like "my_variable" or "apiKey"');
      }

      // Check name length
      if (varObj.name.length > 100) {
        warnings.push('Variable name is very long (>100 characters)');
        suggestions.push('Consider using a shorter, more descriptive name');
      }
    }

    // Validate value
    if (varObj.value === undefined || varObj.value === null) {
      errors.push('Variable must have a value');
    } else if (typeof varObj.value !== 'string') {
      warnings.push('Variable value should be a string');
      suggestions.push('Convert non-string values to strings');
    } else {
      // Value is valid string
    }

    // Validate scope
    if (!varObj.scope) {
      errors.push('Variable must have a scope');
    } else if (
      !Object.values(VariableScope).includes(varObj.scope as VariableScope)
    ) {
      errors.push(
        `Invalid scope "${varObj.scope}". Must be one of: ${Object.values(VariableScope).join(', ')}`
      );
    } else {
      // Scope is valid
    }

    // Validate optional properties
    if (varObj.enabled !== undefined && typeof varObj.enabled !== 'boolean') {
      errors.push('Variable enabled property must be a boolean');
    }

    if (varObj.isSecret !== undefined && typeof varObj.isSecret !== 'boolean') {
      errors.push('Variable isSecret property must be a boolean');
    }

    if (
      varObj.description !== undefined &&
      typeof varObj.description !== 'string'
    ) {
      errors.push('Variable description must be a string');
    }

    if (varObj.tags !== undefined) {
      if (!Array.isArray(varObj.tags)) {
        errors.push('Variable tags must be an array');
      } else {
        varObj.tags.forEach((tag: unknown, index: number) => {
          if (typeof tag !== 'string') {
            errors.push(`Tag at index ${index} must be a string`);
          }
        });
      }
    }

    // Validate metadata
    if (varObj.metadata !== undefined) {
      if (typeof varObj.metadata !== 'object' || varObj.metadata === null) {
        errors.push('Variable metadata must be an object');
      } else {
        const metadata = varObj.metadata as Record<string, unknown>;
        if (!metadata.createdAt) {
          warnings.push('Variable metadata missing createdAt');
        }

        if (!metadata.updatedAt) {
          warnings.push('Variable metadata missing updatedAt');
        }

        if (
          metadata.usageCount !== undefined &&
          typeof metadata.usageCount !== 'number'
        ) {
          errors.push('Variable metadata usageCount must be a number');
        }
      }
    }

    // Validate profile/rule specific properties
    if (varObj.scope === VariableScope.PROFILE && !varObj.profileId) {
      warnings.push('Profile-scoped variable should have a profileId');
    }

    if (varObj.scope === VariableScope.RULE && !varObj.ruleId) {
      warnings.push('Rule-scoped variable should have a ruleId');
    }

    // Security checks
    if (
      varObj.isSecret &&
      varObj.value &&
      typeof varObj.value === 'string' &&
      varObj.value.length < 8
    ) {
      warnings.push(
        'Secret variable has a short value (less than 8 characters)'
      );
      suggestions.push('Consider using longer, more secure values for secrets');
    }

    // Template validation
    if (varObj.value && typeof varObj.value === 'string') {
      const templateValidation = validateVariableTemplate(varObj.value);
      if (!templateValidation.isValid) {
        warnings.push(...templateValidation.warnings);
        if (templateValidation.suggestions) {
          suggestions.push(...templateValidation.suggestions);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  } catch (error) {
    logger.error('Error validating variable:', error);
    return {
      isValid: false,
      errors: [`Validation error: ${error}`],
      warnings: [],
      suggestions: [],
    };
  }
}

/**
 * Validate variable template syntax
 */
export function validateVariableTemplate(
  template: string
): VariableValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  try {
    // Check for variable references
    const variableMatches = template.match(
      VARIABLE_PATTERNS.VARIABLE_REFERENCE
    );
    const functionMatches = template.match(VARIABLE_PATTERNS.FUNCTION_CALL);

    // Validate variable references
    if (variableMatches) {
      variableMatches.forEach(match => {
        const variableName = match.slice(2, -1); // Remove ${ and }
        if (!VARIABLE_PATTERNS.VARIABLE_NAME.test(variableName)) {
          errors.push(`Invalid variable name in template: ${variableName}`);
        }
      });
    }

    // Validate function calls
    if (functionMatches) {
      functionMatches.forEach(match => {
        const functionCall = match.slice(2, -1); // Remove ${ and }
        const parenIndex = functionCall.indexOf('(');
        if (parenIndex === -1) {
          errors.push(`Invalid function call syntax: ${match}`);
          return;
        }

        const functionName = functionCall.slice(0, parenIndex);
        if (!VARIABLE_PATTERNS.FUNCTION_NAME.test(functionName)) {
          errors.push(`Invalid function name: ${functionName}`);
        }

        // Check for balanced parentheses
        const args = functionCall.slice(parenIndex + 1, -1);
        let parenCount = 0;
        for (const char of args) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
          if (parenCount < 0) {
            errors.push(`Unbalanced parentheses in function call: ${match}`);
            break;
          }
        }
        if (parenCount > 0) {
          errors.push(`Unbalanced parentheses in function call: ${match}`);
        }
      });
    }

    // Check for unclosed variable references
    const openBraces = (template.match(/\$\{/g) || []).length;
    const closeBraces = (template.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in template');
      suggestions.push('Ensure all ${...} expressions are properly closed');
    }

    // Performance warnings
    const totalReferences =
      (variableMatches?.length || 0) + (functionMatches?.length || 0);
    if (totalReferences > 10) {
      warnings.push('Template has many variable/function references (>10)');
      suggestions.push(
        'Consider simplifying the template for better performance'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  } catch (error) {
    logger.error('Error validating template:', error);
    return {
      isValid: false,
      errors: [`Template validation error: ${error}`],
      warnings: [],
      suggestions: [],
    };
  }
}

/**
 * Validate variable name
 */
export function validateVariableName(name: string): VariableValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      errors: ['Variable name must be a non-empty string'],
      warnings: [],
      suggestions: ['Provide a valid variable name'],
    };
  }

  // Check format
  if (!VARIABLE_PATTERNS.VARIABLE_NAME.test(name)) {
    errors.push(
      'Variable name must start with a letter or underscore and contain only alphanumeric characters and underscores'
    );
    suggestions.push('Use a name like "my_variable" or "apiKey"');
  }

  // Check length
  if (name.length > 100) {
    warnings.push('Variable name is very long (>100 characters)');
    suggestions.push('Consider using a shorter name');
  }

  if (name.length < 2) {
    warnings.push('Variable name is very short (<2 characters)');
    suggestions.push('Consider using a more descriptive name');
  }

  // Check for reserved words
  const reservedWords = [
    'undefined',
    'null',
    'true',
    'false',
    'function',
    'var',
    'let',
    'const',
  ];
  if (reservedWords.includes(name.toLowerCase())) {
    warnings.push(`Variable name "${name}" is a reserved word`);
    suggestions.push('Use a different name to avoid conflicts');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate variable value
 */
export function validateVariableValue(
  value: unknown,
  isSecret = false
): VariableValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (value === undefined || value === null) {
    errors.push('Variable value cannot be undefined or null');
    suggestions.push('Provide a valid value for the variable');
    return { isValid: false, errors, warnings, suggestions };
  }

  if (typeof value !== 'string') {
    warnings.push('Variable value should be a string');
    suggestions.push('Convert the value to a string');
  }

  const stringValue = String(value);

  // Check for empty values
  if (stringValue.trim() === '') {
    warnings.push('Variable value is empty or contains only whitespace');
    suggestions.push('Provide a meaningful value');
  }

  // Security checks for secrets
  if (isSecret) {
    if (stringValue.length < 8) {
      warnings.push('Secret value is short (less than 8 characters)');
      suggestions.push('Use longer, more secure values for secrets');
    }

    // Check for common weak patterns
    if (/^(password|123456|admin|test)$/i.test(stringValue)) {
      warnings.push('Secret value appears to be weak or common');
      suggestions.push('Use a strong, unique secret value');
    }
  }

  // Check for very long values
  if (stringValue.length > 10000) {
    warnings.push('Variable value is very long (>10,000 characters)');
    suggestions.push('Consider if such a long value is necessary');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validate multiple variables
 */
export function validateVariables(variables: Variable[]): {
  isValid: boolean;
  results: Array<{ variable: Variable; validation: VariableValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
} {
  const results: Array<{
    variable: Variable;
    validation: VariableValidationResult;
  }> = [];
  let valid = 0;
  let invalid = 0;
  let totalWarnings = 0;

  variables.forEach(variable => {
    const validation = validateVariable(variable);
    results.push({ variable, validation });

    if (validation.isValid) {
      valid++;
    } else {
      invalid++;
    }

    totalWarnings += validation.warnings.length;
  });

  return {
    isValid: invalid === 0,
    results,
    summary: {
      total: variables.length,
      valid,
      invalid,
      warnings: totalWarnings,
    },
  };
}

/**
 * Check for circular references in variable templates
 */
export function checkCircularReferences(variables: Variable[]): {
  hasCircularReferences: boolean;
  circularChains: string[][];
  issues: string[];
} {
  const issues: string[] = [];
  const circularChains: string[][] = [];
  const variableMap = new Map<string, Variable>();

  // Build variable map
  variables.forEach(variable => {
    variableMap.set(variable.name, variable);
  });

  // Check each variable for circular references
  variables.forEach(variable => {
    const visited = new Set<string>();
    const path: string[] = [];

    const checkVariable = (varName: string): boolean => {
      if (visited.has(varName)) {
        // Found a cycle
        const cycleStart = path.indexOf(varName);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat(varName);
          circularChains.push(cycle);
          issues.push(`Circular reference detected: ${cycle.join(' -> ')}`);
          return true;
        }
      }

      visited.add(varName);
      path.push(varName);

      const currentVar = variableMap.get(varName);
      if (currentVar && typeof currentVar.value === 'string') {
        const references = currentVar.value.match(
          VARIABLE_PATTERNS.VARIABLE_REFERENCE
        );
        if (references) {
          for (const ref of references) {
            const referencedVar = ref.slice(2, -1); // Remove ${ and }
            if (checkVariable(referencedVar)) {
              return true;
            }
          }
        }
      }

      path.pop();
      return false;
    };

    checkVariable(variable.name);
  });

  return {
    hasCircularReferences: circularChains.length > 0,
    circularChains,
    issues,
  };
}

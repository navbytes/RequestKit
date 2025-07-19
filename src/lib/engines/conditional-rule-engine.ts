import type { RuleCondition, ConditionalRule } from '@/shared/types/rules';

/**
 * Conditional Rule Engine for evaluating rule conditions
 */
export class ConditionalRuleEngine {
  /**
   * Evaluate if a conditional rule should be applied
   */
  static evaluateRule(
    rule: ConditionalRule,
    context: RuleEvaluationContext
  ): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true; // No conditions means always apply
    }

    const results = rule.conditions.map(condition =>
      this.evaluateCondition(condition, context)
    );

    // Apply logic operator
    if (rule.conditionLogic === 'OR') {
      return results.some(result => result);
    } else {
      // Default to AND
      return results.every(result => result);
    }
  }

  /**
   * Evaluate a single condition
   */
  static evaluateCondition(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    let result = false;

    switch (condition.type) {
      case 'responseStatus':
        result = this.evaluateResponseStatus(condition, context);
        break;
      case 'requestMethod':
        result = this.evaluateRequestMethod(condition, context);
        break;
      case 'userAgent':
        result = this.evaluateUserAgent(condition, context);
        break;
      case 'cookie':
        result = this.evaluateCookie(condition, context);
        break;
      case 'time':
        result = this.evaluateTime(condition, context);
        break;
      case 'header':
        result = this.evaluateHeader(condition, context);
        break;
      case 'url':
        result = this.evaluateUrl(condition, context);
        break;
      default:
        result = false;
    }

    // Apply negation if specified
    return condition.negate ? !result : result;
  }

  /**
   * Evaluate response status condition
   */
  private static evaluateResponseStatus(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.responseStatus) return false;

    const statusCode = context.responseStatus;
    const expectedValue = Number(condition.value);

    switch (condition.operator) {
      case 'equals':
        return statusCode === expectedValue;
      case 'greater':
        return statusCode > expectedValue;
      case 'less':
        return statusCode < expectedValue;
      case 'contains':
        return statusCode.toString().includes(condition.value.toString());
      case 'regex':
        return new RegExp(condition.value.toString()).test(
          statusCode.toString()
        );
      default:
        return false;
    }
  }

  /**
   * Evaluate request method condition
   */
  private static evaluateRequestMethod(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.requestMethod) return false;

    const method = condition.caseSensitive
      ? context.requestMethod
      : context.requestMethod.toLowerCase();
    const expectedValue = condition.caseSensitive
      ? condition.value.toString()
      : condition.value.toString().toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return method === expectedValue;
      case 'contains':
        return method.includes(expectedValue);
      case 'regex': {
        const flags = condition.caseSensitive ? '' : 'i';
        return new RegExp(condition.value.toString(), flags).test(method);
      }
      default:
        return false;
    }
  }

  /**
   * Evaluate user agent condition
   */
  private static evaluateUserAgent(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.userAgent) return false;

    const userAgent = condition.caseSensitive
      ? context.userAgent
      : context.userAgent.toLowerCase();
    const expectedValue = condition.caseSensitive
      ? condition.value.toString()
      : condition.value.toString().toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return userAgent === expectedValue;
      case 'contains':
        return userAgent.includes(expectedValue);
      case 'regex': {
        const flags = condition.caseSensitive ? '' : 'i';
        return new RegExp(condition.value.toString(), flags).test(userAgent);
      }
      default:
        return false;
    }
  }

  /**
   * Evaluate cookie condition
   */
  private static evaluateCookie(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.cookies) return false;

    // Extract cookie name and expected value from condition.value
    // Format: "cookieName=expectedValue" or just "cookieName" for existence check
    const conditionValue = condition.value.toString();
    const parts = conditionValue.split('=');
    const cookieName = parts[0];
    const expectedValue = parts[1];

    if (!cookieName) return false;
    const cookieValue = context.cookies[cookieName];

    switch (condition.operator) {
      case 'exists':
        return cookieValue !== undefined;
      case 'equals':
        if (!expectedValue) return false;
        return cookieValue === expectedValue;
      case 'contains':
        if (!expectedValue || !cookieValue) return false;
        return cookieValue.includes(expectedValue);
      case 'regex': {
        if (!expectedValue || !cookieValue) return false;
        const flags = condition.caseSensitive ? '' : 'i';
        return new RegExp(expectedValue, flags).test(cookieValue);
      }
      default:
        return false;
    }
  }

  /**
   * Evaluate time-based condition
   */
  private static evaluateTime(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    const now = context.currentTime || new Date();
    const conditionValue = condition.value.toString();

    // Support different time formats:
    // - "HH:MM-HH:MM" for time range
    // - "weekday:1-5" for weekdays (1=Monday, 7=Sunday)
    // - "hour:9-17" for business hours
    // - "date:YYYY-MM-DD" for specific date

    if (conditionValue.startsWith('weekday:')) {
      const parts = conditionValue.split(':');
      const range = parts[1];
      if (!range) return false;
      const rangeParts = range.split('-').map(Number);
      const start = rangeParts[0];
      const end = rangeParts[1];
      if (start === undefined || end === undefined) return false;
      const currentDay = now.getDay() || 7; // Convert Sunday (0) to 7
      return currentDay >= start && currentDay <= end;
    }

    if (conditionValue.startsWith('hour:')) {
      const parts = conditionValue.split(':');
      const range = parts[1];
      if (!range) return false;
      const rangeParts = range.split('-').map(Number);
      const start = rangeParts[0];
      const end = rangeParts[1];
      if (start === undefined || end === undefined) return false;
      const currentHour = now.getHours();
      return currentHour >= start && currentHour <= end;
    }

    if (conditionValue.includes('-') && conditionValue.includes(':')) {
      // Time range format "HH:MM-HH:MM"
      const timeParts = conditionValue.split('-');
      const startTime = timeParts[0];
      const endTime = timeParts[1];
      if (!startTime || !endTime) return false;

      const startTimeParts = startTime.split(':').map(Number);
      const endTimeParts = endTime.split(':').map(Number);
      const startHour = startTimeParts[0];
      const startMin = startTimeParts[1];
      const endHour = endTimeParts[0];
      const endMin = endTimeParts[1];

      if (
        startHour === undefined ||
        startMin === undefined ||
        endHour === undefined ||
        endMin === undefined
      ) {
        return false;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    return false;
  }

  /**
   * Evaluate header condition
   */
  private static evaluateHeader(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.requestHeaders) return false;

    // Extract header name and expected value from condition.value
    // Format: "headerName=expectedValue" or just "headerName" for existence check
    const conditionValue = condition.value.toString();
    const parts = conditionValue.split('=');
    const headerName = parts[0];
    const expectedValue = parts[1];

    if (!headerName) return false;
    const headerValue = context.requestHeaders[headerName.toLowerCase()];

    switch (condition.operator) {
      case 'exists':
        return headerValue !== undefined;
      case 'equals': {
        if (!expectedValue) return false;
        const actualValue = condition.caseSensitive
          ? headerValue
          : headerValue?.toLowerCase();
        const expected = condition.caseSensitive
          ? expectedValue
          : expectedValue.toLowerCase();
        return actualValue === expected;
      }
      case 'contains': {
        if (!expectedValue || !headerValue) return false;
        const containsValue = condition.caseSensitive
          ? headerValue
          : headerValue.toLowerCase();
        const containsExpected = condition.caseSensitive
          ? expectedValue
          : expectedValue.toLowerCase();
        return containsValue.includes(containsExpected);
      }
      case 'regex': {
        if (!expectedValue || !headerValue) return false;
        const flags = condition.caseSensitive ? '' : 'i';
        return new RegExp(expectedValue, flags).test(headerValue);
      }
      default:
        return false;
    }
  }

  /**
   * Evaluate URL condition
   */
  private static evaluateUrl(
    condition: RuleCondition,
    context: RuleEvaluationContext
  ): boolean {
    if (!context.url) return false;

    const url = condition.caseSensitive
      ? context.url
      : context.url.toLowerCase();
    const expectedValue = condition.caseSensitive
      ? condition.value.toString()
      : condition.value.toString().toLowerCase();

    switch (condition.operator) {
      case 'equals':
        return url === expectedValue;
      case 'contains':
        return url.includes(expectedValue);
      case 'regex': {
        const flags = condition.caseSensitive ? '' : 'i';
        return new RegExp(condition.value.toString(), flags).test(url);
      }
      default:
        return false;
    }
  }

  /**
   * Validate a condition for syntax errors
   */
  static validateCondition(condition: RuleCondition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate operator for condition type
    const validOperators = this.getValidOperators(condition.type);
    if (!validOperators.includes(condition.operator)) {
      errors.push(
        `Operator '${condition.operator}' is not valid for condition type '${condition.type}'`
      );
    }

    // Validate regex patterns
    if (condition.operator === 'regex') {
      try {
        new RegExp(condition.value.toString());
      } catch {
        errors.push('Invalid regular expression pattern');
      }
    }

    // Validate time format
    if (condition.type === 'time') {
      const timeValue = condition.value.toString();
      if (!this.isValidTimeFormat(timeValue)) {
        errors.push(
          'Invalid time format. Use HH:MM-HH:MM, weekday:1-7, hour:0-23, or date:YYYY-MM-DD'
        );
      }
    }

    // Validate numeric values for status codes
    if (
      condition.type === 'responseStatus' &&
      ['greater', 'less', 'equals'].includes(condition.operator)
    ) {
      const numValue = Number(condition.value);
      if (isNaN(numValue) || numValue < 100 || numValue > 599) {
        errors.push(
          'Response status must be a valid HTTP status code (100-599)'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get valid operators for a condition type
   */
  private static getValidOperators(type: string): string[] {
    const operatorMap: Record<string, string[]> = {
      responseStatus: ['equals', 'greater', 'less', 'contains', 'regex'],
      requestMethod: ['equals', 'contains', 'regex'],
      userAgent: ['equals', 'contains', 'regex'],
      cookie: ['exists', 'equals', 'contains', 'regex'],
      time: ['equals'], // Time conditions use special value formats
      header: ['exists', 'equals', 'contains', 'regex'],
      url: ['equals', 'contains', 'regex'],
    };

    return operatorMap[type] || [];
  }

  /**
   * Validate time format
   */
  private static isValidTimeFormat(timeValue: string): boolean {
    // Check various time formats
    const patterns = [
      /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/, // HH:MM-HH:MM
      /^weekday:[1-7]-[1-7]$/, // weekday:1-7
      /^hour:\d{1,2}-\d{1,2}$/, // hour:0-23
      /^date:\d{4}-\d{2}-\d{2}$/, // date:YYYY-MM-DD
    ];

    return patterns.some(pattern => pattern.test(timeValue));
  }
}

/**
 * Context for rule evaluation
 */
export interface RuleEvaluationContext {
  url?: string;
  requestMethod?: string;
  userAgent?: string;
  responseStatus?: number;
  requestHeaders?: Record<string, string>;
  cookies?: Record<string, string>;
  currentTime?: Date;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Condition builder helpers
 */
export class ConditionBuilder {
  /**
   * Create a response status condition
   */
  static responseStatus(
    operator: 'equals' | 'greater' | 'less',
    statusCode: number
  ): RuleCondition {
    return {
      type: 'responseStatus',
      operator,
      value: statusCode,
    };
  }

  /**
   * Create a request method condition
   */
  static requestMethod(method: string, caseSensitive = false): RuleCondition {
    return {
      type: 'requestMethod',
      operator: 'equals',
      value: method,
      caseSensitive,
    };
  }

  /**
   * Create a user agent condition
   */
  static userAgent(
    pattern: string,
    operator: 'equals' | 'contains' | 'regex' = 'contains',
    caseSensitive = false
  ): RuleCondition {
    return {
      type: 'userAgent',
      operator,
      value: pattern,
      caseSensitive,
    };
  }

  /**
   * Create a cookie condition
   */
  static cookie(cookieName: string, expectedValue?: string): RuleCondition {
    return {
      type: 'cookie',
      operator: expectedValue ? 'equals' : 'exists',
      value: expectedValue ? `${cookieName}=${expectedValue}` : cookieName,
    };
  }

  /**
   * Create a time-based condition
   */
  static timeRange(startTime: string, endTime: string): RuleCondition {
    return {
      type: 'time',
      operator: 'equals',
      value: `${startTime}-${endTime}`,
    };
  }

  /**
   * Create a business hours condition (9 AM - 5 PM, weekdays)
   */
  static businessHours(): RuleCondition[] {
    return [
      {
        type: 'time',
        operator: 'equals',
        value: 'hour:9-17',
      },
      {
        type: 'time',
        operator: 'equals',
        value: 'weekday:1-5',
      },
    ];
  }

  /**
   * Create a header condition
   */
  static header(
    headerName: string,
    expectedValue?: string,
    operator: 'exists' | 'equals' | 'contains' | 'regex' = 'exists'
  ): RuleCondition {
    return {
      type: 'header',
      operator,
      value: expectedValue ? `${headerName}=${expectedValue}` : headerName,
    };
  }
}

import type { HeaderRule } from '@/shared/types/rules';

export interface RuleFormData {
  name: string;
  pattern: {
    protocol: string;
    domain: string;
    path: string;
  };
  priority: number;
  enabled: boolean;
  description: string;
  tags: string[];
}

export interface NewHeaderEntry {
  name: string;
  value: string;
  operation: 'set' | 'append' | 'remove';
  target: 'request' | 'response';
}

/**
 * Validate rule form data
 */
export const validateRuleForm = (formData: RuleFormData): string | null => {
  if (!formData.name.trim()) return 'Rule name is required';
  if (!formData.pattern.domain.trim()) return 'Domain is required';
  return null;
};

/**
 * Default rule form data
 */
export const DEFAULT_RULE_FORM: RuleFormData = {
  name: '',
  pattern: {
    protocol: '*',
    domain: '',
    path: '/*',
  },
  priority: 1,
  enabled: true,
  description: '',
  tags: [],
};

/**
 * Convert form data to HeaderRule
 */
export const createRuleFromFormData = (
  formData: RuleFormData,
  headers: NewHeaderEntry[],
  existingRule?: HeaderRule
): HeaderRule => {
  const now = new Date();

  return {
    id: existingRule?.id || `rule_${Date.now()}`,
    name: formData.name,
    enabled: formData.enabled,
    pattern: formData.pattern,
    headers: headers.map(header => ({
      name: header.name,
      value: header.value,
      operation: header.operation,
      target: header.target,
    })),
    priority: formData.priority,
    createdAt: existingRule?.createdAt || now,
    updatedAt: now,
    description: formData.description,
    tags: formData.tags,
  };
};

/**
 * Convert HeaderRule to form data
 */
export const createFormDataFromRule = (
  rule: HeaderRule
): { formData: RuleFormData; headers: NewHeaderEntry[] } => {
  return {
    formData: {
      name: rule.name,
      pattern: {
        protocol: rule.pattern.protocol || '*',
        domain: rule.pattern.domain,
        path: rule.pattern.path || '/*',
      },
      priority: rule.priority,
      enabled: rule.enabled,
      description: rule.description || '',
      tags: rule.tags || [],
    },
    headers: rule.headers.map(header => ({
      name: header.name,
      value: header.value,
      operation: header.operation,
      target: header.target,
    })),
  };
};

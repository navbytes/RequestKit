import { useState, useEffect } from 'preact/hooks';

import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import type { RuleFormData, NewHeaderEntry } from '../utils/ruleValidation';
import {
  DEFAULT_RULE_FORM,
  createFormDataFromRule,
} from '../utils/ruleValidation';

const logger = loggers.background;

/**
 * Custom hook for managing rule form state
 */
export function useRuleForm(
  editingRule: HeaderRule | null,
  initialUrl?: string | null
) {
  const [formData, setFormData] = useState<RuleFormData>(DEFAULT_RULE_FORM);
  const [headers, setHeaders] = useState<NewHeaderEntry[]>([]);

  useEffect(() => {
    if (editingRule) {
      const { formData: ruleFormData, headers: ruleHeaders } =
        createFormDataFromRule(editingRule);
      setFormData(ruleFormData);
      setHeaders(ruleHeaders);
    } else {
      // Create new rule - check if we have an initial URL to prefill
      let initialFormData = { ...DEFAULT_RULE_FORM };

      if (initialUrl) {
        try {
          const url = new URL(initialUrl);
          initialFormData = {
            ...DEFAULT_RULE_FORM,
            name: `Rule for ${url.hostname}`,
            pattern: {
              protocol: url.protocol.replace(':', ''),
              domain: url.hostname,
              path: url.pathname === '/' ? '/*' : `${url.pathname}*`,
            },
          };
        } catch (error) {
          // If URL parsing fails, just use default form
          logger.warn('Failed to parse initial URL:', initialUrl, error);
        }
      }

      setFormData(initialFormData);
      setHeaders([]);
    }
  }, [editingRule, initialUrl]);

  const resetForm = () => {
    setFormData(DEFAULT_RULE_FORM);
    setHeaders([]);
  };

  const updateFormData = (updates: Partial<RuleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updatePattern = (updates: Partial<RuleFormData['pattern']>) => {
    setFormData(prev => ({
      ...prev,
      pattern: { ...prev.pattern, ...updates },
    }));
  };

  const addHeader = () => {
    setHeaders(prev => [
      ...prev,
      { name: '', value: '', operation: 'set', target: 'request' },
    ]);
  };

  const updateHeader = (
    index: number,
    field: keyof NewHeaderEntry,
    value: string
  ) => {
    setHeaders(prev =>
      prev.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      )
    );
  };

  const removeHeader = (index: number) => {
    setHeaders(prev => prev.filter((_, i) => i !== index));
  };

  return {
    formData,
    setFormData,
    headers,
    setHeaders,
    resetForm,
    updateFormData,
    updatePattern,
    addHeader,
    updateHeader,
    removeHeader,
  };
}

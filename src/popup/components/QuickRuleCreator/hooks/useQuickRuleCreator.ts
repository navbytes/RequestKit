import { useState } from 'preact/hooks';

import type { HeaderRule } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';


// Get logger for this module
const logger = loggers.shared;

export function useQuickRuleCreator(
  currentUrl: string,
  onRuleCreated: (rule: HeaderRule) => void
) {
  const [ruleName, setRuleName] = useState('');
  const [headerName, setHeaderName] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  const getPatternFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return {
        domain: urlObj.hostname,
        path: urlObj.pathname === '/' ? '' : urlObj.pathname,
        protocol: urlObj.protocol.replace(':', '') as 'http' | 'https',
      };
    } catch {
      return {
        domain: 'unknown',
        path: '',
        protocol: 'https' as const,
      };
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!ruleName.trim() || !headerName.trim() || !headerValue.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const pattern = getPatternFromUrl(currentUrl);
      const newRule: HeaderRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: ruleName.trim(),
        pattern,
        headers: [
          {
            name: headerName.trim(),
            value: headerValue.trim(),
            operation: 'set',
            target: 'request',
          },
        ],
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onRuleCreated(newRule);
    } catch (error) {
      logger.error('Failed to create rule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const domain = getDomainFromUrl(currentUrl);

  return {
    ruleName,
    setRuleName,
    headerName,
    setHeaderName,
    headerValue,
    setHeaderValue,
    isSubmitting,
    domain,
    handleSubmit,
  };
}

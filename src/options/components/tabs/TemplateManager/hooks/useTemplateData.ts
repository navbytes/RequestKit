import { useState, useCallback } from 'preact/hooks';

import { BUILT_IN_TEMPLATES } from '@/lib/data/rule-templates';
import type { RuleTemplate } from '@/shared/types/templates';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export function useTemplateData() {
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<RuleTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load custom templates from storage
      const result = (await ChromeApiUtils.storage.sync.get([
        'customTemplates',
      ])) as Record<string, unknown>;
      const stored = (result.customTemplates as RuleTemplate[]) || [];
      setCustomTemplates(stored);

      // Combine built-in and custom templates
      setTemplates([...BUILT_IN_TEMPLATES, ...stored]);
    } catch (error) {
      logger.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCustomTemplates = (newCustomTemplates: RuleTemplate[]) => {
    setCustomTemplates(newCustomTemplates);
    setTemplates([...BUILT_IN_TEMPLATES, ...newCustomTemplates]);
  };

  return {
    templates,
    customTemplates,
    isLoading,
    loadTemplates,
    updateCustomTemplates,
  };
}

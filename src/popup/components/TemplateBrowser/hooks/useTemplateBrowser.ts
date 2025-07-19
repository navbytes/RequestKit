import { useState, useEffect } from 'preact/hooks';

import {
  getTemplatesByCategory,
  searchTemplates,
  getPopularTemplates,
  BUILT_IN_TEMPLATES,
} from '@/lib/data/rule-templates';
import type { HeaderRule } from '@/shared/types/rules';
import type { RuleTemplate } from '@/shared/types/templates';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export function useTemplateBrowser(
  currentUrl?: string,
  onTemplateApply?: (rule: HeaderRule) => void
) {
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = () => {
      if (searchQuery.trim()) {
        const searchResults = searchTemplates(searchQuery, BUILT_IN_TEMPLATES);
        setTemplates(searchResults);
      } else if (selectedCategory === 'popular') {
        const popularTemplates = getPopularTemplates(10, BUILT_IN_TEMPLATES);
        setTemplates(popularTemplates);
      } else {
        const categoryTemplates = getTemplatesByCategory(
          selectedCategory,
          BUILT_IN_TEMPLATES
        );
        setTemplates(categoryTemplates);
      }
    };
    loadTemplates();
  }, [selectedCategory, searchQuery]);

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  };

  const applyTemplate = async (template: RuleTemplate) => {
    if (!onTemplateApply) return;

    setIsApplying(template.id);

    try {
      // Create a rule from the template
      const domain = currentUrl
        ? getDomainFromUrl(currentUrl)
        : template.pattern?.domain || '*';

      const rule: HeaderRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${template.name} - ${domain}`,
        pattern: template.pattern || {
          domain,
          path: '/*',
          protocol: 'https',
        },
        headers: template.headers?.map(header => ({ ...header })) || [],
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onTemplateApply(rule);
    } catch (error) {
      logger.error('Failed to apply template:', error);
    } finally {
      setIsApplying(null);
    }
  };

  const categories = [
    { id: 'popular', name: 'Popular Templates', icon: 'star' },
    ...Object.values(TEMPLATE_CATEGORIES),
  ];

  const selectedCategoryInfo = categories.find(
    cat => cat.id === selectedCategory
  );

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    templates,
    isApplying,
    categories,
    selectedCategoryInfo,
    applyTemplate,
    getDomainFromUrl,
  };
}

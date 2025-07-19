import { useState, useEffect } from 'preact/hooks';

import {
  BUILT_IN_TEMPLATES,
  getTemplatesByCategory,
  searchTemplates,
} from '@/lib/data/rule-templates';
import type { RuleTemplate } from '@/shared/types/templates';
export function useTemplateFilters(
  _templates: RuleTemplate[],
  customTemplates: RuleTemplate[]
) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplateType, setSelectedTemplateType] =
    useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<RuleTemplate[]>(
    []
  );

  useEffect(() => {
    const filterTemplates = () => {
      let allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];
      if (searchQuery.trim()) {
        allTemplates = searchTemplates(searchQuery, allTemplates);
      } else {
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'custom') {
            allTemplates = customTemplates;
          } else if (selectedCategory === 'builtin') {
            allTemplates = BUILT_IN_TEMPLATES;
          } else {
            allTemplates = getTemplatesByCategory(
              selectedCategory,
              allTemplates
            );
          }
        }
        if (selectedTemplateType !== 'all') {
          allTemplates = allTemplates.filter(
            t => t.templateType === selectedTemplateType
          );
        }
      }
      setFilteredTemplates(allTemplates);
    };
    filterTemplates();
  }, [customTemplates, searchQuery, selectedCategory, selectedTemplateType]);

  return {
    filteredTemplates,
    selectedCategory,
    selectedTemplateType,
    searchQuery,
    setSelectedCategory,
    setSelectedTemplateType,
    setSearchQuery,
  };
}

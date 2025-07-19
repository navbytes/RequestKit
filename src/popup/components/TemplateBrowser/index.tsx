import type { HeaderRule } from '@/shared/types/rules';

import { useTemplateBrowser } from './hooks/useTemplateBrowser';
import { TemplateBrowserControls } from './TemplateBrowserControls';
import { TemplateBrowserFooter } from './TemplateBrowserFooter';
import { TemplateBrowserHeader } from './TemplateBrowserHeader';
import { TemplatesList } from './TemplatesList';

interface TemplateBrowserProps {
  currentUrl?: string;
  onTemplateApply: (rule: HeaderRule) => void;
  onClose: () => void;
}

export function TemplateBrowser({
  currentUrl,
  onTemplateApply,
  onClose,
}: TemplateBrowserProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    templates,
    isApplying,
    categories,
    selectedCategoryInfo,
    applyTemplate,
  } = useTemplateBrowser(currentUrl, onTemplateApply);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <TemplateBrowserHeader onClose={onClose} />

        <TemplateBrowserControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedCategoryInfo={selectedCategoryInfo}
          templates={templates}
        />

        <TemplatesList
          templates={templates}
          searchQuery={searchQuery}
          isApplying={isApplying}
          onApplyTemplate={applyTemplate}
        />

        {currentUrl && <TemplateBrowserFooter currentUrl={currentUrl} />}
      </div>
    </div>
  );
}

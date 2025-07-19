import { Icon, IconName } from '@/shared/components/Icon';
import type { RuleTemplate } from '@/shared/types/templates';

interface TemplateBrowserControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Array<{ id: string; name: string; icon: string }>;
  selectedCategoryInfo?: { id: string; name: string; icon: string } | undefined;
  templates: RuleTemplate[];
}

export function TemplateBrowserControls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedCategoryInfo,
  templates,
}: TemplateBrowserControlsProps) {
  return (
    <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onInput={e => {
            const target = e.target as HTMLInputElement;
            const value = target?.value || '';
            setSearchQuery(value);
            if (value.trim()) {
              setSelectedCategory(''); // Clear category when searching
            } else {
              // Restore default category when search is cleared
              setSelectedCategory('popular');
            }
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Category Dropdown */}
      {!searchQuery.trim() && (
        <div>
          <select
            value={selectedCategory}
            onChange={e =>
              setSelectedCategory((e.target as HTMLSelectElement).value)
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Info */}
      {!searchQuery.trim() && selectedCategoryInfo && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon
            name={selectedCategoryInfo.icon as IconName}
            className="w-4 h-4"
          />
          <span>{selectedCategoryInfo.name}</span>
          <span>•</span>
          <span>
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {templates.length} result{templates.length !== 1 ? 's' : ''} for
          &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}

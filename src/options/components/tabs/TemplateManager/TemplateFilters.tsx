import { Icon } from '@/shared/components/Icon';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';

interface TemplateFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedTemplateType: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onTemplateTypeChange: (type: string) => void;
}

export function TemplateFilters({
  searchQuery,
  selectedCategory,
  selectedTemplateType,
  onSearchChange,
  onCategoryChange,
  onTemplateTypeChange,
}: TemplateFiltersProps) {
  const categories = [
    {
      id: 'all',
      name: 'All Templates',
      icon: <Icon name="file-text" className="w-4 h-4" />,
    },
    {
      id: 'builtin',
      name: 'Built-in',
      icon: <Icon name="package" className="w-4 h-4" />,
    },
    {
      id: 'custom',
      name: 'Custom',
      icon: <Icon name="edit" className="w-4 h-4" />,
    },
    ...Object.values(TEMPLATE_CATEGORIES),
  ];

  const templateTypes = [
    {
      id: 'all',
      name: 'All Types',
      icon: <Icon name="target" className="w-4 h-4" />,
    },
    {
      id: 'headers',
      name: 'Headers Only',
      icon: <Icon name="file-text" className="w-4 h-4" />,
    },
    {
      id: 'conditional',
      name: 'Conditional Rules',
      icon: <Icon name="git-branch" className="w-4 h-4" />,
    },
    {
      id: 'file',
      name: 'File Interception',
      icon: <Icon name="package" className="w-4 h-4" />,
    },
    {
      id: 'advanced',
      name: 'Advanced Features',
      icon: <Icon name="settings" className="w-4 h-4" />,
    },
    {
      id: 'complete',
      name: 'Complete Rules',
      icon: <Icon name="target" className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onInput={e => onSearchChange((e.target as HTMLInputElement).value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={e => onCategoryChange((e.target as HTMLSelectElement).value)}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        value={selectedTemplateType}
        onChange={e =>
          onTemplateTypeChange((e.target as HTMLSelectElement).value)
        }
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {templateTypes.map(type => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
}

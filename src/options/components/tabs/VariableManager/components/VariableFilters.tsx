import type { VariableScope } from '@/shared/types/variables';

interface VariableFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterScope: VariableScope | 'all';
  onScopeChange: (scope: VariableScope | 'all') => void;
  filterFunctions: 'all' | 'functions' | 'static';
  onFunctionsChange: (filter: 'all' | 'functions' | 'static') => void;
  availableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function VariableFilters({
  searchQuery,
  onSearchChange,
  filterScope,
  onScopeChange,
  filterFunctions,
  onFunctionsChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  hasActiveFilters,
}: Readonly<VariableFiltersProps>) {
  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onInput={e => onSearchChange((e.target as HTMLInputElement).value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterScope}
          onChange={e =>
            onScopeChange(
              (e.target as HTMLSelectElement).value as VariableScope | 'all'
            )
          }
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Scopes</option>
          <option value="global">Global</option>
          <option value="profile">Profile</option>
          <option value="rule">Rule</option>
          <option value="system">System</option>
        </select>
        <select
          value={filterFunctions}
          onChange={e =>
            onFunctionsChange(
              (e.target as HTMLSelectElement).value as
                | 'all'
                | 'functions'
                | 'static'
            )
          }
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Variables</option>
          <option value="static">Static Values</option>
          <option value="functions">With Functions</option>
        </select>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

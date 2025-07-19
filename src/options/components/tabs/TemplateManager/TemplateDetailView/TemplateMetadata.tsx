import { Icon } from '@/shared/components/Icon';
import type { RuleTemplate } from '@/shared/types/templates';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';

interface TemplateMetadataProps {
  template: RuleTemplate;
}

export function TemplateMetadata({ template }: TemplateMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Category
        </h4>
        <div className="flex items-center space-x-2">
          <Icon
            name={TEMPLATE_CATEGORIES[template.category]?.icon || 'file-text'}
            className="w-4 h-4"
          />
          <span className="text-gray-900 dark:text-white">
            {TEMPLATE_CATEGORIES[template.category]?.name || template.category}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Author
        </h4>
        <span className="text-gray-900 dark:text-white">
          {template.author || 'Unknown'}
        </span>
      </div>

      {template.popularity && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Popularity
          </h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full"
                style={{ width: `${template.popularity}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-900 dark:text-white">
              {template.popularity}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

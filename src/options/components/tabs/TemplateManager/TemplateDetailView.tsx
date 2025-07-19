import { Icon } from '@/shared/components/Icon';
import type { RuleTemplate } from '@/shared/types/templates';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';

import { TemplateAdvancedFeatures } from './TemplateDetailView/TemplateAdvancedFeatures';
import { TemplateConditions } from './TemplateDetailView/TemplateConditions';
import { TemplateHeaders } from './TemplateDetailView/TemplateHeaders';
import { TemplateMetadata } from './TemplateDetailView/TemplateMetadata';
import { TemplateTags } from './TemplateDetailView/TemplateTags';
import { TemplateUrlPattern } from './TemplateDetailView/TemplateUrlPattern';

interface TemplateDetailViewProps {
  template: RuleTemplate;
  onClose: () => void;
  onCloneAndEdit: () => void;
  onExport: () => void;
}

export function TemplateDetailView({
  template,
  onClose,
  onCloneAndEdit,
  onExport,
}: TemplateDetailViewProps) {
  const getTemplateTypeIcon = (templateType: string) => {
    switch (templateType) {
      case 'headers':
        return <Icon name="file-text" className="w-6 h-6" />;
      case 'conditional':
        return <Icon name="git-branch" className="w-6 h-6" />;
      case 'file':
        return <Icon name="package" className="w-6 h-6" />;
      case 'advanced':
        return <Icon name="settings" className="w-6 h-6" />;
      case 'complete':
        return <Icon name="target" className="w-6 h-6" />;
      default:
        return <Icon name="file-text" className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden my-8">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 dark:text-gray-400">
                <Icon
                  name={
                    TEMPLATE_CATEGORIES[template.category]?.icon || 'file-text'
                  }
                  className="w-6 h-6"
                />
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {getTemplateTypeIcon(template.templateType)}
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {template.name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  {template.isBuiltIn ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Icon name="check-circle" className="w-3 h-3 mr-1" />
                      Built-in Template
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      <Icon name="edit" className="w-3 h-3 mr-1" />
                      Custom Template
                    </span>
                  )}
                  <span className="badge badge-outline badge-sm">
                    {template.templateType.charAt(0).toUpperCase() +
                      template.templateType.slice(1)}{' '}
                    Template
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-140px)]">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>

            {/* Metadata */}
            <TemplateMetadata template={template} />

            {/* Headers */}
            {template.headers && template.headers.length > 0 && (
              <TemplateHeaders headers={template.headers} />
            )}

            {/* Conditions */}
            {template.conditions && template.conditions.length > 0 && (
              <TemplateConditions conditions={template.conditions} />
            )}

            {/* URL Pattern */}
            {template.pattern && (
              <TemplateUrlPattern pattern={template.pattern} />
            )}

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <TemplateTags tags={template.tags} />
            )}

            {/* Advanced Features */}
            {(template.schedule ||
              template.limits ||
              template.resourceTypes?.length) && (
              <TemplateAdvancedFeatures template={template} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {template.createdAt && (
                <span>
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </span>
              )}
              {template.updatedAt &&
                template.createdAt !== template.updatedAt && (
                  <span className="ml-4">
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <Icon name="download" className="w-4 h-4 mr-2" />
                Export
              </button>
              {template.isBuiltIn && (
                <button
                  onClick={onCloneAndEdit}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <Icon name="copy" className="w-4 h-4 mr-2" />
                  Clone & Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

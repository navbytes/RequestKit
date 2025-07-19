import type { HeaderEntry } from '@/shared/types/rules';
import { TEMPLATE_CATEGORIES } from '@/shared/types/templates';
import {
  getInputValue,
  getTextAreaValue,
  createTypedSelectHandler,
} from '@/shared/utils/form-events';

interface BasicTemplateInfoProps {
  formData: {
    name: string;
    description: string;
    category:
      | 'cors'
      | 'auth'
      | 'security'
      | 'debugging'
      | 'api'
      | 'performance'
      | 'conditional'
      | 'file'
      | 'advanced'
      | 'custom';
    templateType: 'headers' | 'conditional' | 'file' | 'advanced' | 'complete';
    headers: HeaderEntry[];
    tags: string[];
  };
  setFormData: (data: {
    name: string;
    description: string;
    category:
      | 'cors'
      | 'auth'
      | 'security'
      | 'debugging'
      | 'api'
      | 'performance'
      | 'conditional'
      | 'file'
      | 'advanced'
      | 'custom';
    templateType: 'headers' | 'conditional' | 'file' | 'advanced' | 'complete';
    headers: HeaderEntry[];
    tags: string[];
  }) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

export function BasicTemplateInfo({
  formData,
  setFormData,
  newTag,
  setNewTag,
  addTag,
  removeTag,
}: Readonly<BasicTemplateInfoProps>) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="template-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Template Name *
        </label>
        <input
          id="template-name"
          type="text"
          value={formData.name}
          onInput={e =>
            setFormData({
              ...formData,
              name: getInputValue(e),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter template name"
          required
        />
      </div>

      <div>
        <label
          htmlFor="template-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description *
        </label>
        <textarea
          id="template-description"
          value={formData.description}
          onInput={e =>
            setFormData({
              ...formData,
              description: getTextAreaValue(e),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe what this template does"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="template-category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="template-category"
            value={formData.category}
            onChange={createTypedSelectHandler<typeof formData.category>(
              category =>
                setFormData({
                  ...formData,
                  category,
                })
            )}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="custom">Custom</option>
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="template-type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Template Type *
          </label>
          <select
            id="template-type"
            value={formData.templateType}
            onChange={createTypedSelectHandler<typeof formData.templateType>(
              templateType =>
                setFormData({
                  ...formData,
                  templateType,
                })
            )}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="headers">Headers Only</option>
            <option value="conditional">Conditional Rules</option>
            <option value="file">File Interception</option>
            <option value="advanced">Advanced Features</option>
            <option value="complete">Complete Rules</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="template-tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags?.map(tag => (
            <span
              key={tag}
              className="badge badge-secondary flex items-center space-x-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            id="template-tags"
            type="text"
            value={newTag}
            onInput={e => setNewTag(getInputValue(e))}
            onKeyPress={e =>
              e.key === 'Enter' && (e.preventDefault(), addTag())
            }
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="btn btn-secondary btn-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import type { HeaderEntry } from '@/shared/types/rules';
import type { RuleTemplate } from '@/shared/types/templates';

import { AdvancedTemplateNote } from './TemplateForm/AdvancedTemplateNote';
import { BasicTemplateInfo } from './TemplateForm/BasicTemplateInfo';
import { TemplateHeaders } from './TemplateForm/TemplateHeaders';

interface TemplateFormProps {
  template?: RuleTemplate | null;
  onSave: (template: RuleTemplate) => void;
  onCancel: () => void;
}

export function TemplateForm({
  template,
  onSave,
  onCancel,
}: Readonly<TemplateFormProps>) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'custom',
    templateType: template?.templateType || 'headers',
    headers: template?.headers || [],
    tags: template?.tags || [],
  });

  const [newTag, setNewTag] = useState('');
  const [newHeader, setNewHeader] = useState<{
    name: string;
    value: string;
    operation: 'set' | 'append' | 'remove';
    target: 'request' | 'response';
  }>({
    name: '',
    value: '',
    operation: 'set',
    target: 'request',
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      alert('Please fill in name and description');
      return;
    }

    if (formData.templateType === 'headers' && !formData.headers?.length) {
      alert('Headers template must have at least one header');
      return;
    }

    const templateData: RuleTemplate = {
      id:
        template?.id ||
        `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      description: formData.description,
      category: formData.category as RuleTemplate['category'],
      templateType: formData.templateType as RuleTemplate['templateType'],
      ...(formData.headers?.length && { headers: formData.headers }),
      tags: formData.tags || [],
      popularity: template?.popularity || 0,
      author: template?.author || 'User',
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
      isBuiltIn: false,
    };

    onSave(templateData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const addHeader = () => {
    if (!newHeader.name.trim() || !newHeader.value.trim()) {
      alert('Please fill in header name and value');
      return;
    }

    setFormData({
      ...formData,
      headers: [...formData.headers, { ...newHeader }],
    });

    setNewHeader({
      name: '',
      value: '',
      operation: 'set',
      target: 'request',
    });
  };

  const removeHeader = (index: number) => {
    setFormData({
      ...formData,
      headers: formData.headers.filter((_, i) => i !== index),
    });
  };

  const updateHeader = (
    index: number,
    field: keyof HeaderEntry,
    value: string
  ) => {
    const updatedHeaders = [...formData.headers];
    updatedHeaders[index] = {
      ...updatedHeaders[index],
      [field]: value,
    } as HeaderEntry;
    setFormData({
      ...formData,
      headers: updatedHeaders,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden my-8">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {template ? 'Edit Template' : 'Create Template'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <BasicTemplateInfo
              formData={formData}
              setFormData={setFormData}
              newTag={newTag}
              setNewTag={setNewTag}
              addTag={addTag}
              removeTag={removeTag}
            />

            {/* Headers (only show for headers template type) */}
            {formData.templateType === 'headers' && (
              <TemplateHeaders
                headers={formData.headers}
                newHeader={newHeader}
                setNewHeader={setNewHeader}
                addHeader={addHeader}
                removeHeader={removeHeader}
                updateHeader={updateHeader}
              />
            )}

            {/* Note for other template types */}
            {formData.templateType !== 'headers' && (
              <AdvancedTemplateNote templateType={formData.templateType} />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

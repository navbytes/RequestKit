import type { RuleTemplate } from '@/shared/types/templates';
import { ChromeApiUtils } from '@/shared/utils';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export function useTemplateOperations(
  customTemplates: RuleTemplate[],
  updateCustomTemplates: (templates: RuleTemplate[]) => void,
  onTemplateCreate?: (template: RuleTemplate) => void,
  onTemplateUpdate?: (template: RuleTemplate) => void,
  onTemplateDelete?: (templateId: string) => void
) {
  const saveCustomTemplate = async (
    template: RuleTemplate,
    editingTemplate?: RuleTemplate | null
  ) => {
    try {
      const updatedTemplates = editingTemplate
        ? customTemplates.map(t => (t.id === template.id ? template : t))
        : [...customTemplates, template];

      await ChromeApiUtils.storage.sync.set({
        customTemplates: updatedTemplates,
      });

      if (editingTemplate) {
        onTemplateUpdate?.(template);
      } else {
        onTemplateCreate?.(template);
      }

      updateCustomTemplates(updatedTemplates);
    } catch (error) {
      logger.error('Failed to save template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
      await ChromeApiUtils.storage.sync.set({
        customTemplates: updatedTemplates,
      });
      onTemplateDelete?.(templateId);
      updateCustomTemplates(updatedTemplates);
    } catch (error) {
      logger.error('Failed to delete template:', error);
    }
  };

  const cloneTemplate = (template: RuleTemplate): RuleTemplate => {
    return {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      isBuiltIn: false,
      author: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const exportTemplate = (template: RuleTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const importTemplate = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const template = JSON.parse(text) as RuleTemplate;

      // Validate template structure
      if (!template.id || !template.name || !template.templateType) {
        throw new Error('Invalid template format');
      }

      // Generate new ID to avoid conflicts
      template.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      template.createdAt = new Date();
      template.updatedAt = new Date();

      await saveCustomTemplate(template);
    } catch (error) {
      logger.error('Failed to import template:', error);
      alert('Failed to import template. Please check the file format.');
    }

    // Reset file input
    (event.target as HTMLInputElement).value = '';
  };

  return {
    saveCustomTemplate,
    deleteTemplate,
    cloneTemplate,
    exportTemplate,
    importTemplate,
  };
}

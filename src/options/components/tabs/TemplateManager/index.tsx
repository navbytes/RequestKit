import { useState, useEffect } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { TabDescription } from '@/shared/components/TabDescription';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';
import type { RuleTemplate } from '@/shared/types/templates';
import { loggers } from '@/shared/utils/debug';

import { useTemplateData } from './hooks/useTemplateData';
import { useTemplateFilters } from './hooks/useTemplateFilters';
import { useTemplateOperations } from './hooks/useTemplateOperations';
import { TemplateDetailView } from './TemplateDetailView';
import { TemplateFilters } from './TemplateFilters';
import { TemplateForm } from './TemplateForm';
import { TemplateGrid } from './TemplateGrid';

interface TemplateManagerProps {
  onTemplateCreate?: (template: RuleTemplate) => void;
  onTemplateUpdate?: (template: RuleTemplate) => void;
  onTemplateDelete?: (templateId: string) => void;
  onTemplateApply?: (rule: HeaderRule) => void;
}

export function TemplateManager({
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateApply,
}: Readonly<TemplateManagerProps>) {
  const { t } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RuleTemplate | null>(
    null
  );
  const [viewingTemplate, setViewingTemplate] = useState<RuleTemplate | null>(
    null
  );
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Get logger for this module
  const logger = loggers.shared;

  const {
    templates,
    customTemplates,
    isLoading,
    loadTemplates,
    updateCustomTemplates,
  } = useTemplateData();

  const {
    filteredTemplates,
    selectedCategory,
    selectedTemplateType,
    searchQuery,
    setSelectedCategory,
    setSelectedTemplateType,
    setSearchQuery,
  } = useTemplateFilters(templates, customTemplates);

  const {
    saveCustomTemplate,
    deleteTemplate,
    cloneTemplate,
    exportTemplate,
    importTemplate,
  } = useTemplateOperations(
    customTemplates,
    updateCustomTemplates,
    onTemplateCreate,
    onTemplateUpdate,
    onTemplateDelete
  );

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSaveTemplate = async (template: RuleTemplate) => {
    await saveCustomTemplate(template, editingTemplate);
    setShowCreateForm(false);
    setEditingTemplate(null);
  };

  const handleCloneTemplate = (template: RuleTemplate) => {
    const cloned = cloneTemplate(template);
    setEditingTemplate(cloned);
    setShowCreateForm(true);
  };

  const handleEditTemplate = (template: RuleTemplate) => {
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleCloneAndEdit = () => {
    if (viewingTemplate) {
      handleCloneTemplate(viewingTemplate);
      setViewingTemplate(null);
    }
  };

  const handleExportTemplate = (template: RuleTemplate) => {
    exportTemplate(template);
  };

  const handleApplyTemplate = async (template: RuleTemplate) => {
    if (!onTemplateApply) return;

    setIsApplying(template.id);

    try {
      // Create a rule from the template
      const rule: HeaderRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${template.name} - ${t('templates_applied_from_template')}`,
        pattern: template.pattern || {
          domain: '*',
          path: '/*',
          protocol: 'https',
        },
        headers: template.headers?.map(header => ({ ...header })) || [],
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onTemplateApply(rule);
      logger.info('Template applied successfully:', template.name);
    } catch (error) {
      logger.error('Failed to apply template:', error);
    } finally {
      setIsApplying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabDescription
        title={t('templates_management_title')}
        description={t('templates_management_description')}
        icon="file-text"
        features={[
          t('templates_management_features_1'),
          t('templates_management_features_2'),
          t('templates_management_features_3'),
          t('templates_management_features_4'),
          t('templates_management_features_5'),
          t('templates_management_features_6'),
        ]}
        useCases={[
          t('templates_management_use_cases_1'),
          t('templates_management_use_cases_2'),
          t('templates_management_use_cases_3'),
          t('templates_management_use_cases_4'),
          t('templates_management_use_cases_5'),
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <label className="btn btn-secondary btn-sm">
            <Icon name="upload" className="w-4 h-4 mr-2" />
            {t('templates_import')}
            <input
              type="file"
              accept=".json"
              onChange={importTemplate}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary btn-sm"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            {t('templates_create')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <TemplateFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedTemplateType={selectedTemplateType}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onTemplateTypeChange={setSelectedTemplateType}
      />

      {/* Templates Grid */}
      <TemplateGrid
        templates={filteredTemplates}
        searchQuery={searchQuery}
        onView={setViewingTemplate}
        onApply={onTemplateApply ? handleApplyTemplate : undefined}
        onEdit={handleEditTemplate}
        onDelete={deleteTemplate}
        onClone={handleCloneTemplate}
        onExport={handleExportTemplate}
        isApplying={isApplying}
      />

      {/* Create/Edit Template Modal */}
      {showCreateForm && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Template Detail View Modal */}
      {viewingTemplate && (
        <TemplateDetailView
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          onCloneAndEdit={handleCloneAndEdit}
          onExport={() => handleExportTemplate(viewingTemplate)}
        />
      )}
    </div>
  );
}

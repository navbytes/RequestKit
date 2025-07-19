import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { TabDescription } from '@/shared/components/TabDescription';
import { EmptyState, Card } from '@/shared/components/ui';
import { VariableForm } from '@/shared/components/VariableForm';
import { VariableList } from '@/shared/components/VariableList';
import { useI18n } from '@/shared/hooks/useI18n';
import type { Variable } from '@/shared/types/variables';

import { AvailableFunctions } from './components/AvailableFunctions';
import { VariableActions } from './components/VariableActions';
import { VariableFilters } from './components/VariableFilters';
import { VariableStats } from './components/VariableStats';
import { useVariableData } from './hooks/useVariableData';
import { useVariableFilters } from './hooks/useVariableFilters';
import { useVariableOperations } from './hooks/useVariableOperations';

export function VariableManager() {
  const { t } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);

  const { variables, stats, loading, loadVariables } = useVariableData();

  const {
    handleCreateVariable,
    handleDeleteVariable,
    handleDuplicateVariable,
    handleExportVariables,
    handleImportVariables,
  } = useVariableOperations(loadVariables);

  const {
    searchQuery,
    setSearchQuery,
    filterScope,
    setFilterScope,
    filterFunctions,
    setFilterFunctions,
    selectedTags,
    availableTags,
    filteredVariables,
    clearFilters,
    toggleTag,
    hasActiveFilters,
  } = useVariableFilters(variables);

  const handleCreateOrUpdateVariable = async (variable: Variable) => {
    const success = await handleCreateVariable(variable);
    if (success) {
      setShowCreateForm(false);
      setEditingVariable(null);
    }
  };

  const handleEditVariable = (variable: Variable) => {
    setEditingVariable(variable);
    setShowCreateForm(true);
  };

  const handleDelete = async (variable: Variable) => {
    await handleDeleteVariable(variable);
  };

  const handleDuplicate = (variable: Variable) => {
    const duplicatedVariable = handleDuplicateVariable(variable);
    setEditingVariable(duplicatedVariable);
    setShowCreateForm(true);
  };

  const handleImport = async (file: File) => {
    await handleImportVariables(file);
  };

  const handleExport = () => {
    const allVariables = [
      ...Object.values(variables.global),
      ...Object.values(variables.profiles).flatMap(profileVars =>
        Object.values(profileVars)
      ),
    ];
    handleExportVariables(allVariables);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Icon name="loader" className="animate-spin mr-2" />
        <span>{t('variables_loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabDescription
        title={t('variables_management_title')}
        description={t('variables_management_description')}
        icon="sparkles"
        features={[
          t('variables_management_features_1'),
          t('variables_management_features_2'),
          t('variables_management_features_3'),
          t('variables_management_features_4'),
          t('variables_management_features_5'),
          t('variables_management_features_6'),
        ]}
        useCases={[
          t('variables_management_use_cases_1'),
          t('variables_management_use_cases_2'),
          t('variables_management_use_cases_3'),
          t('variables_management_use_cases_4'),
          t('variables_management_use_cases_5'),
        ]}
      />

      {/* Statistics Cards */}
      <VariableStats stats={stats} />

      {/* Available Functions Section */}
      <AvailableFunctions />

      {/* Header Actions */}
      <VariableActions
        totalCount={stats.totalCount}
        onImport={handleImport}
        onExport={handleExport}
        onCreateVariable={() => {
          setEditingVariable(null);
          setShowCreateForm(true);
        }}
      />

      {/* Filters */}
      <VariableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterScope={filterScope}
        onScopeChange={setFilterScope}
        filterFunctions={filterFunctions}
        onFunctionsChange={setFilterFunctions}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Variable Form */}
      {showCreateForm && (
        <Card className="p-6 mb-6">
          <VariableForm
            variable={editingVariable}
            onSave={handleCreateOrUpdateVariable}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingVariable(null);
            }}
          />
        </Card>
      )}

      {/* Variables List */}
      {filteredVariables.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title={
            hasActiveFilters
              ? t('variables_no_match_filters')
              : t('variables_no_configured')
          }
          description={
            hasActiveFilters
              ? t('variables_no_match_description')
              : t('variables_no_configured_description')
          }
          actionLabel={
            hasActiveFilters
              ? t('variables_clear_filters')
              : t('variables_create_first')
          }
          onAction={() => {
            if (hasActiveFilters) {
              clearFilters();
            } else {
              setEditingVariable(null);
              setShowCreateForm(true);
            }
          }}
        />
      ) : (
        <VariableList
          variables={filteredVariables}
          onEdit={handleEditVariable}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
}

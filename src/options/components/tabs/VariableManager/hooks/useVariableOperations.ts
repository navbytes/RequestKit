import {
  saveGlobalVariable,
  saveGlobalVariables,
  deleteGlobalVariable,
} from '@/lib/core/variable-storage/operations/globalOperations';
import {
  saveProfileVariable,
  saveProfileVariables,
  deleteProfileVariable,
} from '@/lib/core/variable-storage/operations/profileOperations';
import {
  saveRuleVariable,
  deleteRuleVariable,
} from '@/lib/core/variable-storage/operations/ruleOperations';
import type { Variable } from '@/shared/types/variables';

import {
  exportVariables,
  parseImportedVariables,
} from '../utils/variableExport';

/**
 * Custom hook for variable CRUD operations
 */
export function useVariableOperations(onVariablesChange: () => void) {
  const handleCreateVariable = async (variable: Variable): Promise<boolean> => {
    try {
      if (variable.scope === 'global') {
        await saveGlobalVariable(variable);
      } else if (variable.scope === 'profile' && variable.profileId) {
        await saveProfileVariable(variable.profileId, variable);
      } else if (variable.scope === 'rule' && variable.ruleId) {
        await saveRuleVariable(variable.ruleId, variable);
      } else {
        throw new Error('Invalid variable scope or missing association');
      }

      await onVariablesChange();
      return true;
    } catch {
      // Failed to save variable
      alert('Failed to save variable. Please try again.');
      return false;
    }
  };

  const handleDeleteVariable = async (variable: Variable): Promise<boolean> => {
    if (
      !confirm(
        `Are you sure you want to delete the variable "${variable.name}"?`
      )
    ) {
      return false;
    }

    try {
      if (variable.scope === 'global') {
        await deleteGlobalVariable(variable.id);
      } else if (variable.scope === 'profile' && variable.profileId) {
        await deleteProfileVariable(variable.profileId, variable.id);
      } else if (variable.scope === 'rule' && variable.ruleId) {
        await deleteRuleVariable(variable.ruleId, variable.id);
      } else {
        throw new Error('Invalid variable scope or missing association');
      }

      await onVariablesChange();
      return true;
    } catch {
      // Failed to delete variable
      alert('Failed to delete variable. Please try again.');
      return false;
    }
  };

  const handleDuplicateVariable = (variable: Variable): Variable => {
    return {
      ...variable,
      id: `var_${Date.now()}`,
      name: `${variable.name}_copy`,
      metadata: {
        ...variable.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  };

  const handleExportVariables = (variables: Variable[]): void => {
    exportVariables(variables);
  };

  const handleImportVariables = async (file: File): Promise<boolean> => {
    try {
      const importedVariables = await parseImportedVariables(file);

      const globalVars = importedVariables.filter(v => v.scope === 'global');
      const profileVars = importedVariables.filter(v => v.scope === 'profile');
      const ruleVars = importedVariables.filter(v => v.scope === 'rule');

      if (globalVars.length > 0) {
        await saveGlobalVariables(globalVars);
      }

      // Group profile variables by profileId
      const profileVarsByProfile = profileVars.reduce(
        (acc, variable) => {
          if (variable.profileId) {
            if (!acc[variable.profileId]) {
              acc[variable.profileId] = [];
            }
            acc[variable.profileId]?.push(variable);
          }
          return acc;
        },
        {} as Record<string, Variable[]>
      );

      // Save profile variables grouped by profile
      for (const [profileId, variables] of Object.entries(
        profileVarsByProfile
      )) {
        await saveProfileVariables(profileId, variables);
      }

      // Group rule variables by ruleId
      const ruleVarsByRule = ruleVars.reduce(
        (acc, variable) => {
          if (variable.ruleId) {
            if (!acc[variable.ruleId]) {
              acc[variable.ruleId] = [];
            }
            acc[variable.ruleId]?.push(variable);
          }
          return acc;
        },
        {} as Record<string, Variable[]>
      );

      // Save rule variables individually since there's no bulk save method
      for (const [ruleId, variables] of Object.entries(ruleVarsByRule)) {
        for (const variable of variables) {
          await saveRuleVariable(ruleId, variable);
        }
      }

      await onVariablesChange();
      alert(`Successfully imported ${importedVariables.length} variables.`);
      return true;
    } catch {
      // Failed to import variables
      alert('Failed to import variables. Please check the file format.');
      return false;
    }
  };

  return {
    handleCreateVariable,
    handleDeleteVariable,
    handleDuplicateVariable,
    handleExportVariables,
    handleImportVariables,
  };
}

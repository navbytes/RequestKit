import type { Variable } from '@/shared/types/variables';

/**
 * Export variables to JSON file
 */
export const exportVariables = (variables: Variable[]): void => {
  const exportData = {
    version: '1.0',
    exportDate: new Date(),
    variables,
    metadata: {
      totalVariables: variables.length,
      exportedBy: 'RequestKit Variable Manager',
      includeSecrets: false, // Don't export secret values for security
    },
  };

  // Mask secret variables in export
  exportData.variables = exportData.variables.map(variable => ({
    ...variable,
    value: variable.isSecret ? '[REDACTED]' : variable.value,
  }));

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `requestkit-variables-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Parse and validate imported variables file
 */
export const parseImportedVariables = async (
  file: File
): Promise<Variable[]> => {
  const content = await file.text();
  const importData = JSON.parse(content);

  if (!importData.variables || !Array.isArray(importData.variables)) {
    throw new Error('Invalid import file format. Expected variables array.');
  }

  return importData.variables as Variable[];
};

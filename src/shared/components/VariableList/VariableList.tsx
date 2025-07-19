import { useState } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import { Card } from '@/shared/components/ui/Card';
import type { Profile } from '@/shared/types/profiles';
import type { HeaderRule } from '@/shared/types/rules';
import type { Variable } from '@/shared/types/variables';
import { VariableScope } from '@/shared/types/variables';

import { TableHeader } from './TableHeader';
import { VariableDetailsSection } from './VariableDetailsSection';
import { VariableMetadataSection } from './VariableMetadataSection';
import {
  VariableRowMobile,
  VariableRowTablet,
  VariableRowDesktop,
} from './VariableRow';

interface VariableListProps {
  variables: Variable[];
  profiles?: Profile[];
  rules?: HeaderRule[];
  onEdit: (variable: Variable) => void;
  onDelete: (variable: Variable) => void;
  onDuplicate: (variable: Variable) => void;
}

interface SortConfig {
  key: keyof Variable | 'usage';
  direction: 'asc' | 'desc';
}

export function VariableList({
  variables,
  profiles = [],
  rules = [],
  onEdit,
  onDelete,
  onDuplicate,
}: VariableListProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc',
  });
  const [expandedVariables, setExpandedVariables] = useState<Set<string>>(
    new Set()
  );

  const getScopeIcon = (scope: VariableScope) => {
    switch (scope) {
      case VariableScope.GLOBAL:
        return 'globe' as const;
      case VariableScope.PROFILE:
        return 'users' as const;
      case VariableScope.RULE:
        return 'target' as const;
      case VariableScope.SYSTEM:
        return 'settings' as const;
      default:
        return 'sparkles' as const;
    }
  };

  const getScopeColor = (scope: VariableScope): string => {
    switch (scope) {
      case VariableScope.GLOBAL:
        return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case VariableScope.PROFILE:
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case VariableScope.RULE:
        return 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900';
      case VariableScope.SYSTEM:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900';
    }
  };

  const getProfileName = (profileId: string): string => {
    const profile = profiles.find(p => p.id === profileId);
    return profile ? profile.name : `Profile ${profileId}`;
  };

  const getRuleName = (ruleId: string): string => {
    const rule = rules.find(r => r.id === ruleId);
    return rule ? rule.name : `Rule ${ruleId}`;
  };

  const getAssociationDisplay = (variable: Variable): string => {
    if (variable.scope === VariableScope.PROFILE && variable.profileId) {
      return getProfileName(variable.profileId);
    }
    if (variable.scope === VariableScope.RULE && variable.ruleId) {
      return getRuleName(variable.ruleId);
    }
    return '-';
  };

  const handleSort = (key: keyof Variable | 'usage') => {
    setSortConfig(prevConfig => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedVariables = [...variables].sort((a, b) => {
    let aValue: unknown;
    let bValue: unknown;

    if (sortConfig.key === 'usage') {
      aValue = a.metadata?.usageCount || 0;
      bValue = b.metadata?.usageCount || 0;
    } else {
      aValue = a[sortConfig.key];
      bValue = b[sortConfig.key];
    }

    // Type-safe comparison
    if (
      (typeof aValue === 'string' && typeof bValue === 'string') ||
      (typeof aValue === 'number' && typeof bValue === 'number')
    ) {
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const toggleExpanded = (variableId: string) => {
    setExpandedVariables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variableId)) {
        newSet.delete(variableId);
      } else {
        newSet.add(variableId);
      }
      return newSet;
    });
  };

  const formatValue = (variable: Variable): string => {
    if (variable.isSecret) {
      return '••••••••';
    }

    const value = variable.value;
    if (value.length > 100) {
      return `${value.substring(0, 100)}...`;
    }
    return value;
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return 'Unknown';

    try {
      // Handle both Date objects and date strings from storage
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if dateObj is actually a Date object and is valid
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }

      return dateObj.toLocaleDateString();
    } catch {
      // Error formatting date
      return 'Invalid Date';
    }
  };

  const renderSortButton = (key: keyof Variable | 'usage', label: string) => (
    <button
      onClick={() => handleSort(key)}
      className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white"
    >
      <span>{label}</span>
      {sortConfig.key === key && (
        <Icon
          name="chevron-down"
          size={16}
          className={
            sortConfig.direction === 'desc' ? 'transform rotate-180' : ''
          }
        />
      )}
    </button>
  );

  const renderActionButtons = (variable: Variable) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onEdit(variable)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Edit variable"
      >
        <Icon name="edit" size={16} />
      </button>
      <button
        onClick={() => onDuplicate(variable)}
        className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        title="Copy variable"
      >
        <Icon name="copy" size={16} />
      </button>
      <button
        onClick={() => onDelete(variable)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete variable"
      >
        <Icon name="trash" size={16} />
      </button>
    </div>
  );

  const renderScopeTag = (variable: Variable) => (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScopeColor(variable.scope)}`}
    >
      <Icon name={getScopeIcon(variable.scope)} size={12} className="mr-1" />
      {variable.scope}
    </span>
  );

  const renderValueDisplay = (variable: Variable) => (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
      {variable.isSecret && (
        <Icon name="lock" size={12} className="text-gray-400 flex-shrink-0" />
      )}
      <code className="text-sm font-mono overflow-hidden text-ellipsis whitespace-nowrap">
        {formatValue(variable)}
      </code>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Table Headers */}
      <TableHeader renderSortButton={renderSortButton} layout="desktop" />
      <TableHeader renderSortButton={renderSortButton} layout="tablet" />

      {/* Variable Rows */}
      {sortedVariables.map(variable => {
        const isExpanded = expandedVariables.has(variable.id);

        return (
          <Card key={variable.id} className="p-4">
            <VariableRowMobile
              variable={variable}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(variable.id)}
              renderActionButtons={renderActionButtons}
              renderScopeTag={renderScopeTag}
              renderValueDisplay={renderValueDisplay}
            />

            <VariableRowTablet
              variable={variable}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(variable.id)}
              renderActionButtons={renderActionButtons}
              renderScopeTag={renderScopeTag}
            />

            <VariableRowDesktop
              variable={variable}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(variable.id)}
              renderActionButtons={renderActionButtons}
              renderScopeTag={renderScopeTag}
              renderValueDisplay={renderValueDisplay}
            />

            {/* Expanded Details - Responsive */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VariableDetailsSection
                    variable={variable}
                    getAssociationDisplay={getAssociationDisplay}
                  />
                  <VariableMetadataSection
                    variable={variable}
                    formatDate={formatDate}
                  />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

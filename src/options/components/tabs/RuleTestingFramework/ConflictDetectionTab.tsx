import type { RuleConflict } from '@/lib/api';
import { Icon } from '@/shared/components/Icon';

import { getConflictSeverityColor } from './utils';

interface ConflictDetectionTabProps {
  conflicts: RuleConflict[];
}

export function ConflictDetectionTab({
  conflicts,
}: Readonly<ConflictDetectionTabProps>) {
  return (
    <div>
      <ConflictDetectionHeader />

      {conflicts.length === 0 ? (
        <NoConflictsState />
      ) : (
        <ConflictsList conflicts={conflicts} />
      )}
    </div>
  );
}

function ConflictDetectionHeader() {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">Rule Conflicts</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Detected conflicts between rules that may cause unexpected behavior
      </p>
    </div>
  );
}

function NoConflictsState() {
  return (
    <div className="flex flex-col items-center py-12">
      <Icon name="check-circle" size={36} className="text-gray-400 mb-2" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Conflicts Detected
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        All rules are compatible with each other
      </p>
    </div>
  );
}

interface ConflictsListProps {
  readonly conflicts: RuleConflict[];
}

function ConflictsList({ conflicts }: ConflictsListProps) {
  return (
    <div className="space-y-4">
      {conflicts.map((conflict, index) => (
        <ConflictCard key={index} conflict={conflict} />
      ))}
    </div>
  );
}

interface ConflictCardProps {
  readonly conflict: RuleConflict;
}

function ConflictCard({ conflict }: ConflictCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <ConflictCardHeader conflict={conflict} />
      <HeaderConflicts headerConflicts={conflict.headerConflicts} />
      <SuggestedResolutions resolutions={conflict.resolution} />
    </div>
  );
}

interface ConflictCardHeaderProps {
  readonly conflict: RuleConflict;
}

function ConflictCardHeader({ conflict }: ConflictCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium text-gray-900 dark:text-white">
        {conflict.rule1Name} ↔ {conflict.rule2Name}
      </h4>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${getConflictSeverityColor(conflict.severity)}`}
      >
        Severity: {conflict.severity}/3
      </span>
    </div>
  );
}

interface HeaderConflictsProps {
  readonly headerConflicts: Array<{
    headerName: string;
    rule1Operation: string;
    rule1Value: string;
    rule2Operation: string;
    rule2Value: string;
    conflictType: string;
  }>;
}

function HeaderConflicts({ headerConflicts }: HeaderConflictsProps) {
  return (
    <div className="mb-3">
      <h5 className="font-medium mb-2">Header Conflicts:</h5>
      <div className="space-y-2">
        {headerConflicts.map((headerConflict, hIndex) => (
          <HeaderConflictItem key={hIndex} headerConflict={headerConflict} />
        ))}
      </div>
    </div>
  );
}

interface HeaderConflictItemProps {
  readonly headerConflict: {
    headerName: string;
    rule1Operation: string;
    rule1Value: string;
    rule2Operation: string;
    rule2Value: string;
    conflictType: string;
  };
}

function HeaderConflictItem({ headerConflict }: HeaderConflictItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
      <div className="font-mono text-sm">
        <strong>{headerConflict.headerName}</strong>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Rule 1: {headerConflict.rule1Operation} &quot;
        {headerConflict.rule1Value}&quot;
        <br />
        Rule 2: {headerConflict.rule2Operation} &quot;
        {headerConflict.rule2Value}&quot;
        <br />
        Conflict: {headerConflict.conflictType}
      </div>
    </div>
  );
}

interface SuggestedResolutionsProps {
  readonly resolutions: string[];
}

function SuggestedResolutions({ resolutions }: SuggestedResolutionsProps) {
  return (
    <div>
      <h5 className="font-medium mb-2">Suggested Resolutions:</h5>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        {resolutions.map((suggestion, sIndex) => (
          <li key={sIndex}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
}

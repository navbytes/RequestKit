import { ReactNode } from 'preact/compat';
import { useState } from 'preact/hooks';

import type {
  VariableDependency,
  VariableDependencyTree,
} from '../types/resolution';

interface VariableTreeViewProps {
  dependencyTree: VariableDependencyTree;
  onVariableSelect?: (variable: VariableDependency) => void;
}

interface TreeNodeProps {
  variable: VariableDependency;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (variable: VariableDependency) => void;
  children?: ReactNode;
  childVariables: VariableDependency[];
}

function TreeNode({
  variable,
  level,
  isExpanded,
  onToggle,
  onSelect,
  childVariables,
}: TreeNodeProps) {
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'system':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'global':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300';
      case 'profile':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300';
      case 'rule':
        return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatResolutionTime = (time?: number) => {
    if (!time) return 'N/A';
    if (time < 1) return '<1ms';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const hasChildren = childVariables.length > 0;
  const indentLevel = level * 20;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
          variable.resolved ? '' : 'bg-red-50 dark:bg-red-900/20'
        }`}
        style={{ paddingLeft: `${12 + indentLevel}px` }}
        onClick={() => onSelect(variable)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(variable);
          }
        }}
        role="button"
        tabIndex={0}
      >
        {/* Expand/Collapse button */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                onToggle();
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Variable info */}
        <div className="flex-1 flex items-center space-x-3">
          {/* Resolution status */}
          <div
            className={`w-2 h-2 rounded-full ${
              variable.resolved
                ? 'bg-green-500'
                : variable.error
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
            }`}
          />

          {/* Variable name */}
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {variable.name}
          </span>

          {/* Scope badge */}
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${getScopeColor(variable.scope)}`}
          >
            {variable.scope}
          </span>

          {/* Resolution order */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            #{variable.resolutionOrder}
          </span>

          {/* Resolution time */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatResolutionTime(variable.resolutionTime)}
          </span>

          {/* Error indicator */}
          {variable.error && (
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {childVariables.map((child: VariableDependency) => (
            <TreeNodeContainer
              key={child.name}
              variable={child}
              level={level + 1}
              onSelect={onSelect}
              dependencyTree={null} // We'll pass the children directly
              childVariables={child.dependencies.map((depName: string) =>
                // Find the actual variable objects for dependencies
                ({
                  name: depName,
                  value: '',
                  scope: 'unknown',
                  dependencies: [],
                  dependents: [],
                  resolutionOrder: 0,
                  resolved: false,
                })
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeContainerProps {
  variable: VariableDependency;
  level: number;
  onSelect: (variable: VariableDependency) => void;
  dependencyTree: VariableDependencyTree | null;
  childVariables?: VariableDependency[];
}

function TreeNodeContainer({
  variable,
  level,
  onSelect,
  dependencyTree,
  childVariables = [],
}: TreeNodeContainerProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const children =
    childVariables.length > 0
      ? childVariables
      : dependencyTree
        ? (variable.dependencies
            .map(depName => dependencyTree.variables.get(depName))
            .filter(Boolean) as VariableDependency[])
        : [];

  return (
    <TreeNode
      variable={variable}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      onSelect={onSelect}
      childVariables={children}
    />
  );
}

export function VariableTreeView({
  dependencyTree,
  onVariableSelect,
}: VariableTreeViewProps) {
  const [selectedVariable, setSelectedVariable] =
    useState<VariableDependency | null>(null);
  const [showCircularDeps, setShowCircularDeps] = useState(false);

  const handleVariableSelect = (variable: VariableDependency) => {
    setSelectedVariable(variable);
    onVariableSelect?.(variable);
  };

  const hasCircularDependencies =
    dependencyTree.circularDependencies.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Variable Dependencies
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {dependencyTree.variables.size} variables
            </span>
            {hasCircularDependencies && (
              <button
                onClick={() => setShowCircularDeps(!showCircularDeps)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                {dependencyTree.circularDependencies.length} circular deps
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Resolved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Failed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Circular Dependencies Warning */}
      {hasCircularDependencies && showCircularDeps && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                Circular Dependencies Detected
              </h4>
              <div className="mt-1 space-y-1">
                {dependencyTree.circularDependencies.map((cycle, index) => (
                  <div
                    key={index}
                    className="text-xs text-red-700 dark:text-red-400 font-mono"
                  >
                    {cycle.join(' → ')} → {cycle[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {dependencyTree.roots.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No variable dependencies found
          </div>
        ) : (
          <div className="py-2">
            {dependencyTree.roots.map(rootVariable => (
              <TreeNodeContainer
                key={rootVariable.name}
                variable={rootVariable}
                level={0}
                onSelect={handleVariableSelect}
                dependencyTree={dependencyTree}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Variable Details */}
      {selectedVariable && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Variable Details
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-mono">{selectedVariable.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Scope:</span>
              <span className="font-mono">{selectedVariable.scope}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Resolution Order:
              </span>
              <span className="font-mono">
                #{selectedVariable.resolutionOrder}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`font-mono ${
                  selectedVariable.resolved
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {selectedVariable.resolved ? 'Resolved' : 'Failed'}
              </span>
            </div>
            {selectedVariable.resolutionTime && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Resolution Time:
                </span>
                <span className="font-mono">
                  {selectedVariable.resolutionTime < 1
                    ? '<1ms'
                    : `${selectedVariable.resolutionTime}ms`}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600 dark:text-gray-400">Value:</span>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
                {selectedVariable.value}
              </div>
            </div>
            {selectedVariable.error && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Error:</span>
                <div className="mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-400">
                  {selectedVariable.error}
                </div>
              </div>
            )}
            {selectedVariable.dependencies.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Dependencies:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedVariable.dependencies.map(dep => (
                    <span
                      key={dep}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded font-mono"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedVariable.dependents.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Used By:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedVariable.dependents.map(dep => (
                    <span
                      key={dep}
                      className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded font-mono"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

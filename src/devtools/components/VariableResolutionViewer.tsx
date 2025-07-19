import { useState, useEffect } from 'preact/hooks';

import type {
  VariableResolutionTrace,
  VariableDependency,
  VariableDependencyTree,
} from '../types/resolution';

import { ResolutionStepCard } from './ResolutionStepCard';
import { VariableTreeView } from './VariableTreeView';

interface VariableResolutionViewerProps {
  trace: VariableResolutionTrace | null;
  onClose?: () => void;
}

export function VariableResolutionViewer({
  trace,
  onClose,
}: VariableResolutionViewerProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'tree' | 'metrics'>(
    'steps'
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [dependencyTree, setDependencyTree] =
    useState<VariableDependencyTree | null>(null);

  // Build dependency tree from trace
  useEffect(() => {
    if (!trace) {
      setDependencyTree(null);
      return;
    }

    const variables = new Map<string, VariableDependency>();
    const dependencies = new Map<string, Set<string>>();
    const dependents = new Map<string, Set<string>>();

    // Process steps to build dependency information
    trace.steps.forEach((step, index) => {
      if (step.type === 'variable' || step.type === 'function') {
        const variable: VariableDependency = {
          name: step.name,
          value: step.output,
          scope: step.scope || 'unknown',
          dependencies: [],
          dependents: [],
          resolutionOrder: index + 1,
          resolved: !step.error,
          resolutionTime: step.executionTime,
          ...(step.error && { error: step.error }),
        };

        variables.set(step.name, variable);

        // Extract dependencies from input
        const inputDeps = extractVariableReferences(step.input);
        dependencies.set(step.name, new Set(inputDeps));

        // Build reverse dependencies
        inputDeps.forEach(dep => {
          if (!dependents.has(dep)) {
            dependents.set(dep, new Set());
          }
          const depSet = dependents.get(dep);
          if (depSet) {
            depSet.add(step.name);
          }
        });
      }
    });

    // Convert sets to arrays and update variables
    variables.forEach((variable, name) => {
      variable.dependencies = Array.from(dependencies.get(name) || []);
      variable.dependents = Array.from(dependents.get(name) || []);
    });

    // Find root variables (no dependencies)
    const roots = Array.from(variables.values()).filter(
      v => v.dependencies.length === 0
    );

    // Detect circular dependencies
    const circularDependencies = detectCircularDependencies(dependencies);

    setDependencyTree({
      roots,
      variables,
      circularDependencies,
    });
  }, [trace]);

  const extractVariableReferences = (input: string): string[] => {
    const variablePattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const matches: string[] = [];
    let match;
    while ((match = variablePattern.exec(input)) !== null) {
      if (match[1]) matches.push(match[1]);
    }
    return matches;
  };

  const detectCircularDependencies = (
    dependencies: Map<string, Set<string>>
  ): string[][] => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const deps = dependencies.get(node) || new Set();
      deps.forEach(dep => {
        dfs(dep, [...path]);
      });

      recursionStack.delete(node);
      path.pop();
    };

    dependencies.forEach((_, node) => {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    });

    return cycles;
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const expandAllSteps = () => {
    if (!trace) return;
    setExpandedSteps(new Set(trace.steps.map(step => step.id)));
  };

  const collapseAllSteps = () => {
    setExpandedSteps(new Set());
  };

  const formatDuration = (ms: number) => {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSuccessRate = () => {
    if (!trace) return 0;
    const totalVariables =
      trace.resolvedVariables.length + trace.unresolvedVariables.length;
    if (totalVariables === 0) return 100;
    return Math.round((trace.resolvedVariables.length / totalVariables) * 100);
  };

  if (!trace) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No variable resolution trace available</p>
          <p className="text-sm mt-1">
            Select a request with variable resolution to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Variable Resolution Trace
            </h2>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>ID: {trace.id}</span>
              <span>Duration: {formatDuration(trace.totalTime)}</span>
              <span
                className={`font-medium ${trace.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {trace.success ? 'Success' : 'Failed'}
              </span>
              <span>Success Rate: {getSuccessRate()}%</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Template */}
        <div className="mt-3">
          <label
            htmlFor="original-template"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Original Template
          </label>
          <div
            id="original-template"
            className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-sm break-all"
          >
            <span className="text-blue-600 dark:text-blue-400">
              {trace.originalTemplate}
            </span>
          </div>
        </div>

        <div className="mt-2">
          <label
            htmlFor="final-value"
            className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
          >
            Final Value
          </label>
          <div
            id="final-value"
            className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-sm break-all"
          >
            <span
              className={
                trace.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }
            >
              {trace.finalValue}
            </span>
          </div>
        </div>

        {/* Errors */}
        {trace.errors.length > 0 && (
          <div className="mt-3">
            <label
              htmlFor="resolution-errors"
              className="block text-xs font-medium text-red-500 dark:text-red-400 mb-1"
            >
              Errors
            </label>
            <div id="resolution-errors" className="space-y-1">
              {trace.errors.map((error, index) => (
                <div
                  key={index}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-700 dark:text-red-400"
                >
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'steps'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Resolution Steps ({trace.steps.length})
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tree'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Dependency Tree
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Performance Metrics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'steps' && (
          <div className="h-full flex flex-col">
            {/* Steps Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={expandAllSteps}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={collapseAllSteps}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Collapse All
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {trace.steps.length} steps
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {trace.steps.map(step => (
                <ResolutionStepCard
                  key={step.id}
                  step={step}
                  isExpanded={expandedSteps.has(step.id)}
                  onToggle={() => toggleStepExpansion(step.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tree' && dependencyTree && (
          <VariableTreeView dependencyTree={dependencyTree} />
        )}

        {activeTab === 'metrics' && (
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Performance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Time:
                    </span>
                    <span className="font-mono">
                      {formatDuration(trace.totalTime)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Variables:
                    </span>
                    <span className="font-mono">
                      {trace.metrics.variableCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Functions:
                    </span>
                    <span className="font-mono">
                      {trace.metrics.functionCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max Depth:
                    </span>
                    <span className="font-mono">{trace.metrics.maxDepth}</span>
                  </div>
                </div>
              </div>

              {/* Cache Metrics */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Cache Performance
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cache Hits:
                    </span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {trace.metrics.cacheHits}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cache Misses:
                    </span>
                    <span className="font-mono text-red-600 dark:text-red-400">
                      {trace.metrics.cacheMisses}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Hit Rate:
                    </span>
                    <span className="font-mono">
                      {trace.metrics.cacheHits + trace.metrics.cacheMisses > 0
                        ? Math.round(
                            (trace.metrics.cacheHits /
                              (trace.metrics.cacheHits +
                                trace.metrics.cacheMisses)) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolution Results */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Resolution Results
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Resolved:
                    </span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {trace.resolvedVariables.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Unresolved:
                    </span>
                    <span className="font-mono text-red-600 dark:text-red-400">
                      {trace.unresolvedVariables.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Success Rate:
                    </span>
                    <span className="font-mono">{getSuccessRate()}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Lists */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resolved Variables */}
              {trace.resolvedVariables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Resolved Variables
                  </h3>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {trace.resolvedVariables.map(variable => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm rounded font-mono"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Unresolved Variables */}
              {trace.unresolvedVariables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Unresolved Variables
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {trace.unresolvedVariables.map(variable => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-sm rounded font-mono"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Context Information */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Resolution Context
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {trace.context.profileId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Profile ID:
                      </span>
                      <span className="font-mono">
                        {trace.context.profileId}
                      </span>
                    </div>
                  )}
                  {trace.context.ruleId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Rule ID:
                      </span>
                      <span className="font-mono">{trace.context.ruleId}</span>
                    </div>
                  )}
                  {trace.context.requestUrl && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Request URL:
                      </span>
                      <span className="font-mono text-xs break-all">
                        {trace.context.requestUrl}
                      </span>
                    </div>
                  )}
                  {trace.context.requestMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Method:
                      </span>
                      <span className="font-mono">
                        {trace.context.requestMethod}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Start Time:
                    </span>
                    <span className="font-mono">
                      {new Date(trace.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      End Time:
                    </span>
                    <span className="font-mono">
                      {new Date(trace.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'preact/hooks';

import type { ResolutionStep } from '../types/resolution';

interface ResolutionStepCardProps {
  step: ResolutionStep;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ResolutionStepCard({
  step,
  isExpanded = false,
  onToggle,
}: ResolutionStepCardProps) {
  const [showDetails, setShowDetails] = useState(isExpanded);

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'variable':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'function':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'nested':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cache_hit':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'cache_miss':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getScopeColor = (scope?: string) => {
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

  const formatExecutionTime = (time: number) => {
    if (time < 1) return '<1ms';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const handleToggle = () => {
    setShowDetails(!showDetails);
    onToggle?.();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={handleToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
              #{step.stepNumber}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStepTypeColor(step.type)}`}
            >
              {step.type}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {step.name}
            </span>
            {step.scope && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${getScopeColor(step.scope)}`}
              >
                {step.scope}
              </span>
            )}
            {step.cacheHit !== undefined && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  step.cacheHit
                    ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                }`}
              >
                {step.cacheHit ? 'Cache Hit' : 'Cache Miss'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatExecutionTime(step.executionTime)}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Error indicator */}
        {step.error && (
          <div className="mt-2 flex items-center space-x-2">
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
            <span className="text-sm text-red-600 dark:text-red-400">
              {step.error}
            </span>
          </div>
        )}
      </div>

      {/* Expandable content */}
      {showDetails && (
        <div className="p-4 space-y-4">
          {/* Input/Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Input
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-sm break-all">
                <span className="text-blue-600 dark:text-blue-400">
                  {step.input}
                </span>
              </div>
            </div>
            <div>
              <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Output
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 font-mono text-sm break-all">
                <span
                  className={
                    step.error
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }
                >
                  {step.output}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {step.metadata && (
            <div>
              <div className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Metadata
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2">
                {step.metadata.depth !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Depth:
                    </span>
                    <span className="font-mono">{step.metadata.depth}</span>
                  </div>
                )}
                {step.metadata.recursive && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Recursive:
                    </span>
                    <span className="text-orange-600 dark:text-orange-400">
                      Yes
                    </span>
                  </div>
                )}
                {step.metadata.functionArgs &&
                  step.metadata.functionArgs.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Function Arguments:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {step.metadata.functionArgs.map((arg, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs rounded font-mono"
                          >
                            {arg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                {step.metadata.variable && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Variable Details:
                    </span>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Scope:</span>
                        <span className="font-mono">
                          {step.metadata.variable.scope}
                        </span>
                      </div>
                      {step.metadata.variable.description && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {step.metadata.variable.description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timing */}
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>
              Executed at: {new Date(step.timestamp).toLocaleTimeString()}
            </span>
            <span>Duration: {formatExecutionTime(step.executionTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

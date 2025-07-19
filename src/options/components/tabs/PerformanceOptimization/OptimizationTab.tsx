import type { RuleOptimizationResult } from '@/lib/integrations';
import { Icon } from '@/shared/components/Icon';
import type { HeaderRule } from '@/shared/types/rules';

import { getSeverityColor } from './utils';

interface OptimizationTabProps {
  rules: HeaderRule[];
  optimizationResult: RuleOptimizationResult | null;
  loading: boolean;
  onOptimizeRules: () => void;
  onApplyOptimizations: () => void;
  onCancelOptimization: () => void;
}

export function OptimizationTab({
  rules,
  optimizationResult,
  loading,
  onOptimizeRules,
  onApplyOptimizations,
  onCancelOptimization,
}: Readonly<OptimizationTabProps>) {
  return (
    <div className="space-y-6">
      <OptimizationAnalysis
        rules={rules}
        loading={loading}
        onOptimizeRules={onOptimizeRules}
      />

      {optimizationResult && (
        <OptimizationResults
          result={optimizationResult}
          onApplyOptimizations={onApplyOptimizations}
          onCancelOptimization={onCancelOptimization}
        />
      )}
    </div>
  );
}

interface OptimizationAnalysisProps {
  readonly rules: HeaderRule[];
  readonly loading: boolean;
  readonly onOptimizeRules: () => void;
}

function OptimizationAnalysis({
  rules,
  loading,
  onOptimizeRules,
}: OptimizationAnalysisProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Rule Optimization Analysis</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Analyze your rules for performance improvements and apply optimizations
        automatically.
      </p>

      <button
        onClick={onOptimizeRules}
        disabled={loading || rules.length === 0}
        className="btn btn-primary"
      >
        {loading ? (
          <>
            <Icon name="loader" className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Icon name="search" className="w-4 h-4 mr-2" />
            Analyze Rules
          </>
        )}
      </button>
    </div>
  );
}

interface OptimizationResultsProps {
  readonly result: RuleOptimizationResult;
  readonly onApplyOptimizations: () => void;
  readonly onCancelOptimization: () => void;
}

function OptimizationResults({
  result,
  onApplyOptimizations,
  onCancelOptimization,
}: OptimizationResultsProps) {
  return (
    <div className="space-y-4">
      {/* Optimization Summary */}
      <OptimizationSummary result={result} />

      {/* Optimization Suggestions */}
      {result.suggestions.length > 0 && (
        <OptimizationSuggestions suggestions={result.suggestions} />
      )}

      {/* Apply Optimizations */}
      <ApplyOptimizations
        onApplyOptimizations={onApplyOptimizations}
        onCancelOptimization={onCancelOptimization}
      />
    </div>
  );
}

interface OptimizationSummaryProps {
  readonly result: RuleOptimizationResult;
}

function OptimizationSummary({ result }: OptimizationSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h4 className="font-semibold mb-3">Optimization Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.suggestions.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Suggestions
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {result.estimatedPerformanceGain.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Est. Performance Gain
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {result.optimizedRuleCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Optimized Rules
          </div>
        </div>
      </div>
    </div>
  );
}

interface OptimizationSuggestionsProps {
  readonly suggestions: Array<{
    ruleId: string;
    ruleName: string;
    type: string;
    severity: string;
    message: string;
    suggestion: string;
  }>;
}

function OptimizationSuggestions({
  suggestions,
}: OptimizationSuggestionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h4 className="font-semibold mb-3">Optimization Suggestions</h4>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-3 rounded border-l-4 ${getSeverityColor(suggestion.severity)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium">{suggestion.ruleName}</h5>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(suggestion.severity)}`}
              >
                {suggestion.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm mb-2">{suggestion.message}</p>
            <div className="flex items-start space-x-2">
              <Icon
                name="lightbulb"
                className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5"
              />
              <p className="text-sm font-medium">{suggestion.suggestion}</p>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Type: {suggestion.type} | Rule ID: {suggestion.ruleId}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ApplyOptimizationsProps {
  readonly onApplyOptimizations: () => void;
  readonly onCancelOptimization: () => void;
}

function ApplyOptimizations({
  onApplyOptimizations,
  onCancelOptimization,
}: ApplyOptimizationsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h4 className="font-semibold mb-3">Apply Optimizations</h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Apply the suggested optimizations to your rules. This will update
        existing rules with performance improvements.
      </p>
      <div className="flex space-x-2">
        <button onClick={onApplyOptimizations} className="btn btn-primary">
          <Icon name="check-simple" className="w-4 h-4 mr-2" />
          Apply Optimizations
        </button>
        <button onClick={onCancelOptimization} className="btn btn-secondary">
          <Icon name="close" className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
}

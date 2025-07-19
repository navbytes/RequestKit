import type { AutomatedTestResult } from '@/lib/api';
import type { HeaderRule } from '@/shared/types/rules';

interface AutomatedTestsTabProps {
  rules: HeaderRule[];
  selectedRule: HeaderRule | null;
  automatedTestResult: AutomatedTestResult | null;
  loading: boolean;
  onRuleSelection: (ruleId: string) => void;
  onRunAutomatedTests: () => void;
  onTestResultClear: () => void;
}

export function AutomatedTestsTab({
  rules,
  selectedRule,
  automatedTestResult,
  loading,
  onRuleSelection,
  onRunAutomatedTests,
  onTestResultClear,
}: AutomatedTestsTabProps) {
  return (
    <div className="space-y-6">
      <AutomatedTestsHeader />

      <RuleSelectionAndActions
        rules={rules}
        selectedRule={selectedRule}
        loading={loading}
        onRuleSelection={onRuleSelection}
        onRunAutomatedTests={onRunAutomatedTests}
        onTestResultClear={onTestResultClear}
      />

      {automatedTestResult && (
        <AutomatedTestResults automatedTestResult={automatedTestResult} />
      )}
    </div>
  );
}

function AutomatedTestsHeader() {
  return (
    <div>
      <h3 className="text-lg font-semibold">Automated Testing</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Run comprehensive automated tests for selected rules
      </p>
    </div>
  );
}

interface RuleSelectionAndActionsProps {
  rules: HeaderRule[];
  selectedRule: HeaderRule | null;
  loading: boolean;
  onRuleSelection: (ruleId: string) => void;
  onRunAutomatedTests: () => void;
  onTestResultClear: () => void;
}

function RuleSelectionAndActions({
  rules,
  selectedRule,
  loading,
  onRuleSelection,
  onRunAutomatedTests,
  onTestResultClear,
}: RuleSelectionAndActionsProps) {
  return (
    <div>
      <label htmlFor="automated-test-rule-select" className="form-label">
        Select Rule for Automated Testing
      </label>
      <div className="flex space-x-2">
        <select
          id="automated-test-rule-select"
          className="input flex-1"
          value={selectedRule?.id || ''}
          onChange={e => {
            onRuleSelection(e.currentTarget.value);
            onTestResultClear();
          }}
        >
          <option value="">Choose a rule...</option>
          {rules.map(rule => (
            <option key={rule.id} value={rule.id}>
              {rule.name} {rule.enabled ? '✅' : '❌'}
            </option>
          ))}
        </select>
        <button
          onClick={onRunAutomatedTests}
          disabled={!selectedRule || loading}
          className="btn btn-primary"
        >
          {loading ? 'Running...' : 'Run Tests'}
        </button>
      </div>
    </div>
  );
}

interface AutomatedTestResultsProps {
  automatedTestResult: AutomatedTestResult;
}

function AutomatedTestResults({
  automatedTestResult,
}: AutomatedTestResultsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <TestResultsHeader automatedTestResult={automatedTestResult} />
      <TestResultsMetrics automatedTestResult={automatedTestResult} />
      <TestResultsDetails automatedTestResult={automatedTestResult} />
    </div>
  );
}

interface TestResultsHeaderProps {
  automatedTestResult: AutomatedTestResult;
}

function TestResultsHeader({ automatedTestResult }: TestResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium">
        Test Results for &quot;{automatedTestResult.ruleName}&quot;
      </h4>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          automatedTestResult.overallPassed
            ? 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300'
        }`}
      >
        {automatedTestResult.overallPassed ? 'PASSED' : 'FAILED'}
      </span>
    </div>
  );
}

interface TestResultsMetricsProps {
  automatedTestResult: AutomatedTestResult;
}

function TestResultsMetrics({ automatedTestResult }: TestResultsMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <MetricCard
        title="Total Tests"
        value={automatedTestResult.totalTests}
        color="text-gray-900 dark:text-white"
      />
      <MetricCard
        title="Passed"
        value={automatedTestResult.passedTests}
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        title="Failed"
        value={automatedTestResult.failedTests}
        color="text-red-600 dark:text-red-400"
      />
      <MetricCard
        title="Success Rate"
        value={`${automatedTestResult.successRate.toFixed(1)}%`}
        color="text-blue-600 dark:text-blue-400"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  color: string;
}

function MetricCard({ title, value, color }: MetricCardProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </div>
  );
}

interface TestResultsDetailsProps {
  automatedTestResult: AutomatedTestResult;
}

function TestResultsDetails({ automatedTestResult }: TestResultsDetailsProps) {
  return (
    <div className="space-y-3">
      {automatedTestResult.results.map((result, index) => (
        <TestResultItem key={index} result={result} />
      ))}
    </div>
  );
}

interface TestResultItemProps {
  result: {
    scenario: string;
    passed: boolean;
    expectedResult: {
      shouldMatch: boolean;
      expectedHeaders: number;
    };
    actualResult: {
      matched: boolean;
      headersApplied: number;
      executionTime: number;
    };
    errors: string[];
  };
}

function TestResultItem({ result }: TestResultItemProps) {
  return (
    <div
      className={`p-3 rounded border-l-4 ${
        result.passed
          ? 'border-green-400 bg-green-50 dark:bg-green-900'
          : 'border-red-400 bg-red-50 dark:bg-red-900'
      }`}
    >
      <TestResultItemHeader result={result} />
      <TestResultItemDetails result={result} />
      {result.errors.length > 0 && (
        <TestResultItemErrors errors={result.errors} />
      )}
    </div>
  );
}

interface TestResultItemHeaderProps {
  result: {
    scenario: string;
    passed: boolean;
  };
}

function TestResultItemHeader({ result }: TestResultItemHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h5 className="font-medium">{result.scenario}</h5>
      <span
        className={`text-sm font-medium ${
          result.passed
            ? 'text-green-600 dark:text-green-300'
            : 'text-red-600 dark:text-red-300'
        }`}
      >
        {result.passed ? '✅ PASS' : '❌ FAIL'}
      </span>
    </div>
  );
}

interface TestResultItemDetailsProps {
  result: {
    expectedResult: {
      shouldMatch: boolean;
      expectedHeaders: number;
    };
    actualResult: {
      matched: boolean;
      headersApplied: number;
      executionTime: number;
    };
  };
}

function TestResultItemDetails({ result }: TestResultItemDetailsProps) {
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Expected: {result.expectedResult.shouldMatch ? 'Match' : 'No Match'}(
      {result.expectedResult.expectedHeaders} headers) | Actual:{' '}
      {result.actualResult.matched ? 'Match' : 'No Match'}(
      {result.actualResult.headersApplied} headers) | Time:{' '}
      {result.actualResult.executionTime.toFixed(2)}ms
    </div>
  );
}

interface TestResultItemErrorsProps {
  errors: string[];
}

function TestResultItemErrors({ errors }: TestResultItemErrorsProps) {
  return (
    <div className="mt-2">
      <div className="text-sm font-medium text-red-600 dark:text-red-400">
        Errors:
      </div>
      <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
        {errors.map((error, eIndex) => (
          <li key={eIndex}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

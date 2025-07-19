import type { TestContext } from '@/lib/api';
import { Icon } from '@/shared/components/Icon';
import type { HeaderRule, RuleTestResult } from '@/shared/types/rules';

interface SingleRuleTestTabProps {
  rules: HeaderRule[];
  selectedRule: HeaderRule | null;
  testContext: TestContext;
  testResult: RuleTestResult | null;
  loading: boolean;
  onRuleSelection: (ruleId: string) => void;
  onTestContextChange: (context: TestContext) => void;
  onTestSingleRule: () => void;
  onTestAllRules: () => void;
  onTestResultClear: () => void;
  onAddTestHeader: () => void;
  onRemoveTestHeader: (headerName: string) => void;
  onAddTestCookie: () => void;
  onRemoveTestCookie: (cookieName: string) => void;
}

export function SingleRuleTestTab({
  rules,
  selectedRule,
  testContext,
  testResult,
  loading,
  onRuleSelection,
  onTestContextChange,
  onTestSingleRule,
  onTestAllRules,
  onTestResultClear,
  onAddTestHeader,
  onRemoveTestHeader,
  onAddTestCookie,
  onRemoveTestCookie,
}: Readonly<SingleRuleTestTabProps>) {
  return (
    <div className="space-y-6">
      <RuleSelection
        rules={rules}
        selectedRule={selectedRule}
        onRuleSelection={onRuleSelection}
        onTestResultClear={onTestResultClear}
      />

      <TestContextConfiguration
        testContext={testContext}
        loading={loading}
        onTestContextChange={onTestContextChange}
        onTestSingleRule={onTestSingleRule}
        onTestAllRules={onTestAllRules}
        onAddTestHeader={onAddTestHeader}
        onRemoveTestHeader={onRemoveTestHeader}
        onAddTestCookie={onAddTestCookie}
        onRemoveTestCookie={onRemoveTestCookie}
        selectedRule={selectedRule}
        rules={rules}
      />

      {testResult && <TestResults testResult={testResult} />}
    </div>
  );
}

interface RuleSelectionProps {
  readonly rules: HeaderRule[];
  readonly selectedRule: HeaderRule | null;
  readonly onRuleSelection: (ruleId: string) => void;
  readonly onTestResultClear: () => void;
}

function RuleSelection({
  rules,
  selectedRule,
  onRuleSelection,
  onTestResultClear,
}: RuleSelectionProps) {
  return (
    <div>
      <label htmlFor="single-test-rule-select" className="form-label">
        Select Rule to Test
      </label>
      <select
        id="single-test-rule-select"
        className="input"
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
    </div>
  );
}

interface TestContextConfigurationProps {
  readonly testContext: TestContext;
  readonly loading: boolean;
  readonly selectedRule: HeaderRule | null;
  readonly rules: HeaderRule[];
  readonly onTestContextChange: (context: TestContext) => void;
  readonly onTestSingleRule: () => void;
  readonly onTestAllRules: () => void;
  readonly onAddTestHeader: () => void;
  readonly onRemoveTestHeader: (headerName: string) => void;
  readonly onAddTestCookie: () => void;
  readonly onRemoveTestCookie: (cookieName: string) => void;
}

function TestContextConfiguration({
  testContext,
  loading,
  selectedRule,
  rules,
  onTestContextChange,
  onTestSingleRule,
  onTestAllRules,
  onAddTestHeader,
  onRemoveTestHeader,
  onAddTestCookie,
  onRemoveTestCookie,
}: TestContextConfigurationProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Test Context</h3>

      <BasicTestSettings
        testContext={testContext}
        onTestContextChange={onTestContextChange}
      />

      <RequestHeaders
        testContext={testContext}
        onAddTestHeader={onAddTestHeader}
        onRemoveTestHeader={onRemoveTestHeader}
      />

      <Cookies
        testContext={testContext}
        onAddTestCookie={onAddTestCookie}
        onRemoveTestCookie={onRemoveTestCookie}
      />

      <TestActions
        selectedRule={selectedRule}
        rules={rules}
        loading={loading}
        onTestSingleRule={onTestSingleRule}
        onTestAllRules={onTestAllRules}
      />
    </div>
  );
}

interface BasicTestSettingsProps {
  readonly testContext: TestContext;
  readonly onTestContextChange: (context: TestContext) => void;
}

function BasicTestSettings({
  testContext,
  onTestContextChange,
}: BasicTestSettingsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="test-url" className="form-label">
            Test URL
          </label>
          <input
            id="test-url"
            type="text"
            className="input"
            value={testContext.url}
            onInput={e =>
              onTestContextChange({
                ...testContext,
                url: e.currentTarget.value,
              })
            }
            placeholder="https://api.example.com/users"
          />
        </div>
        <div>
          <label htmlFor="test-method" className="form-label">
            Request Method
          </label>
          <select
            id="test-method"
            className="input"
            value={testContext.requestMethod || 'GET'}
            onChange={e =>
              onTestContextChange({
                ...testContext,
                requestMethod: e.currentTarget.value,
              })
            }
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="test-user-agent" className="form-label">
            User Agent
          </label>
          <input
            id="test-user-agent"
            type="text"
            className="input"
            value={testContext.userAgent || ''}
            onInput={e =>
              onTestContextChange({
                ...testContext,
                userAgent: e.currentTarget.value,
              })
            }
            placeholder="Mozilla/5.0..."
          />
        </div>
        <div>
          <label htmlFor="test-response-status" className="form-label">
            Response Status
          </label>
          <input
            id="test-response-status"
            type="number"
            className="input"
            value={testContext.responseStatus || ''}
            onInput={e => {
              const value = e.currentTarget.value;
              const newContext: TestContext = { ...testContext };
              if (value) {
                newContext.responseStatus = parseInt(value);
              } else {
                delete newContext.responseStatus;
              }
              onTestContextChange(newContext);
            }}
            placeholder="200"
          />
        </div>
      </div>
    </>
  );
}

interface RequestHeadersProps {
  readonly testContext: TestContext;
  readonly onAddTestHeader: () => void;
  readonly onRemoveTestHeader: (headerName: string) => void;
}

function RequestHeaders({
  testContext,
  onAddTestHeader,
  onRemoveTestHeader,
}: RequestHeadersProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="test-request-headers" className="form-label">
          Request Headers
        </label>
        <button
          onClick={onAddTestHeader}
          className="btn btn-sm btn-secondary flex items-center space-x-1"
        >
          <Icon name="plus" size={14} />
          <span>Add Header</span>
        </button>
      </div>
      <div id="test-request-headers" className="space-y-2">
        {Object.entries(testContext.requestHeaders || {}).map(
          ([name, value]) => (
            <HeaderRow
              key={name}
              name={name}
              value={value}
              onRemove={() => onRemoveTestHeader(name)}
            />
          )
        )}
      </div>
    </div>
  );
}

interface HeaderRowProps {
  readonly name: string;
  readonly value: string;
  readonly onRemove: () => void;
}

function HeaderRow({ name, value, onRemove }: HeaderRowProps) {
  return (
    <div className="flex items-center space-x-2">
      <input type="text" className="input flex-1" value={name} readOnly />
      <input type="text" className="input flex-1" value={value} readOnly />
      <button
        onClick={onRemove}
        className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
      >
        Remove
      </button>
    </div>
  );
}

interface CookiesProps {
  readonly testContext: TestContext;
  readonly onAddTestCookie: () => void;
  readonly onRemoveTestCookie: (cookieName: string) => void;
}

function Cookies({
  testContext,
  onAddTestCookie,
  onRemoveTestCookie,
}: CookiesProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="test-cookies" className="form-label">
          Cookies
        </label>
        <button onClick={onAddTestCookie} className="btn btn-sm btn-secondary">
          + Add Cookie
        </button>
      </div>
      <div id="test-cookies" className="space-y-2">
        {Object.entries(testContext.cookies || {}).map(([name, value]) => (
          <CookieRow
            key={name}
            name={name}
            value={value}
            onRemove={() => onRemoveTestCookie(name)}
          />
        ))}
      </div>
    </div>
  );
}

interface CookieRowProps {
  readonly name: string;
  readonly value: string;
  readonly onRemove: () => void;
}

function CookieRow({ name, value, onRemove }: CookieRowProps) {
  return (
    <div className="flex items-center space-x-2">
      <input type="text" className="input flex-1" value={name} readOnly />
      <input type="text" className="input flex-1" value={value} readOnly />
      <button
        onClick={onRemove}
        className="btn btn-sm bg-error-600 text-white hover:bg-error-700"
      >
        Remove
      </button>
    </div>
  );
}

interface TestActionsProps {
  readonly selectedRule: HeaderRule | null;
  readonly rules: HeaderRule[];
  readonly loading: boolean;
  readonly onTestSingleRule: () => void;
  readonly onTestAllRules: () => void;
}

function TestActions({
  selectedRule,
  rules,
  loading,
  onTestSingleRule,
  onTestAllRules,
}: TestActionsProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onTestSingleRule}
        disabled={!selectedRule || loading}
        className="btn btn-primary"
      >
        {loading ? 'Testing...' : 'Test Rule'}
      </button>
      <button
        onClick={onTestAllRules}
        disabled={rules.length === 0 || loading}
        className="btn btn-secondary"
      >
        Test All Rules
      </button>
    </div>
  );
}

interface TestResultsProps {
  readonly testResult: RuleTestResult;
}

function TestResults({ testResult }: TestResultsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Test Results</h3>

      <TestResultsSummary testResult={testResult} />

      {testResult.appliedHeaders.length > 0 && (
        <AppliedHeaders headers={testResult.appliedHeaders} />
      )}

      {testResult.errors.length > 0 && (
        <TestErrors errors={testResult.errors} />
      )}

      {testResult.warnings.length > 0 && (
        <TestWarnings warnings={testResult.warnings} />
      )}
    </div>
  );
}

interface TestResultsSummaryProps {
  readonly testResult: RuleTestResult;
}

function TestResultsSummary({ testResult }: TestResultsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div
        className={`p-3 rounded ${testResult.matches ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}`}
      >
        <div className="text-sm font-medium">Match Result</div>
        <div
          className={`text-lg font-bold ${testResult.matches ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}
        >
          {testResult.matches ? '✅ Matched' : '❌ No Match'}
        </div>
      </div>
      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900">
        <div className="text-sm font-medium">Headers Applied</div>
        <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
          {testResult.appliedHeaders.length}
        </div>
      </div>
      <div className="p-3 rounded bg-purple-50 dark:bg-purple-900">
        <div className="text-sm font-medium">Execution Time</div>
        <div className="text-lg font-bold text-purple-600 dark:text-purple-300">
          {testResult.executionTime.toFixed(2)}ms
        </div>
      </div>
    </div>
  );
}

interface AppliedHeadersProps {
  readonly headers: Array<{ name: string; value: string; operation: string }>;
}

function AppliedHeaders({ headers }: AppliedHeadersProps) {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Applied Headers:</h4>
      <div className="space-y-1">
        {headers.map((header, index) => (
          <div
            key={index}
            className="font-mono text-sm bg-gray-100 dark:bg-gray-600 p-2 rounded"
          >
            {header.name}: {header.value} ({header.operation})
          </div>
        ))}
      </div>
    </div>
  );
}

interface TestErrorsProps {
  readonly errors: string[];
}

function TestErrors({ errors }: TestErrorsProps) {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">
        Errors:
      </h4>
      <div className="space-y-1">
        {errors.map((error, index) => (
          <div
            key={index}
            className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-2 rounded"
          >
            {error}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TestWarningsProps {
  readonly warnings: string[];
}

function TestWarnings({ warnings }: TestWarningsProps) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-yellow-600 dark:text-yellow-400">
        Warnings:
      </h4>
      <div className="space-y-1">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900 p-2 rounded"
          >
            {warning}
          </div>
        ))}
      </div>
    </div>
  );
}

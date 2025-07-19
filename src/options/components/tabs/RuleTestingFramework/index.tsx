import { useState, useEffect } from 'preact/hooks';

import {
  RuleTestingFramework,
  type TestContext,
  type RuleConflict,
  type PerformanceAnalysis,
  type AutomatedTestResult,
} from '@/lib/api';
import { Icon, IconName } from '@/shared/components/Icon';
import { TabDescription } from '@/shared/components/TabDescription';
import type { HeaderRule, RuleTestResult } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

import { AutomatedTestsTab } from './AutomatedTestsTab';
import { ConflictDetectionTab } from './ConflictDetectionTab';
import { PerformanceAnalysisTab } from './PerformanceAnalysisTab';
import { SingleRuleTestTab } from './SingleRuleTestTab';

interface RuleTestingFrameworkProps {
  readonly rules: HeaderRule[];
}

// Get logger for this module
const logger = loggers.shared;

const NAVIGATION_TABS: Array<{ id: string; label: string; icon: IconName }> = [
  { id: 'single', label: 'Single Rule Test', icon: 'flask-conical' },
  {
    id: 'conflicts',
    label: 'Conflict Detection',
    icon: 'alert-triangle',
  },
  {
    id: 'performance',
    label: 'Performance Analysis',
    icon: 'bar-chart',
  },
  { id: 'automated', label: 'Automated Tests', icon: 'bot' },
];

// Custom Hooks
function useRuleSelection(rules: HeaderRule[]) {
  const [selectedRule, setSelectedRule] = useState<HeaderRule | null>(null);

  const handleRuleSelection = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    setSelectedRule(rule || null);
  };

  return {
    selectedRule,
    setSelectedRule,
    handleRuleSelection,
  };
}

function useTestContext() {
  const [testContext, setTestContext] = useState<TestContext>({
    url: 'https://api.example.com/users',
    requestMethod: 'GET',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    responseStatus: 200,
    requestHeaders: {},
    cookies: {},
  });

  const addTestHeader = () => {
    const headerName = prompt('Header name:');
    const headerValue = prompt('Header value:');
    if (headerName && headerValue) {
      setTestContext(prev => ({
        ...prev,
        requestHeaders: {
          ...prev.requestHeaders,
          [headerName.toLowerCase()]: headerValue,
        },
      }));
    }
  };

  const removeTestHeader = (headerName: string) => {
    setTestContext(prev => {
      const headers = { ...prev.requestHeaders };
      delete headers[headerName];
      return { ...prev, requestHeaders: headers };
    });
  };

  const addTestCookie = () => {
    const cookieName = prompt('Cookie name:');
    const cookieValue = prompt('Cookie value:');
    if (cookieName && cookieValue) {
      setTestContext(prev => ({
        ...prev,
        cookies: {
          ...prev.cookies,
          [cookieName]: cookieValue,
        },
      }));
    }
  };

  const removeTestCookie = (cookieName: string) => {
    setTestContext(prev => {
      const cookies = { ...prev.cookies };
      delete cookies[cookieName];
      return { ...prev, cookies };
    });
  };

  return {
    testContext,
    setTestContext,
    addTestHeader,
    removeTestHeader,
    addTestCookie,
    removeTestCookie,
  };
}

function useRuleTesting(rules: HeaderRule[]) {
  const [testResult, setTestResult] = useState<RuleTestResult | null>(null);
  const [automatedTestResult, setAutomatedTestResult] =
    useState<AutomatedTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestSingleRule = async (
    selectedRule: HeaderRule | null,
    testContext: TestContext
  ) => {
    if (!selectedRule) return;

    setLoading(true);
    try {
      const result = await RuleTestingFramework.testRule(
        selectedRule,
        testContext
      );
      setTestResult(result);
    } catch (error) {
      logger.error('Failed to test rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutomatedTests = async (selectedRule: HeaderRule | null) => {
    if (!selectedRule) return;

    setLoading(true);
    try {
      const result = await RuleTestingFramework.runAutomatedTests(selectedRule);
      setAutomatedTestResult(result);
    } catch (error) {
      logger.error('Failed to run automated tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAllRules = async (testContext: TestContext) => {
    setLoading(true);
    try {
      const results = await RuleTestingFramework.testMultipleRules(
        rules,
        testContext
      );
      logger.info('All rules test results:', results);
      // You could store these results in state if needed
    } catch (error) {
      logger.error('Failed to test all rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    testResult,
    setTestResult,
    automatedTestResult,
    setAutomatedTestResult,
    loading,
    handleTestSingleRule,
    handleRunAutomatedTests,
    handleTestAllRules,
  };
}

function useConflictAnalysis(rules: HeaderRule[]) {
  const [conflicts, setConflicts] = useState<RuleConflict[]>([]);
  const [performanceAnalysis, setPerformanceAnalysis] =
    useState<PerformanceAnalysis | null>(null);

  useEffect(() => {
    // Analyze conflicts and performance when rules change
    if (rules.length > 0) {
      const ruleConflicts = RuleTestingFramework.detectRuleConflicts(rules);
      setConflicts(ruleConflicts);

      const perfAnalysis = RuleTestingFramework.analyzePerformanceImpact(rules);
      setPerformanceAnalysis(perfAnalysis);
    }
  }, [rules]);

  return {
    conflicts,
    performanceAnalysis,
  };
}

// Main Component
export function RuleTestingFrameworkComponent({
  rules,
}: RuleTestingFrameworkProps) {
  const [activeTab, setActiveTab] = useState<
    'single' | 'conflicts' | 'performance' | 'automated'
  >('single');

  const { selectedRule, handleRuleSelection } = useRuleSelection(rules);
  const {
    testContext,
    setTestContext,
    addTestHeader,
    removeTestHeader,
    addTestCookie,
    removeTestCookie,
  } = useTestContext();
  const {
    testResult,
    setTestResult,
    automatedTestResult,
    setAutomatedTestResult,
    loading,
    handleTestSingleRule,
    handleRunAutomatedTests,
    handleTestAllRules,
  } = useRuleTesting(rules);
  const { conflicts, performanceAnalysis } = useConflictAnalysis(rules);

  return (
    <div className="p-6">
      <TabDescription
        title="Rule Testing"
        description="Comprehensive testing framework for validating rules, detecting conflicts, and analyzing performance. Test individual rules, run automated test suites, and identify potential issues before deploying rules to production."
        icon="test-tube"
        features={[
          'Single rule testing with custom contexts',
          'Automated conflict detection between rules',
          'Performance impact analysis',
          'Comprehensive automated test suites',
          'Rule validation and debugging tools',
        ]}
        useCases={[
          'Validate rules before enabling them',
          'Debug rule matching issues',
          'Identify conflicting header modifications',
          'Analyze performance impact of rule sets',
          'Run regression tests on rule changes',
        ]}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-8">
          {NAVIGATION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'single' | 'conflicts' | 'performance' | 'automated'
                )
              }
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon name={tab.icon satisfies IconName} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'single' && (
        <SingleRuleTestTab
          rules={rules}
          selectedRule={selectedRule}
          testContext={testContext}
          testResult={testResult}
          loading={loading}
          onRuleSelection={handleRuleSelection}
          onTestContextChange={setTestContext}
          onTestSingleRule={() =>
            handleTestSingleRule(selectedRule, testContext)
          }
          onTestAllRules={() => handleTestAllRules(testContext)}
          onTestResultClear={() => setTestResult(null)}
          onAddTestHeader={addTestHeader}
          onRemoveTestHeader={removeTestHeader}
          onAddTestCookie={addTestCookie}
          onRemoveTestCookie={removeTestCookie}
        />
      )}

      {activeTab === 'conflicts' && (
        <ConflictDetectionTab conflicts={conflicts} />
      )}

      {activeTab === 'performance' && (
        <PerformanceAnalysisTab performanceAnalysis={performanceAnalysis} />
      )}

      {activeTab === 'automated' && (
        <AutomatedTestsTab
          rules={rules}
          selectedRule={selectedRule}
          automatedTestResult={automatedTestResult}
          loading={loading}
          onRuleSelection={handleRuleSelection}
          onRunAutomatedTests={() => handleRunAutomatedTests(selectedRule)}
          onTestResultClear={() => setAutomatedTestResult(null)}
        />
      )}
    </div>
  );
}

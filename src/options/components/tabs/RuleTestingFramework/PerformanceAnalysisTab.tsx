import type { PerformanceAnalysis } from '@/lib/api';

import { getPerformanceImpactColor } from './utils';

interface PerformanceAnalysisTabProps {
  performanceAnalysis: PerformanceAnalysis | null;
}

export function PerformanceAnalysisTab({
  performanceAnalysis,
}: PerformanceAnalysisTabProps) {
  if (!performanceAnalysis) {
    return <NoPerformanceDataState />;
  }

  return (
    <div>
      <PerformanceAnalysisHeader />
      <PerformanceMetrics performanceAnalysis={performanceAnalysis} />
      <PerformanceImpactSummary performanceAnalysis={performanceAnalysis} />
    </div>
  );
}

function NoPerformanceDataState() {
  return (
    <div className="flex flex-col items-center py-12">
      <div className="text-gray-400 mb-4">📊</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No Performance Data Available
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Performance analysis will appear here once rules are loaded
      </p>
    </div>
  );
}

function PerformanceAnalysisHeader() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">Performance Analysis</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Analysis of rule performance impact and optimization recommendations
      </p>
    </div>
  );
}

interface PerformanceMetricsProps {
  performanceAnalysis: PerformanceAnalysis;
}

function PerformanceMetrics({ performanceAnalysis }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Total Rules"
        value={performanceAnalysis.totalRules}
        color="text-gray-900 dark:text-white"
      />
      <MetricCard
        title="Enabled Rules"
        value={performanceAnalysis.enabledRules}
        color="text-green-600 dark:text-green-400"
      />
      <MetricCard
        title="Conditional Rules"
        value={performanceAnalysis.conditionalRules}
        color="text-blue-600 dark:text-blue-400"
      />
      <MetricCard
        title="Regex Patterns"
        value={performanceAnalysis.regexPatterns}
        color="text-orange-600 dark:text-orange-400"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
}

function MetricCard({ title, value, color }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

interface PerformanceImpactSummaryProps {
  performanceAnalysis: PerformanceAnalysis;
}

function PerformanceImpactSummary({
  performanceAnalysis,
}: PerformanceImpactSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-6">
      <PerformanceImpactHeader performanceAnalysis={performanceAnalysis} />

      {performanceAnalysis.recommendations.length > 0 && (
        <PerformanceRecommendations
          recommendations={performanceAnalysis.recommendations}
        />
      )}
    </div>
  );
}

interface PerformanceImpactHeaderProps {
  performanceAnalysis: PerformanceAnalysis;
}

function PerformanceImpactHeader({
  performanceAnalysis,
}: PerformanceImpactHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium">Performance Impact</h4>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceImpactColor(performanceAnalysis.estimatedImpact)}`}
      >
        {performanceAnalysis.estimatedImpact.toUpperCase()}
      </span>
    </div>
  );
}

interface PerformanceRecommendationsProps {
  recommendations: string[];
}

function PerformanceRecommendations({
  recommendations,
}: PerformanceRecommendationsProps) {
  return (
    <div>
      <h5 className="font-medium mb-2">Recommendations:</h5>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
        {recommendations.map((recommendation, index) => (
          <li key={index}>{recommendation}</li>
        ))}
      </ul>
    </div>
  );
}

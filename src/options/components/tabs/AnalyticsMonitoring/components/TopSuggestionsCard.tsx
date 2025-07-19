import type { OptimizationSuggestion } from '@/lib/integrations/analytics-monitor';

import { getPriorityEmoji } from '../utils/analyticsFormatting';

interface TopSuggestionsCardProps {
  suggestions: OptimizationSuggestion[];
}

export function TopSuggestionsCard({ suggestions }: TopSuggestionsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Top Optimization Suggestions
      </h3>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <span className="text-lg">
              {getPriorityEmoji(suggestion.priority)}💡
            </span>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {suggestion.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {suggestion.description}
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded">
              {suggestion.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

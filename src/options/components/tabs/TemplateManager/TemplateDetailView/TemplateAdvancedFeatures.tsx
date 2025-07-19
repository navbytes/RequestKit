import type { RuleTemplate } from '@/shared/types/templates';

interface TemplateAdvancedFeaturesProps {
  template: RuleTemplate;
}

export function TemplateAdvancedFeatures({
  template,
}: Readonly<TemplateAdvancedFeaturesProps>) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Advanced Features
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {template.schedule && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Schedule
            </h4>
            <p className="text-sm text-gray-900 dark:text-white">
              {template.schedule.enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        )}
        {template.limits && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Rate Limits
            </h4>
            <div className="text-sm text-gray-900 dark:text-white space-y-1">
              {template.limits.maxMatches && (
                <p>Max matches: {template.limits.maxMatches}</p>
              )}
              {template.limits.maxMatchesPerHour && (
                <p>Per hour: {template.limits.maxMatchesPerHour}</p>
              )}
            </div>
          </div>
        )}
        {template.resourceTypes && template.resourceTypes.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Resource Types
            </h4>
            <div className="flex flex-wrap gap-1">
              {template.resourceTypes.map(type => (
                <span key={type} className="badge badge-xs badge-outline">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
